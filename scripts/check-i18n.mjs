/**
 * Static sanity checks that run without a browser:
 *   1. every translation file exposes exactly the same key paths
 *   2. no translated string is left empty
 *   3. every asset path referenced from src/ actually exists in public/
 *
 * Usage: npm run check
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`  ✗ ${msg}`);
};

/* ------------------------------------------------------------------ *
 * 1 + 2. translation parity
 * ------------------------------------------------------------------ */
const { translations } = await import(join(root, 'src/i18n/config.js'));
const codes = Object.keys(translations);

const keyPaths = (value, prefix = '') => {
  if (Array.isArray(value)) return value.flatMap((item, i) => keyPaths(item, `${prefix}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
};

console.log(`\ni18n parity (${codes.join(', ')})`);

const [base, ...others] = codes;
const baseKeys = keyPaths(translations[base]);

for (const code of others) {
  const keys = keyPaths(translations[code]);
  const missing = baseKeys.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !baseKeys.includes(k));

  missing.forEach((k) => fail(`[${code}] missing key: ${k}`));
  extra.forEach((k) => fail(`[${code}] unexpected key: ${k}`));
}

for (const code of codes) {
  const walk = (value, path = '') => {
    if (Array.isArray(value)) return value.forEach((item, i) => walk(item, `${path}[${i}]`));
    if (value && typeof value === 'object') {
      return Object.entries(value).forEach(([k, v]) => walk(v, path ? `${path}.${k}` : k));
    }
    if (typeof value !== 'string' || value.trim() === '') fail(`[${code}] empty value at ${path}`);
  };
  walk(translations[code]);
}

if (!failures) console.log(`  ✓ ${baseKeys.length} keys match across ${codes.length} languages`);

/* ------------------------------------------------------------------ *
 * 3. referenced public assets exist
 * ------------------------------------------------------------------ */
console.log('\npublic asset references');

const sourceFiles = [];
const collect = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full);
    else if (/\.(jsx?|css|html)$/.test(entry)) sourceFiles.push(full);
  }
};
collect(join(root, 'src'));
sourceFiles.push(join(root, 'index.html'));

const assetRef = /['"(](\/(?:assets|models|textures)\/[A-Za-z0-9._/-]+)['")]/g;
const referenced = new Set();

for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(assetRef)) referenced.add(match[1]);
}

for (const asset of [...referenced].sort()) {
  if (!existsSync(join(root, 'public', asset))) fail(`missing public asset: ${asset}`);
}

if (!failures) console.log(`  ✓ all ${referenced.size} referenced assets exist in public/`);

console.log('');
if (failures) {
  console.error(`${failures} problem(s) found.\n`);
  process.exit(1);
}
console.log('All checks passed.\n');
