import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const chromium = (await import('@sparticuz/chromium')).default;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const mm = require('music-metadata');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const URL_PAGE = 'http://localhost:8420/Z-NOX-Animation.html';
const AUDIO_DIR = '/home/user/scico/znox/audio';
const FRAMES = '/tmp/frames';
const LIST = '/tmp/frames/list.txt';
const VIDEO_NORM = '/home/user/scico/znox/_video_norm.mp4';
const AUDIO_TRACK = '/home/user/scico/znox/_audio_track.m4a';
const OUT = '/home/user/scico/znox/Z-NOX-Video.mp4';

const PLAYBACK_RATE = 1.16, TAIL = 1.15, DEFAULT_DUR = 7;

function run(args) {
  execFileSync(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 8 * 1024 * 1024 });
}

async function measureAll() {
  const durs = [];
  for (let i = 1; i <= 18; i++) {
    const md = await mm.parseFile(`${AUDIO_DIR}/seg${String(i).padStart(2, '0')}.mp3`);
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

function buildAudioTrack(durs, tl) {
  console.log('  building audio track from', durs.length, 'segments');
  const inputs = [];
  for (let i = 0; i < durs.length; i++) {
    inputs.push('-i', `${AUDIO_DIR}/seg${String(i + 1).padStart(2, '0')}.mp3`);
  }
  const chains = durs.map((_, i) => {
    const offMs = Math.round(tl.start[i] * 1000);
    return `[${i}:a]atempo=${PLAYBACK_RATE},aformat=channel_layouts=stereo,adelay=${offMs}|${offMs}[a${i}]`;
  }).join(';');
  const mix = `[${durs.map((_, i) => `a${i}`).join('')}]amix=inputs=${durs.length}:normalize=0,apad[aout]`;
  run(['-y', ...inputs, '-filter_complex', `${chains};${mix}`,
    '-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', AUDIO_TRACK]);
}

function encodeVideo(tl) {
  console.log('  encoding frames -> mp4');
  run(['-y', '-f', 'concat', '-safe', '0', '-i', LIST,
    '-vf', 'format=yuv420p',
    '-c:v', 'libx264', '-crf', '20', '-preset', 'medium',
    '-movflags', '+faststart', VIDEO_NORM]);
}

function mux() {
  console.log('  muxing video + narration');
  run(['-y', '-i', VIDEO_NORM, '-i', AUDIO_TRACK,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy',
    '-movflags', '+faststart', '-shortest', OUT]);
  fs.rmSync(VIDEO_NORM, { force: true });
  fs.rmSync(AUDIO_TRACK, { force: true });
}

/* ================= MAIN ================= */
console.log('== measuring narration ==');
const durs = await measureAll();
const tl = timeline(durs);
console.log('total timeline:', tl.total.toFixed(1), 's');

fs.rmSync(FRAMES, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });

console.log('== launching chromium ==');
const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  protocolTimeout: 600000,
  args: [...chromium.args,
    '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
    '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    '--autoplay-policy=no-user-gesture-required'],
  defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
});

try {
  const page = await browser.newPage();
  console.log('== loading page ==');
  await page.goto(URL_PAGE, { waitUntil: 'networkidle0', timeout: 60000 });
  for (let i = 0; i < 60; i++) {
    if (await page.evaluate(() => window.__ZNOX__ && window.__ZNOX__.ready).catch(() => false)) break;
    await new Promise(r => setTimeout(r, 500));
  }
  await page.evaluate(() => { window.__ZNOX__.setDrive('wall'); });
  await page.evaluate(() => window.__ZNOX__.start());
  console.log('== capturing (~' + tl.total.toFixed(0) + 's) ==');

  const t0 = Date.now();
  const shots = [];
  let idx = 0;
  while (true) {
    const ts = Date.now();
    const elapsed = (ts - t0) / 1000;
    if (elapsed > tl.total + 3) break;
    const buf = await page.screenshot({ type: 'jpeg', quality: 72 });
    idx++;
    fs.writeFileSync(path.join(FRAMES, `f${String(idx).padStart(6, '0')}.jpg`), buf);
    shots.push({ idx, ts });
    if (idx % 300 === 0) {
      console.log(`  ${idx} frames | ${(idx / ((ts - t0) / 1000)).toFixed(1)} fps | ${elapsed.toFixed(0)}s`);
    }
    // end early if the page finished (ended flag)
    if (idx % 20 === 0) {
      const ended = await page.evaluate(() => window.__ZNOX__.ended).catch(() => false);
      if (ended) break;
    }
  }
  const tEnd = Date.now();
  console.log('captured', idx, 'frames in', ((tEnd - t0) / 1000).toFixed(1), 's =', (idx / ((tEnd - t0) / 1000)).toFixed(2), 'fps');

  if (idx < 10) throw new Error('too few frames captured');

  // build concat list with durations
  console.log('== building concat list ==');
  const lastDur = shots.length > 1 ? (shots[shots.length - 1].ts - shots[shots.length - 2].ts) / 1000 : 0.1;
  const rawSpan = (shots[shots.length - 1].ts - shots[0].ts) / 1000 + lastDur;
  const scale = tl.total / rawSpan;
  let lines = ['ffconcat version 1.0'];
  for (let i = 0; i < shots.length; i++) {
    const dur = (i < shots.length - 1 ? (shots[i + 1].ts - shots[i].ts) / 1000 : lastDur) * scale;
    lines.push(`file '${path.join(FRAMES, `f${String(shots[i].idx).padStart(6, '0')}.jpg`)}'`);
    lines.push(`duration ${dur.toFixed(4)}`);
  }
  fs.writeFileSync(LIST, lines.join('\n') + '\n');
  console.log('  frames:', shots.length, '| scaled total:', (rawSpan * scale).toFixed(1), 's');

  console.log('== encoding ==');
  encodeVideo(tl);

  console.log('== audio ==');
  buildAudioTrack(durs, tl);

  console.log('== mux ==');
  mux();

  const sz = fs.statSync(OUT).size;
  console.log('DONE:', OUT, (sz / 1048576).toFixed(1), 'MB');
} finally {
  await browser.close();
}
