/* =========================================================
   Z-NOX — player shell, HUD, transitions, audio
   ========================================================= */
const canvas = document.getElementById('film');
const ctx = canvas.getContext('2d', { alpha: false });
const A = { img: {}, ready: false };

/* ---------- assets ---------- */
const IMAGES = [
  'hero-facade', 'plate-pollution', 'plate-macro', 'plate-rain',
  'plate-install', 'plate-night', 'plate-detail', 'plate-tower', 'plate-interior'
];

function loadImage(src) {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
}

async function boot() {
  await Promise.all([
    document.fonts.load('400 40px Vaz'), document.fonts.load('600 40px Vaz'),
    document.fonts.load('700 40px Vaz'), document.fonts.load('500 40px Inter'),
    document.fonts.load('700 40px Inter')
  ]);
  const imgs = await Promise.all(IMAGES.map(n => loadImage(`assets/img/${n}.jpg`)));
  IMAGES.forEach((n, i) => { if (imgs[i]) A.img[n] = imgs[i]; });
  A.ready = true;
  // audio
  const vo = new Audio('assets/vo/vo_full.mp3');
  vo.preload = 'auto';
  VO.audio = vo;
  window.__ready = true;
  document.getElementById('boot').classList.add('gone');
  if (AUTOPLAY) start();
  render(0);
}

/* ---------- audio ---------- */
const VO = { audio: null, base: 0, t0: 0, muted: false };

const params = new URLSearchParams(location.search);
const AUTOPLAY = params.has('autoplay');
const RENDER = params.has('render');   // headless render mode: no UI, no audio
if (RENDER) document.body.classList.add('export');
const LOGO_MODE = params.get('mode') === 'logo';
const EXPORT_SCALE = Number(params.get('scale') || 1);
if (RENDER && EXPORT_SCALE < 1) {
  canvas.width = Math.round(W * EXPORT_SCALE);
  canvas.height = Math.round(H * EXPORT_SCALE);
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
}

/* ---------- state ---------- */
const state = {
  t: 0, playing: false, last: 0, sync: true, hudTimer: 0, hudOn: true
};
const T = () => LOGO_MODE ? LOGO.dur : FILM.duration;

function start() {
  if (!A.ready) return;
  state.t = 0; state.playing = true; state.last = performance.now();
  VO.t0 = performance.now() / 1000;
  if (VO.audio && !RENDER) { VO.audio.currentTime = 0; if (!VO.muted) VO.audio.play().catch(() => { }); }
  requestAnimationFrame(loop);
}

function jumpTo(t) {
  state.t = clamp(t, 0, T() - .02);
  if (VO.audio) { VO.audio.currentTime = state.t; }
  VO.t0 = performance.now() / 1000 - state.t;
  updateUI();
}

window.__jump = t => { jumpTo(t); if (!state.playing) el('play').click(); };

/* ---------- playback loop ---------- */
function loop(now) {
  if (!state.playing) return;
  const dt = Math.min(.1, (now - state.last) / 1000) || 0;
  state.last = now;
  state.t += dt;
  if (state.t >= T()) {
    state.t = T() - .001;
    state.playing = false;
    showReplay();
  }
  render(state.t);
  updateUI();
  if (state.playing) requestAnimationFrame(loop);
}

/* ---------- render (used by player and by headless renderer) ---------- */
function render(t) {
  if (LOGO_MODE) {
    ctx.clearRect(0, 0, W, H);
    if (EXPORT_SCALE < 1) {
      // render the 1920×1080 composition, downsample in-page
      const buf = this.__buf || (this.__buf = document.createElement('canvas'));
      buf.width = W; buf.height = H;
      const bctx = buf.getContext('2d');
      bctx.clearRect(0, 0, W, H);
      logoScene(bctx, clamp(t, 0, LOGO.dur), null, A);
      grain(bctx, t, .3);
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      logoScene(ctx, clamp(t, 0, LOGO.dur), null, A);
      grain(ctx, t, .3);
    }
    return;
  }
  const { scene, i, local } = locate(t);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  const fn = SCENE_FN[scene.id];
  fn(ctx, local, scene, A);
  ctx.restore();

  // film-wide finish: grain + edge falloff
  grain(ctx, t, .35);

  // cross-dissolve between chapters (last .55s handled by overlapping fade in)
  const remain = scene.dur - local;
  if (remain < .55) {
    ctx.fillStyle = `rgba(8,9,12,${(1 - remain / .55) * .92})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (local < .45 && i > 0) {
    ctx.fillStyle = `rgba(8,9,12,${(1 - local / .45) * .75})`;
    ctx.fillRect(0, 0, W, H);
  }

  // ---- HUD: chapter progress marks
  if (!RENDER) drawHud(scene, i, local);
}

function drawHud(scene, i, local) {
  const a = state.hudOn ? 1 : 0;
  if (!a) return;
  ctx.save();
  ctx.globalAlpha = .9;
  // top-left brand (ltr corner)
  logo(ctx, 92, 78, 26, { alpha: .8 });
  txt(ctx, 'Z-NOX', 128, 86, { size: 20, weight: 700, family: 'Inter', align: 'left', ls: 3, alpha: .85 });
  txt(ctx, 'CATALOGUE 01', 218, 86, { size: 11, weight: 500, family: 'Inter', align: 'left', ls: 3, color: C.faint });

  // top-right chapter index
  const ch = String(i + 1).padStart(2, '0');
  txt(ctx, ch, W - 92, 92, { size: 26, weight: 700, family: 'Inter', align: 'right', color: C.ink });
  txt(ctx, '/ ' + String(SCENES.length).padStart(2, '0'), W - 132, 92, { size: 13, weight: 500, family: 'Inter', align: 'right', color: C.faint });
  txt(ctx, scene.en, W - 92, 118, { size: 11, weight: 500, family: 'Inter', align: 'right', ls: 3, color: C.accent, alpha: .8 });
  txt(ctx, scene.fa, W - 92, 146, { size: 16, weight: 400, align: 'right', color: C.faint });

  // bottom progress segments
  const total = T();
  const y = H - 46, pad = 92, gap = 6;
  const wAll = W - pad * 2;
  const gapTotal = gap * (SCENES.length - 1);
  const avail = wAll - gapTotal;
  let x = W - pad;
  SCENES.forEach((s, k) => {
    const sw = avail * (s.dur / total);
    const played = clamp((state.t - s.start) / s.dur);
    ctx.fillStyle = 'rgba(242,239,232,.13)';
    ctx.fillRect(x - sw, y, sw, 2);
    ctx.fillStyle = k === i ? C.accent : 'rgba(242,239,232,.45)';
    ctx.fillRect(x - sw, y, sw * played, 2);
    x -= sw + gap;
  });

  // timecode
  const tc = (v) => {
    const m = Math.floor(v / 60), s = Math.floor(v % 60), f = Math.floor((v % 1) * 30);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };
  txt(ctx, tc(state.t), pad, y + 26, { size: 12, weight: 500, family: 'Inter', align: 'left', ls: 2, color: C.faint });
  txt(ctx, tc(total), W - pad, y + 26, { size: 12, weight: 500, family: 'Inter', align: 'right', ls: 2, color: C.faint });
  ctx.restore();
}

/* ---------- UI wiring ---------- */
const el = id => document.getElementById(id);
const fmtT = v => `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(Math.floor(v % 60)).padStart(2, '0')}`;

const ICON = {
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right:-2px"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  replay: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>'
};

function updateUI() {
  if (RENDER) return;
  const { scene, i, local } = locate(state.t);
  const st = (!state.playing && state.t >= T() - .02) ? 'replay' : (state.playing ? 'pause' : 'play');
  const pb = el('play');
  if (pb.dataset.state !== st) { pb.dataset.state = st; pb.innerHTML = ICON[st]; }
  const p = state.t / T();
  el('seek-fill').style.width = (p * 100) + '%';
  el('seek-knob').style.left = (p * 100) + '%';
  el('time').textContent = fmtT(state.t);
  document.querySelectorAll('.chap').forEach((n, k) => n.classList.toggle('on', k === i));
  el('chapNow').textContent = `${String(i + 1).padStart(2, '0')} — ${scene.fa}`;
}
window.__updateUI = updateUI;

function showReplay() {
  el('overlay').classList.add('show');
}

el('play').addEventListener('click', () => {
  if (state.playing) { state.playing = false; VO.audio && VO.audio.pause(); updateUI(); }
  else {
    if (state.t >= T() - .05) state.t = 0;
    state.playing = true; state.last = performance.now();
    VO.t0 = performance.now() / 1000 - state.t;
    if (VO.audio && !VO.muted) { VO.audio.currentTime = state.t; VO.audio.play().catch(() => { }); }
    el('overlay').classList.remove('show');
    requestAnimationFrame(loop);
    updateUI();
  }
});

el('mute').addEventListener('click', () => {
  VO.muted = !VO.muted;
  if (VO.audio) VO.audio.muted = VO.muted;
  el('mute').classList.toggle('off', VO.muted);
});

document.querySelectorAll('.chap').forEach(n => {
  n.addEventListener('click', () => {
    jumpTo(parseFloat(n.dataset.t));
    if (!state.playing) el('play').click();
  });
});

el('seek').addEventListener('pointerdown', e => {
  const r = el('seek').getBoundingClientRect();
  const go = ev => {
    const p = clamp((ev.clientX - r.left) / r.width);
    jumpTo(p * T());
  };
  go(e);
  const mv = ev => go(ev);
  const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
});

// timeline tick marks
(function buildChapters() {
  const total = T();
  document.querySelectorAll('.chap').forEach(n => {
    const s = SCENES[parseInt(n.dataset.i)];
    n.style.width = (s.dur / total * 100) + '%';
  });
})();

window.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); el('play').click(); }
  if (e.code === 'ArrowRight') jumpTo(state.t + 5);
  if (e.code === 'ArrowLeft') jumpTo(state.t - 5);
  if (e.key === 'f' || e.key === 'F') {
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  }
});

/* ---------- headless render API ---------- */
window.__setTime = t => { render(t); };
window.__film = FILM;
window.__scenes = SCENES;

/* ---------- go ---------- */
if (RENDER) {
  boot().then(() => {
    const t0 = parseFloat(params.get('t') || '0');
    render(t0);
    window.__renderReady = true;
  });
} else {
  boot();
  if (AUTOPLAY) start();
}
