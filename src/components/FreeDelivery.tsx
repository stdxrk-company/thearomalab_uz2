import { DELIVERY } from '../config'
import { useI18n } from '../i18n'
import { useCart } from '../store/cart'
import { TruckIcon } from './Icons'
import s from './FreeDelivery.module.css'

/** Progress towards free delivery in Tashkent (from 4 bottles of 10 ml). */
export function FreeDelivery() {
  const { freeDeliveryBottles, bottlesToFreeDelivery } = useCart()
  const { t } = useI18n()
  const goal = DELIVERY.freeFromBottles
  const filled = Math.min(goal, freeDeliveryBottles)
  const done = bottlesToFreeDelivery === 0

  return (
    <div className={`${s.box} ${done ? s.done : ''}`}>
      <div className={s.row}>
        <TruckIcon width={18} height={18} />
        <p>
          {done ? (
            <>
              {t.free.doneA}
              <strong>{t.free.doneB}</strong>
            </>
          ) : (
            t.free.left(bottlesToFreeDelivery)
          )}
        </p>
      </div>
      <div className={s.track} aria-hidden>
        {Array.from({ length: goal }, (_, i) => (
          <span key={i} className={i < filled ? s.on : ''} />
        ))}
      </div>
    </div>
  )
}
