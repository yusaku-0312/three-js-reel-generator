import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { LATTE } from "./latte";
import { MILK } from "./milk";
import { TEALATTE } from "./tealatte";
import { RATIO } from "./ratio";
import { TASTE } from "./taste";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "latte": LATTE,
  "milk": MILK,
  "tealatte": TEALATTE,
  "ratio": RATIO,
  "taste": TASTE,
  "outro": OUTRO,
};
