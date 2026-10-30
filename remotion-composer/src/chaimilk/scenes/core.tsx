import React from "react";
import { add3, Beat, lerp3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Pitcher } from "../../royalmilk/three/kitchen";
import { MID, TwoDrinks } from "./set";
import { SceneDefP } from "../types";

// Line 2: the milk jug glides down between the two drinks (ミルクを入れる) and glows as 「順番」 lands.
const coreShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0, 3.8, 8.0], target: [0, 0.5, 0], fov: 30, focus: [0, 0.5, 0], aperture: 6 }],
      [0, { pos: [0, 3.5, 7.4], target: [0, 0.6, 0], fov: 30, focus: MID, aperture: 6 }, 80],
    ]),
    b.f,
  );

const CoreWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const down = ease(f, b.ck(0, 1) - 8, 22, EASE.out);
  const tip = lerp3(add3(MID, [-0.75, 2.6, 0.3]), add3(MID, [-0.75, 0.95, 0.3]), down);
  const glow = ease(f, b.ck(0, 2), 8, EASE.out);
  return (
    <>
      <TwoDrinks f={f + 260} />
      <Pitcher pose={{ tip, tilt: 0.05 + Math.sin(f * 0.08) * 0.03, yaw: Math.PI, scale: 1.1 }} />
      <Glow pos={add3(tip, [-0.25, -0.15, 0])} size={1.3} color="#fff3dc" intensity={glow * 0.6} />
    </>
  );
};

const CoreOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(0, 1) - 2)}>
        <Headline text="ミルクを入れる" size={84} f={f} at={b.ck(0, 1) - 2} />
      </Layer>
      <Layer x={SAFE_CX} y={1290} k={reveal(f, b.ck(0, 2) - 2)}>
        <Headline text="順番" size={190} f={f} at={b.ck(0, 2) - 2} sweepAt={b.ck(0, 2) + 10} />
      </Layer>
    </>
  );
};

export const CORE: SceneDefP = {
  topic: "違いは？",
  shot: coreShot,
  World: CoreWorld,
  Overlay: CoreOverlay,
  bloom: () => 0.32,
};
