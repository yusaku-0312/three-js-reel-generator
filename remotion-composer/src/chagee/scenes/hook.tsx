import React from "react";
import { add3, Beat } from "../core";
import { breathe, ease, EASE, keys2, project2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles, Steam } from "../../paradise/three/fx";
import { Chip, Headline, Kicker, Layer, reveal, SAFE_CX } from "../overlays";
import { COBALT, PhotoCard } from "../labels";
import { ChageeCup, cupTop, MapSheet, Pin } from "../three/parts";
import { HOOK_CUP, KUNMING, mapLight, overMap } from "./set";
import { DEFAULT_LIGHTING } from "../../royalmilk/three/stage";
import { SceneDefP } from "../types";

// Line 0: the user's photo (Wonyoung) as a tilted print top-left from frame 0; the blue-and-white cup on the
// counter right; the frame lights at 「この表情になる」, CHAGEE lands at 「CHAGEEですが」.
// Line 1 (through a flash): the paper map; a cobalt pin drops on Yunnan (Kunming), the cup is set down beside it.
const onMap = (b: Beat) => b.f >= b.ln(1) - 4;

const CUP_WIDE: Shot2 = { pos: [-0.1, 2.5, 7.4], target: [0.15, 0.8, 0], fov: 30, focus: HOOK_CUP.pos, aperture: 5 };
const CUP_IN: Shot2 = { pos: [-0.1, 2.35, 6.7], target: [0.15, 0.8, 0], fov: 30, focus: HOOK_CUP.pos, aperture: 6 };
const MAP_HI = overMap(KUNMING, 3.4, 4.0);
const MAP_LO = overMap(KUNMING, 3.2, 3.4);

const hookShot = (b: Beat): Shot2 =>
  onMap(b) ? breathe(keys2(b.f, [[0, MAP_HI], [b.ln(1), MAP_LO, 90]]), b.f, 0.02) : breathe(keys2(b.f, [[0, CUP_WIDE], [0, CUP_IN, 100]]), b.f);

const MAP_CUP = { pos: add3(KUNMING, [0.38, 0, 0.3]), scale: 0.32, yaw: -0.2 };

const HookWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (onMap(b)) {
    const place = ease(f, b.ck(1, 2) - 8, 12, EASE.out);
    const glow = ease(f, b.ck(1, 1), 8, EASE.out) * (1 - ease(f, b.ck(1, 1) + 20, 20, EASE.in));
    return (
      <>
        <MapSheet />
        <Pin at={KUNMING} f={f} dropAt={b.ck(1, 0) - 2} size={1.6} />
        <Glow pos={add3(KUNMING, [0, 0.35, 0])} size={0.9} color="#bcd4ff" intensity={glow * 0.8} />
        {place > 0 && <ChageeCup pose={{ ...MAP_CUP, pos: add3(MAP_CUP.pos, [0, (1 - place) * 0.8, 0]) }} />}
      </>
    );
  }
  const glint = ease(f, b.ck(0, 2), 6, EASE.out) * (1 - ease(f, b.ck(0, 2) + 14, 18, EASE.in));
  const top = cupTop(HOOK_CUP);
  return (
    <>
      <ChageeCup pose={HOOK_CUP} glow={glint * 0.4} />
      <Steam base={add3(top, [0, 0.02, 0.1])} f={f} width={0.22} opacity={0.5} seed={4} />
      <Glow pos={add3(top, [0, 0.1, 0])} size={1.1} color="#d8e6ff" intensity={glint * 0.6} />
      <Sparkles center={add3(top, [0, 0.1, 0])} f={f - b.ck(0, 2)} mode="burst" count={14} radius={0.6} size={0.05} seed={21} color="#eaf2ff" intensity={2.2} />
    </>
  );
};

const PHOTO_W = 410;

const HookOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const { f } = b;
  if (onMap(b)) {
    const pin = project2(shot, add3(KUNMING, [0, 0.35, 0]));
    return (
      <>
        <Layer x={SAFE_CX} y={560} k={reveal(f, b.ck(1, 0))}>
          <Chip text="中国・雲南省" size={60} accent={COBALT} />
        </Layer>
        <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 1), b.ck(1, 2) - 3)}>
          <Chip text="2017年 創業" size={58} accent="#f3c27a" />
        </Layer>
        <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 2))}>
          <Chip text="お茶のお店" size={58} accent={COBALT} />
        </Layer>
      </>
    );
  }
  const ring = ease(f, b.ck(0, 1) - 2, 8, EASE.out) * (0.75 + 0.25 * Math.sin((f - b.ck(0, 1)) / 4));
  return (
    <>
      <Layer x={360} y={900} k={1} rise={0}>
        <PhotoCard width={PHOTO_W} f={f} glow={ring} />
      </Layer>
      <Layer x={360} y={1345} k={reveal(f, b.ck(0, 0) - 2)}>
        <Chip text="IVE ウォニョン" size={50} accent="#ff8fb3" />
      </Layer>
      <Layer x={745} y={600} k={reveal(f, b.ck(0, 2) - 2)} rise={0}>
        <Headline text="CHAGEE" size={64} f={f} at={b.ck(0, 2) - 2} sweepAt={b.ck(0, 2) + 10} />
        <div style={{ height: 8 }} />
        <Kicker text="覇王茶姫" f={f} at={b.ck(0, 2) + 6} size={40} />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "CHAGEEってどんなお店？",
  shot: hookShot,
  World: HookWorld,
  Overlay: HookOverlay,
  dipLines: [1],
  light: (b) => (onMap(b) ? mapLight(KUNMING) : DEFAULT_LIGHTING),
  bloom: () => 0.32,
};
