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

  return { LEVELS, defaults, classify, ladder, nearestLevel, weekStart };
})();
if (typeof module !== 'undefined') module.exports = Logic;
