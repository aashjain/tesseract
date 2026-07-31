'use client';

import { create } from 'zustand';
import {
  detectCapabilities,
  type ExperienceMode,
  type QualityTier,
} from '@/lib/experience/capabilityDetection';
import { SCENES, type SceneKey } from '@/lib/experience/sceneManifest';

/**
 * Low-frequency experience state only.
 *
 * Scroll progress is deliberately NOT here — it updates every frame and lives in
 * `src/lib/experience/progress.ts` as a mutable store outside React. This store
 * holds things that change a handful of times per session.
 */

const SOUND_KEY = 'ag:sound';
const SEMANTIC_KEY = 'ag:semantic';

export type ExperienceState = {
  ready: boolean;
  mode: ExperienceMode;
  tier: QualityTier;
  coarsePointer: boolean;
  maxDpr: number;
  detectionReason: string;
  /** Scene currently owning the story, derived from the master timeline. */
  activeScene: SceneKey;
  activeSceneOrder: number;
  /** True once the visitor has scrolled past the opening beat. */
  journeyStarted: boolean;
  soundEnabled: boolean;
  soundAvailable: boolean;
  /** Set once the visitor makes any explicit gesture; gates audio. */
  gestured: boolean;
  menuOpen: boolean;
  dimensionsOpen: boolean;
  /** Number of times the tier has stepped down; never steps back up. */
  degradations: number;

  initialise: () => void;
  setActiveScene: (key: SceneKey) => void;
  setJourneyStarted: (value: boolean) => void;
  degrade: (reason: string) => void;
  switchToFallback: (reason: string) => void;
  toggleSound: () => void;
  markGesture: () => void;
  setMenuOpen: (open: boolean) => void;
  setDimensionsOpen: (open: boolean) => void;
};

function readStoredBoolean(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeStoredBoolean(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* storage unavailable — preference simply does not persist */
  }
}

const firstScene = SCENES[0]!;

export const useExperience = create<ExperienceState>((set, get) => ({
  ready: false,
  mode: 'fallback',
  tier: 'low',
  coarsePointer: false,
  maxDpr: 1,
  detectionReason: 'pending',
  activeScene: firstScene.key,
  activeSceneOrder: firstScene.order,
  journeyStarted: false,
  soundEnabled: false,
  soundAvailable: false,
  gestured: false,
  menuOpen: false,
  dimensionsOpen: false,
  degradations: 0,

  initialise: () => {
    if (get().ready) return;
    const preferSemantic = readStoredBoolean(SEMANTIC_KEY);
    const result = detectCapabilities({ preferSemantic });
    set({
      ready: true,
      mode: result.mode,
      tier: result.tier,
      coarsePointer: result.coarsePointer,
      maxDpr: result.maxDpr,
      detectionReason: result.reason,
      // Sound preference is remembered, but never auto-plays: it still waits
      // for an explicit gesture before any audio node is created.
      soundEnabled: readStoredBoolean(SOUND_KEY),
    });
  },

  setActiveScene: (key) => {
    if (get().activeScene === key) return;
    const scene = SCENES.find((entry) => entry.key === key);
    set({ activeScene: key, activeSceneOrder: scene?.order ?? 1 });
  },

  setJourneyStarted: (value) => {
    if (get().journeyStarted === value) return;
    set({ journeyStarted: value });
  },

  degrade: (reason) => {
    const { tier, degradations } = get();
    const next: QualityTier = tier === 'high' ? 'medium' : 'low';
    if (next === tier) return;
    set({ tier: next, degradations: degradations + 1, detectionReason: reason });
  },

  switchToFallback: (reason) => {
    if (get().mode === 'fallback') return;
    set({ mode: 'fallback', tier: 'low', detectionReason: reason });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    writeStoredBoolean(SOUND_KEY, next);
    set({ soundEnabled: next, soundAvailable: true });
  },

  markGesture: () => {
    if (get().gestured) return;
    set({ gestured: true, soundAvailable: true });
  },

  setMenuOpen: (open) => set({ menuOpen: open }),
  setDimensionsOpen: (open) => set({ dimensionsOpen: open }),
}));

/** Persist a user-selected semantic mode for the rest of the session. */
export function rememberSemanticPreference(value: boolean): void {
  writeStoredBoolean(SEMANTIC_KEY, value);
}
