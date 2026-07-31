'use client';

import { createContext, useContext } from 'react';

import type { QualityTier } from '@/lib/experience/capabilityDetection';
import type { MaterialLibrary } from '@/lib/three/materials';
import { QUALITY_BUDGETS } from '@/lib/experience/capabilityDetection';

export type WorldValue = {
  materials: MaterialLibrary;
  tier: QualityTier;
  compact: boolean;
  budgets: (typeof QUALITY_BUDGETS)[QualityTier];
};

const WorldContext = createContext<WorldValue | null>(null);

export const WorldProvider = WorldContext.Provider;

export function useWorld(): WorldValue {
  const value = useContext(WorldContext);
  if (!value) throw new Error('useWorld must be used inside the canvas world.');
  return value;
}
