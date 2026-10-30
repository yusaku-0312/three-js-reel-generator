import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { faceTo } from "../../kyouhaku/three/figures";
import { Bubble, Chip, Layer, SAFE_CX } from "../overlays";
import { AI_CYAN, FrontDoor, HACK_RED, Waveform, walkAlong } from "../three/props";
import { SceneDefP } from "../types";
import { CAM_AT, CHILD_AT, dolly, HERO_CAM, LENS, ROOM_CAM, TO_DOOR } from "./cams";
import { EVENING, Kid, ShelfCam } from "./cast";
import { VOICE_AT } from "./hook";
import { nod } from "./util";

// L0 (dip) the room: a cyan waveform at the shelf camera (the copied voice) while a warm bubble says
// 「お友達が迎えに来たから」 and adds 「玄関を開けて」. L1 「声なら、」 the child nods, 「ママを信じて」 walks off toward the
// room door; 「鍵を開けて」 (dip) the front door close up: someone red behind the frosted glass, the child's arm
// reaches the thumb-turn and turns it on 「しまうかも」, the lock glowing red.
const atDoor = (b: Beat) => b.f >= b.ck(1, 4) - 4;
export const DOOR_POS: V3 = [-0.35, -0.42, 0.55];
export const DOOR_S = 1.25;

const shot = (b: Beat): Shot2 =>
  atDoor(b) ? breathe(dolly(HERO_CAM, 0.05 * ease(b.f, b.ck(1, 4), 40, EASE.out)), b.f) : breathe(dolly(ROOM_CAM, 0.05 * ease(b.f, 0, b.ck(1, 4), EASE.inOut)), b.f, 0.02);

const Room: React.FC<{ b: Beat }> = ({ b }) => {
  const w = walkAlong(CHILD_AT, TO_DOOR, ease(b.f, b.ck(1, 3), b.ck(1, 4) - b.ck(1, 3) + 8, EASE.inOut), 6);
  const walking = b.f >= b.ck(1, 3);
  return (
    <>
      <ShelfCam f={b.f} led="blue" />
      <Kid pos={w.pos} yaw={walking ? w.yaw : faceTo(CHILD_AT, CAM_AT)} walk={w.walk} step={w.step} headPitch={-0.2 + nod(b.f, b.ck(1, 1), 20, 0.4)} />
      <Waveform pos={VOICE_AT(LENS)} f={b.f} width={0.5} height={0.22} bars={16} color={AI_CYAN} grow={ease(b.f, b.ck(0, 1), 10, EASE.out) * (1 - ease(b.f, b.ln(1), 10))} intensity={1.3} yaw={0.3} />
    </>
  );
};

const Door: React.FC<{ b: Beat }> = ({ b }) => {
  const turn = ease(b.f, b.ck(1, 5), 8, EASE.inOut);
  return <FrontDoor pos={DOOR_POS} s={DOOR_S} turn={turn} lockGlow={turn} glowColor={HACK_RED} hand={ease(b.f, b.ck(1, 4) + 2, 14, EASE.out)} figure />;
};

const World: React.FC<{ b: Beat }> = ({ b }) => (atDoor(b) ? <Door b={b} /> : <Room b={b} />);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (atDoor(b)) {
    return (
      <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(1, 5), 8, EASE.out)}>
        <Chip text="鍵を開けてしまう" size={50} accent={HACK_RED} mark="ng" />
      </Layer>
    );
  }
  const text = b.f >= b.ck(0, 5) ? "お友達が\n迎えに来たから、\n玄関を開けて" : "お友達が\n迎えに来たから";
  return (
    <>
      <Bubble shot={shot} at3={LENS} text={text} k={Math.min(ease(b.f, b.ck(0, 3), 8, EASE.out), 1 - ease(b.f, b.ck(1, 3), 8))} tone="warm" dy={-110} dx={270} size={52} />
      <Layer x={SAFE_CX - 80} y={1372} k={ease(b.f, b.ck(1, 0), 8, EASE.out)}>
        <Chip text="聞き慣れた声なら…" size={46} accent={HACK_RED} />
      </Layer>
    </>
  );
};

export const EXAMPLE: SceneDefP = {
  topic: "たとえば…",
  shot,
  World,
  Overlay,
  light: (b) => (atDoor(b) ? { ...EVENING, hall: 0.4, front: 0.6, fill: 0.45 } : EVENING),
  grade: (b) => ({ danger: atDoor(b) ? 0.16 * ease(b.f, b.ck(1, 5), 10) : 0 }),
  dipIn: true,
  dipChunks: [[1, 4]],
};
