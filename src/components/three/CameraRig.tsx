'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';

import { cameraKeys, sampleCamera } from '@/lib/experience/cameraPath';
import { damp, storyClock } from '@/lib/experience/progress';

/**
 * Drives the camera from story progress alone.
 *
 * Pointer input is applied as a bounded child offset — a maximum of ~2 degrees
 * of rotation and ~12 px of apparent displacement — so moving the mouse can
 * never change where the visitor is in the story.
 */
export function CameraRig({ compact, coarsePointer }: { compact: boolean; coarsePointer: boolean }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const keys = useMemo(() => cameraKeys(compact), [compact]);

  const lookTarget = useRef(new Vector3());
  const parallax = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (coarsePointer) return;
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [coarsePointer]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(0.05, rawDelta);
    storyClock.elapsed += delta;

    // The scrubbed value is already eased by ScrollTrigger; this second, gentler
    // damping is what keeps fast flicks readable instead of teleporting.
    storyClock.smoothed = damp(storyClock.smoothed, storyClock.progress, 7.5, delta);

    const sample = sampleCamera(keys, storyClock.smoothed);

    // Bounded pointer parallax on a child offset only.
    const limit = compact ? 0 : 0.34;
    parallax.current.x = damp(parallax.current.x, pointer.current.x * limit, 3.2, delta);
    parallax.current.y = damp(parallax.current.y, pointer.current.y * limit * 0.6, 3.2, delta);
    storyClock.pointerX = damp(storyClock.pointerX, pointer.current.x, 3.2, delta);
    storyClock.pointerY = damp(storyClock.pointerY, pointer.current.y, 3.2, delta);

    camera.position.set(
      sample.position.x + parallax.current.x,
      sample.position.y - parallax.current.y,
      sample.position.z,
    );

    lookTarget.current.set(
      sample.target.x + parallax.current.x * 0.35,
      sample.target.y - parallax.current.y * 0.35,
      sample.target.z,
    );
    camera.lookAt(lookTarget.current);

    // Roll is authored, small, and applied after lookAt so text in the HTML
    // layer is never affected by it.
    camera.rotateZ(sample.roll);

    if (Math.abs(camera.fov - sample.fov) > 0.01) {
      camera.fov = MathUtils.lerp(camera.fov, sample.fov, 0.35);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
