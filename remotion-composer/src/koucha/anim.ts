import { Easing, interpolate, spring } from "remotion";

export const FPS = 30;

export const sec = (s: number) => Math.round(s * FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 over [start, start+dur] frames with ease-in-out. */
export const ramp = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

/** Vyond-style overshoot pop-in: 0 before start, springs to 1. */
export const pop = (frame: number, start: number) =>
  frame < start ? 0 : spring({ frame: frame - start, fps: FPS, config: { damping: 11, stiffness: 170, mass: 0.7 } });

/** Pop in at `start`, shrink out at `end` (frames). */
export const popInOut = (frame: number, start: number, end: number) =>
  Math.min(pop(frame, start), 1 - ramp(frame, end, 8));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Interpolate a keyed numeric record, e.g. a pose, across [frame, value] keys. */
export function keyed<T extends Record<string, number>>(frame: number, keys: Array<[number, T]>, dur = 10): T {
  let current = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f, next] = keys[i];
    if (frame < f) break;
    const t = ramp(frame, f, dur);
    current = Object.fromEntries(
      Object.keys(next).map((k) => [k, lerp(current[k] ?? next[k], next[k], t)]),
    ) as T;
  }
  return current;
}

/** Deterministic blink: closes for 4 frames roughly every 3 s, phase-shifted per character. */
export const isBlinking = (frame: number, seed = 0) => {
  const period = 92 + (seed % 3) * 11;
  return (frame + seed * 37) % period < 4;
};
