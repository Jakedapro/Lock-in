# Lock in

A study app for HSC Maths Extension 1, Maths Extension 2 and Physics, plus Year 8 English (Animal Farm), Geography and Maths.

**Invite only:** the website and the app ask for an invite key (`LOCK-XXXX-XXXX-XXXX`) the first time. Got an invite link? Open it and you're in.

**Website:** https://jamalmusialla81-hub.github.io/lock-in/

## Download the Windows app

Open **PowerShell** and paste this once:

```powershell
irm https://raw.githubusercontent.com/jamalmusialla81-hub/lock-in/main/install.ps1 | iex
```

It installs the app and a `lockin` command. Then, in any terminal:

```
lockin            the intro (exam countdowns, a study tip), then open the app
lockin open       open the app straight away
lockin focus 25   a focus timer in the terminal (space pauses, q stops)
lockin exams      countdown to every exam
lockin banner     just the intro
lockin update     update to the latest version
lockin version    show the installed version
lockin web        open the website
lockin uninstall  remove the app and the command
```

Prefer clicking? Download `Lock-In-Setup.exe` from the [latest release](https://github.com/jamalmusialla81-hub/lock-in/releases/latest) and run it.

Windows may show "Windows protected your PC" because the app isn't code-signed. Click **More info**, then **Run anyway**.

The app works offline. Sign-in, syncing and leaderboards are on the website.

## What it does

- **Home:** exam timeline, the daily challenge, your study plan, a report card with your rank and badges, and a heatmap of your study days.
- **English (Year 8, Animal Farm):** plot and characters, themes, techniques, and PETAL paragraphs, with extract questions and a practice exam set out like Task 4 (20 marks, 60 minutes).
- **Writing feedback:** paste PETAL paragraphs, a short answer, an essay or a story and get instant feedback: Point, Evidence, Technique, Analysis and Link in every paragraph, thesis, topic sentences, quotes and techniques, dropped quotes, retelling, vague or informal words, showing not telling, clichés. Your writing comes back marked up, and your scores are saved so you can watch them climb. In the Claude version, AI gives a mark too.
- **Quote bank:** save quotes for your texts, then drill them until you can write them word for word.
- **Daily challenge:** one Complex question a day, the same for everyone. Beat it for +50 XP.
- **Badges and ranks:** 31 badges, and ranks from Rookie to Mythic.
- **Quick search:** press Ctrl+K (or /) to jump to any deck, topic or tool.
- **Share card:** turn your stats into a picture to send to the group chat.
- **Lock-in focus mode:** a 25, 50 or 90 minute timer with optional rain or brown-noise sound. Every session earns XP and shows on your heatmap.
- **Study planner:** a day-by-day plan to each exam, aimed at your weakest topics, with a practice paper the day before each exam.
- **Decks:** notes, flashcards, multiple choice, and exam questions that generate new numbers every time, with full working.
- **Levels:** Foundation, Standard and Complex. Three right in a row moves you up; two wrong drops you back.
- **Mistakes list:** wrong answers are saved until you get them right twice.
- **Practice exams:** timed papers for every subject.
- **Real maths:** fractions, integrals, vectors and more, typeset properly. Answers can be typed like `3π/4`, `2√3` or `4.1e-19`.
- **Dark mode:** auto, dark or light (button in the top bar).
- **Accounts (website):** sign in with Google to sync between devices and join a private leaderboard with your mates.
- **AI (Claude version):** short answers marked against the criteria, an AI tutor for every deck, and decks made from your own notes.

Official HSC past papers: [Ext 1](https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/mathematics-extension-1), [Ext 2](https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/mathematics-extension-2), [Physics](https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/physics).

## For developers

- `index.html` is the built website (GitHub Pages). Edit the files in `src/`, then run `python3 build.py`. `lock-in-artifact.html` is the Claude build (git-ignored).
  - `fmt.js` text and maths formatting; `mathin.js` typed-answer parser; `logic.js` levels, mistakes, sync, planner, heatmap (tested)
  - `cloud.js` Google sign-in, sync and leaderboards (Firebase project `lockin-jm8`; rules in `firestore.rules`, paste into Firebase console → Firestore Database → Rules → Publish)
  - `texkit.js` helpers for generated questions
  - `content.js`, `exam.js`, `y8more.js`, `geo.js` Year 8 decks; `ext2.js`, `e1.js`, `physics.js` HSC decks
  - `viz.js` diagrams; `app.js` the app; `shell.html` layout and styles
  - `keys.js`, `gate.js` invite keys and the lock screen; `english.js` English decks; `writing.js` writing feedback (tested); `badges.js` badges and ranks (tested)
- Tests: `node tests/all.js`
- Invite keys: `keys.json` holds SHA-256 hashes only. `python3 tools/keys.py new "Friend 16"` makes a key (the key itself goes in `../lock-in-keys.md`, outside the repo); `python3 tools/keys.py revoke k07` turns one off. Commit and push `keys.json` afterwards. The owner key also gets an **Invite keys** button on Home to do this from the app.
- Windows app (`desktop/`): `npm install`, then `npm start` to run it or `npm run dist` to build `dist/Lock-In-Setup.exe`.
  To publish a new version, bump `version` in `desktop/package.json`, then push a matching tag (e.g. `git tag v1.0.1 && git push origin v1.0.1`). GitHub Actions builds the installer on Windows and attaches it to a release.
