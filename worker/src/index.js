/* ===== Lock in — free 1-day keys (Cloudflare Worker) =====
   LootLabs sends people here once they finish its steps. Each device (and each network) gets one
   key a day: a fresh LOCK-XXXX-XXXX-XXXX whose hash is added to keys.json in the repo, so the site
   accepts it straight away. Only the hash goes in the repo; the key itself is shown once, here.
   Expired free keys are cleared out of keys.json whenever a new one is added. */

const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', LEN = 12, SALT = 'lockin-key:'; // must match src/keys.js
const DAY = 864e5;

const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
function makeKey() {
  const out = [], r = new Uint32Array(LEN); crypto.getRandomValues(r);
  for (const v of r) out.push(ABC[v % ABC.length]);
  const n = out.join('');
  return { n, pretty: 'LOCK-' + n.match(/.{4}/g).join('-') };
}
const b64decode = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0)));
const b64encode = (s) => { const b = new TextEncoder().encode(s); let t = ''; for (const x of b) t += String.fromCharCode(x); return btoa(t); };
const toJson = (list) => '{\n  "v": 1,\n  "keys": [\n' + list.keys.map(k => '    ' + JSON.stringify(k)).join(',\n') + '\n  ]\n}\n';

// Add one entry to keys.json on GitHub (re-reading and retrying if someone saved in between).
async function addToRepo(env, entry) {
  const url = `https://api.github.com/repos/${env.REPO}/contents/keys.json`;
  const h = { Authorization: 'Bearer ' + env.GH_TOKEN, Accept: 'application/vnd.github+json', 'User-Agent': 'lockin-keys-worker' };
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url + '?ref=main', { headers: h });
    if (!r.ok) throw new Error('read ' + r.status);
    const j = await r.json(), list = JSON.parse(b64decode(j.content)), now = Date.now();
    list.keys = list.keys.filter(k => !(k.free && k.exp && k.exp < now)); // tidy: drop free keys that ran out
    const next = Math.max(0, ...list.keys.map(k => +String(k.id).slice(1) || 0)) + 1;
    list.keys.push({ id: 'k' + String(next).padStart(2, '0'), ...entry });
    const p = await fetch(url, { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Free 1-day key', content: b64encode(toJson(list)), sha: j.sha, branch: 'main' }) });
    if (p.ok) return;
    if (p.status !== 409 && p.status !== 422) throw new Error('write ' + p.status);
  }
  throw new Error('busy');
}

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function page(env, body, status = 200, cookie) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lock in: free key</title><meta name="robots" content="noindex">
<style>
:root{--bg:#0f1218;--card:#171b23;--ink:#e7ecf2;--mute:#9aa4b2;--acc:#7dd3fc;--line:#2a303b}
@media (prefers-color-scheme:light){:root{--bg:#f4f6f9;--card:#fff;--ink:#141820;--mute:#5b6472;--acc:#0369a1;--line:#d9dee6}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;padding:24px max(16px,env(safe-area-inset-left))}
.c{max-width:440px;width:100%;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:28px;text-align:center}
h1{margin:0 0 6px;font-size:24px}h1 span{color:var(--acc)}p{color:var(--mute);margin:8px 0}
.k{font:700 22px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:14px;margin:18px 0;user-select:all;word-break:break-all}
a.b,button{display:inline-block;margin:6px 4px;padding:11px 18px;border-radius:10px;border:0;font:600 15px system-ui;cursor:pointer;text-decoration:none;background:var(--acc);color:var(--bg)}
button.g{background:transparent;color:var(--ink);border:1px solid var(--line)}
</style></head><body><main class="c"><h1>Lock <span>in</span></h1>${body}</main>
<script>document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{navigator.clipboard.writeText(b.dataset.copy).then(()=>b.textContent='Copied',()=>{const r=document.createRange();r.selectNodeContents(document.querySelector('.k'));getSelection().removeAllRanges();getSelection().addRange(r);b.textContent='Selected: copy it'})})</script>
</body></html>`;
  const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(html, { status, headers });
}
function showKey(env, key, exp, cookie) {
  const until = new Date(exp).toLocaleString('en-AU', { timeZone: 'Australia/Sydney', weekday: 'short', hour: 'numeric', minute: '2-digit' });
  const link = env.SITE + '#key=' + key;
  return page(env, `<p>Here's your free key. It works until <b>${esc(until)}</b>.</p>
<div class="k">${esc(key)}</div>
<a class="b" href="${esc(link)}">Open Lock in</a><button class="g" type="button" data-copy="${esc(key)}">Copy key</button>
<p style="font-size:14px">One free key per device a day. Opening this page again shows the same key.</p>`, 200, cookie);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname !== '/') return new Response('Not found', { status: 404 });
    if (!env.GH_TOKEN) return page(env, '<p>Free keys aren\'t set up yet. Try again later.</p>', 503);

    // Who's asking: a cookie for this device, plus a hash of the network address (never stored in plain).
    const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
    const ipKey = 'ip:' + (await sha256('lockin-ip:' + ip)).slice(0, 32);
    const dev = (req.headers.get('Cookie') || '').match(/(?:^|;\s*)lk=([a-f0-9]{32})/)?.[1];
    const devId = dev || hex(crypto.getRandomValues(new Uint8Array(16)));
    const cookie = `lk=${devId}; Max-Age=31536000; Path=/; Secure; HttpOnly; SameSite=Lax`;

    // Already had one today: show the same key again.
    const prior = (dev && await env.ISSUED.get('dev:' + dev, 'json')) || await env.ISSUED.get(ipKey, 'json');
    if (prior && prior.exp > Date.now()) return showKey(env, prior.key, prior.exp, cookie);

    const { n, pretty } = makeKey(), exp = Date.now() + DAY;
    try { await addToRepo(env, { hash: await sha256(SALT + n), label: 'Free', free: true, exp }); }
    catch (e) { return page(env, '<p>Couldn\'t make a key right now. Wait a minute and refresh this page.</p>', 502); }
    const rec = JSON.stringify({ key: pretty, exp }), ttl = { expirationTtl: 86400 };
    await Promise.all([env.ISSUED.put('dev:' + devId, rec, ttl), env.ISSUED.put(ipKey, rec, ttl)]);
    return showKey(env, pretty, exp, cookie);
  },
};
