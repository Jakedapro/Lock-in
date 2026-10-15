/* Run: node tests/mix.test.js */
const assert = require('assert');
const Mix = require('../src/mix.js');
const Logic = require('../src/logic.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const rnd = () => Logic.seeded('mix');

// A made-up map shaped like the real one: maths has MC 1-10 and Q11-16 (15 marks each).
const parts = (codes) => [{ label: 'a', marks: 5, page: 5, topics: [codes[0]] }, { label: 'b(i)', marks: 4, page: 6, topics: [codes[1]] }, { label: 'b(ii)', marks: 6, page: 6, topics: [codes[2]] }];
const mathsYear = (y) => ({ mc: Array.from({ length: 10 }, (_, i) => ({ n: i + 1, page: 2, topics: [i % 2 ? '2.3' : '4.5'] })), q: [11, 12, 13, 14, 15, 16].map(n => ({ n, page: 5, marks: 15, parts: parts(['2.3', '4.5', n % 2 ? '5.3' : '6.2']) })) });
const MATHS = { 2021: mathsYear(2021), 2022: mathsYear(2022), 2023: mathsYear(2023) };
const physYear = () => ({ mc: Array.from({ length: 20 }, (_, i) => ({ n: i + 1, page: 2, topics: ['5.1'] })), q: Array.from({ length: 16 }, (_, i) => ({ n: 21 + i, page: 10 + i, marks: 5, parts: [{ label: '', marks: 5, topics: [`${5 + (i % 4)}.1`] }] })) });
const PHYS = { 2020: physYear(), 2021: physYear() };

test('random maths paper keeps the real layout: MC 1-10 then Q11-16, 100 marks', () => {
  const p = Mix.randomPaper('y12', MATHS, rnd());
  assert.deepStrictEqual(p.map(i => i.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  assert.strictEqual(Mix.total(p), 100);
  const qYears = p.filter(i => i.kind === 'q').map(i => i.year), count = {}; qYears.forEach(y => count[y] = (count[y] || 0) + 1);
  assert.ok(Object.values(count).every(n => n <= 2), 'no year used for more than two long questions');
  assert.ok(new Set(p.map(i => i.year)).size > 1, 'mixes years');
});
test('random physics paper: 20 MC and Section II worth 80, spread over modules', () => {
  const p = Mix.randomPaper('phys', PHYS, rnd()), sec2 = p.filter(i => i.kind === 'q');
  assert.strictEqual(p.filter(i => i.kind === 'mc').length, 20);
  assert.strictEqual(Mix.total(sec2), 80);
  const mods = new Set(sec2.map(i => i.topics[0][0])); assert.strictEqual(mods.size, 4);
});
test('by topic: only matching items, about the asked marks, MC capped at a fifth', () => {
  const p = Mix.byTopic('y12', MATHS, ['4.5'], 30, rnd());
  assert.ok(p.length && p.every(i => i.topics.includes('4.5')));
  assert.ok(Mix.total(p) >= 28 && Mix.total(p) <= 32, 'marks ' + Mix.total(p));
  assert.ok(p.filter(i => i.kind === 'mc').length <= 6);
  assert.strictEqual(p.findIndex(i => i.kind !== 'mc'), p.filter(i => i.kind === 'mc').length, 'MC first');
});
test('by topic with nothing matching gives an empty paper', () => assert.deepStrictEqual(Mix.byTopic('y12', MATHS, ['9.9'], 30, rnd()), []));
test('same seed, same paper', () => assert.deepStrictEqual(Mix.randomPaper('y12', MATHS, Logic.seeded(1)), Mix.randomPaper('y12', MATHS, Logic.seeded(1))));
test('names and timing', () => {
  assert.strictEqual(Mix.name({ year: 2023, kind: 'part', n: 13, label: 'b(ii)' }), '2023 Q13(b)(ii)');
  assert.strictEqual(Mix.name({ year: 2022, kind: 'mc', n: 4 }), '2022 Q4');
  assert.strictEqual(Mix.minutes([{ marks: 30 }], 1.8), 55);
  const c = Mix.topicCounts(MATHS); assert.ok(c['2.3'] > 0 && c['4.5'] > 0);
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
