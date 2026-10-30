import React from "react";
import { add3, Beat, lerp, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { CupPose, teaSurface } from "../../golden2/three/models";
import { Sparkles, Steam } from "../../paradise/three/fx";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { Hanko, ROYAL_GOLD, YearCount } from "../labels";
import { FlagPick, MenuBoard, MilkCup, Postcard } from "../three/kitchen";
import { DEFAULT_LIGHTING } from "../three/stage";
import { ROYAL_DONE } from "./set";
import { SceneDefP } from "../types";

// Line 5: a chalkboard menu; Royal Milk Tea is chalked in, a Japanese flag pick springs up → 和製英語 seal.
// Line 6: the board turns round to a London tea room menu; Royal Milk Tea starts to appear and is crossed out.
// Line 7: truck right to a sepia Kyoto tea-shop postcard (1965), a royal milk tea slides in front of it.
const BOARD: V3 = [0, 0, -0.3];
const FLAG: V3 = [-1.0, 0, 0.6];
const CARD: V3 = [3.4, 0, -0.1];
const CUP: CupPose = { pos: [3.75, 0, 0.95], scale: 0.62, yaw: -0.4 };

const originShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.1, 1.6, 9.6], target: [0.1, 1.45, 0], fov: 30, focus: [0, 1.4, -0.3], aperture: 6 }],
      [b.ck(1, 0) - 8, { pos: [-0.05, 1.7, 10.2], target: [0, 1.45, 0], fov: 30, focus: [0, 1.4, -0.3], aperture: 6 }, 30],
      [b.ck(2, 0) - 10, { pos: [3.55, 2.2, 6.2], target: [3.5, 0.62, 0.3], fov: 30, focus: [3.5, 0.6, 0.4], aperture: 7 }, 40],
    ]),
    b.f,
  );

const OriginWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const write = ease(f, b.ck(0, 0) - 2, 34, EASE.inOut);
  const flag = ease(f, b.ck(0, 1) - 2, 12, EASE.out) * (1 - ease(f, b.ck(1, 0) - 10, 10, EASE.in));
  const spin = ease(f, b.ck(1, 0) - 6, 22, EASE.inOut);
  const royal = ease(f, b.ck(1, 2) - 2, 12, EASE.out);
  const cross = ease(f, b.ck(1, 3), 12, EASE.out);
  const card = ease(f, b.ck(2, 0) - 12, 20, EASE.out);
  const slide = ease(f, b.ck(2, 2) - 4, 18, EASE.out);
  const cup: CupPose = { ...CUP, pos: [lerp(CUP.pos[0] + 1.6, CUP.pos[0], slide), 0, CUP.pos[2]] };
  return (
    <>
      <MenuBoard pos={BOARD} spin={spin} write={write} royal={royal} cross={cross} />
      <FlagPick pos={FLAG} up={flag} f={f - b.ck(0, 1)} />
      <Sparkles center={add3(FLAG, [0.2, 0.7, 0])} f={f - b.ck(0, 1)} mode="burst" count={10} radius={0.4} size={0.05} seed={61} color="#fff0d0" intensity={2} />
      <Postcard pos={CARD} k={card} yaw={-0.12} />
      {slide > 0.01 && (
        <>
          <MilkCup pose={cup} fill={0.78} s={ROYAL_DONE} />
          <Steam base={teaSurface(cup, 0.78)} f={f} width={0.25} opacity={0.9 * slide} />
        </>
      )}
    </>
  );
};

const OriginOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX + 150} y={1170} k={reveal(f, b.ck(0, 2) - 2, b.ck(1, 0) - 8)} rise={0}>
        <Hanko f={f} at={b.ck(0, 2)} lines={["和製", "英語"]} />
      </Layer>
      <Layer x={SAFE_CX} y={575} k={reveal(f, b.ck(1, 0), b.ck(2, 0) - 8)}>
        <Chip text="イギリスのメニュー" size={52} accent="#f3c27a" />
      </Layer>
      <Layer x={SAFE_CX} y={1345} k={reveal(f, b.ck(1, 3) + 4, b.ck(2, 0) - 8)}>
        <Chip text="この名前はない" size={56} accent="#ff5a4a" />
      </Layer>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(2, 0) - 2)}>
        <YearCount f={f} at={b.ck(2, 0)} from={1900} to={1965} suffix="年ごろ" size={140} />
      </Layer>
      <Layer x={SAFE_CX} y={1345} k={reveal(f, b.ck(2, 1))}>
        <Chip text="京都の紅茶店から" size={54} accent={ROYAL_GOLD} />
      </Layer>
    </>
  );
};

export const ORIGIN: SceneDefP = {
  topic: "名前のルーツ",
  shot: originShot,
  World: OriginWorld,
  Overlay: OriginOverlay,
  dipIn: true,
  bloom: () => 0.3,
  light: (b) => {
    const toCard = ease(b.f, b.ck(2, 0) - 10, 40);
    return { ...DEFAULT_LIGHTING, keyAt: [lerp(0, 3.5, toCard), 0.9, 0.2], keyAngle: 0.55 };
  },
};
