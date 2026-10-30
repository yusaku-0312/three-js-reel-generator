import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Chip, COL, Layer, reveal, SAFE_CX, StepPill } from "../overlays";
import { Cross, Dome, Envelope, PhotoCard, Phone, QuestionCard, ringPositions, Sparkles, TEAL, Watcher } from "../three/props";
import { ScreenKind } from "../three/textures";
import { LAB_LIGHT } from "../../aimukae/three/stage";
import { SceneDefP } from "../types";
import { labCam, span } from "./cams";

// L0 the lab, warmer: the new-post screen with the park photo above it; 「投稿しないことが」 the photo leaves the
// phone into an envelope that closes and seals (kept at home), a red ✕ on the 投稿する button.
// L1 公開範囲 = 友だちのみ: a teal dome over the phone and four friend pawns; 「保存や転載で」 copies slip out
// through the dome to red pawns outside.
// L2 the past posts list, 公開中; 「必要があるか」 a ? beside it; 「見直してみてください」 they turn 非公開 one by one.
const inPrivacy = (b: Beat) => b.f >= b.ln(1) - 4 && b.f < b.ln(2) - 4;
const inReview = (b: Beat) => b.f >= b.ln(2) - 4;

const PHONE: V3 = [0.38, 1.3, 0.3];
const PHOTO_FROM: V3 = [-0.55, 1.95, 0.35];
const ENVELOPE: V3 = [-0.55, 0.62, 0.35];
const FRIENDS = ringPositions([0, 0, 0], 0.72, 4, 2);
const OUTSIDE: V3[] = [[1.65, 0, 0.6], [-1.6, 0, 0.9]];

const shot = (b: Beat): Shot2 => {
  if (inReview(b)) return breathe(keys2(b.f, [[0, labCam(0, 0.6)], [b.ln(2), labCam(0, 0.6), 1], [b.ck(2, 4), labCam(0, -0.4), 70]]), b.f);
  if (inPrivacy(b)) return breathe(labCam(0, 2.6), b.f);
  return breathe(keys2(b.f, [[0, labCam(0, 0.6)], [b.ck(0, 4), labCam(-0.1, 0.1), 60]]), b.f);
};

const PostBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const keep = ease(b.f, b.ck(0, 5), 18, EASE.inOut);
  const close = ease(b.f, b.ck(0, 5) + 14, 10, EASE.inOut);
  const seal = ease(b.f, b.ck(0, 6), 8, EASE.out);
  return (
    <>
      <Phone pos={PHONE} h={1.35} screen="compose" glow={0.25} f={b.f} />
      <Cross pos={[PHONE[0], PHONE[1] - 0.44, PHONE[2] + 0.12]} k={ease(b.f, b.ck(0, 5) + 4, 8, EASE.out)} size={0.36} />
      <Envelope pos={ENVELOPE} close={close} seal={seal} scale={0.55} />
      {close < 0.9 && <PhotoCard pos={lerp3(PHOTO_FROM, [ENVELOPE[0], ENVELOPE[1] + 0.12, ENVELOPE[2] - 0.02], keep)} kind="park" scale={1.3 - keep * 0.7} k={ease(b.f, 0, 8, EASE.out)} />}
      <Sparkles center={[ENVELOPE[0], ENVELOPE[1] + 0.2, ENVELOPE[2]]} f={b.f - b.ck(0, 6)} mode="burst" count={10} radius={0.5} size={0.08} color={TEAL} seed={4} intensity={b.f >= b.ck(0, 6) ? 2 : 0} />
    </>
  );
};

const PrivacyBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const leak = (i: number) => ease(b.f, b.ck(1, 2) + i * 8, 22, EASE.inOut);
  const red = ease(b.f, b.ck(1, 2) - 4, 10, EASE.out);
  return (
    <>
      <Phone pos={[0, 1.55, 0]} h={1.15} screen="privacy" glow={0.35} f={b.f} />
      <Dome pos={[0, 0, 0]} k={ease(b.f, b.ln(1), 14, EASE.out)} radius={1.15} f={b.f} />
      {FRIENDS.map((p, i) => (
        <Watcher key={i} pos={p} k={ease(b.f, b.ln(1) + i * 3, 10, EASE.out)} s={2} color={TEAL} yaw={Math.atan2(-p[0], -p[2])} />
      ))}
      {OUTSIDE.map((p, i) => {
        const t = leak(i);
        const from: V3 = [FRIENDS[i][0], 0.9, FRIENDS[i][2]];
        const at = lerp3(from, [p[0], 1.0, p[2]], t);
        return (
          <React.Fragment key={i}>
            <Watcher pos={p} k={red} s={2} color="#c8303c" yaw={Math.atan2(-p[0], -p[2])} />
            {t > 0 && <PhotoCard pos={[at[0], at[1] + Math.sin(t * Math.PI) * 0.5, at[2]]} kind="park" scale={0.7} k={1} edge="#ff9aa4" edgeGlow={t} />}
          </React.Fragment>
        );
      })}
    </>
  );
};

const ReviewBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const steps: Array<[number, ScreenKind]> = [
    [b.ck(2, 6), "review1"],
    [b.ck(2, 6) + 10, "review2"],
    [b.ck(2, 6) + 20, "review3"],
  ];
  const done = steps.filter(([at]) => b.f >= at);
  const screen = done.length ? done[done.length - 1][1] : "review0";
  return (
    <>
      <Phone pos={[0, 1.25, 0.3]} h={1.8} screen={screen} glow={0.3 + done.length * 0.1} glowColor={TEAL} f={b.f} />
      <QuestionCard pos={[0.82, 1.9, 0.4]} k={span(b.f, b.ck(2, 3), b.ck(2, 6))} f={b.f} />
      <Sparkles center={[0, 1.3, 0.5]} f={b.f - (b.ck(2, 6) + 20)} mode="burst" count={14} radius={0.8} size={0.08} color={TEAL} seed={6} intensity={b.f >= b.ck(2, 6) + 20 ? 2 : 0} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (inReview(b)) return <ReviewBeat b={b} />;
  if (inPrivacy(b)) return <PrivacyBeat b={b} />;
  return <PostBeat b={b} />;
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => {
  if (inReview(b))
    return (
      <Layer x={SAFE_CX} y={545} k={reveal(b.f, b.ln(2))}>
        <StepPill n={3} text="載せた投稿も見直す" size={50} />
      </Layer>
    );
  if (inPrivacy(b))
    return (
      <>
        <Layer x={SAFE_CX} y={545} k={reveal(b.f, b.ln(1))}>
          <StepPill n={2} text="公開範囲を絞っても" size={50} />
        </Layer>
        <Layer x={SAFE_CX} y={1350} k={reveal(b.f, b.ck(1, 2))}>
          <Chip text="保存・転載で外へ" size={50} accent={COL.red} mark="ng" />
        </Layer>
      </>
    );
  return (
    <>
      <Layer x={SAFE_CX} y={545} k={reveal(b.f, b.ck(0, 0))}>
        <StepPill n={1} text="投稿しない" size={54} />
      </Layer>
      <Layer x={SAFE_CX} y={1350} k={reveal(b.f, b.ck(0, 6))}>
        <Chip text="いちばん確実" size={52} accent={COL.teal} mark="ok" />
      </Layer>
    </>
  );
};

export const ADVICE: SceneDefP = {
  topic: "子どもの写真を守るには",
  shot,
  World,
  Overlay,
  light: () => ({ ...LAB_LIGHT, key: 3.0, front: 0.55 }),
  dipIn: true,
  dipLines: [1, 2],
};
