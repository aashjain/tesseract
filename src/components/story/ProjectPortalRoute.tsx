'use client';

import { useEffect, useMemo, useState } from 'react';

import { ProjectPortalOverlay } from '@/components/story/ProjectPortalOverlay';
import {
  closePortal,
  readPortalSlug,
  subscribeToPortal,
  watchHistory,
} from '@/lib/experience/portalController';
import type { Project } from '@/lib/content/types';

/**
 * Renders whichever project portal is currently open.
 *
 * This is a separate, client-only component on purpose. Reading the URL at the
 * top of `ExperienceShell` would opt the entire homepage out of static
 * prerendering, and the twelve scene sections, headlines, capability links and
 * CTA all have to be in the server-rendered HTML. Only this overlay is
 * client-rendered.
 */
export function ProjectPortalRoute({ projects }: { projects: Project[] }) {
  // The initial value comes from the URL, so a shared `?project=` link opens
  // straight to that case study.
  const [slug, setSlug] = useState<string | null>(readPortalSlug);

  useEffect(() => {
    const unsubscribe = subscribeToPortal(setSlug);
    const unwatch = watchHistory();
    return () => {
      unsubscribe();
      unwatch();
    };
  }, []);

  const projectBySlug = useMemo(
    () => new Map(projects.map((project) => [project.slug, project])),
    [projects],
  );

  const project = slug ? (projectBySlug.get(slug) ?? null) : null;

  return <ProjectPortalOverlay project={project} onClose={closePortal} />;
}
