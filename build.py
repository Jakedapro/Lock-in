s=open('src/shell.html').read()
js=[open('src/'+f).read() for f in ['logic.js','content.js','exam.js','geo.js','viz.js','app.js']]
libs='<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n'
page=s+'\n'+libs+''.join('<script>\n'+j+'\n</script>\n' for j in js)
open('lock-in-artifact.html','w').write(page)
open('index.html','w').write('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n'+page+'</body></html>\n')
print(len(page))
