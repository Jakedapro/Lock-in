/* Run: node tests/badges.test.js */
const assert = require('assert');
const Badges = require('../src/badges.js');
const Logic = require('../src/logic.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const ids = (S, ctx) => Badges.fresh(Logic.defaults(S), ctx).map(b => b.id);

test('badge ids are unique and every badge has an icon, name and how-to', () => {
  assert.strictEqual(new Set(Badges.LIST.map(b => b.id)).size, Badges.LIST.length);
  Badges.LIST.forEach(b => assert.ok(b.icon && b.name && b.how, b.id));
});
test('a brand-new user has no badges', () => assert.deepStrictEqual(ids({ p: {}, xp: 0, streak: { n: 0 } }), []));
test('marks, streak and XP badges unlock at their thresholds', () => {
  const got = ids({ p: { a: { att: 120, cor: 80 } }, xp: 1200, streak: { n: 7 } });
  ['first', 'm100', 's3', 's7', 'x1k'].forEach(id => assert.ok(got.includes(id), id));
  ['m500', 's14', 'x5k'].forEach(id => assert.ok(!got.includes(id), id));
});
test('already-earned badges are not fresh again', () => {
  assert.ok(!ids({ p: { a: { att: 5 } }, badges: { first: 1 } }).includes('first'));
});
test('all-rounder needs every subject practised', () => {
  const ctx = { decks: { d1: 'maths', d2: 'phys' }, subjects: 2 };
  assert.ok(!ids({ p: { d1: { att: 3 } } }, ctx).includes('all'));
  assert.ok(ids({ p: { d1: { att: 3 }, d2: { att: 1 } } }, ctx).includes('all'));
});
test('a badge test that throws is ignored, not fatal', () => {
  assert.doesNotThrow(() => Badges.fresh({}, null));
});
test('ranks climb with XP', () => {
  assert.strictEqual(Badges.rank(0).name, 'Rookie');
  assert.strictEqual(Badges.rank(800).name, 'Locked in');
  assert.ok(Math.abs(Badges.rank(500).pct - 0.5) < 1e-9);
  const top = Badges.rank(1e6); assert.strictEqual(top.next, null); assert.strictEqual(top.pct, 1);
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
