// Lock in desktop app: shows the bundled site (desktop/app/index.html) in its own window.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) app.quit();

let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 420, minHeight: 560,
    title: 'Lock in', backgroundColor: '#E8ECF0', autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  // Web links (past papers, the website) open in the normal browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
