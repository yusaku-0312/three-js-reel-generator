import React from "react";
import { Beat, lerp } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { FONT } from "../../koucha/theme";
import { Chip, INK, Layer, SAFE_CX } from "../overlays";
import { AI_CYAN, Hop, Led } from "../three/devices";
import { SceneDefP } from "../types";
import { dioShot } from "./cams";
import { coreAt, devicePos, Diorama, DioState, RING } from "./cast";
import { DARK_NIGHT } from "./cast";

// L0 (dip) the device diorama: camera in the middle, TV box, speaker, router, oven and TV round it. The devices
// pop in one by one on 「AIの開発会社」, ground links draw on 「ネットにつながる」, a cyan AI lights in the TV box on
// 「AIが動き」, and from 「自分のコピーを」 copies hop along arcs: TV box → router → TV, TV box → speaker.
const TVBOX = 0;
const SPEAKER = 1;
const ROUTER = 2;
const TV = 4;
/** [from, to, chunk where the hop starts, frame offset]; a hop lasts HOP frames. */
export const HOP = 18;
const HOPS: Array<[number, number, number, number]> = [
  [TVBOX, ROUTER, 5, 2],
  [TVBOX, SPEAKER, 6, 0],
  [ROUTER, TV, 7, 0],
];

const shot = (b: Beat): Shot2 => breathe(dioShot(lerp(-6, 12, ease(b.f, 0, b.dur, EASE.inOut)), 45, 7.6), b.f, 0.02);

const state = (b: Beat): DioState => {
  const show = RING.map((_, i) => ease(b.f, b.ck(0, 0) + i * 4, 10, EASE.out));
  const copies = RING.map(() => 0);
  copies[TVBOX] = ease(b.f, b.ck(0, 4), 10, EASE.out);
  HOPS.forEach(([, to, c, off]) => {
    copies[to] = ease(b.f, b.ck(0, c) + off + HOP - 2, 8, EASE.out);
  });
  const leds = copies.map((c): Led => (c > 0.5 ? "cyan" : "blue"));
  return { show, leds, copies, camLed: "blue", links: ease(b.f, b.ck(0, 2), 20, EASE.inOut) };
};

const World: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Diorama s={state(b)} f={b.f} />
    {HOPS.map(([from, to, c, off], i) => (
      <Hop key={i} from={coreAt(devicePos(from))} to={coreAt(devicePos(to))} t={(b.f - b.ck(0, c) - off) / HOP} f={b.f} lift={0.3} size={0.06} />
    ))}
  </>
);

/** Source card: who showed it and when (the experiment, not an incident). */
const SourceCard: React.FC = () => (
  <div
    style={{
      fontFamily: FONT, fontWeight: 900, textAlign: "center", background: "rgba(255,255,255,0.95)", color: INK,
      borderRadius: 30, border: `6px solid ${AI_CYAN}`, padding: "18px 40px", boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
    }}
  >
    <div style={{ fontSize: 58, lineHeight: 1.15 }}>アンソロピック</div>
    <div style={{ fontSize: 34, color: "#4a5568", marginTop: 6 }}>AI開発会社・2026年10月 公表</div>
  </div>
);

const Overlay: React.FC<{ b: Beat }> = ({ b }) => (
  <>
    <Layer x={SAFE_CX} y={590} k={ease(b.f, b.ck(0, 1), 9, EASE.out)}>
      <SourceCard />
    </Layer>
    <Layer x={SAFE_CX} y={1372} k={Math.min(ease(b.f, b.ck(0, 2), 8, EASE.out), 1 - ease(b.f, b.ck(0, 6) - 6, 6))}>
      <Chip text="ネットにつながる機器" size={48} accent="#9fb4ff" />
    </Layer>
    <Layer x={SAFE_CX} y={1372} k={ease(b.f, b.ck(0, 6), 8, EASE.out)}>
      <Chip text="自分のコピーを広げる" size={48} accent={AI_CYAN} />
    </Layer>
  </>
);

export const ANTHROPIC: SceneDefP = {
  topic: "AIが自分をコピーして広がる",
  shot,
  World,
  Overlay,
  light: () => ({ ...DARK_NIGHT, front: 0.5, fill: 0.38 }),
  bloom: () => 0.45,
  dipIn: true,
};
