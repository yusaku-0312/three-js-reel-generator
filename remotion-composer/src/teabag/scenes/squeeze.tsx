import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Cup } from "../../golden2/three/models";
import { Glow } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { PopChip, STRONG, Swatch } from "../labels";
import { bagBottom, DARK_TEA, DarkDrips, dripRipple, DripSpec, TeaBag } from "../three/teabag";
import { CUP, FILL, hang, heldTag, HERO, SURFACE, TEA_DARKER } from "./set";
import { SceneDefP } from "../types";

// Line 0 (flash in): close on the wet bag over the cup; at 「茶葉の周りに」 it glows red-brown from inside
// (the strong tea held around the leaves); at 「押し出され」 it is squeezed flat and a run of dark drops falls,
// the camera easing down to show them land. Line 1: the bag lets go and the camera pulls back for 「ここに誤解！」.
const BAG_MACRO: Shot2 = { pos: [0.3, 2.2, 5.2], target: [0, 1.0, 0], fov: 30, focus: [0, 1.05, 0.1], aperture: 7 };
const DRIP_SHOT: Shot2 = { pos: [0.3, 2.6, 6.6], target: [0, 0.7, 0], fov: 30, focus: [0, 0.85, 0], aperture: 5 };

const squeezeShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { ...BAG_MACRO, pos: [0.3, 2.25, 5.6] }],
      [0, BAG_MACRO, b.ck(0, 5)],
      [b.ck(0, 5), DRIP_SHOT, 40],
      [b.ln(1), HERO, 40],
    ]),
    b.f,
  );

const SqueezeWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const squeeze = ease(f, b.ck(0, 5) - 2, 10, EASE.out) * (1 - ease(f, b.ln(1), 12, EASE.inOut));
  const inner = ease(f, b.ck(0, 2) - 2, 16, EASE.out) * (1 - 0.6 * ease(f, b.ck(0, 6), 30, EASE.inOut));
  const pose = hang(f, undefined, 1 - 0.7 * squeeze);
  const drip: DripSpec = { from: bagBottom(pose, squeeze), toY: SURFACE[1], start: b.ck(0, 5) + 2, count: 9, every: 7 };
  const dark = TEA_DARKER * (0.5 + 0.5 * ease(f, b.ck(0, 5) + 10, 60, EASE.inOut));
  return (
    <>
      <Cup pose={CUP} fill={FILL} dark={dark} ripple={dripRipple(f, [drip], 0.045)} />
      <TeaBag pose={pose} tag={heldTag(pose)} squeeze={squeeze} wet={1} inner={inner * 0.18} f={f} />
      <Glow pos={add3(pose.pos, [0, -0.05, 0.12])} size={0.9} color="#d0581c" intensity={0.35 * inner} />
      <DarkDrips f={f} d={drip} size={0.055} />
    </>
  );
};

const SqueezeOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ln(1) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 2) - 2, b.ck(0, 6) - 4)} rise={0}>
        <PopChip f={f} at={b.ck(0, 2) - 2} text="茶葉のまわりの 濃い紅茶" size={50} accent={STRONG}>
          <Swatch color={DARK_TEA} />
        </PopChip>
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 6) - 2, out0)} rise={0}>
        <PopChip f={f} at={b.ck(0, 6) - 2} text="渋み・苦味が 強く感じる" size={50} accent={STRONG} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(1, 1) - 2)}>
        <Headline text="ここに誤解！" size={110} f={f} at={b.ck(1, 1) - 2} sweepAt={b.ck(1, 2)} />
      </Layer>
    </>
  );
};

export const SQUEEZE: SceneDefP = {
  topic: "絞るとどうなる？",
  shot: squeezeShot,
  World: SqueezeWorld,
  Overlay: SqueezeOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
