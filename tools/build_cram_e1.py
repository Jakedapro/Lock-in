#!/usr/bin/env python3
"""Builds the Ext 1 cram sheet page from the JSON files in a content folder.
  python3 tools/build_cram_e1.py <folder with de.json, calc.json, vec.json, func.json, trig.json, stats.json, count.json, graph.json, qa.json, priority.json> <out.html>
The notes content is the student's own and stays out of the repo; only this script and the template are tracked."""
import json, os, sys
src, out = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = {'graph': ['graph'], 'de': ['de'], 'calc': ['calc'], 'vec': ['vec'], 'func': ['func'], 'trig': ['trig'], 'stats': ['stats'], 'count': ['count']}
topics = {}
for t, names in FILES.items():
    d = {'essentials': [], 'methods': [], 'examples': [], 'mistakes': []}
    for n in names:
        f = os.path.join(src, n + '.json')
        if not os.path.exists(f): print('missing', n); continue
        j = json.load(open(f))
        for k in d: d[k] += j.get(k, [])
    d['mistakes'] = list(dict.fromkeys(d['mistakes']))
    topics[t] = d
qa = []
fp = os.path.join(src, 'qa.json')
if os.path.exists(fp): qa = json.load(open(fp)).get('qa', [])
for extra in sorted(f for f in os.listdir(src) if f.startswith('qa-') and f.endswith('.json')): qa += json.load(open(os.path.join(src, extra))).get('qa', [])
pr = None
fp = os.path.join(src, 'priority.json')
if os.path.exists(fp): pr = json.load(open(fp))
srcs = [x.get('src') for x in qa]
assert len(srcs) == len(set(srcs)), 'duplicate qa src: ' + str([s for s in srcs if srcs.count(s) > 1])
if pr:
    for s in pr.get('qa', []): assert s in srcs, 'priority qa not found: ' + s
html = open(os.path.join(root, 'tools', 'cram-e1-template.html')).read().replace('/*DATA*/null', json.dumps({'topics': topics, 'qa': qa, 'priority': pr}, ensure_ascii=False).replace('</', '<\\/'))
html = html.replace('/*DIAGRAMS*/', open(os.path.join(root, 'tools', 'cram-e1-diagrams.js')).read())
open(out, 'w').write(html)
print({t: {k: len(v) for k, v in d.items()} for t, d in topics.items()}, len(qa), 'questions', len(html) // 1024, 'KB')
