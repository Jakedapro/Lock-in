/* ===== Lock In — rules (no DOM): level ladder, mistakes, sync merge ===== */
const Logic = (() => {
  const LEVELS = ['F', 'S', 'C'];
  const UP_AFTER = 3, DOWN_AFTER = 2;

  function defaults(S) {
    const s = S || {};
    s.lvl ||= {}; s.mistakes ||= []; s.week ||= { start: '', xp: 0 };
    s.groups ||= []; if (s.profile === undefined) s.profile = null;
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
  const missAgain = (list, id) => list.map(m => (m.id === id ? { ...m, fixes: 0 } : m));

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
    m.custom = unionBy(a.custom, b.custom, 'id');
    m.mistakes = unionBy(a.mistakes, b.mistakes, 'key', (x, y) => (y.at > x.at ? y : x));
    m.week = a.week.start > b.week.start ? a.week : b.week.start > a.week.start ? b.week : { start: b.week.start, xp: Math.max(a.week.xp, b.week.xp) };
    m.profile = b.profile || a.profile;
    m.groups = b.groups.length ? b.groups : a.groups;
    m.extra = { ...a.extra, ...b.extra };
    return m;
  }
  const MAX_DOC_CHARS = 900000;
  function cloudPayload(S) {
    const state = JSON.parse(JSON.stringify(S));
    if (JSON.stringify(state).length <= MAX_DOC_CHARS) return { state, droppedCustom: false };
    state.custom = [];
    return { state, droppedCustom: true };
  }
  const validNickname = (s) => /^[A-Za-z0-9 ]{2,16}$/.test(s || '') && /\S/.test(s);
  const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const newGroupCode = (rand = Math.random) => Array.from({ length: 6 }, () => CODE_ABC[Math.floor(rand() * CODE_ABC.length) % CODE_ABC.length]).join('');

  return { LEVELS, defaults, classify, ladder, nearestLevel, weekStart, serialise, addMistake, fixMistake, missAgain, storageKey, mergeState, cloudPayload, validNickname, newGroupCode };
})();
if (typeof module !== 'undefined') module.exports = Logic;
