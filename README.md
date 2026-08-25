# dmartinez10.github.io

My portfolio — experience, the shipped-work log, projects, coursework, and about.

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

The direction is transit wayfinding — signage navy on a paper ground, with one
accent borrowed from the green of an exit sign. Everything on the site was built
for someone trying to find the way out of a system that wasn't designed for them,
so the palette says that too.

- **Display:** Archivo — a grotesque with signage lineage
- **Body:** Newsreader — a serif made for reading on screen
- **Utility:** IBM Plex Mono — dates, measurements, labels

The measurements in *The log* are real, captured on device, and carried over from
my working log. Nothing there is rounded up.

## Editing

Content lives directly in `index.html`, section by section — `#experience`,
`#log`, `#projects`, `#education`, `#about`, `#contact`. To add a log entry, copy
an existing `.log__row` and set its `data-kind` to `shipped`, `fixed`, `retired`,
or `reviewed`. The `.log__delta` paragraph is optional; include it only when
there's a real number.

## License

Code is MIT. The written content and my likeness are not — please don't reuse the
copy as your own.
