"""Generate narration lines with ElevenLabs (with-timestamps) and chunk timings.

Model, voice, delivery tag and speed come from script.json (Eleven v4 / Otani / [narrative] / 1.1x).

Usage: python projects/paradise_tea/tts.py [--force] [--only hook_0,name_1]
Writes audio/<scene>_<n>.mp3 + .json (alignment) and audio/timings.json.
"""
import base64
import json
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
ENV = ROOT.parents[1] / ".env"
STABILITY = 0.5          # screenshot slider sits a little past the middle
SIMILARITY = 0.75


def api_key() -> str:
    for line in ENV.read_text().splitlines():
        if line.startswith("ELEVENLABS_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("ELEVENLABS_API_KEY missing in .env")


def synth(text: str, script: dict, key: str) -> dict:
    body = {
        "text": text,
        "model_id": script["model_id"],
        "voice_settings": {"stability": STABILITY, "similarity_boost": SIMILARITY, "speed": script["speed"]},
    }
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{script['voice_id']}/with-timestamps?output_format=mp3_44100_128",
        json=body,
        headers={"xi-api-key": key},
        timeout=180,
    )
    if r.status_code != 200:
        raise SystemExit(f"TTS failed {r.status_code}: {r.text[:400]}")
    return r.json()


def chunk_times(chunks: list, alignment: dict) -> list:
    """Find each chunk's tts text in the aligned characters (the tag may or may not be echoed)."""
    chars = alignment["characters"]
    starts, ends = alignment["character_start_times_seconds"], alignment["character_end_times_seconds"]
    joined = "".join(chars)
    out, pos = [], 0
    for display, tts in chunks:
        at = joined.find(tts, pos)
        if at < 0:
            raise SystemExit(f"chunk {tts!r} not found in alignment {joined!r}")
        last = at + len(tts) - 1
        out.append({"text": display, "start": round(starts[at], 3), "end": round(ends[last], 3)})
        pos = last + 1
    return out


def main() -> None:
    force = "--force" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))
    script = json.loads((ROOT / "script.json").read_text())
    audio_dir = ROOT / "audio"
    audio_dir.mkdir(exist_ok=True)
    key = api_key()
    timings = {}
    for scene in script["scenes"]:
        for i, chunks in enumerate(scene["lines"]):
            name = f"{scene['id']}_{i}"
            mp3, meta = audio_dir / f"{name}.mp3", audio_dir / f"{name}.json"
            text = f"{script['tag']} " + "".join(tts for _, tts in chunks)
            wanted = only is None or name in only
            if wanted and (force or not meta.exists()):
                print("TTS", name, text)
                res = synth(text, script, key)
                mp3.write_bytes(base64.b64decode(res["audio_base64"]))
                meta.write_text(json.dumps(res["alignment"], ensure_ascii=False))
            if not meta.exists():
                continue
            alignment = json.loads(meta.read_text())
            timings[name] = {
                "file": mp3.name,
                "duration": round(alignment["character_end_times_seconds"][-1], 3),
                "chunks": chunk_times(chunks, alignment),
            }
    (audio_dir / "timings.json").write_text(json.dumps(timings, ensure_ascii=False, indent=1))
    print("wrote", audio_dir / "timings.json")


if __name__ == "__main__":
    main()
