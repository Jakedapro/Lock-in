/* ===== Lock In — HSC Mathematics Extension 1 =====
   Modelled on the style of recent HSC papers (Section I multiple choice, Section II multi-part
   questions). All notes and questions are original; answers and working are computed. */

const E1 = (() => {
  const T = typeof TK !== 'undefined' ? TK : require('./texkit.js');
  const E2x = typeof E2 !== 'undefined' ? E2 : require('./ext2.js');
  const { ri, rnz, pick, shuffle, gcd, rnd, fact, nCr, P, CH, finish, m, dec, tf, tlin } = T;
  const SUBJECT = 'e1';

  /* ================= POLYNOMIALS ================= */
  const poly = finish({
    id: 'e1poly', subject: SUBJECT, title: 'Polynomials', chapter: 'Ext 1 · Y11', hue: 'cyan',
    blurb: 'Remainder and factor theorems, sums and products of roots, multiplicity and graphs.',
    sections: [
      { code: 'P1', name: 'Remainder and factor theorems', notes: ['When $P(x)$ is divided by $(x - a)$, the remainder is $P(a)$.', 'So $(x - a)$ is a factor of $P(x)$ exactly when $P(a) = 0$.', 'Use it to find unknown coefficients: substitute the root and solve.'], ex: ['Remainder when $x^3 - 2x + 5$ is divided by $x - 2$', '$P(2) = 8 - 4 + 5$', '$= 9$'] },
      { code: 'P2', name: 'Sums and products of roots', notes: ['For $ax^2 + bx + c$: $\\alpha + \\beta = -\\frac{b}{a}$, $\\alpha\\beta = \\frac{c}{a}$.', 'For $ax^3 + bx^2 + cx + d$: $\\sum\\alpha = -\\frac{b}{a}$, $\\sum\\alpha\\beta = \\frac{c}{a}$, $\\alpha\\beta\\gamma = -\\frac{d}{a}$.', '$\\alpha^2 + \\beta^2 + \\gamma^2 = (\\sum\\alpha)^2 - 2\\sum\\alpha\\beta$.'], ex: ['$2x^3 - 6x^2 + x + 4 = 0$', '$\\sum\\alpha = 3$, $\\sum\\alpha\\beta = \\frac{1}{2}$', '$\\sum\\alpha^2 = 9 - 1 = 8$'] },
      { code: 'P3', name: 'Multiplicity and graphs', notes: ['A root of multiplicity 1 crosses the $x$-axis; multiplicity 2 touches it (turning point); multiplicity 3 crosses with a horizontal point of inflection.', 'The leading term decides the behaviour as $x \\to \\pm\\infty$.', 'A double root of $P$ is also a root of $P\'(x)$.'], ex: ['$P(x) = (x - 1)^2(x + 2)$ at $x = 1$', 'Multiplicity 2', 'The graph touches the axis at $x = 1$'] },
    ],
    cards: [
      ['Remainder theorem', 'Dividing $P(x)$ by $x - a$ leaves remainder $P(a)$'], ['Factor theorem', '$x - a$ is a factor $\\Leftrightarrow P(a) = 0$'], ['Quadratic: $\\alpha + \\beta$', '$-\\frac{b}{a}$'], ['Quadratic: $\\alpha\\beta$', '$\\frac{c}{a}$'],
      ['Cubic: $\\alpha\\beta\\gamma$', '$-\\frac{d}{a}$'], ['Cubic: $\\sum\\alpha\\beta$', '$\\frac{c}{a}$'], ['$\\sum\\alpha^2$', '$(\\sum\\alpha)^2 - 2\\sum\\alpha\\beta$'], ['Double root', 'Graph touches the axis; also a root of $P\'(x)$'], ['Triple root', 'Crosses with a horizontal point of inflection'],
    ],
    concepts: [
      ['The remainder when $x^3 + 1$ is divided by $x + 1$ is…', ['0', '2', '1', '−2'], 0, '$P(-1) = -1 + 1 = 0$.'],
      ['For $x^3 - 4x^2 + x + 6 = 0$, $\\alpha\\beta\\gamma = $', ['$-6$', '$6$', '$4$', '$1$'], 0, '$-\\frac{d}{a} = -6$.'],
      ['At a root of multiplicity 2, the graph…', ['Touches the axis', 'Crosses the axis', 'Has a vertical asymptote', 'Is undefined'], 0, ''],
      ['$P(x) = x^4 - \\dots$ as $x \\to -\\infty$', ['$P(x) \\to \\infty$', '$P(x) \\to -\\infty$', '$P(x) \\to 0$', '$P(x) \\to 1$'], 0, 'Even degree, positive leading coefficient.'],
      ['If $(x - 2)$ is a factor of $P(x)$ then…', ['$P(2) = 0$', '$P(-2) = 0$', '$P(0) = 2$', '$P(2) = 2$'], 0, ''],
      ['For $3x^2 + 5x - 2$, $\\alpha + \\beta = $', ['$-\\frac{5}{3}$', '$\\frac{5}{3}$', '$-\\frac{2}{3}$', '$-5$'], 0, ''],
    ],
  });
  const cubic = (r) => { const [a, b, c] = r; return [1, -(a + b + c), a * b + b * c + c * a, -a * b * c]; }; // x^3 + Bx^2 + Cx + D
  const polyTeX = (co) => co.map((c, i) => [c, 3 - i]).filter(([c]) => c !== 0).map(([c, p], i) => { const v = p === 0 ? '' : p === 1 ? 'x' : `x^${p}`, a = Math.abs(c), coef = a === 1 && p > 0 ? '' : a; return `${i === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${coef}${v}`; }).join('');
  poly.bank = [
    function remainder() {
      const co = [1, rnz(-5, 5), ri(-9, 9), ri(-9, 9)], k = rnz(-3, 3), val = co.reduce((acc, c) => acc * k + c, 0);
      return {
        level: 'F', tags: ['P1'], stem: `Let ${m(`P(x) = ${polyTeX(co)}`)}.`,
        parts: [
          P('a', `Find the remainder when ${m('P(x)')} is divided by ${m(tlin(-k))}.`, 'num', val, String(val), [`By the remainder theorem it is ${m(`P(${k})`)}`, m(`P(${k}) = ${val}`)]),
          CH('b', `Is ${m(tlin(-k))} a factor of ${m('P(x)')}?`, val === 0 ? 'Yes' : 'No', [val === 0 ? 'No' : 'Yes'], [val === 0 ? 'The remainder is 0' : 'The remainder is not 0']),
        ],
      };
    },
    function unknownCoefficient() {
      const r = [rnz(-4, 4), rnz(-4, 4), rnz(-4, 4)], co = cubic(r);
      const shown = `x^3 + ax^2 ${co[2] < 0 ? '-' : '+'} ${Math.abs(co[2])}x ${co[3] < 0 ? '-' : '+'} ${Math.abs(co[3])}`;
      return {
        level: 'S', tags: ['P1', 'P2'], stem: `${m(`P(x) = ${shown}`)} has a factor ${m(tlin(-r[0]))}.`,
        parts: [
          P('a', 'Find $a$.', 'num', co[1], String(co[1]), [`${m(`P(${r[0]}) = 0`)}: ${m(`${r[0] ** 3} + ${r[0] ** 2}a ${co[2] * r[0] < 0 ? '-' : '+'} ${Math.abs(co[2] * r[0])} ${co[3] < 0 ? '-' : '+'} ${Math.abs(co[3])} = 0`)}`, m(`a = ${co[1]}`)], 2),
          P('b', 'Find the product of the three roots.', 'num', -co[3], String(-co[3]), [m(`\\alpha\\beta\\gamma = -\\frac{d}{a} = ${-co[3]}`)]),
          P('c', 'Find the sum of the other two roots.', 'num', r[1] + r[2], String(r[1] + r[2]), [m(`\\sum\\alpha = -a = ${-co[1]}`), m(`${-co[1]} - (${r[0]}) = ${r[1] + r[2]}`)]),
        ],
      };
    },
    function rootSums() {
      const a = pick([1, 2, 3]), b = rnz(-6, 6), c = rnz(-6, 6), d = rnz(-9, 9);
      const s1 = [-b, a], s2 = [c, a], s3 = [-d, a], sq = [b * b - 2 * a * c, a * a];
      return {
        level: 'S', tags: ['P2'], stem: `${m('\\alpha, \\beta, \\gamma')} are the roots of ${m(`${cterm(a, 'x^3', true)}${cterm(b, 'x^2')}${cterm(c, 'x')}${cterm(d, '')} = 0`)}.`,
        parts: [
          P('a', `Find ${m('\\alpha + \\beta + \\gamma')}.`, 'num', s1[0] / s1[1], m(tf(...s1)), [m(`-\\frac{b}{a} = ${tf(...s1)}`)]),
          P('b', `Find ${m('\\alpha\\beta\\gamma')}.`, 'num', s3[0] / s3[1], m(tf(...s3)), [m(`-\\frac{d}{a} = ${tf(...s3)}`)]),
          P('c', `Find ${m('\\alpha^2 + \\beta^2 + \\gamma^2')}.`, 'num', sq[0] / sq[1], m(tf(...sq)), [m('(\\sum\\alpha)^2 - 2\\sum\\alpha\\beta'), m(`= \\left(${tf(...s1)}\\right)^2 - 2\\left(${tf(...s2)}\\right) = ${tf(...sq)}`)], 2),
        ],
      };
    },
    function multiplicity() {
      let p, q; do { p = rnz(-4, 4); q = rnz(-4, 4); } while (p === q);
      return {
        level: 'C', tags: ['P3', 'P1'], stem: `Let ${m(`P(x) = (${tlin(-p)})^2(${tlin(-q)})`)}.`,
        parts: [
          CH('a', `What happens to the graph at ${m(`x = ${p}`)}?`, 'It touches the $x$-axis and turns', ['It crosses the $x$-axis', 'It has a horizontal point of inflection', 'It has a vertical asymptote'], ['Root of multiplicity 2']),
          P('b', 'Find the $y$-intercept.', 'num', p * p * -q, String(p * p * -q), [m(`P(0) = (${-p})^2(${-q}) = ${p * p * -q}`)]),
          P('c', `Find ${m(`P'(${p})`)}.`, 'num', 0, '0', ['A double root of $P$ is also a root of $P\'$']),
        ],
      };
    },
  ];

  /* ================= TRIGONOMETRY ================= */
  const trig = finish({
    id: 'e1trig', subject: SUBJECT, title: 'Trigonometry', chapter: 'Ext 1 · Y11–12', hue: 'gold',
    blurb: 'Inverse trig functions, compound angles, the auxiliary angle method and trig equations.',
    sections: [
      { code: 'T1', name: 'Inverse trig functions', notes: ['$\\sin^{-1}x$: domain $[-1, 1]$, range $\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$.', '$\\cos^{-1}x$: domain $[-1, 1]$, range $[0, \\pi]$.', '$\\tan^{-1}x$: domain all reals, range $\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$.', '$\\sin^{-1}(-x) = -\\sin^{-1}x$, $\\cos^{-1}(-x) = \\pi - \\cos^{-1}x$.'], ex: ['$\\cos^{-1}\\left(-\\frac{1}{2}\\right)$', '$= \\pi - \\cos^{-1}\\frac{1}{2}$', '$= \\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}$'] },
      { code: 'T2', name: 'Compound and double angles', notes: ['$\\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B$', '$\\cos(A \\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B$', '$\\sin 2A = 2\\sin A\\cos A$, $\\cos 2A = \\cos^2 A - \\sin^2 A$', '$t$-formulas with $t = \\tan\\frac{\\theta}{2}$: $\\sin\\theta = \\frac{2t}{1+t^2}$, $\\cos\\theta = \\frac{1-t^2}{1+t^2}$.'], ex: ['$\\sin 75^\\circ$', '$= \\sin 45^\\circ\\cos 30^\\circ + \\cos 45^\\circ\\sin 30^\\circ$', '$= \\frac{\\sqrt{6} + \\sqrt{2}}{4}$'] },
      { code: 'T3', name: 'Auxiliary angle method', notes: ['$a\\sin x + b\\cos x = R\\sin(x + \\alpha)$ with $R = \\sqrt{a^2 + b^2}$ and $\\tan\\alpha = \\frac{b}{a}$.', 'The maximum value is $R$ and the minimum is $-R$.', 'Use it to solve equations like $\\sqrt{3}\\sin x + \\cos x = 1$.'], ex: ['$\\sqrt{3}\\sin x + \\cos x$', '$R = 2$, $\\tan\\alpha = \\frac{1}{\\sqrt{3}}$', '$= 2\\sin\\left(x + \\frac{\\pi}{6}\\right)$'] },
      { code: 'T4', name: 'Trig equations', notes: ['Find the related acute angle, then use the quadrants (ASTC) for every solution in the domain.', 'Check the domain: $0 \\le x \\le 2\\pi$ usually gives two solutions per basic equation.', 'For multiple angles like $\\sin 2x$, widen the domain first ($0 \\le 2x \\le 4\\pi$).'], ex: ['$2\\cos x = -1$, $0 \\le x \\le 2\\pi$', '$\\cos x = -\\frac{1}{2}$: quadrants 2 and 3, related angle $\\frac{\\pi}{3}$', '$x = \\frac{2\\pi}{3}, \\frac{4\\pi}{3}$'] },
    ],
    cards: [
      ['Range of $\\sin^{-1}x$', '$\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$'], ['Range of $\\cos^{-1}x$', '$[0, \\pi]$'], ['Range of $\\tan^{-1}x$', '$\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$'], ['$\\cos^{-1}(-x)$', '$\\pi - \\cos^{-1}x$'],
      ['$\\sin(A + B)$', '$\\sin A\\cos B + \\cos A\\sin B$'], ['$\\cos(A - B)$', '$\\cos A\\cos B + \\sin A\\sin B$'], ['$\\cos 2A$ (three forms)', '$\\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$'], ['$R$ in $a\\sin x + b\\cos x$', '$\\sqrt{a^2 + b^2}$'], ['$t$-formula for $\\tan\\theta$', '$\\frac{2t}{1 - t^2}$'],
    ],
    concepts: [
      ['$\\sin^{-1}\\left(\\sin\\frac{5\\pi}{6}\\right) = $', ['$\\frac{\\pi}{6}$', '$\\frac{5\\pi}{6}$', '$-\\frac{\\pi}{6}$', '$\\frac{\\pi}{3}$'], 0, 'The range of $\\sin^{-1}$ is $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$.'],
      ['The maximum of $3\\sin x + 4\\cos x$ is…', ['5', '7', '4', '1'], 0, '$R = \\sqrt{9 + 16} = 5$.'],
      ['$\\cos 2A = $', ['$1 - 2\\sin^2 A$', '$2\\sin A\\cos A$', '$1 + 2\\sin^2 A$', '$\\sin^2 A - \\cos^2 A$'], 0, ''],
      ['The domain of $\\cos^{-1}x$ is…', ['$-1 \\le x \\le 1$', '$0 \\le x \\le \\pi$', 'all real $x$', '$x > 0$'], 0, ''],
      ['How many solutions does $\\sin 2x = \\frac{1}{2}$ have for $0 \\le x \\le 2\\pi$?', ['4', '2', '1', '8'], 0, '$2x$ runs over $[0, 4\\pi]$: two turns, two solutions each.'],
      ['$\\tan^{-1}(-1) = $', ['$-\\frac{\\pi}{4}$', '$\\frac{3\\pi}{4}$', '$\\frac{\\pi}{4}$', '$-\\frac{3\\pi}{4}$'], 0, ''],
    ],
  });
  const INV = [
    ['\\sin^{-1}\\left(\\frac{1}{2}\\right)', '\\frac{\\pi}{6}'], ['\\sin^{-1}\\left(\\frac{\\sqrt{3}}{2}\\right)', '\\frac{\\pi}{3}'], ['\\sin^{-1}\\left(-\\frac{1}{2}\\right)', '-\\frac{\\pi}{6}'], ['\\sin^{-1}\\left(-\\frac{\\sqrt{2}}{2}\\right)', '-\\frac{\\pi}{4}'],
    ['\\cos^{-1}\\left(\\frac{1}{2}\\right)', '\\frac{\\pi}{3}'], ['\\cos^{-1}\\left(-\\frac{1}{2}\\right)', '\\frac{2\\pi}{3}'], ['\\cos^{-1}\\left(-\\frac{\\sqrt{3}}{2}\\right)', '\\frac{5\\pi}{6}'], ['\\cos^{-1}(0)', '\\frac{\\pi}{2}'], ['\\cos^{-1}(-1)', '\\pi'],
    ['\\tan^{-1}(1)', '\\frac{\\pi}{4}'], ['\\tan^{-1}(\\sqrt{3})', '\\frac{\\pi}{3}'], ['\\tan^{-1}(-1)', '-\\frac{\\pi}{4}'], ['\\tan^{-1}\\left(\\frac{1}{\\sqrt{3}}\\right)', '\\frac{\\pi}{6}'],
  ];
  const ANGLE_POOL = ['\\frac{\\pi}{6}', '\\frac{\\pi}{3}', '\\frac{\\pi}{4}', '\\frac{2\\pi}{3}', '\\frac{5\\pi}{6}', '-\\frac{\\pi}{6}', '-\\frac{\\pi}{3}', '-\\frac{\\pi}{4}', '\\frac{\\pi}{2}', '\\frac{3\\pi}{4}', '\\pi'];
  const TEQ = [
    ['\\sin x = \\frac{1}{2}', '\\frac{\\pi}{6}, \\frac{5\\pi}{6}'], ['\\sin x = \\frac{\\sqrt{3}}{2}', '\\frac{\\pi}{3}, \\frac{2\\pi}{3}'], ['\\sin x = -\\frac{1}{2}', '\\frac{7\\pi}{6}, \\frac{11\\pi}{6}'], ['\\sin x = -\\frac{\\sqrt{3}}{2}', '\\frac{4\\pi}{3}, \\frac{5\\pi}{3}'],
    ['\\cos x = \\frac{1}{2}', '\\frac{\\pi}{3}, \\frac{5\\pi}{3}'], ['\\cos x = -\\frac{1}{2}', '\\frac{2\\pi}{3}, \\frac{4\\pi}{3}'], ['\\cos x = \\frac{\\sqrt{3}}{2}', '\\frac{\\pi}{6}, \\frac{11\\pi}{6}'],
    ['\\tan x = 1', '\\frac{\\pi}{4}, \\frac{5\\pi}{4}'], ['\\tan x = -1', '\\frac{3\\pi}{4}, \\frac{7\\pi}{4}'], ['\\tan x = \\sqrt{3}', '\\frac{\\pi}{3}, \\frac{4\\pi}{3}'],
  ];
  const TRIP = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
  trig.bank = [
    function inverseValues() {
      const [a, b] = shuffle(INV).slice(0, 2);
      return {
        level: 'F', tags: ['T1'], stem: 'Find the exact value of each.',
        parts: [a, b].map(([q, ans], i) => CH('ab'[i], m(q), m(ans), shuffle(ANGLE_POOL.filter(x => x !== ans)).slice(0, 3).map(m), [`Use the range of the inverse function and the exact values, giving ${m(ans)}`])),
      };
    },
    function compound() {
      const [t1, t2] = shuffle(TRIP).slice(0, 2), [a1, b1, c1] = t1, [a2, b2, c2] = t2; // sin A = a1/c1, cos A = b1/c1 (acute)
      const sApB = [a1 * b2 + b1 * a2, c1 * c2], cAmB = [b1 * b2 + a1 * a2, c1 * c2];
      return {
        level: 'S', tags: ['T2'], stem: `${m('A')} and ${m('B')} are acute, with ${m(`\\sin A = \\frac{${a1}}{${c1}}`)} and ${m(`\\cos B = \\frac{${b2}}{${c2}}`)}.`,
        parts: [
          P('a', `Find ${m('\\cos A')}.`, 'num', b1 / c1, m(tf(b1, c1)), [m(`\\cos A = \\sqrt{1 - \\frac{${a1 * a1}}{${c1 * c1}}} = \\frac{${b1}}{${c1}}`)]),
          P('b', `Find the exact value of ${m('\\sin(A + B)')}.`, 'num', sApB[0] / sApB[1], m(tf(...sApB)), [m(`\\sin B = \\frac{${a2}}{${c2}}`), m(`\\sin A\\cos B + \\cos A\\sin B = \\frac{${a1}}{${c1}} \\cdot \\frac{${b2}}{${c2}} + \\frac{${b1}}{${c1}} \\cdot \\frac{${a2}}{${c2}} = ${tf(...sApB)}`)], 2),
          P('c', `Find the exact value of ${m('\\cos(A - B)')}.`, 'num', cAmB[0] / cAmB[1], m(tf(...cAmB)), [m(`\\cos A\\cos B + \\sin A\\sin B = ${tf(...cAmB)}`)], 2),
        ],
      };
    },
    function auxiliary() {
      const [a, b, R] = pick(TRIP), k = ri(1, 4), alpha = Math.atan(b / a);
      return {
        level: 'S', tags: ['T3'], stem: `Write ${m(`${a}\\sin x + ${b}\\cos x`)} in the form ${m('R\\sin(x + \\alpha)')}, with ${m('R > 0')} and ${m('0 < \\alpha < \\frac{\\pi}{2}')}.`,
        parts: [
          P('a', 'Find $R$.', 'num', R, String(R), [m(`R = \\sqrt{${a}^2 + ${b}^2} = ${R}`)]),
          P('b', `Find ${m('\\alpha')} in radians, correct to 2 decimal places.`, 'num', rnd(alpha, 2), dec(alpha, 2), [m(`\\tan\\alpha = \\frac{${b}}{${a}}`), m(`\\alpha = \\tan^{-1}\\frac{${b}}{${a}} \\approx ${dec(alpha, 2)}`)], 1, { round: 2 }),
          P('c', `Find the maximum value of ${m(`${k} + ${a}\\sin x + ${b}\\cos x`)}.`, 'num', k + R, String(k + R), [`The maximum of ${m('R\\sin(x + \\alpha)')} is ${m('R')}`, m(`${k} + ${R} = ${k + R}`)]),
        ],
      };
    },
    function trigEquation() {
      const [eq, sol] = pick(TEQ), fn = eq.slice(1, 4);
      return {
        level: 'C', tags: ['T4'], stem: `Solve ${m(eq)} for ${m('0 \\le x \\le 2\\pi')}.`,
        parts: [CH('a', 'Which is the full solution set?', m(`x = ${sol}`), shuffle(TEQ.filter(([e, s]) => e.slice(1, 4) === fn && s !== sol)).slice(0, 3).map(([, s]) => m(`x = ${s}`)).concat(m(`x = ${sol.split(', ')[0]}`)), ['Find the related angle, then every quadrant where the sign matches', m(`x = ${sol}`)], 2)],
      };
    },
  ];

  /* ================= COMBINATORICS ================= */
  const comb = finish({
    id: 'e1comb', subject: SUBJECT, title: 'Combinatorics', chapter: 'Ext 1 · Y11', hue: 'pink',
    blurb: 'Permutations, combinations, the pigeonhole principle and the binomial theorem.',
    sections: [
      { code: 'C1', name: 'Permutations', notes: ['Arrangements of $n$ different objects: $n!$. Choosing and ordering $r$ of them: $^nP_r = \\frac{n!}{(n-r)!}$.', 'With repeated items, divide by the factorial of each repeat: $\\frac{n!}{a!\\,b!\\cdots}$.', 'Around a circle there is no first seat: $(n-1)!$ arrangements.'], ex: ['Arrangements of BANANA', '$\\frac{6!}{3!\\,2!}$', '$= 60$'] },
      { code: 'C2', name: 'Combinations', notes: ['Choosing $r$ from $n$ when order doesn\'t matter: $\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$.', '"At least one" is usually total minus "none".', 'Multiply choices for independent stages; add for separate cases.'], ex: ['Committee of 3 from 5 men, 4 women, at least one woman', '$\\binom{9}{3} - \\binom{5}{3}$', '$= 84 - 10 = 74$'] },
      { code: 'C3', name: 'Pigeonhole principle', notes: ['If more than $n$ items go into $n$ boxes, some box holds at least 2.', 'Generalised: $nk + 1$ items in $n$ boxes forces some box to hold at least $k + 1$.', 'Identify the boxes (the categories) carefully.'], ex: ['How many socks from 4 colours guarantee 3 of one colour?', '$4 \\times 2 + 1$', '9 socks'] },
      { code: 'C4', name: 'Binomial theorem', notes: ['$(a + b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^r$.', 'The general term is $T_{r+1} = \\binom{n}{r} a^{n-r} b^r$.', 'For a constant term, set the total power of $x$ to zero and solve for $r$.'], ex: ['Coefficient of $x^2$ in $(1 + 2x)^5$', '$\\binom{5}{2}(2)^2$', '$= 40$'] },
    ],
    cards: [
      ['$^nP_r$', '$\\frac{n!}{(n-r)!}$'], ['$\\binom{n}{r}$', '$\\frac{n!}{r!(n-r)!}$'], ['Circular arrangements of $n$', '$(n-1)!$'], ['Repeated letters', 'Divide $n!$ by each repeat\'s factorial'], ['"At least one"', 'Total minus none'],
      ['Pigeonhole principle', 'More than $n$ items in $n$ boxes: some box has 2+'], ['General term of $(a+b)^n$', '$\\binom{n}{r}a^{n-r}b^r$'], ['$\\binom{n}{r} = \\binom{n}{n-r}$', 'Choosing $r$ to keep is choosing $n - r$ to leave'], ['Pascal\'s rule', '$\\binom{n}{r} = \\binom{n-1}{r-1} + \\binom{n-1}{r}$'],
    ],
    concepts: [
      ['How many ways can 5 people sit around a round table?', ['24', '120', '60', '5'], 0, '$(5 - 1)! = 24$.'],
      ['$\\binom{7}{2} = $', ['21', '42', '14', '35'], 0, ''],
      ['Arrangements of the letters of LEVEL', ['30', '120', '60', '20'], 0, '$\\frac{5!}{2!\\,2!} = 30$.'],
      ['The number of terms in $(a + b)^{10}$ is…', ['11', '10', '20', '12'], 0, ''],
      ['Minimum people to guarantee two share a birth month', ['13', '12', '24', '2'], 0, '12 months, so 13 people.'],
      ['$\\binom{n}{0} = $', ['1', '0', '$n$', '$n!$'], 0, ''],
    ],
  });
  const WORDS = ['BANANA', 'LETTER', 'TOMATO', 'COFFEE', 'ALGEBRA', 'CALCULUS', 'STATISTICS', 'PARALLEL', 'BOOKKEEPER'];
  const wordArr = (w) => { const cnt = {}; [...w].forEach(c => (cnt[c] = (cnt[c] || 0) + 1)); const reps = Object.values(cnt).filter(v => v > 1); return { n: fact(w.length) / reps.reduce((a, r) => a * fact(r), 1), reps }; };
  comb.bank = [
    function arrangements() {
      const w = pick(WORDS), { n, reps } = wordArr(w), L = w.length;
      return {
        level: 'F', tags: ['C1'], stem: `Consider the letters of the word ${w}.`,
        parts: [
          P('a', 'How many different arrangements are there?', 'num', n, String(n), [m(`\\frac{${L}!}{${reps.map(r => r + '!').join('\\,')}}`), m(`= ${n}`)], 2),
          P('b', `If the letters were all different, how many arrangements would there be?`, 'num', fact(L), String(fact(L)), [m(`${L}! = ${fact(L)}`)]),
        ],
      };
    },
    function committee() {
      const M = ri(4, 8), W = ri(3, 7), k = ri(3, 5), tot = nCr(M + W, k), j = ri(1, Math.min(W, k - 1));
      return {
        level: 'S', tags: ['C2'], stem: `A committee of ${k} is chosen from ${M} men and ${W} women.`,
        parts: [
          P('a', 'How many committees are possible?', 'num', tot, String(tot), [m(`\\binom{${M + W}}{${k}} = ${tot}`)]),
          P('b', 'How many include at least one woman?', 'num', tot - nCr(M, k), String(tot - nCr(M, k)), [m(`\\binom{${M + W}}{${k}} - \\binom{${M}}{${k}} = ${tot} - ${nCr(M, k)}`), m(`= ${tot - nCr(M, k)}`)], 2),
          P('c', `How many have exactly ${j} woman${j > 1 ? 'en' : ''}?`.replace('womanen', 'women'), 'num', nCr(W, j) * nCr(M, k - j), String(nCr(W, j) * nCr(M, k - j)), [m(`\\binom{${W}}{${j}}\\binom{${M}}{${k - j}} = ${nCr(W, j)} \\times ${nCr(M, k - j)} = ${nCr(W, j) * nCr(M, k - j)}`)]),
        ],
      };
    },
    function circular() {
      const n = ri(5, 9);
      return {
        level: 'S', tags: ['C1'], stem: `${n} friends sit around a circular table.`,
        parts: [
          P('a', 'How many seating arrangements are there?', 'num', fact(n - 1), String(fact(n - 1)), [m(`(${n} - 1)! = ${fact(n - 1)}`)]),
          P('b', 'In how many do Ari and Bea sit together?', 'num', 2 * fact(n - 2), String(2 * fact(n - 2)), ['Treat Ari and Bea as one unit: ' + m(`(${n - 1} - 1)! = ${fact(n - 2)}`), 'They can swap: ' + m(`2 \\times ${fact(n - 2)} = ${2 * fact(n - 2)}`)], 2),
          P('c', 'In how many are they apart?', 'num', fact(n - 1) - 2 * fact(n - 2), String(fact(n - 1) - 2 * fact(n - 2)), [m(`${fact(n - 1)} - ${2 * fact(n - 2)} = ${fact(n - 1) - 2 * fact(n - 2)}`)]),
        ],
      };
    },
    function pigeonhole() {
      const n = ri(3, 7), k = ri(2, 5);
      return {
        level: 'F', tags: ['C3'], stem: `A drawer has socks in ${n} colours.`,
        parts: [P('a', `How many socks must you take (without looking) to be sure of getting ${k} of the same colour?`, 'num', n * (k - 1) + 1, String(n * (k - 1) + 1), [`Worst case: ${k - 1} of every colour, ${m(`${n} \\times ${k - 1} = ${n * (k - 1)}`)}`, 'One more forces a match: ' + m(String(n * (k - 1) + 1))], 2)],
      };
    },
    function binomial() {
      const n = ri(4, 8), a = ri(1, 3), b = rnz(-3, 3), r = ri(1, n - 1), coef = nCr(n, r) * a ** (n - r) * b ** r;
      const k = ri(1, 3), n2 = pick([4, 6, 8]), cterm = nCr(n2, n2 / 2) * k ** (n2 / 2);
      return {
        level: 'C', tags: ['C4'], stem: 'The binomial theorem.',
        parts: [
          P('a', `Find the coefficient of ${m(`x^{${r}}`)} in ${m(`(${a} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x)^{${n}}`)}.`, 'num', coef, String(coef), [m(`T_{r+1} = \\binom{${n}}{r}(${a})^{${n}-r}(${b}x)^r`), `With ${m(`r = ${r}`)}: ${m(`\\binom{${n}}{${r}}(${a})^{${n - r}}(${b})^{${r}} = ${coef}`)}`], 2),
          P('b', `Find the term independent of $x$ in ${m(`\\left(x + \\frac{${k}}{x}\\right)^{${n2}}`)}.`, 'num', cterm, String(cterm), [m(`T_{r+1} = \\binom{${n2}}{r}x^{${n2} - r}\\left(\\frac{${k}}{x}\\right)^r = \\binom{${n2}}{r}${k}^r x^{${n2} - 2r}`), `${m(`${n2} - 2r = 0`)} gives ${m(`r = ${n2 / 2}`)}`, m(`\\binom{${n2}}{${n2 / 2}}${k}^{${n2 / 2}} = ${cterm}`)], 2),
        ],
      };
    },
  ];

  /* ================= CALCULUS ================= */
  const calc = finish({
    id: 'e1calc', subject: SUBJECT, title: 'Calculus', chapter: 'Ext 1 · Y11–12', hue: 'lilac',
    blurb: 'Related rates, inverse trig calculus, substitution, volumes of solids of revolution and differential equations.',
    sections: [
      { code: 'D1', name: 'Related rates', notes: ['Link the rates with the chain rule: $\\frac{dV}{dt} = \\frac{dV}{dr} \\cdot \\frac{dr}{dt}$.', 'Write a formula connecting the quantities first, then differentiate.', 'Substitute the given values only after differentiating.'], ex: ['Sphere, $\\frac{dr}{dt} = 2$, find $\\frac{dV}{dt}$ at $r = 3$', '$\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}$', '$= 4\\pi(9)(2) = 72\\pi$'] },
      { code: 'D2', name: 'Inverse trig calculus', notes: ['$\\frac{d}{dx}\\sin^{-1}\\frac{x}{a} = \\frac{1}{\\sqrt{a^2 - x^2}}$', '$\\frac{d}{dx}\\cos^{-1}\\frac{x}{a} = -\\frac{1}{\\sqrt{a^2 - x^2}}$', '$\\frac{d}{dx}\\tan^{-1}\\frac{x}{a} = \\frac{a}{a^2 + x^2}$'], ex: ['$\\frac{d}{dx}\\tan^{-1}(3x)$', 'Chain rule: $\\frac{1}{1 + 9x^2} \\cdot 3$', '$= \\frac{3}{1 + 9x^2}$'] },
      { code: 'D3', name: 'Substitution and trig integrals', notes: ['Choose $u$ so its derivative appears in the integrand; change the limits.', '$\\sin^2 x = \\frac{1}{2}(1 - \\cos 2x)$ and $\\cos^2 x = \\frac{1}{2}(1 + \\cos 2x)$.', '$\\int \\sin^2 x\\,dx = \\frac{x}{2} - \\frac{\\sin 2x}{4} + C$'], ex: ['$\\int_0^1 2x(x^2 + 1)^3 dx$', '$u = x^2 + 1$: $\\int_1^2 u^3 du$', '$= \\frac{16 - 1}{4} = \\frac{15}{4}$'] },
      { code: 'D4', name: 'Volumes of revolution', notes: ['About the $x$-axis: $V = \\pi\\int_a^b y^2\\,dx$.', 'About the $y$-axis: $V = \\pi\\int_c^d x^2\\,dy$.', 'A cone is $y = kx$ rotated about the $x$-axis.'], ex: ['$y = \\sqrt{x}$, $0 \\le x \\le 4$, about the $x$-axis', '$\\pi\\int_0^4 x\\,dx$', '$= 8\\pi$'] },
      { code: 'D5', name: 'Differential equations', notes: ['Separable: $\\frac{dy}{dx} = f(x)g(y)$, so $\\int \\frac{dy}{g(y)} = \\int f(x)dx$.', 'Newton\'s cooling: $\\frac{dT}{dt} = -k(T - A)$ gives $T = A + (T_0 - A)e^{-kt}$.', 'A slope field shows the gradient at each point; solution curves follow it.', 'Logistic growth: $\\frac{dP}{dt} = kP\\left(1 - \\frac{P}{N}\\right)$ levels off at $N$.'], ex: ['$\\frac{dy}{dx} = 2xy$, $y(0) = 3$', '$\\ln|y| = x^2 + C$', '$y = 3e^{x^2}$'] },
    ],
    cards: [
      ['Chain rule for rates', '$\\frac{dV}{dt} = \\frac{dV}{dr}\\cdot\\frac{dr}{dt}$'], ['$\\frac{d}{dx}\\sin^{-1}x$', '$\\frac{1}{\\sqrt{1 - x^2}}$'], ['$\\frac{d}{dx}\\tan^{-1}x$', '$\\frac{1}{1 + x^2}$'], ['$\\int \\frac{dx}{\\sqrt{a^2 - x^2}}$', '$\\sin^{-1}\\frac{x}{a} + C$'],
      ['Volume about the $x$-axis', '$\\pi\\int y^2\\,dx$'], ['$\\int\\cos^2 x\\,dx$', '$\\frac{x}{2} + \\frac{\\sin 2x}{4} + C$'], ['Newton\'s law of cooling', '$T = A + (T_0 - A)e^{-kt}$'], ['Separable DE', 'Get all $y$ on one side, all $x$ on the other, integrate'], ['Logistic equation limit', 'The carrying capacity $N$'],
    ],
    concepts: [
      ['$\\frac{d}{dx}\\cos^{-1}x = $', ['$-\\frac{1}{\\sqrt{1 - x^2}}$', '$\\frac{1}{\\sqrt{1 - x^2}}$', '$\\frac{1}{1 + x^2}$', '$-\\sin^{-1}x$'], 0, ''],
      ['Volume when $y = 2x$, $0 \\le x \\le 3$ is rotated about the $x$-axis', ['$36\\pi$', '$9\\pi$', '$12\\pi$', '$18\\pi$'], 0, '$\\pi\\int_0^3 4x^2dx = 36\\pi$.'],
      ['Which substitution suits $\\int x e^{x^2}dx$?', ['$u = x^2$', '$u = e^x$', '$u = x$', '$u = \\ln x$'], 0, ''],
      ['The solution of $\\frac{dy}{dx} = 3y$ is…', ['$y = Ce^{3x}$', '$y = 3e^x$', '$y = Ce^{x/3}$', '$y = \\frac{3}{2}y^2$'], 0, ''],
      ['In $\\frac{dP}{dt} = 0.2P\\left(1 - \\frac{P}{500}\\right)$, $P$ approaches…', ['500', '0.2', '100', '$\\infty$'], 0, ''],
      ['$\\int_0^{\\pi}\\sin^2 x\\,dx = $', ['$\\frac{\\pi}{2}$', '$\\pi$', '$0$', '$1$'], 0, ''],
    ],
  });
  calc.bank = [
    function relatedRates() {
      const R = ri(2, 10), c = ri(1, 5), Q = ri(20, 200), grow = Math.random() < 0.5;
      return grow ? {
        level: 'S', tags: ['D1'], stem: `The radius of a spherical balloon increases at ${c} cm/s.`,
        parts: [P('a', `How fast is the volume increasing when the radius is ${R} cm? (2 decimal places)`, 'num', rnd(4 * Math.PI * R * R * c, 2), `${dec(4 * Math.PI * R * R * c, 2)} cm³/s`, [m('V = \\frac{4}{3}\\pi r^3 \\Rightarrow \\frac{dV}{dt} = 4\\pi r^2\\frac{dr}{dt}'), m(`= 4\\pi(${R})^2(${c}) = ${4 * R * R * c}\\pi \\approx ${dec(4 * Math.PI * R * R * c, 2)}`)], 2, { round: 2 })],
      } : {
        level: 'S', tags: ['D1'], stem: `Air is pumped into a spherical balloon at ${Q} cm³/s.`,
        parts: [P('a', `How fast is the radius increasing when it is ${R} cm? (3 decimal places)`, 'num', rnd(Q / (4 * Math.PI * R * R), 3), `${dec(Q / (4 * Math.PI * R * R), 3)} cm/s`, [m('\\frac{dV}{dt} = 4\\pi r^2\\frac{dr}{dt}'), m(`\\frac{dr}{dt} = \\frac{${Q}}{4\\pi(${R})^2} \\approx ${dec(Q / (4 * Math.PI * R * R), 3)}`)], 2, { round: 3 })],
      };
    },
    function inverseTrigCalc() {
      const k = ri(2, 6), a = ri(2, 5);
      return {
        level: 'F', tags: ['D2'], stem: 'Inverse trig calculus.',
        parts: [
          CH('a', m(`\\frac{d}{dx}\\tan^{-1}(${k}x)`), m(`\\frac{${k}}{1 + ${k * k}x^2}`), [m(`\\frac{1}{1 + ${k * k}x^2}`), m(`\\frac{${k}}{1 + ${k}x^2}`), m(`\\frac{${k}}{\\sqrt{1 - ${k * k}x^2}}`)], ['Chain rule: ' + m(`\\frac{1}{1 + (${k}x)^2} \\cdot ${k}`)]),
          CH('b', m(`\\displaystyle\\int \\frac{dx}{\\sqrt{${a * a} - x^2}}`), m(`\\sin^{-1}\\frac{x}{${a}} + C`), [m(`\\frac{1}{${a}}\\sin^{-1}\\frac{x}{${a}} + C`), m(`\\cos^{-1}\\frac{x}{${a}} + C`), m(`\\frac{1}{${a}}\\tan^{-1}\\frac{x}{${a}} + C`)], ['Standard integral']),
          P('c', `Evaluate ${m(`\\displaystyle\\int_0^{${a}} \\frac{dx}{\\sqrt{${a * a} - x^2}}`)}, correct to 3 decimal places.`, 'num', rnd(Math.PI / 2, 3), dec(Math.PI / 2), [m(`\\left[\\sin^{-1}\\frac{x}{${a}}\\right]_0^{${a}} = \\frac{\\pi}{2} \\approx 1.571`)], 1, { round: 3 }),
        ],
      };
    },
    function substitution() {
      const c = ri(1, 3), n = ri(2, 3), top = (1 + c) ** (n + 1) - c ** (n + 1);
      return {
        level: 'S', tags: ['D3'], stem: `Use the substitution ${m(`u = x^2 + ${c}`)} to evaluate ${m(`\\displaystyle\\int_0^1 2x(x^2 + ${c})^{${n}}\\,dx`)}.`,
        parts: [
          CH('a', 'What are the new limits?', m(`u = ${c}\\text{ to }u = ${1 + c}`), [m(`u = 0\\text{ to }u = 1`), m(`u = ${c}\\text{ to }u = ${2 + c}`), m(`u = 1\\text{ to }u = ${1 + c}`)], [m(`x = 0 \\Rightarrow u = ${c}`), m(`x = 1 \\Rightarrow u = ${1 + c}`)]),
          P('b', 'Evaluate the integral (a fraction is fine).', 'num', top / (n + 1), m(tf(top, n + 1)), [m(`\\int_{${c}}^{${1 + c}} u^{${n}}\\,du = \\left[\\frac{u^{${n + 1}}}{${n + 1}}\\right]_{${c}}^{${1 + c}}`), m(`= \\frac{${(1 + c) ** (n + 1)} - ${c ** (n + 1)}}{${n + 1}} = ${tf(top, n + 1)}`)], 2),
        ],
      };
    },
    function volume() {
      const k = ri(1, 4), h = ri(2, 6), a = ri(1, 4), V1 = Math.PI * k * k * h ** 3 / 3, V2 = Math.PI * a ** 5 / 5;
      return {
        level: 'S', tags: ['D4'], stem: 'Volumes of solids of revolution. Give answers to 2 decimal places.',
        parts: [
          P('a', `The region under ${m(`y = ${k === 1 ? '' : k}x`)} from ${m('x = 0')} to ${m(`x = ${h}`)} is rotated about the $x$-axis. Find the volume.`, 'num', rnd(V1, 2), dec(V1, 2), [m(`V = \\pi\\int_0^{${h}} ${k * k}x^2\\,dx = \\pi\\left[\\frac{${k * k}x^3}{3}\\right]_0^{${h}} = ${tf(k * k * h ** 3, 3)}\\pi`), m(`\\approx ${dec(V1, 2)}`)], 2, { round: 2 }),
          P('b', `The region under ${m('y = x^2')} from ${m('x = 0')} to ${m(`x = ${a}`)} is rotated about the $x$-axis. Find the volume.`, 'num', rnd(V2, 2), dec(V2, 2), [m(`V = \\pi\\int_0^{${a}} x^4\\,dx = \\frac{${a ** 5}\\pi}{5} \\approx ${dec(V2, 2)}`)], 2, { round: 2 }),
        ],
      };
    },
    function cooling() {
      const A = pick([18, 20, 22, 25]), T0 = ri(80, 98), k = pick([0.05, 0.08, 0.1, 0.12]), t = ri(5, 15), Tt = A + (T0 - A) * Math.exp(-k * t), target = A + ri(10, 25), tt = Math.log((T0 - A) / (target - A)) / k;
      return {
        level: 'C', tags: ['D5'], stem: `A cup of tea at ${T0}°C cools in a ${A}°C room according to ${m(`\\frac{dT}{dt} = -${k}(T - ${A})`)}, with $t$ in minutes.`,
        parts: [
          CH('a', 'Which is the solution?', m(`T = ${A} + ${T0 - A}e^{-${k}t}`), [m(`T = ${T0} + ${A}e^{-${k}t}`), m(`T = ${A}e^{-${k}t}`), m(`T = ${T0 - A} + ${A}e^{${k}t}`)], ['Separate: ' + m(`\\int\\frac{dT}{T - ${A}} = -${k}\\int dt`), m(`T - ${A} = Ce^{-${k}t}`) + ', and at $t = 0$, ' + m(`C = ${T0 - A}`)]),
          P('b', `Find the temperature after ${t} minutes (1 decimal place).`, 'num', rnd(Tt, 1), `${dec(Tt, 1)}°C`, [m(`T = ${A} + ${T0 - A}e^{-${dec(k * t, 2)}} \\approx ${dec(Tt, 1)}`)], 1, { round: 1 }),
          P('c', `When does it reach ${target}°C? (2 decimal places)`, 'num', rnd(tt, 2), `${dec(tt, 2)} min`, [m(`${target - A} = ${T0 - A}e^{-${k}t}`), m(`t = \\frac{1}{${k}}\\ln\\frac{${T0 - A}}{${target - A}} \\approx ${dec(tt, 2)}`)], 2, { round: 2 }),
        ],
      };
    },
  ];

  /* ================= VECTORS (2D) ================= */
  const vec = finish({
    id: 'e1vec', subject: SUBJECT, title: 'Vectors', chapter: 'Ext 1 · Y12', hue: 'green',
    blurb: 'Vectors in two dimensions, dot product, projections and projectile motion.',
    sections: [
      { code: 'V1', name: 'Vectors in 2D', notes: ['$\\mathbf{a} = x\\mathbf{i} + y\\mathbf{j}$, with $|\\mathbf{a}| = \\sqrt{x^2 + y^2}$.', 'Add component by component; scalar multiples stretch a vector.', 'A unit vector has length 1: $\\hat{\\mathbf{a}} = \\frac{\\mathbf{a}}{|\\mathbf{a}|}$.'], ex: ['$|3\\mathbf{i} - 4\\mathbf{j}|$', '$\\sqrt{9 + 16}$', '$= 5$'] },
      { code: 'V2', name: 'Dot product and projections', notes: ['$\\mathbf{a}\\cdot\\mathbf{b} = x_1x_2 + y_1y_2 = |\\mathbf{a}||\\mathbf{b}|\\cos\\theta$', 'Perpendicular vectors have dot product 0.', 'The projection of $\\mathbf{a}$ onto $\\mathbf{b}$ is $\\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{b}\\cdot\\mathbf{b}}\\mathbf{b}$.'], ex: ['Project $(2, 3)$ onto $(1, 1)$', '$\\frac{5}{2}(1, 1)$', '$= (2.5, 2.5)$'] },
      { code: 'V3', name: 'Projectile motion', notes: ['Velocity $\\mathbf{v}(0) = V\\cos\\theta\\,\\mathbf{i} + V\\sin\\theta\\,\\mathbf{j}$, acceleration $-g\\,\\mathbf{j}$.', 'Integrate: $x = Vt\\cos\\theta$, $y = h + Vt\\sin\\theta - \\frac{1}{2}gt^2$.', 'Maximum height when $\\dot{y} = 0$; it lands when $y = 0$.'], ex: ['$V = 20$, $\\theta = 30^\\circ$, $g = 10$: time to top', '$\\dot{y} = 10 - 10t = 0$', '$t = 1$ s'] },
    ],
    cards: [
      ['$|x\\mathbf{i} + y\\mathbf{j}|$', '$\\sqrt{x^2 + y^2}$'], ['$\\mathbf{a}\\cdot\\mathbf{b}$', '$x_1x_2 + y_1y_2$'], ['Angle between vectors', '$\\cos\\theta = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{|\\mathbf{a}||\\mathbf{b}|}$'], ['Projection of $\\mathbf{a}$ on $\\mathbf{b}$', '$\\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{b}\\cdot\\mathbf{b}}\\mathbf{b}$'],
      ['Projectile $x(t)$', '$Vt\\cos\\theta$'], ['Projectile $y(t)$', '$h + Vt\\sin\\theta - \\frac{1}{2}gt^2$'], ['At the top', '$\\dot{y} = 0$'], ['Perpendicular', '$\\mathbf{a}\\cdot\\mathbf{b} = 0$'],
    ],
    concepts: [
      ['$(2\\mathbf{i} + \\mathbf{j})\\cdot(\\mathbf{i} - 3\\mathbf{j}) = $', ['$-1$', '$5$', '$-5$', '$1$'], 0, '$2 - 3 = -1$.'],
      ['Which is perpendicular to $3\\mathbf{i} + 4\\mathbf{j}$?', ['$4\\mathbf{i} - 3\\mathbf{j}$', '$3\\mathbf{i} - 4\\mathbf{j}$', '$6\\mathbf{i} + 8\\mathbf{j}$', '$\\mathbf{i} + \\mathbf{j}$'], 0, ''],
      ['A projectile\'s horizontal velocity…', ['Stays constant', 'Decreases', 'Increases', 'Is zero at the top'], 0, 'No horizontal force (no air resistance).'],
      ['At maximum height, a projectile\'s velocity is…', ['Horizontal', 'Zero', 'Vertical', 'Downward'], 0, ''],
      ['The unit vector of $6\\mathbf{i} - 8\\mathbf{j}$ is…', ['$0.6\\mathbf{i} - 0.8\\mathbf{j}$', '$6\\mathbf{i} - 8\\mathbf{j}$', '$\\frac{1}{14}(6\\mathbf{i} - 8\\mathbf{j})$', '$0.8\\mathbf{i} - 0.6\\mathbf{j}$'], 0, ''],
      ['Range on level ground is greatest at…', ['$45^\\circ$', '$30^\\circ$', '$60^\\circ$', '$90^\\circ$'], 0, ''],
    ],
  });
  vec.bank = [
    function components() {
      const [p, q, r] = pick(TRIP), a = [p * pick([1, -1]), q * pick([1, -1])], b = [rnz(-5, 5), rnz(-5, 5)], d = a[0] * b[0] + a[1] * b[1], bb = b[0] * b[0] + b[1] * b[1];
      return {
        level: 'F', tags: ['V1', 'V2'], stem: `Let ${m(`\\mathbf{a} = ${cterm(a[0], '\\mathbf{i}', true)}${cterm(a[1], '\\mathbf{j}')}`)} and ${m(`\\mathbf{b} = ${cterm(b[0], '\\mathbf{i}', true)}${cterm(b[1], '\\mathbf{j}')}`)}.`,
        parts: [
          P('a', 'Find $|\\mathbf{a}|$.', 'num', r, String(r), [m(`\\sqrt{${a[0] ** 2} + ${a[1] ** 2}} = ${r}`)]),
          P('b', 'Find $\\mathbf{a}\\cdot\\mathbf{b}$.', 'num', d, String(d), [m(`(${a[0]})(${b[0]}) + (${a[1]})(${b[1]}) = ${d}`)]),
          P('c', `The projection of $\\mathbf{a}$ onto $\\mathbf{b}$ is ${m('k\\mathbf{b}')}. Find $k$ (a fraction is fine).`, 'num', d / bb, m(tf(d, bb)), [m(`k = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{b}\\cdot\\mathbf{b}} = \\frac{${d}}{${bb}} = ${tf(d, bb)}`)], 2),
        ],
      };
    },
    function cliffProjectile() {
      const h = pick([20, 30, 40, 45, 60, 80]), V = pick([10, 20, 30]), th = pick([30, 45, 60]), g = 10, s = Math.sin(th * Math.PI / 180), c = Math.cos(th * Math.PI / 180);
      const tTop = V * s / g, H = h + V * V * s * s / (2 * g), tLand = (V * s + Math.sqrt(V * V * s * s + 2 * g * h)) / g, range = V * c * tLand;
      return {
        level: 'C', tags: ['V3'], stem: `A ball is thrown from the top of a ${h} m cliff at ${V} m/s, ${m(`${th}^\\circ`)} above the horizontal. Take ${m('g = 10')} and give answers to 2 decimal places.`,
        parts: [
          P('a', 'How long until it reaches its highest point?', 'num', rnd(tTop, 2), `${dec(tTop, 2)} s`, [m(`\\dot{y} = ${V}\\sin ${th}^\\circ - 10t = 0`), m(`t \\approx ${dec(tTop, 2)}`)], 1, { round: 2 }),
          P('b', 'How high above the sea does it get?', 'num', rnd(H, 2), `${dec(H, 2)} m`, [m(`y = ${h} + ${V}t\\sin ${th}^\\circ - 5t^2`) + ' at the top', m(`\\approx ${dec(H, 2)}`)], 2, { round: 2 }),
          P('c', 'How far from the base of the cliff does it land?', 'num', rnd(range, 2), `${dec(range, 2)} m`, [`Solve ${m(`${h} + ${dec(V * s, 3)}t - 5t^2 = 0`)}: ${m(`t \\approx ${dec(tLand, 3)}`)}`, m(`x = ${V}t\\cos ${th}^\\circ \\approx ${dec(range, 2)}`)], 3, { round: 2 }),
        ],
      };
    },
  ];

  /* ================= STATISTICS ================= */
  const stats = finish({
    id: 'e1stats', subject: SUBJECT, title: 'Statistical Analysis', chapter: 'Ext 1 · Y12', hue: 'coral',
    blurb: 'Bernoulli and binomial distributions, and the normal approximation for sample proportions.',
    sections: [
      { code: 'S1', name: 'Binomial distribution', notes: ['$X \\sim \\text{Bin}(n, p)$ counts successes in $n$ independent trials.', '$P(X = r) = \\binom{n}{r}p^r(1 - p)^{n - r}$', '$E(X) = np$ and $\\text{Var}(X) = np(1 - p)$.', '"At least one": $1 - P(X = 0) = 1 - (1 - p)^n$.'], ex: ['$X \\sim \\text{Bin}(4, 0.3)$, $P(X = 2)$', '$\\binom{4}{2}(0.3)^2(0.7)^2$', '$= 0.2646$'] },
      { code: 'S2', name: 'Sample proportions', notes: ['$\\hat{p}$ is the proportion of successes in a sample of size $n$.', 'For large $n$, $\\hat{p}$ is approximately normal with mean $p$ and standard deviation $\\sqrt{\\frac{p(1-p)}{n}}$.', 'Standardise with $z = \\frac{\\hat{p} - p}{\\sigma}$; about 68%, 95%, 99.7% lie within 1, 2, 3 standard deviations.'], ex: ['$p = 0.4$, $n = 100$', '$\\sigma = \\sqrt{\\frac{0.4 \\times 0.6}{100}}$', '$\\approx 0.049$'] },
      { code: 'S3', name: 'Using the normal approximation', notes: ['The approximation is good when $np \\ge 10$ and $n(1 - p) \\ge 10$ (roughly).', 'To find a probability, convert to a $z$-score and use the empirical rule or the table on the reference sheet.', 'A sample proportion more than 2 standard deviations from $p$ is unusual (about a 5% chance).'], ex: ['$p = 0.5$, $n = 100$, $\\hat{p} = 0.6$: unusual?', '$\\sigma = 0.05$, so $z = \\frac{0.6 - 0.5}{0.05} = 2$', 'On the edge of unusual: about 2.5% of samples are this high'] },
    ],
    cards: [
      ['$P(X = r)$, binomial', '$\\binom{n}{r}p^r(1-p)^{n-r}$'], ['Binomial mean', '$np$'], ['Binomial variance', '$np(1 - p)$'], ['At least one success', '$1 - (1 - p)^n$'],
      ['Mean of $\\hat{p}$', '$p$'], ['Standard deviation of $\\hat{p}$', '$\\sqrt{\\frac{p(1-p)}{n}}$'], ['$z$-score', '$\\frac{x - \\mu}{\\sigma}$'], ['Empirical rule', '68%, 95%, 99.7% within 1, 2, 3 standard deviations'],
    ],
    concepts: [
      ['$X \\sim \\text{Bin}(20, 0.25)$. $E(X) = $', ['5', '15', '3.75', '20'], 0, ''],
      ['The variance of $\\text{Bin}(10, 0.5)$ is…', ['2.5', '5', '0.25', '1.58'], 0, '$10 \\times 0.5 \\times 0.5$.'],
      ['Which is NOT needed for a binomial distribution?', ['Trials depend on each other', 'Fixed number of trials', 'Two outcomes per trial', 'Constant probability of success'], 0, 'Trials must be independent.'],
      ['As $n$ increases, the spread of $\\hat{p}$…', ['Decreases', 'Increases', 'Stays the same', 'Becomes 1'], 0, '$\\sigma \\propto \\frac{1}{\\sqrt{n}}$.'],
      ['About what percentage of a normal distribution lies within 2 standard deviations?', ['95%', '68%', '99.7%', '50%'], 0, ''],
      ['$P(X \\ge 1)$ for $\\text{Bin}(3, 0.5)$', ['$\\frac{7}{8}$', '$\\frac{1}{8}$', '$\\frac{3}{8}$', '$\\frac{1}{2}$'], 0, '$1 - 0.5^3$.'],
    ],
  });
  stats.bank = [
    function binomialProb() {
      const n = ri(5, 10), p = pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]), k = ri(1, n - 1), pk = nCr(n, k) * p ** k * (1 - p) ** (n - k);
      return {
        level: 'S', tags: ['S1'], stem: `${m(`X \\sim \\text{Bin}(${n}, ${p})`)}. Give probabilities to 4 decimal places.`,
        parts: [
          P('a', `Find ${m(`P(X = ${k})`)}.`, 'num', rnd(pk, 4), dec(pk, 4), [m(`\\binom{${n}}{${k}}(${p})^{${k}}(${rnd(1 - p, 2)})^{${n - k}} \\approx ${dec(pk, 4)}`)], 2, { round: 4 }),
          P('b', 'Find $E(X)$.', 'num', rnd(n * p, 4), dec(n * p, 4), [m(`np = ${n} \\times ${p} = ${dec(n * p, 4)}`)]),
          P('c', 'Find $\\text{Var}(X)$.', 'num', rnd(n * p * (1 - p), 4), dec(n * p * (1 - p), 4), [m(`np(1 - p) = ${dec(n * p * (1 - p), 4)}`)], 1, { round: 4 }),
        ],
      };
    },
    function atLeastOne() {
      const n = ri(3, 8), p = pick([0.05, 0.1, 0.15, 0.2, 0.3]), q = 1 - p, a1 = 1 - q ** n, le1 = q ** n + n * p * q ** (n - 1);
      return {
        level: 'F', tags: ['S1'], stem: `Each light in a string of ${n} fails independently with probability ${p}. Give answers to 4 decimal places.`,
        parts: [
          P('a', 'Find the probability that at least one light fails.', 'num', rnd(a1, 4), dec(a1, 4), [m(`1 - (${rnd(q, 2)})^{${n}} \\approx ${dec(a1, 4)}`)], 1, { round: 4 }),
          P('b', 'Find the probability that at most one fails.', 'num', rnd(le1, 4), dec(le1, 4), [m(`(${rnd(q, 2)})^{${n}} + ${n}(${p})(${rnd(q, 2)})^{${n - 1}} \\approx ${dec(le1, 4)}`)], 2, { round: 4 }),
        ],
      };
    },
    function sampleProportion() {
      const p = pick([0.2, 0.3, 0.4, 0.5, 0.6]), n = pick([100, 200, 400, 600]), sd = Math.sqrt(p * (1 - p) / n), ph = rnd(p + pick([-2, -1, 1, 2]) * sd, 3), z = (ph - p) / sd;
      return {
        level: 'C', tags: ['S2'], stem: `In a large town ${p * 100}% of people own a dog. Random samples of ${n} people are taken.`,
        parts: [
          P('a', `Find the standard deviation of ${m('\\hat{p}')} (4 decimal places).`, 'num', rnd(sd, 4), dec(sd, 4), [m(`\\sqrt{\\frac{${p}(${rnd(1 - p, 2)})}{${n}}} \\approx ${dec(sd, 4)}`)], 1, { round: 4 }),
          P('b', `Find the $z$-score of a sample with ${m(`\\hat{p} = ${ph}`)} (2 decimal places).`, 'num', rnd(z, 2), dec(z, 2), [m(`z = \\frac{${ph} - ${p}}{${dec(sd, 4)}} \\approx ${dec(z, 2)}`)], 1, { round: 2 }),
          CH('c', `About what percentage of samples have ${m('\\hat{p}')} within one standard deviation of ${p}?`, '68%', ['95%', '99.7%', '50%'], ['Empirical rule']),
        ],
      };
    },
  ];

  /* ================= PROOF BY INDUCTION ================= */
  const proof = finish({
    id: 'e1proof', subject: SUBJECT, title: 'Proof by Induction', chapter: 'Ext 1 · Y12', hue: 'lilac',
    blurb: 'Induction for sums and divisibility, in the Extension 1 style.',
    sections: [
      { code: 'I1', name: 'Induction for sums', notes: ['Show it is true for $n = 1$.', 'Assume true for $n = k$; add the $(k + 1)$th term to both sides.', 'Rearrange to the formula with $n = k + 1$, then conclude.'], ex: ['$1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$', 'Assume for $k$, add $k + 1$', '$\\frac{k(k+1)}{2} + (k + 1) = \\frac{(k+1)(k+2)}{2}$'] },
      { code: 'I2', name: 'Induction for divisibility', notes: ['Write the assumption as $\\text{expression} = dM$ with $M$ an integer.', 'Rewrite the $k + 1$ expression in terms of the assumed one.', 'Factor out $d$ and state the result is divisible.'], ex: ['$4^n - 1$ divisible by 3', '$4^{k+1} - 1 = 4(4^k - 1) + 3$', '$= 4(3M) + 3 = 3(4M + 1)$'] },
      { code: 'I3', name: 'Writing it up for full marks', notes: ['Show the base case with both sides worked out, not just "true".', 'State the assumption clearly: "Assume true for $n = k$, i.e. …".', 'In the $k + 1$ step, say exactly where you use the assumption.', 'Finish with: "Hence true for all integers $n \\ge 1$ by mathematical induction."'], ex: ['Common mistake', 'Writing the $k + 1$ statement and "proving" it by assuming it', 'Start from one side of the $k + 1$ statement and work to the other'] },
    ],
    cards: [
      ['Step 1', 'Prove the base case'], ['Step 2', 'Assume true for $n = k$'], ['Step 3', 'Prove true for $n = k + 1$'], ['Conclusion', 'True for all $n \\ge 1$ by induction'],
      ['$\\sum_{r=1}^{n} r$', '$\\frac{n(n+1)}{2}$'], ['$\\sum_{r=1}^{n} r^2$', '$\\frac{n(n+1)(2n+1)}{6}$'], ['Divisibility assumption', '$\\text{expression} = dM$, $M \\in \\mathbb{Z}$'], ['$5^{k+1} - 1$ rewritten', '$5(5^k - 1) + 4$'],
    ],
    concepts: [
      ['The inductive hypothesis assumes the result for…', ['$n = k$', '$n = k + 1$', '$n = 1$', 'all $n$'], 0, ''],
      ['For $\\sum_{r=1}^{n} r^2$, the term added in the $k + 1$ step is…', ['$(k + 1)^2$', '$k^2$', '$k + 1$', '$2k + 1$'], 0, ''],
      ['$6^{k+1} - 1 = $', ['$6(6^k - 1) + 5$', '$6(6^k - 1) - 5$', '$6^k - 1 + 6$', '$(6^k - 1)^2$'], 0, ''],
      ['A proof by induction must end with…', ['A conclusion statement', 'A counterexample', 'A diagram', 'A guess'], 0, ''],
      ['To start, you check $n = 1$ because…', ['It is the first value the claim covers', 'It is always true', 'It makes $k$ zero', 'Induction needs negative numbers'], 0, ''],
      ['Which can induction prove?', ['A statement for all positive integers', 'A statement for all real numbers', 'Only finite sums', 'Only inequalities'], 0, ''],
    ],
  });
  // "3x", "x", "-x": a term with its coefficient, leaving out a 1
  const cterm = (c, v, first) => `${first ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 && v ? '' : Math.abs(c)}${v}`;
  const wrap = (fn, tags) => ({ [fn.name]: (L) => ({ ...fn(L), tags }) })[fn.name];
  const E2ind = E2x.DECKS.find(d => d.id === 'e2induction').bank;
  proof.bank = [
    function baseCase() {
      const n = ri(2, 9), S = pick([['r', 'n(n+1)', 2, (k) => k * (k + 1) / 2], ['r^2', 'n(n+1)(2n+1)', 6, (k) => k * (k + 1) * (2 * k + 1) / 6]]);
      return {
        level: 'F', tags: ['I1'], stem: `Consider ${m(`\\displaystyle\\sum_{r=1}^{n} ${S[0]} = \\frac{${S[1]}}{${S[2]}}`)}.`,
        parts: [
          P('a', 'Find the value of the right-hand side when $n = 1$.', 'num', 1, '1', ['Substitute $n = 1$: both sides equal 1, so the base case holds']),
          P('b', `Check the formula for ${m(`n = ${n}`)}: what is the sum?`, 'num', S[3](n), String(S[3](n)), [`Formula with ${m(`n = ${n}`)}: ${m(String(S[3](n)))}`]),
        ],
      };
    },
    wrap(E2ind.find(f => f.name === 'series'), ['I1']),
    wrap(E2ind.find(f => f.name === 'divisibility'), ['I2']),
  ];

  return { DECKS: [poly, trig, comb, calc, vec, stats, proof] };
})();
if (typeof module !== 'undefined') module.exports = E1;
