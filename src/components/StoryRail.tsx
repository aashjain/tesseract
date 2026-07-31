import Link from "next/link";
import { acts, getAct, scenes, utilityCopy } from "@/content/scenes";
import { getService } from "@/content/services";
import { projects } from "@/content/projects";
import { people } from "@/content/people";
import { site } from "@/content/site";
import styles from "./StoryRail.module.css";

/**
 * The semantic story rail.
 *
 * This is the whole homepage as real HTML: correct heading order, real copy,
 * real links. It is simultaneously the SEO surface, the accessibility tree, and
 * the Tier D fallback — so the story is never locked inside the canvas, and
 * nothing essential depends on WebGL loading.
 *
 * Server-rendered. The canvas layers behind it.
 */

const ALIGNMENT = ["start", "end", "centre", "start", "end", "start"] as const;

export function StoryRail({ id }: { id: string }) {
  return (
    <div className={styles.rail} id={id}>
      {scenes.map((scene) => {
        const act = getAct(scene.actId);
        const isFinal = scene.id === "g-resolution";
        const isEvidence = scene.id === "evidence-chamber";
        const isTeam = scene.id === "human-node";

        return (
          <section
            key={scene.id}
            id={scene.id}
            className={styles.scene}
            data-scene={scene.index}
            data-act={scene.actId}
            data-align={ALIGNMENT[scene.index % ALIGNMENT.length]}
            data-emphasis={isFinal ? "final" : undefined}
            data-density={isEvidence || isTeam ? "dense" : undefined}
            aria-labelledby={`${scene.id}-heading`}
          >
            <div className={styles.inner}>
              <div className={styles.copy} data-scene-copy="">
                <p className={styles.meta}>
                  <span aria-hidden="true">
                    {String(scene.index).padStart(2, "0")} / {scenes.length}
                  </span>
                  <span className={styles.metaRule} aria-hidden="true" />
                  <span className={styles.actMark}>
                    Act {act?.number} — {act?.title}
                  </span>
                </p>

                <h2 id={`${scene.id}-heading`} className={styles.headline}>
                  {scene.headline}
                </h2>
                <p className={styles.support}>{scene.support}</p>
                <p className={styles.learns}>{scene.learns}</p>

                {scene.services.length > 0 && (
                  <ul className={styles.links}>
                    {scene.services.map((slug) => {
                      const service = getService(slug);
                      if (!service) return null;
                      return (
                        <li key={slug}>
                          <Link
                            className={styles.link}
                            href={`/services#${slug}`}
                          >
                            {service.title}
                            <span aria-hidden="true">→</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {isEvidence && (
                  <ul className={styles.links}>
                    {projects.map((project) => (
                      <li key={project.slug}>
                        <Link
                          className={styles.link}
                          href={`/work/${project.slug}`}
                        >
                          {project.client}
                          <span className="visually-hidden">
                            {" "}
                            — {utilityCopy.projectHotspot}
                          </span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {isTeam && (
                  <ul className={styles.links}>
                    {people.map((person) => (
                      <li key={person.slug}>
                        <span className={styles.link}>
                          {person.role}
                          <span className="visually-hidden">
                            : {person.belief}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {isFinal && (
                  <div className={styles.ctaRow}>
                    <Link
                      className={styles.ctaPrimary}
                      href={site.primaryCta.href}
                    >
                      {site.primaryCta.label}
                    </Link>
                    <Link
                      className={styles.ctaSecondary}
                      href={site.secondaryCta.href}
                    >
                      {site.secondaryCta.label}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Act list, exposed for the services page and for structured data. */
export { acts };
