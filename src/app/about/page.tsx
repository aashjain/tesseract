import type { Metadata } from "next";
import { hasPlaceholderPeople, people } from "@/content/people";
import { acts } from "@/content/scenes";
import { site } from "@/content/site";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "AG Designs Studio is a digital marketing agency. We find the organising idea, then make every channel carry it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main" className={styles.page}>
      <div className="shell">
        <div className={styles.lede}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.title}>Systems, made by people.</h1>
          <p className={styles.intro}>{site.proposition}</p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>How we work</h2>
          <div className={styles.prose}>
            <p>
              We do not add more content to the noise. We find the organising
              idea — the thing every channel can build from — and then make
              strategy, social, campaigns, content, production and digital all
              carry it.
            </p>
            <p>
              That means we decide what a brand should mean before we decide how
              it should look, and we measure whether it worked ninety days later
              rather than on launch day.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>What changes</h2>
          <div className={styles.grid}>
            {acts.map((act) => (
              <div key={act.id} className={styles.card}>
                <p className={styles.cardMeta}>Act {act.number}</p>
                <h3 className={styles.cardTitle}>{act.title}</h3>
                <p className={styles.cardBody}>{act.feeling}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>The team</h2>

          {hasPlaceholderPeople && (
            <p className={styles.caution}>
              Placeholder team. Replace with real names, roles, portraits and
              one belief each before launch.
            </p>
          )}

          <div className={styles.grid}>
            {people.map((person) => (
              <div key={person.slug} className={styles.card}>
                <p className={styles.cardMeta}>{person.role}</p>
                <h3 className={styles.cardTitle}>{person.name}</h3>
                <p className={styles.cardBody}>{person.belief}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
