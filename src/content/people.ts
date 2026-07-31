/**
 * PLACEHOLDER TEAM.
 *
 * Names, roles and beliefs below are invented for layout development. Replace
 * with the real team, portraits and one belief each before launch.
 */

export type Person = {
  slug: string;
  name: string;
  role: string;
  /** One human sentence. Not a biography — the scene reveals a single line. */
  belief: string;
  isPlaceholder: boolean;
};

export const people: readonly Person[] = [
  {
    slug: "placeholder-strategy-lead",
    name: "Strategy Lead",
    role: "Brand strategy and positioning",
    belief: "If you cannot say what you are not, you have not positioned yet.",
    isPlaceholder: true,
  },
  {
    slug: "placeholder-creative-director",
    name: "Creative Director",
    role: "Identity and art direction",
    belief: "Consistency is not repetition. It is recognition with range.",
    isPlaceholder: true,
  },
  {
    slug: "placeholder-social-lead",
    name: "Social Lead",
    role: "Social strategy and community",
    belief: "Every channel should be able to explain its own job.",
    isPlaceholder: true,
  },
  {
    slug: "placeholder-growth-lead",
    name: "Growth Lead",
    role: "Campaigns and performance",
    belief: "A spike is not a result. Ninety days later is the result.",
    isPlaceholder: true,
  },
];

export const hasPlaceholderPeople = people.some((p) => p.isPlaceholder);
