"""El único que se quedó (Juan 19:25–27; Mateo 26:56): original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
D minor (the darkness) that opens into F major, its relative, on «Mujer, he ahí tu hijo». Cello section voicing a solo line, harp, low string pedal,
celesta (glockenspiel samples), one small gong. Two real silences: after «huyeron» (the lamp goes out) and before «Mujer…»."""
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
S.seed(19); rng = np.random.default_rng(19)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
S1a, S1b = H['silencio1'], H['luz']      # silence 1: after «huyeron», until «Ahora, junto a la cruz»
S2a, S2b = H['silencio2'], H['mujer']    # silence 2: after «los vio a los dos», until «Mujer»
X = H['hijo']                            # the climax
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
PHRASE = [('D3', .55), ('F3', .55), ('E3', .55), ('D3', .55), ('A2', 1.7)]          # the cello's five-note phrase (it comes back in major at the end)
PHRASE_MAJ = [('F3', .55), ('A3', .55), ('G3', .55), ('F3', .55), ('C3', 2.2)]

# ——— the cross in darkness (S1–S3): low string pedal on D, the cello phrase, a few harp notes ———
a = shot['S4']
n(.02, 'contrabass', 'D2', a + .3, .2, 0, attack=.8, release=.6)
n(.02, 'cellos', 'A2', a + .3, .12, .15, attack=1.2, release=.6)
tc = .9
for p, d in PHRASE: n(tc, 'cellos', p, d * .95, .3, -.15, attack=.12, release=.4); tc += d
for tn, p in [(.3, 'D4'), (H['uno'], 'A4'), (H['l03'] + .2, 'F4'), (H['l03'] + .9, 'D4')]: n(tn, 'harp', p, 2.4, .26, .25)
# ——— Gethsemane (S4): a restless harp pulse; the pedal rises half a tone (E flat); everything stops before silence 1 ———
a, b = shot['S4'], S1a
n(a - .1, 'contrabass', 'Eb2', b - a + .1, .22, 0, attack=.4, release=.05)
n(a - .1, 'cellos', 'Bb2', b - a + .1, .14, .2, attack=.6, release=.05)
pat = ['D3', 'A3', 'F4', 'A3', 'Eb3', 'A3', 'G4', 'A3']; tc = a + .05; k = 0
while tc < b - .2:
    n(tc, 'harp', pat[k % 8], .7, .3 if k % 4 == 0 else .22, -.2); tc += .29 - .06 * (tc > H['huyeron']); k += 1
# ——— the light comes back (S5): first a harp harmonic, then the pedal in D ———
a = S1b
n(a + .02, 'harp', 'A5', 2.6, .26, .2); n(a + .5, 'harp', 'D5', 2.4, .22, -.1)
n(a + .3, 'contrabass', 'D2', shot['S7'] - a, .2, 0, attack=1.2, release=.4)
n(a + .3, 'cellos', 'A2', shot['S7'] - a, .14, .2, attack=1.4, release=.4)
# ——— the women (S6): the cello phrase again; one harp note per name ———
tc = shot['S6'] + .1
for p, d in PHRASE: n(tc, 'cellos', p, d * .95, .3, -.15, attack=.12, release=.4); tc += d * 1.05
for tn, p in [(H['sumadre'], 'F4'), (H['l07'] + .15, 'A4'), (H['cleofas'], 'C5'), (H['magdalena'], 'D5')]: n(tn, 'harp', p, 2.2, .3, .25)
# ——— «y uno más» / «los vio» (S7–S8): strings held low, the cello on one long note; the music grows, then stops dead at silence 2 ———
a, b = shot['S7'], S2a
for p, v, i, pan in [('D2', .24, 'contrabass', 0), ('D3', .2, 'cellos', -.2), ('A3', .26, 'cellos', -.1), ('F4', .16, 'violas', .15), ('A4', .14, 'violins', .25)]:
    n(a, i, p, b - a + .02, v, pan, attack=1.4, release=.05)
n(H['paso'] + .3, 'harp', 'D4', 2.0, .26, .2); n(H['vio'] + .2, 'harp', 'A3', 2.0, .26, .2)
# ——— the climax (S9): after silence 2 the voice comes first; on «hijo» a small gong, celesta, F major strings, a harp glissando ———
n(X, 'gong2', 'small', 3.0, .55, 0)
for p, v, i, pan in [('F2', .4, 'contrabass', 0), ('F3', .42, 'cellos', -.3), ('C4', .4, 'violas', -.1), ('F4', .38, 'violas', .1), ('A4', .4, 'violins', .2), ('C5', .4, 'violins', .3), ('F5', .36, 'violins', .25)]:
    n(X, i, p, shot['S11'] - X + .6, v, pan, attack=.1, release=1.6)
for j, p in enumerate(['F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'F5', 'A5', 'C6', 'F6']): n(X - .36 + j * .04, 'harp', p, 2.4, .4, -.3 + j * .06)
for j, p in enumerate(['F5', 'A5', 'C6', 'F6']): n(X + .05 + j * .18, 'celesta', p, 2.4, .3, .25)
for p, v in [('C4', .3), ('F4', .28)]: n(X + .05, 'french_horn', p, 2.8, v, 0, attack=.4, release=1.4)
# ——— «He ahí tu madre» (S10): the cello in its middle register, over the F major chord ———
tc = H['madre'] + .1
for p, d in [('A3', .5), ('C4', .5), ('Bb3', .5), ('A3', 1.3)]: n(tc, 'cellos', p, d * .95, .34, -.15, attack=.1, release=.5); tc += d
# ——— the house (S11): a luminous harp arpeggio; the window ———
a = shot['S11'] + .1
for j, p in enumerate(['F3', 'C4', 'F4', 'A4', 'C5', 'F5']): n(a + j * .13, 'harp', p, 2.6, .32, -.2 + j * .08)
for p, v, i in [('F2', .16, 'contrabass'), ('C3', .16, 'cellos'), ('A3', .14, 'violas'), ('F4', .12, 'violins')]: n(shot['S11'] + .4, i, p, DUR - shot['S11'], v, 0, attack=1.2, release=1.4)
n(H['ventana'] + .05, 'celesta', 'C6', 2.4, .24, .25)
# ——— the end (S12): the cello phrase of the opening, now in major, with harp ———
tc = shot['S12'] + .4
for p, d in PHRASE_MAJ: n(tc, 'cellos', p, d * .95, .3, -.15, attack=.12, release=.6); tc += d
for j, p in enumerate(['A4', 'F4', 'C4']): n(H['pregunta'] + j * .5, 'harp', p, 2.4, .3, .25)
n(H['pregunta'] + 1.6, 'celesta', 'F6', 2.4, .2, .2)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.24); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the two silences: everything goes to zero (after the reverb, so no tail is left)
quiet = env_lin([(0, 1), (S1a - .12, 1), (S1a + .04, 0), (S1b - .03, 0), (S1b, 1), (S2a - .12, 1), (S2a + .04, 0), (S2b - .03, 0), (S2b, 1), (DUR + 1, 1)])
music *= quiet[:, None]

# ——— foley ———
fx = np.zeros((N, 2))
def stepf(v=1., lo=300, hi=2400): d = .09; return norm(bp(noise(d), lo, hi) * np.minimum(1, t_(d) / .004) * np.exp(-t_(d) / .025)) * v
def paperc(v=1.): d = .07; return norm(bp(noise(d), 1800, 7000) * np.exp(-t_(d) / .012)) * v
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def cloth(d=.6): return norm(lp(bp(noise(d), 300, 3000), 2200) * np.sin(np.pi * t_(d) / d) ** 2)
def click(): d = .05; return norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .006) + .5 * np.sin(2 * np.pi * 1900 * t_(d)) * np.exp(-t_(d) / .01))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .35 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def chime(f=2400, d=1.2): x = t_(d); return norm((np.sin(2 * np.pi * f * x) + .4 * np.sin(2 * np.pi * f * 2.76 * x)) * np.exp(-x / (d * .35)) * np.minimum(1, x / .003))
def cricket(d):
    x = t_(d); return np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 28 * x) > .2) * (np.sin(2 * np.pi * .9 * x + rng.random() * 6) > -.2)
def bird(d=.5):
    x = t_(d); f = 2600 + 900 * np.sin(2 * np.pi * 7 * x); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)
def crackle(d):
    m = int(d * SR); x = np.zeros(m); idx = rng.integers(0, m, int(d * 60)); x[idx] = rng.uniform(-1, 1, len(idx)); return norm(bp(x, 800, 6000) + .3 * lp(brown(d), 400)[:m])
# wind on the hill (Golgotha), dry and low; it dies before silence 2
wind = bp(noise(DUR + 1), 220, 1400)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.6))
add(fx, wind * env_lin([(0, .7), (shot['S4'] - .2, .6), (shot['S4'] + .2, 0), (S1b, 0), (S1b + .4, .6), (shot['S7'], .6), (S2a - .6, .25), (S2a, 0), (S2b + .3, 0), (S2b + .9, .3), (shot['S11'] - .2, .3), (shot['S11'] + .3, 0), (DUR + 1, 0)]) * db(-31), 0, 1, .15)
# Gethsemane: crickets and olive leaves (J-cut, under «La noche anterior»)
crick = sum(cricket(DUR + 1)[:N] * w for w in (1, .6))
add(fx, bp(crick, 3000, 6000) * env_lin([(0, 0), (H['l04'] - .45, 0), (H['l04'] - .1, .8), (S1a - .3, .5), (S1a - .05, 0), (DUR + 1, 0)]) * db(-40), 0, 1, .2)
leaves = bp(noise(DUR + 1), 1500, 6000)[:N] * (.5 + .5 * np.sin(2 * np.pi * tt / 2.3) ** 2)
add(fx, leaves * env_lin([(0, 0), (H['l04'] - .45, 0), (H['l04'] - .1, .6), (S1a - .3, .4), (S1a - .05, 0), (DUR + 1, 0)]) * db(-40), 0, 1, -.2)
# torches crackling, coming from the right
dT = S1a - shot['S4']; cr = crackle(dT)
add(fx, cr * np.interp(np.arange(len(cr)) / SR, [0, .4, 1.6, dT - .3, dT], [0, .2, .7, .8, 0]), shot['S4'], db(-30), .45)
add(fx, paper(.7), shot['S4'] - .05, db(-30), .3)                  # the olive branch sweeping across
# the flight: footsteps running away to the left, staggered
for i in range(11):
    t0 = H['huyeron'] + i * .09 + .05
    for j in range(4): add(fx, stepf(.5 + .4 * rng.random(), 250, 2000), t0 + j * .14, db(-32 - j * 2.5), -.1 - .2 * j)
add(fx, click(), S1a - .1, db(-26), .2)                           # the lamp goes out: the last sound before silence 1
# the light comes back: a soft shimmer for each layer, then a little bell for each lit edge
for i in range(4): add(fx, shimmer(1.0, 1300 + 250 * i), S1b + .15 + i * .32, db(-38), -.2 + i * .13)
for tn in [H['sumadre'], H['l07'] + .15, H['cleofas'], H['magdalena']]: add(fx, chime(2900, .9), tn, db(-38), .25)
add(fx, paper(.6), .35, db(-36), .2)                               # the title strip
add(fx, cloth(.7), 1.2, db(-40), -.1)                              # the mantle
add(fx, chime(2600, 1.0), H['uno'], db(-37), .2)
# the disciple's step; a low wooden creak on the tilt up
add(fx, stepf(.8, 200, 1600), H['paso'] + .45, db(-31), .1); add(fx, stepf(.7, 200, 1600), H['paso'] + .95, db(-33), .05)
creak = bp(np.sign(np.sin(2 * np.pi * (60 + 20 * np.sin(t_(1.0) * 5)) * t_(1.0))), 200, 1100) * np.sin(np.pi * t_(1.0)) ** 2
add(fx, norm(creak), shot['S8'] + .3, db(-38), 0)
# the climax: a long paper rustle (the crests part), rising chimes, one per layer the beam crosses; the glow carries over the cut (L-cut)
add(fx, paper(1.5), S2b + .02, db(-29), 0)
for i in range(5): add(fx, chime(1800 * 2 ** (i / 5), 1.4), S2b + .2 + i * .18, db(-34), -.3 + i * .15)
add(fx, shimmer(2.8, 900), X - .2, db(-29), 0)
add(fx, cloth(.6), H['madre'] + .3, db(-36), .1)                    # the disciple turns
# the house: dawn birds and a quiet street (J-cut), two people's steps on stone, the door, the click + shimmer of the window
add(fx, lp(bp(brown(DUR + 1), 150, 900), 700)[:N] * env_lin([(0, 0), (shot['S11'] - .5, 0), (shot['S11'], .4), (DUR + 1, .35)]), 0, db(-38), -.1)
for tn in [shot['S11'] - .3, shot['S11'] + 1.4, shot['S12'] + .8, shot['S12'] + 2.6, H['pregunta'] + 1.6]: add(fx, bird(.5), tn, db(-38), .3 * (1 if rng.random() > .5 else -1))
arr = H['casa'] + 1.3
for bt in np.arange(shot['S11'], arr, .36): add(fx, stepf(.6, 600, 3500), bt, db(-37), -.1); add(fx, stepf(.5, 600, 3500), bt + .17, db(-38), -.05)
add(fx, thump(.25, 90), arr + .45, db(-34), .1)                    # the door
add(fx, click(), H['ventana'] - .05, db(-30), .2); add(fx, shimmer(1.6, 1100), H['ventana'], db(-33), .2)
add(fx, paperc(.6), H['pregunta'] - .2, db(-36), 0)                 # Clawd turns his head
fx *= quiet[:, None]
tone = lp(brown(DUR + 1), 260)[:N]; tone *= db(-62) / rms(tone)   # room tone only: the silences stay real (about -60 dB)
fx += np.stack([tone, np.roll(tone, 977)], 1) * db(1)

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
# the score grows toward «Mujer, he ahí tu hijo» and swells a little over the voice there
music *= db(env_lin([(0, -2), (S1b, -2), (shot['S7'], 0), (S2a, 1.5), (X - .1, 1.5), (X + .2, 4), (shot['S11'] + .6, 3), (shot['S12'], 0), (DUR + 1, 0)]))[:, None]
mix = music + fx * db(-1) + vo[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
def seg_db(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x))
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print(f'silence 1 {S1a + .15:.2f}-{S1b - .1:.2f}: {seg_db(S1a + .15, S1b - .1):.1f} dB   silence 2 {S2a + .15:.2f}-{S2b - .1:.2f}: {seg_db(S2a + .15, S2b - .1):.1f} dB')
print(f'before s1 {seg_db(S1a - 1.2, S1a - .2):.1f} dB   climax {seg_db(X, X + 1.5):.1f} dB   whole {seg_db(0, DUR):.1f} dB')
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
