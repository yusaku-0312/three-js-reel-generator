import React from "react";
import { Beat, V3 } from "../core";
import { breathe, keys2, Shot2 } from "../../golden2/shot";
import { Steam } from "../../paradise/three/fx";
import { Chip, Layer, reveal, SAFE_CX } from "../overlays";
import { KURENAI, NotEqual, RubyHeadline } from "../labels";
import { TeaBowl } from "../three/liquid";
import { PuerhCake } from "../three/props";
import { SceneDefP } from "../types";

// Line 6: a pressed pu-erh cake on its opened wrapper and a small bowl of its dark liquor; 黒茶 is a different
// tea in China, so the scene ends on 紅茶 ≠ 黒茶.
const CAKE: V3 = [-0.1, 0, -0.2];
const BOWL: V3 = [0.55, 0, 0.9];

const chinaShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [-0.7, 4.8, 6.4], target: [0.1, 0.0, 0.25], fov: 30, focus: CAKE, aperture: 5 }],
      [0, { pos: [0.3, 4.6, 6.3], target: [0.2, 0.0, 0.25], fov: 30, focus: CAKE, aperture: 5 }, 135],
    ]),
    b.f,
  );

const ChinaWorld: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <PuerhCake pos={CAKE} scale={0.55} yaw={0.3} />
    <TeaBowl pos={BOWL} scale={0.8} look={{ clear: 0.12, ring: 0 }} f={b.f} />
    <Steam base={[BOWL[0], 0.24, BOWL[2]]} f={b.f} width={0.25} opacity={0.7} seed={14} />
  </>
);

const Pair: React.FC<{ f: number; at: number }> = ({ f, at }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
    <Chip text="紅茶" size={62} accent={KURENAI} />
    <NotEqual f={f} at={at + 6} size={110} />
    <Chip text="黒茶" size={62} accent="#6a4a32" />
  </div>
);

const ChinaOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const pairAt = b.ck(0, 2) - 3;
  return (
    <>
      <Layer x={SAFE_CX} y={630} k={reveal(f, b.ck(0, 0) - 3)}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
          <Chip text="中国" size={44} accent="#e8442a" />
          <RubyHeadline text="黒茶" ruby="くろちゃ" f={f} at={b.ck(0, 0) - 3} size={130} />
        </div>
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 1) - 2, pairAt - 4)}>
        <Chip text="プーアル茶など" size={56} accent="#c9952e" />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, pairAt)}>
        <Pair f={f} at={pairAt} />
      </Layer>
    </>
  );
};

export const CHINA: SceneDefP = {
  topic: "中国の「黒茶」は別物",
  shot: chinaShot,
  World: ChinaWorld,
  Overlay: ChinaOverlay,
  dipIn: true,
  bloom: () => 0.3,
};
