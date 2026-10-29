/* PalaTrack · smooth.js
   One shared file, loaded at the top of every page, that makes the whole tracker feel smoother:
   1. faster loading   - Firebase keeps a copy of your data in the browser, and pages are fetched ahead
                         when you point at a link, so opening them feels instant;
   2. soft transitions - going to another page fades softly instead of flashing white, and the
                         side panel stays still (in browsers that support it; others work as before);
   3. calm interactions - subtle press feedback, clear keyboard focus, dialogs and the page itself
                         appear softly, and the loading spinner only shows when loading actually takes a moment.
   Everything here is low-priority styling (the pages' own styles always win), and people who have turned
   animations off on their device get almost no motion. */
(function () {
  'use strict';
  var calm = false;
  try { calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }

  // ---------- 2 + 3. styles ----------
  var css = [
    // soft page-to-page transitions (cross-document view transitions)
    '@view-transition { navigation: auto; }',
    '::view-transition-old(root), ::view-transition-new(root) { animation-duration: ' + (calm ? '0.01s' : '0.22s') + '; animation-timing-function: cubic-bezier(.2,.8,.2,1); }',
    // the side panel stays in place while the page changes
    '[data-pt-sidebar] { view-transition-name: pt-sidebar; }',
    '::view-transition-group(pt-sidebar) { animation-duration: 0s; }',
    // the page appears softly once it has loaded; the spinner only shows if loading takes a moment
    '#appRoot { transition: opacity .25s ease; }',
    '@starting-style { #appRoot { opacity: 0; } }',
    '#pageLoader { animation: ptLoaderIn .2s ease .3s both; }',
    '@keyframes ptLoaderIn { from { opacity: 0; } to { opacity: 1; } }',
    // dialogs and pop-ups open softly
    ':where([role="dialog"], [role="menu"], dialog[open]) { transition: opacity .18s ease, translate .18s ease; }',
    '@starting-style { :where([role="dialog"], [role="menu"], dialog[open]) { opacity: 0; translate: 0 6px; } }',
    // subtle press feedback on buttons (uses "scale", so it never disturbs a button's own transform)
    ':where(button, .btn, [role="button"], a.button) { transition-property: scale, background-color, border-color, color, box-shadow, opacity; transition-duration: .15s; }',
    ':where(button, .btn, [role="button"], a.button):not(:disabled):active { scale: .98; }',
    // clear focus for keyboard users (pages that style their own focus keep theirs)
    ':where(a, button, input, select, textarea, [tabindex]):focus-visible { outline: 2px solid #5B4BE6; outline-offset: 2px; }',
    // no grey flash when tapping on phones, smooth scrolling to anchors
    'html { -webkit-tap-highlight-color: transparent; }',
    calm ? '' : 'html { scroll-behavior: smooth; }',
    // images keep their shape while loading, so text doesn't jump
    ':where(img) { max-width: 100%; height: auto; }',
    calm ? '*, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }' : ''
  ].join('\n');
  try {
    var st = document.createElement('style'); st.id = 'pt-smooth'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* ignore */ }

  // ---------- 1a. Firebase's copy in the browser ----------
  // When a page starts Firebase, the browser copy is switched on right away (before the page reads anything).
  // Only for the current Firebase version, so pages on an older version never conflict with it.
  function patchFirebase(fb) {
    try {
      if (!fb || fb.__ptSmooth || typeof fb.initializeApp !== 'function') return;
      fb.__ptSmooth = true;
      var init = fb.initializeApp;
      fb.initializeApp = function () {
        var app = init.apply(this, arguments);
        try {
          if (String(fb.SDK_VERSION || '').indexOf('10.') === 0 && typeof fb.firestore === 'function' && !window.__ptNoCache) {
            var p = fb.firestore().enablePersistence({ synchronizeTabs: true });
            if (p && p.catch) p.catch(function () { /* another tab or an unsupported browser: it simply reads from the server */ });
          }
        } catch (e) { /* ignore */ }
        return app;
      };
    } catch (e) { /* ignore */ }
  }
  try {
    if (window.firebase) patchFirebase(window.firebase);
    else {
      var fbVal;
      Object.defineProperty(window, 'firebase', {
        configurable: true,
        get: function () { return fbVal; },
        set: function (v) { fbVal = v; patchFirebase(v); }
      });
    }
  } catch (e) { /* ignore */ }

  // ---------- 1b. fetch the next page ahead, when you point at a link ----------
  var fetched = {};
  function prefetch(a) {
    try {
      if (!a || !a.href || a.target === '_blank' || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || /^(mailto|tel|javascript):/i.test(a.href)) return;
      if (!/(\.html$|\/[a-z0-9-]+$|\/$)/i.test(u.pathname)) return;
      var key = u.pathname + u.search; if (fetched[key]) return; fetched[key] = 1;
      var l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.pathname + u.search; l.as = 'document';
      document.head.appendChild(l);
    } catch (e) { /* ignore */ }
  }
  var hoverTimer = null;
  document.addEventListener('mouseover', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a) return;
    clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { prefetch(a); }, 65);
  }, { passive: true });
  document.addEventListener('touchstart', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]'); if (a) prefetch(a);
  }, { passive: true });
})();
