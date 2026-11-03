"""Banda sonora cinematográfica (estilo relato bíblico): dron grave, pads, piano, crescendo y coro en el clímax,
golpes graves en las revelaciones, viento y truenos según el ambiente. Mezcla con la voz -> mix_raw.wav
Uso (en la carpeta de trabajo): python3 audio.py"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
TL = json.load(open('timeline.json'))
DUR = TL['total']
N = int(DUR * SR)
rng = np.random.default_rng(11)


def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) < 0: return
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), len(buf) - i); buf[i:i + n] += g * x[:n]
def env_ar(n, a, r):
    t = np.arange(n) / SR; d = n / SR
    return np.minimum(1, t / max(a, 1e-3)) * np.minimum(1, np.maximum(0, (d - t) / max(r, 1e-3)))


scenes = TL['scenes']
moods = []
for s in scenes:
    m = s.get('mood') or ((s.get('shots') or [{}])[0].get('mood')) or 'night'
    moods.append((s['s'], s['e'], m))
clim = [s['s'] for s in scenes if s.get('climax')]
TC = clim[0] if clim else DUR * 0.6

# ---------- pads y acordes ----------
MINOR = [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [48, 52, 55, 60]]     # Dm Bb F C
MAJOR = [[50, 54, 57, 62], [55, 59, 62, 67], [47, 50, 54, 59], [45, 49, 52, 57]]     # D G Bm A
music = np.zeros(N + SR * 4)
def pad(notes, d, bright):
    t = t_(d); x = np.zeros(len(t))
    for m in notes:
        for det in (-0.15, 0.0, 0.15):
            f = midi(m) * (1 + det / 100)
            x += 2 * ((f * t + rng.random()) % 1) - 1
    x = lp(x / (len(notes) * 3), 700 + 1800 * bright, 2)
    return x * env_ar(len(t), 1.4, 1.6)
CH = 4.0
t = 0.0; k = 0
while t < DUR:
    major = t >= TC - 0.5
    prog = MAJOR if major else MINOR
    add(music, pad(prog[k % 4], CH + 1.6, 1.0 if major else 0.25), t, 0.22 if major else 0.17)
    # piano: arpegio suave
    if t > 1.5:
        for j, st in enumerate(np.arange(0, CH, 0.75 if major else 1.0)):
            m = prog[k % 4][(j * 2 + k) % 4] + 12
            tt = t_(1.8); f = midi(m)
            note = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.1 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt / 0.7) * np.minimum(1, tt / 0.005)
            add(music, note, t + st, 0.07)
    t += CH; k += 1
# dron grave (re) todo el tiempo, más fuerte en el clímax
tt = t_(DUR + 1)
drone = (np.sin(2 * np.pi * midi(38) * tt) + 0.5 * np.sin(2 * np.pi * midi(26) * tt)) * (0.10 + 0.08 * (tt > TC))
drone *= np.minimum(1, tt / 3)
add(music, drone, 0, 1)
# crescendo de cuerdas hacia el clímax
rise_d = min(5.0, TC)
tt = t_(rise_d); x = np.zeros(len(tt))
for m in (50, 57, 62, 69):
    f = midi(m) * (1 + 0.04 * tt / rise_d)
    x += 2 * ((np.cumsum(np.full(len(tt), f)) / SR) % 1) - 1
x = lp(x, 900 + 2500 * (tt.mean() / rise_d)) * (tt / rise_d) ** 2
add(music, x, TC - rise_d, 0.10)
# coro tras el clímax ("aah": sierras con formantes)
cd = DUR - TC
if cd > 0.5:
    tt = t_(cd); x = np.zeros(len(tt))
    for m in (62, 66, 69, 74):
        for det in (-0.3, 0.3):
            f = midi(m) * (1 + det / 100) * (1 + 0.004 * np.sin(2 * np.pi * 5 * tt))
            x += 2 * ((np.cumsum(f) / SR) % 1) - 1
    choir = bp(x, 600, 900) + 0.6 * bp(x, 1100, 1400)
    add(music, choir * env_ar(len(tt), 1.2, 2.0), TC, 0.05)
# corte final suave
fade = int(1.2 * SR); end = int(DUR * SR)
music[end - fade:end] *= np.linspace(1, 0, fade); music[end:] = 0
music = music[:N]

# ---------- efectos ----------
fx = np.zeros(N + SR * 4)
def boom(d=2.5):
    t = t_(d); f = 32 + 40 * np.exp(-t / 0.15)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9) + 0.25 * lp(rng.standard_normal(len(t)), 200) * np.exp(-t / 0.3)
def swell(d=1.6):
    t = t_(d); n = bp(rng.standard_normal(len(t)), 300, 4000)
    return n * (t / d) ** 2.5 * 0.6
def wind(d):
    t = t_(d); n = rng.standard_normal(len(t))
    w = lp(n, 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + 1)) ; return w * env_ar(len(t), 1, 1)
def thunder():
    t = t_(3.0); n = lp(rng.standard_normal(len(t)), 300) * np.exp(-t / 1.1); c = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.05)
    return n * 1.4 + c * 0.4
add(fx, boom(), TC, 0.55)
for s0, s1, m in moods:
    if m in ('night', 'storm'):
        add(fx, wind(s1 - s0 + 0.5), s0, 0.12 if m == 'night' else 0.22)
for sc in scenes:
    for j, sh in enumerate(sc.get('shots') or []):
        t0 = sc['s'] + sh.get('t', 0)
        tr = sh.get('trans') or (sc.get('trans') if j == 0 else None)
        if tr == 'flare' and t0 > 0.5:
            add(fx, swell(1.4), t0 - 1.3, 0.35); add(fx, boom(1.8), t0, 0.3)
        for ev in sh.get('events', []):
            if ev.get('do') == 'lightning': add(fx, thunder(), sc['s'] + ev['t'], 0.5)
    if (sc.get('mood') or '') == 'storm':
        for k in range(8):
            te = sc['s'] + 1.3 + k * 2.7 + 0.4
            if te < sc['e']: add(fx, thunder(), te, 0.35)
fx = fx[:N]

# ---------- mezcla ----------
sr_vo, vo = wavfile.read('vo_track.wav')
vo = resample_poly(vo.astype(np.float64), SR, sr_vo)[:N]
vo = np.pad(vo, (0, N - len(vo)))
def rms_active(x):
    f = x[:len(x) // 2400 * 2400].reshape(-1, 2400); r = np.sqrt((f ** 2).mean(1)); return np.sqrt((r[r > r.max() * 0.1] ** 2).mean())
vo *= 0.25 / rms_active(vo)
music *= (0.25 * 10 ** (-16 / 20)) / rms_active(music)
e = np.convolve(np.abs(vo), np.ones(4800) / 4800, 'same'); duck = 1 - 0.25 * np.clip(e / (e.max() * .3), 0, 1)
mix = vo + music * duck + fx * 0.3
mix /= np.abs(mix).max() / 0.9
wavfile.write('mix_raw.wav', SR, mix.astype(np.float32))
print('ok cine', DUR, 'climax', round(TC, 2))
