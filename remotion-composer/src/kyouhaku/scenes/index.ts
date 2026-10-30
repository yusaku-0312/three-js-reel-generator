import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { FAKE } from "./fake";
import { FEAR } from "./fear";
import { INTRO } from "./intro";
import { RULE1 } from "./rule1";
import { RULE2 } from "./rule2";
import { RULE3 } from "./rule3";
import { RULE4 } from "./rule4";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "fake": FAKE,
  "fear": FEAR,
  "intro": INTRO,
  "rule1": RULE1,
  "rule2": RULE2,
  "rule3": RULE3,
  "rule4": RULE4,
  "outro": OUTRO,
};
