import React from "react";
import { Beat, V3 } from "../core";
import { breathe, keys2, Shot2 } from "../../golden2/shot";
import { Headline, Kicker, Layer, reveal, SAFE_CX } from "../overlays";
import { CompareCard, KURENAI, LEAF_BLACK } from "../labels";
import { LeafHeap, TeaTin } from "../three/props";
import { SceneDefP } from "../types";

// Line 5: an open tea tin labelled BLACK TEA and a spill of black leaves in front; the camera cranes down to
// the leaves (黒っぽい茶葉の見た目から), then a card sets the two names side by side.
const TIN: V3 = [0.35, 0, -0.55];
const SPILL: V3 = [-0.15, 0, 0.65];

const englishShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.0, 3.4, 7.4], target: [0.05, 0.4, 0], fov: 30, focus: TIN, aperture: 5 }],
      [b.ck(0, 1) - 6, { pos: [-0.2, 2.7, 4.8], target: [-0.05, 0.15, 0.3], fov: 30, focus: SPILL, aperture: 7 }, 50],
    ]),
    b.f,
  );

const EnglishWorld: React.FC<{ b: Beat }> = () => (
  <>
    <TeaTin pos={TIN} scale={1} yaw={-Math.PI / 2 - 0.15} />
    <LeafHeap pos={SPILL} radius={0.55} height={0.14} count={240} seed={11} dish={false} />
  </>
);

const EnglishOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const cardAt = b.ck(0, 4) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0) - 2, cardAt - 4)}>
        <Headline text="英語では" size={100} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 0) + 12} />
      </Layer>
      <Layer x={SAFE_CX} y={720} k={reveal(f, b.ck(0, 3) - 3, cardAt - 4)}>
        <Kicker text="BLACK TEA" f={f} at={b.ck(0, 3) - 3} size={64} />
      </Layer>
      <Layer x={SAFE_CX} y={660} k={reveal(f, cardAt)}>
        <CompareCard
          f={f}
          at={cardAt}
          rows={[
            { word: "紅茶", wordColor: KURENAI, from: "お茶の色", dot: KURENAI },
            { word: "Black tea", wordColor: "#f6efe2", from: "茶葉の色", dot: LEAF_BLACK },
          ]}
        />
      </Layer>
    </>
  );
};

export const ENGLISH: SceneDefP = {
  topic: "英語は「葉の色」",
  shot: englishShot,
  World: EnglishWorld,
  Overlay: EnglishOverlay,
  dipIn: true,
  bloom: () => 0.3,
};
