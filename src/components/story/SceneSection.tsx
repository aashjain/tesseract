'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { track } from '@/lib/analytics/events';
import { createCopyTrigger } from '@/lib/experience/timeline';
import { SCENES } from '@/lib/experience/sceneManifest';
import type { Capability, Project, SceneContent } from '@/lib/content/types';

type Props = {
  scene: SceneContent;
  weight: number;
  capabilities: Capability[];
  projects: Project[];
  onOpenProject: (slug: string) => void;
  /**
   * `true` forces the copy visible — the non-immersive tiers show every scene
   * at once. In the immersive tiers this is `false` and visibility is decided
   * by the section's own pin window instead.
   */
  alwaysVisible: boolean;
  /** Scene 3 exposes the capability index; scene 12 carries the final CTA. */
  extra?: React.ReactNode;
};

/**
 * One semantic section per scene.
 *
 * The section owns real scroll distance (`--scene-weight` viewport heights) and
 * its copy is sticky-centred inside it. That keeps document order, heading
 * order and keyboard order identical to visual order — no pinning tricks, no
 * faked scrollbar, and fast scrolling always lands on a stable state because
 * the copy is laid out by the browser rather than animated into place.
 */
export function SceneSection({
  scene,
  weight,
  capabilities,
  projects,
  onOpenProject,
  alwaysVisible,
  extra,
}: Props) {
  const definition = SCENES[scene.order - 1]!;
  const ref = useRef<HTMLElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (alwaysVisible) return;
    const element = ref.current;
    if (!element) return;
    return createCopyTrigger(element, setPinned);
  }, [alwaysVisible]);

  const active = alwaysVisible || pinned;

  return (
    <section
      ref={ref}
      id={scene.hash}
      className={`scene scene--${scene.variant}${active ? ' is-active' : ''}`}
      style={{ '--scene-weight': weight } as React.CSSProperties}
      aria-labelledby={`${scene.hash}-heading`}
      data-scene={scene.sceneKey}
      data-order={scene.order}
    >
      <div className="scene__stage">
        <div className="scene__copy">
          <p className="scene__eyebrow u-eyebrow">
            <span className="scene__index">{String(scene.order).padStart(2, '0')}</span>
            <span className="scene__rule" aria-hidden="true" />
            {scene.eyebrow}
          </p>

          <h2 id={`${scene.hash}-heading`} className="scene__headline">
            {scene.headline}
          </h2>

          <p className="scene__support">{scene.support}</p>

          {scene.detail ? <p className="scene__detail">{scene.detail}</p> : null}

          {capabilities.length > 0 ? (
            <ul className="scene__capabilities">
              {capabilities.map((capability) => (
                <li key={capability.slug}>
                  <Link
                    href={`/services#${capability.slug}`}
                    className="scene__capability u-link"
                    onClick={() =>
                      track({
                        name: 'service_opened',
                        service: capability.slug,
                        fromScene: scene.sceneKey,
                      })
                    }
                  >
                    {capability.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {projects.length > 0 ? (
            <ul className="scene__proofs">
              {projects.map((project) => (
                <li key={project.slug}>
                  <button
                    type="button"
                    className="scene__proof"
                    onClick={() => onOpenProject(project.slug)}
                  >
                    <span className="scene__proof-label">View the proof</span>
                    <span className="scene__proof-title">{project.title}</span>
                    <span className="scene__proof-client">{project.client}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {extra}
        </div>

        <p className="scene__act u-eyebrow" aria-hidden="true">
          {definition.title}
        </p>
      </div>
    </section>
  );
}
