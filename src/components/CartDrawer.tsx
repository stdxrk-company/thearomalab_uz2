import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DELIVERY, MERCH } from '../config'
import { useI18n } from '../i18n'
import { formatNum, minPrice, pickProducts } from '../lib/catalog'
import { buildOrderMessage, copyText, telegramLink } from '../lib/order'
import { useCart } from '../store/cart'
import { FreeDelivery } from './FreeDelivery'
import { CheckIcon, CloseIcon, PlusIcon, TelegramIcon } from './Icons'
import { QtyStepper } from './QtyStepper'
import s from './CartDrawer.module.css'

type Stage = 'cart' | 'sent'

export function CartDrawer() {
  const cart = useCart()
  const { isOpen, close, lines, bottles, total, bottlesToFreeDelivery } = cart
  const { t, lang, sum } = useI18n()
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('cart')
  const [locked, setLocked] = useState(false)
  const [copied, setCopied] = useState(false)

  const message = useMemo(() => buildOrderMessage(lines, lang), [lines, lang])
  const orderHref = telegramLink(message)

  // suggestions for the 4th bottle: the cheapest of the hits and new arrivals that are not in the cart yet
  const upsell = useMemo(() => {
    if (bottlesToFreeDelivery === 0) return []
    const inCart = new Set(lines.map((l) => l.productId))
    const seen = new Set<string>()
    return pickProducts([...MERCH.hitIds, ...MERCH.newIds])
      .filter((p) => !inCart.has(p.id) && !seen.has(p.id) && seen.add(p.id))
      .sort((a, b) => minPrice(a) - minPrice(b))
      .slice(0, 3)
  }, [lines, bottlesToFreeDelivery])

  // Esc to close, lock page scroll, move focus into the panel
  useEffect(() => {
    if (!isOpen) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      prev?.focus?.()
    }
  }, [isOpen, close])

  // return to the cart view each time the drawer is reopened
  useEffect(() => {
    if (isOpen) {
      setStage('cart')
      setCopied(false)
    }
  }, [isOpen])

  const onTelegram = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (locked || lines.length === 0) {
      e.preventDefault()
      return
    }
    // guard against double taps that would open several Telegram windows
    setLocked(true)
    setTimeout(() => setLocked(false), 2500)
    void copyText(message) // fallback if the Telegram client ignores the pre-filled text
    setStage('sent')
  }

  const onCheckout = () => {
    close()
    navigate('/checkout')
  }

  const onCopy = async () => {
    setCopied(await copyText(message))
  }

  const onFinish = () => {
    cart.clear()
    close()
  }

  return (
    <div className={`${s.root} ${isOpen ? s.open : ''}`} aria-hidden={!isOpen} inert={!isOpen}>
      <div className={s.backdrop} onClick={close} />
      <div ref={panelRef} className={`glass ${s.panel}`} role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1}>
        <div className={s.head}>
          <h2 id="cart-title" className={s.title}>
            {stage === 'sent' ? t.cart.almostDone : t.cart.title}
            {stage === 'cart' && bottles > 0 && <span className={s.count}>{t.bottles(bottles)}</span>}
          </h2>
          <button type="button" className={`glass icon-btn ${s.close}`} onClick={close} aria-label={t.cart.close}>
            <CloseIcon />
          </button>
        </div>

        {stage === 'sent' ? (
          <div className={s.sent}>
            <div className={s.sentIcon}>
              <TelegramIcon width={26} height={26} />
            </div>
            <p className={s.sentLead}>{t.cart.sentLead}</p>
            <p className={s.sentText}>{t.cart.sentText}</p>
            <details className={s.preview}>
              <summary>{t.cart.orderText}</summary>
              <pre>{message}</pre>
            </details>
            <div className={s.sentActions}>
              <a className="btn btn-primary btn-block" href={orderHref} target="_blank" rel="noopener noreferrer">
                <TelegramIcon /> {t.cart.reopen}
              </a>
              <button type="button" className="btn btn-secondary btn-block" onClick={onCopy}>
                {copied ? (
                  <>
                    <CheckIcon /> {t.cart.copied}
                  </>
                ) : (
                  t.cart.copy
                )}
              </button>
              <button type="button" className={s.textBtn} onClick={onFinish}>
                {t.cart.finish}
              </button>
              <button type="button" className={s.textBtn} onClick={() => setStage('cart')}>
                {t.cart.back}
              </button>
            </div>
          </div>
        ) : lines.length === 0 ? (
          <div className={s.empty}>
            <p className={`serif-name ${s.emptyTitle}`}>{t.cart.emptyTitle}</p>
            <p className={s.emptyText}>{t.cart.emptyText(DELIVERY.freeFromBottles)}</p>
            <Link to="/catalog" className="btn btn-primary" onClick={close}>
              {t.cart.toCatalog}
            </Link>
          </div>
        ) : (
          <>
            <div className={s.scroll}>
              <FreeDelivery />

              <ul className={s.list}>
                {lines.map((l) => (
                  <li key={l.key} className={s.line}>
                    <Link to={`/perfume/${l.productId}`} onClick={close} className={s.thumb}>
                      <img src={l.product.thumb} alt="" width={76} height={96} loading="lazy" />
                    </Link>
                    <div className={s.info}>
                      <div className={s.lineHead}>
                        <div className={s.names}>
                          <p className="brand-label">{l.product.brand}</p>
                          <Link to={`/perfume/${l.productId}`} onClick={close} className={`serif-name ${s.name}`}>
                            {l.product.name}
                          </Link>
                        </div>
                        <button
                          type="button"
                          className={s.remove}
                          onClick={() => cart.remove(l.productId, l.ml)}
                          aria-label={t.cart.remove(l.product.name)}
                        >
                          <CloseIcon width={15} height={15} />
                        </button>
                      </div>
                      {l.product.volumes.length > 1 ? (
                        <div className={s.volumes} role="radiogroup" aria-label={t.cart.volume}>
                          {l.product.volumes.map((v) => (
                            <button
                              key={v.ml}
                              type="button"
                              role="radio"
                              aria-checked={v.ml === l.ml}
                              className={`${s.vol} ${v.ml === l.ml ? s.volOn : ''}`}
                              onClick={() => cart.setVolume(l.productId, l.ml, v.ml)}
                            >
                              {v.ml} {t.ml}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className={s.meta}>
                          {l.ml} {t.ml} · <span className="price">{sum(l.unitPrice)}</span>
                        </p>
                      )}
                      <div className={s.lineFoot}>
                        <QtyStepper size="sm" value={l.qty} onChange={(n) => cart.setQty(l.productId, l.ml, n)} />
                        <span className={`price ${s.lineTotal}`}>{sum(l.total)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {upsell.length > 0 && (
                <section className={s.upsell} aria-labelledby="upsell-title">
                  <p id="upsell-title" className={s.upsellTitle}>
                    {t.cart.upsell(bottlesToFreeDelivery)}
                  </p>
                  <div className={s.upsellGrid}>
                    {upsell.map((p) => (
                      <div key={p.id} className={s.upItem}>
                        <Link to={`/perfume/${p.id}`} onClick={close} className={s.upPhoto}>
                          <img src={p.thumb} alt="" loading="lazy" width={140} height={180} />
                        </Link>
                        <span className={s.upName}>{p.brand} {p.name}</span>
                        <button type="button" className={`glass ${s.upAdd}`} onClick={() => cart.add(p.id, p.volumes[0].ml)}>
                          <PlusIcon width={14} height={14} /> <span className="price">{formatNum(minPrice(p))}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className={s.foot}>
              <div className={s.deliveryRow}>
                <span>{t.cart.deliveryTashkent}</span>
                <span>{bottlesToFreeDelivery === 0 ? t.cart.free : t.cart.yandexRate}</span>
              </div>
              <div className={s.totalRow}>
                <span>{t.cart.total}</span>
                <span className="price">{sum(total)}</span>
              </div>
              <button type="button" className="btn btn-primary btn-block" onClick={onCheckout}>
                {t.cart.checkout}
              </button>
              <a
                className={s.tgLink}
                href={orderHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onTelegram}
                aria-disabled={locked}
              >
                {t.cart.orTelegram}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
