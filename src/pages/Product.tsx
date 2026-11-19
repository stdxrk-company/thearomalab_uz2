import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckIcon, ChevronIcon, TelegramIcon, TruckIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { QtyStepper } from '../components/QtyStepper'
import { DELIVERY } from '../config'
import {
  formatSum,
  fullName,
  GENDER_LABEL,
  getProduct,
  minPrice,
  NOTE_TIERS,
  products,
  similarByNotes,
  volumePrice,
} from '../lib/catalog'
import { productQuestionMessage, productUrl, telegramLink } from '../lib/order'
import { useTitle } from '../lib/useTitle'
import { useCart } from '../store/cart'
import { NotFoundPage } from './NotFound'
import s from './Product.module.css'

export function ProductPage() {
  const { id = '' } = useParams()
  const product = getProduct(id)
  const cart = useCart()
  const [ml, setMl] = useState(product?.volumes[0]?.ml ?? 10)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useTitle(product ? `${fullName(product)} — распив` : 'Аромат не найден')

  // reset selection when navigating between products
  useEffect(() => {
    setMl(product?.volumes[0]?.ml ?? 10)
    setQty(1)
    setAdded(false)
  }, [product])

  if (!product) return <NotFoundPage />

  const volume = product.volumes.find((v) => v.ml === ml) ?? product.volumes[0]
  const unit = volumePrice(volume)
  const inCart = cart.lines.find((l) => l.productId === product.id && l.ml === volume.ml)

  const sameBrand = products.filter((p) => p.brand === product.brand && p.id !== product.id)
  const byNotes = similarByNotes(product, 8, 3)
  const related =
    byNotes.length >= 4
      ? { title: 'Похожие по нотам', items: byNotes }
      : {
          title: sameBrand.length >= 4 ? `Ещё от ${product.brand}` : 'Вам может понравиться',
          items: (sameBrand.length >= 4
            ? sameBrand
            : [
                ...sameBrand,
                ...products.filter(
                  (p) =>
                    p.brand !== product.brand && p.gender === product.gender && minPrice(p) === minPrice(product),
                ),
              ]
          ).slice(0, 8),
        }
  const tiers = NOTE_TIERS.filter((t) => product.notes?.[t.key]?.length)

  const onAdd = () => {
    cart.add(product.id, volume.ml, qty)
    setAdded(true)
    setQty(1)
  }

  return (
    <div className={`shell ${s.page}`}>
      <nav className={s.crumbs} aria-label="Навигация">
        <Link to="/catalog">Каталог</Link>
        <ChevronIcon width={14} height={14} />
        <Link to={`/catalog?b=${encodeURIComponent(product.brand)}`}>{product.brand}</Link>
      </nav>

      <div className={s.grid}>
        <div className={s.media}>
          <img src={product.image} alt={`${fullName(product)} — оригинальный парфюм в распив`} width={900} height={1200} />
        </div>

        <div className={s.info}>
          <Link to={`/catalog?b=${encodeURIComponent(product.brand)}`} className={s.brand}>
            {product.brand}
          </Link>
          <h1 className={s.name}>{product.name}</h1>

          <div className={s.badges}>
            <span className={s.badge}>{GENDER_LABEL[product.gender]}</span>
            {product.inStock ? (
              <span className={`${s.badge} ${s.stock}`}>
                <span className={s.dot} /> В наличии
              </span>
            ) : (
              <span className={`${s.badge} ${s.out}`}>Нет в наличии</span>
            )}
          </div>

          <div className={s.block}>
            <p className={s.label}>Объём</p>
            <div className={s.volumes} role="radiogroup" aria-label="Объём">
              {product.volumes.map((v) => (
                <button
                  key={v.ml}
                  type="button"
                  role="radio"
                  aria-checked={v.ml === volume.ml}
                  className={`${s.vol} ${v.ml === volume.ml ? s.volOn : ''}`}
                  onClick={() => {
                    setMl(v.ml)
                    setAdded(false)
                  }}
                >
                  <span className={s.volMl}>{v.ml} мл</span>
                  <span className="price">{formatSum(volumePrice(v))}</span>
                </button>
              ))}
            </div>
          </div>

          <p className={s.price}>
            <span className="price">{formatSum(unit * qty)}</span>
            {qty > 1 && <span className={s.priceNote}>{qty} × {formatSum(unit)}</span>}
          </p>

          <div className={s.buy}>
            <QtyStepper value={qty} onChange={setQty} />
            <button type="button" className={`btn btn-primary ${s.addBtn}`} onClick={onAdd} disabled={!product.inStock}>
              {added ? (
                <>
                  <CheckIcon /> Добавлено
                </>
              ) : (
                'В корзину'
              )}
            </button>
          </div>

          {inCart && (
            <button type="button" className={s.inCart} onClick={cart.open}>
              В корзине: {inCart.qty} шт. · Перейти к оформлению <ChevronIcon width={16} height={16} />
            </button>
          )}

          <a
            className={s.ask}
            href={telegramLink(productQuestionMessage(fullName(product), productUrl(product.id)))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TelegramIcon width={18} height={18} /> Задать вопрос об аромате
          </a>

          {tiers.length > 0 && (
            <section className={s.notes} aria-labelledby="notes-title">
              <h2 id="notes-title" className={s.notesTitle}>
                {tiers.length > 1 ? 'Пирамида аромата' : 'Ноты аромата'}
              </h2>
              <dl className={s.pyramid}>
                {tiers.map((t) => (
                  <div key={t.key} className={s.tier}>
                    <dt>{t.label}</dt>
                    <dd>
                      {product.notes![t.key]!.map((n) => (
                        <Link key={n} to={`/catalog?q=${encodeURIComponent(n)}`} className={s.note} title={`Ароматы с нотой «${n}»`}>
                          {n}
                        </Link>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <ul className={s.facts}>
            <li>
              <strong>Распив {volume.ml} мл</strong>
              <span>Оригинальный аромат, перелитый из полноразмерного флакона.</span>
            </li>
            <li>
              <TruckIcon width={20} height={20} />
              <span>
                По Ташкенту — Yandex, бесплатно от {DELIVERY.freeFromBottles} флаконов. В регионы — BTS.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {related.items.length > 0 && (
        <section className={s.related}>
          <h2 className={s.h2}>{related.title}</h2>
          <div className={s.rail}>
            {related.items.map((p) => (
              <div key={p.id} className={s.railItem}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
