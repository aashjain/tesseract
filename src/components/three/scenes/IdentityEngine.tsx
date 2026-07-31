'use client';

import { useMemo, useRef } from 'react';
import { Color, DoubleSide, Group, InstancedMesh, MathUtils, Object3D } from 'three';

import { seeded, useSceneFrame } from '@/components/three/useSceneFrame';
import { palette } from '@/lib/design/tokens';
import { smoothstep, storyClock } from '@/lib/experience/progress';
import { sceneByKey } from '@/lib/experience/sceneManifest';

/**
 * Scene 5 — The Identity Engine (branding and visual identity).
 *
 * Type planes, colour fields, mark fragments and spacing modules orbit
 * separately, then lock into a responsive system. Pointer position blends
 * between two *controlled* states of the same system — consistency with range —
 * rather than randomising the layout, because the whole argument of the scene is
 * that the rules hold.
 */

const COLS = 6;
const ROWS = 3;

export function IdentityEngine() {
  const group = useRef<Group>(null);
  const modules = useRef<InstancedMesh>(null);
  const station = sceneByKey('identityEngine').stationZ;

  const layout = useMemo(() => {
    const random = seeded(775511);
    const count = COLS * ROWS;
    const cell = 1.32;
    const originX = (-(COLS - 1) * cell) / 2;
    const originY = (-(ROWS - 1) * cell) / 2;

    const orbit = new Float32Array(count * 3);
    const gridA = new Float32Array(count * 3);
    const gridB = new Float32Array(count * 3);
    const size = new Float32Array(count * 2);
    const spin = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const violet = new Color(palette.violet500);
    const cyan = new Color(palette.cyan500);
    const paper = new Color(palette.paper100);
    const ink = new Color(palette.ink500);

    for (let i = 0; i < count; i += 1) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      const angle = random() * Math.PI * 2;
      const radius = 3.4 + random() * 3.4;
      orbit[i * 3] = Math.cos(angle) * radius;
      orbit[i * 3 + 1] = Math.sin(angle) * radius * 0.6;
      orbit[i * 3 + 2] = (random() - 0.5) * 4;

      gridA[i * 3] = originX + col * cell;
      gridA[i * 3 + 1] = originY + row * cell;
      gridA[i * 3 + 2] = 0;

      // The second controlled state: the same modules, re-proportioned. Same
      // grammar, different sentence.
      gridB[i * 3] = originX + col * cell * 1.18;
      gridB[i * 3 + 1] = originY + row * cell * 0.72 + (col % 2 === 0 ? 0.26 : -0.26);
      gridB[i * 3 + 2] = (col % 3) * 0.22;

      const kind = random();
      if (kind < 0.3) {
        size[i * 2] = 1.06;
        size[i * 2 + 1] = 0.2;
      } else if (kind < 0.6) {
        size[i * 2] = 0.86;
        size[i * 2 + 1] = 0.86;
      } else {
        size[i * 2] = 1.02;
        size[i * 2 + 1] = 0.6;
      }

      spin[i] = (random() - 0.5) * 2.4;

      const tint = random();
      const color = tint < 0.24 ? violet : tint < 0.4 ? cyan : tint < 0.78 ? paper : ink;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { count, orbit, gridA, gridB, size, spin, colors };
  }, []);

  const dummy = useMemo(() => new Object3D(), []);

  useSceneFrame('identityEngine', group, (local) => {
    const mesh = modules.current;
    if (!mesh) return;

    const lock = smoothstep(0.14, 0.78, local);
    const time = storyClock.elapsed;
    // Bounded: even at the extremes the system stays legible.
    const stateBlend = MathUtils.clamp(storyClock.pointerX * 0.5 + 0.5, 0, 1) * lock;

    for (let i = 0; i < layout.count; i += 1) {
      const ox = layout.orbit[i * 3]!;
      const oy = layout.orbit[i * 3 + 1]!;
      const oz = layout.orbit[i * 3 + 2]!;

      const targetX = MathUtils.lerp(layout.gridA[i * 3]!, layout.gridB[i * 3]!, stateBlend);
      const targetY = MathUtils.lerp(layout.gridA[i * 3 + 1]!, layout.gridB[i * 3 + 1]!, stateBlend);
      const targetZ = MathUtils.lerp(layout.gridA[i * 3 + 2]!, layout.gridB[i * 3 + 2]!, stateBlend);

      const wobble = (1 - lock) * 0.5;
      dummy.position.set(
        MathUtils.lerp(ox + Math.sin(time * 0.4 + i) * wobble, targetX, lock),
        MathUtils.lerp(oy + Math.cos(time * 0.34 + i * 1.7) * wobble, targetY, lock),
        MathUtils.lerp(oz, targetZ, lock),
      );
      dummy.rotation.set(0, 0, layout.spin[i]! * (1 - lock));
      dummy.scale.set(layout.size[i * 2]!, layout.size[i * 2 + 1]!, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const gridLines = useMemo(() => {
    const cell = 1.32;
    const width = COLS * cell;
    const height = ROWS * cell;
    return { width, height };
  }, []);

  return (
    <group ref={group} position={[0, 0, station]}>
      {/* The spacing system the modules snap to, drawn faintly. */}
      <mesh position={[0, 0, -0.6]}>
        <planeGeometry args={[gridLines.width + 1.2, gridLines.height + 1.2]} />
        <meshBasicMaterial color={palette.violet500} transparent opacity={0.035} side={DoubleSide} depthWrite={false} />
      </mesh>

      <instancedMesh
        ref={modules}
        args={[undefined, undefined, layout.count]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial vertexColors roughness={0.74} metalness={0.06} side={DoubleSide} />
        <instancedBufferAttribute attach="instanceColor" args={[layout.colors, 3]} />
      </instancedMesh>

      <pointLight position={[-3, 2, 4]} intensity={9} distance={18} color="#9179ff" />
    </group>
  );
}
