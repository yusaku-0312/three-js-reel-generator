import React from "react";
import { Beat, lerp, V3 } from "../../golden/core";
import { breathe, ease, EASE, keys2, Shot2 } from "../shot";
import { GlassPot } from "../three/glass";
import { DropLight } from "../three/liquid";
import { Cup, CupPose, poseAbout } from "../three/models";

// Set B: tea left in the pot keeps steeping; the second cup pours out dark and harsh.
export const leftoverPot: V3 = [-0.4, 0.55, -0.3];
const POSE = poseAbout(leftoverPot, 0, 0.55, -0.5);
export const LEFTOVER_SECOND: CupPose = { pos: [0.62, 0, 0.95], scale: 0.7, yaw: -0.4 };

export const leftoverShot = (b: Beat, local: number): Shot2 =>
  breathe(
    keys2(local, [
      [0, { pos: [0.25, 2.35, 6.4], target: [0.1, 0.52, 0.3], fov: 33, focus: leftoverPot, aperture: 6 }],
      [30, { pos: [0.3, 2.1, 5.7], target: [0.15, 0.5, 0.35], fov: 33, focus: [0.2, 0.45, 0.4], aperture: 7 }, 70],
    ]),
    b.f,
  );

export const LeftoverSet: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const dark = ease(f, b.ck(3, 0) + 4, 44, EASE.inOut);
  const cupK = ease(f, b.ck(3, 1) - 6, 14, EASE.out);
  return (
    <>
      <DropLight pos={[0, -9, 0]} intensity={0} />
      <GlassPot pose={POSE} level={leftoverPot[1] - 0.3} f={f} dark={dark} settle={0.8} />
      {cupK > 0 && <Cup pose={{ ...LEFTOVER_SECOND, scale: 0.7 * lerp(0.7, 1, cupK) }} fill={0.58} dark={0.82} />}
    </>
  );
};
