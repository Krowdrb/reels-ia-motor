"""La mujer samaritana: original score + noon ambience + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
Score: D dorian at noon (recorder, harp, low strings), D major from the climax on "soy". Two real silences (sil1 after "agua viva", sil2 after "Mesías"):
music, ambience and foley are gated to zero there, reverb tails included. Prints the level measured inside each silence."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, lp, hp, noise, brown, norm, t_, env_exp, whoosh, thump, limit, clack
from scipy.ndimage import uniform_filter1d, maximum_filter1d

TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
H, L, DUR = TL['HIT'], TL['L'], TL['DUR']
N = int(DUR * SR) + SR
tt = np.arange(N) / SR
S.seed(11); rng = np.random.default_rng(4)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
SIL = [(H['sil1'], H['marido']), (H['sil2'], H['soy'])]   # (voice ends, voice starts again)
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))

# ——— S1 hook: a low cello pedal on D, the recorder says the motif (D–F–E–A) ———
n(.05, 'contrabass', 'D2', shot['S3'] + .2, .2, 0, attack=1.2, release=.8)
n(.05, 'cellos', 'D3', shot['S3'] + .2, .2, -.2, attack=1.0, release=.8)
for tn, p, d in [(.55, 'D5', .8), (1.4, 'F5', .5), (1.95, 'E5', .9), (2.9, 'A5', 1.6)]: n(tn, 'recorder', p, d, .36, .2, attack=.05)
# ——— S2 the sun: sparse harp in D dorian ———
for tn, p in [(shot['S2'] + .2, 'D3'), (shot['S2'] + .9, 'A3'), (H['l02'] + 1.6, 'E4'), (H['mediodia'], 'F4'), (H['mediodia'] + .9, 'C4'), (H['aqui'], 'D4'), (H['aqui'] + .7, 'A3')]: n(tn, 'harp', p, 1.8, .32, -.25)
# ——— S3–S4 arrival: the recorder answers, the harp keeps a slow pulse, a soft viola pedal ———
beat = 60 / 66
a, b = shot['S3'], shot['S5'] - .2
k = 0; tc = a
pat = ['D3', 'A3', 'D4', 'E4', 'F4', 'E4', 'D4', 'A3']
while tc < b: n(tc, 'harp', pat[k % 8] if (tc - a) < 3.6 else ['B2', 'F#3', 'B3', 'D4', 'E4', 'D4', 'B3', 'F#3'][k % 8].replace('F#', 'F'), 1.2, .26, -.2); tc += beat / 2; k += 1
for tn, p, d in [(H['beber'] + 1.4, 'A4', .5), (H['beber'] + 1.9, 'G4', .5), (H['beber'] + 2.4, 'F4', .9), (H['tratan'] + 1.6, 'E4', .5), (H['tratan'] + 2.1, 'D4', 1.4)]: n(tn, 'recorder', p, d, .3, .25, attack=.06)
n(a, 'violas', 'A3', b - a, .16, .1, attack=1.4, release=.6)
# ——— S5 the shaft: low strings step down (D–C–B–A); on "agua viva" one bowed vibraphone note (A4) ———
a = shot['S5']
for j, p in enumerate(['D3', 'C3', 'B2', 'A2']): n(a + j * .85, 'cellos', p, .95, .3, -.1, attack=.15, release=.3)
n(a, 'contrabass', 'D2', H['sil1'] - a, .22, 0, attack=.6, release=.2)
n(H['agua'] - .1, 'vibraphone_bowed', 'A4', 2.0, .5, .1)
# ——— silence 1: nothing (gated below) ———
# ——— S7 "marido": the voice alone first, then cellos on D and the recorder, very soft, unresolved ———
a = H['marido'] + 1.3
n(a, 'cellos', 'D3', shot['S8'] - a + .3, .22, -.2, attack=1.6, release=.6)
n(a + 1.0, 'contrabass', 'D2', shot['S8'] - a, .16, 0, attack=1.6, release=.6)
for tn, p, d in [(H['cinco'] + .3, 'F4', 1.0), (H['cinco'] + 1.3, 'E4', 1.4), (H['l10b'] + 1.4, 'G4', 1.2)]: n(tn, 'recorder', p, d, .26, .25, attack=.08)
# ——— S8 the mount: violas and harp arpeggio enter; the motif climbs a fourth; growing toward the climax ———
a, b = shot['S8'], H['sil2']
k = 0; tc = a + .2
while tc < b - .3:
    ch = [['G2', 'D3', 'G3', 'Bb3'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'A3', 'D4', 'F4'], ['A2', 'E3', 'A3', 'C4']][int((tc - a) // (beat * 2)) % 4]
    ch = [p.replace('Bb3', 'B3') for p in ch]   # dorian: B natural
    n(tc, 'harp', ch[[0, 1, 2, 3, 2, 1][k % 6]], 1.1, .26 + .1 * (tc - a) / (b - a), -.2); tc += beat / 3; k += 1
for p, v, i in [('D3', .2, 'violas'), ('A3', .2, 'violas'), ('D3', .24, 'cellos'), ('F4', .16, 'violins')]: n(a + .4, i, p, b - a - .35, v, 0, attack=1.8, release=.15)
for tn, p, d in [(H['verdad'] + .3, 'G5', .8), (H['verdad'] + 1.1, 'B4', .5), (H['verdad'] + 1.6, 'A4', 1.0), (H['mesias'] + .2, 'D5', .6), (H['mesias'] + .8, 'C5', 1.0)]: n(tn, 'recorder', p, d, .32, .2, attack=.05)
# ——— silence 2: nothing ———
# ——— S10 climax: a drop in the well, then bowed vibraphone and hand chimes up the ladder (one per course), and on "soy" the strings and horn open in D major ———
T = H['soy']
for i, p in enumerate(['D5', 'F#5', 'A5']): n(T - .1 + i * .35, 'vibraphone_bowed', p, 2.4, .42, -.2 + i * .2); n(T - .1 + i * .35, 'hand_chimes', p, 2.0, .3, .2 - i * .2)
X = T + .5
for p, v, i, pan in [('D2', .5, 'contrabass', 0), ('D3', .52, 'cellos', -.3), ('A3', .48, 'violas', -.1), ('D4', .48, 'violas', .1), ('F#4', .48, 'violins', .2), ('A4', .48, 'violins', .3), ('D5', .44, 'violins', .25)]:
    n(X, i, p, 3.4, v, pan, attack=.25, release=1.6)
for p, v in [('D4', .4), ('A3', .36)]: n(X + .05, 'horn', p, 3.0, v, 0, attack=.4, release=1.4)
n(X, 'hand_chimes', 'D6', 2.6, .36, .1); n(X + .02, 'celesta', 'A5', 2.4, .3, -.1); n(X + .04, 'celesta', 'D6', 2.4, .3, .15)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5']): n(X - .3 + j * .04, 'harp', p, 2.0, .4, .15)
# ——— S11 the jar left behind: harp in eighths and recorder in D major; one frame-drum stroke on "corre" ———
a, b = shot['S11'] + .4, shot['S12'] + .4
k = 0; tc = a
while tc < b: n(tc, 'harp', ['D3', 'A3', 'D4', 'F#4', 'A4', 'F#4', 'D4', 'A3'][k % 8] if (tc - a) < 2 * beat * 2 else ['G3', 'D4', 'G4', 'B4', 'D5', 'B4', 'G4', 'D4'][k % 8], 1.0, .3, -.2); tc += beat / 2; k += 1
for p, v, i in [('D3', .24, 'cellos'), ('A3', .2, 'violas'), ('F#4', .16, 'violins')]: n(shot['S11'] + .2, i, p, b - shot['S11'], v, 0, attack=1.0, release=1.0)
for tn, p, d in [(H['vengan'] - .3, 'A5', .5), (H['vengan'] + .2, 'B5', .5), (H['vengan'] + .7, 'A5', .5), (H['vengan'] + 1.2, 'F#5', 1.1)]: n(tn, 'recorder', p, d, .32, .2, attack=.05)
# ——— S12 the town comes down; the recorder closes the motif resolved (D–F#–A–D); the harp alone under the question ———
a = shot['S12'] + .3
for p, v, i in [('D2', .2, 'contrabass'), ('D3', .24, 'cellos'), ('A3', .2, 'violas'), ('F#4', .16, 'violins')]: n(a, i, p, H['cta'] - a + .3, v, 0, attack=1.4, release=1.8)
for tn, p, d in [(H['creyeron'] + .3, 'D5', .6), (H['creyeron'] + .9, 'F#5', .6), (H['creyeron'] + 1.5, 'A5', .6), (H['creyeron'] + 2.1, 'D6', 1.8)]: n(tn, 'recorder', p, d, .3, .2, attack=.05)
for j, p in enumerate(['D3', 'A3', 'F#4', 'D4', 'A4', 'F#4', 'D4', 'A3', 'D3', 'A3', 'F#4', 'A4']): n(H['cta'] - .2 + j * beat / 2, 'harp', p, 1.4, .28, -.1)
n(H['cta'] + .6, 'celesta', 'F#5', 2.6, .26, .2); n(DUR - 1.6, 'harp', 'D3', 1.6, .3, 0)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.5, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

# ——— foley and ambience (synthesised) ———
fx = np.zeros((N, 2))
def cicadas(d, seed=0):
    r = np.random.default_rng(seed); x = t_(d); out = np.zeros_like(x)
    for f0, rate, ph in [(4300, 47, 0), (5200, 53, 1.3), (3800, 41, 2.1)]:
        carrier = bp(r.standard_normal(len(x)), f0 * .85, f0 * 1.15)
        pulse = (np.sin(2 * np.pi * rate * x + ph) > .2).astype(float)
        swell = .5 + .5 * np.sin(2 * np.pi * x / (5 + r.random() * 3) + ph) ** 2
        out += carrier * uniform_filter1d(pulse, 60) * swell
    return norm(out)
def drip(v=1.): d = .5; x = t_(d); return norm(np.sin(2 * np.pi * (700 + 1100 * np.minimum(x, .05) / .05) * x) * env_exp(d, .045)) * v
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def cloth(d=.5): return norm(bp(noise(d), 600, 3500) * np.sin(np.pi * t_(d) / d) ** 2)
def stepd(v=1.): d = .12; return norm(lp(noise(d), 900) * env_exp(d, .02) + bp(noise(d), 1500, 5000) * env_exp(d, .006) * .4) * v
def clay(v=1.): d = .35; x = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * x) * env_exp(d, tau) for f, a, tau in [(310, 1, .06), (720, .6, .035), (1180, .35, .02)]) + lp(noise(d), 1500) * env_exp(d, .01)) * v
def wood(v=1.): d = .3; x = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * x) * env_exp(d, tau) for f, a, tau in [(180, 1, .05), (410, .7, .03), (860, .3, .015)]) + bp(noise(d), 800, 3000) * env_exp(d, .005)) * v
def rope(d=.6):
    x = t_(d); saw = 2 * ((x * (60 + 25 * np.sin(x * 7))) % 1) - 1; return norm(bp(saw, 350, 1800) * np.abs(np.sin(2 * np.pi * 11 * x)) ** 3 * np.sin(np.pi * x / d))
def bird(v=1.):
    d = .5; x = t_(d); out = np.zeros_like(x)
    for s0 in (0, .16, .3):
        m = (x >= s0) & (x < s0 + .09); xx = x[m] - s0; out[m] += np.sin(2 * np.pi * (3200 + 1800 * np.sin(np.pi * xx / .09)) * xx) * np.sin(np.pi * xx / .09)
    return out * v

C = cicadas(DUR + 1, 3)[:N]
add(fx, C * env_lin([(0, .8), (shot['S2'], .9), (shot['S5'] - .2, .9), (shot['S5'] + 1.6, .12), (H['sil1'], .12), (H['marido'], 0), (H['marido'] + 1.0, 0), (H['marido'] + 2.0, .45), (shot['S8'], .45), (shot['S8'] + 2, .2), (H['sil2'], .15), (DUR + 1, 0)]) * db(-33), 0, 1, .15)
wind = bp(noise(DUR + 1), 180, 1400)[:N] * (.55 + .45 * np.sin(2 * np.pi * tt / 6.3) ** 2)
add(fx, wind * env_lin([(0, .5), (shot['S5'], .5), (shot['S5'] + .5, 0), (H['marido'] + 1, 0), (H['marido'] + 2, .4), (shot['S8'], .5), (shot['S8'] + 1.5, .9), (H['sil2'], .9), (shot['S11'], 0), (shot['S11'] + .5, .7), (DUR + 1, .6)]) * db(-33), 0, 1, -.1)
hollow = lp(brown(DUR + 1), 260)[:N]
add(fx, hollow * env_lin([(0, 0), (shot['S5'] - .4, 0), (shot['S5'] + .2, 1), (H['sil1'], 1), (H['sil1'] + .01, 0), (DUR + 1, 0)]) * db(-31), 0, 1, 0)
murmur = sum(bp(noise(DUR + 1), f * .8, f * 1.25)[:N] * (.5 + .5 * np.sin(2 * np.pi * tt * r + f) ** 2) for f, r in [(320, 1.7), (520, 2.3), (900, 3.1), (1400, 2.7)])
add(fx, norm(murmur) * env_lin([(0, 0), (shot['S12'] - .5, 0), (shot['S12'] + 1.5, .8), (H['cta'], .6), (DUR, .3), (DUR + 1, .3)]) * db(-31), 0, 1, -.2)
add(fx, paper(.6), .3, db(-32), .2); add(fx, paper(.5), 3.0, db(-36), -.2)
for j, ts in enumerate(np.arange(.6, shot['S2'], .62)): add(fx, stepd(), ts, db(-42), -.4)
for j, ts in enumerate(np.arange(H['mediodia'] + .4, H['aqui'] - .1, .5)): add(fx, stepd(), ts, db(-38), .35)
add(fx, cloth(.6), H['aqui'] - .05, db(-33), .3)
for ts in np.arange(shot['S3'] + .1, H['beber'] - .8, .5): add(fx, stepd(), ts, db(-35), -.3)
add(fx, clay(), H['beber'] - .38, db(-24), -.15)
add(fx, rope(.7), shot['S5'] + .5, db(-35), .1)
add(fx, drip(), shot['S5'] + 1.2, db(-31), 0); add(fx, drip(.8), H['agua'] + .05, db(-29), 0)
add(fx, clay(.6), H['marido'] + 1.5, db(-36), -.2); add(fx, cloth(.5), H['l09'] + .25, db(-37), -.2)
add(fx, paper(.5), H['verdad'] - .4, db(-34), -.3)
# climax: a drop in the well first, then the switch click and a rising shimmer; chimes ride the burst
add(fx, drip(), T + .02, db(-26), 0)
add(fx, clack(.7, .8), T + .02, db(-36), 0)
add(fx, shimmer(2.0, 900), T + .1, db(-29), 0); add(fx, whoosh(1.2), T + .2, db(-30), 0)
for ts in np.arange(H['cantaro'] + .4, H['vengan'], .24): add(fx, stepd(.8), ts, db(-34 - 8 * (ts - H['cantaro']) / (H['vengan'] - H['cantaro'])), .2)
add(fx, wood(), H['vengan'] + .05, db(-34), .3)
n_drum = S.hit('frame_drum', None, .55); add(fx, n_drum, H['cantaro'] + .9, db(-24), 0)
for ts in np.arange(shot['S12'], DUR - .5, .21): add(fx, stepd(.4 + .4 * rng.random()), ts + rng.random() * .1, db(-40), rng.random() - .5)
for ts, pan in [(shot['S12'] + 1.2, .4), (H['l17'] + 1.1, -.3), (H['cta'] + 2.4, .3)]: add(fx, bird(), ts, db(-38), pan)
add(fx, paper(.25), H['cta'] + .05, db(-34), -.1)

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
# the score grows toward the climax: a slow crescendo through S7–S8, the peak on "soy", calmer after
music *= env_lin([(0, .9), (shot['S7'], .75), (shot['S8'], .95), (H['sil2'], 1.25), (T, 1.0), (T + .5, 1.6), (T + 2.5, 1.35), (shot['S11'], 1.0), (DUR + 1, .95)])[:, None]
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-6 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
# the two silences: music, ambience and foley cut for real (tails included), fast 40 ms edges
gate = np.ones(N)
for a, b in SIL:
    gate *= 1 - env_lin([(0, 0), (a + .02, 0), (a + .06, 1), (b - .04, 1), (b, 0), (DUR + 1, 0)])
room_tone = lp(brown(DUR + 1), 400)[:N]; room_tone *= db(-62) / rms(room_tone)   # the lamp switched off: only a faint room tone stays
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
