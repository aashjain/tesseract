import type { Metadata } from 'next';

import { content } from '@/lib/content/repository';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How AG Designs handles the information you send through this website.',
};

export default async function PrivacyPage() {
  const settings = await content.siteSettings();

  return (
    <main id="main" className="page">
      <header className="page__head u-shell">
        <p className="u-eyebrow">Legal</p>
        <h1 className="page__title">Privacy</h1>
        <p className="page__notice">
          Placeholder legal copy. {settings.legalName} must have this reviewed and replaced with the
          studio&rsquo;s approved privacy policy before launch.
        </p>
      </header>

      <div className="u-shell legal">
        <section aria-labelledby="what-we-collect">
          <h2 id="what-we-collect">What we collect</h2>
          <p>
            If you submit the enquiry form we receive the name, email address, company, requirement,
            timing and optional budget band and message you provide. We do not collect anything else
            through that form.
          </p>
        </section>

        <section aria-labelledby="why">
          <h2 id="why">Why we hold it</h2>
          <p>
            We use these details solely to respond to your enquiry and, if we work together, to run
            the project. We do not sell them and we do not add you to a marketing list without a
            separate, explicit opt-in.
          </p>
        </section>

        <section aria-labelledby="analytics">
          <h2 id="analytics">Analytics</h2>
          <p>
            This build ships without a third-party analytics tracker attached. If one is enabled
            later, it will be listed here together with the consent mechanism used and the events
            recorded.
          </p>
        </section>

        <section aria-labelledby="rights">
          <h2 id="rights">Your choices</h2>
          <p>
            Write to <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a> to ask
            what we hold about you, to correct it, or to have it deleted.
          </p>
        </section>
      </div>
    </main>
  );
}
