import React from "react";
import { Beat, lerp, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { faceTo } from "../../kyouhaku/three/figures";
import { Bubble, Chip, Layer, SAFE_CX } from "../overlays";
import { WARM, Waveform } from "../three/props";
import { SceneDefP } from "../types";
import { CAM_AT, CHILD_AT, dolly, LENS, ROOM_CAM } from "./cams";
import { EVENING, Kid, ShelfCam } from "./cast";

// L0 evening, home alone: the child stands in front of the bed, head down at play; the shelf camera's lamp blue.
// 「見守りカメラから」 the lamp pulses; 「ママの声で」 a warm voice waveform at the speaker; 「玄関の鍵を開けて」 a warm
// bubble from the camera; 「聞こえてきたら？」 the child turns to the camera.
export const VOICE_AT = (p: V3): V3 => [p[0] + 0.05, p[1] - 0.32, p[2] + 0.28];

const shot = (b: Beat): Shot2 => breathe(dolly(ROOM_CAM, 0.04 * ease(b.f, 0, b.dur, EASE.inOut)), b.f, 0.02);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const turn = ease(b.f, b.ck(0, 5) - 4, 14, EASE.inOut);
  const yaw = lerp(0.35, faceTo(CHILD_AT, CAM_AT), turn);
  const pulse = b.f >= b.ck(0, 2) && b.f < b.ck(0, 3) + 10 && Math.floor(b.f / 6) % 2 === 0;
  return (
    <>
      <ShelfCam f={b.f} led={pulse ? "teal" : "blue"} />
      <Kid pos={CHILD_AT} yaw={yaw} headPitch={lerp(0.35, -0.25, turn) + Math.sin(b.f / 14) * 0.04 * (1 - turn)} armL={0.7 * (1 - turn)} armR={0.7 * (1 - turn)} />
      <Waveform pos={VOICE_AT(LENS)} f={b.f} width={0.5} height={0.22} bars={16} color={WARM} grow={ease(b.f, b.ck(0, 3), 12, EASE.out)} intensity={1.3} yaw={0.3} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => (
  <>
    <Layer x={SAFE_CX - 90} y={1372} k={ease(b.f, b.ck(0, 1), 8, EASE.out)}>
      <Chip text="留守番中" size={50} accent={WARM} />
    </Layer>
    <Bubble shot={shot} at3={LENS} text={"玄関のかぎ、\n開けて"} k={ease(b.f, b.ck(0, 4), 8, EASE.out)} tone="warm" dy={-60} dx={250} size={56} />
  </>
);

export const HOOK: SceneDefP = {
  topic: "見守りカメラからママの声？",
  shot,
  World,
  Overlay,
  light: () => EVENING,
};
