import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (ice, pour, petals, glints); overlays enter silently except the stamp.
const FRUIT_POPS: Sfx[] = [0, 1, 2, 3, 4].map((i) => ["hook", 1, 1, i * 5 + 10, "pop", 0.22, 0.5]);

export const SFX: Sfx[] = [
  ["hook", -1, 0, 4, "ice", 0.32], ["hook", 0, 1, -4, "breeze", 0.16, 2.4], ["hook", 1, 0, 0, "sparkle", 0.2],
  ...FRUIT_POPS, ["hook", 1, 2, 0, "ding", 0.3],
  ["name", 0, 1, -2, "sparkle", 0.3], ["name", 1, 1, 2, "pour", 0.3, 2.9], ["name", 1, 3, 0, "ding", 0.22],
  ["flowers", 0, 1, -4, "breeze", 0.14, 2.4],
  ["flowers", 1, 0, -4, "sparkle", 0.22], ["flowers", 1, 1, 2, "sparkle", 0.22], ["flowers", 1, 3, -4, "sparkle", 0.22],
  ["flowers", 1, 4, -4, "sparkle", 0.22],
  ["flowers", 2, 0, -4, "breeze", 0.3, 2.4], ["flowers", 2, 2, -4, "sparkle", 0.3],
  ["points", 0, 1, -4, "pop", 0.3, 0.5], ["points", 0, 2, 0, "ding", 0.26],
  ["points", 1, 0, -2, "ice", 0.38], ["points", 1, 2, 0, "pour", 0.16, 1.2],
  ["outro", 0, 1, -4, "breeze", 0.2, 2.4], ["outro", 0, 2, 0, "ding", 0.3],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
