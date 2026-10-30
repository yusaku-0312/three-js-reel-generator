import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Bubble, Chip, COL, Headline, Layer, reveal, SAFE_CX, Stamp } from "../overlays";
import { Figure, walkAlong } from "../three/figures";
import { CallLine, PINK, RED, Waveform } from "../three/fx";
import { Phone } from "../three/props";
import { LAB_LIGHT, TOWN_LIGHT } from "../three/stage";
import { TOWN } from "../three/town";
import { SceneDefP } from "../types";
import { CHILD_STOP, MAN_AT, PHONE_AT } from "./story";
import { labCam } from "./cams";

// L0 (same close-up as the call) the picture drains, the call screen peels off: a voice-generator app.
// L1 the real mom at home, her phone silent. L2 back on the street: relieved, the child turns to the van
// (the door slides open) — frozen and tinted red one step before it. L3-L4 the lab: what the child "checked"
// was the stranger's phone playing a made voice.
const Y = 0.06;
const CHILD: V3 = [CHILD_STOP[0], Y, CHILD_STOP[2] - 0.4];
const MOM: V3 = [TOWN.kitchen[0] + 0.3, 0.04, TOWN.kitchen[2] - 0.55];

const inLab = (b: Beat) => b.f >= b.ln(3) - 4;
const atHome = (b: Beat) => b.f >= b.ln(1) - 4 && b.f < b.ln(2) - 4;

const freezeF = (b: Beat) => Math.min(b.f, b.ck(2, 5) + 3);

const street = (b: Beat) => {
  const f = freezeF(b);
  const turn = ease(f, b.ck(2, 3), 14, EASE.inOut);
  const go = walkAlong(CHILD, [0.42, Y, -2.55], ease(f, b.ck(2, 4) - 4, 34, EASE.inOut), 6);
  const manStep = ease(f, b.ck(2, 3) - 6, 22, EASE.inOut);
  return {
    child: { pos: go.pos, yaw: turn * -0.3, walk: go.walk, step: go.step, hop: ease(f, b.ck(2, 1), 10) * (1 - ease(f, b.ck(2, 1) + 10, 10)) },
    man: { pos: [MAN_AT[0] - manStep * 0.55, Y, MAN_AT[2] + manStep * 1.9] as V3, yaw: Math.PI - manStep * 0.6, walk: manStep * Math.PI * 4, step: manStep > 0 && manStep < 1 ? 1 : 0, armR: manStep * 0.7 },
    door: ease(f, b.ck(2, 4) - 10, 26, EASE.inOut),
  };
};

const shot = (b: Beat): Shot2 => {
  if (inLab(b))
    return breathe(
      keys2(b.f, [
        [0, labCam(-0.3)],
        [b.ck(3, 2), labCam(0.3), 60],
        [b.ck(4, 0), labCam(0, 0.8), 40],
      ]),
      b.f,
    );
  if (atHome(b))
    return breathe(
      keys2(b.f, [
        [0, { pos: [4.2, 3.3, 13.2], target: [-6.05, 1.2, 7.3], fov: 30, focus: MOM, aperture: 2.5 }],
        [b.ln(1), { pos: [3.4, 3.0, 13.6], target: [-6.05, 1.2, 7.4], fov: 30, focus: MOM, aperture: 2.5 }, 70],
      ]),
      b.f,
    );
  if (b.f >= b.ln(2) - 4)
    return breathe(
      keys2(b.f, [
        [0, { pos: [-0.64, 2.97, -15.04], target: [0.44, 0.8, -2.78], fov: 30, focus: [1.0, 0.7, -4.6], aperture: 2.5 }],
        [b.ck(2, 3), { pos: [-0.45, 2.6, -13.2], target: [0.3, 0.8, -2.4], fov: 30, focus: [0.5, 0.7, -2.8], aperture: 3 }, 60],
      ]),
      b.f,
      0.015,
    );
  const back = ease(b.f, b.ck(0, 1), 30, EASE.inOut);
  return {
    pos: [0.5 + back * 0.05, 1.1 + back * 0.04, -6.3 - back * 0.4],
    target: [PHONE_AT[0], PHONE_AT[1] + 0.08, PHONE_AT[2]],
    fov: 30,
    focus: PHONE_AT,
    aperture: 7,
  };
};

const PhoneScene: React.FC<{ b: Beat }> = ({ b }) => {
  const peel = ease(b.f, b.ck(0, 1), 18, EASE.inOut);
  const glitch = ease(b.f, b.ck(0, 1), 10);
  return (
    <>
      <Figure kind="child" pose={{ pos: CHILD, yaw: 0 }} />
      <Figure kind="man" pose={{ pos: MAN_AT, yaw: Math.PI, lean: 0.18, armR: 1.45 }} />
      <Phone pos={PHONE_AT} rot={[0, Math.PI, 0]} h={0.3} screen="call" under="gen" peel={peel} screenGlow={1.2} body="#15181f" edge={RED} edgeGlow={ease(b.f, b.ck(0, 2), 10)}>
        <Waveform pos={[0, 0.165, 0.02]} f={b.f} seed={11} width={0.44} height={0.16} intensity={1.6} color={PINK} glitch={glitch} live={1 - ease(b.f, 0, 6) * 0.9 + glitch * 0.9} />
      </Phone>
    </>
  );
};

const HomeScene: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Figure kind="mom" pose={{ pos: MOM, yaw: Math.PI / 2 - 0.4, lean: 0.15, armR: 0.6, armL: 0.5, headPitch: 0.25 }} />
    <Phone pos={[TOWN.kitchen[0] - 0.05, 0.67, TOWN.kitchen[2] + 0.35]} rot={[-Math.PI / 2, 0, 0.4]} h={0.26} screen="home" screenGlow={0.35} />
  </>
);

const StreetScene: React.FC<{ b: Beat }> = ({ b }) => {
  const s = street(b);
  return (
    <>
      <Figure kind="child" pose={{ ...s.child, tint: ease(b.f, b.ck(2, 5), 8) }} />
      <Figure kind="man" pose={s.man} />
    </>
  );
};

const LAB_CHILD: V3 = [-0.75, 0, 0.3];
const LAB_PHONE: V3 = [0.7, 1.5, 0];

const LabScene: React.FC<{ b: Beat }> = ({ b }) => {
  const line = ease(b.f, b.ck(3, 2), 24, EASE.inOut);
  const danger = ease(b.f, b.ck(4, 0), 8);
  const blink = danger > 0 ? 0.5 + 0.5 * Math.sin(b.f / 3) : 1;
  return (
    <>
      <Figure kind="child" pose={{ pos: LAB_CHILD, yaw: 0.5, headYaw: 0.2 }} />
      <Phone pos={LAB_PHONE} rot={[0, -0.35, 0]} h={1.15} screen="gen" body="#15181f" edge={RED} edgeGlow={0.8} screenGlow={1.1} />
      <Waveform pos={[LAB_PHONE[0] - 0.1, LAB_PHONE[1] + 0.72, 0.1]} f={b.f} seed={11} width={0.9} height={0.3} glitch={0.6} intensity={1.6} />
      <CallLine from={[LAB_PHONE[0] - 0.25, LAB_PHONE[1] - 0.1, 0.1]} to={[LAB_CHILD[0] + 0.05, 0.93, LAB_CHILD[2]]} f={b.f} grow={line} lift={0.4} color={danger > 0 ? RED : PINK} radius={0.035 * (0.8 + 0.2 * blink)} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (inLab(b)) return <LabScene b={b} />;
  if (atHome(b)) return <HomeScene b={b} />;
  if (b.f >= b.ln(2) - 4) return <StreetScene b={b} />;
  return <PhoneScene b={b} />;
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const out = (at: number, end: number) => Math.min(ease(b.f, at, 8, EASE.out), 1 - ease(b.f, end - 6, 6, EASE.in));
  if (inLab(b))
    return (
      <>
        <At shot={shot} p={[LAB_CHILD[0], 1.55, LAB_CHILD[2]]} k={out(b.ck(3, 0), b.dur + 20)}>
          <Chip text={ease(b.f, b.ck(3, 1), 1) > 0 ? "確認した…つもり" : "ママに確認した"} size={44} accent={ease(b.f, b.ck(3, 1), 1) > 0 ? COL.red : COL.teal} mark={ease(b.f, b.ck(3, 1), 1) > 0 ? "ng" : "ok"} />
        </At>
        <At shot={shot} p={[LAB_PHONE[0], LAB_PHONE[1] - 0.82, 0]} k={out(b.ck(3, 3), b.ck(4, 0) + 4)}>
          <Chip text="相手のスマホの声" size={42} accent={COL.red} />
        </At>
        <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(4, 0))}>
          <Headline text="その確認、本物？" size={84} f={b.f} at={b.ck(4, 0)} tone="red" />
        </Layer>
      </>
    );
  if (atHome(b))
    return (
      <Layer x={SAFE_CX} y={1250} k={out(b.ck(1, 2), b.ln(2) - 4)}>
        <Chip text="迎えは 頼んでいない" size={52} accent={COL.red} mark="ng" />
      </Layer>
    );
  if (b.f >= b.ln(2) - 4) {
    const c = street(b).child.pos;
    return (
      <>
        <Bubble shot={shot} at3={[c[0], 1.08, c[2]]} text="ママが頼んだ人なんだ" k={out(b.ck(2, 1), b.ck(2, 5))} tone="teal" dy={150} size={50} />
        <Layer x={SAFE_CX} y={760} k={ease(b.f, b.ck(2, 5), 6, EASE.out)}>
          <div style={{ fontSize: 220, fontWeight: 900, color: COL.red, textShadow: "0 0 30px rgba(255,59,74,0.8), 0 8px 0 #2a0508" }}>！</div>
        </Layer>
      </>
    );
  }
  return (
    <Layer x={SAFE_CX} y={1180} k={1}>
      <Stamp f={b.f} at={b.ck(0, 2)} text={"偽物の\n声"} size={340} />
    </Layer>
  );
};

export const REVEAL: SceneDefP = {
  topic: "その声は、偽物",
  shot,
  World,
  Overlay,
  light: (b) => (inLab(b) ? LAB_LIGHT : { ...TOWN_LIGHT, evening: atHome(b) ? 0.55 : 0.25 }),
  town: (b) => ({ vanDoor: b.f >= b.ln(2) - 4 && !inLab(b) ? street(b).door : 0 }),
  grade: (b) => {
    if (inLab(b)) return { danger: ease(b.f, b.ck(4, 0), 10) * 0.6 };
    if (b.f < b.ln(1) - 4) return { desat: ease(b.f, b.ck(0, 0), 10), glitch: ease(b.f, b.ck(0, 1), 4) * (1 - ease(b.f, b.ck(0, 1) + 8, 10)) + ease(b.f, b.ck(0, 2), 3) * (1 - ease(b.f, b.ck(0, 2) + 6, 8)) };
    if (atHome(b)) return {};
    return { danger: ease(b.f, b.ck(2, 5), 6), desat: ease(b.f, b.ck(2, 5), 6) * 0.4 };
  },
  bloom: (b) => (inLab(b) ? 0.5 : 0.35),
  dipLines: [1, 2, 3],
};
