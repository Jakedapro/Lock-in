# Lock In

Year 8 Term 4 exam study site: Geography (map skills + Water in the World), Maths (Ch 8, 9, 10, 12) and History via uploads.

- `index.html` is the built site. Publish it as-is (GitHub Pages, Netlify).
- Edit the files in `src/`, then run `python3 build.py` to rebuild `index.html`:
  - `content.js` maths notes, flashcards, drills
  - `exam.js` exam-style maths questions + answer checker
  - `geo.js` Geography decks, map / climate / scale question generators
  - `viz.js` SVG diagrams (topographic map, climate graph, etc.)
  - `app.js` the app (subjects, practice, practice exams, flashcards, uploads, AI)
  - `shell.html` layout and styles
- AI features only run when the page is opened as a Claude artifact; elsewhere they switch off and quick mode is used.
