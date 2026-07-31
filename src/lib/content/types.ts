import type { SceneVariantKey } from '@/lib/design/tokens';
import type { SceneKey } from '@/lib/experience/sceneManifest';

/**
 * Content model. These types are the contract between the presentation layer
 * and whichever source is configured (typed local fixtures today, Sanity when
 * credentials are supplied). See `src/lib/content/repository.ts`.
 */

export type ImageAsset = {
  src: string;
  /** Required. Empty string is only valid for decorative art direction. */
  alt: string;
  width: number;
  height: number;
  caption?: string;
  credit?: string;
};

export type VideoAsset = {
  src: string;
  poster: ImageAsset;
  captionsSrc?: string;
  description: string;
};

export type SiteSettings = {
  /**
   * DECISION REQUIRED: the brief says "AG Designs"; stakeholders have also said
   * "AG Design Studios". This single setting drives every visible instance.
   */
  brandName: string;
  legalName: string;
  proposition: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  primaryCta: { label: string; href: string };
  contact: {
    email: string;
    phone?: string;
    city: string;
    country: string;
  };
  social: { label: string; href: string }[];
  navigation: { label: string; href: string }[];
};

export type Capability = {
  /** Stable slug used for `/services#slug` and scene hashes. */
  slug: string;
  /** 1-7, matching the brief's vertical order. */
  order: number;
  name: string;
  proposition: string;
  problem: string;
  approach: string;
  deliverables: string[];
  /** The scene inside the journey where this capability is embodied. */
  sceneKey: SceneKey;
  relatedProjectSlugs: string[];
};

export type ProjectMetric = {
  value: string;
  unit: string;
  context: string;
  /** Required for every numeric claim. Fixtures state that they are fixtures. */
  source: string;
  measuredAt: string;
};

export type Project = {
  slug: string;
  client: string;
  title: string;
  year: number;
  /** `fixture` marks placeholder content that must be replaced before launch. */
  status: 'published' | 'fixture' | 'confidential';
  summary: string;
  challenge: string;
  strategicIdea: string;
  scope: string[];
  deliverables: string[];
  outcome: string;
  metrics: ProjectMetric[];
  hero: ImageAsset;
  gallery: ImageAsset[];
  testimonial?: { quote: string; name: string; role: string; approved: boolean };
  /** Controlled enum — editors choose a silhouette, never coordinates. */
  spatialVariant: 'monolith' | 'lattice' | 'aperture' | 'ribbon' | 'prism';
  accent: SceneVariantKey;
  seo?: { title?: string; description?: string };
};

export type Person = {
  name: string;
  role: string;
  bio: string;
  /** One human sentence, revealed on hover/focus in Scene 11. */
  belief: string;
  portrait: ImageAsset | null;
  link?: { label: string; href: string };
  order: number;
};

export type SceneContent = {
  sceneKey: SceneKey;
  order: number;
  /** Navigation label and `/#hash` target. */
  navLabel: string;
  hash: string;
  eyebrow: string;
  headline: string;
  support: string;
  /** Optional third line, used for the calm reading zone in dense scenes. */
  detail?: string;
  capabilitySlugs: string[];
  projectSlugs: string[];
  variant: SceneVariantKey;
  /** Still image used by the semantic fallback tier. */
  fallbackImage: ImageAsset | null;
  analyticsLabel: string;
  /** Editor-facing note explaining the visual purpose. Never rendered. */
  editorNote: string;
};

export type HomeExperience = {
  proposition: string;
  scenes: SceneContent[];
  featuredProjectSlugs: string[];
  finalCta: { primary: { label: string; href: string }; secondary: { label: string; href: string } };
  alternateCtaLines: string[];
  ambientSound: { src: string; description: string } | null;
};

export type ContentRepository = {
  getSiteSettings(): Promise<SiteSettings>;
  getHomeExperience(): Promise<HomeExperience>;
  getCapabilities(): Promise<Capability[]>;
  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  getPeople(): Promise<Person[]>;
};
