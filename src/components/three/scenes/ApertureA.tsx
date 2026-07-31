'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  TubeGeometry,
  Vector3,
} from 'three';

import { seeded, useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { palette } from '@/lib/design/tokens';
import { smoothstep } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';
import {
  createGlyphFlatGeometry,
  createGlyphSolidGeometry,
} from '@/lib/three/logoGeometry';

const APERTURE_HEIGHT = 6.6;

/**
 * Scene 2 — The A Aperture.
 *
 * The approved left-hand A path, extruded shallowly. Its own rectangular
 * counter-space is the passage the camera flies through — the hole is real
 * geometry preserved by the SVG parser, not a masked cut-out, so the silhouette
 * seen head-on is the supplied artwork.
 *
 * The rim is a slightly larger back-facing copy of the same geometry, tinted
 * violet-to-cyan. Because it sits *behind* the face, it reads as an edge light
 * without changing the front silhouette by a single pixel.
 */
export function ApertureA() {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const edge = useRef<LineSegments>(null);
  const ribbons = useRef<Group>(null);
  const { materials, tier, budgets } = useWorld();
  const station = sceneByKey('apertureA').stationZ;

  const geometry = useMemo(
    () =>
      createGlyphSolidGeometry('a', {
        height: APERTURE_HEIGHT,
        depth: 0.34,
        bevel: true,
        curveSegments: tier === 'low' ? 8 : 20,
      }),
    [tier],
  );

  /**
   * The edge light is drawn as the outline of the *same* path rather than as a
   * scaled copy behind the face. A scaled copy would thicken the silhouette;
   * this traces it exactly, which is what the brand rules require.
   */
  const edgeGeometry = useMemo(() => {
    const flat = createGlyphFlatGeometry('a', APERTURE_HEIGHT, tier === 'low' ? 8 : 20);
    const edges = new EdgesGeometry(flat, 1);
    flat.dispose();
    return edges;
  }, [tier]);

  const edgeMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: new Color(palette.violet400),
        transparent: true,
        opacity: 0.55,
      }),
    [],
  );

  /** A soft halo behind the plate, so the opening reads as lit from within. */
  const haloMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(palette.violet500),
        side: BackSide,
        transparent: true,
        opacity: 0.2,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  const haloGeometry = useMemo(
    () =>
      createGlyphSolidGeometry('a', {
        height: APERTURE_HEIGHT * 1.05,
        depth: 0.5,
        bevel: false,
        curveSegments: tier === 'low' ? 8 : 20,
      }),
    [tier],
  );

  const bodyMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        // Anodised, not pale: the face must stay dark so the rim carries the
        // light and the counter-space reads as an opening rather than a hole
        // punched in a bright wall.
        color: new Color(palette.ink500),
        roughness: 0.28,
        metalness: 0.65,
        transparent: true,
        opacity: 1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.22,
      }),
    [],
  );

  const rimColours = useMemo(
    () => ({ from: new Color(palette.violet400), to: new Color(palette.cyan400) }),
    [],
  );

  // Curved ribbons of the surrounding noise, pulled toward the opening.
  const ribbonGeometries = useMemo(() => {
    const random = seeded(4471);
    const count = tier === 'low' ? 8 : tier === 'medium' ? 14 : 22;
    const list: BufferGeometry[] = [];
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + random() * 0.4;
      const radius = 7 + random() * 5;
      const points = [
        new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62, 5 + random() * 4),
        new Vector3(Math.cos(angle) * radius * 0.62, Math.sin(angle) * radius * 0.4, 2.4),
        new Vector3(Math.cos(angle) * 1.1, Math.sin(angle) * 0.8, 0.6),
        new Vector3(0, 0, -1.6),
      ];
      const curve = new CatmullRomCurve3(points);
      list.push(new TubeGeometry(curve, budgets.railSegments, 0.012 + random() * 0.016, 5, false));
    }
    return list;
  }, [tier, budgets.railSegments]);

  useEffect(
    () => () => {
      geometry.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      bodyMaterial.dispose();
      ribbonGeometries.forEach((entry) => entry.dispose());
    },
    [
      geometry,
      edgeGeometry,
      edgeMaterial,
      haloGeometry,
      haloMaterial,
      bodyMaterial,
      ribbonGeometries,
    ],
  );

  useSceneFrame('apertureA', group, (local) => {
    // Depth and edge light build as the visitor approaches, then the object
    // opens out of frame as the camera crosses the counter-space.
    const approach = smoothstep(0, 0.68, local);
    const cross = smoothstep(0.74, 1, local);

    const node = body.current;
    if (node) {
      // No scaling: the silhouette stays exactly the supplied proportion. Only
      // opacity changes as the camera clears the plane.
      bodyMaterial.opacity = 1 - cross * 0.95;
      bodyMaterial.transparent = cross > 0.01;
    }

    const edgeNode = edge.current;
    if (edgeNode) {
      edgeMaterial.opacity = Math.max(0, 0.4 + approach * 0.6 - cross * 1);
      // Violet at approach, resolving toward cyan as the passage opens.
      edgeMaterial.color.copy(rimColours.from).lerp(rimColours.to, approach);
      haloMaterial.opacity = Math.max(0, 0.12 + approach * 0.26 - cross * 0.4);
    }

    const ribbonNode = ribbons.current;
    if (ribbonNode) {
      // Noise is drawn in only after 70 percent of the approach, as specified,
      // and is gone before the camera reaches the point they converge on —
      // otherwise the last frames of the approach are a starburst of tubes,
      // which is very obvious on a narrow viewport.
      const pull = smoothstep(0.5, 0.86, local);
      const clear = smoothstep(0.8, 0.94, local);
      ribbonNode.scale.set(
        (1 - pull * 0.55) * (1 - clear),
        (1 - pull * 0.55) * (1 - clear),
        1 - pull * 0.3,
      );
      ribbonNode.rotation.z = pull * 0.35;
      ribbonNode.visible = pull > 0.01 && clear < 0.98;
    }
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      <mesh geometry={haloGeometry} material={haloMaterial} position={[0, 0, -0.12]} />
      <mesh ref={body} geometry={geometry} material={bodyMaterial} />
      <lineSegments
        ref={edge}
        geometry={edgeGeometry}
        material={edgeMaterial}
        position={[0, 0, 0.19]}
      />

      <group ref={ribbons}>
        {ribbonGeometries.map((entry, index) => (
          <mesh
            key={index}
            geometry={entry}
            material={index % 3 === 0 ? materials.polymerCyan : materials.polymerViolet}
          />
        ))}
      </group>

      {/* A narrow area light behind the aperture gives the edge its lift
          without a bloom halo filling the frame. */}
      <pointLight position={[0, 0, -3.4]} intensity={26} distance={11} color={palette.violet400} />
      <pointLight position={[-4, 2.6, 5]} intensity={16} distance={18} color={palette.cyan400} />
    </group>
  );
}
