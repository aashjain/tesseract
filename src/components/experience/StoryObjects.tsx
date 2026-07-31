"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { apertureGeometry, gravityGeometry } from "./glyphGeometry";
import { SEEDS, createRandom } from "./random";
import { pulse, sceneEnd, sceneStart, smooth, span, within } from "./timeline";

const VIOLET = "#7657ff";
const CYAN = "#2fa7ff";
const MAGENTA = "#e65cff";
const WHITE = "#ffffff";

/* -------------------------------------------------------------------------
 * Scene 1 — The Fragment Field
 *
 * Cropped brand artefacts: off-axis planes, glyph shards, broken paths. They
 * exist, they are active, and they do not add up. As the aperture takes hold
 * they stretch through it and become ordered rails.
 * ---------------------------------------------------------------------- */

function Fragments({ count, progress }: { count: number; progress: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  // Mutable scratch object for building instance matrices. A ref, not a memo —
  // it is written every frame by design.
  const dummy = useRef(new THREE.Object3D());

  const seeds = useMemo(() => {
    const random = createRandom(SEEDS.fragments);
    return Array.from({ length: count }, () => ({
      scatter: new THREE.Vector3(
        (random() - 0.5) * 18,
        (random() - 0.5) * 10,
        (random() - 0.5) * 16 - 3,
      ),
      rot: new THREE.Euler(
        random() * Math.PI,
        random() * Math.PI,
        random() * Math.PI,
      ),
      // Kept small: fragments are evidence of scattered activity, not the
      // subject of the frame. They must never compete with the copy.
      scale: 0.07 + random() * 0.24,
      aspect: 0.2 + random() * 1.4,
      spin: (random() - 0.5) * 0.12,
      offset: random(),
    }));
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const d = dummy.current;

    // Present through act I, drawn toward the aperture, gone once inside.
    const life = 1 - smooth(span(progress, "a-aperture", "tesseract-revealed"));
    const pull = smooth(within(progress, "a-aperture"));
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const s = seeds[i];

      // Converge on the aperture mouth (world z = 0) as it takes hold.
      const x = THREE.MathUtils.lerp(s.scatter.x, 0, pull * 0.94);
      const y = THREE.MathUtils.lerp(s.scatter.y, 0, pull * 0.94);
      const z = THREE.MathUtils.lerp(s.scatter.z, 0.4, pull);

      d.position.set(
        x + Math.sin(t * 0.2 + s.offset * 6.28) * 0.14,
        y + Math.cos(t * 0.17 + s.offset * 6.28) * 0.1,
        z,
      );
      d.rotation.set(s.rot.x + t * s.spin, s.rot.y + t * s.spin * 0.7, s.rot.z);

      // Stretch along the travel axis as they are drawn through.
      const stretch = 1 + pull * 5.5 * s.offset;
      const scale = s.scale * life;
      d.scale.set(scale * s.aspect, scale, scale * 0.05 * stretch);
      d.updateMatrix();
      mesh.current.setMatrixAt(i, d.matrix);
    }

    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.visible = life > 0.01;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={VIOLET}
        emissive={MAGENTA}
        emissiveIntensity={0.35}
        roughness={0.35}
        metalness={0.1}
        transparent
        opacity={0.75}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------
 * Scene 2 — The A Aperture
 *
 * The approved A path, extruded. Its counter-space is the passage. The front
 * silhouette is the real glyph, so the doorway is literally the identity.
 * ---------------------------------------------------------------------- */

function Aperture({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => apertureGeometry(), []);

  useFrame(() => {
    if (!group.current) return;

    const reveal = smooth(within(progress, "a-aperture"));
    // Fades out as the visitor passes through it, not before.
    const exit = smooth(within(progress, "tesseract-revealed"));

    // The aperture holds still in world space and the camera travels toward it,
    // so the approach is real parallax rather than the object inflating. The
    // camera path crosses z = 0 during Scene 3 — that crossing is the threshold.
    group.current.position.z = 0;
    group.current.scale.setScalar(2.6);
    group.current.visible = progress < sceneEnd("tesseract-revealed") * 0.9;

    const material = (group.current.children[0] as THREE.Mesh)
      .material as THREE.MeshStandardMaterial;
    // Fades only once the visitor is through it, never before.
    material.opacity = Math.min(reveal * 2, 1) * (1 - smooth(Math.max(0, (exit - 0.45) / 0.55)));
    // A restrained rim, not a glowing slab: the body stays dark so the
    // counter-space reads as an opening.
    material.emissiveIntensity = 0.12 + reveal * 0.22;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#080b18"
          emissive={VIOLET}
          emissiveIntensity={0.12}
          roughness={0.18}
          metalness={0.9}
          transparent
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------
 * Scenes 3-11 — The Tesseract
 *
 * Nested rails whose right angles and inner/outer proportions come from the A
 * geometry, so the world reads as born from the identity rather than decorated
 * with it. It folds rather than rolls, and reverses cleanly.
 * ---------------------------------------------------------------------- */

const RAIL_THICKNESS = 0.018;

function cubeRails(size: number) {
  const h = size / 2;
  const rails: { pos: [number, number, number]; scale: [number, number, number] }[] =
    [];

  // 12 edges of a cube, expressed as thin boxes.
  for (const sy of [-h, h]) {
    for (const sz of [-h, h]) {
      rails.push({ pos: [0, sy, sz], scale: [size, RAIL_THICKNESS, RAIL_THICKNESS] });
    }
  }
  for (const sx of [-h, h]) {
    for (const sz of [-h, h]) {
      rails.push({ pos: [sx, 0, sz], scale: [RAIL_THICKNESS, size, RAIL_THICKNESS] });
    }
  }
  for (const sx of [-h, h]) {
    for (const sy of [-h, h]) {
      rails.push({ pos: [sx, sy, 0], scale: [RAIL_THICKNESS, RAIL_THICKNESS, size] });
    }
  }
  return rails;
}

function Tesseract({ progress, quality }: { progress: number; quality: number }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  // Outer/inner ratio taken from the A: counter width over glyph width.
  const innerRatio = 548.68 / 1039.32;

  const SIZE = 6;
  const outerRails = useMemo(() => cubeRails(SIZE), []);
  const innerRails = useMemo(() => cubeRails(SIZE * innerRatio), [innerRatio]);

  useFrame((state, delta) => {
    if (!group.current || !inner.current) return;

    const build = smooth(within(progress, "tesseract-revealed"));
    const life = span(progress, "tesseract-revealed", "human-node");
    const dissolve = smooth(within(progress, "g-resolution"));

    // The tesseract is the container for the whole middle act, so it travels
    // with the visitor rather than being left behind after Scene 3. Without
    // this the camera exits a fixed 6-unit cube within one scene and the
    // "inside the system" premise collapses.
    group.current.position.z = state.camera.position.z - 0.4;

    group.current.visible = build > 0.01 && dissolve < 0.98;
    group.current.scale.setScalar(build * (1 - dissolve * 0.4));

    // A 90-degree dimensional fold across the reveal — not a camera roll.
    const fold = smooth(within(progress, "tesseract-revealed"));
    group.current.rotation.y = fold * Math.PI * 0.5 + life * Math.PI * 0.35;
    group.current.rotation.x = Math.sin(life * Math.PI) * 0.12;

    // The inner cube counter-rotates: the system has internal structure.
    inner.current.rotation.y -= delta * 0.08;
    inner.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.06;
  });

  return (
    <group ref={group}>
      {outerRails.map((rail, i) => (
        <mesh key={`o${i}`} position={rail.pos} scale={rail.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={WHITE}
            emissive={CYAN}
            emissiveIntensity={0.55}
            roughness={0.25}
            metalness={0.8}
          />
        </mesh>
      ))}

      <group ref={inner}>
        {innerRails.map((rail, i) => (
          <mesh key={`i${i}`} position={rail.pos} scale={rail.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={WHITE}
              emissive={VIOLET}
              emissiveIntensity={0.7}
              roughness={0.25}
              metalness={0.8}
            />
          </mesh>
        ))}

        {/* Translucent membranes. Dropped on the lightest tier. */}
        {quality > 0.5 && (
          <mesh>
            <boxGeometry
              args={[SIZE * innerRatio, SIZE * innerRatio, SIZE * innerRatio]}
            />
            <meshPhysicalMaterial
              color={VIOLET}
              transparent
              opacity={0.06}
              roughness={0.1}
              transmission={0.6}
              thickness={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------
 * Scene 6 — The Signal Constellation
 *
 * Channel nodes joined by coordinated paths. Pulses travel outward only after
 * the core message is aligned, so distribution reads as a consequence of
 * strategy rather than as noise.
 * ---------------------------------------------------------------------- */

function SignalNetwork({ count, progress }: { count: number; progress: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const nodes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const ring = 2.4 + (i % 3) * 0.9;
        return {
          base: new THREE.Vector3(
            Math.cos(angle) * ring,
            Math.sin(angle * 1.7) * 1.3,
            Math.sin(angle) * ring,
          ),
          phase: i / count,
        };
      }),
    [count],
  );

  useFrame((state) => {
    if (!mesh.current) return;

    const presence = pulse(
      progress,
      sceneStart("signal-constellation"),
      sceneEnd("momentum-field"),
    );
    mesh.current.visible = presence > 0.01;
    if (presence <= 0.01) return;

    const t = state.clock.elapsedTime;
    const d = dummy.current;
    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      // A pulse travels the ring; each node brightens as it passes.
      const wave = Math.sin(t * 1.2 - n.phase * Math.PI * 2) * 0.5 + 0.5;
      const s = (0.045 + wave * 0.055) * presence;
      d.position.copy(n.base);
      d.position.y += Math.sin(t * 0.4 + n.phase * 6.28) * 0.12;
      d.scale.setScalar(s);
      d.updateMatrix();
      mesh.current.setMatrixAt(i, d.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={WHITE}
        emissive={CYAN}
        emissiveIntensity={1.4}
        roughness={0.3}
        metalness={0.4}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------
 * Scene 12 — The G Resolution
 *
 * The G is withheld for the entire journey and only emerges once the system
 * has coherence. The audience should notice the shape, not be told to admire
 * a logo trick.
 * ---------------------------------------------------------------------- */

function GravityResolution({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => gravityGeometry(), []);

  useFrame(() => {
    if (!group.current) return;

    const t = within(progress, "g-resolution");
    // Rails align onto the G silhouette across the first two-thirds, then hold
    // completely still. Stillness is the point of the final frame.
    const form = smooth(Math.min(t / 0.66, 1));

    group.current.visible = t > 0.001;
    group.current.scale.setScalar(2.2 + form * 1.4);
    group.current.rotation.y = (1 - form) * -0.9;
    group.current.position.z = -1.5 + form * 1.5;

    const material = (group.current.children[0] as THREE.Mesh)
      .material as THREE.MeshStandardMaterial;
    material.opacity = form;
    material.emissiveIntensity = 0.3 + form * 0.9;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#0b0f22"
          emissive={VIOLET}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.7}
          transparent
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------------- */

export function StoryObjects({
  progress,
  quality,
}: {
  progress: number;
  quality: number;
}) {
  const fragmentCount = quality > 0.6 ? 90 : quality > 0.35 ? 55 : 30;
  const nodeCount = quality > 0.6 ? 24 : 14;

  return (
    <>
      <Fragments count={fragmentCount} progress={progress} />
      <Aperture progress={progress} />
      <Tesseract progress={progress} quality={quality} />
      <SignalNetwork count={nodeCount} progress={progress} />
      <GravityResolution progress={progress} />
    </>
  );
}
