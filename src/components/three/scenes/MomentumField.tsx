'use client';

import { useEffect, useMemo, useRef } from 'react';
import { CatmullRomCurve3, Group, MathUtils, Mesh, TubeGeometry, Vector3 } from 'three';

import { useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { smoothstep } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';

/**
 * Scene 7 — The Momentum Field (content, reels and campaign concepts).
 *
 * Nine frames on a curved timeline, grouped as three beats: hook, build, payoff.
 * Scrolling scrubs a playhead along the curve; the frame under the playhead
 * gains depth and squares up to camera. There are no fake social-feed cards —
 * the grammar is production grammar.
 */

const FRAME_COUNT = 9;

export function MomentumField() {
  const group = useRef<Group>(null);
  const frames = useRef<Mesh[]>([]);
  const { materials, budgets } = useWorld();
  const station = sceneByKey('momentumField').stationZ;

  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-8.4, -1.6, 2.2),
        new Vector3(-4.2, 1.5, 0.4),
        new Vector3(0, -0.6, -1.2),
        new Vector3(4.2, 1.8, 0.2),
        new Vector3(8.4, -0.8, 2),
      ]),
    [],
  );

  const rail = useMemo(
    () => new TubeGeometry(curve, budgets.railSegments, 0.008, 4, false),
    [curve, budgets.railSegments],
  );

  useEffect(() => () => rail.dispose(), [rail]);

  const positions = useMemo(
    () =>
      Array.from({ length: FRAME_COUNT }, (_, index) => {
        const t = index / (FRAME_COUNT - 1);
        return { t, point: curve.getPointAt(t), beat: Math.floor(index / 3) };
      }),
    [curve],
  );

  useSceneFrame('momentumField', group, (local) => {
    const playhead = smoothstep(0.05, 0.95, local);

    positions.forEach((entry, index) => {
      const mesh = frames.current[index];
      if (!mesh) return;

      // Proximity to the playhead, in curve space.
      const distance = Math.abs(entry.t - playhead);
      const focus = MathUtils.clamp(1 - distance * 4.4, 0, 1);

      mesh.position.copy(entry.point);
      mesh.position.z += focus * 1.3;
      mesh.scale.setScalar(MathUtils.lerp(0.72, 1.22, focus));
      // Off-beat frames sit at an angle; the focused frame squares up.
      mesh.rotation.y = MathUtils.lerp(entry.beat === 1 ? -0.5 : 0.5, 0, focus);
      mesh.rotation.z = MathUtils.lerp((index % 2 === 0 ? 1 : -1) * 0.1, 0, focus);

      const material = mesh.material;
      if (!Array.isArray(material) && 'opacity' in material) {
        material.opacity = 0.22 + focus * 0.72;
      }
    });
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      <mesh geometry={rail} material={materials.anodised} />

      {positions.map((entry, index) => (
        <group key={index}>
          <mesh
            ref={(node) => {
              if (node) frames.current[index] = node;
            }}
          >
            <planeGeometry args={[1.5, 0.9]} />
            <meshStandardMaterial
              color={entry.beat === 0 ? '#7456ff' : entry.beat === 1 ? '#f4f1ea' : '#28b7ff'}
              roughness={0.62}
              metalness={0.08}
              transparent
              opacity={0.4}
              side={2}
            />
          </mesh>
          {/* Edit marker under each frame — the cut, not a like counter. */}
          <mesh position={[entry.point.x, entry.point.y - 0.68, entry.point.z]} material={materials.coated}>
            <boxGeometry args={[0.34, 0.012, 0.012]} />
          </mesh>
        </group>
      ))}

      <pointLight position={[0, 2, 4]} intensity={9} distance={20} color="#9179ff" />
    </group>
  );
}
