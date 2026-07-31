import 'server-only';

import type { ContentRepository } from '@/lib/content/types';
import {
  capabilities,
  homeExperience,
  people,
  projects,
  siteSettings,
} from '@/lib/content/fixtures';

/**
 * Single content boundary.
 *
 * Today this resolves to typed local fixtures. When Sanity credentials are
 * present (`NEXT_PUBLIC_SANITY_PROJECT_ID` + `NEXT_PUBLIC_SANITY_DATASET`) the
 * Sanity-backed implementation is used instead. Route components only ever see
 * `ContentRepository`, so swapping the source needs no page changes.
 */

const fixtureRepository: ContentRepository = {
  async getSiteSettings() {
    return siteSettings;
  },
  async getHomeExperience() {
    return homeExperience;
  },
  async getCapabilities() {
    return [...capabilities].sort((a, b) => a.order - b.order);
  },
  async getProjects() {
    return projects;
  },
  async getProject(slug: string) {
    return projects.find((project) => project.slug === slug) ?? null;
  },
  async getPeople() {
    return [...people].sort((a, b) => a.order - b.order);
  },
};

export function isCmsConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

let cached: ContentRepository | null = null;

export function getContentRepository(): ContentRepository {
  if (cached) return cached;

  if (isCmsConfigured()) {
    // The Sanity adapter is intentionally not bundled until credentials exist,
    // so a fixture-only deployment ships no CMS client code at all.
    throw new Error(
      'Sanity credentials are set but the Sanity adapter has not been installed. ' +
        'Run the CMS setup steps in README.md, or unset NEXT_PUBLIC_SANITY_PROJECT_ID to use fixtures.',
    );
  }

  cached = fixtureRepository;
  return cached;
}

export const content = {
  siteSettings: () => getContentRepository().getSiteSettings(),
  homeExperience: () => getContentRepository().getHomeExperience(),
  capabilities: () => getContentRepository().getCapabilities(),
  projects: () => getContentRepository().getProjects(),
  project: (slug: string) => getContentRepository().getProject(slug),
  people: () => getContentRepository().getPeople(),
};
