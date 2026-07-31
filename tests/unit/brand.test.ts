import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Box3, Vector3 } from 'three';

import { AG_APERTURE_COUNTER, AG_GLYPH_BOUNDS, AG_PATH_A, AG_PATH_G } from '@/lib/brand/paths';
import {
  createGlyphFlatGeometry,
  createGlyphSolidGeometry,
  sampleGlyphArea,
  sampleGlyphOutline,
} from '@/lib/three/logoGeometry';

const SOURCE_SVG = readFileSync('public/brand/source/ag-logo.svg', 'utf8');

describe('approved brand geometry', () => {
  it('keeps the monogram path data byte-identical to the supplied SVG', () => {
    // This is the guard on the whole brand contract: if anyone "tidies" a
    // coordinate, redraws a corner or regularises the G curve, this fails.
    expect(SOURCE_SVG).toContain(AG_PATH_G);
    expect(SOURCE_SVG).toContain(AG_PATH_A);
  });

  it('keeps the source viewBox', () => {
    expect(SOURCE_SVG).toContain('viewBox="0 0 3750 3750"');
  });

  it('places the A counter-space where the source path declares it', () => {
    // The second sub-path of the A: M1464.75,1043.92 h-548.68 v519.76 h548.68 z
    expect(AG_APERTURE_COUNTER.minX).toBeCloseTo(1464.75 - 548.68, 2);
    expect(AG_APERTURE_COUNTER.maxX).toBeCloseTo(1464.75, 2);
    expect(AG_APERTURE_COUNTER.minY).toBeCloseTo(1043.92, 2);
    expect(AG_APERTURE_COUNTER.maxY).toBeCloseTo(1043.92 + 519.76, 2);
  });
});

describe('glyph geometry', () => {
  it('preserves the A proportion after normalisation', () => {
    const height = 6;
    const geometry = createGlyphFlatGeometry('a', height);
    const box = new Box3().setFromBufferAttribute(
      geometry.getAttribute('position') as never,
    );
    const size = box.getSize(new Vector3());

    const sourceWidth = AG_GLYPH_BOUNDS.a.maxX - AG_GLYPH_BOUNDS.a.minX;
    const sourceHeight = AG_GLYPH_BOUNDS.a.maxY - AG_GLYPH_BOUNDS.a.minY;

    // Uniform scale only: the aspect ratio must survive exactly.
    expect(size.x / size.y).toBeCloseTo(sourceWidth / sourceHeight, 3);
    // `height` targets the glyph's largest dimension.
    expect(Math.max(size.x, size.y)).toBeCloseTo(height, 3);
    geometry.dispose();
  });

  it('centres each glyph on its own bounding box', () => {
    for (const key of ['a', 'g'] as const) {
      const geometry = createGlyphFlatGeometry(key, 4);
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const centre = box.getCenter(new Vector3());
      expect(centre.x, key).toBeCloseTo(0, 3);
      expect(centre.y, key).toBeCloseTo(0, 3);
      geometry.dispose();
    }
  });

  it('leaves the extruded face pointing at the camera', () => {
    // Regression guard: correcting SVG's downward Y with a negative scale
    // mirrors the mesh, reverses winding and renders the mark unlit.
    const geometry = createGlyphSolidGeometry('g', { height: 5, depth: 0.3 });
    const normals = geometry.getAttribute('normal');
    let forward = 0;
    for (let i = 0; i < normals.count; i += 1) {
      if (normals.getZ(i) > 0.9) forward += 1;
    }
    expect(forward).toBeGreaterThan(0);
    geometry.dispose();
  });

  it('extrudes away from the viewer so the flat face is the visible one', () => {
    const geometry = createGlyphSolidGeometry('a', { height: 5, depth: 0.4, bevel: false });
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    expect(box.max.z).toBeLessThanOrEqual(0.001);
    expect(box.min.z).toBeLessThan(-0.3);
    geometry.dispose();
  });

  it('samples the outline across every stroke of the G', () => {
    const points = sampleGlyphOutline('g', 8, 200);
    expect(points.length).toBeGreaterThan(100);
    const ys = points.map((point) => point.y);
    // The G is much taller than it is wide; sampling must reach both ends.
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(7);
  });

  it('never places an area sample inside the A counter-space', () => {
    const height = 6;
    const points = sampleGlyphArea('a', height, 300);
    expect(points.length).toBeGreaterThan(0);

    const sourceWidth = AG_GLYPH_BOUNDS.a.maxX - AG_GLYPH_BOUNDS.a.minX;
    const sourceHeight = AG_GLYPH_BOUNDS.a.maxY - AG_GLYPH_BOUNDS.a.minY;
    const scale = height / Math.max(sourceWidth, sourceHeight);
    const centreX = (AG_GLYPH_BOUNDS.a.minX + AG_GLYPH_BOUNDS.a.maxX) / 2;
    const centreY = (AG_GLYPH_BOUNDS.a.minY + AG_GLYPH_BOUNDS.a.maxY) / 2;

    const holeMinX = (AG_APERTURE_COUNTER.minX - centreX) * scale;
    const holeMaxX = (AG_APERTURE_COUNTER.maxX - centreX) * scale;
    const holeMinY = -(AG_APERTURE_COUNTER.maxY - centreY) * scale;
    const holeMaxY = -(AG_APERTURE_COUNTER.minY - centreY) * scale;

    const inside = points.filter(
      (point) =>
        point.x > holeMinX + 0.02 &&
        point.x < holeMaxX - 0.02 &&
        point.y > holeMinY + 0.02 &&
        point.y < holeMaxY - 0.02,
    );
    expect(inside).toHaveLength(0);
  });
});
