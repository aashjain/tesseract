'use client';

import { useEffect, useState } from 'react';

/**
 * Loading state for the immersive route.
 *
 * The HTML shell — headline, navigation, copy — is already painted behind this
 * layer, so the loader is a veil over a working page rather than a gate in front
 * of an empty one. There is no fake percentage: the phrase is indeterminate, and
 * after five seconds the visitor is offered the lighter route.
 */
export function StoryLoader({ ready, onSkip }: { ready: boolean; onSkip: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  const [offerLight, setOfferLight] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setOfferLight(true), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setDismissed(true), 420);
    return () => window.clearTimeout(timer);
  }, [ready]);

  if (dismissed) return null;

  return (
    <div className={`loader${ready ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <div className="loader__inner">
        <p className="loader__status u-eyebrow">Tuning the signal</p>
        <span className="loader__track" aria-hidden="true">
          <span className="loader__pulse" />
        </span>
        {offerLight && !ready ? (
          <button type="button" className="u-btn loader__light" onClick={onSkip}>
            Continue in light mode
          </button>
        ) : null}
      </div>
    </div>
  );
}
