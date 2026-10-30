import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { faceTo } from "../../kyouhaku/three/figures";
import { At, Bubble, Chip, Layer, Mark, SAFE_CX, StepPill } from "../overlays";
import { AI_CYAN, Figure, FloorRing, FrontDoor, LOCK_X, LOCK_Y, MonitorCam, Phone, SAFE_TEAL, Waveform } from "../three/props";
import { SceneDefP } from "../types";
import { HERO_CAM, KID_FACE, MOM_KNEEL, PAIR_CAM } from "./cams";
import { EVENING, Kid } from "./cast";

// L0 (dip) the monitor camera big: the copied voice (cyan) asks in a warm bubble 「パパ・ママの声でお願い」.
// 「鍵を開ける前に」 the front door (left, shut, the lock glowing teal) and 「自分の電話から」 the child's phone (right);
// 「いつもの番号に」 the screen calls ママ; a check on 「確認することを」. 「親子で」 (dip) the room: the mother crouches
// to the child, a teal ring on the floor round them.
const phase = (b: Beat) => (b.f >= b.ck(0, 9) - 4 ? 2 : b.f >= b.ck(0, 4) - 4 ? 1 : 0);
const CAM_POS: V3 = [0, 1.25, 0.9];
const DOOR_POS: V3 = [-0.72, 0.05, 0.55];
const DOOR_S = 0.95;
const LOCK: V3 = [DOOR_POS[0] + LOCK_X * DOOR_S, DOOR_POS[1] + LOCK_Y * DOOR_S, DOOR_POS[2] + 0.1];
const PHONE_AT: V3 = [0.45, 1.1, 1.05];

const shot = (b: Beat): Shot2 => (phase(b) === 2 ? breathe(PAIR_CAM, b.f, 0.02) : breathe(HERO_CAM, b.f));

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const p = phase(b);
  if (p === 0) {
    return (
      <>
        <MonitorCam pos={CAM_POS} s={2.8} yaw={-0.25 + Math.sin(b.f / 60) * 0.08} pitch={0.05} led="blue" f={b.f} />
        <Waveform pos={[CAM_POS[0] + 0.02, CAM_POS[1] - 0.45, CAM_POS[2] + 0.5]} f={b.f} width={0.6} height={0.24} bars={16} color={AI_CYAN} grow={ease(b.f, b.ck(0, 1), 10, EASE.out)} intensity={1.3} />
      </>
    );
  }
  if (p === 1) {
    return (
      <>
        <FrontDoor pos={DOOR_POS} s={DOOR_S} turn={0} lockGlow={ease(b.f, b.ck(0, 4), 10, EASE.out)} glowColor={SAFE_TEAL} k={ease(b.f, b.ck(0, 4) - 4, 12, EASE.out)} />
        <Phone pos={PHONE_AT} h={1.35} rot={[0, -0.12, 0]} screen="calling" glow={0.35} glowColor={SAFE_TEAL} k={ease(b.f, b.ck(0, 5), 12, EASE.out)} />
      </>
    );
  }
  const r = ease(b.f, b.ck(0, 9) + 6, 16, EASE.out);
  return (
    <>
      <Figure kind="mom" pose={{ pos: MOM_KNEEL, yaw: faceTo(MOM_KNEEL, KID_FACE), lean: 0.38, armR: 0.9, armL: 0.5, headPitch: 0.2 }} />
      <Kid pos={KID_FACE} yaw={faceTo(KID_FACE, MOM_KNEEL)} armL={0.9} headPitch={-0.1} />
      <FloorRing pos={[(MOM_KNEEL[0] + KID_FACE[0]) / 2, 0.02, (MOM_KNEEL[2] + KID_FACE[2]) / 2]} r={0.62} k={r} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const p = phase(b);
  if (p === 0) {
    return (
      <>
        <Bubble shot={shot} at3={[CAM_POS[0], CAM_POS[1] + 0.3, CAM_POS[2]]} text={"パパ・ママの声で\nお願い"} k={ease(b.f, b.ck(0, 2), 8, EASE.out)} tone="warm" dy={300} size={54} />
        <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(0, 3), 8, EASE.out)}>
          <Chip text="お願いされても…" size={48} accent={AI_CYAN} />
        </Layer>
      </>
    );
  }
  if (p === 1) {
    return (
      <>
        <Layer x={SAFE_CX} y={540} k={ease(b.f, b.ck(0, 4), 9, EASE.out)}>
          <StepPill n={1} text="開ける前に電話で確認" size={48} />
        </Layer>
        <At shot={shot} p={[LOCK[0], LOCK[1] - 0.3, LOCK[2]]} k={ease(b.f, b.ck(0, 4) + 4, 8, EASE.out)}>
          <Chip text="まだ開けない" size={42} accent={SAFE_TEAL} />
        </At>
        <At shot={shot} p={[PHONE_AT[0] + 0.25, PHONE_AT[1] - 0.55, PHONE_AT[2] + 0.2]} k={ease(b.f, b.ck(0, 8), 6, EASE.out)}>
          <Mark kind="ok" size={96} />
        </At>
      </>
    );
  }
  return (
    <Layer x={SAFE_CX} y={540} k={ease(b.f, b.ck(0, 9), 8, EASE.out)}>
      <Chip text="親子で約束" size={54} accent={SAFE_TEAL} mark="ok" />
    </Layer>
  );
};

export const PROMISE: SceneDefP = {
  topic: "鍵を開ける前に電話で確認",
  shot,
  World,
  Overlay,
  light: (b) => (phase(b) === 2 ? EVENING : { ...EVENING, front: 0.6, fill: 0.45 }),
  dipIn: true,
  dipChunks: [[0, 4], [0, 9]],
};
