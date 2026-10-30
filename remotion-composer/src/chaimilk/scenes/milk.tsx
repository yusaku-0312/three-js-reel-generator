import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { CupPose, PotPose, Teapot, teaSurface } from "../../golden2/three/models";
import { Sparkles, Steam } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { StepChip } from "../labels";
import { MilkCup, Pitcher, PitcherPose } from "../../royalmilk/three/kitchen";
import { LIQUID, PourStream, pourSlice } from "../../royalmilk/three/liquid";
import { SceneDefP } from "../types";

// Line 3: an empty cup; tea pours in from the pot (お湯で淹れた紅茶に), then the milk jug pours afterwards and a
// white cloud spirals out (あとから ミルクを足します). Same choreography as royalmilk's milk scene.
const CUP: CupPose = { pos: [0, 0, 0], scale: 1, yaw: Math.PI + 0.5 };
const FULL = 0.74;

const teaPour = (b: Beat) => ({ start: b.ck(0, 1) - 4, dur: b.ck(0, 2) - b.ck(0, 1) - 4 });
const milkPour = (b: Beat) => ({ start: b.ck(0, 3) - 2, dur: 26 });

const fillOf = (b: Beat) => {
  const t = teaPour(b);
  const m = milkPour(b);
  return lerp(0, FULL - 0.1, ease(b.f, t.start + 3, t.dur, EASE.inOut)) + 0.1 * ease(b.f, m.start + 3, m.dur, EASE.inOut);
};

const POT_REST: V3 = [-1.9, 2.3, -0.2];
const POT_TIP: V3 = [-0.28, 1.55, 0];
const potPose = (b: Beat): PotPose => {
  const t = teaPour(b);
  const enter = ease(b.f, 0, t.start - 2, EASE.out);
  const leave = ease(b.f, t.start + t.dur, 14, EASE.in);
  const tilt = lerp(0.15, 0.62, ease(b.f, t.start - 6, 10, EASE.out)) - 0.47 * leave;
  return { tip: lerp3(lerp3(POT_REST, POT_TIP, enter), POT_REST, leave), tilt, scale: 0.45, yaw: -0.25 };
};

const JUG_REST: V3 = [1.9, 2.1, 0.3];
const JUG_TIP: V3 = [0.32, 1.3, 0.05];
const jugPose = (b: Beat): PitcherPose => {
  const m = milkPour(b);
  const enter = ease(b.f, b.ck(0, 2) - 10, m.start - b.ck(0, 2) + 10, EASE.out);
  const leave = ease(b.f, m.start + m.dur, 16, EASE.in);
  const tilt = lerp(0.1, 0.85, ease(b.f, m.start - 5, 8, EASE.out)) - 0.75 * leave;
  return { tip: lerp3(lerp3(JUG_REST, JUG_TIP, enter), JUG_REST, leave), tilt, yaw: Math.PI, scale: 1.05 };
};

const milkShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.3, 3.7, 7.8], target: [0, 0.95, 0], fov: 30, focus: [0, 0.6, 0], aperture: 7 }],
      [b.ck(0, 1), { pos: [0.25, 3.4, 7.2], target: [0, 0.9, 0], fov: 30, focus: [0, 0.6, 0], aperture: 7 }, 70],
    ]),
    b.f,
  );

const MilkWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const fill = fillOf(b);
  const surface = teaSurface(CUP, Math.max(fill, 0.05));
  const t = teaPour(b);
  const m = milkPour(b);
  const spread = ease(f, m.start + 4, 40, EASE.out);
  const swirl = ease(f, m.start, 120, EASE.out) * 6;
  const pot = potPose(b);
  const jug = jugPose(b);
  return (
    <>
      <MilkCup pose={CUP} fill={fill} s={{ from: LIQUID.tea, to: LIQUID.milkTea, spread, mix: 0, swirl, glow: 0.14 }} />
      <Teapot pose={pot} />
      <PourStream from={pot.tip} to={add3(surface, [-0.05, 0, 0])} color="#8a3a10" radius={0.035} f={f} bend={0.15} {...pourSlice(f, t.start, t.dur)} />
      <Pitcher pose={jug} />
      <PourStream from={add3(jug.tip, [-0.03, -0.02, 0])} to={add3(surface, [0.12, 0, 0])} color={LIQUID.milk} radius={0.04} f={f} bend={0.1} {...pourSlice(f, m.start, m.dur)} />
      <Steam base={surface} f={f} width={0.35} opacity={0.9 * ease(f, t.start, 30)} />
      <Sparkles center={add3(surface, [0, 0.5, 0])} f={f - (m.start + 18)} mode="burst" count={10} radius={0.45} size={0.05} seed={33} color="#ffe2b0" intensity={2} />
    </>
  );
};

const MilkOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={580} k={reveal(f, b.ck(0, 0) - 2)}>
        <Headline text="ミルクティー" size={96} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 0) + 14} />
      </Layer>
      <Layer x={SAFE_CX} y={1235} k={reveal(f, b.ck(0, 1))}>
        <StepChip n="1" text="お湯で紅茶をいれる" size={46} />
      </Layer>
      <Layer x={SAFE_CX} y={1345} k={reveal(f, b.ck(0, 2))}>
        <StepChip n="2" text="あとからミルク" size={46} />
      </Layer>
    </>
  );
};

export const MILK: SceneDefP = {
  topic: "ミルクティーは",
  shot: milkShot,
  World: MilkWorld,
  Overlay: MilkOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
