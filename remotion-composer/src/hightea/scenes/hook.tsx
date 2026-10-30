import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AFTERNOON, GOLD } from "../labels";
import { NightWindow, onTable } from "../three/props";
import { HIGH, HIGH_TOP, HighTable, HotelItems, nightLight } from "./set";
import { SceneDefP } from "../types";

// Line 0: the hotel high tea at night — savoury stand, roast beef, champagne, candles — 「ハイティー」 glints.
// Line 1: 「この『ハイ』」 lights up gold and question chips pop (何が高いと思いますか？).
const STAND_TOP = add3(onTable(HIGH, -0.3, -0.12), [0, 0.5, 0]);

export const nightShot = (b: Beat, closer = 0): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: add3(HIGH_TOP, [0.15, 1.2, 4.8]), target: add3(HIGH_TOP, [0, 0.35, 0]), fov: 30, focus: HIGH_TOP, aperture: 6 }],
      [0, { pos: add3(HIGH_TOP, [0.1, 1.1 - closer * 0.2, 4.2 - closer * 0.5]), target: add3(HIGH_TOP, [0, 0.35, 0]), fov: 30, focus: HIGH_TOP, aperture: 7 }, 200],
    ]),
    b.f,
  );

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const glint = ease(f, b.ck(0, 3), 6, EASE.out) * (1 - ease(f, b.ck(0, 3) + 16, 18, EASE.in));
  return (
    <>
      <NightWindow k={1} />
      <HighTable>
        <HotelItems f={f} beef={1} flute={1} />
      </HighTable>
      <Glow pos={STAND_TOP} size={0.9} color="#ffd98a" intensity={glint * 0.8} />
      <Sparkles center={STAND_TOP} f={f - b.ck(0, 3)} mode="burst" count={14} radius={0.5} size={0.04} seed={21} color="#fff0c0" intensity={2.2} />
    </>
  );
};

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const hai = ease(f, b.ck(1, 0), 8, EASE.out);
  return (
    <>
      <Layer x={SAFE_CX} y={585} k={reveal(f, b.ck(0, 0) - 2, b.ln(1) - 4)}>
        <Chip text="アフタヌーンティーの次は" size={48} accent={AFTERNOON} />
      </Layer>
      <Layer x={SAFE_CX} y={1290} k={reveal(f, b.ck(0, 3) - 2)}>
        <div style={{ filter: hai > 0 ? `drop-shadow(0 0 ${24 * hai}px ${GOLD})` : undefined }}>
          <Headline text="ハイティー" size={150} f={f} at={b.ck(0, 3) - 2} sweepAt={b.ck(1, 0)} />
        </div>
      </Layer>
      <Layer x={SAFE_CX - 220} y={600} k={reveal(f, b.ck(1, 1))}>
        <Chip text="値段？" size={56} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX + 210} y={690} k={reveal(f, b.ck(1, 1) + 5)}>
        <Chip text="格式？" size={56} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX + 10} y={1110} k={reveal(f, b.ck(1, 2))}>
        <Headline text="？" size={150} f={f} at={b.ck(1, 2)} />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "ハイティーってなに？",
  shot: (b) => nightShot(b),
  World: HookWorld,
  Overlay: HookOverlay,
  bloom: () => 0.36,
  light: () => nightLight(HIGH_TOP),
};
