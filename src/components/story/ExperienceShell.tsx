'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AGLogoFull } from '@/components/brand/AGLogo';
import { ProjectPortalRoute } from '@/components/story/ProjectPortalRoute';
import { SceneSection } from '@/components/story/SceneSection';
import { ServiceNavigator } from '@/components/story/ServiceNavigator';
import { ReturnToJourney, SkipExperience } from '@/components/story/SkipExperience';
import { StoryLoader } from '@/components/story/StoryLoader';
import { track, trackOnce } from '@/lib/analytics/events';
import {
  rendersWebGL,
  usesCompactScroll,
  type ExperienceMode,
} from '@/lib/experience/capabilityDetection';
import { SCENES } from '@/lib/experience/sceneManifest';
import { openPortal } from '@/lib/experience/portalController';
import { createMasterTimeline, refreshTimeline } from '@/lib/experience/timeline';
import { useExperience } from '@/lib/experience/store';
import type {
  Capability,
  HomeExperience,
  Person,
  Project,
  SiteSettings,
} from '@/lib/content/types';

/** The renderer is a client-only island, loaded after the shell is interactive. */
const CanvasHost = dynamic(
  () => import('@/components/three/CanvasHost').then((mod) => mod.CanvasHost),
  { ssr: false },
);

type Props = {
  settings: SiteSettings;
  home: HomeExperience;
  capabilities: Capability[];
  projects: Project[];
  people: Person[];
};

export function ExperienceShell({ settings, home, capabilities, projects, people }: Props) {
  const railRef = useRef<HTMLDivElement>(null);

  const ready = useExperience((state) => state.ready);
  const mode = useExperience((state) => state.mode);
  const setActiveScene = useExperience((state) => state.setActiveScene);
  const setJourneyStarted = useExperience((state) => state.setJourneyStarted);
  const switchToFallback = useExperience((state) => state.switchToFallback);

  const [rendererReady, setRendererReady] = useState(false);

  // Server-rendered markup is the semantic variant; the client upgrades it once
  // detection has run. Both variants contain identical copy, links and CTA.
  const resolvedMode: ExperienceMode = ready ? mode : 'fallback';
  const immersive = rendersWebGL(resolvedMode);
  const compact = usesCompactScroll(resolvedMode);

  const projectBySlug = useMemo(
    () => new Map(projects.map((project) => [project.slug, project])),
    [projects],
  );
  const capabilityBySlug = useMemo(
    () => new Map(capabilities.map((capability) => [capability.slug, capability])),
    [capabilities],
  );

  const handleOpenProject = useCallback((slug: string) => {
    track({ name: 'project_previewed', project: slug });
    openPortal(slug);
  }, []);

  // The master timeline only exists in the immersive modes. In reduced and
  // fallback modes there is no scrubbed camera at all — not a slowed-down one.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !immersive) return;
    return createMasterTimeline({
      rail,
      compact,
      onSceneChange: (key, order) => {
        setActiveScene(key);
        trackOnce(`scene_${key}`, { name: 'scene_reached', scene: key, order });
      },
      onJourneyStart: () => setJourneyStarted(true),
    });
  }, [immersive, compact, setActiveScene, setJourneyStarted]);

  useEffect(() => {
    if (!immersive) return;
    // Section heights change with the mode; measure after the class lands.
    const id = window.setTimeout(refreshTimeline, 60);
    return () => window.clearTimeout(id);
  }, [immersive, resolvedMode]);

  // A `/#strategy` deep link is applied by the browser before hydration, when
  // every section is still one viewport tall. Once the immersive layout expands
  // them the original target is hundreds of pixels away, so re-apply it.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const id = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ block: 'start' });
    }, 140);
    return () => window.clearTimeout(id);
  }, [resolvedMode]);

  /**
   * DOM height of a scene section, in viewport heights.
   *
   * The final scene carries one extra viewport. That tail is what makes the
   * section boundaries line up *exactly* with the timeline's progress ranges:
   * ScrollTrigger measures `railHeight - viewportHeight`, so without it every
   * section would sit a little ahead of the scene its camera is playing, and the
   * drift would compound down the page. The tail also gives the G resolution a
   * full viewport to settle in while its copy stays pinned.
   */
  const weightFor = (order: number) => {
    const definition = SCENES[order - 1]!;
    if (!immersive) return 1;
    const base = compact ? definition.mobileWeight : definition.weight;
    return order === SCENES.length ? base + 1 : base;
  };

  return (
    <>
      {immersive ? (
        <CanvasHost
          scenes={home.scenes}
          projects={projects}
          compact={compact}
          onReady={() => setRendererReady(true)}
          onFailure={(reason) => {
            track({ name: 'quality_fallback_activated', reason });
            switchToFallback(reason);
          }}
        />
      ) : null}

      {immersive ? (
        <StoryLoader
          ready={rendererReady}
          onSkip={() => switchToFallback('slow-load')}
        />
      ) : null}

      <main id="main" className={`story story--${resolvedMode}`} data-mode={resolvedMode}>
        <section className="intro" aria-labelledby="intro-heading">
          <div className="intro__inner">
            <p className="u-eyebrow intro__eyebrow">
              {settings.brandName} — {settings.contact.city}
            </p>
            <h1 id="intro-heading" className="intro__headline">
              {home.proposition}
            </h1>
            <div className="intro__actions">
              <Link
                href={settings.primaryCta.href}
                className="u-btn u-btn--primary"
                onClick={() =>
                  track({ name: 'cta_clicked', variant: 'intro', scene: 'fragmentField' })
                }
              >
                {settings.primaryCta.label}
              </Link>
              <Link href="/work" className="u-btn">
                Explore our work
              </Link>
            </div>
            <SkipExperience />
            <p className="intro__prompt" aria-hidden={!immersive}>
              {immersive ? 'Scroll to find the pattern' : 'The full story continues below'}
            </p>
          </div>
        </section>

        <div ref={railRef} className="story-rail">
          {home.scenes.map((scene) => {
            const sceneCapabilities = scene.capabilitySlugs
              .map((slug) => capabilityBySlug.get(slug))
              .filter((value): value is Capability => Boolean(value));
            const sceneProjects = scene.projectSlugs
              .map((slug) => projectBySlug.get(slug))
              .filter((value): value is Project => Boolean(value));

            return (
              <SceneSection
                key={scene.sceneKey}
                scene={scene}
                weight={weightFor(scene.order)}
                /**
                 * The pin-window rule only makes sense where a section is
                 * comfortably taller than the viewport. On the compact tier —
                 * and in the semantic tiers, which have no timeline at all —
                 * the copy is simply present, and sticky centring keeps it in
                 * the reading zone while its section passes.
                 */
                alwaysVisible={!immersive || compact}
                capabilities={sceneCapabilities}
                projects={sceneProjects}
                onOpenProject={handleOpenProject}
                extra={
                  <>
                    {scene.sceneKey === 'tesseractReveal' ? (
                      <ServiceNavigator capabilities={capabilities} scenes={home.scenes} />
                    ) : null}

                    {scene.sceneKey === 'humanNode' ? (
                      <ul className="scene__people">
                        {people.map((person) => (
                          <li key={person.name}>
                            <span className="scene__person-name">{person.name}</span>
                            <span className="scene__person-role">{person.role}</span>
                            <span className="scene__person-belief">“{person.belief}”</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {scene.sceneKey === 'resolutionG' ? (
                      <div className="scene__lockup">
                        {/* The one moment the identity is completely still.
                            Rendered from the untouched supplied artwork,
                            including the curved `designs` wordmark detail. */}
                        <AGLogoFull
                          className="scene__lockup-mark"
                          title={`${settings.brandName} logo`}
                        />
                        <p className="scene__lockup-caption">
                          {settings.brandName} — {settings.contact.city}, {settings.contact.country}
                        </p>
                      </div>
                    ) : null}

                    {scene.sceneKey === 'resolutionG' ? (
                      <div className="scene__final">
                        <Link
                          href={home.finalCta.primary.href}
                          className="u-btn u-btn--primary"
                          onClick={() =>
                            track({
                              name: 'cta_clicked',
                              variant: 'final-primary',
                              scene: 'resolutionG',
                            })
                          }
                        >
                          {home.finalCta.primary.label}
                        </Link>
                        <Link href={home.finalCta.secondary.href} className="u-btn">
                          {home.finalCta.secondary.label}
                        </Link>
                      </div>
                    ) : null}

                    {!immersive && scene.fallbackImage ? (
                      <Image
                        className="scene__still"
                        src={scene.fallbackImage.src}
                        alt={scene.fallbackImage.alt}
                        width={scene.fallbackImage.width}
                        height={scene.fallbackImage.height}
                        sizes="(max-width: 60rem) 100vw, 48rem"
                      />
                    ) : null}
                  </>
                }
              />
            );
          })}
        </div>

        {!immersive ? (
          <div className="story__return">
            <ReturnToJourney />
          </div>
        ) : null}
      </main>

      {/* Only this reads the URL, so only this is excluded from the prerender. */}
      <Suspense fallback={null}>
        <ProjectPortalRoute projects={projects} />
      </Suspense>
    </>
  );
}
