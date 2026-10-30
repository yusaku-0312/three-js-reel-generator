import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { ProfileCta, profileBandOff } from "../../narration/ProfileCta";
import { Figure } from "../../kondate/three/figures";
import { KITCHEN_LIGHT, TABLE } from "../../kondate/three/kitchen";
import { Mug, Steam } from "../three/parts";
import { dolly, T_PARENT } from "../../kondate/scenes/cams";
import { SceneDefP } from "../types";

// L0 later that night: the pendant turned low, a mug steaming on the table, the parent stretches; a clock chip
// 21:30 on 「夜のひとり時間」; from 「プロフィールから」 the shared profile closing card (pattern "ai"). No AI-made note.
const MUG_AT: V3 = [T_PARENT[0] + 0.3, TABLE.h, T_PARENT[2] + 0.28];

// Front-right of the parent and the mug, both inside the safe area.
const NIGHT_CAM: Shot2 = { pos: [T_PARENT[0] + 1.4, 2.5, T_PARENT[2] + 7.0], target: [T_PARENT[0] + 0.2, 1.05, T_PARENT[2] + 0.1], fov: 30, focus: [T_PARENT[0] + 0.15, 1.0, T_PARENT[2] + 0.15], aperture: 2 };

const shot = (b: Beat): Shot2 => breathe(dolly(NIGHT_CAM, 0.1 * ease(b.f, 0, b.ck(0, 3), EASE.inOut)), b.f, 0.02);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const stretch = ease(b.f, b.ck(0, 0) + 4, 16, EASE.inOut) * (1 - ease(b.f, b.ck(0, 2), 16, EASE.inOut));
  return (
    <>
      <Figure kind="parent" pose={{ pos: T_PARENT, yaw: 0.2, armL: 2.9 * stretch, armR: 2.9 * stretch, headPitch: -0.25 * stretch, lean: -0.05 * stretch }} />
      <Mug pos={MUG_AT} s={1.4} />
      <Steam pos={[MUG_AT[0], MUG_AT[1] + 0.15, MUG_AT[2]]} f={b.f} k={1} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => {
  return (
    <>
      <Layer x={SAFE_CX + 200} y={600} k={reveal(b.f, b.ck(0, 1), b.ck(0, 3) - 4)}>
        <Chip text="21:30 ひとり時間" accent="#ffcf3f" size={46} />
      </Layer>
      <ProfileCta f={b.f} at={b.ck(0, 3)} lines={["家事を時短して", "夜のひとり時間を"]} src="chatkondate/profile.png" />
    </>
  );
};

export const CTA: SceneDefP = {
  topic: "夜のひとり時間を",
  shot,
  World,
  Overlay,
  light: () => ({ ...KITCHEN_LIGHT, key: 2.4, fill: 0.3, front: 0.35 }),
  bloom: () => 0.4,
  dipIn: true,
  bandOff: (b) => profileBandOff(b.f, b.ck(0, 3)),
};
