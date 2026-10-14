/* Run: node tests/fmt.test.js */
const assert = require('assert');
const Fmt = require('../src/fmt.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const FR = (a, b) => `<span class="frac"><span class="num">${a}</span><span class="sr">/</span><span class="den">${b}</span></span>`;
const SUP = (p) => `<span class="sr">^</span><sup class="pow">${p}</sup>`;

test('escapes HTML', () => {
  assert.strictEqual(Fmt.text('<img src=x onerror=alert(1)> & "q"'), '&lt;img src=x onerror=alert(1)&gt; &amp; &quot;q&quot;');
});
test('plain text is unchanged', () => {
  assert.strictEqual(Fmt.text('Find the area of the rectangle.'), 'Find the area of the rectangle.');
});
test('unicode squared and cubed become big superscripts', () => {
  assert.strictEqual(Fmt.text('x² = 49'), `x${SUP('2')} = 49`);
  assert.strictEqual(Fmt.text('cm³'), `cm${SUP('3')}`);
});
test('caret powers become superscripts', () => {
  assert.strictEqual(Fmt.text('x^2 + y^10'), `x${SUP('2')} + y${SUP('10')}`);
  assert.strictEqual(Fmt.text('2^{n+1}'), `2${SUP('n+1')}`);
});
test('number fractions stack', () => {
  assert.strictEqual(Fmt.text('P = 3/8'), `P = ${FR('3', '8')}`);
  assert.strictEqual(Fmt.text('1 − 4/52 = 48/52'), `1 − ${FR('4', '52')} = ${FR('48', '52')}`);
});
test('units, dates and letter fractions are left alone', () => {
  assert.strictEqual(Fmt.text('60 km/h'), '60 km/h');
  assert.strictEqual(Fmt.text('on 26/10/2026'), 'on 26/10/2026');
  assert.strictEqual(Fmt.text('t = (v − u)/a'), 't = (v − u)/a');
  assert.strictEqual(Fmt.text('2.5/3'), '2.5/3');
});
test('LaTeX-style maths from the AI is cleaned up', () => {
  assert.strictEqual(Fmt.text('$\\frac{3}{4} \\times 2$'), `${FR('3', '4')} × 2`);
  assert.strictEqual(Fmt.text('\\frac{a+b}{2}'), FR('a+b', '2'));
  assert.strictEqual(Fmt.text('\\sqrt{49} \\div 7 \\pm 1 \\pi'), '√49 ÷ 7 ± 1 π');
});
test('**double** and *single* asterisks make bold', () => {
  assert.strictEqual(Fmt.text('a **key point** here'), 'a <b>key point</b> here');
  assert.strictEqual(Fmt.text('a *key* point'), 'a <b>key</b> point');
});
test('multiplication stars are not bold', () => {
  assert.strictEqual(Fmt.text('3 * 4 * 5'), '3 * 4 * 5');
  assert.strictEqual(Fmt.text('2*3*4'), '2*3*4');
});
test('rich: bullets, headings and line breaks', () => {
  assert.strictEqual(Fmt.rich('## Steps\n- first\n* second\nDone'), '<b class="h">Steps</b>\n<span class="li">first</span>\n<span class="li">second</span>\nDone');
});
test('rich still formats maths and bold inside bullets', () => {
  assert.strictEqual(Fmt.rich('- **x²** = 1/4'), `<span class="li"><b>x${SUP('2')}</b> = ${FR('1', '4')}</span>`);
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
