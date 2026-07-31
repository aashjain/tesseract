import Link from "next/link";
import { utilityCopy } from "@/content/scenes";
import styles from "./page.module.css";

export default function NotFound() {
  return (
    <main id="main" className={styles.page}>
      <div className={`shell ${styles.centered}`}>
        <p className={styles.eyebrow}>404</p>
        <h1 className={styles.title}>{utilityCopy.notFoundHeadline}</h1>
        <p className={styles.intro}>{utilityCopy.notFoundSupport}</p>

        <p style={{ marginTop: "2.5rem", display: "flex", gap: "1rem" }}>
          <Link href="/" className={styles.backLink}>
            Return home
          </Link>
          <Link href="/work" className={styles.backLink}>
            Explore work
          </Link>
        </p>
      </div>
    </main>
  );
}
