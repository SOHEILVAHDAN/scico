#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Motion-comic video renderer: Ken Burns camera + Persian subtitles + title cards."""
import os, subprocess, math, glob
import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FFMPEG = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
FONT = "/home/user/.fonts/Vazirmatn-Regular.ttf"
W, H = 1280, 720
FPS = 24

_fontcache = {}
def font(size):
    if size not in _fontcache:
        _fontcache[size] = ImageFont.truetype(FONT, size)
    return _fontcache[size]

def fa(text):
    return get_display(arabic_reshaper.reshape(text))

def wrap(text, maxw, size):
    shaped = fa(text)
    f = font(size)
    lines, cur = [], ""
    for ch in shaped:
        if f.getlength(cur + ch) > maxw:
            lines.append(cur); cur = ch
        else:
            cur += ch
    if cur: lines.append(cur)
    return lines

def draw_subtitle(img, text, speaker=None):
    if not text:
        return
    d = ImageDraw.Draw(img, "RGBA")
    lines = wrap(text, W - 160, 40)
    line_h = 54
    total_h = line_h * len(lines)
    y0 = H - 60 - total_h
    # background bar
    d.rectangle([0, y0 - 14, W, H - 30], fill=(0, 0, 0, 130))
    y = y0
    for ln in lines:
        tw = font(40).getlength(ln)
        x = (W - tw) / 2
        d.text((x, y), ln, font=font(40), fill=(255, 255, 255, 255))
        y += line_h
    if speaker:
        s = "— " + speaker
        sw = font(30).getlength(s)
        d.text(((W - sw) / 2, y0 - 40), s, font=font(30), fill=(255, 214, 90, 255))

def kenburns(base, t, dur, motion="zoom-in"):
    iw, ih = base.size
    # target crop window
    if motion == "zoom-in":
        z0, z1 = 1.0, 1.22
    elif motion == "zoom-out":
        z0, z1 = 1.22, 1.0
    elif motion == "pan-right":
        z0, z1 = 1.18, 1.18
    elif motion == "pan-left":
        z0, z1 = 1.18, 1.18
    elif motion == "pan-up":
        z0, z1 = 1.18, 1.18
    else:
        z0, z1 = 1.0, 1.15
    p = t / dur
    z = z0 + (z1 - z0) * p
    z = min(max(z, 1.0), 1.35)
    cw, ch = iw / z, ih / z
    # center position as fraction of available travel
    if motion == "pan-right":
        fx = p; fy = 0.5
    elif motion == "pan-left":
        fx = 1 - p; fy = 0.5
    elif motion == "pan-up":
        fx = 0.5; fy = 1 - p
    else:
        fx, fy = 0.5, 0.5
    x = (iw - cw) * fx
    y = (ih - ch) * fy
    crop = base.crop((x, y, x + cw, y + ch)).resize((W, H), Image.LANCZOS)
    # subtle vignette + grade
    return crop

def make_title(title, sub, outpath, bg_img=None):
    if bg_img:
        img = Image.open(bg_img).convert("RGB").resize((W, H), Image.LANCZOS)
    else:
        img = Image.new("RGB", (W, H), (16, 18, 24))
    img = img.filter(ImageFilter.GaussianBlur(4))
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 150))
    img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
    d = ImageDraw.Draw(img)
    big = fa(title)
    tw = font(78).getlength(big)
    d.text(((W - tw) / 2, H / 2 - 90), big, font=font(78), fill=(255, 255, 255, 255))
    if sub:
        sub = fa(sub)
        sw = font(34).getlength(sub)
        d.text(((W - sw) / 2, H / 2 + 10), sub, font=font(34), fill=(255, 214, 90, 255))
    img.save(outpath)

def audio_duration(path):
    r = subprocess.run([FFMPEG, "-i", path], capture_output=True, text=True)
    out = r.stderr
    import re
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", out)
    h, mi, s = m.groups()
    return int(h) * 3600 + int(mi) * 60 + float(s)

def make_subtitle_png(text, speaker, outpath):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if not text:
        img.save(outpath); return outpath
    d = ImageDraw.Draw(img, "RGBA")
    lines = wrap(text, W - 160, 40)
    line_h = 54
    total_h = line_h * len(lines)
    y0 = H - 70 - total_h
    d.rectangle([0, y0 - 14, W, H - 40], fill=(0, 0, 0, 140))
    y = y0
    for ln in lines:
        tw = font(40).getlength(ln)
        x = (W - tw) / 2
        d.text((x, y), ln, font=font(40), fill=(255, 255, 255, 255))
        y += line_h
    if speaker:
        s = "— " + speaker
        sw = font(30).getlength(s)
        d.text(((W - sw) / 2, y0 - 40), s, font=font(30), fill=(255, 214, 90, 255))
    img.save(outpath)
    return outpath

def build_scene_video(base, motion, dur, subtext, speaker, outmp4, workdir):
    os.makedirs(workdir, exist_ok=True)
    frames = max(int(round(dur * FPS)), 2)
    zf = _zoompan(motion, frames)
    sub_png = os.path.join(workdir, "sub.png")
    make_subtitle_png(subtext, speaker, sub_png)
    vf = f"[0:v]{zf}[v0];[v0][1:v]overlay=0:0:format=yuv420[v]"
    cmd = [FFMPEG, "-y", "-loop", "1", "-i", base, "-i", sub_png,
           "-filter_complex", vf,
           "-map", "[v]", "-t", str(dur), "-r", str(FPS),
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", outmp4]
    r = subprocess.run(cmd, capture_output=True)
    return outmp4

def _zoompan(motion, frames):
    n = max(frames, 2)
    if motion == "zoom-in":
        return f"zoompan=z='1+0.35*on/{n}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}"
    if motion == "zoom-out":
        return f"zoompan=z='1.35-0.35*on/{n}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}"
    if motion == "pan-right":
        return f"zoompan=z='1.15':d=1:x='(iw-iw/zoom)*on/{n}':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}"
    if motion == "pan-left":
        return f"zoompan=z='1.15':d=1:x='(iw-iw/zoom)*(1-on/{n})':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}"
    if motion == "pan-up":
        return f"zoompan=z='1.15':d=1:x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(1-on/{n})':s={W}x{H}:fps={FPS}"
    return f"zoompan=z='1+0.3*on/{n}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}"

def concat_videos(segments, outmp4):
    """segments: list of mp4 paths. Concatenate."""
    lst = "/tmp/concat.txt"
    with open(lst, "w") as f:
        for s in segments:
            f.write(f"file '{s}'\n")
    cmd = [FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", lst,
           "-c", "copy", outmp4]
    subprocess.run(cmd, capture_output=True)
    return outmp4

def mux_audio(video, audio, outmp4):
    cmd = [FFMPEG, "-y", "-i", video, "-i", audio,
           "-fflags", "+genpts", "-map", "0:v:0", "-map", "1:a:0",
           "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
           "-movflags", "+faststart", outmp4]
    subprocess.run(cmd, capture_output=True)
    return outmp4

if __name__ == "__main__":
    print("renderer ready")
