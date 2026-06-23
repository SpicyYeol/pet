"""Heart-rate-variability analyzer (v0) — nearly free from the rPPG pulse.

Reuses the cached single-window BVP traces produced by the rPPG visualization
step (reports/rppg_pet_keypoints/bvp_visualization/raw_bvp_traces.npz). For the
session's stem it detects pulse peaks -> inter-beat intervals (IBI) -> SDNN /
RMSSD (ms). HRV from short, noisy rPPG is research-grade, so the EWS contribution
is deliberately conservative and gated on a minimum beat count + SNR.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np

from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.session import Session

_REPO_ROOT = Path(__file__).resolve().parents[2]
_BVP_NPZ = _REPO_ROOT / "reports/rppg_pet_keypoints/bvp_visualization/raw_bvp_traces.npz"


@dataclass
class HrvConfig:
    min_ibi_ms: float = 200.0       # 300 bpm ceiling
    max_ibi_ms: float = 1500.0      # 40 bpm floor
    min_beats: int = 10             # below this, HRV is not reported
    min_snr: float = 8.0            # below this, mark low confidence
    low_sdnn_ms: float = 8.0        # very low variability -> conservative flag


@register
class HrvAnalyzer(Analyzer):
    name = "hrv"
    description = "Heart-rate variability (SDNN/RMSSD) from the cached rPPG pulse"

    def __init__(self, cfg: HrvConfig | None = None):
        self.cfg = cfg or HrvConfig()

    def _trace_for(self, stem: str):
        if not _BVP_NPZ.exists():
            return None, None
        import json
        d = np.load(_BVP_NPZ, allow_pickle=True)
        keys = [k for k in d.keys() if k.split("_")[0] == str(stem)]
        if not keys:
            return None, None
        meta_path = _BVP_NPZ.with_name("raw_bvp_traces_meta.json")
        meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
        # prefer the highest-SNR trace for the stem
        key = max(keys, key=lambda k: meta.get(k, {}).get("snr", 0.0))
        return np.asarray(d[key], dtype=float), {"key": key, **meta.get(key, {})}

    def analyze(self, session: Session) -> AnalyzerResult:
        import pandas as pd
        from scipy.signal import find_peaks

        cfg = self.cfg
        trace, meta = self._trace_for(session.stem)
        flags, reasons, score = {}, [], 0

        if trace is None or len(trace) < 20:
            summary = {"hrv_available": False,
                       "note": "No cached BVP trace for this stem; run the rPPG BVP step first."}
            return AnalyzerResult(self.name, pd.DataFrame({"sample": []}), summary, 0, [])

        fs = float(meta.get("fs", session.fps or 10.0))
        snr = float(meta.get("snr", 0.0))
        x = trace - np.mean(trace)
        std = np.std(x) or 1.0
        min_dist = max(1, int(fs * cfg.min_ibi_ms / 1000.0))
        peaks, _ = find_peaks(x, distance=min_dist, height=0.1 * std)
        ibi_ms = np.diff(peaks) / fs * 1000.0
        ibi_ms = ibi_ms[(ibi_ms >= cfg.min_ibi_ms) & (ibi_ms <= cfg.max_ibi_ms)]

        n_beats = int(len(ibi_ms) + 1) if len(ibi_ms) else 0
        per_frame = pd.DataFrame({"sample": np.arange(len(trace)),
                                  "bvp": np.round(x, 4)})

        if n_beats < cfg.min_beats:
            summary = {"hrv_available": False, "n_beats": n_beats,
                       "trace": meta.get("key"),
                       "note": "Too few clean beats for HRV in the cached window."}
            return AnalyzerResult(self.name, per_frame, summary, 0, [])

        sdnn = float(np.std(ibi_ms))
        rmssd = float(np.sqrt(np.mean(np.diff(ibi_ms) ** 2))) if len(ibi_ms) > 1 else float("nan")
        mean_hr = float(60000.0 / np.mean(ibi_ms))
        low_conf = snr < cfg.min_snr
        flags["hrv_low_confidence"] = bool(low_conf)

        # conservative: only contribute to EWS when confident AND variability is
        # very low (a possible autonomic/stress signal) -- caveated, not clinical.
        if not low_conf and sdnn < cfg.low_sdnn_ms:
            score = 1
            flags["very_low_hrv"] = True
            reasons.append(f"very low HRV (SDNN {sdnn:.0f} ms)")

        summary = {
            "duration_sec": round(len(trace) / fs, 1),
            "hrv_available": True,
            "trace": meta.get("key"),
            "trace_snr": round(snr, 2),
            "n_beats": n_beats,
            "mean_hr_bpm": round(mean_hr, 1),
            "sdnn_ms": round(sdnn, 1),
            "rmssd_ms": round(rmssd, 1) if np.isfinite(rmssd) else None,
            "flags": flags,
            "behavioral_ews_subscore": score,
            "note": "HRV from a short, single-window rPPG pulse — research-grade proxy, "
                    "not clinical. EWS contribution is gated on beat count + SNR.",
        }
        return AnalyzerResult(self.name, per_frame, summary, score, reasons)
