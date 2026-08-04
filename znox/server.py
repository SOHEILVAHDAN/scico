#!/usr/bin/env python3
"""Static server for znox/ with a /download route that forces attachment download."""
import http.server
import pathlib
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent
PORT = 8420
FILE = "Z-NOX-Animation.html"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ("/download", "/download/"):
            try:
                data = (ROOT / FILE).read_bytes()
            except FileNotFoundError:
                self.send_error(404, f"{FILE} not found")
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header(
                "Content-Disposition",
                'attachment; filename="Z-NOX-Animation.html"',
            )
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)
            return
        return super().do_GET()

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
