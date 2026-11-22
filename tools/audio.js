/* =========================================================
   Build the soundtrack for the catalogue film:
   · identity sting (sweep + sub boom) at 0–4.6s
   · Persian VO cues placed at their scene offsets
   · low ambient bed + air layer, mixed and limited
   output: assets/vo/vo_full.mp3
   ========================================================= */
const { execFileSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FF = process.env.FFMPEG || 'ffmpeg';
const OUT = path.join(ROOT, 'assets/vo/vo_full.mp3');

/* keep in sync with src/copy.js (dur / voAt per scene) */
const SCENES = [
  { vo: 0, at: 0, dur: 4.6 },     // logo sting — sound synthesised below
  { vo: 1, at: 1.5, dur: 10.8 },
  { vo: 2, at: 0.7, dur: 17.4 },
  { vo: 3, at: 0.6, dur: 18.2 },
  { vo: 4, at: 0.6, dur: 20.4 },
  { vo: 5, at: 0.6, dur: 15.8 },
  { vo: 6, at: 0.6, dur: 18.8 },
  { vo: 7, at: 0.6, dur: 16.6 },
  { vo: 8, at: 0.6, dur: 17.0 }
];
let acc = 0;
const cues = SCENES.map(s => { const c = { ...s, start: acc }; acc += s.dur; return c; });
const TOTAL = acc;
const voiced = cues.filter(c => c.vo > 0);

const args = ['-y', '-hide_banner', '-loglevel', 'error'];
voiced.forEach(c => args.push('-i', path.join(ROOT, `assets/vo/vo${c.vo}.mp3`)));

const nV = voiced.length;
const I_BED = nV, I_SWEEP = nV + 1, I_AIR = nV + 2, I_BOOM = nV + 3, I_SHIM = nV + 4;

// low drone bed (whole film)
args.push('-f', 'lavfi', '-t', TOTAL.toFixed(2), '-i',
  'aevalsrc=0.055*sin(2*PI*55*t)*(0.6+0.4*sin(2*PI*0.06*t))|0.045*sin(2*PI*82.4*t)*(0.5+0.5*sin(2*PI*0.045*t+1)):s=44100');
// logo sweep
args.push('-f', 'lavfi', '-t', '3.55', '-i',
  'aevalsrc=0.16*sin(2*PI*(170+320*t*t)*t)*(t/3.55)|0.12*sin(2*PI*(255+480*t*t)*t)*(t/3.55):s=44100');
// air
args.push('-f', 'lavfi', '-t', TOTAL.toFixed(2), '-i', 'anoisesrc=c=pink:a=0.045:r=44100');
// sub boom
args.push('-f', 'lavfi', '-t', '3.0', '-i',
  'aevalsrc=0.55*sin(2*PI*52*t)*exp(-2.6*t)|0.55*sin(2*PI*52*t)*exp(-2.6*t):s=44100');
// metallic shimmer on the snap
args.push('-f', 'lavfi', '-t', '2.2', '-i',
  'aevalsrc=0.10*sin(2*PI*880*t)*exp(-3.0*t)+0.07*sin(2*PI*1320*t)*exp(-3.6*t):s=44100');

const f = [];
voiced.forEach((c, i) => {
  const ms = Math.round((c.start + c.at) * 1000);
  f.push(`[${i}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.0,adelay=${ms}|${ms}[v${i}]`);
});
f.push(`[${I_BED}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,lowpass=f=220,volume=0.9[bed]`);
f.push(`[${I_SWEEP}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,highpass=f=120,volume=0.9[sweep]`);
f.push(`[${I_AIR}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,highpass=f=200,lowpass=f=1600,volume=0.55[air]`);
// boom triggered at 3.42s
f.push(`[${I_BOOM}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=3420|3420,volume=1.0[boom]`);
f.push(`[${I_SHIM}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=3450|3450,volume=1.0[shim]`);

const mixIn = voiced.map((c, i) => `[v${i}]`).join('') + '[bed][sweep][air][boom][shim]';
f.push(`${mixIn}amix=inputs=${nV + 5}:normalize=0:dropout_transition=0[mix]`);
f.push(`[mix]acompressor=threshold=0.14:ratio=2.6:attack=10:release=260,alimiter=limit=0.94,loudnorm=I=-16:TP=-1.5:LRA=11[out]`);

args.push('-filter_complex', f.join(';'), '-map', '[out]',
  '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100', OUT);

console.log('building audio →', OUT, `(${TOTAL.toFixed(1)}s)`);
execFileSync(FF, args, { stdio: 'inherit' });
console.log('audio ok');
