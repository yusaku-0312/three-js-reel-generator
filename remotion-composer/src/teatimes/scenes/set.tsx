import React from "react";
import { Cup, CupPose, teaSurface } from "../../golden2/three/models";
import { Steam } from "../../paradise/three/fx";
import { Candle, onTable, Sofa, Table } from "../../hightea/three/props";
import { HIGH, LOW } from "../../hightea/scenes/set";
import { AfternoonStand } from "../three/stand";
import { V3 } from "../core";

// The same room as the high-tea reel (src/hightea/scenes/set.tsx): low table + sofa front left, high
// dining table back right. Here the low table carries the three-tier stand whose tiers fill one by one.
export { dayLight, HIGH, HIGH_TOP, HighTable, LOW, LOW_TOP, nightLight, SupperItems } from "../../hightea/scenes/set";

const CUP_S = 0.13;
export const LOW_STAND: V3 = onTable(LOW, 0.02, -0.08);
export const LOW_STAND_S = 0.8;
export const HOTEL_STAND: V3 = onTable(HIGH, -0.25, -0.12);
export const HOTEL_STAND_S = 1.0;

type Tiers = [number, number, number];

/** Low table and sofa with the stand; `fill` pops each tier's food, `glow` lights a tier, `cups` 0..1. */
export const LowTea: React.FC<{ f: number; fill: Tiers; glow?: Tiers; cups?: number; tableGlow?: number }> = ({ f, fill, glow, cups = 1, tableGlow = 0 }) => {
  const cupA: CupPose = { pos: onTable(LOW, -0.3, 0.1), scale: CUP_S * cups, yaw: 0.4 };
  const cupB: CupPose = { pos: onTable(LOW, 0.32, 0.08), scale: CUP_S * cups, yaw: 2.6 };
  return (
    <>
      <Table t={LOW} glow={tableGlow} />
      <Sofa pos={[-0.5, 0, 0.45]} scale={0.75} />
      <AfternoonStand pos={LOW_STAND} s={LOW_STAND_S} fill={fill} glow={glow} />
      {cups > 0.02 && <Cup pose={cupA} fill={0.7} />}
      {cups > 0.02 && <Cup pose={cupB} fill={0.7} />}
      {cups > 0.5 && <Steam base={teaSurface(cupA, 0.7)} f={f} width={0.08} opacity={0.6} seed={2} />}
    </>
  );
};

const HOTEL_CUP: CupPose = { pos: onTable(HIGH, 0.25, 0.2), scale: CUP_S, yaw: 0.5 };

/** A lavish hotel afternoon tea on the high table at night (sold abroad as "high tea"). */
export const HotelSweets: React.FC<{ f: number; glow?: Tiers }> = ({ f, glow }) => (
  <>
    <AfternoonStand pos={HOTEL_STAND} s={HOTEL_STAND_S} fill={[1, 1, 1]} glow={glow} />
    <Cup pose={HOTEL_CUP} fill={0.7} />
    <Steam base={teaSurface(HOTEL_CUP, 0.7)} f={f} width={0.06} opacity={0.6} seed={4} />
    <Candle pos={onTable(HIGH, 0.5, -0.28)} f={f} seed={1} />
    <Candle pos={onTable(HIGH, -0.55, 0.26)} f={f} seed={2} />
  </>
);

/** Both tables in one frame (low front left, high back right). `lift` raises the camera aim so the tables
 * sit lower on screen (negative) or higher (positive, to leave room for a card underneath). */
export const WIDE = (lift = 0) => ({
  pos: [0.35, 2.4 - lift * 0.4, 9.6] as V3,
  target: [0.05, 0.75 - lift, 0] as V3,
  fov: 30,
  focus: [0, 0.6, 0] as V3,
  aperture: 3,
});
