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

  // ---------- 4. email links that always work ----------
  // A plain "mailto:" link does nothing on computers without an email app set up (most Gmail users),
  // so clicking one opens a small menu: Gmail, Outlook, your email app, or copy the address.
  (function () {
    if (window.__ptMailMenu) return; window.__ptMailMenu = true;
    var mcss = '.pt-mail-menu{position:fixed;z-index:2147483000;min-width:230px;padding:6px;border-radius:14px;background:#fff;color:#16202C;border:1px solid #E3E8F1;box-shadow:0 18px 40px -14px rgba(16,24,40,.35);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;animation:ptMmIn .14s ease-out}' +
      '@keyframes ptMmIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}' +
      '.pt-mail-menu a,.pt-mail-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:0;border-radius:10px;background:none;font:600 14px Inter,system-ui,sans-serif;color:inherit;text-decoration:none;cursor:pointer;text-align:left}' +
      '.pt-mail-menu a:hover,.pt-mail-menu button:hover{background:#EEF0FD;color:#3B49C9}' +
      '.pt-mail-menu small{display:block;padding:6px 12px 4px;font-size:12px;color:#6B7689;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.pt-mail-menu i{width:22px;height:22px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:13px;flex-shrink:0;background:#EEF0FD}' +
      'html[data-theme="dark"] .pt-mail-menu{background:#1A2430;color:#EAF0F8;border-color:#2C3A4A} html[data-theme="dark"] .pt-mail-menu i{background:#243042} html[data-theme="dark"] .pt-mail-menu a:hover,html[data-theme="dark"] .pt-mail-menu button:hover{background:#243042;color:#A5B4FC}';
    try { var ms = document.createElement('style'); ms.textContent = mcss; (document.head || document.documentElement).appendChild(ms); } catch (e) { /* ignore */ }
    var menu = null;
    function close() { if (menu) { menu.remove(); menu = null; } }
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href^="mailto:"]');
      if (!a) { if (menu && !(e.target.closest && e.target.closest('.pt-mail-menu'))) close(); return; }
      if (a.hasAttribute('data-pt-direct')) return;                 // a link that should open the email app directly
      e.preventDefault(); close();
      var raw = a.getAttribute('href').slice(7), to = decodeURIComponent(raw.split('?')[0]), params = new URLSearchParams(raw.split('?')[1] || '');
      var subject = params.get('subject') || (/@palatrack\.com$/i.test(to) ? 'Question about PalaTrack' : ''), body = params.get('body') || '';
      var q = encodeURIComponent(to), su = encodeURIComponent(subject), bo = encodeURIComponent(body);
      var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); };
      menu = document.createElement('div'); menu.className = 'pt-mail-menu'; menu.setAttribute('role', 'menu');
      menu.innerHTML = '<small>Email ' + esc(to) + ' with\u2026</small>' +
        '<a role="menuitem" target="_blank" rel="noopener" href="https://mail.google.com/mail/?view=cm&fs=1&to=' + q + (su ? '&su=' + su : '') + (bo ? '&body=' + bo : '') + '"><i>\u2709\ufe0f</i>Gmail</a>' +
        '<a role="menuitem" target="_blank" rel="noopener" href="https://outlook.live.com/mail/0/deeplink/compose?to=' + q + (su ? '&subject=' + su : '') + (bo ? '&body=' + bo : '') + '"><i>\ud83d\udce8</i>Outlook</a>' +
        '<a role="menuitem" data-app="1" href="mailto:' + esc(to) + (su || bo ? '?' + [su ? 'subject=' + su : '', bo ? 'body=' + bo : ''].filter(Boolean).join('&') : '') + '"><i>\ud83d\udcbb</i>Your email app</a>' +
        '<button role="menuitem" type="button" data-copy="1"><i>\ud83d\udccb</i>Copy address</button>';
      document.body.appendChild(menu);
      var r = a.getBoundingClientRect(), w = menu.offsetWidth, h = menu.offsetHeight;
      var left = Math.min(Math.max(8, r.left), innerWidth - w - 8), top = r.bottom + 8;
      if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 8);
      menu.style.left = left + 'px'; menu.style.top = top + 'px';
      menu.addEventListener('click', function (ev) {
        var c = ev.target.closest('[data-copy]'), app = ev.target.closest('[data-app]');
        if (c) { var done = function () { c.innerHTML = '<i>\u2713</i>Copied!'; setTimeout(close, 900); };
          if (navigator.clipboard) navigator.clipboard.writeText(to).then(done, function () { prompt('Copy this address:', to); close(); }); else { prompt('Copy this address:', to); close(); } return; }
        if (app) { ev.preventDefault(); ev.stopPropagation(); location.href = app.getAttribute('href'); setTimeout(close, 300); return; }
        setTimeout(close, 100);
      });
    }, true);
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    addEventListener('scroll', close, {passive: true, capture: true});
  })();
})();
