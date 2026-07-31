"use client";

import { create } from "zustand";
import { scenes } from "@/content/scenes";

/**
 * Experience tiers from the production plan.
 *
 * A — full cinematic. B — balanced 3D. C — mobile light.
 * D — semantic fallback (reduced motion, Save-Data, no WebGL, repeated context
 * loss, or explicit user choice). D is also the server-rendered default, so the
 * accessible version is what ships before any capability detection runs.
 */
export type Tier = "A" | "B" | "C" | "D";

export type FallbackReason =
  | "reduced-motion"
  | "save-data"
  | "no-webgl"
  | "context-lost"
  | "user-choice"
  | null;

type ExperienceState = {
  tier: Tier;
  fallbackReason: FallbackReason;
  /** True once capability detection has run on the client. */
  detected: boolean;
  /** 0-1 progress through the whole journey. */
  progress: number;
  activeSceneIndex: number;
  soundEnabled: boolean;
  menuOpen: boolean;
  /** Consecutive WebGL context losses. Two drops the visitor to tier D. */
  contextLosses: number;

  setTier: (tier: Tier, reason?: FallbackReason) => void;
  setProgress: (progress: number) => void;
  setActiveScene: (index: number) => void;
  toggleSound: () => void;
  setMenuOpen: (open: boolean) => void;
  /** Explicit "Explore normally" — persists for the session. */
  chooseSemantic: () => void;
  registerContextLoss: () => void;
};

const SESSION_KEY = "ag-experience-mode";

export const useExperience = create<ExperienceState>((set, get) => ({
  tier: "D",
  fallbackReason: null,
  detected: false,
  progress: 0,
  activeSceneIndex: 1,
  soundEnabled: false,
  menuOpen: false,
  contextLosses: 0,

  setTier: (tier, reason = null) =>
    set({ tier, fallbackReason: reason, detected: true }),

  setProgress: (progress) => {
    const clamped = Math.min(1, Math.max(0, progress));
    if (Math.abs(clamped - get().progress) < 0.0005) return;
    set({ progress: clamped });
  },

  setActiveScene: (index) => {
    if (index === get().activeSceneIndex) return;
    if (index < 1 || index > scenes.length) return;
    set({ activeSceneIndex: index });
  },

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  setMenuOpen: (menuOpen) => set({ menuOpen }),

  chooseSemantic: () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "semantic");
    } catch {
      // Storage can be unavailable in private modes. The choice still applies
      // for this page view; it just will not persist.
    }
    set({ tier: "D", fallbackReason: "user-choice", detected: true });
  },

  registerContextLoss: () => {
    const losses = get().contextLosses + 1;
    if (losses >= 2) {
      set({
        contextLosses: losses,
        tier: "D",
        fallbackReason: "context-lost",
        detected: true,
      });
      return;
    }
    set({ contextLosses: losses });
  },
}));

export function readStoredPreference(): "semantic" | null {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "semantic"
      ? "semantic"
      : null;
  } catch {
    return null;
  }
}
