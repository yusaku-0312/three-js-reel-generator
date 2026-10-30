import React from "react";
import { ramp } from "../../koucha/anim";
import { C, FONT } from "../../koucha/theme";
import { add3, Beat, drift, lerp, lerp3, lin, Shot, shotKeys, V3 } from "../core";
import { appear, At, Pill, UnionJack } from "../overlays";
import { Crown } from "../three/crown";
import { Drop, Glow, Ripples, Sparkles, Splash, Steam } from "../three/fx";
import { Cup, CupPose, PotPose, Teapot, teaRadius, teaSurface } from "../three/models";

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
/** The crown hovers over the guest cup; the drop falls through it. */
const CROWN_AT: V3 = [0, 0.95, 0.82];
const FALL = 30;

const tipAt = (b: Beat) => lerp3(OFF_TIP, POUR_TIP, ramp(b.f, b.ck(0, 1) - 6, 30));
const pose = (b: Beat): PotPose => ({ tip: tipAt(b), tilt: lerp(0.2, 0.62, ramp(b.f, b.ck(0, 1), 30)), scale: 0.62, yaw: -0.5 });
const lip = (b: Beat): V3 => add3(tipAt(b), [-0.01, -0.05, 0.01]);

const guestShot = (b: Beat): Shot =>
  drift(
    shotKeys(b.f, [
      [0, { pos: [0.4, 3.4, 6.8], target: [0, 0.45, 0.1], fov: 33 }],
      [b.ck(0, 1), { pos: [0.35, 2.7, 5.6], target: [0, 0.72, 0.75], fov: 33 }, 50],
      [b.ck(0, 3) - 6, { pos: [0.25, 3.15, 4.3], target: [0, 0.82, 0.85], fov: 33 }, 26],
      [b.ck(0, 4), { pos: [0.8, 3.0, 4.6], target: [0, 0.72, 0.85], fov: 34 }, 70],
    ]),
    b.f,
  );

const GuestWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const fallStart = b.ck(0, 3);
  const t = lin(f, fallStart, FALL);
  const landed = f >= fallStart + FALL;
  const since = f - fallStart - FALL;
  const dropPos: V3 = [lerp(lip(b)[0], SURFACE[0], t), lerp(lip(b)[1], SURFACE[1] + 0.02, t * t), lerp(lip(b)[2], SURFACE[2], t)];
  const crownK = ramp(f, b.ck(0, 2), 14);
  const glow = landed ? Math.max(0.6 + 0.1 * Math.sin(f / 8), 1.3 * Math.exp(-since / 14)) : 0;
  return (
    <>
      {OTHERS.map((c, i) => (
        <React.Fragment key={i}>
          <Cup pose={c} fill={FILL} />
          <Steam base={teaSurface(c, FILL)} f={f + i * 77} opacity={0.5} seed={i + 2} />
        </React.Fragment>
      ))}
      <Cup pose={GUEST} fill={FILL} glow={glow} />
      <Teapot pose={pose(b)} />
      {!landed && (
        <Drop
          pos={dropPos}
          size={0.05 * ramp(f, b.ck(0, 1) + 10, 20)}
          shape={lerp(0.55, 1, ramp(f, fallStart, 8))}
          stretch={f >= fallStart ? 1.15 : 1}
          gold={ramp(f, b.ck(0, 1) + 14, 20)}
        />
      )}
      <Crown pos={add3(CROWN_AT, [0, 0.03 * Math.sin(f / 12), 0])} scale={crownK * 0.85} spin={f / 40} />
      {crownK > 0 && <Glow pos={CROWN_AT} size={0.9 * crownK} opacity={0.35} />}
      {crownK > 0 && <Sparkles center={CROWN_AT} f={f - b.ck(0, 2)} mode="burst" radius={0.7} count={16} size={0.09} seed={14} />}
      <Splash center={SURFACE} f={since} scale={0.75} />
      <Ripples center={SURFACE} f={since} maxR={teaRadius(GUEST, FILL) * 0.98} rings={4} />
      {landed && <Sparkles center={SURFACE} f={since} mode="burst" radius={0.8} count={24} size={0.1} seed={15} />}
      {landed && <Sparkles center={SURFACE} f={f} mode="rise" radius={0.4} count={24} size={0.07} seed={16} opacity={ramp(since, 8, 20)} />}
      {landed && <Glow pos={add3(SURFACE, [0, 0.05, 0])} size={1.3} opacity={0.3 * glow} />}
    </>
  );
};

const GuestOverlay: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <At x={500} y={600} k={appear(f, b.ck(0, 0), b.ck(0, 2) - 6)}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <UnionJack w={150} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.cream, WebkitTextStroke: `12px ${C.ink}`, paintOrder: "stroke fill" }}>
            イギリスでは
          </div>
        </div>
      </At>
      <At x={500} y={600} k={appear(f, b.ck(0, 2) + 2)}>
        <Pill text="大切なお客さまのカップ" size={46} />
      </At>
    </>
  );
};

export const GUEST_SCENE = { topic: "イギリスの習慣", shot: guestShot, World: GuestWorld, Overlay: GuestOverlay, wipeIn: true };
