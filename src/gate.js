/* ===== Lock In — the invite-key lock screen (website + desktop app) =====
   The page starts with <html class="locked">, which hides everything except this screen.
   A key saved on this device opens it straight away; keys.json is re-checked online so a
   revoked key stops working. Invite links look like …/lock-in/#key=LOCK-XXXX-XXXX-XXXX. */
const Gate = (() => {
  const SAVED = 'lockin.key', CACHE = 'lockin.keys';
  const RAW = 'https://raw.githubusercontent.com/Jakedapro/Lock-in/main/keys.json';
  const FREE = 'https://lootdest.org/s?GI9AuceG'; // LootLabs link: a few ads, then a free 1-day key (worker/)
  const API = 'https://api.github.com/repos/Jakedapro/Lock-in/contents/keys.json?ref=main'; // never cached, but rate limited: only for unknown keys
  const enabled = typeof BUILD !== 'undefined' && BUILD.gate;
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } };
  let list = (() => { try { return JSON.parse(get(CACHE)) || KEYS; } catch (e) { return KEYS; } })();
  let entry = null, onOpen = [], onWarn = [], el = null, fails = 0, waitUntil = 0, warned = false;

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
  const when = (t) => new Date(t).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  function whyNot(k) {
    const e = Keys.find(k, list), st = Keys.status(e);
    return st === 'expired' ? `That key ran out on ${when(e.exp)}. Ask for a new one.` : st === 'off' ? 'That key has been turned off. Ask for a new one.' : 'That key doesn\'t work. Check it with whoever sent it.';
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
      <form class="gate-form" novalidate><input class="gate-key" id="gateKey" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="LOCK-XXXX-XXXX-XXXX" aria-label="Invite key"><button class="gate-go" type="submit">Unlock</button></form>
      <p class="gate-msg" id="gateMsg" role="status" aria-live="polite"></p>
      <a class="gate-free" href="${FREE}" target="_blank" rel="noopener">No key? Get a free 1-day key</a>
      <p class="gate-foot">Got an invite link? Just open it and you're in.</p></div>`;
    document.body.appendChild(el);
    const inp = el.querySelector('#gateKey');
    inp.addEventListener('input', () => { // type "7kq2xd9m3hta" and it becomes LOCK-7KQ2-XD9M-3HTA
      const found = inp.value.match(/LOCK[\s-]*([A-Z0-9]{4})[\s-]*([A-Z0-9]{4})[\s-]*([A-Z0-9]{4})/i); // a pasted invite link or message works too
      let t = found ? found.slice(1).join('').toUpperCase() : inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (!found && t.startsWith('LOCK')) t = t.slice(4);
      t = t.slice(0, 12); inp.value = t ? 'LOCK-' + t.match(/.{1,4}/g).join('-') : '';
    });
    el.querySelector('form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (Date.now() < waitUntil) return note(`Too many tries. Wait ${Math.ceil((waitUntil - Date.now()) / 1000)} seconds.`);
      if (!Keys.norm(inp.value)) return wrong('Keys look like LOCK-XXXX-XXXX-XXXX.');
      if (!tryKey(inp.value)) {
        note('Checking…'); await refresh(); // a brand-new key is only in the live keys.json
        if (!tryKey(inp.value) && Keys.status(Keys.find(inp.value, list)) === 'missing') await refresh(true); // saved seconds ago: the site's copy lags behind GitHub
        if (!tryKey(inp.value)) { if (++fails >= 5) { fails = 0; waitUntil = Date.now() + 30000; } return wrong(whyNot(inp.value)); }
      }
      el.classList.remove('shake'); el.classList.add('opening'); note('You\'re in.');
      setTimeout(() => open(false), 900);
    });
    note(msg || ''); setTimeout(() => inp.focus(), 50);
  }
  function note(t) { const m = el && el.querySelector('#gateMsg'); if (m) m.textContent = t; }
  function wrong(t) { note(t); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

  // Fetch the live keys.json. Same site first (GitHub Pages), raw GitHub for the desktop app.
  async function refresh(direct) {
    // The desktop app (file:// or localhost) asks the live website; the website asks itself. `direct` asks GitHub itself.
    const urls = direct ? [API] : location.protocol === 'https:' ? ['keys.json', RAW] : ['https://jakedapro.github.io/Lock-in/keys.json', RAW];
    for (const u of urls) {
      try {
        const r = await fetch(u + (u.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store', headers: u === API ? { Accept: 'application/vnd.github.raw+json' } : {} }); if (!r.ok) continue;
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
    else show(fromLink ? whyNot(fromLink) : get(SAVED) ? whyNot(get(SAVED)) : '');
    recheck();
    // Check again whenever the app comes back to the front, and every half hour while it's open.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') recheck(); });
    setInterval(recheck, 30 * 6e4);
  }
  // Re-check online: a turned-off or expired key locks again, and a brand-new key works once keys.json updates.
  // Offline, the last list we saw still applies, so expiry still happens on time.
  async function recheck() {
    await refresh();
    const k = get(SAVED); if (locked() || !k) return;
    const e = Keys.check(k, list);
    if (!e) { const msg = whyNot(k); set(SAVED, null); lock(msg); return; }
    entry = e;
    const d = Keys.daysLeft(e);
    if (d != null && d <= 3 && !warned) { warned = true; onWarn.forEach(f => f(d, e)); }
  }

  return {
    start, refresh, enabled,
    onOpen: (f) => { onOpen.push(f); if (!locked()) f(entry); },
    entry: () => entry,
    isOwner: () => Keys.isAdmin(entry),
    isAdmin: () => Keys.isAdmin(entry),
    onExpirySoon: (f) => onWarn.push(f),
    setList(j) { list = j; set(CACHE, JSON.stringify(j)); }, // after the admin saves keys.json
    keys: () => list,
    forget() { set(SAVED, null); lock(''); },
  };
})();
Gate.start();
