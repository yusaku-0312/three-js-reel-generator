import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/aimukae, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does: steps, the crack, the phone, the glitch of the fake, the van door, pins.
const PROMISE_POPS: Sfx[] = [0, 1, 2].map((i) => ["promise", 0, 3, i * 7, "pop", 0.22, 0.5]);
const MAP_POPS: Sfx[] = [0, 1, 2, 3].map((i) => ["p3", 3, 3, i * 8, "pop", 0.2, 0.5]);

export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "steps", 0.22, 2.5], ["hook", 1, 2, 0, "crack", 0.3, 0.8],
  ["ai", 0, 0, -2, "sparkle", 0.16], ["ai", 0, 3, 0, "sparkle", 0.2],
  ["story", 0, 2, 4, "steps", 0.2, 2.5], ["story", 1, 4, -4, "ring", 0.22, 2.5],
  ["reveal", 0, 1, 0, "glitch", 0.3, 1.2], ["reveal", 0, 2, 0, "glitch", 0.25, 1.2], ["reveal", 0, 2, 2, "pop", 0.3, 0.5],
  ["reveal", 2, 4, -10, "door", 0.3, 1.8],
  ...PROMISE_POPS,
  ["p1", 0, 2, 16, "ding", 0.25], ["p1", 1, 5, 12, "sparkle", 0.2], ["p1", 2, 0, 0, "ring", 0.18, 2.5], ["p1", 3, 5, 0, "pop", 0.25, 0.5],
  ["p2", 0, 6, 0, "pop", 0.2, 0.5], ["p2", 1, 3, 0, "glitch", 0.25, 1.2], ["p2", 2, 2, 0, "dial", 0.22, 2.5], ["p2", 2, 7, 0, "ding", 0.25],
  ["p3", 0, 0, 0, "dial", 0.18, 2.5], ["p3", 2, 3, -6, "chime", 0.22, 1.6],
  ...MAP_POPS,
  ["outro", 1, 3, 0, "sparkle", 0.16], ["outro", 2, 0, 0, "ding", 0.22],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
