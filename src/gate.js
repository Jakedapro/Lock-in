/* ===== Lock In — the invite-key lock screen (website + desktop app) =====
   The page starts with <html class="locked">, which hides everything except this screen.
   A key saved on this device opens it straight away; keys.json is re-checked online so a
   revoked key stops working. Invite links look like …/lock-in/#key=LOCK-XXXX-XXXX-XXXX. */
const Gate = (() => {
  const SAVED = 'lockin.key', CACHE = 'lockin.keys';
  const RAW = 'https://raw.githubusercontent.com/jamalmusialla81-hub/lock-in/main/keys.json';
  const enabled = typeof BUILD !== 'undefined' && BUILD.gate;
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } };
  let list = (() => { try { return JSON.parse(get(CACHE)) || KEYS; } catch (e) { return KEYS; } })();
  let entry = null, onOpen = [], el = null, fails = 0, waitUntil = 0;

  const locked = () => document.documentElement.classList.contains('locked');
  function open(silent) {
    document.documentElement.classList.remove('locked');
    const g = el; el = null;
    if (g) { if (silent) g.remove(); else { g.classList.add('gone'); setTimeout(() => g.remove(), 700); } }
    onOpen.forEach(f => f(entry));
  }
  function lock(msg) {
    entry = null; document.documentElement.classList.add('locked'); show(msg);
  }
  function tryKey(k) {
    const e = Keys.check(k, list); if (!e) return false;
    entry = e; set(SAVED, Keys.pretty(Keys.norm(k))); return true;
  }

  function show(msg) {
    if (el) { note(msg || ''); return; }
    el = document.createElement('div'); el.className = 'gate'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Enter your invite key');
    el.innerHTML = `<div class="gate-in">
      <svg class="gate-lock" viewBox="0 0 92 108" aria-hidden="true"><path class="shk" d="M24 50V32a22 22 0 0 1 44 0v18" fill="none" stroke="#B4BDC9" stroke-width="10" stroke-linecap="round"/><rect x="8" y="46" width="76" height="58" rx="12" fill="#E7ECF2"/><path class="hole" d="M46 64a8 8 0 0 1 4.5 14.6L53 92H39l2.5-13.4A8 8 0 0 1 46 64z"/></svg>
      <h1>Lock <span>in</span></h1>
      <p class="gate-sub">Invite only. Enter the key a mate sent you.</p>
      <form class="gate-form" novalidate><input class="gate-key" id="gateKey" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="19" placeholder="LOCK-XXXX-XXXX-XXXX" aria-label="Invite key"><button class="gate-go" type="submit">Unlock</button></form>
      <p class="gate-msg" id="gateMsg" role="status" aria-live="polite"></p>
      <p class="gate-foot">Got an invite link? Just open it and you're in.</p></div>`;
    document.body.appendChild(el);
    const inp = el.querySelector('#gateKey');
    inp.addEventListener('input', () => { // type "7kq2xd9m3hta" and it becomes LOCK-7KQ2-XD9M-3HTA
      let t = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (t.startsWith('LOCK')) t = t.slice(4);
      t = t.slice(0, 12); inp.value = t ? 'LOCK-' + t.match(/.{1,4}/g).join('-') : '';
    });
    el.querySelector('form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (Date.now() < waitUntil) return note(`Too many tries. Wait ${Math.ceil((waitUntil - Date.now()) / 1000)} seconds.`);
      if (!Keys.norm(inp.value)) return wrong('Keys look like LOCK-XXXX-XXXX-XXXX.');
      if (!tryKey(inp.value)) {
        note('Checking…'); await refresh(); // a brand-new key is only in the live keys.json
        if (!tryKey(inp.value)) { if (++fails >= 5) { fails = 0; waitUntil = Date.now() + 30000; } return wrong('That key doesn\'t work. Check it with whoever sent it.'); }
      }
      el.classList.remove('shake'); el.classList.add('opening'); note('You\'re in.');
      setTimeout(() => open(false), 900);
    });
    note(msg || ''); setTimeout(() => inp.focus(), 50);
  }
  function note(t) { const m = el && el.querySelector('#gateMsg'); if (m) m.textContent = t; }
  function wrong(t) { note(t); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

  // Fetch the live keys.json. Same site first (GitHub Pages), raw GitHub for the desktop app.
  async function refresh() {
    const urls = location.protocol === 'file:' ? [RAW] : ['keys.json', RAW];
    for (const u of urls) {
      try {
        const r = await fetch(u + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) continue;
        const j = await r.json(); if (!j || !Array.isArray(j.keys)) continue;
        list = j; set(CACHE, JSON.stringify(j)); return true;
      } catch (e) { }
    }
    return false;
  }

  function start() {
    if (!enabled) { document.documentElement.classList.remove('locked'); return; }
    const fromLink = (location.hash.match(/(?:^#|&)key=([A-Za-z0-9-]+)/) || [])[1];
    if (fromLink) history.replaceState(null, '', location.pathname + location.search); // don't leave the key in the address bar
    if ((fromLink && tryKey(fromLink)) || tryKey(get(SAVED) || '')) open(true);
    else show(fromLink ? 'That invite link\'s key doesn\'t work.' : '');
    // Re-check online: a revoked key locks again, and a brand-new key works once keys.json updates.
    refresh().then(ok => {
      if (!ok) return;
      const k = get(SAVED);
      if (!locked() && !(k && Keys.check(k, list))) { set(SAVED, null); lock('This key has been turned off. Ask for a new one.'); }
      else if (!locked()) entry = Keys.check(k, list);
    });
  }

  return {
    start, refresh, enabled,
    onOpen: (f) => { onOpen.push(f); if (!locked()) f(entry); },
    entry: () => entry,
    isOwner: () => !!(entry && entry.owner),
    keys: () => list,
    forget() { set(SAVED, null); lock(''); },
  };
})();
Gate.start();
