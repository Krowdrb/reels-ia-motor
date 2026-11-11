"""Trescientos codos (el arca de Noé): original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
Music grows from lanterns and wood (harp, low strings) to a choir of light at «arco»; rain and thunder on a12-a14; two real silences (after a11 and after a15)."""
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
S1_, S2_ = H['silencio1'], H['a12']          # silence 1: end of a11 -> «Y el Señor cerró la puerta»
T1_, T2_ = H['silencio2'], H['a16']          # silence 2: end of a15 -> the dove

# ——— the night building site (0 → brea): cello/bass drone in D, harp ostinato like a lantern swinging ———
for p, v, i, pan in [('D2', .26, 'contrabass', 0), ('A2', .22, 'cellos', -.2), ('D3', .16, 'cellos', .2)]: n(0, i, p, H['a07'] + .6, v, pan, attack=.25, release=1.0)
C_ = [['D3', 'A3', 'D4', 'E4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['G2', 'D3', 'G3', 'Bb3'], ['A2', 'E3', 'A3', 'C#4']]
beat = .4; tc = .05; k = 0
while tc < H['a07'] - .1:
    ch = C_[int(tc // (beat * 8)) % 4]; n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]], 1.1, .26 + .06 * (k % 4 == 0), -.2); tc += beat; k += 1
for tn, p in [(H['codos'], 'A4'), (H['largo'] + .1, 'D5'), (H['ancho'], 'E5'), (H['alto'], 'F5')]: n(tn, 'glockenspiel', p, 2.0, .22, .25)   # each figure a small light
# ——— pitch and decks: low strings hold, one glockenspiel note per deck that lights, window and door ———
a, b = H['a07'] - .2, H['a10'] - .1
for p, v, i in [('D2', .24, 'contrabass'), ('F3', .2, 'cellos'), ('A3', .18, 'violas')]: n(a, i, p, b - a, v, 0, attack=.4, release=.8)
for j, p in enumerate(['D5', 'F5', 'A5']): n(H['pisos'] + .1 + .4 * j, 'glockenspiel', p, 2.2, .34, -.2 + .2 * j)
n(H['ventana'] + .15, 'glockenspiel', 'D6', 2.4, .3, .2); n(H['puertaS5'], 'glockenspiel', 'A5', 2.4, .26, -.2)
for j, p in enumerate(['D4', 'F4', 'A4', 'D5']): n(H['a08'] + j * .4, 'harp', p, 1.6, .26, .1)
# ——— the eight go in: sustained strings over a bass pedal, rising a little; everything is gone before silence 1 ———
a, b = H['a10'] - .2, S1_ - .05
for p, v, i, pan in [('D2', .28, 'contrabass', 0), ('D3', .24, 'cellos', -.2), ('A3', .22, 'violas', 0), ('F4', .2, 'violins', .2), ('Bb4', .18, 'violins', .25)]:
    n(a, i, p, b - a - .5, v, pan, attack=.8, release=.4)
for j, p in enumerate(['A3', 'D4', 'F4', 'A4', 'D5', 'F5', 'A5', 'D6']): n(H['ocho'] + .1 + j * .2, 'harp', p, .9, .2 + .01 * j, .2)   # one note per person
# ——— the door: a single low drum with the slam, then rain music: tremolo violins, falling harp, a bass pedal ———
n(H['puerta'], 'timpani', 'D3', 2.5, .62, 0)
a, b = H['puerta'] + .25, H['a15'] + .4
for p, v, i, pan in [('D2', .3, 'contrabass', 0), ('D3', .26, 'cellos', -.2), ('A3', .22, 'violas', 0)]: n(a, i, p, b - a, v, pan, attack=.9, release=.6)
for p, v in [('D4', .2), ('F4', .2), ('A4', .18)]: n(H['lluvia'] - .2, 'violins_trem', p, H['a15'] - H['lluvia'] + .3, v, .1, attack=.8, release=.4)
tc = H['lluvia'] + .2; desc = ['A5', 'F5', 'D5', 'A4', 'F4', 'D4', 'A3', 'F3']; j = 0
while tc < H['a15']: n(tc, 'harp', desc[j % 8], .9, .24, -.25); tc += .3; j += 1
for tn in [H['lluvia'] + .35, H['lluvia'] + 1.35, H['agua'] + .6, H['agua'] + 1.9]: n(tn, 'timpani', 'A2', 1.6, .3, 0)
# ——— Ararat: the strings open into D major, the horn enters; it all ends before silence 2 ———
a, b = H['a15'] + .2, T1_ - .1
for p, v, i, pan in [('D2', .3, 'contrabass', 0), ('D3', .28, 'cellos', -.25), ('A3', .26, 'violas', -.05), ('F#4', .25, 'violins', .2), ('A4', .22, 'violins', .25)]:
    n(a, i, p, b - a - .7, v, pan, attack=.6, release=.5)
n(H['ararat'] - .2, 'horn', 'A3', 1.6, .3, 0, attack=.3, release=.5)
# ——— the dove: the flute alone is the first sound after the silence ———
for j, (p, d) in enumerate([('A5', .5), ('F#5', .35), ('D5', .9), ('E5', .45), ('F#5', 1.1)]):
    n(T2_ + .02 + sum([.5, .35, .9, .45][:j]), 'flute', p, d * .95, .34, .2, attack=.05)
n(H['paloma'] + 1.6, 'glockenspiel', 'A6', 2.0, .24, .3)
for p, v, i in [('D3', .16, 'cellos'), ('A3', .15, 'violas')]: n(H['paloma'] + .9, i, p, H['a17'] - H['paloma'] - .7, v, 0, attack=1.0, release=.4)
# ——— climax: strings and horn swell from «Y Dios» to the peak on «arco» ———
a, X = H['a17'] - .1, H['arco']
for p, v, i, pan in [('D2', .32, 'contrabass', 0), ('D3', .3, 'cellos', -.3), ('A3', .28, 'violas', -.1), ('D4', .28, 'violas', .1), ('F#4', .28, 'violins', .2), ('A4', .28, 'violins', .3)]:
    n(a, i, p, X - a + .1, v * .75, pan, attack=X - a - .1, release=.3)
for p, v, i, pan in [('D2', .42, 'contrabass', 0), ('D3', .44, 'cellos', -.3), ('A3', .42, 'violas', -.1), ('D4', .42, 'violas', .1), ('F#4', .42, 'violins', .2), ('A4', .42, 'violins', .3), ('D5', .4, 'violins', .25)]:
    n(X, i, p, 3.4, v, pan, attack=.08, release=2.0)
for p, v in [('D4', .4), ('A3', .36)]: n(X + .02, 'horn', p, 3.0, v, 0, attack=.25, release=1.4)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(X - .36 + j * .04, 'harp', p, 2.0, .4, .15)
for j, p in enumerate(['D6', 'A5', 'F#6', 'D7']): n(X + .05 + j * .09, 'glockenspiel', p, 2.6, .26, -.3 + .2 * j)
for j in range(7): n(X - .35 + j * .09, 'hand_chimes' if j % 2 else 'glockenspiel', ['A5', 'B5', 'C#6', 'D6', 'E6', 'F#6', 'A6'][j], 1.6, .14, -.3 + .1 * j)
# ——— end: harp alone over a held D major, tail to the last frame ———
a = H['a18'] + 1.2
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5']): n(a + j * .13, 'harp', p, 3.4, .3, -.2 + j * .08)
for p, v, i in [('D3', .18, 'cellos'), ('A3', .16, 'violas'), ('F#4', .14, 'violins')]: n(a, i, p, DUR - a, v, 0, attack=1.2, release=1.0)
for j, p in enumerate(['A4', 'F#4', 'D4']): n(H['a19'] + .9 + j * .6, 'harp', p, 2.0, .26, .25)
n(H['escribe'] + .1, 'glockenspiel', 'D6', 2.6, .24, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.5, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the score grows toward the bow: lanterns soft, storm fuller, the climax fullest
music *= env_lin([(0, .78), (H['a07'], .8), (H['a10'], .88), (H['lluvia'], .95), (H['a15'], 1.0), (H['a17'], 1.0), (H['arco'] + .2, 1.18), (H['a19'], .95), (DUR + 1, .9)])[:, None]
# the two silences: music and effects both go (≤ -40 dB), after reverb tails
quiet = env_lin([(0, 1), (S1_ - .25, 1), (S1_ + .02, 0), (S2_ - .3, 0), (H['puerta'] - .7, 0), (H['puerta'] - .5, 1), (T1_ - .3, 1), (T1_ + .02, 0), (T2_ - .03, 0), (T2_, 1), (DUR + 1, 1)])
music *= quiet[:, None]

# ——— foley and ambience ———
fx = np.zeros((N, 2))
def thunder(d=2.4): return norm(lp(brown(d), 240) * (np.minimum(1, t_(d) / .03)) * np.exp(-t_(d) / (d * .45)) + bp(noise(d), 200, 1500) * np.exp(-t_(d) / .18) * .6)
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def knock(f=180, d=.18): x = t_(d); return norm((np.sin(2 * np.pi * f * x) * .7 + bp(noise(d), 300, 2500) * .6) * np.exp(-x / .03))
def creak(d=.6):
    x = t_(d); return norm(bp(np.sign(np.sin(2 * np.pi * (60 + 25 * np.sin(x * 7)) * x)), 250, 1400) * np.sin(np.pi * x / d))
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def smear(d=1.4): return norm(lp(bp(noise(d), 150, 1200), 900) * np.sin(np.pi * t_(d) / d) ** .7 * (1 + .3 * np.sin(2 * np.pi * 6 * t_(d))))
def step_(v=1.): d = .09; return norm(bp(noise(d), 200, 1800) * np.exp(-t_(d) / .02)) * v
def flap(d=.12): return norm(bp(noise(d), 600, 4000) * np.sin(np.pi * t_(d) / d) ** 2)
# night: crickets + soft wind + lantern crackle (S1-S3)
cr = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > .2) * (np.sin(2 * np.pi * .9 * tt) > -.2)
crk = bp(noise(DUR + 1), 2000, 8000)[:N] * (rng.random(N) > .9997)
night = env_lin([(0, 1), (H['a07'] - .2, 1), (H['a07'] + .1, 0), (H['a10'] - .2, 0), (H['a10'] + .3, .5), (S1_ - .25, .5), (S1_, 0), (DUR + 1, 0)])
add(fx, cr[:N] * night * db(-44), 0, 1, .3); add(fx, crk * night * db(-22), 0, 1, -.3)
wind = bp(noise(DUR + 1), 250, 1500)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
add(fx, wind * env_lin([(0, .7), (H['a07'] - .2, .7), (H['a07'], 0), (H['a10'] - .2, 0), (H['a10'], .6), (S1_ - .2, .6), (S1_, 0), (H['a15'] + 1, 0), (H['a15'] + 1.5, .5), (T1_ - .2, .4), (T1_, 0), (T2_ - .45, .0), (T2_ - .25, .3), (DUR + 1, .35)]) * db(-33), 0, 1, .2)
for j in range(5): add(fx, knock(150 + 20 * j), .7 + j * .95, db(-36), .5)   # far-off hammer (Noah on the scaffold)
for tn in np.arange(H['a03'] - .1, H['a04'] + 1.0, .32): add(fx, step_(.8), tn, db(-36), 0)   # Clawd walking the hull
for tn in np.arange(H['a06'] - .25, H['a06'] + .95, .2): add(fx, knock(320, .08), tn, db(-38), .3)   # ladder rungs
add(fx, smear(1.5), H['brea'] + .05, db(-27), -.1); add(fx, smear(1.4), H['brea'] + .45, db(-33), .2)
for j in range(3): add(fx, shimmer(.8, 1800 + 300 * j), H['pisos'] + .1 + .4 * j, db(-36), 0)
# rain: first drops at the entry, then all of it when the door shuts (L-cut into the window shot), thinning on the open sea
rain = bp(noise(DUR + 1), 2200, 9000)[:N]
add(fx, rain * env_lin([(0, 0), (H['a10'], 0), (H['a10'] + .6, .25), (S1_ - .25, .25), (S1_, 0), (H['puerta'] - .02, 0), (H['puerta'] + .05, .5), (H['lluvia'], 1), (H['agua'] + 1.5, .8), (H['a15'], .25), (H['a15'] + 1.2, 0), (DUR + 1, 0)]) * db(-26), 0, 1, -.1)
for tn in np.arange(H['a10'] + .3, S1_ - .3, .27): add(fx, step_(.6), tn, db(-40), .3)   # feet on the ramp
add(fx, creak(.7), H['puerta'] - .65, db(-30), .2); add(fx, thump(.5), H['puerta'], db(-14), 0); add(fx, knock(110, .3), H['puerta'] + .01, db(-22), 0)
for tn in [H['lluvia'] + .35, H['lluvia'] + 1.35, H['lluvia'] + 2.3, H['agua'] + .6]: add(fx, thunder(2.2), tn + .04, db(-17), -.1)
sea = bp(brown(DUR + 1), 80, 900)[:N] * (.55 + .45 * np.sin(2 * np.pi * tt / 4.8) ** 2)
add(fx, sea * env_lin([(0, 0), (shot['S9'] - .1, 0), (shot['S9'] + .3, .9), (H['a15'] + .5, .7), (H['ararat'], .2), (T1_ - .3, .1), (T1_, 0), (DUR + 1, 0)]) * db(-27), 0, 1, 0)
add(fx, creak(.8), H['agua'] + 1.2, db(-32), .3); add(fx, thump(.4), H['ararat'], db(-21), 0); add(fx, bp(noise(.5), 150, 1200) * np.exp(-t_(.5) / .15), H['ararat'] + .02, db(-28), 0)
# J-cut: distant birds come in just before the dove's flute
bird = lambda f: np.sin(2 * np.pi * f * (1 + .15 * np.sin(2 * np.pi * 9 * t_(.25))) * t_(.25)) * np.sin(np.pi * t_(.25) / .25) ** 2
for tn, f, pan in [(T2_ - .02, 3300, .4), (T2_ + .9, 3700, -.3), (H['a17'] + .2, 3500, .5), (H['a19'], 3200, -.4)]: add(fx, bird(f), tn, db(-38), pan)
for j in range(8): add(fx, flap(), H['paloma'] - .2 + j * .16, db(-31 - j), .3 - j * .04)
for j in range(3): add(fx, paper(.5), H['nubes'] + j * .25, db(-28), [-.4, .4, 0][j])
add(fx, whoosh(1.3), H['nubes'] + .1, db(-26), 0); add(fx, shimmer(2.2, 900), H['arco'] - .3, db(-29), 0)
for j, tn in enumerate([H['mira_arca'] - .05, H['a19'] + 1.4]): add(fx, step_(.7), tn, db(-36), 0)
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
room = np.stack([lp(bp(noise(DUR + 1), 60, 2000), 700)[:N] for _ in (0, 1)], 1); room *= db(-58) / rms(room)   # room tone: the silences are still, not dead
mix = music + fx * db(-1) + vo[:, None] + room
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
# check: the two silences, and voice vs music
def lvl(a, b, x=mix): seg_ = x[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(seg_) + 1e-9)
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print(f"silence 1 {S1_ + .1:.2f}-{S2_ - .05:.2f}: {lvl(S1_ + .1, S2_ - .05):.1f} dB (music+fx {lvl(S1_ + .1, S2_ - .05, music + fx):.1f})")
print(f"silence 2 {T1_ + .1:.2f}-{T2_ - .05:.2f}: {lvl(T1_ + .1, T2_ - .05):.1f} dB (music+fx {lvl(T1_ + .1, T2_ - .05, music + fx):.1f})")
va = act[:len(mix)]; m_ = (music + fx)[:len(mix)]
print(f"voice RMS {20*np.log10(rms(vo[:len(mix)][va])):.1f} dB, music+fx under voice {20*np.log10(rms(m_[va])):.1f} dB, climax {lvl(H['arco'], H['arco'] + 1.5, m_):.1f} dB")
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
