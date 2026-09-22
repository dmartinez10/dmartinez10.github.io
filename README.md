# dmartinez10.github.io

My portfolio: selected work, case studies, and how to reach me.

**Live:** https://dmartinez10.github.io

## What's here

A static site. No framework, no build step, and no JavaScript on any page but the
component lab, so nothing on the page can fail to render. Every nav item opens a
page of its own.

```
index.html          home: who I am, the directory sign, one card per project
work/index.html     Work: every project in full, each with Open buttons
work/*.html         one story per project; claude.html is how I work with Claude
about/index.html    About: photos, story, skills, the route so far
contact/index.html  Contact: the exit sign
styles.css          design tokens, layout, shared components, the lightbox
case.css            story layout and the interactive pieces, loaded after styles.css
component-lab/      React + TypeScript source for the component lab
components/         its built output, committed, served at /components/
assets/bg/          the background: route lines, and signs for wide screens
assets/logos/       each project's own mark, used in place of a letter
assets/centline/, assets/sollo/, assets/commu/   story images, WebP
assets/me/          the two photos
assets/og/          the 1200x630 share card
assets/resume.pdf   the public resume
tools/              sources for the share card and the resume, not part of the page
.nojekyll           tells GitHub Pages to serve the files as-is
```

The pages are plain HTML and CSS. The interaction on them is HTML too: radio
buttons and `:has()` do the choosing (pick an option, step a load through its
stages, set the air under a title), and the `popover` attribute opens every image
larger, with Escape and a click outside to close it. The component lab is the one
place React earns its keep, because the thing it demonstrates is interaction.

## Running it locally

```bash
python3 -m http.server 8000
```

## Design

**Wayfinding.** Almost everything I build is for someone lost inside a system
somebody else designed: Japanese paperwork, a campus that commuters never get
into, a freight load's paperwork between delivered and paid. So the site borrows the
language of signs, and the metaphor carries real information rather than
decoration:

- **The hero is a directory sign.** Navy panel, a yellow "you are here", and one
  row per project that opens its page. It is navigation, not a picture of navigation.
- **Each project is a line with its own colour and its own logo** (Centline, Sollo,
  CommU, the lab, and Claude as the interchange), and **each story is a stop on it**
  (C1, S1 to S4, U1, L1, H1). A story page carries the same marker and colour, so
  you can tell which project you are in from any page.
- **The background is a map of my head.** Faint route lines in each project's
  colour run behind every page. Where the margins are empty, on screens 1440 wide
  and up, signs from my own life sit in them like stickers: I-80, a parking P, an
  Iowa City guide sign, a Tokyo station board, a truck crossing, ¡Hola! and
  ようこそ. The tints are light enough that grey text passes AA over any of them.
- **The yellow ring around my photo** is the map's "you are here".
- **Experience is a strip map.** Travelled track is solid, the rest is dashed, and
  a marker sits just past the internship. That marker is dated: it is right until
  May 2027, then it moves.
- **Contact is the exit sign**, the same navy as the directory, so the page
  begins and ends on the same object.

Type: **Overpass**, from the lettering on US highway signs, for headings and
labels, and **Atkinson Hyperlegible**, drawn for readers with low vision, for text.
Atkinson draws zero with a slash on purpose, so large numbers are set in Overpass.
Colour: concrete ground (#F2F3EF), white panels, sign navy (#14224A), one safety
yellow (#FFC72C), and five line colours that each pass AA with white type.

The one moment of motion is the directory rows flipping in on load like a
departure board, then the marker pinging. Nothing else moves by itself, and
reduced motion turns both off.

Earlier versions were a heads-up display, cyan on black with a radial navigator,
and then a plain editorial page. The first had chrome louder than the work; the
second had nothing of me in it. This one tries to put the personality in the type,
colour and structure while keeping every element doing a job.

### Rules that hold

- **Every text colour passes WCAG 2.2 AA** on the surface it sits on. The
  palette is audited as a whole rather than screen by screen, so a token that
  fails is fixed once.
- **No `auto-fit` where the item count is fixed.** The four measurements and the
  six route stops use explicit columns, so they never leave an orphan.
- **Every grid column that can hold a scroller is `minmax(0, ...)`.** A wide
  strip otherwise sizes the column to its full scroll width and the page overflows
  on a phone.
- **A popover never lives inside something that can be hidden.** A popover
  inside `display:none` never renders, so lightboxes are written at the end of
  `<main>`, outside the tab panels.
- **A screen-reader-only legend opts out of the chip row's legend rule**, or it
  becomes an invisible full-width box that scrolls the page sideways.
- **Centline copy names no technology or provider but Claude Code**, shows only
  made-up names, claims no users, and says nothing about how it stores data.
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

The home page stays scannable; the depth lives one click away in `work/`. Each
story loads `styles.css` for the tokens and chrome, then `case.css`.

The house style, taken from what design recruiters actually read:

- **Role, constraint and outcome first**, in the `.brief` block, before any
  figure.
- **Show a decision that changed or got cut.** Centline cut its whole cost side;
  the Sollo navigation was recommended, built, and parked sixteen days later.
- **Numbers come from source, never from a doc.** Centline's are the ones verified
  on 21 September 2026; Sollo's are checked against the work log.
- **Something to try on every story.** A choice between the options I drew, a
  sketch of the real control, or a value you can set, then what I actually did.
- **Every image opens larger**, and every Centline caption says its names and
  numbers are made up.
- 800 to 1,500 words of body.

| File | Project | What it demonstrates |
|---|---|---|
| `work/centline.html` | Centline | How I work: every change drawn as options, picked, written down, then built, checked and walked on a phone. The cost side that got cut, the packet that will not pretend it is ready, and the rules held by tests. |
| `work/sollo-redesign.html` | Sollo | Exploring the navigation on a design canvas in three turns under fixed accessibility rules, building it, and cutting it to one surface sixteen days later. Closes on one number drawn four ways. |
| `work/sollo-design-system.html` | Sollo | Refusing a spec on measurement, and catching my own test that would have locked in an accessibility miss. |
| `work/sollo-nine-locales.html` | Sollo | Internationalization as a design constraint, including a defect I shipped and the guard I scoped narrow on purpose. |
| `work/sollo-breadcrumb.html` | Sollo | State and honesty. Why a breadcrumb must return to a screen rather than open a copy, and why an invented route is worse than none. |
| `work/commu.html` | CommU | Research. Five interviews, three findings, and the one that changed the build. |
| `work/claude.html` | How I work with Claude | Options before answers, one agent per job, decisions written down, and looking at the real screen. |

To add one, copy a story, replace the sections, set the project's line class on
`<main>` and its stop code in the kicker, then add it to `work/index.html` and a
card to `index.html`, each with an Open button.

## Editing

Home cards are `article.pcard` in `index.html`; the full list is `article.proj` in
`work/index.html`, each with its line class (`proj--c`, `proj--s` and so on) and a
`.logo` tile from `assets/logos/`. A new project needs its logo, a colour token in
`styles.css` that passes AA with white type, a row on the directory sign, and an
Open button everywhere it appears.

A picture that opens larger is a `.zoom` button with `popovertarget`, pointing at a
`.lightbox` popover written at the end of `<main>`.

## License

Code is MIT. The written content and my likeness are not, so please don't reuse
the copy as your own.
