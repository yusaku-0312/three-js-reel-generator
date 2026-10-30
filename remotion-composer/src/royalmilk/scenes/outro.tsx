import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { C, FONT } from "../../koucha/theme";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { DrinkChip } from "../labels";
import { ROYAL_TOP, TwoCups } from "./hook";
import { SceneDefP } from "../types";

// Line 10: back to the two cups; a short arc and crane up so they sit in the upper half, and the summary card
// (one row per drink, in the drinks' colours) fills the lower half.
const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.6, 3.2, 8.0], target: [0, 0.3, 0], fov: 30, focus: [0, 0.4, 0], aperture: 6 }],
      [0, { pos: [0.5, 4.4, 8.6], target: [0, -0.35, 0], fov: 30, focus: [0, 0.4, 0], aperture: 6 }, 75],
    ]),
    b.f,
    0.025,
  );

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const near = ease(f, b.ck(0, 2) - 4, 30, EASE.inOut) * 0.12;
  return (
    <>
      <TwoCups f={f} milkSwirl={2 + f * 0.01} milkOffset={[near, 0, -near * 0.5]} royalOffset={[-near, 0, near * 0.5]} />
      <Sparkles center={add3(ROYAL_TOP, [-0.4, 0.5, 0.4])} f={f} mode="rise" count={14} radius={0.7} size={0.045} seed={81} color="#fff0c8" intensity={1.6} />
    </>
  );
};

const Row: React.FC<{ kind: "milk" | "royal"; text: string; k: number }> = ({ kind, text, k }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
    <DrinkChip kind={kind} size={40} />
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.cream }}>{text}</div>
  </div>
);

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const at = b.ck(0, 1) - 4;
  return (
    <Layer x={SAFE_CX} y={1170} k={reveal(f, at)}>
      <div
        style={{
          width: 760,
          background: "linear-gradient(180deg, rgba(74,42,23,0.94), rgba(43,23,12,0.96))",
          border: "4px solid #f3c27a",
          borderRadius: 36,
          padding: "22px 30px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 16px 40px rgba(30,12,4,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <Headline text="違いはつくり方" size={64} f={f} at={at + 2} sweepAt={at + 22} />
        <Row kind="milk" text="紅茶に あとからミルク" k={ease(f, at + 8, 10, EASE.out)} />
        <Row kind="royal" text="茶葉を 牛乳で煮出す" k={ease(f, at + 16, 10, EASE.out)} />
      </div>
    </Layer>
  );
};

export const OUTRO: SceneDefP = {
  topic: "その日の気分で",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
