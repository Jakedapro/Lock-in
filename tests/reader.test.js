/* Run: node tests/reader.test.js */
const assert = require('assert');
const fs = require('fs');
const RD = require('../src/reader.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const filled = (s) => typeof s === 'string' && s.trim().length > 0;

test('exactly 10 chapters numbered 1 to 10, each with a title', () => {
  assert.strictEqual(RD.CHAPTERS.length, 10);
  RD.CHAPTERS.forEach((c, i) => { assert.strictEqual(c.n, i + 1); assert.ok(filled(c.title), 'title ' + c.n); });
});
test('summaries are 80 to 200 words', () => {
  RD.CHAPTERS.forEach(c => { const w = words(c.summary); assert.ok(w >= 80 && w <= 200, `ch${c.n} summary has ${w} words`); });
});
test('each chapter has 4 to 6 complete moments', () => {
  for (const c of RD.CHAPTERS) {
    assert.ok(c.moments.length >= 4 && c.moments.length <= 6, `ch${c.n} has ${c.moments.length} moments`);
    c.moments.forEach((m, i) => {
      for (const k of ['title', 'quote', 'explain', 'technique', 'theme']) assert.ok(filled(m[k]), `ch${c.n} moment ${i + 1} ${k}`);
      assert.strictEqual(typeof m.history, 'string', `ch${c.n} moment ${i + 1} history`);
      assert.ok(m.think && filled(m.think.q) && filled(m.think.a), `ch${c.n} moment ${i + 1} think`);
    });
  }
});
test('quotes are short (25 words or fewer) and at most 6 per chapter', () => {
  for (const c of RD.CHAPTERS) {
    assert.ok(c.moments.length <= 6, `ch${c.n} quote count`);
    c.moments.forEach(m => assert.ok(words(m.quote) <= 25, `ch${c.n} quote too long: ${m.quote}`));
  }
});
test('quizzes have 3 to 4 questions with distinct options and valid answers', () => {
  for (const c of RD.CHAPTERS) {
    assert.ok(c.quiz.length >= 3 && c.quiz.length <= 4, `ch${c.n} quiz length`);
    c.quiz.forEach(([q, opts, ans, why], i) => {
      assert.ok(filled(q) && filled(why), `ch${c.n} q${i + 1} text`);
      assert.ok(Array.isArray(opts) && opts.length >= 2, `ch${c.n} q${i + 1} options`);
      assert.strictEqual(new Set(opts).size, opts.length, `ch${c.n} q${i + 1} distinct options`);
      assert.ok(Number.isInteger(ans) && ans >= 0 && ans < opts.length, `ch${c.n} q${i + 1} answer index`);
    });
  }
});
test('no asterisks or dollar signs anywhere', () => {
  const all = JSON.stringify(RD);
  assert.ok(!/[*$]/.test(all), 'found * or $');
});
test('CAST has 15 or more complete entries', () => {
  assert.ok(RD.CAST.length >= 15);
  RD.CAST.forEach(p => ['name', 'who', 'stands', 'arc'].forEach(k => assert.ok(filled(p[k]), `${p.name} ${k}`)));
  assert.strictEqual(new Set(RD.CAST.map(p => p.name)).size, RD.CAST.length, 'names unique');
});

// Quotes against the book itself (skipped silently when the text file is not present).
const BOOK = [process.env.ANIMAL_FARM_TXT, '/private/tmp/claude-501/-Users-jakoblal-Library-Application-Support-Claude-scratch-workspaces-cb9a84c2-d0ba-4c42-af29-689206bd6e58-a9818a8e-fdf3-4fe8-9391-fb1b7233a4cf-scratch-2026-10-14-aab07a/54c14f92-da97-4318-b014-0dc01b83fd52/scratchpad/animalfarm.txt']
  .find(p => p && fs.existsSync(p));
if (BOOK) {
  const norm = (s) => s.replace(/[‘’`]/g, "'").replace(/[“”]/g, '"').replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim();
  const NUMS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  // Drop page markers and the source's running header/footer lines, then split into chapters.
  const lines = fs.readFileSync(BOOK, 'utf8').split(/\r?\n/)
    .filter(l => !/^=== page \d+ ===$/.test(l.trim()) && l.trim() !== 'Animal Farm by George Orwell' && !/^https?:\/\/\S+ \(\d+ of \d+\)/.test(l.trim()));
  const chapters = []; let cur = null;
  for (const l of lines) {
    if (chapters.length < 10 && l.trim() === NUMS[chapters.length]) { cur = []; chapters.push(cur); continue; }
    if (cur) cur.push(l);
  }
  const spans = chapters.map(c => norm(c.join('\n')));
  const book = spans.join(' ');
  const inOrder = (hay, q) => { let at = 0; for (const piece of norm(q).split('…').map(s => s.trim()).filter(Boolean)) { const i = hay.indexOf(piece, at); if (i < 0) return false; at = i + piece.length; } return true; };

  test('book text splits into 10 chapters', () => assert.strictEqual(spans.length, 10));
  test('every quote appears in the book', () => {
    for (const c of RD.CHAPTERS) c.moments.forEach(m => assert.ok(inOrder(book, m.quote), `ch${c.n} not in book: ${m.quote}`));
  });
  test('every quote falls inside its own chapter', () => {
    for (const c of RD.CHAPTERS) c.moments.forEach(m => assert.ok(inOrder(spans[c.n - 1], m.quote), `not in chapter ${c.n}: ${m.quote}`));
  });
}

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
