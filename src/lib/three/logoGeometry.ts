import {
  BufferGeometry,
  ExtrudeGeometry,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
} from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

import {
  AG_PATH_A,
  AG_PATH_G,
  AG_VIEWBOX,
  glyphCentre,
  glyphExtent,
  type AgGlyphKey,
} from '@/lib/brand/paths';

/**
 * Turns the approved SVG path data into scene geometry.
 *
 * The path strings are passed to Three's SVG parser untouched, so the resulting
 * front silhouette is the supplied artwork — not a redraw, not a typeface, not
 * an approximation. Only three transforms are applied, and all three are
 * silhouette-preserving:
 *
 *   1. translate so the glyph's own bounding-box centre is the origin
 *   2. rotate 180 degrees about X (SVG grows downward, the scene grows upward)
 *   3. uniform scale to a target height
 *
 * Extrusion depth and bevel are deliberately shallow so the face stays flat and
 * pixel-faithful when viewed head-on, as required by the brand rules.
 */

const PATHS: Record<AgGlyphKey, string> = { a: AG_PATH_A, g: AG_PATH_G };

function parseShapes(key: AgGlyphKey): Shape[] {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${AG_VIEWBOX.x} ${AG_VIEWBOX.y} ${AG_VIEWBOX.width} ${AG_VIEWBOX.height}"><path d="${PATHS[key]}"/></svg>`;
  const parsed = new SVGLoader().parse(svg);
  const shapes: Shape[] = [];
  for (const path of parsed.paths) {
    // `toShapes` keeps holes as holes — this is what preserves the A's
    // counter-space, and it is what the camera later flies through.
    shapes.push(...path.toShapes());
  }
  return shapes;
}

const shapeCache = new Map<AgGlyphKey, Shape[]>();

function getShapes(key: AgGlyphKey): Shape[] {
  let shapes = shapeCache.get(key);
  if (!shapes) {
    shapes = parseShapes(key);
    shapeCache.set(key, shapes);
  }
  return shapes;
}

export type GlyphGeometryOptions = {
  /** Target height in world units. Scale is uniform; proportions never change. */
  height: number;
  /** Extrusion depth in world units. Kept shallow. */
  depth?: number;
  bevel?: boolean;
  curveSegments?: number;
};

function normalise(geometry: BufferGeometry, key: AgGlyphKey, height: number): BufferGeometry {
  const centre = glyphCentre(key);
  const scale = height / glyphExtent(key);

  geometry.translate(-centre.x, -centre.y, 0);

  // SVG's Y axis grows downward and the scene's grows upward. Correcting that
  // with a negative Y scale would mirror the geometry, which reverses triangle
  // winding and leaves every normal pointing away from the camera — the mark
  // renders as an unlit silhouette. A half turn about X flips Y *and* Z, so
  // handedness is preserved and the front face stays lit. It also turns the
  // extrusion to run away from the viewer, which is what we want: the flat,
  // pixel-faithful face is the one facing camera.
  geometry.rotateX(Math.PI);
  geometry.scale(scale, scale, scale);

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Flat front face only — used for masks, rims and the mobile variant. */
export function createGlyphFlatGeometry(key: AgGlyphKey, height: number, curveSegments = 24): BufferGeometry {
  const geometry = new ShapeGeometry(getShapes(key), curveSegments);
  return normalise(geometry, key, height);
}

/** Shallow extrusion with a conservative bevel. */
export function createGlyphSolidGeometry(
  key: AgGlyphKey,
  { height, depth = 0.16, bevel = true, curveSegments = 24 }: GlyphGeometryOptions,
): BufferGeometry {
  const extent = glyphExtent(key);
  const scale = height / extent;
  // Convert world-space depth back into source units so the extrusion is
  // applied before the uniform scale.
  const sourceDepth = depth / scale;
  const bevelSize = sourceDepth * 0.12;

  const geometry = new ExtrudeGeometry(getShapes(key), {
    depth: sourceDepth,
    bevelEnabled: bevel,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 2,
    curveSegments,
  });
  return normalise(geometry, key, height);
}

/**
 * Samples points along the glyph outline. Used by Scene 12 to align existing
 * rails and arcs onto the exact approved G silhouette, and by Scene 1 to take
 * cropped fragments of real A angles and G curvature.
 */
export function sampleGlyphOutline(key: AgGlyphKey, height: number, count: number): Vector3[] {
  const shapes = getShapes(key);
  const centre = glyphCentre(key);
  const scale = height / glyphExtent(key);

  // Weight sampling by outline length so long strokes get their share of points.
  const outlines: Vector2[][] = [];
  let totalLength = 0;
  const lengths: number[] = [];

  for (const shape of shapes) {
    const points = shape.getPoints(64);
    let length = 0;
    for (let i = 1; i < points.length; i += 1) {
      length += points[i]!.distanceTo(points[i - 1]!);
    }
    outlines.push(points);
    lengths.push(length);
    totalLength += length;
  }

  const result: Vector3[] = [];
  outlines.forEach((points, index) => {
    const share = totalLength > 0 ? (lengths[index]! / totalLength) : 1 / outlines.length;
    const take = Math.max(2, Math.round(count * share));
    for (let i = 0; i < take; i += 1) {
      const at = (i / take) * (points.length - 1);
      const lo = Math.floor(at);
      const hi = Math.min(points.length - 1, lo + 1);
      const f = at - lo;
      const a = points[lo]!;
      const b = points[hi]!;
      const x = (a.x + (b.x - a.x) * f - centre.x) * scale;
      const y = -(a.y + (b.y - a.y) * f - centre.y) * scale;
      result.push(new Vector3(x, y, 0));
    }
  });

  return result;
}

/** Fills the glyph interior with points. Used for particle alignment targets. */
export function sampleGlyphArea(key: AgGlyphKey, height: number, count: number, seed = 1): Vector3[] {
  const shapes = getShapes(key);
  const centre = glyphCentre(key);
  const scale = height / glyphExtent(key);

  let state = seed >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const points: Vector3[] = [];
  const probe = new Vector2();
  const bounds = shapes.map((shape) => {
    const pts = shape.getPoints(48);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    return { minX, minY, maxX, maxY };
  });

  let guard = 0;
  while (points.length < count && guard < count * 60) {
    guard += 1;
    const index = Math.floor(random() * shapes.length);
    const shape = shapes[index]!;
    const box = bounds[index]!;
    probe.set(
      box.minX + random() * (box.maxX - box.minX),
      box.minY + random() * (box.maxY - box.minY),
    );
    // Reject points that fall in a hole, so the A's counter-space stays empty.
    const inHole = shape.holes.some((hole) => pointInPolygon(probe, hole.getPoints(48)));
    if (inHole) continue;
    if (!pointInPolygon(probe, shape.getPoints(48))) continue;
    points.push(
      new Vector3((probe.x - centre.x) * scale, -(probe.y - centre.y) * scale, 0),
    );
  }

  return points;
}

function pointInPolygon(point: Vector2, polygon: Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i]!;
    const b = polygon[j]!;
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || 1e-9) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}
