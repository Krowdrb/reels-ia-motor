"""La Transfiguración (Mateo 17:1–9): original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
E phrygian (F natural) on the climb, in shadow; it opens into E major in the cloud and at the end. A flute line stands in for the ney (the voice of the
climb), the harp is a small lyre, a frame drum gives loose steps only on the climb, low strings hold the pedal, the celesta (glockenspiel) is the light.
The count motif: the lyre plays three notes (E–G–B) on «Pedro, Santiago y Juan» and three on «tres tiendas»; when Jesús is left alone it plays one (E),
held; at the end G turns to G sharp. The music grows to the climax («A él oíd»). Two real silences: after «propuso tres tiendas» (silence 1) and after
«con gran temor» (silence 2). The voice stays clean (no reverb, no effects)."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, lp, hp, noise, brown, norm, t_, thump, limit
from scipy.ndimage import uniform_filter1d, maximum_filter1d

TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
H, L, DUR = TL['HIT'], TL['L'], TL['DUR']
N = int(DUR * SR) + SR
tt = np.arange(N) / SR
S.seed(17); rng = np.random.default_rng(17)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
end = lambda i: L[i]['at'] + L[i]['dur']
S1a, S1b = H['silencio1'], H['l07']           # silence 1: after «propuso tres tiendas», until «Aún hablaba»
S2a, S2b = H['silencio2'], H['l10']           # silence 2: after «con gran temor», until «Pero Jesús se acercó»
V = H['voz'] + .1                             # the light crosses the four sheets of cloud (S7)
AO = H['aeloid']
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
CLIMB = [('E4', .45), ('F4', .45), ('G4', .45), ('F4', .45), ('E4', 1.6)]          # the climb phrase (flute for the ney), phrygian
CLIMB_MAJ = [('E4', .45), ('F#4', .45), ('G#4', .45), ('F#4', .45), ('E4', 2.0)]   # the same, in E major, on the way down
COUNT = ['E4', 'G4', 'B4']
def lyre(ts, notes=COUNT, v=.34, pan=.2):
    for tn, p in zip(ts, notes): n(tn, 'harp', p, 2.4, v, pan)

# ——— S1 the flash: a high shimmer of celesta and strings from 0 s, an open chord (E–B, no third yet) ———
for p, v, i, pan in [('E2', .16, 'contrabass', 0), ('B2', .12, 'cellos', -.15), ('E4', .1, 'violas', .1), ('B4', .1, 'violins_trem', .25), ('E5', .08, 'violins_trem', -.25)]:
    n(.02, i, p, shot['S2'] - .3, v, pan, attack=.6, release=.3)
for j, p in enumerate(['E6', 'B6', 'E7', 'B6', 'E6', 'B6']): n(.15 + j * .37, 'celesta', p, 2.4, .2, .3 - .1 * j)
n(H['moises'] + .7, 'celesta', 'G#6', 2.2, .22, -.2); n(H['moises'] + 1.33, 'celesta', 'B6', 2.2, .22, .25)   # one sparkle per name
# ——— S2–S3 the climb: pedal on E2, the flute phrase, the frame drum in loose steps; three lyre notes on the three names ———
a, b = shot['S2'], shot['S4']
n(a, 'contrabass', 'E2', b - a + .3, .2, 0, attack=.5, release=.5); n(a + .4, 'cellos', 'B2', b - a, .12, .2, attack=1.0, release=.5)
tc = a + .5
for p, d in CLIMB: n(tc, 'flute', p, d * .95, .25, -.15, attack=.1, release=.35); tc += d
tc = shot['S3'] + .3
for p, d in [('G4', .45), ('A4', .45), ('G4', .45), ('F4', 1.0)]: n(tc, 'flute', p, d * .95, .22, -.15, attack=.1, release=.35); tc += d
k = 0; tc = a + .3
while tc < b - .3: n(tc, 'frame_drum', 'large_muted' if k % 2 else 'large', .6, .3 if k % 2 == 0 else .2, -.1); tc += .62 + .06 * (k % 3 == 2); k += 1
lyre([H['nombres'] + .05, H['nombres'] + .6, H['nombres'] + 1.15])
# ——— S4 he is transfigured: the pedal rises, the celesta climbs as the shape opens, warm strings (the first E major) ———
a, b = shot['S4'], S1a
n(a, 'contrabass', 'E2', b - a, .2, 0, attack=.4, release=.05); n(a, 'cellos', 'B2', b - a, .14, .2, attack=.8, release=.05)
for j, p in enumerate(['E6', 'G#6', 'B6', 'E7']): n(H['luz'] - .1 + j * .14, 'celesta', p, 2.6, .3, .3 - .2 * j)
for j in range(5): n(H['luz'] + .15 + j * .25, 'celesta', ['B6', 'G#6', 'E6', 'B5', 'G#6'][j], 2, .16, -.2 + .1 * j)   # one bell per layer that warms
for p, v, i, pan in [('G#3', .13, 'violas', -.1), ('B3', .12, 'violas', .1), ('E4', .13, 'violins', .2), ('G#4', .1, 'violins', -.2)]:
    n(H['luz'] + .2, i, p, b - H['luz'] - .2, v, pan, attack=1.0, release=.05)
# ——— S5 three tents: three lyre notes, the strings hold and stop dead before silence 1 ———
lyre([H['tiendas'] + .5, H['tiendas'] + .72, H['tiendas'] + .94], v=.36, pan=-.15)
# ——— S6 the cloud comes down: after the silence, low strings that swell (C sharp minor, the cloud is cold) ———
a = S1b; b = shot['S7'] + .3
for p, v, i, pan in [('C#2', .2, 'contrabass', 0), ('C#3', .15, 'cellos', -.2), ('E4', .1, 'violas', .1), ('G#4', .09, 'violins', .25)]: n(a + .1, i, p, b - a, v, pan, attack=1.4, release=.6)
# ——— S7 the climax: four rising celesta notes, one per sheet the light crosses; on «A él oíd» E major in the strings, soft, and a harp sweep ———
for j, p in enumerate(['E6', 'G#6', 'B6', 'E7']): n(V + j * .4, 'celesta', p, 2.6, .34, .3 - .2 * j)
for p, v, i, pan in [('E2', .3, 'contrabass', 0), ('B2', .26, 'cellos', -.25), ('E3', .26, 'cellos', .15), ('G#3', .24, 'violas', -.1), ('B3', .22, 'violas', .1), ('E4', .24, 'violins', .2), ('G#4', .22, 'violins', -.2), ('B4', .2, 'violins', .3)]:
    n(V - .1, i, p, shot['S8'] - V + .8, v, pan, attack=1.2, release=1.0)
for j, p in enumerate(['E3', 'G#3', 'B3', 'E4', 'G#4', 'B4', 'E5', 'G#5', 'B5', 'E6']): n(AO - .35 + j * .04, 'harp', p, 2.4, .34, -.3 + j * .06)
# ——— S8 fear: the music falls to a low pedal alone; one low timpani roll under the fall; stops dead at silence 2 ———
a, b = shot['S8'] + .3, S2a
n(a, 'contrabass', 'E2', b - a, .22, 0, attack=.3, release=.05); n(a, 'cellos', 'F2', b - a - .4, .1, .2, attack=.6, release=.05)
for j in range(3): n(H['temor'] + .55 + j * .18, 'timpani', 'D3', 1.0, .22 - .04 * j, 0)
# ——— S9 «Levantaos»: after the silence the voice comes first; the lyre comes back with one note on «los tocó» ———
n(H['toca'] + .1, 'harp', 'B3', 2.4, .3, .2)
a, b = H['levantaos'], shot['S10'] + .3
for p, v, i, pan in [('E2', .14, 'contrabass', 0), ('B2', .1, 'cellos', -.2), ('G#3', .09, 'violas', .2)]: n(a, i, p, b - a, v, pan, attack=1.0, release=.6)
# ——— S10 Jesús alone: one lyre note (E), held, with a high E in the violins ———
n(H['solo'] + .1, 'harp', 'E4', 3.0, .36, 0); n(H['solo'] + .1, 'violins', 'E5', shot['S11'] - H['solo'] + .4, .1, .2, attack=.8, release=.8)
# ——— S11–S12 the echo and the way down: E major, G → G sharp in the violas, the climb phrase in major, the lyre ———
a = shot['S11']
n(a, 'violas', 'G4', .9, .12, .1, attack=.4, release=.3); n(a + .8, 'violas', 'G#4', DUR - a - .8, .12, .1, attack=.3, release=1.2)
for p, v, i, pan in [('E2', .16, 'contrabass', 0), ('B2', .14, 'cellos', -.2), ('E4', .1, 'violins', .25)]: n(a + .1, i, p, DUR - a, v, pan, attack=1.0, release=1.4)
tc = a + .4
for p, d in CLIMB_MAJ: n(tc, 'flute', p, d * .95, .24, -.15, attack=.1, release=.6); tc += d
for j, p in enumerate(['B4', 'G#4', 'E4']): n(H['pregunta'] + .15 + j * .45, 'harp', p, 2.4, .28, .25)
n(H['pregunta'] + 1.6, 'celesta', 'E6', 2.6, .18, -.1)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.6, mix=.26); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the two silences: everything goes to zero (after the reverb, so no tail is left)
quiet = env_lin([(0, 1), (S1a - .12, 1), (S1a + .04, 0), (S1b - .03, 0), (S1b, 1), (S2a - .12, 1), (S2a + .04, 0), (S2b - .03, 0), (S2b, 1), (DUR + 1, 1)])
music *= quiet[:, None]

# ——— foley (synthesised) ———
fx = np.zeros((N, 2))
def stepf(v=1., lo=300, hi=2400): d = .09; return norm(bp(noise(d), lo, hi) * np.minimum(1, t_(d) / .004) * np.exp(-t_(d) / .025)) * v
def tap(v=1.):   # card on rock: a short knock with a little paper click
    d = .12; x = t_(d); return norm(bp(noise(d), 400, 2400) * np.exp(-x / .012) + .8 * np.sin(2 * np.pi * 230 * x) * np.exp(-x / .03) + .3 * bp(noise(d), 3000, 7000) * np.exp(-x / .004)) * v
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def slide(d=1.2): x = t_(d); return norm(bp(noise(d), 500, 3000) * np.sin(np.pi * x / d) ** 1.2 * (1 + .25 * np.sin(2 * np.pi * 3 * x)))   # a long sheet of paper sliding
def cloth(d=.6): return norm(lp(bp(noise(d), 300, 3000), 2200) * np.sin(np.pi * t_(d) / d) ** 2)
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .35 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def chime(f=2400, d=1.2): x = t_(d); return norm((np.sin(2 * np.pi * f * x) + .4 * np.sin(2 * np.pi * f * 2.76 * x)) * np.exp(-x / (d * .35)) * np.minimum(1, x / .003))
def crackle(d):
    m = int(d * SR); x = np.zeros(m); idx = rng.integers(0, m, int(d * 40)); x[idx] = rng.uniform(-1, 1, len(idx)); return norm(bp(x, 800, 6000))
def bird(d=.5):
    x = t_(d); f = 2600 + 900 * np.sin(2 * np.pi * 7 * x); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)
def whoosh(d=.6): x = t_(d); return norm(bp(noise(d), 300, 2500) * np.sin(np.pi * x / d) ** 2)
def thud(): d = .25; x = t_(d); return norm(lp(noise(d), 500) * np.exp(-x / .04) + .6 * np.sin(2 * np.pi * 90 * x) * np.exp(-x / .06))
# wind: high and thin on the summit, on the slope with loose stones; it drops when the light comes; cold again in the fear; warm at the end
wind = bp(noise(DUR + 1), 220, 1600)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 5.3))
add(fx, wind * env_lin([(0, .4), (shot['S2'], .4), (shot['S2'] + .5, .9), (shot['S4'], .7), (H['luz'], .2), (S1a, .15), (S1b, .1), (V, 0), (shot['S8'] + .3, 0), (shot['S8'] + 1, .7), (S2a, .5), (S2b, .2), (shot['S10'], .25), (DUR + 1, .3)]) * db(-33), 0, 1, .15)
add(fx, paper(.6), .3, db(-36), 0)                                   # the title strip grows
add(fx, crackle(1.2) * np.exp(-t_(1.2) / .5)[:int(1.2 * SR)], .1, db(-40), 0)   # the fibre around the shape of light
add(fx, whoosh(.7), shot['S2'] - .35, db(-30), 0)                    # the mist curtain
# the climb: sandals on earth and gravel, cloth; loose stones
for bt in np.arange(shot['S2'] + .2, shot['S4'] - .2, .34): add(fx, stepf(.6, 300, 2500), bt, db(-36), .1); add(fx, stepf(.5, 300, 2500), bt + .17, db(-38), .15)
for tn in [shot['S2'] + 1.3, shot['S3'] + .8, shot['S3'] + 2.2]: add(fx, crackle(.25)[:int(.25 * SR)], tn, db(-38), -.2)
add(fx, cloth(.8), shot['S2'] + .5, db(-38), -.1)
# the light: a soft switch and a shimmer, one small bell per layer that warms
add(fx, shimmer(2.0, 1300), H['luz'] - .15, db(-30), 0)
for j in range(4): add(fx, chime(1800 * 2 ** (j / 5), 1.0), H['luz'] + .2 + j * .25, db(-38), -.3 + j * .2)
# Pedro gets up (cloth); three card taps as the three outlines appear
add(fx, cloth(.6), H['l06'] + .15, db(-34), -.1)
for j in range(3): add(fx, tap(.9), H['tiendas'] + .5 + j * .22, db(-30), -.3 + .3 * j)
# the cloud: the first sound after silence 1 is a long low breath of paper, then four long slides, one per sheet
add(fx, lp(slide(1.6), 900), S1b - .02, db(-30), 0)
for i in range(4): add(fx, slide(1.1), shot['S6'] + .15 + i * .5, db(-34), -.2 + .13 * i)
# the climax: one rising chime per sheet the light crosses; a long shimmer that runs over the cut (L-cut)
for i in range(4): add(fx, chime(1600 * 2 ** (i / 4), 1.4), V + i * .4, db(-35), -.3 + i * .2)
add(fx, shimmer(3.6, 900), AO - .3, db(-31), 0)
# the fear: three dull thumps of card on rock as they fall
for i in range(3): add(fx, thud(), H['temor'] + .25 + i * .18 + .17, db(-28), .2 - .2 * i)
# «Levantaos»: the hand on the shoulder (paper on paper), then cloth as Pedro lifts his head
add(fx, paper(.35), H['toca'] - .05, db(-33), .1); add(fx, cloth(.5), H['toca'] + .3, db(-36), 0)
# the cloud goes up: four slides; the first birds of dawn come in before the cut (J-cut)
for i in range(4): add(fx, slide(.9), shot['S10'] + .1 + i * .42, db(-36), .2 - .13 * i)
for tn in [shot['S10'] - .4, shot['S10'] + 1.6, shot['S11'] + .3, shot['S12'] + .4, H['pregunta'] + 1.5]: add(fx, bird(.45), tn, db(-39), .3 * (1 if rng.random() > .5 else -1))
# the way down: steps on gravel; Clawd turns his head (a tiny paper sound)
for bt in np.arange(shot['S12'] + .1, DUR - .3, .36): add(fx, stepf(.5, 300, 2500), bt, db(-38), -.15)
add(fx, paper(.3), H['pregunta'] + .3, db(-40), .2)
fx *= quiet[:, None]
tone = lp(brown(DUR + 1), 260)[:N]; tone *= db(-64) / rms(tone)   # room tone only: the silences stay real
fx += np.stack([tone, np.roll(tone, 977)], 1)

# ——— voice (clean: high-pass + gentle compression only) ———
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
# the score grows from the light to the climax («A él oíd») and settles at the end
music *= db(env_lin([(0, -1), (shot['S2'], -3), (shot['S4'], -2), (H['luz'], 0), (S1a, 0), (S1b, -1), (V, 1), (AO - .2, 3.5), (shot['S8'], 3), (shot['S8'] + .8, 0), (S2a, 0), (shot['S11'], 0), (shot['S11'] + .5, 1.5), (DUR + 1, 1)]))[:, None]
mix = music + fx * db(-1) + vo[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
def seg_db(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x))
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print(f'silence 1 {S1a + .15:.2f}-{S1b - .1:.2f}: {seg_db(S1a + .15, S1b - .1):.1f} dB   silence 2 {S2a + .15:.2f}-{S2b - .1:.2f}: {seg_db(S2a + .15, S2b - .1):.1f} dB')
print(f'before s1 {seg_db(S1a - 1.2, S1a - .2):.1f} dB   climb {seg_db(shot["S2"], shot["S4"]):.1f} dB   climax {seg_db(AO - .5, AO + 1.2):.1f} dB   whole {seg_db(0, DUR):.1f} dB')
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
