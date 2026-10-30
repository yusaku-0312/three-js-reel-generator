import React from "react";
import { add3, Beat } from "../core";
import { breathe, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Tin, tinTop } from "../three/tins";
import { EB, EB_S, morning } from "./set";
import { SceneDefP } from "../types";

// The hero tin alone, the camera pushing in while 「なぜ人気？」 lands under it.
const whyShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0, 3.6, 7.3], target: [0, 0.25, 0.75], fov: 30, focus: [0, 0.5, 0.75], aperture: 6 }],
      [0, { pos: [0, 3.6, 6.85], target: [0, 0.25, 0.75], fov: 30, focus: [0, 0.5, 0.75], aperture: 7 }, b.dur],
    ]),
    b.f,
  );

const WhyWorld: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Tin kind="eb" pos={EB} scale={EB_S} glow={0.2} />
    <Glow pos={add3(EB, [0, 0.5, -0.3])} size={2.2} color="#ffd890" intensity={0.25} />
    <Sparkles center={tinTop(EB, EB_S)} f={b.f} mode="orbit" count={14} radius={0.6} size={0.03} seed={41} color="#fff0c8" intensity={1.6} />
  </>
);

const WhyOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => (
  <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(0, 1) - 2)}>
    <Headline text="なぜ人気？" size={140} f={b.f} at={b.ck(0, 1) - 2} sweepAt={b.ck(0, 2) + 6} />
  </Layer>
);

export const WHY: SceneDefP = {
  topic: "なぜ人気？",
  shot: whyShot,
  World: WhyWorld,
  Overlay: WhyOverlay,
  bloom: () => 0.36,
  light: () => morning([0, 0.5, 0.6]),
};
