/**
 * Node ESM loader used by the smoke test. It does two things:
 *
 *  1. transpiles .jsx sources on the fly with esbuild, and
 *  2. replaces the animation layer (GSAP, ScrollTrigger, Lenis) with inert
 *     stubs so the React DOM tree can render and be asserted in jsdom.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const STUB_SPECIFIERS = new Set(['gsap', '@gsap/react', 'lenis', '@emailjs/browser']);

const isStubbed = (specifier) =>
  STUB_SPECIFIERS.has(specifier) || [...STUB_SPECIFIERS].some((s) => specifier.startsWith(`${s}/`));

const STUB_SOURCE = `
const noop = () => {};

/** A chainable no-op that stands in for a GSAP timeline. */
const makeTimeline = () => {
  const tl = {};
  ['to', 'from', 'fromTo', 'set', 'add', 'call', 'kill', 'pause', 'play', 'progress', 'reverse'].forEach((m) => {
    tl[m] = () => tl;
  });
  return tl;
};

const utils = {
  toArray: (target) => {
    if (Array.isArray(target)) return target;
    if (typeof target === 'string') {
      return typeof document !== 'undefined' ? Array.from(document.querySelectorAll(target)) : [];
    }
    if (target && typeof target.length === 'number') return Array.from(target);
    return target ? [target] : [];
  },
};

const gsap = {
  registerPlugin: noop,
  timeline: makeTimeline,
  to: makeTimeline,
  from: makeTimeline,
  fromTo: makeTimeline,
  set: noop,
  utils,
  ticker: { add: noop, remove: noop, lagSmoothing: noop },
  config: noop,
  defaults: noop,
};

export const ScrollTrigger = {
  create: () => ({ kill: noop }),
  update: noop,
  refresh: noop,
  killAll: noop,
  getAll: () => [],
  registerPlugin: noop,
};

/** useGSAP runs its callback once so any imperative setup still executes. */
export const useGSAP = (fn) => {
  try {
    fn?.({ selector: utils.toArray });
  } catch {
    /* animation targets may not exist in jsdom */
  }
};

export const send = () => Promise.resolve({ status: 200 });

class Lenis {
  constructor() {
    this.raf = noop;
    this.on = noop;
    this.destroy = noop;
    this.scrollTo = noop;
  }
}

export { gsap, Lenis };

/*
 * gsap and lenis are both default exports in the real packages, so the default
 * is chosen per specifier: the loader appends ?name= to the stub URL.
 */
const requested = decodeURIComponent(new URL(import.meta.url).searchParams.get('name') || '');
export default requested === 'lenis' ? Lenis : gsap;
`;

/**
 * Stubs are addressed with a real file URL plus a marker query, so Node's
 * package-scope lookup still resolves relative imports from the stub source.
 */
const STUB_MARKER = '?anim-stub=1';
const STUB_BASE = new URL('./stub-loader.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (isStubbed(specifier)) {
    return {
      url: `${STUB_BASE}${STUB_MARKER}&name=${encodeURIComponent(specifier)}`,
      shortCircuit: true,
      format: 'module',
    };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.includes(STUB_MARKER)) {
    return { format: 'module', source: STUB_SOURCE, shortCircuit: true };
  }

  if (url.endsWith('.jsx')) {
    const source = await readFile(fileURLToPath(url), 'utf8');
    const { code } = await transform(source, {
      loader: 'jsx',
      format: 'esm',
      jsx: 'automatic',
      target: 'node20',
      sourcefile: url,
    });
    return { format: 'module', source: code, shortCircuit: true };
  }

  return nextLoad(url, context);
}
