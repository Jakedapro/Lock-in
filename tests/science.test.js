/* Run: node tests/science.test.js — Year 8 Science decks, question banks and the practice exam. */
const assert = require('assert');
const fs = require('fs'), path = require('path');
const SC = require('../src/science.js'), X = require('../src/exam.js'), V = (() => { const s = fs.readFileSync(path.join(__dirname, '../src/viz.js'), 'utf8'); return new Function(s + ';return V;')(); })();

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const IDS = ['scienergy', 'scichem', 'scigeo', 'scirocks', 'scidata'];
const RUNS = 150;

function checkPart(p, where, allowShort) {
  assert.ok(p.q && typeof p.q === 'string', where + ' has question text');
  if (p.type === 'choice') {
    assert.ok(p.choices.length >= 2, where + ' has 2+ choices');
    assert.strictEqual(new Set(p.choices).size, p.choices.length, where + ' choices distinct: ' + p.choices.join(' | '));
    assert.ok(Number.isInteger(p.value) && p.value >= 0 && p.value < p.choices.length, where + ' answer index in range');
    assert.strictEqual(p.choices[p.value], String(p.show), where + ' correct answer is among the choices');
  } else if (p.type === 'num') {
    assert.ok(Number.isFinite(p.value), where + ' numeric answer');
    assert.ok(X.check(p, String(p.value)), where + ' checker accepts ' + p.value);
  } else if (p.type === 'short') {
    assert.ok(allowShort, where + ' short parts only in the exam data task');
    checkShort(p, where);
  } else assert.fail(where + ' unexpected part type ' + p.type);
}
function checkShort(s, where) {
  assert.ok(s.marks >= 2 && s.marks <= 6, where + ' marks 2 to 6: ' + s.marks);
  assert.strictEqual(s.criteria.length, s.marks, where + ' has one criterion per mark (criteria sum to the marks): ' + s.q);
  assert.ok(s.model && s.model.length > 60, where + ' has a model answer');
}
const noFormatterChars = (v, where) => {
  if (typeof v === 'string') assert.ok(!/[*$^]/.test(v), where + ' contains * $ or ^: ' + v);
  else if (Array.isArray(v)) v.forEach((x, i) => noFormatterChars(x, where + '.' + i));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (typeof x !== 'function') noFormatterChars(x, where + '.' + k);
};

test('Science has its five decks, all subject sci', () => {
  assert.deepStrictEqual(SC.DECKS.map(d => d.id), IDS);
  SC.DECKS.forEach(d => assert.strictEqual(d.subject, 'sci'));
});
for (const id of IDS) test(`deck ${id}: notes, cards, multiple choice, short answers`, () => {
  const d = SC.DECKS.find(x => x.id === id), codes = new Set(d.sections.map(s => s.code));
  assert.ok(d.title && d.chapter && d.hue && d.blurb);
  assert.ok(d.sections.length >= 4 && d.sections.every(s => s.code && s.name && s.notes.length >= 2), id + ' sections');
  assert.ok(d.cards.length >= 15 && d.cards.every(c => c.q && c.a), id + ' 15+ flashcards');
  assert.ok(d.concepts.length >= 10, id + ' 10+ multiple choice');
  d.concepts.forEach((c, i) => {
    assert.ok(Number.isInteger(c.answer) && c.answer >= 0 && c.answer < c.options.length, `${id} concept ${i} correct answer is among the options`);
    assert.strictEqual(new Set(c.options).size, c.options.length, `${id} concept ${i} options distinct`);
  });
  assert.ok(d.short.length >= 5, id + ' 5+ short answers');
  d.short.forEach(s => { checkShort(s, id); (s.tags || []).forEach(t => assert.ok(codes.has(t), `${id} short tag ${t} matches a section`)); });
});
for (const id of IDS) test(`deck ${id}: question bank at every level`, () => {
  const d = SC.DECKS.find(x => x.id === id), codes = new Set(d.sections.map(s => s.code)), levels = new Set();
  assert.ok(d.bank.length >= 4, id + ' 4+ generators');
  assert.strictEqual(new Set(d.bank.map(f => f.name)).size, d.bank.length, id + ' generator names unique (used to regenerate mistakes)');
  for (const fn of d.bank) for (let i = 0; i < RUNS; i++) for (const L of ['F', 'S', 'C']) {
    const q = fn(L), where = `${id}/${fn.name}/${L}`;
    assert.ok(['F', 'S', 'C'].includes(q.level), where + ' level');
    assert.ok(q.parts.length >= 1, where + ' parts');
    (q.tags || []).forEach(t => assert.ok(codes.has(t), `${where} tag ${t} matches a section`));
    q.parts.forEach((p, k) => checkPart(p, `${where} part ${p.label || k}`, false));
    if (q.visual) assert.ok(V.render(q.visual).length > 50, where + ' visual renders');
  }
  for (const fn of d.bank) for (const L of ['F', 'S', 'C']) levels.add(fn(L).level);
  assert.ok(levels.size === 3, id + ' bank covers F, S and C');
});
test('banks include data questions (tables/graphs), efficiency and graph choice', () => {
  const all = SC.DECKS.flatMap(d => d.bank.map(f => f.name));
  ['efficiencyQ', 'resultsQ', 'trendQ', 'graphChoiceQ', 'variablesQ', 'massQ', 'strataQ', 'spreadQ'].forEach(n => assert.ok(all.includes(n), n));
});
test('investigation results: one outlier, averages leave it out', () => {
  for (const inv of SC.INVESTIGATIONS) for (let i = 0; i < 50; i++) {
    const r = SC.makeResults(inv), o = r.rows[r.oRow], good = o.tr.filter((_, k) => k !== r.oTrial);
    assert.ok(Math.abs(o.avg - (good[0] + good[1]) / 2) < 0.051, inv.id + ' outlier average');
    assert.ok(Math.abs(o.tr[r.oTrial] - o.avg) / o.avg > 0.25, inv.id + ' outlier stands out');
  }
});
test('data task: graph/table analysis with auto-marked parts and short answers', () => {
  for (let i = 0; i < 100; i++) {
    const t = SC.dataTask();
    assert.strictEqual(t.visual.type, 'table');
    t.parts.forEach((p, k) => checkPart(p, 'dataTask part ' + (p.label || k), true));
    assert.ok(t.parts.filter(p => p.type === 'short').length >= 2);
    assert.ok(t.parts.reduce((a, p) => a + (p.marks || 1), 0) >= 8);
  }
});
test('practice exam: 60 min, 15–20 multiple choice, written responses across both topics', () => {
  const byId = Object.fromEntries(SC.DECKS.map(d => [d.id, d]));
  for (let i = 0; i < 100; i++) {
    const p = SC.buildPaper();
    assert.strictEqual(p.minutes, 60);
    const mc = p.items.filter(x => x.section === 'I'), wr = p.items.filter(x => x.section === 'II');
    assert.ok(mc.length >= 15 && mc.length <= 20, 'mc count ' + mc.length);
    mc.forEach(x => {
      if (x.kind === 'mc') assert.ok(byId[x.deckId].concepts.includes(x.mc));
      else { assert.strictEqual(x.kind, 'bank'); assert.ok(byId[x.deckId].bank.includes(x.fn), 'bank fn is in its deck bank'); const q = x.fn('F'); assert.strictEqual(q.parts.length, 1); assert.strictEqual(q.parts[0].type, 'choice'); checkPart(q.parts[0], x.fn.name); }
    });
    assert.ok(wr.length >= 5, 'written count');
    assert.ok(wr.some(x => x.kind === 'data'), 'has a data/graph analysis question');
    assert.ok(wr.some(x => x.kind === 'short' && x.short.design), 'has an investigation design question');
    wr.filter(x => x.kind === 'short').forEach(x => checkShort(x.short, x.deckId));
    const decks = new Set(p.items.map(x => x.deckId));
    assert.ok(decks.has('scidata'), 'Data Science topic');
    ['scienergy', 'scichem', 'scigeo', 'scirocks'].forEach(id => assert.ok(decks.has(id), 'Change topic ' + id));
  }
});
test('no formatter characters (* $ ^) in deck text or generated questions', () => {
  for (const d of SC.DECKS) {
    const { bank, ...rest } = d; noFormatterChars(rest, d.id);
    for (const fn of bank) for (let i = 0; i < 40; i++) for (const L of ['F', 'S', 'C']) noFormatterChars(fn(L), `${d.id}/${fn.name}`);
  }
  for (let i = 0; i < 40; i++) noFormatterChars(SC.dataTask(), 'dataTask');
});
test('Science is wired in: exams.json, build.py, app.js (not admin-only)', () => {
  const root = path.join(__dirname, '..');
  const ex = JSON.parse(fs.readFileSync(path.join(root, 'exams.json'), 'utf8')).find(e => e.id === 'sci');
  assert.deepStrictEqual(ex, { id: 'sci', name: 'Science', date: '2026-10-26T11:00', when: 'Mon 26 Oct, P3–4' });
  assert.ok(/'science\.js'/.test(fs.readFileSync(path.join(root, 'build.py'), 'utf8')));
  const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
  assert.ok(/id: 'sci', name: 'Science'/.test(app) && /\.\.\.SC\.DECKS/.test(app) && /buildSciMock/.test(app));
  const admin = app.match(/const ADMIN_ONLY = \[([^\]]*)\]/)[1];
  assert.ok(!/sci/.test(admin), 'Science is visible to everyone');
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
