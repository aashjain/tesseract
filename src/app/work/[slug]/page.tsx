import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { content } from '@/lib/content/repository';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await content.projects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await content.project(slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: project.seo?.title ?? `${project.title} — ${project.client}`,
    description: project.seo?.description ?? project.summary,
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [project, capabilities] = await Promise.all([
    content.project(slug),
    content.capabilities(),
  ]);

  if (!project) notFound();

  const scope = capabilities.filter((capability) => project.scope.includes(capability.slug));

  return (
    <main id="main" className="page">
      <article>
        <header className="page__head u-shell">
          <p className="u-eyebrow">
            {project.client} — {project.year}
          </p>
          <h1 className="page__title">{project.title}</h1>
          <p className="u-lede">{project.summary}</p>
          {project.status === 'fixture' ? (
            <p className="page__notice">
              Sample content. This record shows how an AG Designs case study is structured; the
              client, challenge and outcome are illustrative and carry no performance claim.
            </p>
          ) : null}
        </header>

        <div className="u-shell">
          <Image
            className="case__hero"
            src={project.hero.src}
            alt={project.hero.alt}
            width={project.hero.width}
            height={project.hero.height}
            priority
            sizes="100vw"
          />
        </div>

        <div className="u-shell case">
          <section className="case__block" aria-labelledby="challenge">
            <h2 id="challenge" className="u-eyebrow">
              The challenge
            </h2>
            <p className="case__prose">{project.challenge}</p>
          </section>

          <section className="case__block" aria-labelledby="idea">
            <h2 id="idea" className="u-eyebrow">
              The strategic idea
            </h2>
            <p className="case__prose case__prose--lead">{project.strategicIdea}</p>
          </section>

          <section className="case__block" aria-labelledby="created">
            <h2 id="created" className="u-eyebrow">
              What we created
            </h2>
            <ul className="case__deliverables">
              {project.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {scope.length > 0 ? (
              <p className="case__scope">
                Capabilities:{' '}
                {scope.map((capability, index) => (
                  <span key={capability.slug}>
                    {index > 0 ? ', ' : ''}
                    <Link href={`/services#${capability.slug}`} className="u-link">
                      {capability.name}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </section>

          <section className="case__block" aria-labelledby="outcome">
            <h2 id="outcome" className="u-eyebrow">
              The outcome
            </h2>
            <p className="case__prose">{project.outcome}</p>
            {project.metrics.length > 0 ? (
              <dl className="case__metrics">
                {project.metrics.map((metric) => (
                  <div key={`${metric.value}-${metric.context}`}>
                    <dt>
                      {metric.value}
                      <span className="case__metric-unit">{metric.unit}</span>
                    </dt>
                    <dd>
                      {metric.context}
                      <span className="case__metric-source">
                        Source: {metric.source}, {metric.measuredAt}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="case__no-metrics">
                No numeric claim is published for this project. AG Designs only publishes figures
                with a named source and a measurement date.
              </p>
            )}
          </section>

          {project.gallery.length > 0 ? (
            <section className="case__block" aria-labelledby="gallery">
              <h2 id="gallery" className="u-eyebrow">
                Selected assets
              </h2>
              <ul className="case__gallery">
                {project.gallery.map((image) => (
                  <li key={image.src}>
                    <figure>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="(max-width: 60rem) 100vw, 34rem"
                      />
                      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {project.testimonial?.approved ? (
            <blockquote className="case__quote">
              <p>“{project.testimonial.quote}”</p>
              <footer>
                {project.testimonial.name}, {project.testimonial.role}
              </footer>
            </blockquote>
          ) : null}
        </div>
      </article>

      <section className="page__cta u-shell">
        <h2 className="page__cta-title">Build a world only your brand can own.</h2>
        <div className="page__cta-actions">
          <Link href="/contact" className="u-btn u-btn--primary">
            Start a project
          </Link>
          <Link href="/work" className="u-btn">
            All work
          </Link>
        </div>
      </section>
    </main>
  );
}
