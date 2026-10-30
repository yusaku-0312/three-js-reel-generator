import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Chip, Layer, reveal } from "../overlays";
import { Bubble, COBALT, Hearts, LivePhone } from "../labels";
import { ChageeCup, cupTop } from "../three/parts";
import { SceneDefP } from "../types";

// Line 2: the live stream on a phone (left), the blue-and-white cup on the counter beside it (right).
// 「今年1月」 date chip → 「中国でのライブ配信」 place chip → the cup lights at 「ここのミルクティーを」 →
// 「すごくおいしい！」 bubble pops → hearts rise and the nickname chip lands at 「話題に」.
const CUP = { pos: [0.75, 0, 0.1] as [number, number, number], scale: 0.72, yaw: -0.25 };
const SHOT: Shot2 = { pos: [0.1, 2.3, 6.8], target: [0.25, 0.85, 0], fov: 30, focus: CUP.pos, aperture: 4 };

const WonyoungWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const lit = ease(f, b.ck(0, 2) - 2, 10, EASE.out);
  const top = cupTop(CUP);
  return (
    <>
      <ChageeCup pose={{ ...CUP, yaw: CUP.yaw + f * 0.002 }} glow={lit * 0.35} />
      <Steam base={add3(top, [0, 0.02, 0.1])} f={f} width={0.2} opacity={0.5} seed={8} />
      <Glow pos={add3(top, [0, 0.05, 0])} size={0.8} color="#d8e6ff" intensity={lit * 0.22} />
      <Sparkles center={add3(top, [0, 0.1, 0])} f={f - b.ck(0, 2)} mode="burst" count={12} radius={0.55} size={0.05} seed={33} color="#eaf2ff" intensity={2.0} />
    </>
  );
};

const WonyoungOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={400} y={905} k={reveal(f, 0)} rise={30}>
        <LivePhone width={390} f={f} />
      </Layer>
      <Layer x={400} y={1365} k={reveal(f, b.ck(0, 0), b.ck(0, 1) - 3)}>
        <Chip text="2026年1月" size={56} accent={COBALT} />
      </Layer>
      <Layer x={400} y={1365} k={reveal(f, b.ck(0, 1), b.ck(0, 4) - 3)}>
        <Chip text="中国・広州でライブ配信" size={46} accent="#ff3b4e" />
      </Layer>
      <Layer x={400} y={1365} k={reveal(f, b.ck(0, 4))}>
        <Chip text="#ウォニョンのミルクティー" size={44} accent="#ff8fb3" />
      </Layer>
      <Layer x={790} y={600} k={1} rise={0}>
        <Bubble lines={["すごく", "おいしい！"]} f={f} at={b.ck(0, 3)} size={48} />
      </Layer>
      <Layer x={560} y={1220} k={1} rise={0}>
        <Hearts f={f} at={b.ck(0, 4) - 4} />
      </Layer>
    </>
  );
};

export const WONYOUNG: SceneDefP = {
  topic: "ウォニョンも大絶賛",
  shot: (b) => breathe(SHOT, b.f),
  World: WonyoungWorld,
  Overlay: WonyoungOverlay,
  dipIn: true,
  bloom: () => 0.3,
};
