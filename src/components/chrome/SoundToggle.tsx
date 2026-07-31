'use client';

import { useEffect } from 'react';

import { track } from '@/lib/analytics/events';
import { storyClock } from '@/lib/experience/progress';
import { getAmbientEngine } from '@/lib/experience/sound';
import { useExperience } from '@/lib/experience/store';

/**
 * Sound is muted by default and the control only appears after the first
 * explicit gesture. The bed is generative and decorative — no information exists
 * only in audio, so no transcript is required, but the button describes it.
 */
export function SoundToggle() {
  const gestured = useExperience((state) => state.gestured);
  const soundEnabled = useExperience((state) => state.soundEnabled);
  const toggleSound = useExperience((state) => state.toggleSound);
  const mode = useExperience((state) => state.mode);

  const available = gestured && mode !== 'reduced';

  useEffect(() => {
    if (!available) return;
    const engine = getAmbientEngine();
    if (soundEnabled) {
      engine.start();
      track({ name: 'sound_enabled' });
    } else if (engine.running) {
      engine.stop();
    }
    return () => {
      if (engine.running) engine.stop();
    };
  }, [available, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled || !available) return;
    const engine = getAmbientEngine();
    const id = window.setInterval(() => engine.update(storyClock.smoothed), 400);
    return () => window.clearInterval(id);
  }, [soundEnabled, available]);

  if (!available) return null;

  return (
    <button
      type="button"
      className="chrome-sound"
      onClick={toggleSound}
      aria-pressed={soundEnabled}
    >
      <span className={`chrome-sound__bars${soundEnabled ? ' is-on' : ''}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="chrome-sound__label">{soundEnabled ? 'Sound on' : 'Sound off'}</span>
      <span className="u-visually-hidden">
        Ambient background texture. Decorative only — no information is carried by audio.
      </span>
    </button>
  );
}
