import React from "react";
import { add3, Beat, lerp3 } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Thump } from "../../milktealatte/labels";
import { Chip, Layer, reveal, SAFE_CX, Stamp } from "../overlays";
import { DashedRing } from "../three/parts";
import { KOREA_SHOT, KoreaDone } from "./korea";
import { JAPAN_C, mapLight, overMap, SEOUL } from "./set";
import { SceneDefP } from "../types";

// Line 8: the camera trucks from Korea to Japan (でも日本には); a grey dashed ring, no pin, pulses over Japan
// and the 「日本 0店」 stamp lands (まだお店がありません).
// Line 9: a ？ floats over the ring; 「出店予定」 then 「未発表」 chips.
const JAPAN_SHOT: Shot2 = overMap(JAPAN_C, 2.9, 3.0, 3);
const MID = lerp3(SEOUL, JAPAN_C, 0.5);

const japanShot = (b: Beat): Shot2 =>
  breathe(keys2(b.f, [[0, KOREA_SHOT], [b.ck(0, 0) - 4, JAPAN_SHOT, b.ck(0, 1) - b.ck(0, 0) + 4]]), b.f, 0.02);

const JapanWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <KoreaDone f={f} />
      <DashedRing center={JAPAN_C} radius={0.32} k={ease(f, b.ck(0, 1) - 4, 12, EASE.out)} f={f} />
    </>
  );
};

const JapanOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  const ring = project2(shot, add3(JAPAN_C, [0, 0.25, 0]));
  const mid = project2(shot, MID);
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0), b.ln(1) - 3)}>
        <Chip text="日本" size={70} accent="#b8b2ac" />
      </Layer>
      <Layer x={Math.min(Math.max(mid.x, 300), 760)} y={1130} k={reveal(f, b.ck(0, 1), b.ln(1) - 3)} rise={0}>
        <Stamp f={f} at={b.ck(0, 1)} top="日本" big="0店" color="#e0473a" />
      </Layer>
      <Layer x={Math.min(Math.max(ring.x, 260), 820)} y={Math.min(Math.max(ring.y - 120, 560), 1200)} k={1} rise={0}>
        <Thump text="？" f={f} at={b.ck(1, 0)} size={200} />
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(1, 0), b.ck(1, 2) - 3)}>
        <Chip text="出店予定" size={62} accent="#b8b2ac" />
      </Layer>
      <Layer x={SAFE_CX} y={1335} k={reveal(f, b.ck(1, 2))}>
        <Chip text="未発表（2026年10月時点）" size={46} accent="#b8b2ac" />
      </Layer>
    </>
  );
};

export const JAPAN: SceneDefP = {
  topic: "日本では？",
  shot: japanShot,
  World: JapanWorld,
  Overlay: JapanOverlay,
  light: (b) => mapLight(japanShot(b).target),
  bloom: () => 0.3,
};
