import React from "react";
import { ramp } from "../../koucha/anim";
import { C, FONT } from "../../koucha/theme";
import { add3, Beat, lerp, Shot } from "../core";
import { appear, At, GoldText } from "../overlays";
import { Glow, Sparkles, Steam } from "../three/fx";
import { Cup, CupPose, teaSurface } from "../three/models";

// Hero cup glowing gold while the camera circles it; summary card after the last line.
const HERO: CupPose = { pos: [0, 0, 0], scale: 1, yaw: -0.6 };
const FILL = 0.6;
const SURFACE = teaSurface(HERO, FILL);

const outroShot = (b: Beat): Shot => {
  const a = lerp(-0.55, 0.35, b.f / b.dur);
  const r = lerp(3.4, 3.0, ramp(b.f, 0, b.dur));
  return { pos: [Math.sin(a) * r, 2.25, Math.cos(a) * r], target: [0, 0.95, 0], fov: 34 };
};

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const glow = 0.65 + 0.12 * Math.sin(f / 10);
  return (
    <>
      <Cup pose={HERO} fill={FILL} glow={glow} />
      <Glow pos={add3(SURFACE, [0, 0.06, 0])} size={1.8} opacity={0.3} />
      <Steam base={SURFACE} f={f + 90} opacity={0.9} width={0.5} />
      <Sparkles center={SURFACE} f={f + 60} mode="rise" radius={0.5} count={30} size={0.08} seed={51} />
      <Sparkles center={add3(SURFACE, [0, 0.6, 0])} f={f} radius={1.1} count={20} size={0.07} seed={52} opacity={0.8} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const at = b.ln(0) + 70;
  return (
    <At x={500} y={1110} k={appear(f, at)}>
      <div
        style={{
          background: "rgba(43,20,8,0.9)",
          border: "6px solid #ffc93c",
          borderRadius: 36,
          padding: "30px 44px 34px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#ffd34d", letterSpacing: 6 }}>まとめ</div>
        <GoldText text="ゴールデンドロップ" size={80} stroke={10} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.cream }}>＝ ポットの最後の一滴</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.cream, opacity: ramp(f, at + 14, 10) }}>
          注ぎ分けて、最後まで注ぎきろう
        </div>
      </div>
    </At>
  );
};

export const OUTRO = { topic: "次の一杯で試してね", shot: outroShot, World: OutroWorld, Overlay: OutroOverlay, wipeIn: true };
