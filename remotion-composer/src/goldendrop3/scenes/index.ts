import { SceneDefP } from "../types";
import { GUEST_SCENE } from "./guest";
import { KYUSU } from "./kyusu";
import { ANSWER, HOOK } from "./opening";
import { OUTRO } from "./outro";
import { POUR } from "./pour";
import { WHY } from "./why";

export const SCENES: Record<string, SceneDefP> = {
  hook: HOOK,
  answer: ANSWER,
  why: WHY,
  kyusu: KYUSU,
  guest: GUEST_SCENE,
  pour: POUR,
  outro: OUTRO,
};
