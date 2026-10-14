/* ===== Lock In — writing feedback (no DOM, no AI) =====
   Reads an essay, a paragraph, a short answer or a piece of creative writing and checks the things
   HSC markers look for: a clear thesis, topic sentences, quotes with techniques and effects, formal
   analytical language, and (for creative) showing not telling, sensory detail and sentence variety.
   It's a checklist, not a mark: it can't judge how good an idea is. */
const WR = (() => {
  const words = (s) => s.match(/[A-Za-z][A-Za-z'’-]*/g) || [];
  const lc = (s) => s.toLowerCase();
  const STOP = new Set('a an the and or but nor so yet of to in on at by for with from into onto about as is are was were be been being it its this that these those there their they them he she his her him i me my we our you your who whom which what how why when where while than then also both each such can could may might must shall should will would do does did not no yes if because through how far extent to what does explore explores composer text texts your own way ways represent represents represented'.split(' '));
  const keyWords = (s) => [...new Set(words(lc(s)).map(w => w.replace(/['’]s$/, '')).filter(w => w.length > 3 && !STOP.has(w)))];
  const stem = (w) => w.replace(/(ations?|ings?|ed|es|s|ly|ity|ness|ment|al)$/, '').slice(0, 7);
  const overlap = (a, b) => { const B = new Set(b.map(stem)); return a.filter(w => B.has(stem(w))).length; };

  /* ---------- vocabulary ---------- */
  const TECH = ['extended metaphor', 'metaphors?', 'similes?', 'personification', 'personified', 'imagery', 'images?', 'symbolism', 'symbol(?:s|ic|ises|izes)?', 'motifs?', 'juxtapos(?:ition|es|ed|ing)', 'alliteration', 'alliterative', 'sibilance', 'assonance', 'consonance', 'onomatopoeia', 'hyperbole', 'hyperbolic', '(?:dramatic |situational |verbal )?irony', 'ironic(?:ally)?', 'paradox(?:es|ical)?', 'oxymor(?:on|ons|onic)', 'allusions?', 'rhetorical questions?', 'repetition', 'repeated', 'anaphora', 'tricolon', '(?:cumulative )?listing', 'enjambment', 'caesura', 'foreshadow(?:ing|s|ed)?', 'flashbacks?', 'characteri[sz]ation', 'dialogue', 'first[- ]person', 'second[- ]person', 'third[- ]person', 'narrative voice', 'narrator', 'tone', 'emotive language', 'high modality', 'modality', 'imperatives?', 'colloquial(?:ism|isms)?', 'pathetic fallacy', 'synecdoche', 'metonymy', 'structure', 'cyclical', 'fragment(?:ed|ation|s)', 'contrast(?:s|ing)?', 'camera angles?', '(?:low|high)[- ]angle(?: shot)?', 'close[- ]ups?', '(?:long|wide|medium) shots?', 'lighting', 'colour palette', 'diegetic', 'non[- ]diegetic', 'salience', 'vectors?', 'framing', 'montage', 'voice[- ]?over', 'polysyndeton', 'asyndeton', 'apostrophe', 'epistolary', 'intertextual(?:ity)?', 'satir(?:e|ical)', 'parody', 'allegor(?:y|ical)', 'archetyp(?:e|al)', 'stream of consciousness', 'free indirect discourse', 'rhyme', 'rhythm', 'meter', 'volta', 'sonnet', 'refrain', 'free verse', 'ellipsis', 'hypophora', 'anecdotes?', 'statistics', 'inclusive language', 'direct address', 'sensory language', 'visual imagery', 'auditory imagery', 'connotations?', 'diction', 'register', 'syntax', 'truncated sentences?', 'minor sentences?', 'binary opposition', 'setting', 'climax', 'in medias res', 'unreliable narrator', 'pun', 'euphemism', 'understatement', 'litotes', 'chiasmus', 'antithesis'];
  const TECH_RE = new RegExp(`\\b(?:${TECH.join('|')})\\b`, 'gi');
  const VERBS = ['convey', 'highlight', 'emphasi[sz]e', 'underscore', 'foreground', 'illuminate', 'reveal', 'suggest', 'evoke', 'position', 'invite', 'challenge', 'critique', 'interrogate', 'subvert', 'reinforce', 'accentuate', 'epitomi[sz]e', 'encapsulate', 'exemplif(?:y|ies|ied|ying)', 'capture', 'explore', 'represent', 'depict', 'portray', 'symboli[sz]e', 'signif(?:y|ies|ied|ying)', 'reflect', 'elucidate', 'establish', 'expose', 'condemn', 'celebrate', 'lament', 'satiri[sz]e', 'amplif(?:y|ies|ied|ying)', 'heighten', 'intensif(?:y|ies|ied|ying)', 'dramati[sz]e', 'mirror', 'embod(?:y|ies|ied|ying)', 'compel', 'prompt', 'elicit', 'implicate', 'undermine', 'construct', 'distil', 'evince', 'denote', 'connote', 'imply', 'implies', 'implied', 'characteri[sz]e', 'allude', 'demonstrate', 'illustrate', 'contrast', 'juxtapose', 'cultivate', 'galvani[sz]e', 'humani[sz]e', 'vilif(?:y|ies|ied|ying)', 'valori[sz]e', 'problemati[sz]e', 'expose', 'unveil'];
  // convey -> conveys/conveyed/conveying; emphasise -> emphasises/emphasised/emphasising
  const VERB_RE = new RegExp(`\\b(?:${VERBS.map(v => /\(\?:|implie/.test(v) ? v : /e$/.test(v) ? `${v.slice(0, -1)}(?:e|es|ed|ing)` : `${v}(?:s|es|ed|ing)?`).join('|')})\\b`, 'gi');
  const WEAK = [
    ['shows?|showing|showed', 'shows', 'Use a sharper verb: conveys, reveals, underscores, foregrounds.'],
    ['very', 'very', 'Cut it, or choose one stronger word (very sad → desolate).'],
    ['really', 'really', 'Cut it. It adds nothing in an essay.'],
    ['a lot(?: of)?|lots of', 'a lot', 'Too casual: try "considerably", "many" or "much".'],
    ['things?|stuff', 'things', 'Name the actual idea, image or event.'],
    ['good|bad|nice|amazing|interesting|cool', 'vague praise', 'Say what it does, not how it feels: "a confronting image" beats "a good image".'],
    ['basically|kind of|sort of|pretty much', 'filler', 'Cut it. It makes the point sound unsure.'],
    ['talks? about|talking about', 'talks about', 'Try "explores", "examines" or "interrogates".'],
    ['says|said', 'says', 'Try "asserts", "declares", "laments" or "concedes" (or quote and analyse).'],
    ['uses', 'uses', '"The composer uses…" is fine once. Lead with the effect instead: "Through …, X conveys …".'],
  ];
  const WEAK_RE = WEAK.map(([re, label, tip]) => [new RegExp(`\\b(?:${re})\\b`, 'gi'), label, tip]);
  const INFORMAL = [
    [/\b(?:don't|can't|won't|isn't|aren't|wasn't|weren't|it's|that's|there's|they're|we're|you're|i'm|i've|i'd|doesn't|didn't|couldn't|shouldn't|wouldn't|hasn't|haven't|let's|who's|what's)\b/gi, 'contraction', 'Write it out in full (do not, it is).'],
    [/\b(?:I think|I believe|I feel|in my opinion|I will|I am going to)\b/gi, 'first person', 'State it as an argument instead of an opinion: drop "I think".'],
    [/\b(?:gonna|wanna|kinda|gotta|heaps|super|awesome|stuff like that|etc)\b/gi, 'slang', 'Too casual for an essay.'],
    [/\b(?:you|your)\b/gi, 'second person', 'Avoid "you" in an essay: say "the responder" or "the audience".'],
  ];
  const RETELL_RE = /\b(?:then|after that|afterwards|at the start of the (?:novel|play|film|text|story)|at the beginning|in the end|the story begins|later on|next,|eventually|meanwhile|the plot)\b/gi;
  const LINK_RE = /\b(?:furthermore|moreover|similarly|likewise|conversely|in contrast|however|ultimately|consequently|thus|hence|therefore|additionally|equally|nevertheless|whereas|while|although|alternatively|accordingly|subsequently|in doing so|by extension|as such)\b/gi;
  // Creative writing
  const TELL_RE = /\b(?:felt|feel|feels|feeling|saw|see|sees|heard|hear|hears|noticed|notice|notices|realised|realized|realise|realize|seemed|seems|wondered|thought|knew)\b/gi;
  const EMOTION_RE = /\b(?:sad|happy|angry|mad|scared|afraid|nervous|excited|upset|terrified|lonely|jealous|anxious|depressed|furious|joyful|worried|frightened|embarrassed|ashamed|confused|shocked|surprised)\b/gi;
  const ADVERB_OK = new Set(['only', 'family', 'early', 'likely', 'lonely', 'ugly', 'holy', 'belly', 'jelly', 'reply', 'fly', 'july', 'italy', 'sly', 'supply', 'apply', 'rely', 'ally', 'bully', 'silly', 'daily', 'weekly', 'friendly', 'lovely', 'elderly', 'costly', 'chilly', 'curly', 'hilly', 'oily', 'woolly', 'surly', 'burly', 'lily', 'molly', 'emily', 'sally', 'kelly', 'holly', 'rally', 'tally', 'gully', 'folly', 'trolley', 'assembly', 'anomaly', 'butterfly', 'monopoly', 'homily']);
  const ADVERB_RE = /\b[a-z]{3,}ly\b/gi;
  const CLICHE = ['all of a sudden', 'out of nowhere', 'heart (?:was )?pounding', 'heart (?:was )?racing', 'time stood still', 'it was all (?:just )?a dream', 'little did (?:i|he|she|they|we) know', 'dead of (?:the )?night', 'cold as ice', 'blood ran cold', 'tears streamed down', 'at the end of the day', 'in today\'s society', 'since the dawn of time', 'throughout history', 'it goes without saying', 'needless to say', 'roller ?coaster of emotions', 'calm before the storm', 'a breath (?:i|he|she|they) didn\'t know', 'once upon a time', 'it was a dark and stormy night', 'and then (?:i|he|she) woke up', 'the end\\.?$', 'without a shadow of a doubt', 'only time will tell', 'butterflies in (?:my|her|his) stomach', 'eyes (?:were )?glued', 'frozen in fear', 'scared to death', 'like there was no tomorrow', 'easier said than done', 'every cloud has a silver lining', 'in the blink of an eye', 'avoid (?:it )?like the plague'];
  const CLICHE_RE = new RegExp(`\\b(?:${CLICHE.join('|')})`, 'gim');
  const SENSES = {
    sight: /\b(?:glint\w*|gleam\w*|shadow\w*|flicker\w*|glow\w*|shimmer\w*|dim|blaze\w*|bright\w*|pale|grey|gray|crimson|scarlet|golden|silver|blue|green|amber|black|white|dusk|haze|blur\w*|glare\w*|sparkl\w*|stain\w*)\b/i,
    sound: /\b(?:whisper\w*|hum\w*|crack\w*|roar\w*|murmur\w*|rustl\w*|clatter\w*|hiss\w*|creak\w*|thud\w*|echo\w*|silence|silent|hush\w*|scream\w*|shriek\w*|buzz\w*|rumbl\w*|click\w*|ticking|chim\w*|drone\w*|sigh\w*|crunch\w*|squeal\w*|thrum\w*|whir\w*)\b/i,
    smell: /\b(?:smell\w*|scent\w*|stench|aroma|reek\w*|smok\w*|musty|perfume\w*|odour\w*|fragran\w*|whiff|stale|rotting|damp earth|petrol|eucalyptus|incense)\b/i,
    touch: /\b(?:rough|smooth|cold|warm|damp|sting\w*|prickl\w*|brush\w*|grip\w*|ache|aching|sharp|soft|sticky|icy|burn\w*|numb|clammy|coarse|slick|tingl\w*|shiver\w*|press\w*|graz\w*)\b/i,
    taste: /\b(?:tast\w*|bitter|sweet|salt\w*|sour|metallic|tang\w*|bland|savour\w*|swallow\w*|tongue)\b/i,
  };
  const BAD_OPEN = [[/^(?:once upon a time)/i, '"Once upon a time" signals a fairytale. Unless that\'s the point, start in a moment instead.'], [/^(?:my name is|hi[,!]|hello[,!])/i, 'Starting with an introduction is flat. Drop the reader into a moment.'], [/^(?:one day)/i, '"One day" is a slow start. Begin in the middle of something happening.'], [/^(?:i woke up|beep|the alarm)/i, 'Waking-up openings are very common. Start later, when something changes.'], [/^(?:it was a dark and stormy)/i, 'This is the classic cliché opening. Start with a fresh image.']];

  /* ---------- splitting with positions ---------- */
  function paragraphs(text) {
    const out = [], re = /\n\s*\n/g; let last = 0, m;
    const blocks = re.test(text) ? null : text.split('\n').length > 3 ? '\n' : null; // no blank lines but many lines: one paragraph per line
    const sep = blocks ? /\n/g : /\n\s*\n/g; sep.lastIndex = 0;
    while ((m = sep.exec(text))) { push(last, m.index); last = sep.lastIndex; }
    push(last, text.length);
    function push(a, b) { const t = text.slice(a, b); const lead = t.length - t.trimStart().length; const body = t.trim(); if (body) out.push({ start: a + lead, end: a + lead + body.length, text: body }); }
    return out;
  }
  function sentences(text, base = 0) {
    const out = []; const re = /[^.!?]+(?:[.!?]+["'”’)]*|$)/g; let m;
    while ((m = re.exec(text))) {
      if (!m[0].trim()) { if (re.lastIndex === m.index) re.lastIndex++; continue; }
      const lead = m[0].length - m[0].trimStart().length, t = m[0].trim();
      // Keep "Mr. Smith" and initials together; split on real sentence ends only.
      if (out.length && /(?:\b(?:Mr|Mrs|Ms|Dr|St|vs|etc|e\.g|i\.e)\.|\b[A-Z]\.)$/.test(out[out.length - 1].text)) { const p = out[out.length - 1]; p.text = text.slice(p.start - base, m.index + lead + t.length).trim(); p.end = base + m.index + lead + t.length; continue; }
      out.push({ start: base + m.index + lead, end: base + m.index + lead + t.length, text: t });
    }
    return out;
  }
  const QUOTE_RE = /“[^”\n]{2,}”|"[^"\n]{2,}"|‘[^’\n]{4,}’(?![a-z])/g, HAS_QUOTE = new RegExp(QUOTE_RE.source);
  function find(re, text, base = 0) { const out = []; re.lastIndex = 0; let m; while ((m = re.exec(text))) { out.push({ start: base + m.index, end: base + m.index + m[0].length, text: m[0] }); if (re.lastIndex === m.index) re.lastIndex++; } return out; }

  /* ---------- the analysis ---------- */
  const KINDS = {
    essay: { label: 'Essay', words: [650, 1200], paras: [4, 7] },
    paragraph: { label: 'Body paragraph', words: [150, 320], paras: [1, 1] },
    short: { label: 'Short answer', words: null, paras: [1, 3] },
    creative: { label: 'Creative writing', words: [550, 1100], paras: [5, 30] },
  };
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const band = (x, lo, hi, soft) => (x >= lo && x <= hi ? 1 : x < lo ? clamp(1 - (lo - x) / (soft || lo)) : clamp(1 - (x - hi) / (soft || hi)));

  function analyse(raw, opts = {}) {
    const text = String(raw || '').replace(/\r\n?/g, '\n');
    const kind = KINDS[opts.kind] ? opts.kind : 'essay', K = KINDS[kind];
    const qWords = keyWords(opts.question || '');
    const paras = paragraphs(text), sents = sentences(text), W = words(text), nW = W.length;
    const marks = [], checks = [];
    const mark = (spans, k, note) => spans.forEach(s => marks.push({ start: s.start, end: s.end, kind: k, note }));
    const per100 = (n) => (nW ? n / nW * 100 : 0);
    const add = (c) => { c.status = c.score >= 0.8 ? 'good' : c.score >= 0.5 ? 'ok' : 'fix'; checks.push(c); };

    const quotes = find(QUOTE_RE, text).filter(q => words(q.text).length >= 1);
    const techs = find(TECH_RE, text), verbs = find(VERB_RE, text);
    const lens = sents.map(s => words(s.text).length).filter(n => n > 0);
    const avg = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
    const sd = lens.length ? Math.sqrt(lens.reduce((a, b) => a + (b - avg) ** 2, 0) / lens.length) : 0;
    const stats = { words: nW, sentences: lens.length, paragraphs: paras.length, avgSentence: Math.round(avg * 10) / 10, variety: Math.round(sd * 10) / 10, quotes: quotes.length, techniques: new Set(techs.map(t => lc(t.text))).size, readMins: Math.max(1, Math.round(nW / 200)) };
    if (nW < 25) return { kind, stats, checks: [{ id: 'length', title: 'Length', score: 0, status: 'fix', msg: 'Write at least a few sentences and I\'ll give you feedback.' }], marks: [], score: 0, label: 'Too short to check', next: [] };

    const inQuote = (pos) => quotes.some(q => pos >= q.start && pos < q.end);
    const weakHits = [];
    WEAK_RE.forEach(([re, label, tip]) => find(re, text).filter(h => !inQuote(h.start)).forEach(h => weakHits.push({ ...h, label, tip })));
    const informal = [];
    if (kind !== 'creative') INFORMAL.forEach(([re, label, tip]) => find(re, text).filter(h => !inQuote(h.start)).forEach(h => informal.push({ ...h, label, tip })));
    const longS = sents.filter(s => words(s.text).length > (kind === 'creative' ? 55 : 45));
    mark(longS, 'long', 'Very long sentence. Split it so each idea lands.');

    /* --- length and shape --- */
    if (K.words) {
      const [lo, hi] = K.words;
      add({ id: 'length', title: 'Length', score: band(nW, lo, hi, lo * 0.8), weight: 1, msg: nW < lo ? `${nW} words. Aim for about ${lo}–${hi} in exam conditions: develop another idea or another piece of evidence.` : nW > hi ? `${nW} words. That's long for ${kind === 'paragraph' ? 'one paragraph' : 'the time you get'}: cut repetition and retelling.` : `${nW} words: a good length for ${K.label.toLowerCase()}.` });
    } else {
      const mk = Math.max(1, Math.min(8, +opts.marks || 4)), lo = mk * 20, hi = mk * 60;
      add({ id: 'length', title: 'Length for the marks', score: band(nW, lo, hi, lo), weight: 1, msg: nW < lo ? `${nW} words for ${mk} marks is thin. Aim for roughly ${lo}–${hi}: one technique and its effect per mark.` : nW > hi ? `${nW} words is more than ${mk} marks needs. Get to the point faster.` : `${nW} words suits ${mk} marks.` });
    }

    if (kind === 'creative') creative(); else analytical();

    /* --- sentence control (all kinds) --- */
    const sc = kind === 'creative' ? clamp(0.4 + sd / 12) * (longS.length > 2 ? 0.8 : 1) : band(avg, 12, 30, 12) * (longS.length > 2 ? 0.7 : 1);
    add({ id: 'sentences', title: 'Sentence control', score: sc, weight: 0.8, msg: kind === 'creative' ? (sd < 5 ? `Your sentences are all about the same length (average ${stats.avgSentence} words). Mix short, punchy lines with longer flowing ones for rhythm.` : `Good rhythm: your sentence lengths vary (average ${stats.avgSentence} words).`) + (longS.length ? ` ${longS.length} very long sentence${longS.length > 1 ? 's are' : ' is'} highlighted.` : '') : avg > 30 ? `Average sentence is ${stats.avgSentence} words. Long sentences hide your argument: split them.` : avg < 12 ? `Average sentence is ${stats.avgSentence} words, which reads choppy. Combine related ideas with "while", "whereas" or "which".` : `Average sentence is ${stats.avgSentence} words: controlled and readable.${longS.length ? ` ${longS.length} very long sentence${longS.length > 1 ? 's' : ''} highlighted.` : ''}` });

    function analytical() {
      const body = kind === 'essay' && paras.length >= 3 ? paras.slice(1, -1) : paras;
      // Thesis / answering the question
      if (kind === 'essay') {
        const intro = paras[0], iw = words(intro.text).length, iS = sentences(intro.text, intro.start);
        const best = iS.map(s => ({ s, v: find(VERB_RE, s.text).length + (qWords.length ? overlap(keyWords(s.text), qWords) : 0) })).sort((a, b) => b.v - a.v)[0];
        const qHit = qWords.length ? overlap(keyWords(intro.text), qWords) / Math.min(qWords.length, 5) : null;
        const hasClaim = find(VERB_RE, intro.text).length > 0;
        let sc = (hasClaim ? 0.5 : 0.15) + (qHit == null ? 0.3 : clamp(qHit) * 0.35) + band(iw, 50, 160, 50) * 0.15;
        if (paras.length < 2) sc = Math.min(sc, 0.4);
        if (best && hasClaim) mark([best.s], 'thesis', 'Looks like your thesis.');
        add({ id: 'thesis', title: 'Thesis in the introduction', score: clamp(sc), weight: 1.6, msg: !hasClaim ? 'Your introduction doesn\'t make a clear argument yet. Write one sentence that answers the question directly: "Through …, [composer] conveys that …".' : qHit != null && qHit < 0.4 ? 'You make a claim, but it doesn\'t use the question\'s key words. Echo them so the marker can see you\'re answering this question.' : 'Your introduction makes a clear argument' + (qHit != null ? ' and picks up the question\'s key words.' : '.') + (iw > 170 ? ' It\'s long, though: keep it to your thesis and a roadmap.' : '') });
        // Conclusion
        if (paras.length >= 3) {
          const con = paras[paras.length - 1], cq = find(QUOTE_RE, con.text).length, cw = words(con.text).length;
          const back = overlap(keyWords(con.text), [...keyWords(intro.text), ...qWords]);
          const sc2 = clamp((back >= 3 ? 0.6 : back / 5) + (cq ? 0 : 0.2) + band(cw, 35, 150, 35) * 0.2);
          add({ id: 'conclusion', title: 'Conclusion', score: sc2, weight: 0.8, msg: cq ? 'Your conclusion brings in new quotes. Save evidence for body paragraphs and use the conclusion to sum up your argument.' : back < 3 ? 'Your conclusion doesn\'t clearly return to your thesis. Restate your argument in fresh words and say why it matters.' : 'Your conclusion returns to your argument without new evidence. Good.' });
        }
      }
      // Topic sentences
      if (body.length && kind !== 'short') {
        const thesisWords = kind === 'essay' ? keyWords(paras[0].text) : [];
        const results = body.map(p => {
          const first = sentences(p.text, p.start)[0]; if (!first) return 0;
          const fw = keyWords(first.text), n = words(first.text).length;
          const startsQuote = /^["“‘]/.test(first.text), plot = /^(?:in the (?:beginning|start)|at the (?:start|beginning)|first(?:ly)?,? the|the (?:novel|play|film|poem) (?:starts|begins))/i.test(first.text);
          const linked = overlap(fw, [...qWords, ...thesisWords]) >= 1 || find(VERB_RE, first.text).length > 0;
          const s = (linked ? 0.6 : 0.2) + (startsQuote || plot ? 0 : 0.25) + band(n, 10, 40, 10) * 0.15;
          if (s < 0.6) mark([first], 'topic', 'This topic sentence needs to make a point that links back to the question.');
          return s;
        });
        const sc = results.reduce((a, b) => a + b, 0) / results.length;
        add({ id: 'topics', title: kind === 'paragraph' ? 'Topic sentence' : 'Topic sentences', score: sc, weight: 1.2, msg: sc >= 0.8 ? 'Your paragraphs open with clear points that link to the question.' : 'Open every body paragraph with an argument, not a quote or plot event: "[Composer] uses [idea] to [effect], revealing [link to the question]." Weak ones are highlighted.' });
      }
      // Evidence
      const perPara = body.map(p => quotes.filter(q => q.start >= p.start && q.end <= p.end).length);
      const want = kind === 'short' ? Math.max(1, Math.ceil((+opts.marks || 4) / 2)) : 2;
      const evid = perPara.length ? perPara.reduce((a, n) => a + Math.min(1, n / want), 0) / perPara.length : 0;
      const longQ = quotes.filter(q => words(q.text).length > 25);
      mark(longQ, 'longquote', 'Long quote. Trim it to the key words you\'ll analyse.');
      add({ id: 'evidence', title: 'Quotes as evidence', score: clamp(evid - longQ.length * 0.1), weight: 1.4, msg: !quotes.length ? 'No quotes found. Every point needs evidence from the text, in quotation marks.' : evid < 0.7 ? `Some ${kind === 'short' ? 'parts of your answer' : 'paragraphs'} have fewer than ${want} quote${want > 1 ? 's' : ''}. Aim for ${want}–${want + 2} short, embedded quotes per ${kind === 'short' ? 'answer' : 'paragraph'}.` : `${quotes.length} quote${quotes.length > 1 ? 's' : ''}, spread across your ${kind === 'short' ? 'answer' : 'paragraphs'}.${longQ.length ? ' Trim the long ones to the key words.' : ''}` });
      // Techniques and effects: a quote is "dropped" when its sentence names no technique and no effect verb.
      const quoteSent = (q) => sents.find(s => q.start >= s.start && q.start < s.end);
      const dropped = quotes.filter(q => { const s = quoteSent(q); if (!s) return false; const i = sents.indexOf(s), nx = sents[i + 1], win = s.text + (nx && !HAS_QUOTE.test(nx.text) ? ' ' + nx.text : ''); return !(find(TECH_RE, win.replace(QUOTE_RE, '')).length || find(VERB_RE, win.replace(QUOTE_RE, '')).length); });
      mark(quotes.filter(q => !dropped.includes(q)), 'quote', 'Quote');
      mark(dropped, 'dropped', 'Dropped quote: say what technique it uses and what effect it has.');
      mark(techs.filter(t => !inQuote(t.start)), 'tech', 'Technique named');
      mark(verbs.filter(t => !inQuote(t.start)), 'verb', 'Analytical verb');
      const techPer = body.length ? body.map(p => new Set(find(TECH_RE, p.text.replace(QUOTE_RE, '')).map(t => lc(t.text))).size) : [];
      const tsc = techPer.length ? techPer.reduce((a, n) => a + Math.min(1, n / 2), 0) / techPer.length : 0;
      add({ id: 'techniques', title: 'Techniques named', score: tsc, weight: 1.2, msg: !techs.length ? 'You don\'t name any techniques. Name the technique for each quote (metaphor, juxtaposition, high modality…).' : tsc < 0.75 ? `You name ${stats.techniques} different technique${stats.techniques > 1 ? 's' : ''}. Aim for at least 2 in every body paragraph.` : `${stats.techniques} different techniques named. Good range.` });
      const verbRate = quotes.length ? Math.min(1, verbs.filter(v => !inQuote(v.start)).length / quotes.length) : (verbs.length ? 0.5 : 0);
      const effSc = Math.min(dropped.length ? 0.75 : 1, clamp(verbRate * 0.7 + (quotes.length ? (1 - dropped.length / quotes.length) * 0.3 : 0)));
      add({ id: 'effects', title: 'Analysis of effect', score: effSc, weight: 1.6, msg: dropped.length ? `${dropped.length} quote${dropped.length > 1 ? 's are' : ' is'} dropped in without analysis (highlighted). After each quote, explain the effect: what it makes the reader feel or understand, and how that answers the question.` : verbRate < 0.6 ? 'You explain some effects, but use more analytical verbs (conveys, underscores, foregrounds) to show what each technique does.' : 'You consistently explain what your evidence does. That\'s what lifts a response.' });
      // Retelling
      const retell = find(RETELL_RE, text).filter(h => !inQuote(h.start));
      const plotty = body.flatMap(p => sentences(p.text, p.start)).filter(s => !HAS_QUOTE.test(s.text) && !find(TECH_RE, s.text).length && !find(VERB_RE, s.text).length && /\b(?:goes|went|walks|walked|tells|told|meets|met|dies|died|decides|decided|leaves|left|finds|found|returns|returned|arrives|arrived|gets|got)\b/i.test(s.text));
      mark(plotty, 'retell', 'This sentence retells the plot. Analyse instead: how and why, not what happens.');
      mark(retell, 'retell', 'Plot-order word: are you retelling?');
      add({ id: 'retell', title: 'Analysis, not retelling', score: clamp(1 - plotty.length * 0.2 - retell.length * 0.06), weight: 1, msg: plotty.length ? `${plotty.length} sentence${plotty.length > 1 ? 's' : ''} retell${plotty.length === 1 ? 's' : ''} what happens. Markers assume you know the plot; spend the words on how the composer shapes meaning.` : retell.length > 2 ? 'A few plot-order words ("then", "in the end") suggest some retelling. Structure by ideas, not by what happens next.' : 'You stay analytical instead of retelling the plot.' });
      // Formal analytical language
      mark(weakHits, 'weak', null); mark(informal, 'informal', null);
      const verbsUsed = verbs.filter(v => !inQuote(v.start)).map(v => lc(v.text).replace(/(?:es|s|d|ed|ing)$/, '')), counts = {};
      verbsUsed.forEach(v => counts[v] = (counts[v] || 0) + 1);
      const overused = Object.entries(counts).filter(([, n]) => n >= 4).map(([v]) => v);
      const lsc = clamp(1 - per100(weakHits.length) * 0.18 - per100(informal.length) * 0.3 - overused.length * 0.08);
      const topWeak = [...new Set(weakHits.map(h => h.label))].slice(0, 3);
      add({ id: 'language', title: 'Formal, precise language', score: lsc, weight: 1, msg: [informal.length ? `${informal.length} informal bit${informal.length > 1 ? 's' : ''} (${[...new Set(informal.map(h => h.label))].join(', ')}).` : '', topWeak.length ? `Vague words to sharpen: ${topWeak.map(w => `"${w}"`).join(', ')}.` : '', overused.length ? `You lean on "${overused[0]}" a lot: vary your verbs.` : ''].filter(Boolean).join(' ') || 'Formal and precise. Your word choice sounds like an analytical response.', tips: [...new Map([...weakHits, ...informal].map(h => [h.label, h.tip])).values()].slice(0, 4) });
      // Linking
      if (kind === 'essay' && paras.length >= 3) {
        const links = find(LINK_RE, text);
        const opener = new RegExp(LINK_RE.source, 'i'), openers = body.filter(p => opener.test(p.text.slice(0, 80)));
        add({ id: 'cohesion', title: 'Linking ideas', score: clamp(Math.min(1, links.length / (paras.length * 1.2)) * 0.6 + (body.length ? openers.length / body.length : 0) * 0.4), weight: 0.6, msg: links.length < paras.length ? 'Use more linking words between ideas and paragraphs (furthermore, conversely, ultimately) so your argument builds.' : 'Your ideas are linked, so the argument builds from paragraph to paragraph.' });
      }
    }

    function creative() {
      const first = sents[0]?.text || '', last = paras[paras.length - 1];
      const bad = BAD_OPEN.find(([re]) => re.test(first));
      const short = words(first).length <= 14, dialogue = /^["“‘]/.test(first);
      if (bad) mark([sents[0]], 'cliche', bad[1]);
      add({ id: 'hook', title: 'Opening line', score: bad ? 0.25 : short || dialogue ? 1 : 0.7, weight: 1, msg: bad ? bad[1] : short || dialogue ? 'Strong start: short, immediate, and it makes the reader want the next line.' : 'Your first sentence is long. A short, specific opening line hooks harder.' });
      const tells = find(TELL_RE, text).filter(h => !inQuote(h.start)), emos = find(EMOTION_RE, text).filter(h => !inQuote(h.start));
      mark(tells, 'tell', 'Filter word: cut it and show the thing directly ("I heard the door creak" → "The door creaked").');
      mark(emos, 'tell', 'Named emotion: show it through action, body language or setting instead.');
      const tellRate = per100(tells.length + emos.length * 1.5);
      add({ id: 'show', title: 'Show, don\'t tell', score: clamp(1 - tellRate / 6), weight: 1.6, msg: tellRate > 3 ? `Lots of telling (${tells.length} filter word${tells.length !== 1 ? 's' : ''}, ${emos.length} named emotion${emos.length !== 1 ? 's' : ''}). Instead of "she was nervous", show it: "She picked at the label on her water bottle until it came away in strips."` : tellRate > 1.5 ? 'Mostly showing, with some telling (highlighted). Swap named emotions for actions and details.' : 'You show emotion through detail and action rather than naming it. That\'s the skill markers reward.' });
      const senses = Object.entries(SENSES).filter(([, re]) => re.test(text)).map(([k]) => k);
      add({ id: 'senses', title: 'Sensory detail', score: clamp(senses.length / 4), weight: 1, msg: senses.length >= 4 ? `You use ${senses.length} senses (${senses.join(', ')}). The world feels real.` : `You use ${senses.length ? senses.join(' and ') : 'no clear senses'}. Add ${['sound', 'smell', 'touch', 'taste'].filter(s => !senses.includes(s)).slice(0, 2).join(' or ')} to make the setting physical.` });
      const advs = find(ADVERB_RE, text).filter(h => !ADVERB_OK.has(lc(h.text)) && !inQuote(h.start));
      mark(advs, 'adverb', 'Adverb: a stronger verb usually does the job ("walked slowly" → "trudged").');
      add({ id: 'verbs', title: 'Strong verbs over adverbs', score: clamp(1 - per100(advs.length) / 3), weight: 0.8, msg: per100(advs.length) > 1.5 ? `${advs.length} -ly adverbs. Replace "ran quickly" with "bolted", "said angrily" with "snapped".` : 'Few adverbs: your verbs are doing the work.' });
      const cl = find(CLICHE_RE, text);
      mark(cl, 'cliche', 'Cliché: find a fresher image.');
      add({ id: 'cliche', title: 'Fresh language', score: clamp(1 - cl.length * 0.3), weight: 1, msg: cl.length ? `${cl.length} cliché${cl.length > 1 ? 's' : ''} highlighted. Replace each with a detail only your story could have.` : 'No stock phrases found. The language feels like yours.' });
      const firsts = sents.map(s => words(s.text)[0] || ''), starts = firsts.map(lc), freq = {}; starts.forEach(w => freq[w] = (freq[w] || 0) + 1);
      const [topLc, topN] = Object.entries(freq).sort((a, b) => b[1] - a[1])[0] || ['', 0], topW = firsts.find(w => lc(w) === topLc) || topLc;
      let run = 0, maxRun = 0; starts.forEach((w, i) => { run = i && w === starts[i - 1] ? run + 1 : 1; maxRun = Math.max(maxRun, run); });
      add({ id: 'starts', title: 'Varied sentence openings', score: clamp(1 - Math.max(0, topN / Math.max(1, starts.length) - 0.25) * 3 - (maxRun >= 3 ? 0.2 : 0)), weight: 0.7, msg: topN / Math.max(1, starts.length) > 0.3 ? `${topN} of your ${starts.length} sentences start with "${topW}". Start some with an action, a place or a sound.` : maxRun >= 3 ? `${maxRun} sentences in a row start the same way. Vary them.` : 'Your sentence openings are varied.' });
      // Similes: "like a…", "as if", "as cold as", "grey as the sky" (but not "I like" or "would like").
      const fig = find(/(?<!\b(?:i|you|we|they|would|to|don't|didn't|really|just)\s)\blike\b(?!\s+(?:to|it|this|that|me|him|her|them)\b)|\bas (?:if|though)\b|\bas \w+ as\b|\b(?!(?:such|known|same|so|just|well|soon|much|far|long|seen|used|act|acts|acted|served?)\b)\w+ as (?:a|an|the)\b/gi, text).filter(h => !inQuote(h.start));
      add({ id: 'figurative', title: 'Imagery', score: clamp(per100(fig.length) / 0.6), weight: 0.6, msg: fig.length ? `${fig.length} simile${fig.length > 1 ? 's' : ''} or comparison${fig.length > 1 ? 's' : ''}. Make sure each is fresh and fits the mood.` : 'No similes found. One or two precise comparisons (or a metaphor) would sharpen key moments.' });
      const echo = paras.length >= 3 ? overlap(keyWords(paras[0].text), keyWords(last.text)) : 0;
      const badEnd = /\b(?:woke up|it was all (?:just )?a dream|the end)[.!]*\s*$/i.test(last.text);
      add({ id: 'ending', title: 'Ending', score: badEnd ? 0.2 : echo >= 2 ? 1 : 0.65, weight: 0.8, msg: badEnd ? 'Avoid "it was all a dream" or "the end". End on an image or a quiet change in the character.' : echo >= 2 ? 'Your ending echoes your opening: a satisfying, cyclical shape.' : 'Consider echoing an image from your opening in the ending: it makes the piece feel crafted.' });
      const dlg = find(/["“][^"”\n]+[A-Za-z]["”]\s+(?:he|she|they|i|we|[A-Z][a-z]+)\s+(?:said|asked|whispered|shouted|replied|muttered|yelled)/g, text);
      if (dlg.length) { mark(dlg, 'informal', 'Dialogue punctuation: put a comma inside the speech marks before "said".'); add({ id: 'dialogue', title: 'Dialogue punctuation', score: clamp(1 - dlg.length * 0.25), weight: 0.4, msg: 'Put a comma inside the speech marks before the tag: "I know," she said.' }); }
    }

    // Overall
    const tw = checks.reduce((a, c) => a + (c.weight || 1), 0);
    // A short piece can tick every box, so length scales the overall result.
    const lenSc = checks.find(c => c.id === 'length')?.score ?? 1;
    const score = Math.round(checks.reduce((a, c) => a + c.score * (c.weight || 1), 0) / tw * 100 * (0.7 + 0.3 * lenSc));
    const label = score >= 85 ? 'Strong' : score >= 70 ? 'Solid' : score >= 50 ? 'Developing' : 'Needs work';
    const next = checks.filter(c => c.status !== 'good').sort((a, b) => a.score * (a.weight || 1) - b.score * (b.weight || 1)).slice(0, 3).map(c => c.id);
    return { kind, stats, checks, marks, score, label, next };
  }

  /* ---------- highlighting ---------- */
  const PRIORITY = ['dropped', 'quote', 'longquote', 'thesis', 'topic', 'retell', 'long', 'cliche', 'tell', 'informal', 'weak', 'adverb', 'tech', 'verb'];
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Text with <mark> spans (escaped). Overlapping marks combine their classes; the title is the most important note.
  function highlight(text, marks, show) {
    text = String(text || '').replace(/\r\n?/g, '\n');
    const on = (k) => !show || show.includes(k);
    const ms = marks.filter(m => on(m.kind));
    const at = Array.from({ length: text.length }, () => null);
    ms.forEach(m => { for (let i = m.start; i < m.end && i < text.length; i++) (at[i] ||= []).push(m); });
    let out = '', i = 0;
    while (i < text.length) {
      const set = at[i], key = set ? set.map(m => m.kind).sort().join(' ') : '';
      let j = i + 1; while (j < text.length && (at[j] ? at[j].map(m => m.kind).sort().join(' ') : '') === key) j++;
      const chunk = esc(text.slice(i, j));
      if (!set) out += chunk;
      else {
        const top = set.slice().sort((a, b) => PRIORITY.indexOf(a.kind) - PRIORITY.indexOf(b.kind))[0];
        const note = set.map(m => m.note || (m.kind === 'weak' || m.kind === 'informal' ? weakNote(text.slice(m.start, m.end)) : '')).filter(Boolean)[0] || '';
        out += `<mark class="${[...new Set(set.map(m => 'wr-' + m.kind))].join(' ')}" data-top="${top.kind}"${note ? ` title="${esc(note)}"` : ''}>${chunk}</mark>`;
      }
      i = j;
    }
    return out;
  }
  function weakNote(w) {
    for (const [re, label, tip] of WEAK_RE) { re.lastIndex = 0; if (re.test(w)) return tip; }
    for (const [re, label, tip] of INFORMAL) { re.lastIndex = 0; if (re.test(w)) return tip; }
    return '';
  }

  /* ---------- quote memoriser ---------- */
  const bare = (w) => lc(w).replace(/[^a-z0-9']/g, '').replace(/’/g, "'");
  // Splits a quote into words and hides about `ratio` of them (longer words first), at least one.
  function cloze(quote, ratio = 0.35, rand = Math.random) {
    const toks = String(quote).trim().split(/\s+/).map(w => ({ w, hide: false }));
    const cands = toks.map((t, i) => ({ i, score: bare(t.w).length + rand() * 3 })).filter(c => bare(toks[c.i].w).length >= 3).sort((a, b) => b.score - a.score);
    const n = Math.max(1, Math.round(toks.length * ratio));
    (cands.length ? cands : toks.map((t, i) => ({ i }))).slice(0, n).forEach(c => toks[c.i].hide = true);
    return toks;
  }
  const initials = (quote) => String(quote).trim().split(/\s+/).map(w => w.replace(/^([^A-Za-z0-9]*)([A-Za-z0-9])[^\s]*?([^A-Za-z0-9]*)$/, '$1$2$3')).join(' ');
  // How much of the quote was recalled, word by word in order (0..1), ignoring case and punctuation.
  function recall(answer, target) {
    const a = String(answer).split(/\s+/).map(bare).filter(Boolean), t = String(target).split(/\s+/).map(bare).filter(Boolean);
    if (!t.length) return 0;
    const dp = Array.from({ length: a.length + 1 }, () => new Array(t.length + 1).fill(0)); // longest common subsequence
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= t.length; j++) dp[i][j] = a[i - 1] === t[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[a.length][t.length] / Math.max(t.length, a.length);
  }
  const sameWord = (a, b) => bare(a) === bare(b);

  return { analyse, highlight, paragraphs, sentences, keyWords, KINDS, cloze, initials, recall, sameWord, TECH };
})();
if (typeof module !== 'undefined') module.exports = WR;
