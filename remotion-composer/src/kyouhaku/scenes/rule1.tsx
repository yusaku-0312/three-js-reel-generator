import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { Bubble, Chip, Layer, SAFE_CX, StepPill } from "../overlays";
import { faceTo, Figure, walkAlong } from "../three/figures";
import { CallLine, Coins, Phone, PhotoCard, SAFE_TEAL } from "../three/props";
import { NIGHT } from "../three/room";
import { SceneDefP } from "../types";
import { DAD_DOOR, dolly, DOOR_CAM, HERO, HERO_CAM, MOM_DOOR, TEEN_AT_DOOR, TEEN_STAND } from "./cams";
import { screenAt, span } from "./util";

// L0 floating threat chat: coins and a new photo fly into the phone, and the demands only pile up
// (「もっと送れ」「あと3万円」). L1 (dip) the room: the child walks from the bed to mom at the door; a teal line
// joins them. L2 「親に言ったら怒られる…」 is struck out; mom leans down: 「何か送ってしまっていても 相談していいよ」.
const isHero = (b: Beat) => b.f < b.ln(1) - 4;
const COINS_FROM: V3 = [-0.75, 0.55, 1.6];
const PHOTO_FROM: V3 = [0.75, 0.55, 1.6];
const INTO: V3 = [HERO[0], HERO[1] - 0.1, HERO[2] + 0.1];

const shot = (b: Beat): Shot2 => {
  if (isHero(b)) return breathe(HERO_CAM, b.f);
  return breathe(lerpShot2(DOOR_CAM, dolly(DOOR_CAM, 0.14), ease(b.f, b.ln(2), 60, EASE.cam)), b.f, 0.02);
};

const Hero: React.FC<{ b: Beat }> = ({ b }) => {
  const coin = ease(b.f, b.ck(0, 1), 16, EASE.inOut);
  const photo = ease(b.f, b.ck(0, 2), 16, EASE.inOut);
  const s = screenAt(b.f, [
    [0, "dmThreat"],
    [b.ck(0, 4), "dmMore"],
  ]);
  const more = ease(b.f, b.ck(0, 4), 6, EASE.out);
  const arc = (k: number) => Math.sin(k * Math.PI) * 0.35;
  const cp = lerp3(COINS_FROM, INTO, coin);
  const pp = lerp3(PHOTO_FROM, INTO, photo);
  return (
    <>
      <Phone pos={HERO} h={1.5} {...s} glow={0.5 + more * 0.4} shake={more * (1 - ease(b.f, b.ck(0, 5) + 10, 12)) * 0.6} f={b.f} />
      <Coins pos={[cp[0], cp[1] + arc(coin), cp[2]]} k={ease(b.f, b.ck(0, 1) - 4, 6) * (1 - ease(b.f, b.ck(0, 1) + 12, 4))} scale={1.6} />
      <PhotoCard pos={[pp[0], pp[1] + arc(photo), pp[2]]} k={ease(b.f, b.ck(0, 2) - 4, 6) * (1 - ease(b.f, b.ck(0, 2) + 12, 4))} kind="ordinary" scale={0.6} rot={[0, -0.3, 0.2]} />
    </>
  );
};

const Room: React.FC<{ b: Beat }> = ({ b }) => {
  const w = walkAlong(TEEN_STAND, TEEN_AT_DOOR, ease(b.f, b.ck(1, 0), b.ck(1, 3) - b.ck(1, 0), EASE.inOut), 6);
  const arrived = ease(b.f, b.ck(1, 3), 10);
  const lean = ease(b.f, b.ck(2, 4) - 4, 14, EASE.inOut);
  const teenYaw = w.step ? w.yaw : faceTo(TEEN_AT_DOOR, MOM_DOOR);
  const worry = span(b.f, b.ck(2, 0), b.ck(2, 3) + 4);
  const momChest: V3 = [MOM_DOOR[0], 1.15, MOM_DOOR[2]];
  const teenChest: V3 = [w.pos[0], 0.9, w.pos[2]];
  return (
    <>
      <Figure kind="teen" pose={{ ...w, yaw: teenYaw, slump: worry * 0.5, headPitch: 0.15 * worry }} />
      <Figure kind="dad" pose={{ pos: DAD_DOOR, yaw: faceTo(DAD_DOOR, w.pos) }} />
      <Figure kind="mom" pose={{ pos: MOM_DOOR, yaw: faceTo(MOM_DOOR, w.pos), lean: lean * 0.35, headPitch: lean * 0.3, armR: lean * 0.7, armL: 0.2 }} />
      <CallLine from={teenChest} to={momChest} f={b.f} grow={arrived} lift={0.35} radius={0.018} color={SAFE_TEAL} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => (isHero(b) ? <Hero b={b} /> : <Room b={b} />);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (isHero(b)) {
    return (
      <Layer x={SAFE_CX} y={530} k={span(b.f, b.ck(0, 5))}>
        <Chip text="要求は終わらない" size={50} accent="#ff3b4a" mark="ng" />
      </Layer>
    );
  }
  const strike = ease(b.f, b.ck(2, 2), 10, EASE.out);
  return (
    <>
      <Layer x={SAFE_CX} y={560} k={span(b.f, b.ck(1, 0), b.ck(2, 0) - 6)}>
        <StepPill n={1} text="応じる前に 大人へ" size={52} />
      </Layer>
      <Bubble shot={shot} at3={[TEEN_AT_DOOR[0], 1.4, TEEN_AT_DOOR[2]]} text={"親に言ったら\n怒られる…"} k={span(b.f, b.ck(2, 0) - 2, b.ck(2, 3) + 4)} tone="grey" dy={150} dx={80} strike={strike} />
      <Bubble
        shot={shot}
        at3={[MOM_DOOR[0], 1.75, MOM_DOOR[2]]}
        text={"何か送ってしまっていても、\n相談していいよ"}
        k={span(b.f, b.ck(2, 4) - 2)}
        tone="teal"
        dy={60}
        dx={200}
        size={44}
      />
    </>
  );
};

export const RULE1: SceneDefP = {
  topic: "応じる前に、大人へ",
  shot,
  World,
  Overlay,
  light: (b) => (isHero(b) ? { ...NIGHT, lamp: 0.6 } : { ...NIGHT, hall: 0.9 }),
  room: () => ({ door: 1 }),
  grade: (b) => ({ danger: isHero(b) ? 0.25 * ease(b.f, b.ck(0, 4), 8) : 0 }),
  dipIn: true,
  dipLines: [1],
};
