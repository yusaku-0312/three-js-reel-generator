import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Glow, Sparkles } from "../../paradise/three/fx";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { KURENAI, MoleculeIcon } from "../labels";
import { BigLeaf } from "../three/leaf";
import { SceneDefP } from "../types";

// Line 4: one fresh green tea leaf on the counter; from 発酵で it turns copper-red from the edge inward, and at
// テアフラビン crimson motes rise off it.
const LEAF_LEN = 1.6;

const chemShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.9, 6.0, 3.2], target: [0, 0.1, -0.1], fov: 30, focus: [0, 0.1, 0], aperture: 4 }],
      [0, { pos: [-0.3, 5.8, 3.0], target: [0, 0.1, -0.1], fov: 30, focus: [0, 0.1, 0], aperture: 4 }, 136],
    ]),
    b.f,
    0.02,
  );

const fermentOf = (b: Beat) => ease(b.f, b.ck(0, 1) - 4, 50, EASE.inOut);

const ChemWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const ferment = fermentOf(b);
  const motes = b.ck(0, 2) - 4;
  return (
    <>
      <BigLeaf pos={[0, 0.03, 0.05]} length={LEAF_LEN} yaw={0.5} ferment={ferment} glow={ease(f, motes, 20) * 0.25} />
      <Glow pos={[0, 0.3, 0]} size={1.8} color="#ff4a2a" intensity={ease(f, motes, 20) * 0.22} />
      <Sparkles center={[0, 0.2, 0]} f={f - motes} mode="rise" count={30} radius={0.5} size={0.06} seed={44} color="#ff6a40" intensity={2.4} />
    </>
  );
};

const ChemOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const at = b.ck(0, 2) - 3;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0) - 2, at - 6)}>
        <Headline text="赤い色のもと" size={92} f={f} at={b.ck(0, 0) - 2} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 1) - 2)}>
        <Chip text="発酵（酸化）で変わる" size={50} accent={KURENAI}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: "#5c9a34" }} />
            <div style={{ width: 30, height: 30, borderRadius: 999, background: KURENAI }} />
          </div>
        </Chip>
      </Layer>
      <Layer x={SAFE_CX} y={620} k={reveal(f, at)}>
        <MoleculeIcon size={190} k={ease(f, at, 10, EASE.out)} />
        <Headline text="テアフラビン" size={100} f={f} at={at} sweepAt={at + 16} />
      </Layer>
    </>
  );
};

export const CHEM: SceneDefP = {
  topic: "赤い色のもと",
  shot: chemShot,
  World: ChemWorld,
  Overlay: ChemOverlay,
  dipIn: true,
  bloom: () => 0.34,
};
