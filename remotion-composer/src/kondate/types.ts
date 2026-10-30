import React from "react";
import type { Beat } from "./core";
import { Shot2 } from "../golden2/shot";
import { KitchenLight, KitchenState } from "./three/kitchen";

export type SceneDefP = {
  topic: string;
  shot: (b: Beat) => Shot2;
  World: React.FC<{ b: Beat }>;
  Overlay?: React.FC<{ b: Beat; shot: Shot2 }>;
  light?: (b: Beat) => KitchenLight;
  kitchen?: (b: Beat) => KitchenState;
  /** Bloom strength over the scene (default 0.35). */
  bloom?: (b: Beat) => number;
  /** 0..1 white camera-shutter flash. */
  shutter?: (b: Beat) => number;
  /** Enter through a warm light dip instead of a straight continuation. */
  dipIn?: boolean;
  /** Narration lines inside the scene that start on a new framing through the same dip. */
  dipLines?: number[];
};
