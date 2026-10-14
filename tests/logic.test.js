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

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
