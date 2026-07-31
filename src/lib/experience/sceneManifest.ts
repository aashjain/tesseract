/**
 * The code-controlled scene manifest.
 *
 * This is the story clock. Scene order, timeline labels, scroll weights, world
 * stations and asset packages live here — never in the CMS. Editors change copy,
 * media, capability links and the curated colour variant; they can never move a
 * camera, reorder the narrative or inject geometry.
 */

export const SCENE_KEYS = [
  'fragmentField',
  'apertureA',
  'tesseractReveal',
  'axesOfIntent',
  'identityEngine',
  'signalConstellation',
  'momentumField',
  'matterLab',
  'portalStack',
  'evidenceChamber',
  'humanNode',
  'resolutionG',
] as const;

export type SceneKey = (typeof SCENE_KEYS)[number];

export type ActKey = 'fragmentation' | 'system' | 'proof' | 'resolution';

export type SceneDefinition = {
  key: SceneKey;
  order: number;
  /** GSAP timeline label. Scene lengths can change without rewriting camera logic. */
  label: string;
  act: ActKey;
  /** Working title, used in the story progress readout. */
  title: string;
  /**
   * Relative scroll length, in viewport heights.
   *
   * Must stay above 1: a sticky reading zone is only pinned for
   * `weight - 1` viewports, so a one-viewport scene would scroll its own copy
   * out of frame while the camera was still playing it. Normalised at runtime,
   * so retiming a scene never requires touching hard-coded percentages.
   */
  weight: number;
  /** Mobile tier compresses total scroll distance by ~30%, as specified. */
  mobileWeight: number;
  /** World-space station this scene's group occupies, in metres. */
  stationZ: number;
  /** Asset package name — lazily loaded one to two scenes ahead. */
  assetPackage: 'core' | 'system' | 'craft' | 'proof' | 'resolution';
  /**
   * How much of the scene group should stay mounted around its active window,
   * expressed in global progress. Keeps transitions continuous.
   */
  mountLead: number;
};

const STATION_SPACING = 26;

const definitions: Omit<SceneDefinition, 'order' | 'stationZ' | 'label'>[] = [
  {
    key: 'fragmentField',
    act: 'fragmentation',
    title: 'The Fragment Field',
    weight: 2.2,
    mobileWeight: 1.6,
    assetPackage: 'core',
    mountLead: 0.06,
  },
  {
    key: 'apertureA',
    act: 'fragmentation',
    title: 'The A Aperture',
    weight: 2.0,
    mobileWeight: 1.5,
    assetPackage: 'core',
    mountLead: 0.06,
  },
  {
    key: 'tesseractReveal',
    act: 'system',
    title: 'The Tesseract Revealed',
    weight: 2.1,
    mobileWeight: 1.6,
    assetPackage: 'core',
    mountLead: 0.06,
  },
  {
    key: 'axesOfIntent',
    act: 'system',
    title: 'Axes of Intent',
    weight: 1.8,
    mobileWeight: 1.35,
    assetPackage: 'system',
    mountLead: 0.05,
  },
  {
    key: 'identityEngine',
    act: 'system',
    title: 'The Identity Engine',
    weight: 1.8,
    mobileWeight: 1.35,
    assetPackage: 'system',
    mountLead: 0.05,
  },
  {
    key: 'signalConstellation',
    act: 'system',
    title: 'The Signal Constellation',
    weight: 1.85,
    mobileWeight: 1.4,
    assetPackage: 'system',
    mountLead: 0.05,
  },
  {
    key: 'momentumField',
    act: 'proof',
    title: 'The Momentum Field',
    weight: 1.8,
    mobileWeight: 1.35,
    assetPackage: 'craft',
    mountLead: 0.05,
  },
  {
    key: 'matterLab',
    act: 'proof',
    title: 'The Matter Lab',
    weight: 1.8,
    mobileWeight: 1.35,
    assetPackage: 'craft',
    mountLead: 0.05,
  },
  {
    key: 'portalStack',
    act: 'proof',
    title: 'The Portal Stack',
    weight: 1.8,
    mobileWeight: 1.35,
    assetPackage: 'craft',
    mountLead: 0.05,
  },
  {
    key: 'evidenceChamber',
    act: 'proof',
    title: 'The Evidence Chamber',
    weight: 2.1,
    mobileWeight: 1.6,
    assetPackage: 'proof',
    mountLead: 0.06,
  },
  {
    key: 'humanNode',
    act: 'resolution',
    title: 'The Human Node',
    weight: 1.9,
    mobileWeight: 1.4,
    assetPackage: 'proof',
    mountLead: 0.05,
  },
  {
    key: 'resolutionG',
    act: 'resolution',
    title: 'The G Resolution',
    weight: 2.4,
    mobileWeight: 1.8,
    assetPackage: 'resolution',
    mountLead: 0.08,
  },
];

export const SCENES: SceneDefinition[] = definitions.map((definition, index) => ({
  ...definition,
  order: index + 1,
  label: `scene-${String(index + 1).padStart(2, '0')}-${definition.key}`,
  stationZ: -STATION_SPACING * index,
}));

export const SCENE_COUNT = SCENES.length;

export const ACT_TITLES: Record<ActKey, string> = {
  fragmentation: 'Act I — Fragmentation',
  system: 'Act II — The organising system',
  proof: 'Act III — Making and proof',
  resolution: 'Act IV — Human resolution',
};

export type SceneRange = {
  key: SceneKey;
  order: number;
  label: string;
  /** Inclusive global progress at which the scene begins. */
  start: number;
  /** Exclusive global progress at which the scene ends. */
  end: number;
  mountStart: number;
  mountEnd: number;
};

/**
 * Normalised progress ranges for the whole journey. `compact` applies the mobile
 * weights so the same 12 beats fit a shorter scroll distance.
 */
export function buildSceneRanges(compact = false): SceneRange[] {
  const weights = SCENES.map((scene) => (compact ? scene.mobileWeight : scene.weight));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;

  return SCENES.map((scene, index) => {
    const weight = weights[index] ?? scene.weight;
    const start = cursor;
    const end = cursor + weight / total;
    cursor = end;
    return {
      key: scene.key,
      order: scene.order,
      label: scene.label,
      start,
      end,
      mountStart: Math.max(0, start - scene.mountLead),
      mountEnd: Math.min(1, end + scene.mountLead),
    };
  });
}

export const SCENE_RANGES = buildSceneRanges(false);
export const SCENE_RANGES_COMPACT = buildSceneRanges(true);

export function getSceneRanges(compact: boolean): SceneRange[] {
  return compact ? SCENE_RANGES_COMPACT : SCENE_RANGES;
}

/** Local 0..1 progress within a scene, given global journey progress. */
export function localProgress(range: SceneRange, global: number): number {
  const span = range.end - range.start;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (global - range.start) / span));
}

export function sceneAtProgress(ranges: SceneRange[], progress: number): SceneRange {
  const clamped = Math.min(0.999999, Math.max(0, progress));
  const found = ranges.find((range) => clamped >= range.start && clamped < range.end);
  // The final range owns progress === 1.
  return found ?? ranges[ranges.length - 1]!;
}

export function sceneByKey(key: SceneKey): SceneDefinition {
  const scene = SCENES.find((entry) => entry.key === key);
  if (!scene) throw new Error(`Unknown scene key: ${key}`);
  return scene;
}
