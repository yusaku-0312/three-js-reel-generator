import React, { useMemo } from "react";
import * as THREE from "three";
import { add3, Beat, lerp, lerp3, lin, V3 } from "../../golden/core";
import { UnionJack } from "../../golden/overlays";
import { Chip, Layer, Note, reveal, SAFE_CX, SERIF } from "../overlays";
import { breathe, ease, EASE, keys2, Shot2 } from "../shot";
import { Glow, Sparkles, Steam } from "../three/fx";
import { Drop, DropLight, Splash } from "../three/liquid";
import { Cup, CupPose, PotPose, spoutLip, Teapot, teaRadius, teaSurface } from "../three/models";
import { DEFAULT_LIGHTING, Lighting } from "../three/stage";
import { placeCardTexture } from "../three/textures";
import { SceneDef2 } from "../types";

// A small tea party: the guest of honour's cup (front) gets the golden drop.
const GUEST: CupPose = { pos: [0, 0, 0.85], scale: 0.8, yaw: -0.4 };
const OTHERS: CupPose[] = [
  { pos: [-1.05, 0, -0.75], scale: 0.8, yaw: 0.3 },
  { pos: [1.05, 0, -0.8], scale: 0.8, yaw: -0.9 },
];
const FILL = 0.55;
const SURFACE = teaSurface(GUEST, FILL);
const POUR_TIP: V3 = [0.03, 1.36, 0.86];
const OFF_TIP: V3 = [2.6, 2.6, 0.9];
const CARD_AT: V3 = [0, 0, 2.0];
const FALL = 30;
const SLOW = 0.4;

const tipAt = (b: Beat) => lerp3(OFF_TIP, POUR_TIP, ease(b.f, b.ck(0, 1) - 6, 32, EASE.cam));
const pose = (b: Beat): PotPose => ({ tip: tipAt(b), tilt: lerp(0.2, 0.62, ease(b.f, b.ck(0, 1), 30)), scale: 0.62, yaw: -0.5 });
const DROP = 0.045;

/** Light pool narrows onto the guest's cup as the narration names them. */
const guestLight = (b: Beat): Lighting => {
  const k = ease(b.f, b.ck(0, 2) - 4, 34, EASE.inOut);
  return {
    keyAt: lerp3(DEFAULT_LIGHTING.keyAt, add3(GUEST.pos, [0, 0.35, 0.25]), k),
    keyAngle: lerp(DEFAULT_LIGHTING.keyAngle, 0.2, k),
    key: lerp(DEFAULT_LIGHTING.key, 4.4, k),
    fill: lerp(DEFAULT_LIGHTING.fill, 0.16, k),
    rim: lerp(DEFAULT_LIGHTING.rim, 1.1, k),
    bokeh: lerp(DEFAULT_LIGHTING.bokeh, 0.9, k),
  };
};

const guestShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.4, 3.4, 6.8], target: [0, 0.45, 0.1], fov: 33, focus: [0, 0.4, 0], aperture: 4 }],
      [b.ck(0, 1), { pos: [0.35, 2.9, 6.4], target: [0, 0.3, 1.25], fov: 33, focus: SURFACE, aperture: 7 }, 54],
      [b.ck(0, 3) - 6, { pos: [0.25, 3.05, 4.4], target: [0, 0.8, 0.9], fov: 33, focus: SURFACE, aperture: 9 }, 28],
      [b.ck(0, 4), { pos: [0.75, 2.95, 4.7], target: [0, 0.7, 0.9], fov: 33, focus: SURFACE, aperture: 8 }, 70],
    ]),
    b.f,
  );

/** Folded tent card in front of the guest's cup. */
const PlaceCard: React.FC<{ k: number }> = ({ k }) => {
  const front = useMemo(
    () => new THREE.MeshStandardMaterial({ map: placeCardTexture(SERIF), roughness: 0.55 }),
    [],
  );
  if (k <= 0.001) return null;
  const h = 0.3;
  const lean = 0.32;
  return (
    <group position={CARD_AT} rotation-y={0.05} scale={[1, k, 1]}>
      <mesh position={[0, (h / 2) * Math.cos(lean), (h / 2) * Math.sin(lean)]} rotation-x={-lean} material={front} castShadow>
        <planeGeometry args={[0.66, h]} />
      </mesh>
      <mesh position={[0, (h / 2) * Math.cos(lean), -(h / 2) * Math.sin(lean)]} rotation-x={lean} castShadow>
        <planeGeometry args={[0.66, h]} />
        <meshStandardMaterial color="#f4ead6" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const GuestWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const fallStart = b.ck(0, 3);
  const lip = spoutLip(pose(b));
  const hang = add3(lip, [0, -DROP * 0.9, 0]);
  const t = lin(f, fallStart, FALL);
  const landed = f >= fallStart + FALL;
  const since = f - fallStart - FALL;
  const dropPos: V3 = [lerp(hang[0], SURFACE[0], t), lerp(hang[1], SURFACE[1] + 0.02, t * t), lerp(hang[2], SURFACE[2], t)];
  const gold = ease(f, b.ck(0, 1) + 14, 20);
  const glow = landed ? 0.5 + 0.06 * Math.sin(f / 8) + 0.8 * Math.exp(-since / 14) : 0;
  return (
    <>
      {OTHERS.map((c, i) => (
        <React.Fragment key={i}>
          <Cup pose={c} fill={FILL} />
          <Steam base={teaSurface(c, FILL)} f={f + i * 77} opacity={0.4} seed={i + 2} />
        </React.Fragment>
      ))}
      <Cup pose={GUEST} fill={FILL} glow={glow} ripple={{ t: landed ? (since / 30) * SLOW + 0.02 : -1, amp: 0.03 }} />
      <PlaceCard k={ease(f, b.ck(0, 2) + 4, 14, EASE.out)} />
      <Teapot pose={pose(b)} />
      {!landed && (
        <Drop
          pos={dropPos}
          size={DROP * ease(f, b.ck(0, 1) + 10, 20, EASE.out)}
          shape={f >= fallStart ? 0.75 : 0.6}
          stretch={f >= fallStart ? 1.15 : 1 + 0.04 * Math.sin(f / 4)}
          gold={gold}
        />
      )}
      <DropLight pos={landed ? add3(SURFACE, [0, 0.12, 0]) : dropPos} intensity={landed ? 0.3 * glow : gold * 0.35} />
      {!landed && <Glow pos={dropPos} size={DROP * 5} intensity={gold * 0.55} />}
      <Splash center={SURFACE} t={(since / 30) * SLOW} size={DROP * 0.85} gold={1} />
      {landed && <Sparkles center={SURFACE} f={since} mode="burst" radius={0.55} count={14} size={0.045} seed={15} intensity={2.4} />}
      {landed && <Glow pos={add3(SURFACE, [0, 0.04, 0])} size={teaRadius(GUEST, FILL) * 2.6} intensity={0.15 * glow} />}
      <Steam base={SURFACE} f={f + 40} opacity={0.45} seed={9} />
    </>
  );
};

const GuestOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(0, 0), b.ck(0, 2) - 6)}>
        <Chip text="イギリスでは" size={54}>
          <UnionJack w={96} />
        </Chip>
      </Layer>
      <Layer x={SAFE_CX} y={548} k={reveal(f, b.ck(0, 2) + 2, b.ck(0, 3) - 10)}>
        <Chip text="大切なお客さまのカップへ" size={46} />
      </Layer>
      <Layer x={760} y={1385} k={reveal(f, b.ck(0, 4))}>
        <Note text="※諸説あり" size={32} />
      </Layer>
    </>
  );
};

export const GUEST_SCENE: SceneDef2 = {
  topic: "イギリスの習慣",
  shot: guestShot,
  World: GuestWorld,
  Overlay: GuestOverlay,
  light: guestLight,
  dipIn: true,
};
