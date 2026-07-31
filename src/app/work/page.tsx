import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { content } from '@/lib/content/repository';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected work from AG Designs. Challenge, idea, what we created, what happened.',
};

export default async function WorkIndexPage() {
  const projects = await content.projects();
  const hasFixtures = projects.some((project) => project.status === 'fixture');

  return (
    <main id="main" className="page">
      <header className="page__head u-shell">
        <p className="u-eyebrow">Selected work</p>
        <h1 className="page__title">Proof, not promises.</h1>
        <p className="u-lede">
          Every project below states the challenge, the strategic idea, what we created and what
          happened. Usability wins outside the narrative, so this is a plain editorial index.
        </p>
        {hasFixtures ? (
          <p className="page__notice">
            This index currently contains sample records supplied with the build. They demonstrate
            the structure of an AG Designs case study and must be replaced with approved client
            work before launch.
          </p>
        ) : null}
      </header>

      <div className="u-shell">
        <ul className="work-index">
          {projects.map((project) => (
            <li key={project.slug} className="work-index__item">
              <Link href={`/work/${project.slug}`} className="work-index__link">
                <Image
                  className="work-index__image"
                  src={project.hero.src}
                  alt={project.hero.alt}
                  width={project.hero.width}
                  height={project.hero.height}
                  sizes="(max-width: 60rem) 100vw, 34rem"
                />
                <div className="work-index__meta">
                  <p className="u-eyebrow">
                    {project.client} — {project.year}
                  </p>
                  <h2 className="work-index__title">{project.title}</h2>
                  <p className="work-index__summary">{project.summary}</p>
                  <span className="work-index__cue u-eyebrow">Follow the thinking →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <section className="page__cta u-shell">
        <h2 className="page__cta-title">Bring the fragments. We will find the system.</h2>
        <Link href="/contact" className="u-btn u-btn--primary">
          Start a project
        </Link>
      </section>
    </main>
  );
}
