import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Chip, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AI_CYAN, DishCard, Phone, PhotoCard } from "../three/parts";
import { MENU } from "../three/screens";
import { FRIDGE_CAM, HERO_CAM } from "../../kondate/scenes/cams";
import { Core, CORE_AT, FoodOrbit, PHONE_AT, PHONE_H } from "../../kondate/scenes/hero";
import { SceneDefP } from "../types";

// L0 from frame 0 the fridge door swings open and a phone comes up and takes the photo; on 「ChatGPTに送ると」
// (dip) the floating phone sends it into the AI, ingredients circle it, three menu cards fan out of it.
export const SNAP_PHONE: V3 = [-0.86, 1.01, 1.6];
export const FAN_AT: V3[] = [[-0.52, 1.74, 1.1], [0, 1.8, 1.16], [0.52, 1.74, 1.1]];
const heroFrom = (b: Beat) => b.ck(0, 1) - 4;
const shutterAt = 26;

const shot = (b: Beat): Shot2 => (b.f < heroFrom(b) ? breathe(FRIDGE_CAM, b.f, 0.02) : breathe(HERO_CAM, b.f));

const FridgePart: React.FC<{ b: Beat }> = ({ b }) => {
  const up = ease(b.f, 2, 14, EASE.out);
  const flash = ease(b.f, shutterAt, 2) * (1 - ease(b.f, shutterAt + 2, 8));
  return <Phone pos={[SNAP_PHONE[0], SNAP_PHONE[1] - (1 - up) * 0.2, SNAP_PHONE[2]]} rot={[-0.14, 0.04, 0]} h={0.5 * (0.5 + 0.5 * up)} screen="camera" flash={flash} />;
};

const HeroPart: React.FC<{ b: Beat }> = ({ b }) => {
  const sendAt = b.ck(0, 1) + 4;
  const fly = ease(b.f, sendAt, 16, EASE.inOut);
  const pull = ease(b.f, b.ck(0, 3) - 6, 12, EASE.in);
  const coreOut = ease(b.f, b.ck(0, 3) + 14, 12, EASE.inOut);
  const toMenus = ease(b.f, b.ck(0, 3), 10, EASE.inOut);
  const from: V3 = [PHONE_AT[0], PHONE_AT[1] + 0.1, PHONE_AT[2] + 0.1];
  const card = lerp3(from, CORE_AT, fly);
  const arc: V3 = [card[0] + Math.sin(fly * Math.PI) * 0.35, card[1], card[2] + Math.sin(fly * Math.PI) * 0.2];
  return (
    <>
      <Phone pos={PHONE_AT} h={PHONE_H} screen="photo" next="menus" mix={toMenus} glow={0.5 + fly * (1 - fly) * 2} />
      <Core f={b.f} k={ease(b.f, heroFrom(b), 10, EASE.out) * (1 - coreOut)} power={0.6 + fly * 0.6 + pull * 1.4} />
      {fly > 0 && fly < 1 && <PhotoCard pos={arc} k={1 - fly * 0.6} rot={[0, fly * 0.6, fly * 0.4]} scale={1.1} />}
      {pull < 1 && <FoodOrbit f={b.f} at={b.ck(0, 2)} n={6} step={3} pull={pull} />}
      {MENU.map((dish, i) => {
        const k = ease(b.f, b.ck(0, 3) + i * 7, 12, EASE.out);
        return <DishCard key={dish} dish={dish} pos={lerp3(CORE_AT, FAN_AT[i], k)} k={k} rot={[0, -FAN_AT[i][0] * 0.5, 0]} scale={1.15} />;
      })}
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => (b.f < heroFrom(b) ? <FridgePart b={b} /> : <HeroPart b={b} />);

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX + 230} y={600} k={reveal(b.f, b.ck(0, 1) + 2, b.ck(0, 3) - 4)}>
      <Chip text="ChatGPT" accent={AI_CYAN} size={50} />
    </Layer>
    <Layer x={SAFE_CX} y={1345} k={reveal(b.f, b.ck(0, 4) - 4)}>
      <Headline text="写真から 夕飯の候補" size={84} f={b.f} at={b.ck(0, 4) - 4} />
    </Layer>
  </>
);

export const INTRO: SceneDefP = {
  topic: "冷蔵庫の写真で夕飯の候補",
  shot,
  World,
  Overlay,
  kitchen: (b) => ({ door: b.f < heroFrom(b) ? 0.25 + 0.75 * ease(b.f, 0, 16, EASE.out) : 0 }),
  shutter: (b) => ease(b.f, shutterAt, 2) * (1 - ease(b.f, shutterAt + 2, 10, EASE.out)) * 0.7,
  bloom: (b) => (b.f < heroFrom(b) ? 0.4 : 0.45),
  dipFrames: (b) => [heroFrom(b)],
};
