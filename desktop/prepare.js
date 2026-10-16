// Copies the built site into desktop/app and swaps internet-only pieces for bundled copies,
// so the desktop app works offline: MathJax, GSAP and the Atkinson Hyperlegible font.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(__dirname, 'app');
const mod = (p) => path.join(__dirname, 'node_modules', p);
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'vendor', 'fonts'), { recursive: true });

copy(mod('mathjax/es5/tex-svg-full.js'), path.join(out, 'vendor', 'tex-svg-full.js'));
copy(mod('gsap/dist/gsap.min.js'), path.join(out, 'vendor', 'gsap.min.js'));
for (const f of ['pdf.min.js', 'pdf.worker.min.js']) copy(mod(`pdfjs-dist/build/${f}`), path.join(out, 'vendor', f)); // our paper viewer
let fontCss = '';
for (const [w, style] of [['400', 'normal'], ['700', 'normal'], ['400', 'italic']]) {
  const name = `atkinson-hyperlegible-latin-${w}-${style}.woff2`;
  copy(mod(`@fontsource/atkinson-hyperlegible/files/${name}`), path.join(out, 'vendor', 'fonts', name));
  fontCss += `@font-face{font-family:"Atkinson Hyperlegible";font-style:${style};font-weight:${w};font-display:swap;src:url(fonts/${name}) format("woff2")}\n`;
}
fs.writeFileSync(path.join(out, 'vendor', 'fonts.css'), fontCss);

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const swap = (re, to, what) => { if (!re.test(html)) throw new Error(`prepare.js: could not find ${what} in index.html`); html = html.replace(re, to); };
swap(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="vendor/fonts.css">', 'the Google Fonts link');
html = html.replace(/<link rel="preconnect"[^>]*>\n?/g, '');
swap(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/[^"]+"><\/script>/, '<script src="vendor/gsap.min.js"></script>', 'GSAP');
swap(/<script async src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/mathjax\/[^"]+"[^>]*><\/script>/, '<script async src="vendor/tex-svg-full.js"></script>', 'MathJax');
// Firebase (Google sign-in and sync) is bundled too: the app runs on http://localhost, where sign-in works.
for (const m of ['app', 'auth', 'firestore']) {
  copy(mod(`firebase/firebase-${m}-compat.js`), path.join(out, 'vendor', `firebase-${m}-compat.js`));
  swap(new RegExp(`<script src="https:\\/\\/cdn\\.jsdelivr\\.net\\/npm\\/firebase@[^"]+\\/firebase-${m}-compat\\.js"[^>]*><\\/script>`), `<script src="vendor/firebase-${m}-compat.js"></script>`, `Firebase ${m}`);
}
fs.writeFileSync(path.join(out, 'index.html'), html);

// The splash screen, and the exam dates it counts down to.
copy(path.join(__dirname, 'splash.html'), path.join(out, 'splash.html'));
copy(path.join(__dirname, 'blank.html'), path.join(out, 'blank.html'));
// Past papers (desktop/papers, kept out of the public repo) go inside the app when they're present.
const papers = path.join(__dirname, 'papers');
if (fs.existsSync(papers)) fs.readdirSync(papers).filter(f => f.endsWith('.pdf')).forEach(f => copy(path.join(papers, f), path.join(out, 'papers', f)));
// The browser sign-in page uses the same Firebase settings as the app (read from src/cloud.js).
const cfg = fs.readFileSync(path.join(root, 'src', 'cloud.js'), 'utf8').match(/const CONFIG = (\{[\s\S]*?\});/);
if (!cfg) throw new Error('prepare.js: could not find the Firebase CONFIG in src/cloud.js');
fs.writeFileSync(path.join(out, 'signin.html'), fs.readFileSync(path.join(__dirname, 'signin.html'), 'utf8').replace('/*CONFIG*/null', cfg[1]));
fs.writeFileSync(path.join(out, 'exams.js'), `window.EXAMS = ${fs.readFileSync(path.join(root, 'exams.json'), 'utf8').trim()};\n`);
console.log('desktop/app ready:', fs.readdirSync(out).join(', '));
