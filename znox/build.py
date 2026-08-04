#!/usr/bin/env python3
"""Build Z-NOX-Animation.html from src parts + embedded base64 fonts + audio."""
import base64, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "Z-NOX-Animation.html"

FONTS = {
    "FONT400": SRC / "fonts" / "Vazirmatn-FD-NL-Regular.woff2",
    "FONT500": SRC / "fonts" / "Vazirmatn-FD-NL-Medium.woff2",
    "FONT700": SRC / "fonts" / "Vazirmatn-FD-NL-Bold.woff2",
    "FONT900": SRC / "fonts" / "Vazirmatn-FD-NL-Black.woff2",
}

css = (SRC / "style.css").read_text(encoding="utf-8")
scenes = (SRC / "scenes.html").read_text(encoding="utf-8")
js = (SRC / "app.js").read_text(encoding="utf-8")
shell = (SRC / "shell.html").read_text(encoding="utf-8")

for key, path in FONTS.items():
    if not path.exists():
        sys.exit(f"missing font: {path}")
    b64 = base64.b64encode(path.read_bytes()).decode()
    css = css.replace("{{" + key + "}}", b64)

# embed existing narration audio as data URIs (fallback: external files)
AUDIO_DIR = ROOT / "audio"
embed = {}
if AUDIO_DIR.exists():
    for f in sorted(AUDIO_DIR.glob("seg*.mp3")):
        embed[f.name] = "data:audio/mpeg;base64," + base64.b64encode(f.read_bytes()).decode()
audio_js = "{" + ",".join(f'{json.dumps(k)}:{json.dumps(v)}' for k, v in embed.items()) + "}"
shell = shell.replace("{{AUDIOEMBED}}", audio_js)

html = shell.replace("{{CSS}}", css).replace("{{SCENES}}", scenes).replace("{{JS}}", js)

missing = re.findall(r"\{\{\w+\}\}", html)
if missing:
    sys.exit(f"unresolved placeholders: {missing}")

OUT.write_text(html, encoding="utf-8")
print(f"built {OUT}  ({OUT.stat().st_size/1024:.0f} KB)")
