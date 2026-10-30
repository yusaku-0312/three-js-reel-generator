import React from "react";
import { add3, lerp, lerp3, V3 } from "../core";
import { ease, EASE } from "../../golden2/shot";
import { Cup, CupPose, PotPose, Teapot, teaSurface } from "../../golden2/three/models";
import { Steam } from "../../paradise/three/fx";
import { PourStream, pourSlice } from "../../royalmilk/three/liquid";
import { Lighting } from "../../royalmilk/three/stage";
import {
  Bread,
  Candle,
  Chair,
  CheeseToast,
  Flute,
  HIGH_TABLE_H,
  LOW_TABLE_H,
  MeatPie,
  onTable,
  RoastBeef,
  Sofa,
  Table,
  TableSpec,
  TieredStand,
} from "../three/props";

// One room for the whole reel, standing on the counter floor: a low coffee table with a sofa front left
// (afternoon tea) and a tall dining table with two chairs back right (high tea). 9:16 is narrow, so they are
// staggered in depth rather than side by side.
export const LOW: TableSpec = { pos: [-0.5, 0, 1.1], w: 1.0, d: 0.6, h: LOW_TABLE_H };
export const HIGH: TableSpec = { pos: [0.5, 0, -0.9], w: 1.3, d: 0.85, h: HIGH_TABLE_H };
const SOFA: V3 = [-0.5, 0, 0.45];
const CUP_S = 0.13;

export const LOW_TOP = onTable(LOW);
export const HIGH_TOP = onTable(HIGH);

export const dayLight = (keyAt: V3): Lighting => ({ keyAt, keyAngle: 0.5, key: 3.0, fill: 0.42, front: 0.45, rim: 1.2, bokeh: 0.5 });
export const nightLight = (keyAt: V3): Lighting => ({ keyAt, keyAngle: 0.32, key: 2.1, fill: 0.22, front: 0.28, rim: 0.8, bokeh: 1.1 });

/** Low table, sofa, and (when `k` > 0) a sweets stand and two cups: afternoon tea. */
export const LowSet: React.FC<{ f: number; k?: number; glow?: number }> = ({ f, k = 0, glow = 0 }) => {
  const cupA: CupPose = { pos: onTable(LOW, -0.3, 0.1), scale: CUP_S * k, yaw: 0.4 };
  const cupB: CupPose = { pos: onTable(LOW, 0.32, 0.08), scale: CUP_S * k, yaw: 2.6 };
  return (
    <>
      <Table t={LOW} glow={glow} />
      <Sofa pos={SOFA} scale={0.75} />
      <TieredStand pos={onTable(LOW, 0.02, -0.08)} s={k * 0.8} />
      {k > 0.02 && <Cup pose={cupA} fill={0.7} />}
      {k > 0.02 && <Cup pose={cupB} fill={0.7} />}
      {k > 0.5 && <Steam base={teaSurface(cupA, 0.7)} f={f} width={0.08} opacity={0.6} seed={2} />}
    </>
  );
};

// ---------------------------------------------------------------------------
// High table: chairs at both ends; supper (pie, toast, bread, teapot and cup) or the hotel set at night.
// ---------------------------------------------------------------------------

const CUP_HIGH: CupPose = { pos: onTable(HIGH, 0.1, 0.22), scale: CUP_S, yaw: 0.5 };
export const HIGH_CUP_TOP = teaSurface(CUP_HIGH, 0.7);
const POT_REST: V3 = add3(onTable(HIGH, 0.45, -0.15), [0, 0.08, 0]);
const POT_TIP: V3 = add3(HIGH_CUP_TOP, [0.06, 0.14, 0]);

/** Teapot that lifts from its rest, pours into the cup from `at` for `dur` frames, and goes back. */
const potPose = (f: number, at: number, dur: number): PotPose => {
  const go = ease(f, at - 14, 12, EASE.out);
  const back = ease(f, at + dur, 14, EASE.in);
  const tilt = lerp(0.1, 0.6, ease(f, at - 4, 8, EASE.out)) - 0.5 * back;
  return { tip: lerp3(lerp3(POT_REST, POT_TIP, go), POT_REST, back), tilt, scale: 0.065, yaw: Math.PI };
};

export type Supper = { pie: number; toast: number; bread: number; pourAt?: number; pourDur?: number; teaFill?: number };

export const HighTable: React.FC<{ glow?: number; children?: React.ReactNode }> = ({ glow = 0, children }) => (
  <>
    <Table t={HIGH} glow={glow} />
    <Chair pos={add3(HIGH.pos, [-0.85, 0, 0])} yaw={Math.PI / 2} />
    <Chair pos={add3(HIGH.pos, [0.85, 0, 0])} yaw={-Math.PI / 2} />
    {children}
  </>
);

/** A working family's supper on the high table. */
export const SupperItems: React.FC<{ f: number; s: Supper }> = ({ f, s }) => {
  const pourAt = s.pourAt ?? -1000;
  const pourDur = s.pourDur ?? 40;
  const pot = potPose(f, pourAt, pourDur);
  const fill = s.teaFill ?? lerp(0.05, 0.7, ease(f, pourAt + 2, pourDur, EASE.inOut));
  return (
    <>
      <MeatPie pos={onTable(HIGH, -0.33, 0.12)} s={s.pie * 0.75} />
      <CheeseToast pos={onTable(HIGH, 0.0, -0.2)} s={s.toast * 0.75} />
      <Bread pos={onTable(HIGH, -0.38, -0.22)} s={s.bread * 0.75} />
      <Cup pose={CUP_HIGH} fill={fill} />
      <Teapot pose={pot} />
      <PourStream from={pot.tip} to={HIGH_CUP_TOP} color="#8a3a10" radius={0.006} f={f} bend={0.02} {...pourSlice(f, pourAt, pourDur)} />
      {fill > 0.5 && <Steam base={HIGH_CUP_TOP} f={f} width={0.06} opacity={0.6} seed={4} />}
      {s.pie > 0.9 && <Steam base={add3(onTable(HIGH, -0.33, 0.12), [0, 0.1, 0])} f={f + 40} width={0.1} opacity={0.5} seed={9} />}
    </>
  );
};

/** The hotel high tea at night: savoury stand, candles, cup; roast beef and a flute pop in when named. */
export const HotelItems: React.FC<{ f: number; beef: number; flute: number }> = ({ f, beef, flute }) => (
  <>
    <TieredStand pos={onTable(HIGH, -0.3, -0.12)} s={0.95} savory />
    <Cup pose={CUP_HIGH} fill={0.7} />
    <Steam base={HIGH_CUP_TOP} f={f} width={0.06} opacity={0.6} seed={4} />
    <RoastBeef pos={onTable(HIGH, 0.3, -0.08)} s={beef * 0.8} />
    <Flute pos={onTable(HIGH, 0.48, 0.22)} s={flute * 0.95} f={f} />
    <Candle pos={onTable(HIGH, 0.52, -0.3)} f={f} seed={1} />
    <Candle pos={onTable(HIGH, -0.55, 0.26)} f={f} seed={2} />
  </>
);
