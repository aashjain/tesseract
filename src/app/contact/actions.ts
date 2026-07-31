'use server';

import { type ContactState, validateEnquiry } from '@/lib/forms/enquiry';

function value(data: FormData, key: string): string {
  const raw = data.get(key);
  return typeof raw === 'string' ? raw.trim() : '';
}

/**
 * Contact submission.
 *
 * Validation is server-side and field-associated. Personal values are never
 * logged or forwarded to error monitoring — only the name of the field that
 * failed, which is all the analytics contract asks for.
 */
export async function submitEnquiry(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot. Bots fill it; people never see it.
  if (value(formData, 'company_website')) {
    return { status: 'success', message: 'Signal received. We will be in touch.', errors: {} };
  }

  const values = {
    name: value(formData, 'name'),
    email: value(formData, 'email'),
    company: value(formData, 'company'),
    need: value(formData, 'need'),
    timing: value(formData, 'timing'),
    budget: value(formData, 'budget'),
    brief: value(formData, 'brief'),
    consent: formData.get('consent') === 'on',
  };

  const errors = validateEnquiry(values);

  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please check the highlighted fields.', errors };
  }

  // DELIVERY NOT CONFIGURED BY DEFAULT. Point `CONTACT_WEBHOOK_URL` at the
  // studio's inbox, CRM or automation endpoint before launch — see README.
  // Deliberately no console output of form values.
  const endpoint = process.env.CONTACT_WEBHOOK_URL;
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error(`Enquiry endpoint responded ${response.status}`);
    } catch {
      return {
        status: 'error',
        message: 'We could not send that just now. Please email us directly and we will pick it up.',
        errors: {},
      };
    }
  }

  return { status: 'success', message: 'Signal received. We will be in touch.', errors: {} };
}
