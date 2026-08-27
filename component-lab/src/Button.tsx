import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Shows a spinner and blocks the click without collapsing the button's width. */
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      // aria-disabled rather than disabled keeps it focusable, so a screen
      // reader user can still reach it and hear why it is unavailable.
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (disabled || loading) { e.preventDefault(); return }
        rest.onClick?.(e)
      }}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span className={loading ? 'btn__label btn__label--hidden' : 'btn__label'}>
        {children}
      </span>
      {loading && <span className="sr-only">Loading</span>}
    </button>
  )
}
