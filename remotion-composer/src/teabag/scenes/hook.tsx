import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Cup } from "../../golden2/three/models";
import { Sparkles } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX, Stamp } from "../overlays";
import { NG, PopChip } from "../labels";
import { bagBottom, DarkDrips, dripRipple, DripSpec, TeaBag } from "../three/teabag";
import { CUP, FILL, hang, heldTag, HERO, SURFACE } from "./set";
import { SceneDefP } from "../types";

// Line 0: from frame 0 a used tea bag hangs over the cup by its tag and drips once; at 「絞ってはいけない」
// it starts to squeeze and a red NG stamp thumps in. Line 1: 「よく聞く話」. Line 2: the NG stamp gives way to
// a yellow 「本当は？」 stamp, the bag spins and sparkles.
export const squeezeAt = (f: number, at: number, peak: number, hold = 14, release = 10) =>
  peak * ease(f, at, 8, EASE.out) * (1 - ease(f, at + 8 + hold, release, EASE.inOut));

const hookShot = (b: Beat): Shot2 =>
  breathe(keys2(b.f, [[0, { ...HERO, pos: [0.3, 3.5, 9.9] }], [0, HERO, b.ln(2)], [b.ln(2), { ...HERO, pos: [0.35, 3.45, 9.7] }, 60]]), b.f);

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const squeeze = squeezeAt(f, b.ck(0, 1), 0.45, 20);
  const spin = ease(f, b.ck(2, 2) - 4, 26, EASE.inOut) * Math.PI * 2;
  const pose = hang(f);
  const posed = { ...pose, yaw: (pose.yaw ?? 0) + spin };
  const drips: DripSpec[] = [
    { from: bagBottom(posed), toY: SURFACE[1], start: 4, count: 1, every: 10 },
    { from: bagBottom(posed, squeeze), toY: SURFACE[1], start: b.ck(0, 1) + 6, count: 2, every: 9 },
  ];
  return (
    <>
      <Cup pose={CUP} fill={FILL} ripple={dripRipple(f, drips)} />
      <TeaBag pose={posed} tag={heldTag(posed)} squeeze={squeeze} wet={1} f={f} />
      {drips.map((d, i) => (
        <DarkDrips key={i} f={f} d={d} />
      ))}
      <Sparkles center={add3(posed.pos, [0, 0.1, 0.2])} f={f - b.ck(2, 2)} mode="burst" count={14} radius={0.5} size={0.035} seed={7} color="#fff0c8" intensity={2} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={540} k={reveal(f, 0)}>
        <Headline text="ティーバッグ" size={90} f={f} at={0} />
      </Layer>
      <Layer x={SAFE_CX} y={648} k={reveal(f, b.ck(0, 1) - 4)}>
        <Headline text="絞っちゃダメ？" size={98} f={f} at={b.ck(0, 1) - 4} sweepAt={b.ck(0, 1) + 10} />
      </Layer>
      <Layer x={810} y={1040} k={reveal(f, b.ck(0, 1), b.ck(2, 1))} rise={0}>
        <div style={{ transform: "scale(0.62)" }}>
          <Stamp f={f} at={b.ck(0, 1)} top="絞るのは" big="NG" color={NG} />
        </div>
      </Layer>
      <Layer x={810} y={1040} k={reveal(f, b.ck(2, 2) - 2)} rise={0}>
        <div style={{ transform: "scale(0.62)" }}>
          <Stamp f={f} at={b.ck(2, 2) - 2} top="本当は" big="？" color="#e8a21c" />
        </div>
      </Layer>
      <Layer x={SAFE_CX} y={1360} k={reveal(f, b.ck(1, 1) - 2, b.ck(2, 3) - 4)} rise={0}>
        <PopChip f={f} at={b.ck(1, 1) - 2} text="よく聞く話" />
      </Layer>
      <Layer x={SAFE_CX} y={1360} k={reveal(f, b.ck(2, 3) - 2)} rise={0}>
        <PopChip f={f} at={b.ck(2, 3) - 2} text="必ずしも 正しくない" accent="#e8a21c" />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "ティーバッグ、絞る？",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  bloom: () => 0.32,
};
