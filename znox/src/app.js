/* ============================================================
   Z-NOX player engine
   - timeline driven by narration audio segments (1 per scene)
   - graceful visual-only fallback if audio unavailable
   ============================================================ */

'use strict';

/* pristine snapshot of the document, captured before any dynamic
   state (active scenes, dots, progress, canvas size) is applied —
   used by the in-app "download" button to ship a clean single file */
window.__PRISTINE__ = document.documentElement.outerHTML;

/* ---- config ---- */
const PLAYBACK_RATE = 1.16;          // slight speed-up of narration (natural)
const TAIL = 1.15;                   // seconds of hold after narration ends
const DEFAULT_SCENE_DUR = 7;         // visual-only scene duration (no audio yet)
const SEGS = [
  'seg01.mp3','seg02.mp3','seg03.mp3','seg04.mp3','seg05.mp3',
  'seg06.mp3','seg07.mp3','seg08.mp3','seg09.mp3','seg10.mp3'
];
const AUDIO_EMBED = window.__AUDIO_EMBED__ || {};   // data-URI audio injected at build
const srcFor = name => AUDIO_EMBED[name] || 'audio/' + name;
const SCENE_TITLES = [
  'معرفی','خلاصه مدیریتی','بیان مسئله','شکاف بازار','راه‌حل و فناوری',
  'کاربردهای هدف','ارزش پیشنهادی','تحلیل رقابتی','اندازه بازار','TAM/SAM/SOM',
  'مدل کسب‌وکار','ساختار هزینه','اعتبارسنجی','نقشه راه','تحلیل ریسک',
  'چشم‌انداز مالی','معرفی تیم','درخواست همکاری'
];

const FA = '۰۱۲۳۴۵۶۷۸۹';
const fa = s => String(s).replace(/\d/g, d => FA[d]);
const $ = s => document.querySelector(s);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

/* ---- state ---- */
const scenes = [...document.querySelectorAll('.scene')];
const N = scenes.length;

let segDurs = new Array(N).fill(0);   // raw audio duration per scene (audio units)
let sceneStart = new Array(N).fill(0); // scene start on master timeline (scene units)
let sceneDur = new Array(N).fill(DEFAULT_SCENE_DUR);
let total = 0;

let t = 0;
let curScene = -1;
let curSeg = -1;
let playing = false;
let started = false;
let ended = false;
let muted = false;
let ready = false;

const audio = new Audio();
audio.preload = 'auto';
audio.playbackRate = PLAYBACK_RATE;

/* ---------- timeline ---------- */
const narDur = i => segDurs[i] / PLAYBACK_RATE;   // narration window length (scene units)

function buildTimeline() {
  let acc = 0;
  for (let i = 0; i < N; i++) {
    sceneStart[i] = acc;
    sceneDur[i] = segDurs[i] > 0 ? narDur(i) + TAIL : DEFAULT_SCENE_DUR;
    acc += sceneDur[i];
  }
  total = acc;
  renderDots();
}

function measureDuration(name) {
  return new Promise(res => {
    const a = new Audio();
    a.preload = 'metadata';
    a.src = srcFor(name);
    let done = false;
    const finish = v => { if (!done) { done = true; res(v); } };
    a.onloadedmetadata = () => finish(a.duration && isFinite(a.duration) ? a.duration : 0);
    a.onerror = () => finish(0);
    setTimeout(() => finish(a.duration && isFinite(a.duration) ? a.duration : 0), 4000);
  });
}

async function init() {
  $('#loading').style.display = 'block';
  const probes = SEGS.map(s => measureDuration(s));
  const ds = await Promise.all(probes);
  for (let i = 0; i < ds.length; i++) segDurs[i] = ds[i];
  buildTimeline();
  $('#loading').style.display = 'none';
  ready = true;
}

function sceneAt(tm) {
  for (let i = N - 1; i >= 0; i--) if (tm >= sceneStart[i]) return i;
  return 0;
}
function segAt(tm) {
  for (let i = N - 1; i >= 0; i--) if (tm >= sceneStart[i]) return i;
  return 0;
}

/* ---------- scene switching ---------- */
function enterScene(i) {
  if (i === curScene) return;
  curScene = i;
  scenes.forEach((s, k) => s.classList.toggle('active', k === i));
  runCounters(scenes[i]);
  updateChrome();
}

function switchSeg(i) {
  if (i === curSeg) return;
  curSeg = i;
  if (i < 0 || i >= SEGS.length || segDurs[i] <= 0) return;
  try {
    audio.src = srcFor(SEGS[i]);
    audio.currentTime = 0;
    audio.playbackRate = PLAYBACK_RATE;
    audio.muted = muted;
    audio.play().catch(() => {});
  } catch (e) { /* visual-only */ }
}

function seekAudioTo(tm) {
  const i = segAt(tm);
  if (i !== curSeg) { switchSeg(i); return; }
  if (i >= 0 && i < SEGS.length && segDurs[i] > 0) {
    const off = (tm - sceneStart[i]) * PLAYBACK_RATE;
    try {
      if (audio.src && audio.src.indexOf(SEGS[i]) !== -1) {
        audio.currentTime = clamp(off, 0, Math.max(0, segDurs[i] - 0.05));
        if (playing) audio.play().catch(() => {});
      } else {
        switchSeg(i);
      }
    } catch (e) { switchSeg(i); }
  }
}

/* ---------- master loop ---------- */
let lastTs = performance.now();
let wallStartTs = 0;               // capture-mode clock origin
let drive = 'audio';               // 'audio' = audio-driven (normal) | 'wall' = wall-clock (capture)
function frame(now) {
  const dt = Math.min(0.1, (now - lastTs) / 1000);
  lastTs = now;

  if (started && !ended) {
    if (playing) {
      if (drive === 'wall') {
        // capture mode: absolute wall clock — immune to rAF stalls
        t = (performance.now() - wallStartTs) / 1000;
      } else {
        // follow audio as master clock while narration is within its window
        const inNar = curSeg >= 0 && segDurs[curSeg] > 0 && !audio.paused && !audio.ended &&
          t >= sceneStart[curSeg] && t < sceneStart[curSeg] + narDur(curSeg);
        if (inNar) {
          t = sceneStart[curSeg] + Math.min(audio.currentTime, segDurs[curSeg]) / PLAYBACK_RATE;
        } else {
          t += dt;
        }
      }
      if (t >= total - 0.02) {
        t = total;
        ended = true;
        playing = false;
        try { audio.pause(); } catch (e) {}
        showEnd();
      } else {
        const sc = sceneAt(t);
        if (sc !== curScene) enterScene(sc);
        const nx = segAt(t);
        if (nx !== curSeg) switchSeg(nx);
      }
    } else {
      // paused: keep time frozen, but keep UI fresh
    }
  }

  drawBg(now);
  updateProgress();
  requestAnimationFrame(frame);
}

/* ---------- controls ---------- */
function start() {
  started = true;
  playing = true;
  t = 0;
  curSeg = -1;
  ended = false;
  if (drive === 'wall') wallStartTs = performance.now();
  $('#startOverlay').classList.add('hide');
  $('#endCard').classList.add('hide');
  enterScene(0);
  switchSeg(0);
  setPlayIcon();
}

function togglePlay() {
  if (!started) return;
  if (ended) { restart(); return; }
  if (playing) {
    playing = false;
    try { audio.pause(); } catch (e) {}
  } else {
    playing = true;
    resumeAudio();
  }
  setPlayIcon();
}

function resumeAudio() {
  if (curSeg < 0) { switchSeg(0); return; }
  if (curSeg >= SEGS.length || segDurs[curSeg] <= 0) return;
  const off = (t - sceneStart[curSeg]) * PLAYBACK_RATE;
  if (off >= segDurs[curSeg] - 0.15) {
    switchSeg(clamp(curSeg + 1, 0, SEGS.length - 1));
    return;
  }
  try {
    if (audio.src && audio.src.indexOf(SEGS[curSeg]) !== -1) {
      audio.currentTime = Math.max(0, off);
      audio.play().catch(() => {});
    } else {
      switchSeg(curSeg);
    }
  } catch (e) { switchSeg(curSeg); }
}

function gotoScene(i) {
  i = clamp(i, 0, N - 1);
  t = sceneStart[i];
  ended = false;
  enterScene(i);
  if (playing) seekAudioTo(t);
  setPlayIcon();
  $('#endCard').classList.add('hide');
}

function restart() {
  t = 0;
  curSeg = -1;
  ended = false;
  playing = true;
  enterScene(0);
  switchSeg(0);
  setPlayIcon();
  $('#endCard').classList.add('hide');
}

function showEnd() {
  $('#endCard').classList.remove('hide');
  updateChrome();
}

function setPlayIcon() {
  const b = $('#btnPlay');
  b.innerHTML = playing
    ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>';
}

function toggleMute() {
  muted = !muted;
  audio.muted = muted;
  const b = $('#btnMute');
  b.innerHTML = muted
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M16 9l6 6M22 9l-6 6"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
}

/* ---------- chrome ---------- */
function renderDots() {
  const box = $('#dots');
  box.innerHTML = '';
  SCENE_TITLES.forEach((tt, i) => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.title = fa(i + 1) + ' — ' + tt;
    b.setAttribute('aria-label', tt);
    b.addEventListener('click', () => gotoScene(i));
    box.appendChild(b);
  });
}

function updateChrome() {
  const i = Math.max(0, curScene);
  $('#cnum').textContent = fa(i + 1) + ' / ' + fa(N);
  $('#cttl').textContent = SCENE_TITLES[i] || '';
  document.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('on', k === i));
}

function updateProgress() {
  const p = total > 0 ? clamp(t / total, 0, 1) : 0;
  $('#pfill').style.width = (p * 100) + '%';
}

$('#pbar').addEventListener('click', e => {
  if (!ready) return;
  const r = e.currentTarget.getBoundingClientRect();
  const ratio = clamp((e.clientX - r.left) / r.width, 0, 1);
  t = ratio * total;
  ended = false;
  playing = true;
  enterScene(sceneAt(t));
  seekAudioTo(t);
  setPlayIcon();
  $('#endCard').classList.add('hide');
});

/* ---------- counters ---------- */
function runCounters(sceneEl) {
  sceneEl.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count) || 0;
    const dec = parseInt(el.dataset.dec || '0', 10);
    const dur = 1350;
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fa((target * e).toFixed(dec));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  });
}

/* ---------- background particles ---------- */
const cv = $('#bg');
const ctx = cv.getContext('2d');
let P = [];
function sizeBg() {
  cv.width = innerWidth * devicePixelRatio;
  cv.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const n = clamp(Math.floor(innerWidth * innerHeight / 24000), 40, 90);
  P = Array.from({ length: n }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: Math.random() * 2.1 + .6, vx: (Math.random() - .5) * .12,
    vy: -(Math.random() * .22 + .04), a: Math.random() * .5 + .14,
    tw: Math.random() * Math.PI * 2,
    c: Math.random() < .55 ? '62,224,255' : '61,245,176'
  }));
}
function drawBg(now) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of P) {
    p.tw += 0.012; p.x += p.vx + Math.sin(p.tw) * 0.12; p.y += p.vy;
    if (p.y < -12) { p.y = innerHeight + 12; p.x = Math.random() * innerWidth; }
    if (p.x < -12) p.x = innerWidth + 12; else if (p.x > innerWidth + 12) p.x = -12;
    const al = p.a * (0.7 + 0.3 * Math.sin(p.tw));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 7);
    ctx.fillStyle = 'rgba(' + p.c + ',' + al.toFixed(3) + ')';
    ctx.shadowColor = 'rgba(' + p.c + ',.8)';
    ctx.shadowBlur = 7;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
addEventListener('resize', sizeBg);
sizeBg();

function downloadSelf() {
  try {
    const html = '<!DOCTYPE html>\n' + (window.__PRISTINE__ || document.documentElement.outerHTML);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Z-NOX-Animation.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (e) { alert('دانلود در این مرورگر ممکن نیست؛ از لینک گیت‌هاب استفاده کنید.'); }
}

/* ---------- events ---------- */
$('#btnStart').addEventListener('click', () => { if (ready) start(); });
$('#btnDownload').addEventListener('click', downloadSelf);
$('#btnDownloadEnd').addEventListener('click', downloadSelf);
$('#btnPlay').addEventListener('click', togglePlay);
$('#btnPrev').addEventListener('click', () => gotoScene(Math.max(0, curScene - 1)));
$('#btnNext').addEventListener('click', () => gotoScene(Math.min(N - 1, curScene + 1)));
$('#btnReplay').addEventListener('click', restart);
$('#btnReplayAll').addEventListener('click', restart);
$('#btnMute').addEventListener('click', toggleMute);
$('#btnFs').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
});

addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); if (ready) togglePlay(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); if (ready) gotoScene(Math.min(N - 1, curScene + 1)); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); if (ready) gotoScene(Math.max(0, curScene - 1)); }
  else if (e.key === 'Home') { e.preventDefault(); if (ready) restart(); }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) { playing = false; try { audio.pause(); } catch (e) {} setPlayIcon(); }
});

/* ---------- go ---------- */
init();
requestAnimationFrame(frame);

/* hook for automated capture (video recording) */
window.__ZNOX__ = {
  get ready() { return ready; },
  get playing() { return playing; },
  get ended() { return ended; },
  get scene() { return curScene; },
  get time() { return t; },
  get total() { return total; },
  setDrive(m) { drive = m; },
  start() { start(); },
  timeline() {
    return Array.from({ length: N }, (_, i) => ({
      scene: i, start: sceneStart[i], dur: sceneDur[i], audio: SEGS[i] || null
    }));
  }
};
