import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { ProfileCta, profileBandOff } from "../../narration/ProfileCta";
import { faceTo, Figure } from "../../kyouhaku/three/figures";
import { SAFE_TEAL } from "../three/devices";
import { SceneDefP } from "../types";
import { CLOSE_CAM, dolly, HEAD } from "./cams";
import { Bedroom } from "./cast";

// L0 the bedroom, calm: the door open onto the warm hall, the mother in the doorway looking in at the sleeping
// child, the shelf camera's lamp teal. From 「プロフィールから」 the shared profile closing card (pattern "ai") and
// the series band fades out. No AI-made note.
const CTA_LINE = 0;
const CTA_CHUNK = 3;
const LINES = ["見守りカメラを", "安心して使うために"];
const ctaAt = (b: Beat) => b.ck(CTA_LINE, CTA_CHUNK);
const MOM_AT: [number, number, number] = [-0.1, 0, -1.95];

const shot = (b: Beat): Shot2 => breathe(dolly(CLOSE_CAM, 0.06 * ease(b.f, 0, ctaAt(b), EASE.inOut)), b.f, 0.02);

const World: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Bedroom f={b.f} led="teal" cone={0.6} coneColor={SAFE_TEAL} />
    <Figure kind="mom" pose={{ pos: MOM_AT, yaw: faceTo(MOM_AT, HEAD), headPitch: 0.25, headRoll: 0.08 }} />
  </>
);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => (
  <ProfileCta f={b.f} at={ctaAt(b)} lines={LINES} src="camerahack/profile.png" />
);

export const CTA: SceneDefP = {
  topic: "子どもを守るAIリテラシー",
  shot,
  World,
  Overlay,
  light: () => ({ moon: 0.55, lamp: 0.25, hall: 0.95, fill: 0.36, front: 0.45 }),
  room: () => ({ door: 1 }),
  dipIn: true,
  bandOff: (b) => profileBandOff(b.f, ctaAt(b)),
};
