import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { Layer, NoteCard, SAFE_CX, Scrim } from "../overlays";
import { NIGHT } from "../three/room";
import { SceneDefP } from "../types";
import { BED_CAM, dolly } from "./cams";
import { Family } from "./rule2";

// L0 the family on and by the bed under the warm lamp, the camera easing back. L1 the words to say, as a
// note card over them, each phrase firming up as it is spoken.
const shot = (b: Beat): Shot2 => breathe(lerpShot2(dolly(BED_CAM, 0.12), BED_CAM, ease(b.f, 0, b.ln(1), EASE.cam)), b.f, 0.02);

const World: React.FC<{ b: Beat }> = ({ b }) => <Family b={b} hug={1} look={1} />;

const Overlay: React.FC<{ b: Beat }> = ({ b }) => {
  const k = ease(b.f, b.ck(1, 0) - 4, 10, EASE.out);
  return (
    <>
      <Scrim y={1150} k={k} height={560} strength={0.55} />
      <Layer x={SAFE_CX} y={1150} k={k}>
        <NoteCard
          f={b.f}
          k={k}
          lines={[
            { text: "「脅されたら、", at: b.ck(1, 0) },
            { text: "一人で何とか", at: b.ck(1, 1) },
            { text: "しなくていい。", at: b.ck(1, 2) },
            { text: "何があっても、", at: b.ck(1, 3) },
            { text: "一緒に考えるよ」", at: b.ck(1, 4), hl: true },
          ]}
        />
      </Layer>
    </>
  );
};

export const OUTRO: SceneDefP = {
  topic: "今日、一言",
  shot,
  World,
  Overlay,
  light: () => ({ ...NIGHT, lamp: 1.1, hall: 0.9, front: 0.55 }),
  room: () => ({ door: 1 }),
  dipIn: true,
};
