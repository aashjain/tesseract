'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  Color,
  EdgesGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  Vector3,
} from 'three';

import { seeded, useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { palette } from '@/lib/design/tokens';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';
import {
  createGlyphFlatGeometry,
  createGlyphSolidGeometry,
  sampleGlyphOutline,
} from '@/lib/three/logoGeometry';

const G_HEIGHT = 9.4;

/**
 * Scene 12 — The G Resolution.
 *
 * Every earlier motif returns — shards, rails, nodes, frames — and aligns onto
 * the exact approved right-hand G path. The G is not previewed anywhere earlier
 * in the journey; it is the consequence of the system finally having gravity.
 *
 * Reverse scroll genuinely disassembles this, because alignment is a pure
 * function of local progress rather than a one-way animation.
 *
 * The still 2D lockup at the very end is the untouched supplied SVG, rendered by
 * the HTML layer — the full logo is never reconstructed from 3D pieces.
 */
export function ResolutionG() {
  const group = useRef<Group>(null);
  const shards = useRef<InstancedMesh>(null);
  const solid = useRef<Mesh>(null);
  const edge = useRef<LineSegments>(null);
  const orbits = useRef<Group>(null);
  const { materials, budgets, tier } = useWorld();
  const station = sceneByKey('resolutionG').stationZ;

  const geometry = useMemo(
    () =>
      createGlyphSolidGeometry('g', {
        height: G_HEIGHT,
        depth: 0.3,
        bevel: true,
        curveSegments: tier === 'low' ? 10 : 28,
      }),
    [tier],
  );

  /** Traces the approved silhouette exactly rather than thickening it. */
  const edgeGeometry = useMemo(() => {
    const flat = createGlyphFlatGeometry('g', G_HEIGHT, tier === 'low' ? 10 : 28);
    const edges = new EdgesGeometry(flat, 1);
    flat.dispose();
    return edges;
  }, [tier]);

  const solidMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(palette.paper100),
        roughness: 0.24,
        metalness: 0.06,
        // Self-illumination so the resolved mark reads as the warm off-white of
        // the brand rather than as grey metal: ACES tone mapping compresses the
        // highlights of a purely lit surface at this exposure.
        emissive: new Color(palette.paper200),
        emissiveIntensity: 0.62,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  const edgeMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: new Color(palette.violet400),
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  const layout = useMemo(() => {
    const random = seeded(120012);
    const count = Math.floor(budgets.fragmentCount * 0.55);
    // Alignment targets are points on the exact approved G silhouette.
    const outline = sampleGlyphOutline('g', G_HEIGHT, Math.max(220, Math.floor(count / 2)));

    const scattered = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const size = new Float32Array(count * 2);
    const spin = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      scattered[i * 3] = (random() - 0.5) * 26;
      scattered[i * 3 + 1] = (random() - 0.5) * 15;
      scattered[i * 3 + 2] = (random() - 0.5) * 18;

      const point = outline[i % outline.length] ?? new Vector3();
      target[i * 3] = point.x + (random() - 0.5) * 0.06;
      target[i * 3 + 1] = point.y + (random() - 0.5) * 0.06;
      target[i * 3 + 2] = (random() - 0.5) * 0.12;

      size[i * 2] = 0.06 + random() * 0.3;
      size[i * 2 + 1] = 0.02 + random() * 0.05;
      spin[i] = (random() - 0.5) * 3;
    }

    return { count, scattered, target, size, spin };
  }, [budgets.fragmentCount]);

  useEffect(
    () => () => {
      geometry.dispose();
      edgeGeometry.dispose();
      solidMaterial.dispose();
      edgeMaterial.dispose();
    },
    [geometry, edgeGeometry, solidMaterial, edgeMaterial],
  );

  const dummy = useMemo(() => new Object3D(), []);

  useSceneFrame('resolutionG', group, (local) => {
    // Three overlapping beats: gather, align onto the silhouette, then let the
    // solid mark take over from the particles.
    const gather = smoothstep(0, 0.22, local);
    const align = smoothstep(0.08, 0.42, local);
    // The mark takes over early enough that the resolved G is the still image
    // the visitor is left looking at, not something glimpsed on the last pixel
    // of scroll — the footer occupies the bottom of the document.
    const resolve = smoothstep(0.3, 0.56, local);
    const time = storyClock.elapsed;

    const mesh = shards.current;
    if (mesh) {
      for (let i = 0; i < layout.count; i += 1) {
        const sx = layout.scattered[i * 3]!;
        const sy = layout.scattered[i * 3 + 1]!;
        const sz = layout.scattered[i * 3 + 2]!;

        const wander = (1 - gather) * Math.sin(time * 0.4 + i) * 0.3;

        dummy.position.set(
          MathUtils.lerp(sx + wander, layout.target[i * 3]!, align),
          MathUtils.lerp(sy + wander, layout.target[i * 3 + 1]!, align),
          MathUtils.lerp(sz, layout.target[i * 3 + 2]!, align),
        );
        dummy.rotation.set(0, 0, layout.spin[i]! * (1 - align));
        const fade = 1 - resolve;
        dummy.scale.set(layout.size[i * 2]! * fade, layout.size[i * 2 + 1]! * fade, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    solidMaterial.opacity = resolve;

    const solidNode = solid.current;
    if (solidNode) {
      solidNode.visible = resolve > 0.01;
      solidNode.scale.setScalar(MathUtils.lerp(0.96, 1, resolve));
    }

    const edgeNode = edge.current;
    if (edgeNode) {
      // The edge leads the fill: the outline arrives first, so the shape is
      // recognised as the G before it is filled in.
      edgeMaterial.opacity = Math.max(0, align * 0.95 - resolve * 0.6);
      edgeNode.visible = edgeMaterial.opacity > 0.01;
    }

    // The orbit that gives the system gravity. It slows to a near-stop so the
    // ending reads as calm and assured rather than still spinning.
    const orbitNode = orbits.current;
    if (orbitNode) {
      orbitNode.rotation.z = time * 0.06 * (1 - resolve * 0.94);
      orbitNode.scale.setScalar(MathUtils.lerp(1.5, 1, gather));
    }
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      <group ref={orbits}>
        {[0, 1, 2, 3].map((index) => (
          <mesh key={index} rotation={[Math.PI / 2.6 + index * 0.12, 0, 0]}>
            <torusGeometry args={[4.6 + index * 1.8, 0.008, 5, tier === 'low' ? 48 : 96]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? palette.violet400 : palette.cyan400}
              transparent
              opacity={0.24 - index * 0.045}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      <instancedMesh
        ref={shards}
        args={[undefined, undefined, layout.count]}
        material={materials.coated}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
      </instancedMesh>

      <lineSegments
        ref={edge}
        geometry={edgeGeometry}
        material={edgeMaterial}
        position={[0, 0, 0.18]}
        visible={false}
      />
      <mesh ref={solid} geometry={geometry} material={solidMaterial} visible={false} />

      <pointLight position={[5, 5, 9]} intensity={70} distance={40} color="#f4f1ea" />
      <pointLight position={[-6, -3, 5]} intensity={34} distance={30} color="#7456ff" />
    </group>
  );
}
