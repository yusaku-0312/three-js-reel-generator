import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Cup } from "../../golden2/three/models";
import { Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { PopChip, STRONG, Swatch, TANNIN, TanninIcon } from "../labels";
import { bagBottom, DarkDrips, dripRipple, DripSpec, TeaBag } from "../three/teabag";
import { CUP, FILL, hang, heldTag, HERO, SURFACE, TEA_DARKER } from "./set";
import { SceneDefP } from "../types";

// Line 0: closer on the bag; at 「絞ってはいけないと」 it is squeezed hard and dark drops keep falling, the tea
// darkening; chips 渋み / 苦味 pop, then 「が強くなる」. Line 1 (new set through the flash): close on the tea
// surface, which glows amber (タンニン) with the icon chip 「渋みのもと」.
const BAG_CLOSE: Shot2 = { pos: [0.25, 2.7, 7.0], target: [0, 0.75, 0], fov: 30, focus: [0, 1.0, 0], aperture: 5 };
const TEA_CLOSE: Shot2 = { pos: [0.2, 2.9, 4.4], target: [0, 0.25, 0], fov: 30, focus: SURFACE, aperture: 7 };
const TEA_IN: Shot2 = { ...TEA_CLOSE, pos: [0.2, 2.7, 4.0] };

const whyShot = (b: Beat): Shot2 => {
  if (b.f < b.ln(1) - 4) return breathe(keys2(b.f, [[0, HERO], [0, BAG_CLOSE, 50]]), b.f);
  return breathe(keys2(b.f, [[0, TEA_CLOSE], [b.ck(1, 1), TEA_IN, 80]]), b.f);
};

const squeezeOf = (b: Beat) => 0.9 * ease(b.f, b.ck(0, 2), 12, EASE.out) * (1 - ease(b.f, b.ln(1) - 16, 10, EASE.inOut));

const WhyWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (f >= b.ln(1) - 4) {
    const glow = ease(f, b.ck(1, 1) - 2, 20, EASE.out);
    return (
      <>
        <Cup pose={CUP} fill={FILL} dark={TEA_DARKER} glow={glow * 0.9} ripple={{ t: (f - b.ck(1, 1)) / 30, amp: 0.04 }} />
        <Sparkles center={add3(SURFACE, [0, 0.18, 0])} f={f - b.ck(1, 1)} mode="burst" count={14} radius={0.35} size={0.035} seed={22} color="#ffd28a" intensity={2.2} />
      </>
    );
  }
  const squeeze = squeezeOf(b);
  const pose = hang(f, undefined, 1 - 0.6 * squeeze);
  const drip: DripSpec = { from: bagBottom(pose, squeeze), toY: SURFACE[1], start: b.ck(0, 2) + 6, count: 9, every: 11 };
  const dark = TEA_DARKER * ease(f, b.ck(0, 2) + 14, 120, EASE.inOut);
  return (
    <>
      <Cup pose={CUP} fill={FILL} dark={dark} ripple={dripRipple(f, [drip])} />
      <TeaBag pose={pose} tag={heldTag(pose)} squeeze={squeeze} wet={1} f={f} />
      <DarkDrips f={f} d={drip} />
    </>
  );
};

const WhyOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ln(1) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 1) - 2, out0)}>
        <Headline text="絞ると…" size={100} f={f} at={b.ck(0, 1) - 2} />
      </Layer>
      <Layer x={360} y={1270} k={reveal(f, b.ck(0, 4) - 2, out0)} rise={0}>
        <PopChip f={f} at={b.ck(0, 4) - 2} text="渋み" size={60} accent={STRONG}>
          <Swatch color={STRONG} />
        </PopChip>
      </Layer>
      <Layer x={720} y={1270} k={reveal(f, b.ck(0, 5) - 2, out0)} rise={0}>
        <PopChip f={f} at={b.ck(0, 5) - 2} text="苦味" size={60} accent={STRONG}>
          <Swatch color="#5a1d07" />
        </PopChip>
      </Layer>
      <Layer x={SAFE_CX} y={1375} k={reveal(f, b.ck(0, 6) - 2, out0)}>
        <Chip text="が 強くなる ↑" size={52} accent={STRONG} />
      </Layer>
      <Layer x={SAFE_CX} y={1180} k={reveal(f, b.ck(1, 1) - 2)}>
        <Headline text="タンニン" size={120} f={f} at={b.ck(1, 1) - 2} sweepAt={b.ck(1, 2)} />
      </Layer>
      <Layer x={SAFE_CX} y={1350} k={reveal(f, b.ck(1, 2) - 2)} rise={0}>
        <PopChip f={f} at={b.ck(1, 2) - 2} text="渋みのもと" accent={TANNIN}>
          <TanninIcon size={70} />
        </PopChip>
      </Layer>
    </>
  );
};

export const WHY: SceneDefP = {
  topic: "絞ると渋くなる？",
  shot: whyShot,
  World: WhyWorld,
  Overlay: WhyOverlay,
  dipLines: [1],
  bloom: () => 0.32,
};
