/**
 * The twelve homepage scenes, grouped into four acts.
 *
 * This is the single source of truth for the narrative. The semantic story rail
 * renders from it, and the GSAP master timeline derives its labels from the
 * same `id` values — so scene order can change here without rewriting camera
 * logic or the accessible fallback.
 *
 * Copy follows the approved system: short headline (2-7 words), one support
 * line, then proof. Support lines are weighted toward a digital marketing
 * agency's outcomes rather than a design studio's craft.
 */

export type Act = {
  id: string;
  number: number;
  title: string;
  /** The feeling this act is engineered to produce. */
  feeling: string;
};

export type Scene = {
  id: string;
  /** 1-based position in the journey, used for the `03 / 12` progress readout. */
  index: number;
  actId: string;
  /** Internal scene name from the storyboard. Not shown to visitors. */
  name: string;
  headline: string;
  support: string;
  /** What the visitor should understand by the end of the scene. */
  learns: string;
  /** Capability slugs dramatised here, if any. */
  services: readonly string[];
  /**
   * Share of total scroll distance. Weights are normalised at runtime, so they
   * are relative, not percentages. Denser scenes get more room to read.
   */
  weight: number;
  /** Which of the four motion verbs governs the exit transition. */
  transition: "disperse" | "attract" | "align" | "fold";
};

export const acts: readonly Act[] = [
  {
    id: "fragmentation",
    number: 1,
    title: "Fragmentation",
    feeling: "Curiosity, then slight disorientation",
  },
  {
    id: "system",
    number: 2,
    title: "The organising system",
    feeling: "Discovery, then clarity",
  },
  {
    id: "proof",
    number: 3,
    title: "Making and proof",
    feeling: "Momentum, then confidence",
  },
  {
    id: "resolution",
    number: 4,
    title: "Human resolution",
    feeling: "Calm, complete, inviting",
  },
];

export const scenes: readonly Scene[] = [
  {
    id: "fragment-field",
    index: 1,
    actId: "fragmentation",
    name: "The Fragment Field",
    headline: "Present everywhere.",
    support: "Recognised nowhere?",
    learns: "Activity is not the same as a brand system.",
    services: [],
    weight: 1.15,
    transition: "disperse",
  },
  {
    id: "a-aperture",
    index: 2,
    actId: "fragmentation",
    name: "The A Aperture",
    headline: "There is a way through.",
    support: "Enter A.",
    learns: "AG begins by changing the way the problem is framed.",
    services: [],
    weight: 0.85,
    transition: "attract",
  },
  {
    id: "tesseract-revealed",
    index: 3,
    actId: "fragmentation",
    name: "The Tesseract Revealed",
    headline: "One connected system.",
    support: "Inside, every idea has a place.",
    learns:
      "Strategy, social, campaigns, content, production and digital operate as connected dimensions.",
    services: [],
    weight: 1,
    transition: "fold",
  },
  {
    id: "axes-of-intent",
    index: 4,
    actId: "system",
    name: "Axes of Intent",
    headline: "Direction before decoration.",
    support: "Find the position every expression can build from.",
    learns: "AG decides what the brand should mean before how it should look.",
    services: ["brand-strategy-positioning"],
    weight: 1.1,
    transition: "align",
  },
  {
    id: "identity-engine",
    index: 5,
    actId: "system",
    name: "The Identity Engine",
    headline: "Recognition, by design.",
    support: "A distinct system with room to move.",
    learns: "Branding is a repeatable system, not a single logo.",
    services: ["branding-visual-identity"],
    weight: 1,
    transition: "attract",
  },
  {
    id: "signal-constellation",
    index: 6,
    actId: "system",
    name: "The Signal Constellation",
    headline: "Every signal, connected.",
    support: "One voice, built for every channel.",
    learns:
      "AG plans what each channel should do and how the whole system compounds.",
    services: [
      "social-media-strategy-management",
      "campaign-planning-growth",
    ],
    weight: 1.25,
    transition: "align",
  },
  {
    id: "momentum-field",
    index: 7,
    actId: "proof",
    name: "The Momentum Field",
    headline: "Ideas that keep moving.",
    support: "Attention with a purpose beyond the view.",
    learns: "AG creates content with a job to do, not content for volume.",
    services: ["content-creation-reels"],
    weight: 1,
    transition: "fold",
  },
  {
    id: "matter-lab",
    index: 8,
    actId: "proof",
    name: "The Matter Lab",
    headline: "From thought to thing.",
    support: "Planned and made as one idea.",
    learns: "AG carries the strategic idea through craft and execution.",
    services: ["photography-video-production"],
    weight: 0.95,
    transition: "attract",
  },
  {
    id: "portal-stack",
    index: 9,
    actId: "proof",
    name: "The Portal Stack",
    headline: "Worlds people can enter.",
    support: "Clear to use. Hard to forget.",
    learns:
      "AG makes digital systems that express the brand and help users act.",
    services: ["website-digital-experience"],
    weight: 0.95,
    transition: "fold",
  },
  {
    id: "evidence-chamber",
    index: 10,
    actId: "proof",
    name: "The Evidence Chamber",
    headline: "Proof, not promises.",
    support: "Enter a project. Follow the thinking.",
    learns: "AG's approach produces specific work and observable outcomes.",
    services: [],
    weight: 1.4,
    transition: "disperse",
  },
  {
    id: "human-node",
    index: 11,
    actId: "resolution",
    name: "The Human Node",
    headline: "Systems, made by people.",
    support: "Curious minds. Clear opinions.",
    learns: "AG is strategically sharp, collaborative and human.",
    services: [],
    weight: 1,
    transition: "attract",
  },
  {
    id: "g-resolution",
    index: 12,
    actId: "resolution",
    name: "The G Resolution",
    headline: "Build a world only your brand can own.",
    support: "Start with a conversation.",
    learns:
      "AG creates clarity, consistency and an ownable brand world — not disconnected outputs.",
    services: [],
    weight: 1.3,
    transition: "align",
  },
];

/** Utility copy from the approved copy system. */
export const utilityCopy = {
  loader: "Aligning the system",
  scrollPrompt: "Scroll to find the pattern",
  aperturePrompt: "Enter A",
  serviceHotspot: "Open dimension",
  projectHotspot: "View the proof",
  soundOn: "Sound on",
  soundOff: "Sound off",
  transition: "Crossing dimensions",
  skip: "Skip the experience",
  exploreNormally: "Explore normally",
  returnToJourney: "Return to the journey",
  lowPower: "A lighter version is active on this device.",
  contactSuccess: "Signal received. We will be in touch.",
  notFoundHeadline: "This signal left the system.",
  notFoundSupport: "The page moved, changed or never found its orbit.",
} as const;

const totalWeight = scenes.reduce((sum, s) => sum + s.weight, 0);

/** Normalised scroll offsets per scene, in the range 0-1. */
export const sceneTimeline = scenes.map((scene, i) => {
  const before = scenes.slice(0, i).reduce((sum, s) => sum + s.weight, 0);
  return {
    id: scene.id,
    start: before / totalWeight,
    end: (before + scene.weight) / totalWeight,
  };
});

export function getScene(id: string) {
  return scenes.find((s) => s.id === id);
}

export function getAct(id: string) {
  return acts.find((a) => a.id === id);
}
