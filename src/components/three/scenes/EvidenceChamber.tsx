'use client';

import { useEffect, useMemo, useRef } from 'react';
import { DoubleSide, EdgesGeometry, Group, MathUtils, PlaneGeometry } from 'three';

import { useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { accentMaterial } from '@/lib/three/materials';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';
import type { Project } from '@/lib/content/types';

/**
 * Scene 10 — The Evidence Chamber.
 *
 * Three to five artefacts, each in its own frame and each with a distinct
 * silhouette drawn from the project's curated `spatialVariant`. No carousel and
 * no grid: the work is encountered as evidence inside the story, and the actual
 * case-study content lives in real HTML behind a focusable control.
 */
export function EvidenceChamber({ projects }: { projects: Project[] }) {
  const group = useRef<Group>(null);
  const artefacts = useRef<Group[]>([]);
  const { materials, tier } = useWorld();
  const station = sceneByKey('evidenceChamber').stationZ;

  const featured = useMemo(() => projects.slice(0, 5), [projects]);

  const frame = useMemo(() => {
    const plane = new PlaneGeometry(3, 3.8);
    return { plane, edges: new EdgesGeometry(plane) };
  }, []);

  useEffect(
    () => () => {
      frame.plane.dispose();
      frame.edges.dispose();
    },
    [frame],
  );

  useSceneFrame('evidenceChamber', group, (local) => {
    const arrive = smoothstep(0, 0.34, local);
    const pass = smoothstep(0.25, 1, local);
    const time = storyClock.elapsed;
    const spread = featured.length > 1 ? featured.length - 1 : 1;

    artefacts.current.forEach((node, index) => {
      if (!node) return;
      const slot = index / spread - 0.5;
      node.position.set(
        slot * 8.4,
        Math.sin(time * 0.3 + index * 1.4) * 0.16 + (index % 2 === 0 ? 0.3 : -0.3),
        MathUtils.lerp(-6, 3.4, pass) - index * 0.9,
      );
      node.rotation.y = time * 0.14 * (index % 2 === 0 ? 1 : -1) + slot * 0.3;
      node.scale.setScalar(MathUtils.lerp(0.7, 1, arrive));
    });
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      {featured.map((project, index) => (
        <group
          key={project.slug}
          ref={(node) => {
            if (node) artefacts.current[index] = node;
          }}
        >
          <lineSegments geometry={frame.edges} material={materials.lineSoft} />
          <mesh geometry={frame.plane}>
            <meshBasicMaterial color="#0b0d1d" transparent opacity={0.5} side={DoubleSide} />
          </mesh>
          <Artefact variant={project.spatialVariant} accent={project.accent} tier={tier} />
        </group>
      ))}

      <pointLight position={[0, 1.6, 5]} intensity={11} distance={26} color="#9179ff" />
    </group>
  );
}

/** The project-specific hero form. One silhouette per curated variant. */
function Artefact({
  variant,
  accent,
  tier,
}: {
  variant: Project['spatialVariant'];
  accent: Project['accent'];
  tier: 'high' | 'medium' | 'low';
}) {
  const { materials } = useWorld();
  const material = accentMaterial(materials, accent);
  const detail = tier === 'low' ? 0 : 1;

  switch (variant) {
    case 'lattice':
      return (
        <group>
          {Array.from({ length: 4 }, (_, row) =>
            Array.from({ length: 3 }, (_, col) => (
              <mesh
                key={`${row}-${col}`}
                position={[(col - 1) * 0.62, (row - 1.5) * 0.62, 0]}
                material={material}
              >
                <boxGeometry args={[0.5, 0.5, 0.05]} />
              </mesh>
            )),
          )}
        </group>
      );
    case 'ribbon':
      return (
        <mesh material={material} rotation={[0.4, 0.3, 0]}>
          <torusKnotGeometry args={[0.78, 0.1, tier === 'low' ? 48 : 128, 10, 2, 3]} />
        </mesh>
      );
    case 'aperture':
      return (
        <mesh material={material}>
          <torusGeometry args={[0.86, 0.14, 8, tier === 'low' ? 24 : 48]} />
        </mesh>
      );
    case 'prism':
      return (
        <mesh material={material} rotation={[0.3, 0.5, 0]}>
          <octahedronGeometry args={[1, detail]} />
        </mesh>
      );
    case 'monolith':
    default:
      return (
        <group>
          <mesh position={[-0.16, 0, 0]} material={material}>
            <boxGeometry args={[0.9, 2.4, 0.24]} />
          </mesh>
          <mesh position={[0.42, -0.4, 0.2]} material={materials.coated}>
            <boxGeometry args={[0.8, 1.4, 0.08]} />
          </mesh>
        </group>
      );
  }
}
