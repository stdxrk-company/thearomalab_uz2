import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CloseIcon, SearchIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import {
  brands,
  formatSum,
  fullName,
  GENDER_FILTER_LABEL,
  matchesQuery,
  minPrice,
  priceTiers,
  products,
  type Gender,
} from '../lib/catalog'
import { AROMA, plural } from '../lib/plural'
import { useTitle } from '../lib/useTitle'
import s from './Catalog.module.css'

type Sort = 'default' | 'price-asc' | 'price-desc' | 'name'

const SORTS: { value: Sort; label: string }[] = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'name', label: 'По названию, А–Я' },
]

const GENDERS: Gender[] = ['men', 'women', 'unisex']

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)

  const g = params.get('g') as Gender | null
  const gender = g && GENDERS.includes(g) ? g : null
  const brand = params.get('b') ?? ''
  const price = Number(params.get('p')) || 0
  const sort = (params.get('sort') as Sort) || 'default'

  // the search box is local state so typing stays snappy; it syncs to the URL with a short delay
  const [query, setQuery] = useState(params.get('q') ?? '')

  useTitle(gender ? `${GENDER_FILTER_LABEL[gender]} ароматы` : 'Каталог')

  useEffect(() => {
    if (params.get('focus') === 'search') {
      searchRef.current?.focus()
      update({ focus: null })
    }
  }, [])

  // follow the URL when it changes from outside (back/forward, a note link, header links)
  const urlQuery = params.get('q') ?? ''
  useEffect(() => {
    setQuery((current) => (current === urlQuery ? current : urlQuery))
  }, [urlQuery])

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') !== query) update({ q: query || null })
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  function update(next: Record<string, string | null>) {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(next)) {
          if (v === null || v === '') p.delete(k)
          else p.set(k, v)
        }
        return p
      },
      { replace: true },
    )
  }

  const filtered = useMemo(() => {
    const list = products.filter(
      (p) =>
        (!gender || p.gender === gender) &&
        (!brand || p.brand === brand) &&
        (!price || minPrice(p) === price) &&
        matchesQuery(p, query),
    )
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => minPrice(a) - minPrice(b) || a.order - b.order)
      case 'price-desc':
        return list.sort((a, b) => minPrice(b) - minPrice(a) || a.order - b.order)
      case 'name':
        return list.sort((a, b) => fullName(a).localeCompare(fullName(b)))
      default:
        return list
    }
  }, [gender, brand, price, query, sort])

  const activeCount = [gender, brand, price, query].filter(Boolean).length
  const resetAll = () => {
    setQuery('')
    setParams({}, { replace: true })
  }

  return (
    <div className={`shell ${s.page}`}>
      <header className={s.head}>
        <div>
          <h1 className={s.h1}>{gender ? `${GENDER_FILTER_LABEL[gender]} ароматы` : 'Каталог'}</h1>
          <p className={s.count}>
            {filtered.length} {plural(filtered.length, AROMA)} · цены за 10 мл
          </p>
        </div>
      </header>

      <div className={s.toolbar}>
        <label className={s.search}>
          <SearchIcon />
          <span className="visually-hidden">Поиск по названию или бренду</span>
          <input
            ref={searchRef}
            type="search"
            inputMode="search"
            placeholder="Название, бренд или нота: ваниль, уд…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Очистить поиск" className={s.clear}>
              <CloseIcon width={16} height={16} />
            </button>
          )}
        </label>

        <div className={s.chips} role="group" aria-label="Для кого">
          <button type="button" className={`${s.chip} ${!gender ? s.on : ''}`} onClick={() => update({ g: null })}>
            Все
          </button>
          {GENDERS.map((x) => (
            <button
              key={x}
              type="button"
              className={`${s.chip} ${gender === x ? s.on : ''}`}
              onClick={() => update({ g: gender === x ? null : x })}
              aria-pressed={gender === x}
            >
              {GENDER_FILTER_LABEL[x]}
            </button>
          ))}
        </div>

        <div className={s.selects}>
          <label className={s.select}>
            <span>Бренд</span>
            <select value={brand} onChange={(e) => update({ b: e.target.value || null })}>
              <option value="">Все бренды</option>
              {brands.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} ({b.count})
                </option>
              ))}
            </select>
          </label>
          <label className={s.select}>
            <span>Цена</span>
            <select value={price || ''} onChange={(e) => update({ p: e.target.value || null })}>
              <option value="">Любая</option>
              {priceTiers.map((t) => (
                <option key={t} value={t}>
                  {formatSum(t)}
                </option>
              ))}
            </select>
          </label>
          <label className={s.select}>
            <span>Сортировка</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value === 'default' ? null : e.target.value })}>
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {activeCount > 0 && (
            <button type="button" className={s.reset} onClick={resetAll}>
              Сбросить
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className={s.grid}>
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <p className={s.emptyTitle}>Ничего не нашлось</p>
          <p>Попробуйте другое написание или сбросьте фильтры. Если аромата нет в каталоге — спросите нас в Telegram.</p>
          <button type="button" className="btn btn-secondary" onClick={resetAll}>
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  )
}
