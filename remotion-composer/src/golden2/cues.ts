import { sec } from "../koucha/anim";
import { TL } from "../golden/core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (pour, drip, glow); overlays enter silently.
const POURS: Sfx[] = [0, 1, 2, 3, 4, 5].map((i) => ["tips", 0, 1, -6 + i * 15 + 5, "pour", 0.24, 0.45]);

export const SFX2: Sfx[] = [
  ["hook", -1, 0, 0, "pour", 0.3, 1.7], ["hook", -1, 0, 57, "drip", 0.35],
  ["name", 0, 0, 0, "sparkle", 0.28], ["name", -1, 0, 94, "drip", 0.9], ["name", -1, 0, 95, "splash", 0.22],
  ["name", -1, 0, 98, "sparkle", 0.3],
  ["why", -1, 0, 4, "pour", 0.2, 2.35], ["why", -1, 0, 60, "pour", 0.14, 1.2], ["why", 1, 0, 6, "sparkle", 0.22],
  ["why", 1, 2, 0, "ding", 0.32],
  ["guest", 0, 2, 0, "sparkle", 0.24], ["guest", 0, 3, 30, "drip", 0.85], ["guest", 0, 3, 32, "sparkle", 0.28],
  ...POURS, ["tips", 1, 0, 0, "ding", 0.28], ["tips", 2, 0, 4, "pour", 0.2, 0.8], ["tips", 2, 1, 24, "drip", 0.85],
  ["tips", 2, 1, 26, "sparkle", 0.28], ["tips", 3, 2, 4, "pop", 0.4],
  ["outro", -1, 0, 4, "sparkle", 0.3], ["outro", -1, 0, 78, "ding", 0.34],
];

/** Soft air under each warm-gold dip, so the set change is heard as well as seen. */
export const dipSfx = (dips: number[]): Array<[number, string, number]> => dips.map((at) => [at - 8, "whoosh", 0.14]);

export const sfxFrame2 = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
