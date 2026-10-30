import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Layer, reveal, SAFE_CX } from "../overlays";
import { SummaryCard } from "../labels";
import { Cookie, Scent } from "../three/cookie";
import { CookiePlate, HERO_TOP, TEA_TOP, TeaCup } from "./set";
import { BITES, dunkPose } from "./aroma";
import { SceneDefP } from "../types";

// Line 10: the pair again (the bitten cookie standing in the tea); a crane up puts them under the summary
// card, whose two rows come in at 「脂っぽさを」 and 「浸して食べることで」 with a glow on the matching object.
// Line 11: glints rise, the card's headline gets a light sweep at 「こんな科学が」, then black.
const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.4, 3.0, 8.2], target: [0.05, 0.45, 0], fov: 30, focus: [0, 0.45, 0], aperture: 6 }],
      [0, { pos: [0.3, 3.0, 10.6], target: [0.05, 1.25, 0], fov: 30, focus: [0, 0.45, 0], aperture: 4 }, 80],
      [b.ln(1), { pos: [0.7, 3.1, 10.4], target: [0.05, 1.25, 0], fov: 30, focus: [0, 0.45, 0], aperture: 4 }, 150],
    ]),
    b.f,
    0.025,
  );

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const one = ease(f, b.ck(0, 2) - 2, 14, EASE.out) * (1 - 0.6 * ease(f, b.ck(0, 4), 20));
  const two = ease(f, b.ck(0, 4) - 2, 30, EASE.out);
  const science = ease(f, b.ck(1, 4) - 2, 14, EASE.out) * (1 - ease(f, b.ck(1, 4) + 40, 30, EASE.in));
  return (
    <>
      <TeaCup f={f} glow={one * 0.8} />
      <CookiePlate glow={science * 0.4} />
      <Cookie pose={dunkPose(0)} bites={BITES} wet={0.5} glow={two * 0.3} />
      <Scent from={add3(TEA_TOP, [0.02, 0.4, -0.05])} f={f} colors={["#ffd28a", "#f3b066", "#fff0c8"]} grow={two} intensity={0.32} height={0.85} radius={0.22} seed={9} />
      <Glow pos={add3(HERO_TOP, [-0.4, 0.4, 0.3])} size={2.2} color="#fff3dc" intensity={science * 0.4} />
      <Sparkles center={add3(HERO_TOP, [-0.5, 0.5, 0.4])} f={f - b.ln(1)} mode="rise" count={16} radius={0.8} size={0.045} seed={81} color="#fff0c8" intensity={1.6} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const at = b.ck(0, 0) + 2;
  return (
    <Layer x={SAFE_CX} y={720} k={reveal(b.f, at)}>
      <SummaryCard f={b.f} at={at} row1At={b.ck(0, 2) - 2} row2At={b.ck(0, 4) - 2} sweepAt={b.ck(1, 4)} />
    </Layer>
  );
};

export const OUTRO: SceneDefP = { topic: "こんな科学が", shot: outroShot, World: OutroWorld, Overlay: OutroOverlay, dipIn: true, bloom: () => 0.34 };
