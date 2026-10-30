import React from "react";
import { Beat, V3 } from "../core";
import { breathe, Shot2 } from "../../golden2/shot";
import { ProfileCta, profileBandOff } from "../../narration/ProfileCta";
import { Figure, walkAlong } from "../three/props";
import { TOWN_LIGHT } from "../../aimukae/three/stage";
import { SceneDefP } from "../types";
import { walkCam, WALK_FROM, WALK_TO } from "./cams";

// L0 the town at dusk: the mother and the child walk home hand in hand, no phone out. From 「プロフィールから」
// the shared profile closing card (pattern "ai") and the series band fades out. No AI-made note.
const CTA_LINE = 0;
const CTA_CHUNK = 3;
const LINES = ["子どもの写真を", "AIの悪用から守る"];
const ctaAt = (b: Beat) => b.ck(CTA_LINE, CTA_CHUNK);
const MOM_DX = 0.42;

const walk = (b: Beat) => walkAlong(WALK_FROM, WALK_TO, b.f / b.dur, 12);

const shot = (b: Beat): Shot2 => {
  const z = walk(b).pos[2];
  return breathe({ ...walkCam(z, 5), pos: [0.2, 1.9, z + 9.4], target: [0.95, 1.0, z - 0.4] }, b.f, 0.02);
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const c = walk(b);
  const mom: V3 = [c.pos[0] + MOM_DX, c.pos[1], c.pos[2] - 0.05];
  return (
    <>
      <Figure kind="child" pose={{ pos: c.pos, yaw: c.yaw, walk: c.walk, step: c.step, armR: 0.35 }} />
      <Figure kind="mom" pose={{ pos: mom, yaw: c.yaw, walk: c.walk * 0.8 + 1.2, step: c.step * 0.8, armL: 0.3, headYaw: -0.35, headPitch: 0.2 }} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => <ProfileCta f={b.f} at={ctaAt(b)} lines={LINES} src="snsyuukai/profile.png" />;

export const CTA: SceneDefP = {
  topic: "子どもを守るAIリテラシー",
  shot,
  World,
  Overlay,
  light: () => ({ ...TOWN_LIGHT, evening: 0.3 }),
  dipIn: true,
  bandOff: (b) => profileBandOff(b.f, ctaAt(b)),
};
