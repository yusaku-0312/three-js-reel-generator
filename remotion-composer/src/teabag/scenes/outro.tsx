import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Cup, CupPose, teaSurface } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AskCard } from "../labels";
import { CUP, FILL, SURFACE } from "./set";
import { SceneDefP } from "../types";

// Line 0 (flash in): the hero cup in warm light with steam, glow and sparkles; 「自分がおいしい一杯」 lands.
// Lines 1–2: two cups side by side (deep = 絞る派 left, pale = 絞らない派 right), each lighting up as it is
// named, over the closing question card (held to the end).
const DEEP: CupPose = { pos: [-0.55, 0, 0], scale: 0.5, yaw: Math.PI + 0.5 };
const PALE: CupPose = { pos: [0.55, 0, 0], scale: 0.5, yaw: Math.PI + 0.5 };
const ONE: Shot2 = { pos: [0.2, 2.9, 7.4], target: [0, 0.2, 0], fov: 30, focus: SURFACE, aperture: 5 };
const PAIR: Shot2 = { pos: [0, 3.4, 9.8], target: [0, -0.5, 0], fov: 30, focus: [0, 0.35, 0], aperture: 3 };

const outroShot = (b: Beat): Shot2 =>
  breathe(keys2(b.f, [[0, { ...ONE, pos: [0.2, 3.0, 7.9] }], [0, ONE, b.ln(1) - 10], [b.ln(1) - 10, PAIR, 30]]), b.f);

export const glowAt = (f: number, at: number) => 0.9 * ease(f, at - 2, 8, EASE.out) * (1 - 0.6 * ease(f, at + 12, 20, EASE.inOut));

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const pair = ease(f, b.ln(1) - 12, 14, EASE.out);
  const warm = ease(f, b.ck(0, 3) - 2, 16, EASE.out);
  if (pair < 0.5) {
    return (
      <>
        <Cup pose={CUP} fill={FILL} glow={0.5 * warm} />
        <Steam base={SURFACE} f={f} width={0.28} opacity={0.75} />
        <Glow pos={add3(SURFACE, [0, 0.4, -0.3])} size={2.6} color="#ffe39a" intensity={0.3 * warm} />
        <Sparkles center={add3(SURFACE, [0, 0.35, 0])} f={f - b.ck(0, 3)} mode="orbit" count={16} radius={0.7} size={0.035} seed={71} color="#fff0c8" intensity={2} />
      </>
    );
  }
  const a = b.ck(1, 2);
  const c = b.ck(1, 3);
  return (
    <>
      <Cup pose={DEEP} fill={FILL} dark={0.3} glow={glowAt(f, a)} />
      <Cup pose={PALE} fill={FILL} pale={0.85} glow={glowAt(f, c)} />
      <Steam base={teaSurface(DEEP, FILL)} f={f} width={0.2} opacity={0.6} />
      <Steam base={teaSurface(PALE, FILL)} f={f + 40} width={0.2} opacity={0.6} />
      <Sparkles center={add3(teaSurface(DEEP, FILL), [0, 0.2, 0])} f={f - a} mode="burst" count={12} radius={0.35} size={0.03} seed={72} color="#ffd28a" intensity={2} />
      <Sparkles center={add3(teaSurface(PALE, FILL), [0, 0.2, 0])} f={f - c} mode="burst" count={12} radius={0.35} size={0.03} seed={73} color="#fff0c8" intensity={2} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ln(1) - 12;
  return (
    <>
      <Layer x={SAFE_CX} y={1200} k={reveal(f, b.ck(0, 1) - 2, out0)}>
        <Headline text="大切なのは" size={80} f={f} at={b.ck(0, 1) - 2} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 3) - 2, out0)}>
        <Headline text="自分がおいしい一杯" size={92} f={f} at={b.ck(0, 3) - 2} sweepAt={b.ck(0, 4)} />
      </Layer>
      <Layer x={SAFE_CX} y={1130} k={reveal(f, b.ln(1) - 4)}>
        <AskCard f={f} at={b.ln(1) - 4} aAt={b.ck(1, 2) - 2} bAt={b.ck(1, 3) - 2} commentAt={b.ck(2, 0) - 2} />
      </Layer>
    </>
  );
};

export const OUTRO: SceneDefP = {
  topic: "あなたはどっち派？",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
