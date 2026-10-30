import { V3 } from "../core";
import { Shot2 } from "../../golden2/shot";
import { lensOf } from "../three/devices";

export { dolly, HERO, HERO_CAM } from "../../kyouhaku/scenes/cams";

/**
 * Fitted framings (scratch proj.py: key points projected into x 170-910 / y 560-1380 at fov 30). The room is
 * the bedroom of src/kyouhaku: back wall z -3.2, bed x 0..1.9 with the pillow at the right end, door at x -0.8.
 */

/** Small wall shelf left of the bed with the monitor camera on it, aimed down at the sleeping child. */
export const SHELF: V3 = [-0.15, 1.35, -3.09];
export const CAM_AT: V3 = [-0.15, 1.365, -3.08];
export const CAM_S = 0.85;
export const CAM_YAW = 1.25;
export const CAM_PITCH = 0.62;
export const LENS = lensOf(CAM_AT, CAM_S, CAM_YAW, CAM_PITCH);
/** The sleeping child's head on the pillow, and the middle of the bed the camera watches. */
export const HEAD: V3 = [1.6, 0.47, -2.8];
export const BED_AIM: V3 = [1.0, 0.42, -2.62];

/** Front view, slightly from the right but short of the headboard: the shelf camera top-left, the child bottom-right. */
export const HOOK_CAM: Shot2 = { pos: [1.58, 4.15, 6.14], target: [0.8, 0.9, -2.75], fov: 30, focus: [1.0, 0.7, -2.8], aperture: 1.4 };

/** Wide view with the shield between the stranger (foreground) and the child. */
export const SHIELD_CAM: Shot2 = { pos: [-3.15, 3.48, 8.26], target: [0.4, 0.7, -1.5], fov: 30, focus: [0.3, 0.6, -1.4], aperture: 1.0 };

/** Closing: the mother stepped in from the open door, the sleeping child, in one frame (the hook framing, lower). */
export const CLOSE_CAM: Shot2 = { pos: [1.4, 3.3, 6.6], target: [0.65, 0.95, -2.6], fov: 30, focus: [0.5, 0.9, -2.6], aperture: 1.0 };

/** The device diorama: a dark platform on the floor in front of the bed, devices round the camera. */
export const DIO_C: V3 = [0.4, 0, 0.3];
export const DIO_R = 0.8;
const DIO_T: V3 = [0.4, 0.15, 0.3];
/** Diorama framing at elevation `el`°, azimuth `az`° and distance `d` (az 0 = straight in from the front). */
export const dioShot = (az: number, el = 45, d = 7.75): Shot2 => {
  const e = (el * Math.PI) / 180;
  const a = (az * Math.PI) / 180;
  return {
    pos: [DIO_T[0] + d * Math.cos(e) * Math.sin(a), DIO_T[1] + d * Math.sin(e), DIO_T[2] + d * Math.cos(e) * Math.cos(a)],
    target: DIO_T,
    fov: 30,
    focus: DIO_T,
    aperture: 1.6,
  };
};
