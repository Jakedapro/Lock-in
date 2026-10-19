#!/usr/bin/env python3
"""Invite keys for Lock in.

  python3 tools/keys.py new "Friend 16" [--days 7] [--admin]   make a key (label is public; no --days = never expires)
  python3 tools/keys.py revoke k07            turn a key off (everyone using it is locked out)
  python3 tools/keys.py restore k07           turn it back on
  python3 tools/keys.py list                  show ids, labels and status

keys.json (public, committed) holds only hashes. It always starts from GitHub's current copy. The keys themselves and who has them go in
../lock-in-keys.md, next to the repo and never committed. Commit and push keys.json afterwards.
"""
import hashlib, json, os, secrets, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'keys.json')
PRIVATE = os.path.join(os.path.dirname(ROOT), 'lock-in-keys.md')
ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'  # must match src/keys.js

LIVE = 'https://api.github.com/repos/Jakedapro/Lock-in/contents/keys.json?ref=main'

def load():
    # Start from GitHub's copy, not this folder's: the Admin panel saves straight to GitHub, so a local
    # copy can be out of date, and pushing an old one would turn deleted keys back on.
    try:
        # curl, not urllib: it uses the system's certificates, which Homebrew Python often can't find
        live = json.loads(subprocess.run(['curl', '-fsS', '--max-time', '15', '-H', 'Accept: application/vnd.github.raw+json', LIVE], capture_output=True, check=True).stdout)
        try: local = json.load(open(PUBLIC))
        except (FileNotFoundError, ValueError): local = None
        if local is not None and local != live: print('keys.json here was out of date; using the copy on GitHub.')
        return live
    except Exception as e:
        if 'list' not in sys.argv: sys.exit(f"Couldn't read keys.json from GitHub ({e}). Not changing anything, so nothing gets overwritten.")
        print("Couldn't reach GitHub; showing this folder's copy, which may be out of date.")
    try: return json.load(open(PUBLIC))
    except FileNotFoundError: return {'v': 1, 'keys': []}

def save(d):
    extra = ''.join(f'  {json.dumps(k)}: {json.dumps(v)},\n' for k, v in d.items() if k not in ('v', 'keys'))  # keep any other fields
    with open(PUBLIC, 'w') as f:
        f.write('{\n  "v": 1,\n' + extra + '  "keys": [\n' + ',\n'.join('    ' + json.dumps(k) for k in d['keys']) + '\n  ]\n}\n')
    print('Saved keys.json. Push it now (git add keys.json && git commit && git push) or the key won\'t work.')

def note(line):
    new = not os.path.exists(PRIVATE)
    with open(PRIVATE, 'a') as f:
        if new: f.write('# Lock in invite keys (private: never commit this file)\n\n| id | key | for |\n|---|---|---|\n')
        f.write(line + '\n')

def new(label, admin=False, days=None):
    d = load()
    n = ''.join(secrets.choice(ABC) for _ in range(12))
    key = 'LOCK-' + '-'.join(n[i:i + 4] for i in range(0, 12, 4))
    kid = 'k%02d' % (max([int(k['id'][1:]) for k in d['keys']] + [0]) + 1)
    # The label is public (keys.json is in a public repo), so keep it generic: 'Friend 16', not a full name.
    entry = {'id': kid, 'hash': hashlib.sha256(('lockin-key:' + n).encode()).hexdigest(), 'label': label}
    if admin: entry['admin'] = True
    elif days: entry['exp'] = int((time.time() + days * 86400) * 1000)
    d['keys'].append(entry); save(d)
    note(f'| {kid} | `{key}` | {label}{" (admin)" if admin else f" ({days} days)" if days else ""} |')
    print(kid, key, label)

def set_revoked(kid, on):
    d = load()
    for k in d['keys']:
        if k['id'] == kid:
            if on: k['revoked'] = True
            else: k.pop('revoked', None)
            save(d); print(kid, 'revoked' if on else 'restored'); return
    sys.exit('no key ' + kid)

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['new'] and len(a) >= 2: new(a[1], '--admin' in a, int(a[a.index('--days') + 1]) if '--days' in a else None)
    elif a[:1] == ['revoke'] and len(a) == 2: set_revoked(a[1], True)
    elif a[:1] == ['restore'] and len(a) == 2: set_revoked(a[1], False)
    elif a[:1] == ['list']:
        for k in load()['keys']: print(k['id'], k.get('label', ''), 'admin' if k.get('admin') else '', 'REVOKED' if k.get('revoked') else 'expires ' + time.strftime('%Y-%m-%d', time.localtime(k['exp'] / 1000)) if k.get('exp') else 'on')
    else: print(__doc__)
