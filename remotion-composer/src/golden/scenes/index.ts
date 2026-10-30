import React from "react";
import { Beat, Shot } from "../core";
import { GUEST_SCENE } from "./guest";
import { OUTRO } from "./outro";
import { HOOK, NAME } from "./pour";
import { TIPS } from "./tips";
import { WHY } from "./why";

export type SceneDef = {
  topic: string;
  shot: (b: Beat) => Shot;
  World: React.FC<{ b: Beat }>;
  Overlay?: React.FC<{ b: Beat; shot: Shot }>;
  /** Line indexes inside the scene that start on a new set (wipe + whoosh). */
  setCuts?: number[];
  /** Whether the scene itself opens on a new set. */
  wipeIn?: boolean;
};

export const SCENES: Record<string, SceneDef> = {
  hook: HOOK,
  name: NAME,
  why: WHY,
  guest: GUEST_SCENE,
  tips: TIPS,
  outro: OUTRO,
};
