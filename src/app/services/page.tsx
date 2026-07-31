import type { Metadata } from 'next';
import Link from 'next/link';

import { content } from '@/lib/content/repository';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Seven connected capabilities: brand strategy, social media, identity, content, production, digital experience and campaigns.',
};

export default async function ServicesPage() {
  const [capabilities, projects, home] = await Promise.all([
    content.capabilities(),
    content.projects(),
    content.homeExperience(),
  ]);

  const sceneHash = (sceneKey: string) =>
    home.scenes.find((scene) => scene.sceneKey === sceneKey)?.hash ?? 'system';

  return (
    <main id="main" className="page">
      <header className="page__head u-shell">
        <p className="u-eyebrow">Capabilities</p>
        <h1 className="page__title">Not seven services. One connected system.</h1>
        <p className="u-lede">
          Each capability below is a dimension of the same way of working. This page is the direct
          index — the same seven appear inside the journey on the{' '}
          <Link href="/" className="u-link">
            homepage
          </Link>
          .
        </p>
      </header>

      <div className="u-shell">
        <ol className="capability-list">
          {capabilities.map((capability) => {
            const related = projects.filter((project) =>
              capability.relatedProjectSlugs.includes(project.slug),
            );

            return (
              <li key={capability.slug} id={capability.slug} className="capability">
                <p className="capability__index u-eyebrow">
                  {String(capability.order).padStart(2, '0')}
                </p>

                <div className="capability__body">
                  <h2 className="capability__name">{capability.name}</h2>
                  <p className="capability__proposition">{capability.proposition}</p>

                  <div className="capability__prose">
                    <div>
                      <h3 className="u-eyebrow">The problem</h3>
                      <p>{capability.problem}</p>
                    </div>
                    <div>
                      <h3 className="u-eyebrow">How we work</h3>
                      <p>{capability.approach}</p>
                    </div>
                  </div>

                  <h3 className="u-eyebrow capability__deliverables-title">What you get</h3>
                  <ul className="capability__deliverables">
                    {capability.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <div className="capability__links">
                    <Link href={`/#${sceneHash(capability.sceneKey)}`} className="u-link">
                      See it in the journey
                    </Link>
                    {related.map((project) => (
                      <Link key={project.slug} href={`/work/${project.slug}`} className="u-link">
                        {project.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <section className="page__cta u-shell">
        <h2 className="page__cta-title">Build a world only your brand can own.</h2>
        <Link href="/contact" className="u-btn u-btn--primary">
          Start a project
        </Link>
      </section>
    </main>
  );
}
