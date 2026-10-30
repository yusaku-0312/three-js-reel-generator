"""Create the Remotion/Three.js composition for a narration reel, based on src/paradise.

Copies the composition shell (core, main component, overlays, types) into remotion-composer/src/<slug>,
points it at public/<slug>/timeline.json, writes one placeholder scene per scene id in script.json, an
empty cue list, copies the stock sound effects, and registers <Comp> in Root.tsx.
3D building blocks (stage, post, fx, glass, flowers, fruits, props) are imported from src/paradise/three;
write theme-specific ones in src/<slug>/three.

Patterns (script.json "pattern", or --pattern):
  ai   AI-account reels (生成AIみんなの検定): the last scene ends on the shared profile closing card
       (src/narration/ProfileCta.tsx: closing line + the account's profile screenshot, series band hidden);
       templates/profile_cta.png is copied to public/<slug>/profile.png.
  tea  紅茶の雑学: no profile closing card (the tea ending is not decided yet; end on the summary card).

Run after build_timeline.py (the timeline must exist).
Usage: .venv/bin/python scripts/narration_reel/scaffold_remotion.py <name> --slug <slug> --comp <CompId> --series "知ってた？紅茶の雑学" [--pattern tea]
"""
import argparse
import json
import re
import shutil
from pathlib import Path

from common import KIT_ROOT, PUBLIC, load_script, project_dir

SRC = KIT_ROOT / "remotion-composer" / "src"
BASE = SRC / "paradise"
TEMPLATES = Path(__file__).resolve().parent / "templates"
PATTERNS = ("ai", "tea")
STOCK_AUDIO = ["bgm", "ding", "drip", "pop", "pour", "sparkle", "splash", "whoosh", "ice", "breeze"]

PLACEHOLDER = '''import React from "react";
import { Beat } from "../core";
import { breathe, ease, EASE, Shot2 } from "../../golden2/shot";
import { Headline, Layer, reveal, SAFE_CX } from "../overlays";
import { Glow } from "../../paradise/three/fx";
import { SceneDefP } from "../types";

// Placeholder: replace with the scene from animation_plan.md (see src/paradise/scenes for worked examples).
const shot = (b: Beat): Shot2 => breathe({ pos: [0, 2.2, 7], target: [0, 0.9, 0], fov: 30, aperture: 4 }, b.f);

const World: React.FC<{ b: Beat }> = () => <Glow pos={[0, 0.9, 0]} size={1.2} intensity={0.4} />;

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => (
  <Layer x={SAFE_CX} y={700} k={reveal(b.f, 4) * ease(b.f, 0, 8, EASE.out)}>
    <Headline text="__ID__" size={90} f={b.f} at={4} />
  </Layer>
);

export const __CONST__: SceneDefP = { topic: "__ID__", shot, World, Overlay, dipIn: __DIP__ };
'''

# Last scene of an "ai" reel: the closing line is spoken over the picture, then the profile card takes over
# from the chunk 「プロフィールから」 (set CTA_LINE/CTA_CHUNK to it) and the series band fades out.
AI_LAST = '''import React from "react";
import { Beat } from "../core";
import { breathe, Shot2 } from "../../golden2/shot";
import { Glow } from "../../paradise/three/fx";
import { ProfileCta, profileBandOff } from "../../narration/ProfileCta";
import { SceneDefP } from "../types";

// Placeholder for the closing scene (pattern "ai"): draw the closing picture in World, and keep the profile card.
// TODO: CTA_LINE / CTA_CHUNK = the chunk where 「プロフィールから」 starts; LINES = the closing line (≤9 chars × 2).
const CTA_LINE = 0;
const CTA_CHUNK = 0;
const LINES = ["__LINE1__", "__LINE2__"];
const ctaAt = (b: Beat) => b.ck(CTA_LINE, CTA_CHUNK);

const shot = (b: Beat): Shot2 => breathe({ pos: [0, 2.2, 7], target: [0, 0.9, 0], fov: 30, aperture: 4 }, b.f);

const World: React.FC<{ b: Beat }> = () => <Glow pos={[0, 0.9, 0]} size={1.2} intensity={0.4} />;

const Overlay: React.FC<{ b: Beat; shot: Shot2 }> = ({ b }) => (
  <ProfileCta f={b.f} at={ctaAt(b)} lines={LINES} src="__SLUG__/profile.png" />
);

export const __CONST__: SceneDefP = {
  topic: "__ID__",
  shot,
  World,
  Overlay,
  dipIn: true,
  bandOff: (b) => profileBandOff(b.f, ctaAt(b)),
};
'''

CUES = '''import { sec } from "../koucha/anim";
import { TL } from "./core";

const sceneById = (id: string) => TL.scenes.find((s) => s.id === id)!;

/** [scene, line (-1 = scene start), chunk, frame offset, sfx file in public/__SLUG__, volume, seconds?] */
export type Sfx = [string, number, number, number, string, number, number?];

// Sound follows what the picture does; fill from animation_plan.md.
export const SFX: Sfx[] = [];

export const sfxFrame = ([id, line, chunk, offset]: Sfx) => {
  const s = sceneById(id);
  return sec(s.start) + (line < 0 ? 0 : sec(s.lines[line].chunks[chunk])) + offset;
};
'''


def rewrite(text: str, slug: str, comp: str) -> str:
    text = text.replace("public/paradise/", f"public/{slug}/")
    text = text.replace('"./three/', '"../paradise/three/')
    text = re.sub(r'staticFile\("paradise/', f'staticFile("{slug}/', text)
    text = text.replace("staticFile(`paradise/", f"staticFile(`{slug}/")
    text = text.replace("PARADISE_DURATION", f"{slug.upper()}_DURATION")
    # Every shell can hide the series band (scene `bandOff`); only the "ai" closing card uses it.
    text = text.replace(
        "      <Band frame={frame} scenes={SCENES} />",
        "      <AbsoluteFill style={{ opacity: 1 - (def.bandOff?.(b) ?? 0) }}>\n        <Band frame={frame} scenes={SCENES} />\n      </AbsoluteFill>",
    )
    text = text.replace(
        "  dipLines?: number[];\n};",
        "  dipLines?: number[];\n  /** 0..1 how far the series band is hidden (the \"ai\" profile closing card has none). */\n  bandOff?: (b: Beat) => number;\n};",
    )
    return text.replace("ParadiseTea", comp)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("--slug", required=True)
    ap.add_argument("--comp", required=True)
    ap.add_argument("--series", required=True)
    ap.add_argument("--pattern", choices=PATTERNS, help='default: script.json "pattern"')
    args = ap.parse_args()
    proj = project_dir(args.name)
    script = load_script(proj)
    pattern = args.pattern or script.get("pattern")
    if pattern not in PATTERNS:
        raise SystemExit('say which pattern: --pattern ai (AI-account reel, profile ending) or --pattern tea (紅茶の雑学)')
    if not (PUBLIC / args.slug / "timeline.json").exists():
        raise SystemExit("run build_timeline.py first")
    out = SRC / args.slug
    if out.exists():
        raise SystemExit(f"{out} already exists")
    (out / "scenes").mkdir(parents=True)

    for name in ("core.ts", "overlays.tsx", "types.ts"):
        (out / name).write_text(rewrite((BASE / name).read_text(), args.slug, args.comp))
    (out / f"{args.comp}.tsx").write_text(rewrite((BASE / "ParadiseTea.tsx").read_text(), args.slug, args.comp))
    overlays = out / "overlays.tsx"
    overlays.write_text(re.sub(r'export const SERIES = ".*?";', f"export const SERIES = {json.dumps(args.series, ensure_ascii=False)};", overlays.read_text()))
    (out / "cues.ts").write_text(CUES.replace("__SLUG__", args.slug))

    ids = [s["id"] for s in script["scenes"]]
    consts = {i: re.sub(r"\W", "_", i).upper() for i in ids}
    for k, i in enumerate(ids):
        if pattern == "ai" and k == len(ids) - 1:
            text = AI_LAST.replace("__ID__", i).replace("__CONST__", consts[i]).replace("__SLUG__", args.slug)
        else:
            text = PLACEHOLDER.replace("__ID__", i).replace("__CONST__", consts[i]).replace("__DIP__", "false" if k == 0 else "true")
        (out / "scenes" / f"{i}.tsx").write_text(text)
    if pattern == "ai":
        shutil.copyfile(TEMPLATES / "profile_cta.png", PUBLIC / args.slug / "profile.png")
    index = ['import { SceneDefP } from "../types";']
    index += [f'import {{ {consts[i]} }} from "./{i}";' for i in ids]
    index += ["", "export const SCENES: Record<string, SceneDefP> = {"] + [f"  {json.dumps(i)}: {consts[i]}," for i in ids] + ["};", ""]
    (out / "scenes" / "index.ts").write_text("\n".join(index))

    for a in STOCK_AUDIO:
        src, dst = PUBLIC / "paradise" / f"{a}.mp3", PUBLIC / args.slug / f"{a}.mp3"
        if src.exists() and not dst.exists():
            shutil.copyfile(src, dst)

    root = SRC / "Root.tsx"
    text = root.read_text()
    if f'id="{args.comp}"' not in text:
        dur = f"{args.slug.upper()}_DURATION"
        imp = f'import {{ {args.comp} }} from "./{args.slug}/{args.comp}";\nimport {{ {dur} }} from "./{args.slug}/core";\n'
        anchor = 'import { ParadiseTea } from "./paradise/ParadiseTea";\n'
        comp = f'      <Composition id="{args.comp}" component={{{args.comp}}} durationInFrames={{{dur}}} fps={{30}} width={{1080}} height={{1920}} />\n'
        anchor2 = '      <Composition id="ParadiseTea"'
        if anchor not in text or anchor2 not in text:
            raise SystemExit("Root.tsx anchors not found; register the composition by hand")
        text = text.replace(anchor, anchor + imp)
        i = text.index(anchor2)
        j = text.index("\n", i) + 1
        text = text[:j] + comp + text[j:]
        root.write_text(text)
    print(f"created {out} ({len(ids)} placeholder scenes) and registered {args.comp}")
    if pattern == "ai":
        print(f"pattern ai: scenes/{ids[-1]}.tsx ends on the profile card (set CTA_LINE/CTA_CHUNK/LINES); public/{args.slug}/profile.png")
    else:
        print("pattern tea: no profile closing card")


if __name__ == "__main__":
    main()
