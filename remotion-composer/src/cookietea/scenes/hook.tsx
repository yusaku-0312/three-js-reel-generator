import React from "react";
import { add3, Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { COOKIE_ACCENT, StrikeChips, TEA_ACCENT, Thump } from "../labels";
import { CookiePlate, HERO_TOP, PAIR_WIDE, TEA_TOP, TeaCup } from "./set";
import { SceneDefP } from "../types";

// Line 0: the cup of tea and the plate of cookies; the cookies warm at 「甘いもの」, the tea glows at
// 「苦いもの」, and a red line slashes both chips at 「ではありません」.
// Line 1: a soft light between them (科学的に), then ① over the tea and ② over the cookie (理由は2つ).
const MID: V3 = [(TEA_TOP[0] + HERO_TOP[0]) / 2, 0.9, (TEA_TOP[2] + HERO_TOP[2]) / 2];
const PAIR_IN: Shot2 = { pos: [0, 2.75, 7.3], target: [0.1, 0.42, 0], fov: 30, focus: [0, 0.4, 0], aperture: 6 };
const PAIR_UP: Shot2 = { pos: [0, 3.2, 7.4], target: [0.1, 0.62, 0], fov: 30, focus: [0, 0.4, 0], aperture: 6 };

const hookShot = (b: Beat): Shot2 => breathe(keys2(b.f, [[0, PAIR_WIDE], [0, PAIR_IN, 120], [b.ln(1), PAIR_UP, 90]]), b.f);

const pulse = (f: number, at: number, hold = 40) => ease(f, at - 2, 10, EASE.out) * (1 - ease(f, at + hold, 20, EASE.in));

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const sweet = pulse(f, b.ck(0, 2), 30);
  const bitter = pulse(f, b.ck(0, 3), 24);
  const science = pulse(f, b.ck(1, 1), 50);
  const two = ease(f, b.ck(1, 4) - 2, 10, EASE.out);
  return (
    <>
      <TeaCup f={f} glow={bitter * 0.9 + two * 0.3} />
      <CookiePlate glow={sweet * 0.9 + two * 0.3} />
      <Glow pos={add3(HERO_TOP, [0, 0.1, 0])} size={1.1} color="#ffc070" intensity={sweet * 0.5} />
      <Glow pos={MID} size={1.6} color="#fff3dc" intensity={science * 0.45} />
      <Sparkles center={MID} f={f - b.ck(1, 1)} mode="burst" count={16} radius={0.7} size={0.05} seed={12} color="#fff0c8" intensity={2} />
    </>
  );
};

const Badge: React.FC<{ n: string; color: string }> = ({ n, color }) => (
  <div
    style={{
      width: 110, height: 110, borderRadius: 999, background: color, border: "6px solid #fff6e6",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Hiragino Sans, sans-serif", fontWeight: 900, fontSize: 70, color: "#2a150a",
      boxShadow: `0 0 30px ${color}, 0 10px 24px rgba(30,12,4,0.45)`,
    }}
  >
    {n}
  </div>
);

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const tea = project2(shot, add3(TEA_TOP, [0, 0.75, 0]));
  const cookie = project2(shot, add3(HERO_TOP, [0, 0.7, 0]));
  const two = b.ck(1, 4);
  return (
    <>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(0, 2) - 2, b.ln(1) - 6)} rise={0}>
        <StrikeChips f={f} leftAt={b.ck(0, 2) - 2} rightAt={b.ck(0, 3) - 2} strikeAt={b.ck(0, 4) + 2} />
      </Layer>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(1, 1) - 2)}>
        <Headline text="科学で説明できる" size={88} f={f} at={b.ck(1, 1) - 2} sweepAt={b.ck(1, 1) + 16} />
      </Layer>
      <Layer x={tea.x} y={tea.y} k={ease(f, two, 8, EASE.out)} rise={0}>
        <Badge n="1" color={TEA_ACCENT} />
      </Layer>
      <Layer x={cookie.x} y={cookie.y} k={ease(f, two + 4, 8, EASE.out)} rise={0}>
        <Badge n="2" color={COOKIE_ACCENT} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={1} rise={0}>
        <Thump text="理由は2つ" f={f} at={two} size={120} />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = { topic: "紅茶とクッキー", shot: hookShot, World: HookWorld, Overlay: HookOverlay, bloom: () => 0.32 };
