/* =========================================================
   Z-NOX — vector scene objects
   (panels, isometrics, droplets, particles, particles systems)
   ========================================================= */

/* a ceramic panel face with subtle mineral texture */
function panelFace(ctx, x, y, w, h, {
  tone = 0, light = 1, tex = true, r = 2, alpha = 1, gloss = 0
} = {}) {
  const base = ['#cfccc6', '#b9b6b0', '#8d8d90', '#a89c8e', '#4a4b4f', '#e6e1d8'][tone % 6] || '#b9b6b0';
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(x, y, x + w * .35, y + h);
  g.addColorStop(0, shade(base, 1.1 * light));
  g.addColorStop(.45, shade(base, 1.0 * light));
  g.addColorStop(1, shade(base, .78 * light));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  if (tex) {
    // mineral speckle
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const rnd = mulberry(Math.floor(w * 7 + h * 13 + tone * 91));
    for (let i = 0; i < 260; i++) {
      const px = x + rnd() * w, py = y + rnd() * h;
      const s = .5 + rnd() * 1.8;
      ctx.fillStyle = rnd() > .5 ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.10)';
      ctx.fillRect(px, py, s, s);
    }
    // soft cloudy variation
    for (let i = 0; i < 6; i++) {
      const cx = x + rnd() * w, cy = y + rnd() * h, rr = 40 + rnd() * 120;
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      rg.addColorStop(0, `rgba(255,255,255,${.03 + rnd() * .04})`);
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  if (gloss > 0) {
    const gg = ctx.createLinearGradient(x, y, x + w, y + h);
    gg.addColorStop(0, `rgba(255,255,255,${.10 * gloss})`);
    gg.addColorStop(.5, `rgba(255,255,255,0)`);
    gg.addColorStop(1, `rgba(255,255,255,${.06 * gloss})`);
    ctx.fillStyle = gg; ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
  return base;
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.min(255, r * k); g = Math.min(255, g * k); b = Math.min(255, b * k);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

/* panel with real thickness, drawn in a light axonometric */
function isoPanel(ctx, cx, cy, w, h, t, { tone = 1, alpha = 1, flip = 1, glow = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  // front face (slightly rotated)
  ctx.translate(cx, cy);
  ctx.rotate(-0.045 * flip);
  // shadow
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30;
  panelFace(ctx, -w / 2, -h / 2, w, h, { tone });
  ctx.shadowColor = 'transparent';
  // edge (thickness)
  const tx = w / 2, ty = -h / 2;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx + t * .9, ty - t * .55);
  ctx.lineTo(tx + t * .9, ty + h - t * .55);
  ctx.lineTo(tx, ty + h);
  ctx.closePath();
  const ge = ctx.createLinearGradient(tx, 0, tx + t, 0);
  ge.addColorStop(0, '#8e8b86'); ge.addColorStop(1, '#5c5a57');
  ctx.fillStyle = ge; ctx.fill();
  // top edge
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(-w / 2 + t * .9, -h / 2 - t * .55);
  ctx.lineTo(tx + t * .9, ty - t * .55);
  ctx.lineTo(tx, ty);
  ctx.closePath();
  ctx.fillStyle = '#d8d5cf'; ctx.fill();
  // photocatalytic sheen
  if (glow > 0) {
    const gr = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    gr.addColorStop(0, `rgba(142,123,255,${.28 * glow})`);
    gr.addColorStop(.6, `rgba(127,216,255,${.10 * glow})`);
    gr.addColorStop(1, 'rgba(142,123,255,0)');
    ctx.fillStyle = gr; ctx.fillRect(-w / 2, -h / 2, w, h);
  }
  ctx.restore();
}

/* thin isometric slab layers */
function isoLayer(ctx, cx, cy, w, h, t, color, { alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  // top face
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2);
  ctx.lineTo(cx - w / 2 + 26, cy - h / 2 - 15);
  ctx.lineTo(cx + w / 2 + 26, cy - h / 2 - 15);
  ctx.lineTo(cx + w / 2, cy - h / 2);
  ctx.closePath(); ctx.fill();
  // right side
  ctx.beginPath();
  ctx.moveTo(cx + w / 2, cy - h / 2);
  ctx.lineTo(cx + w / 2 + 26, cy - h / 2 - 15);
  ctx.lineTo(cx + w / 2 + 26, cy + h / 2 - 15);
  ctx.lineTo(cx + w / 2, cy + h / 2);
  ctx.closePath();
  ctx.globalAlpha *= .62; ctx.fill();
  ctx.restore();
}

/* water droplet with contact angle; deg 5 = superhydrophilic flat dome, 150 = sphere */
function droplet(ctx, cx, baseY, vol, deg, { color = 'rgba(170,215,255,.55)', edge = 'rgba(220,240,255,.9)', alpha = 1, ripples = 0 } = {}) {
  const th = deg * Math.PI / 180;
  const r = Math.pow(vol, 1 / 3) * 26;
  // spherical cap geometry
  const hCap = r * (1 - Math.cos(th));
  const baseR = r * Math.sin(th);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  if (deg > 100) {
    // overhanging sphere-ish
    ctx.ellipse(cx, baseY - baseR * .95, baseR, baseR * 1.02, 0, 0, Math.PI * 2);
  } else {
    ctx.moveTo(cx - baseR, baseY);
    ctx.bezierCurveTo(
      cx - baseR * .92, baseY - hCap * 1.28,
      cx + baseR * .92, baseY - hCap * 1.28,
      cx + baseR, baseY
    );
    ctx.closePath();
  }
  const g = ctx.createRadialGradient(cx - baseR * .3, baseY - hCap * .9, 1, cx, baseY, Math.max(baseR * 1.5, 8));
  g.addColorStop(0, 'rgba(240,250,255,.85)');
  g.addColorStop(.35, color);
  g.addColorStop(1, 'rgba(120,175,225,.35)');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = 1.1; ctx.stroke();
  // specular
  ctx.beginPath();
  ctx.ellipse(cx - baseR * .28, baseY - hCap * .82, Math.max(1.5, baseR * .16), Math.max(1, baseR * .1), -.5, 0, 7);
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill();
  if (ripples > 0) {
    for (let i = 0; i < 3; i++) {
      const p = (ripples + i / 3) % 1;
      ctx.beginPath();
      ctx.ellipse(cx, baseY, baseR * (1 + p * 1.6), baseR * (1 + p * 1.6) * .18, 0, 0, 7);
      ctx.strokeStyle = `rgba(200,235,255,${.35 * (1 - p)})`;
      ctx.lineWidth = 1; ctx.stroke();
    }
  }
  ctx.restore();
}

/* generic molecule-ish particle */
function particle(ctx, x, y, r, color, { alpha = 1, glow = 0, label = '' } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (glow) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4.2);
    g.addColorStop(0, hexA(color, .55 * glow));
    g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, 7); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
  ctx.fillStyle = color; ctx.fill();
  if (label) {
    ctx.fillStyle = C.ink; ctx.font = `600 ${r * 1.25}px Inter`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 1);
  }
  ctx.restore();
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* drifting soot/dust field */
function soot(ctx, t, { n = 90, alpha = .5, area = [0, 0, W, H], speed = 1 } = {}) {
  const rnd = mulberry(99);
  const [x0, y0, w, h] = area;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const sx = rnd(), sy = rnd(), s = .6 + rnd() * 2.4, sp = .3 + rnd();
    const y = y0 + ((sy * h + t * 22 * sp * speed) % h);
    const x = x0 + (sx * w + Math.sin(t * .5 * sp + i) * 26);
    ctx.fillStyle = `rgba(120,112,98,${alpha * (.25 + rnd() * .5)})`;
    ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
  }
  ctx.restore();
}

/* rising air / vapor motes */
function motes(ctx, t, { n = 60, alpha = .5, area = [0, 0, W, H], color = '255,255,255' } = {}) {
  const rnd = mulberry(321);
  const [x0, y0, w, h] = area;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const sx = rnd(), sy = rnd(), s = 1 + rnd() * 2.6, sp = .25 + rnd();
    const y = y0 + h - ((sy * h + t * 26 * sp) % h);
    const x = x0 + sx * w + Math.sin(t * .6 + i * 1.7) * 20;
    ctx.fillStyle = `rgba(${color},${alpha * (.2 + rnd() * .45)})`;
    ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
  }
  ctx.restore();
}

/* technical grid backdrop */
function grid(ctx, { step = 80, color = 'rgba(242,239,232,.05)', alpha = 1, y0 = 0 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = (W / 2) % step; x < W; x += step) { ctx.moveTo(x, y0); ctx.lineTo(x, H); }
  for (let y = y0 + ((H / 2) % step); y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.restore();
}

/* radial glow */
function glowAt(ctx, x, y, r, color, a = .5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, a));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}

/* image with cinematic grade + slow ken burns */
function bgShot(ctx, img, t, {
  zoom = [1.02, 1.1], pan = [0, 0], dark = .45, tint = 'rgba(30,22,60,.3)', alpha = 1, out = 0
} = {}) {
  if (!img) { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); return; }
  const p = clamp(t / 24, 0, 1);
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawCover(ctx, img, 0, 0, W, H, lerp(zoom[0], zoom[1], p), pan[0] * p, pan[1] * p);
  ctx.fillStyle = `rgba(8,9,12,${dark})`; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H);
  if (out) { ctx.fillStyle = `rgba(8,9,12,${out})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
