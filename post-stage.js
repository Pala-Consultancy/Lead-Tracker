/* post-stage.js: the creation stage of PalaTrack's AI writer (extension and website).
 * While the writer works: a LinkedIn-style post card being prepared (your photo and name, shimmering lines) and the
 * steps lighting up one by one. When the answer is in: each post glides in as a LinkedIn-style card with its funnel
 * label (TOFU / MOFU / BOFU), writes itself line by line with a soft cursor, then its buttons appear. Several posts
 * come in one after the other, and a calm "Your 5 posts are ready ✓" closes it. A click anywhere skips to the end.
 *   ptStage.wait(waitEl, {me: {name, photo}})           → {stop()}
 *   ptStage.reveal(msgEl, {post, text, head, actions, scroller, me}) → true when it took over (the reply had posts) */
(function () {
  if (window.ptStage) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const initials = (n) => String(n || 'You').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const CSS = `
    .ps-stage{display:flex;flex-direction:column;gap:14px;width:min(560px,100%);padding:2px 0;}
    .ps-steps{display:flex;flex-direction:column;gap:8px;}
    .ps-step{display:flex;align-items:center;gap:10px;font:500 13.5px/1.3 Inter,system-ui,sans-serif;color:var(--ink-3,#9AA3B2);transition:color .35s;}
    .ps-step i{width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:2px solid #DDE2EC;font-style:normal;font-size:10.5px;font-weight:800;color:#fff;transition:background .3s,border-color .3s;}
    .ps-step.now{color:var(--ink,#16202C);font-weight:600;} .ps-step.now i{border-color:#6D3BDB;border-top-color:transparent;animation:psTurn .8s linear infinite;}
    .ps-step.done{color:var(--ink-2,#5B6576);} .ps-step.done i{background:#16A34A;border-color:#16A34A;animation:psPop .4s cubic-bezier(.2,1.4,.4,1);}
    @keyframes psTurn{to{transform:rotate(360deg)}}
    @keyframes psPop{0%{transform:scale(.55)}60%{transform:scale(1.1)}100%{transform:scale(1)}}
    .ps-card{position:relative;overflow:hidden;border:1px solid var(--line,#E4E8F0);border-radius:16px;background:var(--sheet,#fff);padding:16px 18px;box-shadow:0 14px 34px -22px rgba(20,24,60,.35);}
    .ps-card::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(100deg,transparent 25%,rgba(255,255,255,.7) 50%,transparent 75%);animation:psSweep 1.8s cubic-bezier(.4,0,.2,1) infinite;will-change:transform;}
    @keyframes psSweep{to{transform:translateX(100%)}}
    .ps-li{display:flex;align-items:center;gap:10px;}
    .ps-av{width:42px;height:42px;border-radius:50%;flex-shrink:0;object-fit:cover;background:linear-gradient(135deg,#3B6BEA,#6D3BDB);color:#fff;display:flex;align-items:center;justify-content:center;font:800 14px Inter,system-ui,sans-serif;}
    .ps-who b{display:block;font:700 14px/1.25 Inter,system-ui,sans-serif;color:var(--ink,#16202C);} .ps-who span{font:500 12px Inter,system-ui,sans-serif;color:var(--ink-3,#7A8496);}
    .ps-ln{height:10px;border-radius:6px;background:#ECEFF5;margin-top:12px;} .ps-ln.s{width:62%;} .ps-ln.m{width:84%;}
    .ps-fun{margin-left:auto;align-self:flex-start;padding:2px 9px;border-radius:999px;font:800 10.5px Inter,system-ui,sans-serif;letter-spacing:.06em;animation:psPop .45s cubic-bezier(.2,1.4,.4,1) both;}
    .ps-fun.tofu{background:#E0F2FE;color:#0369A1;} .ps-fun.mofu{background:#EDE9FE;color:#6D28D9;} .ps-fun.bofu{background:#DCFCE7;color:#15803D;}
    .ps-head{display:flex;align-items:center;gap:10px;padding:14px 18px 0;}
    .ps-in{animation:psIn .55s cubic-bezier(.2,.8,.2,1) both;}
    @keyframes psIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}
    .ps-hidden{display:none !important;}
    .ps-wait{opacity:0;pointer-events:none;}
    .ps-show{animation:psFade .4s ease both;} @keyframes psFade{from{opacity:0}to{opacity:1}}
    .ps-caret{display:inline-block;width:2px;height:1.05em;margin-left:1px;vertical-align:-2px;background:#6D3BDB;animation:psBlink 1s steps(1) infinite;}
    @keyframes psBlink{50%{opacity:0}}
    .ps-done{display:flex;align-items:center;gap:10px;margin-top:12px;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,#ECFDF5,#F0FDF4);border:1px solid #BBF7D0;font:600 14px/1.35 Inter,system-ui,sans-serif;color:#166534;}
    .ps-done i{width:26px;height:26px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-style:normal;color:#fff;background:linear-gradient(135deg,#16A34A,#0E9F6E);animation:psPop .45s cubic-bezier(.2,1.4,.4,1) both;}
    .ps-done small{display:block;font-weight:500;font-size:12.5px;color:#3F7A55;}
    @media (prefers-reduced-motion:reduce){.ps-card::after,.ps-step.now i,.ps-caret{animation:none}}`;
  function css() { if (document.getElementById('psCss')) return; const s = document.createElement('style'); s.id = 'psCss'; s.textContent = CSS; document.head.appendChild(s); }
  const avatar = (me) => me && me.photo ? `<img class="ps-av" src="${esc(me.photo)}" alt="" referrerpolicy="no-referrer">` : `<span class="ps-av">${esc(initials(me && me.name))}</span>`;

  // ---------- while the writer works ----------
  function wait(el, o) {
    css(); o = o || {};
    const bubble = el.querySelector('.wr-b, .bubble'); if (!bubble) return {stop() {}};
    const S = ['Reading your brand documents', 'Checking your story bank', 'Choosing the hook', 'Writing your post', 'Polishing every line'];
    bubble.className = bubble.className.replace(/\b(wr-think|thinking)\b/g, '').trim(); bubble.style.background = 'transparent'; bubble.style.boxShadow = 'none'; bubble.style.padding = '0'; bubble.style.border = '0';
    bubble.innerHTML = `<div class="ps-stage">
      <div class="ps-steps">${S.map((s, i) => `<div class="ps-step${i === 0 ? ' now' : ''}"><i></i>${s}</div>`).join('')}</div>
      <div class="ps-card" aria-hidden="true"><div class="ps-li">${avatar(o.me)}<div class="ps-who"><b>${esc((o.me && o.me.name) || 'You')}</b><span>Now · 🌐</span></div></div>
        <div class="ps-ln m" style="margin-top:16px"></div><div class="ps-ln"></div><div class="ps-ln s"></div><div class="ps-ln m"></div><div class="ps-ln s"></div></div></div>`;
    let i = 0;
    const t = setInterval(() => {
      if (i >= S.length - 1) return;                       // the last step stays busy until the answer is in
      const steps = bubble.querySelectorAll('.ps-step'); if (!steps.length) { clearInterval(t); return; }
      steps[i].className = 'ps-step done'; steps[i].firstElementChild.textContent = '✓'; i++; steps[i].className = 'ps-step now';
    }, 2400);
    return {stop() { clearInterval(t); }};
  }

  // ---------- when the answer is in ----------
  function reveal(msg, o) {
    o = o || {};
    const posts = [...msg.querySelectorAll(o.post)]; if (!posts.length || reduced) return false;
    css();
    const bubble = posts[0].parentElement, scroller = o.scroller;
    // loose text in the reply gets its own little block, so the line before each post can appear together with it
    [...bubble.childNodes].forEach((n) => { if (n.nodeType === 3 && n.data.trim()) { const sp = document.createElement('span'); sp.className = 'ps-txt'; sp.style.whiteSpace = 'pre-wrap'; n.replaceWith(sp); sp.appendChild(n); } });
    const near = () => !scroller || scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 220;
    const follow = () => { if (scroller && near()) scroller.scrollTop = scroller.scrollHeight; };
    const act = msg.querySelector('.wr-act, .m-act'); if (act) act.style.visibility = 'hidden';
    // the funnel label written just before each post (TOFU, MOFU or BOFU)
    const labelFor = (post) => {
      let txt = '', n = post.previousSibling;
      while (n && !(n.nodeType === 1 && n.matches && n.matches(o.post))) { txt = (n.textContent || '') + ' ' + txt; n = n.previousSibling; }
      const m = txt.match(/\b(TOFU|MOFU|BOFU)\b|top of (the )?funnel|middle of (the )?funnel|bottom of (the )?funnel/gi);
      if (!m) return '';
      const last = m[m.length - 1].toLowerCase();
      return /tofu|top/.test(last) ? 'tofu' : /mofu|middle/.test(last) ? 'mofu' : 'bofu';
    };
    // everything else in the reply fades in at once; the posts wait their turn
    const plan = posts.map((p) => {
      const textEl = p.querySelector(o.text), full = textEl ? textEl.textContent : '';
      const fun = labelFor(p);
      const head = document.createElement('div'); head.className = 'ps-head';
      head.innerHTML = `${avatar(o.me)}<div class="ps-who"><b>${esc((o.me && o.me.name) || 'You')}</b><span>Now · 🌐</span></div>${fun ? `<i class="ps-fun ${fun}" style="visibility:hidden">${fun.toUpperCase()}</i>` : ''}`;
      const ph = p.querySelector(o.head); (ph ? ph.after(head) : p.prepend(head));
      if (ph) ph.classList.add('ps-wait');
      const actions = p.querySelector(o.actions); if (actions) actions.classList.add('ps-wait');
      if (textEl) textEl.textContent = '';
      p.classList.add('ps-hidden');
      return {p, textEl, full, head, ph, actions, lead: []};
    });
    // the lines between two posts belong to the next post (like "Post 2 · MOFU")
    plan.forEach((x, i) => { if (!i) return; let n = x.p.previousElementSibling; while (n && n !== plan[i - 1].p) { x.lead.unshift(n); n = n.previousElementSibling; } x.lead.forEach((e) => e.classList.add('ps-hidden')); });
    const after = [...bubble.children].filter((c) => !posts.includes(c) && posts.length && (posts[posts.length - 1].compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING));
    after.forEach((c) => c.classList.add('ps-hidden'));
    let skip = false, finished = false;
    const finish = () => {
      if (finished) return; finished = true; skip = true;
      plan.forEach((x) => { x.lead.forEach((e) => e.classList.remove('ps-hidden')); x.p.classList.remove('ps-hidden'); if (x.textEl) x.textEl.textContent = x.full; x.p.querySelectorAll('.ps-caret').forEach((c) => c.remove());
        [x.ph, x.actions].forEach((e) => { if (e) { e.classList.remove('ps-wait'); e.classList.add('ps-show'); } }); const f = x.head.querySelector('.ps-fun'); if (f) f.style.visibility = ''; });
      after.forEach((c) => { c.classList.remove('ps-hidden'); c.classList.add('ps-show'); });
      if (!bubble.querySelector('.ps-done')) {
        const d = document.createElement('div'); d.className = 'ps-done ps-in';
        d.innerHTML = `<i>✓</i><div>${posts.length > 1 ? `Your ${posts.length} posts are ready` : 'Your post is ready'}<small>Copy it, tweak it, or put it straight into the composer.</small></div>`;
        (after.length ? after[after.length - 1] : posts[posts.length - 1]).after(d);
      }
      if (act) act.style.visibility = '';
      msg.removeEventListener('click', finish);
      if (o.onDone) o.onDone();
      follow();
    };
    msg.addEventListener('click', finish);
    // one post after the other: glide in, the label pops, the text writes itself, then the buttons appear
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const per = posts.length > 1 ? 2600 : 4200;           // how long one post takes to write itself
      for (const x of plan) {
        if (skip) return;
        x.lead.forEach((e) => { e.classList.remove('ps-hidden'); e.classList.add('ps-show'); });
        x.p.classList.remove('ps-hidden'); x.p.classList.add('ps-in'); follow();
        await sleep(380); if (skip) return;
        const f = x.head.querySelector('.ps-fun'); if (f) f.style.visibility = '';
        if (x.textEl && x.full) {
          const caret = document.createElement('span'); caret.className = 'ps-caret';
          const node = document.createTextNode(''); x.textEl.append(node, caret);
          const total = x.full.length, dur = Math.max(900, Math.min(per, total * 9)), t0 = performance.now();
          await new Promise((res) => { (function step(now) {
            if (skip) return res();
            const k = Math.min(1, (now - t0) / dur), want = Math.floor(total * (1 - Math.pow(1 - k, 1.25)));
            // whole words at a time, so it reads like someone typing
            let cut = want; if (cut < total) { const sp = x.full.indexOf(' ', cut); cut = sp < 0 ? total : sp; }
            if (node.data.length !== cut) { node.data = x.full.slice(0, cut); follow(); }
            if (k < 1) requestAnimationFrame(step); else res();
          })(t0); });
          caret.remove(); x.textEl.textContent = x.full;
        }
        [x.ph, x.actions].forEach((e) => { if (e) { e.classList.remove('ps-wait'); e.classList.add('ps-show'); } });
        follow(); await sleep(260);
      }
      if (!skip) { after.forEach((c) => { c.classList.remove('ps-hidden'); c.classList.add('ps-show'); }); await sleep(150); finish(); }
    })();
    return true;
  }
  window.ptStage = {wait, reveal};
})();
