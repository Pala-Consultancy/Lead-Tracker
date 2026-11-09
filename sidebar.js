// ---------------------------------------------------------------------------
// sidebar.js — the ONE side panel for every page in the tracker.
// Each page has an empty host right where the panel goes:
//     <div class="seq-sidebar pts-host" data-pt-sidebar></div>
//     <script src="sidebar.js"></script>
// and this file fills it in immediately (before the page's own code runs), so
// the panel is identical everywhere and a change here applies to every page.
// Element ids stay the same as before (navTasks, navLinkedinSeq, themeDarkBtn,
// signOutItem, …) so the badges, the light/dark switch and page code keep working.
// ---------------------------------------------------------------------------
(function(){
  var LOGO = "data:image/png;base64,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";
  var I = {"navCallPages": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/><path d=\"m22 8-6 4 6 4z\"/></svg>", "navOfferDoc": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z\"/><path d=\"M14 3v5h5\"/><path d=\"M12 11l1.1 2.3 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z\"/></svg>", "navWhiteboard": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M7 13c1.5-3 3-4.5 4.5-1.5S15 12 17 8\"/><path d=\"M9 21l3-4 3 4\"/></svg>", "navClients": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 3.5h6v2.5H9z\"/><path d=\"m9 13 2 2 4-4\"/></svg>", "navHome": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><path d=\"M3 10.5 12 3l9 7.5\"/><path d=\"M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5\"/></svg>", "navDashboard": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/></svg>", "navTasks": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><path d=\"M9 11l3 3L22 4\"/><path d=\"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"/></svg>", "navCalendar": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/></svg>", "navSequences": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/></svg>", "navCampaigns": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/></svg>", "navScheduled": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>", "navLinkedinSeq": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"currentColor\" d=\"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z\"/></svg>", "navLinkedinPost": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><path d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/><path d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"/></svg>", "navChat": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><path d=\"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z\"/></svg>", "navTrash": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><polyline points=\"3 6 5 6 21 6\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/><line x1=\"10\" y1=\"11\" x2=\"10\" y2=\"17\"/><line x1=\"14\" y1=\"11\" x2=\"14\" y2=\"17\"/></svg>", "navSettings": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-3px;\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/></svg>", "navTeam": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></svg>", "navBilling": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M2 10h20\"/></svg>", "navHelp": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/><path d=\"M12 17h.01\"/></svg>", "navSignOut": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><path d=\"m16 17 5-5-5-5\"/><path d=\"M21 12H9\"/></svg>", "navLibrary": "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20\"/><path d=\"M8 7h8\"/><path d=\"M8 11h6\"/></svg>"};
  var SUN = "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41\"/></svg>", MOON = "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>";
  var seg = (location.pathname.split('/').pop() || 'home').toLowerCase();          // works for /dashboard and /dashboard.html
  var here = /\.html$/.test(seg) ? seg : seg + '.html';
  var isHome = here === 'home.html' || here === '' || here === 'index.html';
  // Which item is "active" on which page.
  var ACTIVE = {'home.html': 'navHome', 'boards.html': 'navDashboard', 'dashboard.html': 'navDashboard', 'statistics.html': 'navDashboard', 'boards-trash.html': 'navDashboard',
    'tasks.html': 'navTasks', 'calendar.html': 'navCalendar', 'sequences.html': 'navSequences', 'sequence-builder.html': 'navSequences', 'campaigns.html': 'navCampaigns',
    'scheduled-emails.html': 'navScheduled', 'linkedin-dm-log.html': 'navLinkedinSeq', 'linkedin-post-composer.html': 'navLinkedinPost',
    'chat.html': 'navChat', 'client-processes.html': 'navClients', 'call-pages.html': 'navCallPages', 'offer-doc.html': 'navOfferDoc', 'library.html': 'navLibrary', 'whiteboard.html': 'navWhiteboard', 'team.html': 'navTeam', 'trash.html': 'navTrash', 'account.html': 'navSettings', 'email-settings.html': 'navSettings',
    'notification-settings.html': 'navSettings', 'billing.html': 'navBilling', 'help-center.html': 'navHelp', 'feedback.html': 'navHelp'};
  var active = ACTIVE[here] || '';
  // The current board (if the page was opened for one) is carried along.
  var board = new URLSearchParams(location.search).get('board');
  var q = board ? '?board=' + encodeURIComponent(board) : '';
  function link(id, href, label){
    return '<a class="seq-sidebar-link' + (id === active ? ' active' : '') + '" id="' + id + '" href="' + href + '"' + (id === active ? ' aria-current="page"' : '') + '>' +
      '<span class="icon">' + (I[id] || '') + '</span> <span class="pts-label">' + label + '</span></a>';
  }
  var html =
    '<a class="seq-sidebar-logo pts-logo" href="home.html" aria-label="PalaTrack home"><img id="sidebarLogoImg" src="' + LOGO + '" alt="PalaTrack"></a>' +
    '<div class="seq-sidebar-user pts-user" id="seqSidebarUser">' +
      '<div class="seq-sidebar-avatar" id="seqSidebarAvatar">?</div>' +
      '<div class="pts-user-text"><span id="seqSidebarUserName">…</span><small id="ptsUserSub"></small></div>' +
    '</div>' +
    // kept for the Home page's own code (it fills these in); hidden
    '<div hidden><span id="settingsAvatar"></span><span id="settingsUserName"></span><span id="settingsUserEmail"></span><span id="settingsUserRole"></span></div>' +
    '<nav class="seq-sidebar-nav" aria-label="Main">' +
      link('navHome', 'home.html', 'Home') +
      link('navDashboard', 'boards.html', 'Boards') +
      link('navTasks', 'tasks.html', 'Tasks') +
      link('navCalendar', 'calendar.html', 'Calendar') +
      '<div class="seq-sidebar-label">Email</div>' +
      link('navSequences', 'sequences.html' + q, 'Sequences') +
      link('navCampaigns', 'campaigns.html' + q, 'Email campaigns') +
      link('navScheduled', 'scheduled-emails.html' + q, 'Scheduled') +
      '<div class="seq-sidebar-label">LinkedIn</div>' +
      link('navLinkedinSeq', 'linkedin-dm-log.html' + q, 'LinkedIn DM log') +
      link('navLinkedinPost', 'linkedin-post-composer.html' + q, 'LinkedIn Post') +
      '<div class="seq-sidebar-label">Clients</div>' +
      link('navClients', 'client-processes.html', 'Client processes') +
      link('navCallPages', 'call-pages.html', 'Pre Call Conversion System') +
      link('navOfferDoc', 'offer-doc.html', 'Offer Doc') +
      '<div class="seq-sidebar-label">Workspace</div>' +
      link('navChat', 'chat.html', 'Team chat') +
      link('navLibrary', 'library.html', 'Library') +
      link('navWhiteboard', 'whiteboard.html', 'Whiteboard') +
      link('navTeam', 'team.html', 'Team') +
      '<a id="navTrash" href="trash.html" hidden aria-hidden="true" tabindex="-1" style="display:none"></a>' +   // kept invisible: pages set its link on start
    '</nav>' +
    '<div class="seq-sidebar-bottom pts-bottom">' +
      '<div class="theme-toggle-row pts-theme">' +
        '<button type="button" class="theme-toggle-btn" id="themeLightBtn">' + SUN + ' <span>Light</span></button>' +
        '<button type="button" class="theme-toggle-btn" id="themeDarkBtn">' + MOON + ' <span>Dark</span></button>' +
      '</div>' +
      link('navSettings', 'account.html', 'Settings') +
      link('navBilling', 'billing.html', 'Billing &amp; plans') +
      '<button type="button" class="seq-sidebar-link pts-help' + (active === 'navHelp' ? ' active' : '') + '" id="helpMenuToggle" aria-expanded="false" aria-controls="helpSubmenu">' +
        '<span class="icon">' + I.navHelp + '</span> <span class="pts-label">Help</span><span class="pts-chev" id="helpMenuChevron" aria-hidden="true">▾</span></button>' +
      '<div class="help-submenu pts-sub" id="helpSubmenu">' +
        '<a href="help-center.html">📚 Help center</a><a href="feedback.html">💬 Send feedback</a><a href="privacy-policy.html">🔒 Privacy policy</a>' +
      '</div>' +
      '<button type="button" class="seq-sidebar-link pts-signout" id="signOutItem"><span class="icon">' + I.navSignOut + '</span> <span class="pts-label">Sign out</span></button>' +
    '</div>';

  var css = '' +
    '.pts-host{--pts-soft:#F8FBFE;--pts-line:#E9F0F8;width:232px !important;flex-shrink:0;background:var(--panel);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:18px 12px 14px !important;overflow-y:auto;box-sizing:border-box;scrollbar-width:none;-ms-overflow-style:none;}' +
    '.pts-host::-webkit-scrollbar{display:none;width:0;height:0;}' +
    'html[data-theme="dark"] .pts-host{--pts-soft:#1C2042;--pts-line:#22264A;}' +
    'aside.home-sidebar.pts-host{position:fixed;top:0;left:0;bottom:0;z-index:10;}' +
    'body.pts-on-home .app{margin-left:232px !important;}' +
    '@media (max-width:900px){body.pts-on-home aside.home-sidebar.pts-host{display:none !important;} body.pts-on-home .app{margin-left:0 !important;}}' +
    '.pts-host > *{flex-shrink:0;}' +
    '.pts-host .pts-logo{display:block;flex-shrink:0;width:36px;height:36px;min-height:36px;border-radius:10px;overflow:hidden;margin:0 0 16px 6px;box-shadow:0 3px 8px rgba(28,91,158,0.28);}' +
    '.pts-host .pts-logo img{width:100%;height:100%;display:block;}' +
    '.pts-host .pts-user{display:flex;align-items:center;gap:10px;padding:8px;margin:0 0 16px;border-radius:12px;background:var(--panel-alt,var(--pts-soft));}' +
    '.pts-host .seq-sidebar-avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:var(--panel);color:var(--teal);font:700 12px Inter,sans-serif;border:1px solid var(--border);overflow:hidden;}' +
    '.pts-host .seq-sidebar-avatar img{width:100%;height:100%;object-fit:cover;}' +
    '.pts-host .pts-user-text{min-width:0;display:flex;flex-direction:column;}' +
    '.pts-host .pts-user-text span{font:700 13px Inter,sans-serif;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.pts-host .pts-user-text small{font:500 11.5px Inter,sans-serif;color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.pts-host .pts-user-text small:empty{display:none;}' +
    '.pts-host .seq-sidebar-nav{display:flex;flex-direction:column;gap:2px;}' +
    '.pts-host .seq-sidebar-link{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border:0;background:none;border-radius:9px;font:600 13.5px Inter,sans-serif;color:var(--slate);text-decoration:none;cursor:pointer;text-align:left;box-sizing:border-box;transition:background .12s,color .12s;}' +
    '.pts-host .seq-sidebar-link .icon{width:18px;display:inline-flex;justify-content:center;flex-shrink:0;}' +
    '.pts-host .seq-sidebar-link:hover{background:var(--panel-alt,var(--pts-soft));color:var(--ink);}' +
    '.pts-host .seq-sidebar-link.active{background:var(--panel-alt,var(--pts-soft));color:var(--teal);}' +
    '.pts-host .seq-sidebar-link:focus-visible{outline:2px solid var(--teal);outline-offset:1px;}' +
    '.pts-host .pts-label{flex:1;min-width:0;}' +
    '.pts-host .seq-sidebar-label{font:700 10.5px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--slate-light,#8CA0B3);padding:14px 10px 4px;}' +
    '.pts-host .pts-bottom{margin-top:auto;padding-top:12px;border-top:1px solid var(--border-soft,var(--pts-line));display:flex;flex-direction:column;gap:2px;}' +
    '.pts-host .pts-theme{display:flex;gap:4px;margin:0 0 8px;background:var(--panel-alt,var(--pts-soft));border-radius:11px;padding:3px;}' +
    '.pts-host .pts-theme .theme-toggle-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 6px;border:0;border-radius:8px;background:none;color:var(--slate);font:600 12.5px Inter,sans-serif;cursor:pointer;}' +
    '.pts-host .pts-theme .theme-toggle-btn:hover{color:var(--ink);}' +
    '.pts-host .pts-theme .theme-toggle-btn.active{background:var(--panel);color:var(--ink);box-shadow:0 1px 2px rgba(16,24,40,.08);}' +
    '.pts-host .pts-theme .theme-toggle-btn.pt-sound-btn{flex:0 0 36px;}' +
    '.pts-host .pts-chev{margin-left:auto;font-size:11px;transition:transform .15s;}' +
    '.pts-host .pts-help[aria-expanded="true"] .pts-chev{transform:rotate(180deg);}' +
    '.pts-host .pts-sub{display:none;flex-direction:column;gap:1px;padding:2px 0 4px 38px;}' +
    '.pts-host .pts-sub.open{display:flex;}' +
    '.pts-host .pts-sub a{font:500 12.5px Inter,sans-serif;color:var(--slate);text-decoration:none;padding:6px 8px;border-radius:8px;}' +
    '.pts-host .pts-sub a:hover{background:var(--panel-alt,var(--pts-soft));color:var(--ink);}' +
    '.pts-host .pts-signout{color:#B42338;}' +
    '.pts-host .pts-signout:hover{background:rgba(216,58,82,.08);color:#B42338;}' +
    '.pts-host .pt-li-badge{margin-left:auto;}';

  var host = document.currentScript && document.currentScript.previousElementSibling;
  if(!host || !host.hasAttribute('data-pt-sidebar')) host = document.querySelector('[data-pt-sidebar]');
  if(!host) return;
  var st = document.createElement('style'); st.id = 'pts-styles'; st.textContent = css; document.head.appendChild(st);
  // Boards always goes to the boards overview. Some pages still have older code that
  // sets this link to a board's dashboard; this keeps it pointing at Boards.
  function lockHref(id, href){
    var el = document.getElementById(id); if(!el) return;
    try{ Object.defineProperty(el, 'href', {configurable: true, get: function(){ return new URL(href, location.href).href; }, set: function(){}}); }catch(e){}
    // …and the attribute itself (that's what a click follows)
    new MutationObserver(function(){ if(el.getAttribute('href') !== href) el.setAttribute('href', href); }).observe(el, {attributes: true, attributeFilter: ['href']});
    el.setAttribute('href', href);
  }
  host.classList.add('pts-host');
  host.setAttribute('aria-label', 'Side panel');
  host.innerHTML = html;
  if(isHome) document.body.classList.add('pts-on-home');
  lockHref('navDashboard', 'boards.html');

  // ----- Light / dark (Home has its own handler; the switch animation wraps both) -----
  function markTheme(){
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var l = document.getElementById('themeLightBtn'), d = document.getElementById('themeDarkBtn');
    if(l) l.classList.toggle('active', !dark); if(d) d.classList.toggle('active', dark);
  }
  markTheme();
  new MutationObserver(markTheme).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
  if(!isHome){
    function setTheme(t){ if(t === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); else document.documentElement.removeAttribute('data-theme'); try{ localStorage.setItem('theme', t); }catch(e){} }
    document.getElementById('themeLightBtn').addEventListener('click', function(){ setTheme('light'); });
    document.getElementById('themeDarkBtn').addEventListener('click', function(){ setTheme('dark'); });
    // ----- Help menu and sign out (Home wires these itself) -----
    var ht = document.getElementById('helpMenuToggle'), hs = document.getElementById('helpSubmenu');
    ht.addEventListener('click', function(){ var open = !hs.classList.contains('open'); hs.classList.toggle('open', open); ht.setAttribute('aria-expanded', open); });
    document.getElementById('signOutItem').addEventListener('click', function(){
      if(window.firebase && firebase.apps && firebase.apps.length){ firebase.auth().signOut().then(function(){ location.href = 'home.html'; }); }
      else location.href = 'home.html';
    });
  } else {
    // Home's own code toggles the help menu with a class; keep the arrow in sync.
    var ht2 = document.getElementById('helpMenuToggle'), hs2 = document.getElementById('helpSubmenu');
    new MutationObserver(function(){ var open = hs2.classList.contains('open') || hs2.style.display === 'flex' || hs2.style.display === 'block'; if(open) hs2.classList.add('open'); ht2.setAttribute('aria-expanded', open); })
      .observe(hs2, {attributes: true, attributeFilter: ['class', 'style']});
  }

  // ----- Your name, photo and role (the same on every page) -----
  function fillUser(){
    if(!window.firebase || !firebase.apps || !firebase.apps.length) return false;
    firebase.auth().onAuthStateChanged(function(u){
      if(!u) return;
      firebase.firestore().doc('userDirectory/' + u.uid).get().then(function(d){
        var ws = d.exists && d.data().workspaceId; if(!ws) return null;
        return firebase.firestore().doc('workspaces/' + ws + '/members/' + u.uid).get();
      }).then(function(m){
        var data = (m && m.exists) ? m.data() : {};
        var name = data.name || u.displayName || u.email || 'You';
        var photo = data.photoURL || data.linkedinPhotoURL || u.photoURL || '';
        var sub = [data.jobTitle || data.role || '', data.company || ''].filter(Boolean).join(' · ') || u.email || '';
        var n = document.getElementById('seqSidebarUserName'), av = document.getElementById('seqSidebarAvatar'), s = document.getElementById('ptsUserSub');
        if(n) n.textContent = name;
        if(s) s.textContent = sub;
        if(av){
          if(photo){ av.innerHTML = ''; var img = document.createElement('img'); img.src = photo; img.alt = ''; av.appendChild(img); }
          else { var w = String(name).trim().split(/\s+/); av.textContent = ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase(); }
        }
      }).catch(function(){});
    });
    return true;
  }
  if(!fillUser()) window.addEventListener('load', fillUser);
})();

/* ---------------------------------------------------------------------------
   Halloween mode: decorations on every tracker page (this file is on all of them).
   A cobweb in the top-right corner, a spider on its thread (click it and it scurries up),
   bats now and then, a ghost peeking from the bottom, a pumpkin on the logo and a
   "Happy Halloween" greeting in the menu. Nothing blocks clicks (only the spider is
   clickable); only light animations; nothing moves for people who turned animations off.
   On by default during the season (October 1 – November 2), off afterwards by itself.
   Settings → "Halloween decorations" turns it off (localStorage ptHalloween = 'off').
   --------------------------------------------------------------------------- */
(function () {
  var KEY = 'ptHalloween';
  function inSeason() { var d = new Date(), m = d.getMonth(); return m === 9 || (m === 10 && d.getDate() <= 2); }
  function wanted() { var v = null; try { v = localStorage.getItem(KEY); } catch (e) { /* ignore */ } return v !== 'off'; }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var layer = null, timers = [];

  var CSS = [
    '#ptHalloween{position:fixed;inset:0;pointer-events:none;z-index:30;overflow:hidden;--web:rgba(70,62,90,.28);--web2:rgba(70,62,90,.16);--critter:#2B2233;}',
    'html[data-theme="dark"] #ptHalloween{--web:rgba(235,225,255,.22);--web2:rgba(235,225,255,.12);--critter:#D9CCF0;}',
    '#ptHalloween .hw-spider svg,#ptHalloween .hw-bat svg{color:var(--critter);}',
    '#ptHalloween .hw-glow{position:absolute;left:0;right:0;top:0;height:160px;background:radial-gradient(60% 120% at 30% 0%,rgba(255,138,30,.10),transparent 70%),radial-gradient(50% 120% at 80% 0%,rgba(140,70,220,.10),transparent 70%);}',
    'html[data-theme="dark"] #ptHalloween .hw-glow{background:radial-gradient(60% 120% at 30% 0%,rgba(255,138,30,.16),transparent 70%),radial-gradient(50% 120% at 80% 0%,rgba(160,90,255,.16),transparent 70%);}',
    '#ptHalloween .hw-web{position:absolute;width:190px;height:190px;color:var(--web);}',
    '#ptHalloween .hw-web.tr{top:0;right:0;}',
    '#ptHalloween .hw-spider{position:absolute;top:0;right:4px;width:30px;transform-origin:50% 0;animation:hwSwing 5.5s ease-in-out infinite;transition:transform 1.4s cubic-bezier(.5,0,.3,1);}',
    '#ptHalloween .hw-spider .thread{display:block;margin:0 auto;width:1px;height:150px;background:var(--web);transition:height 1.2s cubic-bezier(.5,0,.3,1);}',
    '#ptHalloween .hw-spider svg{display:block;width:30px;height:30px;pointer-events:auto;cursor:pointer;margin-top:-2px;}',
    '#ptHalloween .hw-spider.up .thread{height:0;}',
    '#ptHalloween .hw-spider.up{animation:none;}',
    '@keyframes hwSwing{0%,100%{transform:rotate(-4deg);}50%{transform:rotate(4deg);}}',
    '#ptHalloween .hw-bat{position:absolute;left:0;top:0;width:46px;height:24px;will-change:transform;}',
    '#ptHalloween .hw-bat svg{width:100%;height:100%;animation:hwFlap .22s ease-in-out infinite alternate;transform-origin:50% 60%;}',
    '@keyframes hwFlap{from{transform:scaleY(1);}to{transform:scaleY(.45);}}',
    '#ptHalloween .hw-ghost{position:absolute;bottom:-90px;width:64px;height:84px;will-change:transform;opacity:.92;}',
    '.pts-host.pt-hw .pts-logo{overflow:visible;position:relative;} .pts-host.pt-hw .pts-logo img{border-radius:10px;}',
    'html.pt-hw-pk .pts-host.pt-hw .pts-logo::after{content:"\\1F383";position:absolute;right:-9px;bottom:-7px;font-size:17px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25));}',
    '.pt-hw-greet{margin:10px 6px 6px;padding:9px 12px;border-radius:12px;font-size:12.5px;font-weight:600;color:#9A4A06;background:linear-gradient(135deg,rgba(255,150,40,.16),rgba(150,80,230,.12));display:flex;align-items:center;gap:8px;}',
    'html[data-theme="dark"] .pt-hw-greet{color:#FFC27A;background:linear-gradient(135deg,rgba(255,150,40,.16),rgba(150,80,230,.18));}',
    // ---- the side panel in Halloween colours ----
    '.pts-host.pt-hw{background:radial-gradient(120% 34% at 0% 0%,rgba(255,138,30,.13),transparent 70%),radial-gradient(120% 30% at 100% 100%,rgba(140,70,220,.13),transparent 70%),var(--panel);border-right-color:rgba(255,138,30,.28);}',
    '.pts-host.pt-hw .seq-sidebar-label{color:#C2540A;}',
    'html[data-theme="dark"] .pts-host.pt-hw .seq-sidebar-label{color:#FFA552;}',
    '.pts-host.pt-hw .seq-sidebar-link:hover{background:rgba(255,138,30,.09);color:#8A3A05;}',
    'html[data-theme="dark"] .pts-host.pt-hw .seq-sidebar-link:hover{color:#FFC27A;}',
    '.pts-host.pt-hw .seq-sidebar-link.active{background:linear-gradient(90deg,rgba(255,138,30,.18),rgba(140,70,220,.07));color:#B24C06;box-shadow:inset 3px 0 0 #FF8A1E;}',
    'html[data-theme="dark"] .pts-host.pt-hw .seq-sidebar-link.active{color:#FFB25E;background:linear-gradient(90deg,rgba(255,138,30,.2),rgba(160,90,255,.1));}',
    '.pts-host.pt-hw .seq-sidebar-link.active .icon{color:#FF7A1A;}',
    '.pts-host.pt-hw .pts-user{background:linear-gradient(var(--panel-alt,var(--pts-soft)),var(--panel-alt,var(--pts-soft))) padding-box,linear-gradient(135deg,#FF8A1E,#9A4FE0) border-box;border:1px solid transparent;}',
    '.pts-host.pt-hw .pt-li-badge,html.pt-hw-on .pt-li-badge{background:linear-gradient(135deg,#FF8A1E,#E2580B) !important;box-shadow:0 0 0 2px var(--panel,#fff),0 0 10px rgba(255,122,26,.55) !important;}',
    '.pts-host.pt-hw .pts-theme .theme-toggle-btn.active{color:#B24C06;box-shadow:0 1px 2px rgba(16,24,40,.08),inset 0 -2px 0 #FF8A1E;}',
    'html[data-theme="dark"] .pts-host.pt-hw .pts-theme .theme-toggle-btn.active{color:#FFB25E;}',
    '.pt-hw-greet{margin:10px 6px 6px;padding:11px 12px;border-radius:14px;background:linear-gradient(135deg,#2B1646,#4A1F6B) !important;color:#FFC27A !important;display:flex;align-items:center;gap:9px;box-shadow:0 8px 20px -12px rgba(74,31,107,.8),inset 0 0 0 1px rgba(255,160,70,.25);font-weight:700;}',
    '.pt-hw-greet .pk{font-size:18px;line-height:1;animation:hwCandle 2.4s infinite;filter:drop-shadow(0 0 6px rgba(255,150,40,.7));}',
    '.pt-hw-greet b{display:block;font:700 12.5px Inter,sans-serif;} .pt-hw-greet small{display:block;font:500 11px Inter,sans-serif;color:#D9CCF0;margin-top:1px;}',
    '@keyframes hwCandle{0%,100%{opacity:1;}45%{opacity:.78;}50%{opacity:1;}72%{opacity:.86;}}',
    // ---- across the page: orange text selection, and a string of lights along the top ----
    'html.pt-hw-on ::selection{background:rgba(255,138,30,.3);}',
    // pages with their own logo at the top (Account, Billing): the pumpkin on that logo too
    'html.pt-hw-on .logo-badge{position:relative;overflow:visible;}',
    'html.pt-hw-on.pt-hw-pk .logo-badge::after{content:"\\1F383";position:absolute;right:-9px;bottom:-7px;font-size:17px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25));pointer-events:none;}',
    '#ptHalloween .hw-lights{position:absolute;top:0;right:0;height:52px;}',
    '#ptHalloween .hw-lights svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}',
    '#ptHalloween .hw-bulb{position:absolute;width:10px;height:16px;margin-left:-5px;border-radius:50% 50% 45% 45%;will-change:opacity;animation:hwTwinkle 3.2s ease-in-out infinite;}',
    '#ptHalloween .hw-bulb::before{content:"";position:absolute;left:2px;top:-4px;width:6px;height:5px;border-radius:2px;background:#3A3346;}',
    '#ptHalloween .hw-bulb.o{background:radial-gradient(circle at 40% 35%,#FFE0A8,#FF8A1E 60%);box-shadow:0 0 10px 3px rgba(255,138,30,.55);}',
    '#ptHalloween .hw-bulb.p{background:radial-gradient(circle at 40% 35%,#EBD6FF,#A35CF0 60%);box-shadow:0 0 10px 3px rgba(163,92,240,.5);}',
    '#ptHalloween .hw-bulb.g{background:radial-gradient(circle at 40% 35%,#E6FFC9,#6CCB3B 60%);box-shadow:0 0 10px 3px rgba(108,203,59,.45);}',
    '@keyframes hwTwinkle{0%,100%{opacity:1;}50%{opacity:.45;}}',
    '@media (prefers-reduced-motion: reduce){#ptHalloween *,.pt-hw-greet .pk{animation:none !important;transition:none !important;}}'
  ].join('\n');

  var WEB = '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M200 0 L60 0 M200 0 L0 60 M200 0 L60 200 M200 0 L130 200 M200 0 L0 140 M200 0 L200 140"/>' +
    '<path d="M168 0 Q170 18 200 22 M130 0 Q140 40 200 50 M96 0 Q112 64 200 82 M64 0 Q86 94 200 116 M34 6 Q64 124 200 150" stroke-width="1"/></svg>';
  var SPIDER = '<svg viewBox="0 0 40 40"><g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M14 18 L4 10 M14 21 L2 21 M14 24 L4 32 M15 27 L9 37 M26 18 L36 10 M26 21 L38 21 M26 24 L36 32 M25 27 L31 37"/></g>' +
    '<ellipse cx="20" cy="23" rx="8" ry="9" fill="currentColor"/><circle cx="20" cy="13" r="5.5" fill="currentColor"/><circle cx="18" cy="12.5" r="1.4" fill="#FF8A1E"/><circle cx="22" cy="12.5" r="1.4" fill="#FF8A1E"/></svg>';
  var BAT = '<svg viewBox="0 0 64 32"><path fill="currentColor" d="M32 10c2-3 5-3 6-1 4-4 10-6 16-5-4 2-6 6-5 10-3-2-7-1-9 2-2-2-5-2-6 0-1-2-4-2-6 0-2-3-6-4-9-2 1-4-1-8-5-10 6-1 12 1 16 5 1-2 4-2 6 1z"/><circle cx="29.5" cy="12" r="1" fill="#FF8A1E"/><circle cx="34.5" cy="12" r="1" fill="#FF8A1E"/></svg>';
  var GHOST = '<svg viewBox="0 0 64 84"><path fill="#FFFFFF" stroke="rgba(60,50,80,.18)" stroke-width="1.5" d="M32 3C16 3 6 15 6 31v44l8-6 8 7 10-8 10 8 8-7 8 6V31C58 15 48 3 32 3z"/>' +
    '<ellipse cx="24" cy="32" rx="4" ry="5.5" fill="#2B2233"/><ellipse cx="40" cy="32" rx="4" ry="5.5" fill="#2B2233"/><ellipse cx="32" cy="46" rx="4" ry="3" fill="#2B2233" opacity=".8"/></svg>';

  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  // bats and the ghost come by at most once every 20 minutes (remembered across pages, so moving
  // around the app doesn't restart the clock); the first ones a few minutes after you start
  var HW_EVERY = 20 * 60 * 1000;
  function hwDue(k) {
    var now = Date.now(), last = 0;
    try { last = Number(localStorage.getItem('ptHwLast_' + k)) || 0; } catch (e) { return false; }
    if (!last) { try { localStorage.setItem('ptHwLast_' + k, String(now - HW_EVERY + (k === 'bats' ? 3 : 8) * 60000)); } catch (e) {} return false; }
    return now - last >= HW_EVERY;
  }
  function hwDone(k) { try { localStorage.setItem('ptHwLast_' + k, String(Date.now())); } catch (e) {} }
  function bats() {
    if (!layer || reduced || document.hidden) return later(bats, 20000);
    if (!hwDue('bats')) return later(bats, 30000);
    var n = 2 + Math.floor(Math.random() * 2), W = innerWidth, H = innerHeight;
    for (var i = 0; i < n; i++) (function (i) {
      var b = document.createElement('div'); b.className = 'hw-bat'; b.innerHTML = BAT; layer.appendChild(b);
      var y = 60 + Math.random() * H * 0.35, ltr = Math.random() < 0.5, dur = 6500 + Math.random() * 2500, s = 0.7 + Math.random() * 0.5;
      var x0 = ltr ? -80 : W + 80, x1 = ltr ? W + 80 : -80;
      var a = b.animate([
        {transform: 'translate3d(' + x0 + 'px,' + y + 'px,0) scale(' + (ltr ? s : -s) + ',' + s + ')'},
        {transform: 'translate3d(' + (x0 + (x1 - x0) * 0.35) + 'px,' + (y - 50) + 'px,0) scale(' + (ltr ? s : -s) + ',' + s + ')', offset: 0.35},
        {transform: 'translate3d(' + (x0 + (x1 - x0) * 0.7) + 'px,' + (y + 30) + 'px,0) scale(' + (ltr ? s : -s) + ',' + s + ')', offset: 0.7},
        {transform: 'translate3d(' + x1 + 'px,' + (y - 20) + 'px,0) scale(' + (ltr ? s : -s) + ',' + s + ')'}
      ], {duration: dur, delay: i * 450, easing: 'ease-in-out'});
      a.onfinish = function () { b.remove(); };
    })(i);
    hwDone('bats'); later(bats, 30000);
  }
  function ghost() {
    if (!layer || reduced || document.hidden) return later(ghost, 30000);
    if (!hwDue('ghost')) return later(ghost, 30000);
    var g = document.createElement('div'); g.className = 'hw-ghost'; g.innerHTML = GHOST;
    g.style.left = (260 + Math.random() * Math.max(100, innerWidth - 380)) + 'px'; layer.appendChild(g);
    var a = g.animate([{transform: 'translate3d(0,0,0)'}, {transform: 'translate3d(0,-78px,0) rotate(-6deg)', offset: 0.3}, {transform: 'translate3d(0,-70px,0) rotate(5deg)', offset: 0.65}, {transform: 'translate3d(0,0,0)'}],
      {duration: 4200, easing: 'ease-in-out'});
    a.onfinish = function () { g.remove(); };
    hwDone('ghost'); later(ghost, 30000);
  }
  // a string of lights hanging along the top of the page (not over the side panel)
  function lights() {
    if (!layer) return;
    var old = layer.querySelector('.hw-lights'); if (old) old.remove();
    var side = document.querySelector('.pts-host'), left = side ? Math.round(side.getBoundingClientRect().right) : 0;
    var W = Math.max(200, innerWidth - left - 6), n = Math.max(4, Math.round(W / 130)), seg = W / n, colours = ['o', 'p', 'o', 'g'];
    var path = 'M0 6', bulbs = '';
    for (var i = 0; i < n; i++) {
      var x0 = i * seg, x1 = x0 + seg, sag = 18 + (i % 2) * 6;
      path += ' Q' + (x0 + seg / 2).toFixed(1) + ' ' + (6 + sag * 2) + ' ' + x1.toFixed(1) + ' 6';
      bulbs += '<i class="hw-bulb ' + colours[i % 4] + '" style="left:' + (x0 + seg / 2).toFixed(1) + 'px;top:' + (6 + sag - 1) + 'px;animation-delay:-' + ((i * 0.7) % 3.2).toFixed(1) + 's"></i>';
    }
    var box = document.createElement('div'); box.className = 'hw-lights'; box.style.left = left + 'px';
    box.innerHTML = '<svg aria-hidden="true"><path d="' + path + '" fill="none" stroke="#3A3346" stroke-width="1.6" opacity=".55"/></svg>' + bulbs;
    layer.insertBefore(box, layer.firstChild.nextSibling);
  }
  var lightsTimer = null;
  window.addEventListener('resize', function () { clearTimeout(lightsTimer); lightsTimer = setTimeout(lights, 200); });
  function on() {
    if (layer) return;
    document.documentElement.classList.add('pt-hw-on');
    if (!document.getElementById('ptHalloweenCss')) { var st = document.createElement('style'); st.id = 'ptHalloweenCss'; st.textContent = CSS; document.head.appendChild(st); }
    layer = document.createElement('div'); layer.id = 'ptHalloween'; layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<div class="hw-glow"></div><div class="hw-web tr">' + WEB + '</div>' +
      '<div class="hw-spider"><span class="thread"></span>' + SPIDER + '</div>';
    document.body.appendChild(layer);
    var sp = layer.querySelector('.hw-spider');
    sp.querySelector('svg').addEventListener('click', function () {        // the spider scurries up, and comes back later
      if (sp.classList.contains('up')) return;
      sp.classList.add('up'); later(function () { sp.classList.remove('up'); }, 14000);
    });
    var host = document.querySelector('.pts-host');
    if (host) {
      host.classList.add('pt-hw');
      if (!host.querySelector('.pt-hw-greet')) {
        var greet = document.createElement('div'); greet.className = 'pt-hw-greet'; greet.innerHTML = '<span class="pk">\uD83C\uDF83</span><span><b>Happy Halloween</b><small>Spooky season is here \uD83E\uDD87</small></span>';
        var bottom = host.querySelector('.pts-bottom'); if (bottom) host.insertBefore(greet, bottom); else host.appendChild(greet);
      }
    }
    lights();
    later(bats, 4000); later(ghost, 15000);
  }
  function off() {
    document.documentElement.classList.remove('pt-hw-on');
    timers.forEach(clearTimeout); timers = [];
    if (layer) { layer.remove(); layer = null; }
    var host = document.querySelector('.pts-host'); if (host) { host.classList.remove('pt-hw'); var g = host.querySelector('.pt-hw-greet'); if (g) g.remove(); }
  }
  function apply() { if (inSeason() && wanted()) on(); else off(); }
  // the switch in Settings (and other open tabs follow along)
  window.ptHalloween = {
    isOn: function () { return wanted(); }, inSeason: inSeason,
    set: function (v) { try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) { /* ignore */ } apply(); }
  };
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(apply, 50); }); else setTimeout(apply, 50);
})();

/* ---------------------------------------------------------------------------
   Halloween surprise: once per person, the first time they close the "Welcome back"
   screen during the season (home.html sends 'pt-welcome-dismissed').
   1. A Halloween night falls: thunder and lightning, a big jack-o'-lantern rises with an
      organ chord, and a swarm of bats bursts out with an eerie glide.
   2. A pop-up explains the new Halloween theme and how to turn it off, while ghosts float,
      bats circle, fog rolls and spooky music-box music plays (🔊 to mute; it stops on close).
   All sound is made in the browser (no files). Seen: localStorage ptHwIntroSeen.
   --------------------------------------------------------------------------- */
(function () {
  var SEEN = 'ptHwIntroSeen';
  var HERE = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/[^\/?#]*([?#].*)?$/, '') : '';
  var LAUGH_FILE = HERE + 'halloween-laugh.mp3';      // the pumpkin's laugh (a recording, next to sidebar.js)
  var LAUGH_BEATS = [0.3, 0.56, 0.7, 0.82, 0.96, 1.1, 1.24, 1.36, 1.52, 1.66, 1.8], LAUGH_LEN = 2.1;   // where the HAs are in it
  function inSeason() { var d = new Date(), m = d.getMonth(); return m === 9 || (m === 10 && d.getDate() <= 2); }
  function decoOn() { try { return localStorage.getItem('ptHalloween') !== 'off'; } catch (e) { return true; } }
  // "seen" is remembered per account (not per browser): a new account always gets the surprise once,
  // also in a browser where someone else already saw it
  function uid() { try { var u = window.firebase && firebase.auth && firebase.auth().currentUser; return u ? u.uid : ''; } catch (e) { return ''; } }
  function seenKey() { var id = uid(); return id ? SEEN + ':' + id : SEEN; }
  function seen() { try { return localStorage.getItem(seenKey()) === '1'; } catch (e) { return true; } }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- sound ----------
  var ac = null, master = null, musicTimer = null, musicOn = true, droneNodes = [];
  function audio() {
    if (!ac) {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C();
      var lim = ac.createDynamicsCompressor(); lim.threshold.value = -3; lim.knee.value = 2; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12; lim.connect(ac.destination);
      master = ac.createGain(); master.gain.value = 0.9; master.connect(lim);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function noise(len) { var b = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  function thunder(t, vol, dest) {
    var src = ac.createBufferSource(); src.buffer = noise(2.6);
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(120, t + 2.4);
    var v = vol || 0.55, g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.04); g.gain.exponentialRampToValueAtTime(v * 0.22, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    src.connect(lp); lp.connect(g); g.connect(dest || master); src.start(t); src.stop(t + 2.6);
  }
  function organ(t, notes, len, vol) {
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.35); g.gain.setValueAtTime(vol, t + len - 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    lp.connect(g); g.connect(master);
    notes.forEach(function (f) { [1, 2, 0.5].forEach(function (m, k) { var o = ac.createOscillator(), og = ac.createGain(); o.type = k ? 'sine' : 'sawtooth'; o.frequency.value = f * m; og.gain.value = [0.16, 0.08, 0.1][k]; o.connect(og); og.connect(lp); o.start(t); o.stop(t + len + 0.05); }); });
  }
  function ghostGlide(t) {                 // an eerie theremin-like glide, with vibrato
    var o = ac.createOscillator(), v = ac.createOscillator(), vg = ac.createGain(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(330, t + 1.6); o.frequency.exponentialRampToValueAtTime(520, t + 2.4);
    v.frequency.value = 6; vg.gain.value = 14; v.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    o.connect(g); g.connect(master); o.start(t); v.start(t); o.stop(t + 2.6); v.stop(t + 2.6);
  }
  // ---------- the music: a little Halloween waltz in D minor ("Danse Macabre" style) ----------
  // 16 bars of 3/4 that loop (~19 s): a theme (A) and a higher, darker answer (B).
  // Celesta melody with an echo, plucked bass on beat 1, soft chords on 2 and 3, a ghostly choir in B,
  // timpani and church bells at the start of each part, all through a big hollow reverb.
  var musicBus = null;
  var NOTE = {C: -9, 'C#': -8, Db: -8, D: -7, 'D#': -6, Eb: -6, E: -5, F: -4, 'F#': -3, Gb: -3, G: -2, 'G#': -1, Ab: -1, A: 0, 'A#': 1, Bb: 1, B: 2};
  function hz(n) { var m = /^([A-G][b#]?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + (Number(m[2]) - 4) * 12) / 12); }
  var CH = {Dm: ['D2', ['D4', 'F4', 'A4']], Gm: ['G2', ['G3', 'Bb3', 'D4']], A7: ['A1', ['A3', 'C#4', 'E4', 'G4']], Bb: ['Bb1', ['Bb3', 'D4', 'F4']],
            C: ['C2', ['C4', 'E4', 'G4']], A: ['A1', ['A3', 'C#4', 'E4']], DmF: ['F2', ['D4', 'F4', 'A4']], Edim: ['E2', ['E4', 'G4', 'Bb4']]};
  var BARS = ['Dm', 'Dm', 'Gm', 'A7', 'Dm', 'Bb', 'Gm', 'A7',  'Dm', 'C', 'Bb', 'A', 'Gm', 'DmF', 'Edim', 'A7'];
  var MELODY = [ // [note, beats]
    ['A4', 1], ['D5', 1], ['F5', 1],   ['E5', 1.5], ['D5', .5], ['C#5', 1],   ['D5', 1], ['G4', 1], ['Bb4', 1],   ['A4', 2], ['E5', 1],
    ['F5', 1], ['E5', .5], ['F5', .5], ['A5', 1],   ['G5', 1.5], ['F5', .5], ['D5', 1],   ['E5', 1], ['Bb4', 1], ['C#5', 1],   ['C#5', 1.5], ['E5', .5], ['A5', 1],
    ['D6', 1.5], ['C#6', .5], ['D6', 1],   ['E6', 1], ['C6', 1], ['G5', 1],   ['D6', 1.5], ['C6', .5], ['Bb5', 1],   ['A5', 1], ['C#6', 1], ['E6', 1],
    ['G5', 1], ['Bb5', .5], ['A5', .5], ['G5', 1],   ['F5', 1], ['A5', 1], ['D6', 1],   ['G5', .5], ['F5', .5], ['E5', .5], ['D5', .5], ['C#5', 1],   ['D5', 3]];
  var BEAT = 0.4, LOOP = 48 * BEAT;
  function reverb(ctx, secs) {
    var len = ctx.sampleRate * secs, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = buf.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    var cv = ctx.createConvolver(); cv.buffer = buf; return cv;
  }
  function env(ctx, t, a, peak, dur, out) { var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); g.connect(out); return g; }
  function osc(ctx, type, f, t, dur, out, detune) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = f; if (detune) o.detune.value = detune; o.connect(out); o.start(t); o.stop(t + dur + 0.05); return o; }
  // the instruments; "out" is {dry, wet, echo}
  function celesta(ctx, out, t, f, dur) {
    var g = env(ctx, t, 0.006, 0.12, Math.max(0.9, dur + 0.7), out.dry); g.connect(out.echo); g.connect(out.wet);
    osc(ctx, 'sine', f, t, dur + 1, g); var h = ctx.createGain(); h.gain.value = 0.35; h.connect(g); osc(ctx, 'sine', f * 2, t, dur + 1, h, 4);
    var h3 = ctx.createGain(); h3.gain.value = 0.08; h3.connect(g); osc(ctx, 'triangle', f * 4.02, t, 0.4, h3);
  }
  function pluck(ctx, out, t, f) {
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(160, t + 0.4);
    var g = env(ctx, t, 0.005, 0.32, 0.75, out.dry); g.connect(out.wet); lp.connect(g);
    osc(ctx, 'triangle', f, t, 0.8, lp); osc(ctx, 'sawtooth', f * 2, t, 0.3, lp, -6);
  }
  function stab(ctx, out, t, freqs) {
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
    var g = env(ctx, t, 0.008, 0.045, 0.32, out.dry); g.connect(out.wet); lp.connect(g);
    freqs.forEach(function (f) { osc(ctx, 'square', f, t, 0.33, lp); });
  }
  function choir(ctx, out, t, freqs, dur) {
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 2;
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.5); g.gain.setValueAtTime(0.05, t + dur - 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.4);
    g.connect(out.wet); g.connect(out.dry); lp.connect(g);
    freqs.forEach(function (f) { [-9, 0, 8].forEach(function (d) { osc(ctx, 'sawtooth', f, t, dur + 0.5, lp, d); }); });
  }
  function timpani(ctx, out, t, f) {
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.12);
    var g = env(ctx, t, 0.004, 0.5, 1.6, out.dry); g.connect(out.wet); o.connect(g); o.start(t); o.stop(t + 1.7);
    var n = ctx.createBufferSource(), nb = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate), d = nb.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    n.buffer = nb; var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; var ng = env(ctx, t, 0.003, 0.2, 0.3, out.dry); n.connect(lp); lp.connect(ng); n.start(t);
  }
  function bell(ctx, out, t, f) {
    var g = env(ctx, t, 0.004, 0.07, 3.2, out.wet); g.connect(out.dry);
    [[1, 1], [2.76, 0.5], [5.4, 0.25], [8.93, 0.12], [0.5, 0.4]].forEach(function (p) { var h = ctx.createGain(); h.gain.value = p[1]; h.connect(g); osc(ctx, 'sine', f * p[0], t, 3.2, h); });
  }
  // schedules one round of the song from time t0; works for live playback and for rendering to a file
  function songRound(ctx, out, t0) {
    BARS.forEach(function (name, bar) {
      var t = t0 + bar * 3 * BEAT, c = CH[name], bass = hz(c[0]), chord = c[1].map(hz);
      pluck(ctx, out, t, bass); stab(ctx, out, t + BEAT, chord); stab(ctx, out, t + 2 * BEAT, chord);
      if (bar >= 8) choir(ctx, out, t, chord, 3 * BEAT);                          // the ghostly choir in part B
      if (bar === 0 || bar === 8) { timpani(ctx, out, t, hz(bar ? 'A1' : 'D2')); bell(ctx, out, t, hz(bar ? 'A5' : 'D5')); }
      if (bar === 15) { for (var r = 0; r < 6; r++) timpani(ctx, out, t + 2 * BEAT + r * BEAT / 6, hz('A1')); }   // a roll back into the theme
    });
    var t = t0; MELODY.forEach(function (n) { celesta(ctx, out, t, hz(n[0]), n[1] * BEAT); t += n[1] * BEAT; });
  }
  function songBus(ctx, dest) {
    var dry = ctx.createGain(); dry.gain.value = 0.9; dry.connect(dest);
    var rv = reverb(ctx, 3.2), wet = ctx.createGain(); wet.gain.value = 0.55; wet.connect(rv); rv.connect(dest);
    var dl = ctx.createDelay(1); dl.delayTime.value = BEAT * 0.75; var fb = ctx.createGain(); fb.gain.value = 0.32; var echo = ctx.createGain(); echo.gain.value = 0.35;
    echo.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); dl.connect(dry);
    return {dry: dry, wet: wet, echo: echo};
  }
  function startMusic() {
    if (!audio()) return;
    musicBus = ac.createGain(); musicBus.gain.value = musicOn ? 1 : 0; musicBus.connect(master);
    var out = songBus(ac, musicBus), next = ac.currentTime + 0.25;
    function loop() { songRound(ac, out, next); next += LOOP; musicTimer = setTimeout(loop, (next - ac.currentTime - 1.2) * 1000); }
    loop();
  }
  // the drop: a riser, then a distorted 808 boom whose deep rumble stays under the laugh and slowly
  // fades away, stopping when the laughter stops ("until" = when the laugh ends)
  function bassDrop(t, until) {
    // the riser: noise sweeping up, getting louder
    var rs = ac.createBufferSource(); rs.buffer = noise(0.6);
    var hp = ac.createBiquadFilter(); hp.type = 'bandpass'; hp.Q.value = 1.2; hp.frequency.setValueAtTime(400, t); hp.frequency.exponentialRampToValueAtTime(6000, t + 0.5);
    var rg = ac.createGain(); rg.gain.setValueAtTime(0.0001, t); rg.gain.exponentialRampToValueAtTime(0.35, t + 0.48); rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.56);
    rs.connect(hp); hp.connect(rg); rg.connect(master); rs.start(t); rs.stop(t + 0.6);
    var d = t + 0.5;                                   // the drop
    // squashed, so it hits hard without crackling
    var comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 6; comp.ratio.value = 8; comp.attack.value = 0.002; comp.release.value = 0.25; comp.connect(master);
    var shaper = ac.createWaveShaper(), curve = new Float32Array(1024);
    for (var i = 0; i < 1024; i++) { var x = i / 512 - 1; curve[i] = Math.tanh(x * 3.2); }          // "bass boosted": a warm distortion
    shaper.curve = curve; shaper.oversample = '4x';
    var tail = Math.max(d + 1.6, until || (d + 2.6));
    // after the hit only the deepest tones remain (below the voice), so the laugh stays clear
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, d); lp.frequency.exponentialRampToValueAtTime(240, d + 0.5);
    var bg = ac.createGain(); bg.gain.setValueAtTime(0.0001, d); bg.gain.exponentialRampToValueAtTime(0.9, d + 0.01); bg.gain.exponentialRampToValueAtTime(0.38, d + 0.3);
    bg.gain.exponentialRampToValueAtTime(0.2, d + 0.8); bg.gain.linearRampToValueAtTime(0.0001, tail);   // a long, slow fade, gone when the laugh ends
    shaper.connect(lp); lp.connect(bg); bg.connect(comp);
    var o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(150, d); o.frequency.exponentialRampToValueAtTime(48, d + 0.12); o.frequency.exponentialRampToValueAtTime(34, tail);
    o.connect(shaper); o.start(d); o.stop(tail + 0.05);
    var sub = ac.createOscillator(), sg = ac.createGain(); sub.type = 'sine'; sub.frequency.setValueAtTime(55, d);
    sub.frequency.exponentialRampToValueAtTime(28, tail);
    sg.gain.setValueAtTime(0.0001, d); sg.gain.exponentialRampToValueAtTime(0.7, d + 0.02); sg.gain.exponentialRampToValueAtTime(0.24, d + 0.5); sg.gain.linearRampToValueAtTime(0.0001, tail);
    sub.connect(sg); sg.connect(comp); sub.start(d); sub.stop(tail + 0.05);
    // the impact: a short, deep burst of noise
    var im = ac.createBufferSource(); im.buffer = noise(0.5); var il = ac.createBiquadFilter(); il.type = 'lowpass'; il.frequency.setValueAtTime(2400, d); il.frequency.exponentialRampToValueAtTime(180, d + 0.35);
    var ig = ac.createGain(); ig.gain.setValueAtTime(0.0001, d); ig.gain.exponentialRampToValueAtTime(0.5, d + 0.005); ig.gain.exponentialRampToValueAtTime(0.0001, d + 0.45);
    im.connect(il); il.connect(ig); ig.connect(comp); im.start(d); im.stop(d + 0.5);
    return d;
  }
  // ---------- the pumpkin's laugh: a recording (halloween-laugh.mp3), loaded when the surprise starts ----------
  var laughBuf = null, laughLoading = null, laughEl = null;
  function loadLaugh() {
    if (!laughEl) {                                    // a plain audio clip as a second way to play it
      laughEl = new Audio(LAUGH_FILE); laughEl.preload = 'auto'; laughEl.volume = 1;
      laughEl.addEventListener('error', function () { console.warn('Halloween laugh: the file couldn’t be loaded from ' + LAUGH_FILE + ' (is halloween-laugh.mp3 next to sidebar.js?)'); });
      try { laughEl.load(); } catch (e) {}
    }
    if (laughBuf || laughLoading || !ac) return laughLoading;
    laughLoading = fetch(LAUGH_FILE).then(function (r) { if (!r.ok) throw new Error('laugh ' + r.status); return r.arrayBuffer(); })
      .then(function (b) { return new Promise(function (res, rej) { ac.decodeAudioData(b, res, rej); }); })
      .then(function (buf) { laughBuf = buf; }).catch(function (e) { console.warn('Halloween laugh not loaded:', e); laughLoading = null; });
    return laughLoading;
  }
  function laugh(t) {
    if (!laughBuf) {                                   // not decoded (yet): play the plain audio clip instead
      if (laughEl) setTimeout(function () {
        try { laughEl.currentTime = 0; laughEl.volume = 1; laughEl.playbackRate = 1; } catch (e) {}
        var pr = laughEl.play(); if (pr && pr.catch) pr.catch(function (e) { console.warn('Halloween laugh couldn’t play:', e); });
        var t0 = performance.now(), fade = setInterval(function () {                  // fading into the distance
          var k = Math.min(1, Math.max(0, (performance.now() - t0 - 350) / ((LAUGH_LEN - 0.35) * 1000)));
          try { laughEl.volume = Math.max(0, Math.pow(1 - k, 2.2)); } catch (e) {}
          if (k >= 1) clearInterval(fade);
        }, 50);
      }, Math.max(0, (t - ac.currentTime) * 1000));
      return t + LAUGH_LEN;
    }
    // the laugh flies off into the distance with the pumpkin: quieter, more muffled, more echoey,
    // drifting left (towards the logo) and dropping slightly in pitch, like something speeding away
    var len = laughBuf.duration, away = t + 0.35, end = t + len / 0.93;
    var src = ac.createBufferSource(); src.buffer = laughBuf;
    src.playbackRate.setValueAtTime(1, t); src.playbackRate.linearRampToValueAtTime(0.93, end);
    var muffle = ac.createBiquadFilter(); muffle.type = 'lowpass'; muffle.Q.value = 0.5;
    muffle.frequency.setValueAtTime(14000, t); muffle.frequency.setValueAtTime(14000, away); muffle.frequency.exponentialRampToValueAtTime(700, end);
    var near = ac.createGain(); near.gain.setValueAtTime(0.9, t); near.gain.setValueAtTime(0.9, away); near.gain.exponentialRampToValueAtTime(0.03, end);
    var pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
    if (pan) { pan.pan.setValueAtTime(0, t); pan.pan.setValueAtTime(0, away); pan.pan.linearRampToValueAtTime(-0.75, end); }
    // the echo of a far-off sound: it grows as the laugh moves away, then dies out softly
    var dl = ac.createDelay(1); dl.delayTime.value = 0.21; var fb = ac.createGain(); fb.gain.value = 0.38; var fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1800;
    var echo = ac.createGain(); echo.gain.setValueAtTime(0.0001, t); echo.gain.exponentialRampToValueAtTime(0.5, end - 0.2); echo.gain.exponentialRampToValueAtTime(0.0001, end + 0.9);
    src.connect(muffle); muffle.connect(near);
    var outNode = pan || master; if (pan) pan.connect(master);
    near.connect(outNode);
    muffle.connect(echo); echo.connect(dl); dl.connect(fl); fl.connect(fb); fb.connect(dl); fl.connect(outNode);
    src.start(t);
    return end + 0.9;
  }
  function stopMusic() {
    clearTimeout(musicTimer); musicTimer = null;
    if (musicBus && ac) { musicBus.gain.setTargetAtTime(0, ac.currentTime, 0.15); }
    setTimeout(function () { if (musicBus) { try { musicBus.disconnect(); } catch (e) {} musicBus = null; } }, 900);   // everything already planned goes silent with it
  }

  // ---------- the picture ----------
  var PUMPKIN = '<svg viewBox="0 0 220 200" aria-hidden="true"><defs><radialGradient id="hiP" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#FFB347"/><stop offset=".6" stop-color="#F7801E"/><stop offset="1" stop-color="#C2530A"/></radialGradient>' +
    '<radialGradient id="hiG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF6B0"/><stop offset=".55" stop-color="#FFD23F"/><stop offset="1" stop-color="#FF9A1F"/></radialGradient></defs>' +
    '<path d="M104 30c-2-14 4-24 16-28 3 6-1 14-6 18-2 4-3 7-3 10z" fill="#3F7A2A"/>' +
    '<ellipse cx="62" cy="115" rx="52" ry="72" fill="url(#hiP)"/><ellipse cx="158" cy="115" rx="52" ry="72" fill="url(#hiP)"/><ellipse cx="110" cy="112" rx="58" ry="78" fill="url(#hiP)"/>' +
    '<path d="M110 36v150M74 44c-14 30-14 110 0 140M146 44c14 30 14 110 0 140" stroke="#C2530A" stroke-width="3" fill="none" opacity=".45"/>' +
    '<g class="hi-glow"><path d="M60 92l26-22 14 30z" fill="url(#hiG)"/><path d="M160 92l-26-22-14 30z" fill="url(#hiG)"/><path d="M103 118l7-14 7 14z" fill="url(#hiG)"/>' +
    '<path d="M52 136c20 26 96 26 116 0l-12 4-8 10-10-8-10 10-8-10-10 10-10-10-8 8-10-10z" fill="url(#hiG)"/></g></svg>';
  var BAT = '<svg viewBox="0 0 64 32"><path fill="#140C1C" d="M32 10c2-3 5-3 6-1 4-4 10-6 16-5-4 2-6 6-5 10-3-2-7-1-9 2-2-2-5-2-6 0-1-2-4-2-6 0-2-3-6-4-9-2 1-4-1-8-5-10 6-1 12 1 16 5 1-2 4-2 6 1z"/><circle cx="29.5" cy="12" r="1" fill="#FF8A1E"/><circle cx="34.5" cy="12" r="1" fill="#FF8A1E"/></svg>';
  var GHOST = '<svg viewBox="0 0 64 84"><path fill="#F4F1FF" d="M32 3C16 3 6 15 6 31v44l8-6 8 7 10-8 10 8 8-7 8 6V31C58 15 48 3 32 3z"/><ellipse cx="24" cy="32" rx="4" ry="5.5" fill="#2B2233"/><ellipse cx="40" cy="32" rx="4" ry="5.5" fill="#2B2233"/><ellipse cx="32" cy="46" rx="4" ry="3" fill="#2B2233" opacity=".8"/></svg>';
  var CSS = [
    '#hwIntro{position:fixed;inset:0;z-index:5000;overflow:hidden;font-family:Inter,system-ui,sans-serif;}',
    '#hwIntro .hi-night{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 20%,#3B1D5E 0%,#1A0E2E 55%,#0B0614 100%);opacity:0;transition:opacity .45s ease;}',
    '#hwIntro.on .hi-night{opacity:.97;}',
    '#hwIntro .hi-stars{position:absolute;inset:0;background-image:radial-gradient(1.5px 1.5px at 12% 18%,#fff8,transparent),radial-gradient(1px 1px at 28% 40%,#fff6,transparent),radial-gradient(1.5px 1.5px at 72% 12%,#fff9,transparent),radial-gradient(1px 1px at 86% 34%,#fff7,transparent),radial-gradient(1px 1px at 46% 8%,#fff8,transparent),radial-gradient(1.5px 1.5px at 60% 28%,#fff6,transparent);opacity:0;transition:opacity 1.2s ease .3s;}',
    '#hwIntro.on .hi-stars{opacity:1;}',
    '#hwIntro .hi-moon{position:absolute;right:9%;top:8%;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 38% 38%,#FFF8D6,#F5D98A 60%,#D9B25E);box-shadow:0 0 60px 20px rgba(255,220,140,.25),0 0 140px 40px rgba(255,190,90,.12);opacity:0;transform:scale(.6);transition:opacity .8s ease .2s,transform 1.2s cubic-bezier(.2,.8,.2,1) .2s;}',
    '#hwIntro.on .hi-moon{opacity:1;transform:none;}',
    '#hwIntro .hi-flash{position:absolute;inset:0;background:#E9E2FF;opacity:0;pointer-events:none;}',
    '#hwIntro .hi-pumpkin{position:absolute;left:50%;top:50%;width:260px;margin-left:-130px;margin-top:-120px;will-change:transform;filter:drop-shadow(0 0 40px rgba(255,140,30,.55));}',
    '#hwIntro .hi-glow{animation:hiFlicker 1.6s infinite;} @keyframes hiFlicker{0%,100%{opacity:1;}42%{opacity:.82;}46%{opacity:1;}61%{opacity:.7;}66%{opacity:.96;}}',
    '#hwIntro .hi-bat{position:absolute;left:50%;top:50%;width:54px;height:28px;margin:-14px 0 0 -27px;will-change:transform;}',
    '#hwIntro .hi-bat svg{width:100%;height:100%;animation:hiFlap .18s ease-in-out infinite alternate;transform-origin:50% 60%;}',
    '@keyframes hiFlap{from{transform:scaleY(1);}to{transform:scaleY(.4);}}',
    '#hwIntro .hi-fog{position:absolute;left:-20%;right:-20%;bottom:-40px;height:220px;opacity:0;transition:opacity 1.4s ease;pointer-events:none;',
    '  background:radial-gradient(40% 60% at 20% 70%,rgba(200,190,255,.22),transparent 70%),radial-gradient(35% 55% at 60% 80%,rgba(200,190,255,.18),transparent 70%),radial-gradient(30% 50% at 90% 70%,rgba(200,190,255,.2),transparent 70%);animation:hiFog 14s ease-in-out infinite alternate;}',
    '#hwIntro.card .hi-fog{opacity:1;} @keyframes hiFog{from{transform:translateX(-6%);}to{transform:translateX(6%);}}',
    '#hwIntro .hi-ghost{position:absolute;width:70px;height:92px;opacity:0;will-change:transform;}',
    '#hwIntro .hi-card{position:absolute;left:50%;top:50%;width:min(520px,calc(100vw - 32px));transform:translate(-50%,-38%) scale(.92);opacity:0;padding:78px 30px 26px;border-radius:26px;text-align:center;color:#F5EEFF;',
    '  background:linear-gradient(180deg,rgba(43,22,70,.96),rgba(22,12,38,.97));border:1px solid rgba(255,160,70,.35);box-shadow:0 40px 100px -20px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04) inset,0 0 80px -20px rgba(255,138,30,.35);transition:transform .6s cubic-bezier(.2,1.2,.3,1),opacity .4s ease;}',
    '#hwIntro.card .hi-card{opacity:1;transform:translate(-50%,-44%) scale(1);}',
    '#hwIntro .hi-card h2{margin:0 0 10px;font:800 26px/1.2 Sora,Inter,sans-serif;letter-spacing:-.02em;background:linear-gradient(90deg,#FFB347,#FF7A1A 40%,#C68BFF);-webkit-background-clip:text;background-clip:text;color:transparent;}',
    '#hwIntro .hi-card p{margin:0 auto 8px;max-width:420px;color:#D9CCF0;font-size:15px;line-height:1.6;} #hwIntro .hi-card p b{color:#FFC27A;}',
    '#hwIntro .hi-list{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:14px 0 20px;} #hwIntro .hi-list span{padding:6px 11px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);font-size:13px;color:#EDE4FF;}',
    '#hwIntro .hi-btns{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;}',
    '#hwIntro .hi-btn{height:46px;padding:0 20px;border-radius:14px;font:700 15px Inter,sans-serif;cursor:pointer;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#EDE4FF;transition:transform .15s,background .15s;}',
    '#hwIntro .hi-btn:hover{transform:translateY(-1px);background:rgba(255,255,255,.12);}',
    '#hwIntro .hi-btn.go{border:none;color:#2A1200;background:linear-gradient(135deg,#FFC14D,#FF7A1A);box-shadow:0 12px 30px -10px rgba(255,122,26,.7);}',
    '#hwIntro .hi-btn.go:hover{background:linear-gradient(135deg,#FFD06E,#FF8A33);}',
    '#hwIntro .hi-mute{position:absolute;right:14px;top:14px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#EDE4FF;font-size:16px;cursor:pointer;}',
    '#hwIntro .hi-small{margin-top:14px;font-size:12.5px;color:#A898C8;}',
    '#hwIntro.out{transition:opacity .45s ease;opacity:0;}',
    '#hwIntro .hi-bolt{position:absolute;inset:0;pointer-events:none;opacity:0;will-change:opacity;}',
    '#hwIntro .hi-bolt svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}',
    '#hwIntro .hi-sky{position:absolute;inset:0;pointer-events:none;opacity:0;will-change:opacity;}',
    '#hwIntro .hi-ring{position:absolute;width:640px;height:640px;margin:-320px 0 0 -320px;border-radius:50%;opacity:0;pointer-events:none;will-change:transform,opacity;',
    '  background:radial-gradient(circle,transparent 56%,rgba(255,190,90,.95) 63%,rgba(255,120,20,.55) 68%,transparent 75%);}',
    '.pts-host.pt-hw .pts-logo.hw-pop::after{animation:hwPop .6s cubic-bezier(.3,1.8,.5,1);} @keyframes hwPop{0%{transform:scale(.3);}60%{transform:scale(1.7) rotate(-12deg);}100%{transform:none;}}',
    '@media (max-width:560px){#hwIntro .hi-pumpkin{width:200px;margin-left:-100px;} #hwIntro .hi-card{padding-top:70px;} #hwIntro .hi-moon{width:80px;height:80px;}}'
  ].join('\n');

  function play() {
    if (document.getElementById('hwIntro')) return;
    introRunning = true; document.documentElement.classList.remove('pt-hw-pk');      // the logo waits for the big pumpkin
    try { localStorage.setItem(seenKey(), '1'); } catch (e) {}
    if (!document.getElementById('hwIntroCss')) { var st = document.createElement('style'); st.id = 'hwIntroCss'; st.textContent = CSS; document.head.appendChild(st); }
    var ov = document.createElement('div'); ov.id = 'hwIntro'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'hiT');
    ov.innerHTML = '<div class="hi-night"></div><div class="hi-stars"></div><div class="hi-moon"></div><div class="hi-fog"></div><div class="hi-flash"></div>' +
      '<div class="hi-card"><button type="button" class="hi-mute" aria-pressed="true" title="Music on/off" aria-label="Music on or off">🔊</button>' +
      '<h2 id="hiT">🎃 Halloween has arrived at PalaTrack!</h2>' +
      '<p>For the spooky season, PalaTrack is dressed up: you’ll spot little surprises all over the app.</p>' +
      '<div class="hi-list"><span>🕸️ Cobwebs</span><span>🕷️ A spider (click it!)</span><span>🦇 Bats now and then</span><span>👻 A friendly ghost</span></div>' +
      '<p>Not your thing? Turn it off anytime in <b>Settings → Halloween decorations</b>. It switches itself off after Halloween.</p>' +
      '<div class="hi-btns" style="margin-top:18px"><button type="button" class="hi-btn" data-hi="off">Turn it off</button><button type="button" class="hi-btn go" data-hi="keep">Keep the spooky vibes 🎃</button></div>' +
      '<div class="hi-small">Happy Halloween from the PalaTrack team 🦇</div></div>' +
      '<div class="hi-pumpkin">' + PUMPKIN + '</div>';
    document.body.appendChild(ov);
    var pumpkin = ov.querySelector('.hi-pumpkin'), card = ov.querySelector('.hi-card'), flash = ov.querySelector('.hi-flash');
    var a = audio(), t0 = a ? a.currentTime + 0.05 : 0;
    if (a) loadLaugh();

    function showCard() {
      ov.classList.add('card');
      // the pumpkin settles on top of the card
      // the card ends at translate(-50%,-44%): its top edge is 44% of its height above the middle of the screen
      var targetY = -0.44 * card.offsetHeight - 6, s = innerWidth < 560 ? 0.62 : 0.58;
      pumpkin.animate([{transform: pumpkin.style.transform || 'translate3d(0,0,0) scale(1)'}, {transform: 'translate3d(0,' + targetY + 'px,0) scale(' + s + ')'}], {duration: 700, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards'});
      ov.querySelector('[data-hi="keep"]').focus();
      if (!reduced) { circleBats(); floatGhosts(); boltTimer = setTimeout(strike, 1400); }
      if (a) startMusic();
    }
    if (reduced) { ov.classList.add('on'); pumpkin.style.display = 'none'; card.style.paddingTop = '30px'; showCard(); }
    else {
      requestAnimationFrame(function () { ov.classList.add('on'); });
      if (a) { thunder(t0 + 0.15); organ(t0 + 0.55, [146.8, 174.6, 220, 293.7], 2.4, 0.5); ghostGlide(t0 + 1.0); }
      flash.animate([{opacity: 0}, {opacity: 0.85, offset: 0.08}, {opacity: 0.1, offset: 0.2}, {opacity: 0.6, offset: 0.3}, {opacity: 0}], {duration: 900, delay: 150, easing: 'ease-out'});
      pumpkin.animate([{transform: 'translate3d(0,70vh,0) scale(.5) rotate(-10deg)'}, {transform: 'translate3d(0,-20px,0) scale(1.08) rotate(3deg)', offset: 0.7}, {transform: 'translate3d(0,0,0) scale(1) rotate(0)'}],
        {duration: 1000, delay: 350, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'both'});
      setTimeout(burstBats, 1150);
      setTimeout(showCard, 2300);
    }

    function burstBats() {
      for (var i = 0; i < 22; i++) (function (i) {
        var b = document.createElement('div'); b.className = 'hi-bat'; b.innerHTML = BAT; ov.appendChild(b);
        var ang = (i / 22) * Math.PI * 2 + Math.random() * 0.3, dist = Math.max(innerWidth, innerHeight) * (0.6 + Math.random() * 0.4), s = 0.6 + Math.random() * 0.9, f = Math.cos(ang) < 0 ? -1 : 1;
        b.animate([{transform: 'translate3d(0,0,0) scale(' + (0.2 * f) + ',0.2)', opacity: 0}, {transform: 'translate3d(' + Math.cos(ang) * dist * 0.25 + 'px,' + Math.sin(ang) * dist * 0.25 + 'px,0) scale(' + (s * f) + ',' + s + ')', opacity: 1, offset: 0.2},
          {transform: 'translate3d(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist - 60) + 'px,0) scale(' + (s * 1.3 * f) + ',' + (s * 1.3) + ')', opacity: 1}],
          {duration: 1500 + Math.random() * 700, delay: i * 25, easing: 'cubic-bezier(.3,.6,.4,1)'}).onfinish = function () { b.remove(); };
      })(i);
    }
    function circleBats() {
      for (var i = 0; i < 6; i++) (function (i) {
        var b = document.createElement('div'); b.className = 'hi-bat'; b.innerHTML = BAT; b.style.opacity = '.85'; ov.insertBefore(b, card);
        var rx = Math.min(innerWidth * 0.42, 560), ry = Math.min(innerHeight * 0.36, 300), dur = 9000 + i * 1300, ph = i / 6, frames = [];
        for (var k = 0; k <= 24; k++) { var t = (k / 24 + ph) * Math.PI * 2, f = Math.sin(t) > 0 ? -1 : 1, s = 0.55 + 0.25 * Math.sin(t * 2);
          frames.push({transform: 'translate3d(' + Math.cos(t) * rx + 'px,' + Math.sin(t) * ry + 'px,0) scale(' + (s * f) + ',' + s + ')'}); }
        b.animate(frames, {duration: dur, iterations: Infinity});
      })(i);
    }
    function floatGhosts() {
      [0, 1, 2].forEach(function (i) {
        var g = document.createElement('div'); g.className = 'hi-ghost'; g.innerHTML = GHOST; ov.insertBefore(g, card);
        var y = innerHeight * (0.2 + i * 0.25), dir = i % 2 ? -1 : 1, x0 = dir > 0 ? -100 : innerWidth + 40, x1 = dir > 0 ? innerWidth + 40 : -100;
        g.animate([{transform: 'translate3d(' + x0 + 'px,' + y + 'px,0) scaleX(' + dir + ')', opacity: 0}, {opacity: 0.75, offset: 0.1},
          {transform: 'translate3d(' + (x0 + (x1 - x0) * 0.5) + 'px,' + (y - 40) + 'px,0) scaleX(' + dir + ')', opacity: 0.75, offset: 0.5}, {opacity: 0.75, offset: 0.9},
          {transform: 'translate3d(' + x1 + 'px,' + y + 'px,0) scaleX(' + dir + ')', opacity: 0}], {duration: 14000 + i * 3000, delay: i * 2500, iterations: Infinity, easing: 'ease-in-out'});
      });
    }
    // "Keep the spooky vibes": the card shrinks into the pumpkin, a bass drop, the screen shakes, a shockwave,
    // bats burst out, the night opens up from the pumpkin and the pumpkin flies into the logo
    function finale() {
      if (ov.classList.contains('out') || ov.dataset.fin) return;
      ov.dataset.fin = '1'; document.removeEventListener('keydown', key, true); clearTimeout(boltTimer);
      // clear what's still moving under the pop-up, so the finale has the stage to itself
      ov.querySelectorAll('.hi-ghost, .hi-bat').forEach(function (el) { el.getAnimations().forEach(function (x) { x.cancel(); }); el.remove(); });
      var fog = ov.querySelector('.hi-fog'); if (fog) fog.style.animation = 'none';
      if (musicBus && ac) musicBus.gain.setTargetAtTime(0, ac.currentTime, 0.08);
      // when the laugh will end (it starts 0.3 s after the drop and slows a little as it flies away)
      var laughEnd = function (d) { return d + 0.3 + (laughBuf ? laughBuf.duration : LAUGH_LEN) / 0.93; };
      var drop = a ? bassDrop(ac.currentTime + 0.02, laughEnd(ac.currentTime + 0.52)) : 0, dropIn = 500;
      // where the pumpkin is now
      var pr = pumpkin.getBoundingClientRect(), pc = {x: pr.left + pr.width / 2, y: pr.top + pr.height / 2};
      var m = new DOMMatrix(getComputedStyle(pumpkin).transform), base = {x: pc.x - m.e, y: pc.y - m.f}, sc = m.a || 1;
      pumpkin.getAnimations().forEach(function (x) { x.cancel(); }); pumpkin.style.transform = 'translate3d(' + m.e + 'px,' + m.f + 'px,0) scale(' + sc + ')';
      // 1. the card shrinks into the pumpkin; the pumpkin swells
      card.style.transition = 'none';
      card.animate([{transform: 'translate(-50%,-44%) scale(1)', opacity: 1}, {transform: 'translate(-50%,-44%) scale(1.04)', opacity: 1, offset: 0.25},
        {transform: 'translate(-50%,' + (-44 - 20) + '%) scale(.05)', opacity: 0}], {duration: dropIn, easing: 'cubic-bezier(.6,0,.8,.4)', fill: 'forwards'});
      pumpkin.animate([{transform: 'translate3d(' + m.e + 'px,' + m.f + 'px,0) scale(' + sc + ')'}, {transform: 'translate3d(' + m.e + 'px,' + (m.f + 30) + 'px,0) scale(' + (sc * 1.5) + ') rotate(-6deg)'}],
        {duration: dropIn, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards'});
      ov.querySelector('.hi-glow').style.animation = 'none';
      setTimeout(function () {
        // 2. THE DROP: shake, shockwave, bats
        ov.animate([{transform: 'translate(0,0)'}, {transform: 'translate(-14px,9px)'}, {transform: 'translate(12px,-10px)'}, {transform: 'translate(-9px,-6px)'},
          {transform: 'translate(8px,7px)'}, {transform: 'translate(-4px,3px)'}, {transform: 'translate(0,0)'}], {duration: 460, easing: 'linear'});
        var c = pumpkin.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
        var ring = document.createElement('div'); ring.className = 'hi-ring'; ring.style.left = cx + 'px'; ring.style.top = cy + 'px'; ov.appendChild(ring);
        ring.animate([{transform: 'scale(.08)', opacity: 1}, {transform: 'scale(3.2)', opacity: 0}], {duration: 850, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards'});
        for (var i = 0; i < 16; i++) (function (i) {
          var b = document.createElement('div'); b.className = 'hi-bat'; b.innerHTML = BAT; b.style.left = cx + 'px'; b.style.top = cy + 'px'; ov.appendChild(b);
          var ang = (i / 16) * Math.PI * 2 + Math.random() * 0.3, dist = Math.max(innerWidth, innerHeight) * (0.7 + Math.random() * 0.4), s = 0.7 + Math.random() * 0.8, f = Math.cos(ang) < 0 ? -1 : 1;
          b.animate([{transform: 'translate3d(0,0,0) scale(' + (0.3 * f) + ',0.3)', opacity: 1},
            {transform: 'translate3d(' + Math.cos(ang) * dist + 'px,' + Math.sin(ang) * dist + 'px,0) scale(' + (s * 1.4 * f) + ',' + (s * 1.4) + ')', opacity: 1}],
            {duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards'});
        })(i);
        // 3. the night opens up from the pumpkin, and the pumpkin flies into the logo
        var night = ov.querySelector('.hi-night');
        ['.hi-stars', '.hi-moon', '.hi-fog'].forEach(function (q) { var el = ov.querySelector(q); if (el) el.animate([{opacity: 1}, {opacity: 0}], {duration: 500, fill: 'forwards'}); });
        night.animate([{opacity: 0.97}, {opacity: 0}], {duration: 750, delay: 100, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards'});
        var logo = document.querySelector('.pts-host .pts-logo'), lr = logo ? logo.getBoundingClientRect() : null;
        var tx = lr ? lr.right - 4 - base.x : innerWidth / 2 - base.x, ty = lr ? lr.bottom - 4 - base.y : -innerHeight - base.y;
        pumpkin.getAnimations().forEach(function (x) { x.commitStyles && x.commitStyles(); x.cancel(); });
        var LAUGH_AT = 0.3;   // just after the boom, so you hear both
        if (a) laugh(ac.currentTime + LAUGH_AT);
        // the pumpkin hovers and cackles first, then spins off into the logo
        var FLY = 2300;      // hover and laugh first, then fly into the logo
        pumpkin.animate([{transform: pumpkin.style.transform},
          {transform: 'translate3d(' + m.e + 'px,' + (m.f - 70) + 'px,0) scale(' + (sc * 1.25) + ') rotate(-8deg)', offset: 0.18},
          {transform: 'translate3d(' + m.e + 'px,' + (m.f - 85) + 'px,0) scale(' + (sc * 1.32) + ') rotate(7deg)', offset: 0.45},
          {transform: 'translate3d(' + m.e + 'px,' + (m.f - 80) + 'px,0) scale(' + (sc * 1.3) + ') rotate(-5deg)', offset: 0.7},
          {transform: 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(.08) rotate(720deg)'}], {duration: FLY, delay: 60, easing: 'ease-in-out', fill: 'forwards'});
        // shaking with laughter: a bounce on every HA, eyes flaring
        var svgEl = pumpkin.querySelector('svg'), beats = LAUGH_BEATS, TOTAL = LAUGH_AT + 2.0;
        svgEl.animate(beats.reduce(function (fr, b) { var o = (b + LAUGH_AT) / TOTAL; fr.push({transform: 'translateY(0) scale(1,1)', offset: Math.max(0, o - 0.02)}, {transform: 'translateY(-7px) scale(1.06,.9)', offset: Math.min(1, o + 0.02)}); return fr; },
          [{transform: 'translateY(0) scale(1,1)', offset: 0}]).concat([{transform: 'translateY(0) scale(1,1)', offset: 1}]), {duration: TOTAL * 1000, easing: 'ease-out'});
        var glow = ov.querySelector('.hi-glow'); if (glow) glow.animate([{opacity: 1}, {opacity: 0.55}, {opacity: 1}], {duration: 160, delay: LAUGH_AT * 1000, iterations: 11});
        setTimeout(function () { landPumpkin(); if (logo) { logo.classList.remove('hw-pop'); void logo.offsetWidth; logo.classList.add('hw-pop'); } }, FLY + 80);   // it lands: the little pumpkin appears
        setTimeout(function () { stopMusic(); ov.remove(); }, FLY + 250);   // the laugh fades out by itself
      }, dropIn);
    }
    // ---- lightning streaks in the background, now and then, with a distant rumble ----
    var boltTimer = null;
    function boltPath(x0, y1) {
      var x = x0, y = -10, pts = [[x, y]], step = (y1 + 10) / 14;
      for (var i = 0; i < 14; i++) { y += step * (0.7 + Math.random() * 0.6); x += (Math.random() - 0.5) * 70; pts.push([Math.round(x), Math.round(y)]); }
      return pts;
    }
    function strike() {
      if (!document.body.contains(ov) || ov.dataset.fin || ov.classList.contains('out')) return;
      var W = innerWidth, H = innerHeight, left = Math.random() < 0.5;
      var x0 = left ? W * (0.04 + Math.random() * 0.22) : W * (0.74 + Math.random() * 0.22), y1 = H * (0.55 + Math.random() * 0.3);
      var main = boltPath(x0, y1), d = 'M' + main.map(function (p) { return p.join(' '); }).join(' L');
      // sometimes a side branch
      if (Math.random() < 0.7) { var from = main[5 + Math.floor(Math.random() * 4)], bx = from[0], by = from[1], dir = left ? 1 : -1, br = [[bx, by]];
        for (var k = 0; k < 6; k++) { bx += dir * (14 + Math.random() * 26); by += 22 + Math.random() * 30; br.push([Math.round(bx), Math.round(by)]); }
        d += ' M' + br.map(function (p) { return p.join(' '); }).join(' L'); }
      var bolt = document.createElement('div'); bolt.className = 'hi-bolt';
      bolt.innerHTML = '<svg aria-hidden="true"><path d="' + d + '" fill="none" stroke="rgba(190,160,255,.35)" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="' + d + '" fill="none" stroke="rgba(225,210,255,.75)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="' + d + '" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
      var sky = document.createElement('div'); sky.className = 'hi-sky';
      sky.style.background = 'radial-gradient(60% 70% at ' + Math.round(x0 / W * 100) + '% 20%, rgba(200,180,255,.55), transparent 70%)';
      ov.insertBefore(sky, card); ov.insertBefore(bolt, card);
      var flicker = [{opacity: 0}, {opacity: 1, offset: 0.06}, {opacity: 0.25, offset: 0.2}, {opacity: 1, offset: 0.3}, {opacity: 0.6, offset: 0.5}, {opacity: 0}];
      bolt.animate(flicker, {duration: 650, easing: 'ease-out'}).onfinish = function () { bolt.remove(); };
      sky.animate([{opacity: 0}, {opacity: 0.8, offset: 0.06}, {opacity: 0.15, offset: 0.2}, {opacity: 0.6, offset: 0.3}, {opacity: 0}], {duration: 700, easing: 'ease-out'}).onfinish = function () { sky.remove(); };
      if (ac && musicBus) thunder(ac.currentTime + 0.35 + Math.random() * 0.5, 0.22, musicBus);   // the rumble arrives a moment later (it's far away)
      boltTimer = setTimeout(strike, 4000 + Math.random() * 5000);
    }
    function close(off) {
      if (ov.classList.contains('out') || ov.dataset.fin) return;
      if (!off && !reduced) { finale(); return; }
      clearTimeout(boltTimer); stopMusic(); ov.classList.add('out');
      if (!off) landPumpkin(); else introRunning = false;     // no flight (animations off): it simply appears; turned off: no Halloween
      if (off && window.ptHalloween) window.ptHalloween.set(false);
      setTimeout(function () { ov.remove(); }, 480);
      document.removeEventListener('keydown', key, true);
    }
    function key(e) { if (e.key === 'Escape') { e.preventDefault(); close(false); } }
    document.addEventListener('keydown', key, true);
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-hi]');
      if (b) { close(b.dataset.hi === 'off'); return; }
      if (e.target.closest('.hi-mute')) {
        musicOn = !musicOn; var m = e.target.closest('.hi-mute'); m.textContent = musicOn ? '🔊' : '🔇'; m.setAttribute('aria-pressed', String(musicOn));
        if (musicBus && ac) musicBus.gain.setTargetAtTime(musicOn ? 1 : 0, ac.currentTime, 0.1);
      }
    });
  }
  window.addEventListener('pt-welcome-dismissed', function () { if (inSeason() && decoOn() && !seen()) play(); });
  // The little pumpkin on the logo: only after this account has seen the intro, so that the first time
  // the big pumpkin flies to an empty logo and the little one appears when it lands (then it stays).
  var introRunning = false;
  function updateLogoPumpkin() { if (!introRunning) document.documentElement.classList.toggle('pt-hw-pk', seen()); }
  function landPumpkin() { introRunning = false; document.documentElement.classList.add('pt-hw-pk'); }
  updateLogoPumpkin();
  // who is logged in is only known a moment after the page loads: check again then
  (function waitForAuth(tries) {
    try { if (window.firebase && firebase.auth) { firebase.auth().onAuthStateChanged(function () { updateLogoPumpkin(); }); return; } } catch (e) {}
    if (tries < 40) setTimeout(function () { waitForAuth(tries + 1); }, 250);
  })(0);
  // render the bass drop into another audio context (used to make a preview file)
  function renderLaugh(ctx, buf) { var pa = ac, pb = laughBuf; ac = ctx; laughBuf = buf; try { laugh(0.05); } finally { ac = pa; laughBuf = pb; } }
  function renderFinale(ctx, dest, buf) {
    var pa = ac, pm = master, pb = laughBuf; ac = ctx; master = dest; laughBuf = buf;
    try { var d = bassDrop(0.05, 0.55 + 0.3 + buf.duration / 0.93); laugh(d + 0.3); } finally { ac = pa; master = pm; laughBuf = pb; }
  }
  function renderDrop(ctx, dest) { var pa = ac, pm = master; ac = ctx; master = dest; try { bassDrop(0.05); } finally { ac = pa; master = pm; } }
  window.ptHalloweenIntro = {play: play, reset: function () { try { localStorage.removeItem(seenKey()); } catch (e) {} return 'The Halloween surprise will show again for this account.'; }, _song: {round: songRound, bus: songBus, loop: LOOP, drop: renderDrop, laugh: renderLaugh, finale: renderFinale}};      // to show it again; _song renders the music to a file
})();

/* ---------------------------------------------------------------------------
   The tour of the side panel (for new accounts, and again via Help → Take the tour).
   The screen darkens and one part of the side panel at a time is lit up with a rounded
   rectangle; a bubble next to it explains it. The spotlight glides from item to item with a
   soft swoosh and a bell that climbs a little higher every step; at the end a fanfare and
   confetti. Keys: → / Enter next, ← back, Esc skip. Sound follows the 🔊 button (ptThemeSound).
   window.ptSidebarTour.start({onFinish}) starts it; available() says whether the side panel is
   on screen (on small screens it's folded away).
   --------------------------------------------------------------------------- */
(function () {
  var STEPS = [
    {center: true, emoji: '👋', title: 'Welcome to PalaTrack{name}!', text: 'Let me show you around. In about a minute you’ll know what everything in the side panel on the left does, and what it’s for.', next: 'Show me around'},
    {sel: ['#seqSidebarUser'], title: 'This is you', text: 'Your photo, name and role, the way your team sees you everywhere in PalaTrack. You can change them anytime in <b>Settings</b>.'},
    {label: '', title: 'Your daily work', items: [
      {sel: '#navHome', name: 'Home', text: 'Your start screen every day: today’s tasks, the leads that need a follow-up, and what your team has been doing.'},
      {sel: '#navDashboard', name: 'Boards', text: 'Your sales pipeline. Every lead is a card you move from first contact to closed deal, with notes, files and tasks. Your team sees every change live.'},
      {sel: '#navTasks', name: 'Tasks', text: 'Your to-do list: calls, follow-ups and reminders, linked to a lead if you like. Only you see your own tasks; teammates can give you one.'},
      {sel: '#navCalendar', name: 'Calendar', text: 'Your tasks and meetings by day, week or month, so you can plan ahead. Connect Google Calendar to see everything in one place.'}]},
    {label: 'Email', title: 'Email', items: [
      {sel: '#navSequences', name: 'Sequences', text: 'Automatic follow-up emails. Write the steps once, and PalaTrack sends them on schedule until the lead replies.'},
      {sel: '#navCampaigns', name: 'Email campaigns', text: 'One email to many leads at once, personalised with their name and company. See who opens and who replies.'},
      {sel: '#navScheduled', name: 'Scheduled', text: 'Every email that’s waiting to go out. Change it, move it to another time, or cancel it.'}]},
    {label: 'LinkedIn', title: 'LinkedIn', items: [
      {sel: '#navLinkedinSeq', name: 'LinkedIn Sequences', text: 'Plan your LinkedIn outreach step by step: the connection request, then your messages. PalaTrack tells you when each step is due.'},
      {sel: '#navLinkedinPost', name: 'LinkedIn Post', text: 'Write your posts with hooks, AI help and a live preview, then schedule them or publish them straight to LinkedIn.'}]},
    {label: 'Clients', title: 'Clients', items: [
      {sel: '#navClients', name: 'Client processes', text: 'A personal onboarding page for every new client: a welcome video, documents, forms, uploads and a call to book. They tick off the steps, and you follow their progress live.'},
      {sel: '#navOfferDoc', name: 'Offer Doc', text: 'Upload your offer document template, answer the AI’s questions, and get your own offer document that sells for you after the sales call.'}]},
    {label: 'Workspace', title: 'Your workspace', items: [
      {sel: '#navChat', name: 'Team chat', text: 'Message your teammates directly. Share photos and files, react to messages, and see who’s online.'},
      {sel: '#navLibrary', name: 'Library', text: 'Your team’s knowledge in one place: DM scripts, icebreakers, answers to objections and templates, ready to copy into your messages.'},
      {sel: '#navWhiteboard', name: 'Whiteboard', text: 'An endless canvas to think out loud: draw, write, make shapes, arrows and sticky notes, add images, and plan together with your team, live.'},
      {sel: '#navTeam', name: 'Team', text: 'Invite colleagues, decide what they’re allowed to do, and see everyone in your workspace.'}]},
    {sel: ['.pts-theme'], title: 'Light, dark and sound', items: [
      {sel: '#themeLightBtn', name: 'Light and Dark', text: 'Choose the look that’s easiest on your eyes. PalaTrack remembers it.'},
      {sel: '#ptSoundBtn', name: 'Sound', text: 'Turns the little sounds on or off, like the ones you’re hearing now.'}]},
    {title: 'Settings and help', items: [
      {sel: '#navSettings', name: 'Settings', text: 'Your profile, photo, password and notifications, and the connection with your email and calendar.'},
      {sel: '#navBilling', name: 'Billing & plans', text: 'Your subscription: see your plan, upgrade, or change how you pay.'},
      {sel: '#helpMenuToggle', name: 'Help', text: 'The help center, a place to send us feedback, and this tour again whenever you want it.'}]},
    {center: true, emoji: '🎉', title: 'You’re all set!', text: 'That’s everything. A good first step: open <b>Boards</b> and add your first lead.', next: 'Let’s go', last: true}
  ];
  var CSS = [
    '#ptTour{position:fixed;inset:0;z-index:9000;font-family:Inter,system-ui,sans-serif;}',
    '#ptTour .tt-shade{position:absolute;inset:0;background:rgba(10,14,30,.62);opacity:0;transition:opacity .35s ease;}',
    '#ptTour.center .tt-shade{opacity:1;}',
    '#ptTour .tt-hole{position:absolute;border-radius:14px;box-shadow:0 0 0 200vmax rgba(8,12,20,.58),0 0 0 4px #FFFFFF,0 0 0 7px rgba(169,148,247,.95),0 0 30px 8px rgba(124,104,255,.35);',
    '  transition:top .45s cubic-bezier(.4,0,.2,1),left .45s cubic-bezier(.4,0,.2,1),width .45s cubic-bezier(.4,0,.2,1),height .45s cubic-bezier(.4,0,.2,1),opacity .3s ease;pointer-events:none;}',
    '#ptTour .tt-hole::after{content:"";position:absolute;inset:-10px;border-radius:20px;border:2px solid rgba(169,148,247,.7);animation:ttPulse 1.8s ease-out infinite;}',
    '@keyframes ttPulse{0%{opacity:.9;transform:scale(1);}100%{opacity:0;transform:scale(1.06);}}',
    '#ptTour.center .tt-hole{opacity:0;}',
    '#ptTour .tt-bubble{position:absolute;width:340px;max-width:calc(100vw - 32px);background:var(--panel,#fff);color:var(--ink,#16202C);border-radius:18px;padding:18px 20px 16px;',
    '  box-shadow:0 30px 70px -20px rgba(0,0,0,.55);transition:top .45s cubic-bezier(.4,0,.2,1),left .45s cubic-bezier(.4,0,.2,1),opacity .25s ease;}',
    '#ptTour .tt-bubble.wide{width:400px;}',
    '#ptTour .tt-list{display:flex;flex-direction:column;gap:11px;margin-top:4px;}',
    '#ptTour .tt-item{display:grid;grid-template-columns:22px 1fr;column-gap:9px;align-items:start;}',
    '#ptTour .tt-ic{width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:#5B4BE6;margin-top:1px;} #ptTour .tt-ic svg{width:18px;height:18px;}',
    'html[data-theme="dark"] #ptTour .tt-ic{color:#B9AEFF;}',
    '#ptTour .tt-item b{display:block;font-size:14.5px;color:var(--ink,#16202C);margin-bottom:2px;} #ptTour .tt-item span{display:block;font-size:13.5px;line-height:1.55;color:var(--slate,#5B6B7F);}',
    '#ptTour .tt-bubble::before{content:"";position:absolute;left:-8px;top:var(--ay,28px);width:16px;height:16px;background:inherit;transform:rotate(45deg);border-radius:3px;}',
    '#ptTour.center .tt-bubble{width:420px;text-align:center;padding:30px 28px 22px;} #ptTour.center .tt-bubble::before{display:none;}',
    '#ptTour .tt-emoji{font-size:40px;line-height:1;margin-bottom:10px;display:block;}',
    '#ptTour .tt-count{display:inline-block;font-size:12px;font-weight:800;color:#4B3FCF;background:rgba(91,75,230,.1);border-radius:7px;padding:3px 9px;margin-bottom:8px;}',
    'html[data-theme="dark"] #ptTour .tt-count{color:#B9AEFF;background:rgba(160,145,255,.16);}',
    '#ptTour h3{margin:0 0 8px;font:800 18px/1.3 Sora,Inter,sans-serif;letter-spacing:-.01em;} #ptTour.center h3{font-size:22px;}',
    '#ptTour p{margin:0;font-size:14px;line-height:1.6;color:var(--slate,#5B6B7F);} #ptTour p b{color:var(--ink,#16202C);font-weight:700;}',
    '#ptTour .tt-btns{display:flex;align-items:center;gap:8px;margin-top:18px;} #ptTour.center .tt-btns{justify-content:center;}',
    '#ptTour .tt-skip{margin-right:auto;border:none;background:none;color:var(--slate-light,#8A97A8);font-size:13px;font-weight:600;cursor:pointer;padding:6px 2px;}',
    '#ptTour.center .tt-skip{margin-right:0;}',
    '#ptTour .tt-btn{height:38px;padding:0 16px;border-radius:11px;font:700 13.5px Inter,sans-serif;cursor:pointer;border:1px solid var(--border,#D8DEE8);background:var(--panel,#fff);color:var(--ink,#16202C);}',
    '#ptTour .tt-btn.go{border:none;color:#fff;background:linear-gradient(135deg,#3730B3,#6A4EC4);box-shadow:0 8px 20px -10px rgba(55,48,179,.8);}',
    '#ptTour .tt-btn.go:hover{filter:brightness(1.08);}',
    '#ptTour .tt-dots{display:flex;gap:5px;justify-content:center;margin-top:16px;} #ptTour .tt-dots i{width:6px;height:6px;border-radius:50%;background:var(--border,#D8DEE8);transition:all .3s;} #ptTour .tt-dots i.on{width:18px;border-radius:3px;background:#5B4BE6;}',
    '.tt-confetti{position:fixed;inset:0;z-index:9100;pointer-events:none;overflow:hidden;}',
    '@media (prefers-reduced-motion: reduce){#ptTour *,#ptTour{transition:none !important;animation:none !important;}}'
  ].join('\n');

  // ---------- sound (follows the 🔊 button next to Light/Dark) ----------
  var ac = null;
  function soundOn() { try { return localStorage.getItem('ptThemeSound') !== 'off'; } catch (e) { return true; } }
  function audio() { if (!soundOn()) return null; try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } }
  function bell(f, t, vol, len) {
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + len); g.connect(ac.destination);
    [[1, 1, 'sine'], [2.76, 0.28, 'sine'], [5.4, 0.08, 'sine'], [1, 0.4, 'triangle']].forEach(function (p) { var o = ac.createOscillator(), h = ac.createGain(); o.type = p[2]; o.frequency.value = f * p[0]; h.gain.value = p[1]; o.connect(h); h.connect(g); o.start(t); o.stop(t + len + 0.05); });
  }
  function swoosh(t) {
    var len = ac.sampleRate * 0.3, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var n = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(); n.buffer = b; bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(2200, t + 0.25);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    n.connect(bp); bp.connect(g); g.connect(ac.destination); n.start(t); n.stop(t + 0.32);
  }
  var SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1567.98, 1760, 2093, 2349.3, 2637, 3136];   // a pentatonic climb
  function stepSound(i) { var a = audio(); if (!a) return; var t = a.currentTime + 0.02; swoosh(t); bell(SCALE[Math.min(i, SCALE.length - 1)] / 2, t + 0.12, 0.09, 1.1); }
  function startSound() { var a = audio(); if (!a) return; var t = a.currentTime + 0.02; [261.63, 329.63, 392, 523.25].forEach(function (f, k) { bell(f, t + k * 0.09, 0.07, 1.6); }); }
  function fanfare() {
    var a = audio(); if (!a) return; var t = a.currentTime + 0.02;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, k) { bell(f, t + k * 0.08, 0.11, 1.4); });
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f) { bell(f, t + 0.5, 0.06, 2.2); });     // the chord ringing out
  }
  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var layer = document.createElement('div'); layer.className = 'tt-confetti'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer);
    var colors = ['#1B59A5', '#7A4FB5', '#FF9D00', '#1F5C4F', '#C0392B', '#3730B3', '#F5B700', '#2EA36F'], W = innerWidth, H = innerHeight;
    for (var i = 0; i < 130; i++) {
      var el = document.createElement('i'), w = 6 + Math.random() * 6, h = Math.random() < 0.5 ? 12 + Math.random() * 8 : w, x = Math.random() * W, drift = (Math.random() - 0.5) * 160, rot = (Math.random() - 0.5) * 900;
      el.style.cssText = 'position:absolute;left:0;top:0;width:' + w + 'px;height:' + h + 'px;background:' + colors[i % colors.length] + ';border-radius:' + (Math.random() < 0.25 ? '50%' : '2px') + ';will-change:transform;';
      layer.appendChild(el);
      el.animate([{transform: 'translate3d(' + x + 'px,-30px,0) rotate(0)'}, {transform: 'translate3d(' + (x + drift) + 'px,' + (H + 40) + 'px,0) rotate(' + rot + 'deg)'}],
        {duration: 2400 + Math.random() * 1400, delay: Math.random() * 500, easing: 'linear', fill: 'forwards'});
    }
    setTimeout(function () { layer.remove(); }, 4600);
  }

  // ---------- the tour ----------
  var root = null, idx = 0, opts = {}, steps = [];
  function host() { return document.querySelector('.pts-host'); }
  function available() { var h = host(); if (!h) return false; var r = h.getBoundingClientRect(); return r.width > 120 && r.right > 0 && getComputedStyle(h).display !== 'none'; }
  function targets(step) { return step.sel || (step.items || []).map(function (it) { return it.sel; }); }
  function rectOf(step) {
    var els = targets(step).map(function (s) { return document.querySelector(s); }).filter(function (e) { return e && e.offsetParent !== null; });
    if (!els.length) return null;
    if (step.label) {                                                  // the section title (EMAIL, LINKEDIN…) belongs to the group
      var lab = [].slice.call(document.querySelectorAll('.pts-host .seq-sidebar-label')).filter(function (l) { return l.textContent.trim().toLowerCase() === step.label.toLowerCase(); })[0];
      if (lab) els.unshift(lab);
    }
    els[0].scrollIntoView({block: 'nearest'}); els[els.length - 1].scrollIntoView({block: 'nearest'});
    var r = els.reduce(function (a, e) { var b = e.getBoundingClientRect(); return a ? {left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom)} : {left: b.left, top: b.top, right: b.right, bottom: b.bottom}; }, null);
    return {left: r.left - 6, top: r.top - 6, width: r.right - r.left + 12, height: r.bottom - r.top + 12};
  }
  function render(withSound) {
    var s = steps[idx], hole = root.querySelector('.tt-hole'), bub = root.querySelector('.tt-bubble');
    var name = ''; try { var n = (document.getElementById('seqSidebarUserName') || {}).textContent || ''; n = n.trim().split(/\s+/)[0]; if (n && n !== '…') name = ', ' + n; } catch (e) {}
    var spot = steps.filter(function (x) { return !x.center; }), pos = spot.indexOf(s);
    var body = s.items ? '<div class="tt-list">' + s.items.map(function (it) {
        var el = document.querySelector(it.sel), ic = el && el.querySelector('svg');
        return '<div class="tt-item"><span class="tt-ic">' + (ic ? ic.outerHTML : '') + '</span><div><b>' + it.name + '</b><span>' + it.text + '</span></div></div>';
      }).join('') + '</div>' : '<p>' + s.text + '</p>';
    bub.classList.toggle('wide', !!s.items);
    bub.innerHTML = (s.center ? '<span class="tt-emoji">' + s.emoji + '</span>' : '<span class="tt-count">' + (pos + 1) + ' of ' + spot.length + '</span>') +
      '<h3 id="ttT">' + s.title.replace('{name}', name.replace(/[<>&]/g, '')) + '</h3>' + body +
      '<div class="tt-btns">' + (s.last ? '' : '<button type="button" class="tt-skip" data-tt="skip">Skip tour</button>') +
      (idx > 0 && !s.last ? '<button type="button" class="tt-btn" data-tt="back">Back</button>' : '') +
      '<button type="button" class="tt-btn go" data-tt="next">' + (s.next || 'Next') + '</button></div>' +
      (s.center ? '' : '<div class="tt-dots">' + spot.map(function (x, k) { return '<i class="' + (k === pos ? 'on' : '') + '"></i>'; }).join('') + '</div>');
    root.classList.toggle('center', !!s.center);
    if (s.center) {
      bub.style.left = Math.round((innerWidth - Math.min(420, innerWidth - 32)) / 2) + 'px';
      bub.style.top = Math.round(innerHeight / 2 - bub.offsetHeight / 2) + 'px';
    } else {
      var r = rectOf(s); if (!r) { go(1); return; }
      hole.style.left = r.left + 'px'; hole.style.top = r.top + 'px'; hole.style.width = r.width + 'px'; hole.style.height = r.height + 'px';
      var bh = bub.offsetHeight, top = Math.max(16, Math.min(innerHeight - bh - 16, r.top + r.height / 2 - 34));
      bub.style.left = Math.round(r.left + r.width + 18) + 'px'; bub.style.top = Math.round(top) + 'px';
      bub.style.setProperty('--ay', Math.max(14, Math.min(bh - 30, r.top + r.height / 2 - top - 8)) + 'px');
    }
    var go1 = bub.querySelector('[data-tt="next"]'); if (go1) go1.focus({preventScroll: true});
    if (withSound) { if (s.last) { fanfare(); confetti(); } else if (idx === 0) startSound(); else stepSound(pos); }
  }
  function go(d) { var n = idx + d; if (n < 0) return; if (n >= steps.length) { end(true); return; } idx = n; render(true); }
  function end(done) {
    if (!root) return;
    document.removeEventListener('keydown', key, true); window.removeEventListener('resize', onResize);
    var r = root; root = null; r.style.transition = 'opacity .3s ease'; r.style.opacity = '0'; setTimeout(function () { r.remove(); }, 320);
    if (opts.onFinish) try { opts.onFinish(!!done); } catch (e) {}
  }
  function key(e) {
    if (!root) return;
    if (e.key === 'Escape') { e.preventDefault(); end(false); }
    else if (e.key === 'ArrowRight' || (e.key === 'Enter' && !(e.target.closest && e.target.closest('[data-tt="skip"],[data-tt="back"]')))) { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  }
  var rt = null; function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (root) render(false); }, 120); }
  function start(o) {
    if (root || !available()) return false;
    opts = o || {}; idx = 0; steps = STEPS.slice();
    if (!document.getElementById('ptTourCss')) { var st = document.createElement('style'); st.id = 'ptTourCss'; st.textContent = CSS; document.head.appendChild(st); }
    root = document.createElement('div'); root.id = 'ptTour'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'ttT');
    root.innerHTML = '<div class="tt-shade"></div><div class="tt-hole"></div><div class="tt-bubble"></div>';
    document.body.appendChild(root);
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-tt]'); if (!b) return; var a = b.dataset.tt; if (a === 'next') go(1); else if (a === 'back') go(-1); else end(false); });
    document.addEventListener('keydown', key, true); window.addEventListener('resize', onResize);
    render(true);
    return true;
  }
  window.ptSidebarTour = {start: start, available: available};
  // "🧭 Take the tour" under Help, on every page
  function addHelpItem() {
    var sub = document.getElementById('helpSubmenu'); if (!sub || sub.querySelector('[data-tour]')) return;
    var a = document.createElement('a'); a.href = '#'; a.setAttribute('data-tour', '1'); a.textContent = '🧭 Take the tour';
    a.addEventListener('click', function (e) { e.preventDefault(); var t = document.getElementById('helpMenuToggle'); if (t && t.getAttribute('aria-expanded') === 'true') t.click(); start({}); });
    sub.insertBefore(a, sub.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addHelpItem); else addHelpItem();
})();

/* ---------------------------------------------------------------------------
   Usernames: everyone has a unique @username, so people outside their organization can find
   and message them. Stored in usernames/{name} (who owns it) and profiles/{uid} (the only thing
   people outside your organization see: name, photo, job title and username).
   Anyone without a username is asked to pick one (once per visit; "Later" is allowed).
   window.ptUsername.open() opens the dialog (e.g. "Change" in Settings); .get() → the profile.
   --------------------------------------------------------------------------- */
(function () {
  var RE = /^[a-z0-9](?:[a-z0-9._]{1,22})[a-z0-9]$/;
  var profile = null, me = null, member = null, ready = [];
  function fb() { return window.firebase && firebase.apps && firebase.apps.length && firebase.auth && firebase.firestore ? firebase : null; }
  function clean(v) { return String(v || '').toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9._]/g, ''); }
  function css() {
    if (document.getElementById('ptUnCss')) return;
    var st = document.createElement('style'); st.id = 'ptUnCss';
    st.textContent = '.ptun-ov{position:fixed;inset:0;z-index:9500;background:rgba(15,22,38,.45);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,sans-serif;}' +
      '.ptun{width:100%;max-width:440px;background:var(--panel,#fff);color:var(--ink,#16202C);border-radius:20px;padding:26px;box-shadow:0 30px 80px -20px rgba(10,14,30,.5);}' +
      '.ptun h3{margin:0 0 6px;font:800 20px Sora,Inter,sans-serif;} .ptun p{margin:0 0 16px;font-size:14px;line-height:1.55;color:var(--slate,#5B6B7F);}' +
      '.ptun-in{display:flex;align-items:center;border:1.5px solid var(--border,#D8DEE8);border-radius:12px;padding:0 12px;background:var(--panel-alt,#F8FBFE);transition:border-color .15s;}' +
      '.ptun-in:focus-within{border-color:#3730B3;} .ptun-in span{font-weight:700;color:var(--slate-light,#8A97A8);font-size:16px;}' +
      '.ptun-in input{flex:1;border:none;background:none;outline:none;padding:12px 6px;font:600 16px Inter,sans-serif;color:var(--ink,#16202C);min-width:0;}' +
      '.ptun-st{min-height:20px;margin:8px 2px 0;font-size:13px;font-weight:600;} .ptun-st.ok{color:#1E9E74;} .ptun-st.bad{color:#C0392B;} .ptun-st.wait{color:var(--slate-light,#8A97A8);}' +
      '.ptun-sug{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0;} .ptun-sug button{border:1px solid var(--border,#D8DEE8);background:var(--panel,#fff);border-radius:999px;padding:5px 11px;font:600 12.5px Inter,sans-serif;color:var(--ink,#16202C);cursor:pointer;}' +
      '.ptun-sug button:hover{border-color:#3730B3;color:#3730B3;}' +
      '.ptun-hint{margin:12px 2px 0;font-size:12px;color:var(--slate-light,#8A97A8);line-height:1.5;}' +
      '.ptun-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;}' +
      '.ptun-btns button{height:40px;padding:0 18px;border-radius:11px;font:700 14px Inter,sans-serif;cursor:pointer;border:1px solid var(--border,#D8DEE8);background:var(--panel,#fff);color:var(--ink,#16202C);}' +
      '.ptun-btns .go{background:#3730B3;border-color:#3730B3;color:#fff;} .ptun-btns .go:disabled{opacity:.45;cursor:default;}';
    document.head.appendChild(st);
  }
  function suggestions() {
    var n = clean(((member && member.name) || '').trim().replace(/\s+/g, '.')).replace(/\.{2,}/g, '.').replace(/^\.|\.$/g, '');
    var first = n.split('.')[0] || 'user', out = [];
    if (n.length >= 3) out.push(n.slice(0, 24));
    if (first.length >= 3 && first !== n) out.push(first);
    out.push((first + '.' + (Math.floor(Math.random() * 90) + 10)).slice(0, 24));
    return out.filter(function (v, i, a) { return RE.test(v) && a.indexOf(v) === i; }).slice(0, 3);
  }
  function open(opts) {
    opts = opts || {};
    var F = fb(); if (!F || !me || document.getElementById('ptUnOv')) return;
    css();
    var ov = document.createElement('div'); ov.className = 'ptun-ov'; ov.id = 'ptUnOv';
    var cur = profile && profile.username;
    ov.innerHTML = '<div class="ptun" role="dialog" aria-modal="true" aria-labelledby="ptUnT"><h3 id="ptUnT">' + (cur ? 'Change your username' : 'Choose your username') + '</h3>' +
      '<p>' + (opts.why || 'Your username lets people outside your organization find you and send you a message request.') + '</p>' +
      '<label class="ptun-in"><span>@</span><input id="ptUnIn" maxlength="24" autocomplete="off" spellcheck="false" placeholder="yourname" value="' + (cur || '') + '"></label>' +
      '<div class="ptun-st" id="ptUnSt" aria-live="polite"></div><div class="ptun-sug" id="ptUnSug"></div>' +
      '<div class="ptun-hint">3–24 characters: lowercase letters, numbers, dots and underscores.</div>' +
      '<div class="ptun-btns"><button type="button" data-x>' + (cur ? 'Cancel' : 'Later') + '</button><button type="button" class="go" id="ptUnGo" disabled>Save</button></div></div>';
    document.body.appendChild(ov);
    var inp = ov.querySelector('#ptUnIn'), st = ov.querySelector('#ptUnSt'), go = ov.querySelector('#ptUnGo'), t = null, okName = null;
    ov.querySelector('#ptUnSug').innerHTML = cur ? '' : suggestions().map(function (s) { return '<button type="button" data-s="' + s + '">@' + s + '</button>'; }).join('');
    function close() { ov.remove(); if (!cur) try { sessionStorage.setItem('ptUnLater', '1'); } catch (e) {} }
    function check() {
      var v = clean(inp.value); if (inp.value !== v) inp.value = v; okName = null; go.disabled = true; clearTimeout(t);
      if (!v) { st.className = 'ptun-st'; st.textContent = ''; return; }
      if (v === cur) { st.className = 'ptun-st ok'; st.textContent = 'That’s your current username.'; return; }
      if (!RE.test(v)) { st.className = 'ptun-st bad'; st.textContent = v.length < 3 ? 'At least 3 characters.' : 'Start and end with a letter or number.'; return; }
      st.className = 'ptun-st wait'; st.textContent = 'Checking…';
      t = setTimeout(function () {
        F.firestore().doc('usernames/' + v).get().then(function (d) {
          if (clean(inp.value) !== v) return;
          if (d.exists && d.data().uid !== me) { st.className = 'ptun-st bad'; st.textContent = '@' + v + ' is taken. Try another one.'; }
          else { st.className = 'ptun-st ok'; st.textContent = '@' + v + ' is available.'; okName = v; go.disabled = false; }
        }).catch(function () { st.className = 'ptun-st bad'; st.textContent = 'Couldn’t check right now. Try again.'; });
      }, 350);
    }
    inp.addEventListener('input', check);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !go.disabled) go.click(); if (e.key === 'Escape') close(); });
    ov.querySelector('#ptUnSug').addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (b) { inp.value = b.dataset.s; check(); inp.focus(); } });
    ov.querySelector('[data-x]').addEventListener('click', close);
    go.addEventListener('click', function () {
      var v = okName; if (!v) return; go.disabled = true; st.className = 'ptun-st wait'; st.textContent = 'Saving…';
      var db = F.firestore(), b = db.batch(), now = F.firestore.FieldValue.serverTimestamp();
      b.set(db.doc('usernames/' + v), {uid: me, createdAt: now});
      b.set(db.doc('profiles/' + me), Object.assign(baseProfile(), {username: v, updatedAt: now}), {merge: true});
      if (cur && cur !== v) b.delete(db.doc('usernames/' + cur));
      b.commit().then(function () {
        profile = Object.assign({}, profile || {}, {username: v}); ov.remove();
        document.dispatchEvent(new CustomEvent('pt-username', {detail: v}));
        if (opts.onDone) opts.onDone(v);
      }).catch(function () { st.className = 'ptun-st bad'; st.textContent = '@' + v + ' was just taken. Try another one.'; });
    });
    setTimeout(function () { inp.focus(); if (cur) inp.select(); else check(); }, 30);
  }
  function baseProfile() {
    var m = member || {}, name = (m.name || '').trim();
    return {uid: me, name: name, nameLower: name.toLowerCase(), photoURL: m.photoURL || '', headline: [m.role || m.title || '', m.company || ''].filter(Boolean).join(' · ').slice(0, 120)};
  }
  function blocked() { return !!document.querySelector('#ptTour, #ptHwIntro, .pt-hw-intro, .onboarding-overlay[style*="flex"], #onboardingOverlay[style*="flex"], .welcome-overlay.open'); }
  function start() {
    var F = fb(); if (!F) { setTimeout(start, 400); return; }
    F.auth().onAuthStateChanged(function (u) {
      if (!u) return; me = u.uid;
      var db = F.firestore();
      db.doc('userDirectory/' + me).get().then(function (d) {
        var ws = d.exists && d.data().workspaceId; if (!ws) return null;
        return db.doc('workspaces/' + ws + '/members/' + me).get();
      }).then(function (m) {
        member = m && m.exists ? m.data() : {};
        return db.doc('profiles/' + me).get();
      }).then(function (p) {
        profile = p.exists ? p.data() : null;
        var base = baseProfile(), stale = !profile || ['name', 'photoURL', 'headline'].some(function (k) { return (profile[k] || '') !== base[k]; });
        if (stale) db.doc('profiles/' + me).set(Object.assign(base, {updatedAt: F.firestore.FieldValue.serverTimestamp()}), {merge: true}).catch(function () {});
        profile = Object.assign({}, profile || {}, base);
        ready.splice(0).forEach(function (f) { f(profile); });
        var later = false; try { later = sessionStorage.getItem('ptUnLater') === '1'; } catch (e) {}
        if (!profile.username && !later) (function wait(n) { if (blocked() && n < 120) return setTimeout(function () { wait(n + 1); }, 2000); setTimeout(function () { if (!profile.username) open(); }, 1200); })(0);
      }).catch(function () {});
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.ptUsername = {open: open, get: function () { return profile; }, whenReady: function (f) { if (profile) f(profile); else ready.push(f); }};
})();

/* ---------------------------------------------------------------------------
   Message notifications on every page (except Team chat itself): when someone sends you a message
   while you're in the app, a card slides in at the top right for 5 seconds (with a ding if sounds
   are on). Clicking it opens that conversation in Team chat. Team chats, group chats, and chats
   with people outside your organization (a new request shows as "wants to message you").
   --------------------------------------------------------------------------- */
(function () {
  if (/(^|\/)chat(\.html)?$/.test(location.pathname)) return;
  var SHOW_MS = 5000, since = Date.now(), seen = {}, names = {}, me = null, ws = null;
  function fb() { return window.firebase && firebase.apps && firebase.apps.length && firebase.auth && firebase.firestore ? firebase : null; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function ms(t) { return t && typeof t.toMillis === 'function' ? t.toMillis() : 0; }
  function css() {
    if (document.getElementById('ptPingCss')) return;
    var st = document.createElement('style'); st.id = 'ptPingCss';
    st.textContent = '#ptPings{position:fixed;top:16px;right:16px;z-index:9400;display:flex;flex-direction:column;gap:10px;width:340px;max-width:calc(100vw - 32px);pointer-events:none;}' +
      '.ptping{pointer-events:auto;position:relative;display:flex;gap:11px;align-items:flex-start;padding:13px 38px 15px 13px;border-radius:16px;background:var(--panel,#fff);color:var(--ink,#16202C);' +
      'border:1px solid var(--border,#DCE6F2);box-shadow:0 18px 44px -14px rgba(16,24,40,.38);cursor:pointer;overflow:hidden;font-family:Inter,system-ui,sans-serif;animation:ptPingIn .32s cubic-bezier(.2,.9,.3,1.2);}' +
      '.ptping.out{animation:ptPingOut .28s ease-in forwards;}' +
      '@keyframes ptPingIn{from{opacity:0;transform:translateX(30px) scale(.97);}to{opacity:1;transform:none;}}' +
      '@keyframes ptPingOut{to{opacity:0;transform:translateX(30px);}}' +
      '.ptping:hover{border-color:#3730B3;}' +
      '.ptping .av{width:40px;height:40px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font:800 14px Inter,sans-serif;color:#fff;background:linear-gradient(135deg,#3730B3,#7A4FB5);overflow:hidden;}' +
      '.ptping .av img{width:100%;height:100%;object-fit:cover;}' +
      '.ptping .tx{min-width:0;flex:1;} .ptping .who{font-weight:700;font-size:14px;line-height:1.3;} .ptping .where{font-weight:500;color:var(--slate,#5B6B7F);}' +
      '.ptping .msg{font-size:13.5px;line-height:1.45;color:var(--slate,#5B6B7F);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;}' +
      '.ptping .tag{display:inline-block;margin-top:6px;font-size:11px;font-weight:700;color:#3730B3;letter-spacing:.02em;}' +
      '.ptping .x{position:absolute;top:8px;right:8px;width:24px;height:24px;border:none;background:none;border-radius:7px;color:var(--slate-light,#8A97A8);cursor:pointer;font-size:13px;}' +
      '.ptping .x:hover{background:rgba(127,127,127,.12);color:var(--ink,#16202C);}' +
      '.ptping .bar{position:absolute;left:0;bottom:0;height:3px;width:100%;background:linear-gradient(90deg,#3730B3,#7A4FB5);transform-origin:left;animation:ptPingBar linear forwards;}' +
      '@keyframes ptPingBar{from{transform:scaleX(1);}to{transform:scaleX(0);}}' +
      '@media (prefers-reduced-motion: reduce){.ptping,.ptping.out{animation:none;}}';
    document.head.appendChild(st);
  }
  function ding() {
    try {
      if (localStorage.getItem('ptThemeSound') === 'off') return;
      var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      var ac = ding.ac || (ding.ac = new A()); if (ac.state === 'suspended') ac.resume();
      var t = ac.currentTime + 0.02;
      [[880, 0], [1318.5, 0.11]].forEach(function (n) {
        var o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, t + n[1]); g.gain.exponentialRampToValueAtTime(0.09, t + n[1] + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + 0.45);
        o.connect(g); g.connect(ac.destination); o.start(t + n[1]); o.stop(t + n[1] + 0.5);
      });
    } catch (e) {}
  }
  function show(n) {
    css();
    var box = document.getElementById('ptPings'); if (!box) { box = document.createElement('div'); box.id = 'ptPings'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    while (box.children.length >= 3) box.firstChild.remove();
    var el = document.createElement('div'); el.className = 'ptping'; el.setAttribute('role', 'status');
    var ini = (n.name || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    el.innerHTML = '<div class="av">' + (n.photo ? '<img src="' + esc(n.photo) + '" alt="">' : esc(ini)) + '</div>' +
      '<div class="tx"><div class="who">' + esc(n.name || 'Someone') + (n.where ? ' <span class="where">in ' + esc(n.where) + '</span>' : '') + '</div>' +
      '<div class="msg">' + esc(n.text || '') + '</div><span class="tag">' + esc(n.tag || 'New message') + ' · Open in Team chat →</span></div>' +
      '<button type="button" class="x" aria-label="Close">✕</button><i class="bar" style="animation-duration:' + SHOW_MS + 'ms"></i>';
    box.appendChild(el);
    var gone = false, timer = setTimeout(close, SHOW_MS);
    function close() { if (gone) return; gone = true; clearTimeout(timer); el.classList.add('out'); setTimeout(function () { el.remove(); }, 300); }
    el.querySelector('.x').addEventListener('click', function (e) { e.stopPropagation(); close(); });
    el.addEventListener('click', function () { location.href = 'chat.html?' + n.link; });
    ding();
  }
  function fresh(key, lm, readAt) {
    if (!lm || lm.senderId === me) return false;
    var t = ms(lm.createdAt); if (!t || t <= since || (seen[key] || 0) >= t || ms(readAt) >= t) return false;
    seen[key] = t; return true;
  }
  function start() {
    var F = fb(); if (!F) { setTimeout(start, 500); return; }
    F.auth().onAuthStateChanged(function (u) {
      if (!u || me) return; me = u.uid;
      var db = F.firestore();
      db.doc('userDirectory/' + me).get().then(function (d) {
        ws = d.exists && d.data().workspaceId; if (!ws) return;
        db.collection('workspaces/' + ws + '/members').get().then(function (s) { s.docs.forEach(function (m) { names[m.id] = m.data(); }); }).catch(function () {});
        // team chats (one teammate)
        db.collection('workspaces/' + ws + '/directMessages').where('participants', 'array-contains', me).onSnapshot(function (s) {
          s.docs.forEach(function (doc) {
            var c = doc.data(), lm = c.lastMessage; if (!fresh('dm:' + doc.id, lm, c.lastReadAt && c.lastReadAt[me])) return;
            var p = names[lm.senderId] || {};
            show({name: p.name || p.email || 'A teammate', photo: p.photoURL, text: lm.text || '📷 Photo or video', link: 'dm=' + encodeURIComponent(lm.senderId)});
          });
        }, function () {});
        // group chats
        db.collection('workspaces/' + ws + '/groupChats').where('participants', 'array-contains', me).onSnapshot(function (s) {
          s.docs.forEach(function (doc) {
            if (doc.id === '_teamFeed') return;
            var g = doc.data(), lm = g.lastMessage; if (!fresh('g:' + doc.id, lm, g.lastReadAt && g.lastReadAt[me])) return;
            var p = names[lm.senderId] || {};
            show({name: lm.senderName || p.name || 'A teammate', photo: p.photoURL, where: g.name || 'a group', text: lm.text || '📷 Photo or video', link: 'group=' + encodeURIComponent(doc.id)});
          });
        }, function () {});
      }).catch(function () {});
      // chats with people outside your organization (and new message requests)
      db.collection('extChats').where('participants', 'array-contains', me).onSnapshot(function (s) {
        s.docs.forEach(function (doc) {
          var c = doc.data(), lm = c.lastMessage; if (c.status === 'declined') return;
          if (!fresh('x:' + doc.id, lm, c.lastReadAt && c.lastReadAt[me])) return;
          var request = c.status === 'pending' && c.requestedBy !== me;
          db.doc('profiles/' + lm.senderId).get().then(function (pd) {
            var p = pd.exists ? pd.data() : {};
            show({name: p.name || ('@' + (p.username || 'someone')), photo: p.photoURL, text: request ? 'Wants to message you: “' + (lm.text || '') + '”' : lm.text,
              tag: request ? 'Message request' : 'New message', link: 'ext=' + encodeURIComponent(doc.id)});
          }).catch(function () {});
        });
      }, function () {});
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.ptPing = {show: show};          // (for testing: ptPing.show({name:'Emma', text:'Hi!', link:''}))
})();

/* ---------------------------------------------------------------------------
   Christmas (November 3 – January 6): christmas.js, next to this file, adds snow, lights, an ornament,
   Santa's sleigh, the side panel in Christmas colours and a one-time surprise. Loaded on every tracker page.
   --------------------------------------------------------------------------- */
(function () {
  if (document.getElementById('ptChristmasJs')) return;
  var me = document.currentScript, base = (me && me.src) ? me.src.replace(/[^\/?#]*([?#].*)?$/, '') : '';
  // the version number makes every browser fetch the newest christmas.js (change it whenever christmas.js changes)
  var CHRISTMAS_VERSION = '2026-11-11';
  var s = document.createElement('script'); s.id = 'ptChristmasJs'; s.src = base + 'christmas.js?v=' + CHRISTMAS_VERSION; s.dataset.place = 'app';
  (document.head || document.documentElement).appendChild(s);
})();
