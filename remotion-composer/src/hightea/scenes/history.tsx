import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AFTERNOON, Clock, CrossMark, GOLD, HIGH_AMBER } from "../labels";
import { pop } from "../three/props";
import { dayLight, HIGH_TOP, HighTable, LOW_TOP, LowSet, SupperItems } from "./set";
import { SceneDefP } from "../types";

// Lines 4–5: the low table and sofa. A clock sweeps to eight (夕食が夜8時ごろ); the low table warms (ソファの前の
// 低いテーブルで) and a sweets stand and two cups pop onto it → 「アフタヌーンティー」.
// Lines 6–7 (through a flash): the high table with chairs; it warms (台所の高いテーブルで), pie and cheese toast pop
// in, the pot pours (熱い紅茶). 「おやつ」 gets a ✕ → いちばん大事な食事.
const HIGH_LINE = 2;

const lowShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: add3(LOW_TOP, [0.3, 2.1, 4.3]), target: add3(LOW_TOP, [0, 0.05, -0.25]), fov: 30, focus: LOW_TOP, aperture: 6 }],
      [b.ck(1, 2) - 6, { pos: add3(LOW_TOP, [0.25, 1.9, 3.6]), target: add3(LOW_TOP, [0, 0.05, -0.15]), fov: 30, focus: LOW_TOP, aperture: 7 }, 50],
    ]),
    b.f,
  );

const highShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [b.ln(HIGH_LINE) - 4, { pos: add3(HIGH_TOP, [-0.15, 2.5, 3.9]), target: add3(HIGH_TOP, [0, -0.2, 0]), fov: 30, focus: HIGH_TOP, aperture: 6 }],
      [b.ck(2, 4) - 4, { pos: add3(HIGH_TOP, [-0.1, 2.2, 3.3]), target: add3(HIGH_TOP, [0, -0.15, 0]), fov: 30, focus: HIGH_TOP, aperture: 7 }, 50],
    ]),
    b.f,
  );

const onHigh = (b: Beat) => b.f >= b.ln(HIGH_LINE) - 4;

const HistoryWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const standAt = b.ck(1, 3) - 2;
  const highGlow = ease(f, b.ck(2, 4), 10, EASE.out);
  return (
    <>
      {!onHigh(b) && <LowSet f={f} k={pop(f, standAt)} glow={ease(f, b.ck(1, 2), 10, EASE.out) * (1 - ease(f, b.ck(1, 4), 20))} />}
      <Sparkles center={add3(LOW_TOP, [0, 0.5, 0])} f={f - b.ck(1, 5)} mode="burst" count={12} radius={0.45} size={0.04} seed={31} color="#ffe0ea" intensity={2} />
      <HighTable glow={highGlow * (1 - ease(f, b.ck(2, 5), 20))}>
        {onHigh(b) && (
          <SupperItems f={f} s={{ pie: pop(f, b.ck(2, 5) - 2), toast: pop(f, b.ck(2, 6) - 2), bread: pop(f, b.ck(2, 5) + 4), pourAt: b.ck(2, 7) - 4, pourDur: 34 }} />
        )}
      </HighTable>
      <Glow pos={add3(HIGH_TOP, [0, 0.35, 0])} size={1.6} color="#ffcf8a" intensity={ease(f, b.ck(3, 1), 10, EASE.out) * 0.35} />
    </>
  );
};

const HistoryOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const l5 = b.ln(1) - 4;
  const l6 = b.ln(HIGH_LINE) - 6;
  const l7 = b.ln(3) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(0, 0), l5)}>
        <Chip text="19世紀のイギリス" size={52} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={1185} k={reveal(f, b.ck(0, 2) - 2, l5)}>
        <Clock f={f} at={b.ck(0, 2)} hour={8} caption="夕食は夜8時ごろ" />
      </Layer>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(1, 2) - 2, l6)}>
        <Chip text="ソファの前の低いテーブル" size={46} accent={AFTERNOON} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(1, 5) - 2, l6)}>
        <Headline text="アフタヌーンティー" size={80} f={f} at={b.ck(1, 5) - 2} sweepAt={b.ck(1, 5) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(2, 1), b.ck(2, 4) - 4)}>
        <Chip text="工場や農場で働く人" size={50} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(2, 4) - 2, l7)}>
        <Chip text="台所の高いテーブル" size={50} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(3, 0) - 2)}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Chip text="おやつ" size={56} accent={AFTERNOON} />
          <div style={{ position: "absolute" }}>
            <CrossMark f={f} at={b.ck(3, 0) + 6} size={160} />
          </div>
        </div>
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(3, 1) - 2)}>
        <Headline text="いちばん大事な食事" size={90} f={f} at={b.ck(3, 1) - 2} sweepAt={b.ck(3, 2)} />
      </Layer>
    </>
  );
};

export const HISTORY: SceneDefP = {
  topic: "ふたつのティータイム",
  shot: (b) => (onHigh(b) ? highShot(b) : lowShot(b)),
  World: HistoryWorld,
  Overlay: HistoryOverlay,
  dipIn: true,
  dipLines: [HIGH_LINE],
  bloom: () => 0.3,
  light: (b) => dayLight(onHigh(b) ? HIGH_TOP : LOW_TOP),
};
