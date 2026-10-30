import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/teabag, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (stamps, chips, drops, the strike, the pour, the cups lighting up).
export const SFX: Sfx[] = [
  ["hook", -1, 0, 8, "drip", 0.18], ["hook", 0, 1, 0, "stamp", 0.3], ["hook", 1, 1, -2, "pop", 0.25, 0.5], ["hook", 2, 2, -2, "stamp", 0.28], ["hook", 2, 3, -2, "pop", 0.22, 0.5],
  ["why", 0, 2, 10, "drip", 0.22], ["why", 0, 4, -2, "pop", 0.25, 0.5], ["why", 0, 5, -2, "pop", 0.25, 0.5], ["why", 0, 6, -2, "ding", 0.2], ["why", 1, 1, -2, "sparkle", 0.25], ["why", 1, 2, -2, "ding", 0.18],
  ["squeeze", 0, 2, -2, "pop", 0.22, 0.5], ["squeeze", 0, 5, 4, "drip", 0.25], ["squeeze", 0, 6, -2, "ding", 0.18], ["squeeze", 1, 1, -2, "stamp", 0.25],
  ["tannin", 0, 2, -2, "pop", 0.22, 0.5], ["tannin", 0, 4, -2, "clink", 0.25], ["tannin", 1, 0, 6, "drip", 0.22], ["tannin", 1, 2, -2, "ding", 0.18], ["tannin", 2, 3, -2, "stamp", 0.28],
  ["choose", 0, 1, -2, "pop", 0.22, 0.5], ["choose", 0, 4, -2, "pop", 0.22, 0.5], ["choose", 1, 1, -2, "pop", 0.22, 0.5], ["choose", 1, 5, 6, "drip", 0.2], ["choose", 1, 7, -2, "ding", 0.18],
  ["choose", 2, 3, -4, "pour", 0.25, 1.4], ["choose", 2, 4, -2, "pop", 0.22, 0.5], ["choose", 2, 5, -2, "ding", 0.18],
  ["outro", 0, 3, -2, "sparkle", 0.22], ["outro", 1, 2, -2, "pop", 0.25, 0.5], ["outro", 1, 3, -2, "pop", 0.25, 0.5], ["outro", 2, 0, -2, "ding", 0.25],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
