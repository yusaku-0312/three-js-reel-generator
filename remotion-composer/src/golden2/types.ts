import React from "react";
import { Beat } from "../golden/core";
import { Shot2 } from "./shot";
import { Lighting } from "./three/stage";

export type SceneDef2 = {
  topic: string;
  shot: (b: Beat) => Shot2;
  World: React.FC<{ b: Beat }>;
  Overlay?: React.FC<{ b: Beat; shot: Shot2 }>;
  light?: (b: Beat) => Lighting;
  /** Bloom strength over the scene (default 0.6). */
  bloom?: (b: Beat) => number;
  /** Enter through a warm-gold dip (motivated by the glowing drop) instead of a straight continuation. */
  dipIn?: boolean;
  /** Narration lines inside the scene that start on a new set through the same dip. */
  dipLines?: number[];
};
