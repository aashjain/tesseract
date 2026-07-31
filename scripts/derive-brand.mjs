/**
 * Derives brand data from the untouched approved source SVG.
 * Run: node scripts/derive-brand.mjs
 * Outputs: src/lib/brand/generated/agLogoMarkup.ts  (verbatim path markup)
 * and prints exact glyph bounding boxes for paths.ts.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';
globalThis.DOMParser = new JSDOM().window.DOMParser;
const { SVGLoader } = await import('three/examples/jsm/loaders/SVGLoader.js');
const { Box2, Vector2 } = await import('three');

const src = readFileSync('public/brand/source/ag-logo.svg', 'utf8');
const loader = new SVGLoader();
const data = loader.parse(src);

// Report bbox per top-level path (source order: G, A, then `designs` details)
data.paths.forEach((p, i) => {
  const box = new Box2();
  for (const sub of p.subPaths) {
    for (const pt of sub.getPoints(200)) box.expandByPoint(new Vector2(pt.x, pt.y));
  }
  if (i < 4) {
    console.log(`path[${i}] bbox`, {
      minX: +box.min.x.toFixed(2), minY: +box.min.y.toFixed(2),
      maxX: +box.max.x.toFixed(2), maxY: +box.max.y.toFixed(2),
    });
  }
});

// Extract the two <g> groups verbatim.
const groups = [...src.matchAll(/<g>([\s\S]*?)<\/g>/g)].map((m) => m[1].trim());
if (groups.length !== 2) throw new Error(`expected 2 groups, found ${groups.length}`);
mkdirSync('src/lib/brand/generated', { recursive: true });
writeFileSync(
  'src/lib/brand/generated/agLogoMarkup.ts',
  `/* GENERATED FILE — do not edit by hand.\n * Produced by scripts/derive-brand.mjs from the untouched approved source SVG\n * at public/brand/source/ag-logo.svg (viewBox 0 0 3750 3750).\n * Group 1: the two monogram glyphs (G then A).\n * Group 2: the small curved \`designs\` wordmark detail.\n */\n\nexport const AG_MONOGRAM_MARKUP = ${JSON.stringify(groups[0])};\n\nexport const AG_DESIGNS_WORDMARK_MARKUP = ${JSON.stringify(groups[1])};\n`,
);
console.log('wrote src/lib/brand/generated/agLogoMarkup.ts');
