import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, CountUp, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { COBALT, ListingCard } from "../labels";
import { mapPoint } from "../three/parts";
import { MapPins } from "./mapset";
import { LA, mapLight, overMap } from "./set";
import { SceneDefP } from "../types";

// Line 5: the map from high up over China and South-East Asia; pins rain down across China, then the
// overseas ones (お店は世界に) and 7000 counts up (7000店以上).
// Line 6: 「中国のスタバ」 chip; the camera trucks east across the Pacific (呼ばれ → 2025年には) and a tall pin
// with a light beam lands on Los Angeles (アメリカで上場も), under the NASDAQ card.
const ASIA = mapPoint(108, 22);
const WIDE: Shot2 = overMap(ASIA, 5.2, 7.8, 2);
const WIDER: Shot2 = overMap(ASIA, 5.6, 8.6, 2);
const LA_SHOT: Shot2 = overMap(LA, 3.6, 4.2, 3);

const sizeShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, WIDE],
      [0, WIDER, b.ln(1)],
      [b.ck(1, 1), LA_SHOT, b.ck(1, 3) - b.ck(1, 1) + 4, EASE.inOut],
    ]),
    b.f,
    0.02,
  );

const SizeWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const beam = ease(f, b.ck(1, 3) + 6, 18, EASE.out);
  return (
    <>
      <MapPins f={f} chinaAt={b.ck(0, 0) - 4} seaAt={b.ck(0, 1) - 6} laAt={b.ck(1, 3) - 4} seoulAt={null} beam={beam} />
      <Glow pos={add3(LA, [0, 0.4, 0])} size={1.2} color="#bcd4ff" intensity={beam * 0.6} />
      <Sparkles center={add3(LA, [0, 0.5, 0])} f={f - b.ck(1, 3) - 6} mode="burst" count={14} radius={0.6} size={0.05} seed={61} color="#eaf2ff" intensity={2.0} />
    </>
  );
};

const SizeOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const la = project2(shot, add3(LA, [0, 0.4, 0]));
  return (
    <>
      <Scrim y={720} k={reveal(f, b.ck(0, 1) - 2, b.ln(1) - 2)} height={360} strength={0.55} />
      <Layer x={SAFE_CX} y={720} k={reveal(f, b.ck(0, 1) - 2, b.ln(1) - 2)} rise={0}>
        <CountUp f={f} at={b.ck(0, 1)} to={7000} dur={26} suffix="店以上" size={170} />
      </Layer>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(1, 0), b.ck(1, 3) - 4)}>
        <Chip text="「中国のスタバ」" size={64} accent={COBALT} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 2), b.ck(1, 3) - 4)}>
        <Chip text="2025年" size={58} accent="#f3c27a" />
      </Layer>
      <Layer x={SAFE_CX} y={Math.min(Math.max(la.y - 230, 600), 1250)} k={reveal(f, b.ck(1, 3))}>
        <ListingCard f={f} at={b.ck(1, 3)} />
      </Layer>
    </>
  );
};

export const SIZE: SceneDefP = {
  topic: "世界に7000店以上",
  shot: sizeShot,
  World: SizeWorld,
  Overlay: SizeOverlay,
  dipIn: true,
  light: (b) => mapLight(sizeShot(b).target),
  bloom: () => 0.3,
};
