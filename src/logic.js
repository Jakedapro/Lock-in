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

  return { LEVELS, defaults, classify, ladder, nearestLevel, weekStart, serialise, addMistake, fixMistake, missAgain };
})();
if (typeof module !== 'undefined') module.exports = Logic;
