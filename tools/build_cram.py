#!/usr/bin/env python3
"""Builds the Ext 2 cram sheet page from the JSON files the readers wrote.
  python3 tools/build_cram.py <folder with complex-a.json, complex-b.json, integration.json, ... qa.json> <out.html>
The notes content is the student's own and stays out of the repo; only this script and the template are tracked."""
import json, os, sys
src, out = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = {'complex': ['complex-1', 'complex-part2'], 'proof': ['proof'], 'integration': ['integration'], 'vectors': ['vectors'], 'mechanics': ['mechanics']}
topics = {}
for t, names in FILES.items():
    d = {'essentials': [], 'methods': [], 'examples': [], 'mistakes': []}
    for n in names:
        f = os.path.join(src, n + '.json')
        if not os.path.exists(f): print('missing', n); continue
        j = json.load(open(f))
        for k in d: d[k] += j.get(k, [])
    seen = set(); ess = []
    for e in d['essentials']:  # same heading from both halves: merge items
        k = e['h'].strip().lower()
        if k in seen: next(x for x in ess if x['h'].strip().lower() == k)['items'] += [i for i in e['items'] if i not in next(x for x in ess if x['h'].strip().lower() == k)['items']]
        else: seen.add(k); ess.append(e)
    d['essentials'] = ess; d['mistakes'] = list(dict.fromkeys(d['mistakes']))
    topics[t] = d
qa = []
for f in ['qa-hsc-complex', 'qa-hsc-proof', 'qa-hsc-integration', 'qa-hsc-vectors', 'qa-hsc-mechanics', 'qa']:  # real HSC questions first, then trial papers
    fp = os.path.join(src, f + '.json')
    if os.path.exists(fp): qa += json.load(open(fp)).get('qa', [])
vh = []
fp = os.path.join(src, 'vectors-hard.json')
if os.path.exists(fp): vh = json.load(open(fp)).get('hard', [])
ch = []
fp = os.path.join(src, 'complex-hard.json')
if os.path.exists(fp): ch = json.load(open(fp)).get('hard', [])
teacher = {}
try:
    import base64, io
    from PIL import Image
    TD = {'complex': ['diag-complex-a', 'diag-complex-b'], 'integration': ['diag-integration'], 'mechanics': ['diag-mechanics'], 'proof': ['diag-proof'], 'vectors': ['diag-vectors']}
    notes = os.path.join(os.path.dirname(src), 'notes')
    total = 0
    for t, names in TD.items():
        for n in names:
            fp = os.path.join(src, n + '.json')
            if not os.path.exists(fp): continue
            for d in json.load(open(fp)).get('diagrams', []):
                for folder in ('img2', 'img'):
                    ip = os.path.join(notes, folder, d['img'])
                    if os.path.exists(ip): break
                else: continue
                im = Image.open(ip).convert('RGB'); W, H = im.size
                x0, y0, x1, y1 = [float(v) for v in d['crop']]
                x0, x1 = max(0, x0 - .01), min(1, x1 + .01); y0, y1 = max(0, y0 - .01), min(1, y1 + .01)
                if x1 - x0 < .05 or y1 - y0 < .03: continue
                c = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
                if c.width > 620: c = c.resize((620, int(c.height * 620 / c.width)), Image.LANCZOS)
                buf = io.BytesIO(); c.save(buf, 'JPEG', quality=55, optimize=True); total += buf.tell()
                teacher.setdefault(t, []).append({'src': 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode(), 'title': d.get('title', ''), 'cap': d.get('cap', ''), 'from': d['img']})
    print('teacher diagrams:', {k: len(v) for k, v in teacher.items()}, total // 1024, 'KB')
except ImportError:
    print('Pillow missing: skipping the teacher diagrams')
pr = None
fp = os.path.join(src, 'priority.json')
if os.path.exists(fp): pr = json.load(open(fp))
html = open(os.path.join(root, 'tools', 'cram-template.html')).read().replace('/*DATA*/null', json.dumps({'topics': topics, 'qa': qa, 'priority': pr, 'vectorsHard': vh, 'complexHard': ch, 'teacher': teacher}, ensure_ascii=False).replace('</', '<\\/'))
html = html.replace('/*DIAGRAMS*/', open(os.path.join(root, 'tools', 'cram-diagrams.js')).read())
open(out, 'w').write(html)
print({t: {k: len(v) for k, v in d.items()} for t, d in topics.items()}, len(qa), 'questions', len(html) // 1024, 'KB')
