import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/kurenai, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (pours, the window light, marks, leaves); headlines enter silently.
export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "clink", 0.25], ["hook", 0, 2, 6, "sparkle", 0.22], ["hook", 0, 4, 0, "pop", 0.3, 0.5],
  ["name", 0, 1, 18, "pop", 0.25, 0.5], ["name", 0, 2, -2, "pour", 0.28, 1.4], ["name", 0, 3, 0, "ding", 0.22],
  ["color", 0, 2, -4, "pour", 0.28, 1.3], ["color", 0, 3, -2, "ding", 0.25], ["color", 0, 5, 0, "sparkle", 0.22],
  ["chem", 0, 1, -4, "leaves", 0.3], ["chem", 0, 2, -4, "sparkle", 0.25],
  ["english", 0, 1, -4, "leaves", 0.3], ["english", 0, 4, -4, "pop", 0.25, 0.5],
  ["china", 0, 2, 3, "pop", 0.3, 0.5],
  ["outro", 0, 2, -4, "sparkle", 0.22], ["outro", 0, 3, -2, "ding", 0.25],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
