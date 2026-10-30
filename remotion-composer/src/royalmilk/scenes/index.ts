import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { MILK } from "./milk";
import { ROYAL } from "./royal";
import { ORIGIN } from "./origin";
import { TIP } from "./tip";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "milk": MILK,
  "royal": ROYAL,
  "origin": ORIGIN,
  "tip": TIP,
  "outro": OUTRO,
};
