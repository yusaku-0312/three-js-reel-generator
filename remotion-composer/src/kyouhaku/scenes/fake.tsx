import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, project2, Shot2 } from "../../golden2/shot";
import { Bubble, Chip, Layer, Stamp } from "../overlays";
import { AICore, PhotoCard } from "../three/props";
import { SceneDefP } from "../types";
import { dolly, HERO_CAM, HOOK_CAM } from "./cams";
import { phoneNight, TeenOnBed } from "./cast";
import { shake, span } from "./util";

// L0 back in the room: the child stares at the phone and shakes their head 「撮ってない…」.
// L1 (dip) floating explainer: the ordinary park photo from SNS → into the AI → out comes the hidden fake
// (mosaic, cyan noise edge), stamped 「AIで作った偽画像」.
const isHero = (b: Beat) => b.f >= b.ln(1) - 4;
const ROOM = dolly(HOOK_CAM, 0.22);
const PHOTO_AT: V3 = [-0.52, 1.5, 0.9];
const CORE_AT: V3 = [0, 1.2, 0.9];
const FAKE_AT: V3 = [0.52, 1.0, 0.9];

const shot = (b: Beat): Shot2 => (isHero(b) ? breathe(HERO_CAM, b.f) : breathe(ROOM, b.f, 0.02));

const flyAt = (b: Beat) => b.ck(1, 2);
const outAt = (b: Beat) => b.ck(1, 3);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (!isHero(b)) {
    return <TeenOnBed f={b.f} screen="dmThreat" phoneGlow={0.4} lower={0.3} pose={{ headYaw: shake(b.f, b.ck(0, 2)), headPitch: 0.3 }} />;
  }
  const show = ease(b.f, b.ck(1, 0) - 2, 10, EASE.out);
  const fly = ease(b.f, flyAt(b), 14, EASE.inOut);
  const out = ease(b.f, outAt(b), 12, EASE.out);
  const power = 0.4 + ease(b.f, flyAt(b) + 8, 6) * (1 - ease(b.f, outAt(b) + 10, 20)) * 1.4;
  const photoPos = lerp3(PHOTO_AT, CORE_AT, fly);
  const fakePos = lerp3(CORE_AT, FAKE_AT, out);
  const glitch = out > 0 ? 1 - 0.6 * ease(b.f, outAt(b) + 14, 20) : 0;
  return (
    <>
      <PhotoCard pos={photoPos} k={show * (1 - fly * 0.85)} kind="ordinary" rot={[0, 0.25 - fly * 0.25, -0.06]} scale={1.15 * (1 - fly * 0.6)} />
      <AICore pos={CORE_AT} f={b.f} size={0.24 * ease(b.f, b.ck(1, 1), 10, EASE.out) + (power - 0.4) * 0.04} power={power} />
      <PhotoCard pos={fakePos} k={out} kind="hidden" rot={[0, -0.25 * out, 0.05]} scale={1.15} glitch={glitch} f={b.f} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (!isHero(b)) {
    return <Bubble shot={shot} at3={[0.45, 1.2, -2.27]} text="撮ってない…" k={span(b.f, b.ck(0, 2) - 2)} tone="grey" dy={150} dx={60} />;
  }
  const photo = project2(shot, [PHOTO_AT[0], PHOTO_AT[1] + 0.42, PHOTO_AT[2]]);
  const core = project2(shot, [CORE_AT[0], CORE_AT[1] - 0.3, CORE_AT[2]]);
  return (
    <>
      <Layer x={Math.max(photo.x, 330)} y={photo.y - 20} k={span(b.f, b.ck(1, 0), flyAt(b) + 2)}>
        <Chip text="SNSの普通の写真" size={44} accent="#ffffff" />
      </Layer>
      <Layer x={core.x} y={core.y + 10} k={span(b.f, b.ck(1, 2), b.ck(1, 4) - 4)}>
        <Chip text="AI" size={44} accent="#5ff0ff" />
      </Layer>
      <Layer x={700} y={1240} k={b.f >= b.ck(1, 4) ? 1 : 0} rise={0}>
        <Stamp f={b.f} at={b.ck(1, 4)} text="偽画像" size={300} />
      </Layer>
    </>
  );
};

export const FAKE: SceneDefP = {
  topic: "AIで加工された偽画像",
  shot,
  World,
  Overlay,
  light: (b) => (isHero(b) ? { ...phoneNight(0, 0), front: 0.5, fill: 0.4 } : phoneNight(0.8, 0.5)),
  grade: (b) => ({ glitch: isHero(b) ? 0.5 * ease(b.f, outAt(b), 3) * (1 - ease(b.f, outAt(b) + 6, 14)) : 0 }),
  dipIn: true,
  dipLines: [1],
};
