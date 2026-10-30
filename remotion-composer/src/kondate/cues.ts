import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/kondate, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does: the fridge, the shutter, the send, the AI, the cards, the child's hop.
const QMARKS: Sfx[] = [0, 5, 10].map((o) => ["hook", 1, 0, o, "pop", 0.18, 0.5]);
const CARDS: Sfx[] = [0, 7, 14].map((o) => ["step2", 0, 3, o, "pop", 0.22, 0.5]);
const TABLE_CARDS: Sfx[] = [0, 5, 10].map((o) => ["step3", 0, 0, o, "pop", 0.16, 0.5]);

export const SFX: Sfx[] = [
  ["hook", -1, 0, 0, "fridge", 0.14, 1.6],
  ...QMARKS,
  ["intro", 0, 1, -2, "sparkle", 0.18],
  ["step1", 0, 1, -6, "fridge", 0.26, 1.6], ["step1", 0, 2, 18, "shutter", 0.4, 1],
  ["step1", 1, 1, 0, "send", 0.3, 1], ["step1", 1, 1, 14, "sparkle", 0.16],
  ["step2", 0, 2, -4, "sparkle", 0.2], ...CARDS, ["step2", 1, 1, 8, "pop", 0.2, 0.5], ["step2", 1, 3, 0, "ding", 0.22],
  ...TABLE_CARDS, ["step3", 1, 1, 0, "sparkle", 0.22], ["step3", 1, 1, 0, "steps_kid", 0.25, 1.5],
  ["benefit", 0, 3, 0, "sparkle", 0.16], ["benefit", 1, 1, 0, "ding", 0.2],
  ["outro", -1, 0, 2, "fridge", 0.2, 1.6], ["outro", 0, 1, 10, "shutter", 0.35, 1], ["outro", 0, 2, 10, "ding", 0.2],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
