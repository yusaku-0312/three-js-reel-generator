"""Bring a downloaded ElevenLabs take into the project and speed it up (atempo keeps the pitch).

Usage: .venv/bin/python scripts/narration_reel/prepare_take.py <name> <downloaded.mp3> --take 1
       .venv/bin/python scripts/narration_reel/prepare_take.py <name> --take 1      (raw already in audio/, or take<N>_raw.wav from join_parts.py)
Writes audio/take<N>_raw.mp3 and audio/take<N>_x.wav (mono 44.1 kHz at script.json "speed").
"""
import argparse
import shutil
import subprocess
from pathlib import Path

from common import load_script, project_dir


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    return float(out.strip())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("source", nargs="?")
    ap.add_argument("--take", type=int, default=1)
    args = ap.parse_args()
    proj = project_dir(args.name)
    speed = float(load_script(proj)["speed"])
    raw = proj / "audio" / f"take{args.take}_raw.mp3"
    joined = proj / "audio" / f"take{args.take}_raw.wav"  # join_parts.py output
    if not args.source and not raw.exists() and joined.exists():
        raw = joined
    if args.source:
        shutil.copyfile(args.source, raw)
    if not raw.exists():
        raise SystemExit(f"missing {raw}")
    fast = proj / "audio" / f"take{args.take}_x.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", f"atempo={speed}", "-ar", "44100", "-ac", "1", str(fast)],
        check=True,
    )
    print(f"{raw.name} {duration(raw):.2f}s → {fast.name} {duration(fast):.2f}s at {speed}x")


if __name__ == "__main__":
    main()
