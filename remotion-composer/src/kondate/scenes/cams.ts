import { V3 } from "../core";
import { Shot2 } from "../../golden2/shot";

/**
 * Fitted framings (scratch proj.py: projected into x 190-890 / y 540-1400 at fov 30). The hero framing puts
 * floating props in front of the kitchen at about 500 px per unit; world y 1.3 at HERO z is screen centre.
 */
export const PARENT_AT: V3 = [-0.6, 0, -1.75];
export const KID_AT: V3 = [0.55, 0, -0.35];
export const HOOK_CAM: Shot2 = { pos: [-0.05, 4.77, 6.75], target: [-0.05, 0.8, -1.05], fov: 30, focus: [0, 0.8, -1.05], aperture: 3 };

export const HERO: V3 = [0, 1.3, 0.9];
export const HERO_CAM: Shot2 = { pos: [0, 1.5, 8.1], target: HERO, fov: 30, focus: HERO, aperture: 22 };

export const FRIDGE_CAM: Shot2 = { pos: [-0.95, 1.31, 4.74], target: [-0.95, 0.93, -2.5], fov: 30, focus: [-0.95, 0.95, -2.6], aperture: 1.5 };

export const T_PARENT: V3 = [-0.25, 0, -0.95];
export const T_KID: V3 = [1.3, 0, -0.5];
export const TABLE_CAM: Shot2 = { pos: [1.844, 2.986, 6.587], target: [0.55, 0.85, -0.75], fov: 30, focus: [0.55, 1.0, -0.75], aperture: 2 };

export const PLATE: V3 = [0.8, 0.65, -0.65];
export const B_KID: V3 = [1.25, 0, -0.35];
export const PLATE_CAM: Shot2 = { pos: [1.579, 4.75, 6.638], target: [0.95, 0.75, -0.55], fov: 30, focus: [0.95, 0.75, -0.55], aperture: 2.5 };

/** Same framing pushed `k` of the way toward its target (a dolly, not a zoom). */
export const dolly = (s: Shot2, k: number): Shot2 => ({
  ...s,
  pos: [s.pos[0] + (s.target[0] - s.pos[0]) * k, s.pos[1] + (s.target[1] - s.pos[1]) * k, s.pos[2] + (s.target[2] - s.pos[2]) * k],
});
