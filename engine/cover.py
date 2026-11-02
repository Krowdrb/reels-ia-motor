"""Elige el fotograma más llamativo del video y lo guarda como portada.
Uso (en la carpeta de trabajo): python3 cover.py SLUG.mp4
Salida: cover.jpg (1080x1920), cover.json {t, ms, score}
Criterios: color y contraste altos, nitidez (no fotogramas en transición), sin destellos blancos ni pantallas vacías,
bonus si es un beat de impacto (big / icon / clone / counter / text).
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

video = sys.argv[1]
tl = json.load(open('timeline.json'))
BONUS = {'big': 0.35, 'icon': 0.25, 'clone': 0.3, 'counter': 0.2, 'text': 0.15, 'cards': 0.1, 'pills': 0.1, 'steps': 0.05}

cands = []
for s in tl['scenes']:
    if s.get('bg') == 'terra':
        continue  # el CTA final no sirve de portada
    for b in s['beats']:
        for dt in (0.7, 1.2):
            t = s['s'] + b['t'] + dt
            if t < s['e'] - 0.3:
                cands.append((t, BONUS.get(b['type'], 0)))
cands = [c for c in cands if 0.5 < c[0] < tl['total'] - 1]


def grab(t, w=270, h=480):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1',
                          '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(np.float32) if len(raw) == w * h * 3 else None


def score(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    if lum.mean() > 200 or lum.std() < 18:          # destello blanco o pantalla vacía
        return -1
    rg, yb = r - g, 0.5 * (r + g) - b
    colorful = (np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2)) / 100
    img = Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.FIND_EDGES)
    sharp = min(1.0, np.asarray(img, np.float32).var() / 1500)
    accent = ((r > 180) & (g > 90) & (b < 140)).mean() * 6   # dorado / terracota
    content = min(1.0, (lum > 60).mean() * 4)                 # que haya cosas en pantalla
    return colorful + sharp + min(1.0, accent) + content


best = (-9, 0)
for t, bonus in cands:
    a = grab(t)
    if a is None:
        continue
    sc = score(a)
    if sc < 0:
        continue
    sc += bonus
    if sc > best[0]:
        best = (sc, t)
t = best[1] if best[0] > -9 else tl['total'] / 3
if os.environ.get('COVER_T'):  # instante forzado (p. ej. el gancho que eligió el director de arte)
    t = float(os.environ['COVER_T'])
# portada limpia (sin subtítulos), dibujada por el renderizador en ese mismo instante
import os, shutil, glob
os.makedirs('cover_tmp', exist_ok=True)
r = subprocess.run(['node', 'render.js', 'stills', 'cover_tmp', f'{t:.3f}'], env={**os.environ, 'NOCAPS': '1'})
shot = glob.glob('cover_tmp/*.jpg')
if r.returncode == 0 and shot:
    shutil.move(shot[0], 'cover.jpg')
else:
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1', '-q:v', '2', 'cover.jpg'], check=True)
shutil.rmtree('cover_tmp', ignore_errors=True)
chk = np.asarray(Image.open('cover.jpg').convert('L'), np.float32)
assert chk.mean() < 225 and chk.std() > 15, 'portada en blanco o vacía'
json.dump({'t': round(float(t), 3), 'ms': int(t * 1000), 'score': round(float(best[0]), 3)}, open('cover.json', 'w'))
print(f'OK portada en {t:.2f}s (puntaje {best[0]:.2f})')
