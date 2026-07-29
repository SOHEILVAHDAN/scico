#!/usr/bin/env python3
"""
Builds `sahi-atelier.html` — a single self-contained cinematic page.

Everything (images, fonts, the logo, the Persian narration) is inlined as
base64, so the file works offline, off a USB stick, or as an email attachment
with no server and no external requests.

    python build_html.py
"""

from __future__ import annotations

import base64
import glob
import io
import json
import os
import sys

from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "sahi-atelier.html")

IMG_W = 900
IMG_Q = 76

# Full Persian/Arabic block rather than a hand-listed string: the hand-built
# list silently dropped ث ج ض غ, the vowel marks, and — worst — U+200C ZWNJ,
# which Persian compounds like "آتلیه‌ی" and "می‌شوند" depend on.
FA_TEXT = (
    "".join(chr(c) for c in range(0x0600, 0x06FF + 1))
    + "\u200c\u200d\u200e\u200f\u061c"
    + "«»؛،؟٫٬ "
    + "0123456789.,:;!?()·—–- "
)
LAT_TEXT = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    "0123456789 ·—–-'’\"“”.,:;!?()&/"
)

FONT_JOBS = [
    ("fonts/Vazirmatn-Light.ttf", FA_TEXT, "fa-l"),
    ("fonts/Vazirmatn-Regular.ttf", FA_TEXT, "fa-r"),
    ("fonts/Vazirmatn-SemiBold.ttf", FA_TEXT, "fa-sb"),
    ("fonts/CormorantGaramond_400Regular.ttf", LAT_TEXT, "la-r"),
    ("fonts/CormorantGaramond_600SemiBold.ttf", LAT_TEXT, "la-sb"),
    ("fonts/CormorantGaramond_400Regular_Italic.ttf", LAT_TEXT, "la-i"),
    ("fonts/Jost_300Light.ttf", LAT_TEXT, "ui-l"),
]


def b64(data: bytes) -> str:
    return base64.b64encode(data).decode()


def subset_fonts() -> dict:
    out = {}
    for path, text, name in FONT_JOBS:
        f = TTFont(os.path.join(ROOT, path))
        o = Options()
        o.flavor = "woff2"
        o.desubroutinize = True
        o.layout_features = ["*"]          # keep Arabic joining forms
        o.notdef_outline = False
        o.drop_tables += ["DSIG"]
        Subsetter(options=o).subset(f) if False else None
        s = Subsetter(options=o)
        s.populate(text=text)
        s.subset(f)
        buf = io.BytesIO()
        f.flavor = "woff2"
        f.save(buf)
        out[name] = b64(buf.getvalue())
        print(f"  font {name}: {len(buf.getvalue())//1024} KB")
    return out


def encode_images() -> dict:
    out = {}
    for p in sorted(glob.glob(os.path.join(ROOT, "assets", "*.jpg"))):
        im = Image.open(p).convert("RGB")
        h = int(im.height * IMG_W / im.width)
        im = im.resize((IMG_W, h), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=IMG_Q, method=6)
        key = os.path.basename(p).replace(".jpg", "")
        out[key] = b64(buf.getvalue())
        print(f"  img {key}: {len(buf.getvalue())//1024} KB")
    return out


def encode_audio() -> dict:
    out = {}
    for p in sorted(glob.glob(os.path.join(ROOT, "audio", "vo-*.mp3"))):
        key = os.path.basename(p).replace(".mp3", "")
        out[key] = b64(open(p, "rb").read())
    print(f"  audio: {len(out)} clips")
    return out


def logo_svg() -> str:
    sys.path.insert(0, ROOT)
    import logo as L

    def d(poly):
        return "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in poly)

    paths = "".join(f'<path d="{d(p)}"/>'
                    for p in L._strokes() + L._logotype())
    return (
        '<svg class="mark" viewBox="230 40 552 1000" fill="none" '
        'stroke="currentColor" stroke-width="9" stroke-linecap="square" '
        f'stroke-linejoin="miter" aria-hidden="true">{paths}</svg>'
    )


# --------------------------------------------------------------- the content

CHAPTERS = [
    dict(id="i", img="01-heritage", num="I", en="The Heritage",
         fa_h="میراث",
         fa=["یک کارگاهِ کفاشیِ هشتاد ساله،",
             "در دلِ بازارِ قدیمی."],
         body="چهار نسل از صنعت‌گران، اینجا چرمِ خام را شکل داده‌اند — "
              "دست‌هایی رنگ‌گرفته، و هوایی سنگین از روغن، موم و تانن.",
         vo="vo-01", align="start"),

    dict(id="ii", img="02-craft", num="II", en="Craft",
         fa_h="صنعت‌گری",
         fa=["چهار نسل،", "دست‌هایی که چرم را شکل داده‌اند."],
         body="کُند کردنِ عامدانه‌ی زمان. هر بخیه، سندی کوچک از صبر.",
         vo="vo-02", align="end"),

    dict(id="iii", img="03-material", num="IV", en="The Material Palette",
         fa_h="مصالح",
         fa=["چرمِ تنباکویی. بتنِ خام.", "مسِ اکسیدشده."],
         body="موادی که پیر می‌شوند، و به یاد می‌آورند.",
         vo="vo-03", align="start"),

    dict(id="iv", img="09-wall", num="—", en="2700 K · Light, as Material",
         fa_h="نور، در مقامِ مصالح",
         fa=["موادی که پیر می‌شوند،", "و به یاد می‌آورند."],
         body="یک باریکه‌ی کهربایی در ۲۷۰۰ کلوین، که بافتِ ارادت را آشکار می‌کند.",
         vo=None, align="end"),

    dict(id="v", img="04-blueprint", num="III", en="From Workshop to Gallery",
         fa_h="پرسش",
         fa=["چگونه این فضا را دگرگون کنیم،", "بی‌آنکه حافظه‌اش را پاک کنیم؟"],
         body="آجرهای کهنه‌ی بازار بمانند. بگذار گذشته، آرام، از خلالِ نو سخن بگوید.",
         vo="vo-04", align="start"),

    dict(id="vi", img="05-facade", num="V", en="A Slit of Light",
         fa_h="شکافِ نور",
         fa=["پاسخ، یک شکافِ باریکِ نور بود."],
         body=None,
         quote="ورودی یک در نیست؛ یک دعوت است.",
         vo="vo-05", align="center", hero=True),

    dict(id="vii", img="07-threshold", num="VII", en="The Visitor's Journey",
         fa_h="آستانه",
         fa=["نور، ابتدا چشم را می‌خواند؛", "و سپس، رهگذر را به درون می‌آورد."],
         body="گذر از آستانه، به پناهگاهی از صنعت‌گریِ برگزیده.",
         vo="vo-06", align="end"),

    dict(id="viii", img="06-masterpiece", num="VI", en="The Masterpiece",
         fa_h="شاهکار",
         fa=["یک کفش.", "معلق."],
         body="در تقاطعِ هشتاد سال صنعت‌گری، و یک لحظه نورِ ناب.",
         vo="vo-07", align="center", hero=True),

    dict(id="ix", img="08-gallery", num="VIII", en="The Interior",
         fa_h="از کارگاه، تا گالری",
         fa=["از کارگاه، تا گالری."],
         body="معماری، در مقامِ روایت.",
         vo="vo-08", align="start"),
]


def build() -> str:
    print("encoding assets…")
    fonts = subset_fonts()
    imgs = encode_images()
    audio = encode_audio()
    mark = logo_svg()

    face = lambda n, fam, w, st="normal": (
        f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:{st};"
        f"font-display:swap;src:url(data:font/woff2;base64,{fonts[n]}) "
        "format('woff2')}"
    )
    faces = "".join([
        face("fa-l", "Fa", 300), face("fa-r", "Fa", 400),
        face("fa-sb", "Fa", 600),
        face("la-r", "La", 400), face("la-sb", "La", 600),
        face("la-i", "La", 400, "italic"),
        face("ui-l", "Ui", 300),
    ])

    # ---- chapters markup
    secs = []
    for i, c in enumerate(CHAPTERS):
        fa_lines = "".join(f"<span>{l}</span>" for l in c["fa"])
        body = f'<p class="body">{c["body"]}</p>' if c.get("body") else ""
        quote = (f'<blockquote>{c["quote"]}</blockquote>'
                 if c.get("quote") else "")
        vo = f' data-vo="{c["vo"]}"' if c.get("vo") else ""
        hero = " hero" if c.get("hero") else ""
        secs.append(f'''
<section class="ch{hero}" id="ch-{c['id']}" data-i="{i}"{vo}>
  <div class="plate" style="background-image:url(data:image/webp;base64,{imgs[c['img']]})"></div>
  <div class="grain"></div>
  <div class="vig"></div>
  <div class="wrap {c['align']}">
    <div class="inner">
      <div class="eyebrow"><i></i><span>{('Chapter ' + c['num'] + ' · ') if c['num'] != '—' else ''}{c['en']}</span></div>
      <h2>{c['fa_h']}</h2>
      <div class="lede">{fa_lines}</div>
      {quote}{body}
    </div>
  </div>
  <div class="slit"></div>
</section>''')

    audio_tags = "".join(
        f'<audio id="{k}" preload="none" src="data:audio/mpeg;base64,{v}"></audio>'
        for k, v in sorted(audio.items()))

    nav = "".join(
        f'<a href="#ch-{c["id"]}" data-i="{i}"><b></b>'
        f'<em>{c["fa_h"]}</em></a>'
        for i, c in enumerate(CHAPTERS))

    outro_img = imgs["10-outro"]
    hero_img = imgs["01-heritage"]

    return TEMPLATE.format(
        faces=faces, mark=mark, sections="".join(secs),
        audio=audio_tags, nav=nav, outro=outro_img, hero=hero_img,
        nch=len(CHAPTERS),
    )


TEMPLATE = r"""<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>ساهی استودیو — آتلیه‌ی چرم · از کارگاه، تا گالری</title>
<meta name="description" content="یک کارگاهِ کفاشیِ هشتاد ساله در دلِ بازارِ قدیمی، بدل به گالریِ چرم. جلد یکم — پژوهشی در دگردیسی.">
<meta name="theme-color" content="#0b0908">
<style>
{faces}

:root{{
  --ink:#f0e8dc; --dim:rgba(240,232,220,.62); --faint:rgba(240,232,220,.34);
  --amber:#e8a856; --amber-hot:#ffd696; --bg:#0b0908; --bg2:#141010;
  --gut:clamp(22px,5vw,88px);
  --fa:'Fa',system-ui,sans-serif; --la:'La',Georgia,serif; --ui:'Ui',system-ui,sans-serif;
}}

*{{box-sizing:border-box;margin:0;padding:0}}
html{{scroll-behavior:smooth;-webkit-text-size-adjust:100%}}
body{{
  background:var(--bg); color:var(--ink); font-family:var(--fa);
  overflow-x:hidden; -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}}
body.lock{{overflow:hidden}}
::selection{{background:var(--amber);color:#160f08}}

/* ---------- film grain, shared ---------- */
.grain{{
  position:absolute;inset:-120%;pointer-events:none;z-index:3;opacity:.16;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E");
  animation:grain 1.1s steps(3) infinite;
  mix-blend-mode:overlay;
}}
@keyframes grain{{
  0%{{transform:translate(0,0)}} 33%{{transform:translate(-4%,2%)}}
  66%{{transform:translate(3%,-3%)}} 100%{{transform:translate(0,0)}}
}}
.vig{{
  position:absolute;inset:0;z-index:2;pointer-events:none;
  background:
    radial-gradient(120% 82% at 50% 42%,transparent 34%,rgba(6,4,3,.62) 78%,rgba(6,4,3,.94) 100%),
    linear-gradient(to bottom,rgba(6,4,3,.72) 0%,transparent 26%,transparent 52%,rgba(6,4,3,.9) 100%);
}}

/* ---------- loader ---------- */
#load{{
  position:fixed;inset:0;z-index:200;background:var(--bg);
  display:grid;place-items:center;transition:opacity 1.1s ease,visibility 1.1s;
}}
#load.gone{{opacity:0;visibility:hidden}}
#load .beam{{
  width:2px;height:0;background:linear-gradient(to bottom,transparent,var(--amber-hot),transparent);
  box-shadow:0 0 26px 5px rgba(232,168,86,.5);
  animation:grow 1.5s cubic-bezier(.22,1,.36,1) forwards;
}}
@keyframes grow{{to{{height:min(46vh,420px)}}}}

/* ---------- opening ---------- */
#hero{{
  position:relative;min-height:100svh;display:grid;place-items:center;
  overflow:hidden;text-align:center;
}}
#hero .plate{{
  position:absolute;inset:-6%;background-size:cover;background-position:50% 42%;
  filter:saturate(.86) contrast(1.06) brightness(.5);
  transform:scale(1.06);
  animation:heroPush 26s ease-out forwards;
}}
@keyframes heroPush{{to{{transform:scale(1.18) translateY(-1.5%)}}}}
#hero .hcon{{position:relative;z-index:5;padding:0 var(--gut)}}

.mark{{
  width:clamp(92px,13vw,148px);height:auto;color:var(--ink);
  display:block;margin:0 auto clamp(22px,3.4vw,38px);
  overflow:visible;
}}
.mark path{{
  stroke-dasharray:var(--len);stroke-dashoffset:var(--len);
  animation:draw 2.6s cubic-bezier(.55,.1,.2,1) forwards;
  animation-delay:calc(.35s + var(--d,0) * .06s);
  filter:drop-shadow(0 0 14px rgba(232,168,86,.18));
}}
@keyframes draw{{to{{stroke-dashoffset:0}}}}

.wordmark{{
  font-family:var(--ui);font-weight:300;
  letter-spacing:.62em;text-indent:.62em;
  font-size:clamp(11px,1.5vw,15px);color:var(--ink);
  display:flex;align-items:center;justify-content:center;gap:18px;
  opacity:0;animation:up 1.4s 2.5s cubic-bezier(.22,1,.36,1) forwards;
}}
.wordmark i{{display:block;width:clamp(30px,5vw,64px);height:1px;background:var(--amber);opacity:.72}}

#hero h1{{
  font-family:var(--fa);font-weight:300;
  font-size:clamp(38px,8.6vw,104px);line-height:1.16;
  margin:clamp(26px,4vw,46px) 0 0;letter-spacing:-.01em;
  opacity:0;animation:up 1.5s 2.85s cubic-bezier(.22,1,.36,1) forwards;
}}
#hero h1 em{{font-style:normal;color:var(--amber)}}
#hero .sub{{
  font-family:var(--la);font-size:clamp(14px,2vw,21px);font-style:italic;
  color:var(--dim);margin-top:clamp(16px,2.4vw,26px);
  opacity:0;animation:up 1.5s 3.15s cubic-bezier(.22,1,.36,1) forwards;
}}
#hero .fa-sub{{
  font-size:clamp(13px,1.8vw,17px);font-weight:300;color:var(--faint);
  margin-top:12px;line-height:1.9;
  opacity:0;animation:up 1.5s 3.35s cubic-bezier(.22,1,.36,1) forwards;
}}
@keyframes up{{from{{opacity:0;transform:translateY(26px)}}to{{opacity:1;transform:none}}}}

.scroll{{
  position:absolute;bottom:clamp(20px,3.6vh,40px);left:50%;transform:translateX(-50%);
  z-index:6;display:grid;justify-items:center;gap:10px;
  font-family:var(--ui);font-size:10px;letter-spacing:.34em;color:var(--faint);
  opacity:0;animation:up 1.4s 3.8s forwards;
}}
.scroll b{{display:block;width:1px;height:52px;background:linear-gradient(var(--amber),transparent);
  animation:drop 2.2s ease-in-out infinite}}
@keyframes drop{{0%,100%{{transform:scaleY(.34);opacity:.5;transform-origin:top}}
  50%{{transform:scaleY(1);opacity:1;transform-origin:top}}}}

/* ---------- chapters ---------- */
.ch{{position:relative;min-height:100svh;overflow:hidden;display:grid;align-items:center}}
.ch .plate{{
  position:absolute;inset:-8%;background-size:cover;background-position:50% 46%;
  filter:saturate(.84) contrast(1.07) brightness(.46);
  transform:scale(1.04) translateY(var(--py,0));
  transition:transform .18s linear;
  will-change:transform;
}}
.ch .wrap{{position:relative;z-index:5;width:100%;padding:clamp(80px,12vh,150px) var(--gut);display:flex}}
.ch .wrap.start{{justify-content:flex-start}}
.ch .wrap.end{{justify-content:flex-end}}
.ch .wrap.center{{justify-content:center;text-align:center}}
.ch .inner{{max-width:min(620px,92vw)}}
.ch.hero .inner{{max-width:min(760px,94vw)}}

.eyebrow{{
  display:flex;align-items:center;gap:14px;margin-bottom:clamp(16px,2.4vw,26px);
  font-family:var(--la);font-weight:600;font-size:clamp(10px,1.35vw,13px);
  letter-spacing:.34em;text-transform:uppercase;color:var(--amber);
  direction:ltr;
}}
.center .eyebrow{{justify-content:center}}
.eyebrow i{{display:block;width:46px;height:1px;background:var(--amber);opacity:.6}}

.ch h2{{
  font-weight:300;font-size:clamp(30px,5.6vw,66px);line-height:1.24;
  margin-bottom:clamp(18px,2.6vw,30px);letter-spacing:-.005em;
}}
.lede{{display:grid;gap:.34em;font-size:clamp(17px,2.5vw,27px);font-weight:400;
  line-height:1.78;color:var(--ink)}}
.body{{margin-top:clamp(18px,2.4vw,28px);font-size:clamp(14px,1.75vw,18px);
  font-weight:300;line-height:2.05;color:var(--dim);max-width:52ch}}
.center .body{{margin-inline:auto}}
blockquote{{
  margin:clamp(22px,3vw,34px) 0 0;padding:0;border:0;
  font-size:clamp(19px,3.1vw,34px);font-weight:300;line-height:1.7;color:var(--amber-hot);
}}
.center blockquote{{margin-inline:auto}}

/* reveal-on-scroll */
.ch .inner>*{{opacity:0;transform:translateY(34px);
  transition:opacity 1.05s cubic-bezier(.22,1,.36,1),transform 1.05s cubic-bezier(.22,1,.36,1)}}
.ch.in .inner>*{{opacity:1;transform:none}}
.ch.in .inner>*:nth-child(2){{transition-delay:.1s}}
.ch.in .inner>*:nth-child(3){{transition-delay:.2s}}
.ch.in .inner>*:nth-child(4){{transition-delay:.3s}}
.lede span{{display:block}}

/* the signature: a slit of light on every chapter edge */
.slit{{
  position:absolute;left:50%;top:0;width:2px;height:100%;z-index:4;
  transform:translateX(-50%) scaleY(0);transform-origin:top;
  background:linear-gradient(to bottom,transparent,var(--amber-hot) 18%,var(--amber-hot) 82%,transparent);
  box-shadow:0 0 40px 7px rgba(232,168,86,.34);
  opacity:0;pointer-events:none;
}}
.ch.in .slit{{animation:slit 2.4s cubic-bezier(.22,1,.36,1) forwards}}
@keyframes slit{{
  0%{{opacity:0;transform:translateX(-50%) scaleY(0)}}
  22%{{opacity:1}}
  55%{{opacity:.85;transform:translateX(-50%) scaleY(1)}}
  100%{{opacity:0;transform:translateX(-50%) scaleY(1)}}
}}

/* ---------- interlude: the pure slit ---------- */
#slit-full{{
  position:relative;min-height:86svh;display:grid;place-items:center;
  background:radial-gradient(70% 60% at 50% 50%,#1a1310,var(--bg) 72%);
  overflow:hidden;text-align:center;
}}
#slit-full .beam{{
  position:absolute;left:50%;top:0;transform:translateX(-50%);
  width:3px;height:100%;
  background:linear-gradient(to bottom,transparent,var(--amber-hot) 22%,var(--amber-hot) 78%,transparent);
  box-shadow:0 0 60px 12px rgba(232,168,86,.4);opacity:.9;
}}
#slit-full p{{
  position:relative;z-index:4;font-size:clamp(20px,3.6vw,42px);font-weight:300;
  line-height:1.8;padding:0 var(--gut);max-width:22ch;
  text-shadow:0 0 40px rgba(6,4,3,.95),0 0 90px rgba(6,4,3,.9);
}}

/* ---------- credits / end ---------- */
#end{{
  position:relative;min-height:100svh;display:grid;place-items:center;
  overflow:hidden;text-align:center;
}}
#end .plate{{
  position:absolute;inset:-6%;background-size:cover;background-position:50%;
  filter:brightness(.4) saturate(.8);transform:scale(1.05);
}}
#end .ecov{{position:absolute;inset:0;background:radial-gradient(58% 48% at 50% 42%,rgba(6,4,3,.86),rgba(6,4,3,.97) 70%)}}
#end .econ{{position:relative;z-index:6;padding:0 var(--gut)}}
#end .mark{{width:clamp(104px,15vw,168px)}}
#end .mark path{{animation:none;stroke-dashoffset:var(--len)}}
#end.in .mark path{{animation:draw 2.4s cubic-bezier(.55,.1,.2,1) forwards;
  animation-delay:calc(.2s + var(--d,0) * .055s)}}
#end .lat{{
  font-family:var(--la);font-style:italic;color:var(--amber);
  font-size:clamp(15px,2.1vw,23px);margin-top:20px;
}}
#end .fa{{font-size:clamp(14px,1.9vw,19px);font-weight:300;color:var(--dim);
  margin-top:14px;line-height:2}}
#end .vol{{
  font-family:var(--la);font-size:clamp(10px,1.35vw,13px);letter-spacing:.3em;
  text-transform:uppercase;color:var(--faint);margin-top:clamp(26px,4vw,40px);
  direction:ltr;
}}
#end .rule{{width:74px;height:1px;background:var(--amber);opacity:.5;margin:clamp(22px,3vw,32px) auto}}

/* ---------- chapter rail ---------- */
#rail{{
  position:fixed;inset-inline-start:clamp(12px,2.2vw,30px);top:50%;
  transform:translateY(-50%);z-index:60;display:grid;gap:13px;
  opacity:0;transition:opacity .7s;pointer-events:none;
}}
#rail.on{{opacity:1;pointer-events:auto}}
#rail a{{
  display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--faint);
}}
#rail b{{display:block;width:16px;height:1px;background:currentColor;transition:.4s}}
#rail em{{
  font-style:normal;font-size:11px;font-weight:300;opacity:0;transform:translateX(6px);
  transition:.4s;white-space:nowrap;
}}
#rail a:hover b,#rail a.act b{{width:34px;background:var(--amber)}}
#rail a:hover em,#rail a.act em{{opacity:1;transform:none;color:var(--ink)}}
@media(max-width:900px){{#rail{{display:none}}}}

/* ---------- progress + sound ---------- */
#bar{{position:fixed;top:0;inset-inline-start:0;height:2px;width:0;
  background:linear-gradient(90deg,var(--amber),var(--amber-hot));z-index:90;
  box-shadow:0 0 14px rgba(232,168,86,.6)}}

#snd{{
  position:fixed;inset-block-start:clamp(14px,2.4vw,26px);
  inset-inline-end:clamp(14px,2.4vw,26px);z-index:95;
  display:flex;align-items:center;gap:10px;
  background:rgba(11,9,8,.62);backdrop-filter:blur(10px);
  border:1px solid rgba(240,232,220,.14);border-radius:100px;
  padding:9px 16px;cursor:pointer;color:var(--dim);
  font-family:var(--ui);font-size:11px;letter-spacing:.18em;
  transition:.35s;user-select:none;
}}
#snd:hover{{color:var(--ink);border-color:rgba(232,168,86,.5)}}
#snd .eq{{display:flex;align-items:flex-end;gap:2px;height:12px}}
#snd .eq i{{width:2px;height:3px;background:currentColor;transition:.3s}}
#snd.on{{color:var(--amber)}}
#snd.on .eq i{{animation:eq .9s ease-in-out infinite}}
#snd.on .eq i:nth-child(2){{animation-delay:.15s}}
#snd.on .eq i:nth-child(3){{animation-delay:.3s}}
#snd.on .eq i:nth-child(4){{animation-delay:.45s}}
@keyframes eq{{0%,100%{{height:3px}}50%{{height:12px}}}}

@media(prefers-reduced-motion:reduce){{
  *{{animation-duration:.01ms!important;animation-iteration-count:1!important;
     transition-duration:.01ms!important;scroll-behavior:auto!important}}
  .ch .inner>*{{opacity:1;transform:none}}
  .mark path{{stroke-dashoffset:0}}
  .grain{{display:none}}
}}
@media print{{
  #rail,#snd,#bar,#load,.grain{{display:none}}
  .ch,#hero,#end{{min-height:auto;page-break-inside:avoid}}
}}
</style>
</head>
<body>

<div id="load"><div class="beam"></div></div>
<div id="bar"></div>

<div id="snd" role="button" tabindex="0" aria-label="پخش روایت">
  <span class="eq"><i></i><i></i><i></i><i></i></span><span class="lbl">روایت</span>
</div>

<nav id="rail" aria-label="فصل‌ها">{nav}</nav>

<!-- ============ opening ============ -->
<header id="hero">
  <div class="plate" style="background-image:url(data:image/webp;base64,{hero})"></div>
  <div class="grain"></div><div class="vig"></div>
  <div class="hcon">
    {mark}
    <div class="wordmark"><i></i><span>STUDIO</span><i></i></div>
    <h1>آتلیه‌ی <em>چرم</em></h1>
    <div class="sub">From Workshop to Gallery · Volume I</div>
    <div class="fa-sub">از کارگاه، تا گالری — پژوهشی در دگردیسی</div>
  </div>
  <div class="scroll"><b></b><span>SCROLL</span></div>
</header>

<main>
{sections}

<!-- ============ interlude ============ -->
<section id="slit-full">
  <div class="beam"></div><div class="grain"></div>
  <p>ورودی یک در نیست؛ یک دعوت است.</p>
</section>

<!-- ============ end ============ -->
<section id="end" data-vo="vo-09">
  <div class="plate" style="background-image:url(data:image/webp;base64,{outro})"></div>
  <div class="ecov"></div><div class="grain"></div>
  <div class="econ">
    {mark}
    <div class="wordmark"><i></i><span>STUDIO</span><i></i></div>
    <div class="lat">Leather Atelier</div>
    <div class="fa">آتلیه‌ی چرم · از کارگاه، تا گالری</div>
    <div class="rule"></div>
    <div class="vol">Volume I · A Study in Metamorphosis</div>
  </div>
</section>
</main>

{audio}

<script>
(function(){{
  var D=document, root=D.documentElement;

  /* --- give every logo path its own length so the draw-on is even --- */
  D.querySelectorAll('.mark').forEach(function(svg){{
    svg.querySelectorAll('path').forEach(function(p,i){{
      var L=Math.ceil(p.getTotalLength());
      p.style.setProperty('--len',L);
      p.style.setProperty('--d',i);
    }});
  }});

  /* --- loader --- */
  window.addEventListener('load',function(){{
    setTimeout(function(){{D.getElementById('load').classList.add('gone');}},900);
  }});

  /* --- progress bar --- */
  var bar=D.getElementById('bar');
  function prog(){{
    var h=D.body.scrollHeight-innerHeight;
    bar.style.width=(h>0?(scrollY/h)*100:0)+'%';
  }}

  /* --- reveal + parallax --- */
  var chs=[].slice.call(D.querySelectorAll('.ch'));
  var endEl=D.getElementById('end');
  var io=new IntersectionObserver(function(es){{
    es.forEach(function(e){{ if(e.isIntersecting) e.target.classList.add('in'); }});
  }},{{threshold:.26}});
  chs.forEach(function(c){{io.observe(c);}});
  io.observe(endEl);

  var ticking=false;
  function frame(){{
    var vh=innerHeight;
    chs.forEach(function(c){{
      var r=c.getBoundingClientRect();
      if(r.bottom<-200||r.top>vh+200) return;
      var p=(r.top+r.height/2-vh/2)/vh;      /* -1 .. 1 */
      var plate=c.querySelector('.plate');
      if(plate) plate.style.setProperty('--py',(p*-4.2)+'%');
    }});
    prog(); rail(); ticking=false;
  }}
  addEventListener('scroll',function(){{
    if(!ticking){{requestAnimationFrame(frame);ticking=true;}}
  }},{{passive:true}});
  addEventListener('resize',frame,{{passive:true}});

  /* --- chapter rail --- */
  var links=[].slice.call(D.querySelectorAll('#rail a'));
  var railEl=D.getElementById('rail');
  function rail(){{
    var heroBottom=D.getElementById('hero').getBoundingClientRect().bottom;
    railEl.classList.toggle('on',heroBottom<innerHeight*.4);
    var best=-1,bd=1e9;
    chs.forEach(function(c,i){{
      var r=c.getBoundingClientRect();
      var d=Math.abs(r.top+r.height/2-innerHeight/2);
      if(d<bd){{bd=d;best=i;}}
    }});
    links.forEach(function(a,i){{a.classList.toggle('act',i===best);}});
  }}

  /* --- narration: plays the chapter you are actually reading --- */
  var snd=D.getElementById('snd'), on=false, cur=null;
  function stop(){{ if(cur){{try{{cur.pause();cur.currentTime=0;}}catch(e){{}} cur=null;}} }}
  function play(id){{
    var a=D.getElementById(id); if(!a) return;
    if(cur===a && !a.paused) return;
    stop(); cur=a; a.volume=0; a.play().then(function(){{
      var t=0,iv=setInterval(function(){{t+=.06;a.volume=Math.min(.92,t);if(t>=.92)clearInterval(iv);}},40);
    }}).catch(function(){{}});
  }}
  var vio=new IntersectionObserver(function(es){{
    if(!on) return;
    es.forEach(function(e){{
      if(e.isIntersecting && e.intersectionRatio>.55){{
        var id=e.target.getAttribute('data-vo'); if(id) play(id);
      }}
    }});
  }},{{threshold:[.55]}});
  var voEls=chs.concat([endEl]);
  voEls.forEach(function(c){{ if(c.hasAttribute('data-vo')) vio.observe(c); }});

  function toggle(){{
    on=!on; snd.classList.toggle('on',on);
    snd.querySelector('.lbl').textContent = on ? 'روشن' : 'روایت';
    if(!on){{stop();return;}}
    /* start from whichever chapter is on screen right now */
    var pick=null,bd=1e9,vh=innerHeight;
    voEls.forEach(function(c){{
      if(!c.hasAttribute('data-vo'))return;
      var r=c.getBoundingClientRect();
      var d=Math.abs(r.top+r.height/2-vh/2);
      if(d<bd){{bd=d;pick=c;}}
    }});
    if(pick&&bd<vh) play(pick.getAttribute('data-vo'));
  }}
  snd.addEventListener('click',toggle);
  snd.addEventListener('keydown',function(e){{
    if(e.key==='Enter'||e.key===' '){{e.preventDefault();toggle();}}
  }});

  /* --- keyboard: jump chapter to chapter --- */
  addEventListener('keydown',function(e){{
    if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
    var vh=innerHeight, tgt=null;
    var all=[D.getElementById('hero')].concat(chs).concat([endEl]);
    for(var i=0;i<all.length;i++){{
      var t=all[i].getBoundingClientRect().top;
      if(e.key==='ArrowDown'&&t>8){{tgt=all[i];break;}}
      if(e.key==='ArrowUp'&&t<-8) tgt=all[i];
    }}
    if(tgt){{e.preventDefault();tgt.scrollIntoView({{behavior:'smooth'}});}}
  }});

  frame();
}})();
</script>
</body>
</html>
"""


if __name__ == "__main__":
    html = build()
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"\nwrote {OUT}  ({os.path.getsize(OUT)/1024/1024:.2f} MB)")
