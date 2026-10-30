import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Layer, reveal, SAFE_CX } from "../overlays";
import { SummaryCard } from "../labels";
import { LATTE_TOP, TwoDrinks } from "./hook";
import { SceneDefP } from "../types";

// Line 8: the pair edges together; a short arc and crane up puts them in the lower half under the summary card
// (one row per drink, in the drinks' colours).
const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.5, 3.0, 8.4], target: [0, 0.5, 0], fov: 30, focus: [0, 0.5, 0], aperture: 6 }],
      [0, { pos: [0.4, 2.96, 11.6], target: [0, 1.2, 0], fov: 30, focus: [0, 0.5, 0], aperture: 4 }, 70],
    ]),
    b.f,
    0.025,
  );

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const near = ease(f, b.ck(0, 1) - 4, 30, EASE.inOut) * 0.1;
  return (
    <>
      <TwoDrinks f={f} milkSwirl={2 + f * 0.01} milkOffset={[near, 0, -near * 0.5]} latteOffset={[-near, 0, near * 0.5]} />
      <Sparkles center={add3(LATTE_TOP, [-0.4, 0.4, 0.4])} f={f} mode="rise" count={14} radius={0.7} size={0.045} seed={81} color="#fff0c8" intensity={1.6} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const at = b.ck(0, 0) + 2;
  return (
    <Layer x={SAFE_CX} y={680} k={reveal(b.f, at)}>
      <SummaryCard f={b.f} at={at} />
    </Layer>
  );
};

export const OUTRO: SceneDefP = {
  topic: "その日の気分で",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
