import { AG_PATH_A, AG_PATH_G } from '@/lib/brand/paths';
import {
  AG_DESIGNS_WORDMARK_MARKUP,
  AG_MONOGRAM_MARKUP,
} from '@/lib/brand/generated/agLogoMarkup';

type BaseProps = {
  className?: string;
  /** Accessible label. Pass `null` for purely decorative instances. */
  title?: string | null;
};

type LogoFullProps = BaseProps & {
  /**
   * `full` renders the untouched supplied artwork including the small curved
   * `designs` wordmark detail. `monogram` is the documented approved responsive
   * variant, used only at sizes where the wordmark detail is illegible.
   */
  variant?: 'full' | 'monogram';
};

/**
 * `AGLogoFull` — the complete approved lockup.
 *
 * Markup is generated verbatim from `public/brand/source/ag-logo.svg` by
 * `scripts/derive-brand.mjs`; nothing here is redrawn. Rendering inline (rather
 * than as an <img>) is what lets the mark inherit `currentColor` on the dark
 * ink surface. The original file remains committed and untouched.
 */
export function AGLogoFull({ className, title = 'AG Designs', variant = 'full' }: LogoFullProps) {
  const markup =
    variant === 'full'
      ? `${AG_MONOGRAM_MARKUP}${AG_DESIGNS_WORDMARK_MARKUP}`
      : AG_MONOGRAM_MARKUP;

  return (
    <svg
      viewBox="0 0 3750 3750"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <g fill="currentColor" dangerouslySetInnerHTML={{ __html: markup }} />
    </svg>
  );
}

/**
 * The approved left-hand A glyph in isolation — the aperture.
 * The viewBox is tightened to the measured glyph bounds; path data is untouched.
 */
export function AGGlyphA({ className, title = null }: BaseProps) {
  return (
    <svg
      viewBox="673.39 803.83 1039.32 992.02"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={AG_PATH_A} fill="currentColor" />
    </svg>
  );
}

/**
 * The approved right-hand G glyph in isolation — the earned orbit.
 * Reserved for Scene 12 and the final lockup; never previewed early.
 */
export function AGGlyphG({ className, title = null }: BaseProps) {
  return (
    <svg
      viewBox="2002.89 803.83 1073.73 2142.35"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={AG_PATH_G} fill="currentColor" />
    </svg>
  );
}
