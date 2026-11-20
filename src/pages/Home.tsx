import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { CheckIcon, PlusIcon } from '../components/Icons'
import { CHECKOUT, DELIVERY, MERCH } from '../config'
import { useI18n } from '../i18n'
import { countBy, getProduct, minPrice, pickProducts, type Gender } from '../lib/catalog'
import { useTitle } from '../lib/useTitle'
import { useCart } from '../store/cart'
import s from './Home.module.css'

const GENDERS: Gender[] = ['unisex', 'men', 'women']

export function HomePage() {
  useTitle()
  const cart = useCart()
  const { t, sum, loc } = useI18n()
  const reply = loc(CHECKOUT.replyTime)
  const hero = getProduct(MERCH.heroId)
  const fresh = pickProducts(MERCH.newIds)
  const hits = pickProducts(MERCH.hitIds)
  const heroInCart = hero ? cart.lines.some((l) => l.productId === hero.id) : false

  const goal = DELIVERY.freeFromBottles
  const have = Math.min(goal, cart.freeDeliveryBottles)
  const slots = cart.lines.flatMap((l) => Array.from({ length: l.qty }, () => l.product)).slice(0, goal)

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className={s.hero}>
        {hero && (
          <div className={s.heroMedia}>
            <Link to={`/perfume/${hero.id}`} tabIndex={-1} aria-hidden className={s.heroPhoto}>
              <img src={hero.image} alt="" loading="eager" fetchPriority="high" width={800} height={1200} />
            </Link>
            <span className={`glass ${s.heroBadge}`}>{loc(MERCH.heroLabel)}</span>
            <div className={`glass ${s.heroCaption}`}>
              <Link to={`/perfume/${hero.id}`} className={s.heroCaptionText}>
                <span className="brand-label">{hero.brand}</span>
                <span className={`serif-name ${s.heroName}`}>{hero.name}</span>
                <span className={s.heroPrice}>
                  <span className="price">{sum(minPrice(hero))}</span> · {hero.volumes[0].ml} {t.ml}
                </span>
              </Link>
              <button
                type="button"
                className={`round-add ${s.heroAdd} ${heroInCart ? 'is-added' : ''}`}
                onClick={() => cart.add(hero.id, hero.volumes[0].ml)}
                aria-label={t.card.add(hero.name)}
              >
                {heroInCart ? <CheckIcon /> : <PlusIcon />}
              </button>
            </div>
          </div>
        )}
        <div className={`shell ${s.heroShell}`}>
          <div className={s.heroText}>
            <p className={`glass eyebrow ${s.heroLabel}`}>{loc(MERCH.heroLabel)}</p>
            <h1 className={s.h1}>{loc(MERCH.heroTitle)}</h1>
            <p className={s.lead}>{loc(MERCH.heroText)}</p>
            <div className={s.ctas}>
              <Link to="/#new" className="btn btn-primary">
                {t.home.seeNew}
              </Link>
              <Link to="/catalog" className="btn btn-secondary">
                {t.home.allCatalog}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHO IT'S FOR ---------- */}
      <section className={`shell ${s.section}`} aria-label={t.home.forWhom}>
        <div className={s.tiles}>
          {GENDERS.map((g) => {
            const img = getProduct(MERCH.genderImages[g])
            const n = countBy(g)
            return (
              <Link key={g} to={`/catalog?g=${g}`} className={s.tile}>
                {img && <img src={img.thumb} alt="" loading="lazy" width={560} height={746} />}
                <span className={`glass ${s.tileLabel}`}>
                  <span className={s.tileTitle}>{t.genderFilter[g]}</span>
                  <span className="mono">{t.aromas(n)}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ---------- NEW ---------- */}
      {fresh.length > 0 && (
        <section id="new" className={`shell ${s.section}`}>
          <div className={s.head}>
            <h2 className={s.h2}>{t.home.newTitle}</h2>
            <Link to="/catalog" className={`btn btn-secondary ${s.headBtn}`}>
              {t.home.allCatalog}
            </Link>
          </div>
          <div className={s.grid}>
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- SET OF FOUR on gold dust ---------- */}
      <section className={`gold-dust ${s.promo}`}>
        <div className={`shell ${s.promoShell}`}>
          <div className={`glass-dark ${s.promoCard}`}>
            <p className={`mono ${s.promoEyebrow}`}>{t.home.promoEyebrow}</p>
            <h2 className={s.promoTitle}>{t.home.promoTitle(goal)}</h2>
            <p className={s.promoText}>
              {have >= goal ? t.home.promoFull(goal) : have > 0 ? t.home.promoSome(have, goal) : t.home.promoNone}
            </p>
            <div className={s.track} aria-hidden>
              {Array.from({ length: goal }, (_, i) => (
                <span key={i} className={i < have ? s.on : ''} />
              ))}
            </div>
            {have >= goal ? (
              <Link to="/checkout" className={`btn btn-light ${s.promoBtn}`}>
                {t.home.checkout}
              </Link>
            ) : (
              <Link to="/catalog" className={`btn btn-light ${s.promoBtn}`}>
                {have > 0 ? t.home.addMore : t.home.buildSet}
              </Link>
            )}
          </div>
          <div className={s.slots} aria-hidden>
            {Array.from({ length: goal }, (_, i) => {
              const p = slots[i]
              return (
                <div key={i} className={`glass-dark ${s.slot}`}>
                  {p ? <img src={p.thumb} alt="" loading="lazy" /> : <span className={s.slotEmpty}>{i + 1}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------- BEST SELLERS ---------- */}
      {hits.length > 0 && (
        <section className={`shell ${s.section}`}>
          <div className={s.head}>
            <h2 className={s.h2}>{t.home.hitsTitle}</h2>
          </div>
          <ol className={s.hits}>
            {hits.map((p, i) => (
              <li key={p.id}>
                <Link to={`/perfume/${p.id}`} className={`glass ${s.hit}`}>
                  <span className={`mono ${s.hitNo}`}>{String(i + 1).padStart(2, '0')}</span>
                  <img src={p.thumb} alt="" loading="lazy" width={56} height={70} />
                  <span className={s.hitName}>
                    <span className="brand-label">{p.brand}</span>
                    <span className="serif-name">{p.name}</span>
                  </span>
                  <span className={`price ${s.hitPrice}`}>{sum(minPrice(p))}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---------- HOW / DELIVERY ---------- */}
      <section id="how" className={`shell ${s.section}`}>
        <div id="delivery" className={`glass ${s.info}`}>
          <h2 className={s.h2}>{t.home.howTitle}</h2>
          <div className={s.infoGrid}>
            <div>
              <h3>{t.home.siteH}</h3>
              <p>{t.home.siteP}</p>
            </div>
            <div>
              <h3>{t.home.confirmH}</h3>
              <p>{t.home.confirmP(reply)}</p>
            </div>
            <div>
              <h3>{t.home.deliveryH}</h3>
              <p>{t.home.deliveryP(DELIVERY.freeFromBottles)}</p>
            </div>
            <div>
              <h3>{t.home.payH}</h3>
              <p>{t.home.payP(CHECKOUT.payment.map(loc))}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className={`shell ${s.section}`}>
        <div className={s.faqWrap}>
          <h2 className={s.h2}>{t.home.faqTitle}</h2>
          <div className={s.faq}>
            {t.home.faq(DELIVERY.freeFromBottles).map((f) => (
              <details key={f.q} className={`glass ${s.faqItem}`}>
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
