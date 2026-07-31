'use client';

import { useMemo, useRef } from 'react';
import { DoubleSide, Group, MathUtils } from 'three';

import { seeded, useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';

/**
 * Scene 11 — The Human Node.
 *
 * Warm off-white light enters the dark world. Portrait and process surfaces sit
 * on tactile planes with a slow lateral drift — deliberately *planes*, never
 * floating head cut-outs, so the scene stays respectful of real people once real
 * photography replaces these surfaces.
 */
export function HumanNode({ count = 5 }: { count?: number }) {
  const group = useRef<Group>(null);
  const planes = useRef<Group[]>([]);
  const { materials, tier } = useWorld();
  const station = sceneByKey('humanNode').stationZ;

  const total = tier === 'low' ? Math.min(3, count) : count;

  const layout = useMemo(() => {
    const random = seeded(50505);
    return Array.from({ length: total }, (_, index) => ({
      x: (index - (total - 1) / 2) * 2.5,
      y: (random() - 0.5) * 0.8,
      z: (random() - 0.5) * 1.6,
      tilt: (random() - 0.5) * 0.22,
      phase: random() * Math.PI * 2,
    }));
  }, [total]);

  useSceneFrame('humanNode', group, (local) => {
    const arrive = smoothstep(0, 0.3, local);
    const time = storyClock.elapsed;
    // Slow lateral drift, controlled by scroll rather than running on its own.
    const drift = MathUtils.lerp(2.6, -2.6, local);

    layout.forEach((entry, index) => {
      const node = planes.current[index];
      if (!node) return;
      node.position.set(
        entry.x + drift,
        entry.y + Math.sin(time * 0.28 + entry.phase) * 0.07,
        entry.z,
      );
      node.rotation.y = entry.tilt + Math.sin(time * 0.2 + entry.phase) * 0.03;
      node.scale.setScalar(MathUtils.lerp(0.86, 1, arrive));
    });
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      {layout.map((entry, index) => (
        <group
          key={index}
          ref={(node) => {
            if (node) planes.current[index] = node;
          }}
        >
          {/* Portrait / process surface. Replaced by real photography. */}
          <mesh>
            <planeGeometry args={[1.7, 2.2]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#ffd9c2' : '#e6e2d9'}
              roughness={0.92}
              metalness={0}
              transparent
              opacity={0.2}
              side={DoubleSide}
            />
          </mesh>
          {/* Annotation line — a handwritten note, abstracted. */}
          <mesh position={[-0.3, -1.34, 0.02]} material={materials.polymerWarm}>
            <boxGeometry args={[0.9, 0.012, 0.012]} />
          </mesh>
          <mesh position={[-0.52, -1.5, 0.02]} material={materials.coated}>
            <boxGeometry args={[0.46, 0.008, 0.008]} />
          </mesh>
        </group>
      ))}

      <pointLight position={[0, 2.4, 4]} intensity={14} distance={22} color="#ffab7f" />
      <pointLight position={[-4, -1, 3]} intensity={5} distance={16} color="#9179ff" />
    </group>
  );
}
