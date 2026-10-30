import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { At, Bubble, Chip } from "../overlays";
import { SceneDefP } from "../types";
import { dolly, ROOM_CAM } from "./cams";
import { phoneNight, TeenOnBed } from "./cast";
import { span } from "./util";

// L0 lamp off, only the phone light: the child hunches over, phone lowered. 「信じてもらえなかったら…」.
// At 「誰にも」 the camera has pulled back enough to show the shut door with the warm hall light under it —
// help is right there, but the door stays shut.
const shot = (b: Beat): Shot2 => breathe(lerpShot2(dolly(ROOM_CAM, 0.3), ROOM_CAM, ease(b.f, 0, b.ck(0, 5), EASE.cam)), b.f, 0.02);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const slump = ease(b.f, 6, 30, EASE.inOut);
  return <TeenOnBed f={b.f} screen="dmThreat" phoneGlow={0} phoneDim={0.85} lower={0.7} pose={{ slump, headPitch: 0.25 }} />;
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => (
  <>
    <Bubble shot={shot} at3={[0.45, 1.15, -2.27]} text={"偽物だって\n信じてもらえなかったら…"} k={span(b.f, b.ck(0, 1) - 2, b.ck(0, 5) - 4)} tone="grey" dy={170} size={46} />
    <At shot={shot} p={[-0.8, 2.2, -3.2]} k={span(b.f, b.ck(0, 5))} dy={20}>
      <Chip text="誰にも相談できない" size={48} accent="#9aa0aa" />
    </At>
  </>
);

export const FEAR: SceneDefP = {
  topic: "誰にも相談できない",
  shot,
  World,
  Overlay,
  light: () => phoneNight(0.55, 0.35, { hall: 0.75, front: 0.22, fill: 0.22 }),
  grade: (b) => ({ desat: 0.35 * ease(b.f, 0, 40) }),
  dipIn: true,
};
