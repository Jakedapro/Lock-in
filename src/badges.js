/* ===== Lock In — badges and ranks (no DOM) =====
   Badges are worked out from the saved state, so they sync and can't be lost. Once earned, the
   time is kept in S.badges. S.flags holds one-off moments that aren't otherwise saved. */
const Badges = (() => {
  const sum = (o, f) => Object.values(o || {}).reduce((a, x) => a + f(x), 0);
  const marks = (S) => sum(S.p, p => p.att || 0);
  const focusMin = (S) => sum(S.days, d => d.min || 0);
  const atC = (S) => Object.values(S.lvl || {}).filter(l => l.L === 'C').length;
  const known = (S) => sum(S.p, p => Object.keys(p.known || {}).length);
  const subjectsTried = (S, decks) => new Set(Object.entries(S.p || {}).filter(([, p]) => p.att).map(([id]) => decks[id]).filter(Boolean)).size;
  const F = (S) => S.flags || {};

  // [id, emoji, name, how to get it, test(S, ctx)]  ctx = { decks: {deckId: subjectId}, subjects: n }
  const LIST = [
    ['first', '✏️', 'First mark', 'Answer your first question', S => marks(S) >= 1],
    ['m100', '💯', 'Century', 'Attempt 100 marks', S => marks(S) >= 100],
    ['m500', '🧱', 'Grinder', 'Attempt 500 marks', S => marks(S) >= 500],
    ['m2000', '🏔️', 'Mountain', 'Attempt 2,000 marks', S => marks(S) >= 2000],
    ['s3', '🔥', 'On fire', '3-day streak', S => (S.streak?.n || 0) >= 3],
    ['s7', '📅', 'Full week', '7-day streak', S => (S.streak?.n || 0) >= 7],
    ['s14', '⚡', 'Fortnight', '14-day streak', S => (S.streak?.n || 0) >= 14],
    ['s30', '👑', 'Unbreakable', '30-day streak', S => (S.streak?.n || 0) >= 30],
    ['x1k', '🥉', '1K club', 'Earn 1,000 XP', S => (S.xp || 0) >= 1000],
    ['x5k', '🥈', '5K club', 'Earn 5,000 XP', S => (S.xp || 0) >= 5000],
    ['x10k', '🥇', '10K club', 'Earn 10,000 XP', S => (S.xp || 0) >= 10000],
    ['f60', '🎧', 'Locked in', 'Focus for an hour in total', S => focusMin(S) >= 60],
    ['f600', '🧠', 'Deep work', 'Focus for 10 hours in total', S => focusMin(S) >= 600],
    ['f90', '🪨', 'Monk mode', 'Finish a 90-minute focus session', S => (S.sessions || []).some(s => s.min >= 90)],
    ['c1', '🧗', 'Complex', 'Reach Complex level in any deck', S => atC(S) >= 1],
    ['c3', '🚀', 'Triple threat', 'Reach Complex in three decks', S => atC(S) >= 3],
    ['fix10', '🩹', 'Fixer', 'Clear 10 mistakes', S => Object.keys(S.cleared || {}).length >= 10],
    ['fix50', '🛠️', 'Mechanic', 'Clear 50 mistakes', S => Object.keys(S.cleared || {}).length >= 50],
    ['cards50', '🃏', 'Card shark', 'Know 50 flashcards', S => known(S) >= 50],
    ['ace', '🎯', 'Exam ready', 'Score 85% or more on a practice exam', S => !!F(S).mock85],
    ['all', '🌈', 'All-rounder', 'Practise every subject', (S, c) => c && c.subjects > 0 && subjectsTried(S, c.decks) >= c.subjects],
    ['owl', '🦉', 'Night owl', 'Study after 11 pm', S => !!F(S).owl],
    ['bird', '🌅', 'Early bird', 'Study before 7 am', S => !!F(S).bird],
    ['pen', '🖋️', 'Wordsmith', 'Get feedback on your writing', S => (S.eng?.history || []).length >= 1],
    ['pen85', '📜', 'Distinction', 'Score 85+ on writing feedback', S => (S.eng?.best || 0) >= 85],
    ['drafts', '📝', 'Redrafter', 'Get feedback 10 times', S => (S.eng?.history || []).length >= 10],
    ['quotes', '💬', 'Quote machine', 'Learn 5 quotes off by heart', S => (S.quotes || []).filter(q => (q.box || 0) >= 4).length >= 5],
    ['daily', '☀️', 'Daily', 'Beat a daily challenge', S => Object.keys(S.daily?.done || {}).length >= 1],
    ['daily7', '🗓️', 'Regular', 'Beat 7 daily challenges', S => Object.keys(S.daily?.done || {}).length >= 7],
    ['plan10', '✅', 'On plan', 'Tick off 10 plan tasks', S => Object.keys(S.planDone || {}).length >= 10],
    ['squad', '🤝', 'Squad', 'Join a group with your mates', S => (S.groups || []).length >= 1],
  ].map(([id, icon, name, how, test]) => ({ id, icon, name, how, test }));

  // Badges whose test passes now but weren't earned before.
  const fresh = (S, ctx) => LIST.filter(b => !(S.badges || {})[b.id] && (() => { try { return b.test(S, ctx); } catch (e) { return false; } })());

  const RANKS = [[0, 'Rookie'], [250, 'Grinder'], [750, 'Locked in'], [1500, 'Dialled in'], [3000, 'Cracked'], [6000, 'Goated'], [12000, 'Mythic']];
  function rank(xp) {
    xp = xp || 0; let i = 0; while (i < RANKS.length - 1 && xp >= RANKS[i + 1][0]) i++;
    const [min, name] = RANKS[i], next = RANKS[i + 1];
    return { name, min, level: i + 1, next: next ? { name: next[1], at: next[0] } : null, pct: next ? (xp - min) / (next[0] - min) : 1 };
  }
  return { LIST, fresh, rank, RANKS };
})();
if (typeof module !== 'undefined') module.exports = Badges;
