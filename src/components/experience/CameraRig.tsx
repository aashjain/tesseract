"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { smooth, within } from "./timeline";

/**
 * Authored camera path.
 *
 * The camera is driven only by scene progress — never by free-fly controls and
 * never by the pointer. Pointer input is applied as a small child-rig offset
 * that cannot change the actual story position.
 *
 * Constraints from the motion rules: maximum 3 degrees of roll except the brief
 * dimensional fold, no rapid forward acceleration or oscillation, and a stable
 * focus distance during copy beats.
 */

const MAX_ROLL = THREE.MathUtils.degToRad(3);
const MAX_PARALLAX = THREE.MathUtils.degToRad(2);

// Waypoints along the journey. z travels forward; the story never doubles back.
const PATH = [
  new THREE.Vector3(0, 0, 9), // fragment field — outside, looking in
  new THREE.Vector3(0, 0, 5.4), // approaching the aperture
  new THREE.Vector3(0, 0, 1.2), // crossing the threshold
  new THREE.Vector3(0.7, 0.3, -1.4), // inside the tesseract
  new THREE.Vector3(-0.6, -0.2, -3.1), // axes / identity
  new THREE.Vector3(0.4, 0.4, -5.2), // signals / content
  new THREE.Vector3(-0.3, 0.1, -7.4), // production / portals
  new THREE.Vector3(0, -0.2, -9.6), // evidence
  new THREE.Vector3(0, 0, -11.4), // human
  new THREE.Vector3(0, 0, -8.2), // pull back for the G
];

const curve = new THREE.CatmullRomCurve3(PATH, false, "catmullrom", 0.4);

export function CameraRig({ progress }: { progress: number }) {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());
  const parallax = useRef(new THREE.Vector2());
  const eased = useRef(0);

  useFrame((_, delta) => {
    // Ease the scrubbed value so fast flicks do not translate into camera jerk.
    eased.current += (progress - eased.current) * Math.min(1, delta * 4);
    const p = eased.current;

    curve.getPointAt(Math.min(Math.max(p, 0), 1), target.current);
    camera.position.copy(target.current);

    // Look slightly ahead along the path so travel reads as intent.
    const ahead = Math.min(p + 0.02, 1);
    const lookAt = curve.getPointAt(ahead);
    camera.lookAt(lookAt);

    // Roll only during the dimensional fold, and even then within tolerance.
    const fold = within(p, "tesseract-revealed");
    camera.rotation.z = Math.sin(smooth(fold) * Math.PI) * MAX_ROLL;

    // Pointer parallax as a bounded offset, damped toward zero at the ending so
    // the final frame feels calm and assured.
    const calm = 1 - smooth(within(p, "g-resolution"));
    parallax.current.x += (pointer.x - parallax.current.x) * Math.min(1, delta * 3);
    parallax.current.y += (pointer.y - parallax.current.y) * Math.min(1, delta * 3);
    camera.rotation.y += parallax.current.x * MAX_PARALLAX * calm;
    camera.rotation.x += parallax.current.y * MAX_PARALLAX * calm;
  });

  return null;
}
