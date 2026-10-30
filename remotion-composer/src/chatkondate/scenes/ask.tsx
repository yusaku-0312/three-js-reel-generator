import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { FONT } from "../../koucha/theme";
import { Chip, INK, Layer, reveal, SAFE_CX } from "../overlays";
import { AI_CYAN, Phone } from "../three/parts";
import { dolly, HERO_CAM } from "../../kondate/scenes/cams";
import { PHONE_AT, PHONE_H } from "../../kondate/scenes/hero";
import { SceneDefP } from "../types";

// L0 「写真を添付して、こんなふうに頼みます」: a close look at the chat; the photo sits in the input box, then is sent.
// L1 the request: the phone rises out of the way and the request card underneath lights line by line.
const PHONE_UP: V3 = [PHONE_AT[0], 1.7, PHONE_AT[2]];

const shot = (b: Beat): Shot2 => {
  const back = ease(b.f, b.ln(1) - 8, 18, EASE.inOut);
  return breathe(dolly(HERO_CAM, 0.5 * (1 - back)), b.f);
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const sent = ease(b.f, b.ck(0, 2), 8, EASE.inOut);
  const lift = ease(b.f, b.ln(1) - 8, 18, EASE.inOut);
  const toPrompt = ease(b.f, b.ck(1, 0) - 2, 10, EASE.inOut);
  const pos: V3 = [PHONE_AT[0], PHONE_AT[1] + (PHONE_UP[1] - PHONE_AT[1]) * lift, PHONE_AT[2]];
  return (
    <Phone
      pos={pos}
      h={PHONE_H}
      screen={toPrompt > 0 ? "photo" : "attach"}
      next={toPrompt > 0 ? "prompt" : "photo"}
      mix={toPrompt > 0 ? toPrompt : sent}
      glow={0.4 + 0.4 * ease(b.f, b.ck(0, 2), 6) * (1 - ease(b.f, b.ck(0, 2) + 8, 14))}
    />
  );
};

/** The request, word for word, so it can be copied: each line lights with the voice. */
const PromptCard: React.FC<{ b: Beat }> = ({ b }) => {
  const lines = [
    { t: "この写真の食材で作れる", at: b.ck(1, 0) },
    { t: "夕飯を3つ考えて。", at: b.ck(1, 2) },
    { t: "20分以内で、", at: b.ck(1, 3) },
    { t: "材料と作り方も教えて", at: b.ck(1, 4) },
  ];
  return (
    <div style={{ background: "#ffffff", border: `6px solid ${INK}`, borderRadius: 34, padding: "16px 40px 22px", boxShadow: "0 14px 32px rgba(0,0,0,0.45)", fontFamily: FONT, fontWeight: 900, textAlign: "center" }}>
      <div style={{ fontSize: 34, color: "#0b5560", marginBottom: 4 }}>こんなふうに頼む</div>
      {lines.map((l) => (
        <div key={l.t} style={{ whiteSpace: "nowrap", fontSize: 54, lineHeight: 1.24, color: INK, opacity: 0.2 + 0.8 * ease(b.f, l.at, 8, EASE.out) }}>
          {l.t}
        </div>
      ))}
    </div>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={560} k={reveal(b.f, b.ck(0, 0), b.ln(1) - 8)}>
      <Chip text="＋ 写真を添付" accent={AI_CYAN} size={50} />
    </Layer>
    <Layer x={SAFE_CX} y={1180} k={reveal(b.f, b.ck(1, 0) - 4)}>
      <PromptCard b={b} />
    </Layer>
  </>
);

export const ASK: SceneDefP = {
  topic: "写真を添付して頼む",
  shot,
  World,
  Overlay,
  bloom: () => 0.4,
  dipIn: true,
};
