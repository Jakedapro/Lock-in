/* ===== Lock In — app ===== */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  const { shuffle, pick } = X;
  const check = X.check;

  /* ---------------- storage ---------------- */
  const KEY = 'lockin.v2';
  let S = { p: {}, xp: 0, streak: { last: '', n: 0 }, custom: [], extra: {}, subj: 'geo' };
  try { const raw = localStorage.getItem(KEY) || localStorage.getItem('lockin.v1'); if (raw) { const o = JSON.parse(raw); S = Object.assign(S, o); S.custom = (S.custom || []).map(d => ({ subject: 'other', ...d })); } } catch (e) { }
  S = Logic.defaults(S);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  const today = () => new Date().toLocaleDateString('en-CA');
  function bumpStreak() { const t = today(); if (S.streak.last === t) return; const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA'); S.streak.n = S.streak.last === y ? S.streak.n + 1 : 1; S.streak.last = t; }
  const prog = (id) => (S.p[id] ||= { att: 0, cor: 0, tags: {}, known: {} });
  function record(deckId, tags, got, out) {
    if (!deckId || !out) return;
    const p = prog(deckId); p.att += out; p.cor += got;
    (tags && tags.length ? tags : ['all']).forEach(t => { const r = (p.tags[t] ||= [0, 0]); r[0] += out; r[1] += got; });
    S.xp += got * 10 + 2; bumpStreak(); save(); renderStats();
  }
  const mastery = (id) => { const p = S.p[id]; if (!p || !p.att) return 0; return Math.round(p.cor / p.att * Math.min(1, p.att / 30) * 100); };
  function renderStats() { $('#xp').textContent = S.xp; $('#streak').textContent = S.streak.n; }

  /* ---------------- subjects & decks ---------------- */
  const SUBJ = [
    { id: 'geo', name: 'Geography', hue: 'green', exam: new Date(2026, 9, 26, 9, 0), when: 'Mon 26 Oct · P1–2', format: '45 minutes · 30 multiple choice (25 on geographical tools & skills, 5 on Water in the World) + 3 short answers.', mock: 'geo' },
    { id: 'maths', name: 'Maths', hue: 'gold', exam: new Date(2026, 9, 29, 11, 0), when: 'Thu 29 Oct · P3–4', format: 'Chapters 8, 9, 10 and 12 · multi-part questions like the Test Yourself pages.', mock: 'maths' },
    { id: 'hist', name: 'History', hue: 'coral', exam: null, when: '', format: 'Upload your History notes or textbook pages and the AI builds notes, flashcards and exam questions.' },
  ];
  const BUILTIN = [
    G.mapDeck, G.waterDeck,
    ...M.DECKS.map(d => ({ ...d, subject: 'maths', bank: X.BANK[d.id], drills: M.GEN[d.gen] })),
    { ...X.ch12, subject: 'maths', bank: X.BANK.sim },
  ].map(d => ({ ...d, subject: d.subject || 'maths', bank: typeof d.bank === 'string' ? G.BANK[d.bank] : d.bank }));
  const extraQ = (id) => (S.extra[id] ||= { concepts: [], short: [] });
  const allDecks = () => [...BUILTIN, ...S.custom];
  const getDeck = (id) => allDecks().find(d => d.id === id);
  const subjects = () => {
    const list = SUBJ.slice();
    S.custom.forEach(d => { if (!list.some(s => s.id === d.subject)) list.push({ id: d.subject, name: d.subjectName || d.subject, hue: 'lilac', exam: null, when: '', format: 'Your own subject.' }); });
    return list;
  };
  const getSubj = (id) => subjects().find(s => s.id === id) || SUBJ[0];
  const decksOf = (sid) => allDecks().filter(d => d.subject === sid);
  const conceptsOf = (d) => [...(d.concepts || []), ...extraQ(d.id).concepts];
  const shortOf = (d) => [...(d.short || []), ...extraQ(d.id).short];
  const hue = (d) => 'c-' + (d.hue || 'lilac');

  /* ---------------- toast + fx ---------------- */
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2800); }
  const fx = $('#fx'), fctx = fx.getContext('2d'); let parts = [], fxOn = false;
  const sizeFx = () => { fx.width = innerWidth * devicePixelRatio; fx.height = innerHeight * devicePixelRatio; };
  sizeFx(); addEventListener('resize', sizeFx);
  function burst(x, y, n = 70) {
    if (reduce) return;
    const cols = ['#ff6b5a', '#45d6e6', '#ffc53d', '#a99bff', '#3ddc97', '#ff4f9a', '#eef0ff'];
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, r: 3 + Math.random() * 5, c: pick(cols), life: 1, rot: Math.random() * 6, vr: (Math.random() - .5) * .4, sq: Math.random() < .5 }); }
    if (!fxOn) { fxOn = true; requestAnimationFrame(tickFx); }
  }
  function tickFx() {
    const d = devicePixelRatio; fctx.clearRect(0, 0, fx.width, fx.height); parts = parts.filter(p => p.life > 0);
    for (const p of parts) { p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= .013; fctx.save(); fctx.globalAlpha = Math.max(0, p.life); fctx.fillStyle = p.c; fctx.translate(p.x * d, p.y * d); fctx.rotate(p.rot); if (p.sq) fctx.fillRect(-p.r * d, -p.r * d * .5, p.r * 2 * d, p.r * d); else { fctx.beginPath(); fctx.arc(0, 0, p.r * d * .7, 0, 7); fctx.fill(); } fctx.restore(); }
    if (parts.length) requestAnimationFrame(tickFx); else { fxOn = false; fctx.clearRect(0, 0, fx.width, fx.height); }
  }
  function xpPop(el, txt) {
    if (reduce || !el) return; const r = el.getBoundingClientRect();
    const s = document.createElement('div'); s.className = 'xp-pop'; s.textContent = txt; s.style.left = r.left + Math.min(r.width / 2, 120) + 'px'; s.style.top = r.top - 6 + 'px';
    document.body.appendChild(s);
    if (hasGsap) gsap.to(s, { y: -60, opacity: 0, duration: 1, ease: 'power2.out', onComplete: () => s.remove() }); else setTimeout(() => s.remove(), 800);
  }

  /* ---------------- AI (runs on the viewer's own Claude account) ---------------- */
  const AI = {
    fn: null, state: 'checking', imgMax: 0, reason: '',
    async init() {
      try {
        if (!window.claude || typeof window.claude.use !== 'function') throw 0;
        const fn = await window.claude.use('sample');
        if (!fn) throw 0;
        this.fn = fn; this.state = 'ready';
        const lim = await fn.limits().catch(() => null); this.imgMax = lim?.images?.maxCount || 0;
      } catch (e) { this.state = 'off'; this.reason = 'AI features work when this page is opened from its Claude link while signed in to Claude.'; }
      renderAiNote(); if (cur && !ov.hidden) refreshOverlay();
    },
    msg(e) {
      const c = e && e.code;
      if (c === 'not_granted') { this.state = 'off'; this.reason = 'AI is turned off for this page because it wasn\'t allowed. Reload the page to be asked again.'; renderAiNote(); return 'You didn\'t allow AI for this page. Reload to be asked again.'; }
      if (c === 'rate_limited') return 'You\'ve hit your Claude usage limit for now. Try again a bit later.';
      if (c === 'session_expired') return 'Your Claude sign-in expired. Sign in again, then retry.';
      if (c === 'sampling_disabled') { this.state = 'off'; this.reason = 'Claude AI isn\'t available on this account.'; renderAiNote(); return this.reason; }
      if (c === 'images_unavailable' || c === 'image_rejected') return 'Claude couldn\'t read those images here. Try pasting the text, or a smaller PDF.';
      if (c === 'prompt_too_large') return 'That was too much at once. Try fewer pages.';
      if (c === 'invalid_json') return 'The AI\'s answer came back messy. Try again.';
      if (c === 'cancelled') return 'Stopped.';
      return 'The AI had a problem. Try again in a moment.';
    },
  };
  const aiReady = () => AI.state === 'ready' && !!AI.fn;
  function renderAiNote() {
    const n = $('#aiNote'), t = $('#aiNoteT'); if (!n) return;
    if (aiReady()) { n.className = 'ai-note ok'; t.textContent = 'AI is on. It runs on your own Claude account (Claude asks you to allow it the first time). Scanned pages and photos work.'; }
    else if (AI.state === 'checking') { n.className = 'ai-note'; t.textContent = 'Checking whether AI is available…'; }
    else { n.className = 'ai-note'; t.textContent = AI.reason + ' Without AI, quick mode still makes flashcards from notes written as "term: meaning".'; }
  }

  /* ---------------- countdown, hero board, ticker, week ---------------- */
  const pad = (n) => String(n).padStart(2, '0');
  const nextExam = () => SUBJ.filter(s => s.exam && s.exam > Date.now()).sort((a, b) => a.exam - b.exam)[0];
  const daysTo = (d) => Math.max(0, Math.ceil((d - Date.now()) / 864e5));
  function renderNext() {
    const s = nextExam(), box = $('#next');
    if (!s) { box.innerHTML = '<div class="lab">Exams are done. Go touch grass.</div>'; $('#heroCtas').innerHTML = ''; return; }
    box.className = 'next ' + 'c-' + s.hue;
    box.innerHTML = `<div class="lab">Next up: <b>${esc(s.name)}</b> · ${esc(s.when)}</div>
      <div class="count">${['d', 'h', 'm', 's'].map((k, i) => `<div class="cell"><div class="num" id="cd-${k}">--</div><div class="unit">${['days', 'hrs', 'min', 'sec'][i]}</div></div>`).join('')}</div>`;
    $('#heroCtas').innerHTML = `<button class="btn btn-hot" type="button" data-act="mock" data-s="${s.id}">Start ${esc(s.name)} practice exam →</button><button class="btn btn-ghost" type="button" data-act="cards" data-s="${s.id}">Flashcards</button>`;
    tickCount();
  }
  function tickCount() {
    const s = nextExam(); if (!s || !$('#cd-d')) return;
    let ms = s.exam - Date.now(); if (ms <= 0) { renderNext(); return; }
    const d = Math.floor(ms / 864e5); ms -= d * 864e5; const h = Math.floor(ms / 36e5); ms -= h * 36e5; const m = Math.floor(ms / 6e4); const sec = Math.floor((ms - m * 6e4) / 1e3);
    $('#cd-d').textContent = d; $('#cd-h').textContent = pad(h); $('#cd-m').textContent = pad(m); $('#cd-s').textContent = pad(sec);
  }
  setInterval(tickCount, 1000);
  function weakest() {
    let best = null;
    allDecks().forEach(d => {
      const p = S.p[d.id]; (d.sections || []).forEach(sec => {
        const t = p?.tags?.[sec.code]; if (t && t[0] >= 3) { const acc = t[1] / t[0]; if (!best || acc < best.acc) best = { d, sec, acc }; }
      });
    });
    if (best && best.acc < 0.85) return best;
    const ns = nextExam() || SUBJ[0];
    for (const d of decksOf(ns.id)) for (const sec of (d.sections || [])) { if (!S.p[d.id]?.tags?.[sec.code] && hasPracticeFor(d, sec.code)) return { d, sec, acc: null }; }
    return best;
  }
  function renderBoard() {
    const rows = subjects().map(s => {
      const ds = decksOf(s.id); if (!ds.length) return '';
      return `<div class="brow"><div class="nm">${esc(s.name)}<small>${s.exam ? (s.exam > Date.now() ? daysTo(s.exam) + ' days left' : 'done') : 'no exam date'}</small></div>
        <div class="rings">${ds.map(d => { const m = mastery(d.id); return `<div class="rg"><button class="ring ${hue(d)}" type="button" style="--v:0" data-v="${m}" data-open="${esc(d.id)}" title="${esc(d.title)}: ${m}% mastered" aria-label="${esc(d.title)}, ${m}% mastered"><span>${m}%</span></button><small>${esc(ringLabel(d))}</small></div>`; }).join('')}</div></div>`;
    }).join('');
    const w = weakest();
    $('#board').innerHTML = `<div class="row" style="justify-content:space-between"><h2>Exam readiness</h2><span class="eyebrow">tap a ring</span></div><div class="bsub">${rows}</div>
      <div class="row">${SUBJ.filter(s => s.mock).map(s => `<button class="btn btn-sm btn-ghost" type="button" data-act="mock" data-s="${s.id}">${esc(s.name)} practice exam</button>`).join('')}</div>
      ${w ? `<div class="weak"><div class="t">${w.acc == null ? 'Not started yet' : 'Weakest topic · ' + Math.round(w.acc * 100) + '%'}<b>${esc(w.sec.code)} ${esc(w.sec.name)}</b></div><button class="btn btn-sm btn-acc ${hue(w.d)}" type="button" data-act="weak" data-d="${esc(w.d.id)}" data-t="${esc(w.sec.code)}">Practise it →</button></div>` : ''}`;
    $$('.ring[data-v]', $('#board')).forEach(r => {
      const v = +r.dataset.v;
      if (hasGsap && !reduce) { const o = { v: 0 }; gsap.to(o, { v, duration: 1.2, ease: 'power3.out', delay: .3, onUpdate: () => r.style.setProperty('--v', o.v) }); } else r.style.setProperty('--v', v);
    });
  }
  const ringLabel = (d) => ({ maps: 'Maps', water: 'Water' }[d.id] || (d.custom ? d.title.split(' ')[0] : d.chapter || d.title)).slice(0, 9);
  function renderTicker() {
    const bits = ['<b>BOLTS</b> Border · Orientation · Legend · Title · Scale', '<b>AR</b> = easting then northing, bottom-left corner', '<b>GR</b> 6 figures: across, then up', '<b>P(not A)</b> = 1 − P(A)', '<b>Speed</b> = distance ÷ time', '<b>km/h → m/s</b> ÷ 3.6', '<b>Water cycle</b> evaporation → condensation → precipitation', '<b>SA cylinder</b> = 2πr² + 2πrh', '<b>Scale factor</b> = image ÷ original', '<b>2.5%</b> of Earth\'s water is fresh', '<b>Tully</b> wettest · <b>Kati Thanda</b> driest', '<b>Close contours</b> = steep slope'];
    $('#ticker').innerHTML = [...bits, ...bits].map(b => `<span>${b}</span>`).join('');
  }
  const WEEK = [
    ['Mon', 26, [['P1–2', 'Geography', 'geo'], ['P3–4', 'Science'], ['P5–6', 'D&T / Visual Arts']]],
    ['Tue', 27, [['P1–2', 'Supervised study'], ['P3–4', 'Languages'], ['P5–6', 'Sport']]],
    ['Wed', 28, [['9:15', 'Late start'], ['P3', 'SAGE prep meeting'], ['P5–6', 'English']]],
    ['Thu', 29, [['P1–2', 'Chinese / Spanish'], ['P3–4', 'Mathematics', 'maths'], ['P5–6', 'Science activity']]],
    ['Fri', 30, [['P1–2', 'Music']]],
  ];
  function renderWeek() {
    $('#weekGrid').innerHTML = WEEK.map(([d, n, items]) => {
      const hot = items.find(i => i[2]); const past = new Date(2026, 9, n, 23, 59) < new Date(); const hs = hot && SUBJ.find(s => s.id === hot[2]);
      return `<div class="day ${hot ? 'hot c-' + hs.hue : ''} ${past ? 'past' : ''}"><div class="d">${d} · Oct</div><div class="dn">${n}</div><ul>${items.map(([p, s, k]) => `<li class="${k ? 'hot' : ''}"><span class="p">${p}</span><span>${esc(s)}</span></li>`).join('')}</ul></div>`;
    }).join('');
  }

  /* ---------------- subject tabs + panel ---------------- */
  function renderTabs() {
    $('#subtabs').innerHTML = subjects().map(s => `<button class="subtab" role="tab" type="button" data-subj="${esc(s.id)}" aria-selected="${S.subj === s.id}">${esc(s.name)}</button>`).join('');
  }
  $('#subtabs').addEventListener('click', e => { const b = e.target.closest('[data-subj]'); if (!b) return; S.subj = b.dataset.subj; save(); renderTabs(); renderSubject(); $('#subject').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
  function renderSubject() {
    const s = getSubj(S.subj), ds = decksOf(s.id), el = $('#subject');
    el.className = 'wrap section c-' + s.hue;
    const counts = (d) => `${d.cards?.length || 0} cards · ${(d.bank ? '∞' : (conceptsOf(d).length + shortOf(d).length))} questions`;
    el.innerHTML = `<div class="subj-head"><div><div class="eyebrow">${s.exam ? 'Exam · ' + esc(s.when) : 'Subject'}</div><h2>${esc(s.name)}<span>.</span></h2><div class="subj-meta">${esc(s.format)}</div></div>
      <div class="subj-actions">${s.mock ? `<button class="btn btn-acc" type="button" data-act="mock" data-s="${s.id}">Practice exam${s.mock === 'geo' ? ' (45 min)' : ''}</button>` : ''}${ds.length ? `<button class="btn btn-ghost" type="button" data-act="cards" data-s="${esc(s.id)}">All flashcards</button>` : ''}<button class="btn btn-ghost" type="button" data-act="upload" data-s="${esc(s.id)}">+ Upload</button></div></div>
      ${ds.length ? `<div class="decks">${ds.map(d => { const m = mastery(d.id); return `<button class="deck ${hue(d)}" type="button" data-open="${esc(d.id)}">
          <div class="top"><span class="chip">${esc(d.chapter || 'Your deck')}</span><span class="lvl-chip lvl-${levelOf(d)}" title="Your level: ${LNAME[levelOf(d)]}">${levelOf(d)}</span>${d.custom ? `<span class="chip" style="color:var(--muted)">${d.ai ? 'AI' : 'Quick'}</span>` : ''}</div>
          <h3>${esc(d.title)}</h3><p>${esc(d.blurb || '')}</p>
          <div class="foot"><span class="counts">${counts(d)}</span><div class="ring" style="--v:${m}"><span>${m}%</span></div></div></button>`; }).join('')}</div>`
        : `<div class="empty"><h3>No ${esc(s.name)} decks yet</h3><p>Upload your class notes or textbook pages (even scanned ones) and it builds notes, flashcards and exam questions.</p><button class="btn btn-hot" type="button" data-act="upload" data-s="${esc(s.id)}" style="margin-top:12px">Upload ${esc(s.name)} notes</button></div>`}`;
    tilt(el);
  }
  function tilt(root) {
    if (reduce || matchMedia('(hover: none)').matches) return;
    $$('.deck', root).forEach(c => {
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-3px)`; });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o && !o.closest('#ov')) { openDeck(o.dataset.open); return; }
    const a = e.target.closest('[data-act]'); if (!a || a.closest('#ov')) return;
    const act = a.dataset.act;
    if (act === 'mock') openMock(a.dataset.s);
    if (act === 'cards') openSubjectCards(a.dataset.s);
    if (act === 'weak') openDeck(a.dataset.d, 'practice', a.dataset.t);
    if (act === 'upload') { upSubj = a.dataset.s; renderUpSubjects(); $('#upload').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  });

  /* ---------------- overlay shell ---------------- */
  const ov = $('#ov');
  let cur = null; // {kind:'deck'|'mock'|'cards', ...}
  function showOv() { ov.hidden = false; document.body.style.overflow = 'hidden'; ov.scrollTop = 0; if (hasGsap && !reduce) gsap.fromTo(ov, { y: 24, opacity: .5 }, { y: 0, opacity: 1, duration: .3, ease: 'power3.out' }); }
  function closeOv() { if (cur?.timer) clearInterval(cur.timer); ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = ''; cur = null; renderBoard(); renderSubject(); }
  addEventListener('keydown', e => { if (e.key === 'Escape' && !ov.hidden && !(cur && cur.kind === 'mock' && !cur.done)) closeOv(); });
  function ovFrame(title, acc, tabs, extraHead = '') {
    ov.className = 'ov ' + acc;
    ov.innerHTML = `<div class="ov-head"><div class="wrap"><button class="back" id="ovBack" type="button" aria-label="Back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button><div class="ov-title">${esc(title)}</div>${extraHead}</div>
      ${tabs ? `<div class="wrap tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab" type="button" role="tab" data-tab="${k}" aria-selected="${cur.tab === k}">${l}</button>`).join('')}</div>` : ''}</div><div class="wrap ov-body" id="ovBody"></div>`;
    $('#ovBack').onclick = () => {
      if (cur?.kind === 'mock' && !cur.done && !cur.sure) { cur.sure = true; $('#ovBack').style.borderColor = 'var(--bad)'; toast('Tap back again to quit the exam (it won\'t be marked)'); setTimeout(() => { if (cur) cur.sure = false; }, 3000); return; }
      closeOv();
    };
    $$('.tab', ov).forEach(b => b.onclick = () => { cur.tab = b.dataset.tab; refreshOverlay(); });
    return $('#ovBody');
  }
  function refreshOverlay() { if (!cur) return; if (cur.kind === 'deck') renderDeckOv(); }

  /* ---------------- deck view ---------------- */
  function openDeck(id, tab, filter) { const d = getDeck(id); if (!d) return; cur = { kind: 'deck', deck: d, tab: tab || 'learn', filter: filter || 'all', level: 'auto' }; renderDeckOv(); showOv(); }
  function deckTabs(d) {
    const t = [['learn', d.custom ? 'Notes' : 'Learn'], ['cards', 'Flashcards'], ['practice', 'Exam questions']];
    if (d.drills) t.push(['drills', 'Quick drills']);
    t.push(['ask', 'Ask AI']); return t;
  }
  function renderDeckOv() {
    const d = cur.deck;
    const body = ovFrame(d.title, hue(d), deckTabs(d), d.custom ? `<button class="btn btn-ghost btn-sm" id="shareBtn" type="button">Share code</button><button class="btn btn-ghost btn-sm" id="delBtn" type="button">Delete</button>` : '');
    if (d.custom) {
      $('#shareBtn').onclick = () => copyText(shareCode(d), 'Share code copied. Send it to your mates.', body);
      const del = $('#delBtn'); del.onclick = () => {
        if (del.dataset.sure) { S.custom = S.custom.filter(x => x.id !== d.id); delete S.p[d.id]; save(); closeOv(); renderTabs(); toast('Deck deleted'); }
        else { del.dataset.sure = 1; del.textContent = 'Tap again to delete'; del.style.borderColor = 'var(--bad)'; setTimeout(() => { if (del.isConnected) { delete del.dataset.sure; del.textContent = 'Delete'; del.style.borderColor = ''; } }, 3000); }
      };
    }
    ({ learn: viewLearn, cards: (b) => viewCards(b, deckCards(d)), practice: viewPractice, drills: viewDrills, ask: viewAsk })[cur.tab](body, d);
  }
  const deckCards = (d) => (d.cards || []).map((c, i) => ({ ...c, deckId: d.id, idx: i, deckTitle: d.title }));

  function viewLearn(el, d) {
    const secs = d.sections || [];
    if (!secs.length) { el.innerHTML = '<p class="note">No notes in this deck yet.</p>'; return; }
    el.innerHTML = secs.map(s => `<div class="sec-card ${s.ex ? '' : 'solo'}"><div>
        <h3>${s.code ? `<span class="code">${esc(s.code)}</span>` : ''}${esc(s.name)}${s.ext ? '<span class="bonus">YEAR 9 EXTENSION</span>' : ''}</h3>
        <ul>${(s.notes || []).map(n => `<li>${esc(n)}</li>`).join('')}</ul>
        ${hasPracticeFor(d, s.code) ? `<button class="btn btn-ghost btn-sm" type="button" style="margin-top:12px" data-prac="${esc(s.code)}">Exam questions on this →</button>` : ''}
      </div>${s.ex ? `<div class="worked"><div class="eyebrow" style="margin-bottom:6px">Worked example</div><div class="wq">${esc(s.ex[0])}</div><ol>${s.ex.slice(1).map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>` : ''}</div>`).join('');
    $$('[data-prac]', el).forEach(b => b.onclick = () => { cur.tab = 'practice'; cur.filter = b.dataset.prac; renderDeckOv(); });
  }

  /* ---------------- flashcards (swipe right = got it, left = still learning) ---------------- */
  function openSubjectCards(sid) {
    const s = getSubj(sid); const cards = decksOf(sid).flatMap(deckCards);
    cur = { kind: 'cards', tab: null }; const body = ovFrame(`${s.name} · all flashcards`, 'c-' + s.hue, null); viewCards(body, cards); showOv();
  }
  function viewCards(el, cards) {
    if (!cards.length) { el.innerHTML = '<p class="note">No flashcards here yet.</p>'; return; }
    const known = (c) => !!S.p[c.deckId]?.known?.[c.idx];
    let queue = shuffle(cards.filter(c => !known(c))); let total = cards.length;
    if (!queue.length) queue = shuffle(cards.slice());
    el.innerHTML = `<div class="fc-wrap"><div class="fc-bar"><i id="fcBar"></i></div>
      <div class="fc" id="fc" tabindex="0" role="button" aria-label="Flashcard. Press space to flip."><div class="fc-in"><div class="fc-face fc-front"><span class="deckname" id="fcDeck"></span><div class="t" id="fcQ"></div><div class="hint">tap to flip · swipe → got it · ← still learning</div></div><div class="fc-face fc-back"><div id="fcA"></div></div></div></div>
      <div class="fc-ctrl"><button class="btn btn-bad" id="fcAgain" type="button">← Still learning</button><button class="btn btn-good" id="fcGot" type="button">Got it →</button></div>
      <div class="fc-sub"><span class="mono" style="font-size:13px;color:var(--muted)"><b id="fcK" style="color:var(--chalk)"></b> of ${total} known · <span id="fcLeft"></span> left this round</span><span class="row"><button class="btn btn-ghost btn-sm" id="fcShuf" type="button">Shuffle</button><button class="btn btn-ghost btn-sm" id="fcReset" type="button">Reset</button></span></div></div>`;
    const fc = $('#fc', el);
    const stats = () => { const k = cards.filter(known).length; $('#fcK', el).textContent = k; $('#fcBar', el).style.width = (k / total * 100) + '%'; $('#fcLeft', el).textContent = queue.length; };
    const show = (dir = 1) => {
      stats();
      if (!queue.length) { fc.outerHTML = `<div class="empty" style="height:320px;display:grid;place-content:center"><h3>All cards known</h3><p>Hit Reset to go again, or try the exam questions.</p></div>`; $('.fc-ctrl', el).hidden = true; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 150, 120); return; }
      const c = queue[0]; fc.classList.remove('flip'); fc.style.transform = '';
      $('#fcQ', el).textContent = c.q; $('#fcA', el).textContent = c.a; $('#fcDeck', el).textContent = c.deckTitle || '';
      if (hasGsap && !reduce) gsap.fromTo(fc, { x: 50 * dir, opacity: .2, rotate: 3 * dir }, { x: 0, opacity: 1, rotate: 0, duration: .35, ease: 'back.out(1.6)' });
    };
    const got = () => { const c = queue.shift(); if (!c) return; prog(c.deckId).known[c.idx] = 1; S.xp += 3; bumpStreak(); save(); renderStats(); xpPop($('#fcGot', el), '+3'); show(1); };
    const again = () => { const c = queue.shift(); if (!c) return; if (S.p[c.deckId]) delete S.p[c.deckId].known[c.idx]; save(); queue.splice(Math.min(queue.length, 3), 0, c); show(-1); };
    $('#fcGot', el).onclick = got; $('#fcAgain', el).onclick = again;
    $('#fcShuf', el).onclick = () => { queue = shuffle(queue); show(); toast('Shuffled'); };
    $('#fcReset', el).onclick = () => { cards.forEach(c => { if (S.p[c.deckId]) delete S.p[c.deckId].known[c.idx]; }); save(); viewCards(el, cards); };
    let sx = null, moved = false;
    fc.addEventListener('pointerdown', e => { sx = e.clientX; moved = false; fc.setPointerCapture?.(e.pointerId); });
    fc.addEventListener('pointermove', e => { if (sx == null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 6) moved = true; fc.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`; });
    fc.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (dx > 90) got(); else if (dx < -90) again(); else { fc.style.transform = ''; if (!moved) fc.classList.toggle('flip'); } });
    fc.addEventListener('pointercancel', () => { sx = null; fc.style.transform = ''; });
    fc.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fc.classList.toggle('flip'); } if (e.key === 'ArrowRight') got(); if (e.key === 'ArrowLeft') again(); });
    show();
  }

  /* ---------------- questions: building ---------------- */
  const mcqQ = (c, d) => { const idx = shuffle(c.options.map((_, i) => i)); const ch = idx.map(i => c.options[i]); return { stem: '', level: 'F', gen: null, tags: c.tags || [], deckId: d.id, deckTitle: d.title, parts: [{ label: '', q: c.q, type: 'choice', choices: ch, value: idx.indexOf(c.answer), show: c.options[c.answer], steps: c.why ? [c.why] : [], marks: 1 }] }; };
  const shortQ = (s, d) => ({ stem: '', level: 'C', gen: null, tags: s.tags || [], deckId: d.id, deckTitle: d.title, parts: [{ label: '', q: s.q, type: 'short', marks: s.marks || 3, criteria: s.criteria || [], model: s.model || '', steps: [] }] });
  const bankQ = (fn, d, level) => ({ ...fn(level), deckId: d.id, deckTitle: d.title, gen: fn.name });
  // What each bank generator can make: levels and topic tags (sampled once per generator).
  const genInfo = new Map();
  function infoOf(fn) {
    if (!genInfo.has(fn)) {
      const levels = new Set(), tags = new Set();
      Logic.LEVELS.forEach(L => { for (let i = 0; i < 3; i++) { try { const q = fn(L); levels.add(q.level); (q.tags || []).forEach(t => tags.add(t)); } catch (e) { } } });
      genInfo.set(fn, { levels, tags });
    }
    return genInfo.get(fn);
  }
  function hasPracticeFor(d, code) {
    if (!code) return false;
    if (shortOf(d).some(s => (s.tags || []).includes(code))) return true;
    return !!d.bank && d.bank.some(fn => infoOf(fn).tags.has(code));
  }
  const bankFor = (d, filter, L) => (d.bank || []).filter(fn => { const i = infoOf(fn); return i.levels.has(L) && (filter === 'all' || i.tags.has(filter)); });
  function levelsFor(d, filter = 'all') {
    const cs = conceptsOf(d), ss = shortOf(d).filter(s => filter === 'all' || (s.tags || []).includes(filter));
    return Logic.LEVELS.filter(L => bankFor(d, filter, L).length || (L === 'F' && cs.length && filter === 'all') || (L === 'C' && ss.length));
  }
  const deckLevels = (d) => { const l = levelsFor(d); return l.length ? l : ['F']; };
  const queues = {};
  const LNAME = { F: 'Foundation', S: 'Standard', C: 'Complex' };
  function nextQuestion(d, filter = 'all', level = 'F') {
    const avail = levelsFor(d, filter); if (!avail.length) return null;
    const use = Logic.nearestLevel(level, avail);
    const cs = conceptsOf(d), ss = shortOf(d).filter(s => filter === 'all' || (s.tags || []).includes(filter));
    const fns = bankFor(d, filter, use);
    const opts = [];
    if (fns.length) opts.push(['bank', 6]);
    if (use === 'F' && cs.length && filter === 'all') opts.push(['mcq', fns.length ? 2 : 6]);
    if (use === 'C' && ss.length) opts.push(['short', fns.length ? 1.2 : 2]);
    let r = Math.random() * opts.reduce((a, o) => a + o[1], 0), kind = opts[0]?.[0];
    for (const [k, w] of opts) { if ((r -= w) < 0) { kind = k; break; } }
    let q = null;
    if (kind === 'bank') { for (let i = 0; i < 40 && !q; i++) { const c = bankQ(pick(fns), d, use); if (c.level === use && (filter === 'all' || (c.tags || []).includes(filter))) q = c; } }
    if (!q && kind !== 'mcq' && use === 'C' && ss.length) { const k = d.id + ':s:' + filter; if (!queues[k]?.length) queues[k] = shuffle(ss); q = shortQ(queues[k].pop(), d); }
    if (!q && cs.length && filter === 'all') { const k = d.id + ':m'; if (!queues[k]?.length) queues[k] = shuffle(cs); q = mcqQ(queues[k].pop(), d); }
    if (q && use !== level) q.levelNote = `No ${LNAME[level]} questions here, showing ${LNAME[use]}`;
    return q;
  }

  /* ---------------- questions: rendering & marking ---------------- */
  // mode 'practice': each part is checked straight away. mode 'exam': answers are held until finishExam().
  function renderCard(q, { mode = 'practice', num = null, onPart } = {}) {
    const card = document.createElement('div'); card.className = 'qcard';
    const total = q.parts.reduce((a, p) => a + (p.marks || 1), 0);
    card.innerHTML = `<div class="qhead">${num != null ? `<span class="qn">Q${num}</span>` : ''}${q.level ? `<span class="lvl lvl-${q.level}">${{ F: 'FOUNDATION', S: 'STANDARD', C: 'COMPLEX' }[q.level]}</span>` : ''}${q.ext ? '<span class="bonus">Y9 EXT</span>' : ''}<span>${esc((q.tags || []).join(' · '))}${q.deckTitle && mode === 'exam' ? '' : ''}</span><span class="mk">${total} mark${total > 1 ? 's' : ''}</span></div>
      ${q.stem ? `<div class="qstem">${esc(q.stem)}</div>` : ''}${V.render(q.visual)}<div class="parts"></div>`;
    const host = $('.parts', card);
    q.parts.forEach(p => host.appendChild(renderPart(p, q, mode, onPart)));
    return card;
  }
  function renderPart(p, q, mode, onPart) {
    const el = document.createElement('div'); el.className = 'part' + (p.label ? '' : ' nolabel');
    p._got = null; p._ans = null; p._done = false;
    const mk = (p.marks || 1) > 1 ? `<span class="pm">[${p.marks} marks]</span>` : '';
    let body = '';
    if (p.type === 'choice') body = `<div class="choices">${p.choices.map((c, i) => `<button class="choice" type="button" data-i="${i}">${esc(c)}</button>`).join('')}</div>`;
    else if (p.type === 'short') body = `<textarea class="field sa" placeholder="Write your answer like you would in the exam…" aria-label="Your answer"></textarea>${mode === 'practice' ? `<div class="row">${aiReady() ? '<button class="btn btn-hot btn-sm" type="button" data-k="ai">Mark it with AI</button>' : ''}<button class="btn btn-ghost btn-sm" type="button" data-k="self">${aiReady() ? 'Mark it myself' : 'Show marking guide'}</button></div>` : ''}`;
    else body = `<div class="ans"><input class="field" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="${p.type === 'ratio' || p.type === 'pm' ? 'text' : 'decimal'}" placeholder="${p.type === 'ratio' ? 'e.g. 3:4' : p.type === 'pm' ? 'e.g. ±5' : p.type === 'pct' ? 'e.g. 25%' : 'Answer (fractions OK, e.g. 3/8)'}" aria-label="Answer for part ${esc(p.label || '')}">${mode === 'practice' ? '<button class="btn btn-hot" type="button" data-k="check">Check</button><button class="btn btn-ghost" type="button" data-k="show">Show me</button>' : ''}</div>${p.hint ? `<div class="note" style="font-size:13px">${esc(p.hint)}</div>` : ''}`;
    el.innerHTML = `${p.label ? `<div class="pl">${esc(p.label)}</div>` : ''}<div class="pbody"><div class="pq">${esc(p.q)}${mk}</div>${body}<div class="pfb"></div></div>`;
    const fb = $('.pfb', el);
    const finish = (ok, given) => {
      if (p._done) return; p._done = true; p._ans = given;
      p._got = ok ? (p.marks || 1) : 0;
      $$('input,button[data-k]', el).forEach(x => x.disabled = true);
      showFeedback(fb, p, q, ok, given);
      if (ok && mode === 'practice') { const r = el.getBoundingClientRect(); burst(Math.min(innerWidth - 40, r.left + 120), r.top + 10, 50); xpPop($('.pq', el), '+' + (p.marks || 1) * 10); }
      onPart && onPart(p, q);
    };
    p._finish = finish;
    if (p.type === 'choice') {
      $$('.choice', el).forEach(b => b.onclick = () => {
        if (p._done) return; const i = +b.dataset.i;
        if (mode === 'exam') { p._ans = i; $$('.choice', el).forEach(x => x.classList.toggle('sel', x === b)); return; }
        $$('.choice', el).forEach(x => { x.disabled = true; if (+x.dataset.i === p.value) x.classList.add('right'); });
        if (i !== p.value) b.classList.add('wrong');
        finish(i === p.value, i);
      });
    } else if (p.type === 'short') {
      const ta = $('textarea', el);
      ta.oninput = () => { p._ans = ta.value; };
      const ai = $('[data-k=ai]', el), self = $('[data-k=self]', el);
      if (ai) ai.onclick = () => { if (!ta.value.trim()) { ta.focus(); toast('Write your answer first'); return; } markShortAI(p, q, ta.value, fb, el, onPart); };
      if (self) self.onclick = () => selfMark(p, q, ta.value, fb, el, onPart);
    } else {
      const inp = $('input', el);
      inp.oninput = () => { p._ans = inp.value; };
      const go = () => { if (!inp.value.trim()) { inp.focus(); return; } finish(check(p, inp.value), inp.value); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (mode === 'practice') go(); } });
      const cb = $('[data-k=check]', el); if (cb) cb.onclick = go;
      const sb = $('[data-k=show]', el); if (sb) sb.onclick = () => finish(false, null);
    }
    return el;
  }
  function showFeedback(fb, p, q, ok, given) {
    const steps = p.steps?.length ? `<ol class="steps">${p.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : '';
    const head = ok ? pick(['Locked in.', 'Correct!', 'Clean.', 'Yep.', 'Too easy.']) : given == null || given === '' ? `Answer: ${esc(p.show)}` : `Not quite. Answer: ${esc(p.show)}`;
    fb.innerHTML = `<div class="fb ${ok ? 'good' : given == null || given === '' ? 'info' : 'bad'}"><b>${head}</b>${steps}${!ok && aiReady() && given != null && given !== '' ? `<div style="margin-top:8px"><button class="linkbtn" type="button">Explain my mistake (AI)</button></div><div class="ai" hidden></div>` : ''}</div>`;
    const lb = $('.linkbtn', fb); if (lb) lb.onclick = () => explainMistake(p, q, given, $('.ai', fb), lb);
  }
  async function explainMistake(p, q, given, box, btn) {
    btn.disabled = true; box.hidden = false; box.textContent = 'Thinking…';
    const ans = p.type === 'choice' ? p.choices[given] : given;
    const prompt = `You are a friendly, encouraging tutor for a Year 8 student in NSW, Australia. They got an exam question wrong. In under 120 words, explain the most likely mistake in their thinking and how to get the right answer. Use simple language and show the key working. No greeting.

Question: ${q.stem || ''} ${p.q}
Correct answer: ${p.show}
Worked solution: ${(p.steps || []).join(' | ')}
Student's answer: ${ans}`;
    try { await AI.fn(prompt, { modelTier: 'quick', onText: ({ text }) => { box.textContent = text; } }); }
    catch (e) { box.textContent = e?.text || AI.msg(e); }
    finally { btn.remove(); }
  }
  function critList(p, met) {
    return `<ul class="crit">${p.criteria.map((c, i) => met ? `<li class="${met[i] ? 'met' : 'miss'}">${met[i] ? '✓' : '✗'} ${esc(c)}</li>` : `<li><label><input type="checkbox" data-c="${i}"> <span>${esc(c)}</span></label></li>`).join('')}</ul>`;
  }
  async function markShortAI(p, q, answer, fb, el, onPart) {
    $$('button[data-k]', el).forEach(b => b.disabled = true); $('textarea', el).readOnly = true;
    fb.innerHTML = `<div class="fb info"><b>Marking…</b><div class="note" style="margin-top:4px">Claude is reading your answer like a teacher would.</div></div>`;
    const r = await aiMark(p, q, answer);
    if (!r.ok) { fb.innerHTML = `<div class="fb bad"><b>${esc(r.err)}</b></div>`; $$('button[data-k]', el).forEach(b => b.disabled = false); $('textarea', el).readOnly = false; return; }
    p._done = true; p._got = r.marks; p._ans = answer;
    renderShortResult(fb, p, r);
    if (r.marks === p.marks) { const b = el.getBoundingClientRect(); burst(b.left + 120, b.top + 20, 70); }
    onPart && onPart(p, q);
  }
  async function aiMark(p, q, answer) {
    const crit = p.criteria.length ? p.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n') : '(use the model answer)';
    const prompt = `You are a fair but strict NSW high-school teacher marking a Year 8 exam short-answer question.

Question (${p.marks} marks): ${q.stem ? q.stem + ' ' : ''}${p.q}
Marking criteria (about one mark each):
${crit}
Model answer: ${p.model || '(none)'}

Student's answer:
"""${answer.slice(0, 4000)}"""

Award marks only for what the student actually wrote. Reply with ONLY this JSON:
{"marks": <whole number 0-${p.marks}>, "met": [${p.criteria.map(() => 'true/false').join(', ')}], "feedback": "2-3 short sentences: what was good, and exactly what to add or fix for full marks"}`;
    try {
      const j = await AI.fn.json(prompt, { modelTier: 'default', cache: false });
      const marks = Math.max(0, Math.min(p.marks, Math.round(Number(j.marks) || 0)));
      const met = Array.isArray(j.met) ? p.criteria.map((_, i) => !!j.met[i]) : null;
      return { ok: true, marks, met, feedback: String(j.feedback || '') };
    } catch (e) { return { ok: false, err: AI.msg(e) }; }
  }
  function renderShortResult(fb, p, r) {
    fb.innerHTML = `<div class="fb ${r.marks === p.marks ? 'good' : r.marks ? 'info' : 'bad'}"><b>${r.marks}/${p.marks} marks</b>${r.feedback ? `<div style="margin-top:6px">${esc(r.feedback)}</div>` : ''}${p.criteria.length ? critList(p, r.met) : ''}
      ${p.model ? `<details style="margin-top:10px"><summary class="linkbtn" style="cursor:pointer">See a full-marks answer</summary><div style="margin-top:8px">${esc(p.model)}</div></details>` : ''}</div>`;
  }
  function selfMark(p, q, answer, fb, el, onPart) {
    fb.innerHTML = `<div class="fb info"><b>Marking guide: tick each point your answer covers</b>${critList(p, null)}${p.model ? `<div style="margin-top:10px"><span class="eyebrow">Full-marks answer</span><div style="margin-top:4px">${esc(p.model)}</div></div>` : ''}<div class="row" style="margin-top:10px"><button class="btn btn-sm btn-acc" type="button" data-k2="save">Save my mark</button></div></div>`;
    $('[data-k2=save]', fb).onclick = () => {
      const got = Math.min(p.marks, $$('input[data-c]:checked', fb).length);
      p._done = true; p._got = got; p._ans = answer;
      $$('button[data-k]', el).forEach(b => b.disabled = true); $('textarea', el).readOnly = true;
      const met = p.criteria.map((_, i) => !!$(`input[data-c="${i}"]`, fb)?.checked);
      renderShortResult(fb, p, { marks: got, met, feedback: 'Self-marked.' });
      onPart && onPart(p, q);
    };
  }

  /* ---------------- practice view ---------------- */
  const levelOf = (d) => Logic.nearestLevel(S.lvl[d.id]?.L || 'F', deckLevels(d));
  const allDone = (q) => q.parts.every(p => p._done && p._got != null);
  const qScore = (q) => q.parts.reduce((a, p) => [a[0] + (p._got || 0), a[1] + (p.marks || 1)], [0, 0]);
  // Runs the level ladder once a practice question is fully marked. Returns how the level moved.
  function climb(d, q) {
    const [got, out] = qScore(q);
    const { st, moved } = Logic.ladder(S.lvl[d.id], Logic.classify(got, out), deckLevels(d));
    S.lvl[d.id] = st; save();
    return moved;
  }
  function lvlHint(d) {
    const st = S.lvl[d.id] || { up: 0, down: 0 }, ls = deckLevels(d), i = ls.indexOf(levelOf(d));
    if (st.down && i > 0) return `${2 - st.down} more miss drops you a level`;
    if (i < ls.length - 1) return `${3 - (st.up || 0)} right in a row to level up`;
    return 'Top level. Keep it locked in.';
  }
  function viewPractice(el, d) {
    const tags = (d.sections || []).filter(s => hasPracticeFor(d, s.code));
    const sess = { got: 0, out: 0 };
    const ls = deckLevels(d);
    el.innerHTML = `${tags.length ? `<div class="filters" role="group" aria-label="Topic"><button class="fchip" type="button" data-f="all" aria-pressed="${cur.filter === 'all'}">All topics</button>${tags.map(s => `<button class="fchip" type="button" data-f="${esc(s.code)}" aria-pressed="${cur.filter === s.code}">${esc(s.code)} ${esc(s.name)}${s.ext ? ' ★' : ''}</button>`).join('')}</div>` : ''}
      <div class="lvlbar"><div class="lvl-now" id="lvlNow"></div><div class="filters" role="group" aria-label="Level">${[['auto', 'Auto'], ...ls.map(L => [L, LNAME[L]])].map(([k, l]) => `<button class="fchip" type="button" data-l="${k}" aria-pressed="${cur.level === k}">${l}</button>`).join('')}</div></div>
      <div class="session"><span>This session <b id="sGot">0</b>/<b id="sOut">0</b> marks</span>${aiReady() ? '<button class="linkbtn" type="button" id="aiMore">✦ Make new questions with AI</button>' : ''}</div><div id="qHost"></div>
      <div class="qnav"><button class="btn btn-hot" type="button" id="nextQ">Next question →</button></div>`;
    const drawLvl = (pulse) => {
      const auto = cur.level === 'auto', L = auto ? levelOf(d) : cur.level, box = $('#lvlNow', el);
      box.innerHTML = `<span class="lvl-badge lvl-${L}">${auto ? 'Level' : 'Fixed'} · ${LNAME[L]}</span><span class="lvl-hint">${auto ? esc(lvlHint(d)) : 'Manual level: your level won\'t change'}</span>`;
      if (pulse && hasGsap && !reduce) gsap.fromTo($('.lvl-badge', box), { scale: 1.35 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .5)' });
    };
    $$('[data-f]', el).forEach(b => b.onclick = () => { cur.filter = b.dataset.f; $$('[data-f]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); next(); });
    $$('[data-l]', el).forEach(b => b.onclick = () => { cur.level = b.dataset.l; $$('[data-l]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); drawLvl(); next(); });
    const host = $('#qHost', el);
    const onPart = (p, q) => {
      sess.got += p._got || 0; sess.out += p.marks || 1; $('#sGot', el).textContent = sess.got; $('#sOut', el).textContent = sess.out; record(q.deckId, q.tags, p._got || 0, p.marks || 1);
      if (!allDone(q) || q._counted) return; q._counted = true;
      noteResult(q, d);
      if (cur.level !== 'auto') return;
      const moved = climb(d, q); drawLvl(!!moved);
      if (moved === 'up') { toast(`Level up → ${LNAME[levelOf(d)]}`); burst(innerWidth / 2, 140, 110); }
      if (moved === 'down') toast(`Level down → ${LNAME[levelOf(d)]}. Build it back up.`);
    };
    const next = () => {
      const q = nextQuestion(d, cur.filter, cur.level === 'auto' ? levelOf(d) : cur.level);
      host.innerHTML = '';
      if (!q) { host.innerHTML = '<p class="note">No questions for this filter yet.</p>'; return; }
      if (q.levelNote) host.insertAdjacentHTML('beforeend', `<p class="note lvl-note">${esc(q.levelNote)}</p>`);
      const card = renderCard(q, { mode: 'practice', onPart }); host.appendChild(card);
      if (hasGsap && !reduce) gsap.fromTo(card, { y: 16, opacity: .2 }, { y: 0, opacity: 1, duration: .3, ease: 'power2.out' });
      ov.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };
    $('#nextQ', el).onclick = next;
    const more = $('#aiMore', el); if (more) more.onclick = () => aiMoreQuestions(d, more, () => toast('New questions added to this deck'));
    drawLvl(); next();
  }
  // Mistakes hook (filled in by the mistakes review).
  function noteResult() { }
  async function aiMoreQuestions(d, btn, done) {
    btn.disabled = true; const old = btn.textContent; btn.textContent = 'Writing questions… (about a minute)';
    const notes = deckContext(d);
    const prompt = `Write NEW exam practice questions for a Year 8 student in NSW, Australia, studying "${d.title}" (${getSubj(d.subject).name}). Base them only on these notes and match the style of school exams.

NOTES:
${notes}

Reply with ONLY JSON: {"mcq":[{"q":"question","options":["A","B","C","D"],"answer":0,"why":"one-sentence explanation"}], "short":[{"q":"question","marks":3,"criteria":["one marking point per mark"],"model":"a full-marks answer"}]}
Write 8 mcq (answer = index 0-3 of the correct option, vary its position) and 2 short-answer questions.`;
    try {
      const j = await AI.fn.json(prompt, { modelTier: 'default', cache: false });
      const e = extraQ(d.id);
      cleanMcq(j.mcq).forEach(c => e.concepts.push(c)); cleanShort(j.short).forEach(s => e.short.push(s));
      save(); done && done();
    } catch (err) { toast(AI.msg(err)); }
    finally { btn.disabled = false; btn.textContent = old; }
  }
  const cleanMcq = (arr) => (Array.isArray(arr) ? arr : []).filter(c => c && c.q && Array.isArray(c.options) && c.options.length >= 2 && Number.isInteger(+c.answer) && +c.answer >= 0 && +c.answer < c.options.length)
    .slice(0, 80).map(c => ({ q: String(c.q).slice(0, 400), options: c.options.slice(0, 5).map(o => String(o).slice(0, 200)), answer: +c.answer, why: c.why ? String(c.why).slice(0, 400) : '' }));
  const cleanShort = (arr) => (Array.isArray(arr) ? arr : []).filter(s => s && s.q).slice(0, 20).map(s => ({ q: String(s.q).slice(0, 400), marks: Math.max(1, Math.min(8, Math.round(+s.marks || 3))), criteria: (Array.isArray(s.criteria) ? s.criteria : []).slice(0, 8).map(c => String(c).slice(0, 240)), model: String(s.model || '').slice(0, 1500), tags: [] }));

  /* ---------------- quick drills (maths) ---------------- */
  function viewDrills(el, d) {
    const sess = { ok: 0, n: 0 };
    el.innerHTML = `<p class="note" style="margin:0 0 6px">Fast one-step questions to warm up. Exam questions are the main event.</p><div class="session"><span>Session <b id="dOk">0</b>/<b id="dN">0</b></span></div><div id="qHost"></div><div class="qnav"><button class="btn btn-hot" type="button" id="nextQ">Next →</button></div>`;
    const host = $('#qHost', el);
    const next = () => {
      const fn = pick(Object.values(d.drills)); const r = fn();
      const part = { label: '', q: r.q, type: r.type, value: r.value, show: r.show, steps: r.steps, marks: 1, hint: r.hint, choices: r.choices };
      const q = { stem: '', tags: [r.tag], deckId: d.id, parts: [part], visual: null };
      host.innerHTML = ''; host.appendChild(renderCard(q, { mode: 'practice', onPart: (p) => { sess.n++; if (p._got) sess.ok++; $('#dOk', el).textContent = sess.ok; $('#dN', el).textContent = sess.n; record(d.id, [r.tag], p._got, 1); } }));
    };
    $('#nextQ', el).onclick = next; next();
  }

  /* ---------------- practice exams ---------------- */
  function buildMock(sid) {
    const blocks = [];
    if (sid === 'geo') {
      const maps = G.mapDeck, water = G.waterDeck;
      blocks.push(bankQ(G.BANK.maps[0], maps, 'C'));
      blocks.push(bankQ(G.BANK.maps[3], maps)); // climate graph
      blocks.push(bankQ(G.BANK.maps[2], maps)); // scale
      shuffle(conceptsOf(maps)).slice(0, 7).forEach(c => blocks.push(mcqQ(c, maps)));
      shuffle(conceptsOf(water)).slice(0, 5).forEach(c => blocks.push(mcqQ(c, water)));
      shuffle(shortOf(water)).slice(0, 3).forEach(s => blocks.push(shortQ(s, water)));
      return { title: 'Geography practice exam', minutes: 45, blocks, acc: 'c-green', intro: 'Section 1: Geographical tools and skills (25 multiple choice). Section 2: Water in the World (5 multiple choice + 3 short answers). 45 minutes, like the real thing.' };
    }
    const md = decksOf('maths');
    md.forEach(d => {
      if (!d.bank) return;
      const lo = d.bank.map(f => bankQ(f, d)).filter(q => q.level !== 'C'), hi = d.bank.map(f => bankQ(f, d)).filter(q => q.level !== 'F');
      const a = pick(lo), b = pick(hi.filter(q => q.stem !== a.stem)) || pick(hi);
      blocks.push(a, b);
    });
    md.forEach(d => { const c = conceptsOf(d); if (c.length) blocks.push(mcqQ(pick(c), d)); });
    return { title: 'Maths practice exam', minutes: 60, blocks: shuffle(blocks), acc: 'c-gold', intro: 'Two multi-part questions from each chapter (8, 9, 10, 12) plus quick multiple choice. 60 minutes. Calculator allowed.' };
  }
  function openMock(sid) {
    const ex = buildMock(sid);
    cur = { kind: 'mock', tab: null, ex, done: false, end: Date.now() + ex.minutes * 6e4 };
    const body = ovFrame(ex.title, ex.acc, null, `<span class="timer" id="timer">${ex.minutes}:00</span>`);
    const total = ex.blocks.reduce((a, q) => a + q.parts.reduce((b, p) => b + (p.marks || 1), 0), 0);
    body.innerHTML = `<div class="note" style="margin-bottom:16px;max-width:820px">${esc(ex.intro)} Answers are marked when you finish. <b>${total} marks total.</b></div><div id="paper"></div>
      <div class="qnav"><button class="btn btn-hot" type="button" id="finish">Finish & mark my exam</button></div>`;
    const paper = $('#paper', body);
    let n = 0; ex.blocks.forEach(q => { n++; paper.appendChild(renderCard(q, { mode: 'exam', num: n })); });
    $('#finish', body).onclick = () => finishExam(body);
    const tick = () => { const left = Math.max(0, cur.end - Date.now()); const m = Math.floor(left / 6e4), s = Math.floor(left % 6e4 / 1e3); const t = $('#timer'); if (!t) return; t.textContent = `${m}:${pad(s)}`; t.classList.toggle('low', left < 5 * 6e4); if (left <= 0 && !cur.done) { toast('Time\'s up! Marking your exam.'); finishExam(body); } };
    cur.timer = setInterval(tick, 1000); tick();
    showOv();
  }
  async function finishExam(body) {
    if (!cur || cur.done) return; cur.done = true; clearInterval(cur.timer);
    const btn = $('#finish', body); btn.disabled = true; btn.textContent = 'Marking…';
    const ex = cur.ex; const shorts = [];
    // mark choice + numeric parts; collect short answers
    $$('.qcard', body).forEach((card, qi) => {
      const q = ex.blocks[qi]; const els = $$('.part', card);
      q.parts.forEach((p, pi) => {
        const el = els[pi];
        if (p.type === 'short') { shorts.push({ p, q, el }); return; }
        if (p.type === 'choice') {
          $$('.choice', el).forEach(x => { x.disabled = true; x.classList.remove('sel'); if (+x.dataset.i === p.value) x.classList.add('right'); else if (+x.dataset.i === p._ans) x.classList.add('wrong'); });
          p._finish(p._ans === p.value, p._ans == null ? null : p._ans);
        } else { const v = $('input', el)?.value || ''; p._finish(v.trim() ? check(p, v) : false, v.trim() ? v : null); }
      });
    });
    for (const s of shorts) {
      const ans = $('textarea', s.el).value.trim(); $('textarea', s.el).readOnly = true; const fb = $('.pfb', s.el);
      if (!ans) { s.p._got = 0; s.p._done = true; fb.innerHTML = `<div class="fb bad"><b>No answer (0/${s.p.marks})</b>${critList(s.p, s.p.criteria.map(() => false))}${s.p.model ? `<div style="margin-top:8px">${esc(s.p.model)}</div>` : ''}</div>`; continue; }
      if (aiReady()) { fb.innerHTML = '<div class="fb info"><b>Marking with AI…</b></div>'; const r = await aiMark(s.p, s.q, ans); if (r.ok) { s.p._got = r.marks; s.p._done = true; renderShortResult(fb, s.p, r); continue; } }
      s.p._got = null; selfMark(s.p, s.q, ans, fb, s.el, () => showResults(body));
    }
    ex.blocks.forEach(q => q.parts.forEach(p => { if (p._got != null) record(q.deckId, q.tags, p._got, p.marks || 1); }));
    btn.remove(); $('#timer')?.remove();
    showResults(body);
  }
  function showResults(body) {
    const ex = cur.ex; let got = 0, out = 0, pending = 0; const byDeck = {};
    ex.blocks.forEach(q => q.parts.forEach(p => { const m = p.marks || 1; if (p._got == null) { pending += m; return; } got += p._got; out += m; const k = q.deckTitle || 'Other'; (byDeck[k] ||= [0, 0]); byDeck[k][0] += p._got; byDeck[k][1] += m; }));
    const pct = out ? Math.round(got / out * 100) : 0;
    const msg = pct >= 85 ? 'Exam ready. Ridiculous.' : pct >= 70 ? 'Solid. Fix the red ones below and you\'re there.' : pct >= 50 ? 'Getting there. Practise the topics with the shortest bars.' : 'That\'s what practice exams are for. Start with Learn, then Exam questions.';
    let res = $('#examResult', body);
    if (!res) { res = document.createElement('div'); res.id = 'examResult'; res.className = 'result'; body.prepend(res); }
    res.innerHTML = `<div class="eyebrow">Your score</div><div class="score">${got}/${out}</div><p style="font-size:18px;font-weight:800;margin:6px 0">${pct}% · ${msg}</p>${pending ? `<p class="note">+ ${pending} marks of short answers still to self-mark below.</p>` : ''}
      <div class="bars">${Object.entries(byDeck).map(([k, [g, o]]) => { const v = o ? g / o : 0; return `<div class="bar"><span>${esc(k)}</span><div class="tr"><i style="width:${v * 100}%;background:${v >= .8 ? 'var(--good)' : v >= .5 ? 'var(--gold)' : 'var(--bad)'}"></i></div><span class="n">${g}/${o}</span></div>`; }).join('')}</div>
      <div class="row" style="margin-top:16px"><button class="btn btn-hot" type="button" id="again">New practice exam</button></div>`;
    $('#again', res).onclick = () => { const sid = ex.title.startsWith('Geo') ? 'geo' : 'maths'; closeOv(); openMock(sid); };
    ov.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (pct >= 70 && !pending) { burst(innerWidth / 2, 160, 160); }
  }

  /* ---------------- ask AI ---------------- */
  const chats = {};
  function deckContext(d) {
    const secs = (d.sections || []).map(s => `${s.code || ''} ${s.name}: ${(s.notes || []).join(' ')}${s.ex ? ' Example: ' + s.ex.join(' → ') : ''}`).join('\n');
    const cards = (d.cards || []).map(c => `${c.q}: ${c.a}`).join('\n');
    return (secs + '\n' + cards).slice(0, 9000);
  }
  function viewAsk(el, d) {
    if (!aiReady()) { el.innerHTML = `<p class="note"><b>Ask AI</b> answers questions about this topic, explains things differently and quizzes you.</p><p class="note" style="margin-top:10px">${esc(AI.state === 'checking' ? 'Checking whether AI is available…' : AI.reason)}</p>`; return; }
    const hist = (chats[d.id] ||= []);
    el.innerHTML = `<div class="chat" id="chat"></div><div class="ans" style="max-width:760px;margin-top:12px"><input class="field" id="askIn" placeholder="Ask anything about ${esc(d.title)}…" autocomplete="off" aria-label="Your question" style="font-family:var(--f-body);font-size:16px"><button class="btn btn-hot" type="button" id="askGo">Ask</button></div>
      <div class="row" style="margin-top:10px">${['Explain this topic like I\'m 10', 'Quiz me with 3 questions', 'What will probably be on the exam?'].map(s => `<button class="pill" type="button" data-sug="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
    const chat = $('#chat', el);
    const draw = () => { chat.innerHTML = hist.length ? hist.map(m => `<div class="msg ${m.role === 'user' ? 'me' : 'bot'}">${esc(m.content)}</div>`).join('') : `<p class="note">Ask anything about <b>${esc(d.title)}</b>. It knows your notes for this deck.</p>`; };
    draw();
    const send = async (text) => {
      const q = (text || $('#askIn', el).value).trim(); if (!q) return; $('#askIn', el).value = '';
      hist.push({ role: 'user', content: q }); draw(); const bot = document.createElement('div'); bot.className = 'msg bot'; bot.textContent = 'Thinking…'; chat.appendChild(bot);
      const rules = `You are a friendly, patient tutor for a Year 8 student in NSW, Australia, revising "${d.title}" (${getSubj(d.subject).name}) for an exam. Keep answers short and clear, use Australian spelling, show working for maths, and use these notes when relevant:\n\n${deckContext(d)}`;
      const turns = [{ role: 'user', content: rules }, ...hist.slice(-10)];
      try { const { text: out } = await AI.fn(turns, { cache: false, modelTier: 'quick', onText: ({ text: t }) => { bot.textContent = t; } }); hist.push({ role: 'assistant', content: out }); }
      catch (e) { bot.textContent = e?.text || AI.msg(e); hist.pop(); }
    };
    $('#askGo', el).onclick = () => send();
    $('#askIn', el).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
    $$('[data-sug]', el).forEach(b => b.onclick = () => send(b.dataset.sug));
  }

  /* ---------------- share codes ---------------- */
  function shareCode(d) {
    const data = { v: 2, title: d.title, subject: d.subject, subjectName: d.subjectName, sections: d.sections, cards: d.cards, concepts: d.concepts, short: d.short, ai: d.ai, source: d.source };
    return 'LOCKIN:' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }
  function copyText(txt, okMsg, host) {
    const fallback = () => { const ta = document.createElement('textarea'); ta.className = 'field codebox'; ta.value = txt; ta.readOnly = true; host.prepend(ta); ta.select(); toast('Select all and copy this code'); };
    try { navigator.clipboard.writeText(txt).then(() => toast(okMsg), fallback); } catch (e) { fallback(); }
  }
  $('#importBtn').onclick = () => {
    const raw = $('#importIn').value.trim().replace(/^LOCKIN:/, '');
    try {
      const d = JSON.parse(decodeURIComponent(escape(atob(raw)))); if (!d.title) throw 0;
      const deck = addCustom({ ...d, source: d.source || 'a share code' }); $('#importIn').value = ''; toast(`Added "${deck.title}"`);
      S.subj = deck.subject; save(); renderTabs(); renderSubject();
    } catch (e) { toast('That code didn\'t work. Copy the whole thing, including LOCKIN:'); }
  };
  function addCustom(d) {
    const sid = d.subject || 'other';
    const deck = {
      id: 'u' + Date.now().toString(36) + Math.floor(Math.random() * 99), custom: true, subject: sid, subjectName: d.subjectName || getSubj(sid)?.name || sid,
      title: String(d.title || 'My notes').slice(0, 60), chapter: 'Your deck', hue: pick(['lilac', 'cyan', 'coral', 'gold', 'pink', 'green']),
      sections: (Array.isArray(d.sections) ? d.sections : []).slice(0, 20).map((s, i) => ({ code: s.code || `T${i + 1}`, name: String(s.name || 'Topic').slice(0, 80), notes: (s.notes || []).slice(0, 12).map(n => String(n).slice(0, 500)) })),
      cards: (d.cards || []).filter(c => c && c.q && c.a).slice(0, 150).map(c => ({ q: String(c.q).slice(0, 220), a: String(c.a).slice(0, 500) })),
      concepts: cleanMcq(d.concepts), short: cleanShort(d.short), ai: !!d.ai, source: d.source || '',
    };
    deck.blurb = `${deck.sections.length} topics · ${deck.cards.length} flashcards · ${deck.concepts.length + deck.short.length} questions`;
    S.custom.push(deck); save(); renderTabs(); renderSubject(); renderBoard(); return deck;
  }

  /* ---------------- upload ---------------- */
  let upSubj = S.subj, files = [];
  function renderUpSubjects() {
    const list = [...subjects(), { id: '__new', name: '+ New subject' }];
    $('#upSubjects').innerHTML = list.map(s => `<button class="pill ${s.hue ? 'c-' + s.hue : ''}" type="button" data-us="${esc(s.id)}" aria-pressed="${upSubj === s.id}">${esc(s.name)}</button>`).join('');
    $('#newSubjRow').hidden = upSubj !== '__new';
  }
  $('#upSubjects').addEventListener('click', e => { const b = e.target.closest('[data-us]'); if (!b) return; upSubj = b.dataset.us; renderUpSubjects(); if (upSubj === '__new') $('#newSubj').focus(); });
  const drop = $('#drop'), fin = $('#fileIn');
  const showFiles = () => { $('#fileList').innerHTML = files.map(f => `<span class="f">${esc(f.name)}</span>`).join(''); };
  fin.onchange = () => { files = [...fin.files]; showFiles(); };
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => { files = [...e.dataTransfer.files]; showFiles(); });

  const loadScript = (src) => new Promise((res, rej) => { if ($(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load the PDF reader.')); document.head.appendChild(s); });
  async function pdfLib() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return window.pdfjsLib;
  }
  function parseRange(str, max) {
    const s = String(str || '').trim().toLowerCase(); if (!s || s === 'all') return [...Array(max)].map((_, i) => i + 1);
    const out = new Set(); s.split(',').forEach(p => { const m = p.trim().match(/^(\d+)\s*(?:-\s*(\d+))?$/); if (!m) return; const a = +m[1], b = +(m[2] || m[1]); for (let i = Math.max(1, a); i <= Math.min(max, b); i++) out.add(i); });
    return [...out].sort((a, b) => a - b);
  }
  const toBlob = (c) => new Promise(r => c.toBlob(r, 'image/jpeg', 0.82));
  // Returns {text, images:[Blob]} — text from text-based PDFs and .txt; page images for scans and photos.
  async function readInputs(log) {
    let text = ''; const images = []; const MAXP = 30;
    for (const f of files) {
      if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') {
        const lib = await pdfLib();
        const doc = await lib.getDocument({ data: new Uint8Array(await f.arrayBuffer()), isEvalSupported: false }).promise;
        const pages = parseRange($('#pageRange').value, doc.numPages);
        if (pages.length > MAXP && !aiReady()) throw new Error(`${f.name} has ${pages.length} pages. Pick up to ${MAXP} in "PDF pages", e.g. 1-20.`);
        let scanned = 0;
        for (const n of pages) {
          log(`Reading ${f.name}: page ${n} of ${doc.numPages}…`);
          const page = await doc.getPage(n); const tc = await page.getTextContent();
          const t = tc.items.map(x => x.str + (x.hasEOL ? '\n' : ' ')).join('');
          if (t.replace(/\s/g, '').length > 120) { text += `\n[Page ${n}]\n` + t; continue; }
          scanned++;
          if (aiReady() && AI.imgMax && images.length < MAXP) {
            const vp0 = page.getViewport({ scale: 1 }); const vp = page.getViewport({ scale: Math.min(2, 1300 / vp0.width) });
            const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
            await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise; images.push(await toBlob(c));
          }
        }
        if (scanned && !(aiReady() && AI.imgMax)) log(`${scanned} page(s) are scans. Reading scans needs AI; using the text pages only.`);
        if (text.length > 200000) text = text.slice(0, 200000);
      } else if (f.type.startsWith('image/')) {
        if (aiReady() && AI.imgMax) images.push(f); else log(`${f.name}: reading photos needs AI.`);
      } else text += '\n' + await f.text();
    }
    text = (text + '\n' + $('#pasteIn').value).replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    return { text, images };
  }
  const deckPrompt = (subject, what) => `You are making exam revision material for a Year 8 student in NSW, Australia. Subject: ${subject}.
Using ONLY the content in ${what}, write everything in your own clear words (don't copy long passages).

Reply with ONLY this JSON:
{"title":"short topic name",
 "sections":[{"name":"topic heading","notes":["key point", "..."]}],
 "flashcards":[{"q":"key term or short question","a":"short answer"}],
 "mcq":[{"q":"exam-style question","options":["A","B","C","D"],"answer":0,"why":"one-sentence explanation"}],
 "short":[{"q":"exam-style short-answer question","marks":3,"criteria":["one marking point per mark"],"model":"a full-marks answer"}]}

Aim for 2-5 sections with 3-6 notes each, 10-20 flashcards (key terms, people, dates, causes and effects), 8-15 mcq like a real school exam (vary which option is correct), and 2-4 short-answer questions with one criterion per mark. If the material is maths, make mcq questions that need working out.`;
  async function aiDeck(subject, inp, log, setP) {
    const jobs = [];
    const chunks = []; let t = inp.text; while (t.length > 120) { chunks.push(t.slice(0, 24000)); t = t.slice(24000); if (chunks.length >= 6) break; }
    chunks.forEach((c, i) => jobs.push({ label: `notes part ${i + 1}`, run: () => AI.fn.json(deckPrompt(subject, 'these notes') + `\n\nNOTES:\n"""${c}"""`, { modelTier: 'default', cache: false }) }));
    const per = Math.max(1, Math.min(AI.imgMax || 1, 6));
    for (let i = 0; i < inp.images.length; i += per) { const imgs = inp.images.slice(i, i + per); jobs.push({ label: `pages ${i + 1}–${i + imgs.length}`, run: () => AI.fn.json(deckPrompt(subject, `these ${imgs.length} page images from a textbook or class notes`), { modelTier: 'default', cache: false, images: imgs }) }); }
    if (!jobs.length) throw new Error('There wasn\'t enough to read. Try pasting the text instead.');
    const out = { title: '', sections: [], cards: [], concepts: [], short: [] }; let done = 0, failed = 0, lastErr = null;
    const runOne = async (job) => {
      try {
        const j = await job.run();
        if (!out.title && j.title) out.title = String(j.title);
        (j.sections || []).forEach(s => s && s.name && out.sections.push({ name: s.name, notes: s.notes || [] }));
        (j.flashcards || []).forEach(c => c && c.q && c.a && out.cards.push(c));
        cleanMcq(j.mcq).forEach(c => out.concepts.push(c)); cleanShort(j.short).forEach(s => out.short.push(s));
      } catch (e) { failed++; lastErr = e; }
      done++; setP(0.1 + 0.9 * done / jobs.length); log(`AI is writing your deck… ${done}/${jobs.length} parts done (each takes up to a minute)`);
    };
    log(`AI is reading ${jobs.length} part${jobs.length > 1 ? 's' : ''}. Claude may ask you to allow it first.`);
    const q = jobs.slice(); await Promise.all([0, 1].map(async () => { while (q.length) await runOne(q.shift()); }));
    if (failed === jobs.length) throw new Error(AI.msg(lastErr));
    return out;
  }
  const STOP = new Set('the a an and or of to in on for with is are was were be been by as at it its this that these those from into than then them they their there which who whom what when where why how not but if so such can may will would should could also each other more most some any all one two three your you our we he she his her has have had do does did very just about over under between because while'.split(' '));
  function quickDeck(text) {
    const lines = text.split(/\n|(?<=[.!?])\s+(?=[A-Z])/).map(s => s.trim()).filter(Boolean);
    const cards = []; const seen = new Set();
    for (const l of lines) {
      let m = l.match(/^[•\-*\d.)\s]*([A-Za-z][\w '’()/-]{1,48}?)\s*(?::|–|—|\s-\s|=)\s*(.{6,260})$/);
      if (!m) m = l.match(/^(?:an?\s+|the\s+)?([A-Za-z][\w '’-]{1,40}?)\s+(?:is|are|was|were|means|refers to|is called|is defined as)\s+(.{8,240})$/i);
      if (!m) continue; const term = m[1].trim(), def = m[2].trim().replace(/\s+/g, ' ');
      if (term.split(/\s+/).length > 6 || seen.has(term.toLowerCase())) continue; seen.add(term.toLowerCase()); cards.push({ q: term, a: def });
    }
    const sentences = text.replace(/\n/g, ' ').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 40 && s.length < 240);
    const notes = (cards.length ? sentences.filter(s => cards.some(c => s.toLowerCase().includes(c.q.toLowerCase()))) : sentences).slice(0, 8);
    const concepts = [];
    if (cards.length >= 4) shuffle(cards).slice(0, 15).forEach(c => { const wrong = shuffle(cards.filter(x => x !== c)).slice(0, 3).map(x => x.q); concepts.push({ q: `Which term matches: "${c.a.length > 140 ? c.a.slice(0, 140) + '…' : c.a}"`, options: [c.q, ...wrong], answer: 0, why: `${c.q}: ${c.a}` }); });
    const words = [...new Set(text.match(/\b[A-Za-z]{6,}\b/g) || [])].filter(w => !STOP.has(w.toLowerCase()));
    shuffle(sentences).slice(0, Math.max(0, 10 - concepts.length)).forEach(s => { const cand = (s.match(/\b[A-Za-z]{6,}\b/g) || []).filter(w => !STOP.has(w.toLowerCase())); if (!cand.length || words.length < 4) return; const w = cand.sort((a, b) => b.length - a.length)[0]; const wrong = shuffle(words.filter(x => x.toLowerCase() !== w.toLowerCase())).slice(0, 3); concepts.push({ q: 'Fill the gap: ' + s.replace(new RegExp('\\b' + w + '\\b'), '_____'), options: [w, ...wrong], answer: 0, why: s }); });
    return { cards, concepts, short: [], sections: notes.length ? [{ name: 'Key points', notes }] : [] };
  }
  $('#makeBtn').onclick = async () => {
    const btn = $('#makeBtn'), log = (t) => $('#log').textContent = t, pw = $('#progWrap'), pb = $('#progBar');
    const setP = (p) => { pw.hidden = false; pb.style.width = Math.round(Math.min(1, p) * 100) + '%'; };
    if (!files.length && !$('#pasteIn').value.trim()) { toast('Add a file or paste some notes first'); return; }
    let sid = upSubj, sname = getSubj(sid)?.name;
    if (sid === '__new') { sname = $('#newSubj').value.trim(); if (!sname) { toast('Type a subject name'); $('#newSubj').focus(); return; } sid = sname.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30); }
    btn.disabled = true; setP(0.03);
    try {
      const inp = await readInputs(log); setP(0.1);
      let res;
      if (aiReady() && (inp.text.length > 60 || inp.images.length)) res = await aiDeck(sname, inp, log, setP);
      else {
        if (inp.text.replace(/\s/g, '').length < 60) throw new Error(aiReady() ? 'Couldn\'t find enough to read. Try pasting the text.' : 'Couldn\'t find text to read. Scans and photos need the AI. Try pasting the text instead.');
        log('Building your deck (quick mode)…'); res = quickDeck(inp.text);
      }
      if (res.cards.length + res.concepts.length + res.short.length < 3) throw new Error(aiReady() ? 'The AI couldn\'t get much from that. Try clearer pages or fewer of them.' : 'Quick mode needs notes written like "term: meaning". Or open this page in Claude to use the AI.');
      const title = $('#deckName').value.trim() || res.title || (files[0] ? files[0].name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 50) : 'My notes');
      const deck = addCustom({ title, subject: sid, subjectName: sname, sections: res.sections, cards: res.cards, concepts: res.concepts, short: res.short, ai: aiReady(), source: files.map(f => f.name).join(', ') || 'pasted notes' });
      setP(1); log(`Done: ${deck.sections.length} topics, ${deck.cards.length} flashcards, ${deck.concepts.length + deck.short.length} exam questions.`);
      burst(innerWidth / 2, innerHeight / 2, 140); toast('Deck ready');
      files = []; fin.value = ''; showFiles(); $('#pasteIn').value = ''; $('#deckName').value = ''; $('#newSubj').value = '';
      S.subj = sid; upSubj = sid; save(); renderTabs(); renderUpSubjects(); renderSubject();
      setTimeout(() => openDeck(deck.id), 700);
    } catch (e) { log(e.message || AI.msg(e)); toast('That didn\'t work. See the message under the button.'); }
    finally { btn.disabled = false; setTimeout(() => pw.hidden = true, 1800); }
  };

  /* ---------------- intro motion ---------------- */
  function intro() {
    if (!hasGsap || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('#h1 .line > span', { yPercent: 105, rotate: 4, duration: 1, stagger: .12 })
      .from(['#next', '#heroCtas'], { y: 18, opacity: .2, duration: .6, stagger: .08, clearProps: 'transform,opacity' }, '-=.6')
      .from('#board', { y: 30, opacity: .3, duration: .8, clearProps: 'transform,opacity' }, 0.1)
      .from('#subject .decks', { y: 30, opacity: .3, duration: .6, clearProps: 'transform,opacity' }, '-=.5');
  }

  if (!subjects().some(s => s.id === S.subj)) S.subj = 'geo';
  renderStats(); renderTabs(); renderNext(); renderBoard(); renderTicker(); renderSubject(); renderWeek(); renderUpSubjects(); renderAiNote(); intro();
  AI.init();
})();
