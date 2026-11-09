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
  function ornament(id, c1, c2, c3, band) {                   // one glass ornament in three shades of a colour
    return ORNAMENT.replace(/xmBall/g, 'xmBall' + id).replace(/xmCap/g, 'xmCap' + id).replace('#FF7A86', c1).replace('#E02D3F', c2).replace('#8E1220', c3).replace(/#FFE08A" stroke-width="2.4"/, band + '" stroke-width="2.4"');
  }
  var ORNAMENT = '<svg viewBox="0 0 48 64" aria-hidden="true"><defs><radialGradient id="xmBall" cx="36%" cy="34%" r="70%"><stop offset="0" stop-color="#FF7A86"/><stop offset=".45" stop-color="#E02D3F"/><stop offset="1" stop-color="#8E1220"/></radialGradient>' +
    '<linearGradient id="xmCap" x1="0" x2="1"><stop offset="0" stop-color="#B8892B"/><stop offset=".5" stop-color="#FFE08A"/><stop offset="1" stop-color="#B8892B"/></linearGradient></defs>' +
    '<path d="M24 2c-4 0-6 3-6 5" fill="none" stroke="#C9A24A" stroke-width="2"/><rect x="17" y="7" width="14" height="8" rx="2" fill="url(#xmCap)"/>' +
    '<circle cx="24" cy="38" r="22" fill="url(#xmBall)"/><path d="M5 34c12 6 26 6 38 0" fill="none" stroke="#FFE08A" stroke-width="2.4" opacity=".9"/>' +
    '<path d="M6 42c12 6 24 6 36 0" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".55" stroke-dasharray="2 3"/><ellipse cx="16" cy="28" rx="5" ry="7" fill="#fff" opacity=".35" transform="rotate(-25 16 28)"/></svg>';
  var SLEIGH = '<svg viewBox="0 0 240 60" aria-hidden="true"><g fill="currentColor">' +
    // two reindeer
    '<g transform="translate(78 0) scale(-1 1)"><ellipse cx="34" cy="30" rx="15" ry="6"/><path d="M45 27l8-8 3 2-6 9z"/><circle cx="56" cy="19" r="4"/><path d="M55 15l-2-7M53 10l-4-2M57 15l3-7M59 10l4-2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M22 33l-6 10M26 34l-2 11M40 34l3 10M44 32l7 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></g>' +
    '<g transform="translate(46 4)"><g transform="translate(78 0) scale(-1 1)"><ellipse cx="34" cy="30" rx="15" ry="6"/><path d="M45 27l8-8 3 2-6 9z"/><circle cx="56" cy="19" r="4"/><path d="M55 15l-2-7M53 10l-4-2M57 15l3-7M59 10l4-2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M22 33l-6 10M26 34l-2 11M40 34l3 10M44 32l7 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></g></g>' +
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
    '#ptXmas .xm-lights.slim{height:14px;}',
    '#ptXmas .xm-lights.slim .xm-bulb{width:6px;height:8px;margin-left:-3px;}',
    '#ptXmas .xm-lights.slim .xm-bulb::before{display:none;}',
    '#ptXmas .xm-lights.slim use{transform-box:fill-box;transform-origin:center top;transform:scale(.7);}',
    '#ptXmas .xm-bulb.aside{visibility:hidden;}',
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
    '#ptXmas .xm-orn.aside{display:none;}',
    '#ptXmas .xm-orn.o2{right:' + (PLACE === 'site' ? 70 : 46) + 'px;width:26px;animation-duration:7s;animation-delay:-2s;} #ptXmas .xm-orn.o2 .str{height:' + (PLACE === 'site' ? 76 : 54) + 'px;} #ptXmas .xm-orn.o2 svg{width:26px;height:35px;}',
    '#ptXmas .xm-orn.o3{right:' + (PLACE === 'site' ? 100 : 74) + 'px;width:22px;animation-duration:8s;animation-delay:-4s;} #ptXmas .xm-orn.o3 .str{height:' + (PLACE === 'site' ? 100 : 74) + 'px;} #ptXmas .xm-orn.o3 svg{width:22px;height:30px;}',
    '@media (max-width:760px){#ptXmas .xm-orn{display:none;}}',
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
    // the selected menu item: a little candy-cane on its left edge
    '.pts-host.pt-xm .seq-sidebar-link.active{position:relative;box-shadow:none;}',
    '.pts-host.pt-xm .seq-sidebar-link.active::after{content:"";position:absolute;left:0;top:7px;bottom:7px;width:4px;border-radius:3px;background:repeating-linear-gradient(-45deg,#D62839 0 4px,#FFFFFF 4px 8px);box-shadow:0 0 0 1px rgba(214,40,57,.22);}',
    // the side panel: faint snowflakes in the background
    '.pts-host.pt-xm{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cg stroke=%27%2392A9C9%27 stroke-width=%271%27 stroke-linecap=%27round%27 opacity=%27.35%27%3E%3Cpath d=%27M20 14v12M14 20h12M16 16l8 8M24 16l-8 8%27/%3E%3Cpath d=%27M84 58v8M80 62h8M81 59l6 6M87 59l-6 6%27/%3E%3Cpath d=%27M44 96v10M39 101h10M40.5 97.5l7 7M47.5 97.5l-7 7%27/%3E%3C/g%3E%3C/svg%3E"),radial-gradient(120% 34% at 0% 0%,rgba(214,40,57,.10),transparent 70%),radial-gradient(120% 30% at 100% 100%,rgba(42,157,92,.10),transparent 70%) !important;background-size:120px 120px,auto,auto !important;}',
    // snow on the cards (Home: the two big cards, the quick-access tiles and the panels at the bottom)
    'html.pt-xm-on .home-hub-card,html.pt-xm-on .home-quick-card,html.pt-xm-on .attention-card{position:relative;}',
    'html.pt-xm-on .home-hub-card::after,html.pt-xm-on .home-quick-card::after,html.pt-xm-on .attention-card::after{content:"";position:absolute;left:-1px;right:-1px;top:-1px;height:14px;border-radius:inherit;border-bottom-left-radius:0;border-bottom-right-radius:0;background:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 200 20%27 preserveAspectRatio=%27none%27%3E%3Cpath d=%27M0 0H200V8C192 13 184 9 174 12C162 16 152 8 140 11C128 14 120 18 108 12C98 7 88 13 76 11C64 9 56 16 44 12C32 8 24 14 14 11C8 9 3 12 0 10Z%27 fill=%27%23FFFFFF%27/%3E%3C/svg%3E") top/100% 100% no-repeat;filter:drop-shadow(0 2px 1.5px rgba(110,130,165,.28));pointer-events:none;z-index:1;}',
    'html.pt-xm-on .home-quick-card::after{height:10px;}',
    // notification badges (and anything else that sits on a card's edge) stay on top of the snow
    'html.pt-xm-on .home-quick-badge,html.pt-xm-on .home-hub-card [class*="badge"],html.pt-xm-on .attention-card [class*="badge"],html.pt-xm-on .home-quick-card [class*="badge"]{position:relative;z-index:3;}',
    'html.pt-xm-on .home-quick-card .home-quick-badge{position:absolute;}',
    'html.pt-xm-on .pt-li-badge{z-index:3;}',
    'html[data-theme="dark"].pt-xm-on .home-hub-card::after,html[data-theme="dark"].pt-xm-on .home-quick-card::after,html[data-theme="dark"].pt-xm-on .attention-card::after{filter:brightness(.92) drop-shadow(0 2px 1.5px rgba(0,0,0,.4));}',
    // a sprig of holly on the "Merry Christmas" card, and snow on its top
    '.pt-xm-greet{overflow:visible !important;}',
    '.pt-xm-greet::before{content:"";position:absolute;right:-6px;top:-12px;width:44px;height:30px;background:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 60 40%27%3E%3Cpath d=%27M30 22C22 12 12 16 4 10c4 6 0 10 6 13 4 2 12 0 20-1z%27 fill=%27%232A9D5C%27/%3E%3Cpath d=%27M30 22c8-10 18-6 26-12-4 6 0 10-6 13-4 2-12 0-20-1z%27 fill=%27%23237F4B%27/%3E%3Ccircle cx=%2726%27 cy=%2724%27 r=%274%27 fill=%27%23E63946%27/%3E%3Ccircle cx=%2734%27 cy=%2724%27 r=%274%27 fill=%27%23D62839%27/%3E%3Ccircle cx=%2730%27 cy=%2729%27 r=%274%27 fill=%27%23C1121F%27/%3E%3Ccircle cx=%2725%27 cy=%2723%27 r=%271.2%27 fill=%27%23fff%27 opacity=%27.7%27/%3E%3C/svg%3E") center/contain no-repeat;transform:rotate(12deg);z-index:2;pointer-events:none;}',
    '.pt-xm-greet .xm-cap{position:absolute;left:-1px;right:-1px;top:-2px;height:9px;border-radius:14px 14px 0 0;background:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 200 20%27 preserveAspectRatio=%27none%27%3E%3Cpath d=%27M0 0H200V8C192 13 184 9 174 12C162 16 152 8 140 11C128 14 120 18 108 12C98 7 88 13 76 11C64 9 56 16 44 12C32 8 24 14 14 11C8 9 3 12 0 10Z%27 fill=%27%23FFFFFF%27/%3E%3C/svg%3E") top/100% 100% no-repeat;pointer-events:none;}',
    '.pts-host.pt-xm .pts-user{background:linear-gradient(var(--panel-alt,var(--pts-soft)),var(--panel-alt,var(--pts-soft))) padding-box,linear-gradient(135deg,#D62839,#2A9D5C) border-box;border:1px solid transparent;}',
    '.pt-xm-greet{margin:10px 6px 6px;padding:11px 12px;border-radius:14px;background:linear-gradient(135deg,#0F3D2A,#1C5A3C);color:#FFE7A3;display:flex;align-items:center;gap:9px;box-shadow:0 8px 20px -10px rgba(15,61,42,.6);position:relative;overflow:hidden;}',
    '.pt-xm-greet::after{content:"";position:absolute;inset:0;border-radius:inherit;background-image:radial-gradient(rgba(255,255,255,.5) 1px,transparent 1.5px);background-size:18px 18px;opacity:.25;pointer-events:none;}',
    '.pt-xm-greet .tr{font-size:19px;line-height:1;filter:drop-shadow(0 0 6px rgba(255,231,163,.6));animation:xmTree 3s ease-in-out infinite;}',
    '.pt-xm-greet b{display:block;font:700 12.5px Inter,sans-serif;} .pt-xm-greet small{display:block;font:500 11px Inter,sans-serif;color:#CDE8D8;margin-top:1px;}',
    '@keyframes xmTree{0%,100%{transform:rotate(-4deg);}50%{transform:rotate(4deg);}}',
    'html.pt-xm-on ::selection{background:rgba(214,40,57,.22);}',
    // the Santa hat on the logo (app side panel, Account/Billing, the homepage): its brim rests on top of the P's stem
    // and the tip slumps over towards the ring; placed in % of the logo, so it fits every logo size
    '.pts-host.pt-xm .pts-logo,html.pt-xm-on .logo-badge,html.pt-xm-on .nav-logo{position:relative;overflow:visible;}',
    'html.pt-xm-hat .pts-host.pt-xm .pts-logo::before,html.pt-xm-on.pt-xm-hat .logo-badge::before,html.pt-xm-on .nav-logo::before{content:"";position:absolute;left:18.5%;top:-3.8%;width:41.6%;height:35.1%;background:url("' + HAT + '") center/contain no-repeat;transform:rotate(7deg);transform-origin:34% 80%;z-index:2;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.2));}',
    // the homepage: the ribbon under the menu, and the ❄️ button for visitors
    '.xm-ribbon{display:flex;justify-content:center;align-items:center;gap:8px;margin:0 auto;padding:9px 16px;font:600 13.5px Inter,sans-serif;color:#8E1D2A;background:linear-gradient(90deg,rgba(214,40,57,.08),rgba(244,197,66,.12),rgba(42,157,92,.08));border-bottom:1px solid rgba(214,40,57,.14);}',
    '.xm-toggle{position:fixed;left:18px;bottom:18px;z-index:' + (Z + 1) + ';width:44px;height:44px;border-radius:50%;border:1px solid rgba(58,134,255,.3);background:#fff;font-size:20px;line-height:1;cursor:pointer;box-shadow:0 6px 16px -6px rgba(16,24,40,.3);transition:transform .15s;}',
    '.xm-toggle:hover{transform:scale(1.08);} .xm-toggle.off{filter:grayscale(1);opacity:.6;}',
    '.xm-preview{position:fixed;right:14px;bottom:14px;z-index:2147482000;display:flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:#0F3D2A;color:#FFE7A3;font:600 12px Inter,system-ui,sans-serif;box-shadow:0 8px 20px -8px rgba(0,0,0,.45);pointer-events:none;}',
    '.xm-preview small{font-weight:500;color:#CDE8D8;}',
    '@media (max-width:600px){.xm-preview small{display:none;}.xm-preview{right:12px;bottom:18px;}}',
    '.xmb span{font-size:15px;line-height:1;} .xmb[aria-pressed="false"] span{filter:grayscale(1);opacity:.55;}',
    '@media (prefers-reduced-motion: reduce){#ptXmas *,.pt-xm-greet .tr{animation:none !important;transition:none !important;}}'
  ].join('\n');

  // ---------- the layer ----------
  var layer = null, timers = [], snow = null;
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  // falling snow on a canvas: light and calm, paused when the tab isn't visible
  function makeSnow(canvas, density, opts) {
    opts = opts || {}; var ctx = canvas.getContext('2d'), flakes = [], W = 0, H = 0, raf = 0, stopped = false, dpr = 1, sprite = null;
    if (opts.soft) { sprite = document.createElement('canvas'); sprite.width = sprite.height = 32; var sx = sprite.getContext('2d'), gr = sx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 32, 32); }
    function size() { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (opts.once) return;                                   // snow that only falls in short flurries: nothing falls by itself
      var n = Math.round(Math.min(opts.max || 70, W * H / density)); while (flakes.length < n) flakes.push(flake(true)); flakes.length = n; }
    function flake(anywhere) { var r = 0.9 + Math.random() * (opts.big ? 3.4 : 2.4); return {x: Math.random() * W, y: anywhere ? Math.random() * H : -10, r: r, vy: 0.25 + r * 0.22 + Math.random() * 0.25, ph: Math.random() * 6.28, sw: 0.3 + Math.random() * 0.6}; }
    var running = false;
    function frame() {
      if (stopped) { running = false; return; }
      if (opts.once && !flakes.length) { ctx.clearRect(0, 0, W, H); running = false; return; }   // the flurry is over: stop drawing
      running = true;
      if (!document.hidden) {
        ctx.clearRect(0, 0, W, H); var dk = opts.night || dark();
        for (var i = 0; i < flakes.length; i++) {
          var f = flakes[i]; f.y += f.vy * (opts.speed || 1); f.ph += 0.012; f.x += Math.sin(f.ph) * f.sw * 0.6;
          if (f.y > H + 6) { if (opts.once) { flakes.splice(i, 1); i--; } else flakes[i] = flake(false); continue; }
          if (sprite) { ctx.globalAlpha = 0.55 + f.r * 0.08; ctx.drawImage(sprite, f.x - f.r * 2.2, f.y - f.r * 2.2, f.r * 4.4, f.r * 4.4); ctx.globalAlpha = 1; continue; }
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283);
          ctx.fillStyle = dk ? 'rgba(255,255,255,' + (0.45 + f.r * 0.12) + ')' : 'rgba(126,150,190,' + (0.25 + f.r * 0.08) + ')'; ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    }
    size(); var onR = function () { size(); }; addEventListener('resize', onR);
    if (reduced) { frame(); stopped = true; cancelAnimationFrame(raf); } else frame();
    return {stop: function () { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', onR); },
      burst: function (n) {
        for (var i = 0; i < n; i++) { var f = flake(true); if (opts.once) f.y = -Math.random() * H * 0.4 - 10; flakes.push(f); }   // a flurry comes in from the top
        if (!running && !stopped && !reduced) frame();
      }};
  }
  // a string of lights along the top (in the app: next to the side panel)
  function lights() {
    if (!layer) return;
    var old = layer.querySelector('.xm-lights'); if (old) old.remove();
    var side = PLACE === 'app' ? document.querySelector('.pts-host') : null, left = side ? Math.round(side.getBoundingClientRect().right) : 0;
    var W = Math.max(200, innerWidth - left - 6), n = Math.max(4, Math.round(W / 120)), seg = W / n, cols = ['r', 'g', 'y', 'b'];
    // inside the app a slim garland along the very top edge (the page's top bar stays free); elsewhere the full one
    var slim = PLACE === 'app', top = slim ? 1 : 6;
    var path = 'M0 ' + top, bulbs = '', bows = '';
    for (var i = 0; i < n; i++) {
      var x0 = i * seg, x1 = x0 + seg, sag = slim ? 3 + (i % 2) : 12 + (i % 2) * 5;
      path += ' Q' + (x0 + seg / 2).toFixed(1) + ' ' + (top + sag * 2) + ' ' + x1.toFixed(1) + ' ' + top;
      bulbs += '<i class="xm-bulb ' + cols[i % 4] + '" style="left:' + (x0 + seg / 2).toFixed(1) + 'px;top:' + (top + sag - 1) + 'px;animation-delay:-' + ((i * 0.8) % 3.4).toFixed(1) + 's"></i>';
      if (i > 0) bows += '<use href="#xmBow" x="' + (x0 - 9).toFixed(1) + '" y="' + (slim ? -4 : 0) + '"' + (slim ? ' transform="scale(1)"' : '') + '/>';
    }
    var box = document.createElement('div'); box.className = 'xm-lights' + (slim ? ' slim' : ''); box.style.left = left + 'px';
    box.innerHTML = '<svg aria-hidden="true"><defs><g id="xmBow"><path d="M9 7C5 2 0 3 1 7s5 4 8 0zM9 7c4-5 9-4 8 0s-5 4-8 0z" fill="#D62839"/><path d="M8 8l-3 8 3-2 1 3 1-9zM10 8l3 8-3-2-1 3-1-9z" fill="#B21F2F"/><circle cx="9" cy="7" r="2.2" fill="#E63946"/></g></defs>' +
      '<path d="' + path + '" fill="none" stroke="#1E5A38" stroke-width="' + (slim ? 6 : 9) + '" stroke-linecap="round"/>' +
      '<path d="' + path + '" fill="none" stroke="#2E7D4F" stroke-width="' + (slim ? 4.5 : 7) + '" stroke-dasharray="1.2 3.2" stroke-linecap="round"/>' +
      '<path d="' + path + '" fill="none" stroke="#4FA36F" stroke-width="' + (slim ? 2.5 : 4) + '" stroke-dasharray="1 5" stroke-dashoffset="2" stroke-linecap="round" opacity=".8"/>' + bows + '</svg>' + bulbs;
    layer.appendChild(box);
  }
  var resizeT = null; addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(function () { lights(); clearOrnaments(); }, 200); });
  // an ornament never covers something you can click: if a button or link is under it, it steps aside on that page
  var CLICKABLE = 'button,a[href],input,select,textarea,[role="button"],[onclick],label[for]';
  // is there something clickable at this spot (ignoring the decorations themselves)?
  function clickableAt(x, y) {
    var els = document.elementsFromPoint(x, y) || [];
    for (var i = 0; i < els.length; i++) { var el = els[i]; if (layer.contains(el)) continue; return !!(el.closest && el.closest(CLICKABLE)); }
    return false;
  }
  function clearBulbs() {
    if (!layer) return;
    var bulbs = layer.querySelectorAll('.xm-lights .xm-bulb'); if (!bulbs.length) return;
    bulbs.forEach(function (bl) {
      var r = bl.getBoundingClientRect(); if (!r.width) return;
      var hit = clickableAt(r.left + r.width / 2, r.top + r.height / 2) || clickableAt(r.left + r.width / 2, r.bottom - 1);
      bl.classList.toggle('aside', hit);
    });
  }
  function clearOrnaments() {
    if (!layer) return;
    clearBulbs();
    layer.querySelectorAll('.xm-orn').forEach(function (o) {
      var was = o.classList.contains('aside'); if (was) o.classList.remove('aside');
      var svg = o.querySelector('svg'); if (!svg) { if (was) o.classList.add('aside'); return; }
      var r = svg.getBoundingClientRect(); if (!r.width) { if (was) o.classList.add('aside'); return; }
      var m = 14, xs = [r.left - m, r.left + r.width / 2, r.right + m], ys = [r.top + 4, r.top + r.height / 2, r.bottom + m];
      var hit = false;
      for (var a = 0; a < 3 && !hit; a++) for (var c = 0; c < 3 && !hit; c++) hit = clickableAt(xs[a], ys[c]);
      if (hit) o.classList.add('aside');
    });
  }
  var lastScroll = 0, clearT = null;
  addEventListener('scroll', function () { lastScroll = Date.now(); }, {passive: true, capture: true});
  function clearSoon() {
    clearTimeout(clearT);
    clearT = setTimeout(function run() {
      if (document.hidden) return;
      if (Date.now() - lastScroll < 400) { clearT = setTimeout(run, 400); return; }      // wait until scrolling stops
      (window.requestIdleCallback || function (f) { return setTimeout(f, 1); })(clearOrnaments);
    }, 500);
  }
  try { new MutationObserver(clearSoon).observe(document.body, {childList: true, subtree: true}); } catch (e) { /* fine */ }
  addEventListener('load', clearSoon);
  setInterval(function () { if (!document.hidden && Date.now() - lastScroll > 1000) clearOrnaments(); }, 10000);
  clearSoon();
  // Santa's sleigh: at most once every 20 minutes (remembered across pages); the first one a few minutes in
  var EVERY = 20 * 60 * 1000;
  function due() { var now = Date.now(), last = 0; try { last = Number(localStorage.getItem('ptXmLastSleigh')) || 0; } catch (e) { return false; }
    if (!last) { try { localStorage.setItem('ptXmLastSleigh', String(now - EVERY + 4 * 60000)); } catch (e) {} return false; } return now - last >= EVERY; }
  function flySleigh(host, opts) {
    opts = opts || {}; var W = innerWidth, s = document.createElement('div'); s.className = 'xm-sleigh'; s.innerHTML = SLEIGH;
    if (opts.color) s.style.color = opts.color; if (opts.opacity) s.style.opacity = opts.opacity;
    host.appendChild(s); var y = opts.y != null ? opts.y : 70 + Math.random() * innerHeight * 0.22, dur = opts.dur || 7000;
    var a = s.animate([{transform: 'translate3d(' + (W + 40) + 'px,' + (y + 30) + 'px,0) rotate(5deg)'}, {transform: 'translate3d(' + (W * 0.5) + 'px,' + (y - 20) + 'px,0)', offset: 0.5}, {transform: 'translate3d(-240px,' + (y - 50) + 'px,0) rotate(5deg)'}], {duration: dur, easing: 'ease-in-out'});
    var sp = setInterval(function () {                                      // a little trail of sparkles
      var r = s.getBoundingClientRect(), hr = host.getBoundingClientRect(), d = document.createElement('i'); d.className = 'xm-spark';
      d.style.left = (r.right - hr.left - 14) + 'px'; d.style.top = (r.top - hr.top + 36) + 'px'; host.appendChild(d);
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
    layer.innerHTML = '<div class="xm-glow"></div><canvas></canvas>' + (PLACE === 'client' ? '' :
      '<div class="xm-orn o2"><span class="str"></span>' + ornament('g', '#FFF1B8', '#E9B949', '#9A6B12', '#FFFFFF') + '</div>' +
      '<div class="xm-orn o3"><span class="str"></span>' + ornament('n', '#9BE3B4', '#2A9D5C', '#145A33', '#FFE08A') + '</div>' +
      '<div class="xm-orn"><span class="str"></span>' + ORNAMENT + '</div>');
    document.body.appendChild(layer);
    snow = makeSnow(layer.querySelector('canvas'), PLACE === 'client' ? 34000 : 24000, {max: PLACE === 'client' ? 40 : 70, once: PLACE === 'app', speed: PLACE === 'app' ? 2.6 : 1});
    layer.querySelectorAll('.xm-orn').forEach(function (orn) {
      orn.querySelector('svg').addEventListener('click', function () {   // click an ornament: it spins and jingles
        orn.classList.remove('spin'); void orn.offsetWidth; orn.classList.add('spin'); jingle(); if (snow) snow.burst(PLACE === 'app' ? 40 : 18);
      });
    });
    lights();
    if (PLACE === 'app') {
      var host = document.querySelector('.pts-host');
      if (host) {
        host.classList.add('pt-xm');
        if (!host.querySelector('.pt-xm-greet')) {
          var g = document.createElement('div'); g.className = 'pt-xm-greet';
          g.innerHTML = '<i class="xm-cap" aria-hidden="true"></i><span class="tr">\uD83C\uDF84</span><span><b>Merry Christmas</b><small>Happy holidays from PalaTrack \u2744\uFE0F</small></span>';
          var bottom = host.querySelector('.pts-bottom'); if (bottom) host.insertBefore(g, bottom); else host.appendChild(g);
        }
      }
    }
    if (PLACE === 'site') {
      var nav = document.querySelector('.nav');
      if (nav && !document.querySelector('.xm-ribbon')) { var r = document.createElement('div'); r.className = 'xm-ribbon'; r.innerHTML = '\uD83C\uDF84 Merry Christmas from PalaTrack \u2744\uFE0F'; nav.insertAdjacentElement('afterend', r); placeRibbon(); setTimeout(placeRibbon, 400); }
    }
    if (PLACE !== 'client') later(sleighLoop, 5000);
  }
  function placeRibbon() {
    var r = document.querySelector('.xm-ribbon'), nav = document.querySelector('.nav'); if (!r || !nav) return;
    r.style.marginTop = '';
    var pos = getComputedStyle(nav).position; if (pos !== 'fixed' && pos !== 'sticky') return;
    var below = nav.getBoundingClientRect().bottom, top = r.getBoundingClientRect().top;
    if (top < below) r.style.marginTop = Math.ceil(below - top) + 'px';
  }
  addEventListener('resize', function () { setTimeout(placeRibbon, 150); });
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

  // ---------- Santa, for the surprise: a friendly cartoon, with a waving arm, a mouth and a belly that move ----------
  var SANTA = '<svg viewBox="-26 -16 256 266" aria-hidden="true">' +
    '<defs><radialGradient id="xsSuit" cx="45%" cy="30%" r="80%"><stop offset="0" stop-color="#F0414F"/><stop offset="1" stop-color="#A81E2D"/></radialGradient></defs>' +
    // the body, the belt and the fur
    '<g class="xs-belly"><path d="M30 250c0-64 34-104 80-104s80 40 80 104z" fill="url(#xsSuit)"/>' +
    '<rect x="44" y="204" width="132" height="18" rx="4" fill="#1F2430"/><rect x="98" y="200" width="26" height="26" rx="4" fill="none" stroke="#F4C542" stroke-width="5"/>' +
    '<path d="M110 150v54" stroke="#fff" stroke-width="16" stroke-linecap="round"/></g>' +
    // the waving arm (left side, from Santa's shoulder)
    '<g class="xs-arm"><path d="M52 176c-16-10-26-30-28-52" stroke="#C72535" stroke-width="22" stroke-linecap="round" fill="none"/>' +
    '<rect x="11" y="114" width="27" height="10" rx="5" fill="#fff" transform="rotate(-8 24 119)"/><circle cx="22" cy="104" r="13" fill="#2A9D5C"/><circle cx="12" cy="100" r="6" fill="#2A9D5C"/></g>' +
    '<path d="M168 176c12 10 16 24 14 40" stroke="#C72535" stroke-width="22" stroke-linecap="round" fill="none"/><circle cx="182" cy="220" r="12" fill="#2A9D5C"/>' +
    // the head: face, beard, moustache and mouth
    '<g class="xs-head"><circle cx="110" cy="96" r="40" fill="#F6C9A8"/>' +
    '<path d="M66 100c0 40 18 70 44 70s44-30 44-70c-8 10-22 14-44 14s-36-4-44-14z" fill="#fff"/>' +
    '<path d="M70 104c4 22 12 40 22 50M150 104c-4 22-12 40-22 50" stroke="#E8EDF5" stroke-width="3" fill="none"/>' +
    '<ellipse class="xs-mouth" cx="110" cy="121" rx="9" ry="3" fill="#7A2230"/>' +
    '<path d="M110 112c-6-8-22-8-28 2 8 2 18 4 28-2zM110 112c6-8 22-8 28 2-8 2-18 4-28-2z" fill="#fff" stroke="#E8EDF5" stroke-width="1.5"/>' +
    '<circle cx="110" cy="104" r="7" fill="#E9967F"/><circle cx="86" cy="104" r="7" fill="#F2A0A8" opacity=".7"/><circle cx="134" cy="104" r="7" fill="#F2A0A8" opacity=".7"/>' +
    '<path d="M92 90q5-6 10 0M118 90q5-6 10 0" stroke="#2B2233" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M88 80q8-5 16 0M116 80q8-5 16 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    // the hat
    '<path d="M70 74c4-34 30-52 62-44 22 6 34 22 40 44-10-6-22-6-28 4-14-6-40-8-74-4z" fill="url(#xsSuit)"/>' +
    '<rect x="64" y="66" width="92" height="18" rx="9" fill="#fff"/><circle cx="174" cy="80" r="12" fill="#fff"/></g></svg>';

  // ---------- "Ho ho ho!": the recording christmas-hohoho.mp3 (next to this file). Without it, Santa says it silently. ----------
  var HOHO_FILE = (me && me.src ? me.src.replace(/[^\/?#]*([?#].*)?$/, '') : '') + 'christmas-hohoho.mp3', hohoBuf = null, hohoTried = false;
  function loadHoho() {
    if (hohoTried || !audio()) return; hohoTried = true;
    fetch(HOHO_FILE).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(function (b) { return new Promise(function (ok, no) { ac.decodeAudioData(b, ok, no); }); })
      .then(function (buf) { hohoBuf = buf; }).catch(function () { hohoTried = 'failed'; /* the recording couldn't load: Santa's bubble still shows, without sound */ });
  }
  // Santa says it: the sound, the words in the bubble, his mouth and belly, all at the same moments
  var HOHO_TIMES = [0.39, 0.72, 1.07];                         // where the three "Ho"s are in christmas-hohoho.mp3
  function hohoho(santa) {
    var gaps = HOHO_TIMES, words = santa.querySelectorAll('.xi-bubble b'), mouth = santa.querySelector('.xs-mouth'), belly = santa.querySelector('.xs-belly');
    if (ac) {
      if (musicBus) { musicBus.gain.setTargetAtTime(musicOn ? 0.3 : 0, ac.currentTime, 0.05); setTimeout(function () { if (musicBus) musicBus.gain.setTargetAtTime(musicOn ? 1 : 0, ac.currentTime, 0.3); }, 2100); }
      var t0 = ac.currentTime + 0.05;
      if (hohoBuf) { var s0 = ac.createBufferSource(); s0.buffer = hohoBuf; var g0 = ac.createGain(); g0.gain.value = 1; s0.connect(g0); g0.connect(master); s0.start(t0); }
    }
    gaps.forEach(function (g, i) {
      setTimeout(function () {
        if (words[i]) words[i].classList.add('on'); if (i === 0) santa.querySelector('.xi-bubble').classList.add('on');
        if (mouth && mouth.animate) mouth.animate([{transform: 'scaleY(1)'}, {transform: 'scaleY(3)'}, {transform: 'scaleY(1)'}], {duration: 380, easing: 'ease-out'});
        if (belly && belly.animate) belly.animate([{transform: 'scale(1,1)'}, {transform: 'scale(1.04,.95)'}, {transform: 'scale(.98,1.03)'}, {transform: 'scale(1,1)'}], {duration: 380, easing: 'ease-out'});
      }, g * 1000 + 50);
    });
  }

  // ---------- the surprise: a little Christmas movie ----------
  // 1. a magical night: northern lights, a rising moon, mountains, a village with lit windows and smoking chimneys,
  //    snow in two depths and a shooting star; 2. Santa's sleigh (Rudolph's nose glowing) flies past the moon with a trail
  //    of golden dust and drops the gift; 3. it lands in the snow (a snow burst, a thud, a little shake); 4. it glows and
  //    wiggles, faster and faster; 5. a flash: the lid blasts off, light rays shine out, confetti and stars; 6. Santa rises
  //    and says "Ho, ho, ho!"; 7. "Merry Christmas" in glowing gold letters; 8. the card flips in with a golden border.
  var ICSS = [
    '.xi-ov{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;overflow:hidden;font-family:Inter,system-ui,sans-serif;',
    '  background:linear-gradient(180deg,#040814 0%,#0A1430 40%,#16244F 75%,#22356B 100%);animation:xiIn .9s ease both;perspective:1200px;}',
    '.xi-ov.out{animation:xiOut .55s ease forwards;}',
    '@keyframes xiIn{from{opacity:0}to{opacity:1}} @keyframes xiOut{to{opacity:0}}',
    '.xi-scene{position:absolute;inset:0;}',
    '.xi-scene canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}',
    '.xi-stars{position:absolute;inset:0;will-change:opacity;background-image:radial-gradient(1.4px 1.4px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 28% 32%,#fff,transparent),radial-gradient(1.6px 1.6px at 46% 12%,#fff,transparent),radial-gradient(1px 1px at 64% 26%,#fff,transparent),radial-gradient(1.3px 1.3px at 82% 16%,#fff,transparent),radial-gradient(1px 1px at 90% 40%,#fff,transparent),radial-gradient(1.2px 1.2px at 8% 46%,#fff,transparent),radial-gradient(1px 1px at 36% 52%,#fff,transparent),radial-gradient(1.1px 1.1px at 55% 40%,#fff,transparent),radial-gradient(1px 1px at 74% 8%,#fff,transparent),radial-gradient(1.4px 1.4px at 20% 6%,#fff,transparent);animation:xiStar 2.6s ease-in-out infinite alternate;}',
    '@keyframes xiStar{from{opacity:.95}to{opacity:.5}}',
    // the northern lights: two soft ribbons that drift and shimmer
    '.xi-aur{position:absolute;left:-20%;right:-20%;height:52%;top:-8%;opacity:0;animation:xiAurIn 2.4s ease .3s forwards;}',
    '.xi-aur i{position:absolute;inset:0;will-change:transform;}',
    '.xi-aur .a1{background:radial-gradient(38% 34% at 32% 46%,rgba(56,239,170,.42),rgba(56,239,170,.18) 45%,transparent 72%),radial-gradient(26% 30% at 50% 40%,rgba(90,255,200,.2),transparent 70%);animation:xiAur1 9s ease-in-out infinite alternate;}',
    '.xi-aur .a2{background:radial-gradient(34% 30% at 62% 42%,rgba(150,90,255,.36),rgba(150,90,255,.14) 50%,transparent 74%),radial-gradient(24% 26% at 74% 36%,rgba(70,160,255,.24),transparent 70%);animation:xiAur2 11s ease-in-out infinite alternate;}',
    '@keyframes xiAurIn{to{opacity:1}} @keyframes xiAur1{from{transform:translateX(-6%) skewY(-4deg) scaleY(.8)}to{transform:translateX(8%) skewY(3deg) scaleY(1.1)}} @keyframes xiAur2{from{transform:translateX(7%) skewY(3deg)}to{transform:translateX(-7%) skewY(-3deg) scaleY(1.2)}}',
    '.xi-moon{position:absolute;right:12%;top:8%;width:118px;height:118px;border-radius:50%;background:radial-gradient(circle at 38% 38%,#FFFDF2,#F7E9B8 60%,#E9D38E);box-shadow:0 0 70px 26px rgba(255,240,190,.28),0 0 160px 60px rgba(255,240,190,.08);animation:xiMoon 3s cubic-bezier(.2,.8,.2,1) both;}',
    '.xi-moon::before{content:"";position:absolute;left:26%;top:30%;width:16%;height:16%;border-radius:50%;background:rgba(200,180,120,.25);box-shadow:30px 14px 0 -2px rgba(200,180,120,.18),12px 34px 0 -4px rgba(200,180,120,.16);}',
    '@keyframes xiMoon{from{transform:translateY(60px);opacity:0}to{transform:none;opacity:1}}',
    '.xi-mount{position:absolute;left:0;right:0;bottom:16%;height:34%;}',
    '.xi-village{position:absolute;left:0;right:0;bottom:12%;height:22%;}',
    '.xi-mount svg,.xi-village svg,.xi-trees svg{position:absolute;inset:0;width:100%;height:100%;}',
    '.xi-win{animation:xiWin 3s ease-in-out infinite alternate;} @keyframes xiWin{from{opacity:.85}to{opacity:1}}',
    '.xi-smoke{position:absolute;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,rgba(220,230,255,.4),rgba(220,230,255,0) 70%);animation:xiSmoke 4s linear infinite;will-change:transform,opacity;}',
    '@keyframes xiSmoke{from{transform:translate(0,0) scale(.6);opacity:.7}to{transform:translate(26px,-90px) scale(2.4);opacity:0}}',
    '.xi-hills{position:absolute;left:-5%;right:-5%;bottom:-2px;height:22%;background:radial-gradient(70% 100% at 25% 100%,#F4F8FF 60%,transparent 61%),radial-gradient(70% 100% at 80% 100%,#E8EFFB 60%,transparent 61%);}',
    '.xi-trees{position:absolute;left:0;right:0;bottom:0;height:30%;pointer-events:none;}',
    '.xi-shoot{position:absolute;top:12%;left:18%;width:120px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),#fff);transform:rotate(-24deg);opacity:0;}',
    '.xi-ov .xm-sleigh{position:absolute;left:0;top:0;width:290px;height:72px;color:#060B1C;opacity:1;will-change:transform;}',
    '.xi-dust{position:absolute;width:14px;height:14px;margin:-5px 0 0 -5px;border-radius:50%;background:radial-gradient(circle,#FFF6D2 0,#FFD678 22%,rgba(255,214,120,.35) 40%,rgba(255,214,120,0) 68%);pointer-events:none;will-change:transform,opacity;}',
    '.xi-dust.w{width:10px;height:10px;background:radial-gradient(circle,#fff 0,#fff 20%,rgba(255,255,255,.3) 42%,rgba(255,255,255,0) 68%);}',
    // the gift, the light rays, the flash and the particles
    '.xi-gift{position:absolute;left:50%;top:60%;width:120px;height:120px;margin:-60px 0 0 -60px;opacity:0;}',
    '.xi-gift .box{position:absolute;left:10px;right:10px;bottom:0;height:78px;border-radius:8px;background:linear-gradient(90deg,transparent 42%,#F4C542 42% 58%,transparent 58%),linear-gradient(#E02D3F,#A81E2D);box-shadow:0 18px 30px -12px rgba(0,0,0,.5);}',
    '.xi-gift .lid{position:absolute;left:2px;right:2px;top:26px;height:22px;border-radius:6px;background:linear-gradient(90deg,transparent 42%,#F4C542 42% 58%,transparent 58%),linear-gradient(#F0414F,#C72535);transform-origin:20% 100%;}',
    '.xi-gift .bow{position:absolute;left:50%;top:-4px;width:56px;height:32px;margin-left:-28px;}',
    '.xi-gift .bow::before,.xi-gift .bow::after{content:"";position:absolute;top:6px;width:24px;height:20px;border:5px solid #F4C542;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;}',
    '.xi-gift .bow::before{left:2px;transform:rotate(-20deg);} .xi-gift .bow::after{right:2px;transform:rotate(20deg);}',
    '.xi-gift::before{content:"";position:absolute;left:50%;top:55%;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;background:radial-gradient(circle,rgba(255,214,120,.75),rgba(255,214,120,.2) 40%,rgba(255,214,120,0) 68%);opacity:0;will-change:transform,opacity;}',
    '.xi-gift.glow::before{animation:xiGlow2 .5s ease-in-out infinite alternate;} @keyframes xiGlow2{from{opacity:.35;transform:scale(.8)}to{opacity:1;transform:scale(1.15)}}',
    '@keyframes xiGlowOld{from{box-shadow:0 0 18px 4px rgba(255,214,120,.35),0 18px 30px -12px rgba(0,0,0,.5)}to{box-shadow:0 0 50px 16px rgba(255,214,120,.8),0 18px 30px -12px rgba(0,0,0,.5)}}',
    '.xi-rays{position:absolute;left:50%;top:60%;width:1300px;height:1300px;margin:-650px 0 0 -650px;opacity:0;pointer-events:none;will-change:transform,opacity;',
    '  background:repeating-conic-gradient(from 0deg,rgba(255,230,160,.22) 0deg 7deg,rgba(255,230,160,0) 7deg 18deg);-webkit-mask:radial-gradient(circle,#000 0,rgba(0,0,0,.6) 18%,transparent 52%);mask:radial-gradient(circle,#000 0,rgba(0,0,0,.6) 18%,transparent 52%);animation:xiSpin 26s linear infinite;}',
    '.xi-rays::after{content:"";position:absolute;left:50%;top:50%;width:420px;height:420px;margin:-210px 0 0 -210px;border-radius:50%;background:radial-gradient(circle,rgba(255,240,200,.55),transparent 65%);}',
    '@keyframes xiSpin{to{transform:rotate(360deg)}}',
    '.xi-flash{position:absolute;inset:0;background:#FFF8E6;opacity:0;pointer-events:none;}',
    '.xi-conf{position:absolute;left:50%;top:60%;width:9px;height:14px;border-radius:2px;pointer-events:none;}',
    '.xi-star{position:absolute;left:50%;top:60%;font-size:18px;line-height:1;color:#FFE08A;text-shadow:0 0 10px rgba(255,214,120,.9);pointer-events:none;}',
    '.xi-puff{position:absolute;border-radius:50%;background:radial-gradient(circle,#fff 45%,rgba(255,255,255,0) 72%);pointer-events:none;will-change:transform,opacity;}',
    // "Merry Christmas" in glowing gold
    '.xi-title{position:absolute;left:0;right:0;top:20%;text-align:center;font:800 clamp(38px,7vw,86px)/1 Sora,Inter,sans-serif;letter-spacing:-.02em;pointer-events:none;z-index:3;}',
    '.xi-title span{display:inline-block;will-change:transform,opacity;background:linear-gradient(180deg,#FFF6D6 0%,#FFD875 45%,#E8A93A 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px rgba(255,200,90,.55)) drop-shadow(0 4px 0 rgba(120,60,10,.35));opacity:0;}',
    // the card: flips in, with a shimmering golden border
    '.xi-card{position:relative;max-width:470px;width:100%;padding:30px 28px 24px;border-radius:24px;background:linear-gradient(180deg,#FFFFFF,#F6F9FF);color:#16202C;text-align:center;box-shadow:0 40px 90px -30px rgba(0,0,0,.75),0 0 60px -10px rgba(255,214,120,.35);opacity:0;transform-origin:50% 100%;z-index:4;}',
    '.xi-card{isolation:isolate;overflow:hidden;background:none !important;}',
    '.xi-card::before{content:"";position:absolute;left:50%;top:50%;width:160%;padding-top:160%;margin:-80% 0 0 -80%;z-index:-2;background:conic-gradient(#F4C542,#FFF3C4,#E63946,#F4C542,#2A9D5C,#FFF3C4,#F4C542);animation:xiSpin 3.5s linear infinite;will-change:transform;pointer-events:none;}',
    '.xi-card::after{content:"";position:absolute;inset:3px;border-radius:21px;z-index:-1;background:linear-gradient(180deg,#FFFFFF,#F6F9FF);pointer-events:none;}',
    '.xi-card.show{animation:xiFlip .9s cubic-bezier(.2,1.3,.35,1) forwards;}',
    '@keyframes xiFlip{0%{opacity:0;transform:rotateX(75deg) translateY(60px) scale(.8)}60%{opacity:1}100%{opacity:1;transform:none}}',
    '.xi-card .big{font-size:46px;line-height:1;margin-bottom:6px;}',
    '.xi-card h2{margin:6px 0 10px;font:800 23px/1.25 Sora,Inter,sans-serif;color:#8E1D2A;}',
    '.xi-card p{margin:0 0 10px;font-size:14.5px;line-height:1.55;color:#4A5568;}',
    '.xi-card .tip{display:inline-block;margin:2px 0 14px;padding:7px 12px;border-radius:10px;background:#FFF6DE;color:#7A5A0E;font-size:13px;font-weight:600;}',
    '.xi-btns{display:flex;flex-direction:column;gap:8px;margin-top:6px;}',
    '.xi-btns button{height:46px;border-radius:12px;border:0;font:700 15px Inter,sans-serif;cursor:pointer;}',
    '.xi-btns .go{background:linear-gradient(135deg,#D62839,#A81E2D);color:#fff;box-shadow:0 12px 24px -12px rgba(214,40,57,.8);transition:transform .15s;} .xi-btns .go:hover{transform:translateY(-1px) scale(1.01);}',
    '.xi-btns .no{background:none;color:#6B7280;font-weight:600;font-size:13.5px;height:34px;}',
    '.xi-small{margin-top:10px;font-size:12px;color:#8A94A6;}',
    '.xi-mute{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;border:0;background:#EEF2F8;font-size:16px;cursor:pointer;}',
    '.xi-skip{position:absolute;right:18px;bottom:16px;z-index:5;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#E8EEF8;font:600 12px Inter,sans-serif;cursor:pointer;}',
    '.xi-skip:hover{background:rgba(255,255,255,.16);}',
    // Santa
    '.xi-santa{position:absolute;bottom:0;left:max(3%,calc(50% - 540px));width:260px;z-index:2;transform-origin:50% 100%;line-height:0;}',
    '.xi-santa svg{display:block;width:100%;overflow:visible;}',
    '.xi-santa .xs-arm{transform-origin:52px 176px;animation:xsWave 1.1s ease-in-out infinite;}',
    '.xi-santa .xs-mouth,.xi-santa .xs-belly{transform-box:fill-box;transform-origin:50% 50%;}',
    '.xi-santa .xs-head{transform-origin:110px 140px;animation:xsNod 2.6s ease-in-out infinite;}',
    '@keyframes xsWave{0%,100%{transform:rotate(0)}50%{transform:rotate(-22deg)}}',
    '@keyframes xsNod{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(3deg)}}',
    '.xi-bubble{position:absolute;top:-56px;left:96px;line-height:normal;padding:10px 16px;border-radius:18px;background:#fff;color:#8E1D2A;font:800 22px Sora,Inter,sans-serif;white-space:nowrap;box-shadow:0 12px 26px -10px rgba(0,0,0,.5);opacity:0;transform:scale(.6) translateY(10px);transform-origin:10% 100%;transition:opacity .15s,transform .3s cubic-bezier(.2,1.6,.4,1);}',
    '.xi-bubble.on{opacity:1;transform:none;}',
    '.xi-bubble::after{content:"";position:absolute;left:14px;bottom:-12px;border:12px solid transparent;border-top-color:#fff;border-bottom:0;transform:skewX(20deg);}',
    '.xi-bubble b{display:inline-block;opacity:0;transform:scale(.4);transition:opacity .15s,transform .25s cubic-bezier(.2,1.6,.4,1);}',
    '.xi-bubble b.on{opacity:1;transform:none;}',
    '@media (max-width:860px){.xi-santa{width:158px;left:2%;bottom:0;}.xi-bubble{left:58px;top:-46px;font-size:17px;padding:8px 12px;}.xi-moon{width:80px;height:80px;}}',
    '.xi-bigflake{position:fixed;z-index:2147483002;width:170px;height:170px;pointer-events:none;will-change:transform,opacity;background:radial-gradient(circle,rgba(190,230,255,.85) 0,rgba(140,200,255,.35) 30%,rgba(120,190,255,0) 62%);border-radius:50%;}',
    '.xi-bigflake svg{width:100%;height:100%;}',
    '.xm-shard{position:fixed;z-index:2147483002;pointer-events:none;color:#fff;line-height:1;will-change:transform,opacity;} .xm-shard.b{color:#9CC8FF;}',
    '.xi-hatfly{position:fixed;z-index:2147483001;width:60px;height:50px;background:url("' + HAT + '") center/contain no-repeat;pointer-events:none;}'
  ].join('\n');

  // the giant snowflake for the finale
  var FLAKE = '<svg viewBox="-60 -60 120 120" aria-hidden="true"><g stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none">' +
    [0, 60, 120, 180, 240, 300].map(function (a) { return '<g transform="rotate(' + a + ')"><path d="M0 0V-52M0-34l-13-13M0-34l13-13M0-18l-9-9M0-18l9-9M0-46l-6-6M0-46l6-6"/></g>'; }).join('') +
    '<circle r="7" fill="#fff" stroke="none"/></g></svg>';
  // the scenery: mountains, a village (windows that glow, chimneys that smoke) and pine trees
  var MOUNTAINS = '<svg viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true"><path d="M0 300V170l120-80 90 60 130-120 120 100 80-50 140 110 110-90 140 120 110-70 160 110V300z" fill="#1B2A5C"/>' +
    '<path d="M340 30l-40 37 22-6 18 14 22-18 20 12zM800 120l-34 28 20-4 16 12 18-14 16 8zM120 90l-28 19 16-2 12 8 14-10 14 4z" fill="#DCE6F7" opacity=".85"/>' +
    '<path d="M0 300V220l160-60 120 50 160-70 140 80 120-40 160 70 120-50 220 60V300z" fill="#22356B" opacity=".9"/></svg>';
  var VILLAGE = '<svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g fill="#0D1734">' +
    '<path d="M150 200v-70l40-36 40 36v70z"/><rect x="205" y="98" width="12" height="26"/><path d="M260 200v-56l34-30 34 30v56z"/><path d="M360 200v-84l52-44 52 44v84z"/><rect x="438" y="72" width="12" height="30"/>' +
    '<path d="M720 200v-64l38-34 38 34v64z"/><path d="M820 200v-90l56-48 56 48v90z"/><rect x="903" y="68" width="13" height="32"/><path d="M960 200v-58l34-30 34 30v58z"/>' +
    '<path d="M560 200v-100l14-40 14 40v100z"/><path d="M553 128h42v72h-42z"/></g>' +
    '<g class="xi-win" fill="#FFD27A">' +
    '<rect x="170" y="150" width="12" height="14" rx="2"/><rect x="198" y="150" width="12" height="14" rx="2"/><rect x="286" y="160" width="14" height="14" rx="2"/><rect x="382" y="140" width="14" height="16" rx="2"/><rect x="428" y="140" width="14" height="16" rx="2"/><rect x="404" y="172" width="16" height="28" rx="2"/>' +
    '<rect x="740" y="156" width="12" height="14" rx="2"/><rect x="768" y="156" width="12" height="14" rx="2"/><rect x="846" y="136" width="14" height="16" rx="2"/><rect x="892" y="136" width="14" height="16" rx="2"/><rect x="868" y="168" width="16" height="32" rx="2"/><rect x="984" y="160" width="14" height="14" rx="2"/>' +
    '<circle cx="574" cy="146" r="6"/></g></svg>';
  var TREES = '<svg viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true"><g fill="#0A132C">' +
    '<path d="M40 260l40-110 40 110zM60 200l20-80 20 80zM-10 260l30-80 30 80z"/><path d="M110 260l30-86 30 86zM125 210l15-60 15 60z"/>' +
    '<path d="M1060 260l38-104 38 104zM1078 202l20-76 20 76z"/><path d="M1130 260l34-92 34 92zM1146 208l18-66 18 66z"/><path d="M1010 260l24-70 24 70z"/></g>' +
    '<g fill="#F4F8FF" opacity=".9"><path d="M68 186l12-6 12 6-12-26zM1086 190l12-6 12 6-12-26zM1152 198l12-6 12 6-12-24z"/></g></svg>';

  // ---------- sound effects for the movie (all made in the browser) ----------
  function riser(t, dur, vol, from, to) {                     // a soft "whoosh" that rises
    if (!nbuf) { nbuf = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate); var d = nbuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var s = ac.createBufferSource(); s.buffer = nbuf; s.loop = true; var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(from || 400, t); bp.frequency.exponentialRampToValueAtTime(to || 4000, t + dur);
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.15);
  }
  function whistle(t, dur) {                                   // the gift falling: a descending whistle
    var o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(420, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.08); g.gain.setValueAtTime(0.07, t + dur - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function thud(t) {                                           // the landing: a deep, soft boom
    var o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.45);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.65); riser(t, 0.25, 0.12, 2500, 300);
  }
  function chimes(t, notes, gap, vol) { notes.forEach(function (n, i) { bell(t + i * gap, hz(n), vol || 0.12, null, 2.2); }); }

  // the Jingle Bells music (as before)
  var musicBus = null, musicTimer = null, musicOn = true;
  // Jingle Bells (James Lord Pierpont, 1857: public domain), the chorus in C, in beats
  var TUNE = [[64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,.5],[64,4],[65,1],[65,1],[65,1.5],[65,.5],[65,1],[64,1],[64,1],[64,.5],[64,.5],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2],
    [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,.5],[64,4],[65,1],[65,1],[65,1.5],[65,.5],[65,1],[64,1],[64,1],[64,.5],[64,.5],[67,1],[67,1],[65,1],[62,1],[60,4]];
  // The arrangement: two rounds of the chorus. Round 1 is light (bells, warm chords, a gentle bass, sleigh bells);
  // round 2 goes all in (walking bass, soft kick and brushes, sleigh bells on every eighth, a twinkling celesta line).
  // Everything goes through a warm room (reverb). Then it loops.
  var CHORDS = ['C', 'C', 'C', 'C', 'F', 'C', 'D7', 'G', 'C', 'C', 'C', 'C', 'F', 'C', 'G7', 'C'];
  var VOICE = {C: [60, 64, 67], F: [60, 65, 69], D7: [62, 66, 69, 72], G: [59, 62, 67], G7: [59, 62, 65, 67]};
  var WALK = {C: [36, 40, 43, 45], F: [41, 45, 48, 50], D7: [38, 42, 45, 48], G: [43, 47, 50, 47], G7: [43, 47, 50, 41]};
  var hz = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };
  function pad(t, notes, len, dest) {                        // warm chords: two slightly detuned saws per note, softly filtered
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = 0.4;
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.022, t + 0.35); g.gain.setValueAtTime(0.022, t + len - 0.3); g.gain.linearRampToValueAtTime(0.0001, t + len + 0.25);
    lp.connect(g); g.connect(dest);
    notes.forEach(function (n) { [-6, 6].forEach(function (cents) { var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n); o.detune.value = cents; o.connect(lp); o.start(t); o.stop(t + len + 0.3); }); });
  }
  function pluck(t, n, vol, dest) {                          // a round, plucked bass note
    var o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = hz(n); o2.frequency.value = hz(n) / 2;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.3);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(dest); o.start(t); o2.start(t); o.stop(t + 0.6); o2.stop(t + 0.6);
  }
  function kick(t, dest) { var o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.32); }
  function brush(t, vol, dest) {
    if (!nbuf) { nbuf = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate); var d = nbuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var s0 = ac.createBufferSource(); s0.buffer = nbuf; var hp = ac.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 3200; hp.Q.value = 0.6;
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    s0.connect(hp); hp.connect(g); g.connect(dest); s0.start(t); s0.stop(t + 0.25);
  }
  function celesta(t, n, vol, dest) {                        // a soft, twinkling celesta note
    var o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o2.type = 'sine'; o.frequency.value = hz(n); o2.frequency.value = hz(n) * 4;
    var g2 = ac.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(g); o.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    g.connect(dest); o.start(t); o2.start(t); o.stop(t + 0.95); o2.stop(t + 0.95);
  }
  var roomBuf = null;                                        // the reverb is made once, then reused
  function startMusic(delay, opts) {
    if (!opts && !audio()) return;
    musicBus = ac.createGain(); musicBus.gain.value = musicOn ? 1 : 0; musicBus.connect(master);
    if (!roomBuf || roomBuf.sampleRate !== ac.sampleRate) { var len = Math.round(ac.sampleRate * 1.8); roomBuf = ac.createBuffer(2, len, ac.sampleRate);
      for (var c = 0; c < 2; c++) { var d = roomBuf.getChannelData(c); for (var k = 0; k < len; k++) { var x = 1 - k / len; d[k] = (Math.random() * 2 - 1) * x * x * x; } } }
    var cv = ac.createConvolver(); cv.buffer = roomBuf; var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    var wetG = ac.createGain(); wetG.gain.value = 0.3; cv.connect(lp); lp.connect(wetG); wetG.connect(master);
    var send = ac.createGain(); send.gain.value = 0.8; musicBus.connect(send); send.connect(cv);
    var beat = 0.38, bars = 16, bus = musicBus;
    // where each melody note starts (in beats), so the song can be prepared one bar at a time
    var starts = [], acc = 0; TUNE.forEach(function (n) { starts.push(acc); acc += n[1]; });
    function bar(index, tb) {                                  // prepare one bar of music
      var round = Math.floor(index / bars), b = index % bars, full = round % 2 === 1, ch = CHORDS[b], w = WALK[ch];
      TUNE.forEach(function (n, k) { if (starts[k] >= b * 4 && starts[k] < b * 4 + 4) { var t = tb + (starts[k] - b * 4) * beat, dd = n[1] * beat;
        bell(t, hz(n[0] + 12), full ? 0.12 : 0.11, bus, Math.max(0.6, dd * 1.6)); if (dd >= 2 * beat) bell(t + 0.01, hz(n[0] + 24), 0.035, bus, 1.2); } });
      pad(tb, VOICE[ch], 4 * beat, bus);
      if (full) { w.forEach(function (n, k) { pluck(tb + k * beat, n, 0.2, bus); }); [0, 2].forEach(function (k) { kick(tb + k * beat, bus); }); [1, 3].forEach(function (k) { brush(tb + k * beat, 0.05, bus); });
        VOICE[ch].concat([VOICE[ch][0] + 12]).forEach(function (n, k) { celesta(tb + (k * 2 + 1) * beat / 2 + beat * (k > 1 ? 1 : 0), n + 24, 0.035, bus); }); }
      else { pluck(tb, w[0], 0.17, bus); pluck(tb + 2 * beat, w[2], 0.13, bus); }
      for (var q = 0; q < (full ? 8 : 4); q++) shake(tb + q * beat / (full ? 2 : 1), full ? (q % 2 ? 0.025 : 0.05) : (q % 2 ? 0.03 : 0.05), bus);
    }
    var t0 = ac.currentTime + (delay || 0.1);
    if (opts && opts.rounds) { for (var n = 0; n < bars * opts.rounds; n++) bar(n, t0 + n * 4 * beat); return; }   // rendering to a file: everything at once
    var next = 0;
    (function ahead() {                                        // always keep about one second of music prepared, no more
      if (musicBus !== bus) return;
      while (t0 + next * 4 * beat < ac.currentTime + 1.0) { bar(next, t0 + next * 4 * beat); next++; }
      musicTimer = setTimeout(ahead, 250);
    })();
  }
  function stopMusic() { clearTimeout(musicTimer); if (musicBus && ac) { musicBus.gain.setTargetAtTime(0, ac.currentTime, 0.15); var b = musicBus; setTimeout(function () { try { b.disconnect(); } catch (e) {} }, 800); } musicBus = null; }

  function play() {
    introRunning = true; try { localStorage.setItem(seenKey(), '1'); } catch (e) {}
    if (!document.getElementById('ptXmIntroCss')) { var st = document.createElement('style'); st.id = 'ptXmIntroCss'; st.textContent = ICSS; document.head.appendChild(st); }
    var ov = document.createElement('div'); ov.className = 'xi-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'xiT');
    var title = 'Merry Christmas'.split('').map(function (c) { return c === ' ' ? '<span>&nbsp;</span>' : '<span>' + c + '</span>'; }).join('');
    ov.innerHTML = '<div class="xi-scene">' +
        '<div class="xi-stars"></div><div class="xi-aur"><i class="a1"></i><i class="a2"></i></div><div class="xi-moon"></div><div class="xi-shoot"></div>' +
        '<canvas class="far"></canvas><div class="xi-mount">' + MOUNTAINS + '</div><div class="xi-village">' + VILLAGE + '</div>' +
        '<div class="xi-rays"></div><div class="xi-hills"></div><div class="xi-trees">' + TREES + '</div>' +
        '<div class="xi-gift" aria-hidden="true"><div class="box"></div><div class="lid"><div class="bow"></div></div></div>' +
        '<canvas class="near"></canvas>' +
        '<div class="xi-santa" aria-hidden="true" style="visibility:hidden"><div class="xi-bubble"><b>Ho,</b> <b>ho,</b> <b>ho!</b></div>' + SANTA + '</div>' +
        '<div class="xi-title" aria-hidden="true">' + title + '</div><div class="xi-flash"></div></div>' +
      '<div class="xi-card"><button type="button" class="xi-mute" aria-label="Music on or off" aria-pressed="true">\uD83D\uDD0A</button><div class="big">\uD83C\uDF84</div>' +
      '<h2 id="xiT">Christmas has arrived at PalaTrack!</h2>' +
      '<p>Twinkling lights, a jingling ornament and a little holiday spirit across your whole tracker, until January 6.</p>' +
      '<div class="tip">\uD83C\uDF81 Tip: click the ornament in the top right for a little snow</div>' +
      '<p style="font-size:13px">Not your thing? Turn it off anytime in <b>Settings \u2192 Christmas decorations</b>.</p>' +
      '<div class="xi-btns"><button type="button" class="go" data-xi="go">Let it snow \u2744\uFE0F</button><button type="button" class="no" data-xi="off">Turn the decorations off</button></div>' +
      '<div class="xi-small">Merry Christmas from the PalaTrack team \uD83C\uDF85</div></div>' +
      '<button type="button" class="xi-skip" data-xi="skip">Skip \u203A</button>';
    document.body.appendChild(ov);
    var scene = ov.querySelector('.xi-scene'), card = ov.querySelector('.xi-card'), gift = ov.querySelector('.xi-gift'), santa = ov.querySelector('.xi-santa');
    var rays = ov.querySelector('.xi-rays'), flash = ov.querySelector('.xi-flash'), titleEl = ov.querySelector('.xi-title');
    // snow in two depths: small, slow flakes far away and big, soft ones up close
    var far = makeSnow(ov.querySelector('canvas.far'), 8000, {max: 120, night: true, speed: 0.7});
    var near = makeSnow(ov.querySelector('canvas.near'), 32000, {max: 30, big: true, night: true, speed: 1.6, soft: true});
    // chimney smoke
    [[0.183, 0.6], [0.37, 0.64], [0.757, 0.66]].forEach(function (c, i) {
      var vil = ov.querySelector('.xi-village');
      for (var k = 0; k < 3; k++) { var sm = document.createElement('i'); sm.className = 'xi-smoke'; sm.style.left = (c[0] * 100) + '%'; sm.style.top = (c[1] * 100 - 40) + '%'; sm.style.animationDelay = (k * 1.3 + i * 0.4) + 's'; vil.appendChild(sm); }
    });
    var timers = []; function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    var done = false; loadHoho();
    if (audio()) { chimes(ac.currentTime + 0.15, [72, 76, 79, 84, 88, 91, 96], 0.07, 0.08); riser(ac.currentTime + 0.1, 1.6, 0.05, 300, 2500); }
    at(900, function () { startMusic(); });

    function santaUp() {                                     // Santa rises from the bottom with a puff of snow, then says "Ho, ho, ho!"
      santa.style.visibility = 'visible';
      if (!reduced) {
        santa.animate([{transform: 'translateY(110%) rotate(-6deg)'}, {transform: 'translateY(-6%) rotate(3deg)', offset: 0.7}, {transform: 'translateY(0) rotate(0)'}], {duration: 750, easing: 'cubic-bezier(.2,1.2,.4,1)'});
        var r = santa.getBoundingClientRect(); puff(r.left + r.width / 2, innerHeight - 10, 26, 1.2);
      }
      var waited = 0;
      function speak() { if (hohoBuf || waited >= 2000 || hohoTried === 'failed') { hohoho(santa); return; } waited += 100; setTimeout(speak, 100); }
      setTimeout(speak, reduced ? 200 : 650);
    }
    function showCard() {
      if (done) return; done = true; timers.forEach(clearTimeout);
      card.classList.add('show'); setTimeout(function () { card.querySelector('.go').focus(); }, 300);
      var sk = ov.querySelector('.xi-skip'); if (sk) sk.remove();
    }
    // particles: a puff of snow, golden dust, confetti and stars
    function puff(x, y, n, size) {
      for (var i = 0; i < n; i++) {
        var p = document.createElement('i'); p.className = 'xi-puff'; var s = (4 + Math.random() * 10) * (size || 1); p.style.width = p.style.height = s + 'px'; p.style.left = x + 'px'; p.style.top = y + 'px'; scene.appendChild(p);
        var a = Math.PI + Math.random() * Math.PI, d = 40 + Math.random() * 140 * (size || 1);
        p.animate([{transform: 'translate(-50%,-50%)', opacity: 0.95}, {transform: 'translate(' + (Math.cos(a) * d) + 'px,' + (Math.sin(a) * d * 0.8) + 'px) scale(.4)', opacity: 0}], {duration: 700 + Math.random() * 600, easing: 'cubic-bezier(.1,.7,.3,1)'}).onfinish = (function (p) { return function () { p.remove(); }; })(p);
      }
    }
    function dust(x, y, white) {
      var d = document.createElement('i'); d.className = 'xi-dust' + (white ? ' w' : ''); d.style.left = x + 'px'; d.style.top = y + 'px'; scene.appendChild(d);
      d.animate([{transform: 'translate(0,0) scale(1)', opacity: 1}, {transform: 'translate(' + (Math.random() * 30 - 15) + 'px,' + (40 + Math.random() * 50) + 'px) scale(.2)', opacity: 0}], {duration: 1200 + Math.random() * 800, easing: 'ease-out'}).onfinish = function () { d.remove(); };
    }

    if (reduced) { gift.remove(); rays.style.opacity = '0.6'; santaUp(); showCard(); }
    else {
      var W = innerWidth, H = innerHeight;
      // a shooting star
      at(500, function () { var s = ov.querySelector('.xi-shoot'); s.animate([{transform: 'translate(0,0) rotate(-24deg)', opacity: 0}, {opacity: 1, offset: 0.2}, {transform: 'translate(' + (W * 0.3) + 'px,' + (H * 0.14) + 'px) rotate(-24deg)', opacity: 0}], {duration: 900, easing: 'ease-in'}); if (ac) bell(ac.currentTime, 2637, 0.05, null, 0.8); });
      // Santa's sleigh: an arc in front of the moon, with Rudolph and a trail of golden dust
      var sl = document.createElement('div'); sl.className = 'xm-sleigh';
      sl.innerHTML = SLEIGH.replace('<svg viewBox="0 0 240 60" aria-hidden="true">', '<svg viewBox="0 0 240 60" aria-hidden="true" overflow="visible"><defs><radialGradient id="xiNose"><stop offset="0" stop-color="#FF6B6B" stop-opacity=".9"/><stop offset="1" stop-color="#FF3B3B" stop-opacity="0"/></radialGradient></defs>')
      .replace('</g></svg>', '</g><circle cx="17.5" cy="20" r="10" fill="url(#xiNose)"/><circle cx="17.5" cy="20" r="2.8" fill="#FF3B3B"/></svg>'); sl.style.opacity = '0'; scene.appendChild(sl);
      var path = [{x: W + 60, y: H * 0.34}, {x: W * 0.72, y: H * 0.14}, {x: W * 0.5, y: H * 0.1}, {x: W * 0.26, y: H * 0.14}, {x: -320, y: H * 0.3}];
      var SLEIGH_AT = 1300, SLEIGH_DUR = 3400;
      at(SLEIGH_AT, function () {
        sl.style.opacity = '1';
        sl.animate(path.map(function (p, i) { return {transform: 'translate3d(' + p.x + 'px,' + p.y + 'px,0) rotate(' + (i < 2 ? 7 : i > 2 ? -7 : 0) + 'deg)'}; }), {duration: SLEIGH_DUR, easing: 'linear'}).onfinish = function () { sl.remove(); };
        if (ac) { for (var k = 0; k < 32; k++) shake(ac.currentTime + k * 0.1, 0.08 * Math.sin(Math.PI * k / 32) + 0.02); riser(ac.currentTime, SLEIGH_DUR / 1000, 0.035, 600, 1400); }
        var trail = setInterval(function () {
          if (!sl.isConnected) { clearInterval(trail); return; }
          var r = sl.getBoundingClientRect(); dust(r.right - 30 + Math.random() * 20, r.top + 44 + Math.random() * 10, Math.random() < 0.4);
        }, 45);
        timers.push(trail);
      });
      // the gift falls from the sleigh, spinning, with a sparkling trail and a whistle
      var DROP_AT = SLEIGH_AT + SLEIGH_DUR * 0.48, FALL = 1050;
      at(DROP_AT, function () {
        var r = sl.getBoundingClientRect(), gx = r.left + r.width * 0.74, gy = r.top + 44, cx = W / 2, cy = H * 0.6;
        gift.style.opacity = '1';
        gift.animate([{transform: 'translate(' + (gx - cx) + 'px,' + (gy - cy) + 'px) scale(.35) rotate(-40deg)'}, {transform: 'translate(0,0) scale(1) rotate(320deg)'}], {duration: FALL, easing: 'cubic-bezier(.45,0,.9,.6)', fill: 'forwards'});
        if (ac) whistle(ac.currentTime, FALL / 1000);
        var tr = setInterval(function () { var g = gift.getBoundingClientRect(); dust(g.left + g.width / 2 + Math.random() * 20 - 10, g.top + Math.random() * 20); }, 40);
        setTimeout(function () { clearInterval(tr); }, FALL);
      });
      // impact: a burst of snow, a thud and a little shake
      var LAND = DROP_AT + FALL;
      at(LAND, function () {
        gift.getAnimations().forEach(function (a) { a.commitStyles && a.commitStyles(); a.cancel(); });
        gift.style.transform = 'none';
        gift.animate([{transform: 'scale(1.25,.7)'}, {transform: 'scale(.92,1.1)'}, {transform: 'scale(1)'}], {duration: 420, easing: 'ease-out'});
        puff(W / 2, H * 0.6 + 55, 28, 1.4); if (ac) thud(ac.currentTime);
        scene.animate([{transform: 'translate(0,0)'}, {transform: 'translate(-8px,6px)'}, {transform: 'translate(7px,-5px)'}, {transform: 'translate(-4px,3px)'}, {transform: 'translate(0,0)'}], {duration: 380, easing: 'ease-out'});
        near.burst(30);
      });
      // building up: the gift glows and wiggles, faster and faster, with a rising sound
      at(LAND + 450, function () {
        gift.classList.add('glow'); if (ac) riser(ac.currentTime, 1.3, 0.12, 300, 6000);
        gift.animate([0, -7, 7, -9, 9, -11, 11, -13, 13, 0].map(function (d) { return {transform: 'rotate(' + d + 'deg) scale(' + (1 + Math.abs(d) / 120) + ')'}; }), {duration: 1250, easing: 'ease-in'});
      });
      // the burst: a flash, the lid blasts off, light rays, confetti and stars
      var BURST = LAND + 1750;
      at(BURST, function () {
        flash.animate([{opacity: 0}, {opacity: 0.85, offset: 0.15}, {opacity: 0}], {duration: 650, easing: 'ease-out'});
        gift.querySelector('.lid').animate([{transform: 'translate(0,0) rotate(0)'}, {transform: 'translate(-90px,-240px) rotate(-120deg)', opacity: 0}], {duration: 800, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards'});
        rays.animate([{opacity: 0, transform: 'scale(.3) rotate(0deg)'}, {opacity: 1, transform: 'scale(1) rotate(40deg)'}], {duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards'});
        if (ac) { chimes(ac.currentTime, [72, 76, 79, 84, 88], 0.05, 0.14); riser(ac.currentTime, 0.6, 0.1, 6000, 800); }
        var cols = ['#E63946', '#2A9D5C', '#F4C542', '#3A86FF', '#FFFFFF'];
        for (var i = 0; i < 60; i++) (function (i) {
          var c = document.createElement('i'); c.className = 'xi-conf'; c.style.background = cols[i % cols.length]; scene.appendChild(c);
          var ang = Math.random() * Math.PI * 2, dist = 180 + Math.random() * 420, dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 220;
          c.animate([{transform: 'translate(-50%,-50%) rotate(0)', opacity: 1}, {transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity: 1, offset: 0.55}, {transform: 'translate(' + dx * 1.1 + 'px,' + (dy + 320) + 'px) rotate(' + (Math.random() * 900) + 'deg)', opacity: 0}],
            {duration: 2000 + Math.random() * 1000, easing: 'cubic-bezier(.15,.7,.3,1)'}).onfinish = function () { c.remove(); };
        })(i);
        for (var j = 0; j < 14; j++) (function () {
          var s = document.createElement('i'); s.className = 'xi-star'; s.textContent = '\u2726'; scene.appendChild(s);
          var a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 260;
          s.animate([{transform: 'translate(-50%,-50%) scale(.2) rotate(0)', opacity: 1}, {transform: 'translate(' + (Math.cos(a) * d) + 'px,' + (Math.sin(a) * d - 80) + 'px) scale(1.4) rotate(180deg)', opacity: 0}], {duration: 1400 + Math.random() * 600, easing: 'ease-out'}).onfinish = function () { s.remove(); };
        })();
        gift.animate([{opacity: 1, transform: 'scale(1)'}, {opacity: 0, transform: 'scale(.5) translateY(40px)'}], {duration: 600, delay: 450, fill: 'forwards'});
        far.burst(40); near.burst(20);
      });
      at(BURST + 250, santaUp);
      // "Merry Christmas" in glowing gold, letter by letter, then it floats up
      at(BURST + 650, function () {
        titleEl.querySelectorAll('span').forEach(function (s, i) {
          s.animate([{opacity: 0, transform: 'translateY(40px) scale(.4) rotate(-12deg)'}, {opacity: 1, transform: 'none'}], {duration: 600, delay: i * 55, easing: 'cubic-bezier(.2,1.5,.4,1)', fill: 'forwards'});
        });
        if (ac) chimes(ac.currentTime + 0.1, [84, 88, 91, 96], 0.12, 0.07);
      });
      at(BURST + 2500, function () { titleEl.animate([{transform: 'none', opacity: 1}, {transform: 'translateY(-60px) scale(.9)', opacity: 0}], {duration: 700, easing: 'ease-in', fill: 'forwards'}); });
      at(BURST + 2700, showCard);
    }

    function close(turnOff) {
      if (ov.classList.contains('out')) return;
      timers.forEach(clearTimeout); stopMusic(); far.stop(); near.stop(); ov.classList.add('out'); document.removeEventListener('keydown', key, true);
      if (turnOff) { introRunning = false; if (window.ptChristmas) window.ptChristmas.set(false); setTimeout(function () { ov.remove(); }, 560); return; }
      if (reduced) { flyHat(card); if (snow) snow.burst(90); setTimeout(function () { ov.remove(); }, 560); return; }
      ov.classList.remove('out'); finale();
    }
    // "Let it snow": the card spins into a giant snowflake, the scene zooms forward and dissolves, the snowflake shatters
    // into little ones that drift down over the app, the lights flash on in a wave, the ornament jingles, the hat lands
    function finale() {
      var r = card.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (audio()) { riser(ac.currentTime, 0.75, 0.1, 500, 7000); chimes(ac.currentTime + 0.05, [84, 88, 91, 96, 100, 103], 0.06, 0.09); }
      card.classList.remove('show'); card.style.opacity = '1';
      card.animate([{transform: 'none', opacity: 1}, {transform: 'scale(.12) rotate(30deg)', opacity: 0}], {duration: 460, easing: 'cubic-bezier(.6,0,.8,.4)', fill: 'forwards'});
      var flake = document.createElement('div'); flake.className = 'xi-bigflake'; flake.style.opacity = '0'; flake.innerHTML = FLAKE; flake.style.left = cx + 'px'; flake.style.top = cy + 'px'; document.body.appendChild(flake);
      flake.animate([{transform: 'translate(-50%,-50%) scale(0) rotate(-200deg)', opacity: 0}, {transform: 'translate(-50%,-50%) scale(1.15) rotate(15deg)', opacity: 1, offset: 0.7}, {transform: 'translate(-50%,-50%) scale(1) rotate(0)', opacity: 1}], {duration: 620, delay: 260, easing: 'cubic-bezier(.2,1.3,.4,1)', fill: 'both'});
      santa.animate([{transform: 'none'}, {transform: 'translateY(-4%) rotate(-3deg)', offset: 0.3}, {transform: 'translateY(115%) rotate(4deg)'}], {duration: 800, delay: 250, easing: 'ease-in', fill: 'forwards'});
      scene.animate([{transform: 'scale(1)', opacity: 1}, {transform: 'scale(1.25)', opacity: 0.9, offset: 0.55}, {transform: 'scale(1.7)', opacity: 0}], {duration: 1350, delay: 450, easing: 'cubic-bezier(.45,0,.7,.2)', fill: 'both'});
      ov.animate([{opacity: 1}, {opacity: 0}], {duration: 750, delay: 1250, easing: 'ease-in', fill: 'both'});
      setTimeout(stopMusic, 1100);
      setTimeout(function () {                                  // the snowflake shatters
        flake.animate([{transform: 'translate(-50%,-50%) scale(1)', opacity: 1}, {transform: 'translate(-50%,-50%) scale(1.6) rotate(40deg)', opacity: 0}], {duration: 300, easing: 'ease-out', fill: 'forwards'}).onfinish = function () { flake.remove(); };
        if (ac) { chimes(ac.currentTime, [96, 91, 88, 84, 79, 76, 72], 0.04, 0.08); for (var k = 0; k < 10; k++) shake(ac.currentTime + k * 0.04, 0.09); }
        for (var i = 0; i < 45; i++) (function (i) {
          var sh = document.createElement('i'); sh.className = 'xm-shard' + (i % 2 ? ' b' : ''); sh.textContent = '\u2744'; sh.style.left = cx + 'px'; sh.style.top = cy + 'px'; sh.style.fontSize = (10 + Math.random() * 18) + 'px'; document.body.appendChild(sh);
          var a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 360, x1 = Math.cos(a) * d, y1 = Math.sin(a) * d * 0.8, fall = innerHeight - cy + 60, sway = (Math.random() - 0.5) * 160;
          sh.animate([{transform: 'translate(-50%,-50%) scale(.2) rotate(0)', opacity: 1}, {transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(1) rotate(' + (Math.random() * 360) + 'deg)', opacity: 1, offset: 0.25},
            {transform: 'translate(' + (x1 + sway) + 'px,' + (y1 + fall * 0.6) + 'px) rotate(' + (Math.random() * 540) + 'deg)', opacity: 0.9, offset: 0.7}, {transform: 'translate(' + (x1 - sway / 2) + 'px,' + (fall + 40) + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity: 0}],
            {duration: 2600 + Math.random() * 1600, easing: 'cubic-bezier(.2,.6,.4,1)'}).onfinish = function () { sh.remove(); };
        })(i);
        flyHat(flake);
      }, 1050);
      setTimeout(function () {                                  // back in the app: lots of snow, the lights flash on in a wave, the ornament jingles
        ov.remove();
        if (snow) snow.burst(140);
        document.querySelectorAll('#ptXmas .xm-bulb').forEach(function (b, i) {
          b.animate([{transform: 'scale(1)', filter: 'brightness(1)'}, {transform: 'scale(1.6)', filter: 'brightness(2.4)'}, {transform: 'scale(1)', filter: 'brightness(1)'}], {duration: 520, delay: i * 70, easing: 'ease-out'});
        });
        var orn = document.querySelector('#ptXmas .xm-orn:not(.o2):not(.o3)'); if (orn) setTimeout(function () { orn.classList.remove('spin'); void orn.offsetWidth; orn.classList.add('spin'); jingle(); }, 500);
      }, 2000);
    }
    function skip() {                                         // skip the movie: straight to Santa and the card
      timers.forEach(clearTimeout); gift.style.opacity = '0'; rays.style.opacity = '0.8';
      ov.querySelectorAll('.xm-sleigh,.xi-dust,.xi-conf,.xi-star').forEach(function (x) { x.remove(); });
      if (santa.style.visibility !== 'visible') santaUp(); titleEl.style.opacity = '0'; showCard();
    }
    function key(e) { if (e.key === 'Escape') { e.preventDefault(); close(false); } }
    document.addEventListener('keydown', key, true);
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-xi]'); if (b) { if (b.dataset.xi === 'skip') skip(); else close(b.dataset.xi === 'off'); return; }
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
  // render the music into another audio context (used to make a preview file)
  function renderMusic(ctx) { var pa = ac, pm = master, pb = musicBus, pn = nbuf; ac = ctx; nbuf = null; master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
    try { startMusic(0.1, {rounds: 2}); } finally { ac = pa; master = pm; musicBus = pb; nbuf = pn; } }
  window.ptChristmasIntro = {renderMusic: renderMusic, play: play, reset: function () { try { localStorage.removeItem(seenKey()); } catch (e) {} return 'The Christmas surprise will show again for this account.'; }};
})();
