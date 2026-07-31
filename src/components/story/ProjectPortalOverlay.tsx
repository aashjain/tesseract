'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import type { Project } from '@/lib/content/types';

/**
 * The project portal.
 *
 * Opening one pushes `/?project=slug`, so the view is linkable and the browser
 * back button closes it. The overlay owns focus while open, restores it on close
 * and always offers the full `/work/[slug]` route underneath.
 */
export function ProjectPortalOverlay({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>('button, a')?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="portal" role="presentation">
      <button
        type="button"
        className="portal__scrim"
        aria-label="Close project"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        className="portal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-title"
      >
        <div className="portal__head">
          <p className="u-eyebrow">{project.client}</p>
          <button type="button" className="u-btn portal__close" onClick={onClose}>
            Close
          </button>
        </div>

        <h2 id="portal-title" className="portal__title">
          {project.title}
        </h2>

        {project.status === 'fixture' ? (
          <p className="portal__notice">
            Sample content — this record shows the structure of an AG Designs case study. It is not
            a real client project.
          </p>
        ) : null}

        <Image
          className="portal__hero"
          src={project.hero.src}
          alt={project.hero.alt}
          width={project.hero.width}
          height={project.hero.height}
          sizes="(max-width: 60rem) 100vw, 44rem"
        />

        <dl className="portal__facts">
          <div>
            <dt>Challenge</dt>
            <dd>{project.challenge}</dd>
          </div>
          <div>
            <dt>Strategic idea</dt>
            <dd>{project.strategicIdea}</dd>
          </div>
          <div>
            <dt>What we created</dt>
            <dd>
              <ul className="portal__list">
                {project.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Outcome</dt>
            <dd>{project.outcome}</dd>
          </div>
        </dl>

        <Link href={`/work/${project.slug}`} className="u-btn u-btn--primary portal__cta">
          Enter case study
        </Link>
      </div>
    </div>
  );
}
