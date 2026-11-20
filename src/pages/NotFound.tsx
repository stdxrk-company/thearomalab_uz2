import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useTitle } from '../lib/useTitle'

export function NotFoundPage() {
  const { t } = useI18n()
  useTitle(t.notFound.title)
  return (
    <div className="shell" style={{ padding: '72px var(--gutter)' }}>
      <div
        className="glass"
        style={{ maxWidth: 560, margin: '0 auto', padding: 36, borderRadius: 'var(--r-xl)', background: 'rgba(255,255,255,.42)', textAlign: 'center' }}
      >
        <p className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>
          404
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 7vw, 48px)', marginTop: 10 }}>{t.notFound.h1}</h1>
        <p style={{ color: 'var(--text-2)', margin: '12px auto 24px', maxWidth: 420 }}>
          {t.notFound.text}
        </p>
        <Link to="/catalog" className="btn btn-primary">
          {t.notFound.toCatalog}
        </Link>
      </div>
    </div>
  )
}
