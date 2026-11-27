/* PalaTrack \u00B7 smooth.js
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
  // ---------- 4b. Undo: one way to take back a delete, on every page ----------
  // window.ptUndo.offer(message, undo, {commit}) shows "message \u00B7 Undo" at the bottom and lets Ctrl+Z (Cmd+Z) take it
  // back for 8 seconds. commit (optional) runs when the time is up, for deletes that can only happen later. Leaving the
  // page commits right away. While you're typing in a field, Ctrl+Z keeps undoing your typing.
  (function () {
    if (window.ptUndo) return;
    var ucss = '.pt-undo{position:fixed;left:50%;bottom:24px;z-index:2147483000;transform:translate(-50%,12px);opacity:0;display:flex;align-items:center;gap:14px;' +
      'padding:11px 12px 11px 18px;border-radius:14px;background:#16202C;color:#fff;font:600 14px Inter,system-ui,-apple-system,"Segoe UI",sans-serif;' +
      'box-shadow:0 18px 40px -14px rgba(16,24,40,.55);transition:opacity .2s ease,transform .2s ease;pointer-events:none;max-width:calc(100vw - 32px);}' +
      '.pt-undo.show{opacity:1;transform:translate(-50%,0);pointer-events:auto;}' +
      '.pt-undo button{border:0;border-radius:9px;padding:7px 12px;background:rgba(255,255,255,.12);color:#C7D2FE;font:700 13px inherit;font-family:inherit;cursor:pointer;}' +
      '.pt-undo button:hover{background:rgba(255,255,255,.2);color:#fff;}' +
      '.pt-undo kbd{font:600 11px inherit;font-family:inherit;opacity:.6;margin-left:6px;}' +
      'html[data-theme="dark"] .pt-undo{background:#EAF0F8;color:#16202C;} html[data-theme="dark"] .pt-undo button{background:rgba(22,32,44,.08);color:#3B49C9;}';
    try { var us = document.createElement('style'); us.textContent = ucss; (document.head || document.documentElement).appendChild(us); } catch (e) { return; }
    var cur = null, box = null;
    function hide() { if (box) box.classList.remove('show'); }
    function settle() { if (!cur) return; var c = cur; cur = null; clearTimeout(c.timer); if (c.commit) { try { c.commit(); } catch (e) { console.error(e); } } }
    function run() {
      if (!cur) return; var c = cur; cur = null; clearTimeout(c.timer); hide();
      Promise.resolve().then(c.undo).catch(function (e) { console.error(e); alertBox('Couldn\u2019t undo that. Please try again.'); });
    }
    function alertBox(msg) { ensure(); box.firstChild.textContent = msg; box.lastChild.style.display = 'none'; box.classList.add('show'); setTimeout(hide, 3500); }
    function ensure() {
      if (box && box.isConnected) return;
      box = document.createElement('div'); box.className = 'pt-undo'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
      box.innerHTML = '<span></span><button type="button">Undo<kbd>Ctrl+Z</kbd></button>';
      box.lastChild.addEventListener('click', run); document.body.appendChild(box);
    }
    window.ptUndo = {
      offer: function (msg, undo, opts) {
        settle(); ensure();
        box.firstChild.textContent = msg; box.lastChild.style.display = '';
        if (/Mac|iPhone|iPad/.test(navigator.platform || '')) box.querySelector('kbd').textContent = '\u2318Z';
        box.classList.add('show');
        var c = {undo: undo, commit: opts && opts.commit};
        c.timer = setTimeout(function () { if (cur === c) { hide(); settle(); } }, 8000);
        cur = c;
      },
      run: run
    };
    document.addEventListener('keydown', function (e) {
      if (!cur || e.defaultPrevented || !(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || String(e.key).toLowerCase() !== 'z') return;
      var a = document.activeElement;
      if (a && (a.isContentEditable || /^(INPUT|TEXTAREA)$/.test(a.tagName)) && String(a.value || a.textContent || '').trim()) return;
      e.preventDefault(); run();
    });
    addEventListener('pagehide', settle);
  })();
  // ---------- 5. looping animations rest while they're off screen ----------
  // A pulsing dot or a shimmer far down the page still costs work on every frame, even when nobody can see it. Each part
  // of the page with a never-ending animation is watched, and its animations pause while it's out of view (they carry
  // on where they were when it scrolls back in). Fixed things (the snow, a loader, a toast) are never paused.
  (function () {
    if (!('IntersectionObserver' in window) || !window.getComputedStyle) return;
    try { var ps = document.createElement('style'); ps.textContent = '.pt-offscreen,.pt-offscreen *,.pt-offscreen *::before,.pt-offscreen *::after{animation-play-state:paused!important;}'; (document.head || document.documentElement).appendChild(ps); } catch (e) { return; }
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) { en.target.classList.toggle('pt-offscreen', !en.isIntersecting); });
    }, {rootMargin: '150px 0px'});
    var watched = new WeakSet();
    function zoneOf(el) {
      for (var n = el; n && n !== document.body; n = n.parentElement) {
        var pos = getComputedStyle(n).position; if (pos === 'fixed' || pos === 'sticky') return null;      // on screen whatever the scroll
      }
      var z = el.closest('section,header,footer,article,aside,li,[data-pt-zone]') || el;
      return z === document.body || z === document.documentElement ? null : z;
    }
    // the browser lists the animations that are running: only the never-ending ones are looked at (a handful)
    function scan() {
      if (!document.getAnimations) return;
      var list = document.getAnimations();
      for (var i = 0; i < list.length; i++) {
        var an = list[i], t = an.effect && an.effect.target, timing = an.effect && an.effect.getTiming && an.effect.getTiming();
        if (!t || !timing || timing.iterations !== Infinity || watched.has(t)) continue;
        watched.add(t);
        if (t.closest('#ptXmas,#ptHalloween,dialog,[role="dialog"]')) continue;
        try { var z = zoneOf(t); if (z && !watched.has(z)) { watched.add(z); io.observe(z); } } catch (e) { /* ignore */ }
      }
    }
    function start() {
      scan();
      // parts added later (the app builds most of its page after loading) are checked too, a little after they appear
      var t = null;
      try { new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { (window.requestIdleCallback || setTimeout)(scan); }, 1000); }).observe(document.body, {childList: true, subtree: true}); } catch (e) { /* fine */ }
    }
    if (document.readyState === 'complete') setTimeout(start, 300); else addEventListener('load', function () { setTimeout(start, 300); });
  })();
  // ---------- 6. smooth scrolling: the page's background on its own fixed layer ----------
  // Pages give <body> a soft gradient with "background-attachment: fixed". Browsers repaint such a background on every
  // frame while scrolling (across the whole screen), which makes scrolling lag on big screens. Here the same background
  // goes onto its own fixed layer behind the page: painted once, it stays put while the page slides over it. It looks the
  // same, and follows the light/dark switch.
  (function () {
    var busy = false;
    function apply() {
      var b = document.body; if (!b || busy) return; busy = true;
      try {
        var layer = document.getElementById('ptBgLayer');
        // read the page's own background (without what we set before)
        ['background-image', 'background-color', 'background-attachment'].forEach(function (k) { b.style.removeProperty(k); });
        var cs = getComputedStyle(b);
        if (String(cs.backgroundAttachment).indexOf('fixed') < 0) { if (layer) layer.remove(); return; }
        if (!layer) { layer = document.createElement('div'); layer.id = 'ptBgLayer'; layer.setAttribute('aria-hidden', 'true'); b.insertBefore(layer, b.firstChild); }
        layer.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;contain:strict;transform:translateZ(0);' +
          'background-image:' + cs.backgroundImage + ';background-color:' + cs.backgroundColor + ';background-size:' + cs.backgroundSize +
          ';background-position:' + cs.backgroundPosition + ';background-repeat:' + cs.backgroundRepeat + ';';
        b.style.setProperty('background-image', 'none', 'important');
        b.style.setProperty('background-color', 'transparent', 'important');
        b.style.setProperty('background-attachment', 'scroll', 'important');
      } catch (e) { /* the page keeps its own background */ }
      finally { busy = false; }
    }
    var t = null; function soon() { clearTimeout(t); t = setTimeout(apply, 30); }
    function start() {
      apply();
      // the light/dark switch (and pages that change their look) update the layer
      try {
        var mo = new MutationObserver(soon);
        mo.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme', 'class']});
        mo.observe(document.body, {attributes: true, attributeFilter: ['data-theme', 'class']});
      } catch (e) { /* fine */ }
      addEventListener('load', soon);
      try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', soon); } catch (e) { /* fine */ }
    }
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  })();
})();

// ---------- the "Content writer" menu item gets its icon (a pen with a small sparkle), like the other items ----------
(function () {
  var SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/><path d="M19 13.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" fill="currentColor" stroke="none"/></svg>';
  function fix() {
    var links = document.querySelectorAll('a[href*="content-writer"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i]; if (!a.closest('.seq-sidebar-nav, nav, aside')) continue;
      var ic = a.querySelector('.icon');
      if (ic && ic.querySelector('svg, img')) continue;                     // it already has one
      if (!ic) {                                                             // match the other items: <span class="icon">\u2026</span> label
        ic = document.createElement('span'); ic.className = 'icon';
        var label = a.querySelector('.pts-label');
        if (!label) { label = document.createElement('span'); label.className = 'pts-label'; while (a.firstChild) label.appendChild(a.firstChild); a.appendChild(label); }
        a.insertBefore(ic, a.firstChild); a.insertBefore(document.createTextNode(' '), ic.nextSibling);
      }
      ic.innerHTML = SVG;
    }
  }
  function start() {
    fix();
    try { var mo = new MutationObserver(function () { fix(); }); mo.observe(document.body, {childList: true, subtree: true}); setTimeout(function () { mo.disconnect(); }, 15000); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

// ---------- new accounts: a reminder to confirm their email, on every PalaTrack page, until they do ----------
// For accounts made with email and password after this went live whose email isn't confirmed yet. It stays on screen
// (it can't be closed), offers to send the email again, and disappears by itself as soon as the link has been clicked.
// Google sign-ups and older accounts never see it.
(function () {
  var SINCE = Date.UTC(2026, 10, 26), tries = 0, timer = null;
  function appPage() { return !!document.querySelector('script[src*="sidebar.js"], #sidebar, .seq-sidebar, .seq-sidebar-nav'); }
  function css() {
    if (document.getElementById('ptVerifyCss')) return;
    var st = document.createElement('style'); st.id = 'ptVerifyCss';
    st.textContent = '#ptVerify{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147483600;width:min(680px,calc(100vw - 28px));display:flex;align-items:center;gap:14px;padding:14px 16px 14px 18px;border-radius:18px;color:#fff;font:500 13.5px/1.45 Inter,system-ui,sans-serif;' +
      'background:linear-gradient(135deg,#1E2A78 0%,#3B2F9E 55%,#5B36B8 100%);box-shadow:0 22px 50px -18px rgba(20,14,80,.7),inset 0 0 0 1px rgba(255,255,255,.14);animation:ptVin .4s cubic-bezier(.2,.8,.2,1) both}' +
      '@keyframes ptVin{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}' +
      '#ptVerify .ic{flex-shrink:0;width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(255,255,255,.14)}' +
      '#ptVerify .tx{flex:1;min-width:0} #ptVerify b{display:block;font-size:14.5px;font-weight:700} #ptVerify span{color:rgba(232,236,255,.82)}' +
      '#ptVerify button{flex-shrink:0;border:0;border-radius:11px;padding:9px 14px;font:700 13px Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap}' +
      '#ptVerify .again{background:#fff;color:#2A2380} #ptVerify .done{background:rgba(255,255,255,.14);color:#fff} #ptVerify button:disabled{opacity:.6;cursor:default}' +
      '#ptVerify.ok{background:linear-gradient(135deg,#0E7A4E,#16A34A)}' +
      '@media (max-width:640px){#ptVerify{flex-wrap:wrap;bottom:12px} #ptVerify .tx{flex-basis:calc(100% - 52px)} #ptVerify button{flex:1}}' +
      '@media (prefers-reduced-motion:reduce){#ptVerify{animation:none}}';
    document.head.appendChild(st);
  }
  function show(u) {
    if (document.getElementById('ptVerify')) return;
    css();
    var bar = document.createElement('div'); bar.id = 'ptVerify'; bar.setAttribute('role', 'status');
    bar.innerHTML = '<div class="ic" aria-hidden="true">\u2709\uFE0F</div><div class="tx"><b>Confirm your email address</b><span>We sent a link to <strong></strong>. Click it to confirm your account.</span></div>' +
      '<button type="button" class="again">Send again</button><button type="button" class="done">I\u2019ve confirmed</button>';
    bar.querySelector('strong').textContent = u.email || 'your email';
    document.body.appendChild(bar);
    var say = function (t) { bar.querySelector('span').textContent = t; };
    bar.querySelector('.again').onclick = function (e) { var b = e.currentTarget; b.disabled = true;
      u.sendEmailVerification().then(function () { say('A new link is on its way to ' + (u.email || 'your inbox') + '. Check your spam folder too.'); },
        function () { say('We just sent one. Please wait a minute before asking again.'); });
      setTimeout(function () { b.disabled = false; }, 45000); };
    bar.querySelector('.done').onclick = function () { check(u, true); };
    clearInterval(timer); timer = setInterval(function () { check(u, false); }, 8000);   // goes away by itself once confirmed
  }
  function check(u, asked) {
    u.reload().then(function () {
      var bar = document.getElementById('ptVerify'); if (!bar) return;
      if (u.emailVerified) {
        clearInterval(timer); u.getIdToken(true).catch(function () {});
        bar.className = 'ok'; bar.querySelector('.tx').innerHTML = '<b>Email confirmed. Thank you!</b><span>Your account is all set.</span>';
        bar.querySelectorAll('button').forEach(function (b) { b.remove(); });
        setTimeout(function () { bar.remove(); }, 2600);
      } else if (asked) { bar.querySelector('span').textContent = 'Not confirmed yet. Click the link in the email first (it can take a minute to arrive).'; }
    }, function () { /* offline for a moment */ });
  }
  function start() {
    if (/verify-email\.html|signup\.html|login\.html|auth-action\.html/.test(location.pathname) || !appPage()) return;
    (function wait() {
      var fb = window.firebase, inst = null;
      try { if (fb && fb.apps && fb.apps.length && fb.auth) inst = fb.auth(); } catch (e) { inst = null; }
      if (!inst) { if (++tries < 120) setTimeout(wait, 250); return; }
      inst.onAuthStateChanged(function (u) {
        if (!u || u.emailVerified) { var b = document.getElementById('ptVerify'); if (b) b.remove(); return; }
        var viaPassword = (u.providerData || []).some(function (p) { return p && p.providerId === 'password'; });
        var made = Date.parse((u.metadata && u.metadata.creationTime) || '') || 0;
        if (viaPassword && made >= SINCE) show(u);
      });
    })();
  }
  // the page is read fully first (the menu's script comes after this one: checking too early skipped everything before)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

// ---------- account emails in PalaTrack's own design ----------
// Every page that asks Firebase for a password reset or an email confirmation gets PalaTrack's designed email
// (sent by the sendAccountEmail function) instead of Firebase's plain one. If that fails for any reason, Firebase's
// own email goes out, so nobody is ever left without one.
(function () {
  var FN = 'https://us-central1-lead-tracker-c5c3a.cloudfunctions.net/sendAccountEmail', tries = 0;
  // if the designed email can't be sent, a small note says exactly why (Firebase's plain email still goes out)
  function why(msg) {
    try { console.warn('PalaTrack email:', msg);
      var n = document.createElement('div'); n.setAttribute('role', 'status');
      n.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483647;max-width:min(560px,92vw);padding:10px 14px;border-radius:12px;background:#1E1B4B;color:#fff;font:500 12.5px/1.45 Inter,system-ui,sans-serif;box-shadow:0 12px 30px -12px rgba(0,0,0,.5)';
      n.textContent = 'Sent with Firebase\u2019s standard email instead (reason: ' + msg + ')'; document.body.appendChild(n); setTimeout(function () { n.remove(); }, 12000); } catch (e) { /* ignore */ }
  }
  function call(data, token) {
    var h = {'Content-Type': 'application/json'}; if (token) h.Authorization = 'Bearer ' + token;
    return fetch(FN, {method: 'POST', headers: h, body: JSON.stringify({data: data})})
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) { /* not JSON */ }
        if (!r.ok || !(j && j.result && j.result.ok)) throw new Error('HTTP ' + r.status + (j && j.error ? ' ' + (j.error.status || '') + ' ' + (j.error.message || '') : ' ' + t.slice(0, 120)));
      }); }, function (e) { throw new Error('could not reach the server: ' + (e && e.message || e)); })
      .catch(function (e) { why(String(e && e.message || e)); throw e; });
  }
  (function wait() {
    // Firebase doesn't expose its Auth class, so the hook goes on the sign-in object the page itself uses
    var fb = window.firebase, inst = null;
    try { if (fb && fb.auth && fb.apps && fb.apps.length) inst = fb.auth(); } catch (e) { inst = null; }
    if (!inst) { if (++tries < 240) setTimeout(wait, 250); return; }
    var A = Object.getPrototypeOf(inst);
    if (A.__ptMail) return; A.__ptMail = true;
    var reset = A.sendPasswordResetEmail;
    if (reset) A.sendPasswordResetEmail = function (email, settings) { var self = this;
      return call({kind: 'reset', email: email}).catch(function () { return reset.call(self, email, settings); }); };
    // the confirmation email: attached to the signed-in user itself (Firebase has no shared User class to hook into)
    function patchUser(u) {
      var P = u && Object.getPrototypeOf(u); if (!P || P.__ptMail || typeof P.sendEmailVerification !== 'function') return;
      P.__ptMail = true; var verify = P.sendEmailVerification;
      P.sendEmailVerification = function (settings) { var me = this;
        return me.getIdToken().then(function (t) { return call({kind: 'verify'}, t); }).catch(function () { return verify.call(me, settings); }); };
    }
    var create = A.createUserWithEmailAndPassword;                       // right after a new account is made
    if (create) A.createUserWithEmailAndPassword = function () {
      return create.apply(this, arguments).then(function (cred) { if (cred && cred.user) patchUser(cred.user); return cred; }); };
    var n = 0, iv = setInterval(function () {                             // and whoever is signed in on this page
      try { if (fb.apps && fb.apps.length && fb.auth().currentUser) { patchUser(fb.auth().currentUser); clearInterval(iv); } } catch (e) { /* not ready */ }
      if (++n > 120) clearInterval(iv);
    }, 250);
  })();
})();

// ---------- sign-in: say exactly what's wrong (the email or the password) ----------
// Firebase gives one combined error; when a sign-in fails, PalaTrack asks the checkSignInEmail function whether an
// account exists for the email and how it signs in, then shows the exact reason in the sign-in screen's message spot.
(function () {
  var FN = 'https://us-central1-lead-tracker-c5c3a.cloudfunctions.net/checkSignInEmail', tries = 0;
  var M = {
    en: {noAccount: 'There\u2019s no PalaTrack account with this email address. Check it for typos, or create an account.',
      badPassword: 'That password is incorrect. Try again, or use \u201cForgot password?\u201d to choose a new one.',
      google: 'This account signs in with Google. Use \u201cSign in with Google\u201d instead of a password.',
      badEmail: 'That doesn\u2019t look like a valid email address. Check it and try again.',
      tooMany: 'Too many attempts. Please wait a few minutes, or use \u201cForgot password?\u201d.',
      disabled: 'This account has been switched off. Contact info@palatrack.com for help.',
      offline: 'No internet connection. Check your connection and try again.'},
    nl: {noAccount: 'Er bestaat geen PalaTrack-account met dit e-mailadres. Controleer het op typfouten, of maak een account aan.',
      badPassword: 'Dat wachtwoord klopt niet. Probeer het opnieuw, of gebruik \u201cWachtwoord vergeten?\u201d om een nieuw te kiezen.',
      google: 'Dit account meldt zich aan met Google. Gebruik \u201cAanmelden met Google\u201d in plaats van een wachtwoord.',
      badEmail: 'Dat lijkt geen geldig e-mailadres. Controleer het en probeer opnieuw.',
      tooMany: 'Te veel pogingen. Wacht enkele minuten, of gebruik \u201cWachtwoord vergeten?\u201d.',
      disabled: 'Dit account is uitgeschakeld. Neem contact op via info@palatrack.com.',
      offline: 'Geen internetverbinding. Controleer je verbinding en probeer opnieuw.'}
  };
  function msg(k) { var l = ''; try { l = (localStorage.getItem('preferredLanguage') || document.documentElement.lang || 'en').slice(0, 2).toLowerCase(); } catch (e) { /* ignore */ }
    return (M[l] || M.en)[k]; }
  function show(text) {          // after the page has shown its own general message, replace it with the exact one
    var put = function () { var el = document.getElementById('loginError'); if (el && text) { el.textContent = text; el.classList.add('show'); el.style.display = ''; } };
    setTimeout(put, 30); setTimeout(put, 350);
  }
  function why(email, err) {
    var c = String(err && err.code || '');
    if (c === 'auth/invalid-email') return Promise.resolve('badEmail');
    if (c === 'auth/user-not-found') return Promise.resolve('noAccount');
    if (c === 'auth/wrong-password') return Promise.resolve('badPassword');
    if (c === 'auth/too-many-requests') return Promise.resolve('tooMany');
    if (c === 'auth/user-disabled') return Promise.resolve('disabled');
    if (c === 'auth/network-request-failed') return Promise.resolve('offline');
    if (!/invalid-credential|invalid-login-credentials|internal-error/.test(c)) return Promise.resolve('');
    return fetch(FN, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({data: {email: String(email || '')}})})
      .then(function (r) { return r.json(); }).then(function (j) { var d = j && j.result || {};
        if (d.valid === false) return 'badEmail';
        if (d.limited) return '';
        if (d.exists === false) return 'noAccount';
        if (d.disabled) return 'disabled';
        if (d.google && !d.password) return 'google';
        return d.exists ? 'badPassword' : ''; }, function () { return ''; });
  }
  (function wait() {
    var fb = window.firebase, inst = null;
    try { if (fb && fb.auth && fb.apps && fb.apps.length) inst = fb.auth(); } catch (e) { inst = null; }
    if (!inst) { if (++tries < 240) setTimeout(wait, 250); return; }
    var A = Object.getPrototypeOf(inst); if (A.__ptSignIn) return; A.__ptSignIn = true;
    var signIn = A.signInWithEmailAndPassword; if (!signIn) return;
    A.signInWithEmailAndPassword = function (email) {
      return signIn.apply(this, arguments).catch(function (err) {
        why(email, err).then(function (k) { if (k) show(msg(k)); });
        throw err;                                   // the page still handles the failure as before
      });
    };
  })();
})();

