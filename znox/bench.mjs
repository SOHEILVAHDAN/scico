import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const chromium = (await import('@sparticuz/chromium')).default;

const URL_PAGE = 'http://localhost:8420/Z-NOX-Animation.html';
const common = [
  ...chromium.args,
  '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
  '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
];

async function exp1() {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(), headless: 'shell',
    protocolTimeout: 600000, args: [...common, '--disable-gpu'],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.goto(URL_PAGE, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__ZNOX__ && window.__ZNOX__.ready');
  // rAF benchmark (no screencast)
  const raf = await page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    function tick() { n++; if (performance.now() - t0 < 5000) requestAnimationFrame(tick); else res(n / 5); }
    requestAnimationFrame(tick);
  }));
  // screencast benchmark
  const rec = await page.screencast({ path: '/tmp/bench1.webm', fps: 30, ffmpegPath: require('@ffmpeg-installer/ffmpeg').path, overwrite: true });
  await page.evaluate(() => window.__ZNOX__.start());
  await new Promise(r => setTimeout(r, 10000));
  await rec.stop();
  await browser.close();
  console.log('exp1 (no-gpu): rAF=', raf.toFixed(1), 'fps | webm size after 10s =', Math.round(require('fs').statSync('/tmp/bench1.webm').size / 1024), 'KB');
}

async function exp2() {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(), headless: 'shell',
    protocolTimeout: 600000,
    args: [...common, '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.goto(URL_PAGE, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__ZNOX__ && window.__ZNOX__.ready');
  const raf = await page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    function tick() { n++; if (performance.now() - t0 < 5000) requestAnimationFrame(tick); else res(n / 5); }
    requestAnimationFrame(tick);
  }));
  const rec = await page.screencast({ path: '/tmp/bench2.webm', fps: 30, ffmpegPath: require('@ffmpeg-installer/ffmpeg').path, overwrite: true });
  await page.evaluate(() => window.__ZNOX__.start());
  await new Promise(r => setTimeout(r, 10000));
  await rec.stop();
  await browser.close();
  console.log('exp2 (swiftshader): rAF=', raf.toFixed(1), 'fps | webm size after 10s =', Math.round(require('fs').statSync('/tmp/bench2.webm').size / 1024), 'KB');
}

async function exp3() {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(), headless: 'shell',
    protocolTimeout: 600000, args: [...common, '--disable-gpu'],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.goto(URL_PAGE, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__ZNOX__ && window.__ZNOX__.ready');
  await page.evaluate(() => window.__ZNOX__.start());
  await new Promise(r => setTimeout(r, 1500));
  const t0 = Date.now();
  const N = 20;
  for (let i = 0; i < N; i++) {
    await page.screenshot({ type: 'jpeg', quality: 70 });
  }
  const ms = (Date.now() - t0) / N;
  await browser.close();
  console.log('exp3 (screenshot): avg', ms.toFixed(0), 'ms per shot');
}

const which = process.argv[2] || 'all';
if (which === '1' || which === 'all') await exp1();
if (which === '2' || which === 'all') await exp2();
if (which === '3' || which === 'all') await exp3();
console.log('bench done');
