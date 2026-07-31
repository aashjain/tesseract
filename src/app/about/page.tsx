import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { content } from '@/lib/content/repository';

export const metadata: Metadata = {
  title: 'About',
  description: 'The studio, the approach and the people behind AG Designs.',
};

export default async function AboutPage() {
  const [settings, people, capabilities] = await Promise.all([
    content.siteSettings(),
    content.people(),
    content.capabilities(),
  ]);

  return (
    <main id="main" className="page">
      <header className="page__head u-shell">
        <p className="u-eyebrow">The studio</p>
        <h1 className="page__title">Systems, made by people.</h1>
        <p className="u-lede">{settings.proposition}</p>
      </header>

      <section className="u-shell about__manifesto" aria-labelledby="approach">
        <h2 id="approach" className="u-eyebrow">
          How we work
        </h2>
        <div className="about__manifesto-body">
          <p>
            {settings.brandName} does not add more content to the noise. We look for the organising
            idea first — the thing every later decision can be argued from — and then build outward
            from it.
          </p>
          <p>
            Strategy decides what the brand should mean. Identity gives it a recognisable form.
            Social and campaigns connect its signals. Content gives it momentum. Production makes it
            tangible. Digital gives people a way in. Those are not seven products; they are one
            system with seven dimensions.
          </p>
          <p>
            We are based in {settings.contact.city}, {settings.contact.country}, and we work in the
            open: you will always know who is doing the work and why a call was made.
          </p>
        </div>
      </section>

      <section className="u-shell about__people" aria-labelledby="people">
        <h2 id="people" className="page__section-title">
          The people
        </h2>
        <ul className="team">
          {people.map((person) => (
            <li key={person.name} className="team__member">
              {person.portrait ? (
                <Image
                  className="team__portrait"
                  src={person.portrait.src}
                  alt={person.portrait.alt}
                  width={person.portrait.width}
                  height={person.portrait.height}
                  sizes="(max-width: 60rem) 50vw, 18rem"
                />
              ) : (
                <div className="team__portrait team__portrait--empty" aria-hidden="true" />
              )}
              <h3 className="team__name">{person.name}</h3>
              <p className="team__role">{person.role}</p>
              <p className="team__bio">{person.bio}</p>
              <p className="team__belief">“{person.belief}”</p>
            </li>
          ))}
        </ul>
        <p className="page__notice">
          Team records are placeholders supplied with the build. Replace names, roles, portraits and
          beliefs before launch.
        </p>
      </section>

      <section className="u-shell about__capabilities" aria-labelledby="capabilities">
        <h2 id="capabilities" className="page__section-title">
          What we do
        </h2>
        <ul className="about__capability-list">
          {capabilities.map((capability) => (
            <li key={capability.slug}>
              <Link href={`/services#${capability.slug}`} className="u-link">
                {capability.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="page__cta u-shell">
        <h2 className="page__cta-title">Turn presence into position.</h2>
        <Link href="/contact" className="u-btn u-btn--primary">
          Start a project
        </Link>
      </section>
    </main>
  );
}
