'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

import { localProgress, type SceneKey, type SceneRange } from '@/lib/experience/sceneManifest';
import { storyClock } from '@/lib/experience/progress';

/**
 * Per-scene frame loop.
 *
 * Gives each scene its local 0..1 progress and hides the group entirely when the
 * scene is outside its mount window, so an off-screen scene costs one comparison
 * per frame rather than a set of draw calls. No React state is touched here.
 */
export function useSceneFrame(
  key: SceneKey,
  group: React.RefObject<Group | null>,
  update: (local: number, delta: number) => void,
) {
  const rangeRef = useRef<SceneRange | null>(null);

  useFrame((_, rawDelta) => {
    const delta = Math.min(0.05, rawDelta);

    // Ranges are rebuilt when the compact layout applies; re-resolve lazily.
    if (!rangeRef.current) {
      rangeRef.current = storyClock.ranges.find((entry) => entry.key === key) ?? null;
    }
    const range = rangeRef.current;
    if (!range) return;

    const visible =
      storyClock.smoothed >= range.mountStart && storyClock.smoothed <= range.mountEnd;

    const node = group.current;
    if (node && node.visible !== visible) node.visible = visible;
    if (!visible) return;

    update(localProgress(range, storyClock.smoothed), delta);
  });
}

/** Deterministic PRNG so procedural layouts are identical on every load. */
export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
