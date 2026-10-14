// Copies the built site into desktop/app and swaps internet-only pieces for bundled copies,
// so the desktop app works offline: MathJax, GSAP and the Atkinson Hyperlegible font.
// Sign-in (Firebase) is removed: accounts and leaderboards are on the website.
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
html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/firebase@[^"]+"[^>]*><\/script>\n?/g, '');
fs.writeFileSync(path.join(out, 'index.html'), html);

// The splash screen, and the exam dates it counts down to.
copy(path.join(__dirname, 'splash.html'), path.join(out, 'splash.html'));
fs.writeFileSync(path.join(out, 'exams.js'), `window.EXAMS = ${fs.readFileSync(path.join(root, 'exams.json'), 'utf8').trim()};\n`);
console.log('desktop/app ready:', fs.readdirSync(out).join(', '));
