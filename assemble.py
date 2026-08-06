#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, subprocess, glob, sys, json
from build_render import (make_title, audio_duration, build_scene_video,
                          concat_videos, mux_audio, FFMPEG)

ROOT = "/home/user/scico/سریال-سیمان-خورشید"
IMG = os.path.join(ROOT, "تصاویر")
AUD = os.path.join(ROOT, "صدا")
OUT = os.path.join(ROOT, "ویدیو")
WORK = "/tmp/tsb"
os.makedirs(OUT, exist_ok=True)
os.makedirs(WORK, exist_ok=True)

PAD = 0.35  # breathing pad per scene
SIL = 0.35  # silence between clips

def silence(dur, out):
    subprocess.run([FFMPEG, "-y", "-f", "lavfi", "-i",
                    f"anullsrc=r=44100:cl=stereo", "-t", str(dur),
                    "-c:a", "pcm_s16le", out], capture_output=True)
    return out

def to_wav(src, out):
    subprocess.run([FFMPEG, "-y", "-i", src, "-ac", "2", "-ar", "44100",
                    "-c:a", "pcm_s16le", out], capture_output=True)
    return out

def build_audio(lead, clips, trail, out):
    # Assemble a single continuous WAV via robust wav-concat, then encode to AAC.
    wavs = []
    lead_w = silence(lead, os.path.join(WORK, "lead.wav")); wavs.append(lead_w)
    for i, c in enumerate(clips):
        w = to_wav(c, os.path.join(WORK, f"c{i}.wav")); wavs.append(w)
        if i < len(clips) - 1:
            s = silence(SIL, os.path.join(WORK, f"s{i}.wav")); wavs.append(s)
    trail_w = silence(trail, os.path.join(WORK, "trail.wav")); wavs.append(trail_w)
    lst = os.path.join(WORK, "alist.txt")
    with open(lst, "w") as f:
        for p in wavs:
            f.write(f"file '{p}'\n")
    full_wav = os.path.join(WORK, "full.wav")
    subprocess.run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-c", "copy", full_wav], capture_output=True)
    subprocess.run([FFMPEG, "-y", "-i", full_wav, "-c:a", "aac",
                    "-b:a", "160k", out], capture_output=True)
    return out

def render_episode(name, title, title_sub, scenes, audio_clips, outname,
                   outro_title="پایان فصل — ادامه دارد", outro_sub=""):
    """scenes: list of dict(image, motion, subtitle, speaker, pad)
       audio_clips: list of mp3 paths aligned with scene clip segments."""
    lead = 3.0
    trail = 4.0
    # scene 0 = title
    title_png = os.path.join(WORK, f"title_{name}.png")
    make_title(title, title_sub, title_png, scenes[0]["image"])
    # render title video
    subprocess.run([FFMPEG, "-y", "-loop", "1", "-i", title_png,
                    "-t", str(lead), "-r", str(24),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    os.path.join(WORK, f"{name}_title.mp4")], capture_output=True)

    # render each clip scene
    video_segs = [os.path.join(WORK, f"{name}_title.mp4")]
    for i, sc in enumerate(scenes):
        dur = audio_duration(audio_clips[i]) + sc.get("pad", PAD)
        v = build_scene_video(sc["image"], sc["motion"], dur,
                              sc.get("subtitle"), sc.get("speaker"),
                              os.path.join(WORK, f"{name}_sc{i}.mp4"),
                              os.path.join(WORK, f"{name}_f{i}"))
        video_segs.append(v)

    # outro card
    outro_png = os.path.join(WORK, f"outro_{name}.png")
    make_title(outro_title, outro_sub, outro_png, scenes[-1]["image"])
    subprocess.run([FFMPEG, "-y", "-loop", "1", "-i", outro_png,
                    "-t", str(trail), "-r", str(24),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    os.path.join(WORK, f"{name}_outro.mp4")], capture_output=True)
    video_segs.append(os.path.join(WORK, f"{name}_outro.mp4"))

    combined_v = os.path.join(WORK, f"{name}_video.mp4")
    concat_videos(video_segs, combined_v)
    combined_a = os.path.join(WORK, f"{name}_audio.m4a")
    build_audio(lead, audio_clips, trail, combined_a)
    final = os.path.join(OUT, outname)
    mux_audio(combined_v, combined_a, final)
    print("DONE", final, os.path.getsize(final))
    return final
