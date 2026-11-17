"""Dos fuegos (Pedro y Judas): original score + foley + narration from timeline.json -> out/mix.wav. Run with the library's .venv python.
Re dórico de noche, re sin tercera en lo de Judas, re mayor desde «Apacienta». Arpa, cuerdas, flauta, celesta (= glockenspiel), vibráfono frotado, una campana.
Two true silences (after «Tres veces» and after «no volvió»): music, foley and reverb tails are gated to zero there."""
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
S.seed(11); rng = np.random.default_rng(5)
def db(x): return 10 ** (np.asarray(x) / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def env_lin(pts): xs, ys = zip(*pts); return np.interp(tt, xs, ys)
shot = {a: b for a, b, _ in TL['SHOTS']}
ev = []
def n(t, inst, p, d, v, pan=0., **k): ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **k))

# the two silences (start, end): nothing at all sounds inside them
SIL1 = (H['sil1'] + .08, H['gallo'] - .02)
SIL2 = (H['sil2'] + .1, shot['S8'] - .05)

# ——— S1 the fire: D pedal, sparse harp, the bowed vibraphone when the flame rises ———
n(0, 'contrabass', 'D2', shot['S3'] - .2, .22, 0, attack=1.2, release=.6)
n(.4, 'cellos', 'A2', shot['S2'] + .6, .16, -.2, attack=1.6, release=.8)
for tn, p in [(.25, 'D4'), (1.4, 'A3'), (H['l01b'], 'F4'), (H['l02'] + .2, 'E4'), (H['l02'] + 1.1, 'D4')]: n(tn, 'harp', p, 2.6, .28, -.25)
n(H['noche'] - .1, 'vibraphone_bowed', 'A4', 2.6, .3, .2)
# ——— S2 the garden: pizzicato steps, the falling flute motif la–sol–fa–mi, one drum stroke on «beso», a silver glint (celesta) ———
a = shot['S2']
for j, p in enumerate(['D3', 'A2', 'D3', 'C3', 'D3', 'A2', 'F2', 'A2']): n(a + .2 + j * .5, 'cellos_pizz', p, .8, .3, -.1)
for j, (p, d) in enumerate([('A4', 1.0), ('G4', .5), ('F4', .5), ('E4', 1.6)]): n(a + .5 + sum([1.0, .5, .5][:j]), 'flute', p, d * .95, .3, .2, attack=.08)
n(H['beso'], 'frame_drum', None, 1.2, .5, 0)
n(H['monedas'] + .02, 'glockenspiel', 'E7', 1.2, .22, .35); n(H['monedas'] + .1, 'glockenspiel', 'B6', 1.0, .14, .35)
# ——— S3 the girl: low cellos, the motif once more, lower; a harp note on each «no» ———
a = shot['S3']
for p, v in [('D3', .2), ('A3', .15)]: n(a, 'cellos', p, SIL1[0] - a - .25, v, -.15, attack=1.2, release=.15)
for j, (p, d) in enumerate([('A3', .9), ('G3', .45), ('F3', .45), ('E3', 1.4)]): n(a + 1.0 + sum([.9, .45, .45][:j]), 'flute', p, d * .95, .22, .2, attack=.1)
for tn, p in zip([H['no1'], H['no2'], H['no3']], ['D4', 'A3', 'F3']): n(tn, 'harp', p, 1.2, .26, -.3)
# ——— silence 1 ——— then S4: after the rooster, open fifths, a long bowed note on «miró»
a = H['l08']
for p, v, i in [('D3', .2, 'cellos'), ('A3', .18, 'violas'), ('D4', .14, 'violas')]: n(a - .3, i, p, shot['S5'] - a + 1.2, v, 0, attack=1.0, release=.8)
n(H['miro'] - .05, 'vibraphone_bowed', 'D4', 3.0, .34, .1)
# ——— S5 the weeping: the flute alone, low, down to mi, unresolved ———
a = shot['S5']
for j, (p, d) in enumerate([('A4', .7), ('G4', .45), ('F4', .45), ('E4', 1.6)]): n(a + .3 + sum([.7, .45, .45][:j]), 'flute', p, d * .95, .26, .15, attack=.1)
# ——— S6–S7 the temple: D without a third, held very low; it dies on «salió del templo» ———
a = shot['S6']
for p, v, i in [('D3', .18, 'cellos'), ('A3', .14, 'cellos'), ('D2', .14, 'contrabass')]: n(a, i, p, H['salio'] + .6 - a, v, 0, attack=1.0, release=.6)
# ——— silence 2 ——— then S8 the shore: D dorian again, a slow harp, the celesta
a = shot['S8']
for p, v, i in [('D2', .18, 'contrabass'), ('D3', .2, 'cellos'), ('A3', .16, 'violas')]: n(a + .3, i, p, shot['S10'] - a + .2, v, 0, attack=1.6, release=.6)
for j, p in enumerate(['D3', 'A3', 'D4', 'E4', 'F4', 'A4', 'C5', 'A4']): n(a + .6 + j * .55, 'harp', p, 2.0, .26, -.2 + j * .05)
for tn, p in [(a + 1.2, 'A6'), (H['orilla'], 'D7'), (H['brasas'] + .2, 'F6')]: n(tn, 'glockenspiel', p, 1.6, .14, .3)
# ——— S9 the questions: one bowed note per pulse (re–fa–la); the flute begins to rise; the strings swell ———
for j, p in enumerate(['D4', 'F4', 'A4']): n(H['preguntas'] + j * .62, 'vibraphone_bowed', p, 2.4, .32, [-.2, 0, .2][j])
for j, p in enumerate(['D5', 'E5', 'F5']): n(H['amas'] + j * .3, 'flute', p, .5 if j < 2 else 1.2, .28, .15, attack=.06)
a = shot['S9']
for p, v, i in [('F3', .18, 'violas'), ('A3', .18, 'violas'), ('D4', .16, 'violins'), ('C4', .14, 'violins')]: n(a, i, p, H['apacienta'] - a + .1, v, 0, attack=1.6, release=.3)
# ——— S10 climax: D major opens on «Apacienta»; one tubular bell and a harp sweep on «ovejas»; the flute rises re–mi–fa#–la ———
X, O = H['apacienta'], H['ovejas']
for p, v, i, pan in [('D2', .4, 'contrabass', 0), ('D3', .4, 'cellos', -.3), ('A3', .36, 'violas', -.1), ('D4', .36, 'violas', .1), ('F#4', .36, 'violins', .2), ('A4', .36, 'violins', .3), ('D5', .32, 'violins', .25)]:
    n(X - .05, i, p, shot['S11'] - X + 1.6, v, pan, attack=.5, release=2.0)
for p, v in [('A3', .3), ('D4', .28)]: n(X, 'horn', p, 3.2, v, -.1, attack=.4, release=1.4)
n(O, 'tubular_bells', 'D4', 4.5, .5, 0)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): n(O - .3 + j * .045, 'harp', p, 2.4, .4, .15)
for j, (p, d) in enumerate([('D5', .4), ('E5', .4), ('F#5', .4), ('A5', 1.8)]): n(X + .1 + j * .4, 'flute', p, d, .32, .2, attack=.05)
# ——— S11 the fire still burning: low strings in D major, harp, the celesta under the question, a last flute D5 ———
a = shot['S11'] + 1.0
for p, v, i in [('D2', .2, 'contrabass'), ('D3', .2, 'cellos'), ('A3', .17, 'violas'), ('F#4', .14, 'violins')]: n(a, i, p, DUR - a + .5, v, 0, attack=1.4, release=1.5)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'F#4', 'D4', 'A3']): n(a + j * .6, 'harp', p, 2.4, .26, -.2 + j * .05)
for tn, p in [(H['cta'] + .1, 'A6'), (H['cta'] + .7, 'F#6'), (H['palabra'], 'D6')]: n(tn, 'glockenspiel', p, 2.0, .16, .25)
n(DUR - 2.4, 'flute', 'D5', 2.2, .24, .15, attack=.3)

music = S.render(ev, dur=DUR + 1); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music = S.room(music, size=.55, mix=.22); music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
# music fades down into each silence; nothing passes inside
gate = env_lin([(0, 1), (SIL1[0] - .45, 1), (SIL1[0], 0), (SIL1[1], 0), (SIL1[1] + .05, 1),
                (H['salio'] + .3, 1), (SIL2[0] - .1, 0), (SIL2[1], 0), (SIL2[1] + .4, 1), (DUR + 1, 1)])
music *= gate[:, None]

# ——— foley (synthesised) ———
fx = np.zeros((N, 2))
def crackle(d):
    x = np.zeros(int(d * SR)); k = rng.poisson(14 * d)
    for p in rng.integers(0, len(x) - 400, k): ln = int(rng.integers(40, 300)); x[p:p + ln] += rng.standard_normal(ln) * np.exp(-np.arange(ln) / (ln / 4)) * rng.uniform(.3, 1)
    return bp(x, 900, 7000) + .5 * lp(brown(d), 300)[:len(x)]
def rooster():
    # ki-ki-ri-kiii: a harmonic voice with a rough edge, four syllables, the last long and falling
    out = np.zeros(int(1.25 * SR))
    for t0, d, f0, f1 in [(0, .11, 620, 760), (.15, .11, 700, 820), (.3, .13, 760, 930), (.47, .7, 950, 640)]:
        x = t_(d); f = np.interp(x, [0, d * .3, d], [f0, f1, f1 * .95 if d < .2 else f0]); ph = 2 * np.pi * np.cumsum(f) / SR
        s = sum(np.sin(m * ph) / m ** .7 for m in range(1, 9)) * (1 + .35 * np.sin(2 * np.pi * 70 * x))
        s *= np.minimum(1, x / .015) * np.minimum(1, (d - x) / .04) ** .7
        i = int(t0 * SR); out[i:i + len(s)] += s
    return norm(bp(out, 500, 4500) + .08 * bp(noise(len(out) / SR), 1500, 5000)[:len(out)] * np.abs(out) / (np.abs(out).max() + 1e-9))
def clink(v=1., f=1.):
    d = .35; x = t_(d); return norm(sum(a * np.sin(2 * np.pi * fr * f * x + i) * np.exp(-x / tau) for i, (fr, a, tau) in enumerate([(2150, 1, .09), (3420, .7, .06), (5230, .5, .045), (7710, .3, .03)]))) * v
def rattle(d=.6): x = t_(d); return norm(bp(noise(d), 2500, 8000)[:len(x)] * (np.abs(np.sin(2 * np.pi * x * (16 - 12 * x / d))) ** 6) * np.exp(-x / (d * .5)))
def paper(d=.5): return norm(bp(noise(d), 1400, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def door(): d = 1.2; x = t_(d); return norm(lp(brown(d), 160)[:len(x)] * np.minimum(1, x / .01) * np.exp(-x / .25) + .3 * bp(noise(d), 200, 900) * np.exp(-x / .08))
def splash(d=.7): return norm(bp(noise(d), 400, 5000) * np.minimum(1, t_(d) / .03) * np.exp(-t_(d) / .2))
def shimmer(d=1.6, f0=1100):
    x = t_(d); s = sum(np.sin(2 * np.pi * f0 * m * (1 + .2 * x / d) * x + m) / m for m in (1, 1.5, 2, 3)) * np.sin(np.pi * x / d) ** 2 * np.exp(-x / d); return norm(s)

fire = norm(crackle(DUR + 1))[:N]
add(fx, fire * env_lin([(0, 1), (shot['S2'] + .4, .8), (shot['S2'] + 1.6, 0), (shot['S3'] - .4, 0), (shot['S3'] + .2, 1), (SIL1[0] - .05, 1), (SIL1[0], 0), (SIL1[1] + .5, 0), (SIL1[1] + 1.2, .35),
                       (shot['S5'], .35), (shot['S6'], 0), (shot['S8'] + 1.2, 0), (shot['S8'] + 2.2, .35), (DUR + 1, .45)]) * db(-30), 0, 1, 0)
wind = norm(bp(noise(DUR + 1), 250, 1500))[:N] * (.6 + .4 * np.sin(2 * np.pi * tt / 4.3))
add(fx, wind * env_lin([(0, 0), (shot['S2'], 0), (shot['S2'] + .6, .7), (shot['S3'], 0), (H['l08'], 0), (H['l08'] + .5, .5), (shot['S6'], .3), (H['salio'], .6), (SIL2[0] - .1, 0), (DUR + 1, 0)]) * db(-36), 0, 1, .2)
waves = norm(bp(brown(DUR + 1), 90, 1200))[:N] * (.5 + .5 * np.sin(2 * np.pi * tt / 3.7) ** 2)
add(fx, waves * env_lin([(0, 0), (SIL2[1], 0), (SIL2[1] + .6, .9), (H['apacienta'], .9), (DUR + 1, .7)]) * db(-32), 0, 1, 0)
add(fx, paper(.6), .3, db(-34), .2)
add(fx, thump(.25), H['volvio'] + .3, db(-32), -.1)
add(fx, clink(.8), H['monedas'] + .05, db(-27), .3)
for tn in [H['no1'], H['no2'], H['no3']]: add(fx, thump(.3), tn + .02, db(-24), -.1)
add(fx, paper(.4), H['tres'] + .1, db(-33), .25)
add(fx, rooster(), H['gallo'], db(-17), .35)
add(fx, thump(.4, 55), H['lloro'] - .2, db(-30), .1)
# coins: each falls, strikes, bounces once and rolls; the last one rolls on its own a little longer
R2 = np.random.default_rng(31)
for i in range(9):
    at = H['devolvio'] - .25 + i * .09 + R2.random() * .05 + np.sqrt(2 * .11 / 1.6)
    add(fx, clink(1, .95 + .1 * R2.random()), at, db(-22 - 2 * (i % 3)), (R2.random() - .5) * .6)
    add(fx, clink(.5, 1.05), at + .17, db(-30), (R2.random() - .5) * .6)
add(fx, rattle(.9), H['devolvio'] + .9, db(-30), .2)
for j in range(5): add(fx, thump(.15, 90), H['l11'] - .9 + j * .45, db(-34 - 2 * j), 0)   # steps on stone, going away
add(fx, door(), H['no_volvio'] + .32, db(-17), 0)
add(fx, splash(.7), shot['S8'] + 1.0, db(-30), -.1); add(fx, splash(.5), shot['S8'] + 1.7, db(-33), -.05)
for j in range(3): add(fx, paper(.5), H['apacienta'] + j * .3, db(-29), [-.3, .3, 0][j])
add(fx, shimmer(2.0, 900), H['ovejas'], db(-28), 0)
add(fx, paper(.25), H['cta'], db(-31), -.2)
fx *= env_lin([(0, 1), (SIL1[0] - .03, 1), (SIL1[0], 0), (SIL1[1] - .01, 0), (SIL1[1], 1), (SIL2[0] - .2, 1), (SIL2[0], 0), (SIL2[1], 0), (SIL2[1] + .02, 1), (DUR + 1, 1)])[:, None]

# ——— voice (Kokoro ef_dora, clean, untouched) ———
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
# the score grows toward the climax: quieter at night, full on «Apacienta»
music *= db(-27) / rms(music[np.abs(music).sum(1) > 1e-5])
music *= db(env_lin([(0, -3), (shot['S8'], -3), (shot['S9'], -1), (H['apacienta'] - .1, 0), (H['apacienta'] + .3, 4), (shot['S11'] + 1.5, 2), (DUR + 1, 0)]))[:, None]
speak = uniform_filter1d(maximum_filter1d(act.astype(float), int(.25 * SR)), int(.25 * SR))
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music = music * db(-6 * speak)[:, None] - mid * (1 - db(-3)) * speak[:, None]
mix = music + fx + vo[:, None]
mix = np.stack([limit(mix[:, c], .89) for c in (0, 1)], 1)
mix = mix[:int(DUR * SR)]
fade = np.ones(len(mix)); k = int(.6 * SR); fade[-k:] = np.linspace(1, 0, k) ** 1.5; mix *= fade[:, None]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
def lvl(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def peak(a, b): x = mix[int(a * SR):int(b * SR)]; return 20 * np.log10(np.abs(x).max() + 1e-12)
print('mix done', DUR, 'instruments', sorted({e['inst'] for e in ev}))
print(f'silence 1 {SIL1[0]:.2f}-{SIL1[1]:.2f}: rms {lvl(*SIL1):.1f} dB peak {peak(*SIL1):.1f} dB · silence 2 {SIL2[0]:.2f}-{SIL2[1]:.2f}: rms {lvl(*SIL2):.1f} dB peak {peak(*SIL2):.1f} dB · whole: {lvl(0, DUR):.1f} dB')
print('credits:'); print(S.credits(sorted({e['inst'] for e in ev})))
