import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/camerahack, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does: the hijack glitches, the feed alert, the padlock, the AI copies hopping,
// the power going off, the update ring and checks, the switch, the shield knocking the stranger back.
export const SFX: Sfx[] = [
  ["hook", 0, 1, 0, "glitch", 0.25, 1], ["hook", 0, 5, 0, "notify", 0.25, 1], ["hook", 0, 7, 0, "glitch", 0.22, 1],
  ["old", 0, 1, 8, "pop", 0.25, 0.5], ["old", 1, 0, 4, "sparkle", 0.18],
  ["anthropic", 0, 0, 0, "pop", 0.15, 0.5], ["anthropic", 0, 4, 0, "sparkle", 0.16],
  ["anthropic", 0, 5, 2, "pop", 0.16, 0.5], ["anthropic", 0, 6, 0, "pop", 0.16, 0.5], ["anthropic", 0, 7, 0, "pop", 0.16, 0.5],
  ["spread", 0, 1, -8, "sparkle", 0.16], ["spread", 0, 3, 0, "glitch", 0.25, 1],
  ["spread", 0, 4, 4, "pop", 0.16, 0.5], ["spread", 0, 4, 12, "pop", 0.16, 0.5], ["spread", 0, 4, 20, "pop", 0.16, 0.5],
  ["spread", 1, 1, 0, "ding", 0.12, 1],
  ["update", 0, 5, 4, "chime", 0.16], ["update", 0, 6, 0, "ding", 0.18, 1], ["update", 1, 3, 0, "sparkle", 0.18],
  ["update", 2, 0, 4, "pop", 0.18, 0.5], ["update", 2, 2, 0, "pop", 0.18, 0.5],
  ["password", 0, 3, 0, "pop", 0.18, 0.5], ["password", 1, 4, 0, "pop", 0.2, 0.5], ["password", 1, 4, 4, "chime", 0.16],
  ["password", 2, 0, 0, "steps", 0.18, 1.4], ["password", 2, 3, 0, "sparkle", 0.16], ["password", 2, 4, 0, "whoosh", 0.14, 0.8],
  ["cta", 0, 0, 0, "chime", 0.14],
];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
