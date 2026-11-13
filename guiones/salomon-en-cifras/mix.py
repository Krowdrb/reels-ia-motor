"""Salomón en cifras: original score (harp, strings, flute, celesta, horn, frame drum) + foley + narration from timeline.json -> out/mix.wav.
Two real silences (< -40 dB) before the turns. Run with the library's .venv python."""
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
S.seed(11); rng = np.random.default_rng(5)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
S1_, S2_ = H['s1'], H['s2']                       # ends of l08 and l12: the two silences start here
Q1 = (S1_ + .12, H['giro'] - .06)                 # silence 1 (music, foley and voice all out)
Q2 = (S2_ + .12, H['l13'] - .06)                  # silence 2
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
B = 60 / 72                                        # one beat at 72 BPM; the bar of 4 is 3.33 s

# ——— night in the scroll room: a low drone and a sparse harp, D minor ———
n(.05, 'contrabass', 'D2', shot['S2'] + .8, .22, 0, attack=1.2, release=1.0)
n(.05, 'cellos', 'A2', shot['S2'] + .8, .18, -.2, attack=1.4, release=1.0)
for tn, p in [(.35, 'D4'), (1.4, 'F4'), (2.3, 'A4'), (H['l01b'] + .05, 'C5'), (H['l01b'] + .9, 'Bb4'), (4.4, 'A4')]: n(tn, 'harp', p, 2.4, .3, -.25)
# ——— Gibeon, the dream: harp arpeggio over Dm - Bb - Gm - A; celesta enters on "pide" with a suspended chord ———
CH = [['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['G2', 'D3', 'G3', 'Bb3'], ['A2', 'E3', 'A3', 'C#4']]
a, b = shot['S2'], shot['S4']; k = 0; tc = a
while tc < b - .1:
    ch = CH[int((tc - a) // (B * 4)) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]], 1.2, .28, -.2); tc += B / 2; k += 1
n(a, 'contrabass', 'D2', b - a + .3, .2, 0, attack=.8, release=.8); n(a, 'violas', 'A3', b - a + .3, .14, .2, attack=1.5, release=.8)
for j, p in enumerate(['D6', 'G6', 'A6', 'D7']): n(H['pide'] + j * .09, 'celesta', p, 2.4, .3, .15)
for p, i in [('D4', 'violins'), ('G4', 'violins'), ('A3', 'violas')]: n(H['pide'], i, p, b - H['pide'] + .2, .2, .1, attack=.9, release=.5)
# ——— the petition: the suspension resolves (F major), the horn comes in softly; then C → leading to the gold ———
a = shot['S4']; m = H['l05']
for p, i, v in [('F2', 'contrabass', .26), ('F3', 'cellos', .26), ('C4', 'violas', .22), ('A4', 'violins', .22), ('F5', 'violins', .16)]: n(a, i, p, m - a + .3, v, 0, attack=.6, release=.6)
n(a + .3, 'french_horn', 'F3', m - a, .22, -.1, attack=.4, release=.8); n(a + .3, 'french_horn', 'C4', m - a, .2, .1, attack=.4, release=.8)
for j, p in enumerate(['F3', 'C4', 'F4', 'A4', 'C5', 'F5']): n(a + .05 + j * .06, 'harp', p, 2.2, .32, -.1)
for p, i, v in [('C3', 'contrabass', .24), ('C3', 'cellos', .24), ('G3', 'violas', .22), ('E4', 'violins', .22)]: n(m, i, p, shot['S5'] - m + .3, v, 0, attack=.5, release=.4)
n(m + .1, 'french_horn', 'E4', shot['S5'] - m, .2, 0, attack=.5, release=.5)
for tn, p in [(m + .2, 'G4'), (m + .6, 'C5'), (m + 1.0, 'E5')]: n(tn, 'harp', p, 1.6, .3, .2)
# ——— the gold: D major, harp arpeggios, horn roots, flute line, frame-drum strokes ever closer (14.25 → silence 1) ———
GOLD = [['D3', 'A3', 'D4', 'F#4'], ['G2', 'D3', 'G3', 'B3'], ['B2', 'F#3', 'B3', 'D4'], ['A2', 'E3', 'A3', 'C#4']]
a, b = shot['S5'], S1_ + .05; k = 0; tc = a
while tc < b - .05:
    bar = int((tc - a) // (B * 2)); ch = GOLD[bar % 4]; grow = (tc - a) / (b - a)
    n(tc, 'harp', ch[[0, 1, 2, 3][k % 4]] if grow < .45 else ch[[0, 2, 1, 3, 2, 3][k % 6]], 1.0, .28 + .12 * grow, -.2 + .1 * (k % 3)); tc += B / 2 if grow < .45 else B / 3; k += 1
for j in range(int((b - a) // (B * 2)) + 1):
    t0 = a + j * B * 2; ch = GOLD[j % 4]; d = min(B * 2, b - t0) + .15; g = j / max(1, (b - a) / (B * 2))
    if d <= .2: continue
    n(t0, 'contrabass', ch[0][:-1] + '2' if ch[0][-1] == '3' else ch[0], d, .24 + .1 * g, 0, attack=.15, release=.25)
    n(t0, 'cellos', ch[1], d, .22 + .1 * g, -.2, attack=.2, release=.25)
    n(t0, 'french_horn', ch[2], d, .18 + .12 * g, .15, attack=.25, release=.3)
    if t0 > shot['S6'] - .2: n(t0, 'violins', ch[3][:-1] + str(int(ch[3][-1]) + 1), d, .18 + .14 * g, .25, attack=.2, release=.3)
FL = [('A4', 1), ('B4', .5), ('C#5', .5), ('D5', 1.5), ('E5', .5), ('F#5', 1), ('E5', .5), ('D5', .5), ('E5', 1), ('F#5', .5), ('G5', .5), ('A5', 2)]
tf = a + B * .5
for p, bb in FL:
    if tf + bb * B > b - .1: break
    n(tf, 'flute', p, bb * B * .95, .3, .25, attack=.06); tf += bb * B
td = a + B
while td < b - .1:
    g = (td - a) / (b - a); n(td, 'frame_drum', 'large' if g < .6 else ('small' if int(td / B) % 2 else 'large'), None, .3 + .25 * g, -.05)
    td += B * 2 if g < .35 else (B if g < .7 else B / 2)
# ——— the fall: after silence 1, a low drum, a falling drone, sparse harp, no horn ———
g0 = H['giro']
n(g0, 'timpani', 'D3', 2.0, .42, 0); n(g0, 'gong', None, None, .18, 0)
for (t0, t1), p in zip([(g0, g0 + 4.6), (g0 + 4.6, g0 + 8.6), (g0 + 8.6, shot['S10'] + .2)], ['D2', 'C2', 'Bb1']):
    n(t0, 'contrabass', p, t1 - t0 + .3, .26, 0, attack=.7, release=.6)
for (t0, t1), ps in zip([(g0, g0 + 4.6), (g0 + 4.6, g0 + 8.6), (g0 + 8.6, shot['S10'] + .2)], [['D3', 'F3'], ['C3', 'Eb3'], ['Bb2', 'D3']]):
    for p in ps: n(t0, 'cellos', p, t1 - t0 + .3, .18, -.15, attack=1.0, release=.6)
    n(t0, 'violas', ps[1][:-1] + '4', t1 - t0 + .3, .12, .2, attack=1.2, release=.6)
for tn, p in [(g0 + .8, 'A4'), (g0 + 2.5, 'F4'), (g0 + 4.2, 'E4'), (g0 + 5.9, 'D4'), (g0 + 7.4, 'C4'), (g0 + 9.0, 'Bb3'), (H['altares'] + .3, 'A3'), (H['altares'] + 1.9, 'D4')]: n(tn, 'harp', p, 2.4, .26, -.25)
# ——— the lamp: only the drone, dying out into silence 2 ———
n(shot['S10'], 'contrabass', 'D2', S2_ - shot['S10'] - .1, .22, 0, attack=.3, release=.15)
n(shot['S10'], 'cellos', 'A2', S2_ - shot['S10'] - .1, .14, 0, attack=.3, release=.15)
# ——— the climax: celesta alone on the scroll, strings rising to "guarda tu corazón", full D major ———
c0, X = H['l13'], H['guarda']
n(c0 + .1, 'celesta', 'A6', 2.6, .32, .1); n(c0 + .55, 'celesta', 'D7', 2.4, .28, .15)
for p, i, v in [('D3', 'cellos', .22), ('A3', 'violas', .2), ('D4', 'violas', .18), ('F#4', 'violins', .2)]: n(c0 + .3, i, p, X - c0 - .2, v, 0, attack=1.2, release=.3)
for p, v, i, pan in [('D2', .42, 'contrabass', 0), ('D3', .42, 'cellos', -.3), ('A3', .4, 'violas', -.1), ('D4', .4, 'violas', .1), ('F#4', .42, 'violins', .2), ('A4', .42, 'violins', .3), ('D5', .4, 'violins', .25)]:
    n(X, i, p, 4.0, v, pan, attack=.12, release=1.8)
for p, v in [('A3', .36), ('D4', .34), ('F#4', .3)]: n(X + .05, 'french_horn', p, 3.6, v, 0, attack=.4, release=1.5)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(X - .36 + j * .04, 'harp', p, 2.2, .42, .15)
for j, p in enumerate(['D6', 'F#6', 'A6']): n(X + .1 + j * .12, 'celesta', p, 2.6, .3, .2)
FL2 = [('A5', 1), ('F#5', .5), ('G5', .5), ('A5', 1.5), ('D5', 2)]
tf = X + 1.2
for p, bb in FL2: n(tf, 'flute', p, bb * B * .95, .28, .2, attack=.08); tf += bb * B
for p, v, i in [('D3', .2, 'cellos'), ('A3', .18, 'violas'), ('F#4', .16, 'violins')]: n(X + 3.6, i, p, shot['S12'] - X - 3.2, v, 0, attack=.8, release=1.0)
# ——— dawn: harp alone, an open resolution; nothing on top of the last question ———
a = shot['S12'] + .3
for j, p in enumerate(['D3', 'A3', 'D4', 'E4', 'A4', 'D5']): n(a + j * .16, 'harp', p, 3.4, .3, -.2 + j * .08)
for p, v, i in [('D2', .14, 'contrabass'), ('A3', .12, 'violas'), ('E4', .1, 'violins')]: n(a, i, p, DUR - a, v, 0, attack=1.6, release=1.4)
for tn, p in [(H['l15'] + .1, 'F#4'), (H['l15'] + .8, 'A4'), (H['pregunta'] + 2.0, 'D4'), (H['pregunta'] + 2.25, 'A4'), (H['pregunta'] + 2.5, 'D5')]: n(tn, 'harp', p, 2.4, .26, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.6, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

# ——— foley (all synthesised) ———
fx = np.zeros((N, 2))
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def crackle(d, dens=18, f0=2500):
    x = np.zeros(int(d * SR)); k = rng.random(len(x)) < dens / SR; x[k] = rng.standard_normal(k.sum()) * (.4 + rng.random(k.sum()))
    return norm(bp(np.convolve(x, np.exp(-np.arange(int(.004 * SR)) / (.0008 * SR)), 'same'), f0 * .4, f0 * 2.5))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def chisel(v=1.):
    d = .12; x = t_(d); return norm(hp(noise(d), 2000) * env_exp(d, .006) + np.sin(2 * np.pi * 3100 * x) * env_exp(d, .015) * .6 + lp(noise(d), 400) * env_exp(d, .02) * .4) * v
def tick(v=1.):
    d = .05; x = t_(d); return norm(np.sin(2 * np.pi * 2600 * x) * env_exp(d, .006) + hp(noise(d), 3000) * env_exp(d, .002) * .5) * v
def chirp(v=1.):
    d = .16; x = t_(d); f = 3200 + 1800 * np.sin(np.pi * x / d); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2) * v
def puff(d=.35): return norm(lp(noise(d), 900) * np.sin(np.pi * t_(d) / d) ** 2 * np.exp(-t_(d) / .12))
# room tone (stone room) under the library shots: very low, and it keeps the silences "alive" well under -40 dB
room = lp(brown(DUR + 1), 260)[:N]
add(fx, room * env_lin([(0, 1), (shot['S2'] + .3, 1), (shot['S2'] + .8, 0), (shot['S10'] - .2, 0), (shot['S10'] + .4, 1), (DUR + 1, 1)]) * db(-44), 0, 1, 0)
wind = bp(noise(DUR + 1), 220, 1400)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.7))
add(fx, wind * env_lin([(0, .25), (shot['S2'] - .2, .25), (shot['S2'] + .4, .45), (shot['S4'], .6), (shot['S5'] - .2, .6), (shot['S5'] + .3, 0), (shot['S8'] - .1, 0), (shot['S8'] + .6, .8), (shot['S9'], .9), (H['apaga'] + 1.2, .7), (H['apaga'] + 2.2, 0), (shot['S12'] - .2, 0), (shot['S12'] + .6, .5), (DUR + 1, .5)]) * db(-33), 0, 1, .15)
cr = bp(noise(DUR + 1), 4200, 6200)[:N] * (np.sin(2 * np.pi * 26 * tt) > .6) * (np.sin(2 * np.pi * .55 * tt) > -.2)
add(fx, cr * env_lin([(0, 0), (shot['S2'] - .2, 0), (shot['S2'] + .3, 1), (shot['S4'], .8), (shot['S4'] + .8, 0), (DUR + 1, 0)]) * db(-41), 0, 1, -.3)
fireb = crackle(DUR + 1, 22)[:N]
add(fx, fireb * env_lin([(0, .35), (shot['S2'] - .3, .35), (shot['S2'], 1), (shot['S4'], .6), (shot['S4'] + .5, 0), (shot['S9'], 0), (shot['S9'] + .4, .7), (shot['S10'], .6), (shot['S10'] + .3, .35), (S2_ - .3, .35), (S2_ - .25, 0), (DUR + 1, 0)]) * db(-36), 0, 1, .2)
city = bp(brown(DUR + 1), 200, 1200)[:N]
add(fx, city * env_lin([(0, 0), (shot['S5'] + 2.5, 0), (shot['S6'], .8), (S1_, .6), (S1_ + .1, 0), (DUR + 1, 0)]) * db(-38), 0, 1, 0)
# events
add(fx, paper(.7), .6, db(-30), .1); add(fx, paper(.4), H['l01b'] - .1, db(-36), .1)
add(fx, shimmer(1.6, 1300), H['pide'] - .3, db(-33), 0)
add(fx, thump(1, 60), shot['S4'] + .15, db(-34), -.1); add(fx, paper(.5) * .6, shot['S4'] + .2, db(-38), -.1)
for j in range(3): add(fx, paper(.35), shot['S5'] + .4 + j * .9, db(-35), [-.3, .2, 0][j])
for j, tn in enumerate(np.arange(shot['S6'] - .45, shot['S7'], .33)): add(fx, chisel(), tn + rng.random() * .05, db(-33 if j % 3 else -30), .25 - .1 * (j % 4))   # the chisel comes in before the cut (J-cut)
add(fx, lp(noise(.6), 300) * env_exp(.6, .18), shot['S6'] + .8, db(-30), -.1)
for j in range(12):
    on = H['l08'] + .05 + j * .13; add(fx, tick(), on, db(-36), -.3 + .05 * j)
add(fx, shimmer(1.2, 1800), H['l08'] + .1, db(-37), .2)
for tn in [H['altares'] + .4, H['l10b'] + 1.2, H['l10b'] + 2.3]: add(fx, puff(.45), tn, db(-33), .1)
add(fx, whoosh(.8), H['altares'] + 1.0, db(-38), 0)
out = S2_ - .25
add(fx, crackle(.9, 60, 3000), out - .9, db(-34), .2); add(fx, puff(.3), out, db(-30), .2)
add(fx, paper(.8), H['l13'] + .15, db(-31), 0)
for j in range(3): add(fx, paper(.6), H['guarda'] + j * .25, db(-33), [-.4, .4, 0][j])
add(fx, whoosh(1.2), H['guarda'] - .1, db(-31), 0); add(fx, shimmer(2.2, 900), H['guarda'], db(-30), 0)
for tn, pan in [(shot['S12'] + .9, .4), (shot['S12'] + 1.25, .35), (H['l15'] + .4, -.3), (H['l15'] + .6, -.35)]: add(fx, chirp(), tn, db(-38), pan)

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
arc = env_lin([(0, .8), (shot['S5'], .9), (S1_, 1.15), (H['giro'], .85), (H['guarda'] - .6, 1.0), (H['guarda'], 1.6), (H['guarda'] + 3.5, 1.35), (shot['S12'], .9), (DUR + 1, .85)])   # the score grows to the climax
music *= arc[:, None]
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-6 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
# the two silences: music and foley drop out completely (fast fade), only the room tone stays, far under -40 dB
gate = env_lin([(0, 1), (Q1[0] - .1, 1), (Q1[0], 0), (Q1[1], 0), (Q1[1] + .02, 1), (Q2[0] - .15, 1), (Q2[0], 0), (Q2[1], 0), (Q2[1] + .02, 1), (DUR + 1, 1)])
bed = np.stack([lp(brown(DUR + 1), 200)[:N]] * 2, 1) * db(-58)
mix = (music + fx * db(-1)) * gate[:, None] + vo[:, None] + bed * (1 - gate[:, None])
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
mix = mix[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
def seg_db(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x))
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print('silence 1 %.2f–%.2f: %.1f dB | silence 2 %.2f–%.2f: %.1f dB | whole: %.1f dB' % (Q1[0], Q1[1], seg_db(*Q1), Q2[0], Q2[1], seg_db(*Q2), seg_db(0, DUR)))
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
