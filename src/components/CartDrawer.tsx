import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatSum } from '../lib/catalog'
import { buildOrderMessage, copyText, telegramLink } from '../lib/order'
import { BOTTLE, plural } from '../lib/plural'
import { useCart } from '../store/cart'
import { FreeDelivery } from './FreeDelivery'
import { CheckIcon, CloseIcon, TelegramIcon, TrashIcon } from './Icons'
import { QtyStepper } from './QtyStepper'
import s from './CartDrawer.module.css'

type Stage = 'cart' | 'sent'

export function CartDrawer() {
  const cart = useCart()
  const { isOpen, close, lines, bottles, total } = cart
  const panelRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Stage>('cart')
  const [locked, setLocked] = useState(false)
  const [copied, setCopied] = useState(false)

  const message = useMemo(() => buildOrderMessage(lines), [lines])
  const orderHref = telegramLink(message)

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

  const onOrder = (e: React.MouseEvent<HTMLAnchorElement>) => {
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

  const onCopy = async () => {
    setCopied(await copyText(message))
  }

  const onFinish = () => {
    cart.clear()
    close()
  }

  return (
    <div className={`${s.root} ${isOpen ? s.open : ''}`} aria-hidden={!isOpen}>
      <div className={s.backdrop} onClick={close} />
      <div
        ref={panelRef}
        className={s.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
      >
        <div className={s.head}>
          <h2 id="cart-title" className={s.title}>
            {stage === 'sent' ? 'Почти готово' : 'Корзина'}
            {stage === 'cart' && bottles > 0 && (
              <span className={s.count}>
                {bottles} {plural(bottles, BOTTLE)}
              </span>
            )}
          </h2>
          <button type="button" className={s.close} onClick={close} aria-label="Закрыть корзину">
            <CloseIcon />
          </button>
        </div>

        {stage === 'sent' ? (
          <div className={s.sent}>
            <div className={s.sentIcon}>
              <TelegramIcon width={28} height={28} />
            </div>
            <p className={s.sentLead}>Заказ сформирован и открыт в Telegram</p>
            <p className={s.sentText}>
              Нажмите «Отправить» в чате — мы подтвердим наличие, стоимость доставки и способ оплаты.
            </p>
            <ol className={s.steps}>
              <li>Отправьте сообщение в Telegram</li>
              <li>Дождитесь подтверждения заказа</li>
              <li>Получите ароматы курьером или через BTS</li>
            </ol>

            <details className={s.preview}>
              <summary>Текст заказа</summary>
              <pre>{message}</pre>
            </details>

            <div className={s.sentActions}>
              <a className="btn btn-primary btn-block" href={orderHref} target="_blank" rel="noopener noreferrer">
                <TelegramIcon /> Открыть Telegram ещё раз
              </a>
              <button type="button" className="btn btn-secondary btn-block" onClick={onCopy}>
                {copied ? (
                  <>
                    <CheckIcon /> Текст скопирован
                  </>
                ) : (
                  'Скопировать текст заказа'
                )}
              </button>
              <button type="button" className={s.textBtn} onClick={onFinish}>
                Заказ отправлен — очистить корзину
              </button>
              <button type="button" className={s.textBtn} onClick={() => setStage('cart')}>
                Вернуться к корзине
              </button>
            </div>
          </div>
        ) : lines.length === 0 ? (
          <div className={s.empty}>
            <p className={s.emptyTitle}>Корзина пока пуста</p>
            <p className={s.emptyText}>Соберите свой набор — от 4 флаконов доставка по Ташкенту бесплатная.</p>
            <Link to="/catalog" className="btn btn-primary" onClick={close}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <>
            <ul className={s.list}>
              {lines.map((l) => (
                <li key={l.key} className={s.line}>
                  <Link to={`/perfume/${l.productId}`} onClick={close} className={s.thumb}>
                    <img src={l.product.thumb} alt="" width={72} height={96} loading="lazy" />
                  </Link>
                  <div className={s.info}>
                    <p className={s.brand}>{l.product.brand}</p>
                    <Link to={`/perfume/${l.productId}`} onClick={close} className={s.name}>
                      {l.product.name}
                    </Link>
                    {l.product.volumes.length > 1 ? (
                      <div className={s.volumes} role="radiogroup" aria-label="Объём">
                        {l.product.volumes.map((v) => (
                          <button
                            key={v.ml}
                            type="button"
                            role="radio"
                            aria-checked={v.ml === l.ml}
                            className={`${s.vol} ${v.ml === l.ml ? s.volOn : ''}`}
                            onClick={() => cart.setVolume(l.productId, l.ml, v.ml)}
                          >
                            {v.ml} мл
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className={s.meta}>
                        {l.ml} мл · <span className="price">{formatSum(l.unitPrice)}</span>
                      </p>
                    )}
                    <div className={s.lineFoot}>
                      <QtyStepper size="sm" value={l.qty} onChange={(n) => cart.setQty(l.productId, l.ml, n)} />
                      <span className={`price ${s.lineTotal}`}>{formatSum(l.total)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={s.remove}
                    onClick={() => cart.remove(l.productId, l.ml)}
                    aria-label={`Удалить ${l.product.name}`}
                  >
                    <TrashIcon width={18} height={18} />
                  </button>
                </li>
              ))}
            </ul>

            <div className={s.foot}>
              <FreeDelivery />
              <div className={s.totalRow}>
                <span>Итого</span>
                <span className="price">{formatSum(total)}</span>
              </div>
              <p className={s.note}>
                Без доставки. Доставку по Ташкенту (Yandex) или в регионы (BTS) и оплату согласуем в Telegram.
              </p>
              <a
                className={`btn btn-primary btn-block ${s.orderBtn}`}
                href={orderHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onOrder}
                aria-disabled={locked}
              >
                <TelegramIcon /> Заказать в Telegram
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
