import { V3 } from "../core";
import { Shot2 } from "../../golden2/shot";
import { hipHeight, Kind } from "../three/figures";
import { BED } from "../three/room";

/**
 * Fitted framings (scratch proj.py: key points projected into x 170-910 / y 540-1400 at fov 30).
 * The door sits in the back wall left of the bed, so the child on the bed and the door share ROOM_CAM.
 */

/** Figure y for sitting on the bed edge (thigh resting on the mattress). */
export const seatY = (kind: Kind) => BED.seat - hipHeight(kind) + 0.06;

export const TEEN_SIT: V3 = [0.45, seatY("teen"), -2.27];
export const MOM_SIT: V3 = [1.08, seatY("mom"), -2.27];
/** Phone held in the sitting child's hands, screen tilted up to the face. */
export const HAND_PHONE: V3 = [0.47, 0.66, -1.98];

export const MOM_DOOR: V3 = [-0.45, 0, -2.8];
export const DAD_DOOR: V3 = [-0.92, 0, -3.6];
export const TEEN_AT_DOOR: V3 = [0.0, 0, -2.45];
export const TEEN_STAND: V3 = [0.45, 0, -1.9];
export const DAD_BED: V3 = [-0.28, 0, -1.85];

export const HOOK_CAM: Shot2 = { pos: [4.31, 3.82, 3.16], target: [0.45, 0.62, -2.15], fov: 30, focus: [0.45, 0.8, -2.2], aperture: 2.5 };
export const ROOM_CAM: Shot2 = { pos: [0.12, 1.79, 6.56], target: [-0.2, 1.0, -2.5], fov: 30, focus: [0.45, 0.8, -2.2], aperture: 1.2 };
export const DOOR_CAM: Shot2 = { pos: [-2.15, 1.67, 6.56], target: [-0.2, 0.85, -2.6], fov: 30, focus: [-0.2, 1.0, -2.6], aperture: 1.2 };
export const BED_CAM: Shot2 = { pos: [-2.7, 3.08, 4.66], target: [0.45, 0.8, -2.1], fov: 30, focus: [0.6, 0.9, -2.2], aperture: 1.5 };

/** Floating props in front of the room (the room behind is heavily blurred); world y 1.3 at HERO z is screen centre. */
export const HERO: V3 = [0, 1.3, 0.9];
export const HERO_CAM: Shot2 = { pos: [0, 1.5, 8.1], target: HERO, fov: 30, focus: HERO, aperture: 22 };

/** Watchers ring on the floor in front of the bed. */
export const RING_C: V3 = [0.45, 0, -1.0];
export const RING_CAM: Shot2 = { pos: [-2.25, 2.9, 4.8], target: [0.45, 0.32, -1.0], fov: 30, focus: [0.45, 0.3, -1.0], aperture: 2 };

/** Same framing pushed `k` of the way toward its target (a dolly, not a zoom). */
export const dolly = (s: Shot2, k: number): Shot2 => ({
  ...s,
  pos: [s.pos[0] + (s.target[0] - s.pos[0]) * k, s.pos[1] + (s.target[1] - s.pos[1]) * k, s.pos[2] + (s.target[2] - s.pos[2]) * k],
});
