'use client';

import { useEffect, useRef } from 'react';

import { track } from '@/lib/analytics/events';
import { useExperience } from '@/lib/experience/store';
import type { Capability, SceneContent } from '@/lib/content/types';

/**
 * `Explore dimensions` — the optional free-exploration layer.
 *
 * The guided scroll remains the default and shows every capability without this
 * control. Opening it exposes the seven capabilities as a plain semantic list;
 * choosing one jumps to that scene's section and updates the URL hash, so the
 * position is linkable and the back button behaves.
 */
export function ServiceNavigator({
  capabilities,
  scenes,
}: {
  capabilities: Capability[];
  scenes: SceneContent[];
}) {
  const open = useExperience((state) => state.dimensionsOpen);
  const setOpen = useExperience((state) => state.setDimensionsOpen);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  const hashFor = (capability: Capability) =>
    scenes.find((scene) => scene.sceneKey === capability.sceneKey)?.hash ?? 'system';

  return (
    <div className="dimensions">
      <button
        ref={triggerRef}
        type="button"
        className="u-btn dimensions__trigger"
        aria-expanded={open}
        aria-controls="dimensions-panel"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close dimensions' : 'Explore dimensions'}
      </button>

      <div
        id="dimensions-panel"
        ref={panelRef}
        className={`dimensions__panel${open ? ' is-open' : ''}`}
        hidden={!open}
      >
        <p className="u-eyebrow dimensions__title">Seven dimensions, one system</p>
        <ol className="dimensions__list">
          {capabilities.map((capability) => (
            <li key={capability.slug}>
              <a
                href={`#${hashFor(capability)}`}
                className="dimensions__link"
                onClick={() => {
                  setOpen(false);
                  track({
                    name: 'service_opened',
                    service: capability.slug,
                    fromScene: 'tesseractReveal',
                  });
                }}
              >
                <span className="dimensions__index">
                  {String(capability.order).padStart(2, '0')}
                </span>
                <span className="dimensions__name">{capability.name}</span>
                <span className="dimensions__proposition">{capability.proposition}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="dimensions__note">
          Prefer a plain index?{' '}
          <a href="/services" className="u-link">
            Open the services page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
