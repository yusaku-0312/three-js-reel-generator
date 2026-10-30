"""Generate the whole narration as one ElevenLabs take through the API (only works on a plan that allows
library voices; the free key answers 402 → use the web editor in Chrome instead).

Usage: .venv/bin/python scripts/narration_reel/tts_api.py <name> [--take 1] [--part K]
Writes audio/take<N>_raw.mp3 (or audio/part<K>_t<N>.mp3 with --part; join_parts.py joins them) at normal
speed; prepare_take.py applies the speed.
"""
import argparse

import requests

from common import api_key, load_script, parts, project_dir, ui_lines


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("--take", type=int, default=1)
    ap.add_argument("--part", type=int, help="1-based part from script.json parts")
    args = ap.parse_args()
    proj = project_dir(args.name)
    script = load_script(proj)
    ids = parts(script)[args.part - 1] if args.part else None
    text = "\n".join(ui_lines(script, ids))
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{script['voice_id']}?output_format=mp3_44100_128",
        json={"text": text, "model_id": script["model_id"], "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},
        headers={"xi-api-key": api_key()},
        timeout=300,
    )
    if r.status_code != 200:
        raise SystemExit(f"TTS failed {r.status_code}: {r.text[:300]}\n→ generate in the ElevenLabs web editor (Chrome) instead")
    out = proj / "audio" / (f"part{args.part}_t{args.take}.mp3" if args.part else f"take{args.take}_raw.mp3")
    out.write_bytes(r.content)
    print("wrote", out)


if __name__ == "__main__":
    main()
