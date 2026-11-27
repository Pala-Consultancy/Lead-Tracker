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
  // ---------- 4b. Undo: one way to take back a delete, on every page ----------
  // window.ptUndo.offer(message, undo, {commit}) shows "message · Undo" at the bottom and lets Ctrl+Z (Cmd+Z) take it
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
      if (!ic) {                                                             // match the other items: <span class="icon">…</span> label
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

// ---------- new accounts confirm their email address first ----------
// On the app pages (the ones with the PalaTrack menu): an account made with email and password after this went live,
// whose email isn't confirmed yet, is taken to verify-email.html. Google sign-ups and older accounts are never affected.
(function () {
  var SINCE = Date.UTC(2026, 10, 26);                                       // accounts created from 26 Nov 2026
  if (/verify-email\.html|signup\.html|login\.html/.test(location.pathname)) return;
  if (!document.querySelector('script[src*="sidebar.js"]')) return;          // only the app, not the website or client pages
  var tries = 0;
  (function wait() {
    if (!(window.firebase && firebase.apps && firebase.apps.length && firebase.auth)) { if (++tries < 60) setTimeout(wait, 250); return; }
    var off = firebase.auth().onAuthStateChanged(function (u) {
      off && off();
      if (!u || u.emailVerified) return;
      var viaPassword = (u.providerData || []).some(function (p) { return p && p.providerId === 'password'; });
      var made = Date.parse((u.metadata && u.metadata.creationTime) || '') || 0;
      if (viaPassword && made >= SINCE) location.replace('verify-email.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search));
    });
  })();
})();

// ---------- account emails in PalaTrack's own design ----------
// Every page that asks Firebase for a password reset or an email confirmation gets PalaTrack's designed email
// (sent by the sendAccountEmail function) instead of Firebase's plain one. If that fails for any reason, Firebase's
// own email goes out, so nobody is ever left without one.
(function () {
  var FN = 'https://us-central1-lead-tracker-c5c3a.cloudfunctions.net/sendAccountEmail', tries = 0;
  function call(data, token) {
    var h = {'Content-Type': 'application/json'}; if (token) h.Authorization = 'Bearer ' + token;
    return fetch(FN, {method: 'POST', headers: h, body: JSON.stringify({data: data})}).then(function (r) { return r.json(); })
      .then(function (j) { if (!(j && j.result && j.result.ok)) throw new Error('not sent'); });
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
