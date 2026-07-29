/**
 * Renders each architectural sketch to a standalone SVG in `.sketch-preview/`
 * so the drawings can be reviewed without running the whole site.
 *
 * Usage: npm run sketches
 */
import { register } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

register('./stub-loader.mjs', import.meta.url);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, '.sketch-preview');
mkdirSync(outDir, { recursive: true });

const React = (await import('react')).default;
const { renderToStaticMarkup } = await import('react-dom/server');

const names = ['SketchPlan', 'SketchSection', 'SketchAxo', 'SketchConcept'];

for (const name of names) {
  const mod = await import(resolve(root, `src/components/sketches/${name}.jsx`));
  let svg = renderToStaticMarkup(React.createElement(mod.default, {}));
  svg = svg.replace('<svg ', '<svg style="background:#0B0B0D;color:#8d8b86" width="1000" height="700" ');
  writeFileSync(resolve(outDir, `${name}.svg`), svg);
  console.log(`  ✓ ${name}.svg (${svg.length} bytes)`);
}

console.log(`\nWrote ${names.length} drawings to .sketch-preview/\n`);
