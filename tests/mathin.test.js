/* Run: node tests/mathin.test.js */
const assert = require('assert');
const MathIn = require('../src/mathin.js');
const X = require('../src/exam.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('numbers and arithmetic', () => {
  near(MathIn.evaluate('(1+2)*3'), 9);
  near(MathIn.evaluate('2×3÷4'), 1.5);
  near(MathIn.evaluate('−3 + 4'), 1);
  near(MathIn.evaluate('-2^2'), -4);
  near(MathIn.evaluate('2^3^2'), 512);
});
test('roots, pi and e', () => {
  near(MathIn.evaluate('√2'), Math.SQRT2);
  near(MathIn.evaluate('sqrt(2)'), Math.SQRT2);
  near(MathIn.evaluate('2√3'), 2 * Math.sqrt(3));
  near(MathIn.evaluate('√(9+16)'), 5);
  near(MathIn.evaluate('3π/4'), 3 * Math.PI / 4);
  near(MathIn.evaluate('pi/4'), Math.PI / 4);
  near(MathIn.evaluate('e^2'), Math.E ** 2);
});
test('implicit multiplication', () => {
  near(MathIn.evaluate('2(3+1)'), 8);
  near(MathIn.evaluate('(1+1)(2+2)'), 8);
  near(MathIn.evaluate('2π'), 2 * Math.PI);
});
test('rejects anything that is not maths', () => {
  for (const s of ['abc', 'alert(1)', '2+', '()', '3/0', '', 'x', '1..2', 'constructor']) assert.ok(Number.isNaN(MathIn.evaluate(s)), s);
});
test('checker accepts expressions for numeric answers', () => {
  assert.ok(X.check({ type: 'num', value: Math.PI / 4, round: 3 }, 'π/4'));
  assert.ok(X.check({ type: 'num', value: 0.785, round: 3 }, 'pi/4'));
  assert.ok(X.check({ type: 'num', value: 2 * Math.sqrt(3) }, '2√3'));
  assert.ok(X.check({ type: 'num', value: 32 }, '2^5'));
  assert.ok(!X.check({ type: 'num', value: 32 }, '2^4'));
  assert.ok(X.check({ type: 'num', value: 1.5 }, '1 1/2'));
});

test('scientific notation', () => {
  near(MathIn.evaluate('3.2e4'), 32000);
  near(MathIn.evaluate('6.63e-34'), 6.63e-34);
  near(MathIn.evaluate('3.2×10^4'), 32000);
  near(MathIn.evaluate('3.2 x 10^-3'), 0.0032);
  near(MathIn.evaluate('2e'), 2 * Math.E);
  assert.ok(X.check({ type: 'num', value: 4.07e-19, tol: 0.01 }, '4.07 x 10^-19'));
  assert.ok(X.check({ type: 'num', value: 4.07e-19, tol: 0.01 }, '4.1e-19'));
  assert.ok(!X.check({ type: 'num', value: 4.07e-19, tol: 0.01 }, '4.07e-18'));
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
