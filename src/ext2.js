/* ===== Lock In — Year 12 Mathematics Extension 2 =====
   Topics follow the NSW Extension 2 syllabus. All notes and questions are original;
   every generated question carries its exact answer and working. */

const E2 = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const rnz = (a, b) => { let v; do { v = ri(a, b); } while (v === 0); return v; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const rnd = (x, dp) => Math.round(x * 10 ** dp) / 10 ** dp;
  const num = (x, dp = 3) => String(rnd(x, dp)).replace('-', '−');
  const neg = (n) => (n < 0 ? '−' + -n : String(n));
  const P = (label, q, type, value, show, steps, marks = 1, extra = {}) => ({ label, q, type, value, show, steps, marks, ...extra });
  function CH(label, q, right, wrongs, steps, marks = 1, extra = {}) {
    const opts = [String(right), ...[...new Set(wrongs.map(String))].filter(w => w !== String(right))].slice(0, 4);
    const choices = shuffle(opts);
    return { label, q, type: 'choice', choices, value: choices.indexOf(String(right)), show: String(right), steps, marks, ...extra };
  }
  const frac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g; return d === 1 ? neg(n) : `${neg(n)}/${d}`; };
  // "x − 3", "x + 2", "x"
  const lin = (c) => (c === 0 ? 'x' : c < 0 ? `x − ${-c}` : `x + ${c}`);
  const cplx = (a, b) => (b === 0 ? neg(a) : a === 0 ? (b === 1 ? 'i' : b === -1 ? '−i' : neg(b) + 'i') : `${neg(a)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}i`);
  // Angles as whole twelfths of π (t·π/12), shown in lowest terms; principal value in (−π, π].
  const princ = (t) => { t = ((t % 24) + 24) % 24; return t > 12 ? t - 24 : t; };
  const ang = (t) => { if (t === 0) return '0'; const g = gcd(t, 12), p = t / g, q = 12 / g; const top = p === 1 ? 'π' : p === -1 ? '−π' : `${neg(p)}π`; return q === 1 ? top : `${top}/${q}`; };
  const vec = (v) => `(${v.map(neg).join(', ')})`;
  const vecIJK = (v) => { const s = v.map((c, i) => [c, 'ijk'[i]]).filter(([c]) => c !== 0).map(([c, u], i) => `${i === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${u}`).join(''); return s || '0'; };
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const mag = (a) => Math.sqrt(dot(a, a));
  const finish = (d) => { d.cards = d.cards.map(([q, a]) => ({ q, a })); d.concepts = d.concepts.map(([q, options, answer, why]) => ({ q, options, answer, why })); return d; };

  /* ================= 1. THE NATURE OF PROOF ================= */
  const proof = finish({
    id: 'e2proof', subject: 'y12', title: 'The Nature of Proof', chapter: 'Ext 2 · 1', hue: 'lilac',
    blurb: 'Implication, contrapositive, contradiction, counterexamples and inequality proofs including AM–GM.',
    sections: [
      { code: '1.1', name: 'Language of proof', notes: ['P ⇒ Q means "if P then Q". P is the hypothesis, Q the conclusion.', 'The converse of P ⇒ Q is Q ⇒ P; it is a different statement and may be false.', 'P ⇔ Q (if and only if) means both P ⇒ Q and Q ⇒ P are true.', '∀ means "for all", ∃ means "there exists". The negation of "∀x, P(x)" is "∃x such that not P(x)".'], ex: ['Negate: "every prime is odd"', '"For all primes p, p is odd" becomes "there exists a prime that is not odd"', 'True negation: 2 is an even prime'] },
      { code: '1.2', name: 'Proof by contrapositive', notes: ['The contrapositive of P ⇒ Q is not Q ⇒ not P. It is logically equivalent to the original.', 'Use it when "not Q" gives you something concrete to work with.', 'Example: to prove "if n^2 is even then n is even", prove "if n is odd then n^2 is odd": (2k + 1)^2 = 2(2k^2 + 2k) + 1.'], ex: ['Contrapositive of "if xy is irrational then x or y is irrational"', 'Negate both parts and swap them', '"If x and y are both rational then xy is rational"'] },
      { code: '1.3', name: 'Proof by contradiction', notes: ['Assume the statement is false, then reason until you reach something impossible.', 'Classic results: √2 is irrational, and there are infinitely many primes.', 'Write the assumption clearly at the start and say "this is a contradiction" at the end.'], ex: ['Prove √2 is irrational', 'Assume √2 = p/q in lowest terms, so p^2 = 2q^2 and p is even', 'Then q is even too, contradicting lowest terms'] },
      { code: '1.4', name: 'Equivalence and disproof', notes: ['To prove P ⇔ Q, prove both directions.', 'One counterexample is enough to disprove a "for all" statement.', 'Examples alone never prove a "for all" statement, however many you check.'], ex: ['Disprove: n^2 + n + 41 is prime for all n ≥ 1', 'Try n = 40: 40^2 + 40 + 41 = 1681', '1681 = 41^2, not prime'] },
      { code: '1.5', name: 'Inequality proofs', notes: ['Start from something known to be true, like (a − b)^2 ≥ 0, and rearrange.', 'Or work with LHS − RHS and show it is ≥ 0.', 'Be careful multiplying by negative quantities: the inequality flips.', 'Useful: a^2 + b^2 ≥ 2ab, with equality when a = b.'], ex: ['Prove a^2 + b^2 ≥ 2ab', '(a − b)^2 ≥ 0', 'a^2 − 2ab + b^2 ≥ 0, so a^2 + b^2 ≥ 2ab'] },
      { code: '1.6', name: 'AM–GM inequality', notes: ['For positive a and b: (a + b)/2 ≥ √(ab). Arithmetic mean ≥ geometric mean.', 'Equality holds only when a = b.', 'Great for minimum problems: for x > 0, x + k^2/x ≥ 2k, with the minimum at x = k.', 'The n-variable version: (a₁ + … + aₙ)/n ≥ ⁿ√(a₁…aₙ).'], ex: ['Minimum of x + 9/x for x > 0', 'AM–GM: x + 9/x ≥ 2√9 = 6', 'Minimum 6, when x = 3'] },
    ],
    cards: [
      ['Converse of P ⇒ Q', 'Q ⇒ P'], ['Contrapositive of P ⇒ Q', 'not Q ⇒ not P (equivalent to the original)'], ['Negation of P ⇒ Q', 'P and not Q'],
      ['Negation of "∀x, P(x)"', '∃x such that not P(x)'], ['Proof by contradiction', 'Assume the opposite, reach an impossibility.'], ['Counterexample', 'One example that shows a "for all" statement is false.'],
      ['AM–GM (two numbers)', '(a + b)/2 ≥ √(ab) for a, b ≥ 0, equality when a = b'], ['Minimum of x + k^2/x (x > 0)', '2k, at x = k'], ['Key starting point for many inequalities', '(a − b)^2 ≥ 0'], ['P ⇔ Q means', 'P ⇒ Q and Q ⇒ P'],
    ],
    concepts: [
      ['The contrapositive of "if n is even then n^2 is even" is…', ['If n^2 is odd then n is odd', 'If n^2 is even then n is even', 'If n is odd then n^2 is odd', 'n is even and n^2 is odd'], 0, 'Negate both parts and swap them.'],
      ['Which is logically equivalent to P ⇒ Q?', ['not Q ⇒ not P', 'Q ⇒ P', 'not P ⇒ not Q', 'P and not Q'], 0, 'Only the contrapositive is equivalent.'],
      ['The negation of "all swans are white" is…', ['There is a swan that is not white', 'No swans are white', 'All swans are black', 'Some swans are white'], 0, '"For all" negates to "there exists … not".'],
      ['To disprove "for all n, P(n)" you need…', ['One counterexample', 'A proof by induction', 'Many examples', 'The contrapositive'], 0, ''],
      ['The minimum of x + 16/x for x > 0 is…', ['8', '4', '16', '32'], 0, '2√16 = 8, at x = 4.'],
      ['When does (a + b)/2 = √(ab) for positive a, b?', ['Only when a = b', 'Always', 'When a = 0', 'Never'], 0, ''],
      ['A proof that √3 is irrational usually uses…', ['Contradiction', 'Induction', 'A counterexample', 'Vectors'], 0, ''],
    ],
  });
  const IMPL = [
    ['n is even', 'n^2 is even', 'n is odd', 'n^2 is odd'],
    ['x > 2', 'x^2 > 4', 'x ≤ 2', 'x^2 ≤ 4'],
    ['n is a multiple of 4', 'n is even', 'n is not a multiple of 4', 'n is odd'],
    ['n is divisible by 6', 'n is divisible by 3', 'n is not divisible by 6', 'n is not divisible by 3'],
  ];
  proof.bank = [
    function logic() {
      const [p, q, np, nq] = pick(IMPL), kind = pick(['contrapositive', 'converse', 'negation']);
      const forms = { contrapositive: `If ${nq} then ${np}`, converse: `If ${q} then ${p}`, negation: `${p[0].toUpperCase() + p.slice(1)} and ${nq}`, inverse: `If ${np} then ${nq}` };
      return {
        level: 'F', tags: ['1.1', '1.2'], stem: `Consider the statement: "If ${p} then ${q}".`,
        parts: [CH('a', `Which statement is its ${kind}?`, forms[kind], Object.entries(forms).filter(([k]) => k !== kind).map(([, v]) => v), [kind === 'contrapositive' ? 'Contrapositive: not Q ⇒ not P' : kind === 'converse' ? 'Converse: Q ⇒ P' : 'Negation of P ⇒ Q: P and not Q'])],
      };
    },
    function amgm() {
      const k = ri(2, 9), c = ri(1, 6);
      return {
        level: 'S', tags: ['1.6', '1.5'], stem: `Let f(x) = ${c === 1 ? '' : c}x + ${c * k * k}/x for x > 0.`,
        parts: [
          P('a', 'Use AM–GM to find the minimum value of f(x).', 'num', 2 * c * k, String(2 * c * k), [`AM–GM: ${c === 1 ? '' : c}x + ${c * k * k}/x ≥ 2√(${c === 1 ? '' : c}x × ${c * k * k}/x)`, `= 2√${c * c * k * k} = ${2 * c * k}`], 2),
          P('b', 'For which x is the minimum reached?', 'num', k, `x = ${k}`, [`Equality when ${c === 1 ? '' : c}x = ${c * k * k}/x`, `x^2 = ${k * k}, x = ${k}`]),
          P('c', `For a = ${k} and b = ${k + c}, what is (a^2 + b^2) − 2ab?`, 'num', c * c, String(c * c), [`It equals (a − b)^2`, `= (${k} − ${k + c})^2 = ${c * c} ≥ 0`]),
        ],
      };
    },
    function counterexample() {
      const it = pick([
        ['n^2 + n + 41 is prime for every positive integer n', '40', ['1', '10', '39'], '40^2 + 40 + 41 = 1681 = 41^2'],
        ['2^n − 1 is prime whenever n is prime', '11', ['2', '3', '5', '7'], '2^11 − 1 = 2047 = 23 × 89 (but 2^2−1, 2^3−1, 2^5−1, 2^7−1 are all prime)'],
        ['n^2 ≥ 2n for every positive integer n', '1', ['2', '3', '4'], '1^2 = 1 < 2 = 2 × 1'],
        ['every number of the form 6k + 1 (k ≥ 1) is prime', '4', ['1', '2', '3'], 'k = 4 gives 25 = 5^2'],
        ['the sum of two irrational numbers is irrational', 'x = √2, y = −√2', ['x = √2, y = √3', 'x = √2, y = √2', 'x = π, y = π'], '√2 + (−√2) = 0, which is rational'],
      ]);
      return {
        level: 'S', tags: ['1.4'], stem: `Claim: ${it[0]}.`,
        parts: [CH('a', 'Which value is a counterexample?', it[1], it[2], [it[3], 'One counterexample disproves a "for all" claim.'], 2)],
      };
    },
    function contradictionSteps() {
      const p = pick([2, 3, 5]);
      return {
        level: 'C', tags: ['1.3'], stem: `A proof that √${p} is irrational starts: "Suppose √${p} = a/b where a, b are positive integers with no common factor."`,
        parts: [
          CH('a', 'Squaring gives which equation?', `a^2 = ${p}b^2`, [`a = ${p}b^2`, `a^2 = ${p}b`, `${p}a^2 = b^2`], [`(a/b)^2 = ${p}`, `a^2 = ${p}b^2`]),
          CH('b', 'What can we conclude next?', `${p} divides a, so a = ${p}k`, [`${p} divides b only`, `a = b`, `a is odd`], [`${p} divides a^2 and ${p} is prime, so ${p} divides a`]),
          CH('c', 'Why is this a contradiction?', `${p} then divides b too, so a and b share the factor ${p}`, ['a^2 would be negative', `√${p} would be a whole number`, 'b would be 0'], [`${p}^2k^2 = ${p}b^2 gives b^2 = ${p}k^2, so ${p} divides b`, 'That contradicts "no common factor"'], 2),
        ],
      };
    },
  ];

  /* ================= 2. COMPLEX NUMBERS ================= */
  const complex = finish({
    id: 'e2complex', subject: 'y12', title: 'Complex Numbers', chapter: 'Ext 2 · 2', hue: 'cyan',
    blurb: 'Cartesian, mod-arg and exponential forms, conjugates, square roots, De Moivre, curves and complex roots.',
    sections: [
      { code: '2.1', name: 'Introduction to complex numbers', notes: ['i^2 = −1. A complex number is z = x + iy with real part Re(z) = x and imaginary part Im(z) = y.', 'Add and subtract real and imaginary parts separately; multiply by expanding and using i^2 = −1.', 'Powers of i cycle every 4: i, −1, −i, 1.'], ex: ['(2 + 3i)(1 − i)', '2 − 2i + 3i − 3i^2', '= 2 + i + 3 = 5 + i'] },
      { code: '2.2', name: 'Cartesian form and conjugates', notes: ['The conjugate of z = x + iy is z̄ = x − iy.', 'z z̄ = x^2 + y^2 = |z|^2, a real number.', 'To divide, multiply top and bottom by the conjugate of the denominator.', 'Two complex numbers are equal only if their real parts and imaginary parts are both equal.'], ex: ['(5 + 5i)/(1 + 2i)', '× (1 − 2i)/(1 − 2i): (5 + 5i)(1 − 2i)/5', '= (15 − 5i)/5 = 3 − i'] },
      { code: '2.3', name: 'Mod-arg (polar) form', notes: ['|z| = √(x^2 + y^2) is the distance from the origin.', 'arg z is the angle from the positive real axis, with principal value −π < arg z ≤ π.', 'z = r(cos θ + i sin θ) = r cis θ.', 'Multiplying multiplies moduli and adds arguments; dividing divides moduli and subtracts arguments.'], ex: ['Write −1 + i√3 in mod-arg form', '|z| = √(1 + 3) = 2; second quadrant with tan α = √3', 'z = 2 cis(2π/3)'] },
      { code: '2.4', name: 'Exponential form', notes: ['Euler: e^{iθ} = cos θ + i sin θ, so z = re^{iθ}.', 'cos θ = (e^{iθ} + e^{−iθ})/2 and sin θ = (e^{iθ} − e^{−iθ})/(2i).', 'e^{iπ} + 1 = 0.'], ex: ['Write 3e^{iπ/2} in Cartesian form', '3(cos π/2 + i sin π/2)', '= 3i'] },
      { code: '2.5', name: 'Square roots', notes: ['To find √(a + ib), let (x + iy)^2 = a + ib and equate parts: x^2 − y^2 = a, 2xy = b.', 'Also |x + iy|^2 = |a + ib| gives x^2 + y^2 = √(a^2 + b^2), which makes solving quick.', 'The two square roots are negatives of each other.'], ex: ['Square roots of 3 + 4i', 'x^2 − y^2 = 3, 2xy = 4, x^2 + y^2 = 5', 'x^2 = 4, y^2 = 1: roots ±(2 + i)'] },
      { code: '2.6', name: 'Conjugate root theorem', notes: ['If a polynomial has real coefficients and z is a root, then z̄ is also a root.', 'So complex roots of real polynomials come in conjugate pairs.', 'The pair a ± ib gives the real quadratic factor (z − a)^2 + b^2 = z^2 − 2az + a^2 + b^2.'], ex: ['z^2 − 6z + 13 = 0', 'z = (6 ± √(36 − 52))/2 = (6 ± 4i)/2', 'z = 3 ± 2i'] },
      { code: '2.7', name: 'Complex numbers as vectors', notes: ['z is the vector from 0 to the point z on the Argand diagram; z₂ − z₁ is the vector from z₁ to z₂.', 'Adding follows the parallelogram rule.', 'Multiplying by i rotates a vector 90° anticlockwise; by cis θ rotates it by θ.'], ex: ['Rotate 3 + i by 90° anticlockwise', 'Multiply by i: i(3 + i)', '= −1 + 3i'] },
      { code: '2.8', name: 'Curves and regions', notes: ['|z − a| = r is a circle centre a, radius r.', '|z − a| = |z − b| is the perpendicular bisector of the segment from a to b.', 'arg(z − a) = θ is a ray from a (not including a) at angle θ.', 'Inequalities give regions: |z − a| ≤ r is the disc including its edge.'], ex: ['Describe |z − 2 + i| = 3', 'Rewrite as |z − (2 − i)| = 3', 'Circle centre (2, −1), radius 3'] },
      { code: '2.9', name: 'De Moivre\'s theorem', notes: ['(cis θ)^n = cis(nθ) for integers n.', 'So (r cis θ)^n = r^n cis(nθ): raise the modulus to the power, multiply the argument.', 'Expanding (cos θ + i sin θ)^n binomially gives multiple-angle formulas for cos nθ and sin nθ.'], ex: ['(1 + i)^8', '1 + i = √2 cis(π/4)', '(√2)^8 cis(2π) = 16'] },
      { code: '2.10', name: 'Complex roots', notes: ['z^n = 1 has n roots: cis(2kπ/n), k = 0, 1, …, n − 1, equally spaced on the unit circle.', 'The non-real roots of unity sum to −1, and all n roots sum to 0.', 'To solve z^n = r cis θ, write z = ρ cis α: ρ = ⁿ√r and α = (θ + 2kπ)/n.'], ex: ['Solve z^3 = 1', 'z = cis(2kπ/3), k = 0, 1, 2', 'z = 1, cis(2π/3), cis(−2π/3)'] },
    ],
    cards: [
      ['i^2', '−1'], ['Conjugate of x + iy', 'x − iy'], ['z × z̄', '|z|^2 (real)'], ['|z| for z = x + iy', '√(x^2 + y^2)'],
      ['Principal argument range', '−π < arg z ≤ π'], ['z = r cis θ', 'r(cos θ + i sin θ)'], ['Euler\'s formula', 'e^{iθ} = cos θ + i sin θ'],
      ['|z₁z₂| and arg(z₁z₂)', '|z₁||z₂| and arg z₁ + arg z₂'], ['De Moivre\'s theorem', '(cis θ)^n = cis(nθ)'], ['|z − a| = r', 'Circle centre a, radius r'],
      ['|z − a| = |z − b|', 'Perpendicular bisector of a and b'], ['Roots of z^n = 1', 'cis(2kπ/n), k = 0, …, n − 1'], ['Conjugate root theorem', 'Real-coefficient polynomials: if z is a root, so is z̄'], ['Multiply by i', 'Rotate 90° anticlockwise'],
    ],
    concepts: [
      ['i^{2023} = ?', ['−i', 'i', '1', '−1'], 0, '2023 = 4 × 505 + 3, and i^3 = −i.'],
      ['arg(−2) is…', ['π', '−π', '0', 'π/2'], 0, 'Negative real axis; principal value π.'],
      ['|3 − 4i| = ?', ['5', '7', '1', '25'], 0, '√(9 + 16) = 5.'],
      ['If 2 + i is a root of a real cubic, another root must be…', ['2 − i', '−2 + i', '−2 − i', '1 + 2i'], 0, 'Conjugate root theorem.'],
      ['|z − i| = |z + 1| describes…', ['A straight line', 'A circle', 'A ray', 'A parabola'], 0, 'Perpendicular bisector of i and −1.'],
      ['The sum of all 5 fifth roots of unity is…', ['0', '1', '5', '−1'], 0, 'They are symmetric about the origin.'],
      ['e^{iπ} = ?', ['−1', '1', 'i', '0'], 0, 'cos π + i sin π.'],
      ['Multiplying z by cis(π/3) does what?', ['Rotates z by π/3 anticlockwise', 'Enlarges z by 3', 'Reflects z in the real axis', 'Rotates z by π/3 clockwise'], 0, ''],
    ],
  });
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [1, 0, 1], [0, 2, 2]];
  // Exact Cartesian form of r cis(tπ/12) for t a multiple of 2 or of 3, with r chosen to keep it tidy.
  function exactCis(t, k) {
    const sgn = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0), c = Math.cos(t * Math.PI / 12), s = Math.sin(t * Math.PI / 12);
    const part = (v) => { const a = Math.abs(v); if (a < 1e-9) return [0, '']; if (Math.abs(a - 1) < 1e-9) return [sgn(v), String(2 * k)]; if (Math.abs(a - 0.5) < 1e-9) return [sgn(v), String(k)]; return [sgn(v), (k === 1 ? '' : k) + '√3']; };
    if (t % 3 === 0 && t % 6 !== 0) { // ±π/4, ±3π/4: modulus k√2, parts ±k
      return { r: `${k === 1 ? '' : k}√2`, z: cplx(k * sgn(c), k * sgn(s)) };
    }
    const [sx, x] = part(c), [sy, y] = part(s);
    const re = sx === 0 ? '' : (sx < 0 ? '−' : '') + x, im = sy === 0 ? '' : y === '1' ? 'i' : y + 'i';
    const z = !re ? (sy < 0 ? '−' : '') + (im || '0') : !im ? re : `${re} ${sy < 0 ? '−' : '+'} ${im}`;
    return { r: String(2 * k), z };
  }
  const eI = (t) => { const a = ang(t); return a.startsWith('−') ? `e^{−i${a.slice(1)}}` : `e^{i${a}}`; };
  const ANGLES = [2, 3, 4, 6, 8, 9, 10, 12, -2, -3, -4, -6, -8, -9, -10];
  complex.bank = [
    function arithmetic() {
      const [p, q] = pick(TRIPLES.slice(0, 4)), a = p * pick([1, -1]), b = q * pick([1, -1]), c = rnz(-5, 5), d = rnz(-5, 5);
      return {
        level: 'F', tags: ['2.1', '2.2', '2.3'], stem: `Let z = ${cplx(a, b)} and w = ${cplx(c, d)}.`,
        parts: [
          P('a', 'Find Re(z + w).', 'num', a + c, neg(a + c), [`${neg(a)} + ${neg(c)} = ${neg(a + c)}`]),
          P('b', 'Find Im(z − w).', 'num', b - d, neg(b - d), [`${neg(b)} − (${neg(d)}) = ${neg(b - d)}`]),
          P('c', 'Find Re(zw).', 'num', a * c - b * d, neg(a * c - b * d), [`(${cplx(a, b)})(${cplx(c, d)}): real part = ac − bd`, `= ${neg(a * c)} − (${neg(b * d)}) = ${neg(a * c - b * d)}`]),
          P('d', 'Find Im(zw).', 'num', a * d + b * c, neg(a * d + b * c), ['Imaginary part = ad + bc', `= ${neg(a * d)} + ${neg(b * c)} = ${neg(a * d + b * c)}`]),
          P('e', 'Find |z|.', 'num', Math.hypot(a, b), String(Math.hypot(a, b)), [`√(${neg(a)}^2 + ${neg(b)}^2) = √${a * a + b * b}`, `= ${Math.hypot(a, b)}`]),
        ],
      };
    },
    function division() {
      const c = rnz(-3, 3), d = rnz(-3, 3), e = rnz(-4, 4), f = rnz(-4, 4);
      const a = e * c - f * d, b = e * d + f * c; // z = (e + fi)(c + di)
      return {
        level: 'S', tags: ['2.2'], stem: `Let z = ${cplx(a, b)} and w = ${cplx(c, d)}.`,
        parts: [
          CH('a', 'What is w̄?', cplx(c, -d), [cplx(-c, d), cplx(-c, -d), cplx(d, c)], ['Change the sign of the imaginary part']),
          P('b', 'Find Re(z/w).', 'num', e, neg(e), [`z/w = z w̄ / |w|^2, with |w|^2 = ${c * c + d * d}`, `(${cplx(a, b)})(${cplx(c, -d)}) = ${cplx(e * (c * c + d * d), f * (c * c + d * d))}`, `÷ ${c * c + d * d} = ${cplx(e, f)}`], 2),
          P('c', 'Find Im(z/w).', 'num', f, neg(f), [`From (b): z/w = ${cplx(e, f)}`]),
        ],
      };
    },
    function modArg() {
      const t = pick(ANGLES), k = ri(1, 3), ex = exactCis(t, k);
      const wrongArgs = [ang(princ(-t)), ang(princ(t + 12)), ang(princ(12 - t)), ang(princ(6 - t))];
      return {
        level: 'S', tags: ['2.3', '2.4'], stem: `Let z = ${ex.z}.`,
        parts: [
          CH('a', 'Find |z|.', ex.r, [String(4 * k), `${k * 2}√2`, `${k}√3`, String(k * k * 4), String(k)], [`|z| = √(Re^2 + Im^2) = ${ex.r}`]),
          CH('b', 'Find arg z (principal value).', ang(t), wrongArgs, ['Locate the quadrant, find the related angle, then adjust', `arg z = ${ang(t)}`], 2),
          CH('c', 'Which is z in exponential form?', `${ex.r}${eI(t)}`, [`${ex.r}${eI(princ(-t))}`, `${ex.r}e^{${ang(t)}}`, `${eI(t)}`], [`z = |z| e^{i arg z}`]),
        ],
      };
    },
    function deMoivre() {
      const t = pick(ANGLES.filter(x => Math.abs(x) !== 12)), r = pick([1, 2]), n = ri(2, 6), arg = princ(n * t);
      const base = r === 1 ? `cis(${ang(t)})` : `2 cis(${ang(t)})`;
      return {
        level: 'S', tags: ['2.9'], stem: `Let z = ${base}. Use De Moivre's theorem to find z^${n}.`,
        parts: [
          P('a', `Find |z^${n}|.`, 'num', r ** n, String(r ** n), [`|z|^${n} = ${r}^${n} = ${r ** n}`]),
          CH('b', `Find the principal argument of z^${n}.`, ang(arg), [ang(princ(arg + 12)), ang(princ(n * t + 6)), ang(princ(-arg)), ang(princ(t + n))].filter(x => x !== ang(arg)), [`arg = ${n} × ${ang(t)} = ${ang(n * t)}`, `Principal value: ${ang(arg)}`], 2),
        ],
      };
    },
    function quadratic() {
      const p = rnz(-5, 5), q = ri(1, 6), b = -2 * p, c = p * p + q * q;
      const eq = `z^2 ${b < 0 ? '−' : '+'} ${Math.abs(b)}z + ${c} = 0`.replace(' + 0z', '').replace(' − 0z', '');
      return {
        level: 'S', tags: ['2.6'], stem: `Solve ${eq}. The roots are a ± bi with b > 0.`,
        parts: [
          P('a', 'Find a.', 'num', p, neg(p), [`z = (${neg(-b)} ± √(${b * b} − ${4 * c}))/2`, `= (${neg(-b)} ± √${b * b - 4 * c})/2 = ${neg(p)} ± ${q}i`]),
          P('b', 'Find b.', 'num', q, String(q), [`√${b * b - 4 * c} = ${2 * q}i, halved gives ${q}i`]),
          P('c', 'What is the product of the roots?', 'num', c, String(c), ['Product of roots = c/a', `= ${c}  (also (a + bi)(a − bi) = a^2 + b^2)`]),
        ],
      };
    },
    function squareRoot() {
      const x = ri(1, 5), y = rnz(-5, 5), a = x * x - y * y, b = 2 * x * y;
      return {
        level: 'C', tags: ['2.5'], stem: `The square roots of ${cplx(a, b)} are ±(x + iy), where x > 0.`,
        parts: [
          P('a', 'Find x.', 'num', x, String(x), [`x^2 − y^2 = ${neg(a)}, 2xy = ${neg(b)}`, `x^2 + y^2 = |${cplx(a, b)}| = ${x * x + y * y}`, `Adding: 2x^2 = ${2 * x * x}, x = ${x}`], 2),
          P('b', 'Find y.', 'num', y, neg(y), [`y = ${neg(b)}/(2x) = ${neg(y)}`]),
        ],
      };
    },
    function rootsOfUnity() {
      const n = ri(3, 8), piOver = (a, b) => { const g = gcd(a, b); a /= g; b /= g; return `${a === 1 ? '' : a}π${b === 1 ? '' : '/' + b}`; }, first = piOver(2, n);
      return {
        level: 'C', tags: ['2.10'], stem: `Consider the equation z^${n} = 1.`,
        parts: [
          P('a', 'How many roots does it have?', 'num', n, String(n), [`A degree ${n} polynomial has ${n} roots`]),
          CH('b', 'What is the smallest positive argument of a root?', first, [piOver(1, n), piOver(2, n + 1), piOver(1, 2 * n), piOver(n, 2)], [`Roots: cis(2kπ/${n}), k = 0 … ${n - 1}`, `k = 1 gives ${first}`]),
          P('c', 'What is the sum of all the roots?', 'num', 0, '0', ['Sum of roots = −(coefficient of z^{n−1}) = 0']),
          P('d', 'What is the product of all the roots?', 'num', (-1) ** (n + 1), neg((-1) ** (n + 1)), [`Product = (−1)^${n} × (−1) = ${neg((-1) ** (n + 1))}`], 1),
        ],
      };
    },
    function powersOfI() {
      const n = ri(10, 200), r = n % 4, val = ['1', 'i', '−1', '−i'][r];
      return {
        level: 'F', tags: ['2.1'], stem: 'Powers of i.',
        parts: [
          CH('a', `Simplify i^${n}.`, val, ['1', 'i', '−1', '−i'].filter(v => v !== val), [`${n} = 4 × ${Math.floor(n / 4)} + ${r}`, `i^${n} = i^${r} = ${val}`]),
          P('b', `Find (1 + i)^2 written as a + bi: what is b?`, 'num', 2, '2', ['(1 + i)^2 = 1 + 2i + i^2 = 2i']),
        ],
      };
    },
  ];

  /* ================= 3. FURTHER MATHEMATICAL INDUCTION ================= */
  const induction = finish({
    id: 'e2induction', subject: 'y12', title: 'Further Induction', chapter: 'Ext 2 · 3', hue: 'gold',
    blurb: 'Induction for series, divisibility, inequalities, recursive formulas and calculus results.',
    sections: [
      { code: '3.1', name: 'Induction structure', notes: ['Step 1: prove the statement for the first value (usually n = 1).', 'Step 2: assume it is true for n = k (the inductive hypothesis).', 'Step 3: prove it for n = k + 1, using the assumption.', 'Conclude: true for all n ≥ the first value, by mathematical induction.'], ex: ['Prove 1 + 3 + … + (2n − 1) = n^2', 'Assume 1 + … + (2k − 1) = k^2', 'Add 2k + 1: k^2 + 2k + 1 = (k + 1)^2 ✓'] },
      { code: '3.2', name: 'Divisibility proofs', notes: ['Write the assumption as an equation: 7^k − 1 = 6M for some integer M.', 'Rewrite the k + 1 expression to contain the assumed part: 7^{k+1} − 1 = 7(7^k − 1) + 6.', 'Substitute and factor out the divisor: 7(6M) + 6 = 6(7M + 1).'], ex: ['Show 5^n + 3 is divisible by 4', '5^{k+1} + 3 = 5(5^k + 3) − 12', '= 5(4M) − 12 = 4(5M − 3)'] },
      { code: '3.3', name: 'Inequality proofs', notes: ['The base case may not be n = 1: check where the inequality starts being true.', 'In the k + 1 step, use the assumption, then show the leftover part is positive.', 'Example: 2^n > n^2 holds for n ≥ 5 (it fails at n = 4 since 16 = 16).'], ex: ['Show 3^n > 2n + 1 for n ≥ 2', 'Assume 3^k > 2k + 1. Then 3^{k+1} > 6k + 3', '6k + 3 > 2k + 3 = 2(k + 1) + 1 ✓'] },
      { code: '3.4', name: 'Recursive formulas', notes: ['A recursive formula defines each term from the one before, e.g. a₁ = 1, a_{n+1} = 2aₙ + 1.', 'Induction proves a closed form, here aₙ = 2^n − 1.', 'Use the recursion in the k + 1 step: a_{k+1} = 2(2^k − 1) + 1 = 2^{k+1} − 1.'], ex: ['a₁ = 3, a_{n+1} = a_n + 4. Closed form?', 'Each term adds 4', 'aₙ = 4n − 1'] },
      { code: '3.5', name: 'Calculus and other results', notes: ['Induction also proves derivative patterns, e.g. d^n/dx^n (xe^x) = (x + n)e^x.', 'And results like De Moivre\'s theorem for positive integers n.', 'Geometry and counting results can be proved the same way.'], ex: ['d/dx of (x + k)e^x', '= e^x + (x + k)e^x', '= (x + k + 1)e^x ✓'] },
    ],
    cards: [
      ['Three steps of induction', 'Base case, assume n = k, prove n = k + 1.'], ['Inductive hypothesis', 'The assumption that the statement is true for n = k.'], ['Divisibility assumption form', 'e.g. 7^k − 1 = 6M, M an integer'],
      ['Key rewrite for 7^{k+1} − 1', '7(7^k − 1) + 6'], ['1 + 3 + … + (2n − 1)', 'n^2'], ['1 + 2 + … + n', 'n(n + 1)/2'], ['1^2 + 2^2 + … + n^2', 'n(n + 1)(2n + 1)/6'],
      ['1^3 + 2^3 + … + n^3', '(n(n + 1)/2)^2'], ['2^n > n^2 holds for…', 'n ≥ 5 (and n = 1)'], ['a₁ = 1, a_{n+1} = 2aₙ + 1', 'aₙ = 2^n − 1'],
    ],
    concepts: [
      ['In the inductive step you assume the result for…', ['n = k', 'n = k + 1', 'n = 1 only', 'all n'], 0, ''],
      ['To prove 4^n − 1 is divisible by 3, the assumption is…', ['4^k − 1 = 3M', '4^k = 3M', '4^{k+1} − 1 = 3M', '4^k − 1 = M'], 0, ''],
      ['4^{k+1} − 1 can be rewritten as…', ['4(4^k − 1) + 3', '4(4^k − 1) − 3', '4^k − 1 + 4', '(4^k − 1)^2'], 0, '4 × 4^k − 4 + 3.'],
      ['For 2^n > n^2, the base case should be…', ['n = 5', 'n = 1', 'n = 2', 'n = 4'], 0, 'It fails for n = 2, 3, 4.'],
      ['The term added in the k + 1 step of Σ r^2 is…', ['(k + 1)^2', 'k^2', 'k + 1', '(k + 1)^3'], 0, ''],
      ['An induction proof is incomplete without…', ['A concluding statement', 'A diagram', 'A counterexample', 'Three examples'], 0, ''],
    ],
  });
  const SERIES = [
    { s: 'r(r + 1)', f: 'n(n + 1)(n + 2)/3', v: (n) => n * (n + 1) * (n + 2) / 3, t: (k) => '(k + 1)(k + 2)', wrong: ['k(k + 1)', '(k + 1)(k + 2)(k + 3)/3', '(k + 2)(k + 3)'] },
    { s: '(2r − 1)', f: 'n^2', v: (n) => n * n, t: () => '2k + 1', wrong: ['2k − 1', '2k + 2', 'k + 1'] },
    { s: 'r^3', f: '(n(n + 1)/2)^2', v: (n) => (n * (n + 1) / 2) ** 2, t: () => '(k + 1)^3', wrong: ['k^3', '(k + 1)^2', '(k + 2)^3'] },
    { s: '1/(r(r + 1))', f: 'n/(n + 1)', v: (n) => n / (n + 1), t: () => '1/((k + 1)(k + 2))', wrong: ['1/(k(k + 1))', '1/(k + 2)', '(k + 1)/(k + 2)'] },
  ];
  const DIVS = [
    { e: '7^n − 1', d: 6, b: 7, c: -1, re: '7(7^k − 1) + 6', wrong: ['7(7^k − 1) − 6', '7^k − 1 + 7', '7(7^k − 1) + 1'] },
    { e: '5^n + 3', d: 4, b: 5, c: 3, re: '5(5^k + 3) − 12', wrong: ['5(5^k + 3) + 12', '5(5^k + 3) − 3', '5^k + 3 + 5'] },
    { e: '3^{2n} − 1', d: 8, b: 9, c: -1, re: '9(3^{2k} − 1) + 8', wrong: ['3(3^{2k} − 1) + 2', '9(3^{2k} − 1) − 8', '9(3^{2k} − 1) + 1'] },
    { e: '11^n − 6', d: 5, b: 11, c: -6, re: '11(11^k − 6) + 60', wrong: ['11(11^k − 6) − 60', '11(11^k − 6) + 6', '11^k − 6 + 11'] },
  ];
  induction.bank = [
    function series() {
      const S = pick(SERIES), n = ri(3, 8), val = S.v(n);
      return {
        level: 'S', tags: ['3.1'], stem: `Prove by induction that Σ_{r=1}^{n} ${S.s} = ${S.f}.`,
        parts: [
          P('a', `Check: find the sum when n = ${n}${Number.isInteger(val) ? '' : ' (as a fraction)'}.`, 'num', val, Number.isInteger(val) ? String(val) : frac(n, n + 1), [`Use the formula with n = ${n}`, `= ${Number.isInteger(val) ? val : frac(n, n + 1)}`]),
          CH('b', 'In the k + 1 step, which term is added to the sum up to k?', S.t(), S.wrong, ['Replace r with k + 1 in the general term'], 1),
        ],
      };
    },
    function divisibility() {
      const D = pick(DIVS), n = ri(1, 4), val = D.b ** n + D.c;
      return {
        level: 'S', tags: ['3.2'], stem: `Prove by induction that ${D.e} is divisible by ${D.d} for all integers n ≥ 1.`,
        parts: [
          P('a', `Find the value of ${D.e} when n = ${n}.`, 'num', val, String(val), [`= ${val}, and ${val} ÷ ${D.d} = ${val / D.d} ✓`]),
          CH('b', 'In the k + 1 step, the expression is best rewritten as…', D.re, D.wrong, ['Pull out the assumed expression, then fix the constant'], 2),
        ],
      };
    },
    function inequality() {
      const n = ri(5, 9);
      return {
        level: 'C', tags: ['3.3'], stem: 'Consider the claim 2^n > n^2.',
        parts: [
          P('a', 'What is the smallest n ≥ 2 for which it holds and keeps holding for every larger n?', 'num', 5, '5', ['n = 2: 4 > 4 false; n = 3: 8 > 9 false; n = 4: 16 > 16 false', 'n = 5: 32 > 25 true, and it stays true'], 2),
          P('b', `Find 2^${n} − ${n}^2.`, 'num', 2 ** n - n * n, String(2 ** n - n * n), [`${2 ** n} − ${n * n}`]),
        ],
      };
    },
    function recursive() {
      const m = ri(2, 3), c = ri(1, 4), n = ri(3, 6);
      // a1 = c, a_{n+1} = m a_n  → a_n = c m^{n-1}; also a1 = 1, a_{n+1} = 2a_n + 1 → 2^n − 1
      const useGeo = Math.random() < 0.5;
      const val = useGeo ? c * m ** (n - 1) : 2 ** n - 1;
      return {
        level: 'C', tags: ['3.4'], stem: useGeo ? `A sequence has a₁ = ${c} and a_{n+1} = ${m}aₙ.` : 'A sequence has a₁ = 1 and a_{n+1} = 2aₙ + 1.',
        parts: [
          P('a', `Find a_${n}.`, 'num', val, String(val), useGeo ? [`Each term is ${m} times the last`, `a_${n} = ${c} × ${m}^${n - 1} = ${val}`] : ['1, 3, 7, 15, …', `a_${n} = 2^${n} − 1 = ${val}`]),
          CH('b', 'Which closed form would you prove by induction?', useGeo ? `aₙ = ${c === 1 ? '' : c + ' × '}${m}^{n−1}` : 'aₙ = 2^n − 1', useGeo ? [`aₙ = ${c === 1 ? '' : c + ' × '}${m}^n`, `aₙ = ${m}n + ${c}`, `aₙ = ${c + m}^{n−1}`] : ['aₙ = 2^n + 1', 'aₙ = 2n − 1', 'aₙ = 2^{n−1}'], ['Check it matches the first few terms']),
        ],
      };
    },
  ];

  /* ================= 4. INTEGRATION ================= */
  const integration = finish({
    id: 'e2integration', subject: 'y12', title: 'Integration', chapter: 'Ext 2 · 4', hue: 'pink',
    blurb: 'Standard integrals, substitution, partial fractions, trig techniques, integration by parts and recurrences.',
    sections: [
      { code: '4.1', name: 'Standard integrals & completing the square', notes: ['∫ 1/(a^2 + x^2) dx = (1/a) tan^{-1}(x/a) + C.', '∫ 1/√(a^2 − x^2) dx = sin^{-1}(x/a) + C.', 'Complete the square to reach these forms: x^2 + 4x + 13 = (x + 2)^2 + 9.'], ex: ['∫ 1/(x^2 + 4x + 13) dx', '= ∫ 1/((x + 2)^2 + 9) dx', '= (1/3) tan^{-1}((x + 2)/3) + C'] },
      { code: '4.2', name: 'Reverse chain rule & u-substitution', notes: ['∫ f\'(x)[f(x)]^n dx = [f(x)]^{n+1}/(n + 1) + C.', '∫ f\'(x)/f(x) dx = ln|f(x)| + C.', 'With u = g(x): replace dx using du = g\'(x) dx, and change the limits for definite integrals.'], ex: ['∫ 2x(x^2 + 1)^4 dx', 'Let u = x^2 + 1, du = 2x dx', '= u^5/5 + C = (x^2 + 1)^5/5 + C'] },
      { code: '4.3', name: 'Partial fractions', notes: ['Split a proper rational function into simpler fractions: (px + q)/((x − a)(x − b)) = A/(x − a) + B/(x − b).', 'Find A and B by multiplying out and substituting x = a and x = b (the cover-up method).', 'Repeated factors need A/(x − a) + B/(x − a)^2; irreducible quadratics need (Ax + B)/(x^2 + c).', 'If the top\'s degree is not lower, divide first.'], ex: ['(5x + 1)/((x − 1)(x + 2))', 'x = 1: 6 = 3A, A = 2; x = −2: −9 = −3B, B = 3', '2/(x − 1) + 3/(x + 2)'] },
      { code: '4.4', name: 'Trigonometric integrals', notes: ['sin^2 x = (1 − cos 2x)/2 and cos^2 x = (1 + cos 2x)/2.', 'Odd powers: save one factor and use sin^2 x + cos^2 x = 1 with a substitution.', 'The t-substitution t = tan(x/2) gives sin x = 2t/(1 + t^2), cos x = (1 − t^2)/(1 + t^2), dx = 2 dt/(1 + t^2).'], ex: ['∫ cos^2 x dx', '= ∫ (1 + cos 2x)/2 dx', '= x/2 + (sin 2x)/4 + C'] },
      { code: '4.5', name: 'Integration by parts', notes: ['∫ u dv = uv − ∫ v du.', 'Choose u to be something that gets simpler when differentiated (LIATE: logs, inverse trig, algebra, trig, exponentials).', 'Sometimes you integrate by parts twice and solve for the integral (e.g. ∫ e^x sin x dx).'], ex: ['∫ x e^{2x} dx', 'u = x, dv = e^{2x} dx: uv = x e^{2x}/2', '− ∫ e^{2x}/2 dx → e^{2x}(2x − 1)/4 + C'] },
      { code: '4.6', name: 'Recurrence relations', notes: ['Define Iₙ = ∫ (something)^n dx and use parts to link Iₙ to I_{n−1} or I_{n−2}.', 'Classic: Iₙ = ∫_0^{π/2} sin^n x dx gives Iₙ = ((n − 1)/n) I_{n−2}, with I₀ = π/2 and I₁ = 1.', 'Then step down to the base cases to evaluate.'], ex: ['I₄ = ∫_0^{π/2} sin^4 x dx', 'I₄ = (3/4) I₂ = (3/4)(1/2) I₀', '= (3/8)(π/2) = 3π/16'] },
      { code: '4.7', name: 'Definite integrals', notes: ['Change limits when you substitute, so you never have to go back to x.', 'Odd functions over [−a, a] integrate to 0.', '∫_0^a f(x) dx = ∫_0^a f(a − x) dx is a handy trick for symmetric integrals.'], ex: ['∫_{-2}^{2} x^3 cos x dx', 'x^3 cos x is odd', '= 0'] },
    ],
    cards: [
      ['∫ 1/(a^2 + x^2) dx', '(1/a) tan^{-1}(x/a) + C'], ['∫ 1/√(a^2 − x^2) dx', 'sin^{-1}(x/a) + C'], ['∫ f\'(x)/f(x) dx', 'ln|f(x)| + C'], ['Integration by parts', '∫ u dv = uv − ∫ v du'],
      ['LIATE', 'Choose u: Logs, Inverse trig, Algebraic, Trig, Exponential'], ['sin^2 x', '(1 − cos 2x)/2'], ['cos^2 x', '(1 + cos 2x)/2'], ['t = tan(x/2): sin x', '2t/(1 + t^2)'],
      ['t = tan(x/2): dx', '2 dt/(1 + t^2)'], ['∫_0^{π/2} sin^n x dx recurrence', 'Iₙ = ((n − 1)/n) I_{n−2}'], ['Odd function over [−a, a]', 'Integral is 0'], ['Partial fractions with (x − a)^2', 'A/(x − a) + B/(x − a)^2'],
    ],
    concepts: [
      ['∫ 1/(9 + x^2) dx = ?', ['(1/3) tan^{-1}(x/3) + C', 'tan^{-1}(x/3) + C', '3 tan^{-1}(3x) + C', 'ln(9 + x^2) + C'], 0, ''],
      ['∫ 2x/(x^2 + 5) dx = ?', ['ln(x^2 + 5) + C', '2 ln(x^2 + 5) + C', 'x^2 ln(x^2 + 5) + C', '(1/√5) tan^{-1}(x/√5) + C'], 0, 'f\'(x)/f(x) form.'],
      ['For ∫ x ln x dx, the best choice of u is…', ['ln x', 'x', 'x ln x', '1'], 0, 'Logs come first in LIATE.'],
      ['∫_{-1}^{1} x^5 dx = ?', ['0', '1/3', '2/6', '1'], 0, 'Odd function over a symmetric interval.'],
      ['With t = tan(x/2), cos x = ?', ['(1 − t^2)/(1 + t^2)', '2t/(1 + t^2)', '(1 + t^2)/(1 − t^2)', '2/(1 + t^2)'], 0, ''],
      ['(3x + 5)/((x + 1)(x + 3)) splits into…', ['1/(x + 1) + 2/(x + 3)', '2/(x + 1) + 1/(x + 3)', '3/(x + 1) + 5/(x + 3)', '1/(x + 1) − 2/(x + 3)'], 0, 'x = −1: 2 = 2A; x = −3: −4 = −2B.'],
    ],
  });
  // (1/a) tan^{-1}((x − h)/a) + C, written tidily when a = 1
  const atan = (a, h) => (a === 1 ? `tan^{-1}(${lin(h)}) + C` : `(1/${a}) tan^{-1}((${lin(h)})/${a}) + C`);
  // A ln|x − p| + B ln|x − q| + C
  const lnSum = (A, p, B, q) => { const t = (c, r, first) => `${first ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c) + ' '}ln|${lin(-r)}|`; return t(A, p, true) + t(B, q, false) + ' + C'; };
  integration.bank = [
    function standard() {
      const a = ri(2, 6);
      return {
        level: 'F', tags: ['4.1'], stem: 'Standard integrals.',
        parts: [
          CH('a', `∫ 1/(${a * a} + x^2) dx`, `(1/${a}) tan^{-1}(x/${a}) + C`, [`tan^{-1}(x/${a}) + C`, `${a} tan^{-1}(x/${a}) + C`, `(1/${a}) sin^{-1}(x/${a}) + C`], [`Standard form with a = ${a}`]),
          CH('b', `∫ 1/√(${a * a} − x^2) dx`, `sin^{-1}(x/${a}) + C`, [`(1/${a}) sin^{-1}(x/${a}) + C`, `cos^{-1}(x/${a}) + C`, `(1/${a}) tan^{-1}(x/${a}) + C`], [`Standard form with a = ${a}`]),
          P('c', `Evaluate ∫_0^{${a}} 1/(${a * a} + x^2) dx, correct to 3 decimal places.`, 'num', rnd(Math.PI / (4 * a), 3), num(Math.PI / (4 * a), 3), [`= (1/${a})[tan^{-1}(x/${a})]_0^{${a}}`, `= (1/${a})(π/4) = π/${4 * a}`, `≈ ${num(Math.PI / (4 * a), 3)}`], 1, { round: 3 }),
        ],
      };
    },
    function completeSquare() {
      const h = rnz(-4, 4), a = ri(1, 4), b = 2 * h, c = h * h + a * a;
      const quad = `x^2 ${b < 0 ? '−' : '+'} ${Math.abs(b)}x + ${c}`;
      return {
        level: 'S', tags: ['4.1'], stem: `Find ∫ 1/(${quad}) dx.`,
        parts: [
          CH('a', 'Complete the square in the denominator.', `(${lin(h)})^2 + ${a * a}`, [`(${lin(-h)})^2 + ${a * a}`, `(${lin(h)})^2 + ${c}`, `(${lin(b)})^2 + ${a * a}`], [`x^2 ${b < 0 ? '−' : '+'} ${Math.abs(b)}x + ${h * h} + ${a * a}`, `= (${lin(h)})^2 + ${a * a}`]),
          CH('b', 'Hence find the integral.', atan(a, h), [atan(a, -h), a === 1 ? `tan^{-1}(${lin(h)})/2 + C` : `tan^{-1}((${lin(h)})/${a * a}) + C`, a === 1 ? `ln((${lin(h)})^2 + 1) + C` : `${a} tan^{-1}(${a}(${lin(h)})) + C`], [`Let u = ${lin(h)}: ∫ 1/(u^2 + ${a * a}) du`], 2),
        ],
      };
    },
    function partialFractions() {
      let p, q; do { p = rnz(-4, 4); q = rnz(-4, 4); } while (p === q);
      const A = rnz(-4, 4), B = rnz(-4, 4), m = A + B, n = -(A * q + B * p);
      if (m === 0) return partialFractions();
      const top = `${m === 1 ? '' : m === -1 ? '−' : neg(m)}x${n === 0 ? '' : n < 0 ? ' − ' + -n : ' + ' + n}`;
      return {
        level: 'S', tags: ['4.3'], stem: `Write (${top})/((${lin(-p)})(${lin(-q)})) = A/(${lin(-p)}) + B/(${lin(-q)}).`,
        parts: [
          P('a', 'Find A.', 'num', A, neg(A), [`${top} = A(${lin(-q)}) + B(${lin(-p)})`, `x = ${neg(p)}: ${neg(m * p + n)} = ${neg(p - q)}A, A = ${neg(A)}`]),
          P('b', 'Find B.', 'num', B, neg(B), [`x = ${neg(q)}: ${neg(m * q + n)} = ${neg(q - p)}B, B = ${neg(B)}`]),
          CH('c', 'Hence find the integral of the original fraction.', lnSum(A, p, B, q), [lnSum(B, p, A, q), lnSum(-A, p, -B, q), `ln|(${lin(-p)})(${lin(-q)})| + C`], ['∫ A/(x − a) dx = A ln|x − a|'], 2),
        ],
      };
    },
    function byParts() {
      const k = ri(2, 5), b = ri(1, 3), val = (b - 1) * Math.exp(b) + 1;
      return {
        level: 'S', tags: ['4.5'], stem: 'Integration by parts.',
        parts: [
          CH('a', `∫ x e^{${k}x} dx`, `e^{${k}x}(${k}x − 1)/${k * k} + C`, [`e^{${k}x}(${k}x + 1)/${k * k} + C`, `x e^{${k}x}/${k} + C`, `e^{${k}x}(x − 1)/${k} + C`], [`u = x, dv = e^{${k}x} dx → v = e^{${k}x}/${k}`, `x e^{${k}x}/${k} − ∫ e^{${k}x}/${k} dx`, `= x e^{${k}x}/${k} − e^{${k}x}/${k * k} + C`], 2),
          P('b', `Evaluate ∫_0^{${b}} x e^x dx, correct to 3 decimal places.`, 'num', rnd(val, 3), num(val, 3), [`= [x e^x − e^x]_0^{${b}} = [(x − 1)e^x]_0^{${b}}`, `= ${b - 1}e^{${b}} − (−1) ≈ ${num(val, 3)}`], 1, { round: 3 }),
        ],
      };
    },
    function substitution() {
      const c = ri(1, 9), n = ri(2, 6);
      return {
        level: 'F', tags: ['4.2'], stem: 'Use the reverse chain rule or a substitution.',
        parts: [
          CH('a', `∫ 2x(x^2 + ${c})^${n} dx`, `(x^2 + ${c})^{${n + 1}}/${n + 1} + C`, [`(x^2 + ${c})^{${n + 1}} + C`, `(x^2 + ${c})^{${n + 1}}/${2 * (n + 1)} + C`, `2(x^2 + ${c})^{${n + 1}}/${n + 1} + C`], [`u = x^2 + ${c}, du = 2x dx`, `∫ u^${n} du = u^{${n + 1}}/${n + 1} + C`]),
          CH('b', `∫ ${2 * c}x/(x^2 + ${c}) dx`, `${c} ln(x^2 + ${c}) + C`, [`ln(x^2 + ${c}) + C`, `${2 * c} ln(x^2 + ${c}) + C`, `${c} tan^{-1}(x/${c}) + C`], [`${2 * c}x = ${c} × 2x, and 2x is the derivative of x^2 + ${c}`, `= ${c} ln(x^2 + ${c}) + C`]),
        ],
      };
    },
    function recurrence() {
      const n = ri(2, 7);
      const I = (k) => (k === 0 ? Math.PI / 2 : k === 1 ? 1 : ((k - 1) / k) * I(k - 2));
      return {
        level: 'C', tags: ['4.6'], stem: `Let Iₙ = ∫_0^{π/2} sin^n x dx, where Iₙ = ((n − 1)/n) I_{n−2}.`,
        parts: [
          P('a', 'Find I₁.', 'num', 1, '1', ['∫_0^{π/2} sin x dx = [−cos x]_0^{π/2} = 0 − (−1) = 1']),
          P('b', `Find I_${n}, correct to 3 decimal places.`, 'num', rnd(I(n), 3), num(I(n), 3), [`Step down: I_${n} = ${frac(n - 1, n)} I_${n - 2} …`, `ends at I_${n % 2} = ${n % 2 ? '1' : 'π/2'}`, `≈ ${num(I(n), 3)}`], 2, { round: 3 }),
        ],
      };
    },
    function trigPowers() {
      const k = ri(1, 4);
      return {
        level: 'S', tags: ['4.4', '4.7'], stem: 'Trigonometric integrals.',
        parts: [
          CH('a', `∫ sin^2(${k === 1 ? '' : k}x) dx`, `x/2 − sin(${2 * k}x)/${4 * k} + C`, [`x/2 + sin(${2 * k}x)/${4 * k} + C`, `x/2 − cos(${2 * k}x)/${4 * k} + C`, `sin^3(${k === 1 ? '' : k}x)/3 + C`], [`sin^2 θ = (1 − cos 2θ)/2`, `∫ (1 − cos ${2 * k}x)/2 dx = x/2 − sin(${2 * k}x)/${4 * k} + C`]),
          P('b', `Evaluate ∫_0^{π} sin^2 x dx, correct to 3 decimal places.`, 'num', rnd(Math.PI / 2, 3), num(Math.PI / 2, 3), ['[x/2 − sin 2x/4]_0^{π} = π/2', '≈ 1.571'], 1, { round: 3 }),
          P('c', `Evaluate ∫_{-${k}}^{${k}} x^3 cos x dx.`, 'num', 0, '0', ['x^3 cos x is odd', 'Odd function over a symmetric interval → 0']),
        ],
      };
    },
  ];

  /* ================= 5. VECTORS ================= */
  const vectors = finish({
    id: 'e2vectors', subject: 'y12', title: 'Vectors', chapter: 'Ext 2 · 5', hue: 'green',
    blurb: '3D vectors, dot product, geometric proofs, vector equations of lines, spheres and curves.',
    sections: [
      { code: '5.1', name: 'Three dimensional vectors', notes: ['a = xi + yj + zk, also written as the column (x, y, z).', '|a| = √(x^2 + y^2 + z^2). The unit vector in the direction of a is a/|a|.', 'AB→ = OB→ − OA→ (end minus start).'], ex: ['|2i − 3j + 6k|', '√(4 + 9 + 36)', '= √49 = 7'] },
      { code: '5.2', name: 'Dot product & geometric proofs', notes: ['a · b = x₁x₂ + y₁y₂ + z₁z₂ = |a||b| cos θ.', 'a · b = 0 (non-zero vectors) means a ⊥ b. a · a = |a|^2.', 'Parallel vectors are scalar multiples: a = λb.', 'Use these to prove geometry results, e.g. diagonals of a rhombus are perpendicular.'], ex: ['Angle between (1, 2, 2) and (2, 1, −2)', 'a · b = 2 + 2 − 4 = 0', 'θ = 90°'] },
      { code: '5.3', name: 'Vector equation of a line', notes: ['A line through point A with direction d: r = a + λd, λ any real number.', 'Through A and B: r = a + λ(b − a).', 'Parametric form: x = a₁ + λd₁, y = a₂ + λd₂, z = a₃ + λd₃.'], ex: ['Line through (1, 0, 2) and (3, 1, 5)', 'd = (2, 1, 3)', 'r = (1, 0, 2) + λ(2, 1, 3)'] },
      { code: '5.4', name: 'Properties of lines', notes: ['Lines are parallel if their directions are scalar multiples.', 'To test if a point is on a line, solve for λ in each coordinate: one consistent λ means yes.', 'Lines intersect if one pair (λ, μ) satisfies all three coordinate equations; otherwise in 3D they may be skew.'], ex: ['Is (5, 2, 8) on r = (1, 0, 2) + λ(2, 1, 3)?', 'x: λ = 2; y: λ = 2; z: λ = 2', 'Yes, λ = 2'] },
      { code: '5.5', name: 'Spheres and curves', notes: ['|r − c| = R is a sphere (in 3D) or circle (in 2D) with centre c and radius R.', 'Expanded: (x − a)^2 + (y − b)^2 + (z − c)^2 = R^2.', 'Vector functions like r(t) = (cos t)i + (sin t)j trace curves: eliminate t to get the Cartesian equation.'], ex: ['r(t) = 3 cos t i + 3 sin t j', 'x^2 + y^2 = 9cos^2 t + 9 sin^2 t', 'Circle radius 3'] },
    ],
    cards: [
      ['|xi + yj + zk|', '√(x^2 + y^2 + z^2)'], ['Unit vector of a', 'a/|a|'], ['AB→', 'b − a'], ['a · b (components)', 'x₁x₂ + y₁y₂ + z₁z₂'],
      ['a · b (angle)', '|a||b| cos θ'], ['a · b = 0 means', 'Perpendicular (if both non-zero)'], ['Parallel vectors', 'a = λb'], ['Line through A, direction d', 'r = a + λd'],
      ['Sphere centre c radius R', '|r − c| = R'], ['Skew lines', 'Not parallel and never meet (3D only)'],
    ],
    concepts: [
      ['|i + 2j − 2k| = ?', ['3', '5', '9', '1'], 0, '√(1 + 4 + 4) = 3.'],
      ['If a · b = 0 and both are non-zero, the vectors are…', ['Perpendicular', 'Parallel', 'Equal', 'Opposite'], 0, ''],
      ['(2, −1, 3) · (1, 4, 2) = ?', ['4', '10', '0', '−4'], 0, '2 − 4 + 6 = 4.'],
      ['Which is parallel to (1, −2, 3)?', ['(−2, 4, −6)', '(2, 4, 6)', '(3, −2, 1)', '(1, 2, 3)'], 0, '−2 times the vector.'],
      ['r = (1, 2, 3) + λ(0, 1, 0) is a line parallel to the…', ['y-axis', 'x-axis', 'z-axis', 'xy-plane only'], 0, ''],
      ['|r − (1, 0, 2)| = 4 is a sphere with radius…', ['4', '2', '16', '√5'], 0, ''],
    ],
  });
  const VTRIPLES = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [3, 4, 12, 13], [6, 6, 7, 11], [2, 10, 11, 15]];
  vectors.bank = [
    function magnitude() {
      const [x, y, z, m] = pick(VTRIPLES), v = shuffle([x, y, z]).map(c => c * pick([1, -1]));
      return {
        level: 'F', tags: ['5.1'], stem: `Let a = ${vecIJK(v)}.`,
        parts: [
          P('a', 'Find |a|.', 'num', m, String(m), [`√(${v.map(c => c * c).join(' + ')}) = √${m * m}`, `= ${m}`]),
          P('b', 'Find the i-component of the unit vector in the direction of a.', 'num', v[0] / m, frac(v[0], m), [`â = a/|a| = (1/${m})a`, `i-component = ${neg(v[0])}/${m}`]),
        ],
      };
    },
    function dotProduct() {
      const b = [rnz(-4, 4), rnz(-4, 4), ri(-4, 4)], perp = Math.random() < 0.4;
      const a = perp ? [b[1], -b[0], 0] : [rnz(-4, 4), ri(-4, 4), rnz(-4, 4)];
      if (dot(a, b) !== 0 && perp) return dotProduct();
      const d = dot(a, b), angle = Math.acos(Math.max(-1, Math.min(1, d / (mag(a) * mag(b))))) * 180 / Math.PI; // clamp: rounding can push cos past ±1
      return {
        level: 'S', tags: ['5.2'], stem: `Let a = ${vec(a)} and b = ${vec(b)}.`,
        parts: [
          P('a', 'Find a · b.', 'num', d, neg(d), [`${a.map((x, i) => `(${neg(x)})(${neg(b[i])})`).join(' + ')}`, `= ${neg(d)}`]),
          CH('b', 'Are a and b perpendicular?', d === 0 ? 'Yes' : 'No', [d === 0 ? 'No' : 'Yes'], [d === 0 ? 'a · b = 0, so they are perpendicular' : 'a · b ≠ 0, so they are not perpendicular']),
          P('c', 'Find the angle between a and b, to the nearest degree.', 'num', Math.round(angle), `${Math.round(angle)}°`, [`cos θ = a · b / (|a||b|) = ${neg(d)}/(√${dot(a, a)} × √${dot(b, b)})`, `θ ≈ ${num(angle, 1)}°`], 2, { round: 0 }),
        ],
      };
    },
    function lineThrough() {
      const A = [ri(-3, 4), ri(-3, 4), ri(-3, 4)], d = [rnz(-3, 3), rnz(-3, 3), rnz(-3, 3)], B = A.map((c, i) => c + d[i]);
      const lam = rnz(-3, 3), on = Math.random() < 0.5, C = A.map((c, i) => c + lam * d[i] + (on || i !== 1 ? 0 : 1));
      return {
        level: 'S', tags: ['5.3', '5.4'], stem: `A line passes through A${vec(A)} and B${vec(B)}.`,
        parts: [
          P('a', 'Find the x-component of the direction vector AB→.', 'num', d[0], neg(d[0]), [`B − A = ${vec(d)}`]),
          P('b', 'Find the z-component of AB→.', 'num', d[2], neg(d[2]), [`${neg(B[2])} − (${neg(A[2])}) = ${neg(d[2])}`]),
          CH('c', `Does the point ${vec(C)} lie on the line r = ${vec(A)} + λ${vec(d)}?`, on ? 'Yes' : 'No', [on ? 'No' : 'Yes'], on ? [`λ = ${neg(lam)} works in all three coordinates`] : [`x and z give λ = ${neg(lam)}, but y gives a different value`], 2),
        ],
      };
    },
    function unknowns() {
      const b = [rnz(-3, 3), rnz(-3, 3), rnz(-3, 3)], k = rnz(-3, 3), a = b.map(c => c * k);
      const c = [rnz(-4, 4), rnz(-4, 4), rnz(-4, 4)], rest = c[1] * b[1] + c[2] * b[2], pp = b[0]; // (m, c1, c2) ⊥ b
      const solvable = -rest % pp === 0;
      const m = -rest / pp;
      return {
        level: 'C', tags: ['5.2'], stem: 'Parallel and perpendicular vectors.',
        parts: [
          P('a', `(${neg(a[0])}, y, ${neg(a[2])}) is parallel to ${vec(b)}. Find y.`, 'num', a[1], neg(a[1]), [`The scale factor is ${neg(a[0])} ÷ ${neg(b[0])} = ${neg(k)}`, `y = ${neg(k)} × ${neg(b[1])} = ${neg(a[1])}`], 2),
          P('b', `(m, ${neg(c[1])}, ${neg(c[2])}) is perpendicular to ${vec(b)}. Find m${solvable ? '' : ' (as a fraction)'}.`, 'num', m, solvable ? neg(m) : frac(-rest, pp), [`${neg(b[0])}m + (${neg(c[1])})(${neg(b[1])}) + (${neg(c[2])})(${neg(b[2])}) = 0`, `${neg(b[0])}m ${rest < 0 ? '−' : '+'} ${Math.abs(rest)} = 0`, `m = ${solvable ? neg(m) : frac(-rest, pp)}`], 2),
        ],
      };
    },
    function sphere() {
      const c = [ri(-4, 4), ri(-4, 4), ri(-4, 4)], R = ri(2, 7);
      const term = (v, n) => (v === 0 ? `${n}^2` : `(${n} ${v < 0 ? '+' : '−'} ${Math.abs(v)})^2`);
      return {
        level: 'S', tags: ['5.5'], stem: `A sphere has equation ${term(c[0], 'x')} + ${term(c[1], 'y')} + ${term(c[2], 'z')} = ${R * R}.`,
        parts: [
          P('a', 'What is its radius?', 'num', R, String(R), [`R^2 = ${R * R}, so R = ${R}`]),
          P('b', 'What is the x-coordinate of its centre?', 'num', c[0], neg(c[0]), [`(x − a)^2 has centre x = a`, `a = ${neg(c[0])}`]),
          CH('c', `Is the point ${vec([c[0] + R, c[1], c[2]])} on the sphere?`, 'Yes', ['No'], [`Its distance from the centre is ${R}, the radius`]),
        ],
      };
    },
  ];

  /* ================= 6. MECHANICS ================= */
  const mechanics = finish({
    id: 'e2mechanics', subject: 'y12', title: 'Mechanics', chapter: 'Ext 2 · 6', hue: 'coral',
    blurb: 'Motion in a line, simple harmonic motion, resisted motion and projectiles with and without resistance.',
    sections: [
      { code: '6.1', name: 'Motion in a straight line', notes: ['v = dx/dt and a = dv/dt = d^2x/dt^2.', 'Other forms of acceleration: a = v dv/dx = d/dx(½v^2). Use these when a is given in terms of x.', 'Newton\'s second law: F = ma. Draw a force diagram and choose a positive direction.'], ex: ['x = t^3 − 6t^2 + 9t. When is it at rest?', 'v = 3t^2 − 12t + 9 = 3(t − 1)(t − 3)', 't = 1 and t = 3'] },
      { code: '6.2', name: 'Simple harmonic motion', notes: ['SHM: ẍ = −n^2(x − c), centre c.', 'Solutions: x = c + A cos(nt + α). Amplitude A, period T = 2π/n.', 'v^2 = n^2(A^2 − (x − c)^2). Maximum speed nA at the centre; maximum acceleration n^2A at the extremes.'], ex: ['x = 5 cos 2t. Max speed?', 'n = 2, A = 5', 'v_max = nA = 10'] },
      { code: '6.3', name: 'Horizontal resisted motion', notes: ['Resistance opposes motion: ẍ = −kv or ẍ = −kv^2 (k > 0).', 'For ẍ = −kv: v = Ve^{−kt}, and the particle travels a total distance V/k.', 'Separate variables: dt = dv/(−kv), or use v dv/dx for distance.'], ex: ['ẍ = −0.5v, V = 10. Time to halve speed?', 'v = 10e^{−0.5t} = 5', 't = 2 ln 2 ≈ 1.386 s'] },
      { code: '6.4', name: 'Vertical resisted motion', notes: ['Falling with resistance kv: ẍ = g − kv (down positive). Terminal velocity v_T = g/k.', 'With resistance kv^2: v_T = √(g/k).', 'Going up, gravity and resistance act together; coming down, they oppose.'], ex: ['g = 10, resistance 0.2v. Terminal velocity?', 'ẍ = 0 when 10 = 0.2v', 'v_T = 50 m/s'] },
      { code: '6.5', name: 'Projectile motion', notes: ['Without resistance (launch speed V, angle θ): x = Vt cos θ, y = Vt sin θ − ½gt^2.', 'Time of flight 2V sin θ/g; maximum height V^2 sin^2 θ/(2g); range V^2 sin 2θ/g (max at 45°).', 'Cartesian path: y = x tan θ − gx^2/(2V^2 cos^2 θ).', 'With resistance, resolve horizontally and vertically and solve each differential equation.'], ex: ['V = 20, θ = 30°, g = 10. Range?', '400 × sin 60° / 10', '= 20√3 ≈ 34.64 m'] },
    ],
    cards: [
      ['Acceleration forms', 'dv/dt = v dv/dx = d/dx(½v^2)'], ['SHM equation', 'ẍ = −n^2(x − c)'], ['SHM period', '2π/n'], ['SHM speed', 'v^2 = n^2(A^2 − (x − c)^2)'],
      ['SHM max speed', 'nA (at the centre)'], ['Resistance kv: speed', 'v = Ve^{−kt}'], ['Terminal velocity (kv)', 'g/k'], ['Terminal velocity (kv^2)', '√(g/k)'],
      ['Projectile range', 'V^2 sin 2θ / g'], ['Projectile max height', 'V^2 sin^2 θ / (2g)'], ['Time of flight', '2V sin θ / g'], ['Newton\'s second law', 'F = ma'],
    ],
    concepts: [
      ['x = 3 sin(4t) has period…', ['π/2', '4π', '2π', 'π/4'], 0, '2π/4 = π/2.'],
      ['In SHM, the speed is greatest…', ['At the centre', 'At the extremes', 'Halfway to the extreme', 'It is constant'], 0, ''],
      ['Which form of acceleration suits a given as a function of x?', ['v dv/dx', 'dv/dt', 'dx/dt', 'd^2t/dx^2'], 0, ''],
      ['The range of a projectile is greatest at…', ['45°', '30°', '60°', '90°'], 0, 'sin 2θ is maximum when 2θ = 90°.'],
      ['Falling with resistance kv, terminal velocity is…', ['g/k', '√(g/k)', 'gk', 'k/g'], 0, 'Set ẍ = g − kv = 0.'],
      ['With ẍ = −kv, the particle…', ['Slows forever and travels a finite distance', 'Stops after finite time', 'Speeds up', 'Moves in SHM'], 0, 'v = Ve^{−kt} never reaches 0, but distance → V/k.'],
    ],
  });
  mechanics.bank = [
    function motion() {
      const p = ri(1, 3), q = ri(-6, 6), r = ri(-9, 9), t = ri(1, 4);
      const x = `${p === 1 ? '' : p}t^3 ${q < 0 ? '−' : '+'} ${Math.abs(q)}t^2 ${r < 0 ? '−' : '+'} ${Math.abs(r)}t`;
      return {
        level: 'F', tags: ['6.1'], stem: `A particle moves so that x = ${x} (metres, seconds).`,
        parts: [
          P('a', `Find its velocity when t = ${t}.`, 'num', 3 * p * t * t + 2 * q * t + r, `${neg(3 * p * t * t + 2 * q * t + r)} m/s`, [`v = dx/dt = ${3 * p}t^2 ${2 * q < 0 ? '−' : '+'} ${Math.abs(2 * q)}t ${r < 0 ? '−' : '+'} ${Math.abs(r)}`, `v(${t}) = ${neg(3 * p * t * t + 2 * q * t + r)}`]),
          P('b', `Find its acceleration when t = ${t}.`, 'num', 6 * p * t + 2 * q, `${neg(6 * p * t + 2 * q)} m/s^2`, [`a = dv/dt = ${6 * p}t ${2 * q < 0 ? '−' : '+'} ${Math.abs(2 * q)}`, `a(${t}) = ${neg(6 * p * t + 2 * q)}`]),
        ],
      };
    },
    function shm() {
      const A = ri(2, 8), n = ri(2, 5), c = ri(-3, 3), d = ri(1, A - 1), v = n * Math.sqrt(A * A - d * d);
      const xe = c === 0 ? `${A} cos(${n}t)` : `${neg(c)} + ${A} cos(${n}t)`;
      return {
        level: 'S', tags: ['6.2'], stem: `A particle moves in SHM with x = ${xe} (metres, seconds).`,
        parts: [
          P('a', 'What is the centre of motion?', 'num', c, `x = ${neg(c)}`, ['x = c + A cos(nt): centre c', `= ${neg(c)}`]),
          P('b', 'Find the period, correct to 2 decimal places.', 'num', rnd(2 * Math.PI / n, 2), `${num(2 * Math.PI / n, 2)} s`, [`T = 2π/n = 2π/${n}`, `≈ ${num(2 * Math.PI / n, 2)}`], 1, { round: 2 }),
          P('c', 'Find the maximum speed.', 'num', n * A, `${n * A} m/s`, [`v_max = nA = ${n} × ${A}`]),
          P('d', `Find the speed when the particle is ${d} m from the centre, correct to 2 decimal places.`, 'num', rnd(v, 2), `${num(v, 2)} m/s`, [`v^2 = n^2(A^2 − d^2) = ${n * n}(${A * A} − ${d * d})`, `v = ${n}√${A * A - d * d} ≈ ${num(v, 2)}`], 2, { round: 2 }),
        ],
      };
    },
    function projectile() {
      const V = pick([20, 30, 40, 50]), th = pick([30, 45, 60]), g = 10, s = Math.sin(th * Math.PI / 180);
      const T = 2 * V * s / g, H = V * V * s * s / (2 * g), R = V * V * Math.sin(2 * th * Math.PI / 180) / g;
      return {
        level: 'S', tags: ['6.5'], stem: `A ball is projected from the ground at ${V} m/s at ${th}° to the horizontal. Take g = 10 m/s^2 and ignore air resistance. Give answers to 2 decimal places.`,
        parts: [
          P('a', 'Find the time of flight.', 'num', rnd(T, 2), `${num(T, 2)} s`, [`T = 2V sin θ / g = 2(${V}) sin ${th}° / 10`, `≈ ${num(T, 2)} s`], 1, { round: 2 }),
          P('b', 'Find the maximum height.', 'num', rnd(H, 2), `${num(H, 2)} m`, [`H = V^2 sin^2 θ / (2g)`, `= ${V * V} × ${num(s * s, 3)} / 20 ≈ ${num(H, 2)} m`], 1, { round: 2 }),
          P('c', 'Find the horizontal range.', 'num', rnd(R, 2), `${num(R, 2)} m`, [`R = V^2 sin 2θ / g = ${V * V} sin ${2 * th}° / 10`, `≈ ${num(R, 2)} m`], 2, { round: 2 }),
        ],
      };
    },
    function resisted() {
      const k = pick([0.1, 0.2, 0.25, 0.5]), V = pick([10, 20, 30, 40]), t = ri(1, 4), vt = V * Math.exp(-k * t);
      return {
        level: 'C', tags: ['6.3'], stem: `A boat moving at ${V} m/s cuts its engine. The water slows it so that ẍ = −${k}v.`,
        parts: [
          P('a', `Find its speed after ${t} s, to 2 decimal places.`, 'num', rnd(vt, 2), `${num(vt, 2)} m/s`, [`dv/dt = −${k}v gives v = ${V}e^{−${k}t}`, `v(${t}) = ${V}e^{−${num(k * t, 2)}} ≈ ${num(vt, 2)}`], 2, { round: 2 }),
          P('b', 'How long until its speed has halved? (3 decimal places)', 'num', rnd(Math.log(2) / k, 3), `${num(Math.log(2) / k, 3)} s`, [`${V / 2} = ${V}e^{−${k}t}`, `t = ln 2 / ${k} ≈ ${num(Math.log(2) / k, 3)}`], 1, { round: 3 }),
          P('c', 'How far does it travel before (theoretically) stopping?', 'num', V / k, `${num(V / k, 2)} m`, ['v dv/dx = −kv, so dv/dx = −k', `x = (V − v)/k → V/k = ${V}/${k} = ${num(V / k, 2)} m`]),
        ],
      };
    },
    function terminal() {
      const g = 10, k = pick([0.02, 0.04, 0.05, 0.1, 0.2, 0.25, 0.4, 0.5]), quad = Math.random() < 0.5;
      const vT = quad ? Math.sqrt(g / k) : g / k;
      return {
        level: 'C', tags: ['6.4'], stem: `An object falls from rest. Air resistance is ${quad ? `${k}v^2` : `${k}v`} per unit mass and g = 10 m/s^2.`,
        parts: [
          CH('a', 'Which equation of motion is correct (down positive)?', `ẍ = 10 − ${k}v${quad ? '^2' : ''}`, [`ẍ = −10 − ${k}v${quad ? '^2' : ''}`, `ẍ = 10 + ${k}v${quad ? '^2' : ''}`, `ẍ = ${k}v${quad ? '^2' : ''} − 10`], ['Gravity acts down (+), resistance opposes the downward motion (−)']),
          P('b', 'Find the terminal velocity, to 2 decimal places.', 'num', rnd(vT, 2), `${num(vT, 2)} m/s`, [`Set ẍ = 0: ${k}v${quad ? '^2' : ''} = 10`, `v = ${quad ? `√(10/${k})` : `10/${k}`} ≈ ${num(vT, 2)}`], 2, { round: 2 }),
        ],
      };
    },
  ];

  return { DECKS: [proof, complex, induction, integration, vectors, mechanics] };
})();
if (typeof module !== 'undefined') module.exports = E2;
