import React from "react";
import { Beat, lerp, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, Layer, SAFE_CX, StepPill } from "../overlays";
import { HACK_RED, KeyProp, Phone, SAFE_TEAL, Shield, Stranger } from "../three/devices";
import { screenAt } from "./util";
import { SceneDefP } from "../types";
import { HERO, HERO_CAM, SHIELD_CAM } from "./cams";
import { Bedroom, DARK_NIGHT } from "./cast";

// L0 (dip) the login screen of the camera account; 「長いパスワードを」 the password field grows long and turns teal.
// L1 two-step verification: the six-digit code, and the switch flips ON on 「有効にしてください」.
// L2 (dip) the bedroom: a stranger holding the 「パスワード」 key walks toward the bed; a teal shield with the code
// rises on 「他人が入り込むのを」 and knocks the stranger back on 「防ぐ助けに」.
const inRoom = (b: Beat) => b.f >= b.ln(2) - 4;
const WALK_FROM: V3 = [-0.75, 0, 0.5];
const WALK_TO: V3 = [-0.55, 0, -0.6];
const SHIELD_AT: V3 = [0.4, 0.02, -1.55];

const shot = (b: Beat): Shot2 => (inRoom(b) ? breathe(SHIELD_CAM, b.f, 0.02) : breathe(HERO_CAM, b.f));

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (!inRoom(b)) {
    const s = screenAt(b.f, [
      [0, "loginShort"],
      [b.ck(0, 3), "loginLong"],
      [b.ln(1) - 2, "twoStep"],
      [b.ck(1, 4), "twoStepOn"],
    ]);
    return <Phone pos={HERO} h={1.55} screen={s.screen} next={s.next} mix={s.mix} glow={0.35} glowColor={SAFE_TEAL} />;
  }
  const walk = ease(b.f, b.ck(2, 0), b.ck(2, 3) - b.ck(2, 0) + 6, EASE.inOut);
  const hit = ease(b.f, b.ck(2, 4), 8, EASE.out);
  const back = hit * (1 - ease(b.f, b.ck(2, 4) + 10, 30, EASE.inOut) * 0.4);
  const z = lerp(WALK_FROM[2], WALK_TO[2], walk) + back * 0.6;
  const pos: V3 = [lerp(WALK_FROM[0], WALK_TO[0], walk) - back * 0.3, 0, z];
  const bob = Math.abs(Math.sin(b.f / 4)) * 0.03 * (walk > 0 && walk < 1 ? 1 : 0);
  return (
    <>
      <Bedroom f={b.f} led="blue" />
      <Stranger pos={[pos[0], bob, pos[2]]} yaw={Math.PI - 0.6} s={1.15} k={ease(b.f, b.ln(2) - 4, 10, EASE.out)} lean={-0.25 * hit * (1 - ease(b.f, b.ck(2, 4) + 10, 20))} />
      <KeyProp pos={[pos[0] - 0.05, 1.42 + bob, pos[2] + 0.05]} rot={[0, 0, 0.2]} s={1.6} k={ease(b.f, b.ck(2, 0), 10, EASE.out)} />
      <Shield pos={SHIELD_AT} yaw={-0.5} s={1.35} k={ease(b.f, b.ck(2, 3) - 2, 12, EASE.out)} hit={hit * (1 - ease(b.f, b.ck(2, 4) + 6, 16))} f={b.f} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={540} k={Math.min(ease(b.f, b.ck(0, 0), 9, EASE.out), 1 - ease(b.f, b.ln(1) - 6, 6))}>
      <StepPill n={2} text="長いパスワード" size={50} />
    </Layer>
    <Layer x={SAFE_CX} y={1372} k={Math.min(ease(b.f, b.ck(0, 2), 8, EASE.out), 1 - ease(b.f, b.ln(1) - 6, 6))}>
      <Chip text="ほかで使い回さない" size={48} accent={HACK_RED} mark="ng" />
    </Layer>
    <Layer x={SAFE_CX} y={540} k={Math.min(ease(b.f, b.ln(1), 9, EASE.out), 1 - ease(b.f, b.ln(2) - 6, 6))}>
      <StepPill n={3} text="確認コードもON" size={50} />
    </Layer>
    <Layer x={SAFE_CX} y={532} k={Math.min(ease(b.f, b.ck(2, 1), 8, EASE.out), 1 - ease(b.f, b.ck(2, 4) - 4, 6))}>
      <Chip text="パスワードが知られても" size={48} accent={HACK_RED} />
    </Layer>
    <Layer x={SAFE_CX} y={532} k={ease(b.f, b.ck(2, 4), 8, EASE.out)}>
      <Chip text="確認コードで防ぐ" size={48} accent={SAFE_TEAL} mark="ok" />
    </Layer>
  </>
);

export const PASSWORD: SceneDefP = {
  topic: "備え② パスワードと確認コード",
  shot,
  World,
  Overlay,
  light: (b) => (inRoom(b) ? DARK_NIGHT : { ...DARK_NIGHT, lamp: 1, front: 0.6, fill: 0.45 }),
  dipIn: true,
  dipLines: [2],
};
