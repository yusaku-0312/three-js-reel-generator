"""Transcribe sped-up takes with ElevenLabs Scribe (character timestamps) and show where each differs from
the script, to catch misreads before timing. Spelling-only differences (一つ / ひとつ) are expected.

Usage: .venv/bin/python scripts/narration_reel/stt_check.py <name> 1 [2 ...]
Writes audio/take<N>_x.stt.json.
"""
import difflib
import json
import sys

import requests

from common import ALIGN_SKIP, api_key, line_text, load_script, project_dir


def transcribe(path, key: str) -> dict:
    with path.open("rb") as fh:
        r = requests.post(
            "https://api.elevenlabs.io/v1/speech-to-text",
            headers={"xi-api-key": key},
            data={"model_id": "scribe_v1", "language_code": "jpn", "timestamps_granularity": "character"},
            files={"file": (path.name, fh)},
            timeout=300,
        )
    if r.status_code != 200:
        raise SystemExit(f"STT failed {r.status_code}: {r.text[:300]}")
    return r.json()


def strip(text: str) -> str:
    return "".join(ch for ch in text if ch not in ALIGN_SKIP)


def main() -> None:
    proj = project_dir(sys.argv[1])
    script = load_script(proj)
    want = strip("".join(line_text(c) for s in script["scenes"] for c in s["lines"]))
    key = api_key()
    for take in sys.argv[2:]:
        wav = proj / "audio" / f"take{take}_x.wav"
        res = transcribe(wav, key)
        (proj / "audio" / f"take{take}_x.stt.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
        got = strip(res["text"].replace("[背景音楽]", ""))
        print(f"== take{take}: {res['text']}")
        sm = difflib.SequenceMatcher(None, want, got, autojunk=False)
        diffs = [(want[a1:a2], got[b1:b2]) for op, a1, a2, b1, b2 in sm.get_opcodes() if op != "equal"]
        print(f"   ratio {sm.ratio():.3f}; differences (script → heard): {diffs or 'none'}\n")


if __name__ == "__main__":
    main()
