import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { teaSurface } from "../../golden2/three/models";
import { Steam } from "../../paradise/three/fx";
import { MilkCup, Pitcher, PitcherPose } from "../../royalmilk/three/kitchen";
import { LIQUID, PourStream, pourSlice } from "../../royalmilk/three/liquid";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { MILK, RingStat, TEA_COLOR } from "../labels";
import { Tin } from "../three/tins";
import { CUP, CUP_FULL, MILK_TEA_DEEP, morning, TEA_DARK } from "./set";
import { SceneDefP } from "../types";

// Line 0: the same strong cup; milk pours in, clouds out and settles to a deep milk-tea brown (the tea taste
// stays). Line 1: the camera pulls back so cup and the two tins sit high; a ring fills to 85% underneath.
const milkPour = (b: Beat) => ({ start: b.ck(0, 0) + 2, dur: 30 });

const JUG_REST: V3 = [1.9, 2.1, 0.3];
const JUG_TIP: V3 = [0.32, 1.3, 0.05];
const jugPose = (b: Beat): PitcherPose => {
  const m = milkPour(b);
  const enter = ease(b.f, 0, m.start, EASE.out);
  const leave = ease(b.f, m.start + m.dur, 16, EASE.in);
  const tilt = lerp(0.1, 0.85, ease(b.f, m.start - 5, 8, EASE.out)) - 0.75 * leave;
  return { tip: lerp3(lerp3(JUG_REST, JUG_TIP, enter), JUG_REST, leave), tilt, yaw: Math.PI, scale: 1.05 };
};

const CLOSE: Shot2 = { pos: [0.3, 3.9, 8.5], target: [0, 0.45, 0], fov: 30, focus: [0, 0.65, 0], aperture: 7 };
const PULL: Shot2 = { pos: [0, 4.5, 11.8], target: [0, -0.55, 0], fov: 30, focus: [0, 0.6, -0.1], aperture: 3 };

const milkShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { ...CLOSE, pos: [0.2, 3.9, 8.9] }],
      [b.ck(0, 1), CLOSE, 60],
      [b.ck(1, 0) - 10, PULL, 36],
    ]),
    b.f,
  );

const MilkWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const m = milkPour(b);
  const fill = CUP_FULL - 0.06 + 0.06 * ease(f, m.start + 3, m.dur, EASE.inOut);
  const surface = teaSurface(CUP, fill);
  const spread = ease(f, m.start + 4, 40, EASE.out);
  const mix = ease(f, b.ck(0, 1), 50, EASE.inOut) * 0.95;
  const swirl = ease(f, m.start, 140, EASE.out) * 6;
  const jug = jugPose(b);
  const tins = ease(f, b.ck(1, 2) - 4, 10, EASE.out);
  return (
    <>
      <MilkCup pose={CUP} fill={fill} s={{ from: TEA_DARK, to: MILK_TEA_DEEP, spread, mix, swirl, glow: 0.14 }} />
      <Pitcher pose={jug} />
      <PourStream from={add3(jug.tip, [-0.03, -0.02, 0])} to={add3(surface, [0.12, 0, 0])} color={LIQUID.milk} radius={0.045} f={f} bend={0.1} {...pourSlice(f, m.start, m.dur)} />
      <Steam base={surface} f={f} width={0.32} opacity={0.8} />
      <Tin kind="eb" pos={[-1.15, 0, -0.9]} scale={0.6 * tins} glow={0.1} yaw={0.3} />
      <Tin kind="earl" pos={[1.15, 0, -0.9]} scale={0.6 * tins} glow={0.1} yaw={-0.3} />
    </>
  );
};

const MilkOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ck(1, 0) - 8;
  return (
    <>
      <Layer x={SAFE_CX} y={1350} k={reveal(f, b.ck(0, 1) - 2, b.ck(0, 3) - 4)}>
        <Chip text="紅茶の味わいが残る" size={54} accent={TEA_COLOR.eb} />
      </Layer>
      <Layer x={SAFE_CX} y={1350} k={reveal(f, b.ck(0, 3) - 2, out0)}>
        <Chip text="ミルクティーにも ◎" size={54} accent={MILK} />
      </Layer>
      <Layer x={SAFE_CX} y={1160} k={reveal(f, b.ck(1, 2) - 2)}>
        <RingStat f={f} at={b.ck(1, 6) - 2} pct={85} top={"イングリッシュブレックファスト・\nアールグレイを飲む人の"} bottom="ミルクを入れる" bottomAt={b.ck(1, 7) - 2} />
      </Layer>
    </>
  );
};

export const MILK_SCENE: SceneDefP = {
  topic: "ミルクとの相性",
  shot: milkShot,
  World: MilkWorld,
  Overlay: MilkOverlay,
  bloom: () => 0.3,
  light: () => morning([0, 0.6, 0]),
};
