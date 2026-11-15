"""El frasco roto (María de Betania): original score + night ambience + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
Score: G aeolian in the night (harp, low strings, flute, celesta), growing to the climax of S11, where strings, flute and celesta open in G major on «evangelio».
Two real silences (sil1 before Judas's protest, sil2 before «Déjala»): music, ambience and foley are gated to zero there, reverb tails included.
Prints the level measured inside each silence. Samples: vsco2ce + vcsl (tools/fetch.sh instruments vsco2ce / vcsl)."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, lp, hp, noise, brown, norm, t_, env_exp, whoosh, limit, clack
from scipy.ndimage import uniform_filter1d, maximum_filter1d

TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
H, L, DUR = TL['HIT'], TL['L'], TL['DUR']
N = int(DUR * SR) + SR
tt = np.arange(N) / SR
S.seed(12); rng = np.random.default_rng(5)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
SIL = [(H['sil1'], H['protesta']), (H['sil2'], H['dejala'])]   # (voice ends, voice starts again)
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
beat = 1.0   # 60 bpm
T, X, V = H['dondequiera'], H['evangelio'], H['contara']

# ——— S1 hook: contrabass pedal on G, one celesta note on «frasco», harp on «rompió» ———
n(.05, 'contrabass', 'G1', shot['S3'] + .3, .2, 0, attack=1.4, release=.8)
n(.6, 'celesta', 'D6', 2.2, .3, .2)
for tn, p in [(H['rompio'], 'G3'), (H['rompio'] + .12, 'D4'), (H['rompio'] + .24, 'Bb4')]: n(tn, 'harp', p, 2.0, .34, -.2)
# ——— S2 the window: the flute says the motif (G–Bb–A–D), unresolved ———
for tn, p, d in [(shot['S2'] + .25, 'G4', .7), (shot['S2'] + 1.0, 'Bb4', .5), (shot['S2'] + 1.5, 'A4', .8), (H['seis'] + .6, 'D5', 1.6)]: n(tn, 'flute', p, d, .3, .2, attack=.08)
n(shot['S2'], 'cellos', 'G2', shot['S4'] - shot['S2'], .18, -.2, attack=1.2, release=.6)
# ——— S3–S4 the supper: harp in a slow pulse (Gm – Eb – Cm – D), a viola pedal ———
CH = [['G2', 'D3', 'G3', 'Bb3'], ['Eb3', 'Bb3', 'Eb4', 'G4'], ['C3', 'G3', 'C4', 'Eb4'], ['D3', 'A3', 'D4', 'F#4']]
a, b = shot['S3'], shot['S5'] + .4; k = 0; tc = a + .1
while tc < b: ch = CH[int((tc - a) // (beat * 2)) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1][k % 6]], 1.4, .26, -.2); tc += beat / 3; k += 1
n(a, 'violas', 'D3', b - a, .14, .1, attack=1.4, release=.6)
n(H['rompe'] + .45, 'celesta', 'D6', 2.0, .32, .1)   # the neck comes off: a celesta glint
# ——— S5 the feet and the hair: soft cellos on G, the flute holds D ———
a = shot['S5']
n(a, 'cellos', 'G2', shot['S6'] - a + .4, .22, -.2, attack=.8, release=.6)
n(a + .3, 'flute', 'D5', 1.4, .22, .2, attack=.3)
# ——— S6 the house fills: celesta and harp climb a ladder, one note per layer (G–Bb–D–G–Bb), low strings in G minor up to the edge of the silence ———
T6 = shot['S6'] + .25
for i, (p, q) in enumerate(zip(['G5', 'Bb5', 'D6', 'G6', 'Bb6'], ['G3', 'Bb3', 'D4', 'G4', 'Bb4'])): n(T6 + i * .35, 'celesta', p, 1.6, .3, -.2 + i * .1); n(T6 + i * .35, 'harp', q, 1.6, .28, .2)
for p, v, i in [('G2', .2, 'cellos'), ('D3', .18, 'violas'), ('Bb3', .16, 'violas'), ('G4', .12, 'violins')]: n(shot['S6'] + .2, i, p, H['sil1'] - shot['S6'] - .1, v, 0, attack=.9, release=.15)
# ——— silence 1: nothing (gated below) ———
# ——— S8 the protest: low cellos held, the flute on Eb (the dark note); the celesta ladder comes down as the gold retreats ———
a, b = H['protesta'] + .4, H['sil2']
for p, v in [('G2', .2), ('Eb3', .16)]: n(a, 'cellos', p, b - a - .05, v, -.2, attack=1.2, release=.1)
n(a + .6, 'contrabass', 'G1', b - a - .7, .16, 0, attack=1.2, release=.1)
for tn, p, d in [(H['denarios'] + 1.6, 'Eb5', 1.2), (H['denarios'] + 2.9, 'D5', 1.6), (H['bolsa'] - .4, 'C5', .9), (H['bolsa'] + .6, 'Bb4', 1.0)]: n(tn, 'flute', p, d, .22, .25, attack=.12)
for i, p in enumerate(['G6', 'D6', 'Bb5', 'G5']): n(H['denarios'] + .2 + i * .7, 'celesta', p, 1.4, .2, .2 - i * .1)
# ——— silence 2: nothing ———
# ——— S10 the answer: the voice alone on «Déjala»; then a low harp G, cellos on G and D (no third) under «sepultura», the flute very soft; the harp pulse grows toward the climax ———
a = H['dejala'] + 1.4
n(a, 'harp', 'G2', 2.4, .3, -.1)
for p, v in [('G2', .2), ('D3', .16)]: n(a + .2, 'cellos', p, T - a - .2, v, -.2, attack=1.8, release=.5)
n(H['sepultura'] + .4, 'contrabass', 'G1', T - H['sepultura'] - .4, .14, 0, attack=1.5, release=.5)
for tn, p, d in [(H['sepultura'] + .9, 'D5', 1.4), (H['siempre'] + .2, 'C5', .8), (H['siempre'] + 1.0, 'Bb4', 1.4)]: n(tn, 'flute', p, d, .2, .2, attack=.12)
k = 0; tc = H['siempre'] - .6
while tc < T - .2: n(tc, 'harp', ['G3', 'D4', 'G4', 'A4', 'Bb4', 'A4'][k % 6], 1.3, min(.4, .22 + .02 * k), -.2); tc += beat / 3; k += 1
# ——— S11 climax: on «Dondequiera» celesta and harp climb the whole ladder (one note per layer); on «evangelio» strings, flute and celesta open in G major ———
for i, (p, q) in enumerate(zip(['G5', 'B5', 'D6', 'G6', 'B6', 'D7'], ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'])): n(T + i * .3, 'celesta', p, 1.8, .3 + .03 * i, -.25 + i * .1); n(T + i * .3, 'harp', q, 1.8, .3 + .03 * i, .2)
for p, v in [('G2', .3), ('D3', .26)]: n(T, 'cellos', p, X - T + .1, v, -.2, attack=1.0, release=.1)
for p, v, i, pan in [('G1', .5, 'contrabass', 0), ('G2', .52, 'cellos', -.3), ('D3', .5, 'cellos', -.2), ('B3', .48, 'violas', -.1), ('D4', .48, 'violas', .1), ('G4', .48, 'violins', .2), ('B4', .46, 'violins', .3), ('D5', .44, 'violins', .25)]:
    n(X, i, p, shot['S12'] - X + 1.6, v, pan, attack=.3, release=1.8)
for j, p in enumerate(['G2', 'D3', 'G3', 'B3', 'D4', 'G4', 'B4', 'D5', 'G5']): n(X - .3 + j * .04, 'harp', p, 2.2, .42, .15)
n(X, 'celesta', 'G6', 2.4, .34, .1); n(X + .03, 'hand_chimes', 'D6', 2.4, .3, -.1)
for tn, p, d in [(X + .5, 'G5', .6), (X + 1.1, 'B5', .5), (X + 1.6, 'A5', .6), (X + 2.2, 'D6', 1.8)]: n(tn, 'flute', p, d, .36, .2, attack=.05)   # the motif, resolved
for i in range(6): n(V + .05 + i * .28, 'celesta', ['D6', 'G6', 'B6', 'D7', 'B6', 'G6'][i], 1.2, .22, -.3 + i * .12)   # one per village window
# ——— S12 the lit house: low strings held in G major; the harp alone under the question; a last celesta at the end ———
a = shot['S12'] + .4
for p, v, i in [('G1', .2, 'contrabass'), ('G2', .24, 'cellos'), ('D3', .2, 'violas'), ('B3', .16, 'violas')]: n(a, i, p, DUR - a - .6, v, 0, attack=1.6, release=1.6)
k = 0; tc = a + .4
while tc < H['cta'] - .2: n(tc, 'harp', ['G3', 'D4', 'G4', 'B4', 'D5', 'B4'][k % 6], 1.4, .26, -.15); tc += beat / 2; k += 1
for j, p in enumerate(['G3', 'D4', 'B4', 'G4', 'D5', 'B4', 'G4', 'D4']): n(H['cta'] + j * beat / 2, 'harp', p, 1.6, .26, -.1)
n(H['palabra'] + .3, 'flute', 'G5', 2.4, .2, .2, attack=.3)
n(DUR - 1.4, 'celesta', 'D6', 1.4, .24, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.24); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

# ——— foley and ambience (synthesised) ———
fx = np.zeros((N, 2))
def crickets(d, seed=0):
    r = np.random.default_rng(seed); x = t_(d); out = np.zeros_like(x)
    for f0, rate, ph in [(4600, 15, 0), (5100, 17, 1.3), (4200, 13, 2.1)]:
        carrier = np.sin(2 * np.pi * f0 * x) + .2 * r.standard_normal(len(x))
        chirp = (np.sin(2 * np.pi * rate * x + ph) > .55).astype(float) * (np.sin(2 * np.pi * x / (1.1 + r.random()) + ph) > -.2)
        out += carrier * uniform_filter1d(chirp, 90)
    return norm(bp(out, 3000, 7000))
def crackle(d, seed=1):
    r = np.random.default_rng(seed); out = np.zeros(int(d * SR))
    for s in r.choice(len(out) - 2000, int(d * 3), replace=False): out[s:s + 400] += r.standard_normal(400) * np.exp(-np.arange(400) / 60) * r.random()
    return norm(bp(out, 1500, 8000))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def cloth(d=.5): return norm(bp(noise(d), 600, 3500) * np.sin(np.pi * t_(d) / d) ** 2)
def stone(v=1.):   # a thin stone (alabaster) cracking: a dry snap with a short glassy ring
    d = .35; x = t_(d); return norm(bp(noise(d), 2000, 9000) * env_exp(d, .006) + sum(a * np.sin(2 * np.pi * f * x) * env_exp(d, tau) for f, a, tau in [(2650, .5, .05), (4100, .35, .03), (5900, .2, .02)])) * v
def clay(v=1.): d = .35; x = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * x) * env_exp(d, tau) for f, a, tau in [(310, 1, .06), (720, .6, .035), (1180, .35, .02)]) + lp(noise(d), 1500) * env_exp(d, .01)) * v
def pour(d=1.4): x = t_(d); return norm(bp(noise(d), 500, 2600) * (.6 + .4 * np.sin(2 * np.pi * 7 * x) ** 2) * np.sin(np.pi * x / d) ** .7)
def bench(d=.55): x = t_(d); saw = 2 * ((x * (70 + 20 * np.sin(x * 9))) % 1) - 1; return norm(bp(saw, 150, 1400) * np.abs(np.sin(2 * np.pi * 6 * x)) ** 2 * np.sin(np.pi * x / d))
def coins(v=1.):
    out = np.zeros(int(.5 * SR))
    for s0, f in [(0, 3900), (.05, 4700), (.11, 3300), (.16, 5200)]:
        x = t_(.3); seg_ = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x / .05) / m for m in (1, 2.4, 3.9)); i = int(s0 * SR); out[i:i + len(seg_)] += seg_[:len(out) - i]
    return norm(out) * v

CR = crickets(DUR + 1, 3)[:N]
add(fx, CR * env_lin([(0, .3), (shot['S2'] - .4, .3), (shot['S2'] + .3, .9), (shot['S3'], .5), (shot['S5'], .2), (H['sil1'], .2), (H['protesta'] + .5, 0), (H['dejala'] + 1.5, 0), (H['dejala'] + 3, .3), (shot['S11'], .3), (shot['S11'] + 1, .1), (shot['S12'], .3), (DUR + 1, .5)]) * db(-36), 0, 1, .2)
CK = crackle(DUR + 1, 2)[:N]
add(fx, CK * env_lin([(0, .7), (shot['S6'], .9), (H['sil1'], .9), (H['protesta'], .6), (shot['S12'], .3), (DUR + 1, .2)]) * db(-40), 0, 1, -.3)
murmur = sum(bp(noise(DUR + 1), f * .8, f * 1.25)[:N] * (.5 + .5 * np.sin(2 * np.pi * tt * r + f) ** 2) for f, r in [(300, 1.6), (480, 2.2), (800, 2.9), (1300, 2.4)])
add(fx, norm(murmur) * env_lin([(0, 0), (shot['S3'] - .3, 0), (shot['S3'] + .5, .8), (shot['S5'], .6), (shot['S5'] + 1.2, 0), (H['protesta'] + .8, 0), (H['protesta'] + 1.5, .35), (H['sil2'], .3), (H['sil2'] + .01, 0), (DUR + 1, 0)]) * db(-34), 0, 1, -.15)
wind = bp(noise(DUR + 1), 180, 1300)[:N] * (.55 + .45 * np.sin(2 * np.pi * tt / 5.7) ** 2)
add(fx, wind * env_lin([(0, .2), (shot['S2'], .5), (shot['S3'], .15), (X - .6, .15), (X, .8), (shot['S12'], .6), (DUR + 1, .5)]) * db(-34), 0, 1, -.1)
add(fx, paper(.6), .3, db(-34), .2)
add(fx, stone(), H['rompio'] - .03, db(-24), -.1)
add(fx, shimmer(.8, 2400), H['rompio'] + .05, db(-36), -.1)
add(fx, clay(.5), H['marta'] + .3, db(-36), -.2); add(fx, pour(1.2), H['marta'] + .5, db(-36), -.25)
add(fx, cloth(.6), shot['S4'] + .1, db(-36), .2)
add(fx, stone(.8), H['rompe'] + .43, db(-27), .15)
add(fx, S.hit('frame_drum', 'small', .5), H['rompe'] + .45, db(-27), 0)
add(fx, pour(1.6), H['rompe'] + .95, db(-35), .15)
add(fx, cloth(.7), H['cabello'] - .6, db(-38), .1)
for i in range(5): add(fx, shimmer(1.0, 1200 + 250 * i), shot['S6'] + .25 + i * .35, db(-37), -.2 + i * .1)
add(fx, bench(), H['protesta'] - .05, db(-30), -.3)
add(fx, cloth(.5), H['denarios'] - .4, db(-38), -.3)
add(fx, coins(), H['bolsa'] - .05, db(-32), -.3)
add(fx, cloth(.6), H['dejala'] + .2, db(-40), 0); add(fx, cloth(.6), H['siempre'] + .1, db(-40), 0)
add(fx, clack(.7, .8), X - .05, db(-36), .1)
add(fx, shimmer(2.2, 900), X - .02, db(-30), .1); add(fx, whoosh(1.2), X + .05, db(-32), .1)
add(fx, paper(.25), H['cta'] + .02, db(-36), -.1)

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
# the score grows toward the climax of S11: low in the night, a dip under the protest, a slow crescendo through S10, the peak on «evangelio», calmer after
music *= env_lin([(0, .85), (shot['S6'], .95), (H['sil1'], 1.05), (H['protesta'], .8), (H['sil2'], .85), (H['dejala'], .8), (H['siempre'], 1.0), (T, 1.2), (X - .1, 1.35), (X + .3, 1.75), (X + 2.6, 1.5), (shot['S12'], 1.1), (DUR + 1, .95)])[:, None]
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-5.5 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
# the two silences: music, ambience and foley cut for real (tails included), fast 40 ms edges
gate = np.ones(N)
for a, b in SIL:
    gate *= 1 - env_lin([(0, 0), (a + .02, 0), (a + .06, 1), (b - .04, 1), (b, 0), (DUR + 1, 0)])
room_tone = lp(brown(DUR + 1), 400)[:N]; room_tone *= db(-64) / rms(room_tone)   # only a faint room tone stays
mix = (music + fx * db(-1)) * gate[:, None] + (room_tone * (1 - gate))[:, None] + vo[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
out = mix[:int(DUR * SR)].astype(np.float32)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), out, SR)
for k, (a, b) in enumerate(SIL, 1):
    seg_ = out[int((a + .1) * SR):int((b - .1) * SR)]
    print(f'silence {k}: {a:.2f}-{b:.2f} s, RMS {20 * np.log10(rms(seg_)):.1f} dBFS, peak {20 * np.log10(np.abs(seg_).max() + 1e-12):.1f} dBFS')
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev} | {'frame_drum'}))
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev} | {'frame_drum'})))
