import { V3 } from "../core";
import { CupPose } from "../../golden2/three/models";
import { BURNER_TOP } from "../three/kitchen";
import { LIQUID } from "../three/liquid";

// One café counter for the whole reel. The two cups stand staggered in depth (9:16 is too narrow for a row).
export const MILK_CUP: CupPose = { pos: [-0.48, 0, 0.5], scale: 0.8, yaw: Math.PI + 0.45 };
export const ROYAL_CUP: CupPose = { pos: [0.5, 0, -0.55], scale: 0.8, yaw: -0.45 };
export const CUP_FILL = 0.78;

/** Finished drinks: blended milk tea (caramel, faint milk arcs) and royal (thick cream). */
export const MILK_DONE = { from: LIQUID.tea, to: LIQUID.milkTea, spread: 1, mix: 0.9 };
export const ROYAL_DONE = { from: LIQUID.royal, to: LIQUID.royal, spread: 0, mix: 1, glow: 0.1 };

export const BURNER: V3 = [0, 0, 0];
export const PAN: V3 = [0, BURNER_TOP, 0];
