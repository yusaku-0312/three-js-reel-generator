import { SceneDefP } from "../types";
import { FLOWERS } from "./flowers";
import { HOOK } from "./hook";
import { NAME } from "./name";
import { OUTRO } from "./outro";
import { POINTS } from "./points";

export const SCENES: Record<string, SceneDefP> = {
  hook: HOOK,
  name: NAME,
  flowers: FLOWERS,
  points: POINTS,
  outro: OUTRO,
};
