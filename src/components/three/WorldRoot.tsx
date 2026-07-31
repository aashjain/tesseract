'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { CameraRig } from '@/components/three/CameraRig';
import { WorldProvider } from '@/components/three/WorldContext';
import { ApertureA } from '@/components/three/scenes/ApertureA';
import { AxesOfIntent } from '@/components/three/scenes/AxesOfIntent';
import { EvidenceChamber } from '@/components/three/scenes/EvidenceChamber';
import { FragmentField } from '@/components/three/scenes/FragmentField';
import { HumanNode } from '@/components/three/scenes/HumanNode';
import { IdentityEngine } from '@/components/three/scenes/IdentityEngine';
import { MatterLab } from '@/components/three/scenes/MatterLab';
import { MomentumField } from '@/components/three/scenes/MomentumField';
import { PortalStack } from '@/components/three/scenes/PortalStack';
import { ResolutionG } from '@/components/three/scenes/ResolutionG';
import { SignalConstellation } from '@/components/three/scenes/SignalConstellation';
import { TesseractReveal } from '@/components/three/scenes/TesseractReveal';
import { QUALITY_BUDGETS, type QualityTier } from '@/lib/experience/capabilityDetection';
import { sceneOffsetX } from '@/lib/experience/cameraPath';
import { storyClock } from '@/lib/experience/progress';
import { SCENES, type SceneKey } from '@/lib/experience/sceneManifest';
import { createMaterialLibrary } from '@/lib/three/materials';
import type { Project } from '@/lib/content/types';

/**
 * The world.
 *
 * One shared lighting setup, one material library, twelve scene groups sitting
 * at their own stations along Z. Scene groups mount progressively — a scene is
 * created only once the visitor is within reach of it — and then stay mounted,
 * so scrolling back never rebuilds geometry.
 */
export function WorldRoot({
  projects,
  tier,
  compact,
  coarsePointer,
  onReady,
}: {
  projects: Project[];
  tier: QualityTier;
  compact: boolean;
  coarsePointer: boolean;
  onReady: () => void;
}) {
  const materials = useMemo(() => createMaterialLibrary(), []);

  useEffect(() => () => materials.dispose(), [materials]);

  useEffect(() => {
    // Give the first frame a chance to render before dismissing the loader.
    const id = window.requestAnimationFrame(() => onReady());
    return () => window.cancelAnimationFrame(id);
  }, [onReady]);

  const value = useMemo(
    () => ({ materials, tier, compact, budgets: QUALITY_BUDGETS[tier] }),
    [materials, tier, compact],
  );

  return (
    <WorldProvider value={value}>
      {/* Exponential fog keeps distant stations from stacking up visually and
          gives the ink field genuine depth. */}
      <fogExp2 attach="fog" args={['#04050c', 0.042]} />

      {/* Shared lighting: an ambient floor plus two narrow keys. Individual
          scenes add at most one local light of their own, keeping the active
          count inside the 3-5 budget. */}
      <ambientLight intensity={0.6} color="#7d8ac9" />
      <hemisphereLight args={['#b6c6ff', '#12152a', 0.7]} />
      <directionalLight position={[6, 8, 10]} intensity={2.1} color="#f4f1ea" />
      <directionalLight position={[-9, -3, -6]} intensity={0.85} color="#7456ff" />

      <CameraRig compact={compact} coarsePointer={coarsePointer} />

      <SceneGate sceneKey="fragmentField" compact={compact}>
        <FragmentField />
      </SceneGate>
      <SceneGate sceneKey="apertureA" compact={compact}>
        <ApertureA />
      </SceneGate>
      <SceneGate sceneKey="tesseractReveal" compact={compact}>
        <TesseractReveal />
      </SceneGate>
      <SceneGate sceneKey="axesOfIntent" compact={compact}>
        <AxesOfIntent />
      </SceneGate>
      <SceneGate sceneKey="identityEngine" compact={compact}>
        <IdentityEngine />
      </SceneGate>
      <SceneGate sceneKey="signalConstellation" compact={compact}>
        <SignalConstellation />
      </SceneGate>
      <SceneGate sceneKey="momentumField" compact={compact}>
        <MomentumField />
      </SceneGate>
      <SceneGate sceneKey="matterLab" compact={compact}>
        <MatterLab />
      </SceneGate>
      <SceneGate sceneKey="portalStack" compact={compact}>
        <PortalStack />
      </SceneGate>
      <SceneGate sceneKey="evidenceChamber" compact={compact}>
        <EvidenceChamber projects={projects} />
      </SceneGate>
      <SceneGate sceneKey="humanNode" compact={compact}>
        <HumanNode />
      </SceneGate>
      <SceneGate sceneKey="resolutionG" compact={compact}>
        <ResolutionG />
      </SceneGate>
    </WorldProvider>
  );
}

/**
 * Progressive mounting.
 *
 * Polls the story clock at 4 Hz — not every frame — and mounts a scene once the
 * visitor is within roughly two scenes of it. That is the "load one to two
 * scenes ahead" rule applied to procedural geometry: nothing is built until it
 * is nearly needed, and the poll itself costs nothing measurable.
 */
function SceneGate({
  sceneKey,
  compact,
  children,
}: {
  sceneKey: SceneKey;
  compact: boolean;
  children: React.ReactNode;
}) {
  const definition = SCENES.find((scene) => scene.key === sceneKey)!;
  const [mounted, setMounted] = useState(definition.order <= 3);
  const mountedRef = useRef(mounted);

  useEffect(() => {
    if (mountedRef.current) return;
    const check = () => {
      const range = storyClock.ranges.find((entry) => entry.key === sceneKey);
      if (!range) return;
      // Two scenes of lead time, expressed in progress units.
      const lead = 2 / SCENES.length;
      if (storyClock.progress >= range.mountStart - lead) {
        mountedRef.current = true;
        setMounted(true);
        window.clearInterval(id);
      }
    };
    const id = window.setInterval(check, 250);
    check();
    return () => window.clearInterval(id);
  }, [sceneKey]);

  if (!mounted) return null;

  return <group position-x={sceneOffsetX(definition.order, compact)}>{children}</group>;
}
