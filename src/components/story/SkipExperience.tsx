'use client';

import { track } from '@/lib/analytics/events';
import { rememberSemanticPreference, useExperience } from '@/lib/experience/store';

/**
 * The escape route, present in the first viewport.
 *
 * `Explore normally` switches to the semantic presentation and remembers the
 * choice for the session. It is a real button, not a hover-revealed affordance.
 */
export function SkipExperience() {
  const mode = useExperience((state) => state.mode);
  const activeScene = useExperience((state) => state.activeScene);
  const switchToFallback = useExperience((state) => state.switchToFallback);

  if (mode === 'fallback') return null;

  return (
    <div className="skip-experience">
      <button
        type="button"
        className="u-btn u-btn--ghost skip-experience__button"
        onClick={() => {
          rememberSemanticPreference(true);
          track({ name: 'experience_skipped', scene: activeScene, reason: 'control' });
          switchToFallback('user-selected');
        }}
      >
        Explore normally
      </button>
      <p className="skip-experience__hint">Same story, no camera. Your choice is remembered.</p>
    </div>
  );
}

/** Offered inside the semantic presentation so the choice is reversible. */
export function ReturnToJourney() {
  const mode = useExperience((state) => state.mode);

  if (mode !== 'fallback') return null;

  return (
    <button
      type="button"
      className="u-btn skip-experience__return"
      onClick={() => {
        rememberSemanticPreference(false);
        window.location.reload();
      }}
    >
      Return to the journey
    </button>
  );
}
