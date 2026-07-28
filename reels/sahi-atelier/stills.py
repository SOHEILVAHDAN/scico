#!/usr/bin/env python3
"""Dump single graded frames from the reel timeline for visual QA."""
import sys, os
import numpy as np
from PIL import Image
import render as R

os.makedirs(os.path.join(R.ROOT, "build"), exist_ok=True)

t = 0.0
for s in R.SHOTS:
    s.start = t
    t += s.dur - R.XFADE
total = t + R.XFADE

bases = {s.img: R.load_base(s.img) for s in R.SHOTS}
cues = {(i, j): R.render_cue(c) for i, s in enumerate(R.SHOTS) for j, c in enumerate(s.cues)}
endcard = R.render_endcard()
watermark = R.render_watermark()
rng = np.random.default_rng(7)


def frame_at(gt):
    f = int(gt * R.FPS)
    acc = None
    warmth = 1.0
    for i, s in enumerate(R.SHOTS):
        local = gt - s.start
        if local < -0.001 or local > s.dur:
            continue
        u = local / s.dur
        fl = np.asarray(R.ken_burns(bases[s.img], s, u, f + i * 97), np.float32)
        for j, c in enumerate(s.cues):
            if c.t0 - 0.45 < local < c.t1 + 0.45:
                fade = min(1.0, max(0.0, (local - c.t0 + 0.45) / 0.45),
                           max(0.0, (c.t1 + 0.45 - local) / 0.45))
                fade = R.ease(min(fade, 1.0))
                la = np.asarray(cues[(i, j)], np.float32)
                rise = (1.0 - fade) * 26
                if rise > 1:
                    la = np.roll(la, int(rise), axis=0)
                a = (la[..., 3:4] / 255.0) * fade
                fl = fl * (1 - a) + la[..., :3] * a
        if s.img == "10-outro.jpg":
            ec = np.asarray(endcard, np.float32)
            fade = R.ease(min(1.0, max(0.0, (local - 0.35) / 0.9)))
            a = (ec[..., 3:4] / 255.0) * fade
            fl = fl * (1 - a) + ec[..., :3] * a
        w = 1.0
        if local < R.XFADE and i > 0:
            w = R.ease(local / R.XFADE)
        elif local > s.dur - R.XFADE and i < len(R.SHOTS) - 1:
            w = R.ease((s.dur - local) / R.XFADE)
        warmth = s.grade if w >= 0.5 else warmth
        acc = fl * w if acc is None else acc + fl * w
    if acc is None:
        acc = np.zeros((R.H, R.W, 3), np.float32)
    acc = R.grade(acc, warmth, rng)
    for i, s in enumerate(R.SHOTS[:-1]):
        cut = s.start + s.dur - R.XFADE
        d = gt - cut
        if 0 <= d <= R.XFADE:
            acc = R.slit_overlay(acc, d / R.XFADE)
    wm = np.asarray(watermark, np.float32)
    wa = wm[..., 3:4] / 255.0
    acc = acc * (1 - wa) + wm[..., :3] * wa
    return Image.fromarray(acc.astype(np.uint8))


for arg in sys.argv[1:]:
    gt = float(arg)
    out = os.path.join(R.ROOT, "build", f"still-{gt:06.2f}.jpg")
    frame_at(gt).resize((540, 960), Image.LANCZOS).save(out, quality=88)
    print(out)
