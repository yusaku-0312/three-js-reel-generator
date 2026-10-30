import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Headline, Layer, reveal, SAFE_CX, TimeBar } from "../overlays";
import { faceTo, Figure } from "../three/figures";
import { Omurice } from "../three/food";
import { Heart, Sparkles, Steam } from "../three/props";
import { KITCHEN_LIGHT } from "../three/kitchen";
import { SceneDefP } from "../types";
import { B_KID, dolly, PLATE, PLATE_CAM } from "./cams";

// L0 the chosen omurice on the table, steaming; the child hops beside it, hearts rise on 「高まりやすい」.
// L1 a bar 「献立に悩む時間」 shrinks on 「ぐっと減らせます」.
const shot = (b: Beat): Shot2 => {
  const push = ease(b.f, 0, b.ln(1), EASE.inOut) * 0.12;
  const back = ease(b.f, b.ln(1) - 6, 30, EASE.inOut) * 0.12;
  return breathe(dolly(PLATE_CAM, push - back), b.f);
};

const HEARTS: Array<{ dx: number; delay: number; s: number }> = [
  { dx: -0.15, delay: 0, s: 0.22 },
  { dx: 0.12, delay: 6, s: 0.28 },
  { dx: 0.32, delay: 12, s: 0.2 },
];

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const grow = ease(b.f, 0, 10, EASE.out);
  const t = b.f % 16;
  const hop = b.f < b.ln(1) ? t / 16 : 0;
  const up = b.ck(0, 3);
  return (
    <>
      <Omurice pos={PLATE} s={1.7 * (0.6 + 0.4 * grow)} />
      <Steam pos={[PLATE[0], PLATE[1] + 0.15, PLATE[2]]} f={b.f} k={grow} />
      <Figure kind="kid" pose={{ pos: B_KID, yaw: faceTo(B_KID, PLATE), hop, armL: 0.6 + Math.sin(b.f / 5) * 0.3, armR: 0.6 - Math.sin(b.f / 5) * 0.3 }} />
      {HEARTS.map((h, i) => {
        const k = ease(b.f, up + h.delay, 10, EASE.out);
        const rise = ease(b.f, up + h.delay, 60, EASE.out);
        const pos: V3 = [B_KID[0] + h.dx, 1.15 + rise * 0.45, B_KID[2] - 0.1];
        return <Heart key={i} pos={pos} k={k * (1 - ease(b.f, b.ln(1), 10))} scale={h.s} />;
      })}
      <Sparkles center={[PLATE[0], PLATE[1] + 0.25, PLATE[2]]} f={b.f} count={12} radius={0.45} color="#ffd27a" intensity={1.4} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={580} k={reveal(b.f, b.ck(0, 2) - 2, b.ln(1) - 6)}>
      <Headline text="食べる気持ち UP" size={92} f={b.f} at={b.ck(0, 2) - 2} tone="pink" />
    </Layer>
    <Layer x={SAFE_CX} y={640} k={reveal(b.f, b.ln(1) - 2)}>
      <TimeBar f={b.f} at={b.ck(1, 1)} label="献立に悩む時間" />
    </Layer>
  </>
);

export const BENEFIT: SceneDefP = {
  topic: "自分で選ぶと、うれしい",
  shot,
  World,
  Overlay,
  kitchen: () => ({ omurice: 1 }),
  light: () => ({ ...KITCHEN_LIGHT, key: 2.8 }),
  bloom: () => 0.45,
  dipIn: true,
};
