/* David Martinez, portfolio
   Drives the HUD: the radial navigator, the status telemetry,
   panel reveals, the log filters, and the screenshot lightbox. */

(function () {
  'use strict';

  var doc = document;
  doc.documentElement.classList.remove('no-js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = !reduced && 'IntersectionObserver' in window;
  // Only now is it safe to hide things: everything above ran without throwing.
  if (canAnimate) doc.documentElement.classList.add('anim');
  var $  = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ── tick marks around the outer ring ──────────────────── */
  var ticks = $('#ticks');
  if (ticks) {
    var marks = '';
    for (var t = 0; t < 72; t++) {
      var major = t % 6 === 0;
      var len = major ? 10 : 5;
      marks += '<line x1="200" y1="' + (10 + 0) + '" x2="200" y2="' + (10 + len) +
               '" transform="rotate(' + (t * 5) + ' 200 200)"' +
               (major ? ' opacity=".8"' : '') + '/>';
    }
    ticks.innerHTML = marks;
  }

  /* ── the radial navigator ──────────────────────────────── */
  var sections = $$('[data-sec]');
  var nodes    = $$('#nodes a');
  var sweep    = $('#sweep');
  var coreN    = $('#core-n');
  var coreL    = $('#core-l');
  var readSec  = $('#read-sec');
  var readPct  = $('#read-pct');
  var readFill = $('#read-fill');

  var STEP = 360 / nodes.length;          // nodes sit evenly around the ring
  var current = -1;

  function point(i) {
    if (sweep) sweep.style.transform = 'rotate(' + (i * STEP) + 'deg)';
  }

  function setActive(i, fromHover) {
    var node = nodes[i];
    if (!node) return;
    if (coreN) coreN.textContent = node.dataset.n;
    if (coreL) coreL.textContent = node.dataset.label;
    point(i);
    if (fromHover) return;
    if (i === current) return;
    current = i;
    nodes.forEach(function (n, k) { n.classList.toggle('is-active', k === i); });
    if (readSec) readSec.textContent = node.dataset.n + ' ' + node.dataset.label;
  }

  // Hovering previews a destination; leaving snaps back to where you actually are.
  nodes.forEach(function (n, i) {
    n.addEventListener('mouseenter', function () { setActive(i, true); });
    n.addEventListener('focus',      function () { setActive(i, true); });
    n.addEventListener('mouseleave', function () { restore(); });
    n.addEventListener('blur',       function () { restore(); });
  });

  function restore() {
    var node = nodes[current];
    if (!node) return;
    if (coreN) coreN.textContent = node.dataset.n;
    if (coreL) coreL.textContent = node.dataset.label;
    point(current);
  }

  /* ── scroll telemetry ──────────────────────────────────── */
  var ticking = false;

  function telemetry() {
    ticking = false;

    var h = doc.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? Math.min(100, Math.max(0, Math.round(window.scrollY / h * 100))) : 0;
    if (readPct)  readPct.textContent = pct + '%';
    if (readFill) readFill.style.width = pct + '%';

    // the section whose top has most recently passed the reading line
    var line = window.scrollY + window.innerHeight * 0.33;
    var idx = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= line) idx = i;
    }
    setActive(idx, false);
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(telemetry);
  }, { passive: true });

  window.addEventListener('resize', telemetry, { passive: true });

  /* ── boot + reveals ────────────────────────────────────── */
  var boots = $$('.boot');
  var reveals = $$('.reveal');

  if (!canAnimate) {
    boots.concat(reveals).forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // hero plays immediately; a rAF lets the initial styles settle first
    requestAnimationFrame(function () {
      boots.forEach(function (el) { el.classList.add('is-in'); });
    });
    // belt and braces: if anything stalls, show the hero anyway
    setTimeout(function () {
      boots.forEach(function (el) { el.classList.add('is-in'); });
    }, 800);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    reveals.forEach(function (el) { io.observe(el); });

    // a scan line crosses each panel the first time it comes into view
    var panels = $$('.panel__body');
    var scanIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        scanIO.unobserve(e.target);
        var line = doc.createElement('span');
        line.className = 'scanline';
        line.style.setProperty('--h', e.target.offsetHeight + 'px');
        e.target.appendChild(line);
        requestAnimationFrame(function () { line.classList.add('is-run'); });
        setTimeout(function () { line.remove(); }, 1400);
      });
    }, { threshold: 0.12 });
    panels.forEach(function (p) { scanIO.observe(p); });
  }

  /* ── log filters ───────────────────────────────────────── */
  var filters = $$('.fbtn');
  var rows = $$('.row');
  var note = $('#log-note');
  var count = $('#log-count');

  if (count) count.textContent = String(rows.length);

  function applyFilter(kind) {
    var shown = 0;
    rows.forEach(function (row) {
      var match = kind === 'all' || row.dataset.kind === kind;
      row.hidden = !match;
      if (match) { shown++; row.classList.add('is-in'); }
    });
    if (note) {
      note.textContent = kind === 'all'
        ? shown + ' entries'
        : shown + (shown === 1 ? ' entry' : ' entries') + ': ' + kind;
    }
  }

  var logList = $('#log-list');
  var more = $('#log-more');
  if (more && logList) {
    more.addEventListener('click', function () {
      var open = logList.classList.toggle('is-open');
      more.setAttribute('aria-expanded', String(open));
      more.textContent = open ? 'Show fewer' : 'Show all ' + rows.length + ' entries';
    });
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      var kind = btn.dataset.filter;
      // a filtered view shows every match, not just the first six
      if (logList) logList.classList.toggle('is-open', kind !== 'all');
      if (more) {
        more.hidden = kind !== 'all';
        more.setAttribute('aria-expanded', String(kind !== 'all'));
        more.textContent = 'Show all ' + rows.length + ' entries';
      }
      applyFilter(kind);
    });
  });
  if (rows.length) applyFilter('all');

  /* ── screenshot lightbox ───────────────────────────────── */
  var lb    = $('#lb');
  var lbImg = $('#lb-img');
  var lbCap = $('#lb-cap');
  var lbX   = $('#lb-x');
  var lastFocus = null;

  function openShot(btn) {
    if (!lb) return;
    lastFocus = btn;
    lbImg.src = btn.dataset.src;
    var img = btn.querySelector('img');
    lbImg.alt = img ? img.alt : '';
    lbCap.textContent = btn.dataset.cap || '';
    lb.hidden = false;
    doc.body.style.overflow = 'hidden';
    $('.lb__panel', lb).focus();
  }

  function closeShot() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lbImg.src = '';
    doc.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  $$('.shot').forEach(function (btn) {
    btn.addEventListener('click', function () { openShot(btn); });
  });
  if (lbX) lbX.addEventListener('click', closeShot);
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) closeShot(); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeShot(); });

  telemetry();
})();
