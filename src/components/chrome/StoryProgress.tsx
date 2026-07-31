'use client';

import { useEffect, useRef } from 'react';

import { storyClock } from '@/lib/experience/progress';
import { SCENE_COUNT, SCENES } from '@/lib/experience/sceneManifest';
import { useExperience } from '@/lib/experience/store';

/**
 * Compact `03 / 12 — Scene name` readout.
 *
 * The bar is written directly to the DOM from an animation frame rather than
 * through React state, so scrolling never triggers a re-render. The label is a
 * polite live region; the numeric fraction is hidden from assistive tech because
 * the scene name already carries the meaning.
 */
export function StoryProgress() {
  const journeyStarted = useExperience((state) => state.journeyStarted);
  const activeSceneOrder = useExperience((state) => state.activeSceneOrder);
  const mode = useExperience((state) => state.mode);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (mode === 'fallback' || mode === 'reduced') return;
    let frame = 0;
    const tick = () => {
      const bar = barRef.current;
      if (bar) bar.style.transform = `scaleX(${storyClock.smoothed.toFixed(4)})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  const scene = SCENES[activeSceneOrder - 1] ?? SCENES[0]!;

  return (
    <div className={`chrome-progress${journeyStarted ? ' is-visible' : ''}`}>
      <span className="chrome-progress__index" aria-hidden="true">
        {String(scene.order).padStart(2, '0')} / {SCENE_COUNT}
      </span>
      <span className="chrome-progress__track" aria-hidden="true">
        <span ref={barRef} className="chrome-progress__bar" />
      </span>
      <span className="chrome-progress__label" aria-live="polite">
        {scene.title}
      </span>
    </div>
  );
}
