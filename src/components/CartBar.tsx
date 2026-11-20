import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'
import { getProduct } from '../lib/catalog'
import { useCart } from '../store/cart'
import { BagIcon, CheckIcon, GridIcon, HomeIcon, SearchIcon } from './Icons'
import s from './CartBar.module.css'

/**
 * Phones and tablets: floating glass tab bar (Главная · Каталог · Поиск · Корзина).
 * Product and checkout pages show their own action bar instead.
 * On every screen: a short glass "added" toast after something goes into the cart.
 */
export function CartBar() {
  const { bottles, open, isOpen, lastAdded } = useCart()
  const { pathname, search } = useLocation()
  const { t } = useI18n()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!lastAdded) return
    const p = getProduct(lastAdded.productId)
    setToast(p ? `${p.brand} ${p.name}` : null)
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [lastAdded])

  const ownBar = pathname.startsWith('/perfume/') || pathname === '/checkout'
  const searching = pathname === '/catalog' && search.includes('focus=search')

  const tab = (to: string, label: string, icon: ReactNode, active: boolean) => (
    <Link to={to} className={`${s.tab} ${active ? s.on : ''}`} aria-current={active ? 'page' : undefined}>
      {icon}
      <span>{label}</span>
    </Link>
  )

  return (
    <>
      <div className={`glass ${s.toast} ${toast && !isOpen ? s.toastOn : ''} ${ownBar ? s.toastHigh : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <span className={s.check}>
              <CheckIcon width={16} height={16} />
            </span>
            <span className={s.toastText}>
              <strong>{t.toast.added}</strong> {toast}
            </span>
            <button type="button" onClick={open} className={s.toastBtn}>
              {t.nav.cart}
            </button>
          </>
        )}
      </div>

      {!ownBar && (
        <nav className={`glass ${s.bar}`} aria-label={t.nav.sections}>
          {tab('/', t.nav.home, <HomeIcon />, pathname === '/')}
          {tab('/catalog', t.nav.catalog, <GridIcon />, pathname === '/catalog' && !searching)}
          {tab('/catalog?focus=search', t.nav.search, <SearchIcon />, searching)}
          <button type="button" className={`${s.tab} ${isOpen ? s.on : ''}`} onClick={open} aria-label={t.nav.cartAria(bottles)}>
            <BagIcon />
            <span>{t.nav.cart}</span>
            {bottles > 0 && <span className={s.badge}>{bottles}</span>}
          </button>
        </nav>
      )}
    </>
  )
}
