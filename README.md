# dmartinez10.github.io

My portfolio: experience, the shipped-work log, projects, coursework, and about.

**Live:** https://dmartinez10.github.io

## What's here

A single static page. No framework, no build step, no dependencies beyond three
Google Fonts.

```
index.html      the landing page
work/           one case study per file, linked from its project card
case.css        case study layout (loaded after styles.css)
styles.css      design tokens + layout
main.js         section indicator, scroll reveals, log filters
assets/og/      the 1200x630 share card
assets/shots/   Sollo App Store panels, WebP
tools/          source for the share card, not part of the page
.nojekyll       tells GitHub Pages to serve the files as-is
```

## Running it locally

Any static server works:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Design notes

The direction is a heads-up display. The work is about people who are lost inside
somebody else's system, and a HUD is the instrument that tells you where you are,
so the chrome is a wayfinding instrument and the content is the payload.

Chrome glows. Text does not: every text colour is flat and sits at WCAG AA or
better on the surface it is on.

- **Display:** Chakra Petch, angular and technical
- **Body:** IBM Plex Sans
- **Readouts:** IBM Plex Mono, for dates, telemetry and labels
- **Accent:** cyan for the instrument, gold for measurements

The radial navigator in the hero is the signature. Nodes are real links, so it is
keyboard navigable, and the text nav in the status bar does the same job for
anyone who would rather not use it.

Content is **visible by default**. `main.js` adds an `.anim` class to `<html>`
only once it knows it can drive the animation, so a script failure can never
leave the page blank.

## The share card

`assets/og/share-card.png` is what LinkedIn, Slack and X show when the link is
posted. It is **1200x630**, and that matters: those platforms render a link
preview at roughly 1.91:1, so pointing `og:image` at a tall phone screenshot
crops it to an unreadable sliver with no name on it. This site did exactly that
until 2026-08-26.

`tools/og-card.html` is the source. It renders at exactly 1200x630 using the
same tokens as `styles.css`. To change the card, edit that file and re-render:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --force-device-scale-factor=1 \
  --virtual-time-budget=12000 \
  --screenshot=assets/og/share-card.png \
  tools/og-card.html
```

Keep it PNG. Keep `og:image:width` and `og:image:height` in `index.html` in step
with the real file, and after changing it, re-scrape the URL in LinkedIn's Post
Inspector, because the preview is cached per URL.

## Screenshots

`assets/shots/` holds the Sollo App Store panels, resized to 640px wide WebP
(300KB for all six). To swap or add one, drop a file in and point a `.shot`
button's `data-src` and its `<img src>` at it.

## Case studies

The landing page stays scannable; the depth lives one click away in `work/`.
Each case study is a standalone file that loads `styles.css` for the tokens and
the HUD chrome, then `case.css` for the prose and figure layout. No JavaScript,
so the content cannot fail to render.

The house style, taken from what design recruiters actually read:

- **Role, constraint and outcome first**, in the `.brief` block, before any
  figure. Someone decides in about five seconds whether to keep scrolling.
- **Show a decision that changed or got cut.** The Centline study covers a tab
  that was removed and a visual system that was replaced, and says why.
- **Numbers come from source, never from a doc.** Every figure in the Centline
  study is pinned by a test or read out of the code.
- 800 to 1,500 words. Centline runs about 1,470.

To add one, copy `work/centline.html`, replace the sections, and add a
`Read the case study` link to that project's `.proj__links` in `index.html`.

## Editing

Content lives directly in `index.html`, section by section: `#experience`,
`#log`, `#projects`, `#education`, `#about`, `#contact`. To add a log entry, copy
an existing `.log__row` and set its `data-kind` to `shipped`, `fixed`, `retired`,
or `reviewed`. The `.log__delta` paragraph is optional; include it only when
there's a real number.

## License

Code is MIT. The written content and my likeness are not, so please don't reuse the
copy as your own.
