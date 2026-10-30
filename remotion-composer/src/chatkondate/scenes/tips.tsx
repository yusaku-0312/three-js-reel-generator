import React from "react";
import { interpolate } from "remotion";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { FONT } from "../../koucha/theme";
import { At, COL, INK, Layer, Mark, reveal, SAFE_CX, Scrim } from "../overlays";
import { Phone, PhotoPanel, photoPoint } from "../three/parts";
import { PHOTO_PINS } from "../three/screens";
import { HERO_CAM } from "../../kondate/scenes/cams";
import { Core, PHONE_AT, PHONE_H } from "../../kondate/scenes/hero";
import { SceneDefP } from "../types";

// L0 the fridge photo, large: a lidded container and a wrapped pack get a "?"; the parent types what they are
// (orange bubbles) and the "?" turn into ✓.
// L1 (dip) an omurice recipe: ケチャップ is not at home (red); 「ケチャップを使わずに作れる？」 → the AI answers,
// the line turns teal.
const PHOTO_AT: V3 = [0, 1.6, 1.0];
const PHOTO_W = 0.8;

const shot = (b: Beat): Shot2 => breathe(HERO_CAM, b.f, 0.03);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (b.f < b.ln(1) - 4) {
    const k = ease(b.f, 0, 12, EASE.out);
    return <PhotoPanel pos={[PHOTO_AT[0], PHOTO_AT[1] - (1 - k) * 0.1, PHOTO_AT[2]]} w={PHOTO_W} k={k} rot={[0, Math.sin(b.f / 50) * 0.05, 0]} />;
  }
  const reply = ease(b.f, b.ck(1, 4), 8);
  return (
    <>
      <Phone pos={[PHONE_AT[0] + 0.62, PHONE_AT[1] + 0.25, PHONE_AT[2] - 0.6]} rot={[0, -0.35, 0]} h={PHONE_H} screen="menus" glow={0.4 + reply * 0.5} />
      <Core f={b.f} k={1} power={0.5 + reply * 1.2} />
    </>
  );
};

const Pin: React.FC<{ f: number; at: number; doneAt: number }> = ({ f, at, doneAt }) => {
  const done = ease(f, doneAt, 6, EASE.out);
  const s = interpolate(ease(f, at, 8, EASE.out), [0, 0.7, 1], [0.3, 1.2, 1]) * (1 + Math.sin(f * 0.4) * 0.06 * (1 - done));
  return (
    <div style={{ transform: `scale(${s})`, position: "relative", width: 96, height: 96 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - done, borderRadius: 999, background: "#ffffff", border: `7px solid ${INK}`, fontFamily: FONT, fontWeight: 900, fontSize: 66, lineHeight: "82px", textAlign: "center", color: COL.red }}>
        ？
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: done }}>
        <Mark kind="ok" size={96} />
      </div>
    </div>
  );
};

/** Chat bubble (the parent's words in orange, the AI's in white with a cyan edge). */
const Say: React.FC<{ text: string; ai?: boolean; size?: number }> = ({ text, ai, size = 48 }) => (
  <div
    style={{
      fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.25, whiteSpace: "pre", textAlign: "left",
      color: ai ? INK : "#ffffff", background: ai ? "#ffffff" : "#ff8a3d", border: `5px solid ${ai ? "#3fd6e8" : "#ffb27d"}`,
      borderRadius: 32, padding: `${size * 0.3}px ${size * 0.55}px`, boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
    }}
  >
    {text}
  </div>
);

/** The suggested recipe's ingredients; ケチャップ turns red (not at home), then teal (トマトで代用). */
const Recipe: React.FC<{ b: Beat }> = ({ b }) => {
  const missing = ease(b.f, b.ck(1, 1), 8, EASE.out);
  const fixed = ease(b.f, b.ck(1, 4) + 4, 8, EASE.out);
  const rows = ["卵 2個", "ごはん 2膳", "鶏もも肉 100g"];
  const row = { fontSize: 50, lineHeight: 1.42, color: INK } as const;
  return (
    <div style={{ width: 640, background: "#fffaf0", border: `6px solid ${INK}`, borderRadius: 34, padding: "20px 44px 26px", boxShadow: "0 14px 32px rgba(0,0,0,0.45)", fontFamily: FONT, fontWeight: 900 }}>
      <div style={{ fontSize: 58, color: "#3b2414", marginBottom: 6 }}>オムライス<span style={{ fontSize: 36, color: "#8a6a4a" }}>　20分</span></div>
      <div style={{ fontSize: 32, color: "#0b5560", marginBottom: 4 }}>材料</div>
      {rows.map((r) => (
        <div key={r} style={row}>・{r}</div>
      ))}
      <div style={{ ...row, display: "flex", alignItems: "center", gap: 18, color: fixed > 0.5 ? "#0b7a6c" : missing > 0.5 ? COL.red : INK }}>
        ・{fixed > 0.5 ? "トマト 1個" : "ケチャップ"}
        {missing > 0 && fixed < 0.5 && (
          <span style={{ fontSize: 34, color: "#fff", background: COL.red, borderRadius: 999, padding: "4px 18px", opacity: missing }}>家にない</span>
        )}
        {fixed > 0 && <Mark kind="ok" size={52} />}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const l1 = b.ln(1) - 4;
  return (
    <>
      <At shot={shot} p={photoPoint(PHOTO_AT, PHOTO_W, PHOTO_PINS.box)} k={reveal(b.f, b.ck(0, 1), l1)}>
        <Pin f={b.f} at={b.ck(0, 1)} doneAt={b.ck(0, 2) + 6} />
      </At>
      <At shot={shot} p={photoPoint(PHOTO_AT, PHOTO_W, PHOTO_PINS.pack)} k={reveal(b.f, b.ck(0, 1) + 4, l1)}>
        <Pin f={b.f} at={b.ck(0, 1) + 4} doneAt={b.ck(0, 3) + 6} />
      </At>
      <Layer x={SAFE_CX + 40} y={1200} k={reveal(b.f, b.ck(0, 2), l1)}>
        <Say text="青いふたの中：ひき肉 200g" size={44} />
      </Layer>
      <Layer x={SAFE_CX + 40} y={1320} k={reveal(b.f, b.ck(0, 3), l1)}>
        <Say text="新聞の包み：ほうれん草" size={44} />
      </Layer>
      <Scrim y={960} k={reveal(b.f, l1 + 2)} height={1000} strength={0.45} />
      <Layer x={SAFE_CX} y={790} k={reveal(b.f, l1 + 2)}>
        <Recipe b={b} />
      </Layer>
      <Layer x={SAFE_CX + 50} y={1195} k={reveal(b.f, b.ck(1, 2) - 2)}>
        <Say text={"ケチャップを使わずに\n作れる？"} size={46} />
      </Layer>
      <Layer x={SAFE_CX - 60} y={1350} k={reveal(b.f, b.ck(1, 4))}>
        <Say text="トマトで作れます" ai size={46} />
      </Layer>
    </>
  );
};

export const TIPS: SceneDefP = {
  topic: "うまく伝えるコツ",
  shot,
  World,
  Overlay,
  bloom: () => 0.4,
  dipIn: true,
  dipLines: [1],
};
