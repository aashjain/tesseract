import {
  AdditiveBlending,
  Color,
  DoubleSide,
  LineBasicMaterial,
  Material,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PointsMaterial,
} from 'three';

import { palette } from '@/lib/design/tokens';

/**
 * Shared material library.
 *
 * Every scene draws from these so the world reads as one lit space and the
 * renderer can batch. Materials are created once per canvas lifetime and
 * disposed together by `ResourceDisposal`.
 *
 * Material language, per the visual direction: frosted acrylic, anodised metal,
 * translucent film, coated paper and polished polymer. No unlit neon.
 */

export type MaterialLibrary = ReturnType<typeof createMaterialLibrary>;

export function createMaterialLibrary() {
  const registry: Material[] = [];
  const keep = <T extends Material>(material: T): T => {
    registry.push(material);
    return material;
  };

  const library = {
    /** Frosted acrylic — the aperture body and portal frames. */
    frosted: keep(
      new MeshPhysicalMaterial({
        color: new Color(palette.paper200),
        roughness: 0.36,
        metalness: 0,
        transmission: 0.72,
        thickness: 0.9,
        ior: 1.42,
        transparent: true,
        opacity: 1,
        side: DoubleSide,
      }),
    ),

    /** A cheaper stand-in used on the balanced and mobile tiers. */
    frostedLite: keep(
      new MeshStandardMaterial({
        color: new Color(palette.paper200),
        roughness: 0.42,
        metalness: 0.05,
        transparent: true,
        opacity: 0.34,
        side: DoubleSide,
      }),
    ),

    /** Anodised metal — rails, instruments, structural edges. */
    anodised: keep(
      new MeshStandardMaterial({
        color: new Color(palette.ink600),
        roughness: 0.32,
        metalness: 0.86,
      }),
    ),

    /** Coated paper — content frames, identity modules, human planes. */
    coated: keep(
      new MeshStandardMaterial({
        color: new Color(palette.paper100),
        roughness: 0.86,
        metalness: 0,
        side: DoubleSide,
      }),
    ),

    /** Polished polymer, tinted violet — the primary energy. */
    polymerViolet: keep(
      new MeshStandardMaterial({
        color: new Color(palette.violet500),
        roughness: 0.22,
        metalness: 0.3,
        emissive: new Color(palette.violet600),
        emissiveIntensity: 0.35,
      }),
    ),

    /** Polished polymer, tinted cyan — the secondary energy. */
    polymerCyan: keep(
      new MeshStandardMaterial({
        color: new Color(palette.cyan500),
        roughness: 0.22,
        metalness: 0.3,
        emissive: new Color(palette.cyan600),
        emissiveIntensity: 0.35,
      }),
    ),

    /** Controlled warmth, used only in production and team moments. */
    polymerWarm: keep(
      new MeshStandardMaterial({
        color: new Color(palette.warm500),
        roughness: 0.3,
        metalness: 0.15,
        emissive: new Color(palette.warm500),
        emissiveIntensity: 0.22,
      }),
    ),

    /** Translucent film — membranes inside the tesseract. */
    film: keep(
      new MeshBasicMaterial({
        color: new Color(palette.violet400),
        transparent: true,
        opacity: 0.055,
        side: DoubleSide,
        depthWrite: false,
      }),
    ),

    filmCyan: keep(
      new MeshBasicMaterial({
        color: new Color(palette.cyan400),
        transparent: true,
        opacity: 0.05,
        side: DoubleSide,
        depthWrite: false,
      }),
    ),

    /** Line materials. Selective emissive edges, kept local and low. */
    lineSoft: keep(
      new LineBasicMaterial({
        color: new Color(palette.paper200),
        transparent: true,
        opacity: 0.24,
      }),
    ),

    lineViolet: keep(
      new LineBasicMaterial({
        color: new Color(palette.violet400),
        transparent: true,
        opacity: 0.6,
      }),
    ),

    lineCyan: keep(
      new LineBasicMaterial({
        color: new Color(palette.cyan400),
        transparent: true,
        opacity: 0.6,
      }),
    ),

    /** Fragment points and signal pulses. */
    dust: keep(
      new PointsMaterial({
        color: new Color(palette.paper200),
        size: 0.035,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    ),

    dispose() {
      for (const material of registry) material.dispose();
      registry.length = 0;
    },
  };

  return library;
}

/** Accent material for a curated scene variant. */
export function accentMaterial(
  library: MaterialLibrary,
  variant: 'violet' | 'cyan' | 'warm',
): MeshStandardMaterial {
  if (variant === 'cyan') return library.polymerCyan;
  if (variant === 'warm') return library.polymerWarm;
  return library.polymerViolet;
}

export function accentLine(
  library: MaterialLibrary,
  variant: 'violet' | 'cyan' | 'warm',
): LineBasicMaterial {
  if (variant === 'cyan') return library.lineCyan;
  if (variant === 'warm') return library.lineSoft;
  return library.lineViolet;
}
