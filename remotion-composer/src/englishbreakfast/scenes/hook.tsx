import React from "react";
import { interpolate } from "remotion";
import { Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { TEA_COLOR } from "../labels";
import { Tin, tinTop } from "../three/tins";
import { ASSAM, DARJ, EARL, morning, TIN_S } from "./set";
import { SceneDefP } from "../types";

// Line 0: three famous tins on the counter from frame 0 and the
// question lands. Line 1: each tin hops and glows as it is named.
export const TRIO_SHOT: Shot2 = { pos: [0, 4.5, 7.4], target: [0, 0.1, -0.2], fov: 30, focus: [0, 0.4, -0.2], aperture: 4 };

const hookShot = (b: Beat): Shot2 =>
  breathe(keys2(b.f, [[0, { ...TRIO_SHOT, pos: [0.2, 4.7, 7.9] }], [0, TRIO_SHOT, b.dur]]), b.f);

/** 0..1..0 hop when a tin is named. */
export const hopAt = (f: number, at: number) => interpolate(f, [at, at + 5, at + 12], [0, 0.18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const glowAt = (f: number, at: number) => ease(f, at, 6, EASE.out) * (1 - ease(f, at + 18, 14, EASE.in));

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const named = [b.ck(1, 0), b.ck(1, 1), b.ck(1, 3)];
  return (
    <>
      <Tin kind="earl" pos={EARL} scale={TIN_S} yaw={0.25} hop={hopAt(f, named[0])} glow={glowAt(f, named[0])} />
      <Tin kind="darj" pos={DARJ} scale={TIN_S} hop={hopAt(f, named[1])} glow={glowAt(f, named[1])} />
      <Tin kind="assam" pos={ASSAM} scale={TIN_S} yaw={-0.25} hop={hopAt(f, named[2])} glow={glowAt(f, named[2])} />
      {[EARL, DARJ, ASSAM].map((p, i) => (
        <Sparkles key={i} center={tinTop(p, TIN_S)} f={f - named[i]} mode="burst" count={10} radius={0.3} size={0.03} seed={21 + i} color="#fff0c8" intensity={2} />
      ))}
    </>
  );
};

const NAMES: Array<[string, string, number, number]> = [
  // text, colour, x, y (under each tin on screen)
  ["アールグレイ？", TEA_COLOR.earl, 290, 1165],
  ["ダージリン？", TEA_COLOR.darj, 540, 530],
  ["アッサム？", TEA_COLOR.assam, 790, 1165],
];

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const ats = [b.ck(1, 0), b.ck(1, 1), b.ck(1, 3)];
  return (
    <>
      <Layer x={SAFE_CX} y={1280} k={reveal(f, b.ck(0, 4) - 4)}>
        <Headline text="イギリスで一番" size={92} f={f} at={b.ck(0, 4) - 4} />
      </Layer>
      <Layer x={SAFE_CX} y={1385} k={reveal(f, b.ck(0, 4) + 2)}>
        <Headline text="愛される紅茶は？" size={92} f={f} at={b.ck(0, 4) + 2} sweepAt={b.ck(0, 4) + 16} />
      </Layer>
      {NAMES.map(([t, c, x, y], i) => (
        <Layer key={t} x={x} y={y} k={reveal(f, ats[i] - 2)}>
          <Chip text={t} size={42} accent={c} />
        </Layer>
      ))}
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "イギリスで一番人気の紅茶",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  dipIn: false,
  bloom: () => 0.32,
  light: () => morning([0, 0.5, -0.2]),
};
