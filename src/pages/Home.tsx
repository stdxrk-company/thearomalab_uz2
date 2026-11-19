import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ArrowIcon, ChatIcon, DropIcon, TelegramIcon, TruckIcon } from '../components/Icons'
import { DELIVERY } from '../config'
import {
  brands,
  countBy,
  formatSum,
  getProduct,
  GENDER_FILTER_LABEL,
  minPrice,
  priceTiers,
  products,
  type Gender,
  type Product,
} from '../lib/catalog'
import { telegramLink } from '../lib/order'
import { AROMA, plural } from '../lib/plural'
import { useTitle } from '../lib/useTitle'
import s from './Home.module.css'

const pick = (ids: string[]) => ids.map(getProduct).filter((p): p is Product => Boolean(p))

const HERO = pick(['maison-francis-kurkdjian-baccarat-rouge-540', 'louis-vuitton-symphony', 'creed-aventus'])

const GENDER_TILES: { gender: Gender; image: string }[] = [
  { gender: 'men', image: 'chanel-bleu-de-chanel-parfum' },
  { gender: 'women', image: 'parfums-de-marly-delina-exclusif' },
  { gender: 'unisex', image: 'byredo-gypsy-water' },
]

const FEATURED_BRANDS = ['Creed', 'Tom Ford', 'Louis Vuitton', 'Byredo', 'Parfums de Marly', 'Kilian', 'Chanel', 'Dior', 'Xerjoff', 'Amouage', 'Le Labo', 'Roja Parfums']

const FAQ = [
  {
    q: 'Что такое распив?',
    a: 'Это оригинальный аромат, перелитый из полноразмерного флакона в небольшой флакон 10 мл. Так можно носить аромат неделями и собрать коллекцию из нескольких, не покупая дорогие большие флаконы.',
  },
  {
    q: 'Как оформить заказ?',
    a: 'Добавьте ароматы в корзину и нажмите «Заказать в Telegram». Откроется чат с готовым сообщением — останется только отправить его. Мы подтвердим заказ, оплату и доставку.',
  },
  {
    q: 'Сколько стоит доставка?',
    a: `По Ташкенту при заказе от ${DELIVERY.freeFromBottles} флаконов по 10 мл доставка бесплатная. Если флаконов меньше — доставку Yandex оплачивает покупатель. В другие города отправляем через BTS.`,
  },
  {
    q: 'Можно ли заказать разные ароматы в одном заказе?',
    a: 'Да. Собирайте любые сочетания — в корзине можно менять количество и удалять позиции до отправки заказа.',
  },
]

export function HomePage() {
  useTitle()
  const [tier, setTier] = useState(priceTiers[0])
  const tierProducts = products.filter((p) => minPrice(p) === tier)
  const brandsShown = FEATURED_BRANDS.filter((b) => brands.some((x) => x.name === b))

  return (
    <>
      {/* HERO */}
      <section className={s.hero}>
        <div className={`shell ${s.heroGrid}`}>
          <div className={s.heroText}>
            <p className="eyebrow">Распив оригинальной парфюмерии · Ташкент</p>
            <h1 className={s.h1}>
              Ароматы мировых домов <em>по 10 мл</em>
            </h1>
            <p className={s.lead}>
              Creed, Tom Ford, Louis Vuitton, Byredo и ещё {brands.length - 4} парфюмерных домов. Попробуйте аромат
              в жизни, прежде чем покупать полный флакон.
            </p>
            <div className={s.ctas}>
              <Link to="/catalog" className="btn btn-primary">
                Выбрать аромат <ArrowIcon width={18} height={18} />
              </Link>
              <a
                href={telegramLink('Здравствуйте! Помогите, пожалуйста, подобрать аромат.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Помочь с выбором
              </a>
            </div>
            <dl className={s.stats}>
              <div>
                <dt>{products.length}</dt>
                <dd>{plural(products.length, AROMA)} в наличии</dd>
              </div>
              <div>
                <dt>{formatSum(priceTiers[0]).replace(' сум', '')}</dt>
                <dd>сум — цена от, за флакон 10 мл</dd>
              </div>
              <div>
                <dt>{DELIVERY.freeFromBottles}+</dt>
                <dd>флакона — доставка по Ташкенту бесплатно</dd>
              </div>
            </dl>
          </div>

          <div className={s.heroArt} aria-hidden>
            {HERO.map((p, i) => (
              <Link key={p.id} to={`/perfume/${p.id}`} className={`${s.heroImg} ${s[`heroImg${i}`]}`} tabIndex={-1}>
                <img src={p.image} alt="" loading="eager" />
                <span className={s.heroCaption}>
                  <span>{p.brand}</span>
                  {p.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GENDER */}
      <section className={`shell ${s.section}`}>
        <div className={s.sectionHead}>
          <h2 className={s.h2}>С чего начать</h2>
          <Link to="/catalog" className={s.more}>
            Весь каталог <ArrowIcon width={16} height={16} />
          </Link>
        </div>
        <div className={s.tiles}>
          {GENDER_TILES.map((t) => {
            const img = getProduct(t.image)
            return (
              <Link key={t.gender} to={`/catalog?g=${t.gender}`} className={s.tile}>
                {img && <img src={img.thumb} alt="" loading="lazy" />}
                <span className={s.tileShade} />
                <span className={s.tileText}>
                  <span className={s.tileTitle}>{GENDER_FILTER_LABEL[t.gender]}</span>
                  <span className={s.tileMeta}>
                    {countBy(t.gender)} {plural(countBy(t.gender), AROMA)}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className={`shell ${s.section}`}>
        <div className={s.how}>
          <div>
            <p className="eyebrow">Как заказать</p>
            <h2 className={s.h2}>Три шага до вашего набора</h2>
          </div>
          <ol className={s.steps}>
            <li>
              <span className={s.stepNum}>01</span>
              <div>
                <h3>Выберите ароматы</h3>
                <p>Найдите знакомый аромат через поиск или откройте для себя новый в каталоге.</p>
              </div>
            </li>
            <li>
              <span className={s.stepNum}>02</span>
              <div>
                <h3>Соберите корзину</h3>
                <p>Добавьте несколько флаконов. От {DELIVERY.freeFromBottles} штук — доставка по Ташкенту бесплатно.</p>
              </div>
            </li>
            <li>
              <span className={s.stepNum}>03</span>
              <div>
                <h3>Отправьте заказ в Telegram</h3>
                <p>Сообщение с составом заказа сформируется само. Мы подтвердим его и договоримся о доставке.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* BY PRICE */}
      <section className={`shell ${s.section}`}>
        <div className={s.sectionHead}>
          <h2 className={s.h2}>Выбор по цене</h2>
          <Link to={`/catalog?p=${tier}`} className={s.more}>
            Все за {formatSum(tier)} <ArrowIcon width={16} height={16} />
          </Link>
        </div>
        <div className={s.tabs} role="tablist" aria-label="Цена за 10 мл">
          {priceTiers.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tier}
              className={`${s.tab} ${t === tier ? s.tabOn : ''}`}
              onClick={() => setTier(t)}
            >
              <span className="price">{formatSum(t)}</span>
              <span className={s.tabCount}>{products.filter((p) => minPrice(p) === t).length}</span>
            </button>
          ))}
        </div>
        <div className={s.rail}>
          {tierProducts.slice(0, 10).map((p) => (
            <div key={p.id} className={s.railItem}>
              <ProductCard product={p} />
            </div>
          ))}
          <Link to={`/catalog?p=${tier}`} className={s.railMore}>
            <span>Смотреть все {tierProducts.length}</span>
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* SET PROMO */}
      <section className={`shell ${s.section}`}>
        <div className={s.promo}>
          <div className={s.promoText}>
            <p className={s.promoEyebrow}>Набор из четырёх</p>
            <h2 className={s.promoTitle}>Четыре аромата — четыре настроения. Доставка по Ташкенту бесплатно.</h2>
            <p className={s.promoLead}>
              Свежий на день, глубокий на вечер, что-то на смелость и что-то на память. Соберите свой набор из 4
              флаконов по 10 мл.
            </p>
            <Link to="/catalog" className={`btn ${s.promoBtn}`}>
              Собрать набор
            </Link>
          </div>
          <div className={s.promoArt} aria-hidden>
            {pick(['tom-ford-lost-cherry', 'byredo-bal-d-afrique', 'xerjoff-naxos', 'kilian-angels-share-on-the-rocks']).map(
              (p) => (
                <img key={p.id} src={p.thumb} alt="" loading="lazy" />
              ),
            )}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className={`shell ${s.section}`}>
        <div className={s.sectionHead}>
          <h2 className={s.h2}>Парфюмерные дома</h2>
          <span className={s.muted}>{brands.length} брендов в каталоге</span>
        </div>
        <div className={s.brands}>
          {brandsShown.map((b) => (
            <Link key={b} to={`/catalog?b=${encodeURIComponent(b)}`} className={s.brandLink}>
              {b}
            </Link>
          ))}
          <Link to="/catalog" className={`${s.brandLink} ${s.brandAll}`}>
            Все бренды <ArrowIcon width={16} height={16} />
          </Link>
        </div>
      </section>

      {/* DELIVERY */}
      <section id="delivery" className={`shell ${s.section}`}>
        <div className={s.sectionHead}>
          <h2 className={s.h2}>Доставка</h2>
        </div>
        <div className={s.delivery}>
          <article className={s.dcard}>
            <TruckIcon width={26} height={26} />
            <h3>По Ташкенту</h3>
            <p>
              Курьером Yandex до двери. При заказе от {DELIVERY.freeFromBottles} флаконов по 10 мл —{' '}
              <strong>бесплатно</strong>. Если флаконов меньше, доставку оплачивает покупатель.
            </p>
          </article>
          <article className={s.dcard}>
            <DropIcon width={26} height={26} />
            <h3>По Узбекистану</h3>
            <p>Отправляем в другие города почтовой службой BTS. Стоимость и сроки уточним при подтверждении заказа.</p>
          </article>
          <article className={s.dcard}>
            <ChatIcon width={26} height={26} />
            <h3>Подтверждение</h3>
            <p>После заказа в Telegram мы свяжемся с вами, подтвердим наличие, оплату и удобное время доставки.</p>
          </article>
        </div>
      </section>

      {/* CONSULT */}
      <section id="consult" className={`shell ${s.section}`}>
        <div className={s.consult}>
          <div>
            <h2 className={s.h2}>Не знаете, какой аромат выбрать?</h2>
            <p className={s.consultText}>
              Расскажите, какие ароматы вам нравились раньше, для какого случая и сезона ищете — подскажем несколько
              вариантов из наличия.
            </p>
          </div>
          <a
            href={telegramLink('Здравствуйте! Помогите, пожалуйста, подобрать аромат.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <TelegramIcon /> Написать в Telegram
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className={`shell ${s.section}`}>
        <div className={s.faqWrap}>
          <h2 className={s.h2}>Вопросы</h2>
          <div className={s.faq}>
            {FAQ.map((f) => (
              <details key={f.q} className={s.faqItem}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
