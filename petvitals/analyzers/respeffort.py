"""Respiratory effort / pattern analyzer.

Rate alone misses what vets care about most: breathing *pattern* and *effort* —
irregularity, apnea (pauses), and relative excursion amplitude. This reuses the
thoracic chest-motion proxy (tools/dual_respiratory_proxies) and derives:
  - breaths + rate, inter-breath regularity (CV)
  - longest apnea-like pause
  - relative chest excursion amplitude (uncalibrated; trend/relative only)

Clinically motivated; single-view + short-clip caveats apply. EWS contributes for
apnea and marked irregularity (both computable); raw amplitude is reported but not
scored without a per-patient baseline.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.session import Session

_REPO_ROOT = Path(__file__).resolve().parents[2]


@dataclass
class RespEffortConfig:
    min_breaths: int = 4
    irregular_cv: float = 0.45        # CV of breath intervals above this = irregular
    unreliable_cv: float = 1.0        # above this the breath detection is noise, not a read
    apnea_factor: float = 2.5         # pause > factor x median interval ...
    apnea_min_sec: float = 3.0        # ... and >= this many seconds = apnea
    apnea_severe_sec: float = 6.0
    apnea_context_cv: float = 0.5     # other breaths must be this regular to call a pause apnea
    plausible_rate: tuple[float, float] = (5.0, 120.0)  # brpm sanity bounds


@register
class RespEffortAnalyzer(Analyzer):
    name = "resp_effort"
    description = "Breathing pattern: regularity, apnea, relative excursion (chest proxy)"

    def __init__(self, cfg: RespEffortConfig | None = None):
        self.cfg = cfg or RespEffortConfig()

    def _chest_proxy(self, session: Session):
        try:
            if str(_REPO_ROOT / "tools") not in sys.path:
                sys.path.insert(0, str(_REPO_ROOT / "tools"))
            import dual_respiratory_proxies as drp
        except Exception:
            return None
        if session.keypoints_path is None:
            return None
        kps = pd.read_csv(session.keypoints_path)
        return drp.compute_thoracic_breathing_proxy(kps, session.n_frames)

    def analyze(self, session: Session) -> AnalyzerResult:
        from scipy.signal import find_peaks
        cfg = self.cfg
        fs = session.fps or 10.0
        proxy = self._chest_proxy(session)
        empty = pd.DataFrame({"frame_index": session.frame_index})

        if proxy is None or len(proxy) < int(fs * 5):
            return AnalyzerResult(self.name, empty,
                                  {"resp_effort_available": False,
                                   "note": "No chest proxy (needs keypoints + scipy)."}, 0, [])

        x = np.asarray(proxy, dtype=float)
        x = x - np.nanmean(x)
        amp = float(np.nanstd(x))  # relative excursion (uncalibrated)
        # breaths: peaks at >= ~0.5s apart (<=120 brpm ceiling)
        peaks, _ = find_peaks(x, distance=max(1, int(fs * 0.5)), height=0.2 * (amp or 1.0))
        per_frame = pd.DataFrame({"frame_index": session.frame_index,
                                  "chest_proxy": np.round(x, 4)})

        if len(peaks) < cfg.min_breaths:
            return AnalyzerResult(self.name, per_frame,
                                  {"resp_effort_available": False, "n_breaths": int(len(peaks)),
                                   "note": "Too few detectable breaths to assess pattern."}, 0, [])

        intervals = np.diff(peaks) / fs            # seconds between breaths
        rate = 60.0 / float(np.median(intervals))
        cv = float(np.std(intervals) / np.mean(intervals)) if np.mean(intervals) else 0.0
        med = float(np.median(intervals))
        longest_pause = float(np.max(intervals))
        # regularity of the OTHER breaths (excluding the single longest gap)
        rest = np.delete(intervals, int(np.argmax(intervals)))
        cv_rest = float(np.std(rest) / np.mean(rest)) if len(rest) and np.mean(rest) else cv

        flags, score, reasons = {}, 0, []
        base = {
            "resp_effort_available": True,
            "duration_sec": session.duration_sec,
            "n_breaths": int(len(peaks)),
            "resp_rate_brpm": round(rate, 1),
            "interval_cv": round(cv, 2),
            "longest_pause_sec": round(longest_pause, 1),
            "relative_amplitude": round(amp, 4),
        }

        # signal-quality gate: implausible rate or wildly varying intervals -> the
        # breath detection is noise, not a readable pattern (avoid false apnea alarms)
        plausible = cfg.plausible_rate[0] <= rate <= cfg.plausible_rate[1]
        if not plausible or cv > cfg.unreliable_cv:
            base["flags"] = {"resp_pattern_low_confidence": True}
            base["behavioral_ews_subscore"] = 0
            base["note"] = ("Chest-proxy breath detection too noisy for a reliable pattern read "
                            "on this clip (single-view, short window).")
            return AnalyzerResult(self.name, per_frame, base, 0, [])

        # apnea = a long pause amid otherwise-regular breathing
        if longest_pause >= max(cfg.apnea_min_sec, cfg.apnea_factor * med) and cv_rest < cfg.apnea_context_cv:
            sev = longest_pause >= cfg.apnea_severe_sec
            score += 2 if sev else 1
            key = "severe_apnea" if sev else "apnea"
            flags[key] = True
            reasons.append(f"{'severe ' if sev else ''}apnea-like pause ({longest_pause:.1f}s)")
        if cv >= cfg.irregular_cv:
            score += 1
            flags["irregular_breathing"] = True
            reasons.append(f"irregular breathing (interval CV {cv:.2f})")

        base["flags"] = flags
        base["behavioral_ews_subscore"] = min(3, score)
        base["note"] = ("Pattern/effort from a single-view chest proxy; amplitude is relative "
                        "(uncalibrated). Apnea/irregularity computable; effort needs a baseline.")
        return AnalyzerResult(self.name, per_frame, base, min(3, score), reasons)
