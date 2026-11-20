import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { isNew, keyNotes, minPrice, type Product } from '../lib/catalog'
import { useCart } from '../store/cart'
import { CheckIcon, PlusIcon } from './Icons'
import s from './ProductCard.module.css'

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add, lines } = useCart()
  const { t, sum, note } = useI18n()
  const [justAdded, setJustAdded] = useState(false)
  const single = product.volumes.length === 1
  const inCart = lines.some((l) => l.productId === product.id)
  const href = `/perfume/${product.id}`
  const notes = keyNotes(product).map(note)

  const quickAdd = () => {
    add(product.id, product.volumes[0].ml)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <article className={s.card}>
      <div className={s.media}>
        <Link to={href} className={s.photo} aria-label={`${product.brand} ${product.name}`}>
          <img
            src={product.thumb}
            alt={t.card.photoAlt(`${product.brand} ${product.name}`)}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            width={560}
            height={746}
          />
        </Link>
        {isNew(product) && <span className={`glass ${s.tag}`}>{t.card.newTag}</span>}

        <div className={`glass ${s.bar}`}>
          <span className={s.price}>
            {!single && t.card.from && <span className={s.from}>{t.card.from}</span>}
            <span className="price">{sum(minPrice(product))}</span>
          </span>
          {single ? (
            <button
              type="button"
              className={`round-add ${justAdded || inCart ? 'is-added' : ''}`}
              onClick={quickAdd}
              aria-label={inCart ? t.card.addMore(product.name) : t.card.add(product.name)}
              title={t.card.toCart}
            >
              {justAdded || inCart ? <CheckIcon width={18} height={18} /> : <PlusIcon width={18} height={18} />}
            </button>
          ) : (
            <Link to={href} className="round-add" aria-label={t.card.chooseVolume}>
              <PlusIcon width={18} height={18} />
            </Link>
          )}
        </div>
      </div>

      <div className={s.body}>
        <p className={`brand-label ${s.brand}`}>
          {product.brand} <span className={s.gender}>· {t.gender[product.gender].toLowerCase()}</span>
        </p>
        <h3 className={`serif-name ${s.name}`}>
          <Link to={href}>{product.name}</Link>
        </h3>
        {notes.length > 0 && <p className={s.notes}>{notes.join(' · ')}</p>}
        <p className={s.ml}>{product.volumes.map((v) => v.ml).join(' / ')} {t.ml}</p>
      </div>
    </article>
  )
}
