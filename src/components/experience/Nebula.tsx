"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The cosmic backdrop.
 *
 * A large inward-facing sphere carrying layered value-noise. It reads as deep
 * space — nebula haze, depth, drift — without a single star sprite or planet.
 * Colour drifts across the journey: violet-dominant while the brand is still
 * fragmented, cyan entering as the system aligns.
 *
 * Deliberately low frequency and low contrast. Black levels keep detail, and
 * nothing in here competes with the copy layer for attention.
 */
export function Nebula({ progress, quality }: { progress: number; quality: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uInk: { value: new THREE.Color("#05070f") },
      uViolet: { value: new THREE.Color("#7657ff") },
      uCyan: { value: new THREE.Color("#2fa7ff") },
      uMagenta: { value: new THREE.Color("#e65cff") },
      uOctaves: { value: quality > 0.6 ? 4 : 3 },
    }),
    [quality],
  );

  useFrame((_, delta) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value += delta * 0.03;
    // Ease progress into the shader so scrub smoothing does not read as steps.
    const u = material.current.uniforms.uProgress;
    u.value += (progress - u.value) * Math.min(1, delta * 3);
  });

  return (
    <mesh scale={60}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fragmentShader={FRAGMENT}
        vertexShader={VERTEX}
      />
    </mesh>
  );
}

const VERTEX = /* glsl */ `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  varying vec3 vPosition;

  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uInk;
  uniform vec3 uViolet;
  uniform vec3 uCyan;
  uniform vec3 uMagenta;
  uniform int uOctaves;

  // Value noise. Cheap, smooth, and good enough for haze at this scale.
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      if (i >= uOctaves) break;
      total += noise(p) * amplitude;
      p *= 2.02;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec3 dir = normalize(vPosition);

    // Two drifting layers at different rates give parallax without motion sickness.
    float slow = fbm(dir * 1.6 + vec3(uTime * 0.4, 0.0, uTime * 0.2));
    float fast = fbm(dir * 3.4 - vec3(0.0, uTime * 0.6, uTime * 0.3));
    float haze = smoothstep(0.25, 0.95, slow * 0.75 + fast * 0.35);

    // Early journey leans violet-magenta and unresolved; later it cools toward
    // cyan as the system aligns.
    vec3 early = mix(uViolet, uMagenta, smoothstep(0.4, 1.0, fast));
    vec3 late = mix(uCyan, uViolet, 0.45);
    vec3 energy = mix(early, late, smoothstep(0.25, 0.85, uProgress));

    // Vertical falloff keeps the horizon calm and the reading zone clean.
    float band = 1.0 - abs(dir.y);
    band = pow(clamp(band, 0.0, 1.0), 1.8);

    vec3 color = uInk + energy * haze * band * 0.34;

    // A faint deep glow so the void never reads as flat black.
    color += uViolet * 0.02 * band;

    gl_FragColor = vec4(color, 1.0);
  }
`;
