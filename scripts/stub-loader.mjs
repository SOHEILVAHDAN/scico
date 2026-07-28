/**
 * Node ESM loader used by the smoke test. It does two things:
 *
 *  1. transpiles .jsx sources on the fly with esbuild, and
 *  2. replaces the WebGL / GLTF layer (three, r3f, drei, globe, gsap) with
 *     inert stubs so the React DOM tree can render and be asserted in jsdom.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const STUB_SPECIFIERS = new Set([
  '@react-three/fiber',
  '@react-three/drei',
  'react-globe.gl',
  'three',
  'three-stdlib',
  'gsap',
  '@gsap/react',
  'leva',
  'maath',
  'maath/easing',
  '@emailjs/browser',
]);

const isStubbed = (specifier) =>
  STUB_SPECIFIERS.has(specifier) || [...STUB_SPECIFIERS].some((s) => specifier.startsWith(`${s}/`));

const STUB_SOURCE = `
import React from 'react';

const noop = () => {};
const proxyTarget = function () {};

/** Any named import resolves to something harmless, callable and writable. */
const makeProxy = (name) => {
  const own = new Map();

  return new Proxy(proxyTarget, {
    get(target, prop) {
      if (prop === 'then') return undefined;
      if (own.has(prop)) return own.get(prop);
      if (prop === Symbol.toPrimitive || prop === 'toString') return () => name;
      return makeProxy(String(prop));
    },
    set(target, prop, value) {
      own.set(prop, value);
      return true;
    },
    has() {
      return true;
    },
    getOwnPropertyDescriptor(target, prop) {
      return { configurable: true, enumerable: true, writable: true, value: own.get(prop) };
    },
    apply() {
      return makeProxy(name);
    },
    construct() {
      return makeProxy(name);
    },
  });
};

/** Components render their children (or nothing) instead of a WebGL context. */
const StubComponent = ({ children }) => React.createElement(React.Fragment, null, children ?? null);

/** Wrap a hook so extras like \`useGLTF.preload()\` are callable too. */
const withStaticMethods = (fn) =>
  new Proxy(fn, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return () => makeProxy(String(prop));
    },
  });

const hooks = {
  useFrame: noop,
  useThree: () => ({ camera: makeProxy('camera'), size: { width: 1024, height: 768 }, viewport: {} }),
  useGLTF: () => ({ nodes: makeProxy('nodes'), materials: makeProxy('materials'), animations: [], scene: makeProxy('scene') }),
  useFBX: () => ({ animations: [makeProxy('clip')] }),
  useAnimations: () => ({ actions: makeProxy('actions') }),
  useVideoTexture: () => makeProxy('texture'),
  useTexture: () => makeProxy('texture'),
  useProgress: () => ({ progress: 0 }),
  useGraph: () => ({ nodes: makeProxy('nodes'), materials: makeProxy('materials') }),
  useGSAP: (fn) => { try { fn?.(); } catch { /* animation targets do not exist in jsdom */ } },
  useCursor: noop,
  useScroll: () => ({ offset: 0 }),
};

/** Capitalised names that are utility namespaces, not React components. */
const NAMESPACES = new Set(['SkeletonUtils', 'MathUtils', 'Vector3', 'Euler', 'Color', 'Clock']);

const handler = {
  get(target, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return StubComponent;
    if (prop in hooks) return withStaticMethods(hooks[prop]);
    if (prop === 'send') return () => Promise.resolve({ status: 200 });
    if (typeof prop === 'string' && NAMESPACES.has(prop)) return makeProxy(prop);
    if (typeof prop === 'string' && /^[A-Z]/.test(prop)) return StubComponent;
    return makeProxy(String(prop));
  },
};

const api = new Proxy({}, handler);

export default StubComponent;
export const {
  Canvas, PerspectiveCamera, OrbitControls, Center, Html, Float, useFrame, useThree, useGLTF, useFBX,
  useAnimations, useVideoTexture, useTexture, useProgress, useGraph, useGSAP, Leva, SkeletonUtils,
} = api;
export { api as gsap };
export const easing = makeProxy('easing');
export const send = () => Promise.resolve({ status: 200 });
`;

/**
 * Stubs are addressed with a real file URL plus a marker query, so Node's
 * package-scope lookup still resolves `react` from inside the stub source.
 */
const STUB_MARKER = '?webgl-stub=1';
const STUB_BASE = new URL('./stub-loader.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (isStubbed(specifier)) {
    return { url: `${STUB_BASE}${STUB_MARKER}&name=${encodeURIComponent(specifier)}`, shortCircuit: true, format: 'module' };
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
