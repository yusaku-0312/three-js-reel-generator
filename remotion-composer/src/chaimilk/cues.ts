import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/chaimilk, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (pours, leaves, simmer, drops, pins); overlays enter silently except ✕ and the seal.
export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "clink", 0.3], ["hook", 0, 2, 0, "pop", 0.3, 0.5], ["hook", 0, 3, 0, "stamp", 0.4], ["hook", 1, 2, 0, "sparkle", 0.22],
  ["core", 0, 2, 0, "ding", 0.25],
  ["milk", 0, 1, -2, "pour", 0.28, 1.6], ["milk", 0, 3, -2, "pour", 0.2, 1.2],
  ["chai", 0, 1, -6, "leaves", 0.45], ["chai", 0, 3, -6, "simmer", 0.3, 4], ["chai", 1, 2, 0, "ding", 0.25],
  ["ctc", 0, 2, 0, "sparkle", 0.22], ["ctc", 1, 0, 6, "drip", 0.3],
  ["history", 0, 2, -2, "pop", 0.3, 0.5], ["history", 1, 0, 0, "sparkle", 0.2], ["history", 1, 1, 0, "whoosh", 0.2, 0.8], ["history", 1, 3, 0, "sparkle", 0.2],
  ["masala", -1, 0, 0, "simmer", 0.22, 6.5],
  ["masala", 0, 0, 6, "drip", 0.3], ["masala", 0, 1, 6, "drip", 0.3], ["masala", 0, 2, 6, "drip", 0.3], ["masala", 0, 2, 14, "drip", 0.3],
  ["name", 0, 0, -4, "pop", 0.3, 0.5], ["name", 1, 0, -4, "pop", 0.3, 0.5], ["name", 1, 1, 10, "pop", 0.3, 0.5], ["name", 2, 0, 12, "pop", 0.3, 0.5],
  ["name", 2, 1, 0, "stamp", 0.5],
  ["outro", 1, 0, -4, "ding", 0.25], ["outro", 1, 0, 10, "sparkle", 0.2],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
