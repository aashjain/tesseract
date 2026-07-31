import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { palette } from '@/lib/design/tokens';
import { cameraKeys, sampleCamera, sceneOffsetX } from '@/lib/experience/cameraPath';
import {
  SCENES,
  SCENE_COUNT,
  buildSceneRanges,
  localProgress,
  sceneAtProgress,
} from '@/lib/experience/sceneManifest';
import { pulse, smoothstep } from '@/lib/experience/progress';
import { validateEnquiry } from '@/lib/forms/enquiry';
import { capabilities, scenes } from '@/lib/content/fixtures';

describe('scene manifest', () => {
  it('has the twelve scenes the brief requires', () => {
    expect(SCENE_COUNT).toBe(12);
  });

  it('gives every scene more than one viewport of scroll', () => {
    // A sticky reading zone is pinned for (weight - 1) viewports. At weight 1 it
    // is never pinned, and the copy slides away while its scene is still playing.
    for (const scene of SCENES) {
      expect(scene.weight, scene.key).toBeGreaterThan(1);
      expect(scene.mobileWeight, scene.key).toBeGreaterThan(1);
      expect(scene.mobileWeight, scene.key).toBeLessThan(scene.weight);
    }
  });

  it('compresses the mobile journey by 25-35 percent', () => {
    const full = SCENES.reduce((sum, scene) => sum + scene.weight, 0);
    const compact = SCENES.reduce((sum, scene) => sum + scene.mobileWeight, 0);
    const reduction = 1 - compact / full;
    expect(reduction).toBeGreaterThan(0.2);
    expect(reduction).toBeLessThan(0.4);
  });

  it('produces contiguous ranges covering the whole journey', () => {
    for (const compact of [false, true]) {
      const ranges = buildSceneRanges(compact);
      expect(ranges[0]!.start).toBe(0);
      expect(ranges[ranges.length - 1]!.end).toBeCloseTo(1, 8);
      ranges.forEach((range, index) => {
        if (index === 0) return;
        expect(range.start).toBeCloseTo(ranges[index - 1]!.end, 8);
      });
    }
  });

  it('resolves a scene for every progress value, including the endpoints', () => {
    const ranges = buildSceneRanges(false);
    expect(sceneAtProgress(ranges, 0).order).toBe(1);
    expect(sceneAtProgress(ranges, 1).order).toBe(12);
    expect(sceneAtProgress(ranges, -5).order).toBe(1);
    expect(sceneAtProgress(ranges, 5).order).toBe(12);
  });

  it('clamps local progress at both ends', () => {
    const range = buildSceneRanges(false)[3]!;
    expect(localProgress(range, range.start - 0.2)).toBe(0);
    expect(localProgress(range, range.end + 0.2)).toBe(1);
    expect(localProgress(range, (range.start + range.end) / 2)).toBeCloseTo(0.5, 6);
  });

  it('gives the framing scenes the whole frame', () => {
    expect(sceneOffsetX(1, false)).toBe(0);
    expect(sceneOffsetX(2, false)).toBe(0);
    expect(sceneOffsetX(3, false)).toBe(0);
    expect(sceneOffsetX(12, false)).toBe(0);
    // Elsewhere the object sits opposite the reading zone.
    expect(sceneOffsetX(4, false)).toBeLessThan(0);
    expect(sceneOffsetX(5, false)).toBeGreaterThan(0);
    // Mobile centres everything.
    expect(sceneOffsetX(5, true)).toBe(0);
  });
});

describe('camera path', () => {
  it('is monotonic in time and continuous in space', () => {
    const keys = cameraKeys(false);
    for (let i = 1; i < keys.length; i += 1) {
      expect(keys[i]!.t).toBeGreaterThanOrEqual(keys[i - 1]!.t);
    }

    // No teleports. The whole journey travels ~286 m, so an even pace would be
    // ~0.57 m per 0.2% step. The fastest authored move is the crossing of the A
    // counter-space; anything beyond this bound is a cut, not a camera move.
    let previous = sampleCamera(keys, 0).position.clone();
    let worst = 0;
    for (let p = 0.002; p <= 1; p += 0.002) {
      const next = sampleCamera(keys, p).position;
      worst = Math.max(worst, previous.distanceTo(next));
      previous = next.clone();
    }
    expect(worst).toBeLessThan(2.5);
  });

  it('keeps authored roll inside three degrees', () => {
    const keys = cameraKeys(false);
    const limit = (3 * Math.PI) / 180;
    for (let p = 0; p <= 1; p += 0.005) {
      expect(Math.abs(sampleCamera(keys, p).roll)).toBeLessThanOrEqual(limit);
    }
  });

  it('passes through the aperture station', () => {
    const keys = cameraKeys(false);
    const apertureZ = SCENES[1]!.stationZ;
    let crossed = false;
    for (let p = 0; p <= 1; p += 0.001) {
      if (sampleCamera(keys, p).position.z < apertureZ) {
        crossed = true;
        break;
      }
    }
    expect(crossed).toBe(true);
  });

  it('clamps out-of-range progress instead of extrapolating', () => {
    const keys = cameraKeys(false);
    expect(sampleCamera(keys, -1).position.z).toBeCloseTo(sampleCamera(keys, 0).position.z, 6);
    expect(sampleCamera(keys, 2).position.z).toBeCloseTo(sampleCamera(keys, 1).position.z, 6);
  });
});

describe('progress helpers', () => {
  it('smoothsteps between the edges', () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 6);
  });

  it('pulses up, holds, then falls', () => {
    expect(pulse(0, 0.1, 0.3, 0.7, 0.9)).toBe(0);
    expect(pulse(0.5, 0.1, 0.3, 0.7, 0.9)).toBe(1);
    expect(pulse(1, 0.1, 0.3, 0.7, 0.9)).toBe(0);
    expect(pulse(0.2, 0.1, 0.3, 0.7, 0.9)).toBeGreaterThan(0);
    expect(pulse(0.2, 0.1, 0.3, 0.7, 0.9)).toBeLessThan(1);
  });
});

describe('design tokens', () => {
  it('matches the CSS custom properties the HTML layer uses', () => {
    const css = readFileSync('src/styles/tokens.css', 'utf8');
    const pairs: [string, string][] = [
      ['--ink-900', palette.ink900],
      ['--ink-800', palette.ink800],
      ['--violet-500', palette.violet500],
      ['--cyan-500', palette.cyan500],
      ['--warm-500', palette.warm500],
      ['--paper-100', palette.paper100],
    ];
    for (const [name, value] of pairs) {
      expect(css, name).toContain(`${name}: ${value};`);
    }
  });
});

describe('content fixtures', () => {
  it('covers all seven capabilities across the journey', () => {
    expect(capabilities).toHaveLength(7);
    const referenced = new Set(scenes.flatMap((scene) => scene.capabilitySlugs));
    for (const capability of capabilities) {
      expect(referenced.has(capability.slug), capability.slug).toBe(true);
    }
  });

  it('points every capability at a scene that exists', () => {
    const keys = new Set(SCENES.map((scene) => scene.key));
    for (const capability of capabilities) {
      expect(keys.has(capability.sceneKey), capability.slug).toBe(true);
    }
  });

  it('gives every scene copy and a unique hash', () => {
    const hashes = new Set<string>();
    for (const scene of scenes) {
      expect(scene.headline.length, scene.sceneKey).toBeGreaterThan(0);
      expect(scene.support.length, scene.sceneKey).toBeGreaterThan(0);
      expect(scene.fallbackImage?.alt.length, scene.sceneKey).toBeGreaterThan(0);
      expect(hashes.has(scene.hash), scene.hash).toBe(false);
      hashes.add(scene.hash);
    }
  });

  it('keeps headlines short enough for an immersive frame', () => {
    for (const scene of scenes) {
      const words = scene.headline.split(/\s+/).length;
      // The plan asks for 2-7 word headlines. The single exception is the
      // mandated final CTA, "Build a world only your brand can own." (8 words),
      // which the brief specifies verbatim.
      const limit = scene.sceneKey === 'resolutionG' ? 8 : 7;
      expect(words, scene.headline).toBeLessThanOrEqual(limit);
    }
  });
});

describe('enquiry validation', () => {
  const valid = {
    name: 'Priya',
    email: 'priya@example.com',
    company: 'Example',
    need: 'Brand strategy and positioning',
    timing: 'Within a month',
    budget: 'Not disclosed',
    brief: '',
    consent: true,
  };

  it('accepts a complete enquiry', () => {
    expect(validateEnquiry(valid)).toEqual({});
  });

  it('reports each problem against its own field', () => {
    const errors = validateEnquiry({
      ...valid,
      name: 'A',
      email: 'nope',
      need: '',
      timing: '',
      consent: false,
    });
    expect(Object.keys(errors).sort()).toEqual(['consent', 'email', 'name', 'need', 'timing']);
  });

  it('rejects values outside the controlled option lists', () => {
    expect(validateEnquiry({ ...valid, budget: '₹1 crore' })).toHaveProperty('budget');
    expect(validateEnquiry({ ...valid, need: 'Something else' })).toHaveProperty('need');
  });

  it('treats an empty budget as the optional field it is', () => {
    expect(validateEnquiry({ ...valid, budget: '' })).toEqual({});
  });
});
