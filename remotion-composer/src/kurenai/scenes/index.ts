import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { NAME } from "./name";
import { COLOR } from "./color";
import { CHEM } from "./chem";
import { ENGLISH } from "./english";
import { CHINA } from "./china";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "name": NAME,
  "color": COLOR,
  "chem": CHEM,
  "english": ENGLISH,
  "china": CHINA,
  "outro": OUTRO,
};
