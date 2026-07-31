import { AG_GLYPH_A, AG_GLYPH_BOUNDS, AG_GLYPH_G, AG_VIEWBOX } from "./logo";

/**
 * Tight viewBox around the monogram itself.
 *
 * The source SVG's `0 0 3750 3750` square carries a large amount of clear space
 * around the marks. Rendering that square at 26px leaves the glyphs only a few
 * pixels tall and illegible. This crops to the measured glyph bounds and adds a
 * proportional margin as the clear space.
 *
 * The paths are untouched — only the window onto them changes.
 */
const MARGIN = 90;
const { a, g } = AG_GLYPH_BOUNDS;
const minX = a.x - MARGIN;
const minY = Math.min(a.y, g.y) - MARGIN;
const maxX = g.x + g.width + MARGIN;
const maxY = Math.max(a.y + a.height, g.y + g.height) + MARGIN;
const TIGHT_VIEWBOX = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
const TIGHT_RATIO = (maxX - minX) / (maxY - minY);

type Props = {
  /** Rendered height in px. Width follows the mark's aspect ratio. */
  size?: number;
  /** Accessible label. Omit for decorative use alongside visible text. */
  title?: string;
  /**
   * Use the untouched square viewBox including its full clear space. Correct
   * for large, isolated placements; illegible below roughly 120px.
   */
  fullClearSpace?: boolean;
  className?: string;
};

/**
 * The approved AG monogram, drawn from the verbatim source paths.
 *
 * The source SVG carries no fill, so it inherits `currentColor`. The small
 * curved `designs` wordmark detail from the original file is intentionally not
 * included here — it is illegible at UI sizes and its responsive treatment
 * needs brand approval. Use `public/brand/source/ag-logo.svg` directly where
 * the complete lockup is required.
 */
export function AGLogo({
  size = 40,
  title,
  fullClearSpace = false,
  className,
}: Props) {
  const width = fullClearSpace ? size : Math.round(size * TIGHT_RATIO);

  return (
    <svg
      viewBox={fullClearSpace ? AG_VIEWBOX : TIGHT_VIEWBOX}
      width={width}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      <path d={AG_GLYPH_G} />
      <path d={AG_GLYPH_A} />
    </svg>
  );
}
