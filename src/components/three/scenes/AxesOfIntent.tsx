'use client';

import { useMemo, useRef } from 'react';
import { Group, MathUtils, Mesh, Vector3 } from 'three';

import { seeded, useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';

/**
 * Scene 4 — Axes of Intent (brand strategy and positioning).
 *
 * A navigational instrument. Competing vectors — every direction a brand could
 * plausibly take — collapse onto a single north line as the visitor scrolls.
 * The point is made by subtraction: the scene ends with fewer objects than it
 * started with, which is what choosing a position actually feels like.
 */
export function AxesOfIntent() {
  const group = useRef<Group>(null);
  const vectors = useRef<Mesh[]>([]);
  const north = useRef<Mesh>(null);
  const nodes = useRef<Group>(null);
  const { materials, tier } = useWorld();
  const station = sceneByKey('axesOfIntent').stationZ;

  const candidates = useMemo(() => {
    const random = seeded(90211);
    const count = tier === 'low' ? 7 : 12;
    // One shared destination: up and forward-right, the "north" the whole scene
    // resolves toward.
    const northDirection = new Vector3(0.42, 0.78, -0.46).normalize();

    return Array.from({ length: count }, () => {
      const direction = new Vector3(
        (random() - 0.5) * 1.9,
        random() * 1.5 - 0.35,
        (random() - 0.5) * 1.6,
      ).normalize();
      return {
        direction,
        north: northDirection,
        length: 2.6 + random() * 2.6,
        delay: random(),
      };
    });
  }, [tier]);

  const scratch = useMemo(() => ({ direction: new Vector3(), up: new Vector3(0, 1, 0) }), []);

  useSceneFrame('axesOfIntent', group, (local) => {
    const collapse = smoothstep(0.18, 0.86, local);
    const commit = smoothstep(0.66, 1, local);
    const time = storyClock.elapsed;

    candidates.forEach((candidate, index) => {
      const mesh = vectors.current[index];
      if (!mesh) return;

      // Staggered so the collapse reads as a sequence of decisions.
      const t = MathUtils.clamp((collapse - candidate.delay * 0.35) / 0.65, 0, 1);
      scratch.direction.copy(candidate.direction).lerp(candidate.north, t).normalize();

      mesh.quaternion.setFromUnitVectors(scratch.up, scratch.direction);
      const length = MathUtils.lerp(candidate.length, 0.8, t * 0.86);
      mesh.scale.set(1, length, 1);
      mesh.position.copy(scratch.direction).multiplyScalar(length / 2);

      const material = mesh.material;
      if (!Array.isArray(material) && 'opacity' in material) {
        material.opacity = 0.42;
      }
      mesh.visible = t < 0.985;
    });

    const northNode = north.current;
    if (northNode) {
      northNode.scale.set(1, MathUtils.lerp(0.4, 7.4, commit), 1);
      const direction = candidates[0]?.north ?? scratch.up;
      northNode.quaternion.setFromUnitVectors(scratch.up, direction);
      northNode.position.copy(direction).multiplyScalar((MathUtils.lerp(0.4, 7.4, commit) / 2));
      northNode.visible = commit > 0.02;
    }

    const nodeGroup = nodes.current;
    if (nodeGroup) {
      nodeGroup.rotation.y = time * 0.05;
      nodeGroup.scale.setScalar(MathUtils.lerp(1, 0.55, commit));
    }
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      {/* Constraint planes: the boundaries a position has to live inside. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.8, 0]}>
        <planeGeometry args={[26, 26]} />
        <meshBasicMaterial color="#7456ff" transparent opacity={0.028} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -7]}>
        <planeGeometry args={[26, 16]} />
        <meshBasicMaterial color="#28b7ff" transparent opacity={0.022} depthWrite={false} />
      </mesh>

      {/* Audience nodes — where the attention already is. */}
      <group ref={nodes}>
        {candidates.map((candidate, index) => (
          <mesh
            key={`node-${index}`}
            position={candidate.direction.clone().multiplyScalar(candidate.length)}
            material={materials.polymerCyan}
          >
            <sphereGeometry args={[0.1, 10, 8]} />
          </mesh>
        ))}
      </group>

      {candidates.map((_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            if (node) vectors.current[index] = node;
          }}
        >
          <cylinderGeometry args={[0.016, 0.016, 1, 5]} />
          <meshBasicMaterial color="#8ea0d8" transparent opacity={0.42} />
        </mesh>
      ))}

      {/* The single committed direction. */}
      <mesh ref={north} material={materials.polymerCyan}>
        <cylinderGeometry args={[0.05, 0.05, 1, 10]} />
      </mesh>

      <pointLight position={[2, 3, 4]} intensity={16} distance={20} color="#28b7ff" />
    </group>
  );
}
