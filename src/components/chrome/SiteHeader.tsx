'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AGLogoFull } from '@/components/brand/AGLogo';
import { StoryProgress } from '@/components/chrome/StoryProgress';
import { SoundToggle } from '@/components/chrome/SoundToggle';
import { useExperience } from '@/lib/experience/store';
import type { SiteSettings } from '@/lib/content/types';

/**
 * Persistent navigation. Present from the first viewport in every mode, so the
 * cinematic route is never a trap: home, the three sections, the primary action,
 * story progress and the sound control are always one tab-stop away.
 */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const menuOpen = useExperience((state) => state.menuOpen);
  const setMenuOpen = useExperience((state) => state.setMenuOpen);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  // Escape closes; focus is returned to the trigger. Focus stays inside the
  // panel while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, setMenuOpen]);

  return (
    <header className={`chrome-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="chrome-header__bar">
        <Link href="/" className="chrome-mark" aria-label={`${settings.brandName}, home`}>
          <AGLogoFull className="chrome-mark__svg" variant="monogram" title={null} />
          <span className="chrome-mark__name">{settings.brandName}</span>
        </Link>

        {isHome ? <StoryProgress /> : null}

        <nav className="chrome-nav" aria-label="Primary">
          <ul className="chrome-nav__list">
            {settings.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="chrome-nav__link u-link"
                  aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="chrome-actions">
          <SoundToggle />
          <Link href={settings.primaryCta.href} className="u-btn u-btn--primary chrome-actions__cta">
            {settings.primaryCta.label}
          </Link>
          <button
            ref={triggerRef}
            type="button"
            className="chrome-menu-trigger"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="u-visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className={`chrome-menu-trigger__glyph${menuOpen ? ' is-open' : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        ref={panelRef}
        className={`chrome-menu${menuOpen ? ' is-open' : ''}`}
        hidden={!menuOpen}
      >
        <nav aria-label="All pages">
          <ul className="chrome-menu__list">
            {[{ label: 'Home', href: '/' }, ...settings.navigation, { label: 'Contact', href: '/contact' }].map(
              (item) => (
                <li key={item.href}>
                  <Link href={item.href} className="chrome-menu__link">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <div className="chrome-menu__meta">
          <p className="u-eyebrow">
            {settings.contact.city}, {settings.contact.country}
          </p>
          <a href={`mailto:${settings.contact.email}`} className="u-link">
            {settings.contact.email}
          </a>
          <ul className="chrome-menu__social">
            {settings.social.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="u-link" rel="noreferrer noopener" target="_blank">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className="u-btn chrome-menu__close"
          onClick={() => {
            setMenuOpen(false);
            triggerRef.current?.focus();
          }}
        >
          Close
        </button>
      </div>
    </header>
  );
}
