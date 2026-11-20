import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckIcon, TelegramIcon } from '../components/Icons'
import { CHECKOUT } from '../config'
import { useI18n } from '../i18n'
import { copyText, loadOrder, paymentName, placeName, telegramLink, type OrderSnapshot } from '../lib/order'
import { useTitle } from '../lib/useTitle'
import s from './OrderDone.module.css'

export function OrderDonePage() {
  const { t, lang, sum, loc } = useI18n()
  useTitle(t.done.title)
  const { state } = useLocation()
  const order = (state as OrderSnapshot | null) ?? loadOrder()
  const [copied, setCopied] = useState(false)

  if (!order) {
    return (
      <section className={`gold-dust ${s.page}`}>
        <div className={`shell ${s.inner}`}>
          <div className={`glass-dark ${s.card}`}>
            <h1 className={s.h1}>{t.done.noneTitle}</h1>
            <p className={s.text}>{t.done.noneText}</p>
            <Link to="/catalog" className="btn btn-light">
              {t.done.toCatalog}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const first = order.name.split(' ')[0]
  const place = placeName(order, lang)

  return (
    <section className={`gold-dust ${s.page}`}>
      <div className={`shell ${s.inner}`}>
        <div className={`glass-dark ${s.card}`}>
          <p className={`mono ${s.no}`}>{t.done.orderNo(order.orderNo)}</p>
          <h1 className={s.h1}>{t.done.thanks(first)}</h1>
          <p className={s.text}>{t.done.text(order.contact === 'call', loc(CHECKOUT.replyTime))}</p>

          <ol className={s.steps}>
            <li>
              <span className={s.stepName}>{t.done.sendName}</span>
              <span>{t.done.sendText}</span>
            </li>
            <li>
              <span className={s.stepName}>{t.done.confirmName}</span>
              <span>{t.done.confirmText}</span>
            </li>
            <li>
              <span className={s.stepName}>{t.done.deliveryName}</span>
              <span>
                {order.delivery === 'tashkent' ? t.done.courier(place) : t.done.bts(place)}
                {order.freeDelivery ? t.done.freeSuffix : ''}.
              </span>
            </li>
          </ol>

          <div className={s.actions}>
            <a className="btn btn-light" href={telegramLink(order.message)} target="_blank" rel="noopener noreferrer">
              <TelegramIcon /> {t.done.openTg}
            </a>
            <button type="button" className={`glass-dark btn ${s.ghost}`} onClick={async () => setCopied(await copyText(order.message))}>
              {copied ? (
                <>
                  <CheckIcon /> {t.done.copied}
                </>
              ) : (
                t.done.copy
              )}
            </button>
          </div>
        </div>

        <aside className={`glass-dark ${s.side}`} aria-label={t.done.composition}>
          <div className={s.thumbs}>
            {order.thumbs.map((t, i) => (
              <img key={i} src={t} alt="" loading="lazy" />
            ))}
          </div>
          <p>
            {t.done.summary(order.bottles)} · <strong className="price">{sum(order.total)}</strong>
          </p>
          <p className={s.muted}>{t.done.payment(paymentName(order.payment, lang))}</p>
          <Link to="/catalog" className={`glass-dark btn ${s.ghost}`}>
            {t.done.back}
          </Link>
        </aside>
      </div>
    </section>
  )
}
