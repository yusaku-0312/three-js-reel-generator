import React from "react";
import { V3 } from "../core";
import { Figure, Pose } from "../three/figures";
import { Phone, THREAT_RED } from "../three/props";
import { ScreenKind } from "../three/textures";
import { RoomLight } from "../three/room";
import { HAND_PHONE, TEEN_SIT } from "./cams";

/** The child on the bed edge, both hands up holding the phone in front of the chest. */
export const TeenOnBed: React.FC<{
  pose?: Partial<Pose>;
  screen?: ScreenKind;
  phoneGlow?: number;
  phoneShake?: number;
  phoneDim?: number;
  /** 0 = phone up at the face, 1 = lowered to the lap. */
  lower?: number;
  f: number;
  noPhone?: boolean;
}> = ({ pose = {}, screen = "notify", phoneGlow = 0, phoneShake = 0, phoneDim = 0, lower = 0, f, noPhone }) => {
  const phonePos: V3 = [HAND_PHONE[0], HAND_PHONE[1] - lower * 0.16, HAND_PHONE[2] - lower * 0.02];
  return (
    <>
      <Figure kind="teen" pose={{ pos: TEEN_SIT, sit: 1, armL: 1.0 - lower * 0.4, armR: 1.0 - lower * 0.4, headPitch: 0.35, ...pose }} />
      {!noPhone && (
        <Phone pos={phonePos} rot={[-1.0 - lower * 0.4, 0, 0]} h={0.24} screen={screen} glow={phoneGlow} shake={phoneShake} f={f} dim={phoneDim} />
      )}
    </>
  );
};

/** Night light with the lamp off and the phone lighting the child (red while the threat is on it). */
export const phoneNight = (k: number, red: number, extra: Partial<RoomLight> = {}): RoomLight => ({
  moon: 0.6,
  lamp: 0,
  hall: 0.55,
  fill: 0.3,
  front: 0.35,
  phone: { pos: [HAND_PHONE[0], HAND_PHONE[1] + 0.12, HAND_PHONE[2] + 0.05], k, red },
  ...extra,
});

export { THREAT_RED };
