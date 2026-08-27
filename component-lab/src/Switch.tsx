import { useId } from 'react'
import './Switch.css'

export interface SwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

/**
 * A real checkbox under a styled track, so it is keyboard operable, announces
 * its state, and submits with a form. role="switch" on a native input keeps
 * both the semantics and the behaviour.
 */
export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId()
  const descId = `${id}-desc`
  return (
    <div className="switch">
      <input
        type="checkbox"
        role="switch"
        id={id}
        className="switch__input"
        checked={checked}
        disabled={disabled}
        aria-describedby={description ? descId : undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="switch__label" htmlFor={id}>
        <span className="switch__track" aria-hidden="true"><span className="switch__thumb" /></span>
        <span className="switch__text">
          {label}
          {description && <span className="switch__desc" id={descId}>{description}</span>}
        </span>
      </label>
    </div>
  )
}
