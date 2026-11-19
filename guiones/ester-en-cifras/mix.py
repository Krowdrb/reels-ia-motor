"""Ester en cifras: original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
Harp, strings, oboe, flute and celesta (glockenspiel samples) in D Phrygian dominant (re-mi♭-fa#-sol-la), the colour of a Persian court without quoting any tune;
it only resolves to D major when Esther touches the sceptre. The oboe motif of Esther is la-sol-fa# (descending), and resolved re-fa#-la at the end.
The score grows to the climax («y Ester toca la punta», ~37.1 s); two real silences: after «que perezca» (S7) and after «y entra» (S9).
One tubular bell, on «cetro». Timpani always with a note ('D3'). The voice is in front and untouched (only a rumble high-pass and its level).
Loudness to -14 LUFS is done by core/render/mux.sh."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, lp, hp, noise, brown, norm, t_, whoosh, limit
from scipy.ndimage import uniform_filter1d, maximum_filter1d

TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
H, L, DUR = TL['HIT'], TL['L'], TL['DUR']
N = int(DUR * SR) + SR
tt = np.arange(N) / SR
S.seed(23); rng = np.random.default_rng(11)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
S1a, S1b = H['sil1'], H['l08']          # silence 1: end of «que perezca» -> «Al tercer día»
S2a, S2b = H['sil2'], H['cetro']        # silence 2: end of «y entra» -> the bell on «cetro» (the voice «El rey extiende el…» speaks over the stillness)
X = H['toca']                           # the climax
B = 1.0                                 # one beat at 60 bpm
def motif(t0, notes, v=.3, pan=.15, step=.55):
    for j, p in enumerate(notes): n(t0 + j * step, 'oboe', p, step * (1.7 if j == len(notes) - 1 else .95), v, pan, attack=.05, release=.4)

# ——— S1 the terrace (127): harp ostinato in D Phrygian dominant from second 0, low drone; the oboe motif on «ciento veintisiete» ———
OST = ['D3', 'A3', 'D4', 'Eb4', 'F#4', 'Eb4', 'D4', 'A3']
for p, v, i, pan in [('D2', .2, 'contrabass', 0), ('A2', .16, 'cellos', -.2)]: n(0, i, p, shot['S3'] + .3, v, pan, attack=.5, release=.8)
tc, k = .02, 0
while tc < shot['S3'] - .25: n(tc, 'harp', OST[k % 8], 1.2, .24 + .05 * (k % 4 == 0), -.2); tc += B / 2; k += 1
motif(H['ciento27'], ['A5', 'G5', 'F#5'], .3)
n(H['no_puede'] + .5, 'glockenspiel', 'Eb6', 1.8, .12, .3)
# ——— S2 the corridor: the harp goes on; a soft timpani D3 every two beats (one per pair of columns); it stops on «muere» ———
tc = shot['S2'] + .1
while tc < H['muere'] - .1: n(tc, 'timpani', 'D3', 1.6, .16, 0); tc += 2 * B
n(H['muere'], 'timpani', 'D3', 2.2, .24, 0)
for p, v, i, pan in [('F#3', .12, 'violas', -.1), ('A3', .11, 'violas', .1)]: n(shot['S2'], i, p, shot['S3'] - shot['S2'], v, pan, attack=1.0, release=.4)
# ——— S3 the slit: the harp stops; one long string note; the celesta glint on «oro» ———
for p, v, i, pan in [('D3', .17, 'cellos', -.2), ('A3', .14, 'violas', 0), ('Eb4', .12, 'violins', .2)]: n(shot['S3'], i, p, shot['S4'] - shot['S3'] + .5, v, pan, attack=.8, release=.6)
for j, p in enumerate(['A6', 'D7']): n(H['cetro1'] + j * .09, 'glockenspiel', p, 2.2, .2, .2)
# ——— S4 the room (30): the oboe motif comes back with every new day, faster and faster up to «treinta» ———
T4, tr = shot['S4'], H['treinta']
days = [T4 + (j / 6) ** (2 / 3) * (tr - T4) for j in range(1, 7)]
for j, d in enumerate(days[:5]): motif(d - .05, ['A5', 'G5', 'F#5'][: 3 if j < 3 else 2], .22 + .015 * j, .1, step=max(.18, .5 - .07 * j))
n(tr, 'harp', 'D4', 1.6, .3, 0); n(tr + .02, 'harp', 'A4', 1.6, .26, .1)
for p, v, i, pan in [('D3', .14, 'cellos', -.2), ('A3', .12, 'violas', .1)]: n(T4, i, p, shot['S5'] - T4 + .3, v, pan, attack=.8, release=.5)
# ——— S5 the decree: a low cello drone comes in underneath; the harp thins ———
for p, v, i, pan in [('D2', .24, 'contrabass', 0), ('D3', .2, 'cellos', -.2), ('Eb3', .13, 'cellos', .2)]: n(shot['S5'] - .2, i, p, shot['S6'] - shot['S5'] + .6, v, pan, attack=1.0, release=.6)
n(H['pueblo'] - .05, 'timpani', 'D3', 2.0, .2, 0)
# ——— S6 two heights: the harp alone; the motif a third higher on «para esta hora» ———
tc = shot['S6'] + .1
while tc < shot['S7'] - .3: n(tc, 'harp', ['D4', 'A3', 'F#4', 'A3'][int((tc - shot['S6']) / B) % 4], 1.1, .18, -.2); tc += B
motif(H['hora'] - .1, ['C6', 'Bb5', 'A5'], .26, .15)
n(shot['S6'], 'contrabass', 'D2', shot['S7'] - shot['S6'], .14, 0, attack=1.0, release=.6)
# ——— S7 the fast (3): only a drone that thins; all gone before silence 1 ———
for p, v, i, pan in [('D2', .2, 'contrabass', 0), ('A2', .15, 'cellos', -.2), ('D3', .12, 'violas', .2)]: n(shot['S7'] - .2, i, p, S1a - shot['S7'] + .05, v, pan, attack=1.2, release=.2)
for d in (H['dia1'], H['dia2']): n(d + .05, 'harp', 'A3', 1.4, .14, -.1)
# ——— S8 on the third day: low strings come back under the voice; the doors open with a timpani D3 ———
for p, v, i, pan in [('D2', .16, 'contrabass', 0), ('A2', .14, 'cellos', -.2), ('Eb3', .1, 'violas', .2)]: n(S1b + .05, i, p, S2a - S1b - .1, v, pan, attack=1.4, release=.2)
n(H['entra'] - .05, 'timpani', 'D3', 2.0, .32, 0)
# ——— S10 the climax: the first sound after silence 2 is one tubular bell (re) with a low D in the strings, on «cetro»;
#     harp arpeggio, strings and horn grow; the mode resolves to D major on «toca» ———
c = S2b
n(c, 'tubular_bells', 'D4', 4.0, .5, 0); n(c, 'contrabass', 'D2', 3.0, .34, 0, attack=.05, release=1.0); n(c, 'cellos', 'D3', 2.6, .26, -.2, attack=.1, release=.8)
for j, p in enumerate(['D3', 'A3', 'D4', 'Eb4', 'F#4', 'A4', 'D5', 'Eb5', 'F#5']): n(c + .3 + j * .14, 'harp', p, 1.8, .26 + .01 * j, .15)
for p, v, i, pan in [('D3', .26, 'cellos', -.3), ('A3', .24, 'violas', -.1), ('Eb4', .22, 'violas', .1), ('G4', .22, 'violins', .2), ('A4', .22, 'violins', .3)]:
    n(c + .2, i, p, X - c - .15, v * .7, pan, attack=X - c - .4, release=.25)
n(X - .9, 'horn', 'A3', 1.0, .3, 0, attack=.6, release=.3)
for p, v, i, pan in [('D2', .42, 'contrabass', 0), ('D3', .42, 'cellos', -.3), ('A3', .4, 'violas', -.1), ('D4', .4, 'violas', .1), ('F#4', .4, 'violins', .2), ('A4', .38, 'violins', .3), ('D5', .34, 'violins', .25)]:
    n(X, i, p, 3.4, v, pan, attack=.08, release=1.8)
for p, v in [('D4', .38), ('F#3', .3)]: n(X, 'horn', p, 3.2, v, 0, attack=.15, release=1.4)
for j, p in enumerate(['A5', 'D6', 'F#6', 'A6']): n(X + .03 + j * .1, 'glockenspiel', p, 2.4, .22, -.2 + .15 * j)
n(X + .05, 'flute', 'F#5', 2.4, .26, .2, attack=.1, release=1.0)
# ——— S11 the echo: the oboe motif again, now rising and resolved (re-fa#-la); strings in D major; harp held under the question to the last frame ———
a = shot['S11'] + .3
for p, v, i, pan in [('D3', .18, 'cellos', -.2), ('A3', .16, 'violas', 0), ('F#4', .14, 'violins', .2), ('A4', .12, 'violins', .25)]: n(a, i, p, DUR - a + .5, v, pan, attack=1.0, release=1.2)
motif(H['n127'] + .1, ['D5', 'F#5', 'A5'], .26, .15, step=.6)
tc = a
while tc < H['cta'] - .3: n(tc, 'harp', ['D4', 'F#4', 'A4', 'F#4'][int((tc - a) / B) % 4], 1.3, .18, -.2); tc += B
motif(H['tu'] - .2, ['A5', 'D6'], .2, .1, step=.6)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4']): n(H['cta'] - .3 + j * .14, 'harp', p, DUR - H['cta'] + .3, .22, -.2 + j * .08)
n(H['palabra'] + .1, 'glockenspiel', 'A6', 2.4, .16, .25)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.24); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the score grows to the climax, then settles
music *= env_lin([(0, .74), (shot['S2'], .76), (shot['S4'], .8), (shot['S5'], .84), (shot['S7'], .86), (S1a, .82), (S1b, .88), (S2a, .9), (S2b, .98), (X - .3, 1.12), (X + .6, 1.25), (shot['S11'], 1.0), (DUR + 1, .88)])[:, None]
# the two silences: music and effects both go, after the reverb tails
quiet = env_lin([(0, 1), (S1a - .25, 1), (S1a + .08, 0), (S1b - .02, 0), (S1b, 1), (S2a - .25, 1), (S2a + .08, 0), (S2b - .02, 0), (S2b, 1), (DUR + 1, 1)])
music *= quiet[:, None]

# ——— foley and ambience ———
fx = np.zeros((N, 2))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def click(): d = .05; return norm(bp(noise(d), 2000, 7000) * np.exp(-t_(d) / .006))
def dull(): d = .08; return norm(bp(noise(d), 300, 1500) * np.exp(-t_(d) / .012))
def step_(v=1.): d = .09; return norm(bp(noise(d), 200, 1800) * np.exp(-t_(d) / .02)) * v
def puff(): d = .35; return norm(bp(noise(d), 300, 2500) * np.sin(np.pi * t_(d) / d) ** 2 * np.exp(-t_(d) / .12))
def tink(f=3100): d = .5; x = t_(d); return norm(sum(np.sin(2 * np.pi * f * m * x) / m for m in (1, 2.76, 5.4)) * np.exp(-x / .08))
def door(d=1.2): x = t_(d); return norm(lp(brown(d), 160) * np.sin(np.pi * np.minimum(1, x / d * 1.4)) + bp(noise(d), 80, 400) * .3 * np.sin(np.pi * x / d))
def bird(f): d = .25; x = t_(d); return np.sin(2 * np.pi * f * (1 + .15 * np.sin(2 * np.pi * 9 * x)) * x) * np.sin(np.pi * x / d) ** 2
# dusk wind + swallows (S1); a big hall's air (J-cut before S2); the room's day birds and night crickets alternating with the light (S4)
wind = bp(noise(DUR + 1), 250, 1400)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
add(fx, wind * env_lin([(0, .7), (shot['S2'] - .3, .6), (shot['S2'] + .2, 0), (shot['S11'] - .5, 0), (shot['S11'], .5), (DUR + 1, .4)]) * db(-33), 0, 1, .2)
for tn, f, pan in [(.8, 3500, .4), (2.3, 3800, -.3), (3.9, 3300, .5), (shot['S11'] + .6, 3600, -.4), (shot['S11'] + 2.4, 3400, .3), (H['l11'] + 1.0, 3700, -.2)]: add(fx, bird(f), tn, db(-38), pan)
hall = lp(bp(noise(DUR + 1), 80, 900), 500)[:N]
add(fx, hall * env_lin([(0, 0), (shot['S2'] - .4, 0), (shot['S2'], .8), (shot['S4'], .6), (shot['S4'] + .3, 0), (S1b, 0), (H['entra'] - .5, .3), (H['entra'] + .3, .9), (S2a, .9), (DUR + 1, 0)]) * db(-36), 0, 1, 0)
T4 = shot['S4']; ph = np.clip((tt - T4) / (H['treinta'] - T4), 0, 1); dayk = .5 - .5 * np.cos(2 * np.pi * 6 * ph ** 1.5)
in4 = env_lin([(0, 0), (T4 - .2, 0), (T4, 1), (shot['S5'], 1), (shot['S5'] + .3, 0), (DUR + 1, 0)])
cr = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > .2) * (np.sin(2 * np.pi * .9 * tt) > -.2)
add(fx, cr * (1 - dayk) * in4 * db(-44), 0, 1, .3)
for d in days[:4]: add(fx, bird(3600), d - .2, db(-40), -.3)
# S7 crickets (night), die inside silence 1 (L-cut)
add(fx, cr * env_lin([(0, 0), (shot['S7'] - .2, 0), (shot['S7'] + .3, .8), (S1a - .3, .7), (S1a + .1, 0), (DUR + 1, 0)]) * db(-44), 0, 1, -.2)
# the title strip; Clawd's steps on stone (S2), a faint metal touch of the spears on «muere»; the glint on «oro»
add(fx, paper(.7), .2, db(-30), -.3); add(fx, paper(.5), H['titulo_fin'] - .45, db(-34), -.3)
for tn in np.arange(shot['S2'] + .15, H['muere'], .35): add(fx, step_(.8), tn, db(-36), -.1)
add(fx, tink(3100), H['muere'] + .05, db(-36), .3); add(fx, tink(3500), H['muere'] + .12, db(-38), -.3)
add(fx, shimmer(1.2, 1600), H['cetro1'], db(-34), .1)
# S5: the scroll unrolled, a muted click for each window that goes out
add(fx, paper(.6), shot['S5'] + .4, db(-31), .2)
for i in range(5): add(fx, dull(), H['pueblo'] + i * .2, db(-32), -.4 + .2 * i)
# S6: the messenger's steps on the stair
for tn in np.arange(shot['S6'] + .3, shot['S7'] - .3, .42): add(fx, step_(.6), tn, db(-38), .2)
# S7: a breath of flame for each lamp that goes out (the last one on the last syllable of «perezca»)
for tn in (H['dia1'], H['dia2'], H['perezca_fin']): add(fx, puff(), tn - .05, db(-30), .25)
# S8: the deep scrape of the doors opening; S10: one paper rustle per pair of layers, staggered; the shimmer of the light on «toca»; S11: a rustle as Clawd turns
add(fx, door(1.3), H['entra'] - .05, db(-24), 0)
for j in range(3): add(fx, paper(.5), S2b + j * .25 + .1, db(-30), [-.4, .4, 0][j])
add(fx, whoosh(1.3), S2b + .3, db(-30), 0); add(fx, shimmer(2.2, 900), X - .3, db(-30), 0)
add(fx, paper(.3), H['tu'] - .15, db(-34), 0)
fx *= quiet[:, None]

# ——— voice: placed on the timeline, untouched except a rumble high-pass and its level ———
vo = np.zeros(N)
for i, l in L.items():
    w, sr = sf.read(os.path.join(HERE, 'voices', i + '.wav'), dtype='float32')
    if w.ndim > 1: w = w.mean(1)
    w = soxr.resample(w, sr, SR); s = int(l['at'] * SR); vo[s:s + len(w)] += w[:N - s]
vo = hp(vo, 70); act = np.abs(vo) > 1e-4; vo *= db(-18) / rms(vo[act])
music *= db(-22.5) / rms(music[np.abs(music).sum(1) > 1e-5])
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c_], 300, 4000) for c_ in (0, 1)], 1)
music = music * db(-5.5 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
room = np.stack([lp(bp(noise(DUR + 1), 60, 2000), 700)[:N] for _ in (0, 1)], 1); room *= db(-62) / rms(room)   # room tone: the silences are still, not dead
mix = music + fx * db(-1) + vo[:, None] + room
mix = np.stack([limit(mix[:, c_], .89) for c_ in (0, 1)], 1)[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
# check: the two silences (music+fx must be below -55 dB), and voice vs music
def lvl(a, b, x=mix): seg_ = x[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(seg_) + 1e-9)
mf = (music + fx)[:len(mix)]
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print(f"silence 1 {S1a + .15:.2f}-{S1b - .03:.2f}: mix {lvl(S1a + .15, S1b - .03):.1f} dB, music+fx {lvl(S1a + .15, S1b - .03, mf):.1f} dB")
print(f"silence 2 {S2a + .15:.2f}-{H['l09'] - .03:.2f}: mix {lvl(S2a + .15, H['l09'] - .03):.1f} dB, music+fx {lvl(S2a + .15, S2b - .03, mf):.1f} dB")
va = act[:len(mix)]
print(f"voice RMS {20*np.log10(rms(vo[:len(mix)][va])):.1f} dB, music+fx under voice {20*np.log10(rms(mf[va])):.1f} dB, climax {lvl(X, X + 1.5, mf):.1f} dB, start {lvl(.3, 5, mf):.1f} dB")
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
