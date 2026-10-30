import { V3 } from "../core";
import { CupPose } from "../../golden2/three/models";
import { LIQUID } from "../../royalmilk/three/liquid";
import { LatteContents, LattePose } from "../three/latte";

// One café counter for the whole reel. The low cup (front left) and the tall glass (back right) stand
// staggered in depth: 9:16 is too narrow for a row, and the two silhouettes tell the drinks apart.
export const MILK_CUP: CupPose = { pos: [-0.5, 0, 0.5], scale: 0.8, yaw: Math.PI + 0.45 };
export const LATTE_GLASS: LattePose = { pos: [0.48, 0, -0.5], scale: 0.85, yaw: -0.5 };
export const CUP_FILL = 0.78;

export const COLOR = {
  tea: LIQUID.tea,
  strongTea: "#4a1c06",
  milk: LIQUID.milk,
  milkTea: LIQUID.milkTea,
  latteLow: "#93603a",
  latteHigh: "#d3ab7e",
};

/** Finished drinks: milk tea = caramel with faint milk arcs; latte = blended column + thick foam dome. */
export const MILK_DONE = { from: LIQUID.tea, to: LIQUID.milkTea, spread: 1, mix: 0.9 };
export const LATTE_DONE: LatteContents = { level: 0.74, bottom: COLOR.latteLow, top: COLOR.latteHigh, edge: 0.5, soft: 1, foam: 0.16, dome: 0.8 };

export const MID: V3 = [0, 0.6, 0];
