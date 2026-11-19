import { MAX_QTY } from '../store/cart'
import { MinusIcon, PlusIcon } from './Icons'
import s from './QtyStepper.module.css'

interface Props {
  value: number
  onChange: (n: number) => void
  size?: 'sm' | 'md'
  label?: string
}

export function QtyStepper({ value, onChange, size = 'md', label = 'Количество' }: Props) {
  return (
    <div className={`${s.stepper} ${s[size]}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Уменьшить">
        <MinusIcon width={16} height={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Увеличить">
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  )
}
