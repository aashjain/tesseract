/**
 * Capability detection for the experience tiers.
 *
 * Detection is feature- and measurement-based, not user-agent sniffing. The
 * result decides which of the five modes the visitor starts in; the runtime
 * quality controller may later step *down* from that starting point.
 */

export type ExperienceMode = 'full' | 'balanced' | 'mobile' | 'reduced' | 'fallback';

export type QualityTier = 'high' | 'medium' | 'low';

export type DetectionResult = {
  mode: ExperienceMode;
  tier: QualityTier;
  /** Devices with a coarse primary pointer get touch-first interaction rules. */
  coarsePointer: boolean;
  maxDpr: number;
  reason: string;
};

export type DetectionOverrides = {
  /** User-selected semantic mode, remembered for the session. */
  preferSemantic?: boolean;
};

const FALLBACK: DetectionResult = {
  mode: 'fallback',
  tier: 'low',
  coarsePointer: false,
  maxDpr: 1,
  reason: 'server',
};

/**
 * Deliberately a capability check, not a probe.
 *
 * Creating a throwaway context to test for WebGL burns one of the browser's
 * limited contexts and — worse — reports a false negative when the GPU process
 * has not finished starting, which silently drops capable visitors into the
 * semantic tier. Instead we check that the API exists, and let a genuine
 * renderer failure fall back through `RendererBoundary`.
 */
function hasWebGL(): boolean {
  return (
    typeof WebGLRenderingContext !== 'undefined' ||
    typeof WebGL2RenderingContext !== 'undefined'
  );
}

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function detectCapabilities(overrides: DetectionOverrides = {}): DetectionResult {
  if (typeof window === 'undefined') return FALLBACK;

  const nav = navigator as NavigatorWithHints;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (overrides.preferSemantic) {
    return { mode: 'fallback', tier: 'low', coarsePointer, maxDpr: 1, reason: 'user-selected' };
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { mode: 'reduced', tier: 'low', coarsePointer, maxDpr: 1, reason: 'prefers-reduced-motion' };
  }

  if (nav.connection?.saveData) {
    return { mode: 'fallback', tier: 'low', coarsePointer, maxDpr: 1, reason: 'save-data' };
  }

  if (!hasWebGL()) {
    return { mode: 'fallback', tier: 'low', coarsePointer, maxDpr: 1, reason: 'no-webgl' };
  }

  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const width = window.innerWidth;

  if (coarsePointer || width < 768) {
    const weak = memory <= 4 || cores <= 4;
    return {
      mode: 'mobile',
      tier: weak ? 'low' : 'medium',
      coarsePointer,
      maxDpr: weak ? 1.15 : 1.25,
      reason: 'small-viewport',
    };
  }

  if (memory <= 4 || cores <= 4 || width < 1200) {
    return { mode: 'balanced', tier: 'medium', coarsePointer, maxDpr: 1.5, reason: 'constrained-device' };
  }

  return { mode: 'full', tier: 'high', coarsePointer, maxDpr: 1.75, reason: 'capable-device' };
}

/** Budgets applied per quality tier. Starting gates, tuned by measurement. */
export const QUALITY_BUDGETS: Record<
  QualityTier,
  {
    fragmentCount: number;
    railSegments: number;
    signalNodes: number;
    bloom: boolean;
    grain: boolean;
    shadowed: boolean;
  }
> = {
  high: { fragmentCount: 720, railSegments: 64, signalNodes: 34, bloom: true, grain: true, shadowed: true },
  medium: { fragmentCount: 380, railSegments: 40, signalNodes: 22, bloom: true, grain: false, shadowed: false },
  low: { fragmentCount: 170, railSegments: 24, signalNodes: 14, bloom: false, grain: false, shadowed: false },
};

/** Modes in which the persistent WebGL canvas is mounted at all. */
export function rendersWebGL(mode: ExperienceMode): boolean {
  return mode === 'full' || mode === 'balanced' || mode === 'mobile';
}

/** Modes that use the compressed mobile scroll distance. */
export function usesCompactScroll(mode: ExperienceMode): boolean {
  return mode === 'mobile';
}
