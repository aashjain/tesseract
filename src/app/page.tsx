import type { Metadata } from "next";
import { ExperienceCanvas } from "@/components/experience/ExperienceCanvas";
import { ScrollStory } from "@/components/ScrollStory";
import { StoryRail } from "@/components/StoryRail";
import { site } from "@/content/site";
import { scenes } from "@/content/scenes";

export const metadata: Metadata = {
  title: `${site.name} — ${site.positioning}`,
  description: site.description,
  alternates: { canonical: "/" },
};

const RAIL_ID = "story-rail";

/**
 * The immersive homepage.
 *
 * Server-rendered semantic content ships first; the renderer is a client-only
 * island layered behind it. The h1 carries the proposition rather than a scene
 * headline, so the page states what the studio does before the story starts.
 */
export default function Home() {
  return (
    <>
      <ExperienceCanvas />
      <ScrollStory railId={RAIL_ID} />

      <main id="main">
        <h1 className="visually-hidden">
          {site.name} — {site.proposition}
        </h1>

        <StoryRail id={RAIL_ID} />
      </main>

      <script
        type="application/ld+json"
        // Structured data mirrors the semantic rail, so search engines index
        // the same story the visitor reads.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: site.name,
            description: site.description,
            url: site.url,
            email: site.email,
            slogan: site.proposition,
            knowsAbout: scenes
              .flatMap((scene) => scene.services)
              .filter((v, i, a) => a.indexOf(v) === i),
          }),
        }}
      />
    </>
  );
}
