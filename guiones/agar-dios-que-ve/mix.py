"""Agar: el Dios que me ve — original score (harp, strings, flute, clarinet, glass, hand chimes, celesta = glockenspiel, horn) + foley + narration
from timeline.json -> out/mix.wav. E aeolian until silence 2, E major from «oyó»; the music grows to the climax (S11). Both silences are real.
Run with the library's .venv python after tools/timeline.py."""
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
S.seed(16); rng = np.random.default_rng(21)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
SIL1 = (H['sil1'] + .05, H['agar2'] - .05)     # after «…ángel del Señor» -> «Agar»
SIL2 = (H['sil2'] + .05, H['l11'] - .05)       # after «No quiero ver morir al niño» -> «Pero Dios oyó»
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))

# ——— night (S1–S3): contrabass pedal on E, Agar's motif on the low flute (E–G–F#–B), clarinet, a little harp ———
n(.05, 'contrabass', 'E2', SIL1[0] - .3, .26, 0, attack=1.0, release=.25)
for j, (p, d) in enumerate([('E4', .9), ('G4', .9), ('F#4', .9), ('B3', 1.8)]): n(.35 + j * .95, 'flute', p, d, .3, .15, attack=.08)
for tn, p in [(3.9, 'B3'), (4.8, 'G3')]: n(tn, 'clarinet', p, 1.6, .26, -.2, attack=.2, release=.5)
for tn, p in [(1.2, 'E3'), (2.9, 'B3'), (4.3, 'E4'), (shot['S2'], 'G3'), (shot['S2'] + .9, 'D4')]: n(tn, 'harp', p, 2.2, .26, -.25)
n(shot['S2'], 'clarinet', 'E3', 1.9, .28, -.1, attack=.3, release=.5)
for j, p in enumerate(['B3', 'A3', 'G3', 'F#3']): n(shot['S3'] + j * .6, 'cellos', p, .7, .26, .1, attack=.12, release=.3)
# ——— the call (S4–S5): glass after the silence, harp arpeggio ———
a = H['agar2'] + .05
n(a, 'glass', 'B4', shot['S6'] - a + .3, .3, 0, attack=.9, release=.8)
for j, p in enumerate(['E3', 'B3', 'E4', 'G4', 'E3', 'B3', 'E4', 'G4']): n(shot['S5'] + j * .38, 'harp', p, 1.6, .26, -.15)
n(shot['S5'], 'contrabass', 'E2', shot['S7'] - shot['S5'], .2, 0, attack=1.2, release=.6)
# ——— the name (S6): the motif again, ending as a question on F#; violas with the dawn ———
for j, (p, d) in enumerate([('E4', .5), ('G4', .5), ('F#4', .5), ('B4', .5), ('F#4', 1.2)]): n(shot['S6'] + .1 + j * .5, 'flute', p, d, .32, .15, attack=.06)
for p in ['E3', 'B3']: n(H['ve'] - .3, 'violas', p, shot['S7'] - H['ve'] + .8, .24, 0, attack=.8, release=.5)
# ——— years (S7): the only clear pulse: harp quavers + clarinet ———
a, b = shot['S7'], shot['S8']; tc = a; k = 0
CH = [['E3', 'B3', 'E4', 'G4'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'A3', 'D4', 'F#4'], ['B2', 'F#3', 'B3', 'D4']]
while tc < b - .1: ch = CH[int((tc - a) // 1.6) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]], .9, .28, -.2); tc += .4; k += 1
for j, (p, d) in enumerate([('G3', 1.2), ('A3', .8), ('B3', 1.2)]): n(a + .2 + j * 1.05, 'clarinet', p, d, .26, .2, attack=.1, release=.3)
# ——— burnt (S8): thin, one dry high cello ———
n(shot['S8'] + .05, 'cellos', 'B3', shot['S9'] - shot['S8'] + .2, .22, 0, attack=.4, release=.3)
# ——— a bowshot (S9): clarinet and contrabass on low E, falling, unresolved ———
a = shot['S9']
n(a, 'contrabass', 'E2', SIL2[0] - a - .3, .26, 0, attack=.8, release=.25)
for j, (p, d) in enumerate([('B3', 1.0), ('A3', 1.0), ('G3', 1.0), ('F#3', 1.0)]): n(a + .1 + j * 1.0, 'clarinet', p, d * .95, .26, -.1, attack=.15, release=.3)
# ——— heard (S10): E major, one harp note alone with the voice, then glass and violas ———
n(H['l11'] + .02, 'harp', 'E3', 3.0, .34, 0)
n(H['oyo'] + .2, 'glass', 'G#4', shot['S11'] - H['oyo'] + .6, .26, 0, attack=.7, release=.6)
for p in ['E3', 'B3', 'G#3']: n(H['oyo'] + .3, 'violas', p, shot['S11'] - H['oyo'] + .2, .22, 0, attack=1.0, release=.4)
for p, i in [('E2', 'contrabass'), ('B2', 'cellos')]: n(H['oyo'] + .3, i, p, H['pozo'] - H['oyo'], .22, 0, attack=1.2, release=.3)
# ——— the climax (S11): on «ojos» hand chimes climb one note per layer, harp glissando; on «pozo» the full E major opens ———
O, P = H['ojos'], H['pozo']
for j, p in enumerate(['E5', 'G#5', 'B5', 'E6', 'G#5', 'B5']): n(O + .1 + j * .3, 'hand_chimes', p, 2.0, .34, -.3 + j * .12)
for j, p in enumerate(['E3', 'G#3', 'B3', 'E4', 'G#4', 'B4', 'E5', 'G#5', 'B5']): n(O - .1 + j * .045, 'harp', p, 2.0, .36, .1)
for p, v, i in [('B3', .3, 'violas'), ('E4', .3, 'violins'), ('G#4', .3, 'violins')]: n(O + .2, i, p, P - O, v, 0, attack=.9, release=.1)
for p, v, i, pan in [('E2', .42, 'contrabass', 0), ('E3', .42, 'cellos', -.3), ('B3', .4, 'violas', -.1), ('E4', .4, 'violas', .1), ('G#4', .4, 'violins', .2), ('B4', .4, 'violins', .3), ('E5', .36, 'violins', .25)]:
    n(P, i, p, 3.6, v, pan, attack=.08, release=1.8)
for p in ['E3', 'B3', 'G#3']: n(P + .05, 'horn', p, 3.2, .32, 0, attack=.3, release=1.4)
n(P, 'timpani', 'D3', 2.0, .3, 0)
for j, p in enumerate(['E6', 'B5', 'G#5']): n(P + .03 + j * .02, 'glockenspiel', p, 2.4, .3, .2)   # the celesta voice = glockenspiel
# ——— gold and close (S12): the motif resolved in E major on the flute; low strings; harp alone under the question ———
a = shot['S12'] + .4
for j, (p, d) in enumerate([('E4', .6), ('G#4', .6), ('F#4', .6), ('B4', .6), ('G#4', .8), ('E4', 1.6)]): n(a + j * .62, 'flute', p, d, .3, .15, attack=.06)
for p, v, i in [('E2', .2, 'contrabass'), ('E3', .2, 'cellos'), ('B3', .18, 'violas'), ('G#3', .16, 'violas')]: n(a - .3, i, p, H['cta'] - a + .6, v, 0, attack=1.2, release=1.0)
for j, p in enumerate(['E3', 'B3', 'E4', 'G#4', 'B4']): n(H['cta'] + j * .4, 'harp', p, 2.4, .28, -.1 + j * .06)
n(H['diossi'] + .1, 'glockenspiel', 'E6', 2.4, .24, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.24); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the music grows toward the climax: quieter in the night, full in S11
grow = env_lin([(0, .75), (shot['S7'], .85), (shot['S9'], .8), (H['oyo'], .9), (H['pozo'], 1.15), (H['pozo'] + 2.5, 1.0), (DUR + 1, .95)])
music *= grow[:, None]

# ——— foley ———
fx = np.zeros((N, 2))
def bed(src, pts, g, pan=0.): add(fx, src[:N] * env_lin(pts), 0, db(g), pan)
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def sand_step(v=1.): d = .16; return norm(bp(noise(d), 300, 2600) * np.sin(np.pi * t_(d) / d) ** 2) * v
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def drop(v=1.): d = .16; x = t_(d); return norm(np.sin(2 * np.pi * (700 + 1500 * x / d) * x) * env_exp(d, .025)) * v
def bird(): d = .32; x = t_(d); return norm(np.sin(2 * np.pi * (3200 + 600 * np.sin(x * 60)) * x) * np.sin(np.pi * x / d) ** 2)
def cloth(d=.5): return norm(bp(noise(d), 600, 4000) * np.sin(np.pi * t_(d) / d) ** 2)
wind = bp(noise(DUR + 1), 200, 1500)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
bed(wind, [(0, .8), (shot['S3'], .8), (SIL1[0] - .4, 0), (H['agar2'], 0), (shot['S8'], 0), (shot['S8'] + .2, .9), (shot['S9'] + 1.5, .7), (SIL2[0] - .3, 0), (shot['S12'], 0), (shot['S12'] + .6, .4), (DUR + 1, .4)], -32, .1)
fire = bp(noise(DUR + 1), 900, 5000)[:N] * (rng.random(N) < .002).astype(float) * 6 + bp(brown(DUR + 1), 100, 500)[:N] * .3
bed(fire, [(0, 0), (shot['S2'] - .1, 0), (shot['S2'] + .1, 1), (shot['S3'] + .5, .4), (shot['S3'] + 1.2, 0), (DUR + 1, 0)], -34, -.2)   # L-cut over S3
water = bp(noise(DUR + 1), 1500, 6000)[:N] * (.5 + .5 * np.abs(np.sin(2 * np.pi * tt * 3.1) * np.sin(2 * np.pi * tt * 1.7)))
bed(water, [(0, 0), (shot['S3'] - .45, 0), (shot['S3'] - .1, .6), (SIL1[0] - .4, .6), (SIL1[0], 0), (SIL1[1], 0), (H['agar2'] + .4, .35), (shot['S6'] + 1, .2), (shot['S7'], 0), (DUR + 1, 0)], -36, .2)   # J-cut into S3
well = bp(noise(DUR + 1), 400, 3000)[:N] * (.5 + .5 * np.abs(np.sin(2 * np.pi * tt * 5.3)))
bed(well, [(0, 0), (H['pozo'] - .02, 0), (H['pozo'] + .1, 1), (H['pozo'] + 2, .5), (DUR + 1, .35)], -31, 0)
for j in range(3): add(fx, bird(), shot['S7'] - .5 + j * .9, db(-40), .3 - j * .2)   # J-cut into S7
for j in range(3): add(fx, bird(), shot['S12'] + 1.5 + j * 1.7, db(-42), -.3 + j * .25)
for tn in np.arange(.2, shot['S2'], .55): add(fx, sand_step(), tn, db(-36), .2)
for tn in np.arange(.45, shot['S2'], .4): add(fx, sand_step(.6), tn, db(-40), -.1)
add(fx, paper(.6), .3, db(-36), .2)
add(fx, cloth(.6), shot['S2'] + .3, db(-34), -.2)
add(fx, shimmer(1.4, 1500), H['agar2'] - .02, db(-36), 0)
for j in range(3): add(fx, shimmer(.6, 1800 + j * 300), H['agar2'] + .25 + j * .4, db(-40), -.2 + j * .2)
add(fx, cloth(.5), shot['S5'] + .2, db(-36), .1)
add(fx, cloth(.4), H['despidio'] - .2, db(-32), .2)
add(fx, drop(), H['gota'] + .6, db(-24), .1)
add(fx, cloth(.5), H['nover'] + .05, db(-36), .2)
add(fx, shimmer(1.6, 1100), H['oyo'] - .2, db(-33), 0)
for j in range(2): add(fx, paper(.7), H['ojos'] - .1 + j * .12, db(-28), [-.3, .3][j])
add(fx, whoosh(1.0), H['ojos'], db(-30), 0); add(fx, thump(.3), H['pozo'], db(-24), 0)
add(fx, paper(.15), H['cta'] + .05, db(-36), -.2)

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
mix = music + fx * db(-1)
# the two silences: music and foley (with their reverb tails) are gated to nothing; the voice is already silent there
gate = env_lin([(0, 1), (SIL1[0] - .35, 1), (SIL1[0], 0), (SIL1[1], 0), (SIL1[1] + .02, 1), (SIL2[0] - .35, 1), (SIL2[0], 0), (SIL2[1], 0), (SIL2[1] + .02, 1), (DUR + 1, 1)])
mix = mix * gate[:, None] + vo[:, None]
# loudness to about -14 LUFS (approximation: high-passed, gated mean square over 400 ms blocks), then a peak limiter
kw = np.stack([hp(mix[:, c], 60) for c in (0, 1)], 1); blk = int(.4 * SR)
pw = np.array([np.mean(kw[i:i + blk] ** 2) for i in range(0, len(kw) - blk, blk // 4)])
pw = pw[10 * np.log10(pw + 1e-12) > -70]; lufs = -0.691 + 10 * np.log10(np.mean(pw) * 2)
mix *= db(-14 - lufs)
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
out = mix[:int(DUR * SR)].astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), out, SR)
def lvl(a, b): x = out[int(a * SR):int(b * SR)]; return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print('mix done', DUR, 's  loudness approx', round(lufs, 1), '-> -14')
print('silence 1 %.2f–%.2f: %.1f dB' % (*SIL1, lvl(*SIL1)), '| silence 2 %.2f–%.2f: %.1f dB' % (*SIL2, lvl(*SIL2)))
for a in np.arange(0, DUR - 1, 2.0): print('  %5.1f–%5.1f s: %6.1f dB' % (a, a + 2, lvl(a, a + 2)))
print('instruments', sorted({e['inst'] for e in ev}))
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
