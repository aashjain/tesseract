'use client';

import { useEffect, useMemo, useRef } from 'react';
import { BoxGeometry, EdgesGeometry, Group, MathUtils, Mesh, Vector3 } from 'three';

import { useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { AG_APERTURE_COUNTER, AG_GLYPH_BOUNDS } from '@/lib/brand/paths';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';

/**
 * Scene 3 — The Tesseract Revealed.
 *
 * A nested rail structure. The nesting ratio is not invented: it is the exact
 * ratio between the approved A's outer box and its counter-space, so the
 * architecture of the world is literally derived from the identity rather than
 * decorated with it.
 *
 * The dimensional fold is performed by the geometry — the inner frame rotates
 * ninety degrees through the scene — while the camera only arcs. Text in the
 * HTML layer stays level throughout.
 */

const OUTER_WIDTH = AG_GLYPH_BOUNDS.a.maxX - AG_GLYPH_BOUNDS.a.minX;
const OUTER_HEIGHT = AG_GLYPH_BOUNDS.a.maxY - AG_GLYPH_BOUNDS.a.minY;
const COUNTER_WIDTH = AG_APERTURE_COUNTER.maxX - AG_APERTURE_COUNTER.minX;
const COUNTER_HEIGHT = AG_APERTURE_COUNTER.maxY - AG_APERTURE_COUNTER.minY;

/** ≈0.528 — the A's own inner/outer proportion. */
const NEST_RATIO_X = COUNTER_WIDTH / OUTER_WIDTH;
/** ≈0.524 */
const NEST_RATIO_Y = COUNTER_HEIGHT / OUTER_HEIGHT;

export function TesseractReveal() {
  const group = useRef<Group>(null);
  const shells = useRef<Group[]>([]);
  const membranes = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const { materials, tier } = useWorld();
  const station = sceneByKey('tesseractReveal').stationZ;

  const levels = tier === 'low' ? 2 : 3;

  const frames = useMemo(() => {
    const list: { size: Vector3; edges: EdgesGeometry; box: BoxGeometry }[] = [];
    let width = 8.6;
    let height = 8.6 * (OUTER_HEIGHT / OUTER_WIDTH);
    let depth = 8.6 * 0.8;

    for (let i = 0; i < levels; i += 1) {
      const box = new BoxGeometry(width, height, depth);
      list.push({ size: new Vector3(width, height, depth), edges: new EdgesGeometry(box), box });
      width *= NEST_RATIO_X;
      height *= NEST_RATIO_Y;
      depth *= NEST_RATIO_X;
    }
    return list;
  }, [levels]);

  useEffect(
    () => () => {
      frames.forEach((frame) => {
        frame.edges.dispose();
        frame.box.dispose();
      });
    },
    [frames],
  );

  useSceneFrame('tesseractReveal', group, (local) => {
    const arrive = smoothstep(0, 0.32, local);
    const fold = smoothstep(0.3, 0.82, local);
    const settle = smoothstep(0.78, 1, local);
    const time = storyClock.elapsed;

    shells.current.forEach((shell, index) => {
      if (!shell) return;
      const depth = index / Math.max(1, levels - 1);
      // The fold: each nested shell turns a quarter turn, offset in time, so the
      // structure opens a dimension instead of spinning.
      shell.rotation.y = fold * (Math.PI / 2) * (1 - depth * 0.35) + time * 0.04 * (1 - depth);
      shell.rotation.x = fold * 0.18 * (index % 2 === 0 ? 1 : -1);
      const scale = MathUtils.lerp(0.72, 1, arrive) * (1 + settle * 0.06);
      shell.scale.setScalar(scale);
    });

    const membraneNode = membranes.current;
    if (membraneNode) {
      membraneNode.rotation.y = -fold * 0.6;
      membraneNode.scale.setScalar(MathUtils.lerp(0.6, 1, arrive));
    }

    const coreNode = core.current;
    if (coreNode) {
      coreNode.rotation.x = time * 0.22;
      coreNode.rotation.y = time * 0.31;
      coreNode.scale.setScalar(0.2 + settle * 0.12);
    }
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      {frames.map((frame, index) => (
        <group
          key={index}
          ref={(node) => {
            if (node) shells.current[index] = node;
          }}
        >
          <lineSegments
            geometry={frame.edges}
            material={index === 0 ? materials.lineSoft : index === 1 ? materials.lineViolet : materials.lineCyan}
          />
          {/* Slim architectural rails on the vertical corners. */}
          {index === 0
            ? ([-1, 1] as const).flatMap((sx) =>
                ([-1, 1] as const).map((sz) => (
                  <mesh
                    key={`${sx}-${sz}`}
                    position={[(frame.size.x / 2) * sx, 0, (frame.size.z / 2) * sz]}
                    material={materials.anodised}
                  >
                    <cylinderGeometry args={[0.035, 0.035, frame.size.y, 6]} />
                  </mesh>
                )),
              )
            : null}
        </group>
      ))}

      <group ref={membranes}>
        <mesh material={materials.film}>
          <planeGeometry args={[8.4, 8.0]} />
        </mesh>
        <mesh material={materials.filmCyan} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[6.8, 8.0]} />
        </mesh>
        <mesh material={materials.film} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.4, 6.8]} />
        </mesh>
      </group>

      <mesh ref={core} material={materials.polymerCyan}>
        <octahedronGeometry args={[1.6, 0]} />
      </mesh>

      <pointLight position={[0, 0, 0]} intensity={9} distance={16} color="#28b7ff" />
    </group>
  );
}
