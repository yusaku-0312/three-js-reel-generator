import React from "react";
import { add3, Beat, clamp01, lerp, V3 } from "../core";
import { ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CHAI_ACCENT } from "../labels";
import { PAN_INNER } from "../../royalmilk/three/kitchen";
import { Spice, SPICES } from "../three/parts";
import { ChaiPan, PAN_TOP, panShot } from "./chai";
import { SceneDefP } from "../types";

// Line 10: the chai simmers; ginger, cardamom, cinnamon and star anise drop in one after another (しょうがや
// カルダモンを 入れたものは) → 「マサラチャイ」. Line 11: the spices whirl round together (スパイスを混ぜたもの).
const dropAt = (b: Beat, i: number) => [b.ck(0, 0), b.ck(0, 1), b.ck(0, 2), b.ck(0, 2) + 8][i] - 6;

const spicePos = (b: Beat, i: number, swirl: number): V3 => {
  const t = clamp01((b.f - dropAt(b, i)) / 12);
  const a = (i / 4) * Math.PI * 2 + 0.6 + swirl * (0.9 + i * 0.05);
  const r = PAN_INNER * (0.38 + (i % 2) * 0.16);
  const bob = Math.sin(b.f * 0.15 + i) * 0.01;
  return add3(PAN_TOP, [Math.cos(a) * r, lerp(1.6, 0.02, t * t) + bob, Math.sin(a) * r]);
};

const MasalaWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const swirl = f * 0.012 + ease(f, b.ck(1, 1), 50, EASE.inOut) * 4;
  return (
    <ChaiPan f={f} s={{ brew: 1, boil: 0.6, flame: 1, swirl: swirl * 1.5, landAt: -100, sink: 1 }}>
      {SPICES.map((kind, i) => (
        <Spice
          key={kind}
          kind={kind}
          pos={spicePos(b, i, swirl)}
          rot={[kind === "cinnamon" ? 0 : 0.1, swirl + i, 0]}
          scale={f >= dropAt(b, i) ? 1.15 : 0}
        />
      ))}
    </ChaiPan>
  );
};

const MasalaOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const l11 = b.ln(1) - 4;
  return (
    <>
      <Layer x={SAFE_CX - 150} y={585} k={reveal(f, b.ck(0, 0) - 2, b.ck(0, 3) - 4)}>
        <Chip text="しょうが" size={48} accent="#ecd7a0" />
      </Layer>
      <Layer x={SAFE_CX + 130} y={690} k={reveal(f, b.ck(0, 1) - 2, b.ck(0, 3) - 4)}>
        <Chip text="カルダモン" size={48} accent="#93ad5e" />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(0, 3) - 2, l11)}>
        <Headline text="マサラチャイ" size={110} f={f} at={b.ck(0, 3) - 2} sweepAt={b.ck(0, 3) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(1, 0) - 2)}>
        <Headline text="マサラ" size={120} f={f} at={b.ck(1, 0) - 2} />
      </Layer>
      <Layer x={SAFE_CX} y={1320} k={reveal(f, b.ck(1, 2) - 4)}>
        <Chip text="＝ スパイスを混ぜたもの" size={52} accent={CHAI_ACCENT} />
      </Layer>
    </>
  );
};

export const MASALA: SceneDefP = {
  topic: "スパイス入りは",
  shot: (b) => panShot(b, b.ln(1)),
  World: MasalaWorld,
  Overlay: MasalaOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
