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
    if (!motionOn()) document.querySelectorAll('[data-arrive]').forEach((el) => el.classList.add('is-in'));
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
  // the slash key jumps to the search, the way the palettes it borrows from do
  addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      const r = kit.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { e.preventDefault(); input.focus(); }
    }
  });
  apply();
}

// ── panels lean toward the pointer on a critically damped spring ──
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
