import { useEffect, useState } from 'react'
import { formatSum, getProduct } from '../lib/catalog'
import { BOTTLE, plural } from '../lib/plural'
import { useCart } from '../store/cart'
import { BagIcon, CheckIcon } from './Icons'
import s from './CartBar.module.css'

/**
 * Bottom bar on phones: always shows what's in the cart and opens it in one tap.
 * Also flashes a short "added" confirmation after quick-add.
 */
export function CartBar() {
  const { bottles, total, open, isOpen, lastAdded } = useCart()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!lastAdded) return
    const p = getProduct(lastAdded.productId)
    setToast(p ? `${p.brand} ${p.name}` : null)
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [lastAdded])

  const visible = bottles > 0 && !isOpen

  return (
    <>
      <div className={`${s.toast} ${toast && !isOpen ? s.toastOn : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <CheckIcon width={18} height={18} />
            <span>
              <strong>Добавлено:</strong> {toast}
            </span>
            <button type="button" onClick={open}>
              Корзина
            </button>
          </>
        )}
      </div>

      <div className={`${s.bar} ${visible ? s.barOn : ''}`} aria-hidden={!visible}>
        <button type="button" className={s.inner} onClick={open} tabIndex={visible ? 0 : -1}>
          <span className={s.left}>
            <BagIcon />
            <span>
              {bottles} {plural(bottles, BOTTLE)}
            </span>
          </span>
          <span className={s.right}>
            <span className="price">{formatSum(total)}</span>
            <span className={s.cta}>Оформить</span>
          </span>
        </button>
      </div>
    </>
  )
}
