# dmartinez10.github.io

My portfolio: selected work, case studies, and how to reach me.

**Live:** https://portfolio.centline.co

## What's here

A static site. No framework, no build step, and no JavaScript on any page but the
component lab, so nothing on the page can fail to render. Every nav item opens a
page of its own.

```
index.html          home: who I am, the directory sign, one card per project
work/index.html     Work: a short story per project, each with a Tap to learn more button
work/*.html         one page per project; claude.html is how I work with Claude
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
  (C1, S1, U1, L1, H1). A story page carries the same marker and colour, so
  you can tell which project you are in from any page.
- **The background is a map of my head.** Faint route lines in each project's
  colour run behind every page. Where the margins are empty, on screens 1440 wide
  and up, signs from my own life sit in them like stickers: I-80, a parking P, an
  Iowa City guide sign, a Tokyo station board, a truck crossing, ¡Hola! and
  ようこそ, mixed in with what I love: a chip for tech, video games, pickleball, a
  trail, mountains, a road trip, the Chicago Bears and Real Madrid (their colours
  and chants, never a club's logo). The tints are light enough that grey text
  passes AA over any of them. The same signs show on every screen size in the
  Off the clock strip on About.
- **Places I have been are badges on About**, each drawn in its own place's
  language: a station name board for the four Japanese cities, the flag's two
  blue stripes for San Salvador, and a green guide sign for each US city. Add a
  place by copying a badge of the same kind.
- **The yellow ring around my photo** is the map's "you are here".
- **Experience is a strip map.** Travelled track is solid, the rest is dashed, and
  a marker sits just past the internship. That marker is dated: it is right until
  May 2027, then it moves.
- **Contact is the exit sign**, the same navy as the directory, so the page
  begins and ends on the same object.
- **Every nav item is the kind of sign it would be on a road** (2026-09-22, his
  call): guide green for Work, an interchange for Claude, service blue for
  Components, park brown for About, an exit for Contact, and a white regulation
  plate for the Resume. The page you are on wears the safety yellow ring, and the
  signs shrink rather than scroll on a phone. Markup is `a.ns.ns--work` and so on
  inside `nav.nav__links`.
- **The footer is the end of the line**: a navy panel with the road's dashes
  running out, the yellow marker, the four ways to reach me as sign chips, and
  three short columns (where I am, what it is set in, how it is built). It sits
  after `</main>` on every page that carries the site nav.

Type: **Overpass**, from the lettering on US highway signs, for headings and
labels, and **Atkinson Hyperlegible**, drawn for readers with low vision, for text.
Atkinson draws zero with a slash on purpose, so large numbers are set in Overpass.
Colour: warm paper ground (#EFE9DE, concrete #F2F3EF until 2026-09-22, when he
said the white read cold), pale panels (#FBF8F2), sign navy (#14224A), one safety
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
- **A focus ring is never navy on navy.** Inside the footer, the directory sign,
  the exit panel, the terminal and a lightbox, the ring turns safety yellow.
- **Checked with axe-core** (WCAG 2.0, 2.1 and 2.2, A and AA, plus best practice)
  on every page at 1280 and 375: no violations. Text spacing (1.4.12) holds with
  line height 1.5, letter spacing .12em and word spacing .16em forced on.
  Every image carries alt text, and the decorative logos carry `alt=""`.
  Repeated **Tap to learn more** links each name their project to a screen reader.

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

The house style, since 2026-09-22, when I asked for less: "a small story then
there's a button that says tap to learn more ... I feel like we over did it on
information. Let's just keep understandable information on it, that recruiters
would want to see, our biggest flex."

- **Home and Work show a short story and one button per project.** Two sentences
  (what it is, and why I was there), the biggest numbers, and a **Tap to learn
  more** button. No other links in a project entry.
- **One page per project.** Each opens on the same order: a one-line thesis, a
  `.story` panel (**what it is** and **why I was there**), the biggest numbers in
  `.nums`, **What I did** as a short `.did` list, one thing to try, and **the call
  I would make again** with a few pictures in `.shots`.
- **Why I was there comes from me, never inferred.** If it is not on record, ask.
- **Numbers come from source, never from a doc.** Centline's are the ones verified
  on 21 September 2026; Sollo's are checked against the work log.
- **Every image opens larger**, and every Centline caption says its names and
  numbers are made up.
- About 400 words of body. The long versions are in git history before this date.

| File | Project | What it shows |
|---|---|---|
| `work/centline.html` | Centline | My own app, designed and built alone: 5,888 tests, 144 merged pull requests, the cost side I cut, and one button for the moment. |
| `work/sollo.html` | Sollo | The internship: 70+ merged pull requests in eight weeks, nine languages, the navigation drawn in three turns and then cut for the beta. |
| `work/commu.html` | CommU | Five interviews, three findings, and the one answer that changed the build. |
| `work/claude.html` | How I work with Claude | Options before answers, one agent per job, the kit, and what it taught me. |

The four old Sollo pages (`sollo-redesign`, `sollo-design-system`,
`sollo-nine-locales`, `sollo-breadcrumb`) are now one-line forwards to
`sollo.html`, so links already shared keep working.

To add a project, copy a project page, replace the sections, set the project's
line class on `<main>` and its stop code in the kicker, then add it to
`work/index.html` and a card to `index.html`, each with a Tap to learn more button.

## Editing

Home cards are `article.pcard` in `index.html`; the full list is `article.proj` in
`work/index.html`, each with its line class (`proj--c`, `proj--s` and so on) and a
`.logo` tile from `assets/logos/`. A new project needs its logo, a colour token in
`styles.css` that passes AA with white type, a row on the directory sign, and a
Tap to learn more button everywhere it appears.

A picture that opens larger is a `.zoom` button with `popovertarget`, pointing at a
`.lightbox` popover written at the end of `<main>`.

## License

Code is MIT. The written content and my likeness are not, so please don't reuse
the copy as your own.
