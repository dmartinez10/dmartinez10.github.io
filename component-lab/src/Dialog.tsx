import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Dialog.css'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'

export function Dialog({ open, onClose, title, description, children, footer }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const id = useId()

  // Remember what had focus so it can be handed back on close. Without this a
  // keyboard user is dumped at the top of the document.
  useEffect(() => {
    if (!open) return
    returnTo.current = document.activeElement as HTMLElement
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panelRef.current)?.focus()
    return () => returnTo.current?.focus()
  }, [open])

  // The page behind must not scroll while the dialog owns the screen.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
    if (e.key !== 'Tab') return
    // Trap: cycle focus inside the panel rather than escaping to the page.
    const nodes = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    if (nodes.length === 0) { e.preventDefault(); return }
    const first = nodes[0]!, last = nodes[nodes.length - 1]!
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  }, [onClose])

  if (!open) return null

  return createPortal(
    <div className="dlg" onKeyDown={onKeyDown}>
      <div className="dlg__scrim" onClick={onClose} />
      <div
        className="dlg__panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={description ? `${id}-d` : undefined}
        tabIndex={-1}
      >
        <h2 className="dlg__title" id={`${id}-t`}>{title}</h2>
        {description && <p className="dlg__desc" id={`${id}-d`}>{description}</p>}
        {children && <div className="dlg__body">{children}</div>}
        {footer && <div className="dlg__foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
