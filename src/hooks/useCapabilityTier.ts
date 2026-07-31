"use client";

import { useEffect } from "react";
import {
  readStoredPreference,
  useExperience,
  type FallbackReason,
  type Tier,
} from "@/store/experience";

type NetworkInformation = { saveData?: boolean };

/**
 * Capability detection, per the plan's adaptive quality policy: read
 * reduced-motion, Save-Data and WebGL availability BEFORE loading the renderer,
 * and begin conservatively on unknown devices.
 *
 * Detection is deliberately capability-based, not user-agent based. The store
 * starts at tier D, so the accessible version is what renders until this
 * resolves — never the other way round.
 */
export function useCapabilityTier() {
  const setTier = useExperience((s) => s.setTier);

  useEffect(() => {
    const decide = (): { tier: Tier; reason: FallbackReason } => {
      if (readStoredPreference() === "semantic") {
        return { tier: "D", reason: "user-choice" };
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return { tier: "D", reason: "reduced-motion" };
      }

      const connection = (
        navigator as Navigator & { connection?: NetworkInformation }
      ).connection;
      if (connection?.saveData) {
        return { tier: "D", reason: "save-data" };
      }

      if (!hasWebGL()) {
        return { tier: "D", reason: "no-webgl" };
      }

      // Coarse pointer or a narrow viewport means the mobile-light tier: one
      // simplified canvas, no volumetrics, no tiny hotspots.
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrow = window.innerWidth < 768;
      if (coarse || narrow) return { tier: "C", reason: null };

      // Tier A needs headroom. Device memory and core count are hints only and
      // are absent on Safari, so a missing value must not force a downgrade.
      const memory = (navigator as Navigator & { deviceMemory?: number })
        .deviceMemory;
      const cores = navigator.hardwareConcurrency;
      const constrained =
        (typeof memory === "number" && memory <= 4) ||
        (typeof cores === "number" && cores <= 4) ||
        window.innerWidth < 1280;

      return { tier: constrained ? "B" : "A", reason: null };
    };

    const { tier, reason } = decide();
    setTier(tier, reason);

    // Honour a mid-session reduced-motion change.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setTier("D", "reduced-motion");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setTier]);
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}
