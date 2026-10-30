import { V3 } from "../core";
import { Shot2 } from "../../golden2/shot";

export { dolly, HERO, HERO_CAM } from "../../kyouhaku/scenes/cams";
export { CAM_AT, CAM_PITCH, CAM_S, CAM_YAW, LENS, SHELF } from "../../camerahack/scenes/cams";

/**
 * The bedroom of src/kyouhaku with the shelf camera of src/camerahack (back wall z -3.2, bed x 0..1.9, room door
 * at x -0.8). The child stands awake in front of the bed, below and right of the shelf camera.
 */
export const CHILD_AT: V3 = [0.75, 0, -1.75];
/** Where the child walks toward the room door (to the front door beyond it). */
export const TO_DOOR: V3 = [-0.45, 0, -2.55];
/** Mother and child facing each other in front of the bed (the promise). */
export const MOM_KNEEL: V3 = [0.15, 0, -1.65];
export const KID_FACE: V3 = [0.85, 0, -1.8];

/** The shelf camera and the child in one frame, a little lower and closer than the hook. */
/** Fitted (scratch proj.py): shelf camera at about (330, 670), the child's head (790, 860), feet above the subtitles. */
export const ROOM_CAM: Shot2 = { pos: [0.25, 1.6, 4.75], target: [0.3, 0.8, -2.4], fov: 30, focus: [0.4, 0.9, -2.2], aperture: 1.2 };
/** Mother and child close, the bed behind. */
/** Fitted: both heads below y 830 (room for a card above), feet above the subtitles. */
export const PAIR_CAM: Shot2 = { pos: [1.75, 3.6, 6.5], target: [0.6, 1.2, -1.7], fov: 30, focus: [0.5, 0.7, -1.7], aperture: 1.4 };
/** Closing: the room door open, the mother in the doorway, the child running to her. */
export const CLOSE_CAM: Shot2 = { pos: [0.9, 3.2, 6.4], target: [0.2, 0.95, -2.5], fov: 30, focus: [0.0, 0.9, -2.5], aperture: 1.0 };
