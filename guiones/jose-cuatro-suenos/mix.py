"""Cuatro sueños (Mateo 1:18–25; 2:13–15, 19–23): original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
D minor (dorian, B natural) at night, opening into D major at the climax. A flute line is José's voice (it never sings words), the harp is a small lyre,
low strings hold the pedal, and the celesta counts the dreams: one note on the first veil, two on the second, three on the third, four on the fourth
(D–F–A–C); on «Cuatro veces» the four return as one chord and F turns to F sharp. Two real silences: after «en secreto» (the lamp goes out)
and after «a Nazaret» (the four veils hang in the dark). The voice stays clean (no reverb, no effects)."""
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
S.seed(4); rng = np.random.default_rng(4)
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
end = lambda i: L[i]['at'] + L[i]['dur']
S1a, S1b = H['silencio1'], H['primer']        # silence 1: after «en secreto», until «Primer sueño»
S2a, S2b = H['silencio2'], H['nipalabra']     # silence 2: after «a Nazaret», until «Ni una palabra»
X = H['cuatroveces'] + .05                    # the light goes through the four holes (S11)
LV = H['levanto']
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))
PHRASE = [('A4', .5), ('C5', .5), ('B4', .5), ('A4', .5), ('D4', 1.8)]          # José's five-note phrase (flute), dorian
PHRASE_MAJ = [('A4', .5), ('D5', .5), ('C#5', .5), ('A4', .5), ('D5', 2.2)]     # the same, in D major, at the end
DREAM = ['D6', 'F6', 'A6', 'C7']
def celesta(t0, k, gap=.17, v=.34):            # the dream count: k notes of the motif
    for j in range(k): n(t0 + j * gap, 'celesta', DREAM[j], 2.4, v, .25 - .1 * j)

# ——— the workshop at night (S1–S2): low pedal on D, the flute phrase, a few harp notes ———
n(.02, 'contrabass', 'D2', shot['S3'] + .3, .2, 0, attack=.8, release=.6)
n(.02, 'cellos', 'A2', shot['S3'] + .3, .12, .15, attack=1.2, release=.6)
tc = .9
for p, d in PHRASE: n(tc, 'flute', p, d * .95, .26, -.15, attack=.1, release=.4); tc += d
for tn, p in [(.3, 'D4'), (H['l02'] + .1, 'A3'), (H['l02'] + 1.2, 'F4')]: n(tn, 'harp', p, 2.4, .24, .25)
# ——— Nazaret (S3–S4): the lyre in a slow pulse ———
a, b = shot['S3'], shot['S5'] + .2
n(a, 'contrabass', 'D2', b - a, .18, 0, attack=.6, release=.5)
pat = ['D3', 'A3', 'F4', 'A3', 'E3', 'A3', 'B3', 'A3']; tc = a + .1; k = 0
while tc < b - .3: n(tc, 'harp', pat[k % 8], .9, .26 if k % 4 == 0 else .18, -.2); tc += .42; k += 1
# ——— the decision (S5): the pedal rises half a tone (E flat); the flute holds one long note; everything stops before silence 1 ———
a, b = shot['S5'], S1a
n(a, 'contrabass', 'Eb2', b - a, .2, 0, attack=.6, release=.05); n(a, 'cellos', 'Bb2', b - a, .13, .2, attack=.8, release=.05)
n(a + .5, 'flute', 'A4', b - a - .6, .2, -.15, attack=.6, release=.05)
# ——— first dream (S6): after the silence, a rising shimmer, one celesta note when the light burns the veil ———
n(S1b + .1, 'violins', 'A4', 2.0, .1, .2, attack=1.4, release=.6); n(S1b + .1, 'violas', 'D4', 2.4, .1, -.2, attack=1.4, release=.6)
celesta(H['notemas'] - .02, 1)
n(H['notemas'] + .05, 'harp', 'D5', 2.4, .26, .2)
# ——— he wakes (S7): lyre and warm strings, a first major chord passing (B flat → F) ———
a = shot['S7']
for p, v, i, pan in [('Bb2', .2, 'contrabass', 0), ('F3', .16, 'cellos', -.2), ('D4', .14, 'violas', .1), ('F4', .12, 'violins', .2)]: n(a + .2, i, p, 1.5, v, pan, attack=.8, release=.5)
for p, v, i, pan in [('F2', .2, 'contrabass', 0), ('C3', .16, 'cellos', -.2), ('A3', .14, 'violas', .1), ('F4', .13, 'violins', .2)]: n(a + 1.6, i, p, shot['S8'] - a - 1.2, v, pan, attack=.6, release=.6)
for j, p in enumerate(['F3', 'A3', 'C4', 'F4', 'A4']): n(a + 1.6 + j * .12, 'harp', p, 2.2, .26, -.2 + j * .08)
# ——— Belén and the flight (S8, S8b): two celesta notes on the veil; then the lyre in a walking pulse ———
celesta(H['segundo'] + .5, 2)
n(shot['S8'], 'contrabass', 'D2', shot['S9'] - shot['S8'], .2, 0, attack=.5, release=.4)
n(shot['S8b'], 'cellos', 'A2', shot['S9'] - shot['S8b'], .14, .2, attack=.8, release=.4)
tc = shot['S8b'] + .1; k = 0; walk = ['D3', 'A3', 'D4', 'A3', 'C4', 'A3', 'B3', 'A3']
while tc < shot['S9'] - .1: n(tc, 'harp', walk[k % 8], .8, .26 if k % 2 == 0 else .18, -.25); tc += .33; k += 1
# ——— Egypt (S9): three celesta notes; the flute changes colour (B flat: a new place) ———
celesta(H['tercero'] + .3, 3, .15)
n(shot['S9'], 'contrabass', 'G2', shot['S10'] - shot['S9'], .2, 0, attack=.3, release=.4)
tc = shot['S9'] + .25
for p, d in [('G4', .4), ('Bb4', .4), ('A4', .8)]: n(tc, 'flute', p, d * .95, .24, -.15, attack=.08, release=.3); tc += d
# ——— the way back (S10): four celesta notes; the lyre pulse quickens; the music grows and stops dead at silence 2 ———
celesta(H['cuarto'] + .28, 4, .14)
a, b = shot['S10'], S2a
for p, v, i, pan in [('D2', .22, 'contrabass', 0), ('A2', .18, 'cellos', -.2), ('D4', .16, 'violas', .15), ('A4', .14, 'violins', .25)]: n(a, i, p, b - a + .02, v, pan, attack=1.0, release=.05)
tc = H['l11b'] + .1; k = 0
while tc < b - .2: n(tc, 'harp', walk[k % 8], .6, .28 if k % 2 == 0 else .2, -.25); tc += .27 - .04 * (tc > H['nazaret']); k += 1
# ——— the climax (S11): after silence 2 the voice comes first; on «Cuatro veces» four rising celesta notes, one per veil the light crosses;
# on «se levantó» the four notes become a chord and resolve into D major (F → F sharp), strings and a harp glissando ———
for j in range(4): n(X + j * .2, 'celesta', DREAM[j], 2.6, .38, .3 - .2 * j)
for p, v, i, pan in [('D2', .4, 'contrabass', 0), ('D3', .4, 'cellos', -.3), ('A3', .38, 'violas', -.1), ('F#4', .4, 'violas', .1), ('A4', .4, 'violins', .2), ('D5', .4, 'violins', .3), ('F#5', .34, 'violins', .25)]:
    n(LV - .05, i, p, shot['S12'] - LV + 1.2, v, pan, attack=.12, release=1.6)
for j, p in enumerate(['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(LV - .4 + j * .04, 'harp', p, 2.4, .38, -.3 + j * .06)
for p in ['D6', 'F#6', 'A6', 'C#7']: n(LV + .02, 'celesta', p, 2.6, .26, .2)
# ——— the end (S12): the flute repeats the opening phrase, now in major, with the lyre ———
for p, v, i in [('D2', .16, 'contrabass'), ('A2', .15, 'cellos'), ('F#3', .13, 'violas'), ('D4', .11, 'violins')]: n(shot['S12'] + .6, i, p, DUR - shot['S12'], v, 0, attack=1.2, release=1.4)
tc = shot['S12'] + .5
for p, d in PHRASE_MAJ: n(tc, 'flute', p, d * .95, .26, -.15, attack=.1, release=.6); tc += d
for j, p in enumerate(['A4', 'F#4', 'D4']): n(H['pregunta'] + .2 + j * .5, 'harp', p, 2.4, .26, .25)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.24); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# the two silences: everything goes to zero (after the reverb, so no tail is left)
quiet = env_lin([(0, 1), (S1a - .12, 1), (S1a + .04, 0), (S1b - .03, 0), (S1b, 1), (S2a - .12, 1), (S2a + .04, 0), (S2b - .03, 0), (S2b, 1), (DUR + 1, 1)])
music *= quiet[:, None]

# ——— foley (synthesised) ———
fx = np.zeros((N, 2))
def stepf(v=1., lo=300, hi=2400): d = .09; return norm(bp(noise(d), lo, hi) * np.minimum(1, t_(d) / .004) * np.exp(-t_(d) / .025)) * v
def tap(v=1.):   # card on wood: a short knock with a little paper click on top
    d = .12; x = t_(d); return norm(bp(noise(d), 400, 2400) * np.exp(-x / .012) + .8 * np.sin(2 * np.pi * 230 * x) * np.exp(-x / .03) + .3 * bp(noise(d), 3000, 7000) * np.exp(-x / .004)) * v
def paper(d=.6): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def cloth(d=.6): return norm(lp(bp(noise(d), 300, 3000), 2200) * np.sin(np.pi * t_(d) / d) ** 2)
def click(): d = .05; return norm(bp(noise(d), 1500, 6000) * np.exp(-t_(d) / .006) + .5 * np.sin(2 * np.pi * 1900 * t_(d)) * np.exp(-t_(d) / .01))
def shimmer(d=1.4, f0=1500):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .35 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)
def chime(f=2400, d=1.2): x = t_(d); return norm((np.sin(2 * np.pi * f * x) + .4 * np.sin(2 * np.pi * f * 2.76 * x)) * np.exp(-x / (d * .35)) * np.minimum(1, x / .003))
def crackle(d):
    m = int(d * SR); x = np.zeros(m); idx = rng.integers(0, m, int(d * 40)); x[idx] = rng.uniform(-1, 1, len(idx)); return norm(bp(x, 800, 6000))
def cricket(d):
    x = t_(d); return np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 28 * x) > .2) * (np.sin(2 * np.pi * .9 * x + rng.random() * 6) > -.2)
def bird(d=.5):
    x = t_(d); f = 2600 + 900 * np.sin(2 * np.pi * 7 * x); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2)
def plane(d=.5): x = t_(d); return norm(bp(noise(d), 900, 5000) * np.sin(np.pi * x / d) ** .6 * (1 + .3 * np.sin(2 * np.pi * 40 * x)))
# Nazaret at night: crickets (S1–S5), they die out with the lamp; they come back when he wakes; wind on the hills on the roads
crick = sum(cricket(DUR + 1)[:N] * w for w in (1, .6))
add(fx, bp(crick, 3000, 6000) * env_lin([(0, .5), (shot['S3'], .5), (shot['S3'] + .3, 1), (shot['S5'], .7), (S1a - .6, .1), (S1a - .2, 0), (shot['S7'] + 1, 0), (shot['S7'] + 2, .6), (shot['S8'], .3), (shot['S8b'], 0), (shot['S11'], 0), (S2b, 0), (S2b + .5, .4), (shot['S12'], 0), (DUR + 1, 0)]) * db(-42), 0, 1, .2)
wind = bp(noise(DUR + 1), 220, 1400)[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.6))
add(fx, wind * env_lin([(0, 0), (H['l08'] + .8, 0), (shot['S8b'], .8), (shot['S9'] - .3, .6), (shot['S9'], .15), (shot['S10'], .5), (S2a - .5, .3), (S2a, 0), (DUR + 1, 0)]) * db(-31), 0, 1, .15)
river = lp(bp(brown(DUR + 1), 200, 1500), 1200)[:N]   # Egypt: still water and palm leaves (J-cut under «De noche, se van»)
add(fx, norm(river) * env_lin([(0, 0), (H['l09'] + .4, 0), (shot['S9'], .5), (shot['S10'] - .1, .4), (shot['S10'] + .3, 0), (DUR + 1, 0)]) * db(-36), 0, 1, -.1)
add(fx, crackle(S1a - .3) * env_lin([(0, .5), (S1a - .8, .3), (S1a - .3, 0), (DUR + 1, 0)])[:int((S1a - .3) * SR)], 0, db(-40), .2)   # the wick
# Clawd's count: card on wood (or on earth), one tap per dream; four at the start, one at the end
for tn in [H['tap1'] + .3 * i for i in range(4)]: add(fx, tap(1), tn, db(-27), .3)
add(fx, tap(1), H['primer'] + .05, db(-27), -.2)
for i in range(2): add(fx, tap(.9), H['segundo'] + .28 * i, db(-28), .3)
for i in range(3): add(fx, bp(tap(1), 150, 1200), H['tercero'] + .2 * i, db(-26), -.3)
for i in range(4): add(fx, bp(tap(1), 150, 1200), H['cuarto'] + .17 * i, db(-27), -.3)
add(fx, tap(1), H['pregunta'] - .05, db(-27), .3)
add(fx, paper(.6), .3, db(-36), 0)                                 # the title strip
add(fx, click(), S1a - .1, db(-26), .25)                           # the lamp goes out: the last sound before silence 1
# the veils: a long paper slide as each comes down, a crackle of fibre where the hole burns
for t0, dd in [(H['primer'] + .1, .9), (H['segundo'] - .05, .5), (H['tercero'] - .15, .35), (H['cuarto'] - .1, .35)]: add(fx, paper(dd + .2), t0, db(-33), -.1)
for tb in [H['notemas'], H['segundo'] + .55, H['tercero'] + .32, H['cuarto'] + .3]: add(fx, crackle(.4) * np.exp(-t_(.4) / .15)[:int(.4 * SR)], tb, db(-34), 0); add(fx, shimmer(1.2, 1400), tb - .1, db(-37), .1)
# he wakes: the stool, a step, the wooden door
add(fx, thump(.3, 120), H['despierta'] + .5, db(-34), -.1)
for j in range(4): add(fx, stepf(.7, 250, 1800), H['despierta'] + 1.1 + j * .33, db(-34), -.2 - .05 * j)
add(fx, thump(.25, 90), H['despierta'] + 2.5, db(-34), -.3)
# the road: sandals on earth, cloth (the flight, then the way back)
for bt in np.arange(shot['S8b'] + .1, shot['S9'] - .1, .33): add(fx, stepf(.6, 300, 2500), bt, db(-36), -.1); add(fx, stepf(.5, 300, 2500), bt + .16, db(-38), -.15)
add(fx, cloth(.8), shot['S8b'] + .3, db(-38), -.1)
for bt in np.arange(H['l11b'] + .45, S2a - .2, .33): add(fx, stepf(.6, 300, 2500), bt, db(-36), .15); add(fx, stepf(.5, 300, 2500), bt + .16, db(-38), .2)
for tn in [shot['S10'] + .2, shot['S10'] + 1.4, H['l11b'] + .3]: add(fx, bird(.4), tn, db(-40), .4)   # cold dawn birds
# the climax: one rising chime per veil the light crosses; a long shimmer; the stool creaks as he stands; the glow goes over the cut (L-cut)
for i in range(4): add(fx, chime(1600 * 2 ** (i / 4), 1.4), X + i * .2, db(-35), -.3 + i * .2)
add(fx, shimmer(3.2, 900), X + .5, db(-30), 0)
creak = bp(np.sign(np.sin(2 * np.pi * (60 + 20 * np.sin(t_(.6) * 5)) * t_(.6))), 200, 1100) * np.sin(np.pi * t_(.6) / .6) ** 2
add(fx, norm(creak), LV - .25, db(-38), 0)
# day in the workshop: birds, a quiet street, the plane on the board
add(fx, lp(bp(brown(DUR + 1), 150, 900), 700)[:N] * env_lin([(0, 0), (shot['S12'] - .3, 0), (shot['S12'] + .2, .4), (DUR + 1, .35)]), 0, db(-40), -.1)
for tn in [shot['S12'] + .4, shot['S12'] + 1.9, H['pregunta'] + 1.5]: add(fx, bird(.5), tn, db(-38), .3 * (1 if rng.random() > .5 else -1))
for k in range(int((DUR - shot['S12']) * 3.2 / (2 * np.pi) * 2)):
    tn = shot['S12'] + k * np.pi / 3.2
    if tn < H['pregunta'] - .1 or tn > end('l13') + .1: add(fx, plane(.4), tn, db(-38), .1)
add(fx, paper(.3), H['pregunta'] + .5, db(-40), .2)                 # Clawd turns his head
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
# the score grows from the first dream to the climax (l12/l12b) and settles at the end
music *= db(env_lin([(0, -3), (S1a, -3), (S1b, -2), (shot['S8'], -1), (shot['S10'], 0), (S2a, 1.5), (X - .1, 1.5), (LV, 4.5), (shot['S12'], 3), (shot['S12'] + 1.5, 0), (DUR + 1, 0)]))[:, None]
mix = music + fx * db(-1) + vo[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)].astype(np.float32), SR)
def seg_db(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(rms(x))
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print(f'silence 1 {S1a + .15:.2f}-{S1b - .1:.2f}: {seg_db(S1a + .15, S1b - .1):.1f} dB   silence 2 {S2a + .15:.2f}-{S2b - .1:.2f}: {seg_db(S2a + .15, S2b - .1):.1f} dB')
print(f'before s1 {seg_db(S1a - 1.2, S1a - .2):.1f} dB   act1 {seg_db(2, 10):.1f} dB   road {seg_db(shot["S8b"], shot["S9"]):.1f} dB   climax {seg_db(X, X + 1.8):.1f} dB   whole {seg_db(0, DUR):.1f} dB')
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
