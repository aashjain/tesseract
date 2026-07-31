"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AGLogo } from "@/brand/AGLogo";
import { scenes, utilityCopy } from "@/content/scenes";
import { site } from "@/content/site";
import { useExperience } from "@/store/experience";
import styles from "./SiteHeader.module.css";

/**
 * Persistent navigation.
 *
 * Available from the first viewport — the visitor is never trapped inside the
 * experience. Carries the escape routes ("Explore normally"), the secondary
 * story progress readout, and the primary CTA.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const tier = useExperience((s) => s.tier);
  const progress = useExperience((s) => s.progress);
  const activeScene = useExperience((s) => s.activeSceneIndex);
  const menuOpen = useExperience((s) => s.menuOpen);
  const setMenuOpen = useExperience((s) => s.setMenuOpen);
  const chooseSemantic = useExperience((s) => s.chooseSemantic);

  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes the menu and returns focus to the control that opened it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, setMenuOpen]);

  // Close the menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  const showProgress = isHome && tier !== "D";
  const current = scenes[activeScene - 1];

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} ${menuOpen ? styles.navOpen : ""}`}>
        <Link href="/" className={styles.brand}>
          <AGLogo size={26} title={`${site.name} — home`} />
          <span className={styles.brandName}>{site.name}</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {showProgress && (
            <p className={styles.progress} aria-hidden="true">
              <span>
                {String(activeScene).padStart(2, "0")} / {scenes.length}
              </span>
              <span className={styles.progressBar}>
                <span
                  className={styles.progressFill}
                  style={{
                    width: "100%",
                    transform: `scaleX(${progress})`,
                  }}
                />
              </span>
              <span>{current?.name}</span>
            </p>
          )}

          <ul className={styles.navList}>
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {isHome && tier !== "D" && (
            <button
              type="button"
              className={styles.skipExperience}
              onClick={chooseSemantic}
            >
              {utilityCopy.exploreNormally}
            </button>
          )}

          <button
            ref={toggleRef}
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>

          <Link href={site.primaryCta.href} className={styles.cta}>
            {site.primaryCta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
