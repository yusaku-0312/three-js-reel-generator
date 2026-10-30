"""Extra sound effects for chatgpt_kondate via ElevenLabs sound-generation (the rest are copied from public/kondate)."""
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "narration_reel"))
from common import PUBLIC, api_key  # noqa: E402

SOUNDS = {
    "ng": ("Soft cartoon wrong-answer buzzer, short low 'bubu', gentle and comic, not harsh", 0.8),
    "typing": ("Quick soft smartphone keyboard taps, five light clicks", 1.0),
    "twitch": ("Comic anime irritation sound effect, short tense 'piki' twitch, two quick snaps", 0.8),
    "mug": ("Ceramic mug set down gently on a wooden table, soft clink", 0.8),
}

key = api_key()
out = PUBLIC / "chatkondate"
for name, (text, dur) in SOUNDS.items():
    dst = out / f"{name}.mp3"
    if dst.exists():
        continue
    body = {"text": text, "duration_seconds": dur, "prompt_influence": 0.5}
    r = requests.post("https://api.elevenlabs.io/v1/sound-generation", headers={"xi-api-key": key}, json=body, timeout=180)
    if r.status_code != 200:
        print(name, "failed", r.status_code, r.text[:200])
        continue
    dst.write_bytes(r.content)
    print(name, len(r.content))
