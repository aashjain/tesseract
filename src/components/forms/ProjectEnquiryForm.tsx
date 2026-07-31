'use client';

import { useActionState, useEffect, useId, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { track } from '@/lib/analytics/events';
import { submitEnquiry } from '@/app/contact/actions';
import { contactOptions, initialContactState } from '@/lib/forms/enquiry';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="u-btn u-btn--primary form__submit" disabled={pending}>
      {pending ? 'Sending…' : 'Send enquiry'}
    </button>
  );
}

export function ProjectEnquiryForm() {
  const [state, formAction] = useActionState(submitEnquiry, initialContactState);
  const ids = useId();
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const started = useRef(false);

  const fieldId = (name: string) => `${ids}-${name}`;
  const errorId = (name: string) => `${ids}-${name}-error`;

  useEffect(() => {
    if (state.status === 'error') {
      summaryRef.current?.focus();
      Object.keys(state.errors).forEach((field) => track({ name: 'contact_error', field }));
    }
    if (state.status === 'success') {
      summaryRef.current?.focus();
      track({ name: 'contact_submitted' });
    }
  }, [state]);

  const describedBy = (name: string) => (state.errors[name] ? errorId(name) : undefined);

  if (state.status === 'success') {
    return (
      <p ref={summaryRef} tabIndex={-1} className="form__success" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="form"
      noValidate
      onFocus={() => {
        if (started.current) return;
        started.current = true;
        track({ name: 'contact_started' });
      }}
    >
      {state.status === 'error' ? (
        <p ref={summaryRef} tabIndex={-1} className="form__summary" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="form__row">
        <div className="form__field">
          <label htmlFor={fieldId('name')}>Your name</label>
          <input
            id={fieldId('name')}
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(state.errors.name)}
            aria-describedby={describedBy('name')}
          />
          {state.errors.name ? (
            <p id={errorId('name')} className="form__error">
              {state.errors.name}
            </p>
          ) : null}
        </div>

        <div className="form__field">
          <label htmlFor={fieldId('email')}>Email</label>
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.errors.email)}
            aria-describedby={describedBy('email')}
          />
          {state.errors.email ? (
            <p id={errorId('email')} className="form__error">
              {state.errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="form__field">
        <label htmlFor={fieldId('company')}>Company or brand</label>
        <input
          id={fieldId('company')}
          name="company"
          type="text"
          autoComplete="organization"
        />
      </div>

      <div className="form__row">
        <div className="form__field">
          <label htmlFor={fieldId('need')}>What do you need?</label>
          <select
            id={fieldId('need')}
            name="need"
            defaultValue=""
            required
            aria-invalid={Boolean(state.errors.need)}
            aria-describedby={describedBy('need')}
          >
            <option value="" disabled>
              Choose one
            </option>
            {contactOptions.needs.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {state.errors.need ? (
            <p id={errorId('need')} className="form__error">
              {state.errors.need}
            </p>
          ) : null}
        </div>

        <div className="form__field">
          <label htmlFor={fieldId('timing')}>Approximate timing</label>
          <select
            id={fieldId('timing')}
            name="timing"
            defaultValue=""
            required
            aria-invalid={Boolean(state.errors.timing)}
            aria-describedby={describedBy('timing')}
          >
            <option value="" disabled>
              Choose one
            </option>
            {contactOptions.timings.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {state.errors.timing ? (
            <p id={errorId('timing')} className="form__error">
              {state.errors.timing}
            </p>
          ) : null}
        </div>
      </div>

      <div className="form__field">
        <label htmlFor={fieldId('budget')}>
          Budget band <span className="form__optional">optional</span>
        </label>
        <select id={fieldId('budget')} name="budget" defaultValue="Not disclosed">
          {contactOptions.budgets.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="form__field">
        <label htmlFor={fieldId('brief')}>
          Anything else? <span className="form__optional">optional</span>
        </label>
        <textarea id={fieldId('brief')} name="brief" rows={4} />
      </div>

      {/* Honeypot — visually and semantically removed from the real form. */}
      <div className="u-visually-hidden" aria-hidden="true">
        <label htmlFor={fieldId('company_website')}>Leave this field empty</label>
        <input id={fieldId('company_website')} name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form__consent">
        <input
          id={fieldId('consent')}
          name="consent"
          type="checkbox"
          aria-invalid={Boolean(state.errors.consent)}
          aria-describedby={describedBy('consent')}
        />
        <label htmlFor={fieldId('consent')}>
          I agree that AG Designs may store these details to respond to my enquiry.
        </label>
        {state.errors.consent ? (
          <p id={errorId('consent')} className="form__error">
            {state.errors.consent}
          </p>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}
