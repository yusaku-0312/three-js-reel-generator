import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { CupPose, teaSurface } from "../../golden2/three/models";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { MilkCup } from "../../royalmilk/three/kitchen";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AskCard } from "../labels";
import { Tin, tinTop } from "../three/tins";
import { ASSAM, DARJ, EARL, EB, EB_S, MILK_TEA_DEEP, morning, TIN_S } from "./set";
import { glowAt } from "./hook";
import { SceneDefP } from "../types";

// Line 0 (dip): the hero tin and a cup of milk tea in morning light; 「特別な日の高級な紅茶」 stays small and
// faint, 「毎日の暮らしに寄り添う紅茶」 lands big. Lines 1–2: all four tins, sparkling in turn, with the
// closing question card underneath (four tea chips, then 「コメントで教えてね」), held to the end.
const OCUP: CupPose = { pos: [0.75, 0, 0.95], scale: 0.7, yaw: Math.PI + 0.6 };
const FOUR_SHOT: Shot2 = { pos: [0, 2.7, 11.9], target: [0, -0.55, 0.1], fov: 30, focus: [0, 0.5, 0.2], aperture: 3 };

const outroShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.2, 3.0, 9.1], target: [0.2, 0.1, 0.85], fov: 30, focus: [0.2, 0.5, 0.9], aperture: 5 }],
      [0, { pos: [0.2, 3.0, 8.75], target: [0.2, 0.1, 0.85], fov: 30, focus: [0.2, 0.5, 0.9], aperture: 5 }, b.ln(1) - 10],
      [b.ln(1) - 10, FOUR_SHOT, 34],
    ]),
    b.f,
  );

const OutroWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const four = ease(f, b.ln(1) - 12, 14, EASE.out);
  const sp = [b.ck(1, 1), b.ck(1, 1) + 6, b.ck(1, 1) + 12, b.ck(1, 2)];
  const surface = teaSurface(OCUP, 0.74);
  return (
    <>
      <Tin kind="eb" pos={EB} scale={EB_S} glow={0.15 + 0.4 * ease(f, b.ck(0, 3), 12, EASE.out) * (1 - four)} />
      <MilkCup pose={{ ...OCUP, scale: OCUP.scale! * (1 - four) }} fill={0.74} s={{ from: MILK_TEA_DEEP, to: MILK_TEA_DEEP, spread: 0, mix: 1, glow: 0.14 }} />
      {four < 0.5 && <Steam base={surface} f={f} width={0.24} opacity={0.75} />}
      <Glow pos={add3(EB, [0, 0.6, -0.4])} size={3} color="#ffe39a" intensity={0.28 * ease(f, b.ck(0, 3), 14, EASE.out)} />
      <Tin kind="earl" pos={EARL} scale={TIN_S} yaw={0.25} k={four} glow={glowAt(f, sp[0])} />
      <Tin kind="darj" pos={DARJ} scale={TIN_S} k={four} glow={glowAt(f, sp[1])} />
      <Tin kind="assam" pos={ASSAM} scale={TIN_S} yaw={-0.25} k={four} glow={glowAt(f, sp[2])} />
      {[EARL, DARJ, ASSAM, EB].map((p, i) => (
        <Sparkles key={i} center={tinTop(p, i === 3 ? EB_S : TIN_S)} f={f - sp[i]} mode="burst" count={10} radius={0.3} size={0.03} seed={61 + i} color="#fff0c8" intensity={2} />
      ))}
    </>
  );
};

const OutroOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ln(1) - 12;
  return (
    <>
      <Layer x={SAFE_CX} y={1150} k={reveal(f, b.ck(0, 0), out0) * (1 - 0.45 * ease(f, b.ck(0, 3), 10, EASE.out))}>
        <Chip text="特別な日の 高級な紅茶だけでなく" size={40} accent="#bba58a" />
      </Layer>
      <Layer x={SAFE_CX} y={1250} k={reveal(f, b.ck(0, 3) - 2, out0)}>
        <Headline text="毎日の暮らしに" size={96} f={f} at={b.ck(0, 3) - 2} />
      </Layer>
      <Layer x={SAFE_CX} y={1365} k={reveal(f, b.ck(0, 4) - 2, out0)}>
        <Headline text="寄り添う紅茶" size={104} f={f} at={b.ck(0, 4) - 2} sweepAt={b.ck(0, 5)} />
      </Layer>
      <Layer x={SAFE_CX} y={1150} k={reveal(f, b.ck(1, 0) - 2)}>
        <AskCard f={f} at={b.ck(1, 0) - 2} chipsAt={b.ck(1, 1)} commentAt={b.ck(2, 0) - 2} />
      </Layer>
    </>
  );
};

export const OUTRO: SceneDefP = {
  topic: "あなたの一杯は？",
  shot: outroShot,
  World: OutroWorld,
  Overlay: OutroOverlay,
  dipIn: true,
  bloom: () => 0.32,
  light: () => morning([0, 0.5, 0.4]),
};
