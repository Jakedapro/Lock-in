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

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
