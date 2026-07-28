# SAHI Studio — Leather Atelier · Instagram Reel

A vertical (1080×1920, 30 fps) cinematic reel adapted from the
[SAHI Studio · Leather Atelier](https://sahistudio1.lovable.app/) microsite —
the story of an eighty-year-old shoemaker's workshop in an old bazaar,
transformed into a contemporary leather gallery.

**Deliverable:** `build/sahi-atelier-reel.mp4` (~68 s, 42 MB, 5 Mbps)
**Caption pack:** [`CAPTION.md`](CAPTION.md)

---

## The edit

The site is structured in nine numbered "chapters". The reel keeps that spine
but compresses it into a single narrative arc — heritage → craft → material →
the question → the answer (the slit of light) → the threshold → the masterpiece
→ resolution.

| # | Shot | In → Out | Beat |
|---|---|---|---|
| 1 | `01-heritage.jpg` | 0.0 → 8.1 | The eighty-year-old workshop |
| 2 | `02-craft.jpg` | 7.4 → 13.8 | Four generations of hands |
| 3 | `03-material.jpg` | 13.1 → 18.7 | Tobacco leather, concrete, copper |
| 4 | `09-wall.jpg` | 18.0 → 23.7 | Materials that age, and remember |
| 5 | `04-blueprint.jpg` | 23.0 → 30.1 | The design question |
| 6 | `05-facade.jpg` | 29.4 → 38.6 | A slit of light · "not a door — an invitation" |
| 7 | `07-threshold.jpg` | 37.9 → 45.6 | Drawn inward |
| 8 | `06-masterpiece.jpg` | 44.9 → 56.0 | One shoe. Suspended. |
| 9 | `08-gallery.jpg` | 55.3 → 62.5 | From workshop to gallery |
| 10 | `10-outro.jpg` | 61.8 → 68.2 | End card |

Shots overlap by 0.7 s. Every cut is covered by the **slit-of-light wipe** — a
vertical amber beam that blooms and washes the frame, lifted from the project's
own architectural motif (the razor-thin entrance slit in the copper facade).

## Look

- **Ken Burns** push/pan on every frame, eased (`smoothstep`) so moves feel
  motorised rather than linear, with a sub-pixel *gate weave* so the picture
  never sits perfectly still.
- **2700 K grade** matching the site's stated lighting spec: warm channel gains,
  a filmic S-curve, and a green-teal shadow lift that reads as copper patina.
- Vignette, bottom scrim for caption legibility, and luminance-weighted film
  grain (heavier in the shadows, as real stock behaves).
- **Type:** Cormorant Garamond for the Latin chapter labels (letter-spaced caps
  with a hairline rule), Vazirmatn for the Persian body.

## Audio

`score.py` synthesises the entire bed from scratch — no samples, so it is
clean for commercial use:

- sub drone in D minor, rising a fifth at the reveal
- one slow pad chord per chapter, tracing the narrative arc
- a sparse felt-piano motif with octave-down shadow notes
- workshop room tone, a heartbeat pulse under the masterpiece reveal, and an
  amber shimmer on each slit-wipe cut
- convolution reverb, then **side-chain ducking** under the narration

The Persian voiceover (9 lines) is loudness-normalised to −16 LUFS, trimmed,
and nudged 6 % faster for pace. `VO_AT` in `score.py` is the sync map between
narration and the picture edit.

## Build

```bash
python -m venv .venv && source .venv/bin/activate
pip install numpy pillow arabic-reshaper python-bidi imageio-ffmpeg

python score.py                 # -> build/audio.wav      (~1.5 min)
python render.py                # -> build/video.mp4      (~15 min)
python stills.py 8.5 33.0 46.0  # single frames for QA / carousel posts
```

Then mux:

```bash
ffmpeg -i build/video.mp4 -i build/audio.wav \
       -c:v copy -c:a aac -b:a 192k -shortest \
       build/sahi-atelier-reel.mp4
```

`render.py --preview` renders every 6th frame for a fast structural check.

## Note on the imagery

The sandbox this was built in only has allow-listed network egress, so the
microsite's own photography could not be downloaded. The ten frames in
`assets/` are generated stand-ins art-directed to the project's brief —
tobacco leather, old bazaar brick, oxidised copper, raw concrete, 2700 K amber
light. **Swap them for the real project photography before publishing**: drop
files with the same names into `assets/` and re-run `render.py`. Nothing else
needs to change.

## Brand mark

`logo.py` redraws the SAHI Studio mark as vector-style artwork from
coordinates (no bitmap tracing): a tall open-bottom frame whose inner rails
funnel into a pointed tail, with the SAHI logotype built from the same
hairline geometry so the frame's verticals read as the letters' extenders.

```bash
python logo.py     # -> brand/logo-{light,dark,alpha}.png
```

`build_logo(height, ink, ground, progress)` is importable; `progress` (0..1)
drives the top-down draw-on reveal used on the reel's end card, where the mark
now replaces the old "SAHI STUDIO" wordmark. The corner watermark retires as
the end card arrives so the two never compete.

## Layout

```
assets/     10 vertical source frames
fonts/      Vazirmatn (Persian) + Cormorant Garamond (Latin)
audio/      raw Persian VO (mp3) + trim/ (normalised wav)
logo.py     the SAHI Studio mark, drawn from coordinates
brand/      logo exports (light / dark / transparent)
render.py   picture: Ken Burns, grade, grain, captions, slit wipes
score.py    music bed + VO mix
stills.py   dump graded frames from the timeline
CAPTION.md  Persian + English captions and posting notes
build/      output (git-ignored)
```
