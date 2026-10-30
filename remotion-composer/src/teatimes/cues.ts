import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/teatimes, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (menu rows, food popping in, tiers lighting, pours, the ✕ stamp).
export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "clink", 0.3], ["hook", 0, 1, 0, "pop", 0.25, 0.5], ["hook", 0, 3, 0, "pop", 0.25, 0.5], ["hook", 1, 1, 0, "sparkle", 0.22],
  ["core", 0, 1, 0, "ding", 0.2], ["core", 0, 2, 0, "ding", 0.22],
  ["afternoon", 0, 4, 0, "sparkle", 0.18],
  ["afternoon", 1, 2, -2, "pop", 0.3, 0.5], ["afternoon", 1, 3, -2, "pop", 0.3, 0.5], ["afternoon", 1, 4, -2, "pop", 0.3, 0.5],
  ["afternoon", 2, 1, 0, "ding", 0.2], ["afternoon", 2, 2, 0, "ding", 0.22],
  ["hightea", 0, 3, 0, "ding", 0.2],
  ["hightea", 1, 2, -2, "pop", 0.3, 0.5], ["hightea", 1, 3, -2, "pop", 0.3, 0.5], ["hightea", 1, 3, 3, "pop", 0.3, 0.5], ["hightea", 1, 4, -4, "pour", 0.25, 1.4],
  ["abroad", 0, 3, 0, "sparkle", 0.22], ["abroad", 1, 1, 6, "stamp", 0.4], ["abroad", 1, 2, 0, "ding", 0.22],
  ["outro", 1, 0, 0, "ding", 0.25],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
