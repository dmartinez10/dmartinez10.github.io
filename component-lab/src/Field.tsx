import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import './Field.css'

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  /** Help text. Announced with the input, not as a separate stop. */
  description?: string
  /** When set the field is invalid and the message is announced. */
  error?: string
}

export function Field({ label, description, error, required, ...rest }: FieldProps) {
  const id = useId()
  const descId = `${id}-desc`
  const errId = `${id}-err`

  // Only reference ids that actually render, or the accessible description
  // points at nothing.
  const describedBy = [description ? descId : null, error ? errId : null]
    .filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {description && <p className="field__desc" id={descId}>{description}</p>}

      <input
        id={id}
        className={`field__input${error ? ' field__input--bad' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={required}
        {...rest}
      />

      {/* role="alert" so the message is spoken when it appears, not only on focus */}
      {error && <p className="field__err" id={errId} role="alert">{error}</p>}
    </div>
  )
}
