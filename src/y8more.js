/* ===== Lock In — more Year 8 maths: Ch 3 Algebra and Ch 7 Investigating data =====
   Notes and questions are original, following New Century Maths 8 topics. Not part of the Term 4 exam. */

const Y8 = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const rnd = (x, dp) => Math.round(x * 10 ** dp) / 10 ** dp;
  const num = (x, dp = 2) => String(rnd(x, dp));
  const neg = (n) => (n < 0 ? '−' + -n : String(n));
  const P = (label, q, type, value, show, steps, marks = 1, extra = {}) => ({ label, q, type, value, show, steps, marks, ...extra });
  // Multiple-choice part: wrong answers are de-duplicated and never equal the right one.
  function CH(label, q, right, wrongs, steps, marks = 1, extra = {}) {
    const opts = [String(right), ...[...new Set(wrongs.map(String))].filter(w => w !== String(right))].slice(0, 4);
    const choices = shuffle(opts);
    return { label, q, type: 'choice', choices, value: choices.indexOf(String(right)), show: String(right), steps, marks, ...extra };
  }
  // Drill version of a choice question.
  const drillCH = (q, right, wrongs, steps, tag) => { const p = CH('', q, right, wrongs, steps); return { q, type: 'choice', choices: p.choices, value: p.value, show: p.show, steps, tag }; };

  /* ---------- algebra helpers: build expressions like "5x − 3y + 2" ---------- */
  const term = (c, v) => (v ? (c === 1 ? v : c === -1 ? '−' + v : neg(c) + v) : neg(c));
  function expr(terms) {
    const t = terms.filter(([c]) => c !== 0);
    if (!t.length) return '0';
    return t.map(([c, v], i) => (i === 0 ? term(c, v) : (c < 0 ? ' − ' : ' + ') + term(Math.abs(c), v))).join('');
  }

  /* ================= Ch 3 ALGEBRA ================= */
  const alg = {
    id: 'alg', subject: 'maths', inExam: false, title: 'Algebra', chapter: 'Ch 3', hue: 'lilac',
    blurb: 'Expressions, substitution, like terms, multiplying and dividing terms, expanding and factorising.',
    sections: [
      { code: '3.01', name: 'Variables and expressions', notes: ['A variable (pronumeral) is a letter that stands for a number, like x or n.', 'A term is a number, a variable, or numbers and variables multiplied together: 5, x, 3ab. Terms are separated by + and − signs.', 'The coefficient is the number in front of a variable: in 7y the coefficient is 7. A term with no variable is a constant.', 'Turning words into algebra: "3 more than n" is n + 3, "twice x" is 2x, "half of k" is k/2.'], ex: ['Write "4 less than 3 times m"', '3 times m is 3m', '4 less than that: 3m − 4'] },
      { code: '3.02', name: 'Substitution', notes: ['Substitution means replacing each variable with its value, then working it out.', 'Put the number in brackets first so signs and powers come out right: if b = −2 then b^2 = (−2)^2 = 4.', 'Use the order of operations: brackets, powers, × and ÷, then + and −.'], ex: ['Find 3a + b^2 when a = 4, b = −3', '3(4) + (−3)^2', '12 + 9 = 21'] },
      { code: '3.03', name: 'Adding and subtracting terms', notes: ['Like terms have exactly the same variables with the same powers: 4xy and −xy are like terms; 4x and 4x^2 are not.', 'Only like terms can be added or subtracted: add or subtract their coefficients and keep the variables.', 'The order of letters in a term does not matter: 3ab and 5ba are like terms (total 8ab).'], ex: ['Simplify 6x + 2y − 4x + 5y', 'x terms: 6x − 4x = 2x; y terms: 2y + 5y = 7y', '2x + 7y'] },
      { code: '3.04', name: 'Multiplying terms', notes: ['Multiply the numbers (coefficients) first, then the variables.', 'A variable times itself is a power: m × m = m^2, and 2a × 3a = 6a^2.', 'Watch the signs: a negative times a negative is positive.'], ex: ['Simplify −3p × 4pq', '−3 × 4 = −12', 'p × p × q = p^2q, so −12p^2q'] },
      { code: '3.05', name: 'Dividing terms', notes: ['Write the division as a fraction, then cancel common factors of the numbers and the variables.', 'Anything divided by itself is 1, so x ÷ x = 1.', 'Example: 18ab ÷ 6b = 18ab/6b = 3a.'], ex: ['Simplify 20mn ÷ 5m', '20 ÷ 5 = 4', 'm cancels, leaving 4n'] },
      { code: '3.06', name: 'Expanding expressions', notes: ['Expanding removes brackets: multiply the term outside by every term inside. a(b + c) = ab + ac.', 'A negative outside changes the sign of every term inside: −2(x − 5) = −2x + 10.', 'After expanding, collect like terms to simplify.'], ex: ['Expand and simplify 3(x + 4) + 2(x − 1)', '3x + 12 + 2x − 2', '5x + 10'] },
      { code: '3.07', name: 'Factorising expressions', notes: ['Factorising is the opposite of expanding: take out the highest common factor (HCF) and put the rest in brackets.', 'Find the HCF of the numbers and of the variables, e.g. HCF of 12x and 18xy is 6x.', 'Check by expanding your answer: it should give back the original expression.'], ex: ['Factorise 15a + 10ab', 'HCF of 15a and 10ab is 5a', '5a(3 + 2b)'] },
      { code: '3.08', name: 'Algebraic fractions', ext: true, notes: ['Algebraic fractions work like number fractions: to add or subtract, use a common denominator.', 'x/3 + x/4 = 4x/12 + 3x/12 = 7x/12.', 'To multiply, multiply tops and bottoms, then cancel. To divide, flip the second fraction and multiply.'], ex: ['Simplify x/2 − x/5', 'Common denominator 10: 5x/10 − 2x/10', '3x/10'] },
    ],
    cards: [
      ['Variable (pronumeral)', 'A letter that stands for a number, like x or n.'],
      ['Term', 'A number, a variable, or a product of them, e.g. 5, y, 4ab.'],
      ['Coefficient', 'The number in front of a variable: 9 in 9k.'],
      ['Constant', 'A term with no variable, e.g. the 7 in 2x + 7.'],
      ['Expression', 'Terms joined by + and −, with no equals sign, e.g. 3x − 2y + 1.'],
      ['Like terms', 'Terms with exactly the same variables and powers, e.g. 3ab and −ba.'],
      ['Substitution', 'Replacing a variable with a number and working out the value.'],
      ['m × m = ?', 'm^2'],
      ['Expand a(b + c)', 'ab + ac'],
      ['Factorise', 'Write as a product by taking out the HCF, e.g. 6x + 9 = 3(2x + 3).'],
      ['HCF', 'Highest common factor: the biggest term that divides into every term.'],
      ['−(x − 4) = ?', '−x + 4 (a negative outside flips every sign inside).'],
      ['"5 less than y"', 'y − 5'],
      ['x/3 + x/6 = ?', 'x/2 (common denominator 6: 2x/6 + x/6 = 3x/6)'],
    ],
    concepts: [
      ['What is the coefficient of y in 8x − 5y + 2?', ['−5', '5', '8', '2'], 0, 'The number in front of y, including its sign, is −5.'],
      ['Which pair are like terms?', ['3ab and −2ba', '4x and 4x^2', '5m and 5n', '7 and 7k'], 0, 'Same variables, same powers; order of letters doesn\'t matter.'],
      ['"Double n, then add 3" as an expression is…', ['2n + 3', '2(n + 3)', 'n^2 + 3', '2 + 3n'], 0, 'Double n first (2n), then add 3.'],
      ['If a = −4, what is a^2?', ['16', '−16', '−8', '8'], 0, '(−4) × (−4) = 16.'],
      ['Simplify 3x × 4x', ['12x^2', '7x', '12x', '7x^2'], 0, '3 × 4 = 12 and x × x = x^2.'],
      ['Expand −3(2y − 5)', ['−6y + 15', '−6y − 15', '6y − 15', '−6y − 5'], 0, '−3 × 2y = −6y and −3 × −5 = +15.'],
      ['The HCF of 14p and 21pq is…', ['7p', '7', '7pq', '21p'], 0, 'HCF of 14 and 21 is 7; both terms contain p.'],
      ['Factorise 8x + 12', ['4(2x + 3)', '2(4x + 12)', '4(2x + 12)', '8(x + 4)'], 0, 'Take out the HCF 4: 8x ÷ 4 = 2x, 12 ÷ 4 = 3.'],
      ['Simplify 12mn ÷ 4n', ['3m', '3mn', '8m', '3n'], 0, '12 ÷ 4 = 3 and n cancels.'],
    ],
  };

  const algBank = [
    function substitution() {
      const a = ri(2, 7), b = ri(2, 6), c = -ri(1, 5);
      return {
        level: 'F', tags: ['3.02'], stem: `Find the value of each expression when a = ${a}, b = ${b} and c = ${neg(c)}.`,
        parts: [
          P('a', '3a + 2b', 'num', 3 * a + 2 * b, String(3 * a + 2 * b), [`3(${a}) + 2(${b})`, `${3 * a} + ${2 * b} = ${3 * a + 2 * b}`]),
          P('b', 'ab − 4', 'num', a * b - 4, String(a * b - 4), [`${a} × ${b} − 4`, `${a * b} − 4 = ${a * b - 4}`]),
          P('c', 'a^2 + c', 'num', a * a + c, neg(a * a + c), [`${a}^2 + (${neg(c)})`, `${a * a} − ${-c} = ${neg(a * a + c)}`]),
          P('d', 'c^2 − b', 'num', c * c - b, neg(c * c - b), [`(${neg(c)})^2 − ${b}`, `${c * c} − ${b} = ${neg(c * c - b)}`, 'A negative squared is positive.']),
        ],
      };
    },
    function likeTerms() {
      const [p, q, r, s] = [ri(3, 9), ri(1, 6), ri(1, 2), ri(1, 5)];
      const right = expr([[p - r, 'x'], [q + s, 'y']]);
      const k = ri(2, 6), m = ri(2, 5), n = ri(1, k - 1 || 1);
      const right2 = term(k + m - n, 'ab');
      return {
        level: 'F', tags: ['3.03'], stem: 'Simplify each expression.',
        parts: [
          CH('a', `${expr([[p, 'x'], [q, 'y'], [-r, 'x'], [s, 'y']])}`, right, [expr([[p + r, 'x'], [q + s, 'y']]), expr([[p - r, 'x'], [q - s, 'y']]), term(p - r + q + s, 'xy'), expr([[p - r, 'y'], [q + s, 'x']])], [`x terms: ${p}x − ${r}x = ${term(p - r, 'x')}`, `y terms: ${q}y + ${s}y = ${term(q + s, 'y')}`, right]),
          CH('b', `${k}ab + ${m}ba − ${term(n, 'ab')}`, right2, [term(k + m + n, 'ab'), term(k + m - n, 'a^2b'), term(k - m - n, 'ab'), `${term(k + m, 'ab')} − ${n}`], ['ab and ba are like terms', `${k} + ${m} − ${n} = ${k + m - n}`, right2]),
        ],
      };
    },
    function multiplyDivide() {
      const c1 = ri(2, 6), c2 = ri(2, 6), c3 = ri(2, 5), k = ri(2, 6), d = ri(2, 6);
      const prod = `${c1 * c2}xy`;
      return {
        level: 'S', tags: ['3.04', '3.05'], stem: 'Simplify each expression.',
        parts: [
          CH('a', `${c1}x × ${c2}y`, prod, [`${c1 + c2}xy`, `${c1 * c2}x^2y`, `${c1 * c2}x + y`], [`${c1} × ${c2} = ${c1 * c2}`, `x × y = xy`, prod]),
          CH('b', `${c3}m × −${c3 + 1}m`, `−${c3 * (c3 + 1)}m^2`, [`${c3 * (c3 + 1)}m^2`, `−${c3 * (c3 + 1)}m`, `−${2 * c3 + 1}m^2`], [`${c3} × −${c3 + 1} = −${c3 * (c3 + 1)}`, 'm × m = m^2', `−${c3 * (c3 + 1)}m^2`]),
          CH('c', `${k * d}ab ÷ ${d}b`, term(k, 'a'), [term(k, 'ab'), term(k * d - d, 'a'), term(k, 'b')], [`${k * d}ab/${d}b`, `${k * d} ÷ ${d} = ${k}, b cancels`, term(k, 'a')]),
        ],
      };
    },
    function expand() {
      const a = ri(2, 6), m = ri(1, 9), b = ri(2, 5), n = ri(1, 7), c = ri(2, 4), d = ri(1, 6);
      const r2x = b + c, r2c = -b * n + c * d;
      const simp = expr([[r2x, 'x'], [r2c, '']]);
      return {
        level: 'S', tags: ['3.06'], stem: 'Expand and simplify.',
        parts: [
          CH('a', `${a}(x + ${m})`, expr([[a, 'x'], [a * m, '']]), [expr([[a, 'x'], [m, '']]), expr([[a, 'x'], [a + m, '']]), expr([[a * m, 'x']])], [`${a} × x = ${a}x`, `${a} × ${m} = ${a * m}`, expr([[a, 'x'], [a * m, '']])]),
          CH('b', `−${b}(x − ${n})`, expr([[-b, 'x'], [b * n, '']]), [expr([[-b, 'x'], [-b * n, '']]), expr([[b, 'x'], [-b * n, '']]), expr([[-b, 'x'], [-n, '']])], [`−${b} × x = −${b}x`, `−${b} × −${n} = +${b * n}`, expr([[-b, 'x'], [b * n, '']])]),
          CH('c', `${b}(x − ${n}) + ${c}(x + ${d})`, simp, [expr([[r2x, 'x'], [b * n + c * d, '']]), expr([[r2x, 'x'], [-n + d, '']]), expr([[b * c, 'x'], [r2c, '']])], [`${expr([[b, 'x'], [-b * n, '']])} + ${expr([[c, 'x'], [c * d, '']])}`, `x terms: ${b}x + ${c}x = ${r2x}x; numbers: ${neg(-b * n)} + ${c * d} = ${neg(r2c)}`, simp], 2),
          P('d', `Check your answer to (c): find its value when x = 3.`, 'num', r2x * 3 + r2c, neg(r2x * 3 + r2c), [`${r2x}(3) ${r2c < 0 ? '−' : '+'} ${Math.abs(r2c)} = ${neg(r2x * 3 + r2c)}`, `Same as ${b}(3 − ${n}) + ${c}(3 + ${d}) = ${neg(b * (3 - n) + c * (3 + d))} ✓`]),
        ],
      };
    },
    function factorise(lvl) {
      let a, b; do { a = ri(2, 5); b = ri(1, 7); } while (gcd(a, b) !== 1);
      const k = ri(2, 6), hard = lvl === 'C';
      const parts = [
        CH('a', `What is the HCF of ${k * a}x and ${k * b}xy?`, `${k}x`, [`${k}`, `${k}xy`, `${k * a * b}x`, `x`], [`HCF of ${k * a} and ${k * b} is ${k}`, 'Both terms contain x (only the second has y)', `HCF = ${k}x`]),
        CH('b', `Factorise ${k * a}x + ${k * b}`, `${k}(${a}x + ${b})`, [`${a}(${k}x + ${b})`, `${k}(${a}x + ${k * b})`, `${k * a}(x + ${b})`], [`HCF of ${k * a}x and ${k * b} is ${k}`, `${k * a}x ÷ ${k} = ${a}x, ${k * b} ÷ ${k} = ${b}`, `${k}(${a}x + ${b})`]),
      ];
      if (hard) parts.push(CH('c', `Factorise ${k * a}x^2 − ${k * b}x`, `${k}x(${a}x − ${b})`, [`${k}(${a}x^2 − ${b}x)`, `x(${k * a}x − ${k * b})`, `${k}x(${a}x − ${b}x)`, `${k}x^2(${a} − ${b})`], [`HCF of ${k * a}x^2 and ${k * b}x is ${k}x`, `${k * a}x^2 ÷ ${k}x = ${a}x, ${k * b}x ÷ ${k}x = ${b}`, `${k}x(${a}x − ${b})`], 2));
      return { level: hard ? 'C' : 'S', tags: ['3.07'], stem: 'Factorising.', parts };
    },
    function rectangle() {
      const a = ri(1, 9), x = ri(2, 9);
      const per = expr([[6, 'x'], [2 * a, '']]);
      return {
        level: 'S', tags: ['3.01', '3.02', '3.06'], stem: `A rectangle is x cm wide and (2x + ${a}) cm long.`,
        parts: [
          CH('a', 'Which expression gives its perimeter?', per, [expr([[3, 'x'], [a, '']]), expr([[4, 'x'], [2 * a, '']]), expr([[6, 'x'], [a, '']])], ['Perimeter = 2 × (length + width)', `2(2x + ${a} + x) = 2(3x + ${a})`, per]),
          P('b', `Find the perimeter when x = ${x} (cm).`, 'num', 6 * x + 2 * a, `${6 * x + 2 * a} cm`, [`6(${x}) + ${2 * a}`, `= ${6 * x + 2 * a} cm`]),
          CH('c', 'Which expression gives its area?', `2x^2 + ${a}x`, [`3x + ${a}`, `2x + ${a}x`, `2x^2 + ${a}`], ['Area = length × width', `x(2x + ${a}) = 2x^2 + ${a}x`]),
        ],
      };
    },
    function algFractions() {
      let a, b; do { a = ri(2, 7); b = ri(2, 7); } while (a >= b || gcd(a, b) !== 1);
      const top = a + b, bot = a * b, diff = b - a;
      return {
        level: 'C', ext: true, tags: ['3.08'], stem: 'Algebraic fractions.',
        parts: [
          CH('a', `Simplify x/${a} + x/${b}`, `${top}x/${bot}`, [`2x/${top}`, `x/${bot}`, `2x/${bot}`, `${top}x/${top}`], [`Common denominator ${bot}`, `${b}x/${bot} + ${a}x/${bot}`, `${top}x/${bot}`], 2),
          CH('b', `Simplify x/${a} − x/${b}`, `${diff === 1 ? '' : diff}x/${bot}`, [`0`, `x/${bot}`, `${diff + 1}x/${bot}`, `x/${b - a}`], [`${b}x/${bot} − ${a}x/${bot}`, `${diff === 1 ? '' : diff}x/${bot}`].filter((v, i, arr) => arr.indexOf(v) === i)),
          P('c', `Find the value of x/${a} + x/${b} when x = ${bot}.`, 'num', top, String(top), [`${bot}/${a} + ${bot}/${b} = ${b} + ${a}`, `= ${top}`]),
        ],
      };
    },
  ];
  alg.bank = algBank;
  alg.drills = {
    subst() { const x = ri(-5, 6), a = ri(2, 6), b = ri(-8, 9); return { q: `Find ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} when x = ${neg(x)}.`, type: 'num', value: a * x + b, show: neg(a * x + b), steps: [`${a}(${neg(x)}) ${b < 0 ? '−' : '+'} ${Math.abs(b)}`, `= ${neg(a * x + b)}`], tag: '3.02' }; },
    like() { const p = ri(2, 9), q = ri(1, 8); const r = term(p + q, 'k'); return drillCH(`Simplify ${p}k + ${q}k`, r, [term(p * q, 'k'), term(p + q, 'k^2'), `${p + q}`], [`${p} + ${q} = ${p + q}`, r], '3.03'); },
    multiply() { const p = ri(2, 7), q = ri(2, 7); const r = `${p * q}ab`; return drillCH(`Simplify ${p}a × ${q}b`, r, [`${p + q}ab`, `${p * q}a + b`, `${p}${q}ab`], [`${p} × ${q} = ${p * q}`, r], '3.04'); },
    expand() { const p = ri(2, 6), q = ri(1, 9); const r = expr([[p, 'y'], [p * q, '']]); return drillCH(`Expand ${p}(y + ${q})`, r, [expr([[p, 'y'], [q, '']]), expr([[p, 'y'], [p + q, '']]), `${p * q}y`], [`${p} × y + ${p} × ${q}`, r], '3.06'); },
    factor() { let a, b; do { a = ri(1, 5); b = ri(1, 7); } while (gcd(a, b) !== 1 || a === b); const k = ri(2, 6); const r = `${k}(${term(a, 'x')} + ${b})`; return drillCH(`Factorise ${term(k * a, 'x')} + ${k * b}`, r, [`${a}(${term(k, 'x')} + ${b})`, `${k}(${term(a, 'x')} + ${k * b})`, `${k * b}(x + ${a})`], [`HCF = ${k}`, r], '3.07'); },
  };

  /* ================= Ch 7 INVESTIGATING DATA ================= */
  const data = {
    id: 'data', subject: 'maths', inExam: false, title: 'Investigating Data', chapter: 'Ch 7', hue: 'green',
    blurb: 'Graphs, types of data, census vs sample, mean, median, mode, range, tables, dot plots and stem-and-leaf.',
    sections: [
      { code: '7.01', name: 'Column, sector and divided bar graphs', notes: ['Column graphs compare amounts in categories; the columns have gaps and equal widths.', 'A sector (pie) graph shows parts of a whole: each angle = fraction × 360°.', 'A divided bar graph is a single bar split into parts, like a pie graph stretched into a strip.'], ex: ['30 of 120 students walk to school. Sector angle?', '30/120 = 1/4', '1/4 × 360° = 90°'] },
      { code: '7.02', name: 'Line graphs, pictograms and infographics', notes: ['Line graphs show change over time: time goes on the horizontal axis.', 'Pictograms use symbols, with a key saying what each symbol stands for.', 'Infographics mix graphs, pictures and words. Check scales and keys: graphs can be misleading.'], ex: ['Key: one icon = 20 people. A row shows 3½ icons.', '3½ × 20', '70 people'] },
      { code: '7.03', name: 'Types of data', notes: ['Categorical data is in groups or labels (eye colour, favourite sport).', 'Numerical data is numbers. Discrete data is counted (number of pets); continuous data is measured (height, time).', 'Choose graphs to suit the data type: e.g. histograms for numerical data, sector graphs for categories.'], ex: ['Is "time to run 100 m" discrete or continuous?', 'It is measured, not counted', 'Continuous numerical'] },
      { code: '7.04', name: 'Census vs sample', notes: ['A census collects data from the whole population. A sample collects data from part of it.', 'Samples are cheaper and quicker but must be random and big enough to represent the population.', 'Bias is anything that makes a sample unrepresentative, e.g. only surveying your friends.'], ex: ['Survey every student in a school of 1200?', 'Every member of the population is asked', 'Census'] },
      { code: '7.05', name: 'The mean and mode', notes: ['Mean = sum of values ÷ number of values.', 'The mode is the value that occurs most often. There can be more than one mode, or none.', 'The mean uses every value, so one very large or small value (an outlier) can pull it a long way.'], ex: ['Find the mean of 4, 7, 7, 10, 12', 'Sum = 40, 5 values', 'Mean = 8; mode = 7'] },
      { code: '7.06', name: 'The median and range', notes: ['The median is the middle value when the data is in order. With an even number of values, it is the mean of the two middle values.', 'Position of the median = (n + 1)/2 for n values.', 'Range = highest value − lowest value. It measures spread.'], ex: ['Median of 3, 9, 4, 12, 8, 6', 'Order: 3, 4, 6, 8, 9, 12; middle two are 6 and 8', 'Median = 7; range = 12 − 3 = 9'] },
      { code: '7.07', name: 'Analysing frequency tables', notes: ['A frequency table lists each score and how often it occurs.', 'Total number of values = sum of the frequency column.', 'Mean = sum of (score × frequency) ÷ sum of frequencies. Add an fx column to help.'], ex: ['Scores 1, 2, 3 with frequencies 2, 5, 3', 'fx: 2 + 10 + 9 = 21, total frequency 10', 'Mean = 21 ÷ 10 = 2.1'] },
      { code: '7.08', name: 'Dot plots and stem-and-leaf plots', notes: ['A dot plot shows each value as a dot above a number line; the tallest stack is the mode.', 'A stem-and-leaf plot splits each number into a stem (tens) and a leaf (units): 47 is stem 4, leaf 7.', 'Leaves are written in order, so the median can be counted straight off the plot.'], ex: ['Stem 3 | leaves 1 4 4 8', 'Values: 31, 34, 34, 38', 'Mode 34, range 7'] },
      { code: '7.09', name: 'Frequency histograms and polygons', notes: ['A frequency histogram is a column graph for numerical data with no gaps between columns.', 'A frequency polygon joins the midpoints of the tops of the columns with straight lines.', 'Grouped data (e.g. 10–19, 20–29) uses class centres for the polygon.'], ex: ['Class 20–29: where is the polygon point?', 'Class centre = (20 + 29) ÷ 2', '24.5'] },
      { code: '7.10', name: 'Choosing the best graph', notes: ['Categories compared: column or sector graph. Change over time: line graph.', 'Numerical data distribution: dot plot, stem-and-leaf, or histogram.', 'Always include a title, labelled axes and a sensible scale.'], ex: ['Temperature every hour for a day: which graph?', 'It shows change over time', 'Line graph'] },
      { code: '7.11', name: 'The shape of data', notes: ['Symmetrical data looks the same on both sides of the centre.', 'Skewed data has a tail on one side: positively skewed means the tail goes to the right (high values), negatively skewed means the tail goes left.', 'A cluster is a group of values close together; an outlier is a value far from the rest.'], ex: ['Most scores are low, with a few very high ones', 'The tail points to the high values', 'Positively skewed'] },
      { code: '7.12', name: 'Comparing data', notes: ['Compare a centre (mean or median) and a spread (range) for each data set.', 'If there is an outlier, the median usually represents the data better than the mean.', 'Use numbers in your comparison: "Class A\'s median was 6 marks higher".'], ex: ['Incomes include one huge salary. Mean or median?', 'The outlier pulls the mean up', 'Median is the better measure'] },
    ],
    cards: [
      ['Categorical data', 'Data in groups or labels, e.g. hair colour.'],
      ['Numerical data', 'Data that is numbers, counted (discrete) or measured (continuous).'],
      ['Discrete vs continuous', 'Discrete = counted (pets). Continuous = measured (height).'],
      ['Census', 'Data collected from the whole population.'],
      ['Sample', 'Data collected from part of the population.'],
      ['Bias', 'Something that makes a sample not represent the population.'],
      ['Mean', 'Sum of the values ÷ number of values.'],
      ['Median', 'Middle value of ordered data (average of the middle two if even).'],
      ['Mode', 'The most common value.'],
      ['Range', 'Highest value − lowest value.'],
      ['Outlier', 'A value much bigger or smaller than the rest.'],
      ['Mean from a frequency table', 'Sum of (score × frequency) ÷ total frequency.'],
      ['Stem-and-leaf plot', 'Splits each value into stem (tens) and leaf (units), in order.'],
      ['Positively skewed', 'Tail stretches to the right (towards high values).'],
      ['Frequency histogram', 'Column graph for numerical data, columns touching.'],
      ['Sector angle', 'Fraction of the total × 360°.'],
    ],
    concepts: [
      ['Which is continuous numerical data?', ['Time taken to run 400 m', 'Number of siblings', 'Favourite colour', 'Shoe brand'], 0, 'Time is measured, so it is continuous.'],
      ['Which is categorical data?', ['Favourite sport', 'Height in cm', 'Goals scored', 'Age in years'], 0, 'Sports are categories, not numbers.'],
      ['Asking every Year 8 student at your school is a…', ['Census of Year 8', 'Sample of Year 8', 'Biased sample', 'Pictogram'], 0, 'Everyone in the population is asked.'],
      ['Which sample is most likely biased?', ['Surveying only people at a gym about exercise habits', 'Randomly choosing 100 names from the school roll', 'Picking every 10th student from an alphabetical list', 'Drawing names from a hat'], 0, 'Gym-goers exercise more than most people.'],
      ['Which measure is most affected by an outlier?', ['Mean', 'Median', 'Mode', 'None of them'], 0, 'The mean uses every value, including the outlier.'],
      ['The median of 2, 5, 9, 10 is…', ['7', '5', '9', '6.5'], 0, 'Middle two are 5 and 9; (5 + 9) ÷ 2 = 7.'],
      ['Which graph is best for showing temperature over a day?', ['Line graph', 'Sector graph', 'Pictogram', 'Divided bar graph'], 0, 'Line graphs show change over time.'],
      ['A tail stretching towards the high values means the data is…', ['Positively skewed', 'Negatively skewed', 'Symmetrical', 'Bimodal'], 0, ''],
      ['In a stem-and-leaf plot, 6 | 3 means…', ['63', '6.3', '36', '6 + 3'], 0, 'Stem = tens, leaf = units.'],
      ['A sector representing 1/3 of the data has an angle of…', ['120°', '90°', '60°', '30°'], 0, '1/3 × 360° = 120°.'],
    ],
  };

  // Data helpers
  const median = (xs) => { const s = xs.slice().sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  // n values with exactly one mode (the value `m` appears `times` times; every other value once).
  function withMode(n, lo, hi, times = 2) {
    const m = ri(lo, hi), pool = shuffle([...Array(hi - lo + 1)].map((_, i) => lo + i).filter(v => v !== m)).slice(0, n - times);
    return shuffle([...pool, ...Array(times).fill(m)]);
  }
  const medSteps = (xs) => { const s = xs.slice().sort((a, b) => a - b), n = s.length; return [`In order: ${s.join(', ')}`, n % 2 ? `Middle (position ${(n + 1) / 2}) = ${median(xs)}` : `Middle two: ${s[n / 2 - 1]} and ${s[n / 2]} → (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${median(xs)}`]; };

  const dataBank = [
    function summary() {
      const n = pick([7, 8, 9, 10]), xs = withMode(n, 12, 60);
      const mean = sum(xs) / n;
      return {
        level: 'F', tags: ['7.05', '7.06'], stem: `The number of minutes ${n} students spent on homework last night: ${xs.join(', ')}. Round the mean to one decimal place.`,
        parts: [
          P('a', 'Find the range.', 'num', Math.max(...xs) - Math.min(...xs), String(Math.max(...xs) - Math.min(...xs)), [`Highest ${Math.max(...xs)} − lowest ${Math.min(...xs)}`, `= ${Math.max(...xs) - Math.min(...xs)}`]),
          P('b', 'Find the mode.', 'num', xs.find((v, i) => xs.indexOf(v) !== i), String(xs.find((v, i) => xs.indexOf(v) !== i)), ['The value that appears most often']),
          P('c', 'Find the median.', 'num', median(xs), num(median(xs)), medSteps(xs)),
          P('d', 'Find the mean.', 'num', rnd(mean, 1), num(mean, 1), [`Sum = ${sum(xs)}`, `${sum(xs)} ÷ ${n} = ${num(mean, 3)}`, `≈ ${num(mean, 1)}`], 1, { round: 1 }),
        ],
      };
    },
    function freqTable() {
      const base = ri(0, 2), scores = [0, 1, 2, 3, 4].map(v => v + base);
      let f; do { f = scores.map(() => ri(1, 8)); } while (f.filter(v => v === Math.max(...f)).length > 1);
      const total = sum(f), fx = sum(scores.map((s, i) => s * f[i])), mean = fx / total;
      const all = scores.flatMap((s, i) => Array(f[i]).fill(s)), med = median(all), mode = scores[f.indexOf(Math.max(...f))];
      return {
        level: 'S', tags: ['7.07'], stem: 'The table shows the number of goals a netball team scored in each quarter over a season.',
        visual: { type: 'table', head: ['Goals', ...scores.map(String)], rows: [['Frequency', ...f]] },
        parts: [
          P('a', 'How many quarters were played?', 'num', total, String(total), [`Add the frequencies: ${f.join(' + ')} = ${total}`]),
          P('b', 'What is the mode?', 'num', mode, String(mode), [`Highest frequency is ${Math.max(...f)}, for ${mode} goals`]),
          P('c', 'Find the mean, correct to one decimal place.', 'num', rnd(mean, 1), num(mean, 1), [`Sum of score × frequency = ${scores.map((s, i) => `${s}×${f[i]}`).join(' + ')} = ${fx}`, `${fx} ÷ ${total} = ${num(mean, 3)}`, `≈ ${num(mean, 1)}`], 2, { round: 1 }),
          P('d', 'Find the median.', 'num', med, num(med), [`${total} values, so the median is at position ${(total + 1) / 2}`, `Counting through the frequencies gives ${num(med)}`]),
        ],
      };
    },
    function stemLeaf() {
      const n = ri(11, 15), xs = withMode(n, 21, 68).sort((a, b) => a - b);
      const stems = [...new Set(xs.map(v => Math.floor(v / 10)))];
      const rows = []; for (let s = stems[0]; s <= stems[stems.length - 1]; s++) rows.push([String(s), xs.filter(v => Math.floor(v / 10) === s).map(v => v % 10).join('  ')]);
      const mode = xs.find((v, i) => xs.indexOf(v) !== i);
      return {
        level: 'S', tags: ['7.08', '7.06'], stem: 'The stem-and-leaf plot shows the ages of people at a gym class.',
        visual: { type: 'table', head: ['Stem', 'Leaf'], rows },
        parts: [
          P('a', 'How many people were in the class?', 'num', n, String(n), ['Count the leaves', `${n}`]),
          P('b', 'What is the range of ages?', 'num', xs[n - 1] - xs[0], String(xs[n - 1] - xs[0]), [`Oldest ${xs[n - 1]} − youngest ${xs[0]}`, `= ${xs[n - 1] - xs[0]}`]),
          P('c', 'What is the mode?', 'num', mode, String(mode), ['The repeated leaf in the same row']),
          P('d', 'Find the median age.', 'num', median(xs), num(median(xs)), medSteps(xs)),
        ],
      };
    },
    function dotPlot() {
      const lo = ri(0, 3), xs = [];
      let counts; do { counts = [...Array(7)].map(() => ri(0, 5)); } while (counts.filter(c => c === Math.max(...counts)).length > 1 || counts[0] === 0 || counts[6] === 0);
      counts.forEach((c, i) => { for (let k = 0; k < c; k++) xs.push(lo + i); });
      const mode = lo + counts.indexOf(Math.max(...counts));
      return {
        level: 'F', tags: ['7.08', '7.05'], stem: 'The dot plot shows how many pets each student in a class has.',
        visual: { type: 'dotplot', from: lo, counts, label: 'Number of pets' },
        parts: [
          P('a', 'How many students are in the class?', 'num', xs.length, String(xs.length), ['Count every dot', `${xs.length}`]),
          P('b', 'What is the mode?', 'num', mode, String(mode), ['The tallest stack of dots']),
          P('c', 'What is the range?', 'num', 6, '6', [`Highest ${lo + 6} − lowest ${lo}`, '= 6']),
          P('d', `How many students have more than ${lo + 3} pets?`, 'num', counts.slice(4).reduce((a, b) => a + b, 0), String(counts.slice(4).reduce((a, b) => a + b, 0)), [`Add the dots above ${lo + 4}, ${lo + 5} and ${lo + 6}`]),
        ],
      };
    },
    function outlier() {
      const n = ri(6, 8), base = ri(40, 70), xs = [...Array(n)].map(() => base + ri(-6, 6)), big = base * ri(3, 5) + ri(0, 9);
      const all = [...xs, big], mWith = sum(all) / all.length, mWithout = sum(xs) / n;
      const choices = ['The median, because the outlier pulls the mean up', 'The mean, because it uses every value', 'The range, because it shows the spread', 'The mode, because it is the most common'];
      return {
        level: 'C', tags: ['7.12', '7.05', '7.06'], stem: `Weekly incomes (× $10) for ${all.length} part-time workers: ${shuffle(all).join(', ')}. Round means to one decimal place.`,
        parts: [
          P('a', 'Find the mean.', 'num', rnd(mWith, 1), num(mWith, 1), [`Sum = ${sum(all)}`, `${sum(all)} ÷ ${all.length} ≈ ${num(mWith, 1)}`], 1, { round: 1 }),
          P('b', 'Find the median.', 'num', median(all), num(median(all)), medSteps(all)),
          P('c', `Remove the outlier (${big}). Find the new mean.`, 'num', rnd(mWithout, 1), num(mWithout, 1), [`Sum = ${sum(xs)}`, `${sum(xs)} ÷ ${n} ≈ ${num(mWithout, 1)}`], 1, { round: 1 }),
          CH('d', 'With the outlier included, which measure best represents a typical income?', choices[0], choices.slice(1), [`The mean (${num(mWith, 1)}) is far above most incomes, but the median (${num(median(all))}) sits among them.`], 2),
        ],
      };
    },
    function dataTypes() {
      const items = shuffle([
        ['Favourite pizza topping', 'Categorical'], ['Eye colour', 'Categorical'], ['Type of car', 'Categorical'],
        ['Number of goals in a game', 'Numerical discrete'], ['Number of people in a household', 'Numerical discrete'], ['Pets owned', 'Numerical discrete'],
        ['Time to swim 50 m', 'Numerical continuous'], ['Height of a plant', 'Numerical continuous'], ['Mass of a baby', 'Numerical continuous'],
      ]).slice(0, 3);
      const cs = shuffle([['Testing every light bulb a factory makes, until it burns out', 'Sample'], ['Asking all 28 students in your class their birthday month', 'Census'], ['Polling 1000 voters before an election', 'Sample'], ['Recording the height of every player in a basketball team', 'Census']])[0];
      const T = ['Categorical', 'Numerical discrete', 'Numerical continuous'];
      return {
        level: 'F', tags: ['7.03', '7.04'], stem: 'Types of data and collecting data.',
        parts: [
          ...items.map(([it, ans], i) => CH('abc'[i], `What type of data is "${it}"?`, ans, T.filter(t => t !== ans), [ans === 'Categorical' ? 'It is a label or group, not a number.' : ans.endsWith('discrete') ? 'It is counted.' : 'It is measured.'])),
          CH('d', `Census or sample? ${cs[0]}`, cs[1], [cs[1] === 'Census' ? 'Sample' : 'Census'], [cs[1] === 'Census' ? 'Every member of the group is included.' : 'Only part of the population is used (testing everything would be impractical or impossible).']),
        ],
      };
    },
    function changeMean() {
      const k = ri(3, 6), m = ri(60, 80), target = m + ri(1, 4), need = (k + 1) * target - k * m;
      const ys = [...Array(5)].map(() => ri(55, 90)), add = ri(2, 6), oldMean = sum(ys) / 5;
      return {
        level: 'C', tags: ['7.05', '7.12'], stem: 'Changing the mean.',
        parts: [
          P('a', `Ava's mean mark over ${k} tests is ${m}%. What does she need in her next test to make her mean ${target}%?`, 'num', need, `${need}%`, [`Total so far = ${k} × ${m} = ${k * m}`, `Total needed after ${k + 1} tests = ${k + 1} × ${target} = ${(k + 1) * target}`, `Next test = ${(k + 1) * target} − ${k * m} = ${need}`], 2),
          P('b', `The marks ${ys.join(', ')} each get ${add} added. What is the new mean? (1 decimal place)`, 'num', rnd(oldMean + add, 1), num(oldMean + add, 1), [`Old mean = ${sum(ys)} ÷ 5 = ${num(oldMean, 2)}`, `Adding ${add} to every value adds ${add} to the mean`, `New mean ≈ ${num(oldMean + add, 1)}`], 1, { round: 1 }),
        ],
      };
    },
  ];
  data.bank = dataBank;
  data.drills = {
    mean() { const xs = [...Array(ri(4, 6))].map(() => ri(1, 20)); const m = sum(xs) / xs.length; return { q: `Find the mean of ${xs.join(', ')} (1 decimal place if needed).`, type: 'num', value: rnd(m, 1), show: num(m, 1), round: 1, steps: [`Sum = ${sum(xs)}`, `${sum(xs)} ÷ ${xs.length} = ${num(m, 3)}`], tag: '7.05' }; },
    median() { const xs = [...Array(ri(5, 8))].map(() => ri(1, 30)); return { q: `Find the median of ${xs.join(', ')}.`, type: 'num', value: median(xs), show: num(median(xs)), steps: medSteps(xs), tag: '7.06' }; },
    range() { const xs = [...Array(ri(5, 8))].map(() => ri(3, 99)); const r = Math.max(...xs) - Math.min(...xs); return { q: `Find the range of ${xs.join(', ')}.`, type: 'num', value: r, show: String(r), steps: [`${Math.max(...xs)} − ${Math.min(...xs)} = ${r}`], tag: '7.06' }; },
    sector() { const t = pick([60, 80, 90, 120, 180, 240, 360]), p = pick([1, 2, 3]) * t / 6; return { q: `${p} out of ${t} people chose blue. What angle is the blue sector in a pie graph (degrees)?`, type: 'num', value: p / t * 360, show: `${p / t * 360}°`, steps: [`${p}/${t} × 360°`, `= ${p / t * 360}°`], tag: '7.01' }; },
  };

  [alg, data].forEach(d => {
    d.cards = d.cards.map(([q, a]) => ({ q, a }));
    d.concepts = d.concepts.map(([q, options, answer, why]) => ({ q, options, answer, why }));
  });
  return { DECKS: [alg, data] };
})();
if (typeof module !== 'undefined') module.exports = Y8;
