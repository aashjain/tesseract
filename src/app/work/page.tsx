import type { Metadata } from "next";
import Link from "next/link";
import { hasPlaceholderProjects, projects } from "@/content/projects";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects — the challenge, the strategic idea, what was made and what happened next.",
  alternates: { canonical: "/work" },
};

/**
 * Accessible editorial work index.
 *
 * The homepage encounters work as proof inside the narrative; this route is the
 * plain, linkable, crawlable version of the same projects.
 */
export default function WorkPage() {
  return (
    <main id="main" className={styles.page}>
      <div className="shell">
        <div className={styles.lede}>
          <p className={styles.eyebrow}>Selected work</p>
          <h1 className={styles.title}>Proof, not promises.</h1>
          <p className={styles.intro}>
            Every project follows the same five questions: who the client was,
            what was in the way, the idea we chose, what we made, and what
            changed.
          </p>
        </div>

        {hasPlaceholderProjects && (
          <p className={styles.caution}>
            These case studies are placeholder content for layout development.
            Client names are fictional and every figure is illustrative.
          </p>
        )}

        <div className={styles.section}>
          <div className={styles.grid}>
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className={styles.card}
              >
                <p className={styles.cardMeta}>
                  {project.sector} · {project.year}
                </p>
                <h2 className={styles.cardTitle}>{project.client}</h2>
                <p className={styles.cardBody}>{project.teaser}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
