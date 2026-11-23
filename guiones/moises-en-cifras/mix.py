"""Moisés en cifras (40, 80 y 120): score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
D Dorian (desert, waiting) that grows up to the bush and opens to D MAJOR on the second «Moisés»; G major on the Nebo.
Harp, reed flute (the shepherd), celesta, low strings, horn, one timpani stroke and a small gong; a frame drum only in the march.
Motif: three rising notes D–E–A, once for each forty (harp in the palace, flute in Madian, horn in the march; all three together at the end).
Two real silences (music, ambience and foley all out): before «¡Moisés, Moisés!» and before the Nebo. Checked at the end (< -55 dB)."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, lp, hp, noise, brown, norm, t_, env_exp, whoosh, thump, limit
from scipy.ndimage import uniform_filter1d, maximum_filter1d

TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
H, L, DUR = TL['HIT'], TL['L'], TL['DUR']
N = int(DUR * SR) + SR
tt = np.arange(N) / SR
S.seed(17); rng = np.random.default_rng(8)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
S1a, S1b = H['silencio1'], H['voz']        # silence 1: end of «Ardía… y no se consumía» -> «¡Moisés, Moisés!»
S2a, S2b = H['silencio2'], H['nebo']       # silence 2: end of «…cuarenta años» -> «A los ciento veinte…»
X = H['estallido']
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
def motif(t0, inst, notes, step, v, pan=0., d=1.2, **k):
    for j, p in enumerate(notes): n(t0 + j * step, inst, p, d, v, pan, **k)

# ——— P1 Horeb at night: low pedal on D, sparse harp, the flute leaves two notes ———
for p, v, i, pan in [('D2', .2, 'contrabass', 0), ('A2', .17, 'cellos', -.2)]: n(.05, i, p, shot['S2'] + .4, v, pan, attack=1.0, release=1.0)
for tn, p in [(.3, 'D4'), (1.3, 'A3'), (H['l02'], 'F4'), (H['l02'] + .8, 'C4')]: n(tn, 'harp', p, 2.4, .28, -.25)
n(1.6, 'flute', 'A4', .7, .22, .2, attack=.1); n(2.35, 'flute', 'G4', 1.1, .2, .2, attack=.1)
# ——— P2 palace (40): the harp says the motif ———
a = shot['S2']
motif(a + .25, 'harp', ['D4', 'E4', 'A4'], .45, .34, -.15, d=2.2)
for j, p in enumerate(['D3', 'A3', 'F3', 'C4', 'D3']): n(a + .2 + j * .48, 'harp', p, 1.0, .18, .2)
for p, v, i in [('D3', .16, 'cellos'), ('A3', .14, 'violas')]: n(a, i, p, shot['S3'] - a + .2, v, 0, attack=.6, release=.6)
# ——— P3 bricks: only the low pedal; it cuts dead under the curtain on «mató» ———
a, cutT = shot['S3'], H['mato'] + .2
for p, v, i in [('D2', .24, 'contrabass'), ('D3', .16, 'cellos'), ('G#2', .1, 'cellos')]: n(a, i, p, cutT - a, v, 0, attack=.4, release=.05)
n(cutT + .5, 'harp', 'A2', 1.6, .26, .2); n(cutT + 1.0, 'harp', 'D3', 1.6, .24, .25)
# ——— P4 Madian (40): the reed flute alone says the motif, harp pulse beneath ———
a = shot['S4']
motif(a + .2, 'flute', ['D5', 'E5', 'A5'], .5, .28, .2, d=.9, attack=.06)
n(a + 1.7, 'flute', 'G5', .5, .22, .2, attack=.06); n(a + 2.2, 'flute', 'E5', .9, .2, .2, attack=.06)
for j in range(5): n(a + j * .55, 'harp', ['D3', 'A3', 'C4', 'A3', 'D3'][j], 1.2, .2, -.2)
# ——— P5 the bush: violas rise from below and grow toward the silence ———
a = shot['S5']
for p, v, i in [('D2', .2, 'contrabass'), ('D3', .22, 'cellos'), ('A3', .22, 'violas'), ('C4', .2, 'violas'), ('E4', .18, 'violins')]:
    n(a + .3, i, p, S1a - a - .35, v, 0, attack=2.6, release=.2)
for j, p in enumerate(['A5', 'D6', 'E6']): n(H['l08'] + j * .5, 'celesta', p, 1.6, .2 + j * .03, .2)
# ——— after silence 1: the voice first; on the second «Moisés» timpani (D) + gong, harp and celesta up, strings and horn in D MAJOR ———
n(X, 'timpani', 'D3', 3.0, .55, 0)
n(X + .02, 'gong', None, 3.0, .35, 0)
for j, p in enumerate(['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(X - .25 + j * .04, 'harp', p, 2.6, .38, -.2 + j * .04)
for j, p in enumerate(['A5', 'D6', 'F#6', 'A6', 'D7']): n(X + .05 + j * .12, 'celesta', p, 1.8, .26, -.2 + j * .1)
for p, v, i, pan in [('D2', .4, 'contrabass', 0), ('D3', .4, 'cellos', -.25), ('A3', .38, 'violas', -.1), ('D4', .38, 'violas', .1), ('F#4', .38, 'violins', .2), ('A4', .36, 'violins', .3), ('D5', .32, 'violins', .25)]:
    n(X + .02, i, p, shot['S8'] - X, v, pan, attack=.3, release=1.2)
for p, v in [('D3', .3), ('A3', .26)]: n(X + .1, 'french_horn', p, 3.4, v, 0, attack=.4, release=1.2)
for j, p in enumerate(['F#6', 'A5', 'D6', 'E6']): n(shot['S7'] + .4 + j * .9, 'celesta', p, 1.8, .18, .15)
# ——— P8 pharaoh (80): the palace harp comes back an octave lower ———
a = shot['S8']
motif(a + .1, 'harp', ['D3', 'E3', 'A3'], .45, .34, -.15, d=2.0)
for p, v, i in [('D2', .2, 'contrabass'), ('A2', .16, 'cellos')]: n(a, i, p, shot['S9'] - a + .3, v, 0, attack=.3, release=.6)
# ——— P9 the march (40): the horn says the motif; frame drum strokes that speed up; harp ostinato; all cut at silence 2 ———
a = shot['S9']
motif(a + .2, 'french_horn', ['D4', 'E4', 'A4'], .55, .32, 0, d=1.2, attack=.1, release=.3)
for p, v, i in [('D2', .24, 'contrabass'), ('A2', .2, 'cellos'), ('D3', .18, 'violas')]: n(a, i, p, S2a - a, v, 0, attack=.3, release=.15)
ts, k = a + .1, 0
while ts < S2a - .15: n(ts, 'frame_drum', 'large', 1.0, .3 + .15 * (ts - a) / (S2a - a), 0); ts += .52 - .2 * (ts - a) / (S2a - a)
ts = a
while ts < S2a - .2: n(ts, 'harp', ['D3', 'A3', 'C4', 'A3'][k % 4], .8, .2, -.2); ts += .3; k += 1
# ——— P10 Nebo (120): the voice first; then a long harp harmonic ———
a = S2b
n(a + .9, 'harp', 'G5', 3.6, .24, .2); n(a + 2.4, 'harp', 'D5', 3.0, .2, .1)
for p, v, i in [('G2', .16, 'cellos'), ('D3', .14, 'violas')]: n(a + .6, i, p, shot['S11'] - a, v, 0, attack=1.5, release=.6)
# ——— P11 the land: strings and harp open in G MAJOR; a celesta bell for each layer that lights ———
a = shot['S11']
for p, v, i, pan in [('G2', .3, 'contrabass', 0), ('G3', .3, 'cellos', -.2), ('D4', .28, 'violas', -.1), ('G4', .28, 'violins', .1), ('B4', .26, 'violins', .2)]:
    n(a, i, p, DUR - a, v * .85, pan, attack=.8, release=1.4)
for j, p in enumerate(['G3', 'B3', 'D4', 'G4', 'B4', 'D5']): n(a + j * .1, 'harp', p, 3.0, .3, -.2 + j * .08)
for j in range(4): n(H['tierra'] + .05 + j * .3, 'celesta', ['D6', 'G6', 'B6', 'D7'][j], 1.6, .2, -.2 + j * .12)
# ——— P12 the end: the motif in three voices together in G; the shepherd's flute closes alone ———
a = H['leccion'] + .1
for inst, v, pan in [('harp', .3, -.2), ('flute', .24, .2), ('french_horn', .22, 0)]: motif(a, inst, ['G4', 'A4', 'D5'], .5, v, pan, d=1.3, attack=.05)
for j, (p, d) in enumerate([('B4', .6), ('A4', .6), ('G4', 2.0)]): n(H['pregunta'] + .9 + [0, .6, 1.2][j], 'flute', p, d, .2, .2, attack=.08)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the score swells toward the bush; a hard cut under the curtain («mató»)
music *= env_lin([(0, .8), (shot['S5'], .85), (S1a - .2, 1.1), (X, 1.25), (shot['S8'], 1.0), (DUR + 1, .9)])[:, None]
music *= env_lin([(0, 1), (H['mato'] + .17, 1), (H['mato'] + .2, .0), (H['mato'] + .45, .0), (H['mato'] + .6, 1), (DUR + 1, 1)])[:, None]

# ——— foley and ambience ———
fx = np.zeros((N, 2))
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def step(v=1., f=900): d = .09; return norm(lp(noise(d), f) * env_exp(d, .02)) * v
def bell(f, d=1.2): x = t_(d); return norm(sum(np.sin(2 * np.pi * f * m * x) * a for m, a in ((1, 1), (2.76, .35), (5.4, .12))) * env_exp(d, .35) * np.minimum(1, x / .004))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def hiss(d):   # the bush: a fine hiss, not crackling wood
    x = t_(d); return norm(bp(noise(d), 3000, 9000)[:len(x)] * (.7 + .3 * np.sin(2 * np.pi * 7.3 * x) * np.sin(2 * np.pi * 3.1 * x)))
def chirp(): d = .16; x = t_(d); f = 3200 + 1600 * np.sin(np.pi * x / d); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)
def cricket(): d = .12; x = t_(d); return norm(np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 60 * x) > 0) * np.sin(np.pi * x / d))
def bleat(): d = .5; x = t_(d); f = 420 + 40 * np.sin(2 * np.pi * 22 * x); return norm(lp(np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(4 * np.pi * np.cumsum(f) / SR), 1800) * np.sin(np.pi * x / d))
wind = bp(noise(DUR + 1), 200, 1400)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.1))
add(fx, wind * env_lin([(0, .7), (shot['S2'] - .3, .7), (shot['S2'] + .3, 0), (shot['S5'] - .8, 0), (shot['S5'], .7), (S1a - .3, .5), (S1a, 0), (DUR + 1, 0)]) * db(-30), 0, 1, .15)
for tn in np.arange(.4, shot['S2'] - .3, .9): add(fx, cricket(), tn + rng.random() * .3, db(-44), rng.uniform(-.6, .6))
hall = lp(brown(DUR + 1), 500)[:N]
add(fx, hall * env_lin([(0, 0), (shot['S2'] - .2, 0), (shot['S2'] + .3, .6), (shot['S3'], .6), (shot['S3'] + .3, 0), (shot['S8'] - .2, 0), (shot['S8'] + .2, .6), (shot['S9'], .6), (shot['S9'] + .3, 0), (DUR + 1, 0)]) * db(-36), 0, 1, 0)
dry = bp(noise(DUR + 1), 600, 5000)[:N]   # dry wind with sand, entering before the cut (J-cut)
add(fx, dry * env_lin([(0, 0), (shot['S3'] - .5, 0), (shot['S3'], .6), (shot['S4'], .5), (shot['S4'] + 2.0, .6), (shot['S5'], 0), (shot['S9'] - .3, 0), (shot['S9'] + .2, .6), (S2a - .2, .6), (S2a, 0), (DUR + 1, 0)]) * db(-35), 0, 1, -.1)
breeze = bp(noise(DUR + 1), 400, 2500)[:N]
add(fx, breeze * env_lin([(0, 0), (S2b + .3, 0), (S2b + 1.0, .6), (DUR + 1, .6)]) * db(-36), 0, 1, -.2)
for tn, pan in [(shot['S11'] + .4, .3), (shot['S11'] + .62, .3), (shot['S12'] + 1.0, -.4), (H['leccion'] + .8, .4), (H['leccion'] + 1.0, .4), (H['pregunta'] + 1.6, -.3)]: add(fx, chirp(), tn, db(-38), pan)
# P1: the bush hisses softly; Clawd on the rock; the title strip
add(fx, hiss(shot['S2'] - .2), .1, db(-42), .1); add(fx, paper(.6), .3, db(-36), -.1); add(fx, lp(noise(.3), 500) * np.sin(np.pi * t_(.3) / .3)[:int(.3 * SR)], .2, db(-38), -.2)
# P2: Clawd's steps on polished stone
for tn in np.arange(shot['S2'] + .2, H['l03'] + 1.5, .22): add(fx, step(.6, 2500), tn, db(-38), -.2 + (tn - shot['S2']) * .1)
# P3: the long rustle of the curtain; quick steps that run away
add(fx, whoosh(.9), H['mato'] - .25, db(-26), -.2); add(fx, paper(.9), H['mato'] - .2, db(-30), 0)
for tn in np.arange(H['mato'] + .35, shot['S4'] + .1, .13): add(fx, step(), tn, db(-32 - (tn - H['mato']) * 3), .1 + (tn - H['mato']) * .25)
# P4: a small bell at each sunrise (closer and closer), the flock
for tn in [9.93, 10.5, 11.0, 11.42, 11.78]: add(fx, bell(2100, .8), tn, db(-38), .3)
for tn, pan in [(shot['S4'] + .5, -.4), (shot['S4'] + 1.6, .4)]: add(fx, bleat(), tn, db(-40), pan)
# P5: the hiss grows; two steps on gravel
hd = S1a - .25 - shot['S5']; hz = hiss(hd); add(fx, hz * np.linspace(.3, 1, len(hz)), shot['S5'], db(-34), 0)
for tn in (H['l07'] + .5, H['l07'] + 1.1): add(fx, step(.9, 1500), tn, db(-32), .3)
# P6: a shimmer that rises with each layer that lights; it runs over the cut (L-cut)
add(fx, shimmer(2.6, 1100), X - .05, db(-28), 0); add(fx, shimmer(3.2, 700), X + .4, db(-31), 0)
# P7: knees on the ground, cloth; the beam sweeps
add(fx, thump(.5, 90), shot['S7'] + .05, db(-32), .1); add(fx, paper(.5), shot['S7'] + .2, db(-38), .1); add(fx, whoosh(1.0), H['faraon'] - .1, db(-32), -.3)
# P8: steps of two men on stone, the staff touches the floor once
for tn in (shot['S8'] + .1, shot['S8'] + .4, shot['S8'] + .7): add(fx, step(.7, 2500), tn, db(-36), -.3)
add(fx, step(1, 3500), shot['S8'] + 1.1, db(-30), -.2)
# P9: many steps in sand
for tn in np.arange(shot['S9'] + .05, S2a - .15, .17): add(fx, step(.6, 700), tn + rng.random() * .05, db(-36), rng.uniform(-.5, .5))
# P10: the staff set on rock; P11: a bell for each layer of the valley that lights, far to near
add(fx, step(1, 3000), S2b + .3, db(-32), .1)
for j in range(4): add(fx, bell(1567 * 2 ** (j * 4 / 12), 1.1), H['tierra'] + .1 + j * .3, db(-36), -.2 + j * .12)
# P12: Clawd's little steps as he turns
for tn in (H['pregunta'] - .25, H['pregunta'] - .05): add(fx, step(.5), tn, db(-38), -.1)

# ——— the two silences: music, ambience and foley out; only a very faint room tone ———
def hole(a, b, fo=.25, fi=.03): return env_lin([(0, 1), (a - fo, 1), (a + .02, 0), (b - fi, 0), (b, 1), (DUR + 1, 1)])
gate = hole(S1a, S1b) * hole(S2a, S2b)
music *= gate[:, None]
fx *= gate[:, None]
room = lp(noise(DUR + 1), 300)[:N] * db(-72)

# ——— voice ———
vo = np.zeros(N)
for i, l in L.items():
    w, sr = sf.read(os.path.join(HERE, 'voices', i + '.wav'), dtype='float32')
    if w.ndim > 1: w = w.mean(1)
    w = soxr.resample(w, sr, SR); s = int(l['at'] * SR); vo[s:s + len(w)] += w[:N - s]
vo = hp(vo, 80)
def comp(x, thr_db=-24, ratio=3.):
    ee = np.sqrt(uniform_filter1d(x ** 2, int(.02 * SR)) + 1e-12); ed = 20 * np.log10(ee)
    gdb = np.where(ed > thr_db, (thr_db - ed) * (1 - 1 / ratio), 0); gdb = uniform_filter1d(gdb, int(.01 * SR)); return x * db(gdb)
vo = comp(vo); act = np.abs(vo) > 1e-4; vo *= db(-18) / rms(vo[act])
music *= db(-24) / rms(music[np.abs(music).sum(1) > 1e-5])
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-6 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
mix = (music + fx * db(-1) + vo[:, None]) * db(1.7) + room[:, None]   # about -14 LUFS after the limiter
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
def win_db(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x))
print('mix done', DUR, 'instruments', sorted({q['inst'] for q in ev}))
for nm, a, b in [('silence 1', S1a + .1, S1b - .03), ('silence 2', S2a + .1, S2b - .03)]:
    v = win_db(a, b); print(f'{nm}: {a:.2f}-{b:.2f} s  {v:.1f} dBFS', 'OK' if v < -55 else 'TOO LOUD')
print('credits:'); print(S.credits(sorted({q['inst'] for q in ev})))
