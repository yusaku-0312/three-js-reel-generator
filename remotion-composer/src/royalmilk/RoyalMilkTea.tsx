import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, interpolate, Loop, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { sec } from "../koucha/anim";
import { H, W } from "../koucha/theme";
import { ease, EASE, focusDistance, Shot2 } from "../golden2/shot";
import { Beat, beatFor, sceneAt, TL } from "./core";
import { SFX, sfxFrame } from "./cues";
import { Band, Subtitle } from "./overlays";
import { SCENES } from "./scenes";
import { Look, Post } from "../paradise/three/post";
import { Cam, DEFAULT_LIGHTING, Stage } from "./three/stage";
import { SceneDefP } from "./types";

const DIP_IN = 6;
const DIP_OUT = 12;

/** Global frames where the picture changes set through a sunlight flash. */
export const DIPS: number[] = TL.scenes.flatMap((s) => [
  ...(SCENES[s.id].dipIn ? [sec(s.start)] : []),
  ...(SCENES[s.id].dipLines ?? []).map((li) => sec(s.start) + sec(s.lines[li].start) - 4),
]);

const dipAt = (frame: number) =>
  DIPS.reduce((acc, at) => {
    if (frame < at - DIP_IN || frame > at + DIP_OUT) return acc;
    const k = frame < at ? ease(frame, at - DIP_IN, DIP_IN, EASE.in) : 1 - ease(frame, at, DIP_OUT, EASE.out);
    return Math.max(acc, k);
  }, 0);

const lookFor = (def: SceneDefP, b: Beat, shot: Shot2, frame: number): Look => {
  const dip = dipAt(frame);
  return {
    focus: focusDistance(shot),
    aperture: shot.aperture ?? 0,
    bloom: (def.bloom?.(b) ?? 0.35) + dip * 0.9,
    exposure: 1 + dip * 0.7,
    flash: dip * 0.9,
    vignette: 0.84,
  };
};

const World: React.FC<{ def: SceneDefP; b: Beat; shot: Shot2; frame: number }> = ({ def, b, shot, frame }) => {
  const Scene = def.World;
  return (
    <>
      <Stage f={frame} shot={shot} light={def.light?.(b) ?? DEFAULT_LIGHTING} />
      <Cam shot={shot} />
      <Scene b={b} />
      <Post look={lookFor(def, b, shot, frame)} frame={frame} />
    </>
  );
};

export const RoyalMilkTea: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const def = SCENES[scene.id];
  const b = beatFor(scene, frame);
  const shot = def.shot(b);
  const end = TL.durationInFrames;
  const fadeOut = interpolate(frame, [end - 45, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const black = interpolate(frame, [end - 15, end - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Overlay = def.Overlay;
  return (
    <AbsoluteFill style={{ background: "#2a170c" }}>
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
      <Band frame={frame} scenes={SCENES} />
      <Subtitle frame={frame} />
      <AbsoluteFill style={{ background: "#000", opacity: black, pointerEvents: "none" }} />
      <Audio src={staticFile("royalmilk/narration.wav")} />
      <Loop durationInFrames={sec(22)}>
        <Audio src={staticFile("royalmilk/bgm_cafe.mp3")} volume={() => 0.1 * fadeOut} />
      </Loop>
      {DIPS.map((at) => (
        <Sequence key={`dip${at}`} from={Math.max(0, at - 8)} durationInFrames={sec(0.8)}>
          <Audio src={staticFile("royalmilk/whoosh.mp3")} volume={0.12} />
        </Sequence>
      ))}
      {SFX.map((e, i) => (
        <Sequence key={i} from={Math.max(0, sfxFrame(e))} durationInFrames={sec(e[6] ?? 1.3)}>
          <Audio src={staticFile(`royalmilk/${e[4]}.mp3`)} volume={e[5]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
