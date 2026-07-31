'use client';

import { useMemo, useRef } from 'react';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Object3D,
  Vector3,
} from 'three';

import { seeded, useSceneFrame } from '@/components/three/useSceneFrame';
import { useWorld } from '@/components/three/WorldContext';
import { palette } from '@/lib/design/tokens';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';
import { sampleGlyphOutline } from '@/lib/three/logoGeometry';

/**
 * Scene 1 — The Fragment Field.
 *
 * Cropped brand artefacts occupying the same space without relating to each
 * other: caption slabs, colour chips, frame corners, image planes. They are one
 * instanced mesh, so 700 fragments cost a single draw call.
 *
 * The last third of the scene is the transition's cause rather than a cut: the
 * same fragments begin drifting onto the outline of the approved A. Nothing new
 * appears at the aperture — the noise becomes the opening.
 */
export function FragmentField() {
  const group = useRef<Group>(null);
  const shards = useRef<InstancedMesh>(null);
  const { materials, budgets } = useWorld();
  const station = sceneByKey('fragmentField').stationZ;

  const layout = useMemo(() => {
    const random = seeded(20240117);
    const count = budgets.fragmentCount;

    // Targets are points on the real A outline, so the pattern the visitor
    // starts to notice is the actual approved geometry, not a drawn triangle.
    const outline = sampleGlyphOutline('a', 7.2, Math.max(64, Math.floor(count / 4)));

    const home = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const rotation = new Float32Array(count * 3);
    const scale = new Float32Array(count * 2);
    const drift = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const violet = new Color(palette.violet500);
    const cyan = new Color(palette.cyan500);
    const paper = new Color(palette.paper200);
    const ink = new Color(palette.ink600);

    for (let i = 0; i < count; i += 1) {
      home[i * 3] = (random() - 0.5) * 24;
      home[i * 3 + 1] = (random() - 0.5) * 14;
      // Biased ahead of the camera's closest approach, so the field surrounds
      // the visitor without packing the near plane solid.
      home[i * 3 + 2] = (random() - 0.5) * 11 - 2.5;

      const point = outline[i % outline.length]!;
      // Spread the shards a little around the outline so it reads as a
      // correspondence being noticed, not a logo being stamped.
      target[i * 3] = point.x + (random() - 0.5) * 0.34;
      target[i * 3 + 1] = point.y + (random() - 0.5) * 0.34;
      target[i * 3 + 2] = (random() - 0.5) * 0.9;

      rotation[i * 3] = (random() - 0.5) * 2.4;
      rotation[i * 3 + 1] = (random() - 0.5) * 2.4;
      rotation[i * 3 + 2] = (random() - 0.5) * 3.14;

      // A kit of recognisable shapes: long caption slabs, square chips, thin rules.
      const kind = random();
      if (kind < 0.4) {
        scale[i * 2] = 0.5 + random() * 1.5;
        scale[i * 2 + 1] = 0.035 + random() * 0.05;
      } else if (kind < 0.7) {
        const chip = 0.18 + random() * 0.3;
        scale[i * 2] = chip;
        scale[i * 2 + 1] = chip;
      } else {
        const frame = 0.32 + random() * 0.7;
        scale[i * 2] = frame;
        scale[i * 2 + 1] = frame * (0.55 + random() * 0.5);
      }

      drift[i * 3] = (random() - 0.5) * 0.4;
      drift[i * 3 + 1] = (random() - 0.5) * 0.4;
      drift[i * 3 + 2] = (random() - 0.5) * 0.3;

      const tint = random();
      const color =
        tint < 0.18 ? violet : tint < 0.32 ? cyan : tint < 0.82 ? paper : ink;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { count, home, target, rotation, scale, drift, colors };
  }, [budgets.fragmentCount]);

  // Loose dust between the fragments, so the space has depth without stars.
  const dust = useMemo(() => {
    const random = seeded(6631);
    const count = Math.floor(budgets.fragmentCount * 0.6);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (random() - 0.5) * 30;
      positions[i * 3 + 1] = (random() - 0.5) * 18;
      positions[i * 3 + 2] = (random() - 0.5) * 22;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geometry;
  }, [budgets.fragmentCount]);

  const scratch = useMemo(
    () => ({
      dummy: new Object3D(),
      position: new Vector3(),
      pointer: new Vector3(),
    }),
    [],
  );

  useSceneFrame('fragmentField', group, (local) => {
    const mesh = shards.current;
    if (!mesh) return;

    // Attraction begins only once the alignment guides appear.
    const attract = smoothstep(0.42, 0.98, local);
    const time = storyClock.elapsed;

    // Pointer repulsion, bounded so nothing moves more than ~12px on screen.
    scratch.pointer.set(storyClock.pointerX * 9, -storyClock.pointerY * 5.5, 2);

    const { dummy, position } = scratch;

    for (let i = 0; i < layout.count; i += 1) {
      const hx = layout.home[i * 3]!;
      const hy = layout.home[i * 3 + 1]!;
      const hz = layout.home[i * 3 + 2]!;

      // Unresolved drift: everything moving, nothing arriving.
      const wander =
        Math.sin(time * 0.35 + layout.drift[i * 3]! * 12) * layout.drift[i * 3]! * 0.9;
      const wanderY =
        Math.cos(time * 0.3 + layout.drift[i * 3 + 1]! * 14) * layout.drift[i * 3 + 1]! * 0.9;

      let x = hx + wander;
      let y = hy + wanderY;
      let z = hz;

      if (attract > 0) {
        x += (layout.target[i * 3]! - x) * attract;
        y += (layout.target[i * 3 + 1]! - y) * attract;
        z += (layout.target[i * 3 + 2]! - z) * attract;
      }

      // Repulsion falls off quickly and is clamped to a 0.12-unit displacement.
      const dx = x - scratch.pointer.x;
      const dy = y - scratch.pointer.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq < 9) {
        const falloff = (1 - distanceSq / 9) * 0.12;
        const inv = 1 / Math.max(0.4, Math.sqrt(distanceSq));
        x += dx * inv * falloff;
        y += dy * inv * falloff;
      }

      position.set(x, y, z);
      dummy.position.copy(position);
      dummy.rotation.set(
        layout.rotation[i * 3]! * (1 - attract),
        layout.rotation[i * 3 + 1]! * (1 - attract),
        layout.rotation[i * 3 + 2]! * (1 - attract * 0.85),
      );
      dummy.scale.set(
        layout.scale[i * 2]! * (1 - attract * 0.45),
        layout.scale[i * 2 + 1]! * (1 - attract * 0.45),
        1,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} position={[0, 0, station]}>
      <instancedMesh
        ref={shards}
        args={[undefined, undefined, layout.count]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          vertexColors
          roughness={0.55}
          metalness={0.05}
          emissive="#2b2f52"
          emissiveIntensity={0.55}
          transparent
          opacity={0.92}
          side={DoubleSide}
        />
        <instancedBufferAttribute
          attach="instanceColor"
          args={[layout.colors, 3]}
        />
      </instancedMesh>

      <points geometry={dust} material={materials.dust} frustumCulled={false} />
    </group>
  );
}
