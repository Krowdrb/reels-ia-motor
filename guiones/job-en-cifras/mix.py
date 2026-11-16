"""Job en cifras: score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
Pastoral D major (72 bpm) -> D minor drone for the day of losses -> two true silences -> celesta, harp, strings and horn rising to "el doble"."""
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
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
BEAT = 60 / 72
S1_, S2_, S3_, S4_, S5_, S6_, S7_, S8_, S9_, S10_, S11_, S12_ = (shot[f'S{i}'] for i in range(1, 13))
SIL1, SIL2 = (H['silencio1'], H['l06']), (H['silencio2'], H['l09'])
MOTIF = [('A4', 1), ('B4', .5), ('A4', .5), ('F#4', 2)]   # the shepherd's four notes (in beats)
def motif(t0, v=.34, pan=.2, inst='flute'):
    t = t0
    for p, b in MOTIF: n(t, inst, p, b * BEAT * .95, v, pan, attack=.06); t += b * BEAT

# ——— abundance (S1–S2): harp ostinato on the beat, flute motif, soft low drone ———
ARP = [['D3', 'A3', 'D4', 'F#4'], ['G2', 'D3', 'G3', 'B3'], ['D3', 'A3', 'D4', 'F#4'], ['A2', 'E3', 'A3', 'C#4']]
tc, k = .3, 0
while tc < S3_ - .1:
    ch = ARP[(k // 8) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]], 1.2, .3 - .06 * (k % 2), -.25); tc += BEAT / 2; k += 1
for p, v, i in [('D2', .2, 'contrabass'), ('A2', .16, 'cellos')]: n(.1, i, p, S3_ - .1, v, 0, attack=1.2, release=.6)
motif(.4); motif(.4 + 4 * BEAT, v=.3)
# ——— the day (S3–S5): the harp stops; D minor drone; a timpani stroke per messenger ———
for p, v, i in [('D2', .3, 'contrabass'), ('A2', .26, 'cellos'), ('D3', .22, 'cellos'), ('F3', .2, 'violas')]: n(S3_, i, p, SIL1[0] - S3_ + .05, v, 0, attack=.8, release=.05)
for tm in [H['mensajero'] + .25, H['mensajero2'] + .25]: n(tm, 'timpani', 'D3', 2.0, .55, 0)
n(H['l04'] + .1, 'timpani', 'A2', 1.6, .35, 0)
for p, v in [('A3', .22), ('D4', .22), ('F4', .2)]: n(H['viento'] - .2, 'violas' if p != 'F4' else 'violins', p, SIL1[0] - H['viento'] + .25, v, 0, attack=1.6, release=.05)
# ——— the blessing (S6): first sound after silence 1 is a low string chord; celesta alone on "Bendito" ———
for p, v, i in [('D2', .3, 'contrabass'), ('D3', .28, 'cellos'), ('A3', .24, 'violas'), ('F4', .2, 'violins')]: n(SIL1[1] - .02, i, p, 4.2, v, 0, attack=.25, release=1.6)
for j, p in enumerate(['A5', 'D6', 'F#6']): n(H['bendito'] + .05 + j * .32, 'celesta', p, 2.6, .34, .15)
for p, v, i in [('D3', .22, 'cellos'), ('F#3', .2, 'violas'), ('A3', .18, 'violas')]: n(H['bendito'] + .1, i, p, S7_ - H['bendito'] + .4, v, 0, attack=1.0, release=.8)
# ——— the week (S7–S8): one held cello note ———
n(S7_ - .2, 'cellos', 'A2', SIL2[0] - S7_ + .25, .26, 0, attack=1.2, release=.05)
n(S7_, 'contrabass', 'D2', SIL2[0] - S7_ + .2, .18, 0, attack=1.5, release=.05)
# ——— climax (S9): celesta bell + harp and strings and horn rising to "el doble" ———
X, A = H['doble'], H['abre']
n(SIL2[1] - .02, 'celesta', 'D6', 3.0, .4, 0); n(SIL2[1] + .45, 'celesta', 'A5', 2.6, .3, .1)
for j in range(int((X - SIL2[1] - .6) / (BEAT / 2))):
    tn = SIL2[1] + .6 + j * BEAT / 2; p = ['D3', 'A3', 'D4', 'E4', 'F#4', 'A4', 'F#4', 'E4'][j % 8]; n(tn, 'harp', p, 1.4, .22 + .2 * (tn - SIL2[1]) / (X - SIL2[1]), -.2)
for p, v, i in [('D2', .3, 'contrabass'), ('D3', .3, 'cellos'), ('A3', .28, 'violas'), ('D4', .26, 'violins'), ('F#4', .24, 'violins')]: n(SIL2[1] + .4, i, p, X - SIL2[1] - .35, v, 0, attack=2.6, release=.2)
n(A - .3, 'horn', 'A3', X - A + .2, .34, -.1, attack=1.0, release=.2)
for p, v, i, pan in [('D2', .45, 'contrabass', 0), ('D3', .46, 'cellos', -.3), ('A3', .44, 'violas', -.1), ('D4', .44, 'violas', .1), ('F#4', .44, 'violins', .2), ('A4', .44, 'violins', .3), ('D5', .4, 'violins', .25)]:
    n(X, i, p, S10_ - X + 3.2, v, pan, attack=.08, release=1.6)
for p, v in [('D3', .4), ('A3', .4), ('F#4', .36)]: n(X, 'horn', p, 3.4, v, 0, attack=.12, release=1.4)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(X - .36 + j * .04, 'harp', p, 2.2, .44, .15)
n(X, 'celesta', 'D6', 3.0, .4, .2); n(X, 'timpani', 'D2', 2.4, .5, 0)
# ——— the double (S10–S11): soft tutti in D major at 72 bpm, the flute motif harmonised ———
a = S10_ + .3; b = S12_ + .5; k = 0; tc = a
while tc < b:
    ch = ARP[(k // 8) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]], 1.2, .3 - .06 * (k % 2), -.25); tc += BEAT / 2; k += 1
motif(S10_ + .6, v=.34); n(S10_ + .6, 'violins', 'F#4', 4 * BEAT, .2, .25, attack=.3, release=.4); motif(S11_ + .3, v=.32)
for p, v, i in [('D2', .22, 'contrabass'), ('D3', .2, 'cellos'), ('A3', .18, 'violas')]: n(S11_ - .2, i, p, S12_ - S11_ + .8, v, 0, attack=.8, release=.8)
n(H['catorce'], 'celesta', 'A5', 2.0, .3, .2); n(H['seis'], 'celesta', 'F#5', 2.0, .28, -.2)
# ——— the question (S12): flute alone with the opening motif, harp held under the CTA ———
motif(S12_ + .5, v=.32); motif(S12_ + .5 + 4 * BEAT, v=.28)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4']): n(H['cta'] - .1 + j * .1, 'harp', p, DUR - H['cta'], .26, -.2 + j * .08)
for p, v, i in [('D3', .16, 'cellos'), ('A3', .14, 'violas'), ('F#4', .12, 'violins')]: n(H['l12'] - .2, i, p, DUR - H['l12'], v, 0, attack=1.4, release=1.2)
n(H['l13b'] + 1.2, 'celesta', 'D6', 2.4, .26, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.24); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

# ——— foley ———
fx = np.zeros((N, 2))
def bell(v=1.):   # sheep bell
    try: return S.hit('cowbell', None, .5 * v)
    except Exception:
        d = .5; x = t_(d); return norm(sum(np.sin(2 * np.pi * f * x) * np.exp(-x / (.09 + .02 * i)) for i, f in enumerate([540, 812, 1250, 1630]))) * v
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def creak(d=.5): x = t_(d); return norm(bp(np.sign(np.sin(2 * np.pi * (70 + 30 * np.sin(x * 9)) * x)), 300, 1500) * np.sin(np.pi * x / d))
def bleat(d=.7, f=420):
    x = t_(d); vib = 1 + .06 * np.sin(2 * np.pi * 7 * x); s = sum(np.sin(2 * np.pi * f * m * vib * x) / m ** 1.3 for m in range(1, 7)); return norm(bp(s, 300, 3000) * np.sin(np.pi * x / d) ** .8)
def chirp(d=.12, f=3200): x = t_(d); return norm(np.sin(2 * np.pi * (f + 900 * np.sin(np.pi * x / d)) * x) * np.sin(np.pi * x / d) ** 2)
def cloth(d=.4): return norm(bp(noise(d), 600, 3000) * np.sin(np.pi * t_(d) / d) ** 2)
# wind: soft in the evening, a gust for the house (that dies inside silence 1), soft morning wind at the end
wind = bp(noise(DUR + 1), 220, 1600)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
gust = bp(noise(DUR + 1), 400, 3500)[:N] * (.5 + .5 * np.sin(2 * np.pi * tt / 1.7) ** 2)
add(fx, wind * env_lin([(0, .35), (S3_, .4), (H['viento'] - .3, .6), (H['viento'] + .4, 1.3), (SIL1[0] - .1, 1.0), (SIL1[0] + .4, 0), (S10_ - .3, 0), (S10_ + .4, .35), (DUR + 1, .35)]) * db(-28), 0, 1, .15)
add(fx, gust * env_lin([(0, 0), (H['viento'] - .2, 0), (H['viento'] + .5, 1), (H['viento'] + 1.9, .8), (SIL1[0] + .35, 0), (DUR + 1, 0)]) * db(-30), 0, 1, -.2)
# sheep bells: one per sheep passing Clawd (each on a beat), then doubled for the restoration
for i in range(6): add(fx, bell(), .4 + i * BEAT, db(-24), -.3 + i * .1)
for tn in [S2_ + .2, S2_ + .9]: add(fx, bell(.7), tn, db(-30), .3)
for tn, pan in [(S10_ - .5, -.3), (S10_ - .5 + .12, .3), (H['catorce'], -.2), (H['catorce'] + .1, .25), (H['catorce'] + .5, 0), (H['seis'], .2), (S10_ + 2.6, -.1), (S12_ + .4, .2), (S12_ + 1.3, -.2), (H['cta'], 0)]:
    add(fx, bell(.8), tn, db(-27), pan)
add(fx, bleat(), 1.6, db(-36), -.4); add(fx, bleat(.6, 470), 4.1, db(-38), .4); add(fx, bleat(.6, 450), S12_ + 2.2, db(-38), .3); add(fx, bleat(.7, 400), S10_ + 1.2, db(-37), -.3)
add(fx, paper(.6), .35, db(-33), -.3)   # the title strip
for tn in np.arange(S2_ + .1, S3_, BEAT * .75): add(fx, thump(.35, 55), tn, db(-36), .1)   # camel steps
add(fx, creak(.5), S4_ + .2, db(-32), .3); add(fx, creak(.6), S4_ + 1.1, db(-34), .3)   # the gate
add(fx, thump(.7, 48), H['viento'] + 1.95, db(-26), 0)   # the house falling into shadow: dull and soft
add(fx, shimmer(1.6, 1100), H['bendito'] - .1, db(-33), 0)
cr = (np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > .3) * (np.sin(2 * np.pi * 1.6 * tt) > -.2))
night = np.clip(np.cos(np.pi * (tt - S7_) / 1.45), 0, 1)
add(fx, cr * night * env_lin([(0, 0), (S7_, 0), (S7_ + .3, 1), (SIL2[0] - .3, .6), (SIL2[0], 0), (DUR + 1, 0)]) * db(-42), 0, 1, .3)
add(fx, cloth(), S7_ + .25, db(-36), -.3); add(fx, cloth(), S7_ + .6, db(-37), .3)
add(fx, shimmer(2.6, 900), SIL2[1] + .05, db(-30), 0)
for j in range(4): add(fx, paper(.5), A + j * .22, db(-27), [-.3, .3, -.15, .15][j])
add(fx, whoosh(1.3), X - .5, db(-27), 0); add(fx, shimmer(2.0, 1200), X, db(-28), 0)
for j, tn in enumerate([S10_ + .9, S10_ + 1.15, S11_ + .6, S12_ + 1.8, S12_ + 2.05, S12_ + 4.6]): add(fx, chirp(f=3000 + 300 * (j % 3)), tn, db(-38), [-.4, .4][j % 2])

# the two silences: music and foley gated to nothing (after the reverb, so no tail leaks); short fades in and out
def gate(sil, fo=.12, fi=.03): return [(sil[0] - fo, 1), (sil[0] + .02, 0), (sil[1] - fi - .02, 0), (sil[1] - .02, 1)]
quiet = env_lin([(0, 1)] + gate(SIL1) + gate(SIL2) + [(DUR + 1, 1)])
music *= quiet[:, None]; fx *= quiet[:, None]

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
music *= db(-26) / rms(music[np.abs(music).sum(1) > 1e-5])
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-6 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
swell = env_lin([(0, 1), (X - 1.5, 1), (X, 1.6), (X + 1.8, 1.3), (S10_ + 1, 1), (DUR + 1, 1)])   # the music's peak lands on "doble"
mix = music * swell[:, None] + fx * db(-1) + vo[:, None]
room = lp(brown(DUR + 1), 400)[:N]; room *= db(-66) / rms(room); mix += np.stack([room, np.roll(room, 997)], 1)   # faint room tone: the silences are quiet, not a dropout
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
mix = mix[:int(DUR * SR)].astype(np.float32)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR)
def lvl(a, b): s = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-12), 20 * np.log10(np.abs(s).max() + 1e-12)
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
for nm, (a, b) in [('silence 1', SIL1), ('silence 2', SIL2)]: r, p = lvl(a + .05, b - .08); print(f'{nm}: {a:.2f}-{b:.2f} s  rms {r:.1f} dB  peak {p:.1f} dB')
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
