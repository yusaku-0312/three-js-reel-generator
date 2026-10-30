import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { ANSWER } from "./answer";
import { WHY } from "./why";
import { BLEND } from "./blend";
import { MILK_SCENE as MILK } from "./milk";
import { BREAKFAST } from "./breakfast";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "answer": ANSWER,
  "why": WHY,
  "blend": BLEND,
  "milk": MILK,
  "breakfast": BREAKFAST,
  "outro": OUTRO,
};
