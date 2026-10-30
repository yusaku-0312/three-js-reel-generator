import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { WONYOUNG } from "./wonyoung";
import { MENU } from "./menu";
import { SIZE } from "./size";
import { KOREA } from "./korea";
import { JAPAN } from "./japan";
import { OUTRO } from "./outro";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "wonyoung": WONYOUNG,
  "menu": MENU,
  "size": SIZE,
  "korea": KOREA,
  "japan": JAPAN,
  "outro": OUTRO,
};
