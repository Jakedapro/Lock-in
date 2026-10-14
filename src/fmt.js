/* ===== Lock In — text formatting: safe HTML with proper maths (powers, fractions) and bold ===== */
const Fmt = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Hidden characters keep copy/paste and screen readers reading "3/8" and "x^2".
  const frac = (a, b) => `<span class="frac"><span class="num">${a}</span><span class="sr">/</span><span class="den">${b}</span></span>`;
  const sup = (p) => `<span class="sr">^</span><sup class="pow">${p}</sup>`;
  const TEX = { times: '×', div: '÷', pm: '±', pi: 'π', cdot: '·', le: '≤', ge: '≥', leq: '≤', geq: '≥', approx: '≈', neq: '≠', degree: '°', circ: '°' };

  // Real maths ($…$, $$…$$, \(…\), \[…\]) becomes a span that MathJax typesets in the page.
  const MATH = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g;
  const mathSpan = (tex, display) => { const t = esc(tex.trim()); return `<span class="m${display ? ' d' : ''}" data-tex="${t}">${t}</span>`; };

  // One line of text → HTML.
  function text(s) {
    s = String(s ?? ''); let out = '', last = 0, m;
    MATH.lastIndex = 0;
    while ((m = MATH.exec(s))) {
      const inline = m[4];
      if (inline !== undefined && /^\d[\d,.]*(\s|$)/.test(inline) && !/[\\^_{}]/.test(inline)) continue; // "$45 … $9" is money, not maths
      out += plain(s.slice(last, m.index)) + mathSpan(m[1] ?? m[2] ?? m[3] ?? inline, m[1] !== undefined || m[2] !== undefined);
      last = MATH.lastIndex;
    }
    return out + plain(s.slice(last));
  }

  // Text outside maths delimiters: escape, then tidy powers, fractions, bold and stray LaTeX.
  function plain(s) {
    let h = esc(s);
    h = h.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, a, b) => frac(a, b));
    h = h.replace(/\\sqrt\{([^{}]+)\}/g, '√$1');
    h = h.replace(/\\([a-z]+)\b/g, (m, w) => TEX[w] || m);
    // Powers: x^2, x^{n+1}, and the unicode ² ³ (which most fonts draw too small).
    h = h.replace(/\^\{([^{}]+)\}/g, (_, p) => sup(p)).replace(/\^(-?\w+)/g, (_, p) => sup(p));
    h = h.replace(/²/g, sup('2')).replace(/³/g, sup('3'));
    // Whole-number fractions like 3/8 (not dates, decimals, units or (v − u)/a).
    h = h.replace(/(^|[^\w.\/])(-?\d+)\/(\d+)(?![\w.\/])/g, (_, pre, a, b) => pre + frac(a, b));
    // Bold: **x** and *x* (but not multiplication like 3 * 4 or 2*3).
    h = h.replace(/\*\*(?=\S)([^\n]*?\S)\*\*/g, '<b>$1</b>');
    h = h.replace(/(^|[^\w*])\*(?=\S)([^*\n]*?\S)\*(?![\w*])/g, '$1<b>$2</b>');
    return h;
  }

  // Multi-line answers (AI replies): headings, bullet lists and line breaks too.
  function rich(s) {
    // Keep multi-line $$ … $$ blocks together before splitting into lines.
    return String(s ?? '').replace(/\$\$[\s\S]+?\$\$/g, b => b.replace(/\n/g, ' ')).split('\n').map(line => {
      let m = line.match(/^\s*#{1,6}\s+(.*)$/); if (m) return `<b class="h">${text(m[1])}</b>`;
      m = line.match(/^\s*[-*•]\s+(.*)$/); if (m) return `<span class="li">${text(m[1])}</span>`;
      return text(line);
    }).join('\n');
  }

  return { text, rich, esc };
})();
if (typeof module !== 'undefined') module.exports = Fmt;
