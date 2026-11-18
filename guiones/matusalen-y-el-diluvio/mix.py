"""La cuenta de Matusalén: original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
Harp, strings, flute and celesta (glockenspiel samples), with the oboe motif of Methuselah (D-E-F#) and one tubular bell on «969».
The score grows from a dusk harp to the climax on «entera» (~37.4 s); two real silences (< -40 dB): before «Novecientos sesenta y nueve» and before «Dios esperó».
Soft thunder and rain in the storm. The voice is in front and untouched (only a rumble high-pass and its level). Loudness to -14 LUFS is done by core/render/mux.sh."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, lp, hp, noise, brown, norm, t_, whoosh, thump, limit
from scipy.ndimage import uniform_filter1d, maximum_filter1d

TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
H, L, DUR = TL['HIT'], TL['L'], TL['DUR']
N = int(DUR * SR) + SR
tt = np.arange(N) / SR
S.seed(19); rng = np.random.default_rng(7)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
S1a, S1b = H['sil1'], H['campana']      # silence 1: end of «+ seiscientos…» -> «Novecientos sesenta y nueve»
S2a, S2b = H['sil2'], H['dios']         # silence 2: end of «La Biblia no dice cómo» -> «Dios esperó»
B = 60 / 66                             # one beat at 66 bpm
def motif(t0, notes, v=.3, pan=.15, step=B * .75):
    for j, p in enumerate(notes): n(t0 + j * step, 'oboe', p, step * (1.6 if j == len(notes) - 1 else .95), v, pan, attack=.06, release=.4)

# ——— the door at dusk (0 -> «A los»): harp ostinato in D, low strings, the oboe motif of Methuselah (re-mi-fa#) ———
for p, v, i, pan in [('D2', .2, 'contrabass', 0), ('A2', .17, 'cellos', -.2)]: n(0, i, p, H['alos'] + .4, v, pan, attack=.6, release=.8)
UP = ['D3', 'A3', 'D4', 'E4', 'F#4', 'E4', 'D4', 'A3']
tc, k = .05, 0
while tc < H['alos'] - .2: n(tc, 'harp', UP[k % 8], 1.2, .24 + .05 * (k % 4 == 0), -.2); tc += B / 2; k += 1
motif(.35, ['D5', 'E5', 'F#5']); motif(H['pregunta'] + .2, ['D5', 'E5', 'F#5'], .26)
n(H['novecientos'], 'glockenspiel', 'F#6', 2.2, .16, .3)
# ——— the light goes back (S2): the ostinato turns downward; celesta as the sun climbs ———
DN = ['F#4', 'E4', 'D4', 'A3', 'D3', 'A3', 'D4', 'E4']
tc, k = H['alos'] - .1, 0
while tc < shot['S4'] - .2: n(tc, 'harp', DN[k % 8] if tc < shot['S3'] else UP[(k + 2) % 8], 1.1, .22, -.15); tc += B / 2; k += 1
for j, p in enumerate(['A6', 'F#6', 'E6', 'D6']): n(H['alos'] + .1 + j * .32, 'glockenspiel', p, 1.8, .16, .25 - .1 * j)
for p, v, i, pan in [('D3', .15, 'cellos', -.2), ('F#3', .13, 'violas', 0), ('A3', .12, 'violas', .2)]: n(H['alos'], i, p, shot['S5'] - H['alos'], v, pan, attack=1.0, release=.8)
# ——— the road (S3-S4): soft strings, the motif a third higher, the lamp on «consolará» ———
motif(H['l04'] + .1, ['F#5', 'G5', 'A5'], .26, -.1)
n(H['consolara'], 'glockenspiel', 'D6', 2.4, .2, .2); n(H['consolara'] + .05, 'flute', 'A5', 1.4, .2, .1, attack=.15, release=.6)
for p, v, i, pan in [('A3', .14, 'violins', .2), ('D4', .13, 'violins', .25)]: n(shot['S3'], i, p, shot['S5'] - shot['S3'], v, pan, attack=1.2, release=.6)
# ——— the ark far away (S5): a low drone comes in under, the harp thins, the planks ———
for p, v, i, pan in [('D2', .24, 'contrabass', 0), ('A2', .2, 'cellos', -.2), ('D3', .16, 'cellos', .2)]: n(shot['S5'] - .3, i, p, S1a - shot['S5'] + .2, v, pan, attack=1.0, release=.25)
tc = shot['S5']
while tc < shot['S6'] - .2: n(tc, 'harp', ['D4', 'A3', 'E4', 'A3'][int((tc - shot['S5']) / B) % 4], 1.0, .18, -.2); tc += B
# ——— the sum (S6): sustained strings, one harp note per light (re, fa#, la), unresolved; everything gone before silence 1 ———
for p, v, i, pan in [('F#3', .16, 'violas', -.1), ('A3', .15, 'violas', .1), ('D4', .14, 'violins', .2)]: n(shot['S6'], i, p, S1a - shot['S6'] - .1, v, pan, attack=1.4, release=.25)
for tn, p in [(H['suma187'], 'D4'), (H['suma182'], 'F#4'), (H['suma600'], 'A4')]: n(tn, 'harp', p, 1.6, .42, 0); n(tn + .01, 'glockenspiel', p.replace('4', '6'), 1.4, .16, .2)
motif(H['l06'] + .3, ['D5', 'E5'], .2, .1)
# ——— «969»: the first sound after silence 1 is one tubular bell with a low D; then a dark drone, the timpani with the thunder ———
n(S1b, 'tubular_bells', 'D4', 4.0, .5, 0); n(S1b, 'contrabass', 'D2', 4.0, .36, 0, attack=.05, release=1.2); n(S1b, 'cellos', 'D3', 3.6, .28, -.2, attack=.1, release=1.0)
for p, v, i, pan in [('D2', .2, 'contrabass', 0), ('A2', .17, 'cellos', -.2), ('F3', .13, 'violas', .2)]: n(S1b + 2.2, i, p, S2a - S1b - 2.4, v, pan, attack=1.2, release=.25)
n(H['mismo_ano'] + .3, 'timpani', 'D3', 2.2, .3, 0)
n(shot['S8'] + .4, 'timpani', 'D3', 2.0, .26, 0)
for p, v in [('D3', .16), ('A3', .14)]: n(shot['S8'] - .2, 'violins_trem', p, S2a - shot['S8'], v, .1, attack=.8, release=.2)
# ——— climax: the first sound after silence 2 is the celesta rising; harp arpeggio; strings and horn swell to «entera» ———
d, X = S2b, H['entera']
for j, p in enumerate(['D6', 'F#6', 'A6', 'D7']): n(d + .02 + j * .12, 'glockenspiel', p, 2.6, .24, -.3 + .2 * j)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(d + .35 + j * .09, 'harp', p, 2.0, .3 + .01 * j, .15)
for p, v, i, pan in [('D2', .3, 'contrabass', 0), ('D3', .28, 'cellos', -.3), ('A3', .26, 'violas', -.1), ('D4', .26, 'violas', .1), ('F#4', .26, 'violins', .2), ('A4', .26, 'violins', .3)]:
    n(d + .1, i, p, X - d, v * .7, pan, attack=X - d - .2, release=.3)
for p, v, i, pan in [('D2', .42, 'contrabass', 0), ('D3', .42, 'cellos', -.3), ('A3', .4, 'violas', -.1), ('D4', .4, 'violas', .1), ('F#4', .4, 'violins', .2), ('A4', .4, 'violins', .3), ('D5', .36, 'violins', .25)]:
    n(X, i, p, 3.0, v, pan, attack=.1, release=1.8)
for p, v in [('D4', .38), ('A3', .34)]: n(X - .6, 'horn', p, 3.2, v, 0, attack=.6, release=1.4)
for j, p in enumerate(['A5', 'D6', 'F#6', 'A6']): n(X + .03 + j * .1, 'glockenspiel', p, 2.4, .22, -.2 + .15 * j)
n(X + .05, 'flute', 'F#5', 2.2, .26, .2, attack=.1, release=1.0)
# ——— the ark in gold (S10): strings in D major, soft, at 66 bpm ———
a = shot['S10'] + .6
for p, v, i, pan in [('D3', .2, 'cellos', -.2), ('A3', .18, 'violas', 0), ('F#4', .16, 'violins', .2), ('A4', .14, 'violins', .25)]: n(a, i, p, shot['S11'] - a + .6, v, pan, attack=.8, release=.8)
tc = a
while tc < shot['S11'] - .3: n(tc, 'harp', ['D4', 'F#4', 'A4', 'F#4'][int((tc - a) / B) % 4], 1.3, .2, -.2); tc += B
# ——— the echo (S11): the oboe motif again, now resolved (re-mi-fa#-la); harp held under the question to the last frame ———
motif(shot['S11'] + .45, ['D5', 'E5', 'F#5', 'A5'], .28, .15)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4']): n(H['cta'] - .3 + j * .14, 'harp', p, DUR - H['cta'] + .3, .24, -.2 + j * .08)
for p, v, i in [('D3', .15, 'cellos'), ('A3', .13, 'violas'), ('F#4', .11, 'violins')]: n(shot['S11'], i, p, DUR - shot['S11'] + .5, v, 0, attack=1.0, release=1.2)
n(H['palabra'] + .1, 'glockenspiel', 'A6', 2.6, .18, .25)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.5, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the score grows to the climax (~38 s), then settles
music *= env_lin([(0, .74), (H['alos'], .76), (shot['S5'], .82), (shot['S6'], .88), (S1a, .9), (S1b, .95), (S2a, .95), (S2b, 1.0), (X - .3, 1.12), (X + .6, 1.25), (shot['S10'] + .5, 1.0), (shot['S11'], .9), (DUR + 1, .86)])[:, None]
# the two silences: music and effects both go (<= -40 dB), after reverb tails
quiet = env_lin([(0, 1), (S1a - .2, 1), (S1a + .1, 0), (S1b - .02, 0), (S1b, 1), (S2a - .2, 1), (S2a + .1, 0), (S2b - .02, 0), (S2b, 1), (DUR + 1, 1)])
music *= quiet[:, None]

# ——— foley and ambience ———
fx = np.zeros((N, 2))
def thunder(d=2.6): return norm(lp(brown(d), 200) * np.minimum(1, t_(d) / .08) * np.exp(-t_(d) / (d * .45)) + bp(noise(d), 150, 900) * np.exp(-t_(d) / .3) * .3)
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .25 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def card(f=240, d=.12): x = t_(d); return norm((np.sin(2 * np.pi * f * x) * .5 + bp(noise(d), 400, 3000)) * np.exp(-x / .025))   # a cardboard knock
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def click(): d = .05; return norm(bp(noise(d), 2000, 7000) * np.exp(-t_(d) / .006))
def step_(v=1.): d = .09; return norm(bp(noise(d), 200, 1800) * np.exp(-t_(d) / .02)) * v
bird = lambda f: np.sin(2 * np.pi * f * (1 + .15 * np.sin(2 * np.pi * 9 * t_(.25))) * t_(.25)) * np.sin(np.pi * t_(.25) / .25) ** 2
# evening wind + far crickets (S1), morning birds (J-cut .4 s before the sun climbs), midday wind; the wind dies inside silence 1 (L-cut)
wind = bp(noise(DUR + 1), 250, 1400)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
add(fx, wind * env_lin([(0, .6), (shot['S4'], .5), (shot['S4'] + .1, .15), (shot['S5'], .5), (shot['S6'], .9), (S1a - .3, .7), (S1a + .1, 0), (S1b + .5, 0), (S1b + 1.5, .4), (S2a - .3, .3), (S2a + .05, 0), (shot['S10'] - .5, 0), (shot['S11'], .35), (DUR + 1, .3)]) * db(-33), 0, 1, .2)
cr = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > .2) * (np.sin(2 * np.pi * .9 * tt) > -.2)
add(fx, cr[:N] * env_lin([(0, .8), (H['alos'] - .4, .8), (H['alos'], 0), (shot['S11'], 0), (shot['S11'] + .5, .5), (DUR - 2, .3), (DUR, 0)]) * db(-46), 0, 1, .3)
for tn, f, pan in [(H['alos'] - .4, 3300, .4), (H['alos'] + .6, 3700, -.3), (H['alos'] + 1.6, 3500, .5), (shot['S3'] + .5, 3200, -.4), (shot['S10'] + .4, 3400, .4), (shot['S11'] + 1.5, 3600, -.3)]: add(fx, bird(f), tn, db(-38), pan)
add(fx, paper(.7), .2, db(-30), -.3); add(fx, paper(.5), H['titulo_fin'] - .45, db(-34), -.3)   # the title strip
add(fx, shimmer(1.6, 1300), H['alos'] + .1, db(-34), .2)
for tn in np.arange(shot['S3'] + .1, H['noe'] + .2, .33): add(fx, step_(.8), tn, db(-36), 0)   # Clawd's steps
add(fx, click(), H['consolara'] - .05, db(-30), .2); add(fx, shimmer(1.0, 1800), H['consolara'], db(-34), .2)
for i in range(8): add(fx, card(220 + 15 * i), H['seiscientos'] - .55 + i * .25 + .4, db(-31), .2)   # one cardboard knock per plank
for h in ('suma187', 'suma182', 'suma600'): add(fx, click(), H[h], db(-31), 0)
# storm: a far low thunder on «el mismo año» (J-cut into the rain), rain on paper in three layers, water on the hull; all gone inside silence 2
for tn, g in [(H['mismo_ano'] + .2, -20), (shot['S8'] + .35, -19), (H['no_dice'] + 1.1, -24)]: add(fx, thunder(2.6), tn, db(g), -.1)
rainL = [bp(noise(DUR + 1), lo, hi)[:N] for lo, hi in [(1800, 7000), (2500, 9000), (900, 4000)]]
renv = env_lin([(0, 0), (H['mismo_ano'] + .8, 0), (shot['S8'] - .2, .5), (shot['S8'] + .4, 1), (S2a - .3, 1), (S2a + .05, 0), (DUR + 1, 0)])
for j, r_ in enumerate(rainL): add(fx, r_ * renv * (.8 + .2 * np.sin(2 * np.pi * tt / (2.3 + j))) * db(-28 - 2 * j), 0, 1, [-.3, .3, 0][j])
sea = bp(brown(DUR + 1), 80, 700)[:N] * (.55 + .45 * np.sin(2 * np.pi * tt / 3.1) ** 2)
add(fx, sea * env_lin([(0, 0), (shot['S8'], 0), (shot['S8'] + .5, .8), (S2a - .3, .8), (S2a + .05, 0), (shot['S10'] - .5, 0), (shot['S10'], .4), (shot['S11'], .25), (DUR, .1)]) * db(-28), 0, 1, 0)
for j in range(3): add(fx, paper(.5), S2b + .25 + j * .25, db(-30), [-.4, .4, 0][j])   # the cloud pairs parting
add(fx, whoosh(1.3), S2b + .3, db(-28), 0); add(fx, shimmer(2.2, 900), X - .4, db(-30), 0)
add(fx, paper(.3), H['espera'] - .2, db(-34), 0)
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
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-5.5 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
room = np.stack([lp(bp(noise(DUR + 1), 60, 2000), 700)[:N] for _ in (0, 1)], 1); room *= db(-60) / rms(room)   # room tone: the silences are still, not dead
mix = music + fx * db(-1) + vo[:, None] + room
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
# check: the two silences, and voice vs music
def lvl(a, b, x=mix): seg_ = x[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(seg_) + 1e-9)
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print(f"silence 1 {S1a + .15:.2f}-{S1b - .03:.2f}: {lvl(S1a + .15, S1b - .03):.1f} dB (music+fx {lvl(S1a + .15, S1b - .03, music + fx):.1f})")
print(f"silence 2 {S2a + .15:.2f}-{S2b - .03:.2f}: {lvl(S2a + .15, S2b - .03):.1f} dB (music+fx {lvl(S2a + .15, S2b - .03, music + fx):.1f})")
va = act[:len(mix)]; m_ = (music + fx)[:len(mix)]
print(f"voice RMS {20*np.log10(rms(vo[:len(mix)][va])):.1f} dB, music+fx under voice {20*np.log10(rms(m_[va])):.1f} dB, climax {lvl(X, X + 1.5, m_):.1f} dB, start {lvl(.3, 5, m_):.1f} dB")
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
