"""Shared helpers for the narration → Three.js reel flow (scripts/narration_reel/*).

Project layout (projects/<name>/):
  script.json        narration: model, voice, tag, speed, scenes → lines → [display, tts] chunks
  audio/             take<N>_raw.mp3 (ElevenLabs), take<N>_x.wav (sped up), take<N>_x.stt.json (Scribe)
  timing.md          per-line / per-chunk times on the chosen take (input to the animation plan)
  animation_plan.md  line-by-line Three.js plan (written by the agent)
  renders/, qa/
"""
import json
import os
from pathlib import Path

KIT_ROOT = Path(__file__).resolve().parents[2]
ENV = KIT_ROOT / ".env"
PROJECTS = KIT_ROOT / "projects"
PUBLIC = KIT_ROOT / "remotion-composer" / "public"
# Punctuation and spaces are not spoken: skipped when the script is aligned with what Scribe heard.
ALIGN_SKIP = set("、。，．！？!?「」『』（）() 　…〜~")


def api_key() -> str:
    """ElevenLabs key from the ELEVENLABS_API_KEY environment variable or <kit root>/.env (never printed)."""
    if os.environ.get("ELEVENLABS_API_KEY"):
        return os.environ["ELEVENLABS_API_KEY"].strip()
    if not ENV.exists():
        raise SystemExit("ELEVENLABS_API_KEY missing: set it in the environment or in .env at the kit root")
    for line in ENV.read_text().splitlines():
        if line.startswith("ELEVENLABS_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("ELEVENLABS_API_KEY missing in .env")


def project_dir(arg: str) -> Path:
    p = Path(arg)
    if not p.is_absolute():
        p = (PROJECTS / arg) if not (Path.cwd() / arg).exists() else (Path.cwd() / arg)
    if not (p / "script.json").exists():
        raise SystemExit(f"no script.json in {p}")
    return p.resolve()


def load_script(proj: Path) -> dict:
    script = json.loads((proj / "script.json").read_text())
    for scene in script["scenes"]:
        for li, chunks in enumerate(scene["lines"]):
            for display, tts in chunks:
                if len(display) > 11:
                    print(f"warning: subtitle chunk over 11 chars in {scene['id']}_{li}: {display}")
    return script


def line_text(chunks: list) -> str:
    """The spoken text of one line (tts halves of its chunks)."""
    return "".join(tts for _, tts in chunks)


def ui_lines(script: dict, scene_ids=None) -> list:
    """One entry per narration line, each led by the delivery tag, e.g. "[narrative] ...". """
    return [f"{script['tag']} {line_text(chunks)}" for scene in script["scenes"]
            if scene_ids is None or scene["id"] in scene_ids for chunks in scene["lines"]]


def parts(script: dict) -> list:
    """Scene-id groups generated as separate ElevenLabs takes (script.json "parts"; long input loses accuracy).
    Without "parts" the whole narration is one part."""
    groups = script.get("parts") or [[s["id"] for s in script["scenes"]]]
    order = [s["id"] for s in script["scenes"]]
    if [i for g in groups for i in g] != order:
        raise SystemExit(f"script.json parts must list every scene once, in order: {order}")
    return groups
