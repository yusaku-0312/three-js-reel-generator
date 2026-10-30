import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/goldendrop3, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does (pour, drip, glow); overlays enter silently.
const TURNS: Sfx[] = [0, 1, 2, 3, 4, 5].map((i) => ["pour", 0, 1, -6 + i * 13 + 4, "pour", 0.22, 0.4]);

export const SFX: Sfx[] = [
  ["hook", -1, 0, 0, "pour", 0.28, 6.9], ["hook", 1, 1, 12, "drip", 0.3], ["hook", 1, 1, 19, "drip", 0.25],
  ["answer", 0, 0, 4, "sparkle", 0.26], ["answer", 0, 2, 42, "drip", 0.9], ["answer", 0, 2, 43, "splash", 0.22],
  ["answer", 0, 2, 46, "sparkle", 0.3], ["answer", 0, 3, 0, "ding", 0.26],
  ["why", 1, 0, 22, "pour", 0.2, 5.6], ["why", 2, 2, 0, "sparkle", 0.26], ["why", 2, 2, 8, "ding", 0.3],
  ["kyusu", -1, 0, 0, "pour", 0.22, 2.6], ["kyusu", 0, 2, 16, "drip", 0.8], ["kyusu", 0, 2, 18, "sparkle", 0.24],
  ["guest", 0, 2, 0, "sparkle", 0.24], ["guest", 0, 4, 30, "drip", 0.85], ["guest", 0, 4, 32, "sparkle", 0.28],
  ...TURNS, ["pour", 0, 3, 0, "ding", 0.26], ["pour", 1, 0, 4, "pour", 0.2, 0.8], ["pour", 1, 1, 24, "drip", 0.85],
  ["pour", 1, 1, 26, "sparkle", 0.28],
  ["outro", 0, 1, 0, "sparkle", 0.26], ["outro", 0, 3, 22, "ding", 0.32],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
