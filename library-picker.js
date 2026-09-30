// ---------------------------------------------------------------------------
// library-picker.js — shared by the Library page and the message builders.
//   PTLib.clean(html)        → the page HTML with only the formatting the Library uses
//   PTLib.toText(html, fmt)  → plain text (lists as •, to-dos as ☐/☑), placeholders converted
//   PTLib.toHTML(html, fmt)  → simple email-safe HTML, placeholders converted
//   PTLib.blocks(html)       → the page split into its blocks (to pick one icebreaker)
//   PTLib.pick({format})     → opens "Use from Library"; resolves {text, html, title} or null
// Placeholders are written in the Library as {firstName}, {company}, … and become
//   email:    %%first_name%%, %%company%%, …   (filled in when the email sends)
//   linkedin: {{firstName}}, {{company}}, …    (filled in from the lead card)
// ---------------------------------------------------------------------------
(function(){
  var PH = [['firstName', 'First name'], ['lastName', 'Last name'], ['fullName', 'Full name'], ['company', 'Company'],
    ['jobTitle', 'Job title'], ['city', 'City'], ['country', 'Country']];
  var EMAIL = {firstName: '%%first_name%%', lastName: '%%last_name%%', fullName: '%%first_name%% %%last_name%%', company: '%%company%%',
    jobTitle: '%%job_title%%', city: '%%city%%', country: '%%country%%'};
  var LINKEDIN = {firstName: '{{firstName}}', fullName: '{{fullName}}', company: '{{company}}', jobTitle: '{{jobTitle}}'};
  function convertPh(key, fmt){
    if(fmt === 'email') return EMAIL[key] || '{' + key + '}';
    if(fmt === 'linkedin') return LINKEDIN[key] || '{' + key + '}';
    return '{' + key + '}';
  }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }

  // ----- keep only the Library's own formatting -----
  var ALLOWED = {P: 1, H1: 1, H2: 1, H3: 1, UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, HR: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1, BR: 1, DIV: 1, SPAN: 1, A: 1};
  var DROP = {SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, TEMPLATE: 1, META: 1, LINK: 1, BUTTON: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1};
  // message flows: a first message with branches ("If no reply after 3 days" → follow-up), as deep as you like
  var FLOW_CLASSES = ['flow', 'fl-step', 'fl-msg', 'fl-branches', 'fl-branch', 'fl-cond', 'fl-children'];
  var BRANCH_TONES = ['no', 'yes', 'other'];
  function cleanNode(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType === 3) return;
      if(n.nodeType !== 1){ n.remove(); return; }
      var tag = n.tagName;
      if(DROP[tag] || (n.classList && n.classList.contains('fl-ui'))){ n.remove(); return; }
      if(!ALLOWED[tag]){ cleanNode(n); while(n.firstChild) node.insertBefore(n.firstChild, n); n.remove(); return; }
      var keep = {};
      if(tag === 'DIV'){
        var c = n.classList.contains('todo') ? 'todo' : n.classList.contains('callout') ? 'callout' : null;
        FLOW_CLASSES.forEach(function(f){ if(n.classList.contains(f)) c = f; });
        if(c === 'fl-branch'){ var tone = BRANCH_TONES.filter(function(t){ return n.classList.contains(t); })[0] || 'other'; c = 'fl-branch ' + tone; }
        if(c) keep['class'] = c;
        if(c === 'todo') keep['data-checked'] = n.getAttribute('data-checked') === 'true' ? 'true' : 'false';
      }
      if(tag === 'SPAN' && n.classList.contains('ph')){ var k = n.getAttribute('data-ph'); if(PH.some(function(p){ return p[0] === k; })){ keep['class'] = 'ph'; keep['data-ph'] = k; keep['contenteditable'] = 'false'; n.textContent = '{' + k + '}'; } }
      if(tag === 'A'){ var h = n.getAttribute('href') || ''; if(/^(https?:|mailto:)/i.test(h)){ keep.href = h; keep.target = '_blank'; keep.rel = 'noopener'; } }
      Array.prototype.slice.call(n.attributes).forEach(function(a){ n.removeAttribute(a.name); });
      Object.keys(keep).forEach(function(a){ n.setAttribute(a, keep[a]); });
      if(tag === 'SPAN' && !keep['class']){ cleanNode(n); while(n.firstChild) node.insertBefore(n.firstChild, n); n.remove(); return; }
      if(tag !== 'SPAN' || !keep['class']) cleanNode(n);
    });
  }
  function clean(html){
    var t = document.createElement('template'); t.innerHTML = html || '';
    cleanNode(t.content);
    return t.innerHTML;
  }
  function frag(html){ var t = document.createElement('template'); t.innerHTML = clean(html); return t.content; }

  // ----- to plain text -----
  function inlineText(el, fmt){
    var out = '';
    el.childNodes.forEach(function(n){
      if(n.nodeType === 3) out += n.textContent;
      else if(n.nodeType === 1){
        if(n.classList && n.classList.contains('ph')) out += convertPh(n.getAttribute('data-ph'), fmt);
        else if(n.tagName === 'BR') out += '\n';
        else out += inlineText(n, fmt);
      }
    });
    return out;
  }
  function blockText(b, fmt){
    if(isFlow(b)) return flowText(b, fmt);
    var tag = b.nodeType === 1 ? b.tagName : '#text';
    if(tag === '#text') return b.textContent.trim();
    if(tag === 'HR') return '—';
    if(tag === 'UL' || tag === 'OL'){
      var i = 0; return Array.prototype.map.call(b.children, function(li){ i++; return (tag === 'OL' ? i + '. ' : '• ') + inlineText(li, fmt).trim(); }).join('\n');
    }
    if(b.classList && b.classList.contains('todo')) return (b.getAttribute('data-checked') === 'true' ? '☑ ' : '☐ ') + inlineText(b, fmt).trim();
    return inlineText(b, fmt).replace(/\u00a0/g, ' ').trim();
  }
  function isFlow(b){ return b && b.nodeType === 1 && b.classList && b.classList.contains('flow'); }
  function kids(el, cls){ return Array.prototype.filter.call(el ? el.children : [], function(c){ return c.classList && c.classList.contains(cls); }); }
  // a message's text (it can hold several paragraphs)
  function msgText(msg, fmt){
    if(!msg) return '';
    var blocksIn = Array.prototype.filter.call(msg.children, function(c){ return /^(P|DIV|UL|OL|BLOCKQUOTE|H1|H2|H3)$/.test(c.tagName); });
    if(!blocksIn.length) return inlineText(msg, fmt).replace(/\u00a0/g, ' ').trim();
    var out = [], loose = '';
    msg.childNodes.forEach(function(n){
      if(n.nodeType === 1 && blocksIn.indexOf(n) >= 0){ if(loose.trim()) out.push(loose.trim()); loose = ''; var t = blockText(n, fmt); if(t) out.push(t); }
      else if(n.nodeType === 3) loose += n.textContent; else if(n.nodeType === 1) loose += n.tagName === 'BR' ? '\n' : inlineText(n, fmt);
    });
    if(loose.trim()) out.push(loose.trim());
    return out.join('\n');
  }
  // every message in a flow, with the path that leads to it
  function flowSteps(flow, fmt){
    var out = [];
    (function walk(steps, path){
      steps.forEach(function(step, i){
        var here = path.concat([]);
        out.push({path: here, text: msgText(kids(step, 'fl-msg')[0], fmt), depth: here.length});
        kids(kids(step, 'fl-branches')[0], 'fl-branch').forEach(function(br){
          var cond = (kids(br, 'fl-cond')[0] || {}).textContent || 'Then';
          walk(kids(kids(br, 'fl-children')[0], 'fl-step'), here.concat([cond.replace(/\s+/g, ' ').trim()]));
        });
      });
    })(kids(flow, 'fl-step'), []);
    return out;
  }
  function flowText(flow, fmt){
    return flowSteps(flow, fmt).map(function(st){
      var pad = new Array(st.depth + 1).join('    ');
      var head = st.depth ? pad.slice(4) + '↳ ' + st.path[st.path.length - 1] + ':\n' : '';
      return head + st.text.split('\n').map(function(l){ return pad + l; }).join('\n');
    }).join('\n\n');
  }
  function toText(html, fmt){
    var f = frag(html), parts = [];
    f.childNodes.forEach(function(b){ var t = blockText(b, fmt); if(t) parts.push(t); });
    return parts.join('\n\n');
  }
  // ----- to simple email HTML -----
  function inlineHTML(el, fmt){
    var out = '';
    el.childNodes.forEach(function(n){
      if(n.nodeType === 3) out += esc(n.textContent);
      else if(n.nodeType === 1){
        if(n.classList && n.classList.contains('ph')) out += esc(convertPh(n.getAttribute('data-ph'), fmt));
        else if(n.tagName === 'BR') out += '<br>';
        else if(/^(B|STRONG)$/.test(n.tagName)) out += '<b>' + inlineHTML(n, fmt) + '</b>';
        else if(/^(I|EM)$/.test(n.tagName)) out += '<i>' + inlineHTML(n, fmt) + '</i>';
        else if(n.tagName === 'U') out += '<u>' + inlineHTML(n, fmt) + '</u>';
        else if(n.tagName === 'A' && n.getAttribute('href')) out += '<a href="' + esc(n.getAttribute('href')) + '">' + inlineHTML(n, fmt) + '</a>';
        else out += inlineHTML(n, fmt);
      }
    });
    return out;
  }
  function toHTML(html, fmt){
    var f = frag(html), out = [];
    f.childNodes.forEach(function(b){
      if(b.nodeType === 3){ if(b.textContent.trim()) out.push('<div>' + esc(b.textContent.trim()) + '</div>'); return; }
      var tag = b.tagName;
      if(tag === 'HR') return;
      if(isFlow(b)){ out.push('<div>' + esc(flowText(b, fmt)).replace(/\n/g, '<br>') + '</div>'); return; }
      if(tag === 'UL' || tag === 'OL'){ out.push('<' + tag.toLowerCase() + '>' + Array.prototype.map.call(b.children, function(li){ return '<li>' + inlineHTML(li, fmt) + '</li>'; }).join('') + '</' + tag.toLowerCase() + '>'); return; }
      var inner = inlineHTML(b, fmt).trim(); if(!inner || inner === '<br>') return;
      if(/^H[1-3]$/.test(tag)) inner = '<b>' + inner + '</b>';
      if(b.classList && b.classList.contains('todo')) inner = (b.getAttribute('data-checked') === 'true' ? '☑ ' : '☐ ') + inner;
      out.push('<div>' + inner + '</div>');
    });
    return out.join('<div><br></div>');
  }
  // ----- the page's blocks (headings are kept as labels for what follows) -----
  function blocks(html){
    var f = frag(html), out = [], heading = '';
    f.childNodes.forEach(function(b){
      if(b.nodeType === 1 && /^H[1-3]$/.test(b.tagName)){ heading = b.textContent.trim(); return; }
      if(b.nodeType === 1 && b.tagName === 'HR') return;
      if(isFlow(b)){
        // each message of the flow is its own part, labelled with how you get there
        flowSteps(b, 'library').forEach(function(st, i){
          if(!st.text) return;
          var label = (heading ? heading + ' · ' : '') + (st.depth ? st.path.join(' → ') : 'First message');
          var p = document.createElement('p'); p.textContent = '';
          out.push({heading: label, text: st.text, html: '<p>' + esc(st.text).replace(/\{([a-zA-Z]+)\}/g, function(m, k){ return '<span class="ph" contenteditable="false" data-ph="' + k + '">{' + k + '}</span>'; }).replace(/\n/g, '<br>') + '</p>'});
        });
        return;
      }
      var t = blockText(b, 'library'); if(!t) return;
      var wrap = document.createElement('div'); wrap.appendChild(b.cloneNode(true));
      out.push({heading: heading, text: t, html: wrap.innerHTML});
    });
    return out;
  }

  // ----- "Use from Library" -----
  var box = null, state = null;
  function css(){
    if(document.getElementById('ptlib-css')) return;
    var st = document.createElement('style'); st.id = 'ptlib-css';
    st.textContent = '' +
      '.ptlib-ov{position:fixed;inset:0;z-index:600;background:rgba(15,22,32,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;}' +
      '.ptlib{width:min(860px,100%);height:min(620px,90vh);display:grid;grid-template-columns:280px minmax(0,1fr);background:var(--panel,#fff);border-radius:18px;overflow:hidden;box-shadow:0 30px 80px -20px rgba(16,24,40,.5);font-family:Inter,sans-serif;color:var(--ink,#16202C);}' +
      '.ptlib-l{border-right:1px solid var(--border,#DCE6F2);display:flex;flex-direction:column;min-height:0;padding:16px 12px;}' +
      '.ptlib-l h3{margin:0 0 10px 4px;font:800 17px Sora,sans-serif;}' +
      '.ptlib-l input{width:100%;box-sizing:border-box;border:1px solid var(--border,#DCE6F2);background:var(--panel-alt,#F8FBFE);border-radius:9px;padding:8px 10px;font:13px Inter,sans-serif;color:var(--ink,#16202C);margin-bottom:8px;}' +
      '.ptlib-list{flex:1;min-height:0;overflow-y:auto;}' +
      '.ptlib-f{padding:8px 6px 3px;font:700 10.5px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--slate-light,#8CA0B3);}' +
      '.ptlib-p{display:flex;gap:8px;align-items:center;width:100%;border:0;background:none;border-radius:8px;padding:7px 8px;font:500 13px Inter,sans-serif;color:var(--ink,#16202C);cursor:pointer;text-align:left;}' +
      '.ptlib-p:hover{background:var(--panel-alt,#F1F5FA);}' +
      '.ptlib-p.on{background:rgba(55,48,179,.09);color:var(--teal,#3730B3);font-weight:600;}' +
      '.ptlib-p span:last-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.ptlib-r{display:flex;flex-direction:column;min-height:0;}' +
      '.ptlib-rh{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border,#DCE6F2);}' +
      '.ptlib-rh h4{flex:1;min-width:0;margin:0;font:700 15px Sora,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.ptlib-x{border:0;background:none;width:32px;height:32px;border-radius:8px;cursor:pointer;color:var(--slate,#5C6B7C);font-size:16px;}' +
      '.ptlib-x:hover{background:var(--panel-alt,#F1F5FA);}' +
      '.ptlib-hint{padding:10px 16px 0;font-size:12.5px;color:var(--slate,#5C6B7C);}' +
      '.ptlib-blocks{flex:1;min-height:0;overflow-y:auto;padding:10px 16px 16px;display:flex;flex-direction:column;gap:8px;}' +
      '.ptlib-b{border:1px solid var(--border,#DCE6F2);border-radius:12px;padding:10px 12px;background:var(--panel-alt,#F8FBFE);cursor:pointer;text-align:left;font:inherit;color:inherit;white-space:pre-wrap;line-height:1.5;font-size:13.5px;}' +
      '.ptlib-b:hover,.ptlib-b:focus-visible{border-color:var(--teal,#3730B3);background:var(--panel,#fff);outline:none;box-shadow:0 0 0 3px rgba(55,48,179,.12);}' +
      '.ptlib-b small{display:block;font:700 10.5px Inter,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:var(--slate-light,#8CA0B3);margin-bottom:4px;white-space:normal;}' +
      '.ptlib-b .use{display:block;margin-top:6px;font:700 12px Inter,sans-serif;color:var(--teal,#3730B3);white-space:normal;}' +
      '.ptlib .ph{display:inline;padding:0 5px;border-radius:5px;background:rgba(55,48,179,.1);color:var(--teal,#3730B3);font-weight:600;}' +
      '.ptlib-all{border:0;border-radius:9px;padding:8px 14px;background:var(--teal,#3730B3);color:#fff;font:700 12.5px Inter,sans-serif;cursor:pointer;white-space:nowrap;}' +
      '.ptlib-none{padding:30px 16px;text-align:center;color:var(--slate,#5C6B7C);font-size:13.5px;line-height:1.6;}' +
      '.ptlib-none a{color:var(--teal,#3730B3);font-weight:700;}' +
      '@media (max-width:720px){.ptlib{grid-template-columns:1fr;grid-template-rows:40% 60%;}.ptlib-l{border-right:0;border-bottom:1px solid var(--border,#DCE6F2);}}';
    document.head.appendChild(st);
  }
  function loadPages(){
    var db = firebase.firestore(), u = firebase.auth().currentUser;
    if(!u) return Promise.resolve([]);
    return db.doc('userDirectory/' + u.uid).get().then(function(d){
      var ws = d.exists && d.data().workspaceId; if(!ws) return [];
      return Promise.all([
        db.collection('libraryPages').where('workspaceId', '==', ws).where('visibility', '==', 'team').get().catch(function(){ return {docs: []}; }),
        db.collection('libraryPages').where('createdBy', '==', u.uid).get().catch(function(){ return {docs: []}; }),
        db.doc('libraryFolders/' + ws).get().catch(function(){ return null; })
      ]).then(function(r){
        // the team's folders, with their current names and order
        var fl = r[2] && r[2].exists && Array.isArray(r[2].data().folders) ? r[2].data().folders : [];
        var order = {}, names = {}; fl.forEach(function(f, i){ order[f.id] = i; names[f.id] = f.name; });
        var seen = {}, out = [];
        r[0].docs.concat(r[1].docs).forEach(function(doc){
          if(seen[doc.id]) return; seen[doc.id] = 1; var p = doc.data(); if(p.workspaceId !== ws) return; p.id = doc.id;
          if(p.folderId && names[p.folderId]) p.folder = names[p.folderId];
          p._order = p.folderId && order[p.folderId] !== undefined ? order[p.folderId] : 999;
          out.push(p);
        });
        return out.sort(function(a, b){ return (a._order - b._order) || (a.folder || '').localeCompare(b.folder || '') || (a.title || '').localeCompare(b.title || ''); });
      });
    });
  }
  function previewHTML(text){ return esc(text).replace(/\{([a-zA-Z]+)\}/g, '<span class="ph">{$1}</span>'); }
  function close(v){ if(!box) return; box.remove(); box = null; document.removeEventListener('keydown', onKey, true); var s = state; state = null; if(s){ if(s.back) try{ s.back.focus(); }catch(e){} s.resolve(v || null); } }
  function onKey(e){ if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); close(null); } }
  function result(html, title){ return {title: title, text: toText(html, state.format), html: toHTML(html, state.format)}; }
  function renderList(){
    var q = (box.querySelector('.ptlib-l input').value || '').toLowerCase().trim();
    var list = state.pages.filter(function(p){ return !q || ((p.title || '') + ' ' + (p.text || '')).toLowerCase().indexOf(q) >= 0; });
    var el = box.querySelector('.ptlib-list');
    if(!state.pages.length){ el.innerHTML = '<div class="ptlib-none">Your Library is empty.<br><a href="library.html" target="_blank" rel="noopener">Open the Library</a> to write your first icebreakers.</div>'; return; }
    if(!list.length){ el.innerHTML = '<div class="ptlib-none">No page matches "' + esc(q) + '".</div>'; return; }
    var html = '', last = null;
    list.forEach(function(p){
      if(p.folder !== last){ html += '<div class="ptlib-f">' + esc(p.folder || 'Pages') + '</div>'; last = p.folder; }
      html += '<button type="button" class="ptlib-p' + (state.cur && state.cur.id === p.id ? ' on' : '') + '" data-id="' + esc(p.id) + '"><span>' + esc(p.icon || '📝') + '</span><span>' + esc(p.title || 'Untitled') + '</span></button>';
    });
    el.innerHTML = html;
  }
  function renderPage(){
    var r = box.querySelector('.ptlib-r'), p = state.cur;
    if(!p){ r.innerHTML = '<div class="ptlib-rh"><h4>Use from Library</h4><button type="button" class="ptlib-x" data-close aria-label="Close">✕</button></div><div class="ptlib-none">Pick a page on the left, then click the part you want to use.</div>'; return; }
    var bl = blocks(p.content || '');
    r.innerHTML = '<div class="ptlib-rh"><h4>' + esc((p.icon || '📝') + ' ' + (p.title || 'Untitled')) + '</h4>' +
      (bl.length > 1 ? '<button type="button" class="ptlib-all" data-all>Use the whole page</button>' : '') +
      '<button type="button" class="ptlib-x" data-close aria-label="Close">✕</button></div>' +
      '<div class="ptlib-hint">Click a part to put it in your message.' + (state.format === 'linkedin' ? ' Placeholders become {{firstName}} and so on.' : ' Placeholders fill in with each lead\u2019s details when it sends.') + '</div>' +
      '<div class="ptlib-blocks">' + (bl.length ? bl.map(function(b, i){
        return '<button type="button" class="ptlib-b" data-b="' + i + '">' + (b.heading ? '<small>' + esc(b.heading) + '</small>' : '') + previewHTML(b.text) + '<span class="use">Use this →</span></button>';
      }).join('') : '<div class="ptlib-none">This page is empty.</div>') + '</div>';
    state.blocks = bl;
  }
  function pick(opts){
    opts = opts || {};
    if(state) close(null);
    css();
    return new Promise(function(resolve){
      state = {format: opts.format || 'text', resolve: resolve, pages: [], cur: null, back: document.activeElement};
      box = document.createElement('div'); box.className = 'ptlib-ov';
      box.innerHTML = '<div class="ptlib" role="dialog" aria-modal="true" aria-label="Use from Library"><div class="ptlib-l"><h3>📚 Library</h3>' +
        '<input type="search" placeholder="Search your pages" aria-label="Search your pages" autocomplete="off"><div class="ptlib-list"><div class="ptlib-none">Loading…</div></div></div><div class="ptlib-r"></div></div>';
      document.body.appendChild(box);
      document.addEventListener('keydown', onKey, true);
      renderPage();
      box.addEventListener('mousedown', function(e){ if(e.target === box) close(null); });
      box.addEventListener('click', function(e){
        if(e.target.closest('[data-close]')){ close(null); return; }
        var p = e.target.closest('[data-id]'); if(p){ state.cur = state.pages.filter(function(x){ return x.id === p.dataset.id; })[0] || null; renderList(); renderPage(); return; }
        if(e.target.closest('[data-all]')){ close(result(state.cur.content || '', state.cur.title)); return; }
        var b = e.target.closest('[data-b]'); if(b){ close(result(state.blocks[+b.dataset.b].html, state.cur.title)); }
      });
      box.querySelector('.ptlib-l input').addEventListener('input', renderList);
      setTimeout(function(){ var i = box && box.querySelector('.ptlib-l input'); if(i) i.focus(); }, 30);
      loadPages().then(function(pages){ if(!state) return; state.pages = pages; if(pages.length === 1) state.cur = pages[0]; renderList(); renderPage(); })
        .catch(function(){ if(state){ state.pages = []; renderList(); } });
    });
  }

  window.PTLib = {PH: PH, clean: clean, toText: toText, toHTML: toHTML, blocks: blocks, pick: pick, convertPh: convertPh};
})();
