import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/milktealatte, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (pours, steam, foam); overlays enter silently except ？, the flag and 1 : 1.
export const SFX: Sfx[] = [
  ["hook", -1, 0, 2, "clink", 0.3], ["hook", 0, 1, 0, "sparkle", 0.2], ["hook", 0, 2, 2, "pop", 0.32, 0.5],
  ["latte", 0, 1, -2, "pop", 0.25, 0.5], ["latte", 0, 2, 0, "sparkle", 0.2],
  ["milk", 0, 1, -4, "pour", 0.28, 1.2], ["milk", 0, 3, -3, "pour", 0.16, 0.6], ["milk", 1, 1, 0, "sparkle", 0.2],
  ["tealatte", 0, 2, -2, "pour", 0.26, 1.1], ["tealatte", 0, 3, -4, "steam", 0.4, 2.2], ["tealatte", 0, 4, 6, "pour", 0.26, 1.8],
  ["tealatte", 1, 1, -2, "foam", 0.45, 0.8], ["tealatte", 1, 2, 0, "sparkle", 0.2],
  ["ratio", 0, 1, 4, "pop", 0.25, 0.5], ["ratio", 0, 2, 0, "pop", 0.32, 0.5],
  ["taste", 0, 0, 0, "sparkle", 0.18], ["taste", 0, 2, 0, "sparkle", 0.2],
  ["outro", -1, 0, 4, "clink", 0.25], ["outro", 0, 0, 2, "ding", 0.22],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
