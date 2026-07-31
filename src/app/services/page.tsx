import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/content/services";
import { getScene } from "@/content/scenes";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Brand strategy, social media, campaigns, content, identity, production and digital experience — run as one connected system.",
  alternates: { canonical: "/services" },
};

/**
 * Direct capabilities index.
 *
 * Exists for search and high-intent visitors who do not want the cinematic
 * route. Every capability links back to the scene that dramatises it, so the
 * two ways through the site stay connected.
 */
export default function ServicesPage() {
  return (
    <main id="main" className={styles.page}>
      <div className="shell">
        <div className={styles.lede}>
          <p className={styles.eyebrow}>Capabilities</p>
          <h1 className={styles.title}>Not seven services. One system.</h1>
          <p className={styles.intro}>
            Each capability below has a job inside the same system. They are
            listed in the order they usually matter — direction first, then
            distribution, then the craft that carries it.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.grid}>
            {services.map((service) => {
              const scene = getScene(service.scene);
              return (
                <article
                  key={service.slug}
                  id={service.slug}
                  className={styles.card}
                >
                  <p className={styles.cardMeta}>
                    {String(service.rank).padStart(2, "0")}
                  </p>
                  <h2 className={styles.cardTitle}>{service.title}</h2>
                  <p className={styles.cardBody}>{service.detail}</p>

                  <ul className={styles.list}>
                    {service.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {scene && (
                    <p className={styles.cardMeta} style={{ marginTop: "1.5rem" }}>
                      <Link href={`/#${scene.id}`}>
                        See it in the journey — {scene.name} →
                      </Link>
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
