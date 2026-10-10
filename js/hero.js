// The hero: the motion switch, the headline's decode, the signs leaning
// toward the pointer, and the road, loaded once the words are on screen.
// Everything here is an enhancement: the page reads the same without it.

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
    window.dispatchEvent(new CustomEvent('motionchange'));
  });
}

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

// ── the row turns: point at a sign and it comes to the front ──
// The others keep their order and the ones before it go to the back of the
// line. A short pause before turning, and none again until the pointer moves
// after the turn, so a sign sliding under a still pointer never sets off
// another turn. Keyboard focus turns the row at once.
const row = [...document.querySelectorAll('.sign')];
if (row.length) {
  let front = 0, armed = true, intent = 0, settle = 0;
  const TURN_MS = 750;
  const turnTo = (k) => {
    if (k === front) return;
    front = k;
    row.forEach((li, i) => li.style.setProperty('--p', String((i - k + row.length) % row.length)));
    armed = false;
    clearTimeout(settle);
    settle = setTimeout(() => {
      addEventListener('pointermove', () => { armed = true; }, { once: true });
    }, motionOn() ? TURN_MS : 0);
  };
  row.forEach((li, i) => {
    const a = li.querySelector('a');
    a.addEventListener('pointermove', () => {
      if (!armed || i === front || intent || !fine.matches || !wide.matches) return;
      intent = setTimeout(() => { intent = 0; turnTo(i); }, 140);
    });
    a.addEventListener('pointerleave', () => { clearTimeout(intent); intent = 0; });
    a.addEventListener('focus', () => { if (wide.matches) turnTo(i); });
  });
}
