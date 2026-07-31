import type { Metadata } from 'next';
import Link from 'next/link';

import { ProjectEnquiryForm } from '@/components/forms/ProjectEnquiryForm';
import { content } from '@/lib/content/repository';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Start a project with AG Designs. Tell us what you need and when you need it.',
};

export default async function ContactPage() {
  const settings = await content.siteSettings();

  return (
    <main id="main" className="page">
      <header className="page__head u-shell">
        <p className="u-eyebrow">Start a project</p>
        <h1 className="page__title">Bring the fragments. We will find the system.</h1>
        <p className="u-lede">
          Tell us roughly what you are trying to do. A short reply from a real person beats a long
          form, so this one is deliberately short.
        </p>
      </header>

      <div className="u-shell contact">
        <div className="contact__form">
          <ProjectEnquiryForm />
        </div>

        <aside className="contact__aside" aria-labelledby="direct">
          <h2 id="direct" className="u-eyebrow">
            Or go direct
          </h2>
          <p>
            <a href={`mailto:${settings.contact.email}`} className="u-link">
              {settings.contact.email}
            </a>
          </p>
          <p className="contact__location">
            {settings.contact.city}, {settings.contact.country}
          </p>

          <h2 className="u-eyebrow contact__aside-title">Elsewhere</h2>
          <ul className="contact__social">
            {settings.social.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="u-link" target="_blank" rel="noreferrer noopener">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="contact__privacy">
            We use your details only to reply to this enquiry. See our{' '}
            <Link href="/privacy" className="u-link">
              privacy note
            </Link>
            .
          </p>
        </aside>
      </div>
    </main>
  );
}
