/* voice-note.js: voice notes for PalaTrack's AI writer (the extension's AI writer and the website's Content writer).
 * A microphone button next to Send. While you talk: a timer, a sound wave and your words appearing live in the text box.
 * "Send" sends it as your message (marked 🎙), the microphone button again stops so you can edit first, ✕ cancels.
 * Speech is turned into text by the browser (Chrome, Edge, Safari). In the extension, Chrome needs the microphone
 * allowed once: the first time, a small PalaTrack page opens with an "Allow microphone" button.
 * Usage: window.ptVoiceNote.attach({box, input, sendBtn, send: (text) => …}) */
(function () {
  if (window.ptVoiceNote) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isExt = /^chrome-extension:/.test(location.protocol);

  const CSS = `
    .vn-mic{flex-shrink:0;width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:var(--ink-2,#5B6576);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,color .2s;margin-right:2px;}
    .vn-mic:hover{background:rgba(109,59,219,.10);color:#6D3BDB;}
    .vn-mic svg{width:19px;height:19px;}
    .vn-mic.on{background:#FEE2E2;color:#DC2626;}
    .vn-bar{display:flex;align-items:center;gap:12px;margin:0 0 8px;padding:9px 10px 9px 14px;border-radius:14px;background:linear-gradient(135deg,#1E2A78,#3B2F9E 55%,#5B36B8);color:#fff;
      box-shadow:0 14px 30px -16px rgba(30,20,100,.7);animation:vnIn .25s ease both;font:500 13px/1.3 Inter,system-ui,sans-serif;}
    @keyframes vnIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    .vn-dot{width:10px;height:10px;border-radius:50%;background:#F87171;flex-shrink:0;box-shadow:0 0 0 0 rgba(248,113,113,.6);animation:vnPulse 1.4s ease-out infinite;}
    @keyframes vnPulse{0%{box-shadow:0 0 0 0 rgba(248,113,113,.55)}100%{box-shadow:0 0 0 10px rgba(248,113,113,0)}}
    .vn-time{font-variant-numeric:tabular-nums;font-weight:700;min-width:38px;}
    .vn-wave{flex:1;min-width:60px;height:28px;}
    .vn-hint{opacity:.75;font-size:12px;white-space:nowrap;}
    .vn-x,.vn-go{flex-shrink:0;height:32px;border:0;border-radius:10px;cursor:pointer;font:700 12.5px Inter,system-ui,sans-serif;display:inline-flex;align-items:center;gap:6px;padding:0 12px;}
    .vn-x{background:rgba(255,255,255,.14);color:#fff;} .vn-x:hover{background:rgba(255,255,255,.22);}
    .vn-go{background:#fff;color:#2A2380;} .vn-go:hover{filter:brightness(.96);}
    .vn-note{margin:0 0 8px;padding:10px 14px;border-radius:12px;background:#FEF3C7;color:#92400E;font:500 13px/1.5 Inter,system-ui,sans-serif;}
    @media (max-width:520px){.vn-hint{display:none}}
    @media (prefers-reduced-motion:reduce){.vn-dot,.vn-bar{animation:none}}`;
  function css() { if (document.getElementById('vnCss')) return; const s = document.createElement('style'); s.id = 'vnCss'; s.textContent = CSS; document.head.appendChild(s); }

  const lang = () => {
    let l = ''; try { l = (localStorage.getItem('preferredLanguage') || '').slice(0, 2).toLowerCase(); } catch (e) { /* ignore */ }
    if (!l) l = (document.documentElement.lang || navigator.language || 'en').slice(0, 2).toLowerCase();
    return ({nl: 'nl-BE', fr: 'fr-BE', de: 'de-DE', es: 'es-ES', it: 'it-IT', pt: 'pt-PT'})[l] || 'en-US';
  };
  const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  const STOP = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2.5"/></svg>';

  function attach(o) {
    if (!o || !o.box || !o.input || o.box.querySelector('.vn-mic')) return;
    css();
    const mic = document.createElement('button');
    mic.type = 'button'; mic.className = 'vn-mic'; mic.title = 'Send a voice note'; mic.setAttribute('aria-label', 'Send a voice note'); mic.innerHTML = MIC;
    o.box.insertBefore(mic, o.sendBtn || null);
    let rec = null, stream = null, actx = null, raf = 0, tick = 0, start = 0, on = false, base = '', finalText = '', bar = null;

    const note = (html, ms) => { const n = document.createElement('div'); n.className = 'vn-note'; n.innerHTML = html; o.box.parentElement.insertBefore(n, o.box); if (ms) setTimeout(() => n.remove(), ms); return n; };
    const fit = () => { try { o.input.dispatchEvent(new Event('input', {bubbles: true})); } catch (e) { /* ignore */ } };

    async function micStream() {
      try { return await navigator.mediaDevices.getUserMedia({audio: true}); }
      catch (e) {
        if (isExt && typeof chrome !== 'undefined' && chrome.tabs) {   // Chrome can't ask inside the side panel: ask once on a page
          chrome.tabs.create({url: chrome.runtime.getURL('mic.html')});
          note('Allow the microphone on the page that just opened, then click the microphone here again.', 9000);
        } else note('PalaTrack can’t use your microphone. Allow it in your browser (the icon in the address bar) and try again.', 9000);
        return null;
      }
    }

    function drawWave(canvas) {
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
        const an = actx.createAnalyser(); an.fftSize = 256; actx.createMediaStreamSource(stream).connect(an);
        const buf = new Uint8Array(an.frequencyBinCount), g = canvas.getContext('2d'), dpr = window.devicePixelRatio || 1;
        const loop = () => {
          const w = canvas.clientWidth, h = canvas.clientHeight; if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
          an.getByteFrequencyData(buf); g.clearRect(0, 0, canvas.width, canvas.height);
          const bars = Math.max(12, Math.floor(w / 6)), bw = 3 * dpr;
          for (let i = 0; i < bars; i++) {
            const v = buf[Math.floor(i / bars * buf.length * 0.7)] / 255, bh = Math.max(3 * dpr, v * canvas.height * 0.95);
            g.fillStyle = `rgba(255,255,255,${0.35 + v * 0.65})`; const x = i * (canvas.width / bars), y = (canvas.height - bh) / 2;
            g.beginPath(); if (g.roundRect) g.roundRect(x, y, bw, bh, bw / 2); else g.rect(x, y, bw, bh); g.fill();
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) { /* no wave: recording still works */ }
    }

    async function begin() {
      if (!SR) { note('Voice notes need Chrome, Edge or Safari. Your browser can’t turn speech into text.', 8000); return; }
      stream = await micStream(); if (!stream) return;
      on = true; base = o.input.value ? o.input.value.replace(/\s*$/, ' ') : ''; finalText = '';
      mic.classList.add('on'); mic.innerHTML = STOP; mic.title = 'Stop (and edit before sending)';
      bar = document.createElement('div'); bar.className = 'vn-bar'; bar.setAttribute('role', 'status');
      bar.innerHTML = '<span class="vn-dot" aria-hidden="true"></span><span class="vn-time">0:00</span><canvas class="vn-wave" aria-hidden="true"></canvas><span class="vn-hint">Listening… just talk</span>' +
        '<button type="button" class="vn-x" title="Cancel">✕</button><button type="button" class="vn-go">Send ➤</button>';
      o.box.parentElement.insertBefore(bar, o.box);
      bar.querySelector('.vn-x').onclick = () => end('cancel');
      bar.querySelector('.vn-go').onclick = () => end('send');
      drawWave(bar.querySelector('.vn-wave'));
      start = Date.now(); tick = setInterval(() => { const s = Math.floor((Date.now() - start) / 1000); const t = bar && bar.querySelector('.vn-time'); if (t) t.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); if (s >= 600) end('stop'); }, 250);
      listen();
    }
    function listen() {
      rec = new SR(); rec.lang = lang(); rec.continuous = true; rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) finalText += r[0].transcript.trim() + ' '; else interim += r[0].transcript; }
        o.input.value = (base + finalText + interim).replace(/\s+/g, ' ').replace(/^\s/, ''); fit();
        o.input.scrollTop = o.input.scrollHeight;
      };
      rec.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { end('stop'); note('PalaTrack can’t use your microphone. Allow it and try again.', 8000); } };
      rec.onend = () => { if (on) { try { listen(); } catch (err) { /* stopped */ } } };   // Chrome stops after a pause: keep listening
      try { rec.start(); } catch (e) { /* already started */ }
    }
    function end(how) {
      if (!on) return; on = false;
      try { rec && (rec.onend = null, rec.stop()); } catch (e) { /* ignore */ }
      cancelAnimationFrame(raf); clearInterval(tick);
      try { stream && stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* ignore */ }
      try { actx && actx.close(); } catch (e) { /* ignore */ }
      if (bar) { bar.remove(); bar = null; }
      mic.classList.remove('on'); mic.innerHTML = MIC; mic.title = 'Send a voice note';
      if (how === 'cancel') { o.input.value = base.trim(); fit(); return; }
      // the last words can still arrive a moment after stopping
      setTimeout(() => {
        const text = o.input.value.trim();
        if (how === 'send') {
          if (!text) { note('PalaTrack didn’t hear anything. Try again a little closer to your microphone.', 6000); return; }
          o.input.value = ''; fit(); o.send('🎙 ' + text);
        } else o.input.focus();
      }, 350);
    }
    mic.addEventListener('click', () => { if (on) end('stop'); else begin(); });
  }
  window.ptVoiceNote = {attach};
})();
