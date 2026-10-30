import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { CupPose, PotPose, Teapot, teaSurface } from "../../golden2/three/models";
import { Steam } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { KURENAI, LEAF_BLACK, Mark, SwatchChip } from "../labels";
import { WhiteCup } from "../three/liquid";
import { LeafHeap } from "../three/props";
import { PourStream, pourSlice } from "../../royalmilk/three/liquid";
import { LOOK } from "./set";
import { SceneDefP } from "../types";

// Line 1: a dish of dry black leaves (茶葉の色ではなく → ✕) and an empty white cup; the pot pours and the cup
// fills with clear red tea (淹れたお茶の色から → ◯).
const DISH: V3 = [-0.3, 0, 0.6];
const CUP: CupPose = { pos: [0.5, 0, -0.5], scale: 0.9, yaw: Math.PI + 0.4 };
const FULL = 0.8;

const pour = (b: Beat) => ({ start: b.ck(0, 2) - 2, dur: 34 });

const POT_REST: V3 = [2.2, 2.6, -0.6];
const POT_TIP: V3 = [0.75, 1.4, -0.5];
const potPose = (b: Beat): PotPose => {
  const p = pour(b);
  const enter = ease(b.f, p.start - 16, 14, EASE.out);
  const leave = ease(b.f, p.start + p.dur, 16, EASE.in);
  const tilt = lerp(0.15, 0.62, ease(b.f, p.start - 4, 8, EASE.out)) - 0.47 * leave;
  return { tip: lerp3(lerp3(POT_REST, POT_TIP, enter), POT_REST, leave), tilt, scale: 0.45, yaw: Math.PI };
};

const nameShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0, 4.2, 7.8], target: [0.1, 0.35, 0], fov: 30, focus: DISH, aperture: 5 }],
      [0, { pos: [-0.1, 4.0, 7.3], target: [0.05, 0.35, 0.05], fov: 30, focus: DISH, aperture: 6 }, 80],
      [b.ck(0, 2) - 10, { pos: [0.25, 3.9, 6.9], target: [0.3, 0.45, -0.2], fov: 30, focus: teaSurface(CUP, FULL), aperture: 6 }, 45],
    ]),
    b.f,
  );

const NameWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const p = pour(b);
  const fill = FULL * ease(f, p.start + 3, p.dur, EASE.inOut);
  const surface = teaSurface(CUP, Math.max(fill, 0.05));
  const pot = potPose(b);
  return (
    <>
      <LeafHeap pos={DISH} radius={0.4} height={0.22} />
      <WhiteCup pose={CUP} fill={fill} look={{ clear: 0.75, glow: 0.12, ring: 0.6 }} f={f} />
      <Teapot pose={pot} />
      <PourStream from={pot.tip} to={add3(surface, [0.05, 0, 0])} color="#b8361a" radius={0.035} f={f} bend={0.15} {...pourSlice(f, p.start, p.dur)} />
      <Steam base={surface} f={f} width={0.35} opacity={0.9 * ease(f, p.start + 10, 30)} />
    </>
  );
};

const NameOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const dish = project2(shot, add3(DISH, [0, 0.35, 0]));
  const cup = project2(shot, add3(teaSurface(CUP, FULL), [0, 0.5, 0]));
  const leafAt = b.ck(0, 1);
  const teaAt = b.ck(0, 2) + 6;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0) - 2, b.ck(0, 2) - 8)}>
        <Headline text="名前の由来" size={96} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 0) + 12} />
      </Layer>
      <Layer x={Math.max(330, dish.x)} y={Math.min(dish.y - 40, 1300)} k={reveal(f, leafAt - 2, teaAt - 10)}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SwatchChip text="茶葉の色" color={LEAF_BLACK} size={52} />
          <Mark kind="ng" f={f} at={leafAt + 18} size={110} />
        </div>
      </Layer>
      <Layer x={Math.min(Math.max(cup.x, 360), 720)} y={Math.max(cup.y - 60, 600)} k={reveal(f, teaAt)}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SwatchChip text="お茶の色" color={KURENAI} size={56} />
          <Mark kind="ok" f={f} at={b.ck(0, 3)} size={110} />
        </div>
      </Layer>
    </>
  );
};

export const NAME: SceneDefP = {
  topic: "名前は「お茶の色」から",
  shot: nameShot,
  World: NameWorld,
  Overlay: NameOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
