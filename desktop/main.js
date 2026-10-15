// Lock in desktop app. Shows the bundled site (desktop/app) in its own window after a short splash.
//
// The app is served from http://localhost:47823 (not file://) so Google sign-in and syncing work:
// Firebase accepts "localhost" as a sign-in address. Sign-in itself happens in the normal web browser
// (Google blocks sign-in inside apps), which hands the result back to this server.
//
// If Claude Code is installed, the AI features (marking, Ask AI, AI-made decks) run through it,
// with every tool switched off, so it can only answer.
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const { spawn, execFile } = require('child_process');

// LOCKIN_SELFTEST=<folder>: start with a throwaway data folder, check the bridges, print the result, quit.
const SELFTEST = process.env.LOCKIN_SELFTEST;
if (SELFTEST) app.setPath('userData', SELFTEST);
if (!app.requestSingleInstanceLock()) app.quit();

const PORT = 47823, ORIGIN = `http://localhost:${PORT}`;
const APP_DIR = path.join(__dirname, 'app');
const icon = path.join(__dirname, 'build', 'icon.png');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let win = null;

/* ---------------- local web server ---------------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const signins = new Map(); // state -> resolve
function serve() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, ORIGIN);
      if (req.method === 'POST' && url.pathname === '/auth-callback') return authCallback(req, res);
      if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
      const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const file = path.normalize(path.join(APP_DIR, rel));
      if (!file.startsWith(APP_DIR + path.sep)) { res.writeHead(403); return res.end(); }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(data);
      });
    });
    server.on('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}
// The browser sign-in page posts {state, idToken, accessToken} here; we pass it to the app window.
function authCallback(req, res) {
  let body = '';
  req.on('data', (c) => { body += c; if (body.length > 64e3) req.destroy(); });
  req.on('end', () => {
    let j = null; try { j = JSON.parse(body); } catch (e) { }
    const done = j && signins.get(j.state);
    if (!done || (!j.idToken && !j.accessToken)) { res.writeHead(400); return res.end('{"ok":false}'); }
    signins.delete(j.state); done({ idToken: j.idToken || null, accessToken: j.accessToken || null });
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}');
    if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); }
  });
}
ipcMain.handle('auth:google', async () => {
  const state = crypto.randomBytes(24).toString('hex');
  const result = new Promise((resolve) => { signins.set(state, resolve); setTimeout(() => { if (signins.delete(state)) resolve(null); }, 10 * 60e3); });
  await shell.openExternal(`${ORIGIN}/signin.html#state=${state}`);
  return result; // null if they gave up
});

/* ---------------- moving progress from older versions ---------------- */
// Versions before 1.2 loaded the app from file://, which has its own storage. On first run we read it
// once in a hidden window and hand it to the new page, which copies across anything it doesn't have.
const MIGRATED = () => path.join(app.getPath('userData'), 'moved-to-localhost.json');
let carried = null;
async function readOldStorage() {
  if (fs.existsSync(MIGRATED())) return;
  const w = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, sandbox: true } });
  try {
    await w.loadFile(path.join(APP_DIR, 'blank.html'));
    carried = await w.webContents.executeJavaScript('(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("lockin.")) o[k] = localStorage.getItem(k); } return o; })()');
  } catch (e) { carried = null; }
  w.destroy();
}
ipcMain.on('storage:carried', (e) => { e.returnValue = carried || {}; });
ipcMain.on('storage:carried-done', () => { carried = null; try { fs.writeFileSync(MIGRATED(), JSON.stringify({ at: Date.now() })); } catch (e) { } });

/* ---------------- Claude Code bridge ---------------- */
let claudePath; // undefined = not looked yet, null = not installed
function findClaude() {
  if (claudePath !== undefined) return Promise.resolve(claudePath);
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const guesses = process.platform === 'win32'
    ? [path.join(home, '.local', 'bin', 'claude.exe'), path.join(process.env.APPDATA || '', 'npm', 'claude.cmd'), path.join(process.env.LOCALAPPDATA || '', 'Programs', 'claude', 'claude.exe')]
    : [path.join(home, '.local', 'bin', 'claude'), '/opt/homebrew/bin/claude', '/usr/local/bin/claude', path.join(home, '.npm-global', 'bin', 'claude')];
  return new Promise((resolve) => {
    execFile(process.platform === 'win32' ? 'where.exe' : 'which', ['claude'], { timeout: 5000 }, (err, out) => {
      const found = !err && String(out).split(/\r?\n/).map((s) => s.trim()).find((p) => p && fs.existsSync(p));
      claudePath = found || guesses.find((p) => fs.existsSync(p)) || null;
      resolve(claudePath);
    });
  });
}
const EMPTY_DIR = () => { const d = path.join(app.getPath('userData'), 'claude-scratch'); fs.mkdirSync(d, { recursive: true }); return d; };
ipcMain.handle('ai:available', async () => !!(await findClaude()));
ipcMain.handle('ai:ask', async (e, { prompt, tier }) => {
  const exe = await findClaude(); if (!exe) return { ok: false, code: 'not_installed' };
  const model = tier === 'quick' ? 'haiku' : 'sonnet';
  const args = ['-p', '--output-format', 'json', '--model', model, '--tools', '', '--strict-mcp-config', '--no-session-persistence'];
  return new Promise((resolve) => {
    // The prompt goes in on stdin, never on the command line. No tools, an empty folder, no MCP servers.
    const shellNeeded = /\.(cmd|bat)$/i.test(exe);
    const child = spawn(shellNeeded ? `"${exe}"` : exe, shellNeeded ? args.map((a) => (a === '' ? '""' : a)) : args, { cwd: EMPTY_DIR(), shell: shellNeeded, windowsHide: true, env: { ...process.env } });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill(); resolve({ ok: false, code: 'timeout' }); }, 180e3);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', () => { clearTimeout(timer); resolve({ ok: false, code: 'not_installed' }); });
    child.on('close', () => {
      clearTimeout(timer);
      try {
        const j = JSON.parse(out.trim().split('\n').pop());
        if (j.is_error) return resolve({ ok: false, code: /log ?in|auth/i.test(j.result || '') ? 'signed_out' : 'error', text: String(j.result || '').slice(0, 300) });
        resolve({ ok: true, text: String(j.result || '') });
      } catch (x) { resolve({ ok: false, code: /log ?in|auth/i.test(err) ? 'signed_out' : 'error', text: err.slice(0, 300) }); }
    });
    child.stdin.end(String(prompt));
  });
});

/* ---------------- windows ---------------- */
async function createWindows() {
  const splash = new BrowserWindow({
    width: 520, height: 340, frame: false, resizable: false, center: true, show: false,
    backgroundColor: '#12161C', skipTaskbar: true, icon,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  splash.loadFile(path.join(APP_DIR, 'splash.html'));
  splash.once('ready-to-show', () => splash.show());

  if (SELFTEST) { // pretend an older version saved progress under file://
    const seed = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, sandbox: true } });
    await seed.loadFile(path.join(APP_DIR, 'blank.html'));
    await seed.webContents.executeJavaScript('localStorage.setItem("lockin.selftest", "carried over"); 1'); seed.destroy();
  }
  await readOldStorage();
  try { await serve(); } catch (e) { /* port busy: another copy is running; the single-instance lock normally prevents this */ }

  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 420, minHeight: 560, show: false,
    title: 'Lock in', backgroundColor: '#E8ECF0', autoHideMenuBar: true, icon,
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'preload.js') },
  });
  win.loadURL(`${ORIGIN}/index.html`);
  // Web links (past papers, the website, GitHub) open in the normal browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url) && !url.startsWith(ORIGIN)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(ORIGIN)) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });

  if (SELFTEST) {
    win.webContents.once('did-finish-load', async () => {
      await wait(1500);
      const r = await win.webContents.executeJavaScript(`(async () => ({
        origin: location.origin, cloud: Cloud.available, desktop: !!window.lockinDesktop, carried: localStorage.getItem('lockin.selftest'),
        mathjax: !!window.MathJax, firebase: typeof firebase, locked: document.documentElement.classList.contains('locked'),
        claudeFound: await window.lockinDesktop.ai.available(),
        ask: await window.lockinDesktop.ai.ask('Reply with exactly the word pong and nothing else.', 'quick'),
      }))()`).catch(e => ({ error: String(e) }));
      const signin = await new Promise(res => http.get(`${ORIGIN}/signin.html`, (x) => { let b = ''; x.on('data', d => b += d); x.on('end', () => res({ status: x.statusCode, hasConfig: b.includes('apiKey') })); }).on('error', e => res({ error: String(e) })));
      const escape = await new Promise(res => http.get(`${ORIGIN}/..%2f..%2fmain.js`, (x) => res(x.statusCode)).on('error', () => res('err')));
      const badAuth = await new Promise(res => { const q = http.request(`${ORIGIN}/auth-callback`, { method: 'POST' }, (x) => res(x.statusCode)); q.end('{"state":"nope","idToken":"x"}'); });
      console.log('SELFTEST ' + JSON.stringify({ ...r, signin, escape, badAuth }));
      app.quit();
    });
  }
  // Let the splash animation play through, then fade the main window in.
  const ready = new Promise((r) => win.once('ready-to-show', r));
  Promise.all([ready, wait(2100)]).then(async () => {
    win.setOpacity(0); win.show();
    for (let i = 1; i <= 10; i++) { win.setOpacity(i / 10); await wait(18); }
    if (!splash.isDestroyed()) splash.close();
  });
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
app.whenReady().then(createWindows);
app.on('window-all-closed', () => app.quit());
