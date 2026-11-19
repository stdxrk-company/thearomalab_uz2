import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { getProduct, volumePrice, type Product, type Volume } from '../lib/catalog'
import { DELIVERY } from '../config'

export interface CartLine {
  productId: string
  ml: number
  qty: number
}

export interface ResolvedLine extends CartLine {
  key: string
  product: Product
  volume: Volume
  unitPrice: number
  total: number
}

type Action =
  | { type: 'add'; productId: string; ml: number; qty: number }
  | { type: 'setQty'; productId: string; ml: number; qty: number }
  | { type: 'setVolume'; productId: string; fromMl: number; toMl: number }
  | { type: 'remove'; productId: string; ml: number }
  | { type: 'clear' }

const STORAGE_KEY = 'aromalab.cart.v1'
const MAX_QTY = 20

const same = (l: CartLine, productId: string, ml: number) => l.productId === productId && l.ml === ml
const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n)))

function reducer(state: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case 'add': {
      const existing = state.find((l) => same(l, a.productId, a.ml))
      if (existing) {
        return state.map((l) => (l === existing ? { ...l, qty: clampQty(l.qty + a.qty) } : l))
      }
      return [...state, { productId: a.productId, ml: a.ml, qty: clampQty(a.qty) }]
    }
    case 'setQty':
      return state.map((l) => (same(l, a.productId, a.ml) ? { ...l, qty: clampQty(a.qty) } : l))
    case 'setVolume': {
      const moving = state.find((l) => same(l, a.productId, a.fromMl))
      if (!moving || a.fromMl === a.toMl) return state
      const target = state.find((l) => same(l, a.productId, a.toMl))
      const rest = state.filter((l) => l !== moving && l !== target)
      const merged = { ...moving, ml: a.toMl, qty: clampQty(moving.qty + (target?.qty ?? 0)) }
      const idx = state.indexOf(moving)
      rest.splice(Math.min(idx, rest.length), 0, merged)
      return rest
    }
    case 'remove':
      return state.filter((l) => !same(l, a.productId, a.ml))
    case 'clear':
      return []
  }
}

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    // drop lines whose product or volume no longer exists in the catalog
    return parsed.filter((l) => getProduct(l.productId)?.volumes.some((v) => v.ml === l.ml) && l.qty > 0)
  } catch {
    return []
  }
}

interface CartContextValue {
  lines: ResolvedLine[]
  bottles: number
  total: number
  freeDeliveryBottles: number
  bottlesToFreeDelivery: number
  add: (productId: string, ml: number, qty?: number) => void
  setQty: (productId: string, ml: number, qty: number) => void
  setVolume: (productId: string, fromMl: number, toMl: number) => void
  remove: (productId: string, ml: number) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
  lastAdded: { id: number; productId: string } | null
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [isOpen, setOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<CartContextValue['lastAdded']>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable (private mode) — cart still works for this visit */
    }
  }, [state])

  const lines = useMemo<ResolvedLine[]>(
    () =>
      state.flatMap((l) => {
        const product = getProduct(l.productId)
        const volume = product?.volumes.find((v) => v.ml === l.ml)
        if (!product || !volume) return []
        const unitPrice = volumePrice(volume)
        return [{ ...l, key: `${l.productId}:${l.ml}`, product, volume, unitPrice, total: unitPrice * l.qty }]
      }),
    [state],
  )

  const bottles = lines.reduce((s, l) => s + l.qty, 0)
  const total = lines.reduce((s, l) => s + l.total, 0)
  const freeDeliveryBottles = lines
    .filter((l) => l.ml >= DELIVERY.freeMinBottleMl)
    .reduce((s, l) => s + l.qty, 0)
  const bottlesToFreeDelivery = Math.max(0, DELIVERY.freeFromBottles - freeDeliveryBottles)

  const add = useCallback((productId: string, ml: number, qty = 1) => {
    dispatch({ type: 'add', productId, ml, qty })
    setLastAdded({ id: Date.now(), productId })
  }, [])
  const setQty = useCallback((productId: string, ml: number, qty: number) => dispatch({ type: 'setQty', productId, ml, qty }), [])
  const setVolume = useCallback(
    (productId: string, fromMl: number, toMl: number) => dispatch({ type: 'setVolume', productId, fromMl, toMl }),
    [],
  )
  const remove = useCallback((productId: string, ml: number) => dispatch({ type: 'remove', productId, ml }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])

  const value: CartContextValue = {
    lines,
    bottles,
    total,
    freeDeliveryBottles,
    bottlesToFreeDelivery,
    add,
    setQty,
    setVolume,
    remove,
    clear,
    isOpen,
    open,
    close,
    lastAdded,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

export { MAX_QTY }
