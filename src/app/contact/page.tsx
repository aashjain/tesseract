import type { Metadata } from "next";
import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";
import styles from "../page.module.css";
import contact from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with AG Designs Studio. Tell us what you need and we will be in touch.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main id="main" className={styles.page}>
      <div className="shell">
        <div className={styles.lede}>
          <p className={styles.eyebrow}>Contact</p>
          <h1 className={styles.title}>Bring the fragments.</h1>
          <p className={styles.intro}>
            Tell us what is not adding up. We will tell you what we would do
            about it.
          </p>
        </div>

        <ContactForm />

        {/* Contact details also live outside the form, and outside WebGL. */}
        <p className={contact.direct}>
          Prefer email?{" "}
          <a href={`mailto:${site.email}`} className={contact.directLink}>
            {site.email}
          </a>
        </p>
      </div>
    </main>
  );
}
