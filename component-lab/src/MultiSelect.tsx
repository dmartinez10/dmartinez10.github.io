import { useEffect, useId, useMemo, useRef, useState } from 'react'
import './MultiSelect.css'

export interface Option { value: string; label: string }

export interface MultiSelectProps {
  label: string
  options: Option[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  /**
   * Move selected options to the top when the list reopens. Off by default:
   * it helps when the list is long, and it is disorienting when it is short,
   * because the row you just clicked jumps somewhere else.
   */
  reorderSelected?: boolean
}

export function MultiSelect({
  label, options, value, onChange,
  placeholder = 'Select...', reorderSelected = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const id = useId()

  // Order is frozen while the list is open, so a row never moves under the
  // cursor mid-interaction. It settles on the next open.
  const [frozen, setFrozen] = useState<Option[]>(options)
  useEffect(() => {
    if (open) return
    setFrozen(reorderSelected
      ? [...options].sort((a, b) => Number(value.includes(b.value)) - Number(value.includes(a.value)))
      : options)
  }, [open, options, value, reorderSelected])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? frozen.filter(o => o.label.toLowerCase().includes(q)) : frozen
  }, [frozen, query])

  useEffect(() => { if (active >= shown.length) setActive(Math.max(0, shown.length - 1)) }, [shown, active])

  // Keep the active row in view without scrolling the page itself.
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) { setOpen(true); return }
        setActive(a => Math.min(a + 1, shown.length - 1)); return
      case 'ArrowUp':
        e.preventDefault()
        if (!open) { setOpen(true); return }
        setActive(a => Math.max(a - 1, 0)); return
      case 'Home': if (open) { e.preventDefault(); setActive(0) } return
      case 'End':  if (open) { e.preventDefault(); setActive(shown.length - 1) } return
      case 'Enter':
      case ' ': {
        if (!open) { e.preventDefault(); setOpen(true); return }
        const o = shown[active]
        if (o) { e.preventDefault(); toggle(o.value) }
        return
      }
      case 'Escape':
        if (open) { e.preventDefault(); setOpen(false); setQuery('') }
        return
      case 'Backspace':
        // Backspace on an empty query removes the last chip, the behaviour
        // people expect from every tag input they have used.
        if (!query && value.length) onChange(value.slice(0, -1))
        return
    }
  }

  const selected = options.filter(o => value.includes(o.value))

  return (
    <div className="ms" ref={rootRef}>
      <span className="ms__label" id={`${id}-label`}>{label}</span>

      <div
        className={`ms__control${open ? ' ms__control--open' : ''}`}
        onClick={() => { setOpen(true); rootRef.current?.querySelector('input')?.focus() }}
      >
        {selected.map(o => (
          <span className="ms__chip" key={o.value}>
            {o.label}
            <button
              type="button"
              className="ms__x"
              aria-label={`Remove ${o.label}`}
              onClick={(e) => { e.stopPropagation(); toggle(o.value) }}
            >&times;</button>
          </span>
        ))}

        <input
          className="ms__input"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-labelledby={`${id}-label`}
          aria-autocomplete="list"
          aria-activedescendant={open && shown[active] ? `${id}-opt-${shown[active].value}` : undefined}
          value={query}
          placeholder={selected.length ? '' : placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0) }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && (
        <ul className="ms__list" id={`${id}-list`} role="listbox" aria-multiselectable ref={listRef}>
          {shown.length === 0 && <li className="ms__empty">No matches for &ldquo;{query}&rdquo;</li>}
          {shown.map((o, i) => {
            const on = value.includes(o.value)
            return (
              <li
                key={o.value}
                id={`${id}-opt-${o.value}`}
                role="option"
                aria-selected={on}
                data-active={i === active}
                className="ms__opt"
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(o.value)}
              >
                <span className="ms__tick" aria-hidden="true">{on ? '✓' : ''}</span>
                {o.label}
              </li>
            )
          })}
        </ul>
      )}

      {/* Selection changes are announced without stealing focus. */}
      <span className="sr-only" aria-live="polite">
        {selected.length} of {options.length} selected
      </span>
    </div>
  )
}
