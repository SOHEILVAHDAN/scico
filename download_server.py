#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, urllib.parse, re
from http.server import BaseHTTPRequestHandler, HTTPServer

VID_DIR = "/home/user/scico/سریال-سیمان-خورشید/ویدیو"

# map: english key -> actual persian filename
FILES = {
    "full":   "سریال-کامل-فصل-اول.mp4",
    "ep1":    "قسمت۱-دود-و-صبح.mp4",
    "ep2":    "قسمت۲-سیمان-خورشید.mp4",
    "ep3":    "قسمت۳-جلسه.mp4",
    "ep4":    "قسمت۴-تست-خیابان.mp4",
    "ep5":    "قسمت۵-قرارداد.mp4",
}

META = {
    "full": ("کل فصل اول (کامل)", "4:37", "42MB"),
    "ep1":  ("قسمت ۱ — دود و صبح", "1:08", "8.1MB"),
    "ep2":  ("قسمت ۲ — سیمان خورشید", "0:58", "8.2MB"),
    "ep3":  ("قسمت ۳ — جلسه", "0:56", "7.2MB"),
    "ep4":  ("قسمت ۴ — تستِ خیابان", "0:45", "12MB"),
    "ep5":  ("قسمت ۵ — قرارداد", "0:48", "7.1MB"),
}

PAGE = """<!DOCTYPE html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>سریال سیمانِ خورشید — دانلود</title>
<style>
body{{font-family:'Segoe UI',Tahoma,sans-serif;background:#0e1216;color:#eaeaea;margin:0;padding:24px}}
.wrap{{max-width:720px;margin:0 auto}}
h1{{font-size:26px;color:#ffd65a;margin:0 0 4px}}
.sub{{color:#9aa4b0;margin-bottom:22px}}
.card{{background:#161c23;border:1px solid #222b34;border-radius:14px;padding:16px;margin-bottom:12px}}
.card h2{{margin:0 0 4px;font-size:17px}}
.meta{{color:#7f8b98;font-size:13px;margin-bottom:10px}}
a.btn{{display:inline-block;background:#ffd65a;color:#0e1216;text-decoration:none;padding:9px 18px;border-radius:8px;font-weight:bold}}
a.btn.gray{{background:#2a343e;color:#eaeaea}}
.big{{background:linear-gradient(135deg,#1c242e,#141a20);border:1px solid #ffd65a55}}
</style></head><body><div class="wrap">
<h1>سیمانِ خورشید</h1>
<div class="sub">سریال داستانی ۵ قسمتی — ارائهٔ بتن فتوکاتالیست به سرمایه‌گذار · تهران</div>
<div class="card big"><h2>🎬 کل فصل اول (یک فایل کامل)</h2>
<div class="meta">مدت: 4:37 · MP4 · 1280×720 · با صدا و زیرنویس</div>
<a class="btn" href="/download?f=full">⬇ دانلود کل سریال</a></div>
{cards}
<div class="sub" style="margin-top:16px">اگر دانلود به‌صورت خودکار شروع نشد، روی دکمه کلیک راست کنید و «Save link as… / ذخیره پیوند به‌عنوان» را بزنید.</div>
</div></body></html>
"""

def build_cards():
    out = []
    order = ["ep1","ep2","ep3","ep4","ep5"]
    for k in order:
        t, d, s = META[k]
        out.append(f'<div class="card"><h2>{t}</h2><div class="meta">مدت: {d} · {s}</div>'
                   f'<a class="btn" href="/download?f={k}">دانلود</a></div>')
    return "\n".join(out)

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        if u.path == "/":
            body = PAGE.format(cards=build_cards()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if u.path == "/download":
            q = urllib.parse.parse_qs(u.query)
            key = q.get("f", ["full"])[0]
            fname = FILES.get(key)
            if not fname:
                self.send_response(404); self.end_headers(); return
            path = os.path.join(VID_DIR, fname)
            if not os.path.exists(path):
                self.send_response(404); self.end_headers(); return
            size = os.path.getsize(path)
            ascii_name = f"siman_khorshid_{key}.mp4"  # safe ASCII download name
            self.send_response(200)
            self.send_header("Content-Type", "video/mp4")
            self.send_header("Content-Disposition", f'attachment; filename="{ascii_name}"')
            self.send_header("Content-Length", str(size))
            self.end_headers()
            with open(path, "rb") as f:
                while True:
                    chunk = f.read(65536)
                    if not chunk: break
                    try: self.wfile.write(chunk)
                    except Exception: break
            return
        self.send_response(404); self.end_headers()

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8100), H).serve_forever()
