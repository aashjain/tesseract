'use client';

import { useMemo, useRef } from 'react';
import { DoubleSide, Group, MathUtils, Mesh, PointLight } from 'three';

import { useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';

/**
 * Scene 8 — The Matter Lab (photography, video and production).
 *
 * A minimal virtual studio: plinth, subject, light cards, lens planes. The
 * scene's entire animation is the lighting setup resolving from flat and
 * undecided to directional and finished — which is the actual difference
 * between an idea and a shot.
 *
 * This is where the controlled warm accent enters the dark world for the first
 * time. It is used here and in Scene 11 only.
 */
export function MatterLab() {
  const group = useRef<Group>(null);
  const key = useRef<PointLight>(null);
  const fill = useRef<PointLight>(null);
  const subject = useRef<Mesh>(null);
  const cards = useRef<Group>(null);
  const { materials, tier } = useWorld();
  const station = sceneByKey('matterLab').stationZ;

  const lensPlanes = useMemo(() => (tier === 'low' ? 2 : 4), [tier]);

  useSceneFrame('matterLab', group, (local) => {
    const resolve = smoothstep(0.12, 0.82, local);
    const time = storyClock.elapsed;

    const keyLight = key.current;
    if (keyLight) {
      // Flat and frontal at the start; raked and directional once resolved.
      keyLight.position.set(
        MathUtils.lerp(0, -3.4, resolve),
        MathUtils.lerp(0.4, 3.2, resolve),
        MathUtils.lerp(4.6, 2.4, resolve),
      );
      keyLight.intensity = MathUtils.lerp(6, 22, resolve);
    }

    const fillLight = fill.current;
    if (fillLight) {
      fillLight.intensity = MathUtils.lerp(6, 2.4, resolve);
      fillLight.position.set(3.2, -0.6, 3);
    }

    const subjectNode = subject.current;
    if (subjectNode) {
      subjectNode.rotation.y = time * 0.12 + resolve * 0.5;
      subjectNode.position.y = MathUtils.lerp(0.2, 0.62, resolve);
    }

    const cardGroup = cards.current;
    if (cardGroup) {
      cardGroup.rotation.y = MathUtils.lerp(0, -0.34, resolve);
      cardGroup.scale.setScalar(MathUtils.lerp(0.86, 1, resolve));
    }
  });

  return (
    <group ref={group} position={[0, -0.6, station]}>
      {/* Plinth */}
      <mesh position={[0, -0.9, 0]} material={materials.anodised}>
        <cylinderGeometry args={[1.6, 1.7, 0.5, 32]} />
      </mesh>

      {/* Sweep — the studio floor curving into the background. */}
      <mesh position={[0, -1.14, -2.6]} rotation={[-Math.PI / 2.1, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#0b0d1d" roughness={0.94} metalness={0} side={DoubleSide} />
      </mesh>

      {/* Subject — abstract, awaiting the client's real product or portrait. */}
      <mesh ref={subject} position={[0, 0.4, 0]} material={materials.polymerWarm}>
        <capsuleGeometry args={[0.42, 0.9, 6, 16]} />
      </mesh>

      <group ref={cards}>
        {/* Light cards */}
        <mesh position={[-3.1, 1.2, 1.6]} rotation={[0, 0.7, 0]}>
          <planeGeometry args={[2.4, 3.2]} />
          <meshBasicMaterial color="#ffd9c2" transparent opacity={0.16} side={DoubleSide} />
        </mesh>
        <mesh position={[3.3, 0.4, 1.2]} rotation={[0, -0.6, 0]}>
          <planeGeometry args={[2, 2.6]} />
          <meshBasicMaterial color="#b6e6ff" transparent opacity={0.1} side={DoubleSide} />
        </mesh>

        {/* Lens planes — the framing decisions stacked in front of the subject. */}
        {Array.from({ length: lensPlanes }, (_, index) => (
          <mesh key={index} position={[0, 0.5, 2.2 + index * 0.55]}>
            <ringGeometry args={[0.9 + index * 0.16, 0.93 + index * 0.16, 48]} />
            <meshBasicMaterial
              color="#f4f1ea"
              transparent
              opacity={0.09 - index * 0.015}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      <pointLight ref={key} position={[0, 0.4, 4.6]} intensity={6} distance={22} color="#ffab7f" />
      <pointLight ref={fill} position={[3.2, -0.6, 3]} intensity={6} distance={18} color="#6ecdff" />
    </group>
  );
}
