import { Link } from 'react-router-dom'
import { useTitle } from '../lib/useTitle'

export function NotFoundPage() {
  useTitle('Страница не найдена')
  return (
    <div className="shell" style={{ padding: '96px var(--gutter)', textAlign: 'center' }}>
      <p className="eyebrow">404</p>
      <h1 style={{ fontSize: 'clamp(36px, 7vw, 56px)', marginTop: 12 }}>Такой страницы нет</h1>
      <p style={{ color: 'var(--text-2)', margin: '14px auto 28px', maxWidth: 420 }}>
        Возможно, аромат убрали из каталога или ссылка устарела.
      </p>
      <Link to="/catalog" className="btn btn-primary">
        Перейти в каталог
      </Link>
    </div>
  )
}
