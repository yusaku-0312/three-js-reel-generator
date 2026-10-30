import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/chagee, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows the picture: pins land with a pop, pours pour; chips enter silently except the stamp and ？.
export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "clink", 0.25], ["hook", 0, 2, 0, "sparkle", 0.2], ["hook", 1, 0, 6, "pop", 0.3, 0.5], ["hook", 1, 2, 2, "clink", 0.22],
  ["wonyoung", 0, 2, 0, "sparkle", 0.18], ["wonyoung", 0, 3, 0, "pop", 0.3, 0.5], ["wonyoung", 0, 4, 0, "sparkle", 0.16],
  ["menu", 0, 1, -2, "pour", 0.26, 1.2], ["menu", 0, 2, -2, "pour", 0.22, 1.1], ["menu", 1, 0, 4, "pour", 0.2, 0.9], ["menu", 1, 3, 0, "sparkle", 0.2],
  ["size", 0, 0, 4, "pop", 0.18, 0.4], ["size", 0, 0, 14, "pop", 0.16, 0.4], ["size", 0, 0, 26, "pop", 0.16, 0.4], ["size", 0, 1, 2, "pop", 0.2, 0.4],
  ["size", 0, 1, 26, "ding", 0.18], ["size", 1, 3, 4, "pop", 0.3, 0.5], ["size", 1, 3, 10, "sparkle", 0.2],
  ["korea", 0, 1, 4, "pop", 0.32, 0.5], ["korea", 0, 1, 10, "sparkle", 0.18],
  ["japan", 0, 1, 0, "pop", 0.32, 0.5], ["japan", 1, 0, 2, "pop", 0.25, 0.5],
  ["outro", -1, 0, 4, "clink", 0.22], ["outro", 0, 0, 2, "ding", 0.22],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
