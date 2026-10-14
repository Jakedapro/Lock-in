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
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } if (me) queueSync(); };
  const today = () => new Date().toLocaleDateString('en-CA');
  function bumpStreak() { const t = today(); if (S.streak.last === t) return; const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA'); S.streak.n = S.streak.last === y ? S.streak.n + 1 : 1; S.streak.last = t; }
  const prog = (id) => (S.p[id] ||= { att: 0, cor: 0, tags: {}, known: {} });
  function record(deckId, tags, got, out) {
    if (!deckId || !out) return;
    const p = prog(deckId); p.att += out; p.cor += got;
    (tags && tags.length ? tags : ['all']).forEach(t => { const r = (p.tags[t] ||= [0, 0]); r[0] += out; r[1] += got; });
    addXp(got * 10 + 2); Logic.logActivity(S, today(), out); bumpStreak(); save(); renderStats();
  }
  function addXp(n) { S.xp += n; const wk = Logic.weekStart(new Date()); if (S.week.start !== wk) S.week = { start: wk, xp: 0 }; S.week.xp += n; }
  const mastery = (id) => { const p = S.p[id]; if (!p || !p.att) return 0; return Math.round(p.cor / p.att * Math.min(1, p.att / 30) * 100); };
  function renderStats() { $('#xp').textContent = S.xp; $('#streak').textContent = S.streak.n; }

  /* ---------------- subjects & decks ---------------- */
  const SUBJ = [
    { id: 'geo', name: 'Geography', hue: 'green', exam: new Date(2026, 9, 26, 9, 0), when: 'Mon 26 Oct, P1–2', format: '45 minutes. 30 multiple choice (25 on geographical tools & skills, 5 on Water in the World) + 3 short answers.', mock: 'geo' },
    { id: 'maths', name: 'Maths', hue: 'gold', exam: new Date(2026, 9, 29, 11, 0), when: 'Thu 29 Oct, P3–4', format: 'The exam covers chapters 8, 9, 10 and 12, with multi-part questions like the Test Yourself pages. Ch 3 and Ch 7 are extra practice.', mock: 'maths' },
    { id: 'y12', name: 'Maths Extension 2', tab: 'Ext 2', hue: 'lilac', exam: new Date(2026, 9, 19, 13, 50), when: 'Mon 19 Oct, 1:50 pm', format: 'HSC paper: 3 hours. Section I is 10 multiple choice; Section II is 90 marks across proof, complex numbers, induction, integration, vectors and mechanics.', mock: 'gen', papers: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/mathematics-extension-2' },
    { id: 'e1', name: 'Maths Extension 1', tab: 'Ext 1', hue: 'cyan', exam: new Date(2026, 9, 23, 13, 50), when: 'Fri 23 Oct, 1:50 pm', format: 'HSC paper: 2 hours. Section I is 10 multiple choice; Section II is 60 marks of multi-part questions.', mock: 'gen', papers: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/mathematics-extension-1' },
    { id: 'phys', name: 'Physics', hue: 'coral', exam: new Date(2026, 10, 5, 9, 25), when: 'Thu 5 Nov, 9:25 am', format: 'HSC paper: 3 hours. Section I is 20 multiple choice; Section II is 80 marks of short answers and extended responses on modules 5 to 8.', mock: 'gen', papers: 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/physics' },
  ];
  const BUILTIN = [
    G.mapDeck, G.waterDeck,
    ...Y8.DECKS,
    ...M.DECKS.map(d => ({ ...d, subject: 'maths', bank: X.BANK[d.id], drills: M.GEN[d.gen] })),
    { ...X.ch12, subject: 'maths', bank: X.BANK.sim },
    ...E2.DECKS, ...E1.DECKS, ...PH.DECKS,
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
    ['Wednesday', 28, [['9:15', 'Late start'], ['P3', 'SAGE prep meeting'], ['P5–6', 'English']]],
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
      <div class="row" style="justify-content:center;margin-top:24px"><button class="btn btn-ghost" type="button" id="fPause"></button><button class="btn btn-ghost" type="button" id="fStop">End session</button></div></div>`;
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
    clearInterval(focusTick); setFocus(null); document.title = baseTitle;
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
    el.innerHTML = `<section class="plan" id="plan" aria-labelledby="plH"></section>
    <div class="home-grid">
      <section class="report" aria-labelledby="rcH">
        <h2 id="rcH">Report card</h2><p class="sec-sub">${esc(S.profile?.nickname || 'You')}, ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <table class="rc"><thead><tr><th scope="col">Subject</th><th scope="col">Mastery</th><th scope="col">Level</th><th scope="col">Grade</th></tr></thead>
          <tbody>${subs.map(s => { const ds = decksOf(s.id), m = avg(ds), L = best(ds); return `<tr class="c-${s.hue}"><th scope="row"><button class="linkbtn" type="button" data-subj-go="${esc(s.id)}">${esc(s.name)}</button></th><td><span class="rbar"><i style="width:${m}%"></i></span> ${m}%</td><td><span class="d-level lvl-${L}">${LNAME[L]}</span></td><td class="grade">${GRADE(m)}</td></tr>`; }).join('')}</tbody></table>
        <dl class="tallies"><div><dt>XP</dt><dd>${S.xp}</dd></div><div><dt>Day streak</dt><dd>${S.streak.n}</dd></div><div><dt>Marks attempted</dt><dd>${answered}</dd></div><div><dt>Mistakes cleared</dt><dd>${cleared}</dd></div></dl>
        <div class="heat-head"><h3>Study days</h3><span>${weekMin} min focused this week</span></div>
        <div class="heat" role="img" aria-label="Study activity over the last 12 weeks">${hm.map(d => `<i class="h${d.level}" title="${esc(new Date(d.date + 'T12:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }))}: ${d.min} min focused, ${d.marks} marks"></i>`).join('')}</div>
        <div class="heat-key" aria-hidden="true">Less <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> More</div>
        <button class="btn btn-ghost" type="button" id="shareSite">Share Lock in</button>
      </section>
      <section class="inside" aria-labelledby="inH">
        <h2 id="inH">What's inside</h2>
        <p class="sec-sub">${all.length} decks, ${cards} flashcards, ${topics} topics of notes and ${gens} question generators that never run out.</p>
        ${subs.map(s => `<div class="in-sub c-${s.hue}"><h3>${esc(s.name)}${s.exam ? `<small>${esc(shortDate(s.exam))}</small>` : ''}</h3><ul>${decksOf(s.id).map(d => `<li><button class="linkbtn" type="button" data-open="${esc(d.id)}">${esc(d.title)}</button><span>${esc(d.chapter || '')}</span></li>`).join('')}</ul></div>`).join('')}
      </section>
    </div>
    <section class="features" aria-labelledby="ftH"><h2 id="ftH">What it does</h2><dl>${FEATURES.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl></section>`;
    $('#shareSite').onclick = () => copyText(location.href.split('#')[0], 'Link copied. Send it to your mates.', el);
    renderPlan();
    $$('[data-subj-go]', el).forEach(b => b.onclick = () => { S.subj = b.dataset.subjGo; save(); renderTabs(); renderSubject(); });
  }
  function renderSubject() {
    if (S.subj === 'home') return renderHome($('#subject'));
    const s = getSubj(S.subj), ds = decksOf(s.id), el = $('#subject'), nm = mistakesOf(s.id).length;
    el.className = 'wrap section c-' + s.hue;
    el.innerHTML = `<div class="subj-head"><div><h2>${esc(s.name)}</h2><p class="subj-meta">${s.exam ? `Exam ${esc(s.when)}. ` : ''}${esc(s.format)}</p>${s.papers ? `<p class="subj-meta"><a class="linkbtn" href="${esc(s.papers)}" target="_blank" rel="noopener">Official HSC past papers and marking guidelines (NESA)</a></p>` : ''}${nm ? `<button class="linkbtn mist-link" type="button" data-act="mistakes" data-s="${esc(s.id)}">${nm} mistake${nm > 1 ? 's' : ''} to fix</button>` : ''}</div>
      <div class="subj-actions">${s.mock ? `<button class="btn" type="button" data-act="mock" data-s="${s.id}">Practice exam${s.mock === 'geo' ? ', 45 min' : ''}</button>` : ''}${ds.length ? `<button class="btn btn-ghost" type="button" data-act="cards" data-s="${esc(s.id)}">All flashcards</button>` : ''}<button class="btn btn-ghost" type="button" data-act="upload" data-s="${esc(s.id)}">Upload notes</button></div></div>
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
    card.innerHTML = `<div class="qhead">${num != null ? `<span class="qn">Q${num}</span>` : ''}${q.level ? `<span class="lvl lvl-${q.level}">${{ F: 'Foundation', S: 'Standard', C: 'Complex' }[q.level]}</span>` : ''}${q.ext ? '<span class="bonus">Year 9 ext.</span>' : ''}<span>${esc((q.tags || []).join(', '))}${q.deckTitle && mode === 'exam' ? '' : ''}</span><span class="mk">${total} mark${total > 1 ? 's' : ''}</span></div>
      ${q.stem ? `<div class="qstem">${fm(q.stem)}</div>` : ''}${V.render(q.visual)}<div class="parts"></div>`;
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
    const prompt = `You are a friendly, encouraging tutor for a Year 8 student in NSW, Australia. They got an exam question wrong. In under 120 words, explain the most likely mistake in their thinking and how to get the right answer. Use simple language and show the key working. No greeting. Formatting: use **double asterisks** for key words, write all maths in LaTeX between single $ signs (e.g. $\\frac{3}{4}$, $x^2$).

Question: ${q.stem || ''} ${p.q}
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
    const prompt = `You are a fair but strict NSW high-school teacher marking a Year 8 exam short-answer question.

Question (${p.marks} marks): ${q.stem ? q.stem + ' ' : ''}${p.q}
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
      const rules = `You are a friendly, patient tutor for a Year 8 student in NSW, Australia, revising "${d.title}" (${getSubj(d.subject).name}) for an exam. Keep answers short and clear, use Australian spelling, show working for maths, formatting: use **double asterisks** for key words, write all maths in LaTeX between single $ signs (e.g. $\\frac{3}{4}$, $x^2$), and use these notes when relevant:\n\n${deckContext(d)}`;
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
    b.innerHTML = me && S.profile ? avatarHtml(S.profile, 'sm') + `<span class="acct-name">${esc(S.profile.nickname)}</span>` : me ? avatarHtml(null, 'sm') : 'Sign in';
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

  /* ---------------- intro motion ---------------- */
  function intro() { } // no load animation: motion only answers what you do



  $('#mistBtn').onclick = () => openMistakes();
  $('#focusBtn').onclick = openFocus;
  if (focusState()) openFocus(); // a session survives a reload
  $('#acctBtn').onclick = () => (me && !S.profile ? openProfile(true) : openAccount());
  if (S.subj !== 'home' && !subjects().some(s => s.id === S.subj)) S.subj = 'home';
  renderStats(); renderMistakeCount(); renderTabs(); renderNext(); renderBoard(); renderSubject(); renderWeek(); renderUpSubjects(); renderAiNote(); renderAcct(); renderLeague(); intro();
  AI.init();
  Cloud.init(onUser);
})();
