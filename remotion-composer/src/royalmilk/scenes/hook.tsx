import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { teaSurface } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Layer, reveal, SAFE_CX } from "../overlays";
import { DrinkChip, NotEqual } from "../labels";
import { MilkCup } from "../three/kitchen";
import { CUP_FILL, MILK_CUP, MILK_DONE, ROYAL_CUP, ROYAL_DONE } from "./set";
import { SceneDefP } from "../types";

// Line 0: two cups that look alike — royal (back right) glints with a crown sparkle, milk tea (front left)
// swirls; at 「全くの別物」 a ≠ thumps in between them.
export const MILK_TOP = teaSurface(MILK_CUP, CUP_FILL);
export const ROYAL_TOP = teaSurface(ROYAL_CUP, CUP_FILL);
const MID: V3 = [(MILK_TOP[0] + ROYAL_TOP[0]) / 2, 0.55, (MILK_TOP[2] + ROYAL_TOP[2]) / 2];

const hookShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0, 3.5, 9.0], target: [0, 0.35, 0], fov: 30, focus: [0, 0.4, 0], aperture: 5 }],
      [0, { pos: [0, 3.1, 7.8], target: [0, 0.36, 0], fov: 30, focus: [0, 0.4, 0], aperture: 6 }, 130],
    ]),
    b.f,
  );

/** The two finished cups with steam; shared with the outro. */
export const TwoCups: React.FC<{ f: number; milkSwirl: number; milkOffset?: V3; royalOffset?: V3 }> = ({
  f,
  milkSwirl,
  milkOffset = [0, 0, 0],
  royalOffset = [0, 0, 0],
}) => {
  const milk = { ...MILK_CUP, pos: add3(MILK_CUP.pos, milkOffset) };
  const royal = { ...ROYAL_CUP, pos: add3(ROYAL_CUP.pos, royalOffset) };
  return (
    <>
      <MilkCup pose={milk} fill={CUP_FILL} s={{ ...MILK_DONE, swirl: milkSwirl }} />
      <MilkCup pose={royal} fill={CUP_FILL} s={ROYAL_DONE} />
      <Steam base={teaSurface(milk, CUP_FILL)} f={f} width={0.3} opacity={1.0} seed={3} />
      <Steam base={teaSurface(royal, CUP_FILL)} f={f + 30} width={0.3} opacity={1.0} seed={6} />
    </>
  );
};

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const crown = ease(f, b.ck(0, 0), 6, EASE.out) * (1 - ease(f, b.ck(0, 0) + 14, 18, EASE.in));
  const swirl = 1.5 + ease(f, b.ck(0, 1) - 4, 50, EASE.inOut) * 3;
  const split = ease(f, b.ck(0, 3) - 2, 10, EASE.out) * (1 - ease(f, b.ck(0, 3) + 12, 14, EASE.in));
  return (
    <>
      <TwoCups f={f} milkSwirl={swirl} />
      <Glow pos={add3(ROYAL_TOP, [0, 0.35, 0])} size={1.1} color="#ffd98a" intensity={crown * 0.9} />
      <Sparkles center={add3(ROYAL_TOP, [0, 0.35, 0])} f={f - b.ck(0, 0)} mode="burst" count={14} radius={0.6} size={0.06} seed={21} color="#fff0c0" intensity={2.2} />
      <Glow pos={MID} size={1.4} color="#fff3dc" intensity={split * 0.7} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const mid = project2(shot, add3(MID, [0, 0.25, 0]));
  return (
    <>
      <Layer x={SAFE_CX} y={575} k={reveal(f, b.ck(0, 0) - 2)}>
        <DrinkChip kind="royal" size={50} />
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 1) - 2)}>
        <DrinkChip kind="milk" size={54} />
      </Layer>
      <Layer x={mid.x} y={mid.y} k={1} rise={0}>
        <NotEqual f={f} at={b.ck(0, 3) + 2} size={240} />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "似ているけど別物",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  bloom: () => 0.32,
};
