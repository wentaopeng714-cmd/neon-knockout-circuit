from pathlib import Path
import base64
p=Path(__file__).resolve().parent
js=(p/'game.js').read_text()
for key,name in [('FIGHTER','fighters'),('SKYE','skye'),('TANK','tank'),('RAVEN','raven'),('SOL','sol')]:
 data=base64.b64encode((p/f'assets/{name}.png').read_bytes()).decode()
 js=js.replace('/* '+key+'_IMAGE */','data:image/png;base64,'+data)
html=(p/'index.template.html').read_text().replace('/* GAME_SCRIPT */',js)
(p/'index.html').write_text(html)
print('Built self-contained game:',len(html.encode()),'bytes')
