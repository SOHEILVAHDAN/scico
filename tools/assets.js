/* Export static logo assets: PNG (transparent + dark) and SVG */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets/logo');
fs.mkdirSync(OUT, { recursive: true });

/* ---- SVG: hand-built from the same geometry as src/mark.js ---- */
const S = 1000;
function svgMark({ bg = 'transparent', size = 1000 } = {}) {
  const zPath = 'M286 288 H596 C652 288 680 320 664 366 L330 656 H664';
  const blade = 'M198 706 H604 M716 262 L336 648';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1000 1000" fill="none">
  <defs>
    <linearGradient id="steel" x1="240" y1="250" x2="780" y2="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset=".18" stop-color="#E6E9EC"/>
      <stop offset=".42" stop-color="#A8AEB5"/><stop offset=".58" stop-color="#D6DADE"/>
      <stop offset=".78" stop-color="#7E848B"/><stop offset="1" stop-color="#C9CED3"/>
    </linearGradient>
    <linearGradient id="green" x1="240" y1="720" x2="760" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#B8FF52"/><stop offset=".35" stop-color="#8CE81F"/><stop offset="1" stop-color="#3FA10A"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${bg !== 'transparent' ? `<rect width="1000" height="1000" fill="${bg}"/>` : ''}
  <path d="M500 92 L844 291 L844 689 L500 888 L156 689 L156 291 Z" stroke="#C6CED6" stroke-opacity=".30" stroke-width="7"/>
  <path d="M500 304 L702 406 L702 610 L500 712 L298 610 L298 406 Z" stroke="#D8DEE4" stroke-opacity=".55" stroke-width="5"/>
  <path d="M733 86 A468 468 0 0 1 417 952" stroke="#8CE81F" stroke-width="5" stroke-linecap="round" filter="url(#glow)"/>
  <path d="${zPath}" stroke="#C9CED3" stroke-width="112" stroke-linecap="butt" stroke-linejoin="round"/>
  <path d="${zPath}" stroke="url(#steel)" stroke-width="112" stroke-linecap="butt" stroke-linejoin="round"/>
  <path d="${zPath}" stroke="#FFFFFF" stroke-opacity=".65" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,-52)"/>
  <g filter="url(#glow)">
    <path d="${blade}" stroke="url(#green)" stroke-width="66" stroke-linecap="butt"/>
    <path d="${blade}" stroke="#F0FFD2" stroke-opacity=".55" stroke-width="22" stroke-linecap="butt"/>
  </g>
  <circle cx="417" cy="952" r="8" fill="#F2FFE0"/>
</svg>`;
}

fs.writeFileSync(path.join(OUT, 'znox-mark.svg'), svgMark());
fs.writeFileSync(path.join(OUT, 'znox-mark-dark.svg'), svgMark({ bg: '#07080b' }));

/* lockup SVG: mark + NOX path from src/nox-path.js */
const noxSrc = fs.readFileSync(path.join(ROOT, 'src/nox-path.js'), 'utf8');
const NOX_PATH = noxSrc.match(/const NOX_PATH = "([^"]+)"/)[1];
const lock = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320" fill="none">
  <defs>
    <linearGradient id="steel" x1="240" y1="250" x2="780" y2="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset=".42" stop-color="#A8AEB5"/>
      <stop offset=".6" stop-color="#D6DADE"/><stop offset="1" stop-color="#7E848B"/>
    </linearGradient>
    <linearGradient id="green" x1="240" y1="720" x2="760" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#B8FF52"/><stop offset=".35" stop-color="#8CE81F"/><stop offset="1" stop-color="#3FA10A"/>
    </linearGradient>
  </defs>
  <g transform="translate(10,10) scale(.30)">
    <path d="M500 92 L844 291 L844 689 L500 888 L156 689 L156 291 Z" stroke="#C6CED6" stroke-opacity=".28" stroke-width="7"/>
    <path d="M500 304 L702 406 L702 610 L500 712 L298 610 L298 406 Z" stroke="#D8DEE4" stroke-opacity=".5" stroke-width="5"/>
    <path d="M733 86 A468 468 0 0 1 417 952" stroke="#8CE81F" stroke-width="5"/>
    <path d="M286 288 H596 C652 288 680 320 664 366 L330 656 H664" stroke="url(#steel)" stroke-width="112" stroke-linejoin="round"/>
    <path d="M198 706 H604 M716 262 L336 648" stroke="url(#green)" stroke-width="66"/>
    <path d="M198 706 H604 M716 262 L336 648" stroke="#F0FFD2" stroke-opacity=".5" stroke-width="22"/>
    <circle cx="417" cy="952" r="8" fill="#F2FFE0"/>
  </g>
  <g transform="translate(376,20) scale(.729)" fill="#D7DCE1">
    <path d="${NOX_PATH}"/>
  </g>
  <text x="380" y="268" font-family="Inter, Helvetica, Arial, sans-serif" font-size="13" letter-spacing="5" fill="#8CE81F">PHOTOCATALYTIC CERAMIC SURFACE</text>
</svg>`;
fs.writeFileSync(path.join(OUT, 'znox-lockup.svg'), lock);
console.log('svg assets written');
