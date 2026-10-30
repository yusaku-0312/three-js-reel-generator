import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/mimamorikoe, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows the picture: the camera's voice, the talk button, the hijack glitch and the red voice line, the
// voice copy, the thumb-turn clicking open, the call, the checks and the switch.
export const SFX: Sfx[] = [
  ["hook", 0, 3, 0, "notify", 0.2, 1], ["hook", 0, 4, 0, "pop", 0.18, 0.5],
  ["talk", 0, 3, 6, "pop", 0.2, 0.5], ["talk", 0, 4, 8, "whoosh", 0.1, 0.8],
  ["hack", 0, 2, 0, "glitch", 0.25, 1], ["hack", 0, 4, 0, "whoosh", 0.12, 0.8], ["hack", 0, 5, 0, "steps", 0.14, 1.2],
  ["voice", 0, 1, 0, "sparkle", 0.16], ["voice", 0, 2, 0, "glitch", 0.14, 0.8], ["voice", 1, 2, 0, "sparkle", 0.16],
  ["example", 0, 3, 0, "pop", 0.16, 0.5], ["example", 1, 5, 0, "door", 0.22, 1.2],
  ["promise", 0, 6, 0, "chime", 0.15], ["promise", 0, 8, 0, "ding", 0.18, 1], ["promise", 0, 9, 8, "sparkle", 0.14],
  ["rule", 0, 3, 0, "ding", 0.18, 1], ["rule", 1, 5, 0, "pop", 0.18, 0.5],
  ["parent", 0, 2, 4, "chime", 0.16], ["parent", 0, 4, 4, "ding", 0.18, 1],
  ["parent", 1, 2, 0, "pop", 0.18, 0.5], ["parent", 1, 8, 4, "pop", 0.2, 0.5], ["parent", 1, 8, 8, "chime", 0.16],
  ["cta", 0, 0, 0, "chime", 0.14],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
