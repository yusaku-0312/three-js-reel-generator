import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, keys2, Shot2 } from "../../golden2/shot";
import { CupPose, teaSurface } from "../../golden2/three/models";
import { Glow, Steam } from "../../paradise/three/fx";
import { pop } from "../../hightea/three/props";
import { Plate } from "../../cookietea/three/cookie";
import { MilkCup } from "../../royalmilk/three/kitchen";
import { Chip, Headline, Kicker, Layer, reveal, SAFE_CX } from "../overlays";
import { TEA_COLOR } from "../labels";
import { FriedEgg, Toast } from "../three/breakfast";
import { Tin } from "../three/tins";
import { MILK_TEA_DEEP, morning } from "./set";
import { SceneDefP } from "../types";

// Morning: a plate with two slices of toast and a fried egg, a cup of milk tea, the hero tin behind.
// Line 0: BREAKFAST = 朝食 and 「朝食に合う紅茶」. Line 1: toast and egg pop as named, then 「日常の一杯」.
const PLATE: V3 = [-0.3, 0, 0.3];
const BCUP: CupPose = { pos: [0.7, 0, -0.2], scale: 0.85, yaw: Math.PI + 0.6 };
const BCUP_FILL = 0.74;

const breakfastShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.1, 5.0, 11.0], target: [0, -0.1, 0], fov: 30, focus: [0, 0.2, 0.2], aperture: 3 }],
      [0, { pos: [0, 4.8, 10.6], target: [0, -0.1, 0], fov: 30, focus: [0, 0.2, 0.2], aperture: 3 }, b.dur],
    ]),
    b.f,
  );

const BreakfastWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const named = b.ck(1, 0);
  const egg = named + 14;
  const surface = teaSurface(BCUP, BCUP_FILL);
  return (
    <>
      <Plate pos={PLATE} scale={0.95} />
      <Toast pos={add3(PLATE, [-0.25, 0.05, -0.12])} yaw={0.35} scale={0.95} k={f < named - 2 ? 1 : pop(f, named - 2)} />
      <Toast pos={add3(PLATE, [-0.12, 0.13, 0.12])} yaw={-0.2} tilt={0.05} scale={0.95} k={f < named - 2 ? 1 : pop(f, named)} />
      <FriedEgg pos={add3(PLATE, [0.36, 0.05, 0.08])} scale={1.0} k={f < egg - 2 ? 1 : pop(f, egg - 2)} />
      <MilkCup pose={BCUP} fill={BCUP_FILL} s={{ from: MILK_TEA_DEEP, to: MILK_TEA_DEEP, spread: 0, mix: 1, glow: 0.14 }} />
      <Steam base={surface} f={f} width={0.28} opacity={0.75} />
      <Tin kind="eb" pos={[0.1, 0, -1.05]} scale={0.7} glow={0.12} />
      <Glow pos={[0.2, 1.4, -1.6]} size={4.2} color="#ffe39a" intensity={0.22} />
    </>
  );
};

const BreakfastOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ck(1, 0) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={1200} k={reveal(f, b.ck(0, 0), out0)}>
        <Kicker text="BREAKFAST ＝ 朝食" f={f} at={b.ck(0, 0)} size={46} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 1) - 2, out0)}>
        <Headline text="朝食に合う紅茶" size={104} f={f} at={b.ck(0, 1) - 2} sweepAt={b.ck(0, 1) + 12} />
      </Layer>
      <Layer x={360} y={1210} k={reveal(f, b.ck(1, 0) - 2)}>
        <Chip text="パン" size={50} accent="#e6b56a" />
      </Layer>
      <Layer x={680} y={1210} k={reveal(f, b.ck(1, 0) + 12)}>
        <Chip text="卵料理" size={50} accent="#f2a21a" />
      </Layer>
      <Layer x={SAFE_CX} y={1345} k={reveal(f, b.ck(1, 2) - 2)}>
        <Chip text="日常の一杯" size={60} accent={TEA_COLOR.eb} />
      </Layer>
    </>
  );
};

export const BREAKFAST: SceneDefP = {
  topic: "朝食との相性",
  shot: breakfastShot,
  World: BreakfastWorld,
  Overlay: BreakfastOverlay,
  dipIn: true,
  bloom: () => 0.32,
  light: () => morning([0, 0.3, 0.2]),
};
