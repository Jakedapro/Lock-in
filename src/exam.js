/* ===== Lock In — exam-style questions =====
   Multi-part questions in the style of NCM8 "Test yourself" pages. Every question is generated fresh;
   every part carries its exact answer, working and marks. Levels: F = Foundation, S = Standard, C = Complex. */

const X = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const fr = (n, d) => { if (n === 0) return '0'; const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; };
  const rnd = (x, dp = 2) => Math.round(x * 10 ** dp) / 10 ** dp;
  const num = (x, dp = 3) => { const r = rnd(x, dp); return Number.isInteger(r) ? r.toLocaleString('en-AU') : String(r); };
  const money = (x) => '$' + rnd(x, 2).toFixed(2);
  const pct = (x, dp = 1) => num(x * 100, dp) + '%';
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const sgn = (n) => (n < 0 ? `− ${-n}` : `+ ${n}`);
  const coprime = (lo = 1, hi = 9) => { let p, q; do { p = ri(lo, hi); q = ri(lo, hi); } while (p === q || gcd(p, q) !== 1); return [p, q]; };
  const PI = Math.PI;

  // part builder
  const P = (label, q, type, value, show, steps, marks = 1, extra = {}) => ({ label, q, type, value, show, steps, marks, ...extra });
  const probShow = (n, d) => { const f = fr(n, d); return f.includes('/') ? `${f}  (= ${num(n / d, 3)})` : f; };

  /* ================= CHAPTER 8 · PROBABILITY ================= */
  const prob = [
    function hairTies() {
      const c = shuffle(['red', 'yellow', 'blue', 'green', 'black']).slice(0, 3), n = c.map(() => ri(2, 9)), T = n[0] + n[1] + n[2];
      const opts = shuffle([`${n[0]}/${T}`, `1/${T}`, `${n[0]}/${T - n[0]}`, `${T}/${n[0]}`]);
      return {
        level: 'F', tags: ['8.01', '8.02'], stem: `A drawer holds ${n[0]} ${c[0]}, ${n[1]} ${c[1]} and ${n[2]} ${c[2]} hair ties. One is picked at random.`,
        parts: [
          P('a', `What is the probability that it is ${c[0]}? Select the correct answer.`, 'choice', opts.indexOf(`${n[0]}/${T}`), `${n[0]}/${T}`, [`Total = ${n.join(' + ')} = ${T}`, `P(${c[0]}) = ${n[0]}/${T}`], 1, { choices: opts }),
          P('b', `What is the probability that it is NOT ${c[2]}?`, 'num', (T - n[2]) / T, probShow(T - n[2], T), [`Not ${c[2]} = ${T} − ${n[2]} = ${T - n[2]}`, `P = ${T - n[2]}/${T}${fr(T - n[2], T) !== `${T - n[2]}/${T}` ? ' = ' + fr(T - n[2], T) : ''}`]),
        ],
      };
    },
    function dieRoll() {
      const k = ri(2, 4), s = ri(1, 6);
      return {
        level: 'F', tags: ['8.01'], stem: 'A normal six-sided die is rolled. Find the probability that the number that comes up is:',
        parts: [
          P('a', `${s}`, 'num', 1 / 6, '1/6', ['6 equally likely outcomes, one of them is ' + s, 'P = 1/6']),
          P('b', `more than ${k}`, 'num', (6 - k) / 6, probShow(6 - k, 6), [`More than ${k}: {${[1, 2, 3, 4, 5, 6].filter(x => x > k).join(', ')}} → ${6 - k} outcomes`, `P = ${6 - k}/6 = ${fr(6 - k, 6)}`]),
          P('c', 'odd', 'num', 1 / 2, '1/2', ['Odd: {1, 3, 5} → 3 outcomes', 'P = 3/6 = 1/2']),
          P('d', 'composite', 'num', 1 / 3, '1/3', ['Composite numbers have more than two factors.', 'On a die: {4, 6} (1 is neither prime nor composite)', 'P = 2/6 = 1/3']),
        ],
      };
    },
    function spinner() {
      const s = ri(1, 6), L = [s, s + 1, s + 2, s + 3], t = pick([s + 1, s + 2]);
      return {
        level: 'F', tags: ['8.01'], stem: `This spinner has 4 equal sectors numbered ${L.join(', ')}.`, visual: { type: 'spinner', labels: L },
        parts: [
          P('a', 'How many outcomes are in the sample space?', 'num', 4, `4  (sample space = {${L.join(', ')}})`, [`Sample space = {${L.join(', ')}}`, '4 outcomes']),
          P('b', `As a percentage, find the probability that the number spun is ${L[2]}.`, 'pct', 0.25, '25%', ['1 of 4 equal sectors', '1/4 = 25%']),
          P('c', `As a percentage, find P(at least ${t}).`, 'pct', L.filter(x => x >= t).length / 4, pct(L.filter(x => x >= t).length / 4), [`"At least ${t}" means ${t} or more: {${L.filter(x => x >= t).join(', ')}}`, `${L.filter(x => x >= t).length}/4 = ${pct(L.filter(x => x >= t).length / 4)}`]),
          P('d', `As a percentage, find P(less than ${t}).`, 'pct', L.filter(x => x < t).length / 4, pct(L.filter(x => x < t).length / 4), [`Less than ${t}: {${L.filter(x => x < t).join(', ')}}`, `${L.filter(x => x < t).length}/4 = ${pct(L.filter(x => x < t).length / 4)}`]),
        ],
      };
    },
    function complements() {
      const p = ri(55, 92), N = pick([200, 500, 800, 1000, 1500]);
      const ev = pick([
        ['choosing an Ace from a standard deck of cards', 'not choosing an Ace', 48, 52],
        ['rolling a factor of 6 on a die', 'not rolling a factor of 6 (rolling a 4 or 5)', 2, 6],
        ['drawing a heart from a standard deck', 'not drawing a heart', 39, 52],
      ]);
      const opts = shuffle([cap(ev[1]), 'Choosing a King', 'Rolling a 6', 'There is no complementary event']);
      return {
        level: 'S', tags: ['8.02'], stem: 'Complementary events.',
        parts: [
          P('a', `What is the complementary event to ${ev[0]}?`, 'choice', opts.indexOf(cap(ev[1])), cap(ev[1]), ['The complement is everything that is NOT the event.'], 1, { choices: opts }),
          P('b', 'What is the probability of that complementary event?', 'num', ev[2] / ev[3], probShow(ev[2], ev[3]), [`P(complement) = 1 − P(event)`, `= ${ev[2]}/${ev[3]} = ${fr(ev[2], ev[3])}`]),
          P('c', `A golfer has a ${p}% chance of sinking a putt. What is the probability that she misses? (as a percentage)`, 'pct', (100 - p) / 100, `${100 - p}%`, [`P(miss) = 100% − ${p}%`, `= ${100 - p}%`]),
          P('d', `You buy 1 ticket in a raffle where ${N.toLocaleString('en-AU')} tickets are sold. What is the probability you do NOT win? (as a decimal)`, 'num', (N - 1) / N, num((N - 1) / N, 4), [`P(win) = 1/${N}`, `P(not win) = 1 − 1/${N} = ${N - 1}/${N} = ${num((N - 1) / N, 4)}`]),
        ],
      };
    },
    function truck() {
      const items = pick([['hand sanitiser', 'soap', 'paper', 'pens'], ['apples', 'oranges', 'bananas', 'pears'], ['comics', 'novels', 'atlases', 'dictionaries']]);
      const n = items.map(() => ri(4, 70) * 5), T = n.reduce((a, b) => a + b, 0);
      return {
        level: 'S', tags: ['8.01', '8.02', '8.05'], stem: `A truck carries ${n.map((x, i) => `${x} boxes of ${items[i]}`).join(', ').replace(/, ([^,]*)$/, ' and $1')}. The driver picks one box at random. What is the probability that it is:`,
        parts: [
          P('a', `a box of ${items[0]}?`, 'num', n[0] / T, probShow(n[0], T), [`Total = ${n.join(' + ')} = ${T}`, `P = ${n[0]}/${T} = ${fr(n[0], T)}`]),
          P('b', `a box of ${items[3]} or ${items[1]}?`, 'num', (n[3] + n[1]) / T, probShow(n[3] + n[1], T), [`${items[3]} or ${items[1]} = ${n[3]} + ${n[1]} = ${n[3] + n[1]}`, `P = ${n[3] + n[1]}/${T} = ${fr(n[3] + n[1], T)}`]),
          P('c', `a box of ${items[2]}?`, 'num', n[2] / T, probShow(n[2], T), [`P = ${n[2]}/${T} = ${fr(n[2], T)}`]),
          P('d', `NOT a box of ${items[2]}?`, 'num', (T - n[2]) / T, probShow(T - n[2], T), [`1 − ${fr(n[2], T)} = ${fr(T - n[2], T)}`]),
        ],
      };
    },
    function venn() {
      const [A, B] = pick([['Mumps', 'Measles'], ['Netball', 'Soccer'], ['Dog', 'Cat'], ['Piano', 'Guitar']]);
      const a = ri(8, 30), c = ri(3, 20), b = ri(8, 30), n = ri(2, 12), T = a + b + c + n;
      return {
        level: 'C', ext: true, tags: ['8.03'], stem: `The Venn diagram shows a group of students and whether they have ${A.toLowerCase()} and/or ${B.toLowerCase()}.`, visual: { type: 'venn', A, B, a, b, c, n },
        parts: [
          P('a', 'How many students are in the group?', 'num', T, String(T), [`Add every region: ${a} + ${c} + ${b} + ${n} = ${T}`]),
          P('b', `How many have ${A.toLowerCase()} AND ${B.toLowerCase()}?`, 'num', c, String(c), ['That is the overlap of the two circles', `= ${c}`]),
          P('c', `How many have ${A.toLowerCase()} or ${B.toLowerCase()}, but not both?`, 'num', a + b, String(a + b), [`Each circle without the overlap: ${a} + ${b} = ${a + b}`]),
          P('d', `One student is picked at random. Find P(has ${B.toLowerCase()}).`, 'num', (c + b) / T, probShow(c + b, T), [`${B} circle = ${c} + ${b} = ${c + b}`, `P = ${c + b}/${T}${fr(c + b, T) !== `${c + b}/${T}` ? ' = ' + fr(c + b, T) : ''}`]),
          P('e', `Find P(${A.toLowerCase()} or ${B.toLowerCase()}).`, 'num', (a + b + c) / T, probShow(a + b + c, T), [`Inside either circle = ${a} + ${c} + ${b} = ${a + b + c}`, `P = ${fr(a + b + c, T)}`]),
          P('f', 'Find P(neither).', 'num', n / T, probShow(n, T), [`Outside both circles = ${n}`, `P = ${fr(n, T)}`]),
        ],
      };
    },
    function twoWay() {
      const [R, Cc] = pick([['Soccer', 'Cricket'], ['Plays sport', 'Plays music'], ['Has a phone', 'Has a tablet']]);
      const ss = ri(12, 35), sn = ri(5, 20), ns = ri(5, 25), nn = ri(3, 12), T = ss + sn + ns + nn;
      return {
        level: 'C', ext: true, tags: ['8.04'], stem: `A group of people were surveyed. The results are in this two-way table.`,
        visual: { type: 'table', head: ['', Cc, `Not ${Cc.toLowerCase()}`], rows: [[R, ss, sn], [`Not ${R.toLowerCase()}`, ns, nn]] },
        parts: [
          P('a', 'How many people were surveyed?', 'num', T, String(T), [`${ss} + ${sn} + ${ns} + ${nn} = ${T}`]),
          P('b', `How many are "${R}"?`, 'num', ss + sn, String(ss + sn), [`Add the ${R} row: ${ss} + ${sn} = ${ss + sn}`]),
          P('c', `How many are "${R}" or "${Cc}" (or both)?`, 'num', ss + sn + ns, String(ss + sn + ns), [`Everything except the "neither" cell: ${T} − ${nn} = ${ss + sn + ns}`]),
          P('d', 'Find the probability that a person picked at random is neither.', 'num', nn / T, probShow(nn, T), [`Neither cell = ${nn}`, `P = ${fr(nn, T)}`]),
          P('e', 'Find the probability they are one or the other, but not both.', 'num', (sn + ns) / T, probShow(sn + ns, T), [`Exactly one = ${sn} + ${ns} = ${sn + ns}`, `P = ${fr(sn + ns, T)}`], 2),
          P('f', `Find P(not "${Cc}").`, 'num', (sn + nn) / T, probShow(sn + nn, T), [`Not-${Cc.toLowerCase()} column = ${sn} + ${nn} = ${sn + nn}`, `P = ${fr(sn + nn, T)}`]),
        ],
      };
    },
    function eightSided() {
      let r, w, b, y; do { r = ri(1, 4); w = ri(1, 4); b = ri(1, 3); y = 8 - r - w - b; } while (y < 1);
      return {
        level: 'S', tags: ['8.05'], stem: `An 8-sided die has ${r} red, ${w} white, ${b} blue and ${y} yellow face${y > 1 ? 's' : ''}. It is rolled once. Find, as a decimal, the probability that the face is:`,
        parts: [
          P('a', 'blue', 'num', b / 8, num(b / 8), [`${b}/8 = ${num(b / 8)}`]),
          P('b', 'yellow', 'num', y / 8, num(y / 8), [`${y}/8 = ${num(y / 8)}`]),
          P('c', 'not red', 'num', (8 - r) / 8, num((8 - r) / 8), [`Not red = 8 − ${r} = ${8 - r} faces`, `${8 - r}/8 = ${num((8 - r) / 8)}`]),
          P('d', 'white or yellow', 'num', (w + y) / 8, num((w + y) / 8), [`${w} + ${y} = ${w + y} faces (mutually exclusive, so add)`, `${w + y}/8 = ${num((w + y) / 8)}`]),
        ],
      };
    },
    function observedExpected() {
      const N = 3 * ri(15, 50), k = Math.round(N / 3) + ri(-8, 8);
      return {
        level: 'S', tags: ['8.06'], stem: `A die was rolled ${N} times and the numbers 1 or 6 came up ${k} times.`,
        parts: [
          P('a', 'What is the observed probability of rolling 1 or 6, as a percentage? (nearest whole number)', 'pct', k / N, pct(k / N, 0), [`Observed = ${k}/${N}`, `= ${num(k / N * 100, 2)}% ≈ ${pct(k / N, 0)}`], 1, { round: 0 }),
          P('b', 'What is the theoretical probability of rolling 1 or 6, as a percentage? (1 decimal place)', 'pct', 1 / 3, '33.3%', ['2 favourable outcomes out of 6', '2/6 = 1/3 ≈ 33.3%']),
          P('c', `Calculate the expected frequency of rolling 1 or 6 over ${N} rolls.`, 'num', N / 3, String(N / 3), ['Expected = probability × trials', `1/3 × ${N} = ${N / 3}`]),
          P('d', 'Why might the observed and expected results be different?', 'self', null, 'Rolling a die is random. With a limited number of trials, results vary by chance; more trials would usually bring the observed probability closer to 1/3.', [], 1),
        ],
      };
    },
    function tableData() {
      const set = pick([
        ['Emily recorded why students were late to school over one term.', ['Overslept', 'Missed the bus', 'Traffic', 'Appointment', 'Other']],
        ['A vet recorded why animals were brought in over a year.', ['Check-up', 'Injury', 'Vaccination', 'Illness', 'Other']],
      ]);
      const n = set[1].map(() => ri(4, 40)), T = n.reduce((a, b) => a + b, 0), M = pick([60, 80, 90, 120, 150, 200]);
      const exp = M * n[2] / T;
      return {
        level: 'C', tags: ['8.06'], stem: set[0], visual: { type: 'table', head: ['Reason', 'Count'], rows: [...set[1].map((s, i) => [s, n[i]]), ['Total', T]] },
        parts: [
          P('a', `Calculate the observed probability of "${set[1][0]}".`, 'num', n[0] / T, probShow(n[0], T), [`${n[0]}/${T}${fr(n[0], T) !== `${n[0]}/${T}` ? ' = ' + fr(n[0], T) : ''}`]),
          P('b', `As a percentage (nearest whole number), find the observed probability of "${set[1][1]}".`, 'pct', n[1] / T, pct(n[1] / T, 0), [`${n[1]}/${T} = ${num(n[1] / T * 100, 2)}% ≈ ${pct(n[1] / T, 0)}`], 1, { round: 0 }),
          P('c', `Next time there were ${M} records in total. How many would you expect to be "${set[1][2]}"? (nearest whole number)`, 'num', Math.round(exp), String(Math.round(exp)), [`Expected = ${n[2]}/${T} × ${M}`, `= ${num(exp, 2)} ≈ ${Math.round(exp)}`], 2, { round: 0 }),
        ],
      };
    },
    function diceGame() {
      const W = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
      let A, B; const fair = Math.random() < 0.25;
      if (fair) { A = [2, 7, 8]; B = [4, 5, 6]; } else { const s = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); A = s.slice(0, 2).sort((x, y) => x - y); B = s.slice(2, 4).sort((x, y) => x - y); }
      const C = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(x => !A.includes(x) && !B.includes(x));
      const w = (S) => S.reduce((t, x) => t + W[x], 0), pa = w(A), pb = w(B), pc = 36 - pa - pb;
      const names = shuffle(['Danielle', 'Vanessa', 'Karla', 'Omar', 'Jai', 'Mia']).slice(0, 3);
      const isFair = pa === pb && pb === pc;
      const opts = ['Yes, everyone has the same chance of winning', 'No, the chances of winning are different'];
      return {
        level: 'C', tags: ['8.05'], stem: `Three friends play a game with 2 dice. ${names[0]} wins if the sum is ${A.join(' or ').replace(/ or (\d+) or/, ', $1 or')}, ${names[1]} wins if the sum is ${B.join(' or ').replace(/ or (\d+) or/, ', $1 or')}. Any other total means ${names[2]} wins.`,
        visual: { type: 'diceGrid' },
        parts: [
          P('a', `Find P(${names[0]} wins).`, 'num', pa / 36, probShow(pa, 36), ['There are 6 × 6 = 36 equally likely outcomes', ...A.map(x => `Sum ${x}: ${W[x]} way${W[x] > 1 ? 's' : ''}`), `P = ${pa}/36 = ${fr(pa, 36)}`], 2),
          P('b', `Find P(${names[1]} wins).`, 'num', pb / 36, probShow(pb, 36), [...B.map(x => `Sum ${x}: ${W[x]} way${W[x] > 1 ? 's' : ''}`), `P = ${pb}/36 = ${fr(pb, 36)}`], 2),
          P('c', `Find P(${names[2]} wins).`, 'num', pc / 36, probShow(pc, 36), [`36 − ${pa} − ${pb} = ${pc} outcomes`, `P = ${fr(pc, 36)}`]),
          P('d', 'Is the game fair?', 'choice', isFair ? 0 : 1, opts[isFair ? 0 : 1], [isFair ? `All three have 12/36 = 1/3. Fair.` : `${pa}/36, ${pb}/36 and ${pc}/36 are not all equal, so it is not fair.`], 1, { choices: opts }),
        ],
      };
    },
    function committee() {
      const five = Math.random() < 0.5;
      const boys = shuffle(['Paul', 'Sumeet', 'Leo', 'Ari'])[0] && (five ? shuffle(['Paul', 'Sumeet', 'Leo']).slice(0, 3) : shuffle(['Paul', 'Sumeet', 'Leo']).slice(0, 2));
      const girls = shuffle(['Tash', 'Nadine', 'Zara']).slice(0, 2);
      const ppl = [...boys, ...girls], n = ppl.length, total = n * (n - 1) / 2, who = girls[0];
      const mixed = boys.length * girls.length;
      return {
        level: 'S', tags: ['8.05'], stem: `A committee of 2 people is chosen from ${boys.length} boys (${boys.join(', ')}) and 2 girls (${girls.join(' and ')}).`,
        parts: [
          P('a', 'How many different committees are possible?', 'num', total, String(total), ['List them systematically, pairing each person with everyone after them:', ...ppl.slice(0, -1).map((p, i) => ppl.slice(i + 1).map(q => `${p}–${q}`).join(', ')), `${total} committees`], 2),
          P('b', `If a committee is chosen at random, what is the probability it includes ${who}?`, 'num', (n - 1) / total, probShow(n - 1, total), [`${who} pairs with each of the other ${n - 1} people → ${n - 1} committees`, `P = ${n - 1}/${total} = ${fr(n - 1, total)}`]),
          P('c', 'What is the probability that both members are girls?', 'num', 1 / total, `1/${total}`, [`Only one committee: ${girls.join('–')}`, `P = 1/${total}`]),
          P('d', 'What is the probability it has one boy and one girl?', 'num', mixed / total, probShow(mixed, total), [`${boys.length} boys × 2 girls = ${mixed} committees`, `P = ${mixed}/${total} = ${fr(mixed, total)}`]),
        ],
      };
    },
  ];

  /* ================= CHAPTER 9 · EQUATIONS ================= */
  const eq = [
    function solveSet() {
      const x1 = ri(2, 12), a = ri(2, 9), b = ri(3, 20); const c1 = a * x1 - b;
      const x2 = ri(2, 10) * 1, d = ri(3, 9), e = ri(2, 15); const y2 = d * x2; const c2 = x2 + e;
      const t = ri(2, 9) * pick([1, -1]), k = ri(2, 7), m = pick([2, 3, 5]); const r = m * t; const c3 = (-k * r) / m;
      return {
        level: 'F', tags: ['9.01', '9.02'], stem: 'Solve each equation.',
        parts: [
          P('a', `${a}m − ${b} = ${c1}`, 'num', x1, `m = ${x1}`, [`Add ${b} to both sides: ${a}m = ${c1 + b}`, `Divide by ${a}: m = ${x1}`, `Check: ${a} × ${x1} − ${b} = ${c1} ✓`]),
          P('b', `d/${d} + ${e} = ${c2}`, 'num', y2, `d = ${y2}`, [`Subtract ${e}: d/${d} = ${x2}`, `Multiply by ${d}: d = ${y2}`]),
          P('c', `−${k}r/${m} = ${c3}`, 'num', r, `r = ${r}`, [`Multiply both sides by ${m}: −${k}r = ${c3 * m}`, `Divide by −${k}: r = ${r}`]),
        ],
      };
    },
    function quadMCQ() {
      const k = ri(2, 9), a = pick([2, 3, 4, 5]), c = a * k * k, b = ri(3, 30), k2 = ri(3, 12);
      const opts = shuffle([`x = −${k}`, `x = ${k}`, `x = ±${k}`, `x = ±${k * k}`]);
      return {
        level: 'F', tags: ['9.05'], stem: 'Simple quadratic equations.',
        parts: [
          P('a', `Solve ${a}x² = ${c}. Select the correct answer.`, 'choice', opts.indexOf(`x = ±${k}`), `x = ±${k}`, [`Divide by ${a}: x² = ${k * k}`, `Square root: x = ±${k}`, 'Two answers, because both positive and negative numbers square to a positive.'], 1, { choices: opts }),
          P('b', `Solve x² + ${b} = ${k2 * k2 + b}`, 'pm', k2, `x = ±${k2}`, [`Subtract ${b}: x² = ${k2 * k2}`, `x = ±√${k2 * k2} = ±${k2}`], 1, { hint: 'Give both answers, e.g. ±5 or 5, −5' }),
        ],
      };
    },
    function bricks() {
      let n, m, k, bv; do { n = ri(4, 9); m = ri(1, n - 2); bv = pick([0.5, 1, 1.5, 2, 2.5, 3, 4]); k = bv * (n - m); } while (!Number.isInteger(k) || k < 2);
      const opts = shuffle([`${n}b = ${m}b + ${k}`, `${n}b + ${m}b = ${k}`, `${n} + b = ${m} + ${k}`, `${n}b = ${m} + ${k}`]);
      return {
        level: 'S', tags: ['9.06'], stem: `${n} bricks have the same mass as ${m} brick${m > 1 ? 's' : ''} and ${k} kg. Let b = the mass of one brick (kg).`,
        parts: [
          P('a', 'Which equation describes this?', 'choice', opts.indexOf(`${n}b = ${m}b + ${k}`), `${n}b = ${m}b + ${k}`, [`${n} bricks = ${n}b; ${m} brick${m > 1 ? 's' : ''} and ${k} kg = ${m}b + ${k}`], 1, { choices: opts }),
          P('b', 'Solve it to find the mass of one brick (kg).', 'num', bv, `${num(bv)} kg`, [`Subtract ${m}b from both sides: ${n - m}b = ${k}`, `Divide by ${n - m}: b = ${num(bv)} kg`], 2),
        ],
      };
    },
    function triangleArea() {
      const h = ri(4, 20), b = ri(5, 24) + pick([0, 0.5]), A = b * h / 2, b2 = ri(3, 15), h2 = ri(3, 15);
      return {
        level: 'S', tags: ['9.07'], stem: 'The area of a triangle is given by the formula A = ½bh.',
        parts: [
          P('a', `Find A when b = ${b2} cm and h = ${h2} cm.`, 'num', b2 * h2 / 2, `${num(b2 * h2 / 2)} cm²`, [`A = ½ × ${b2} × ${h2}`, `= ${num(b2 * h2 / 2)} cm²`]),
          P('b', `Find h, the height of a triangle with area ${num(A)} cm² and base ${num(b)} cm.`, 'num', h, `${h} cm`, [`${num(A)} = ½ × ${num(b)} × h`, `${num(A)} = ${num(b / 2)}h`, `h = ${num(A)} ÷ ${num(b / 2)} = ${h} cm`], 2),
        ],
      };
    },
    function interest() {
      const P1 = ri(10, 80) * 100, r1 = pick([2, 2.5, 3, 3.5, 4, 4.5, 5]), n1 = ri(2, 6), I1 = P1 * r1 / 100 * n1;
      const P2 = ri(4, 60) * 100, r2 = pick([2, 2.5, 3, 3.5, 4, 5]), n2 = ri(2, 6), I2 = P2 * r2 / 100 * n2;
      return {
        level: 'S', tags: ['9.07'], stem: 'The simple interest formula is I = Prn, where P is the amount invested, r is the yearly rate as a decimal and n is the number of years.',
        parts: [
          P('a', `Find the interest earned on $${P1.toLocaleString('en-AU')} at ${r1}% p.a. for ${n1} years.`, 'num', I1, money(I1), [`r = ${r1}% = ${r1 / 100}`, `I = ${P1} × ${r1 / 100} × ${n1}`, `= ${money(I1)}`]),
          P('b', `How much was invested at ${r2}% p.a. for ${n2} years to earn ${money(I2)} in interest?`, 'num', P2, money(P2), [`${num(I2)} = P × ${r2 / 100} × ${n2}`, `${num(I2)} = ${num(r2 / 100 * n2, 4)}P`, `P = ${num(I2)} ÷ ${num(r2 / 100 * n2, 4)} = ${money(P2)}`], 2),
        ],
      };
    },
    function rectangle() {
      const w = ri(3, 15), k = ri(2, 9), Pm = 2 * (2 * w + k);
      const opts = shuffle([`2(w + w + ${k}) = ${Pm}`, `w + w + ${k} = ${Pm}`, `w(w + ${k}) = ${Pm}`, `2w + ${k} = ${Pm} × 2`]);
      return {
        level: 'S', tags: ['9.06'], stem: `A rectangle is ${k} cm longer than it is wide. Its perimeter is ${Pm} cm. Let the width be w cm.`,
        parts: [
          P('a', 'Which equation matches?', 'choice', opts.indexOf(`2(w + w + ${k}) = ${Pm}`), `2(w + w + ${k}) = ${Pm}`, [`Length = w + ${k}`, `Perimeter = 2 × (width + length)`], 1, { choices: opts }),
          P('b', 'Find the width.', 'num', w, `${w} cm`, [`2(2w + ${k}) = ${Pm}`, `2w + ${k} = ${Pm / 2}`, `2w = ${Pm / 2 - k}`, `w = ${w} cm`], 2),
          P('c', 'Find the area of the rectangle.', 'num', w * (w + k), `${w * (w + k)} cm²`, [`Length = ${w} + ${k} = ${w + k} cm`, `Area = ${w} × ${w + k} = ${w * (w + k)} cm²`]),
        ],
      };
    },
    function wordy() {
      if (Math.random() < 0.5) {
        const n = ri(5, 60), S = 3 * n + 3;
        const opts = shuffle([`n + (n + 1) + (n + 2) = ${S}`, `3n = ${S}`, `n + 1 + 2 = ${S}`, `n(n + 1)(n + 2) = ${S}`]);
        return {
          level: 'S', tags: ['9.06'], stem: `The sum of three consecutive whole numbers is ${S}. Let the smallest be n.`,
          parts: [
            P('a', 'Which equation matches?', 'choice', opts.indexOf(`n + (n + 1) + (n + 2) = ${S}`), `n + (n + 1) + (n + 2) = ${S}`, ['Consecutive numbers go up by 1: n, n + 1, n + 2'], 1, { choices: opts }),
            P('b', 'Find the smallest number.', 'num', n, String(n), [`3n + 3 = ${S}`, `3n = ${S - 3}`, `n = ${n}`, `Numbers: ${n}, ${n + 1}, ${n + 2}`], 2),
          ],
        };
      }
      const s = ri(3, 14), k = pick([2, 3, 4]), T = s + k * s + 4;
      return {
        level: 'S', tags: ['9.06'], stem: `Jai is ${k} times as old as his sister Ruby. Their mum is 4 years older than... no wait, keep it simple: Jai's age plus Ruby's age plus 4 equals ${T}.`.replace(/Their mum[^.]*\.\.\. no wait, keep it simple: /, ''),
        parts: [
          P('a', `Write an equation using r for Ruby's age. Which one is right?`, 'choice', 0, `r + ${k}r + 4 = ${T}`, [`Jai = ${k}r`], 1, { choices: [`r + ${k}r + 4 = ${T}`, `${k}r + 4 = ${T}`, `r + ${k} + 4 = ${T}`, `${k}(r + 4) = ${T}`] }),
          P('b', "How old is Ruby?", 'num', s, `${s}`, [`${k + 1}r + 4 = ${T}`, `${k + 1}r = ${T - 4}`, `r = ${s}`], 2),
          P('c', 'How old is Jai?', 'num', k * s, `${k * s}`, [`${k} × ${s} = ${k * s}`]),
        ],
      };
    },
    function bothSides() {
      const x = ri(-4, 10), a = ri(4, 9), c = ri(1, a - 2), b = ri(-10, 12), d = (a - c) * x + b;
      const g = ri(2, 10), dp = ri(1, 5), q = ri(2, 6), p = q + dp, A0 = ri(5, 20), B0 = A0 + g * dp;
      const planOpts = ['Plan A', 'Plan B'];
      return {
        level: 'C', ext: true, tags: ['9.03'], stem: 'Equations with variables on both sides.',
        parts: [
          P('a', `Solve ${a}x ${sgn(b)} = ${c === 1 ? '' : c}x ${sgn(d)}`, 'num', x, `x = ${x}`, [`Subtract ${c === 1 ? '' : c}x: ${a - c}x ${sgn(b)} = ${d}`, `${b >= 0 ? 'Subtract ' + b : 'Add ' + -b}: ${a - c}x = ${d - b}`, `x = ${x}`], 2),
          P('b', `Phone plan A costs $${A0} a month plus $${p} per GB. Plan B costs $${B0} a month plus $${q} per GB. For how many GB do they cost the same?`, 'num', g, `${g} GB`, [`${A0} + ${p}g = ${B0} + ${q}g`, `Subtract ${q}g: ${A0} + ${dp}g = ${B0}`, `${dp}g = ${B0 - A0}`, `g = ${g}`], 2),
          P('c', 'Which plan is cheaper for someone who uses only 1 GB?', 'choice', 0, 'Plan A', [`A: ${A0} + ${p} = $${A0 + p}`, `B: ${B0} + ${q} = $${B0 + q}`], 1, { choices: planOpts }),
        ],
      };
    },
    function brackets() {
      const x1 = ri(-3, 9), a1 = ri(2, 7), b1 = ri(1, 9) * pick([1, -1]), c1 = a1 * (x1 + b1);
      let a, c, b, d, x; do { x = ri(-3, 12); a = ri(3, 8); c = ri(2, a - 1); b = ri(1, 6); const t = a * (x - b); d = t / c - x; if (Number.isInteger(d) && d !== 0 && Math.abs(d) < 15) break; } while (true);
      return {
        level: 'C', ext: true, tags: ['9.04'], stem: 'Solve each equation.',
        parts: [
          P('a', `${a1}(x ${sgn(b1)}) = ${c1}`, 'num', x1, `x = ${x1}`, [`Divide both sides by ${a1}: x ${sgn(b1)} = ${x1 + b1}`, `x = ${x1}`]),
          P('b', `${a}(x − ${b}) = ${c}(x ${sgn(d)})`, 'num', x, `x = ${x}`, [`Expand: ${a}x − ${a * b} = ${c}x ${sgn(c * d)}`, `Subtract ${c}x: ${a - c}x − ${a * b} = ${c * d}`, `Add ${a * b}: ${a - c}x = ${c * d + a * b}`, `x = ${x}`], 3),
        ],
      };
    },
    function squareSide() {
      const s = ri(4, 15), k = ri(2, 10);
      const opts = ['A length can\'t be negative', 'Square roots are always positive', 'The equation only has one solution', 'Because the area is a whole number'];
      return {
        level: 'S', tags: ['9.05'], stem: `A square floor tile has an area of ${s * s} cm².`,
        parts: [
          P('a', 'Write and solve an equation to find its side length (cm).', 'num', s, `${s} cm`, [`s² = ${s * s}`, `s = √${s * s} = ${s} cm (ignore −${s})`]),
          P('b', `Solve 2x² = ${2 * k * k}`, 'pm', k, `x = ±${k}`, [`x² = ${k * k}`, `x = ±${k}`], 1, { hint: 'Give both answers, e.g. ±5' }),
          P('c', 'In part (a), x² has two square roots. Why do we only use one?', 'choice', 0, opts[0], ['A side length must be positive, so we reject the negative root.'], 1, { choices: opts }),
        ],
      };
    },
    function subject() {
      const u = ri(0, 20), a = ri(2, 6), t = ri(2, 10), v = u + a * t;
      const o1 = shuffle(['t = (v − u)/a', 't = v − u − a', 't = (v + u)/a', 't = a(v − u)']);
      const o2 = shuffle(['h = 2A/b', 'h = A/(2b)', 'h = 2b/A', 'h = A − 2b']);
      return {
        level: 'C', ext: true, tags: ['9.08'], stem: 'Changing the subject of a formula.',
        parts: [
          P('a', 'Make t the subject of v = u + at.', 'choice', o1.indexOf('t = (v − u)/a'), 't = (v − u)/a', ['Subtract u: v − u = at', 'Divide by a: t = (v − u)/a'], 1, { choices: o1 }),
          P('b', `Use your answer to find t when v = ${v}, u = ${u}, a = ${a}.`, 'num', t, `t = ${t}`, [`t = (${v} − ${u}) ÷ ${a} = ${t}`]),
          P('c', 'Make h the subject of A = ½bh.', 'choice', o2.indexOf('h = 2A/b'), 'h = 2A/b', ['Multiply by 2: 2A = bh', 'Divide by b: h = 2A/b'], 1, { choices: o2 }),
        ],
      };
    },
    function temperature() {
      const C1 = 5 * ri(-4, 9), C2 = 5 * ri(-6, 8), F2 = 1.8 * C2 + 32;
      return {
        level: 'S', tags: ['9.07'], stem: 'The formula F = 1.8C + 32 converts degrees Celsius (C) into degrees Fahrenheit (F).',
        parts: [
          P('a', `Find F when C = ${C1}.`, 'num', 1.8 * C1 + 32, `${num(1.8 * C1 + 32)} °F`, [`F = 1.8 × ${C1} + 32 = ${num(1.8 * C1)} + 32 = ${num(1.8 * C1 + 32)}`]),
          P('b', `Find C when F = ${num(F2)}.`, 'num', C2, `${C2} °C`, [`${num(F2)} = 1.8C + 32`, `Subtract 32: ${num(F2 - 32)} = 1.8C`, `C = ${num(F2 - 32)} ÷ 1.8 = ${C2}`], 2),
        ],
      };
    },
  ];

  /* ================= CHAPTER 10 · RATIOS & RATES ================= */
  const ratio = [
    function simplify() {
      const [p, q] = coprime(), k = ri(2, 9);
      const kg = ri(2, 24), gr = pick([200, 250, 400, 500, 800]); const g1 = gcd(kg * 1000, gr);
      const mm = pick([5, 10, 20, 25, 50]), m = ri(1, 4); const g2 = gcd(mm, m * 1000);
      return {
        level: 'F', tags: ['10.01'], stem: 'Simplify each ratio.',
        parts: [
          P('a', `${p * k} : ${q * k}`, 'ratio', [p, q], `${p}:${q}`, [`HCF of ${p * k} and ${q * k} is ${k}`, `${p}:${q}`]),
          P('b', `${kg} kg : ${gr} g`, 'ratio', [kg * 1000 / g1, gr / g1], `${kg * 1000 / g1}:${gr / g1}`, [`Same units first: ${kg} kg = ${(kg * 1000).toLocaleString('en-AU')} g`, `${kg * 1000} : ${gr}`, `Divide by ${g1}: ${kg * 1000 / g1}:${gr / g1}`]),
          P('c', `${mm} mm : ${m} m`, 'ratio', [mm / g2, m * 1000 / g2], `${mm / g2}:${m * 1000 / g2}`, [`${m} m = ${m * 1000} mm`, `${mm} : ${m * 1000}`, `Divide by ${g2}: ${mm / g2}:${m * 1000 / g2}`]),
        ],
      };
    },
    function orchard() {
      const [p, q] = coprime(2, 9), k = ri(2, 9) * 100;
      return {
        level: 'S', tags: ['10.02'], stem: `In an orchard, the ratio of orange trees to lemon trees is ${p}:${q}. There are ${(q * k).toLocaleString('en-AU')} lemon trees.`,
        parts: [
          P('a', 'How many orange trees are there?', 'num', p * k, (p * k).toLocaleString('en-AU'), [`${q} parts = ${q * k}, so 1 part = ${q * k} ÷ ${q} = ${k}`, `Orange = ${p} × ${k} = ${(p * k).toLocaleString('en-AU')}`], 2),
          P('b', 'How many trees are there altogether?', 'num', (p + q) * k, ((p + q) * k).toLocaleString('en-AU'), [`${p + q} parts × ${k} = ${((p + q) * k).toLocaleString('en-AU')}`]),
          P('c', 'What fraction of the trees are lemon trees?', 'num', q / (p + q), `${fr(q, p + q)}`, [`${q} parts out of ${p + q}`, `= ${fr(q, p + q)}`]),
        ],
      };
    },
    function faulty() {
      let f, n, F; do { f = ri(1, 5); n = pick([20, 25, 30, 35, 40, 50, 60]); F = f * ri(3, 12); } while (gcd(f, n) !== 1 && Math.random() < .5);
      const total = F * n / f; if (!Number.isInteger(total)) return faulty();
      return {
        level: 'S', tags: ['10.02', '10.07'], stem: `A machine makes phone chargers. On average ${f} in every ${n} are faulty.`,
        parts: [
          P('a', `If the machine has made ${F} faulty chargers, how many chargers has it made in total?`, 'num', total, String(total), [`${f} faulty per ${n} made`, `${F} ÷ ${f} = ${F / f} groups of ${n}`, `${F / f} × ${n} = ${total}`], 2),
          P('b', 'How many good chargers would you expect?', 'num', total - F, String(total - F), [`${total} − ${F} = ${total - F}`]),
        ],
      };
    },
    function share() {
      const r = [ri(1, 5), ri(1, 6), ri(2, 7)], k = ri(2, 15) * 5, T = k * (r[0] + r[1] + r[2]);
      const nm = shuffle(['Ava', 'Ben', 'Chloe', 'Dev', 'Eli']).slice(0, 3);
      const [p, q] = coprime(1, 7); const lo = Math.min(p, q), hi = Math.max(p, q), diff = (hi - lo) * ri(2, 12) * 5, part = diff / (hi - lo);
      const mx = Math.max(...r), mn = Math.min(...r);
      return {
        level: 'S', tags: ['10.04'], stem: 'Dividing quantities in a ratio.',
        parts: [
          P('a', `${nm[0]}, ${nm[1]} and ${nm[2]} share $${T} in the ratio ${r.join(':')}. How much does ${nm[2]} get?`, 'num', r[2] * k, '$' + r[2] * k, [`Total parts = ${r.join(' + ')} = ${r[0] + r[1] + r[2]}`, `1 part = $${T} ÷ ${r[0] + r[1] + r[2]} = $${k}`, `${nm[2]} = ${r[2]} × $${k} = $${r[2] * k}`], 2),
          P('b', 'What is the difference between the largest and smallest shares?', 'num', (mx - mn) * k, '$' + (mx - mn) * k, [`(${mx} − ${mn}) parts × $${k} = $${(mx - mn) * k}`]),
          P('c', `Tom and Sam share some money in the ratio ${lo}:${hi}. Sam gets $${diff} more than Tom. How much money was there altogether?`, 'num', part * (lo + hi), '$' + part * (lo + hi), [`Difference = ${hi} − ${lo} = ${hi - lo} part${hi - lo > 1 ? 's' : ''} = $${diff}`, `1 part = $${part}`, `Total = ${lo + hi} parts = $${part * (lo + hi)}`], 2),
        ],
      };
    },
    function scalePlan() {
      const n = pick([500, 1000, 2000, 2500, 5000, 10000, 25000, 50000]), cm = ri(2, 15) + pick([0, 0.5]);
      const realM = cm * n / 100, real2 = pick([20, 40, 50, 75, 100, 150, 250, 500, 1000]), map2 = real2 * 100 / n;
      return {
        level: 'S', tags: ['10.03'], stem: `The scale of a plan is 1 : ${n.toLocaleString('en-AU')}.`,
        parts: [
          P('a', `Two points are ${num(cm)} cm apart on the plan. What is the real distance in metres?`, 'num', realM, `${num(realM)} m`, [`Real = ${num(cm)} × ${n.toLocaleString('en-AU')} = ${num(cm * n)} cm`, `÷ 100 = ${num(realM)} m`]),
          P('b', `What length on the plan (in cm) would represent a real distance of ${real2} m?`, 'num', map2, `${num(map2)} cm`, [`${real2} m = ${(real2 * 100).toLocaleString('en-AU')} cm`, `÷ ${n.toLocaleString('en-AU')} = ${num(map2)} cm`], 2),
        ],
      };
    },
    function paint() {
      const rate = pick([3, 4, 5, 6, 8, 10, 12]), L1 = ri(2, 9), L2 = ri(10, 30), A3 = rate * ri(5, 40);
      return {
        level: 'S', tags: ['10.05', '10.07'], stem: `Luis uses ${L1} litres of paint to cover ${rate * L1} m² of wall.`,
        parts: [
          P('a', 'What area does 1 litre cover (m² per litre)?', 'num', rate, `${rate} m²/L`, [`${rate * L1} ÷ ${L1} = ${rate} m² per litre`]),
          P('b', `What area can he cover with ${L2} litres?`, 'num', rate * L2, `${rate * L2} m²`, [`${L2} × ${rate} = ${rate * L2} m²`]),
          P('c', `How many litres does he need for ${A3} m²?`, 'num', A3 / rate, `${num(A3 / rate)} L`, [`${A3} ÷ ${rate} = ${num(A3 / rate)} L`]),
        ],
      };
    },
    function bestBuy() {
      const item = pick(['strawberries', 'muesli', 'rice', 'coffee beans']);
      let opts; do {
        opts = shuffle([250, 400, 500, 600, 750, 1000]).slice(0, 3).map(g => { const per100 = ri(90, 260) / 100; return { g, price: rnd(per100 * g / 100, 2) }; });
        opts.forEach(o => o.u = o.price / o.g * 100);
      } while (new Set(opts.map(o => o.u.toFixed(2))).size < 3);
      const best = opts.reduce((b, o, i) => (o.u < opts[b].u ? i : b), 0);
      const lab = (o) => `${o.g >= 1000 ? o.g / 1000 + ' kg' : o.g + ' g'} for ${money(o.price)}`;
      return {
        level: 'S', tags: ['10.06'], stem: `Which is the best buy for ${item}?`,
        parts: [
          P('a', 'Select A, B or C.', 'choice', best, `${'ABC'[best]}: ${lab(opts[best])}`, ['Compare the price per 100 g:', ...opts.map((o, i) => `${'ABC'[i]}: ${money(o.price)} ÷ ${o.g / 100} = ${money(o.u)} per 100 g`), `Lowest unit price = best buy: ${'ABC'[best]}`], 2, { choices: opts.map((o, i) => `${'ABC'[i]}: ${lab(o)}`) }),
          P('b', 'What is the price per 100 g of the best buy? (nearest cent)', 'num', rnd(opts[best].u, 2), money(opts[best].u), [`${money(opts[best].price)} ÷ ${opts[best].g / 100} = ${money(opts[best].u)}`], 1, { round: 2 }),
        ],
      };
    },
    function speedTime() {
      let s, T, label, d; do {
        const t = pick([[1, 30], [2, 15], [1, 20], [2, 40], [0, 45], [3, 30], [1, 45]]); T = t[0] + t[1] / 60; s = 5 * ri(8, 22); d = s * T; label = `${t[0] ? t[0] + ' h ' : ''}${t[1]} min`;
      } while (!Number.isInteger(d));
      const d2 = s * pick([0.5, 1.5, 2, 2.5]); const mins = d2 / s * 60;
      return {
        level: 'S', tags: ['10.08'], stem: `A car travels ${d} km in ${label}.`,
        parts: [
          P('a', 'Write the time in hours as a decimal or fraction.', 'num', T, Number.isInteger(T * 4) ? num(T) + ' h' : `${fr(Math.round(T * 3), 3)} h (≈ ${num(T, 2)})`, [`${label.split(' ').slice(-2).join(' ')} = ${label.match(/(\d+) min/)[1]}/60 h = ${fr(+label.match(/(\d+) min/)[1], 60)} h`, `Total = ${Number.isInteger(T * 4) ? num(T) : fr(Math.round(T * 3), 3)} h`]),
          P('b', 'Find its average speed in km/h.', 'num', s, `${s} km/h`, [`Speed = distance ÷ time`, `${d} ÷ ${Number.isInteger(T * 4) ? num(T) : fr(Math.round(T * 3), 3)} = ${s} km/h`], 2),
          P('c', `At the same speed, how many minutes would it take to travel ${num(d2)} km?`, 'num', mins, `${num(mins)} min`, [`Time = ${num(d2)} ÷ ${s} = ${num(d2 / s)} h`, `× 60 = ${num(mins)} minutes`]),
        ],
      };
    },
    function convert() {
      const ml = pick([15, 25, 35, 45, 50, 75]), ms = pick([12, 15, 23, 27, 31]), kmh = 18 * ri(2, 6);
      return {
        level: 'C', tags: ['10.09'], stem: 'Converting rates.',
        parts: [
          P('a', `A vat is filled at ${ml} mL/min. Convert this rate to L/day.`, 'num', ml * 1440 / 1000, `${num(ml * 1440 / 1000)} L/day`, [`Per day: ${ml} × 60 × 24 = ${(ml * 1440).toLocaleString('en-AU')} mL`, `÷ 1000 = ${num(ml * 1440 / 1000)} L/day`], 2),
          P('b', `A cheetah runs at ${ms} m/s. Convert to km/h.`, 'num', ms * 3.6, `${num(ms * 3.6)} km/h`, [`${ms} × 3600 = ${(ms * 3600).toLocaleString('en-AU')} m per hour`, `÷ 1000 = ${num(ms * 3.6)} km/h  (shortcut: × 3.6)`]),
          P('c', `Convert ${kmh} km/h to m/s.`, 'num', kmh / 3.6, `${num(kmh / 3.6)} m/s`, [`${kmh} × 1000 ÷ 3600`, `= ${num(kmh / 3.6)} m/s  (shortcut: ÷ 3.6)`]),
        ],
      };
    },
    function wages() {
      const r = pick([18.4, 21.5, 22.4, 24.75, 26.8, 31.2]), h = ri(20, 42), h2 = ri(8, 30);
      return {
        level: 'F', tags: ['10.05', '10.07'], stem: `Gaurish earns ${money(r)} per hour.`,
        parts: [
          P('a', `How much does he earn for ${h} hours?`, 'num', r * h, money(r * h), [`${money(r)} × ${h} = ${money(r * h)}`]),
          P('b', `How many hours must he work to earn ${money(r * h2)}?`, 'num', h2, `${h2} h`, [`${money(r * h2)} ÷ ${money(r)} = ${h2} hours`]),
        ],
      };
    },
    function travelGraph() {
      let s1, t1, d1, t2, s3, t3, d2, t4, s4;
      do { s1 = pick([40, 60, 80]); t1 = pick([1, 1.5, 2]); d1 = s1 * t1; t2 = pick([0.5, 1]); s3 = pick([20, 40]); t3 = pick([0.5, 1]); d2 = d1 + s3 * t3; t4 = pick([1, 1.5, 2]); s4 = d2 / t4; } while (!Number.isInteger(s4) || d2 > 200);
      const pts = [[0, 0], [t1, d1], [t1 + t2, d1], [t1 + t2 + t3, d2], [t1 + t2 + t3 + t4, 0]];
      const speeds = [s1, s3, s4]; const fastest = speeds.indexOf(Math.max(...speeds));
      const secs = ['A (first leg)', 'C (after the stop)', 'D (trip home)'];
      return {
        level: 'C', tags: ['10.10'], stem: 'The travel graph shows a family\'s day trip, leaving home at 8 am.', visual: { type: 'travel', pts, labels: ['A', 'B', 'C', 'D'] },
        parts: [
          P('a', 'How far from home were they at the end of section A (km)?', 'num', d1, `${d1} km`, [`Read the graph at the end of A: ${d1} km`]),
          P('b', 'How long did they stop for (hours)?', 'num', t2, `${num(t2)} h`, ['Section B is flat (distance not changing)', `${num(t1)} h to ${num(t1 + t2)} h → ${num(t2)} h`]),
          P('c', 'What was their speed in section A (km/h)?', 'num', s1, `${s1} km/h`, [`${d1} km ÷ ${num(t1)} h = ${s1} km/h`]),
          P('d', 'What was their average speed on the trip home (km/h)?', 'num', s4, `${s4} km/h`, [`They travel ${d2} km back in ${num(t4)} h`, `${d2} ÷ ${num(t4)} = ${s4} km/h`], 2),
          P('e', 'Which moving section was the fastest?', 'choice', fastest, secs[fastest], ['Steepest line = fastest', `Speeds: A ${s1}, C ${s3}, D ${s4} km/h`], 1, { choices: secs }),
        ],
      };
    },
    function population() {
      const b = pick([9.8, 11.2, 12.1, 13.5]), pop = ri(20, 95) * 1000, N = ri(2, 9) * 100000 + ri(0, 9) * 10000, A = ri(20, 400);
      return {
        level: 'C', tags: ['10.05', '10.07'], stem: 'Population rates.',
        parts: [
          P('a', `A town's birth rate is ${b} per 1000 people. Its population is ${pop.toLocaleString('en-AU')}. About how many babies are born there a year? (nearest whole number)`, 'num', Math.round(b * pop / 1000), String(Math.round(b * pop / 1000)), [`${pop.toLocaleString('en-AU')} ÷ 1000 = ${pop / 1000} thousands`, `${pop / 1000} × ${b} = ${num(b * pop / 1000, 1)} ≈ ${Math.round(b * pop / 1000)}`], 2, { round: 0 }),
          P('b', `A city of ${N.toLocaleString('en-AU')} people covers ${A} km². Find its population density (people/km², nearest whole number).`, 'num', Math.round(N / A), `${Math.round(N / A).toLocaleString('en-AU')} people/km²`, [`${N.toLocaleString('en-AU')} ÷ ${A} = ${num(N / A, 1)}`, `≈ ${Math.round(N / A).toLocaleString('en-AU')}`], 1, { round: 0 }),
        ],
      };
    },
  ];

  /* ================= CHAPTER 12 · SIMILAR FIGURES & SURFACE AREA ================= */
  const sim = [
    function rectanglesSimilar() {
      const w = ri(2, 8), l = w + ri(1, 6), k = pick([1.5, 2, 2.5, 3]), similar = Math.random() < 0.55;
      const W2 = w * k, L2 = similar ? l * k : l * k + pick([1, 2, -1]);
      const opts = ['Yes, matching sides are in the same ratio', 'No, matching sides are not in the same ratio'];
      return {
        level: 'S', ext: true, tags: ['12.01', '12.02'], stem: `Rectangle P is ${w} cm by ${l} cm. Rectangle Q is ${num(W2)} cm by ${num(L2)} cm.`, visual: { type: 'rects', a: [l, w], b: [L2, W2] },
        parts: [
          P('a', 'Scale factor for the short sides (Q ÷ P)?', 'num', W2 / w, num(W2 / w), [`${num(W2)} ÷ ${w} = ${num(W2 / w)}`]),
          P('b', 'Scale factor for the long sides (Q ÷ P)?', 'num', L2 / l, num(L2 / l, 3), [`${num(L2)} ÷ ${l} = ${num(L2 / l, 3)}`]),
          P('c', 'Are the rectangles similar?', 'choice', similar ? 0 : 1, opts[similar ? 0 : 1], [similar ? 'Both scale factors are equal, so they are similar.' : 'The scale factors are different, so they are not similar.'], 1, { choices: opts }),
        ],
      };
    },
    function similarTriangles() {
      const m = pick([1, 2, 3]), [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [4, 6, 7], [5, 7, 9]]).map(x => x * m), k = pick([1.5, 2, 2.5, 3, 0.5]), ang = ri(28, 70);
      return {
        level: 'S', ext: true, tags: ['12.02', '12.03'], stem: `Triangle DEF is similar to triangle ABC. AB = ${a} cm, BC = ${b} cm, CA = ${c} cm, and DE = ${num(a * k)} cm (DE matches AB). Angle A = ${ang}°.`, visual: { type: 'sim', s: [a, b, c], k },
        parts: [
          P('a', 'Find the scale factor (DEF from ABC).', 'num', k, num(k), ['Scale factor = image length ÷ original length', `${num(a * k)} ÷ ${a} = ${num(k)}`]),
          P('b', 'Find EF, the side matching BC (cm).', 'num', b * k, `${num(b * k)} cm`, [`${b} × ${num(k)} = ${num(b * k)} cm`]),
          P('c', 'Find FD, the side matching CA (cm).', 'num', c * k, `${num(c * k)} cm`, [`${c} × ${num(k)} = ${num(c * k)} cm`]),
          P('d', 'What is the size of angle D (degrees)?', 'num', ang, `${ang}°`, ['Matching angles in similar figures are equal', `D matches A, so D = ${ang}°`]),
          P('e', 'Is DEF an enlargement or a reduction of ABC?', 'choice', k > 1 ? 0 : 1, k > 1 ? 'Enlargement' : 'Reduction', [k > 1 ? 'Scale factor > 1 → enlargement' : 'Scale factor < 1 → reduction'], 1, { choices: ['Enlargement', 'Reduction'] }),
        ],
      };
    },
    function shadows() {
      const h = pick([1.5, 1.6, 1.8]), s1 = pick([1.2, 2, 2.4, 3]), k = pick([4, 5, 6, 7.5, 8, 10]), s2 = s1 * k, H = h * k;
      return {
        level: 'C', ext: true, tags: ['12.03'], stem: `At the same time of day, a ${h} m tall student casts a ${s1} m shadow and a tree casts a ${num(s2)} m shadow. The triangles formed are similar.`,
        parts: [
          P('a', 'Find the scale factor from the student\'s triangle to the tree\'s triangle.', 'num', k, num(k), [`${num(s2)} ÷ ${s1} = ${num(k)}`]),
          P('b', 'How tall is the tree (m)?', 'num', H, `${num(H)} m`, [`${h} × ${num(k)} = ${num(H)} m`], 2),
        ],
      };
    },
    function rectPrism() {
      const l = ri(3, 15), w = ri(2, 10), h = ri(2, 12), SA = 2 * (l * w + l * h + w * h);
      return {
        level: 'S', ext: true, tags: ['12.04'], stem: `A rectangular prism measures ${l} cm × ${w} cm × ${h} cm.`, visual: { type: 'box', l, w, h },
        parts: [
          P('a', 'Find the area of the base (cm²).', 'num', l * w, `${l * w} cm²`, [`${l} × ${w} = ${l * w} cm²`]),
          P('b', 'Find the total surface area (cm²).', 'num', SA, `${SA} cm²`, ['SA = 2(lw + lh + wh)', `= 2(${l * w} + ${l * h} + ${w * h})`, `= ${SA} cm²`], 2),
          P('c', 'If the box has no lid, what is its surface area (cm²)?', 'num', SA - l * w, `${SA - l * w} cm²`, [`Remove one ${l} × ${w} face: ${SA} − ${l * w} = ${SA - l * w} cm²`]),
        ],
      };
    },
    function triPrism() {
      const m = pick([1, 2, 3]), [a, b, c] = [3 * m, 4 * m, 5 * m], L = ri(5, 20), tri = a * b / 2, rects = (a + b + c) * L;
      return {
        level: 'S', ext: true, tags: ['12.04'], stem: `A triangular prism has a right-angled triangle face with sides ${a} cm, ${b} cm and ${c} cm, and a length of ${L} cm.`, visual: { type: 'tri', a, b, c, L },
        parts: [
          P('a', 'Find the area of one triangular face (cm²).', 'num', tri, `${tri} cm²`, [`½ × ${a} × ${b} = ${tri} cm²`]),
          P('b', 'Find the total area of the three rectangular faces (cm²).', 'num', rects, `${rects} cm²`, [`(${a} + ${b} + ${c}) × ${L} = ${a + b + c} × ${L} = ${rects} cm²`]),
          P('c', 'Find the total surface area (cm²).', 'num', 2 * tri + rects, `${2 * tri + rects} cm²`, [`2 × ${tri} + ${rects} = ${2 * tri + rects} cm²`], 2),
        ],
      };
    },
    function cylinder() {
      const r = ri(2, 10), h = ri(3, 20), top = PI * r * r, curved = 2 * PI * r * h;
      return {
        level: 'C', ext: true, tags: ['12.05'], stem: `A closed cylinder has radius ${r} cm and height ${h} cm. Give answers correct to 1 decimal place.`, visual: { type: 'cyl', r, h },
        parts: [
          P('a', 'Area of one circular end (cm²).', 'num', top, `${num(top, 1)} cm²`, [`πr² = π × ${r}²`, `= ${num(top, 1)} cm²`], 1, { tol: 0.006 }),
          P('b', 'Curved surface area (cm²).', 'num', curved, `${num(curved, 1)} cm²`, [`2πrh = 2 × π × ${r} × ${h}`, `= ${num(curved, 1)} cm²`], 1, { tol: 0.006 }),
          P('c', 'Total surface area (cm²).', 'num', 2 * top + curved, `${num(2 * top + curved, 1)} cm²`, [`2πr² + 2πrh`, `= ${num(2 * top, 1)} + ${num(curved, 1)} = ${num(2 * top + curved, 1)} cm²`], 2, { tol: 0.006 }),
          P('d', 'If it were an open can (no lid), what would its surface area be (cm²)?', 'num', top + curved, `${num(top + curved, 1)} cm²`, [`πr² + 2πrh = ${num(top + curved, 1)} cm²`], 1, { tol: 0.006 }),
        ],
      };
    },
    function cube() {
      const s = ri(2, 12);
      return {
        level: 'S', ext: true, tags: ['12.04'], stem: `A cube has a total surface area of ${6 * s * s} cm².`,
        parts: [
          P('a', 'What is the area of one face (cm²)?', 'num', s * s, `${s * s} cm²`, ['A cube has 6 identical square faces', `${6 * s * s} ÷ 6 = ${s * s} cm²`]),
          P('b', 'What is the side length (cm)?', 'num', s, `${s} cm`, [`√${s * s} = ${s} cm`]),
        ],
      };
    },
  ];

  /* ================= concept MCQs for Ch 12 (others live in content.js) ================= */
  const ch12 = {
    id: 'sim', title: 'Similar Figures & Surface Area', chapter: 'Ch 12', hue: 'pink', gen: null,
    blurb: 'Similar figures, scale factors, surface area of prisms and cylinders.',
    sections: [
      { code: '12.01', name: 'Similar figures', ext: true, notes: ['Similar figures have the same shape but can be different sizes: one is an enlargement or reduction of the other.', 'The symbol for "is similar to" is ~, e.g. △ABC ~ △DEF.', 'Congruent figures are a special case: same shape AND same size (scale factor 1).'], ex: ['Are a 2 × 3 and a 6 × 9 rectangle similar?', '6 ÷ 2 = 3 and 9 ÷ 3 = 3', 'Same scale factor → similar'] },
      { code: '12.02', name: 'Properties of similar figures', ext: true, notes: ['Matching (corresponding) angles are equal.', 'Matching sides are in the same ratio, so every pair gives the same scale factor.', 'Scale factor = image length ÷ original length. More than 1 = enlargement, less than 1 = reduction.'], ex: ['Original side 4 cm, image side 10 cm', 'Scale factor = 10 ÷ 4', '= 2.5 (enlargement)'] },
      { code: '12.03', name: 'Finding sides in similar figures', ext: true, notes: ['Find the scale factor from a pair of matching sides you know.', 'Image side = original side × scale factor. Original side = image side ÷ scale factor.', 'Shadow problems: a person and a tree at the same time of day make similar triangles.'], ex: ['1.8 m person, 2.4 m shadow; tree shadow 12 m', 'Scale factor = 12 ÷ 2.4 = 5', 'Tree = 1.8 × 5 = 9 m'] },
      { code: '12.04', name: 'Surface area of a prism', ext: true, notes: ['Surface area (SA) = the total area of every face. Drawing the net helps you not miss any.', 'Rectangular prism: SA = 2(lw + lh + wh).', 'Triangular prism: 2 triangles + 3 rectangles. The rectangles together = perimeter of the triangle × length.', 'Read the question: an open box (no lid) has one fewer face.'], ex: ['Box 5 × 4 × 3 cm', '2(20 + 15 + 12) = 2 × 47', 'SA = 94 cm²'] },
      { code: '12.05', name: 'Surface area of a cylinder', ext: true, notes: ['A cylinder\'s net is two circles plus a rectangle that wraps around.', 'The rectangle is the circumference (2πr) long and h high, so the curved surface = 2πrh.', 'Closed cylinder: SA = 2πr² + 2πrh. Open at one end: πr² + 2πrh. Round at the END only.'], ex: ['r = 3 cm, h = 10 cm, closed', '2π(3²) + 2π(3)(10) = 18π + 60π', '= 78π ≈ 245.0 cm²'] },
    ],
    cards: [
      ['Similar figures', 'Same shape, not necessarily the same size: an enlargement or reduction. Symbol ~'],
      ['Enlargement', 'An increase in the size of a shape (scale factor bigger than 1).'],
      ['Reduction', 'A decrease in size (scale factor between 0 and 1).'],
      ['Image', 'The shape you get after it has been enlarged or reduced.'],
      ['Matching angles', 'Corresponding angles of similar figures, in the same position. They are equal.'],
      ['Matching sides', 'Corresponding sides of similar figures. They are all in the same ratio.'],
      ['Scale factor', 'Image length ÷ original length.'],
      ['Surface area', 'The total area of all the faces of a solid.'],
      ['SA of a rectangular prism', '2(lw + lh + wh)'],
      ['SA of a closed cylinder', '2πr² + 2πrh'],
      ['Curved surface of a cylinder', '2πrh (the rectangle in the net is 2πr long and h high).'],
      ['Congruent vs similar', 'Congruent = same shape AND size. Similar = same shape, size can differ.'],
    ].map(([q, a]) => ({ q, a })),
    concepts: [
      ['In similar figures, matching angles are…', ['Equal', 'In the ratio of the scale factor', 'Always 90°', 'Supplementary'], 0, 'Similar figures have exactly the same angles.'],
      ['A scale factor of 0.5 means the image is…', ['An enlargement', 'A reduction', 'Congruent', 'Twice as big'], 1, 'Less than 1 makes it smaller.'],
      ['Which pair of rectangles is similar?', ['2 × 5 and 4 × 10', '2 × 5 and 4 × 7', '3 × 4 and 4 × 5', '1 × 2 and 2 × 3'], 0, 'Both sides double: ×2 and ×2.'],
      ['How many faces does a triangular prism have?', ['3', '4', '5', '6'], 2, '2 triangles + 3 rectangles = 5.'],
      ['The curved surface of a cylinder unrolls into a…', ['Circle', 'Rectangle', 'Triangle', 'Square always'], 1, 'Its length is the circumference, 2πr.'],
      ['A cube has side 4 cm. Its surface area is…', ['16 cm²', '64 cm²', '96 cm²', '24 cm²'], 2, '6 faces × 16 cm² = 96 cm².'],
    ].map(([q, options, answer, why]) => ({ q, options, answer, why })),
  };

  const BANK = { prob, eq, ratio, sim };

  /* ---------- answer checking (shared) ---------- */
  function parseAns(raw) {
    let s = String(raw ?? '').trim().toLowerCase().replace(/−|–/g, '-').replace(/,(?=\d{3}\b)/g, '').replace(/\s+/g, ' ');
    s = s.replace(/^[a-z]\s*=\s*/, '').replace(/\$/g, '');
    s = s.replace(/\s*(people\/km²|km\/h|m\/s|l\/day|m²\/l|m2\/l|km²|cm²|m²|mm²|cm2|m2|km|cm|mm|ml|kg|min(ute)?s?|hours?|hrs?|h|m|g|l|s|°c|°f|°|degrees|gb)(?![a-z0-9])\.?$/, '').trim();
    s = s.replace(/\s*(km\/h|m\/s|cm²|m²|°)$/, '').trim();
    let percent = false; if (s.endsWith('%')) { percent = true; s = s.slice(0, -1).trim(); }
    let v = NaN, dec = 0, sig = 99, exact = false;
    const mixed = s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/), f = s.match(/^(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)$/);
    if (mixed) { const w = +mixed[1]; v = (w < 0 ? -1 : 1) * (Math.abs(w) + +mixed[2] / +mixed[3]); exact = true; }
    else if (f) { v = +f[1] / +f[2]; exact = true; }
    else if (/^-?\d*\.?\d+$/.test(s)) { v = +s; const m = s.match(/\.(\d+)$/); dec = m ? m[1].length : 0; const digits = s.replace(/^-?0*\.?0*/, '').replace('.', ''); sig = digits.length; }
    if (percent) { v /= 100; dec += 2; }
    return { v, dec, sig, exact, percent };
  }
  function near(a, target, p, part) {
    if (!isFinite(a)) return false;
    const T = Math.abs(target) || 1;
    if (Math.abs(a - target) <= 1e-9 * T) return true;
    if (part.tol && Math.abs(a - target) <= part.tol * T) return true;
    if (p.exact) return false;
    if (part.round != null) { const step = 0.5 * 10 ** -(part.round + (part.type === 'pct' ? 2 : 0)); return Math.abs(a - target) <= step + 1e-9; }
    const step = 0.5 * 10 ** -p.dec; // accept answers rounded to the precision typed, if precise enough
    return Math.abs(a - target) <= step + 1e-9 && p.sig >= 2 && (Math.abs(target) >= 1 ? p.dec >= 1 || Number.isInteger(target) : true);
  }
  function check(part, input) {
    if (part.type === 'choice') return Number(input) === part.value;
    if (part.type === 'self') return !!input;
    const raw = String(input ?? '');
    if (part.type === 'ratio') {
      const m = raw.replace(/\s/g, '').split(':'); if (m.length !== part.value.length) return false;
      return m.every((x, i) => /^\d+(\.\d+)?$/.test(x) && +x === part.value[i]);
    }
    if (part.type === 'pm') {
      const s = raw.replace(/−/g, '-'); const nums = (s.match(/-?\d+(\.\d+)?/g) || []).map(Number);
      if (!nums.length || !nums.every(n => Math.abs(Math.abs(n) - part.value) < 1e-9)) return false;
      return /±|\+-|\+\/-|-\+/.test(s) || (nums.includes(part.value) && nums.includes(-part.value));
    }
    const p = parseAns(raw);
    if (!isFinite(p.v)) { // typed as an expression, e.g. 3π/4, 2√3, 2^5: compare its value exactly (or to the rounding asked for)
      const MI = typeof MathIn !== 'undefined' ? MathIn : typeof require !== 'undefined' ? require('./mathin.js') : null;
      const v = MI ? MI.evaluate(raw.replace(/^\s*[a-z]\s*=\s*/i, '')) : NaN;
      if (!isFinite(v)) return false;
      const T = Math.abs(part.value) || 1, tol = Math.max(1e-6 * T, part.round != null ? 0.5 * 10 ** -(part.round + (part.type === 'pct' ? 2 : 0)) : 0, part.tol ? part.tol * T : 0);
      return Math.abs(v - part.value) <= tol * (1 + 1e-9) || (part.type === 'pct' && Math.abs(v / 100 - part.value) <= tol * (1 + 1e-9));
    }
    if (part.type === 'pct') {
      const cands = p.percent ? [p.v] : [p.v / 100, p.v]; // "25" in a % question means 25%; also accept 0.25
      return cands.some((c, i) => near(c, part.value, i === 0 && !p.percent ? { ...p, dec: p.dec + 2 } : p, part));
    }
    return near(p.v, part.value, p, part);
  }

  return { BANK, ch12, check, parseAns, shuffle, pick, ri };
})();
if (typeof module !== 'undefined') module.exports = X;
