import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AI_CYAN, Phone } from "../three/props";
import { SceneDefP } from "../types";
import { HERO_CAM } from "./cams";
import { Core, FoodOrbit, PHONE_AT, PHONE_H } from "./hero";

// L0 「そんなときは、AIに献立を考えてもらいましょう」: the parent's phone floats up in front of the kitchen;
// on 「AIに」 the AI lights above it, on 「献立を」 ingredients start circling it.
const shot = (b: Beat): Shot2 => breathe(HERO_CAM, b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const rise = ease(b.f, 0, 16, EASE.out);
  const core = ease(b.f, b.ck(0, 1) - 2, 10, EASE.out);
  return (
    <>
      <Phone pos={[PHONE_AT[0], PHONE_AT[1] - (1 - rise) * 0.5, PHONE_AT[2]]} rot={[0, -0.12 + rise * 0.12, 0]} h={PHONE_H} screen="home" glow={core} />
      <Core f={b.f} k={core} power={0.4 + core * 0.4} />
      <FoodOrbit f={b.f} at={b.ck(0, 2)} n={3} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX + 250} y={620} k={reveal(b.f, b.ck(0, 1))}>
      <Chip text="AI" accent={AI_CYAN} size={50} />
    </Layer>
    <Layer x={SAFE_CX} y={1345} k={reveal(b.f, b.ck(0, 4) - 4)}>
      <Headline text="AIに 献立を相談" size={88} f={b.f} at={b.ck(0, 4) - 4} />
    </Layer>
  </>
);

export const INTRO: SceneDefP = {
  topic: "AIに献立を考えてもらう",
  shot,
  World,
  Overlay,
  bloom: () => 0.45,
  dipIn: true,
};
