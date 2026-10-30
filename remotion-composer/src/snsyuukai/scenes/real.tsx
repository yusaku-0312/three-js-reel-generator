import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Chip, COL, Layer, reveal, SAFE_CX, SourceCard, Stamp } from "../overlays";
import { Coins, PhotoCard, PINK, Sparkles, Waveform } from "../three/props";
import { LAB_LIGHT } from "../../aimukae/three/stage";
import { SceneDefP } from "../types";
import { labCam } from "./cams";

// One line, the lab: the source card (FBI, Dec 2025) on top. 「SNSの写真を」 a posted photo; 「加工した」 it
// glitches and turns into the fake (mosaic, 偽). 「家族の声をまねた」 a pink voice with a cyan glitch;
// 「お金を要求する」 gold coins stack up between them; 「注意喚起も」 a red 注意 stamp thumps in.
const PHOTO: V3 = [-0.55, 1.7, 0.2];
const VOICE: V3 = [0.58, 1.5, 0.2];
const COINS: V3 = [-0.15, 0.45, 0.6];

const shot = (b: Beat): Shot2 => breathe(keys2(b.f, [[0, labCam(-0.15, 0.5)], [b.ck(0, 4), labCam(0.15, 0.2), 80]]), b.f);

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const glitch = ease(b.f, b.ck(0, 2), 6) * (1 - ease(b.f, b.ck(0, 3) + 4, 12));
  const isFake = b.f >= b.ck(0, 3) - 2;
  return (
    <>
      <PhotoCard pos={PHOTO} kind={isFake ? "fake" : "park"} scale={1.8} k={ease(b.f, 0, 10, EASE.out)} glitch={glitch} f={b.f} edge={isFake ? "#c9ccd6" : "#ffffff"} />
      <Waveform pos={VOICE} f={b.f} seed={7} width={0.85} height={0.4} grow={ease(b.f, b.ck(0, 4), 16, EASE.out)} intensity={1.5} color={PINK} glitch={0.3} />
      <Coins pos={COINS} k={ease(b.f, b.ck(0, 6), 12, EASE.out)} scale={3.4} />
      <Sparkles center={[COINS[0], COINS[1] + 0.3, COINS[2]]} f={b.f - b.ck(0, 6)} mode="burst" count={10} radius={0.5} size={0.08} color="#ffd27a" seed={3} intensity={b.f >= b.ck(0, 6) ? 2 : 0} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => (
  <>
    <Layer x={SAFE_CX} y={575} k={reveal(b.f, b.ck(0, 0))}>
      <SourceCard k={1} who="米FBIが注意喚起" when="2025年12月" />
    </Layer>
    <At shot={shot} p={[PHOTO[0], PHOTO[1] - 0.62, PHOTO[2]]} k={reveal(b.f, b.ck(0, 3))}>
      <Chip text="偽の誘拐写真" size={42} accent={COL.red} />
    </At>
    <At shot={shot} p={[VOICE[0], VOICE[1] - 0.18, VOICE[2]]} k={reveal(b.f, b.ck(0, 4))}>
      <Chip text="まねた声" size={42} accent={COL.pink} />
    </At>
    <At shot={shot} p={[COINS[0], COINS[1] - 0.32, COINS[2]]} k={reveal(b.f, b.ck(0, 6))}>
      <Chip text="お金を要求" size={46} accent="#f2c14a" />
    </At>
    <Layer x={SAFE_CX + 255} y={1190} k={1}>
      <Stamp f={b.f} at={b.ck(0, 8)} text="注意" size={220} />
    </Layer>
  </>
);

export const REAL: SceneDefP = {
  topic: "実際に注意喚起も",
  shot,
  World,
  Overlay,
  light: () => LAB_LIGHT,
  grade: (b) => ({ glitch: ease(b.f, b.ck(0, 2), 3) * (1 - ease(b.f, b.ck(0, 2) + 4, 12)) * 0.5 }),
  dipIn: true,
};
