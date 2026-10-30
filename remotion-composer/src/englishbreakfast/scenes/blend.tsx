import React from "react";
import { add3, Beat, lerp, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { teaSurface } from "../../golden2/three/models";
import { Sparkles, Steam } from "../../paradise/three/fx";
import { LeafHeap } from "../../kurenai/three/props";
import { MilkCup } from "../../royalmilk/three/kitchen";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { TEA_COLOR } from "../labels";
import { FlyingLeaves } from "../three/blend";
import { Tin } from "../three/tins";
import { CUP, CUP_FULL, morning, TEA_DARK } from "./set";
import { SceneDefP } from "../types";

// Line 0: Assam leaves on the left dish, Ceylon on the right, the hero tin behind; on 「複数の茶葉を」 both
// heaps leap into the middle dish, which fills up (ブレンドティー). Line 1 (dip): a cup of strong, dark tea
// with steam and two warm scent ribbons (コク・豊かな風味).
const LEFT: V3 = [-0.78, 0, 0.35];
const RIGHT: V3 = [0.78, 0, 0.35];
const MID: V3 = [0, 0, 0.95];
const TIN_AT: V3 = [0, 0, -0.75];

const leavesShot = (b: Beat): Shot2 =>
  keys2(b.f, [
    [0, { pos: [0, 4.9, 11.2], target: [0, 0.1, 0.2], fov: 30, focus: [0, 0.1, 0.4], aperture: 3 }],
    [0, { pos: [0, 4.8, 10.8], target: [0, 0.1, 0.2], fov: 30, focus: [0, 0.1, 0.4], aperture: 3 }, 150],
  ]);

const CUP_SHOT_A: Shot2 = { pos: [0.3, 4.0, 8.9], target: [0, 0.45, 0], fov: 30, focus: [0, 0.65, 0], aperture: 7 };
const CUP_SHOT_B: Shot2 = { pos: [0.2, 3.9, 8.5], target: [0, 0.45, 0], fov: 30, focus: [0, 0.65, 0], aperture: 7 };

const blendShot = (b: Beat): Shot2 =>
  b.f < b.ln(1) - 4 ? breathe(leavesShot(b), b.f) : breathe(keys2(b.f - b.ln(1), [[0, CUP_SHOT_A], [0, CUP_SHOT_B, 90]]), b.f);

const LeavesWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const go = b.ck(0, 4) - 4;
  const t = ease(f, go, 40, EASE.inOut);
  const tFly = (f - go) / 40;
  return (
    <>
      <LeafHeap pos={LEFT} radius={0.36} height={0.22 * lerp(1, 0.35, t)} count={150} seed={5} />
      <LeafHeap pos={RIGHT} radius={0.36} height={0.2 * lerp(1, 0.35, t)} count={150} seed={7} />
      <LeafHeap pos={MID} radius={0.38} height={0.03 + 0.24 * t} count={Math.round(20 + 200 * t)} seed={9} />
      <FlyingLeaves from={add3(LEFT, [0, 0.12, 0])} to={add3(MID, [0, 0.12, 0])} t={tFly} colors={["#1c120c", "#2a1a10", "#140d09"]} seed={3} count={40} arc={0.55} spread={0.25} />
      <FlyingLeaves from={add3(RIGHT, [0, 0.12, 0])} to={add3(MID, [0, 0.12, 0])} t={tFly - 0.08} colors={["#3a2214", "#4a2a16", "#2a1a10"]} seed={4} count={40} arc={0.55} spread={0.25} />
      <Tin kind="eb" pos={TIN_AT} scale={0.72} glow={0.1} />
      <Sparkles center={add3(MID, [0, 0.35, 0])} f={f - b.ck(0, 6)} mode="burst" count={14} radius={0.45} size={0.035} seed={51} color="#ffe6a8" intensity={2} />
    </>
  );
};

const CupWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const f = b.f - b.ln(1);
  const surface = teaSurface(CUP, CUP_FULL);
  return (
    <>
      <MilkCup pose={CUP} fill={CUP_FULL} s={{ from: TEA_DARK, to: TEA_DARK, spread: 0, mix: 1, glow: 0.12 }} />
      <Steam base={surface} f={b.f} width={0.32} opacity={0.85} />
    </>
  );
};

const BlendWorld: React.FC<{ b: Beat }> = ({ b }) => (b.f < b.ln(1) - 4 ? <LeavesWorld b={b} /> : <CupWorld b={b} />);

const BlendOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ck(0, 4) + 4;
  const line1 = b.ln(1) - 6;
  return (
    <>
      <Layer x={300} y={1180} k={reveal(f, b.ck(0, 2) - 2, out0)}>
        <Chip text="アッサム" size={46} accent={TEA_COLOR.assam} />
      </Layer>
      <Layer x={780} y={1180} k={reveal(f, b.ck(0, 3) - 2, out0)}>
        <Chip text="セイロン" size={46} accent="#d9a066" />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 6) - 3, line1)}>
        <Headline text="ブレンドティー" size={118} f={f} at={b.ck(0, 6) - 3} sweepAt={b.ck(0, 6) + 10} />
      </Layer>
      <Layer x={SAFE_CX} y={1350} k={reveal(f, b.ck(1, 0) - 2, b.ck(1, 1) + 4)}>
        <Chip text="しっかりしたコク" size={54} accent={TEA_COLOR.assam} />
      </Layer>
      <Layer x={SAFE_CX} y={1350} k={reveal(f, b.ck(1, 1) + 8)}>
        <Chip text="豊かな風味" size={54} accent={TEA_COLOR.eb} />
      </Layer>
    </>
  );
};

export const BLEND: SceneDefP = {
  topic: "ブレンドティー",
  shot: blendShot,
  World: BlendWorld,
  Overlay: BlendOverlay,
  dipIn: true,
  dipLines: [1],
  bloom: () => 0.32,
  light: (b) => (b.f < b.ln(1) - 4 ? morning([0, 0.2, 0.3]) : morning([0, 0.6, 0])),
};
