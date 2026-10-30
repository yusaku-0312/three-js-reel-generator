import React from "react";
import { add3, Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { PotPose, Teapot, teaSurface } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { BROWN, KURENAI, RubyHeadline, SwatchChip } from "../labels";
import { Mug, mugSurface, SunLight, WhiteCup } from "../three/liquid";
import { PourStream, pourSlice } from "../../royalmilk/three/liquid";
import { DEFAULT_LIGHTING, Lighting } from "../../royalmilk/three/stage";
import { CUP, CUP_FILL, lerpLook, LOOK, MUG, MUG_FILL } from "./set";
import { SceneDefP } from "../types";

// Line 2: the mug reads brown (茶色っぽく見えても); tea pours into the white cup (白いカップに注いで), the sunset
// window behind it opens (光にかざすと) and the tea turns clear crimson with a gold ring (透きとおった紅色).
// Line 3: held in that light, the colour gets its name: 水色 (すいしょく).
const MUG_TOP = mugSurface(MUG, MUG_FILL);
const CUP_TOP = teaSurface(CUP, CUP_FILL);

const pour = (b: Beat) => ({ start: b.ck(0, 2) - 4, dur: 30 });
/** 0..1 how far the window light has opened. */
export const lightOf = (b: Beat) => ease(b.f, b.ck(0, 3) - 2, 26, EASE.inOut);

const POT_REST: V3 = [2.3, 2.7, -0.7];
const POT_TIP: V3 = [0.72, 1.75, -0.45];
const potPose = (b: Beat): PotPose => {
  const p = pour(b);
  const enter = ease(b.f, p.start - 16, 14, EASE.out);
  const leave = ease(b.f, p.start + p.dur, 16, EASE.in);
  const tilt = lerp(0.15, 0.62, ease(b.f, p.start - 4, 8, EASE.out)) - 0.47 * leave;
  return { tip: lerp3(lerp3(POT_REST, POT_TIP, enter), POT_REST, leave), tilt, scale: 0.45, yaw: Math.PI };
};

/** The white cup from above, so its tea surface shows, with the sunlit counter behind it (shared with the outro). */
export const BACKLIT_SHOT: Shot2 = { pos: [0.3, 3.6, 6.55], target: [0.42, 0.75, -0.45], fov: 30, focus: CUP_TOP, aperture: 8 };

const colorShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.9, 3.5, 4.2], target: [-0.4, 0.6, 0.3], fov: 30, focus: MUG_TOP, aperture: 7 }],
      [b.ck(0, 2) - 14, BACKLIT_SHOT, 46],
    ]),
    b.f,
  );

const colorLight = (b: Beat): Lighting => {
  const k = lightOf(b);
  return { ...DEFAULT_LIGHTING, key: lerp(3.2, 2.2, k), rim: lerp(1.3, 2.4, k), bokeh: lerp(0.6, 0.25, k) };
};

const ColorWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const p = pour(b);
  const fill = CUP_FILL * ease(f, p.start + 3, p.dur, EASE.inOut);
  const surface = teaSurface(CUP, Math.max(fill, 0.05));
  const pot = potPose(b);
  const light = lightOf(b);
  return (
    <>
      <SunLight target={CUP_TOP} open={light} />
      <Mug pose={MUG} fill={MUG_FILL} look={LOOK.mug} f={f} />
      <Steam base={MUG_TOP} f={f + 20} width={0.35} opacity={0.8} seed={4} />
      <WhiteCup pose={CUP} fill={fill} look={lerpLook(LOOK.plain, LOOK.backlit, light)} f={f} />
      <Teapot pose={pot} />
      <PourStream from={pot.tip} to={add3(surface, [0.05, 0, 0])} color="#9a3416" radius={0.035} f={f} bend={0.15} {...pourSlice(f, p.start, p.dur)} />
      <Steam base={surface} f={f} width={0.38} opacity={ease(f, p.start + 10, 30)} seed={9} />
      <Glow pos={add3(CUP_TOP, [0, 0.05, -0.05])} size={1.6} color="#ff6a3a" intensity={light * 0.18} />
      <Sparkles center={add3(CUP_TOP, [0, 0.25, 0])} f={f - b.ck(0, 5)} mode="burst" count={14} radius={0.7} size={0.05} seed={31} color="#ffd0b0" intensity={2.2} />
    </>
  );
};

const ColorOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const mug = project2(shot, add3(MUG_TOP, [0, 0.3, 0]));
  return (
    <>
      <Layer x={Math.min(Math.max(mug.x, 330), 750)} y={Math.max(mug.y - 70, 560)} k={reveal(f, b.ck(0, 1) - 2, b.ck(0, 2) - 10)}>
        <SwatchChip text="茶色っぽい" color={BROWN} size={54} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 5) - 2, b.ck(1, 1) - 6)}>
        <SwatchChip text="透きとおった 紅色" color={KURENAI} size={56} />
      </Layer>
      <Layer x={SAFE_CX} y={640} k={reveal(f, b.ck(1, 1) - 3)}>
        <RubyHeadline text="水色" ruby="すいしょく" f={f} at={b.ck(1, 1) - 3} size={150} sweepAt={b.ck(1, 1) + 14} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 2) - 2)}>
        <Chip text="淹れたお茶の色のこと" size={52} accent={KURENAI} />
      </Layer>
    </>
  );
};

export const COLOR: SceneDefP = {
  topic: "光にかざすと紅色",
  shot: colorShot,
  World: ColorWorld,
  Overlay: ColorOverlay,
  light: colorLight,
  dipIn: true,
  bloom: (b) => 0.32 + lightOf(b) * 0.12,
};
