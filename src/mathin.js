/* ===== Lock In — typed maths answers: evaluates things like 3π/4, 2√3, sqrt(2), 2^5 =====
   A small parser (no eval): numbers, + − × ÷ * / ^, brackets, √/sqrt, π/pi, e, implicit ×. */
const MathIn = (() => {
  function tokens(s) {
    const t = [], src = String(s).replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '').toLowerCase();
    let i = 0;
    while (i < src.length) {
      const c = src[i], rest = src.slice(i);
      let m;
      if ((m = rest.match(/^\d+(\.\d+)?|^\.\d+/))) { t.push({ k: 'n', v: parseFloat(m[0]) }); i += m[0].length; }
      else if (rest.startsWith('sqrt')) { t.push({ k: 'sqrt' }); i += 4; }
      else if (rest.startsWith('pi')) { t.push({ k: 'n', v: Math.PI }); i += 2; }
      else if (c === 'π') { t.push({ k: 'n', v: Math.PI }); i++; }
      else if (c === 'e') { t.push({ k: 'n', v: Math.E }); i++; }
      else if (c === '√') { t.push({ k: 'sqrt' }); i++; }
      else if ('+-*/^()'.includes(c)) { t.push({ k: c }); i++; }
      else return null;
    }
    return t;
  }
  function evaluate(s) {
    const t = tokens(s); if (!t || !t.length) return NaN;
    let i = 0;
    const peek = () => t[i], take = () => t[i++];
    const startsAtom = (x) => x && (x.k === 'n' || x.k === '(' || x.k === 'sqrt');
    // expr = term (('+'|'-') term)*
    function expr() { let v = term(); while (peek() && (peek().k === '+' || peek().k === '-')) { const op = take().k, r = term(); v = op === '+' ? v + r : v - r; } return v; }
    // term = unary (('*'|'/' | implicit) unary)*
    function term() {
      let v = unary();
      for (;;) {
        const x = peek();
        if (x && (x.k === '*' || x.k === '/')) { take(); const r = unary(); v = x.k === '*' ? v * r : v / r; }
        else if (startsAtom(x)) v *= unary(); // 2π, 2(3+1), 2√3
        else return v;
      }
    }
    function unary() { if (peek() && peek().k === '-') { take(); return -unary(); } if (peek() && peek().k === '+') { take(); return unary(); } return power(); }
    // power = atom ('^' unary)?   (right-associative: 2^3^2 = 2^9)
    function power() { const b = atom(); if (peek() && peek().k === '^') { take(); return b ** unary(); } return b; }
    function atom() {
      const x = take(); if (!x) throw 0;
      if (x.k === 'n') return x.v;
      if (x.k === 'sqrt') { const v = power(); if (v < 0) throw 0; return Math.sqrt(v); }
      if (x.k === '(') { const v = expr(); if (!take() || t[i - 1].k !== ')') throw 0; return v; }
      throw 0;
    }
    try { const v = expr(); return i === t.length && Number.isFinite(v) ? v : NaN; } catch (e) { return NaN; }
  }
  return { evaluate };
})();
if (typeof module !== 'undefined') module.exports = MathIn;
