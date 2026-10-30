import React, { useMemo } from "react";
import * as THREE from "three";
import { add3, Beat, clamp01, lerp, rng, V3 } from "../core";
import { breathe, ease, EASE, keys2, Shot2 } from "../../golden2/shot";
import { Chip, Dot, Headline, Layer, reveal, SAFE_CX, Scrim } from "../overlays";
import { Aroma, Glow, Sparkles } from "../three/fx";
import { Flower, FLOWER_COLOR, FlowerKind, loosePetal, petalMat } from "../three/flowers";
import { glassRim, IcedGlass } from "../three/glass";
import { FLOWER_KINDS, LeafDish, PETAL_HEX } from "../three/props";
import { DEFAULT_LIGHTING } from "../three/stage";
import { SceneDefP } from "../types";

// Line 4: a dish of black tea; petals rain into it; four buds rise behind (rack focus).
// Line 5: each flower opens as it is named, the camera trucks along the row.
// Line 6: petals leave the flowers in a spiral into the iced tea; the scent ribbons braid; 楽園 light.
const DISH: V3 = [0, 0, 1.2];
/** A staggered bouquet that fits the 9:16 frame: two columns, each flower further back and taller. */
const SPOTS: Array<{ x: number; z: number; stem: number }> = [
  { x: -0.5, z: -0.5, stem: 0.95 },
  { x: 0.5, z: -0.85, stem: 1.2 },
  { x: -0.45, z: -1.35, stem: 1.5 },
  { x: 0.5, z: -1.75, stem: 1.75 },
];
const head = (i: number): V3 => [SPOTS[i].x, SPOTS[i].stem + 0.02, SPOTS[i].z];
const BOUQUET: V3 = [0, 1.35, -1.1];
const GLASS = { pos: [1.9, 0, -0.3] as V3 };
const RIM = glassRim(GLASS);

const NAMES: Record<FlowerKind, string> = { cornflower: "コーンフラワー", marigold: "マリーゴールド", safflower: "サフラワー", rose: "ローズ" };
/** Chunk (line 1) at which each flower is fully open; 「オレンジの」 (chunk 1) brings the camera to the marigold first. */
const OPEN_CHUNK = [0, 2, 3, 4];
/** Chunk at which the camera arrives at each flower. */
const ARRIVE_CHUNK = [0, 1, 3, 4];

const budRise = (b: Beat) => ease(b.f, b.ck(0, 2) - 2, 26, EASE.out);
const openAt = (b: Beat, i: number) => b.ck(1, OPEN_CHUNK[i]);
const bloomOf = (b: Beat, i: number) => {
  const at = openAt(b, i) - 6;
  const k = ease(b.f, at, 20, EASE.out);
  const over = Math.sin(clamp01((b.f - at) / 26) * Math.PI) * 0.08; // small overshoot, then settle
  return lerp(0.12, 1, k) + over * k;
};
const vortexAt = (b: Beat) => b.ck(2, 0) - 4;
const shedOf = (b: Beat, i: number) => ease(b.f, vortexAt(b) + i * 6, 34, EASE.inOut);
const paradise = (b: Beat) => ease(b.f, b.ck(2, 2) - 4, 24, EASE.out);

const flowerShot = (i: number): Shot2 => ({
  pos: add3(head(i), [0.3, 0.35, 2.7]),
  target: add3(head(i), [0.02, -0.12, 0]),
  fov: 30,
  focus: head(i),
  aperture: 10,
});

const flowersShot = (b: Beat): Shot2 =>
  breathe(
    keys2(b.f, [
      [0, { pos: [0.1, 4.4, 5.6], target: [0, 0.2, DISH[2] - 0.15], fov: 30, focus: add3(DISH, [0, 0.2, 0]), aperture: 8 }],
      [0, { pos: [0.1, 3.9, 5.0], target: [0, 0.2, DISH[2] - 0.2], fov: 30, focus: add3(DISH, [0, 0.2, 0]), aperture: 8 }, 80],
      [b.ck(0, 2) - 6, { pos: [0, 2.0, 6.6], target: [0, 1.05, -0.9], fov: 30, focus: BOUQUET, aperture: 8 }, 40],
      [b.ck(1, ARRIVE_CHUNK[0]) - 16, flowerShot(0), 34],
      [b.ck(1, ARRIVE_CHUNK[1]) - 12, flowerShot(1), 24],
      [b.ck(1, ARRIVE_CHUNK[2]) - 16, flowerShot(2), 24],
      [b.ck(1, ARRIVE_CHUNK[3]) - 16, flowerShot(3), 24],
      [vortexAt(b), { pos: [1.0, 2.3, 6.8], target: [0.9, 1.15, -0.8], fov: 30, focus: [1.0, 1.2, -0.6], aperture: 6 }, 40],
      [b.ck(2, 1) + 6, { pos: [GLASS.pos[0] - 0.1, 1.9, 5.5], target: [GLASS.pos[0], 1.2, -0.3], fov: 30, focus: add3(GLASS.pos, [0, 0.9, 0]), aperture: 7 }, 40],
      [b.ck(2, 3), { pos: [GLASS.pos[0] - 0.1, 1.6, 5.6], target: [GLASS.pos[0], 1.6, -0.3], fov: 31, focus: add3(GLASS.pos, [0, 1.2, 0]), aperture: 7 }, 50],
    ]),
    b.f,
  );

/** Petals in flight: spiral from their flower head into the glass, staggered, landing on the tea. */
const Vortex: React.FC<{ b: Beat }> = ({ b }) => {
  const parts = useMemo(() => {
    const r = rng(61);
    return Array.from({ length: 64 }, (_, i) => ({
      flower: i % 4,
      delay: Math.floor(i / 4) * 2.2 + r() * 4 + (i % 4) * 6,
      off: [(r() - 0.5) * 0.25, (r() - 0.5) * 0.15, (r() - 0.5) * 0.25] as V3,
      turns: 1.2 + r() * 0.8,
      spin: (r() - 0.5) * 10,
      rad: 0.35 + r() * 0.35,
      dur: 46 + r() * 16,
      ph: r() * 6.28,
    }));
  }, []);
  const start = vortexAt(b);
  const target = add3(RIM, [0, -0.25, 0]);
  return (
    <>
      {parts.map((p, i) => {
        const t = clamp01((b.f - start - p.delay) / p.dur);
        if (t <= 0 || t >= 1) return null;
        const from = add3(head(p.flower), p.off);
        const e = EASE.inOut(t);
        const base = new THREE.Vector3(...from).lerp(new THREE.Vector3(...target), e);
        // Spiral around the straight path, widest mid-flight, rising a little before it dives.
        const a = p.ph + e * p.turns * Math.PI * 2;
        const r = p.rad * Math.sin(e * Math.PI);
        const pos: V3 = [base.x + Math.cos(a) * r, base.y + Math.sin(e * Math.PI) * 0.6 + Math.sin(a) * r * 0.3, base.z + Math.sin(a) * r * 0.6];
        const kind = FLOWER_KINDS[p.flower];
        return (
          <mesh
            key={i}
            geometry={loosePetal(kind)}
            material={petalMat}
            position={pos}
            rotation={[p.spin * t, p.spin * t * 0.7 + p.ph, p.ph]}
            scale={1.3 * (1 - Math.pow(t, 6) * 0.5)}
          />
        );
      })}
    </>
  );
};

const FlowersWorld: React.FC<{ b: Beat }> = ({ b }) => {
  const { f } = b;
  const rise = budRise(b);
  const landed = Math.round(lerp(0, 22, ease(f, vortexAt(b) + 30, 70, EASE.inOut)));
  const pk = paradise(b);
  const burst = ease(f, b.ck(2, 3) - 4, 30, EASE.out);
  return (
    <>
      <LeafDish pos={DISH} mix={ease(f, b.ck(0, 1) - 6, 60, EASE.inOut)} f={f} />
      {FLOWER_KINDS.map((k, i) => (
        <React.Fragment key={k}>
          {rise > 0.01 && (
            <Flower
              kind={k}
              pos={[SPOTS[i].x, 0, SPOTS[i].z]}
              stem={SPOTS[i].stem * rise}
              bloom={bloomOf(b, i)}
              f={f}
              face={0.45}
              shed={shedOf(b, i)}
              seed={i}
            />
          )}
          <Sparkles center={head(i)} f={f - openAt(b, i) + 4} mode="burst" count={12} radius={0.5} size={0.07} seed={70 + i} color={FLOWER_COLOR[k]} intensity={2.2} />
        </React.Fragment>
      ))}
      <Vortex b={b} />
      <IcedGlass pose={GLASS} fill={0.84} f={f} ice={4} petals={landed} glow={0.4 + pk * 0.6} />
      <Aroma
        from={add3(RIM, [0, -0.05, 0])}
        f={f}
        colors={PETAL_HEX}
        grow={ease(f, b.ck(2, 1) - 4, 36, EASE.out)}
        intensity={0.9 + burst * 0.4}
        height={1.3 + burst * 1.0}
        radius={0.3 + burst * 0.25}
        seed={8}
      />
      <Glow pos={[-3, 5, -12]} size={6} color="#fff3d0" intensity={pk * 0.7} />
      <Sparkles center={add3(RIM, [0, 0.5, 0])} f={f - b.ck(2, 2)} mode="rise" count={18} radius={0.6} size={0.06} seed={81} color="#fff2c0" intensity={2.0 * pk} />
    </>
  );
};

const FlowersOverlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => {
  const { f } = b;
  const questionK = reveal(f, b.ck(0, 0), b.ck(0, 2) - 4);
  const formulaK = reveal(f, b.ck(0, 2), openAt(b, 0) - 14);
  const paradiseK = reveal(f, b.ck(2, 2), b.dur - 4);
  return (
    <>
      <Scrim y={600} k={Math.max(questionK, formulaK, paradiseK)} height={300} strength={0.4} />
      <Layer x={SAFE_CX} y={600} k={questionK}>
        <Headline text="香りの正体は？" size={92} f={f} at={b.ck(0, 0)} />
      </Layer>
      <Layer x={SAFE_CX} y={600} k={formulaK}>
        <Chip text="紅茶 ＋ 4種の花" size={58}>
          <div style={{ display: "flex", gap: 6 }}>
            {PETAL_HEX.map((c) => (
              <Dot key={c} color={c} size={24} />
            ))}
          </div>
        </Chip>
      </Layer>
      {FLOWER_KINDS.map((k, i) => {
        const at = b.ck(1, ARRIVE_CHUNK[i]) - 2;
        const out = i < 3 ? b.ck(1, ARRIVE_CHUNK[i + 1]) - 2 : vortexAt(b) + 10;
        return (
          <Layer key={k} x={SAFE_CX} y={1300} k={reveal(f, at, out)}>
            <Chip text={NAMES[k]} size={56} accent={FLOWER_COLOR[k]}>
              <Dot color={FLOWER_COLOR[k]} size={32} />
            </Chip>
          </Layer>
        );
      })}
      <Layer x={SAFE_CX} y={600} k={paradiseK} rise={0}>
        <Headline text="楽園の香り" size={110} f={f} at={b.ck(2, 2)} sweepAt={b.ck(2, 3)} />
      </Layer>
    </>
  );
};

export const FLOWERS: SceneDefP = {
  topic: "香りの正体",
  shot: flowersShot,
  World: FlowersWorld,
  Overlay: FlowersOverlay,
  dipIn: true,
  bloom: (b) => 0.3 + paradise(b) * 0.1,
  light: (b) => {
    const pk = paradise(b);
    const onGlass = ease(b.f, vortexAt(b), 60);
    return {
      ...DEFAULT_LIGHTING,
      keyAt: [lerp(0, GLASS.pos[0], onGlass), 0.6, lerp(0, -0.2, onGlass)],
      keyAngle: 0.6,
      key: DEFAULT_LIGHTING.key + pk * 0.9,
      sky: 1 + pk * 0.2,
      bokeh: DEFAULT_LIGHTING.bokeh + pk * 0.5,
    };
  },
};
