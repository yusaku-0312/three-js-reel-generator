import { Shot2 } from "../../golden2/shot";

/**
 * Standard lab framing: content between world y ≈ -0.1 and 2.6 and x ±1.1 lands inside the readable
 * band (y 490-1420, x 140-940) at about 325 px per unit; world y 1.3 is the screen centre.
 */
export const LAB_CAM: Shot2 = { pos: [0, 1.9, 11.0], target: [0, 1.3, 0], fov: 30, focus: [0, 1.3, 0], aperture: 1.5 };

/** Same framing nudged sideways (a slow truck) by `dx` units. */
export const labCam = (dx = 0, dz = 0): Shot2 => ({
  ...LAB_CAM,
  pos: [LAB_CAM.pos[0] + dx, LAB_CAM.pos[1], LAB_CAM.pos[2] + dz],
  target: [LAB_CAM.target[0] + dx * 0.6, LAB_CAM.target[1], LAB_CAM.target[2]],
});
