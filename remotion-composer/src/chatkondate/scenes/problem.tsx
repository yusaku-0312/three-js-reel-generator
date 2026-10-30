import React from "react";
import { interpolate } from "remotion";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, project2, Shot2 } from "../../golden2/shot";
import { Bubble, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { faceTo, Figure } from "../../kondate/three/figures";
import { DishCard } from "../three/parts";
import { dolly, HOOK_CAM, KID_AT, PARENT_AT } from "../../kondate/scenes/cams";
import { SceneDefP } from "../types";

// L0 the familiar scene at the fridge: 「なんでもいい」 (a shrug) → the parent offers 生姜焼き (a card floats up)
// → 「それは嫌」: the child turns away, the card gets a red ✕ and drops.
// L1 the parent's shoulders sink: 「なんでもいいって言ったじゃん…」, an irritation mark twitches on 「イラッと」.
const CARD_AT: V3 = [-0.1, 1.45, -1.0];

const shot = (b: Beat): Shot2 => breathe(dolly(HOOK_CAM, -0.06 + 0.08 * ease(b.f, 0, b.ln(1), EASE.inOut)), b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const shrugAt = b.ck(0, 0);
  const shrug = ease(b.f, shrugAt, 6, EASE.out) * (1 - ease(b.f, shrugAt + 18, 10, EASE.inOut));
  const offer = ease(b.f, b.ck(0, 2) - 2, 10, EASE.out);
  const no = ease(b.f, b.ck(0, 4), 6, EASE.out);
  const drop = ease(b.f, b.ck(0, 4) + 10, 16, EASE.in);
  const away = ease(b.f, b.ck(0, 4) - 2, 8, EASE.inOut) * (1 - ease(b.f, b.ln(1) + 30, 14, EASE.inOut));
  const slump = ease(b.f, b.ck(1, 0), 14, EASE.inOut) * (1 - ease(b.f, b.ck(1, 4), 10, EASE.inOut));
  const twitch = b.f >= b.ck(1, 2) && b.f < b.ck(1, 4) ? Math.max(0, Math.sin((b.f - b.ck(1, 2)) * 0.9)) : 0;
  return (
    <>
      <Figure
        kind="parent"
        pose={{ pos: PARENT_AT, yaw: faceTo(PARENT_AT, KID_AT), armR: 0.5 * offer * (1 - drop), slump, headPitch: slump * 0.25 - twitch * 0.05 }}
      />
      <Figure
        kind="kid"
        pose={{
          pos: KID_AT,
          yaw: faceTo(KID_AT, PARENT_AT) + away * 2.2,
          spread: shrug * 0.55,
          armL: shrug * 0.3 + away * 0.25,
          armR: shrug * 0.3 + away * 0.25,
          headRoll: -shrug * 0.25,
          headYaw: away * Math.sin(b.f * 0.9) * 0.25 * (1 - ease(b.f, b.ck(0, 4) + 14, 6)),
        }}
      />
      {drop < 1 && (
        <DishCard dish="shogayaki" pos={[CARD_AT[0], CARD_AT[1] - drop * 1.4, CARD_AT[2]]} k={offer} no={no} rot={[drop * 1.2, 0.1, drop * 0.6]} scale={1.7} />
      )}
    </>
  );
};

/** Comic irritation mark (four bent strokes), pulsing on each twitch. */
const Irritation: React.FC<{ s: number }> = ({ s }) => (
  <svg width={140} height={140} viewBox="-70 -70 140 140" style={{ transform: `scale(${s})`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}>
    {[0, 90, 180, 270].map((a) => (
      <path key={a} d="M 12 -44 Q 14 -14 44 -12" transform={`rotate(${a})`} fill="none" stroke="#0f1626" strokeWidth={22} strokeLinecap="round" />
    ))}
    {[0, 90, 180, 270].map((a) => (
      <path key={`r${a}`} d="M 12 -44 Q 14 -14 44 -12" transform={`rotate(${a})`} fill="none" stroke="#ff3b4a" strokeWidth={12} strokeLinecap="round" />
    ))}
  </svg>
);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const kidHead: V3 = [KID_AT[0], 1.05, KID_AT[2]];
  const parentHead: V3 = [PARENT_AT[0], 1.6, PARENT_AT[2]];
  const at = b.ck(1, 2);
  const twitch = b.f >= at ? interpolate((b.f - at) % 10, [0, 2, 10], [1.25, 0.9, 1]) : 0;
  const head = project2(shot, [PARENT_AT[0] - 0.3, 1.45, PARENT_AT[2]]);
  const markK = reveal(b.f, at, b.ck(1, 4));
  return (
    <>
      <Bubble shot={shot} at3={kidHead} text="なんでもいい" tone="grey" k={reveal(b.f, b.ck(0, 0) - 1, b.ck(0, 2) - 4)} dy={190} />
      <Bubble shot={shot} at3={parentHead} text="生姜焼きは？" k={reveal(b.f, b.ck(0, 2), b.ck(0, 4) + 6)} dx={250} dy={-20} />
      <Bubble shot={shot} at3={kidHead} text="それは嫌" tone="red" k={reveal(b.f, b.ck(0, 4), b.ln(1) - 2)} dy={150} dx={110} size={60} />
      <Bubble shot={shot} at3={parentHead} text={"なんでもいいって\n言ったじゃん…"} tone="grey" k={reveal(b.f, b.ck(1, 0), b.ck(1, 4) - 4)} dx={250} dy={-20} size={50} />
      {markK > 0 && (
        <div style={{ position: "absolute", left: head.x - 70, top: head.y - 70, opacity: markK }}>
          <Irritation s={twitch} />
        </div>
      )}
      <Layer x={SAFE_CX} y={620} k={reveal(b.f, b.ck(1, 4) - 4)}>
        <Headline text="そんなときに使える" size={84} f={b.f} at={b.ck(1, 4) - 4} />
      </Layer>
    </>
  );
};

export const PROBLEM: SceneDefP = {
  topic: "「なんでもいい」のあとで…",
  shot,
  World,
  Overlay,
  kitchen: () => ({ door: 0.32 }),
  dipIn: true,
};
