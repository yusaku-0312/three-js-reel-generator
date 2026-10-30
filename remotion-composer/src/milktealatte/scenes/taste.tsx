import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Aroma, Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { LATTE_ACCENT, MILK_ACCENT } from "../labels";
import { LATTE_TOP, MILK_TOP, PAIR_WIDE, TwoDrinks } from "./hook";
import { SceneDefP } from "../types";

// Line 7: back to the pair. 「紅茶の香りなら」 amber scent ribbons rise from the cup (camera leans to it);
// 「まろやかさなら」 the camera drifts to the glass and its foam glows soft white.
const tasteShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { ...PAIR_WIDE, pos: [-0.55, 2.8, 7.6], target: [-0.3, 0.45, 0.2], focus: [-0.5, 0.4, 0.5] }],
      [b.ck(0, 2) - 6, { ...PAIR_WIDE, pos: [0.55, 3.0, 7.6], target: [0.3, 0.6, -0.3], focus: [0.48, 0.8, -0.5] }, 30],
    ]),
    b.f,
  );

const TasteWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const scent = ease(f, b.ck(0, 0) - 2, 36, EASE.out) * (1 - ease(f, b.ck(0, 2) - 8, 18, EASE.inOut));
  const soft = ease(f, b.ck(0, 2) - 2, 16, EASE.out);
  return (
    <>
      <TwoDrinks f={f} milkSwirl={2 + f * 0.012} foamGlow={soft * 0.3} />
      <Aroma from={add3(MILK_TOP, [0, 0.02, 0])} f={f} colors={["#f0a04b", "#ffd28a"]} grow={scent} intensity={0.45 * scent} height={1.5} radius={0.18} />
      <Glow pos={add3(MILK_TOP, [0, 0.25, 0])} size={1.1} color="#ffc27a" intensity={scent * 0.3} />
      <Glow pos={add3(LATTE_TOP, [0, 0.1, 0])} size={1.3} color="#fff6ea" intensity={soft * 0.55} />
      <Sparkles center={add3(LATTE_TOP, [0, 0.3, 0])} f={f - b.ck(0, 3)} mode="burst" count={14} radius={0.5} size={0.05} seed={61} color="#fff6e0" intensity={2} />
    </>
  );
};

const TasteOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 0) - 2, b.ck(0, 2) - 4)}>
        <Chip text="香り → ミルクティー" size={54} accent={MILK_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 2) - 2)}>
        <Chip text="まろやか → ティーラテ" size={54} accent={LATTE_ACCENT} />
      </Layer>
    </>
  );
};

export const TASTE: SceneDefP = {
  topic: "どっちを選ぶ？",
  shot: tasteShot,
  World: TasteWorld,
  Overlay: TasteOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
