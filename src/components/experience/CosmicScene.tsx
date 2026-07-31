"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "@/store/experience";
import { CameraRig } from "./CameraRig";
import { Nebula } from "./Nebula";
import { Particulate } from "./Particulate";
import { StoryObjects } from "./StoryObjects";

/** Per-tier quality budget. Drives particle counts, DPR and post-processing. */
const TIER_QUALITY = { A: 1, B: 0.6, C: 0.3, D: 0 } as const;
const TIER_DPR: Record<string, [number, number]> = {
  A: [1, 1.75],
  B: [1, 1.5],
  C: [1, 1.25],
  D: [1, 1],
};

/**
 * Watches frame time and steps quality down before the experience becomes
 * uncomfortable — DPR first, then particles, then effects, per the plan's
 * adaptive quality policy. Sampling starts only after interaction has settled.
 */
function AdaptiveQuality({
  onDowngrade,
}: {
  onDowngrade: (factor: number) => void;
}) {
  const { gl } = useThree();
  const samples = useRef<number[]>([]);
  const settled = useRef(false);
  const applied = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      settled.current = true;
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;

      if (settled.current && !applied.current) {
        samples.current.push(dt);
        if (samples.current.length >= 120) {
          const sorted = [...samples.current].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          // Budget is ~22ms (45fps). Sustained misses trigger one downgrade.
          if (median > 22) {
            applied.current = true;
            gl.setPixelRatio(Math.max(1, gl.getPixelRatio() * 0.75));
            onDowngrade(median > 33 ? 0.35 : 0.6);
          } else {
            applied.current = true;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gl, onDowngrade]);

  return null;
}

function SceneContents({ quality }: { quality: number }) {
  const progress = useExperience((s) => s.progress);
  const [runtimeQuality, setRuntimeQuality] = useState(quality);

  const effective = Math.min(quality, runtimeQuality);
  const particleCount =
    effective > 0.6 ? 1400 : effective > 0.35 ? 800 : 400;

  return (
    <>
      <AdaptiveQuality onDowngrade={setRuntimeQuality} />
      <CameraRig progress={progress} />

      {/* Narrow area lights and selective emissive edges, not a flat fill. */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[4, 6, 5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={18} color="#7657ff" distance={22} />
      {effective > 0.5 && (
        <pointLight position={[6, 3, -6]} intensity={14} color="#2fa7ff" distance={20} />
      )}

      <Nebula progress={progress} quality={effective} />
      <Particulate count={particleCount} progress={progress} />
      <StoryObjects progress={progress} quality={effective} />
    </>
  );
}

/**
 * The persistent canvas. One canvas for the whole journey — never one per
 * scene. It sits behind the semantic story rail and is decorative, so it is
 * hidden from assistive technology entirely.
 */
export default function CosmicScene() {
  const tier = useExperience((s) => s.tier);
  const registerContextLoss = useExperience((s) => s.registerContextLoss);
  const quality = TIER_QUALITY[tier];

  const onCreated = useCallback(
    ({ gl }: { gl: THREE.WebGLRenderer }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.05;

      const canvas = gl.domElement;
      const onLost = (event: Event) => {
        event.preventDefault();
        registerContextLoss();
      };
      canvas.addEventListener("webglcontextlost", onLost);
    },
    [registerContextLoss],
  );

  if (tier === "D") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={TIER_DPR[tier]}
        gl={{
          antialias: tier === "A",
          powerPreference: "high-performance",
          alpha: false,
        }}
        camera={{ fov: 52, near: 0.1, far: 200, position: [0, 0, 9] }}
        onCreated={onCreated}
        style={{ background: "#05070f" }}
      >
        <SceneContents quality={quality} />
      </Canvas>
    </div>
  );
}
