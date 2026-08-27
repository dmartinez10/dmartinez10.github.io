# dmartinez10.github.io

My portfolio: selected work, case studies, and how to reach me.

**Live:** https://dmartinez10.github.io

## What's here

A static site. No framework, no build step, and no JavaScript at all, so nothing
on the page can fail to render.

```
index.html       the landing page: work first, then about, experience, contact
styles.css       design tokens, layout, shared components
case.css         case study layout, loaded after styles.css
work/            one case study per file, linked from its project card
component-lab/   React + TypeScript source for the component lab
components/      its built output, committed, served at /components/
assets/og/       the 1200x630 share card
assets/resume.pdf the public resume
tools/           sources for the share card and the resume, not part of the page
.nojekyll        tells GitHub Pages to serve the files as-is
```

The landing page and the case studies are plain HTML and CSS with no JavaScript.
The component lab is the one place React earns its keep, because the thing it
demonstrates is interaction.

## Running it locally

```bash
python3 -m http.server 8000
```

## Design

Editorial and light, and deliberately quiet. The work is meant to be the loudest
thing on the page. A recruiter decides in about five seconds whether to keep
reading, so the landing page opens on what I do and then goes straight to
selected work. Everything else is below that.

- **Type:** Inter throughout, with IBM Plex Mono for small labels and metadata
- **Colour:** white ground, near-black ink, one blue accent used sparingly
- **Rhythm:** a single `.wrap` container and a shared section scaffold, so every
  section aligns to the same measure

Earlier versions of this site were a heads-up display, cyan on black with a
radial navigator. It was fun to build and it was the wrong instrument for the
job: the chrome was louder than the work.

### Rules that hold

- **Every text colour passes WCAG 2.2 AA** on the surface it sits on. The
  palette is audited as a whole rather than screen by screen, so a token that
  fails is fixed once.
- **No `auto-fit` where the item count is fixed.** The four work cards and the
  four measurements use explicit columns, so they never leave an orphan.
- **Grid floors use `minmax(min(Xrem, 100%), 1fr)`** where auto-fit is right. A
  bare `minmax(26rem, ...)` cannot shrink and overflows a 360px phone.
- Verified with no horizontal overflow from **320px to 1920px** on every page.

## The component lab

`/components/` is a small accessible component set in React and TypeScript, with
no UI library. Source is in `component-lab/`, built output is committed so
GitHub Pages can serve it.

The point of it is that **every colour, space and radius comes from one token
file**, so flipping the theme restyles the whole set without a component knowing
it happened. It exists because design-engineer roles screen for exactly this and
a written case study cannot demonstrate it.

```bash
cd component-lab
npm install
npm run dev      # local
npm run build    # type-checks, then writes ../components
```

What each piece is actually demonstrating:

- **MultiSelect**: arrow keys, Home and End, Enter to toggle, Escape to close,
  Backspace to remove the last chip, type-ahead filter, and
  `aria-activedescendant` so a screen reader follows the highlight. The option
  order is frozen while the list is open so a row never moves under the cursor
  mid-click.
- **Dialog**: focus moves in on open, Tab cycles inside it, Escape closes, and
  focus returns to the control that opened it. Body scroll locks.
- **Button**: `aria-disabled` rather than `disabled`, so a disabled control stays
  reachable and can explain itself. The loading state keeps its width.
- **Field**: description and error are both wired into `aria-describedby`, and
  the error is a live region so it is announced when it appears.
- **Switch**: a real checkbox with `role="switch"` under a styled track.

Theme starts from `prefers-color-scheme`, follows the OS until the visitor
touches the switch, and `?theme=dark` or `?theme=light` forces either one.

Both themes are contrast-audited: 22 foreground and background pairs, all
passing WCAG 2.2 AA, tightest 4.85.

## The share card

`assets/og/share-card.png` is what LinkedIn, Slack and X show when the link is
posted. It is **1200x630**, and that matters: those platforms render a link
preview at roughly 1.91:1, so pointing `og:image` at a tall phone screenshot
crops it to an unreadable sliver with no name on it.

`tools/og-card.html` is the source. To change the card, edit that file and
re-render:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --force-device-scale-factor=1 \
  --virtual-time-budget=12000 \
  --screenshot=assets/og/share-card.png \
  tools/og-card.html
```

Keep it PNG, keep `og:image:width` and `og:image:height` in step with the real
file, and re-scrape the URL in LinkedIn's Post Inspector afterwards, because the
preview is cached per URL.

## Case studies

The landing page stays scannable; the depth lives one click away in `work/`.
Each case study loads `styles.css` for the tokens and chrome, then `case.css`.

The house style, taken from what design recruiters actually read:

- **Role, constraint and outcome first**, in the `.brief` block, before any
  figure.
- **Show a decision that changed or got cut.** The Centline study covers a tab
  that was removed and a visual system that was replaced, and says why.
- **Numbers come from source, never from a doc.** Every figure in the Centline
  study is pinned by a test or read out of the code.
- 800 to 1,500 words. Centline runs about 1,470.

To add one, copy `work/centline.html`, replace the sections, and add a
`Read the case study` link to that project's `.card__foot` in `index.html`.

## Editing

Content lives directly in `index.html`. The work cards are `.card` articles in
`#work`; a card with a case study gets `class="card card--live"` so the whole
card becomes the click target.

## License

Code is MIT. The written content and my likeness are not, so please don't reuse
the copy as your own.
