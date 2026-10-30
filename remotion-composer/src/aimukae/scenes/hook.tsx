import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { FONT } from "../../koucha/theme";
import { At, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Figure, walkAlong } from "../three/figures";
import { TOWN_LIGHT } from "../three/stage";
import { SceneDefP } from "../types";

// Line 0: the school route at dusk, a first-grader walks toward us under the old rule card.
// Line 1: 「足りないかも」 the card cracks; behind, a man steps out from behind the parked van (out of focus).
const SIDEWALK_Y = 0.06;
const FROM: V3 = [1.15, SIDEWALK_Y, -2.6];
const TO: V3 = [1.15, SIDEWALK_Y, 0.9];

const childAt = (b: Beat) => walkAlong(FROM, TO, b.f / b.dur, 11);

const shot = (b: Beat): Shot2 => {
  const c = childAt(b).pos;
  const rack = ease(b.f, b.ck(1, 2) - 4, 30, EASE.inOut);
  return breathe(
    {
      pos: [0.68, 1.75, c[2] + 8.9],
      target: [0.68 - rack * 0.3, 0.9, c[2] - 0.6],
      fov: 30,
      focus: [c[0] - rack * 0.8, 0.6, c[2] - rack * 2.6],
      aperture: 7 - rack * 2,
    },
    b.f,
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const c = childAt(b);
  const out = ease(b.f, b.ck(1, 2) - 8, 26, EASE.inOut);
  return (
    <>
      <Figure kind="child" pose={{ pos: c.pos, yaw: c.yaw, walk: c.walk, step: c.step }} />
      <Figure
        kind="man"
        pose={{
          pos: [-1.05 + out * 1.05, 0, -4.0 + out * 0.4],
          yaw: Math.PI * 0.85 - out * 0.35,
          walk: out * Math.PI * 3,
          step: out > 0 && out < 1 ? 1 : 0,
        }}
      />
    </>
  );
};

/** The old rule card above the child; it cracks and dims on 「足りないかも」. */
const RuleCard: React.FC<{ f: number; crackAt: number }> = ({ f, crackAt }) => {
  const crack = ease(f, crackAt, 10, EASE.out);
  const dim = ease(f, crackAt + 6, 20, EASE.inOut);
  const len = 900;
  return (
    <div style={{ position: "relative", transform: `rotate(${-2 - dim * 4}deg)`, filter: `saturate(${1 - dim * 0.7}) brightness(${1 - dim * 0.25})` }}>
      <div
        style={{
          background: "linear-gradient(180deg, #ffffff, #e9fbf8)",
          border: `8px solid ${COL.teal}`,
          borderRadius: 36,
          padding: "26px 46px",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 66,
          lineHeight: 1.25,
          color: "#0b4a42",
          textAlign: "center",
          whiteSpace: "nowrap",
          boxShadow: "0 16px 36px rgba(0,0,0,0.35)",
        }}
      >
        知らない人に
        <br />
        ついていかない
      </div>
      <svg viewBox="0 0 560 240" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polyline
          points="10,40 120,78 170,60 250,130 320,112 380,170 460,150 550,214"
          fill="none"
          stroke="#2b2f3a"
          strokeWidth={9}
          strokeLinejoin="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - crack)}
        />
      </svg>
    </div>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const c = childAt(b).pos;
  const at = b.ck(1, 2);
  const enter = ease(b.f, 0, 8, EASE.out);
  const bob = Math.sin(b.f / 14) * 6;
  return (
    <>
      <At shot={shot} p={[c[0], 1.8, c[2]]} k={enter} dy={bob}>
        <RuleCard f={b.f} crackAt={at} />
      </At>
      <Layer x={SAFE_CX} y={1260} k={reveal(b.f, at)}>
        <Headline text="それだけじゃ 足りない？" size={76} f={b.f} at={at} tone="red" />
      </Layer>
    </>
  );
};

export const HOOK: SceneDefP = {
  topic: "AIの声で「迎えに来たよ」",
  shot,
  World,
  Overlay,
  light: () => TOWN_LIGHT,
  dipIn: false,
};
