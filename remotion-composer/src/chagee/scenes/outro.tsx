import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles, Steam } from "../../paradise/three/fx";
import { Layer, reveal, SAFE_CX } from "../overlays";
import { SummaryCard } from "../labels";
import { ChageeCup, cupTop, Passport, Ticket } from "../three/parts";
import { SceneDefP } from "../types";

// Line 10: back on the counter, the blue-and-white cup with a passport and a boarding pass beside it
// (韓国やアジアへの旅行のときに); a short arc and crane up leaves them in the lower half under the summary card.
const CUP = { pos: [0.3, 0, 0] as V3, scale: 0.8, yaw: -0.1 };

const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.6, 2.6, 7.6], target: [0, 0.7, 0], fov: 30, focus: CUP.pos, aperture: 5 }],
      [0, { pos: [0.2, 2.7, 9.2], target: [-0.05, 1.45, 0], fov: 30, focus: CUP.pos, aperture: 4 }, 70],
    ]),
    b.f,
    0.025,
  );

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const top = cupTop(CUP);
  return (
    <>
      <ChageeCup pose={{ ...CUP, yaw: CUP.yaw + f * 0.0015 }} />
      <Passport pos={[-0.75, 0, 0.55]} yaw={0.35} />
      <Ticket pos={[-0.3, 0.07, 0.75]} yaw={-0.25} />
      <Steam base={add3(top, [0, 0.02, 0.1])} f={f} width={0.22} opacity={0.5} seed={11} />
      <Sparkles center={add3(top, [-0.3, 0.3, 0.3])} f={f} mode="rise" count={12} radius={0.7} size={0.045} seed={81} color="#eaf2ff" intensity={1.5} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const at = b.ck(0, 0) + 2;
  return (
    <Layer x={SAFE_CX} y={760} k={reveal(b.f, at)}>
      <SummaryCard f={b.f} at={at} />
    </Layer>
  );
};

export const OUTRO: SceneDefP = {
  topic: "旅行で探してみて",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.32,
};
