import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Bubble, Chip, COL, Layer, reveal, SAFE_CX } from "../overlays";
import { CallLine, CYAN, Figure, GroundRing, PhotoCard, Phone, PINK, RED, walkAlong, Waveform } from "../three/props";
import { LAB_LIGHT, TOWN_LIGHT } from "../../aimukae/three/stage";
import { SceneDefP } from "../types";
import { labCam, span, walkCam, WALK_FROM, WALK_TO } from "./cams";

// L0 the town at dusk: the child walks home safe (teal ring at the feet), 「子どもは無事なのに」.
// 「誘拐されたように」 (dip) the lab: a message from an unknown number pops onto the parent's phone, the fake
// photo (a mosaic marked 偽, never drawn) inside; it shakes on 「届いた」.
// L1 the child's photo top left: its face streams in cyan into the fake (deepfake); 「本人そっくりの声で」 the
// screen turns into a call with a pink voice and 「ママ、助けて」; 「本当に」 the mother steps back, red wash.
const inTown = (b: Beat) => b.f < b.ck(0, 3) - 4;
const PHONE: V3 = [0, 1.3, 0.3];
const PHONE_R: V3 = [0.42, 1.25, 0.3];
const CARD: V3 = [-0.62, 1.95, 0.2];
const MOM: V3 = [-0.62, 0, 0.6];

const childAt = (b: Beat) => walkAlong(WALK_FROM, WALK_TO, b.f / (b.ck(0, 3) + 30), 11);

const shot = (b: Beat): Shot2 => {
  if (inTown(b)) return breathe(walkCam(childAt(b).pos[2]), b.f);
  return breathe(
    keys2(b.f, [
      [0, labCam(0, 0.4)],
      [b.ck(0, 3), labCam(0, 0.4), 1],
      [b.ck(0, 4), labCam(0, 0), 50],
      [b.ck(1, 6) - 4, labCam(-0.15, 0.5), 30],
    ]),
    b.f,
  );
};

const TownBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const c = childAt(b);
  return (
    <>
      <Figure kind="child" pose={{ pos: c.pos, yaw: c.yaw, walk: c.walk, step: c.step }} />
      <GroundRing pos={[c.pos[0], 0.07, c.pos[2]]} radius={0.55} k={ease(b.f, b.ck(0, 1), 10, EASE.out)} />
    </>
  );
};

const LabBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const arrive = ease(b.f, b.ck(0, 3), 10, EASE.out);
  const shake = b.f >= b.ck(0, 6) && b.f < b.ck(0, 6) + 24 ? 1 : 0;
  const l1 = ease(b.f, b.ln(1) - 6, 16, EASE.inOut);
  const stream = ease(b.f, b.ck(1, 0) + 6, 22, EASE.inOut);
  const call = ease(b.f, b.ck(1, 2), 8, EASE.inOut);
  const mom = ease(b.f, b.ck(1, 6) - 4, 14, EASE.out);
  const startle = ease(b.f, b.ck(1, 6), 8, EASE.out);
  const phonePos = lerp3(PHONE, PHONE_R, l1);
  return (
    <>
      <Phone
        pos={phonePos}
        h={1.5 - l1 * 0.2}
        screen="fakeMsg"
        next="fakeCall"
        mix={call}
        k={arrive}
        glow={0.5 + shake * 0.5}
        glowColor={RED}
        shake={shake}
        f={b.f}
      >
        {call > 0 && <Waveform pos={[0, -0.32, 0.08]} f={b.f} seed={7} width={0.5} height={0.2} grow={call} intensity={1.6} color={PINK} glitch={0.25} />}
      </Phone>
      <PhotoCard pos={CARD} kind="park" scale={1.1} k={l1 * (1 - mom)} face={ease(b.f, b.ck(1, 0), 8, EASE.out)} />
      <CallLine from={[CARD[0] + 0.15, CARD[1] - 0.05, CARD[2] + 0.05]} to={[phonePos[0], phonePos[1] + 0.25, phonePos[2] + 0.1]} f={b.f} grow={stream * (1 - ease(b.f, b.ck(1, 2) + 6, 12, EASE.inOut))} lift={0.35} color={CYAN} radius={0.025} />
      {mom > 0 && (
        <Figure
          kind="mom"
          pose={{ pos: [MOM[0] - startle * 0.12, 0, MOM[2]], yaw: 0.9, lean: -0.18 * startle, armL: 1.45 * startle, armR: 1.55 * startle, headPitch: -0.1 * startle }}
        />
      )}
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => (inTown(b) ? <TownBeat b={b} /> : <LabBeat b={b} />);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (inTown(b))
    return (
      <Layer x={SAFE_CX} y={560} k={reveal(b.f, b.ck(0, 1))}>
        <Chip text="子どもは無事" size={52} accent={COL.teal} mark="ok" />
      </Layer>
    );
  const phone = b.f < b.ln(1) ? PHONE : PHONE_R;
  return (
    <>
      <Layer x={SAFE_CX} y={545} k={span(b.f, b.ck(0, 5), b.ln(1) - 4)}>
        <Chip text="偽の写真・動画" size={50} accent={COL.red} mark="ng" />
      </Layer>
      <At shot={shot} p={[CARD[0], CARD[1] + 0.42, CARD[2]]} k={span(b.f, b.ck(1, 1), b.ck(1, 2))}>
        <Chip text="ディープフェイク" size={44} accent={COL.cyan} />
      </At>
      <Bubble shot={shot} at3={[phone[0], phone[1] + 0.55, phone[2]]} text="ママ、助けて" k={span(b.f, b.ck(1, 3), b.ck(1, 6) + 6)} tone="pink" dy={150} size={56} />
      <Layer x={SAFE_CX} y={1350} k={span(b.f, b.ck(1, 4), b.ck(1, 6))}>
        <Chip text="偽の音声" size={50} accent={COL.pink} mark="ng" />
      </Layer>
    </>
  );
};

export const FAKE: SceneDefP = {
  topic: "偽の誘拐写真と声",
  shot,
  World,
  Overlay,
  light: (b) => (inTown(b) ? TOWN_LIGHT : LAB_LIGHT),
  grade: (b) =>
    inTown(b)
      ? {}
      : {
          glitch: ease(b.f, b.ck(1, 0) + 6, 3) * (1 - ease(b.f, b.ck(1, 0) + 10, 14)) * 0.6,
          danger: 0.25 * ease(b.f, b.ck(1, 6), 12) + 0.08 * ease(b.f, b.ck(0, 6), 8),
        },
  dipIn: true,
  dipChunks: [[0, 3]],
};
