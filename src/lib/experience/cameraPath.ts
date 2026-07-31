import { Vector3 } from 'three';

import { SCENES, getSceneRanges } from '@/lib/experience/sceneManifest';

/**
 * The authored camera path.
 *
 * Explicit keyframes, sampled with a piecewise Catmull-Rom so velocity stays
 * continuous across scene boundaries. There are no free-fly controls: the only
 * input is story progress. Pointer parallax is applied later, on a child rig,
 * and never touches these values.
 *
 * Roll is authored per keyframe and stays within 3 degrees except for the brief
 * dimensional fold in Scene 3.
 */

export type CameraKey = {
  /** Global journey progress this keyframe sits at. */
  t: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  /** Radians. */
  roll: number;
};

/**
 * Horizontal placement of each scene's content, so the object never sits under
 * the reading zone. Odd scenes keep copy on the left, even scenes on the right.
 */
export function sceneOffsetX(order: number, compact: boolean): number {
  if (compact) return 0;
  // Scenes 1, 2, 3 and 12 own the whole frame: the noise field surrounds the
  // visitor, the camera flies through the centre of the aperture, the tesseract
  // is the subject, and the final orbit must resolve dead centre.
  if (order <= 3 || order === 12) return 0;
  return order % 2 === 1 ? 4.6 : -4.6;
}

/**
 * Builds the keyframe list.
 *
 * Each scene contributes keyframes at its start and at points *inside* its own
 * span — never one at `range.end`. A closing keyframe would share its `t` with
 * the next scene's opening keyframe, and two keys at the same time make the
 * sampler jump the whole station gap in a single frame: a hard cut at every
 * scene boundary. Letting the next scene's opening key close the previous one
 * is what keeps the travel continuous.
 */
function buildKeys(compact: boolean): CameraKey[] {
  const ranges = getSceneRanges(compact);
  const keys: CameraKey[] = [];
  const baseFov = compact ? 62 : 52;

  SCENES.forEach((scene, index) => {
    const range = ranges[index]!;
    const z = scene.stationZ;
    const ox = sceneOffsetX(scene.order, compact);
    // Sit slightly opposite the content so the frame stays asymmetric early and
    // resolves toward centre as the story aligns.
    const lateral = ox * 0.22;
    const span = range.end - range.start;
    const mid = (range.start + range.end) / 2;

    switch (scene.key) {
      case 'fragmentField':
        keys.push(
          { t: range.start, position: [lateral, 0.8, z + 16], target: [ox * 0.4, 0, z], fov: baseFov + 6, roll: 0 },
          { t: range.start + span * 0.44, position: [lateral * 1.4, 0.2, z + 11], target: [ox * 0.5, 0, z - 1], fov: baseFov + 3, roll: 0.01 },
          { t: range.start + span * 0.72, position: [lateral, -0.2, z + 6.5], target: [ox * 0.2, 0, z - 2], fov: baseFov, roll: 0 },
        );
        break;

      case 'apertureA':
        // Approach, then physically cross the counter-space of the A.
        keys.push(
          { t: range.start, position: [lateral * 0.8, 0.4, z + 19], target: [0, 0, z], fov: baseFov, roll: 0 },
          // Hold here: the whole approved silhouette is in frame and readable.
          { t: range.start + span * 0.48, position: [0, 0, z + 10.5], target: [0, 0, z], fov: baseFov - 3, roll: 0 },
          // Into the counter-space. The next scene's opening key carries the
          // camera out the other side.
          { t: range.start + span * 0.78, position: [0, 0, z + 3.6], target: [0, 0, z - 4], fov: baseFov - 8, roll: 0 },
        );
        break;

      case 'tesseractReveal':
        // The 90-degree fold is performed by the object, not by rolling the
        // camera. The camera only arcs a little to reveal the depth.
        keys.push(
          { t: range.start, position: [0, 0, z + 17], target: [0, 0, z], fov: baseFov, roll: 0 },
          { t: mid, position: [ox * 0.5, 1.4, z + 12], target: [ox * 0.2, 0, z], fov: baseFov - 2, roll: 0.05 },
          { t: range.start + span * 0.72, position: [lateral, 0.4, z + 8.5], target: [ox * 0.3, 0, z], fov: baseFov, roll: 0 },
        );
        break;

      case 'resolutionG':
        // Pull back until the completed orbit reads as the G, then settle.
        keys.push(
          { t: range.start, position: [0, 0, z + 12], target: [0, 0, z], fov: baseFov, roll: 0 },
          { t: range.start + span * 0.55, position: [0, 1.4, z + 16], target: [0, 0.4, z], fov: baseFov, roll: 0.02 },
          // The journey's final key. This one *does* sit on the boundary,
          // because there is no scene after it to carry the travel.
          { t: range.end, position: [0, 0.2, z + 18.5], target: [0, 0, z], fov: baseFov - 4, roll: 0 },
        );
        break;

      default:
        // Arrive, hold through the copy beat, then leave. The departure key sits
        // at 0.66 rather than 0.85 so the travel to the next station is spread
        // over a third of the scene instead of lurching in its final frames.
        keys.push(
          { t: range.start, position: [lateral, 0.5, z + 15], target: [ox * 0.35, 0, z], fov: baseFov, roll: 0 },
          { t: range.start + span * 0.4, position: [lateral * 1.3, 0.1, z + 11.5], target: [ox * 0.45, 0, z], fov: baseFov - 1, roll: 0.015 },
          { t: range.start + span * 0.66, position: [lateral * 0.6, -0.3, z + 7.5], target: [ox * 0.25, 0, z], fov: baseFov, roll: 0 },
        );
        break;
    }
  });

  return keys.sort((a, b) => a.t - b.t);
}

const CACHE = new Map<boolean, CameraKey[]>();

export function cameraKeys(compact: boolean): CameraKey[] {
  let keys = CACHE.get(compact);
  if (!keys) {
    keys = buildKeys(compact);
    CACHE.set(compact, keys);
  }
  return keys;
}

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

export type CameraSample = {
  position: Vector3;
  target: Vector3;
  fov: number;
  roll: number;
};

const scratch: CameraSample = {
  position: new Vector3(),
  target: new Vector3(),
  fov: 52,
  roll: 0,
};

/** Samples the authored path at a global progress value. Allocation-free. */
export function sampleCamera(keys: CameraKey[], progress: number): CameraSample {
  const clamped = Math.min(1, Math.max(0, progress));

  let i = 0;
  while (i < keys.length - 2 && keys[i + 1]!.t < clamped) i += 1;

  const k1 = keys[i]!;
  const k2 = keys[i + 1] ?? k1;
  const k0 = keys[i - 1] ?? k1;
  const k3 = keys[i + 2] ?? k2;

  const span = k2.t - k1.t;
  const local = span > 0 ? (clamped - k1.t) / span : 0;
  const t = Math.min(1, Math.max(0, local));

  scratch.position.set(
    catmull(k0.position[0], k1.position[0], k2.position[0], k3.position[0], t),
    catmull(k0.position[1], k1.position[1], k2.position[1], k3.position[1], t),
    catmull(k0.position[2], k1.position[2], k2.position[2], k3.position[2], t),
  );
  scratch.target.set(
    catmull(k0.target[0], k1.target[0], k2.target[0], k3.target[0], t),
    catmull(k0.target[1], k1.target[1], k2.target[1], k3.target[1], t),
    catmull(k0.target[2], k1.target[2], k2.target[2], k3.target[2], t),
  );
  scratch.fov = catmull(k0.fov, k1.fov, k2.fov, k3.fov, t);
  scratch.roll = catmull(k0.roll, k1.roll, k2.roll, k3.roll, t);

  return scratch;
}
