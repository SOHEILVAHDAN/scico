/**
 * Boots the built single-file deliverable in jsdom exactly as a browser would
 * — executing its inlined script — and asserts the page actually renders.
 *
 * This catches the failure modes a static check cannot: a corrupted inline
 * script, a mount point that does not exist yet, or an asset that was left as
 * an external reference.
 *
 * Usage: npm run verify:single   (after `npm run build:single`)
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../sahi-studio.html', import.meta.url), 'utf8');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push(e.message));
vc.on('error', (m) => errors.push(String(m)));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  url: 'https://sahi.archi/',
  resources: undefined,           // don't fetch external fonts
});

// jsdom lacks these; the real browser has them.
dom.window.matchMedia = dom.window.matchMedia || (() => ({ matches:false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }));
dom.window.SVGElement.prototype.getTotalLength = () => 100;

await new Promise((r) => setTimeout(r, 1500));

const doc = dom.window.document;
const root = doc.getElementById('root');
const text = root?.textContent ?? '';

const checks = {
  'root is populated':            (root?.children.length ?? 0) > 0,
  'hero statement rendered':      text.includes('is an argument'),
  'all four projects rendered':   ['Courtyard House','Stone Library','Terraced Offices','Desert Pavilion'].every(p => text.includes(p)),
  'process rendered':             text.includes('Reading the site'),
  'awards rendered':              text.includes('Aga Khan'),
  'contact rendered':             text.includes('studio@sahi.archi'),
  'drawings present':             doc.querySelectorAll('svg path, svg line, svg circle').length > 400,
  'styles inlined':               doc.querySelectorAll('style').length > 0 && doc.querySelector('style').textContent.includes('--paper'),
  'no external script/css tags':  doc.querySelectorAll('script[src], link[rel="stylesheet"]').length === 0,
  'language toggle present':      Boolean(doc.querySelector('.lang-toggle')),
};

let bad = 0;
for (const [k,v] of Object.entries(checks)) { console.log((v ? '  ✓ ' : '  ✗ ') + k); if (!v) bad++; }
console.log('\n  strokes:', doc.querySelectorAll('svg path, svg line, svg circle').length);
if (errors.length) { console.log('\n  JS errors:'); errors.slice(0,5).forEach(e => console.log('   ', e.split('\n')[0])); bad += errors.length; }
process.exit(bad ? 1 : 0);
