import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { pop } from "../../hightea/three/props";
import { Headline, Kicker, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { PollCard, TEA_COLOR } from "../labels";
import { Tin, tinTop } from "../three/tins";
import { ASSAM, DARJ, EARL, EB, EB_S, morning, TIN_S } from "./set";
import { TRIO_SHOT } from "./hook";
import { SceneDefP } from "../types";

// Line 0: the three tins dim and the navy-and-gold ENGLISH BREAKFAST tin pops in front (イングリッシュ).
// Line 1: the camera rises so the tins sit high; a poll card grows 54% then 18%, and the 54% bar glows.
const HERO_SHOT: Shot2 = { pos: [0, 1.8, 8.4], target: [0, 0.05, 0.2], fov: 30, focus: [0, 0.5, 0.75], aperture: 5 };
const HIGH_SHOT: Shot2 = { pos: [0, 4.2, 10.4], target: [0, -0.35, 0.1], fov: 30, focus: [0, 0.5, 0.4], aperture: 4 };

const answerShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, TRIO_SHOT],
      [b.ck(0, 3) - 6, HERO_SHOT, 40],
      [b.ck(1, 0) - 8, HIGH_SHOT, 30],
    ]),
    b.f,
  );

const AnswerWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const heroAt = b.ck(0, 3);
  const dim = ease(f, b.ck(0, 0), 20, EASE.out);
  const earlLit = ease(f, b.ck(1, 4), 8, EASE.out);
  return (
    <>
      <Tin kind="earl" pos={EARL} scale={TIN_S} yaw={0.25} dim={dim * (1 - earlLit)} glow={earlLit * 0.4} />
      <Tin kind="darj" pos={DARJ} scale={TIN_S} dim={dim} />
      <Tin kind="assam" pos={ASSAM} scale={TIN_S} yaw={-0.25} dim={dim} />
      <Tin kind="eb" pos={EB} scale={EB_S} k={pop(f, heroAt)} glow={0.15 + 0.35 * (1 - ease(f, heroAt + 10, 30))} />
      <Sparkles center={tinTop(EB, EB_S)} f={f - heroAt} mode="burst" count={18} radius={0.5} size={0.04} seed={31} color="#ffe6a8" intensity={2.4} />
      <Sparkles center={tinTop(EB, EB_S)} f={f - b.ck(1, 6)} mode="burst" count={12} radius={0.4} size={0.035} seed={32} color="#ffe6a8" intensity={2} />
    </>
  );
};

const AnswerOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const heroAt = b.ck(0, 3);
  const nameOut = b.ck(1, 0) - 6;
  return (
    <>
      <Scrim y={1240} k={reveal(f, heroAt - 2, nameOut)} height={300} />
      <Layer x={SAFE_CX} y={1160} k={reveal(f, heroAt, nameOut)}>
        <Kicker text="ENGLISH BREAKFAST" f={f} at={heroAt} size={40} />
      </Layer>
      <Layer x={SAFE_CX} y={1260} k={reveal(f, heroAt + 2, nameOut)}>
        <Headline text="イングリッシュ" size={96} f={f} at={heroAt + 2} />
      </Layer>
      <Layer x={SAFE_CX} y={1370} k={reveal(f, b.ck(0, 4) - 2, nameOut)}>
        <Headline text="ブレックファスト" size={96} f={f} at={b.ck(0, 4) - 2} sweepAt={b.ck(0, 4) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={1170} k={reveal(f, b.ck(1, 0) - 2)}>
        <PollCard
          f={f}
          winAt={b.ck(1, 6)}
          bars={[
            { name: "イングリッシュ\nブレックファスト", pct: 54, at: b.ck(1, 1), color: TEA_COLOR.eb },
            { name: "アールグレイ", pct: 18, at: b.ck(1, 4), color: TEA_COLOR.earl },
          ]}
        />
      </Layer>
    </>
  );
};

export const ANSWER: SceneDefP = {
  topic: "答えは…",
  shot: answerShot,
  World: AnswerWorld,
  Overlay: AnswerOverlay,
  bloom: () => 0.34,
  light: () => morning([0, 0.5, 0.2]),
};
