import React from "react";
import { add3, Beat } from "../core";
import { breathe, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { GOLD, MenuCard } from "../labels";
import { NightWindow } from "../../hightea/three/props";
import { HotelItems } from "../../hightea/scenes/set";
import { HIGH_TOP, HighTable, LOW_TOP, LowTea, nightLight, WIDE } from "./set";
import { SceneDefP } from "../types";

// Line 0: a hotel lounge at night with both tables (sweets on the low table, a savoury supper on the high
// one); a menu card lists 「アフタヌーンティー」 then 「ハイティー」. Line 1: both tables sparkle
// (紅茶とごちそう) and a big 「何が違う？」 lands.
const hookShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, WIDE(0.55)],
      [0, { ...WIDE(0.45), pos: [0.3, 2.3, 8.9] }, b.dur],
    ]),
    b.f,
  );

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <NightWindow k={1} />
      <LowTea f={f} fill={[1, 1, 1]} />
      <HighTable>
        <HotelItems f={f} beef={1} flute={1} />
      </HighTable>
      <Sparkles center={add3(LOW_TOP, [0, 0.4, 0])} f={f - b.ck(1, 1)} mode="burst" count={12} radius={0.5} size={0.04} seed={11} color="#ffe0ea" intensity={2} />
      <Sparkles center={add3(HIGH_TOP, [0, 0.4, 0])} f={f - b.ck(1, 1) - 5} mode="burst" count={12} radius={0.5} size={0.04} seed={12} color="#fff0c8" intensity={2} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const menuOut = b.ck(1, 2) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={1200} k={reveal(f, b.ck(0, 0) - 2, menuOut)}>
        <MenuCard f={f} aAt={b.ck(0, 1)} bAt={b.ck(0, 3)} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(1, 0), menuOut)}>
        <Chip text="どちらも 紅茶＋ごちそう" size={50} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={1250} k={reveal(f, b.ck(1, 2) - 2)}>
        <Headline text="何が違う？" size={130} f={f} at={b.ck(1, 2) - 2} sweepAt={b.ck(1, 2) + 10} />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "ふたつのティータイム",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  bloom: () => 0.36,
  light: () => nightLight([0, 0.7, 0]),
};
