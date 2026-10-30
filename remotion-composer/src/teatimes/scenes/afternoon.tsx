import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AFTERNOON, GOLD, Note, TimeBar } from "../labels";
import { pop } from "../../hightea/three/props";
import { tierAt, TIERS } from "../three/stand";
import { dayLight, LOW_STAND, LOW_STAND_S, LOW_TOP, LowTea } from "./set";
import { SceneDefP } from "../types";

// Line 3: the low table and sofa with an empty stand (1840年ごろ / 公爵夫人 / 夕食までのつなぎ).
// Line 4: a 15–17時 band; the tiers fill as named — sandwiches, scones, cakes.
// Line 5: close on the stand; tiers light ① bottom → ② → ③ top while an arrow climbs (下から上へ).
const ORDER_LINE = 2;

const afternoonShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: add3(LOW_TOP, [0.3, 2.1, 4.3]), target: add3(LOW_TOP, [0, 0.05, -0.25]), fov: 30, focus: LOW_TOP, aperture: 6 }],
      [b.ck(1, 2) - 8, { pos: add3(LOW_TOP, [0.25, 1.8, 3.6]), target: add3(LOW_TOP, [0, 0.1, -0.15]), fov: 30, focus: LOW_STAND, aperture: 7 }, 50],
      [
        b.ln(ORDER_LINE) - 6,
        { pos: add3(LOW_STAND, [0.3, 1.05, 3.0]), target: add3(LOW_STAND, [0.14, 0.18, 0]), fov: 30, focus: add3(LOW_STAND, [0, 0.2, 0]), aperture: 8 },
        45,
      ],
    ]),
    b.f,
  );

/** Frame each tier lights in line 5: bottom on 「下の」, top on 「上の」, middle halfway. */
const tierLit = (b: Beat): [number, number, number] => {
  const lo = b.ck(ORDER_LINE, 1);
  const hi = b.ck(ORDER_LINE, 2);
  return [lo, Math.round((lo + hi) / 2), hi];
};

const AfternoonWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const fill: [number, number, number] = [pop(f, b.ck(1, 2) - 2), pop(f, b.ck(1, 3) - 2), pop(f, b.ck(1, 4) - 2)];
  const lit = tierLit(b);
  const glow = lit.map((at) => ease(f, at, 8, EASE.out)) as [number, number, number];
  return (
    <>
      <LowTea f={f} fill={fill} glow={glow} />
      <Sparkles center={add3(LOW_STAND, [0, 0.4, 0])} f={f - b.ck(1, 4)} mode="burst" count={12} radius={0.35} size={0.03} seed={41} color="#ffe0ea" intensity={2} />
    </>
  );
};

const NUM = ["①", "②", "③"];

const OrderMarks: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const lit = tierLit(b);
  // Arrow just left of the widest (bottom) tier; tier names to the right of the stand.
  const pts = [0, 1, 2].map((i) => project2(shot, tierAt(LOW_STAND, LOW_STAND_S, i)));
  const r = TIERS[0].r * LOW_STAND_S;
  const x = project2(shot, add3(tierAt(LOW_STAND, LOW_STAND_S, 0), [-r, 0, 0])).x - 40;
  const labelX = project2(shot, add3(tierAt(LOW_STAND, LOW_STAND_S, 1), [TIERS[1].r * LOW_STAND_S, 0, 0])).x + 24;
  const climb = ease(f, lit[0], lit[2] - lit[0] + 8, EASE.inOut);
  const y0 = pts[0].y;
  const y1 = y0 + (pts[2].y - y0) * climb;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {climb > 0 && (
          <>
            <line x1={x} y1={y0} x2={x} y2={y1} stroke="#2a150a" strokeWidth={16} strokeLinecap="round" />
            <line x1={x} y1={y0} x2={x} y2={y1} stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
            <polygon points={`${x - 22},${y1 + 22} ${x + 22},${y1 + 22} ${x},${y1 - 10}`} fill={GOLD} stroke="#2a150a" strokeWidth={4} />
          </>
        )}
      </svg>
      {pts.map((p, i) => {
        const k = ease(f, lit[i], 8, EASE.out);
        return (
          <div key={i} style={{ position: "absolute", left: labelX, top: p.y - 34, opacity: k, transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: "left center" }}>
            <Chip text={`${NUM[i]}${["サンドイッチ", "スコーン", "ケーキ"][i]}`} size={38} accent={AFTERNOON} />
          </div>
        );
      })}
    </>
  );
};

const FoodRow: React.FC<{ b: Beat }> = ({ b }) => (
  <div style={{ display: "flex", gap: 20 }}>
    {["サンドイッチ", "スコーン", "ケーキ"].map((t, i) => {
      const k = ease(b.f, b.ck(1, 2 + i) - 2, 8, EASE.out);
      return (
        <div key={t} style={{ opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}>
          <Chip text={t} size={42} accent={AFTERNOON} />
        </div>
      );
    })}
  </div>
);

const AfternoonOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const l4 = b.ln(1) - 4;
  const l5 = b.ln(ORDER_LINE) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 1) - 2, b.ck(0, 2) - 3)}>
        <Chip text="1840年ごろ・イギリス" size={52} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 2) - 2, l4)}>
        <Chip text="公爵夫人が始めたとされる" size={48} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(0, 4) - 2, l4)}>
        <Headline text="夕食までのつなぎ" size={90} f={f} at={b.ck(0, 4) - 2} sweepAt={b.ck(0, 4) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(1, 0) - 2, l5)}>
        <TimeBar f={f} bands={[{ from: 15, to: 17, at: b.ck(1, 1), color: AFTERNOON, label: "午後3〜5時ごろ" }]} />
      </Layer>
      <Layer x={SAFE_CX} y={1320} k={reveal(f, b.ck(1, 2) - 2, l5)}>
        <FoodRow b={b} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(ORDER_LINE, 0) - 2, b.ck(ORDER_LINE, 1) - 3)}>
        <Chip text="3段のスタンド" size={54} accent={GOLD} />
      </Layer>
      {f >= l5 && <OrderMarks b={b} shot={shot} />}
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(ORDER_LINE, 3) - 2)}>
        <Headline text="下から上へ" size={100} f={f} at={b.ck(ORDER_LINE, 3) - 2} sweepAt={b.ck(ORDER_LINE, 3) + 10} />
      </Layer>
      <Layer x={SAFE_CX} y={1405} k={reveal(f, b.ck(ORDER_LINE, 4))}>
        <Note text="※ 食べ方はお店によって異なります" />
      </Layer>
    </>
  );
};

export const AFTERNOON_SCENE: SceneDefP = {
  topic: "アフタヌーンティー",
  shot: afternoonShot,
  World: AfternoonWorld,
  Overlay: AfternoonOverlay,
  dipIn: true,
  bloom: () => 0.3,
  light: () => dayLight(LOW_TOP),
};
