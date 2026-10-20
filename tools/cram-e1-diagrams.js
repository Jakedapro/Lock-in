// ---------- Pictures to remember: diagrams drawn from the real formulas ----------
const col = (c) => (c === 'ink' ? 'var(--ink)' : c === 'mute' ? 'var(--ink-3)' : `var(--${c})`);
const n1 = (v) => Math.round(v * 10) / 10;
const rad = (d) => d * Math.PI / 180;
const L = (x1, y1, x2, y2, c = 'ink', w = 2, dash = false) => `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="${col(c)}" stroke-width="${w}"${dash ? ' stroke-dasharray="5 4"' : ''} stroke-linecap="round"/>`;
const A = (x1, y1, x2, y2, c = 'ink', w = 2, dash = false) => { // line with an arrowhead at (x2,y2)
  const a = Math.atan2(y2 - y1, x2 - x1), h = 9, bx = x2 - h * Math.cos(a), by = y2 - h * Math.sin(a), p = 4.2;
  return L(x1, y1, bx, by, c, w, dash) + `<polygon points="${n1(x2)},${n1(y2)} ${n1(bx + p * Math.sin(a))},${n1(by - p * Math.cos(a))} ${n1(bx - p * Math.sin(a))},${n1(by + p * Math.cos(a))}" fill="${col(c)}"/>`;
};
const DA = (x1, y1, x2, y2, c = 'mute', w = 1.6) => A(x1, y1, x2, y2, c, w) + A(x2, y2, x1, y1, c, w); // double arrow
const T = (x, y, s, o = {}) => `<text x="${n1(x)}" y="${n1(y)}" fill="${col(o.c || 'ink')}" font-size="${o.size || 13}" text-anchor="${o.a || 'start'}"${o.b ? ' font-weight="700"' : ''}${o.i ? ' font-style="italic"' : ''}>${esc(s)}</text>`;
const P = (x, y, c = 'pen', r = 4, open = false) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${open ? 'var(--sheet)' : col(c)}" stroke="${col(c)}" stroke-width="2"/>`;
const Ci = (x, y, r, c = 'mute', w = 1.6, fill = false) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${fill ? col(c) : 'none'}" fill-opacity="${fill ? .13 : 1}" stroke="${col(c)}" stroke-width="${w}"/>`;
const Arc = (cx, cy, r, a0, a1, c = 'ink', w = 1.6) => { const p = (a) => `${n1(cx + r * Math.cos(rad(a)))} ${n1(cy - r * Math.sin(rad(a)))}`; return `<path d="M ${p(a0)} A ${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 0 ${p(a1)}" fill="none" stroke="${col(c)}" stroke-width="${w}"/>`; };
const Poly = (pts, c = 'pen', w = 2.5, close = false) => `<${close ? 'polygon' : 'polyline'} points="${pts.map(p => `${n1(p[0])},${n1(p[1])}`).join(' ')}" fill="none" stroke="${col(c)}" stroke-width="${w}" stroke-linejoin="round"/>`;
const svg = (w, h, inner, label) => `<svg class="dg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" font-family="var(--f)">${inner}</svg>`;
const hflow = (steps) => `<div class="flow">${steps.map(s => `<div class="fbox">${fm(s)}</div>`).join('')}</div>`;
const table = (head, rows) => `<div class="tbl"><table><thead><tr>${head.map(h => `<th>${fm(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${fm(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const AX = (ox, oy, xr, yt, yb, lx = 'x', ly = 'y') => A(ox - 12, oy, xr, oy, 'mute', 1.5) + A(ox, yb, ox, yt, 'mute', 1.5) + T(xr - 2, oy + 16, lx, { c: 'mute', a: 'end', i: 1 }) + T(ox + 7, yt + 10, ly, { c: 'mute', i: 1 });
const RA = (px, py, ux, uy, vx, vy, s = 8) => Poly([[px + s * ux, py + s * uy], [px + s * ux + s * vx, py + s * uy + s * vy], [px + s * vx, py + s * vy]], 'ink', 1.4);
const unit = (x1, y1, x2, y2) => { const d = Math.hypot(x2 - x1, y2 - y1); return [(x2 - x1) / d, (y2 - y1) / d]; };
const curve = (f, a, b, mx, my, n = 90) => { const p = []; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = f(x); if (isFinite(y)) p.push([mx(x), my(y)]); } return p; };
const area = (pts, c = 'pen', op = .18) => `<polygon points="${pts.map(p => `${n1(p[0])},${n1(p[1])}`).join(' ')}" fill="${col(c)}" fill-opacity="${op}" stroke="none"/>`;
const Rect = (x, y, w, h, c = 'mute', w2 = 1.6, fill = false) => `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="3" fill="${fill ? col(c) : 'none'}" fill-opacity="${fill ? .13 : 1}" stroke="${col(c)}" stroke-width="${w2}"/>`;
const Ell = (cx, cy, rx, ry, c = 'pen', w = 1.8, fill = false) => `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${fill ? col(c) : 'none'}" fill-opacity="${fill ? .12 : 1}" stroke="${col(c)}" stroke-width="${w}"/>`;
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };

const DIAGRAMS = {
  de: [
    { t: 'Cooling towards the room temperature', cap: '$T=T_s+Ae^{-kt}$ with $A=T_0-T_s$. The curve falls steeply at first (rate $\\propto T-T_s$) and levels off at the **asymptote** $T=T_s$. It never goes below $T_s$.',
      svg: () => { const mx = t => 50 + t * 34, my = T0 => 180 - T0 * 1.6; return svg(340, 215, AX(50, 180, 322, 14, 200, 't', 'T') + L(50, my(20), 322, my(20), 'warn', 1.6, true) + T(318, my(20) - 6, 'T = Tₛ (limit)', { c: 'warn', a: 'end', b: 1, size: 12 }) + Poly(curve(t => 20 + 70 * Math.exp(-0.3 * t), 0, 8.3, mx, my), 'pen', 2.8) + P(50, my(90)) + T(58, my(90) - 4, 'T₀ at t = 0', { size: 12 }) + T(190, my(52), 'steep, then flat', { c: 'mute', size: 12 }) + T(190, my(52) + 16, 'dT/dt = −k(T − Tₛ)', { c: 'pen', b: 1, size: 12 }), 'Exponential cooling curve with horizontal asymptote'); } },
    { t: 'Logistic growth: S-curve and its rate', cap: '$\\dfrac{dP}{dt}=kP\\left(1-\\dfrac PC\\right)$. Left: $P$ rises from $P_0$ to the **carrying capacity** $C$, with an inflection at $P=\\frac C2$. Right: the rate against $P$ is a parabola, zero at $0$ and $C$, **largest** ($\\frac{kC}4$) at $P=\\frac C2$.',
      svg: () => { const C = 150, f = t => C / (1 + 9 * Math.exp(-0.8 * t)); const ti = Math.log(9) / 0.8; return svg(480, 225, AX(40, 190, 235, 14, 205, 't', 'P') + L(40, 190 - C, 230, 190 - C, 'warn', 1.5, true) + T(44, 190 - C - 6, 'C', { c: 'warn', b: 1 }) + L(40, 190 - C / 2, 40 + ti * 27, 190 - C / 2, 'mute', 1.2, true) + T(44, 190 - C / 2 - 6, 'C/2', { c: 'mute', size: 12 }) + Poly(curve(f, 0, 7, t => 40 + t * 27, p => 190 - p), 'pen', 2.8) + P(40 + ti * 27, 190 - C / 2, 'ok', 4.5) + T(40 + ti * 27 + 8, 190 - C / 2 + 16, 'inflection', { c: 'ok', size: 12, b: 1 }) + P(40, 190 - f(0), 'pen', 3.5) + T(48, 190 - f(0) - 6, 'P₀', { size: 12 }) +
        AX(290, 190, 470, 14, 205, 'P', 'dP/dt') + Poly(curve(u => 4 * u * (1 - u), 0, 1, u => 290 + u * 150, r => 190 - r * 130), 'pen', 2.8) + L(365, 190, 365, 60, 'ok', 1.3, true) + P(365, 60, 'ok', 4.5) + T(372, 56, 'kC/4', { c: 'ok', b: 1 }) + T(365, 205, 'C/2', { a: 'middle', c: 'mute', size: 12 }) + T(440, 205, 'C', { a: 'middle', c: 'mute', size: 12 }), 'Logistic S-curve and parabola of growth rate'); } },
    { t: 'Direction field for dy/dx = x − y', cap: 'At each grid point draw a short segment with slope $x-y$. Segments are **flat** on the isocline $y=x$ (red), and the line $y=x-1$ (blue) is a solution: its slope $1$ matches $x-y=1$. Solutions follow the segments and **never cross**.',
      svg: () => { let g = ''; for (let x = 0; x <= 5; x++) for (let y = -1; y <= 3; y++) { const m = x - y, a = Math.atan(m * 40 / 52), px = 40 + x * 52, py = 190 - (y + 1) * 40; g += L(px - 11 * Math.cos(a), py + 11 * Math.sin(a), px + 11 * Math.cos(a), py - 11 * Math.sin(a), 'mute', 1.8); } return svg(340, 225, AX(26, 190, 328, 14, 215, 'x', 'y') + g + Poly([[40, 190], [40 + 4 * 52, 190 - 4 * 40]], 'pen', 2.8) + L(40, 190 - 40, 40 + 3.8 * 52, 190 - (3.8 + 1) * 40, 'warn', 2, true) + T(256, 40, 'y = x − 1', { c: 'pen', b: 1, size: 12 }) + T(240, 78, 'y = x (slope 0)', { c: 'warn', b: 1, size: 12 }), 'Direction field with a solution line and an isocline'); } },
    { t: 'Related rates: water in a cone', cap: 'Two variables ($r$, $h$): use **similar triangles** first, here $r=\\frac h2$, so $V=\\frac13\\pi r^2h=\\frac{\\pi h^3}{12}$ and $\\frac{dV}{dt}=\\frac{\\pi h^2}{4}\\cdot\\frac{dh}{dt}$.',
      svg: () => svg(330, 230, area([[70, 40], [230, 40], [150, 205]], 'mute', .06) + area([[105, 110], [195, 110], [150, 205]], 'pen', .3) + Poly([[70, 40], [150, 205], [230, 40]], 'ink', 2.2) + Ell(150, 40, 80, 8, 'ink', 1.6) + Ell(150, 110, 45, 5, 'pen', 2) + DA(256, 110, 256, 205, 'warn') + T(264, 162, 'h', { c: 'warn', b: 1 }) + A(150, 110, 195, 110, 'ok', 2) + T(165, 102, 'r', { c: 'ok', b: 1 }) + T(12, 72, 'top radius 4', { size: 12, c: 'mute' }) + T(12, 88, 'height 8', { size: 12, c: 'mute' }) + T(150, 226, 'r = h/2,  V = πh³/12', { a: 'middle', b: 1 }), 'Inverted cone partly filled with water') },
  ],
  calc: [
    { t: 'Inverse trig: spot the form', cap: 'Factor the quadratic or constant so the integrand matches exactly. For $\\frac1{\\sqrt{9-4x^2}}$ write $\\frac{1}{2\\sqrt{\\frac94-x^2}}$, so $a=\\frac32$.',
      html: () => table(['You see', 'Result'], [['$\\dfrac1{a^2+x^2}$', '$\\dfrac1a\\tan^{-1}\\dfrac xa+c$'], ['$\\dfrac1{\\sqrt{a^2-x^2}}$', '$\\sin^{-1}\\dfrac xa+c$'], ['$\\dfrac{d}{dx}\\tan^{-1}f(x)$', '$\\dfrac{f\'(x)}{1+f(x)^2}$'], ['$\\dfrac{d}{dx}\\sin^{-1}f(x)$', '$\\dfrac{f\'(x)}{\\sqrt{1-f(x)^2}}$'], ['$\\dfrac{d}{dx}\\cos^{-1}f(x)$', '$-\\dfrac{f\'(x)}{\\sqrt{1-f(x)^2}}$'], ['$x^2+bx+c$ in the bottom', 'complete the square first']]) },
    { t: 'Substitution recipe', cap: 'Everything changes: the integrand, $dx$ **and the limits**. Leftover $x$ is replaced using the substitution.',
      html: () => hflow(['**1. Choose $u$** (inside a power, the denominator, $e^x$, $\\cos x$, $\\tan x$, or $x+a$).', '**2. Differentiate:** $du=g\'(x)\\,dx$. Solve for leftover $x$ if needed.', '**3. Limits:** $x=a\\to u=g(a)$, $x=b\\to u=g(b)$.', '**4. Integrate in $u$,** substitute the new limits, simplify exactly.']) },
    { t: 'Volume about the x-axis', cap: '$V=\\pi\\displaystyle\\int_a^by^2\\,dx$. Each thin disc has radius $y$. Shown: $y=\\sqrt x$ on $[0,4]$, giving $V=\\pi\\int_0^4x\\,dx=8\\pi$.',
      svg: () => { const mx = x => 40 + x * 60, my = y => 105 - y * 40; return svg(340, 210, AX(40, 105, 326, 10, 200, 'x', 'y') + Poly(curve(Math.sqrt, 0, 4, mx, my), 'pen', 2.8) + Poly(curve(x => -Math.sqrt(x), 0, 4, mx, my), 'pen', 1.8) + Ell(mx(4), 105, 12, 80, 'pen', 1.8, true) + L(mx(2), my(Math.SQRT2), mx(2), my(-Math.SQRT2), 'warn', 2.2) + T(mx(2) + 6, 98, 'disc, radius y', { c: 'warn', size: 12, b: 1 }) + T(60, 32, 'y = √x', { c: 'pen', b: 1 }) + T(170, 196, 'V = π∫ y² dx', { a: 'middle', b: 1 }), 'Solid formed by rotating y equals root x about the x axis'); } },
    { t: 'Volume about the y-axis', cap: '$V=\\pi\\displaystyle\\int_c^dx^2\\,dy$ with **$y$-limits** and $x$ written in terms of $y$. Shown: $y=x^2$ up to $y=4$, so $x^2=y$ and $V=\\pi\\int_0^4y\\,dy=8\\pi$.',
      svg: () => { const mx = x => 150 + x * 40, my = y => 200 - y * 40; return svg(310, 225, AX(150, 200, 296, 24, 215, 'x', 'y') + Poly(curve(x => x * x, 0, 2, mx, my), 'pen', 2.8) + Poly(curve(x => x * x, -2, 0, mx, my), 'pen', 1.8) + Ell(150, my(4), 80, 11, 'pen', 1.8, true) + L(mx(-Math.SQRT2), my(2), mx(Math.SQRT2), my(2), 'warn', 2.2) + T(mx(Math.SQRT2) + 6, my(2) + 4, 'slice, radius x', { c: 'warn', size: 12, b: 1 }) + T(mx(2) + 6, my(4) + 4, 'y = 4', { c: 'mute', size: 12 }) + T(216, 60, 'y = x²', { c: 'pen', b: 1 }) + T(150, 222, 'V = π∫ x² dy', { a: 'middle', b: 1 }), 'Paraboloid formed by rotating y equals x squared about the y axis'); } },
    { t: 'Region between two curves', cap: 'Rotating the region between $y=x$ and $y=x^2$ about the $x$-axis leaves a hole. $V=\\pi\\int_0^1\\left(x^2-x^4\\right)dx$: **square each curve, then subtract**.',
      svg: () => { const mx = x => 50 + x * 200, my = y => 160 - y * 130; const top = curve(x => x, 0, 1, mx, my, 20), bot = curve(x => x * x, 0, 1, mx, my, 40).reverse(); return svg(320, 200, AX(40, 160, 306, 14, 190, 'x', 'y') + area([...top, ...bot], 'pen', .25) + Poly(top, 'pen', 2.6) + Poly(curve(x => x * x, 0, 1, mx, my), 'warn', 2.6) + T(mx(1) + 4, my(1) + 4, 'y = x', { c: 'pen', b: 1, size: 12 }) + T(mx(1) + 4, my(1) + 20, '(1, 1)', { c: 'mute', size: 12 }) + T(mx(.7), my(.49) + 24, 'y = x²', { c: 'warn', b: 1, size: 12 }) + T(160, 188, 'V = π∫(y₁² − y₂²) dx', { a: 'middle', b: 1 }), 'Region between a line and a parabola'); } },
  ],
  vec: [
    { t: 'Projection of a onto b', cap: '$\\operatorname{proj}_{\\mathbf b}\\mathbf a=\\dfrac{\\mathbf a\\cdot\\mathbf b}{|\\mathbf b|^2}\\mathbf b$ is the shadow of $\\mathbf a$ on the line of $\\mathbf b$. The leftover $\\mathbf a-\\operatorname{proj}$ is **perpendicular** to $\\mathbf b$ (dot product $0$) and is the shortest distance from the tip of $\\mathbf a$ to that line.',
      svg: () => svg(330, 215, A(40, 170, 270, 170, 'ok', 2.6) + T(274, 168, 'b', { c: 'ok', b: 1 }) + A(40, 170, 190, 70, 'pen', 2.6) + T(112, 100, 'a', { c: 'pen', b: 1 }) + L(190, 70, 190, 170, 'mute', 1.6, true) + A(40, 176, 188, 176, 'warn', 2.6) + T(100, 196, 'proj_b a', { c: 'warn', b: 1 }) + RA(190, 170, -1, 0, 0, -1) + T(198, 126, 'a − proj', { c: 'mute', size: 12 }) + Arc(40, 170, 40, 0, 33.7, 'ink') + T(86, 162, 'θ') + P(190, 70, 'pen', 3.5), 'Vector a, vector b and the projection of a onto b') },
    { t: 'Projectile motion', cap: '$\\ddot x=0$, $\\ddot y=-g$. $x=Vt\\cos\\theta$, $y=Vt\\sin\\theta-\\tfrac12gt^2$. At the top $\\dot y=0$ and only $\\dot x=V\\cos\\theta$ is left. Time to top $\\frac{V\\sin\\theta}g$, flight $\\frac{2V\\sin\\theta}g$, range $\\frac{V^2\\sin2\\theta}g$, height $\\frac{V^2\\sin^2\\theta}{2g}$.',
      svg: () => { const pts = []; for (let x = 0; x <= 280; x += 5) { const u = x / 280; pts.push([30 + x, 170 - 400 * u * (1 - u)]); } return svg(340, 205, L(20, 170, 322, 170, 'mute', 1.6) + Poly(pts, 'pen', 2.8) + A(30, 170, 30 + 62 * Math.cos(rad(55)), 170 - 62 * Math.sin(rad(55)), 'warn', 2.4) + Arc(30, 170, 34, 0, 55, 'ink') + T(70, 163, 'θ') + T(62, 124, 'V', { c: 'warn', b: 1 }) + L(170, 70, 170, 170, 'mute', 1.2, true) + DA(160, 70, 160, 170) + T(154, 124, 'H', { a: 'end', b: 1 }) + DA(30, 188, 310, 188) + T(170, 201, 'R = V² sin2θ / g', { a: 'middle', size: 12 }) + A(170, 70, 214, 70, 'ok', 2.2) + T(180, 60, 'ẏ = 0, ẋ = V cosθ', { size: 12, c: 'ok' }) + A(262, 100, 262, 140, 'warn', 2) + T(268, 124, 'g', { c: 'warn', b: 1 }), 'Projectile path with range and height'); } },
    { t: 'Angle in a semicircle (vector proof)', cap: 'With $\\overrightarrow{OA}=\\mathbf a$, $\\overrightarrow{OB}=-\\mathbf a$, $\\overrightarrow{OP}=\\mathbf p$ and $|\\mathbf p|=|\\mathbf a|$: $\\overrightarrow{PA}\\cdot\\overrightarrow{PB}=(\\mathbf a-\\mathbf p)\\cdot(-\\mathbf a-\\mathbf p)=|\\mathbf p|^2-|\\mathbf a|^2=0$.',
      svg: () => { const cx = 150, cy = 150, R = 110, px = cx + R * Math.cos(rad(65)), py = cy - R * Math.sin(rad(65)); const ua = unit(px, py, cx - R, cy), ub = unit(px, py, cx + R, cy); return svg(300, 195, Arc(cx, cy, R, 0, 180, 'pen', 2.4) + L(cx - R, cy, cx + R, cy, 'ink', 2) + L(px, py, cx - R, cy, 'warn', 2.4) + L(px, py, cx + R, cy, 'warn', 2.4) + L(cx, cy, px, py, 'ok', 1.8, true) + RA(px, py, ua[0], ua[1], ub[0], ub[1], 10) + P(px, py, 'ink', 3.5) + P(cx, cy, 'ink', 3) + T(px + 6, py - 4, 'P') + T(cx - R - 14, cy + 4, 'A') + T(cx + R + 4, cy + 4, 'B') + T(cx - 4, cy + 16, 'O') + T(cx + 8, cy - 40, 'p', { c: 'ok', b: 1 }) + T(150, 190, 'PA · PB = 0, so ∠APB = 90°', { a: 'middle', size: 12, c: 'mute' }), 'Right angle at P on a circle with diameter AB'); } },
  ],
  func: [
    { t: 'Inverse trig graphs', cap: 'Restricted ranges: $\\sin^{-1}$ gives $[-\\frac\\pi2,\\frac\\pi2]$, $\\cos^{-1}$ gives $[0,\\pi]$ (decreasing), $\\tan^{-1}$ gives $(-\\frac\\pi2,\\frac\\pi2)$ with horizontal asymptotes. Each is the reflection of the restricted trig graph in $y=x$.',
      svg: () => { const s = 32, panel = (cx, cy, f, a, b, sx, title, dom, ran, extra) => AX(cx - 62, cy, cx + 62, cy - 108, cy + 58, '', '') + Poly(curve(f, a, b, x => cx + x * sx, y => cy - y * s), 'pen', 2.8) + T(cx, 16, title, { a: 'middle', b: 1 }) + T(cx, 190, dom, { a: 'middle', size: 11, c: 'mute' }) + T(cx, 204, ran, { a: 'middle', size: 11, c: 'mute' }) + extra;
        return svg(480, 212, panel(80, 105, Math.asin, -1, 1, 50, 'sin⁻¹ x', 'domain [−1, 1]', 'range [−π/2, π/2]', T(88, 105 - 50 - 3, 'π/2', { size: 11, c: 'mute' }) + T(88, 105 + 50 + 11, '−π/2', { size: 11, c: 'mute' })) +
          panel(240, 150, Math.acos, -1, 1, 50, 'cos⁻¹ x', 'domain [−1, 1]', 'range [0, π]', T(246, 150 - 100 - 4, 'π', { size: 11, c: 'mute' }) + T(246, 150 - 50 + 4, 'π/2', { size: 11, c: 'mute' })) +
          panel(400, 105, Math.atan, -4, 4, 14, 'tan⁻¹ x', 'domain all reals', 'range (−π/2, π/2)', L(345, 105 - 50, 455, 105 - 50, 'warn', 1.3, true) + L(345, 105 + 50, 455, 105 + 50, 'warn', 1.3, true) + T(408, 105 - 53, 'π/2', { size: 11, c: 'warn' }) + T(408, 105 + 61, '−π/2', { size: 11, c: 'warn' })), 'Graphs of the three inverse trig functions'); } },
    { t: 'Multiplicity: cross or touch', cap: '$P(x)=x(x-1)^2(x+2)$. Odd multiplicity ($x=0$, $x=-2$): the graph **crosses**. Even multiplicity ($x=1$): it **touches** and turns, and $P(1)=P\'(1)=0$. A triple root crosses with a flat inflection.',
      svg: () => { const mx = x => 170 + x * 62, my = y => 120 - y * 8; return svg(340, 205, AX(30, 120, 328, 14, 200, 'x', 'y') + Poly(curve(x => x * (x - 1) * (x - 1) * (x + 2), -2.4, 1.75, mx, my), 'pen', 2.8) + P(mx(-2), 120, 'ok') + P(mx(0), 120, 'ok') + P(mx(1), 120, 'warn') + T(mx(-2) - 4, 138, '−2 crosses', { a: 'middle', size: 11, c: 'ok', b: 1 }) + T(mx(0) + 8, 138, '0 crosses', { a: 'middle', size: 11, c: 'ok', b: 1 }) + T(mx(1) + 4, 138, '1 touches', { a: 'middle', size: 11, c: 'warn', b: 1 }), 'Graph of a quartic touching at a double root'); } },
    { t: 'A function and its inverse', cap: 'The graph of $f^{-1}$ is the reflection of $f$ in $y=x$: $(a,b)\\to(b,a)$. Domain and range **swap**. Shown: $f(x)=x^2$ for $x\\ge0$ and $f^{-1}(x)=\\sqrt x$. Gradients multiply to $1$ at matching points: $(f^{-1})\'(b)=\\frac1{f\'(a)}$.',
      svg: () => { const mx = x => 40 + x * 62, my = y => 190 - y * 62; return svg(300, 225, AX(40, 190, 288, 14, 215, 'x', 'y') + L(mx(0), my(0), mx(3.1), my(3.1), 'mute', 1.4, true) + T(mx(3.1) - 2, my(3.1) - 6, 'y = x', { c: 'mute', size: 12, a: 'end' }) + Poly(curve(x => x * x, 0, 1.8, mx, my), 'pen', 2.8) + Poly(curve(Math.sqrt, 0, 3.2, mx, my), 'warn', 2.8) + L(mx(1.5), my(2.25), mx(2.25), my(1.5), 'ink', 1.2, true) + P(mx(1.5), my(2.25), 'pen', 3.5) + P(mx(2.25), my(1.5), 'warn', 3.5) + T(mx(1.5) - 6, my(2.25) - 2, '(a, b)', { a: 'end', size: 12 }) + T(mx(2.25) + 6, my(1.5) + 12, '(b, a)', { size: 12 }) + T(mx(0.6), my(1.9), 'f', { c: 'pen', b: 1 }) + T(mx(2.8), my(1.35), 'f⁻¹', { c: 'warn', b: 1 }), 'Function, inverse and the line y equals x'); } },
    { t: 'Solving a rational inequality', cap: 'Never multiply by a quantity that can be negative. Multiply by the **square** of the denominator, factorise, and use a sign table.',
      html: () => hflow(['**1.** Exclude the value that makes the denominator $0$.', '**2.** $\\dfrac{x}{x-2}\\ge3\\Rightarrow x(x-2)\\ge3(x-2)^2$ (multiplied by $(x-2)^2>0$).', '**3.** Collect and factorise: $(x-2)(x-3)\\le0$.', '**4.** Sign table or sketch: $2\\le x\\le3$. Remove $x=2$: **$2<x\\le3$**. Test a point.']) },
  ],
  trig: [
    { t: 't-formulas triangle', cap: 'With $t=\\tan\\frac\\theta2$, build the triangle from $\\tan\\theta=\\frac{2t}{1-t^2}$. Then $\\sin\\theta=\\frac{2t}{1+t^2}$ and $\\cos\\theta=\\frac{1-t^2}{1+t^2}$. $\\theta=\\pi$ gives no $t$: test it separately.',
      svg: () => svg(300, 200, Poly([[60, 175], [157.5, 175], [157.5, 45]], 'pen', 2.6, true) + RA(157.5, 175, -1, 0, 0, -1) + Arc(60, 175, 36, 0, 53, 'ink') + T(100, 165, 'θ') + T(108, 194, '1 − t²', { a: 'middle', b: 1 }) + T(166, 112, '2t', { b: 1 }) + T(92, 100, '1 + t²', { b: 1, c: 'warn', a: 'end' }) + T(235, 90, 'sin θ = 2t/(1+t²)', { size: 12, a: 'middle', c: 'mute' }) + T(235, 108, 'cos θ = (1−t²)/(1+t²)', { size: 12, a: 'middle', c: 'mute' }), 'Right triangle with sides 2t and 1 minus t squared') },
    { t: 'Auxiliary angle triangle', cap: '$a\\sin x+b\\cos x=R\\sin(x+\\alpha)$ with $R\\cos\\alpha=a$, $R\\sin\\alpha=b$: put $a$ across and $b$ up, then $R$ is the hypotenuse. Max $R$, min $-R$. Extend the domain to $x+\\alpha$ before listing solutions. Shown: $3\\sin x+4\\cos x=5\\sin(x+53.1^\\circ)$.',
      svg: () => svg(320, 200, Poly([[40, 165], [130, 165], [130, 45]], 'pen', 2.6, true) + RA(130, 165, -1, 0, 0, -1) + Arc(40, 165, 36, 0, 53.13, 'ink') + T(78, 156, 'α') + T(85, 186, 'a = 3  (coefficient of sin x)', { a: 'start', b: 1, size: 12 }) + T(138, 112, 'b = 4', { b: 1 }) + T(60, 92, 'R = 5', { b: 1, c: 'warn' }) + T(190, 64, 'R = √(a² + b²)', { size: 12, c: 'mute' }) + T(190, 82, 'tan α = b / a', { size: 12, c: 'mute' }), 'Right triangle for the auxiliary angle method') },
    { t: 'CAST and exact values', cap: 'Positive ratios by quadrant: **A**ll, **S**in, **T**an, **C**os. For $\\sin x=k$ the solutions are $\\alpha$ and $\\pi-\\alpha$; for $\\cos x=k$ they are $\\pm\\alpha$; for $\\tan x=k$, $\\alpha$ and $\\alpha+\\pi$.',
      svg: () => svg(300, 225, Ci(150, 112, 85, 'pen', 2.2) + A(50, 112, 256, 112, 'mute', 1.4) + A(150, 205, 150, 14, 'mute', 1.4) + T(205, 66, 'All', { a: 'middle', b: 1, c: 'ok', size: 17 }) + T(95, 66, 'Sin', { a: 'middle', b: 1, c: 'pen', size: 17 }) + T(95, 168, 'Tan', { a: 'middle', b: 1, c: 'warn', size: 17 }) + T(205, 168, 'Cos', { a: 'middle', b: 1, c: 'pen', size: 17 }) + T(256, 128, '0, 2π', { a: 'end', size: 11, c: 'mute' }) + T(48, 128, 'π', { size: 11, c: 'mute' }) + T(156, 24, 'π/2', { size: 11, c: 'mute' }) + T(156, 214, '3π/2', { size: 11, c: 'mute' }), 'CAST diagram') },
  ],
  stats: [
    { t: 'The 68–95–99.7 rule', cap: 'For a normal distribution: about $68\\%$ within $1\\sigma$, $95\\%$ within $2\\sigma$, $99.7\\%$ within $3\\sigma$. So $P(Z>2)\\approx0.025$ and $P(Z>1)\\approx0.16$. Convert first: $z=\\frac{x-\\mu}\\sigma$.',
      svg: () => { const mx = z => 170 + z * 48, my = y => 170 - 130 * y, phi = z => Math.exp(-z * z / 2); const sl = (a, b) => [[mx(a), 170], ...curve(phi, a, b, mx, my, 40), [mx(b), 170]]; return svg(340, 230, area(sl(-3, 3), 'pen', .1) + area(sl(-2, 2), 'pen', .15) + area(sl(-1, 1), 'pen', .25) + Poly(curve(phi, -3.4, 3.4, mx, my), 'pen', 2.8) + L(20, 170, 322, 170, 'mute', 1.4) + [-3, -2, -1, 0, 1, 2, 3].map(z => L(mx(z), 170, mx(z), 175, 'mute', 1.4) + T(mx(z), 188, String(z), { a: 'middle', size: 12, c: 'mute' })).join('') + DA(mx(-1), 150, mx(1), 150, 'ink') + T(170, 145, '68%', { a: 'middle', b: 1, size: 12 }) + T(170, 207, 'standard deviations from the mean (z)', { a: 'middle', size: 12, c: 'mute' }) + T(170, 222, '68% within 1σ, 95% within 2σ, 99.7% within 3σ', { a: 'middle', size: 12, c: 'ink', b: 1 }), 'Normal curve with one two and three standard deviations shaded'); } },
    { t: 'Binomial looks normal', cap: '$X\\sim\\text{Bin}(n,p)$ with $np$ and $nq$ large is close to $N(np,\\ npq)$. Shown: $\\text{Bin}(20,0.5)$ against $N(10,5)$. Check validity: **both $np$ and $nq$ large**.',
      svg: () => { const n = 20, p = .5, mu = 10, sd = Math.sqrt(5); let bars = ''; for (let k = 0; k <= n; k++) { const pm = binom(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k); bars += Rect(30 + k * 14 - 5, 175 - pm * 680, 10, pm * 680, 'pen', 1, true); } const pdf = x => Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI)); return svg(340, 215, bars + Poly(curve(pdf, 0, 20, x => 30 + x * 14, y => 175 - y * 680), 'warn', 2.6) + L(20, 175, 322, 175, 'mute', 1.4) + [0, 5, 10, 15, 20].map(k => T(30 + k * 14, 192, String(k), { a: 'middle', size: 12, c: 'mute' })).join('') + T(30 + 10 * 14, 40, 'bars: Bin(20, 0.5)', { a: 'middle', size: 12, c: 'pen', b: 1 }) + T(30 + 10 * 14, 56, 'curve: N(10, 5)', { a: 'middle', size: 12, c: 'warn', b: 1 }), 'Binomial bars with a normal curve'); } },
    { t: 'Sample proportion narrows with n', cap: '$\\hat p\\approx N\\left(p,\\ \\frac{pq}n\\right)$. The centre stays at $p$; the spread $\\sqrt{pq/n}$ **halves** when $n$ is $4\\times$ bigger. Larger samples give a tighter, taller curve.',
      svg: () => { const mx = u => 170 + u * 1000, my = (y) => 170 - 55 * y; const g = (sd) => (u) => (.05 / sd) * Math.exp(-u * u / (2 * sd * sd)); return svg(340, 205, L(20, 170, 322, 170, 'mute', 1.4) + Poly(curve(g(.05), -.15, .15, mx, my), 'pen', 2.8) + Poly(curve(g(.025), -.15, .15, mx, my), 'warn', 2.8) + L(170, 170, 170, 175, 'mute', 1.4) + T(170, 190, 'p', { a: 'middle', c: 'mute', i: 1 }) + T(246, 118, 'sample n', { c: 'pen', b: 1, size: 12 }) + T(176, 52, 'sample 4n', { c: 'warn', b: 1, size: 12 }) + T(170, 202, 'σ = √(pq/n)  →  σ/2', { a: 'middle', size: 12, c: 'mute' }), 'Two normal curves, the narrower for the larger sample'); } },
  ],
  count: [
    { t: "Pascal's triangle", cap: '$\\binom nk+\\binom n{k+1}=\\binom{n+1}{k+1}$: each entry is the sum of the two above it (red $3+3=6$, green). Rows are symmetric, row $n$ sums to $2^n$. Hockey stick: $\\binom22+\\binom32+\\binom42=1+3+6=10=\\binom53$.',
      svg: () => { let g = ''; const pos = (r, k) => [170 + (k - r / 2) * 38, 20 + r * 27]; for (let r = 0; r <= 6; r++) for (let k = 0; k <= r; k++) { const [x, y] = pos(r, k); g += T(x, y + 5, String(binom(r, k)), { a: 'middle', size: 15 }); } const c = (r, k, cc) => { const [x, y] = pos(r, k); return Ci(x, y, 13, cc, 2.2); }; return svg(340, 200, g + c(3, 1, 'warn') + c(3, 2, 'warn') + c(4, 2, 'ok') + c(2, 2, 'pen') + c(5, 3, 'pen'), 'Pascal triangle rows zero to six'); } },
    { t: 'Pigeonhole: pairs summing to 9', cap: 'Pick any 5 numbers from $\\{1,\\dots,8\\}$. Holes: the 4 pairs $\\{1,8\\},\\{2,7\\},\\{3,6\\},\\{4,5\\}$. Five pigeons in four holes means two share a hole, and that pair sums to $9$.',
      svg: () => { const pairs = [['1', '8'], ['2', '7'], ['3', '6'], ['4', '5']], chosen = ['1', '2', '7', '3', '5']; let g = ''; pairs.forEach((p, i) => { const x = 18 + i * 78, hit = chosen.includes(p[0]) && chosen.includes(p[1]); g += Rect(x, 60, 66, 70, hit ? 'warn' : 'mute', hit ? 2.6 : 1.6, hit) + T(x + 33, 148, '{' + p.join(', ') + '}', { a: 'middle', size: 12, c: hit ? 'warn' : 'mute', b: hit }); p.forEach((v, j) => { if (chosen.includes(v)) g += Ci(x + 20 + j * 26, 95, 11, hit ? 'warn' : 'pen', 2, true) + T(x + 20 + j * 26, 100, v, { a: 'middle', size: 12, b: 1 }); }); }); return svg(340, 190, T(170, 24, 'pigeons: the 5 chosen numbers', { a: 'middle', size: 13, b: 1 }) + T(170, 44, 'holes: 4 pairs', { a: 'middle', size: 13, c: 'mute' }) + g + T(170, 176, '2 and 7 land in one hole: 2 + 7 = 9', { a: 'middle', size: 13, c: 'warn', b: 1 }), 'Four boxes of number pairs holding five chosen numbers'); } },
    { t: 'Induction in four steps', cap: 'Say all four. The $k+1$ line must start from the assumption for $k$. Write the **target** for $n=k+1$ before you start the algebra.',
      html: () => hflow(['**1. Base case.** Show it is true for $n=1$ (LHS $=$ RHS).', '**2. Assume** it is true for $n=k$ (write the statement).', '**3. Prove** it for $n=k+1$ **using the assumption**. Sums: $S_{k+1}=S_k+T_{k+1}$. Divisibility: replace $a^k$ using $a^k=mM+r$.', '**4. Conclude:** true for $n=1$, and true for $k\\Rightarrow$ true for $k+1$, so true for all integers $n\\ge1$ by induction.']) },
    { t: 'Which counting rule?', cap: 'Decide order and repetition first, then restrictions.',
      html: () => table(['Situation', 'Use'], [['order matters, all distinct', '$n!$ or ${}^nP_r$'], ['order does not matter', '$\\dbinom nr$'], ['letters/objects repeated', '$\\dfrac{n!}{a!\\,b!}$'], ['circle', '$(n-1)!$'], ['must be together', 'block, then $\\times$ internal order'], ['not together / at least', 'total $-$ the opposite']]) },
  ],
};

// ---------- Graphing: a small plotter that samples the real function ----------
// Curves are never hand-drawn: each one is sampled densely, split at breaks, gaps and non-finite values, and clipped
// to the box. Point labels are written from the actual coordinates (nice() finds exact forms), and plot() checks that
// marked points, turning points, zeros and asymptotes really belong to the plotted function (PLOT_WARN lists failures).
const PLOT_WARN = [];
function nice(v) {
  if (!isFinite(v)) return String(v);
  if (Math.abs(v) < 1e-9) return '0';
  const near = (a) => Math.abs(v - a) < 1e-7 * Math.max(1, Math.abs(v)), neg = (s) => s.replace(/^-/, '−');
  for (const q of [1, 2, 3, 4, 5, 6, 8, 9]) { const p = Math.round(v * q); if (near(p / q)) return neg(q === 1 ? String(p) : `${p}/${q}`); }
  for (const q of [1, 2, 3, 4, 6]) { const p = Math.round(v * q / Math.PI); if (p && near(p * Math.PI / q)) { const a = Math.abs(p); return (p < 0 ? '−' : '') + (a === 1 ? '' : a) + 'π' + (q === 1 ? '' : '/' + q); } }
  const fr = (r, q) => { const p = Math.round(r * q), g = (m, n) => n ? g(n, m % n) : m, d = g(Math.abs(p), q); return [p / d, q / d]; };
  for (const q of [1, 2, 3]) for (const n of [2, 3, 5, 6, 7]) for (let bq = -12; bq <= 12; bq++) {
    if (!bq) continue; const b = bq / q, a = Math.round((v - b * Math.sqrt(n)) * q) / q;
    if (!near(a + b * Math.sqrt(n))) continue;
    const [bp, bd] = fr(b, q), ab = Math.abs(bp), rt = (ab === 1 ? '' : ab) + '√' + n + (bd === 1 ? '' : '/' + bd);
    if (Math.abs(a) < 1e-12) return (bp < 0 ? '−' : '') + rt;
    return nice(a) + (bp < 0 ? ' − ' : ' + ') + rt;
  }
  return '≈' + neg(v.toFixed(2));
}
const pair = (x, y) => { const a = nice(x), b = nice(y), ap = a[0] === '≈' || b[0] === '≈'; return (ap ? '≈ ' : '') + `(${a.replace('≈', '')}, ${b.replace('≈', '')})`; };
function clipSeg(ax, ay, bx, by, X0, X1, Y0, Y1) { // Liang-Barsky
  let t0 = 0, t1 = 1; const dx = bx - ax, dy = by - ay, p = [-dx, dx, -dy, dy], q = [ax - X0, X1 - ax, ay - Y0, Y1 - ay];
  for (let i = 0; i < 4; i++) { if (p[i] === 0) { if (q[i] < 0) return null; } else { const r = q[i] / p[i]; if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; } } }
  return [ax + t0 * dx, ay + t0 * dy, ax + t1 * dx, ay + t1 * dy, t0 > 0, t1 < 1];
}
function sampleF(f, a, b, brk, n) { // runs of finite points; refines the edge of each gap by bisection (vertical tangents of sqrt meet the axis)
  const cuts = [a, ...(brk || []).filter(v => v > a && v < b).sort((p, q) => p - q), b], eps = (b - a) * 1e-7, runs = [];
  const ok = (x) => isFinite(f(x));
  for (let i = 0; i < cuts.length - 1; i++) {
    const lo = cuts[i] + (i ? eps : 0), hi = cuts[i + 1] - (i < cuts.length - 2 ? eps : 0); let run = [], px = null;
    for (let j = 0; j <= n; j++) {
      const x = lo + (hi - lo) * j / n, y = f(x), fin = isFinite(y);
      if (px !== null && fin !== ok(px)) { let u = px, v = x; for (let k = 0; k < 60; k++) { const m = (u + v) / 2; if (ok(m) === ok(px)) u = m; else v = m; } const e = ok(px) ? u : v; if (ok(px)) run.push([e, f(e)]); else run.unshift([e, f(e)]); }
      if (fin) { run.push([x, y]); } else if (run.length) { runs.push(run); run = []; }
      if (fin && px !== null && !ok(px) && run.length === 1) { /* edge point was unshifted above */ }
      px = x;
    }
    if (run.length) runs.push(run);
  }
  return runs;
}
function plot(o) {
  const W = o.w || 300, H = o.h || 230, ml = o.ml ?? 12, mr = o.mr ?? 12, mt = o.mt ?? 12, mb = o.mb ?? 12;
  const [x0, x1] = o.x, [y0, y1] = o.y, id = o.id || 'plot', fns = o.fns || [];
  const mx = (x) => ml + (x - x0) / (x1 - x0) * (W - ml - mr), my = (y) => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
  const warn = (s) => { PLOT_WARN.push(id + ': ' + s); try { console.warn('[plot] ' + id + ': ' + s); } catch (e) { } };
  const big = 4 * (y1 - y0);
  const TH = (x, y, s, q = {}) => { const size = q.size || 12.5, est = String(s).length * size * .56; let a = q.a || 'start', xx = x;
    const left = a === 'start' ? xx : a === 'end' ? xx - est : xx - est / 2; if (left < 2) xx += 2 - left; if (left + est > W - 2) xx -= left + est - (W - 2);
    return `<text x="${n1(xx)}" y="${n1(y)}" fill="${col(q.c || 'ink')}" font-size="${size}" text-anchor="${a}" stroke="var(--sheet)" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke"${q.b ? ' font-weight="700"' : ''}${q.i ? ' font-style="italic"' : ''}>${esc(s)}</text>`; };
  const OFF = { n: [0, -9, 'middle'], s: [0, 18, 'middle'], e: [8, 4, 'start'], w: [-8, 4, 'end'], ne: [6, -8, 'start'], nw: [-6, -8, 'end'], se: [6, 16, 'start'], sw: [-6, 16, 'end'] };
  let g = '', lb = '';
  const toPolys = (runs) => { const polys = []; for (const run of runs) { let cur = []; for (let i = 0; i < run.length - 1; i++) {
    const [ax, ay] = run[i], [bx, by] = run[i + 1]; if (Math.abs(by - ay) > big) { if (cur.length > 1) polys.push(cur); cur = []; continue; }
    const c = clipSeg(ax, ay, bx, by, x0, x1, y0, y1); if (!c) { if (cur.length > 1) polys.push(cur); cur = []; continue; }
    if (!cur.length || c[4]) { if (cur.length > 1) polys.push(cur); cur = [[mx(c[0]), my(c[1])]]; }
    cur.push([mx(c[2]), my(c[3])]); if (c[5]) { if (cur.length > 1) polys.push(cur); cur = []; } } if (cur.length > 1) polys.push(cur); } return polys; };
  const stroke = (polys, c, w, dash, op) => polys.map(p => `<polyline points="${p.map(q => n1(q[0]) + ',' + n1(q[1])).join(' ')}" fill="none" stroke="${col(c)}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${dash ? ' stroke-dasharray="6 5"' : ''}${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`).join('');
  // axes
  const ax = x0 <= 0 && 0 <= x1 ? mx(0) : mx(x0), ay = y0 <= 0 && 0 <= y1 ? my(0) : my(y0);
  g += A(mx(x0) - 2, ay, W - 3, ay, 'mute', 1.3) + A(ax, H - 3, ax, 3, 'mute', 1.3);
  lb += TH(W - 4, ay + (o.xlabUp ? -7 : 16), 'x', { c: 'mute', a: 'end', i: 1 }) + TH(ax + 7, 13, 'y', { c: 'mute', i: 1 });
  for (let t of o.xt || []) { if (typeof t === 'number') t = { v: t }; const X = mx(t.v); g += L(X, ay - 3.5, X, ay + 3.5, 'mute', 1.3); if (t.s !== false) lb += TH(X + (t.dx || 0), ay + (t.up ? -8 : 17), t.s ?? nice(t.v), { a: 'middle', c: 'mute', size: 12 }); }
  for (let t of o.yt || []) { if (typeof t === 'number') t = { v: t }; const Y = my(t.v); g += L(ax - 3.5, Y, ax + 3.5, Y, 'mute', 1.3); if (t.s !== false) lb += TH(t.r ? ax + 7 : ax - 6, Y + 4 + (t.dy || 0), t.s ?? nice(t.v), { a: t.r ? 'start' : 'end', c: 'mute', size: 12 }); }
  // asymptotes and reference lines
  for (const a of o.va || []) { g += L(mx(a.v), my(y1), mx(a.v), my(y0), a.c || 'warn', 1.3, true); if (a.s !== false) lb += TH(mx(a.v) + (a.side === 'l' ? -4 : 4), a.at === 'b' ? H - mb - 4 : mt + 10, a.s ?? `x = ${nice(a.v)}`, { a: a.side === 'l' ? 'end' : 'start', c: a.c || 'warn', size: 12 });
    if (a.of != null) for (const s of [-1, 1]) { const y = fns[a.of].f(a.v + s * 1e-7); if (isFinite(y) && Math.abs(y) < 1e4) warn(`x=${a.v} is not a vertical asymptote (f=${y})`); } }
  for (const a of o.ha || []) { g += L(mx(x0), my(a.v), mx(x1), my(a.v), a.c || 'warn', 1.3, true); if (a.s !== false) lb += TH(a.at === 'l' ? mx(x0) + 4 : mx(x1) - 4, my(a.v) + (a.below ? 15 : -5), a.s ?? `y = ${nice(a.v)}`, { a: a.at === 'l' ? 'start' : 'end', c: a.c || 'warn', size: 12 });
    if (a.of != null) for (const s of a.sides || [-1, 1]) { const y = fns[a.of].f(s * 1e7); if (!(Math.abs(y - a.v) < 1e-4)) warn(`y=${a.v} is not a horizontal asymptote at ${s}∞ (f=${y})`); } }
  for (const a of o.oa || []) { const c = clipSeg(x0, a.m * x0 + a.c, x1, a.m * x1 + a.c, x0, x1, y0, y1); if (c) g += L(mx(c[0]), my(c[1]), mx(c[2]), my(c[3]), a.col || 'warn', 1.3, true);
    if (a.s) lb += TH(mx(a.lx) + (a.dx || 0), my(a.m * a.lx + a.c) + (a.dy ?? -6), a.s, { a: a.a || 'start', c: a.col || 'warn', size: 12 });
    if (a.of != null) for (const s of a.sides || [-1, 1]) { const X = s * 1e6, d = fns[a.of].f(X) - (a.m * X + a.c); if (!(Math.abs(d) < 1e-4)) warn(`oblique asymptote y=${a.m}x+${a.c} fails at ${s}∞ (gap ${d})`); } }
  // curves: faint ones first
  const order = fns.map((f, i) => i).sort((i, j) => (fns[j].faint ? 1 : 0) - (fns[i].faint ? 1 : 0));
  for (const i of order) { const fn = fns[i];
    let runs; if (fn.p) { const [a, b] = fn.t, n = fn.n || 800, run = []; for (let j = 0; j <= n; j++) { const q = fn.p(a + (b - a) * j / n); if (isFinite(q[0]) && isFinite(q[1])) run.push(q); } runs = [run]; }
    else { const [a, b] = fn.d || [x0 - (x1 - x0) * .01, x1 + (x1 - x0) * .01]; runs = sampleF(fn.f, a, b, fn.brk, fn.n || 900); }
    const c = fn.c || (fn.faint ? 'mute' : 'pen'), w = fn.w || (fn.faint ? 1.8 : 2.7);
    g += stroke(toPolys(runs), c, w, fn.dash, fn.faint ? .85 : 1);
    for (const t of fn.arrows || []) { const [xa, ya] = fn.p(t), [xb, yb] = fn.p(t + 1e-3), X = mx(xa), Y = my(ya), an = Math.atan2(my(yb) - Y, mx(xb) - X), h = 10, p = 5;
      g += `<polygon points="${n1(X + h / 2 * Math.cos(an))},${n1(Y + h / 2 * Math.sin(an))} ${n1(X - h / 2 * Math.cos(an) + p * Math.sin(an))},${n1(Y - h / 2 * Math.sin(an) - p * Math.cos(an))} ${n1(X - h / 2 * Math.cos(an) - p * Math.sin(an))},${n1(Y - h / 2 * Math.sin(an) + p * Math.cos(an))}" fill="${col(c)}"/>`; }
    if (fn.lab) { const L0 = fn.lab, yy = L0.y ?? fn.f(L0.x); lb += TH(mx(L0.x) + (L0.dx || 0), my(yy) + (L0.dy || 0), L0.s, { a: L0.a || 'start', c, b: !fn.faint, size: L0.size || 12.5 }); }
    if (fn.inv != null) { const F = fns[fn.inv].f; for (let j = 1; j < 20; j++) { const x = fn.d[0] + (fn.d[1] - fn.d[0]) * j / 20, y = fn.f(x); if (isFinite(y) && Math.abs(F(y) - x) > 1e-7) warn(`curve ${i} is not the inverse of curve ${fn.inv} at x=${x}`); } }
  }
  // intervals on the x-axis (solution sets)
  for (const iv of o.xint || []) { const a = Math.max(iv.a, x0), b = Math.min(iv.b, x1), Y = ay;
    g += `<line x1="${n1(mx(a))}" y1="${n1(Y)}" x2="${n1(mx(b))}" y2="${n1(Y)}" stroke="${col('ok')}" stroke-width="5" stroke-opacity=".75" stroke-linecap="butt"/>`;
    if (iv.a > x0) g += P(mx(iv.a), Y, 'ok', 4.5, !iv.ca); if (iv.b < x1) g += P(mx(iv.b), Y, 'ok', 4.5, !iv.cb); }
  if (o.extra) g += o.extra(mx, my);
  // marked points, checked against the curves
  for (const p of o.pts || []) {
    const f = p.of != null ? fns[p.of].f : null; let y = p.y;
    if (y == null) y = p.hole ? (f(p.x - 1e-6) + f(p.x + 1e-6)) / 2 : f(p.x);
    if (f && !p.hole && p.y != null && !(Math.abs(f(p.x) - p.y) < 1e-7)) warn(`point (${p.x}, ${p.y}) is not on curve ${p.of} (f=${f(p.x)})`);
    if (f && p.hole) { if (Math.abs(f(p.x - 1e-6) - y) > 1e-4 || Math.abs(f(p.x + 1e-6) - y) > 1e-4) warn(`hole at x=${p.x}: limit is not ${y}`); }
    if (p.chk === 'tp' && f) { const h = 1e-5, d = (f(p.x + h) - f(p.x - h)) / (2 * h); if (Math.abs(d) > 1e-4) warn(`(${p.x}, ${y}) is not stationary (f'=${d})`); }
    if (p.chk === 'zero' && Math.abs(y) > 1e-9) warn(`x=${p.x} is not a zero (y=${y})`);
    if (p.w != null && !(Math.abs(fns[p.w].f(p.x) - y) < 1e-7)) warn(`(${p.x}, ${y}) is not on curve ${p.w} too (f=${fns[p.w].f(p.x)})`);
    if (p.test && !p.test(p.x, y)) warn(`custom check failed at (${p.x}, ${y})`);
    const c = p.c || 'ok'; g += P(mx(p.x), my(y), c, p.r || 4, p.open || p.hole);
    if (p.s !== false) { const [dx, dy, a] = OFF[p.pos || 'ne'], s = (p.s ?? pair(p.x, y)) + (p.note ? ' ' + p.note : '');
      lb += TH(mx(p.x) + dx + (p.dx || 0), my(y) + dy + (p.dy || 0), s, { a, c: p.lc || 'ink', size: p.size || 12.5, b: p.b }); }
  }
  if (o.leg) { const [lx, ly] = o.legAt || [W - 12, 16], right = !o.legAt || o.legLeft === false; o.leg.forEach(([c, s, faint], k) => { const Y = ly + k * 17, w = s.length * 12.5 * .56;
    const X = right ? lx - w - 24 : lx; g += L(X, Y - 4, X + 18, Y - 4, c, faint ? 1.8 : 2.7) ; lb += TH(X + 23, Y, s, { c: faint ? 'mute' : c, size: 12.5, b: !faint }); }); }
  return svg(W, H, g + lb, o.alt || id);
}
const HL = (k, a, b) => ({ f: () => k, d: [a, b], c: 'mute', w: 1.4, dash: 1 });

DIAGRAMS.graph = [
  // 1. Reciprocal
  { sec: 0, t: 'y = 1/f(x) from a parabola', cap: '$f(x)=x^2-2x-3=(x+1)(x-3)$ (faint). Zeros of $f$ become **vertical asymptotes** $x=-1$, $x=3$. The minimum $(1,-4)$ becomes a **maximum** $(1,-\\frac14)$. Where $f=\\pm1$ (green dots) the graphs meet. As $f\\to\\pm\\infty$, $\\frac1f\\to0$, so $y=0$ is an asymptote.',
    svg: () => { const f = x => x * x - 2 * x - 3; return plot({ id: 'Reciprocal of x squared minus 2x minus 3', x: [-3, 5], y: [-5, 5], h: 240,
      fns: [{ f, faint: 1, lab: { x: 2.2, s: 'f', dx: 8 } }, { f: x => 1 / f(x), brk: [-1, 3], lab: { x: 4.2, s: '1/f', dy: -8 } }],
      va: [{ v: -1, of: 1, side: 'l' }, { v: 3, of: 1 }], xt: [-2, { v: 1, s: false }, 4], yt: [1, -1],
      pts: [{ x: 1, of: 0, chk: 'tp', pos: 'e' }, { x: 1, of: 1, chk: 'tp', pos: 'se', dy: 2 }, ...[1 - Math.sqrt(5), 1 + Math.sqrt(5), 1 - Math.sqrt(3), 1 + Math.sqrt(3)].map(x => ({ x, of: 0, w: 1, s: false, r: 3.5 }))] }); } },
  { sec: 0, t: 'No zeros: no vertical asymptotes', cap: '$f(x)=x^2+2$ is never $0$, so $\\frac1{x^2+2}$ is defined everywhere. Minimum $(0,2)$ of $f$ becomes the **maximum** $(0,\\frac12)$ of $\\frac1f$; as $f\\to\\infty$, $\\frac1f\\to0^+$. Range $0<y\\le\\frac12$. Same sign as $f$ everywhere.',
    svg: () => { const f = x => x * x + 2; return plot({ id: 'Reciprocal of x squared plus 2', x: [-3, 3], y: [-0.8, 5], h: 220,
      fns: [{ f, faint: 1, lab: { x: 1.6, s: 'f = x² + 2', dx: 8 } }, { f: x => 1 / f(x), lab: { x: 1.9, s: '1/f', dy: -10 } }], xt: [-2, -1, 1, 2],
      pts: [{ x: 0, of: 0, chk: 'tp', pos: 'w', dx: -2 }, { x: 0, of: 1, chk: 'tp', pos: 'ne', dx: 2 }] }); } },
  { sec: 0, t: 'Reciprocal of sin x (period kept)', cap: '$y=\\frac1{\\sin x}$ on $[0,2\\pi]$. Zeros of $\\sin x$ at $0,\\pi,2\\pi$ become asymptotes. $(\\frac\\pi2,1)$ and $(\\frac{3\\pi}2,-1)$ are on both graphs and become turning points of opposite type (max of $\\sin$ $\\to$ min of $\\frac1{\\sin}$).',
    svg: () => plot({ id: 'Reciprocal of sine', x: [-0.5, 6.9], y: [-4, 4], h: 230,
      fns: [{ f: Math.sin, faint: 1, d: [0, 2 * Math.PI] }, { f: x => 1 / Math.sin(x), d: [0, 2 * Math.PI], brk: [Math.PI] }],
      va: [{ v: Math.PI, of: 1, s: 'x = π' }, { v: 2 * Math.PI, of: 1, s: 'x = 2π', side: 'l', at: 'b' }], xt: [{ v: Math.PI / 2 }, { v: 3 * Math.PI / 2, up: 1 }], yt: [1, -1],
      pts: [{ x: Math.PI / 2, of: 1, chk: 'tp', w: 0, pos: 'n', dy: -2 }, { x: 3 * Math.PI / 2, of: 1, chk: 'tp', w: 0, pos: 's' }] }) },
  // 2. Absolute value
  { sec: 1, t: 'y = |f(x)|: reflect the negative part up', cap: '$y=|x^2-2x-3|$. The part of $f$ below the $x$-axis ($-1<x<3$) is reflected up, so the minimum $(1,-4)$ becomes a **maximum** $(1,4)$. The zeros become sharp **corners** (not smooth): the graph is never below the axis.',
    svg: () => { const f = x => x * x - 2 * x - 3; return plot({ id: 'Absolute value of a parabola', x: [-3, 5], y: [-5, 6], h: 240,
      fns: [{ f, faint: 1, lab: { x: 1.9, s: 'f', dx: 6, dy: 12 } }, { f: x => Math.abs(f(x)), lab: { x: 3.9, s: '|f|', dx: 8 } }], xt: [{ v: -1, dx: -4 }, { v: 3, dx: 4 }], yt: [],
      pts: [{ x: 1, of: 1, pos: 'n', note: 'max' }, { x: 1, of: 0, pos: 's', lc: 'mute' }, { x: -1, of: 1, chk: 'zero', s: false, c: 'warn' }, { x: 3, of: 1, chk: 'zero', s: false, c: 'warn' }] }); } },
  { sec: 1, t: 'y = f(|x|): keep the right half, mirror it', cap: '$f(x)=x^2-4x+3=(x-1)(x-3)$. For $y=f(|x|)$ throw away $x<0$, keep $x\\ge0$ and **reflect it in the $y$-axis**. The result is even, has zeros $\\pm1,\\pm3$, minima $(\\pm2,-1)$ and a sharp corner at $(0,3)$.',
    svg: () => { const f = x => x * x - 4 * x + 3; return plot({ id: 'f of absolute x', x: [-5, 5], y: [-2, 6], h: 220,
      fns: [{ f, faint: 1, d: [-1.5, 5.2], lab: { x: -0.55, s: 'f', dx: 8, dy: 0 } }, { f: x => f(Math.abs(x)) }], xt: [-3, -1, 1, 3],
      pts: [{ x: 2, of: 1, chk: 'tp', pos: 's' }, { x: -2, of: 1, chk: 'tp', pos: 's' }, { x: 0, of: 1, pos: 'e', note: 'corner' }] }); } },
  // 3. y^2 = f(x)
  { sec: 2, t: 'y² = f(x) from a parabola', cap: '$f(x)=3+2x-x^2$ (faint). Plot $y=\\pm\\sqrt{f(x)}$, only where $f\\ge0$ ($-1\\le x\\le3$). Max $f=4$ gives $y=\\pm2$. **Vertical tangents** at the zeros. Where $0<f<1$, $\\sqrt f>f$; where $f>1$, $\\sqrt f<f$; they meet where $f=1$ (dots). Equal scales: it is the circle $(x-1)^2+y^2=4$.',
    svg: () => { const f = x => 3 + 2 * x - x * x; return plot({ id: 'y squared equals a parabola', x: [-3.25, 5.75], y: [-2.6, 4.4], h: 240,
      fns: [{ f, faint: 1, lab: { x: 3.25, s: 'f', dx: 6 } }, { f: x => Math.sqrt(f(x)) }, { f: x => -Math.sqrt(f(x)), lab: { x: 1.3, y: -1.1, s: 'y = ±√f', a: 'middle' } }], xt: [{ v: -1, dx: -6 }, { v: 3, dx: 6 }], yt: [],
      pts: [{ x: 1, of: 0, chk: 'tp', pos: 'n' }, { x: 1, of: 1, chk: 'tp', pos: 'ne' }, { x: 1, of: 2, chk: 'tp', pos: 's' }, { x: 1 - Math.sqrt(3), of: 1, w: 0, s: false, r: 3.5 }, { x: 1 + Math.sqrt(3), of: 1, w: 0, s: false, r: 3.5 }] }); } },
  { sec: 2, t: 'y² = f(x) for a cubic: a loop and a branch', cap: '$y^2=4x-x^3=x(2-x)(2+x)$. $f\\ge0$ for $x\\le-2$ and $0\\le x\\le2$, giving an open branch and a closed **loop**. The loop is widest where $f$ is largest: $x=\\frac2{\\sqrt3}$, $y=\\pm\\sqrt{\\frac{16}{3\\sqrt3}}\\approx\\pm1.75$. Vertical tangents at $x=-2,0,2$.',
    svg: () => { const f = x => 4 * x - x ** 3; return plot({ id: 'y squared equals 4x minus x cubed', x: [-3.2, 3], y: [-4.2, 4.2], h: 240,
      fns: [{ f, faint: 1, lab: { x: 1.5, s: 'f', dx: 4, dy: -10 } }, { f: x => Math.sqrt(f(x)) }, { f: x => -Math.sqrt(f(x)) }], xt: [{ v: -2, dx: 9 }, { v: 2, dx: 8 }], yt: [],
      pts: [{ x: 2 / Math.sqrt(3), of: 1, chk: 'tp', pos: 'ne', s: 'max y ≈ 1.75' }, { x: 2 / Math.sqrt(3), of: 2, chk: 'tp', s: false }, { x: -2, of: 1, chk: 'zero', s: false, c: 'warn' }, { x: 0, of: 1, chk: 'zero', s: false, c: 'warn' }, { x: 2, of: 1, chk: 'zero', s: false, c: 'warn' }] }); } },
  // 4. Sum and product
  { sec: 3, t: 'Adding ordinates: y = x + 1/x', cap: 'Add the heights of $y=x$ and $y=\\frac1x$ (faint) at each $x$. Near $0$ the $\\frac1x$ part dominates (asymptote $x=0$); for large $|x|$ the $x$ part dominates, so $y=x$ is an **oblique asymptote**. Turning points $(1,2)$ and $(-1,-2)$; range $y\\le-2$ or $y\\ge2$.',
    svg: () => plot({ id: 'x plus one over x', x: [-4.5, 4.5], y: [-5.5, 5.5], h: 240,
      fns: [{ f: x => x, faint: 1 }, { f: x => 1 / x, faint: 1, brk: [0], lab: { x: 3.4, s: '1/x', dy: -8 } }, { f: x => x + 1 / x, brk: [0] }],
      oa: [{ m: 1, c: 0, of: 2, s: 'y = x', lx: 3.6, dx: 6, dy: 14 }], va: [{ v: 0, of: 2, s: false }], xt: [], yt: [],
      pts: [{ x: 1, of: 2, chk: 'tp', pos: 'e' }, { x: -1, of: 2, chk: 'tp', pos: 'w' }] }) },
  { sec: 3, t: 'Multiplying ordinates: y = x sin x', cap: 'Multiply $y=x$ by $y=\\sin x$. Zeros of **either** factor are zeros of the product ($0,\\pi,2\\pi,3\\pi$). Because $-1\\le\\sin x\\le1$, the graph is trapped between $y=x$ and $y=-x$ (faint) and **touches** them where $\\sin x=\\pm1$.',
    svg: () => plot({ id: 'x times sin x', x: [-0.6, 10], y: [-9.5, 9.5], h: 240,
      fns: [{ f: x => x, faint: 1, d: [0, 10] }, { f: x => -x, faint: 1, d: [0, 10] }, { f: Math.sin, faint: 1, d: [0, 10] }, { f: x => x * Math.sin(x), d: [0, 3 * Math.PI] }],
      xt: [{ v: Math.PI, dx: -6 }, { v: 2 * Math.PI, up: 1 }, { v: 3 * Math.PI, dx: 4 }], yt: [],
      pts: [{ x: Math.PI / 2, of: 3, w: 0, pos: 'nw' }, { x: 3 * Math.PI / 2, of: 3, w: 1, pos: 'sw' }, { x: 5 * Math.PI / 2, of: 3, w: 0, pos: 'nw' }] }) },
  // 5. Polynomials and rational functions
  { sec: 4, t: 'Multiplicity: (x+1)³(x−2)²', cap: '$P(x)=(x+1)^3(x-2)^2$. Triple root $x=-1$: crosses **with a flat inflection**. Double root $x=2$: **touches** and turns. Degree $5$, leading coefficient $+1$: down on the left, up on the right. $P(0)=4$. Max where $P\'(x)=(x+1)^2(x-2)(5x-4)=0$: $x=\\frac45$.',
    svg: () => { const P0 = x => (x + 1) ** 3 * (x - 2) ** 2; return plot({ id: 'Quintic with triple and double roots', x: [-2, 3], y: [-4, 11], h: 240,
      fns: [{ f: P0 }], xt: [{ v: -1, dx: -6 }, { v: 2, s: false }], yt: [],
      pts: [{ x: -1, of: 0, chk: 'tp', s: 'triple: flat cross', pos: 'nw', c: 'warn' }, { x: 2, of: 0, chk: 'tp', s: 'double: touch', pos: 'n', c: 'warn', dy: -2 }, { x: 0, of: 0, pos: 'w' }, { x: 0.8, of: 0, chk: 'tp', pos: 'n' }] }); } },
  { sec: 4, t: 'Rational: vertical and horizontal asymptotes', cap: '$y=\\dfrac{x^2-1}{x^2-4}$. Denominator zero: $x=\\pm2$. Same degree top and bottom: $y\\to\\frac11=1$. Zeros $x=\\pm1$; $y$-intercept $\\frac14$ (a local max). Even function, so symmetric about the $y$-axis. Sign changes at $-2,-1,1,2$.',
    svg: () => { const f = x => (x * x - 1) / (x * x - 4); return plot({ id: 'Rational function with two vertical asymptotes', x: [-5, 5], y: [-4, 5], h: 240,
      fns: [{ f, brk: [-2, 2] }], va: [{ v: -2, of: 0, side: 'l' }, { v: 2, of: 0 }], ha: [{ v: 1, of: 0, below: 1 }], xt: [{ v: -1, up: 1, s: false }, { v: 1, up: 1, s: false }], yt: [],
      pts: [{ x: 0, of: 0, chk: 'tp', pos: 'n', dy: -2 }, { x: -1, of: 0, chk: 'zero', s: '−1', pos: 's', dx: -4 }, { x: 1, of: 0, chk: 'zero', s: '1', pos: 's', dx: 4 }] }); } },
  { sec: 4, t: 'Oblique asymptote: (x² + 1)/(x − 1)', cap: 'Divide: $\\dfrac{x^2+1}{x-1}=x+1+\\dfrac2{x-1}$. So $x=1$ is vertical and $y=x+1$ is an **oblique** asymptote (top degree one more than bottom). Turning points where $(x-1)^2=2$: max $(1-\\sqrt2,\\,2-2\\sqrt2)$, min $(1+\\sqrt2,\\,2+2\\sqrt2)$. $y$-intercept $-1$.',
    svg: () => { const f = x => (x * x + 1) / (x - 1); return plot({ id: 'Rational function with oblique asymptote', x: [-4, 6], y: [-7, 11], h: 250,
      fns: [{ f, brk: [1] }], va: [{ v: 1, of: 0 }], oa: [{ m: 1, c: 1, of: 0, s: 'y = x + 1', lx: -3.3, dx: 0, dy: 18 }], xt: [], yt: [],
      pts: [{ x: 1 - Math.SQRT2, of: 0, chk: 'tp', pos: 'nw', dy: -22 }, { x: 1 + Math.SQRT2, of: 0, chk: 'tp', pos: 'ne', dy: -30 }, { x: 0, of: 0, s: false, r: 3.5 }] }); } },
  { sec: 4, t: 'A hole, not an asymptote', cap: '$y=\\dfrac{x^2-x-2}{x^2-4}=\\dfrac{(x+1)(x-2)}{(x+2)(x-2)}$. The factor $(x-2)$ **cancels**, leaving $\\frac{x+1}{x+2}$ with a **hole** at $(2,\\frac34)$ (open circle). Only $x=-2$ is an asymptote. Horizontal asymptote $y=1$.',
    svg: () => { const f = x => (x * x - x - 2) / (x * x - 4); return plot({ id: 'Rational function with a hole', x: [-6, 4], y: [-4, 5], h: 230,
      fns: [{ f, brk: [-2, 2] }], va: [{ v: -2, of: 0, side: 'l' }], ha: [{ v: 1, of: 0 }], xt: [], yt: [],
      pts: [{ x: 2, of: 0, hole: 1, pos: 'se', c: 'warn', note: 'hole' }, { x: -1, of: 0, chk: 'zero', pos: 'se', s: '(−1, 0)' }, { x: 0, of: 0, pos: 'nw', dy: -14 }] }); } },
  // 6. Inverse functions
  { sec: 5, t: 'Inverse: reflect in y = x', cap: '$f(x)=\\sqrt{x+2}$ and $f^{-1}(x)=x^2-2$, $x\\ge0$. Every point $(a,b)$ goes to $(b,a)$: $(-2,0)\\to(0,-2)$, $(0,\\sqrt2)\\to(\\sqrt2,0)$. Domain and range **swap**. Increasing $f$ meets $f^{-1}$ only on $y=x$: $\\sqrt{x+2}=x$ gives $(2,2)$.',
    svg: () => { const f = x => Math.sqrt(x + 2), g = x => x * x - 2; return plot({ id: 'Square root function and its inverse', x: [-3, 4], y: [-3, 4], w: 260, h: 260,
      fns: [{ f: x => x, c: 'mute', w: 1.4, dash: 1 }, { f, d: [-2, 4.1], lab: { x: -1.6, s: 'f', dy: -12 } }, { f: g, d: [0, 2.5], c: 'warn', inv: 1, lab: { x: 2.3, s: 'f⁻¹', dx: 8, dy: 4 } }], xt: [], yt: [],
      pts: [{ x: 2, of: 1, w: 2, pos: 'nw', c: 'ink', test: (x, y) => Math.abs(x - y) < 1e-12 }, { x: -2, of: 1, pos: 'n' }, { x: 0, of: 2, pos: 'e', c: 'warn' }, { x: 0, of: 1, pos: 'nw', r: 3.5 }, { x: Math.SQRT2, of: 2, pos: 'se', c: 'warn', r: 3.5 }] }); } },
  { sec: 5, t: 'Trap: a decreasing function can meet its inverse off y = x', cap: '$f(x)=-x^3$ has inverse $f^{-1}(x)=-\\sqrt[3]x$. Solving $f(x)=x$ gives only $(0,0)$, but $f(x)=f^{-1}(x)$ also gives $(1,-1)$ and $(-1,1)$, mirror images across $y=x$. Only for **increasing** $f$ is it safe to solve $f(x)=x$.',
    svg: () => { const f = x => -(x ** 3), g = x => -Math.cbrt(x); return plot({ id: 'Decreasing cubic and its inverse', x: [-2, 2], y: [-2, 2], w: 260, h: 260,
      fns: [{ f: x => x, c: 'mute', w: 1.4, dash: 1 }, { f, lab: { x: -1.15, s: 'f', dx: 10 } }, { f: g, c: 'warn', d: [-2.1, 2.1], inv: 1, lab: { x: -1.9, s: 'f⁻¹', dy: -10 } }], xt: [], yt: [],
      pts: [{ x: 0, of: 1, w: 2, s: false, c: 'ink' }, { x: 1, of: 1, w: 2, pos: 'e', c: 'warn' }, { x: -1, of: 1, w: 2, pos: 'w', c: 'warn' }] }); } },
  { sec: 5, t: 'Horizontal line test, then restrict', cap: '$y=x^2-2x$ is **not** one-to-one: the line $y=3$ meets it at $x=-1$ and $x=3$. Restrict to $x\\ge1$ (from the vertex $(1,-1)$, bold) to get an inverse function: $f^{-1}(x)=1+\\sqrt{x+1}$, $x\\ge-1$.',
    svg: () => { const f = x => x * x - 2 * x; return plot({ id: 'Parabola failing the horizontal line test', x: [-2, 4], y: [-2, 5], h: 230,
      fns: [{ f, faint: 1, d: [-2, 1] }, { f, d: [1, 4.1], lab: { x: 3.3, s: 'x ≥ 1', dx: 8, dy: 8 } }, HL(3, -2, 4)], xt: [], yt: [{ v: 3, s: 'y = 3', r: 1, dy: -10 }],
      pts: [{ x: -1, of: 0, pos: 'nw', c: 'warn' }, { x: 3, of: 1, pos: 'nw', c: 'warn' }, { x: 1, of: 1, chk: 'tp', pos: 'se' }] }); } },
  // 7. Inverse trig
  { sec: 6, t: 'y = 2 sin⁻¹(2x − 1): transform the endpoints', cap: '$-1\\le2x-1\\le1$ gives domain $0\\le x\\le1$ (squashed and shifted). Multiply the range by $2$: $-\\pi\\le y\\le\\pi$. Endpoints $(0,-\\pi)$, $(1,\\pi)$ and centre $(\\frac12,0)$. Faint: $y=\\sin^{-1}x$.',
    svg: () => { const g = x => 2 * Math.asin(2 * x - 1); return plot({ id: 'Transformed inverse sine', x: [-1.4, 1.6], y: [-3.7, 3.7], h: 240,
      fns: [{ f: Math.asin, faint: 1, d: [-1, 1], lab: { x: -0.6, s: 'sin⁻¹x', a: 'end', dx: -8, dy: -6 } }, { f: g, d: [0, 1] }], xt: [{ v: -1, s: false }], yt: [{ v: Math.PI / 2, s: false }, { v: -Math.PI / 2, s: false }],
      pts: [{ x: 0, of: 1, pos: 'e' }, { x: 1, of: 1, pos: 'w' }, { x: 0.5, of: 1, pos: 'e', dy: 8 }, { x: 1, of: 0, pos: 'e', c: 'mute', r: 3 }, { x: -1, of: 0, pos: 'w', c: 'mute', r: 3, dy: -16 }] }); } },
  { sec: 6, t: 'cos⁻¹(−x) = π − cos⁻¹x', cap: 'The graph of $y=\\cos^{-1}x$ has **point symmetry** about $(0,\\frac\\pi2)$: if $(a,\\theta)$ is on it then so is $(-a,\\pi-\\theta)$. So $\\cos^{-1}(-x)=\\pi-\\cos^{-1}x$ (it is **not** odd). Compare $\\sin^{-1}(-x)=-\\sin^{-1}x$ (odd, symmetric about $O$).',
    svg: () => { const a = 0.6; return plot({ id: 'Point symmetry of inverse cosine', x: [-1.5, 1.5], y: [-0.5, 3.6], h: 230,
      fns: [{ f: Math.acos, d: [-1, 1] }], xt: [{ v: -1 }, { v: 1 }], yt: [],
      extra: (mx, my) => L(mx(a), my(Math.acos(a)), mx(-a), my(Math.acos(-a)), 'mute', 1.3, true) + L(mx(a), my(0), mx(a), my(Math.acos(a)), 'mute', 1, true) + L(mx(-a), my(0), mx(-a), my(Math.acos(-a)), 'mute', 1, true),
      pts: [{ x: -1, of: 0, pos: 'e' }, { x: 1, of: 0, pos: 'ne', dx: -4, dy: -4, s: '(1, 0)' }, { x: 0, of: 0, pos: 'e', c: 'warn' }, { x: a, of: 0, s: '(a, θ)', pos: 'ne', c: 'pen' }, { x: -a, of: 0, s: '(−a, π − θ)', pos: 'nw', c: 'pen', dy: 4, test: (x, y) => Math.abs(y - (Math.PI - Math.acos(a))) < 1e-12 }] }); } },
  { sec: 6, t: 'y = sin⁻¹(sin x) is a zigzag', cap: '$\\sin^{-1}(\\sin x)=x$ **only** for $-\\frac\\pi2\\le x\\le\\frac\\pi2$. Elsewhere the output is pulled back into $[-\\frac\\pi2,\\frac\\pi2]$: the graph is a zigzag of slope $\\pm1$ with period $2\\pi$. E.g. for $\\frac\\pi2\\le x\\le\\frac{3\\pi}2$ it is $\\pi-x$. But $\\sin(\\sin^{-1}x)=x$ for all $|x|\\le1$.',
    svg: () => plot({ id: 'Inverse sine of sine', x: [-7, 7], y: [-2.3, 2.3], h: 200, xlabUp: 1,
      fns: [{ f: Math.sin, faint: 1 }, { f: x => Math.asin(Math.sin(x)) }], xt: [{ v: -2 * Math.PI, dx: 12 }, { v: -Math.PI, dx: -12 }, { v: Math.PI, dx: -12 }, { v: 2 * Math.PI, dx: 12 }], yt: [],
      pts: [{ x: Math.PI / 2, of: 1, pos: 'ne', dx: -2 }, { x: 3 * Math.PI / 2, of: 1, pos: 's', dy: 2 }, { x: -Math.PI / 2, of: 1, s: false }, { x: -3 * Math.PI / 2, of: 1, s: false }] }) },
  // 8. Inequalities and number of solutions
  { sec: 7, t: '|2x − 3| ≤ x + 1 graphically', cap: 'Draw the V $y=|2x-3|$ (vertex $(\\frac32,0)$) and the line $y=x+1$. The V is **below** the line between the intersections: $-(2x-3)=x+1$ gives $x=\\frac23$, and $2x-3=x+1$ gives $x=4$. Solution (green) $\\frac23\\le x\\le4$.',
    svg: () => { const v = x => Math.abs(2 * x - 3), l = x => x + 1; return plot({ id: 'Absolute value inequality', x: [-1.5, 5.8], y: [-1.5, 7.5], h: 240,
      fns: [{ f: v, lab: { x: -0.9, s: '|2x − 3|', dx: 8, dy: 2 } }, { f: l, c: 'warn', lab: { x: 5.75, s: 'x + 1', dy: 18, a: 'end' } }], xt: [], yt: [],
      xint: [{ a: 2 / 3, b: 4, ca: 1, cb: 1 }], pts: [{ x: 2 / 3, of: 0, w: 1, pos: 'nw' }, { x: 4, of: 0, w: 1, pos: 'nw' }, { x: 1.5, of: 0, s: false, r: 3 }] }); } },
  { sec: 7, t: 'Number of solutions of x³ − 3x = k', cap: 'Count where the horizontal line $y=k$ meets $y=x^3-3x$. Turning points $(-1,2)$ and $(1,-2)$. **Three** solutions for $-2<k<2$, **two** for $k=\\pm2$ (tangent), **one** for $|k|>2$.',
    svg: () => { const f = x => x ** 3 - 3 * x; return plot({ id: 'Cubic cut by horizontal lines', x: [-2.6, 2.6], y: [-3, 4], h: 240,
      fns: [{ f }, HL(1, -2.6, 2.6), HL(2, -2.6, 2.6), HL(3, -2.6, 2.6)], xt: [], yt: [{ v: 1, s: 'k = 1: 3', r: 1, dy: 12 }, { v: 3, s: 'k = 3: 1', r: 1, dy: -10 }],
      pts: [{ x: -1, of: 0, chk: 'tp', w: 2, pos: 'nw', note: '2 sols' }, { x: 1, of: 0, chk: 'tp', pos: 'e' }] }); } },
  { sec: 7, t: 'Rational inequality: x/(x − 2) ≥ 3', cap: 'The curve is on or above $y=3$ between the asymptote $x=2$ (excluded) and the intersection $(3,3)$. Algebra agrees: multiply by $(x-2)^2$ to get $(x-2)(x-3)\\le0$, $x\\ne2$, so $2<x\\le3$ (green).',
    svg: () => { const f = x => x / (x - 2); return plot({ id: 'Rational inequality graph', x: [-2, 7], y: [-3, 7], h: 230,
      fns: [{ f, brk: [2] }, HL(3, -2, 7)], va: [{ v: 2, of: 0, side: 'l' }], ha: [{ v: 1, of: 0, below: 1 }], xt: [], yt: [{ v: 3, s: 'y = 3', r: 1, dy: -10 }],
      xint: [{ a: 2, b: 3, ca: 0, cb: 1 }], pts: [{ x: 3, of: 0, w: 1, pos: 'ne' }] }); } },
  // 9. Parametric
  { sec: 8, t: 'Circle: x = 1 + 3cos t, y = −2 + 3sin t', cap: 'Isolate $\\cos t$ and $\\sin t$, then use $\\cos^2t+\\sin^2t=1$: $(x-1)^2+(y+2)^2=9$, centre $(1,-2)$, radius $3$. As $t$ increases from $0$ the point moves **anticlockwise** from $(4,-2)$. A restricted $t$ gives only an arc.',
    svg: () => plot({ id: 'Parametric circle', x: [-3, 5], y: [-6, 2], w: 260, h: 260,
      fns: [{ p: t => [1 + 3 * Math.cos(t), -2 + 3 * Math.sin(t)], t: [0, 2 * Math.PI], arrows: [Math.PI / 4, 5 * Math.PI / 4] }], xt: [], yt: [],
      pts: [{ x: 1, y: -2, pos: 'n', c: 'ink', r: 3, note: 'centre' }, { x: 4, y: -2, pos: 'sw', note: 't = 0', test: (x, y) => Math.abs((x - 1) ** 2 + (y + 2) ** 2 - 9) < 1e-12 }] }) },
  { sec: 8, t: 'Parabola: x = 2t, y = t²', cap: '$t=\\frac x2$, so $y=\\frac{x^2}4$, i.e. $x^2=4y$. Points marked with their $t$ values: the arrow shows the direction of increasing $t$ (left to right). Any $t\\in\\mathbb R$ gives the whole parabola.',
    svg: () => plot({ id: 'Parametric parabola', x: [-5, 5], y: [-1.2, 6], h: 230,
      fns: [{ p: t => [2 * t, t * t], t: [-2.6, 2.6], arrows: [-1.5, 1.5] }], xt: [], yt: [],
      pts: [-2, -1, 0, 1, 2].map(t => ({ x: 2 * t, y: t * t, pos: t < 0 ? 'e' : t > 0 ? 'w' : 'se', s: `t = ${nice(t)}`, r: 3.5, c: 'ink', test: (x, y) => Math.abs(y - x * x / 4) < 1e-12 })) }) },
  // 10. Transformations
  { sec: 9, t: 'y = 2√(½(x + 3)) − 1 from y = √x', cap: 'Write as $y=af(b(x-c))+d$ with $a=2,b=\\frac12,c=-3,d=-1$. Each point $(X,Y)$ of $\\sqrt x$ goes to $\\left(\\frac Xb+c,\\ aY+d\\right)$: $(0,0)\\to(-3,-1)$, $(4,2)\\to(5,3)$. Horizontal: dilate by $\\frac1b=2$ **then** shift. Vertical: dilate by $a$ **then** shift.',
    svg: () => { const g = x => 2 * Math.sqrt((x + 3) / 2) - 1; return plot({ id: 'Transformed square root', x: [-4, 8], y: [-2, 5], h: 220,
      fns: [{ f: Math.sqrt, faint: 1, d: [0, 8], lab: { x: 6.5, s: '√x', dx: 2, dy: 18 } }, { f: g, d: [-3, 8] }], xt: [], yt: [],
      extra: (mx, my) => A(mx(0), my(0), mx(-3) + 5, my(-1) - 2, 'mute', 1.2) + A(mx(4), my(2), mx(5) - 3, my(3) + 5, 'mute', 1.2),
      pts: [{ x: 0, of: 0, s: false, c: 'mute', r: 3 }, { x: 4, of: 0, pos: 'se', c: 'mute', r: 3 }, { x: -3, of: 1, pos: 'se' }, { x: 5, of: 1, pos: 'nw' }] }); } },
  { sec: 9, t: 'y = 2 sin(2(x − π/4)) + 1 from y = sin x', cap: 'Period $\\frac{2\\pi}2=\\pi$, amplitude $2$, centre line $y=1$ (dashed), shifted $\\frac\\pi4$ right. Max $3$, min $-1$. Max at $2(x-\\frac\\pi4)=\\frac\\pi2$, i.e. $x=\\frac\\pi2$. Faint: $y=\\sin x$.',
    svg: () => { const g = x => 2 * Math.sin(2 * (x - Math.PI / 4)) + 1; return plot({ id: 'Transformed sine', x: [-0.4, 6.8], y: [-1.7, 3.7], h: 220,
      fns: [{ f: Math.sin, faint: 1, d: [0, 2 * Math.PI] }, { f: g, d: [0, 2 * Math.PI] }], ha: [{ v: 1, c: 'mute', s: 'y = 1', at: 'r' }], xt: [{ v: Math.PI, up: 1 }, { v: 2 * Math.PI, up: 1 }], yt: [],
      pts: [{ x: Math.PI / 2, of: 1, chk: 'tp', pos: 'ne' }, { x: Math.PI, of: 1, chk: 'tp', pos: 's' }, { x: 3 * Math.PI / 2, of: 1, chk: 'tp', pos: 'nw' }, { x: Math.PI / 4, of: 1, pos: 'nw', r: 3 }] }); } },
];
