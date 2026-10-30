import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Chip, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { AICore, PINK, Sparkles, Waveform } from "../three/fx";
import { WordCard } from "../three/props";
import { LAB_LIGHT } from "../three/stage";
import { SceneDefP } from "../types";
import { labCam } from "./cams";

// One line: the person's real voice (pink, bottom left) rises into the AI crystal, words they never said
// go in, and an identical-looking pink voice comes out bottom right. Same seed = same shape.
const SOURCE: V3 = [-0.6, 0.35, 0.2];
const CORE: V3 = [0, 1.9, 0];
const CLONE: V3 = [0.6, 0.35, 0.2];
const SEED = 11;

const shot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, labCam(-0.2, 0.4)],
      [b.ck(0, 3), labCam(0.2), 70],
    ]),
    b.f,
  );

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const core = ease(f, b.ck(0, 0) - 4, 16, EASE.out);
  const suck = ease(f, b.ck(0, 1), 24, EASE.inOut);
  const word = ease(f, b.ck(0, 2) - 2, 20, EASE.inOut);
  const clone = ease(f, b.ck(0, 3) - 2, 26, EASE.out);
  return (
    <>
      <Waveform pos={SOURCE} f={f} seed={SEED} width={1.0} height={0.5} live={1} intensity={1.5} />
      {suck > 0 && suck < 1 && (
        <Waveform
          pos={[SOURCE[0] * (1 - suck), SOURCE[1] + (CORE[1] - 0.2 - SOURCE[1]) * suck, 0.2]}
          f={f}
          seed={SEED}
          width={1.0 * (1 - suck * 0.7)}
          height={0.5 * (1 - suck * 0.6)}
          intensity={1.2 * (1 - suck)}
        />
      )}
      {core > 0 && <AICore pos={CORE} f={f} size={0.42 * core} power={0.4 + suck * 0.6 + word * 0.4 + clone * 0.4} />}
      <WordCard pos={[1.0 - word * 1.0, CORE[1] - 0.55 + word * 0.55, 0.3]} text="話していない言葉" w={1.4 * (1 - word * 0.8)} k={ease(f, b.ck(0, 2) - 8, 8, EASE.out)} gone={word > 0.95 ? 1 : 0} />
      <Waveform pos={CLONE} f={f} seed={SEED} width={1.0} height={0.5} live={1} grow={clone} intensity={1.5} glitch={0.18} />
      <Sparkles center={CLONE} f={f - b.ck(0, 3)} mode="burst" count={14} radius={0.7} size={0.1} color={PINK} seed={9} intensity={2} />
    </>
  );
};

const label = (shot: Shot2, p: V3, k: number, text: string, accent: string) => (
  <At shot={shot} p={p} k={k}>
    <Chip text={text} size={42} accent={accent} />
  </At>
);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const at = b.ck(0, 4);
  return (
    <>
      {label(shot, [SOURCE[0], SOURCE[1] - 0.22, SOURCE[2]], reveal(b.f, 6), "本人の声", COL.pink)}
      {label(shot, [0.78, CORE[1], 0], reveal(b.f, b.ck(0, 0)), "AI", COL.cyan)}
      {label(shot, [CLONE[0], CLONE[1] - 0.22, CLONE[2]], reveal(b.f, b.ck(0, 3) + 6), "AIの声", COL.pink)}
      <Layer x={SAFE_CX} y={560} k={reveal(b.f, at)}>
        <Headline text="そっくりな声を作れる" size={78} f={b.f} at={at} tone="pink" />
      </Layer>
    </>
  );
};

export const AI: SceneDefP = {
  topic: "AIで声はまねできる",
  shot,
  World,
  Overlay,
  light: () => LAB_LIGHT,
  bloom: () => 0.5,
  dipIn: true,
};
