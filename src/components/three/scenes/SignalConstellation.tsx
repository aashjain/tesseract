'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  Object3D,
  Vector3,
} from 'three';

import { seeded, useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';

/**
 * Scene 6 — The Signal Constellation (social media and campaigns).
 *
 * Channel nodes joined by coordinated paths. A message travels the network as
 * the visitor scrolls, and the campaign waves only leave the centre *after* the
 * core message has reached the network — the sequencing is the argument.
 */
export function SignalConstellation() {
  const group = useRef<Group>(null);
  const nodesMesh = useRef<InstancedMesh>(null);
  const waves = useRef<Mesh[]>([]);
  const pulse = useRef<Mesh>(null);
  const { materials, budgets } = useWorld();
  const station = sceneByKey('signalConstellation').stationZ;

  const network = useMemo(() => {
    const random = seeded(31337);
    const count = budgets.signalNodes;
    const nodes: Vector3[] = [];

    // A shallow shell rather than a sphere, so the network reads as a field the
    // visitor is looking across rather than a ball floating in space.
    for (let i = 0; i < count; i += 1) {
      nodes.push(
        new Vector3(
          (random() - 0.5) * 11,
          (random() - 0.5) * 6.4,
          (random() - 0.5) * 5,
        ),
      );
    }

    const linePositions: number[] = [];
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        if (nodes[i]!.distanceTo(nodes[j]!) < 3.6) {
          edges.push([i, j]);
          linePositions.push(
            nodes[i]!.x, nodes[i]!.y, nodes[i]!.z,
            nodes[j]!.x, nodes[j]!.y, nodes[j]!.z,
          );
        }
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(linePositions, 3));

    // The route the message takes through the network.
    const route = [0, ...edges.slice(0, 8).map(([, b]) => b)];

    return { nodes, geometry, edges, route };
  }, [budgets.signalNodes]);

  useEffect(() => () => network.geometry.dispose(), [network]);

  const dummy = useMemo(() => new Object3D(), []);
  const scratch = useMemo(() => new Vector3(), []);

  useSceneFrame('signalConstellation', group, (local) => {
    const arrive = smoothstep(0, 0.28, local);
    const travel = smoothstep(0.16, 0.72, local);
    // Waves expand only once the message is aligned across the network.
    const broadcast = smoothstep(0.7, 1, local);
    const time = storyClock.elapsed;

    const mesh = nodesMesh.current;
    if (mesh) {
      network.nodes.forEach((node, index) => {
        const reached = MathUtils.clamp(travel * network.nodes.length - index, 0, 1);
        dummy.position.copy(node);
        dummy.position.y += Math.sin(time * 0.5 + index) * 0.05;
        dummy.scale.setScalar(MathUtils.lerp(0.04, 0.11, reached) * arrive);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }

    const pulseNode = pulse.current;
    if (pulseNode && network.route.length > 1) {
      const at = travel * (network.route.length - 1);
      const lo = Math.floor(at);
      const hi = Math.min(network.route.length - 1, lo + 1);
      const from = network.nodes[network.route[lo]!];
      const to = network.nodes[network.route[hi]!];
      if (from && to) {
        scratch.copy(from).lerp(to, at - lo);
        pulseNode.position.copy(scratch);
        pulseNode.scale.setScalar(0.12 + Math.sin(time * 6) * 0.02);
      }
      pulseNode.visible = travel > 0.02 && travel < 0.995;
    }

    waves.current.forEach((wave, index) => {
      if (!wave) return;
      const offset = index * 0.28;
      const t = MathUtils.clamp(broadcast * 1.6 - offset, 0, 1);
      wave.scale.setScalar(0.4 + t * 7.4);
      wave.visible = t > 0.01;
      const material = wave.material;
      if (!Array.isArray(material) && 'opacity' in material) {
        material.opacity = 0.5 * (1 - t) * broadcast;
      }
    });
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      <lineSegments geometry={network.geometry} material={materials.lineCyan} />

      <instancedMesh
        ref={nodesMesh}
        args={[undefined, undefined, network.nodes.length]}
        material={materials.polymerCyan}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 10, 8]} />
      </instancedMesh>

      <mesh ref={pulse} material={materials.coated}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>

      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            if (node) waves.current[index] = node;
          }}
          rotation={[Math.PI / 2.4, 0, 0]}
        >
          <torusGeometry args={[1, 0.008, 6, 64]} />
          <meshBasicMaterial color="#7456ff" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}

      <pointLight position={[0, 1.5, 3]} intensity={8} distance={18} color="#28b7ff" />
    </group>
  );
}
