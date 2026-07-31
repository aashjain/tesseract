"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneTimeline, scenes } from "@/content/scenes";
import { useExperience } from "@/store/experience";

gsap.registerPlugin(ScrollTrigger);

/**
 * The story clock.
 *
 * Native vertical scroll is the only input — wheel distance is not hijacked and
 * the scrollbar is left alone. This maps scroll position over the story rail to
 * a normalised 0-1 progress value and the active scene index; every visual
 * system (camera, rails, atmosphere) reads those from the store rather than
 * touching the scroll position itself.
 *
 * Backward scrolling reverses the same values, so the system genuinely
 * disassembles rather than replaying a rewind.
 */
export function ScrollStory({ railId }: { railId: string }) {
  const tier = useExperience((s) => s.tier);
  const setProgress = useExperience((s) => s.setProgress);
  const setActiveScene = useExperience((s) => s.setActiveScene);

  useEffect(() => {
    // Tier D never scrubs anything — it is a normal document.
    if (tier === "D") return;

    const rail = document.getElementById(railId);
    if (!rail) return;

    const ctx = gsap.context(() => {
      // Copy is bound to its scene's presence, so the cinematic route reads as
      // discrete beats rather than one continuous document. The DOM text is
      // never removed — only its opacity and a small translation change — so
      // the accessibility tree and find-in-page are unaffected.
      const blocks = rail.querySelectorAll<HTMLElement>("[data-scene-copy]");
      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: block.closest("section"),
              start: "top 78%",
              end: "top 42%",
              scrub: 0.5,
            },
          },
        );

        // Fade back out as the beat ends, so two scenes never compete.
        gsap.to(block, {
          opacity: 0,
          y: -24,
          ease: "power2.in",
          scrollTrigger: {
            trigger: block.closest("section"),
            start: "bottom 62%",
            end: "bottom 22%",
            scrub: 0.5,
          },
        });
      });

      ScrollTrigger.create({
        trigger: rail,
        start: "top top",
        end: "bottom bottom",
        // Smoothing keeps scrubbed motion from snapping on fast flicks.
        // 0.45s sits inside the plan's 0.35-0.6s window.
        scrub: 0.45,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);

          // Resolve to a stable scene even on a fast scroll, so copy is never
          // left half-visible between two beats.
          const current = sceneTimeline.findIndex(
            (s) => p >= s.start && p < s.end,
          );
          const index =
            current === -1 ? (p <= 0 ? 1 : scenes.length) : current + 1;
          setActiveScene(index);
        },
      });
    }, rail);

    // Fonts and images settling can change rail height after first paint.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) void document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [railId, tier, setProgress, setActiveScene]);

  return null;
}
