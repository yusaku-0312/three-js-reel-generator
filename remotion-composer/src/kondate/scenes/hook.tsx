import React from "react";
import { interpolate } from "remotion";
import { Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { FONT } from "../../koucha/theme";
import { At, Bubble, INK } from "../overlays";
import { faceTo, Figure } from "../three/figures";
import { SceneDefP } from "../types";
import { dolly, HOOK_CAM, KID_AT, PARENT_AT } from "./cams";

// L0 7 pm, the parent at the half-open fridge turns to the child: 「晩ごはん、何がいい？」 → 「なんでもいい」 (a shrug).
// L1 「困っていませんか？」 three question marks pop over the parent, whose shoulders drop.
const shot = (b: Beat): Shot2 => breathe(dolly(HOOK_CAM, -0.06 + 0.06 * ease(b.f, 0, b.dur, EASE.inOut)), b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const ask = ease(b.f, 0, 14, EASE.out);
  const shrugAt = b.ck(0, 2);
  const shrug = ease(b.f, shrugAt, 6, EASE.out) * (1 - ease(b.f, shrugAt + 16, 10, EASE.inOut));
  const slump = ease(b.f, b.ck(1, 1), 14, EASE.inOut);
  return (
    <>
      <Figure
        kind="parent"
        pose={{
          pos: PARENT_AT,
          yaw: faceTo(PARENT_AT, KID_AT) - 0.25 + ask * 0.25,
          headRoll: ask * 0.22 * (1 - slump),
          armR: 0.35 * ask,
          slump,
        }}
      />
      <Figure
        kind="kid"
        pose={{ pos: KID_AT, yaw: faceTo(KID_AT, PARENT_AT), spread: shrug * 0.55, armL: shrug * 0.3, armR: shrug * 0.3, headRoll: -shrug * 0.25 }}
      />
    </>
  );
};

const QMark: React.FC<{ f: number; at: number; size: number; rot: number }> = ({ f, at, size, rot }) => {
  const k = ease(f, at, 7, EASE.out);
  if (k <= 0) return null;
  const s = interpolate(k, [0, 0.7, 1], [0.3, 1.15, 1]);
  return (
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#fff", WebkitTextStroke: `${size * 0.12}px ${INK}`, paintOrder: "stroke fill", transform: `scale(${s}) rotate(${rot}deg)`, opacity: k, lineHeight: 1 }}>
      ？
    </div>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const askK = Math.min(ease(b.f, b.ck(0, 0) - 2, 8, EASE.out), 1 - ease(b.f, b.ln(1) + 4, 8, EASE.in));
  const replyK = Math.min(ease(b.f, b.ck(0, 2) - 1, 8, EASE.out), 1 - ease(b.f, b.ln(1) + 10, 8, EASE.in));
  const q0 = b.ck(1, 0);
  const qK = 1 - ease(b.f, b.dur - 6, 6, EASE.in);
  return (
    <>
      <Bubble shot={shot} at3={[PARENT_AT[0], 1.6, PARENT_AT[2]]} text={"晩ごはん、\n何がいい？"} k={askK} dx={270} dy={-30} />
      <Bubble shot={shot} at3={[KID_AT[0], 1.05, KID_AT[2]]} text="なんでもいい" k={replyK} tone="grey" dy={190} />
      <At shot={shot} p={[PARENT_AT[0], 1.75, PARENT_AT[2]]} k={qK} dy={-10}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", transform: "translateX(150px)" }}>
          <QMark f={b.f} at={q0} size={110} rot={-12} />
          <QMark f={b.f} at={q0 + 5} size={150} rot={4} />
          <QMark f={b.f} at={q0 + 10} size={120} rot={14} />
        </div>
      </At>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "「なんでもいい」に困ったら",
  shot,
  World,
  Overlay,
  kitchen: () => ({ door: 0.32 }),
};
