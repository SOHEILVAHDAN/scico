/**
 * Headless smoke test: mounts the real React tree in jsdom, flips the language
 * switch and asserts the copy, <html dir>, and localStorage persistence.
 *
 * WebGL <Canvas> subtrees are stubbed out — this verifies the DOM layer only.
 * Usage: npm run test:smoke
 */
import { JSDOM } from 'jsdom';
import { register } from 'node:module';


/* --- jsdom globals must exist before React DOM is imported --- */
const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
  url: 'https://sahistudio.test/',
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
// Node 22 defines `navigator` as a getter-only global, so redefine it outright.
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
});
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.matchMedia =
  dom.window.matchMedia ||
  ((query) => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
dom.window.matchMedia = globalThis.matchMedia;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

register('./stub-loader.mjs', import.meta.url);

/*
 * react-dom does not know r3f's scene primitives (<skinnedMesh>, <meshMatcapMaterial>, …)
 * and complains about their casing and props. That is expected here: the smoke test only
 * asserts the surrounding HTML, so those specific warnings are filtered out.
 */
const R3F_NOISE = [
  'incorrect casing',
  'unrecognized in this browser',
  'Invalid value for prop',
  'Invalid values for props',
  'non-boolean attribute',
  'React does not recognize the',
  'is using incorrect casing',
];
const originalError = console.error;
console.error = (...args) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  if (R3F_NOISE.some((pattern) => first.includes(pattern))) return;
  originalError(...args);
};

const { default: React } = await import('react');
const { createRoot } = await import('react-dom/client');
const { act } = await import('react');
const { default: App } = await import('../src/App.jsx');

let failures = 0;
const check = (label, condition, detail = '') => {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

const container = document.getElementById('root');
const root = createRoot(container);

await act(async () => {
  root.render(React.createElement(App));
});

const html = () => container.innerHTML;
const htmlEl = document.documentElement;

console.log('\nEnglish (default)');
check('renders the English hero tagline', html().includes('We Build Fast, Scalable Web Products'));
check('renders the studio name in the navbar', html().includes('Sahi'));
check('renders English nav links', html().includes('>Contact<'));
check('renders a translated project title', html().includes('Nova'));
check('<html lang> is "en"', htmlEl.lang === 'en', `got "${htmlEl.lang}"`);
check('<html dir> is "ltr"', htmlEl.dir === 'ltr', `got "${htmlEl.dir}"`);
check('document title is branded', document.title.includes('Sahi Studio'), `got "${document.title}"`);
check('no leftover upstream branding', !html().includes('Adrian') && !html().includes('jsmastery'));

/* --- flip the language switch --- */
const toggle = container.querySelector('.lang-toggle');
check('language toggle is rendered', Boolean(toggle));

await act(async () => {
  toggle.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
});

console.log('\nPersian (after toggle)');
check('renders the Persian hero tagline', html().includes('ساخت محصولات وب سریع و مقیاس‌پذیر'));
check('renders the Persian studio name', html().includes('سَهی'));
check('renders Persian nav links', html().includes('نمونه‌کارها'));
check('renders a translated Persian project title', html().includes('نوا'));
check('<html lang> is "fa"', htmlEl.lang === 'fa', `got "${htmlEl.lang}"`);
check('<html dir> flips to "rtl"', htmlEl.dir === 'rtl', `got "${htmlEl.dir}"`);
check('lang-fa class applied for the Persian font', htmlEl.classList.contains('lang-fa'));
check('Persian document title', document.title.includes('استودیو سَهی'), `got "${document.title}"`);
check('choice persisted to localStorage', window.localStorage.getItem('sahi-studio-lang') === 'fa');
check('email stays LTR-safe', html().includes('hello@sahistudio.com'));

/* --- and back again --- */
await act(async () => {
  container.querySelector('.lang-toggle').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
});

console.log('\nBack to English');
check('hero copy switches back', html().includes('We Build Fast, Scalable Web Products'));
check('<html dir> back to "ltr"', htmlEl.dir === 'ltr', `got "${htmlEl.dir}"`);
check('lang-fa class removed', !htmlEl.classList.contains('lang-fa'));

console.log('');
if (failures) {
  console.error(`${failures} check(s) failed.\n`);
  process.exit(1);
}
console.log('Smoke test passed.\n');
process.exit(0);
