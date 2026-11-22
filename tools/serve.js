const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml'
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
      rq.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' });
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
