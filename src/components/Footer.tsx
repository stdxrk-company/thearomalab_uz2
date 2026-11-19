import { Link } from 'react-router-dom'
import { SHOP } from '../config'
import { telegramLink } from '../lib/order'
import { TelegramIcon } from './Icons'
import s from './Footer.module.css'

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`shell ${s.grid}`}>
        <div className={s.about}>
          <div className={s.brand}>
            <img src="/logo.webp" alt="" width={48} height={48} />
            <span>{SHOP.name}</span>
          </div>
          <p>Оригинальная парфюмерия в распив. Ташкент и доставка по всему Узбекистану.</p>
        </div>

        <nav className={s.col} aria-label="Каталог">
          <p className={s.h}>Каталог</p>
          <Link to="/catalog">Все ароматы</Link>
          <Link to="/catalog?g=men">Мужские</Link>
          <Link to="/catalog?g=women">Женские</Link>
          <Link to="/catalog?g=unisex">Унисекс</Link>
        </nav>

        <nav className={s.col} aria-label="Покупателям">
          <p className={s.h}>Покупателям</p>
          <Link to="/#how">Как заказать</Link>
          <Link to="/#delivery">Доставка</Link>
          <Link to="/#consult">Подбор аромата</Link>
        </nav>

        <div className={s.col}>
          <p className={s.h}>Связаться</p>
          <a href={telegramLink()} target="_blank" rel="noopener noreferrer" className={s.tg}>
            <TelegramIcon width={18} height={18} /> @{SHOP.telegramUsername}
          </a>
          <p className={s.muted}>Отвечаем на вопросы и помогаем выбрать аромат</p>
        </div>
      </div>
      <div className={`shell ${s.bottom}`}>
        <span>© {new Date().getFullYear()} {SHOP.name}</span>
        <span>Цены указаны за 10 мл</span>
      </div>
    </footer>
  )
}
