"use client";

import { useState } from "react";
import { utilityCopy } from "@/content/scenes";
import styles from "./contact.module.css";

type Errors = Partial<Record<"name" | "email" | "need" | "consent", string>>;

/**
 * Project enquiry form.
 *
 * Kept short deliberately — name, email, company, what is needed, timing and an
 * optional budget band. Errors are associated with their field and announced,
 * per WCAG 2.2. No submission endpoint is wired yet; routing is a launch input.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Errors = {};

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const need = String(data.get("need") ?? "").trim();

    if (!name) next.name = "Please tell us your name.";
    if (!email) next.email = "Please add an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "That email address does not look right.";
    if (!need) next.need = "Tell us briefly what you need.";
    if (!data.get("consent")) next.consent = "Please confirm before sending.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = document.getElementById(Object.keys(next)[0]);
      first?.focus();
      return;
    }

    // TODO: wire to the confirmed form destination before launch.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className={styles.success} role="status">
        {utilityCopy.contactSuccess}
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field
        id="name"
        label="Your name"
        error={errors.name}
        required
        autoComplete="name"
      />
      <Field
        id="email"
        label="Email"
        type="email"
        error={errors.email}
        required
        autoComplete="email"
      />
      <Field id="company" label="Company" autoComplete="organization" />

      <div className={styles.field}>
        <label htmlFor="need" className={styles.label}>
          What do you need? <span className={styles.required}>required</span>
        </label>
        <textarea
          id="need"
          name="need"
          rows={4}
          className={styles.input}
          required
          aria-invalid={errors.need ? true : undefined}
          aria-describedby={errors.need ? "need-error" : undefined}
        />
        {errors.need && (
          <p id="need-error" className={styles.error}>
            {errors.need}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="timing" className={styles.label}>
            Approximate timing
          </label>
          <select id="timing" name="timing" className={styles.input}>
            <option value="">Not sure yet</option>
            <option>Within a month</option>
            <option>One to three months</option>
            <option>Three months or more</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="budget" className={styles.label}>
            Budget band <span className={styles.optional}>optional</span>
          </label>
          <select id="budget" name="budget" className={styles.input}>
            <option value="">Prefer not to say</option>
            <option>Under 10k</option>
            <option>10k – 25k</option>
            <option>25k – 50k</option>
            <option>50k+</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.consent} htmlFor="consent">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>
            I am happy for AG Designs Studio to store these details in order to
            reply.
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" className={styles.error}>
            {errors.consent}
          </p>
        )}
      </div>

      <button type="submit" className={styles.submit}>
        Send
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  type = "text",
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  error?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}{" "}
        {required && <span className={styles.required}>required</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className={styles.input}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
