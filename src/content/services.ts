/**
 * The seven capabilities from the concept deck, re-weighted for AG Designs
 * Studio's positioning as a digital marketing agency: strategy, social and
 * campaigns lead; branding, content, production and digital support them.
 *
 * `scene` ties each capability to the homepage scene that carries it, so the
 * services index and the cinematic route never drift apart.
 */

export type Service = {
  slug: string;
  /** Display order on /services. Lead capabilities first. */
  rank: number;
  title: string;
  /** Scene id on the homepage that dramatises this capability. */
  scene: string;
  summary: string;
  detail: string;
  deliverables: readonly string[];
};

export const services: readonly Service[] = [
  {
    slug: "brand-strategy-positioning",
    rank: 1,
    title: "Brand strategy and positioning",
    scene: "axes-of-intent",
    summary: "Find the position every expression can build from.",
    detail:
      "We decide what the brand should mean before deciding how it should look. Audience, category, tension, promise and proof — resolved into one direction that the rest of the marketing can compound against.",
    deliverables: [
      "Category and competitor mapping",
      "Audience and demand research",
      "Positioning statement and messaging hierarchy",
      "Proof architecture",
    ],
  },
  {
    slug: "social-media-strategy-management",
    rank: 2,
    title: "Social media strategy and management",
    scene: "signal-constellation",
    summary: "One voice, built for every channel.",
    detail:
      "We plan what each channel is for, what it should do, and how the whole system compounds. Then we run it — calendars, community, and the reporting that tells you which signals actually moved.",
    deliverables: [
      "Channel strategy and role definition",
      "Content calendars and publishing",
      "Community management",
      "Performance reporting against business goals",
    ],
  },
  {
    slug: "campaign-planning-growth",
    rank: 3,
    title: "Campaign planning, launches and growth",
    scene: "signal-constellation",
    summary: "Tease, reveal, sustain — planned as one sequence.",
    detail:
      "Launches that build rather than spike. We plan the sequence, the media, the creative variants and the measurement before anything ships, so growth is a repeatable process instead of a lucky post.",
    deliverables: [
      "Campaign architecture and phasing",
      "Paid and organic media planning",
      "Creative variant matrices",
      "Measurement framework and post-campaign analysis",
    ],
  },
  {
    slug: "content-creation-reels",
    rank: 4,
    title: "Content creation, reels and concepts",
    scene: "momentum-field",
    summary: "Attention with a purpose beyond the view.",
    detail:
      "Content built with a job to do. Every piece has a hook, a build and a payoff, and every piece is recognisably part of the same brand system rather than a one-off that happened to perform.",
    deliverables: [
      "Content pillars and formats",
      "Short-form video and reels",
      "Editorial and static content",
      "Hook and format testing",
    ],
  },
  {
    slug: "branding-visual-identity",
    rank: 5,
    title: "Branding and visual identity",
    scene: "identity-engine",
    summary: "A distinct system with room to move.",
    detail:
      "Identity as a repeatable system, not a single logo. Type, colour, spacing, image treatment and motion defined tightly enough to be recognisable and loosely enough to keep producing at pace.",
    deliverables: [
      "Identity system and guidelines",
      "Type, colour and layout rules",
      "Asset and template libraries",
      "Motion and social adaptations",
    ],
  },
  {
    slug: "photography-video-production",
    rank: 6,
    title: "Photography, video and production",
    scene: "matter-lab",
    summary: "Planned and made as one idea.",
    detail:
      "We carry the strategic idea through to the shoot. Planning, direction, capture and post handled as a single process so the finished asset still says what the strategy intended.",
    deliverables: [
      "Shoot planning and art direction",
      "Photography and video production",
      "Post-production and grading",
      "Asset delivery in channel-ready formats",
    ],
  },
  {
    slug: "website-digital-experience",
    rank: 7,
    title: "Website and digital experience design",
    scene: "portal-stack",
    summary: "Clear to use. Hard to forget.",
    detail:
      "Digital experiences people can enter, not screens on a device mockup. Built to express the brand and to help someone act — with the performance and accessibility work that makes that true on real devices.",
    deliverables: [
      "UX architecture and prototyping",
      "Interface and motion design",
      "Build and CMS integration",
      "Performance, accessibility and analytics",
    ],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
