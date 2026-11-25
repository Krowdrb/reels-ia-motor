"""Jacob en cifras (7, 7 y 20): original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
A minor (Aeolian) that grows toward the Jabbok and opens to A MAJOR on «Israel». Music box (glockenspiel), plucked zither (dan tranh),
felt piano (upright), soft strings, reed flute; a hand drum only in the struggle; one timpani stroke ('A2') and a small gong on «Israel».
Motif: a seven-note lullaby E–A–B–C–B–A–E (Jacob's love): music box in the first seven (one note per pebble), zither an octave lower in
the second seven, gone in the night of the Jabbok, back in A major (C#) at the end. Two real silences (music, ambience and foley all
out): after «…su otra hija» (before «Al amanecer… era Lea») and after «…si no me bendices» (before the new name). Checked (< -50 dB)."""
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
S.seed(29); rng = np.random.default_rng(7)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
S1a, S1b = H['silencio1'], H['lea']        # silence 1: end of «…su otra hija» -> «Al amanecer… era Lea»
S2a, S2b = H['silencio2'], H['l13']        # silence 2: end of «…si no me bendices» -> «Tu nombre ya no será Jacob…»
X = H['israel']
MOT_MIN = ['E5', 'A5', 'B5', 'C6', 'B5', 'A5', 'E5']
MOT_MAJ = ['E5', 'A5', 'B5', 'C#6', 'B5', 'A5', 'E5']
oct_down = lambda ns: [p[:-1] + str(int(p[-1]) - 1) for p in ns]
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))

# ——— P1 the well at dusk: low A pedal, sparse zither; the music box leaves three notes of the motif and stops ———
for p, v, i, pan in [('A1', .18, 'contrabass', 0), ('A2', .17, 'cellos', -.2), ('E3', .12, 'violas', .2)]: n(.05, i, p, shot['S3'] + .3, v, pan, attack=1.0, release=.8)
for tn, p in [(.3, 'A3'), (1.1, 'E4'), (1.9, 'C4'), (H['l02'], 'B3'), (H['l02'] + .9, 'E3'), (H['velo'] + .2, 'F3')]: n(tn, 'dan_tranh', p, 2.2, .3, -.25)
for j, p in enumerate(MOT_MIN[:3]): n(1.4 + j * .55, 'glockenspiel', p, 1.4, .26, .25)
# ——— P2 seven years: the music box plays the whole motif, one note on each pebble ———
t0, per = H['l03'] - .15, 2.35 / 7
land = [t0 + (i + .62) * per for i in range(7)]
for tl, p in zip(land, MOT_MIN): n(tl, 'glockenspiel', p, 1.4, .32, .2)
for j, p in enumerate(['A2', 'E3', 'A3', 'C4']): n(shot['S2'] + j * .6, 'dan_tranh', p, 1.6, .2, -.2)
# ——— P3 the wedding: zither and flute in a slow, far dance; all of it gone before silence 1 ———
a = shot['S3']
for j in range(6): n(a + .1 + j * .36, 'dan_tranh', ['A3', 'E4', 'C4', 'E4', 'B3', 'E4'][j], .9, .24 - j * .015, -.3)
fl = [('E5', .35), ('D5', .35), ('C5', .7), ('B4', .35), ('C5', .35), ('A4', .9)]
for j, (p, d) in enumerate(fl): n(a + .3 + sum(q[1] for q in fl[:j]), 'flute', p, d, .2 - j * .015, .25, attack=.06)
for p, v, i in [('A2', .14, 'cellos'), ('E3', .1, 'violas')]: n(a, i, p, S1a - a - .05, v, 0, attack=.3, release=.2)
# ——— P4 «era Lea»: the voice first; then one low note of felt piano, no chord ———
n(H['l05'] + 1.2, 'upright', 'A2', 2.4, .32, 0)
n(H['l05'] + 1.25, 'upright', 'A1', 2.4, .18, 0)
# ——— P5 another seven: the zither says the motif an octave lower, one note on each pebble; slow pizzicato ———
for i, p in enumerate(oct_down(MOT_MIN)): n(H['l07'] + .05 + i * .22, 'dan_tranh', p, 1.4, .34, -.1)
for j in range(8): n(shot['S5'] + .3 + j * .62, 'cellos_pizz', ['A2', 'E3', 'C3', 'E3'][j % 4], .6, .26, .2)
for p, v, i in [('A2', .16, 'cellos'), ('E3', .13, 'violas'), ('C4', .1, 'violins')]: n(shot['S5'], i, p, shot['S6'] - shot['S5'] + .3, v, 0, attack=1.0, release=.4)
n(H['catorce'], 'glockenspiel', 'A5', 1.8, .26, .1); n(H['catorce'] + .02, 'glockenspiel', 'E5', 1.8, .2, -.1)
# ——— P6 twenty: the motif breaks off halfway; only the low string remains ———
a = shot['S6']
for j, p in enumerate(MOT_MIN[:4]): n(a + .1 + j * .2, 'dan_tranh', p, .8, .3, -.1)
for p, v, i in [('A1', .2, 'contrabass'), ('A2', .16, 'cellos')]: n(a, i, p, shot['S7'] - a + 1.0, v, 0, attack=.3, release=.8)
# ——— P7 the Jabbok at night: a very low pedal only ———
a = shot['S7']
for p, v, i in [('A2', .14, 'violas'), ('E2', .14, 'cellos'), ('A1', .14, 'contrabass')]: n(a, i, p, S2a - a, v, 0, attack=1.2, release=.15)
# ——— P8–P9 the struggle: hand drum strokes like a pulse that quickens; violin tremolo low; all cut dead at silence 2 ———
a = shot['S8']; ts = a + .15
while ts < S2a - .12: n(ts, 'frame_drum', 'large', 1.0, .26 + .2 * (ts - a) / (S2a - a), 0); ts += .62 - .3 * (ts - a) / (S2a - a)
for p, v in [('E3', .12), ('A3', .1)]: n(a + .2, 'violins_trem', p, S2a - a - .2, v, .1, attack=1.4, release=.1)
n(shot['S9'], 'cellos', 'C3', S2a - shot['S9'], .12, 0, attack=.6, release=.1)
# ——— P10 «…sino Israel»: after the silence the voice first; a rising string note; on «Israel» timpani (A2) + small gong,
# harp / music box / piano / strings open the motif in A MAJOR ———
a = S2b
for p, v, i in [('E3', .14, 'violas'), ('A3', .12, 'violins')]: n(a + .25, i, p, X - a - .2, v, 0, attack=1.4, release=.3)
n(H['nombre'] + .5, 'violins', 'C#4', X - H['nombre'] - .4, .12, .1, attack=.8, release=.2)
n(X, 'timpani', 'A2', 3.0, .55, 0)
n(X + .02, 'gong2', 'small', 3.0, .4, 0)
for j, p in enumerate(['A2', 'C#3', 'E3', 'A3', 'C#4', 'E4', 'A4', 'C#5', 'E5', 'A5']): n(X - .2 + j * .045, 'harp', p, 2.8, .36, -.2 + j * .04)
for p, v, i, pan in [('A1', .36, 'contrabass', 0), ('A2', .38, 'cellos', -.25), ('E3', .36, 'violas', -.1), ('A3', .36, 'violas', .1), ('C#4', .36, 'violins', .2), ('E4', .34, 'violins', .3), ('A4', .3, 'violins', .25)]:
    n(X + .02, i, p, DUR - X, v, pan, attack=.35, release=1.4)
for j, p in enumerate(MOT_MAJ): n(X + .4 + j * .38, 'glockenspiel', p, 1.6, .24, .2)
for j, p in enumerate(['A3', 'C#4', 'E4']): n(X + .3 + j * .02, 'upright', p, 3.0, .26 - j * .02, -.1)
# ——— P11 limping, blessed: sustained A major, the reed flute in long notes ———
a = shot['S11']
for j, (p, d) in enumerate([('E5', 1.1), ('C#5', .8), ('A4', 1.4)]): n(a + .4 + [0, 1.1, 1.9][j], 'flute', p, d, .2, .2, attack=.12)
# ——— P12 the end: the whole motif in the music box in A major, piano under it; the zither closes alone ———
a = H['leccion'] + .1
for j, p in enumerate(MOT_MAJ): n(a + j * .42, 'glockenspiel', p, 1.6, .3, .2)
for j, p in enumerate(['A2', 'E3', 'A3', 'C#4']): n(a + j * .84, 'upright', p, 2.0, .22, -.15)
for j, p in enumerate(['E4', 'C#4', 'B3', 'A3']): n(H['pregunta'] + 1.0 + j * .5, 'dan_tranh', p, 2.0, .28 - j * .03, -.2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the score grows toward the Jabbok and the name: quiet at the well, fuller in the struggle, full on «Israel»
music *= env_lin([(0, .8), (shot['S5'], .85), (shot['S7'], .9), (S2a, 1.1), (X - .3, 1.05), (X, 1.3), (shot['S12'], 1.1), (DUR + 1, 1.0)])[:, None]

# ——— foley and ambience ———
fx = np.zeros((N, 2))
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def step(v=1., f=900): d = .09; return norm(lp(noise(d), f) * env_exp(d, .02)) * v
def stone(f=2600): d = .07; x = t_(d); return norm(bp(noise(d), f * .6, f * 1.6) * env_exp(d, .012) + .5 * np.sin(2 * np.pi * f * x) * env_exp(d, .01))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def chirp(): d = .16; x = t_(d); f = 3200 + 1600 * np.sin(np.pi * x / d); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)
def cricket(): d = .12; x = t_(d); return norm(np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 60 * x) > 0) * np.sin(np.pi * x / d))
def bleat(): d = .5; x = t_(d); f = 420 + 40 * np.sin(2 * np.pi * 22 * x); return norm(lp(np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(4 * np.pi * np.cumsum(f) / SR), 1800) * np.sin(np.pi * x / d))
def pour(d=.8): x = t_(d); return norm(bp(noise(d), 500, 3500) * (.6 + .4 * np.sin(2 * np.pi * 13 * x)) * np.sin(np.pi * x / d))
def splash(): d = .35; return norm(bp(noise(d), 300, 3000) * env_exp(d, .08))
# field breeze (Haran), the feast murmur (no words), night water + crickets (Jabbok), morning river + birds
breeze = bp(noise(DUR + 1), 300, 1800)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 3.7))
add(fx, breeze * env_lin([(0, .6), (shot['S3'] - .2, .6), (shot['S3'] + .3, 0), (shot['S5'] - .3, 0), (shot['S5'], .7), (shot['S7'], .6), (shot['S7'] + .4, 0), (DUR + 1, 0)]) * db(-33), 0, 1, .1)
murmur = bp(brown(DUR + 1), 250, 1200)[:N] * (.5 + .5 * np.abs(np.sin(2 * np.pi * tt * 1.7) * np.sin(2 * np.pi * tt * .63)))
add(fx, murmur * env_lin([(0, 0), (shot['S3'] - .6, 0), (shot['S3'], .7), (S1a - .9, .7), (S1a - .2, 0), (DUR + 1, 0)]) * db(-34), 0, 1, -.2)
water = lp(noise(DUR + 1), 1200)[:N] * (.7 + .3 * np.sin(2 * np.pi * tt * .9))
add(fx, water * env_lin([(0, 0), (shot['S7'] - .3, 0), (shot['S7'], .5), (S2a, .7), (S2b + .4, .4), (shot['S11'], .5), (DUR + 1, .5)]) * db(-36), 0, 1, .2)
for tn in np.arange(shot['S7'] + .2, S2a - .3, .7): add(fx, cricket(), tn + rng.random() * .3, db(-44), rng.uniform(-.6, .6))
for tn in np.arange(.5, shot['S3'] - .4, 1.3): add(fx, cricket(), tn + rng.random() * .4, db(-48), rng.uniform(-.6, .6))
for tn, pan in [(H['l05'] + .2, .4), (H['l05'] + .55, .4), (S2b + .8, -.4), (S2b + 1.2, .3), (shot['S11'] + .5, .3), (shot['S11'] + .72, .3), (shot['S12'] + 1.0, -.4), (H['leccion'] + 1.2, .4), (H['pregunta'] + 1.5, -.3)]: add(fx, chirp(), tn, db(-38), pan)
for tn, pan in [(1.0, -.5), (3.4, .5), (shot['S5'] + .4, -.4), (shot['S5'] + 2.5, .4)]: add(fx, bleat(), tn, db(-42), pan)
# P1: water from the jar, the title strip, the veil
add(fx, pour(.9), .6, db(-38), .35); add(fx, paper(.6), .3, db(-36), -.1); add(fx, paper(.9), H['velo'] - .3, db(-34), .35)
# P2, P5, P6: a pebble on stone for each one placed; the last six quick, then into the bag
for tl in land: add(fx, stone(2600 + rng.integers(-300, 300)), tl, db(-28), .1)
for i in range(7): add(fx, stone(2400 + rng.integers(-300, 300)), H['l07'] + .05 + i * .22, db(-29), .1)
for i in range(6): add(fx, stone(2800 + rng.integers(-300, 300)), H['l09'] + .06 + i * .1, db(-30), .1)
add(fx, pour(.5), H['l09'] + .78, db(-32), .15); add(fx, thump(.5, 140), H['l09'] + 1.25, db(-34), .15)
for tn in np.arange(shot['S6'] + .1, shot['S7'] + .5, .26): add(fx, step(.5, 500), tn, db(-38 - (tn - shot['S6']) * 2), .3)
# P3: the cloth of the door
add(fx, paper(.8), H['l04'] + 1.2, db(-36), .2)
# P4: the veil lifting (a long paper rustle), the arm falling
add(fx, paper(1.0), H['l05'] + .7, db(-33), .05); add(fx, whoosh(.5), H['l05'] + .9, db(-40), -.3)
# P7: the caravan splashing across and away; Clawd sits
for j, tn in enumerate(np.arange(shot['S7'] + .3, H['l11'] - .4, .38)): add(fx, splash(), tn, db(-36 - j * 1.2), -.2 - j * .08)
add(fx, thump(.4, 110), H['l10'] + 1.1, db(-38), -.4)
# P8–P9: gravel under the feet with each push; the knee in the gravel
for tn in np.arange(shot['S8'] + .2, S2a - .2, 2.33): add(fx, step(.8, 1200), tn, db(-34), -.05); add(fx, step(.6, 1200), tn + .12, db(-36), .05)
add(fx, thump(.7, 90), H['l12'] + .45, db(-30), 0); add(fx, step(1, 1400), H['l12'] + .47, db(-32), 0)
# P10: a rising paper rustle and a shimmer for each sheet of night that lifts; the shine runs over the cut (L-cut)
for i in range(4): add(fx, paper(.9), H['nombre'] + i * .4, db(-35), -.15 + i * .1); add(fx, shimmer(1.2, 1200 + i * 250), H['nombre'] + i * .4 + .1, db(-36), 0)
add(fx, shimmer(3.0, 900), X - .05, db(-29), 0)
# P11: uneven steps in wet gravel (one firm, one softer)
for j, tn in enumerate(np.arange(shot['S11'] + .1, H['l15'] + .8, .49)): add(fx, step(1. if j % 2 == 0 else .45, 1000), tn, db(-33), .1)
# P12: the twenty pebbles fall to the heap (a short cascade); Clawd's little steps as he turns
pr = H['l16'] - .35
for i in range(20): add(fx, stone(2200 + rng.integers(-500, 500)), pr + .05 + i * .05 + .24, db(-31 - (i % 3)), .15)
for tn in (H['pregunta'] - .3, H['pregunta'] - .1): add(fx, step(.5), tn, db(-38), -.1)

# ——— the two silences: music, ambience and foley out; only a very faint room tone ———
def hole(a, b, fo=.22, fi=.03): return env_lin([(0, 1), (a - fo, 1), (a + .02, 0), (b - fi, 0), (b, 1), (DUR + 1, 1)])
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
    v = win_db(a, b); print(f'{nm}: {a:.2f}-{b:.2f} s  {v:.1f} dBFS', 'OK' if v < -50 else 'TOO LOUD')
print('credits:'); print(S.credits(sorted({q['inst'] for q in ev})))
