import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/snsyuukai, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does: the shutter and post, copies flying to strangers, the fake being made,
// the message and the call arriving, the stamp, each clue ringed, the threads and the pin, the envelope sealed,
// the leak, the posts switched to private.
export const SFX: Sfx[] = [
  ["hook", 0, 2, 0, "shutter", 0.2, 0.8], ["hook", 0, 1, 2, "pop", 0.16, 0.5],
  ["hook", 1, 3, 0, "pop", 0.16, 0.5], ["hook", 1, 3, 5, "pop", 0.16, 0.5], ["hook", 1, 3, 10, "pop", 0.16, 0.5],
  ["hook", 2, 2, 0, "sparkle", 0.16], ["hook", 2, 4, 0, "glitch", 0.2, 1],
  ["fake", 0, 6, 0, "notify", 0.25, 1], ["fake", 1, 0, 6, "glitch", 0.2, 1], ["fake", 1, 2, 0, "ring", 0.16, 1.6],
  ["fake", 1, 6, 0, "ding", 0.1, 1],
  ["real", 0, 2, 0, "glitch", 0.2, 1], ["real", 0, 6, 0, "pop", 0.18, 0.5], ["real", 0, 8, 0, "ding", 0.16, 1],
  ["place", 0, 4, 0, "pop", 0.16, 0.5],
  ["place", 1, 1, 0, "pop", 0.15, 0.5], ["place", 1, 2, 0, "pop", 0.15, 0.5], ["place", 1, 3, 0, "pop", 0.15, 0.5], ["place", 1, 4, 0, "pop", 0.15, 0.5],
  ["place", 2, 4, 6, "pop", 0.14, 0.5], ["place", 2, 4, 11, "pop", 0.14, 0.5], ["place", 2, 4, 16, "pop", 0.14, 0.5], ["place", 2, 6, 0, "ding", 0.14, 1],
  ["advice", 0, 5, 14, "pop", 0.18, 0.5], ["advice", 0, 6, 0, "chime", 0.16],
  ["advice", 1, 2, 0, "whoosh", 0.12, 0.8],
  ["advice", 2, 6, 0, "pop", 0.16, 0.5], ["advice", 2, 6, 10, "pop", 0.16, 0.5], ["advice", 2, 6, 20, "chime", 0.16],
  ["cta", 0, 0, 0, "chime", 0.14],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
