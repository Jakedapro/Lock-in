/* Run: node tests/banks.test.js — every generator, many times: answers must be well-formed and accepted by the checker. */
const assert = require('assert');
const M = require('../src/content.js'), X = require('../src/exam.js'), G = require('../src/geo.js');
const Y8 = () => require('../src/y8more.js'), E2 = () => require('../src/ext2.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const RUNS = 200;

function checkPart(p, where) {
  assert.ok(p.q && typeof p.q === 'string', where + ' has question text');
  assert.ok((p.marks || 1) >= 1, where + ' marks');
  assert.ok(p.show !== undefined && String(p.show).length, where + ' has an answer to show');
  if (p.type === 'choice') {
    assert.ok(Array.isArray(p.choices) && p.choices.length >= 2, where + ' has choices');
    assert.strictEqual(new Set(p.choices).size, p.choices.length, where + ' choices are distinct: ' + p.choices.join(' | '));
    assert.ok(Number.isInteger(p.value) && p.value >= 0 && p.value < p.choices.length, where + ' answer index in range');
    assert.ok(String(p.show).includes(p.choices[p.value]) || p.choices[p.value].includes(String(p.show)), where + ` shown answer matches the right choice (${p.show} vs ${p.choices[p.value]})`);
  } else if (p.type === 'self') {
    // self-marked: nothing to check
  } else if (['num', 'pct'].includes(p.type)) {
    assert.ok(Number.isFinite(p.value), where + ' numeric answer is a number: ' + p.value);
    assert.ok(X.check(p, String(p.value)), where + ' checker accepts the exact answer ' + p.value);
  } else if (p.type === 'ratio' || p.type === 'pm') {
    assert.ok(X.check(p, p.type === 'pm' ? '±' + p.value : p.value.join(':')), where + ' checker accepts the answer');
  } else assert.fail(where + ' unknown part type ' + p.type);
}
function checkQuestion(q, where) {
  assert.ok(['F', 'S', 'C'].includes(q.level), where + ' level ' + q.level);
  assert.ok(Array.isArray(q.parts) && q.parts.length, where + ' has parts');
  q.parts.forEach((p, i) => checkPart(p, `${where} part ${p.label || i}`));
}
function checkDeck(d) {
  assert.ok(d.id && d.title && d.chapter && d.subject, d.id + ' has id/title/chapter/subject');
  assert.ok(d.sections.length >= 3, d.id + ' has sections');
  d.sections.forEach(s => assert.ok(s.code && s.name && s.notes.length && (!s.ex || s.ex.length >= 2), `${d.id} section ${s.code}`));
  assert.ok(d.cards.length >= 8 && d.cards.every(c => c.q && c.a), d.id + ' has 8+ flashcards');
  assert.ok(d.concepts.length >= 6, d.id + ' has 6+ multiple choice');
  d.concepts.forEach((c, i) => {
    assert.ok(c.options.length >= 2 && Number.isInteger(c.answer) && c.answer < c.options.length, `${d.id} concept ${i} answer in range`);
    assert.strictEqual(new Set(c.options).size, c.options.length, `${d.id} concept ${i} options distinct`);
  });
  assert.ok(d.bank && d.bank.length, d.id + ' has an exam question bank');
  const levels = new Set();
  for (const fn of d.bank) for (let i = 0; i < RUNS; i++) for (const L of ['F', 'S', 'C']) { const q = fn(L); checkQuestion(q, `${d.id}/${fn.name}`); levels.add(q.level); }
  assert.ok(levels.size >= 2, d.id + ' bank covers at least 2 levels');
  for (const [k, fn] of Object.entries(d.drills || {})) for (let i = 0; i < RUNS; i++) {
    const r = fn();
    assert.ok(r.tag, `${d.id} drill ${k} tag`);
    checkPart({ ...r, marks: 1 }, `${d.id} drill ${k}`);
  }
  const codes = new Set(d.sections.map(s => s.code));
  for (const fn of d.bank) (fn('S').tags || []).forEach(t => assert.ok(codes.has(t), `${d.id}/${fn.name} tag ${t} matches a section`));
}

test('existing maths banks are well-formed', () => { for (const [k, bank] of Object.entries(X.BANK)) for (const fn of bank) for (let i = 0; i < 50; i++) checkQuestion(fn(), `X.${k}/${fn.name}`); });
test('existing geography banks are well-formed', () => { for (const fn of [...G.BANK.maps, ...G.BANK.water]) for (let i = 0; i < 50; i++) checkQuestion(fn('S'), 'G/' + fn.name); });
test('Year 8 Ch 3 Algebra deck', () => checkDeck(Y8().DECKS.find(d => d.id === 'alg')));
test('Year 8 Ch 7 Investigating Data deck', () => checkDeck(Y8().DECKS.find(d => d.id === 'data')));
test('Year 8 extra decks are maths and not in the exam', () => Y8().DECKS.forEach(d => { assert.strictEqual(d.subject, 'maths'); assert.strictEqual(d.inExam, false); }));
test('Year 12 has the six Extension 2 decks', () => assert.deepStrictEqual(E2().DECKS.map(d => d.id), ['e2proof', 'e2complex', 'e2induction', 'e2integration', 'e2vectors', 'e2mechanics']));
for (const id of ['e2proof', 'e2complex', 'e2induction', 'e2integration', 'e2vectors', 'e2mechanics'])
  test(`Year 12 deck ${id}`, () => { const d = E2().DECKS.find(x => x.id === id); assert.strictEqual(d.subject, 'y12'); checkDeck(d); });

const E1 = () => require('../src/e1.js'), PH = () => require('../src/physics.js');
const E1_IDS = ['e1poly', 'e1trig', 'e1comb', 'e1calc', 'e1vec', 'e1stats', 'e1proof'], PH_IDS = ['phm5', 'phm6', 'phm7', 'phm8'];
test('Extension 1 has its seven decks', () => assert.deepStrictEqual(E1().DECKS.map(d => d.id), E1_IDS));
for (const id of E1_IDS) test(`Extension 1 deck ${id}`, () => { const d = E1().DECKS.find(x => x.id === id); assert.strictEqual(d.subject, 'e1'); checkDeck(d); });
test('Physics has the four HSC modules', () => assert.deepStrictEqual(PH().DECKS.map(d => d.id), PH_IDS));
for (const id of PH_IDS) test(`Physics deck ${id}`, () => {
  const d = PH().DECKS.find(x => x.id === id); assert.strictEqual(d.subject, 'phys'); checkDeck(d);
  assert.ok((d.short || []).length >= 2, id + ' has extended-response questions');
  d.short.forEach(q => assert.ok(q.criteria.length >= 2 && q.model && q.marks >= 2, id + ' short answer has criteria and a model answer'));
});

const EN = () => require('../src/english.js');
const EN_IDS = ['engtech', 'engessay', 'engcommon', 'engmods', 'engunseen'];
test('English has its five decks', () => assert.deepStrictEqual(EN().DECKS.map(d => d.id), EN_IDS));
for (const id of EN_IDS) test(`English deck ${id}`, () => {
  const d = EN().DECKS.find(x => x.id === id); assert.strictEqual(d.subject, 'eng'); checkDeck(d);
  assert.ok((d.short || []).length >= 3, id + ' has 3+ short answers');
  const codes = new Set(d.sections.map(s => s.code));
  d.short.forEach(q => {
    assert.ok(q.criteria.length >= 2 && q.model && q.marks >= 2, id + ' short answer has criteria and a model answer');
    assert.strictEqual(q.criteria.length, q.marks, id + ' short answer has one criterion per mark: ' + q.q);
    (q.tags || []).forEach(t => assert.ok(codes.has(t), `${id} short tag ${t} matches a section`));
  });
});
test('English unseen deck has 10+ short answers on passages', () => {
  const d = EN().DECKS.find(x => x.id === 'engunseen');
  assert.ok(d.short.filter(q => typeof q.passage === 'string' && q.passage.length > 50).length >= 10);
  for (let i = 0; i < 50; i++) for (const L of ['F', 'S', 'C']) assert.ok(d.bank[0](L).passage, 'unseen bank question has a passage');
});
test('English text has no asterisks, dollar signs or digit/digit fractions', () => {
  const bad = (s, where) => { assert.ok(!/[*$]/.test(s), where + ' contains * or $: ' + s); assert.ok(!/\d\/\d/.test(s), where + ' contains a digit fraction: ' + s); };
  const walk = (v, where) => { if (typeof v === 'string') bad(v, where); else if (Array.isArray(v)) v.forEach((x, i) => walk(x, where + '.' + i)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, where + '.' + k); };
  for (const d of EN().DECKS) {
    const { bank, ...rest } = d; walk(rest, d.id);
    for (const fn of bank) for (let i = 0; i < 100; i++) for (const L of ['F', 'S', 'C']) walk(fn(L), `${d.id}/${fn.name}`);
  }
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
