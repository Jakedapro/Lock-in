/* ===== Lock In — mix-and-match past papers (no DOM) =====
   Builds papers out of real HSC questions from different years, using the question map in
   PAPER_INDEX (year → multiple choice items and questions with their parts, marks, pages, topics).
   An item points at a page of the official paper; nothing from the papers themselves is stored. */
const Mix = (() => {
  const shuffle = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, r) => a[Math.floor(r() * a.length)];
  const years = (idx) => Object.keys(idx || {}).map(Number).sort((a, b) => a - b);
  const mcItem = (year, m) => ({ year, kind: 'mc', n: m.n, label: '', page: m.page, marks: 1, topics: m.topics || [] });
  const qItem = (year, q) => ({ year, kind: 'q', n: q.n, label: '', page: q.page, marks: q.marks, topics: [...new Set(q.parts.flatMap(p => p.topics || []))], parts: q.parts.map(p => ({ label: p.label, marks: p.marks, topics: p.topics })) });
  const partItem = (year, q, p) => ({ year, kind: 'part', n: q.n, label: p.label, page: p.page || q.page, marks: p.marks, topics: p.topics || [], about: p.about || '' });
  const total = (items) => items.reduce((a, i) => a + i.marks, 0);
  const mod = (code) => String(code).split('.')[0];

  // A full-length paper in the real layout: each multiple choice number and each long question
  // comes from a random year. Physics Section II is filled to 80 marks, balanced across modules.
  function randomPaper(sid, idx, rand = Math.random) {
    const Y = years(idx); if (!Y.length) return [];
    const mcN = Math.max(...Y.map(y => idx[y].mc.length)), items = [];
    for (let n = 1; n <= mcN; n++) { const ys = Y.filter(y => idx[y].mc.some(m => m.n === n)); const y = pick(ys, rand); items.push(mcItem(y, idx[y].mc.find(m => m.n === n))); }
    if (sid !== 'phys') {
      const qs = [...new Set(Y.flatMap(y => idx[y].q.map(q => q.n)))].sort((a, b) => a - b);
      let used = {};
      for (const n of qs) {
        let ys = Y.filter(y => idx[y].q.some(q => q.n === n) && (used[y] || 0) < 2); if (!ys.length) ys = Y.filter(y => idx[y].q.some(q => q.n === n));
        const y = pick(ys, rand); used[y] = (used[y] || 0) + 1; items.push(qItem(y, idx[y].q.find(q => q.n === n)));
      }
      return items;
    }
    // Physics: whole Section II questions, aiming for 80 marks with about 20 per module.
    const pool = shuffle(Y.flatMap(y => idx[y].q.map(q => qItem(y, q))), rand), chosen = [], perMod = {};
    const room = () => 80 - total(chosen);
    for (const q of pool) {
      if (room() <= 0) break;
      const m = mod(q.topics[0] || '0');
      if (q.marks > room() || (perMod[m] || 0) + q.marks > 24) continue;
      chosen.push(q); perMod[m] = (perMod[m] || 0) + q.marks;
    }
    for (const q of pool) { if (room() <= 0) break; if (!chosen.includes(q) && q.marks <= room()) chosen.push(q); } // fill any gap
    chosen.sort((a, b) => mod(a.topics[0]) - mod(b.topics[0]) || a.year - b.year || a.n - b.n);
    return [...items, ...chosen];
  }

  // Questions on chosen topics from every year, about `marks` marks: question parts first,
  // plus up to a fifth of the marks as matching multiple choice.
  function byTopic(sid, idx, codes, marks = 30, rand = Math.random) {
    const want = new Set(codes), hit = (t) => (t || []).some(c => want.has(c));
    const Y = years(idx);
    const parts = shuffle(Y.flatMap(y => idx[y].q.flatMap(q => q.parts.filter(p => hit(p.topics) && p.marks > 0).map(p => partItem(y, q, p)))), rand);
    const mcs = shuffle(Y.flatMap(y => idx[y].mc.filter(m => hit(m.topics)).map(m => mcItem(y, m))), rand);
    const items = [], mcCap = Math.floor(marks / 5);
    for (const m of mcs) { if (items.length >= mcCap) break; items.push(m); }
    for (const p of parts) { if (total(items) >= marks) break; if (total(items) + p.marks <= marks + 2) items.push(p); }
    if (total(items) < marks) for (const m of mcs) { if (total(items) >= marks) break; if (!items.includes(m)) items.push(m); }
    return items.sort((a, b) => (a.kind === 'mc') === (b.kind === 'mc') ? a.year - b.year || a.n - b.n || String(a.label).localeCompare(String(b.label)) : a.kind === 'mc' ? -1 : 1);
  }
  // How many marks of each topic there are across all papers (to show what's common).
  function topicCounts(idx) {
    const c = {};
    for (const y of years(idx)) {
      idx[y].mc.forEach(m => (m.topics || []).slice(0, 1).forEach(t => c[t] = (c[t] || 0) + 1));
      idx[y].q.forEach(q => q.parts.forEach(p => (p.topics || []).slice(0, 1).forEach(t => c[t] = (c[t] || 0) + p.marks)));
    }
    return c;
  }
  const minutes = (items, perMark) => Math.max(10, Math.round(total(items) * perMark / 5) * 5);
  // "2023 Q13(b)(ii)": a part label like "b(ii)" gets brackets round its first letter.
  const name = (i) => `${i.year} Q${i.n}${i.kind === 'part' && i.label ? String(i.label).replace(/^([a-z])/, '($1)') : ''}`;
  // Which pages of its year's paper an item needs: from where it starts to just before the next thing starts.
  function pagesFor(idx, item) {
    const P = idx && idx[item.year]; if (!P) return [item.page, item.page];
    const qs = P.q.slice().sort((a, b) => a.n - b.n), q = qs.find(x => x.n === item.n);
    const nextQ = q ? qs[qs.indexOf(q) + 1] : null, lastPartPage = q ? Math.max(q.page, ...q.parts.map(x => x.page || q.page)) : item.page;
    if (item.kind === 'mc') return [item.page, item.page];
    if (item.kind === 'q') return [q.page, Math.max(lastPartPage, nextQ ? nextQ.page - 1 : lastPartPage)];
    const parts = q ? q.parts : [], i = parts.findIndex(x => x.label === item.label), next = parts[i + 1];
    const start = item.page, nextStart = next ? (next.page || q.page) : nextQ ? nextQ.page : start;
    return [start, Math.max(start, nextStart > start ? nextStart - 1 : start)];
  }
  // Every page the paper needs, in order, each page only once: [{year, page}].
  function pageList(idx, items) {
    const seen = new Set(), out = [];
    for (const it of items) { const [a, b] = pagesFor(idx, it); for (let pg = a; pg <= b; pg++) { const k = it.year + ':' + pg; if (!seen.has(k)) { seen.add(k); out.push({ year: it.year, page: pg }); } } }
    return out;
  }

  return { randomPaper, byTopic, topicCounts, minutes, total, name, pagesFor, pageList };
})();
if (typeof module !== 'undefined') module.exports = Mix;
