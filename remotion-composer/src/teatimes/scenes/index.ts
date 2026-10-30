import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { CORE } from "./core";
import { AFTERNOON_SCENE } from "./afternoon";
import { HIGHTEA } from "./hightea";
import { ABROAD } from "./abroad";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "core": CORE,
  "afternoon": AFTERNOON_SCENE,
  "hightea": HIGHTEA,
  "abroad": ABROAD,
  "outro": OUTRO,
};
