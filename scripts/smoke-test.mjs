/**
 * Headless smoke test: mounts the real React tree in jsdom, flips the language
 * switch and asserts the copy, <html dir>, and localStorage persistence.
 *
 * GSAP/ScrollTrigger and Lenis are stubbed — this verifies the DOM layer and
 * the i18n wiring, not the animation timings.
 *
 * Usage: npm run test
 */
import { JSDOM } from 'jsdom';
import { register } from 'node:module';

/* --- jsdom globals must exist before React DOM is imported --- */
const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
  url: 'https://sahi.archi/',
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
// Node 22 defines `navigator` as a getter-only global, so redefine it outright.
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.SVGElement = dom.window.SVGElement;
globalThis.Node = dom.window.Node;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.matchMedia =
  dom.window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));
dom.window.matchMedia = globalThis.matchMedia;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no layout engine, so SVG geometry APIs need stubbing.
dom.window.SVGElement.prototype.getTotalLength = function getTotalLength() {
  return 100;
};

register('./stub-loader.mjs', import.meta.url);

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

const body = () => document.body.innerHTML;
const htmlEl = document.documentElement;

console.log('\nEnglish (default)');
check('renders the hero statement', body().includes('is an argument'));
check('renders the studio name', body().includes('Sahi'));
check('renders the nav', body().includes('>Process<'));
check('renders a project title', body().includes('Courtyard House'));
check('renders a project thesis', body().includes('six-lane road'));
check('renders the process steps', body().includes('Reading the site'));
check('renders the studio credentials', body().includes('Architects'));
check('renders an award', body().includes('Memar Award'));
check('<html lang> is "en"', htmlEl.lang === 'en', `got "${htmlEl.lang}"`);
check('<html dir> is "ltr"', htmlEl.dir === 'ltr', `got "${htmlEl.dir}"`);
check('document title is branded', document.title.includes('Sahi Studio'), `got "${document.title}"`);
check('no leftover upstream branding', !body().includes('Adrian') && !body().includes('jsmastery'));

console.log('\nArchitectural drawings');
const svgs = document.querySelectorAll('.sketch-frame svg, .hero-sketch svg, .process-frame_layer svg');
check('sketches are rendered as inline SVG', svgs.length >= 6, `found ${svgs.length}`);

const allPaths = document.querySelectorAll('svg path, svg line, svg circle');
check('drawings contain many strokes to animate', allPaths.length > 200, `found ${allPaths.length}`);

const layers = ['.sk-grid', '.sk-walls', '.sk-openings', '.sk-dims'];
layers.forEach((layer) => {
  check(`drawing layer ${layer} is present`, document.querySelectorAll(layer).length > 0);
});

/* --- flip the language switch --- */
const toggle = container.querySelector('.lang-toggle');
check('language toggle is rendered', Boolean(toggle));

await act(async () => {
  toggle.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
});

console.log('\nPersian (after toggle)');
check('renders the Persian hero statement', body().includes('یک استدلال است'));
check('renders the Persian studio name', body().includes('سَهی'));
check('renders Persian nav links', body().includes('فرآیند'));
check('renders a Persian project title', body().includes('خانه‌ی حیاط‌دار'));
check('renders Persian process copy', body().includes('خواندن سایت'));
check('<html lang> is "fa"', htmlEl.lang === 'fa', `got "${htmlEl.lang}"`);
check('<html dir> flips to "rtl"', htmlEl.dir === 'rtl', `got "${htmlEl.dir}"`);
check('lang-fa class applied for the Persian font', htmlEl.classList.contains('lang-fa'));
check('Persian document title', document.title.includes('استودیو سَهی'), `got "${document.title}"`);
check('choice persisted to localStorage', window.localStorage.getItem('sahi-studio-lang') === 'fa');
check('email stays LTR-safe', body().includes('studio@sahi.archi'));
check('drawings survive the language switch', document.querySelectorAll('svg path').length > 100);
check('Persian numerals used in figures', body().includes('۴۸'));
check('Persian award list', body().includes('جایزه معمار'));
check('Persian address', body().includes('زعفرانیه'));
check('drawing sheet codes stay latin', body().includes('A-101'));
check('email input forced LTR', Boolean(container.querySelector('input[type="email"][dir="ltr"]')));

/* --- and back again --- */
await act(async () => {
  container.querySelector('.lang-toggle').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
});

console.log('\nBack to English');
check('hero copy switches back', body().includes('is an argument'));
check('<html dir> back to "ltr"', htmlEl.dir === 'ltr', `got "${htmlEl.dir}"`);
check('lang-fa class removed', !htmlEl.classList.contains('lang-fa'));

console.log('');
if (failures) {
  console.error(`${failures} check(s) failed.\n`);
  process.exit(1);
}
console.log('Smoke test passed.\n');
process.exit(0);
