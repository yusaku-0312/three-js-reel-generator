import { CupPose, teaRadius, teaSurface } from "../../golden2/three/models";
import { Shot2 } from "../../golden2/shot";
import { add3, lerp3, V3 } from "../core";
import { BagPose, bagTop } from "../three/teabag";

// One white cup on the café counter (y 0), at 0.75 scale so the cup and the bag hung over it fit y 520–1100
// with room under the saucer for chips (y 1250–1420).
export const CUP_S = 0.75;
export const CUP: CupPose = { pos: [0, 0, 0], scale: CUP_S, yaw: Math.PI + 0.5 };
export const FILL = 0.74;
export const SURFACE: V3 = teaSurface(CUP, FILL);
export const SURFACE_R = teaRadius(CUP, FILL);
/** Gold rim of the cup (world y). */
export const RIM_Y = (0.036 + 0.769) * CUP_S;
export const BAG_S = 0.75;

/** Bag hung over the cup by its tag (the tag is out of the top of the bag, held by an unseen hand). */
export const HANG: V3 = [0, RIM_Y + 0.42, 0];
export const hang = (f: number, at: V3 = HANG, sway = 1): BagPose => ({
  pos: add3(at, [Math.sin(f / 21) * 0.025 * sway, 0, Math.cos(f / 27) * 0.015 * sway]),
  yaw: Math.sin(f / 33) * 0.25 * sway,
  tilt: Math.sin(f / 19) * 0.04 * sway,
  scale: BAG_S,
});
export const heldTag = (pose: BagPose): V3 => add3(bagTop(pose), [0, 0.3, 0]);

/** Bag resting in the tea, leaning back, with the tag hung over the front-right rim. */
export const restIn = (cup: CupPose, fill = FILL): { pose: BagPose; tag: V3; via: V3 } => {
  const s = cup.scale ?? 1;
  const top = teaSurface(cup, fill);
  const rimY = cup.pos[1] + (0.036 + 0.769) * s;
  return {
    pose: { pos: add3(top, [-0.04 * s, 0.02 * s, -0.12 * s]), tilt: -0.7, yaw: 0.2, scale: BAG_S * (s / CUP_S) },
    via: add3(cup.pos, [0.42 * s, rimY + 0.08 * s, 0.42 * s]),
    tag: add3(cup.pos, [0.62 * s, rimY - 0.22 * s, 0.62 * s]),
  };
};

/** Lift a resting bag up out of the cup to `to` (k 0..1); the tag goes up with it. */
export const lifted = (rest: { pose: BagPose; tag: V3; via: V3 }, to: V3, k: number) => {
  const pose: BagPose = { ...rest.pose, pos: lerp3(rest.pose.pos, to, k), tilt: (rest.pose.tilt ?? 0) * (1 - k) };
  return { pose, tag: k > 0.35 ? heldTag(pose) : lerp3(rest.tag, heldTag(pose), k / 0.35), via: k > 0.2 ? undefined : rest.via };
};

/** The cup with the bag over it, chips under the saucer. */
export const HERO: Shot2 = { pos: [0.3, 3.3, 9.2], target: [0, 0.72, 0], fov: 30, focus: [0, 0.85, 0], aperture: 3 };

export const TEA_DARKER = 0.32;
