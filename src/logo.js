/* =========================================================
   Z-NOX — motion logo (5.5s identity sting)
   ========================================================= */
const LOGO = { dur: 5.6 };

function logoScene(ctx, t, S, A) {
  const cx = W / 2, cy = H * .42;

  // ---------- ambience ----------
  const bgGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, H * 1.1);
  bgGrad.addColorStop(0, '#0d1014');
  bgGrad.addColorStop(1, '#050608');
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

  // slow rotating tech rings
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = .10;
  for (let k = 0; k < 2; k++) {
    ctx.save(); ctx.rotate(t * (k ? -.05 : .07));
    ctx.strokeStyle = 'rgba(200,210,220,.5)'; ctx.lineWidth = 1;
    ctx.setLineDash(k ? [2, 14] : [26, 18]);
    ctx.beginPath(); ctx.arc(0, 0, 300 + k * 90, 0, 7); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // green aura builds then settles
  const aura = easeOut(inv(t, 1.3, 3.2)) * (1 - .35 * inv(t, 4.2, 5.4));
  glowAt(ctx, cx, cy + 30, 560, GREEN, .10 + .10 * aura + .03 * Math.sin(t * 3));

  // ---------- the mark ----------
  const hexProg = easeOut(inv(t, .25, 1.15));
  const arcProg = easeOut(inv(t, .55, 1.85));
  const bladeProg = easeOut(inv(t, 1.5, 2.35));
  const zProg = ease(inv(t, 2.35, 3.55));
  const glowAmt = easeOut(inv(t, 3.1, 4.0)) * (1 - .3 * inv(t, 4.4, 5.4));
  const breathe = .5 + .5 * Math.sin((t - 3.4) * 2.2);

  const scaleIn = lerp(.90, 1, easeOut(inv(t, 0, 1.6)));

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scaleIn, scaleIn);
  drawMark(ctx, 0, 0, 560, {
    zProg, bladeProg, arcProg, hexProg,
    glow: clamp(glowAmt * (.8 + .2 * breathe)),
    t, alpha: 1
  });
  ctx.restore();

  // ---------- flash on completion ----------
  const fl = bump(t, 3.45, 4.05, .18, .5);
  if (fl > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glowAt(ctx, cx, cy + 40, 420, '#ffffff', .22 * fl);
    glowAt(ctx, cx, cy + 90, 340, GREEN, .30 * fl);
    ctx.restore();
  }

  // ---------- wordmark: Z-NOX + زیناکس ----------
  const wmA = easeOut(inv(t, 3.7, 4.6));
  if (wmA > 0) {
    const rise = (1 - easeOut(inv(t, 3.7, 4.7))) * 22;
    ctx.save();
    ctx.globalAlpha = wmA;
    ctx.translate(0, rise);

    const wmSize = 86;
    const wmW = measure(ctx, 'Z-NOX', wmSize, 700, 'Inter', 16);
    // draw as clipped reveal right→left
    ctx.save();
    ctx.beginPath();
    ctx.rect(W / 2 - wmW / 2 - 10, cy + 250, wmW * easeOut(inv(t, 3.75, 4.75)) + 20, 160);
    ctx.clip();
    txt(ctx, 'Z-NOX', W / 2, cy + 330, {
      size: wmSize, weight: 700, family: 'Inter', align: 'center', ls: 16, color: C.ink
    });
    ctx.restore();

    const faA = easeOut(inv(t, 4.25, 5.0));
    txt(ctx, 'فتوکاتالیست نانوساختار', W / 2, cy + 390, {
      size: 26, weight: 400, align: 'center', color: 'rgba(242,239,232,.62)', alpha: faA, ls: 1
    });
    const enA = easeOut(inv(t, 4.5, 5.2));
    txt(ctx, 'PHOTOCATALYTIC CERAMIC SURFACE', W / 2, cy + 434, {
      size: 13, weight: 500, family: 'Inter', align: 'center', ls: 6,
      color: 'rgba(140,232,31,.85)', alpha: enA
    });
    ctx.restore();
  }

  // ---------- particles converging ----------
  const pn = 34;
  for (let i = 0; i < pn; i++) {
    const seed = mulberry(i * 91 + 7);
    const a0 = seed() * Math.PI * 2, r0 = 420 + seed() * 420;
    const p = ((t * .32 + seed()) % 1);
    const inA = inv(t, .2, 1.0) * (1 - inv(t, 3.4, 4.0));
    if (inA <= 0) continue;
    const rr = lerp(r0, 40, ease(p));
    const px = cx + Math.cos(a0 + t * .2) * rr;
    const py = cy + Math.sin(a0 + t * .2) * rr * .82;
    ctx.save();
    ctx.globalAlpha = inA * (.25 + .55 * (1 - p));
    ctx.beginPath(); ctx.arc(px, py, 1.2 + seed() * 1.8, 0, 7);
    ctx.fillStyle = seed() > .6 ? GREEN : 'rgba(220,230,240,.9)';
    ctx.fill();
    ctx.restore();
  }

  // ---------- exit: darken slightly at the very end ----------
  const out = inv(t, LOGO.dur - .5, LOGO.dur);
  if (out > 0) { ctx.fillStyle = `rgba(5,6,8,${out * .8})`; ctx.fillRect(0, 0, W, H); }
  vignette(ctx, .58);
}
