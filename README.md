# Lock In

Year 8 Term 4 exam study site: Geography (map skills + Water in the World), Maths (Ch 8, 9, 10, 12) and History via uploads.

Live: https://jamalmusialla81-hub.github.io/lock-in/

- `index.html` is the built site (GitHub Pages). `lock-in-artifact.html` is the Claude artifact build (git-ignored).
- Edit the files in `src/`, then run `python3 build.py` to rebuild both:
  - `logic.js` rules with no UI: level ladder, mistakes list, sync merge (tested)
  - `cloud.js` Google sign-in, sync and group leaderboards (Firebase project `lockin-jm8`)
  - `content.js` maths notes, flashcards, drills
  - `exam.js` exam-style maths questions + answer checker
  - `geo.js` Geography decks, map / climate / scale question generators
  - `viz.js` SVG diagrams (topographic map, climate graph, etc.)
  - `app.js` the app (subjects, practice, levels, mistakes, exams, flashcards, uploads, AI, accounts)
  - `shell.html` layout and styles
- Tests: `node tests/all.js`
- Security rules: `firestore.rules`. After changing them, paste into Firebase console → Firestore Database → Rules → Publish.
- Accounts only appear on the published site (https or localhost, not inside a frame). The Claude artifact build has no login; AI features only run there.
