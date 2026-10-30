import { SceneDefP } from "../types";
import { INTRO } from "./intro";
import { ASK } from "./ask";
import { CHOOSE } from "./choose";
import { PROBLEM } from "./problem";
import { WHY } from "./why";
import { CONDITIONS } from "./conditions";
import { TIPS } from "./tips";
import { SUMMARY } from "./summary";
import { CTA } from "./cta";

export const SCENES: Record<string, SceneDefP> = {
  intro: INTRO,
  ask: ASK,
  choose: CHOOSE,
  problem: PROBLEM,
  why: WHY,
  conditions: CONDITIONS,
  tips: TIPS,
  summary: SUMMARY,
  cta: CTA,
};
