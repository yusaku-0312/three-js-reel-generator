import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { Bubble, Chip, Layer, SAFE_CX, StepPill } from "../overlays";
import { faceTo, Figure } from "../three/figures";
import { Dome, Phone } from "../three/props";
import { BED, NIGHT } from "../three/room";
import { SceneDefP } from "../types";
import { BED_CAM, DAD_BED, MOM_SIT, TEEN_SIT } from "./cams";
import { TeenOnBed } from "./cast";
import { span } from "./util";

// L0 on the bed, mom beside the child with an arm round them, dad standing by: 「話してくれてありがとう。
// 一緒に対応しよう」 and a ✓. L1 「本物でも」「偽物でも」 → a teal dome rises over the child and mom: protect them.
const BED_SEAT = BED.seat;
const MID: V3 = [(TEEN_SIT[0] + MOM_SIT[0]) / 2, 0, -2.15];
const CRANE: Shot2 = { ...BED_CAM, pos: [BED_CAM.pos[0] + 0.3, BED_CAM.pos[1] + 0.6, BED_CAM.pos[2] - 0.4] };

const shot = (b: Beat): Shot2 => breathe(lerpShot2(BED_CAM, CRANE, ease(b.f, b.ln(1), 80, EASE.cam)), b.f, 0.025);

export const Family: React.FC<{ b: Beat; hug?: number; look?: number; dad?: boolean }> = ({ b, hug = 0, look = 0, dad = true }) => (
  <>
    <TeenOnBed f={b.f} screen="dmThreat" phoneDim={0.5} lower={1} noPhone pose={{ armL: 0.3, armR: 0.3, headPitch: 0.1, headYaw: 0.25 * look }} />
    <Figure kind="mom" pose={{ pos: MOM_SIT, sit: 1, yaw: -0.25, armL: 0.25 * hug, hugL: 0.6 * hug, headYaw: -0.35, headPitch: 0.1 }} />
    {dad && <Figure kind="dad" pose={{ pos: DAD_BED, yaw: faceTo(DAD_BED, TEEN_SIT) * 0.6 }} />}
    <Phone pos={[0.12, BED_SEAT + 0.015, -2.6]} rot={[-Math.PI / 2, 0, 0.4]} h={0.24} screen="dmThreat" dim={0.6} />
  </>
);

const World: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Family b={b} hug={ease(b.f, 4, 20, EASE.inOut)} />
    <Dome pos={MID} k={ease(b.f, b.ck(1, 2), 18, EASE.out)} radius={0.95} f={b.f} />
  </>
);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => (
  <>
    <Layer x={SAFE_CX} y={560} k={span(b.f, b.ck(0, 0), b.ln(1) - 6)}>
      <StepPill n={2} text="まず 受け止める" size={52} />
    </Layer>
    <Bubble
      shot={shot}
      at3={[MOM_SIT[0], 1.35, MOM_SIT[2]]}
      text={"話してくれてありがとう。\n一緒に対応しよう"}
      k={span(b.f, b.ck(0, 2) - 2, b.ln(1) - 4)}
      tone="teal"
      dy={150}
      dx={-40}
      size={48}
    />
    <Layer x={SAFE_CX} y={1330} k={span(b.f, b.ck(0, 5), b.ln(1) - 4)}>
      <Chip text="それで大丈夫" size={48} accent="#16b8a4" mark="ok" />
    </Layer>
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%", display: "flex" }}>
      <Layer x={360} y={570} k={span(b.f, b.ck(1, 0))}>
        <Chip text="本物でも" size={48} accent="#9aa0aa" />
      </Layer>
      <Layer x={720} y={570} k={span(b.f, b.ck(1, 1))}>
        <Chip text="偽物でも" size={48} accent="#5ff0ff" />
      </Layer>
    </div>
    <Layer x={SAFE_CX} y={1330} k={span(b.f, b.ck(1, 4))}>
      <Chip text="子どもを守る" size={52} accent="#16b8a4" mark="ok" />
    </Layer>
  </>
);

export const RULE2: SceneDefP = {
  topic: "まず受け止める",
  shot,
  World,
  Overlay,
  light: () => ({ ...NIGHT, hall: 0.9 }),
  room: () => ({ door: 1 }),
  dipIn: true,
};
