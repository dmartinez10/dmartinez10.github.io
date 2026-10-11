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
// With motion off the still road drawn in CSS is the road, so Three.js never
// downloads; switching motion on later loads it then.
let roadLoaded = false;
function maybeRoad() { if (!roadLoaded && motionOn()) { roadLoaded = true; loadRoad(); } }
const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
if (document.readyState === 'complete') later(maybeRoad, { timeout: 1500 });
else addEventListener('load', () => later(maybeRoad, { timeout: 1500 }), { once: true });
addEventListener('motionchange', maybeRoad);

// ── the display wheel ──
// The signs stand round a wheel that turns by itself without end, so no sign
// is first: it rests with one sign square to you, then glides to the next. It
// starts on a random sign. Drag or swipe to spin it; it lands square on the
// sign your throw reaches. Tap a side sign to bring it round; arrow keys step. It holds still
// while you point at it, touch it or tab into it, and with motion off.
// Each sign is projected on its own (perspective inside its own transform),
// not through a nested 3D turn, because Safari draws nested turns wrongly.
// A drag still moves it like a wheel: one sign width is one step.
const signsEl = document.querySelector('.signs');
if (signsEl) {
signsEl.classList.add('has-wheel');
const list = document.querySelector('.signs__list');
const cards = [...list.querySelectorAll('.sign')];
const links = cards.map((li) => li.querySelector('a'));
const N = cards.length, STEP = 360 / N;
list.setAttribute('aria-roledescription', 'wheel');
const hint = document.createElement('p');
hint.className = 'sr';
hint.id = 'wheel-hint';
hint.textContent = 'The wheel holds still while it has focus. Left and right arrow keys turn it.';
signsEl.append(hint);
links.forEach((a) => a.setAttribute('aria-describedby', 'wheel-hint'));

const DWELL = 3200;                      // ms each sign rests square in front
let angle = Math.floor(Math.random() * N) * STEP;   // a random sign first
let vel = 0, raf = 0, prev = 0, R = 0, P = 1100, shown = -1;
let dragging = false, held = false, snapTo = null, nextAt = performance.now() + DWELL, onScreen = true;
const measure = () => { R = links[0].offsetWidth * 0.98; P = Math.max(1100, R * 4); };
const mod = (n) => ((n % N) + N) % N;
const frontOf = (deg) => mod(Math.round(deg / STEP));

function layout() {
  // Cover flow on a loop: the sign in front is flat and square, its neighbours
  // step back and turn gently away, and the far ones fade out. Positions come
  // from a continuous offset, so a glide between signs is smooth.
  const w = links[0].offsetWidth;
  cards.forEach((li, i) => {
    const d = ((((i * STEP - angle) % 360) + 540) % 360) - 180;   // -180..180 from the front
    const o = d / STEP;                                           // signs away from the front
    const a = Math.abs(o), sg = Math.sign(o);
    const x = sg * (Math.min(a, 1) * 0.86 + Math.max(a - 1, 0) * 0.34) * w;
    const z = -Math.min(a, 3) * 0.9 * w;
    const turn = -sg * Math.min(a, 1) * 32;
    li.style.setProperty('transform', `perspective(${P}px) translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${turn.toFixed(2)}deg)`, 'important');
    li.style.zIndex = String(Math.round(100 - a * 20));
    const op = a <= 1 ? 1 - 0.55 * a : a <= 2 ? 0.45 - 0.45 * (a - 1) : 0;
    li.style.opacity = String(Math.max(0, op).toFixed(3));
    li.style.pointerEvents = a < 1.6 ? '' : 'none';
  });
  const front = frontOf(angle);
  if (front !== shown) { shown = front; links.forEach((a, i) => { a.tabIndex = i === front ? 0 : -1; }); }
}

function tick(now) {
  const dt = Math.min((now - prev) / 1000, 1 / 30); prev = now;
  if (!dragging) {
    // after its rest, the wheel moves on to the next sign
    if (snapTo === null && !held && motionOn() && now >= nextAt) snapTo = (Math.round(angle / STEP) + 1) * STEP;
    if (snapTo !== null) {
      // a critically damped spring, so every sign lands square with no wobble
      const k = 38, c = 2 * Math.sqrt(k);
      vel += (k * (snapTo - angle) - c * vel) * dt;
      angle += vel * dt;
      if (Math.abs(snapTo - angle) < 0.03 && Math.abs(vel) < 0.05) { angle = snapTo; vel = 0; snapTo = null; nextAt = now + DWELL; }
    }
  }
  layout();
  const moving = dragging || snapTo !== null || (!held && motionOn());
  raf = moving && onScreen && !document.hidden ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(tick); } };

function bring(i) {
  // the shortest way round to sign i
  let k = i - frontOf(angle);
  if (k > N / 2) k -= N; if (k < -N / 2) k += N;
  const to = (Math.round(angle / STEP) + k) * STEP;
  nextAt = performance.now() + DWELL + 1500;
  if (!motionOn()) { angle = to; vel = 0; snapTo = null; layout(); return; }
  snapTo = to; run();
}

// drag and swipe, 1:1; on release it keeps the throw and coasts
let x0 = 0, a0 = 0, hist = [], moved = false;
list.addEventListener('pointerdown', (e) => {
  dragging = true; moved = false; snapTo = null; vel = 0;
  x0 = e.clientX; a0 = angle; hist = [[e.clientX, e.timeStamp]];
  list.setPointerCapture(e.pointerId); list.classList.add('is-dragging'); run();
});
list.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - x0;
  if (Math.abs(dx) > 8) moved = true;
  angle = a0 - (dx / (links[0].offsetWidth * 0.86)) * STEP;
  hist.push([e.clientX, e.timeStamp]); if (hist.length > 6) hist.shift();
  layout();
});
function release(e) {
  if (!dragging) return;
  dragging = false; list.classList.remove('is-dragging');
  const recent = hist.filter(([, t]) => e.timeStamp - t <= 100);
  let vpx = 0;
  if (recent.length > 1) {
    const [xa, ta] = recent[0], [xb, tb] = recent[recent.length - 1];
    if (tb > ta) vpx = ((xb - xa) / (tb - ta)) * 1000;
  }
  const vdeg = -(vpx / (links[0].offsetWidth * 0.86)) * STEP;
  // the throw decides where it lands, and it always lands square on a sign
  const projected = angle + (vdeg / 1000) * 0.995 / (1 - 0.995);
  const to = Math.round(projected / STEP) * STEP;
  nextAt = performance.now() + DWELL + 1500;
  if (!motionOn()) { angle = to; vel = 0; snapTo = null; layout(); return; }
  vel = vdeg; snapTo = to; run();
}
list.addEventListener('pointerup', release);
list.addEventListener('pointercancel', release);
// a tap on a side sign brings it round instead of leaving; clicks from the
// keyboard, a screen reader or voice control (detail 0) always follow the link
list.addEventListener('click', (e) => {
  const li = e.target.closest('.sign'); if (!li || e.detail === 0) return;
  if (moved) { e.preventDefault(); return; }
  const i = cards.indexOf(li);
  if (i !== frontOf(angle) || Math.abs((((i * STEP - angle) % 360) + 540) % 360 - 180) > STEP / 3) { e.preventDefault(); bring(i); }
}, true);
// it holds still while a mouse is over it or focus is inside it
signsEl.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { held = true; run(); } });
signsEl.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { held = false; nextAt = Math.max(nextAt, performance.now() + 1200); run(); } });
list.addEventListener('focusin', (e) => {
  held = true;
  const li = e.target.closest('.sign'); if (li) bring(cards.indexOf(li));
});
list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) { held = false; nextAt = performance.now() + DWELL; run(); } });
list.addEventListener('keydown', (e) => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!step) return;
  e.preventDefault();
  const to = mod((snapTo !== null ? frontOf(snapTo) : frontOf(angle)) + step);
  bring(to);
  links[to].focus({ preventScroll: true });
});
// it only turns while it is on screen and the tab is showing
new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; if (onScreen) run(); }).observe(signsEl);
document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
addEventListener('motionchange', () => { if (!motionOn()) bring(frontOf(angle)); else run(); });
new ResizeObserver(() => { measure(); layout(); }).observe(list.parentElement);
measure();
layout();
run();

// On a phone the road runs behind the wheel, and its horizon sits just above
// "You are here", however long the words above it wrap.
const road = document.querySelector('.road');
const stage = document.querySelector('.road__stage');
const narrow = matchMedia('(max-width: 52rem)');
function placeStage() {
  if (!narrow.matches) {
    stage.style.removeProperty('top'); stage.style.removeProperty('height');
    root.style.removeProperty('--vy'); road.style.removeProperty('--hz');
    return;
  }
  const top = Math.max(0, signsEl.offsetTop - 64);
  const h = road.offsetHeight - top;
  stage.style.top = top + 'px'; stage.style.height = h + 'px';
  root.style.setProperty('--vy', ((36 / h) * 100).toFixed(2) + '%');
  road.style.setProperty('--hz', top + 36 + 'px');
}
new ResizeObserver(placeStage).observe(road);
placeStage();
}
