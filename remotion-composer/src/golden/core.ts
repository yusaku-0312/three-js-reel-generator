import { useEffect, useMemo } from "react";
import * as THREE from "three";
import timelineJson from "../../public/golden/timeline.json";
import { ramp, sec } from "../koucha/anim";
import { H, W } from "../koucha/theme";
import { SceneT, TimelineT } from "../koucha/types";

export const TL = timelineJson as TimelineT;
export const GOLDEN_DURATION = TL.durationInFrames;

export type V3 = [number, number, number];
export type Shot = { pos: V3; target: V3; fov: number };

/** Per-scene clock: local frame plus frame lookups for narration lines and chunks. */
export type Beat = { f: number; dur: number; ln: (i: number) => number; ck: (i: number, j: number) => number };

export const sceneAt = (frame: number): SceneT =>
  TL.scenes.find((s) => frame < sec(s.end)) ?? TL.scenes[TL.scenes.length - 1];

export const beatFor = (scene: SceneT, frame: number): Beat => ({
  f: frame - sec(scene.start),
  dur: sec(scene.end) - sec(scene.start),
  ln: (i) => sec(scene.lines[i].start),
  ck: (i, j) => sec(scene.lines[i].chunks[j]),
});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 0→1 linearly over [start, start+dur] frames, clamped. */
export const lin = (f: number, start: number, dur: number) => clamp01((f - start) / dur);

export const lerpShot = (a: Shot, b: Shot, t: number): Shot => ({
  pos: lerp3(a.pos, b.pos, t),
  target: lerp3(a.target, b.target, t),
  fov: lerp(a.fov, b.fov, t),
});

/** Camera keys: each key eases in from the previous shot over `dur` frames starting at its frame. */
export const shotKeys = (f: number, keys: Array<[number, Shot, number?]>): Shot => {
  let current = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [at, next, dur = 30] = keys[i];
    if (f < at) break;
    current = lerpShot(current, next, ramp(f, at, dur));
  }
  return current;
};

/** Slow handheld-free drift so held shots never look frozen. */
export const drift = (shot: Shot, f: number, amount = 0.06): Shot => ({
  ...shot,
  pos: add3(shot.pos, [Math.sin(f / 70) * amount, Math.sin(f / 95) * amount * 0.5, 0]),
});

const projCam = new THREE.PerspectiveCamera(35, W / H, 0.05, 100);
const projVec = new THREE.Vector3();

/** Screen pixel of a world point under `shot`, for HTML labels that track 3D objects. */
export const project = (shot: Shot, p: V3) => {
  projCam.fov = shot.fov;
  projCam.position.set(...shot.pos);
  projCam.lookAt(...shot.target);
  projCam.updateProjectionMatrix();
  projCam.updateMatrixWorld();
  projVec.set(...p).project(projCam);
  return { x: ((projVec.x + 1) / 2) * W, y: ((1 - projVec.y) / 2) * H };
};

/** Deterministic PRNG (mulberry32) so every render of a frame is identical. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Geometry rebuilt from frame-driven params, disposed when replaced or unmounted. */
export function useGeometry<T extends THREE.BufferGeometry>(make: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geo = useMemo(make, deps);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}
