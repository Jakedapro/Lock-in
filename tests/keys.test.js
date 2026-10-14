/* Run: node tests/keys.test.js */
const assert = require('assert');
const crypto = require('crypto');
const Keys = require('../src/keys.js');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const node = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

test('sha256 matches Node for empty, short, long and unicode input', () => {
  for (const s of ['', 'abc', 'lockin-key:ABCDEFGHJKMN', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'y'.repeat(1000), 'π ≈ 3.14 — ✓']) assert.strictEqual(Keys.sha256(s), node(s), JSON.stringify(s.slice(0, 20)));
});
test('norm accepts the pretty form, spaces, lower case and no prefix', () => {
  assert.strictEqual(Keys.norm('LOCK-7KQ2-XD9M-3HTA'), '7KQ2XD9M3HTA');
  assert.strictEqual(Keys.norm('lock 7kq2 xd9m 3hta'), '7KQ2XD9M3HTA');
  assert.strictEqual(Keys.norm('7KQ2XD9M3HTA'), '7KQ2XD9M3HTA');
});
test('norm rejects the wrong length and is never fooled into a real key', () => {
  assert.strictEqual(Keys.norm('LOCK-7KQ2-XD9M'), '');
  assert.strictEqual(Keys.norm(''), '');
  assert.strictEqual(Keys.norm('LOCK-7KQ2-XD9M-3HTA-AAAA'), '');
});
test('make gives pretty, valid, distinct keys', () => {
  const ks = Array.from({ length: 200 }, () => Keys.make());
  ks.forEach(k => { assert.match(k, /^LOCK-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/); assert.ok(Keys.norm(k)); });
  assert.strictEqual(new Set(ks).size, ks.length);
});
test('check finds a key by hash and ignores revoked ones', () => {
  const a = Keys.make(), b = Keys.make();
  const list = { keys: [{ id: 'a', hash: Keys.hash(a) }, { id: 'b', hash: Keys.hash(b), revoked: true }] };
  assert.strictEqual(Keys.check(a, list).id, 'a');
  assert.strictEqual(Keys.check(a.toLowerCase().replace(/-/g, ' '), list).id, 'a');
  assert.strictEqual(Keys.check(b, list), null);
  assert.strictEqual(Keys.check(Keys.make(), list), null);
  assert.strictEqual(Keys.check(a, null), null);
});
test('keys.json in the repo is well-formed', () => {
  const list = require('../keys.json');
  assert.ok(Array.isArray(list.keys) && list.keys.length);
  const ids = list.keys.map(k => k.id); assert.strictEqual(new Set(ids).size, ids.length, 'ids unique');
  list.keys.forEach(k => assert.match(k.hash, /^[0-9a-f]{64}$/, k.id + ' hash'));
  assert.strictEqual(list.keys.filter(k => k.owner).length, 1, 'exactly one owner key');
});

let fail = 0;
for (const [name, fn] of tests) { try { fn(); } catch (e) { fail++; console.log('FAIL', name, '\n ', e.message); } }
console.log(fail ? `${fail}/${tests.length} failed` : `ok (${tests.length} tests)`);
process.exitCode = fail ? 1 : 0;
