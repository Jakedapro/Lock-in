/* ===== Lock In — maths content + question generators =====
   Written for Year 8 (New Century Maths 8, Ch 8–10). All explanations are original. */

const M = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const frac = (n, d) => { if (n === 0) return '0'; const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; };
  const money = (x) => '$' + (Math.round(x * 100) / 100).toFixed(2);
  const fmt = (x) => { const r = Math.round(x * 1000) / 1000; return String(r); };

  /* ---------- PROBABILITY ---------- */
  const prob = {
    die() {
      const events = [
        ['an even number', [2, 4, 6]], ['an odd number', [1, 3, 5]], ['a prime number', [2, 3, 5]],
        ['a multiple of 3', [3, 6]], ['a number less than 3', [1, 2]], ['a factor of 6', [1, 2, 3, 6]],
      ];
      const k = ri(1, 4); events.push([`a number greater than ${k}`, [1, 2, 3, 4, 5, 6].filter(n => n > k)]);
      const n = ri(1, 6); events.push([`a ${n}`, [n]]);
      const notE = Math.random() < 0.25;
      let [label, fav] = pick(events);
      if (notE) { fav = [1, 2, 3, 4, 5, 6].filter(x => !fav.includes(x)); label = `NOT ${label}`; }
      return {
        q: `A normal die is rolled once. What is the probability of rolling ${label}?`,
        type: 'num', value: fav.length / 6, show: frac(fav.length, 6), tag: '8.01',
        steps: [
          'Sample space = {1, 2, 3, 4, 5, 6}, so there are 6 equally likely outcomes.',
          `Favourable outcomes: {${fav.join(', ')}} → ${fav.length} of them.`,
          `P = ${fav.length}/6 = ${frac(fav.length, 6)}`,
        ],
      };
    },
    marbles() {
      const cols = ['red', 'blue', 'green', 'yellow'];
      const counts = cols.slice(0, 3).map(() => ri(2, 9));
      const total = counts.reduce((a, b) => a + b, 0);
      const i = ri(0, 2), not = Math.random() < 0.4;
      const fav = not ? total - counts[i] : counts[i];
      return {
        q: `A bag has ${counts[0]} red, ${counts[1]} blue and ${counts[2]} green marbles. One is picked at random. Find P(${not ? 'not ' : ''}${cols[i]}).`,
        type: 'num', value: fav / total, show: frac(fav, total), tag: not ? '8.02' : '8.01',
        steps: [
          `Total marbles = ${counts.join(' + ')} = ${total}`,
          not ? `Not ${cols[i]} = ${total} − ${counts[i]} = ${fav}` : `${cols[i][0].toUpperCase() + cols[i].slice(1)} marbles = ${fav}`,
          `P = ${fav}/${total} = ${frac(fav, total)}`,
        ],
      };
    },
    cards() {
      const ev = pick([
        ['a heart', 13, 'There are 13 hearts.'], ['a red card', 26, 'Hearts + diamonds = 26 red cards.'],
        ['an ace', 4, 'There is one ace in each of the 4 suits.'], ['a picture card (J, Q or K)', 12, '3 picture cards × 4 suits = 12.'],
        ['the king of spades', 1, 'There is only one.'], ['a black ace', 2, 'Ace of clubs and ace of spades.'],
        ['NOT a heart', 39, '52 − 13 hearts = 39.'], ['NOT an ace', 48, '52 − 4 aces = 48.'],
      ]);
      return {
        q: `A card is drawn from a standard deck of 52. Find the probability of drawing ${ev[0]}.`,
        type: 'num', value: ev[1] / 52, show: frac(ev[1], 52), tag: ev[0].startsWith('NOT') ? '8.02' : '8.01',
        steps: ['A standard deck has 52 cards: 4 suits of 13.', ev[2], `P = ${ev[1]}/52 = ${frac(ev[1], 52)}`],
      };
    },
    complement() {
      if (Math.random() < 0.5) {
        const p = ri(5, 95) / 100;
        return {
          q: `The chance of rain tomorrow is ${p}. What is the probability it does NOT rain?`,
          type: 'num', value: 1 - p, show: fmt(1 - p), tag: '8.02',
          steps: ['Complementary events add to 1: P(not A) = 1 − P(A)', `P(no rain) = 1 − ${p} = ${fmt(1 - p)}`],
        };
      }
      const d = pick([5, 7, 8, 9, 10, 12]), n = ri(1, d - 1);
      return {
        q: `P(a team wins) = ${frac(n, d)}. Find P(the team does not win).`,
        type: 'num', value: 1 - n / d, show: frac(d - n, d), tag: '8.02',
        steps: ['P(not A) = 1 − P(A)', `1 − ${frac(n, d)} = ${d}/${d} − ${n}/${d} = ${frac(d - n, d)}`],
      };
    },
    expected() {
      const t = pick([
        () => { const N = pick([60, 120, 300, 600]), f = ri(1, 6); return [`A die is rolled ${N} times. How many times would you expect to roll a ${f}?`, N / 6, `P(${f}) = 1/6`, `${N} × 1/6 = ${N / 6}`]; },
        () => { const N = pick([50, 80, 200, 500]); return [`A coin is tossed ${N} times. How many heads would you expect?`, N / 2, 'P(head) = 1/2', `${N} × 1/2 = ${N / 2}`]; },
        () => { const s = pick([4, 5, 8, 10]), N = s * ri(5, 30); return [`A spinner has ${s} equal sectors, one of them blue. It is spun ${N} times. Expected number of blues?`, N / s, `P(blue) = 1/${s}`, `${N} × 1/${s} = ${N / s}`]; },
      ])();
      return {
        q: t[0], type: 'num', value: t[1], show: String(t[1]), tag: '8.06',
        steps: ['Expected frequency = probability × number of trials', t[2], t[3]],
      };
    },
    observed() {
      const N = pick([20, 25, 40, 50, 60, 80, 100]), r = ri(Math.round(N / 8), Math.round(N / 2));
      return {
        q: `A spinner was spun ${N} times and landed on red ${r} times. What is the experimental (relative frequency) probability of red?`,
        type: 'num', value: r / N, show: frac(r, N), tag: '8.06',
        steps: ['Relative frequency = observed frequency ÷ total trials', `${r} ÷ ${N} = ${frac(r, N)}`],
      };
    },
    venn() {
      const a = ri(3, 12), both = ri(2, 8), b = ri(3, 12), neither = ri(1, 8), T = a + both + b + neither;
      const sport = 'soccer', music = 'music';
      const ask = pick([
        ['plays soccer AND learns music', both, `Both = the overlap = ${both}`],
        ['plays soccer OR learns music (or both)', a + both + b, `Inside either circle = ${a} + ${both} + ${b} = ${a + both + b}`],
        ['does neither', neither, `Outside both circles = ${neither}`],
        ['plays soccer only', a, `Soccer circle, not the overlap = ${a}`],
      ]);
      return {
        q: `In a class: ${a} play soccer only, ${b} learn music only, ${both} do both, ${neither} do neither. A student is chosen at random. Find P(the student ${ask[0]}).`,
        venn: { a, both, b, neither, A: sport, B: music },
        type: 'num', value: ask[1] / T, show: frac(ask[1], T), tag: '8.03', ext: true,
        steps: [`Total = ${a} + ${both} + ${b} + ${neither} = ${T}`, ask[2], `P = ${ask[1]}/${T} = ${frac(ask[1], T)}`],
      };
    },
    twoway() {
      const by = ri(4, 12), bn = ri(2, 8), gy = ri(4, 12), gn = ri(2, 8), T = by + bn + gy + gn;
      const ask = pick([
        ['a girl who plays a sport', gy, `Girls & Yes cell = ${gy}`],
        ['a boy', by + bn, `Boys row total = ${by} + ${bn} = ${by + bn}`],
        ['someone who does NOT play a sport', bn + gn, `No column total = ${bn} + ${gn} = ${bn + gn}`],
      ]);
      return {
        q: `Two-way table — plays a sport? Boys: Yes ${by}, No ${bn}. Girls: Yes ${gy}, No ${gn}. One student is picked. Find P(${ask[0]}).`,
        table: { by, bn, gy, gn },
        type: 'num', value: ask[1] / T, show: frac(ask[1], T), tag: '8.04', ext: true,
        steps: [`Grand total = ${by} + ${bn} + ${gy} + ${gn} = ${T}`, ask[2], `P = ${ask[1]}/${T} = ${frac(ask[1], T)}`],
      };
    },
  };

  /* ---------- EQUATIONS ---------- */
  const sgn = (n) => (n < 0 ? `− ${-n}` : `+ ${n}`);
  const eq = {
    oneStep() {
      const x = ri(-6, 15), a = ri(2, 12);
      const f = pick([
        () => [`x + ${a} = ${x + a}`, `Subtract ${a} from both sides: x = ${x + a} − ${a}`],
        () => [`x − ${a} = ${x - a}`, `Add ${a} to both sides: x = ${x - a} + ${a}`],
        () => [`${a}x = ${a * x}`, `Divide both sides by ${a}: x = ${a * x} ÷ ${a}`],
        () => [`x/${a} = ${x}`, `Multiply both sides by ${a}: x = ${x} × ${a}`, x * a],
      ])();
      const ans = f[2] ?? x;
      return { q: `Solve: ${f[0]}`, type: 'num', value: ans, show: `x = ${ans}`, tag: '9.01', steps: [f[1], `x = ${ans}`, `Check: substitute ${ans} back in ✓`] };
    },
    twoStep() {
      const x = ri(-5, 12), a = ri(2, 9), b = ri(1, 20) * pick([1, -1]);
      if (Math.random() < 0.7) {
        const c = a * x + b;
        return {
          q: `Solve: ${a}x ${sgn(b)} = ${c}`, type: 'num', value: x, show: `x = ${x}`, tag: '9.02',
          steps: [`${b > 0 ? 'Subtract ' + b + ' from' : 'Add ' + -b + ' to'} both sides: ${a}x = ${c - b}`, `Divide both sides by ${a}: x = ${x}`, `Check: ${a}(${x}) ${sgn(b)} = ${c} ✓`],
        };
      }
      const y = a * ri(-3, 8), c = y / a + b;
      return {
        q: `Solve: x/${a} ${sgn(b)} = ${c}`, type: 'num', value: y, show: `x = ${y}`, tag: '9.02',
        steps: [`${b > 0 ? 'Subtract ' + b + ' from' : 'Add ' + -b + ' to'} both sides: x/${a} = ${c - b}`, `Multiply both sides by ${a}: x = ${y}`],
      };
    },
    bothSides() {
      const x = ri(-4, 10); let a = ri(3, 9), c = ri(1, a - 1); const b = ri(-10, 12);
      const d = (a - c) * x + b;
      return {
        q: `Solve: ${a}x ${sgn(b)} = ${c === 1 ? '' : c}x ${sgn(d)}`, type: 'num', value: x, show: `x = ${x}`, tag: '9.03', ext: true,
        steps: [`Subtract ${c === 1 ? '' : c}x from both sides: ${a - c}x ${sgn(b)} = ${d}`, `${b >= 0 ? 'Subtract ' + b : 'Add ' + -b}: ${a - c}x = ${d - b}`, `Divide by ${a - c}: x = ${x}`],
      };
    },
    brackets() {
      const x = ri(-4, 10), a = ri(2, 7), b = ri(-6, 9) || 3, c = a * (x + b);
      return {
        q: `Solve: ${a}(x ${sgn(b)}) = ${c}`, type: 'num', value: x, show: `x = ${x}`, tag: '9.04', ext: true,
        steps: [`Expand: ${a}x ${sgn(a * b)} = ${c}   (or divide both sides by ${a} first: x ${sgn(b)} = ${x + b})`, `${a * b >= 0 ? 'Subtract ' + a * b : 'Add ' + -a * b}: ${a}x = ${c - a * b}`, `Divide by ${a}: x = ${x}`],
      };
    },
    quad() {
      const k = ri(2, 12), a = pick([1, 1, 2, 3, 4, 5]), c = a * k * k;
      return {
        q: `Solve: ${a === 1 ? '' : a}x² = ${c}   (give both solutions)`, type: 'pm', value: k, show: `x = ±${k}`, tag: '9.05',
        hint: `Type something like ±5 or 5, -5`,
        steps: [a === 1 ? `x² = ${c}` : `Divide both sides by ${a}: x² = ${k * k}`, `Square root both sides: x = ±√${k * k}`, `x = ${k} or x = −${k} (both square to ${k * k})`],
      };
    },
    wordy() {
      const x = ri(2, 20), a = ri(2, 9), b = ri(1, 25), c = a * x + b;
      return {
        q: `I think of a number, multiply it by ${a}, then add ${b}. The answer is ${c}. What was my number?`,
        type: 'num', value: x, show: String(x), tag: '9.06',
        steps: [`Let the number be n: ${a}n + ${b} = ${c}`, `Subtract ${b}: ${a}n = ${c - b}`, `Divide by ${a}: n = ${x}`],
      };
    },
    formula() {
      return pick([
        () => { const u = ri(0, 20), a = ri(2, 9), t = ri(2, 10); return { q: `v = u + at. Find v when u = ${u}, a = ${a}, t = ${t}.`, value: u + a * t, steps: [`Substitute: v = ${u} + ${a} × ${t}`, `v = ${u} + ${a * t} = ${u + a * t}`] }; },
        () => { const b = ri(2, 20), h = ri(2, 15); const A = (b * h) / 2; return { q: `A = ½bh. Find A when b = ${b} and h = ${h}.`, value: A, steps: [`A = ½ × ${b} × ${h}`, `A = ${A}`] }; },
        () => { const l = ri(4, 20), w = ri(2, 15), P = 2 * (l + w); return { q: `P = 2(l + w). Find w when P = ${P} and l = ${l}.`, value: w, steps: [`${P} = 2(${l} + w)`, `Divide by 2: ${P / 2} = ${l} + w`, `Subtract ${l}: w = ${w}`] }; },
        () => { const C = 5 * ri(-4, 8), F = 1.8 * C + 32; return { q: `F = 1.8C + 32 converts °C to °F. Find C when F = ${fmt(F)}.`, value: C, steps: [`${fmt(F)} = 1.8C + 32`, `Subtract 32: ${fmt(F - 32)} = 1.8C`, `Divide by 1.8: C = ${C}`] }; },
      ])();
    },
  };
  // wrap formula to add shared fields
  const _formula = eq.formula;
  eq.formula = () => { const r = _formula(); return { ...r, type: 'num', show: String(r.value), tag: '9.07' }; };

  /* ---------- RATIOS & RATES ---------- */
  const coprime = () => { let p, q; do { p = ri(1, 9); q = ri(1, 9); } while (gcd(p, q) !== 1 || p === q); return [p, q]; };
  const rr = {
    simplify() {
      const [p, q] = coprime();
      if (Math.random() < 0.35) {
        const k = ri(2, 6) * 10, m = (q * k) % 100 === 0 ? (q * k) / 100 : null;
        if (m) return {
          q: `Write ${p * k} cm : ${m} m as a ratio in simplest form.`, type: 'ratio', value: [p, q], show: `${p}:${q}`, tag: '10.01',
          steps: [`Make the units the same: ${m} m = ${q * k} cm`, `${p * k} : ${q * k}`, `Divide both by ${k}: ${p}:${q}`],
        };
      }
      const k = ri(2, 12);
      return {
        q: `Simplify the ratio ${p * k} : ${q * k}`, type: 'ratio', value: [p, q], show: `${p}:${q}`, tag: '10.01',
        steps: [`The highest common factor of ${p * k} and ${q * k} is ${k}`, `${p * k} ÷ ${k} = ${p},  ${q * k} ÷ ${k} = ${q}`, `${p}:${q}`],
      };
    },
    share() {
      const [p, q] = coprime(), k = ri(2, 20) * pick([1, 5]), T = k * (p + q);
      const second = Math.random() < 0.5;
      return {
        q: `Share $${T} between Ana and Ben in the ratio ${p}:${q}. How much does ${second ? 'Ben' : 'Ana'} get?`,
        type: 'num', value: second ? q * k : p * k, show: '$' + (second ? q * k : p * k), tag: '10.04',
        steps: [`Total parts = ${p} + ${q} = ${p + q}`, `One part = $${T} ÷ ${p + q} = $${k}`, `${second ? 'Ben' : 'Ana'} = ${second ? q : p} × $${k} = $${second ? q * k : p * k}`],
      };
    },
    problem() {
      const [p, q] = coprime(), k = ri(2, 12);
      const ctx = pick([['cordial', 'water', 'mL'], ['sand', 'cement', 'kg'], ['boys', 'girls', ''], ['blue paint', 'white paint', 'L']]);
      return {
        q: `${ctx[0][0].toUpperCase() + ctx[0].slice(1)} and ${ctx[1]} are in the ratio ${p}:${q}. If there are ${p * k}${ctx[2] ? ' ' + ctx[2] : ''} of ${ctx[0]}, how much ${ctx[1]} is there?`,
        type: 'num', value: q * k, show: `${q * k}${ctx[2] ? ' ' + ctx[2] : ''}`, tag: '10.02',
        steps: [`${p} parts = ${p * k}, so 1 part = ${p * k} ÷ ${p} = ${k}`, `${ctx[1]} = ${q} parts = ${q} × ${k} = ${q * k}`],
      };
    },
    scale() {
      const n = pick([1000, 2000, 5000, 20000, 50000, 100000, 250000]), cm = ri(2, 12);
      const realCm = cm * n, km = realCm / 100000, m = realCm / 100;
      const useKm = km >= 1;
      return {
        q: `A map has scale 1:${n.toLocaleString('en-AU')}. Two towns are ${cm} cm apart on the map. What is the real distance in ${useKm ? 'km' : 'metres'}?`,
        type: 'num', value: useKm ? km : m, show: useKm ? `${fmt(km)} km` : `${fmt(m)} m`, tag: '10.03',
        steps: [`Real = ${cm} × ${n.toLocaleString('en-AU')} = ${realCm.toLocaleString('en-AU')} cm`, `÷ 100 → ${fmt(m)} m`, ...(useKm ? [`÷ 1000 → ${fmt(km)} km`] : [])],
      };
    },
    rate() {
      const r = pick([2.5, 3.2, 4.5, 6, 7.25, 8.4, 12.5]), y = ri(2, 8), X = r * y;
      return {
        q: `${y} kg of apples cost ${money(X)}. What is the price per kg?`, type: 'num', value: r, show: money(r) + '/kg', tag: '10.05',
        steps: ['Rate = total cost ÷ number of kg', `${money(X)} ÷ ${y} = ${money(r)} per kg`],
      };
    },
    bestBuy() {
      let s1, s2, u1, u2;
      do { s1 = pick([250, 400, 500, 600]); s2 = pick([750, 1000, 1200, 1500]); u1 = ri(30, 70) / 100; u2 = ri(30, 70) / 100; } while (Math.abs(u1 - u2) < 0.04);
      const p1 = Math.round(s1 * u1) / 100, p2 = Math.round(s2 * u2) / 100;
      const per1 = p1 / s1 * 100, per2 = p2 / s2 * 100;
      const best = per1 < per2 ? 0 : 1;
      const opts = [`${s1} g for ${money(p1)}`, `${s2} g for ${money(p2)}`];
      return {
        q: `Which is the better buy for muesli?`, type: 'choice', choices: opts, value: best, show: opts[best], tag: '10.06',
        steps: [`Find the cost per 100 g for each.`, `${opts[0]} → ${money(p1)} ÷ ${s1 / 100} = ${money(per1)} per 100 g`, `${opts[1]} → ${money(p2)} ÷ ${s2 / 100} = ${money(per2)} per 100 g`, `Cheaper per 100 g = better buy: ${opts[best]}`],
      };
    },
    speed() {
      const s = pick([40, 50, 60, 75, 80, 90, 100]), t = pick([1.5, 2, 2.5, 3, 4, 0.5]), d = s * t;
      return pick([
        () => ({ q: `A car travels ${d} km in ${t} hours. What is its average speed in km/h?`, value: s, show: `${s} km/h`, steps: ['Speed = distance ÷ time', `${d} ÷ ${t} = ${s} km/h`] }),
        () => ({ q: `A bus travels at ${s} km/h for ${t} hours. How far does it go (km)?`, value: d, show: `${d} km`, steps: ['Distance = speed × time', `${s} × ${t} = ${d} km`] }),
        () => ({ q: `How many hours does it take to travel ${d} km at ${s} km/h?`, value: t, show: `${t} h`, steps: ['Time = distance ÷ speed', `${d} ÷ ${s} = ${t} hours`] }),
      ])();
    },
    convert() {
      if (Math.random() < 0.6) {
        const ms = pick([5, 10, 15, 20, 25, 30]), kmh = ms * 3.6;
        return Math.random() < 0.5
          ? { q: `Convert ${kmh} km/h to m/s.`, value: ms, show: `${ms} m/s`, steps: [`1 km = 1000 m, 1 h = 3600 s`, `${kmh} × 1000 ÷ 3600 = ${ms} m/s`, 'Shortcut: km/h ÷ 3.6 = m/s'] }
          : { q: `Convert ${ms} m/s to km/h.`, value: kmh, show: `${kmh} km/h`, steps: [`${ms} m/s × 3600 = ${ms * 3600} m per hour`, `÷ 1000 = ${kmh} km/h`, 'Shortcut: m/s × 3.6 = km/h'] };
      }
      const c = pick([0.5, 0.75, 1.2, 2, 2.5]);
      return { q: `A phone plan charges $${c} per minute. What is that in dollars per hour?`, value: c * 60, show: money(c * 60) + '/h', steps: ['1 hour = 60 minutes', `$${c} × 60 = ${money(c * 60)} per hour`] };
    },
    rateProblem() {
      return pick([
        () => { const w = pick([35, 40, 45, 50, 60]), m = ri(3, 15); return { q: `Lily types ${w} words per minute. How many words can she type in ${m} minutes?`, value: w * m, show: String(w * m), steps: [`${w} × ${m} = ${w * m} words`] }; },
        () => { const r = pick([4, 5, 6, 8, 12]), L = r * ri(5, 25); return { q: `A tap fills a tank at ${r} L/min. How long to fill ${L} L (minutes)?`, value: L / r, show: `${L / r} min`, steps: [`Time = amount ÷ rate`, `${L} ÷ ${r} = ${L / r} minutes`] }; },
        () => { const h = pick([15, 18, 22, 24.5, 28]), n = ri(3, 12); return { q: `Sam earns $${h} per hour. How much does he earn in ${n} hours?`, value: h * n, show: money(h * n), steps: [`${money(h)} × ${n} = ${money(h * n)}`] }; },
      ])();
    },
  };
  const tagged = (fn, tag) => () => ({ type: 'num', tag, ...fn() });

  const GEN = {
    prob: { die: prob.die, marbles: prob.marbles, cards: prob.cards, complement: prob.complement, expected: prob.expected, observed: prob.observed, venn: prob.venn, twoway: prob.twoway },
    eq: { oneStep: eq.oneStep, twoStep: eq.twoStep, bothSides: eq.bothSides, brackets: eq.brackets, quad: eq.quad, wordy: eq.wordy, formula: eq.formula },
    ratio: {
      simplify: rr.simplify, share: rr.share, problem: rr.problem, scale: rr.scale, rate: rr.rate, bestBuy: rr.bestBuy,
      speed: tagged(rr.speed, '10.08'), convert: tagged(rr.convert, '10.09'), rateProblem: tagged(rr.rateProblem, '10.07'),
    },
  };

  /* ---------- ANSWER CHECKING ---------- */
  function parseNum(s) {
    if (s == null) return NaN;
    let t = String(s).trim().toLowerCase().replace(/[$,\s]/g, ' ').replace(/\/?\s*(km\/h|m\/s|km|cm|mm|ml|kg|min|minutes|hours?|hrs?|m|g|l|h|s|°c|°f)\b/g, '').replace(/x\s*=/, '').trim();
    t = t.replace(/−/g, '-');
    let pct = false; if (t.endsWith('%')) { pct = true; t = t.slice(0, -1).trim(); }
    let v;
    const mixed = t.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    const f = t.match(/^(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)$/);
    if (mixed) v = Math.sign(+mixed[1] || 1) * (Math.abs(+mixed[1]) + +mixed[2] / +mixed[3]);
    else if (f) v = +f[1] / +f[2];
    else if (/^-?\d*\.?\d+$/.test(t.replace(/\s/g, ''))) v = +t.replace(/\s/g, '');
    else v = NaN;
    return pct ? v / 100 : v;
  }
  function check(item, input) {
    if (item.type === 'choice') return Number(input) === item.value;
    if (item.type === 'ratio') {
      const m = String(input).replace(/\s/g, '').match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
      return !!m && +m[1] === item.value[0] && +m[2] === item.value[1];
    }
    if (item.type === 'pm') {
      const s = String(input).replace(/−/g, '-');
      const nums = (s.match(/-?\d+(\.\d+)?/g) || []).map(Number);
      if (!nums.length || !nums.every(n => Math.abs(Math.abs(n) - item.value) < 1e-9)) return false;
      return s.includes('±') || s.includes('+-') || s.includes('+/-') || (nums.includes(item.value) && nums.includes(-item.value));
    }
    const v = parseNum(input);
    if (!isFinite(v)) return false;
    return Math.abs(v - item.value) <= Math.max(1e-6, Math.abs(item.value) * 1e-6) || Math.abs(v - item.value) < 0.005 && Math.abs(item.value) >= 1;
  }

  /* ---------- DECKS ---------- */
  const DECKS = [
    {
      id: 'prob', title: 'Probability', chapter: 'Ch 8', hue: 'coral', gen: 'prob',
      blurb: 'Chance, complements, Venn diagrams, two-way tables and expected frequency.',
      sections: [
        { code: '8.01', name: 'Probability', notes: ['Probability measures how likely something is, from 0 (impossible) to 1 (certain). It can be a fraction, decimal or percentage.', 'For equally likely outcomes: P(event) = number of favourable outcomes ÷ total number of outcomes.', 'The sample space is the list of every possible outcome. A die: {1, 2, 3, 4, 5, 6}.'], ex: ['P(rolling a number greater than 4 on a die)?', 'Favourable: {5, 6} → 2 outcomes', 'P = 2/6 = 1/3'] },
        { code: '8.02', name: 'Complementary events', notes: ['The complement of A is "not A": everything in the sample space that isn\'t A.', 'An event and its complement always add to 1, so P(not A) = 1 − P(A).', 'Super useful when "not A" is easier to count, e.g. "at least one".'], ex: ['P(picking an ace) = 4/52. Find P(not an ace).', '1 − 4/52 = 48/52', '= 12/13'] },
        { code: '8.03', name: 'Venn diagrams', ext: true, notes: ['Each circle is a group; the overlap holds things in BOTH groups.', 'Outside the circles = in neither group. Every region counts once, so the regions add to the total.', '"A or B" means anywhere inside either circle (including the overlap). "A and B" means just the overlap.'], ex: ['10 like pizza only, 4 like both, 6 like pasta only, 5 like neither. P(pizza)?', 'Pizza circle = 10 + 4 = 14, total = 25', 'P = 14/25'] },
        { code: '8.04', name: 'Two-way tables', ext: true, notes: ['A two-way table sorts data by two categories at once, one along the rows, one down the columns.', 'Row and column totals help you check your counting; the grand total sits in the corner.', 'For P(row AND column) use the single cell; for P(a whole row) use the row total. Always divide by the grand total unless the question narrows it ("of the girls…").'], ex: ['Of the girls, 8 play sport and 4 don\'t. P(a girl plays sport, given we picked a girl)?', 'Only look at the girls row: total 12', 'P = 8/12 = 2/3'] },
        { code: '8.05', name: 'Probability problems', notes: ['Read carefully: "at least 2", "at most 2", "more than", "less than" change which outcomes count.', 'Mutually exclusive events cannot happen together (rolling a 2 and a 5 at once), so P(A or B) = P(A) + P(B).', 'List outcomes systematically (table or tree) when there are two steps, like two coins or two dice.'], ex: ['Two coins are tossed. P(at least one head)?', 'Outcomes: HH, HT, TH, TT → 3 have a head', 'P = 3/4  (or 1 − P(TT) = 1 − 1/4)'] },
        { code: '8.06', name: 'Observed & expected frequencies', notes: ['Expected frequency = probability × number of trials. It is what theory predicts.', 'Observed frequency is what actually happened. Relative frequency = observed ÷ total trials.', 'More trials → the relative frequency usually gets closer to the theoretical probability.'], ex: ['A die is rolled 240 times. Expected number of 6s?', 'P(6) = 1/6', '240 × 1/6 = 40'] },
      ],
      cards: [
        ['Probability scale', 'From 0 (impossible) to 1 (certain). ½ means an even chance.'],
        ['P(event) formula', 'Favourable outcomes ÷ total outcomes (when outcomes are equally likely).'],
        ['Sample space', 'The full list of every possible outcome of an experiment.'],
        ['Trial', 'One go of an experiment, e.g. one roll of a die or one spin of a spinner.'],
        ['Complementary event', 'The "opposite" of an event: everything that is NOT that event.'],
        ['P(not A) = ?', '1 − P(A)'],
        ['"At least 2"', '2 or more: 2, 3, 4, … (the smallest allowed value is 2).'],
        ['Mutually exclusive', 'Events that can\'t happen at the same time; their categories share nothing.'],
        ['Venn diagram', 'Overlapping circles that sort items into groups; the overlap is "both".'],
        ['"A or B" in a Venn', 'Everything inside either circle, including the overlap.'],
        ['Two-way table', 'A table that sorts data by two categories, with row and column totals.'],
        ['Observed frequency', 'How many times something actually happened in an experiment.'],
        ['Expected frequency', 'Probability × number of trials: what you\'d predict to happen.'],
        ['Relative frequency', 'Observed frequency ÷ total trials. An experimental probability.'],
        ['Standard deck of cards', '52 cards: 4 suits (♥ ♦ red, ♣ ♠ black) of 13. 12 picture cards, 4 aces.'],
      ],
      concepts: [
        ['Which probability means an event is certain?', ['0', '0.5', '1', '100'], 2, 'Probabilities run from 0 to 1; 1 means it will definitely happen.'],
        ['P(A) = 0.35. What is P(not A)?', ['0.35', '0.65', '0.75', '1.35'], 1, 'Complements add to 1: 1 − 0.35 = 0.65.'],
        ['Which pair of events is mutually exclusive when rolling one die?', ['Even and greater than 3', 'Odd and prime', 'Getting a 2 and getting a 5', 'Less than 4 and even'], 2, 'You can\'t roll a 2 and a 5 on one roll. The others share outcomes (e.g. 4 is even and > 3).'],
        ['"At least 3" on a die means…', ['1, 2, 3', '3 only', '3, 4, 5, 6', '4, 5, 6'], 2, '"At least 3" means 3 or more.'],
        ['A coin is tossed 10 times and lands heads 7 times. This shows…', ['The coin must be unfair', 'Observed frequency can differ from expected', 'P(head) = 0.7 exactly', 'Tails is impossible'], 1, 'With only 10 trials, results often differ from the expected 5. More trials would get closer.'],
        ['In a Venn diagram, the overlap of two circles shows…', ['Neither group', 'Only the first group', 'Things in both groups', 'The total'], 2, 'The overlap holds items that belong to both categories.'],
        ['A spinner is spun 80 times. P(red) = 1/4. Expected reds?', ['4', '20', '25', '40'], 1, '80 × 1/4 = 20.'],
        ['Which is NOT a valid probability?', ['3/4', '0', '1.2', '45%'], 2, 'Probabilities can\'t be bigger than 1.'],
      ],
    },
    {
      id: 'eq', title: 'Equations', chapter: 'Ch 9', hue: 'cyan', gen: 'eq',
      blurb: 'One-step to two-step, both sides, brackets, x² = c and formulas.',
      sections: [
        { code: '9.01', name: 'One-step equations', notes: ['An equation says two things are equal. Solving means finding the value of the variable that makes it true.', 'Do the inverse (opposite) operation to both sides: + ↔ −, × ↔ ÷.', 'Always check by substituting your answer back in.'], ex: ['Solve x − 9 = 4', 'Add 9 to both sides', 'x = 13   (check: 13 − 9 = 4 ✓)'] },
        { code: '9.02', name: 'Two-step equations', notes: ['Undo in reverse order: deal with + and − first, then × and ÷.', 'Backtracking: write the steps that were done to x, then undo them backwards.', 'Balancing: whatever you do to one side, do to the other.'], ex: ['Solve 3x + 5 = 26', 'Subtract 5: 3x = 21', 'Divide by 3: x = 7'] },
        { code: '9.03', name: 'Variables on both sides', ext: true, notes: ['Get all the x terms on one side first, usually by subtracting the smaller x term from both sides.', 'Then it becomes a normal two-step equation.'], ex: ['Solve 5x + 2 = 3x + 10', 'Subtract 3x: 2x + 2 = 10', 'Subtract 2: 2x = 8 → x = 4'] },
        { code: '9.04', name: 'Equations with brackets', ext: true, notes: ['Expand the brackets first (multiply everything inside), then solve.', 'Or, if the number outside divides the other side nicely, divide both sides by it first.'], ex: ['Solve 4(x − 2) = 20', 'Divide by 4: x − 2 = 5', 'x = 7'] },
        { code: '9.05', name: 'Simple quadratics ax² = c', notes: ['Get x² by itself, then take the square root of both sides.', 'There are usually TWO answers: positive and negative, written x = ±k.', 'Because (−5)² = 25 as well as 5² = 25.'], ex: ['Solve 2x² = 72', 'Divide by 2: x² = 36', 'x = ±6'] },
        { code: '9.06', name: 'Equation problems', notes: ['Pick a letter for the unknown and say what it means ("let n = the number").', 'Turn the words into an equation, solve it, then answer the question in a sentence with units.'], ex: ['A number tripled, minus 4, is 17. Find it.', '3n − 4 = 17 → 3n = 21', 'n = 7'] },
        { code: '9.07', name: 'Equations and formulas', notes: ['A formula is a rule linking variables, e.g. v = u + at.', 'Substitute the numbers you know, then solve for the one you don\'t.'], ex: ['P = 2(l + w). Find w when P = 30, l = 9', '30 = 2(9 + w) → 15 = 9 + w', 'w = 6'] },
        { code: '9.08', name: 'Changing the subject', ext: true, notes: ['The subject is the variable on its own on the left, like v in v = u + at.', 'To make another variable the subject, use inverse operations just like solving an equation, but with letters.'], ex: ['Make t the subject of v = u + at', 'Subtract u: v − u = at', 'Divide by a: t = (v − u)/a'] },
      ],
      cards: [
        ['Equation', 'A statement that two expressions are equal, with an equals sign.'],
        ['Variable', 'A letter that stands for a value that can change, like x or n.'],
        ['Solve', 'Find the value(s) of the variable that make the equation true.'],
        ['Solution', 'The value that makes the equation true, e.g. x = 4.'],
        ['Inverse operation', 'The opposite operation: + undoes −, × undoes ÷, √ undoes ².'],
        ['Backtracking', 'Solving by undoing the steps done to x, in reverse order.'],
        ['Balancing method', 'Doing the same operation to both sides to keep the equation balanced.'],
        ['Substitute', 'Replace a variable with a number.'],
        ['Quadratic equation', 'An equation with a squared variable, like 3x² = 48.'],
        ['x² = 49 → x = ?', '±7 (both 7 and −7 square to 49).'],
        ['How do you check a solution?', 'Substitute it back into the original equation and see if both sides match.'],
        ['Two-step order', 'Undo + or − first, then × or ÷.'],
        ['Subject of a formula', 'The variable on its own, e.g. A in A = lw.'],
      ],
      concepts: [
        ['What is the first step to solve 4x − 7 = 21?', ['Divide by 4', 'Add 7 to both sides', 'Subtract 7', 'Multiply by 4'], 1, 'Undo the − 7 first by adding 7 to both sides.'],
        ['The solution to x/5 = 3 is…', ['x = 8', 'x = 15', 'x = 3/5', 'x = −2'], 1, 'Multiply both sides by 5: x = 15.'],
        ['How many solutions does x² = 64 have?', ['None', 'One', 'Two', 'Infinitely many'], 2, 'x = 8 and x = −8.'],
        ['Which is the inverse of "multiply by 6"?', ['Add 6', 'Subtract 6', 'Divide by 6', 'Square'], 2, 'Division undoes multiplication.'],
        ['Is x = 3 a solution of 2x + 5 = 13?', ['Yes', 'No'], 1, '2(3) + 5 = 11, not 13. The solution is x = 4.'],
        ['3(x + 2) expanded is…', ['3x + 2', '3x + 6', 'x + 6', '3x + 5'], 1, 'Multiply both terms inside by 3.'],
        ['"A number plus 8 equals 20" as an equation:', ['n − 8 = 20', '8n = 20', 'n + 8 = 20', 'n = 20 + 8'], 2, 'Plus 8 → n + 8, equals 20.'],
        ['Make w the subject of A = lw.', ['w = A − l', 'w = A/l', 'w = l/A', 'w = Al'], 1, 'Divide both sides by l.'],
      ],
    },
    {
      id: 'ratio', title: 'Ratios & Rates', chapter: 'Ch 10', hue: 'gold', gen: 'ratio',
      blurb: 'Simplifying, sharing, scale maps, best buys, speed and converting rates.',
      sections: [
        { code: '10.01', name: 'Ratios', notes: ['A ratio compares quantities of the SAME kind, written a:b, with no units.', 'Simplify like a fraction: divide both parts by their highest common factor.', 'Convert to the same units before simplifying (e.g. 50 cm : 2 m → 50:200 → 1:4).'], ex: ['Simplify 18:24', 'HCF = 6', '3:4'] },
        { code: '10.02', name: 'Ratio problems', notes: ['Find what ONE part is worth, then multiply.', 'Order matters: 2:3 is not the same as 3:2.'], ex: ['Cordial to water is 1:4. How much water for 150 mL of cordial?', '1 part = 150 mL', 'Water = 4 × 150 = 600 mL'] },
        { code: '10.03', name: 'Scale maps and plans', notes: ['A scale like 1:50 000 means 1 cm on the map is 50 000 cm in real life.', 'Real length = map length × scale factor. Map length = real length ÷ scale factor.', 'Unit chain: cm ÷ 100 → m, m ÷ 1000 → km. So 100 000 cm = 1 km.'], ex: ['Scale 1:25 000, map distance 6 cm', '6 × 25 000 = 150 000 cm', '= 1500 m = 1.5 km'] },
        { code: '10.04', name: 'Dividing in a ratio', notes: ['Add the parts to get the total number of parts.', 'Divide the amount by the total parts to find one part, then multiply for each share.', 'Check: the shares should add back to the original amount.'], ex: ['Share $45 in the ratio 2:3', '5 parts, 1 part = $9', '$18 and $27'] },
        { code: '10.05', name: 'Rates', notes: ['A rate compares quantities of DIFFERENT kinds, so it has units: km/h, $/kg, L/min.', '"/" is read as "per", meaning "for each".', 'Simplify a rate by making the second amount 1 (a unit rate).'], ex: ['$12 for 3 kg', '12 ÷ 3', '$4/kg'] },
        { code: '10.06', name: 'Best buys', notes: ['Compare unit prices: price for 1 unit (or for 100 g, 1 L…).', 'The lowest unit price is the best buy (best value for money).', 'Unitary method: find the value of one first, then scale.'], ex: ['500 g for $3.50 or 1 kg for $6.40?', '$0.70 vs $0.64 per 100 g', '1 kg is the better buy'] },
        { code: '10.07', name: 'Rate problems', notes: ['Amount = rate × time; time = amount ÷ rate; rate = amount ÷ time.', 'Keep the units matching: if the rate is per minute, the time must be in minutes.'], ex: ['A pump moves 15 L/min. How long for 240 L?', '240 ÷ 15', '16 minutes'] },
        { code: '10.08', name: 'Speed', notes: ['Speed = distance ÷ time. Distance = speed × time. Time = distance ÷ speed.', 'Use the D-S-T triangle: cover the one you want.', 'Watch time units: 30 minutes = 0.5 h, 15 minutes = 0.25 h.'], ex: ['180 km in 2.5 h', '180 ÷ 2.5', '72 km/h'] },
        { code: '10.09', name: 'Converting rates', notes: ['Convert each unit separately: top unit and bottom unit.', 'km/h → m/s: × 1000 ÷ 3600, which is the same as ÷ 3.6.', 'm/s → km/h: × 3.6.'], ex: ['Convert 54 km/h to m/s', '54 ÷ 3.6', '15 m/s'] },
        { code: '10.10', name: 'Travel graphs', notes: ['Distance goes up the side, time along the bottom.', 'Steeper line = faster. A flat (horizontal) section = stopped.', 'Speed for a section = rise ÷ run = distance ÷ time. A line coming back down means heading back toward the start.'], ex: ['Graph rises 60 km between 1 pm and 2:30 pm', 'Time = 1.5 h', 'Speed = 60 ÷ 1.5 = 40 km/h'] },
      ],
      cards: [
        ['Ratio', 'Compares quantities of the same kind, a:b, with no units.'],
        ['Rate', 'Compares quantities of different kinds, with units like km/h or $/kg.'],
        ['Per ( / )', 'Means "for each": 60 km/h = 60 km for each hour.'],
        ['Unit price', 'The price of one unit, like 1 kg, 1 L or 100 g.'],
        ['Best buy', 'The option with the lowest unit price: best value for money.'],
        ['Unitary method', 'Find the value of ONE first, then multiply for any amount.'],
        ['Scaled length', 'A length on a map or plan, smaller than (but in proportion to) the real thing.'],
        ['Scale 1:1000', '1 cm on the map = 1000 cm (10 m) in real life.'],
        ['Speed', 'A rate: distance travelled ÷ time taken.'],
        ['D-S-T formulas', 'S = D ÷ T,  D = S × T,  T = D ÷ S'],
        ['km/h → m/s', 'Divide by 3.6'],
        ['m/s → km/h', 'Multiply by 3.6'],
        ['Travel graph', 'A distance–time line graph of a journey. Flat = stopped; steeper = faster.'],
        ['Dividing $ in a ratio', 'Add the parts, find one part, multiply for each share.'],
      ],
      concepts: [
        ['Which of these is a rate?', ['3:5', '60 km/h', '1:1000', '2/3'], 1, 'A rate has two different units (km and h).'],
        ['Simplify 12:30', ['6:15', '2:5', '4:10', '1:2.5'], 1, 'HCF is 6: 12 ÷ 6 = 2, 30 ÷ 6 = 5.'],
        ['On a travel graph, a horizontal line means…', ['Going fastest', 'Going backwards', 'Stopped', 'Speeding up'], 2, 'Distance isn\'t changing, so the object isn\'t moving.'],
        ['45 minutes as hours is…', ['0.45 h', '0.75 h', '4.5 h', '0.5 h'], 1, '45 ÷ 60 = 0.75.'],
        ['Share $60 in the ratio 1:2. The larger share is…', ['$20', '$30', '$40', '$45'], 2, '3 parts → $20 each; 2 parts = $40.'],
        ['Which is the best buy?', ['2 L for $3.00', '1 L for $1.60', '3 L for $4.80', '500 mL for $0.85'], 0, 'Per litre: $1.50, $1.60, $1.60, $1.70.'],
        ['The ratio 2:3 is the same as 3:2.', ['True', 'False'], 1, 'Order matters in a ratio.'],
        ['A scale of 1:100 means 4 cm on the plan is…', ['4 m', '40 cm', '400 m', '0.4 m'], 0, '4 × 100 = 400 cm = 4 m.'],
      ],
    },
  ];
  DECKS.forEach(d => {
    d.cards = d.cards.map(([q, a]) => ({ q, a }));
    d.concepts = d.concepts.map(([q, options, answer, why]) => ({ q, options, answer, why }));
  });

  return { DECKS, GEN, check, parseNum, shuffle, pick, ri, frac };
})();
if (typeof module !== 'undefined') module.exports = M;
