import React from "react";
import { V3 } from "../core";
import { ease, EASE } from "../../golden2/shot";
import { Food, FoodId } from "../three/food";
import { AICore } from "../three/props";
import { HERO } from "./cams";

/** Shared layout of the floating hero shots (intro, step1 L1-2, step2): phone below, the AI above it. */
export const PHONE_AT: V3 = [0, 1.12, HERO[2]];
export const PHONE_H = 0.85;
export const CORE_AT: V3 = [0, 1.98, HERO[2] - 0.1];

export const ORBIT: FoodId[] = ["egg", "tomato", "carrot", "onion", "chicken", "milk"];

/** Ingredients circling the AI; `n` of them visible (each pops in), `pull` 0..1 draws them into the core. */
export const FoodOrbit: React.FC<{ f: number; at: number; n: number; pull?: number; step?: number }> = ({ f, at, n, pull = 0, step = 5 }) => (
  <>
    {ORBIT.slice(0, n).map((id, i) => {
      const k = ease(f, at + i * step, 8, EASE.out);
      if (k <= 0) return null;
      const a = (i / n) * Math.PI * 2 + f / 40;
      const r = 0.46 * (1 - pull);
      const pos: V3 = [CORE_AT[0] + Math.cos(a) * r, CORE_AT[1] + Math.sin(a * 2) * 0.05 - 0.02, CORE_AT[2] + Math.sin(a) * r * 0.6 + 0.1];
      const s = 1.9 * k * (1 - pull * 0.9);
      return <Food key={id} id={id} pos={pos} s={s} rot={[0.3, f / 30 + i, 0]} />;
    })}
  </>
);

export const Core: React.FC<{ f: number; k: number; power?: number }> = ({ f, k, power = 0.6 }) =>
  k <= 0.001 ? null : <AICore pos={CORE_AT} f={f} size={0.2 * k} power={power} />;
