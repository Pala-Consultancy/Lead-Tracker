/* PalaTrack · callpage.js
   Draws a "call confirmed" page (a VSL page people see after booking a call).
   Used by the public page (call.html) and by the live preview in the editor (call-pages.html),
   so both always look exactly the same. Everything is scoped under .cpv, so it never clashes with the app's styles. */
(function () {
  'use strict';
  var esc = function (s) { return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); };

  // ---------- video links: YouTube, Vimeo, Loom, Wistia, Google Drive, or a direct video file ----------
  function parseVideo(raw) {
    var url = String(raw || '').trim(); if (!url) return null;
    // Wistia's embed code pasted instead of a link: <script …medias/ID.jsonp>, <div class="wistia_async_ID">, <wistia-player media-id="ID">, or an iframe
    var wm = url.match(/wistia_async_([\w]+)/) || url.match(/media-id=["']?([\w]+)/) || url.match(/wistia\.(?:com|net)\/(?:embed\/)?(?:medias|iframe|embed\/iframe)\/([\w]+)/);
    if (wm && /wistia/i.test(url) && /[<\s]/.test(url)) return {kind: 'wistia', embed: 'https://fast.wistia.net/embed/iframe/' + wm[1] + '?videoFoam=true&fullscreenButton=false', thumb: ''};
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    var u; try { u = new URL(url); } catch (e) { return null; }
    var h = u.hostname.replace(/^www\.|^m\./, ''), p = u.pathname, m;
    if (h === 'youtu.be') { m = p.match(/^\/([\w-]{6,})/); if (m) return yt(m[1], u); }
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(h)) {
      if (u.searchParams.get('v')) return yt(u.searchParams.get('v'), u);
      m = p.match(/^\/(?:embed|shorts|live|v)\/([\w-]{6,})/); if (m) return yt(m[1], u);
    }
    if (/(^|\.)vimeo\.com$/.test(h)) {
      m = p.match(/(?:\/video)?\/(\d{5,})(?:\/([\w]+))?/);
      if (m) { var hash = u.searchParams.get('h') || m[2] || ''; return {kind: 'vimeo', embed: 'https://player.vimeo.com/video/' + m[1] + '?' + (hash ? 'h=' + hash + '&' : '') + 'title=0&byline=0&portrait=0', thumb: ''}; }
    }
    if (/(^|\.)loom\.com$/.test(h)) { m = p.match(/\/(?:share|embed)\/([\w]+)/); if (m) return {kind: 'loom', embed: 'https://www.loom.com/embed/' + m[1] + '?hide_owner=true&hide_share=true&hide_title=true', thumb: ''}; }
    if (/(^|\.)(wistia\.com|wistia\.net|wi\.st)$/.test(h)) { m = p.match(/\/(?:medias|embed\/iframe|iframe)\/([\w]+)/); if (m) return {kind: 'wistia', embed: 'https://fast.wistia.net/embed/iframe/' + m[1] + '?videoFoam=true&fullscreenButton=false', thumb: ''}; }
    if (h === 'drive.google.com') { m = p.match(/\/file\/d\/([\w-]+)/); var id = m ? m[1] : u.searchParams.get('id'); if (id) return {kind: 'drive', embed: 'https://drive.google.com/file/d/' + id + '/preview', thumb: ''}; }
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(p) || /firebasestorage\.googleapis\.com$/.test(h)) return {kind: 'file', src: url, thumb: ''};
    return null;
  }
  function yt(id, u) {
    var t = u && (u.searchParams.get('t') || u.searchParams.get('start')); var start = t ? parseInt(String(t).replace(/s$/, ''), 10) || 0 : 0;
    return {kind: 'youtube', id: id, embed: 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1&playsinline=1&fs=0' + (start ? '&start=' + start : ''), thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'};
  }
  var PLAY = '<svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="var(--cp-accent)"/><path d="M27 34l18-10-18-10z" fill="#fff"/></svg>';
  // ---------- the smaller videos (questions, client stories): a clean thumbnail; a click opens the video big ----------
  var THUMBS = {};                                            // thumbnails found for Wistia/Vimeo, by link
  function thumbHTML(raw, label) {
    var v = parseVideo(raw); if (!v) return videoHTML(raw, label);
    var bg = v.thumb || THUMBS[raw] || '';
    var inner = v.kind === 'file' ? '<video class="cp-mini-img" muted playsinline preload="metadata" src="' + esc(v.src) + '#t=0.5"></video>'
                                   : '<span class="cp-mini-img" data-thumb="' + esc(raw) + '"' + (bg ? ' style="background-image:url(' + esc(bg) + ')"' : '') + '></span>';
    return '<div class="cp-frame cp-mini"><button type="button" class="cp-mini-btn" data-video="' + esc(raw) + '" aria-label="Play: ' + esc(label || 'video') + '">' + inner +
      '<span class="cp-mini-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span></button></div>';
  }
  // Wistia and Vimeo thumbnails come from their oEmbed services (once per link)
  function loadThumbs(root) {
    (root || document).querySelectorAll('.cpv .cp-mini-img[data-thumb]:not([style])').forEach(function (el) {
      var raw = el.getAttribute('data-thumb'), v = parseVideo(raw); if (!v) return;
      var put = function (u) { if (u) { THUMBS[raw] = u; document.querySelectorAll('.cp-mini-img[data-thumb]').forEach(function (x) { if (x.getAttribute('data-thumb') === raw) x.style.backgroundImage = 'url(' + u + ')'; }); } };
      if (THUMBS[raw]) return put(THUMBS[raw]);
      var api = '';
      if (v.kind === 'wistia') { var id = (v.embed.match(/iframe\/([\w]+)/) || [])[1]; if (id) api = 'https://fast.wistia.com/oembed?url=' + encodeURIComponent('https://fast.wistia.com/embed/iframe/' + id); }
      else if (v.kind === 'vimeo') api = 'https://vimeo.com/api/oembed.json?width=1280&url=' + encodeURIComponent(/^https?:/i.test(raw) ? raw : 'https://' + raw);
      if (!api) return;
      fetch(api).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { put(j && j.thumbnail_url ? String(j.thumbnail_url).replace(/\?.*$/, '') + (v.kind === 'wistia' ? '?image_crop_resized=1280x720' : '') : ''); }).catch(function () {});
    });
  }
  // the video grows out of the thumbnail you clicked to the size of the page's main video, then plays;
  // closing shrinks it back into its thumbnail
  var EASE_OPEN = 'cubic-bezier(.2,1.12,.32,1)', EASE_CLOSE = 'cubic-bezier(.5,0,.75,.2)';
  var calm = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
  function openVideo(raw, label, from) {
    var v = parseVideo(raw); if (!v || document.querySelector('.cp-vlb')) return;
    var root = (from && from.closest('.cpv')) || document.body, main = root.querySelector('.cp-main .cp-frame');
    var w = Math.min(main ? main.getBoundingClientRect().width : 820, innerWidth * 0.94), h = w * 9 / 16;
    if (h > innerHeight * 0.86) { h = innerHeight * 0.86; w = h * 16 / 9; }
    var img = from && from.querySelector('.cp-mini-img'), cover = img && img.tagName !== 'VIDEO' ? getComputedStyle(img).backgroundImage : 'none';
    var ov = document.createElement('div'); ov.className = 'cp-vlb'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', label || 'Video');
    ov.innerHTML = '<div class="cp-vlb-bg"></div><div class="cp-vlb-box" style="width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px"><div class="cp-vlb-cover"' + (cover && cover !== 'none' ? ' style="background-image:' + cover.replace(/"/g, "'") + '"' : '') + '></div></div><button type="button" class="cp-vlb-x" aria-label="Close the video">✕</button>';
    root.appendChild(ov);
    var box = ov.querySelector('.cp-vlb-box'), bg = ov.querySelector('.cp-vlb-bg'), x = ov.querySelector('.cp-vlb-x');
    ov._from = from; ov._close = function () { closeVideo(ov); };
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target === bg || e.target.closest('.cp-vlb-x')) closeVideo(ov); });
    var startPlayer = function () {
      if (!ov.isConnected) return;
      var pl = v.kind === 'file' ? document.createElement('video') : document.createElement('iframe');
      if (v.kind === 'file') { pl.src = v.src; pl.controls = true; pl.autoplay = true; pl.playsInline = true; pl.setAttribute('controlslist', 'nofullscreen'); pl.disablePictureInPicture = true; }
      else { pl.src = v.embed + (v.embed.indexOf('?') < 0 ? '?' : '&') + (v.kind === 'wistia' ? 'autoPlay=true' : 'autoplay=1'); pl.allow = 'autoplay; encrypted-media'; pl.title = label || 'Video'; }
      pl.className = 'cp-vlb-player'; box.appendChild(pl);
      setTimeout(function () { pl.classList.add('on'); }, v.kind === 'file' ? 60 : 380);    // the player fades in over the cover once it has loaded a bit
    };
    var f = from && from.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (!f || calm() || !box.animate) { ov.classList.add('open'); startPlayer(); x.focus(); return; }
    if (from) from.style.visibility = 'hidden';                                           // the thumbnail "lifts off" the page
    var t0 = 'translate(' + (f.left + f.width / 2 - (b.left + b.width / 2)) + 'px,' + (f.top + f.height / 2 - (b.top + b.height / 2)) + 'px) scale(' + (f.width / b.width) + ',' + (f.height / b.height) + ')';
    bg.animate([{opacity: 0}, {opacity: 1}], {duration: 380, easing: 'ease-out', fill: 'both'});
    x.animate([{opacity: 0, transform: 'scale(.6)'}, {opacity: 1, transform: 'none'}], {duration: 300, delay: 260, easing: 'ease-out', fill: 'both'});
    box.animate([{transform: t0, borderRadius: '16px', boxShadow: '0 0 0 rgba(0,0,0,0)'}, {transform: 'none', borderRadius: '18px', boxShadow: '0 50px 120px -30px rgba(0,0,0,.9)'}],
                {duration: 560, easing: EASE_OPEN, fill: 'both'}).onfinish = function () { ov.classList.add('open'); startPlayer(); x.focus(); };
  }
  function closeVideo(ov) {
    if (!ov || ov._closing) return; ov._closing = true;
    var box = ov.querySelector('.cp-vlb-box'), bg = ov.querySelector('.cp-vlb-bg'), x = ov.querySelector('.cp-vlb-x'), from = ov._from;
    var pl = box.querySelector('.cp-vlb-player'); if (pl) pl.classList.remove('on');          // back to the cover, then shrink
    var done = function () { ov.remove(); if (from) { from.style.visibility = ''; try { from.focus({preventScroll: true}); } catch (e) {} } };
    var f = from && from.isConnected && from.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (!f || !f.width || calm() || !box.animate) return done();
    var t0 = 'translate(' + (f.left + f.width / 2 - (b.left + b.width / 2)) + 'px,' + (f.top + f.height / 2 - (b.top + b.height / 2)) + 'px) scale(' + (f.width / b.width) + ',' + (f.height / b.height) + ')';
    x.animate([{opacity: 1}, {opacity: 0}], {duration: 150, fill: 'both'});
    bg.animate([{opacity: 1}, {opacity: 0}], {duration: 380, delay: 80, easing: 'ease-in', fill: 'both'});
    setTimeout(function () { if (pl) pl.remove(); box.animate([{transform: 'none', borderRadius: '18px'}, {transform: t0, borderRadius: '16px'}], {duration: 420, easing: EASE_CLOSE, fill: 'both'}).onfinish = done; }, 140);
  }
  // the main video: the player without its control bar (viewers click the video to pause and play)
  var CLEAN = {wistia: '&playbar=false&smallPlayButton=false&volumeControl=false&settingsControl=false&playbackRateControl=false&qualityControl=false&controlsVisibleOnLoad=false',
               youtube: '&controls=0&disablekb=1', vimeo: '&controls=0'};
  function videoHTML(raw, label) {
    var v = parseVideo(raw); if (v && CLEAN[v.kind]) v.embed += CLEAN[v.kind];
    if (!v) return '<div class="cp-frame cp-empty"><div>' + (raw ? '⚠️ This video link isn’t supported.<small>Use a YouTube, Vimeo, Loom, Wistia or Google Drive link.</small>' : '🎬 Add a video link<small>YouTube, Vimeo, Loom, Wistia or Google Drive</small>') + '</div></div>';
    if (v.kind === 'file') return '<div class="cp-frame cp-clean"><video playsinline preload="metadata" disablepictureinpicture src="' + esc(v.src) + '#t=0.1"></video><span class="cp-clean-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span></div>';
    if (v.kind === 'youtube') return '<div class="cp-frame"><button type="button" class="cp-poster" data-embed="' + esc(v.embed) + '" aria-label="Play ' + esc(label || 'video') + '" style="background-image:url(' + esc(v.thumb) + ')">' + PLAY + '</button></div>';
    return '<div class="cp-frame"><iframe src="' + esc(v.embed) + '" loading="lazy" allow="autoplay; encrypted-media" title="' + esc(label || 'Video') + '"></iframe></div>';
  }

  // ---------- fonts: loaded from Google Fonts, only the ones a page uses ----------
  var FONTS = {
    'montserrat': ['Montserrat', 'sans-serif', '500;600;700;800'], 'inter': ['Inter', 'sans-serif', '400;500;600;700;800'], 'poppins': ['Poppins', 'sans-serif', '400;500;600;700;800'],
    'sora': ['Sora', 'sans-serif', '400;600;700;800'], 'outfit': ['Outfit', 'sans-serif', '400;500;600;700;800'], 'space-grotesk': ['Space Grotesk', 'sans-serif', '400;500;600;700'],
    'raleway': ['Raleway', 'sans-serif', '400;500;600;700;800'], 'oswald': ['Oswald', 'sans-serif', '400;500;600;700'], 'bebas-neue': ['Bebas Neue', 'sans-serif', '400'],
    'playfair': ['Playfair Display', 'serif', '400;600;700;800'], 'dm-serif': ['DM Serif Display', 'serif', '400'], 'lora': ['Lora', 'serif', '400;500;600;700']
  };
  var fontStack = function (k) { var f = FONTS[k] || FONTS.montserrat; return "'" + f[0] + "'," + f[1]; };
  var loaded = {};
  function loadFonts(keys) {
    keys.forEach(function (k) {
      if (!FONTS[k] || loaded[k]) return; loaded[k] = 1;
      var l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=' + FONTS[k][0].replace(/ /g, '+') + ':wght@' + FONTS[k][2] + '&display=swap';
      (document.head || document.documentElement).appendChild(l);
    });
  }
  // ---------- backgrounds: ready-made, your own colour, or your own image ----------
  var BGS = {
    'dark': ['Dark', 'dark', '', '#0A0B0E'],
    'midnight': ['Midnight', 'dark', 'linear-gradient(160deg,#0B1023 0%,#111A3A 55%,#0A0F24 100%)', '#0B1023'],
    'aurora': ['Aurora', 'dark', 'radial-gradient(1100px 620px at 12% 0%,rgba(124,58,237,.38),transparent 60%),radial-gradient(1000px 600px at 92% 8%,rgba(14,165,233,.26),transparent 60%)', '#0B0B14'],
    'glow': ['Accent glow', 'dark', 'radial-gradient(1200px 700px at 50% -8%,color-mix(in srgb,var(--cp-accent) 42%,transparent),transparent 66%)', '#0A0B0E'],
    'sunset': ['Sunset', 'dark', 'linear-gradient(170deg,#24101A 0%,#3A1520 40%,#160A10 100%)', '#1A0B12'],
    'forest': ['Forest', 'dark', 'linear-gradient(170deg,#06140F 0%,#0C2A1E 50%,#06110C 100%)', '#07150F'],
    'ocean': ['Ocean', 'dark', 'linear-gradient(170deg,#04131E 0%,#0A2C42 55%,#03101A 100%)', '#05141F'],
    'light': ['Light', 'light', '', '#F6F7FA'],
    'white': ['White', 'light', '', '#FFFFFF'],
    'cream': ['Cream', 'light', '', '#FBF6EE'],
    'blush': ['Blush', 'light', 'linear-gradient(180deg,#FFF1F2 0%,#FDF2F8 50%,#F5F3FF 100%)', '#FFF5F7'],
    'sky': ['Sky', 'light', 'linear-gradient(180deg,#E8F1FF 0%,#F0F9FF 55%,#FFFFFF 100%)', '#F3F8FF']
  };
  var lum = function (hex) { var c = parseInt(hex.slice(1), 16), r = c >> 16 & 255, g = c >> 8 & 255, b = c & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  function applyTheme(root, theme, accent) {
    var bg = theme.bg || (theme.mode === 'light' ? 'light' : 'dark'), mode = 'dark', layers = [], sizes = [], col = '#0A0B0E';
    var pat = theme.pattern || 'dots';
    if (bg === 'custom' && /^#[0-9a-f]{6}$/i.test(theme.bgColor || '')) { col = theme.bgColor; mode = lum(col) > 0.6 ? 'light' : 'dark'; }
    else if (bg === 'image' && theme.bgImage) {
      var o = Math.max(0, Math.min(0.9, +theme.overlay >= 0 ? +theme.overlay : 0.55));
      layers.push('linear-gradient(rgba(5,6,10,' + o + '),rgba(5,6,10,' + o + '))', 'url("' + String(theme.bgImage).replace(/["\\]/g, '') + '")'); sizes.push('auto', 'cover'); col = '#0A0B0E';
    }
    else { var b = BGS[bg] || BGS.dark; mode = b[1]; col = b[3]; if (b[2]) { layers.push(b[2]); sizes.push('auto'); } }
    var dot = mode === 'light' ? 'rgba(16,24,40,.07)' : 'rgba(255,255,255,.06)';
    if (pat === 'dots') { layers.unshift('radial-gradient(' + dot + ' 1px,transparent 1px)'); sizes.unshift('22px 22px'); }
    if (pat === 'grid') { layers.unshift('linear-gradient(' + dot + ' 1px,transparent 1px),linear-gradient(90deg,' + dot + ' 1px,transparent 1px)'); sizes.unshift('44px 44px,44px 44px'); }
    root.style.backgroundColor = col; root.style.backgroundImage = layers.join(',') || 'none'; root.style.backgroundSize = sizes.join(',');
    root.style.backgroundPosition = (bg === 'image' ? 'center' : '0 0');
    root.style.setProperty('--cp-bg', col);
    root.style.setProperty('--cp-font-h', fontStack(theme.fontHead)); root.style.setProperty('--cp-font-b', fontStack(theme.fontBody));
    return mode;
  }

  // ---------- formatted text ----------
  // Texts can carry simple styling made in the editor's preview: bold, italic, the accent underline, a marker,
  // a colour and a size. Only these are kept; everything else (other tags, attributes, scripts) is dropped.
  var KEEP = ['cp-hl', 'cp-mark', 'cp-acc', 'cp-mut', 'cp-sz-s', 'cp-sz-l', 'cp-sz-xl'].concat(Object.keys(FONTS).map(function (k) { return 'cp-f-' + k; }));
  var COLORS = ['#FACC15', '#22C55E', '#3B82F6', '#EC4899', '#FFFFFF', '#111827'];
  var isRich = function (s) { return /<(?!br\s*\/?>)[a-z]/i.test(String(s || '')); };   // a line break alone is still plain text
  function clean(html) {
    var t = document.createElement('template'); t.innerHTML = String(html || '');
    function walk(node) {
      var out = '';
      node.childNodes.forEach(function (n, i) {
        if (n.nodeType === 3) { out += esc(n.nodeValue); return; }
        if (n.nodeType !== 1) return;
        var tag = n.tagName.toLowerCase(), kids = walk(n);
        if (tag === 'br') out += '<br>';
        else if (tag === 'b' || tag === 'strong') out += kids ? '<b>' + kids + '</b>' : '';
        else if (tag === 'i' || tag === 'em') out += kids ? '<i>' + kids + '</i>' : '';
        else if (tag === 'u') out += kids ? '<span class="cp-hl">' + kids + '</span>' : '';
        else if (tag === 'span' || tag === 'font') {
          var cls = [].filter.call(n.classList || [], function (c) { return KEEP.indexOf(c) >= 0; });
          var st = String(n.getAttribute('style') || ''), m = st.match(/(?:^|;)\s*color:\s*(#[0-9a-f]{6})/i), rgb = st.match(/(?:^|;)\s*color:\s*rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/i);
          var hex = m ? m[1].toUpperCase() : rgb ? '#' + [rgb[1], rgb[2], rgb[3]].map(function (x) { return ('0' + (+x).toString(16)).slice(-2); }).join('').toUpperCase() : '';
          var col = COLORS.indexOf(hex) >= 0 ? hex : '';                // only the colours from the toolbar
          if (!kids) return;
          out += (cls.length || col) ? '<span' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + (col ? ' style="color:' + col + '"' : '') + '>' + kids + '</span>' : kids;
        }
        else if (tag === 'div' || tag === 'p') out += (out && !/<br>$/.test(out) ? '<br>' : '') + kids;
        else out += kids;
      });
      return out;
    }
    return walk(t.content).replace(/(<br>)+$/, '');
  }
  // plain text keeps its line breaks; formatted text is cleaned first
  function rich(s) { return isRich(s) ? clean(s) : esc(s).replace(/\n/g, '<br>'); }
  function plain(s) { var d = document.createElement('div'); d.innerHTML = rich(s).replace(/<br>/g, '\n'); return d.textContent; }

  // ---------- the page ----------
  var ED = false;                                                   // true while drawing the editor's preview
  var ed = function (path) { return ED ? ' data-edit="' + path + '"' : ''; };
  function headline(title, hl) {
    if (isRich(title)) return clean(title);
    var t = String(title || ''), h = String(hl || '').trim(), br = function (x) { return esc(x).replace(/\n/g, '<br>'); };
    if (!h) return br(t);
    var i = t.toLowerCase().indexOf(h.toLowerCase());
    if (i < 0) return br(t);
    return br(t.slice(0, i)) + '<span class="cp-hl">' + br(t.slice(i, i + h.length)) + '</span>' + br(t.slice(i + h.length));
  }
  function para(text, path) {
    if (String(text || '').trim()) return '<p class="cp-sub"' + ed(path) + '>' + rich(text) + '</p>';
    return ED && path ? '<p class="cp-sub cp-ph"' + ed(path) + '></p>' : '';             // an empty text: still clickable in the editor
  }
  function continueBar() { return '<div class="cp-continue">Continue scrolling <span aria-hidden="true">↓</span></div>'; }

  // ---------- the person's booking (from Calendly's redirect, or a reminder link) ----------
  // {first_name}, {name}, {date}, {time} and {event} in texts become their details. Without a booking the page still reads
  // naturally: "{first_name}, your call is booked!" becomes "Your call is booked!".
  var BK = null;
  // dates in the visitor's language (or the browser's default, if it doesn't say)
  function fmt(d, opts, time) {
    var f = time ? 'toLocaleTimeString' : 'toLocaleDateString';
    try { return d[f](navigator.language || undefined, opts); } catch (x) { try { return d[f](undefined, opts); } catch (y) { return time ? d.toTimeString().slice(0, 5) : d.toDateString(); } }
  }
  function when(b) {
    var d = new Date(b.start); if (isNaN(d)) return {date: '', time: ''};
    var e = new Date(b.end || b.start);
    return {date: fmt(d, {weekday: 'long', day: 'numeric', month: 'long'}), time: fmt(d, {hour: '2-digit', minute: '2-digit'}, true),
      until: isNaN(e) || +e === +d ? '' : fmt(e, {hour: '2-digit', minute: '2-digit'}, true)};
  }
  function fillText(s) {
    s = String(s || ''); if (s.indexOf('{') < 0 || ED) return s;                      // the editor keeps the placeholders
    var b = BK, w = b ? when(b) : null;
    var v = b ? {first_name: b.first || (b.full || '').split(' ')[0] || '', name: b.full || b.first || '', date: w.date, time: w.time, event: b.eventName || 'our call'}
              : {first_name: '', name: '', date: 'the day you picked', time: 'the time you picked', event: 'our call'};
    var out = s.replace(/\{(first_name|name|date|time|event)\}/g, function (m, k) { return v[k]; });
    // a missing name: tidy what's left ("  , your call" → "Your call")
    out = out.replace(/(^|>|\n)\s*[,!.:]\s*/g, '$1').replace(/\s+([,!.?])/g, '$1').replace(/ {2,}/g, ' ').replace(/(^|>)\s+/g, '$1');
    return out.replace(/(^|>|\n)([a-z\u00e0-\u00ff])/g, function (m, a, c) { return a + c.toUpperCase(); });
  }
  function personal(page) {                                                       // a copy of the page with the details filled in
    var p = JSON.parse(JSON.stringify(page || {}));
    if (p.hero) { p.hero.title = fillText(p.hero.title); p.hero.subtitle = fillText(p.hero.subtitle); p.hero.highlight = fillText(p.hero.highlight); }
    (p.blocks || []).forEach(function (b) { ['title', 'text', 'label'].forEach(function (k) { if (b[k]) b[k] = fillText(b[k]); }); (b.items || []).forEach(function (it) { if (it.q) it.q = fillText(it.q); }); });
    return p;
  }
  var gcalDate = function (iso) { return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
  function bookingHTML(b, title) {
    if (!b || !b.start) return '<div class="cp-bk cp-bk-none"><span class="cp-bk-cal" aria-hidden="true"><i>\u00A0</i><b>\u2713</b></span><div><b>Your call is booked</b><span>You’ll find the date, time and calendar invite in your confirmation email.</span></div></div>';
    var w = when(b), name = b.eventName || title || 'Our call', details = 'Booked with ' + (b.host || 'us') + '. ' + (location.href.split('#')[0]);
    var end = b.end || new Date(new Date(b.start).getTime() + 30 * 60000).toISOString();
    var g = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(name) + '&dates=' + gcalDate(b.start) + '/' + gcalDate(end) + '&details=' + encodeURIComponent(details);
    var o = 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=' + encodeURIComponent(name) + '&startdt=' + encodeURIComponent(new Date(b.start).toISOString()) + '&enddt=' + encodeURIComponent(new Date(end).toISOString()) + '&body=' + encodeURIComponent(details);
    var links = b.invitee ? '<div class="cp-bk-links"><a href="https://calendly.com/reschedulings/' + esc(b.invitee) + '" target="_blank" rel="noopener">Reschedule</a><span>·</span><a href="https://calendly.com/cancellations/' + esc(b.invitee) + '" target="_blank" rel="noopener">Cancel</a></div>' : '';
    var dd = new Date(b.start), mon = fmt(dd, {month: 'short'}).replace('.', ''), day = String(dd.getDate());
    var cap = function (t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };
    return '<div class="cp-bk"><div class="cp-bk-when"><span class="cp-bk-cal" aria-hidden="true"><i>' + esc(mon) + '</i><b>' + esc(day) + '</b></span><div><b>' + esc(cap(w.date)) + '</b><span>' + esc(w.time) + (w.until ? ' – ' + esc(w.until) : '') + ' <em>(your time)</em></span>' + (b.eventName ? '<small>' + esc(b.eventName) + '</small>' : '') + '</div></div>' +
      '<div class="cp-bk-btns"><a class="cp-bk-btn" href="' + esc(g) + '" target="_blank" rel="noopener">Google Calendar</a><a class="cp-bk-btn" href="' + esc(o) + '" target="_blank" rel="noopener">Outlook</a>' +
      '<button type="button" class="cp-bk-btn" data-ics="1" data-start="' + esc(b.start) + '" data-end="' + esc(end) + '" data-title="' + esc(name) + '" data-details="' + esc(details) + '">Apple / other (.ics)</button></div>' + links + '</div>';
  }

  // a button: style (filled, outline, soft, link), shape (round, pill, square), size (s, m, l), width (auto, full),
  // a colour (the page's accent unless picked), an icon, and opening in a new tab. Old buttons look as they always did.
  var ICONS = {arrow: '\u2192', calendar: '\uD83D\uDCC5', play: '\u25B6', check: '\u2713', chat: '\uD83D\uDCAC', phone: '\uD83D\uDCDE', doc: '\uD83D\uDCC4'};
  function btnHTML(label, href, cfg, key) {
    cfg = cfg || {};
    var st = ['filled', 'outline', 'soft', 'link'].indexOf(cfg.style) >= 0 ? cfg.style : 'filled';
    var sh = ['round', 'pill', 'square'].indexOf(cfg.shape) >= 0 ? cfg.shape : 'round';
    var sz = ['s', 'm', 'l'].indexOf(cfg.size) >= 0 ? cfg.size : 'm';
    var col = /^#[0-9a-f]{6}$/i.test(cfg.color || '') ? ' style="--cp-bc:' + cfg.color + '"' : '';
    var url = /^(https?:|mailto:|tel:)/i.test(href || '') ? href : (href ? 'https://' + href : '#');
    var tab = cfg.newTab === false ? '' : ' target="_blank" rel="noopener"';
    var ic = ICONS[cfg.icon] ? '<span class="cp-bi" aria-hidden="true">' + ICONS[cfg.icon] + '</span>' : '';
    var after = cfg.icon === 'arrow';                                     // an arrow goes after the text, the others before
    return '<a class="cp-btn s-' + st + ' sh-' + sh + ' z-' + sz + (cfg.width === 'full' ? ' w-full' : '') + '" href="' + esc(url) + '"' + tab + col + '>' +
      (after ? '' : ic) + '<span' + ed(key) + (label ? '' : ' class="cp-ph"') + '>' + rich(label || '') + '</span>' + (after ? ic : '') + '</a>';
  }

  function render(page, root, opts) {
    ED = !!(opts && opts.editable);
    BK = (opts && opts.booking) || null;
    page = personal(page);
    page = page || {}; var theme = page.theme || {}, hero = page.hero || {}, blocks = page.blocks || [];
    var accent = /^#[0-9a-f]{6}$/i.test(theme.accent || '') ? theme.accent : '#E5463A';
    root.style.setProperty('--cp-accent', accent);
    var mode = applyTheme(root, theme, accent);
    root.className = 'cpv cp-' + mode + (theme.bg === 'image' && theme.bgImage ? ' cp-img' : '');
    // the fonts this page uses: the two page fonts, plus any picked for a few words
    var used = [theme.fontHead || 'montserrat', theme.fontBody || 'montserrat'], m, re = /cp-f-([a-z-]+)/g, all = JSON.stringify(page);
    while ((m = re.exec(all))) used.push(m[1]);
    loadFonts(used);
    var out = '<div class="cp-glow" aria-hidden="true"></div><header class="cp-hero"><h1' + ed('hero.title') + '>' + headline(hero.title || 'Your Call Is Confirmed!', hero.highlight) + '</h1>' + para(hero.subtitle, 'hero.subtitle') + '</header>';
    var step = 0, first = true;
    blocks.forEach(function (b, bi) {
      var numbered = b.type !== 'results';
      if (numbered && !first) out += continueBar();
      first = false;
      var hasText = ['video', 'questions', 'clients', 'text', 'booking'].indexOf(b.type) >= 0;
      var head = (numbered ? '<span class="cp-step">Step ' + (++step) + '</span>' : '') +
        (b.title || (ED && b.type !== 'button') ? '<h2' + ed('b:' + bi + ':title') + (b.title ? '' : ' class="cp-ph"') + '>' + rich(b.title) + '</h2>' : '') +
        (hasText ? para(b.text, 'b:' + bi + ':text') : '');
      var body = '';
      if (b.type === 'booking') body = bookingHTML(BK, b.title);
      else if (b.type === 'video') body = '<div class="cp-main">' + videoHTML(b.url, b.title) + '</div>';
      else if (b.type === 'questions') body = '<div class="cp-grid cp-g3">' + (b.items || []).map(function (it, j) { return '<div class="cp-q"' + (ED ? ' data-di="' + j + '"' : '') + '>' + (ED && (b.items || []).length > 1 ? '<span class="cp-drag" data-drag="items:' + bi + '" title="Drag to move">\u2807 Drag</span>' : '') + '<h3' + ed('q:' + bi + ':' + j) + (it.q ? '' : ' class="cp-ph"') + '>' + rich(it.q || '') + '</h3>' + thumbHTML(it.url, plain(it.q)) + '</div>'; }).join('') + '</div>';
      else if (b.type === 'clients') body = '<div class="cp-grid cp-g2">' + (b.urls || []).map(function (u, j) { return '<div class="cp-cv"' + (ED ? ' data-di="' + j + '"' : '') + '>' + (ED && (b.urls || []).length > 1 ? '<span class="cp-drag" data-drag="urls:' + bi + '" title="Drag to move">\u2807 Drag</span>' : '') + thumbHTML(u, 'Client story') + '</div>'; }).join('') + '</div>';
      else if (b.type === 'results') {
        var imgs = (b.images || []).filter(Boolean);
        if (imgs.length) {
          var rows = Math.min(3, Math.max(1, Math.ceil(imgs.length / 4))), per = Math.ceil(imgs.length / rows), rs = '';
          for (var r = 0; r < rows; r++) {
            var set = imgs.slice(r * per, r * per + per); while (set.length < 4 && imgs.length) set = set.concat(imgs.slice(0, 4 - set.length));
            var cells = set.map(function (src) { return '<button type="button" class="cp-shot" data-full="' + esc(src) + '"><img src="' + esc(src) + '" alt="Client result" loading="lazy"></button>'; }).join('');
            rs += '<div class="cp-row' + (r % 2 ? ' rev' : '') + '" style="--cp-dur:' + (28 + set.length * 4) + 's"><div class="cp-track">' + cells + cells + '</div></div>';
          }
          body = '<div class="cp-wall">' + rs + '</div>';
        } else body = '<div class="cp-frame cp-empty cp-short"><div>🖼️ Add screenshots of client results</div></div>';
      }
      else if (b.type === 'button') {
        var two = b.btn2On && (b.label2 || ED);
        body = (b.label || ED) ? '<div class="cp-cta' + (two ? ' cp-cta2' : '') + ((b.btn || {}).width === 'full' ? ' cp-full' : '') + '">' + btnHTML(b.label, b.href, b.btn, 'b:' + bi + ':label') + (two ? btnHTML(b.label2, b.href2, b.btn2 || {style: 'outline'}, 'b:' + bi + ':label2') : '') + '</div>' : '';
      }
      out += '<section class="cp-sec cp-' + esc(b.type) + '"' + (ED ? ' data-bi="' + bi + '"' : '') + '>' + (ED && blocks.length > 1 ? '<span class="cp-move" data-move="' + bi + '" title="Drag to move this step">\u2807 Move step</span>' : '') + head + body + '</section>';
    });
    if (!blocks.length) out += '<section class="cp-sec"><div class="cp-frame cp-empty cp-short"><div>➕ Add your first step</div></div></section>';
    root.innerHTML = '<div class="cp-in">' + out + '</div>';
    try { loadThumbs(root); } catch (e) {}
    root.classList.toggle('cp-editing', ED);
    ED = false; BK = null;
  }

  // ---------- clicks: play a video in place, and open a result screenshot larger ----------
  document.addEventListener('click', function (e) {
    var p = e.target.closest && e.target.closest('.cpv .cp-poster');
    if (p) { var f = document.createElement('iframe'); f.src = p.dataset.embed + '&autoplay=1'; f.allow = 'autoplay; encrypted-media'; f.allowFullscreen = false; f.title = p.getAttribute('aria-label') || 'Video'; p.replaceWith(f); return; }
    var ic = e.target.closest && e.target.closest('.cpv [data-ics]');
    if (ic) {
      var z = function (iso) { return gcalDate(iso); }, nl = '\r\n';
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PalaTrack//Call//EN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@palatrack.com', 'DTSTAMP:' + z(new Date().toISOString()),
        'DTSTART:' + z(ic.dataset.start), 'DTEND:' + z(ic.dataset.end), 'SUMMARY:' + ic.dataset.title.replace(/[,;]/g, ' '), 'DESCRIPTION:' + ic.dataset.details.replace(/[,;]/g, ' '),
        'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join(nl);
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], {type: 'text/calendar'})); a.download = 'call.ics'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      return;
    }
    var cf = e.target.closest && e.target.closest('.cpv .cp-main .cp-clean');
    if (cf) { var vd = cf.querySelector('video'); if (vd) { if (vd.paused) vd.play(); else vd.pause(); cf.classList.toggle('playing', !vd.paused); } return; }
    var mv = e.target.closest && e.target.closest('.cpv .cp-mini-btn');
    if (mv) { openVideo(mv.getAttribute('data-video'), mv.getAttribute('aria-label').replace(/^Play: /, ''), mv); return; }
    var s = e.target.closest && e.target.closest('.cpv .cp-shot');
    if (s) {
      var box = document.createElement('div'); box.className = 'cp-lightbox'; box.innerHTML = '<img src="' + esc(s.dataset.full) + '" alt="Client result"><button type="button" aria-label="Close">✕</button>';
      box.addEventListener('click', function () { box.remove(); }); document.body.appendChild(box);
    }
  });
  document.addEventListener('dblclick', function (e) { if (e.target && e.target.closest && e.target.closest('.cpv .cp-frame video')) e.preventDefault(); }, true);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { var vb = document.querySelector('.cp-vlb'); if (vb && vb._close) return vb._close(); var b = document.querySelector('.cp-lightbox'); if (b) b.remove(); } });

  // ---------- the look ----------
  var CSS = [
    '.cpv .cp-mini{cursor:pointer}',
    '.cpv .cp-mini-btn{position:absolute;inset:0;width:100%;height:100%;padding:0;border:0;background:#0B0F19;cursor:pointer;display:block}',
    '.cpv .cp-mini-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:linear-gradient(135deg,color-mix(in srgb,var(--cp-accent) 70%,#000),#0B0F19) center/cover no-repeat;transition:transform .35s ease,filter .25s}',
    '.cpv .cp-mini-btn:hover .cp-mini-img{transform:scale(1.04);filter:brightness(1.08)}',
    '.cpv .cp-mini-play{position:absolute;left:50%;top:50%;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;background:color-mix(in srgb,var(--cp-accent) 82%,transparent);box-shadow:0 10px 26px -8px rgba(0,0,0,.6),0 0 0 6px rgba(255,255,255,.18);transition:transform .2s}',
    '.cpv .cp-mini-play svg{margin-left:3px}',
    '.cpv .cp-mini-btn:hover .cp-mini-play{transform:scale(1.08)}',
    '.cpv .cp-mini-btn:focus-visible{outline:3px solid #fff;outline-offset:-6px}',
    '.cpv .cp-vlb{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center}',
    '.cpv .cp-vlb-bg{position:absolute;inset:0;background:radial-gradient(1200px 700px at 50% 50%,color-mix(in srgb,var(--cp-accent) 22%,rgba(5,8,18,.78)),rgba(4,6,14,.9));backdrop-filter:blur(10px) saturate(1.2);-webkit-backdrop-filter:blur(10px) saturate(1.2)}',
    '.cpv .cp-vlb-box{position:relative;border-radius:18px;overflow:hidden;border:3px solid var(--cp-accent);background:#000;transform-origin:center;will-change:transform;box-shadow:0 50px 120px -30px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06)}',
    '.cpv .cp-vlb-cover{position:absolute;inset:0;background:linear-gradient(135deg,color-mix(in srgb,var(--cp-accent) 70%,#000),#0B0F19) center/cover no-repeat}',
    '.cpv .cp-vlb-player{position:absolute;inset:0;width:100%;height:100%;border:0;opacity:0;transition:opacity .35s ease}',
    '.cpv .cp-vlb-player.on{opacity:1}',
    '.cpv .cp-clean video{cursor:pointer} .cpv .cp-clean-play{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;background:color-mix(in srgb,var(--cp-accent) 85%,transparent);pointer-events:none;transition:opacity .2s,transform .2s}',
    '.cpv .cp-clean.playing .cp-clean-play{opacity:0;transform:scale(.8)}',
    '.cpv .cp-vlb-x{position:fixed;z-index:1;top:16px;right:18px;width:42px;height:42px;border:0;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font:700 18px/1 system-ui;cursor:pointer}',
    '.cpv .cp-vlb-x:hover{background:rgba(255,255,255,.26)}',

    '.cpv .cp-cta{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center}',
    '.cpv .cp-cta.cp-full{flex-direction:column;align-items:stretch;max-width:640px;margin-left:auto;margin-right:auto}',
    '.cpv .cp-cta a.cp-btn{--cp-bc:var(--cp-accent);gap:10px;transition:transform .15s,background .15s,box-shadow .15s}',
    '.cpv .cp-cta a.cp-btn.s-filled{background:var(--cp-bc);color:#fff}',
    '.cpv .cp-cta a.cp-btn.s-outline{background:transparent;color:var(--cp-ink);box-shadow:inset 0 0 0 2.5px var(--cp-bc)}',
    '.cpv .cp-cta a.cp-btn.s-outline:hover{background:color-mix(in srgb,var(--cp-bc) 14%,transparent)}',
    '.cpv .cp-cta a.cp-btn.s-soft{background:color-mix(in srgb,var(--cp-bc) 22%,transparent);color:var(--cp-ink);box-shadow:none}',
    '.cpv .cp-cta a.cp-btn.s-link{background:none;color:var(--cp-bc);box-shadow:none;min-height:0;padding:6px 8px;text-decoration:underline;text-underline-offset:4px}',
    '.cpv .cp-cta a.cp-btn.sh-pill{border-radius:999px} .cpv .cp-cta a.cp-btn.sh-square{border-radius:4px}',
    '.cpv .cp-cta a.cp-btn.z-s{min-height:44px;padding:0 22px;font-size:15px} .cpv .cp-cta a.cp-btn.z-l{min-height:70px;padding:0 46px;font-size:21px}',
    '.cpv .cp-cta a.cp-btn.s-link.z-s,.cpv .cp-cta a.cp-btn.s-link.z-l{min-height:0;padding:6px 8px}',
    '.cpv .cp-cta a.cp-btn.w-full{width:100%}',
    '.cpv .cp-bi{font-size:1.05em;line-height:1}',
    '.cpv.cp-editing .cp-sec{position:relative}',
    '.cpv .cp-move{position:absolute;right:0;top:-6px;z-index:4;display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:999px;background:rgba(17,24,39,.85);color:#fff;font:700 12px Inter,system-ui,sans-serif;cursor:grab;user-select:none;touch-action:none;opacity:0;transition:opacity .15s;box-shadow:0 4px 12px rgba(0,0,0,.3)}',
    '.cpv.cp-editing .cp-sec:hover > .cp-move,.cpv .cp-move:focus{opacity:1}',
    '.cpv.cp-sorting .cp-continue{display:none}',
    '.cpv .cp-sec.cp-dragph{outline:2.5px dashed var(--cp-accent);outline-offset:10px;border-radius:18px;opacity:.3}',
    '.cpv.cp-editing .cp-q,.cpv.cp-editing .cp-cv{position:relative}',
    '.cpv .cp-drag{position:absolute;left:8px;top:8px;z-index:3;display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:999px;background:rgba(17,24,39,.82);color:#fff;font:700 12px Inter,system-ui,sans-serif;cursor:grab;user-select:none;touch-action:none;opacity:0;transition:opacity .15s;box-shadow:0 4px 12px rgba(0,0,0,.3)}',
    '.cpv.cp-editing .cp-q:hover .cp-drag,.cpv.cp-editing .cp-cv:hover .cp-drag,.cpv .cp-drag:focus{opacity:1}',
    '.cpv .cp-dragph{outline:2.5px dashed var(--cp-accent);outline-offset:4px;border-radius:14px;opacity:.35}',
    '.cpv .cp-dragph > *{visibility:hidden}',
    '.cp-dragghost{position:fixed !important;left:0;top:0;z-index:100000;margin:0 !important;pointer-events:none;border-radius:14px;box-shadow:0 26px 50px -16px rgba(0,0,0,.6),0 0 0 2px var(--cp-accent,#2E6BE6);will-change:transform}',
    'body.cp-dragging,body.cp-dragging *{cursor:grabbing !important;user-select:none !important}',
    '.cpv .cp-bk{max-width:640px;margin:18px auto 0;padding:22px 24px;border-radius:18px;background:var(--cp-card);border:1px solid color-mix(in srgb,var(--cp-accent) 35%,transparent);box-shadow:0 18px 40px -24px rgba(0,0,0,.5);text-align:left}',
    '.cpv .cp-bk-when{display:flex;gap:16px;align-items:center}',
    '.cpv .cp-bk-ic{flex:0 0 auto;width:54px;height:54px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;background:color-mix(in srgb,var(--cp-accent) 18%,transparent)}',
    '.cpv .cp-bk-when b{display:block;font:800 22px/1.2 var(--cp-font-h,Montserrat,sans-serif);color:var(--cp-ink)}',
    '.cpv .cp-bk-when > div > span{display:block;margin-top:3px;font-size:16px;color:var(--cp-ink)} .cpv .cp-bk-when em{font-style:normal;color:var(--cp-muted);font-size:13px}',
    '.cpv .cp-bk-when > div > small{display:block;margin-top:3px;font-size:13px;color:var(--cp-muted)}',
    '.cpv .cp-bk-cal{flex:0 0 auto;width:64px;height:68px;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;background:#fff;box-shadow:0 8px 20px -10px rgba(0,0,0,.6)}',
    '.cpv .cp-bk-cal i{display:block;height:22px;line-height:22px;text-align:center;font:800 11px/22px var(--cp-font-b,Montserrat,sans-serif);letter-spacing:.12em;text-transform:uppercase;font-style:normal;color:#fff;background:var(--cp-accent)}',
    '.cpv .cp-bk-cal b{flex:1;display:flex;align-items:center;justify-content:center;font:800 28px/1 var(--cp-font-h,Montserrat,sans-serif) !important;color:#111827 !important;margin:0 !important}',
    '.cpv .cp-bk-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}',
    '.cpv .cp-bk-btn{flex:1 1 150px;display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 14px;border-radius:12px;border:1.5px solid color-mix(in srgb,var(--cp-accent) 60%,transparent);background:transparent;color:var(--cp-ink);font:700 14px var(--cp-font-b,Montserrat,sans-serif);text-decoration:none;cursor:pointer}',
    '.cpv .cp-bk-btn:hover{background:color-mix(in srgb,var(--cp-accent) 16%,transparent)}',
    '.cpv .cp-bk-links{display:flex;gap:8px;justify-content:center;margin-top:14px;font-size:13.5px;color:var(--cp-muted)} .cpv .cp-bk-links a{color:var(--cp-muted)}',
    '.cpv .cp-bk-none{display:flex;gap:16px;align-items:center} .cpv .cp-bk-none > div > b{display:block;font:800 18px var(--cp-font-h,Montserrat,sans-serif)} .cpv .cp-bk-none > div > span{display:block;margin-top:3px;font-size:14px;color:var(--cp-muted)}',
    '.cpv .cp-bk-none .cp-bk-cal b{color:var(--cp-accent) !important}',
    '.cpv b{font-weight:800} .cpv i{font-style:italic}',
    '.cpv .cp-f-montserrat{font-family:' + fontStack('montserrat') + '}',
    '.cpv .cp-f-inter{font-family:' + fontStack('inter') + '}',
    '.cpv .cp-f-poppins{font-family:' + fontStack('poppins') + '}',
    '.cpv .cp-f-sora{font-family:' + fontStack('sora') + '}',
    '.cpv .cp-f-outfit{font-family:' + fontStack('outfit') + '}',
    '.cpv .cp-f-space-grotesk{font-family:' + fontStack('space-grotesk') + '}',
    '.cpv .cp-f-raleway{font-family:' + fontStack('raleway') + '}',
    '.cpv .cp-f-oswald{font-family:' + fontStack('oswald') + '}',
    '.cpv .cp-f-bebas-neue{font-family:' + fontStack('bebas-neue') + '}',
    '.cpv .cp-f-playfair{font-family:' + fontStack('playfair') + '}',
    '.cpv .cp-f-dm-serif{font-family:' + fontStack('dm-serif') + '}',
    '.cpv .cp-f-lora{font-family:' + fontStack('lora') + '}',
    
    '.cpv .cp-mark{background:color-mix(in srgb,var(--cp-accent) 32%,transparent);padding:0 .14em;border-radius:.18em;-webkit-box-decoration-break:clone;box-decoration-break:clone}',
    '.cpv .cp-acc{color:var(--cp-accent)} .cpv .cp-mut{color:var(--cp-muted)}',
    '.cpv .cp-sz-s{font-size:.8em} .cpv .cp-sz-l{font-size:1.25em} .cpv .cp-sz-xl{font-size:1.55em}',
    '.cpv .cp-sub .cp-hl::after,.cpv h2 .cp-hl::after,.cpv h3 .cp-hl::after{height:.09em;bottom:-.06em}',
    '.cpv.cp-editing [data-edit]{cursor:text;border-radius:8px;outline:1.5px dashed transparent;outline-offset:6px;transition:outline-color .15s}',
    '.cpv.cp-editing [data-edit]:hover{outline-color:color-mix(in srgb,var(--cp-accent) 70%,transparent)}',
    '.cpv.cp-editing [data-edit][contenteditable="true"]{outline:2px solid var(--cp-accent);cursor:text}',
    '.cpv.cp-editing .cp-ph{min-height:1.4em;color:var(--cp-muted);opacity:.6} .cpv.cp-editing .cp-ph:empty::before{content:"Click to add text";font-weight:500;font-size:15px}',
    '.cpv.cp-editing h2.cp-ph:empty::before{content:"Click to add a title"}',
    '.cpv{--cp-bg:#0A0B0E;--cp-ink:#FFFFFF;--cp-muted:#A7ADB8;--cp-card:#14161C;position:relative;overflow:hidden;background-color:var(--cp-bg);color:var(--cp-ink);font-family:var(--cp-font-b,Montserrat,Inter,system-ui,sans-serif);container-type:inline-size;}',
    '.cpv.cp-light{--cp-ink:#12141A;--cp-muted:#5C6575;--cp-card:#FFFFFF;}',
    '.cpv.cp-img{--cp-muted:#D3D7DE;--cp-card:rgba(20,22,28,.85);} .cpv.cp-img .cp-glow{display:none}',
    '.cpv h1,.cpv h2,.cpv h3,.cpv .cp-step,.cpv .cp-cta a,.cpv .cp-continue{font-family:var(--cp-font-h,Montserrat,Inter,system-ui,sans-serif)}',
    '.cpv .cp-sub{font-family:var(--cp-font-b,Montserrat,Inter,system-ui,sans-serif)}',
    '.cpv *{box-sizing:border-box}',
    '.cpv .cp-glow{position:absolute;left:50%;top:-220px;width:760px;height:440px;margin-left:-380px;border-radius:50%;background:var(--cp-accent);opacity:.13;filter:blur(90px);pointer-events:none}',
    '.cpv .cp-in{position:relative;max-width:1180px;margin:0 auto;padding:clamp(48px,8cqw,110px) clamp(16px,4cqw,40px) clamp(48px,7cqw,90px)}',
    '.cpv .cp-hero{text-align:center;max-width:960px;margin:0 auto}',
    '.cpv h1{margin:0;font-weight:800;font-size:clamp(34px,6.4cqw,82px);line-height:1.05;letter-spacing:-.02em}',
    '.cpv .cp-hl{position:relative;white-space:nowrap}',
    '.cpv .cp-hl::after{content:"";position:absolute;left:0;right:0;bottom:-.1em;height:.12em;border-radius:4px;background:var(--cp-accent)}',
    '.cpv .cp-sub{margin:22px auto 0;max-width:760px;font-size:clamp(15px,1.75cqw,22px);line-height:1.6;color:var(--cp-muted);text-align:center}',
    '.cpv .cp-sec{margin-top:clamp(36px,5cqw,64px);text-align:center}',
    '.cpv .cp-step{display:inline-block;padding:8px 20px;border-radius:999px;background:var(--cp-accent);color:#fff;font-weight:800;font-size:14px;letter-spacing:.06em;text-transform:uppercase}',
    '.cpv h2{margin:22px 0 0;font-weight:800;font-size:clamp(24px,3.6cqw,48px);line-height:1.15;letter-spacing:-.01em}',
    '.cpv h3{margin:0 0 16px;font-weight:700;font-size:clamp(15px,1.7cqw,21px);line-height:1.35;min-height:2.7em;display:flex;align-items:flex-end;justify-content:center}',
    '.cpv .cp-main{max-width:820px;margin:34px auto 0}',
    '.cpv .cp-frame{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;border:3px solid var(--cp-accent);background:#000;box-shadow:0 30px 60px -30px rgba(0,0,0,.7)}',
    '.cpv .cp-frame iframe,.cpv .cp-frame video{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#000}',
    '.cpv .cp-poster{position:absolute;inset:0;width:100%;height:100%;border:0;padding:0;cursor:pointer;background:#111 center/cover no-repeat;display:flex;align-items:center;justify-content:center}',
    '.cpv .cp-poster svg{transition:transform .2s;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))} .cpv .cp-poster:hover svg{transform:scale(1.1)}',
    '.cpv .cp-empty{display:flex;align-items:center;justify-content:center;border-style:dashed;background:var(--cp-card);color:var(--cp-muted);font-weight:700;font-size:15px;text-align:center;padding:16px}',
    '.cpv .cp-empty small{display:block;margin-top:6px;font-weight:500;font-size:12.5px}',
    '.cpv .cp-short{aspect-ratio:auto;min-height:120px}',
    '.cpv .cp-grid{display:grid;gap:clamp(18px,3cqw,40px);margin-top:clamp(28px,4cqw,48px);text-align:center}',
    '.cpv .cp-g3{grid-template-columns:repeat(3,minmax(0,1fr))} .cpv .cp-g2{grid-template-columns:repeat(2,minmax(0,1fr));max-width:1060px;margin-left:auto;margin-right:auto}',
    '@container (max-width:900px){ .cpv .cp-g3{grid-template-columns:repeat(2,minmax(0,1fr))} }',
    '@container (max-width:600px){ .cpv .cp-g3,.cpv .cp-g2{grid-template-columns:1fr} .cpv h3{min-height:0} }',
    '.cpv .cp-continue{margin:clamp(40px,6cqw,72px) 0 0;text-align:center;font-weight:700;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--cp-muted)}',
    '.cpv .cp-continue span{display:inline-block;margin-left:8px;color:var(--cp-accent);font-size:18px;animation:cpBounce 1.6s ease-in-out infinite}',
    '@keyframes cpBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}',
    '.cpv .cp-results{margin-top:clamp(28px,4cqw,44px)}',
    '.cpv .cp-results h2{font-size:clamp(15px,1.8cqw,22px);font-weight:600;color:var(--cp-muted)}',
    '.cpv .cp-wall{margin:22px calc(-1 * clamp(16px,4cqw,40px)) 0;display:grid;gap:16px;-webkit-mask:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}',
    '.cpv .cp-row{overflow:hidden}',
    '.cpv .cp-track{display:flex;gap:16px;width:max-content;animation:cpScroll var(--cp-dur,40s) linear infinite}',
    '.cpv .cp-row.rev .cp-track{animation-direction:reverse}',
    '.cpv .cp-row:hover .cp-track{animation-play-state:paused}',
    '@keyframes cpScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}',
    '.cpv .cp-shot{flex:0 0 auto;width:clamp(180px,24cqw,280px);height:clamp(220px,30cqw,340px);border:2px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;padding:0;background:var(--cp-card);cursor:zoom-in}',
    '.cpv.cp-light .cp-shot{border-color:rgba(16,24,40,.08)}',
    '.cpv .cp-shot img{width:100%;height:100%;object-fit:cover;display:block}',
    '.cpv .cp-cta{margin-top:28px} .cpv .cp-cta a{display:inline-flex;align-items:center;justify-content:center;min-height:58px;padding:0 34px;border-radius:14px;background:var(--cp-accent);color:#fff;font-weight:800;font-size:18px;text-decoration:none;box-shadow:0 18px 40px -18px var(--cp-accent);transition:transform .15s}',
    '.cpv .cp-cta a:hover{transform:translateY(-2px)}',
    '@media (prefers-reduced-motion:reduce){.cpv .cp-track{animation:none}.cpv .cp-continue span{animation:none}}',
    '.cp-lightbox{position:fixed;inset:0;z-index:2147483000;background:rgba(5,6,8,.88);display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out}',
    '.cp-lightbox img{max-width:100%;max-height:100%;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.6)}',
    '.cp-lightbox button{position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:18px;cursor:pointer}'
  ].join('\n');
  function injectCss() { if (document.getElementById('cp-css')) return; var s = document.createElement('style'); s.id = 'cp-css'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s); }
  injectCss();

  window.CallPage = {render: render, parseVideo: parseVideo, clean: clean, isRich: isRich, plain: plain, COLORS: COLORS, FONTS: FONTS, BGS: BGS, loadFonts: loadFonts, fontStack: fontStack};
})();
