import React from "react";
import { Screen } from "../three/screens";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { NIGHT } from "../../kyouhaku/three/room";
import { At, Chip, Layer, Mark, SAFE_CX } from "../overlays";
import { HACK_RED, MonitorCam, Phone, ProgressRing, SAFE_TEAL } from "../three/props";
import { screenAt } from "./util";
import { SceneDefP } from "../types";
import { HERO, HERO_CAM } from "./cams";

// L0 (dip, desk lamp on) the maker's app on the phone (left) 「カメラ本体の更新」; 「カメラ本体や」 the camera appears
// bottom right with a teal ring sweeping round it; 「更新を確認」 the ring closes, the app says up to date, two checks.
// L1 the account login on the phone: 「ほかで使っていない」 the password grows long; 「確認コードを」 two-step
// verification with the six-digit code; the switch flips ON on 「有効にしましょう」.
const PHONE_AT: V3 = [-0.4, 1.38, 0.9];
const CAM_AT: V3 = [0.4, 0.62, 1.05];
const CAM_S = 2.0;
const RING_AT: V3 = [CAM_AT[0], CAM_AT[1] + 0.2 * CAM_S, CAM_AT[2] + 0.3];

const login = (b: Beat) => b.f >= b.ln(1) - 4;

const shot = (b: Beat): Shot2 => breathe(HERO_CAM, b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (login(b)) {
    const s = screenAt<Screen>(b.f, [
      [0, "loginShort"],
      [b.ck(1, 2), "loginLong"],
      [b.ck(1, 4) - 2, "twoStep"],
      [b.ck(1, 8) + 4, "twoStepOn"],
    ]);
    return <Phone pos={HERO} h={1.55} screen={s.screen} next={s.next} mix={s.mix} glow={0.35} glowColor={SAFE_TEAL} />;
  }
  const camIn = ease(b.f, b.ck(0, 2) - 2, 12, EASE.out);
  const s = screenAt<Screen>(b.f, [
    [0, "update"],
    [b.ck(0, 4) + 4, "updated"],
  ]);
  return (
    <>
      <Phone pos={PHONE_AT} h={1.25} screen={s.screen} next={s.next} mix={s.mix} glow={0.3} glowColor={SAFE_TEAL} />
      {camIn > 0.01 && <MonitorCam pos={CAM_AT} s={CAM_S * (0.4 + 0.6 * camIn)} yaw={-0.25} pitch={0.05} led="teal" f={b.f} />}
      <ProgressRing pos={RING_AT} r={0.34} k={ease(b.f, b.ck(0, 2) + 4, b.ck(0, 4) - b.ck(0, 2), EASE.inOut)} vis={camIn} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (login(b)) {
    return (
      <>
        <Layer x={SAFE_CX} y={540} k={Math.min(ease(b.f, b.ln(1) - 2, 8, EASE.out), 1 - ease(b.f, b.ck(1, 4) - 6, 6))}>
          <Chip text="ほかで使っていないパスワード" size={44} accent={SAFE_TEAL} />
        </Layer>
        <Layer x={SAFE_CX} y={1372} k={Math.min(ease(b.f, b.ck(1, 1), 8, EASE.out), 1 - ease(b.f, b.ck(1, 4) - 6, 6))}>
          <Chip text="使い回さない" size={46} accent={HACK_RED} mark="ng" />
        </Layer>
        <Layer x={SAFE_CX} y={540} k={ease(b.f, b.ck(1, 4), 8, EASE.out)}>
          <Chip text="確認コードもON" size={50} accent={SAFE_TEAL} mark="ok" />
        </Layer>
      </>
    );
  }
  const ok = ease(b.f, b.ck(0, 4) + 4, 8, EASE.out);
  return (
    <>
      <Layer x={SAFE_CX} y={540} k={ease(b.f, b.ck(0, 1), 9, EASE.out)}>
        <Chip text="パパ・ママの備え" size={52} accent={SAFE_TEAL} />
      </Layer>
      <At shot={shot} p={[CAM_AT[0] + 0.3, CAM_AT[1] + 0.75, CAM_AT[2] + 0.3]} k={ok}>
        <Mark kind="ok" size={84} />
      </At>
      <Layer x={SAFE_CX - 190} y={1372} k={ok}>
        <Chip text="アプリ" size={46} accent={SAFE_TEAL} mark="ok" />
      </Layer>
      <Layer x={SAFE_CX + 170} y={1372} k={ok}>
        <Chip text="カメラ本体" size={46} accent={SAFE_TEAL} mark="ok" />
      </Layer>
    </>
  );
};

export const PARENT: SceneDefP = {
  topic: "パパ・ママは更新とアカウントを",
  shot,
  World,
  Overlay,
  light: () => ({ ...NIGHT, front: 0.6, fill: 0.45 }),
  dipIn: true,
  dipLines: [1],
};
