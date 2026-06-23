"""Feeding / oral-activity analyzer (v0) — keypoint-only proxy.

Without a bowl ROI or a cage scale we cannot measure true intake, so v0 detects
*oral activity*: sustained head-lowered posture combined with jaw oscillation
(chewing / licking / nuzzling). This is clinically meaningful on its own
(lip-licking = nausea; eating events; reduced oral activity = inappetence cue)
and is the natural place to later add a bowl ROI + scale for real intake.

EWS: conservative. A 30 s clinic clip cannot establish anorexia, so the default
EWS contribution is 0 — the analyzer surfaces the signal and flags, and the
threshold for an inappetence contribution is opt-in via FeedingConfig.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.geometry import body_scale
from ..core.keypoints import mean_pt, pt
from ..core.session import Session

_MOUTH_TOP = ["upper_jaw", "nose"]
_MOUTH_BOT = ["lower_jaw"]
_HEAD_REF = ["neck_base", "back_base"]


@dataclass
class FeedingConfig:
    min_conf: float = 0.30
    head_down_margin: float = 0.05    # nose below neck (norm by body_scale) => head lowered
    jaw_motion_win: int = 5           # frames for jaw-opening variability (~0.5s)
    jaw_motion_thresh: float = 0.015  # norm jaw-gap std => active chewing/licking
    min_event_frames: int = 5         # sustained frames to count an oral event (~0.5s)
    inappetence_max_fraction: float = -1.0  # <0 disables EWS contribution by default


@register
class FeedingAnalyzer(Analyzer):
    name = "feeding"
    description = "Oral activity proxy (head-down + jaw motion); bowl ROI = future"

    def __init__(self, cfg: FeedingConfig | None = None):
        self.cfg = cfg or FeedingConfig()

    def _jaw_gap(self, frame: dict, scale: float) -> float:
        top = mean_pt(frame, _MOUTH_TOP, self.cfg.min_conf)
        bot = mean_pt(frame, _MOUTH_BOT, self.cfg.min_conf)
        if top is None or bot is None or not scale:
            return np.nan
        return float(np.linalg.norm(top - bot)) / scale

    def _head_down(self, frame: dict, scale: float) -> bool:
        nose = pt(frame, "nose", self.cfg.min_conf)
        ref = mean_pt(frame, _HEAD_REF, self.cfg.min_conf)
        if nose is None or ref is None or not scale:
            return False
        # image y grows downward: nose below ref (larger y) => head lowered
        return (nose[1] - ref[1]) / scale > self.cfg.head_down_margin

    def analyze(self, session: Session) -> AnalyzerResult:
        cfg = self.cfg
        n = session.n_frames
        scales, gaps, head_down = [], [], []
        for fr in session.frames:
            s = body_scale(fr, cfg.min_conf)
            scales.append(s if s else np.nan)
            gaps.append(self._jaw_gap(fr, s) if s else np.nan)
            head_down.append(self._head_down(fr, s) if s else False)
        gaps = np.array(gaps, dtype=float)

        # jaw motion = rolling std of jaw gap
        jaw_motion = np.full(n, np.nan)
        for i in range(n):
            lo = max(0, i - cfg.jaw_motion_win + 1)
            w = gaps[lo:i + 1]
            w = w[np.isfinite(w)]
            if len(w) >= 3:
                jaw_motion[i] = float(np.std(w))

        oral = np.array([
            bool(head_down[i] and np.isfinite(jaw_motion[i]) and jaw_motion[i] >= cfg.jaw_motion_thresh)
            for i in range(n)
        ])

        # count sustained oral events
        events, run = 0, 0
        for v in oral:
            run = run + 1 if v else 0
            if run == cfg.min_event_frames:
                events += 1
        oral_fraction = round(float(oral.mean()), 3) if n else 0.0

        per_frame = pd.DataFrame({
            "frame_index": session.frame_index,
            "time_sec": [round(t, 3) for t in session.times],
            "head_down": head_down,
            "jaw_motion": np.round(jaw_motion, 4),
            "oral_activity": oral,
        })

        flags = {"oral_activity_detected": bool(events > 0)}
        score, reasons = 0, []
        if (cfg.inappetence_max_fraction >= 0
                and oral_fraction <= cfg.inappetence_max_fraction):
            score = 1
            flags["possible_inappetence"] = True
            reasons.append("little/no oral activity observed")

        summary = {
            "duration_sec": session.duration_sec,
            "oral_activity_fraction": oral_fraction,
            "oral_events": int(events),
            "mean_jaw_motion": round(float(np.nanmean(jaw_motion)), 4) if np.isfinite(np.nanmean(jaw_motion)) else None,
            "flags": flags,
            "behavioral_ews_subscore": score,
            "note": "v0 oral-activity proxy (no bowl ROI / scale). Cannot measure true "
                    "intake; inappetence EWS is opt-in via FeedingConfig and needs longer monitoring.",
        }
        return AnalyzerResult(self.name, per_frame, summary, score, reasons)
