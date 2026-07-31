"use client";

import dynamic from "next/dynamic";
import { useCapabilityTier } from "@/hooks/useCapabilityTier";
import { useExperience } from "@/store/experience";

/**
 * Client-only island for the renderer.
 *
 * The three.js bundle is never part of the initial route payload — it loads
 * only after capability detection has decided this device should get it. Tier D
 * visitors never download it at all.
 */
const CosmicScene = dynamic(() => import("./CosmicScene"), { ssr: false });

export function ExperienceCanvas() {
  useCapabilityTier();
  const tier = useExperience((s) => s.tier);
  const detected = useExperience((s) => s.detected);

  if (!detected || tier === "D") return null;
  return <CosmicScene />;
}
