import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { FONT } from "../../koucha/theme";
import { AiNote, INK, Layer, reveal, SAFE_CX, Scrim, StepPill } from "../overlays";
import { Phone } from "../three/props";
import { SceneDefP } from "../types";
import { FRIDGE_CAM } from "./cams";

// L0 back at the fridge: the door opens, the phone comes up and takes the photo; then the closing card with
// the three steps and the AI-made note.
const SNAP_PHONE: V3 = [-0.86, 1.01, 1.6];
const shutterAt = (b: Beat) => b.ck(0, 1) + 10;

const shot = (b: Beat): Shot2 => {
  const up = ease(b.f, b.ck(0, 2), 50, EASE.cam);
  return breathe(
    { ...FRIDGE_CAM, pos: [FRIDGE_CAM.pos[0], FRIDGE_CAM.pos[1] + up * 0.5, FRIDGE_CAM.pos[2] + up * 0.6], aperture: 1.5 + up * 3 },
    b.f,
    0.02,
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const up = ease(b.f, b.ck(0, 1) - 8, 12, EASE.out) * (1 - ease(b.f, b.ck(0, 2) - 4, 14, EASE.in));
  const flash = ease(b.f, shutterAt(b), 2) * (1 - ease(b.f, shutterAt(b) + 2, 8));
  return up <= 0.02 ? null : (
    <Phone pos={[SNAP_PHONE[0], SNAP_PHONE[1] - (1 - up) * 0.2, SNAP_PHONE[2]]} rot={[-0.14, 0.04, 0]} h={0.5 * (0.5 + 0.5 * up)} screen="camera" flash={flash} />
  );
};

const Summary: React.FC<{ b: Beat }> = ({ b }) => {
  const at = b.ck(0, 2);
  const steps = ["冷蔵庫を撮る", "AIに3品考えてもらう", "子どもが選ぶ"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, fontFamily: FONT, fontWeight: 900 }}>
      <div style={{ whiteSpace: "nowrap", fontSize: 82, color: "#fff", WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill", lineHeight: 1.15, textAlign: "center" }}>
        今夜の献立は
        <br />
        子どもと決めよう
      </div>
      {steps.map((s, i) => {
        const k = ease(b.f, at + 8 + i * 6, 10, EASE.out);
        return (
          <div key={s} style={{ opacity: k, transform: `translateY(${(1 - k) * 20}px)` }}>
            <StepPill n={i + 1} text={s} size={50} />
          </div>
        );
      })}
    </div>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => {
  const k = reveal(b.f, b.ck(0, 2));
  return (
    <>
      <Scrim y={960} k={k} height={900} strength={0.6} />
      <Layer x={SAFE_CX} y={950} k={k}>
        <Summary b={b} />
      </Layer>
      <AiNote k={reveal(b.f, b.ck(0, 2) + 20)} />
    </>
  );
};

export const OUTRO: SceneDefP = {
  topic: "今夜、さっそく",
  shot,
  World,
  Overlay,
  kitchen: (b) => ({ door: ease(b.f, 4, 18, EASE.inOut) }),
  shutter: (b) => ease(b.f, shutterAt(b), 2) * (1 - ease(b.f, shutterAt(b) + 2, 10, EASE.out)) * 0.7,
  dipIn: true,
};
