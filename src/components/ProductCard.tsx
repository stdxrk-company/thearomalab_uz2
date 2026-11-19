import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatSum, GENDER_LABEL, keyNotes, minPrice, type Product } from '../lib/catalog'
import { useCart } from '../store/cart'
import { CheckIcon, PlusIcon } from './Icons'
import s from './ProductCard.module.css'

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add, lines } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const single = product.volumes.length === 1
  const inCart = lines.some((l) => l.productId === product.id)
  const href = `/perfume/${product.id}`
  const notes = keyNotes(product)

  const quickAdd = () => {
    add(product.id, product.volumes[0].ml)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <article className={s.card}>
      <Link to={href} className={s.media} aria-label={`${product.brand} ${product.name}`}>
        <img
          src={product.thumb}
          alt={`${product.brand} ${product.name} — распив`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={560}
          height={746}
        />
        <span className={s.tag}>{GENDER_LABEL[product.gender]}</span>
      </Link>

      <div className={s.body}>
        <p className={s.brand}>{product.brand}</p>
        <h3 className={s.name}>
          <Link to={href}>{product.name}</Link>
        </h3>
        {notes.length > 0 && <p className={s.notes}>{notes.join(' · ')}</p>}
        <div className={s.foot}>
          <p className={s.price}>
            <span className={s.ml}>{single ? `${product.volumes[0].ml} мл` : 'от'}</span>
            <span className="price">{formatSum(minPrice(product))}</span>
          </p>
          {single ? (
            <button
              type="button"
              className={`${s.add} ${justAdded || inCart ? s.added : ''}`}
              onClick={quickAdd}
              aria-label={`Добавить ${product.name} в корзину`}
              title="В корзину"
            >
              {justAdded ? <CheckIcon /> : <PlusIcon />}
            </button>
          ) : (
            <Link to={href} className={s.add} aria-label="Выбрать объём">
              <PlusIcon />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
