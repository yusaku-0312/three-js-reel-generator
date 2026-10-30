import React from "react";
import type { Beat } from "./core";
import { Shot2 } from "../golden2/shot";
import { Lighting } from "./three/stage";
import { TownState } from "./three/town";

/** Grade beats on top of the base look: colour drain, synthetic-voice glitch, red danger wash. */
export type Grade = { desat?: number; glitch?: number; danger?: number };

export type SceneDefP = {
  topic: string;
  shot: (b: Beat) => Shot2;
  World: React.FC<{ b: Beat }>;
  Overlay?: React.FC<{ b: Beat; shot: Shot2 }>;
  /** Which set (town / lab) and how it is lit at this beat. */
  light: (b: Beat) => Lighting;
  town?: (b: Beat) => TownState;
  grade?: (b: Beat) => Grade;
  /** Bloom strength over the scene (default 0.35). */
  bloom?: (b: Beat) => number;
  /** Enter through a light dip (sunset colour into the town, blue into the lab). */
  dipIn?: boolean;
  /** Narration lines inside the scene that start on a new set through the same dip. */
  dipLines?: number[];
};
