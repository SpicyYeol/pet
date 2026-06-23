"""Body-temperature analyzer (thermal / IR camera input).

Body temperature needs a thermal/IR camera (the UI already models IR cameras and
an `irOffsetTemp`). It is not present in this RGB dataset, so this analyzer reads
an external reading via reports/manual_vitals/<stem>.json. When present it
contributes a hyper-/hypo-thermia sub-score to the EWS; when absent it reports
`unavailable` and contributes 0.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.refvitals import load_reference_vitals
from ..core.session import Session


@dataclass
class TemperatureConfig:
    # canine rectal-equivalent normal ~38.0-39.2 C
    normal: tuple[float, float] = (38.0, 39.2)
    severe_high: float = 40.0
    severe_low: float = 37.0


@register
class TemperatureAnalyzer(Analyzer):
    name = "temperature"
    description = "Body temperature from a thermal/IR camera or reference reading"

    def __init__(self, cfg: TemperatureConfig | None = None):
        self.cfg = cfg or TemperatureConfig()

    def analyze(self, session: Session) -> AnalyzerResult:
        cfg = self.cfg
        ref = load_reference_vitals(session.stem) or {}
        temp = ref.get("temp_c")
        empty = pd.DataFrame({"frame_index": []})

        if temp is None:
            summary = {"temp_available": False,
                       "note": "No temperature reading. Provide reports/manual_vitals/"
                               f"{session.stem}.json with a 'temp_c' value (needs a thermal/IR camera)."}
            return AnalyzerResult(self.name, empty, summary, 0, [])

        temp = float(temp)
        flags, score, reasons = {}, 0, []
        if temp >= cfg.severe_high:
            score = 2; flags["severe_hyperthermia"] = True
            reasons.append(f"severe hyperthermia ({temp:.1f} C)")
        elif temp <= cfg.severe_low:
            score = 2; flags["severe_hypothermia"] = True
            reasons.append(f"severe hypothermia ({temp:.1f} C)")
        elif temp > cfg.normal[1]:
            score = 1; flags["hyperthermia"] = True
            reasons.append(f"hyperthermia ({temp:.1f} C)")
        elif temp < cfg.normal[0]:
            score = 1; flags["hypothermia"] = True
            reasons.append(f"hypothermia ({temp:.1f} C)")

        summary = {
            "temp_available": True,
            "temp_c": round(temp, 1),
            "source": ref.get("source", "unspecified"),
            "flags": flags,
            "behavioral_ews_subscore": score,
            "note": "Body temperature from a thermal/IR camera or reference (not RGB-derived).",
        }
        return AnalyzerResult(self.name, empty, summary, score, reasons)
