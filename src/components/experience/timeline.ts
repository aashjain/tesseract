import { sceneTimeline } from "@/content/scenes";

/** Normalised 0-1 position of a scene's start on the master timeline. */
export function sceneStart(id: string) {
  return sceneTimeline.find((s) => s.id === id)?.start ?? 0;
}

/** Normalised 0-1 position of a scene's end on the master timeline. */
export function sceneEnd(id: string) {
  return sceneTimeline.find((s) => s.id === id)?.end ?? 1;
}

/** Remaps global progress into 0-1 across an arbitrary window. */
export function range(p: number, start: number, end: number) {
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (p - start) / (end - start)));
}

/** Remaps global progress into 0-1 across a named scene. */
export function within(p: number, id: string) {
  return range(p, sceneStart(id), sceneEnd(id));
}

/**
 * Remaps across a window spanning from one scene's start to another's end,
 * for objects that persist across several beats.
 */
export function span(p: number, fromId: string, toId: string) {
  return range(p, sceneStart(fromId), sceneEnd(toId));
}

/** Smoothstep, for easing values that are driven directly by scroll. */
export function smooth(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Rises 0->1 then falls 1->0 across a window. Used for scene-local presence. */
export function pulse(p: number, start: number, end: number, edge = 0.18) {
  const t = range(p, start, end);
  return smooth(Math.min(t / edge, 1)) * smooth(Math.min((1 - t) / edge, 1));
}
