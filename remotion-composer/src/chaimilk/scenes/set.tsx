import React from "react";
import { add3, V3 } from "../core";
import { CupPose, teaSurface } from "../../golden2/three/models";
import { Steam } from "../../paradise/three/fx";
import { BURNER_TOP, MilkCup } from "../../royalmilk/three/kitchen";
import { LIQUID } from "../../royalmilk/three/liquid";
import { CHAI, Kulhad, KulhadPose, kulhadSurface } from "../three/parts";

// One café counter for the whole reel. The two drinks stand staggered in depth (9:16 is too narrow for a row):
// milk tea in a white cup front left, chai in a clay kulhad back right.
export const MILK_CUP: CupPose = { pos: [-0.48, 0, 0.5], scale: 0.8, yaw: Math.PI + 0.45 };
export const CHAI_CUP: KulhadPose = { pos: [0.55, 0, -0.5], scale: 0.9 };
export const CUP_FILL = 0.78;
export const KULHAD_FILL = 0.94;

export const MILK_DONE = { from: LIQUID.tea, to: LIQUID.milkTea, spread: 1, mix: 0.9 };
export const CHAI_DONE = { from: CHAI.done, to: CHAI.done, spread: 0, mix: 1, glow: 0.1 };

export const MILK_TOP = teaSurface(MILK_CUP, CUP_FILL);
export const CHAI_TOP = kulhadSurface(CHAI_CUP, KULHAD_FILL);
export const MID: V3 = [(MILK_TOP[0] + CHAI_TOP[0]) / 2, 0.6, (MILK_TOP[2] + CHAI_TOP[2]) / 2];

/** The two finished drinks with steam (hook, core, outro). */
export const TwoDrinks: React.FC<{ f: number; milkOffset?: V3; chaiOffset?: V3 }> = ({ f, milkOffset = [0, 0, 0], chaiOffset = [0, 0, 0] }) => {
  const milk = { ...MILK_CUP, pos: add3(MILK_CUP.pos, milkOffset) };
  const chai = { ...CHAI_CUP, pos: add3(CHAI_CUP.pos, chaiOffset) };
  return (
    <>
      <MilkCup pose={milk} fill={CUP_FILL} s={{ ...MILK_DONE, swirl: 2 + f * 0.01 }} />
      <Kulhad pose={chai} fill={KULHAD_FILL} s={CHAI_DONE} swirl={f * 0.006} />
      <Steam base={teaSurface(milk, CUP_FILL)} f={f} width={0.3} opacity={1.0} seed={3} />
      <Steam base={kulhadSurface(chai, KULHAD_FILL)} f={f + 30} width={0.3} opacity={1.0} seed={6} />
    </>
  );
};

// The stove for the chai and masala scenes.
export const BURNER: V3 = [0, 0, 0];
export const PAN: V3 = [0, BURNER_TOP, 0];
