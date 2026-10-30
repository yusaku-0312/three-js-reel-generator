import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CHAI_ACCENT, Hanko, MILK_ACCENT, WordTag } from "../labels";
import { Pin } from "../../chagee/three/parts";
import { MapSheet, WORD_AT } from "../three/map";
import { SceneDefP } from "../types";

// A paper map on the counter. Line 12: a pin in India — chai is Hindi for plain 「お茶」.
// Line 13: China's 茶 (chá) → dotted route to Persia (chāy) → on to India (chai).
// Line 14: a second route China → Japan (ちゃ); all four pins glow and a 同じ茶 seal lands.
const C_MAP: V3 = [(WORD_AT.persia[0] + WORD_AT.japan[0]) / 2, 0, (WORD_AT.india[2] + WORD_AT.china[2]) / 2];
const PIN = 2.6;

const nameShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: add3(C_MAP, [0, 15.5, 7.4]), target: add3(C_MAP, [0, 0, -0.2]), fov: 30, focus: C_MAP, aperture: 1.5 }],
      [0, { pos: add3(C_MAP, [0, 14.6, 6.9]), target: add3(C_MAP, [0, 0, -0.2]), fov: 30, focus: C_MAP, aperture: 1.5 }, 300],
    ]),
    b.f,
    0.02,
  );

type Route = { from: V3; to: V3; at: number };

const routesOf = (b: Beat): Route[] => [
  { from: WORD_AT.china, to: WORD_AT.persia, at: b.ck(1, 1) - 4 },
  { from: WORD_AT.persia, to: WORD_AT.india, at: b.ck(1, 2) - 4 },
  { from: WORD_AT.china, to: WORD_AT.japan, at: b.ck(2, 0) - 2 },
];

const NameWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const glow = ease(f, b.ck(2, 1), 10, EASE.out);
  const pins: Array<[V3, number, string]> = [
    [WORD_AT.india, b.ck(0, 0) - 4, CHAI_ACCENT],
    [WORD_AT.china, b.ck(1, 0) - 4, "#c8372d"],
    [WORD_AT.persia, b.ck(1, 1) + 10, "#2f8f86"],
    [WORD_AT.japan, b.ck(2, 0) + 12, MILK_ACCENT],
  ];
  return (
    <>
      <MapSheet />
      {pins.map(([at, drop, color]) => (
        <React.Fragment key={drop}>
          <Pin at={at} f={f} dropAt={drop} size={PIN} color={color} />
          <Glow pos={add3(at, [0, 0.5, 0])} size={0.9} color="#ffe2a8" intensity={glow * 0.6} />
        </React.Fragment>
      ))}
    </>
  );
};

/** Dotted route between two projected points, bowed upward on screen, revealed dot by dot from `at`. */
const DottedRoute: React.FC<{ shot: Shot2; r: Route; f: number }> = ({ shot, r, f }) => {
  const a = project2(shot, add3(r.from, [0, 0.3, 0]));
  const c = project2(shot, add3(r.to, [0, 0.3, 0]));
  const k = ease(f, r.at, 20, EASE.inOut);
  if (k <= 0) return null;
  const n = 18;
  const bow = Math.min(120, Math.hypot(c.x - a.x, c.y - a.y) * 0.25);
  const mid = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 - bow };
  const dots = Array.from({ length: n + 1 }, (_, i) => i / n).filter((t) => t <= k);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {dots.map((t) => {
        const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mid.x + t * t * c.x;
        const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * mid.y + t * t * c.y;
        return <circle key={t} cx={x} cy={y} r={9} fill="#c8372d" stroke="#fff6e6" strokeWidth={4} />;
      })}
    </svg>
  );
};

const NameOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const at = (p: V3, dy: number) => {
    const q = project2(shot, add3(p, [0, 0.3, 0]));
    return { x: q.x, y: q.y + dy };
  };
  const india = at(WORD_AT.india, 105);
  const china = at(WORD_AT.china, -115);
  const persia = { ...at(WORD_AT.persia, -115), x: at(WORD_AT.persia, 0).x + 95 };
  const japan = { ...at(WORD_AT.japan, 105), x: at(WORD_AT.japan, 0).x - 60 };
  return (
    <>
      {routesOf(b).map((r, i) => (
        <DottedRoute key={i} shot={shot} r={r} f={f} />
      ))}
      <Layer x={india.x} y={india.y} k={1} rise={0}>
        <WordTag word="チャイ" note="ヒンディー語" f={f} at={b.ck(0, 0)} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={china.x} y={china.y} k={1} rise={0}>
        <WordTag word="茶（チャ）" note="中国" f={f} at={b.ck(1, 0)} accent="#ff8a7a" />
      </Layer>
      <Layer x={persia.x} y={persia.y} k={1} rise={0}>
        <WordTag word="チャーイ" note="ペルシャ語" f={f} at={b.ck(1, 1) + 10} accent="#7fe0d3" />
      </Layer>
      <Layer x={japan.x} y={japan.y} k={1} rise={0}>
        <WordTag word="ちゃ" note="日本語" f={f} at={b.ck(2, 0) + 12} accent={MILK_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 1) - 2, b.ln(1) - 4)}>
        <Chip text="ヒンディー語で" size={54} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1290} k={reveal(f, b.ck(0, 2) - 2, b.ln(1) - 4)}>
        <Headline text="チャイ ＝ お茶" size={110} f={f} at={b.ck(0, 2) - 2} sweepAt={b.ck(0, 2) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={1260} k={1} rise={0}>
        <Hanko f={f} at={b.ck(2, 1)} lines={["同じ", "茶"]} />
      </Layer>
    </>
  );
};

export const NAME: SceneDefP = {
  topic: "チャイの意味",
  shot: nameShot,
  World: NameWorld,
  Overlay: NameOverlay,
  dipIn: true,
  bloom: () => 0.3,
  light: () => ({ keyAt: C_MAP, keyAngle: 0.45, key: 3.0, fill: 0.5, front: 0.55, rim: 0.9, bokeh: 0.2 }),
};
