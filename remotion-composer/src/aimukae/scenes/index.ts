import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { AI } from "./ai";
import { STORY } from "./story";
import { REVEAL } from "./reveal";
import { PROMISE } from "./promise";
import { P1 } from "./p1";
import { P2 } from "./p2";
import { P3 } from "./p3";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "ai": AI,
  "story": STORY,
  "reveal": REVEAL,
  "promise": PROMISE,
  "p1": P1,
  "p2": P2,
  "p3": P3,
  "outro": OUTRO,
};
