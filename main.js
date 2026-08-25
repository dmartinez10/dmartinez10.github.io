/* David Martinez, portfolio
   Three small jobs: say where you are, reveal on scroll, filter the log. */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── year ─────────────────────────────────────────────── */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ── the bar: name / where you are ────────────────────── */
  var bar = document.getElementById('bar');
  var here = document.getElementById('bar-here');
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-here]'));

  function onScroll() {
    if (bar) bar.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (here && sections.length && 'IntersectionObserver' in window) {
    // The section whose top edge sits closest above the reading line wins.
    var visible = new Map();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible.set(e.target, e.isIntersecting);
      });
      for (var i = sections.length - 1; i >= 0; i--) {
        if (visible.get(sections[i])) {
          var label = sections[i].getAttribute('data-here');
          if (here.textContent !== label) here.textContent = label;
          break;
        }
      }
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── reveal on scroll ─────────────────────────────────── */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    reveals.forEach(function (el) { io.observe(el); });

    // The hero is above the fold; play its stagger on load rather than on scroll.
    requestAnimationFrame(function () {
      document.querySelectorAll('.hero .reveal').forEach(function (el) {
        el.classList.add('is-in');
        io.unobserve(el);
      });
    });
  }

  /* ── log filters ──────────────────────────────────────── */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.chipbtn'));
  var rows = Array.prototype.slice.call(document.querySelectorAll('.log__row'));
  var note = document.getElementById('log-note');

  function apply(kind) {
    var shown = 0;
    rows.forEach(function (row) {
      var match = kind === 'all' || row.getAttribute('data-kind') === kind;
      row.hidden = !match;
      if (match) {
        shown++;
        row.classList.add('is-in'); // a filtered-in row must never stay invisible
      }
    });
    if (note) {
      note.textContent = kind === 'all'
        ? shown + ' entries'
        : shown + (shown === 1 ? ' entry' : ' entries') + ': ' + kind;
    }
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      apply(btn.getAttribute('data-filter'));
    });
  });

  if (rows.length) apply('all');
})();
