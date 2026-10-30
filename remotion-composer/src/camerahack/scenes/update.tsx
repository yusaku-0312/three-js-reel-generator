import React from "react";
import { Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { NIGHT } from "../../kyouhaku/three/room";
import { At, Chip, Layer, Mark, SAFE_CX, StepPill } from "../overlays";
import { Booklet, HACK_RED, MonitorCam, Phone, ProgressRing, SAFE_TEAL } from "../three/devices";
import { screenAt } from "./util";
import { SceneDefP } from "../types";
import { dolly, HERO_CAM } from "./cams";

// L0 (dip, desk lamp on) the maker's app on the phone (left) 「カメラ本体の更新」; the manual pops in top right on
// 「説明書で」; the camera appears bottom right on 「カメラ本体の更新を」 and a teal ring sweeps round it, closing with
// a check on 「確認しましょう」. L1 the camera comes to the centre, big: a red fault lights on its shell on
// 「使われる弱点を」 and a teal patch covers it on 「直す役割があります」. L2 back to phone + camera: the phone shows the
// app is up to date (✓ アプリ), then the camera gets its own ✓ (カメラ本体).
const PHONE_AT: V3 = [-0.4, 1.38, 0.9];
const SIDE_CAM: V3 = [0.4, 0.62, 1.05];
const BIG_CAM: V3 = [0, 0.42, 0.9];
const SIDE_S = 2.0;
const BIG_S = 3.0;

const shot = (b: Beat): Shot2 => breathe(dolly(HERO_CAM, 0.05 * ease(b.f, b.ln(1), 30, EASE.cam) * (1 - ease(b.f, b.ln(2) - 4, 20, EASE.cam))), b.f);

/** 0 = side-by-side layout, 1 = camera alone in the centre (line 1). */
const solo = (b: Beat) => ease(b.f, b.ln(1) - 4, 16, EASE.cam) * (1 - ease(b.f, b.ln(2) - 4, 16, EASE.cam));

const ringHead = (p: V3, s: number): V3 => [p[0], p[1] + 0.2 * s, p[2] + 0.3];

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const k = solo(b);
  const camIn = Math.max(ease(b.f, b.ck(0, 5) - 2, 12, EASE.out), b.f >= b.ln(1) - 4 ? 1 : 0);
  const camPos = lerp3(SIDE_CAM, BIG_CAM, k);
  const camS = lerp(SIDE_S, BIG_S, k) * (0.4 + 0.6 * camIn);
  const progress = ease(b.f, b.ck(0, 5) + 4, b.ck(0, 6) - b.ck(0, 5) - 2, EASE.inOut);
  const ringVis = camIn * (1 - k) * (1 - ease(b.f, b.ln(1) - 8, 6));
  const phoneK = 1 - k;
  const s = screenAt(b.f, [
    [0, "update"],
    [b.ck(0, 6), "updated"],
    [b.ln(2), "appOk"],
  ]);
  return (
    <>
      {phoneK > 0.01 && <Phone pos={[PHONE_AT[0] - k * 0.8, PHONE_AT[1], PHONE_AT[2]]} h={1.25} screen={s.screen} next={s.next} mix={s.mix} glow={0.3} glowColor={SAFE_TEAL} />}
      <Booklet pos={[0.45, 1.88, 0.85]} rot={[0, -0.25, 0.08]} s={1.25} k={Math.min(ease(b.f, b.ck(0, 4), 10, EASE.out), 1 - ease(b.f, b.ln(1) - 8, 8))} />
      {camIn > 0.01 && (
        <MonitorCam pos={camPos} s={camS} yaw={-0.25 * (1 - k) + Math.sin(b.f / 60) * 0.1} pitch={0.05} led="teal" crack={ease(b.f, b.ck(1, 2), 8, EASE.out)} patch={ease(b.f, b.ck(1, 3), 12, EASE.out)} f={b.f} />
      )}
      <ProgressRing pos={ringHead(SIDE_CAM, SIDE_S)} r={0.34} k={b.f >= b.ln(2) ? 1 : progress} vis={b.f >= b.ln(2) ? ease(b.f, b.ck(2, 2), 10, EASE.out) : ringVis} />
    </>
  );
};

const okAt = (b: Beat) => (b.f < b.ln(1) ? b.ck(0, 6) : b.ck(2, 2));

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const k = solo(b);
  return (
    <>
      <Layer x={SAFE_CX} y={540} k={ease(b.f, b.ck(0, 0), 9, EASE.out)}>
        <StepPill n={1} text="カメラ本体を更新" size={50} />
      </Layer>
      <At shot={shot} p={[SIDE_CAM[0] + 0.3, SIDE_CAM[1] + 0.75, SIDE_CAM[2] + 0.3]} k={(1 - k) * Math.min(ease(b.f, okAt(b), 6, EASE.out), b.f < b.ln(1) ? 1 - ease(b.f, b.ln(1) - 8, 6) : 1)}>
        <Mark kind="ok" size={84} />
      </At>
      <Layer x={SAFE_CX} y={1372} k={Math.min(ease(b.f, b.ck(1, 2), 8, EASE.out), 1 - ease(b.f, b.ck(1, 3), 4))}>
        <Chip text="ハッキングに使われる弱点" size={46} accent={HACK_RED} />
      </Layer>
      <Layer x={SAFE_CX} y={1372} k={Math.min(ease(b.f, b.ck(1, 3), 6, EASE.out), 1 - ease(b.f, b.ln(2) - 6, 6))}>
        <Chip text="更新で弱点を直す" size={46} accent={SAFE_TEAL} mark="ok" />
      </Layer>
      <Layer x={SAFE_CX - 200} y={1372} k={ease(b.f, b.ck(2, 0) + 4, 8, EASE.out)}>
        <Chip text="アプリ" size={46} accent={SAFE_TEAL} mark="ok" />
      </Layer>
      <Layer x={SAFE_CX + 170} y={1372} k={ease(b.f, b.ck(2, 2), 8, EASE.out)}>
        <Chip text="カメラ本体" size={46} accent={SAFE_TEAL} mark="ok" />
      </Layer>
    </>
  );
};

export const UPDATE: SceneDefP = {
  topic: "備え① カメラ本体の更新",
  shot,
  World,
  Overlay,
  light: () => ({ ...NIGHT, front: 0.6, fill: 0.45 }),
  dipIn: true,
};
