import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { WHY } from "./why";
import { SQUEEZE } from "./squeeze";
import { TANNIN_SCENE } from "./tannin";
import { CHOOSE } from "./choose";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "why": WHY,
  "squeeze": SQUEEZE,
  "tannin": TANNIN_SCENE,
  "choose": CHOOSE,
  "outro": OUTRO,
};
