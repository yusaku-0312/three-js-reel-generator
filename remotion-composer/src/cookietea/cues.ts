import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/cookietea, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (bites, the dunk, steam, scent); overlays enter silently except
// the strike, 理由は2つ and the ？.
export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "clink", 0.3], ["hook", 0, 4, 2, "whoosh", 0.25, 0.6], ["hook", 1, 1, 0, "sparkle", 0.2], ["hook", 1, 4, 0, "pop", 0.32, 0.5],
  ["tannin", 0, 2, 0, "sparkle", 0.2], ["tannin", 1, 1, -6, "pop", 0.18, 0.5], ["tannin", 1, 4, 4, "crunch", 0.5, 0.8], ["tannin", 1, 5, 0, "sparkle", 0.14],
  ["shibumi", 0, 1, 0, "sparkle", 0.2], ["shibumi", 1, 1, -4, "breeze", 0.2, 1.8], ["shibumi", 1, 5, 14, "crunch", 0.5, 0.8], ["shibumi", 1, 6, 0, "sparkle", 0.2],
  ["aroma", 0, 1, 0, "sparkle", 0.18], ["aroma", 1, 0, -2, "pop", 0.25, 0.5], ["aroma", 1, 2, 0, "drip", 0.4, 0.8], ["aroma", 1, 3, 0, "breeze", 0.16, 1.6], ["aroma", 1, 4, 0, "pop", 0.25, 0.5],
  ["result", 0, 1, -2, "pop", 0.2, 0.5], ["result", 0, 3, -2, "pop", 0.2, 0.5], ["result", 0, 5, 0, "breeze", 0.2, 1.8], ["result", 0, 9, 0, "sparkle", 0.2],
  ["result", 1, 2, -2, "steam", 0.3, 2.0], ["result", 1, 4, 0, "breeze", 0.2, 1.6],
  ["outro", -1, 0, 4, "clink", 0.25], ["outro", 0, 2, -2, "pop", 0.2, 0.5], ["outro", 0, 4, -2, "pop", 0.2, 0.5], ["outro", 1, 4, 0, "ding", 0.22],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
