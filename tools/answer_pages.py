#!/usr/bin/env python3
"""Finds which page of each marking guideline / answers file covers each question, so the app's "?"
can jump straight to the answer. Reads desktop/papers/*-mg.pdf (macOS: uses PDFKit through Swift)
and writes tools/paper-index/answers.json: {subject: {year: {"mc": page, "11": page, "11b(ii)": page}}}."""
import json, os, re, subprocess, sys, tempfile
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
papers = os.path.join(root, 'desktop', 'papers')
swift = os.path.join(tempfile.gettempdir(), 'lockin-pdftext.swift')
open(swift, 'w').write('import PDFKit\nlet d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!\nfor i in 0..<d.pageCount { print("=== page \\(i+1) ==="); print(d.page(at: i)?.string ?? "") }\n')
out = {}
for f in sorted(os.listdir(papers)):
    m = re.match(r'(y12|e1|phys)-(\d{4})-mg\.pdf$', f)
    if not m: continue
    text = subprocess.run(['swift', swift, os.path.join(papers, f)], capture_output=True, text=True).stdout
    pages, page, found = {}, 0, False
    for line in text.splitlines():
        pm = re.match(r'=== page (\d+) ===', line)
        if pm: page = int(pm.group(1)); continue
        if re.search(r'multiple.choice answer key|section i\b', line, re.I) and 'mc' not in pages: pages['mc'] = page
        qm = re.match(r'\s*Question\s+(\d{1,2})\s*((?:\(\s*[a-z]{1,4}\s*\)\s*)*)', line)
        if qm:
            n, subs = qm.group(1), re.findall(r'\(\s*([a-z]{1,4})\s*\)', qm.group(2))
            pages.setdefault(n, page)
            if subs: pages.setdefault(n + subs[0] + ''.join(f'({s})' for s in subs[1:]), page)
    out.setdefault(m.group(1), {})[m.group(2)] = pages
json.dump(out, open(os.path.join(root, 'tools', 'paper-index', 'answers.json'), 'w'), separators=(',', ':'))
print({k: len(v) for k, v in out.items()}, sum(len(p) for v in out.values() for p in v.values()), 'entries')
