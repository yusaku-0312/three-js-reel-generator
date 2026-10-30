import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { LATTE_ACCENT } from "../labels";
import { BOTTLE_NECK, FlagPick, MilkBottle, NeckTag } from "../three/latte";
import { italyFlagTexture, latteTagTexture } from "../three/textures";
import { SceneDefP } from "../types";

// Line 1: a milk bottle on the counter with a kraft tag 「latte」 on its neck (ラテは); an Italian flag pick
// springs up beside it (イタリア語で); the milk inside glows white (「牛乳」のこと).
const BOTTLE: V3 = [-0.1, 0, 0];
const FLAG: V3 = [0.62, 0, 0.35];

const latteShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.35, 2.6, 7.4], target: [0.15, 0.85, 0], fov: 30, focus: [0, 0.8, 0], aperture: 6 }],
      [0, { pos: [0.3, 2.3, 6.9], target: [0.15, 0.8, 0], fov: 30, focus: [0, 0.8, 0], aperture: 6 }, 95],
    ]),
    b.f,
  );

const LatteWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const swing = Math.sin(f / 7) * 0.12 * (1 - ease(f, b.ck(0, 0), 40, EASE.out)) + Math.sin(f / 19) * 0.03;
  const flag = ease(f, b.ck(0, 1) - 2, 12, EASE.out);
  const glow = ease(f, b.ck(0, 2), 14, EASE.out);
  return (
    <>
      <MilkBottle pos={BOTTLE} f={f} glow={glow}>
        <NeckTag texture={latteTagTexture()} swing={swing} />
      </MilkBottle>
      <FlagPick pos={FLAG} up={flag} f={f} texture={italyFlagTexture()} yaw={-0.15} />
      <Glow pos={[BOTTLE[0], 0.6, BOTTLE[2] + 0.2]} size={1.3} color="#fff6e6" intensity={glow * 0.15} />
      <Sparkles center={[BOTTLE[0], BOTTLE_NECK, BOTTLE[2]]} f={f - b.ck(0, 2)} mode="burst" count={12} radius={0.6} size={0.05} seed={41} color="#fffaf0" intensity={2} />
    </>
  );
};

const LatteOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0) - 2)}>
        <Headline text="Latte" size={120} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 0) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={1235} k={reveal(f, b.ck(0, 1) - 2)}>
        <Chip text="イタリア語" size={50} accent="#7fd39a" />
      </Layer>
      <Layer x={SAFE_CX} y={1345} k={reveal(f, b.ck(0, 2) - 1)}>
        <Chip text="latte ＝ 牛乳" size={58} accent={LATTE_ACCENT} />
      </Layer>
    </>
  );
};

export const LATTE: SceneDefP = {
  topic: "ラテってなに？",
  shot: latteShot,
  World: LatteWorld,
  Overlay: LatteOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
