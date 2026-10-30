import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { ClockChip, COBALT } from "../labels";
import { Queue } from "../three/parts";
import { MapPins } from "./mapset";
import { mapLight, overMap, SEOUL } from "./set";
import { SceneDefP } from "../types";

// Line 7: the map over Korea; 「今年4月」 chip, a big cobalt pin lands on Seoul (韓国にも上陸), and a line of
// small people files in beside it under the clock chip (2時間以上待ちの行列).
export const KOREA_SHOT: Shot2 = overMap(SEOUL, 2.4, 2.6, 4);
const KOREA_IN: Shot2 = overMap(SEOUL, 2.0, 2.2, 5);
const QUEUE_START = add3(SEOUL, [0.03, 0, 0.04]);

const koreaShot = (b: Beat): Shot2 => breathe(keys2(b.f, [[0, KOREA_SHOT], [b.ck(0, 1), KOREA_IN, 40]]), b.f, 0.02);

/** Korea as it stands after this scene (also the opening of the Japan scene). */
export const KoreaDone: React.FC<{ f: number }> = ({ f }) => (
  <>
    <MapPins f={f} />
    <Queue start={QUEUE_START} dir={[0.85, 0, 0.5]} f={f} at={-1000} scale={0.75} count={8} />
  </>
);

const KoreaWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const land = ease(f, b.ck(0, 1) + 6, 8, EASE.out) * (1 - ease(f, b.ck(0, 1) + 26, 20, EASE.in));
  return (
    <>
      <MapPins f={f} seoulAt={b.ck(0, 1) - 4} />
      <Queue start={QUEUE_START} dir={[0.85, 0, 0.5]} f={f} at={b.ck(0, 2) - 6} scale={0.75} count={8} />
      <Glow pos={add3(SEOUL, [0, 0.35, 0])} size={0.8} color="#bcd4ff" intensity={land * 0.7} />
      <Sparkles center={add3(SEOUL, [0, 0.4, 0])} f={f - b.ck(0, 1) - 6} mode="burst" count={12} radius={0.4} size={0.04} seed={71} color="#eaf2ff" intensity={2.0} />
    </>
  );
};

const KoreaOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const pin = project2(shot, add3(SEOUL, [0, 0.4, 0]));
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0), b.ck(0, 1) - 3)}>
        <Chip text="2026年4月" size={62} accent={COBALT} />
      </Layer>
      <Layer x={SAFE_CX} y={Math.min(Math.max(pin.y - 200, 600), 900)} k={reveal(f, b.ck(0, 1))}>
        <Headline text="韓国に上陸" size={100} f={f} at={b.ck(0, 1)} />
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(0, 2))}>
        <ClockChip text="2時間以上待ち" f={f} size={56} />
      </Layer>
    </>
  );
};

export const KOREA: SceneDefP = {
  topic: "韓国に上陸",
  shot: koreaShot,
  World: KoreaWorld,
  Overlay: KoreaOverlay,
  dipIn: true,
  light: () => mapLight(SEOUL),
  bloom: () => 0.3,
};
