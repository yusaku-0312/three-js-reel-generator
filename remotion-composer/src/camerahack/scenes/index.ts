import { SceneDefP } from "../types";
import { HOOK } from "./hook";
import { OLD } from "./old";
import { ANTHROPIC } from "./anthropic";
import { SPREAD } from "./spread";
import { UPDATE } from "./update";
import { PASSWORD } from "./password";
import { CTA } from "./cta";

export const SCENES: Record<string, SceneDefP> = {
  "hook": HOOK,
  "old": OLD,
  "anthropic": ANTHROPIC,
  "spread": SPREAD,
  "update": UPDATE,
  "password": PASSWORD,
  "cta": CTA,
};
