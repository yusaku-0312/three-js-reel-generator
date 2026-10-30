"""Sound effects / BGM for ai_kondate via ElevenLabs sound-generation (works on the free key)."""
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "narration_reel"))
from common import PUBLIC, api_key  # noqa: E402

SOUNDS = {
    "bgm_kondate": ("Gentle cozy kitchen background music loop, light ukulele and soft glockenspiel, warm, playful, home cooking, no vocals, 96 bpm", 22, True),
    "shutter": ("Smartphone camera shutter click sound, crisp, single shot", 1, False),
    "fridge": ("Refrigerator door opening with a soft seal pop and light hum", 1.6, False),
    "send": ("Short soft message sent whoosh notification sound, smartphone chat app", 1, False),
    "steps_kid": ("Small child footsteps hopping happily on a wooden floor, short", 1.5, False),
}

key = api_key()
out = PUBLIC / "kondate"
for name, (text, dur, loop) in SOUNDS.items():
    dst = out / f"{name}.mp3"
    if dst.exists():
        continue
    body = {"text": text, "duration_seconds": dur, "prompt_influence": 0.5}
    if loop:
        body["loop"] = True
    r = requests.post("https://api.elevenlabs.io/v1/sound-generation", headers={"xi-api-key": key}, json=body, timeout=180)
    if r.status_code != 200:
        print(name, "failed", r.status_code, r.text[:200])
        continue
    dst.write_bytes(r.content)
    print(name, len(r.content))
