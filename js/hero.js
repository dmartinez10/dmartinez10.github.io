// The hero: the headline's decode, the signs leaning
// toward the pointer, and the road, loaded once the words are on screen.
// Everything here is an enhancement: the page reads the same without it.

const root = document.documentElement;
const motionOn = () => root.dataset.motion === 'on';

// The motion switch lives in site.js, on every page.

// ── the decode: the headline boots like a HUD, once per visit ──
const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789/<>_';
function decode(el, { total = 560 } = {}) {
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
    for (const c of chars) {
      if (t >= c.at) {
        if (c.g.isConnected) { c.g.remove(); c.ch.classList.remove('is-hidden'); }
      } else {
        open++;
        // change the scrambled glyph about every 40ms, not every frame
        if (now - last > 40) c.g.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
    }
    if (now - last > 40) last = now;
    if (open) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if (root.classList.contains('boot') && motionOn()) {
  const h = document.querySelector('.road__h');
  if (h) decode(h);
  try { sessionStorage.setItem('booted', '1'); } catch {}
}

// ── the signs lean toward the pointer, with a spring, desktop only ──
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const wide = matchMedia('(min-width: 52.01rem)');
for (const a of document.querySelectorAll('.sign a')) {
  let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, prev = 0;
  // critically damped: it settles without overshoot
  const k = 170, c = 2 * Math.sqrt(k);
  const step = (now) => {
    const dt = Math.min((now - prev) / 1000, 1 / 30);
    prev = now;
    vx += (k * (tx - x) - c * vx) * dt; x += vx * dt;
    vy += (k * (ty - y) - c * vy) * dt; y += vy * dt;
    a.style.transform = `rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
    const settled = Math.abs(tx - x) < 0.01 && Math.abs(ty - y) < 0.01 && Math.abs(vx) + Math.abs(vy) < 0.01;
    raf = settled ? 0 : requestAnimationFrame(step);
    if (settled && tx === 0 && ty === 0) a.style.transform = '';
  };
  const go = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(step); } };
  a.addEventListener('pointermove', (e) => {
    if (!fine.matches || !wide.matches || !motionOn()) return;
    const r = a.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 10;
    ty = -((e.clientY - r.top) / r.height - 0.5) * 8;
    go();
  });
  a.addEventListener('pointerleave', () => { tx = 0; ty = 0; go(); });
}

// ── the road, after the words ──
function canWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}
const saveData = navigator.connection && navigator.connection.saveData;
function loadRoad() {
  const canvas = document.querySelector('.road__gl');
  if (!canvas || saveData || !canWebGL()) return;
  import('./road.js').then((m) => m.start(canvas)).catch(() => {});
}
const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
if (document.readyState === 'complete') later(loadRoad, { timeout: 1500 });
else addEventListener('load', () => later(loadRoad, { timeout: 1500 }), { once: true });

// ── the display wheel ──
// One sign faces you and the rest stand round a vertical axis. Drag or swipe
// it, point at or tap a side card, use the dots, or the arrow keys. A flick is
// thrown: the release velocity projects where it lands, then a spring settles
// it there. With motion off it turns at once.
const signsEl = document.querySelector('.signs');
if (signsEl) {
signsEl.classList.add('has-wheel');
const list = document.querySelector('.signs__list');
const cards = [...list.querySelectorAll('.sign')];
const N = cards.length, STEP = 360 / N;

// dots under the wheel
const dots = document.createElement('div');
dots.className = 'wheel__dots';
dots.setAttribute('aria-label', 'Choose a sign');
cards.forEach((li, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', li.querySelector('.sign__name').textContent);
  b.addEventListener('click', () => goTo(i));
  dots.append(b);
});
signsEl.append(dots);

let angle = 0, target = 0, vel = 0, raf = 0, prev = 0, dragging = false;
const radius = () => cards[0].querySelector('a').offsetWidth * 0.98;

function layout() {
  const R = radius();
  list.style.setProperty('transform', `translateZ(${-R}px) rotateY(${-angle}deg)`, 'important');
  cards.forEach((li, i) => {
    const a = i * STEP;
    li.style.setProperty('transform', `rotateY(${a}deg) translateZ(${R}px)`, 'important');
    const d = (((a - angle) % 360) + 540) % 360 - 180; // -180..180 from the front
    const face = Math.cos((d * Math.PI) / 180);
    li.style.opacity = String(Math.max(0, 0.15 + 0.85 * face));
    li.querySelector('a').tabIndex = Math.abs(d) < STEP / 2 ? 0 : -1;
    li.style.pointerEvents = face > 0.2 ? '' : 'none';
  });
  const front = ((Math.round(angle / STEP) % N) + N) % N;
  [...dots.children].forEach((b, i) => b.setAttribute('aria-current', String(i === front)));
}

// a spring toward the target: lightly under-damped, so a throw settles with a hint of give
function tick(now) {
  const dt = Math.min((now - prev) / 1000, 1 / 30); prev = now;
  if (!dragging) {
    const k = 90, c = 2 * 0.86 * Math.sqrt(k);
    vel += (k * (target - angle) - c * vel) * dt;
    angle += vel * dt;
  }
  layout();
  if (dragging || Math.abs(target - angle) > 0.02 || Math.abs(vel) > 0.02) raf = requestAnimationFrame(tick);
  else { angle = target; vel = 0; layout(); raf = 0; }
}
const run = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(tick); } };

function goTo(i) {
  // the shortest way round to card i
  const cur = Math.round(angle / STEP);
  let k = i - (((cur % N) + N) % N);
  if (k > N / 2) k -= N; if (k < -N / 2) k += N;
  target = (cur + k) * STEP;
  if (!motionOn()) { angle = target; vel = 0; layout(); return; }
  run();
}

// drag and swipe, 1:1, with the release velocity handed to the spring
let x0 = 0, a0 = 0, hist = [], moved = false;
list.addEventListener('pointerdown', (e) => {
  dragging = true; moved = false; x0 = e.clientX; a0 = angle; hist = [[e.clientX, e.timeStamp]];
  list.setPointerCapture(e.pointerId); list.classList.add('is-dragging'); run();
});
list.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - x0;
  if (Math.abs(dx) > 8) moved = true;
  const R = radius();
  angle = a0 - (dx / (2 * Math.PI * R)) * 360;
  hist.push([e.clientX, e.timeStamp]); if (hist.length > 6) hist.shift();
});
function release() {
  if (!dragging) return;
  dragging = false; list.classList.remove('is-dragging');
  const [xa, ta] = hist[0], [xb, tb] = hist[hist.length - 1];
  const vpx = tb > ta ? ((xb - xa) / (tb - ta)) * 1000 : 0;       // px per second
  const R = radius();
  const vdeg = -(vpx / (2 * Math.PI * R)) * 360;                   // degrees per second
  const projected = angle + (vdeg / 1000) * 0.995 / (1 - 0.995);    // where the throw would land
  target = Math.round(projected / STEP) * STEP;
  vel = vdeg; run();
}
list.addEventListener('pointerup', release);
list.addEventListener('pointercancel', release);
// a tap that did not drag is a click; on a side card it turns the wheel instead of leaving
list.addEventListener('click', (e) => {
  const li = e.target.closest('.sign'); if (!li) return;
  if (moved) { e.preventDefault(); return; }
  const i = cards.indexOf(li);
  const front = ((Math.round(angle / STEP) % N) + N) % N;
  if (i !== front) { e.preventDefault(); goTo(i); }
}, true);
// pointing at a side card turns to it, after a short pause, on a mouse only
let intent = 0;
cards.forEach((li, i) => {
  const a = li.querySelector('a');
  a.addEventListener('pointerenter', () => {
    if (!fine.matches || dragging) return;
    clearTimeout(intent); intent = setTimeout(() => goTo(i), 220);
  });
  a.addEventListener('pointerleave', () => clearTimeout(intent));
  a.addEventListener('focus', () => goTo(i));
});
addEventListener('keydown', (e) => {
  if (!list.contains(document.activeElement)) return;
  const front = ((Math.round(angle / STEP) % N) + N) % N;
  if (e.key === 'ArrowRight') { e.preventDefault(); goTo((front + 1) % N); cards[(front + 1) % N].querySelector('a').focus({ preventScroll: true }); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); goTo((front - 1 + N) % N); cards[(front - 1 + N) % N].querySelector('a').focus({ preventScroll: true }); }
});
new ResizeObserver(layout).observe(list.parentElement);
layout();

}
