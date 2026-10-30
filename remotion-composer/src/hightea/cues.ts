import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/hightea, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (food popping in, pours, the ✕ stamps); headlines enter silently.
export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "clink", 0.3], ["hook", 0, 3, 0, "sparkle", 0.22], ["hook", 1, 1, 0, "pop", 0.28, 0.5], ["hook", 1, 1, 5, "pop", 0.28, 0.5], ["hook", 1, 2, 0, "pop", 0.3, 0.5],
  ["core", 0, 1, 6, "stamp", 0.4], ["core", 0, 2, 0, "whoosh", 0.15, 0.8], ["core", 1, 2, -4, "pop", 0.28, 0.5], ["core", 1, 2, 0, "pop", 0.28, 0.5], ["core", 1, 2, 4, "pop", 0.28, 0.5],
  ["history", 1, 3, -2, "pop", 0.3, 0.5], ["history", 1, 5, 0, "sparkle", 0.2],
  ["history", 2, 5, -2, "pop", 0.3, 0.5], ["history", 2, 6, -2, "pop", 0.3, 0.5], ["history", 2, 7, -4, "pour", 0.25, 1.4],
  ["history", 3, 0, 6, "stamp", 0.4], ["history", 3, 1, 0, "ding", 0.25],
  ["japan", 2, 1, -2, "pop", 0.3, 0.5], ["japan", 2, 3, -2, "pop", 0.3, 0.5], ["japan", 2, 3, 2, "sparkle", 0.2], ["japan", 3, 2, 0, "ding", 0.22],
  ["japan", 5, 2, -2, "pop", 0.3, 0.5], ["japan", 5, 2, 4, "pop", 0.3, 0.5], ["japan", 5, 4, -4, "pour", 0.25, 1.4],
  ["outro", 0, 0, 0, "ding", 0.25],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
