import React from "react";
import { C, FONT } from "../../koucha/theme";
import { add3, Beat, lerp } from "../../golden/core";
import { Headline, Kicker, Layer, reveal, SAFE_CX } from "../overlays";
import { ease, EASE, Shot2 } from "../shot";
import { Glow, Sparkles, Steam } from "../three/fx";
import { DropLight } from "../three/liquid";
import { Cup, CupPose, teaRadius, teaSurface } from "../three/models";
import { SceneDef2 } from "../types";

// Hero cup glowing gold; the camera moves through a short arc (not a full orbit), then holds for the card.
const HERO: CupPose = { pos: [0, 0, 0], scale: 1, yaw: -0.6 };
const FILL = 0.6;
const SURFACE = teaSurface(HERO, FILL);
const CARD_AT = 78;

const outroShot = (b: Beat): Shot2 => {
  const k = ease(b.f, 0, CARD_AT + 20, EASE.cam);
  const a = lerp(-0.5, 0.12, k);
  const r = lerp(4.3, 3.9, k);
  return { pos: [Math.sin(a) * r, 2.75, Math.cos(a) * r], target: [0, 0.62, 0], fov: 33, focus: SURFACE, aperture: 7 };
};

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const glow = 0.55 + 0.08 * Math.sin(f / 10);
  return (
    <>
      <Cup pose={HERO} fill={FILL} glow={glow} ripple={{ t: 0.5 + (f % 45) / 30, amp: 0.008 }} />
      <DropLight pos={add3(SURFACE, [0, 0.15, 0])} intensity={0.3 * glow} />
      <Glow pos={add3(SURFACE, [0, 0.05, 0])} size={teaRadius(HERO, FILL) * 2.6} intensity={0.16} />
      <Steam base={SURFACE} f={f + 90} opacity={0.8} width={0.5} />
      <Sparkles center={SURFACE} f={f + 60} mode="rise" radius={0.45} count={16} size={0.045} seed={51} intensity={1.8} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const k = reveal(f, CARD_AT);
  return (
    <Layer x={SAFE_CX} y={1170} k={k}>
      <div
        style={{
          background: "linear-gradient(180deg, rgba(44,21,9,0.9), rgba(20,9,4,0.92))",
          border: "3px solid #e9b955",
          borderRadius: 34,
          padding: "26px 46px 22px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 16px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,235,190,0.25)",
        }}
      >
        <Kicker text="SUMMARY" f={f} at={CARD_AT} size={30} />
        <Headline text="ゴールデンドロップ" size={70} f={f} at={CARD_AT + 2} sweepAt={CARD_AT + 20} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.cream }}>＝ ポットの最後の一滴</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#f6c45a", opacity: ease(f, CARD_AT + 12, 10, EASE.out) }}>
          注ぎ分けて、最後まで注ぎきろう
        </div>
        <div style={{ alignSelf: "flex-start", marginTop: 6, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: "#cdb89a" }}>
          ※AI制作のアニメーションです
        </div>
      </div>
    </Layer>
  );
};

export const OUTRO: SceneDef2 = {
  topic: "次の一杯で試してね",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
};
