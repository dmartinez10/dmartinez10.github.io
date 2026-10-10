// The night road, in Three.js from a CDN. The centre line races toward
// you, light trails stream along both shoulders, and the camera drifts
// with the pointer. It pauses when it is off screen or the tab is hidden,
// and with motion off it draws one still frame.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const LINE = 0xffc72c;
const TRAIL = new THREE.Color(0xffe6a0);
const SKY_TOP = '#04060A', SKY_HORIZON = '#0B1222', GROUND = '#07090D';

export function start(canvas) {
  const root = document.documentElement;
  const stage = canvas.parentElement;
  const small = matchMedia('(max-width: 52rem)');
  const lite = () => small.matches || (navigator.hardwareConcurrency || 8) <= 4;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite(), powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(SKY_HORIZON, 30, 240);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 400);
  camera.position.set(0.9, 1.5, 0);

  // the sky is a gradient whose horizon sits where the CSS says it does
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 2; skyCanvas.height = 256;
  const sky = new THREE.CanvasTexture(skyCanvas);
  sky.colorSpace = THREE.SRGBColorSpace;
  scene.background = sky;
  function paintSky(vy) {
    const g = skyCanvas.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, SKY_TOP);
    grad.addColorStop(Math.max(0.01, vy - 0.001), SKY_HORIZON);
    grad.addColorStop(Math.min(1, vy), GROUND);
    grad.addColorStop(1, GROUND);
    g.fillStyle = grad; g.fillRect(0, 0, 2, 256);
    sky.needsUpdate = true;
  }

  // ground and road
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ color: 0x06080c }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.01, -200);
  scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(13, 600), new THREE.MeshBasicMaterial({ color: 0x141924 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -200);
  scene.add(road);
  for (const x of [-6.4, 6.4]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 600),
      new THREE.MeshBasicMaterial({ color: 0xcfd6e0, transparent: true, opacity: 0.55 }));
    edge.rotation.x = -Math.PI / 2; edge.position.set(x, 0.01, -200);
    scene.add(edge);
  }

  // the centre line: dashes that race toward the camera
  const DASH = 3, GAP = 6, SPAN = 270;
  const dashCount = Math.ceil(SPAN / (DASH + GAP));
  const dashes = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.16, DASH),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(LINE).multiplyScalar(1.6), toneMapped: false }),
    dashCount);
  const dz = new Float32Array(dashCount);
  for (let i = 0; i < dashCount; i++) dz[i] = -i * (DASH + GAP);
  scene.add(dashes);

  // light trails: long thin streaks on both shoulders, some coming, some going
  const trailCount = lite() ? 26 : 72;
  const trails = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.05, 0.05, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    trailCount);
  const tr = [];
  for (let i = 0; i < trailCount; i++) {
    const side = i % 2 ? 1 : -1;
    tr.push({
      x: side * (7.2 + Math.random() * 4.5),
      y: 0.25 + Math.random() * 1.1,
      z: -Math.random() * SPAN,
      len: 10 + Math.random() * 40,
      speed: (side > 0 ? 1 : -0.55) * (45 + Math.random() * 60),
    });
    trails.setColorAt(i, TRAIL.clone().multiplyScalar(0.3 + Math.random() * 0.8));
  }
  scene.add(trails);

  // a soft glow on the horizon, untouched by fog
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,199,44,.28)'); r.addColorStop(1, 'rgba(255,199,44,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, fog: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(220, 34, 1); glow.position.set(0, 0, -300);
  scene.add(glow);

  // bloom makes the line and trails glow; phones skip it
  let composer = null;
  function buildComposer(w, h) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.4, 0.4));
    composer.addPass(new OutputPass());
  }

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  function place(dt) {
    for (let i = 0; i < dashCount; i++) {
      dz[i] += cur * dt;
      if (dz[i] > 4) dz[i] -= dashCount * (DASH + GAP);
      m4.compose(p.set(0, 0.02, dz[i]), flat, s.set(1, 1, 1));
      dashes.setMatrixAt(i, m4);
    }
    dashes.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < trailCount; i++) {
      const t = tr[i];
      t.z += (t.speed + cur * 0.4) * dt;
      if (t.z > 20) t.z -= SPAN + 40;
      if (t.z < -SPAN - 20) t.z += SPAN + 40;
      m4.compose(p.set(t.x, t.y, t.z), q, s.set(1, 1, t.len));
      trails.setMatrixAt(i, m4);
    }
    trails.instanceMatrix.needsUpdate = true;
  }

  // the camera follows the pointer on a critically damped spring
  let px = 0, py = 0, cx = 0, cy = 0, vxs = 0, vys = 0;
  const K = 9, C = 2 * Math.sqrt(K);
  addEventListener('pointermove', (e) => {
    px = (e.clientX / innerWidth - 0.5);
    py = (e.clientY / innerHeight - 0.5);
  }, { passive: true });

  // the road speeds up while you scroll, as if the camera were driving
  const BASE = 26;
  let cur = BASE, lastY = scrollY;
  let w = 0, h = 0;
  function resize() {
    const r = stage.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    renderer.setPixelRatio(Math.min(devicePixelRatio, lite() ? 1 : 1.5));
    renderer.setSize(w, h, false);
    const cs = getComputedStyle(root);
    const vx = parseFloat(cs.getPropertyValue('--vx')) / 100 || 0.39;
    const vy = parseFloat(cs.getPropertyValue('--vy')) / 100 || 0.58;
    camera.aspect = w / h;
    // put the vanishing point where the signs expect it
    camera.setViewOffset(w, h, (0.5 - vx) * w, (0.5 - vy) * h, w, h);
    camera.updateProjectionMatrix();
    paintSky(vy);
    if (lite()) composer = null;
    else if (!composer) buildComposer(w, h);
    else composer.setSize(w, h);
  }

  function frame(dt) {
    if (dt > 0) {
      const sv = Math.abs(scrollY - lastY) / dt;
      lastY = scrollY;
      const want = BASE + Math.min(sv * 0.12, 90);
      cur += (want - cur) * (1 - Math.exp(-dt * (want > cur ? 6 : 1.5)));
    }
    place(dt);
    const tx = px * 1.6, ty = -py * 0.35;
    vxs += (K * (tx - cx) - C * vxs) * dt; cx += vxs * dt;
    vys += (K * (ty - cy) - C * vys) * dt; cy += vys * dt;
    camera.position.x = 0.9 + cx;
    camera.position.y = 1.5 + cy;
    camera.rotation.z = -cx * 0.02;
    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  let raf = 0, prev = 0, visible = true;
  const loop = (now) => {
    const dt = Math.min((now - prev) / 1000, 1 / 20);
    prev = now;
    frame(dt);
    raf = requestAnimationFrame(loop);
  };
  function run() {
    const go = visible && !document.hidden && root.dataset.motion === 'on';
    if (go && !raf) { prev = performance.now(); raf = requestAnimationFrame(loop); }
    if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!go) frame(0); // the still frame
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(stage);
  document.addEventListener('visibilitychange', run);
  addEventListener('motionchange', run);
  new ResizeObserver(() => { resize(); if (!raf) frame(0); }).observe(stage);

  resize();
  frame(0);
  canvas.classList.add('is-live');
  run();
}
