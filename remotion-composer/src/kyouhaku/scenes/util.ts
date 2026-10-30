import { ScreenKind } from "../three/textures";
import { ease, EASE } from "../../golden2/shot";

/** Phone screen at frame f from [frame, kind] steps: the latest step cross-fades in over 8 frames. */
export const screenAt = (f: number, steps: Array<[number, ScreenKind]>) => {
  let i = 0;
  while (i + 1 < steps.length && f >= steps[i + 1][0]) i++;
  const prev = i > 0 ? steps[i - 1][1] : steps[0][1];
  const mix = i > 0 ? ease(f, steps[i][0], 8, EASE.inOut) : 1;
  return mix >= 1 ? { screen: steps[i][1] } : { screen: prev, next: steps[i][1], mix };
};

/** A head shake (no) over `dur` frames from `at`: yaw swinging and settling. */
export const shake = (f: number, at: number, dur = 26, amount = 0.45) => {
  const t = f - at;
  if (t < 0 || t > dur) return 0;
  return Math.sin((t / dur) * Math.PI * 4) * amount * (1 - t / dur);
};

/** Visible from `at` (fade in) until `out` (fade out). */
export const span = (f: number, at: number, out?: number, inDur = 8, outDur = 8) =>
  Math.min(ease(f, at, inDur, EASE.out), out === undefined ? 1 : 1 - ease(f, out, outDur, EASE.in));
