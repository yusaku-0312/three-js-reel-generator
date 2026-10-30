import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/englishbreakfast, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (tins named, the hero tin, poll bars, leaves, the pour, food popping).
export const SFX: Sfx[] = [
  ["hook", 0, 4, -4, "clink", 0.3], ["hook", 1, 0, 0, "pop", 0.25, 0.5], ["hook", 1, 1, 0, "pop", 0.25, 0.5], ["hook", 1, 3, 0, "pop", 0.25, 0.5],
  ["answer", 0, 3, 0, "sparkle", 0.25], ["answer", 1, 1, 0, "ding", 0.2], ["answer", 1, 4, 0, "ding", 0.18], ["answer", 1, 6, 0, "sparkle", 0.2],
  ["why", 0, 1, -2, "ding", 0.2],
  ["blend", 0, 2, -2, "pop", 0.25, 0.5], ["blend", 0, 3, -2, "pop", 0.25, 0.5], ["blend", 0, 4, 0, "drip", 0.25], ["blend", 0, 6, -3, "sparkle", 0.22],
  ["blend", 1, 0, -2, "ding", 0.18],
  ["milk", 0, 0, 0, "pour", 0.25, 1.4], ["milk", 0, 3, -2, "ding", 0.18], ["milk", 1, 6, -2, "ding", 0.22],
  ["breakfast", 1, 0, -2, "pop", 0.3, 0.5], ["breakfast", 1, 0, 12, "pop", 0.3, 0.5], ["breakfast", 1, 2, -2, "ding", 0.2],
  ["outro", 0, 3, -2, "ding", 0.22], ["outro", 1, 1, 0, "sparkle", 0.2], ["outro", 2, 0, -2, "ding", 0.25],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
