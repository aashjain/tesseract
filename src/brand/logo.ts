/**
 * AG Designs Studio — approved brand geometry.
 *
 * These path strings are copied verbatim from `public/brand/source/ag-logo.svg`.
 * Do NOT edit the coordinates, redraw corners, regularise curves, replace either
 * path with typography, or change relative proportions. The source SVG lists the
 * G glyph first and the A glyph second.
 *
 * Any derived 3D geometry must keep the front-facing silhouette pixel-faithful
 * to these paths. Verify against `public/brand/source/ag-logo-transparent.png`.
 */

/** Square viewBox of the approved source SVG. */
export const AG_VIEWBOX = "0 0 3750 3750" as const;
export const AG_VIEWBOX_SIZE = 3750 as const;

/** Approved right-hand G glyph. Gravity / the completed orbit. */
export const AG_GLYPH_G =
  "M3076.49,803.83l.13,1075.26c-10.49,188.38-64.87,370.61-162.57,531.28-191.78,315.38-539.06,525.51-911.16,535.81v-44.85c26.52-8.81,53.84-24.86,78.27-39.12,316.75-184.91,525.84-517.63,552.15-885.65,2.6-36.36.73-73.56,5.3-109.46h-625.17V803.83h1063.06Z";

/** Approved left-hand A glyph. The aperture — its counter-space is the passage. */
export const AG_GLYPH_A =
  "M673.39,803.83h1039.32v992.02H673.39v-992.02ZM1464.75,1043.92h-548.68v519.76h548.68v-519.76Z";

/**
 * Bounding boxes in viewBox units, measured from the path data above by
 * flattening the bezier segments. Note the G's left edge (2002.89) comes from
 * the lower curve, not from the straight `h-625.17` bar.
 * Used to place and pivot derived 3D geometry consistently across scenes.
 */
export const AG_GLYPH_BOUNDS = {
  a: { x: 673.39, y: 803.83, width: 1039.32, height: 992.02 },
  g: { x: 2002.89, y: 803.83, width: 1073.73, height: 2142.35 },
  /** The A counter-space — this rectangle is the literal doorway in Scene 2. */
  aperture: { x: 916.07, y: 1043.92, width: 548.68, height: 519.76 },
} as const;

/** Centre of the A counter-space in viewBox units. Camera aims here in Scene 2. */
export const AG_APERTURE_CENTRE = {
  x: AG_GLYPH_BOUNDS.aperture.x + AG_GLYPH_BOUNDS.aperture.width / 2,
  y: AG_GLYPH_BOUNDS.aperture.y + AG_GLYPH_BOUNDS.aperture.height / 2,
} as const;

/**
 * Converts a viewBox coordinate to a centred, Y-up unit-scale coordinate
 * suitable for three.js. The SVG is Y-down and origin top-left.
 */
export function viewBoxToWorld(x: number, y: number, scale = 1) {
  const half = AG_VIEWBOX_SIZE / 2;
  return {
    x: ((x - half) / AG_VIEWBOX_SIZE) * scale,
    y: (-(y - half) / AG_VIEWBOX_SIZE) * scale,
  };
}
