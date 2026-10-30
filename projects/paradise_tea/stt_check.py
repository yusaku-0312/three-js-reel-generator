"""Transcribe a narration take with ElevenLabs Scribe (character timestamps) to catch misreads and time chunks.

Usage: python projects/paradise_tea/stt_check.py audio/take1_x11.wav [...]
Writes audio/<stem>.stt.json next to each input and prints the transcript.
"""
import json
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
ENV = ROOT.parents[1] / ".env"


def api_key() -> str:
    for line in ENV.read_text().splitlines():
        if line.startswith("ELEVENLABS_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("ELEVENLABS_API_KEY missing in .env")


def transcribe(path: Path, key: str) -> dict:
    with path.open("rb") as fh:
        r = requests.post(
            "https://api.elevenlabs.io/v1/speech-to-text",
            headers={"xi-api-key": key},
            data={"model_id": "scribe_v1", "language_code": "jpn", "timestamps_granularity": "character"},
            files={"file": (path.name, fh)},
            timeout=180,
        )
    if r.status_code != 200:
        raise SystemExit(f"STT failed {r.status_code}: {r.text[:300]}")
    return r.json()


def main() -> None:
    key = api_key()
    for arg in sys.argv[1:]:
        path = (ROOT / arg) if not Path(arg).is_absolute() else Path(arg)
        res = transcribe(path, key)
        out = path.with_suffix(".stt.json")
        out.write_text(json.dumps(res, ensure_ascii=False, indent=1))
        print(f"== {path.name}\n{res['text']}\n")


if __name__ == "__main__":
    main()
