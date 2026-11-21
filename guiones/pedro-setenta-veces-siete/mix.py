"""La deuda perdonada — original score (harp, strings, flute, clarinet, glass, hand chimes, celesta = glockenspiel, horn, one frame drum stroke) + foley + narration
from timeline.json -> out/mix.wav. D dorian in the house and the debt, D major at the pardon (S7), D minor in the street and the judgment, D major at dawn.
The harp counts: one note per paw in S1 (rising up the scale), then the count speeds up and falls apart in a glissando (S2); the scale comes back whole,
slow and resolved at dawn (S12). The music grows to the climax in S7. Both silences are real (gated). Run with the library's .venv python after tools/timeline.py."""
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
S.seed(18); rng = np.random.default_rng(35)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
SIL1 = (H['sil1'] + .05, H['l07'] - .05)     # after «Ten paciencia conmigo» -> «El rey, compadecido»
SIL2 = (H['sil2'] + .05, H['l11'] - .05)     # after «Y lo echa a la cárcel» -> «El rey: …»
TAPS = [H[f'tap{k}'] for k in range(1, 8)]
FAST = [H[f'fast{k}'] for k in range(1, 8)]
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))

# ——— the house at night (S1): contrabass pedal on D; the harp counts one note per paw, up the D dorian scale ———
DOR = ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
n(.0, 'contrabass', 'D2', shot['S3'] + .4, .26, 0, attack=.4, release=.6)
for tk, p in zip(TAPS, DOR): n(tk - .01, 'harp', p, 1.6, .4, -.15 + .05 * DOR.index(p))
n(H['siete1'] + .3, 'harp', 'D5', 2.2, .3, .2)
n(1.0, 'clarinet', 'A3', 1.6, .2, -.2, attack=.3, release=.5)
# ——— «setenta veces siete» (S2): the count goes on, faster, out of step… and falls apart in a glissando; a low flute when Clawd sits ———
for tk, p in zip(FAST, ['D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6']): n(tk - .01, 'harp', p, 1.0, .36, .25)
for j, p in enumerate(['C6', 'A5', 'G5', 'F5', 'E5', 'C5', 'A4', 'G4', 'F4', 'D4', 'C4', 'A3', 'F3', 'D3']): n(H['siete2'] + .02 + j * .035, 'harp', p, 1.4, .3 - .012 * j, .2 - .03 * j)
n(H['rinde'] + .45, 'flute', 'D4', shot['S3'] - H['rinde'] + .3, .3, .1, attack=.15, release=.6)
n(H['rinde'] + .5, 'cellos', 'F3', shot['S3'] - H['rinde'] + .4, .2, -.1, attack=.6, release=.5)
# ——— the flame (S3): rubbed glass grows with the light; the pedal moves from D to A ———
n(shot['S3'] - .2, 'glass', 'A4', shot['S4'] - shot['S3'] + .6, .3, 0, attack=1.0, release=.6)
n(shot['S3'], 'contrabass', 'A1', shot['S4'] - shot['S3'] + .3, .24, 0, attack=.6, release=.3)
for j, p in enumerate(['A3', 'D4', 'E4', 'A4']): n(H['historia'] - .2 + j * .18, 'harp', p, 1.6, .26, -.1 + j * .1)
# ——— the hall (S4): a low clarinet, two long notes; cellos pedal ———
a = shot['S4']
for j, (p, d) in enumerate([('D3', 1.0), ('F3', 1.6)]): n(a + .1 + j * 1.0, 'clarinet', p, d, .28, -.15, attack=.25, release=.5)
for p, i in [('D2', 'contrabass'), ('A2', 'cellos')]: n(a, i, p, shot['S5'] - a + .4, .24, 0, attack=.8, release=.4)
# ——— the mountain (S5): cellos and contrabass climb with the crane, unresolved ———
a = shot['S5']
for j, p in enumerate(['D3', 'E3', 'F3', 'G3']): n(a + j * .85, 'cellos', p, .95, .26 + .02 * j, -.15, attack=.15, release=.25)
for j, p in enumerate(['D2', 'E2', 'F2', 'G2']): n(a + j * .85, 'contrabass', p, .95, .26 + .02 * j, .0, attack=.15, release=.25)
n(a + .2, 'violas', 'A3', shot['S6'] - a, .2, .2, attack=1.2, release=.4)
# ——— the plea (S6): everything goes down toward the silence ———
a = shot['S6']
n(a, 'clarinet', 'A3', 1.6, .24, -.1, attack=.2, release=.6); n(a + 1.5, 'clarinet', 'G3', 1.4, .2, -.1, attack=.2, release=.8)
n(a, 'contrabass', 'D2', SIL1[0] - a - .4, .2, 0, attack=.6, release=.4)
n(H['paciencia'] - .1, 'glass', 'D5', SIL1[0] - H['paciencia'] - .2, .16, 0, attack=.5, release=.5)
# ——— the pardon (S7): one harp note alone with the voice; on «perdona» the chimes climb one note per heap and the harp sweeps up;
#     on «deuda» the whole D major opens (strings, horn, one frame-drum stroke, celesta) ———
n(H['l07'] + .02, 'harp', 'D3', 2.6, .36, 0)
for p in ['D3', 'A3']: n(H['compadecido'] - .1, 'violas', p, H['perdona'] - H['compadecido'] + .3, .2, 0, attack=.9, release=.3)
Pd, Dd = H['perdona'], H['deuda']
for j, p in enumerate(['D5', 'F#5', 'A5', 'D6', 'F#6']): n(Pd + j * .22, 'hand_chimes', p, 2.2, .34, -.3 + j * .15)
for j, p in enumerate(['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5']): n(Pd - .05 + j * .05, 'harp', p, 2.0, .34, .1)
for p, v, i in [('A3', .26, 'violas'), ('D4', .26, 'violins'), ('F#4', .26, 'violins')]: n(Pd + .1, i, p, Dd - Pd, v, 0, attack=.7, release=.1)
for p, v, i, pan in [('D2', .42, 'contrabass', 0), ('D3', .42, 'cellos', -.3), ('A3', .4, 'violas', -.1), ('D4', .4, 'violas', .1), ('F#4', .4, 'violins', .2), ('A4', .4, 'violins', .3), ('D5', .36, 'violins', .25)]:
    n(Dd, i, p, 3.0, v, pan, attack=.08, release=1.6)
for p in ['D3', 'A3', 'F#3']: n(Dd + .05, 'horn', p, 2.6, .32, 0, attack=.3, release=1.2)
n(Dd, 'frame_drum', 'small', 1.5, .5, 0)
for j, p in enumerate(['D6', 'A5', 'F#5']): n(Dd + .03 + j * .02, 'glockenspiel', p, 2.2, .28, .2)
# ——— the street (S8–S9): the gold strings run over the cut (L-cut) and stop dead on the grab; a low clarinet in D minor; a lone low flute ———
A_ = H['ahoga']
n(A_ + .4, 'clarinet', 'D3', 1.6, .26, -.1, attack=.2, release=.5); n(A_ + 2.0, 'clarinet', 'F3', 1.4, .24, -.1, attack=.2, release=.5)
n(A_ + 3.0, 'clarinet', 'E3', 1.2, .22, -.1, attack=.2, release=.6)
n(A_ + .3, 'contrabass', 'D2', shot['S9'] - A_, .2, 0, attack=.8, release=.4)
n(shot['S9'] + .2, 'flute', 'A3', 1.8, .26, .15, attack=.15, release=.6)
# ——— the prison (S10): contrabass and cellos go down; nothing resolves ———
a = shot['S10']
for j, (p, q) in enumerate([('A2', 'D3'), ('G2', 'C3'), ('F2', 'Bb2')]): n(a + j * .75, 'contrabass', p, .8, .26, 0, attack=.1, release=.3); n(a + j * .75, 'cellos', q, .8, .22, -.2, attack=.1, release=.3)
n(a + 2.25, 'cellos', 'A2', max(.3, SIL2[0] - a - 2.6), .2, -.2, attack=.1, release=.25)
# ——— the judgment (S11): the voice alone first, a cold glass note under it; one low horn on «Enojado»; falling cellos on «entrega» ———
n(H['l11'] + .3, 'glass', 'A4', H['l12'] - H['l11'], .22, 0, attack=1.0, release=.6)
n(H['l12'] + .05, 'horn', 'D3', 1.8, .3, 0, attack=.15, release=.8)
for j, p in enumerate(['D3', 'C3', 'Bb2', 'A2']): n(H['entrega'] + j * .5, 'cellos', p, .6, .26, -.1, attack=.1, release=.3)
n(H['entrega'], 'contrabass', 'D2', shot['S12'] - H['entrega'] + .3, .22, 0, attack=.4, release=.5)
# ——— dawn (S12): the harp's scale again, whole, slow, resolved in D major; low strings; the harp alone under the question ———
a = shot['S12'] + .3
for j, p in enumerate(['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5']): n(a + j * .42, 'harp', p, 2.4, .32, -.2 + j * .05)
for p, v, i in [('D2', .2, 'contrabass'), ('D3', .2, 'cellos'), ('A3', .18, 'violas'), ('F#4', .14, 'violins')]: n(a - .2, i, p, H['cta'] - a + .5, v, 0, attack=1.2, release=1.0)
n(H['contar'] + .05, 'glockenspiel', 'A5', 2.2, .2, .2)
for j, p in enumerate(['D4', 'A4', 'F#4', 'D5']): n(H['cta'] + .1 + j * .55, 'harp', p, 2.6, .28, -.1 + j * .07)
n(H['cta'] + 2.4, 'harp', 'D3', 2.4, .24, 0)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.5, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the music grows toward the climax (S7), then the street is cut dry on the grab
grow = env_lin([(0, .8), (shot['S4'], .8), (shot['S6'], .85), (H['perdona'], 1.0), (H['deuda'], 1.25), (H['ahoga'] - .05, 1.05), (H['ahoga'] + .08, .55), (shot['S11'], .7), (shot['S12'], .85), (DUR + 1, .85)])
music *= grow[:, None]

# ——— foley ———
fx = np.zeros((N, 2))
def bed(src, pts, g, pan=0.): add(fx, src[:N] * env_lin(pts), 0, db(g), pan)
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def tap(v=1.): d = .07; x = t_(d); return norm(bp(noise(d), 500, 3500) * np.exp(-x / .012) + .6 * np.sin(2 * np.pi * 180 * x) * np.exp(-x / .02)) * v
def step(v=1.): d = .14; return norm(bp(noise(d), 250, 2200) * np.sin(np.pi * t_(d) / d) ** 2) * v
def cloth(d=.5): return norm(bp(noise(d), 600, 4000) * np.sin(np.pi * t_(d) / d) ** 2)
def coin(f=2400, v=1.): d = .25; x = t_(d); return norm((np.sin(2 * np.pi * f * x) + .4 * np.sin(2 * np.pi * f * 2.7 * x)) * np.exp(-x / .05) * (1 + .2 * bp(noise(d), 2000, 8000))) * v
def wood(d=.5):
    x = t_(d); return norm(bp(np.sign(np.sin(2 * np.pi * (90 + 40 * np.sin(x * 7)) * x)), 300, 1800) * np.sin(np.pi * x / d))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def bird(): d = .3; x = t_(d); return norm(np.sin(2 * np.pi * (3000 + 700 * np.sin(x * 55)) * x) * np.sin(np.pi * x / d) ** 2)
def cricket(): d = .18; x = t_(d); return norm(np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 30 * x) > 0) * np.sin(np.pi * x / d))
# night house: crickets far away, the hiss of the wick (J-cut of the hall's echo before S4)
for tn in np.arange(.3, shot['S4'], .9): add(fx, cricket(), tn + rng.random() * .3, db(-44), .4 * (rng.random() - .5))
wick = bp(noise(DUR + 1), 2500, 7000)[:N] * (.6 + .4 * np.abs(np.sin(2 * np.pi * tt * 2.3)))
bed(wick, [(0, .5), (shot['S3'], .5), (shot['S4'] - .3, 1.3), (shot['S4'] + .3, 0), (shot['S12'], 0), (DUR + 1, 0)], -42, 0)
echo = lp(brown(DUR + 1), 400)[:N]
bed(echo, [(0, 0), (shot['S4'] - .4, 0), (shot['S4'], .8), (SIL1[0] - .5, .4), (SIL1[0], 0), (shot['S8'], 0), (shot['S11'] + .4, 0), (shot['S11'] + 1, .5), (shot['S12'] - .2, .5), (shot['S12'], 0), (DUR + 1, 0)], -36, 0)
wind = bp(noise(DUR + 1), 200, 1400)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 3.7))
bed(wind, [(0, 0), (shot['S8'], 0), (shot['S8'] + .4, .9), (shot['S10'] + 1, .7), (SIL2[0] - .3, 0), (DUR + 1, 0)], -33, .1)
# the seven taps of Clawd's paws (the number made sound: louder than the rest of the foley), and the broken count
for tk in TAPS: add(fx, tap(), tk, db(-22), .1)
for j, tk in enumerate(FAST): add(fx, tap(.8), tk, db(-25), .15); add(fx, tap(.5), tk + .04 + .02 * j, db(-30), -.1)
add(fx, thump(.15), H['rinde'] + .9, db(-30), 0)                        # he sits back
add(fx, paper(.6), .1, db(-36), .2)                                      # the title
add(fx, whoosh(1.2), shot['S4'] - .7, db(-32), 0); add(fx, shimmer(1.5, 1300), shot['S4'] - .8, db(-36), 0)   # the flame opens into the hall
for j in range(3): add(fx, step(.7), shot['S4'] + .3 + j * .45, db(-38), .3)
add(fx, cloth(.5), shot['S4'] + .6, db(-38), -.2)
for j in range(3): add(fx, coin(1800 + 300 * j, .5), shot['S5'] + .4 + j * .9, db(-38), -.3)
add(fx, paper(1.0), shot['S5'] + .2, db(-38), -.2)
add(fx, cloth(.6), H['rodillas'] - .1, db(-34), .1); add(fx, thump(.12), H['rodillas'] + .45, db(-38), .1)
for j in range(5): add(fx, paper(.5), H['perdona'] + j * .22, db(-28), [-.3, -.15, 0, .15, .3][j])   # the heaps sliding away
add(fx, wood(.6), H['perdona'] + .05, db(-32), .1)                       # the shutters
add(fx, whoosh(1.0), H['deuda'] - .1, db(-30), 0)
for tn in np.arange(shot['S8'] + .1, H['ahoga'] - .1, .38): add(fx, step(), tn, db(-34), .1)
add(fx, cloth(.25), H['ahoga'], db(-26), .1); add(fx, thump(.14), H['ahoga'] + .6, db(-32), .1)
for j in range(3): add(fx, coin(2200 + 250 * j, .45), shot['S9'] + .3 + j * .16, db(-36), .2)
add(fx, paper(1.0), H['pagame'] + .35, db(-29), .2); add(fx, thump(.2), H['carcel'] - .02, db(-24), 0)      # the grille slides and shuts
for tn in np.arange(H['carcel'], SIL2[0] - .3, .4): add(fx, step(.6), tn, db(-38), .3)
add(fx, wood(.6), H['entrega'] - .05, db(-32), .1)
for tn in np.arange(H['entrega'] + .3, shot['S12'] - .2, .5): add(fx, step(.6), tn, db(-38), .35)
for j in range(4): add(fx, bird(), shot['S12'] - .5 + j * 1.6, db(-40), .3 - j * .2)                  # dawn (J-cut)
for j in range(2): add(fx, thump(.08), H['contar'] + j * .07, db(-30), [-.1, .1][j])                  # two paws on the floor
add(fx, tap(.7), H['cta'] + .15, db(-32), -.1)

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
