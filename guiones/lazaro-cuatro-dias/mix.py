"""El amigo (Lázaro, Juan 11): score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
A minor (mourning) opening to A major on «fuera». Harp, flute (shepherd's reed), celesta, low strings, one timpani stroke.
Two real silences: before «Y Jesús lloró» and before «¡Lázaro, ven fuera!» (music, ambience and foley all out; checked at the end)."""
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
S1a, S1b = H['silencio1'], H['l09']        # silence 1: end of «María lloraba a sus pies» -> «Y Jesús lloró»
S2a, S2b = H['silencio2'], H['l14']        # silence 2: end of «...gracias al Padre» -> «¡Lázaro, ven fuera!»
F = H['fuera']
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))

# ——— P1–P2 the tomb at dusk: low string pedal on A, sparse harp, the four-note flute phrase (it comes back in major at the end) ———
for p, v, i, pan in [('A1', .22, 'contrabass', 0), ('A2', .2, 'cellos', -.2), ('E3', .13, 'violas', .2)]: n(.05, i, p, shot['S3'] + .5, v, pan, attack=1.2, release=1.2)
for tn, p in [(.5, 'A3'), (1.6, 'E4'), (H['l02'], 'C4'), (H['l02'] + 1.1, 'B3'), (H['l03'], 'A3')]: n(tn, 'harp', p, 2.6, .3, -.25)
tn = 1.0
for p, d in [('E5', .8), ('C5', .55), ('D5', .55), ('A4', 1.8)]: n(tn, 'flute', p, d * .95, .27, .2, attack=.1); tn += d
for j, tn in enumerate([H['l03'] + .05, H['l03'] + .45, H['l03'] + .85]): n(tn + .02, 'celesta', ['E6', 'A6', 'C7'][j], 1.6, .16, .3)   # one small bell per window
# ——— P3 memory: slow harp pulse in A minor -> F -> C -> E, flute ———
a, b = shot['S3'], shot['S4']; CH = [['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'F3', 'A3'], ['C3', 'G3', 'C4', 'E4'], ['E2', 'B2', 'E3', 'G#3']]
tc, k = a, 0
while tc < b - .1:
    ch = CH[int((tc - a) // 1.1) % 4]; n(tc, 'harp', ch[k % 4], 1.4, .27, -.15); tc += .55; k += 1
for j, (p, d) in enumerate([('A4', 1.1), ('C5', .55), ('B4', .55), ('A4', 1.1), ('E4', 1.4)]): n(a + .5 + sum([1.1, .55, .55, 1.1][:j]), 'flute', p, d * .95, .24, .25, attack=.08)
# ——— P4 the road: harp arpeggio, a soft string chord on «la vida» ———
a, b = shot['S4'], shot['S5']; tc, k = a, 0; ARP = ['A2', 'E3', 'A3', 'C4', 'E4', 'C4', 'A3', 'E3']
while tc < b - .2: n(tc, 'harp', ARP[k % 8], 1.2, .24, -.1); tc += .3; k += 1
for p, v, i in [('A3', .26, 'violas'), ('C4', .24, 'violas'), ('E4', .22, 'violins'), ('A4', .2, 'violins')]: n(H['l07'] + 1.2, i, p, 2.6, v, .1, attack=.6, release=1.0)
# ——— P5 María: violas and cellos held, fading into silence 1 ———
a = shot['S5']
for p, v, i in [('A2', .26, 'cellos'), ('E3', .22, 'cellos'), ('A3', .2, 'violas'), ('C4', .18, 'violas')]: n(a, i, p, S1a - a - .1, v, 0, attack=.8, release=.25)
# ——— after silence 1: a harp note and one celesta note on the drop; then warm cellos ———
n(S1b + .02, 'harp', 'A4', 3.0, .32, .1); n(H['llora'] + .05, 'celesta', 'E6', 2.4, .3, .15)
for p, v, i in [('F2', .22, 'cellos'), ('C3', .2, 'cellos'), ('A3', .18, 'violas')]: n(H['l10'] - .2, i, p, shot['S7'] - H['l10'] + .4, v, 0, attack=1.0, release=.6)
# ——— P7 the stone: only the low pedal ———
a = shot['S7']
for p, v, i in [('A1', .24, 'contrabass'), ('E2', .18, 'cellos')]: n(a, i, p, H['ora'] - a + .3, v, 0, attack=.6, release=.6)
# ——— P8 prayer: celesta alone, violas rise from below, then nothing (silence 2) ———
for j, p in enumerate(['A5', 'C6', 'E6', 'A6']): n(H['ora'] + .2 + j * .55, 'celesta', p, 2.0, .26, .1)
for p, v in [('E3', .2), ('A3', .2), ('C4', .2), ('E4', .18)]: n(H['ora'] + .6, 'violas', p, S2a - H['ora'] - .7, v, 0, attack=1.2, release=.25)
# ——— P9 «fuera»: the voice first; then one timpani stroke, a harp glissando, strings and horn in A MAJOR ———
n(F, 'timpani', 'A2', 3.0, .5, 0)
for j, p in enumerate(['A2', 'C#3', 'E3', 'A3', 'C#4', 'E4', 'A4', 'C#5', 'E5', 'A5']): n(F - .3 + j * .035, 'harp', p, 2.4, .36, -.2 + j * .04)
for p, v, i, pan in [('A1', .36, 'contrabass', 0), ('A2', .36, 'cellos', -.25), ('E3', .34, 'violas', -.1), ('A3', .34, 'violas', .1), ('C#4', .34, 'violins', .2), ('E4', .33, 'violins', .3), ('A4', .3, 'violins', .25)]:
    n(F + .02, i, p, H['desata'] - F + .3, v, pan, attack=.25, release=1.4)
for p, v in [('A3', .26), ('E4', .22)]: n(F + .1, 'french_horn', p, 3.2, v, 0, attack=.4, release=1.2)
for j in range(5): n(F - .1 + j * .18, 'celesta', ['A5', 'C#6', 'E6', 'A6', 'C#7'][j], 1.6, .24, -.2 + j * .1)   # one bell per arch that lights
# ——— P11 «desátenlo»: harp alone ———
a = H['desata'] - .1
for j, p in enumerate(['A3', 'C#4', 'E4', 'A4', 'E4', 'C#4', 'B3', 'E4']): n(a + j * .3, 'harp', p, 1.8, .28, -.15 + j * .04)
# ——— P12 end: the flute phrase again, now in major, over harp and a held A major ———
a = shot['S12'] + .2
for p, v, i in [('A2', .2, 'cellos'), ('E3', .17, 'violas'), ('C#4', .15, 'violins')]: n(a, i, p, DUR - a, v, 0, attack=1.4, release=1.2)
for j, p in enumerate(['A2', 'E3', 'A3', 'C#4', 'E4']): n(a + j * .14, 'harp', p, 3.6, .28, -.2 + j * .08)
tn = H['l17'] + 1.0
for p, d in [('E5', .8), ('C#5', .55), ('D5', .55), ('A4', 2.2)]: n(tn, 'flute', p, d * .95, .25, .2, attack=.1); tn += d
for j, p in enumerate(['E4', 'A4', 'C#5']): n(H['pregunta'] + .1 + j * .35, 'harp', p, 2.6, .27, .2)
n(H['pregunta'] + 1.4, 'celesta', 'A6', 2.4, .22, .1)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.5, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

# ——— foley and ambience ———
fx = np.zeros((N, 2))
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def step(v=1.): d = .09; return norm(lp(noise(d), 900) * env_exp(d, .02)) * v
def grit(d=.18): return norm(bp(noise(d), 2000, 8000) * env_exp(d, .05))
def bell(f, d=1.2): x = t_(d); return norm(sum(np.sin(2 * np.pi * f * m * x) * a for m, a in ((1, 1), (2.76, .35), (5.4, .12))) * env_exp(d, .35) * np.minimum(1, x / .004))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def roll(d=1.6):   # the stone: a low rumble that rolls, with gravel on top
    x = t_(d); r = lp(brown(d), 160)[:len(x)] * (.6 + .4 * np.sin(2 * np.pi * 2.2 * x)) * np.sin(np.pi * x / d) ** .6
    g = bp(noise(d), 1200, 5000) * (rng.random(len(x)) < .004); g = np.convolve(g, env_exp(.02, .004), 'same')
    return norm(norm(r) + .35 * norm(g))
def chirp(): d = .16; x = t_(d); f = 3200 + 1600 * np.sin(np.pi * x / d); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)
wind = bp(noise(DUR + 1), 220, 1500)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
add(fx, wind * env_lin([(0, .7), (shot['S3'] - .5, .7), (shot['S3'] + .2, .0), (shot['S4'], .0), (shot['S4'] + .3, .5), (shot['S5'], .5), (shot['S5'] + .3, .25), (S1a - .2, .2), (S1a, 0),
                        (S1b, 0), (S1b + .4, .2), (shot['S7'] - .5, .7), (H['ora'], .6), (S2a - .3, .1), (S2a, 0), (DUR + 1, 0)]) * db(-30), 0, 1, .15)
dry = bp(noise(DUR + 1), 500, 4000)[:N]   # the open dry air of the memory, brought in before the cut (J-cut)
add(fx, dry * env_lin([(0, 0), (shot['S3'] - .6, 0), (shot['S3'] - .1, .6), (shot['S4'] - .2, .6), (shot['S4'] + .2, 0), (DUR + 1, 0)]) * db(-36), 0, 1, -.1)
murmur = lp(brown(DUR + 1), 420)[:N] * (.7 + .3 * np.sin(2 * np.pi * tt / 2.7))
add(fx, murmur * env_lin([(0, 0), (shot['S5'] - .4, 0), (shot['S5'] + .2, .8), (S1a - .35, .8), (S1a - .05, 0), (DUR + 1, 0)]) * db(-33), 0, 1, 0)
hollow = lp(brown(DUR + 1), 300)[:N]   # the tomb: hollow air only in the ambience, never on the voice
add(fx, hollow * env_lin([(0, 0), (F - .1, 0), (F + .3, .8), (shot['S11'] - .2, .8), (shot['S11'] + .3, 0), (DUR + 1, 0)]) * db(-32), 0, 1, 0)
breeze = bp(noise(DUR + 1), 400, 2500)[:N]
add(fx, breeze * env_lin([(0, 0), (shot['S11'] - .3, 0), (shot['S11'] + .3, .6), (DUR + 1, .6)]) * db(-36), 0, 1, -.2)
for tn, pan in [(shot['S12'] + .8, .3), (shot['S12'] + 1.05, .3), (H['l17'] + 1.6, -.4), (H['l18'] + .6, .4), (H['l18'] + .78, .4)]: add(fx, chirp(), tn, db(-38), pan)
# P1: the paper hand on the stone; the title strip
add(fx, paper(.6), .3, db(-36), .2); add(fx, lp(noise(.5), 500) * np.sin(np.pi * t_(.5) / .5), .4, db(-34), -.1)
# P2: one small bell per window
for j in range(3): add(fx, bell(1900 + 250 * j, .9), H['l03'] + .05 + j * .4, db(-37), .3)
# P3: the paper curtain; the messenger's running steps that stop
add(fx, whoosh(.6), shot['S3'] - .05, db(-28), -.3); add(fx, paper(.7), shot['S3'], db(-32), -.2)
for tn in np.arange(H['l04'] - .1, H['l04'] + 1.45, .14): add(fx, step(), tn, db(-33), .3 - (tn - H['l04']) * .15)
# P4: steps in the dust
for tn in np.arange(shot['S4'], H['l07'] - .1, .4): add(fx, step(.8), tn, db(-34), -.2); add(fx, step(.7), tn + .2, db(-36), .2)
# P5: knees on the ground, cloth
add(fx, thump(.5, 90), H['l08'] - .1, db(-32), .1); add(fx, paper(.5), H['l08'] - .05, db(-38), .1)
# P6: the drop, a tiny glint
add(fx, shimmer(1.1, 2300), H['llora'], db(-36), .15)
# P7: steps, hands on the rock, the stone rolls (rumble + gravel) and stops
r0 = H['rueda'] - 1.2
for tn in (H['l11'] + .6, H['l11'] + .95, H['l11'] + 1.3): add(fx, step(), tn, db(-32), -.3)
add(fx, grit(.25), r0 - .15, db(-32), -.2)
add(fx, roll(1.7), r0, db(-18), .1); add(fx, thump(.8, 55), H['rueda'] + .35, db(-20), .2)
# P8: shimmer as the light comes down
add(fx, shimmer(2.2, 1100), H['ora'] + .3, db(-31), 0)
# P9: five rising bells as the arches light; the glint runs over the cut to the reverse shot (L-cut)
for j in range(5): add(fx, bell(1320 * 2 ** (j * 4 / 12), 1.3), F - .15 + j * .18, db(-33), -.2 + j * .1)
add(fx, shimmer(2.6, 900), F + .1, db(-28), 0); add(fx, whoosh(1.0), F - .2, db(-30), 0)
# P10: short dragging steps, linen
for tn in np.arange(shot['S10'] + .3, shot['S11'] - .2, .35): add(fx, step(.7), tn, db(-33), 0); add(fx, paper(.25), tn + .05, db(-41), 0)
# P11: the strips: one rustle each, a softer one for the face cloth
A = H['desata'] + .15
for i in range(9): add(fx, paper(.35 if i < 8 else .6), A + i * .17, db(-34 if i < 8 else -37), [-.3, .3][i % 2])
# P12: Clawd's little steps as he turns
for tn in (H['pregunta'] - .25, H['pregunta'] - .05): add(fx, step(.5), tn, db(-38), -.1)

# ——— the two silences: music, ambience and foley out; only a far room tone remains ———
def hole(a, b, fo=.25, fi=.03): return env_lin([(0, 1), (a - fo, 1), (a + .02, 0), (b - fi, 0), (b, 1), (DUR + 1, 1)])
gate = hole(S1a, S1b) * hole(S2a, S2b)
music *= gate[:, None]
fx *= gate[:, None]
room = lp(noise(DUR + 1), 300)[:N] * db(-64)

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
music *= db(-25) / rms(music[np.abs(music).sum(1) > 1e-5])
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-6 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
mix = music + fx * db(-1) + vo[:, None] + room[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
def win_db(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x))
print('mix done', DUR, 'instruments', sorted({q['inst'] for q in ev}))
for nm, a, b in [('silence 1', S1a + .1, S1b - .03), ('silence 2', S2a + .1, S2b - .03)]:
    v = win_db(a, b); print(f'{nm}: {a:.2f}-{b:.2f} s  {v:.1f} dBFS', 'OK' if v < -40 else 'TOO LOUD')
print('credits:'); print(S.credits(sorted({q['inst'] for q in ev})))
