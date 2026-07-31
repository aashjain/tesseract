import type {
  Capability,
  HomeExperience,
  ImageAsset,
  Person,
  Project,
  SceneContent,
  SiteSettings,
} from '@/lib/content/types';
import { SCENES } from '@/lib/experience/sceneManifest';

/**
 * Typed local fixtures.
 *
 * Every project, person, metric and image below is a clearly labelled
 * placeholder. Nothing here claims a real client, testimonial or result. The
 * `status: 'fixture'` flag drives a visible "sample content" notice in the UI so
 * placeholder work can never be mistaken for a case study.
 *
 * Replace by supplying Sanity credentials (see README) or by editing this file.
 */

const poster = (name: string, alt: string): ImageAsset => ({
  src: `/media/posters/${name}.svg`,
  alt,
  width: 1600,
  height: 900,
});

export const siteSettings: SiteSettings = {
  // CONTENT DECISION: the brief uses "AG Designs"; stakeholders have also said
  // "AG Design Studios". Change this one value to rename the site everywhere.
  brandName: 'AG Designs',
  legalName: 'AG Designs',
  proposition:
    'We turn scattered brand activity into a world people can recognise, enter and remember.',
  defaultSeoTitle: 'AG Designs — Build a world only your brand can own',
  defaultSeoDescription:
    'AG Designs is a creative and social media studio in Delhi. We turn scattered brand activity into a world people can recognise, enter and remember.',
  primaryCta: { label: 'Start a project', href: '/contact' },
  contact: {
    email: 'hello@agdesigns.example',
    city: 'New Delhi',
    country: 'India',
  },
  social: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Behance', href: 'https://behance.net' },
  ],
  navigation: [
    { label: 'Services', href: '/services' },
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/about' },
  ],
};

export const capabilities: Capability[] = [
  {
    slug: 'brand-strategy',
    order: 1,
    name: 'Brand strategy and positioning',
    proposition: 'Direction before decoration.',
    problem:
      'Brands publish constantly and still cannot say what they stand for. Every decision is argued from taste because nothing has been decided at the level above taste.',
    approach:
      'We map the audience, the category, the tension and the promise, then commit to a single position every later expression can build from.',
    deliverables: [
      'Audience and category audit',
      'Positioning statement and rationale',
      'Messaging hierarchy',
      'Proof and evidence framework',
      'Rollout priorities',
    ],
    sceneKey: 'axesOfIntent',
    relatedProjectSlugs: ['fixture-meridian-hospitality', 'fixture-northline-labs'],
  },
  {
    slug: 'branding-identity',
    order: 3,
    name: 'Branding and visual identity',
    proposition: 'Recognition, by design.',
    problem:
      'A logo is not an identity. Without a system, every new asset restarts the argument and nothing compounds.',
    approach:
      'We build a grammar — type, colour, mark, spacing, image treatment — distinct enough to own and flexible enough to grow.',
    deliverables: [
      'Identity system and mark',
      'Type and colour system',
      'Layout and grid rules',
      'Image and motion treatment',
      'Usage guidelines and templates',
    ],
    sceneKey: 'identityEngine',
    relatedProjectSlugs: ['fixture-northline-labs', 'fixture-atelier-sona'],
  },
  {
    slug: 'social-media',
    order: 2,
    name: 'Social media strategy and management',
    proposition: 'Every signal, connected.',
    problem:
      'Channels are managed separately, so the brand sounds like a different company on each one.',
    approach:
      'We decide what each channel is for, then run one voice across them with a rhythm the team can actually sustain.',
    deliverables: [
      'Channel roles and cadence',
      'Content pillars',
      'Monthly calendar and production plan',
      'Community and response guidelines',
      'Performance review against brand goals',
    ],
    sceneKey: 'signalConstellation',
    relatedProjectSlugs: ['fixture-meridian-hospitality'],
  },
  {
    slug: 'campaigns',
    order: 7,
    name: 'Campaign planning, launches and growth communication',
    proposition: 'Waves that reach further than the last one.',
    problem:
      'Launches are treated as single posts rather than sequences, so momentum dies on day two.',
    approach:
      'We plan tease, reveal and sustain as one arc, with a message that survives being repeated.',
    deliverables: [
      'Campaign idea and arc',
      'Channel and asset plan',
      'Launch sequencing',
      'Partner and creator briefs',
      'Post-launch read-out',
    ],
    sceneKey: 'signalConstellation',
    relatedProjectSlugs: ['fixture-meridian-hospitality', 'fixture-atelier-sona'],
  },
  {
    slug: 'content-production',
    order: 4,
    name: 'Content creation, reels and campaign concepts',
    proposition: 'Ideas that keep moving.',
    problem:
      'Volume is mistaken for momentum. Content gets made, then has no job to do.',
    approach:
      'Every piece starts with a hook, a build and a payoff, and stays tied to the brand system underneath it.',
    deliverables: [
      'Concept and script development',
      'Reel and short-form formats',
      'Editorial content strips',
      'Copy and supers',
      'Repeatable format kits',
    ],
    sceneKey: 'momentumField',
    relatedProjectSlugs: ['fixture-meridian-hospitality', 'fixture-atelier-sona'],
  },
  {
    slug: 'photography-video',
    order: 5,
    name: 'Photography, video and production',
    proposition: 'From thought to thing.',
    problem:
      'The idea is approved, then quietly lost somewhere between the deck and the shoot.',
    approach:
      'Planning, direction, capture and post are run as one continuous idea rather than four hand-offs.',
    deliverables: [
      'Shoot planning and direction',
      'Art direction and styling',
      'Photography and video capture',
      'Edit, grade and finish',
      'Asset library and crops',
    ],
    sceneKey: 'matterLab',
    relatedProjectSlugs: ['fixture-atelier-sona'],
  },
  {
    slug: 'digital-experience',
    order: 6,
    name: 'Website and digital experience design',
    proposition: 'Worlds people can enter.',
    problem:
      'The website is the one place the brand is fully in control, and it is usually the least considered.',
    approach:
      'We design digital experiences that express the brand and still help people act — clear to use, hard to forget.',
    deliverables: [
      'Information architecture',
      'Interface and interaction design',
      'Motion and 3D direction',
      'Build and integration',
      'Performance and accessibility QA',
    ],
    sceneKey: 'portalStack',
    relatedProjectSlugs: ['fixture-northline-labs'],
  },
];

export const projects: Project[] = [
  {
    slug: 'fixture-meridian-hospitality',
    client: 'Sample Client — Meridian Hospitality',
    title: 'A house voice for a multi-property group',
    year: 2025,
    status: 'fixture',
    summary:
      'Sample case study showing the structure of an AG Designs project record. Replace with an approved client story before launch.',
    challenge:
      'Four properties, four social accounts and four different personalities. Guests could not tell that the group was one company, and each property was competing for the same attention with the same budget.',
    strategicIdea:
      'Treat the group as a single house with distinct rooms: one voice, one visual grammar, and a channel role for each property rather than four parallel feeds.',
    scope: ['brand-strategy', 'social-media', 'content-production', 'campaigns'],
    deliverables: [
      'Positioning and message hierarchy',
      'Channel roles across four properties',
      'Monthly content system and format kit',
      'Seasonal campaign arc',
    ],
    outcome:
      'Outcome narrative goes here. This fixture intentionally carries no performance claim, because AG Designs does not publish results without a named source and a measurement date.',
    metrics: [],
    hero: poster('project-meridian', 'Abstract violet and cyan composition standing in for project imagery.'),
    gallery: [
      poster('project-meridian-02', 'Placeholder artwork for a project gallery image.'),
      poster('project-meridian-03', 'Placeholder artwork for a project gallery image.'),
    ],
    spatialVariant: 'monolith',
    accent: 'violet',
  },
  {
    slug: 'fixture-northline-labs',
    client: 'Sample Client — Northline Labs',
    title: 'An identity system built to survive growth',
    year: 2025,
    status: 'fixture',
    summary:
      'Sample case study showing the structure of an AG Designs project record. Replace with an approved client story before launch.',
    challenge:
      'A research company whose identity worked on one poster and collapsed everywhere else. Every new team rebuilt the brand from memory.',
    strategicIdea:
      'Design the rules, not the artefacts: a compact grammar of type, spacing and mark behaviour that non-designers could apply without breaking it.',
    scope: ['brand-strategy', 'branding-identity', 'digital-experience'],
    deliverables: [
      'Identity system and mark refinement',
      'Type, colour and layout rules',
      'Component and template library',
      'Website design and build',
    ],
    outcome:
      'Outcome narrative goes here. Replace with the real result and cite the source and measurement date for any number.',
    metrics: [],
    hero: poster('project-northline', 'Abstract cyan lattice composition standing in for project imagery.'),
    gallery: [poster('project-northline-02', 'Placeholder artwork for a project gallery image.')],
    spatialVariant: 'lattice',
    accent: 'cyan',
  },
  {
    slug: 'fixture-atelier-sona',
    client: 'Sample Client — Atelier Sona',
    title: 'A launch that kept its shape for a season',
    year: 2024,
    status: 'fixture',
    summary:
      'Sample case study showing the structure of an AG Designs project record. Replace with an approved client story before launch.',
    challenge:
      'A studio with beautiful work and no launch discipline. Each drop was announced once and then disappeared.',
    strategicIdea:
      'Build the launch as a three-part arc — tease, reveal, sustain — with a single visual device carried through every asset.',
    scope: ['campaigns', 'content-production', 'photography-video', 'branding-identity'],
    deliverables: [
      'Campaign concept and arc',
      'Photography and film direction',
      'Reel and short-form formats',
      'Launch asset system',
    ],
    outcome:
      'Outcome narrative goes here. Replace with the real result and cite the source and measurement date for any number.',
    metrics: [],
    hero: poster('project-sona', 'Abstract warm-toned composition standing in for project imagery.'),
    gallery: [poster('project-sona-02', 'Placeholder artwork for a project gallery image.')],
    spatialVariant: 'ribbon',
    accent: 'warm',
  },
];

export const people: Person[] = [
  {
    name: 'Team member one',
    role: 'Founder and creative director',
    bio: 'Placeholder biography. Supply two or three sentences describing what this person actually does at AG Designs.',
    belief: 'If it cannot be repeated, it is not a system yet.',
    portrait: null,
    order: 1,
  },
  {
    name: 'Team member two',
    role: 'Brand strategy',
    bio: 'Placeholder biography. Supply two or three sentences describing what this person actually does at AG Designs.',
    belief: 'Most brand problems are decision problems wearing a design costume.',
    portrait: null,
    order: 2,
  },
  {
    name: 'Team member three',
    role: 'Design and identity',
    bio: 'Placeholder biography. Supply two or three sentences describing what this person actually does at AG Designs.',
    belief: 'Distinct beats pretty. Ideally you get both.',
    portrait: null,
    order: 3,
  },
  {
    name: 'Team member four',
    role: 'Content and production',
    bio: 'Placeholder biography. Supply two or three sentences describing what this person actually does at AG Designs.',
    belief: 'A hook is a promise. Keep it.',
    portrait: null,
    order: 4,
  },
];

const sceneCopy: Record<
  (typeof SCENES)[number]['key'],
  Pick<SceneContent, 'navLabel' | 'hash' | 'eyebrow' | 'headline' | 'support' | 'detail'> & {
    variant: SceneContent['variant'];
    capabilitySlugs: string[];
    projectSlugs: string[];
    editorNote: string;
  }
> = {
  fragmentField: {
    navLabel: 'The noise',
    hash: 'noise',
    eyebrow: 'Where most brands are',
    headline: 'Present everywhere.',
    support: 'Recognised nowhere?',
    detail:
      'Posts, colours, captions, frames and ideas — all real, all live, none of them adding up to something a person could describe back to you.',
    variant: 'violet',
    capabilitySlugs: [],
    projectSlugs: [],
    editorNote:
      'Opening state. Fragments compete for the same space and never resolve. Keep copy to two lines; the third line is the calm reading zone.',
  },
  apertureA: {
    navLabel: 'The way through',
    hash: 'aperture',
    eyebrow: 'The opening',
    headline: 'There is a way through.',
    support: 'Enter A.',
    detail:
      'The A from our mark is an aperture. It is where the framing of the problem changes.',
    variant: 'violet',
    capabilitySlugs: [],
    projectSlugs: [],
    editorNote:
      'The approved A path becomes a dimensional doorway. Its existing counter-space is the passage. Do not add copy inside the aperture.',
  },
  tesseractReveal: {
    navLabel: 'The system',
    hash: 'system',
    eyebrow: 'Inside',
    headline: 'One connected system.',
    support: 'Inside, every idea has a place.',
    detail:
      'Not seven services sold separately. Seven dimensions of one way of working.',
    variant: 'cyan',
    capabilitySlugs: [
      'brand-strategy',
      'social-media',
      'branding-identity',
      'content-production',
      'photography-video',
      'digital-experience',
      'campaigns',
    ],
    projectSlugs: [],
    editorNote:
      'The capability list opens from here. Every capability must be reachable as HTML, not only as a 3D rail.',
  },
  axesOfIntent: {
    navLabel: 'Strategy',
    hash: 'strategy',
    eyebrow: 'Brand strategy and positioning',
    headline: 'Direction before decoration.',
    support: 'We find the position every expression can build from.',
    detail: 'Understand. Choose. Position. In that order, and out loud.',
    variant: 'cyan',
    capabilitySlugs: ['brand-strategy'],
    projectSlugs: ['fixture-northline-labs'],
    editorNote: 'Competing vectors collapse into one north line as the visitor scrolls.',
  },
  identityEngine: {
    navLabel: 'Identity',
    hash: 'identity',
    eyebrow: 'Branding and visual identity',
    headline: 'Recognition, by design.',
    support: 'A system distinct enough to own. Flexible enough to grow.',
    detail: 'Type, mark, colour, spacing and image behaviour, decided once and reused everywhere.',
    variant: 'violet',
    capabilitySlugs: ['branding-identity'],
    projectSlugs: ['fixture-northline-labs'],
    editorNote:
      'Modules orbit separately, then lock into a responsive identity system. Two controlled states show range without chaos.',
  },
  signalConstellation: {
    navLabel: 'Social & campaigns',
    hash: 'signals',
    eyebrow: 'Social media and campaigns',
    headline: 'Every signal, connected.',
    support: 'Right idea. Right rhythm. One recognisable voice.',
    detail:
      'Each channel gets a job. Campaign waves only leave once the core message is aligned.',
    variant: 'cyan',
    capabilitySlugs: ['social-media', 'campaigns'],
    projectSlugs: ['fixture-meridian-hospitality'],
    editorNote: 'Nodes describe channel roles, never vanity metrics.',
  },
  momentumField: {
    navLabel: 'Content',
    hash: 'content',
    eyebrow: 'Content, reels and concepts',
    headline: 'Ideas that keep moving.',
    support: 'Built for attention. Connected to the brand.',
    detail: 'Hook. Build. Payoff. Then do it again without repeating yourself.',
    variant: 'violet',
    capabilitySlugs: ['content-production'],
    projectSlugs: ['fixture-atelier-sona'],
    editorNote: 'Scrubbing the scene scrubs a three-beat storyboard. No fake social feed cards.',
  },
  matterLab: {
    navLabel: 'Production',
    hash: 'production',
    eyebrow: 'Photography, video and production',
    headline: 'From thought to thing.',
    support: 'Planned, directed, captured and finished as one idea.',
    detail: 'The lighting changes as the idea resolves. That is the whole job.',
    variant: 'warm',
    capabilitySlugs: ['photography-video'],
    projectSlugs: ['fixture-atelier-sona'],
    editorNote: 'Warm light enters here for the first time. Keep it controlled.',
  },
  portalStack: {
    navLabel: 'Digital',
    hash: 'digital',
    eyebrow: 'Websites and digital experience',
    headline: 'Worlds people can enter.',
    support: 'Clear to use. Distinct enough to remember.',
    detail: 'A site is not a brochure with a scrollbar. It is the brand, operating.',
    variant: 'cyan',
    capabilitySlugs: ['digital-experience'],
    projectSlugs: ['fixture-northline-labs'],
    editorNote: 'Layered portals, each with its own depth treatment and interaction rule.',
  },
  evidenceChamber: {
    navLabel: 'Work',
    hash: 'work',
    eyebrow: 'Selected work',
    headline: 'Proof, not promises.',
    support: 'Enter a project. Follow the thinking.',
    detail: 'Challenge, idea, what we made, what happened. In that order, every time.',
    variant: 'violet',
    capabilitySlugs: [],
    projectSlugs: [
      'fixture-meridian-hospitality',
      'fixture-northline-labs',
      'fixture-atelier-sona',
    ],
    editorNote: 'Three to five artefacts, each with a distinct silhouette. No carousel, no grid.',
  },
  humanNode: {
    navLabel: 'People',
    hash: 'people',
    eyebrow: 'The studio',
    headline: 'Systems, made by people.',
    support: 'Curious minds. Clear opinions. No black-box process.',
    detail: 'You will know who is doing the work and why they made each call.',
    variant: 'warm',
    capabilitySlugs: [],
    projectSlugs: [],
    editorNote: 'Warm off-white light enters the dark world. Tactile planes, not floating cut-outs.',
  },
  resolutionG: {
    navLabel: 'The resolution',
    hash: 'resolution',
    eyebrow: 'What you leave with',
    headline: 'Build a world only your brand can own.',
    support: 'Start with a conversation.',
    detail:
      'Everything from the journey returns, aligned. The orbit it settles into is the G — earned, not announced.',
    variant: 'violet',
    capabilitySlugs: [],
    projectSlugs: [],
    editorNote:
      'Reverse scroll must genuinely disassemble this. Pointer parallax drops to near zero so the ending feels calm.',
  },
};

export const scenes: SceneContent[] = SCENES.map((scene) => {
  const copy = sceneCopy[scene.key];
  return {
    sceneKey: scene.key,
    order: scene.order,
    navLabel: copy.navLabel,
    hash: copy.hash,
    eyebrow: copy.eyebrow,
    headline: copy.headline,
    support: copy.support,
    detail: copy.detail,
    capabilitySlugs: copy.capabilitySlugs,
    projectSlugs: copy.projectSlugs,
    variant: copy.variant,
    fallbackImage: poster(
      `scene-${String(scene.order).padStart(2, '0')}`,
      `${scene.title} — still frame from the AG Tesseract journey.`,
    ),
    analyticsLabel: `scene_${scene.order}_${scene.key}`,
    editorNote: copy.editorNote,
  };
});

export const homeExperience: HomeExperience = {
  proposition: siteSettings.proposition,
  scenes,
  featuredProjectSlugs: projects.map((project) => project.slug),
  finalCta: {
    primary: { label: 'Start a project', href: '/contact' },
    secondary: { label: 'Explore our work', href: '/work' },
  },
  alternateCtaLines: [
    'Build a world only your brand can own.',
    'Make your signal unmistakable.',
    'Bring the fragments. We will find the system.',
    'Turn presence into position.',
    'Ready to give the brand gravity?',
  ],
  ambientSound: null,
};
