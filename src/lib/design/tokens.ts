/**
 * The subset of design tokens the WebGL layer needs. Kept in sync with
 * `src/styles/tokens.css` by hand — a unit test asserts the hex values match.
 */

export const palette = {
  ink900: '#04050c',
  ink800: '#070814',
  ink700: '#0b0d1d',
  ink600: '#121529',
  ink500: '#1b1f38',
  violet600: '#4a2fd6',
  violet500: '#7456ff',
  violet400: '#9179ff',
  cyan600: '#0b7fc2',
  cyan500: '#28b7ff',
  cyan400: '#6ecdff',
  warm500: '#ff8a5b',
  warm400: '#ffab7f',
  paper100: '#f4f1ea',
  paper200: '#e6e2d9',
} as const;

export type PaletteKey = keyof typeof palette;

/** Curated per-scene colour variants. Editors pick a variant, never a hex. */
export const sceneVariants = {
  violet: { key: 'violet', accent: palette.violet500, rim: palette.violet400 },
  cyan: { key: 'cyan', accent: palette.cyan500, rim: palette.cyan400 },
  warm: { key: 'warm', accent: palette.warm500, rim: palette.warm400 },
} as const;

export type SceneVariantKey = keyof typeof sceneVariants;
