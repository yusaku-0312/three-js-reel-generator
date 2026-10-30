import React from "react";
import { Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Chip, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { CallLine, GroundRing, MapHouse, MapSheet, mapPoint, PhotoCard, Phone, Pin, QuestionCard, RED, Stranger } from "../three/props";
import { PhotoKind, SpotId } from "../three/textures";
import { LAB_LIGHT } from "../../aimukae/three/stage";
import { SceneDefP } from "../types";
import { labCam, mapCam, MAP_C, MAP_SIZE, span } from "./cams";

// L0 the lab: the post on the phone, 「顔」「声」 beside it; 「限りません」 three ? cards pop up below.
// L1 (dip) four posts in a 2×2 grid; on each chunk one steps forward and its give-away is ringed in red:
// the school name plate, the house, the shop sign, the place written in the text; 「手掛かり」 all edged red.
// L2 (dip) the picture map on the floor; a stranger at its edge; the four posts float above it, red threads
// run from each post to its place, and a big red pin lands on the house 「どこで生活しているか」.
const inGrid = (b: Beat) => b.f >= b.ln(1) - 4 && b.f < b.ln(2) - 4;
const inMap = (b: Beat) => b.f >= b.ln(2) - 4;

type Post = { kind: PhotoKind; at: V3; chunk: number; label: string; spot: SpotId };
const POSTS: Post[] = [
  { kind: "school", at: [-0.48, 1.86, 0], chunk: 1, label: "学校名", spot: "school" },
  { kind: "home", at: [0.48, 1.86, 0], chunk: 2, label: "自宅の外観", spot: "home" },
  { kind: "shop", at: [-0.48, 0.7, 0], chunk: 3, label: "看板", spot: "shop" },
  { kind: "postText", at: [0.48, 0.7, 0], chunk: 4, label: "場所", spot: "park" },
];
/** Above the map the posts float in a row along its far edge. */
const floatAt = (i: number): V3 => [-0.75 + i * 0.5, 0.55, MAP_C[2] - MAP_SIZE * 0.42];
const HOME = mapPoint(MAP_C, MAP_SIZE, "home");

const shot = (b: Beat): Shot2 => {
  if (inMap(b)) return breathe(keys2(b.f, [[0, mapCam(48, 9.3, -5)], [b.ln(2), mapCam(48, 9.3, -5), 1], [b.ck(2, 5), mapCam(48, 8.8, 4), 90]]), b.f, 0.015);
  if (inGrid(b)) return breathe(keys2(b.f, [[0, labCam(0, -0.6)], [b.ln(1), labCam(0, -0.6), 1], [b.ck(1, 6), labCam(0, -0.9), 60]]), b.f);
  return breathe(labCam(0, 0.4), b.f);
};

const PostBeat: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Phone pos={[0, 1.55, 0.2]} h={1.35} screen="post" glow={0.3} f={b.f} />
    {[-0.7, 0, 0.7].map((x, i) => (
      <QuestionCard key={i} pos={[x, 0.42, 0.6]} k={ease(b.f, b.ck(0, 4) + i * 3, 10, EASE.out)} f={b.f} seed={i} />
    ))}
  </>
);

const GridBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const all = ease(b.f, b.ck(1, 9), 10, EASE.out);
  return (
    <>
      {POSTS.map((p, i) => {
        const on = ease(b.f, b.ck(1, p.chunk), 10, EASE.out);
        const back = ease(b.f, b.ck(1, p.chunk + 1) + 4, 12, EASE.inOut);
        const fwd = on * (1 - back * 0.8);
        return (
          <PhotoCard
            key={p.kind}
            pos={[p.at[0], p.at[1], p.at[2] + fwd * 0.35]}
            kind={p.kind}
            scale={1.72}
            k={ease(b.f, b.ln(1) - 4 + i * 3, 10, EASE.out)}
            clue={on}
            edge={all > 0 ? "#ff8a94" : "#ffffff"}
            edgeGlow={all * 0.6}
          />
        );
      })}
    </>
  );
};

const MapBeat: React.FC<{ b: Beat }> = ({ b }) => {
  const thread = (i: number) => ease(b.f, b.ck(2, 4) + i * 5, 20, EASE.inOut);
  const pin = ease(b.f, b.ck(2, 6), 12, EASE.out);
  return (
    <>
      <MapSheet pos={MAP_C} size={MAP_SIZE} />
      <MapHouse pos={HOME} s={0.9} danger={pin} />
      <Stranger pos={[-0.72, 0, 1.2]} yaw={2.5} s={1.05} k={ease(b.f, b.ck(2, 2), 12, EASE.out)} />
      {POSTS.map((p, i) => {
        const k = ease(b.f, b.ck(2, 3) + i * 3, 12, EASE.out);
        const at = floatAt(i);
        const spot = mapPoint(MAP_C, MAP_SIZE, p.spot, 0.02);
        return (
          <React.Fragment key={p.kind}>
            <PhotoCard pos={lerp3([at[0], 0.1, at[2]], at, k)} kind={p.kind} scale={0.9} k={k} rot={[-0.35, 0, 0]} edge="#ff8a94" edgeGlow={thread(i) * 0.6} />
            <CallLine from={[at[0], at[1] - 0.25, at[2]]} to={spot} f={b.f} grow={thread(i)} lift={0.25} color={RED} radius={0.014} />
            {p.spot !== "home" && <GroundRing pos={spot} radius={0.13} k={ease(b.f, b.ck(2, 4) + i * 5 + 16, 8, EASE.out)} color={RED} />}
          </React.Fragment>
        );
      })}
      <Pin pos={[HOME[0], 0.32, HOME[2]]} k={pin} f={b.f} color={RED} size={0.42} />
      <GroundRing pos={[HOME[0], 0.01, HOME[2]]} radius={0.42} k={ease(b.f, b.ck(2, 8), 14, EASE.out)} color={RED} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (inMap(b)) return <MapBeat b={b} />;
  if (inGrid(b)) return <GridBeat b={b} />;
  return <PostBeat b={b} />;
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  if (inMap(b))
    return (
      <>
        <Layer x={SAFE_CX} y={545} k={span(b.f, b.ln(2), b.ck(2, 6))}>
          <Chip text="住所は書いていない" size={48} accent={COL.white} />
        </Layer>
        <Layer x={SAFE_CX} y={560} k={reveal(b.f, b.ck(2, 6))}>
          <Headline text="生活圏が分かる" size={80} f={b.f} at={b.ck(2, 6)} tone="red" />
        </Layer>
      </>
    );
  if (inGrid(b))
    return (
      <>
        {POSTS.map((p) => (
          <At key={p.kind} shot={shot} p={[p.at[0], p.at[1] - 0.52, p.at[2] + 0.3]} k={span(b.f, b.ck(1, p.chunk) + 4, b.ck(1, 9))}>
            <Chip text={p.label} size={40} accent={COL.red} />
          </At>
        ))}
        <Layer x={SAFE_CX} y={545} k={reveal(b.f, b.ck(1, 9))}>
          <Headline text="手掛かりになる" size={74} f={b.f} at={b.ck(1, 9)} tone="red" />
        </Layer>
      </>
    );
  return (
    <>
      <At shot={shot} p={[-0.62, 1.6, 0.2]} k={reveal(b.f, b.ck(0, 3))}>
        <Chip text="顔" size={46} accent={COL.cyan} mark="ok" />
      </At>
      <At shot={shot} p={[0.62, 1.6, 0.2]} k={reveal(b.f, b.ck(0, 3) + 4)}>
        <Chip text="声" size={46} accent={COL.pink} mark="ok" />
      </At>
      <Layer x={SAFE_CX} y={560} k={reveal(b.f, b.ck(0, 4))}>
        <Headline text="顔と声だけじゃない" size={72} f={b.f} at={b.ck(0, 4)} tone="light" />
      </Layer>
    </>
  );
};

export const PLACE: SceneDefP = {
  topic: "写真から居場所が分かる",
  shot,
  World,
  Overlay,
  light: () => LAB_LIGHT,
  grade: (b) => ({ danger: inMap(b) ? 0.18 * ease(b.f, b.ck(2, 6), 14) : 0 }),
  dipIn: true,
  dipLines: [1, 2],
};
