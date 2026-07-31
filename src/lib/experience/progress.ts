/**
 * The story clock, held outside React.
 *
 * `progress` is written by the GSAP master timeline on every scroll tick and read
 * by the camera rig and scene components inside `useFrame`. Nothing here causes
 * a React render — that is the entire point.
 */

import {
  getSceneRanges,
  localProgress,
  sceneAtProgress,
  type SceneKey,
  type SceneRange,
} from '@/lib/experience/sceneManifest';

export type StoryClock = {
  /** Raw 0..1 journey progress from ScrollTrigger. */
  progress: number;
  /** Damped progress used by the camera so fast flicks stay readable. */
  smoothed: number;
  /** Signed scroll velocity in progress units per second. */
  velocity: number;
  /** Pointer position in normalised device coordinates, already damped. */
  pointerX: number;
  pointerY: number;
  /** Seconds since the experience started. Drives ambient motion. */
  elapsed: number;
  ranges: SceneRange[];
  activeIndex: number;
};

export const storyClock: StoryClock = {
  progress: 0,
  smoothed: 0,
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  elapsed: 0,
  ranges: getSceneRanges(false),
  activeIndex: 0,
};

export function configureClock(compact: boolean): void {
  storyClock.ranges = getSceneRanges(compact);
}

/** Local 0..1 progress for a scene, from the shared clock. */
export function sceneProgress(key: SceneKey, smoothed = true): number {
  const range = storyClock.ranges.find((entry) => entry.key === key);
  if (!range) return 0;
  return localProgress(range, smoothed ? storyClock.smoothed : storyClock.progress);
}

/** Whether a scene's group should currently be mounted. */
export function sceneMounted(key: SceneKey): boolean {
  const range = storyClock.ranges.find((entry) => entry.key === key);
  if (!range) return false;
  return storyClock.progress >= range.mountStart && storyClock.progress <= range.mountEnd;
}

export function currentScene(): SceneRange {
  return sceneAtProgress(storyClock.ranges, storyClock.smoothed);
}

/** Smoothstep, the workhorse for scene-local fades and reveals. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
}

/** Rises 0→1 then falls 1→0 across a window. Used for scene-owned beats. */
export function pulse(x: number, start: number, peakStart: number, peakEnd: number, end: number): number {
  if (x <= start || x >= end) return 0;
  if (x < peakStart) return smoothstep(start, peakStart, x);
  if (x > peakEnd) return 1 - smoothstep(peakEnd, end, x);
  return 1;
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
