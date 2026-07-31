/**
 * Enquiry form contract.
 *
 * Kept out of the `'use server'` module on purpose: every export of a server
 * action file is wrapped as a server reference, so shared constants and types
 * have to live somewhere both the client form and the action can import.
 */

export type ContactState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  /** Field-level messages, keyed by input name for `aria-describedby`. */
  errors: Record<string, string>;
};

export const initialContactState: ContactState = {
  status: 'idle',
  message: '',
  errors: {},
};

export const NEEDS = [
  'Brand strategy and positioning',
  'Branding and visual identity',
  'Social media strategy and management',
  'Content, reels and campaign concepts',
  'Photography, video and production',
  'Website and digital experience design',
  'Campaign planning and launches',
  'Not sure yet',
] as const;

export const TIMINGS = [
  'Within a month',
  '1-3 months',
  '3-6 months',
  'Exploring options',
] as const;

export const BUDGETS = [
  'Not disclosed',
  'Under ₹5L',
  '₹5L - ₹15L',
  '₹15L - ₹40L',
  '₹40L+',
] as const;

export const contactOptions = { needs: NEEDS, timings: TIMINGS, budgets: BUDGETS };

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type EnquiryValues = {
  name: string;
  email: string;
  company: string;
  need: string;
  timing: string;
  budget: string;
  brief: string;
  consent: boolean;
};

/** Pure validator, shared by the action and by unit tests. */
export function validateEnquiry(values: EnquiryValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (values.name.trim().length < 2) errors.name = 'Please tell us your name.';
  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Please enter an email address we can reply to.';
  }
  if (!NEEDS.includes(values.need as (typeof NEEDS)[number])) {
    errors.need = 'Please choose what you need help with.';
  }
  if (!TIMINGS.includes(values.timing as (typeof TIMINGS)[number])) {
    errors.timing = 'Please choose an approximate timing.';
  }
  if (values.budget && !BUDGETS.includes(values.budget as (typeof BUDGETS)[number])) {
    errors.budget = 'Please choose one of the listed budget bands.';
  }
  if (!values.consent) {
    errors.consent = 'We need your consent before we can store this enquiry.';
  }

  return errors;
}
