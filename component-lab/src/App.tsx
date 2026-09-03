import { useEffect, useState } from 'react'
import { Button } from './Button'
import { Field } from './Field'
import { Switch } from './Switch'
import { MultiSelect, type Option } from './MultiSelect'
import { Dialog } from './Dialog'
import './App.css'

type Theme = 'light' | 'dark'

const LOCALES: Option[] = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ja-easy', label: 'Easy Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
]

const TOKENS = [
  '--bg', '--bg-sub', '--bg-raise', '--rule', '--rule-strong',
  '--ink', '--ink-2', '--ink-3', '--accent', '--accent-sub', '--danger',
]

/**
 * Start from what the visitor already asked their OS for, and let ?theme=
 * override it so either theme has a shareable link.
 */
function initialTheme(): Theme {
  const forced = new URLSearchParams(window.location.search).get('theme')
  if (forced === 'dark' || forced === 'light') return forced
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [locales, setLocales] = useState<string[]>(['en', 'ja'])
  const [reorder, setReorder] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [swatches, setSwatches] = useState<[string, string][]>([])

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])

  // Follow the OS if the visitor changes it while the page is open, unless
  // they have already made a choice here with the switch.
  const [pinned, setPinned] = useState(false)
  useEffect(() => {
    if (pinned) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [pinned])

  // Read the tokens back off the document so the swatches show what is really
  // computed, not a second copy of the values that could drift.
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    setSwatches(TOKENS.map(t => [t, cs.getPropertyValue(t).trim()]))
  }, [theme])

  const emailError =
    email.length > 0 && !email.includes('@') ? 'Enter a complete email address.' : undefined

  return (
    <div className="lab">
      <a className="lab__skip" href="#main">Skip to content</a>
      <header className="lab__top">
        <div className="lab__topin">
          <a className="lab__me" href="/">
            <span className="lab__mark" aria-hidden="true">D</span>
            <span>David Martinez</span>
          </a>
          <nav className="lab__links" aria-label="Sections">
            <a href="/#work">Work</a>
            <a href="/components/" aria-current="page">Components</a>
            <a href="/#about">About</a>
            <a href="/#contact">Contact</a>
            <a href="/assets/resume.pdf">Resume</a>
          </nav>
        </div>
      </header>

      <main className="lab__main" id="main">
        <p className="lab__kicker">React &middot; TypeScript &middot; No UI library</p>
        <h1 className="lab__h1">Component lab</h1>
        <p className="lab__lede">
          A small set of accessible components. Every colour, space and radius comes from
          one token file, so flipping the switch below restyles all of it without a single
          component knowing that happened. Try it with the keyboard: everything here is
          reachable by tab, and the list below is fully operable by arrow keys.
        </p>

        <div className="lab__theme">
          <Switch
            checked={theme === 'dark'}
            onChange={(on) => { setPinned(true); setTheme(on ? 'dark' : 'light') }}
            label="Dark theme"
            description="Starts from your system setting and follows it until you touch this."
          />
        </div>

        <section className="lab__sec">
          <h2 className="lab__h2">Tokens</h2>
          <p className="lab__note">Read back off the live document, so these are the computed values.</p>
          <ul className="sw">
            {swatches.map(([name, val]) => (
              <li className="sw__c" key={name}>
                <span className="sw__chip" style={{ background: val }} />
                <span className="sw__meta"><b>{name}</b><span>{val}</span></span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lab__sec">
          <h2 className="lab__h2">Multi-select</h2>
          <p className="lab__note lab__note--lead">
            Arrow keys move, Enter toggles, Escape closes, Backspace on an empty box removes
            the last chip. The option order is frozen while the list is open, so a row never
            moves under your cursor mid-click.
          </p>
          <div className="lab__demo">
            <MultiSelect
              label="Locales"
              options={LOCALES}
              value={locales}
              onChange={setLocales}
              reorderSelected={reorder}
              placeholder="Add a locale..."
            />
            <div className="lab__opt">
              <Switch
                checked={reorder}
                onChange={setReorder}
                label="Move selected to the top"
                description="Useful in a long list, disorienting in a short one. Off by default."
              />
            </div>
          </div>
        </section>

        <section className="lab__sec">
          <h2 className="lab__h2">Buttons</h2>
          <p className="lab__note lab__note--lead">
            The first four are swatches: they show the variants and do nothing when
            clicked. <b>Save changes</b> and <b>Open dialog</b> below are the live ones.
          </p>
          <div className="lab__row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1600) }}
            >
              Save changes
            </Button>
          </div>
          <p className="lab__note">
            <b>Save changes</b> is live: it holds a spinner for about a second and a half.
            It keeps its width so the row does not jump, and stays focusable while busy
            rather than disappearing from the tab order. <b>Disabled</b> is deliberately
            unclickable, but it still takes keyboard focus, because a control that vanishes
            from the tab order cannot tell anyone why it is unavailable.
          </p>
        </section>

        <section className="lab__sec">
          <h2 className="lab__h2">Field</h2>
          <p className="lab__note lab__note--lead">Live. Type something without an @ in it.</p>
          <div className="lab__demo lab__demo--narrow">
            <Field
              label="Email"
              type="email"
              required
              description="We reply from a real address, not a no-reply."
              placeholder="you@example.com"
              value={email}
              error={emailError}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="lab__note">
            The description and the error are both wired to the input, so a screen reader
            hears them as part of the field instead of as loose text nearby.
          </p>
        </section>

        <section className="lab__sec">
          <h2 className="lab__h2">Dialog</h2>
          <p className="lab__note lab__note--lead">Live. Open it and try Tab and Escape.</p>
          <Button variant="secondary" onClick={() => setDialog(true)}>Open dialog</Button>
          <p className="lab__note">
            Focus moves in on open, cycles inside on Tab, and returns to the button that
            opened it on close. Escape closes. The page behind does not scroll.
          </p>
        </section>
      </main>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Focus goes back where it came from"
        description="Close this with Escape, the scrim, or the button. Either way focus returns to Open dialog, which is where a keyboard user left off."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setDialog(false)}>Got it</Button>
          </>
        }
      />
    </div>
  )
}
