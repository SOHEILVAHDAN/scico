/* =========================================================
   Z-NOX — motion engine utilities
   Deterministic, time-driven renderer (t in seconds)
   ========================================================= */
const W = 1920, H = 1080;
const C = {
  bg: '#08090C',
  bg2: '#0E1014',
  ink: '#F2EFE8',
  dim: 'rgba(242,239,232,0.58)',
  faint: 'rgba(242,239,232,0.30)',
  line: 'rgba(242,239,232,0.16)',
  accent: '#8E7BFF',
  accent2: '#C9BDFF',
  glow: '#6C4BFF',
  cyan: '#7FD8FF',
  warm: '#FFD9A8',
  grime: '#6b6558',
  ok: '#9BE8B4'
};

/* ---------- math ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (t, a, b) => clamp((t - a) / (b - a));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;
const smooth = t => t * t * (3 - 2 * t);
const bump = (t, a, b, fin = .6, fout = .6) =>
  Math.min(inv(t, a, a + fin), 1 - inv(t, b - fout, b));
const ping = (t, a, b) => Math.sin(inv(t, a, b) * Math.PI);

function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const fmtFa = n => String(n);   /* Latin digits: best glyph support in Vazirmatn */

/* ---------- drawing primitives ---------- */
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hexPath(ctx, cx, cy, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = rot + i * Math.PI / 3;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

/* Persian text: RTL, right aligned by default */
function txt(ctx, str, x, y, {
  size = 32, weight = 400, color = C.ink, align = 'right',
  dir = 'rtl', family = 'Vaz', ls = 0, alpha = 1, baseline = 'alphabetic'
} = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.direction = dir;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${family}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = ls + 'px';
  ctx.fillText(str, x, y);
  ctx.restore();
}

function measure(ctx, str, size = 32, weight = 400, family = 'Vaz', ls = 0) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${family}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = ls + 'px';
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}

function wrap(ctx, str, maxW, size, weight, family = 'Vaz', ls = 0) {
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (measure(ctx, test, size, weight, family, ls) > maxW && line) {
      lines.push(line); line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function para(ctx, str, x, y, maxW, {
  size = 30, weight = 300, color = C.dim, lh = 1.85, align = 'right', family = 'Vaz', ls = 0, alpha = 1
} = {}) {
  const lines = wrap(ctx, str, maxW, size, weight, family, ls);
  lines.forEach((l, i) => txt(ctx, l, x, y + i * size * lh, { size, weight, color, align, family, ls, alpha }));
  return y + lines.length * size * lh;
}

/* image cover draw with ken burns */
function drawCover(ctx, img, x, y, w, h, zoom = 1, panX = 0, panY = 0) {
  if (!img) return;
  const s = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * s, dh = img.height * s;
  const dx = x + (w - dw) / 2 + panX;
  const dy = y + (h - dh) / 2 + panY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function grade(ctx, x, y, w, h, {
  top = 'rgba(8,9,12,0.85)', bot = 'rgba(8,9,12,0.9)', mid = 'rgba(8,9,12,0.15)', tint = 'rgba(36,26,74,0.35)'
} = {}) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, top); g.addColorStop(.5, mid); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = tint; ctx.fillRect(x, y, w, h);
}

function vignette(ctx, strength = .55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .28, W / 2, H / 2, H * .95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

let GRAIN = null;
function makeGrain() {
  const tiles = [];
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const d = g.createImageData(256, 256);
    const rnd = mulberry(1200 + k * 77);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = rnd() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 18;
    }
    g.putImageData(d, 0, 0);
    tiles.push(c);
  }
  return tiles;
}
function grain(ctx, t, alpha = .5) {
  if (!GRAIN) GRAIN = makeGrain();
  const i = Math.floor(t * 24) % 4;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  const p = ctx.createPattern(GRAIN[i], 'repeat');
  ctx.fillStyle = p;
  ctx.translate((t * 37) % 256, (t * 61) % 256);
  ctx.fillRect(-256, -256, W + 512, H + 512);
  ctx.restore();
}

/* thin technical rule with a leading dot */
function tick(ctx, x, y, w, alpha = 1, color = C.faint) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, 1);
  ctx.beginPath(); ctx.arc(x + w, y + .5, 2.6, 0, 7); ctx.fill();
  ctx.restore();
}

function arrow(ctx, x1, y1, x2, y2, {
  color = C.faint, width = 1.4, head = 9, alpha = 1, dash = null
} = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  const a = Math.atan2(y2 - y1, x2 - x1);
  const ex = x2 - Math.cos(a) * head * .8, ey = y2 - Math.sin(a) * head * .8;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - .38) * head, y2 - Math.sin(a - .38) * head);
  ctx.lineTo(x2 - Math.cos(a + .38) * head, y2 - Math.sin(a + .38) * head);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* dimension line with label */
function dim(ctx, x1, y1, x2, y2, label, { color = C.faint, size = 24, alpha = 1, vertical = false, off = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const cap = 9;
  if (vertical) {
    [y1, y2].forEach(y => { ctx.beginPath(); ctx.moveTo(x1 - cap, y); ctx.lineTo(x1 + cap, y); ctx.stroke(); });
  } else {
    [x1, x2].forEach(x => { ctx.beginPath(); ctx.moveTo(x, y1 - cap); ctx.lineTo(x, y1 + cap); ctx.stroke(); });
  }
  if (label) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    ctx.font = `500 ${size}px Inter`;
    const w = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(8,9,12,.85)';
    ctx.fillRect(mx - w / 2 - 10, my - size * .72 + off, w + 20, size * 1.35);
    ctx.fillStyle = color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, mx, my + off);
  }
  ctx.restore();
}

/* cinematic lower third / chapter caption
   lays out bottom-up from `bottom`, so nothing can overflow the frame */
function caption(ctx, t, {
  tag = '', title = '', sub = '', bottom = H - 112, x = W - 132, maxW = 900,
  accent = C.accent, size = 60, inAt = 0, outAt = 999
} = {}) {
  const a = bump(t, inAt, outAt, .8, .7);
  if (a <= .002) return;
  const rise = (1 - easeOut(clamp((t - inAt) / .9))) * 26;

  const tLines = title ? wrap(ctx, title, maxW, size, 700) : [];
  const sLines = sub ? wrap(ctx, sub, maxW, 27, 300) : [];
  const tLH = size * 1.32, sLH = 27 * 1.78;
  const gap = title && sub ? 16 : 0;
  const tagH = tag ? 52 : 0;
  const total = tagH + tLines.length * tLH + gap + sLines.length * sLH;

  const topY = bottom - total;      // top edge of the block
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(0, rise);

  let y = topY;
  if (tag) {
    const tw = measure(ctx, tag, 22, 600, 'Inter', 5);
    tick(ctx, x - tw - 26, y + 18, 26, 1, accent);
    txt(ctx, tag, x, y + 26, { size: 22, weight: 600, color: accent, family: 'Inter', ls: 5 });
    y += tagH;
  }
  tLines.forEach((l, i) => txt(ctx, l, x, y + size * .86 + i * tLH, { size, weight: 700, color: C.ink }));
  y += tLines.length * tLH + gap;
  sLines.forEach((l, i) => txt(ctx, l, x, y + 22 + i * sLH, { size: 27, weight: 300, color: C.dim }));
  ctx.restore();
}

/* small chip */
function chip(ctx, label, x, y, { alpha = 1, color = C.ink, accent = false, size = 22 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const w = measure(ctx, label, size, 500) + 38;
  rrect(ctx, x - w, y - size - 12, w, size + 24, 999);
  ctx.fillStyle = accent ? 'rgba(142,123,255,.14)' : 'rgba(242,239,232,.06)';
  ctx.fill();
  ctx.strokeStyle = accent ? 'rgba(142,123,255,.4)' : 'rgba(242,239,232,.14)';
  ctx.lineWidth = 1; ctx.stroke();
  txt(ctx, label, x - 19, y + 2, { size, weight: 500, color: accent ? C.accent2 : color });
  ctx.restore();
  return w;
}
