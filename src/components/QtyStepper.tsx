import { useI18n } from '../i18n'
import { MAX_QTY } from '../store/cart'
import { MinusIcon, PlusIcon } from './Icons'
import s from './QtyStepper.module.css'

interface Props {
  value: number
  onChange: (n: number) => void
  size?: 'sm' | 'md'
  label?: string
}

export function QtyStepper({ value, onChange, size = 'md', label }: Props) {
  const { t } = useI18n()
  return (
    <div className={`${s.stepper} ${s[size]}`} role="group" aria-label={label ?? t.qty.label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t.qty.dec}>
        <MinusIcon width={16} height={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label={t.qty.inc}>
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  )
}
