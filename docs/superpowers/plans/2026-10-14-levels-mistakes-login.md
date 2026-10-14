# Adaptive levels, mistakes review, Google login — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-deck F/S/C level ladder, a mistakes review list, and Google sign-in with cloud sync, profiles and group leaderboards.

**Architecture:** Pure rules live in a new `src/logic.js` (Node-tested). `src/cloud.js` wraps Firebase compat SDK behind a small `Cloud` object. `src/app.js` owns all UI and calls `Logic` and `Cloud`. `build.py` concatenates files into `index.html` (site, with Firebase) and `lock-in-artifact.html` (no Firebase).

**Tech Stack:** Vanilla JS (no bundler), Firebase JS SDK 10.14.1 compat builds from `cdn.jsdelivr.net/npm/firebase@10.14.1/`, Firestore, Node `assert` for tests.

**Spec:** `docs/superpowers/specs/2026-10-14-levels-mistakes-login-design.md`

## Global Constraints

- Levels are exactly `'F'`, `'S'`, `'C'`; ladder: ≥ 75% marks = right, < 50% = wrong; 3 right in a row → up, 2 wrong in a row → down.
- Mistakes: whole question saved; removed after 2 fixes; cap 200 (oldest dropped); dedupe by deck + generator.
- Local key per user: guest `lockin.v2`, signed in `lockin.v2:<uid>`.
- Nickname 2–16 chars `[A-Za-z0-9 ]`; never show emails/real names.
- Group codes: 6 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`; max 5 groups per person.
- Firebase project `lockin-jm8`; login UI only on `https:` pages that are not inside an iframe.
- Every existing feature keeps working signed out and in the artifact build; old saved progress (`lockin.v2`/`lockin.v1`) still loads.

## Review Focus

- Old saved state with no `lvl`/`mistakes`/`week` fields → app must default them, not crash. (Task 1 test `defaults()`; Task 3 uses it on load.)
- A deck/filter with no question at the ladder's level (custom decks have no S) → nearest level is used. (Task 1 test `nearestLevel`.)
- Signing in on a device with guest progress, then another person signs in → each sees only their own progress. (Task 6 test on `storageKey`; Task 7 browser check.)
- Firestore 1 MB doc limit with many custom decks → sync drops custom decks, still syncs the rest. (Task 6 test `cloudPayload`.)
- Popup blocked / offline during sign-in → toast with the error, stays guest. (Task 7 browser check.)

---

### Task 1: Logic — levels

**Files:**
- Create: `src/logic.js`, `tests/logic.test.js`

**Interfaces:**
- Produces (global `Logic`, also `module.exports`):
  - `Logic.LEVELS = ['F','S','C']`
  - `Logic.defaults(S) -> S` — fills `lvl:{}`, `mistakes:[]`, `week:{start:'',xp:0}`, `profile:null`, `groups:[]` if missing.
  - `Logic.classify(got:number, out:number) -> 'right'|'wrong'|'neutral'`
  - `Logic.ladder(st:{L,up,down}|undefined, result, avail:string[]=LEVELS) -> {st:{L,up,down}, moved:'up'|'down'|null}` — moves within `avail` only.
  - `Logic.nearestLevel(want:string, avail:string[]) -> string` — exact, else nearest by index, ties go lower.
  - `Logic.weekStart(date:Date) -> 'YYYY-MM-DD'` (Monday, local time).

- [ ] **Step 1: Write tests** — `classify(3,4)==='right'`, `classify(1,4)==='wrong'`, `classify(2,4)==='neutral'`; three rights from `undefined` → `{L:'S',up:0,down:0}, moved:'up'`; at `C` three rights → stays `C`, `moved:null`; two wrongs at `S` → `F`; neutral between two wrongs does not reset `down`; a right resets `down` to 0; `ladder` with `avail ['F','C']` goes F→C; `nearestLevel('S',['F','C'])==='F'`; `defaults({xp:5}).mistakes` is `[]` and `xp` kept; `weekStart(new Date(2026,9,14))==='2026-10-12'`.
- [ ] **Step 2: Run** `node tests/logic.test.js` → fails (no module).
- [ ] **Step 3: Implement** in `src/logic.js` using the same IIFE + `if (typeof module !== 'undefined') module.exports = Logic;` pattern as `content.js`.
- [ ] **Step 4: Run** `node tests/logic.test.js` → prints `ok`.
- [ ] **Step 5: Commit** `feat: level ladder logic`.

### Task 2: Levels on every question

**Files:**
- Modify: `src/geo.js` (`mapQuestion`, decks), `src/app.js` (`mcqQ`, `shortQ`, `bankQ`, `nextQuestion`)

**Interfaces:**
- Consumes: `Logic.nearestLevel`.
- Produces: `G.mapQuestion(level?)` — `'C'` → all 10 parts, level `'C'`; otherwise first 6 parts (a–f), level `'S'`. Bank generators are called as `fn(level)`. Every question object has `level` and `gen` (generator `fn.name`, or `null` for MCQ/short). `deckLevels(d) -> string[]` (levels that deck can produce, in app.js). `nextQuestion(d, filter, level)` where `level` is `'F'|'S'|'C'`; returns the question plus `q.levelNote` = `'No Standard questions here, showing Foundation'` when it fell back.
- Levels table from the spec: MCQ = F; water short answers = C; custom decks: MCQ F, short C.

- [ ] **Step 1:** Make `mapQuestion(lvl)` slice parts to 6 unless `lvl === 'C'`, and set `level` accordingly.
- [ ] **Step 2:** `mcqQ` sets `level:'F', gen:null`; `shortQ` sets `level:'C', gen:null`; `bankQ(fn, d, level)` calls `fn(level)` and sets `gen: fn.name`.
- [ ] **Step 3:** Rewrite `nextQuestion` to pick only sources that can give `level` (bank questions with that level, MCQs at F, shorts at C), using `nearestLevel(level, deckLevels(d))` first.
- [ ] **Step 4: Verify** in the browser preview: Geography maps deck at C shows a 10-part map; at S a 6-part map; Water at C shows short answers; Maths at F shows only Foundation.
- [ ] **Step 5: Commit** `feat: every question has a level`.

### Task 3: Adaptive practice UI

**Files:**
- Modify: `src/app.js` (state load, `viewPractice`, `renderSubject`), `src/shell.html` (styles)

**Interfaces:**
- Consumes: `Logic.defaults`, `Logic.classify`, `Logic.ladder`, `deckLevels`, `nextQuestion`.
- Produces: `S.lvl[deckId]`; `levelOf(deckId) -> 'F'|'S'|'C'`; `onQuestionDone(q, d)` called once when every part of a practice question is marked.

- [ ] **Step 1:** On load run `S = Logic.defaults(S)`.
- [ ] **Step 2:** Replace the "Any level" chips with a level control: **Auto** (default, shows badge `Level: Standard`) + Foundation/Standard/Complex manual chips; shown on every deck (not only maths). `cur.level` is `'auto'` or a level.
- [ ] **Step 3:** In `viewPractice`'s `onPart`, when all parts of `q` are done and `cur.level === 'auto'`, run the ladder; on `moved` show toast `Level up → Standard` / `Level down → Foundation`, pulse the badge (GSAP if present), confetti on up.
- [ ] **Step 4:** Deck cards show a small `F`/`S`/`C` level chip.
- [ ] **Step 5: Verify** in the preview: answer 3 right in a row → badge changes to Standard; 2 wrong → back to Foundation; reload keeps the level.
- [ ] **Step 6: Commit** `feat: adaptive level ladder in practice`.

### Task 4: Logic — mistakes

**Files:**
- Modify: `src/logic.js`, `tests/logic.test.js`

**Interfaces:**
- Produces:
  - `Logic.serialise(q) -> object` — deep clone via JSON, dropping keys starting with `_`.
  - `Logic.addMistake(list, {deckId, q, gen}, now:number) -> list` — key `deckId + ':' + (gen || q.parts[0].q)`; existing key → replace `q`, `at = now`, `fixes = 0`; new → push `{id, key, deckId, q, gen, at, fixes:0}`; cap 200 keeps newest.
  - `Logic.fixMistake(list, id) -> {list, removed:boolean}` — `fixes+1`, removed at 2.
  - `Logic.missAgain(list, id) -> list` — `fixes = 0`, `at` unchanged.

- [ ] **Step 1: Tests** — serialise drops `_got`/`_finish` and keeps `visual.map.contours`; adding the same gen twice gives one entry with `fixes 0`; 201 adds → length 200 and the first is gone; fix twice → `removed:true`; fix, missAgain, fix → still present.
- [ ] **Step 2:** Run → fail. **Step 3:** Implement. **Step 4:** Run → `ok`.
- [ ] **Step 5: Commit** `feat: mistakes logic`.

### Task 5: Mistakes UI

**Files:**
- Modify: `src/app.js`, `src/shell.html`

**Interfaces:**
- Consumes: Task 4 functions; `renderCard`; bank generators by name (`findGen(deck, name)`).
- Produces: `openMistakes()`; `noteResult(q, deck, mode, redoId?)` called when a question finishes in practice, drills or exam.

- [ ] **Step 1:** `noteResult`: any part with `_got < marks` → `addMistake`; if it came from Mistakes redo and was fully right → `fixMistake` (toast "Fixed! 1 more to clear it" / "Cleared"), else `missAgain`.
- [ ] **Step 2:** Nav button "Mistakes" with count badge; subject panel line "N mistakes to fix"; practice exam results get "Fix my N mistakes".
- [ ] **Step 3:** Overlay: per-subject counts, list grouped by deck (first part's text, relative time), **Redo all** (oldest first, one at a time), per item **Redo** and **Fresh version** (only when `gen` exists; regenerates with the same level).
- [ ] **Step 4: Verify** in the preview: get a question wrong → count 1; redo it right twice → gone; fresh version shows new numbers; a mock exam adds its wrong answers; diagrams redraw in redo.
- [ ] **Step 5: Commit** `feat: mistakes review`.

### Task 6: Logic — sync helpers

**Files:**
- Modify: `src/logic.js`, `tests/logic.test.js`

**Interfaces:**
- Produces:
  - `Logic.storageKey(uid|null) -> 'lockin.v2' | 'lockin.v2:'+uid`
  - `Logic.mergeState(a, b) -> S` — xp max; streak from later `last`; `p[deck]` from the one with more `att`, `known` unioned; `lvl` higher level; `custom` union by id; `mistakes` union by key (newer `at`); `week` from later `start`, xp max on tie; `profile`/`groups` from `b` if set, else `a`.
  - `Logic.cloudPayload(S) -> {state, droppedCustom:boolean}` — drops `custom` when JSON > 900000 chars.
  - `Logic.validNickname(s) -> boolean`, `Logic.newGroupCode(rand=Math.random) -> string`.

- [ ] **Step 1: Tests** for each rule above, including merging into an empty cloud state and `cloudPayload` with a 1 MB custom deck.
- [ ] **Step 2–4:** fail → implement → `ok`.
- [ ] **Step 5: Commit** `feat: sync merge logic`.

### Task 7: Firebase sign-in, profiles and sync

**Files:**
- Create: `src/cloud.js`, `firestore.rules`
- Modify: `build.py`, `src/app.js`, `src/shell.html`

**Interfaces:**
- Consumes: `Logic.storageKey`, `Logic.mergeState`, `Logic.cloudPayload`, `Logic.validNickname`.
- Produces (global `Cloud`): `Cloud.available:boolean`, `Cloud.init(onUser(user|null))`, `Cloud.signIn()`, `Cloud.signOut()`, `Cloud.load(uid) -> Promise<doc|null>`, `Cloud.save(uid, {nickname, avatar, state}) -> Promise`, plus group functions in Task 8. `user` = `{uid}` only.
- Config: the `lockin-jm8` web config.

- [ ] **Step 1:** `build.py`: add `logic.js`, `cloud.js` to the JS list; insert the three Firebase compat `<script>` tags only into `index.html`.
- [ ] **Step 2:** `cloud.js`: `available` only when `typeof firebase !== 'undefined' && location.protocol === 'https:' || location.hostname === 'localhost'` and `window.top === window`; Google popup sign-in; Firestore offline persistence (ignore failures).
- [ ] **Step 3:** App: switch `KEY` with `Logic.storageKey`; on sign-in load cloud doc, offer "Move my guest progress into this account" when guest has XP, merge, save locally, re-render everything; debounced save 3 s + on `visibilitychange` hidden; nav avatar/"Sign in" button; sign-in sheet; first-time profile sheet (nickname + emoji avatar + colour); sign out returns to guest state.
- [ ] **Step 4:** `firestore.rules` per spec; publish them in the console (`Firestore → Rules`).
- [ ] **Step 5: Verify** on localhost (an authorised domain): sign in, set nickname, earn XP, reload → kept; doc appears in Firestore; second browser profile signs in → its own progress; sign out → guest progress back.
- [ ] **Step 6: Commit** `feat: Google sign-in, profiles and sync`.

### Task 8: Group leaderboards

**Files:**
- Modify: `src/cloud.js`, `src/app.js`, `src/shell.html`, `src/logic.js` (weekly XP in `record`)

**Interfaces:**
- Consumes: `Cloud` from Task 7, `Logic.newGroupCode`, `Logic.weekStart`.
- Produces: `Cloud.createGroup(name, member) -> code`, `Cloud.joinGroup(code, member)`, `Cloud.leaveGroup(code, uid)`, `Cloud.pushMember(codes, member)`, `Cloud.board(code) -> Promise<member[]>`; `member = {nickname, avatar, xp, weekXp, streak, week}`.

- [ ] **Step 1:** Track `S.week` in XP-earning paths (reset when `weekStart(now)` changes).
- [ ] **Step 2:** Leaderboard card on the home page (signed in only): group tabs, This week / All time, top 20, you highlighted; Create group (name) and Join (code) forms; Leave; share code with copy button; help text about scores being honour-system.
- [ ] **Step 3:** Push member docs on every cloud save.
- [ ] **Step 4: Verify:** create a group, second profile joins with the code, both appear and update; rules reject writing another member's doc (try from the console with the JS SDK).
- [ ] **Step 5: Commit** `feat: group leaderboards`.

### Task 9: Ship

- [ ] Run `node tests/logic.test.js` → `ok`; `python3 build.py`.
- [ ] Full click-through in the preview at desktop and phone width, signed out and in; no console errors.
- [ ] Push to GitHub, confirm the live site works and sign-in works on `jamalmusialla81-hub.github.io`.
- [ ] Republish the Claude artifact from `lock-in-artifact.html` (login hidden, levels + mistakes work).
- [ ] Update `README.md` (new files, tests, Firebase rules).
