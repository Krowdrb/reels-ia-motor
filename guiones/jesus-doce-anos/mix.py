"""Perdido tres días (Lucas 2:41–52): original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
D minor (the search) that opens into D major on «Padre» (timpani 'D3'); two real silences: after l06 and after l11."""
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
S.seed(12); rng = np.random.default_rng(12)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
S1a, S1b = H['silencio1'], H['l07']     # silence 1
S2a, S2b = H['silencio2'], H['l12']     # silence 2
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))

# ——— the caravan (S1–S2): a plucked zither on the walking pulse, a pedal, the five-note flute phrase (it comes back in major at the end) ———
beat = .52; tc = .05; k = 0
pat = ['D3', 'A3', 'D4', 'A3', 'F3', 'A3', 'E4', 'A3']
while tc < shot['S3'] - .2:
    n(tc, 'dan_tranh', pat[k % 8], .9, .34 if k % 4 == 0 else .24, -.25); tc += beat; k += 1
n(.05, 'contrabass', 'D2', shot['S3'] + .2, .2, 0, attack=1.0, release=1.0)
n(.05, 'cellos', 'A2', shot['S3'] + .2, .14, .2, attack=1.4, release=1.0)
for j, (p, d) in enumerate([('D5', .5), ('F5', .5), ('E5', .5), ('D5', .5), ('A4', 1.6)]): n(H['l03'] + .1 + j * .52, 'flute', p, d * .95, .3, .2, attack=.06)
n(H['tresdias'] + .15, 'glockenspiel', 'A6', 2.0, .22, .3)   # the single lit window
# ——— the camp (S3–S4): sparse harp, low pedal, one soft bell for each tent door ———
a = shot['S3']
for tn, p in [(a + .1, 'D3'), (a + .6, 'A3'), (a + 1.2, 'F4'), (H['l06'] + .1, 'E4'), (H['l06'] + .8, 'D4')]: n(tn, 'harp', p, 2.2, .3, -.2)
n(a, 'contrabass', 'D2', S1a - a + .05, .22, 0, attack=.6, release=.05)
n(a, 'cellos', 'D3', S1a - a + .05, .16, 0, attack=.9, release=.05)
for i in range(5): n(H['tiendas'] - .25 + i * .3, 'glockenspiel', ['A5', 'D6', 'F5', 'A5', 'E6'][i], 1.4, .16, -.3 + i * .15)
# ——— back to Jerusalem (S5): a frame-drum stroke with the voice, faster zither and flute, three harp arpeggios (three days) ———
b = S1b
n(b, 'frame_drum', 'large', 1.0, .7, 0)
tc = b + .02; k = 0
while tc < shot['S6'] - .1:
    n(tc, 'dan_tranh', ['D3', 'A3', 'D4', 'F4'][k % 4], .6, .26, -.2); tc += .26; k += 1
for i in range(3):
    t0 = b + .25 + i * .62
    for j, p in enumerate(['D3', 'A3', 'D4', 'F4', 'A4']): n(t0 + j * .07, 'harp', p, 1.4, .3, .1)
n(H['templo'] + .1, 'flute', 'A5', 1.4, .26, .2, attack=.1)
n(b, 'contrabass', 'D2', shot['S6'] - b + .3, .18, 0, attack=.3, release=.6)
# ——— the temple (S6–S8): celesta and violas; the zither falls silent; cellos in D minor when his mother speaks ———
a = shot['S6']
for tn, p in [(a + .1, 'D5'), (a + .9, 'F5'), (a + 1.7, 'A5'), (H['maravilla'] + .1, 'D6'), (H['maravilla'] + .8, 'C6'), (H['maravilla'] + 1.4, 'A5')]: n(tn, 'glockenspiel', p, 2.2, .2, .2)
for p, v in [('D4', .18), ('F4', .16), ('A4', .15)]: n(a, 'violas', p, shot['S8'] - a + .3, v, 0, attack=1.0, release=.5)
a = shot['S8']
for p, v, i in [('D2', .22, 'contrabass'), ('D3', .24, 'cellos'), ('A3', .2, 'cellos'), ('F4', .16, 'violas')]: n(a, i, p, S2a - a + .02, v, 0, attack=.8, release=.05)
n(H['hijo'] - .1, 'harp', 'A3', 2.0, .26, -.2); n(H['l11'] + .1, 'harp', 'D3', 1.5, .24, -.2)
# ——— the answer (S9): after silence 2 the voice first; strings rise as the doors open; on «Padre» timpani D3, harp glissando, D major ———
a = H['l12'] + .9; X = H['padre']
for p, v, i in [('D3', .2, 'cellos'), ('A3', .18, 'violas'), ('D4', .18, 'violas'), ('F4', .17, 'violins'), ('A4', .17, 'violins_trem')]: n(a, i, p, X - a + .05, v, 0, attack=1.6, release=.15)
n(H['puertas'] + .3, 'contrabass', 'A1', X - H['puertas'] - .25, .2, 0, attack=.8, release=.1)
n(X, 'timpani', 'D3', 2.5, .62, 0); n(X + .9, 'timpani', 'D3', 2.0, .35, 0)
for j, p in enumerate(['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(X - .36 + j * .04, 'harp', p, 2.4, .4, -.3 + j * .06)
for p, v, i, pan in [('D2', .38, 'contrabass', 0), ('D3', .4, 'cellos', -.3), ('A3', .38, 'violas', -.1), ('D4', .38, 'violas', .1), ('F#4', .38, 'violins', .2), ('A4', .38, 'violins', .3), ('D5', .36, 'violins', .25)]:
    n(X, i, p, shot['S10'] - X + 1.0, v, pan, attack=.08, release=1.6)
for p, v in [('A3', .3), ('D4', .28)]: n(X + .05, 'horn', p, 2.6, v, 0, attack=.4, release=1.4)
n(X + .3, 'glockenspiel', 'D7', 2.4, .2, .3)
# ——— they did not understand, he went down with them (S10–S11): low held strings, then the harp alone, then the zither again ———
a = shot['S10'] + .4
for p, v, i in [('D3', .18, 'cellos'), ('A3', .15, 'violas'), ('F#4', .13, 'violins')]: n(a, i, p, shot['S11'] - a + 1.2, v, 0, attack=.8, release=1.0)
a = shot['S11'] + .2
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5']): n(a + j * .14, 'harp', p, 2.6, .32, -.2 + j * .08)
tc = H['obedece'] + .4; k = 0
while tc < DUR - 1.5:
    n(tc, 'dan_tranh', ['D3', 'A3', 'D4', 'A3', 'F#3', 'A3', 'E4', 'A3'][k % 8], .9, .22 if k % 4 else .3, -.25); tc += beat; k += 1
# ——— the end (S12): harp and flute, the opening phrase now in D major ———
a = shot['S12'] + .3
for p, v, i in [('D3', .16, 'cellos'), ('A3', .14, 'violas'), ('F#4', .12, 'violins')]: n(a, i, p, DUR - a, v, 0, attack=1.4, release=1.2)
for j, (p, d) in enumerate([('D5', .5), ('F#5', .5), ('E5', .5), ('D5', .5), ('A4', 1.8)]): n(H['leccion'] + .2 + j * .52, 'flute', p, d * .95, .28, .2, attack=.06)
for j, p in enumerate(['A4', 'F#4', 'D4']): n(H['pregunta'] + j * .5, 'harp', p, 2.4, .3, .25)
n(H['pregunta'] + 1.6, 'glockenspiel', 'D6', 2.4, .2, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.5, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the two silences: everything goes to zero (after the reverb, so no tail is left)
quiet = env_lin([(0, 1), (S1a - .12, 1), (S1a + .05, 0), (S1b - .03, 0), (S1b, 1), (S2a - .12, 1), (S2a + .05, 0), (S2b - .03, 0), (S2b, 1), (DUR + 1, 1)])
music *= quiet[:, None]

# ——— foley ———
fx = np.zeros((N, 2))
def stepf(v=1.): d = .09; return norm(bp(noise(d), 300, 2400) * np.minimum(1, t_(d) / .004) * np.exp(-t_(d) / .025)) * v
def paperc(v=1.): d = .07; return norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .012)) * v
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .35 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def cricket(d):
    x = t_(d); return np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 28 * x) > .2) * (np.sin(2 * np.pi * .9 * x + rng.random() * 6) > -.2)
def bird(d=.5):
    x = t_(d); f = 2600 + 900 * np.sin(2 * np.pi * 7 * x); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)
wind = bp(noise(DUR + 1), 250, 1600)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
add(fx, wind * env_lin([(0, .7), (shot['S3'] - .3, .7), (shot['S3'] + .3, .35), (S1a, .3), (S1a + .1, 0), (S1b, 0), (S1b + .2, .8), (shot['S6'], .8), (shot['S6'] + .4, 0), (shot['S11'] - .3, 0), (shot['S11'] + .3, .45), (DUR + 1, .45)]) * db(-31), 0, 1, .15)
murmur = lp(bp(brown(DUR + 1), 180, 900), 700)[:N] * (.7 + .3 * np.sin(2 * np.pi * tt / 2.7))
add(fx, murmur * env_lin([(0, .5), (shot['S3'], .4), (shot['S3'] + .3, 0), (shot['S6'] + .3, 0), (shot['S6'] + .8, .45), (H['maravilla'], .45), (H['maravilla'] + .6, .9), (H['maravilla'] + 1.8, .4), (shot['S8'] + .5, .25), (S2a - .2, .2), (S2a, 0), (DUR + 1, 0)]) * db(-33), 0, 1, -.1)
crick = sum(cricket(DUR + 1)[:N] * w for w in (1, .6))
add(fx, bp(crick, 3000, 6000) * env_lin([(0, 0), (shot['S3'] - .4, 0), (shot['S3'] + .2, .8), (H['l06'], .6), (S1a - .1, .2), (S1a + .05, 0), (DUR + 1, 0)]) * db(-40), 0, 1, .2)
room = lp(brown(DUR + 1), 300)[:N]
add(fx, room * env_lin([(0, 0), (shot['S6'], 0), (shot['S6'] + .3, .5), (S2a - .15, .5), (S2a, 0), (S2b, 0), (S2b + .2, .4), (X - .2, .4), (X + .2, 0), (DUR + 1, 0)]) * db(-36), 0, 1, 0)
# steps: the caravan, the camp, the road back, the temple stairs, the way down, Clawd's last steps
for bt in np.arange(.1, shot['S3'] - .1, .26): add(fx, stepf(.6 + .4 * rng.random()), bt, db(-35), rng.uniform(-.4, .4))
for bt in np.arange(shot['S3'] + .4, H['l06'] + .5, .5): add(fx, stepf(.6), bt, db(-38), .1)
for bt in np.arange(S1b + .05, shot['S6'] - .1, .2): add(fx, stepf(.8), bt, db(-33), rng.uniform(-.3, .3))
add(fx, thump(.5, 60), H['templo'] + .25, db(-30), .2)   # the wooden gate
for i in range(9): add(fx, paperc(.8), shot['S6'] + .1 + i * .3 + .17, db(-33), -.2)   # Clawd's paper hops up the steps
for bt in np.arange(shot['S8'] - .2, H['hijo'] - .3, .42): add(fx, stepf(.7), bt, db(-34), -.3)
for i in range(3): add(fx, paperc(1.), H['puertas'] + .15 + i * .2 + .05, db(-27), [-.3, .3, 0][i]); add(fx, shimmer(.9, 1700 + 300 * i), H['puertas'] + .2 + i * .2, db(-36), 0)
add(fx, shimmer(2.6, 900), X - .3, db(-28), 0)
add(fx, lp(noise(.6), 1500) * np.sin(np.pi * t_(.6) / .6) ** 2, shot['S10'] + .3, db(-38), .1)   # cloth: María's hand to her chest
for bt in np.arange(shot['S11'] + .1, shot['S12'] - .2, .3): add(fx, stepf(.7), bt, db(-35), .1)
for tn in [shot['S11'] + .5, shot['S12'] + 1.4, H['pregunta'] - 1.2]: add(fx, bird(.5), tn, db(-39), .35)
for bt in np.arange(shot['S12'], shot['S12'] + 1.2, .3): add(fx, stepf(.5), bt, db(-37), -.1)
add(fx, paperc(.6), H['pregunta'] - .25, db(-34), 0)
fx *= quiet[:, None]

# ——— voice ———
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
# the climax swells over the voice a little: it must still grow on «Padre»
music *= db(3 * env_lin([(0, 0), (X - .1, 0), (X + .2, 1), (shot['S10'] + .8, 1), (shot['S11'] + .5, 0), (DUR + 1, 0)]))[:, None]
mix = music + fx * db(-1) + vo[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
def seg_db(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x))
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print(f'silence 1 {S1a + .15:.2f}-{S1b - .1:.2f}: {seg_db(S1a + .15, S1b - .1):.1f} dB   silence 2 {S2a + .15:.2f}-{S2b - .1:.2f}: {seg_db(S2a + .15, S2b - .1):.1f} dB')
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
