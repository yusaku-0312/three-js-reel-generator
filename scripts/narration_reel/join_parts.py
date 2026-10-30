"""Join the per-part ElevenLabs takes (script.json "parts") into one take that the rest of the flow reads.

Each part's leading/trailing silence is trimmed and the parts are butted together with GAP seconds of
silence, about the pause ElevenLabs leaves between lines inside one take (before the speed-up).

Usage: .venv/bin/python scripts/narration_reel/join_parts.py <name> <part1.mp3> <part2.mp3> ... --take 3
Writes audio/take<N>_raw.wav; then run prepare_take.py <name> --take N.
"""
import argparse
import subprocess
from pathlib import Path

from common import load_script, parts, project_dir

SR = 44100
GAP = 0.85          # seconds of silence between parts (raw speed; 0.71 s after 1.2x) ≈ line pause inside a take
TRIM_DB = -45       # silence threshold for trimming part edges
EDGE_PAD = 0.04     # keep this much of the edge so breaths/consonants are not clipped


def trimmed(src: Path, dst: Path) -> None:
    trim = f"silenceremove=start_periods=1:start_threshold={TRIM_DB}dB:start_silence={EDGE_PAD}"
    chain = f"{trim},areverse,{trim},areverse"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", chain, "-ar", str(SR), "-ac", "1", str(dst)], check=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("sources", nargs="+")
    ap.add_argument("--take", type=int, required=True)
    ap.add_argument("--gap", type=float, default=GAP)
    args = ap.parse_args()
    proj = project_dir(args.name)
    groups = parts(load_script(proj))
    if len(args.sources) != len(groups):
        raise SystemExit(f"script.json has {len(groups)} parts, got {len(args.sources)} files")
    work = proj / "audio" / "parts_tmp"
    work.mkdir(exist_ok=True)
    pieces = []
    for k, src in enumerate(args.sources, 1):
        piece = work / f"p{k}.wav"
        trimmed(Path(src), piece)
        pieces.append(piece)
    silence = work / "gap.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono",
                    "-t", str(args.gap), str(silence)], check=True)
    order = [p for piece in pieces for p in (piece, silence)][:-1]
    listing = work / "concat.txt"
    listing.write_text("".join(f"file '{p}'\n" for p in order))
    out = proj / "audio" / f"take{args.take}_raw.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing), "-c", "copy", str(out)], check=True)
    print(f"joined {len(pieces)} parts with {args.gap}s gaps → {out}")


if __name__ == "__main__":
    main()
