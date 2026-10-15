/* Run: node tests/papers.test.js */
const assert = require('assert');
const PAPERS = require('../src/papers.js');
const Logic = require('../src/logic.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('every subject has its papers, newest first, each with the paper and marking guidelines from NESA', () => {
  for (const [sid, min] of [['y12', 6], ['e1', 6], ['phys', 7]]) {
    const L = PAPERS.LIST[sid]; assert.ok(L.length >= min, sid + ' papers');
    L.forEach((p, i) => {
      assert.ok(p.paper && p.mg, `${sid} ${p.year} has paper and marking guidelines`);
      [p.paper, p.mg, p.feedback].filter(Boolean).forEach(u => assert.match(u, /^https:\/\/www\.nsw\.gov\.au\/sites\/default\/files\/.+\.pdf$/));
      if (i) assert.ok(L[i - 1].year > p.year, 'newest first');
    });
  }
});
test('paper totals match the HSC: Ext 2 100, Ext 1 70, Physics 100', () => {
  assert.strictEqual(PAPERS.outOf('y12'), 100); assert.strictEqual(PAPERS.outOf('e1'), 70); assert.strictEqual(PAPERS.outOf('phys'), 100);
});
test('past paper results sync: the newest marking of each paper wins', () => {
  const m = Logic.mergeState({ papers: { 'y12-2024': { at: 1, total: 50 }, 'e1-2023': { at: 5, total: 40 } } }, { papers: { 'y12-2024': { at: 2, total: 74 }, 'e1-2023': { at: 3, total: 30 } } });
  assert.strictEqual(m.papers['y12-2024'].total, 74); assert.strictEqual(m.papers['e1-2023'].total, 40);
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
