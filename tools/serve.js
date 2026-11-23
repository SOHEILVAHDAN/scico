const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webp': 'image/webp', '.md': 'text/markdown; charset=utf-8'
};

function serve(port) {
  return new Promise(res => {
    const srv = http.createServer((req, rq) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        rq.writeHead(404); return rq.end('nf');
      }
      const stat = fs.statSync(f);
      const type = MIME[path.extname(f).toLowerCase()] || 'application/octet-stream';
      const range = req.headers.range;

      // ---- HTTP Range support (required for video seeking) ----
      if (range && /^bytes=/.test(range)) {
        const [s, e] = range.replace(/bytes=/, '').split('-');
        let start = s ? parseInt(s, 10) : 0;
        let end = e ? parseInt(e, 10) : stat.size - 1;
        if (isNaN(start)) start = 0;
        if (isNaN(end) || end >= stat.size) end = stat.size - 1;
        if (start > end) { rq.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); return rq.end(); }
        rq.writeHead(206, {
          'Content-Type': type,
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Cache-Control': 'public, max-age=3600'
        });
        return fs.createReadStream(f, { start, end }).pipe(rq);
      }

      rq.writeHead(200, {
        'Content-Type': type,
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      });
      if (req.method === 'HEAD') return rq.end();
      fs.createReadStream(f).pipe(rq);
    });
    srv.listen(port, '0.0.0.0', () => res(srv));
  });
}
module.exports = { serve };
if (require.main === module) {
  const port = Number(process.argv[2] || 4173);
  serve(port).then(() => console.log('http://0.0.0.0:' + port));
}
