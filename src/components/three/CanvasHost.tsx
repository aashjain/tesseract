'use client';

import { Canvas } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';
import { ACESFilmicToneMapping } from 'three';

import { AdaptiveQuality } from '@/components/three/AdaptiveQuality';
import { RendererBoundary } from '@/components/three/RendererBoundary';
import { WorldRoot } from '@/components/three/WorldRoot';
import { useExperience } from '@/lib/experience/store';
import type { Project, SceneContent } from '@/lib/content/types';

/**
 * The single persistent canvas.
 *
 * One renderer for the whole journey — never one canvas per scene. It sits fixed
 * behind the story rail and is marked `aria-hidden`, because every word, link
 * and control it illustrates already exists as real HTML in front of it.
 *
 * Any renderer failure hands control back to the semantic presentation instead
 * of showing an error wall.
 */
export function CanvasHost({
  projects,
  compact,
  onReady,
  onFailure,
}: {
  scenes: SceneContent[];
  projects: Project[];
  compact: boolean;
  onReady: () => void;
  onFailure: (reason: string) => void;
}) {
  const tier = useExperience((state) => state.tier);
  const maxDpr = useExperience((state) => state.maxDpr);
  const coarsePointer = useExperience((state) => state.coarsePointer);
  const [failed, setFailed] = useState(false);

  const handleFailure = useCallback(
    (reason: string) => {
      setFailed(true);
      onFailure(reason);
    },
    [onFailure],
  );

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (typeof event.message === 'string' && /webgl|three/i.test(event.message)) {
        handleFailure('renderer-error');
      }
    };
    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, [handleFailure]);

  if (failed) return null;

  return (
    <div className="canvas-host" aria-hidden="true">
      <RendererBoundary onFailure={handleFailure}>
        <Canvas
          // The camera is fully controlled by `CameraRig`; these are only the
          // values used for the very first frame.
          camera={{
            position: [0, 0, 15],
            fov: compact ? 62 : 52,
            near: 0.1,
            far: 260,
          }}
          dpr={[1, maxDpr]}
          gl={{
            antialias: tier !== 'low',
            powerPreference: 'high-performance',
            alpha: false,
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.setClearColor('#04050c', 1);
          }}
          frameloop="always"
          resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
          fallback={null}
        >
          <AdaptiveQuality maxDpr={maxDpr} onFailure={handleFailure} />
          <WorldRoot
            projects={projects}
            tier={tier}
            compact={compact}
            coarsePointer={coarsePointer}
            onReady={onReady}
          />
        </Canvas>
      </RendererBoundary>
    </div>
  );
}
