"""Start a narration reel project with the fixed voice rules.

Usage: .venv/bin/python scripts/narration_reel/new_project.py <name> --title "紅茶の雑学 パラダイスティー" --pattern tea
Creates projects/<name>/script.json (Eleven v4, Otani, [narrative], 1.2x) with an example scene to overwrite.
--pattern ai   AI-account reel (生成AIみんなの検定): the last line asks viewers to follow from the profile, and the
               video ends on the profile closing card (scaffold_remotion.py builds it).
--pattern tea  紅茶の雑学: no profile ending.
"""
import argparse
import json

from common import PROJECTS

VOICE = {
    "voice_name": "Otani - Inviting, Clear and Measured",
    "voice_id": "3JDquces8E8bkmvbh6Bc",
    "model_id": "eleven_v4",
    "model_name": "Eleven v4",
    "tag": "[narrative]",
    "speed": 1.2,
}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("--title", required=True)
    ap.add_argument("--pattern", choices=("ai", "tea"), required=True)
    args = ap.parse_args()
    proj = PROJECTS / args.name
    if (proj / "script.json").exists():
        raise SystemExit(f"{proj}/script.json already exists")
    for sub in ("audio", "renders", "qa"):
        (proj / sub).mkdir(parents=True, exist_ok=True)
    script = {
        "title": args.title,
        **VOICE,
        "note": "Each chunk = [display, tts]: display is the subtitle (<=11 chars), tts the words sent to ElevenLabs "
        "(numbers and risky readings in kana/kanji as they should be spoken). Each line gets the tag in front.",
        "pattern": args.pattern,
        "sources": [],
        "scenes": [
            {"id": "hook", "lines": [[["表示する字幕", "読ませる文、"], ["11文字以内で", "11もじいないで。"]]]},
        ] + ([{"id": "cta", "lines": [[["〇〇したい人は", "〇〇したい人は、"], ["プロフィールから", "プロフィールから"], ["フォローしてください！", "フォローしてください！"]]]}] if args.pattern == "ai" else []),
    }
    (proj / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=2) + "\n")
    print("created", proj / "script.json")


if __name__ == "__main__":
    main()
