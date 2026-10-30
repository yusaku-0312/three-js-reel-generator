import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { CHAI_ACCENT, CrossMark, DrinkChip } from "../labels";
import { Spice, SPICES } from "../three/parts";
import { CHAI_TOP, TwoDrinks } from "./set";
import { SceneDefP } from "../types";

// Line 0: the two drinks; at 「スパイスでは」 four whole spices pop up over the chai and a red ✕ strikes them
// (ありません). Line 1: the spices shrink away (スパイスの入らない) and the chai glints anyway (チャイも).
const SPICE_C: V3 = add3(CHAI_TOP, [-0.15, 0.6, 0.35]);
const spiceAt = (i: number): V3 => add3(SPICE_C, [(i - 1.5) * 0.3, Math.sin((i / 3) * Math.PI) * 0.12, 0]);

const hookShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0, 4.1, 9.0], target: [0, 0.45, 0], fov: 30, focus: [0, 0.5, 0], aperture: 5 }],
      [0, { pos: [0, 3.8, 8.0], target: [0, 0.5, 0], fov: 30, focus: [0, 0.5, 0], aperture: 6 }, 150],
    ]),
    b.f,
  );

const spiceScale = (b: Beat, i: number) => {
  const inK = ease(b.f, b.ck(0, 2) + i * 3, 8, EASE.out);
  const outK = 1 - ease(b.f, b.ck(1, 1) + i * 2, 10, EASE.in);
  return inK * outK;
};

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const glint = ease(f, b.ck(1, 2), 6, EASE.out) * (1 - ease(f, b.ck(1, 2) + 16, 18, EASE.in));
  return (
    <>
      <TwoDrinks f={f} />
      {SPICES.map((kind, i) => (
        <Spice key={kind} kind={kind} pos={spiceAt(i)} rot={[0.5, f * 0.03 + i, 0.2]} scale={spiceScale(b, i) * 1.15} />
      ))}
      <Glow pos={add3(CHAI_TOP, [0, 0.3, 0])} size={1.1} color="#ffc98a" intensity={glint * 0.8} />
      <Sparkles center={add3(CHAI_TOP, [0, 0.35, 0])} f={f - b.ck(1, 2)} mode="burst" count={14} radius={0.6} size={0.06} seed={21} color="#fff0c0" intensity={2.2} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const sp = project2(shot, SPICE_C);
  return (
    <>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 0) - 2)}>
        <DrinkChip kind="milk" size={54} />
      </Layer>
      <Layer x={SAFE_CX + 150} y={560} k={reveal(f, b.ck(0, 0) + 22, b.ck(0, 2) - 4)}>
        <DrinkChip kind="chai" size={54} />
      </Layer>
      <Layer x={sp.x} y={sp.y} k={1 - ease(f, b.ck(1, 1), 8, EASE.in)} rise={0}>
        <CrossMark f={f} at={b.ck(0, 3)} size={300} />
      </Layer>
      <Layer x={SAFE_CX + 120} y={560} k={reveal(f, b.ck(1, 1))}>
        <Chip text="スパイスなしでも" size={50} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX + 120} y={660} k={reveal(f, b.ck(1, 2))}>
        <DrinkChip kind="chai" size={54} text="チャイ" />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "いちばんの違いは？",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  bloom: () => 0.32,
};
