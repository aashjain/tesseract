'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { configureClock, storyClock } from '@/lib/experience/progress';
import { sceneAtProgress, type SceneKey } from '@/lib/experience/sceneManifest';

/**
 * The single master timeline.
 *
 * Native vertical scroll is the input; ScrollTrigger is the story clock. Nothing
 * hijacks the wheel, the scrollbar is real, and every value it produces is
 * written to the plain mutable `storyClock` rather than React state.
 */

let registered = false;

function register(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export type MasterTimelineOptions = {
  /** The tall element the whole journey scrolls through. */
  rail: HTMLElement;
  compact: boolean;
  /** Fired when the owning scene changes — low frequency, safe for React. */
  onSceneChange: (key: SceneKey, order: number) => void;
  /** Fired the first time the visitor leaves the opening beat. */
  onJourneyStart: () => void;
};

export function createMasterTimeline({
  rail,
  compact,
  onSceneChange,
  onJourneyStart,
}: MasterTimelineOptions): () => void {
  register();
  configureClock(compact);

  let started = false;
  let lastKey: SceneKey | null = null;

  const trigger = ScrollTrigger.create({
    trigger: rail,
    start: 'top top',
    end: 'bottom bottom',
    // Scrub smoothing sits inside the 0.35–0.6s window from the plan.
    scrub: 0.45,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const distance = Math.max(1, self.end - self.start);

      /**
       * On the compact tier the reading zone is in flow rather than pinned, so
       * a scene's copy is centred in the viewport half a viewport *before* that
       * scene's midpoint in scroll terms. Without this correction the camera
       * runs about a third of a scene behind the words being read. Pinned tiers
       * need no offset: the copy is fixed to the top of the viewport, which is
       * the position ScrollTrigger measures.
       */
      const lead = compact ? (0.5 * window.innerHeight) / distance : 0;
      storyClock.progress = Math.min(1, Math.max(0, self.progress + lead));
      // Velocity is reported in px/s; normalise to progress units per second so
      // scene code can reason about it independently of document height.
      storyClock.velocity = self.getVelocity() / distance;

      if (!started && storyClock.progress > 0.01) {
        started = true;
        onJourneyStart();
      }

      const scene = sceneAtProgress(storyClock.ranges, storyClock.progress);
      if (scene.key !== lastKey) {
        lastKey = scene.key;
        onSceneChange(scene.key, scene.order);
      }
    },
  });

  // Section heights settle after fonts and images land; re-measure then, or
  // every scene boundary sits a few hundred pixels away from where the camera
  // thinks it is.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('orientationchange', refresh);
  window.addEventListener('load', refresh);
  void document.fonts?.ready.then(refresh);

  const observer = new ResizeObserver(refresh);
  observer.observe(rail);

  return () => {
    window.removeEventListener('orientationchange', refresh);
    window.removeEventListener('load', refresh);
    observer.disconnect();
    trigger.kill();
  };
}

/**
 * Copy activation for one scene section.
 *
 * `top top` → `bottom top` is the window in which this section owns the top of
 * the viewport, which is exactly the window in which the master timeline reports
 * this scene as current. Tying activation to it guarantees the reading zone and
 * the camera can never disagree.
 *
 * Within that window the sticky stage is pinned for `weight - 1` viewports and
 * then released, so each beat holds still while it is read and slides away as
 * the camera leaves for the next station.
 */
export function createCopyTrigger(
  section: HTMLElement,
  onToggle: (active: boolean) => void,
): () => void {
  register();
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom top',
    onToggle: (self) => onToggle(self.isActive),
  });
  return () => trigger.kill();
}

export function refreshTimeline(): void {
  if (!registered) return;
  ScrollTrigger.refresh();
}

/** Scrolls the page so a given global progress value becomes current. */
export function scrollToProgress(rail: HTMLElement, progress: number): void {
  const start = rail.offsetTop;
  const distance = rail.offsetHeight - window.innerHeight;
  const target = start + distance * Math.min(1, Math.max(0, progress));
  window.scrollTo({ top: target, behavior: 'smooth' });
}
