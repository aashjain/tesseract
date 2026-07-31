import Link from 'next/link';

import { AGLogoFull } from '@/components/brand/AGLogo';
import type { SiteSettings } from '@/lib/content/types';

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="chrome-footer">
      <div className="u-shell chrome-footer__inner">
        <div className="chrome-footer__brand">
          {/* The final 2D lockup uses the untouched supplied artwork, including
              the curved `designs` wordmark detail. */}
          <AGLogoFull className="chrome-footer__mark" title={`${settings.brandName} logo`} />
          <p className="chrome-footer__proposition">{settings.proposition}</p>
        </div>

        <div className="chrome-footer__columns">
          <div>
            <h2 className="u-eyebrow">Sections</h2>
            <ul className="chrome-footer__list">
              {settings.navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="u-link">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="u-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="u-eyebrow">Studio</h2>
            <ul className="chrome-footer__list">
              <li>
                <a href={`mailto:${settings.contact.email}`} className="u-link">
                  {settings.contact.email}
                </a>
              </li>
              <li>
                {settings.contact.city}, {settings.contact.country}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="u-eyebrow">Elsewhere</h2>
            <ul className="chrome-footer__list">
              {settings.social.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="u-link" rel="noreferrer noopener" target="_blank">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="u-shell chrome-footer__legal">
        <p>
          © {year} {settings.legalName}
        </p>
        <Link href="/privacy" className="u-link">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
