import { CupPose } from "../../golden2/three/models";
import { DEFAULT_LIGHTING, Lighting } from "../../royalmilk/three/stage";
import { V3 } from "../core";

// Everything stands on the cafe counter (y 0). 9:16 is narrow, so tins are staggered in depth, not in a row.
export const TIN_S = 0.62;
export const EARL: V3 = [-0.62, 0, 0.05];
export const DARJ: V3 = [0.0, 0, -0.85];
export const ASSAM: V3 = [0.62, 0, 0.05];
export const EB: V3 = [0.0, 0, 0.75];
export const EB_S = 0.8;

/** The hero cup of the blend / milk scenes. */
export const CUP: CupPose = { pos: [0, 0, 0], scale: 1, yaw: Math.PI + 0.5 };
export const CUP_FULL = 0.74;

export const TEA_DARK = "#4e1c08";
/** Milk tea that stays a deep tea brown (the point of the reel: the tea still tastes like tea). */
export const MILK_TEA_DEEP = "#8f5531";

export const morning = (keyAt: V3 = [0, 0.5, 0]): Lighting => ({ ...DEFAULT_LIGHTING, keyAt, key: 3.3, fill: 0.48, front: 0.5 });
