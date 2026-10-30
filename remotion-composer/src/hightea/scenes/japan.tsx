import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CompareCard, GOLD, HIGH_AMBER, Note, TimeBar } from "../labels";
import { NightWindow, onTable, pop } from "../three/props";
import { dayLight, HIGH, HIGH_TOP, HighTable, HotelItems, nightLight, SupperItems } from "./set";
import { SceneDefP } from "../types";

// Lines 8–12: the high table at night in a hotel lounge (city lights behind). A day timeline shows high tea
// after afternoon tea (夕方から夜); roast beef and a champagne flute pop in (食事が主役／シャンパンや);
// a comparison card (午後のおやつ／早めの晩ごはん); 仕事帰りの夕食がわりに.
// Line 13 (through a flash): the same table at home by day; pie and cheese toast pop in, the pot pours.
const HOME_LINE = 5;
const atHome = (b: Beat) => b.f >= b.ln(HOME_LINE) - 4;

const hotelShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: add3(HIGH_TOP, [0.1, 1.1, 4.6]), target: add3(HIGH_TOP, [0, 0.35, 0]), fov: 30, focus: HIGH_TOP, aperture: 6 }],
      [b.ck(2, 1) - 6, { pos: add3(HIGH_TOP, [0.3, 1.3, 3.6]), target: add3(HIGH_TOP, [0.1, 0.15, 0]), fov: 30, focus: onTable(HIGH, 0.3, -0.08), aperture: 8 }, 50],
      [b.ln(4) - 6, { pos: add3(HIGH_TOP, [0.05, 1.2, 5.2]), target: add3(HIGH_TOP, [0, 0.4, 0]), fov: 30, focus: HIGH_TOP, aperture: 5 }, 60],
    ]),
    b.f,
  );

const homeShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [b.ln(HOME_LINE) - 4, { pos: add3(HIGH_TOP, [-0.15, 2.5, 3.9]), target: add3(HIGH_TOP, [0, -0.2, 0]), fov: 30, focus: HIGH_TOP, aperture: 6 }],
      [b.ck(5, 2) - 4, { pos: add3(HIGH_TOP, [-0.1, 2.2, 3.3]), target: add3(HIGH_TOP, [0, -0.15, 0]), fov: 30, focus: HIGH_TOP, aperture: 7 }, 60],
    ]),
    b.f,
  );

const JapanWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (atHome(b))
    return (
      <HighTable>
        <SupperItems f={f} s={{ pie: pop(f, b.ck(5, 2) - 2), toast: pop(f, b.ck(5, 2) + 4), bread: pop(f, b.ck(5, 3) - 2), pourAt: b.ck(5, 4) - 4, pourDur: 34 }} />
      </HighTable>
    );
  const beefAt = b.ck(2, 1) - 2;
  const fluteAt = b.ck(2, 3) - 2;
  return (
    <>
      <NightWindow k={1} />
      <HighTable>
        <HotelItems f={f} beef={pop(f, beefAt)} flute={pop(f, fluteAt)} />
      </HighTable>
      <Sparkles center={add3(onTable(HIGH, 0.48, 0.22), [0, 0.3, 0])} f={f - fluteAt} mode="burst" count={10} radius={0.3} size={0.03} seed={14} color="#fff0c8" intensity={2} />
      <Sparkles center={add3(HIGH_TOP, [0, 1.2, -1.5])} f={f - b.ck(4, 0)} mode="rise" count={16} radius={1.4} size={0.04} seed={52} color="#fff0c8" intensity={1.4} />
    </>
  );
};

const JapanOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out = (line: number) => b.ln(line) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(0, 1) - 2, out(1))}>
        <Headline text="日本で楽しむなら？" size={92} f={f} at={b.ck(0, 1) - 2} sweepAt={b.ck(0, 2)} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(1, 0), out(2))}>
        <Chip text="ホテルのハイティー" size={52} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={1270} k={reveal(f, b.ck(1, 1) - 2, out(2))}>
        <TimeBar f={f} afternoonAt={b.ck(1, 1)} highAt={b.ck(1, 3)} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(2, 1) - 2, out(3))}>
        <Chip text="食事が主役" size={54} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(2, 3) - 2, out(3))}>
        <Chip text="シャンパン・カクテルも" size={52} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={1395} k={reveal(f, b.ck(2, 3), out(3))}>
        <Note text="※ お酒は20歳から" />
      </Layer>
      <Layer x={SAFE_CX} y={1240} k={reveal(f, b.ck(3, 0) - 4, out(4))}>
        <CompareCard f={f} aAt={b.ck(3, 0)} bAt={b.ck(3, 2)} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(4, 0), out(HOME_LINE) - 2)}>
        <Chip text="仕事帰りに" size={54} accent={HIGH_AMBER} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(4, 1), out(HOME_LINE) - 2)}>
        <Headline text="夕食がわりに" size={96} f={f} at={b.ck(4, 1)} sweepAt={b.ck(4, 2)} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(5, 0) - 2)}>
        <Headline text="おうちハイティー" size={96} f={f} at={b.ck(5, 0) - 2} sweepAt={b.ck(5, 1)} />
      </Layer>
      <Layer x={SAFE_CX} y={1310} k={reveal(f, b.ck(5, 2))}>
        <Chip text="パイ・チーズトースト＋紅茶" size={46} accent={HIGH_AMBER} />
      </Layer>
    </>
  );
};

export const JAPAN: SceneDefP = {
  topic: "日本で楽しむなら",
  shot: (b) => (atHome(b) ? homeShot(b) : hotelShot(b)),
  World: JapanWorld,
  Overlay: JapanOverlay,
  dipIn: true,
  dipLines: [HOME_LINE],
  bloom: (b) => (atHome(b) ? 0.3 : 0.38),
  light: (b) => (atHome(b) ? dayLight(HIGH_TOP) : nightLight(HIGH_TOP)),
};
