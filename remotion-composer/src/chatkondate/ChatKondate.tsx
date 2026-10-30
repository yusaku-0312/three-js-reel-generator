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
import { Look, Post } from "../aimukae/three/post";
import { Cam, KITCHEN_LIGHT, Stage } from "../kondate/three/kitchen";
import { SceneDefP } from "./types";

const BGM_SECONDS = 22;
const DIP_IN = 6;
const DIP_OUT = 12;
const DIP_COLOR = "#ffd6a0";

/** Global frames where the picture changes framing through a warm light dip. */
export const DIPS: number[] = TL.scenes.flatMap((s) => [
  ...(SCENES[s.id].dipIn ? [sec(s.start)] : []),
  ...(SCENES[s.id].dipLines ?? []).map((li) => sec(s.start) + sec(s.lines[li].start) - 4),
  ...(SCENES[s.id].dipFrames?.(beatFor(s, sec(s.start))) ?? []).map((at) => sec(s.start) + at),
]);

const dipAt = (frame: number) =>
  DIPS.reduce((acc, at) => {
    if (frame < at - DIP_IN || frame > at + DIP_OUT) return acc;
    const k = frame < at ? ease(frame, at - DIP_IN, DIP_IN, EASE.in) : 1 - ease(frame, at, DIP_OUT, EASE.out);
    return Math.max(acc, k);
  }, 0);

const lookFor = (def: SceneDefP, b: Beat, shot: Shot2, frame: number): Look => {
  const dip = dipAt(frame);
  const shutter = def.shutter?.(b) ?? 0;
  return {
    focus: focusDistance(shot),
    aperture: shot.aperture ?? 0,
    bloom: (def.bloom?.(b) ?? 0.35) + dip * 0.8 + shutter * 0.6,
    exposure: 1 + dip * 0.6 + shutter * 0.5,
    flash: Math.max(dip * 0.85, shutter * 0.9),
    flashColor: shutter > dip ? "#ffffff" : DIP_COLOR,
    vignette: 0.8,
  };
};

const World: React.FC<{ def: SceneDefP; b: Beat; shot: Shot2; frame: number }> = ({ def, b, shot, frame }) => {
  const Scene = def.World;
  return (
    <>
      <Stage shot={shot} light={def.light?.(b) ?? KITCHEN_LIGHT} kitchen={def.kitchen?.(b)} />
      <Cam shot={shot} />
      <Scene b={b} />
      <Post look={lookFor(def, b, shot, frame)} frame={frame} />
    </>
  );
};

export const ChatKondate: React.FC = () => {
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
    <AbsoluteFill style={{ background: "#2a1d16" }}>
      <ThreeCanvas
        width={W}
        height={H}
        dpr={1}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        camera={{ fov: 30, position: [0, 2, 6], near: 0.05, far: 60 }}
      >
        <World def={def} b={b} shot={shot} frame={frame} />
      </ThreeCanvas>
      {Overlay && (
        <AbsoluteFill>
          <Overlay b={b} shot={shot} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ opacity: 1 - (def.bandOff?.(b) ?? 0) }}>
        <Band frame={frame} scenes={SCENES} />
      </AbsoluteFill>
      <Subtitle frame={frame} />
      <AbsoluteFill style={{ background: "#000", opacity: black, pointerEvents: "none" }} />
      <Audio src={staticFile("chatkondate/narration.wav")} />
      <Loop durationInFrames={sec(BGM_SECONDS)}>
        <Audio src={staticFile("chatkondate/bgm_kondate.mp3")} volume={() => 0.1 * fadeOut} />
      </Loop>
      {DIPS.map((at) => (
        <Sequence key={`dip${at}`} from={Math.max(0, at - 8)} durationInFrames={sec(0.8)}>
          <Audio src={staticFile("chatkondate/whoosh.mp3")} volume={0.1} />
        </Sequence>
      ))}
      {SFX.map((e, i) => (
        <Sequence key={i} from={Math.max(0, sfxFrame(e))} durationInFrames={sec(e[6] ?? 1.3)}>
          <Audio src={staticFile(`chatkondate/${e[4]}.mp3`)} volume={e[5]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
