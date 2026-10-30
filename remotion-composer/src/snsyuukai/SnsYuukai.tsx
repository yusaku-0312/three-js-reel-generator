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
import { Cam, Stage } from "../aimukae/three/stage";
import { SceneDefP } from "./types";

const BGM_SECONDS = 22;
const DIP_IN = 6;
const DIP_OUT = 12;
const DIP_COLOR = { town: "#ffc48a", lab: "#7fb8ff" } as const;

/** Global frames where the picture changes set through a light dip, coloured by the set it enters. */
export const DIPS: Array<{ at: number; color: string }> = TL.scenes.flatMap((s) => {
  const def = SCENES[s.id];
  const ats = [
    ...(def.dipIn ? [sec(s.start)] : []),
    ...(def.dipLines ?? []).map((li) => sec(s.start) + sec(s.lines[li].start) - 4),
    ...(def.dipChunks ?? []).map(([li, ci]) => sec(s.start) + sec(s.lines[li].chunks[ci]) - 4),
  ];
  return ats.map((at) => ({ at, color: DIP_COLOR[def.light(beatFor(s, at + 1)).set] }));
});

const dipAt = (frame: number) =>
  DIPS.reduce(
    (acc, d) => {
      if (frame < d.at - DIP_IN || frame > d.at + DIP_OUT) return acc;
      const k = frame < d.at ? ease(frame, d.at - DIP_IN, DIP_IN, EASE.in) : 1 - ease(frame, d.at, DIP_OUT, EASE.out);
      return k > acc.k ? { k, color: d.color } : acc;
    },
    { k: 0, color: DIP_COLOR.town as string },
  );

const lookFor = (def: SceneDefP, b: Beat, shot: Shot2, frame: number): Look => {
  const dip = dipAt(frame);
  const g = def.grade?.(b) ?? {};
  return {
    focus: focusDistance(shot),
    aperture: shot.aperture ?? 0,
    bloom: (def.bloom?.(b) ?? 0.35) + dip.k * 0.8,
    exposure: 1 + dip.k * 0.6,
    flash: dip.k * 0.85,
    flashColor: dip.color,
    vignette: 0.8,
    desat: g.desat,
    glitch: g.glitch,
    danger: g.danger,
  };
};

const World: React.FC<{ def: SceneDefP; b: Beat; shot: Shot2; frame: number }> = ({ def, b, shot, frame }) => {
  const Scene = def.World;
  return (
    <>
      <Stage f={frame} shot={shot} light={def.light(b)} town={def.town?.(b)} />
      <Cam shot={shot} />
      <Scene b={b} />
      <Post look={lookFor(def, b, shot, frame)} frame={frame} />
    </>
  );
};

export const SnsYuukai: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const def = SCENES[scene.id];
  const b = beatFor(scene, frame);
  const shot = def.shot(b);
  const end = TL.durationInFrames;
  const fadeOut = interpolate(frame, [end - 45, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Overlay = def.Overlay;
  return (
    <AbsoluteFill style={{ background: "#141a30" }}>
      <ThreeCanvas
        width={W}
        height={H}
        dpr={1}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        camera={{ fov: 32, position: [0, 2, 6], near: 0.05, far: 80 }}
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
      <Audio src={staticFile("snsyuukai/narration.wav")} />
      <Loop durationInFrames={sec(BGM_SECONDS)}>
        <Audio src={staticFile("snsyuukai/bgm_tense.mp3")} volume={() => 0.08 * fadeOut} />
      </Loop>
      {DIPS.map((d) => (
        <Sequence key={`dip${d.at}`} from={Math.max(0, d.at - 8)} durationInFrames={sec(0.8)}>
          <Audio src={staticFile("snsyuukai/whoosh.mp3")} volume={0.1} />
        </Sequence>
      ))}
      {SFX.map((e, i) => (
        <Sequence key={i} from={Math.max(0, sfxFrame(e))} durationInFrames={sec(e[6] ?? 1.3)}>
          <Audio src={staticFile(`snsyuukai/${e[4]}.mp3`)} volume={e[5]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
