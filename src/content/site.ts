/**
 * Site-level settings. In production this moves to the CMS (`siteSettings`).
 */
export const site = {
  name: "AG Designs Studio",
  legalName: "AG Designs Studio",
  positioning: "Digital marketing agency",
  proposition:
    "We turn scattered brand activity into a world people can recognise, enter and remember.",
  description:
    "AG Designs Studio is a digital marketing agency. We find the organising idea, then make every channel carry it — strategy, social, campaigns, content, production and digital.",
  url: "https://agdesigns.studio",
  primaryCta: { label: "Start a project", href: "/contact" },
  secondaryCta: { label: "Explore our work", href: "/work" },
  email: "hello@agdesigns.studio",
  nav: [
    { label: "Services", href: "/services" },
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
  ],
} as const;
