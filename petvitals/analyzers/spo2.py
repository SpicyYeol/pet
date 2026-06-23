"""SpO2 (oxygen saturation) analyzer.

SpO2 cannot be reliably derived from this RGB-only dataset (it needs calibrated
multi-wavelength imaging or a pulse oximeter), so this analyzer consumes an
external reading via reports/manual_vitals/<stem>.json (see core/refvitals). When
present it contributes a hypoxemia sub-score to the EWS; when absent it reports
`unavailable` and contributes 0 — the slot is wired for a future sensor.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.baselines import resolve_ranges
from ..core.refvitals import load_reference_vitals
from ..core.session import Session


@dataclass
class Spo2Config:
    normal_min: float = 95.0     # fallback; effective values from core.baselines
    mild_min: float = 90.0       # 90-94 = mild hypoxemia
    # < mild_min => severe hypoxemia


@register
class Spo2Analyzer(Analyzer):
    name = "spo2"
    description = "Oxygen saturation from an external sensor/reference (pulse-ox)"

    def __init__(self, cfg: Spo2Config | None = None):
        self.cfg = cfg or Spo2Config()

    def analyze(self, session: Session) -> AnalyzerResult:
        cfg = self.cfg
        ref = load_reference_vitals(session.stem) or {}
        spo2 = ref.get("spo2")
        empty = pd.DataFrame({"frame_index": []})

        if spo2 is None:
            summary = {"spo2_available": False,
                       "note": "No SpO2 reading. Provide reports/manual_vitals/"
                               f"{session.stem}.json with a 'spo2' value (needs a pulse "
                               "oximeter or calibrated multi-wavelength imaging)."}
            return AnalyzerResult(self.name, empty, summary, 0, [])

        rng = resolve_ranges(session.stem)
        normal_min = rng.get("spo2_normal_min", cfg.normal_min)
        mild_min = rng.get("spo2_mild_min", cfg.mild_min)

        spo2 = float(spo2)
        flags, score, reasons = {}, 0, []
        if spo2 < mild_min:
            score = 3
            flags["severe_hypoxemia"] = True
            reasons.append(f"severe hypoxemia (SpO2 {spo2:.0f}%)")
        elif spo2 < normal_min:
            score = 1
            flags["hypoxemia"] = True
            reasons.append(f"hypoxemia (SpO2 {spo2:.0f}%)")

        summary = {
            "spo2_available": True,
            "spo2_pct": round(spo2, 1),
            "source": ref.get("source", "unspecified"),
            "flags": flags,
            "behavioral_ews_subscore": score,
            "note": "SpO2 from an external sensor/reference (not camera-derived in this dataset).",
        }
        return AnalyzerResult(self.name, empty, summary, score, reasons)
