#!/usr/bin/env python3
"""
Synthesises the reel's music bed and mixes it with the Persian voiceover.

No sample library is available in this environment, so the score is generated:
a low drone in D minor, slow evolving pads, a sparse felt-piano motif, plus
room tone and a soft heartbeat pulse under the reveal. Everything is
side-chained (ducked) under the narration so the VO always sits on top.

Output: build/audio.wav  (48 kHz stereo)
"""

from __future__ import annotations

import os
import subprocess
import sys
import wave

import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(ROOT, "build")
TRIM = os.path.join(ROOT, "audio", "trim")

SR = 48000

# VO cue-in times, aligned to the picture edit (see build/timeline.txt)
VO_AT = [
    ("vo-01.wav", 1.05),   # shot 1  @ 0.00
    ("vo-02.wav", 7.90),   # shot 2  @ 7.40
    ("vo-03.wav", 13.60),  # shot 3  @ 13.10  (runs across shot 4)
    ("vo-04.wav", 23.45),  # shot 5  @ 23.00
    ("vo-05.wav", 29.90),  # shot 6  @ 29.40
    ("vo-06.wav", 38.40),  # shot 7  @ 37.90
    ("vo-07.wav", 45.45),  # shot 8  @ 44.90
    ("vo-08.wav", 55.80),  # shot 9  @ 55.30
    ("vo-09.wav", 62.60),  # shot 10 @ 61.80
]

TOTAL = 68.20


def read_wav(path):
    with wave.open(path, "rb") as w:
        n = w.getnframes()
        raw = w.readframes(n)
        a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(axis=1)
        assert w.getframerate() == SR, path
    return a


def adsr(n, a, d, s, r, sus=0.7):
    env = np.ones(n, np.float32) * sus
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    ai, di, ri = min(ai, n), min(di, n), min(ri, n)
    if ai:
        env[:ai] = np.linspace(0, 1, ai)
    if di and ai + di <= n:
        env[ai:ai + di] = np.linspace(1, sus, di)
    if ri:
        env[-ri:] *= np.linspace(1, 0, ri)
    return env


def note(freq, dur, t0, buf, amp=0.2, kind="pad", detune=0.004):
    n = int(dur * SR)
    i0 = int(t0 * SR)
    if i0 >= len(buf):
        return
    n = min(n, len(buf) - i0)
    t = np.arange(n, dtype=np.float32) / SR

    if kind == "pad":
        sig = np.zeros(n, np.float32)
        for k, w in ((1, 1.0), (2, 0.34), (3, 0.16), (4, 0.09), (6, 0.04)):
            for det in (-detune, 0.0, detune):
                sig += w * np.sin(2 * np.pi * freq * k * (1 + det) * t
                                  + k * 0.7)
        sig /= 6.0
        # slow chorus movement
        sig *= 1.0 + 0.06 * np.sin(2 * np.pi * 0.13 * t)
        env = adsr(n, 1.8, 1.4, 0.0, 2.6, sus=0.72)

    elif kind == "piano":
        sig = np.zeros(n, np.float32)
        for k, w in ((1, 1.0), (2, 0.42), (3, 0.19), (4, 0.11), (5, 0.05),
                     (7, 0.025)):
            decay = np.exp(-t * (1.6 + k * 0.55))
            sig += w * np.sin(2 * np.pi * freq * k * t) * decay
        sig /= 1.8
        # felt-hammer thump
        sig += np.exp(-t * 46) * np.sin(2 * np.pi * freq * 0.5 * t) * 0.16
        env = adsr(n, 0.004, 0.10, 0.0, min(0.9, dur * 0.5), sus=0.55)

    else:  # sub drone
        sig = (np.sin(2 * np.pi * freq * t)
               + 0.30 * np.sin(2 * np.pi * freq * 2 * t + 0.4)
               + 0.10 * np.sin(2 * np.pi * freq * 3 * t))
        sig *= 1.0 + 0.09 * np.sin(2 * np.pi * 0.07 * t)
        env = adsr(n, 2.5, 1.0, 0.0, 3.0, sus=0.85)

    buf[i0:i0 + n] += sig * env * amp


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = a * acc + (1 - a) * x[i]
        y[i] = acc
    return y


def lp_fast(x, cutoff):
    """FFT low-pass — much faster than a per-sample loop at this length."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1.0 / (1.0 + (f / cutoff) ** 2)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def hp_fast(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (f / cutoff) ** 2 / (1.0 + (f / cutoff) ** 2)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def reverb(x, decay=2.6, mix=0.32):
    """Cheap but smooth: a few delay taps into a decaying noise convolution."""
    n = int(decay * SR)
    rng = np.random.default_rng(3)
    ir = rng.normal(0, 1, n).astype(np.float32) * np.exp(
        -np.arange(n, dtype=np.float32) / (decay * 0.34 * SR))
    ir[:int(0.012 * SR)] = 0
    ir = lp_fast(ir, 3200)
    ir /= np.abs(ir).sum() / 12.0
    wet = np.convolve(x, ir)[:len(x)]
    return x * (1 - mix) + wet * mix


def main():
    n = int(TOTAL * SR)
    t = np.arange(n, dtype=np.float32) / SR

    drone = np.zeros(n, np.float32)
    pads = np.zeros(n, np.float32)
    keys = np.zeros(n, np.float32)

    D2, A2, F3, D3, A3, C4, D4, F4, E4, G4, A4 = (
        73.42, 110.00, 174.61, 146.83, 220.00, 261.63,
        293.66, 349.23, 329.63, 392.00, 440.00)

    # --- drone: D minor throughout, lifting a fifth at the reveal
    note(D2, 48.0, 0.0, drone, amp=0.16, kind="sub")
    note(A2, 28.0, 37.5, drone, amp=0.10, kind="sub")
    note(D2, 24.0, 45.5, drone, amp=0.15, kind="sub")

    # --- pads: slow harmonic arc, one chord per chapter
    chords = [
        (0.0, 15.0, [D3, F3, A3]),          # heritage — minor, still
        (13.0, 11.5, [D3, F3, C4]),         # craft/material — add the 7th
        (23.0, 8.0, [A2 * 2, C4, E4]),      # the question — unresolved
        (29.2, 9.6, [D3, A3, D4]),          # the slit — open fifths
        (37.7, 8.0, [F3, C4, F4]),          # threshold — lift
        (44.7, 12.0, [D3, A3, D4, F4]),     # masterpiece — full
        (55.1, 13.5, [D3, F3, A3, D4]),     # resolve home
    ]
    for t0, dur, freqs in chords:
        for i, f in enumerate(freqs):
            note(f, dur, t0, pads, amp=0.055 - i * 0.006, kind="pad")

    # --- sparse felt-piano motif; enters with the craft chapter
    motif = [
        (7.9, A3), (9.6, C4), (11.4, D4), (14.0, A3),
        (16.2, F4), (18.4, E4), (21.0, D4),
        (24.2, A3), (26.6, C4),
        (30.2, D4), (32.8, A4), (35.2, F4),
        (38.8, D4), (41.2, E4),
        (46.0, A4), (48.3, F4), (50.4, D4), (53.0, C4),
        (56.4, A3), (59.0, D4), (62.4, A3), (64.6, D4),
    ]
    for t0, f in motif:
        note(f, 3.4, t0, keys, amp=0.085, kind="piano")
    # answering octave-down shadow notes
    for t0, f in motif[::3]:
        note(f / 2, 3.0, t0 + 0.10, keys, amp=0.030, kind="piano")

    # --- room tone: workshop air + a distant bazaar hum
    rng = np.random.default_rng(11)
    air = lp_fast(rng.normal(0, 1, n).astype(np.float32), 520) * 0.045
    air *= 1.0 + 0.35 * np.sin(2 * np.pi * 0.05 * t)
    hiss = hp_fast(rng.normal(0, 1, n).astype(np.float32), 6000) * 0.006

    # --- heartbeat pulse under the reveal (40.5s -> 51s)
    pulse = np.zeros(n, np.float32)
    bt = 44.4
    while bt < 56.2:
        i0 = int(bt * SR)
        ln = int(0.42 * SR)
        if i0 + ln < n:
            tt = np.arange(ln, dtype=np.float32) / SR
            hit = np.sin(2 * np.pi * 46 * tt) * np.exp(-tt * 11)
            ramp = np.clip((bt - 44.4) / 8.0, 0, 1)
            pulse[i0:i0 + ln] += hit * 0.16 * ramp
        bt += 1.30

    # --- a soft amber "shimmer" on each slit-wipe cut
    cuts = [7.40, 13.10, 18.00, 23.00, 29.40, 37.90, 44.90, 55.30, 61.80]
    shimmer = np.zeros(n, np.float32)
    for c in cuts:
        i0 = int((c - 0.10) * SR)
        ln = int(1.5 * SR)
        if i0 < 0 or i0 + ln > n:
            continue
        tt = np.arange(ln, dtype=np.float32) / SR
        s = np.zeros(ln, np.float32)
        for f, w in ((D4 * 2, 1.0), (A4 * 2, 0.5), (F4 * 4, 0.22)):
            s += w * np.sin(2 * np.pi * f * tt)
        s *= np.exp(-tt * 3.1) * (1 - np.exp(-tt * 60))
        shimmer[i0:i0 + ln] += s * 0.020

    bed = drone + pads + keys + air + hiss + pulse + shimmer
    bed = reverb(bed, decay=2.8, mix=0.30)
    bed = lp_fast(bed, 11000)

    # --- voiceover on its own bus
    vo = np.zeros(n, np.float32)
    for name, at in VO_AT:
        a = read_wav(os.path.join(TRIM, name))
        i0 = int(at * SR)
        ln = min(len(a), n - i0)
        if ln <= 0:
            continue
        seg = a[:ln].copy()
        f = int(0.02 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-f:] *= np.linspace(1, 0, f)
        vo[i0:i0 + ln] += seg
        end = at + len(a) / SR
        if end > TOTAL:
            print(f"  !! {name} overruns timeline by {end - TOTAL:.2f}s")

    vo_rev = reverb(vo, decay=1.1, mix=0.11)   # a little room, not a cathedral

    # --- duck the bed under the VO
    envelope = np.abs(vo)
    win = int(0.05 * SR)
    envelope = np.convolve(envelope, np.ones(win, np.float32) / win, "same")
    envelope = lp_fast(envelope, 6.0)
    envelope /= max(envelope.max(), 1e-6)
    duck = 1.0 - 0.62 * np.clip(envelope * 2.4, 0, 1)

    mix = bed * duck + vo_rev * 0.98

    # gentle limiter + master fades
    mix = np.tanh(mix * 1.25) * 0.86
    fi, fo = int(1.2 * SR), int(1.8 * SR)
    mix[:fi] *= np.linspace(0, 1, fi)
    mix[-fo:] *= np.linspace(1, 0, fo)

    peak = np.abs(mix).max()
    mix = mix / peak * 0.94

    # subtle stereo: haas-widened bed, mono-safe centre for the voice
    d = int(0.010 * SR)
    left = mix.copy()
    right = mix.copy()
    wide = np.concatenate([np.zeros(d, np.float32), bed[:-d]]) * 0.25 * duck
    left += wide
    right -= wide * 0.6
    st = np.stack([left, right], axis=1)
    st = np.clip(st, -1, 1)

    os.makedirs(BUILD, exist_ok=True)
    out = os.path.join(BUILD, "audio.wav")
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print("audio ->", out, f"{TOTAL:.2f}s")


if __name__ == "__main__":
    main()
