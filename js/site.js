// Every page: the motion switch, panels arriving as you scroll, numbers
// that count up once, and the page-to-page warp held back when motion is off.
// All of it is an enhancement; the page reads the same without it.

const root = document.documentElement;
const motionOn = () => root.dataset.motion === 'on';

// ── the motion switch ──
const sw = document.querySelector('.mo');
if (sw) {
  sw.hidden = false;
  const sync = () => sw.setAttribute('aria-pressed', String(motionOn()));
  sync();
  sw.addEventListener('click', () => {
    root.dataset.motion = motionOn() ? 'off' : 'on';
    try { localStorage.setItem('motion', root.dataset.motion); } catch {}
    sync();
    if (!motionOn()) {
      root.classList.remove('js-arrive');
      document.querySelectorAll('[data-arrive]').forEach((el) => el.classList.add('is-in'));
    }
    window.dispatchEvent(new CustomEvent('motionchange'));
  });
}

// ── the warp between pages, only with motion on ──
addEventListener('pageswap', (e) => { if (!motionOn() && e.viewTransition) e.viewTransition.skipTransition(); });
addEventListener('pagereveal', (e) => { if (!motionOn() && e.viewTransition) e.viewTransition.skipTransition(); });

// ── panels arrive up the road, once each ──
const arrivals = document.querySelectorAll('[data-arrive]');
if (arrivals.length && motionOn() && 'IntersectionObserver' in window) {
  root.classList.add('js-arrive');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  arrivals.forEach((el) => io.observe(el));
}

// ── numbers count up like a speedometer, once, ending on the real value ──
const ease = (t) => 1 - Math.pow(1 - t, 4);
function countUp(b) {
  const text = b.textContent.trim();
  const m = text.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!m) return;
  const [, pre, digits, post] = m;
  const target = parseInt(digits.replace(/,/g, ''), 10);
  const commas = digits.includes(',');
  const sr = document.createElement('span');
  sr.className = 'sr';
  sr.textContent = text;
  const shown = document.createElement('span');
  shown.setAttribute('aria-hidden', 'true');
  b.replaceChildren(sr, shown);
  const fmt = (n) => pre + (commas ? n.toLocaleString('en-US') : String(n)) + post;
  const t0 = performance.now(), dur = 900;
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    shown.textContent = fmt(Math.round(target * ease(t)));
    if (t < 1) requestAnimationFrame(step);
  };
  shown.textContent = fmt(0);
  requestAnimationFrame(step);
}
const gauges = document.querySelectorAll('[data-count]');
if (gauges.length && motionOn() && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
  }, { threshold: 0.6 });
  gauges.forEach((el) => io.observe(el));
}

// ── the Claude kit: type to narrow it down ──
const kit = document.querySelector('.kitp');
if (kit) {
  const input = kit.querySelector('.kit__q');
  const items = [...kit.querySelectorAll('.kit__item')];
  const groups = [...kit.querySelectorAll('.kit__group')];
  const count = kit.querySelector('.kit__count');
  const empty = kit.querySelector('.kit__empty');
  input.hidden = false;
  kit.querySelector('.kit__bar').hidden = false;
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let n = 0;
    for (const it of items) {
      const hit = !q || it.textContent.toLowerCase().includes(q);
      it.hidden = !hit;
      if (hit) n++;
    }
    for (const g of groups) g.hidden = !g.querySelector('.kit__item:not([hidden])');
    empty.hidden = n > 0;
    count.textContent = q ? `${n} of ${items.length}` : `${items.length} tools`;
  };
  input.addEventListener('input', apply);
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.value) { input.value = ''; apply(); } });
  apply();
}

// ── panels lean toward the pointer on a critically damped spring ──
for (const el of document.querySelectorAll('.skills li, .moves > li, .exit__panel')) el.setAttribute('data-tilt', '');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
for (const el of document.querySelectorAll('[data-tilt]')) {
  let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, prev = 0;
  const k = 170, c = 2 * Math.sqrt(k);
  const step = (now) => {
    const dt = Math.min((now - prev) / 1000, 1 / 30);
    prev = now;
    vx += (k * (tx - x) - c * vx) * dt; x += vx * dt;
    vy += (k * (ty - y) - c * vy) * dt; y += vy * dt;
    el.style.transform = `perspective(1100px) rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
    const done = Math.abs(tx - x) < 0.01 && Math.abs(ty - y) < 0.01 && Math.abs(vx) + Math.abs(vy) < 0.01;
    raf = done ? 0 : requestAnimationFrame(step);
    if (done && !tx && !ty) el.style.transform = '';
  };
  const go = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(step); } };
  el.addEventListener('pointermove', (e) => {
    if (!fine.matches || !motionOn()) return;
    const r = el.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 5;
    ty = -((e.clientY - r.top) / r.height - 0.5) * 4;
    go();
  });
  el.addEventListener('pointerleave', () => { tx = 0; ty = 0; go(); });
}

// ══ every page gets the road's motion, not only home ══

// the headline decodes once per page per visit, like the HUD on home
const DC_GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789/<>_';
function decodeHeading(el, total = 520) {
  const text = el.textContent;
  const sr = document.createElement('span');
  sr.className = 'sr';
  sr.textContent = text;
  const shown = document.createElement('span');
  shown.setAttribute('aria-hidden', 'true');
  const chars = [];
  for (const word of text.split(/(\s+)/)) {
    if (/^\s+$/.test(word)) { shown.append(word); continue; }
    const w = document.createElement('span');
    w.className = 'dc';
    for (const c of word) {
      const ch = document.createElement('span');
      ch.className = 'ch is-hidden';
      ch.textContent = c;
      const g = document.createElement('i');
      ch.append(g);
      w.append(ch);
      chars.push({ ch, g, at: 0 });
    }
    shown.append(w);
  }
  el.replaceChildren(sr, shown);
  el.classList.add('is-decoding');
  chars.forEach((c, i) => { c.at = (i / chars.length) * total * 0.7 + Math.random() * total * 0.3; });
  const start = performance.now();
  let last = 0;
  const tick = (now) => {
    const t = now - start;
    let open = 0;
    const swap = now - last > 40;
    for (const c of chars) {
      if (t >= c.at) { if (c.g.isConnected) { c.g.remove(); c.ch.classList.remove('is-hidden'); } }
      else { open++; if (swap) c.g.textContent = DC_GLYPHS[(Math.random() * DC_GLYPHS.length) | 0]; }
    }
    if (swap) last = now;
    if (open) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
if (root.classList.contains('dc-page')) {
  // the home headline has its own boot in hero.js
  const h = document.querySelector('main h1:not(.road__h)');
  if (h && motionOn()) decodeHeading(h);
  try { sessionStorage.setItem('dc:' + location.pathname, '1'); } catch {}
}

// blocks of content arrive up the road as they scroll in, in a short ripple
const ARRIVE = [
  '.proj', '.skills li', '.sec', '.story', '.nums li', '.wins li', '.moves > li',
  '.roster details', '.route li', '.places > *', '.exit__panel', '.shots figure', '.brief',
  '.off li', '.pcard', '.kit__panel', '.aboutme', '.split > *',
].join(',');
const more = [...document.querySelectorAll(ARRIVE)].filter((el) => !el.closest('.road') && !el.hasAttribute('data-arrive'));
if (more.length && motionOn() && 'IntersectionObserver' in window) {
  root.classList.add('js-arrive');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  more.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.matches(ARRIVE));
    el.style.setProperty('--k', String(sibs.indexOf(el) % 4));
    el.setAttribute('data-arrive', '');
    io.observe(el);
  });
}

// every single number on a page counts up once, ending on its real value
const NUMS = '.nums b, .wins b, .readout__row b';
const single = /^[^\d]*[\d,]+[^\d]*$/;
const counters = [...document.querySelectorAll(NUMS)].filter((b) => !b.hasAttribute('data-count') && single.test(b.textContent.trim()));
if (counters.length && motionOn() && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));
}

