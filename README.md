# Lock in

A study app for HSC Maths Extension 1, Maths Extension 2 and Physics, plus Year 8 Geography and Maths.

**Website:** https://jamalmusialla81-hub.github.io/lock-in/

## Download the Windows app

Open **PowerShell** and paste:

```powershell
Invoke-WebRequest https://github.com/jamalmusialla81-hub/lock-in/releases/latest/download/Lock-In-Setup.exe -OutFile "$env:TEMP\Lock-In-Setup.exe"; Start-Process "$env:TEMP\Lock-In-Setup.exe"
```

Or download `Lock-In-Setup.exe` from the [latest release](https://github.com/jamalmusialla81-hub/lock-in/releases/latest) and run it.

Windows may show "Windows protected your PC" because the app isn't code-signed. Click **More info**, then **Run anyway**.

The app works offline. Sign-in, syncing and leaderboards are on the website.

## What it does

- **Home:** exam timeline, your study plan, a report card, and a heatmap of your study days.
- **Lock-in focus mode:** a 25, 50 or 90 minute timer. Every session earns XP and shows on your heatmap.
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
- Tests: `node tests/all.js`
- Windows app (`desktop/`): `npm install`, then `npm start` to run it or `npm run dist` to build `dist/Lock-In-Setup.exe`.
  To publish a new version, bump `version` in `desktop/package.json`, then push a matching tag (e.g. `git tag v1.0.1 && git push origin v1.0.1`). GitHub Actions builds the installer on Windows and attaches it to a release.
