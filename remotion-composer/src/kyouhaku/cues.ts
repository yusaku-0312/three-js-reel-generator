import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/kyouhaku, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does: the buzzing phone, the messages, the fake being made, the door, the
// coins and photo sent, the screenshot, the chips.
export const SFX: Sfx[] = [
  ["hook", -1, 0, 0, "buzz", 0.35, 1.5], ["hook", 0, 3, 0, "buzz", 0.25, 1.5],
  ["hook", 1, 2, 0, "notify", 0.3, 1], ["hook", 2, 0, -2, "notify", 0.35, 1],
  ["fake", 1, 2, 4, "whoosh", 0.12, 0.8], ["fake", 1, 3, 0, "glitch", 0.25, 1], ["fake", 1, 4, 0, "pop", 0.25, 0.5],
  ["intro", -1, 0, 0, "door", 0.3, 1.5],
  ["rule1", 0, 1, 0, "coins", 0.3, 1], ["rule1", 0, 2, 0, "send", 0.25, 1], ["rule1", 0, 4, 0, "notify", 0.3, 1],
  ["rule1", 1, 0, 0, "steps", 0.2, 1.4], ["rule1", 2, 2, 0, "pop", 0.2, 0.5],
  ["rule2", 0, 2, 0, "chime", 0.18], ["rule2", 1, 2, 0, "chime", 0.2],
  ["rule3", 0, 2, 0, "shutter", 0.35, 1], ["rule3", 0, 3, 0, "pop", 0.18, 0.5], ["rule3", 0, 5, 0, "pop", 0.18, 0.5],
  ["rule3", 0, 6, 0, "pop", 0.18, 0.5], ["rule3", 1, 3, 0, "pop", 0.22, 0.5],
  ["rule4", 0, 3, 0, "pop", 0.2, 0.5], ["rule4", 1, 1, 0, "whoosh", 0.1, 0.8], ["rule4", 1, 5, 0, "chime", 0.18],
  ["outro", 1, 0, 0, "chime", 0.16],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
