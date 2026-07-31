/**
 * Seeded pseudo-random number generator (mulberry32).
 *
 * Scene layouts must be deterministic: the same seed always produces the same
 * fragment field, particulate distribution and node ring. That keeps the
 * composition art-directable, makes visual regressions reproducible, and avoids
 * any server/client or StrictMode variance from `Math.random()` running during
 * render.
 */
export function createRandom(seed: number) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fixed seeds, one per system, so tweaking one does not reshuffle another. */
export const SEEDS = {
  fragments: 0x41474446, // "AGDF"
  particulate: 0x41475041, // "AGPA"
  signals: 0x4147534e, // "AGSN"
} as const;
