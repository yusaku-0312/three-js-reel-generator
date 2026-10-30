import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { H, W } from "../../koucha/theme";

/** Per-frame look: depth of field, bloom and grade. All values are pure functions of the frame. */
export type Look = {
  /** World distance from the camera to the plane in focus. */
  focus: number;
  /** Background blur radius in px (circle of confusion at infinity). 0 = everything sharp. */
  aperture: number;
  bloom: number;
  exposure: number;
  /** 0..1 dip to sunlight (transition glow), applied after tone mapping. */
  flash?: number;
  /** Corner brightness of the vignette (1 = none). */
  vignette?: number;
  /** Colour of the dip (sunset into the town, blue into the lab). */
  flashColor?: THREE.ColorRepresentation;
  /** 0..1 drain the colour (the "it was fake" freeze). */
  desat?: number;
  /** 0..1 RGB split and sliced rows (synthetic voice revealed). */
  glitch?: number;
  /** 0..1 red danger wash. */
  danger?: number;
};

const MAX_COC = 26;

// Golden-angle gather blur: each sample spreads by its own circle of confusion, so bright
// out-of-focus points open into discs and sharp foreground edges do not bleed into the background.
const dofMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: null },
      tDepth: { value: null },
      near: { value: 0.05 },
      far: { value: 80 },
      focus: { value: 3 },
      aperture: { value: 10 },
      texel: { value: new THREE.Vector2(1 / W, 1 / H) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      #include <packing>
      uniform sampler2D tColor;
      uniform sampler2D tDepth;
      uniform float near;
      uniform float far;
      uniform float focus;
      uniform float aperture;
      uniform vec2 texel;
      varying vec2 vUv;
      const float GOLDEN = 2.39996323;
      const float MAX_COC = ${MAX_COC.toFixed(1)};
      const float STEP = 0.9;

      // Any NaN/Inf from a material would be smeared into rectangles by the blur passes; drop it here.
      vec3 sane(vec3 c) { return any(isnan(c)) || any(isinf(c)) ? vec3(0.0) : min(c, vec3(64.0)); }
      float dist(vec2 uv) {
        return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, near, far);
      }
      float coc(float z) {
        return clamp(aperture * abs(z - focus) / max(z, 1e-3), 0.0, MAX_COC);
      }
      void main() {
        vec3 base = sane(texture2D(tColor, vUv).rgb);
        float centerZ = dist(vUv);
        float centerCoc = coc(centerZ);
        if (aperture < 0.01) { gl_FragColor = vec4(base, 1.0); return; }
        vec3 acc = base;
        float tot = 1.0;
        float radius = STEP;
        float ang = 0.0;
        for (int i = 0; i < 420; i++) {
          if (radius >= MAX_COC) break;
          vec2 tc = vUv + vec2(cos(ang), sin(ang)) * texel * radius;
          vec3 c = sane(texture2D(tColor, tc).rgb);
          float z = dist(tc);
          float sc = coc(z);
          if (z > centerZ) sc = clamp(sc, 0.0, centerCoc * 2.0);
          float m = smoothstep(radius - 0.5, radius + 0.5, sc);
          acc += mix(acc / tot, c, m);
          tot += 1.0;
          radius += STEP / radius;
          ang += GOLDEN;
        }
        gl_FragColor = vec4(acc / tot, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });

const TONE_DEFINES: Partial<Record<THREE.ToneMapping, string>> = {
  [THREE.ACESFilmicToneMapping]: "ACES_FILMIC_TONE_MAPPING",
  [THREE.AgXToneMapping]: "AGX_TONE_MAPPING",
  [THREE.NeutralToneMapping]: "NEUTRAL_TONE_MAPPING",
};

// Light vignette, a gentle cool-shadow / warm-light split-tone, tone mapping, sRGB, then dithering grain so the dark
// gradients do not band after H.264.
const finishMaterial = (toneMapping: THREE.ToneMapping) =>
  new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      toneMappingExposure: { value: 1 },
      flash: { value: 0 },
      flashColor: { value: new THREE.Color(1.0, 0.97, 0.86) },
      desat: { value: 0 },
      glitch: { value: 0 },
      danger: { value: 0 },
      vignette: { value: 0.82 },
      seed: { value: 0 },
      aspect: { value: W / H },
    },
    defines: { [TONE_DEFINES[toneMapping] ?? "NO_TONE_MAPPING"]: "" },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float flash;
      uniform vec3 flashColor;
      uniform float desat;
      uniform float glitch;
      uniform float danger;
      uniform float vignette;
      uniform float seed;
      uniform float aspect;
      #include <tonemapping_pars_fragment>
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p + seed, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec2 uv = vUv;
        float row = floor(uv.y * 48.0);
        float slice = step(0.82, hash(vec2(row, seed))) * glitch;
        uv.x += (hash(vec2(row * 1.7, seed + 3.0)) - 0.5) * 0.06 * slice;
        vec3 c = texture2D(tDiffuse, uv).rgb;
        if (glitch > 0.0) {
          c.r = texture2D(tDiffuse, uv + vec2(0.006 * glitch, 0.0)).r;
          c.b = texture2D(tDiffuse, uv - vec2(0.006 * glitch, 0.0)).b;
        }
        vec2 q = (vUv - 0.5) * vec2(aspect, 1.0);
        float vig = smoothstep(0.95, 0.25, length(q * vec2(1.25, 0.95)));
        c *= mix(vignette, 1.0, vig);
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(c, vec3(l), desat * 0.85);
        c = mix(c, c * vec3(1.25, 0.55, 0.55) + vec3(0.04, 0.0, 0.0), danger * 0.6);
        c *= mix(vec3(0.97, 1.0, 1.03), vec3(1.03, 1.0, 0.96), smoothstep(0.02, 0.5, l));
        #if defined( ACES_FILMIC_TONE_MAPPING )
          c = ACESFilmicToneMapping(c);
        #elif defined( AGX_TONE_MAPPING )
          c = AgXToneMapping(c);
        #elif defined( NEUTRAL_TONE_MAPPING )
          c = NeutralToneMapping(c);
        #endif
        vec4 outC = sRGBTransferOETF(vec4(c, 1.0));
        outC.rgb = mix(outC.rgb, flashColor, flash * smoothstep(1.2, 0.0, length(q)) );
        outC.rgb += (hash(vUv * 1000.0) - 0.5) * (2.5 / 255.0);
        gl_FragColor = vec4(outC.rgb, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });

const target = (samples: number, depth: boolean) =>
  new THREE.WebGLRenderTarget(W, H, {
    type: THREE.HalfFloatType,
    samples,
    depthBuffer: depth,
    depthTexture: depth ? new THREE.DepthTexture(W, H, THREE.UnsignedIntType) : undefined,
  });

/**
 * Takes over R3F's render: scene → MSAA HDR target with depth → DOF → bloom → finish → screen.
 * Mount once inside the ThreeCanvas; `look` is read every frame.
 */
export const Post: React.FC<{ look: Look; frame: number; toneMapping?: THREE.ToneMapping }> = ({
  look,
  frame,
  toneMapping = THREE.ACESFilmicToneMapping,
}) => {
  const gl = useThree((s) => s.gl);
  const pipe = useMemo(() => {
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.35, 0.45, 1.0);
    return {
      scene: target(4, true),
      a: target(0, false),
      b: target(0, false),
      dof: dofMaterial(),
      finish: finishMaterial(toneMapping),
      bloom,
      quad: new FullScreenQuad(),
    };
  }, [toneMapping]);
  useEffect(
    () => () => {
      [pipe.scene, pipe.a, pipe.b].forEach((t) => t.dispose());
      pipe.dof.dispose();
      pipe.finish.dispose();
      pipe.bloom.dispose();
      pipe.quad.dispose();
    },
    [pipe],
  );

  useFrame(({ scene, camera }) => {
    const cam = camera as THREE.PerspectiveCamera;
    gl.setRenderTarget(pipe.scene);
    gl.clear();
    gl.render(scene, cam);

    pipe.dof.uniforms.tColor.value = pipe.scene.texture;
    pipe.dof.uniforms.tDepth.value = pipe.scene.depthTexture;
    pipe.dof.uniforms.near.value = cam.near;
    pipe.dof.uniforms.far.value = cam.far;
    pipe.dof.uniforms.focus.value = look.focus;
    pipe.dof.uniforms.aperture.value = look.aperture;
    pipe.quad.material = pipe.dof;
    gl.setRenderTarget(pipe.a);
    pipe.quad.render(gl);

    pipe.bloom.strength = look.bloom;
    pipe.bloom.render(gl, pipe.b, pipe.a, 0, false);

    pipe.finish.uniforms.tDiffuse.value = pipe.a.texture;
    pipe.finish.uniforms.toneMappingExposure.value = look.exposure;
    pipe.finish.uniforms.flash.value = look.flash ?? 0;
    pipe.finish.uniforms.vignette.value = look.vignette ?? 0.82;
    pipe.finish.uniforms.flashColor.value.set(look.flashColor ?? "#fff7dc").convertLinearToSRGB();
    pipe.finish.uniforms.desat.value = look.desat ?? 0;
    pipe.finish.uniforms.glitch.value = look.glitch ?? 0;
    pipe.finish.uniforms.danger.value = look.danger ?? 0;
    pipe.finish.uniforms.seed.value = (frame % 97) * 0.731;
    pipe.quad.material = pipe.finish;
    gl.setRenderTarget(null);
    pipe.quad.render(gl);
  }, 1);
  return null;
};
