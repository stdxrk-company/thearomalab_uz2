import type { Localized } from './i18n/lang'

/**
 * Business settings in one place. Change values here, not in components.
 */
export const SHOP = {
  name: 'The Aroma Lab',
  /** Telegram username that receives orders (t.me/<username>). */
  telegramUsername: 'stdxrk',
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
 * What the homepage shows. Product ids are the file names in src/data/products.json.
 * Change these lists to rotate the hero, new arrivals and best sellers.
 */
export const MERCH = {
  /** Big photo on the first screen. */
  heroId: 'maison-francis-kurkdjian-baccarat-rouge-540',
  /** Hero texts in every interface language. */
  heroLabel: {
    ru: 'Новые поступления · ноябрь',
    uz: 'Yangi kelganlar · noyabr',
    en: 'New arrivals · November',
  } satisfies Localized,
  heroTitle: {
    ru: 'Шесть новых ароматов: от Louis Vuitton до Kilian',
    uz: 'Oltita yangi atir: Louis Vuittondan Kiliangacha',
    en: 'Six new fragrances, from Louis Vuitton to Kilian',
  } satisfies Localized,
  heroText: {
    ru: 'Каждый можно взять флаконом 10 мл и носить пару недель, прежде чем покупать большой.',
    uz: 'Har birini 10 ml flakonda olib, katta flakon sotib olishdan oldin bir-ikki hafta ishlatib koʻrishingiz mumkin.',
    en: 'Take any of them in a 10 ml bottle and wear it for a couple of weeks before buying a full size.',
  } satisfies Localized,
  /** Marked «Новинка» on cards and shown in the «Новинки» row. */
  newIds: [
    'louis-vuitton-ombre-nomade',
    'parfums-de-marly-delina-exclusif',
    'kilian-good-girl-gone-bad',
    'tom-ford-lost-cherry',
    'louis-vuitton-symphony',
    'xerjoff-naxos',
  ],
  /** «Чаще всего заказывают». */
  hitIds: [
    'maison-francis-kurkdjian-baccarat-rouge-540',
    'creed-aventus',
    'le-labo-santal-33',
    'tom-ford-tobacco-vanille',
    'dior-sauvage-elixir',
    'yves-saint-laurent-libre',
  ],
  /** Photo behind each «Для кого» tile. */
  genderImages: {
    unisex: 'byredo-gypsy-water',
    men: 'chanel-bleu-de-chanel-parfum',
    women: 'dior-miss-dior-rose-n-roses',
  },
}

/** Checkout form options. Payment methods are shown as radio buttons; `id` is stored, the text is shown. */
export const CHECKOUT = {
  payment: [
    { id: 'cash', ru: 'Наличными курьеру', uz: 'Kuryerga naqd pul', en: 'Cash to the courier' },
    { id: 'card', ru: 'Переводом на карту (Click / Payme)', uz: 'Kartaga oʻtkazma (Click / Payme)', en: 'Card transfer (Click / Payme)' },
  ] satisfies (Localized & { id: string })[],
  /** How soon the shop replies, shown after the order is placed. */
  replyTime: {
    ru: 'в течение 15 минут, с 10:00 до 22:00',
    uz: '10:00 dan 22:00 gacha 15 daqiqa ichida',
    en: 'within 15 minutes, between 10:00 and 22:00',
  } satisfies Localized,
  /** Tashkent districts; `ru` doubles as the stored value. */
  districts: [
    { ru: 'Алмазарский', uz: 'Olmazor', en: 'Almazar' },
    { ru: 'Бектемирский', uz: 'Bektemir', en: 'Bektemir' },
    { ru: 'Мирабадский', uz: 'Mirobod', en: 'Mirabad' },
    { ru: 'Мирзо-Улугбекский', uz: 'Mirzo Ulugʻbek', en: 'Mirzo Ulugbek' },
    { ru: 'Сергелийский', uz: 'Sergeli', en: 'Sergeli' },
    { ru: 'Учтепинский', uz: 'Uchtepa', en: 'Uchtepa' },
    { ru: 'Чиланзарский', uz: 'Chilonzor', en: 'Chilanzar' },
    { ru: 'Шайхантахурский', uz: 'Shayxontohur', en: 'Shaykhantakhur' },
    { ru: 'Юнусабадский', uz: 'Yunusobod', en: 'Yunusabad' },
    { ru: 'Яккасарайский', uz: 'Yakkasaroy', en: 'Yakkasaray' },
    { ru: 'Яшнабадский', uz: 'Yashnobod', en: 'Yashnabad' },
    { ru: 'Янгихаётский', uz: 'Yangihayot', en: 'Yangihayot' },
  ] satisfies Localized[],
}

export type PaymentId = (typeof CHECKOUT.payment)[number]['id']

/**
 * Base URL used in product links inside the Telegram message.
 * Set VITE_SITE_URL in .env for production (e.g. https://thearomalab.uz).
 */
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ??
  window.location.origin
