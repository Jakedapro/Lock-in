/* ===== Lock In — question diagrams (SVG) ===== */
const V = (() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const F = 'font-family="JetBrains Mono, ui-monospace, monospace"';
  const wrap = (svg, max = 520) => `<div class="viz"><div class="viz-in" style="max-width:${max}px">${svg}</div></div>`;
  const ink = 'var(--chalk)', mute = 'var(--muted)', line = 'var(--line)';

  function spinner({ labels }) {
    const cx = 100, cy = 100, r = 80; let s = '';
    labels.forEach((l, i) => {
      const a0 = (i * 90 - 90) * Math.PI / 180, a1 = ((i + 1) * 90 - 90) * Math.PI / 180, am = (a0 + a1) / 2;
      s += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" fill="${['rgba(69,214,230,.25)', 'rgba(61,220,151,.2)', 'rgba(69,214,230,.12)', 'rgba(61,220,151,.1)'][i]}" stroke="var(--cyan)" stroke-width="2"/>`;
      s += `<text x="${cx + r * .6 * Math.cos(am)}" y="${cy + r * .6 * Math.sin(am) + 7}" text-anchor="middle" fill="${ink}" font-size="20" font-weight="700" ${F}>${l}</text>`;
    });
    s += `<path d="M${cx},${cy} L${cx + 30},${cy - 52}" stroke="${ink}" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="6" fill="${ink}"/>`;
    return wrap(`<svg viewBox="0 0 200 200" role="img" aria-label="Spinner with sectors ${labels.join(', ')}">${s}</svg>`, 220);
  }
  function venn({ A, B, a, b, c, n }) {
    return wrap(`<svg viewBox="0 0 340 190" role="img" aria-label="Venn diagram">
      <rect x="2" y="2" width="336" height="186" rx="12" fill="none" stroke="${line}" stroke-width="1.5"/>
      <circle cx="135" cy="100" r="68" fill="rgba(255,107,90,.16)" stroke="var(--coral)" stroke-width="2"/>
      <circle cx="210" cy="100" r="68" fill="rgba(69,214,230,.14)" stroke="var(--cyan)" stroke-width="2"/>
      <text x="92" y="38" fill="var(--coral)" font-size="13" ${F}>${esc(A)}</text><text x="214" y="38" fill="var(--cyan)" font-size="13" ${F}>${esc(B)}</text>
      <text x="108" y="108" fill="${ink}" font-size="22" font-weight="700" text-anchor="middle" ${F}>${a}</text>
      <text x="172" y="108" fill="${ink}" font-size="22" font-weight="700" text-anchor="middle" ${F}>${c}</text>
      <text x="238" y="108" fill="${ink}" font-size="22" font-weight="700" text-anchor="middle" ${F}>${b}</text>
      <text x="22" y="176" fill="${ink}" font-size="18" font-weight="700" ${F}>${n}</text></svg>`, 360);
  }
  function table({ head, rows, cap }) {
    return `<div class="viz"><div class="tbl"><table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>${cap ? `<div class="viz-cap">${esc(cap)}</div>` : ''}</div>`;
  }
  function diceGrid() {
    let h = '<tr><th>+</th>' + [1, 2, 3, 4, 5, 6].map(i => `<th>${i}</th>`).join('') + '</tr>';
    for (let r = 1; r <= 6; r++) h += `<tr><th>${r}</th>${[1, 2, 3, 4, 5, 6].map(c => `<td>${r + c}</td>`).join('')}</tr>`;
    return `<div class="viz"><div class="tbl"><table class="dice"><tbody>${h}</tbody></table></div><div class="viz-cap">All 36 outcomes for the sum of two dice</div></div>`;
  }
  function travel({ pts, labels }) {
    const W = 460, H = 260, L = 50, B = 36, T = 14, R = 14;
    const tMax = Math.ceil(pts[pts.length - 1][0] * 2) / 2, dMax = Math.ceil(Math.max(...pts.map(p => p[1])) / 20) * 20 || 20;
    const X = (t) => L + t / tMax * (W - L - R), Y = (d) => H - B - d / dMax * (H - B - T);
    let g = '';
    for (let t = 0; t <= tMax + 1e-9; t += 0.5) g += `<line x1="${X(t)}" y1="${T}" x2="${X(t)}" y2="${H - B}" stroke="${line}" stroke-width="${t % 1 ? .5 : 1}"/>` + (t % 1 ? '' : `<text x="${X(t)}" y="${H - B + 16}" fill="${mute}" font-size="11" text-anchor="middle" ${F}>${((8 + t - 1) % 12) + 1}${8 + t >= 12 ? 'pm' : 'am'}</text>`);
    const step = dMax <= 100 ? 20 : 40;
    for (let d = 0; d <= dMax; d += step) g += `<line x1="${L}" y1="${Y(d)}" x2="${W - R}" y2="${Y(d)}" stroke="${line}" stroke-width="1"/><text x="${L - 6}" y="${Y(d) + 4}" fill="${mute}" font-size="11" text-anchor="end" ${F}>${d}</text>`;
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])},${Y(p[1])}`).join(' ');
    const lab = labels.map((l, i) => { const a = pts[i], b = pts[i + 1]; return `<text x="${(X(a[0]) + X(b[0])) / 2 - 6}" y="${(Y(a[1]) + Y(b[1])) / 2 - 8}" fill="var(--gold)" font-size="14" font-weight="700" ${F}>${l}</text>`; }).join('');
    return wrap(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Travel graph">${g}<path d="${path}" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linejoin="round"/>${pts.map(p => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3.5" fill="var(--gold)"/>`).join('')}${lab}
      <text x="12" y="${(H - B) / 2}" fill="${mute}" font-size="11" transform="rotate(-90 12 ${(H - B) / 2})" text-anchor="middle" ${F}>Distance from home (km)</text><text x="${(W + L) / 2}" y="${H - 4}" fill="${mute}" font-size="11" text-anchor="middle" ${F}>Time</text></svg>`, 500);
  }
  function rects({ a, b }) {
    const s = 160 / Math.max(a[0], a[1], b[0], b[1]);
    return wrap(`<svg viewBox="0 0 380 200" role="img" aria-label="Two rectangles">
      <rect x="20" y="${180 - a[1] * s}" width="${a[0] * s}" height="${a[1] * s}" fill="rgba(255,79,154,.15)" stroke="var(--pink)" stroke-width="2"/><text x="${20 + a[0] * s / 2}" y="196" fill="${ink}" font-size="12" text-anchor="middle" ${F}>P</text>
      <rect x="${200}" y="${180 - b[1] * s}" width="${b[0] * s}" height="${b[1] * s}" fill="rgba(255,79,154,.08)" stroke="var(--pink)" stroke-width="2"/><text x="${200 + b[0] * s / 2}" y="196" fill="${ink}" font-size="12" text-anchor="middle" ${F}>Q</text></svg>`, 400);
  }
  function sim({ s, k }) {
    const [a, b] = s; const sc = 120 / Math.max(a, b) / Math.max(1, k);
    const t1 = [[20, 170], [20 + b * sc, 170], [20, 170 - a * sc]], t2 = [[200, 170], [200 + b * sc * k, 170], [200, 170 - a * sc * k]];
    const poly = (t, c) => `<polygon points="${t.map(p => p.join(',')).join(' ')}" fill="${c}" stroke="var(--pink)" stroke-width="2"/>`;
    const lab = (p, t) => `<text x="${p[0]}" y="${p[1]}" fill="${ink}" font-size="13" font-weight="700" ${F}>${t}</text>`;
    return wrap(`<svg viewBox="0 0 ${Math.max(380, 220 + b * sc * k)} 190" role="img" aria-label="Similar triangles ABC and DEF">${poly(t1, 'rgba(255,79,154,.15)')}${poly(t2, 'rgba(255,79,154,.08)')}
      ${lab([t1[2][0] - 14, t1[2][1] + 4], 'A')}${lab([t1[0][0] - 14, t1[0][1] + 14], 'B')}${lab([t1[1][0] + 4, t1[1][1] + 14], 'C')}
      ${lab([t2[2][0] - 14, t2[2][1] + 4], 'D')}${lab([t2[0][0] - 14, t2[0][1] + 14], 'E')}${lab([t2[1][0] + 4, t2[1][1] + 14], 'F')}
      <text x="4" y="${170 - a * sc / 2}" fill="${mute}" font-size="11" ${F}>${a}</text><text x="${20 + b * sc / 2}" y="186" fill="${mute}" font-size="11" text-anchor="middle" ${F}>${b}</text></svg>`, 460);
  }
  function box({ l, w, h }) {
    const s = 150 / Math.max(l + w * .5, h + w * .5), L = l * s, W = w * s * .5, H = h * s, x = 30, y = 30 + W;
    return wrap(`<svg viewBox="0 0 ${L + W + 90} ${H + W + 70}" role="img" aria-label="Rectangular prism">
      <path d="M${x},${y} h${L} v${H} h${-L} Z" fill="rgba(255,79,154,.14)" stroke="var(--pink)" stroke-width="2"/>
      <path d="M${x},${y} l${W},${-W} h${L} l${-W},${W} Z" fill="rgba(255,79,154,.24)" stroke="var(--pink)" stroke-width="2"/>
      <path d="M${x + L},${y} l${W},${-W} v${H} l${-W},${W} Z" fill="rgba(255,79,154,.08)" stroke="var(--pink)" stroke-width="2"/>
      <text x="${x + L / 2}" y="${y + H + 20}" fill="${ink}" font-size="13" text-anchor="middle" ${F}>${l} cm</text>
      <text x="${x + L + W + 8}" y="${y - W + H / 2}" fill="${ink}" font-size="13" ${F}>${h} cm</text>
      <text x="${x + L + W / 2 + 8}" y="${y + H - W / 2 + 14}" fill="${ink}" font-size="13" ${F}>${w} cm</text></svg>`, 320);
  }
  function tri({ a, b, c, L }) {
    const s = 120 / Math.max(a, b), A = a * s, Bb = b * s, D = Math.min(170, L * 9);
    return wrap(`<svg viewBox="0 0 ${Bb + D + 80} ${A + 90}" role="img" aria-label="Triangular prism">
      <path d="M20,${A + 40} h${Bb} l${D * .6},${-D * .35} h${-Bb} Z" fill="rgba(255,79,154,.08)" stroke="var(--pink)" stroke-width="2"/>
      <path d="M20,${A + 40} v${-A} l${D * .6},${-D * .35} v${A} Z" fill="rgba(255,79,154,.14)" stroke="var(--pink)" stroke-width="2"/>
      <path d="M20,${40} L${20 + Bb},${A + 40} l${D * .6},${-D * .35} L${20 + D * .6},${40 - D * .35} Z" fill="rgba(255,79,154,.2)" stroke="var(--pink)" stroke-width="2"/>
      <path d="M20,${A + 40} v${-A} L${20 + Bb},${A + 40} Z" fill="rgba(255,79,154,.28)" stroke="var(--pink)" stroke-width="2"/>
      <path d="M20,${A + 30} h10 v10" fill="none" stroke="${ink}"/>
      <text x="6" y="${40 + A / 2}" fill="${ink}" font-size="12" text-anchor="end" ${F}>${a}</text><text x="${20 + Bb / 2}" y="${A + 58}" fill="${ink}" font-size="12" text-anchor="middle" ${F}>${b}</text>
      <text x="${20 + Bb / 2 - 4}" y="${40 + A / 2 - 6}" fill="${ink}" font-size="12" ${F}>${c}</text><text x="${20 + Bb + D * .3 + 6}" y="${A + 40 - D * .17 + 14}" fill="${ink}" font-size="12" ${F}>${L} cm</text></svg>`, 360);
  }
  function cyl({ r, h }) {
    const R = 50, H = 120;
    return wrap(`<svg viewBox="0 0 200 200" role="img" aria-label="Cylinder">
      <path d="M40,40 v${H} a${R},16 0 0 0 ${2 * R},0 v${-H}" fill="rgba(255,79,154,.12)" stroke="var(--pink)" stroke-width="2"/>
      <ellipse cx="${40 + R}" cy="40" rx="${R}" ry="16" fill="rgba(255,79,154,.25)" stroke="var(--pink)" stroke-width="2"/>
      <line x1="${40 + R}" y1="40" x2="${40 + 2 * R}" y2="40" stroke="${ink}" stroke-dasharray="4 3"/><text x="${40 + R * 1.5}" y="34" fill="${ink}" font-size="12" text-anchor="middle" ${F}>${r} cm</text>
      <text x="${48 + 2 * R}" y="${40 + H / 2}" fill="${ink}" font-size="12" ${F}>${h} cm</text></svg>`, 220);
  }
  function climate({ rain, temp, M }) {
    const W = 470, H = 270, L = 44, R = 40, T = 26, B = 30, bw = (W - L - R) / 12;
    const Y1 = (mm) => H - B - mm / 400 * (H - B - T), Y2 = (c) => H - B - c / 40 * (H - B - T);
    let g = '';
    for (let mm = 0; mm <= 400; mm += 100) g += `<line x1="${L}" y1="${Y1(mm)}" x2="${W - R}" y2="${Y1(mm)}" stroke="${line}"/><text x="${L - 6}" y="${Y1(mm) + 4}" fill="var(--cyan)" font-size="10" text-anchor="end" ${F}>${mm}</text><text x="${W - R + 6}" y="${Y1(mm) + 4}" fill="var(--coral)" font-size="10" ${F}>${mm / 10}</text>`;
    rain.forEach((v, i) => g += `<rect x="${L + i * bw + 3}" y="${Y1(v)}" width="${bw - 6}" height="${Y1(0) - Y1(v)}" fill="var(--cyan)" opacity=".75"/><text x="${L + i * bw + bw / 2}" y="${H - 12}" fill="${mute}" font-size="10" text-anchor="middle" ${F}>${M[i]}</text>`);
    g += `<polyline points="${temp.map((t, i) => `${L + i * bw + bw / 2},${Y2(t)}`).join(' ')}" fill="none" stroke="var(--coral)" stroke-width="3"/>` + temp.map((t, i) => `<circle cx="${L + i * bw + bw / 2}" cy="${Y2(t)}" r="3" fill="var(--coral)"/>`).join('');
    g += `<text x="${L - 6}" y="12" fill="var(--cyan)" font-size="10" text-anchor="end" ${F}>mm</text><text x="${W - R + 6}" y="12" fill="var(--coral)" font-size="10" ${F}>°C</text>`;
    return wrap(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Climate graph">${g}</svg><div class="viz-cap"><span style="color:var(--cyan)">■ rainfall (mm, left)</span> &nbsp; <span style="color:var(--coral)">● temperature (°C, right)</span></div>`, 520);
  }
  function pie({ data }) {
    const cols = ['var(--green)', 'var(--cyan)', 'var(--lilac)', 'var(--gold)', 'var(--coral)', 'var(--pink)', 'var(--muted)'];
    let a = -Math.PI / 2, s = ''; const cx = 90, cy = 90, r = 80;
    data.forEach(([, v], i) => { const a2 = a + v / 100 * Math.PI * 2; s += `<path d="M${cx},${cy} L${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} A${r},${r} 0 ${a2 - a > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a2)},${cy + r * Math.sin(a2)} Z" fill="${cols[i]}" stroke="var(--ink)" stroke-width="2"/>`; a = a2; });
    const leg = data.map(([k, v], i) => `<g transform="translate(190 ${16 + i * 22})"><rect width="12" height="12" rx="2" fill="${cols[i]}"/><text x="18" y="11" fill="${ink}" font-size="12" ${F}>${esc(k)} ${v}%</text></g>`).join('');
    return wrap(`<svg viewBox="0 0 420 180" role="img" aria-label="Pie chart of Australia's water use">${s}${leg}</svg>`, 460);
  }

  /* ---------- topographic map ---------- */
  function topo({ map: m }) {
    const S = 70, L = 34, T = 40, N = m.size, W = L + N * S + 10, Hh = T + N * S + 34;
    const X = (x) => L + x * S, Y = (y) => T + (N - y) * S;
    const paper = '#eef1e3', grid = '#5a7fb0', brown = '#9a5a2a', blue = '#2f7bd6', black = '#22252b', green = '#6fb36a';
    let s = `<defs><clipPath id="clipm"><rect x="${L}" y="${T}" width="${N * S}" height="${N * S}"/></clipPath>
      <pattern id="trees" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#cfe7c6"/><circle cx="5" cy="5" r="2.2" fill="${green}"/></pattern></defs>`;
    s += `<rect x="0" y="0" width="${W}" height="${Hh + 96}" rx="10" fill="${paper}"/>`;
    s += `<text x="${L}" y="22" fill="${black}" font-size="14" font-weight="800" ${F}>TOPOGRAPHIC MAP · RIDGEVALE (fictional)</text>`;
    s += `<g clip-path="url(#clipm)">`;
    s += `<rect x="${X(m.forest.x)}" y="${Y(m.forest.y + m.forest.h)}" width="${m.forest.w * S}" height="${m.forest.h * S}" fill="url(#trees)" opacity=".9"/>`;
    m.contours.forEach((c, i) => { s += `<circle cx="${X(c.cx)}" cy="${Y(c.cy)}" r="${c.r * S}" fill="none" stroke="${brown}" stroke-width="${i % 5 === 0 ? 1.8 : 1.1}"/>`; });
    m.contours.forEach((c) => { const lx = X(c.cx), ly = Y(c.cy) + c.r * S; s += `<rect x="${lx - 15}" y="${ly - 7}" width="30" height="12" fill="${paper}"/><text x="${lx}" y="${ly + 3}" fill="${brown}" font-size="9.5" text-anchor="middle" ${F}>${c.h}</text>`; });
    const rp = m.river.map(p => [X(p[0]), Y(p[1])]);
    s += `<path d="M${rp[0]} ${rp.slice(1).map((p, i) => i < rp.length - 2 ? `Q${p} ${(p[0] + rp[i + 2][0]) / 2},${(p[1] + rp[i + 2][1]) / 2}` : `L${p}`).join(' ')}" fill="none" stroke="${blue}" stroke-width="3" stroke-linecap="round"/>`;
    s += `</g>`;
    for (let i = 0; i <= N; i++) {
      s += `<line x1="${X(i)}" y1="${T}" x2="${X(i)}" y2="${T + N * S}" stroke="${grid}" stroke-width="1"/><line x1="${L}" y1="${Y(i)}" x2="${L + N * S}" y2="${Y(i)}" stroke="${grid}" stroke-width="1"/>`;
      s += `<text x="${X(i)}" y="${T + N * S + 15}" fill="${grid}" font-size="11" font-weight="700" text-anchor="middle" ${F}>${String(m.E0 + i).padStart(2, '0')}</text>`;
      s += `<text x="${L - 6}" y="${Y(i) + 4}" fill="${grid}" font-size="11" font-weight="700" text-anchor="end" ${F}>${String(m.N0 + i).padStart(2, '0')}</text>`;
    }
    s += `<rect x="${L}" y="${T}" width="${N * S}" height="${N * S}" fill="none" stroke="${black}" stroke-width="2.5"/>`;
    // summit
    s += `<path d="M${X(m.peak.x)},${Y(m.peak.y) - 7} l6,10 h-12 Z" fill="${black}"/><text x="${X(m.peak.x) + 8}" y="${Y(m.peak.y) + 3}" fill="${black}" font-size="10.5" font-weight="700" ${F}>${m.peak.h}</text>`;
    const sym = {
      church: (x, y) => `<circle cx="${x}" cy="${y + 2}" r="3.5" fill="${black}"/><path d="M${x},${y - 9} v9 M${x - 3.5},${y - 6} h7" stroke="${black}" stroke-width="1.8"/>`,
      school: (x, y) => `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${black}"/><path d="M${x},${y - 4} v-8 l7,2.5 -7,2.5" fill="#d33" stroke="${black}" stroke-width="1"/>`,
      homestead: (x, y) => `<rect x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" fill="none" stroke="${black}" stroke-width="2"/><rect x="${x - 1.5}" y="${y - 1.5}" width="3" height="3" fill="${black}"/>`,
      mine: (x, y) => `<path d="M${x - 6},${y - 6} L${x + 6},${y + 6} M${x + 6},${y - 6} L${x - 6},${y + 6}" stroke="${black}" stroke-width="2.4"/>`,
      lookout: (x, y) => `<path d="M${x},${y - 8} l2.4,5.5 6,.5 -4.6,4 1.4,5.8 -5.2,-3.1 -5.2,3.1 1.4,-5.8 -4.6,-4 6,-.5 Z" fill="${black}"/>`,
      windmill: (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${blue}" stroke-width="2"/><path d="M${x - 5},${y - 5} L${x + 5},${y + 5} M${x + 5},${y - 5} L${x - 5},${y + 5}" stroke="${blue}" stroke-width="1.6"/>`,
      campground: (x, y) => `<path d="M${x - 7},${y + 5} L${x},${y - 7} L${x + 7},${y + 5} Z" fill="none" stroke="${black}" stroke-width="2"/><path d="M${x},${y - 7} v12" stroke="${black}"/>`,
    };
    m.feats.forEach(f => { s += sym[f.key](X(f.x), Y(f.y)); });
    // orientation + scale
    const nx = W - 30, ny = T + 24;
    s += `<g><path d="M${nx},${ny - 18} l8,22 -8,-6 -8,6 Z" fill="${black}"/><text x="${nx}" y="${ny + 18}" fill="${black}" font-size="12" font-weight="800" text-anchor="middle" ${F}>N</text></g>`;
    const ly = T + N * S + 34;
    s += `<g transform="translate(${L} ${ly})"><text y="0" fill="${black}" font-size="10.5" font-weight="700" ${F}>Scale 1:${m.scale.toLocaleString('en-AU')}  ·  grid squares = 1 km  ·  contour interval ${m.ci} m</text>
      <rect y="8" width="${S}" height="6" fill="${black}"/><rect x="${S}" y="8" width="${S}" height="6" fill="none" stroke="${black}"/><text y="28" fill="${black}" font-size="10" ${F}>0</text><text x="${S}" y="28" fill="${black}" font-size="10" text-anchor="middle" ${F}>1</text><text x="${2 * S}" y="28" fill="${black}" font-size="10" text-anchor="middle" ${F}>2 km</text></g>`;
    // legend
    const leg = [['church', 'Church'], ['school', 'School'], ['homestead', 'Homestead'], ['mine', 'Mine'], ['lookout', 'Lookout'], ['windmill', 'Windmill'], ['campground', 'Camping ground']].filter(([k]) => m.feats.some(f => f.key === k));
    let lg = `<text x="0" y="0" fill="${black}" font-size="10.5" font-weight="800" ${F}>LEGEND</text>`;
    const items = [...leg.map(([k, n]) => [sym[k], n]), [(x, y) => `<path d="M${x - 8},${y} q4,-5 8,0 t8,0" fill="none" stroke="${blue}" stroke-width="2.5"/>`, 'River'], [(x, y) => `<rect x="${x - 7}" y="${y - 5}" width="14" height="10" fill="url(#trees)"/>`, 'Forest'], [(x, y) => `<path d="M${x - 8},${y} h16" stroke="${brown}" stroke-width="1.5"/>`, 'Contour (m)'], [(x, y) => `<path d="M${x},${y - 6} l6,10 h-12 Z" fill="${black}"/>`, 'Spot height (m)']];
    items.forEach(([f, n], i) => { const cx = (i % 3) * 140 + 10, cy = 20 + Math.floor(i / 3) * 20; lg += f(cx, cy - 4) + `<text x="${cx + 14}" y="${cy}" fill="${black}" font-size="10.5" ${F}>${n}</text>`; });
    s += `<g transform="translate(${L} ${ly + 48})">${lg}</g>`;
    const totalH = ly + 48 + 20 + Math.ceil(items.length / 3) * 20 + 4;
    s = s.replace(`height="${Hh + 96}"`, `height="${totalH}"`);
    return `<div class="viz"><div class="viz-in topo" style="max-width:560px"><svg viewBox="0 0 ${W} ${totalH}" role="img" aria-label="Topographic map with grid, contours, river and features">${s}</svg></div></div>`;
  }

  function dotplot({ from, counts, label }) {
    const W = 420, H = 60 + Math.max(...counts) * 22, L = 30, step = (W - 2 * L) / (counts.length - 1), base = H - 34;
    let s = `<line x1="${L - 10}" y1="${base}" x2="${W - L + 10}" y2="${base}" stroke="${ink}" stroke-width="1.5"/>`;
    counts.forEach((c, i) => {
      const x = L + i * step;
      s += `<line x1="${x}" y1="${base}" x2="${x}" y2="${base + 6}" stroke="${ink}"/><text x="${x}" y="${base + 20}" fill="${mute}" font-size="12" text-anchor="middle" ${F}>${from + i}</text>`;
      for (let k = 0; k < c; k++) s += `<circle cx="${x}" cy="${base - 12 - k * 22}" r="8" fill="var(--green)"/>`;
    });
    return wrap(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dot plot">${s}</svg><div class="viz-cap">${esc(label || '')}</div>`, 440);
  }


  /* ---------- science graphs: x–y line/scatter graph and Sankey (energy flow) diagram ---------- */
  const niceMax = (v) => { if (v <= 0) return 1; const e = 10 ** Math.floor(Math.log10(v)); for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * e >= v) return m * e; return 10 * e; };
  const tickStep = (max) => { const raw = max / 5, e = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 2.5, 5, 10].map(m => m * e).find(s => s >= raw); };
  // pts: [[x, y], …]; join: dot-to-dot line (changes over time); fit: [[x0, y0], [x1, y1]] line of best fit.
  function xy({ pts, xl, yl, title, join, fit, xmax, ymax, cap }) {
    const W = 470, H = 290, L = 58, R = 16, T = title ? 30 : 14, B = 46;
    const xm = xmax || niceMax(Math.max(...pts.map(p => p[0]))), ym = ymax || niceMax(Math.max(...pts.map(p => p[1])) * 1.1);
    const X = (x) => L + x / xm * (W - L - R), Y = (y) => H - B - y / ym * (H - B - T);
    let g = title ? `<text x="${(W + L) / 2}" y="18" fill="${ink}" font-size="13" font-weight="700" text-anchor="middle" ${F}>${esc(title)}</text>` : '';
    const xs = tickStep(xm), ys = tickStep(ym), r = (v) => Math.round(v * 1000) / 1000;
    for (let x = 0; x <= xm + 1e-9; x += xs) g += `<line x1="${X(x)}" y1="${T}" x2="${X(x)}" y2="${H - B}" stroke="${line}"/><text x="${X(x)}" y="${H - B + 16}" fill="${mute}" font-size="11" text-anchor="middle" ${F}>${r(x)}</text>`;
    for (let y = 0; y <= ym + 1e-9; y += ys) g += `<line x1="${L}" y1="${Y(y)}" x2="${W - R}" y2="${Y(y)}" stroke="${line}"/><text x="${L - 6}" y="${Y(y) + 4}" fill="${mute}" font-size="11" text-anchor="end" ${F}>${r(y)}</text>`;
    g += `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="${ink}" stroke-width="1.5"/><line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" stroke="${ink}" stroke-width="1.5"/>`;
    if (join) g += `<polyline points="${pts.map(p => `${X(p[0])},${Y(p[1])}`).join(' ')}" fill="none" stroke="var(--cyan)" stroke-width="2.5"/>`;
    if (fit) g += `<line x1="${X(fit[0][0])}" y1="${Y(fit[0][1])}" x2="${X(fit[1][0])}" y2="${Y(fit[1][1])}" stroke="var(--cyan)" stroke-width="2" stroke-dasharray="6 4"/>`;
    g += pts.map(p => `<path d="M${X(p[0]) - 5},${Y(p[1]) - 5} l10,10 M${X(p[0]) + 5},${Y(p[1]) - 5} l-10,10" stroke="${ink}" stroke-width="2"/>`).join('');
    g += `<text x="${(W + L) / 2}" y="${H - 8}" fill="${ink}" font-size="12" text-anchor="middle" ${F}>${esc(xl)}</text>`;
    g += `<text x="14" y="${(H - B + T) / 2}" fill="${ink}" font-size="12" text-anchor="middle" transform="rotate(-90 14 ${(H - B + T) / 2})" ${F}>${esc(yl)}</text>`;
    return wrap(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title || `Graph of ${yl} against ${xl}`)}">${g}</svg>${cap ? `<div class="viz-cap">${esc(cap)}</div>` : ''}`, 500);
  }
  // input: [label, value]; out: [[label, value, useful?], …]. Band widths are proportional to energy.
  function sankey({ input, out, unit = 'J' }) {
    const total = input[1], k = 110 / total, x0 = 150, xs = 250, top = 40, W = 520;
    const useful = out.filter(o => o[2]), waste = out.filter(o => !o[2]), sum = (a) => a.reduce((t, o) => t + o[1], 0);
    const txt = (x, y, t, a, c) => `<text x="${x}" y="${y}" fill="${c}" font-size="12" font-weight="700" text-anchor="${a}" ${F}>${esc(t)}</text>`;
    let g = `<rect x="${x0}" y="${top}" width="${xs - x0}" height="${total * k}" fill="var(--gold)" opacity=".55"/>` + txt(x0 - 6, top + total * k / 2 + 4, `${input[0]} ${input[1]} ${unit}`, 'end', ink);
    let y = top;
    useful.forEach(([lab, v]) => {
      const h = v * k;
      g += `<path d="M${xs},${y} H${W - 40} V${y - 5} L${W - 22},${y + h / 2} L${W - 40},${y + h + 5} V${y + h} H${xs} Z" fill="var(--green)" opacity=".7"/>` + txt(W - 40, y - 9, `${lab} ${v} ${unit}`, 'end', 'var(--green)');
      y += h;
    });
    // Wasted bands sit under the useful ones and turn downwards; the lowest band turns first so none cross.
    const bottom = top + total * k + 34; let cx = xs + 12;
    for (let j = waste.length - 1; j >= 0; j--) {
      const [lab, v] = waste[j], h = v * k, yb = top + (sum(useful) + sum(waste.slice(0, j))) * k;
      g += `<path d="M${xs},${yb} H${cx + h} V${bottom} H${cx + h + 5} L${cx + h / 2},${bottom + 14} L${cx - 5},${bottom} H${cx} V${yb + h} H${xs} Z" fill="var(--coral)" opacity=".65"/>`;
      g += txt(cx + h / 2, bottom + 30, `${lab} ${v} ${unit}`, 'middle', 'var(--coral)');
      cx += h + 110;
    }
    const Wf = Math.max(W, cx), Hh = bottom + 42;
    return wrap(`<svg viewBox="0 0 ${Wf} ${Hh}" role="img" aria-label="Sankey diagram: ${esc(input[0])} ${input[1]} ${unit} in; ${out.map(o => `${esc(o[0])} ${o[1]} ${unit}`).join(', ')}">${g}</svg><div class="viz-cap"><span style="color:var(--green)">■ useful energy</span> &nbsp; <span style="color:var(--coral)">■ wasted energy</span></div>`, 540);
  }

  const R = { xy, sankey, dotplot, spinner, venn, table, diceGrid, travel, rects, sim, box, tri, cyl, climate, pie, topo };
  return { render: (v) => (v && R[v.type] ? R[v.type](v) : '') };
})();
