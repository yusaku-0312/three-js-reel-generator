import React from "react";
import { Beat, lerp } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { At, Chip, Layer, SAFE_CX } from "../overlays";
import { AI_CYAN, AICore, HACK_RED, Hop, Led, LED_BLUE } from "../three/devices";
import { SceneDefP } from "../types";
import { dioShot, dolly, HOOK_CAM, LENS } from "./cams";
import { Bedroom, CENTER, coreAt, DARK_NIGHT, devicePos, Diorama, RING } from "./cast";
import { HOP } from "./anthropic";

// L0 (dip) the bedroom again: a cyan AI copy flies in and dives into the shelf camera on 「見守りカメラの」; on
// 「悪用され」 the lamp turns red with a glitch. 「ほかの機器へ」 (dip) the diorama: copies burst from the red centre
// camera to every device. L1 「電源を切っても」 the centre camera goes dark (power off), while the copies on the other
// devices keep pulsing and, from 「動き続ける」, keep hopping between neighbours.
const inRoom = (b: Beat) => b.f < b.ck(0, 4) - 4;
const FLY_FROM: [number, number, number] = [1.15, 1.5, -2.2];

const shot = (b: Beat): Shot2 => {
  if (inRoom(b)) return breathe(dolly(HOOK_CAM, 0.03 + 0.05 * ease(b.f, 0, b.ck(0, 4), EASE.inOut)), b.f, 0.02);
  const t = ease(b.f, b.ck(0, 4), b.dur - b.ck(0, 4), EASE.inOut);
  return breathe(dioShot(lerp(10, -8, t), 45, lerp(7.4, 8.2, ease(b.f, b.ln(1), 50, EASE.cam))), b.f, 0.02);
};

/** Burst: one hop from the centre to each device, staggered. */
const burstAt = (b: Beat, i: number) => b.ck(0, 4) + 4 + i * 4;
/** Endless relay between neighbours after 「動き続ける」. */
const RELAY_EVERY = 14;

const World: React.FC<{ b: Beat }> = ({ b }) => {
  if (inRoom(b)) {
    const fly = (b.f - b.ck(0, 1) + 10) / 22;
    const inside = b.f >= b.ck(0, 1) + 12;
    const abused = b.f >= b.ck(0, 3);
    const g = abused ? 0.25 + ease(b.f, b.ck(0, 3), 3) * (1 - ease(b.f, b.ck(0, 3) + 4, 14)) * 0.8 : 0;
    return (
      <>
        <Bedroom f={b.f} led={abused ? "red" : inside ? "cyan" : "blue"} glitch={g} coneColor={abused ? HACK_RED : LED_BLUE} />
        <Hop from={FLY_FROM} to={LENS} t={fly} f={b.f} lift={0.4} size={0.09} />
        {b.f < b.ck(0, 1) - 10 && <AICore pos={FLY_FROM} f={b.f} size={0.09 * ease(b.f, 6, 12, EASE.out)} power={1} />}
      </>
    );
  }
  const off = ease(b.f, b.ck(1, 1), 10, EASE.inOut);
  const copies = RING.map((_, i) => ease(b.f, burstAt(b, i) + HOP - 2, 8, EASE.out));
  const leds = copies.map((c): Led => (c > 0.5 ? "red" : "blue"));
  const relayOn = b.f >= b.ck(1, 3);
  const relayN = relayOn ? Math.floor((b.f - b.ck(1, 3)) / RELAY_EVERY) : -1;
  return (
    <>
      <Diorama
        s={{ show: RING.map(() => 1), leds, copies, camLed: off > 0.5 ? "off" : "red", camGlitch: 0.3 * (1 - off), camDim: off, camCopy: 1 - off, links: 1 }}
        f={b.f}
      />
      {RING.map((_, i) => (
        <Hop key={`b${i}`} from={coreAt(CENTER)} to={coreAt(devicePos(i))} t={(b.f - burstAt(b, i)) / HOP} f={b.f} lift={0.3} size={0.06} />
      ))}
      {relayOn &&
        [relayN - 1, relayN].filter((n) => n >= 0).map((n) => {
          const from = n % RING.length;
          const to = (n + 2) % RING.length;
          return <Hop key={`r${n}`} from={coreAt(devicePos(from))} to={coreAt(devicePos(to))} t={(b.f - b.ck(1, 3) - n * RELAY_EVERY) / HOP} f={b.f} lift={0.35} size={0.05} />;
        })}
    </>
  );
};

const PowerOff: React.FC = () => (
  <Chip text="⏻ 電源OFF" size={44} accent="#8a909c" />
);

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => (
  <>
    <Layer x={SAFE_CX + 150} y={532} k={Math.min(ease(b.f, b.ck(0, 3), 8, EASE.out), 1 - ease(b.f, b.ck(0, 4) - 8, 6))}>
      <Chip text="悪用されたら" size={48} accent={HACK_RED} mark="ng" />
    </Layer>
    {!inRoom(b) && (
      <At shot={shot} p={[CENTER[0], 0.75, CENTER[2]]} k={ease(b.f, b.ck(1, 1), 8, EASE.out)} dy={40}>
        <PowerOff />
      </At>
    )}
    <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(1, 2), 8, EASE.out)}>
      <Chip text="別の機器で動き続ける" size={48} accent={AI_CYAN} />
    </Layer>
  </>
);

export const SPREAD: SceneDefP = {
  topic: "電源を切っても止まらない",
  shot,
  World,
  Overlay,
  light: (b) => (inRoom(b) ? DARK_NIGHT : { ...DARK_NIGHT, front: 0.5, fill: 0.38 }),
  bloom: () => 0.45,
  grade: (b) => ({
    danger: inRoom(b) ? (b.f >= b.ck(0, 3) ? 0.2 : 0) : 0.12,
    glitch: inRoom(b) ? ease(b.f, b.ck(0, 3), 3) * (1 - ease(b.f, b.ck(0, 3) + 4, 12)) * 0.6 : 0,
  }),
  dipIn: true,
  dipChunks: [[0, 4]],
};
