"""Synthesised score + sound design for the 34 s DevTrilhas spot."""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
DUR = 34.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)


def midi(m): return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    sig = sig[: max(0, N - i)]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gain * gl
    R[i:i + len(sig)] += sig * gain * gr


# ---------- pad (warm, detuned, slowly filtered) ----------
chords = [  # (start, dur, midi notes)
    (0.0, 4.4, [45, 52, 59, 60, 64]),     # Am(add9)
    (4.0, 5.4, [41, 48, 55, 57, 64]),     # Fmaj7
    (9.0, 5.4, [36, 43, 52, 55, 62]),     # C(add9)
    (14.0, 5.4, [43, 50, 57, 59, 62]),    # G(sus/6)
    (19.0, 5.4, [45, 52, 57, 60, 64]),    # Am
    (24.0, 5.4, [41, 48, 57, 60, 65]),    # F
    (29.0, 5.0, [36, 43, 52, 55, 60, 64]),# C final
]
for k, (st, du, notes) in enumerate(chords):
    n = int(du * SR); tt = np.arange(n) / SR
    s = np.zeros(n)
    for m in notes:
        f = midi(m)
        for d in (-0.07, 0.0, 0.06):
            ph = rng.uniform(0, 2 * np.pi)
            fr = f * (1 + d / 100 * 12 / 12) * (1 + 0.0015 * np.sin(2 * np.pi * 0.2 * tt + ph))
            phase = 2 * np.pi * np.cumsum(fr) / SR + ph
            saw = 2 * ((phase / (2 * np.pi)) % 1) - 1
            s += 0.5 * saw + 0.5 * np.sin(phase)
    s /= len(notes) * 3
    cutoff = 500 + 1400 * (k / len(chords))
    s = lp(s, cutoff, 4)
    s *= env_adsr(n, 1.2, 1.4)
    add(s, st, 0.55, -0.25); add(np.roll(s, 400), st, 0.55, 0.25)

# ---------- sub drone ----------
for st, du, notes in chords:
    n = int(du * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * midi(notes[0] - 12) * tt) * env_adsr(n, 0.8, 1.2)
    add(s, st, 0.22)

# ---------- felt piano ----------
def piano(m, dur=3.5, vel=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR; f = midi(m)
    s = np.zeros(n)
    for h, a in enumerate([1, 0.45, 0.22, 0.12, 0.06, 0.03], 1):
        inh = f * h * (1 + 0.0004 * h * h)
        s += a * np.sin(2 * np.pi * inh * tt) * np.exp(-tt * (1.1 + 0.9 * h))
    ham = lp(rng.standard_normal(n), 2500) * np.exp(-tt * 60) * 0.08
    s = lp(s + ham, 3200)
    s *= np.minimum(1, tt / 0.004)
    return s * vel

motif = [  # time, midi, vel
    (0.4, 76, .5), (1.6, 72, .35), (2.8, 74, .35),
    (4.0, 72, .55), (5.2, 69, .35), (6.4, 76, .4), (7.6, 74, .3),
    (9.0, 79, .5), (10.2, 76, .35), (11.4, 74, .35), (12.6, 72, .3),
    (14.0, 74, .55), (15.2, 79, .4), (16.4, 81, .4), (17.6, 79, .3),
    (19.0, 81, .55), (20.2, 79, .4), (21.4, 76, .4), (22.6, 74, .35),
    (24.0, 77, .55), (25.2, 76, .4), (26.4, 74, .35),
    (29.0, 72, .7), (29.0, 76, .45), (29.0, 79, .4), (29.0, 60, .5),
]
for st, m, v in motif:
    add(piano(m, 4.0, v), st, 0.5, rng.uniform(-0.35, 0.35))

# ---------- pulse (builds from shot 3) ----------
def kick(vel):
    n = int(0.6 * SR); tt = np.arange(n) / SR
    f = 42 + 70 * np.exp(-tt * 30)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
    return s * vel
bt = 60 / 84
x = 9.0
while x < 28.7:
    prog = (x - 9) / 19.7
    add(kick(0.25 + 0.35 * prog), x, 0.9)
    if x > 19:
        add(kick(0.15), x + bt / 2, 0.6)
    x += bt

# ---------- ticking hi texture (clock-like, shots 4-6) ----------
x = 14.0
while x < 28.8:
    n = int(0.05 * SR)
    s = hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * 120)
    add(s, x, 0.05 * (1 + (x - 14) / 15), rng.uniform(-0.6, 0.6))
    x += bt / 2

# ---------- keyboard foley (shot 1 & 3) ----------
def keyclick(v):
    n = int(0.07 * SR); tt = np.arange(n) / SR
    s = bp(rng.standard_normal(n), 1800, 6500) * np.exp(-tt * 140)
    thock = np.sin(2 * np.pi * rng.uniform(180, 260) * tt) * np.exp(-tt * 90) * 0.5
    s2 = np.zeros(n); off = int(rng.uniform(0.035, 0.05) * SR)
    s2[off:] = bp(rng.standard_normal(n - off), 2500, 8000) * np.exp(-tt[: n - off] * 200) * 0.4
    return (s + thock + s2) * v
for a, b in ((0.3, 3.7), (10.0, 13.6)):
    x = a
    while x < b:
        add(keyclick(rng.uniform(0.5, 1.0)), x, 0.18, rng.uniform(-0.3, 0.3))
        x += rng.choice([0.09, 0.11, 0.14, 0.18, 0.22, 0.35, 0.6], p=[.2, .2, .2, .15, .1, .1, .05])

# ---------- risers / whooshes at cuts ----------
def whoosh(dur, up=True):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = rng.standard_normal(n)
    out = np.zeros(n); seg = 256
    y1 = 0.0; y2 = 0.0
    for i in range(0, n, seg):
        k = i / n if up else 1 - i / n
        fc = 300 + 6000 * k ** 2
        a = np.exp(-2 * np.pi * fc / SR)
        for j in range(i, min(n, i + seg)):
            y1 = (1 - a) * s[j] + a * y1
            y2 = (1 - a) * y1 + a * y2
            out[j] = y2
    e = (tt / dur) ** 2.2 if up else np.exp(-tt * 4)
    return out * e
for cut in (4.0, 9.0, 14.0, 19.0, 24.0):
    add(whoosh(0.8), cut - 0.8, 0.10, -0.3); add(whoosh(0.8), cut - 0.8, 0.10, 0.3)
add(whoosh(3.2), 25.8, 0.35, -0.2); add(whoosh(3.2), 25.8, 0.35, 0.2)

# ---------- impact on end card ----------
n = int(4.5 * SR); tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-tt * 6)) / SR) * np.exp(-tt * 1.4)
boom += lp(rng.standard_normal(n), 900) * np.exp(-tt * 5) * 0.4
add(boom, 29.0, 0.8)

# ---------- reverb ----------
ir_n = int(2.8 * SR); it = np.arange(ir_n) / SR
irL = rng.standard_normal(ir_n) * np.exp(-it * 2.3); irR = rng.standard_normal(ir_n) * np.exp(-it * 2.3)
irL = lp(irL, 5000); irR = lp(irR, 5000)
irL /= np.sqrt((irL ** 2).sum()); irR /= np.sqrt((irR ** 2).sum())
wetL = fftconvolve(L, irL)[:N]; wetR = fftconvolve(R, irR)[:N]
L2 = L + 0.35 * wetL; R2 = R + 0.35 * wetR

# ---------- master ----------
mix = np.stack([L2, R2], 1)
mix = hp(mix.T, 28).T
fade = np.ones(N); fo = int(1.5 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2
fi = int(0.15 * SR); fade[:fi] = np.linspace(0, 1, fi)
mix *= fade[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.6) / np.tanh(1.6)
mix *= 0.89
wavfile.write('/tmp/claude-0/work/score.wav', SR, (mix * 32767).astype(np.int16))
print('ok', mix.shape)
