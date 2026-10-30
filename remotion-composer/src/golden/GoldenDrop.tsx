import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, interpolate, Loop, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { pop, sec } from "../koucha/anim";
import { C, FONT, H, W } from "../koucha/theme";
import { Beat, beatFor, sceneAt, Shot, TL } from "./core";
import { CUTS, SFX, sfxFrame } from "./cues";
import { SCENES } from "./scenes";
import { Cam, Stage } from "./three/Stage";

const Band: React.FC<{ frame: number }> = ({ frame }) => {
  const scene = sceneAt(frame);
  const k = pop(frame, sec(scene.start) + 4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <rect x={0} y={276} width={W} height={196} fill={C.band} />
      <rect x={0} y={462} width={W} height={10} fill={C.bandAccent} />
      <text x={470} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={C.cream}>
        知ってた？紅茶の雑学
      </text>
      <g transform={`translate(470 428) scale(${k})`}>
        <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.gold}>
          {SCENES[scene.id].topic}
        </text>
      </g>
    </svg>
  );
};

const Subtitle: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / TL.fps;
  const sub = TL.subtitles.find((s) => t >= s.start && t < s.end);
  if (!sub) return null;
  return (
    <div
      style={{
        position: "absolute", top: 1450, left: 90, width: 800, textAlign: "center",
        fontFamily: FONT, fontWeight: 900, fontSize: 70, color: C.white, lineHeight: 1.2,
        WebkitTextStroke: `14px ${C.ink}`, paintOrder: "stroke fill",
      }}
    >
      {sub.text}
    </div>
  );
};

const Wipes: React.FC<{ frame: number }> = ({ frame }) => {
  const cut = CUTS.find((c) => Math.abs(frame - c) <= 9);
  if (cut === undefined) return null;
  const x = interpolate(frame, [cut - 9, cut + 9], [-2300, 1500]);
  const color = CUTS.indexOf(cut) % 2 ? C.gold : C.band;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
      <path d={`M${x} 0 L${x + 1800} 0 L${x + 1300} ${H} L${x - 500} ${H} Z`} fill={color} />
      <path d={`M${x + 1800} 0 L${x + 1880} 0 L${x + 1300 + 80} ${H} L${x + 1300} ${H} Z`} fill={C.cream} />
    </svg>
  );
};

const World: React.FC<{ id: string; b: Beat; shot: Shot; frame: number }> = ({ id, b, shot, frame }) => {
  const Scene = SCENES[id].World;
  return (
    <>
      <Stage f={frame} />
      <Cam shot={shot} />
      <Scene b={b} />
    </>
  );
};

export const GoldenDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const def = SCENES[scene.id];
  const b = beatFor(scene, frame);
  const shot = def.shot(b);
  const fadeOut = interpolate(frame, [TL.durationInFrames - 45, TL.durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeToBlack = interpolate(frame, [TL.durationInFrames - 18, TL.durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const Overlay = def.Overlay;
  return (
    <AbsoluteFill style={{ background: "#160a05" }}>
      <ThreeCanvas
        width={W}
        height={H}
        dpr={1}
        gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.05 }}
        camera={{ fov: 35, position: [0, 2, 6], near: 0.05, far: 80 }}
      >
        <World id={scene.id} b={b} shot={shot} frame={frame} />
      </ThreeCanvas>
      {Overlay && (
        <AbsoluteFill>
          <Overlay b={b} shot={shot} />
        </AbsoluteFill>
      )}
      <Band frame={frame} />
      <Subtitle frame={frame} />
      <Wipes frame={frame} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeToBlack, pointerEvents: "none" }} />
      <Audio src={staticFile("golden/narration.wav")} />
      <Loop durationInFrames={sec(22)}>
        <Audio src={staticFile("golden/bgm.mp3")} volume={() => 0.09 * fadeOut} />
      </Loop>
      {CUTS.map((cut) => (
        <Sequence key={`w${cut}`} from={cut - 9} durationInFrames={sec(0.8)}>
          <Audio src={staticFile("golden/whoosh.mp3")} volume={0.3} />
        </Sequence>
      ))}
      {SFX.map((e, i) => (
        <Sequence key={i} from={Math.max(0, sfxFrame(e))} durationInFrames={sec(e[6] ?? 1.3)}>
          <Audio src={staticFile(`golden/${e[4]}.mp3`)} volume={e[5]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
