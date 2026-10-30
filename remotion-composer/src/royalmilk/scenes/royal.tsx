import React from "react";
import { add3, Beat, lerp, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { CupPose, teaSurface } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { DrinkChip, RatioBars, ROYAL_GOLD } from "../labels";
import { Burner, MilkCup, MilkPan, PAN_INNER, panSurface } from "../three/kitchen";
import { Bubbles, LIQUID, mixHex, PourStream, pourSlice, TeaLeaves } from "../three/liquid";
import { BURNER, PAN } from "./set";
import { DEFAULT_LIGHTING } from "../three/stage";
import { SceneDefP } from "../types";

// Line 3: a milk pan of white milk on a blue flame; tea leaves fall in (茶葉を 牛乳で) and the milk slowly takes
// their colour while it simmers (じっくり煮出します).
// Line 4: ratio bars (お湯 少し / 牛乳 たっぷり); it thickens to deep cream (コクが深く), then the camera trucks right
// to a cup that fills with it from the pan off-frame (まろやかに).
const PAN_FILL = 0.62;
const TOP = panSurface(PAN, PAN_FILL);
const CUP: CupPose = { pos: [2.5, 0, 0.7], scale: 0.85, yaw: -0.5 };
const CUP_FULL = 0.76;

const cupPour = (b: Beat) => ({ start: b.ck(1, 3) - 10, dur: 30 });

const royalShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.2, 5.4, 7.0], target: [0, 0.3, 0], fov: 30, focus: TOP, aperture: 7 }],
      [b.ck(0, 4) - 4, { pos: [0.15, 4.8, 6.1], target: [0, 0.32, 0], fov: 30, focus: TOP, aperture: 8 }, 60],
      [b.ck(1, 2) - 6, { pos: [2.65, 3.3, 7.0], target: [2.5, 0.45, 0.7], fov: 30, focus: teaSurface(CUP, 0.7), aperture: 8 }, 36],
    ]),
    b.f,
  );

/** 0 = white milk, 1 = royal cream; a second stage deepens it (コクが深く). */
const brewOf = (b: Beat) => ease(b.f, b.ck(0, 4) - 4, b.ck(1, 2) - b.ck(0, 4), EASE.inOut);
const deepOf = (b: Beat) => ease(b.f, b.ck(1, 2) - 8, 24, EASE.inOut);

const RoyalWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const brew = brewOf(b);
  const deep = deepOf(b);
  const swirl = ease(f, b.ck(0, 4) - 10, 200, EASE.inOut) * 7;
  const p = cupPour(b);
  const cupFill = CUP_FULL * ease(f, p.start + 3, p.dur, EASE.inOut);
  const cupTop = teaSurface(CUP, Math.max(cupFill, 0.05));
  const from: V3 = [CUP.pos[0] - 1.1, 3.6, CUP.pos[2] - 0.2];
  const potColour = mixHex(mixHex(LIQUID.milk, "#e6cfae", brew), LIQUID.royal, deep);
  return (
    <>
      <Burner pos={BURNER} flame={1} f={f} />
      <MilkPan
        pos={PAN}
        fill={PAN_FILL}
        s={{ from: potColour, to: potColour, spread: 0, mix: 1, glow: 0.08 }}
      >
        <TeaLeaves center={TOP} radius={PAN_INNER} f={f} landAt={b.ck(0, 2) - 2} open={brew * 0.6} swirl={swirl} sink={deep} />
        <Bubbles center={TOP} radius={PAN_INNER} f={f} boil={0.35 * ease(f, b.ck(0, 4) - 4, 20)} color={potColour} />
      </MilkPan>
      <Steam base={TOP} f={f} width={0.55} opacity={1.2 * ease(f, b.ck(0, 4), 30)} />
      <MilkCup pose={CUP} fill={cupFill} s={{ from: LIQUID.royal, to: LIQUID.royal, spread: 0, mix: 1, glow: 0.1 }} />
      <PourStream from={from} to={add3(cupTop, [-0.08, 0, 0])} color="#e8c9a0" radius={0.07} f={f} bend={0.1} {...pourSlice(f, p.start, p.dur)} />
      <Glow pos={add3(cupTop, [0, 0.25, 0])} size={1.2} color="#ffe2b0" intensity={0.5 * ease(f, b.ck(1, 4) - 4, 10) * (1 - ease(f, b.ck(1, 4) + 16, 20))} />
      <Sparkles center={add3(cupTop, [0, 0.3, 0])} f={f - b.ck(1, 4)} mode="burst" count={12} radius={0.55} size={0.05} seed={51} color="#fff0c8" intensity={2} />
    </>
  );
};

const RoyalOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const barsOut = b.ck(1, 2) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={575} k={reveal(f, b.ck(0, 1) - 2)}>
        <DrinkChip kind="royal" size={54} />
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 4), b.ck(1, 0) - 6)}>
        <Chip text="茶葉を牛乳で煮出す" size={54} accent={ROYAL_GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={1290} k={reveal(f, b.ck(1, 0) - 2, barsOut)}>
        <RatioBars f={f} waterAt={b.ck(1, 0)} milkAt={b.ck(1, 1)} />
      </Layer>
      <Layer x={SAFE_CX} y={1250} k={reveal(f, b.ck(1, 2))}>
        <Chip text="コクが深い" size={56} accent={ROYAL_GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={1350} k={reveal(f, b.ck(1, 3))}>
        <Chip text="まろやか" size={56} accent={ROYAL_GOLD} />
      </Layer>
    </>
  );
};

export const ROYAL: SceneDefP = {
  topic: "ロイヤルミルクティー",
  shot: royalShot,
  World: RoyalWorld,
  Overlay: RoyalOverlay,
  dipIn: true,
  bloom: () => 0.34,
  light: (b) => {
    const toCup = ease(b.f, b.ck(1, 2) - 6, 36);
    return { ...DEFAULT_LIGHTING, keyAt: [lerp(0, CUP.pos[0], toCup), 0.4, lerp(0, CUP.pos[2], toCup)] };
  },
};
