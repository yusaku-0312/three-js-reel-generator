import { sec } from "../koucha/anim";
import { TL } from "./core";
import { SCENES } from "./scenes";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** Global frames where the set changes: diagonal wipe + whoosh. */
export const CUTS: number[] = TL.scenes.flatMap((s) => [
  ...(SCENES[s.id].wipeIn ? [sec(s.start)] : []),
  ...(SCENES[s.id].setCuts ?? []).map((li) => sec(s.start) + sec(s.lines[li].start) - 4),
]);

/** [scene, line (-1 = scene start), chunk, frame offset, sfx, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

const POURS: Sfx[] = [-1, 14, 29, 44, 59, 74].map((o) => ["tips", 0, 1, o, "pour", 0.32, 0.45]);

export const SFX: Sfx[] = [
  ["hook", -1, 0, 0, "pour", 0.32, 1.7], ["hook", 0, 1, 10, "pop", 0.4], ["hook", 0, 1, 16, "pop", 0.35],
  ["name", 0, 0, 0, "sparkle", 0.35], ["name", 0, 1, 0, "ding", 0.4], ["name", 0, 1, 43, "drip", 0.85],
  ["name", 0, 1, 50, "sparkle", 0.3], ["name", 1, 1, 0, "pop", 0.4],
  ["why", -1, 0, 4, "pour", 0.18, 2.4], ["why", 0, 1, 0, "pop", 0.3], ["why", 1, 0, 4, "pop", 0.4],
  ["why", 1, 0, 18, "pop", 0.4], ["why", 1, 1, 0, "whoosh", 0.22], ["why", 1, 2, 0, "sparkle", 0.4],
  ["why", 1, 2, 34, "ding", 0.4],
  ["guest", 0, 0, 0, "pop", 0.45], ["guest", 0, 2, 2, "sparkle", 0.4], ["guest", 0, 2, 4, "pop", 0.35],
  ["guest", 0, 3, 25, "drip", 0.85], ["guest", 0, 3, 32, "sparkle", 0.3],
  ["tips", 0, 0, 0, "pop", 0.45], ...POURS, ["tips", 1, 0, 0, "pop", 0.4], ["tips", 1, 2, 0, "sparkle", 0.35],
  ["tips", 2, 0, 0, "pop", 0.45], ["tips", 2, 0, 4, "pour", 0.22, 0.8], ["tips", 2, 0, 40, "sparkle", 0.3],
  ["tips", 2, 1, 17, "drip", 0.85], ["tips", 2, 1, 24, "pop", 0.5],
  ["tips", 3, 0, 0, "pop", 0.4], ["tips", 3, 1, 0, "pop", 0.4], ["tips", 3, 2, 4, "pop", 0.5],
  ["outro", -1, 0, 4, "sparkle", 0.35], ["outro", -1, 0, 78, "ding", 0.45],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
