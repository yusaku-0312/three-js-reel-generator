import React from "react";
import { add3, Beat, clamp01, lerp, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Cup, CupPose, teaSurface } from "../../golden2/three/models";
import { Chip, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { Sparkles, Steam } from "../three/fx";
import { glassRim, IcedGlass } from "../three/glass";
import { SugarCube } from "../three/props";
import { DEFAULT_LIGHTING } from "../three/stage";
import { SceneDefP } from "../types";

// Line 7: three sugar cubes come down to the glass and bounce off: 無糖 / カロリー 0.
// Line 8: iced (cool light, ice turning) → truck right to a hot porcelain cup with steam.
const GLASS = { pos: [0, 0, 0] as V3 };
const RIM = glassRim(GLASS);
const CUP: CupPose = { pos: [1.9, 0, 0.2], scale: 0.7, yaw: -0.5 };
const CUP_TEA = teaSurface(CUP, 0.72);

const coolOf = (b: Beat) => ease(b.f, b.ck(1, 0) - 6, 20) * (1 - ease(b.f, b.ck(1, 2) - 4, 26));

const pointsShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0, 2.2, 7.4], target: [0, 1.3, 0], fov: 30, focus: add3(GLASS.pos, [0, 1.2, 0]), aperture: 6 }],
      [b.ck(1, 0) - 6, { pos: [-0.2, 1.9, 6.0], target: [0, 1.05, 0], fov: 30, focus: add3(GLASS.pos, [0, 1.0, 0]), aperture: 7 }, 30],
      [b.ck(1, 2) - 8, { pos: [1.9, 2.0, 5.2], target: [1.75, 0.7, 0.1], fov: 30, focus: CUP_TEA, aperture: 7 }, 36],
    ]),
    b.f,
  );

/** Sugar cube i: drifts down toward the rim, is pushed back up and away at 「無糖で」, and fades. */
const cubeState = (b: Beat, i: number): { pos: V3; rot: V3; opacity: number } => {
  const x0 = (i - 1) * 0.32;
  const down = ease(b.f, b.ck(0, 0) + i * 5, 40, EASE.out);
  const bounce = ease(b.f, b.ck(0, 1) - 4 + i * 2, 18, EASE.out);
  const y = lerp(2.9, RIM[1] + 0.32 + Math.abs(i - 1) * 0.05, down) + bounce * 0.55;
  const x = x0 + bounce * (i - 1) * 0.55;
  const spin = b.f * 0.02 + i;
  return { pos: [x, y, 0.05], rot: [spin, spin * 0.6, 0.3 * i], opacity: 1 - clamp01((b.f - (b.ck(0, 1) + 6)) / 12) };
};

const PointsWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const cool = coolOf(b);
  const swirl = ease(f, b.ck(1, 0) - 4, 50, EASE.inOut) * 2.2;
  return (
    <>
      <IcedGlass pose={GLASS} fill={0.84} f={f} ice={5} petals={14} glow={0.35} swirl={swirl} />
      {[0, 1, 2].map((i) => {
        const s = cubeState(b, i);
        return <SugarCube key={i} pos={s.pos} rot={s.rot} opacity={s.opacity} />;
      })}
      <Sparkles center={add3(RIM, [0, 0.4, 0])} f={f - b.ck(0, 1)} mode="burst" count={12} radius={0.7} size={0.06} seed={90} color="#ffffff" intensity={2} />
      <Sparkles center={add3(RIM, [0, -0.3, 0])} f={f} mode="orbit" count={14} radius={0.7} size={0.05} seed={91} color="#dff6ff" intensity={2.4 * cool} />
      <Cup pose={CUP} fill={0.72} />
      <Steam base={CUP_TEA} f={f + 40} width={0.3} opacity={1.1} />
    </>
  );
};

const PointsOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const end = b.ck(1, 0) - 6;
  const iceK = reveal(f, b.ck(1, 1), b.ck(1, 2) - 4);
  const hotK = reveal(f, b.ck(1, 3), b.dur - 2);
  return (
    <>
      <Scrim y={620} k={Math.max(reveal(f, b.ck(0, 1), end), iceK, hotK)} height={340} strength={0.38} />
      <Layer x={SAFE_CX} y={560} k={reveal(f, b.ck(0, 1), end)}>
        <Chip text="砂糖なしの無糖" size={56} />
      </Layer>
      <Layer x={SAFE_CX} y={690} k={reveal(f, b.ck(0, 2), end)}>
        <Chip text="カロリー 0" size={64} accent="#ff9a6b" />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={iceK}>
        <Chip text="ICE｜すっきり爽やか" size={52} accent="#7fd8ff" />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={hotK}>
        <Chip text="HOT｜紅茶のコクが際立つ" size={50} accent="#ff9a52" />
      </Layer>
    </>
  );
};

export const POINTS: SceneDefP = {
  topic: "無糖・カロリーゼロ",
  shot: pointsShot,
  World: PointsWorld,
  Overlay: PointsOverlay,
  dipIn: true,
  light: (b) => {
    const cool = coolOf(b);
    const onCup = ease(b.f, b.ck(1, 2) - 8, 36);
    return {
      ...DEFAULT_LIGHTING,
      keyAt: [lerp(0, CUP.pos[0], onCup), 0.6, 0],
      cool,
      key: DEFAULT_LIGHTING.key * (1 - cool * 0.25),
      fill: DEFAULT_LIGHTING.fill + cool * 0.3,
    };
  },
};
