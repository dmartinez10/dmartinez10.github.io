# The future redesign: working notes

Development notes for the `future` branch. Product truth is in `PRODUCT.md`.

## References (Taste Skill, 2026-10-10)

David had no reference sites; three were proposed and he chose the blend (q1.a).

- **Linear** (linear.app): premium through restraint. Near-black ground, one
  off-white, hairlines at about 7% white, no glow; left-aligned two-line display
  type; content blurs into focus on load.
- **Raycast** (raycast.com): reads as a tool, not a brochure. Mono microcopy, one
  accent, glass pills, an extension store that sells the plugins. The model for
  showing the Claude kit.
- **Igloo Inc** (igloo.inc) and **Lusion** (lusion.co): cinematic. A full-screen
  3D scene is the hero, scroll moves the camera, thin HUD type floats on top.
  The model for the night highway.

The blend: Igloo's 3D road in the hero and the scroll, Linear's calm wherever
there is reading, the Claude kit shown like Raycast's store.

Design read: a designer and engineer's portfolio for recruiters, in a cinematic
night-highway language, built in plain HTML and CSS with Three.js from a CDN.
Dials: variance 7, motion 8, density 3. One theme, night. One accent, the centre
line yellow `#FFC72C`.

## Homepage shape (Impeccable shape, 2026-10-10)

- **Job and audience:** recruiters for product design and UX engineer roles.
  Visitor mode: Experience; the work leads from the first viewport.
- **Outcome and proof:** in 30 seconds, "he designs and builds". Proof is the
  site working well, the real numbers, and the Claude kit from `work/claude.html`.
- **Sequence:** hero (the picked concept) → the projects, each arriving as a
  glowing sign or HUD panel while the camera drives → the numbers as gauges →
  the Claude kit as a command palette of his agents, skills and connectors
  (proposed, content from `work/claude.html` only) → About → the footer, where
  the road fades out at "End of the line".
- **Boundaries:** every number, fact, project name and the project order stay.
  Headings and short lines may be rewritten, each with David's yes. Every way
  out stays a button. Nothing goes to `main` or live without his word.
- **States:** motion on, motion off (the calm version, default under reduced
  motion), phone (a lighter road, flat signs), no WebGL (a still road image),
  slow network (content first, effects after).
- **Constraints:** no build step, libraries from a CDN, keyboard and screen
  reader complete, text readable over every effect, the footer's "how it is
  built" line kept true.

## Hero concepts (Figma, 2026-10-10)

https://www.figma.com/design/fq28Zlevw1VMspRphIcj2O

- **A, Words on the road:** the headline painted on the road like a lane
  marking; "Where to?" as a sat-nav card on the glass.
- **B, Windshield HUD:** the headline projected on the glass in HUD brackets,
  light trails streaming past, a 70+ speedometer, the menu as a sat-nav strip.
- **C, Signs rushing in:** the projects as glowing signs along the shoulder,
  nearest first; the hero is the menu.

**Picked (2026-10-10): C, as floating signs with no poles**, each casting a soft
glow on the road. **The Claude kit section is in** (q2.a).

Open: the proposed sublines (below).

Proposed rewrites waiting for his yes:
- A and C subline: "Product designer and UX engineer. 70+ pull requests merged
  in eight weeks at Sollo in Tokyo."
- B subline: "Product designer and UX engineer, from Figma to shipped code."

## Motion plan (Emil's find-animation-opportunities, 2026-10-10)

Approved (q1.a): every item marked Keep; no cursor trail. Subline approved (q2.a).

1. Three.js night road in the hero, after the words; pointer drift on a critically damped spring.
2. The headline decodes once per visit, under 0.6s; screen readers get the plain text.
3. Floating signs, no poles: a slow bob, arriving from down the road; on scroll they fly past and open into their project.
4. The camera drives with the scroll; scrolling itself is never hijacked.
5. A short light-streak page transition, about 0.35s.
6. Project cards: tilt and glowing edge on hover, one scan-line sweep, fine pointers only.
7. Numbers count up once, about 0.9s, the final value already in the page.
8. The road fades out at "End of the line".
10. Images zoom open from where they were tapped.
11. Story try-it pieces cross-fade between choices.
12. Buttons press in, 0.16s.
13. The agent roster slides open.

Rejected: opening and closing the Claude kit palette (keyboard, frequent); hover
glow on the top menu (frequent); moving numbers or text while being read.

## Built so far

- Hero (2026-10-10): `index.html` hero, `future.css`, `js/hero.js`, `js/road.js`.
  Motion switch in the header, calm by default under reduced motion. The facts
  list moved to About on the home page, unchanged; the portrait stays on About.
