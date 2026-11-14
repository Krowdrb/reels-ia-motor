"""5 datos de la Biblia: original score (harp, strings, reed flute, celesta = glockenspiel, horn, frame drum, timpani, gong) + synthesised foley
+ narration from timeline.json -> out/mix.wav at about -14 LUFS (mux.sh normalises it again on the final film).
The score grows from a lone harp at the scribe's lamp to the climax on «¡Lázaro, ven fuera!». Two real silences (< -45 dB): after l13 and after l16.
Run with the library's .venv python."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
from scipy.signal import lfilter
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
S.seed(5); rng = np.random.default_rng(9)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
Q1 = (H['silencio1'] + .1, H['l14'] - .06)        # silence 1: after «…en muchas Biblias», before «Aquí, en Betania: Jesús lloró»
Q2 = (H['silencio2'] + .1, H['clama'] - .06)      # silence 2: after «Quitaron la piedra de la tumba», before «Luego clamó»
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
B = 60 / 66                                        # one beat at 66 BPM

# ——— the scribe's lamp: low drone from second 0 and a sparse harp, D minor ———
n(.05, 'contrabass', 'D2', shot['S2'] + .6, .2, 0, attack=1.0, release=.9)
n(.05, 'cellos', 'A2', shot['S2'] + .6, .15, -.2, attack=1.3, release=.9)
for tn, p in [(.25, 'D4'), (1.2, 'F4'), (2.1, 'A4'), (H['pregunta'] + .05, 'C5'), (H['pregunta'] + .6, 'Bb4')]: n(tn, 'harp', p, 2.4, .3, -.25)
# ——— 1.500 years: the harp arpeggio walks; a frame drum on «mil quinientos» ———
CH = [['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['C3', 'G3', 'C4', 'E4'], ['A2', 'E3', 'A3', 'C#4']]
a, b = shot['S2'], shot['S3']; k = 0; tc = a
while tc < b + .2:
    ch = CH[int((tc - a) // (B * 2)) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1][k % 6]], 1.2, .3, -.2 + .08 * (k % 3)); tc += B / 3; k += 1
n(H['anos'] + .25, 'frame_drum', 'large', None, .45, 0)
n(a, 'contrabass', 'D2', b - a + .4, .18, 0, attack=.5, release=.6)
# ——— Hebrew: the harp alone, still ———
for tn, p in [(shot['S3'] + .1, 'A4'), (H['hebreo'], 'D5'), (H['hebreo'] + .6, 'C5')]: n(tn, 'harp', p, 2.2, .3, .1)
# ——— Babylon: the deepest drone, a small gong on «arameo» ———
a, b = shot['S4'], shot['S5']
n(a, 'contrabass', 'A1', b - a + .5, .24, 0, attack=.4, release=.6); n(a, 'cellos', 'E2', b - a + .5, .16, -.2, attack=.6, release=.6)
n(H['arameo'] + .05, 'gong2', 'small', None, .32, .1)
for tn, p in [(a + .3, 'A3'), (a + 1.0, 'Bb3'), (a + 1.7, 'A3')]: n(tn, 'harp', p, 1.8, .26, -.2)
# ——— Galilee: the reed flute comes in ———
a, b = shot['S5'], shot['S6']
n(a, 'contrabass', 'D2', b - a + .5, .18, 0, attack=.6, release=.6); n(a, 'violas', 'A3', b - a + .5, .12, .2, attack=.9, release=.6)
tf = a + .2
for p, bb in [('A4', 1), ('C5', .5), ('D5', 1.5), ('E5', .5), ('D5', 1)]:
    n(tf, 'flute', p, bb * B * .95, .3, .2, attack=.08); tf += bb * B
# ——— the text is divided: celesta notes closer and closer; chapters low, verses high ———
a, b = shot['S6'], shot['S7']
n(a, 'cellos', 'D3', b - a + .3, .16, -.15, attack=.8, release=.5); n(a, 'contrabass', 'D2', b - a + .3, .16, 0, attack=.8, release=.5)
CEL = ['D5', 'F5', 'A5', 'C6', 'D6', 'A5', 'F5', 'E5']
tc, k = a + .3, 0
while tc < b - .1:
    g = (tc - a) / (b - a); n(tc, 'celesta', CEL[k % 8], 1.2, .2 + .12 * g, .15 - .1 * (k % 3)); tc += B * (1.0 if g < .4 else (.5 if g < .75 else .33)); k += 1
for tn, p in [(H['capitulos'], 'D3'), (H['capitulos'] + 1.0, 'A3'), (H['versiculos'], 'F4'), (H['versiculos'] + .5, 'A4'), (H['versiculos'] + 1.0, 'D5')]: n(tn, 'harp', p, 1.8, .3, -.2)
# ——— Psalm 119: harp, celesta and horn rise to «ciento setenta y seis» ———
a, X = shot['S7'], H['s176']
for p, i, v in [('D2', 'contrabass', .2), ('D3', 'cellos', .2), ('A3', 'violas', .16)]: n(a, i, p, X - a + .3, v, 0, attack=1.2, release=.4)
k, tc = 0, a + .2
while tc < X - .1:
    g = (tc - a) / (X - a); n(tc, 'harp', ['D3', 'A3', 'D4', 'F4', 'A4', 'D5'][k % 6], 1.0, .24 + .14 * g, -.2); tc += B / 2 if g < .5 else B / 3; k += 1
for p, i, v, pan in [('D2', 'contrabass', .3, 0), ('F3', 'cellos', .3, -.2), ('A3', 'violas', .28, .1), ('D4', 'violins', .28, .2), ('F4', 'violins', .26, .25)]: n(X, i, p, H['s117'] - X + .2, v, pan, attack=.15, release=.6)
n(X + .05, 'french_horn', 'A3', H['s117'] - X, .3, -.1, attack=.3, release=.8); n(X + .05, 'french_horn', 'D4', H['s117'] - X, .26, .1, attack=.3, release=.8)
for j, p in enumerate(['D4', 'F4', 'A4', 'D5', 'F5', 'A5']): n(X + .02 + j * .05, 'celesta', p, 2.0, .3, .15)
# ——— Psalm 117: everything falls to one music-box note on «solo dos» ———
n(H['s117'], 'contrabass', 'D2', H['dos'] - H['s117'] + .3, .14, 0, attack=.3, release=.4)
n(H['dos'] + .05, 'celesta', 'A5', 2.8, .32, .1)
# l13: only a very low drone, which dies before silence 1
n(H['l13'] - .1, 'contrabass', 'D2', Q1[0] - H['l13'] - .1, .14, 0, attack=.6, release=.15)
# ——— Bethany: low drone and the reed flute alone in long notes; nothing on «Jesús lloró» but the drone ———
a = H['l14'] - .05
n(a, 'contrabass', 'D2', Q2[0] - a - .2, .16, 0, attack=.8, release=.15); n(a, 'cellos', 'A2', Q2[0] - a - .2, .1, -.2, attack=1.2, release=.15)
for tn, p, d in [(a + .1, 'F4', 1.4), (H['lloro'] + 1.1, 'E4', 1.6), (H['piedra'] + .2, 'D4', 1.5)]: n(tn, 'flute', p, d, .22, .2, attack=.25)
n(H['piedra'] + .15, 'timpani', 'D3', 2.0, .28, 0)
# ——— the climax: a frame drum under «ven fuera», then celesta, harp, horn and strings up to «salió» ———
c0, Lz, X = H['clama'], H['lazaro'], H['salio']
n(c0 + .1, 'cellos', 'D3', Lz - c0, .14, 0, attack=.5, release=.3)
n(Lz + .05, 'frame_drum', 'large', None, .55, 0); n(Lz + .05, 'timpani', 'D3', 2.2, .4, 0)
for p, i, v in [('D3', 'cellos', .24), ('A3', 'violas', .22), ('D4', 'violas', .2), ('F#4', 'violins', .22)]: n(Lz + .1, i, p, X - Lz + .1, v, 0, attack=.7, release=.3)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5']): n(Lz + .2 + j * .18, 'harp', p, 1.8, .34, .1)
for p, v, i, pan in [('D2', .44, 'contrabass', 0), ('D3', .44, 'cellos', -.3), ('A3', .42, 'violas', -.1), ('D4', .42, 'violas', .1), ('F#4', .44, 'violins', .2), ('A4', .44, 'violins', .3), ('D5', .42, 'violins', .25)]:
    n(X, i, p, 4.0, v, pan, attack=.12, release=1.8)
for p, v in [('A3', .38), ('D4', .36), ('F#4', .32)]: n(X + .05, 'french_horn', p, 3.6, v, 0, attack=.35, release=1.5)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(X - .34 + j * .04, 'harp', p, 2.2, .44, .15)
for j, p in enumerate(['D6', 'F#6', 'A6']): n(X + .1 + j * .12, 'celesta', p, 2.6, .32, .2)
n(X, 'frame_drum', 'large', None, .5, 0)
# ——— dawn in Bethany: the harp alone, an open D major that carries over the cut (L-cut); nothing on top of «escribe AMÉN» ———
a = shot['S12'] - .3
for j, p in enumerate(['D3', 'A3', 'D4', 'E4', 'A4', 'D5']): n(a + j * .16, 'harp', p, 3.4, .3, -.2 + j * .08)
for p, v, i in [('D2', .14, 'contrabass'), ('A3', .12, 'violas'), ('F#4', .1, 'violins')]: n(a, i, p, DUR - a, v, 0, attack=1.6, release=1.4)
for tn, p in [(H['l20'] + .1, 'F#4'), (H['l20'] + .8, 'A4'), (H['amen'] + 2.6, 'D4'), (H['amen'] + 2.85, 'A4'), (H['amen'] + 3.1, 'D5')]: n(tn, 'harp', p, 2.4, .26, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.6, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

# ——— foley (all synthesised) ———
fx = np.zeros((N, 2))
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def scratch(d=1.2):   # reed pen on papyrus: short bursts of filtered noise
    x = bp(noise(d), 2500, 8000) * (np.sin(2 * np.pi * 5.5 * t_(d)) > .1) * np.sin(np.pi * t_(d) / d); return norm(x)
def tick(f=2600, v=1.):
    d = .06; x = t_(d); return norm(np.sin(2 * np.pi * f * x) * env_exp(d, .008) + hp(noise(d), 3000) * env_exp(d, .002) * .4) * v
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def crackle(d, dens=18, f0=2500):
    x = np.zeros(int(d * SR)); k = rng.random(len(x)) < dens / SR; x[k] = rng.standard_normal(k.sum()) * (.4 + rng.random(k.sum()))
    return norm(bp(np.convolve(x, np.exp(-np.arange(int(.004 * SR)) / (.0008 * SR)), 'same'), f0 * .4, f0 * 2.5))
def chirp(v=1.):
    d = .16; x = t_(d); f = 3200 + 1800 * np.sin(np.pi * x / d); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2) * v
def roll(d=1.6):      # the stone: a long low rumble with grit
    x = t_(d); return norm(lp(brown(d), 160) * np.sin(np.pi * x / d) ** .7 + bp(noise(d), 300, 1200) * .25 * np.sin(np.pi * x / d))
def bleat(v=1.):
    d = .5; x = t_(d); f = 420 + 40 * np.sin(2 * np.pi * 7 * x); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)); return norm(bp(s, 500, 2500) * np.sin(np.pi * x / d) ** 2) * v
room = lp(brown(DUR + 1), 260)[:N]
add(fx, room * env_lin([(0, 1), (shot['S4'], 1), (shot['S4'] + .4, 0), (shot['S6'], 0), (shot['S6'] + .4, .8), (shot['S9'], .8), (shot['S9'] + .3, 0), (DUR + 1, 0)]) * db(-44), 0, 1, 0)
wind = bp(noise(DUR + 1), 220, 1400)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.7))
add(fx, wind * env_lin([(0, .25), (shot['S2'] - .2, .25), (shot['S2'] + .3, .7), (shot['S3'], .3), (shot['S3'] + .3, .2), (shot['S9'] - .1, .2), (shot['S9'] + .5, .8), (H['silencio2'], .7), (H['silencio2'] + .05, 0), (H['lazaro'], 0), (H['lazaro'] + 1.5, .6), (DUR + 1, .5)]) * db(-33), 0, 1, .15)
sea = bp(brown(DUR + 1), 80, 900)[:N] * (.55 + .45 * np.sin(2 * np.pi * tt / 3.1) ** 2)
add(fx, sea * env_lin([(0, 0), (shot['S5'] - .7, 0), (shot['S5'] - .1, .9), (shot['S6'] - .2, .9), (shot['S6'] + .3, 0), (DUR + 1, 0)]) * db(-28), 0, 1, 0)   # the waves come in before the cut (J-cut)
fireb = crackle(DUR + 1, 22)[:N]
add(fx, fireb * env_lin([(0, .25), (shot['S2'], .25), (shot['S2'] + .2, 0), (shot['S3'], 0), (shot['S3'] + .2, .3), (shot['S4'], .9), (shot['S5'], .8), (shot['S5'] + .4, 0), (DUR + 1, 0)]) * db(-37), 0, 1, .2)
# events
for j, tn in enumerate([.5, .95, 1.4, 1.85, 2.35]): add(fx, tick(2000 + 250 * j, .8), tn, db(-36 - j), -.2 + .1 * j); add(fx, shimmer(.8, 1700 + 200 * j), tn, db(-42), 0)
add(fx, scratch(1.4), .3, db(-34), .2); add(fx, scratch(1.6), shot['S3'] + .1, db(-29), .15)
for tn in [shot['S2'] + .3, shot['S2'] + .9]: add(fx, bleat(), tn, db(-40), -.4)
for tn in np.arange(shot['S2'] + .1, shot['S3'], .35): add(fx, thump(.06), tn, db(-38), -.1)
add(fx, bp(noise(.6), 2000, 6000) * np.sin(np.pi * t_(.6) / .6) ** 2, shot['S4'] + .6, db(-40), -.2)   # cloth of the wise men
add(fx, lp(noise(.9), 900) * np.sin(np.pi * t_(.9) / .9) ** 2, shot['S5'] + .8, db(-32), .2)        # the net out of the water
add(fx, bp(noise(1.0), 400, 3000) * np.sin(np.pi * t_(1.) / 1.) ** 2, shot['S5'] + .5, db(-31), -.2)  # the wave at Clawd's feet
add(fx, paper(.9), shot['S6'] + .1, db(-30), 0)
for j in range(6): add(fx, tick(1500, .9), H['capitulos'] + .1 + j * .2, db(-35), -.3 + .12 * j)
for j in range(12): add(fx, tick(3300, .7), H['versiculos'] + .1 + j * .11, db(-38), -.3 + .05 * j)
add(fx, paper(1.6), shot['S7'] + .3, db(-31), 0); add(fx, shimmer(1.8, 1200), H['s176'], db(-33), 0)
add(fx, paper(.3), shot['S8'] + .3, db(-34), .1)
add(fx, roll(1.6), H['piedra'] + .1, db(-22), .3)
add(fx, lp(noise(.3), 500) * np.sin(np.pi * t_(.3) / .3), H['l14'] + .3, db(-38), -.2)   # knees on the earth
for j in range(3): add(fx, paper(.5), H['lazaro'] + .1 + j * .25, db(-31), [-.4, .4, 0][j])
add(fx, whoosh(1.2), H['lazaro'] - .05, db(-30), 0); add(fx, shimmer(2.4, 900), H['salio'] - .2, db(-29), 0)
for tn, pan in [(shot['S12'] + .7, .4), (shot['S12'] + 1.05, .35), (H['l20'] + .3, -.3), (H['l20'] + .5, -.35)]: add(fx, chirp(), tn, db(-38), pan)

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
arc = env_lin([(0, .75), (shot['S5'], .85), (H['s176'], 1.15), (H['dos'], .8), (Q1[0], .7), (H['clama'], .8), (H['lazaro'], 1.15), (H['salio'], 1.6), (H['salio'] + 3, 1.3), (shot['S12'], .9), (DUR + 1, .85)])   # the score grows to the climax
music *= arc[:, None]
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-6 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
# the two silences: music and foley drop out (fast fade); the voice is silent there; only a room tone far under -45 dB
gate = env_lin([(0, 1), (Q1[0] - .12, 1), (Q1[0], 0), (Q1[1], 0), (Q1[1] + .03, 1), (Q2[0] - .15, 1), (Q2[0], 0), (Q2[1], 0), (Q2[1] + .03, 1), (DUR + 1, 1)])
bed = np.stack([lp(brown(DUR + 1), 200)[:N]] * 2, 1) * db(-62)
mix = (music + fx * db(-1)) * gate[:, None] + vo[:, None] + bed * (1 - gate[:, None])
mix = mix[:int(DUR * SR)]

# ——— loudness: BS.1770 integrated (K-weighting, 400 ms blocks, gated) → -14 LUFS, then a peak limiter ———
def kfilter(x):
    f0, G, Q = 1681.974450955533, 3.999843853973347, .7071752369554196; K = np.tan(np.pi * f0 / SR); Vh = 10 ** (G / 20); Vb = Vh ** .4996667741545416
    a0 = 1 + K / Q + K * K; b1 = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]; a1 = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    f0, Q = 38.13547087602444, .5003270373238773; K = np.tan(np.pi * f0 / SR)
    b2 = [1, -2, 1]; a2 = [1, 2 * (K * K - 1) / (1 + K / Q + K * K), (1 - K / Q + K * K) / (1 + K / Q + K * K)]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
def lufs(x):
    y = kfilter(x); bl, hop = int(.4 * SR), int(.1 * SR)
    z = np.array([np.mean(y[i:i + bl] ** 2, 0).sum() for i in range(0, len(y) - bl, hop)]); l = -.691 + 10 * np.log10(z + 1e-12)
    z = z[l > -70]; g = -.691 + 10 * np.log10(z.mean()) - 10; z2 = z[-.691 + 10 * np.log10(z) > g]
    return -.691 + 10 * np.log10(z2.mean())
for _ in range(3):
    mix *= db(-14 - lufs(mix)); mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
def seg_db(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x))
print('mix done', DUR, 's | integrated %.1f LUFS | peak %.2f' % (lufs(mix), np.abs(mix).max()), '| instruments', sorted({e['inst'] for e in ev}))
print('silence 1 %.2f–%.2f: %.1f dB | silence 2 %.2f–%.2f: %.1f dB | whole: %.1f dB' % (Q1[0], Q1[1], seg_db(*Q1), Q2[0], Q2[1], seg_db(*Q2), seg_db(0, DUR)))
for a_, b_ in [(0, 5), (Q1[0] - 1, Q1[0]), (Q2[0] - 1, Q2[0]), (H['salio'], H['salio'] + 2), (DUR - 3, DUR)]: print('  %.1f–%.1f: %.1f dB' % (a_, b_, seg_db(a_, b_)))
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
