/**
 * PLACEHOLDER CASE STUDIES.
 *
 * Every project below is invented for layout and narrative development. The
 * client names are fictional and the outcome figures are illustrative — they
 * are NOT real results and must not ship publicly.
 *
 * Replace with 3-5 real, permission-cleared case studies before launch. Each
 * real outcome needs a verifiable source recorded in `outcomeSource`.
 * The UI surfaces `isPlaceholder` as a visible notice so this cannot ship by
 * accident.
 */

export type Project = {
  slug: string;
  client: string;
  sector: string;
  year: number;
  /** Which services this project proves. Matches `services[].slug`. */
  services: readonly string[];
  /** One-line hook used in the Evidence Chamber scene. */
  teaser: string;
  /** The five-item case-study order mandated by the concept plan. */
  challenge: string;
  idea: string;
  created: readonly string[];
  outcome: readonly { label: string; value: string }[];
  outcomeNarrative: string;
  /** Provenance for every figure above. Required before a project goes live. */
  outcomeSource: string | null;
  isPlaceholder: boolean;
};

export const projects: readonly Project[] = [
  {
    slug: "lumen-field",
    client: "Lumen Field",
    sector: "Speciality coffee retail",
    year: 2025,
    services: [
      "brand-strategy-positioning",
      "social-media-strategy-management",
      "content-creation-reels",
    ],
    teaser: "Nine locations, nine personalities, no shared voice.",
    challenge:
      "Nine cafés had grown into nine separate brands. Each location ran its own social account with its own tone, its own photography and its own idea of what the business stood for. Regulars in one neighbourhood did not recognise the group in another.",
    idea:
      "One roast, many rooms. We positioned the group around the thing every location genuinely shared — the roast — and gave each site a defined role within a single system rather than independence from it.",
    created: [
      "Group positioning and messaging hierarchy",
      "Channel architecture: one group account, nine location sub-accounts with defined roles",
      "Content system with shared formats and location-specific slots",
      "Photography direction and a 60-asset launch library",
    ],
    outcome: [
      { label: "Engagement rate", value: "+62%" },
      { label: "Group follower growth", value: "3.4x" },
      { label: "Cross-location visits", value: "+18%" },
    ],
    outcomeNarrative:
      "Consolidating nine voices into one system lifted engagement across every location, including the six that lost their independent accounts.",
    outcomeSource: null,
    isPlaceholder: true,
  },
  {
    slug: "north-and-nine",
    client: "North & Nine",
    sector: "Direct-to-consumer skincare",
    year: 2025,
    services: [
      "campaign-planning-growth",
      "content-creation-reels",
      "photography-video-production",
    ],
    teaser: "A launch that needed to build, not spike.",
    challenge:
      "A five-product range launching into a category where paid acquisition costs had doubled in eighteen months. Previous launches had spiked on day one and flatlined inside a fortnight.",
    idea:
      "Earn the launch. We ran a six-week tease-reveal-sustain sequence that built an audience before there was anything to buy, so launch day converted attention that already existed.",
    created: [
      "Six-week campaign architecture across paid, organic and email",
      "Creative variant matrix — 4 hooks x 3 formats x 2 lengths",
      "Product photography and 14 short-form films",
      "Measurement framework with weekly readouts",
    ],
    outcome: [
      { label: "Cost per acquisition", value: "-41%" },
      { label: "Launch-week revenue vs target", value: "168%" },
      { label: "90-day revenue", value: "+27% vs prior launch" },
    ],
    outcomeNarrative:
      "The sequence held past the launch window — the ninety-day figure mattered more to the client than the launch-week number.",
    outcomeSource: null,
    isPlaceholder: true,
  },
  {
    slug: "meridian-works",
    client: "Meridian Works",
    sector: "B2B industrial software",
    year: 2024,
    services: [
      "brand-strategy-positioning",
      "branding-visual-identity",
      "website-digital-experience",
    ],
    teaser: "Technically respected. Commercially invisible.",
    challenge:
      "Engineers rated the product highest in its category. Procurement teams had never heard of it. The brand spoke fluently to specialists and said nothing to the people who sign.",
    idea:
      "Two audiences, one system. We kept the technical depth that earned the product its reputation and built a second layer above it that answered commercial questions in commercial language.",
    created: [
      "Positioning for a dual technical and commercial audience",
      "Identity system with a technical and an executive register",
      "Website architecture with parallel entry paths",
      "Sales enablement and template library",
    ],
    outcome: [
      { label: "Qualified enquiries", value: "+94%" },
      { label: "Average deal size", value: "+31%" },
      { label: "Sales cycle", value: "-22 days" },
    ],
    outcomeNarrative:
      "The technical audience was never the problem. Adding a commercial register without diluting the specialist one opened the accounts that had stalled.",
    outcomeSource: null,
    isPlaceholder: true,
  },
  {
    slug: "harbourline",
    client: "Harbourline",
    sector: "Hospitality group",
    year: 2024,
    services: [
      "social-media-strategy-management",
      "campaign-planning-growth",
      "photography-video-production",
    ],
    teaser: "Fully booked in summer. Empty by November.",
    challenge:
      "A coastal restaurant group with a severe seasonal cliff. Marketing effort tracked the season instead of countering it, so the quiet months got the least attention and stayed quiet.",
    idea:
      "Sell the off-season on its own terms. Rather than discounting winter, we gave it a distinct proposition — the version of the coast that only locals see — and marketed it to a different audience than summer.",
    created: [
      "Seasonal channel strategy with two audience tracks",
      "Off-season campaign concept and identity extension",
      "Winter photography and film production",
      "Always-on community and reservation-driven content",
    ],
    outcome: [
      { label: "Off-season covers", value: "+53%" },
      { label: "Midweek occupancy", value: "+38%" },
      { label: "Local repeat guests", value: "2.1x" },
    ],
    outcomeNarrative:
      "Treating the off-season as a separate product rather than a discount period rebuilt midweek trade without touching summer pricing.",
    outcomeSource: null,
    isPlaceholder: true,
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** True while any published project is still placeholder content. */
export const hasPlaceholderProjects = projects.some((p) => p.isPlaceholder);
