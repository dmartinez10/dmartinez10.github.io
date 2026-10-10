# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers filling product design and UX engineer roles
(confirmed 2026-10-10). They skim many portfolios in a sitting, often on a laptop,
sometimes from a link on a phone, and decide in seconds whether to read on.

## Product Purpose

The portfolio of David Martinez, product designer and UX engineer, informatics
(HCI) at the University of Iowa, graduating May 2027. It exists to get him
interviews for product design and UX engineer roles.

Success: within 30 seconds a recruiter is sure that **he designs and builds: one
person, from Figma to shipped code, with real numbers** (confirmed 2026-10-10).

## Positioning

The site is itself the proof of the "build" half: a designer's portfolio that is
also an engineered piece of software. The wayfinding thread (people lost inside
systems not designed for them: Japanese paperwork, commuter students, a freight
load between delivered and paid) is the reason underneath, not the headline.

## Operating Context

- Served by GitHub Pages from `main` at https://portfolio.centline.co. Nothing
  goes to `main` or live without David's word.
- Run locally with `python3 -m http.server 8000`.
- Shared as a link on LinkedIn, Slack and X; the share card is
  `assets/og/share-card.png` (1200x630), sourced from `tools/og-card.html`.

## Capabilities and Constraints

- Pages: Home, Work (Centline, Sollo, CommU, How I work with Claude, and four
  old Sollo URLs that forward to `work/sollo.html`), Skills, About, Contact, the
  Component lab (`components/`, built from `component-lab/`), and 404.
- Static HTML and CSS, no framework, no build step. **JavaScript is allowed
  from the `future` redesign on** (2026-10-10): libraries load from a CDN, no
  build step if at all possible. The footer line that says there is no
  JavaScript must stay true to what ships.
- Heavy effects load after the content shows; phones get lighter versions.
- **Copy (decided 2026-10-10):** numbers, facts, project names and the order of
  projects stay exactly as written. Headings and short lines may be rewritten to
  fit the new direction, each rewrite approved by David before it ships.
- "You are here. Where to?" and "End of the line" are kept.

## Brand Commitments

- Centline, his trucking app, is the root of the identity: the site sits on
  `portfolio.centline.co`.
- Type commitments in use: Overpass (from American highway sign lettering) and
  Atkinson Hyperlegible (drawn for readers with low vision).
- Each project has its own line colour and logo (`assets/logos/`), and each
  story is a stop on that line (C1, S1, U1, L1, H1).
- Every way out is a button, never a bare text link (2026-09-22: "i hate text
  link, its not clear at all").
- Direction asked for on 2026-10-10: futuristic tech tied to the highway theme;
  a night highway, glowing neon centre line, HUD overlays, speed, light trails.
  Premium sci-fi product site, not a cheesy video game.

## Evidence on Hand

- Centline: 5,888 tests, 144 merged pull requests (verified 2026-09-21).
- Sollo: 70+ pull requests merged in eight weeks, 2,949 tests green at
  handoff, 9 languages shipped, core browse flow 1,033ms to 125ms.
- CommU: five interviews, three findings.
- Images: `assets/centline/`, `assets/sollo/`, `assets/commu/`, `assets/lab/`,
  photos in `assets/me/`, resume at `assets/resume.pdf`.
- Every Centline caption says its names and numbers are made up.
- No testimonials, client logos or press exist; none may be invented.

## Product Principles

1. Prove "designs and builds" in the first screen, then back it with numbers.
2. The skimmer wins: nothing a recruiter needs waits on an effect.
3. Effects are earned craft, never noise: every motion carries the road
   metaphor or tells you where you are.
4. Numbers come from source, never from a doc, and never get rounded up for
   drama.
5. The words are his; a rewrite is proposed, never slipped in.

## Accessibility & Inclusion

- Everything works by keyboard and screen reader.
- Text stays readable over every effect; body text passes WCAG 2.2 AA.
- A visible motion toggle, and the calm version by default for anyone with
  reduced motion turned on.
