import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/royalmilk, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (pours, leaves, simmer, chalk, flame); overlays enter silently except ≠ and the seal.
export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "clink", 0.3], ["hook", 0, 0, 0, "sparkle", 0.22], ["hook", 0, 3, 2, "pop", 0.32, 0.5],
  ["milk", 0, 0, 8, "pour", 0.28, 2.2], ["milk", 0, 3, -3, "pour", 0.2, 1.2], ["milk", 1, 1, 0, "sparkle", 0.2],
  ["royal", 0, 2, -6, "leaves", 0.45], ["royal", 0, 4, -4, "simmer", 0.3, 4], ["royal", 1, 0, 0, "simmer", 0.22, 4],
  ["royal", 1, 3, -10, "pour", 0.25, 1.4], ["royal", 1, 4, 0, "ding", 0.25],
  ["origin", 0, 0, -2, "chalk", 0.4], ["origin", 0, 1, -2, "pop", 0.25, 0.5], ["origin", 0, 2, 0, "stamp", 0.55],
  ["origin", 1, 2, -2, "chalk", 0.3], ["origin", 1, 3, 0, "pop", 0.3, 0.5], ["origin", 2, 2, -4, "clink", 0.3],
  ["tip", 0, 1, 2, "pour", 0.2, 1], ["tip", 0, 2, -4, "sparkle", 0.22], ["tip", 1, 0, 2, "pour", 0.22, 1.2],
  ["tip", 1, 1, -2, "simmer", 0.3, 2.4], ["tip", 1, 2, -2, "flame_off", 0.4],
  ["outro", 0, 1, -4, "ding", 0.25], ["outro", 0, 2, -4, "clink", 0.25],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
