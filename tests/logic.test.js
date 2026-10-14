/* Run: node tests/logic.test.js */
const assert = require('assert');
const Logic = require('../src/logic.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/* ---------- levels ---------- */
test('classify: >= 75% right, < 50% wrong, between neutral', () => {
  assert.strictEqual(Logic.classify(3, 4), 'right');
  assert.strictEqual(Logic.classify(1, 4), 'wrong');
  assert.strictEqual(Logic.classify(2, 4), 'neutral');
});

const run = (st, results, avail) => { let moved = null; for (const r of results) ({ st, moved } = Logic.ladder(st, r, avail)); return { st, moved }; };

test('ladder: three rights from nothing moves F -> S and resets runs', () => {
  assert.deepStrictEqual(run(undefined, ['right', 'right', 'right']), { st: { L: 'S', up: 0, down: 0 }, moved: 'up' });
});
test('ladder: three rights at C stays C', () => {
  assert.deepStrictEqual(run({ L: 'C', up: 0, down: 0 }, ['right', 'right', 'right']).st.L, 'C');
  assert.strictEqual(run({ L: 'C', up: 0, down: 0 }, ['right', 'right', 'right']).moved, null);
});
test('ladder: two wrongs at S drops to F', () => {
  assert.deepStrictEqual(run({ L: 'S', up: 0, down: 0 }, ['wrong', 'wrong']), { st: { L: 'F', up: 0, down: 0 }, moved: 'down' });
});
test('ladder: neutral between wrongs does not reset the down run', () => {
  assert.strictEqual(run({ L: 'S', up: 0, down: 0 }, ['wrong', 'neutral', 'wrong']).st.L, 'F');
});
test('ladder: a right resets the down run', () => {
  assert.strictEqual(run({ L: 'S', up: 0, down: 0 }, ['wrong', 'right', 'wrong']).st.L, 'S');
});
test('ladder: avail [F, C] jumps F -> C', () => {
  assert.strictEqual(run(undefined, ['right', 'right', 'right'], ['F', 'C']).st.L, 'C');
});
test('nearestLevel: exact, else nearest, ties go lower', () => {
  assert.strictEqual(Logic.nearestLevel('S', ['F', 'S', 'C']), 'S');
  assert.strictEqual(Logic.nearestLevel('S', ['F', 'C']), 'F');
  assert.strictEqual(Logic.nearestLevel('C', ['F', 'S']), 'S');
  assert.strictEqual(Logic.nearestLevel('F', ['C']), 'C');
});
test('defaults fills new fields and keeps old ones', () => {
  const s = Logic.defaults({ xp: 5 });
  assert.strictEqual(s.xp, 5);
  assert.deepStrictEqual(s.mistakes, []);
  assert.deepStrictEqual(s.lvl, {});
  assert.deepStrictEqual(s.week, { start: '', xp: 0 });
  assert.deepStrictEqual(s.groups, []);
  assert.strictEqual(s.profile, null);
});
test('weekStart gives the Monday of the week', () => {
  assert.strictEqual(Logic.weekStart(new Date(2026, 9, 14)), '2026-10-12');
  assert.strictEqual(Logic.weekStart(new Date(2026, 9, 18)), '2026-10-12');
  assert.strictEqual(Logic.weekStart(new Date(2026, 9, 19)), '2026-10-19');
});

/* ---------- mistakes ---------- */
const mkQ = (stem = 'Q', extra = {}) => ({ stem, level: 'S', parts: [{ label: 'a', q: stem + ' part', marks: 1, _got: 0, _done: true, _finish() { } }], visual: { type: 'topo', map: { contours: [{ h: 60 }] } }, ...extra });

test('serialise drops runtime _fields and keeps diagrams', () => {
  const s = Logic.serialise(mkQ('Q', { _counted: true }));
  assert.strictEqual(s._counted, undefined);
  assert.deepStrictEqual(Object.keys(s.parts[0]).sort(), ['label', 'marks', 'q']);
  assert.deepStrictEqual(s.visual.map.contours, [{ h: 60 }]);
});
test('addMistake dedupes the same deck + generator and resets fixes', () => {
  let l = Logic.addMistake([], { deckId: 'prob', q: mkQ('one'), gen: 'venn' }, 1);
  l[0].fixes = 1;
  l = Logic.addMistake(l, { deckId: 'prob', q: mkQ('two'), gen: 'venn' }, 2);
  assert.strictEqual(l.length, 1);
  assert.strictEqual(l[0].fixes, 0);
  assert.strictEqual(l[0].q.stem, 'two');
  assert.strictEqual(l[0].at, 2);
});
test('addMistake without a generator keys on the first part text', () => {
  let l = Logic.addMistake([], { deckId: 'water', q: mkQ('a'), gen: null }, 1);
  l = Logic.addMistake(l, { deckId: 'water', q: mkQ('b'), gen: null }, 2);
  l = Logic.addMistake(l, { deckId: 'water', q: mkQ('a'), gen: null }, 3);
  assert.strictEqual(l.length, 2);
});
test('addMistake caps at 200, dropping the oldest', () => {
  let l = [];
  for (let i = 0; i < 201; i++) l = Logic.addMistake(l, { deckId: 'd', q: mkQ('q' + i), gen: null }, i);
  assert.strictEqual(l.length, 200);
  assert.ok(!l.some(m => m.q.stem === 'q0'));
  assert.ok(l.some(m => m.q.stem === 'q200'));
});
test('fixMistake twice removes it', () => {
  let l = Logic.addMistake([], { deckId: 'd', q: mkQ(), gen: 'g' }, 1); const id = l[0].id;
  let r = Logic.fixMistake(l, id); assert.strictEqual(r.removed, false); assert.strictEqual(r.list[0].fixes, 1);
  r = Logic.fixMistake(r.list, id); assert.strictEqual(r.removed, true); assert.strictEqual(r.list.length, 0);
});
test('fix, missAgain, fix keeps it in the list', () => {
  let l = Logic.addMistake([], { deckId: 'd', q: mkQ(), gen: 'g' }, 1); const id = l[0].id;
  l = Logic.fixMistake(l, id).list; l = Logic.missAgain(l, id);
  const r = Logic.fixMistake(l, id);
  assert.strictEqual(r.removed, false); assert.strictEqual(r.list[0].fixes, 1);
});

/* ---------- sync ---------- */
test('storageKey: guest vs signed-in user', () => {
  assert.strictEqual(Logic.storageKey(null), 'lockin.v2');
  assert.strictEqual(Logic.storageKey('abc'), 'lockin.v2:abc');
});
const base = (o) => Logic.defaults({ p: {}, xp: 0, streak: { last: '', n: 0 }, custom: [], extra: {}, subj: 'geo', ...o });
test('mergeState: xp max, streak from the later day', () => {
  const m = Logic.mergeState(base({ xp: 50, streak: { last: '2026-10-13', n: 4 } }), base({ xp: 80, streak: { last: '2026-10-14', n: 1 } }));
  assert.strictEqual(m.xp, 80);
  assert.deepStrictEqual(m.streak, { last: '2026-10-14', n: 1 });
});
test('mergeState: deck progress from more attempts, known cards unioned', () => {
  const a = base({ p: { maps: { att: 10, cor: 8, tags: {}, known: { 1: 1 } } } });
  const b = base({ p: { maps: { att: 4, cor: 1, tags: {}, known: { 2: 1 } }, eq: { att: 1, cor: 1, tags: {}, known: {} } } });
  const m = Logic.mergeState(a, b);
  assert.strictEqual(m.p.maps.att, 10);
  assert.deepStrictEqual(m.p.maps.known, { 1: 1, 2: 1 });
  assert.strictEqual(m.p.eq.att, 1);
});
test('mergeState: higher level wins', () => {
  const m = Logic.mergeState(base({ lvl: { maps: { L: 'C', up: 0, down: 0 }, eq: { L: 'F', up: 2, down: 0 } } }), base({ lvl: { maps: { L: 'S', up: 1, down: 0 }, eq: { L: 'S', up: 0, down: 0 } } }));
  assert.strictEqual(m.lvl.maps.L, 'C');
  assert.strictEqual(m.lvl.eq.L, 'S');
});
test('mergeState: custom decks union by id, mistakes union by key keeping newer', () => {
  const a = base({ custom: [{ id: 'u1' }], mistakes: [{ id: 'm1', key: 'k', at: 5, fixes: 1 }, { id: 'm2', key: 'j', at: 1, fixes: 0 }] });
  const b = base({ custom: [{ id: 'u1' }, { id: 'u2' }], mistakes: [{ id: 'm9', key: 'k', at: 9, fixes: 0 }] });
  const m = Logic.mergeState(a, b);
  assert.deepStrictEqual(m.custom.map(d => d.id).sort(), ['u1', 'u2']);
  assert.strictEqual(m.mistakes.length, 2);
  assert.strictEqual(m.mistakes.find(x => x.key === 'k').at, 9);
});
test('mergeState: week from the later start, xp max on the same week', () => {
  assert.deepStrictEqual(Logic.mergeState(base({ week: { start: '2026-10-05', xp: 90 } }), base({ week: { start: '2026-10-12', xp: 10 } })).week, { start: '2026-10-12', xp: 10 });
  assert.deepStrictEqual(Logic.mergeState(base({ week: { start: '2026-10-12', xp: 30 } }), base({ week: { start: '2026-10-12', xp: 10 } })).week, { start: '2026-10-12', xp: 30 });
});
test('mergeState: profile and groups come from b when set', () => {
  const m = Logic.mergeState(base({ profile: { nickname: 'A' }, groups: ['AAAAAA'] }), base({ profile: { nickname: 'B' }, groups: [] }));
  assert.strictEqual(m.profile.nickname, 'B');
  assert.deepStrictEqual(m.groups, ['AAAAAA']);
});
test('mergeState into an empty cloud state keeps local progress', () => {
  const m = Logic.mergeState(base({ xp: 40, p: { maps: { att: 3, cor: 2, tags: {}, known: {} } } }), null);
  assert.strictEqual(m.xp, 40);
  assert.strictEqual(m.p.maps.att, 3);
});
test('cloudPayload drops custom decks when too big', () => {
  const small = Logic.cloudPayload(base({ custom: [{ id: 'u1', title: 'x' }] }));
  assert.strictEqual(small.droppedCustom, false);
  assert.strictEqual(small.state.custom.length, 1);
  const big = Logic.cloudPayload(base({ xp: 7, custom: [{ id: 'u1', notes: 'x'.repeat(1000000) }] }));
  assert.strictEqual(big.droppedCustom, true);
  assert.deepStrictEqual(big.state.custom, []);
  assert.strictEqual(big.state.xp, 7);
});
test('validNickname: 2-16 letters, numbers, spaces', () => {
  assert.ok(Logic.validNickname('Jai 99'));
  assert.ok(!Logic.validNickname('J'));
  assert.ok(!Logic.validNickname('x'.repeat(17)));
  assert.ok(!Logic.validNickname('bad<name>'));
  assert.ok(!Logic.validNickname('   '));
});
test('newGroupCode: 6 chars from the safe alphabet', () => {
  let i = 0; const seq = [0, 0.999, 0.5, 0.25, 0.75, 0.1];
  const code = Logic.newGroupCode(() => seq[i++]);
  assert.strictEqual(code.length, 6);
  assert.ok(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code));
  assert.ok(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(Logic.newGroupCode()));
});

/* ---------- review fixes ---------- */
test('mergeState: a mistake cleared on one device stays cleared', () => {
  const phone = base({ mistakes: [{ id: 'm1', key: 'k', at: 5, fixes: 1 }] });
  const laptop = base({ mistakes: [], cleared: { k: 9 } });
  const m = Logic.mergeState(phone, laptop);
  assert.strictEqual(m.mistakes.length, 0);
  assert.deepStrictEqual(m.cleared, { k: 9 });
});
test('mergeState: a mistake missed again after it was cleared comes back', () => {
  const m = Logic.mergeState(base({ mistakes: [{ id: 'm2', key: 'k', at: 20, fixes: 0 }] }), base({ cleared: { k: 9 } }));
  assert.strictEqual(m.mistakes.length, 1);
});
test('mergeState: a deleted custom deck stays deleted', () => {
  const m = Logic.mergeState(base({ custom: [{ id: 'u1' }, { id: 'u2' }] }), base({ custom: [{ id: 'u2' }], gone: { u1: 3 } }));
  assert.deepStrictEqual(m.custom.map(d => d.id), ['u2']);
  assert.deepStrictEqual(m.gone, { u1: 3 });
});
test('clearMistake records a tombstone and removes it', () => {
  const s = base({ mistakes: [{ id: 'm1', key: 'k', at: 1, fixes: 1 }] });
  Logic.clearMistake(s, 'k', 50);
  assert.strictEqual(s.mistakes.length, 0);
  assert.deepStrictEqual(s.cleared, { k: 50 });
});
test('defaults adds cleared and gone maps', () => {
  const s = Logic.defaults({});
  assert.deepStrictEqual(s.cleared, {});
  assert.deepStrictEqual(s.gone, {});
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
