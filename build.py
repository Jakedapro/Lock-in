s=open('src/shell.html').read()
js=[open('src/'+f).read() for f in ['fmt.js','mathin.js','logic.js','keys.js','gate.js','cloud.js','content.js','exam.js','geo.js','viz.js','y8more.js','texkit.js','ext2.js','e1.js','physics.js','app.js']]
libs='<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n'
# MathJax renders $…$ maths as SVG (no stylesheet or font downloads). Typesetting is driven by app.js.
libs+='<script>window.MathJax={tex:{inlineMath:[],displayMath:[]},svg:{fontCache:"local"},startup:{typeset:false}};</script>\n'
libs+='<script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg-full.min.js" integrity="sha384-JtMul8ihXo9JAiFAXWE5nLGpycvMAV3P9jbtUNS50a4/Z7SUU5W6ewa9IBVQO9vF" crossorigin="anonymous"></script>\n'
# Firebase (accounts + sync) only goes in the published site, not the Claude artifact.
FB={'app':'sha384-ZaR6mWzmJtrRibZ1Vm7SoHFr8OXjyAuGAXalGDKqbxFT18oi/z+oZLIRFkpeNor1',
    'auth':'sha384-I1LYojsZ5RM1cOda44Z2h42Qa6YfsQ1XkXxREnhp4ueYBR/4d1pG1K+NZM537Vsj',
    'firestore':'sha384-Ke0FJhH7LyRqDxZ0wt+/OXV38yfQVu7g9VPEEGjYmB4RVOY/ta04uecRhsMwT7V3'}
fb=''.join(f'<script src="https://cdn.jsdelivr.net/npm/firebase@10.14.1/firebase-{m}-compat.js" integrity="{h}" crossorigin="anonymous"></script>\n' for m,h in FB.items())
import json
exams='const EXAMS = '+json.dumps(json.load(open('exams.json')), ensure_ascii=False)+';'
# Invite keys (hashes only). The website and desktop app are locked until a key is entered; the private Claude build isn't.
keys='const KEYS = '+json.dumps(json.load(open('keys.json')))+';'
consts=lambda gate: exams+'\n'+keys+'\nconst BUILD = '+json.dumps({'gate': gate})+';'
script=lambda js_list: ''.join('<script>\n'+j+'\n</script>\n' for j in js_list)
open('lock-in-artifact.html','w').write(s+'\n'+libs+script([consts(False)]+js))
page=s+'\n'+libs+fb+script([consts(True)]+js)
open('index.html','w').write('<!doctype html>\n<html lang="en" class="locked"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n'+page+'</body></html>\n')
print(len(page))
