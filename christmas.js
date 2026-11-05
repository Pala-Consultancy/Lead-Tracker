/* PalaTrack · christmas.js
   The Christmas theme, from November 3 to January 6 (then it switches itself off, until next year).
   Used in three places, chosen with data-place on the script tag:
     app    (loaded by sidebar.js on every tracker page): snow, lights, an ornament (click it), Santa's sleigh now
            and then, the side panel in Christmas colours with a greeting, a Santa hat on the logo, and a one-time
            surprise (a snowy night, the sleigh, a gift that bursts open, Jingle Bells) after the "Welcome back" screen.
            Settings → "Christmas decorations" turns it off (localStorage ptChristmas = 'off').
     site   (the homepage): snow, lights, the ornament, the sleigh, a ribbon under the menu, a Santa hat on the logo,
            and a ❄️ button for visitors (ptChristmasSite).
     client (client onboarding pages): gentle snow and the lights, with a ❄️ button in the top bar (ptChristmasClient).
   Nothing blocks clicks (only the ornament and the buttons are clickable); all sound is made in the browser;
   people who turned animations off get the decorations without movement. Add ?christmas=preview to any page to see it
   outside the season. */
(function () {
  'use strict';
  var me = document.currentScript, PLACE = (me && me.dataset && me.dataset.place) || 'app';
  var KEY = {app: 'ptChristmas', site: 'ptChristmasSite', client: 'ptChristmasClient'}[PLACE] || 'ptChristmas';
  // The season: November 18 – January 6. Before that, only a preview:
  //  - the owner's own account sees it in the app (recognised by a one-way fingerprint of the email, so no address is in this file);
  //  - on any page, ?christmas=preview switches the preview on in that browser (and ?christmas=stop switches it off again).
  var OWNERS = ['744c8f673403cfad7f4ba00807f665fd0bc57f516625b0a9e26406ecdfead12d', '799e7b51c2e000f9d6ff32306c366938d730d9d008d22535c849410b0ec38f4a'];
  try {
    if (/[?&]christmas=preview\b/.test(location.search)) localStorage.setItem('ptXmasPreview', '1');
    if (/[?&]christmas=stop\b/.test(location.search)) localStorage.removeItem('ptXmasPreview');
  } catch (e) { /* ignore */ }
  var owner = false;
  function previewing() { try { return owner || localStorage.getItem('ptXmasPreview') === '1'; } catch (e) { return owner; } }
  function realSeason() { var d = new Date(), m = d.getMonth(), day = d.getDate(); return (m === 10 && day >= 18) || m === 11 || (m === 0 && day <= 6); }
  function inSeason() { return realSeason() || previewing(); }
  // who is logged in is known a moment after the page loads: then check whether it's the owner
  function checkOwner(user) {
    var email = user && user.email ? String(user.email).trim().toLowerCase() : '';
    if (!email || !(window.crypto && crypto.subtle && window.TextEncoder)) { if (owner) { owner = false; apply(); } return; }
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(email)).then(function (buf) {
      var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      var was = owner; owner = OWNERS.indexOf(hex) >= 0; if (owner !== was) apply();
    }).catch(function () {});
  }
  (function waitForFirebase(tries) {
    try { if (window.firebase && firebase.auth) { firebase.auth().onAuthStateChanged(checkOwner); return; } } catch (e) { /* Firebase isn't started yet: try again */ }
    if (tries < 60) setTimeout(function () { waitForFirebase(tries + 1); }, 250);
  })(0);
  function wanted() { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dark = function () { return document.documentElement.getAttribute('data-theme') === 'dark'; };

  // ---------- pictures ----------
  var HAT = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 54"><path d="M6 42C11 20 27 5 47 7c7 1 12 6 11 14-6-5-14-3-18 4-4 7-6 13-7 18z" fill="#D62839"/><path d="M47 7c6 2 10 7 11 14" fill="none" stroke="#A81E2D" stroke-width="2"/><path d="M14 36c8-3 16-3 24 1" fill="none" stroke="#A81E2D" stroke-width="2" opacity=".5"/><rect x="2" y="37" width="40" height="13" rx="6.5" fill="#fff"/><rect x="2" y="37" width="40" height="13" rx="6.5" fill="none" stroke="#E6EBF2" stroke-width="1.5"/><circle cx="57" cy="24" r="6.5" fill="#fff" stroke="#E6EBF2" stroke-width="1.5"/></svg>');
  var ORNAMENT = '<svg viewBox="0 0 48 64" aria-hidden="true"><defs><radialGradient id="xmBall" cx="36%" cy="34%" r="70%"><stop offset="0" stop-color="#FF7A86"/><stop offset=".45" stop-color="#E02D3F"/><stop offset="1" stop-color="#8E1220"/></radialGradient>' +
    '<linearGradient id="xmCap" x1="0" x2="1"><stop offset="0" stop-color="#B8892B"/><stop offset=".5" stop-color="#FFE08A"/><stop offset="1" stop-color="#B8892B"/></linearGradient></defs>' +
    '<path d="M24 2c-4 0-6 3-6 5" fill="none" stroke="#C9A24A" stroke-width="2"/><rect x="17" y="7" width="14" height="8" rx="2" fill="url(#xmCap)"/>' +
    '<circle cx="24" cy="38" r="22" fill="url(#xmBall)"/><path d="M5 34c12 6 26 6 38 0" fill="none" stroke="#FFE08A" stroke-width="2.4" opacity=".9"/>' +
    '<path d="M6 42c12 6 24 6 36 0" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".55" stroke-dasharray="2 3"/><ellipse cx="16" cy="28" rx="5" ry="7" fill="#fff" opacity=".35" transform="rotate(-25 16 28)"/></svg>';
  var SLEIGH = '<svg viewBox="0 0 240 60" aria-hidden="true"><g fill="currentColor">' +
    // two reindeer
    '<g><ellipse cx="34" cy="30" rx="15" ry="6"/><path d="M45 27l8-8 3 2-6 9z"/><circle cx="56" cy="19" r="4"/><path d="M55 15l-2-7M53 10l-4-2M57 15l3-7M59 10l4-2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M22 33l-6 10M26 34l-2 11M40 34l3 10M44 32l7 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></g>' +
    '<g transform="translate(46 4)"><ellipse cx="34" cy="30" rx="15" ry="6"/><path d="M45 27l8-8 3 2-6 9z"/><circle cx="56" cy="19" r="4"/><path d="M55 15l-2-7M53 10l-4-2M57 15l3-7M59 10l4-2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M22 33l-6 10M26 34l-2 11M40 34l3 10M44 32l7 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></g>' +
    '<path d="M60 32 Q100 36 136 36" stroke="currentColor" stroke-width="1.2" fill="none"/>' +
    // the sleigh with Santa and his bag
    '<path d="M136 26h62c6 0 8 6 6 12l-3 7h-56c-6 0-9-5-9-10z"/><path d="M130 52h78c6 0 10-4 11-9" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M146 45v7M190 45v7" stroke="currentColor" stroke-width="2.4"/><circle cx="168" cy="16" r="6"/><path d="M160 26c0-6 4-9 8-9s8 3 8 9z"/><path d="M162 12l12-6 2 6z"/>' +
    '<path d="M180 26c0-10 6-15 13-15s11 6 11 15z"/></g></svg>';

  // ---------- styles ----------
  var Z = PLACE === 'site' ? 60 : PLACE === 'client' ? 15 : 30, TOP = PLACE === 'client' ? 64 : 0;
  var CSS = [
    '#ptXmas{position:fixed;left:0;right:0;bottom:0;top:' + TOP + 'px;pointer-events:none;z-index:' + Z + ';overflow:hidden;--xm-ink:#2B3A55;}',
    'html[data-theme="dark"] #ptXmas{--xm-ink:#DCE6F5;}',
    '#ptXmas canvas{position:absolute;inset:0;width:100%;height:100%;}',
    '#ptXmas .xm-glow{position:absolute;left:0;right:0;top:0;height:180px;background:radial-gradient(55% 120% at 25% 0%,rgba(214,40,57,.07),transparent 70%),radial-gradient(45% 120% at 80% 0%,rgba(42,157,92,.07),transparent 70%);}',
    '#ptXmas .xm-lights{position:absolute;top:0;right:0;height:52px;}',
    '#ptXmas .xm-lights svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}',
    '#ptXmas .xm-bulb{position:absolute;width:9px;height:14px;margin-left:-4.5px;border-radius:50% 50% 45% 45%;animation:xmTwinkle 3.4s ease-in-out infinite;}',
    '#ptXmas .xm-bulb::before{content:"";position:absolute;left:2px;top:-4px;width:6px;height:5px;border-radius:2px;background:#3B4A3F;}',
    '#ptXmas .xm-bulb.r{background:radial-gradient(circle at 40% 35%,#FFD3D7,#E63946 60%);box-shadow:0 0 10px 3px rgba(230,57,70,.5);}',
    '#ptXmas .xm-bulb.g{background:radial-gradient(circle at 40% 35%,#D2F7E1,#2A9D5C 60%);box-shadow:0 0 10px 3px rgba(42,157,92,.45);}',
    '#ptXmas .xm-bulb.y{background:radial-gradient(circle at 40% 35%,#FFF6D2,#F4C542 60%);box-shadow:0 0 10px 3px rgba(244,197,66,.5);}',
    '#ptXmas .xm-bulb.b{background:radial-gradient(circle at 40% 35%,#DCE9FF,#3A86FF 60%);box-shadow:0 0 10px 3px rgba(58,134,255,.45);}',
    '@keyframes xmTwinkle{0%,100%{opacity:1;}50%{opacity:.45;}}',
    '#ptXmas .xm-orn{position:absolute;top:0;right:' + (PLACE === 'site' ? 34 : 12) + 'px;width:34px;transform-origin:50% 0;animation:xmSwing 6s ease-in-out infinite;}',
    '#ptXmas .xm-orn .str{display:block;margin:0 auto;width:1.5px;height:' + (PLACE === 'site' ? 120 : 92) + 'px;background:linear-gradient(#C9A24A,#E8C76A);}',
    '#ptXmas .xm-orn svg{display:block;width:34px;height:46px;margin-top:-3px;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 6px 10px rgba(140,18,32,.3));transition:transform .2s;}',
    '#ptXmas .xm-orn svg:hover{transform:scale(1.08);}',
    '#ptXmas .xm-orn.spin svg{animation:xmSpin .9s cubic-bezier(.3,1.4,.5,1);}',
    '@keyframes xmSwing{0%,100%{transform:rotate(4deg);}50%{transform:rotate(-4deg);}}',
    '@keyframes xmSpin{0%{transform:rotate(0) scale(1);}40%{transform:rotate(200deg) scale(1.18);}100%{transform:rotate(360deg) scale(1);}}',
    '#ptXmas .xm-sleigh{position:absolute;left:0;top:0;width:200px;height:50px;color:var(--xm-ink);opacity:.75;will-change:transform;}',
    '#ptXmas .xm-spark{position:absolute;width:5px;height:5px;border-radius:50%;background:#F4C542;box-shadow:0 0 8px 2px rgba(244,197,66,.8);}',
    // the side panel in Christmas colours (app)
    '.pts-host.pt-xm{background:radial-gradient(120% 34% at 0% 0%,rgba(214,40,57,.10),transparent 70%),radial-gradient(120% 30% at 100% 100%,rgba(42,157,92,.10),transparent 70%),var(--panel);}',
    '.pts-host.pt-xm .seq-sidebar-label{color:#B42332;} html[data-theme="dark"] .pts-host.pt-xm .seq-sidebar-label{color:#FF8A95;}',
    '.pts-host.pt-xm .seq-sidebar-link:hover{background:rgba(214,40,57,.07);color:#9E1E2B;} html[data-theme="dark"] .pts-host.pt-xm .seq-sidebar-link:hover{color:#FFB3BA;}',
    '.pts-host.pt-xm .seq-sidebar-link.active{background:linear-gradient(90deg,rgba(214,40,57,.14),rgba(42,157,92,.07));color:#B42332;box-shadow:inset 3px 0 0 #D62839;}',
    'html[data-theme="dark"] .pts-host.pt-xm .seq-sidebar-link.active{color:#FF9AA4;background:linear-gradient(90deg,rgba(214,40,57,.2),rgba(42,157,92,.1));}',
    '.pts-host.pt-xm .seq-sidebar-link.active .icon{color:#D62839;}',
    '.pts-host.pt-xm .pts-user{background:linear-gradient(var(--panel-alt,var(--pts-soft)),var(--panel-alt,var(--pts-soft))) padding-box,linear-gradient(135deg,#D62839,#2A9D5C) border-box;border:1px solid transparent;}',
    '.pt-xm-greet{margin:10px 6px 6px;padding:11px 12px;border-radius:14px;background:linear-gradient(135deg,#0F3D2A,#1C5A3C);color:#FFE7A3;display:flex;align-items:center;gap:9px;box-shadow:0 8px 20px -10px rgba(15,61,42,.6);position:relative;overflow:hidden;}',
    '.pt-xm-greet::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.5) 1px,transparent 1.5px);background-size:18px 18px;opacity:.25;pointer-events:none;}',
    '.pt-xm-greet .tr{font-size:19px;line-height:1;filter:drop-shadow(0 0 6px rgba(255,231,163,.6));animation:xmTree 3s ease-in-out infinite;}',
    '.pt-xm-greet b{display:block;font:700 12.5px Inter,sans-serif;} .pt-xm-greet small{display:block;font:500 11px Inter,sans-serif;color:#CDE8D8;margin-top:1px;}',
    '@keyframes xmTree{0%,100%{transform:rotate(-4deg);}50%{transform:rotate(4deg);}}',
    'html.pt-xm-on ::selection{background:rgba(214,40,57,.22);}',
    // the Santa hat on the logo (app side panel, Account/Billing, the homepage)
    '.pts-host.pt-xm .pts-logo,html.pt-xm-on .logo-badge,html.pt-xm-on .nav-logo{position:relative;overflow:visible;}',
    'html.pt-xm-hat .pts-host.pt-xm .pts-logo::before,html.pt-xm-on.pt-xm-hat .logo-badge::before,html.pt-xm-on .nav-logo::before{content:"";position:absolute;left:-9px;top:-15px;width:30px;height:25px;background:url("' + HAT + '") center/contain no-repeat;transform:rotate(-18deg);z-index:2;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.2));}',
    // the homepage: the ribbon under the menu, and the ❄️ button for visitors
    '.xm-ribbon{display:flex;justify-content:center;align-items:center;gap:8px;margin:0 auto;padding:9px 16px;font:600 13.5px Inter,sans-serif;color:#8E1D2A;background:linear-gradient(90deg,rgba(214,40,57,.08),rgba(244,197,66,.12),rgba(42,157,92,.08));border-bottom:1px solid rgba(214,40,57,.14);}',
    '.xm-toggle{position:fixed;left:18px;bottom:18px;z-index:' + (Z + 1) + ';width:44px;height:44px;border-radius:50%;border:1px solid rgba(58,134,255,.3);background:#fff;font-size:20px;line-height:1;cursor:pointer;box-shadow:0 6px 16px -6px rgba(16,24,40,.3);transition:transform .15s;}',
    '.xm-toggle:hover{transform:scale(1.08);} .xm-toggle.off{filter:grayscale(1);opacity:.6;}',
    '.xm-preview{position:fixed;right:14px;bottom:14px;z-index:2147482000;display:flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:#0F3D2A;color:#FFE7A3;font:600 12px Inter,system-ui,sans-serif;box-shadow:0 8px 20px -8px rgba(0,0,0,.45);pointer-events:none;}',
    '.xm-preview small{font-weight:500;color:#CDE8D8;}',
    '.xmb span{font-size:15px;line-height:1;} .xmb[aria-pressed="false"] span{filter:grayscale(1);opacity:.55;}',
    '@media (prefers-reduced-motion: reduce){#ptXmas *,.pt-xm-greet .tr{animation:none !important;transition:none !important;}}'
  ].join('\n');

  // ---------- the layer ----------
  var layer = null, timers = [], snow = null;
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  // falling snow on a canvas: light and calm, paused when the tab isn't visible
  function makeSnow(canvas, density, opts) {
    opts = opts || {}; var ctx = canvas.getContext('2d'), flakes = [], W = 0, H = 0, raf = 0, stopped = false, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(opts.max || 70, W * H / density)); while (flakes.length < n) flakes.push(flake(true)); flakes.length = n; }
    function flake(anywhere) { var r = 0.9 + Math.random() * (opts.big ? 3.4 : 2.4); return {x: Math.random() * W, y: anywhere ? Math.random() * H : -10, r: r, vy: 0.25 + r * 0.22 + Math.random() * 0.25, ph: Math.random() * 6.28, sw: 0.3 + Math.random() * 0.6}; }
    function frame() {
      if (stopped) return;
      if (!document.hidden) {
        ctx.clearRect(0, 0, W, H); var dk = opts.night || dark();
        for (var i = 0; i < flakes.length; i++) {
          var f = flakes[i]; f.y += f.vy * (opts.speed || 1); f.ph += 0.012; f.x += Math.sin(f.ph) * f.sw * 0.6;
          if (f.y > H + 6) { flakes[i] = flake(false); continue; }
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283);
          ctx.fillStyle = dk ? 'rgba(255,255,255,' + (0.45 + f.r * 0.12) + ')' : 'rgba(126,150,190,' + (0.25 + f.r * 0.08) + ')'; ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    }
    size(); var onR = function () { size(); }; addEventListener('resize', onR);
    if (reduced) { frame(); stopped = true; cancelAnimationFrame(raf); } else frame();
    return {stop: function () { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', onR); }, burst: function (n) { for (var i = 0; i < n; i++) flakes.push(flake(true)); }};
  }
  // a string of lights along the top (in the app: next to the side panel)
  function lights() {
    if (!layer) return;
    var old = layer.querySelector('.xm-lights'); if (old) old.remove();
    var side = PLACE === 'app' ? document.querySelector('.pts-host') : null, left = side ? Math.round(side.getBoundingClientRect().right) : 0;
    var W = Math.max(200, innerWidth - left - 6), n = Math.max(4, Math.round(W / 120)), seg = W / n, cols = ['r', 'g', 'y', 'b'];
    var path = 'M0 6', bulbs = '';
    for (var i = 0; i < n; i++) {
      var x0 = i * seg, x1 = x0 + seg, sag = 10 + (i % 2) * 5;
      path += ' Q' + (x0 + seg / 2).toFixed(1) + ' ' + (6 + sag * 2) + ' ' + x1.toFixed(1) + ' 6';
      bulbs += '<i class="xm-bulb ' + cols[i % 4] + '" style="left:' + (x0 + seg / 2).toFixed(1) + 'px;top:' + (6 + sag - 1) + 'px;animation-delay:-' + ((i * 0.8) % 3.4).toFixed(1) + 's"></i>';
    }
    var box = document.createElement('div'); box.className = 'xm-lights'; box.style.left = left + 'px';
    box.innerHTML = '<svg aria-hidden="true"><path d="' + path + '" fill="none" stroke="#2F4A3A" stroke-width="1.6" opacity=".55"/></svg>' + bulbs;
    layer.appendChild(box);
  }
  var resizeT = null; addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(lights, 200); });
  // Santa's sleigh: at most once every 20 minutes (remembered across pages); the first one a few minutes in
  var EVERY = 20 * 60 * 1000;
  function due() { var now = Date.now(), last = 0; try { last = Number(localStorage.getItem('ptXmLastSleigh')) || 0; } catch (e) { return false; }
    if (!last) { try { localStorage.setItem('ptXmLastSleigh', String(now - EVERY + 4 * 60000)); } catch (e) {} return false; } return now - last >= EVERY; }
  function flySleigh(host, opts) {
    opts = opts || {}; var W = innerWidth, s = document.createElement('div'); s.className = 'xm-sleigh'; s.innerHTML = SLEIGH;
    if (opts.color) s.style.color = opts.color; if (opts.opacity) s.style.opacity = opts.opacity;
    host.appendChild(s); var y = opts.y != null ? opts.y : 70 + Math.random() * innerHeight * 0.22, dur = opts.dur || 7000;
    var a = s.animate([{transform: 'translate3d(' + (W + 40) + 'px,' + (y + 30) + 'px,0) scaleX(-1)'}, {transform: 'translate3d(' + (W * 0.5) + 'px,' + (y - 20) + 'px,0) scaleX(-1)', offset: 0.5}, {transform: 'translate3d(-240px,' + (y - 50) + 'px,0) scaleX(-1)'}], {duration: dur, easing: 'ease-in-out'});
    var sp = setInterval(function () {                                      // a little trail of sparkles
      var r = s.getBoundingClientRect(), hr = host.getBoundingClientRect(), d = document.createElement('i'); d.className = 'xm-spark';
      d.style.left = (r.right - hr.left - 20) + 'px'; d.style.top = (r.top - hr.top + 36) + 'px'; host.appendChild(d);
      d.animate([{opacity: 1, transform: 'scale(1)'}, {opacity: 0, transform: 'translateY(16px) scale(.3)'}], {duration: 900, easing: 'ease-out'}).onfinish = function () { d.remove(); };
    }, 90);
    a.onfinish = function () { clearInterval(sp); s.remove(); };
    return dur;
  }
  function sleighLoop() {
    if (!layer || reduced || document.hidden) return later(sleighLoop, 30000);
    if (!due()) return later(sleighLoop, 30000);
    flySleigh(layer); try { localStorage.setItem('ptXmLastSleigh', String(Date.now())); } catch (e) {}
    later(sleighLoop, 30000);
  }

  // ---------- sound: bells, made in the browser ----------
  var ac = null, master = null;
  function audio() {
    if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C();
      var lim = ac.createDynamicsCompressor(); lim.threshold.value = -6; lim.ratio.value = 12; lim.connect(ac.destination);
      master = ac.createGain(); master.gain.value = 0.8; master.connect(lim); }
    if (ac.state === 'suspended') ac.resume(); return ac;
  }
  function bell(t, f, vol, dest, len) {                     // a bright bell: FM with an inharmonic partial, long ring
    len = len || 1.6; var o = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f; m.type = 'sine'; m.frequency.value = f * 3.5;
    mg.gain.setValueAtTime(f * 1.8, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + len * 0.6);
    m.connect(mg); mg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(dest || master); o.start(t); m.start(t); o.stop(t + len + 0.05); m.stop(t + len + 0.05);
  }
  var nbuf = null;
  function shake(t, vol, dest) {                            // sleigh bells: a short burst of bright, jingly noise
    if (!nbuf) { nbuf = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate); var d = nbuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var s = ac.createBufferSource(); s.buffer = nbuf; var hp = ac.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 7200; hp.Q.value = 1.2;
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    s.connect(hp); hp.connect(g); g.connect(dest || master); s.start(t); s.stop(t + 0.3);
    bell(t + 0.01, 3520 + Math.random() * 600, vol * 0.25, dest, 0.25);
  }
  function jingle() { if (!audio()) return; var t = ac.currentTime + 0.02; [1046.5, 1318.5, 1568, 2093].forEach(function (f, i) { bell(t + i * 0.09, f, 0.16, null, 1.4); }); for (var k = 0; k < 6; k++) shake(t + k * 0.07, 0.12); }
  window.addEventListener('pt-xmas-jingle', jingle);

  // ---------- on and off ----------
  function on() {
    if (layer) return;
    document.documentElement.classList.add('pt-xm-on');
    if (!document.getElementById('ptXmasCss')) { var st = document.createElement('style'); st.id = 'ptXmasCss'; st.textContent = CSS; document.head.appendChild(st); }
    layer = document.createElement('div'); layer.id = 'ptXmas'; layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<div class="xm-glow"></div><canvas></canvas>' + (PLACE === 'client' ? '' : '<div class="xm-orn"><span class="str"></span>' + ORNAMENT + '</div>');
    document.body.appendChild(layer);
    snow = makeSnow(layer.querySelector('canvas'), PLACE === 'client' ? 34000 : 24000, {max: PLACE === 'client' ? 40 : 70});
    var orn = layer.querySelector('.xm-orn');
    if (orn) orn.querySelector('svg').addEventListener('click', function () {   // click the ornament: it spins and jingles
      orn.classList.remove('spin'); void orn.offsetWidth; orn.classList.add('spin'); jingle(); if (snow) snow.burst(18);
    });
    lights();
    if (PLACE === 'app') {
      var host = document.querySelector('.pts-host');
      if (host) {
        host.classList.add('pt-xm');
        if (!host.querySelector('.pt-xm-greet')) {
          var g = document.createElement('div'); g.className = 'pt-xm-greet';
          g.innerHTML = '<span class="tr">\uD83C\uDF84</span><span><b>Merry Christmas</b><small>Happy holidays from PalaTrack \u2744\uFE0F</small></span>';
          var bottom = host.querySelector('.pts-bottom'); if (bottom) host.insertBefore(g, bottom); else host.appendChild(g);
        }
      }
    }
    if (PLACE === 'site') {
      var nav = document.querySelector('.nav');
      if (nav && !document.querySelector('.xm-ribbon')) { var r = document.createElement('div'); r.className = 'xm-ribbon'; r.innerHTML = '\uD83C\uDF84 Merry Christmas from PalaTrack \u2744\uFE0F'; nav.insertAdjacentElement('afterend', r); }
    }
    if (PLACE !== 'client') later(sleighLoop, 5000);
  }
  function off() {
    document.documentElement.classList.remove('pt-xm-on');
    timers.forEach(clearTimeout); timers = []; if (snow) { snow.stop(); snow = null; }
    if (layer) { layer.remove(); layer = null; }
    var host = document.querySelector('.pts-host'); if (host) { host.classList.remove('pt-xm'); var g = host.querySelector('.pt-xm-greet'); if (g) g.remove(); }
    var r = document.querySelector('.xm-ribbon'); if (r) r.remove();
  }
  // the ❄️ button: on the homepage (bottom left) and in the client page's top bar
  function button() {
    if (PLACE === 'site') {
      var b = document.getElementById('xmToggle');
      if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = 'xmToggle'; b.className = 'xm-toggle'; b.textContent = '\u2744\uFE0F'; document.body.appendChild(b);
        b.addEventListener('click', function () { set(!wanted()); }); }
      b.classList.toggle('off', !wanted()); b.title = wanted() ? 'Turn off the Christmas decorations' : 'Turn on the Christmas decorations'; b.setAttribute('aria-label', b.title);
    }
    if (PLACE === 'client') {
      var c = document.getElementById('xmBtn'), anchor = document.getElementById('themeBtn');
      if (!c && anchor) { c = document.createElement('button'); c.type = 'button'; c.id = 'xmBtn'; c.className = 'link hwb xmb'; c.innerHTML = '<span aria-hidden="true">\u2744\uFE0F</span>';
        anchor.parentNode.insertBefore(c, anchor); c.addEventListener('click', function () { set(!wanted()); }); }
      if (c) { c.setAttribute('aria-pressed', String(wanted())); c.title = wanted() ? 'Turn off the Christmas decorations' : 'Turn on the Christmas decorations'; c.setAttribute('aria-label', c.title); }
    }
  }
  function previewLabel() {
    var l = document.getElementById('xmPreview'), show = !realSeason() && previewing();
    if (show && !l && document.body) { l = document.createElement('div'); l.id = 'xmPreview'; l.className = 'xm-preview'; l.innerHTML = '\uD83C\uDF84 Christmas preview <small>\u00B7 only you see this, until 18 November</small>'; document.body.appendChild(l); }
    if (!show && l) l.remove();
  }
  function apply() {
    if (!document.getElementById('ptXmasCss') && inSeason()) { var st0 = document.createElement('style'); st0.id = 'ptXmasCss'; st0.textContent = CSS; document.head.appendChild(st0); }
    previewLabel();
    if (!inSeason()) { off(); var b0 = document.getElementById('xmToggle'); if (b0) b0.remove(); var c0 = document.getElementById('xmBtn'); if (c0) c0.remove(); return; }
    if (!document.getElementById('ptXmasCss')) { var st = document.createElement('style'); st.id = 'ptXmasCss'; st.textContent = CSS; document.head.appendChild(st); }
    button(); if (wanted()) on(); else off();
  }
  function set(v) { try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) {} apply(); }
  if (PLACE === 'app') window.ptChristmas = {isOn: wanted, inSeason: inSeason, set: set};
  addEventListener('storage', function (e) { if (e.key === KEY) apply(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(apply, 60); }); else setTimeout(apply, 60);

  if (PLACE !== 'app') return;

  // ---------- the Santa hat on the logo: after this account has seen the surprise ----------
  function uid() { try { var u = window.firebase && firebase.auth && firebase.auth().currentUser; return u ? u.uid : ''; } catch (e) { return ''; } }
  function seenKey() { var id = uid(); return id ? 'ptXmIntroSeen:' + id : 'ptXmIntroSeen'; }
  function seen() { try { return localStorage.getItem(seenKey()) === '1'; } catch (e) { return true; } }
  var introRunning = false;
  function updateHat() { if (!introRunning) document.documentElement.classList.toggle('pt-xm-hat', seen()); }
  updateHat();
  (function waitForAuth(tries) {
    try { if (window.firebase && firebase.auth) { firebase.auth().onAuthStateChanged(function () { updateHat(); }); return; } } catch (e) {}
    if (tries < 40) setTimeout(function () { waitForAuth(tries + 1); }, 250);
  })(0);

  // ---------- the surprise: a snowy night, Santa's sleigh, a gift that bursts open, and Jingle Bells ----------
  var ICSS = [
    '.xi-ov{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;overflow:hidden;',
    '  background:radial-gradient(120% 80% at 50% 110%,#22356B 0%,#121E44 45%,#070B1E 100%);animation:xiIn .7s ease both;font-family:Inter,system-ui,sans-serif;}',
    '.xi-ov.out{animation:xiOut .45s ease forwards;}',
    '@keyframes xiIn{from{opacity:0}to{opacity:1}} @keyframes xiOut{to{opacity:0}}',
    '.xi-ov canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}',
    '.xi-stars{position:absolute;inset:0;background-image:radial-gradient(1.4px 1.4px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 28% 32%,#fff,transparent),radial-gradient(1.6px 1.6px at 46% 12%,#fff,transparent),radial-gradient(1px 1px at 64% 26%,#fff,transparent),radial-gradient(1.3px 1.3px at 82% 16%,#fff,transparent),radial-gradient(1px 1px at 90% 40%,#fff,transparent),radial-gradient(1.2px 1.2px at 8% 46%,#fff,transparent),radial-gradient(1px 1px at 36% 52%,#fff,transparent);opacity:.8;animation:xiStar 3s ease-in-out infinite alternate;}',
    '@keyframes xiStar{to{opacity:.45}}',
    '.xi-moon{position:absolute;right:12%;top:9%;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle at 38% 38%,#FFFDF2,#F7E9B8 60%,#E9D38E);box-shadow:0 0 60px 20px rgba(255,240,190,.25);}',
    '.xi-hills{position:absolute;left:-5%;right:-5%;bottom:-2px;height:22%;background:radial-gradient(70% 100% at 25% 100%,#F4F8FF 60%,transparent 61%),radial-gradient(70% 100% at 80% 100%,#E8EFFB 60%,transparent 61%);}',
    '.xi-ov .xm-sleigh{position:absolute;left:0;top:0;width:260px;height:66px;color:#0B1230;opacity:.95;}',
    '.xi-gift{position:absolute;left:50%;top:50%;width:120px;height:120px;margin:-60px 0 0 -60px;}',
    '.xi-gift .box{position:absolute;left:10px;right:10px;bottom:0;height:78px;border-radius:8px;background:linear-gradient(90deg,transparent 42%,#F4C542 42% 58%,transparent 58%),linear-gradient(#E02D3F,#A81E2D);box-shadow:0 18px 30px -12px rgba(0,0,0,.5);}',
    '.xi-gift .lid{position:absolute;left:2px;right:2px;top:26px;height:22px;border-radius:6px;background:linear-gradient(90deg,transparent 42%,#F4C542 42% 58%,transparent 58%),linear-gradient(#F0414F,#C72535);transform-origin:20% 100%;}',
    '.xi-gift .bow{position:absolute;left:50%;top:-4px;width:56px;height:32px;margin-left:-28px;}',
    '.xi-gift .bow::before,.xi-gift .bow::after{content:"";position:absolute;top:6px;width:24px;height:20px;border:5px solid #F4C542;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;}',
    '.xi-gift .bow::before{left:2px;transform:rotate(-20deg);} .xi-gift .bow::after{right:2px;transform:rotate(20deg);}',
    '.xi-conf{position:absolute;left:50%;top:50%;width:9px;height:14px;border-radius:2px;pointer-events:none;}',
    '.xi-card{position:relative;max-width:470px;width:100%;padding:30px 28px 24px;border-radius:24px;background:linear-gradient(180deg,#FFFFFF,#F6F9FF);color:#16202C;text-align:center;box-shadow:0 40px 90px -30px rgba(0,0,0,.7);opacity:0;transform:scale(.6) translateY(40px);}',
    '.xi-card.show{animation:xiCard .6s cubic-bezier(.2,1.4,.4,1) forwards;}',
    '@keyframes xiCard{to{opacity:1;transform:none}}',
    '.xi-card .big{font-size:46px;line-height:1;margin-bottom:6px;}',
    '.xi-card h2{margin:6px 0 10px;font:800 23px/1.25 Sora,Inter,sans-serif;color:#8E1D2A;}',
    '.xi-card p{margin:0 0 10px;font-size:14.5px;line-height:1.55;color:#4A5568;}',
    '.xi-card .tip{display:inline-block;margin:2px 0 14px;padding:7px 12px;border-radius:10px;background:#FFF6DE;color:#7A5A0E;font-size:13px;font-weight:600;}',
    '.xi-btns{display:flex;flex-direction:column;gap:8px;margin-top:6px;}',
    '.xi-btns button{height:46px;border-radius:12px;border:0;font:700 15px Inter,sans-serif;cursor:pointer;}',
    '.xi-btns .go{background:linear-gradient(135deg,#D62839,#A81E2D);color:#fff;box-shadow:0 12px 24px -12px rgba(214,40,57,.8);}',
    '.xi-btns .no{background:none;color:#6B7280;font-weight:600;font-size:13.5px;height:34px;}',
    '.xi-small{margin-top:10px;font-size:12px;color:#8A94A6;}',
    '.xi-mute{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;border:0;background:#EEF2F8;font-size:16px;cursor:pointer;}',
    '.xi-hatfly{position:fixed;z-index:2147483001;width:60px;height:50px;background:url("' + HAT + '") center/contain no-repeat;pointer-events:none;}'
  ].join('\n');
  var musicBus = null, musicTimer = null, musicOn = true;
  // Jingle Bells (James Lord Pierpont, 1857: public domain), the chorus in C, in beats
  var TUNE = [[64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,.5],[64,4],[65,1],[65,1],[65,1.5],[65,.5],[65,1],[64,1],[64,1],[64,.5],[64,.5],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2],
    [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,.5],[64,4],[65,1],[65,1],[65,1.5],[65,.5],[65,1],[64,1],[64,1],[64,.5],[64,.5],[67,1],[67,1],[65,1],[62,1],[60,4]];
  var BASS = [48,48,48,48,53,48,50,43,48,48,48,48,53,48,43,48];          // one note per bar
  var hz = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };
  function startMusic() {
    if (!audio()) return; musicBus = ac.createGain(); musicBus.gain.value = musicOn ? 1 : 0; musicBus.connect(master);
    var beat = 0.42, bars = 16, loopLen = bars * 4 * beat;
    function schedule(t0) {
      var t = t0; TUNE.forEach(function (n) { bell(t, hz(n[0] + 12), 0.13, musicBus, Math.max(0.6, n[1] * beat * 1.6)); t += n[1] * beat; });
      BASS.forEach(function (b, i) { var tb = t0 + i * 4 * beat; [0, 2].forEach(function (k) { var o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = hz(b - 12 + (k ? 7 : 0));
        g.gain.setValueAtTime(0.0001, tb + k * beat); g.gain.exponentialRampToValueAtTime(0.09, tb + k * beat + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, tb + k * beat + beat * 1.8);
        o.connect(g); g.connect(musicBus); o.start(tb + k * beat); o.stop(tb + k * beat + beat * 2); }); });
      for (var q = 0; q < bars * 4; q++) shake(t0 + q * beat, q % 2 ? 0.035 : 0.06, musicBus);   // sleigh bells on every beat
      musicTimer = setTimeout(function () { schedule(t0 + loopLen); }, (t0 + loopLen - ac.currentTime - 1) * 1000);
    }
    schedule(ac.currentTime + 0.1);
  }
  function stopMusic() { clearTimeout(musicTimer); if (musicBus && ac) { musicBus.gain.setTargetAtTime(0, ac.currentTime, 0.15); var b = musicBus; setTimeout(function () { try { b.disconnect(); } catch (e) {} }, 800); } musicBus = null; }

  function play() {
    introRunning = true; try { localStorage.setItem(seenKey(), '1'); } catch (e) {}
    if (!document.getElementById('ptXmIntroCss')) { var st = document.createElement('style'); st.id = 'ptXmIntroCss'; st.textContent = ICSS; document.head.appendChild(st); }
    var ov = document.createElement('div'); ov.className = 'xi-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'xiT');
    ov.innerHTML = '<div class="xi-stars"></div><div class="xi-moon"></div><canvas></canvas><div class="xi-hills"></div>' +
      '<div class="xi-gift" aria-hidden="true"><div class="box"></div><div class="lid"><div class="bow"></div></div></div>' +
      '<div class="xi-card"><button type="button" class="xi-mute" aria-label="Music on or off" aria-pressed="true">\uD83D\uDD0A</button><div class="big">\uD83C\uDF84</div>' +
      '<h2 id="xiT">Christmas has arrived at PalaTrack!</h2>' +
      '<p>Snow, twinkling lights and a little holiday spirit across your whole tracker, until January 6.</p>' +
      '<div class="tip">\uD83C\uDF81 Tip: click the ornament in the top right</div>' +
      '<p style="font-size:13px">Not your thing? Turn it off anytime in <b>Settings \u2192 Christmas decorations</b>.</p>' +
      '<div class="xi-btns"><button type="button" class="go" data-xi="go">Let it snow \u2744\uFE0F</button><button type="button" class="no" data-xi="off">Turn the decorations off</button></div>' +
      '<div class="xi-small">Merry Christmas from the PalaTrack team \uD83C\uDF85</div></div>';
    document.body.appendChild(ov);
    var sn = makeSnow(ov.querySelector('canvas'), 9000, {max: 160, big: true, night: true, speed: 1.3});
    var card = ov.querySelector('.xi-card'), gift = ov.querySelector('.xi-gift');
    startMusic();
    if (reduced) { gift.remove(); card.classList.add('show'); card.querySelector('.go').focus(); }
    else {
      // 1. Santa flies past the moon, 2. the gift drops in and bounces, 3. it bursts open, 4. the card appears
      var sleighHost = ov; flySleigh(sleighHost, {y: innerHeight * 0.12, dur: 3200, color: '#0B1230', opacity: 0.95});
      if (ac) for (var k = 0; k < 24; k++) shake(ac.currentTime + 0.3 + k * 0.1, 0.07);
      gift.animate([{transform: 'translateY(-' + (innerHeight * 0.7) + 'px) rotate(-8deg)'}, {transform: 'translateY(0) rotate(0)', offset: 0.6}, {transform: 'translateY(-26px) rotate(3deg)', offset: 0.75}, {transform: 'translateY(0) rotate(0)', offset: 0.88}, {transform: 'translateY(-6px)', offset: 0.94}, {transform: 'translateY(0)'}],
        {duration: 1300, delay: 2300, easing: 'ease-in', fill: 'both'});
      setTimeout(function () {                                // a little wiggle, then it bursts open
        gift.animate([{transform: 'rotate(0)'}, {transform: 'rotate(-6deg)'}, {transform: 'rotate(6deg)'}, {transform: 'rotate(-4deg)'}, {transform: 'rotate(0)'}], {duration: 500});
      }, 3700);
      setTimeout(function () {
        var lid = gift.querySelector('.lid'); lid.animate([{transform: 'translate(0,0) rotate(0)'}, {transform: 'translate(-60px,-130px) rotate(-55deg)', opacity: 0}], {duration: 700, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards'});
        if (ac) { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) { bell(ac.currentTime + i * 0.06, f, 0.14, null, 2); }); }
        var cols = ['#E63946', '#2A9D5C', '#F4C542', '#3A86FF', '#FFFFFF'];
        for (var i = 0; i < 70; i++) (function () {
          var c = document.createElement('i'); c.className = 'xi-conf'; c.style.background = cols[i % cols.length]; ov.appendChild(c);
          var ang = Math.random() * Math.PI * 2, dist = 160 + Math.random() * 320, dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 180;
          c.animate([{transform: 'translate(-50%,-50%) rotate(0)', opacity: 1}, {transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity: 1, offset: 0.6}, {transform: 'translate(' + dx * 1.1 + 'px,' + (dy + 260) + 'px) rotate(' + (Math.random() * 900) + 'deg)', opacity: 0}],
            {duration: 1800 + Math.random() * 900, easing: 'cubic-bezier(.15,.7,.3,1)'}).onfinish = function () { c.remove(); };
        })();
        sn.burst(60);
        gift.animate([{opacity: 1, transform: 'scale(1)'}, {opacity: 0, transform: 'scale(.6) translateY(30px)'}], {duration: 500, delay: 350, fill: 'forwards'});
        setTimeout(function () { card.classList.add('show'); card.querySelector('.go').focus(); }, 450);
      }, 4250);
    }
    function close(turnOff) {
      if (ov.classList.contains('out')) return;
      stopMusic(); sn.stop(); ov.classList.add('out'); document.removeEventListener('keydown', key, true);
      if (turnOff) { introRunning = false; if (window.ptChristmas) window.ptChristmas.set(false); }
      else flyHat(card);
      setTimeout(function () { ov.remove(); }, 460);
    }
    function key(e) { if (e.key === 'Escape') { e.preventDefault(); close(false); } }
    document.addEventListener('keydown', key, true);
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-xi]'); if (b) { close(b.dataset.xi === 'off'); return; }
      var m = e.target.closest('.xi-mute');
      if (m) { musicOn = !musicOn; m.textContent = musicOn ? '\uD83D\uDD0A' : '\uD83D\uDD07'; m.setAttribute('aria-pressed', String(musicOn)); if (musicBus && ac) musicBus.gain.setTargetAtTime(musicOn ? 1 : 0, ac.currentTime, 0.1); }
    });
  }
  // the Santa hat flies from the card onto the logo
  function flyHat(from) {
    var logo = document.querySelector('.pts-host .pts-logo') || document.querySelector('.logo-badge');
    if (!logo || reduced) { introRunning = false; document.documentElement.classList.add('pt-xm-hat'); return; }
    var a = from.getBoundingClientRect(), b = logo.getBoundingClientRect(), h = document.createElement('div'); h.className = 'xi-hatfly'; document.body.appendChild(h);
    var sx = a.left + a.width / 2 - 30, sy = a.top + 30, ex = b.left - 12, ey = b.top - 18;
    h.animate([{transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1.6) rotate(0deg)'}, {transform: 'translate(' + ((sx + ex) / 2) + 'px,' + (Math.min(sy, ey) - 120) + 'px) scale(1.2) rotate(-200deg)', offset: 0.55}, {transform: 'translate(' + ex + 'px,' + ey + 'px) scale(.55) rotate(-378deg)'}],
      {duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)'}).onfinish = function () { h.remove(); introRunning = false; document.documentElement.classList.add('pt-xm-hat'); if (ac) bell(ac.currentTime, 1568, 0.12, null, 1.2); };
  }
  window.addEventListener('pt-welcome-dismissed', function () { if (inSeason() && wanted() && !seen()) play(); });
  window.ptChristmasIntro = {play: play, reset: function () { try { localStorage.removeItem(seenKey()); } catch (e) {} return 'The Christmas surprise will show again for this account.'; }};
})();
