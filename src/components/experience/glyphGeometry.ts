import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { AG_GLYPH_A, AG_GLYPH_G, AG_VIEWBOX_SIZE } from "@/brand/logo";

/**
 * Builds extruded 3D geometry from the approved glyph paths.
 *
 * The front silhouette must stay pixel-faithful to the source SVG, so the path
 * data is passed to SVGLoader untouched and only depth and a conservative bevel
 * are added behind it. No skew, stretch, mirror or corner regularisation.
 *
 * Normalisation: SVG is Y-down and the glyphs sit off-centre inside a large
 * square viewBox, so centring on the viewBox would leave the A far to the left
 * of the camera's travel axis — the visitor would fly past the doorway rather
 * than through it. Each glyph is therefore centred on its own bounding box and
 * scaled so its largest dimension is 1 world unit. Scene code then scales it in
 * units of "glyph heights", which is what the storyboard actually reasons in.
 */
function glyphGeometry(pathData: string, depth: number, bevel: number) {
  const loader = new SVGLoader();
  const parsed = loader.parse(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${AG_VIEWBOX_SIZE} ${AG_VIEWBOX_SIZE}"><path d="${pathData}"/></svg>`,
  );

  const shapes = parsed.paths.flatMap((path) => SVGLoader.createShapes(path));

  // Extrude in viewBox units first so `depth` and `bevel` stay proportional to
  // the glyph after normalisation.
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: depth * AG_VIEWBOX_SIZE,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel * AG_VIEWBOX_SIZE,
    bevelSize: bevel * AG_VIEWBOX_SIZE,
    bevelSegments: 2,
    curveSegments: 24,
  });

  // Flip Y-down to Y-up. This mirrors on Y, which would reverse the winding,
  // so normals are recomputed afterwards.
  geometry.scale(1, -1, 1);

  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = 1 / Math.max(size.x, size.y);

  // Centre on the glyph's own bounds, on X and Y only — Z stays anchored at the
  // front face so extrusion always grows away from the camera.
  const centre = new THREE.Vector3();
  box.getCenter(centre);
  geometry.translate(-centre.x, -centre.y, -box.min.z);
  geometry.scale(scale, scale, scale);

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The A. Its rectangular counter-space is the passage in Scene 2.
 * Returned centred on the glyph, so the camera's travel axis passes through
 * the counter — the doorway is literally the identity.
 */
export function apertureGeometry(depth = 0.05, bevel = 0.003) {
  return glyphGeometry(AG_GLYPH_A, depth, bevel);
}

/** The G. Withheld until Scene 12 — never previewed as a second doorway. */
export function gravityGeometry(depth = 0.035, bevel = 0.0025) {
  return glyphGeometry(AG_GLYPH_G, depth, bevel);
}
