import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CrossMark, GOLD, HeightArrow, Note } from "../labels";
import { pop } from "../three/props";
import { dayLight, HIGH, HIGH_TOP, HighTable, LowSet, SupperItems } from "./set";
import { SceneDefP } from "../types";

// Line 2: by day, the two tables side by side in depth; 「値段」 gets a red ✕ and a gold height arrow climbs
// beside the dining table (テーブルの高さ). Line 3: truck to the high table; it warms (高い食卓で食べる) and a
// working family's supper pops onto it (働く人たちの 晩ごはん).
const FLOOR_AT: V3 = add3(HIGH.pos, [-(HIGH.w / 2 + 0.12), 0, HIGH.d / 2]);
const TOP_AT: V3 = add3(FLOOR_AT, [0, HIGH.h, 0]);

const coreShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.35, 2.4, 9.6], target: [0.05, 0.75, 0], fov: 30, focus: [0, 0.6, 0], aperture: 3 }],
      [b.ln(1) - 4, { pos: add3(HIGH_TOP, [-0.15, 2.5, 3.9]), target: add3(HIGH_TOP, [0, -0.2, 0]), fov: 30, focus: HIGH_TOP, aperture: 6 }, 45],
    ]),
    b.f,
  );

const CoreWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const at = b.ck(1, 2) - 4;
  return (
    <>
      {f < b.ln(1) + 30 && <LowSet f={f} />}
      <HighTable glow={ease(f, b.ck(1, 1), 10, EASE.out)}>
        <SupperItems f={f} s={{ pie: pop(f, at), bread: pop(f, at + 4), toast: pop(f, at + 8), teaFill: 0.7 }} />
      </HighTable>
    </>
  );
};

const CoreOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const l3 = b.ln(1) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 1) - 2, b.ck(0, 2) - 2)}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Chip text="¥ 値段" size={60} accent={GOLD} />
          <div style={{ position: "absolute" }}>
            <CrossMark f={f} at={b.ck(0, 1) + 6} size={170} />
          </div>
        </div>
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 2) - 2, l3)}>
        <Headline text="テーブルの高さ" size={96} f={f} at={b.ck(0, 2) - 2} sweepAt={b.ck(0, 2) + 12} />
      </Layer>
      {f < l3 + 8 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - ease(f, l3, 8, EASE.in) }}>
          <HeightArrow from={project2(shot, FLOOR_AT)} to={project2(shot, TOP_AT)} f={f} at={b.ck(0, 2)} label="高い" left />
        </div>
      )}
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(1, 1) - 2)}>
        <Chip text="高い食卓で" size={52} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(1, 2) - 2)}>
        <Headline text="働く人の晩ごはん" size={90} f={f} at={b.ck(1, 2) - 2} sweepAt={b.ck(1, 3)} />
      </Layer>
      <Layer x={SAFE_CX} y={1395} k={reveal(f, b.ck(1, 4))}>
        <Note text="※ 名前の由来には諸説あります" />
      </Layer>
    </>
  );
};

export const CORE: SceneDefP = {
  topic: "「ハイ」の正体",
  shot: coreShot,
  World: CoreWorld,
  Overlay: CoreOverlay,
  dipIn: true,
  bloom: () => 0.3,
  light: () => dayLight([0, 0.6, 0]),
};
