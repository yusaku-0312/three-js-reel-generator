import { add3, V3 } from "../core";
import { Shot2 } from "../../golden2/shot";
import { CupPose, mapPoint, PLACE } from "../three/parts";

// One café counter for the cup scenes, one paper map on the same counter for the store scenes.
export const HOOK_CUP: CupPose = { pos: [0.62, 0, -0.1], scale: 0.62, yaw: -0.15 };

/** Map points used across scenes. */
export const KUNMING = mapPoint(...PLACE.kunming);
export const SEOUL = mapPoint(...PLACE.seoul);
export const JAPAN_C = mapPoint(...PLACE.japan);
export const LA = mapPoint(...PLACE.la);

/** Oblique camera over a map point: `dist` back towards the south (+z), `height` up, aimed a touch north. */
export const overMap = (p: V3, dist: number, height: number, aperture = 3, dx = 0): Shot2 => ({
  pos: add3(p, [dx, height, dist]),
  target: add3(p, [0, 0, -0.15 * dist]),
  fov: 30,
  focus: p,
  aperture,
});

export const COLOR = {
  jasmine: "#d7c46a",
  jasmineMilk: "#efe0c0",
  milk: "#f6f1e8",
};

/** Map scenes: the key spot follows the camera target so the far corners of the sheet stay lit. */
export const mapLight = (target: V3) => ({ keyAt: target, keyAngle: 0.6, key: 3.4, fill: 0.48, front: 0.5, rim: 1.1, bokeh: 0.3 });
