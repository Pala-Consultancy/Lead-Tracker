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
    if (/(^|\.)(wistia\.com|wistia\.net|wi\.st)$/.test(h)) { m = p.match(/\/(?:medias|embed\/iframe|iframe)\/([\w]+)/); if (m) return {kind: 'wistia', embed: 'https://fast.wistia.net/embed/iframe/' + m[1] + '?videoFoam=true', thumb: ''}; }
    if (h === 'drive.google.com') { m = p.match(/\/file\/d\/([\w-]+)/); var id = m ? m[1] : u.searchParams.get('id'); if (id) return {kind: 'drive', embed: 'https://drive.google.com/file/d/' + id + '/preview', thumb: ''}; }
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(p) || /firebasestorage\.googleapis\.com$/.test(h)) return {kind: 'file', src: url, thumb: ''};
    return null;
  }
  function yt(id, u) {
    var t = u && (u.searchParams.get('t') || u.searchParams.get('start')); var start = t ? parseInt(String(t).replace(/s$/, ''), 10) || 0 : 0;
    return {kind: 'youtube', id: id, embed: 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1&playsinline=1' + (start ? '&start=' + start : ''), thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'};
  }
  var PLAY = '<svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="var(--cp-accent)"/><path d="M27 34l18-10-18-10z" fill="#fff"/></svg>';
  function videoHTML(raw, label) {
    var v = parseVideo(raw);
    if (!v) return '<div class="cp-frame cp-empty"><div>' + (raw ? '⚠️ This video link isn’t supported.<small>Use a YouTube, Vimeo, Loom, Wistia or Google Drive link.</small>' : '🎬 Add a video link<small>YouTube, Vimeo, Loom, Wistia or Google Drive</small>') + '</div></div>';
    if (v.kind === 'file') return '<div class="cp-frame"><video controls playsinline preload="metadata" src="' + esc(v.src) + '"></video></div>';
    if (v.kind === 'youtube') return '<div class="cp-frame"><button type="button" class="cp-poster" data-embed="' + esc(v.embed) + '" aria-label="Play ' + esc(label || 'video') + '" style="background-image:url(' + esc(v.thumb) + ')">' + PLAY + '</button></div>';
    return '<div class="cp-frame"><iframe src="' + esc(v.embed) + '" loading="lazy" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen title="' + esc(label || 'Video') + '"></iframe></div>';
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

  function render(page, root, opts) {
    ED = !!(opts && opts.editable);
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
      var hasText = ['video', 'questions', 'clients', 'text'].indexOf(b.type) >= 0;
      var head = (numbered ? '<span class="cp-step">Step ' + (++step) + '</span>' : '') +
        (b.title || (ED && b.type !== 'button') ? '<h2' + ed('b:' + bi + ':title') + (b.title ? '' : ' class="cp-ph"') + '>' + rich(b.title) + '</h2>' : '') +
        (hasText ? para(b.text, 'b:' + bi + ':text') : '');
      var body = '';
      if (b.type === 'video') body = '<div class="cp-main">' + videoHTML(b.url, b.title) + '</div>';
      else if (b.type === 'questions') body = '<div class="cp-grid cp-g3">' + (b.items || []).map(function (it, j) { return '<div class="cp-q"><h3' + ed('q:' + bi + ':' + j) + (it.q ? '' : ' class="cp-ph"') + '>' + rich(it.q || '') + '</h3>' + videoHTML(it.url, plain(it.q)) + '</div>'; }).join('') + '</div>';
      else if (b.type === 'clients') body = '<div class="cp-grid cp-g2">' + (b.urls || []).map(function (u) { return '<div>' + videoHTML(u, 'Client story') + '</div>'; }).join('') + '</div>';
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
      else if (b.type === 'button') body = (b.label || ED) ? '<div class="cp-cta"><a href="' + esc(/^(https?:|mailto:|tel:)/i.test(b.href || '') ? b.href : (b.href ? 'https://' + b.href : '#')) + '" target="_blank" rel="noopener"' + ed('b:' + bi + ':label') + '>' + rich(b.label || '') + '</a></div>' : '';
      out += '<section class="cp-sec cp-' + esc(b.type) + '">' + head + body + '</section>';
    });
    if (!blocks.length) out += '<section class="cp-sec"><div class="cp-frame cp-empty cp-short"><div>➕ Add your first step</div></div></section>';
    root.innerHTML = '<div class="cp-in">' + out + '</div>';
    root.classList.toggle('cp-editing', ED);
    ED = false;
  }

  // ---------- clicks: play a video in place, and open a result screenshot larger ----------
  document.addEventListener('click', function (e) {
    var p = e.target.closest && e.target.closest('.cpv .cp-poster');
    if (p) { var f = document.createElement('iframe'); f.src = p.dataset.embed + '&autoplay=1'; f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; f.allowFullscreen = true; f.title = p.getAttribute('aria-label') || 'Video'; p.replaceWith(f); return; }
    var s = e.target.closest && e.target.closest('.cpv .cp-shot');
    if (s) {
      var box = document.createElement('div'); box.className = 'cp-lightbox'; box.innerHTML = '<img src="' + esc(s.dataset.full) + '" alt="Client result"><button type="button" aria-label="Close">✕</button>';
      box.addEventListener('click', function () { box.remove(); }); document.body.appendChild(box);
    }
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { var b = document.querySelector('.cp-lightbox'); if (b) b.remove(); } });

  // ---------- the look ----------
  var CSS = [
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
