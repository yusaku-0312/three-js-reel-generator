import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { At, Bubble, Layer, Mark, reveal, SAFE_CX, StepPill, TimeBar } from "../overlays";
import { faceTo, Figure } from "../../kondate/three/figures";
import { AICore, DishCard, Phone } from "../three/parts";
import { MENU } from "../three/screens";
import { dolly, PARENT_AT, T_KID, T_PARENT } from "../../kondate/scenes/cams";
import { SceneDefP } from "../types";
import { CARD_YAW, handAt, TABLE_CARDS, tableShot } from "./choose";

// L0 at the table the parent checks the three menus alone (✓ on each: I can make this), then the child comes
// over and they choose together (the child points at オムライス).
// L1 (dip) the parent at the fridge with 「何を作ろう…」; on 「ChatGPTに」 the phone lights and the AI appears
// beside them, the bar of "thinking time" shrinks and turns teal, the parent straightens up.
const KID_FROM: V3 = [2.3, 0, -0.2];
const AI_AT: V3 = [PARENT_AT[0] - 0.55, 1.4, PARENT_AT[2] + 0.25];
// The parent alone at the fridge, centred and close (head ≈ y 580, feet behind the subtitles).
const FRIDGE_PARENT_CAM: Shot2 = { pos: [PARENT_AT[0] + 0.4, 2.5, PARENT_AT[2] + 6.4], target: [PARENT_AT[0], 0.95, PARENT_AT[2]], fov: 30, focus: [PARENT_AT[0], 1.2, PARENT_AT[2]], aperture: 2 };
const isTable = (b: Beat) => b.f < b.ln(1) - 4;

const shot = (b: Beat): Shot2 =>
  isTable(b) ? tableShot(b) : breathe(dolly(FRIDGE_PARENT_CAM, 0.06 * ease(b.f, b.ln(1), b.dur - b.ln(1), EASE.inOut)), b.f, 0.02);

const TablePart: React.FC<{ b: Beat }> = ({ b }) => {
  const walk = ease(b.f, b.ck(0, 2) - 8, 26, EASE.inOut);
  const kidPos = lerp3(KID_FROM, T_KID, walk);
  const stepT = walk > 0 && walk < 1 ? (b.f % 10) / 10 : 0;
  const point = ease(b.f, b.ck(0, 3) - 2, 10, EASE.out);
  const yawP = faceTo(T_PARENT, T_KID);
  const together = ease(b.f, b.ck(0, 2), 12, EASE.inOut);
  return (
    <>
      <Figure kind="parent" pose={{ pos: T_PARENT, yaw: yawP - 0.5 * (1 - together), armR: 1.1, armL: 0.6 * (1 - together), headPitch: 0.35 * (1 - together) + 0.1 }} />
      <Phone pos={handAt()} rot={[-0.3, yawP, 0]} h={0.26} screen="menus" />
      {walk > 0 && <Figure kind="kid" pose={{ pos: kidPos, yaw: walk < 1 ? -Math.PI / 2 + 0.3 : faceTo(T_KID, TABLE_CARDS[1]), hop: stepT, armR: point * 1.9, lean: point * 0.12 }} />}
      {MENU.map((dish, i) => {
        const k = ease(b.f, b.ck(0, 0) + i * 5, 12, EASE.out);
        const pos = lerp3(handAt(), TABLE_CARDS[i], k);
        return (
          <DishCard key={dish} dish={dish} pos={[pos[0], pos[1] + Math.sin(b.f / 20 + i) * 0.015, pos[2]]} k={k} rot={[0, CARD_YAW, 0]} scale={0.95} pick={i === 1 ? point : 0} safe={i === 1 ? 0 : ease(b.f, b.ck(0, 1) + i * 5, 8) * 0.6} />
        );
      })}
    </>
  );
};

const FridgePart: React.FC<{ b: Beat }> = ({ b }) => {
  const help = ease(b.f, b.ck(1, 3) - 2, 12, EASE.out);
  const relief = ease(b.f, b.ck(1, 4), 14, EASE.inOut);
  const hand: V3 = [PARENT_AT[0] + 0.2, 1.0 + relief * 0.12, PARENT_AT[2] + 0.35];
  return (
    <>
      <Figure kind="parent" pose={{ pos: PARENT_AT, yaw: 0.1, slump: 1 - relief, headPitch: 0.25 * (1 - relief) + 0.15 * help * (1 - relief), headRoll: 0.15 * (1 - help), armR: 0.9 * help }} />
      {help > 0 && <Phone pos={hand} rot={[-0.4, 0.25, 0]} h={0.26} screen="menus" glow={help} />}
      {help > 0 && <AICore pos={AI_AT} f={b.f} size={0.16 * help} power={0.5 + help * 0.6} />}
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => (isTable(b) ? <TablePart b={b} /> : <FridgePart b={b} />);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const table = isTable(b);
  return (
    <>
      <Layer x={SAFE_CX} y={1340} k={reveal(b.f, b.ck(0, 0), b.ck(0, 2) - 3)}>
        <StepPill n={1} text="作れそうか確認" />
      </Layer>
      <Layer x={SAFE_CX} y={1340} k={reveal(b.f, b.ck(0, 2), b.ln(1) - 6)}>
        <StepPill n={2} text="子どもと一緒に選ぶ" />
      </Layer>
      {table &&
        TABLE_CARDS.map((p, i) => (
          <At key={i} shot={shot} p={[p[0] + 0.12, p[1] + 0.25, p[2]]} k={reveal(b.f, b.ck(0, 1) + i * 5, b.ck(0, 2) + 10)}>
            <Mark kind="ok" size={66} />
          </At>
        ))}
      {!table && (
        <>
          <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ln(1) + 2)}>
            <TimeBar f={b.f} at={b.ck(1, 3) + 4} label="「何を作ろう」の手間" to={0.25} />
          </Layer>
          <Bubble shot={shot} at3={[PARENT_AT[0], 1.6, PARENT_AT[2]]} text="何を作ろう…" tone="grey" k={reveal(b.f, b.ck(1, 1) - 2, b.ck(1, 4))} dx={240} dy={60} />
        </>
      )}
    </>
  );
};

export const SUMMARY: SceneDefP = {
  topic: "毎日の「何を作ろう」に",
  shot,
  World,
  Overlay,
  kitchen: (b) => ({ door: isTable(b) ? 0 : 0.2 }),
  bloom: () => 0.4,
  dipIn: true,
  dipLines: [1],
};
