import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const chromium = (await import('@sparticuz/chromium')).default;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const mm = require('music-metadata');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const URL_PAGE = 'http://localhost:8420/Z-NOX-Animation.html';
const AUDIO_DIR = '/home/user/scico/znox/audio';
const RAW = '/home/user/scico/znox/raw.webm';
const VIDEO_NORM = '/home/user/scico/znox/_video_norm.mp4';
const AUDIO_TRACK = '/home/user/scico/znox/_audio_track.m4a';
const OUT = '/home/user/scico/znox/Z-NOX-Video.mp4';

const PLAYBACK_RATE = 1.16, TAIL = 1.15, DEFAULT_DUR = 7;

async function measureAll() {
  const files = [];
  for (let i = 1; i <= 18; i++) files.push(`seg${String(i).padStart(2, '0')}.mp3`);
  const durs = [];
  for (const f of files) {
    const md = await mm.parseFile(`${AUDIO_DIR}/${f}`);
    durs.push(md.format.duration || 0);
  }
  return durs;
}

function timeline(durs) {
  const N = durs.length, start = [], dur = [];
  let acc = 0;
  for (let i = 0; i < N; i++) {
    start[i] = acc;
    dur[i] = durs[i] > 0 ? durs[i] / PLAYBACK_RATE + TAIL : DEFAULT_DUR;
    acc += dur[i];
  }
  return { start, dur, total: acc };
}

function run(args) {
  execFileSync(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'inherit'] });
}

function buildAudioTrack(durs, tl) {
  const inputs = durs.map((_, i) =>
    `-i ${AUDIO_DIR}/seg${String(i + 1).padStart(2, '0')}.mp3`).flat();
  const chains = durs.map((_, i) => {
    const offMs = Math.round(tl.start[i] * 1000);
    return `[${i}:a]atempo=${PLAYBACK_RATE},aformat=channel_layouts=stereo,adelay=${offMs}|${offMs}[a${i}]`;
  }).join(';');
  const mix = `[${durs.map((_, i) => `a${i}`).join('')}]amix=inputs=${durs.length}:normalize=0,apad[aout]`;
  run(['-y', ...inputs, '-filter_complex', `${chains};${mix}`,
    '-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', AUDIO_TRACK]);
}

function mux() {
  // step 1: normalize the raw webm into a clean mp4 (fixes missing cues/duration)
  run(['-y', '-i', RAW, '-c:v', 'libx264', '-crf', '21', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', VIDEO_NORM]);
  // step 2: mux narration audio
  run(['-y', '-i', VIDEO_NORM, '-i', AUDIO_TRACK,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy',
    '-movflags', '+faststart', '-shortest', OUT]);
  fs.rmSync(VIDEO_NORM, { force: true });
  fs.rmSync(AUDIO_TRACK, { force: true });
}

async function waitEnded(page, totalSec) {
  const deadline = Date.now() + totalSec * 1000 + 60000;
  let lastErr = null;
  while (Date.now() < deadline) {
    try {
      const ended = await page.evaluate(() => window.__ZNOX__ ? window.__ZNOX__.ended : false);
      if (ended) return;
      lastErr = null;
    } catch (e) {
      lastErr = e; // CDP hiccup during heavy screencast — keep waiting
    }
    await new Promise(r => setTimeout(r, 4000));
  }
  console.log('watchdog reached — stopping recording', lastErr ? `(last err: ${lastErr.message})` : '');
}

console.log('== measuring narration durations ==');
const durs = await measureAll();
const tl = timeline(durs);
console.log('narration:', durs.map(d => d.toFixed(1)).join(' '));
console.log('total timeline:', tl.total.toFixed(1), 's');

console.log('== launching chromium ==');
const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  protocolTimeout: 900000,
  args: [
    ...chromium.args,
    '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
    '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    '--autoplay-policy=no-user-gesture-required',
  ],
  defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
});

let recorder = null;
try {
  const page = await browser.newPage();
  console.log('== loading page ==');
  await page.goto(URL_PAGE, { waitUntil: 'networkidle0', timeout: 60000 });
  for (let i = 0; i < 60; i++) {
    const ok = await page.evaluate(() => window.__ZNOX__ && window.__ZNOX__.ready).catch(() => false);
    if (ok) break;
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('ready. starting screencast…');

  recorder = await page.screencast({
    path: RAW, fps: 30, ffmpegPath, overwrite: true,
  });

  await page.evaluate(() => window.__ZNOX__.start());
  console.log('animation started — recording (~' + tl.total.toFixed(0) + 's)');

  await waitEnded(page, tl.total);

  await new Promise(r => setTimeout(r, 1500));
  await recorder.stop();
  recorder = null;
  console.log('recording stopped:', fs.statSync(RAW).size, 'bytes');

  console.log('== building audio track ==');
  buildAudioTrack(durs, tl);

  console.log('== muxing final video ==');
  mux();

  const sz = fs.statSync(OUT).size;
  console.log('DONE:', OUT, (sz / 1048576).toFixed(1), 'MB');
} finally {
  try { if (recorder) await recorder.stop(); } catch (e) {}
  await browser.close();
}
