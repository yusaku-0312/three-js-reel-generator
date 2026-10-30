import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { FONT } from "../../koucha/theme";
import { INK, Layer, reveal, SAFE_CX, StepPill } from "../overlays";
import { Phone, PhotoCard } from "../three/props";
import { SceneDefP } from "../types";
import { FRIDGE_CAM, HERO_CAM } from "./cams";
import { Core, CORE_AT, PHONE_AT, PHONE_H } from "./hero";

// L0 the fridge door swings open (inner light, the ingredients); a phone rises in the foreground showing the
// camera, shutter. L1 (dip) the floating phone: the photo is sent, it flies into the AI. L2 the request.
const SNAP_PHONE: V3 = [-0.86, 1.01, 1.6];
const isFridge = (b: Beat) => b.f < b.ln(1) - 4;
const shutterAt = (b: Beat) => b.ck(0, 2) + 18;

const shot = (b: Beat): Shot2 => breathe(isFridge(b) ? FRIDGE_CAM : HERO_CAM, b.f, isFridge(b) ? 0.02 : 0.035);

const FridgePart: React.FC<{ b: Beat }> = ({ b }) => {
  const up = ease(b.f, b.ck(0, 2) - 4, 14, EASE.out);
  const flash = ease(b.f, shutterAt(b), 2) * (1 - ease(b.f, shutterAt(b) + 2, 8));
  return up <= 0.02 ? null : (
    <Phone pos={[SNAP_PHONE[0], SNAP_PHONE[1] - (1 - up) * 0.2, SNAP_PHONE[2]]} rot={[-0.14, 0.04, 0]} h={0.5 * (0.5 + 0.5 * up)} screen="camera" flash={flash} />
  );
};

const HeroPart: React.FC<{ b: Beat }> = ({ b }) => {
  const toChat = ease(b.f, b.ln(1), 10, EASE.inOut);
  const toPrompt = ease(b.f, b.ck(2, 0) - 2, 10, EASE.inOut);
  const fly = ease(b.f, b.ck(1, 1), 16, EASE.inOut);
  const sent = ease(b.f, b.ck(1, 1) + 14, 6, EASE.out) * (1 - ease(b.f, b.ck(1, 1) + 22, 16, EASE.inOut));
  const from: V3 = [PHONE_AT[0], PHONE_AT[1] + 0.1, PHONE_AT[2] + 0.1];
  const cardPos = lerp3(from, CORE_AT, fly);
  const arc: V3 = [cardPos[0] + Math.sin(fly * Math.PI) * 0.35, cardPos[1], cardPos[2] + Math.sin(fly * Math.PI) * 0.2];
  return (
    <>
      <Phone
        pos={PHONE_AT}
        h={PHONE_H}
        screen={toPrompt > 0 ? "chat" : "camera"}
        next={toPrompt > 0 ? "prompt" : "chat"}
        mix={toPrompt > 0 ? toPrompt : toChat}
        glow={0.5 + sent}
      />
      <Core f={b.f} k={1} power={0.6 + sent * 1.2} />
      {fly > 0 && fly < 1 && <PhotoCard pos={arc} k={1 - fly * 0.6} rot={[0, fly * 0.6, fly * 0.4]} scale={1.1} />}
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => (isFridge(b) ? <FridgePart b={b} /> : <HeroPart b={b} />);

/** The request as a reusable template: what to type to the AI. */
const PromptCard: React.FC<{ b: Beat }> = ({ b }) => {
  const parts = [
    { t: "この食材で作れる", at: b.ck(2, 0) },
    { t: "晩ごはんを3つ考えて", at: b.ck(2, 1) },
  ];
  return (
    <div style={{ background: "#ffffff", border: `6px solid ${INK}`, borderRadius: 34, padding: "18px 40px 22px", boxShadow: "0 14px 32px rgba(0,0,0,0.45)", fontFamily: FONT, fontWeight: 900, textAlign: "center" }}>
      <div style={{ fontSize: 34, color: "#0b5560", marginBottom: 4 }}>AIへの頼み方</div>
      {parts.map((p) => (
        <div key={p.t} style={{ whiteSpace: "nowrap", fontSize: 56, lineHeight: 1.22, color: INK, opacity: 0.2 + 0.8 * ease(b.f, p.at, 8, EASE.out) }}>
          {p.t}
        </div>
      ))}
    </div>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={570} k={reveal(b.f, b.ck(0, 0), b.ln(1) - 6)}>
      <StepPill n={1} text="冷蔵庫を撮る" />
    </Layer>
    <Layer x={SAFE_CX} y={1350} k={reveal(b.f, b.ln(1) + 2, b.ln(2) - 4)}>
      <StepPill n={2} text="写真をAIに送る" />
    </Layer>
    <Layer x={SAFE_CX} y={1318} k={reveal(b.f, b.ln(2) - 2)}>
      <PromptCard b={b} />
    </Layer>
  </>
);

export const STEP1: SceneDefP = {
  topic: "① 冷蔵庫を撮って送る",
  shot,
  World,
  Overlay,
  kitchen: (b) => ({ door: isFridge(b) ? ease(b.f, b.ck(0, 1) - 6, 18, EASE.inOut) : 0 }),
  shutter: (b) => ease(b.f, shutterAt(b), 2) * (1 - ease(b.f, shutterAt(b) + 2, 10, EASE.out)) * 0.7,
  bloom: (b) => (isFridge(b) ? 0.4 : 0.45),
  dipIn: true,
  dipLines: [1],
};
