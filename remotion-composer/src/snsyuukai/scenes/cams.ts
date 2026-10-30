import { V3 } from "../core";
import { Shot2 } from "../../golden2/shot";

export { LAB_CAM, labCam } from "../../aimukae/scenes/cams";

/** Town sidewalk the child walks home along (the src/aimukae school route, toward the camera). */
export const SIDEWALK_Y = 0.06;
export const WALK_FROM: V3 = [1.15, SIDEWALK_Y, -2.6];
export const WALK_TO: V3 = [1.15, SIDEWALK_Y, 0.9];

/** Following the walker at z from the front, slightly above (the src/aimukae hook framing). */
export const walkCam = (z: number, aperture = 6): Shot2 => ({
  pos: [0.68, 1.75, z + 8.9],
  target: [0.68, 0.9, z - 0.6],
  fov: 30,
  focus: [1.15, 0.6, z],
  aperture,
});

/** Picture map on the lab floor, seen from above at `el`° and distance `d`. */
export const MAP_C: V3 = [0, 0, 0];
export const MAP_SIZE = 1.9;
export const mapCam = (el = 55, d = 7.2, az = 0): Shot2 => {
  const e = (el * Math.PI) / 180;
  const a = (az * Math.PI) / 180;
  const t: V3 = [MAP_C[0], 0.4, MAP_C[2] + 0.05];
  return {
    pos: [t[0] + d * Math.cos(e) * Math.sin(a), t[1] + d * Math.sin(e), t[2] + d * Math.cos(e) * Math.cos(a)],
    target: t,
    fov: 30,
    focus: t,
    aperture: 1.2,
  };
};

/** Visible from `at` (fade in) until `out` (fade out). */
export { span } from "../../camerahack/scenes/util";
