/* ===== Lock In — invite keys (no DOM) =====
   A key looks like LOCK-7KQ2-XD9M-3HTA. The public keys.json holds only SHA-256 hashes of keys,
   so reading the repo doesn't reveal any key. Turning a key off = setting "revoked": true. */
const Keys = (() => {
  const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L: easy to read out loud
  const LEN = 12, SALT = 'lockin-key:';

  // Plain SHA-256 of a UTF-8 string, as hex (sync, so it works in every browser and in Node tests).
  function sha256(str) {
    const bytes = unescape(encodeURIComponent(str)).split('').map(c => c.charCodeAt(0));
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const l = bytes.length * 8;
    bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (l >>> (i * 8)) & 0xff);
    const rot = (x, n) => (x >>> n) | (x << (32 - n)), W = new Array(64);
    for (let o = 0; o < bytes.length; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
      for (let i = 16; i < 64; i++) {
        const s0 = rot(W[i - 15], 7) ^ rot(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = rot(W[i - 2], 17) ^ rot(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
  }

  // "lock 7kq2 xd9m-3hta" -> "7KQ2XD9M3HTA" (or '' if it can't be a key).
  function norm(s) {
    let t = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (t.startsWith('LOCK') && t.length === LEN + 4) t = t.slice(4);
    return t.length === LEN && [...t].every(c => ABC.includes(c)) ? t : '';
  }
  const pretty = (n) => 'LOCK-' + n.match(/.{4}/g).join('-');
  const hash = (key) => { const n = norm(key); return n ? sha256(SALT + n) : ''; };

  // Returns the matching, switched-on entry from keys.json, or null.
  function check(key, list) {
    const h = hash(key); if (!h || !list || !Array.isArray(list.keys)) return null;
    return list.keys.find(k => k.hash === h && !k.revoked) || null;
  }
  // A fresh random key. `rand` returns 0..1 (crypto-backed in the browser).
  function make(rand) {
    const r = rand || (() => { const a = new Uint32Array(1); (globalThis.crypto || require('crypto').webcrypto).getRandomValues(a); return a[0] / 2 ** 32; });
    return pretty(Array.from({ length: LEN }, () => ABC[Math.floor(r() * ABC.length) % ABC.length]).join(''));
  }

  return { sha256, norm, pretty, hash, check, make, ABC, LEN };
})();
if (typeof module !== 'undefined') module.exports = Keys;
