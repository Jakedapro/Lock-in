/* ===== Lock In — rules (no DOM): level ladder, mistakes, sync merge ===== */
const Logic = (() => {
  const LEVELS = ['F', 'S', 'C'];
  const UP_AFTER = 3, DOWN_AFTER = 2;

  function defaults(S) {
    const s = S || {};
    s.lvl ||= {}; s.mistakes ||= []; s.week ||= { start: '', xp: 0 };
    s.groups ||= []; s.cleared ||= {}; s.gone ||= {}; s.sessions ||= []; s.days ||= {}; s.planDone ||= {}; if (s.profile === undefined) s.profile = null;
    s.badges ||= {}; s.flags ||= {}; s.quotes ||= []; s.goneQ ||= {}; s.daily ||= { done: {} }; s.daily.done ||= {}; s.read ||= { ch: 1, done: {} }; s.read.done ||= {}; s.papers ||= {}; s.mixes ||= {};
    return s;
  }

  function classify(got, out) {
    const r = out ? got / out : 0;
    return r >= 0.75 ? 'right' : r < 0.5 ? 'wrong' : 'neutral';
  }

  // Moves within `avail` only, so a deck without Standard questions jumps F <-> C.
  function ladder(st, result, avail = LEVELS) {
    const L = nearestLevel((st && st.L) || 'F', avail);
    let up = (st && st.up) || 0, down = (st && st.down) || 0;
    if (result === 'right') { up++; down = 0; }
    else if (result === 'wrong') { down++; up = 0; }
    const i = avail.indexOf(L);
    if (up >= UP_AFTER && i < avail.length - 1) return { st: { L: avail[i + 1], up: 0, down: 0 }, moved: 'up' };
    if (down >= DOWN_AFTER && i > 0) return { st: { L: avail[i - 1], up: 0, down: 0 }, moved: 'down' };
    return { st: { L, up: Math.min(up, UP_AFTER), down: Math.min(down, DOWN_AFTER) }, moved: null };
  }

  function nearestLevel(want, avail) {
    if (avail.includes(want)) return want;
    const w = LEVELS.indexOf(want);
    return avail.slice().sort((a, b) => (Math.abs(LEVELS.indexOf(a) - w) - Math.abs(LEVELS.indexOf(b) - w)) || (LEVELS.indexOf(a) - LEVELS.indexOf(b)))[0];
  }

  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function weekStart(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return ymd(d);
  }

  /* ---------- mistakes ---------- */
  const MAX_MISTAKES = 200, FIXES_TO_CLEAR = 2;
  const serialise = (q) => JSON.parse(JSON.stringify(q, (k, v) => (k[0] === '_' ? undefined : v)));
  const keyOf = (deckId, q, gen) => deckId + ':' + (gen || (q.parts && q.parts[0] && q.parts[0].q) || q.stem || '');

  function addMistake(list, { deckId, q, gen }, now) {
    const key = keyOf(deckId, q, gen), clean = serialise(q);
    const old = list.find(m => m.key === key);
    if (old) return list.map(m => (m === old ? { ...m, q: clean, at: now, fixes: 0 } : m));
    const id = 'm' + now.toString(36) + Math.random().toString(36).slice(2, 6);
    return [...list, { id, key, deckId, q: clean, gen: gen || null, at: now, fixes: 0 }].slice(-MAX_MISTAKES);
  }
  function fixMistake(list, id) {
    const m = list.find(x => x.id === id);
    if (!m) return { list, removed: false };
    if (m.fixes + 1 >= FIXES_TO_CLEAR) return { list: list.filter(x => x !== m), removed: true };
    return { list: list.map(x => (x === m ? { ...x, fixes: x.fixes + 1 } : x)), removed: false };
  }
  // Removes a cleared mistake and remembers when, so another device's old copy can't bring it back.
  function clearMistake(S, key, now) { S.mistakes = S.mistakes.filter(m => m.key !== key); S.cleared[key] = now; return S; }
  const missAgain = (list, id) => list.map(m => (m.id === id ? { ...m, fixes: 0 } : m));

  /* ---------- focus sessions + activity heatmap ---------- */
  const MAX_SESSIONS = 500;
  const dayOf = (S, d) => (S.days[d] ||= { min: 0, marks: 0 });
  function addSession(S, sess) { S.sessions.push(sess); S.sessions = S.sessions.slice(-MAX_SESSIONS); dayOf(S, sess.date).min += sess.min; return S; }
  function logActivity(S, date, marks) { dayOf(S, date).marks += marks; return S; }
  // Last `weeks` weeks ending on `end`, oldest first. Score = focus minutes + 2 per mark attempted.
  function heat(days, end, weeks = 12) {
    const out = [], n = weeks * 7;
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i), key = ymd(d), v = days[key] || {};
      const score = (v.min || 0) + 2 * (v.marks || 0);
      out.push({ date: key, min: v.min || 0, marks: v.marks || 0, level: score === 0 ? 0 : score < 20 ? 1 : score < 45 ? 2 : score < 90 ? 3 : 4 });
    }
    return out;
  }

  /* ---------- study planner ---------- */
  const DAY = 864e5, midnight = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  // Day-by-day plan from today to the last exam. Each day works on the nearest exam (weakest topics first),
  // keeps one slot for the next exam, and puts a practice paper on the day before each exam.
  function buildPlan({ today, exams, topics, perDay = 3 }) {
    const t0 = midnight(today), up = exams.filter(e => midnight(e.date) >= t0).sort((a, b) => a.date - b.date);
    if (!up.length) return [];
    const queues = {}, pos = {};
    for (const e of up) { queues[e.sid] = topics.filter(t => t.sid === e.sid).map((t, i) => ({ t, i, acc: t.acc == null ? 0.5 : t.acc })).sort((a, b) => a.acc - b.acc || a.i - b.i).map(x => x.t); pos[e.sid] = 0; }
    const plan = [], last = midnight(up[up.length - 1].date);
    for (let d = t0; d <= last; d += DAY) {
      const date = ymd(new Date(d)), tasks = [], used = new Set();
      const add = (kind, sid, extra = {}) => tasks.push({ id: `${date}:${kind}:${sid}${extra.code ? ':' + extra.code : ''}`, kind, sid, ...extra });
      const topic = (sid) => { const q = queues[sid]; for (let k = 0; k < q.length; k++) { const t = q[pos[sid]++ % q.length]; if (!used.has(sid + t.code)) { used.add(sid + t.code); add('topic', sid, { deckId: t.deckId, code: t.code, name: t.name }); return true; } } return false; };
      const todayExams = up.filter(e => midnight(e.date) === d), later = up.filter(e => midnight(e.date) > d);
      todayExams.forEach(e => add('exam', e.sid, { name: e.name }));
      if (later.length) {
        const [first, second] = later, gap = Math.round((midnight(first.date) - d) / DAY);
        let slots = todayExams.length ? 1 : perDay;
        if (gap === 1) { add('mock', first.sid); add('mistakes', first.sid); slots -= 2; }
        const forSecond = second && slots >= 2 ? 1 : 0;
        for (let k = 0; k < slots - forSecond; k++) topic(first.sid);
        if (forSecond) topic(second.sid);
      }
      plan.push({ date, tasks });
    }
    return plan;
  }

  /* ---------- sync ---------- */
  const storageKey = (uid) => (uid ? 'lockin.v2:' + uid : 'lockin.v2');
  const unionBy = (a, b, key, pickNewer) => {
    const out = new Map();
    for (const x of [...(a || []), ...(b || [])]) { const k = x[key], old = out.get(k); out.set(k, old && pickNewer ? pickNewer(old, x) : old || x); }
    return [...out.values()];
  };
  // Combines two saved states (local + cloud) without losing progress from either.
  function mergeState(a, b) {
    a = defaults(JSON.parse(JSON.stringify(a || {}))); b = defaults(JSON.parse(JSON.stringify(b || {})));
    const m = { ...a, ...b };
    m.xp = Math.max(a.xp || 0, b.xp || 0);
    m.streak = ((a.streak && a.streak.last) || '') > ((b.streak && b.streak.last) || '') ? a.streak : (b.streak || a.streak);
    m.p = { ...a.p };
    for (const [id, pb] of Object.entries(b.p || {})) {
      const pa = m.p[id];
      const win = !pa || (pb.att || 0) > (pa.att || 0) ? pb : pa;
      m.p[id] = { ...win, known: { ...(pa && pa.known), ...pb.known } };
    }
    m.lvl = { ...a.lvl };
    for (const [id, lb] of Object.entries(b.lvl)) { const la = m.lvl[id]; if (!la || LEVELS.indexOf(lb.L) >= LEVELS.indexOf(la.L)) m.lvl[id] = lb; }
    const latest = (x, y) => { const o = { ...x }; for (const [k, t] of Object.entries(y)) o[k] = Math.max(o[k] || 0, t); return o; };
    m.cleared = latest(a.cleared, b.cleared); m.gone = latest(a.gone, b.gone);
    m.custom = unionBy(a.custom, b.custom, 'id').filter(d => !m.gone[d.id]);
    m.mistakes = unionBy(a.mistakes, b.mistakes, 'key', (x, y) => (y.at > x.at ? y : x)).filter(x => !(m.cleared[x.key] >= x.at));
    m.week = a.week.start > b.week.start ? a.week : b.week.start > a.week.start ? b.week : { start: b.week.start, xp: Math.max(a.week.xp, b.week.xp) };
    m.profile = b.profile || a.profile;
    m.groups = b.groups.length ? b.groups : a.groups;
    m.extra = { ...a.extra, ...b.extra };
    m.sessions = unionBy(a.sessions, b.sessions, 'id').slice(-MAX_SESSIONS);
    m.days = { ...a.days };
    for (const [d, v] of Object.entries(b.days)) { const o = m.days[d] || {}; m.days[d] = { min: Math.max(o.min || 0, v.min || 0), marks: Math.max(o.marks || 0, v.marks || 0) }; }
    m.planDone = { ...a.planDone, ...b.planDone };
    m.planSubs = b.planSubs || a.planSubs || null;
    m.badges = { ...b.badges }; for (const [k, t] of Object.entries(a.badges)) m.badges[k] = Math.min(t, m.badges[k] || t); // earliest time wins
    m.flags = { ...a.flags, ...b.flags };
    m.goneQ = latest(a.goneQ, b.goneQ);
    m.quotes = unionBy(a.quotes, b.quotes, 'id', (x, y) => ((y.seen || 0) > (x.seen || 0) ? y : x)).filter(q => !m.goneQ[q.id]);
    m.daily = { ...a.daily, ...b.daily, done: { ...a.daily.done, ...b.daily.done } };
    m.read = { ...a.read, ...b.read, done: { ...a.read.done, ...b.read.done } };
    m.papers = { ...a.papers }; for (const [k, r] of Object.entries(b.papers)) if (!m.papers[k] || (r.at || 0) >= (m.papers[k].at || 0)) m.papers[k] = r; // newest marking wins
    m.mixes = { ...a.mixes }; for (const [k, x] of Object.entries(b.mixes)) { const o = m.mixes[k]; if (!o || ((x.result && x.result.at) || x.at) >= ((o.result && o.result.at) || o.at)) m.mixes[k] = x; }
    if (a.eng || b.eng) {
      const ea = a.eng || {}, eb = b.eng || {};
      m.eng = { ...ea, ...eb, best: Math.max(ea.best || 0, eb.best || 0), history: unionBy(ea.history, eb.history, 'id').sort((x, y) => x.at - y.at).slice(-25) };
    }
    return m;
  }
  const MAX_DOC_CHARS = 900000;
  function cloudPayload(S) {
    const state = JSON.parse(JSON.stringify(S));
    if (JSON.stringify(state).length <= MAX_DOC_CHARS) return { state, droppedCustom: false };
    state.custom = [];
    // Still too big: keep writing scores but not the old drafts' text.
    if (JSON.stringify(state).length > MAX_DOC_CHARS && state.eng) { state.eng.history = (state.eng.history || []).map(h => ({ ...h, text: '' })); if (state.eng.draft) state.eng.draft.text = String(state.eng.draft.text || '').slice(0, 20000); }
    return { state, droppedCustom: true };
  }
  // Same seed -> same random numbers (mulberry32), so everyone gets the same daily challenge.
  function seeded(seed) {
    let t = typeof seed === 'number' ? seed >>> 0 : [...String(seed)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
    return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  }
  // Runs fn with Math.random swapped for a seeded generator (question generators use Math.random).
  function withSeed(seed, fn) { const old = Math.random; Math.random = seeded(seed); try { return fn(); } finally { Math.random = old; } }
  const validNickname = (s) => /^[A-Za-z0-9 ]{2,16}$/.test(s || '') && /\S/.test(s);
  const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const newGroupCode = (rand = Math.random) => Array.from({ length: 6 }, () => CODE_ABC[Math.floor(rand() * CODE_ABC.length) % CODE_ABC.length]).join('');

  return { LEVELS, defaults, classify, ladder, nearestLevel, weekStart, serialise, addMistake, fixMistake, clearMistake, missAgain, addSession, logActivity, heat, buildPlan, storageKey, mergeState, cloudPayload, validNickname, newGroupCode, seeded, withSeed };
})();
if (typeof module !== 'undefined') module.exports = Logic;
