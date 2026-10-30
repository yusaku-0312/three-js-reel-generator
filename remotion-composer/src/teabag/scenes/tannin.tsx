import React from "react";
import { add3, Beat, lerp } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Cup } from "../../golden2/three/models";
import { Sparkles } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX, Stamp } from "../overlays";
import { OK, PopChip, SteepRing, StrikeChip, TANNIN } from "../labels";
import { bagBottom, DarkDrips, dripRipple, DripSpec, TeaBag } from "../three/teabag";
import { SteepDisc } from "../three/steep";
import { CUP, FILL, hang, heldTag, HERO, lifted, restIn, SURFACE, SURFACE_R } from "./set";
import { squeezeAt } from "./hook";
import { SceneDefP } from "../types";

// Line 0 (flash in): the bag squeezed over the cup at 「絞った瞬間に」; the chip 「絞った瞬間に出る」 is struck
// out at 「ありません」. Line 1 (new set through the flash): a fresh cup of pale hot water; a dry bag goes in and
// the tea colour spirals out of it and deepens the whole time (timer ring). Line 2: the bag comes back up, a light
// squeeze, and a teal 「絞るのも OK」 stamp.
const rest = restIn(CUP);
const BAG_UV: [number, number] = [rest.pose.pos[0] / SURFACE_R, -rest.pose.pos[2] / SURFACE_R];

const STEEP_SHOT: Shot2 = { pos: [0.25, 3.4, 6.6], target: [0, 0.35, 0], fov: 30, focus: SURFACE, aperture: 5 };

const tanninShot = (b: Beat): Shot2 => {
  if (b.f < b.ln(1) - 4) return breathe(keys2(b.f, [[0, { ...HERO, pos: [0.3, 3.2, 8.8] }], [0, HERO, 80]]), b.f);
  return breathe(
    keys2(b.f, [
      [0, { ...STEEP_SHOT, pos: [0.25, 3.6, 7.1] }],
      [0, STEEP_SHOT, b.ln(2) - b.ln(1)],
      [b.ln(2), HERO, 40],
    ]),
    b.f,
  );
};

const dipK = (b: Beat) => ease(b.f, b.ln(1) + 2, 18, EASE.inOut);
const liftK = (b: Beat) => ease(b.f, b.ck(2, 0), 18, EASE.inOut);

const TanninWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (f < b.ln(1) - 4) {
    const squeeze = squeezeAt(f, b.ck(0, 2) - 2, 0.85, 18);
    const pose = hang(f, undefined, 1 - 0.6 * squeeze);
    const drip: DripSpec = { from: bagBottom(pose, squeeze), toY: SURFACE[1], start: b.ck(0, 2) + 4, count: 3, every: 8 };
    return (
      <>
        <Cup pose={CUP} fill={FILL} dark={0.2} ripple={dripRipple(f, [drip])} />
        <TeaBag pose={pose} tag={heldTag(pose)} squeeze={squeeze} wet={1} f={f} />
        <DarkDrips f={f} d={drip} />
      </>
    );
  }
  const into = dipK(b);
  const up = liftK(b);
  const bag = up > 0 ? lifted(rest, hang(f).pos, up) : lifted(rest, hang(f).pos, 1 - into);
  const squeeze = squeezeAt(f, b.ck(2, 1), 0.4, 10);
  const steep = ease(f, b.ln(1) + 14, b.ln(2) - b.ln(1) + 10, EASE.inOut) * 0.85;
  const spread = ease(f, b.ln(1) + 12, 80, EASE.out);
  const wet = lerp(0, 1, ease(f, b.ln(1) + 16, 30, EASE.out));
  const drip: DripSpec = { from: bagBottom(bag.pose, squeeze), toY: SURFACE[1], start: b.ck(2, 1) + 4, count: 2, every: 9 };
  return (
    <>
      <Cup pose={CUP} fill={0} />
      <SteepDisc center={SURFACE} radius={SURFACE_R * 0.995} from={BAG_UV} spread={spread} steep={steep} swirl={(f - b.ln(1)) * 0.03} glow={0.14} />
      <TeaBag pose={bag.pose} tag={bag.tag} via={bag.via} squeeze={squeeze} wet={wet} f={f} />
      <DarkDrips f={f} d={drip} />
      <Sparkles center={add3(SURFACE, [BAG_UV[0] * SURFACE_R, 0.12, 0])} f={f - b.ck(1, 1)} mode="orbit" count={12} radius={0.3} size={0.03} seed={41} color="#ffc070" intensity={1.6 * (1 - up)} />
    </>
  );
};

const TanninOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out0 = b.ln(1) - 6;
  const out1 = b.ln(2) - 4;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0) - 2, out0)}>
        <Headline text="タンニンは" size={100} f={f} at={b.ck(0, 0) - 2} />
      </Layer>
      <Layer x={SAFE_CX} y={1340} k={reveal(f, b.ck(0, 2) - 2, out0)} rise={0}>
        <StrikeChip f={f} at={b.ck(0, 2) - 2} strikeAt={b.ck(0, 4) - 2} text="絞った瞬間に 出る" accent={TANNIN} />
      </Layer>
      <Layer x={800} y={1120} k={reveal(f, b.ck(1, 0), out1)} rise={0}>
        <SteepRing f={f} at={b.ck(1, 1) - 4} dur={b.ln(2) - b.ck(1, 1)} caption="浸している間も" size={170} />
      </Layer>
      <Layer x={SAFE_CX} y={1375} k={reveal(f, b.ck(1, 2) - 2, out1)} rise={0}>
        <PopChip f={f} at={b.ck(1, 2) - 2} text="少しずつ 抽出" size={50} accent={TANNIN} />
      </Layer>
      <Layer x={SAFE_CX} y={1360} k={reveal(f, b.ck(2, 1) - 2)} rise={0}>
        <PopChip f={f} at={b.ck(2, 1) - 2} text="絞ること自体は 悪くない" size={50} accent={OK} />
      </Layer>
      <Layer x={810} y={1040} k={reveal(f, b.ck(2, 3) - 2)} rise={0}>
        <div style={{ transform: "scale(0.62)" }}>
          <Stamp f={f} at={b.ck(2, 3) - 2} top="絞るのも" big="OK" color={OK} />
        </div>
      </Layer>
    </>
  );
};

export const TANNIN_SCENE: SceneDefP = {
  topic: "タンニンはいつ出る？",
  shot: tanninShot,
  World: TanninWorld,
  Overlay: TanninOverlay,
  dipIn: true,
  dipLines: [1],
  bloom: () => 0.32,
};
