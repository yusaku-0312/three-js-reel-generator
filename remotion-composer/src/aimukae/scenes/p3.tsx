import React from "react";
import { Beat, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { At, Bubble, Chip, COL, Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Figure, walkAlong } from "../three/figures";
import { CallLine, GroundLine, Pin, TEAL } from "../three/fx";
import { Phone } from "../three/props";
import { MAP_ROUTE, MAP_SPOTS, mapTexture } from "../three/textures";
import { LAB_LIGHT, TOWN_LIGHT } from "../three/stage";
import { SceneDefP } from "../types";
import { aerial, CHILD_TOWN, HOME_PIN, MAN_TOWN } from "./p2";

// Promise 3. L0 (same aerial) the call light stops halfway: no answer. L1 on the sidewalk, the man hurries
// her; a teal line on the ground: she does not go until it is confirmed. L2 no phone: the school gate and the
// shop light up; she asks the shop clerk. L3 a picture map of the school route: pins pop up where she can ask
// for help; little mom and child walk it together.
const Y = 0.06;
const SIDE_CHILD: V3 = [1.15, Y, -7.3];
const SIDE_MAN: V3 = [0.95, Y, -5.55];
const SHOP_SPOT: V3 = [1.55, Y, -9.0];
const CLERK: V3 = [2.0, Y, -10.0];

const beat = (b: Beat) => (b.f >= b.ln(3) - 4 ? 3 : b.f >= b.ln(2) - 4 ? 2 : b.f >= b.ln(1) - 4 ? 1 : 0);

const shot = (b: Beat): Shot2 => {
  const k = beat(b);
  if (k === 0) return aerial(b.f, -400);
  if (k === 1)
    return breathe(
      keys2(b.f, [
        [0, { pos: [-7.06, 7.02, -3.44], target: [1.02, 1.0, -6.38], fov: 30, focus: [1.05, 0.8, -6.4], aperture: 2.5 }],
        [b.ck(1, 3), { pos: [-6.6, 7.4, -3.9], target: [1.02, 0.8, -6.4], fov: 30, focus: [1.05, 0.5, -6.45], aperture: 2.5 }, 40],
      ]),
      b.f,
    );
  if (k === 2)
    return breathe(
      keys2(b.f, [
        [0, { pos: [-7.9, 3.6, 3.03], target: [1.6, 1.0, -8.28], fov: 30, focus: [1.3, 0.8, -7.5], aperture: 2 }],
        [b.ck(2, 2) - 4, { pos: [-5.05, 2.82, -0.36], target: [1.6, 1.0, -8.6], fov: 30, focus: [1.6, 0.8, -9.0], aperture: 2.5 }, 50],
      ]),
      b.f,
    );
  return breathe(
    keys2(b.f, [
      [0, { pos: [-0.18, 12.9, 7.1], target: [-0.18, 0, -0.33], fov: 30, focus: [0, 0, -0.3], aperture: 0.5 }],
      [0, { pos: [-0.18, 12.12, 6.67], target: [-0.18, 0, -0.33], fov: 30, focus: [0, 0, -0.3], aperture: 0.5 }, 170],
    ]),
    b.f,
    0.02,
  );
};

const NoAnswer: React.FC<{ b: Beat }> = ({ b }) => {
  const call = ease(b.f, b.ck(0, 0), 30, EASE.out);
  return (
    <>
      <Figure kind="child" pose={{ pos: CHILD_TOWN, yaw: Math.PI * 0.85, armR: 1.4, headPitch: 0.15 }} />
      <Figure kind="man" pose={{ pos: MAN_TOWN, yaw: -Math.PI * 0.2 }} />
      <Phone pos={[CHILD_TOWN[0] - 0.12, 0.85, CHILD_TOWN[2] - 0.18]} rot={[-0.4, Math.PI * 0.85, 0]} h={0.3} screen={b.f >= b.ck(0, 1) ? "noanswer" : "dial"} body="#159a8f" screenGlow={1.3} />
      <CallLine from={[CHILD_TOWN[0] - 0.12, 1.0, CHILD_TOWN[2] - 0.18]} to={HOME_PIN} f={b.f} grow={call} breakAt={0.5} lift={3.2} color="#9aa6bf" radius={0.06} />
    </>
  );
};

const Hurry: React.FC<{ b: Beat }> = ({ b }) => {
  const wave = Math.sin(b.f / 4) * 0.35 * ease(b.f, b.ck(1, 0), 6);
  const line = ease(b.f, b.ck(1, 3), 18, EASE.out);
  return (
    <>
      <Figure kind="child" pose={{ pos: SIDE_CHILD, yaw: 0, headYaw: Math.sin(b.f / 5) * 0.12 * ease(b.f, b.ck(1, 4), 4) }} />
      <Figure kind="man" pose={{ pos: SIDE_MAN, yaw: Math.PI, lean: 0.2, armR: 0.9 + wave, armL: 0.3 }} />
      <GroundLine from={[0.35, Y, -6.45]} to={[1.9, Y, -6.45]} k={line} />
    </>
  );
};

const AskShop: React.FC<{ b: Beat }> = ({ b }) => {
  const walk = walkAlong([0.95, Y, -5.6], SHOP_SPOT, ease(b.f, b.ck(2, 1), 40, EASE.inOut), 8);
  return (
    <>
      <Figure kind="child" pose={{ pos: walk.pos, yaw: walk.step ? walk.yaw : Math.PI * 0.75, walk: walk.walk, step: walk.step }} />
      <Figure kind="dad" body="#e8873a" pose={{ pos: CLERK, yaw: -Math.PI * 0.2, lean: ease(b.f, b.ck(2, 3), 12) * 0.25 }} />
    </>
  );
};

// The map lies on the lab floor (2.4 × 3.2, school at the far edge); u/v → world x/z.
const MAP_W = 2.4;
const MAP_H = 3.2;
const onMap = (u: number, v: number): V3 => [(u - 0.5) * MAP_W, 0.01, (v - 0.5) * MAP_H];

const MapView: React.FC<{ b: Beat }> = ({ b }) => {
  const walk = ease(b.f, b.ck(3, 4), 70, EASE.inOut);
  const [a, c] = [MAP_ROUTE[1], MAP_ROUTE[2]];
  const p = onMap(a[0] + (c[0] - a[0]) * walk, a[1]);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[MAP_W, MAP_H]} />
        <meshStandardMaterial map={mapTexture()} color="#9a948a" roughness={0.9} />
      </mesh>
      {MAP_SPOTS.map((s, i) => (
        <Pin key={s.label} pos={onMap(s.u, s.v)} size={0.45} k={ease(b.f, b.ck(3, 3) + i * 8, 10, EASE.out)} f={b.f} color={i === 3 ? "#ff9ac4" : TEAL} />
      ))}
      <group position={[p[0] + 0.12, 0, p[2]]} scale={0.34}>
        <Figure kind="mom" pose={{ pos: [0, 0, 0], yaw: -Math.PI / 2, walk: walk * Math.PI * 8, step: walk > 0 && walk < 1 ? 1 : 0 }} />
      </group>
      <group position={[p[0] - 0.1, 0, p[2] + 0.12]} scale={0.34}>
        <Figure kind="child" pose={{ pos: [0, 0, 0], yaw: -Math.PI / 2, walk: walk * Math.PI * 8 + 1, step: walk > 0 && walk < 1 ? 1 : 0 }} />
      </group>
    </>
  );
};

const World: React.FC<{ b: Beat }> = ({ b }) => {
  const k = beat(b);
  if (k === 0) return <NoAnswer b={b} />;
  if (k === 1) return <Hurry b={b} />;
  if (k === 2) return <AskShop b={b} />;
  return <MapView b={b} />;
};

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b, shot }) => {
  const out = (at: number, end: number) => Math.min(ease(b.f, at, 8, EASE.out), 1 - ease(b.f, end - 6, 6, EASE.in));
  const k = beat(b);
  if (k === 0)
    return (
      <>
        <At shot={shot} p={[CHILD_TOWN[0], 1.4, CHILD_TOWN[2]]} k={out(b.ck(0, 1), b.ck(0, 3))} dy={60}>
          <Chip text="つながらない…" size={46} accent="#9aa6bf" />
        </At>
        <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(0, 3))}>
          <Headline text="③ つながらない時は" size={80} f={b.f} at={b.ck(0, 3)} tone="teal" />
        </Layer>
      </>
    );
  if (k === 1)
    return (
      <>
        <Bubble shot={shot} at3={[SIDE_MAN[0], 1.85, SIDE_MAN[2]]} text="急いで" k={out(b.ck(1, 0), b.ck(1, 3))} tone="red" dy={250} dx={-90} />
        <Bubble shot={shot} at3={[SIDE_MAN[0], 1.85, SIDE_MAN[2]]} text="ママが待ってる" k={out(b.ck(1, 1), b.ck(1, 3))} tone="red" dy={110} dx={40} />
        <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(1, 3))}>
          <Headline text="確認できるまで ついていかない" size={64} f={b.f} at={b.ck(1, 3)} tone="teal" />
        </Layer>
      </>
    );
  if (k === 2)
    return (
      <>
        <Layer x={SAFE_CX} y={640} k={out(b.ck(2, 0), b.ck(2, 3))}>
          <Chip text="携帯がないときも" size={46} accent={COL.cyan} />
        </Layer>
        <Layer x={SAFE_CX} y={1300} k={reveal(b.f, b.ck(2, 1))}>
          <Chip text={b.f >= b.ck(2, 2) ? "先生や お店の人に相談" : "先生や…"} size={48} accent={COL.teal} />
        </Layer>
        <Bubble shot={shot} at3={[SHOP_SPOT[0], 1.05, SHOP_SPOT[2]]} text={"親に連絡したいです\n助けてください"} k={out(b.ck(2, 3), b.dur + 20)} tone="teal" dy={190} size={48} />
      </>
    );
  return (
    <Layer x={SAFE_CX} y={565} k={reveal(b.f, b.ck(3, 2))}>
      <Headline text="助けを求められる場所" size={74} f={b.f} at={b.ck(3, 2)} tone="teal" />
    </Layer>
  );
};

export const P3: SceneDefP = {
  topic: "約束③ 助けを求める",
  shot,
  World,
  Overlay,
  light: (b) => (beat(b) === 3 ? { ...LAB_LIGHT, key: 1.6, fill: 0.35, front: 0.3 } : { ...TOWN_LIGHT, evening: 0.5, fog: beat(b) === 0 ? [30, 70] : undefined }),
  town: (b) => {
    const k = beat(b);
    if (k === 2) return { school: ease(b.f, b.ck(2, 1), 10), shop: ease(b.f, b.ck(2, 2), 10) };
    return {};
  },
  bloom: () => 0.45,
  dipLines: [1, 2, 3],
};
