/* =========================================================
   Z-NOX — motion logo, v2 (5.6s)
   A cinematic identity sting: light → mark → name.
   Beats: rays · hex plate · Z build · blade ignition · wordmark
   ========================================================= */
const LOGO = { dur: 5.6 };

function logoScene(ctx, t, S, A) {
  const cx = W / 2, cy = 352;   /* mark centre — leaves room for the lockup below */

  /* ---------------- backdrop ---------------- */
  const bg = ctx.createRadialGradient(cx, cy - 40, 30, cx, cy + 120, H * 1.25);
  bg.addColorStop(0, '#101418');
  bg.addColorStop(.55, '#080a0d');
  bg.addColorStop(1, '#040507');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  /* invisible-light rays sweeping from the upper right */
  const rayA = bump(t, .15, 3.9, .9, 1.5) * .55;
  if (rayA > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(cx + 120, cy - 190);
    for (let i = 0; i < 7; i++) {
      const ang = -2.35 + i * .10 + Math.sin(t * .5 + i) * .012;
      const len = 900 + i * 90;
      const wdt = 26 + (i % 3) * 22;
      const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len);
      g.addColorStop(0, `rgba(255,238,205,${.16 * rayA})`);
      g.addColorStop(.6, `rgba(255,225,175,${.05 * rayA})`);
      g.addColorStop(1, 'rgba(255,220,160,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang - .05) * len, Math.sin(ang - .05) * len);
      ctx.lineTo(Math.cos(ang + .05) * len + wdt * .3, Math.sin(ang + .05) * len);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  /* thin technical grid rings that settle as the mark lands */
  const ringA = easeOut(inv(t, 0, 1.0)) * (1 - .55 * inv(t, 3.4, 5.0));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = .085 * ringA;
  for (let k = 0; k < 3; k++) {
    ctx.save(); ctx.rotate(t * (k % 2 ? -.05 : .07) + k);
    ctx.strokeStyle = 'rgba(210,220,230,.6)'; ctx.lineWidth = 1;
    ctx.setLineDash(k === 1 ? [2, 12] : [30, 22]);
    ctx.beginPath(); ctx.arc(0, 0, 286 + k * 76, 0, 7); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  /* ---------------- mark ---------------- */
  const hexProg = easeOut(inv(t, .20, 1.00));
  const arcProg = easeOut(inv(t, .45, 1.65));
  const zProg = ease(inv(t, 1.15, 2.45));
  const bladeProg = easeOut(inv(t, 2.30, 3.05));
  const flash = bump(t, 3.0, 3.95, .10, .75);
  const glowAmt = easeOut(inv(t, 2.35, 3.2)) * (1 - .25 * inv(t, 4.4, 5.4));
  const breathe = .5 + .5 * Math.sin((t - 3.2) * 2.0);

  const settle = lerp(1.055, 1, easeOut(inv(t, 1.0, 2.9)));
  const float = Math.sin(t * .9) * 3.5;

  ctx.save();
  ctx.translate(cx, cy + float);
  ctx.scale(settle, settle);
  drawMark(ctx, 0, 0, 452, {
    zProg, bladeProg, arcProg, hexProg,
    glow: clamp(glowAmt * (.78 + .22 * breathe)),
    t, alpha: 1
  });
  ctx.restore();

  /* ignition flash — a warm ring expands once the blade lights */
  if (flash > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = lerp(120, 620, easeOut(inv(t, 3.0, 3.9)));
    ctx.strokeStyle = `rgba(200,255,150,${.20 * flash})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    glowAt(ctx, cx, cy + 30, 430, '#ffffff', .16 * flash);
    glowAt(ctx, cx, cy + 70, 360, GREEN, .26 * flash);
    ctx.restore();
  }

  /* ---------------- wordmark ---------------- */
  const wmA = easeOut(inv(t, 3.15, 4.05));
  if (wmA > 0) {
    const rise = (1 - easeOut(inv(t, 3.15, 4.2))) * 18;
    ctx.save();
    ctx.globalAlpha = wmA;
    ctx.translate(0, rise);

    const size = 78;
    const wmW = measure(ctx, 'Z-NOX', size, 700, 'Inter', 15);
    const clipW = wmW * easeOut(inv(t, 3.2, 4.15));
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - wmW / 2 - 12, 600, clipW + 24, 160);
    ctx.clip();
    txt(ctx, 'Z-NOX', cx, 648, {
      size, weight: 700, family: 'Inter', align: 'center', ls: 15, color: C.ink
    });
    ctx.restore();

    /* specular sweep, masked to the letterforms */
    const sw = inv(t, 4.30, 5.25);
    if (sw > 0 && wmW > 0) {
      const BW = Math.ceil(wmW + 60), BH = 150, BASE = 104;
      if (!logoScene._buf || logoScene._buf.width !== BW) {
        logoScene._buf = document.createElement('canvas');
        logoScene._buf.width = BW; logoScene._buf.height = BH;
      }
      const bc = logoScene._buf.getContext('2d');
      bc.setTransform(1, 0, 0, 1, 0, 0);
      bc.clearRect(0, 0, BW, BH);
      txt(bc, 'Z-NOX', BW / 2, BASE, {
        size, weight: 700, family: 'Inter', align: 'center', ls: 15, color: '#fff'
      });
      bc.globalCompositeOperation = 'source-in';
      const scx = lerp(-130, BW + 130, ease(sw));
      const g = bc.createLinearGradient(scx - 190, 0, scx + 190, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(.40, 'rgba(160,255,70,.30)');
      g.addColorStop(.52, 'rgba(255,255,255,.95)');
      g.addColorStop(.66, 'rgba(160,255,70,.30)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      bc.fillStyle = g;
      bc.fillRect(0, 0, BW, BH);
      bc.globalCompositeOperation = 'source-over';

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = wmA * .8 * Math.sin(Math.PI * clamp(sw));
      ctx.drawImage(logoScene._buf, cx - BW / 2, 648 - BASE);
      ctx.restore();
    }

    const faA = easeOut(inv(t, 3.75, 4.55));
    txt(ctx, 'فتوکاتالیست نانوساختار  ·  فعال با نور مرئی', cx, 702, {
      size: 24, weight: 400, align: 'center', color: 'rgba(242,239,232,.66)', alpha: faA
    });

    const enA = easeOut(inv(t, 4.05, 4.8));
    txt(ctx, 'VISIBLE-LIGHT PHOTOCATALYST', cx, 740, {
      size: 12, weight: 500, family: 'Inter', align: 'center', ls: 6,
      color: 'rgba(140,232,31,.9)', alpha: enA
    });

    /* three capability ticks under the name */
    const capA = easeOut(inv(t, 4.3, 5.05));
    const caps = ['CO₂ CAPTURE', 'O₂ RELEASE', 'A1 NON-COMBUSTIBLE'];
    caps.forEach((c, i) => {
      const a = easeOut(inv(t, 4.35 + i * .16, 5.05 + i * .16)) * capA;
      const x = cx + (1 - i) * 232;
      ctx.fillStyle = `rgba(140,232,31,${.5 * a})`;
      ctx.fillRect(x - 62, 768, 124, 1);
      txt(ctx, c, x, 790, {
        size: 10, weight: 500, family: 'Inter', align: 'center', ls: 3,
        color: 'rgba(242,239,232,.42)', alpha: a
      });
    });
    ctx.restore();
  }

  /* ---------------- chemistry motes ---------------- */
  // particles drift in from the frame edge, align to the mark, then rise with the name
  const pn = 40;
  for (let i = 0; i < pn; i++) {
    const rnd = mulberry(i * 137 + 11);
    const a0 = rnd() * Math.PI * 2, r0 = 360 + rnd() * 520;
    const life = (t * .30 + rnd()) % 1;
    const inA = inv(t, .1, .9) * (1 - inv(t, 4.9, 5.6));
    if (inA <= 0) continue;
    const rr = lerp(r0, 46 + rnd() * 14, ease(life));
    const x = cx + Math.cos(a0 + t * .16) * rr;
    const y = cy - 30 + Math.sin(a0 + t * .16) * rr * .8 - (1 - life) * 0;
    const isO2 = i % 5 === 0;
    ctx.save();
    ctx.globalAlpha = inA * (.16 + .5 * (1 - life));
    ctx.beginPath(); ctx.arc(x, y, isO2 ? 2.6 : 1.1 + rnd() * 1.5, 0, 7);
    ctx.fillStyle = isO2 ? 'rgba(155,232,180,.95)' : (i % 7 === 0 ? GREEN : 'rgba(225,232,240,.9)');
    ctx.fill();
    ctx.restore();
  }

  /* soft top-light bloom */
  const bloom = ctx.createRadialGradient(cx, 90, 0, cx, 90, 700);
  bloom.addColorStop(0, 'rgba(255,245,225,.10)');
  bloom.addColorStop(1, 'rgba(255,245,225,0)');
  ctx.fillStyle = bloom; ctx.fillRect(0, 0, W, H * .6);

  /* exit */
  const out = inv(t, LOGO.dur - .45, LOGO.dur);
  if (out > 0) { ctx.fillStyle = `rgba(4,5,7,${out * .85})`; ctx.fillRect(0, 0, W, H); }
  vignette(ctx, .62);
}
