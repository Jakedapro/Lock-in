// Runs before the page. Gives the page a small, fixed bridge to the desktop app (nothing else from Node):
//   lockinDesktop.signInWithGoogle()  -> {idToken, accessToken} from the browser sign-in, or null
//   lockinDesktop.ai.available()      -> true if Claude Code is installed
//   lockinDesktop.ai.ask(prompt, tier)-> {ok, text} or {ok:false, code}
const { contextBridge, ipcRenderer } = require('electron');

// First run after updating from a file:// version: copy old progress across (only keys the page doesn't have).
try {
  const old = ipcRenderer.sendSync('storage:carried');
  const keys = Object.keys(old || {});
  if (keys.length) {
    for (const k of keys) if (localStorage.getItem(k) == null) localStorage.setItem(k, old[k]);
  }
  ipcRenderer.send('storage:carried-done');
} catch (e) { }

contextBridge.exposeInMainWorld('lockinDesktop', {
  signInWithGoogle: () => ipcRenderer.invoke('auth:google'),
  buildPaper: (spec) => ipcRenderer.invoke('papers:build', spec),
  ai: {
    available: () => ipcRenderer.invoke('ai:available'),
    ask: (prompt, tier) => ipcRenderer.invoke('ai:ask', { prompt: String(prompt), tier: tier === 'quick' ? 'quick' : 'default' }),
  },
});
