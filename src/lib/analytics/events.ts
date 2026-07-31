'use client';

/**
 * Analytics contract.
 *
 * Events are declared here as a closed union so a typo cannot silently create a
 * new metric. Nothing is sent unless a consented sink is attached at runtime via
 * `setAnalyticsSink`, which keeps the default build free of trackers.
 */

export type AnalyticsEvent =
  | { name: 'experience_started'; mode: string; tier: string }
  | { name: 'experience_skipped'; scene: string; reason: 'control' | 'preference' }
  | { name: 'scene_reached'; scene: string; order: number }
  | { name: 'service_opened'; service: string; fromScene: string }
  | { name: 'project_previewed'; project: string }
  | { name: 'project_opened'; project: string; from: 'journey' | 'index' }
  | { name: 'sound_enabled' }
  | { name: 'quality_fallback_activated'; reason: string }
  | { name: 'cta_clicked'; variant: string; scene: string }
  | { name: 'contact_started' }
  | { name: 'contact_error'; field: string }
  | { name: 'contact_submitted' };

export type AnalyticsSink = (event: AnalyticsEvent) => void;

let sink: AnalyticsSink | null = null;
const seenOnce = new Set<string>();

export function setAnalyticsSink(next: AnalyticsSink | null): void {
  sink = next;
}

export function track(event: AnalyticsEvent): void {
  sink?.(event);
}

/** Fires at most once per session — used for `scene_reached`. */
export function trackOnce(key: string, event: AnalyticsEvent): void {
  if (seenOnce.has(key)) return;
  seenOnce.add(key);
  track(event);
}
