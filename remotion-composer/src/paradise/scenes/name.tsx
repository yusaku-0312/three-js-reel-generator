import React from "react";
import { add3, Beat, lerp } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Stream } from "../../golden2/three/liquid";
import { Chip, CountUp, Headline, Kicker, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { Glow, Sparkles } from "../three/fx";
import { IcedGlass, teaLevel } from "../three/glass";
import { Dispenser, SPOUT } from "../three/props";
import { DEFAULT_LIGHTING } from "../three/stage";
import { SceneDefP } from "../types";

// Line 2: low backlit hero of the glass, the name lands. Line 3: a drink-bar dispenser pours a glass,
// then 30年以上 counts up and ロングセラー lands.
const HERO = { pos: [0, 0, 0] as [number, number, number] };
const DISP_POS: [number, number, number] = [0, 0, -0.3];
const CUP = { pos: [0, 0.13, -0.3 + SPOUT[2]] as [number, number, number], scale: 0.62 };
const SPOUT_W: [number, number, number] = [DISP_POS[0] + SPOUT[0], DISP_POS[1] + SPOUT[1], DISP_POS[2] + SPOUT[2]];

const setAt = (b: Beat) => b.ln(1) - 4;

const lever = (b: Beat) => ease(b.f, b.ck(1, 1), 6, EASE.out) * (1 - ease(b.f, b.ck(1, 4) + 6, 8, EASE.inOut));
const pourFill = (b: Beat) => lerp(0.12, 0.86, ease(b.f, b.ck(1, 1) + 4, b.ck(1, 4) - b.ck(1, 1), EASE.inOut));

const nameShot = (b: Beat): Shot2 => {
  if (b.f < setAt(b)) {
    return breathe(
      keys2(b.f, [
        [0, { pos: [0.9, 0.5, 6.2], target: [0, 1.3, 0], fov: 32, focus: [0, 0.9, 0], aperture: 7 }],
        [0, { pos: [0.3, 1.25, 6.5], target: [0, 1.35, 0], fov: 32, focus: [0, 0.9, 0], aperture: 7 }, 70],
      ]),
      b.f,
    );
  }
  const g = b.f - setAt(b);
  return breathe(
    keys2(g, [
      [0, { pos: [0.6, 2.6, 9.4], target: [0, 1.75, -0.2], fov: 32, focus: [0, 1.5, 0], aperture: 4 }],
      [b.ck(1, 2) - setAt(b) - 10, { pos: [0.3, 1.9, 6.6], target: [0, 1.3, 0], fov: 32, focus: add3(CUP.pos, [0, 0.5, 0]), aperture: 6 }, 45],
    ]),
    b.f,
  );
};

const NameWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (f < setAt(b)) {
    const glow = lerp(0.4, 1.3, ease(f, 0, 40, EASE.out));
    return (
      <>
        <IcedGlass pose={HERO} fill={0.86} f={f} ice={5} straw glow={glow} />
        <Glow pos={[0, 1.0, -0.25]} size={1.2} color="#ff9a2a" intensity={0.12 * glow} />
        <Glow pos={[-2.4, 3.8, -9]} size={6} color="#fff1c8" intensity={1.4} />
        <Sparkles center={[0, 1.2, 0]} f={f - b.ck(0, 1) + 4} mode="burst" count={16} radius={0.9} size={0.08} seed={7} intensity={2.4} />
      </>
    );
  }
  const fill = pourFill(b);
  const level = teaLevel(CUP, fill);
  const on = ease(f, b.ck(1, 1) + 2, 4, EASE.out);
  const off = ease(f, b.ck(1, 4) + 8, 10, EASE.in);
  return (
    <>
      <Dispenser pos={DISP_POS} lever={lever(b)} level={lerp(0.85, 0.72, ease(f, b.ck(1, 1), 90))} />
      <IcedGlass pose={CUP} fill={fill} f={f} ice={4} glow={0.4} swirl={f * 0.004} />
      <Stream from={[SPOUT_W[0], SPOUT_W[1] - 0.04, SPOUT_W[2]]} to={[CUP.pos[0], level, CUP.pos[2]]} s0={off} s1={on} radius={0.028} bend={0} f={f} />
    </>
  );
};

const NameOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const titleAt = b.ck(0, 1) - 2;
  const titleK = reveal(f, titleAt, setAt(b) - 6);
  const scrim = Math.max(titleK, reveal(f, b.ck(1, 2), b.dur - 4) * 0.9);
  return (
    <>
      <Scrim y={640} k={scrim} height={360} strength={0.45} />
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0), setAt(b) - 6)}>
        <Kicker text="PARADISE TEA" f={f} at={b.ck(0, 0)} size={42} />
      </Layer>
      <Layer x={SAFE_CX} y={690} k={titleK} rise={0}>
        <Headline text="パラダイスティー" size={104} f={f} at={titleAt} sweepAt={titleAt + 22} />
      </Layer>
      <Layer x={SAFE_CX} y={560} k={reveal(f, b.ck(1, 2), b.dur - 4)}>
        <Chip text="ドリンクバーの定番" size={46} />
      </Layer>
      <Layer x={SAFE_CX} y={700} k={reveal(f, b.ck(1, 3), b.dur - 4)} rise={0}>
        <CountUp f={f} at={b.ck(1, 3)} to={30} suffix="年以上" size={150} />
      </Layer>
      <Layer x={SAFE_CX} y={840} k={reveal(f, b.ck(1, 4), b.dur - 4)}>
        <Chip text="ロングセラー" size={52} accent="#ff9a6b" />
      </Layer>
    </>
  );
};

export const NAME: SceneDefP = {
  topic: "パラダイスティー",
  shot: nameShot,
  World: NameWorld,
  Overlay: NameOverlay,
  dipIn: true,
  dipLines: [1],
  bloom: (b) => (b.f < setAt(b) ? 0.42 : 0.3),
  light: (b) => (b.f < setAt(b) ? { ...DEFAULT_LIGHTING, keyAt: [0, 0.8, 0], key: 5.2, front: 0.55 } : { ...DEFAULT_LIGHTING, keyAt: [0, 1.0, 0], keyAngle: 0.6 }),
};

