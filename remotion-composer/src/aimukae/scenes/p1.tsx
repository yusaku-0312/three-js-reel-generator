import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Bubble, Chip, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Figure } from "../three/figures";
import { PINK, Sparkles, TEAL, Waveform } from "../three/fx";
import { Envelope, HouseLock, Phone, PromiseCard, Shield, SplitKey, WordCard } from "../three/props";
import { LAB_LIGHT } from "../three/stage";
import { SceneDefP } from "../types";
import { labCam } from "./cams";

// Promise 1, in the lab. L0 card ①; a key split between mom and child joins into one. L1 voice + "what only
// the family knows" (a house-shaped lock) merge into a shield. L2 the child's phone: 「ママだよ」 →
// 「合言葉は？」, the child keeps the answer to herself, the caller must say it. L3 名前・誕生日 crumble; the
// secret word goes into a sealed envelope.
const shot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, labCam(0, 0.6)],
      [0, labCam(), 90],
      [b.ln(2) - 6, labCam(-0.4), 50],
      [b.ln(3) - 6, labCam(), 50],
    ]),
    b.f,
  );

const KeyBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const split = ease(b.f, b.ck(0, 1), 14, EASE.out);
  const join = ease(b.f, b.ck(0, 2), 18, EASE.inOut);
  const lift = ease(b.f, 0, 14, EASE.out);
  return (
    <>
      <PromiseCard pos={[0, 2.25, -0.3]} n={1} lines={["合言葉"]} scale={0.7} k={lift} lit={1} />
      <Figure kind="mom" pose={{ pos: [-0.85, 0, 0.3], yaw: 0.45, armR: split * 0.9 * (1 - join) }} />
      <Figure kind="child" pose={{ pos: [0.8, 0, 0.5], yaw: -0.45, armL: split * 0.9 * (1 - join), hop: ease(b.f, b.ck(0, 2) + 14, 10) * (1 - ease(b.f, b.ck(0, 2) + 24, 10)) }} />
      {split > 0 && (
        <group position={[0, 1.4 - (1 - join) * 0.1, 0.6]}>
          <SplitKey pos={[0, 0, 0]} join={join} apart={1.6 * split} f={b.f} scale={0.55} />
        </group>
      )}
      <Sparkles center={[0, 1.4, 0.6]} f={b.f - b.ck(0, 2) - 14} mode="burst" count={14} radius={0.6} size={0.09} color="#ffd36a" seed={3} intensity={2} />
    </>
  );
};

const ShieldBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const wave = ease(b.f, b.ck(1, 1) - 4, 12, EASE.out);
  const lock = ease(b.f, b.ck(1, 2), 14, EASE.out);
  const lit = ease(b.f, b.ck(1, 4), 12);
  const merge = ease(b.f, b.ck(1, 5), 20, EASE.inOut);
  const sx = 0.85 * (1 - merge);
  return (
    <>
      {merge < 1 && <Waveform pos={[-sx, 1.25, 0]} f={b.f} seed={11} width={1.0 * (1 - merge * 0.6)} height={0.4} grow={wave} color={PINK} intensity={1.5} />}
      {lock > 0 && merge < 1 && <HouseLock pos={[sx, 1.3, 0]} lit={lit} scale={0.8 * lock * (1 - merge * 0.5)} f={b.f} />}
      <Shield pos={[0, 1.45, 0.2]} k={ease(b.f, b.ck(1, 5) + 12, 14, EASE.out)} scale={0.95} />
    </>
  );
};

const PHONE: V3 = [0.3, 1.45, 0];

const PhoneBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const up = ease(b.f, b.ln(2) - 2, 14, EASE.out);
  const talk = ease(b.f, b.ck(2, 1), 8) * (1 - ease(b.f, b.ck(2, 3), 8));
  return (
    <>
      <Figure kind="child" pose={{ pos: [-0.85, 0, 0.6], yaw: 0.5, armR: 1.2 * up, headPitch: -0.1 }} />
      <Phone pos={[PHONE[0], PHONE[1] - (1 - up) * 0.4, PHONE[2]]} rot={[0, -0.25, 0]} h={1.15} screen="incoming" body="#159a8f" screenGlow={1.1} edge={TEAL} edgeGlow={0.5}>
        <Waveform pos={[0, 0.66, 0.05]} f={b.f} seed={11} width={0.7} height={0.22} grow={talk} intensity={1.5} color={PINK} />
      </Phone>
    </>
  );
};

const SecretBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const words = ease(b.f, b.ck(3, 0) - 4, 10, EASE.out);
  const gone = ease(b.f, b.ck(3, 2), 16, EASE.in);
  const env = ease(b.f, b.ck(3, 3) - 6, 12, EASE.out);
  const slide = ease(b.f, b.ck(3, 4), 16, EASE.inOut);
  const close = ease(b.f, b.ck(3, 4) + 14, 12, EASE.inOut);
  const seal = ease(b.f, b.ck(3, 5), 8, EASE.out);
  return (
    <>
      <WordCard pos={[-0.6, 2.15, 0]} text="名前" w={1.0} k={words} gone={gone} rot={[0, 0.2, -0.08]} />
      <WordCard pos={[0.6, 1.75, 0]} text="誕生日" w={1.0} k={words} gone={ease(b.f, b.ck(3, 2) + 4, 16, EASE.in)} rot={[0, -0.2, 0.08]} />
      {env > 0 && (
        <>
          <Envelope pos={[0, 1.0, 0]} close={close} seal={seal} scale={0.85 * env} />
          {slide < 1 && <WordCard pos={[0, 1.75 - slide * 0.75, 0.04 - slide * 0.06]} text="？？？" w={0.9} k={env} bg="#fff3c4" ink="#7a5200" />}
        </>
      )}
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (b.f >= b.ln(3) - 4) return <SecretBeat b={b} />;
  if (b.f >= b.ln(2) - 4) return <PhoneBeat b={b} />;
  if (b.f >= b.ln(1) - 4) return <ShieldBeat b={b} />;
  return <KeyBeat b={b} />;
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const out = (at: number, end: number) => Math.min(ease(b.f, at, 8, EASE.out), 1 - ease(b.f, end - 6, 6, EASE.in));
  if (b.f >= b.ln(3) - 4)
    return (
      <>
        <Layer x={SAFE_CX} y={600} k={out(b.ck(3, 1), b.ck(3, 3))}>
          <Chip text="人に知られやすい" size={46} accent={COL.red} mark="ng" />
        </Layer>
        <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(3, 3))}>
          <Headline text="家族以外に教えない言葉" size={72} f={b.f} at={b.ck(3, 3)} tone="teal" />
        </Layer>
      </>
    );
  if (b.f >= b.ln(2) - 4)
    return (
      <>
        <Bubble shot={shot} at3={[PHONE[0], PHONE[1] + 0.6, 0]} text="ママだよ" k={out(b.ck(2, 1), b.ck(2, 3))} tone="pink" dy={120} />
        <Bubble shot={shot} at3={[-0.85, 1.05, 0.6]} text="合言葉は？" k={out(b.ck(2, 3), b.ck(2, 5))} tone="teal" dy={150} size={58} />
        <Layer x={SAFE_CX} y={1290} k={out(b.ck(2, 5), b.ck(2, 7))}>
          <Chip text="自分から 答えは言わない" size={48} accent={COL.red} mark="ng" />
        </Layer>
        <Bubble shot={shot} at3={[PHONE[0], PHONE[1] + 0.6, 0]} text="？？？" k={out(b.ck(2, 7), b.dur + 20)} tone="white" dy={120} />
        <Layer x={SAFE_CX} y={1290} k={reveal(b.f, b.ck(2, 7))}>
          <Chip text="答えは相手に言ってもらう" size={46} accent={COL.teal} mark="ok" />
        </Layer>
      </>
    );
  if (b.f >= b.ln(1) - 4)
    return (
      <>
        <At shot={shot} p={[-0.85, 1.95, 0]} k={out(b.ck(1, 1), b.ck(1, 5))}>
          <Chip text="声" size={46} accent={COL.pink} />
        </At>
        <At shot={shot} p={[0, 1.4, 0]} k={out(b.ck(1, 2), b.ck(1, 5))}>
          <div style={{ fontSize: 90, fontWeight: 900, color: "#fff", textShadow: "0 4px 12px rgba(0,0,0,0.8)" }}>＋</div>
        </At>
        <At shot={shot} p={[0.85, 1.95, 0]} k={out(b.ck(1, 2), b.ck(1, 5))}>
          <Chip text="家族だけの答え" size={42} accent={COL.teal} />
        </At>
        <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(1, 6))}>
          <Headline text="本人か確かめる" size={84} f={b.f} at={b.ck(1, 6)} tone="teal" />
        </Layer>
      </>
    );
  return (
    <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(0, 2))}>
      <Headline text="① 親子だけの合言葉" size={78} f={b.f} at={b.ck(0, 2)} tone="teal" />
    </Layer>
  );
};

export const P1: SceneDefP = {
  topic: "約束① 合言葉",
  shot,
  World,
  Overlay,
  light: () => LAB_LIGHT,
  bloom: () => 0.45,
  dipIn: true,
};
