import { CupPose } from "../../golden2/three/models";
import { MugPose } from "../three/liquid";
import { TeaLook } from "../three/liquid";
import { V3 } from "../core";

// One café counter for the whole reel. The mug (brown-looking tea) stands front-left, the white cup back-right
// lit from behind by the window, staggered in depth because 9:16 is too narrow for a row.
export const MUG: MugPose = { pos: [-0.62, 0, 0.75], scale: 1, yaw: -0.5 };
export const MUG_FILL = 0.8;
export const CUP: CupPose = { pos: [0.42, 0, -0.45], scale: 0.9, yaw: Math.PI + 0.4 };
export const CUP_FILL = 0.8;

/** The looks the tea moves between. */
export const LOOK = {
  mug: { clear: 0, ring: 0 } satisfies TeaLook,
  plain: { clear: 0.35, ring: 0.1 } satisfies TeaLook,
  backlit: { clear: 1, glow: 0.28, ring: 1 } satisfies TeaLook,
};

export const lerpLook = (a: TeaLook, b: TeaLook, t: number): TeaLook => ({
  clear: a.clear + (b.clear - a.clear) * t,
  glow: (a.glow ?? 0) + ((b.glow ?? 0) - (a.glow ?? 0)) * t,
  ring: (a.ring ?? a.clear) + ((b.ring ?? b.clear) - (a.ring ?? a.clear)) * t,
});
