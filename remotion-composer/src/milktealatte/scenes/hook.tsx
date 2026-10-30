import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { teaSurface } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Layer, reveal, SAFE_CX } from "../overlays";
import { DrinkChip, Thump } from "../labels";
import { MilkCup } from "../../royalmilk/three/kitchen";
import { LatteGlass, LattePose, latteTop } from "../three/latte";
import { CUP_FILL, LATTE_DONE, LATTE_GLASS, MILK_CUP, MILK_DONE } from "./set";
import { SceneDefP } from "../types";

// Line 0: the low cup (milk tea, front left) and the tall foamed glass (tea latte, back right) side by side;
// the cup swirls at 「ミルクティーと」, the foam glints at 「ティーラテ」, a ？ thumps in at 「何が違うか」.
export const MILK_TOP = teaSurface(MILK_CUP, CUP_FILL);
export const LATTE_TOP = latteTop(LATTE_GLASS, LATTE_DONE);
const MID: V3 = [(MILK_TOP[0] + LATTE_TOP[0]) / 2, 0.75, (MILK_TOP[2] + LATTE_TOP[2]) / 2];

export const PAIR_WIDE: Shot2 = { pos: [0, 3.0, 8.6], target: [0, 0.5, 0], fov: 30, focus: [0, 0.5, 0], aperture: 5 };
const PAIR_IN: Shot2 = { pos: [0, 2.7, 7.6], target: [0, 0.52, 0], fov: 30, focus: [0, 0.5, 0], aperture: 6 };

const hookShot = (b: Beat): Shot2 => breathe(keys2(b.f, [[0, PAIR_WIDE], [0, PAIR_IN, 115]]), b.f);

/** The two finished drinks with steam; shared with the taste and outro scenes. */
export const TwoDrinks: React.FC<{ f: number; milkSwirl: number; foamGlow?: number; milkOffset?: V3; latteOffset?: V3 }> = ({
  f,
  milkSwirl,
  foamGlow = 0,
  milkOffset = [0, 0, 0],
  latteOffset = [0, 0, 0],
}) => {
  const milk = { ...MILK_CUP, pos: add3(MILK_CUP.pos, milkOffset) };
  const latte: LattePose = { ...LATTE_GLASS, pos: add3(LATTE_GLASS.pos, latteOffset) };
  return (
    <>
      <MilkCup pose={milk} fill={CUP_FILL} s={{ ...MILK_DONE, swirl: milkSwirl }} />
      <LatteGlass pose={latte} c={LATTE_DONE} foamGlow={foamGlow} />
      <Steam base={teaSurface(milk, CUP_FILL)} f={f} width={0.3} opacity={1.0} seed={3} />
      <Steam base={latteTop(latte, LATTE_DONE)} f={f + 30} width={0.25} opacity={0.8} seed={6} />
    </>
  );
};

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const swirl = 1.5 + ease(f, b.ck(0, 0) - 4, 50, EASE.inOut) * 3;
  const glint = ease(f, b.ck(0, 1), 6, EASE.out) * (1 - ease(f, b.ck(0, 1) + 14, 18, EASE.in));
  const ask = ease(f, b.ck(0, 2) - 2, 10, EASE.out) * (1 - ease(f, b.ck(0, 3) + 12, 14, EASE.in));
  return (
    <>
      <TwoDrinks f={f} milkSwirl={swirl} foamGlow={glint * 0.25} />
      <Glow pos={add3(LATTE_TOP, [0, 0.2, 0])} size={0.9} color="#fff4e0" intensity={glint * 0.7} />
      <Sparkles center={add3(LATTE_TOP, [0, 0.25, 0])} f={f - b.ck(0, 1)} mode="burst" count={14} radius={0.5} size={0.05} seed={21} color="#fff6e0" intensity={2.2} />
      <Glow pos={MID} size={1.4} color="#fff3dc" intensity={ask * 0.5} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const mid = project2(shot, add3(MID, [0, 0.45, 0]));
  return (
    <>
      <Layer x={SAFE_CX} y={580} k={reveal(f, b.ck(0, 1) - 2)}>
        <DrinkChip kind="latte" size={52} />
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 0) - 2)}>
        <DrinkChip kind="milk" size={54} />
      </Layer>
      <Layer x={mid.x} y={Math.max(mid.y, 800)} k={1} rise={0}>
        <Thump text="？" f={f} at={b.ck(0, 2) + 2} size={230} />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "何が違う？",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  bloom: () => 0.32,
};
