import Link from "next/link";
import { AGLogo } from "@/brand/AGLogo";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { hasPlaceholderProjects } from "@/content/projects";
import styles from "./SiteChrome.module.css";

export function SkipLink() {
  return (
    <a href="#main" className={styles.skipLink}>
      Skip to main content
    </a>
  );
}

/**
 * Visible while any published project is placeholder content. This is a guard
 * against fabricated case studies and invented metrics reaching a real
 * audience — it disappears on its own once `isPlaceholder` is cleared.
 */
export function PlaceholderNotice() {
  if (!hasPlaceholderProjects) return null;
  return (
    <p className={styles.placeholderNotice}>
      <span className={styles.noticeStrong}>Placeholder content.</span> Case
      studies, metrics and team details on this build are invented for layout
      development and are not real results.
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="shell">
        <div className={styles.footerGrid}>
          <div>
            <p className={styles.footerBrand}>
              <AGLogo size={28} />
              <span>{site.name}</span>
            </p>
            <p className={styles.footerProposition}>{site.proposition}</p>
          </div>

          <div>
            <h2 className={styles.footerHeading}>Capabilities</h2>
            <ul className={styles.footerList}>
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    className={styles.footerLink}
                    href={`/services#${service.slug}`}
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={styles.footerHeading}>Studio</h2>
            <ul className={styles.footerList}>
              <li>
                <Link className={styles.footerLink} href="/work">
                  Work
                </Link>
              </li>
              <li>
                <Link className={styles.footerLink} href="/about">
                  About
                </Link>
              </li>
              <li>
                <Link className={styles.footerLink} href="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className={styles.footerHeading}>Get in touch</h2>
            <ul className={styles.footerList}>
              <li>
                <a className={styles.footerLink} href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </li>
              <li>
                <Link className={styles.footerLink} href="/contact">
                  {site.primaryCta.label}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBase}>
          <p>
            © {new Date().getFullYear()} {site.legalName}
          </p>
          <p>{site.positioning}</p>
        </div>
      </div>
    </footer>
  );
}
