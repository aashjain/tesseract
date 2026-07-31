'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import { useExperience } from '@/lib/experience/store';

/**
 * Runtime quality controller.
 *
 * Samples frame time after interaction has settled, then steps down in the order
 * the plan specifies: device pixel ratio, then particle counts (via the tier
 * budgets), then post-processing. It never steps back up during a session, so
 * the visitor does not experience oscillating quality.
 */
export function AdaptiveQuality({
  maxDpr,
  onFailure,
}: {
  maxDpr: number;
  onFailure: (reason: string) => void;
}) {
  const gl = useThree((state) => state.gl);
  const setDpr = useThree((state) => state.setDpr);
  const degrade = useExperience((state) => state.degrade);

  const dpr = useRef(maxDpr);
  const samples = useRef<number[]>([]);
  const settleAt = useRef(0);
  const lastStepAt = useRef(0);
  const contextLosses = useRef(0);

  useEffect(() => {
    setDpr(Math.min(maxDpr, window.devicePixelRatio));
    dpr.current = Math.min(maxDpr, window.devicePixelRatio);
  }, [maxDpr, setDpr]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onLost = (event: Event) => {
      event.preventDefault();
      contextLosses.current += 1;
      if (contextLosses.current >= 2) onFailure('context-lost-twice');
    };

    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl, onFailure]);

  useFrame((state, delta) => {
    const now = state.clock.elapsedTime;
    // Give the scene ~2.5s to settle before believing any measurement.
    if (settleAt.current === 0) settleAt.current = now + 2.5;
    if (now < settleAt.current) return;

    samples.current.push(delta);
    if (samples.current.length < 90) return;

    const sorted = [...samples.current].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    samples.current.length = 0;

    // Do not step more than once every few seconds.
    if (now - lastStepAt.current < 4) return;

    const fps = median > 0 ? 1 / median : 60;

    if (fps < 24) {
      onFailure('sustained-low-framerate');
      return;
    }

    if (fps < 42) {
      lastStepAt.current = now;
      if (dpr.current > 1) {
        dpr.current = Math.max(1, dpr.current - 0.25);
        setDpr(dpr.current);
      } else {
        degrade('frame-budget');
      }
    }
  });

  return null;
}
