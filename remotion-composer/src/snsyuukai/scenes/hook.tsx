import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Chip, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AICore, CYAN, FakeChild, PhotoCard, Phone, PINK, ringPositions, Sparkles, Watcher, Waveform } from "../three/props";
import { LAB_LIGHT } from "../../aimukae/three/stage";
import { SceneDefP } from "../types";
import { labCam, span } from "./cams";

// L0 the lab: the parent's phone with the SNS profile (a grid of the child's photos), memory cards floating
// round it; 「家族のお出かけを」 the park photo pops out; 「SNSに」 the phone shows the post, public.
// L1 a ring of pawns (anyone can see it); 「知らない人にも」 three turn red; 「保存される」 copies fly to them.
// L2 the saved photo: the face framed in cyan, a voice clip beside it; both drawn up into the AI crystal, and
// a see-through cyan copy of the child steps out 「なりすますために」.
const PHONE: V3 = [0, 1.3, 0.3];
const RING_C: V3 = [0, 0, -0.2];
const PAWNS = ringPositions(RING_C, 1.25, 9, 5);
const RED_PAWNS = [1, 4, 7];
const CARD_BIG: V3 = [-0.42, 1.5, 0.4];
const VOICE: V3 = [0.62, 0.75, 0.5];
const CORE: V3 = [0, 2.25, 0];
const FAKE_AT: V3 = [0.05, 0, 0.6];

const isRing = (b: Beat) => b.f >= b.ln(1) - 4 && b.f < b.ln(2) - 4;
const isCopy = (b: Beat) => b.f >= b.ln(2) - 4;

const shot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, labCam(0, 0.8)],
      [b.ln(1) - 20, labCam(0, 0), 20],
      [b.ln(1) - 2, labCam(0, 1.6), 24],
      [b.ln(2) - 4, labCam(0, 0.6), 1],
      [b.ck(2, 4), labCam(0, 0.9), 40],
    ]),
    b.f,
  );

const PostBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const out = ease(b.f, b.ck(0, 1), 16, EASE.out);
  const toPost = ease(b.f, b.ck(0, 2), 10, EASE.inOut);
  return (
    <>
      <Phone pos={PHONE} h={1.5} screen="profile" next="post" mix={toPost} glow={0.3} f={b.f} />
      <PhotoCard pos={[-0.88, 2.0 + Math.sin(b.f / 20) * 0.03, -0.3]} rot={[0, 0.25, 0.08]} kind="birthday" scale={1.15} k={ease(b.f, 0, 10, EASE.out)} />
      <PhotoCard pos={[0.9, 1.85 + Math.sin(b.f / 22 + 1) * 0.03, -0.35]} rot={[0, -0.25, -0.06]} kind="ceremony" scale={1.15} k={ease(b.f, 4, 10, EASE.out)} />
      <PhotoCard pos={lerp3(PHONE, [-0.85, 0.75, 0.5], out)} rot={[0, 0.2 * out, -0.05 * out]} kind="park" scale={0.4 + 0.8 * out} k={out} />
    </>
  );
};

const RingBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const red = ease(b.f, b.ck(1, 2), 10, EASE.out);
  return (
    <>
      <Phone pos={[0, 1.55, 0.2]} h={1.15} screen="post" glow={0.4} f={b.f} />
      {PAWNS.map((p, i) => {
        const isRed = RED_PAWNS.includes(i);
        const k = ease(b.f, b.ln(1) + i * 2, 10, EASE.out);
        return <Watcher key={i} pos={p} k={k} s={2.2} color={isRed && red > 0.5 ? "#c8303c" : "#9aa3b5"} yaw={Math.atan2(-p[0], -p[2])} />;
      })}
      {RED_PAWNS.map((pi, j) => {
        const t = ease(b.f, b.ck(1, 3) + j * 5, 16, EASE.inOut);
        if (t <= 0) return null;
        const to: V3 = [PAWNS[pi][0], 1.05, PAWNS[pi][2]];
        const p = lerp3([0, 1.55, 0.3], to, t);
        return <PhotoCard key={pi} pos={[p[0], p[1] + Math.sin(t * Math.PI) * 0.45, p[2]]} kind="park" scale={0.75} k={1} edge="#ff9aa4" edgeGlow={t} />;
      })}
    </>
  );
};

const CopyBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const suck = ease(b.f, b.ck(2, 2), 22, EASE.inOut);
  const core = ease(b.f, b.ck(2, 2) - 6, 12, EASE.out);
  const fake = ease(b.f, b.ck(2, 4), 18, EASE.out);
  const card = lerp3(CARD_BIG, CORE, suck);
  const voice = lerp3(VOICE, CORE, suck);
  return (
    <>
      {suck < 1 && (
        <PhotoCard pos={card} kind="park" scale={2.3 * (1 - suck * 0.88)} k={ease(b.f, 0, 8, EASE.out)} face={ease(b.f, b.ck(2, 0), 8, EASE.out)} glitch={suck * 0.8} f={b.f} />
      )}
      {suck < 1 && (
        <Waveform pos={voice} f={b.f} seed={7} width={0.9 * (1 - suck * 0.8)} height={0.38 * (1 - suck * 0.6)} grow={ease(b.f, b.ck(2, 1), 14, EASE.out)} intensity={1.5} color={PINK} />
      )}
      {core > 0 && <AICore pos={CORE} f={b.f} size={0.3 * core} power={0.5 + suck * 0.6 + fake * 0.4} />}
      <FakeChild pos={FAKE_AT} k={fake} f={b.f} scale={1.25} />
      <Sparkles center={[FAKE_AT[0], 0.7, FAKE_AT[2]]} f={b.f - b.ck(2, 4)} mode="burst" count={14} radius={0.7} size={0.1} color={CYAN} seed={9} intensity={b.f >= b.ck(2, 4) ? 2 : 0} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (isCopy(b)) return <CopyBeat b={b} />;
  if (isRing(b)) return <RingBeat b={b} />;
  return <PostBeat b={b} />;
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (isCopy(b)) {
    const suck = b.ck(2, 2);
    return (
      <>
        <At shot={shot} p={[CARD_BIG[0], CARD_BIG[1] - 0.78, CARD_BIG[2]]} k={span(b.f, b.ck(2, 0), suck)} dy={0}>
          <Chip text="顔" size={46} accent={COL.cyan} />
        </At>
        <At shot={shot} p={[VOICE[0], VOICE[1] - 0.2, VOICE[2]]} k={span(b.f, b.ck(2, 1), suck)}>
          <Chip text="声" size={46} accent={COL.pink} />
        </At>
        <Layer x={SAFE_CX} y={560} k={reveal(b.f, suck)}>
          <Headline text="AIでまねされる" size={80} f={b.f} at={suck} tone="red" />
        </Layer>
        <At shot={shot} p={[FAKE_AT[0] + 0.95, 0.9, FAKE_AT[2]]} k={reveal(b.f, b.ck(2, 4) + 6)}>
          <Chip text="にせもの" size={46} accent={COL.cyan} mark="ng" />
        </At>
      </>
    );
  }
  if (isRing(b))
    return (
      <>
        <Layer x={SAFE_CX} y={545} k={span(b.f, b.ln(1), b.ck(1, 3))}>
          <Chip text="誰でも見られる" size={50} accent={COL.white} />
        </Layer>
        <Layer x={SAFE_CX} y={545} k={reveal(b.f, b.ck(1, 3))}>
          <Chip text="知らない人が保存" size={50} accent={COL.red} mark="ng" />
        </Layer>
      </>
    );
  return (
    <Layer x={SAFE_CX} y={1345} k={span(b.f, b.ck(0, 2), b.ln(1) - 4)}>
      <Chip text="SNSに投稿" size={50} accent={COL.white} />
    </Layer>
  );
};

export const HOOK: SceneDefP = {
  topic: "子どもの写真、誰が見てる？",
  shot,
  World,
  Overlay,
  light: () => LAB_LIGHT,
  bloom: (b) => (isCopy(b) ? 0.5 : 0.35),
  grade: (b) => ({ glitch: isCopy(b) ? ease(b.f, b.ck(2, 4), 3) * (1 - ease(b.f, b.ck(2, 4) + 4, 12)) * 0.6 : 0 }),
};
