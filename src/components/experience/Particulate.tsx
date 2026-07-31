"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SEEDS, createRandom } from "./random";

/**
 * Drifting particulate — the dust of the creative space.
 *
 * This is atmosphere, not a star field: motes sit close to the camera, drift
 * slowly, vary in size, and are dim enough that they never resolve into
 * constellations or twinkle. They give the void scale and parallax.
 *
 * Scene 1 scatters them at random; as the journey progresses they bias toward
 * the story axis, so even the dust starts to organise.
 */
export function Particulate({
  count,
  progress,
}: {
  count: number;
  progress: number;
}) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const random = createRandom(SEEDS.particulate);

    for (let i = 0; i < count; i++) {
      // Scattered start — a spherical shell around the visitor.
      const r = 4 + random() * 14;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Organised target — a loose cylinder along the travel axis.
      const ring = 1.5 + random() * 5;
      const angle = random() * Math.PI * 2;
      targets[i * 3] = Math.cos(angle) * ring;
      targets[i * 3 + 1] = Math.sin(angle) * ring * 0.5;
      targets[i * 3 + 2] = (random() - 0.5) * 30;

      seeds[i] = random();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    return {
      geometry: g,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uViolet: { value: new THREE.Color("#a99dff") },
        uCyan: { value: new THREE.Color("#2fa7ff") },
        uSize: { value: 1 },
      },
    };
  }, [count]);

  useFrame((state, delta) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value += delta;
    const u = material.current.uniforms.uProgress;
    u.value += (progress - u.value) * Math.min(1, delta * 2.5);
    material.current.uniforms.uSize.value =
      state.viewport.dpr * (state.size.height / 900);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const VERTEX = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aSeed;

  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;

  varying float vSeed;
  varying float vDepth;

  void main() {
    // Each mote organises at its own pace so the field never snaps as one.
    float stagger = smoothstep(0.15, 0.85, uProgress - aSeed * 0.25);
    vec3 pos = mix(position, aTarget, stagger);

    // Slow individual drift keeps the field alive when progress is static.
    float t = uTime * 0.08 + aSeed * 6.2831;
    pos.x += sin(t) * 0.35;
    pos.y += cos(t * 0.8) * 0.28;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mv.z;
    vSeed = aSeed;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.9 + aSeed * 2.1) * uSize * (14.0 / max(vDepth, 0.6));
  }
`;

const FRAGMENT = /* glsl */ `
  // Must match the vertex stage, which defaults to highp. A mismatch on any
  // shared uniform (uProgress) fails program validation and the points never
  // draw.
  precision highp float;

  uniform vec3 uViolet;
  uniform vec3 uCyan;
  uniform float uProgress;

  varying float vSeed;
  varying float vDepth;

  void main() {
    // Soft round mote. No sprite texture, no twinkle.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= alpha;

    // Fade with distance so the field has depth rather than a hard shell edge.
    alpha *= smoothstep(26.0, 3.0, vDepth);
    alpha *= 0.18 + vSeed * 0.32;

    vec3 color = mix(uViolet, uCyan, smoothstep(0.3, 0.9, uProgress) * vSeed);

    gl_FragColor = vec4(color, alpha);
  }
`;
