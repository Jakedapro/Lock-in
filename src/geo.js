/* ===== Lock In — Geography =====
   Exam: 30 multiple choice (25 geographical tools & skills, 5 Water in the World) + 3 short answers. 45 min.
   Map questions are generated on a fresh topographic map each time. */

const G = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const C = (label, q, choices, correct, steps, extra = {}) => {
    const opts = shuffle([...new Set(choices.map(String))].slice(0, 4));
    if (!opts.includes(String(correct))) opts[0] = String(correct);
    return { label, q, type: 'choice', choices: opts, value: opts.indexOf(String(correct)), show: String(correct), steps, marks: 1, ...extra };
  };
  const two = (n) => String(n).padStart(2, '0');

  /* ---------------- topographic map generator ---------------- */
  const FEATURES = [
    { key: 'church', name: 'church' }, { key: 'school', name: 'school' }, { key: 'homestead', name: 'homestead' },
    { key: 'mine', name: 'mine' }, { key: 'lookout', name: 'lookout' }, { key: 'windmill', name: 'windmill' }, { key: 'campground', name: 'camping ground' },
  ];
  const DIRS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
  const DIR_ABBR = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  function makeMap() {
    const E0 = ri(20, 80), N0 = ri(10, 80), size = 6, ci = 20, base = pick([60, 80, 100, 120]);
    // hill: nested circles, shifted toward `steep` side so lines bunch up there
    const steep = pick([0, 2, 4, 6]); // index into DIRS (N, E, S, W)
    const dv = { 0: [0, 1], 2: [1, 0], 4: [0, -1], 6: [-1, 0] }[steep];
    const left = Math.random() < 0.5;
    const hc = [left ? 1.9 + Math.random() * 0.5 : 3.6 + Math.random() * 0.5, 2.2 + Math.random() * 1.6];
    const rings = ri(4, 6), R0 = 1.75, rStep = R0 / (rings + 0.6), shift = rStep * 0.55;
    const contours = []; for (let i = 0; i < rings; i++) contours.push({ h: base + ci * i, cx: hc[0] + dv[0] * shift * i, cy: hc[1] + dv[1] * shift * i, r: R0 - rStep * i });
    const top = contours[contours.length - 1], peak = { x: top.cx, y: top.cy, h: base + ci * (rings - 1) + ri(3, 17) };
    // river: runs down the low side of the map, away from the hill
    const rx = left ? 4.9 + Math.random() * 0.5 : 0.6 + Math.random() * 0.5;
    const river = []; for (let i = 0; i <= 8; i++) river.push([rx + (i && i < 8 ? (Math.random() - .5) * .6 : 0), 6 - i * 0.75]);
    // features: placed on a jittered grid so they never overlap
    const cells = shuffle([...Array(36)].map((_, i) => [i % 6, Math.floor(i / 6)]));
    const feats = []; const used = new Set();
    for (const f of shuffle(FEATURES)) {
      const cell = cells.find(([cx, cy]) => { const k = cx + ',' + cy; if (used.has(k)) return false; const x = cx + .5, y = cy + .5; if ((x - peak.x) ** 2 + (y - peak.y) ** 2 < .7) return false; if (Math.abs(x - rx) < .55) return false; return true; });
      if (!cell) break; used.add(cell[0] + ',' + cell[1]);
      // neighbours too, so features stay apart
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => used.add((cell[0] + a) + ',' + (cell[1] + b)));
      const x = cell[0] + (ri(2, 8) / 10), y = cell[1] + (ri(2, 8) / 10);
      feats.push({ ...f, x, y });
      if (feats.length >= 5) break;
    }
    const forest = { x: ri(0, 4), y: ri(0, 4), w: pick([1, 2]), h: pick([1, 2]) };
    const scale = pick([25000, 50000]);
    return { E0, N0, size, ci, contours, peak, river, feats, forest, steep, scale };
  }
  const ar = (m, f) => `${two(m.E0 + Math.floor(f.x))}${two(m.N0 + Math.floor(f.y))}`;
  const gr = (m, f) => `${two(m.E0 + Math.floor(f.x))}${Math.floor((f.x % 1) * 10 + 1e-9)}${two(m.N0 + Math.floor(f.y))}${Math.floor((f.y % 1) * 10 + 1e-9)}`;
  function dirFrom(a, b) {
    const ang = (Math.atan2(b.x - a.x, b.y - a.y) * 180 / Math.PI + 360) % 360; // 0 = north, clockwise
    const i = Math.round(ang / 45) % 8; const diff = Math.min(Math.abs(ang - i * 45), 360 - Math.abs(ang - i * 45));
    return { i, ang, clean: diff < 12 };
  }

  function mapQuestion(lvl) {
    const m = makeMap(); const f = m.feats;
    const parts = [];
    const A = f[0], B = f[1];
    // area reference
    {
      const right = 'AR ' + ar(m, A);
      const wrong = ['AR ' + two(m.N0 + Math.floor(A.y)) + two(m.E0 + Math.floor(A.x)), 'AR ' + two(m.E0 + Math.floor(A.x) + 1) + two(m.N0 + Math.floor(A.y)), 'AR ' + two(m.E0 + Math.floor(A.x)) + two(m.N0 + Math.floor(A.y) + 1), 'AR ' + two(m.E0 + Math.floor(A.x) - 1) + two(m.N0 + Math.floor(A.y) - 1)];
      parts.push(C('a', `What is the area reference of the ${A.name}?`, [right, ...wrong], right, ['Area reference = easting then northing of the BOTTOM-LEFT corner of the square.', 'Read across first (eastings, along the bottom), then up (northings).', `Easting ${two(m.E0 + Math.floor(A.x))}, northing ${two(m.N0 + Math.floor(A.y))} → ${right}`]));
    }
    // grid reference
    {
      const g = gr(m, B); const right = 'GR ' + g;
      const e = two(m.E0 + Math.floor(B.x)), et = Math.floor((B.x % 1) * 10 + 1e-9), n = two(m.N0 + Math.floor(B.y)), nt = Math.floor((B.y % 1) * 10 + 1e-9);
      const wrong = [`GR ${n}${nt}${e}${et}`, `GR ${e}${Math.min(9, et + 2)}${n}${nt}`, `GR ${e}${et}${n}${Math.max(0, nt - 3)}`, `GR ${e}${et}${two(+n + 1)}${nt}`];
      parts.push(C('b', `What is the 6-figure grid reference of the ${B.name}?`, [right, ...wrong], right, ['6 figures: easting (2 digits) + tenths across, then northing (2 digits) + tenths up.', `Across: ${e} and ${et} tenths → ${e}${et}`, `Up: ${n} and ${nt} tenths → ${n}${nt}`, `= ${right}  (Across the corridor, then up the stairs.)`]));
    }
    // feature at GR
    {
      const D = f[2] || f[0];
      parts.push(C('c', `Which feature is found at GR ${gr(m, D)}?`, [D.name, ...f.filter(x => x !== D).map(x => x.name)], D.name, [`Find easting ${gr(m, D).slice(0, 3)} across, northing ${gr(m, D).slice(3)} up`, `That spot is the ${D.name}.`]));
    }
    // direction
    {
      let a, b, d; let tries = 0;
      do { [a, b] = shuffle(f).slice(0, 2); d = dirFrom(a, b); tries++; } while (!d.clean && tries < 30);
      const right = DIRS[d.i];
      parts.push(C('d', `What direction is the ${b.name} from the ${a.name}?`, [right, DIRS[(d.i + 4) % 8], DIRS[(d.i + 1) % 8], DIRS[(d.i + 7) % 8], DIRS[(d.i + 2) % 8]], right, [`Start at the ${a.name} (the word after "from").`, `Look towards the ${b.name}: it is ${DIR_ABBR[d.i]} (${right}) of the ${a.name}.`, 'North is the top of the map (check the orientation arrow).']));
    }
    // distance (grid squares are 1 km on these maps)
    {
      const [a, b] = shuffle(f).slice(0, 2); const dist = Math.hypot(a.x - b.x, a.y - b.y); const r = Math.max(0.5, Math.round(dist * 2) / 2);
      const opts = [r, r + 1.5, Math.max(0.5, r - 1.5), r * 2 + 0.5].map(v => `about ${v} km`);
      parts.push(C('e', `Each grid square is 1 km wide. What is the straight-line distance from the ${a.name} to the ${b.name}?`, opts, `about ${r} km`, [`Measure the gap in grid squares: about ${dist.toFixed(1)} squares`, `× 1 km per square ≈ ${dist.toFixed(1)} km`, `Closest answer: about ${r} km`]));
    }
    // highest point
    {
      const h = m.peak.h;
      parts.push(C('f', 'What is the height of the highest point on the map (the trig station / spot height)?', [`${h} m`, `${m.contours[m.contours.length - 1].h} m`, `${h + m.ci} m`, `${m.contours[0].h} m`], `${h} m`, ['The spot height / trig station marks the exact height of the summit.', `It is labelled ${h} m.`]));
    }
    // contour interval
    parts.push(C('g', 'What is the contour interval on this map?', ['10 m', '20 m', '50 m', '100 m'], `${m.ci} m`, ['Contour interval = the height difference between two neighbouring contour lines.', `${m.contours[1].h} − ${m.contours[0].h} = ${m.ci} m`]));
    // steepest side
    const sideName = { 0: 'northern', 2: 'eastern', 4: 'southern', 6: 'western' }[m.steep];
    parts.push(C('h', 'Which side of the hill is the steepest?', ['northern', 'eastern', 'southern', 'western'].map(s => `The ${s} side`), `The ${sideName} side`, ['Contour lines that are close together = steep slope.', 'Lines far apart = gentle slope.', `The lines bunch up on the ${sideName} side.`]));
    // local relief
    parts.push(C('i', 'Local relief is the difference between the highest and lowest points. Treat the lowest contour as the lowest land. What is the local relief?', [m.peak.h - m.contours[0].h, m.peak.h, m.peak.h - m.ci, m.contours.length * m.ci].map(v => `${v} m`), `${m.peak.h - m.contours[0].h} m`, [`Highest = ${m.peak.h} m, lowest = ${m.contours[0].h} m`, `${m.peak.h} − ${m.contours[0].h} = ${m.peak.h - m.contours[0].h} m`]));
    // forest area
    parts.push(C('j', 'About how much area does the forest (green) cover? Each grid square is 1 km².', [m.forest.w * m.forest.h, m.forest.w * m.forest.h + 1, m.forest.w + m.forest.h + 2, m.forest.w * m.forest.h * 2 + 1].map(v => `${v} km²`), `${m.forest.w * m.forest.h} km²`, [`The forest covers ${m.forest.w} × ${m.forest.h} = ${m.forest.w * m.forest.h} grid squares`, '1 km² each']));

    const full = lvl === 'C';
    return { level: full ? 'C' : 'S', tags: ['G1', 'G2', 'G3'], stem: `Use the topographic map to answer the questions. Scale 1:${m.scale.toLocaleString('en-AU')}.`, visual: { type: 'topo', map: serialise(m) }, parts: full ? parts : parts.slice(0, 6) };
  }
  const serialise = (m) => ({ E0: m.E0, N0: m.N0, size: m.size, ci: m.ci, contours: m.contours, peak: m.peak, river: m.river, feats: m.feats, forest: m.forest, scale: m.scale });

  /* ---------------- scale questions ---------------- */
  function scaleQ() {
    const s = pick([10000, 25000, 50000, 100000, 250000]), cm = pick([2, 3, 4, 5, 6, 8]);
    const realM = cm * s / 100, real = realM >= 1000 ? `${realM / 1000} km` : `${realM} m`;
    const oneCm = s / 100 >= 1000 ? `${s / 100000} km` : `${s / 100} m`;
    const fake = (v) => v >= 1000 ? `${v / 1000} km` : `${v} m`;
    return {
      level: 'F', tags: ['G2'], stem: `A map has a scale of 1:${s.toLocaleString('en-AU')}.`, parts: [
        C('a', 'What does 1 cm on the map represent in real life?', [oneCm, fake(s / 10), fake(s / 1000), fake(s / 100 * 10)], oneCm, [`1 cm = ${s.toLocaleString('en-AU')} cm in real life`, `÷ 100 = ${s / 100} m${s / 100 >= 1000 ? ` = ${s / 100000} km` : ''}`]),
        C('b', `Two towns are ${cm} cm apart on the map. How far apart are they really?`, [real, fake(realM * 10), fake(realM / 10), fake(realM + s / 100)], real, [`${cm} × ${s.toLocaleString('en-AU')} = ${(cm * s).toLocaleString('en-AU')} cm`, `= ${real}`]),
        C('c', 'What type of scale is "1:' + s.toLocaleString('en-AU') + '"?', ['A ratio (representative fraction) scale', 'A line (linear) scale', 'A verbal (written) scale', 'A contour scale'], 'A ratio (representative fraction) scale', ['Scales can be written as a ratio (1:25 000), a line scale (bar), or in words ("1 cm represents 250 m").']),
        C('d', 'Which map shows MORE detail of a small area?', ['1:10 000', '1:250 000'], '1:10 000', ['Large-scale maps (small second number) show a small area in lots of detail.']),
      ],
    };
  }

  /* ---------------- climate graph ---------------- */
  function climateQ() {
    const types = [
      { name: 'a tropical place (e.g. Darwin)', rain: [380, 350, 300, 100, 20, 2, 1, 5, 15, 70, 140, 250], temp: [29, 29, 29, 29, 28, 26, 25, 26, 28, 29, 30, 30] },
      { name: 'a temperate east-coast place (e.g. Sydney)', rain: [100, 115, 130, 125, 120, 130, 95, 80, 65, 75, 85, 80], temp: [23, 23, 22, 19, 16, 13, 12, 14, 16, 18, 20, 22] },
      { name: 'a desert place (e.g. Alice Springs)', rain: [40, 45, 30, 15, 15, 15, 10, 8, 8, 20, 30, 40], temp: [29, 28, 25, 20, 16, 12, 12, 14, 19, 23, 26, 28] },
      { name: 'a Mediterranean place (e.g. Perth)', rain: [15, 15, 20, 45, 120, 175, 165, 135, 80, 50, 25, 15], temp: [25, 25, 23, 20, 16, 14, 13, 14, 15, 18, 21, 23] },
    ];
    const t = pick(types); const rain = t.rain.map(r => Math.max(0, r + ri(-8, 8))); const temp = t.temp.map(x => x + ri(-1, 1));
    const M = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const wet = rain.indexOf(Math.max(...rain)), dry = rain.indexOf(Math.min(...rain));
    const tmax = Math.max(...temp), tmin = Math.min(...temp), total = rain.reduce((a, b) => a + b, 0);
    const summerRain = rain[11] + rain[0] + rain[1], winterRain = rain[5] + rain[6] + rain[7];
    const pattern = Math.abs(summerRain - winterRain) < 60 ? 'Rain is spread fairly evenly through the year' : summerRain > winterRain ? 'Most rain falls in summer (Dec–Feb)' : 'Most rain falls in winter (Jun–Aug)';
    return {
      level: 'S', tags: ['G4'], stem: 'The climate graph shows average monthly rainfall (bars) and average temperature (line) for a place in Australia.', visual: { type: 'climate', rain, temp, M },
      parts: [
        C('a', 'Which month has the highest rainfall?', [MN[wet], MN[dry], MN[(wet + 6) % 12], MN[(wet + 3) % 12]], MN[wet], ['Find the tallest bar.', `${MN[wet]}: about ${rain[wet]} mm`]),
        C('b', 'What is the temperature range (highest minus lowest average temperature)?', [`${tmax - tmin} °C`, `${tmax} °C`, `${tmax + tmin} °C`, `${Math.max(1, tmax - tmin - 4)} °C`], `${tmax - tmin} °C`, [`Highest ≈ ${tmax} °C, lowest ≈ ${tmin} °C`, `Range = ${tmax} − ${tmin} = ${tmax - tmin} °C`]),
        C('c', 'Which statement best describes the rainfall pattern?', ['Most rain falls in summer (Dec–Feb)', 'Most rain falls in winter (Jun–Aug)', 'Rain is spread fairly evenly through the year'], pattern, [`Summer (Dec–Feb) ≈ ${summerRain} mm; winter (Jun–Aug) ≈ ${winterRain} mm`, 'In Australia (southern hemisphere) summer is Dec–Feb.']),
        C('d', 'Which side axis would you read to find the temperature?', ['The right-hand axis (°C)', 'The left-hand axis (mm)', 'The bottom axis (months)'], 'The right-hand axis (°C)', ['On these climate graphs, rainfall (mm) is read on the left and temperature (°C) on the right. Always check the labels!']),
      ],
      _total: total,
    };
  }

  /* ---------------- data: water use pie / world water ---------------- */
  function waterDataQ() {
    return {
      level: 'F', tags: ['W3', 'W5'], stem: 'Use the data. Australia: fresh water use — irrigated agriculture 55%, household 13%, sewerage and drainage 12%, other industry 9%, manufacturing 5%, mining 4%, electricity and gas 2%.',
      visual: { type: 'pie', data: [['Irrigated agriculture', 55], ['Household', 13], ['Sewerage & drainage', 12], ['Other industry', 9], ['Manufacturing', 5], ['Mining', 4], ['Electricity & gas', 2]] },
      parts: [
        C('a', 'Which sector uses the most fresh water in Australia?', ['Irrigated agriculture', 'Household', 'Mining', 'Manufacturing'], 'Irrigated agriculture', ['Biggest slice: irrigated agriculture, 55%.']),
        C('b', 'What percentage is used by households?', ['13%', '55%', '12%', '2%'], '13%', ['Read the household slice: 13%.']),
        C('c', 'Manufacturing, mining and electricity & gas are part of the secondary sector. What % do they use together?', ['11%', '9%', '20%', '5%'], '11%', ['5% + 4% + 2% = 11%']),
        C('d', 'Of all the water on Earth, about how much is fresh water?', ['2.5%', '25%', '0.4%', '97.5%'], '2.5%', ['97.5% is salty ocean water; only 2.5% is fresh — and most of that is frozen in glaciers.']),
      ],
    };
  }

  /* ---------------- decks ---------------- */
  const mapDeck = {
    id: 'maps', subject: 'geo', title: 'Geographical Tools & Skills', chapter: 'Section 1', hue: 'green', bank: 'maps',
    blurb: '25 of your 30 multiple-choice questions. Topographic maps, BOLTS, area & grid references, scale, climate graphs.',
    sections: [
      { code: 'G1', name: 'Essential features of maps (BOLTS)', notes: ['Every good map has BOLTS: Border, Orientation, Legend, Title, Scale.', 'Border: frames the map. Orientation: a north arrow showing direction. Legend (key): explains the symbols and colours. Title: says what and where the map shows. Scale: shows how distance on the map relates to real distance.', 'Many maps also give a Source (where the data came from) and use a grid for referencing.'], ex: ['Which part of BOLTS tells you what a black square symbol means?', 'Symbols are explained in the key', 'Legend'] },
      { code: 'G2', name: 'Scale and distance', notes: ['A ratio scale like 1:25 000 means 1 cm on the map = 25 000 cm (250 m) in real life.', 'A line scale is a bar marked in km: measure with a ruler or the edge of paper, then lay it on the bar.', 'Large scale (1:10 000) = small area, lots of detail. Small scale (1:1 000 000) = big area, less detail.', 'On most topographic maps one grid square is 1 km × 1 km (1 km²) at 1:25 000.'], ex: ['Scale 1:50 000, map distance 3 cm', '3 × 50 000 = 150 000 cm', '= 1500 m = 1.5 km'] },
      { code: 'G3', name: 'Area and grid references', notes: ['Eastings are the vertical lines numbered along the bottom (they increase going east). Northings are the horizontal lines numbered up the side (they increase going north).', 'Area reference (AR, 4 figures): the easting then the northing of the BOTTOM-LEFT corner of the square, e.g. AR 4523.', 'Grid reference (GR, 6 figures): easting + tenths across, then northing + tenths up, e.g. GR 452238.', 'Always go across first, then up: "along the corridor, then up the stairs".'], ex: ['A church is 3 tenths past easting 45 and 8 tenths past northing 23', 'Across: 453, up: 238', 'GR 453238'] },
      { code: 'G4', name: 'Reading topographic maps', notes: ['Topographic maps show the shape (relief) of the land with contour lines, plus natural and built features.', 'A contour line joins places of equal height above sea level. The contour interval is the height gap between lines.', 'Lines close together = steep slope. Far apart = gentle slope. Circles of lines getting smaller = a hill; the spot height or trig station marks the summit.', 'Rivers flow from high ground to low ground. Local relief = highest point − lowest point.', 'Climate graphs: bars = rainfall (mm, usually left axis), line = temperature (°C, right axis).'], ex: ['Contours at 100, 120, 140 m and a summit marked 153 m', 'Contour interval = 20 m', 'Local relief = 153 − 100 = 53 m'] },
      { code: 'G5', name: 'Geographical concepts (SPICESS)', notes: ['Space: where things are located and how they are arranged (distribution).', 'Place: the special features that make a location unique. Interconnection: how people, places and things are linked (e.g. the water cycle links oceans, air and land).', 'Change: how places change over time. Environment: the natural and human world, and how they affect each other.', 'Sustainability: using resources so future generations can still meet their needs. Scale: looking at things at local, regional, national and global levels.'], ex: ['"Water from the ocean evaporates and later falls as rain on farms." Which concept?', 'It links different places and systems together', 'Interconnection'] },
    ],
    cards: [
      ['BOLTS', 'Border, Orientation, Legend, Title, Scale: the essential features of a map.'],
      ['Orientation', 'The north arrow: shows which way is north.'],
      ['Legend (key)', 'Explains what the map\'s symbols and colours mean.'],
      ['Scale', 'How distance on the map relates to real distance, e.g. 1:25 000.'],
      ['1:25 000 → 1 cm = ?', '250 m (25 000 cm ÷ 100). So 4 cm = 1 km.'],
      ['Easting', 'Vertical grid line, numbered along the bottom; numbers increase going east.'],
      ['Northing', 'Horizontal grid line, numbered up the side; numbers increase going north.'],
      ['Area reference', '4 figures: easting then northing of the bottom-left corner of the square. e.g. AR 4523'],
      ['Grid reference', '6 figures: easting + tenths, then northing + tenths. e.g. GR 452238'],
      ['Contour line', 'A line joining places of equal height above sea level.'],
      ['Contour interval', 'The height difference between two neighbouring contour lines.'],
      ['Close contour lines', 'A steep slope.'],
      ['Spot height / trig station', 'Marks the exact height of a point, often a hilltop.'],
      ['Local relief', 'Highest point minus lowest point in an area.'],
      ['Topographic map', 'A detailed map showing the shape of the land (contours) and natural and built features.'],
      ['Compass points (8)', 'N, NE, E, SE, S, SW, W, NW'],
      ['"X is ___ of Y"', 'Stand on Y and look toward X. The word after "of" or "from" is where you start.'],
      ['Climate graph', 'Rainfall as bars (mm), temperature as a line (°C) for each month.'],
      ['PQE method', 'Describe a map/graph: Pattern, Quantify (use numbers), Exceptions.'],
      ['SPICESS', 'Space, Place, Interconnection, Change, Environment, Sustainability, Scale.'],
      ['Interconnection', 'How people, places and environments are linked (e.g. the water cycle).'],
      ['Sustainability', 'Using resources so future generations can still meet their needs.'],
    ].map(([q, a]) => ({ q, a })),
    concepts: [
      ['What does the "O" in BOLTS stand for?', ['Orientation', 'Ocean', 'Outline', 'Overview'], 0, 'O = Orientation: the north arrow.'],
      ['Which BOLTS feature explains what the symbols on a map mean?', ['Legend', 'Border', 'Title', 'Scale'], 0, 'The legend (key) explains symbols and colours.'],
      ['On a grid, which numbers do you read first for an area reference?', ['Eastings (across the bottom)', 'Northings (up the side)', 'Either, it doesn\'t matter', 'The contour heights'], 0, 'Across the corridor, then up the stairs: eastings first.'],
      ['An area reference refers to which corner of the grid square?', ['Bottom-left', 'Top-left', 'Top-right', 'The centre'], 0, 'AR uses the lines meeting at the bottom-left (south-west) corner.'],
      ['How many figures does a grid reference have?', ['6', '4', '2', '8'], 0, 'GR = 6 figures (AR = 4).'],
      ['Contour lines that are very close together show…', ['A steep slope', 'Flat land', 'A river', 'A gentle slope'], 0, 'Height changes quickly over a short distance.'],
      ['A map with scale 1:10 000 compared with 1:1 000 000 shows…', ['A smaller area in more detail', 'A bigger area in more detail', 'A bigger area in less detail', 'Exactly the same thing'], 0, 'Small second number = large scale = more detail.'],
      ['Which concept describes how places are linked to each other?', ['Interconnection', 'Scale', 'Change', 'Space'], 0, 'Interconnection = links between people, places and environments.'],
      ['Using resources so future generations can still use them is called…', ['Sustainability', 'Interconnection', 'Place', 'Change'], 0, ''],
      ['"Looking at an issue at local, national and global levels" is the concept of…', ['Scale', 'Space', 'Place', 'Environment'], 0, ''],
      ['The PQE method stands for…', ['Pattern, Quantify, Exceptions', 'Place, Question, Explain', 'Plan, Quote, Evaluate', 'Point, Quote, Explain'], 0, 'Used to describe maps and graphs.'],
      ['Rivers on a topographic map flow…', ['From high land to low land', 'Always north', 'From low land to high land', 'Towards the nearest town'], 0, 'Water flows downhill.'],
      ['On a climate graph, rainfall is usually shown as…', ['Columns (bars)', 'A line', 'A pie', 'Dots'], 0, 'Bars for rainfall, a line for temperature.'],
      ['A spot height on a topographic map shows…', ['The exact height of a point', 'Where a town is', 'A water tank', 'The contour interval'], 0, ''],
    ].map(([q, options, answer, why]) => ({ q, options, answer, why })),
  };

  const waterDeck = {
    id: 'water', subject: 'geo', title: 'Water in the World', chapter: 'Section 2', hue: 'cyan', bank: 'water',
    blurb: '5 multiple choice + 3 short answers. Resources, the water cycle, accessing water, Australia, value of water, scarcity.',
    sections: [
      { code: 'W1', name: 'Water as a resource (pp 200–201)', notes: ['Environmental resources come in 3 types. Renewable: replace themselves naturally if not overused (forests, fresh water, soil). Non-renewable: finite, will run out (coal, oil, uranium, diamonds). Continuous: unlimited, never run out (sun, wind).', 'In Australia fresh water is treated as renewable, but it must be carefully managed so there is enough for everyone.'], ex: ['Classify: wind, coal, timber', 'Wind = continuous, coal = non-renewable', 'Timber = renewable'] },
      { code: 'W2', name: 'The water cycle (pp 202–203)', notes: ['Evaporation: the Sun heats water in oceans, lakes and rivers and it turns into water vapour (a gas) that rises.', 'Condensation: water vapour cools in the colder upper air and turns back into tiny drops of water, forming clouds.', 'Precipitation: the drops join, get heavier and fall as rain, snow or hail. Then run-off (over the ground to rivers and oceans) and infiltration (soaking into soil, used by plants).', 'It is a closed system: water changes form but never disappears. It is an example of interconnection, linking oceans, atmosphere, land and people.', 'Water can be an available resource (liquid fresh water) or a potential resource (ice, vapour, or salt water).'], ex: ['Order: precipitation, evaporation, condensation', 'Water must rise as vapour first, then cool, then fall', 'Evaporation → condensation → precipitation'] },
      { code: 'W2b', name: 'Types of rainfall', notes: ['Rain falls when moist air is forced to rise and cool.', 'Orographic (relief) rainfall: air is pushed up over mountains, cools and rains on the windward side; the other side (rain shadow) is dry.', 'Frontal rainfall: a cold air mass wedges under a warm one, forcing the warm air up along a front.', 'Convectional rainfall: the ground heats air during the day, it rises fast and causes heavy rain and thunderstorms (common in the tropics).'], ex: ['Why is Tully (QLD) so wet?', 'Moist winds are forced up the Great Dividing Range', 'Orographic rainfall'] },
      { code: 'W3', name: 'Accessing water (pp 204–205)', notes: ['97.5% of Earth\'s water is salty ocean. Only 2.5% is fresh, and of that, 68.7% is frozen in glaciers and 30.1% is groundwater. Only 0.4% is surface water (lakes, rivers).', 'Fresh water is not evenly distributed: water-rich places (Brazil with the Amazon, Indonesia, PNG) vs water-poor places (like Australia).', 'Groundwater: rain soaks into soil and rock. The saturated zone is where every gap is filled with water; its top is the water table. An aquifer is a layer of permeable rock that stores water (Perth gets most of its water from one).', 'Groundwater is reached at springs and oases, or pumped up through bores.', 'PQE: describe a map by its Pattern, Quantify with data, and point out Exceptions.'], ex: ['What is the water table?', 'The saturated zone is where gaps are full of water', 'The water table is the top of the saturated zone'] },
      { code: 'W4', name: 'Water in Australia (pp 208–209)', notes: ['Australia has the lowest volume of water in its rivers of any inhabited continent, and its water is unevenly distributed.', 'The north is tropical with summer monsoon rains (water rich). The interior is very dry. Most big cities are on the east and south-east coast.', 'The Great Dividing Range (3500 km long) makes moist south-easterly air rise and rain on the east coast; west of the range it is drier.', 'Wettest: Tully, QLD (about 4204 mm a year): tropics + on the slopes of the Great Dividing Range. Driest: Kati Thanda–Lake Eyre, SA (little more than 100 mm): far from any moisture source.', 'The Great Artesian Basin is the world\'s largest underground water supply, about 1.7 million km² (22% of Australia). Water is trapped in sandstone; farmers drill wells and pump it up with windmills.', 'Only about 12% of Australia\'s rainfall ends up in rivers (river discharge); 88% is used by plants, stored or evaporates.'], ex: ['Why is Kati Thanda–Lake Eyre so dry?', 'It is far from the ocean; air masses have dropped their rain before they arrive', 'So very little moisture reaches it'] },
      { code: 'W5', name: 'The value of water (pp 230–231)', notes: ['We need water to drink, cook, wash, grow food and make electricity: it is arguably our most precious resource.', 'Irrigating farms uses the most water in Australia (the book says about 70% for irrigation on p 230, and 55% for irrigated agriculture in the 2015 data on p 244). Homes use a much smaller share (about 12–13%).', 'An average Australian household uses over 350 litres a day; toilets and bathrooms are about 40% of that.', 'Counting the water used to make our food and products, each Australian is responsible for over 1 million litres a year.', 'Other uses: spiritual and cultural, firefighting, environment (rivers need flow), fishing, hydro-electricity (dams), coal and nuclear power, navigation and trade (Nile, Rhine, Yangtze), recreation, mining, construction.', 'Off-stream use = water is taken away from its source (irrigation, homes). In-stream use = water stays where it is (fishing, swimming, navigation).'], ex: ['Is navigation an in-stream or off-stream use?', 'Boats use the river where it is', 'In-stream'] },
      { code: 'W6', name: 'Water scarcity (pp 242–245)', notes: ['Water scarcity: when the demand for clean water is greater than the available supply.', 'Africa is the second-driest inhabited continent (after Australia). Over 300 million of its 800 million people live in water-scarce areas.', 'Causes in Africa: a large, fast-growing population; low and variable rainfall; poor water quality; lack of infrastructure such as pipelines.', 'Effects: water-borne diseases (typhoid, dysentery) from contaminated water, which kill many children; women can spend up to 60% of their day collecting water.', 'Solution: digging wells to reach clean groundwater, often funded by aid agencies (World Vision, WaterAid, the UN).', 'In Australia, population growth and drought put pressure on water. Dams store water and pipelines move it from wetter to drier areas. Irrigation (e.g. rice, fruit) uses about 55%.'], ex: ['Give two causes of water scarcity in Africa', 'Think population, rainfall, quality, infrastructure', 'Fast population growth; low, unreliable rainfall'] },
    ],
    cards: [
      ['Renewable resource', 'Replaces itself naturally if not overused. e.g. forests, fresh water, soil.'],
      ['Non-renewable resource', 'Limited (finite); will run out. e.g. coal, oil, uranium.'],
      ['Continuous resource', 'Unlimited; never runs out. e.g. sun, wind.'],
      ['Water cycle', 'The constant movement of water between oceans, air and land: evaporation → condensation → precipitation → run-off/infiltration.'],
      ['Evaporation', 'The Sun heats water and it turns into water vapour (gas) that rises.'],
      ['Condensation', 'Water vapour cools and turns back into tiny water drops, forming clouds.'],
      ['Precipitation', 'Water falling from clouds as rain, snow or hail.'],
      ['Run-off', 'Water flowing over the ground into rivers, lakes and oceans.'],
      ['Infiltration', 'Water soaking into the soil.'],
      ['Why is the water cycle a "closed system"?', 'Water changes form but never leaves or disappears.'],
      ['Orographic rainfall', 'Air forced up over mountains cools and rains; the far side is a dry rain shadow.'],
      ['Frontal rainfall', 'A cold air mass pushes under warm air, forcing it up to form rain along a front.'],
      ['Convectional rainfall', 'Ground heats air, which rises fast: heavy rain and storms.'],
      ['Earth\'s water', '97.5% salt (oceans), 2.5% fresh. Most fresh water is ice (68.7%) or groundwater (30.1%).'],
      ['Groundwater', 'Water stored underground in the spaces between soil and rock.'],
      ['Water table', 'The top of the saturated zone underground.'],
      ['Aquifer', 'A layer of permeable rock that stores groundwater.'],
      ['Great Artesian Basin', 'World\'s largest underground water supply, under ~22% of Australia (1.7 million km²).'],
      ['Wettest place in Australia', 'Tully, QLD: about 4204 mm/year (tropics + Great Dividing Range).'],
      ['Driest place in Australia', 'Kati Thanda–Lake Eyre, SA: about 100 mm/year (far from moisture).'],
      ['River discharge (Australia)', 'Only ~12% of rainfall ends up in rivers.'],
      ['Water rich vs water poor', 'Has plenty of fresh water (Brazil, PNG) vs not enough (Australia).'],
      ['Biggest water user in Australia', 'Irrigated agriculture (farming).'],
      ['Household water use', '350+ litres a day per household; toilets & bathrooms ~40%.'],
      ['Off-stream use', 'Water is removed from its source (irrigation, homes, industry).'],
      ['In-stream use', 'Water stays where it is (fishing, swimming, boats).'],
      ['Water scarcity', 'When demand for clean water is greater than the supply.'],
      ['Causes of scarcity in Africa', 'Fast population growth, low & variable rainfall, poor water quality, lack of infrastructure.'],
      ['Main solution in African villages', 'Digging wells to reach clean groundwater.'],
      ['Hydro-electricity', 'Electricity made from moving water, usually released through a dam.'],
    ].map(([q, a]) => ({ q, a })),
    concepts: [
      ['Which is a continuous resource?', ['Wind', 'Coal', 'Forests', 'Uranium'], 0, 'Continuous resources never run out (sun, wind).'],
      ['Which is a non-renewable resource?', ['Oil', 'Fresh water', 'Timber', 'Solar energy'], 0, 'Oil is finite.'],
      ['What is the correct order of the water cycle?', ['Evaporation → condensation → precipitation', 'Condensation → evaporation → precipitation', 'Precipitation → condensation → evaporation', 'Evaporation → precipitation → condensation'], 0, 'Rise as vapour, cool into clouds, fall as rain.'],
      ['Condensation is when…', ['Water vapour cools and forms tiny water droplets', 'The Sun heats water into vapour', 'Rain soaks into the soil', 'Water flows over the land'], 0, ''],
      ['Why is the water cycle called a closed system?', ['Water changes form but never disappears', 'It only happens in closed valleys', 'Humans control it', 'It stops in winter'], 0, ''],
      ['What percentage of Earth\'s water is fresh?', ['2.5%', '25%', '10%', '97.5%'], 0, '97.5% is ocean (salt) water.'],
      ['Most of the world\'s fresh water is stored as…', ['Glaciers and ice', 'Rivers', 'Lakes', 'Clouds'], 0, 'About 68.7% of fresh water is ice.'],
      ['The top of the saturated zone underground is called the…', ['Water table', 'Aquifer', 'Bore', 'Spring'], 0, ''],
      ['Rain caused by air being forced up over mountains is…', ['Orographic rainfall', 'Convectional rainfall', 'Frontal rainfall', 'Monsoon drizzle'], 0, ''],
      ['Which is the wettest place in Australia?', ['Tully, Queensland', 'Kati Thanda–Lake Eyre', 'Hobart', 'Perth'], 0, 'About 4204 mm a year.'],
      ['Why does Kati Thanda–Lake Eyre get so little rain?', ['It is far from any source of moisture', 'It is too high', 'It is in the tropics', 'Mountains surround it'], 0, ''],
      ['The Great Artesian Basin is…', ['The world\'s largest underground water supply', 'Australia\'s biggest dam', 'A river in Queensland', 'A desert lake'], 0, ''],
      ['Which uses the most water in Australia?', ['Irrigated agriculture', 'Households', 'Mining', 'Swimming pools'], 0, ''],
      ['Fishing in a river is an example of…', ['In-stream water use', 'Off-stream water use', 'Groundwater use', 'Irrigation'], 0, 'The water stays where it is.'],
      ['Water scarcity happens when…', ['Demand for clean water is greater than supply', 'It rains a lot', 'Water is renewable', 'Water is used for recreation'], 0, ''],
      ['Which is NOT a main cause of water scarcity in Africa?', ['Too many dams', 'Fast population growth', 'Low and variable rainfall', 'Lack of infrastructure'], 0, 'Lack of infrastructure is a cause; too many dams is not.'],
      ['Contaminated water can spread diseases such as…', ['Typhoid and dysentery', 'Asthma', 'Hay fever', 'Measles'], 0, ''],
      ['The most common solution to water scarcity in African villages is…', ['Digging wells', 'Building ski resorts', 'Cloud seeding', 'Desalination plants in every village'], 0, ''],
      ['Australia is described as…', ['Water poor', 'Water rich', 'Having the most river water of any continent', 'Evenly watered'], 0, ''],
      ['Roughly what share of Australia\'s rainfall becomes river discharge?', ['12%', '50%', '88%', '2.5%'], 0, '88% evaporates, is used by plants or stored.'],
    ].map(([q, options, answer, why]) => ({ q, options, answer, why })),
    short: [
      { q: 'Describe the stages of the water cycle.', marks: 4, tags: ['W2'], criteria: ['Evaporation: the Sun heats surface water, which rises as water vapour', 'Condensation: vapour cools and forms droplets/clouds', 'Precipitation: droplets join and fall as rain, snow or hail', 'Run-off and/or infiltration returns water to rivers, oceans or soil (a closed system)'], model: 'The Sun heats water in oceans, lakes and rivers, and it evaporates into water vapour that rises. In the cooler upper atmosphere the vapour condenses into tiny droplets, which form clouds. The droplets join and become heavy, falling as precipitation (rain, snow or hail). The water then runs off into rivers and oceans or infiltrates the soil, and the cycle starts again. Because water changes form but never disappears, it is a closed system.' },
      { q: 'Explain why Australia is considered "water poor".', marks: 3, tags: ['W3', 'W4'], criteria: ['Australia has the lowest volume of water in rivers of any inhabited continent / only ~12% of rain becomes river flow', 'Rainfall is unevenly distributed and variable (dry interior, droughts)', 'High evaporation and few permanent wetlands; most people live where demand is high'], model: 'Australia has the lowest volume of water in its rivers of any inhabited continent, with only about 12% of rainfall ending up as river discharge because so much evaporates or is used by plants. Its rainfall is also very uneven: the north and east coast are wet, but the huge interior receives very little, and droughts are common. This means there is little reliable fresh water compared with water-rich countries like Brazil.' },
      { q: 'Explain why Tully is the wettest place in Australia and Kati Thanda–Lake Eyre is the driest.', marks: 4, tags: ['W2b', 'W4'], criteria: ['Tully is in the tropics with moist winds', 'Air is forced up the Great Dividing Range and cools → orographic rain (≈4200 mm)', 'Kati Thanda is in the interior, far from a moisture source', 'Air masses have already dropped their rain before reaching it (≈100 mm)'], model: 'Tully is in the tropics, where warm, moist south-easterly winds blow in from the ocean. The air is forced to rise up the north-eastern slopes of the Great Dividing Range, cools and condenses, producing heavy orographic rainfall of about 4204 mm a year. Kati Thanda–Lake Eyre lies in the centre of the continent, far from any source of moisture. By the time air masses arrive there they have already dropped their rain elsewhere, so it receives only about 100 mm a year.' },
      { q: 'Distinguish between renewable, non-renewable and continuous resources. Give an example of each.', marks: 3, tags: ['W1'], criteria: ['Renewable: replaced naturally over time if not overused, e.g. fresh water/forests', 'Non-renewable: finite, will run out, e.g. coal/oil', 'Continuous: unlimited, never runs out, e.g. sun/wind'], model: 'Renewable resources replace themselves naturally over time if we do not use them too quickly, such as forests or fresh water. Non-renewable resources exist in limited amounts and will eventually run out, such as coal and oil. Continuous resources are unlimited and will never run out no matter how much we use them, such as solar and wind energy.' },
      { q: 'Outline the causes and effects of water scarcity in Africa, and one way it is being reduced.', marks: 5, tags: ['W6'], criteria: ['Defines scarcity: demand for clean water exceeds supply', 'Cause: fast-growing population and/or low, variable rainfall', 'Cause: poor water quality and/or lack of infrastructure', 'Effect: water-borne diseases (typhoid, dysentery) / deaths of children / women and girls spend hours collecting water', 'Solution: digging wells to reach clean groundwater, often funded by aid agencies'], model: 'Water scarcity happens when the demand for clean water is greater than the supply; over 300 million Africans live in water-scarce areas. Causes include a large, fast-growing population, low and variable rainfall, poor water quality and a lack of infrastructure such as pipelines. As a result, many people drink contaminated water and catch diseases like typhoid and dysentery, which kill many children, and women can spend up to 60% of their day collecting water. Aid agencies such as World Vision and WaterAid help by digging wells that reach clean groundwater.' },
      { q: 'Describe three different ways people use and value water.', marks: 3, tags: ['W5'], criteria: ['One use explained (e.g. irrigation of farms — the biggest user)', 'A second distinct use (e.g. domestic: drinking, washing; 350+ L/day per household)', 'A third distinct use (e.g. hydro-electricity, spiritual/cultural, recreation, navigation, industry, environment)'], model: 'Water is used to irrigate crops and pastures, which is the biggest use of water in Australia and provides much of our food. In homes, households use over 350 litres a day for drinking, cooking, washing and flushing toilets. Water also has spiritual value, playing a key part in ceremonies for many religions, and it is used to generate hydro-electricity when water is released through a dam.' },
      { q: 'Explain how communities in inland Australia access groundwater.', marks: 3, tags: ['W3', 'W4'], criteria: ['Rain infiltrates soil/rock and is stored in aquifers (permeable rock) below the water table', 'The Great Artesian Basin is a huge aquifer under ~22% of Australia', 'People drill bores/wells and pump water up, often using windmills'], model: 'Rainwater soaks into the ground and is stored in aquifers, layers of permeable rock such as sandstone below the water table. Beneath much of eastern Australia lies the Great Artesian Basin, the world\'s largest underground water supply, covering about 22% of the continent. Farmers and inland communities drill bores or wells into the aquifer and pump the water to the surface, often with windmills.' },
      { q: 'Explain the difference between orographic and convectional rainfall.', marks: 3, tags: ['W2b'], criteria: ['Both happen when moist air rises and cools, causing condensation', 'Orographic: air is forced to rise over mountains; dry rain shadow on the other side', 'Convectional: the ground heats air which rises quickly, causing heavy rain/thunderstorms'], model: 'All rain forms when moist air rises, cools and condenses. In orographic rainfall the air is forced to rise because mountains are in its way; it rains on the windward side and the far side is a dry rain shadow. In convectional rainfall the ground heats the air during the day, making it rise rapidly and condense high up, which produces heavy rain and thunderstorms.' },
    ],
  };

  const BANK = { maps: [mapQuestion, mapQuestion, scaleQ, climateQ], water: [waterDataQ, climateQ] };
  return { mapDeck, waterDeck, BANK, makeMap, mapQuestion };
})();
if (typeof module !== 'undefined') module.exports = G;
