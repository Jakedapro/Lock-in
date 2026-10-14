/* ===== Lock In — Year 12 Mathematics Extension 2 =====
   Topics follow the NSW Extension 2 syllabus. All notes and questions are original;
   every generated question carries its exact answer and working. Maths is written as
   TeX between $ signs and typeset in the page. */

const E2 = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const rnz = (a, b) => { let v; do { v = ri(a, b); } while (v === 0); return v; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const rnd = (x, dp) => Math.round(x * 10 ** dp) / 10 ** dp;
  const P = (label, q, type, value, show, steps, marks = 1, extra = {}) => ({ label, q, type, value, show, steps, marks, ...extra });
  function CH(label, q, right, wrongs, steps, marks = 1, extra = {}) {
    const opts = [String(right), ...[...new Set(wrongs.map(String))].filter(w => w !== String(right))].slice(0, 4);
    const choices = shuffle(opts);
    return { label, q, type: 'choice', choices, value: choices.indexOf(String(right)), show: String(right), steps, marks, ...extra };
  }
  const finish = (d) => { d.cards = d.cards.map(([q, a]) => ({ q, a })); d.concepts = d.concepts.map(([q, options, answer, why]) => ({ q, options, answer, why })); return d; };

  /* ---------- TeX builders (each returns TeX without the $ signs; m() wraps it) ---------- */
  const m = (t) => `$${t}$`;
  const dec = (x, dp = 3) => String(rnd(x, dp));
  const tf = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`; };
  const tlin = (c) => (c === 0 ? 'x' : c < 0 ? `x - ${-c}` : `x + ${c}`);
  const tcx = (a, b) => (b === 0 ? String(a) : a === 0 ? (b === 1 ? 'i' : b === -1 ? '-i' : `${b}i`) : `${a} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}i`);
  // Angles as whole twelfths of π (t·π/12), in lowest terms; principal value in (−π, π].
  const princ = (t) => { t = ((t % 24) + 24) % 24; return t > 12 ? t - 24 : t; };
  const ta = (t) => { if (t === 0) return '0'; const g = gcd(t, 12), q = 12 / g; let p = t / g; const s = p < 0 ? '-' : ''; p = Math.abs(p); const top = p === 1 ? '\\pi' : `${p}\\pi`; return s + (q === 1 ? top : `\\frac{${top}}{${q}}`); };
  const tvec = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
  const tpt = (v) => `(${v.join(', ')})`;
  const tijk = (v) => { const s = v.map((c, i) => [c, `\\mathbf{${'ijk'[i]}}`]).filter(([c]) => c !== 0).map(([c, u], i) => `${i === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${u}`).join(''); return s || '0'; };
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const mag = (a) => Math.sqrt(dot(a, a));

  /* ================= 1. THE NATURE OF PROOF ================= */
  const proof = finish({
    id: 'e2proof', subject: 'y12', title: 'The Nature of Proof', chapter: 'Ext 2 · 1', hue: 'lilac',
    blurb: 'Implication, contrapositive, contradiction, counterexamples and inequality proofs including AM–GM.',
    sections: [
      { code: '1.1', name: 'Language of proof', notes: ['$P \\Rightarrow Q$ means "if $P$ then $Q$". $P$ is the hypothesis, $Q$ the conclusion.', 'The converse of $P \\Rightarrow Q$ is $Q \\Rightarrow P$; it is a different statement and may be false.', '$P \\Leftrightarrow Q$ (if and only if) means both directions are true.', '$\\forall$ means "for all", $\\exists$ means "there exists". The negation of "$\\forall x,\\ P(x)$" is "$\\exists x$ such that not $P(x)$".'], ex: ['Negate: "every prime is odd"', '"For all primes $p$, $p$ is odd" becomes "there exists a prime that is not odd"', 'The negation is true: 2 is an even prime'] },
      { code: '1.2', name: 'Proof by contrapositive', notes: ['The contrapositive of $P \\Rightarrow Q$ is $\\neg Q \\Rightarrow \\neg P$. It is logically equivalent to the original.', 'Use it when "not $Q$" gives you something concrete to work with.', 'Example: to prove "if $n^2$ is even then $n$ is even", prove "if $n$ is odd then $n^2$ is odd": $(2k+1)^2 = 2(2k^2+2k)+1$.'], ex: ['Contrapositive of "if $xy$ is irrational then $x$ or $y$ is irrational"', 'Negate both parts and swap them', '"If $x$ and $y$ are both rational then $xy$ is rational"'] },
      { code: '1.3', name: 'Proof by contradiction', notes: ['Assume the statement is false, then reason until you reach something impossible.', 'Classic results: $\\sqrt{2}$ is irrational, and there are infinitely many primes.', 'Write the assumption clearly at the start and say "this is a contradiction" at the end.'], ex: ['Prove $\\sqrt{2}$ is irrational', 'Assume $\\sqrt{2} = \\frac{p}{q}$ in lowest terms, so $p^2 = 2q^2$ and $p$ is even', 'Then $q$ is even too, contradicting lowest terms'] },
      { code: '1.4', name: 'Equivalence and disproof', notes: ['To prove $P \\Leftrightarrow Q$, prove both directions.', 'One counterexample is enough to disprove a "for all" statement.', 'Examples alone never prove a "for all" statement, however many you check.'], ex: ['Disprove: $n^2 + n + 41$ is prime for all $n \\ge 1$', 'Try $n = 40$: $40^2 + 40 + 41 = 1681$', '$1681 = 41^2$, not prime'] },
      { code: '1.5', name: 'Inequality proofs', notes: ['Start from something known to be true, like $(a-b)^2 \\ge 0$, and rearrange.', 'Or work with LHS − RHS and show it is $\\ge 0$.', 'Be careful multiplying by negative quantities: the inequality flips.', 'Useful: $a^2 + b^2 \\ge 2ab$, with equality when $a = b$.'], ex: ['Prove $a^2 + b^2 \\ge 2ab$', '$(a-b)^2 \\ge 0$', '$a^2 - 2ab + b^2 \\ge 0$, so $a^2 + b^2 \\ge 2ab$'] },
      { code: '1.6', name: 'AM–GM inequality', notes: ['For positive $a$ and $b$: $\\dfrac{a+b}{2} \\ge \\sqrt{ab}$. Arithmetic mean ≥ geometric mean.', 'Equality holds only when $a = b$.', 'Great for minimum problems: for $x > 0$, $x + \\dfrac{k^2}{x} \\ge 2k$, with the minimum at $x = k$.', 'The $n$-variable version: $\\dfrac{a_1 + \\dots + a_n}{n} \\ge \\sqrt[n]{a_1 a_2 \\cdots a_n}$.'], ex: ['Minimum of $x + \\frac{9}{x}$ for $x > 0$', 'AM–GM: $x + \\frac{9}{x} \\ge 2\\sqrt{9} = 6$', 'Minimum 6, when $x = 3$'] },
    ],
    cards: [
      ['Converse of $P \\Rightarrow Q$', '$Q \\Rightarrow P$'], ['Contrapositive of $P \\Rightarrow Q$', '$\\neg Q \\Rightarrow \\neg P$ (equivalent to the original)'], ['Negation of $P \\Rightarrow Q$', '$P$ and $\\neg Q$'],
      ['Negation of $\\forall x,\\ P(x)$', '$\\exists x$ such that $\\neg P(x)$'], ['Proof by contradiction', 'Assume the opposite, reach an impossibility.'], ['Counterexample', 'One example that shows a "for all" statement is false.'],
      ['AM–GM (two numbers)', '$\\frac{a+b}{2} \\ge \\sqrt{ab}$ for $a, b \\ge 0$, equality when $a = b$'], ['Minimum of $x + \\frac{k^2}{x}$ ($x > 0$)', '$2k$, at $x = k$'], ['Starting point for many inequalities', '$(a-b)^2 \\ge 0$'], ['$P \\Leftrightarrow Q$ means', '$P \\Rightarrow Q$ and $Q \\Rightarrow P$'],
    ],
    concepts: [
      ['The contrapositive of "if $n$ is even then $n^2$ is even" is…', ['If $n^2$ is odd then $n$ is odd', 'If $n^2$ is even then $n$ is even', 'If $n$ is odd then $n^2$ is odd', '$n$ is even and $n^2$ is odd'], 0, 'Negate both parts and swap them.'],
      ['Which is logically equivalent to $P \\Rightarrow Q$?', ['$\\neg Q \\Rightarrow \\neg P$', '$Q \\Rightarrow P$', '$\\neg P \\Rightarrow \\neg Q$', '$P \\wedge \\neg Q$'], 0, 'Only the contrapositive is equivalent.'],
      ['The negation of "all swans are white" is…', ['There is a swan that is not white', 'No swans are white', 'All swans are black', 'Some swans are white'], 0, '"For all" negates to "there exists … not".'],
      ['To disprove "for all $n$, $P(n)$" you need…', ['One counterexample', 'A proof by induction', 'Many examples', 'The contrapositive'], 0, ''],
      ['The minimum of $x + \\frac{16}{x}$ for $x > 0$ is…', ['8', '4', '16', '32'], 0, '$2\\sqrt{16} = 8$, at $x = 4$.'],
      ['When does $\\frac{a+b}{2} = \\sqrt{ab}$ for positive $a, b$?', ['Only when $a = b$', 'Always', 'When $a = 0$', 'Never'], 0, ''],
      ['A proof that $\\sqrt{3}$ is irrational usually uses…', ['Contradiction', 'Induction', 'A counterexample', 'Vectors'], 0, ''],
    ],
  });
  const IMPL = [
    ['$n$ is even', '$n^2$ is even', '$n$ is odd', '$n^2$ is odd'],
    ['$x > 2$', '$x^2 > 4$', '$x \\le 2$', '$x^2 \\le 4$'],
    ['$n$ is a multiple of 4', '$n$ is even', '$n$ is not a multiple of 4', '$n$ is odd'],
    ['$n$ is divisible by 6', '$n$ is divisible by 3', '$n$ is not divisible by 6', '$n$ is not divisible by 3'],
  ];
  proof.bank = [
    function logic() {
      const [p, q, np, nq] = pick(IMPL), kind = pick(['contrapositive', 'converse', 'negation']);
      const forms = { contrapositive: `If ${nq} then ${np}`, converse: `If ${q} then ${p}`, negation: `${p} and ${nq}`, inverse: `If ${np} then ${nq}` };
      return {
        level: 'F', tags: ['1.1', '1.2'], stem: `Consider the statement: "If ${p} then ${q}".`,
        parts: [CH('a', `Which statement is its ${kind}?`, forms[kind], Object.entries(forms).filter(([k]) => k !== kind).map(([, v]) => v), [kind === 'contrapositive' ? 'Contrapositive: $\\neg Q \\Rightarrow \\neg P$' : kind === 'converse' ? 'Converse: $Q \\Rightarrow P$' : 'Negation of $P \\Rightarrow Q$: $P$ and $\\neg Q$'])],
      };
    },
    function amgm() {
      const k = ri(2, 9), c = ri(1, 6), cx = c === 1 ? 'x' : `${c}x`;
      return {
        level: 'S', tags: ['1.6', '1.5'], stem: `Let ${m(`f(x) = ${cx} + \\dfrac{${c * k * k}}{x}`)} for ${m('x > 0')}.`,
        parts: [
          P('a', 'Use AM–GM to find the minimum value of $f(x)$.', 'num', 2 * c * k, String(2 * c * k), [m(`${cx} + \\frac{${c * k * k}}{x} \\ge 2\\sqrt{${cx} \\cdot \\frac{${c * k * k}}{x}} = 2\\sqrt{${c * c * k * k}} = ${2 * c * k}`)], 2),
          P('b', 'For which $x$ is the minimum reached?', 'num', k, m(`x = ${k}`), [`Equality when ${m(`${cx} = \\frac{${c * k * k}}{x}`)}`, m(`x^2 = ${k * k},\\ x = ${k}`)]),
          P('c', `For ${m(`a = ${k}`)} and ${m(`b = ${k + c}`)}, what is ${m('a^2 + b^2 - 2ab')}?`, 'num', c * c, String(c * c), [m('a^2 + b^2 - 2ab = (a - b)^2'), m(`= (${k} - ${k + c})^2 = ${c * c} \\ge 0`)]),
        ],
      };
    },
    function counterexample() {
      const it = pick([
        ['$n^2 + n + 41$ is prime for every positive integer $n$', '$n = 40$', ['$n = 1$', '$n = 10$', '$n = 39$'], '$40^2 + 40 + 41 = 1681 = 41^2$'],
        ['$2^n - 1$ is prime whenever $n$ is prime', '$n = 11$', ['$n = 2$', '$n = 3$', '$n = 5$', '$n = 7$'], '$2^{11} - 1 = 2047 = 23 \\times 89$ (but $2^2-1$, $2^3-1$, $2^5-1$, $2^7-1$ are all prime)'],
        ['$n^2 \\ge 2n$ for every positive integer $n$', '$n = 1$', ['$n = 2$', '$n = 3$', '$n = 4$'], '$1^2 = 1 < 2 = 2 \\times 1$'],
        ['every number of the form $6k + 1$ ($k \\ge 1$) is prime', '$k = 4$', ['$k = 1$', '$k = 2$', '$k = 3$'], '$k = 4$ gives $25 = 5^2$'],
        ['the sum of two irrational numbers is irrational', '$\\sqrt{2}$ and $-\\sqrt{2}$', ['$\\sqrt{2}$ and $\\sqrt{3}$', '$\\sqrt{2}$ and $\\sqrt{2}$', '$\\pi$ and $\\pi$'], '$\\sqrt{2} + (-\\sqrt{2}) = 0$, which is rational'],
      ]);
      return {
        level: 'S', tags: ['1.4'], stem: `Claim: ${it[0]}.`,
        parts: [CH('a', 'Which is a counterexample?', it[1], it[2], [it[3], 'One counterexample disproves a "for all" claim.'], 2)],
      };
    },
    function contradictionSteps() {
      const p = pick([2, 3, 5]);
      return {
        level: 'C', tags: ['1.3'], stem: `A proof that ${m(`\\sqrt{${p}}`)} is irrational starts: "Suppose ${m(`\\sqrt{${p}} = \\frac{a}{b}`)} where $a, b$ are positive integers with no common factor."`,
        parts: [
          CH('a', 'Squaring gives which equation?', m(`a^2 = ${p}b^2`), [m(`a = ${p}b^2`), m(`a^2 = ${p}b`), m(`${p}a^2 = b^2`)], [m(`\\left(\\frac{a}{b}\\right)^2 = ${p} \\Rightarrow a^2 = ${p}b^2`)]),
          CH('b', 'What can we conclude next?', `${p} divides $a$, so ${m(`a = ${p}k`)}`, [`${p} divides $b$ only`, m('a = b'), '$a$ is odd'], [`${p} divides ${m('a^2')} and ${p} is prime, so ${p} divides $a$`]),
          CH('c', 'Why is this a contradiction?', `${p} then divides $b$ too, so $a$ and $b$ share the factor ${p}`, [m('a^2') + ' would be negative', `${m(`\\sqrt{${p}}`)} would be a whole number`, '$b$ would be 0'], [m(`${p * p}k^2 = ${p}b^2 \\Rightarrow b^2 = ${p}k^2`) + `, so ${p} divides $b$`, 'That contradicts "no common factor"'], 2),
        ],
      };
    },
  ];

  /* ================= 2. COMPLEX NUMBERS ================= */
  const complex = finish({
    id: 'e2complex', subject: 'y12', title: 'Complex Numbers', chapter: 'Ext 2 · 2', hue: 'cyan',
    blurb: 'Cartesian, mod-arg and exponential forms, conjugates, square roots, De Moivre, curves and complex roots.',
    sections: [
      { code: '2.1', name: 'Introduction to complex numbers', notes: ['$i^2 = -1$. A complex number is $z = x + iy$ with $\\operatorname{Re}(z) = x$ and $\\operatorname{Im}(z) = y$.', 'Add and subtract real and imaginary parts separately; multiply by expanding and using $i^2 = -1$.', 'Powers of $i$ cycle every 4: $i, -1, -i, 1$.'], ex: ['$(2 + 3i)(1 - i)$', '$= 2 - 2i + 3i - 3i^2$', '$= 5 + i$'] },
      { code: '2.2', name: 'Cartesian form and conjugates', notes: ['The conjugate of $z = x + iy$ is $\\bar{z} = x - iy$.', '$z\\bar{z} = x^2 + y^2 = |z|^2$, a real number.', 'To divide, multiply top and bottom by the conjugate of the denominator.', 'Two complex numbers are equal only if their real parts and imaginary parts are both equal.'], ex: ['$\\dfrac{5 + 5i}{1 + 2i}$', '$= \\dfrac{(5 + 5i)(1 - 2i)}{5}$', '$= \\dfrac{15 - 5i}{5} = 3 - i$'] },
      { code: '2.3', name: 'Mod-arg (polar) form', notes: ['$|z| = \\sqrt{x^2 + y^2}$ is the distance from the origin.', '$\\arg z$ is the angle from the positive real axis, with principal value $-\\pi < \\arg z \\le \\pi$.', '$z = r(\\cos\\theta + i\\sin\\theta) = r\\operatorname{cis}\\theta$.', 'Multiplying multiplies moduli and adds arguments; dividing divides moduli and subtracts arguments.'], ex: ['Write $-1 + i\\sqrt{3}$ in mod-arg form', '$|z| = \\sqrt{1 + 3} = 2$, second quadrant with $\\tan\\alpha = \\sqrt{3}$', '$z = 2\\operatorname{cis}\\frac{2\\pi}{3}$'] },
      { code: '2.4', name: 'Exponential form', notes: ['Euler: $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$, so $z = re^{i\\theta}$.', '$\\cos\\theta = \\dfrac{e^{i\\theta} + e^{-i\\theta}}{2}$ and $\\sin\\theta = \\dfrac{e^{i\\theta} - e^{-i\\theta}}{2i}$.', '$e^{i\\pi} + 1 = 0$.'], ex: ['Write $3e^{i\\pi/2}$ in Cartesian form', '$3\\left(\\cos\\frac{\\pi}{2} + i\\sin\\frac{\\pi}{2}\\right)$', '$= 3i$'] },
      { code: '2.5', name: 'Square roots', notes: ['To find $\\sqrt{a + ib}$, let $(x + iy)^2 = a + ib$ and equate parts: $x^2 - y^2 = a$, $2xy = b$.', 'Also $x^2 + y^2 = |a + ib|$, which makes solving quick.', 'The two square roots are negatives of each other.'], ex: ['Square roots of $3 + 4i$', '$x^2 - y^2 = 3$, $2xy = 4$, $x^2 + y^2 = 5$', '$x^2 = 4$, $y^2 = 1$: roots $\\pm(2 + i)$'] },
      { code: '2.6', name: 'Conjugate root theorem', notes: ['If a polynomial has real coefficients and $z$ is a root, then $\\bar{z}$ is also a root.', 'So complex roots of real polynomials come in conjugate pairs.', 'The pair $a \\pm ib$ gives the real quadratic factor $z^2 - 2az + a^2 + b^2$.'], ex: ['$z^2 - 6z + 13 = 0$', '$z = \\dfrac{6 \\pm \\sqrt{36 - 52}}{2} = \\dfrac{6 \\pm 4i}{2}$', '$z = 3 \\pm 2i$'] },
      { code: '2.7', name: 'Complex numbers as vectors', notes: ['$z$ is the vector from $0$ to the point $z$ on the Argand diagram; $z_2 - z_1$ is the vector from $z_1$ to $z_2$.', 'Adding follows the parallelogram rule.', 'Multiplying by $i$ rotates a vector $90^\\circ$ anticlockwise; by $\\operatorname{cis}\\theta$ rotates it by $\\theta$.'], ex: ['Rotate $3 + i$ by $90^\\circ$ anticlockwise', 'Multiply by $i$: $i(3 + i)$', '$= -1 + 3i$'] },
      { code: '2.8', name: 'Curves and regions', notes: ['$|z - a| = r$ is a circle with centre $a$ and radius $r$.', '$|z - a| = |z - b|$ is the perpendicular bisector of $a$ and $b$.', '$\\arg(z - a) = \\theta$ is a ray from $a$ (not including $a$) at angle $\\theta$.', 'Inequalities give regions: $|z - a| \\le r$ is the disc including its edge.'], ex: ['Describe $|z - 2 + i| = 3$', 'Rewrite as $|z - (2 - i)| = 3$', 'Circle, centre $(2, -1)$, radius 3'] },
      { code: '2.9', name: 'De Moivre\'s theorem', notes: ['$(\\operatorname{cis}\\theta)^n = \\operatorname{cis}(n\\theta)$ for integers $n$.', 'So $(r\\operatorname{cis}\\theta)^n = r^n\\operatorname{cis}(n\\theta)$.', 'Expanding $(\\cos\\theta + i\\sin\\theta)^n$ binomially gives multiple-angle formulas for $\\cos n\\theta$ and $\\sin n\\theta$.'], ex: ['$(1 + i)^8$', '$1 + i = \\sqrt{2}\\operatorname{cis}\\frac{\\pi}{4}$', '$(\\sqrt{2})^8\\operatorname{cis}2\\pi = 16$'] },
      { code: '2.10', name: 'Complex roots', notes: ['$z^n = 1$ has $n$ roots: $\\operatorname{cis}\\frac{2k\\pi}{n}$, $k = 0, 1, \\dots, n - 1$, equally spaced on the unit circle.', 'All $n$ roots of unity sum to $0$.', 'To solve $z^n = r\\operatorname{cis}\\theta$: $z = \\sqrt[n]{r}\\operatorname{cis}\\dfrac{\\theta + 2k\\pi}{n}$.'], ex: ['Solve $z^3 = 1$', '$z = \\operatorname{cis}\\frac{2k\\pi}{3}$, $k = 0, 1, 2$', '$z = 1,\\ \\operatorname{cis}\\frac{2\\pi}{3},\\ \\operatorname{cis}\\left(-\\frac{2\\pi}{3}\\right)$'] },
    ],
    cards: [
      ['$i^2$', '$-1$'], ['Conjugate of $x + iy$', '$x - iy$'], ['$z\\bar{z}$', '$|z|^2$ (real)'], ['$|x + iy|$', '$\\sqrt{x^2 + y^2}$'],
      ['Principal argument range', '$-\\pi < \\arg z \\le \\pi$'], ['$r\\operatorname{cis}\\theta$', '$r(\\cos\\theta + i\\sin\\theta)$'], ['Euler\'s formula', '$e^{i\\theta} = \\cos\\theta + i\\sin\\theta$'],
      ['$|z_1 z_2|$ and $\\arg(z_1 z_2)$', '$|z_1||z_2|$ and $\\arg z_1 + \\arg z_2$'], ['De Moivre\'s theorem', '$(\\operatorname{cis}\\theta)^n = \\operatorname{cis}(n\\theta)$'], ['$|z - a| = r$', 'Circle, centre $a$, radius $r$'],
      ['$|z - a| = |z - b|$', 'Perpendicular bisector of $a$ and $b$'], ['Roots of $z^n = 1$', '$\\operatorname{cis}\\frac{2k\\pi}{n}$, $k = 0, \\dots, n - 1$'], ['Conjugate root theorem', 'Real-coefficient polynomials: if $z$ is a root, so is $\\bar{z}$'], ['Multiply by $i$', 'Rotate $90^\\circ$ anticlockwise'],
    ],
    concepts: [
      ['$i^{2023} = $', ['$-i$', '$i$', '$1$', '$-1$'], 0, '$2023 = 4 \\times 505 + 3$, and $i^3 = -i$.'],
      ['$\\arg(-2) = $', ['$\\pi$', '$-\\pi$', '$0$', '$\\frac{\\pi}{2}$'], 0, 'Negative real axis; principal value $\\pi$.'],
      ['$|3 - 4i| = $', ['5', '7', '1', '25'], 0, '$\\sqrt{9 + 16} = 5$.'],
      ['If $2 + i$ is a root of a real cubic, another root must be…', ['$2 - i$', '$-2 + i$', '$-2 - i$', '$1 + 2i$'], 0, 'Conjugate root theorem.'],
      ['$|z - i| = |z + 1|$ describes…', ['A straight line', 'A circle', 'A ray', 'A parabola'], 0, 'Perpendicular bisector of $i$ and $-1$.'],
      ['The sum of all 5 fifth roots of unity is…', ['0', '1', '5', '−1'], 0, 'They are symmetric about the origin.'],
      ['$e^{i\\pi} = $', ['$-1$', '$1$', '$i$', '$0$'], 0, '$\\cos\\pi + i\\sin\\pi$.'],
      ['Multiplying $z$ by $\\operatorname{cis}\\frac{\\pi}{3}$…', ['Rotates $z$ by $\\frac{\\pi}{3}$ anticlockwise', 'Enlarges $z$ by 3', 'Reflects $z$ in the real axis', 'Rotates $z$ by $\\frac{\\pi}{3}$ clockwise'], 0, ''],
    ],
  });
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]];
  // Exact Cartesian form of r cis(tπ/12) for t a multiple of 2 or 3, with r chosen to keep it tidy.
  function exactCis(t, k) {
    const sgn = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0), c = Math.cos(t * Math.PI / 12), s = Math.sin(t * Math.PI / 12);
    if (t % 3 === 0 && t % 6 !== 0) return { r: `${k === 1 ? '' : k}\\sqrt{2}`, z: tcx(k * sgn(c), k * sgn(s)) }; // ±π/4, ±3π/4
    const part = (v) => { const a = Math.abs(v); if (a < 1e-9) return [0, '']; if (Math.abs(a - 1) < 1e-9) return [sgn(v), String(2 * k)]; if (Math.abs(a - 0.5) < 1e-9) return [sgn(v), String(k)]; return [sgn(v), `${k === 1 ? '' : k}\\sqrt{3}`]; };
    const [sx, x] = part(c), [sy, y] = part(s);
    const re = sx === 0 ? '' : (sx < 0 ? '-' : '') + x, im = sy === 0 ? '' : y === '1' ? 'i' : y + 'i';
    const z = !re ? (sy < 0 ? '-' : '') + (im || '0') : !im ? re : `${re} ${sy < 0 ? '-' : '+'} ${im}`;
    return { r: String(2 * k), z };
  }
  const eI = (r, t) => { const a = ta(t); return `${r}e^{${a.startsWith('-') ? '-i' + a.slice(1) : 'i' + a}}`; };
  const ANGLES = [2, 3, 4, 6, 8, 9, 10, 12, -2, -3, -4, -6, -8, -9, -10];
  complex.bank = [
    function arithmetic() {
      const [p, q] = pick(TRIPLES), a = p * pick([1, -1]), b = q * pick([1, -1]), c = rnz(-5, 5), d = rnz(-5, 5);
      return {
        level: 'F', tags: ['2.1', '2.2', '2.3'], stem: `Let ${m(`z = ${tcx(a, b)}`)} and ${m(`w = ${tcx(c, d)}`)}.`,
        parts: [
          P('a', 'Find $\\operatorname{Re}(z + w)$.', 'num', a + c, String(a + c), [m(`${a} + (${c}) = ${a + c}`)]),
          P('b', 'Find $\\operatorname{Im}(z - w)$.', 'num', b - d, String(b - d), [m(`${b} - (${d}) = ${b - d}`)]),
          P('c', 'Find $\\operatorname{Re}(zw)$.', 'num', a * c - b * d, String(a * c - b * d), ['Real part of $(a + bi)(c + di)$ is $ac - bd$', m(`(${a})(${c}) - (${b})(${d}) = ${a * c - b * d}`)]),
          P('d', 'Find $\\operatorname{Im}(zw)$.', 'num', a * d + b * c, String(a * d + b * c), ['Imaginary part is $ad + bc$', m(`(${a})(${d}) + (${b})(${c}) = ${a * d + b * c}`)]),
          P('e', 'Find $|z|$.', 'num', Math.hypot(a, b), String(Math.hypot(a, b)), [m(`\\sqrt{(${a})^2 + (${b})^2} = \\sqrt{${a * a + b * b}} = ${Math.hypot(a, b)}`)]),
        ],
      };
    },
    function division() {
      const c = rnz(-3, 3), d = rnz(-3, 3), e = rnz(-4, 4), f = rnz(-4, 4);
      const a = e * c - f * d, b = e * d + f * c, n2 = c * c + d * d; // z = (e + fi)(c + di)
      return {
        level: 'S', tags: ['2.2'], stem: `Let ${m(`z = ${tcx(a, b)}`)} and ${m(`w = ${tcx(c, d)}`)}.`,
        parts: [
          CH('a', 'What is $\\bar{w}$?', m(tcx(c, -d)), [m(tcx(-c, d)), m(tcx(-c, -d)), m(tcx(d, c))], ['Change the sign of the imaginary part']),
          P('b', 'Find $\\operatorname{Re}\\left(\\dfrac{z}{w}\\right)$.', 'num', e, String(e), [m(`\\frac{z}{w} = \\frac{z\\bar{w}}{|w|^2} = \\frac{(${tcx(a, b)})(${tcx(c, -d)})}{${n2}}`), m(`= \\frac{${tcx(e * n2, f * n2)}}{${n2}} = ${tcx(e, f)}`)], 2),
          P('c', 'Find $\\operatorname{Im}\\left(\\dfrac{z}{w}\\right)$.', 'num', f, String(f), [`From (b): ${m(`\\frac{z}{w} = ${tcx(e, f)}`)}`]),
        ],
      };
    },
    function modArg() {
      const t = pick(ANGLES), k = ri(1, 3), ex = exactCis(t, k);
      return {
        level: 'S', tags: ['2.3', '2.4'], stem: `Let ${m(`z = ${ex.z}`)}.`,
        parts: [
          CH('a', 'Find $|z|$.', m(ex.r), [m(String(4 * k)), m(`${2 * k}\\sqrt{2}`), m(`${k === 1 ? '' : k}\\sqrt{3}`), m(String(4 * k * k)), m(String(k))], [`${m('|z| = \\sqrt{x^2 + y^2}')} ${m('= ' + ex.r)}`]),
          CH('b', 'Find the principal argument of $z$.', m(ta(t)), [m(ta(princ(-t))), m(ta(princ(t + 12))), m(ta(princ(12 - t))), m(ta(princ(6 - t)))], ['Find the quadrant, then the related angle', m(`\\arg z = ${ta(t)}`)], 2),
          CH('c', 'Which is $z$ in exponential form?', m(eI(ex.r, t)), [m(eI(ex.r, princ(-t))), m(`${ex.r}e^{${ta(t)}}`), m(eI('', t))], [m('z = |z|e^{i\\arg z}')]),
        ],
      };
    },
    function deMoivre() {
      const t = pick(ANGLES.filter(x => Math.abs(x) !== 12)), r = pick([1, 2]), n = ri(2, 6), arg = princ(n * t);
      return {
        level: 'S', tags: ['2.9'], stem: `Let ${m(`z = ${r === 1 ? '' : r}\\operatorname{cis}\\left(${ta(t)}\\right)`)}. Use De Moivre's theorem to find ${m(`z^{${n}}`)}.`,
        parts: [
          P('a', `Find ${m(`|z^{${n}}|`)}.`, 'num', r ** n, String(r ** n), [m(`|z|^{${n}} = ${r}^{${n}} = ${r ** n}`)]),
          CH('b', `Find the principal argument of ${m(`z^{${n}}`)}.`, m(ta(arg)), [m(ta(princ(arg + 12))), m(ta(princ(n * t + 6))), m(ta(princ(-arg))), m(ta(princ(t + n)))], [m(`\\arg z^{${n}} = ${n} \\times ${ta(t)} = ${ta(n * t)}`), `Principal value: ${m(ta(arg))}`], 2),
        ],
      };
    },
    function quadratic() {
      const p = rnz(-5, 5), q = ri(1, 6), b = -2 * p, c = p * p + q * q, disc = b * b - 4 * c;
      return {
        level: 'S', tags: ['2.6'], stem: `Solve ${m(`z^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}z + ${c} = 0`)}. The roots are ${m('a \\pm bi')} with ${m('b > 0')}.`,
        parts: [
          P('a', 'Find $a$.', 'num', p, String(p), [m(`z = \\frac{${-b} \\pm \\sqrt{${disc}}}{2} = \\frac{${-b} \\pm ${2 * q}i}{2}`), m(`= ${p} \\pm ${q}i`)]),
          P('b', 'Find $b$.', 'num', q, String(q), [m(`\\sqrt{${disc}} = ${2 * q}i`) + ', halved gives ' + m(`${q}i`)]),
          P('c', 'What is the product of the roots?', 'num', c, String(c), [m(`\\alpha\\beta = \\frac{c}{a} = ${c}`), `(also ${m('(a + bi)(a - bi) = a^2 + b^2')})`]),
        ],
      };
    },
    function squareRoot() {
      const x = ri(1, 5), y = rnz(-5, 5), a = x * x - y * y, b = 2 * x * y;
      return {
        level: 'C', tags: ['2.5'], stem: `The square roots of ${m(tcx(a, b))} are ${m('\\pm(x + iy)')}, where ${m('x > 0')}.`,
        parts: [
          P('a', 'Find $x$.', 'num', x, String(x), [m(`x^2 - y^2 = ${a},\\ 2xy = ${b}`), m(`x^2 + y^2 = |${tcx(a, b)}| = ${x * x + y * y}`), m(`2x^2 = ${2 * x * x} \\Rightarrow x = ${x}`)], 2),
          P('b', 'Find $y$.', 'num', y, String(y), [m(`y = \\frac{${b}}{2x} = ${y}`)]),
        ],
      };
    },
    function rootsOfUnity() {
      const n = ri(3, 8), pf = (a, b) => { const g = gcd(a, b); a /= g; b /= g; const top = a === 1 ? '\\pi' : `${a}\\pi`; return b === 1 ? top : `\\frac{${top}}{${b}}`; };
      return {
        level: 'C', tags: ['2.10'], stem: `Consider the equation ${m(`z^{${n}} = 1`)}.`,
        parts: [
          P('a', 'How many roots does it have?', 'num', n, String(n), [`A degree ${n} polynomial has ${n} roots`]),
          CH('b', 'What is the smallest positive argument of a root?', m(pf(2, n)), [m(pf(1, n)), m(pf(2, n + 1)), m(pf(1, 2 * n)), m(pf(n, 2))], [m(`z = \\operatorname{cis}\\frac{2k\\pi}{${n}}`), `$k = 1$ gives ${m(pf(2, n))}`]),
          P('c', 'What is the sum of all the roots?', 'num', 0, '0', [`The coefficient of ${m(`z^{${n - 1}}`)} is 0, so the sum of the roots is 0`]),
          P('d', 'What is the product of all the roots?', 'num', (-1) ** (n + 1), String((-1) ** (n + 1)), [m(`\\text{product} = (-1)^{${n}} \\times (-1) = ${(-1) ** (n + 1)}`)]),
        ],
      };
    },
    function powersOfI() {
      const n = ri(10, 200), r = n % 4, val = ['1', 'i', '-1', '-i'][r];
      return {
        level: 'F', tags: ['2.1'], stem: 'Powers of $i$.',
        parts: [
          CH('a', `Simplify ${m(`i^{${n}}`)}.`, m(val), ['1', 'i', '-1', '-i'].filter(v => v !== val).map(m), [m(`${n} = 4 \\times ${Math.floor(n / 4)} + ${r}`), m(`i^{${n}} = i^{${r}} = ${val}`)]),
          P('b', 'Write $(1 + i)^2$ as $a + bi$. What is $b$?', 'num', 2, '2', [m('(1 + i)^2 = 1 + 2i + i^2 = 2i')]),
        ],
      };
    },
  ];

  /* ================= 3. FURTHER MATHEMATICAL INDUCTION ================= */
  const induction = finish({
    id: 'e2induction', subject: 'y12', title: 'Further Induction', chapter: 'Ext 2 · 3', hue: 'gold',
    blurb: 'Induction for series, divisibility, inequalities, recursive formulas and calculus results.',
    sections: [
      { code: '3.1', name: 'Induction structure', notes: ['Step 1: prove the statement for the first value (usually $n = 1$).', 'Step 2: assume it is true for $n = k$ (the inductive hypothesis).', 'Step 3: prove it for $n = k + 1$, using the assumption.', 'Conclude: true for all $n$ from the first value on, by mathematical induction.'], ex: ['Prove $1 + 3 + \\dots + (2n - 1) = n^2$', 'Assume $1 + \\dots + (2k - 1) = k^2$', 'Add $2k + 1$: $k^2 + 2k + 1 = (k + 1)^2$'] },
      { code: '3.2', name: 'Divisibility proofs', notes: ['Write the assumption as an equation: $7^k - 1 = 6M$ for some integer $M$.', 'Rewrite the $k + 1$ expression to contain the assumed part: $7^{k+1} - 1 = 7(7^k - 1) + 6$.', 'Substitute and factor out the divisor: $7(6M) + 6 = 6(7M + 1)$.'], ex: ['Show $5^n + 3$ is divisible by 4', '$5^{k+1} + 3 = 5(5^k + 3) - 12$', '$= 5(4M) - 12 = 4(5M - 3)$'] },
      { code: '3.3', name: 'Inequality proofs', notes: ['The base case may not be $n = 1$: check where the inequality starts being true.', 'In the $k + 1$ step, use the assumption, then show the leftover part is positive.', 'Example: $2^n > n^2$ holds for $n \\ge 5$ (it fails at $n = 4$ since $16 = 16$).'], ex: ['Show $3^n > 2n + 1$ for $n \\ge 2$', 'Assume $3^k > 2k + 1$. Then $3^{k+1} > 6k + 3$', '$6k + 3 > 2k + 3 = 2(k + 1) + 1$'] },
      { code: '3.4', name: 'Recursive formulas', notes: ['A recursive formula defines each term from the one before, e.g. $a_1 = 1$, $a_{n+1} = 2a_n + 1$.', 'Induction proves a closed form, here $a_n = 2^n - 1$.', 'Use the recursion in the $k + 1$ step: $a_{k+1} = 2(2^k - 1) + 1 = 2^{k+1} - 1$.'], ex: ['$a_1 = 3$, $a_{n+1} = a_n + 4$. Closed form?', 'Each term adds 4', '$a_n = 4n - 1$'] },
      { code: '3.5', name: 'Calculus and other results', notes: ['Induction also proves derivative patterns, e.g. $\\dfrac{d^n}{dx^n}(xe^x) = (x + n)e^x$.', 'And results like De Moivre\'s theorem for positive integers $n$.', 'Geometry and counting results can be proved the same way.'], ex: ['$\\frac{d}{dx}\\left[(x + k)e^x\\right]$', '$= e^x + (x + k)e^x$', '$= (x + k + 1)e^x$'] },
    ],
    cards: [
      ['Three steps of induction', 'Base case, assume $n = k$, prove $n = k + 1$.'], ['Inductive hypothesis', 'The assumption that the statement is true for $n = k$.'], ['Divisibility assumption', 'e.g. $7^k - 1 = 6M$, $M$ an integer'],
      ['Rewrite $7^{k+1} - 1$ as…', '$7(7^k - 1) + 6$'], ['$\\sum_{r=1}^{n} (2r - 1)$', '$n^2$'], ['$\\sum_{r=1}^{n} r$', '$\\frac{n(n + 1)}{2}$'], ['$\\sum_{r=1}^{n} r^2$', '$\\frac{n(n + 1)(2n + 1)}{6}$'],
      ['$\\sum_{r=1}^{n} r^3$', '$\\left(\\frac{n(n + 1)}{2}\\right)^2$'], ['$2^n > n^2$ holds for…', '$n \\ge 5$ (and $n = 1$)'], ['$a_1 = 1$, $a_{n+1} = 2a_n + 1$', '$a_n = 2^n - 1$'],
    ],
    concepts: [
      ['In the inductive step you assume the result for…', ['$n = k$', '$n = k + 1$', '$n = 1$ only', 'all $n$'], 0, ''],
      ['To prove $4^n - 1$ is divisible by 3, the assumption is…', ['$4^k - 1 = 3M$', '$4^k = 3M$', '$4^{k+1} - 1 = 3M$', '$4^k - 1 = M$'], 0, ''],
      ['$4^{k+1} - 1$ can be rewritten as…', ['$4(4^k - 1) + 3$', '$4(4^k - 1) - 3$', '$4^k - 1 + 4$', '$(4^k - 1)^2$'], 0, '$4 \\cdot 4^k - 4 + 3$.'],
      ['For $2^n > n^2$, the base case should be…', ['$n = 5$', '$n = 1$', '$n = 2$', '$n = 4$'], 0, 'It fails for $n = 2, 3, 4$.'],
      ['The term added in the $k + 1$ step of $\\sum r^2$ is…', ['$(k + 1)^2$', '$k^2$', '$k + 1$', '$(k + 1)^3$'], 0, ''],
      ['An induction proof is incomplete without…', ['A concluding statement', 'A diagram', 'A counterexample', 'Three examples'], 0, ''],
    ],
  });
  const SERIES = [
    { s: 'r(r + 1)', f: '\\frac{n(n + 1)(n + 2)}{3}', v: (n) => n * (n + 1) * (n + 2) / 3, t: '(k + 1)(k + 2)', wrong: ['k(k + 1)', '\\frac{(k + 1)(k + 2)(k + 3)}{3}', '(k + 2)(k + 3)'] },
    { s: '(2r - 1)', f: 'n^2', v: (n) => n * n, t: '2k + 1', wrong: ['2k - 1', '2k + 2', 'k + 1'] },
    { s: 'r^3', f: '\\left(\\frac{n(n + 1)}{2}\\right)^2', v: (n) => (n * (n + 1) / 2) ** 2, t: '(k + 1)^3', wrong: ['k^3', '(k + 1)^2', '(k + 2)^3'] },
    { s: '\\frac{1}{r(r + 1)}', f: '\\frac{n}{n + 1}', v: (n) => n / (n + 1), t: '\\frac{1}{(k + 1)(k + 2)}', wrong: ['\\frac{1}{k(k + 1)}', '\\frac{1}{k + 2}', '\\frac{k + 1}{k + 2}'] },
  ];
  const DIVS = [
    { e: '7^n - 1', d: 6, b: 7, c: -1, re: '7(7^k - 1) + 6', wrong: ['7(7^k - 1) - 6', '7^k - 1 + 7', '7(7^k - 1) + 1'] },
    { e: '5^n + 3', d: 4, b: 5, c: 3, re: '5(5^k + 3) - 12', wrong: ['5(5^k + 3) + 12', '5(5^k + 3) - 3', '5^k + 3 + 5'] },
    { e: '3^{2n} - 1', d: 8, b: 9, c: -1, re: '9(3^{2k} - 1) + 8', wrong: ['3(3^{2k} - 1) + 2', '9(3^{2k} - 1) - 8', '9(3^{2k} - 1) + 1'] },
    { e: '11^n - 6', d: 5, b: 11, c: -6, re: '11(11^k - 6) + 60', wrong: ['11(11^k - 6) - 60', '11(11^k - 6) + 6', '11^k - 6 + 11'] },
  ];
  induction.bank = [
    function series() {
      const S = pick(SERIES), n = ri(3, 8), val = S.v(n);
      return {
        level: 'S', tags: ['3.1'], stem: `Prove by induction that ${m(`\\displaystyle\\sum_{r=1}^{n} ${S.s} = ${S.f}`)}.`,
        parts: [
          P('a', `Check: find the sum when ${m(`n = ${n}`)}${Number.isInteger(val) ? '' : ' (a fraction is fine)'}.`, 'num', val, m(Number.isInteger(val) ? String(val) : tf(n, n + 1)), [`Use the formula with ${m(`n = ${n}`)}`, m(`= ${Number.isInteger(val) ? val : tf(n, n + 1)}`)]),
          CH('b', 'In the $k + 1$ step, which term is added to the sum up to $k$?', m(S.t), S.wrong.map(m), ['Replace $r$ with $k + 1$ in the general term']),
        ],
      };
    },
    function divisibility() {
      const D = pick(DIVS), n = ri(1, 4), val = D.b ** n + D.c;
      return {
        level: 'S', tags: ['3.2'], stem: `Prove by induction that ${m(D.e)} is divisible by ${D.d} for all integers ${m('n \\ge 1')}.`,
        parts: [
          P('a', `Find the value of ${m(D.e)} when ${m(`n = ${n}`)}.`, 'num', val, String(val), [m(`= ${val}`) + `, and ${m(`${val} \\div ${D.d} = ${val / D.d}`)}`]),
          CH('b', 'In the $k + 1$ step, the expression is best rewritten as…', m(D.re), D.wrong.map(m), ['Pull out the assumed expression, then fix the constant'], 2),
        ],
      };
    },
    function inequality() {
      const n = ri(5, 9);
      return {
        level: 'C', tags: ['3.3'], stem: `Consider the claim ${m('2^n > n^2')}.`,
        parts: [
          P('a', 'What is the smallest $n \\ge 2$ for which it holds and keeps holding for every larger $n$?', 'num', 5, '5', ['$n = 2$: $4 > 4$ false. $n = 3$: $8 > 9$ false. $n = 4$: $16 > 16$ false.', '$n = 5$: $32 > 25$ true, and it stays true'], 2),
          P('b', `Find ${m(`2^{${n}} - ${n}^2`)}.`, 'num', 2 ** n - n * n, String(2 ** n - n * n), [m(`${2 ** n} - ${n * n} = ${2 ** n - n * n}`)]),
        ],
      };
    },
    function recursive() {
      const mult = ri(2, 3), c = ri(1, 4), n = ri(3, 6), useGeo = Math.random() < 0.5;
      const val = useGeo ? c * mult ** (n - 1) : 2 ** n - 1, cc = c === 1 ? '' : `${c} \\times `;
      return {
        level: 'C', tags: ['3.4'], stem: useGeo ? `A sequence has ${m(`a_1 = ${c}`)} and ${m(`a_{n+1} = ${mult}a_n`)}.` : `A sequence has ${m('a_1 = 1')} and ${m('a_{n+1} = 2a_n + 1')}.`,
        parts: [
          P('a', `Find ${m(`a_{${n}}`)}.`, 'num', val, String(val), useGeo ? [`Each term is ${mult} times the last`, m(`a_{${n}} = ${cc}${mult}^{${n - 1}} = ${val}`)] : ['$1, 3, 7, 15, \\dots$', m(`a_{${n}} = 2^{${n}} - 1 = ${val}`)]),
          CH('b', 'Which closed form would you prove by induction?', m(useGeo ? `a_n = ${cc}${mult}^{n-1}` : 'a_n = 2^n - 1'), (useGeo ? [`a_n = ${cc}${mult}^{n}`, `a_n = ${mult}n + ${c}`, `a_n = ${c + mult}^{n-1}`] : ['a_n = 2^n + 1', 'a_n = 2n - 1', 'a_n = 2^{n-1}']).map(m), ['Check it matches the first few terms']),
        ],
      };
    },
  ];

  /* ================= 4. INTEGRATION ================= */
  const integration = finish({
    id: 'e2integration', subject: 'y12', title: 'Integration', chapter: 'Ext 2 · 4', hue: 'pink',
    blurb: 'Standard integrals, substitution, partial fractions, trig techniques, integration by parts and recurrences.',
    sections: [
      { code: '4.1', name: 'Standard integrals & completing the square', notes: ['$\\displaystyle\\int \\frac{1}{a^2 + x^2}\\,dx = \\frac{1}{a}\\tan^{-1}\\frac{x}{a} + C$', '$\\displaystyle\\int \\frac{1}{\\sqrt{a^2 - x^2}}\\,dx = \\sin^{-1}\\frac{x}{a} + C$', 'Complete the square to reach these forms: $x^2 + 4x + 13 = (x + 2)^2 + 9$.'], ex: ['$\\displaystyle\\int \\frac{dx}{x^2 + 4x + 13}$', '$\\displaystyle= \\int \\frac{dx}{(x + 2)^2 + 9}$', '$= \\frac{1}{3}\\tan^{-1}\\frac{x + 2}{3} + C$'] },
      { code: '4.2', name: 'Reverse chain rule & u-substitution', notes: ['$\\displaystyle\\int f\'(x)[f(x)]^n\\,dx = \\frac{[f(x)]^{n+1}}{n + 1} + C$', '$\\displaystyle\\int \\frac{f\'(x)}{f(x)}\\,dx = \\ln|f(x)| + C$', 'With $u = g(x)$: replace $dx$ using $du = g\'(x)\\,dx$, and change the limits for definite integrals.'], ex: ['$\\int 2x(x^2 + 1)^4\\,dx$', 'Let $u = x^2 + 1$, $du = 2x\\,dx$', '$= \\frac{u^5}{5} + C = \\frac{(x^2 + 1)^5}{5} + C$'] },
      { code: '4.3', name: 'Partial fractions', notes: ['Split a proper rational function: $\\dfrac{px + q}{(x - a)(x - b)} = \\dfrac{A}{x - a} + \\dfrac{B}{x - b}$.', 'Find $A$ and $B$ by multiplying out and substituting $x = a$ and $x = b$.', 'Repeated factors need $\\dfrac{A}{x - a} + \\dfrac{B}{(x - a)^2}$; irreducible quadratics need $\\dfrac{Ax + B}{x^2 + c}$.', 'If the top\'s degree is not lower, divide first.'], ex: ['$\\dfrac{5x + 1}{(x - 1)(x + 2)}$', '$x = 1$: $6 = 3A$, $A = 2$; $x = -2$: $-9 = -3B$, $B = 3$', '$\\dfrac{2}{x - 1} + \\dfrac{3}{x + 2}$'] },
      { code: '4.4', name: 'Trigonometric integrals', notes: ['$\\sin^2 x = \\frac{1}{2}(1 - \\cos 2x)$ and $\\cos^2 x = \\frac{1}{2}(1 + \\cos 2x)$.', 'Odd powers: save one factor and use $\\sin^2 x + \\cos^2 x = 1$ with a substitution.', 'The $t$-substitution $t = \\tan\\frac{x}{2}$ gives $\\sin x = \\frac{2t}{1 + t^2}$, $\\cos x = \\frac{1 - t^2}{1 + t^2}$, $dx = \\frac{2\\,dt}{1 + t^2}$.'], ex: ['$\\int \\cos^2 x\\,dx$', '$= \\int \\frac{1 + \\cos 2x}{2}\\,dx$', '$= \\frac{x}{2} + \\frac{\\sin 2x}{4} + C$'] },
      { code: '4.5', name: 'Integration by parts', notes: ['$\\displaystyle\\int u\\,dv = uv - \\int v\\,du$', 'Choose $u$ to be something that gets simpler when differentiated (LIATE: logs, inverse trig, algebraic, trig, exponential).', 'Sometimes you integrate by parts twice and solve for the integral, e.g. $\\int e^x\\sin x\\,dx$.'], ex: ['$\\int xe^{2x}\\,dx$', '$u = x$, $dv = e^{2x}dx$: $uv = \\frac{xe^{2x}}{2}$', '$-\\int \\frac{e^{2x}}{2}dx \\;\\Rightarrow\\; \\frac{e^{2x}(2x - 1)}{4} + C$'] },
      { code: '4.6', name: 'Recurrence relations', notes: ['Define $I_n$ and use parts to link $I_n$ to $I_{n-1}$ or $I_{n-2}$.', 'Classic: $I_n = \\int_0^{\\pi/2} \\sin^n x\\,dx$ gives $I_n = \\frac{n - 1}{n} I_{n-2}$, with $I_0 = \\frac{\\pi}{2}$ and $I_1 = 1$.', 'Then step down to the base cases to evaluate.'], ex: ['$I_4 = \\int_0^{\\pi/2} \\sin^4 x\\,dx$', '$I_4 = \\frac{3}{4}I_2 = \\frac{3}{4} \\cdot \\frac{1}{2} I_0$', '$= \\frac{3}{8} \\cdot \\frac{\\pi}{2} = \\frac{3\\pi}{16}$'] },
      { code: '4.7', name: 'Definite integrals', notes: ['Change the limits when you substitute, so you never have to go back to $x$.', 'Odd functions over $[-a, a]$ integrate to $0$.', '$\\int_0^a f(x)\\,dx = \\int_0^a f(a - x)\\,dx$ is a handy trick for symmetric integrals.'], ex: ['$\\int_{-2}^{2} x^3\\cos x\\,dx$', '$x^3\\cos x$ is odd', '$= 0$'] },
    ],
    cards: [
      ['$\\int \\frac{1}{a^2 + x^2}\\,dx$', '$\\frac{1}{a}\\tan^{-1}\\frac{x}{a} + C$'], ['$\\int \\frac{1}{\\sqrt{a^2 - x^2}}\\,dx$', '$\\sin^{-1}\\frac{x}{a} + C$'], ['$\\int \\frac{f\'(x)}{f(x)}\\,dx$', '$\\ln|f(x)| + C$'], ['Integration by parts', '$\\int u\\,dv = uv - \\int v\\,du$'],
      ['LIATE', 'Choose $u$: logs, inverse trig, algebraic, trig, exponential'], ['$\\sin^2 x$', '$\\frac{1}{2}(1 - \\cos 2x)$'], ['$\\cos^2 x$', '$\\frac{1}{2}(1 + \\cos 2x)$'], ['$t = \\tan\\frac{x}{2}$: $\\sin x$', '$\\frac{2t}{1 + t^2}$'],
      ['$t = \\tan\\frac{x}{2}$: $dx$', '$\\frac{2\\,dt}{1 + t^2}$'], ['$\\int_0^{\\pi/2}\\sin^n x\\,dx$ recurrence', '$I_n = \\frac{n - 1}{n}I_{n-2}$'], ['Odd function over $[-a, a]$', 'Integral is $0$'], ['Partial fractions with $(x - a)^2$', '$\\frac{A}{x - a} + \\frac{B}{(x - a)^2}$'],
    ],
    concepts: [
      ['$\\int \\frac{1}{9 + x^2}\\,dx = $', ['$\\frac{1}{3}\\tan^{-1}\\frac{x}{3} + C$', '$\\tan^{-1}\\frac{x}{3} + C$', '$3\\tan^{-1}3x + C$', '$\\ln(9 + x^2) + C$'], 0, ''],
      ['$\\int \\frac{2x}{x^2 + 5}\\,dx = $', ['$\\ln(x^2 + 5) + C$', '$2\\ln(x^2 + 5) + C$', '$x^2\\ln(x^2 + 5) + C$', '$\\frac{1}{\\sqrt{5}}\\tan^{-1}\\frac{x}{\\sqrt{5}} + C$'], 0, '$\\frac{f\'(x)}{f(x)}$ form.'],
      ['For $\\int x\\ln x\\,dx$, the best choice of $u$ is…', ['$\\ln x$', '$x$', '$x\\ln x$', '$1$'], 0, 'Logs come first in LIATE.'],
      ['$\\int_{-1}^{1} x^5\\,dx = $', ['$0$', '$\\frac{1}{3}$', '$\\frac{2}{6}$', '$1$'], 0, 'Odd function over a symmetric interval.'],
      ['With $t = \\tan\\frac{x}{2}$, $\\cos x = $', ['$\\frac{1 - t^2}{1 + t^2}$', '$\\frac{2t}{1 + t^2}$', '$\\frac{1 + t^2}{1 - t^2}$', '$\\frac{2}{1 + t^2}$'], 0, ''],
      ['$\\frac{3x + 5}{(x + 1)(x + 3)}$ splits into…', ['$\\frac{1}{x + 1} + \\frac{2}{x + 3}$', '$\\frac{2}{x + 1} + \\frac{1}{x + 3}$', '$\\frac{3}{x + 1} + \\frac{5}{x + 3}$', '$\\frac{1}{x + 1} - \\frac{2}{x + 3}$'], 0, '$x = -1$: $2 = 2A$; $x = -3$: $-4 = -2B$.'],
    ],
  });
  // \frac{1}{a}\tan^{-1}\frac{x − h}{a} + C, tidy when a = 1
  const atan = (a, h) => (a === 1 ? `\\tan^{-1}(${tlin(h)}) + C` : `\\frac{1}{${a}}\\tan^{-1}\\frac{${tlin(h)}}{${a}} + C`);
  // A ln|x − p| + B ln|x − q| + C
  const lnSum = (A, p, B, q) => { const t = (c, r, first) => `${first ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}\\ln|${tlin(-r)}|`; return t(A, p, true) + t(B, q, false) + ' + C'; };
  const coef = (c) => (c === 1 ? '' : String(c));
  integration.bank = [
    function standard() {
      const a = ri(2, 6), v = Math.PI / (4 * a);
      return {
        level: 'F', tags: ['4.1'], stem: 'Standard integrals.',
        parts: [
          CH('a', m(`\\displaystyle\\int \\frac{1}{${a * a} + x^2}\\,dx`), m(`\\frac{1}{${a}}\\tan^{-1}\\frac{x}{${a}} + C`), [m(`\\tan^{-1}\\frac{x}{${a}} + C`), m(`${a}\\tan^{-1}\\frac{x}{${a}} + C`), m(`\\frac{1}{${a}}\\sin^{-1}\\frac{x}{${a}} + C`)], [`Standard form with ${m(`a = ${a}`)}`]),
          CH('b', m(`\\displaystyle\\int \\frac{1}{\\sqrt{${a * a} - x^2}}\\,dx`), m(`\\sin^{-1}\\frac{x}{${a}} + C`), [m(`\\frac{1}{${a}}\\sin^{-1}\\frac{x}{${a}} + C`), m(`\\cos^{-1}\\frac{x}{${a}} + C`), m(`\\frac{1}{${a}}\\tan^{-1}\\frac{x}{${a}} + C`)], [`Standard form with ${m(`a = ${a}`)}`]),
          P('c', `Evaluate ${m(`\\displaystyle\\int_0^{${a}} \\frac{1}{${a * a} + x^2}\\,dx`)}, correct to 3 decimal places.`, 'num', rnd(v, 3), dec(v), [m(`= \\frac{1}{${a}}\\left[\\tan^{-1}\\frac{x}{${a}}\\right]_0^{${a}} = \\frac{1}{${a}} \\cdot \\frac{\\pi}{4} = \\frac{\\pi}{${4 * a}}`), m(`\\approx ${dec(v)}`)], 1, { round: 3 }),
        ],
      };
    },
    function completeSquare() {
      const h = rnz(-4, 4), a = ri(1, 4), b = 2 * h, c = h * h + a * a;
      const quad = `x^2 ${b < 0 ? '+' : '-'} ${Math.abs(b)}x + ${c}`; // = (x − h)^2 + a^2
      return {
        level: 'S', tags: ['4.1'], stem: `Find ${m(`\\displaystyle\\int \\frac{1}{${quad}}\\,dx`)}.`,
        parts: [
          CH('a', 'Complete the square in the denominator.', m(`(${tlin(-h)})^2 + ${a * a}`), [m(`(${tlin(h)})^2 + ${a * a}`), m(`(${tlin(-h)})^2 + ${c}`), m(`(${tlin(-b)})^2 + ${a * a}`)], [m(`${quad} = (${tlin(-h)})^2 - ${h * h} + ${c}`), m(`= (${tlin(-h)})^2 + ${a * a}`)]),
          CH('b', 'Hence find the integral.', m(atan(a, -h)), [m(atan(a, h)), m(a === 1 ? `\\frac{1}{2}\\tan^{-1}(${tlin(-h)}) + C` : `\\tan^{-1}\\frac{${tlin(-h)}}{${a * a}} + C`), m(a === 1 ? `\\ln\\left((${tlin(-h)})^2 + 1\\right) + C` : `${a}\\tan^{-1}\\left(${a}(${tlin(-h)})\\right) + C`)], [`Let ${m(`u = ${tlin(-h)}`)}: ${m(`\\int \\frac{du}{u^2 + ${a * a}}`)}`], 2),
        ],
      };
    },
    function partialFractions() {
      let p, q; do { p = rnz(-4, 4); q = rnz(-4, 4); } while (p === q);
      const A = rnz(-4, 4), B = rnz(-4, 4), mm = A + B, n = -(A * q + B * p);
      if (mm === 0) return partialFractions();
      const top = `${mm === 1 ? '' : mm === -1 ? '-' : mm}x${n === 0 ? '' : n < 0 ? ' - ' + -n : ' + ' + n}`;
      return {
        level: 'S', tags: ['4.3'], stem: `Write ${m(`\\dfrac{${top}}{(${tlin(-p)})(${tlin(-q)})} = \\dfrac{A}{${tlin(-p)}} + \\dfrac{B}{${tlin(-q)}}`)}.`,
        parts: [
          P('a', 'Find $A$.', 'num', A, String(A), [m(`${top} = A(${tlin(-q)}) + B(${tlin(-p)})`), `${m(`x = ${p}`)}: ${m(`${mm * p + n} = ${p - q}A`)}, so ${m(`A = ${A}`)}`]),
          P('b', 'Find $B$.', 'num', B, String(B), [`${m(`x = ${q}`)}: ${m(`${mm * q + n} = ${q - p}B`)}, so ${m(`B = ${B}`)}`]),
          CH('c', 'Hence find the integral of the original fraction.', m(lnSum(A, p, B, q)), [m(lnSum(B, p, A, q)), m(lnSum(-A, p, -B, q)), m(`\\ln|(${tlin(-p)})(${tlin(-q)})| + C`)], [m('\\int \\frac{A}{x - a}\\,dx = A\\ln|x - a| + C')], 2),
        ],
      };
    },
    function byParts() {
      const k = ri(2, 5), b = ri(1, 3), val = (b - 1) * Math.exp(b) + 1;
      return {
        level: 'S', tags: ['4.5'], stem: 'Integration by parts.',
        parts: [
          CH('a', m(`\\displaystyle\\int xe^{${k}x}\\,dx`), m(`\\frac{e^{${k}x}(${k}x - 1)}{${k * k}} + C`), [m(`\\frac{e^{${k}x}(${k}x + 1)}{${k * k}} + C`), m(`\\frac{xe^{${k}x}}{${k}} + C`), m(`\\frac{e^{${k}x}(x - 1)}{${k}} + C`)], [`${m('u = x')}, ${m(`dv = e^{${k}x}dx \\Rightarrow v = \\frac{e^{${k}x}}{${k}}`)}`, m(`\\frac{xe^{${k}x}}{${k}} - \\int \\frac{e^{${k}x}}{${k}}\\,dx = \\frac{xe^{${k}x}}{${k}} - \\frac{e^{${k}x}}{${k * k}} + C`)], 2),
          P('b', `Evaluate ${m(`\\displaystyle\\int_0^{${b}} xe^x\\,dx`)}, correct to 3 decimal places.`, 'num', rnd(val, 3), dec(val), [m(`= \\left[(x - 1)e^x\\right]_0^{${b}} = ${b - 1}e^{${b}} + 1`), m(`\\approx ${dec(val)}`)], 1, { round: 3 }),
        ],
      };
    },
    function substitution() {
      const c = ri(1, 9), n = ri(2, 6);
      return {
        level: 'F', tags: ['4.2'], stem: 'Use the reverse chain rule or a substitution.',
        parts: [
          CH('a', m(`\\displaystyle\\int 2x(x^2 + ${c})^{${n}}\\,dx`), m(`\\frac{(x^2 + ${c})^{${n + 1}}}{${n + 1}} + C`), [m(`(x^2 + ${c})^{${n + 1}} + C`), m(`\\frac{(x^2 + ${c})^{${n + 1}}}{${2 * (n + 1)}} + C`), m(`\\frac{2(x^2 + ${c})^{${n + 1}}}{${n + 1}} + C`)], [m(`u = x^2 + ${c},\\ du = 2x\\,dx`), m(`\\int u^{${n}}\\,du = \\frac{u^{${n + 1}}}{${n + 1}} + C`)]),
          CH('b', m(`\\displaystyle\\int \\frac{${2 * c}x}{x^2 + ${c}}\\,dx`), m(`${coef(c)}\\ln(x^2 + ${c}) + C`), [m(`${2 * c}\\ln(x^2 + ${c}) + C`), m(`\\frac{1}{${2 * c}}\\ln(x^2 + ${c}) + C`), m(`${coef(c)}\\tan^{-1}\\frac{x}{${c}} + C`), m(`\\ln(x^2 + ${c}) + C`)], [m(`${2 * c}x = ${c} \\times 2x`) + ', and ' + m('2x') + ' is the derivative of the bottom', m(`= ${coef(c)}\\ln(x^2 + ${c}) + C`)]),
        ],
      };
    },
    function recurrence() {
      const n = ri(2, 7), I = (k) => (k === 0 ? Math.PI / 2 : k === 1 ? 1 : ((k - 1) / k) * I(k - 2));
      return {
        level: 'C', tags: ['4.6'], stem: `Let ${m('\\displaystyle I_n = \\int_0^{\\pi/2} \\sin^n x\\,dx')}, where ${m('I_n = \\frac{n - 1}{n}I_{n-2}')}.`,
        parts: [
          P('a', 'Find $I_1$.', 'num', 1, '1', [m('\\int_0^{\\pi/2} \\sin x\\,dx = \\left[-\\cos x\\right]_0^{\\pi/2} = 0 - (-1) = 1')]),
          P('b', `Find ${m(`I_{${n}}`)}, correct to 3 decimal places.`, 'num', rnd(I(n), 3), dec(I(n)), [m(`I_{${n}} = ${tf(n - 1, n)}I_{${n - 2}} = \\dots`), `stepping down to ${m(`I_{${n % 2}} = ${n % 2 ? '1' : '\\frac{\\pi}{2}'}`)}`, m(`\\approx ${dec(I(n))}`)], 2, { round: 3 }),
        ],
      };
    },
    function trigPowers() {
      const k = ri(1, 4), kx = k === 1 ? 'x' : `${k}x`;
      return {
        level: 'S', tags: ['4.4', '4.7'], stem: 'Trigonometric integrals.',
        parts: [
          CH('a', m(`\\displaystyle\\int \\sin^2 ${kx}\\,dx`), m(`\\frac{x}{2} - \\frac{\\sin ${2 * k}x}{${4 * k}} + C`), [m(`\\frac{x}{2} + \\frac{\\sin ${2 * k}x}{${4 * k}} + C`), m(`\\frac{x}{2} - \\frac{\\cos ${2 * k}x}{${4 * k}} + C`), m(`\\frac{\\sin^3 ${kx}}{3} + C`)], [m('\\sin^2\\theta = \\frac{1}{2}(1 - \\cos 2\\theta)'), m(`\\int \\frac{1 - \\cos ${2 * k}x}{2}\\,dx = \\frac{x}{2} - \\frac{\\sin ${2 * k}x}{${4 * k}} + C`)]),
          P('b', `Evaluate ${m('\\displaystyle\\int_0^{\\pi} \\sin^2 x\\,dx')}, correct to 3 decimal places.`, 'num', rnd(Math.PI / 2, 3), dec(Math.PI / 2), [m('\\left[\\frac{x}{2} - \\frac{\\sin 2x}{4}\\right]_0^{\\pi} = \\frac{\\pi}{2} \\approx 1.571')], 1, { round: 3 }),
          P('c', `Evaluate ${m(`\\displaystyle\\int_{-${k}}^{${k}} x^3\\cos x\\,dx`)}.`, 'num', 0, '0', [m('x^3\\cos x') + ' is odd', 'Odd function over a symmetric interval, so the integral is 0']),
        ],
      };
    },
  ];

  /* ================= 5. VECTORS ================= */
  const vectors = finish({
    id: 'e2vectors', subject: 'y12', title: 'Vectors', chapter: 'Ext 2 · 5', hue: 'green',
    blurb: '3D vectors, dot product, geometric proofs, vector equations of lines, spheres and curves.',
    sections: [
      { code: '5.1', name: 'Three dimensional vectors', notes: ['$\\mathbf{a} = x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k} = \\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}$', '$|\\mathbf{a}| = \\sqrt{x^2 + y^2 + z^2}$. The unit vector in the direction of $\\mathbf{a}$ is $\\hat{\\mathbf{a}} = \\dfrac{\\mathbf{a}}{|\\mathbf{a}|}$.', '$\\overrightarrow{AB} = \\overrightarrow{OB} - \\overrightarrow{OA}$ (end minus start).'], ex: ['$|2\\mathbf{i} - 3\\mathbf{j} + 6\\mathbf{k}|$', '$= \\sqrt{4 + 9 + 36}$', '$= \\sqrt{49} = 7$'] },
      { code: '5.2', name: 'Dot product & geometric proofs', notes: ['$\\mathbf{a} \\cdot \\mathbf{b} = x_1x_2 + y_1y_2 + z_1z_2 = |\\mathbf{a}||\\mathbf{b}|\\cos\\theta$', '$\\mathbf{a} \\cdot \\mathbf{b} = 0$ (non-zero vectors) means $\\mathbf{a} \\perp \\mathbf{b}$. Also $\\mathbf{a} \\cdot \\mathbf{a} = |\\mathbf{a}|^2$.', 'Parallel vectors are scalar multiples: $\\mathbf{a} = \\lambda\\mathbf{b}$.', 'Use these to prove geometry results, e.g. the diagonals of a rhombus are perpendicular.'], ex: ['Angle between $(1, 2, 2)$ and $(2, 1, -2)$', '$\\mathbf{a} \\cdot \\mathbf{b} = 2 + 2 - 4 = 0$', '$\\theta = 90^\\circ$'] },
      { code: '5.3', name: 'Vector equation of a line', notes: ['A line through point $A$ with direction $\\mathbf{d}$: $\\mathbf{r} = \\mathbf{a} + \\lambda\\mathbf{d}$, $\\lambda \\in \\mathbb{R}$.', 'Through $A$ and $B$: $\\mathbf{r} = \\mathbf{a} + \\lambda(\\mathbf{b} - \\mathbf{a})$.', 'Parametric form: $x = a_1 + \\lambda d_1$, $y = a_2 + \\lambda d_2$, $z = a_3 + \\lambda d_3$.'], ex: ['Line through $(1, 0, 2)$ and $(3, 1, 5)$', '$\\mathbf{d} = (2, 1, 3)$', '$\\mathbf{r} = \\begin{pmatrix}1\\\\0\\\\2\\end{pmatrix} + \\lambda\\begin{pmatrix}2\\\\1\\\\3\\end{pmatrix}$'] },
      { code: '5.4', name: 'Properties of lines', notes: ['Lines are parallel if their directions are scalar multiples.', 'To test if a point is on a line, solve for $\\lambda$ in each coordinate: one consistent $\\lambda$ means yes.', 'Lines intersect if one pair $(\\lambda, \\mu)$ satisfies all three coordinate equations; otherwise in 3D they may be skew.'], ex: ['Is $(5, 2, 8)$ on $\\mathbf{r} = (1, 0, 2) + \\lambda(2, 1, 3)$?', '$x$: $\\lambda = 2$; $y$: $\\lambda = 2$; $z$: $\\lambda = 2$', 'Yes, $\\lambda = 2$'] },
      { code: '5.5', name: 'Spheres and curves', notes: ['$|\\mathbf{r} - \\mathbf{c}| = R$ is a sphere (in 3D) or circle (in 2D) with centre $\\mathbf{c}$ and radius $R$.', 'Expanded: $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$.', 'Vector functions like $\\mathbf{r}(t) = \\cos t\\,\\mathbf{i} + \\sin t\\,\\mathbf{j}$ trace curves: eliminate $t$ to get the Cartesian equation.'], ex: ['$\\mathbf{r}(t) = 3\\cos t\\,\\mathbf{i} + 3\\sin t\\,\\mathbf{j}$', '$x^2 + y^2 = 9\\cos^2 t + 9\\sin^2 t$', 'Circle, radius 3'] },
    ],
    cards: [
      ['$|x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}|$', '$\\sqrt{x^2 + y^2 + z^2}$'], ['Unit vector $\\hat{\\mathbf{a}}$', '$\\frac{\\mathbf{a}}{|\\mathbf{a}|}$'], ['$\\overrightarrow{AB}$', '$\\mathbf{b} - \\mathbf{a}$'], ['$\\mathbf{a} \\cdot \\mathbf{b}$ (components)', '$x_1x_2 + y_1y_2 + z_1z_2$'],
      ['$\\mathbf{a} \\cdot \\mathbf{b}$ (angle)', '$|\\mathbf{a}||\\mathbf{b}|\\cos\\theta$'], ['$\\mathbf{a} \\cdot \\mathbf{b} = 0$ means', 'Perpendicular (if both non-zero)'], ['Parallel vectors', '$\\mathbf{a} = \\lambda\\mathbf{b}$'], ['Line through $A$, direction $\\mathbf{d}$', '$\\mathbf{r} = \\mathbf{a} + \\lambda\\mathbf{d}$'],
      ['Sphere, centre $\\mathbf{c}$, radius $R$', '$|\\mathbf{r} - \\mathbf{c}| = R$'], ['Skew lines', 'Not parallel and never meet (3D only)'],
    ],
    concepts: [
      ['$|\\mathbf{i} + 2\\mathbf{j} - 2\\mathbf{k}| = $', ['3', '5', '9', '1'], 0, '$\\sqrt{1 + 4 + 4} = 3$.'],
      ['If $\\mathbf{a} \\cdot \\mathbf{b} = 0$ and both are non-zero, the vectors are…', ['Perpendicular', 'Parallel', 'Equal', 'Opposite'], 0, ''],
      ['$(2, -1, 3) \\cdot (1, 4, 2) = $', ['4', '10', '0', '−4'], 0, '$2 - 4 + 6 = 4$.'],
      ['Which is parallel to $(1, -2, 3)$?', ['$(-2, 4, -6)$', '$(2, 4, 6)$', '$(3, -2, 1)$', '$(1, 2, 3)$'], 0, '$-2$ times the vector.'],
      ['$\\mathbf{r} = (1, 2, 3) + \\lambda(0, 1, 0)$ is parallel to the…', ['$y$-axis', '$x$-axis', '$z$-axis', '$xy$-plane only'], 0, ''],
      ['$|\\mathbf{r} - (1, 0, 2)| = 4$ is a sphere with radius…', ['4', '2', '16', '$\\sqrt{5}$'], 0, ''],
    ],
  });
  const VTRIPLES = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [3, 4, 12, 13], [6, 6, 7, 11], [2, 10, 11, 15]];
  vectors.bank = [
    function magnitude() {
      const [x, y, z, mg] = pick(VTRIPLES), v = shuffle([x, y, z]).map(c => c * pick([1, -1]));
      return {
        level: 'F', tags: ['5.1'], stem: `Let ${m(`\\mathbf{a} = ${tijk(v)}`)}.`,
        parts: [
          P('a', 'Find $|\\mathbf{a}|$.', 'num', mg, String(mg), [m(`\\sqrt{${v.map(c => `(${c})^2`).join(' + ')}} = \\sqrt{${mg * mg}} = ${mg}`)]),
          P('b', 'Find the $\\mathbf{i}$-component of the unit vector $\\hat{\\mathbf{a}}$.', 'num', v[0] / mg, m(tf(v[0], mg)), [m(`\\hat{\\mathbf{a}} = \\frac{1}{${mg}}\\mathbf{a}`), `so the ${m('\\mathbf{i}')}-component is ${m(tf(v[0], mg))}`]),
        ],
      };
    },
    function dotProduct() {
      const b = [rnz(-4, 4), rnz(-4, 4), ri(-4, 4)], perp = Math.random() < 0.4;
      const a = perp ? [b[1], -b[0], 0] : [rnz(-4, 4), ri(-4, 4), rnz(-4, 4)];
      const d = dot(a, b), angle = Math.acos(Math.max(-1, Math.min(1, d / (mag(a) * mag(b))))) * 180 / Math.PI; // clamp: rounding can push cos past ±1
      return {
        level: 'S', tags: ['5.2'], stem: `Let ${m(`\\mathbf{a} = ${tvec(a)}`)} and ${m(`\\mathbf{b} = ${tvec(b)}`)}.`,
        parts: [
          P('a', 'Find $\\mathbf{a} \\cdot \\mathbf{b}$.', 'num', d, String(d), [m(a.map((x, i) => `(${x})(${b[i]})`).join(' + ') + ` = ${d}`)]),
          CH('b', 'Are $\\mathbf{a}$ and $\\mathbf{b}$ perpendicular?', d === 0 ? 'Yes' : 'No', [d === 0 ? 'No' : 'Yes'], [d === 0 ? '$\\mathbf{a} \\cdot \\mathbf{b} = 0$, so they are perpendicular' : '$\\mathbf{a} \\cdot \\mathbf{b} \\ne 0$, so they are not perpendicular']),
          P('c', 'Find the angle between $\\mathbf{a}$ and $\\mathbf{b}$, to the nearest degree.', 'num', Math.round(angle), m(`${Math.round(angle)}^\\circ`), [m(`\\cos\\theta = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{|\\mathbf{a}||\\mathbf{b}|} = \\frac{${d}}{\\sqrt{${dot(a, a)}}\\sqrt{${dot(b, b)}}}`), m(`\\theta \\approx ${dec(angle, 1)}^\\circ`)], 2, { round: 0 }),
        ],
      };
    },
    function lineThrough() {
      const A = [ri(-3, 4), ri(-3, 4), ri(-3, 4)], d = [rnz(-3, 3), rnz(-3, 3), rnz(-3, 3)], B = A.map((c, i) => c + d[i]);
      const lam = rnz(-3, 3), on = Math.random() < 0.5, C = A.map((c, i) => c + lam * d[i] + (on || i !== 1 ? 0 : 1));
      return {
        level: 'S', tags: ['5.3', '5.4'], stem: `A line passes through ${m(`A${tpt(A)}`)} and ${m(`B${tpt(B)}`)}.`,
        parts: [
          P('a', 'Find the $x$-component of $\\overrightarrow{AB}$.', 'num', d[0], String(d[0]), [m(`\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a} = ${tvec(d)}`)]),
          P('b', 'Find the $z$-component of $\\overrightarrow{AB}$.', 'num', d[2], String(d[2]), [m(`${B[2]} - (${A[2]}) = ${d[2]}`)]),
          CH('c', `Does the point ${m(tpt(C))} lie on the line ${m(`\\mathbf{r} = ${tvec(A)} + \\lambda${tvec(d)}`)}?`, on ? 'Yes' : 'No', [on ? 'No' : 'Yes'], on ? [`${m(`\\lambda = ${lam}`)} works in all three coordinates`] : [`$x$ and $z$ give ${m(`\\lambda = ${lam}`)}, but $y$ gives a different value`], 2),
        ],
      };
    },
    function unknowns() {
      const b = [rnz(-3, 3), rnz(-3, 3), rnz(-3, 3)], k = rnz(-3, 3), a = b.map(c => c * k);
      const c = [rnz(-4, 4), rnz(-4, 4), rnz(-4, 4)], rest = c[1] * b[1] + c[2] * b[2], pp = b[0]; // (μ, c1, c2) ⊥ b
      const mu = -rest / pp;
      return {
        level: 'C', tags: ['5.2'], stem: 'Parallel and perpendicular vectors.',
        parts: [
          P('a', `${m(`\\begin{pmatrix}${a[0]}\\\\y\\\\${a[2]}\\end{pmatrix}`)} is parallel to ${m(tvec(b))}. Find $y$.`, 'num', a[1], String(a[1]), [`The scale factor is ${m(`${a[0]} \\div ${b[0]} = ${k}`)}`, m(`y = ${k} \\times ${b[1]} = ${a[1]}`)], 2),
          P('b', `${m(`\\begin{pmatrix}\\mu\\\\${c[1]}\\\\${c[2]}\\end{pmatrix}`)} is perpendicular to ${m(tvec(b))}. Find ${m('\\mu')}${Number.isInteger(mu) ? '' : ' (a fraction is fine)'}.`, 'num', mu, m(tf(-rest, pp)), [m(`${b[0]}\\mu + (${c[1]})(${b[1]}) + (${c[2]})(${b[2]}) = 0`), m(`${b[0]}\\mu ${rest < 0 ? '-' : '+'} ${Math.abs(rest)} = 0 \\Rightarrow \\mu = ${tf(-rest, pp)}`)], 2),
        ],
      };
    },
    function sphere() {
      const c = [ri(-4, 4), ri(-4, 4), ri(-4, 4)], R = ri(2, 7);
      const sq = (v, n) => (v === 0 ? `${n}^2` : `(${n} ${v < 0 ? '+' : '-'} ${Math.abs(v)})^2`);
      return {
        level: 'S', tags: ['5.5'], stem: `A sphere has equation ${m(`${sq(c[0], 'x')} + ${sq(c[1], 'y')} + ${sq(c[2], 'z')} = ${R * R}`)}.`,
        parts: [
          P('a', 'What is its radius?', 'num', R, String(R), [m(`R^2 = ${R * R} \\Rightarrow R = ${R}`)]),
          P('b', 'What is the $x$-coordinate of its centre?', 'num', c[0], String(c[0]), [m('(x - a)^2') + ' means the centre has ' + m(`x = a = ${c[0]}`)]),
          CH('c', `Is the point ${m(tpt([c[0] + R, c[1], c[2]]))} on the sphere?`, 'Yes', ['No'], [`Its distance from the centre is ${R}, the radius`]),
        ],
      };
    },
  ];

  /* ================= 6. MECHANICS ================= */
  const mechanics = finish({
    id: 'e2mechanics', subject: 'y12', title: 'Mechanics', chapter: 'Ext 2 · 6', hue: 'coral',
    blurb: 'Motion in a line, simple harmonic motion, resisted motion and projectiles with and without resistance.',
    sections: [
      { code: '6.1', name: 'Motion in a straight line', notes: ['$v = \\dfrac{dx}{dt}$ and $a = \\dfrac{dv}{dt} = \\dfrac{d^2x}{dt^2}$.', 'Other forms of acceleration: $a = v\\dfrac{dv}{dx} = \\dfrac{d}{dx}\\left(\\tfrac{1}{2}v^2\\right)$. Use these when $a$ is given in terms of $x$.', 'Newton\'s second law: $F = ma$. Draw a force diagram and choose a positive direction.'], ex: ['$x = t^3 - 6t^2 + 9t$. When is it at rest?', '$v = 3t^2 - 12t + 9 = 3(t - 1)(t - 3)$', '$t = 1$ and $t = 3$'] },
      { code: '6.2', name: 'Simple harmonic motion', notes: ['SHM: $\\ddot{x} = -n^2(x - c)$, centre $c$.', 'Solutions: $x = c + A\\cos(nt + \\alpha)$. Amplitude $A$, period $T = \\dfrac{2\\pi}{n}$.', '$v^2 = n^2\\left(A^2 - (x - c)^2\\right)$. Maximum speed $nA$ at the centre; maximum acceleration $n^2A$ at the extremes.'], ex: ['$x = 5\\cos 2t$. Maximum speed?', '$n = 2$, $A = 5$', '$v_{\\max} = nA = 10$'] },
      { code: '6.3', name: 'Horizontal resisted motion', notes: ['Resistance opposes motion: $\\ddot{x} = -kv$ or $\\ddot{x} = -kv^2$ ($k > 0$).', 'For $\\ddot{x} = -kv$: $v = Ve^{-kt}$, and the particle travels a total distance $\\dfrac{V}{k}$.', 'Separate variables: $dt = \\dfrac{dv}{-kv}$, or use $v\\dfrac{dv}{dx}$ for distance.'], ex: ['$\\ddot{x} = -0.5v$, $V = 10$. Time to halve speed?', '$10e^{-0.5t} = 5$', '$t = 2\\ln 2 \\approx 1.386$ s'] },
      { code: '6.4', name: 'Vertical resisted motion', notes: ['Falling with resistance $kv$: $\\ddot{x} = g - kv$ (down positive). Terminal velocity $v_T = \\dfrac{g}{k}$.', 'With resistance $kv^2$: $v_T = \\sqrt{\\dfrac{g}{k}}$.', 'Going up, gravity and resistance act together; coming down, they oppose.'], ex: ['$g = 10$, resistance $0.2v$. Terminal velocity?', '$\\ddot{x} = 0$ when $10 = 0.2v$', '$v_T = 50$ m/s'] },
      { code: '6.5', name: 'Projectile motion', notes: ['Without resistance (speed $V$, angle $\\theta$): $x = Vt\\cos\\theta$, $y = Vt\\sin\\theta - \\tfrac{1}{2}gt^2$.', 'Time of flight $\\dfrac{2V\\sin\\theta}{g}$; maximum height $\\dfrac{V^2\\sin^2\\theta}{2g}$; range $\\dfrac{V^2\\sin 2\\theta}{g}$ (greatest at $45^\\circ$).', 'Cartesian path: $y = x\\tan\\theta - \\dfrac{gx^2}{2V^2\\cos^2\\theta}$.', 'With resistance, resolve horizontally and vertically and solve each differential equation.'], ex: ['$V = 20$, $\\theta = 30^\\circ$, $g = 10$. Range?', '$\\frac{400\\sin 60^\\circ}{10}$', '$= 20\\sqrt{3} \\approx 34.64$ m'] },
    ],
    cards: [
      ['Acceleration forms', '$\\frac{dv}{dt} = v\\frac{dv}{dx} = \\frac{d}{dx}\\left(\\frac{1}{2}v^2\\right)$'], ['SHM equation', '$\\ddot{x} = -n^2(x - c)$'], ['SHM period', '$\\frac{2\\pi}{n}$'], ['SHM speed', '$v^2 = n^2(A^2 - (x - c)^2)$'],
      ['SHM maximum speed', '$nA$ (at the centre)'], ['Resistance $kv$: speed', '$v = Ve^{-kt}$'], ['Terminal velocity ($kv$)', '$\\frac{g}{k}$'], ['Terminal velocity ($kv^2$)', '$\\sqrt{\\frac{g}{k}}$'],
      ['Projectile range', '$\\frac{V^2\\sin 2\\theta}{g}$'], ['Projectile maximum height', '$\\frac{V^2\\sin^2\\theta}{2g}$'], ['Time of flight', '$\\frac{2V\\sin\\theta}{g}$'], ['Newton\'s second law', '$F = ma$'],
    ],
    concepts: [
      ['$x = 3\\sin 4t$ has period…', ['$\\frac{\\pi}{2}$', '$4\\pi$', '$2\\pi$', '$\\frac{\\pi}{4}$'], 0, '$\\frac{2\\pi}{4} = \\frac{\\pi}{2}$.'],
      ['In SHM, the speed is greatest…', ['At the centre', 'At the extremes', 'Halfway to an extreme', 'It is constant'], 0, ''],
      ['Which form of acceleration suits $a$ given as a function of $x$?', ['$v\\frac{dv}{dx}$', '$\\frac{dv}{dt}$', '$\\frac{dx}{dt}$', '$\\frac{d^2t}{dx^2}$'], 0, ''],
      ['The range of a projectile is greatest at…', ['$45^\\circ$', '$30^\\circ$', '$60^\\circ$', '$90^\\circ$'], 0, '$\\sin 2\\theta$ is greatest when $2\\theta = 90^\\circ$.'],
      ['Falling with resistance $kv$, terminal velocity is…', ['$\\frac{g}{k}$', '$\\sqrt{\\frac{g}{k}}$', '$gk$', '$\\frac{k}{g}$'], 0, 'Set $\\ddot{x} = g - kv = 0$.'],
      ['With $\\ddot{x} = -kv$, the particle…', ['Slows forever but travels a finite distance', 'Stops after a finite time', 'Speeds up', 'Moves in SHM'], 0, '$v = Ve^{-kt}$ never reaches 0, but distance $\\to \\frac{V}{k}$.'],
    ],
  });
  mechanics.bank = [
    function motion() {
      const p = ri(1, 3), q = ri(-6, 6), r = ri(-9, 9), t = ri(1, 4), v = 3 * p * t * t + 2 * q * t + r, a = 6 * p * t + 2 * q;
      const sg = (n, s) => `${n < 0 ? '-' : '+'} ${Math.abs(n)}${s}`;
      return {
        level: 'F', tags: ['6.1'], stem: `A particle moves so that ${m(`x = ${p === 1 ? '' : p}t^3 ${sg(q, 't^2')} ${sg(r, 't')}`)} (metres, seconds).`,
        parts: [
          P('a', `Find its velocity when ${m(`t = ${t}`)}.`, 'num', v, `${v} m/s`, [m(`v = \\frac{dx}{dt} = ${3 * p}t^2 ${sg(2 * q, 't')} ${sg(r, '')}`), m(`v(${t}) = ${v}`)]),
          P('b', `Find its acceleration when ${m(`t = ${t}`)}.`, 'num', a, m(`${a}\\text{ m/s}^2`), [m(`a = \\frac{dv}{dt} = ${6 * p}t ${sg(2 * q, '')}`), m(`a(${t}) = ${a}`)]),
        ],
      };
    },
    function shm() {
      const A = ri(2, 8), n = ri(2, 5), c = ri(-3, 3), d = ri(1, A - 1), v = n * Math.sqrt(A * A - d * d), T = 2 * Math.PI / n;
      return {
        level: 'S', tags: ['6.2'], stem: `A particle moves in SHM with ${m(`x = ${c === 0 ? '' : c + ' + '}${A}\\cos ${n}t`)} (metres, seconds).`,
        parts: [
          P('a', 'What is the centre of motion?', 'num', c, m(`x = ${c}`), [m('x = c + A\\cos nt') + ` has centre ${m(`x = ${c}`)}`]),
          P('b', 'Find the period, correct to 2 decimal places.', 'num', rnd(T, 2), `${dec(T, 2)} s`, [m(`T = \\frac{2\\pi}{n} = \\frac{2\\pi}{${n}} \\approx ${dec(T, 2)}`)], 1, { round: 2 }),
          P('c', 'Find the maximum speed.', 'num', n * A, `${n * A} m/s`, [m(`v_{\\max} = nA = ${n} \\times ${A} = ${n * A}`)]),
          P('d', `Find the speed when the particle is ${d} m from the centre, correct to 2 decimal places.`, 'num', rnd(v, 2), `${dec(v, 2)} m/s`, [m(`v^2 = n^2(A^2 - d^2) = ${n * n}(${A * A} - ${d * d})`), m(`v = ${n}\\sqrt{${A * A - d * d}} \\approx ${dec(v, 2)}`)], 2, { round: 2 }),
        ],
      };
    },
    function projectile() {
      const V = pick([20, 30, 40, 50]), th = pick([30, 45, 60]), g = 10, s = Math.sin(th * Math.PI / 180);
      const T = 2 * V * s / g, H = V * V * s * s / (2 * g), R = V * V * Math.sin(2 * th * Math.PI / 180) / g;
      return {
        level: 'S', tags: ['6.5'], stem: `A ball is projected from the ground at ${V} m/s at ${m(`${th}^\\circ`)} to the horizontal. Take ${m('g = 10\\text{ m/s}^2')} and ignore air resistance. Give answers to 2 decimal places.`,
        parts: [
          P('a', 'Find the time of flight.', 'num', rnd(T, 2), `${dec(T, 2)} s`, [m(`T = \\frac{2V\\sin\\theta}{g} = \\frac{2(${V})\\sin ${th}^\\circ}{10} \\approx ${dec(T, 2)}`)], 1, { round: 2 }),
          P('b', 'Find the maximum height.', 'num', rnd(H, 2), `${dec(H, 2)} m`, [m(`H = \\frac{V^2\\sin^2\\theta}{2g} = \\frac{${V * V}\\sin^2 ${th}^\\circ}{20} \\approx ${dec(H, 2)}`)], 1, { round: 2 }),
          P('c', 'Find the horizontal range.', 'num', rnd(R, 2), `${dec(R, 2)} m`, [m(`R = \\frac{V^2\\sin 2\\theta}{g} = \\frac{${V * V}\\sin ${2 * th}^\\circ}{10} \\approx ${dec(R, 2)}`)], 2, { round: 2 }),
        ],
      };
    },
    function resisted() {
      const k = pick([0.1, 0.2, 0.25, 0.5]), V = pick([10, 20, 30, 40]), t = ri(1, 4), vt = V * Math.exp(-k * t), th = Math.log(2) / k;
      return {
        level: 'C', tags: ['6.3'], stem: `A boat moving at ${V} m/s cuts its engine. The water slows it so that ${m(`\\ddot{x} = -${k}v`)}.`,
        parts: [
          P('a', `Find its speed after ${t} s, to 2 decimal places.`, 'num', rnd(vt, 2), `${dec(vt, 2)} m/s`, [m(`\\frac{dv}{dt} = -${k}v \\Rightarrow v = ${V}e^{-${k}t}`), m(`v(${t}) = ${V}e^{-${dec(k * t, 2)}} \\approx ${dec(vt, 2)}`)], 2, { round: 2 }),
          P('b', 'How long until its speed has halved? (3 decimal places)', 'num', rnd(th, 3), `${dec(th)} s`, [m(`${V / 2} = ${V}e^{-${k}t}`), m(`t = \\frac{\\ln 2}{${k}} \\approx ${dec(th)}`)], 1, { round: 3 }),
          P('c', 'How far does it travel before (in theory) stopping?', 'num', V / k, `${dec(V / k, 2)} m`, [m(`v\\frac{dv}{dx} = -${k}v \\Rightarrow \\frac{dv}{dx} = -${k}`), m(`x = \\frac{V - v}{k} \\to \\frac{${V}}{${k}} = ${dec(V / k, 2)}`)]),
        ],
      };
    },
    function terminal() {
      const k = pick([0.02, 0.04, 0.05, 0.1, 0.2, 0.25, 0.4, 0.5]), quad = Math.random() < 0.5, vT = quad ? Math.sqrt(10 / k) : 10 / k, rv = quad ? `${k}v^2` : `${k}v`;
      return {
        level: 'C', tags: ['6.4'], stem: `An object falls from rest. Air resistance is ${m(rv)} per unit mass and ${m('g = 10\\text{ m/s}^2')}.`,
        parts: [
          CH('a', 'Which equation of motion is correct (down positive)?', m(`\\ddot{x} = 10 - ${rv}`), [m(`\\ddot{x} = -10 - ${rv}`), m(`\\ddot{x} = 10 + ${rv}`), m(`\\ddot{x} = ${rv} - 10`)], ['Gravity acts down (+); resistance opposes the downward motion (−)']),
          P('b', 'Find the terminal velocity, to 2 decimal places.', 'num', rnd(vT, 2), `${dec(vT, 2)} m/s`, [`Set ${m('\\ddot{x} = 0')}: ${m(`${rv} = 10`)}`, m(`v = ${quad ? `\\sqrt{\\frac{10}{${k}}}` : `\\frac{10}{${k}}`} \\approx ${dec(vT, 2)}`)], 2, { round: 2 }),
        ],
      };
    },
  ];

  return { DECKS: [proof, complex, induction, integration, vectors, mechanics] };
})();
if (typeof module !== 'undefined') module.exports = E2;
