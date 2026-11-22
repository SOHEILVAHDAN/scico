/* =========================================================
   Z-NOX — official mark (vector rebuild of the brand logo)
   Design space 1000 × 1000; every part is animatable.
   ========================================================= */
const MARK = {
  // hexagon tile (the "material" plate behind the Z)
  hex: [500, 490, 398],
  // brushed-steel Z, drawn as a stroked centre-line
  zPath: 'M286 288 H596 C652 288 680 320 664 366 L330 656 H664',
  zStroke: 112,
  // the green catalytic blade: bottom bar + diagonal
  bladeBot: 'M198 706 H604',
  bladeDiag: 'M716 262 L336 648',
  bladeStroke: 66,
  // orbital arc with a photon head
  arc: [500, 492, 468],
  arcStart: -1.05,
  arcEnd: 1.75,
  // titanium hexagon
  hex2: [500, 500, 196]
};

const GREEN = '#8CE81F';
const GREEN_HOT = '#C6FF62';
const STEEL_HI = '#FFFFFF';
const STEEL_MID = '#B9BEC4';
const STEEL_LO = '#6C7178';

/* helpers ------------------------------------------------- */
function arcPath(ctx, cx, cy, r, a0, a1) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a1, a1 < a0);
}

function steelGrad(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#FFFFFF');
  g.addColorStop(.18, '#E6E9EC');
  g.addColorStop(.42, '#A8AEB5');
  g.addColorStop(.58, '#D6DADE');
  g.addColorStop(.78, '#7E848B');
  g.addColorStop(1, '#C9CED3');
  return g;
}

function steelFill(ctx, bb) {
  const g = steelGrad(ctx, bb.x, bb.y, bb.x + bb.w, bb.y + bb.h);
  // brushed micro-lines
  return g;
}

function greenGrad(ctx, x0, y0, x1, y1, hot = 0) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, hot ? GREEN_HOT : '#B8FF52');
  g.addColorStop(.35, GREEN);
  g.addColorStop(1, '#3FA10A');
  return g;
}

/* the Z glyph: brushed-steel gradient + edge light, revealed top→bottom */
function drawSteelZ(ctx, progress = 1, { alpha = 1, glow = 0 } = {}) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = 'butt'; ctx.lineJoin = 'round'; ctx.miterLimit = 10;

  // reveal wipe
  ctx.beginPath();
  ctx.rect(-200, -200, 1400, lerp(120, 1000, clamp(progress)));
  ctx.clip();

  const p = new Path2D(MARK.zPath);
  ctx.lineWidth = MARK.zStroke;

  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = `rgba(140,232,31,${.5 * glow})`;
    ctx.shadowBlur = 50 * glow;
    ctx.strokeStyle = '#aab0b6';
    ctx.stroke(p);
    ctx.restore();
  }

  // steel body
  ctx.strokeStyle = steelGrad(ctx, 240, 250, 780, 620);
  ctx.stroke(p);


  // darker base edge → dimension
  ctx.save();
  ctx.lineWidth = MARK.zStroke;
  ctx.strokeStyle = 'rgba(58,63,70,.55)';
  ctx.translate(0, 7);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.stroke(p);
  ctx.restore();

  // specular sheen band
  ctx.save();
  ctx.lineWidth = MARK.zStroke + 2;
  const sg = ctx.createLinearGradient(0, -120, 0, 60);
  ctx.restore();

  // crisp top highlight along the upper edge
  ctx.save();
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(255,255,255,.65)';
  ctx.translate(0, -MARK.zStroke / 2 + 4);
  ctx.stroke(p);
  ctx.restore();

  ctx.restore();
}

/* full mark */
function drawMark(ctx, cx, cy, size, o = {}) {
  const s = size / 1000;
  const {
    alpha = 1, zProg = 1, bladeProg = 1, hexProg = 1, arcProg = 1,
    glow = 0, t = 0, showHex = true
  } = o;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);

  // ---------- outer hexagon tile ----------
  if (showHex && hexProg > 0) {
    ctx.save();
    ctx.globalAlpha *= hexProg;
    ctx.strokeStyle = 'rgba(198,206,214,.30)';
    ctx.lineWidth = 7;
    hexPath(ctx, MARK.hex[0], MARK.hex[1], MARK.hex[2], Math.PI / 6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.10)';
    ctx.lineWidth = 2;
    hexPath(ctx, MARK.hex[0], MARK.hex[1], MARK.hex[2] - 16, Math.PI / 6);
    ctx.stroke();
    ctx.restore();
  }

  // ---------- orbital arc + photon head ----------
  if (arcProg > 0) {
    ctx.save();
    const [ax, ay, ar] = MARK.arc;
    const a1 = lerp(MARK.arcStart, MARK.arcEnd, clamp(arcProg));
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 5;
    ctx.shadowColor = 'rgba(140,232,31,.8)';
    ctx.shadowBlur = 16 + 20 * glow;
    arcPath(ctx, ax, ay, ar, MARK.arcStart, a1);
    ctx.stroke();
    if (arcProg > .96) {
      const hx = ax + Math.cos(MARK.arcEnd) * ar, hy = ay + Math.sin(MARK.arcEnd) * ar;
      ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 7);
      ctx.fillStyle = '#F2FFE0'; ctx.fill();
      glowAt(ctx, hx, hy, 46, GREEN, .55 + .25 * Math.sin(t * 4));
    }
    ctx.restore();
  }

  // ---------- inner titanium hexagon ----------
  if (hexProg > 0) {
    ctx.save();
    ctx.globalAlpha *= hexProg;
    ctx.strokeStyle = 'rgba(216,222,228,.55)';
    ctx.lineWidth = 5;
    hexPath(ctx, MARK.hex2[0], MARK.hex2[1], MARK.hex2[2], Math.PI / 6);
    ctx.stroke();
    ctx.restore();
  }

  // ---------- Z ----------
  if (zProg > 0) drawSteelZ(ctx, zProg, { glow });

  // ---------- green catalytic blade (over the Z's diagonal) ----------
  if (bladeProg > 0) {
    ctx.save();
    ctx.globalAlpha *= bladeProg;
    ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    ctx.strokeStyle = greenGrad(ctx, 240, 720, 760, 380, glow > .5 ? 1 : 0);
    ctx.shadowColor = 'rgba(140,232,31,.9)';
    ctx.shadowBlur = 18 + 26 * glow;
    ctx.lineWidth = MARK.bladeStroke;
    ctx.stroke(new Path2D(MARK.bladeBot));
    ctx.stroke(new Path2D(MARK.bladeDiag));
    // bright core
    ctx.shadowBlur = 0;
    ctx.lineWidth = MARK.bladeStroke * .34;
    ctx.strokeStyle = 'rgba(240,255,210,.55)';
    ctx.stroke(new Path2D(MARK.bladeBot));
    ctx.stroke(new Path2D(MARK.bladeDiag));
    ctx.restore();
  }

  ctx.restore();
}

/* lockup: mark + NOX wordmark + Z-NOX line */
function drawLockup(ctx, cx, cy, w, { alpha = 1, noxAlpha = 1, strokeProg = 1, t = 0, glow = 0, line2 = 1 } = {}) {
  // w = total width of the lockup
  const markW = w * .36;
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawMark(ctx, cx - w / 2 + markW / 2, cy, markW, { arcProg: 1, zProg: 1, bladeProg: 1, hexProg: 1, t, glow });

  // NOX
  if (noxAlpha > 0) {
    const scale = (w * .60) / 396;
    ctx.save();
    ctx.globalAlpha *= noxAlpha;
    ctx.translate(cx - w / 2 + markW + w * .03, cy - 132 * scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = steelGrad(ctx, 64, 133, 460, 252);
    ctx.fill(new Path2D(NOX_PATH));
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.stroke(new Path2D(NOX_PATH));
    ctx.restore();
  }
  ctx.restore();
}

/* glyph outlines for the Z-NOX wordmark line (drawn directly, sharp) */
function drawWordmark(ctx, x, y, size, { color = C.ink, alpha = 1, align = 'left', ls = .16 } = {}) {
  txt(ctx, 'Z-NOX', x, y, { size, weight: 700, family: 'Inter', align, ls: size * ls, alpha, color });
}
