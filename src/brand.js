/* =========================================================
   Z-NOX — logo & brand marks
   ========================================================= */
function logo(ctx, x, y, h, { color = C.ink, accent = C.accent, alpha = 1, lw = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  // hexagon mark with catalytic "reactor" node
  const r = h * .62;
  ctx.translate(x, y);
  ctx.strokeStyle = color; ctx.lineWidth = h * .075 * lw;
  hexPath(ctx, 0, 0, r, Math.PI / 6); ctx.stroke();
  hexPath(ctx, 0, 0, r * .52, Math.PI / 6);
  ctx.strokeStyle = accent; ctx.stroke();
  // photon ray
  ctx.strokeStyle = accent; ctx.lineWidth = h * .06 * lw;
  ctx.beginPath();
  ctx.moveTo(-r * 1.45, -r * 1.1);
  ctx.lineTo(-r * .78, -r * .58);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(-r * .62, -r * .4, h * .05, 0, 7); ctx.fillStyle = accent; ctx.fill();
  ctx.restore();
}

function wordmark(ctx, x, y, size, { fa = false, color = C.ink, alpha = 1, align = 'left', ls = 0 } = {}) {
  const str = fa ? 'زیناکس' : 'Z-NOX';
  txt(ctx, str, x, y, {
    size, weight: fa ? 700 : 700, color, align, alpha,
    family: fa ? 'Vaz' : 'Inter', ls: fa ? 0 : (ls || size * .16)
  });
}
