import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { C, FONT } from "../../koucha/theme";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CHAI_ACCENT, DrinkChip, MILK_ACCENT } from "../labels";
import { CHAI_TOP, MILK_TOP, MID, TwoDrinks } from "./set";
import { SceneDefP } from "../types";

// Line 15: back to the two drinks; milk tea glows (あとからミルクを足すか), then chai (最初からミルクで煮るか).
// Line 16: crane up so the drinks sit in the upper half; the summary card fills the lower half and stays to the end.
const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.5, 3.8, 8.0], target: [0, 0.45, 0], fov: 30, focus: [0, 0.5, 0], aperture: 6 }],
      [b.ln(1) - 10, { pos: [0.3, 4.4, 8.6], target: [0, -0.25, 0], fov: 30, focus: [0, 0.5, 0], aperture: 6 }, 40],
    ]),
    b.f,
    0.025,
  );

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const milkK = ease(f, b.ck(0, 0), 8, EASE.out) * (1 - ease(f, b.ck(0, 2), 12));
  const chaiK = ease(f, b.ck(0, 2), 8, EASE.out) * (1 - ease(f, b.ln(1), 14));
  const near = ease(f, b.ln(1), 30, EASE.inOut) * 0.12;
  return (
    <>
      <TwoDrinks f={f + 400} milkOffset={[near, 0, -near * 0.5]} chaiOffset={[-near, 0, near * 0.5]} />
      <Glow pos={add3(MILK_TOP, [0, 0.3, 0])} size={1.1} color="#ffd9a0" intensity={milkK * 0.7} />
      <Glow pos={add3(CHAI_TOP, [0, 0.3, 0])} size={1.1} color="#ffc08a" intensity={chaiK * 0.7} />
      <Sparkles center={add3(MID, [0, 0.6, 0])} f={f - b.ln(1)} mode="rise" count={14} radius={0.7} size={0.045} seed={81} color="#fff0c8" intensity={1.6} />
    </>
  );
};

const Row: React.FC<{ kind: "milk" | "chai"; text: string; k: number }> = ({ kind, text, k }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
    <DrinkChip kind={kind} size={40} />
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.cream }}>{text}</div>
  </div>
);

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const at = b.ln(1) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 0), b.ck(0, 2) - 2)}>
        <Chip text="あとからミルクを足す" size={52} accent={MILK_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 2), at - 2)}>
        <Chip text="最初からミルクで煮る" size={52} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1180} k={reveal(f, at)}>
        <div
          style={{
            width: 780,
            background: "linear-gradient(180deg, rgba(74,42,23,0.94), rgba(43,23,12,0.96))",
            border: "4px solid #f3c27a",
            borderRadius: 36,
            padding: "22px 30px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 16px 40px rgba(30,12,4,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <Headline text="同じ「茶」から" size={70} f={f} at={at + 2} sweepAt={at + 22} />
          <Row kind="milk" text="紅茶に あとからミルク" k={ease(f, at + 10, 10, EASE.out)} />
          <Row kind="chai" text="ミルクで 茶葉を煮出す" k={ease(f, at + 20, 10, EASE.out)} />
        </div>
      </Layer>
    </>
  );
};

export const OUTRO: SceneDefP = {
  topic: "ふたつの飲み方",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
