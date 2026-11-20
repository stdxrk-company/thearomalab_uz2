import { CHECKOUT, SHOP, SITE_URL } from '../config'
import { DICTS } from '../i18n/dicts'
import type { Lang } from '../i18n/lang'
import { formatSum, fullName } from './catalog'
import type { ResolvedLine } from '../store/cart'

export function productUrl(productId: string): string {
  return `${SITE_URL}/perfume/${productId}`
}

/** plain spaces read better in Telegram than the narrow no-break spaces of formatted sums */
const plainSpaces = (text: string) => text.replace(/ | /g, ' ')

function itemLines(lines: ResolvedLine[], lang: Lang): string[] {
  const t = DICTS[lang]
  return lines.map((l) => {
    const qty = l.qty > 1 ? t.msg.pcs(l.qty) : ''
    return `• ${fullName(l.product)} — ${l.ml} ${t.ml}${qty} — ${formatSum(l.total, lang)}`
  })
}

/** Builds the order text that is pre-filled in the owner's Telegram chat, in the customer's language. */
export function buildOrderMessage(lines: ResolvedLine[], lang: Lang): string {
  const t = DICTS[lang]
  const bottles = lines.reduce((s, l) => s + l.qty, 0)
  const total = lines.reduce((s, l) => s + l.total, 0)
  const links = lines.map((l) => `${fullName(l.product)}: ${productUrl(l.productId)}`)

  return plainSpaces(
    [
      t.msg.hello,
      '',
      ...itemLines(lines, lang),
      '',
      t.msg.count(bottles),
      `${t.msg.total}: ${formatSum(total, lang)}`,
      '',
      t.msg.links,
      ...links,
      '',
      t.msg.thanks,
    ].join('\n'),
  )
}

export interface Customer {
  name: string
  phone: string
  contact: 'telegram' | 'call'
  delivery: 'tashkent' | 'region'
  /** Russian district name from CHECKOUT.districts — shown translated. */
  district: string
  city: string
  address: string
  landmark: string
  /** id from CHECKOUT.payment */
  payment: string
  comment: string
}

export function districtName(ruName: string, lang: Lang): string {
  return CHECKOUT.districts.find((d) => d.ru === ruName)?.[lang] ?? ruName
}

export function paymentName(id: string, lang: Lang): string {
  return CHECKOUT.payment.find((p) => p.id === id)?.[lang] ?? id
}

/** Where the order goes, as shown to people: «Чиланзарский район» / «Chilonzor tumani» / a city name. */
export function placeName(o: { delivery: Customer['delivery']; district: string; city: string }, lang: Lang): string {
  return o.delivery === 'tashkent' ? DICTS[lang].checkout.place(districtName(o.district, lang)) : o.city
}

/** Order text for the checkout page: items plus everything the customer filled in, in the customer's language. */
export function buildCheckoutMessage(
  lines: ResolvedLine[],
  c: Customer,
  orderNo: string,
  freeDelivery: boolean,
  lang: Lang,
): string {
  const t = DICTS[lang]
  const bottles = lines.reduce((s, l) => s + l.qty, 0)
  const total = lines.reduce((s, l) => s + l.total, 0)
  const where =
    c.delivery === 'tashkent'
      ? [
          t.msg.deliveryTashkent(freeDelivery),
          `${t.msg.district}: ${districtName(c.district, lang)}`,
          `${t.msg.address}: ${c.address}`,
        ]
      : [t.msg.deliveryRegion, `${t.msg.city}: ${c.city}`, `${t.msg.address}: ${c.address}`]
  return plainSpaces(
    [
      t.msg.helloOrder(orderNo),
      '',
      ...itemLines(lines, lang),
      '',
      t.msg.count(bottles),
      `${t.msg.total}: ${formatSum(total, lang)}`,
      '',
      `${t.msg.name}: ${c.name}`,
      `${t.msg.phone}: ${c.phone}`,
      `${t.msg.confirm}: ${t.msg.confirmHow[c.contact]}`,
      ...where,
      ...(c.landmark ? [`${t.msg.landmark}: ${c.landmark}`] : []),
      `${t.msg.payment}: ${paymentName(c.payment, lang)}`,
      ...(c.comment ? ['', `${t.msg.comment}: ${c.comment}`] : []),
    ].join('\n'),
  )
}

/** What the «Заказ принят» page shows; kept in sessionStorage so a reload doesn't lose it. */
export interface OrderSnapshot {
  orderNo: string
  name: string
  contact: Customer['contact']
  delivery: Customer['delivery']
  district: string
  city: string
  /** id from CHECKOUT.payment */
  payment: string
  bottles: number
  total: number
  freeDelivery: boolean
  thumbs: string[]
  /** The text exactly as it was sent, in the language the customer had then. */
  message: string
}

const ORDER_KEY = 'aromalab.lastOrder.v2'

export function saveOrder(o: OrderSnapshot) {
  try {
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(o))
  } catch {
    /* storage unavailable — the page still gets the order through router state */
  }
}

export function loadOrder(): OrderSnapshot | null {
  try {
    const raw = sessionStorage.getItem(ORDER_KEY)
    return raw ? (JSON.parse(raw) as OrderSnapshot) : null
  } catch {
    return null
  }
}

/** Short order number: day of month + 4 random digits, e.g. 20-4817. */
export function newOrderNo(): string {
  const d = new Date().getDate().toString().padStart(2, '0')
  return `${d}-${Math.floor(1000 + Math.random() * 9000)}`
}

export function telegramLink(text?: string): string {
  const base = `https://t.me/${SHOP.telegramUsername}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function productQuestionMessage(productName: string, url: string, lang: Lang): string {
  return DICTS[lang].msg.question(productName, url)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}
