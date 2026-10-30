import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { TANNIN } from "./tannin";
import { SHIBUMI } from "./shibumi";
import { AROMA } from "./aroma";
import { RESULT } from "./result";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "tannin": TANNIN,
  "shibumi": SHIBUMI,
  "aroma": AROMA,
  "result": RESULT,
  "outro": OUTRO,
};
