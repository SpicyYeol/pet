"""rPPG physiological analyzer — HR (heart rate) + RR (respiration) + panting.

This wraps the project's existing rPPG work into the unified analyzer framework
so heart/breathing signals join the early-warning score next to behavior (pose):

  - HR : read from the anatomical pipeline's cached per-window results
         (`..._analysis_aggressive/rejection_anatomical_results.csv`), taking the
         median of the highest-SNR windows that passed rejection. This reuses the
         validated pipeline output rather than re-running torch/DLC here.
  - RR : computed live from the session keypoints via the existing
         tools/dual_respiratory_proxies.py (thoracic chest-motion breathing rate)
         plus a panting indicator — light, no heavy dependencies.

EWS sub-score: tachy-/brady-cardia and tachy-/brady-pnea against configurable
canine normal ranges. Designed so a future live HR hook can drop in unchanged.
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
class RppgConfig:
    # HR selection from cached windows
    max_rejection: float = 0.35     # keep windows with rejection score <= this
    hr_top_k: int = 5               # median of the K highest-SNR kept windows
    # canine normal ranges (resting; calibrate per setting) -- bpm / breaths-per-min
    hr_normal: tuple[float, float] = (60.0, 160.0)
    hr_severe: tuple[float, float] = (50.0, 180.0)
    rr_normal: tuple[float, float] = (10.0, 40.0)
    rr_severe: tuple[float, float] = (6.0, 60.0)
    rr_min_confidence: float = 0.30  # below this, RR is treated as unavailable
    strong_panting_intensity: float = 3.0


@register
class RppgAnalyzer(Analyzer):
    name = "rppg"
    description = "Heart rate (cached anatomical pipeline) + respiration/panting (keypoints)"

    def __init__(self, cfg: RppgConfig | None = None):
        self.cfg = cfg or RppgConfig()

    # ── HR from cached anatomical results ─────────────────────────
    def _hr_csv_for(self, session: Session) -> Path | None:
        stem = session.stem
        candidates = [
            _REPO_ROOT / f"reports/rppg_pet_keypoints/dlc_probe_{stem}_gpu/{stem}_analysis_aggressive/rejection_anatomical_results.csv",
            _REPO_ROOT / f"reports/rppg_pet_keypoints/dlc_probe_{stem}/{stem}_analysis_aggressive/rejection_anatomical_results.csv",
        ]
        if stem == "4":
            candidates.append(_REPO_ROOT / "reports/rppg_pet_keypoints/dlc_full4_roi_analysis_v2/rejection_anatomical_results.csv")
        for c in candidates:
            if c.exists():
                return c
        return None

    def _estimate_hr(self, session: Session) -> dict:
        cfg = self.cfg
        path = self._hr_csv_for(session)
        if path is None:
            return {"hr_bpm": None, "hr_source": None, "hr_windows_kept": 0}
        df = pd.read_csv(path)
        for col in ("raw_bpm", "snr"):
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        kept = df
        if "rejection_aggressive" in df.columns:
            agg = df[pd.to_numeric(df["rejection_aggressive"], errors="coerce") <= cfg.max_rejection]
            if len(agg):
                kept = agg
        if kept is df and "rejection_lenient" in df.columns:
            len_ = df[pd.to_numeric(df["rejection_lenient"], errors="coerce") <= cfg.max_rejection]
            if len(len_):
                kept = len_
        kept = kept.dropna(subset=["raw_bpm", "snr"])
        if not len(kept):
            return {"hr_bpm": None, "hr_source": str(path.relative_to(_REPO_ROOT)), "hr_windows_kept": 0}
        top = kept.sort_values("snr", ascending=False).head(cfg.hr_top_k)
        return {
            "hr_bpm": round(float(np.median(top["raw_bpm"])), 1),
            "hr_snr": round(float(np.median(top["snr"])), 2),
            "hr_roi": str(top.iloc[0].get("roi", "")),
            "hr_method": str(top.iloc[0].get("method", "")),
            "hr_windows_kept": int(len(kept)),
            "hr_source": str(path.relative_to(_REPO_ROOT)),
        }

    # ── RR + panting from keypoints (wrap existing module) ────────
    def _estimate_respiration(self, session: Session) -> dict:
        try:
            if str(_REPO_ROOT / "tools") not in sys.path:
                sys.path.insert(0, str(_REPO_ROOT / "tools"))
            import dual_respiratory_proxies as drp
        except Exception as e:  # scipy/module missing
            return {"rr_bpm": None, "rr_error": f"{type(e).__name__}: {e}"}
        if session.keypoints_path is None:
            return {"rr_bpm": None}
        kps = pd.read_csv(session.keypoints_path)
        res = drp.compute_dual_respiratory_proxies(kps, session.n_frames)

        def clean(v):
            return None if v is None or not np.isfinite(v) else round(float(v), 1)
        return {
            "rr_bpm": clean(res.get("thoracic_breathing_rate")),
            "rr_confidence": round(float(res.get("thoracic_confidence", 0.0)), 2),
            "panting_rate": clean(res.get("panting_rate")),
            "panting_intensity": round(float(res.get("panting_intensity", 0.0)), 3),
            "_chest_proxy": res.get("chest_proxy"),
            "_facial_proxy": res.get("facial_proxy"),
        }

    # ── EWS scoring ───────────────────────────────────────────────
    def _score(self, hr: dict, rr: dict) -> tuple[dict, int, list[str]]:
        cfg = self.cfg
        flags, score, reasons = {}, 0, []

        hr_bpm = hr.get("hr_bpm")
        flags["hr_unavailable"] = hr_bpm is None
        if hr_bpm is not None:
            if hr_bpm < cfg.hr_severe[0] or hr_bpm > cfg.hr_severe[1]:
                score += 2
                kind = "bradycardia" if hr_bpm < cfg.hr_severe[0] else "tachycardia"
                flags[f"severe_{kind}"] = True
                reasons.append(f"severe {kind} (HR {hr_bpm} bpm)")
            elif hr_bpm < cfg.hr_normal[0] or hr_bpm > cfg.hr_normal[1]:
                score += 1
                kind = "bradycardia" if hr_bpm < cfg.hr_normal[0] else "tachycardia"
                flags[kind] = True
                reasons.append(f"{kind} (HR {hr_bpm} bpm)")

        rr_bpm = rr.get("rr_bpm")
        rr_conf = rr.get("rr_confidence", 0.0)
        rr_usable = rr_bpm is not None and rr_conf >= cfg.rr_min_confidence
        flags["rr_low_confidence"] = rr_bpm is not None and not rr_usable
        if rr_usable:
            if rr_bpm < cfg.rr_severe[0] or rr_bpm > cfg.rr_severe[1]:
                score += 2
                kind = "bradypnea" if rr_bpm < cfg.rr_severe[0] else "tachypnea"
                flags[f"severe_{kind}"] = True
                reasons.append(f"severe {kind} (RR {rr_bpm} brpm)")
            elif rr_bpm < cfg.rr_normal[0] or rr_bpm > cfg.rr_normal[1]:
                score += 1
                kind = "bradypnea" if rr_bpm < cfg.rr_normal[0] else "tachypnea"
                flags[kind] = True
                reasons.append(f"{kind} (RR {rr_bpm} brpm)")

        if rr.get("panting_intensity", 0.0) >= cfg.strong_panting_intensity:
            flags["strong_panting"] = True
            reasons.append("strong panting (thermoregulation/stress; corrupts HR)")

        return flags, min(3, score), reasons

    # ── public API ────────────────────────────────────────────────
    def analyze(self, session: Session) -> AnalyzerResult:
        hr = self._estimate_hr(session)
        rr = self._estimate_respiration(session)
        flags, ews, reasons = self._score(hr, rr)

        # per-frame respiratory proxy traces (handy for plots/overlays)
        chest = rr.pop("_chest_proxy", None)
        facial = rr.pop("_facial_proxy", None)
        n = session.n_frames
        per_frame = pd.DataFrame({"frame_index": session.frame_index,
                                  "time_sec": [round(t, 3) for t in session.times]})
        if chest is not None and len(chest) == n:
            per_frame["chest_proxy"] = np.round(chest, 4)
        if facial is not None and len(facial) == n:
            per_frame["facial_proxy"] = np.round(facial, 4)

        summary = {"duration_sec": session.duration_sec, **hr, **rr,
                   "flags": flags, "behavioral_ews_subscore": ews,
                   "note": "HR from cached anatomical pipeline; RR is a keypoint chest-motion proxy. "
                           "Canine ranges are configurable defaults, not clinical thresholds."}
        return AnalyzerResult(name=self.name, per_frame=per_frame, summary=summary,
                              ews_subscore=ews, ews_reasons=reasons)
