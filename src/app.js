/* ===== Lock In — app ===== */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fm = Fmt.text; // maths + bold formatting for content text (escapes HTML)
  // Typeset the maths spans Fmt makes, with MathJax once it has loaded; new ones are picked up as they appear.
  function typeset() {
    const MJ = window.MathJax; if (!MJ || !MJ.tex2svg) return;
    document.querySelectorAll('.m:not([data-done])').forEach(el => {
      el.dataset.done = 1;
      try { el.replaceChildren(MJ.tex2svg(el.dataset.tex, { display: el.classList.contains('d') })); } catch (e) { el.classList.add('bad'); }
    });
  }
  new MutationObserver(typeset).observe(document.body, { childList: true, subtree: true });
  (function waitForMathJax() {
    if (!window.MathJax?.startup?.promise) return setTimeout(waitForMathJax, 250);
    window.MathJax.startup.promise.then(() => { document.head.appendChild(window.MathJax.svgStylesheet()); typeset(); });
  })();
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  const { shuffle, pick } = X;
  const check = X.check;

  /* ---------------- storage ---------------- */
  // Each person on this device has their own key: guest = 'lockin.v2', signed in = 'lockin.v2:<uid>'.
  let KEY = Logic.storageKey(null), me = null;
  const fresh = () => ({ p: {}, xp: 0, streak: { last: '', n: 0 }, custom: [], extra: {}, subj: 'geo' });
  function loadLocal(key) {
    let st = fresh();
    try { const raw = localStorage.getItem(key) || (key === 'lockin.v2' ? localStorage.getItem('lockin.v1') : null); if (raw) { st = Object.assign(st, JSON.parse(raw)); st.custom = (st.custom || []).map(d => ({ subject: 'other', ...d })); } } catch (e) { }
    return Logic.defaults(st);
  }
  let S = loadLocal(KEY);
  if (!localStorage.getItem('lockin.seenHome')) { S.subj = 'home'; try { localStorage.setItem('lockin.seenHome', '1'); } catch (e) { } }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } if (me) queueSync(); if (typeof checkBadges === 'function') checkBadges(); };
  const today = () => new Date().toLocaleDateString('en-CA');
  function bumpStreak() { const t = today(); if (S.streak.last === t) return; const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA'); S.streak.n = S.streak.last === y ? S.streak.n + 1 : 1; S.streak.last = t; }
  const prog = (id) => (S.p[id] ||= { att: 0, cor: 0, tags: {}, known: {} });
  function record(deckId, tags, got, out) {
    if (!deckId || !out) return;
    const p = prog(deckId); p.att += out; p.cor += got;
    (tags && tags.length ? tags : ['all']).forEach(t => { const r = (p.tags[t] ||= [0, 0]); r[0] += out; r[1] += got; });
    const h = new Date().getHours(); if (h >= 23 || h < 4) S.flags.owl = 1; else if (h < 7) S.flags.bird = 1;
    addXp(got * 10 + 2); Logic.logActivity(S, today(), out); bumpStreak(); save(); renderStats();
  }
  function addXp(n) { S.xp += n; const wk = Logic.weekStart(new Date()); if (S.week.start !== wk) S.week = { start: wk, xp: 0 }; S.week.xp += n; }
  const mastery = (id) => { const p = S.p[id]; if (!p || !p.att) return 0; return Math.round(p.cor / p.att * Math.min(1, p.att / 30) * 100); };
  function renderStats() { $('#xp').textContent = S.xp; $('#streak').textContent = S.streak.n; const r = Badges.rank(S.xp); $('#xp').parentElement.title = `${r.name}${r.next ? `: ${r.next.at - S.xp} XP to ${r.next.name}` : ''}`; }

  /* ---------------- subjects & decks ---------------- */
  // Exam dates come from exams.json (one list shared with the lockin command and the desktop splash screen).
  const examOf = (id) => (typeof EXAMS !== 'undefined' ? EXAMS : []).find(e => e.id === id);
  const examDate = (id) => (examOf(id) ? new Date(examOf(id).date) : null);
  const examWhen = (id) => examOf(id)?.when || '';
  const SUBJ = [
    { id: 'geo', name: 'Geography', hue: 'green', exam: examDate('geo'), when: examWhen('geo'), format: '45 minutes. 30 multiple choice (25 on geographical tools & skills, 5 on Water in the World) + 3 short answers.', mock: 'geo' },
    { id: 'maths', name: 'Maths', hue: 'gold', exam: examDate('maths'), when: examWhen('maths'), format: 'The exam covers chapters 8, 9, 10 and 12, with multi-part questions like the Test Yourself pages. Ch 3 and Ch 7 are extra practice.', mock: 'maths' },
    { id: 'y12', name: 'Maths Extension 2', tab: 'Ext 2', hue: 'lilac', exam: examDate('y12'), when: examWhen('y12'), format: 'HSC paper: 3 hours. Section I is 10 multiple choice; Section II is 90 marks across proof, complex numbers, induction, integration, vectors and mechanics.', mock: 'gen', papers: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/mathematics-extension-2' },
    { id: 'e1', name: 'Maths Extension 1', tab: 'Ext 1', hue: 'cyan', exam: examDate('e1'), when: examWhen('e1'), format: 'HSC paper: 2 hours. Section I is 10 multiple choice; Section II is 60 marks of multi-part questions.', mock: 'gen', papers: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/mathematics-extension-1' },
    { id: 'eng', name: 'English', hue: 'pink', exam: examDate('eng'), when: examWhen('eng'), format: 'Task 4: Animal Farm. 60 minutes, 20 marks, on three extracts from the novel. Extract 1: 3 multiple choice (1 mark each) and a 2 mark emotion question with ONE quote. Extract 2: a 3 mark question (ONE quote, technique and effect) and a 5 mark creative journal entry from another character. Extract 3: a 7 mark extended response in 1–2 PETAL paragraphs on power and corruption. No quotes to memorise. Writing feedback checks your PETAL paragraphs.', mock: 'eng' },
    { id: 'phys', name: 'Physics', hue: 'coral', exam: examDate('phys'), when: examWhen('phys'), format: 'HSC paper: 3 hours. Section I is 20 multiple choice; Section II is 80 marks of short answers and extended responses on modules 5 to 8.', mock: 'gen', papers: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/physics' },
  ];
  const BUILTIN = [
    G.mapDeck, G.waterDeck,
    ...Y8.DECKS,
    ...M.DECKS.map(d => ({ ...d, subject: 'maths', bank: X.BANK[d.id], drills: M.GEN[d.gen] })),
    { ...X.ch12, subject: 'maths', bank: X.BANK.sim },
    ...E2.DECKS, ...E1.DECKS, ...PH.DECKS, ...EN.DECKS,
  ].map(d => ({ ...d, subject: d.subject || 'maths', bank: typeof d.bank === 'string' ? G.BANK[d.bank] : d.bank }));
  // Ext 1, Ext 2 and Physics are only for the admin key. Everyone else gets the app without them (subjects, decks,
  // papers, plans and search all read SUBJ and BUILTIN, so trimming those two lists hides them everywhere).
  const ADMIN_ONLY = ['y12', 'e1', 'phys'], SUBJ_ALL = SUBJ.slice(), BUILTIN_ALL = BUILTIN.slice();
  function applyAccess() {
    const ok = (sid) => Gate.isAdmin() || !ADMIN_ONLY.includes(sid);
    SUBJ.splice(0, SUBJ.length, ...SUBJ_ALL.filter(s => ok(s.id)));
    BUILTIN.splice(0, BUILTIN.length, ...BUILTIN_ALL.filter(d => ok(d.subject)));
    if (!ok(S.subj)) S.subj = 'home';
  }
  applyAccess(); Gate.onOpen(applyAccess);
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
    const cols = ['#1D4ED8', '#E2A72E', '#157A40', '#BF2A1E', '#5B45B0', '#0F6E8C'];
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
        if (!window.claude || typeof window.claude.use !== 'function') { if (await this.desktop()) return; throw 0; }
        const fn = await window.claude.use('sample');
        if (!fn) throw 0;
        this.fn = fn; this.state = 'ready';
        const lim = await fn.limits().catch(() => null); this.imgMax = lim?.images?.maxCount || 0;
      } catch (e) { this.state = 'off'; this.reason = window.lockinDesktop ? 'AI turns on by itself when Claude Code is installed on this computer (claude.com/claude-code).' : 'AI features work when this page is opened from its Claude link while signed in to Claude.'; }
      renderAiNote(); if (cur && !ov.hidden) refreshOverlay();
    },
    // Desktop app: use Claude Code on this computer, if it's installed. Same shape as the Claude page's sampler.
    async desktop() {
      const D = window.lockinDesktop; if (!D || !(await D.ai.available().catch(() => false))) return false;
      const flat = (input) => typeof input === 'string' ? input : input.map(m => `${m.role === 'user' ? 'STUDENT' : 'TUTOR'}:\n${m.content}`).join('\n\n') + '\n\nReply as the TUTOR to the last STUDENT message.';
      const ask = async (input, opts = {}) => {
        const r = await D.ai.ask(flat(input), opts.modelTier);
        if (!r.ok) throw { code: r.code === 'signed_out' ? 'session_expired' : r.code === 'not_installed' ? 'sampling_disabled' : 'error', text: '' };
        opts.onText && opts.onText({ text: r.text, delta: r.text });
        return { text: r.text, truncated: false };
      };
      const fn = (input, opts) => ask(input, opts);
      fn.json = async (input, opts = {}) => {
        const { text } = await ask(flat(input) + '\n\nReply with ONLY the JSON, no other text.', opts);
        const m = text.match(/[\[{][\s\S]*[\]}]/); try { return JSON.parse(m ? m[0] : text); } catch (e) { throw { code: 'invalid_json' }; }
      };
      fn.limits = async () => ({ images: null });
      this.fn = fn; this.state = 'ready'; this.via = 'Claude Code'; this.imgMax = 0;
      renderAiNote(); if (cur && !ov.hidden) refreshOverlay();
      return true;
    },
    msg(e) {
      const c = e && e.code;
      if (c === 'not_granted') { this.state = 'off'; this.reason = 'AI is turned off for this page because it wasn\'t allowed. Reload the page to be asked again.'; renderAiNote(); return 'You didn\'t allow AI for this page. Reload to be asked again.'; }
      if (c === 'rate_limited') return 'You\'ve hit your Claude usage limit for now. Try again a bit later.';
      if (c === 'session_expired') return this.via ? 'Claude Code isn\'t signed in. Open a terminal, type claude, sign in, then try again.' : 'Your Claude sign-in expired. Sign in again, then retry.';
      if (c === 'timeout') return 'Claude took too long. Try again.';
      if (c === 'sampling_disabled') { this.state = 'off'; this.reason = 'Claude AI isn\'t available on this account.'; renderAiNote(); return this.reason; }
      if (c === 'images_unavailable' || c === 'image_rejected') return 'Claude couldn\'t read those images here. Try pasting the text, or a smaller PDF.';
      if (c === 'prompt_too_large') return 'That was too much at once. Try fewer pages.';
      if (c === 'invalid_json') return 'The AI\'s answer came back messy. Try again.';
      if (c === 'cancelled') return 'Stopped.';
      return 'The AI had a problem. Try again in a moment.';
    },
  };
  const HSC = ['y12', 'e1', 'phys'];
  const whoFor = (sid) => (HSC.includes(sid) ? 'a Year 12 student in NSW, Australia, preparing for the HSC' : 'a Year 8 student in NSW, Australia');
  const aiReady = () => AI.state === 'ready' && !!AI.fn;
  function renderAiNote() {
    const n = $('#aiNote'), t = $('#aiNoteT'); if (!n) return;
    if (aiReady()) { n.className = 'ai-note ok'; t.textContent = AI.via ? 'AI is on through Claude Code on this computer. Typed or text-based notes work; scans and photos need the Claude version.' : 'AI is on. It runs on your own Claude account (Claude asks you to allow it the first time). Scanned pages and photos work.'; }
    else if (AI.state === 'checking') { n.className = 'ai-note'; t.textContent = 'Checking whether AI is available…'; }
    else { n.className = 'ai-note'; t.textContent = AI.reason + ' Without AI, quick mode still makes flashcards from notes written as "term: meaning".'; }
  }

  /* ---------------- countdown (calculator LCD), readiness, week ---------------- */
  const pad = (n) => String(n).padStart(2, '0');
  const nextExam = () => SUBJ.filter(s => s.exam && s.exam > Date.now()).sort((a, b) => a.exam - b.exam)[0];
  const daysTo = (d) => Math.max(0, Math.ceil((d - Date.now()) / 864e5));
  // Hero: what's next, in a sentence, then every exam on a ruler from today to the last one.
  const DAY = 864e5, dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const shortDate = (t) => new Date(t).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  const hasPractice = (s) => s.mock === 'geo' || s.mock === 'maths' || (s.mock && decksOf(s.id).some(d => d.bank));
  function renderNext() {
    const box = $('#next'), now = Date.now();
    const up = SUBJ.filter(s => s.exam && s.exam > now).sort((a, b) => a.exam - b.exam);
    if (!up.length) { box.innerHTML = '<h1 class="hero-h">No exams left. Go outside.</h1>'; return; }
    const s = up[0], d = daysTo(s.exam), when = d <= 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`;
    const t0 = dayStart(now), span = Math.max(7, Math.round((dayStart(up[up.length - 1].exam) - t0) / DAY) + 2);
    const at = (t) => Math.min(100, (Math.round((dayStart(t) - t0) / DAY) / span) * 100);
    let ticks = '';
    for (let i = 0; i <= span; i++) {
      const t = t0 + i * DAY, mon = new Date(t).getDay() === 1;
      ticks += `<span class="tick${mon ? ' major' : ''}" style="left:${(i / span) * 100}%">${mon ? `<em>${new Date(t).getDate()} ${new Date(t).toLocaleDateString('en-AU', { month: 'short' })}</em>` : ''}</span>`;
    }
    // Stack labels right to left: a label that overhangs a later exam's marker sits above that marker's label,
    // so marker lines never cross text. The result steps down to the right, with the next exam on top.
    const boxW = box.clientWidth || 600, placed = [];
    for (const e of up.slice().reverse()) {
      const x = at(e.exam), w = (Math.max(e.name.length * 8.4, 92) + 16) / boxW * 100, flip = x + w > 100;
      const span = flip ? [x - w, x] : [x, x + w];
      const clash = placed.filter(p => (p.x >= span[0] && p.x <= span[1]) || (p.span[0] < span[1] && span[0] < p.span[1]));
      placed.unshift({ e, x, span, flip, row: clash.length ? Math.max(...clash.map(p => p.row)) + 1 : 0 });
    }
    const marks = placed.map(({ e, x, flip, row }) => `<li class="rmark c-${e.hue}${e === s ? ' next' : ''}" style="left:${x}%;--row:${row}"><span class="pin"></span><span class="rlabel${flip ? ' flip' : ''}"><b>${esc(e.name)}</b>${esc(shortDate(e.exam))}</span></li>`).join('');
    const rowEnd = { length: Math.max(1, ...placed.map(p => p.row + 1)) };
    box.innerHTML = `<h1 class="hero-h">${esc(s.name)} is ${when}.</h1>
      <p class="hero-sub">${esc(s.when)}.${up.length > 1 ? ` After that: ${up.slice(1, 3).map(e => `${esc(e.name)} in ${daysTo(e.exam)} days`).join(', ')}.` : ''}</p>
      <div class="ruler" style="--rows:${rowEnd.length}"><div class="ticks" aria-hidden="true"><span class="today">Today</span>${ticks}</div><ol class="rmarks" aria-label="Exam timeline">${marks}</ol></div>
      <div class="hero-actions">${hasPractice(s) ? `<button class="btn" type="button" data-act="mock" data-s="${s.id}">Start a ${esc(s.name)} practice exam</button><button class="btn btn-ghost" type="button" data-act="cards" data-s="${s.id}">Flashcards</button>` : `<button class="btn" type="button" data-act="upload" data-s="${s.id}">Add ${esc(s.name)} notes</button>`}</div>`;
  }
  setInterval(renderNext, 60000);
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
      return `<div class="rsub"><div class="rsub-head"><h3>${esc(s.name)}</h3><span>${s.exam ? (s.exam > Date.now() ? daysTo(s.exam) + ' days to go' : 'Done') : 'No exam date'}</span></div>
        <ul class="rlist">${ds.map(d => { const m = mastery(d.id); return `<li><button class="rrow ${hue(d)}" type="button" data-open="${esc(d.id)}" aria-label="${esc(d.title)}, ${m}% mastered"><span class="rname">${esc(d.title)}</span><span class="rbar"><i style="width:${m}%"></i></span><span class="rpct">${m}%</span></button></li>`; }).join('')}</ul></div>`;
    }).join('');
    const w = weakest();
    $('#board').innerHTML = `<h2>How ready you are</h2>${rows}
      ${w ? `<div class="weak"><p>${w.acc == null ? 'Not started yet:' : `Weakest topic, ${Math.round(w.acc * 100)}% right:`} <b>${esc(w.sec.code)} ${fm(w.sec.name)}</b></p><button class="btn btn-sm" type="button" data-act="weak" data-d="${esc(w.d.id)}" data-t="${esc(w.sec.code)}">Practise it</button></div>` : ''}`;
  }
  const WEEK = [
    ['Monday', 26, [['P1–2', 'Geography', 'geo'], ['P3–4', 'Science'], ['P5–6', 'D&T / Visual Arts']]],
    ['Tuesday', 27, [['P1–2', 'Supervised study'], ['P3–4', 'Languages'], ['P5–6', 'Sport']]],
    ['Wednesday', 28, [['9:15', 'Late start'], ['P3', 'SAGE prep meeting'], ['P5–6', 'English', 'eng']]],
    ['Thursday', 29, [['P1–2', 'Chinese / Spanish'], ['P3–4', 'Mathematics', 'maths'], ['P5–6', 'Science activity']]],
    ['Friday', 30, [['P1–2', 'Music']]],
  ];
  function renderWeek() {
    $('#weekGrid').innerHTML = WEEK.map(([d, n, items]) => {
      const hot = items.find(i => i[2]); const past = new Date(2026, 9, n, 23, 59) < new Date(); const hs = hot && SUBJ.find(s => s.id === hot[2]);
      return `<div class="day ${hot ? 'hot c-' + hs.hue : ''} ${past ? 'past' : ''}"><div class="d"><b>${n}</b> ${d}</div><ul>${items.map(([p, s, k]) => `<li class="${k ? 'hot' : ''}"><span class="p">${p}</span><span>${esc(s)}</span></li>`).join('')}</ul></div>`;
    }).join('');
  }

  /* ---------------- subject tabs + panel ---------------- */
  function renderTabs() {
    $('#subtabs').innerHTML = [{ id: 'home', name: 'Home' }, ...subjects()].map(s => `<button class="subtab" role="tab" type="button" data-subj="${esc(s.id)}" aria-selected="${S.subj === s.id}" title="${esc(s.name)}">${esc(s.tab || s.name)}</button>`).join('');
  }
  // Sections scrolled to stop below the sticky top bar (which is two rows tall on narrow screens).
  const nav = $('.nav'), padNav = () => { document.documentElement.style.scrollPaddingTop = (nav.offsetHeight + 12) + 'px'; };
  padNav(); if (window.ResizeObserver) new ResizeObserver(padNav).observe(nav); else addEventListener('resize', padNav);
  $('#subtabs').addEventListener('click', e => { const b = e.target.closest('[data-subj]'); if (!b) return; S.subj = b.dataset.subj; save(); renderTabs(); renderSubject(); $('#subject').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
  /* ---------------- study planner ---------------- */
  const planSubs = () => S.planSubs || SUBJ.filter(s => s.exam && s.exam > Date.now()).map(s => s.id);
  function topicsFor(sid) {
    return decksOf(sid).flatMap(d => (d.sections || []).filter(sec => hasPracticeFor(d, sec.code)).map(sec => {
      const t = S.p[d.id]?.tags?.[sec.code];
      return { sid, deckId: d.id, code: sec.code, name: sec.name, acc: t && t[0] ? t[1] / t[0] : null };
    }));
  }
  function currentPlan() {
    const subs = planSubs(), exams = SUBJ.filter(s => s.exam && subs.includes(s.id)).map(s => ({ sid: s.id, name: s.name, date: s.exam }));
    return Logic.buildPlan({ today: new Date(), exams, topics: subs.flatMap(topicsFor), perDay: 3 });
  }
  function taskHtml(t) {
    const s = getSubj(t.sid), done = !!S.planDone[t.id];
    const label = { topic: `Practise ${esc(t.code)} ${fm(t.name)}`, mock: `${esc(s.name)} practice exam`, mistakes: `Fix your ${esc(s.name)} mistakes`, exam: `${esc(s.name)} exam, ${esc(s.when)}` }[t.kind];
    const go = t.kind === 'exam' ? '' : `<button class="linkbtn" type="button" data-task-go="${esc(t.id)}">${t.kind === 'mock' ? 'Start' : 'Go'}</button>`;
    return `<li class="task c-${s.hue}${done ? ' done' : ''}${t.kind === 'exam' ? ' is-exam' : ''}"><label><input type="checkbox" data-task="${esc(t.id)}"${done ? ' checked' : ''}><span>${label}</span></label>${go}</li>`;
  }
  function renderPlan() {
    const el = $('#plan'); if (!el) return;
    const plan = currentPlan(), byId = new Map(plan.flatMap(d => d.tasks.map(t => [t.id, t])));
    const all = SUBJ.filter(s => s.exam && s.exam > Date.now()), subs = planSubs(), week = plan.slice(0, 7);
    const dayName = (d, i) => i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(d + 'T12:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' });
    const t0 = plan[0]?.tasks || [], doneToday = t0.filter(t => S.planDone[t.id]).length;
    el.innerHTML = `<div class="plan-head"><div><h2 id="plH">Your plan</h2><p class="sec-sub">${plan.length ? `${doneToday} of ${t0.length} done today. Aimed at your weakest topics, rebuilt as you practise.` : 'No exams coming up.'}</p></div>
        <div class="pills" role="group" aria-label="Subjects in the plan">${all.map(s => `<button class="pill c-${s.hue}" type="button" data-plan-sub="${esc(s.id)}" aria-pressed="${subs.includes(s.id)}">${esc(s.tab || s.name)}</button>`).join('')}</div></div>
      <ol class="plan-days">${week.map((d, i) => `<li class="pday${i === 0 ? ' today' : ''}"><h3>${dayName(d.date, i)}</h3>${d.tasks.length ? `<ul>${d.tasks.map(taskHtml).join('')}</ul>` : '<p class="note">Rest day.</p>'}</li>`).join('')}</ol>
      ${plan.length > 7 ? `<details class="plan-rest"><summary class="linkbtn">The rest of the plan, up to ${esc(shortDate(new Date(plan[plan.length - 1].date + 'T12:00')))}</summary><ol class="plan-days">${plan.slice(7).map(d => `<li class="pday"><h3>${dayName(d.date, 9)}</h3><ul>${d.tasks.map(taskHtml).join('')}</ul></li>`).join('')}</ol></details>` : ''}`;
    $$('[data-task]', el).forEach(c => c.onchange = () => { if (c.checked) { S.planDone[c.dataset.task] = 1; addXp(5); } else delete S.planDone[c.dataset.task]; save(); renderStats(); renderPlan(); });
    $$('[data-task-go]', el).forEach(b => b.onclick = () => {
      const t = byId.get(b.dataset.taskGo); if (!t) return;
      if (t.kind === 'topic') openDeck(t.deckId, 'practice', t.code); else if (t.kind === 'mock') openMock(t.sid); else if (t.kind === 'mistakes') openMistakes(t.sid);
    });
    $$('[data-plan-sub]', el).forEach(b => b.onclick = () => { const id = b.dataset.planSub, cur = planSubs(); S.planSubs = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]; save(); renderPlan(); });
  }

  /* ---------------- lock-in focus mode ---------------- */
  const FOCUS_KEY = 'lockin.focus';
  const focusState = () => { try { return JSON.parse(localStorage.getItem(FOCUS_KEY)) || null; } catch (e) { return null; } };
  const setFocus = (f) => { try { f ? localStorage.setItem(FOCUS_KEY, JSON.stringify(f)) : localStorage.removeItem(FOCUS_KEY); } catch (e) { } };
  let focusTick = null, baseTitle = document.title;
  function chime() { // three soft beeps when a session ends
    try { const ac = new (window.AudioContext || window.webkitAudioContext)(); [0, .25, .5].forEach(t => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.0001, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(.2, ac.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + t + .2); o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .22); }); } catch (e) { }
  }
  function openFocus() {
    cur = { kind: 'focus', tab: null }; ovFrame('Lock in', 'c-lilac', null); ov.classList.add('focus'); showOv();
    const f = focusState();
    if (f && (f.paused || f.end > Date.now())) runFocus(f);
    else if (f) finishFocus(f, f.min); // it finished while the page was closed
    else focusSetup();
  }
  function focusSetup() {
    const body = $('#ovBody'), subs = subjects().filter(s => decksOf(s.id).length), next = nextExam(), pickSid = (next && subs.some(s => s.id === next.id)) ? next.id : subs[0]?.id;
    const todayMin = S.days[today()]?.min || 0;
    body.innerHTML = `<div class="focus-setup"><h2>What are you locking in on?</h2>
      <div class="pills" role="group" aria-label="Subject">${subs.map(s => `<button class="pill c-${s.hue}" type="button" data-fs="${esc(s.id)}" aria-pressed="${s.id === pickSid}">${esc(s.tab || s.name)}</button>`).join('')}</div>
      <h2>For how long?</h2>
      <div class="pills" role="group" aria-label="Length">${[25, 50, 90].map(n => `<button class="pill" type="button" data-fl="${n}" aria-pressed="${n === 25}">${n} min</button>`).join('')}</div>
      <label class="lbl" for="fTask">Goal for this session (optional)</label><input class="field" id="fTask" maxlength="80" placeholder="e.g. Partial fractions questions until I get 3 right in a row">
      <div class="row" style="margin-top:20px"><button class="btn" type="button" id="fGo">Start</button><span class="note">${todayMin ? `${todayMin} min focused today.` : 'Phone in another room. You\'ve got this.'}</span></div></div>`;
    let sid = pickSid, len = 25;
    $$('[data-fs]', body).forEach(b => b.onclick = () => { sid = b.dataset.fs; $$('[data-fs]', body).forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $$('[data-fl]', body).forEach(b => b.onclick = () => { len = +b.dataset.fl; $$('[data-fl]', body).forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $('#fGo', body).onclick = () => { const f = { sid, min: len, start: Date.now(), end: Date.now() + len * 6e4, task: $('#fTask', body).value.trim(), paused: null }; setFocus(f); runFocus(f); };
  }
  function runFocus(f) {
    const body = $('#ovBody'), s = getSubj(f.sid), ex = s.exam && s.exam > Date.now() ? `${s.name} exam in ${daysTo(s.exam)} days` : s.name;
    body.innerHTML = `<div class="focus-run"><p class="focus-sub">${esc(ex)}</p><div class="focus-time" id="fTime" role="timer" aria-live="off"></div>
      ${f.task ? `<p class="focus-task">${esc(f.task)}</p>` : ''}<div class="focus-bar"><i id="fBar"></i></div>
      <div class="row" style="justify-content:center;margin-top:24px"><button class="btn btn-ghost" type="button" id="fPause"></button><button class="btn btn-ghost" type="button" id="fStop">End session</button></div>
      <div class="pills focus-sound" role="group" aria-label="Background sound">${[['off', 'No sound'], ['rain', 'Rain'], ['brown', 'Brown noise']].map(([k, l]) => `<button class="pill" type="button" data-snd="${k}" aria-pressed="${sound.kind === k}">${l}</button>`).join('')}</div></div>`;
    $$('[data-snd]', body).forEach(b => b.onclick = () => { setSound(b.dataset.snd); $$('[data-snd]', body).forEach(x => x.setAttribute('aria-pressed', x === b)); });
    const draw = () => {
      const now = f.paused || Date.now(), left = Math.max(0, f.end - now), mm = Math.floor(left / 6e4), ss = Math.floor(left % 6e4 / 1e3);
      const t = `${mm}:${String(ss).padStart(2, '0')}`; $('#fTime').textContent = t; document.title = `${t} · Lock in`;
      $('#fBar').style.width = `${100 - left / (f.min * 6e4) * 100}%`; $('#fPause').textContent = f.paused ? 'Resume' : 'Pause';
      if (left <= 0 && !f.paused) finishFocus(f, f.min);
    };
    clearInterval(focusTick); focusTick = setInterval(() => { if (cur?.kind !== 'focus') { clearInterval(focusTick); document.title = baseTitle; return; } draw(); }, 500); draw();
    $('#fPause').onclick = () => { if (f.paused) { f.end += Date.now() - f.paused; f.paused = null; } else f.paused = Date.now(); setFocus(f); draw(); };
    $('#fStop').onclick = () => { const done = Math.floor(((f.paused || Date.now()) - f.start) / 6e4); finishFocus(f, Math.min(f.min, done)); };
  }
  function finishFocus(f, min) {
    clearInterval(focusTick); setSound('off'); setFocus(null); document.title = baseTitle;
    const body = $('#ovBody');
    if (min >= 5) {
      Logic.addSession(S, { id: 'f' + f.start.toString(36), date: today(), min, sid: f.sid }); addXp(Math.round(min * 0.9)); bumpStreak(); save(); renderStats(); chime();
      if (min >= 25) burst(innerWidth / 2, innerHeight / 3, 120);
    }
    const todayMin = S.days[today()]?.min || 0;
    body.innerHTML = `<div class="focus-setup"><h2>${min >= 5 ? `${min} minutes locked in.` : 'Session ended.'}</h2><p class="note">${min >= 5 ? `+${Math.round(min * 0.9)} XP. ${todayMin} min focused today.` : 'Sessions under 5 minutes aren\'t logged.'}</p>
      <div class="row" style="margin-top:20px"><button class="btn" type="button" id="fAgain">Another session</button><button class="btn btn-ghost" type="button" id="fBreak">Take a 5 minute break</button></div></div>`;
    $('#fAgain').onclick = focusSetup;
    $('#fBreak').onclick = () => { const b = { sid: f.sid, min: 5, start: Date.now(), end: Date.now() + 3e5, task: 'Break. Stand up, drink water, look out a window.', paused: null, isBreak: true }; runBreak(b); };
  }
  function runBreak(b) { // a break is a timer that doesn't log anything
    const body = $('#ovBody');
    body.innerHTML = `<div class="focus-run"><p class="focus-sub">Break</p><div class="focus-time" id="fTime"></div><p class="focus-task">${esc(b.task)}</p><div class="row" style="justify-content:center;margin-top:24px"><button class="btn" type="button" id="fBack">Back to work</button></div></div>`;
    clearInterval(focusTick);
    focusTick = setInterval(() => { const left = Math.max(0, b.end - Date.now()); const el = $('#fTime'); if (!el) return clearInterval(focusTick); el.textContent = `${Math.floor(left / 6e4)}:${String(Math.floor(left % 6e4 / 1e3)).padStart(2, '0')}`; if (!left) { clearInterval(focusTick); chime(); focusSetup(); } }, 500);
    $('#fBack').onclick = () => { clearInterval(focusTick); focusSetup(); };
  }

  /* ---------------- home: report card, what's inside, what it does ---------------- */
  const GRADE = (m) => (m >= 85 ? 'A' : m >= 70 ? 'B' : m >= 50 ? 'C' : m >= 25 ? 'D' : m > 0 ? 'E' : '–');
  const FEATURES = [
    ['Levels that move with you', 'Three right in a row moves you up from Foundation to Standard to Complex. Two wrong drops you back.'],
    ['A list of your mistakes', 'Every question you get wrong is saved, diagrams and all, until you get it right twice.'],
    ['Practice exams', 'Timed papers built fresh every time, marked the moment you finish.'],
    ['Maths that looks like maths', 'Fractions, integrals and vectors set like a textbook. Type answers like 3π/4 or 2√3.'],
    ['Questions that never run out', 'Every exam question is generated with new numbers and comes with full working.'],
    ['Your own decks', 'Upload a textbook PDF or photos of your book and get notes, flashcards and questions.'],
    ['AI marking', 'In the Claude version, short answers are marked against the criteria and you can ask about any topic.'],
    ['Lock-in focus mode', 'A full-screen timer for 25 or 50 minutes of focus. Every session earns XP and lands on your study heatmap.'],
    ['A plan that writes itself', 'A day-by-day plan to every exam, aimed at your weakest topics, with a practice paper the day before each one.'],
    ['Leaderboards with mates', 'Make a private group, share the code, and race for XP each week.'],
    ['Writing feedback', 'Paste an essay or story and get it back marked up: thesis, quotes, techniques, dropped quotes, retelling, clichés and more.'],
    ['A quote bank that drills you', 'Save quotes for your English texts, then fill the gaps until you know them word for word.'],
    ['A daily challenge', 'One Complex question a day, the same for everyone. Beat it for 50 XP.'],
    ['Badges and ranks', '31 badges to unlock and ranks from Rookie to Mythic.'],
    ['Find anything fast', 'Press Ctrl+K (or /) to jump straight to any deck, topic or tool.'],
  ];
  function renderHome(el) {
    el.className = 'wrap section home';
    const subs = subjects().filter(s => decksOf(s.id).length), all = allDecks();
    const n = (f) => all.reduce((a, d) => a + f(d), 0);
    const cards = n(d => (d.cards || []).length), topics = n(d => (d.sections || []).length), gens = n(d => (d.bank || []).length + Object.keys(d.drills || {}).length);
    const answered = Object.values(S.p).reduce((a, p) => a + (p.att || 0), 0), cleared = Object.keys(S.cleared).length;
    const avg = (ds) => Math.round(ds.reduce((a, d) => a + mastery(d.id), 0) / ds.length);
    const best = (ds) => ds.map(levelOf).sort((a, b) => Logic.LEVELS.indexOf(b) - Logic.LEVELS.indexOf(a))[0];
    const hm = Logic.heat(S.days, new Date(), 12), weekMin = hm.slice(-7).reduce((a, d) => a + d.min, 0);
    el.innerHTML = `${dailyCardHtml()}<section class="plan" id="plan" aria-labelledby="plH"></section>
    <div class="home-grid">
      <section class="report" aria-labelledby="rcH">
        <h2 id="rcH">Report card</h2><p class="sec-sub">${esc(S.profile?.nickname || 'You')}, ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <table class="rc"><thead><tr><th scope="col">Subject</th><th scope="col">Mastery</th><th scope="col">Level</th><th scope="col">Grade</th></tr></thead>
          <tbody>${subs.map(s => { const ds = decksOf(s.id), m = avg(ds), L = best(ds); return `<tr class="c-${s.hue}"><th scope="row"><button class="linkbtn" type="button" data-subj-go="${esc(s.id)}">${esc(s.name)}</button></th><td><span class="rbar"><i style="width:${m}%"></i></span> ${m}%</td><td><span class="d-level lvl-${L}">${LNAME[L]}</span></td><td class="grade">${GRADE(m)}</td></tr>`; }).join('')}</tbody></table>
        ${rankHtml()}<dl class="tallies"><div><dt>XP</dt><dd>${S.xp}</dd></div><div><dt>Day streak</dt><dd>${S.streak.n}</dd></div><div><dt>Marks attempted</dt><dd>${answered}</dd></div><div><dt>Mistakes cleared</dt><dd>${cleared}</dd></div></dl>
        <div class="heat-head"><h3>Study days</h3><span>${weekMin} min focused this week</span></div>
        <div class="heat" role="img" aria-label="Study activity over the last 12 weeks">${hm.map(d => `<i class="h${d.level}" title="${esc(new Date(d.date + 'T12:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }))}: ${d.min} min focused, ${d.marks} marks"></i>`).join('')}</div>
        <div class="heat-key" aria-hidden="true">Less <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> More</div>
        ${badgesHtml()}
        <div class="row"><button class="btn" type="button" id="shareCard">Make a share card</button><button class="btn btn-ghost" type="button" id="shareSite">Share Lock in</button>${Gate.isAdmin() ? '<button class="btn btn-ghost" type="button" id="keysBtn">Admin</button>' : ''}</div>
      </section>
      <section class="inside" aria-labelledby="inH">
        <h2 id="inH">What's inside</h2>
        <p class="sec-sub">${all.length} decks, ${cards} flashcards, ${topics} topics of notes and ${gens} question generators that never run out.</p>
        ${subs.map(s => `<div class="in-sub c-${s.hue}"><h3>${esc(s.name)}${s.exam ? `<small>${esc(shortDate(s.exam))}</small>` : ''}</h3><ul>${decksOf(s.id).map(d => `<li><button class="linkbtn" type="button" data-open="${esc(d.id)}">${esc(d.title)}</button><span>${esc(d.chapter || '')}</span></li>`).join('')}</ul></div>`).join('')}
      </section>
    </div>
    <section class="features" aria-labelledby="ftH"><h2 id="ftH">What it does</h2><dl>${FEATURES.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl></section>`;
    $('#shareSite').onclick = () => copyText(location.href.split('#')[0], Gate.enabled ? 'Link copied. They\'ll need a key from you too.' : 'Link copied. Send it to your mates.', el);
    if ($('#keysBtn', el)) $('#keysBtn', el).onclick = openAdmin;
    $('#shareCard', el).onclick = openShare;
    if ($('#dailyGo', el)) $('#dailyGo', el).onclick = openDaily;
    renderPlan();
    $$('[data-subj-go]', el).forEach(b => b.onclick = () => { S.subj = b.dataset.subjGo; save(); renderTabs(); renderSubject(); });
  }
  function renderSubject() {
    if (S.subj === 'home') return renderHome($('#subject'));
    const s = getSubj(S.subj), ds = decksOf(s.id), el = $('#subject'), nm = mistakesOf(s.id).length;
    el.className = 'wrap section c-' + s.hue;
    el.innerHTML = `<div class="subj-head"><div><h2>${esc(s.name)}</h2><p class="subj-meta">${s.exam ? `Exam ${esc(s.when)}. ` : ''}${esc(s.format)}</p>${!papersHere && ['y12', 'e1', 'phys'].includes(s.id) ? '<p class="subj-meta">Past papers and mix and match are in the Lock in app on your computer.</p>' : ''}${hasPapers(s.id) ? (() => { const done = papersOf(s.id).filter(p => p.result); return `<p class="subj-meta">${done.length ? `Past papers: ${done.length} of ${PAPERS.LIST[s.id].length} done, best ${Math.max(...done.map(p => pct(p.result)))}%.` : `${PAPERS.LIST[s.id].length} HSC past papers to sit.`}</p>`; })() : ''}${nm ? `<button class="linkbtn mist-link" type="button" data-act="mistakes" data-s="${esc(s.id)}">${nm} mistake${nm > 1 ? 's' : ''} to fix</button>` : ''}</div>
      <div class="subj-actions">${hasPapers(s.id) ? `<button class="btn btn-hot" type="button" data-act="papers" data-s="${esc(s.id)}">Past papers</button>` : ''}${s.id === 'eng' ? '<button class="btn btn-hot" type="button" data-act="read">Read the book</button><button class="btn btn-ghost" type="button" data-act="writing">Writing feedback</button>' : ''}${s.mock ? `<button class="btn" type="button" data-act="mock" data-s="${s.id}">Practice exam${s.mock === 'geo' ? ', 45 min' : ''}</button>` : ''}${ds.length ? `<button class="btn btn-ghost" type="button" data-act="cards" data-s="${esc(s.id)}">All flashcards</button>` : ''}<button class="btn btn-ghost" type="button" data-act="upload" data-s="${esc(s.id)}">Upload notes</button></div></div>
      ${ds.length ? `<ol class="decks">${ds.map(d => { const m = mastery(d.id), L = levelOf(d); return `<li><button class="deck ${hue(d)}" type="button" data-open="${esc(d.id)}">
          <span class="d-ch">${esc(d.chapter || 'Yours')}</span>
          <span class="d-main"><span class="d-title">${esc(d.title)}${d.custom ? ` <small>${d.ai ? 'made by AI' : 'quick deck'}</small>` : ''}</span><span class="d-blurb">${fm(d.blurb || '')}</span></span>
          <span class="d-level lvl-${L}" title="Your level">${LNAME[L]}</span>
          <span class="d-mastery"><span class="rbar"><i style="width:${m}%"></i></span><span class="rpct">${m}%</span></span></button></li>`; }).join('')}</ol>`
        : `<div class="empty"><h3>No ${esc(s.name)} decks yet</h3><p>Upload class notes or textbook pages (scans work too) and you'll get notes, flashcards and exam questions.</p><button class="btn" type="button" data-act="upload" data-s="${esc(s.id)}">Upload ${esc(s.name)} notes</button></div>`}`;
  }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o && !o.closest('#ov')) { openDeck(o.dataset.open); return; }
    const a = e.target.closest('[data-act]'); if (!a || a.closest('#ov')) return;
    const act = a.dataset.act;
    if (act === 'mock') openMock(a.dataset.s);
    if (act === 'cards') openSubjectCards(a.dataset.s);
    if (act === 'weak') openDeck(a.dataset.d, 'practice', a.dataset.t);
    if (act === 'mistakes') openMistakes(a.dataset.s);
    if (act === 'writing') openWriting();
    if (act === 'read') openReader();
    if (act === 'papers') openPapers(a.dataset.s);
    if (act === 'quotes') openQuotes();
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
        if (del.dataset.sure) { S.custom = S.custom.filter(x => x.id !== d.id); delete S.p[d.id]; S.gone[d.id] = Date.now(); save(); closeOv(); renderTabs(); toast('Deck deleted'); }
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
        <h3>${s.code ? `<span class="code">${esc(s.code)}</span>` : ''}<span>${fm(s.name)}</span>${s.ext ? '<span class="bonus">Year 9 extension</span>' : ''}</h3>
        <ul>${(s.notes || []).map(n => `<li>${fm(n)}</li>`).join('')}</ul>
        ${hasPracticeFor(d, s.code) ? `<button class="btn btn-ghost btn-sm" type="button" style="margin-top:12px" data-prac="${esc(s.code)}">Practise this topic</button>` : ''}
      </div>${s.ex ? `<div class="worked"><div class="eyebrow" style="margin-bottom:6px">Worked example</div><div class="wq">${fm(s.ex[0])}</div><ol>${s.ex.slice(1).map(x => `<li>${fm(x)}</li>`).join('')}</ol></div>` : ''}</div>`).join('');
    $$('[data-prac]', el).forEach(b => b.onclick = () => { cur.tab = 'practice'; cur.filter = b.dataset.prac; renderDeckOv(); });
  }

  /* ---------------- flashcards (swipe right = got it, left = still learning) ---------------- */
  function openSubjectCards(sid) {
    const s = getSubj(sid); const cards = decksOf(sid).flatMap(deckCards);
    cur = { kind: 'cards', tab: null }; const body = ovFrame(`All ${s.name} flashcards`, 'c-' + s.hue, null); viewCards(body, cards); showOv();
  }
  function viewCards(el, cards) {
    if (!cards.length) { el.innerHTML = '<p class="note">No flashcards here yet.</p>'; return; }
    const known = (c) => !!S.p[c.deckId]?.known?.[c.idx];
    let queue = shuffle(cards.filter(c => !known(c))); let total = cards.length;
    if (!queue.length) queue = shuffle(cards.slice());
    el.innerHTML = `<div class="fc-wrap"><div class="fc-bar"><i id="fcBar"></i></div>
      <div class="fc" id="fc" tabindex="0" role="button" aria-label="Flashcard. Press space to flip."><div class="fc-in"><div class="fc-face fc-front"><span class="deckname" id="fcDeck"></span><div class="t" id="fcQ"></div><div class="hint">Tap to flip. Swipe right if you knew it, left if not.</div></div><div class="fc-face fc-back"><div id="fcA"></div></div></div></div>
      <div class="fc-ctrl"><button class="btn btn-bad" id="fcAgain" type="button">Still learning</button><button class="btn btn-good" id="fcGot" type="button">Got it</button></div>
      <div class="fc-sub"><span class="mono" style="font-size:13px;color:var(--muted)"><b id="fcK" style="color:var(--chalk)"></b> of ${total} known, <span id="fcLeft"></span> left this round</span><span class="row"><button class="btn btn-ghost btn-sm" id="fcShuf" type="button">Shuffle</button><button class="btn btn-ghost btn-sm" id="fcReset" type="button">Reset</button></span></div></div>`;
    const fc = $('#fc', el);
    const stats = () => { const k = cards.filter(known).length; $('#fcK', el).textContent = k; $('#fcBar', el).style.width = (k / total * 100) + '%'; $('#fcLeft', el).textContent = queue.length; };
    const show = (dir = 1) => {
      stats();
      if (!queue.length) { fc.outerHTML = `<div class="empty" style="height:320px;display:grid;place-content:center"><h3>All cards known</h3><p>Hit Reset to go again, or try the exam questions.</p></div>`; $('.fc-ctrl', el).hidden = true; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 150, 120); return; }
      const c = queue[0]; fc.classList.remove('flip'); fc.style.transform = '';
      $('#fcQ', el).innerHTML = fm(c.q); $('#fcA', el).innerHTML = fm(c.a); $('#fcDeck', el).textContent = c.deckTitle || '';
      if (hasGsap && !reduce) gsap.fromTo(fc, { x: 50 * dir, opacity: .2, rotate: 3 * dir }, { x: 0, opacity: 1, rotate: 0, duration: .35, ease: 'back.out(1.6)' });
    };
    const got = () => { const c = queue.shift(); if (!c) return; prog(c.deckId).known[c.idx] = 1; addXp(3); bumpStreak(); save(); renderStats(); xpPop($('#fcGot', el), '+3'); show(1); };
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
  const shortQ = (s, d) => ({ stem: '', passage: s.passage || '', level: 'C', gen: null, tags: s.tags || [], deckId: d.id, deckTitle: d.title, parts: [{ label: '', q: s.q, type: 'short', marks: s.marks || 3, criteria: s.criteria || [], model: s.model || '', steps: [] }] });
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
    card.innerHTML = `<div class="qhead">${num != null ? `<span class="qn">Q${num}</span>` : ''}${q.level ? `<span class="lvl lvl-${q.level}">${{ F: 'Foundation', S: 'Standard', C: 'Complex' }[q.level]}</span>` : ''}${q.ext ? '<span class="bonus">Year 9 ext.</span>' : ''}<span>${esc((q.tags || []).join(', '))}${q.deckTitle && mode === 'exam' ? '' : ''}</span><span class="mk">${total} mark${total > 1 ? 's' : ''}</span></div>
      ${q.stem ? `<div class="qstem">${fm(q.stem)}</div>` : ''}${q.passage ? `<div class="passage">${String(q.passage).split('\n').map(l => fm(l) || '&nbsp;').join('<br>')}</div>` : ''}${V.render(q.visual)}<div class="parts"></div>`;
    const host = $('.parts', card);
    q.parts.forEach(p => host.appendChild(renderPart(p, q, mode, onPart)));
    return card;
  }
  function renderPart(p, q, mode, onPart) {
    const el = document.createElement('div'); el.className = 'part' + (p.label ? '' : ' nolabel');
    p._got = null; p._ans = null; p._done = false;
    const mk = (p.marks || 1) > 1 ? `<span class="pm">[${p.marks} marks]</span>` : '';
    let body = '';
    if (p.type === 'choice') body = `<div class="choices">${p.choices.map((c, i) => `<button class="choice" type="button" data-i="${i}">${fm(c)}</button>`).join('')}</div>`;
    else if (p.type === 'short') body = `<textarea class="field sa" placeholder="Write your answer like you would in the exam…" aria-label="Your answer"></textarea>${mode === 'practice' ? `<div class="row">${aiReady() ? '<button class="btn btn-hot btn-sm" type="button" data-k="ai">Mark it with AI</button>' : ''}<button class="btn btn-ghost btn-sm" type="button" data-k="self">${aiReady() ? 'Mark it myself' : 'Show marking guide'}</button></div>` : ''}`;
    else body = `<div class="ans"><input class="field" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="${p.type === 'ratio' || p.type === 'pm' ? 'text' : 'decimal'}" placeholder="${p.type === 'ratio' ? 'e.g. 3:4' : p.type === 'pm' ? 'e.g. ±5' : p.type === 'pct' ? 'e.g. 25%' : 'e.g. 3/8, 2√3 or 3π/4'}" aria-label="Answer for part ${esc(p.label || '')}">${mode === 'practice' ? '<button class="btn btn-hot" type="button" data-k="check">Check</button><button class="btn btn-ghost" type="button" data-k="show">Show answer</button>' : ''}</div>${p.type === 'ratio' ? '' : `<div class="keys" role="group" aria-label="Maths keys">${(p.type === 'pm' ? ['±', '√', '/'] : ['√', 'π', '^', '/', '(', ')', '−']).map(k => `<button class="key" type="button" data-ins="${k}" aria-label="Type ${k}">${k}</button>`).join('')}<span class="evalv" aria-live="polite"></span></div>`}${p.hint ? `<div class="note" style="font-size:13px">${fm(p.hint)}</div>` : ''}`;
    el.innerHTML = `${p.label ? `<div class="pl">${esc(p.label)}</div>` : ''}<div class="pbody"><div class="pq">${fm(p.q)}${mk}</div>${body}<div class="pfb"></div></div>`;
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
      const ev = $('.evalv', el);
      inp.oninput = () => { // show what an expression like 3π/4 works out to
        p._ans = inp.value;
        if (!ev) return;
        const v = !isFinite(X.parseAns(inp.value).v) ? MathIn.evaluate(inp.value) : NaN;
        ev.textContent = isFinite(v) ? `= ${Math.round(v * 1e4) / 1e4}` : '';
      };
      $$('.key', el).forEach(k => k.onclick = () => {
        const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a;
        inp.setRangeText(k.dataset.ins === '−' ? '-' : k.dataset.ins, a, b, 'end'); inp.focus(); inp.oninput();
      });
      const go = () => { if (!inp.value.trim()) { inp.focus(); return; } finish(check(p, inp.value), inp.value); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (mode === 'practice') go(); } });
      const cb = $('[data-k=check]', el); if (cb) cb.onclick = go;
      const sb = $('[data-k=show]', el); if (sb) sb.onclick = () => finish(false, null);
    }
    return el;
  }
  function showFeedback(fb, p, q, ok, given) {
    const steps = p.steps?.length ? `<ol class="steps">${p.steps.map(s => `<li>${fm(s)}</li>`).join('')}</ol>` : '';
    const head = ok ? pick(['Locked in.', 'Correct!', 'Clean.', 'Yep.', 'Too easy.']) : given == null || given === '' ? `Answer: ${fm(p.show)}` : `Not quite. Answer: ${fm(p.show)}`;
    fb.innerHTML = `<div class="fb ${ok ? 'good' : given == null || given === '' ? 'info' : 'bad'}"><b>${head}</b>${steps}${!ok && aiReady() && given != null && given !== '' ? `<div style="margin-top:8px"><button class="linkbtn" type="button">Explain my mistake (AI)</button></div><div class="ai" hidden></div>` : ''}</div>`;
    const lb = $('.linkbtn', fb); if (lb) lb.onclick = () => explainMistake(p, q, given, $('.ai', fb), lb);
  }
  async function explainMistake(p, q, given, box, btn) {
    btn.disabled = true; box.hidden = false; box.textContent = 'Thinking…';
    const ans = p.type === 'choice' ? p.choices[given] : given;
    const prompt = `You are a friendly, encouraging tutor for ${whoFor(getDeck(q.deckId)?.subject)}. They got an exam question wrong. In under 120 words, explain the most likely mistake in their thinking and how to get the right answer. Use simple language and show the key working. No greeting. Formatting: use **double asterisks** for key words, write all maths in LaTeX between single $ signs (e.g. $\\frac{3}{4}$, $x^2$).

${q.passage || q.extractText ? `Text: """${q.passage || q.extractText}"""\n` : ''}Question: ${q.stem || ''} ${p.q}
Correct answer: ${p.show}
Worked solution: ${(p.steps || []).join(' | ')}
Student's answer: ${ans}`;
    try { await AI.fn(prompt, { modelTier: 'quick', onText: ({ text }) => { box.innerHTML = Fmt.rich(text); } }); }
    catch (e) { box.textContent = e?.text || AI.msg(e); }
    finally { btn.remove(); }
  }
  function critList(p, met) {
    return `<ul class="crit">${p.criteria.map((c, i) => met ? `<li class="${met[i] ? 'met' : 'miss'}">${met[i] ? '✓' : '✗'} ${fm(c)}</li>` : `<li><label><input type="checkbox" data-c="${i}"> <span>${fm(c)}</span></label></li>`).join('')}</ul>`;
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
    const prompt = `You are a fair but strict NSW teacher marking a short-answer exam question written by ${whoFor(getDeck(q.deckId)?.subject)}.

${q.passage || q.extractText ? `Text the question is about:\n"""${q.passage || q.extractText}"""\n\n` : ''}Question (${p.marks} marks): ${q.stem ? q.stem + ' ' : ''}${p.q}
Marking criteria (about one mark each):
${crit}
Model answer: ${p.model || '(none)'}

Student's answer:
"""${answer.slice(0, 4000)}"""

Award marks only for what the student actually wrote. Write any maths in the feedback as LaTeX between $ signs. Reply with ONLY this JSON:
{"marks": <whole number 0-${p.marks}>, "met": [${p.criteria.map(() => 'true/false').join(', ')}], "feedback": "2-3 short sentences: what was good, and exactly what to add or fix for full marks"}`;
    try {
      const j = await AI.fn.json(prompt, { modelTier: 'default', cache: false });
      const marks = Math.max(0, Math.min(p.marks, Math.round(Number(j.marks) || 0)));
      const met = Array.isArray(j.met) ? p.criteria.map((_, i) => !!j.met[i]) : null;
      return { ok: true, marks, met, feedback: String(j.feedback || '') };
    } catch (e) { return { ok: false, err: AI.msg(e) }; }
  }
  function renderShortResult(fb, p, r) {
    fb.innerHTML = `<div class="fb ${r.marks === p.marks ? 'good' : r.marks ? 'info' : 'bad'}"><b>${r.marks}/${p.marks} marks</b>${r.feedback ? `<div style="margin-top:6px">${Fmt.rich(r.feedback)}</div>` : ''}${p.criteria.length ? critList(p, r.met) : ''}
      ${p.model ? `<details style="margin-top:10px"><summary class="linkbtn" style="cursor:pointer">See a full-marks answer</summary><div style="margin-top:8px">${fm(p.model)}</div></details>` : ''}</div>`;
  }
  function selfMark(p, q, answer, fb, el, onPart) {
    fb.innerHTML = `<div class="fb info"><b>Marking guide: tick each point your answer covers</b>${critList(p, null)}${p.model ? `<div style="margin-top:10px"><span class="eyebrow">Full-marks answer</span><div style="margin-top:4px">${fm(p.model)}</div></div>` : ''}<div class="row" style="margin-top:10px"><button class="btn btn-sm btn-acc" type="button" data-k2="save">Save my mark</button></div></div>`;
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
      <div class="qnav"><button class="btn btn-hot" type="button" id="nextQ">Next question</button></div>`;
    const drawLvl = (pulse) => {
      const auto = cur.level === 'auto', L = auto ? levelOf(d) : cur.level, box = $('#lvlNow', el);
      box.innerHTML = `<span class="lvl-badge lvl-${L}">${auto ? 'Level' : 'Fixed at'}: ${LNAME[L]}</span><span class="lvl-hint">${auto ? esc(lvlHint(d)) : 'Manual level: your level won\'t change'}</span>`;
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
      if (moved === 'up') { toast(`Level up: you're on ${LNAME[levelOf(d)]} now`); burst(innerWidth / 2, 140, 110); }
      if (moved === 'down') toast(`Back to ${LNAME[levelOf(d)]} for now. Build it back up.`);
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
  /* ---------------- mistakes ---------------- */
  const missed = (q) => q.parts.some(p => (p._got || 0) < (p.marks || 1));
  const missedN = (ex) => ex.blocks.filter(q => allDone(q) && missed(q)).length;
  const mistakesOf = (sid) => S.mistakes.filter(m => { const d = getDeck(m.deckId); return d && (!sid || d.subject === sid); });
  function renderMistakeCount() { const n = mistakesOf().length, b = $('#mistN'); if (b) { b.textContent = n; $('#mistBtn').classList.toggle('has', n > 0); } }
  // Called once a question is fully marked. `redo` = {id, fresh} when it came from the mistakes list.
  function noteResult(q, d, redo) {
    if (redo && !missed(q)) {
      const key = S.mistakes.find(m => m.id === redo.id)?.key;
      const r = Logic.fixMistake(S.mistakes, redo.id); S.mistakes = r.list; if (r.removed && key) S.cleared[key] = Date.now();
      toast(r.removed ? 'Cleared from your mistakes' : 'Fixed! Get it right once more to clear it');
    } else if (redo && !redo.fresh) S.mistakes = Logic.missAgain(S.mistakes, redo.id);
    else if (missed(q)) S.mistakes = Logic.addMistake(S.mistakes, { deckId: d.id, q, gen: q.gen }, Date.now());
    else return;
    save(); renderMistakeCount();
  }
  function freshQ(m) {
    const d = getDeck(m.deckId); if (!d || !m.gen) return null;
    if (m.gen.startsWith('drill:')) return d.drills?.[m.gen.slice(6)] ? drillQ(d, m.gen.slice(6)) : null;
    const fn = (d.bank || []).find(f => f.name === m.gen);
    return fn ? bankQ(fn, d, m.q.level) : null;
  }
  const ago = (t) => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago'; };
  const firstLine = (q) => { const t = (q.stem || q.parts[0]?.q || '').replace(/\s+/g, ' '); return t.length > 110 ? t.slice(0, 110) + '…' : t; };
  function openMistakes(sid) {
    cur = { kind: 'mistakes', tab: null, sid: sid || null };
    ovFrame('Mistakes to fix', 'c-coral', null); drawMistakes(); showOv();
  }
  function drawMistakes() {
    const body = $('#ovBody'), list = mistakesOf(cur.sid), subs = subjects().filter(s => mistakesOf(s.id).length);
    renderMistakeCount();
    if (!mistakesOf().length) { body.innerHTML = `<div class="empty"><h3>No mistakes to fix</h3><p>Anything you get wrong in practice, drills or practice exams lands here. Get it right twice and it's cleared.</p></div>`; return; }
    const groups = {}; list.slice().sort((a, b) => a.at - b.at).forEach(m => (groups[m.deckId] ||= []).push(m));
    body.innerHTML = `<p class="note" style="margin:0 0 12px">Get each one right <b>twice</b> to clear it. <b>Fresh version</b> gives you the same kind of question with new numbers.</p>
      <div class="filters" role="group" aria-label="Subject"><button class="fchip" type="button" data-ms="" aria-pressed="${!cur.sid}">All (${mistakesOf().length})</button>${subs.map(s => `<button class="fchip" type="button" data-ms="${esc(s.id)}" aria-pressed="${cur.sid === s.id}">${esc(s.name)} (${mistakesOf(s.id).length})</button>`).join('')}</div>
      <div class="row" style="margin:6px 0 16px">${list.length ? `<button class="btn btn-hot" type="button" id="redoAll">Redo all ${list.length}</button>` : ''}</div>
      ${Object.entries(groups).map(([id, ms]) => { const d = getDeck(id); return `<div class="mgroup ${hue(d)}"><h3>${esc(d.title)} <span class="mono">${ms.length}</span></h3>${ms.map(m => `<div class="mrow"><div class="mtxt"><div class="mq">${fm(firstLine(m.q))}</div><div class="mmeta">${m.q.level ? `<span class="lvl-chip lvl-${m.q.level}">${m.q.level}</span>` : ''}${ago(m.at)}${m.fixes ? ' · 1 of 2 fixed' : ''}</div></div><div class="row"><button class="btn btn-sm btn-ghost" type="button" data-redo="${m.id}">Redo</button>${freshQ(m) ? `<button class="btn btn-sm btn-ghost" type="button" data-fresh="${m.id}">Fresh version</button>` : ''}</div></div>`).join('')}</div>`; }).join('')}`;
    $$('[data-ms]', body).forEach(b => b.onclick = () => { cur.sid = b.dataset.ms || null; drawMistakes(); });
    $$('[data-redo]', body).forEach(b => b.onclick = () => redoMistakes([b.dataset.redo], false));
    $$('[data-fresh]', body).forEach(b => b.onclick = () => redoMistakes([b.dataset.fresh], true));
    const ra = $('#redoAll', body); if (ra) ra.onclick = () => redoMistakes(list.slice().sort((a, b) => a.at - b.at).map(m => m.id), false);
  }
  // Walks through the given mistakes one at a time.
  function redoMistakes(ids, fresh) {
    const body = $('#ovBody'); let i = 0;
    const show = () => {
      const m = S.mistakes.find(x => x.id === ids[i]);
      if (!m) { if (++i < ids.length) return show(); drawMistakes(); return; }
      const d = getDeck(m.deckId), q = (fresh && freshQ(m)) || JSON.parse(JSON.stringify(m.q));
      body.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="eyebrow">${esc(d.title)}: ${i + 1} of ${ids.length}${fresh ? ', fresh version' : ''}</span><button class="linkbtn" type="button" id="mBack">← All mistakes</button></div><div id="qHost"></div>
        <div class="qnav"><button class="btn btn-hot" type="button" id="mNext">${i + 1 < ids.length ? 'Next mistake' : 'Done'}</button></div>`;
      $('#qHost', body).appendChild(renderCard(q, { mode: 'practice', onPart: (p) => { record(d.id, q.tags, p._got || 0, p.marks || 1); if (allDone(q) && !q._counted) { q._counted = true; noteResult(q, d, { id: m.id, fresh }); } } }));
      $('#mBack', body).onclick = drawMistakes;
      $('#mNext', body).onclick = () => { i++; if (i < ids.length) show(); else drawMistakes(); };
      ov.scrollTo({ top: 0 });
    };
    show();
  }
  async function aiMoreQuestions(d, btn, done) {
    btn.disabled = true; const old = btn.textContent; btn.textContent = 'Writing questions… (about a minute)';
    const notes = deckContext(d);
    const prompt = `Write NEW exam practice questions for ${whoFor(d.subject)}, studying "${d.title}" (${getSubj(d.subject).name}). Base them only on these notes and match the style of school exams.

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
  function drillQ(d, key) {
    const r = d.drills[key]();
    const part = { label: '', q: r.q, type: r.type, value: r.value, show: r.show, steps: r.steps, marks: 1, hint: r.hint, choices: r.choices };
    return { stem: '', level: 'F', gen: 'drill:' + key, tags: [r.tag], deckId: d.id, deckTitle: d.title, parts: [part], visual: null };
  }
  function viewDrills(el, d) {
    const sess = { ok: 0, n: 0 };
    el.innerHTML = `<p class="note" style="margin:0 0 6px">Fast one-step questions to warm up. Exam questions are the main event.</p><div class="session"><span>Session <b id="dOk">0</b>/<b id="dN">0</b></span></div><div id="qHost"></div><div class="qnav"><button class="btn btn-hot" type="button" id="nextQ">Next</button></div>`;
    const host = $('#qHost', el);
    const next = () => {
      const q = drillQ(d, pick(Object.keys(d.drills)));
      host.innerHTML = ''; host.appendChild(renderCard(q, { mode: 'practice', onPart: (p) => { sess.n++; if (p._got) sess.ok++; $('#dOk', el).textContent = sess.ok; $('#dN', el).textContent = sess.n; record(d.id, q.tags, p._got, 1); noteResult(q, d); } }));
    };
    $('#nextQ', el).onclick = next; next();
  }

  /* ---------------- practice exams ---------------- */
  function buildMock(sid) {
    if (sid === 'eng') return buildEngMock();
    const blocks = [];
    if (sid !== 'geo' && sid !== 'maths') { // any other subject: two bank questions per deck plus a quick multiple choice
      const s = getSubj(sid);
      decksOf(sid).filter(d => d.bank).forEach(d => {
        blocks.push(bankQ(pick(d.bank), d, 'S'), bankQ(pick(d.bank), d, 'C'));
        const c = conceptsOf(d); if (c.length) blocks.push(mcqQ(pick(c), d));
        const sh = shortOf(d); if (sh.length) blocks.push(shortQ(pick(sh), d)); // extended response, where the deck has them
      });
      return { sid, title: `${s.name} practice exam`, minutes: 60, blocks: shuffle(blocks), acc: 'c-' + s.hue, intro: `Questions from every topic in the style of the HSC paper, plus multiple choice${blocks.some(q => q.parts[0].type === 'short') ? ' and extended responses' : ''}. 60 minutes.` };
    }
    if (sid === 'geo') {
      const maps = G.mapDeck, water = G.waterDeck;
      blocks.push(bankQ(G.BANK.maps[0], maps, 'C'));
      blocks.push(bankQ(G.BANK.maps[3], maps)); // climate graph
      blocks.push(bankQ(G.BANK.maps[2], maps)); // scale
      shuffle(conceptsOf(maps)).slice(0, 7).forEach(c => blocks.push(mcqQ(c, maps)));
      shuffle(conceptsOf(water)).slice(0, 5).forEach(c => blocks.push(mcqQ(c, water)));
      shuffle(shortOf(water)).slice(0, 3).forEach(s => blocks.push(shortQ(s, water)));
      return { sid, title: 'Geography practice exam', minutes: 45, blocks, acc: 'c-green', intro: 'Section 1: Geographical tools and skills (25 multiple choice). Section 2: Water in the World (5 multiple choice + 3 short answers). 45 minutes, like the real thing.' };
    }
    const md = decksOf('maths').filter(d => d.inExam !== false); // only chapters in the real exam
    md.forEach(d => {
      if (!d.bank) return;
      const lo = d.bank.map(f => bankQ(f, d)).filter(q => q.level !== 'C'), hi = d.bank.map(f => bankQ(f, d)).filter(q => q.level !== 'F');
      const a = pick(lo), b = pick(hi.filter(q => q.stem !== a.stem)) || pick(hi);
      blocks.push(a, b);
    });
    md.forEach(d => { const c = conceptsOf(d); if (c.length) blocks.push(mcqQ(pick(c), d)); });
    return { sid, title: 'Maths practice exam', minutes: 60, blocks: shuffle(blocks), acc: 'c-gold', intro: 'Two multi-part questions from each chapter (8, 9, 10, 12) plus quick multiple choice. 60 minutes. Calculator allowed.' };
  }
  // Year 8 English Task 4 (20 marks, 60 minutes): three extracts with their questions grouped underneath.
  // The extract sets and questions live in english.js (EN.buildPaper); this turns them into exam blocks.
  function buildEngMock() {
    const paper = EN.buildPaper(), blocks = [];
    const deckFor = { mc: 'afplot', emotion: 'afthemes', technique: 'aftech', creative: 'afwrite', petal: 'afwrite' };
    paper.groups.forEach(g => {
      const first = blocks.length + 1, last = first + g.items.length - 1;
      g.items.forEach((it, i) => {
        const d = getDeck(deckFor[it.kind]) || { id: 'afwrite', title: 'Animal Farm' };
        blocks.push({ stem: '', gen: null, level: it.level, tags: it.tags, parts: it.parts, deckId: d.id, deckTitle: d.title, kind: it.kind, extractText: g.text,
          extract: i === 0 ? { label: g.label, title: g.title, text: g.text, qs: first === last ? `Question ${first}` : `Questions ${first} to ${last}` } : null });
      });
    });
    return { sid: 'eng', title: 'English practice exam: Animal Farm', minutes: paper.minutes, blocks, acc: 'c-pink', intro: 'Modelled on Task 4: three extracts from Animal Farm, with the questions for each underneath. Extract 1: three multiple choice (1 mark each) and a 2 mark emotion question with ONE quote. Extract 2: a 3 mark question (ONE quote, a technique and its effect) and a 5 mark creative journal entry from another character. Extract 3: a 7 mark extended response in 1 or 2 PETAL paragraphs about power, control and corruption. 20 marks, 60 minutes. The extracts change each time.' };
  }
  // Heading and text of an extract, shown once above the questions that use it.
  function extractHead(x) {
    const h = document.createElement('div'); h.className = 'extract-head';
    h.innerHTML = `<div class="eyebrow">Read ${esc(x.label.split(':')[0])} and answer ${esc(x.qs)}</div><div class="qstem"><b>${esc(x.label)}</b>: ${esc(x.title)}</div><div class="passage">${String(x.text).split('\n').map(l => fm(l) || '&nbsp;').join('<br>')}</div>`;
    return h;
  }
  function openMock(sid) {
    const ex = buildMock(sid);
    cur = { kind: 'mock', tab: null, ex, done: false, end: Date.now() + ex.minutes * 6e4 };
    const body = ovFrame(ex.title, ex.acc, null, `<span class="timer" id="timer">${ex.minutes}:00</span>`);
    const total = ex.blocks.reduce((a, q) => a + q.parts.reduce((b, p) => b + (p.marks || 1), 0), 0);
    body.innerHTML = `<div class="note" style="margin-bottom:16px;max-width:820px">${esc(ex.intro)} Answers are marked when you finish. <b>${total} marks total.</b></div><div id="paper"></div>
      <div class="qnav"><button class="btn btn-hot" type="button" id="finish">Finish & mark my exam</button></div>`;
    const paper = $('#paper', body);
    let n = 0; ex.blocks.forEach(q => { n++; if (q.extract) paper.appendChild(extractHead(q.extract)); paper.appendChild(renderCard(q, { mode: 'exam', num: n })); });
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
      if (!ans) { s.p._got = 0; s.p._done = true; fb.innerHTML = `<div class="fb bad"><b>No answer (0/${s.p.marks})</b>${critList(s.p, s.p.criteria.map(() => false))}${s.p.model ? `<div style="margin-top:8px">${fm(s.p.model)}</div>` : ''}</div>`; continue; }
      if (aiReady()) { fb.innerHTML = '<div class="fb info"><b>Marking with AI…</b></div>'; const r = await aiMark(s.p, s.q, ans); if (r.ok) { s.p._got = r.marks; s.p._done = true; renderShortResult(fb, s.p, r); continue; } }
      s.p._got = null; selfMark(s.p, s.q, ans, fb, s.el, () => showResults(body));
    }
    ex.blocks.forEach(q => q.parts.forEach(p => { if (p._got != null) record(q.deckId, q.tags, p._got, p.marks || 1); }));
    ex.blocks.forEach(q => { const d = getDeck(q.deckId); if (d && allDone(q)) noteResult(q, d); });
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
    res.innerHTML = `<div class="eyebrow">Your score</div><div class="score">${got}/${out}</div><p style="font-size:18px;font-weight:800;margin:6px 0">${pct}%. ${msg}</p>${pending ? `<p class="note">+ ${pending} marks of short answers still to self-mark below.</p>` : ''}
      <div class="bars">${Object.entries(byDeck).map(([k, [g, o]]) => { const v = o ? g / o : 0; return `<div class="bar"><span>${esc(k)}</span><div class="tr"><i style="width:${v * 100}%;background:${v >= .8 ? 'var(--good)' : v >= .5 ? 'var(--gold)' : 'var(--bad)'}"></i></div><span class="n">${g}/${o}</span></div>`; }).join('')}</div>
      <div class="row" style="margin-top:16px">${missedN(ex) ? `<button class="btn btn-acc" type="button" id="fixMist">Fix my ${missedN(ex)} mistake${missedN(ex) > 1 ? 's' : ''}</button>` : ''}<button class="btn btn-hot" type="button" id="again">New practice exam</button></div>`;
    const fm = $('#fixMist', res); if (fm) fm.onclick = () => { closeOv(); openMistakes(); };
    $('#again', res).onclick = () => { closeOv(); openMock(ex.sid); };
    ov.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (pct >= 70 && !pending) { burst(innerWidth / 2, 160, 160); }
    if (pct >= 85 && !pending && out >= 10) { S.flags.mock85 = 1; save(); }
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
    const draw = () => { chat.innerHTML = hist.length ? hist.map(m => `<div class="msg ${m.role === 'user' ? 'me' : 'bot'}">${m.role === 'user' ? esc(m.content) : Fmt.rich(m.content)}</div>`).join('') : `<p class="note">Ask anything about <b>${esc(d.title)}</b>. It knows your notes for this deck.</p>`; };
    draw();
    const send = async (text) => {
      const q = (text || $('#askIn', el).value).trim(); if (!q) return; $('#askIn', el).value = '';
      hist.push({ role: 'user', content: q }); draw(); const bot = document.createElement('div'); bot.className = 'msg bot'; bot.textContent = 'Thinking…'; chat.appendChild(bot);
      const rules = `You are a friendly, patient tutor for ${whoFor(d.subject)}, revising "${d.title}" (${getSubj(d.subject).name}) for an exam. Keep answers short and clear, use Australian spelling, show working for maths, formatting: use **double asterisks** for key words, write all maths in LaTeX between single $ signs (e.g. $\\frac{3}{4}$, $x^2$), and use these notes when relevant:\n\n${deckContext(d)}`;
      const turns = [{ role: 'user', content: rules }, ...hist.slice(-10)];
      try { const { text: out } = await AI.fn(turns, { cache: false, modelTier: 'quick', onText: ({ text: t }) => { bot.innerHTML = Fmt.rich(t); } }); hist.push({ role: 'assistant', content: out }); }
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
    deck.blurb = `${deck.sections.length} topics, ${deck.cards.length} flashcards, ${deck.concepts.length + deck.short.length} questions`;
    S.custom.push(deck); save(); renderTabs(); renderSubject(); renderBoard(); return deck;
  }

  /* ---------------- upload ---------------- */
  let upSubj = S.subj === 'home' ? 'geo' : S.subj, files = [];
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

Aim for 2-5 sections with 3-6 notes each, 10-20 flashcards (key terms, people, dates, causes and effects), 8-15 mcq like a real school exam (vary which option is correct), and 2-4 short-answer questions with one criterion per mark. If the material is maths, make mcq questions that need working out, and write all maths as LaTeX between $ signs (e.g. $\\frac{1}{2}x^2$).`;
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

  /* ---------------- accounts & sync ---------------- */
  const AVATARS = ['🦊', '🐼', '🐸', '🦉', '🐯', '🐙', '🦄', '🐢', '🐧', '🦖', '🐝', '🐳'];
  const AV_COLS = ['coral', 'cyan', 'gold', 'lilac', 'pink', 'green'];
  // ready = the cloud copy has been loaded and merged; nothing is pushed before that.
  const sync = { t: null, state: 'idle', at: 0, dropped: false, ready: false, retry: null };
  const avatarHtml = (pr, cls = '') => `<span class="av ${cls} c-${esc(pr?.avatar?.c || 'lilac')}" aria-hidden="true">${esc(pr?.avatar?.e || '🙂')}</span>`;
  function renderAll() { renderStats(); renderMistakeCount(); renderTabs(); renderNext(); renderBoard(); renderSubject(); renderUpSubjects(); renderAcct(); renderLeague(); }
  function renderAcct() {
    const b = $('#acctBtn'); if (!b) return;
    b.hidden = !Cloud.available;
    b.innerHTML = me && S.profile ? avatarHtml(S.profile, 'sm') + `<span class="acct-name">${esc(S.profile.nickname)}</span>` : me ? avatarHtml(null, 'sm') : '<svg class="acct-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg><span class="acct-label">Sign in</span>';
    b.setAttribute('aria-label', me ? 'Your account' : 'Sign in');
    b.classList.toggle('in', !!me);
  }
  function queueSync() { clearTimeout(sync.t); sync.t = setTimeout(pushCloud, 3000); }
  const cloudState = (doc) => (doc && doc.state ? JSON.parse(doc.state) : null);
  async function pushCloud() {
    clearTimeout(sync.t); if (!me || !sync.ready) return;
    const uid = me;
    sync.state = 'saving'; drawSync();
    try {
      // Merge with the latest cloud copy first, so an older tab or device can't overwrite newer progress.
      const latest = cloudState(await Cloud.load(uid)); if (uid !== me) return;
      S = Logic.mergeState(latest, S); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
      const { state, droppedCustom } = Logic.cloudPayload(S); sync.dropped = droppedCustom;
      await Cloud.save(uid, { nickname: S.profile?.nickname || '', avatar: S.profile?.avatar || null, state: JSON.stringify(state) });
      sync.state = 'saved'; sync.at = Date.now();
      await pushLeague();
    } catch (e) { sync.state = 'error'; }
    drawSync();
  }
  function drawSync() {
    const el = $('#syncState'); if (!el) return;
    el.textContent = { idle: 'Synced', saving: 'Saving…', saved: 'Synced ' + ago(sync.at), error: 'Offline. Will sync when you\'re back online.' }[sync.state] + (sync.dropped ? ' · Your own decks are too big to sync, so they stay on this device.' : '');
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && sync.t) pushCloud(); });

  async function onUser(u) {
    clearTimeout(sync.t); clearTimeout(sync.retry); sync.ready = false; sync.state = 'idle'; sync.dropped = false;
    league.rows = {}; league.tab = 0;
    if (!u) { // signed out (or never signed in): back to this device's guest progress
      if (!me) return renderAcct();
      me = null; KEY = Logic.storageKey(null); S = loadLocal(KEY); closeOvIfOpen(); renderAll(); return;
    }
    const uid = u.uid, key = Logic.storageKey(uid), local = loadLocal(key);
    let cloud = null, ok = true;
    try { cloud = cloudState(await Cloud.load(uid)); } catch (e) { ok = false; }
    // Swap user, storage key and state together, so nothing is saved under the wrong person.
    me = uid; KEY = key; S = Logic.mergeState(local, cloud);
    if (!ok) { toast('Couldn\'t reach the cloud. Using this device\'s copy until you\'re back online.'); retryLoad(uid); }
    else sync.ready = true;
    const guest = loadLocal(Logic.storageKey(null)), flag = 'lockin.migrated:' + uid;
    let asked = false; try { asked = !!localStorage.getItem(flag); } catch (e) { }
    if (ok && !asked && (guest.xp > 0 || guest.custom.length)) { try { localStorage.setItem(flag, '1'); } catch (e) { } offerMigrate(guest); }
    else if (ok && !S.profile) openProfile(true);
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
    renderAll(); if (sync.ready) queueSync();
  }
  // Offline at sign-in: keep trying to load the cloud copy before any push is allowed.
  function retryLoad(uid) {
    sync.retry = setTimeout(async () => {
      if (me !== uid) return;
      try { const cloud = cloudState(await Cloud.load(uid)); if (me !== uid) return; S = Logic.mergeState(cloud, S); sync.ready = true; save(); renderAll(); if (!S.profile) openProfile(true); }
      catch (e) { retryLoad(uid); }
    }, 20000);
  }
  const closeOvIfOpen = () => { if (!ov.hidden) closeOv(); };
  function offerMigrate(guest) {
    cur = { kind: 'acct', tab: null }; const body = ovFrame('Welcome!', 'c-cyan', null);
    body.innerHTML = `<div class="sheet"><h3>Bring your progress with you?</h3><p class="note">This device has <b>${guest.xp} XP</b>${guest.custom.length ? ` and <b>${guest.custom.length}</b> of your own deck${guest.custom.length > 1 ? 's' : ''}` : ''} from before you signed in. Move it into your account so it syncs everywhere?</p>
      <div class="row" style="margin-top:14px"><button class="btn btn-hot" type="button" id="migYes">Move it into my account</button><button class="btn btn-ghost" type="button" id="migNo">No, start fresh</button></div><p class="note" style="font-size:13px;margin-top:10px">Not your progress (shared computer)? Pick "start fresh".</p></div>`;
    showOv();
    const done = () => { closeOv(); if (!S.profile) openProfile(true); };
    $('#migYes').onclick = () => {
      S = Logic.mergeState(guest, S); save(); renderAll();
      try { localStorage.removeItem(Logic.storageKey(null)); localStorage.removeItem('lockin.v1'); } catch (e) { } // moved, not copied
      toast('Progress moved into your account'); done();
    };
    $('#migNo').onclick = done;
  }
  function openProfile(first) {
    cur = { kind: 'acct', tab: null }; const body = ovFrame(first ? 'Set up your profile' : 'Edit profile', 'c-lilac', null);
    const pr = S.profile || { nickname: '', avatar: { e: pick(AVATARS), c: pick(AV_COLS) } }; let av = { ...pr.avatar };
    body.innerHTML = `<div class="sheet"><p class="note">Your mates see only your nickname and avatar. Never your real name or email.</p>
      <label class="lbl" for="nick">Nickname</label><input class="field" id="nick" maxlength="16" autocomplete="off" value="${esc(pr.nickname)}" placeholder="2–16 letters or numbers" style="max-width:320px">
      <label class="lbl">Avatar</label><div class="av-grid" id="avE">${AVATARS.map(e => `<button class="av-pick" type="button" data-e="${e}" aria-pressed="${av.e === e}">${e}</button>`).join('')}</div>
      <label class="lbl">Colour</label><div class="av-grid" id="avC">${AV_COLS.map(c => `<button class="av-col c-${c}" type="button" data-c="${c}" aria-pressed="${av.c === c}" aria-label="${c}"></button>`).join('')}</div>
      <div class="row" style="margin-top:16px"><div id="avPrev"></div><button class="btn btn-hot" type="button" id="profSave">Save</button></div></div>`;
    const prev = () => { $('#avPrev').innerHTML = avatarHtml({ avatar: av }, 'lg'); };
    $$('[data-e]', body).forEach(b => b.onclick = () => { av.e = b.dataset.e; $$('[data-e]', body).forEach(x => x.setAttribute('aria-pressed', x === b)); prev(); });
    $$('[data-c]', body).forEach(b => b.onclick = () => { av.c = b.dataset.c; $$('[data-c]', body).forEach(x => x.setAttribute('aria-pressed', x === b)); prev(); });
    $('#profSave').onclick = () => {
      const n = $('#nick').value.trim().replace(/\s+/g, ' ');
      if (!Logic.validNickname(n)) { toast('Nickname: 2–16 letters, numbers or spaces'); $('#nick').focus(); return; }
      S.profile = { nickname: n, avatar: av }; save(); pushCloud(); renderAcct(); closeOv(); toast(first ? `Welcome, ${n}!` : 'Profile saved');
    };
    prev(); showOv();
  }
  function openAccount() {
    cur = { kind: 'acct', tab: null }; const body = ovFrame(me ? 'Your account' : 'Sign in', 'c-cyan', null);
    if (!me) {
      body.innerHTML = `<div class="sheet"><h3>Lock in with your mates</h3><ul class="note perks"><li>Your XP, levels, mistakes and decks sync between your phone and laptop.</li><li>Make a group and compete on a private leaderboard.</li><li>Only your nickname is shown to others.</li></ul>
        <div class="row" style="margin-top:14px"><button class="btn btn-hot" type="button" id="gIn"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.5-9.5 6.5-16.2z"/><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z"/><path fill="#FBBC05" d="M11.8 28.3c-.4-1.3-.7-2.8-.7-4.3s.3-3 .7-4.3V14H4.5C3 17 2 20.4 2 24s1 7 2.5 10l7.3-5.7z"/><path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/></svg>Sign in with Google</button><button class="btn btn-ghost" type="button" id="guest">Keep going as guest</button></div></div>`;
      $('#gIn').onclick = async () => {
        try { await Cloud.signIn(); closeOvIfOpen(); }
        catch (e) {
          const msg = { 'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site, then try again.', 'auth/network-request-failed': 'No internet connection. Try again when you\'re online.', 'auth/unauthorized-domain': 'Sign-in isn\'t set up for this web address yet.' }[e.code];
          if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') toast(msg || 'Sign-in didn\'t work. Try again.');
        }
      };
      $('#guest').onclick = closeOv;
    } else {
      body.innerHTML = `<div class="sheet"><div class="row">${avatarHtml(S.profile, 'lg')}<div><h3>${esc(S.profile?.nickname || 'No nickname yet')}</h3><div class="note mono" id="syncState" style="font-size:12.5px"></div></div></div>
        <div class="row" style="margin-top:16px"><button class="btn btn-ghost" type="button" id="profEdit">Edit profile</button><button class="btn btn-ghost" type="button" id="syncNow">Sync now</button><button class="btn btn-bad" type="button" id="signOut">Sign out</button></div>
        <p class="note" style="font-size:13px;margin-top:14px">Sharing this computer? Sign out and the next person can sign in with their own account. Your progress stays in your account.</p></div>`;
      drawSync();
      $('#profEdit').onclick = () => openProfile(false);
      $('#syncNow').onclick = pushCloud;
      $('#signOut').onclick = async () => { await pushCloud(); await Cloud.signOut(); toast('Signed out'); };
    }
    showOv();
  }
  /* ---------------- group leaderboards ---------------- */
  const MAX_GROUPS = 5;
  const league = { tab: 0, period: 'week', rows: {}, loading: false };
  const memberRow = () => ({ nickname: S.profile.nickname, avatar: S.profile.avatar, xp: Math.round(S.xp), weekXp: Math.round(S.week.start === Logic.weekStart(new Date()) ? S.week.xp : 0), week: S.week.start || '', streak: Math.round(S.streak.n || 0) });
  async function pushLeague() { if (me && S.profile && S.groups.length) await Cloud.pushMember(S.groups.map(g => g.code), me, memberRow()); }
  async function loadBoard(code) {
    league.loading = true; renderLeague();
    try { league.rows[code] = await Cloud.board(code); } catch (e) { toast('Couldn\'t load the leaderboard. Check your connection.'); }
    league.loading = false; renderLeague();
  }
  function renderLeague() {
    const el = $('#league'); if (!el) return;
    el.hidden = !Cloud.available;
    if (!Cloud.available) return;
    const head = `<div class="sec-head"><h2>Leaderboard</h2><p class="sec-sub">Private groups for you and your mates</p></div>`;
    if (!me) { el.innerHTML = head + `<div class="panel league-teaser"><p class="note" style="margin:0">Sign in to sync your progress and race your mates for XP this week.</p><button class="btn btn-hot btn-sm" type="button" data-lg="signin">Sign in</button></div>`; bindLeague(el); return; }
    if (!S.profile) { el.innerHTML = head + `<div class="panel league-teaser"><p class="note" style="margin:0">Pick a nickname first so your mates know it's you.</p><button class="btn btn-hot btn-sm" type="button" data-lg="profile">Set up profile</button></div>`; bindLeague(el); return; }
    const gs = S.groups; league.tab = Math.min(league.tab, Math.max(0, gs.length - 1));
    const g = gs[league.tab], wk = Logic.weekStart(new Date());
    let board = '';
    if (g) {
      const rows = (league.rows[g.code] || []).map(r => (r.uid === me ? { ...r, ...memberRow(), uid: me } : r))
        .map(r => ({ ...r, score: league.period === 'week' ? (r.week === wk ? r.weekXp : 0) : r.xp }))
        .sort((a, b) => b.score - a.score).slice(0, 20);
      board = `<div class="row league-top"><div class="filters" role="group" aria-label="Period">${[['week', 'This week'], ['all', 'All time']].map(([k, l]) => `<button class="fchip" type="button" data-lp="${k}" aria-pressed="${league.period === k}">${l}</button>`).join('')}</div>
          <span class="mono league-code">Code <b>${esc(g.code)}</b> <button class="linkbtn" type="button" data-lg="copy">copy</button></span></div>
        <ol class="lb">${rows.length ? rows.map((r, i) => `<li class="${r.uid === me ? 'me' : ''}"><span class="rk">${i + 1}</span>${avatarHtml(r, 'sm')}<span class="nm">${esc(r.nickname)}${r.uid === me ? ' <small>(you)</small>' : ''}</span><span class="st" title="Day streak">🔥 ${r.streak || 0}</span><span class="xp">${r.score} XP</span></li>`).join('') : `<li class="empty-row">${league.loading ? 'Loading…' : 'No one here yet.'}</li>`}</ol>
        <div class="row" style="justify-content:space-between;margin-top:10px"><span class="note" style="font-size:12.5px">Share the code so mates can join. Scores are on the honour system.</span><span class="row"><button class="linkbtn" type="button" data-lg="refresh">Refresh</button><button class="linkbtn" type="button" data-lg="leave">Leave group</button></span></div>`;
    }
    el.innerHTML = head + `<div class="panel">${gs.length ? `<div class="tabs league-tabs" role="tablist">${gs.map((x, i) => `<button class="tab" type="button" role="tab" data-lt="${i}" aria-selected="${i === league.tab}">${esc(x.name)}</button>`).join('')}</div>` : `<p class="note" style="margin-top:0">Make a group and send the code to your mates, or join theirs.</p>`}
      ${board}
      ${gs.length < MAX_GROUPS ? `<div class="league-forms"><div class="ans"><input class="field" id="lgName" maxlength="30" placeholder="New group name, e.g. 8R Maths" aria-label="New group name"><button class="btn btn-ghost btn-sm" type="button" data-lg="create">Create group</button></div>
        <div class="ans"><input class="field mono" id="lgCode" maxlength="6" placeholder="Join code, e.g. K7Q2XD" aria-label="Group code" autocapitalize="characters" style="text-transform:uppercase"><button class="btn btn-ghost btn-sm" type="button" data-lg="join">Join</button></div></div>` : ''}</div>`;
    bindLeague(el);
    if (g && !league.rows[g.code] && !league.loading) loadBoard(g.code);
  }
  function bindLeague(el) {
    $$('[data-lt]', el).forEach(b => b.onclick = () => { league.tab = +b.dataset.lt; renderLeague(); });
    $$('[data-lp]', el).forEach(b => b.onclick = () => { league.period = b.dataset.lp; renderLeague(); });
    $$('[data-lg]', el).forEach(b => b.onclick = async () => {
      const act = b.dataset.lg, g = S.groups[league.tab];
      if (act === 'signin') return openAccount();
      if (act === 'profile') return openProfile(true);
      if (act === 'copy') return copyText(g.code, 'Code copied. Send it to your mates.', el);
      if (act === 'refresh') return loadBoard(g.code);
      b.disabled = true;
      try {
        if (act === 'create') {
          const name = $('#lgName').value.trim().slice(0, 30); if (!name) { toast('Give your group a name'); return; }
          const code = await Cloud.createGroup(name, me, memberRow());
          S.groups.push({ code, name }); league.tab = S.groups.length - 1; save(); toast(`Group made. Code: ${code}`);
          await loadBoard(code);
        }
        if (act === 'join') {
          const code = $('#lgCode').value.trim().toUpperCase();
          if (!/^[A-Z0-9]{6}$/.test(code)) { toast('Codes are 6 letters/numbers'); return; }
          if (S.groups.some(x => x.code === code)) { league.tab = S.groups.findIndex(x => x.code === code); renderLeague(); return; }
          const res = await Cloud.joinGroup(code, me, memberRow());
          S.groups.push(res); league.tab = S.groups.length - 1; save(); toast(`Joined ${res.name}`);
          await loadBoard(code);
        }
        if (act === 'leave') {
          if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again to leave'; b.disabled = false; return; }
          await Cloud.leaveGroup(g.code, me); S.groups = S.groups.filter(x => x.code !== g.code); delete league.rows[g.code]; league.tab = 0; save(); toast('Left the group'); renderLeague();
        }
      } catch (e) { toast(e.code === 'not-found' ? 'No group with that code' : e.code === 'permission-denied' ? 'Not allowed. Is the database set up?' : (e.message || 'That didn\'t work')); }
      finally { b.disabled = false; }
    });
  }

  /* ---------------- badges + ranks ---------------- */
  const badgeCtx = () => { const decks = {}; allDecks().forEach(d => decks[d.id] = d.subject); return { decks, subjects: SUBJ.filter(s => decksOf(s.id).length).length }; };
  let badgeT = null;
  function checkBadges() { clearTimeout(badgeT); badgeT = setTimeout(awardBadges, 400); }
  function awardBadges() {
    if (document.documentElement.classList.contains('locked')) return;
    const got = Badges.fresh(S, badgeCtx()); if (!got.length) return;
    got.forEach(b => S.badges[b.id] = Date.now()); addXp(25 * got.length);
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } if (me) queueSync(); renderStats();
    if (got.length > 2) { toast(`You've unlocked ${got.length} badges. +${25 * got.length} XP`); burst(innerWidth / 2, 120, 120); }
    else got.forEach((b, i) => setTimeout(() => showBadge(b), i * 2000));
    if (S.subj === 'home' && ov.hidden) renderSubject();
  }
  function showBadge(b) {
    const el = document.createElement('div'); el.className = 'badge-pop'; el.setAttribute('role', 'status');
    el.innerHTML = `<span class="bi" aria-hidden="true">${b.icon}</span><div><small>Badge unlocked · +25 XP</small><b>${esc(b.name)}</b><span>${esc(b.how)}</span></div>`;
    document.body.appendChild(el); const r = el.getBoundingClientRect(); burst(r.left + 30, r.top + 30, 60);
    setTimeout(() => el.classList.add('out'), 3400); setTimeout(() => el.remove(), 4000);
  }
  const rankHtml = () => { const r = Badges.rank(S.xp); return `<div class="rank"><div class="rank-top"><b>${esc(r.name)}</b><span>${r.next ? `${r.next.at - S.xp} XP to ${esc(r.next.name)}` : 'Top rank'}</span></div><span class="rbar"><i style="width:${Math.round(r.pct * 100)}%"></i></span></div>`; };
  const badgesHtml = () => `<div class="heat-head"><h3>Badges</h3><span>${Object.keys(S.badges).length} of ${Badges.LIST.length}</span></div>
    <ul class="badges">${Badges.LIST.map(b => `<li class="${S.badges[b.id] ? 'on' : ''}" title="${esc(b.name)}: ${esc(b.how)}${S.badges[b.id] ? ' (unlocked)' : ''}"><span aria-hidden="true">${b.icon}</span><span class="sr">${esc(b.name)}${S.badges[b.id] ? ', unlocked' : ', locked'}</span></li>`).join('')}</ul>`;

  /* ---------------- daily challenge ---------------- */
  // One Complex question a day, the same for everyone (seeded by the date).
  // From every subject with an exam still to come, so it's useful whatever you're studying.
  function dailyQ(date = today()) {
    const live = SUBJ.filter(s => s.exam && s.exam > Date.now()).map(s => s.id);
    const decks = allDecks().filter(d => !d.custom && live.includes(d.subject) && d.bank && d.bank.length);
    if (!decks.length) return null;
    decks.forEach(d => d.bank.forEach(infoOf)); // sampling generators uses Math.random, so do it before seeding
    return Logic.withSeed('daily:' + date, () => { const d = pick(decks); const fns = bankFor(d, 'all', 'C'); return bankQ(pick(fns.length ? fns : d.bank), d, 'C'); });
  }
  function dailyStreak() { let n = 0; const d = new Date(); if (!S.daily.done[today()]) d.setDate(d.getDate() - 1); for (;;) { const k = d.toLocaleDateString('en-CA'); if (!S.daily.done[k]) break; n++; d.setDate(d.getDate() - 1); } return n; }
  function dailyCardHtml() {
    const q = dailyQ(); if (!q) return '';
    const t = today(), done = S.daily.done[t], tried = S.daily.att?.[t], d = getDeck(q.deckId), s = getSubj(d.subject), n = dailyStreak();
    return `<section class="daily c-${s.hue}" aria-labelledby="dlH"><div><h2 id="dlH">Daily challenge</h2><p class="sec-sub">${esc(s.name)} · ${esc(d.title)} · Complex. Same question for everyone today.${n ? ` <b>${n} day${n > 1 ? 's' : ''} in a row.</b>` : ''}</p></div>
      ${done ? '<span class="daily-done">✓ Beaten today</span>' : `<button class="btn btn-hot" type="button" id="dailyGo">${tried ? 'Try again' : 'Take it on'} <small>+50 XP</small></button>`}</section>`;
  }
  function openDaily() {
    const q = dailyQ(); if (!q) return;
    const d = getDeck(q.deckId), t = today();
    cur = { kind: 'daily', tab: null }; const body = ovFrame('Daily challenge', 'c-' + getSubj(d.subject).hue, null);
    body.innerHTML = `<p class="note" style="margin:0 0 12px">Full marks beats it. ${S.daily.done[t] ? 'You\'ve already beaten today\'s.' : 'Get it all right for +50 XP.'}</p><div id="qHost"></div>`;
    $('#qHost', body).appendChild(renderCard(q, { mode: 'practice', onPart: (p) => {
      record(d.id, q.tags, p._got || 0, p.marks || 1);
      if (!allDone(q) || q._counted) return; q._counted = true; noteResult(q, d);
      const [got, out] = qScore(q); (S.daily.att ||= {})[t] = [got, out];
      if (got === out && !S.daily.done[t]) { S.daily.done[t] = 1; addXp(50); burst(innerWidth / 2, 160, 160); toast(`Daily challenge beaten. +50 XP${dailyStreak() > 1 ? `, ${dailyStreak()} days in a row` : ''}`); }
      else if (got < out) toast('Not this time. Check the working, then try again.');
      save(); renderStats();
    } }));
    showOv();
  }

  /* ---------------- quick search (Ctrl+K) ---------------- */
  function cmdItems() {
    const items = [];
    const act = (label, hint, run, kw = '') => items.push({ label, hint, run, kw });
    act('Lock in: start a focus session', 'Focus', openFocus, 'timer pomodoro study');
    act('Daily challenge', 'Challenge', openDaily, 'question today');
    act('Mistakes to fix', 'Mistakes', () => openMistakes(), 'wrong redo');
    if (typeof RD !== 'undefined') { act('Read Animal Farm', 'English', () => openReader(), 'book chapter notes read'); RD.CHAPTERS.forEach(c => act(`Animal Farm chapter ${c.n}: ${c.title}`, 'Read', () => openReader(c.n), 'chapter')); }
    act('Writing feedback', 'English', () => openWriting(), 'essay creative paragraph mark petal');
    act('Quote bank', 'English', openQuotes, 'quotes memorise learn');
    act('Make a share card', 'Show off', openShare, 'aura stats image picture');
    act('Change theme (dark / light / auto)', 'Settings', () => $('#themeBtn').click(), 'dark mode light');
    act('Home', 'Go to', () => goSubj('home'), 'plan report');
    if (Gate.isAdmin()) act('Admin: make and manage keys', 'Admin', openAdmin, 'keys invite friends gatekeep admin');
    if (Cloud.available) act(me ? 'Your account' : 'Sign in', 'Account', () => (me && !S.profile ? openProfile(true) : openAccount()), 'google login');
    subjects().forEach(s => {
      act(s.name, 'Subject', () => goSubj(s.id), s.tab || '');
      if (s.mock) act(`${s.name} practice exam`, 'Exam', () => openMock(s.id), 'mock paper test');
      if (hasPapers(s.id)) { act(`${s.name} past papers`, 'HSC', () => openPapers(s.id), 'past paper hsc nesa official'); PAPERS.LIST[s.id].forEach(p => act(`${p.year} HSC ${s.name}`, 'Past paper', () => openPapers(s.id), 'past paper')); }
      if (decksOf(s.id).length) act(`${s.name} flashcards`, 'Cards', () => openSubjectCards(s.id), 'flashcards');
    });
    allDecks().forEach(d => {
      const s = getSubj(d.subject);
      act(d.title, s.tab || s.name, () => openDeck(d.id), d.chapter || '');
      (d.sections || []).forEach(sec => { if (hasPracticeFor(d, sec.code)) act(`${sec.code} ${sec.name}`.replace(/\$[^$]*\$/g, '').trim(), `Practise · ${d.title}`, () => openDeck(d.id, 'practice', sec.code)); });
    });
    return items;
  }
  function goSubj(id) { if (!ov.hidden) closeOv(); S.subj = id; save(); renderTabs(); renderSubject(); $('#subject').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  // Fuzzy match: every typed letter in order; earlier, word-start and consecutive matches score higher.
  function fuzzy(q, text) {
    q = q.toLowerCase(); const t = text.toLowerCase(); if (!q) return 1;
    if (t.includes(q)) return 100 - t.indexOf(q) + (t.startsWith(q) ? 50 : 0);
    let i = 0, score = 0, last = -2;
    for (let j = 0; j < t.length && i < q.length; j++) if (t[j] === q[i]) { score += (j === last + 1 ? 5 : 1) + (j === 0 || t[j - 1] === ' ' ? 4 : 0); last = j; i++; }
    return i === q.length ? score : 0;
  }
  function openCmd() {
    if ($('.cmdk')) return;
    const items = cmdItems(), back = document.activeElement;
    const el = document.createElement('div'); el.className = 'cmdk'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Quick search');
    el.innerHTML = `<div class="cmdk-box"><input class="cmdk-in" placeholder="Search decks, topics and actions…" aria-label="Search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="cmdkList"><ul class="cmdk-list" id="cmdkList" role="listbox" aria-label="Results"></ul><div class="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div>`;
    document.body.appendChild(el);
    const inp = $('.cmdk-in', el), list = $('.cmdk-list', el); let sel = 0, shown = [];
    const draw = () => {
      const q = inp.value.trim();
      shown = items.map(it => ({ it, s: Math.max(fuzzy(q, it.label), fuzzy(q, it.kw) * 0.6, fuzzy(q, it.hint) * 0.5) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 9).map(x => x.it);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = shown.length ? shown.map((it, i) => `<li role="option" id="cmdk${i}" aria-selected="${i === sel}" data-i="${i}"><span>${fm(it.label)}</span><small>${esc(it.hint)}</small></li>`).join('') : '<li class="none">Nothing found</li>';
      if (shown.length) { inp.setAttribute('aria-activedescendant', 'cmdk' + sel); list.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' }); } else inp.removeAttribute('aria-activedescendant');
    };
    const close = () => { el.remove(); back?.focus?.(); };
    const go = (i) => { const it = shown[i]; if (!it) return; close(); it.run(); };
    inp.oninput = () => { sel = 0; draw(); };
    inp.onkeydown = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); draw(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); draw(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(sel); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    };
    list.onclick = (e) => { const li = e.target.closest('[data-i]'); if (li) go(+li.dataset.i); };
    el.addEventListener('mousedown', (e) => { if (e.target === el) close(); });
    draw(); inp.focus();
  }
  addEventListener('keydown', (e) => {
    if (document.documentElement.classList.contains('locked')) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openCmd(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); openCmd(); }
  });

  /* ---------------- share card ---------------- */
  // A 1080×1350 picture of your stats to post or send.
  function shareCanvas() {
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const font = (w, px) => `${w} ${px}px "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif`;
    const bg = g.createRadialGradient(W / 2, 380, 50, W / 2, 500, 900); bg.addColorStop(0, '#1E2A46'); bg.addColorStop(1, '#0E1218'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const grad = g.createLinearGradient(80, 0, W - 80, 0); grad.addColorStop(0, '#2DD4BF'); grad.addColorStop(0.5, '#7FA2FF'); grad.addColorStop(1, '#A78BFA');
    // padlock
    g.save(); g.translate(80, 86); g.strokeStyle = '#B4BDC9'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(16, 44); g.lineTo(16, 28); g.arc(36, 28, 20, Math.PI, 0); g.lineTo(56, 44); g.stroke();
    g.fillStyle = '#E7ECF2'; g.beginPath(); g.roundRect ? g.roundRect(0, 40, 72, 54, 11) : g.rect(0, 40, 72, 54); g.fill(); g.fillStyle = '#7FA2FF'; g.beginPath(); g.arc(36, 62, 7, 0, 7); g.fill(); g.fillRect(32, 64, 8, 16); g.restore();
    g.fillStyle = '#E7ECF2'; g.font = font(700, 64); g.fillText('Lock', 176, 160); g.fillStyle = grad; g.fillText('in', 176 + g.measureText('Lock ').width, 160);
    const r = Badges.rank(S.xp), who = S.profile?.nickname || 'Me';
    g.fillStyle = '#8A95A3'; g.font = font(400, 34); g.fillText(new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }), 80, 250);
    g.fillStyle = '#E7ECF2'; g.font = font(700, 96); g.fillText(who, 80, 360);
    g.fillStyle = grad; g.font = font(700, 48); g.fillText(r.name, 80, 430);
    // stat tiles
    const focusH = Math.round(Object.values(S.days).reduce((a, d) => a + (d.min || 0), 0) / 6) / 10;
    const marks = Object.values(S.p).reduce((a, p) => a + (p.att || 0), 0);
    const tiles = [[S.xp.toLocaleString(), 'XP'], [String(S.streak.n), 'day streak'], [String(focusH), 'hours focused'], [marks.toLocaleString(), 'marks attempted'], [`${Object.keys(S.badges).length}/${Badges.LIST.length}`, 'badges'], [String(Object.keys(S.cleared).length), 'mistakes fixed']];
    tiles.forEach(([v, l], i) => {
      const x = 80 + (i % 3) * 315, y = 500 + Math.floor(i / 3) * 190;
      g.fillStyle = '#1B2129'; g.beginPath(); g.roundRect ? g.roundRect(x, y, 290, 165, 22) : g.rect(x, y, 290, 165); g.fill();
      g.fillStyle = '#E7ECF2'; g.font = font(700, 64); g.fillText(v, x + 26, y + 92); g.fillStyle = '#8A95A3'; g.font = font(400, 28); g.fillText(l, x + 26, y + 136);
    });
    // heatmap: last 12 weeks
    const hm = Logic.heat(S.days, new Date(), 12), cols = ['#232B36', '#1F4F57', '#21857C', '#2DD4BF', '#9CF5E8'];
    g.fillStyle = '#8A95A3'; g.font = font(400, 28); g.fillText('Last 12 weeks', 80, 935);
    hm.forEach((d, i) => { const x = 80 + Math.floor(i / 7) * 77, y = 960 + (i % 7) * 30; g.fillStyle = cols[d.level]; g.beginPath(); g.roundRect ? g.roundRect(x, y, 70, 24, 6) : g.rect(x, y, 70, 24); g.fill(); });
    // next exam
    const nx = nextExam();
    g.fillStyle = '#E7ECF2'; g.font = font(700, 40);
    g.fillText(nx ? `${nx.name} in ${daysTo(nx.exam)} day${daysTo(nx.exam) === 1 ? '' : 's'}` : 'Exams done.', 80, 1260);
    g.fillStyle = '#5D6876'; g.font = font(400, 26); g.fillText('locked in with Lock in', 80, 1302);
    return c;
  }
  function openShare() {
    cur = { kind: 'share', tab: null }; const body = ovFrame('Share card', 'c-lilac', null);
    body.innerHTML = `<div class="share"><img class="share-img" alt="Your Lock in stats card"><div class="share-side"><p class="note">Your stats as a picture. Post it, send it to the group chat, aura farm responsibly.</p>${!S.profile?.nickname ? `<label class="lbl" for="shName">Name on the card</label><input class="field" id="shName" maxlength="16" placeholder="Your name or nickname" value="${esc(kget('lockin.shareName', ''))}">` : ''}<div class="row" style="margin-top:14px"><button class="btn" type="button" id="shSave">Save picture</button>${navigator.canShare ? '<button class="btn btn-ghost" type="button" id="shSend">Share</button>' : ''}</div></div></div>`;
    const img = $('.share-img', body);
    const draw = () => { const nm = $('#shName', body)?.value.trim(); const keep = S.profile; if (nm && !S.profile) S.profile = { nickname: nm }; let c; try { c = shareCanvas(); } finally { S.profile = keep; } img.src = c.toDataURL('image/png'); return c; };
    let c; (document.fonts?.ready || Promise.resolve()).then(() => { c = draw(); });
    const nm = $('#shName', body); if (nm) nm.oninput = () => { kset('lockin.shareName', nm.value); c = draw(); };
    $('#shSave', body).onclick = async () => {
      if (!c) return;
      // Inside Claude the page can't download directly: ask the viewer through the downloads capability.
      const dl = window.claude?.use ? await window.claude.use('downloads').catch(() => null) : null;
      if (dl) { c.toBlob(async (blob) => { try { await dl.save({ filename: 'lock-in-stats.png', data: blob }); toast('Saved'); } catch (e) { if (e?.code !== 'declined') toast('Couldn\'t save here. Long-press or right-click the picture to save it.'); } }); return; }
      const a = document.createElement('a'); a.href = img.src; a.download = 'lock-in-stats.png'; a.click(); toast('Saved');
    };
    const sb = $('#shSend', body); if (sb) sb.onclick = () => c && c.toBlob(async (b) => { const f = new File([b], 'lock-in-stats.png', { type: 'image/png' }); try { if (navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: 'Lock in' }); else toast('Sharing pictures isn\'t supported here. Use Save picture.'); } catch (e) { } });
    showOv();
  }

  /* ---------------- focus sounds ---------------- */
  // Generated in the browser (no downloads): brown noise, or rain (filtered noise with soft drops).
  const sound = { ac: null, nodes: [], kind: 'off', gen: 0 };
  function setSound(kind) {
    sound.nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) { } }); sound.nodes = []; sound.kind = kind; const gen = ++sound.gen;
    try { localStorage.setItem('lockin.sound', kind); } catch (e) { }
    if (kind === 'off') return;
    try {
      const ac = sound.ac ||= new (window.AudioContext || window.webkitAudioContext)(); ac.resume();
      const len = ac.sampleRate * 4, buf = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; } else d[i] = w * 0.5; } }
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const gain = ac.createGain(); gain.gain.value = kind === 'brown' ? 0.5 : 0.22;
      let tail = src;
      if (kind === 'rain') { const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000; src.connect(hp); hp.connect(lp); tail = lp; }
      tail.connect(gain); gain.connect(ac.destination); src.start(); sound.nodes.push(src, gain);
      if (kind === 'rain') { // occasional heavier drops
        const drip = () => { if (sound.gen !== gen) return; const o = ac.createBufferSource(), g2 = ac.createGain(), f = ac.createBiquadFilter(); o.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1500 + Math.random() * 2500; g2.gain.setValueAtTime(0.0001, ac.currentTime); g2.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + 0.005); g2.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08); o.connect(f); f.connect(g2); g2.connect(ac.destination); o.start(ac.currentTime, Math.random() * 3, 0.1); setTimeout(drip, 40 + Math.random() * 260); };
        drip();
      }
    } catch (e) { sound.kind = 'off'; }
  }

  /* ---------------- Read: Animal Farm, chapter by chapter ---------------- */
  // The book's key moments with short quotes and notes (src/reader.js). The full text isn't in the app:
  // the "Read the full chapter" link opens a free copy at Project Gutenberg Australia.
  const readState = () => (S.read ||= { ch: 1, done: {} });
  function openReader(ch) {
    if (typeof RD === 'undefined') return;
    const R = readState(); if (ch) R.ch = ch;
    cur = { kind: 'reader', tab: null }; ovFrame('Read: Animal Farm', 'c-pink', null); drawReader(); showOv();
  }
  function drawReader() {
    const body = $('#ovBody'), R = readState(), C = RD.CHAPTERS, done = Object.keys(R.done).length;
    const strip = `<div class="rd-strip" role="tablist" aria-label="Chapters">${C.map(c => `<button class="rd-ch${R.done[c.n] ? ' done' : ''}" type="button" role="tab" data-rch="${c.n}" aria-selected="${R.ch === c.n}" title="Chapter ${c.n}: ${esc(c.title)}">${c.n}</button>`).join('')}<button class="rd-ch rd-cast" type="button" role="tab" data-rch="cast" aria-selected="${R.ch === 'cast'}">Characters</button></div>
      <p class="note rd-prog">${done ? `${done} of ${C.length} chapters done.` : 'Go chapter by chapter: read the moments, then take the quick check.'}</p>`;
    if (R.ch === 'cast') {
      body.innerHTML = strip + `<div class="rd-cast-grid">${RD.CAST.map(p => `<div class="rd-person"><h3>${esc(p.name)}</h3><p>${fm(p.who)}</p><p class="rd-tag"><b>Stands for</b> ${fm(p.stands)}</p><p class="rd-tag"><b>How they change</b> ${fm(p.arc)}</p></div>`).join('')}</div>`;
      bindStrip(body); return;
    }
    const c = C.find(x => x.n === R.ch) || C[0];
    body.innerHTML = strip + `<article class="rd">
      <header class="rd-head"><span class="eyebrow">Chapter ${c.n}${R.done[c.n] ? ' · done' : ''}</span><h2>${esc(c.title)}</h2></header>
      <section class="rd-sum"><h3>What happens</h3><p>${fm(c.summary)}</p></section>
      <h3 class="rd-h">Key moments</h3>
      <ol class="rd-moments">${c.moments.map((m, i) => `<li class="rd-m">
        <h4><span class="rd-num">${i + 1}</span>${esc(m.title)}</h4>
        <blockquote class="rd-q">“${esc(m.quote)}”</blockquote>
        <dl class="rd-notes"><div><dt>What's happening</dt><dd>${fm(m.explain)}</dd></div><div><dt>How Orwell does it</dt><dd>${fm(m.technique)}</dd></div><div><dt>Why it matters</dt><dd>${fm(m.theme.replace(/\s*\(H\d\)/g, ''))}</dd></div>${m.history ? `<div><dt>Real history</dt><dd>${fm(m.history)}</dd></div>` : ''}</dl>
        <details class="rd-think"><summary>Think about it: ${fm(m.think.q)}</summary><p>${fm(m.think.a)}</p></details></li>`).join('')}</ol>
      <section class="rd-quiz"><h3>Quick check</h3><p class="note">Get them all right to tick off Chapter ${c.n}.</p><div id="rdQuiz"></div></section>
      <div class="row rd-nav">${c.n > 1 ? `<button class="btn btn-ghost" type="button" data-rch="${c.n - 1}">← Chapter ${c.n - 1}</button>` : ''}<span style="flex:1"></span>${c.n < C.length ? `<button class="btn" type="button" data-rch="${c.n + 1}">Chapter ${c.n + 1} →</button>` : '<button class="btn" type="button" data-rch="cast">Characters →</button>'}</div></article>`;
    bindStrip(body);
    const d = getDeck('afplot') || decksOf('eng')[0], host = $('#rdQuiz', body), qs = [];
    let right = 0, answered = 0;
    c.quiz.forEach(([q, options, answer, why]) => {
      const qq = mcqQ({ q, options, answer, why, tags: [] }, d); qs.push(qq);
      host.appendChild(renderCard(qq, { mode: 'practice', onPart: (p) => {
        answered++; if (p._got) right++; record(d.id, [], p._got || 0, 1); noteResult(qq, d);
        if (answered === qs.length) {
          if (right === qs.length && !R.done[c.n]) { R.done[c.n] = Date.now(); addXp(20); save(); renderStats(); burst(innerWidth / 2, innerHeight / 2, 120); toast(`Chapter ${c.n} done. +20 XP`); $$(`[data-rch="${c.n}"].rd-ch`, body).forEach(b => b.classList.add('done')); }
          else if (right < qs.length) toast(`${right} of ${qs.length}. Reread the moments, then try again.`);
        }
      } }));
    });
    const again = document.createElement('button'); again.className = 'linkbtn'; again.type = 'button'; again.textContent = 'New attempt'; again.onclick = () => { drawReader(); $('.rd-quiz', $('#ovBody'))?.scrollIntoView({ block: 'start' }); }; host.appendChild(again);
  }
  function bindStrip(body) {
    $$('[data-rch]', body).forEach(b => b.onclick = () => { const v = b.dataset.rch; readState().ch = v === 'cast' ? 'cast' : +v; save(); drawReader(); ov.scrollTo({ top: 0 }); });
  }

  /* ---------------- paper viewer: our own, drawn with pdf.js ---------------- */
  // Pages are drawn onto canvases inside the app. Above each page: the questions that start on it, each
  // with a "?" for help (topic notes, the answer, practise, a hint). The header has the exam timer.
  const pvSit = () => (typeof sitState === 'function' ? sitState() : null);
  function questionsOnPage(sid, year, page) { // full paper: every mapped item starting on this page
    const P = hasIndex(sid) && PAPER_INDEX[sid][year]; if (!P) return [];
    return [...P.mc.filter(m => m.page === page).map(m => ({ year: +year, kind: 'mc', n: m.n, label: '', page: m.page, marks: 1, topics: m.topics || [] })),
      ...P.q.flatMap(q => q.parts.filter(p => (p.page || q.page) === page).map(p => ({ year: +year, kind: 'part', n: q.n, label: p.label, page: p.page || q.page, marks: p.marks, topics: p.topics || [], about: p.about || '' })))];
  }
  const paperCtx = (sid, year) => ({ sid, itemsOn: (pg) => questionsOnPage(sid, year, pg), startSit: () => { const F = PAPERS.formatOf(sid, year), now = Date.now(); setSit({ sid, year, start: now, readEnd: now + F.reading * 6e4, end: now + (F.reading + F.writing) * 6e4, paused: null }); openSit(sid, year); }, sitMatch: (st) => st && st.sid === sid && st.year === year && !st.mix });
  const mixCtx = (m) => { const list = Mix.pageList(PAPER_INDEX[m.sid], m.items); return { sid: m.sid, itemsOn: (pg) => { const at = list[pg - 2]; return at ? m.items.filter(i => i.year === at.year && Mix.pagesFor(PAPER_INDEX[m.sid], i)[0] === at.page) : []; }, startSit: () => { const now = Date.now(); setSit({ sid: m.sid, mix: m.id, start: now, readEnd: now + 5 * 6e4, end: now + (5 + m.minutes) * 6e4, paused: null }); openSit(m.sid, null); }, sitMatch: (st) => st && st.mix === m.id }; };
  async function viewerPdfjs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    if (window.lockinDesktop) { await loadScript('vendor/pdf.min.js'); window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js'; return window.pdfjsLib; }
    return pdfLib();
  }
  async function openPdf(src, title, ctx = {}) {
    const [file, frag] = String(src).split('#'), startPage = +((frag || '').match(/page=(\d+)/) || [])[1] || ctx.startPage || 1;
    const el = document.createElement('div'); el.className = 'pv'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', title || 'Paper'); el.tabIndex = -1;
    el.innerHTML = `<header class="pv-head"><button class="back" type="button" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <b class="pv-title">${esc(title || 'Paper')}</b><span class="pv-pg" aria-live="polite"></span>
      <span class="pv-zoom"><button type="button" data-z="-1" aria-label="Zoom out">−</button><button type="button" data-z="1" aria-label="Zoom in">+</button></span>${window.lockinDesktop?.printPdf ? '<button type="button" class="pv-print" aria-label="Print this paper">Print</button>' : ''}
      <span class="pv-timer"></span></header>
      <div class="pv-body"><div class="pv-pages"><p class="pv-loading">Opening the paper…</p></div><aside class="pv-help" hidden></aside></div>`;
    document.body.appendChild(el); el.focus();
    const pagesEl = $('.pv-pages', el), help = $('.pv-help', el); let zoom = 1, doc = null, obs = null, tick = null;
    const close = () => { clearInterval(tick); obs?.disconnect(); doc?.destroy(); el.remove(); };
    $('.back', el).onclick = close;
    const pb = $('.pv-print', el); if (pb) pb.onclick = async () => { pb.disabled = true; pb.textContent = 'Opening…'; let r = null; try { r = await window.lockinDesktop.printPdf(file); } catch (e) { } pb.textContent = r && r.ok ? 'Opened: press ⌘P' : 'Couldn\'t open'; setTimeout(() => { pb.textContent = 'Print'; pb.disabled = false; }, 4000); };
    el.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); if (!help.hidden) help.hidden = true; else close(); } });
    // timer
    const drawTimer = () => {
      const box = $('.pv-timer', el), st = pvSit(); if (!box) return;
      if (st && (!ctx.sitMatch || ctx.sitMatch(st))) {
        const now = st.paused || Date.now(), reading = now < st.readEnd, left = Math.max(0, (reading ? st.readEnd : st.end) - now), h = Math.floor(left / 36e5), mm = Math.floor(left % 36e5 / 6e4), ss = Math.floor(left % 6e4 / 1e3);
        const t = `${h ? h + ':' + pad(mm) : mm}:${pad(ss)}`;
        if (box.dataset.mode !== 'run') { box.dataset.mode = 'run'; box.innerHTML = `<span class="pv-clock"><small></small><b></b></span><button type="button" class="pv-tbtn" data-t="pause"></button><button type="button" class="pv-tbtn" data-t="done">Finish</button>`; }
        $('small', box).textContent = st.paused ? 'Paused' : reading ? 'Reading' : 'Writing'; $('b', box).textContent = t; $('[data-t=pause]', box).textContent = st.paused ? 'Resume' : 'Pause';
        box.classList.toggle('low', !reading && left < 15 * 6e4);
      } else if (ctx.startSit && !st) {
        if (box.dataset.mode !== 'start') { box.dataset.mode = 'start'; box.innerHTML = '<button type="button" class="pv-tbtn hot" data-t="start">Start timer</button>'; }
      } else if (box.dataset.mode) { box.dataset.mode = ''; box.innerHTML = ''; }
    };
    $('.pv-timer', el).addEventListener('click', e => {
      const t = e.target.closest('[data-t]')?.dataset.t; if (!t) return;
      if (t === 'start') { ctx.startSit(); toast('Timer started. Reading time first.'); }
      if (t === 'pause') $('#sitPause')?.click();
      if (t === 'done') { close(); $('#sitDone')?.click(); return; }
      drawTimer();
    });
    tick = setInterval(() => { if (!document.body.contains(el)) return clearInterval(tick); drawTimer(); }, 500); drawTimer();
    // pages
    try { const lib = await viewerPdfjs(); doc = await lib.getDocument({ url: file, isEvalSupported: false }).promise; }
    catch (e) { pagesEl.innerHTML = '<p class="pv-loading">Couldn\'t open this paper.</p>'; return; }
    const first = await doc.getPage(1), base = first.getViewport({ scale: 1 }), ratio = base.height / base.width;
    const width = () => Math.min(pagesEl.clientWidth - 32, 860) * zoom;
    pagesEl.innerHTML = Array.from({ length: doc.numPages }, (_, k) => { const pg = k + 1, qs = ctx.itemsOn ? ctx.itemsOn(pg) : [];
      return `<section class="pv-page" data-p="${pg}"${qs.length ? ' data-qs="1"' : ''}><div class="pv-qs"></div><div class="pv-sheet"><canvas></canvas></div></section>`; }).join('');
    const chip = (q, pg, j) => `<span class="pv-q"><b>${esc(Mix.name(q).replace(/^\d{4} /, ''))}</b><small>${q.marks} mark${q.marks > 1 ? 's' : ''}${ctx.showYear ? ` · ${q.year}` : ''}</small><button type="button" class="pv-help-btn" data-hq="${pg}:${j}" aria-label="Help with ${esc(Mix.name(q))}">?</button></span>`;
    // Put each question's ? in the margin beside it: find its label on the page ("Question 13", "(b)",
    // "(ii)", or a multiple-choice number) in reading order. Anything not found goes in the strip above.
    async function placeMarks(sec, page) {
      if (sec.dataset.mk || !sec.dataset.qs) return; sec.dataset.mk = 1;
      const pg = +sec.dataset.p, qs = ctx.itemsOn(pg), vp = page.getViewport({ scale: 1 });
      let lines = [];
      try {
        const toks = (await page.getTextContent()).items.filter(t => t.str.trim()).map(t => ({ s: t.str, x: t.transform[4], y: vp.height - t.transform[5], h: Math.abs(t.transform[3]) || 10 })).sort((a, b) => a.y - b.y || a.x - b.x);
        for (const t of toks) { const L = lines[lines.length - 1]; if (L && Math.abs(L.y - t.y) < 3) { L.parts.push(t); } else lines.push({ y: t.y, h: t.h, parts: [t] }); }
        lines = lines.map(L => { L.parts.sort((a, b) => a.x - b.x); return { y: L.y, h: L.h, x: L.parts[0].x, text: L.parts.map(p => p.s).join(' ').replace(/\s+/g, ' ').trim() }; });
      } catch (e) { lines = []; }
      let cursor = -1; const missing = [];
      qs.forEach((q, j) => {
        let re;
        if (q.kind === 'mc') re = new RegExp(`^${q.n}(\\s|\\.|$)`);
        else if (q.kind === 'q') re = new RegExp(`^Question\\s*${q.n}\\b`, 'i');
        else { const lab = String(q.label || ''), letter = (lab.match(/^[a-z]/) || [])[0], roman = (lab.match(/\(([ivx]+)\)/) || [])[1];
          re = roman ? new RegExp(`^(Question\\s*\\d+\\s*(\\(\\d+ marks?\\))?.*?)?(\\(\\s*[a-z]\\s*\\)\\s*)?\\(\\s*${roman}\\s*\\)`) : letter ? new RegExp(`^(Question\\s*\\d+.*?)?\\(\\s*${letter}\\s*\\)`) : new RegExp(`^Question\\s*${q.n}\\b`, 'i'); }
        const i = lines.findIndex((L, k) => k > cursor && re.test(L.text) && (q.kind !== 'mc' || L.x < vp.width * 0.3));
        if (i < 0) { missing.push(j); return; }
        cursor = i; const L = lines[i];
        const b = document.createElement('button'); b.type = 'button'; b.className = 'pv-mark'; b.dataset.hq = `${pg}:${j}`; b.textContent = '?';
        b.title = `${Mix.name(q)}: ${q.marks} mark${q.marks > 1 ? 's' : ''}`; b.setAttribute('aria-label', `Help with ${Mix.name(q)}`);
        b.style.left = `${Math.max(0.6, (L.x / vp.width) * 100 - 5.2)}%`; b.style.top = `${((L.y - L.h * 0.85) / vp.height) * 100}%`;
        $('.pv-sheet', sec).appendChild(b);
      });
      $('.pv-qs', sec).innerHTML = missing.map(j => chip(qs[j], pg, j)).join('');
    }
    const size = () => $$('.pv-sheet', pagesEl).forEach(s => { s.style.width = width() + 'px'; s.style.height = width() * ratio + 'px'; });
    const drawn = new Map();
    const render = async (sec) => {
      const pg = +sec.dataset.p, w = Math.round(width()); if (drawn.get(pg) === w) return; drawn.set(pg, w);
      const page = await doc.getPage(pg), vp = page.getViewport({ scale: w / page.getViewport({ scale: 1 }).width * devicePixelRatio });
      const c = $('canvas', sec); c.width = vp.width; c.height = vp.height; c.style.width = '100%'; c.style.height = '100%';
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.catch(() => drawn.delete(pg));
      if (ctx.itemsOn) placeMarks(sec, page);
    };
    size();
    obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) render(e.target); }), { root: pagesEl, rootMargin: '900px 0px' });
    $$('.pv-page', pagesEl).forEach(s => obs.observe(s));
    const pgLabel = () => { const top = pagesEl.getBoundingClientRect().top; const cur = $$('.pv-page', pagesEl).find(s => s.getBoundingClientRect().bottom > top + 80); $('.pv-pg', el).textContent = `${cur ? cur.dataset.p : 1} / ${doc.numPages}`; };
    pagesEl.addEventListener('scroll', pgLabel, { passive: true }); pgLabel();
    // Zooming or resizing changes every page's height, so keep the page you're on where it was.
    const goTo = (pg, within = 0) => { const sec = $(`.pv-page[data-p="${pg}"]`, pagesEl); if (sec) pagesEl.scrollTop = sec.offsetTop - pagesEl.offsetTop - 12 + within * sec.offsetHeight; };
    const relayout = () => {
      const top = pagesEl.getBoundingClientRect().top, sec = $$('.pv-page', pagesEl).find(x => x.getBoundingClientRect().bottom > top + 1);
      const within = sec ? (top - sec.getBoundingClientRect().top) / sec.offsetHeight : 0;
      size(); if (sec) goTo(+sec.dataset.p, Math.max(0, within));
      $$('.pv-page', pagesEl).forEach(x => { const r = x.getBoundingClientRect(); if (r.bottom > -900 && r.top < innerHeight + 900) render(x); });
    };
    $$('[data-z]', el).forEach(b => b.onclick = () => { zoom = Math.max(0.6, Math.min(2.2, zoom + +b.dataset.z * 0.2)); relayout(); });
    const onResize = () => { if (document.body.contains(el)) relayout(); else removeEventListener('resize', onResize); };
    addEventListener('resize', onResize);
    if (startPage > 1) requestAnimationFrame(() => { goTo(startPage); pgLabel(); });
    // "?" help
    pagesEl.addEventListener('click', e => {
      const b = e.target.closest('[data-hq]'); if (!b) return;
      const [pg, j] = b.dataset.hq.split(':').map(Number), q = ctx.itemsOn(pg)[j]; if (q) showHelp(q, pg);
    });
    function showHelp(q, pg) {
      const sid = ctx.sid, names = codeName(sid), yp = yearPaper(sid, q.year), A = (typeof PAPER_ANSWERS !== 'undefined' && PAPER_ANSWERS[sid]?.[q.year]) || {};
      const key = q.kind === 'mc' ? 'mc' : `${q.n}${q.label || ''}`, ansPage = A[key] || A[`${q.n}${String(q.label || '').replace(/\(.*$/, '')}`] || A[String(q.n)];
      const decks = {}; decksOf(sid).forEach(d => (d.sections || []).forEach(s => { decks[s.code] = { d, s }; }));
      help.hidden = false;
      help.innerHTML = `<div class="pv-help-head"><b>${esc(Mix.name(q))}</b><span class="note">${q.marks} mark${q.marks > 1 ? 's' : ''}${q.kind === 'mc' ? ' · multiple choice' : ''}</span><button type="button" class="pv-x" aria-label="Close help">×</button></div>
        ${q.about ? `<p class="pv-about">${esc(q.about)}</p>` : ''}
        ${q.topics.map(c => { const t = decks[c]; return t ? `<div class="pv-topic"><h4>${esc(c)} ${fm(t.s.name)}</h4><ul>${(t.s.notes || []).slice(0, 4).map(n => `<li>${fm(n)}</li>`).join('')}</ul><button type="button" class="linkbtn" data-prac="${esc(t.d.id)}|${esc(c)}">Practise this topic</button></div>` : ''; }).join('')}
        <div class="pv-help-acts">${yp.mg ? `<button type="button" class="btn btn-sm" data-ans="1">Show the answer</button>` : '<span class="note">No answers for this year.</span>'}${aiReady() ? '<button type="button" class="btn btn-ghost btn-sm" data-hint="1">Get a hint</button>' : ''}</div><div class="pv-hint"></div>`;
      $('.pv-x', help).onclick = () => { help.hidden = true; };
      const ab = $('[data-ans]', help); if (ab) ab.onclick = () => openPdf(yp.mg + (ansPage ? `#page=${ansPage}` : ''), `${q.year} ${getSubj(sid).tab || getSubj(sid).name} answers${ansPage ? ` · ${Mix.name(q).replace(/^\d{4} /, '')}` : ''}`, {});
      $$('[data-prac]', help).forEach(b => b.onclick = () => { const [d, c] = b.dataset.prac.split('|'); close(); if (pvSit()) toast('Your timer keeps running. Past papers takes you back to it.'); openDeck(d, 'practice', c); });
      const hb = $('[data-hint]', help); if (hb) hb.onclick = async () => {
        hb.disabled = true; const out = $('.pv-hint', help); out.textContent = 'Thinking…';
        try {
          const txt = (await (await doc.getPage(pg)).getTextContent()).items.map(i => i.str).join(' ').slice(0, 3000);
          const r = await AI.fn(`A Year 12 NSW student is doing ${getSubj(sid).name} HSC ${q.year} ${Mix.name(q).replace(/^\d{4} /, '')} (${q.marks} marks${q.about ? `: ${q.about}` : ''}). Here is the text of that page of the exam (maths symbols may be garbled):\n"""${txt}"""\n\nGive a short HINT only: the first step or the key idea, in 2-4 sentences. Do NOT give the full solution or the final answer. Use LaTeX between $ signs for maths.`, { modelTier: 'default' });
          out.innerHTML = Fmt.rich(r.text);
        } catch (e) { out.textContent = AI.msg(e); } finally { hb.disabled = false; }
      };
    }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pdf]'); if (!b) return;
    e.preventDefault();
    const src = b.dataset.pdf, f = src.match(/papers\/(y12|e1|phys)-(\d{4})-(paper|mg)/);
    if (!f) return openPdf(src, 'Paper');
    const sid = f[1], year = +f[2], s = getSubj(sid), pg = (src.match(/#page=(\d+)/) || [])[1];
    openPdf(src, `${year} ${s.tab || s.name} ${f[3] === 'mg' ? 'answers' : 'paper'}`, f[3] === 'paper' ? paperCtx(sid, year) : {});
  });

  /* ---------------- official HSC past papers ---------------- */
  // Papers open from NESA's website (src/papers.js has links only). Here you sit them on a real exam
  // timer, then mark yourself with NESA's marking guidelines. Topics you lose marks on count as weak
  // spots, so the plan and "weakest topic" send you back to them.
  // The papers are bundled in the desktop app only, and open in its own viewer.
  const papersHere = !!window.lockinDesktop;
  const hasPapers = (sid) => papersHere && typeof PAPERS !== 'undefined' && !!PAPERS.LIST[sid];
  const paperKey = (sid, y) => `${sid}-${y}`;
  const SIT_KEY = 'lockin.sit';
  const sitState = () => { try { return JSON.parse(localStorage.getItem(SIT_KEY)) || null; } catch (e) { return null; } };
  const setSit = (v) => { try { v ? localStorage.setItem(SIT_KEY, JSON.stringify(v)) : localStorage.removeItem(SIT_KEY); } catch (e) { } };
  const pct = (r) => Math.round(r.total / r.outOf * 100);
  const papersOf = (sid) => (PAPERS.LIST[sid] || []).map(p => ({ ...p, result: (S.papers || {})[paperKey(sid, p.year)] }));
  function openPapers(sid) {
    if (!hasPapers(sid)) return;
    const sit = sitState(); if (sit) return openSit(sit.sid, sit.year);
    cur = { kind: 'papers', tab: null, sid }; const s = getSubj(sid), F = PAPERS.formatOf(sid, 9999);
    const body = ovFrame(`Past papers: ${s.name}`, 'c-' + s.hue, null), list = papersOf(sid), done = list.filter(p => p.result);
    const avg = done.length ? Math.round(done.reduce((a, p) => a + pct(p.result), 0) / done.length) : null;
    body.innerHTML = `<div class="pp">
      <p class="note">Every HSC paper, right here in the app. <b>Sit it</b> runs the real timer (${F.reading} min reading, ${F.writing / 60} hours writing). Then mark it with the marking guidelines and tick the topics you lost marks on: they go into your plan.</p>
      ${done.length ? `<div class="adm-stats"><div><b>${done.length}/${list.length}</b><span>papers done</span></div><div><b>${avg}%</b><span>average</span></div><div><b>${Math.max(...done.map(p => pct(p.result)))}%</b><span>best</span></div></div>` : ''}
      ${mixPanelHtml(sid)}
      <h3 class="pp-h">Full papers</h3>
      ${[['Current course', list.filter(p => !p.old)], [`Older papers (${list.filter(p => p.old).length})`, list.filter(p => p.old)]].filter(g => g[1].length).map(([gt, gl], gi) => `${gi ? `<details class="pp-old"><summary><b>${gt}</b> <span class="note">old course: some questions are on topics you don't do any more. Mix and match only picks the ones in your course.</span></summary>` : ''}
      <ul class="pp-list">${gl.map(p => `<li${p.result ? ' class="done"' : ''}>
        <span class="pp-year">${p.year}</span>
        <span class="pp-res">${p.result ? `<b>${p.result.total}/${p.result.outOf}</b> <span class="note">${pct(p.result)}% · ${new Date(p.result.at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>` : '<span class="note">Not done yet</span>'}</span>
        <span class="pp-links">${p.paper ? `<button class="linkbtn" type="button" data-pdf="${esc(p.paper)}">Paper</button>` : ''}${p.mg ? `<button class="linkbtn" type="button" data-pdf="${esc(p.mg)}">Marking guidelines</button>` : ''}</span>
        <span class="pp-acts"><button class="btn btn-sm" type="button" data-sit="${p.year}">${p.result ? 'Sit again' : 'Sit it'}</button><button class="btn btn-ghost btn-sm" type="button" data-mark="${p.year}">${p.result ? 'Edit marks' : 'Enter marks'}</button></span></li>`).join('')}</ul>${gi ? '</details>' : ''}`).join('')}
      <p class="note" style="font-size:13px">Papers and marking guidelines © NSW Education Standards Authority, kept in this app for your own study.</p></div>`;
    $$('[data-sit]', body).forEach(b => b.onclick = () => { const now = Date.now(); setSit({ sid, year: +b.dataset.sit, start: now, readEnd: now + F.reading * 6e4, end: now + (F.reading + F.writing) * 6e4, paused: null }); openSit(sid, +b.dataset.sit); });
    $$('[data-mark]', body).forEach(b => b.onclick = () => openMarkSheet(sid, +b.dataset.mark, null));
    bindMixPanel(body, sid);
    showOv();
  }
  /* ---------------- mix and match: papers made of questions from different years ---------------- */
  const hasIndex = (sid) => typeof PAPER_INDEX !== 'undefined' && !!PAPER_INDEX[sid] && typeof Mix !== 'undefined';
  // Random full papers keep to the current course; by-topic mixes use every year (only in-course questions are mapped).
  const currentIndex = (sid) => Object.fromEntries(Object.entries(PAPER_INDEX[sid]).filter(([y]) => !yearPaper(sid, y).old));
  const yearPaper = (sid, y) => (PAPERS.LIST[sid] || []).find(p => p.year === +y) || {};
  const itemUrl = (sid, i) => (yearPaper(sid, i.year).paper || '') + (i.page ? `#page=${i.page}` : '');
  const codeName = (sid) => { const m = {}; decksOf(sid).forEach(d => (d.sections || []).forEach(sec => { m[sec.code] = { name: sec.name, deck: d.id }; })); return m; };
  const mixesOf = (sid) => Object.values(S.mixes || {}).filter(m => m.sid === sid).sort((a, b) => b.at - a.at);
  function mixPanelHtml(sid) {
    if (!hasIndex(sid)) return '';
    const names = codeName(sid), counts = Mix.topicCounts(PAPER_INDEX[sid]), sel = new Set(cur.mixTopics || []), len = cur.mixLen || 30, mixes = mixesOf(sid);
    return `<section class="panel mix-panel"><h3>Mix and match</h3>
      <p class="note">Real HSC questions from different years, mixed into a new paper. Each one opens on the right page of the paper.</p>
      <div class="row"><button class="btn" type="button" data-mx="random">Random HSC paper</button><span class="note">Full length, questions from any year${PAPERS.LIST[sid].some(p => p.old) ? ` back to ${PAPERS.LIST[sid][PAPERS.LIST[sid].length - 1].year}, only the ones in your course` : ''}.</span></div>
      <h4>Or pick topics</h4>
      ${decksOf(sid).map(d => { const secs = (d.sections || []).filter(sec => counts[sec.code]); return secs.length ? `<div class="pp-topics"><b>${esc(d.title)}</b><div class="pills">${secs.map(sec => `<button class="pill" type="button" data-mt="${esc(sec.code)}" aria-pressed="${sel.has(sec.code)}" title="${counts[sec.code]} marks across all papers">${esc(sec.code)} ${fm(sec.name)}</button>`).join('')}</div></div>` : ''; }).join('')}
      <div class="row" style="margin-top:10px"><span class="note">Length</span><div class="pills" role="group" aria-label="Length">${[15, 30, 45, 60].map(n => `<button class="pill" type="button" data-ml="${n}" aria-pressed="${len === n}">${n} marks</button>`).join('')}</div><button class="btn btn-hot" type="button" data-mx="topic">Build it</button></div>
      ${mixes.length ? `<h4>Your mixes</h4><ul class="mix-list">${mixes.slice(0, 8).map(m => `<li><button class="linkbtn" type="button" data-mo="${esc(m.id)}">${esc(m.title)}</button> <span class="note">${Mix.total(m.items)} marks${m.result ? ` · <b>${m.result.total}/${m.result.outOf}</b> (${pct(m.result)}%)` : ''}</span></li>`).join('')}</ul>` : ''}</section>`;
  }
  function bindMixPanel(body, sid) {
    if (!hasIndex(sid)) return;
    $$('[data-mt]', body).forEach(b => b.onclick = () => { const set = new Set(cur.mixTopics || []), c = b.dataset.mt; set.has(c) ? set.delete(c) : set.add(c); cur.mixTopics = [...set]; b.setAttribute('aria-pressed', set.has(c)); });
    $$('[data-ml]', body).forEach(b => b.onclick = () => { cur.mixLen = +b.dataset.ml; $$('[data-ml]', body).forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $$('[data-mo]', body).forEach(b => b.onclick = () => openMix(b.dataset.mo));
    $$('[data-mx]', body).forEach(b => b.onclick = () => {
      const s = getSubj(sid), F = PAPERS.formatOf(sid, 9999), perMark = F.writing / PAPERS.outOf(sid), names = codeName(sid);
      let items, title;
      if (b.dataset.mx === 'random') { const hasOld = PAPERS.LIST[sid].some(p => p.old); items = hasOld ? Mix.randomPaperAll(sid, PAPER_INDEX[sid], (y) => !!yearPaper(sid, y).old) : Mix.randomPaper(sid, PAPER_INDEX[sid]); title = `Mixed ${s.tab || s.name} paper`; }
      else {
        const t = cur.mixTopics || []; if (!t.length) { toast('Pick at least one topic'); return; }
        items = Mix.byTopic(sid, PAPER_INDEX[sid], t, cur.mixLen || 30);
        if (!items.length) { toast('No past questions on those topics yet'); return; }
        if (Mix.total(items) < (cur.mixLen || 30) * 0.8) toast(`Only ${Mix.total(items)} marks of past questions on ${t.length > 1 ? 'those topics' : 'that topic'}, so this mix is shorter.`);
        const nm = (c) => String(names[c]?.name || c).replace(/\$[^$]*\$/g, '').trim();
        title = t.length <= 2 ? `${t.map(nm).join(' + ')} mix` : `${t.length}-topic ${s.tab || s.name} mix`;
      }
      const id = 'mx' + Date.now().toString(36), minutes = b.dataset.mx === 'random' ? F.writing : Mix.minutes(items, perMark);
      const all = { ...(S.mixes || {}), [id]: { id, sid, at: Date.now(), title, minutes, items } };
      S.mixes = Object.fromEntries(Object.entries(all).sort((x, y) => y[1].at - x[1].at).slice(0, 30)); save();
      openMix(id);
    });
  }
  // One paper out of a mix: a cover page listing the questions, then each question's pages from its
  // year's paper, in order. Built on this device with pdf-lib from the bundled papers.
  const mixUrls = {}, srcPdfs = {};
  async function mixPdf(m) {
    if (mixUrls[m.id]) return mixUrls[m.id];
    const s = getSubj(m.sid), names = codeName(m.sid), clean = (t) => String(t).replace(/\$[^$]*\$/g, '').trim();
    const lines = [[`${s.name}  |  ${Mix.total(m.items)} marks  |  ${m.minutes} minutes`, 12, false, 1], ['', 6], ['Questions in this paper', 13, true],
      ...m.items.map((i, k) => [`${k + 1}.  ${Mix.name(i)}  (${i.kind === 'mc' ? 'multiple choice' : i.kind === 'q' ? 'whole question' : 'part'}, ${i.marks} mark${i.marks > 1 ? 's' : ''})  ${i.topics.map(c => clean(names[c]?.name || c)).join(', ')}`, 10.5]),
      ['', 6], ['Each page keeps its original question numbers. Answer the questions listed above.', 10, false, 1]];
    const pages = Mix.pageList(PAPER_INDEX[m.sid], m.items).map(({ year, page }) => ({ file: yearPaper(m.sid, year).paper, page })).filter(p => p.file);
    return (mixUrls[m.id] = await window.lockinDesktop.buildPaper({ title: m.title, lines, pages }));
  }
  async function openMixPaper(m, btn) {
    const old = btn && btn.textContent; if (btn) { btn.disabled = true; btn.textContent = 'Putting it together…'; }
    try { openPdf(await mixPdf(m), m.title, { ...mixCtx(m), showYear: true }); } catch (e) { toast('Couldn\'t build the paper. Try again.'); }
    finally { if (btn) { btn.disabled = false; btn.textContent = old; } }
  }
  function openMix(id) {
    const m = (S.mixes || {})[id]; if (!m) return;
    const sid = m.sid, s = getSubj(sid), names = codeName(sid), Y = [...new Set(m.items.map(i => i.year))].sort();
    cur = { kind: 'mix', tab: null, sid }; const body = ovFrame(m.title, 'c-' + s.hue, null);
    body.innerHTML = `<div class="pp">
      <p class="note">${m.items.length} questions · ${Mix.total(m.items)} marks · ${m.minutes} minutes · from ${Y.length > 1 ? `${Y[0]}–${Y[Y.length - 1]}` : Y[0]}.</p>
      <div class="row"><button class="btn btn-hot" type="button" id="mxOpen">Open the paper</button><button class="btn" type="button" id="mxSit">Start the timer</button><button class="btn btn-ghost" type="button" id="mxMark">${m.result ? 'Edit marks' : 'Enter marks'}</button><button class="linkbtn" type="button" id="mxBack">← Past papers</button></div>
      ${m.result ? `<p><b>Your score: ${m.result.total}/${m.result.outOf} (${pct(m.result)}%)</b></p>` : ''}
      <details class="mix-what"><summary><b>What's in it</b> <span class="note">${m.items.length} questions</span></summary><ol class="mix-items">${m.items.map((i, k) => `<li><span class="mx-n">${k + 1}</span><div><b>${esc(Mix.name(i))}</b> <span class="note">${i.kind === 'mc' ? 'multiple choice' : i.kind === 'q' ? 'whole question' : 'part'} · ${i.marks} mark${i.marks > 1 ? 's' : ''}</span>
        <div class="note">${i.about ? esc(i.about) + ' · ' : ''}${i.topics.map(c => `${esc(c)} ${fm(names[c]?.name || '')}`).join(', ')}</div></div>
        <span class="mx-links"><button class="btn btn-ghost btn-sm" type="button" data-pdf="${esc(itemUrl(sid, i))}">Open</button>${yearPaper(sid, i.year).mg ? `<button class="linkbtn" type="button" data-pdf="${esc(yearPaper(sid, i.year).mg)}">Marking</button>` : ''}</span></li>`).join('')}</ol>
      </details><p class="note" style="font-size:13px">Questions © NSW Education Standards Authority.</p></div>`;
    $('#mxOpen', body).onclick = (e) => openMixPaper(m, e.currentTarget);
    $('#mxSit', body).onclick = () => { const now = Date.now(); setSit({ sid, mix: id, start: now, readEnd: now + 5 * 6e4, end: now + (5 + m.minutes) * 6e4, paused: null }); openSit(sid, null); };
    $('#mxMark', body).onclick = () => openMixMark(id, null);
    $('#mxBack', body).onclick = () => openPapers(sid);
    showOv();
  }
  function openMixMark(id, mins) {
    const m = (S.mixes || {})[id]; if (!m) return;
    const sid = m.sid, s = getSubj(sid), names = codeName(sid), old = m.result;
    cur = { kind: 'marksheet', tab: null }; const body = ovFrame(`Mark: ${m.title}`, 'c-' + s.hue, null);
    body.innerHTML = `<div class="pp-mark"><p class="note">Use each year's marking guidelines.${mins != null ? ` You wrote for ${mins} minute${mins === 1 ? '' : 's'}.` : ''} Every mark here counts towards your topic accuracy, so your plan knows what to work on.</p>
      <div class="pp-parts">${m.items.map((i, k) => `<label class="pp-part"><span>${k + 1}. ${esc(Mix.name(i))}${yearPaper(sid, i.year).mg ? ` <button class="linkbtn" type="button" data-pdf="${esc(yearPaper(sid, i.year).mg)}">marking</button>` : ''}</span><span class="pp-in"><input class="field" type="number" inputmode="numeric" min="0" max="${i.marks}" step="1" data-mi="${k}" value="${old?.scores?.[k] ?? ''}" aria-label="Marks for ${esc(Mix.name(i))}"> / ${i.marks}</span></label>`).join('')}</div>
      <div class="pp-total">Total <b id="ppTotal">0</b> / ${Mix.total(m.items)} <span id="ppPct" class="note"></span></div>
      <div class="row" style="margin-top:18px"><button class="btn btn-hot" type="button" id="mxSave">Save my mark</button><button class="btn btn-ghost" type="button" id="mxBack2">Back</button></div></div>`;
    const vals = () => $$('[data-mi]', body).map(i => i.value === '' ? null : Math.max(0, Math.min(+i.max, Math.round(+i.value))));
    const sum = () => { const v = vals(), t = v.reduce((a, x) => a + (x || 0), 0); $('#ppTotal', body).textContent = t; $('#ppPct', body).textContent = v.some(x => x != null) ? `${Math.round(t / Mix.total(m.items) * 100)}%` : ''; return t; };
    $$('[data-mi]', body).forEach(i => i.oninput = sum); sum();
    $('#mxBack2', body).onclick = () => openMix(id);
    $('#mxSave', body).onclick = () => {
      const v = vals(); if (!v.some(x => x != null)) { toast('Enter your marks first'); return; }
      // Each marked item counts as attempts on its main topic (only the first time it's marked).
      if (!old) m.items.forEach((i, k) => { if (v[k] == null) return; const c = i.topics[0], d = names[c]?.deck; if (!d) return; const t = (prog(d).tags[c] ||= [0, 0]); t[0] += i.marks; t[1] += v[k]; });
      const total = sum(), outOf = Mix.total(m.items);
      m.result = { at: Date.now(), total, outOf, scores: v };
      if (!old) { addXp(30 + total); bumpStreak(); Logic.logActivity(S, today(), outOf); }
      save(); renderStats(); renderBoard();
      if (!old) { burst(innerWidth / 2, innerHeight / 3, total / outOf >= 0.8 ? 160 : 80); toast(`${total}/${outOf} (${Math.round(total / outOf * 100)}%). +${30 + total} XP`); } else toast('Marks updated');
      openMix(id);
    };
    showOv();
  }
  let sitTick = null;
  function openSit(sid, year) {
    const s = getSubj(sid), st0 = sitState() || {}, mix = st0.mix ? (S.mixes || {})[st0.mix] : null;
    const p = mix ? {} : (PAPERS.LIST[sid] || []).find(x => x.year === year) || {}, F = PAPERS.formatOf(sid, year || 9999);
    const readMin = Math.round((st0.readEnd - st0.start) / 6e4) || F.reading, writeMin = Math.round((st0.end - st0.readEnd) / 6e4) || F.writing;
    const label = mix ? mix.title : `${year} ${s.tab || s.name}`;
    cur = { kind: 'sit', tab: null }; const body = ovFrame(mix ? mix.title : `${year} HSC ${s.name}`, 'c-' + s.hue, null); ov.classList.add('focus');
    body.innerHTML = `<div class="focus-run sit"><p class="focus-sub" id="sitPhase"></p><div class="focus-time" id="sitTime" role="timer" aria-live="off"></div><div class="focus-bar"><i id="sitBar"></i></div>
      <p class="focus-task" id="sitTip"></p>
      <div class="row" style="justify-content:center;margin-top:20px">${p.paper ? `<button class="btn" type="button" data-pdf="${esc(p.paper)}">Open the paper</button>` : ''}<button class="btn btn-ghost" type="button" id="sitPause"></button><button class="btn btn-ghost" type="button" id="sitDone">Finish</button><button class="linkbtn" type="button" id="sitQuit">Quit</button></div>
</div>`;
    if (mix) { const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = 'Open the paper'; b.onclick = () => openMixPaper(mix, b); $('.sit .row', body).prepend(b); }
    const draw = () => {
      const st = sitState(); if (!st) return;
      const now = st.paused || Date.now(), reading = now < st.readEnd, left = Math.max(0, (reading ? st.readEnd : st.end) - now);
      const h = Math.floor(left / 36e5), mm = Math.floor(left % 36e5 / 6e4), ss = Math.floor(left % 6e4 / 1e3);
      $('#sitTime').textContent = `${h ? h + ':' + pad(mm) : mm}:${pad(ss)}`; document.title = `${$('#sitTime').textContent} · ${label}`;
      $('#sitPhase').textContent = st.paused ? 'Paused' : reading ? `Reading time · ${readMin} minutes` : `Writing time · ${writeMin >= 60 && writeMin % 60 === 0 ? `${writeMin / 60} hour${writeMin > 60 ? 's' : ''}` : `${writeMin} minutes`}`;
      $('#sitTip').textContent = reading ? 'Read the whole paper. No writing yet: plan which questions you\'ll start with.' : left < 15 * 6e4 ? 'Last 15 minutes: make sure every multiple choice question has an answer.' : 'Do the questions you know first. Show all working: method marks add up.';
      $('#sitBar').style.width = `${Math.min(100, (now - st.start) / (st.end - st.start) * 100)}%`;
      $('#sitPause').textContent = st.paused ? 'Resume' : 'Pause';
      if (reading && !st.paused && !st.chimedRead && left <= 0) { st.chimedRead = 1; setSit(st); chime(); }
      if (!reading && left <= 0 && !st.paused) finish(true);
    };
    const finish = (timeUp) => {
      clearInterval(sitTick); const st = sitState(); setSit(null); document.title = baseTitle; ov.classList.remove('focus');
      const mins = st ? Math.max(0, Math.round(((st.paused || Date.now()) - st.readEnd) / 6e4)) : 0;
      if (timeUp) { chime(); toast('Pens down. Time to mark it.'); }
      if (mins >= 5) { Logic.addSession(S, { id: 'p' + (st?.start || Date.now()).toString(36), date: today(), min: Math.min(mins, writeMin), sid }); save(); }
      if (mix) openMixMark(mix.id, mins); else openMarkSheet(sid, year, mins);
    };
    $('#sitPause').onclick = () => { const st = sitState(); if (st.paused) { const d = Date.now() - st.paused; st.readEnd += d; st.end += d; st.paused = null; } else st.paused = Date.now(); setSit(st); draw(); };
    $('#sitDone').onclick = () => finish(false);
    $('#sitQuit').onclick = (e) => { const b = e.target; if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again to quit (nothing is saved)'; return; } clearInterval(sitTick); setSit(null); document.title = baseTitle; ov.classList.remove('focus'); openPapers(sid); };
    clearInterval(sitTick); sitTick = setInterval(() => { if (cur?.kind !== 'sit') { clearInterval(sitTick); document.title = baseTitle; return; } draw(); }, 500); draw();
    showOv();
  }
  function openMarkSheet(sid, year, mins) {
    const s = getSubj(sid), p = (PAPERS.LIST[sid] || []).find(x => x.year === year), F = PAPERS.formatOf(sid, year), old = (S.papers || {})[paperKey(sid, year)];
    // Real marks per question for that year when the question map has them (some Ext 1 questions are 14 or 16).
    const yi = hasIndex(sid) ? PAPER_INDEX[sid][year] : null;
    const parts = yi && sid !== 'phys' ? F.parts.map(([k, l, max]) => { const q = k[0] === 'Q' && yi.q.find(x => `Q${x.n}` === k); return [k, l, q ? q.marks : max]; }) : F.parts;
    const outOf = parts.reduce((a, x) => a + x[2], 0);
    cur = { kind: 'marksheet', tab: null }; const body = ovFrame(`Mark: ${year} ${s.name}`, 'c-' + s.hue, null);
    const topics = decksOf(sid).flatMap(d => (d.sections || []).map(sec => ({ id: d.id + ':' + sec.code, code: sec.code, name: sec.name, deck: d.title })));
    const lost = new Set(old?.lost || []);
    body.innerHTML = `<div class="pp-mark">
      <p class="note">${p.mg ? `Open the <button class="linkbtn" type="button" data-pdf="${esc(p.mg)}">marking guidelines</button> and mark each question honestly.` : 'Mark each question.'}${mins != null ? ` You wrote for ${mins} minute${mins === 1 ? '' : 's'}.` : ''}</p>
      <div class="pp-parts">${parts.map(([k, l, max]) => `<label class="pp-part"><span>${esc(l)}</span><span class="pp-in"><input class="field" type="number" inputmode="numeric" min="0" max="${max}" step="1" data-pt="${k}" value="${old?.scores?.[k] ?? ''}" aria-label="${esc(l)} marks"> / ${max}</span></label>`).join('')}</div>
      <div class="pp-total">Total <b id="ppTotal">0</b> / ${outOf} <span id="ppPct" class="note"></span></div>
      <h3>Which topics did you lose marks on?</h3><p class="note">Tick them and they become weak spots in your plan.</p>
      ${decksOf(sid).map(d => `<div class="pp-topics"><b>${esc(d.title)}</b><div class="pills">${(d.sections || []).map(sec => { const id = d.id + ':' + sec.code; return `<button class="pill" type="button" data-lt="${esc(id)}" aria-pressed="${lost.has(id)}">${esc(sec.code)} ${fm(sec.name)}</button>`; }).join('')}</div></div>`).join('')}
      <div class="row" style="margin-top:18px"><button class="btn btn-hot" type="button" id="ppSave">Save my mark</button><button class="btn btn-ghost" type="button" id="ppBack">Back to papers</button></div></div>`;
    const sum = () => { let t = 0, any = false; $$('[data-pt]', body).forEach(i => { const v = Math.max(0, Math.min(+i.max, Math.round(+i.value || 0))); if (i.value !== '') any = true; t += v; }); $('#ppTotal', body).textContent = t; $('#ppPct', body).textContent = any ? `${Math.round(t / outOf * 100)}%` : ''; return t; };
    $$('[data-pt]', body).forEach(i => i.oninput = sum); sum();
    $$('[data-lt]', body).forEach(b => b.onclick = () => { const id = b.dataset.lt; lost.has(id) ? lost.delete(id) : lost.add(id); b.setAttribute('aria-pressed', lost.has(id)); });
    $('#ppBack', body).onclick = () => openPapers(sid);
    $('#ppSave', body).onclick = () => {
      const scores = {}; $$('[data-pt]', body).forEach(i => { if (i.value !== '') scores[i.dataset.pt] = Math.max(0, Math.min(+i.max, Math.round(+i.value))); });
      if (!Object.keys(scores).length) { toast('Enter your marks first'); return; }
      const first = !old, total = sum();
      // New weak spots count as two missed attempts on that topic (only ones not already ticked for this paper).
      [...lost].filter(id => !(old?.lost || []).includes(id)).forEach(id => { const [deckId, code] = id.split(':'); const t = (prog(deckId).tags[code] ||= [0, 0]); t[0] += 2; });
      (S.papers ||= {})[paperKey(sid, year)] = { at: Date.now(), scores, total, outOf, lost: [...lost], mins: mins ?? old?.mins ?? null };
      if (first) { addXp(100); bumpStreak(); }
      save(); renderStats(); renderBoard();
      if (first) { burst(innerWidth / 2, innerHeight / 3, total / outOf >= 0.8 ? 180 : 90); toast(`${year} saved: ${total}/${outOf} (${Math.round(total / outOf * 100)}%). +100 XP`); }
      else toast('Marks updated');
      openPapers(sid);
    };
    showOv();
  }

  /* ---------------- English: writing feedback ---------------- */
  const WKINDS = [['petal', 'PETAL'], ['short', 'Short answer'], ['essay', 'Essay'], ['creative', 'Creative']];
  const LEGEND = {
    analytical: [['quote', 'Quotes'], ['dropped', 'Dropped quotes'], ['tech', 'Techniques'], ['verb', 'Analysis verbs'], ['thesis', 'Thesis'], ['topic', 'Weak topic sentences'], ['retell', 'Retelling'], ['weak', 'Vague words'], ['informal', 'Informal'], ['long', 'Long sentences']],
    creative: [['tell', 'Telling'], ['adverb', 'Adverbs'], ['cliche', 'Clichés'], ['informal', 'Dialogue punctuation'], ['long', 'Long sentences']],
  };
  const engState = () => { const E = (S.eng ||= { draft: { kind: 'petal', question: '', text: '', marks: 4 }, history: [] }); if (!WKINDS.some(k => k[0] === E.draft.kind)) E.draft.kind = 'petal'; return E; };
  // In memory only (not saved or synced): the latest feedback, and the exam timer.
  // Handlers re-read engState() because a cloud sync replaces S while the screen is open.
  let wlTimer = null, lastFb = null, wlClock = null;
  const Dn = () => engState().draft;
  function openWriting(load) {
    cur = { kind: 'writing', tab: 'write' }; const E = engState();
    if (load) E.draft = { kind: load.kind, question: load.question || '', text: load.text, marks: load.marks || 4 };
    ovFrame('Writing feedback', 'c-pink', [['write', 'Write'], ['history', `History${E.history.length ? ` (${E.history.length})` : ''}`]]);
    $$('.tab', ov).forEach(b => b.onclick = () => { cur.tab = b.dataset.tab; $$('.tab', ov).forEach(x => x.setAttribute('aria-selected', x === b)); drawWriting(); });
    drawWriting(); showOv();
  }
  function drawWriting() {
    clearInterval(wlTimer);
    const body = $('#ovBody'), E = engState(), D = E.draft;
    if (cur.tab === 'history') return drawWritingHistory(body);
    body.innerHTML = `<div class="wl">
      <div class="wl-edit">
        <div class="pills" role="group" aria-label="What are you writing?">${WKINDS.map(([k, l]) => `<button class="pill" type="button" data-wk="${k}" aria-pressed="${D.kind === k}">${l}</button>`).join('')}</div>
        <label class="lbl" for="wlQ">${D.kind === 'creative' ? 'Prompt or stimulus (optional)' : 'The question (optional, but feedback is sharper with it)'}</label>
        <div class="row wl-qrow"><input class="field" id="wlQ" maxlength="300" value="${esc(D.question)}" placeholder="${D.kind === 'creative' ? 'e.g. Write a story that begins with a sound' : 'e.g. How does Orwell use Squealer to show the power of language?'}">${D.kind === 'short' ? `<select class="field" id="wlMarks" aria-label="Marks">${[2, 3, 4, 5, 6, 7].map(n => `<option value="${n}"${+D.marks === n ? ' selected' : ''}>${n} marks</option>`).join('')}</select>` : ''}</div>
        <textarea class="field wl-text" id="wlText" spellcheck="true" placeholder="${D.kind === 'creative' ? 'Paste or write your story here…' : D.kind === 'petal' ? 'Write 1 or 2 PETAL paragraphs: Point, Evidence (a quote), Technique, Analysis, Link. Leave a blank line between paragraphs.' : 'Paste or write your response here. Put quotes in quotation marks and leave a blank line between paragraphs.'}">${esc(D.text)}</textarea>
        <div class="wl-bar"><span id="wlCount" class="mono"></span><span class="row"><button class="btn btn-ghost btn-sm" type="button" id="wlTime">${wlClock ? 'Stop timer' : `Time me (${D.kind === 'petal' ? 20 : 40} min)`}</button><button class="btn btn-hot" type="button" id="wlGo">Get feedback</button></span></div>
      </div>
      <div class="wl-out" id="wlOut" aria-live="polite">${lastFb ? '' : `<div class="wl-empty"><h3>Instant feedback on your writing</h3><ul class="note"><li>PETAL: Point, Evidence, Technique, Analysis and Link in every paragraph</li><li>Thesis, topic sentences and whether you answer the question</li><li>Quotes, techniques and whether you explain their effect</li><li>Retelling, vague words and informal language</li><li>For creative: showing not telling, senses, clichés and rhythm</li></ul><p class="note" style="font-size:13.5px">It checks the things markers look for. It can't judge how good your ideas are${aiReady() ? ', so use AI marking for that' : ''}.</p></div>`}</div>
    </div>`;
    const ta = $('#wlText', body), cnt = $('#wlCount', body);
    const count = () => {
      const n = (ta.value.match(/[A-Za-z][A-Za-z'’-]*/g) || []).length;
      let t = `${n} word${n === 1 ? '' : 's'}`;
      if (wlClock) { const left = Math.max(0, wlClock.end - Date.now()), used = (Date.now() - wlClock.start) / 6e4; t += ` · ${Math.floor(left / 6e4)}:${pad(Math.floor(left % 6e4 / 1e3))} left · ${used > 0.5 ? Math.round(n / used) : 0} words/min`; if (!left) { wlClock = null; chime(); toast('Time\'s up. Pens down: get your feedback.'); drawWriting(); return; } }
      cnt.textContent = t;
    };
    let saveT; ta.oninput = () => { Dn().text = ta.value; count(); clearTimeout(saveT); saveT = setTimeout(save, 800); };
    $('#wlQ', body).oninput = (e) => { Dn().question = e.target.value; clearTimeout(saveT); saveT = setTimeout(save, 800); };
    const mk = $('#wlMarks', body); if (mk) mk.onchange = () => { Dn().marks = +mk.value; save(); };
    $$('[data-wk]', body).forEach(b => b.onclick = () => { Dn().text = ta.value; Dn().kind = b.dataset.wk; lastFb = null; save(); drawWriting(); });
    $('#wlTime', body).onclick = () => { Dn().text = ta.value; wlClock = wlClock ? null : { start: Date.now(), end: Date.now() + (Dn().kind === 'petal' ? 20 : 40) * 6e4 }; drawWriting(); };
    $('#wlGo', body).onclick = () => runFeedback(body);
    if (wlClock) wlTimer = setInterval(() => { if (cur?.kind !== 'writing' || !$('#wlCount')) return clearInterval(wlTimer); count(); }, 1000);
    count();
    if (lastFb && lastFb.text === D.text) showFeedback2($('#wlOut', body), lastFb.r, D);
  }
  function runFeedback(body) {
    const E = engState(), D = E.draft; D.text = $('#wlText', body).value; D.question = $('#wlQ', body).value; const text = D.text.trim();
    if ((text.match(/\S+/g) || []).length < 25) { toast('Write at least a few sentences first'); $('#wlText', body).focus(); return; }
    const r = WR.analyse(text, { kind: D.kind, question: D.question, marks: D.marks });
    lastFb = { text: D.text, r };
    const words = r.stats.words, prev = E.history[E.history.length - 1];
    const isNew = !prev || prev.text !== text;
    if (isNew) {
      E.history.push({ id: 'w' + Date.now().toString(36), at: Date.now(), kind: D.kind, question: D.question, marks: D.marks, text: text.slice(0, 6000), words, score: r.score });
      E.history = E.history.slice(-25);
      if (words >= 100) { addXp(15); Logic.logActivity(S, today(), Math.min(10, Math.round(words / 80))); bumpStreak(); xpPop($('#wlGo', body), '+15'); }
      E.best = Math.max(E.best || 0, r.score);
    }
    save(); renderStats(); checkBadges();
    const out = $('#wlOut', body); showFeedback2(out, r, D);
    if (innerWidth < 980) out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (r.score >= 85 && isNew) burst(innerWidth * 0.7, 200, 90);
  }
  const petalHtml = (r) => {
    const c = r.checks.find(x => x.id === 'petal'); if (!c) return '';
    const L = [['P', 'Point'], ['E', 'Evidence'], ['T', 'Technique'], ['A', 'Analysis'], ['L', 'Link']];
    return `<div class="petal-grid">${c.petal.map((row, i) => `<div class="petal-row"><span class="petal-n">Paragraph ${i + 1}</span>${L.map(([k, n]) => `<span class="petal-k ${row[k] ? 'on' : 'off'}" title="${n}: ${row[k] ? 'there' : 'missing or weak'}"><b>${k}</b><small>${n}</small></span>`).join('')}</div>`).join('')}</div>`;
  };
  function showFeedback2(out, r, D) {
    const E = engState(), prevs = E.history.filter(h => h.kind === D.kind), before = prevs.length > 1 ? prevs[prevs.length - 2].score : null;
    const groups = D.kind === 'creative' ? LEGEND.creative : LEGEND.analytical;
    const present = new Set(r.marks.map(m => m.kind)), show = new Set(cur.wlShow || groups.map(g => g[0]));
    const icon = { good: '✓', ok: '~', fix: '!' };
    out.innerHTML = `<div class="wl-score c-${r.score >= 85 ? 'green' : r.score >= 70 ? 'cyan' : r.score >= 50 ? 'gold' : 'coral'}">
        <div class="ring" style="--p:${r.score}"><b>${r.score}</b></div>
        <div><h3>${esc(r.label)}</h3><p class="note">${r.stats.words} words, ${r.stats.paragraphs} paragraph${r.stats.paragraphs === 1 ? '' : 's'}${D.kind !== 'creative' ? `, ${r.stats.quotes} quote${r.stats.quotes === 1 ? '' : 's'}, ${r.stats.techniques} technique${r.stats.techniques === 1 ? '' : 's'}` : ''}.${before != null ? ` ${r.score > before ? `Up ${r.score - before} on last time.` : r.score < before ? `Down ${before - r.score} on last time.` : 'Same as last time.'}` : ''}</p></div></div>
      ${r.next.length ? `<div class="wl-next"><h4>Fix these first</h4><ol>${r.next.map(id => { const c = r.checks.find(x => x.id === id); return `<li><b>${esc(c.title)}.</b> ${esc(c.msg)}</li>`; }).join('')}</ol></div>` : '<div class="wl-next good"><h4>Nothing big to fix.</h4><p class="note">Now push the ideas: a more sophisticated thesis and a sharper personal response.</p></div>'}
      ${petalHtml(r)}
      ${aiReady() ? `<div class="row" style="margin:14px 0"><button class="btn btn-acc" type="button" id="wlAi">Mark it with AI</button><span class="note" style="font-size:13.5px">A mark out of ${D.kind === 'short' ? D.marks : D.kind === 'petal' ? 8 : 20}, judged on ideas as well as craft.</span></div><div id="wlAiOut"></div>` : ''}
      <ul class="wl-checks">${r.checks.map(c => `<li class="st-${c.status}"><span class="ic" aria-label="${c.status === 'good' ? 'Good' : c.status === 'ok' ? 'Could be better' : 'Fix this'}">${icon[c.status]}</span><div><b>${esc(c.title)}</b><p>${esc(c.msg)}</p>${c.tips && c.tips.length ? `<ul class="tips">${c.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div></li>`).join('')}</ul>
      <h4 style="margin:18px 0 8px">Your writing, marked up</h4>
      <div class="filters wl-legend" role="group" aria-label="Show highlights">${groups.filter(([k]) => present.has(k)).map(([k, l]) => `<button class="fchip lg-${k}" type="button" data-hl="${k}" aria-pressed="${show.has(k)}"><i></i>${l}</button>`).join('') || '<span class="note">Nothing highlighted.</span>'}</div>
      <div class="wl-marked" id="wlMarked"></div><p class="note" style="font-size:13px">Hover or tap a highlight to see why.</p>`;
    const analysed = D.text.trim(), drawMarked = () => { $('#wlMarked', out).innerHTML = WR.highlight(analysed, r.marks, [...show]); };
    drawMarked();
    $$('[data-hl]', out).forEach(b => b.onclick = () => { const k = b.dataset.hl; show.has(k) ? show.delete(k) : show.add(k); cur.wlShow = [...show]; b.setAttribute('aria-pressed', show.has(k)); drawMarked(); });
    $('#wlMarked', out).addEventListener('click', e => { const m = e.target.closest('mark[title]'); if (m) toast(m.title); });
    const ai = $('#wlAi', out); if (ai) ai.onclick = () => aiWriting(D, ai, $('#wlAiOut', out));
  }
  async function aiWriting(D, btn, box) {
    btn.disabled = true; box.innerHTML = '<div class="fb info"><b>Marking…</b><div class="note">Claude is reading it like an HSC marker would. This takes up to a minute.</div></div>';
    const outOf = D.kind === 'short' ? D.marks : D.kind === 'petal' ? 8 : 20;
    const what = { essay: 'an English analytical essay', paragraph: 'one analytical body paragraph', petal: 'an extended response of one or two PETAL paragraphs (Point, Evidence, Technique, Analysis, Link) about George Orwell\'s Animal Farm, worth 7 marks', short: `an English short-answer response worth ${D.marks} marks`, creative: 'a piece of imaginative/creative writing' }[D.kind];
    const crit = D.kind === 'creative'
      ? 'how well it fulfils the prompt; control of voice, perspective and structure; deliberate use of language and literary devices for effect; originality and emotional impact; control of grammar, punctuation and expression'
      : D.kind === 'petal' ? 'a clear Point that answers the question; well-chosen Evidence (a quote or specific moment); the correct Technique named; Analysis that explains how the technique creates meaning and links to Orwell\'s ideas; a Link back to the question; clear, formal expression'
      : 'how directly and thoughtfully it answers the question with a clear, sustained thesis; analysis of how the composer shapes meaning, using well-chosen textual references and techniques; insight into ideas and context; structure and cohesion; control of formal analytical language';
    const prompt = `You are an experienced, fair NSW English teacher marking work by a Year 8 student. Mark ${what}. Use Year 8 expectations and explain things in plain words a 13-year-old understands.
${D.question ? `Question/prompt: ${D.question}\n` : ''}Judge it on: ${crit}.
Be honest and specific, quote short bits of the student's writing when you comment, and use Australian spelling. Don't invent details about texts you can't see.

STUDENT RESPONSE:
"""${D.text.trim().slice(0, 14000)}"""

Reply with ONLY this JSON:
{"mark": <whole number 0-${outOf}>, "outOf": ${outOf}, "summary": "one or two sentences on the overall standard", "strengths": ["2-3 specific strengths"], "improve": ["3 specific, actionable improvements"], "rewrite": {"before": "one weak sentence copied exactly from the response", "after": "your improved version of that sentence"}}`;
    try {
      const j = await AI.fn.json(prompt, { modelTier: 'default', cache: false });
      const mk = Math.max(0, Math.min(outOf, Math.round(+j.mark || 0)));
      const L = (a) => (Array.isArray(a) ? a : []).slice(0, 4).map(x => `<li>${Fmt.rich(String(x))}</li>`).join('');
      box.innerHTML = `<div class="fb ${mk / outOf >= 0.8 ? 'good' : mk / outOf >= 0.5 ? 'info' : 'bad'}"><b>${mk}/${outOf}</b>${j.summary ? `<div style="margin-top:6px">${Fmt.rich(String(j.summary))}</div>` : ''}
        ${L(j.strengths) ? `<h4 style="margin:10px 0 4px">Strengths</h4><ul>${L(j.strengths)}</ul>` : ''}${L(j.improve) ? `<h4 style="margin:10px 0 4px">To improve</h4><ul>${L(j.improve)}</ul>` : ''}
        ${j.rewrite && j.rewrite.before && j.rewrite.after ? `<h4 style="margin:10px 0 4px">One sentence, upgraded</h4><p class="note"><s>${esc(j.rewrite.before)}</s></p><p>${esc(j.rewrite.after)}</p>` : ''}</div>`;
      const last = engState().history[engState().history.length - 1]; if (last) { last.ai = `${mk}/${outOf}`; save(); }
    } catch (e) { box.innerHTML = `<div class="fb bad"><b>${esc(AI.msg(e))}</b></div>`; }
    finally { btn.disabled = false; }
  }
  function drawWritingHistory(body) {
    const E = engState(), H = E.history.slice().reverse();
    if (!H.length) { body.innerHTML = '<div class="empty"><h3>No feedback yet</h3><p>Every time you get feedback, it\'s saved here so you can see yourself improve.</p></div>'; return; }
    const pts = E.history.slice(-20), w = 300, h = 60, x = (i) => pts.length > 1 ? i / (pts.length - 1) * w : w / 2, y = (s) => h - s / 100 * h;
    body.innerHTML = `<div class="wl-hist"><div class="spark"><svg viewBox="-6 -6 ${w + 12} ${h + 12}" role="img" aria-label="Your last ${pts.length} scores"><polyline points="${pts.map((p, i) => `${x(i)},${y(p.score)}`).join(' ')}" fill="none" stroke="var(--pink)" stroke-width="2.5" stroke-linejoin="round"/>${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.score)}" r="3.5" fill="var(--pink)"/>`).join('')}</svg><span class="note">Best: <b>${E.best || Math.max(...E.history.map(h => h.score))}</b></span></div>
      <ul class="wl-list">${H.map(hh => `<li><button type="button" data-wh="${hh.id}"><span class="sc">${hh.score}</span><span class="tx"><b>${esc((WKINDS.find(k => k[0] === hh.kind) || [, ''])[1])}${hh.question ? `: ${esc(hh.question.slice(0, 70))}${hh.question.length > 70 ? '…' : ''}` : ''}</b><small>${hh.words} words · ${ago(hh.at)}${hh.ai ? ` · AI ${esc(hh.ai)}` : ''}</small></span></button></li>`).join('')}</ul></div>`;
    $$('[data-wh]', body).forEach(b => b.onclick = () => { const hh = E.history.find(x => x.id === b.dataset.wh); E.draft = { kind: hh.kind, question: hh.question || '', text: hh.text, marks: hh.marks || 4 }; lastFb = null; save(); cur.tab = 'write'; $$('.tab', ov).forEach(x => x.setAttribute('aria-selected', x.dataset.tab === 'write')); drawWriting(); });
  }

  /* ---------------- English: quote bank + memoriser ---------------- */
  const quotes = () => (S.quotes ||= []);
  function openQuotes() { cur = { kind: 'quotes', tab: 'bank' }; ovFrame('Quote bank', 'c-pink', [['bank', 'My quotes'], ['learn', 'Learn them']]); $$('.tab', ov).forEach(b => b.onclick = () => { cur.tab = b.dataset.tab; $$('.tab', ov).forEach(x => x.setAttribute('aria-selected', x === b)); drawQuotes(); }); drawQuotes(); showOv(); }
  function drawQuotes() {
    const body = $('#ovBody'), Q = quotes(); if (cur.tab === 'learn') return learnQuotes(body);
    const texts = [...new Set(Q.map(q => q.text))], byText = {}; Q.forEach(q => (byText[q.text] ||= []).push(q));
    body.innerHTML = `<div class="qb"><form class="panel qb-add" id="qbForm"><h3>Add a quote</h3>
        <div class="qb-grid"><div><label class="lbl" for="qbT">Text</label><input class="field" id="qbT" list="qbTexts" maxlength="60" required placeholder="e.g. your prescribed novel" value="${esc(cur.lastText || '')}"><datalist id="qbTexts">${texts.map(t => `<option value="${esc(t)}">`).join('')}</datalist></div>
        <div><label class="lbl" for="qbTech">Technique</label><input class="field" id="qbTech" list="qbTechs" maxlength="40" placeholder="e.g. juxtaposition"><datalist id="qbTechs">${['metaphor', 'simile', 'personification', 'juxtaposition', 'symbolism', 'motif', 'imagery', 'irony', 'paradox', 'allusion', 'alliteration', 'sibilance', 'rhetorical question', 'high modality', 'emotive language', 'repetition', 'tricolon', 'hyperbole', 'enjambment', 'foreshadowing', 'dialogue', 'first-person narration', 'pathetic fallacy', 'oxymoron', 'anaphora', 'cumulative listing'].map(t => `<option value="${t}">`).join('')}</datalist></div></div>
        <label class="lbl" for="qbQ">Quote</label><textarea class="field" id="qbQ" maxlength="400" required placeholder="The exact words, without quotation marks" style="min-height:70px"></textarea>
        <div class="qb-grid"><div><label class="lbl" for="qbE">Effect / what it shows</label><input class="field" id="qbE" maxlength="200" placeholder="e.g. conveys how isolated the narrator feels"></div><div><label class="lbl" for="qbTh">Theme or idea</label><input class="field" id="qbTh" maxlength="60" placeholder="e.g. grief, belonging"></div></div>
        <div class="row" style="margin-top:12px"><button class="btn" type="submit">Add quote</button><span class="note" style="font-size:13.5px">${Q.length ? `${Q.length} quote${Q.length > 1 ? 's' : ''} saved.` : 'Saved to this device (and your account if you\'re signed in).'}</span></div></form>
      ${texts.length ? texts.map(t => `<div class="qb-text"><h3>${esc(t)} <span class="mono">${byText[t].length}</span></h3><ul>${byText[t].map(q => `<li><blockquote>“${esc(q.q)}”</blockquote><p class="note">${[q.tech && `<b>${esc(q.tech)}</b>`, q.effect && esc(q.effect), q.theme && `<i>${esc(q.theme)}</i>`].filter(Boolean).join(' · ')}</p><span class="qb-box" title="How well you know it">${'●'.repeat(q.box || 0)}${'○'.repeat(5 - (q.box || 0))}</span><button class="linkbtn" type="button" data-qdel="${q.id}" aria-label="Delete this quote">Delete</button></li>`).join('')}</ul></div>`).join('') : '<div class="empty"><h3>No quotes yet</h3><p>Add the quotes you need for your texts. Then "Learn them" drills you until you can write them out from memory.</p></div>'}</div>`;
    $('#qbForm', body).onsubmit = (e) => {
      e.preventDefault(); const t = $('#qbT', body).value.trim(), q = $('#qbQ', body).value.trim().replace(/^["“'‘]+|["”'’]+$/g, '');
      if (!t || !q) { toast('Add the text and the quote'); return; }
      quotes().push({ id: 'q' + Date.now().toString(36) + Math.floor(Math.random() * 99), text: t, q, tech: $('#qbTech', body).value.trim(), effect: $('#qbE', body).value.trim(), theme: $('#qbTh', body).value.trim(), box: 0, at: Date.now() });
      cur.lastText = t; save(); toast('Quote added'); drawQuotes(); $('#qbQ')?.focus();
    };
    $$('[data-qdel]', body).forEach(b => b.onclick = () => { if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again'; return; } S.quotes = quotes().filter(q => q.id !== b.dataset.qdel); (S.goneQ ||= {})[b.dataset.qdel] = Date.now(); save(); drawQuotes(); });
  }
  function learnQuotes(body) {
    const Q = quotes();
    if (!Q.length) { body.innerHTML = '<div class="empty"><h3>Add some quotes first</h3><p>Then this drills you until you can write them out word for word.</p></div>'; return; }
    const texts = [...new Set(Q.map(q => q.text))]; if (!cur.qText || (cur.qText !== 'all' && !texts.includes(cur.qText))) cur.qText = 'all'; cur.qMode ||= 'gaps';
    const pool = Q.filter(q => cur.qText === 'all' || q.text === cur.qText);
    // Weakest first: lowest box, then least recently seen.
    const q = pool.slice().sort((a, b) => (a.box || 0) - (b.box || 0) || (a.seen || 0) - (b.seen || 0))[0];
    q.seen = Date.now();
    body.innerHTML = `<div class="qb-learn"><div class="filters" role="group" aria-label="Text">${['all', ...texts].map(t => `<button class="fchip" type="button" data-qt="${esc(t)}" aria-pressed="${cur.qText === t}">${t === 'all' ? 'All texts' : esc(t)}</button>`).join('')}</div>
      <div class="filters" role="group" aria-label="Mode">${[['gaps', 'Fill the gaps'], ['letters', 'First letters'], ['full', 'From memory'], ['meaning', 'Technique & effect']].map(([k, l]) => `<button class="fchip" type="button" data-qm="${k}" aria-pressed="${cur.qMode === k}">${l}</button>`).join('')}</div>
      <div class="qcard qb-card"><div class="qhead"><span>${esc(q.text)}${q.theme ? ` · ${esc(q.theme)}` : ''}</span><span class="mk">${'●'.repeat(q.box || 0)}${'○'.repeat(5 - (q.box || 0))}</span></div><div id="qbQ"></div><div class="pfb" id="qbFb"></div></div>
      <div class="qnav"><button class="btn btn-hot" type="button" id="qbNext">Next quote</button></div></div>`;
    $$('[data-qt]', body).forEach(b => b.onclick = () => { cur.qText = b.dataset.qt; learnQuotes(body); });
    $$('[data-qm]', body).forEach(b => b.onclick = () => { cur.qMode = b.dataset.qm; learnQuotes(body); });
    $('#qbNext', body).onclick = () => learnQuotes(body);
    const host = $('#qbQ', body), fb = $('#qbFb', body);
    const result = (score) => {
      const ok = score >= 0.9, live = quotes().find(x => x.id === q.id) || q; live.box = Math.max(0, Math.min(5, (live.box || 0) + (ok ? 1 : -1))); live.seen = Date.now(); addXp(ok ? 4 : 1); Logic.logActivity(S, today(), 1); bumpStreak(); save(); renderStats(); checkBadges();
      fb.innerHTML = `<div class="fb ${ok ? 'good' : score >= 0.6 ? 'info' : 'bad'}"><b>${ok ? pick(['Word perfect.', 'Locked in.', 'Got it.']) : `${Math.round(score * 100)}% of the words.`}</b><blockquote>“${esc(q.q)}”</blockquote>${q.tech || q.effect ? `<p class="note">${[q.tech && `<b>${esc(q.tech)}</b>`, q.effect && esc(q.effect)].filter(Boolean).join(': ')}</p>` : ''}</div>`;
      if (ok) xpPop($('#qbNext', body), '+4');
      $('#qbNext', body).focus();
    };
    if (cur.qMode === 'gaps') {
      const toks = WR.cloze(q.q);
      host.innerHTML = `<p class="qb-cloze">${toks.map((t, i) => t.hide ? `<input class="field gap" data-g="${i}" aria-label="Missing word ${i + 1}" style="width:${Math.max(3, t.w.length + 1)}ch" autocomplete="off" autocapitalize="off" spellcheck="false">` : esc(t.w)).join(' ')}</p><div class="row"><button class="btn btn-sm" type="button" id="qbCheck">Check</button></div>`;
      const gaps = $$('.gap', host); gaps[0]?.focus();
      gaps.forEach((g, k) => g.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); (gaps[k + 1] || $('#qbCheck', host)).focus(); if (!gaps[k + 1]) $('#qbCheck', host).click(); } }));
      $('#qbCheck', host).onclick = () => { let right = 0; gaps.forEach(g => { const ok = WR.sameWord(g.value, toks[+g.dataset.g].w); right += ok; g.classList.add(ok ? 'right' : 'wrong'); g.readOnly = true; if (!ok) g.title = toks[+g.dataset.g].w; }); $('#qbCheck', host).remove(); result(right / gaps.length); };
    } else if (cur.qMode === 'meaning') {
      host.innerHTML = `<blockquote class="qb-big">“${esc(q.q)}”</blockquote><label class="lbl" for="qbAns">What technique is this, and what does it show?</label><textarea class="field" id="qbAns" style="min-height:70px"></textarea><div class="row"><button class="btn btn-sm" type="button" id="qbCheck">Show my notes</button></div>`;
      $('#qbCheck', host).onclick = () => {
        const a = $('#qbAns', host).value, hit = (x) => x && WR.recall(a, x) > 0.3 || (x && a.toLowerCase().includes(x.toLowerCase().split(' ')[0]));
        const sc = (q.tech ? (hit(q.tech) ? 0.5 : 0) : 0.5) + (q.effect ? (hit(q.effect) ? 0.5 : 0.2) : 0.5);
        $('#qbCheck', host).remove(); result(sc >= 0.9 ? 1 : sc);
      };
      $('#qbAns', host).focus();
    } else {
      host.innerHTML = `${cur.qMode === 'letters' ? `<p class="qb-hint mono">${esc(WR.initials(q.q))}</p>` : `<p class="note">Write the quote out from memory${q.tech ? ` (it's the ${esc(q.tech)})` : ''}${q.effect ? `: ${esc(q.effect)}` : ''}.</p>`}<textarea class="field" id="qbAns" style="min-height:70px" placeholder="Type the whole quote"></textarea><div class="row"><button class="btn btn-sm" type="button" id="qbCheck">Check</button></div>`;
      $('#qbAns', host).focus();
      $('#qbAns', host).addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#qbCheck', host)?.click(); } });
      $('#qbCheck', host).onclick = () => { const sc = WR.recall($('#qbAns', host).value, q.q); $('#qbAns', host).readOnly = true; $('#qbCheck', host).remove(); result(sc); };
    }
  }

  /* ---------------- admin panel (admin key only) ---------------- */
  // Keys live in keys.json in the repo. Edits are kept on this device as a list of changes; "Save" applies
  // them to the current keys.json on GitHub (with a token saved on this device), or you can paste it by hand.
  // Names are private to this device; keys.json only holds hashes and generic labels.
  const REPO = 'Jakedapro/Lock-in', KEYS_EDIT = `https://github.com/${REPO}/edit/main/keys.json`;
  const kget = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const kset = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const LENGTHS = [['1', '1 day'], ['7', '1 week'], ['30', '1 month'], ['90', '3 months'], ['0', 'Never']];
  const dayFmt = (t) => new Date(t).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  let adm = { fresh: false, saving: false, filter: 'all', made: null, err: '' };
  const ops = () => kget('lockin.keyOps', []);
  const addOp = (o) => { kset('lockin.keyOps', [...ops(), o]); autoSave(); };
  const siteUrl = () => (location.protocol === 'https:' ? location.href.split('#')[0].split('?')[0] : 'https://jakedapro.github.io/Lock-in/');
  function openAdmin() {
    adm = { ...adm, fresh: false, made: null, err: '' }; cur = { kind: 'admin', tab: null }; ovFrame('Admin', 'c-lilac', null); drawAdmin(); showOv();
    Gate.refresh().then(ok => { adm.fresh = ok; if (cur?.kind === 'admin') drawAdmin(); });
    ghSave();
  }
  // Unsaved key changes are never left sitting: retry when the app opens and whenever it comes back to the front.
  const retrySave = () => { if (Gate.isAdmin() && ops().length && kget('lockin.ghToken', '')) ghSave(); };
  Gate.onOpen(() => setTimeout(retrySave, 1500));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') retrySave(); });
  async function ghSave(tries = 3) {
    const tok = kget('lockin.ghToken', ''), pend = ops(); if (!tok || !pend.length || adm.saving) return;
    adm.saving = true; adm.err = ''; if (cur?.kind === 'admin') drawAdmin();
    const url = `https://api.github.com/repos/${REPO}/contents/keys.json`, h = { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json' };
    try {
      const r = await fetch(url + '?ref=main&t=' + Date.now(), { headers: h, cache: 'no-store' });
      if (!r.ok) throw r.status;
      const j = await r.json(), current = JSON.parse(decodeURIComponent(escape(atob(j.content.replace(/\s/g, ''))))), next = Keys.applyOps(current, pend);
      const p = await fetch(url, { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Invite keys: ${pend.length} change${pend.length > 1 ? 's' : ''}`, content: btoa(unescape(encodeURIComponent(Keys.toJson(next)))), sha: j.sha, branch: 'main' }) });
      if (!p.ok) throw p.status;
      kset('lockin.keyOps', ops().slice(pend.length)); Gate.setList(next); adm.fresh = true;
      toast('Saved. Changes reach everyone in about a minute.');
    } catch (e) {
      if ((e === 409 || e === 422) && tries > 1) { adm.saving = false; return ghSave(tries - 1); } // someone saved in between: fetch it again and re-apply
      adm.err = e === 401 ? 'GitHub said the token is wrong or has expired. Make a new one below.' : e === 403 || e === 404 ? 'GitHub refused: the token can\'t write to the repo, or the account is still suspended. Your changes are kept on this device.' : e === 409 || e === 422 ? 'keys.json changed while saving. Tap Save again.' : 'Couldn\'t reach GitHub. Your changes are kept on this device and will save when you\'re back online.';
    }
    adm.saving = false; if (cur?.kind === 'admin') drawAdmin();
  }
  let saveT = null; const autoSave = () => { clearTimeout(saveT); if (kget('lockin.ghToken', '')) saveT = setTimeout(ghSave, 600); };
  function drawAdmin() {
    const body = $('#ovBody'), live = Gate.keys(), pend = ops(), list = Keys.applyOps(live, pend), names = kget('lockin.keyLabels', {}), secrets = kget('lockin.keySecrets', {});
    const tok = kget('lockin.ghToken', ''), now = Date.now(), liveIds = new Set(live.keys.map(k => k.id));
    const nameOf = (k) => names[k.id] || k.label || k.id;
    const stat = (k) => { const st = Keys.status(k, now), d = Keys.daysLeft(k, now); return st === 'off' ? ['off', 'Turned off'] : st === 'expired' ? ['exp', `Ran out ${dayFmt(k.exp)}`] : Keys.isAdmin(k) ? ['adm', 'Admin · never runs out'] : d == null ? ['ok', 'Never runs out'] : d <= 3 ? ['soon', `${d} day${d === 1 ? '' : 's'} left`] : ['ok', `Until ${dayFmt(k.exp)}`]; };
    const rows = list.keys.filter(k => adm.filter === 'all' || (adm.filter === 'on' ? Keys.status(k, now) === 'ok' : adm.filter === 'soon' ? (Keys.daysLeft(k, now) ?? 99) <= 3 && Keys.status(k, now) === 'ok' : Keys.status(k, now) !== 'ok'));
    const counts = { on: list.keys.filter(k => Keys.status(k, now) === 'ok').length, soon: list.keys.filter(k => Keys.status(k, now) === 'ok' && (Keys.daysLeft(k, now) ?? 99) <= 3).length, off: list.keys.filter(k => Keys.status(k, now) !== 'ok').length };
    const m = adm.made;
    body.innerHTML = `<div class="adm">
      <div class="adm-stats"><div><b>${counts.on}</b><span>working</span></div><div><b>${counts.soon}</b><span>running out in 3 days</span></div><div><b>${counts.off}</b><span>off or ran out</span></div></div>
      <div class="adm-save ${pend.length ? 'has' : ''}">${adm.saving ? '<b>Saving to GitHub…</b>' : pend.length ? `<b>${pend.length} change${pend.length > 1 ? 's' : ''} not saved yet.</b> ${tok ? '<button class="btn btn-sm" type="button" data-ad="save">Save now</button>' : `<span class="note">Connect GitHub below to save in one tap, or <button class="linkbtn" type="button" data-ad="copyjson">copy keys.json</button> and paste it on <a class="linkbtn" href="${KEYS_EDIT}" target="_blank" rel="noopener">GitHub</a>.</span>`}` : `<b>All saved.</b> <span class="note">${tok ? 'Connected to GitHub: changes save by themselves.' : 'Connect GitHub below so changes save by themselves.'}</span>`}${adm.err ? `<p class="adm-err">${esc(adm.err)}</p>` : ''}${!adm.fresh ? '<p class="note" style="font-size:13px;margin:6px 0 0">Showing the last key list this device saw.</p>' : ''}</div>
      ${m ? `<div class="key-new"><span class="eyebrow">Key for ${esc(m.name)} · ${m.exp ? `works until ${dayFmt(m.exp)}` : 'never runs out'}</span><div class="key-big">${esc(m.key)}</div>
        <div class="row"><button class="btn btn-sm" type="button" data-ad="msg">Copy message to send</button><button class="btn btn-ghost btn-sm" type="button" data-ad="link">Copy invite link</button><button class="btn btn-ghost btn-sm" type="button" data-ad="key">Copy key</button></div>
        <p class="note" style="font-size:13.5px;margin:0">${tok ? 'It works for them about a minute after it saves.' : 'It works for them once keys.json is saved to GitHub.'}</p></div>` : ''}
      <section class="panel adm-make"><h3>Make a key</h3>
        <div class="ans"><input class="field" id="kName" maxlength="30" placeholder="Who's it for? e.g. Sam" aria-label="Who the key is for"></div>
        <div class="pills" role="group" aria-label="How long it works">${LENGTHS.map(([d, l]) => `<button class="pill" type="button" data-len="${d}" aria-pressed="${String(adm.len ?? '7') === d}">${l}</button>`).join('')}</div>
        <div class="row" style="margin-top:12px"><button class="btn" type="button" data-ad="make">Make key</button></div></section>
      <section><div class="adm-head"><h3>Keys</h3><div class="filters" role="group" aria-label="Show">${[['all', 'All'], ['on', 'Working'], ['soon', 'Running out'], ['off', 'Off or ran out']].map(([k, l]) => `<button class="fchip" type="button" data-af="${k}" aria-pressed="${adm.filter === k}">${l}</button>`).join('')}</div></div>
        <ul class="adm-list">${rows.map(k => { const [cls, txt] = stat(k), admin = Keys.isAdmin(k), saved = liveIds.has(k.id); return `<li class="st-${cls}">
          <span class="mono">${esc(k.id)}</span><span class="nm">${esc(nameOf(k))}${!saved ? ' <small>not saved</small>' : ''}</span><span class="chip">${txt}</span>
          <span class="acts">${admin ? '' : `<button class="linkbtn" type="button" data-ext="${esc(k.id)}">+1 week</button><button class="linkbtn" type="button" data-tog="${esc(k.id)}">${k.revoked ? 'Turn on' : 'Turn off'}</button>`}${secrets[k.id] ? `<button class="linkbtn" type="button" data-cl="${esc(k.id)}">Copy link</button>` : ''}<button class="linkbtn" type="button" data-rn="${esc(k.id)}">Rename</button>${admin ? '' : `<button class="linkbtn danger" type="button" data-del="${esc(k.id)}">Remove</button>`}</span></li>`; }).join('') || '<li class="empty-row">No keys here.</li>'}</ul></section>
      <details class="panel adm-gh"${tok ? '' : ' open'}><summary><b>GitHub connection</b> <span class="note">${tok ? 'connected on this device' : 'not connected'}</span></summary>
        <ol class="note"><li>Open <a class="linkbtn" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub: new fine-grained token</a>.</li><li>Repository access: <b>Only select repositories</b> → <b>lock-in</b>.</li><li>Permissions → Repository → <b>Contents: Read and write</b>. Generate it.</li><li>Paste it here. It stays on this device only.</li></ol>
        <div class="ans"><input class="field" id="ghTok" type="password" autocomplete="off" placeholder="${tok ? 'Saved. Paste a new one to replace it' : 'github_pat_…'}" aria-label="GitHub token"><button class="btn btn-ghost btn-sm" type="button" data-ad="tok">Save token</button>${tok ? '<button class="linkbtn" type="button" data-ad="forgettok">Forget it</button>' : ''}</div></details>
      <div class="row" style="margin-top:14px"><button class="linkbtn" type="button" data-ad="lock">Lock this device</button></div></div>`;
    const keyById = (id) => list.keys.find(k => k.id === id);
    const msgFor = (name, key, exp) => `Here's your Lock in invite${exp ? ` (works until ${dayFmt(exp)})` : ''}: ${siteUrl()}#key=${key}`;
    $$('[data-len]', body).forEach(b => b.onclick = () => { adm.len = b.dataset.len; $$('[data-len]', body).forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $$('[data-af]', body).forEach(b => b.onclick = () => { adm.filter = b.dataset.af; drawAdmin(); });
    $$('[data-ad]', body).forEach(b => b.onclick = () => {
      const a = b.dataset.ad;
      if (a === 'make') {
        const name = $('#kName', body).value.trim().slice(0, 30); if (!name) { toast('Who\'s it for?'); $('#kName', body).focus(); return; }
        const days = +(adm.len ?? '7'), key = Keys.make(), id = 'k' + String(Math.max(0, ...list.keys.map(k => +String(k.id).slice(1) || 0)) + 1).padStart(2, '0');
        const entry = { id, hash: Keys.hash(key), label: 'Friend' }; if (days) entry.exp = Date.now() + days * Keys.DAY;
        kset('lockin.keyLabels', { ...names, [id]: name }); kset('lockin.keySecrets', { ...secrets, [id]: key });
        adm.made = { name, key, exp: entry.exp }; addOp({ op: 'add', entry }); drawAdmin(); return;
      }
      if (a === 'msg') return copyText(msgFor(m.name, m.key, m.exp), 'Message copied. Send it to them.', body);
      if (a === 'link') return copyText(siteUrl() + '#key=' + m.key, 'Invite link copied', body);
      if (a === 'key') return copyText(m.key, 'Key copied', body);
      if (a === 'save') return ghSave();
      if (a === 'copyjson') return copyText(Keys.toJson(list), 'keys.json copied. On GitHub, select everything in the file and paste over it.', body);
      if (a === 'tok') { const v = $('#ghTok', body).value.trim(); if (!/^(github_pat_|ghp_)\w{20,}$/.test(v)) { toast('That doesn\'t look like a GitHub token'); return; } kset('lockin.ghToken', v); toast('Token saved on this device'); drawAdmin(); ghSave(); return; }
      if (a === 'forgettok') { kset('lockin.ghToken', null); drawAdmin(); return; }
      if (a === 'lock') { if (b.dataset.sure) { closeOv(); Gate.forget(); } else { b.dataset.sure = 1; b.textContent = 'Tap again: you\'ll need your key to get back in'; } }
    });
    $$('[data-ext]', body).forEach(b => b.onclick = () => { const k = keyById(b.dataset.ext); const from = Math.max(Date.now(), k.exp || Date.now()); addOp({ op: 'set', id: k.id, patch: { exp: from + 7 * Keys.DAY, revoked: null } }); toast(`${nameOf(k)}: works until ${dayFmt(from + 7 * Keys.DAY)}`); drawAdmin(); });
    $$('[data-tog]', body).forEach(b => b.onclick = () => { const k = keyById(b.dataset.tog); addOp({ op: 'set', id: k.id, patch: { revoked: k.revoked ? null : true } }); drawAdmin(); });
    $$('[data-cl]', body).forEach(b => b.onclick = () => { const k = keyById(b.dataset.cl); copyText(msgFor(nameOf(k), secrets[k.id], k.exp), 'Message with the invite link copied', body); });
    $$('[data-del]', body).forEach(b => b.onclick = () => { if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again to remove'; return; } addOp({ op: 'del', id: b.dataset.del }); drawAdmin(); });
    $$('[data-rn]', body).forEach(b => b.onclick = () => {
      const li = b.closest('li'), cell = $('.nm', li), id = b.dataset.rn;
      cell.innerHTML = `<input class="field" maxlength="30" value="${esc(names[id] || '')}" aria-label="Name for ${esc(id)}" style="padding:6px 8px">`;
      const inp = $('input', cell); inp.focus();
      inp.onblur = () => { const L = kget('lockin.keyLabels', {}), v = inp.value.trim(); if (v) L[id] = v; else delete L[id]; kset('lockin.keyLabels', L); drawAdmin(); };
      inp.onkeydown = (e) => { if (e.key === 'Enter') inp.blur(); };
    });
  }

  /* ---------------- intro motion ---------------- */
  function intro() { } // no load animation: motion only answers what you do



  $('#mistBtn').onclick = () => openMistakes();
  $('#cmdBtn').onclick = openCmd;
  $('#focusBtn').onclick = openFocus;
  // Theme: auto (follows the device), dark or light. Remembered on this device.
  const THEMES = ['auto', 'dark', 'light'], THEME_ICON = {
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  };
  function applyTheme(t) {
    if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    const b = $('#themeBtn'); b.innerHTML = THEME_ICON[t] + `<small>${t === 'auto' ? 'Auto' : t === 'dark' ? 'Dark' : 'Light'}</small>`; b.setAttribute('aria-label', `Theme: ${t}. Click to change.`);
  }
  let theme = 'auto'; try { theme = localStorage.getItem('lockin.theme') || 'auto'; } catch (e) { }
  applyTheme(theme);
  $('#themeBtn').onclick = () => { theme = THEMES[(THEMES.indexOf(theme) + 1) % 3]; try { localStorage.setItem('lockin.theme', theme); } catch (e) { } applyTheme(theme); };
  if (focusState()) openFocus(); // a session survives a reload
  else if (typeof sitState === 'function' && sitState()) { // so does a past paper, unless it ended more than an hour ago
    const st = sitState();
    if (!st.paused && Date.now() > st.end + 36e5) setSit(null); else Gate.onOpen(() => openSit(st.sid, st.year));
  }
  $('#acctBtn').onclick = () => (me && !S.profile ? openProfile(true) : openAccount());
  if (S.subj !== 'home' && !subjects().some(s => s.id === S.subj)) S.subj = 'home';
  renderStats(); renderMistakeCount(); renderTabs(); renderNext(); renderBoard(); renderSubject(); renderWeek(); renderUpSubjects(); renderAiNote(); renderAcct(); renderLeague(); intro();
  AI.init();
  Cloud.init(onUser);
  Gate.onOpen(() => { renderTabs(); renderSubject(); $('#adminBtn').hidden = !Gate.isAdmin(); if (Gate.isAdmin() && kget('lockin.keyOps', []).length) ghSave(); });
  Gate.onExpirySoon((d) => toast(`Your key runs out in ${d} day${d === 1 ? '' : 's'}. Ask for a new one.`));
  $('#adminBtn').onclick = openAdmin;
})();
