import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { AiNote, COL, FONT_STACK, Layer, NoteCard, reveal, SAFE_CX } from "../overlays";
import { Figure } from "../three/figures";
import { TEAL } from "../three/fx";
import { TOWN_LIGHT } from "../three/stage";
import { SceneDefP } from "../types";

// L0 in front of home, mom kneels to the child's eye level. L1 the words of the promise on a paper card, the
// child nods on 「断っていいよ」 and hops on 「助けを求めてね」. L2 crane up over the evening town,
// windows lighting; the closing card: what to decide together today.
const Y = 0.06;
const MOM: V3 = [-4.1, Y, 5.55];
const KID: V3 = [-4.1, Y, 6.45];

const shot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [4.6, 5.0, 8.0], target: [-3.97, 0.35, 5.98], fov: 30, focus: [-4.1, 0.7, 6.0], aperture: 2.5 }],
      [b.ck(0, 1), { pos: [4.07, 4.7, 7.4], target: [-3.97, 0.3, 5.98], fov: 30, focus: [-4.1, 0.7, 6.0], aperture: 2.5 }, 70],
      [b.ln(2) - 10, { pos: [3.5, 9.5, 14.0], target: [-1.5, 0.5, -2.0], fov: 30, focus: [-1.5, 0.5, -2], aperture: 1 }, 150],
    ]),
    b.f,
  );

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const kneel = ease(b.f, 6, 24, EASE.inOut);
  const nod = Math.max(0, Math.sin((b.f - b.ck(1, 3)) / 4)) * 0.3 * ease(b.f, b.ck(1, 3), 4) * (1 - ease(b.f, b.ck(1, 3) + 16, 8));
  const hop = ease(b.f, b.ck(1, 6), 10) * (1 - ease(b.f, b.ck(1, 6) + 10, 10));
  return (
    <>
      <Figure kind="mom" pose={{ pos: MOM, yaw: 0, crouch: kneel, lean: kneel * 0.15, armR: kneel * 0.6, armL: kneel * 0.5 }} />
      <Figure kind="child" pose={{ pos: KID, yaw: Math.PI, headPitch: nod, hop }} />
    </>
  );
};

const Summary: React.FC<{ b: Beat }> = ({ b }) => {
  const items = [
    { n: "1", text: "合言葉", at: b.ck(2, 2) },
    { n: "2", text: "助けを求める場所", at: b.ck(2, 4) },
  ];
  return (
    <div
      style={{
        width: 780,
        background: "linear-gradient(180deg, rgba(255,250,240,0.96), rgba(234,251,247,0.96))",
        border: `8px solid ${COL.teal}`,
        borderRadius: 40,
        padding: "34px 40px",
        fontFamily: FONT_STACK,
        fontWeight: 900,
        boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ fontSize: 58, color: "#0b4a42", textAlign: "center", marginBottom: 18 }}>今日、親子で決めよう</div>
      {items.map((it) => {
        const k = ease(b.f, it.at, 10, EASE.out);
        return (
          <div key={it.n} style={{ display: "flex", alignItems: "center", gap: 22, margin: "14px 0", opacity: k, transform: `translateX(${(1 - k) * 30}px)` }}>
            <div style={{ width: 86, height: 86, borderRadius: 999, background: TEAL, color: "#fff", fontSize: 58, lineHeight: "86px", textAlign: "center" }}>{it.n}</div>
            <div style={{ fontSize: 64, color: "#123c3e" }}>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const noteK = Math.min(ease(b.f, b.ln(1) - 2, 10, EASE.out), 1 - ease(b.f, b.ln(2) - 8, 8, EASE.in));
  return (
    <>
      <Layer x={SAFE_CX} y={1190} k={noteK}>
        <NoteCard
          f={b.f}
          k={1}
          lines={[
            { text: "迎えに来たと言われても", at: b.ck(1, 0) },
            { text: "確認できなければ", at: b.ck(1, 2) },
            { text: "断っていいよ。", at: b.ck(1, 3), hl: true },
            { text: "困ったら 一人で決めずに", at: b.ck(1, 4) },
            { text: "助けを求めてね", at: b.ck(1, 6), hl: true },
          ]}
        />
      </Layer>
      <Layer x={SAFE_CX} y={1000} k={reveal(b.f, b.ck(2, 0))}>
        <Summary b={b} />
      </Layer>
      <AiNote k={reveal(b.f, b.ck(2, 5))} />
    </>
  );
};

export const OUTRO: SceneDefP = {
  topic: "最後に、お子さんへ",
  shot,
  World,
  Overlay,
  light: (b) => ({ ...TOWN_LIGHT, evening: 0.45 + ease(b.f, b.ln(2) - 10, 120) * 0.45, fog: b.f > b.ln(2) ? [30, 70] : undefined }),
  town: (b) => ({ sign110: ease(b.f, b.ln(2), 60) * 0.5, shop: 0.3 }),
  bloom: () => 0.45,
  dipIn: true,
};
