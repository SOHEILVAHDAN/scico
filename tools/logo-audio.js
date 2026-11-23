/* =========================================================
   Sound design for the Z-NOX motion logo (5.6s sting)
   beats: rays .15 · hex .2–1.0 · Z build 1.15–2.45
          blade ignition 2.3–3.05 (flash 3.0) · wordmark 3.15
          specular sweep 4.3–5.25 · out 5.6
   out: assets/vo/logo.mp3
   ========================================================= */
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FF = process.env.FFMPEG || 'ffmpeg';
const OUT = path.join(ROOT, 'assets/vo/logo.mp3');
const D = 5.6;

const args = ['-y', '-hide_banner', '-loglevel', 'error'];
// 0 rise · 1 air · 2 sub boom · 3 ignition shimmer · 4 wordmark tick · 5 sweep · 6 tail pad
args.push('-f', 'lavfi', '-t', '3.30', '-i',
  'aevalsrc=0.20*sin(2*PI*(150+300*t*t/(3.3*3.3))*t)*(t/3.3)*(t/3.3)|0.15*sin(2*PI*(225+440*t*t/(3.3*3.3))*t)*(t/3.3)*(t/3.3):s=44100');
args.push('-f', 'lavfi', '-t', D.toFixed(2), '-i', 'anoisesrc=c=pink:a=0.05:r=44100');
args.push('-f', 'lavfi', '-t', '3.4', '-i',
  'aevalsrc=0.62*sin(2*PI*48*t)*exp(-2.4*t)|0.62*sin(2*PI*48*t)*exp(-2.4*t):s=44100');
args.push('-f', 'lavfi', '-t', '2.6', '-i',
  'aevalsrc=0.11*sin(2*PI*932*t)*exp(-3.2*t)+0.08*sin(2*PI*1397*t)*exp(-3.8*t)+0.05*sin(2*PI*1865*t)*exp(-4.4*t):s=44100');
args.push('-f', 'lavfi', '-t', '2.6', '-i',
  'aevalsrc=0.09*sin(2*PI*1760*t)*exp(-9*t)+0.06*sin(2*PI*2640*t)*exp(-11*t):s=44100');
args.push('-f', 'lavfi', '-t', '1.5', '-i',
  'aevalsrc=0.14*sin(2*PI*(2600-900*t)*t)*sin(PI*t/1.5)|0.10*sin(2*PI*(3900-1400*t)*t)*sin(PI*t/1.5):s=44100');
args.push('-f', 'lavfi', '-t', D.toFixed(2), '-i',
  'aevalsrc=0.09*sin(2*PI*110*t)+0.06*sin(2*PI*164.8*t)+0.04*sin(2*PI*220*t):s=44100');

const f = [];
f.push('[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,highpass=f=90,volume=0.9[rise]');
f.push('[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,highpass=f=240,lowpass=f=1800,volume=0.5[air]');
f.push('[2:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=3020|3020,volume=1[boom]');
f.push('[3:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=3060|3060[shim]');
f.push('[4:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=3150|3150[tick]');
f.push('[5:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,adelay=4300|4300,volume=0.85[sweep]');
f.push('[6:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,lowpass=f=320,volume=0.75[pad]');
f.push('[rise][air][boom][shim][tick][sweep][pad]amix=inputs=7:normalize=0:dropout_transition=0[m]');
f.push('[m]acompressor=threshold=0.16:ratio=2.4:attack=8:release=240,alimiter=limit=0.94,loudnorm=I=-15:TP=-1.5:LRA=9[out]');

args.push('-filter_complex', f.join(';'), '-map', '[out]',
  '-t', D.toFixed(2), '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100', OUT);
execFileSync(FF, args, { stdio: 'inherit' });
console.log('logo audio →', OUT);
