import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, Layer, SAFE_CX } from "../overlays";
import { AI_CYAN, AICore, Glow, MonitorCam, Padlock } from "../three/devices";
import { SceneDefP } from "../types";
import { dolly, HERO_CAM } from "./cams";
import { DARK_NIGHT } from "./cast";

// L0 (dip) the monitor camera big in front of the blurred room, turning slowly, lamp red; 「ハッキングによる」 a red
// padlock beside it springs open. L1 「そこに今」 the camera eases left and a cyan AI crystal rises top right;
// 「新たな懸念が」 it pulses.
const CAM_Y = 0.5;

const shot = (b: Beat): Shot2 => breathe(dolly(HERO_CAM, -0.06 * ease(b.f, b.ln(1), 40, EASE.cam)), b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const left = ease(b.f, b.ln(1) - 2, 18, EASE.cam);
  const lock = Math.min(ease(b.f, b.ck(0, 1) - 4, 10, EASE.out), 1 - ease(b.f, b.ln(1) - 6, 8, EASE.in));
  const ai = ease(b.f, b.ck(1, 0) + 4, 16, EASE.out);
  const pulse = 1 + Math.max(0, Math.sin((b.f - b.ck(1, 1)) / 4)) * 0.12 * ease(b.f, b.ck(1, 1), 6);
  return (
    <>
      <MonitorCam pos={[-0.38 * left, CAM_Y, 0.9]} s={3.0} yaw={Math.sin(b.f / 50) * 0.25 + 0.35 * left} pitch={0.05} led="red" glitch={0.12} f={b.f} />
      <Padlock pos={[0.55, 1.55, 1.05]} s={1.35} open={ease(b.f, b.ck(0, 1) + 8, 10, EASE.out)} k={lock} />
      {ai > 0 && (
        <>
          <AICore pos={[0.5, 1.55 + (1 - ai) * -0.3, 1.0]} f={b.f} size={0.3 * ai * pulse} power={1} />
          <Glow pos={[0.5, 1.55, 0.95]} size={1.6} color={AI_CYAN} intensity={0.3 * ai} />
        </>
      )}
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={1372} k={Math.min(ease(b.f, b.ck(0, 3), 8, EASE.out), 1 - ease(b.f, b.ln(1) - 6, 6))}>
      <Chip text="以前からある危険" size={50} accent="#9aa6bf" />
    </Layer>
    <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(1, 1), 8, EASE.out)}>
      <Chip text="新たな懸念：AI" size={50} accent={AI_CYAN} />
    </Layer>
  </>
);

export const OLD: SceneDefP = {
  topic: "以前からある盗み見の危険",
  shot,
  World,
  Overlay,
  light: () => ({ ...DARK_NIGHT, front: 0.6, fill: 0.42 }),
  dipIn: true,
};
