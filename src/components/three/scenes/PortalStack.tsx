'use client';

import { useEffect, useMemo, useRef } from 'react';
import { DoubleSide, EdgesGeometry, Group, MathUtils, PlaneGeometry } from 'three';

import { useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';

/**
 * Scene 9 — The Portal Stack (websites and digital experience design).
 *
 * Layered portals rather than screens on a device mockup. Each layer has its own
 * depth treatment and its own drift rule, so the stack reads as several distinct
 * worlds rather than one thing repeated — which is the point being made about
 * digital work.
 */

const LAYERS = 6;

export function PortalStack() {
  const group = useRef<Group>(null);
  const layers = useRef<Group[]>([]);
  const { materials, tier } = useWorld();
  const station = sceneByKey('portalStack').stationZ;

  const count = tier === 'low' ? 4 : LAYERS;

  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(3.4, 4.4);
    const edges = new EdgesGeometry(plane);
    return { plane, edges };
  }, []);

  useEffect(
    () => () => {
      geometry.plane.dispose();
      geometry.edges.dispose();
    },
    [geometry],
  );

  useSceneFrame('portalStack', group, (local) => {
    const travel = smoothstep(0, 1, local);
    const time = storyClock.elapsed;

    layers.current.forEach((layer, index) => {
      if (!layer) return;
      const depth = index / count;
      // The stack moves toward the camera as the visitor scrolls: they pass
      // through one portal rather than watching all of them.
      const z = -index * 1.9 + travel * 9;
      layer.position.set(
        Math.sin(time * 0.16 + index) * 0.14 * (index % 2 === 0 ? 1 : -1),
        Math.cos(time * 0.13 + index * 0.7) * 0.1,
        z,
      );
      layer.rotation.y = (index % 2 === 0 ? 1 : -1) * (0.06 + depth * 0.12);
      layer.scale.setScalar(MathUtils.lerp(1.14, 0.72, depth));
      // Fade a layer out once the camera has passed it.
      layer.visible = z < 6.5;
    });
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      {Array.from({ length: count }, (_, index) => (
        <group
          key={index}
          ref={(node) => {
            if (node) layers.current[index] = node;
          }}
        >
          <lineSegments
            geometry={geometry.edges}
            material={index % 2 === 0 ? materials.lineCyan : materials.lineSoft}
          />
          <mesh geometry={geometry.plane}>
            <meshBasicMaterial
              color={index % 3 === 0 ? '#28b7ff' : '#7456ff'}
              transparent
              opacity={0.035 + index * 0.008}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* An interaction rule made visible: a single moving affordance line. */}
          <mesh position={[0, -1.6 + (index % 3) * 0.6, 0.01]} material={materials.polymerCyan}>
            <boxGeometry args={[1.1 - index * 0.1, 0.014, 0.014]} />
          </mesh>
        </group>
      ))}

      <pointLight position={[0, 0, 5]} intensity={10} distance={20} color="#28b7ff" />
    </group>
  );
}
