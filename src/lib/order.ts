import { SHOP, SITE_URL } from '../config'
import { formatSum, fullName } from './catalog'
import { BOTTLE, plural } from './plural'
import type { ResolvedLine } from '../store/cart'

export function productUrl(productId: string): string {
  return `${SITE_URL}/perfume/${productId}`
}

/** Builds the order text that is pre-filled in the owner's Telegram chat. */
export function buildOrderMessage(lines: ResolvedLine[]): string {
  const bottles = lines.reduce((s, l) => s + l.qty, 0)
  const total = lines.reduce((s, l) => s + l.total, 0)

  const items = lines.map((l) => {
    const qty = l.qty > 1 ? ` × ${l.qty} шт.` : ''
    return `• ${fullName(l.product)} — ${l.ml} мл${qty} — ${formatSum(l.total)}`
  })

  const links = lines.map((l) => `${fullName(l.product)}: ${productUrl(l.productId)}`)

  return [
    'Здравствуйте! Хочу заказать:',
    '',
    ...items,
    '',
    `Количество: ${bottles} ${plural(bottles, BOTTLE)}`,
    `Итого: ${formatSum(total)}`,
    '',
    'Ссылки на товары:',
    ...links,
    '',
    'Спасибо!',
  ]
    .join('\n')
    .replace(/ | /g, ' ') // plain spaces read better in Telegram
}

export function telegramLink(text?: string): string {
  const base = `https://t.me/${SHOP.telegramUsername}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function productQuestionMessage(productName: string, url: string): string {
  return `Здравствуйте! Хочу узнать подробнее об аромате ${productName}:\n${url}`
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
