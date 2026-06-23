"""Posture / behavior analyzer (v0, rule-based).

Reuses the DLC keypoints already extracted for rPPG to classify posture
(standing / sitting / recumbency / abdominal-pain hunch / orthopnea / seizure)
and activity. Transparent, confidence-aware heuristics + temporal smoothing.

See docs/pose/POSE_CLASSIFIER_DESIGN.md for the full design and calibration log.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.geometry import body_scale, principal_axis_angle, signed_perp
from ..core.keypoints import HEAD, PAWS, SPINE, mean_pt, pt
from ..core.session import Session

POSTURES = [
    "standing_normal", "sitting", "sternal_recumbency", "lateral_recumbency",
    "hunched_abdominal_pain", "orthopnea_resp_distress", "seizure_or_tremor",
    "uncertain",
]


@dataclass
class PoseConfig:
    """All tunable thresholds (calibrate on labels — design doc §8)."""
    min_conf: float = 0.30
    min_valid_kp: int = 6
    # posture geometry
    stand_sep: float = 0.35
    recumbent_sep: float = 0.18
    spine_tilt_sit: float = 24.0   # standing ~14 deg, sitting ~31 deg (design §8.5)
    back_arch: float = 0.12
    neck_extend: float = 1.15
    paw_spread: float = 0.55
    head_low: float = 0.10
    elongation: float = 2.4
    # dynamics (noise floor of motion_energy ~0.06 on this dataset)
    motion_high: float = 0.20
    tremor: float = 0.85
    tremor_win: int = 7
    seizure_min_frames: int = 10
    # temporal smoothing
    smooth_radius: int = 5
    hysteresis: int = 5
    # behavior flags
    immobile_motion: float = 0.015
    prolonged_immobile_sec: float = 120.0


@dataclass
class Features:
    n_valid_kp: int = 0
    body_scale: float = np.nan
    vertical_separation: float = np.nan
    back_curvature: float = np.nan
    spine_tilt: float = np.nan
    neck_extension: float = np.nan
    head_height: float = np.nan
    front_paw_spread: float = np.nan
    body_elongation: float = np.nan
    motion_energy: float = np.nan
    tremor_index: float = np.nan


@register
class PoseAnalyzer(Analyzer):
    name = "pose"
    description = "Rule-based posture/behavior + activity (uses DLC keypoints)"

    def __init__(self, cfg: PoseConfig | None = None):
        self.cfg = cfg or PoseConfig()

    # ── feature extraction ────────────────────────────────────────
    def _features(self, frame: dict) -> Features:
        cfg = self.cfg
        f = Features()
        mc = cfg.min_conf
        valid = [p for p in (pt(frame, n, mc) for n in HEAD + SPINE + PAWS) if p is not None]
        f.n_valid_kp = len(valid)
        scale = body_scale(frame, mc)
        if scale is None or f.n_valid_kp < cfg.min_valid_kp:
            return f
        f.body_scale = scale

        trunk = mean_pt(frame, SPINE, mc)
        paws = mean_pt(frame, PAWS, mc)
        nose = pt(frame, "nose", mc)
        nb, tb = pt(frame, "neck_base", mc), pt(frame, "tail_base", mc)
        bm = pt(frame, "back_middle", mc)

        if trunk is not None and paws is not None:
            f.vertical_separation = (paws[1] - trunk[1]) / scale
        if nb is not None and tb is not None and bm is not None:
            f.back_curvature = signed_perp(nb, tb, bm) / scale

        spine_pts = [p for p in (pt(frame, n, mc) for n in SPINE) if p is not None]
        f.spine_tilt = principal_axis_angle(spine_pts) or np.nan

        if nose is not None and nb is not None:
            f.neck_extension = float(np.linalg.norm(nose - nb)) / scale
        if nose is not None and trunk is not None:
            f.head_height = (trunk[1] - nose[1]) / scale
        flp, frp = pt(frame, "front_left_paw", mc), pt(frame, "front_right_paw", mc)
        if flp is not None and frp is not None:
            f.front_paw_spread = float(np.linalg.norm(flp - frp)) / scale

        body_pts = [p for p in (pt(frame, n, mc) for n in SPINE + PAWS) if p is not None]
        if len(body_pts) >= 3:
            arr = np.array(body_pts)
            wh = arr.max(0) - arr.min(0)
            f.body_elongation = max(wh) / max(min(wh), 1e-6)
        return f

    def _add_dynamics(self, frames: list[dict], feats: list[Features]) -> None:
        cfg = self.cfg
        mc = cfg.min_conf
        names = HEAD + SPINE + PAWS

        def common(fa, fb):
            out = []
            for n in names:
                pa, pb = pt(fa, n, mc), pt(fb, n, mc)
                if pa is not None and pb is not None:
                    out.append((pa, pb))
            return out

        for i in range(len(frames)):
            if not np.isfinite(feats[i].body_scale):
                continue
            scale = feats[i].body_scale
            if i > 0:
                pairs = common(frames[i - 1], frames[i])
                if pairs:
                    feats[i].motion_energy = float(np.mean(
                        [np.linalg.norm(pb - pa) for pa, pb in pairs])) / scale
            lo = max(0, i - cfg.tremor_win + 1)
            cents = [c for c in (mean_pt(frames[j], SPINE + PAWS, mc)
                                 for j in range(lo, i + 1)) if c is not None]
            if len(cents) >= 3:
                cents = np.array(cents)
                path = float(np.sum(np.linalg.norm(np.diff(cents, axis=0), axis=1)))
                net = float(np.linalg.norm(cents[-1] - cents[0]))
                if path > 1e-6:
                    feats[i].tremor_index = 1.0 - (net / path)

    # ── classification ────────────────────────────────────────────
    def _classify(self, f: Features) -> str:
        cfg = self.cfg
        if f.n_valid_kp < cfg.min_valid_kp or not np.isfinite(f.body_scale):
            return "uncertain"
        me = f.motion_energy if np.isfinite(f.motion_energy) else 0.0
        tr = f.tremor_index if np.isfinite(f.tremor_index) else 0.0
        if tr >= cfg.tremor and me >= cfg.motion_high:
            return "seizure_or_tremor"
        sep = f.vertical_separation
        if np.isfinite(sep) and sep <= cfg.recumbent_sep:
            if np.isfinite(f.body_elongation) and f.body_elongation >= cfg.elongation:
                return "lateral_recumbency"
            return "sternal_recumbency"
        if np.isfinite(f.spine_tilt) and f.spine_tilt >= cfg.spine_tilt_sit:
            return "sitting"
        if np.isfinite(f.back_curvature) and f.back_curvature >= cfg.back_arch:
            return "hunched_abdominal_pain"
        neck_ok = np.isfinite(f.neck_extension) and f.neck_extension >= cfg.neck_extend
        spread_ok = np.isfinite(f.front_paw_spread) and f.front_paw_spread >= cfg.paw_spread
        head_low = (not np.isfinite(f.head_height)) or f.head_height <= cfg.head_low
        if neck_ok and spread_ok and head_low:
            return "orthopnea_resp_distress"
        if np.isfinite(sep) and sep >= cfg.stand_sep:
            return "standing_normal"
        return "standing_normal" if np.isfinite(sep) else "uncertain"

    # ── temporal post-processing ──────────────────────────────────
    def _suppress_short_seizures(self, labels: list[str]) -> list[str]:
        out, n, i = list(labels), len(labels), 0
        while i < n:
            if out[i] == "seizure_or_tremor":
                j = i
                while j < n and out[j] == "seizure_or_tremor":
                    j += 1
                if (j - i) < self.cfg.seizure_min_frames:
                    repl = out[i - 1] if i > 0 else "standing_normal"
                    if repl == "seizure_or_tremor":
                        repl = "standing_normal"
                    for k in range(i, j):
                        out[k] = repl
                i = j
            else:
                i += 1
        return out

    def _smooth(self, raw: list[str]) -> list[str]:
        cfg = self.cfg
        n = len(raw)
        moded = []
        for i in range(n):
            lo, hi = max(0, i - cfg.smooth_radius), min(n, i + cfg.smooth_radius + 1)
            moded.append(Counter(raw[lo:hi]).most_common(1)[0][0])
        out = [moded[0]]
        current = run_val = moded[0]
        run_len = 0
        for i in range(1, n):
            if moded[i] == current:
                run_val, run_len = current, 0
            elif moded[i] == run_val:
                run_len += 1
                if run_len >= cfg.hysteresis:
                    current, run_len = run_val, 0
            else:
                run_val, run_len = moded[i], 1
            out.append(current)
        return out

    # ── summary / EWS ─────────────────────────────────────────────
    def _summarize(self, df: pd.DataFrame, fps: float) -> tuple[dict, int, list[str]]:
        cfg = self.cfg
        n = len(df)
        frac = {k: round(v, 3) for k, v in
                (df["posture_smoothed"].value_counts() / n).to_dict().items()}
        me = pd.to_numeric(df["motion_energy"], errors="coerce").fillna(0.0).to_numpy()
        immobile = me < cfg.immobile_motion
        longest = cur = 0
        for v in immobile:
            cur = cur + 1 if v else 0
            longest = max(longest, cur)
        longest_immobile_sec = round(longest / fps, 1)

        flags = {
            "orthopnea_detected": bool(frac.get("orthopnea_resp_distress", 0) > 0.05),
            "seizure_detected": bool(frac.get("seizure_or_tremor", 0) > 0.02),
            "abdominal_pain_posture": bool(frac.get("hunched_abdominal_pain", 0) > 0.10),
            "lateral_recumbency_dominant": bool(frac.get("lateral_recumbency", 0) > 0.50),
            "prolonged_immobility": bool(longest_immobile_sec >= cfg.prolonged_immobile_sec),
        }
        score, reasons = 0, []
        if flags["seizure_detected"]:
            score += 3; reasons.append("seizure/tremor observed")
        if flags["orthopnea_detected"]:
            score += 3; reasons.append("orthopnea posture observed")
        if flags["abdominal_pain_posture"]:
            score += 1; reasons.append("abdominal-pain posture")
        if flags["lateral_recumbency_dominant"]:
            score += 1; reasons.append("predominantly lateral recumbency")
        if flags["prolonged_immobility"]:
            score += 1; reasons.append("prolonged immobility")
        ews = min(3, score)

        summary = {
            "n_frames": int(n), "fps": fps, "duration_sec": round(n / fps, 1),
            "uncertain_fraction": frac.get("uncertain", 0.0),
            "posture_time_fraction": frac,
            "mean_activity": round(float(np.nanmean(me)), 4),
            "longest_immobile_sec": longest_immobile_sec,
            "flags": flags,
            "behavioral_ews_subscore": ews,
            "note": "v0 single-view heuristic; calibrate thresholds on labels before clinical reading.",
        }
        return summary, ews, reasons

    # ── public API ────────────────────────────────────────────────
    def analyze(self, session: Session) -> AnalyzerResult:
        feats = [self._features(fr) for fr in session.frames]
        self._add_dynamics(session.frames, feats)
        raw = [self._classify(f) for f in feats]
        smoothed = self._suppress_short_seizures(self._smooth(raw))

        def r(v, nd):
            return round(v, nd) if np.isfinite(v) else ""
        rows = []
        for i, f in enumerate(feats):
            rows.append({
                "frame_index": session.frame_index[i],
                "time_sec": round(session.times[i], 3),
                "posture_raw": raw[i], "posture_smoothed": smoothed[i],
                "n_valid_kp": f.n_valid_kp,
                "vertical_separation": r(f.vertical_separation, 4),
                "back_curvature": r(f.back_curvature, 4),
                "spine_tilt": r(f.spine_tilt, 2),
                "neck_extension": r(f.neck_extension, 4),
                "head_height": r(f.head_height, 4),
                "front_paw_spread": r(f.front_paw_spread, 4),
                "body_elongation": r(f.body_elongation, 3),
                "motion_energy": r(f.motion_energy, 4),
                "tremor_index": r(f.tremor_index, 3),
            })
        per_frame = pd.DataFrame(rows)
        summary, ews, reasons = self._summarize(per_frame, session.fps)
        return AnalyzerResult(name=self.name, per_frame=per_frame, summary=summary,
                              ews_subscore=ews, ews_reasons=reasons)
