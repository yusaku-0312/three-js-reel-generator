import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { FAKE } from "./fake";
import { REAL } from "./real";
import { PLACE } from "./place";
import { ADVICE } from "./advice";
import { CTA } from "./cta";

export const SCENES: Record<string, SceneDefP> = {
  hook: HOOK,
  fake: FAKE,
  real: REAL,
  place: PLACE,
  advice: ADVICE,
  cta: CTA,
};
