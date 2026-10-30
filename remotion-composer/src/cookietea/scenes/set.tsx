import React from "react";
import { add3, V3 } from "../core";
import { Cup, CupPose, Ripple, teaSurface } from "../../golden2/three/models";
import { Glow, Steam } from "../../paradise/three/fx";
import { Bite, Cookie, CookiePose, flatCookie, Plate, PLATE_TOP } from "../three/cookie";

// One café counter for the whole reel: the white cup of tea front left, the plate of butter cookies back
// right, staggered in depth (9:16 is too narrow for a row). The top cookie on the pile is the hero that
// gets bitten and dunked.
export const CUP: CupPose = { pos: [-0.4, 0, 0.45], scale: 0.8, yaw: Math.PI + 0.45 };
export const CUP_FILL = 0.8;
export const TEA_TOP = teaSurface(CUP, CUP_FILL);

export const PLATE_POS: V3 = [0.45, 0, -0.5];
export const PLATE_SCALE = 0.85;
const ON_PLATE = PLATE_POS[1] + PLATE_TOP * PLATE_SCALE;

const PILE: CookiePose[] = [
  flatCookie([0.25, ON_PLATE, -0.37], 0.3),
  flatCookie([0.69, ON_PLATE + 0.012, -0.65], 1.2, 0.08),
];
/** Hero cookie resting on top of the pile. */
export const HERO_REST = flatCookie([0.43, ON_PLATE + 0.075, -0.47], -0.4, 0.12);
export const HERO_TOP: V3 = add3(HERO_REST.pos, [0, 0.06, 0]);

/** Bites as seen from the camera side of the counter (front right of the cookie). */
export const BITE1: Bite = { a: -1.1, r: 0.16 };
export const BITE2: Bite = { a: -0.35, r: 0.15 };

/** Tea in the cup, steam, and an optional amber glow on the surface. */
export const TeaCup: React.FC<{ f: number; glow?: number; ripple?: Ripple; steam?: number; children?: React.ReactNode }> = ({
  f,
  glow = 0,
  ripple,
  steam = 1,
  children,
}) => (
  <>
    <Cup pose={CUP} fill={CUP_FILL} glow={glow} ripple={ripple}>
      {children}
    </Cup>
    <Steam base={TEA_TOP} f={f} width={0.3} opacity={steam} seed={3} />
    <Glow pos={add3(TEA_TOP, [0, 0.12, 0])} size={1.0} color="#ffb04a" intensity={glow * 0.55} />
  </>
);

/** The plate with its pile; `hero` overrides the top cookie (null = it has left the plate). */
export const CookiePlate: React.FC<{ hero?: CookiePose | null; bites?: Bite[]; glow?: number }> = ({ hero = HERO_REST, bites = [], glow = 0 }) => (
  <>
    <Plate pos={PLATE_POS} scale={PLATE_SCALE} />
    {PILE.map((p, i) => (
      <Cookie key={i} pose={p} glow={glow} />
    ))}
    {hero && <Cookie pose={hero} bites={bites} glow={glow} />}
  </>
);

export const PAIR_WIDE = { pos: [0, 3.0, 8.2] as V3, target: [0.08, 0.4, 0] as V3, fov: 30, focus: [0, 0.4, 0] as V3, aperture: 5 };
