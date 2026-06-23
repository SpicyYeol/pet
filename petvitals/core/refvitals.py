"""Loader for externally-measured vitals (sensor / reference monitor).

Some vitals cannot be derived from this RGB dataset:
  - SpO2 needs calibrated multi-wavelength (or a pulse oximeter).
  - Body temperature needs a thermal/IR camera (the UI already models IR cams).

Rather than fabricate them, the SpO2 / temperature analyzers read an optional
per-stem JSON dropped here by whatever sensor is available:

    reports/manual_vitals/<stem>.json
    { "spo2": 97.0, "temp_c": 38.6, "source": "pulse_ox|thermal_cam|monitor|..." }

If the file is absent the analyzer reports `unavailable` and contributes 0 to the
EWS — the slot is wired and waits for real sensor input.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

_REPO_ROOT = Path(__file__).resolve().parents[2]
_DIR = _REPO_ROOT / "reports/manual_vitals"


def load_reference_vitals(stem: str) -> Optional[dict]:
    path = _DIR / f"{stem}.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
