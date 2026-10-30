import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AFTERNOON, CrossMark, GOLD, HIGH_AMBER, Note } from "../labels";
import { NightWindow } from "../../hightea/three/props";
import { HIGH_TOP, HighTable, HOTEL_STAND, HotelSweets, nightLight } from "./set";
import { SceneDefP } from "../types";

// Line 9: a hotel abroad at night — a lavish sweets stand on the high table; 「豪華なアフタヌーンティー」
// gets the name tag 「ハイティー」. Line 10: push in; 「名前」 is crossed out and 「時間とお料理」 lands while
// the tiers light up.
const abroadShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: add3(HIGH_TOP, [0.15, 1.2, 4.8]), target: add3(HIGH_TOP, [0, 0.35, 0]), fov: 30, focus: HOTEL_STAND, aperture: 6 }],
      [b.ln(1) - 6, { pos: add3(HIGH_TOP, [0.0, 1.15, 3.9]), target: add3(HIGH_TOP, [-0.1, 0.3, 0]), fov: 30, focus: HOTEL_STAND, aperture: 7 }, 70],
    ]),
    b.f,
  );

const AbroadWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const lit = ease(f, b.ck(1, 2), 10, EASE.out);
  return (
    <>
      <NightWindow k={1} />
      <HighTable>
        <HotelSweets f={f} glow={[lit, lit, lit]} />
      </HighTable>
      <Sparkles center={add3(HOTEL_STAND, [0, 0.45, 0])} f={f - b.ck(0, 3)} mode="burst" count={14} radius={0.45} size={0.04} seed={61} color="#fff0c8" intensity={2.2} />
    </>
  );
};

const AbroadOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const l10 = b.ln(1) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 1) - 2, b.ck(0, 2) - 3)}>
        <Chip text="海外のホテル" size={56} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 2) - 2, l10)}>
        <Chip text="豪華なアフタヌーンティー" size={48} accent={AFTERNOON} />
      </Layer>
      <Layer x={SAFE_CX} y={1290} k={reveal(f, b.ck(0, 3) - 2, l10)}>
        <Headline text="「ハイティー」" size={110} f={f} at={b.ck(0, 3) - 2} sweepAt={b.ck(0, 3) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={1405} k={reveal(f, b.ck(0, 5), l10)}>
        <Note text="※ 呼び方は国やお店によってさまざまです" />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(1, 0), b.ck(1, 1) - 3)}>
        <Chip text="迷ったら" size={56} accent={GOLD} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(1, 1) - 2)}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Chip text="名前" size={56} accent={GOLD} />
          <div style={{ position: "absolute" }}>
            <CrossMark f={f} at={b.ck(1, 1) + 6} size={150} />
          </div>
        </div>
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(1, 2) - 2)}>
        <Headline text="時間とお料理" size={100} f={f} at={b.ck(1, 2) - 2} sweepAt={b.ck(1, 3)} />
      </Layer>
    </>
  );
};

export const ABROAD: SceneDefP = {
  topic: "メニューで迷ったら",
  shot: abroadShot,
  World: AbroadWorld,
  Overlay: AbroadOverlay,
  dipIn: true,
  bloom: () => 0.36,
  light: () => nightLight(HIGH_TOP),
};
