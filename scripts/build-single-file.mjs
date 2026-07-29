/**
 * Bundles the production build into one self-contained .html file.
 *
 * Vite emits index.html plus separate JS/CSS assets; this inlines all of them
 * (and the favicon, as a data URI) so the result can be opened straight from
 * disk, emailed, or dropped on any host without a build step.
 *
 * Usage: npm run build:single   (runs `vite build` first)
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const outFile = resolve(root, 'sahi-studio.html');

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('\n  dist/index.html not found — run `npm run build` first.\n');
  process.exit(1);
}

let html = readFileSync(resolve(dist, 'index.html'), 'utf8');

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

/** Read an emitted asset by its absolute-from-root URL (e.g. /assets/x.png). */
const readAsset = (url) => readFileSync(resolve(dist, url.replace(/^\//, '')));

/* ------------------------------------------------------------------ *
 * 1. inline the stylesheet
 * ------------------------------------------------------------------ */
html = html.replace(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_match, href) => {
  const css = readAsset(href).toString('utf8');
  return `<style>\n${css}\n</style>`;
});

/* ------------------------------------------------------------------ *
 * 2. inline the script
 *
 * Vite emits `type="module"`, but browsers refuse to run module scripts from
 * a file:// URL under the module CORS rules — which would make the deliverable
 * blank when opened by double-clicking it. The bundle is checked for ESM-only
 * syntax; when there is none (the usual case for an IIFE-shaped chunk) it is
 * emitted as a classic script so the file works from disk as well as a server.
 *
 * A literal </script> inside the bundle would close the tag early, so the
 * sequence is broken up. `<!--` is escaped for the same reason.
 * ------------------------------------------------------------------ */
let usedModuleFallback = false;
let inlinedScript = '';

html = html.replace(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (_match, before, src, after) => {
  const raw = readAsset(src).toString('utf8');

  const needsModule =
    /(^|\n)\s*import\s*[{'"*]/.test(raw) || /(^|\n)\s*export[\s{]/.test(raw) || /import\s*\.\s*meta/.test(raw);
  usedModuleFallback = usedModuleFallback || needsModule;

  const attrs = `${before}${after}`.replace(/\s*type="module"\s*/, ' ').replace(/\s*crossorigin\s*/, ' ').trim();
  const typeAttr = needsModule ? 'type="module"' : '';
  const js = raw.replaceAll('</script', '<\\/script').replaceAll('<!--', '<\\!--');

  inlinedScript = `<script ${typeAttr} ${attrs}>\n${js}\n</script>`.replace(/\s+>/, '>');
  return ''; // re-inserted at the end of <body> below
});

/*
 * Vite places the tag in <head>, which is safe for a deferred module script but
 * not for a classic one: it would run before #root exists and React would throw
 * "target container is not a DOM element". Moving it to the end of <body>
 * guarantees the mount point is parsed first.
 */
if (inlinedScript) {
  // Anchor on the LAST </body> — GSAP's minified source contains the literal
  // string "</body>", and a plain .replace() would splice the bundle into the
  // middle of it, corrupting the script.
  const close = html.lastIndexOf('</body>');
  html = close === -1 ? `${html}\n${inlinedScript}` : `${html.slice(0, close)}${inlinedScript}\n${html.slice(close)}`;
}

/* ------------------------------------------------------------------ *
 * 3. inline images (favicon, og:image) as data URIs
 * ------------------------------------------------------------------ */
html = html.replace(/(href|content)="(\/assets\/[^"]+\.(?:png|jpe?g|svg|ico))"/g, (match, attr, url) => {
  try {
    const buffer = readAsset(url);
    const mime = MIME[extname(url).toLowerCase()] ?? 'application/octet-stream';
    return `${attr}="data:${mime};base64,${buffer.toString('base64')}"`;
  } catch {
    return match; // asset not emitted — leave the reference alone
  }
});

/* ------------------------------------------------------------------ *
 * 4. verify nothing external is left behind
 * ------------------------------------------------------------------ */
const leftovers = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);

writeFileSync(outFile, html);

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
console.log(`\n  ✓ sahi-studio.html  ${kb(statSync(outFile).size)}`);
console.log('    single file · no build step · opens straight from disk');

if (leftovers.length) {
  console.warn(`\n  ⚠ ${leftovers.length} unresolved local reference(s):`);
  leftovers.forEach((l) => console.warn(`      ${l}`));
} else {
  console.log('    no unresolved local references');
}

if (usedModuleFallback) {
  console.warn('\n  ⚠ the bundle uses ESM syntax, so it stays type="module".');
  console.warn('    Module scripts are blocked on file:// — serve the file over HTTP.');
} else {
  console.log('    runs as a classic script — works from file:// and over HTTP');
}

console.log('\n    Fonts load from Google Fonts when online; system fallbacks apply offline.\n');
