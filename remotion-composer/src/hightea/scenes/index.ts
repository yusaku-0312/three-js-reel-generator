import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { CORE } from "./core";
import { HISTORY } from "./history";
import { JAPAN } from "./japan";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "core": CORE,
  "history": HISTORY,
  "japan": JAPAN,
  "outro": OUTRO,
};
