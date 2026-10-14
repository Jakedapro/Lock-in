/* Run: node tests/questions.test.js */
const assert = require('assert');
const G = require('../src/geo.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('map question at Complex has all 10 parts', () => {
  const q = G.mapQuestion('C');
  assert.strictEqual(q.level, 'C');
  assert.strictEqual(q.parts.length, 10);
});
test('map question at Standard (or no level) has the first 6 parts', () => {
  for (const q of [G.mapQuestion('S'), G.mapQuestion()]) {
    assert.strictEqual(q.level, 'S');
    assert.deepStrictEqual(q.parts.map(p => p.label), ['a', 'b', 'c', 'd', 'e', 'f']);
  }
});
test('every geography bank generator returns a level', () => {
  for (const fn of [...G.BANK.maps, ...G.BANK.water]) for (const L of ['F', 'S', 'C']) assert.ok(['F', 'S', 'C'].includes(fn(L).level), fn.name);
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
