import * as THREE from "three";
import { Easing, interpolate } from "remotion";
import { add3, lerp, lerp3, V3 } from "../golden/core";
import { H, W } from "../koucha/theme";

/** Camera plus lens: `focus` is the world point kept sharp, `aperture` the background blur in px. */
export type Shot2 = { pos: V3; target: V3; fov: number; focus?: V3; aperture?: number; roll?: number };

export type Ease = (t: number) => number;
export const EASE = {
  /** Camera moves: slow start, long gentle landing. */
  cam: Easing.bezier(0.45, 0, 0.15, 1),
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  in: Easing.in(Easing.quad),
} satisfies Record<string, Ease>;

/** 0→1 over [start, start+dur] frames with an easing curve, clamped. */
export const ease = (f: number, start: number, dur: number, curve: Ease = EASE.inOut) =>
  interpolate(f, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: curve,
  });

export const lerpShot2 = (a: Shot2, b: Shot2, t: number): Shot2 => ({
  pos: lerp3(a.pos, b.pos, t),
  target: lerp3(a.target, b.target, t),
  fov: lerp(a.fov, b.fov, t),
  focus: lerp3(a.focus ?? a.target, b.focus ?? b.target, t),
  aperture: lerp(a.aperture ?? 0, b.aperture ?? 0, t),
  roll: lerp(a.roll ?? 0, b.roll ?? 0, t),
});

/** Camera keys: each key eases in from the running shot over `dur` frames starting at its frame. */
export const keys2 = (f: number, keys: Array<[number, Shot2, number?, Ease?]>): Shot2 => {
  let current = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [at, next, dur = 40, curve = EASE.cam] = keys[i];
    if (f < at) break;
    current = lerpShot2(current, next, ease(f, at, dur, curve));
  }
  return current;
};

/** Barely-there float so held shots breathe; never enough to read as handheld. */
export const breathe = (shot: Shot2, f: number, amount = 0.035): Shot2 => ({
  ...shot,
  pos: add3(shot.pos, [Math.sin(f / 83) * amount, Math.sin(f / 111) * amount * 0.6, Math.cos(f / 97) * amount * 0.4]),
});

/** Distance from the camera to the focus point along the view axis (what the DOF pass needs). */
export const focusDistance = (shot: Shot2) => {
  const pos = new THREE.Vector3(...shot.pos);
  const dir = new THREE.Vector3(...shot.target).sub(pos).normalize();
  return new THREE.Vector3(...(shot.focus ?? shot.target)).sub(pos).dot(dir);
};

const projCam = new THREE.PerspectiveCamera(35, W / H, 0.05, 60);
const projVec = new THREE.Vector3();

/** Screen pixel of a world point under `shot`, for HTML labels that track 3D objects. */
export const project2 = (shot: Shot2, p: V3) => {
  projCam.fov = shot.fov;
  projCam.position.set(...shot.pos);
  projCam.up.set(Math.sin(shot.roll ?? 0), Math.cos(shot.roll ?? 0), 0);
  projCam.lookAt(...shot.target);
  projCam.updateProjectionMatrix();
  projCam.updateMatrixWorld();
  projVec.set(...p).project(projCam);
  return { x: ((projVec.x + 1) / 2) * W, y: ((1 - projVec.y) / 2) * H };
};
