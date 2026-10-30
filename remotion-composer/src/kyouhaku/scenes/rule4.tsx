import React, { useMemo } from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, lerpShot2, Shot2 } from "../../golden2/shot";
import { Chip, Layer, SAFE_CX, StepPill } from "../overlays";
import { faceTo, Figure } from "../three/figures";
import { GroundRing, Phone, PhotoCard, ringPositions, SAFE_TEAL, THREAT_RED, Watcher } from "../three/props";
import { NIGHT } from "../three/room";
import { SceneDefP } from "../types";
import { BED_CAM, DAD_BED, HAND_PHONE, HERO, HERO_CAM, MOM_SIT, RING_C, RING_CAM } from "./cams";
import { TeenOnBed } from "./cast";
import { screenAt, span } from "./util";

// L0 on the bed, mom leans in to look at the child's phone with them; (dip at 写真の公開範囲) the floating
// settings screen flips 全体に公開 → 友達のみ. L1 (dip) the park photo stands in a ring of grey watchers; the
// outer ring (with red strangers) sinks away and only a small teal circle of friends and family is left.
const isSettings = (b: Beat) => b.f >= b.ck(0, 2) - 4 && b.f < b.ln(1) - 4;
const isRing = (b: Beat) => b.f >= b.ln(1) - 4;

const shot = (b: Beat): Shot2 => {
  if (isRing(b)) {
    const orbit: Shot2 = { ...RING_CAM, pos: [RING_CAM.pos[0] + 0.9, RING_CAM.pos[1] - 0.1, RING_CAM.pos[2] + 0.2] };
    return breathe(lerpShot2(RING_CAM, orbit, ease(b.f, b.ln(1), b.dur - b.ln(1), EASE.inOut)), b.f, 0.02);
  }
  return isSettings(b) ? breathe(HERO_CAM, b.f) : breathe(BED_CAM, b.f, 0.025);
};

const OUTER = 14;
const STRANGERS = new Set([1, 5, 9, 12]);

const Ring: React.FC<{ b: Beat }> = ({ b }) => {
  const outer = useMemo(() => ringPositions(RING_C, 0.62, OUTER, 31), []);
  const inner = useMemo(() => ringPositions(RING_C, 0.34, 4, 7), []);
  const shrink = b.ck(1, 1);
  return (
    <>
      <PhotoCard pos={[RING_C[0], 0.36, RING_C[2]]} k={1} kind="ordinary" scale={1.05} rot={[-0.1, -0.35, 0]} />
      {outer.map((p, i) => {
        const stranger = STRANGERS.has(i);
        const goneAt = (stranger ? b.ck(1, 3) : shrink) + (i % 5) * 3;
        const k = ease(b.f, b.ln(1) - 4 + (i % 7) * 2, 10, EASE.out) * (1 - ease(b.f, goneAt, 12, EASE.in));
        return <Watcher key={i} pos={p} k={k} color={stranger ? THREAT_RED : "#8d93a0"} yaw={faceTo(p, RING_C)} />;
      })}
      {inner.map((p, i) => (
        <Watcher key={`in${i}`} pos={p} k={ease(b.f, shrink + 6 + i * 3, 12, EASE.out)} color={SAFE_TEAL} yaw={faceTo(p, RING_C)} />
      ))}
      <GroundRing pos={[RING_C[0], -0.06, RING_C[2]]} radius={0.48} k={ease(b.f, shrink + 4, 16, EASE.out)} />
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (isRing(b)) return <Ring b={b} />;
  if (isSettings(b)) {
    const s = screenAt(b.f, [
      [0, "privacyAll"],
      [b.ck(0, 3), "privacyFriends"],
    ]);
    return <Phone pos={HERO} h={1.5} {...s} glow={0.3 + 0.3 * ease(b.f, b.ck(0, 3), 8)} glowColor={SAFE_TEAL} f={b.f} />;
  }
  return (
    <>
      <TeenOnBed f={b.f} screen="privacyAll" phoneGlow={0.2} pose={{ headPitch: 0.4 }} />
      <Figure kind="mom" pose={{ pos: MOM_SIT, sit: 1, yaw: -0.5, lean: 0.25, headPitch: 0.45, headYaw: -0.3 }} />
      <Figure kind="dad" pose={{ pos: DAD_BED, yaw: faceTo(DAD_BED, HAND_PHONE), headPitch: 0.35, lean: 0.1 }} />
    </>
  );
};

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={isSettings(b) ? 530 : 560} k={span(b.f, b.ck(0, 0), b.ln(1) - 6)}>
      <StepPill n={4} text="写真の公開範囲を 見直す" size={48} />
    </Layer>
    <Layer x={SAFE_CX} y={560} k={span(b.f, b.ck(1, 0))}>
      <Chip text="見られる相手を絞る" size={50} accent="#16b8a4" />
    </Layer>
    <Layer x={SAFE_CX} y={1335} k={span(b.f, b.ck(1, 5))}>
      <Chip text="知らない人に渡りにくく" size={48} accent="#16b8a4" mark="ok" />
    </Layer>
  </>
);

export const RULE4: SceneDefP = {
  topic: "写真の公開範囲",
  shot,
  World,
  Overlay,
  light: () => ({ ...NIGHT, hall: 0.9 }),
  room: () => ({ door: 1 }),
  dipIn: true,
  dipLines: [1],
  dipChunks: [[0, 2]],
};
