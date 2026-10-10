// The display wheel test. The wheel turns on a spring: drag or swipe it,
// tap or point at a side card, or use the dots or arrow keys. A flick is
// thrown: the release velocity projects where it lands, then it snaps.
import { start } from '/js/road.js';

const root = document.documentElement;
const motionOn = () => root.dataset.motion === 'on';
const list = document.querySelector('.signs__list');
const cards = [...list.querySelectorAll('.sign')];
const N = cards.length, STEP = 360 / N;
const small = matchMedia('(max-width: 52rem)');

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
document.querySelector('.signs').append(dots);

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
const fine = matchMedia('(hover: hover) and (pointer: fine)');
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

// the road, after the words
addEventListener('load', () => setTimeout(() => {
  const c = document.querySelector('.road__gl');
  if (c) start(c);
}, 100), { once: true });
