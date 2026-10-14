# Lock In: adaptive levels, mistakes review, Google login

Date: 2026-10-14 · Exams: Geography Mon 26 Oct, Maths Thu 29 Oct

## Goal

Make practice smarter and the site feel like a real app, without breaking what works today.

- **Phase 1** (no setup, ship first): adaptive difficulty + mistakes review.
- **Phase 2** (needs the owner's Firebase project): Google sign-in, progress sync across devices, profiles, a leaderboard with mates.

Everything keeps working signed out ("guest"), and the Claude artifact build keeps working without login.

## Phase 1a — Adaptive difficulty (level ladder)

Three levels per deck: **Foundation (F) → Standard (S) → Complex (C)**. Each deck starts at F.

- A question counts as **right** if the student scores ≥ 75% of its marks, **wrong** if < 50%, otherwise neutral (doesn't move the ladder, doesn't reset it).
- **3 right in a row → level up. 2 wrong in a row → level down.** Run counters reset on every level change.
- Stored per deck in `S.lvl[deckId] = { L: 'F'|'S'|'C', up: n, down: n }`.
- Level-up/down shows a badge animation + toast ("Level up → Standard"). The current level shows as a badge on the practice screen and as a small label on each deck card.
- Practice gets a level control: **Auto** (default, follows the ladder) or a manual pick (Foundation / Standard / Complex). Manual picks don't move the ladder. This replaces the current "Any level" chips.

**Giving every question a level** (Maths bank questions already have one):

| Source | Level |
|---|---|
| Concept multiple choice (all decks) | F |
| Geography `scaleQ`, `waterDataQ` | F (already) |
| Geography `climateQ` | S (already) |
| Geography `mapQuestion` | S at level S (first 6 parts), C at level C (all 10 parts) |
| Water short answers | C |
| Maths bank | existing F/S/C |
| Custom/AI decks | MCQ = F, short answer = C (only two levels; ladder skips S) |

If no question exists at the current level (e.g. a filter leaves none), fall back to the nearest level and say so in small text.

## Phase 1b — Mistakes review

- When any part of a question is marked wrong (practice, drills or practice exam), the **whole question** is saved: `S.mistakes = [{ id, deckId, q, gen, at, fixes }]`.
  - `q` is the rendered question as plain data (stem, parts, visual, tags, level) with the runtime `_` fields stripped. Diagrams (topo map, climate graph, Venn…) are data already, so they redraw exactly.
  - `gen` is the bank generator's name (e.g. `venn`) when the question came from a generator, so a **fresh version** can be made with new numbers.
  - The same generator + deck is saved once (re-missing updates it and resets `fixes`). Cap 200, oldest dropped.
- **Getting it right twice removes it** (`fixes` ≥ 2). Getting it wrong again resets `fixes` to 0.
- UI:
  - Nav gets a **Mistakes** button with a count badge.
  - Mistakes overlay: count per subject, list grouped by deck (first line of each question + when), **Redo all** (one at a time, oldest first), and per item **Redo** or **Fresh version**.
  - After a practice exam: a "Fix my N mistakes" button on the results screen.
  - Each subject panel shows "N mistakes to fix" when > 0.

## Phase 2 — Accounts (Firebase)

**Owner setup (one time, ~5 min, done by the owner):** create a free Firebase project, enable Google sign-in, add `jamalmusialla81-hub.github.io` as an authorised domain, create a Firestore database, register a web app and paste its config. The web config is not a secret; it goes in `src/cloud.js`. Security comes from the Firestore rules in `firestore.rules`, which the owner pastes into the console.

**Sign-in & profiles**
- Nav avatar button → sign-in sheet with "Sign in with Google" (popup) and "Keep going as guest".
- First sign-in: pick a **nickname** (2–16 chars, letters/numbers/spaces) and an **avatar** (emoji + colour). No real names or emails are shown anywhere.
- Each person's progress lives under its own local key (`lockin.v2:<uid>`; guest stays `lockin.v2`), so several people can share one computer: sign out, the next person signs in, and the site switches progress.

**Sync**
- Firestore `users/{uid}` = `{ nickname, avatar, state, updatedAt }`, where `state` is the same `S` object as local storage.
- On sign-in: load cloud state and **merge** it with local: max XP; streak from whichever has the later `last`; per deck progress take the one with more attempts; levels take the higher; custom decks and mistakes are a union by id; known flashcards are a union.
- The first sign-in on a device that already has guest progress offers **"Move my guest progress into this account"** (merged as above).
- Saves go up 3 s after the last change and when the tab is hidden. Offline is fine: Firestore's offline cache queues writes.
- If `state` is near Firestore's 1 MB doc limit (> 900 KB JSON), custom decks are left out of the sync and a note says so.

**Leaderboard (mates only, by group code)**
- Kept private to friends: no public global list of students. You **create a group** (gets a 6-character code, e.g. `K7Q2XD`) or **join one** by code. Max 5 groups per person.
- `groups/{code}` = `{ name, owner, createdAt }`; `groups/{code}/members/{uid}` = `{ nickname, avatar, xp, weekXp, streak, updatedAt }`, updated whenever the user's sync runs.
- Home page leaderboard card: tabs per group, **This week** (XP since Monday) / **All time**, top 20, you highlighted.
- Known limit: a determined person could fake their own XP, because scoring happens in the browser. Fine for mates; called out in the UI help text.

**Firestore rules (summary)**
- `users/{uid}`: read/write only by that signed-in user.
- `groups/{code}`: any signed-in user can read and create; only the owner can rename/delete.
- `groups/{code}/members/{uid}`: signed-in users can read members of a group; a user can only write their own member doc, with fields limited to the ones above and sane types/lengths.

**Where login appears**
- GitHub Pages site: full login, sync and leaderboard.
- Claude artifact build and opening `index.html` as a local file: login UI hidden; guest mode as today.

## Code structure

- `src/logic.js` (new, pure, no DOM): ladder update, level picking, mistake store (add/fix/remove/serialise), state merge. Exported for Node tests like the other files.
- `src/cloud.js` (new): Firebase wrapper (sign in/out, load/save state, groups, leaderboard). Talks to the app only through a small interface: `Cloud.init(onUser)`, `Cloud.signIn()`, `Cloud.signOut()`, `Cloud.save(state)`, `Cloud.load()`, `Cloud.groups.*`.
- `src/app.js`: UI for the level badge/control, mistakes overlay, sign-in sheet, profile, leaderboard; uses `logic.js` for all rules.
- `src/shell.html`: new styles + nav buttons + leaderboard card.
- `build.py`: adds the new files, and Firebase compat scripts from `cdn.jsdelivr.net/npm/firebase@10.14.1` only in the site build (`index.html`), not the artifact build.
- `firestore.rules`: the rules file the owner pastes in.
- `tests/logic.test.js`: Node tests (run with `node tests/logic.test.js`).

## Testing

- Unit (Node, no deps): ladder moves (3 up / 2 down / neutral / caps at F and C), level fallback, mistake add/dedupe/fix/remove/cap, serialisation strips runtime fields and keeps visuals, merge rules.
- In the browser preview: answer questions to level up and down; get questions wrong and fix them from the Mistakes overlay; fresh version gives new numbers; practice exam adds mistakes; the old saved progress still loads.
- Phase 2, against the owner's real Firebase project: sign in, nickname, sync between two browser profiles, guest migration, create/join a group, leaderboard shows both, sign out switches progress, and the rules refuse writing someone else's doc.

## Out of scope

Timed challenge modes, interactive map clicking, daily goals/badges, server-side anti-cheat, email/password accounts.
