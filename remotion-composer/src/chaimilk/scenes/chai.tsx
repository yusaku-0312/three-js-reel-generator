import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Steam } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CHAI_ACCENT, StepChip, StrengthBars } from "../labels";
import { Burner, MilkPan, PAN_INNER, panSurface } from "../../royalmilk/three/kitchen";
import { Bubbles, LIQUID, mixHex, TeaLeaves } from "../../royalmilk/three/liquid";
import { CHAI } from "../three/parts";
import { BURNER, PAN } from "./set";
import { SceneDefP } from "../types";

// Line 4: a pan of white milk; tea leaves fall in (茶葉をミルクと一緒に), the blue flame lights (鍋で), and it boils
// up and takes the chai colour (ぐつぐつ煮出します). Line 5: it deepens; strength bars (ミルクに負けない 濃い味).
export const PAN_FILL = 0.62;
export const PAN_TOP = panSurface(PAN, PAN_FILL);

export type PanState = { brew: number; boil: number; flame: number; swirl: number; landAt: number; sink: number };

/** Pan colour: milk → chai as it brews, deeper still at `deep`. */
export const panColour = (brew: number, deep = 0) => mixHex(mixHex(LIQUID.milk, CHAI.done, brew), CHAI.deep, deep);

/** Burner, pan, leaves, bubbles and steam (shared with the masala scene). */
export const ChaiPan: React.FC<{ f: number; s: PanState; deep?: number; children?: React.ReactNode }> = ({ f, s, deep = 0, children }) => {
  const colour = panColour(s.brew, deep);
  return (
    <>
      <Burner pos={BURNER} flame={s.flame} f={f} />
      <MilkPan pos={PAN} fill={PAN_FILL} s={{ from: colour, to: colour, spread: 0, mix: 1, glow: 0.08 }}>
        <TeaLeaves center={PAN_TOP} radius={PAN_INNER} f={f} landAt={s.landAt} open={s.brew * 0.6} swirl={s.swirl} sink={s.sink} />
        <Bubbles center={PAN_TOP} radius={PAN_INNER} f={f} boil={s.boil} color={colour} />
      </MilkPan>
      <Steam base={PAN_TOP} f={f} width={0.55} opacity={1.3 * s.boil + 0.2 * s.flame} />
      {children}
    </>
  );
};

export const panShot = (b: Beat, closeAt: number): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.2, 5.4, 7.0], target: [0, 0.3, 0], fov: 30, focus: PAN_TOP, aperture: 7 }],
      [closeAt, { pos: [0.15, 4.8, 6.1], target: [0, 0.32, 0], fov: 30, focus: PAN_TOP, aperture: 8 }, 60],
    ]),
    b.f,
  );

const stateOf = (b: Beat): PanState => ({
  brew: ease(b.f, b.ck(0, 3) - 6, b.ln(1) - b.ck(0, 3) + 6, EASE.inOut),
  boil: 0.7 * ease(b.f, b.ck(0, 3) - 6, 14),
  flame: ease(b.f, b.ck(0, 2) - 2, 6, EASE.out),
  swirl: ease(b.f, b.ck(0, 3) - 10, 200, EASE.inOut) * 7,
  landAt: b.ck(0, 1) - 2,
  sink: ease(b.f, b.ln(1), 30),
});

const ChaiWorld: React.FC<{ b: Beat }> = ({ b }) => (
  <ChaiPan f={b.f} s={stateOf(b)} deep={ease(b.f, b.ck(1, 2) - 4, 20, EASE.inOut)} />
);

const ChaiOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const stepsOut = b.ln(1) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={580} k={reveal(f, b.ck(0, 0) - 2)}>
        <Headline text="チャイ" size={110} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 0) + 14} />
      </Layer>
      <Layer x={SAFE_CX} y={1235} k={reveal(f, b.ck(0, 1), stepsOut)}>
        <StepChip n="1" text="ミルク＋茶葉" size={46} />
      </Layer>
      <Layer x={SAFE_CX} y={1345} k={reveal(f, b.ck(0, 2), stepsOut)}>
        <StepChip n="2" text="鍋で煮出す" size={46} />
      </Layer>
      <Layer x={SAFE_CX + 210} y={720} k={reveal(f, b.ck(0, 3), b.ln(1) + 6)}>
        <Chip text="ぐつぐつ" size={48} accent={CHAI_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1250} k={reveal(f, b.ck(1, 1) - 4)}>
        <StrengthBars f={f} milkAt={b.ck(1, 1)} chaiAt={b.ck(1, 2) - 2} />
      </Layer>
    </>
  );
};

export const CHAI_SCENE: SceneDefP = {
  topic: "チャイは",
  shot: (b) => panShot(b, b.ck(0, 3) - 4),
  World: ChaiWorld,
  Overlay: ChaiOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
