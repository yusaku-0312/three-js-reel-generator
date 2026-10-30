import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { INTRO } from "./intro";
import { STEP1 } from "./step1";
import { STEP2 } from "./step2";
import { STEP3 } from "./step3";
import { BENEFIT } from "./benefit";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "intro": INTRO,
  "step1": STEP1,
  "step2": STEP2,
  "step3": STEP3,
  "benefit": BENEFIT,
  "outro": OUTRO,
};
