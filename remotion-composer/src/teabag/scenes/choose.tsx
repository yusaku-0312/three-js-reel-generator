import React from "react";
import { add3, Beat, lerp, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Cup, CupPose, teaSurface } from "../../golden2/three/models";
import { Sparkles, Steam } from "../../paradise/three/fx";
import { Pitcher, PitcherPose } from "../../royalmilk/three/kitchen";
import { LIQUID, PourStream, pourSlice } from "../../royalmilk/three/liquid";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { LIGHT, PopChip, SteepRing, STRONG, Swatch } from "../labels";
import { bagBottom, BagPose, DarkDrips, dripRipple, DripSpec, TeaBag } from "../three/teabag";
import { CUP, hang, heldTag, lifted, restIn } from "./set";
import { squeezeAt } from "./hook";
import { SceneDefP } from "../types";

// Line 0 (flash in): two cups, pale amber front-left and deep red-brown back-right, a bag in each; at
// 「取り出す」 the front bag is lifted straight out, unsqueezed. Line 1: the back bag comes up and is squeezed
// lightly; a few drops darken that cup. Line 2 (new set through the flash): one cup with a bag in it, hot water
// poured from a steel jug at 「お湯の量」, a timer ring at 「蒸らし時間」.
const SMALL = 0.6;
export const LEFT: CupPose = { pos: [-0.55, 0, 0.5], scale: SMALL, yaw: Math.PI + 0.5 };
export const RIGHT: CupPose = { pos: [0.55, 0, -0.5], scale: SMALL, yaw: Math.PI + 0.5 };
const FILL = 0.74;
const restL = restIn(LEFT);
const restR = restIn(RIGHT);
const hangOver = (cup: CupPose, f: number): BagPose => ({ ...hang(f, add3(cup.pos, [0, (0.805 + 0.48) * (cup.scale ?? 1), 0]), 0.6), scale: restL.pose.scale });

const TWO: Shot2 = { pos: [0.2, 3.7, 9.2], target: [0, 0.35, 0], fov: 30, focus: [0, 0.5, 0], aperture: 3 };
const RIGHT_IN: Shot2 = { pos: [0.35, 3.55, 8.8], target: [0.15, 0.42, -0.15], fov: 30, focus: add3(RIGHT.pos, [0, 0.7, 0]), aperture: 4 };
const POUR: Shot2 = { pos: [0.4, 3.2, 8.4], target: [0.2, 0.55, 0], fov: 30, focus: [0, 0.6, 0], aperture: 4 };

const chooseShot = (b: Beat): Shot2 => {
  if (b.f < b.ln(2) - 4) return breathe(keys2(b.f, [[0, { ...TWO, pos: [0.2, 3.8, 9.6] }], [0, TWO, 80], [b.ln(1), RIGHT_IN, 50]]), b.f);
  return breathe(keys2(b.f, [[0, { ...POUR, pos: [0.4, 3.3, 8.9] }], [0, POUR, 90]]), b.f);
};

const pourOf = (b: Beat) => ({ start: b.ck(2, 3) - 4, dur: 34 });
const JUG_REST: V3 = [1.9, 1.9, 0.3];
const JUG_TIP: V3 = [0.3, 1.05, 0.08];
const jugPose = (b: Beat): PitcherPose => {
  const m = pourOf(b);
  const enter = ease(b.f, b.ln(2), m.start - b.ln(2), EASE.out);
  const leave = ease(b.f, m.start + m.dur, 16, EASE.in);
  const tilt = lerp(0.1, 0.85, ease(b.f, m.start - 5, 8, EASE.out)) - 0.75 * leave;
  const tip: V3 = [lerp(JUG_REST[0], JUG_TIP[0], enter - leave), lerp(JUG_REST[1], JUG_TIP[1], enter - leave), lerp(JUG_REST[2], JUG_TIP[2], enter - leave)];
  return { tip, tilt, yaw: Math.PI, scale: 0.95 };
};

const TwoCups: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const outL = ease(f, b.ck(0, 5) - 2, 22, EASE.inOut);
  const bagL = lifted(restL, add3(LEFT.pos, [0, 3.2, 0]), outL);
  const upR = ease(f, b.ck(1, 1), 18, EASE.inOut);
  const hR = hangOver(RIGHT, f);
  const bagR = upR < 1 ? lifted(restR, hR.pos, upR) : { pose: hR, tag: heldTag(hR), via: undefined };
  const squeeze = squeezeAt(f, b.ck(1, 5) - 2, 0.5, 16);
  const drip: DripSpec = { from: bagBottom(bagR.pose, squeeze), toY: teaSurface(RIGHT, FILL)[1], start: b.ck(1, 5) + 4, count: 4, every: 9 };
  const darkR = 0.12 + 0.18 * ease(f, b.ck(1, 5) + 8, 40, EASE.inOut);
  return (
    <>
      <Cup pose={LEFT} fill={FILL} pale={0.85} glow={0.15 * ease(f, b.ck(0, 1), 14, EASE.out)} />
      <Cup pose={RIGHT} fill={FILL} dark={darkR} ripple={dripRipple(f, [drip])} />
      {outL < 0.98 && <TeaBag pose={bagL.pose} tag={bagL.tag} via={bagL.via} wet={1} f={f} />}
      <TeaBag pose={bagR.pose} tag={bagR.tag} via={bagR.via} squeeze={squeeze} wet={1} f={f} />
      <DarkDrips f={f} d={drip} size={0.045} />
      <Sparkles center={add3(teaSurface(LEFT, FILL), [0, 0.15, 0])} f={f - b.ck(0, 1)} mode="burst" count={10} radius={0.3} size={0.03} seed={51} color="#fff0c8" intensity={1.8} />
      <Sparkles center={add3(teaSurface(RIGHT, FILL), [0, 0.15, 0])} f={f - b.ck(1, 7)} mode="burst" count={10} radius={0.3} size={0.03} seed={52} color="#ffd28a" intensity={1.8} />
    </>
  );
};

const PourSet: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const m = pourOf(b);
  const fill = lerp(0.3, FILL, ease(f, m.start + 3, m.dur, EASE.inOut));
  const rest = restIn(CUP, fill);
  const surface = teaSurface(CUP, fill);
  const jug = jugPose(b);
  return (
    <>
      <Cup pose={CUP} fill={fill} pale={lerp(0.75, 0.25, ease(f, m.start, 110, EASE.inOut))} />
      <TeaBag pose={rest.pose} tag={rest.tag} via={rest.via} wet={1} f={f} />
      <Pitcher pose={jug} />
      <PourStream from={add3(jug.tip, [-0.03, -0.02, 0])} to={add3(surface, [0.14, 0, 0.05])} color={LIQUID.water} radius={0.04} f={f} bend={0.1} {...pourSlice(f, m.start, m.dur)} />
      <Steam base={surface} f={f} width={0.26} opacity={0.6} />
    </>
  );
};

const ChooseWorld: React.FC<{ b: Beat }> = ({ b }) => (b.f < b.ln(2) - 4 ? <TwoCups b={b} /> : <PourSet b={b} />);

const ChooseOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ln(1) - 4;
  const out1 = b.ln(2) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={1265} k={reveal(f, b.ck(0, 1) - 2, out0)} rise={0}>
        <PopChip f={f} at={b.ck(0, 1) - 2} text="すっきり派は" size={50} accent={LIGHT}>
          <Swatch color={LIGHT} />
        </PopChip>
      </Layer>
      <Layer x={SAFE_CX} y={1370} k={reveal(f, b.ck(0, 4) - 2, out0)} rise={0}>
        <PopChip f={f} at={b.ck(0, 4) - 2} text="絞らずに 取り出す" size={56} accent={LIGHT} />
      </Layer>
      <Layer x={SAFE_CX} y={1265} k={reveal(f, b.ck(1, 1) - 2, out1)} rise={0}>
        <PopChip f={f} at={b.ck(1, 1) - 2} text="濃い味が好きなら" size={50} accent={STRONG}>
          <Swatch color={STRONG} />
        </PopChip>
      </Layer>
      <Layer x={SAFE_CX} y={1370} k={reveal(f, b.ck(1, 5) - 2, out1)} rise={0}>
        <PopChip f={f} at={b.ck(1, 5) - 2} text="軽く絞るのも アリ" size={56} accent={STRONG} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(2, 1) - 2)}>
        <Headline text="コクを強くするなら" size={84} f={f} at={b.ck(2, 1) - 2} />
      </Layer>
      <Layer x={290} y={1250} k={reveal(f, b.ck(2, 3) - 2)} rise={0}>
        <PopChip f={f} at={b.ck(2, 3) - 2} text="お湯の量" size={54} accent="#9fc7d9" />
      </Layer>
      <Layer x={790} y={1210} k={reveal(f, b.ck(2, 4) - 2)} rise={0}>
        <SteepRing f={f} at={b.ck(2, 4)} dur={60} caption="蒸らし時間" size={160} />
      </Layer>
      <Layer x={SAFE_CX} y={1385} k={reveal(f, b.ck(2, 5) - 2)} rise={0}>
        <PopChip f={f} at={b.ck(2, 5) - 2} text="で 調整する" size={50} />
      </Layer>
    </>
  );
};

export const CHOOSE: SceneDefP = {
  topic: "好みで選ぶ",
  shot: chooseShot,
  World: ChooseWorld,
  Overlay: ChooseOverlay,
  dipIn: true,
  dipLines: [2],
  bloom: () => 0.3,
};
