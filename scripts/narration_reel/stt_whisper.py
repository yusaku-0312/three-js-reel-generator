"""Local fallback for stt_check.py when the Scribe API key is out of credits: transcribe sped-up takes with
whisper.cpp (whisper-cli, large-v3-turbo) and write audio/take<N>_x.stt.json in Scribe's shape (words with
per-character times), so build_timeline.py reads it unchanged. Prints the same script → heard differences.

Usage: .venv/bin/python scripts/narration_reel/stt_whisper.py <name> 1 [2 ...]
"""
import difflib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from common import ALIGN_SKIP, line_text, load_script, project_dir

# whisper.cpp model: WHISPER_MODEL, else <kit root>/models/ggml-large-v3-turbo.bin
MODEL = Path(os.environ.get("WHISPER_MODEL") or Path(__file__).resolve().parents[2] / "models" / "ggml-large-v3-turbo.bin")


def whisper_tokens(wav: Path) -> list:
    with tempfile.TemporaryDirectory() as tmp:
        mono = Path(tmp) / "in.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-ar", "16000", "-ac", "1", str(mono)], check=True)
        out = Path(tmp) / "out"
        subprocess.run(["whisper-cli", "-m", str(MODEL), "-l", "ja", "-ojf", "-of", str(out), "-f", str(mono), "-np"],
                       check=True, capture_output=True)
        segments = json.loads(out.with_suffix(".json").read_text(errors="replace"))["transcription"]
    return [t for s in segments for t in s["tokens"] if not t["text"].startswith("[_")]


def to_scribe(tokens: list) -> dict:
    """One Scribe 'word' per token; a token split mid-character (U+FFFD) is merged into the next one."""
    words, pending, start = [], "", None
    for t in tokens:
        start = t["offsets"]["from"] / 1000 if start is None else start
        pending += t["text"]
        if "�" in pending and len(pending) < 4:
            continue
        text = pending.replace("�", "").strip()
        end = t["offsets"]["to"] / 1000
        if text:
            step = (end - start) / len(text)
            chars = [{"text": ch, "start": start + k * step, "end": start + (k + 1) * step} for k, ch in enumerate(text)]
            words.append({"type": "word", "text": text, "start": start, "end": end, "characters": chars})
        pending, start = "", None
    return {"text": "".join(w["text"] for w in words), "words": words}


def strip(text: str) -> str:
    return "".join(ch for ch in text if ch not in ALIGN_SKIP)


def main() -> None:
    proj = project_dir(sys.argv[1])
    script = load_script(proj)
    want = strip("".join(line_text(c) for s in script["scenes"] for c in s["lines"]))
    for take in sys.argv[2:]:
        res = to_scribe(whisper_tokens(proj / "audio" / f"take{take}_x.wav"))
        (proj / "audio" / f"take{take}_x.stt.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
        got = strip(res["text"])
        print(f"== take{take}: {res['text']}")
        sm = difflib.SequenceMatcher(None, want, got, autojunk=False)
        diffs = [(want[a1:a2], got[b1:b2]) for op, a1, a2, b1, b2 in sm.get_opcodes() if op != "equal"]
        print(f"   ratio {sm.ratio():.3f}; differences (script → heard): {diffs or 'none'}\n")


if __name__ == "__main__":
    main()
