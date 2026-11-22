/* =========================================================
   Headless frame-by-frame renderer → ffmpeg → mp4
   usage: node tools/render.js  [--fps 30] [--scale .5] [--from 0] [--to 135]
   ========================================================= */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { serve } = require('./serve');

let chromium, puppeteer;
(async () => {
  const c = await import('@sparticuz/chromium');
  chromium = c.default;
  puppeteer = require('puppeteer-core');
})();

const args = process.argv.slice(2);
const arg = (k, d) => {
  const i = args.indexOf('--' + k);
  return i >= 0 ? args[i + 1] : d;
};
const FPS = Number(arg('fps', 30));
const SCALE = Number(arg('scale', 0.5));
const PORT = Number(arg('port', 4173));
const OUT = arg('out', 'out/znox-catalogue.mp4');
const FF = arg('ffmpeg', process.env.FFMPEG || 'ffmpeg');

const ROOT = path.resolve(__dirname, '..');

(async () => {
  await new Promise(r => setTimeout(r, 50));
  const srv = await serve(PORT);
  const exe = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: [...chromium.args, '--disable-gpu-vsync', '--force-device-scale-factor=1'],
    executablePath: exe,
    headless: 'shell',
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 }
  });
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));

  const MODE = arg('mode', '');
  const url = `http://127.0.0.1:${PORT}/index.html?render=1${MODE ? '&mode=' + MODE : ''}&scale=${SCALE}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__renderReady === true', { timeout: 180000 });

  const dur = await page.evaluate(() => document.body.dataset.dur ? parseFloat(document.body.dataset.dur) : (new URLSearchParams(location.search).get('mode')==='logo' ? LOGO.dur : FILM.duration));
  const from = Number(arg('from', 0));
  const to = Number(arg('to', dur));
  const total = Math.max(1, Math.round((to - from) * FPS));

  fs.mkdirSync(path.dirname(path.resolve(ROOT, OUT)), { recursive: true });
  const outPath = path.resolve(ROOT, OUT);
  const isImage = /\.(png|jpg|jpeg)$/i.test(outPath);

  const vf = `scale=${Math.round(1920 * SCALE)}:-2:flags=lanczos`;
  const ffArgs = isImage
    ? ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-i', '-', '-vf', vf, '-frames:v', '1', outPath]
    : ['-y', '-hide_banner', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-vf', vf, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath];
  const ff = spawn(FF, ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  const done = new Promise((res, rej) => {
    ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)));
  });

  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    const t = from + f / FPS;
    await page.evaluate(tt => window.__setTime(tt), t);
    const buf = await page.screenshot({ type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1920, height: 1080 }, captureBeyondViewport: false });
    try { if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); } catch (e) { break; }
    if (isImage) break;
    if (f % 60 === 0) {
      const el = (Date.now() - t0) / 1000;
      const eta = el / (f + 1) * (total - f - 1);
      console.log(`frame ${f}/${total}  t=${t.toFixed(2)}s  ${(el / (f + 1) * 1000).toFixed(0)}ms/f  eta ${eta.toFixed(0)}s`);
    }
  }
  ff.stdin.end();
  await done;
  await browser.close();
  srv.close();
  console.log('done →', outPath, `in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
})().catch(e => { console.error(e); process.exit(1); });
