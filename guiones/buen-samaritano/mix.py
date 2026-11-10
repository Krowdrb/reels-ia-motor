"""El buen samaritano: música original + foley + voz desde timeline.json -> out/mix.wav. Correr con el python del .venv de la biblioteca.
Mi frigio (mi–fa–sol#–la–si–do–re) en el camino; mi mayor desde «tuvo compasión». Arpa, cuerdas, flauta, celesta (glockenspiel), campanas de mano.
Dos silencios reales: tras «Un levita, igual» (hasta la campanilla del asno) y tras «El que tuvo misericordia» (hasta «Ve, y haz tú lo mismo»)."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, lp, hp, noise, brown, norm, t_, env_exp, whoosh, thump, step, limit
from scipy.ndimage import uniform_filter1d, maximum_filter1d

TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
H, L, DUR = TL['HIT'], TL['L'], TL['DUR']
N = int(DUR * SR) + SR
tt = np.arange(N) / SR
S.seed(11); rng = np.random.default_rng(5)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
endv = lambda i: L[i]['at'] + L[i]['dur']
# silencios: desde el final real de la voz hasta el primer sonido siguiente
S1a, S1b = endv('l07') + .05, H['campana']
S2a, S2b = endv('l12b') + .05, H['ve'] - .03
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))

# ——— S1 gancho: pedal grave en mi, arpa escasa, la flauta dice el motivo (mi–fa–sol#) ———
for p, v, i, pan in [('E2', .22, 'contrabass', 0), ('B2', .16, 'cellos', -.2)]: n(.05, i, p, shot['S3'] + .3, v, pan, attack=1.6, release=1.2)
for tn, p in [(.5, 'E3'), (1.1, 'B3'), (1.7, 'E4'), (2.9, 'F4'), (3.5, 'E4')]: n(tn, 'harp', p, 2.2, .28, -.25)
for j, (p, d) in enumerate([('E5', .55), ('F5', .55), ('G#5', 1.4)]): n(.9 + j * .55, 'flute', p, d * .95, .26, .2, attack=.06)
# ——— S2 el marco: arpegios de arpa (mi – fa – re menor – mi), la flauta responde ———
CH = [['E3', 'B3', 'E4', 'G#4'], ['F3', 'C4', 'F4', 'A4'], ['D3', 'A3', 'D4', 'F4'], ['E3', 'B3', 'E4', 'G#4']]
a, b, beat, k = shot['S2'], shot['S3'], .42, 0
tc = a
while tc < b - .1:
    ch = CH[int((tc - a) // (beat * 8)) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]], 1.0, .27, -.2); tc += beat; k += 1
for j, (p, d) in enumerate([('B4', 1.2), ('A4', .6), ('G#4', 1.2), ('F4', .6), ('E4', 1.8)]):
    n(a + 1.2 + sum([1.2, .6, 1.2, .6][:j]), 'flute', p, d * .95, .24, .25, attack=.08)
# ——— S3 la bajada: pizzicato en negras, cellos que bajan por grados ———
a, b = shot['S3'], shot['S4']
tc = a; k = 0
while tc < b - .05: n(tc, 'cellos_pizz', ['E3', 'B2', 'C3', 'B2'][k % 4], .5, .34, -.1); n(tc + .21, 'violins_pizz', ['G#4', 'F4', 'E4', 'F4'][k % 4], .4, .22, .2); tc += .42; k += 1
for j, p in enumerate(['E3', 'D3', 'C3', 'B2']): n(a + j * 1.0, 'cellos', p, 1.05, .26, 0, attack=.15, release=.4)
n(a, 'contrabass', 'E2', b - a, .2, 0, attack=.5, release=.3)
# ——— S4 los ladrones: cuerdas graves tensas, golpes suaves de tambor (nada violento) ———
a, b = shot['S4'], shot['S5']
for p, v, i in [('E2', .26, 'contrabass'), ('F2', .2, 'cellos'), ('E3', .2, 'cellos'), ('F3', .16, 'violas')]: n(a, i, p, b - a + .1, v, 0, attack=.8, release=.6)
for p in ['E4', 'F4']: n(a + .3, 'violins_trem', p, b - a - .2, .16, .15, attack=1.0, release=.5)
for g in ['golpe1', 'golpe2', 'golpe3']: n(H[g], 'frame_drum', None, None, .32, -.1); n(H[g] + .02, 'cellos_spic', 'E2', .3, .3, 0)
# ——— S5–S6 sacerdote y levita: flauta sola, grave, sin resolver; pedal muy bajo ———
a = shot['S5']
n(a, 'contrabass', 'E2', S1a - a - .3, .16, 0, attack=1.0, release=.5)
for j, (p, d) in enumerate([('E4', .8), ('F4', .8), ('G#4', 1.6), ('F4', 1.2), ('E4', .8), ('F4', 1.6)]):
    n(a + .2 + sum([.8, .8, 1.6, 1.2, .8][:j]), 'flute', p, d * .9, .2, .2, attack=.1)
# ——— S7 llega el samaritano: arpa en mi mayor, muy suave; crece hacia el clímax ———
a = H['campana'] + .5
for j, p in enumerate(['E3', 'B3', 'E4', 'G#4', 'B4', 'G#4', 'E4', 'B3']): n(a + j * .3, 'harp', p, 1.4, .24 + .02 * j, -.15)
for p, v, i in [('E3', .14, 'cellos'), ('B3', .12, 'violas')]: n(H['l08'] + .3, i, p, H['compasion'] - H['l08'], v, 0, attack=1.4, release=.2)
n(H['l09'], 'violins', 'G#4', H['compasion'] - H['l09'], .16, .2, attack=1.0, release=.2)
# ——— S8 clímax en «compasión»: cuerdas y trompa abren en mi mayor; una campana por cada capa que se enciende ———
X = H['compasion']
for p, v, i, pan in [('E2', .38, 'contrabass', 0), ('E3', .4, 'cellos', -.3), ('B3', .38, 'violas', -.1), ('E4', .38, 'violas', .1), ('G#4', .38, 'violins', .2), ('B4', .38, 'violins', .3), ('E5', .34, 'violins', .25)]:
    n(X, i, p, 3.4, v, pan, attack=.25, release=1.6)
for p, v in [('B3', .34), ('E4', .3)]: n(X + .05, 'horn', p, 3.0, v, -.05, attack=.4, release=1.4)
for j, p in enumerate(['E3', 'G#3', 'B3', 'E4', 'G#4', 'B4', 'E5', 'G#5', 'B5']): n(X - .36 + j * .04, 'harp', p, 2.0, .36, .15)
for j, p in enumerate(['B4', 'E5', 'G#5', 'B5']): n(X + j * .4, 'hand_chimes', p, 2.0, .3, [-.3, .3, -.15, .15][j])
a = X + 3.2
for p, v, i in [('E3', .22, 'cellos'), ('B3', .2, 'violas'), ('G#4', .18, 'violins')]: n(a, i, p, shot['S11'] - a + .4, v, 0, attack=1.2, release=1.0)
# ——— S9–S10 hacia el mesón y el mesón: arpa y flauta en mayor; dos campanitas en «dos denarios» ———
a, b, k = shot['S9'], shot['S11'], 0
CM = [['E3', 'B3', 'E4', 'G#4'], ['A2', 'E3', 'A3', 'C#4'], ['B2', 'F#3', 'B3', 'D#4'], ['E3', 'B3', 'E4', 'G#4']]
tc = a
while tc < b - .2:
    ch = CM[int((tc - a) // (.45 * 8)) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]], 1.0, .26, -.2); tc += .45; k += 1
for j, (p, d) in enumerate([('G#5', .9), ('A5', .45), ('B5', 1.35), ('G#5', .9), ('F#5', .45), ('E5', 1.8)]):
    n(a + .3 + sum([.9, .45, 1.35, .9, .45][:j]), 'flute', p, d * .95, .22, .25, attack=.07)
for tn, p in [(H['denarios'], 'E6'), (H['denario2'], 'B6')]: n(tn, 'glockenspiel', p, 1.2, .3, .25)
# ——— S11 vuelta al marco: cuerdas bajas sostenidas hasta «misericordia»; silencio 2 ———
a = shot['S11']
for p, v, i in [('E2', .18, 'contrabass'), ('E3', .18, 'cellos'), ('B3', .16, 'violas'), ('G#4', .14, 'violins')]: n(a, i, p, S2a - a - .35, v, 0, attack=1.0, release=.3)
n(H['pregunta'], 'harp', 'B3', 1.6, .22, -.2); n(H['responde'] + .2, 'harp', 'E4', 1.4, .24, -.2)
# ——— «Ve, y haz tú lo mismo»: una nota de celesta con la voz; luego arpa sola y la flauta resuelve (mi–sol#–si) ———
V = H['ve']
n(V, 'glockenspiel', 'E5', 2.4, .32, .1)
for j, p in enumerate(['E3', 'B3', 'E4', 'G#4', 'B4', 'E5']): n(V + 1.4 + j * .14, 'harp', p, 3.2, .28, -.2 + j * .08)
for p, v, i in [('E3', .16, 'cellos'), ('B3', .14, 'violas'), ('G#4', .13, 'violins')]: n(V + 1.2, i, p, DUR - V - 1.2, v, 0, attack=1.6, release=1.0)
for j, p in enumerate(['E5', 'G#5', 'B5']): n(H['cta'] + .4 + j * .7, 'flute', p, .8 if j < 2 else 2.2, .2, .25, attack=.08)
n(H['palabra'] + .6, 'glockenspiel', 'B5', 2.0, .24, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.5, mix=.24); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

# ——— foley (suave) ———
fx = np.zeros((N, 2))
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def hoof(v=1.):
    d = .09; x = t_(d); return norm(bp(noise(d), 500, 2500) * env_exp(d, .01) + np.sin(2 * np.pi * 420 * x) * env_exp(d, .015) * .6) * v
def crackle(d):
    out = np.zeros(len(t_(d))); k = rng.poisson(d * 9)
    for _ in range(k):
        s = int(rng.random() * (len(out) - 600)); c = hp(noise(.02), 2000) * env_exp(.02, .003) * (.3 + rng.random()); out[s:s + len(c)] += c
    return out + lp(brown(d), 300) * .15
def cricket(d):
    x = t_(d); return np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 28 * x) > .3) * (np.sin(2 * np.pi * .9 * x) > 0) * .4
wind = bp(noise(DUR + 1), 220, 1500)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
add(fx, wind * env_lin([(0, .5), (shot['S2'], .5), (shot['S2'] + .5, .25), (shot['S3'] - .5, .25), (shot['S3'], .6), (shot['S4'], .9), (shot['S5'], .45), (S1a - .3, .3), (S1a, 0), (S1b + .2, 0), (S1b + 1, .25), (H['compasion'], .25), (H['compasion'] + .6, 0), (DUR + 1, 0)]) * db(-30), 0, 1, .15)
cr = cricket(DUR + 1)[:N]; add(fx, cr * env_lin([(0, .7), (shot['S3'], .7), (shot['S3'] + .3, 0), (shot['S9'] + 1.5, 0), (shot['S9'] + 2, .5), (shot['S10'] - .1, .5), (shot['S10'], 0), (DUR + 1, 0)]) * db(-42), 0, 1, -.3)
add(fx, paper(.6), .32, db(-34), .2); add(fx, paper(.5), shot['S2'] + .1, db(-36), -.2)
for tn in np.arange(shot['S3'] + .1, shot['S4'], .38): add(fx, step(.8), tn, db(-38), .1); add(fx, step(.6), tn + .19, db(-41), -.1)
for g in ['golpe1', 'golpe2']: add(fx, paper(.35), H[g] - .1, db(-32), .2)
add(fx, whoosh(.45), H['golpe1'] - .05, db(-34), .3); add(fx, thump(.5, 60), H['golpe3'] + .35, db(-33), 0)
for tn in np.arange(H['sacerdote'] + .2, H['pasa'] + 1.2, .45): add(fx, step(.5), tn, db(-44), .4)
for tn in np.arange(H['levita'] - .2, S1a - .3, .32): add(fx, step(.5), tn, db(-44), -.4)
# primer sonido tras el silencio 1: la campanilla del asno, luego cascos
add(fx, S.hit('nepal_bells', None, .55), S1b, db(-14), .35)
for j, tn in enumerate(np.arange(S1b + .45, shot['S8'] - .1, .26)): add(fx, hoof(.7 + .3 * (j % 2)), tn, db(-36), .3)
add(fx, S.hit('nepal_bells', None, .3), H['monturas'] + .3, db(-26), .1)
for tn in np.arange(shot['S9'] + .2, shot['S10'] - .3, .3): add(fx, hoof(.6), tn, db(-40), 0)
add(fx, crackle(shot['S11'] + .8 - (shot['S10'] - .5)), shot['S10'] - .5, db(-30), -.1)
add(fx, paper(.5), H['ve'] + .05, db(-38), -.2)
# los silencios se respetan también en el foley y en las colas de reverberación de la música
quiet = env_lin([(0, 1), (S1a - .35, 1), (S1a, 0), (S1b - .02, 0), (S1b, 1), (S2a - .35, 1), (S2a, 0), (S2b - .02, 0), (S2b, 1), (DUR + 1, 1)])
music *= quiet[:, None]
bell_free = env_lin([(0, 1), (S1a - .35, 1), (S1a, 0), (S1b - .02, 0), (S1b - .01, 1), (S2a - .35, 1), (S2a, 0), (S2b - .02, 0), (S2b, 1), (DUR + 1, 1)])
fx *= bell_free[:, None]

# ——— voz ———
vo = np.zeros(N)
for i, l in L.items():
    w, sr = sf.read(os.path.join(HERE, 'voices', i + '.wav'), dtype='float32')
    if w.ndim > 1: w = w.mean(1)
    w = soxr.resample(w, sr, SR); s = int(l['at'] * SR); vo[s:s + len(w)] += w[:N - s]
vo = hp(vo, 80)
def comp(x, thr_db=-24, ratio=3.):
    e = np.sqrt(uniform_filter1d(x ** 2, int(.02 * SR)) + 1e-12); ed = 20 * np.log10(e)
    gdb = np.where(ed > thr_db, (thr_db - ed) * (1 - 1 / ratio), 0); gdb = uniform_filter1d(gdb, int(.01 * SR)); return x * db(gdb)
vo = comp(vo); act = np.abs(vo) > 1e-4; vo *= db(-18) / rms(vo[act])
music *= db(-25) / rms(music[np.abs(music).sum(1) > 1e-5])
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-6 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
# el clímax sube: menos ducking sobre «compasión» y la música crece
swell = env_lin([(0, .85), (shot['S4'], .95), (shot['S7'], .9), (H['compasion'] - .2, 1.0), (H['compasion'] + .2, 1.5), (H['compasion'] + 3, 1.25), (shot['S9'], 1.0), (DUR + 1, 1.0)])
music *= swell[:, None]
mix = music + fx * db(-1) + vo[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
out = mix[:int(DUR * SR)].astype(np.float32)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), out, SR)
def seg_db(a, b): x = out[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x) + 1e-12), 20 * np.log10(np.abs(x).max() + 1e-12)
for nm, (a, b) in [('silencio 1', (S1a + .02, S1b - .03)), ('silencio 2', (S2a + .02, S2b - .03))]:
    r, pk = seg_db(a, b); print(f'{nm}: {a:.2f}–{b:.2f} s ({b - a:.2f} s)  RMS {r:.1f} dBFS  pico {pk:.1f} dBFS', 'OK' if pk < -40 else 'NO')
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev} | {'nepal_bells'}))
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev} | {'nepal_bells'})))
