import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { CORE } from "./core";
import { MILK } from "./milk";
import { CHAI_SCENE } from "./chai";
import { CTC_SCENE } from "./ctc";
import { HISTORY } from "./history";
import { MASALA } from "./masala";
import { NAME } from "./name";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "core": CORE,
  "milk": MILK,
  "chai": CHAI_SCENE,
  "ctc": CTC_SCENE,
  "history": HISTORY,
  "masala": MASALA,
  "name": NAME,
  "outro": OUTRO,
};
