/* ===== Lock In — shared helpers for generated questions (random numbers, parts, TeX) ===== */
const TK = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const rnz = (a, b) => { let v; do { v = ri(a, b); } while (v === 0); return v; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const rnd = (x, dp) => Math.round(x * 10 ** dp) / 10 ** dp;
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const nCr = (n, r) => (r < 0 || r > n ? 0 : Math.round(fact(n) / (fact(r) * fact(n - r))));
  const P = (label, q, type, value, show, steps, marks = 1, extra = {}) => ({ label, q, type, value, show, steps, marks, ...extra });
  // Multiple-choice part: wrong answers are de-duplicated and never equal the right one.
  function CH(label, q, right, wrongs, steps, marks = 1, extra = {}) {
    const opts = [String(right), ...[...new Set(wrongs.map(String))].filter(w => w !== String(right))].slice(0, 4);
    const choices = shuffle(opts);
    return { label, q, type: 'choice', choices, value: choices.indexOf(String(right)), show: String(right), steps, marks, ...extra };
  }
  const finish = (d) => { d.cards = d.cards.map(([q, a]) => ({ q, a })); d.concepts = d.concepts.map(([q, options, answer, why]) => ({ q, options, answer, why })); return d; };
  // TeX builders: m() wraps TeX in $ signs for the formatter.
  const m = (t) => `$${t}$`;
  const dec = (x, dp = 3) => String(rnd(x, dp));
  const tf = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`; };
  const tlin = (c, v = 'x') => (c === 0 ? v : c < 0 ? `${v} - ${-c}` : `${v} + ${c}`);
  // Number to sf significant figures; scientific notation outside 0.01 – 100 000.
  function sci(x, sf = 3) {
    if (x === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e < 5) return String(Number(x.toPrecision(sf)));
    const mant = Number((x / 10 ** e).toPrecision(sf));
    return mant === 10 ? `1 \\times 10^{${e + 1}}` : `${mant} \\times 10^{${e}}`;
  }
  return { ri, rnz, pick, shuffle, gcd, rnd, fact, nCr, P, CH, finish, m, dec, tf, tlin, sci };
})();
if (typeof module !== 'undefined') module.exports = TK;
