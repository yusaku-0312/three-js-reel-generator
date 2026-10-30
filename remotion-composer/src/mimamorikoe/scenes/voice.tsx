import React from "react";
import { Beat, lerp, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { faceTo } from "../../kyouhaku/three/figures";
import { Bubble, Chip, Layer, SAFE_CX } from "../overlays";
import { AI_CYAN, AICore, HACK_RED, Phone, WARM, Waveform } from "../three/props";
import { SceneDefP } from "../types";
import { CAM_AT, CHILD_AT, HERO_CAM, LENS, ROOM_CAM } from "./cams";
import { EVENING, Kid, ShelfCam } from "./cast";
import { VOICE_AT } from "./hook";
import { nod } from "./util";

// L0 「さらに、」 (dip) the mother's warm voice waveform at the top; 「AIでママの声を」 the AI core lights in the middle;
// 「まねされると」 a cyan copy of the same waveform forms below it. 「子どもには」 (dip) the room: a cyan waveform at
// the shelf camera, but the bubble is warm (it sounds like Mama); the child nods on 「話しかけているように」.
// L1 (dip) a family video post on the phone; 「動画の声が」 a warm waveform lifts off it; 「その材料に」 it flies into
// the AI core top right and a cyan copy forms under the core.
const inRoom = (b: Beat) => b.f >= b.ck(0, 3) - 4 && b.f < b.ln(1) - 4;
const inPost = (b: Beat) => b.f >= b.ln(1) - 4;

const MOM_WAVE: V3 = [0, 1.85, 0.9];
const CORE: V3 = [0, 1.3, 0.9];
const COPY_WAVE: V3 = [0, 0.75, 0.9];
const POST_PHONE: V3 = [-0.38, 1.2, 1.0];
const POST_CORE: V3 = [0.42, 1.95, 0.85];

const shot = (b: Beat): Shot2 => (inRoom(b) ? breathe(ROOM_CAM, b.f, 0.02) : breathe(HERO_CAM, b.f));

const Clone: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Waveform pos={MOM_WAVE} f={b.f} width={1.1} height={0.36} bars={22} seed={7} color={WARM} grow={ease(b.f, 0, 14, EASE.out)} intensity={1.3} />
    <AICore pos={CORE} f={b.f} size={0.22 * ease(b.f, b.ck(0, 1), 12, EASE.out)} power={1} />
    <Waveform pos={COPY_WAVE} f={b.f} width={1.1} height={0.36} bars={22} seed={7} color={AI_CYAN} grow={ease(b.f, b.ck(0, 2), 16, EASE.out)} intensity={1.3} glitch={0.25} />
  </>
);

const Room: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <ShelfCam f={b.f} led="blue" />
    <Kid pos={CHILD_AT} yaw={faceTo(CHILD_AT, CAM_AT)} headPitch={-0.25 + nod(b.f, b.ck(0, 5), 20, 0.4)} />
    <Waveform pos={VOICE_AT(LENS)} f={b.f} width={0.5} height={0.22} bars={16} color={AI_CYAN} grow={ease(b.f, b.ck(0, 3), 10, EASE.out)} intensity={1.3} yaw={0.3} />
  </>
);

const Post: React.FC<{ b: Beat }> = ({ b }) => {
  const lift = ease(b.f, b.ck(1, 1), 14, EASE.out);
  const fly = ease(b.f, b.ck(1, 2), 18, EASE.inOut);
  const start: V3 = [POST_PHONE[0] + 0.1, POST_PHONE[1] + 0.85, POST_PHONE[2] + 0.2];
  const wavePos = lerp3(start, POST_CORE, fly);
  return (
    <>
      <Phone pos={POST_PHONE} h={1.35} screen="videoPost" rot={[0, 0.15, 0]} glow={0.25} glowColor={WARM} k={ease(b.f, b.ln(1) - 4, 12, EASE.out)} />
      <Waveform pos={wavePos} f={b.f} width={lerp(0.7, 0.2, fly)} height={lerp(0.26, 0.08, fly)} bars={16} seed={7} color={WARM} grow={lift * (1 - ease(b.f, b.ck(1, 2) + 16, 4))} intensity={1.3} />
      <AICore pos={POST_CORE} f={b.f} size={0.2 * ease(b.f, b.ln(1), 12, EASE.out) * (1 + 0.25 * Math.sin(Math.PI * ease(b.f, b.ck(1, 2) + 14, 10)))} power={1} />
      <Waveform pos={[POST_CORE[0], POST_CORE[1] - 0.6, POST_CORE[2]]} f={b.f} width={0.62} height={0.24} bars={16} seed={7} color={AI_CYAN} grow={ease(b.f, b.ck(1, 2) + 16, 14, EASE.out)} intensity={1.3} glitch={0.25} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => (inPost(b) ? <Post b={b} /> : inRoom(b) ? <Room b={b} /> : <Clone b={b} />);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (inPost(b)) {
    return (
      <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(1, 2), 8, EASE.out)}>
        <Chip text="SNSの動画の声が材料に" size={46} accent={HACK_RED} />
      </Layer>
    );
  }
  if (inRoom(b)) {
    return (
      <>
        <Bubble shot={shot} at3={LENS} text="ママだよ" k={ease(b.f, b.ck(0, 4), 8, EASE.out)} tone="warm" dy={-40} dx={230} size={56} />
        <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(0, 6), 8, EASE.out)}>
          <Chip text="ママの声に聞こえる" size={46} accent={WARM} />
        </Layer>
      </>
    );
  }
  return (
    <>
      <Layer x={SAFE_CX} y={540} k={ease(b.f, 4, 8, EASE.out)}>
        <Chip text="ママの声" size={46} accent={WARM} />
      </Layer>
      <Layer x={SAFE_CX} y={1340} k={ease(b.f, b.ck(0, 2), 8, EASE.out)}>
        <Chip text="AIがまねした声" size={46} accent={AI_CYAN} />
      </Layer>
    </>
  );
};

export const VOICE: SceneDefP = {
  topic: "AIでママの声をまねされる",
  shot,
  World,
  Overlay,
  light: (b) => (inRoom(b) ? EVENING : { ...EVENING, lamp: 0.3, front: 0.35, fill: 0.3 }),
  grade: (b) => ({ glitch: inPost(b) ? 0 : 0.25 * ease(b.f, b.ck(0, 2), 3) * (1 - ease(b.f, b.ck(0, 2) + 4, 12)) }),
  bloom: () => 0.45,
  dipIn: true,
  dipChunks: [[0, 3]],
  dipLines: [1],
};
