import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { CupPose, teaSurface } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CHAI_ACCENT } from "../labels";
import { MilkCup } from "../../royalmilk/three/kitchen";
import { LIQUID } from "../../royalmilk/three/liquid";
import { LeafHeap } from "../../kurenai/three/props";
import { CtcHeap, FallingGrains } from "../three/parts";
import { SceneDefP } from "../types";

// Line 6: two small dishes — ordinary twisted leaves back left, CTC granules front right; the CTC heap glows and
// the camera pushes into it (粒のように細かい茶葉). Line 7: granules drop into a cup of hot water back right and it
// turns dark almost at once (短い時間で しっかり濃く出る).
const LEAF: V3 = [-0.75, 0, -0.45];
const CTC: V3 = [0.3, 0, 0.45];
const CUP: CupPose = { pos: [1.25, 0, -1.35], scale: 0.8, yaw: Math.PI + 0.4 };
const CUP_FILL = 0.7;
const CUP_TOP = teaSurface(CUP, CUP_FILL);
const HOT_WATER = "#c99a5e";

const ctcShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.1, 3.4, 5.6], target: [-0.1, 0.15, 0], fov: 30, focus: [0, 0.1, 0], aperture: 6 }],
      [b.ck(0, 3) - 6, { pos: [0.3, 2.3, 3.0], target: [0.3, 0.12, 0.42], fov: 30, focus: add3(CTC, [0, 0.1, 0]), aperture: 10 }, 40],
      [b.ln(1) - 6, { pos: [1.1, 2.7, 2.3], target: [1.1, 0.45, -1.2], fov: 30, focus: CUP_TOP, aperture: 9 }, 36],
    ]),
    b.f,
  );

const CtcWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const glow = ease(f, b.ck(0, 2), 10, EASE.out) * (1 - ease(f, b.ln(1), 20));
  const dropAt = b.ck(1, 0);
  const brew = ease(f, dropAt + 8, b.ck(1, 1) - dropAt + 10, EASE.out);
  return (
    <>
      <LeafHeap pos={LEAF} radius={0.36} height={0.16} count={120} />
      <CtcHeap pos={CTC} radius={0.4} height={0.17} glow={glow} />
      <Glow pos={add3(CTC, [0, 0.25, 0])} size={0.9} color="#ffcf8a" intensity={glow * 0.45} />
      <Sparkles center={add3(CTC, [0, 0.2, 0])} f={f - b.ck(0, 2)} mode="burst" count={10} radius={0.4} size={0.04} seed={12} color="#fff0c8" intensity={1.8} />
      <MilkCup pose={CUP} fill={CUP_FILL} s={{ from: HOT_WATER, to: LIQUID.tea, spread: 0, mix: brew, swirl: brew * 5, glow: 0.12 }} />
      <Steam base={CUP_TOP} f={f} width={0.3} opacity={0.8} seed={4} />
      <FallingGrains from={add3(CUP_TOP, [0, 1.4, 0])} to={CUP_TOP} f={f} at={dropAt - 4} />
    </>
  );
};

const CtcOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out = b.ln(1) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(0, 0), b.ck(0, 2) - 4)}>
        <Chip text="インドの屋台" size={56} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(0, 2) - 2, out)}>
        <Headline text="CTC" size={170} f={f} at={b.ck(0, 2) - 2} sweepAt={b.ck(0, 2) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 3), out)}>
        <Chip text="粒のような茶葉" size={54} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(1, 0))}>
        <Chip text="短い時間で" size={56} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 1))}>
        <Headline text="しっかり濃く" size={96} f={f} at={b.ck(1, 1)} sweepAt={b.ck(1, 1) + 12} />
      </Layer>
    </>
  );
};

export const CTC_SCENE: SceneDefP = {
  topic: "屋台の茶葉",
  shot: ctcShot,
  World: CtcWorld,
  Overlay: CtcOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
