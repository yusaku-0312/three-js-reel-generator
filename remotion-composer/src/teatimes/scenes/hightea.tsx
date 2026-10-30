import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AFTERNOON, HeightArrow, HIGH_AMBER, TimeBar } from "../labels";
import { pop } from "../../hightea/three/props";
import { dayLight, HIGH, HIGH_TOP, HighTable, LOW, LOW_TOP, LowTea, SupperItems, WIDE } from "./set";
import { SceneDefP } from "../types";

// Line 6: the high table close; it warms on 「夕食」. Line 7: the 15–17 band is joined by 17–19 (amber);
// the meat pie pops in (肉のパイ), then toast and bread (しっかりした料理), the pot pours (並びました).
// Line 8 (through a flash): both tables wide; a short arrow on the low table (低いテーブル) and a tall
// one on the high table (高い食卓).
const PLACE_LINE = 2;
const atWide = (b: Beat) => b.f >= b.ln(PLACE_LINE) - 4;

const LOW_FLOOR: V3 = add3(LOW.pos, [0, 0, LOW.d / 2 + 0.06]);
const HIGH_FLOOR: V3 = add3(HIGH.pos, [0, 0, HIGH.d / 2 + 0.06]);

const closeShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: add3(HIGH_TOP, [-0.15, 2.5, 3.9]), target: add3(HIGH_TOP, [0, -0.2, 0]), fov: 30, focus: HIGH_TOP, aperture: 6 }],
      [b.ck(1, 2) - 6, { pos: add3(HIGH_TOP, [-0.1, 2.2, 3.3]), target: add3(HIGH_TOP, [0, -0.15, 0]), fov: 30, focus: HIGH_TOP, aperture: 7 }, 50],
    ]),
    b.f,
  );

const wideShot = (b: Beat): Shot2 =>
  breathe(keys2(b.f, [[b.ln(PLACE_LINE) - 4, WIDE(0.25)], [b.ln(PLACE_LINE) - 4, { ...WIDE(0.25), pos: [0.3, 2.3, 9.0] }, 120]]), b.f);

const HighteaWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (atWide(b))
    return (
      <>
        <LowTea f={f} fill={[1, 1, 1]} />
        <HighTable>
          <SupperItems f={f + 200} s={{ pie: 1, toast: 1, bread: 1, teaFill: 0.7 }} />
        </HighTable>
        <Glow pos={add3(LOW_TOP, [0, 0.3, 0])} size={1.4} color={AFTERNOON} intensity={ease(f, b.ck(PLACE_LINE, 3), 10, EASE.out) * 0.35} />
        <Glow pos={add3(HIGH_TOP, [0, 0.3, 0])} size={1.5} color={HIGH_AMBER} intensity={ease(f, b.ck(PLACE_LINE, 5), 10, EASE.out) * 0.35} />
      </>
    );
  const foodAt = b.ck(1, 3) - 2;
  return (
    <HighTable glow={ease(f, b.ck(0, 3) - 2, 10, EASE.out) * (1 - ease(f, b.ln(1), 20))}>
      <SupperItems f={f} s={{ pie: pop(f, b.ck(1, 2) - 2), toast: pop(f, foodAt), bread: pop(f, foodAt + 5), pourAt: b.ck(1, 4) - 4, pourDur: 30 }} />
    </HighTable>
  );
};

const HighteaOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const l7 = b.ln(1) - 4;
  const l8 = b.ln(PLACE_LINE) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0), b.ck(0, 1) + 10)}>
        <Chip text="いっぽう ハイティー" size={54} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 1) + 12, l7)}>
        <Chip text="働く人たち" size={54} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(0, 2) - 2, l7)}>
        <Headline text="仕事のあとの夕食" size={88} f={f} at={b.ck(0, 2) - 2} sweepAt={b.ck(0, 3)} />
      </Layer>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(1, 0) - 2, l8)}>
        <TimeBar
          f={f}
          bands={[
            { from: 15, to: 17, at: -100, color: AFTERNOON, label: "アフタヌーン" },
            { from: 17, to: 19, at: b.ck(1, 1), color: HIGH_AMBER, label: "夕方5〜7時" },
          ]}
        />
      </Layer>
      <Layer x={SAFE_CX} y={1310} k={reveal(f, b.ck(1, 2) - 2, b.ck(1, 3) - 3)}>
        <Chip text="肉のパイ" size={56} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={1310} k={reveal(f, b.ck(1, 3) - 2, l8)}>
        <Chip text="しっかりした料理" size={56} accent={HIGH_AMBER} />
      </Layer>
      {atWide(b) && (
        <>
          <HeightArrow from={project2(shot, LOW_FLOOR)} to={project2(shot, add3(LOW_FLOOR, [0, LOW.h, 0]))} f={f} at={b.ck(PLACE_LINE, 3)} label="低い" />
          <HeightArrow from={project2(shot, HIGH_FLOOR)} to={project2(shot, add3(HIGH_FLOOR, [0, HIGH.h, 0]))} f={f} at={b.ck(PLACE_LINE, 5)} label="高い" />
          <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(PLACE_LINE, 1) - 2, b.ck(PLACE_LINE, 4) - 4)}>
            <Chip text="ソファの前の低いテーブル" size={46} accent={AFTERNOON} />
          </Layer>
          <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(PLACE_LINE, 4) - 2)}>
            <Chip text="高い食卓" size={56} accent={HIGH_AMBER} />
          </Layer>
        </>
      )}
    </>
  );
};

export const HIGHTEA: SceneDefP = {
  topic: "ハイティー",
  shot: (b) => (atWide(b) ? wideShot(b) : closeShot(b)),
  World: HighteaWorld,
  Overlay: HighteaOverlay,
  dipIn: true,
  dipLines: [PLACE_LINE],
  bloom: () => 0.3,
  light: (b) => dayLight(atWide(b) ? [0, 0.6, 0] : HIGH_TOP),
};
