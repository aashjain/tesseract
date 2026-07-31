/**
 * Approved AG Designs monogram geometry.
 *
 * SOURCE OF TRUTH: `public/brand/source/ag-logo.svg` (viewBox "0 0 3750 3750").
 * The untouched original SVG and the 5000x5000 transparent PNG reference are
 * committed under `public/brand/source/` and must never be edited.
 *
 * The path strings below are copied verbatim from that file. They are the only
 * permitted geometry source for every A and G moment in the narrative.
 *
 * DO NOT:
 *   - edit coordinates, redraw corners or regularise the G curve
 *   - replace either glyph with a typeface character
 *   - skew, stretch, mirror or arbitrarily rotate the marks
 *   - apply unapproved gradients or textures to the final lockup
 *
 * A shallow extrusion / conservative bevel is permitted only while the
 * front-facing silhouette stays pixel-faithful to this data.
 */

/** viewBox of the approved source SVG. */
export const AG_VIEWBOX = { x: 0, y: 0, width: 3750, height: 3750 } as const;

/** Approved right-hand G glyph (listed first in the source SVG). */
export const AG_PATH_G =
  'M3076.49,803.83l.13,1075.26c-10.49,188.38-64.87,370.61-162.57,531.28-191.78,315.38-539.06,525.51-911.16,535.81v-44.85c26.52-8.81,53.84-24.86,78.27-39.12,316.75-184.91,525.84-517.63,552.15-885.65,2.6-36.36.73-73.56,5.3-109.46h-625.17V803.83h1063.06Z';

/** Approved left-hand A glyph (listed second in the source SVG). */
export const AG_PATH_A =
  'M673.39,803.83h1039.32v992.02H673.39v-992.02ZM1464.75,1043.92h-548.68v519.76h548.68v-519.76Z';

/**
 * The small curved `designs` wordmark detail from the second group of the
 * source SVG. It is rendered from the untouched file rather than re-declared
 * here, and is hidden only via the documented monogram-only responsive variant.
 */
export const AG_SOURCE_SVG = '/brand/source/ag-logo.svg';
export const AG_SOURCE_PNG = '/brand/source/ag-logo-transparent.png';

/**
 * Documented pivots, in source-SVG user units, for the isolated glyph groups.
 * Derived from the bounding boxes of the two approved paths above (measured by
 * `scripts/derive-brand.mjs`, not estimated). Scene groups use these so the A
 * and G keep a stable, shared origin across every scene.
 */
export const AG_GLYPH_BOUNDS = {
  a: { minX: 673.39, minY: 803.83, maxX: 1712.71, maxY: 1795.85 },
  g: { minX: 2002.89, minY: 803.83, maxX: 3076.62, maxY: 2946.18 },
} as const;

export type AgGlyphKey = keyof typeof AG_GLYPH_BOUNDS;

/** Centre of a glyph in source-SVG user units. */
export function glyphCentre(key: AgGlyphKey): { x: number; y: number } {
  const b = AG_GLYPH_BOUNDS[key];
  return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
}

/** Largest dimension of a glyph in source-SVG user units, used for normalising scale. */
export function glyphExtent(key: AgGlyphKey): number {
  const b = AG_GLYPH_BOUNDS[key];
  return Math.max(b.maxX - b.minX, b.maxY - b.minY);
}

/**
 * The A's counter-space — the rectangular hole in the approved left-hand glyph.
 * This is the literal passage the camera flies through in Scene 2. Values are
 * read directly from the second sub-path of `AG_PATH_A`.
 */
export const AG_APERTURE_COUNTER = {
  minX: 916.07,
  minY: 1043.92,
  maxX: 1464.75,
  maxY: 1563.68,
} as const;
