'use client';

import { useEffect } from 'react';
import { useExperience } from '@/lib/experience/store';
import { track } from '@/lib/analytics/events';

/**
 * Runs capability detection once, then records the first explicit user gesture.
 * The gesture flag is what unlocks the sound control — audio is never created
 * before it, so nothing can autoplay.
 */
export function ExperienceBoot() {
  const initialise = useExperience((state) => state.initialise);
  const markGesture = useExperience((state) => state.markGesture);

  useEffect(() => {
    initialise();
    const { mode, tier } = useExperience.getState();
    track({ name: 'experience_started', mode, tier });
  }, [initialise]);

  useEffect(() => {
    const onGesture = () => markGesture();
    const options = { once: true, passive: true } as const;
    window.addEventListener('pointerdown', onGesture, options);
    window.addEventListener('keydown', onGesture, options);
    window.addEventListener('wheel', onGesture, options);
    window.addEventListener('touchstart', onGesture, options);
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('wheel', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
  }, [markGesture]);

  return null;
}
