# dmartinez10.github.io

My portfolio: experience, the shipped-work log, projects, coursework, and about.

**Live:** https://dmartinez10.github.io

## What's here

A single static page. No framework, no build step, no dependencies beyond three
Google Fonts.

```
index.html      the whole page
styles.css      design tokens + layout
main.js         section indicator, scroll reveals, log filters
assets/         favicon
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

## Screenshots

`assets/shots/` holds the Sollo App Store panels, resized to 640px wide WebP
(300KB for all six). To swap or add one, drop a file in and point a `.shot`
button's `data-src` and its `<img src>` at it.

## Editing

Content lives directly in `index.html`, section by section: `#experience`,
`#log`, `#projects`, `#education`, `#about`, `#contact`. To add a log entry, copy
an existing `.log__row` and set its `data-kind` to `shipped`, `fixed`, `retired`,
or `reviewed`. The `.log__delta` paragraph is optional; include it only when
there's a real number.

## License

Code is MIT. The written content and my likeness are not, so please don't reuse the
copy as your own.
