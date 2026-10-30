import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { ProfileCta, profileBandOff } from "../../narration/ProfileCta";
import { faceTo } from "../../kyouhaku/three/figures";
import { Figure, walkAlong } from "../three/props";
import { SceneDefP } from "../types";
import { CHILD_AT, CLOSE_CAM, dolly } from "./cams";
import { Kid, ShelfCam } from "./cast";

// L0 the room, calm: the door open onto the warm hall, the mother home in the doorway, the child running to her;
// the shelf camera's lamp teal. From 「プロフィールから」 the shared profile closing card (pattern "ai") and the
// series band fades out. No AI-made note.
const CTA_LINE = 0;
const CTA_CHUNK = 3;
const LINES = ["ママの声でも", "まず電話で確認"];
const ctaAt = (b: Beat) => b.ck(CTA_LINE, CTA_CHUNK);
const MOM_AT: V3 = [-0.6, 0, -2.75];
const KID_TO: V3 = [-0.25, 0, -2.25];

const shot = (b: Beat): Shot2 => breathe(dolly(CLOSE_CAM, 0.06 * ease(b.f, 0, ctaAt(b), EASE.inOut)), b.f, 0.02);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const w = walkAlong(CHILD_AT, KID_TO, ease(b.f, 6, 40, EASE.inOut), 6);
  const arrived = b.f >= 46;
  return (
    <>
      <ShelfCam f={b.f} led="teal" />
      <Kid pos={w.pos} yaw={arrived ? faceTo(KID_TO, MOM_AT) : w.yaw} walk={w.walk} step={w.step} armL={arrived ? 1.2 : 0} armR={arrived ? 1.2 : 0} hop={arrived ? Math.min(1, (b.f - 46) / 12) : 0} />
      <Figure kind="mom" pose={{ pos: MOM_AT, yaw: faceTo(MOM_AT, KID_TO), crouch: 0.2 * ease(b.f, 30, 20, EASE.inOut), lean: 0.2 * ease(b.f, 30, 20, EASE.inOut), armL: 0.9, armR: 0.9, headPitch: 0.2 }} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => <ProfileCta f={b.f} at={ctaAt(b)} lines={LINES} src="mimamorikoe/profile.png" />;

export const CTA: SceneDefP = {
  topic: "子どもを守るAIリテラシー",
  shot,
  World,
  Overlay,
  light: () => ({ moon: 0.45, lamp: 0.6, hall: 0.95, fill: 0.4, front: 0.5 }),
  room: () => ({ door: 1 }),
  dipIn: true,
  bandOff: (b) => profileBandOff(b.f, ctaAt(b)),
};
