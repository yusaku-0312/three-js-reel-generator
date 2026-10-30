import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { TALK } from "./talk";
import { HACK } from "./hack";
import { VOICE } from "./voice";
import { EXAMPLE } from "./example";
import { PROMISE } from "./promise";
import { RULE } from "./rule";
import { PARENT } from "./parent";
import { CTA } from "./cta";

export const SCENES: Record<string, SceneDefP> = {
  hook: HOOK,
  talk: TALK,
  hack: HACK,
  voice: VOICE,
  example: EXAMPLE,
  promise: PROMISE,
  rule: RULE,
  parent: PARENT,
  cta: CTA,
};
