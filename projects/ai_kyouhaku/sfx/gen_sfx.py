"""Sound effects / BGM for ai_kyouhaku via ElevenLabs sound-generation (works on the free key)."""
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "narration_reel"))
from common import PUBLIC, api_key  # noqa: E402

SOUNDS = {
    "bgm_kyouhaku": ("Calm, serious but hopeful background music loop for a parenting safety explainer, soft felt piano and warm pads, gentle, slow, reassuring, no drums, no vocals, 70 bpm", 22, True),
    "buzz": ("Smartphone vibrating on a bed twice, short buzz notification, muffled", 1.5, False),
    "coins": ("A few coins dropping and clinking, short", 1, False),
    "notify": ("Single short ominous message notification ping, low tone, smartphone", 1, False),
}

key = api_key()
out = PUBLIC / "kyouhaku"
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
