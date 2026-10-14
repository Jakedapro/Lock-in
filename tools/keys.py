#!/usr/bin/env python3
"""Invite keys for Lock in.

  python3 tools/keys.py new "Friend 16" [--owner]   make a key, add its hash to keys.json (label is public)
  python3 tools/keys.py revoke k07            turn a key off (everyone using it is locked out)
  python3 tools/keys.py restore k07           turn it back on
  python3 tools/keys.py list                  show ids, labels and status

keys.json (public, committed) holds only hashes. The keys themselves and who has them go in
../lock-in-keys.md, next to the repo and never committed. Commit and push keys.json afterwards.
"""
import hashlib, json, os, secrets, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'keys.json')
PRIVATE = os.path.join(os.path.dirname(ROOT), 'lock-in-keys.md')
ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'  # must match src/keys.js

def load():
    try: return json.load(open(PUBLIC))
    except FileNotFoundError: return {'v': 1, 'keys': []}

def save(d):
    with open(PUBLIC, 'w') as f:
        f.write('{\n  "v": 1,\n  "keys": [\n' + ',\n'.join('    ' + json.dumps(k) for k in d['keys']) + '\n  ]\n}\n')

def note(line):
    new = not os.path.exists(PRIVATE)
    with open(PRIVATE, 'a') as f:
        if new: f.write('# Lock in invite keys (private: never commit this file)\n\n| id | key | for |\n|---|---|---|\n')
        f.write(line + '\n')

def new(label, owner=False):
    d = load()
    n = ''.join(secrets.choice(ABC) for _ in range(12))
    key = 'LOCK-' + '-'.join(n[i:i + 4] for i in range(0, 12, 4))
    kid = 'k%02d' % (max([int(k['id'][1:]) for k in d['keys']] + [0]) + 1)
    # The label is public (keys.json is in a public repo), so keep it generic: 'Friend 16', not a full name.
    entry = {'id': kid, 'hash': hashlib.sha256(('lockin-key:' + n).encode()).hexdigest(), 'label': label}
    if owner: entry['owner'] = True
    d['keys'].append(entry); save(d)
    note(f'| {kid} | `{key}` | {label}{" (owner)" if owner else ""} |')
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
    if a[:1] == ['new'] and len(a) >= 2: new(a[1], '--owner' in a)
    elif a[:1] == ['revoke'] and len(a) == 2: set_revoked(a[1], True)
    elif a[:1] == ['restore'] and len(a) == 2: set_revoked(a[1], False)
    elif a[:1] == ['list']:
        for k in load()['keys']: print(k['id'], 'owner' if k.get('owner') else '', 'REVOKED' if k.get('revoked') else 'on')
    else: print(__doc__)
