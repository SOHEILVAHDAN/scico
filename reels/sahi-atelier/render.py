#!/usr/bin/env python3
"""
SAHI Studio — Leather Atelier
Instagram Reel renderer (1080x1920, 30fps).

Builds a vertical cinematic reel from still frames:
  * Ken Burns push/pan per shot
  * amber "slit of light" transitions (the project's signature motif)
  * warm 2700K grade, vignette, film grain, gate weave
  * burned-in bilingual captions (Persian RTL + Latin chapter labels)

Usage:  python render.py            # full render
        python render.py --preview  # every 6th frame, quick look
"""

from __future__ import annotations

import argparse
import math
import os
import random
import subprocess
import sys
from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

import arabic_reshaper
from bidi.algorithm import get_display

from logo import build_logo

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "assets")
FONTS = os.path.join(ROOT, "fonts")
BUILD = os.path.join(ROOT, "build")
AUDIO = os.path.join(ROOT, "audio")

W, H = 1080, 1920
FPS = 30
XFADE = 0.7          # shot overlap, seconds

AMBER = (232, 168, 86)
AMBER_HOT = (255, 214, 150)
CREAM = (240, 232, 220)

FA_BOLD = os.path.join(FONTS, "Vazirmatn-SemiBold.ttf")
FA_REG = os.path.join(FONTS, "Vazirmatn-Regular.ttf")
FA_LIGHT = os.path.join(FONTS, "Vazirmatn-Light.ttf")
LAT_REG = os.path.join(FONTS, "CormorantGaramond_400Regular.ttf")
LAT_IT = os.path.join(FONTS, "CormorantGaramond_400Regular_Italic.ttf")
LAT_SB = os.path.join(FONTS, "CormorantGaramond_600SemiBold.ttf")


def fa(text: str) -> str:
    """Shape + reorder Persian for PIL (no raqm in this environment)."""
    return get_display(arabic_reshaper.reshape(text))


# ---------------------------------------------------------------- text cues

@dataclass
class Cue:
    t0: float                 # relative to shot start
    t1: float
    fa_lines: list = field(default_factory=list)
    latin: str = ""
    size: int = 62
    y: float = 0.70           # anchor, fraction of height (centre of block)
    align: str = "center"
    italic_latin: bool = False


@dataclass
class Shot:
    img: str
    dur: float
    zoom: tuple = (1.00, 1.10)      # start, end scale
    pan: tuple = (0.0, 0.0, 0.0, 0.0)  # x0,y0 -> x1,y1 in [-1,1] of slack
    cues: list = field(default_factory=list)
    grade: float = 1.0              # warmth multiplier
    start: float = 0.0              # filled in later


SHOTS = [
    # durations are cut to the voiceover; see score.py VO_AT for the sync map
    Shot("01-heritage.jpg", 8.1, (1.00, 1.12), (0.25, 0.35, -0.15, -0.30),
         cues=[Cue(1.00, 7.10, ["یک کارگاهِ کفاشیِ هشتاد ساله،", "در دلِ بازارِ قدیمی."],
                   "A SAHI STUDIO PROJECT", size=64, y=0.72)]),

    Shot("02-craft.jpg", 6.4, (1.12, 1.00), (-0.30, 0.10, 0.20, -0.10),
         cues=[Cue(0.45, 5.35, ["چهار نسل،", "دست‌هایی که چرم را شکل داده‌اند."],
                   "CHAPTER II · CRAFT", size=58, y=0.74)]),

    Shot("03-material.jpg", 5.6, (1.02, 1.14), (-0.20, -0.25, 0.25, 0.20),
         cues=[Cue(0.44, 4.80, ["چرمِ تنباکویی. بتنِ خام.", "مسِ اکسیدشده."],
                   "CHAPTER IV · THE MATERIAL PALETTE", size=58, y=0.74)]),

    Shot("09-wall.jpg", 5.7, (1.14, 1.02), (0.30, 0.20, -0.20, -0.15),
         cues=[Cue(0.40, 4.90, ["موادی که پیر می‌شوند،", "و به یاد می‌آورند."],
                   "2700 K · LIGHT, AS MATERIAL", size=58, y=0.74)]),

    Shot("04-blueprint.jpg", 7.1, (1.00, 1.10), (-0.15, 0.30, 0.15, -0.25),
         cues=[Cue(0.41, 6.10, ["چگونه این فضا را دگرگون کنیم،", "بی‌آنکه حافظه‌اش را پاک کنیم؟"],
                   "CHAPTER III · FROM WORKSHOP TO GALLERY", size=58, y=0.73)]),

    Shot("05-facade.jpg", 9.2, (1.12, 1.00), (0.10, 0.30, -0.05, -0.25),
         cues=[Cue(0.48, 4.00, ["پاسخ، یک شکافِ باریکِ نور بود."],
                   "CHAPTER V · A SLIT OF LIGHT", size=62, y=0.74),
               Cue(4.30, 8.20, ["«ورودی یک در نیست؛", "یک دعوت است.»"],
                   "", size=60, y=0.74, italic_latin=True)]),

    Shot("07-threshold.jpg", 7.7, (1.00, 1.16), (0.0, 0.05, 0.0, -0.05),
         cues=[Cue(0.48, 6.60, ["نور، ابتدا چشم را می‌خواند؛", "و سپس، رهگذر را به درون می‌آورد."],
                   "THE VISITOR'S JOURNEY", size=56, y=0.76)]),

    Shot("06-masterpiece.jpg", 11.1, (1.14, 1.00), (0.0, -0.30, 0.0, 0.25),
         cues=[Cue(0.53, 3.70, ["یک کفش.", "معلق."],
                   "CHAPTER VI · THE MASTERPIECE", size=76, y=0.76),
               Cue(4.00, 10.10, ["در تقاطعِ هشتاد سال صنعت‌گری،", "و یک لحظه نورِ ناب."],
                   "", size=58, y=0.78)]),

    Shot("08-gallery.jpg", 7.2, (1.02, 1.12), (-0.25, 0.15, 0.20, -0.15),
         cues=[Cue(0.50, 6.10, ["از کارگاه، تا گالری."],
                   "ARCHITECTURE AS STORYTELLING", size=64, y=0.75)]),

    Shot("10-outro.jpg", 6.4, (1.06, 1.00), (0.0, 0.0, 0.0, 0.0), grade=0.9),
]


def normalise_cues():
    """Keep captions clear of the slit-wipe so two shots' type never overlap."""
    for i, s in enumerate(SHOTS):
        head = XFADE * 0.55 if i > 0 else 0.35
        tail = s.dur - XFADE - 0.12
        for c in s.cues:
            c.t0 = max(c.t0, head)
            c.t1 = min(c.t1, tail)


normalise_cues()


# ------------------------------------------------------------------ helpers

def load_base(name: str) -> Image.Image:
    """Upscale source to give Ken Burns headroom, keeping 9:16."""
    im = Image.open(os.path.join(ASSETS, name)).convert("RGB")
    target_w = int(W * 1.30)
    target_h = int(H * 1.30)
    src_ar = im.width / im.height
    dst_ar = target_w / target_h
    if src_ar > dst_ar:                      # crop sides
        nw = int(im.height * dst_ar)
        im = im.crop(((im.width - nw) // 2, 0, (im.width + nw) // 2, im.height))
    else:                                    # crop top/bottom
        nh = int(im.width / dst_ar)
        im = im.crop((0, (im.height - nh) // 2, im.width, (im.height + nh) // 2))
    return im.resize((target_w, target_h), Image.LANCZOS)


def ease(t: float) -> float:
    """Smooth in/out — keeps camera moves feeling motorised, not linear."""
    return t * t * (3.0 - 2.0 * t)


def ken_burns(base: Image.Image, shot: Shot, u: float, seed: int) -> Image.Image:
    """u in [0,1] across the shot (may overshoot slightly during overlap)."""
    e = ease(min(max(u, 0.0), 1.0))
    z0, z1 = shot.zoom
    z = z0 + (z1 - z0) * e
    crop_w = W * (base.width / (W * 1.30)) / z
    crop_h = crop_w * H / W

    slack_x = max(base.width - crop_w, 0) / 2
    slack_y = max(base.height - crop_h, 0) / 2
    x0, y0, x1, y1 = shot.pan
    px = x0 + (x1 - x0) * e
    py = y0 + (y1 - y0) * e

    # gate weave: sub-pixel drift, like film in a projector
    wob = 2.2
    px_off = math.sin(seed * 0.11) * wob + math.sin(seed * 0.037) * wob * 0.6
    py_off = math.cos(seed * 0.093) * wob + math.sin(seed * 0.051) * wob * 0.5

    cx = base.width / 2 + px * slack_x + px_off
    cy = base.height / 2 + py * slack_y + py_off
    left = cx - crop_w / 2
    top = cy - crop_h / 2
    left = min(max(left, 0), base.width - crop_w)
    top = min(max(top, 0), base.height - crop_h)

    return base.resize((W, H), Image.BICUBIC,
                       box=(left, top, left + crop_w, top + crop_h))


# ----------------------------------------------------------------- captions

def measure(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0], b[3] - b[1]


def tracked_text(draw, xy, text, font, fill, tracking, anchor_center=True):
    """Letter-spaced Latin caps — the editorial look the site uses."""
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x, y = xy
    if anchor_center:
        x -= total / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += w + tracking
    return total


def render_cue(cue: Cue) -> Image.Image:
    """Pre-render one caption block (RGBA, full frame) once per cue."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    f_fa = ImageFont.truetype(FA_BOLD if cue.size >= 62 else FA_REG, cue.size)
    lat_path = LAT_IT if cue.italic_latin else LAT_SB
    f_lat = ImageFont.truetype(lat_path, 30)

    line_gap = int(cue.size * 1.62)
    n = len(cue.fa_lines)
    block_h = line_gap * n + (52 if cue.latin else 0)
    top = H * cue.y - block_h / 2

    # hairline + letter-spaced Latin label above the Persian
    y = top
    if cue.latin:
        rule_w = 78
        d.line([(W / 2 - rule_w / 2, y - 26), (W / 2 + rule_w / 2, y - 26)],
               fill=AMBER + (190,), width=2)
        tracked_text(d, (W / 2, y - 12), cue.latin.upper(), f_lat,
                     AMBER + (225,), 5.0)
        y += 52

    for i, line in enumerate(cue.fa_lines):
        shaped = fa(line)
        tw = d.textlength(shaped, font=f_fa)
        d.text((W / 2 - tw / 2, y + i * line_gap - cue.size * 0.15),
               shaped, font=f_fa, fill=CREAM + (255,))

    # soft shadow so type survives any background
    shadow = layer.filter(ImageFilter.GaussianBlur(9))
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dark = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dark.putalpha(shadow.getchannel("A").point(lambda a: int(a * 0.85)))
    out = Image.alpha_composite(out, dark)
    return Image.alpha_composite(out, layer)


# -------------------------------------------------------------- grade / fx

def build_vignette():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    nx = (xx - W / 2) / (W / 2)
    ny = (yy - H / 2) / (H / 2)
    r = np.sqrt(nx * nx * 0.92 + ny * ny * 0.78)
    v = 1.0 - 0.62 * np.clip(r - 0.25, 0, None) ** 1.7
    return np.clip(v, 0.22, 1.0)[..., None]


def build_scrim():
    """Bottom gradient so captions always read."""
    g = np.zeros((H, W, 1), np.float32)
    grad = np.clip((np.arange(H) - H * 0.50) / (H * 0.50), 0, 1) ** 1.5
    g[:, :, 0] = grad[:, None] * 0.72
    top = np.clip((H * 0.16 - np.arange(H)) / (H * 0.16), 0, 1) ** 1.4
    g[:, :, 0] = np.maximum(g[:, :, 0], top[:, None] * 0.45)
    return g


VIGNETTE = build_vignette()
SCRIM = build_scrim()

# 2700 K channel gains + a lifted, slightly green-teal shadow (copper patina)
WARM = np.array([1.055, 0.995, 0.912], np.float32)
SHADOW_TINT = np.array([2.5, 5.0, 7.0], np.float32)


def grade(arr: np.ndarray, warmth: float, rng: np.random.Generator) -> np.ndarray:
    a = arr.astype(np.float32)
    a *= (1.0 + (WARM - 1.0) * warmth)

    # filmic S-curve
    x = a / 255.0
    x = np.clip(x, 0, 1)
    x = x * x * (3 - 2 * x) * 0.42 + x * 0.58
    x = np.clip((x - 0.5) * 1.10 + 0.485, 0, 1)
    a = x * 255.0

    lum = a.mean(axis=2, keepdims=True) / 255.0
    a += SHADOW_TINT * np.clip(1.0 - lum * 2.1, 0, 1)

    a *= VIGNETTE
    a *= (1.0 - SCRIM)

    grain = rng.normal(0.0, 4.2, (H // 2, W // 2, 1)).astype(np.float32)
    grain = np.repeat(np.repeat(grain, 2, 0), 2, 1)
    a += grain * (0.45 + 0.85 * (1.0 - lum))

    return np.clip(a, 0, 255)


def slit_overlay(arr: np.ndarray, p: float) -> np.ndarray:
    """The signature: a razor-thin amber slit opens and washes the frame."""
    if p <= 0 or p >= 1:
        return arr
    e = ease(p)
    half = max(1.5, (W * 0.62) * (e ** 2.4))
    core = max(1.5, 3.0 + 26.0 * e)
    xs = np.abs(np.arange(W, dtype=np.float32) - W / 2)

    beam = np.exp(-(xs / core) ** 2) * (1.0 - abs(2 * e - 1) * 0.35)
    glow = np.exp(-(xs / half) ** 2) * 0.55 * math.sin(math.pi * e) ** 0.8
    mask = np.clip(beam + glow, 0, 1)[None, :, None]

    vert = (1.0 - 0.35 * np.abs(np.linspace(-1, 1, H, dtype=np.float32)) ** 3)[:, None, None]
    mask = mask * vert

    tint = np.array(AMBER_HOT, np.float32)
    return arr * (1 - mask) + tint * mask


# ------------------------------------------------------------------ endcard

def render_endcard(progress: float = 1.0) -> Image.Image:
    """Brand end card. `progress` drives the logo's draw-on reveal."""
    # soft dark plate so the brand block reads over the slit of light
    plate = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.ellipse([-W * 0.35, H * 0.20, W * 1.35, H * 0.80], fill=(6, 4, 3, 215))
    plate = plate.filter(ImageFilter.GaussianBlur(70))

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # --- the mark, drawn on from the top
    mark_h = 760
    mark = build_logo(mark_h, ink=CREAM, progress=progress, with_studio=False)
    mx = int(W / 2 - mark.width / 2)
    my = int(H * 0.30 - mark_h * 0.42)
    layer.alpha_composite(mark, (mx, my))

    f_sub = ImageFont.truetype(LAT_IT, 40)
    f_fa = ImageFont.truetype(FA_REG, 44)
    f_cta = ImageFont.truetype(LAT_REG, 32)
    f_studio = ImageFont.truetype(LAT_REG, 44)

    cy = my + mark_h + 40

    # STUDIO, letter-spaced, with flanking rules — matches the logo lockup
    total = tracked_text(d, (W / 2, cy), "STUDIO", f_studio, CREAM + (245,), 22.0)
    ry = cy + 30
    for sgn in (-1, 1):
        xa = W / 2 + sgn * (total / 2 + 40)
        d.line([(xa, ry), (xa + sgn * 84, ry)], fill=AMBER + (200,), width=2)

    tracked_text(d, (W / 2, cy + 78), "Leather Atelier", f_sub, AMBER + (235,), 4.0)

    shaped = fa("آتلیه‌ی چرم · از کارگاه، تا گالری")
    tw = d.textlength(shaped, font=f_fa)
    d.text((W / 2 - tw / 2, cy + 150), shaped, font=f_fa, fill=CREAM + (215,))

    d.line([(W / 2 - 60, cy + 240), (W / 2 + 60, cy + 240)],
           fill=AMBER + (150,), width=1)
    tracked_text(d, (W / 2, cy + 262), "VOLUME I  ·  A STUDY IN METAMORPHOSIS",
                 f_cta, CREAM + (170,), 3.0)

    shadow = layer.filter(ImageFilter.GaussianBlur(12))
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dark = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dark.putalpha(shadow.getchannel("A").point(lambda a: int(a * 0.9)))
    out = Image.alpha_composite(plate, out)
    out = Image.alpha_composite(out, dark)
    return Image.alpha_composite(out, layer)


def render_watermark() -> Image.Image:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = ImageFont.truetype(LAT_SB, 26)
    tracked_text(d, (W / 2, 92), "SAHI STUDIO", f, CREAM + (140,), 7.0)
    d.line([(W / 2 - 34, 136), (W / 2 + 34, 136)], fill=AMBER + (120,), width=1)
    return layer


# --------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--out", default=os.path.join(BUILD, "video.mp4"))
    ap.add_argument("--stills", default="", help="comma-separated seconds to dump as JPG")
    args = ap.parse_args()

    os.makedirs(BUILD, exist_ok=True)

    # timeline
    t = 0.0
    for s in SHOTS:
        s.start = t
        t += s.dur - XFADE
    total = t + XFADE
    print(f"timeline: {total:.2f}s  ({len(SHOTS)} shots)")

    bases = {s.img: load_base(s.img) for s in SHOTS}
    cue_layers = {(i, j): render_cue(c)
                  for i, s in enumerate(SHOTS) for j, c in enumerate(s.cues)}
    ENDCARD_STEPS = 26
    endcards = [render_endcard(i / (ENDCARD_STEPS - 1))
                for i in range(ENDCARD_STEPS)]
    watermark = render_watermark()

    n_frames = int(round(total * FPS))
    rng = np.random.default_rng(7)

    ff = subprocess.run([sys.executable, "-c",
                         "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"],
                        capture_output=True, text=True).stdout.strip()

    proc = subprocess.Popen(
        [ff, "-y", "-v", "error",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-",
         "-c:v", "libx264", "-preset", "slow", "-crf", "17",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart",
         args.out],
        stdin=subprocess.PIPE)

    step = 6 if args.preview else 1
    for f in range(0, n_frames, step):
        gt = f / FPS
        acc = None
        warmth = 1.0
        for i, s in enumerate(SHOTS):
            local = gt - s.start
            if local < -0.001 or local > s.dur:
                continue
            u = local / s.dur
            frame = ken_burns(bases[s.img], s, u, f + i * 97)
            fl = np.asarray(frame, np.float32)

            # captions belong to the shot, so composite before the blend
            for j, c in enumerate(s.cues):
                if c.t0 - 0.45 < local < c.t1 + 0.45:
                    fade = min(1.0,
                               max(0.0, (local - c.t0 + 0.45) / 0.45),
                               max(0.0, (c.t1 + 0.45 - local) / 0.45))
                    fade = ease(min(fade, 1.0))
                    rise = (1.0 - fade) * 26
                    lay = cue_layers[(i, j)]
                    la = np.asarray(lay, np.float32)
                    if rise > 1:
                        la = np.roll(la, int(rise), axis=0)
                    alpha = (la[..., 3:4] / 255.0) * fade
                    fl = fl * (1 - alpha) + la[..., :3] * alpha

            if s.img == "10-outro.jpg":
                draw_p = min(1.0, max(0.0, (local - 0.30) / 2.0))
                idx = min(ENDCARD_STEPS - 1,
                          int(ease(draw_p) * (ENDCARD_STEPS - 1)))
                ec = np.asarray(endcards[idx], np.float32)
                fade = ease(min(1.0, max(0.0, (local - 0.25) / 0.7)))
                alpha = (ec[..., 3:4] / 255.0) * fade
                fl = fl * (1 - alpha) + ec[..., :3] * alpha

            w = 1.0
            if local < XFADE and i > 0:
                w = ease(local / XFADE)
            elif local > s.dur - XFADE and i < len(SHOTS) - 1:
                w = ease((s.dur - local) / XFADE)
            warmth = s.grade if w >= 0.5 else warmth
            acc = fl * w if acc is None else acc + fl * w

        if acc is None:
            acc = np.zeros((H, W, 3), np.float32)

        acc = grade(acc, warmth, rng)

        # slit wipe rides on top of every cut
        for i, s in enumerate(SHOTS[:-1]):
            cut = s.start + s.dur - XFADE
            d = gt - cut
            if 0 <= d <= XFADE:
                acc = slit_overlay(acc, d / XFADE)

        wm = np.asarray(watermark, np.float32)
        wa = wm[..., 3:4] / 255.0
        if gt < 1.0:
            wa = wa * ease(gt)
        # retire the corner mark once the end-card logo takes over
        outro_in = SHOTS[-1].start + 0.30
        if gt > outro_in:
            wa = wa * ease(max(0.0, 1.0 - (gt - outro_in) / 0.8))
        acc = acc * (1 - wa) + wm[..., :3] * wa

        # open from / close to black
        if gt < 0.9:
            acc *= ease(gt / 0.9)
        if gt > total - 1.0:
            acc *= ease(max(0.0, (total - gt) / 1.0))

        proc.stdin.write(acc.astype(np.uint8).tobytes())
        if f % 90 == 0:
            print(f"  {gt:6.2f}s / {total:.2f}s", flush=True)

    proc.stdin.close()
    proc.wait()
    print("video ->", args.out)

    with open(os.path.join(BUILD, "timeline.txt"), "w") as fh:
        for s in SHOTS:
            fh.write(f"{s.start:7.2f}  {s.start + s.dur:7.2f}  {s.img}\n")
        fh.write(f"total {total:.2f}\n")


if __name__ == "__main__":
    main()
