import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { CupPose, PotPose, Teapot, teaSurface } from "../../golden2/three/models";
import { Aroma, Sparkles, Steam } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { MILK_ACCENT } from "../labels";
import { MilkCup, Pitcher, PitcherPose } from "../three/kitchen";
import { LIQUID, PourStream, pourSlice } from "../three/liquid";
import { SceneDefP } from "../types";

// Line 1: an empty cup; tea pours in from the pot (淹れた紅茶に), then the milk jug pours afterwards and a white
// cloud spirals out on the surface (あとからミルクを注ぐだけ).
// Line 2: it blends to caramel and two amber scent ribbons rise straight up (香りがすっきり立つ).
const CUP: CupPose = { pos: [0, 0, 0], scale: 1, yaw: Math.PI + 0.5 };
const FULL = 0.74;

const teaPour = (b: Beat) => ({ start: b.ck(0, 0) + 8, dur: b.ck(0, 2) - b.ck(0, 0) - 10 });
const milkPour = (b: Beat) => ({ start: b.ck(0, 3) - 3, dur: 26 });

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
  const leave = ease(b.f, t.start + t.dur, 18, EASE.in);
  const tilt = lerp(0.15, 0.62, ease(b.f, t.start - 6, 10, EASE.out)) - 0.47 * leave;
  return { tip: lerp3(lerp3(POT_REST, POT_TIP, enter), POT_REST, leave), tilt, scale: 0.45, yaw: -0.25 };
};

const JUG_REST: V3 = [1.9, 2.1, 0.3];
const JUG_TIP: V3 = [0.32, 1.3, 0.05];
const jugPose = (b: Beat): PitcherPose => {
  const m = milkPour(b);
  const enter = ease(b.f, b.ck(0, 2) - 4, m.start - b.ck(0, 2), EASE.out);
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
  const mix = ease(f, b.ck(1, 0) - 14, 40, EASE.inOut) * 0.92;
  const swirl = ease(f, m.start, 120, EASE.out) * 6;
  const pot = potPose(b);
  const jug = jugPose(b);
  const teaS = pourSlice(f, t.start, t.dur);
  const milkS = pourSlice(f, m.start, m.dur);
  return (
    <>
      <MilkCup pose={CUP} fill={fill} s={{ from: LIQUID.tea, to: LIQUID.milkTea, spread, mix, swirl, glow: 0.14 }} />
      <Teapot pose={pot} />
      <PourStream from={pot.tip} to={add3(surface, [-0.05, 0, 0])} color="#8a3a10" radius={0.035} f={f} bend={0.15} {...teaS} />
      <Pitcher pose={jug} />
      <PourStream from={add3(jug.tip, [-0.03, -0.02, 0])} to={add3(surface, [0.12, 0, 0])} color={LIQUID.milk} radius={0.04} f={f} bend={0.1} {...milkS} />
      <Steam base={surface} f={f} width={0.35} opacity={0.9 * ease(f, t.start, 30)} />
      <Aroma
        from={add3(surface, [0, 0.02, 0])}
        f={f}
        colors={["#f0a04b", "#ffd28a"]}
        grow={ease(f, b.ck(1, 0) - 4, 40, EASE.out)}
        intensity={0.55}
        height={1.5}
        radius={0.18}
      />
      <Sparkles center={add3(surface, [0, 0.9, 0])} f={f - b.ck(1, 1)} mode="burst" count={12} radius={0.5} size={0.05} seed={33} color="#ffe2b0" intensity={2} />
    </>
  );
};

const MilkOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const end = b.ck(1, 1) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={580} k={reveal(f, b.ck(0, 0) - 2)}>
        <Headline text="ミルクティー" size={96} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 0) + 14} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 3), end)}>
        <Chip text="紅茶 ＋ あとからミルク" size={54} accent={MILK_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 1))}>
        <Chip text="香りすっきり" size={58} accent={MILK_ACCENT} />
      </Layer>
    </>
  );
};

export const MILK: SceneDefP = {
  topic: "ふつうのミルクティー",
  shot: milkShot,
  World: MilkWorld,
  Overlay: MilkOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
