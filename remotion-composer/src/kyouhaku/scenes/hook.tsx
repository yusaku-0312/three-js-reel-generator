import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, Layer, SAFE_CX } from "../overlays";
import { Phone } from "../three/props";
import { SceneDefP } from "../types";
import { dolly, HERO, HERO_CAM, HOOK_CAM } from "./cams";
import { phoneNight, TeenOnBed } from "./cast";
import { screenAt, span } from "./util";

// L0 night, lamp off: the child on the bed, the phone buzzing red in their hands; they flinch at 「脅される」.
// L1 (dip) the phone floats in front: a DM request from an unknown account; an image arrives — only ever a
// 「非表示」 mosaic. L2 the red threat bubble lands; the phone shakes, a red wash.
const isHero = (b: Beat) => b.f >= b.ln(1) - 4;

const shot = (b: Beat): Shot2 =>
  isHero(b) ? breathe(HERO_CAM, b.f) : breathe(dolly(HOOK_CAM, 0.1 * ease(b.f, 0, b.ln(1), EASE.inOut)), b.f, 0.02);

const buzz = (b: Beat) => Math.max(1 - ease(b.f, 0, 24, EASE.in), ease(b.f, b.ck(0, 3), 4) * (1 - ease(b.f, b.ck(0, 3) + 6, 14)));

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (!isHero(b)) {
    const flinch = ease(b.f, b.ck(0, 3), 5, EASE.out) * (1 - ease(b.f, b.ck(0, 4) + 6, 18, EASE.inOut));
    return (
      <TeenOnBed
        f={b.f}
        screen="notify"
        phoneGlow={0.7}
        phoneShake={buzz(b)}
        pose={{ headPitch: 0.35 - flinch * 0.4, lean: -flinch * 0.12 }}
      />
    );
  }
  const s = screenAt(b.f, [
    [0, "notify"],
    [b.ck(1, 1) - 3, "dmEmpty"],
    [b.ck(1, 2), "dmImage"],
    [b.ck(2, 0) - 2, "dmThreat"],
  ]);
  const threat = ease(b.f, b.ck(2, 0), 6, EASE.out);
  const shaking = threat * (1 - ease(b.f, b.ck(2, 1) + 16, 12));
  return <Phone pos={HERO} h={1.5} {...s} glow={0.4 + threat * 0.6} shake={shaking * 0.8} f={b.f} />;
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={560} k={span(b.f, b.ck(0, 1), b.ln(1) - 6)}>
      <Chip text="撮った覚えのない写真" size={52} accent="#ff3b4a" mark="ng" />
    </Layer>
    <Layer x={SAFE_CX} y={530} k={span(b.f, b.ck(1, 1), b.ck(2, 0) - 4)}>
      <Chip text="知らないアカウント" size={46} accent="#ff3b4a" />
    </Layer>
  </>
);

export const HOOK: SceneDefP = {
  topic: "撮っていない写真で脅される",
  shot,
  World,
  Overlay,
  light: (b) => (isHero(b) ? { ...phoneNight(0, 0), front: 0.5, fill: 0.4 } : phoneNight(1, 0.7)),
  grade: (b) => ({ danger: isHero(b) ? 0.3 * ease(b.f, b.ck(2, 0), 8) * (1 - ease(b.f, b.dur - 10, 10)) : 0 }),
  dipLines: [1],
};
