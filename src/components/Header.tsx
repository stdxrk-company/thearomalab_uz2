import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SHOP } from '../config'
import { useI18n } from '../i18n'
import { useCart } from '../store/cart'
import { BagIcon, SearchIcon } from './Icons'
import { LangSwitch } from './LangSwitch'
import s from './Header.module.css'

/** Floating glass bar. On phones the sections move to the bottom tab bar (see CartBar). */
export function Header() {
  const { bottles, open, lastAdded } = useCart()
  const { t } = useI18n()
  const NAV = [
    { to: '/catalog', label: t.nav.catalog },
    { to: '/#new', label: t.nav.new },
    { to: '/catalog?g=unisex', label: t.genderFilter.unisex },
    { to: '/catalog?g=men', label: t.genderFilter.men },
    { to: '/catalog?g=women', label: t.genderFilter.women },
    { to: '/#delivery', label: t.nav.delivery },
  ]
  const [bump, setBump] = useState(false)
  const [q, setQ] = useState('')
  const loc = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!lastAdded) return
    setBump(true)
    const t = setTimeout(() => setBump(false), 450)
    return () => clearTimeout(t)
  }, [lastAdded])

  const isActive = (to: string) => {
    const [pathHash, query] = to.split('?')
    if (pathHash.includes('#')) return false
    if (pathHash !== loc.pathname) return false
    const g = new URLSearchParams(loc.search).get('g')
    return query ? query === `g=${g}` : !g
  }

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const v = q.trim()
    navigate(v ? `/catalog?q=${encodeURIComponent(v)}` : '/catalog?focus=search')
    setQ('')
  }

  const onCatalog = loc.pathname === '/catalog'

  return (
    <div className={s.wrap}>
      <header className={`glass ${s.bar}`}>
        <Link to="/" className={s.brand} aria-label={t.nav.toHome(SHOP.name)}>
          <img src="/logo.webp" alt="" width={42} height={42} className={s.logo} />
          <span className={s.wordmark}>{SHOP.name}</span>
        </Link>

        <nav className={s.nav} aria-label={t.nav.mainMenu}>
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`${s.link} ${isActive(n.to) ? s.active : ''}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        {!onCatalog && (
          <form className={s.search} role="search" onSubmit={onSearch}>
            <label htmlFor="header-search" className="visually-hidden">
              {t.nav.searchLabel}
            </label>
            <SearchIcon width={18} height={18} />
            <input
              id="header-search"
              type="search"
              placeholder={t.nav.searchPlaceholder}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              enterKeyHint="search"
              autoComplete="off"
            />
          </form>
        )}

        <Link to="/catalog?focus=search" className={`${s.mSearch} glass`} aria-label={t.nav.searchLabel}>
          <SearchIcon width={19} height={19} />
        </Link>

        <LangSwitch />

        <button
          type="button"
          className={`glass ${s.cart} ${bump ? s.bump : ''}`}
          onClick={open}
          aria-label={t.nav.cartAria(bottles)}
        >
          <BagIcon width={19} height={19} />
          <span className={s.cartLabel}>{t.nav.cart}</span>
          <span className={s.badge}>{bottles}</span>
        </button>
      </header>
    </div>
  )
}
