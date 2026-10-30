import React from "react";
import { add3, Beat } from "../core";
import { breathe, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Layer, reveal, SAFE_CX } from "../overlays";
import { SummaryCard } from "../labels";
import { dayLight, HIGH_TOP, HighTable, SupperItems } from "./set";
import { SceneDefP } from "../types";

// Line 14: the home supper table, crane up so it sits in the upper half; the summary card holds to the end.
const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: add3(HIGH_TOP, [-0.2, 1.7, 4.4]), target: add3(HIGH_TOP, [0, 0, 0]), fov: 30, focus: HIGH_TOP, aperture: 6 }],
      [0, { pos: add3(HIGH_TOP, [-0.1, 2.5, 5.0]), target: add3(HIGH_TOP, [0, -0.62, 0]), fov: 30, focus: HIGH_TOP, aperture: 6 }, 45],
    ]),
    b.f,
    0.025,
  );

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <HighTable>
      <SupperItems f={b.f + 300} s={{ pie: 1, toast: 1, bread: 1, teaFill: 0.7 }} />
    </HighTable>
    <Sparkles center={add3(HIGH_TOP, [0, 0.5, 0])} f={b.f} mode="rise" count={14} radius={0.8} size={0.04} seed={81} color="#fff0c8" intensity={1.5} />
  </>
);

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => (
  <Layer x={SAFE_CX} y={1190} k={reveal(b.f, b.ck(0, 0) - 2)}>
    <SummaryCard f={b.f} at={b.ck(0, 0) - 2} />
  </Layer>
);

export const OUTRO: SceneDefP = {
  topic: "今も昔も晩ごはん",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.32,
  light: () => dayLight(HIGH_TOP),
};
