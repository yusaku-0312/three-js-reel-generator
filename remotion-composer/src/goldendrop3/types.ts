import React from "react";
import type { Beat } from "./core";
import { Shot2 } from "../golden2/shot";
import { Lighting } from "../golden2/three/stage";

export type SceneDefP = {
  topic: string;
  shot: (b: Beat) => Shot2;
  World: React.FC<{ b: Beat }>;
  Overlay?: React.FC<{ b: Beat; shot: Shot2 }>;
  light?: (b: Beat) => Lighting;
  /** Bloom strength over the scene (default 0.35). */
  bloom?: (b: Beat) => number;
  /** Enter through a warm-gold dip instead of a straight continuation. */
  dipIn?: boolean;
  /** Narration lines inside the scene that start on a new set through the same dip. */
  dipLines?: number[];
};
