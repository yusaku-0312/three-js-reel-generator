import { SceneDef2 } from "../types";
import { GUEST_SCENE } from "./guest";
import { HOOK, NAME } from "./opening";
import { OUTRO } from "./outro";
import { TIPS } from "./tips";
import { WHY } from "./why";

export const SCENES2: Record<string, SceneDef2> = {
  hook: HOOK,
  name: NAME,
  why: WHY,
  guest: GUEST_SCENE,
  tips: TIPS,
  outro: OUTRO,
};
