/* =========================================================
   Z-NOX — the eight chapters
   Each scene is a pure function of local time.
   ========================================================= */
const RX = W - 132;            // right content edge (RTL)
const LX = 132;                // left content edge

/* ---------- 01 · INTRODUCTION ---------- */
function scIntro(ctx, t, S, A) {
  bgShot(ctx, A.img['hero-facade'], t, { zoom: [1.04, 1.16], pan: [10, -16], dark: .5, tint: 'rgba(26,18,58,.42)' });

  // rotating wireframe reactor
  ctx.save();
  ctx.translate(W * .5, H * .40);
  const rot = t * .22;
  ctx.globalAlpha = .26 * (1 - inv(t, 5.6, 7.0));
  for (let k = 0; k < 3; k++) {
    ctx.save(); ctx.rotate(rot + k * Math.PI / 3);
    ctx.strokeStyle = k === 1 ? C.accent : 'rgba(242,239,232,.7)';
    ctx.lineWidth = 1.1;
    hexPath(ctx, 0, 0, 190 + k * 74 + Math.sin(t * .8 + k) * 6, 0); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  const outA = 1 - inv(t, 6.4, 7.4);

  // logo mark + wordmark (centred, RTL-safe)
  const a0 = easeOut(inv(t, .5, 1.8));
  const wmSize = 100;
  const wmW = measure(ctx, 'Z-NOX', wmSize, 700, 'Inter', 14);
  const blockW = 118 + wmW;
  const bx = W / 2 - blockW / 2;
  drawMark(ctx, bx + 40, H * .40 - 6, 150 * a0, {
    alpha: a0 * outA, zProg: 1, bladeProg: 1, arcProg: 1, hexProg: 1,
    glow: .25 + .1 * Math.sin(t * 2), t
  });
  txt(ctx, 'Z-NOX', bx + 118, H * .40 + 8, {
    size: wmSize, weight: 700, family: 'Inter', align: 'left', ls: 14, alpha: a0 * outA, color: C.ink
  });

  const a2 = easeOut(inv(t, 2.0, 3.4)) * outA;
  txt(ctx, FILM.brandFa, W * .5, H * .40 + 124, { size: 42, weight: 600, alpha: a2, color: C.accent2, align: 'center' });
  tick(ctx, W * .5 - 150, H * .40 + 168, 300, a2, 'rgba(242,239,232,.2)');
  txt(ctx, FILM.tagline, W * .5, H * .40 + 222, { size: 34, weight: 300, alpha: easeOut(inv(t, 2.7, 4.2)) * outA, align: 'center', color: C.ink });
  txt(ctx, FILM.subline, W * .5, H * .40 + 276, { size: 24, weight: 400, alpha: easeOut(inv(t, 3.6, 5.2)) * outA, align: 'center', color: C.faint, ls: 1 });

  // closing band with the catalogue title
  const band = ease(inv(t, 7.1, 8.5));
  if (band > 0) {
    const bh = H * .26 * band;
    ctx.fillStyle = 'rgba(6,7,10,.92)';
    ctx.fillRect(0, H * .46 - bh / 2, W, bh);
    ctx.save(); ctx.globalAlpha = band;
    tick(ctx, W / 2 - 210, H * .46 - 44, 420, 1, 'rgba(142,123,255,.7)');
    txt(ctx, 'کاتالوگ فنی', W / 2, H * .46 + 10, { size: 46, weight: 700, align: 'center' });
    txt(ctx, 'ARCHITECTURAL CATALOGUE  ·  VOL. 01', W / 2, H * .46 + 56, {
      size: 19, weight: 500, family: 'Inter', align: 'center', ls: 6, color: C.faint
    });
    ctx.restore();
  }
  vignette(ctx, .6);
}

/* ---------- 02 · THE PROBLEM ---------- */
function scProblem(ctx, t, S, A) {
  bgShot(ctx, A.img['plate-pollution'], t, { zoom: [1.10, 1.02], pan: [-14, 0], dark: .60, tint: 'rgba(26,26,32,.55)' });
  soot(ctx, t, { n: 80, alpha: .40 });
  const scrim = ctx.createLinearGradient(0, 0, W * .6, 0);
  scrim.addColorStop(0, 'rgba(7,8,11,.86)'); scrim.addColorStop(1, 'rgba(7,8,11,0)');
  ctx.fillStyle = scrim; ctx.fillRect(0, 0, W * .6, H);

  const px = 176, py = 128, pw = 512, ph = 700;

  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(px + 18, py + 20, pw, ph);
  panelFace(ctx, px, py, pw, ph, { tone: 2, light: .9 });

  const grime = ease(inv(t, 1.0, 11.0));
  ctx.save();
  ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
  const g = ctx.createLinearGradient(px, py, px + pw * .2, py + ph);
  g.addColorStop(0, `rgba(62,56,42,${.72 * grime})`);
  g.addColorStop(.5, `rgba(74,68,54,${.5 * grime})`);
  g.addColorStop(1, `rgba(44,42,36,${.72 * grime})`);
  ctx.fillStyle = g; ctx.fillRect(px, py, pw, ph);
  const rnd = mulberry(7);
  for (let i = 0; i < 30; i++) {
    const sx = px + rnd() * pw, w2 = 3 + rnd() * 11, len = 60 + rnd() * 520;
    const gr = ctx.createLinearGradient(0, py, 0, py + len);
    gr.addColorStop(0, `rgba(34,32,26,${.5 * grime})`);
    gr.addColorStop(1, 'rgba(34,32,26,0)');
    ctx.fillStyle = gr; ctx.fillRect(sx, py, w2, len * grime);
  }
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(24,22,18,${.55 * grime})`;
    ctx.beginPath(); ctx.arc(px + rnd() * pw, py + rnd() * ph, .8 + rnd() * 2.6, 0, 7); ctx.fill();
  }
  const wipe = ease(inv(t, 12.4, 14.4));
  if (wipe > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(px, py, pw * wipe, ph); ctx.clip();
    panelFace(ctx, px, py, pw, ph, { tone: 1, light: 1.14, gloss: 1 });
    const gg = ctx.createLinearGradient(px, py, px + pw, py + ph);
    gg.addColorStop(0, 'rgba(142,123,255,.22)'); gg.addColorStop(1, 'rgba(127,216,255,.10)');
    ctx.fillStyle = gg; ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    if (wipe < .995) {
      const wx = px + pw * wipe;
      const lg = ctx.createLinearGradient(wx - 44, 0, wx + 44, 0);
      lg.addColorStop(0, 'rgba(142,123,255,0)'); lg.addColorStop(.5, 'rgba(210,198,255,.95)'); lg.addColorStop(1, 'rgba(142,123,255,0)');
      ctx.fillStyle = lg; ctx.fillRect(wx - 44, py, 88, ph);
    }
  }
  ctx.restore();

  const marks = [
    { label: 'NOₓ', x: .24, y: .24, at: 3.0 },
    { label: 'PM₂.₅', x: .60, y: .44, at: 4.1 },
    { label: 'VOC', x: .32, y: .64, at: 5.2 },
    { label: 'CO₂', x: .64, y: .78, at: 6.3 }
  ];
  marks.forEach(m => {
    const a = easeOut(inv(t, m.at, m.at + .9)) * (1 - inv(t, 11.4, 12.2));
    if (a <= 0) return;
    const mx = px + pw * m.x, my = py + ph * m.y;
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(mx, my, 24 + Math.sin(t * 2 + m.at) * 2, 0, 7);
    ctx.strokeStyle = 'rgba(255,220,180,.55)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, my, 2.6, 0, 7); ctx.fillStyle = 'rgba(255,220,180,.85)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(mx + 24, my - 12); ctx.lineTo(mx + 74, my - 52); ctx.lineTo(mx + 118, my - 52);
    ctx.strokeStyle = 'rgba(255,220,180,.4)'; ctx.setLineDash([4, 4]); ctx.stroke();
    ctx.restore();
    txt(ctx, m.label, mx + 74, my - 64, { size: 24, weight: 500, family: 'Inter', color: C.warm, align: 'left', alpha: a });
  });

  const ba = easeOut(inv(t, 7.2, 8.4));
  if (ba > 0 && t < 12.5) {
    ctx.save(); ctx.globalAlpha = ba;
    const bw = 320, bx = RX - bw, by = 340;
    txt(ctx, 'افت عملکرد نما در نبود پوشش فعال', RX, by - 46, { size: 23, weight: 400, color: C.dim });
    ['درخشندگی', 'یکنواختی رنگ', 'قدرت بازتاب نور'].forEach((lab, i) => {
      const y = by + 34 + i * 88;
      const p = .28 + i * .1;
      txt(ctx, lab, RX, y - 18, { size: 21, weight: 400, color: C.dim });
      txt(ctx, '-' + fmtFa(Math.round(p * 100)) + '٪', bx + 8, y - 18, { size: 19, weight: 500, color: C.warm, align: 'left' });
      ctx.fillStyle = 'rgba(242,239,232,.10)'; ctx.fillRect(bx, y, bw, 4);
      ctx.fillStyle = 'rgba(255,217,168,.8)';
      ctx.fillRect(bx, y, bw * p * easeOut(inv(t, 7.6 + i * .35, 9.4 + i * .35)), 4);
    });
    ctx.restore();
  }

  caption(ctx, t, {
    tag: '01 — THE PROBLEM',
    title: 'هوا، هر روز روی نما می‌نشیند.',
    sub: 'دوده، اکسیدهای نیتروژن، ترکیبات آلی و دی‌اکسید کربن، درخشندگی و یکنواختی پوسته را می‌بلعند — و هزینهٔ نگهداشت را هر سال بالا می‌برند.',
    bottom: H - 92, inAt: .5, outAt: S.dur - .2, maxW: 900, size: 56
  });
  vignette(ctx, .55);
}

/* ---------- 03 · THE PRODUCT ---------- */
function scProduct(ctx, t, S, A) {
  bgShot(ctx, A.img['plate-macro'], t, { zoom: [1.14, 1.04], pan: [18, 0], dark: .68, tint: 'rgba(18,14,40,.55)' });
  grid(ctx, { step: 96, color: 'rgba(242,239,232,.035)' });

  const iso = easeOut(inv(t, 1.6, 3.8));
  const dims = easeOut(inv(t, 4.4, 6.2));
  const layers = easeOut(inv(t, 7.4, 9.4));
  const copyOut = 1 - inv(t, 11.3, 12.2);
  const boardA = 1 - inv(t, 11.8, 13.0);

  if (boardA > 0) {
    const cx = 700, cy = H * .52;
    const pw = 300 * (iso * .35 + .65), ph = 600 * (iso * .35 + .65);
    const float = Math.sin(t * .9) * 5;
    ctx.save();
    ctx.globalAlpha = boardA;
    ctx.translate(0, (1 - iso) * 46 + float);
    isoPanel(ctx, cx, cy, pw, ph, 12, { tone: 1, glow: .35 + .3 * (0.5 + 0.5 * Math.sin(t * 1.2)) + layers * .4 });

    if (dims > 0) {
      dim(ctx, cx - pw / 2 - 62, cy - ph / 2, cx - pw / 2 - 62, cy + ph / 2, '3200', { vertical: true, alpha: dims, size: 21 });
      dim(ctx, cx - pw / 2, cy + ph / 2 + 58, cx + pw / 2, cy + ph / 2 + 58, '1600', { alpha: dims, size: 21 });
      dim(ctx, cx + pw / 2 + 16, cy - ph / 2 - 16, cx + pw / 2 + 46, cy - ph / 2 - 36, '12', { alpha: dims, size: 15 });
    }

    if (layers > 0) {
      const lx = cx - pw / 2 - 150;
      SPEC.layers.forEach((L, i) => {
        const a = easeOut(inv(t, 7.6 + i * .34, 9.0 + i * .34)) * layers;
        const y = cy - 140 + i * 100;
        ctx.save(); ctx.globalAlpha = a;
        ctx.fillStyle = L.c; ctx.fillRect(lx - 128, y, 128, L.h * 1.5);
        ctx.globalAlpha = a * .45; ctx.fillRect(lx - 128, y, 128, L.h * 1.5);
        ctx.strokeStyle = hexA(L.c, .55); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(lx, y + L.h * .75); ctx.lineTo(cx - pw / 2 - 8, y + L.h * .75); ctx.stroke();
        ctx.restore();
        txt(ctx, L.fa, lx - 146, y + L.h * .75 + 4, { size: 21, weight: 500, color: C.ink, alpha: a });
        txt(ctx, L.en, lx - 146, y + L.h * .75 + 28, { size: 12, weight: 500, family: 'Inter', color: C.faint, ls: 2, alpha: a });
      });
    }
    ctx.restore();
  }

  const headA = easeOut(inv(t, .4, 1.8)) * copyOut;
  txt(ctx, 'Z-NOX  ·  COATING SYSTEM', RX, 200, { size: 18, weight: 600, family: 'Inter', ls: 6, color: C.accent, alpha: headA });
  para(ctx, 'یک پوشش فتوکاتالیستی، روی پنل سرامیکی بتنی', RX, 282, 680,
    { size: 44, weight: 700, color: C.ink, lh: 1.42, alpha: headA });

  const bodyA = easeOut(inv(t, 1.6, 3.2)) * copyOut;
  para(ctx, 'پنل با کربن اکتیو دوپ شده است؛ پوشش در تمام ضخامت پخت می‌شود و با سایش، خراش یا شست‌وشو از بین نمی‌رود.',
    RX, 428, 640, { size: 25, weight: 300, color: C.dim, lh: 1.85, alpha: bodyA });

  let cxp = RX;
  ['فعال با نور مرئی', 'دوپ کربن اکتیو', 'پخت ۱۲۰۰°C', 'A1'].forEach((lab, i) => {
    const a = easeOut(inv(t, 3.0 + i * .3, 4.2 + i * .3)) * copyOut;
    const w = chip(ctx, lab, cxp, 590, { alpha: a, accent: i < 2, size: 20 });
    cxp -= w + 10;
  });

  const fam = inv(t, 12.2, 13.8);
  if (fam > 0) {
    const startY = 330;
    txt(ctx, 'سه خانوادهٔ محصول', RX, startY - 44, { size: 25, weight: 600, alpha: fam });
    SPEC.families.forEach((f, i) => {
      const a = easeOut(inv(t, 12.4 + i * .3, 13.8 + i * .3));
      const y = startY + i * 128;
      const w = 680;
      ctx.save(); ctx.globalAlpha = a;
      rrect(ctx, RX - w, y, w, 108, 4);
      ctx.fillStyle = 'rgba(10,11,16,.62)'; ctx.fill();
      ctx.strokeStyle = 'rgba(242,239,232,.12)'; ctx.lineWidth = 1; ctx.stroke();
      const key = f.img === 'tower' ? 'plate-tower' : f.img === 'interior' ? 'plate-interior' : 'plate-detail';
      drawCover(ctx, A.img[key], RX - w + 10, y + 10, 88, 88, 1.1);
      ctx.fillStyle = 'rgba(8,9,12,.3)'; ctx.fillRect(RX - w + 10, y + 10, 88, 88);
      txt(ctx, f.fa, RX - 124, y + 48, { size: 27, weight: 600 });
      txt(ctx, f.note, RX - 124, y + 82, { size: 18, weight: 400, color: C.faint });
      txt(ctx, f.en, RX - w + 118, y + 66, { size: 12, weight: 600, family: 'Inter', ls: 3, color: C.accent, alpha: .9, align: 'left' });
      ctx.restore();
    });
    caption(ctx, t, {
      tag: '02 — THE PRODUCT',
      title: 'یک پوشش، سه کاربرد.',
      sub: 'نما، کف و دیوار داخلی — بدنهٔ سرامیکی بتنی مشترک، با کربن اکتیو و پوشش فعال یکسان.',
      bottom: H - 92, inAt: 12.8, outAt: S.dur - .2, maxW: 760, size: 52
    });
  } else {
    caption(ctx, t, {
      tag: '02 — THE PRODUCT',
      title: 'پوشش فعال، روی پنل بتنی.',
      bottom: H - 92, inAt: .8, outAt: 12.0, maxW: 760, size: 56
    });
  }
  vignette(ctx, .55);
}

/* ---------- 04 · THE MECHANISM ---------- */
function scTech(ctx, t, S, A) {
  const stripA = easeOut(inv(t, 11.6, 12.8));   /* step strip — particles give way */
  const recede = 1 - .78 * stripA;
  ctx.fillStyle = '#07080B'; ctx.fillRect(0, 0, W, H);
  grid(ctx, { step: 64, color: 'rgba(242,239,232,.03)' });
  glowAt(ctx, 560, 360, 660, C.glow, .16 + .03 * Math.sin(t));
  glowAt(ctx, 900, 210, 380, C.warm, .05 + .03 * Math.sin(t * .8 + 1));

  const surfY = 838;
  const x0 = 120, x1 = 1000;

  // ---------- ceramic-concrete slab with carbon-doped layer ----------
  ctx.save();
  const sg = ctx.createLinearGradient(0, surfY, 0, H);
  sg.addColorStop(0, '#c6c3bd'); sg.addColorStop(.10, '#918f8a'); sg.addColorStop(1, '#202125');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(x0, surfY); ctx.lineTo(x1, surfY);
  ctx.lineTo(x1 + 90, H + 30); ctx.lineTo(x0 - 90, H + 30);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = hexA(C.accent, .60); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, surfY); ctx.lineTo(x1, surfY); ctx.stroke();
  // carbon flecks inside the body
  const rnd = mulberry(31);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0, surfY + 6); ctx.lineTo(x1, surfY + 6);
  ctx.lineTo(x1 + 84, H + 20); ctx.lineTo(x0 - 84, H + 20); ctx.closePath(); ctx.clip();
  for (let i = 0; i < 220; i++) {
    const px = x0 - 80 + rnd() * (x1 - x0 + 170);
    const py = surfY + 8 + rnd() * (H - surfY);
    ctx.fillStyle = `rgba(18,18,20,${.15 + rnd() * .35})`;
    ctx.beginPath(); ctx.arc(px, py, .8 + rnd() * 2.6, 0, 7); ctx.fill();
  }
  ctx.restore();
  ctx.restore();

  // ---------- carbon-doped adsorption band ----------
  const bandY = surfY + 14, bandH = 44;
  ctx.save();
  const bg = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  bg.addColorStop(0, 'rgba(127,216,255,.30)'); bg.addColorStop(1, 'rgba(127,216,255,.04)');
  ctx.fillStyle = bg; ctx.fillRect(x0, bandY, x1 - x0, bandH);
  ctx.strokeStyle = hexA(C.cyan, .45); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0, bandY + bandH); ctx.lineTo(x1, bandY + bandH); ctx.stroke();
  ctx.restore();
  txt(ctx, 'لایهٔ جذب کربن اکتیو', x1 - 6, bandY + bandH + 40, { size: 19, weight: 500, color: C.cyan, alpha: .95 });
  txt(ctx, 'CARBON-DOPED ADSORPTION', x1 - 6, bandY + bandH + 62, { size: 11, weight: 500, family: 'Inter', ls: 2, color: C.faint });

  // ---------- visible light ----------
  const visA = easeOut(inv(t, 0.4, 1.6));
  for (let i = 0; i < 7; i++) {
    const ph = (t * .5 + i / 7) % 1;
    const sx = x0 + 90 + i * 140, sy = 110;
    const ex = sx + 120, ey = surfY - 8;
    const x = lerp(sx, ex, ph), y = lerp(sy, ey, ph);
    const hue = [C.warm, '#FFE9C2', '#FFF6E4'][i % 3];
    ctx.save();
    ctx.globalAlpha = .85 * Math.sin(ph * Math.PI) * visA;
    ctx.strokeStyle = hue; ctx.lineWidth = 1.5; ctx.setLineDash([13, 15]);
    ctx.beginPath(); ctx.moveTo(x - 60, y - 60); ctx.lineTo(x, y); ctx.stroke();
    ctx.setLineDash([]);
    glowAt(ctx, x, y, 22, C.warm, .40);
    ctx.beginPath(); ctx.arc(x, y, 2.8, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  (function legendScrim() {
    const g = ctx.createRadialGradient(x0 + 60, 190, 10, x0 + 60, 190, 330);
    g.addColorStop(0, 'rgba(7,8,11,.80)'); g.addColorStop(1, 'rgba(7,8,11,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 60, 460, 300);
  })();
  txt(ctx, 'نور مرئی', x0 + 26, 132, { size: 26, weight: 600, color: C.warm, alpha: visA });
  txt(ctx, 'VISIBLE LIGHT  ·  ~400–700 nm', x0 + 26, 158, { size: 11, weight: 500, family: 'Inter', ls: 2, color: C.faint, alpha: visA });
  txt(ctx, 'بدون نیاز به UV', x0 + 26, 182, { size: 15, weight: 400, color: C.faint, alpha: visA });

  // ---------- electrons / holes ----------
  const sites = [x0 + 330, x0 + 660];
  sites.forEach((sx, k) => {
    const t0 = 2.6 + k * 1.9;
    const a = easeOut(inv(t, t0, t0 + .8));
    if (a <= 0) return;
    const pulse = .5 + .5 * Math.sin(t * 2.1 - k);
    const ey = surfY - 150 - pulse * 22;
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(sx, surfY - 24, 11, 0, 7);
    ctx.fillStyle = hexA(C.accent, .95); ctx.fill();
    glowAt(ctx, sx, surfY - 24, 50, C.accent, .45);
    ctx.beginPath(); ctx.arc(sx + 26, ey, 9, 0, 7);
    ctx.fillStyle = C.cyan; ctx.fill();
    glowAt(ctx, sx + 26, ey, 44, C.cyan, .45);
    arrow(ctx, sx + 8, surfY - 40, sx + 22, ey + 16, { color: hexA(C.cyan, .75), width: 1.5, head: 8, dash: [5, 5] });
    ctx.restore();
    txt(ctx, 'h⁺', sx, surfY - 20, { size: 12, weight: 700, family: 'Inter', color: '#fff', align: 'center', alpha: a });
    txt(ctx, 'e⁻', sx + 26, ey + 2, { size: 11, weight: 700, family: 'Inter', color: '#04121a', align: 'center', alpha: a });
    txt(ctx, 'شکاف انرژی', sx - 26, (ey + surfY) / 2, { size: 14, weight: 400, color: C.faint, alpha: a });
  });

  // ---------- radicals ----------
  const radicals = [
    { x: x0 + 260, lab: '•OH', c: C.accent2, at: 4.6 },
    { x: x0 + 410, lab: 'O₂•⁻', c: C.cyan, at: 5.2 },
    { x: x0 + 620, lab: '•OH', c: C.accent2, at: 5.8 },
    { x: x0 + 760, lab: 'O₂•⁻', c: C.cyan, at: 6.4 }
  ];
  radicals.forEach((r, i) => {
    const a = easeOut(inv(t, r.at, r.at + .7));
    if (a <= 0) return;
    const flow = ((t * .2 + i * .23) % 1);
    const y = lerp(surfY - 60, 320, flow);
    const x = r.x + Math.sin(t * 1.1 + i) * 20;
    particle(ctx, x, y, 15, r.c, { alpha: a * (1 - flow * .2) * recede, glow: 1 });
    txt(ctx, r.lab, x, y + 2, { size: 11, weight: 700, family: 'Inter', color: '#0b0a14', align: 'center', alpha: a * recede, baseline: 'middle' });
  });

  // ---------- CO₂ adsorption (down into the carbon layer) ----------
  const co2A = easeOut(inv(t, 7.0, 8.2));
  if (co2A > 0) {
    for (let i = 0; i < 6; i++) {
      const ph = ((t * .30 + i / 6) % 1);
      const x = x0 + 150 + i * 130 + Math.sin(t + i) * 10;
      const y = lerp(210, surfY - 6, ph);
      ctx.save(); ctx.globalAlpha = co2A * Math.sin(ph * Math.PI) * .95 * recede;
      particle(ctx, x, y, 15, '#c9beac', { glow: .5 });
      txt(ctx, 'CO₂', x, y + 2, { size: 10, weight: 700, family: 'Inter', color: '#16130d', align: 'center', baseline: 'middle' });
      ctx.restore();
    }
    /* legend row pinned under the light block — it must never collide with it */
    ctx.save(); ctx.globalAlpha = co2A;
    ctx.beginPath(); ctx.arc(x0 + 150, 253, 4, 0, 7);
    ctx.fillStyle = '#c9beac'; ctx.fill();
    txt(ctx, 'جذب و تثبیت CO₂', x0 + 130, 260, { size: 17, weight: 500, color: '#c9beac' });
    ctx.restore();
  }

  // ---------- O₂ released upward ----------
  const o2A = easeOut(inv(t, 9.6, 10.8));
  if (o2A > 0) {
    for (let i = 0; i < 7; i++) {
      const ph = ((t * .26 + i / 7) % 1);
      const x = x0 + 240 + i * 110 + Math.sin(t * .8 + i) * 16;
      const y = lerp(surfY - 30, 250, ph);
      ctx.save(); ctx.globalAlpha = o2A * (1 - ph * .35) * .95 * recede;
      particle(ctx, x, y, 16, C.ok, { glow: 1 });
      txt(ctx, 'O₂', x, y + 2, { size: 10, weight: 700, family: 'Inter', color: '#07160d', align: 'center', baseline: 'middle' });
      ctx.restore();
    }
    txt(ctx, 'آزادسازی اکسیژن', x0 + 980, 300, { size: 20, weight: 600, color: C.ok, alpha: o2A });
    txt(ctx, 'OXYGEN RELEASE', x0 + 980, 324, { size: 11, weight: 500, family: 'Inter', ls: 2, color: C.faint, alpha: o2A });
  }

  // ---------- reaction card ----------
  const cardA = easeOut(inv(t, 1.4, 2.6));
  if (cardA > 0) {
    const cw = 560, ch = 322, cx = RX - cw, cy = 176;
    ctx.save(); ctx.globalAlpha = cardA;
    rrect(ctx, cx, cy, cw, ch, 6);
    ctx.fillStyle = 'rgba(10,11,17,.82)'; ctx.fill();
    ctx.strokeStyle = 'rgba(242,239,232,.12)'; ctx.lineWidth = 1; ctx.stroke();
    txt(ctx, 'مسیر واکنش', RX - 28, cy + 44, { size: 20, weight: 500, color: C.dim });
    const eqs = [
      ['TiO₂ + light', '→  e⁻ + h⁺'],
      ['C (active) + CO₂', '→  ads.'],
      ['h⁺ + H₂O', '→  •OH'],
      ['•OH + NOₓ', '→  NO₃⁻ + H₂O'],
      ['•OH + VOC  /  O₂', '→  CO₂ + H₂O  +  O₂ ↑']
    ];
    eqs.forEach((e, i) => {
      const a = easeOut(inv(t, 2.0 + i * .55, 3.0 + i * .55)) * cardA;
      const y = cy + 92 + i * 46;
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = '500 20px Inter'; ctx.direction = 'ltr';
      ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = C.ink;
      ctx.fillText(e[0] + '  ', RX - 28, y);
      const w0 = ctx.measureText(e[0] + '  ').width;
      ctx.fillStyle = i === 4 ? C.ok : C.accent2;
      ctx.fillText(e[1], RX - 28 - w0, y);
      ctx.restore();
      ctx.fillStyle = 'rgba(242,239,232,.06)';
      ctx.fillRect(cx + 20, y + 14, cw - 40, 1);
    });
    ctx.restore();
  }

  // ---------- "how the surface works" strip ----------
  if (stripA > 0) {
    const items = [
      { n: '۱', fa: 'جذب', en: 'ADSORB' },
      { n: '۲', fa: 'فعال‌سازی با نور مرئی', en: 'ACTIVATE' },
      { n: '۳', fa: 'تجزیهٔ آلاینده', en: 'DECOMPOSE' },
      { n: '۴', fa: 'آزادسازی اکسیژن', en: 'OXYGEN' }
    ];
    items.forEach((it, i) => {
      const a = easeOut(inv(t, 11.8 + i * .35, 12.8 + i * .35)) * stripA;
      const x = RX - i * 232;
      ctx.save(); ctx.globalAlpha = a;
      txt(ctx, it.n, x, H - 470, { size: 15, weight: 700, family: 'Vaz', color: C.accent });
      txt(ctx, it.fa, x, H - 436, { size: 18, weight: 500, color: C.ink });
      txt(ctx, it.en, x, H - 414, { size: 10, weight: 500, family: 'Inter', ls: 2, color: C.faint });
      ctx.restore();
      if (i < 3) {
        ctx.fillStyle = 'rgba(242,239,232,.14)';
        ctx.fillRect(x - 214, H - 456, 90, 1);
      }
    });
  }

  caption(ctx, t, {
    tag: '03 — THE MECHANISM',
    title: 'با نور مرئی فعال می‌شود.',
    sub: 'نور روز پوشش را فعال می‌کند؛ کربن اکتیو CO₂ و آلاینده را جذب و متمرکز می‌کند؛ رادیکال‌های فعال آن‌ها را می‌شکنند و اکسیژن آزاد می‌شود.',
    bottom: H - 92, inAt: .5, outAt: S.dur - .2, maxW: 820, size: 52
  });
  vignette(ctx, .5);
}

/* ---------- 05 · HYDROPHILIC ---------- */
function scWater(ctx, t, S, A) {
  bgShot(ctx, A.img['plate-rain'], t, { zoom: [1.12, 1.02], pan: [-20, 6], dark: .62, tint: 'rgba(14,26,48,.6)' });
  const scrim = ctx.createLinearGradient(W, 0, W * .5, 0);
  scrim.addColorStop(0, 'rgba(7,8,11,.8)'); scrim.addColorStop(1, 'rgba(7,8,11,0)');
  ctx.fillStyle = scrim; ctx.fillRect(W * .5, 0, W * .5, H);

  const y = 150, h = 520, w = 372;
  const xa = 216, xb = 626;

  function board(x, label, en, active, note) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.42)';
    rrect(ctx, x + 12, y + 14, w, h, 4); ctx.fill();
    panelFace(ctx, x, y, w, h, { tone: 1, light: active ? 1.14 : .84, gloss: active ? .95 : 0 });
    if (!active) {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, 'rgba(48,47,46,.72)'); g.addColorStop(1, 'rgba(30,30,31,.85)');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    }
    ctx.fillStyle = active ? hexA(C.accent, .9) : 'rgba(160,150,130,.5)';
    ctx.fillRect(x, y - 3, w, 3);
    ctx.strokeStyle = 'rgba(242,239,232,.16)'; ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
    txt(ctx, label, x + w, y + h + 44, { size: 27, weight: 600, color: active ? C.ink : C.dim });
    txt(ctx, en, x + w, y + h + 72, { size: 12, weight: 600, family: 'Inter', ls: 3, color: active ? C.accent : C.faint });
    txt(ctx, note, x + w, y - 22, { size: 20, weight: 400, color: active ? C.accent2 : C.faint });
  }
  const panA = easeOut(inv(t, .4, 1.6));
  ctx.save(); ctx.globalAlpha = panA;
  board(xa, 'نمای بدون پوشش', 'UNTREATED', false, 'قطره می‌ایستد');
  board(xb, 'نمای زیناکس', 'Z-NOX ACTIVE', true, 'قطره می‌گسترد');
  ctx.restore();

  const seeds = mulberry(42);
  for (let i = 0; i < 16; i++) {
    const dx = xa + 42 + seeds() * (w - 84);
    const dy = y + 64 + seeds() * (h - 120);
    droplet(ctx, dx, dy, .42 + seeds() * .5, 95 + seeds() * 22, { alpha: easeOut(inv(t, .9 + i * .09, 1.7 + i * .09)) * .95 });
  }

  const flat = ease(inv(t, 2.0, 5.2));
  for (let i = 0; i < 8; i++) {
    const dx = xb + 56 + (i % 4) * ((w - 112) / 3);
    const dy = y + 96 + Math.floor(i / 4) * 230;
    const a = easeOut(inv(t, 1.2 + i * .1, 2.0 + i * .1));
    droplet(ctx, dx, dy, 1.1, lerp(96, SPEC.contact, flat), { alpha: a * (1 - flat * .3), ripples: t * .5 + i });
  }

  const flow = ease(inv(t, 4.6, 9.0));
  if (flow > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(xb, y, w, h); ctx.clip();
    const fg = ctx.createLinearGradient(0, y + h * (1 - flow) - 100, 0, y + h * (1 - flow) + 220);
    fg.addColorStop(0, 'rgba(190,225,255,0)');
    fg.addColorStop(.5, `rgba(190,225,255,${.32 * (1 - flow * .3)})`);
    fg.addColorStop(1, 'rgba(190,225,255,.05)');
    ctx.fillStyle = fg; ctx.fillRect(xb, y, w, h * flow + 40);
    for (let i = 0; i < 16; i++) {
      const sx = xb + 20 + seeds() * (w - 40);
      const top = y + seeds() * (h * flow);
      ctx.strokeStyle = `rgba(86,80,66,${.4 * (1 - flow * .5)})`;
      ctx.lineWidth = 1 + seeds() * 2;
      ctx.beginPath(); ctx.moveTo(sx, top); ctx.lineTo(sx + 1, top + 60 + seeds() * 130); ctx.stroke();
    }
    ctx.restore();
  }

  // ---- contact-angle instrument (right card)
  const ca = easeOut(inv(t, 1.5, 2.6));
  if (ca > 0) {
    const cw = 560, cx = RX - cw, cy = 236;
    ctx.save(); ctx.globalAlpha = ca;
    rrect(ctx, cx, cy, cw, 420, 6);
    ctx.fillStyle = 'rgba(10,11,17,.72)'; ctx.fill();
    ctx.strokeStyle = 'rgba(242,239,232,.12)'; ctx.lineWidth = 1; ctx.stroke();

    txt(ctx, 'زاویهٔ تماس آب', RX - 30, cy + 50, { size: 21, weight: 400, color: C.dim });
    const val = lerp(95, SPEC.contact, ease(inv(t, 2.6, 6.0)));
    txt(ctx, fmtFa(Math.round(val)) + '°', RX - 30, cy + 122, { size: 62, weight: 700, color: C.accent2 });

    // mini instrument: droplet on a line with the angle arc
    const ix = cx + 130, iy = cy + 300;
    ctx.strokeStyle = 'rgba(242,239,232,.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ix - 96, iy); ctx.lineTo(ix + 96, iy); ctx.stroke();
    const deg = val * Math.PI / 180;
    const r = 56;
    // droplet profile
    ctx.beginPath();
    ctx.moveTo(ix - r * Math.sin(deg), iy);
    ctx.bezierCurveTo(ix - r * Math.sin(deg) * 1.1, iy - r * (1 - Math.cos(deg)) * 1.5,
      ix + r * Math.sin(deg) * 1.1, iy - r * (1 - Math.cos(deg)) * 1.5,
      ix + r * Math.sin(deg), iy);
    ctx.closePath();
    const dg = ctx.createLinearGradient(ix - r, iy - r, ix + r, iy);
    dg.addColorStop(0, 'rgba(215,235,255,.75)'); dg.addColorStop(1, 'rgba(130,180,225,.4)');
    ctx.fillStyle = dg; ctx.fill();
    ctx.strokeStyle = 'rgba(230,245,255,.85)'; ctx.lineWidth = 1.2; ctx.stroke();
    // angle arc
    ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(ix + r * Math.sin(deg), iy, 34, Math.PI, Math.PI + deg * 0 + Math.PI - (Math.PI - deg) - 0, true); ctx.stroke();
    ctx.beginPath(); ctx.arc(ix + r * Math.sin(deg), iy, 34, Math.PI - deg, Math.PI); ctx.stroke();
    ctx.fillStyle = C.accent2; ctx.font = '500 15px Inter';
    ctx.textAlign = 'right'; ctx.fillText(fmtFa(Math.round(val)) + '°', ix + r * Math.sin(deg) - 8, iy - 42);
    txt(ctx, 'سطح زیناکس', ix + 96, iy + 34, { size: 15, weight: 400, color: C.faint });

    // bullet notes
    ['آب به‌جای ماندن، کل پنل را می‌شوید', 'رسوب و گرد و غبار با هر باران', 'بدون نیاز به مواد شوینده'].forEach((s, i) => {
      const a = easeOut(inv(t, 3.4 + i * .3, 4.4 + i * .3)) * ca;
      const yy = cy + 186 + i * 0;
      txt(ctx, '— ' + s, RX - 300, cy + 176 + i * 34, { size: 17, weight: 400, color: C.dim, alpha: a });
    });
    ctx.restore();
  }

  caption(ctx, t, {
    tag: '04 — HYDROPHILIC',
    title: 'آب، روی سطح می‌گسترد.',
    sub: 'زاویهٔ تماس کمتر از ۵ درجه؛ آب به‌جای ماندن، کل پنل را می‌شوید و گرد و غبار را با خود می‌برد.',
    bottom: H - 92, inAt: 3.2, outAt: S.dur - .2, maxW: 780, size: 54
  });
  vignette(ctx, .5);
}

/* ---------- 06 · SYSTEM ---------- */
function scSystem(ctx, t, S, A) {
  ctx.fillStyle = '#07080B'; ctx.fillRect(0, 0, W, H);
  grid(ctx, { step: 72, color: 'rgba(242,239,232,.03)' });
  glowAt(ctx, 520, 560, 620, C.glow, .12);

  // ---- elevation with joints + zoom detail
  const gx = 236, gy = 250, gw = 556, gh = 470;
  const build = easeOut(inv(t, .3, 1.8));
  const jointA = easeOut(inv(t, 3.0, 4.4));

  ctx.save(); ctx.globalAlpha = build;
  // three columns × two rows of panels with open joints
  const cols = 2, nrows = 2, gap = 10;
  const rowsN = nrows;
  const pwid = (gw - gap * (cols - 1)) / cols;
  const phei = (gh - gap * (rowsN - 1)) / rowsN;
  for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) {
    const x = gx + c * (pwid + gap), y = gy + r * (phei + gap);
    const pr = easeOut(inv(t, .5 + (r * cols + c) * .22, 1.6 + (r * cols + c) * .22));
    ctx.save(); ctx.globalAlpha = build * pr;
    ctx.translate(0, (1 - pr) * 22);
    panelFace(ctx, x, y, pwid, phei, { tone: (r + c) % 2 ? 2 : 1, light: .95 });
    const gg = ctx.createLinearGradient(x, y, x + pwid, y + phei);
    gg.addColorStop(0, 'rgba(142,123,255,.12)'); gg.addColorStop(.7, 'rgba(142,123,255,0)');
    ctx.fillStyle = gg; ctx.fillRect(x, y, pwid, phei);
    ctx.restore();
  }
  // overall dims
  dim(ctx, gx - 54, gy, gx - 54, gy + gh, '', { vertical: true, alpha: jointA });
  dim(ctx, gx, gy + gh + 46, gx + gw, gy + gh + 46, '2 × 1600 + 10', { alpha: jointA, size: 18 });
  // carbon-doped badge on the elevation
  txt(ctx, 'پنل سرامیکی بتنی + دوپ کربن اکتیو', gx + gw, gy - 26, { size: 19, weight: 500, color: C.cyan, alpha: jointA });
  ctx.restore();

  // joint callout → cross-section bubble
  if (jointA > 0) {
    const jx = gx + pwid + 5, jy = gy + gh / 2;
    ctx.save(); ctx.globalAlpha = jointA;
    ctx.strokeStyle = hexA(C.accent2, .85); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(jx, jy, 46, 0, 7); ctx.stroke();
    ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(242,239,232,.35)';
    ctx.beginPath(); ctx.moveTo(jx + 46, jy); ctx.lineTo(gx + gw + 74, jy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // bubble: section at 1:1-ish
    const bx = gx + gw + 84, by = jy - 128;
    ctx.save(); ctx.globalAlpha = jointA;
    rrect(ctx, bx, by, 316, 240, 6);
    ctx.fillStyle = 'rgba(10,11,17,.86)'; ctx.fill();
    ctx.strokeStyle = 'rgba(242,239,232,.14)'; ctx.lineWidth = 1; ctx.stroke();
    // two panels + joint + cavity behind
    const py = by + 44, phh = 132;
    panelFace(ctx, bx + 26, py, 118, phh, { tone: 1, light: 1.05 });
    panelFace(ctx, bx + 154, py, 118, phh, { tone: 1, light: 1.05 });
    ctx.fillStyle = hexA(C.accent, .95);
    ctx.fillRect(bx + 26, py, 4, phh); ctx.fillRect(bx + 268, py, 4, phh);
    ctx.fillStyle = 'rgba(127,216,255,.16)';
    ctx.fillRect(bx + 26, py + phh, 246, 20);
    dim(ctx, bx + 144, py + phh + 42, bx + 154, py + phh + 42, '10', { alpha: jointA, size: 14 });
    txt(ctx, 'درز باز ۱۰ م.م', bx + 292, by + 32, { size: 16, weight: 500, color: C.accent2 });
    txt(ctx, 'حفرهٔ تهویه', bx + 292, py + phh + 36, { size: 14, weight: 400, color: C.cyan });
    ctx.restore();
  }

  // ---- table
  const ca = easeOut(inv(t, 1.0, 2.2));
  txt(ctx, 'Z-NOX  ·  SYSTEM', RX, 190, { size: 17, weight: 600, family: 'Inter', ls: 5, color: C.accent, alpha: ca });
  para(ctx, 'سیستم پوستهٔ تهویه‌شده', RX, 248, 560, { size: 40, weight: 700, alpha: ca, lh: 1.35 });

  const rows = [
    ['ابعاد پنل', '۱۶۰۰ × ۳۲۰۰ میلی‌متر'],
    ['ضخامت', '۱۲ میلی‌متر'],
    ['وزن', '~۳۰ کیلوگرم بر متر مربع'],
    ['درز اجرایی', '۱۰ میلی‌متر'],
    ['حفرهٔ تهویه', '۴۰ میلی‌متر'],
    ['زیرسازی', 'آلومینیوم T6063']
  ];
  const tw = 620;
  rows.forEach((r, i) => {
    const a = easeOut(inv(t, 2.0 + i * .2, 3.0 + i * .2));
    const ry = 330 + i * 56;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = i % 2 ? 'rgba(242,239,232,.03)' : 'rgba(242,239,232,.055)';
    rrect(ctx, RX - tw, ry, tw, 50, 3); ctx.fill();
    txt(ctx, r[0], RX - 22, ry + 34, { size: 21, weight: 400, color: C.dim });
    txt(ctx, r[1], RX - 246, ry + 34, { size: 21, weight: 600, color: C.ink });
    ctx.restore();
  });

  caption(ctx, t, {
    tag: '05 — SYSTEM',
    title: 'پوشش روی پنل، پنل روی زیرسازی.',
    sub: 'پنل سرامیکی بتنی دوپ‌شده با کربن اکتیو، با پوشش فتوکاتالیستی؛ اجرای خشک روی زیرسازی آلومینیومی.',
    bottom: H - 88, inAt: 4.6, outAt: S.dur - .2, maxW: 700, size: 50
  });
  vignette(ctx, .45);
}

/* ---------- 07 · BUILD DETAIL ---------- */
function scDetail(ctx, t, S, A) {
  // photo occupies the right third
  ctx.fillStyle = '#07080B'; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath(); ctx.rect(W - 760, 0, 760, H); ctx.clip();
  bgShot(ctx, A.img['plate-install'], t, { zoom: [1.16, 1.06], pan: [22, 0], dark: .38, tint: 'rgba(10,14,30,.4)' });
  ctx.restore();
  const fade = ctx.createLinearGradient(W - 900, 0, W - 700, 0);
  fade.addColorStop(0, 'rgba(7,8,11,1)'); fade.addColorStop(1, 'rgba(7,8,11,0)');
  ctx.fillStyle = fade; ctx.fillRect(W - 900, 0, 200, H);
  grid(ctx, { step: 64, color: 'rgba(242,239,232,.022)' });

  const ax = 250, ay = 250, aw = 300, ah = 470;

  const build = easeOut(inv(t, .5, 2.0));
  ctx.save(); ctx.globalAlpha = build;

  // wall
  ctx.fillStyle = 'rgba(140,138,132,.22)';
  ctx.fillRect(ax, ay, 92, ah);
  hatch(ctx, ax, ay, 92, ah, 'rgba(200,198,190,.18)', 15);
  txt(ctx, 'دیوار', ax + 46, ay - 16, { size: 16, weight: 400, color: C.faint, align: 'center' });

  // brackets
  for (let i = 0; i < 3; i++) {
    const by = ay + 70 + i * 160;
    ctx.fillStyle = 'rgba(190,192,198,.8)';
    ctx.fillRect(ax + 92, by, 66, 10);
    ctx.fillStyle = 'rgba(120,122,128,.95)';
    ctx.fillRect(ax + 150, by - 18, 10, 46);
    ctx.beginPath(); ctx.arc(ax + 108, by + 5, 4, 0, 7); ctx.fillStyle = '#26282d'; ctx.fill();
  }
  // rail
  ctx.fillStyle = 'rgba(160,164,172,.55)';
  ctx.fillRect(ax + 160, ay + 8, 26, ah - 16);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.fillRect(ax + 160, ay + 8, 6, ah - 16);
  // cavity
  ctx.fillStyle = 'rgba(127,216,255,.10)';
  ctx.fillRect(ax + 186, ay + 8, 58, ah - 16);
  for (let i = 0; i < 5; i++) {
    const p = (t * .3 + i * .2) % 1;
    const yy = ay + 30 + p * (ah - 100);
    ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * .85;
    arrow(ctx, ax + 200, yy, ax + 200, yy + 40, { color: hexA(C.cyan, .9), width: 1.5, head: 6 });
    ctx.restore();
  }
  // panel + coating layer
  const pnl = easeOut(inv(t, 1.8, 3.0));
  ctx.save();
  ctx.translate((1 - pnl) * 46, 0);
  panelFace(ctx, ax + 250, ay + 8, 42, ah - 16, { tone: 2, light: 1.02, gloss: .6 });
  // carbon doping speckle inside the panel
  const pr = mulberry(17);
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = `rgba(16,16,18,${.2 + pr() * .4})`;
    ctx.fillRect(ax + 252 + pr() * 38, ay + 12 + pr() * (ah - 24), 1 + pr() * 1.6, 1 + pr() * 1.6);
  }
  // photocatalytic coating (the product)
  ctx.fillStyle = hexA(C.accent, .95);
  ctx.fillRect(ax + 244, ay + 8, 6, ah - 16);
  ctx.restore();
  ctx.restore();

  // numbered markers on the drawing
  const markA = easeOut(inv(t, 3.0, 3.8));
  const marks = [
    { n: 1, x: ax + 247, y: ay + 80 },
    { n: 2, x: ax + 214, y: ay + 240 },
    { n: 3, x: ax + 170, y: ay + 390 },
    { n: 4, x: ax + 240, y: ay + 460 }
  ];
  marks.forEach(m => {
    ctx.save(); ctx.globalAlpha = markA;
    ctx.beginPath(); ctx.arc(m.x, m.y, 13, 0, 7);
    ctx.fillStyle = 'rgba(8,9,12,.9)'; ctx.fill();
    ctx.strokeStyle = hexA(C.accent, .8); ctx.lineWidth = 1.2; ctx.stroke();
    txt(ctx, String(m.n), m.x, m.y + 5, { size: 14, weight: 700, family: 'Inter', color: C.ink, align: 'center' });
    ctx.restore();
  });

  // legend column
  const lg = easeOut(inv(t, 3.4, 4.4));
  if (lg > 0) {
    const lx = 660;
    txt(ctx, 'جزئیات مقطع', lx + 250, ay - 16, { size: 18, weight: 500, color: C.dim, alpha: lg });
    const items = [
      ['پوشش فتوکاتالیستی', 'PHOTOCATALYTIC COATING'],
      ['پنل سرامیکی بتنی', 'CERAMIC CONCRETE PANEL'],
      ['حفرهٔ تهویه ۴۰ میلی‌متر', 'VENTILATED CAVITY 40 mm'],
      ['ریل و براکت آلومینیومی', 'ALUMINIUM RAIL & BRACKET'],
      ['درز باز ۱۰ میلی‌متر', 'OPEN JOINT 10 mm']
    ];
    items.forEach((it, i) => {
      const a = easeOut(inv(t, 3.6 + i * .3, 4.6 + i * .3)) * lg;
      const y = ay + 26 + i * 98;
      ctx.save(); ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(lx + 236, y, 13, 0, 7);
      ctx.strokeStyle = 'rgba(242,239,232,.3)'; ctx.lineWidth = 1; ctx.stroke();
      txt(ctx, String(i + 1), lx + 236, y + 5, { size: 13, weight: 700, family: 'Inter', color: C.dim, align: 'center' });
      ctx.restore();
      txt(ctx, it[0], lx + 210, y + 6, { size: 21, weight: 500, color: C.ink, alpha: a });
      txt(ctx, it[1], lx + 210, y + 30, { size: 11, weight: 500, family: 'Inter', color: C.faint, ls: 2, alpha: a * .9 });
    });
  }

  // sequence
  const st = easeOut(inv(t, 6.4, 7.4));
  if (st > 0) {
    const sw = 190, sy = 800, sx0 = 840;
    txt(ctx, 'توالی اجرا', sx0 + 250, sy - 54, { size: 21, weight: 600, alpha: st, color: C.dim });
    ['نشانه‌گذاری', 'نصب براکت', 'تراز ریل', 'کلیپس پنل'].forEach((s, i) => {
      const a = easeOut(inv(t, 6.6 + i * .32, 7.6 + i * .32));
      const x = sx0 + 236 - i * sw;
      ctx.save(); ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(x, sy, 16, 0, 7);
      ctx.fillStyle = i === 0 ? hexA(C.accent, .95) : 'rgba(242,239,232,.08)'; ctx.fill();
      ctx.strokeStyle = 'rgba(242,239,232,.24)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      txt(ctx, fmtFa(i + 1), x, sy + 6, { size: 15, weight: 700, family: 'Inter', color: i === 0 ? '#0b0a14' : C.dim, align: 'center', alpha: a });
      txt(ctx, s, x, sy + 46, { size: 17, weight: 400, color: C.dim, align: 'center', alpha: a });
      if (i < 3) {
        ctx.fillStyle = 'rgba(242,239,232,.14)';
        ctx.fillRect(x - sw + 22, sy - 1, sw - 60, 1);
      }
    });
  }

  // replaceability card (over the photo)
  const rp = easeOut(inv(t, 8.8, 10.0));
  if (rp > 0) {
    ctx.save(); ctx.globalAlpha = rp;
    const bx = W - 720, by = 150;
    rrect(ctx, bx, by, 560, 120, 6);
    ctx.fillStyle = 'rgba(8,9,13,.78)'; ctx.fill();
    ctx.strokeStyle = hexA(C.accent, .45); ctx.lineWidth = 1.2; ctx.stroke();
    txt(ctx, 'هر پنل، مستقل', bx + 530, by + 52, { size: 25, weight: 600 });
    txt(ctx, 'تعویض با کلیپس، بدون تخریب', bx + 530, by + 88, { size: 18, weight: 400, color: C.dim });
    ctx.restore();
  }

  caption(ctx, t, {
    tag: '06 — BUILD DETAIL',
    title: 'جزئیاتی که اجرا را ساده می‌کند.',
    sub: 'زیرسازی آلومینیومی، کلیپس مخفی و درز باز؛ پوسته نفس می‌کشد و قابل تعمیر است.',
    bottom: H - 120, inAt: 1.2, outAt: S.dur - .2, maxW: 700, size: 46
  });
  vignette(ctx, .5);
}

function hatch(ctx, x, y, w, h, color, step = 14) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -h; i < w; i += step) { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); }
  ctx.stroke();
  ctx.restore();
}

/* ---------- 08 · SPECS & CONTACT ---------- */
function scClose(ctx, t, S, A) {
  bgShot(ctx, A.img['plate-night'], t, { zoom: [1.05, 1.14], pan: [-10, -10], dark: .68, tint: 'rgba(20,14,44,.55)' });
  const scrim = ctx.createLinearGradient(0, 0, W * .55, 0);
  scrim.addColorStop(0, 'rgba(7,8,11,.55)'); scrim.addColorStop(1, 'rgba(7,8,11,0)');
  ctx.fillStyle = scrim; ctx.fillRect(0, 0, W * .55, H);

  const head = easeOut(inv(t, .3, 1.6));
  txt(ctx, 'SPECIFICATION', RX, 160, { size: 17, weight: 600, family: 'Inter', ls: 6, color: C.accent, alpha: head });
  txt(ctx, 'مشخصات فنی', RX, 222, { size: 50, weight: 700, alpha: head });

  const rowW = 620;
  SPEC.specs.forEach((r, i) => {
    const a = easeOut(inv(t, .9 + i * .14, 1.9 + i * .14));
    const y = 300 + i * 66;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = i % 2 ? 'rgba(242,239,232,.03)' : 'rgba(242,239,232,.055)';
    rrect(ctx, RX - rowW, y - 26, rowW, 54, 3); ctx.fill();
    txt(ctx, r[0], RX - 22, y + 10, { size: 20, weight: 400, color: C.dim });
    txt(ctx, r[1], RX - 250, y + 10, { size: 21, weight: 600, color: C.ink });
    ctx.restore();
  });

  // big figures (left)
  const nums = [
    { v: 'نور مرئی', l: 'فعال‌سازی پوشش', en: 'VISIBLE-LIGHT ACTIVE' },
    { v: 'CO₂', l: 'جذب با کربن اکتیو', en: 'CO₂ CAPTURE' },
    { v: 'O₂', l: 'آزادسازی اکسیژن', en: 'OXYGEN RELEASE' }
  ];
  nums.forEach((n, i) => {
    const a = easeOut(inv(t, 4.2 + i * .35, 5.4 + i * .35));
    const y = 330 + i * 168;
    ctx.save(); ctx.globalAlpha = a;
    txt(ctx, n.v, 520, y, { size: 54, weight: 700, color: i === 2 ? C.ok : C.ink });
    txt(ctx, n.l, 520, y + 46, { size: 22, weight: 400, color: C.dim });
    txt(ctx, n.en, 520, y + 74, { size: 11, weight: 500, family: 'Inter', ls: 3, color: C.faint });
    ctx.restore();
    ctx.fillStyle = 'rgba(242,239,232,.10)';
    ctx.fillRect(200, y + 104, 320, 1);
  });

  // ---- end card
  const end = inv(t, 9.4, 11.0);
  if (end > 0) {
    ctx.fillStyle = `rgba(6,7,10,${.94 * end})`;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = end;
    glowAt(ctx, W / 2, H * .42, 640, C.glow, .22);

    const wmSize = 92;
    const wmW = measure(ctx, 'Z-NOX', wmSize, 700, 'Inter', 12);
    const blockW = 112 + wmW;
    const bx = W / 2 - blockW / 2;
    logo(ctx, bx + 32, H * .40, 70);
    txt(ctx, 'Z-NOX', bx + 112, H * .40 + 8, { size: wmSize, weight: 700, family: 'Inter', align: 'left', ls: 12 });

    const a2 = easeOut(inv(t, 10.4, 11.6));
    txt(ctx, FILM.brandFa + '  ·  فتوکاتالیست نانوساختار', W / 2, H * .40 + 116, { size: 31, weight: 500, align: 'center', alpha: a2, color: C.accent2 });
    tick(ctx, W / 2 - 190, H * .40 + 162, 380, a2, 'rgba(242,239,232,.18)');
    txt(ctx, 'پوستهٔ ساختمان، به‌عنوان سیستم تصفیهٔ هوا', W / 2, H * .40 + 216, { size: 34, weight: 300, align: 'center', alpha: a2 });
    txt(ctx, 'فعال با نور مرئی  ·  جذب CO₂  ·  آزادسازی اکسیژن', W / 2, H * .40 + 258, { size: 20, weight: 400, align: 'center', color: C.ok, alpha: a2 });

    const a3 = easeOut(inv(t, 11.6, 12.8));
    txt(ctx, FILM.url, W / 2, H * .40 + 302, { size: 23, weight: 500, family: 'Inter', align: 'center', ls: 4, alpha: a3, color: C.dim });
    txt(ctx, 'CATALOGUE  ·  VOL. 01  ·  2026', W / 2, H - 110, { size: 12, weight: 500, family: 'Inter', align: 'center', ls: 5, alpha: a3 * .8, color: C.faint });
    ctx.restore();
  }

  if (end < .2) {
    caption(ctx, t, {
      tag: '07 — SPECIFICATION',
      title: 'چهار چیز که این پوشش را متفاوت می‌کند.',
      bottom: H - 96, inAt: .6, outAt: 8.4, maxW: 700, size: 54
    });
  }
  vignette(ctx, .55);
}

/* brand sting at the head of the film (uses the motion-logo) */
function scLogoSting(ctx, t, S, A) {
  const k = clamp(t / (S.dur - .1)) * LOGO.dur;
  logoScene(ctx, k, S, A);
}

const SCENE_FN = {
  logosting: scLogoSting,
  intro: scIntro, problem: scProblem, product: scProduct, tech: scTech,
  water: scWater, system: scSystem, detail: scDetail, close: scClose
};
