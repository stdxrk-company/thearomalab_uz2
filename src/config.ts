/**
 * Business settings in one place. Change values here, not in components.
 */
export const SHOP = {
  name: 'The Aroma Lab',
  /** Telegram username that receives orders (t.me/<username>). */
  telegramUsername: 'stdxrk',
  city: 'Ташкент',
}

export const PRICING = {
  /** UZS per 1 USD — Central Bank of Uzbekistan rate on 19.11.2026. */
  usdRate: 11980.36,
  /** Converted prices are rounded up to this step, in UZS. */
  roundTo: 1000,
}

export const DELIVERY = {
  /** Free delivery inside Tashkent from this many bottles of 10 ml or more. */
  freeFromBottles: 4,
  freeMinBottleMl: 10,
}

/**
 * Base URL used in product links inside the Telegram message.
 * Set VITE_SITE_URL in .env for production (e.g. https://thearomalab.uz).
 */
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ??
  window.location.origin
