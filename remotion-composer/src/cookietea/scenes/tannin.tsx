import React from "react";
import { add3, Beat, lerp, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { OIL_ACCENT, PopChip, Swatch, TanninIcon, TEA_ACCENT } from "../labels";
import { Butter, Crumbs, OilBeads } from "../three/cookie";
import { BITE1, CookiePlate, HERO_REST, HERO_TOP, PLATE_POS, TEA_TOP, TeaCup } from "./set";
import { SceneDefP } from "../types";

// Line 2: close on the cup; the tea slowly turns and glows amber (紅茶に含まれる), glints at 「タンニン」.
// Line 3 (new set through the flash): the plate; butter slides in (バターなどの), golden oil beads up on the
// cookie (油分が), the cookie is bitten (食べた後), and the beads lift into a floating cluster (口の中に脂っぽさ).
export const OIL_CLOUD: V3 = add3(HERO_TOP, [-0.05, 0.55, 0.2]);
const BUTTER_IN: V3 = [1.22, 0, 0.05];
const BUTTER_OUT: V3 = [2.6, 0, 0.3];

const CUP_SHOT: Shot2 = { pos: [-0.25, 2.95, 4.4], target: [TEA_TOP[0], 0.45, TEA_TOP[2]], fov: 30, focus: TEA_TOP, aperture: 7 };
const CUP_IN: Shot2 = { pos: [-0.3, 2.7, 3.8], target: [TEA_TOP[0], 0.45, TEA_TOP[2]], fov: 30, focus: TEA_TOP, aperture: 7 };
const PLATE_SHOT: Shot2 = { pos: [0.68, 2.3, 3.4], target: [0.55, 0.3, -0.38], fov: 30, focus: HERO_TOP, aperture: 7 };
const PLATE_UP: Shot2 = { pos: [0.68, 2.5, 3.7], target: [0.53, 0.5, -0.33], fov: 30, focus: add3(HERO_TOP, [0, 0.4, 0]), aperture: 6 };

const tanninShot = (b: Beat): Shot2 => {
  if (b.f < b.ln(1) - 4) return breathe(keys2(b.f, [[0, CUP_SHOT], [b.ck(0, 1), CUP_IN, 70]]), b.f);
  return breathe(keys2(b.f, [[0, PLATE_SHOT], [b.ck(1, 5), PLATE_UP, 50]]), b.f);
};

export const biteAt = (b: Beat) => b.ck(1, 4) + 4;

const TanninWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  if (f < b.ln(1) - 4) {
    const glow = ease(f, b.ck(0, 1) - 2, 20, EASE.out) * 0.8;
    return (
      <>
        <TeaCup f={f} glow={glow} ripple={{ t: (f - b.ck(0, 1)) / 30, amp: 0.05 }} />
        <Sparkles center={add3(TEA_TOP, [0, 0.25, 0])} f={f - b.ck(0, 2)} mode="burst" count={14} radius={0.4} size={0.045} seed={22} color="#ffd28a" intensity={2.2} />
      </>
    );
  }
  const butter = ease(f, b.ck(1, 1) - 6, 16, EASE.out);
  const bite = biteAt(b);
  return (
    <>
      <TeaCup f={f} />
      <CookiePlate bites={f >= bite ? [BITE1] : []} />
      <Butter pos={[lerp(BUTTER_OUT[0], BUTTER_IN[0], butter), 0, lerp(BUTTER_OUT[2], BUTTER_IN[2], butter)]} yaw={-0.4} scale={0.8} />
      <Crumbs at={add3(HERO_REST.pos, [0.12, 0.06, 0.3])} t={f - bite} floor={0.04} />
      <OilBeads
        from={HERO_TOP}
        fromRadius={0.3}
        cloud={OIL_CLOUD}
        spread={0.28}
        f={f}
        appear={ease(f, b.ck(1, 2) - 2, 22, EASE.out)}
        lift={ease(f, b.ck(1, 5) - 4, 36, EASE.inOut)}
      />
    </>
  );
};

const TanninOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const out = b.ln(1) - 6;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 0) - 2, out)}>
        <Headline text="① タンニン" size={104} f={f} at={b.ck(0, 0) - 2} sweepAt={b.ck(0, 2)} />
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(0, 2) - 2, out)} rise={0}>
        <PopChip f={f} at={b.ck(0, 2) - 2} text="渋みのもと" accent={TEA_ACCENT}>
          <TanninIcon size={70} />
        </PopChip>
      </Layer>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(1, 1) - 2, b.ck(1, 5) - 4)} rise={0}>
        <PopChip f={f} at={b.ck(1, 1) - 2} text="バター ＝ 油分" accent={OIL_ACCENT}>
          <Swatch color={OIL_ACCENT} />
        </PopChip>
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 6) - 2)} rise={0}>
        <PopChip f={f} at={b.ck(1, 6) - 2} text="口に残る 脂っぽさ" accent={OIL_ACCENT}>
          <Swatch color={OIL_ACCENT} />
        </PopChip>
      </Layer>
    </>
  );
};

export const TANNIN: SceneDefP = {
  topic: "理由① タンニン",
  shot: tanninShot,
  World: TanninWorld,
  Overlay: TanninOverlay,
  dipIn: true,
  dipLines: [1],
  bloom: () => 0.32,
};
