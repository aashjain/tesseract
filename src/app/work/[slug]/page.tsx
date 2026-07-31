import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { getService } from "@/content/services";
import styles from "../../page.module.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((project) => ({ slug: project.slug }));
}

// `params` is async in Next 16 — synchronous access was removed.
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: `${project.client} — Work`,
    description: project.teaser,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

/**
 * Full case study.
 *
 * Content order is fixed by the concept plan: client, challenge, strategic
 * idea, created work, outcome. Browser back works because this is a real route,
 * not a modal state.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  return (
    <main id="main" className={styles.page}>
      <div className="shell">
        <Link href="/work" className={styles.backLink}>
          <span aria-hidden="true">←</span> All work
        </Link>

        <div className={styles.lede}>
          <p className={styles.eyebrow}>
            {project.sector} · {project.year}
          </p>
          <h1 className={styles.title}>{project.client}</h1>
          <p className={styles.intro}>{project.teaser}</p>
        </div>

        {project.isPlaceholder && (
          <p className={styles.caution}>
            Placeholder case study. {project.client} is a fictional client and
            the outcome figures below are illustrative, not measured results.
          </p>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>The challenge</h2>
          <div className={styles.prose}>
            <p>{project.challenge}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>The idea</h2>
          <div className={styles.prose}>
            <p>{project.idea}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>What we made</h2>
          <ul className={styles.list}>
            {project.created.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>What changed</h2>
          <dl className={styles.stats}>
            {project.outcome.map((stat) => (
              <div key={stat.label}>
                <dd className={styles.statValue}>{stat.value}</dd>
                <dt className={styles.statLabel}>{stat.label}</dt>
              </div>
            ))}
          </dl>
          <div className={styles.prose}>
            <p>{project.outcomeNarrative}</p>
            {project.outcomeSource && (
              <p className={styles.cardMeta}>Source: {project.outcomeSource}</p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Capabilities used</h2>
          <div className={styles.grid}>
            {project.services.map((slugRef) => {
              const service = getService(slugRef);
              if (!service) return null;
              return (
                <Link
                  key={slugRef}
                  href={`/services#${slugRef}`}
                  className={styles.card}
                >
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardBody}>{service.summary}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
