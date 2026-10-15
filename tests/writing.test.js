/* Run: node tests/writing.test.js */
const assert = require('assert');
const WR = require('../src/writing.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const chk = (r, id) => r.checks.find(c => c.id === id);

const ESSAY = `Through the extended metaphor of the river, the composer conveys that grief isolates individuals while also binding a community together, revealing the paradox at the heart of human experience.

The composer uses imagery to convey how grief cuts people off. The river is described as "a black tongue licking at the town", a metaphor that personifies the water as threatening and hungry. This foregrounds the isolation of the family, as the sibilance in "silent, sullen streets" underscores how sound itself seems to vanish. Then the father goes to the river and finds the boat.

Furthermore, the juxtaposition of the bright festival and the empty house highlights the paradox that communal joy can heighten private sorrow. "Everyone was laughing". The high modality of "we must remember" invites responders to see collective memory as a way to heal.

Ultimately, the composer suggests that grief is both isolating and binding, a paradox that reveals our deep need for others.`;
const Q = 'How does the text represent the paradoxes of grief as a human experience?';

test('essay: finds quotes, techniques, analysis verbs and the thesis', () => {
  const r = WR.analyse(ESSAY, { kind: 'essay', question: Q });
  assert.strictEqual(r.stats.paragraphs, 4);
  assert.strictEqual(r.stats.quotes, 4);
  assert.ok(r.stats.techniques >= 6);
  assert.strictEqual(chk(r, 'thesis').status, 'good');
  assert.ok(r.marks.some(m => m.kind === 'thesis'));
  assert.ok(r.marks.some(m => m.kind === 'verb' && /conveys/.test(ESSAY.slice(m.start, m.end))));
});
test('essay: a quote with no analysis is a dropped quote', () => {
  const r = WR.analyse(ESSAY, { kind: 'essay', question: Q });
  const dropped = r.marks.filter(m => m.kind === 'dropped').map(m => ESSAY.slice(m.start, m.end));
  assert.deepStrictEqual(dropped, ['"Everyone was laughing"']);
});
test('essay: plot retelling is flagged', () => {
  const r = WR.analyse(ESSAY, { kind: 'essay', question: Q });
  assert.ok(r.marks.some(m => m.kind === 'retell' && /father goes/.test(ESSAY.slice(m.start, m.end))));
  assert.notStrictEqual(chk(r, 'retell').status, 'good');
});
test('essay: too short lowers the overall score', () => {
  const r = WR.analyse(ESSAY, { kind: 'essay', question: Q }), p = WR.analyse(ESSAY.split('\n\n')[1], { kind: 'paragraph', question: Q });
  assert.strictEqual(chk(r, 'length').status, 'fix');
  assert.ok(r.score < 80, 'short essay score ' + r.score);
  assert.ok(p.score > 50, 'as a paragraph it does fine: ' + p.score);
});
test('essay: informal and vague language is flagged but not inside quotes', () => {
  const t = `I think the text shows a lot of things about grief. You can see that it's really sad.\n\nThe poet writes "it's a lot of rain" which is a metaphor that conveys sorrow.\n\nOverall it is good.`;
  const r = WR.analyse(t, { kind: 'essay' });
  const kinds = r.marks.filter(m => m.kind === 'informal' || m.kind === 'weak').map(m => t.slice(m.start, m.end).toLowerCase());
  ['i think', 'shows', 'a lot of', 'things', 'you', "it's", 'really', 'good'].forEach(w => assert.ok(kinds.includes(w), 'flags ' + w + ' in ' + kinds.join(',')));
  const inside = t.indexOf('"it\'s a lot');
  assert.ok(!r.marks.some(m => (m.kind === 'informal' || m.kind === 'weak') && m.start > inside && m.start < inside + 18), 'nothing flagged inside the quote');
  assert.strictEqual(chk(r, 'language').status, 'fix');
});
test('essay: no claim in the introduction is a thesis problem', () => {
  const t = 'This essay is about a book.\n\nThe book has a character called Sam. Sam goes to the shop. Then Sam went home.\n\nThe end of the book is sad.';
  assert.strictEqual(chk(WR.analyse(t, { kind: 'essay' }), 'thesis').status, 'fix');
});
test('short answer: length is judged against the marks', () => {
  const t = 'The metaphor "a black tongue licking at the town" conveys how threatening the flood feels, personifying the water as hungry. This positions the reader to fear the river and to understand why the townspeople feel powerless against it.';
  assert.notStrictEqual(chk(WR.analyse(t, { kind: 'short', marks: 2 }), 'length').status, 'fix');
  assert.strictEqual(chk(WR.analyse(t, { kind: 'short', marks: 6 }), 'length').status, 'fix');
});

const WEAK_STORY = `I woke up and felt nervous. It was the day of the race. I walked slowly to the kitchen. I saw my mum. I was really scared and my heart was pounding.\n\n"Good luck" she said. I felt happy. I ran quickly to the car. All of a sudden it started to rain.\n\nI thought about winning. I knew I could do it. Then I woke up and it was all a dream.`;
const GOOD_STORY = `The kettle clicked off. Nobody moved.\n\nGran's chair still faced the window, its cushion pressed into the shape of her, the way sand remembers a foot. Dad stood at the bench and turned the mug in his hands until the tea went grey as the sky outside.\n\n"She'd hate this," he said. "All of us, standing around like furniture."\n\nI smelled her lavender soap on the tea towel, sharp and clean against the damp wool of our coats. Somewhere a magpie warbled. The rain hissed on the tin roof.\n\nLater, when the others had gone, I sat in her chair. The cushion was cold. Someone had drawn a small heart in the fogged window, low down, at the height of a child.\n\nThe kettle clicked off again. This time, I moved.`;
test('creative: telling, adverbs, clichés, weak opening and ending are caught', () => {
  const r = WR.analyse(WEAK_STORY, { kind: 'creative' });
  ['hook', 'show', 'verbs', 'cliche', 'starts', 'ending'].forEach(id => assert.strictEqual(chk(r, id).status, 'fix', id));
  assert.ok(chk(r, 'dialogue'), 'dialogue punctuation checked');
  assert.match(chk(r, 'starts').msg, /"I"/);
});
test('creative: a crafted piece scores well on craft', () => {
  const r = WR.analyse(GOOD_STORY, { kind: 'creative' });
  ['hook', 'show', 'senses', 'verbs', 'cliche', 'ending', 'figurative', 'starts'].forEach(id => assert.strictEqual(chk(r, id).status, 'good', id + ': ' + chk(r, id).msg));
  assert.ok(r.score > WR.analyse(WEAK_STORY, { kind: 'creative' }).score + 30);
});
test('highlight escapes HTML and wraps marks', () => {
  const t = 'The <b> tag "shows" a lot & more, and it conveys meaning through a metaphor.';
  const r = WR.analyse(t + ' ' + t + ' ' + t, { kind: 'paragraph' });
  const h = WR.highlight(t, r.marks.filter(m => m.end <= t.length));
  assert.ok(h.includes('&lt;b&gt;') && h.includes('&amp;') && !h.includes('<b>'));
  assert.ok(/<mark class="[^"]*wr-verb[^"]*"[^>]*>conveys<\/mark>/.test(h));
  assert.strictEqual(h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"'), t, 'text unchanged');
});
test('tiny input asks for more', () => {
  const r = WR.analyse('Too short.', { kind: 'essay' });
  assert.strictEqual(r.checks.length, 1); assert.strictEqual(r.score, 0);
});
test('paragraphs split on blank lines, or on single lines when there are no blank lines', () => {
  assert.strictEqual(WR.paragraphs('a\n\nb\n\n\nc').length, 3);
  assert.strictEqual(WR.paragraphs('a\nb\nc\nd').length, 4);
  assert.strictEqual(WR.paragraphs('one line\nwrapped').length, 1);
});

test('cloze hides about a third of the words, at least one, keeping order', () => {
  const q = 'Hope is the thing with feathers that perches in the soul';
  const toks = WR.cloze(q, 0.35);
  assert.strictEqual(toks.map(t => t.w).join(' '), q);
  const hidden = toks.filter(t => t.hide).length; assert.ok(hidden >= 3 && hidden <= 5, 'hidden ' + hidden);
  assert.ok(WR.cloze('Go', 0.35).some(t => t.hide));
});
test('initials keep punctuation and the first letter of each word', () => {
  assert.strictEqual(WR.initials('"Hope is the thing, with feathers"'), '"H i t t, w f"');
});
test('recall scores word-by-word, ignoring case and punctuation', () => {
  const t = 'Hope is the thing with feathers';
  assert.strictEqual(WR.recall('hope is the thing with feathers', t), 1);
  assert.strictEqual(WR.recall('Hope, is the thing with feathers!', t), 1);
  assert.ok(Math.abs(WR.recall('hope is a thing with feathers', t) - 5 / 6) < 1e-9);
  assert.strictEqual(WR.recall('', t), 0);
  assert.ok(WR.recall(t + ' and more extra words here', t) < 1, 'padding does not get full marks');
});

const SQ = 'How does Orwell use Squealer to show the power of language?';
test('PETAL: a complete paragraph ticks all five parts', () => {
  const t = 'Orwell uses Squealer to show how language can be used to control the other animals. When the animals question the pigs taking the milk and apples, Squealer asks "Surely, comrades, you do not want Jones back?" This rhetorical question uses fear to stop the animals thinking for themselves, because Jones is the one thing they all fear. It suggests that Squealer twists the truth so the pigs can keep their privileges. Therefore, Orwell warns readers that people in power can use clever language to control others.';
  const r = WR.analyse(t, { kind: 'petal', question: SQ });
  assert.deepStrictEqual(chk(r, 'petal').petal, [{ P: true, E: true, T: true, A: true, L: true }]);
  assert.strictEqual(chk(r, 'author').status, 'good');
  assert.ok(!r.marks.some(m => m.kind === 'weak' && /shows?|uses/.test(t.slice(m.start, m.end))), '"shows" and "uses" are fine in PETAL');
});
test('PETAL: retelling with no quote misses E, T, A and L and the point is weak', () => {
  const r = WR.analyse('Squealer is a pig. He talks a lot and says things to the animals. The animals listen to him. Then Napoleon takes over the farm and the animals work hard.', { kind: 'petal', question: SQ });
  assert.deepStrictEqual(chk(r, 'petal').petal, [{ P: false, E: false, T: false, A: false, L: false }]);
  assert.strictEqual(chk(r, 'petal').tips.length, 5);
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
