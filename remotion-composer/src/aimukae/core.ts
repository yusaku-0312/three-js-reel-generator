import timelineJson from "../../public/aimukae/timeline.json";
import { sec } from "../koucha/anim";
import { SceneT, TimelineT } from "../koucha/types";
import type { Beat } from "../golden/core";

export { add3, clamp01, lerp, lerp3, rng, useGeometry } from "../golden/core";
export type { Beat, V3 } from "../golden/core";

export const TL = timelineJson as TimelineT;
export const AIMUKAE_DURATION = TL.durationInFrames;

export const sceneAt = (frame: number): SceneT =>
  TL.scenes.find((s) => frame < sec(s.end)) ?? TL.scenes[TL.scenes.length - 1];

export const beatFor = (scene: SceneT, frame: number): Beat => ({
  f: frame - sec(scene.start),
  dur: sec(scene.end) - sec(scene.start),
  ln: (i) => sec(scene.lines[i].start),
  ck: (i, j) => sec(scene.lines[i].chunks[j]),
});
