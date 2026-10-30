import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { AFTERNOON, HIGH_AMBER, SummaryCard } from "../labels";
import { dayLight, HIGH_TOP, HighTable, LOW_TOP, LowTea, SupperItems, WIDE } from "./set";
import { SceneDefP } from "../types";

// Line 11: both tables by day, raised to the upper half; the low table glows pink (スコーンで夕食を待つ),
// then the high table amber (お肉と紅茶で夕食に). Line 12: the summary card holds to the end.
const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, WIDE(0.5)],
      [0, { ...WIDE(0.55), pos: [0.3, 2.2, 9.2] }, b.dur],
    ]),
    b.f,
    0.025,
  );

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <LowTea f={f} fill={[1, 1, 1]} />
      <HighTable>
        <SupperItems f={f + 300} s={{ pie: 1, toast: 1, bread: 1, teaFill: 0.7 }} />
      </HighTable>
      <Glow pos={add3(LOW_TOP, [0, 0.3, 0])} size={1.4} color={AFTERNOON} intensity={ease(f, b.ck(0, 0), 10, EASE.out) * 0.35} />
      <Glow pos={add3(HIGH_TOP, [0, 0.3, 0])} size={1.5} color={HIGH_AMBER} intensity={ease(f, b.ck(0, 2), 10, EASE.out) * 0.35} />
      <Sparkles center={[0, 1.2, 0]} f={f - b.ck(1, 0)} mode="rise" count={16} radius={1.4} size={0.04} seed={81} color="#fff0c8" intensity={1.5} />
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out = b.ck(1, 0) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={1210} k={reveal(f, b.ck(0, 0) - 2, out)}>
        <Chip text="スコーンで夕食を待つ" size={50} accent={AFTERNOON} />
      </Layer>
      <Layer x={SAFE_CX} y={1320} k={reveal(f, b.ck(0, 2) - 2, out)}>
        <Chip text="お肉と紅茶で夕食に" size={50} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={1195} k={reveal(f, b.ck(1, 0) - 2)}>
        <SummaryCard f={f} at={b.ck(1, 0) - 2} />
      </Layer>
    </>
  );
};

export const OUTRO: SceneDefP = {
  topic: "どちらのティータイム？",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.32,
  light: () => dayLight([0, 0.6, 0]),
};
