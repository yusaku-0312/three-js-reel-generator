import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Bubble, Chip, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Figure } from "../three/figures";
import { CallLine, GroundRing, Pin, PINK, RED, TEAL, Waveform } from "../three/fx";
import { Envelope, Phone } from "../three/props";
import { LAB_LIGHT, TOWN_LIGHT } from "../three/stage";
import { SceneDefP } from "../types";
import { labCam } from "./cams";

// Promise 2. L0 the sealed word can still leak (a shadow behind it); even when the answer is right, hang up
// and call back yourself. L1 the stranger's phone: its "mom" is a generator app. L2 the town from above:
// the child's own phone calls the saved number; the light reaches home; voice AND the fact are checked.
const Y = 0.06;
export const CHILD_TOWN: V3 = [1.0, Y, 1.0];
export const MAN_TOWN: V3 = [0.45, Y, -0.7];
export const HOME_PIN: V3 = [-7.3, 3.4, 7.6];
const inTown = (b: Beat) => b.f >= b.ln(2) - 4;

export const aerial = (f: number, from = 0): Shot2 =>
  breathe(
    keys2(f, [
      // From behind home (foreground) toward the child at the crosswalk: the call travels up the frame.
      [from, { pos: [-19.5, 8.0, 12.0], target: [-2.68, 1.0, 4.03], fov: 30, focus: [-2.7, 1.0, 4.0], aperture: 0.8 }],
      [from, { pos: [-21.0, 8.35, 12.56], target: [-2.68, 1.0, 4.03], fov: 30, focus: [-2.7, 1.0, 4.0], aperture: 0.8 }, 300],
    ]),
    f,
    0.02,
  );

const shot = (b: Beat): Shot2 => {
  if (inTown(b)) return aerial(b.f, b.ln(2) - 4);
  return breathe(keys2(b.f, [[0, labCam(-0.2)], [b.ln(1) - 6, labCam(0.3, -0.6), 50]]), b.f);
};

const LeakBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const peek = ease(b.f, b.ck(0, 1), 18, EASE.inOut) * (1 - ease(b.f, b.ck(0, 4), 12));
  const away = ease(b.f, b.ck(0, 4) + 2, 14, EASE.inOut);
  const phone = ease(b.f, b.ck(0, 4), 14, EASE.out);
  const hang = ease(b.f, b.ck(0, 6), 6);
  const dial = ease(b.f, b.ck(0, 7), 6);
  return (
    <>
      {away < 1 && <Envelope pos={[-away * 1.6, 1.15 + away * 0.6, -away]} close={1} seal={1} scale={0.85 * (1 - away * 0.5)} />}
      <Figure kind="man" pose={{ pos: [0.7 + (1 - peek) * 1.4, 0, -1.6], yaw: -0.6, lean: 0.25 * peek, tint: 0.6 }} />
      {phone > 0 && (
        <Phone pos={[0, 1.35 - (1 - phone) * 0.6, 0.3]} h={1.15} screen={dial > 0 ? "contacts" : hang > 0 ? "ended" : "incoming"} body="#159a8f" edge={TEAL} edgeGlow={dial} screenGlow={dial > 0 ? 0.75 : 1.1} />
      )}
    </>
  );
};

const FakePhoneBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const peel = ease(b.f, b.ck(1, 2), 18, EASE.inOut);
  const glitch = ease(b.f, b.ck(1, 3), 8);
  return (
    <Phone pos={[0, 1.4, 0]} rot={[0, 0.2, 0]} h={1.25} screen="call" under="gen" peel={peel} body="#15181f" edge={RED} edgeGlow={0.4 + glitch * 0.6} screenGlow={1.1}>
      <Waveform pos={[0, 0.8, 0.05]} f={b.f} seed={11} width={0.75} height={0.26} intensity={1.6} color={PINK} glitch={glitch} />
    </Phone>
  );
};

const CallBackBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const up = ease(b.f, b.ck(2, 0), 10, EASE.out);
  const call = ease(b.f, b.ck(2, 2), 40, EASE.inOut);
  return (
    <>
      <Figure kind="child" pose={{ pos: CHILD_TOWN, yaw: Math.PI * 0.85, armR: 1.4 * up, headPitch: 0.15 }} />
      <GroundRing pos={CHILD_TOWN} radius={0.75} k={up} />
      <Figure kind="man" pose={{ pos: MAN_TOWN, yaw: -Math.PI * 0.2 }} />
      {up > 0 && <Phone pos={[CHILD_TOWN[0] - 0.12, 0.85, CHILD_TOWN[2] - 0.18]} rot={[-0.4, Math.PI * 0.85, 0]} h={0.3 * up} screen={call > 0 ? "dial" : "contacts"} body="#159a8f" edge={TEAL} edgeGlow={1} screenGlow={1.3} />}
      <CallLine from={[CHILD_TOWN[0] - 0.12, 1.0, CHILD_TOWN[2] - 0.18]} to={HOME_PIN} f={b.f} grow={call} lift={3.2} color={TEAL} radius={0.07} />
      <Pin pos={[HOME_PIN[0], HOME_PIN[1] - 1.1, HOME_PIN[2]]} k={ease(b.f, b.ck(2, 2) + 34, 10, EASE.out)} f={b.f} color={PINK} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (inTown(b)) return <CallBackBeat b={b} />;
  if (b.f >= b.ln(1) - 4) return <FakePhoneBeat b={b} />;
  return <LeakBeat b={b} />;
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const out = (at: number, end: number) => Math.min(ease(b.f, at, 8, EASE.out), 1 - ease(b.f, end - 6, 6, EASE.in));
  if (inTown(b))
    return (
      <>
        <At shot={shot} p={[CHILD_TOWN[0], 1.4, CHILD_TOWN[2]]} k={out(b.ck(2, 0), b.ck(2, 3))} dy={60}>
          <Chip text="自分の携帯から" size={44} accent={COL.teal} />
        </At>
        <At shot={shot} p={[HOME_PIN[0], HOME_PIN[1] + 0.6, HOME_PIN[2]]} k={out(b.ck(2, 2) + 34, b.dur + 20)} dy={40}>
          <Chip text="登録してある ママの番号" size={40} accent={COL.pink} />
        </At>
        <Bubble shot={shot} at3={[CHILD_TOWN[0], 1.1, CHILD_TOWN[2]]} text="この人に迎えを頼んだ？" k={out(b.ck(2, 3), b.ck(2, 5))} tone="teal" dy={130} size={48} />
        <Layer x={SAFE_CX} y={1225} k={reveal(b.f, b.ck(2, 5))}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start" }}>
            <Chip text="声" size={50} accent={COL.teal} mark="ok" />
            {ease(b.f, b.ck(2, 7), 1) > 0 && <Chip text="迎えを頼んだ事実" size={50} accent={COL.teal} mark="ok" />}
          </div>
        </Layer>
      </>
    );
  if (b.f >= b.ln(1) - 4)
    return (
      <>
        <Layer x={SAFE_CX} y={1300} k={Math.min(reveal(b.f, b.ck(1, 0)), 1 - ease(b.f, b.ck(1, 3) - 6, 6))}>
          <Chip text="相手が差し出した電話" size={46} accent={COL.red} />
        </Layer>
        <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(1, 3))}>
          <Chip text="相手の電話で 確認しない" size={52} accent={COL.red} mark="ng" />
        </Layer>
      </>
    );
  return (
    <>
      <Layer x={SAFE_CX} y={640} k={out(b.ck(0, 2), b.ck(0, 4))}>
        <Chip text="合言葉が 知られることもある" size={44} accent={COL.red} />
      </Layer>
      <Layer x={SAFE_CX} y={640} k={out(b.ck(0, 5), b.ck(0, 7))}>
        <Chip text="答えが合っていても" size={46} accent={COL.cyan} mark="ok" />
      </Layer>
      <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(0, 7))}>
        <Headline text="② 自分から掛け直す" size={80} f={b.f} at={b.ck(0, 7)} tone="teal" />
      </Layer>
    </>
  );
};

export const P2: SceneDefP = {
  topic: "約束② 自分から掛け直す",
  shot,
  World,
  Overlay,
  light: (b) => (inTown(b) ? { ...TOWN_LIGHT, evening: 0.45, fog: [30, 70] } : LAB_LIGHT),
  bloom: (b) => (inTown(b) ? 0.45 : 0.45),
  dipIn: true,
  dipLines: [2],
};
