#!/usr/bin/env python3
"""
SAHI STUDIO — logo mark, redrawn as vector-style artwork.

The mark is a tall open-bottom frame whose inner rails funnel down into a
pointed tail, with the SAHI logotype built from the same hairline geometry so
the frame's verticals read as the letters' extenders. Everything is drawn from
coordinates (no bitmap tracing), supersampled 4x for clean edges.

    build_logo(height, ink, ground, progress) -> RGBA Image

`progress` (0..1) drives the draw-on animation used on the reel's end card:
the linework wipes in from the top, then the logotype and STUDIO rule fade up.
"""

from __future__ import annotations

import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(ROOT, "fonts")
JOST = os.path.join(FONTS, "Jost_300Light.ttf")

# design space
DW, DH = 1000.0, 1200.0
SW = 9.0                      # hairline stroke weight

INK = (26, 26, 26)
GROUND = (244, 243, 239)

# ---- frame -----------------------------------------------------------------
FX0, FX1 = 250.0, 762.0       # outer rails
FTOP = 60.0
FBOT = 742.0                  # where the rails stop and the feet kick in
FOOT = 40.0                   # chamfered foot run

# ---- inner rails + funnel ---------------------------------------------------
IX0, IX1 = 352.0, 672.0       # aligned to the S spine and the H right stem
ITOP = 60.0
IFUNNEL = 430.0               # where the rails start converging
INECK0, INECK1 = 480.0, 544.0  # neck width after the funnel
INECK_Y = 528.0
ITAIL = 590.0                 # neck runs down to here
ITIP = 640.0                  # V tip

# ---- logotype ---------------------------------------------------------------
LTOP = 690.0
LBOT = 1012.0
LMID = 878.0                  # crossbar height for A and H


def _strokes():
    """The mark as a list of polylines, ordered top-down for the wipe-on."""
    s = []

    # outer frame: top bar, then both rails with their chamfered feet
    s.append([(FX0, FTOP), (FX1, FTOP)])
    s.append([(FX0, FTOP), (FX0, FBOT), (FX0 + FOOT * 0.8, FBOT + FOOT)])
    s.append([(FX1, FTOP), (FX1, FBOT), (FX1 - FOOT * 0.8, FBOT + FOOT)])

    # inner rails -> funnel -> neck -> tail
    s.append([(IX0, ITOP), (IX0, IFUNNEL), (INECK0, INECK_Y),
              (INECK0, ITAIL), ((INECK0 + INECK1) / 2, ITIP)])
    s.append([(IX1, ITOP), (IX1, IFUNNEL), (INECK1, INECK_Y),
              (INECK1, ITAIL), ((INECK0 + INECK1) / 2, ITIP)])

    return s


def _logotype():
    """SAHI, built from the same hairline geometry as the frame."""
    s = []
    c = 30.0                      # corner chamfer

    # --- S : open terminals, squared spine on the left inner rail
    x0, x1 = IX0, 452.0
    sm = (LTOP + LBOT) / 2
    s.append([
        (x1, LTOP + c), (x1 - c, LTOP), (x0 + c, LTOP), (x0, LTOP + c),
        (x0, sm - c), (x0 + c, sm), (x1 - c, sm), (x1, sm + c),
        (x1, LBOT - c), (x1 - c, LBOT), (x0 + c, LBOT), (x0, LBOT - c),
    ])

    # --- A : splayed legs, flat clipped apex, crossbar spanning both legs
    ax0, ax1 = 472.0, 572.0
    apex = 22.0
    inset = 13.0                  # how far the legs lean in at the top
    s.append([(ax0, LBOT),
              (ax0 + inset, LTOP + apex),
              ((ax0 + ax1) / 2 - apex * 0.55, LTOP),
              ((ax0 + ax1) / 2 + apex * 0.55, LTOP),
              (ax1 - inset, LTOP + apex),
              (ax1, LBOT)])
    # crossbar meets the legs exactly where they are at LMID
    fr = (LMID - (LTOP + apex)) / (LBOT - (LTOP + apex))
    bx0 = (ax0 + inset) + (ax0 - (ax0 + inset)) * fr
    bx1 = (ax1 - inset) + (ax1 - (ax1 - inset)) * fr
    s.append([(bx0, LMID), (bx1, LMID)])

    # --- H : right stem lands on the right inner rail
    hx0, hx1 = 592.0, IX1
    s.append([(hx0, LTOP), (hx0, LBOT)])
    s.append([(hx1, LTOP), (hx1, LBOT)])
    s.append([(hx0, LMID), (hx1, LMID)])

    # --- I
    s.append([(700.0, LTOP), (700.0, LBOT)])

    return s


def _draw_polys(d, polys, scale, ink, width):
    for p in polys:
        pts = [(x * scale, y * scale) for x, y in p]
        d.line(pts, fill=ink, width=width, joint="curve")
        # square the ends off — PIL's line caps are square already, but the
        # joints need help at this weight
        for x, y in pts:
            r = width / 2 - 0.5
            if r > 0:
                d.ellipse([x - r, y - r, x + r, y + r], fill=ink)


def build_logo(height: int = 1200,
               ink=INK,
               ground=None,
               progress: float = 1.0,
               with_studio: bool = True) -> Image.Image:
    """Render the mark. `ground=None` gives a transparent background."""
    ss = 4
    scale = (height / DH) * ss
    W = int(DW * scale)
    H = int(DH * scale)

    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lw = max(1, int(round(SW * scale)))

    _draw_polys(d, _strokes(), scale, ink + (255,), lw)
    _draw_polys(d, _logotype(), scale, ink + (255,), lw)

    if with_studio:
        f = ImageFont.truetype(JOST, int(46 * scale))
        text = "STUDIO"
        track = 26 * scale
        widths = [d.textlength(c, font=f) for c in text]
        total = sum(widths) + track * (len(text) - 1)
        x = W / 2 - total / 2
        y = 1090 * scale
        for c, w in zip(text, widths):
            d.text((x, y), c, font=f, fill=ink + (255,))
            x += w + track

        # flanking rules
        ry = y + 30 * scale
        gap = total / 2 + 46 * scale
        rl = 92 * scale
        for sgn in (-1, 1):
            xa = W / 2 + sgn * gap
            xb = xa + sgn * rl
            d.line([(xa, ry), (xb, ry)], fill=ink + (255,),
                   width=max(1, int(2.4 * scale)))

    img = img.resize((int(DW * height / DH), height), Image.LANCZOS)

    if progress < 1.0:
        img = _reveal(img, progress)

    if ground is not None:
        bg = Image.new("RGBA", img.size, tuple(ground) + (255,))
        img = Image.alpha_composite(bg, img)

    return img


def _reveal(img: Image.Image, p: float) -> Image.Image:
    """Top-down wipe for the linework; the logotype fades up behind it."""
    w, h = img.size
    p = max(0.0, min(1.0, p))

    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)

    # wipe edge sweeps past the bottom of the mark by the time p hits ~0.8
    edge = h * (p / 0.8) if p < 0.8 else h
    soft = h * 0.06
    md.rectangle([0, 0, w, max(0, edge - soft)], fill=255)
    steps = 24
    for i in range(steps):
        y0 = edge - soft + (soft / steps) * i
        a = int(255 * (1 - i / steps))
        md.rectangle([0, y0, w, y0 + soft / steps + 1], fill=a)

    out = img.copy()
    a = out.getchannel("A")
    out.putalpha(Image.eval(a, lambda v: v).point(lambda v: v))
    out.putalpha(_mul(a, mask))
    return out


def _mul(a: Image.Image, b: Image.Image) -> Image.Image:
    return Image.frombytes(
        "L", a.size,
        bytes((x * y) // 255 for x, y in zip(a.tobytes(), b.tobytes())))


if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "brand"), exist_ok=True)
    build_logo(1200, ink=(26, 26, 26), ground=GROUND).convert("RGB").save(
        os.path.join(ROOT, "brand", "logo-light.png"))
    build_logo(1200, ink=(240, 232, 220), ground=(12, 9, 7)).convert("RGB").save(
        os.path.join(ROOT, "brand", "logo-dark.png"))
    build_logo(1200, ink=(240, 232, 220)).save(
        os.path.join(ROOT, "brand", "logo-alpha.png"))
    print("logos ->", os.path.join(ROOT, "brand"))
