"""Música procedural (lo-fi trap 120 BPM) + efectos según los beats + mezcla con la voz -> mix_raw.wav
Uso (en la carpeta de trabajo): python3 audio.py"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
TL = json.load(open('timeline.json'))
DUR = TL['total']
N = int(DUR * SR)
rng = np.random.default_rng(7)


def t_(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.002, r=None):
    t = t_(d); e = np.minimum(1, t / a) if a > 0 else np.ones_like(t)
    return e * (np.exp(-t / r) if r else 1)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) < 0: return
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), len(buf) - i); buf[i:i + n] += g * x[:n]
def midi(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- instruments ----------------
def kick(d=0.45):
    t = t_(d); f = 45 + 110 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) + 0.3 * lp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.004)
def clap(d=0.3):
    t = t_(d); n = bp(rng.standard_normal(len(t)), 900, 5000)
    e = sum(np.exp(-np.maximum(0, t - o) / 0.012) * (t >= o) for o in (0, 0.011, 0.022)) * 0.6 + np.exp(-t / 0.09) * 0.5
    return n * e
def hat(d=0.06, open_=False):
    t = t_(0.25 if open_ else d); return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / (0.08 if open_ else 0.015))
def b808(f, d):
    t = t_(d); x = np.sin(2 * np.pi * f * t) ; x = np.tanh(2.2 * x) * np.minimum(1, t / 0.005) * np.exp(-t / 0.9)
    rel = np.minimum(1, (d - t) / 0.03); return x * rel
def pad(freqs, d):
    t = t_(d); x = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.12):
            ph = rng.random()
            x += 2 * ((f * (1 + det / 100) * t + ph) % 1) - 1
    x = lp(x / len(freqs), 1400, 2)
    e = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.3)
    return x * e * 0.25
def keys(f, d=0.8):
    t = t_(d); return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t / 0.35) * np.minimum(1, t / 0.004)

# chord loop: Am9, Fmaj7, Cmaj7, G6  (1 bar = 2 s each)
CH = [([57, 60, 64, 67, 71], 45), ([53, 57, 60, 64], 41), ([48, 52, 55, 59, 62], 36), ([55, 59, 62, 64], 43)]
music = np.zeros(N + SR)
drums = np.zeros(N + SR)
bars = int(np.ceil(DUR / 2))
for b in range(bars):
    t0 = b * 2.0
    notes, root = CH[b % 4]
    add(music, pad([midi(m) for m in notes], 2.05), t0, 1.0)
    for k, step in enumerate([0, 0.75, 1.5]):
        add(music, keys(midi(notes[(k * 2 + b) % len(notes)] + 12), 0.7), t0 + step, 0.10)
    # 808 pattern
    for st, d in ((0, 0.7), (0.75, 0.45), (1.25, 0.6)):
        add(music, b808(midi(root - 12 + (12 if st == 1.25 and b % 2 else 0)), d), t0 + st, 0.55)
    # drums (half-time trap feel)
    for st in (0, 0.75, 1.25 if b % 2 else 1.75):
        add(drums, kick(), t0 + st, 0.9)
    add(drums, clap(), t0 + 1.0, 0.55)
    for h in range(16):
        st = h * 0.125
        roll = (b % 4 == 3 and h >= 12)
        if roll:
            for r in range(3): add(drums, hat(), t0 + st + r * 0.125 / 3, 0.18)
        else:
            add(drums, hat(open_=(h == 14 and b % 2 == 0)), t0 + st, 0.22 if h % 2 == 0 else 0.13)
music = music + drums
# dead stop on the last beat; tiny fade to avoid click
cut = int((DUR - 0.02) * SR)
music[cut:] = 0
music[cut - 240:cut] *= np.linspace(1, 0, 240)
music = music[:N]

# ---------------- SFX ----------------
def whoosh(d=0.45, up=True):
    t = t_(d); n = rng.standard_normal(len(t)); out = np.zeros(len(t))
    seg = 256
    for i in range(0, len(t), seg):
        k = i / len(t); f = 300 + (5000 if up else 2500) * (k if up else 1 - k)
        out[i:i + seg] = bp(n[i:i + seg + 512], max(80, f * .6), min(20000, f * 1.6), 1)[:len(out[i:i + seg])]
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return out * e * 1.4
def impact(d=1.2):
    t = t_(d); f = 38 + 70 * np.exp(-t / 0.06)
    return np.tanh(1.8 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.35) + 0.4 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.05)
def pop(f=900):
    t = t_(0.09); fr = f * (1 + 1.5 * np.exp(-t / 0.01))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.025)
def tick(f=2200):
    t = t_(0.04); return (np.sin(2 * np.pi * f * t) + 0.5 * hp(rng.standard_normal(len(t)), 3000)) * np.exp(-t / 0.006)
def click():
    t = t_(0.03); return bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.004)
def bell(f, d=1.2):
    t = t_(d); return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (d * dd)) for a, r, dd in ((1, 1, .5), (.5, 2.76, .2), (.3, 5.4, .1), (.2, 8.9, .06)))
def chaching():
    x = np.zeros(int(1.4 * SR)); add(x, bp(rng.standard_normal(int(.08 * SR)), 2000, 8000) * env(.08, .001, .02), 0, .8)
    add(x, bell(1568, 1.0), 0.06, .5); add(x, bell(2093, 1.2), 0.13, .5); return x
def riser(d):
    t = t_(d); f = 200 * (8 ** (t / d)); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + hp(rng.standard_normal(len(t)), 2000) * 0.3 * (t / d)
    return s * (t / d) ** 1.5
def chime():
    x = np.zeros(int(1.8 * SR))
    for i, m in enumerate((72, 76, 79, 84)): add(x, bell(midi(m), 1.4), i * 0.07, .35)
    return x
def glitchnoise(d=0.14):
    t = t_(d); n = rng.standard_normal(len(t)); sq = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.4
    return (bp(n, 500, 7000) * 0.7 + sq) * (np.floor(t * 60) % 2 * 0.6 + 0.4)
def sparkle():
    x = np.zeros(int(1.5 * SR))
    for i in range(10): add(x, bell(midi(84 + int(rng.integers(0, 12))), .5), i * 0.06 + rng.random() * .03, .12)
    return x

fx = np.zeros(N + 2 * SR)
A = lambda x, t, g=1.0: add(fx, x, t, g)
SFX = dict(impact=lambda t: A(impact(), t, .8), pop=lambda t: A(pop(900), t, .5), whoosh=lambda t: A(whoosh(.4), t - .2, .45),
           chaching=lambda t: A(chaching(), t, .55), chime=lambda t: A(chime(), t, .5), sparkle=lambda t: A(sparkle(), t, .7),
           ding=lambda t: (A(bell(1318, .8), t, .3), A(bell(1760, .8), t + .08, .3)), glitch=lambda t: A(glitchnoise(.2), t, .3))
A(whoosh(.35), 0, .6); A(impact(), 0.0, .9)
scs = TL['scenes']
for i, s in enumerate(scs[1:], 0):
    if i % 2 == 0: A(whoosh(0.4), s['s'] - 0.25, .5)
    else: A(glitchnoise(), s['s'] - 0.07, .35)
for si, sc in enumerate(scs):
    S0 = sc['s']
    if sc.get('label'): A(whoosh(.3), S0 + .02, .3)
    if sc.get('badge'): A(pop(1300), S0 + sc['badge']['t'], .4)
    for p in sc.get('punch', []): A(impact(.6), S0 + p, .45)
    bs = sc['beats']
    for bi, b in enumerate(bs):
        T = S0 + b['t']; ty = b['type']; nxt = S0 + (bs[bi + 1]['t'] if bi + 1 < len(bs) else sc['e'] - sc['s'])
        its = [S0 + it['t'] for it in b.get('items', []) if isinstance(it, dict) and 't' in it]
        if b.get('sfx') in SFX: SFX[b['sfx']](T)
        elif ty == 'big': A(impact(1.2 if b.get('strong') else .8), T, .9 if b.get('strong') else .7)
        elif ty in ('icon', 'text', 'chips') and not (si == 0 and bi == 0): A(pop(700), T + .05, .5)
        if b.get('sparkles'): A(sparkle(), T + .05, .7)
        if b.get('drop'): A(chaching(), T + .3, .55)
        if isinstance(b.get('cross'), dict): A(impact(.8), S0 + b['cross']['t'], .8); A(glitchnoise(.2), S0 + b['cross']['t'], .25)
        if ty == 'counter':
            t = T; iv = .28
            while t < nxt - .1: A(tick(2400 if int((t - T) / .28) % 2 else 1800), t, .35); iv = max(.07, iv * .9); t += iv
        if ty == 'cards':
            for i in range(len(b['items'])): A(pop(800 + i * 120), T - .15 + i * .15, .45)
        if ty in ('orbit', 'chips'):
            if ty == 'orbit': A(whoosh(.9, up=False), T, .35)
            for t in its: A(pop(1100), t, .4)
        if ty == 'pills':
            for it in b.get('bases', []):
                if 't' in it: A(pop(650), S0 + it['t'], .5)
            for t in its: A(pop(1100), t, .45)
        if ty == 'chat':
            t = T + .25; te = S0 + b['underlineAt'] if 'underlineAt' in b else T + 2.4
            while t < te: A(click(), t, .28 * (.7 + .3 * rng.random())); t += .055 + rng.random() * .05
            if 'checkAt' in b: SFX['ding'](S0 + b['checkAt'])
        if ty == 'clone':
            prev = S0 + bs[bi - 1]['t'] if bi > 0 else T - 1.5
            A(riser(max(.5, T - prev)), prev, .25)
            for i in range(8): A(bell(midi(84 + (i * 5) % 12), .5), T + i * .13, .16)
        if ty == 'phone': A(whoosh(.5), T - .2, .4)
        if ty == 'steps':
            for i, t in enumerate(its): A(tick(1500 + 400 * i), t, .6); A(pop(900 + 250 * i), t, .35)
            A(chime(), S0 + b.get('doneAt', (b['items'][-1].get('t', 0) + .55)), .5)
        if ty == 'cta':
            tc = S0 + b.get('keywordAt', b['t'] + 2)
            for i in range(len(b.get('keyword', 'INFO'))): A(click(), tc + .1 + i / 11, .45)
            if 'saveAt' in b: A(pop(1300), S0 + b['saveAt'], .6)
A(pop(700), DUR - 0.35, .6)
fx = fx[:N]

# ---------------- mix ----------------
sr_vo, vo = wavfile.read('vo_track.wav')
vo = resample_poly(vo.astype(np.float64), SR, sr_vo)[:N]
vo = np.pad(vo, (0, N - len(vo)))
def rms_active(x):
    f = x[:len(x) // 2400 * 2400].reshape(-1, 2400); r = np.sqrt((f ** 2).mean(1)); return np.sqrt((r[r > r.max() * 0.1] ** 2).mean())
gv = 0.25 / rms_active(vo)
vo *= gv
music *= (0.25 * 10 ** (-18 / 20)) / rms_active(music)
# light ducking of music under voice
e = np.convolve(np.abs(vo), np.ones(4800) / 4800, 'same'); duck = 1 - 0.3 * np.clip(e / (e.max() * .3), 0, 1)
mix = vo + music * duck + fx * 0.32
mix /= np.abs(mix).max() / 0.9
wavfile.write('mix_raw.wav', SR, mix.astype(np.float32))
print('ok', DUR)
#print('peaks', np.abs(vo).max(), np.abs(music*duck).max(), np.abs(fx*0.32).max(), 'rms', rms_active(vo), rms_active(music), rms_active(fx*.32))
