import React from "react";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles, Steam } from "../../golden2/three/fx";
import { Drop, DropLight, Stream } from "../../golden2/three/liquid";
import { lin } from "../../golden/core";
import { add3, Beat, lerp, V3 } from "../core";
import { Chip, Headline, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { GREEN_TEA, Kyusu, KyusuPose, Tray, Yunomi, YunomiPose, yunomiSurface } from "../three/kyusu";
import { SceneDefP } from "../types";

// Japanese set: the kyusu pours green tea, is tipped right up on 「最後の一滴まで」, and the last drop falls.
// Chunks: 0 日本茶の急須でも / 1 最後の一滴まで / 2 注ぎきるのが / 3 大切とされてきました。
const CUP: YunomiPose = { pos: [0.4, 0.04, 0.35], scale: 0.95 };
const FILL0 = 0.25;
const FILL1 = 0.72;
const SURFACE = yunomiSurface(CUP, FILL1);
const TIP: V3 = [0.26, 0.92, 0.35];
const DROP = 0.045;
const FALL = 16;

const tiltAt = (b: Beat) => lerp(1.0, 1.2, ease(b.f, b.ck(0, 1), 34, EASE.inOut));
const pose = (b: Beat): KyusuPose => ({ tip: TIP, tilt: tiltAt(b), scale: 0.95, yaw: -0.35 });
const streamEnd = (b: Beat) => b.ck(0, 2) - 14;

const kyusuShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [1.65, 2.3, 6.8], target: [0.05, 1.0, 0.2], fov: 32, focus: [0.2, 0.8, 0.3], aperture: 4 }],
      [b.ck(0, 1) - 6, { pos: [1.55, 2.15, 6.4], target: [0.1, 0.95, 0.25], fov: 32, focus: add3(TIP, [0.05, -0.25, 0]), aperture: 6 }, 54],
    ]),
    b.f,
  );

const KyusuWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const fill = lerp(FILL0, FILL1, ease(f, 0, streamEnd(b), EASE.out));
  const surface = yunomiSurface(CUP, fill);
  const radius = lerp(0.034, 0.011, ease(f, b.ck(0, 1), streamEnd(b) - b.ck(0, 1)));
  const tail = ease(f, streamEnd(b) - 4, 12, EASE.in);
  const fallAt = b.ck(0, 2);
  const land = fallAt + FALL;
  const hang = add3(TIP, [0.0, -0.05, 0]);
  const t = lin(f, fallAt, FALL);
  const landed = f >= land;
  const dropPos: V3 = [lerp(hang[0], SURFACE[0], t), lerp(hang[1], SURFACE[1] + 0.02, t * t), lerp(hang[2], SURFACE[2], t)];
  const size = DROP * ease(f, streamEnd(b) + 6, 14, EASE.out);
  const gold = ease(f, streamEnd(b) + 8, 14) * 0.6;
  const ring = landed ? lin(f, land, 30) : 0;
  const glow = landed ? Math.exp(-(f - land) / 16) : 0;
  return (
    <>
      <Tray pos={[0.1, 0, 0.2]} w={2.6} d={1.7} />
      <Yunomi pose={CUP} fill={fill} glow={glow} ripple={ring} />
      <Kyusu pose={pose(b)} />
      <Stream from={TIP} to={surface} s0={tail} radius={radius} bend={0.1} f={f} tint={GREEN_TEA} />
      {!landed && <Drop pos={f >= fallAt ? dropPos : hang} size={size} shape={f >= fallAt ? 0.75 : 0.6} stretch={f >= fallAt ? 1.15 : 1 + 0.05 * Math.sin(f / 4)} gold={gold} tint={GREEN_TEA} />}
      <DropLight pos={landed ? add3(SURFACE, [0, 0.12, 0]) : dropPos} intensity={landed ? 0.3 * glow : gold * 0.35} />
      {!landed && gold > 0 && <Glow pos={f >= fallAt ? dropPos : hang} size={DROP * 5} color="#ffe07a" intensity={gold * 0.6} />}
      {landed && <Sparkles center={SURFACE} f={f - land} mode="burst" radius={0.45} count={12} size={0.04} seed={23} intensity={2.2} />}
      <Steam base={surface} f={f + 120} opacity={0.45} seed={6} />
    </>
  );
};

const KyusuOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const land = b.ck(0, 2) + FALL;
  return (
    <>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(0, 0), b.ck(0, 1) - 6)}>
        <Chip text="日本茶の急須でも" size={52} />
      </Layer>
      <Scrim y={600} k={reveal(f, b.ck(0, 1) - 2)} height={240} />
      <Layer x={SAFE_CX} y={600} k={1}>
        <Headline text="最後の一滴まで" size={84} f={f} at={b.ck(0, 1)} sweepAt={land} />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(f, b.ck(0, 3))}>
        <Chip text="注ぎきるのが大切" size={50} />
      </Layer>
    </>
  );
};

export const KYUSU: SceneDefP = { topic: "日本茶の急須でも", shot: kyusuShot, World: KyusuWorld, Overlay: KyusuOverlay, dipIn: true };
