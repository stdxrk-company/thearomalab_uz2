import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../store/cart'
import { BagIcon, SearchIcon } from './Icons'
import s from './Header.module.css'

const NAV = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/catalog?g=men', label: 'Мужские' },
  { to: '/catalog?g=women', label: 'Женские' },
  { to: '/catalog?g=unisex', label: 'Унисекс' },
  { to: '/#delivery', label: 'Доставка' },
]

export function Header() {
  const { bottles, open, lastAdded } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [bump, setBump] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!lastAdded) return
    setBump(true)
    const t = setTimeout(() => setBump(false), 450)
    return () => clearTimeout(t)
  }, [lastAdded])

  const isActive = (to: string) => {
    const [path, query] = to.split('?')
    if (path !== loc.pathname) return false
    const g = new URLSearchParams(loc.search).get('g')
    return query ? query === `g=${g}` : !g
  }

  return (
    <header className={`${s.header} ${scrolled ? s.scrolled : ''}`}>
      <div className={`shell ${s.bar}`}>
        <Link to="/" className={s.brand} aria-label="The Aroma Lab — на главную">
          <img src="/logo.webp" alt="" width={40} height={40} className={s.logo} />
          <span className={s.wordmark}>The Aroma Lab</span>
        </Link>

        <nav className={s.nav} aria-label="Основное меню">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={() => `${s.link} ${isActive(n.to) ? s.active : ''}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className={s.actions}>
          <Link to="/catalog?focus=search" className={s.iconBtn} aria-label="Поиск по каталогу">
            <SearchIcon />
          </Link>
          <button type="button" className={`${s.iconBtn} ${s.cartBtn} ${bump ? s.bump : ''}`} onClick={open} aria-label={`Корзина, товаров: ${bottles}`}>
            <BagIcon />
            {bottles > 0 && <span className={s.badge}>{bottles}</span>}
          </button>
        </div>
      </div>

      <nav className={s.mobileNav} aria-label="Разделы">
        <div className={s.mobileNavInner}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={() => `${s.mlink} ${isActive(n.to) ? s.active : ''}`}>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
