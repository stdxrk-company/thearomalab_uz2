import raw from '../data/products.json'
import { PRICING } from '../config'

export type Gender = 'men' | 'women' | 'unisex'

export interface Volume {
  ml: number
  priceUsd: number
}

/** Notes as printed on the supplier's photo: a pyramid, or a plain list in `main`. */
export interface Notes {
  top?: string[]
  heart?: string[]
  base?: string[]
  main?: string[]
}

export const NOTE_TIERS: { key: keyof Notes; label: string }[] = [
  { key: 'top', label: 'Верхние ноты' },
  { key: 'heart', label: 'Ноты сердца' },
  { key: 'base', label: 'Базовые ноты' },
  { key: 'main', label: 'Основные ноты' },
]

export interface Product {
  id: string
  brand: string
  name: string
  gender: Gender
  image: string
  thumb: string
  inStock: boolean
  volumes: Volume[]
  order: number
  notes?: Notes
}

export const products: Product[] = (raw as Product[]).slice().sort((a, b) => a.order - b.order)

const byId = new Map(products.map((p) => [p.id, p]))

export function getProduct(id: string): Product | undefined {
  return byId.get(id)
}

export const GENDER_LABEL: Record<Gender, string> = {
  men: 'Мужской',
  women: 'Женский',
  unisex: 'Унисекс',
}

export const GENDER_FILTER_LABEL: Record<Gender, string> = {
  men: 'Мужские',
  women: 'Женские',
  unisex: 'Унисекс',
}

export function toUzs(usd: number): number {
  const exact = usd * PRICING.usdRate
  return Math.ceil(exact / PRICING.roundTo) * PRICING.roundTo
}

const nf = new Intl.NumberFormat('ru-RU')

export function formatSum(uzs: number): string {
  // ru-RU uses a narrow no-break space as the thousands separator
  return `${nf.format(uzs)} сум`
}

export function volumePrice(v: Volume): number {
  return toUzs(v.priceUsd)
}

export function minPrice(p: Product): number {
  return Math.min(...p.volumes.map(volumePrice))
}

export function fullName(p: Product): string {
  return `${p.brand} ${p.name}`
}

export const brands: { name: string; count: number }[] = (() => {
  const m = new Map<string, number>()
  for (const p of products) m.set(p.brand, (m.get(p.brand) ?? 0) + 1)
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})()

/** Distinct 10 ml price points, ascending — used as price filter options. */
export const priceTiers: number[] = [...new Set(products.map(minPrice))].sort((a, b) => a - b)

export function countBy(gender: Gender): number {
  return products.filter((p) => p.gender === gender).length
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9а-яё]+/g, ' ')
    .trim()
}

/** All notes of a product, without duplicates, in pyramid order. */
export function allNotes(p: Product): string[] {
  if (!p.notes) return []
  const { top = [], heart = [], base = [], main = [] } = p.notes
  return [...new Set([...top, ...heart, ...base, ...main])]
}

/** Short preview for cards: one note from each tier, or the first three of a plain list. */
export function keyNotes(p: Product, n = 3): string[] {
  if (!p.notes) return []
  const { top, heart, base, main } = p.notes
  const picked = main?.length ? main.slice(0, n) : [top?.[0], heart?.[0], base?.[0]].filter(Boolean)
  return (picked as string[]).slice(0, n)
}

/** Other products ranked by how many notes they share with `p` (at least `min`). */
export function similarByNotes(p: Product, limit = 8, min = 2): Product[] {
  const mine = new Set(allNotes(p).map((n) => n.toLowerCase()))
  if (mine.size === 0) return []
  return products
    .filter((o) => o.id !== p.id)
    .map((o) => ({ o, score: allNotes(o).filter((n) => mine.has(n.toLowerCase())).length }))
    .filter((x) => x.score >= min)
    .sort((a, b) => b.score - a.score || a.o.order - b.o.order)
    .slice(0, limit)
    .map((x) => x.o)
}

const searchIndex = new Map(
  products.map((p) => [p.id, norm(`${p.brand} ${p.name} ${allNotes(p).join(' ')}`).split(' ')]),
)

/** Every query word must be the start of some word in the brand, name or notes ("уд" finds Уд, not Амбервуд). */
export function matchesQuery(p: Product, query: string): boolean {
  const q = norm(query)
  if (!q) return true
  const words = searchIndex.get(p.id) ?? []
  return q.split(' ').every((w) => words.some((h) => h.startsWith(w)))
}
