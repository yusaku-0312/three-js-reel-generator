import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/chatkondate, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does: the fridge, the shutter, the send, the cards, the refusals, the typing.
const pops = (id: string, line: number, chunk: number, offsets: number[], vol = 0.18): Sfx[] =>
  offsets.map((o) => [id, line, chunk, o, "pop", vol, 0.5]);

export const SFX: Sfx[] = [
  ["intro", -1, 0, 0, "fridge", 0.24, 1.6], ["intro", -1, 0, 26, "shutter", 0.4, 1],
  ["intro", 0, 1, 4, "send", 0.3, 1], ["intro", 0, 2, 0, "sparkle", 0.16], ...pops("intro", 0, 3, [0, 7, 14], 0.2),
  ["ask", 0, 0, 0, "typing", 0.2, 1], ["ask", 0, 2, 0, "send", 0.28, 1], ["ask", 1, 0, -2, "send", 0.2, 1],
  ...pops("choose", 0, 0, [0, 5, 10], 0.16), ["choose", 0, 4, 0, "sparkle", 0.2],
  ["problem", -1, 0, 0, "fridge", 0.12, 1.6], ["problem", 0, 2, -2, "pop", 0.2, 0.5], ["problem", 0, 4, 0, "ng", 0.24, 0.8],
  ["problem", 1, 2, 0, "twitch", 0.26, 0.8],
  ["why", 0, 0, -2, "pop", 0.18, 0.5], ["why", 0, 1, 6, "ng", 0.2, 0.8], ["why", 0, 2, -6, "pop", 0.18, 0.5],
  ["why", 0, 2, 12, "ng", 0.2, 0.8], ["why", 0, 3, -2, "pop", 0.16, 0.5], ["why", 0, 4, -2, "sparkle", 0.18],
  ...pops("why", 0, 5, [0, 4, 8], 0.2), ["why", 0, 6, 0, "ding", 0.18],
  ...[0, 1, 2, 3].map((c): Sfx => ["conditions", 0, c, -2, "pop", 0.18, 0.5]), ["conditions", 0, 5, 6, "send", 0.24, 1],
  ["conditions", 0, 6, 0, "ding", 0.2],
  ["tips", 0, 1, 0, "pop", 0.16, 0.5], ["tips", 0, 2, 0, "typing", 0.2, 1], ["tips", 0, 3, 0, "typing", 0.2, 1],
  ["tips", 1, 1, 0, "ng", 0.18, 0.8], ["tips", 1, 2, -2, "send", 0.22, 1], ["tips", 1, 4, 0, "ding", 0.2],
  ...pops("summary", 0, 0, [0, 5, 10], 0.14), ["summary", 0, 2, -8, "steps_kid", 0.22, 1.5], ["summary", 0, 3, 0, "sparkle", 0.18],
  ["summary", 1, 3, 0, "sparkle", 0.18], ["summary", 1, 4, 0, "ding", 0.2],
  ["cta", -1, 0, 6, "mug", 0.22, 0.8], ["cta", 0, 3, 8, "ding", 0.2],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
