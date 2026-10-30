import React from "react";
import { add3, Beat, lerp3, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Sparkles } from "../../paradise/three/fx";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { COOKIE_ACCENT, PopChip, Swatch, TEA_ACCENT } from "../labels";
import { Crumbs, OilBeads, Scent } from "../three/cookie";
import { BITE1, BITE2, CookiePlate, HERO_REST, HERO_TOP, TEA_TOP, TeaCup } from "./set";
import { OIL_CLOUD } from "./tannin";
import { SceneDefP } from "../types";

// Line 4: the cup and the floating oil cluster in one picture; the tea glows at 「紅茶の渋み」.
// Line 5: amber scent ribbons rise from the tea and wind through the cluster; the beads shrink away one by
// one (和らげる). Then the camera eases to the bitten cookie, which takes a second bite (次の一口も) and glints.
const BOTH: Shot2 = { pos: [0.15, 2.7, 5.9], target: [0.05, 0.85, 0.05], fov: 30, focus: [0, 0.7, 0.1], aperture: 6 };
const BOTH_UP: Shot2 = { pos: [0.15, 3.0, 5.9], target: [0.08, 1.05, 0.0], fov: 30, focus: [0, 0.9, 0], aperture: 6 };
const COOKIE_IN: Shot2 = { pos: [0.68, 2.2, 3.2], target: [0.51, 0.32, -0.4], fov: 30, focus: HERO_TOP, aperture: 7 };

/** The oil cluster drifts over the cup during line 4 so the tea's scent can rise straight through it. */
const OVER_CUP: V3 = add3(TEA_TOP, [0.08, 0.72, 0]);

const shibumiShot = (b: Beat): Shot2 =>
  breathe(keys2(b.f, [[0, BOTH], [b.ck(1, 0), BOTH_UP, 80], [b.ck(1, 5) - 8, COOKIE_IN, 34]]), b.f);

const secondBite = (b: Beat) => b.ck(1, 5) + 14;

const ShibumiWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const glow = ease(f, b.ck(0, 1) - 2, 14, EASE.out) * (1 - 0.5 * ease(f, b.ck(1, 5), 20));
  const ribbons = ease(f, b.ck(1, 1) - 6, 50, EASE.out) * (1 - ease(f, b.ck(1, 5) - 6, 16, EASE.in));
  const dissolve = ease(f, b.ck(1, 3), b.ck(1, 5) - b.ck(1, 3), EASE.inOut);
  const bite = secondBite(b);
  const cloud: V3 = lerp3(OIL_CLOUD, OVER_CUP, ease(f, b.ck(0, 0), b.ln(1) - b.ck(0, 0), EASE.inOut));
  return (
    <>
      <TeaCup f={f} glow={glow} />
      <CookiePlate bites={f >= bite ? [BITE1, BITE2] : [BITE1]} />
      <OilBeads from={HERO_TOP} fromRadius={0.3} cloud={cloud} spread={0.28} f={f} appear={1} lift={1} dissolve={dissolve} />
      <Scent from={add3(TEA_TOP, [0, 0.03, 0])} f={f} colors={["#f0a04b", "#ffd28a", "#e07a2a"]} grow={ribbons} intensity={0.34} height={1.05} radius={0.24} seed={5} />
      <Sparkles center={cloud} f={f - b.ck(1, 4)} mode="burst" count={12} radius={0.45} size={0.045} seed={41} color="#ffe2b0" intensity={1.8} />
      <Crumbs at={add3(HERO_REST.pos, [0.25, 0.06, 0.18])} t={f - bite} floor={0.04} seed={9} />
      <Sparkles center={add3(HERO_TOP, [0, 0.25, 0])} f={f - b.ck(1, 6)} mode="burst" count={14} radius={0.4} size={0.045} seed={44} color="#fff0c8" intensity={2.2} />
    </>
  );
};

const ShibumiOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  return (
    <>
      <Layer x={SAFE_CX} y={590} k={reveal(f, b.ck(0, 1) - 2, b.ck(1, 4) - 6)}>
        <Headline text="紅茶の渋み" size={104} f={f} at={b.ck(0, 1) - 2} sweepAt={b.ck(0, 1) + 14} />
      </Layer>
      <Layer x={SAFE_CX} y={600} k={reveal(f, b.ck(1, 4) - 2, b.ck(1, 5) - 6)} rise={0}>
        <PopChip f={f} at={b.ck(1, 4) - 2} text="脂っぽさを和らげる" accent={TEA_ACCENT}>
          <Swatch color={TEA_ACCENT} />
        </PopChip>
      </Layer>
      <Layer x={SAFE_CX} y={1330} k={reveal(f, b.ck(1, 5) + 6)} rise={0}>
        <PopChip f={f} at={b.ck(1, 5) + 6} text="次の一口も おいしく" accent={COOKIE_ACCENT}>
          <Swatch color={COOKIE_ACCENT} />
        </PopChip>
      </Layer>
    </>
  );
};

export const SHIBUMI: SceneDefP = { topic: "渋みが脂っぽさを和らげる", shot: shibumiShot, World: ShibumiWorld, Overlay: ShibumiOverlay, dipIn: true, bloom: () => 0.32 };
