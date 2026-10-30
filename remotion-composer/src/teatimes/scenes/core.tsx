import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AFTERNOON, HIGH_AMBER } from "../labels";
import { dayLight, HIGH_TOP, HighTable, LOW_TOP, LowTea, SupperItems, WIDE } from "./set";
import { SceneDefP } from "../types";

// Line 2: by day, both tables. 「いちばんの違い」, then the low table glows pink (夕食の前) and the high
// table amber (夕食そのもの), each with its tag.
const coreShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, WIDE(0.1)],
      [0, { ...WIDE(0.1), pos: [0.3, 2.3, 8.8] }, b.dur],
    ]),
    b.f,
  );

const CoreWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const before = ease(f, b.ck(0, 1), 10, EASE.out);
  const itself = ease(f, b.ck(0, 2), 10, EASE.out);
  return (
    <>
      <LowTea f={f} fill={[1, 1, 1]} />
      <HighTable>
        <SupperItems f={f} s={{ pie: 1, toast: 1, bread: 1, teaFill: 0.7 }} />
      </HighTable>
      <Glow pos={add3(LOW_TOP, [0, 0.3, 0])} size={1.5} color={AFTERNOON} intensity={before * 0.4} />
      <Glow pos={add3(HIGH_TOP, [0, 0.3, 0])} size={1.6} color={HIGH_AMBER} intensity={itself * 0.4} />
    </>
  );
};

const CoreOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0) - 2, b.ck(0, 2) - 4)}>
        <Headline text="いちばんの違い" size={92} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 0) + 10} />
      </Layer>
      <Layer x={SAFE_CX} y={1320} k={reveal(f, b.ck(0, 1) - 2)}>
        <Chip text="アフタヌーンティー ＝ 夕食の前" size={48} accent={AFTERNOON} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 2) - 2)}>
        <Chip text="ハイティー ＝ 夕食そのもの" size={50} accent={HIGH_AMBER} />
      </Layer>
    </>
  );
};

export const CORE: SceneDefP = {
  topic: "いちばんの違い",
  shot: coreShot,
  World: CoreWorld,
  Overlay: CoreOverlay,
  dipIn: true,
  bloom: () => 0.3,
  light: () => dayLight([0, 0.6, 0]),
};
