import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, interpolate, Loop, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { sec } from "../koucha/anim";
import { H, W } from "../koucha/theme";
import { Beat, beatFor, sceneAt, TL } from "../golden/core";
import { dipSfx, SFX2, sfxFrame2 } from "./cues";
import { Band, Subtitle } from "./overlays";
import { SCENES2 } from "./scenes";
import { ease, EASE, focusDistance, Shot2 } from "./shot";
import { Look, Post } from "./three/post";
import { Cam, DEFAULT_LIGHTING, Stage } from "./three/stage";
import { SceneDef2 } from "./types";

const DIP_IN = 7;
const DIP_OUT = 13;

/** Global frames where the picture changes set through a warm-gold dip. */
export const DIPS: number[] = TL.scenes.flatMap((s) => [
  ...(SCENES2[s.id].dipIn ? [sec(s.start)] : []),
  ...(SCENES2[s.id].dipLines ?? []).map((li) => sec(s.start) + sec(s.lines[li].start) - 4),
]);

/** Dip strength (0..1): rises into the cut, falls away after it. */
const dipAt = (frame: number) =>
  DIPS.reduce((acc, at) => {
    if (frame < at - DIP_IN || frame > at + DIP_OUT) return acc;
    const k = frame < at ? ease(frame, at - DIP_IN, DIP_IN, EASE.in) : 1 - ease(frame, at, DIP_OUT, EASE.out);
    return Math.max(acc, k);
  }, 0);

const lookFor = (def: SceneDef2, b: Beat, shot: Shot2, frame: number): Look => {
  const dip = dipAt(frame);
  return {
    focus: focusDistance(shot),
    aperture: shot.aperture ?? 0,
    bloom: (def.bloom?.(b) ?? 0.35) + dip * 1.0,
    exposure: 1 + dip * 0.8,
    flash: dip * 0.85,
  };
};

const World: React.FC<{ def: SceneDef2; b: Beat; shot: Shot2; frame: number }> = ({ def, b, shot, frame }) => {
  const Scene = def.World;
  return (
    <>
      <Stage f={frame} light={def.light?.(b) ?? DEFAULT_LIGHTING} />
      <Cam shot={shot} />
      <Scene b={b} />
      <Post look={lookFor(def, b, shot, frame)} frame={frame} />
    </>
  );
};

export const GoldenDrop2: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const def = SCENES2[scene.id];
  const b = beatFor(scene, frame);
  const shot = def.shot(b);
  const end = TL.durationInFrames;
  const fadeOut = interpolate(frame, [end - 45, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const black = interpolate(frame, [end - 16, end - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Overlay = def.Overlay;
  return (
    <AbsoluteFill style={{ background: "#120804" }}>
      <ThreeCanvas
        width={W}
        height={H}
        dpr={1}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        camera={{ fov: 32, position: [0, 2, 6], near: 0.05, far: 60 }}
      >
        <World def={def} b={b} shot={shot} frame={frame} />
      </ThreeCanvas>
      {Overlay && (
        <AbsoluteFill>
          <Overlay b={b} shot={shot} />
        </AbsoluteFill>
      )}
      <Band frame={frame} scenes={SCENES2} />
      <Subtitle frame={frame} />
      <AbsoluteFill style={{ background: "#000", opacity: black, pointerEvents: "none" }} />
      <Audio src={staticFile("golden/narration.wav")} />
      <Loop durationInFrames={sec(22)}>
        <Audio src={staticFile("golden/bgm.mp3")} volume={() => 0.09 * fadeOut} />
      </Loop>
      {dipSfx(DIPS).map(([at, name, vol]) => (
        <Sequence key={`dip${at}`} from={Math.max(0, at)} durationInFrames={sec(0.8)}>
          <Audio src={staticFile(`golden/${name}.mp3`)} volume={vol} />
        </Sequence>
      ))}
      {SFX2.map((e, i) => (
        <Sequence key={i} from={Math.max(0, sfxFrame2(e))} durationInFrames={sec(e[6] ?? 1.3)}>
          <Audio src={staticFile(`golden/${e[4]}.mp3`)} volume={e[5]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
