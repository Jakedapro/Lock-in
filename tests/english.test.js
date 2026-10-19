/* Run: node tests/english.test.js */
const assert = require('assert');
const EN = require('../src/english.js');
const Logic = require('../src/logic.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const parts = (p) => p.groups.flatMap(g => g.items.flatMap(it => it.parts));

test('every paper is 20 marks over 3 extracts, in the Task 4 shape', () => {
  for (let i = 0; i < 60; i++) {
    const p = EN.buildPaper();
    assert.strictEqual(p.marks, 20);
    assert.strictEqual(p.minutes, 60);
    assert.strictEqual(p.groups.length, 3);
    assert.deepStrictEqual(p.groups.map(g => g.items.map(it => it.kind)), [['mc', 'mc', 'mc', 'emotion'], ['technique', 'creative'], ['petal']]);
    assert.deepStrictEqual(parts(p).map(x => x.marks), [1, 1, 1, 2, 3, 5, 7]);
  }
});
test('short questions have one criterion per mark, a model answer, and ONE-quote wording where needed', () => {
  for (let i = 0; i < 30; i++) for (const g of EN.buildPaper().groups) for (const it of g.items) for (const x of it.parts) {
    if (x.type === 'short') { assert.strictEqual(x.criteria.length, x.marks, it.kind); assert.ok(x.model.length > 40); }
    if (it.kind === 'emotion') assert.ok(/ONE quote/.test(x.q));
    if (it.kind === 'technique') assert.ok(/ONE quote, a technique/.test(x.q));
    if (x.type === 'choice') { assert.strictEqual(x.choices.length, 4); assert.strictEqual(x.choices[x.value], x.show); }
  }
});
test('creative journal question has the marking checklist', () => {
  const j = EN.buildPaper().groups[1].items[1].parts[0];
  assert.ok(/journal entry/.test(j.q));
  assert.strictEqual(j.criteria.length, 5);
});
test('same seed gives the same paper, and papers vary across seeds', () => {
  const sig = (seed) => Logic.withSeed(seed, () => EN.buildPaper().groups.map(g => g.id).join());
  assert.strictEqual(sig('a'), sig('a'));
  assert.ok(new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(sig)).size > 2);
});
test('extract bank has at least 6 sets from different chapters, each with text', () => {
  const all = Object.values(EN.PAPER_SETS).flat();
  assert.ok(all.length >= 6);
  assert.ok(new Set(all.map(s => s.chapter)).size >= 6);
  all.forEach(s => assert.ok(s.text.length > 80 && s.title));
});
test('short-answer deck includes the journal and extract questions', () => {
  const d = EN.DECKS.find(x => x.id === 'afwrite');
  assert.ok(d.short.some(s => s.marks === 5 && /journal/.test(s.q)));
  assert.ok(d.sections.some(s => s.code === 'W8'));
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
