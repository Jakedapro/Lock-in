// Lock in desktop app: shows the bundled site (desktop/app/index.html) in its own window,
// after a short splash screen (app/splash.html) while it loads.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) app.quit();

const icon = path.join(__dirname, 'build', 'icon.png');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let win = null;

function createWindows() {
  const splash = new BrowserWindow({
    width: 520, height: 340, frame: false, resizable: false, center: true, show: false,
    backgroundColor: '#12161C', skipTaskbar: true, icon,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  splash.loadFile(path.join(__dirname, 'app', 'splash.html'));
  splash.once('ready-to-show', () => splash.show());

  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 420, minHeight: 560, show: false,
    title: 'Lock in', backgroundColor: '#E8ECF0', autoHideMenuBar: true, icon,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  // Web links (past papers, the website) open in the normal browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });

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
