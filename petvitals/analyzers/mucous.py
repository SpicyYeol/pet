"""Mucous-membrane color analyzer (perfusion / oxygenation cue).

Vets read gum/tongue/conjunctiva color constantly: pink (normal), pale (anemia/
shock), cyanotic/blue (hypoxia), icteric/yellow (jaundice), injected/red. This
samples the mouth/tongue ROI (from keypoints) across frames and estimates a
dominant color band in HSV.

IMPORTANT HONESTY: webcam color is uncalibrated and very lighting/white-balance
dependent, so this is LOW confidence. EWS only contributes for clearly-detected
cyanosis (most distinct + most dangerous) above a confidence floor; everything
else is flag/observational. A color-reference card would make this reliable.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.keypoints import pt
from ..core.session import Session

_MOUTH_KP = ["upper_jaw", "lower_jaw", "mouth_end_left", "mouth_end_right", "nose"]


@dataclass
class MucousConfig:
    min_conf: float = 0.30
    sample_frames: int = 25
    min_pixels: int = 300         # need this many plausible-mucosa pixels total
    min_confident_frac: float = 0.15  # >= this share of ROI usable -> usable read
    # HSV bands (OpenCV: H 0-180, S/V 0-255)
    sat_min: int = 50             # ignore washed-out / glare pixels
    val_min: int = 40
    val_max: int = 245


@register
class MucousAnalyzer(Analyzer):
    name = "mucous"
    description = "Mucous-membrane/tongue color (pallor/cyanosis/icterus); uncalibrated"

    def __init__(self, cfg: MucousConfig | None = None):
        self.cfg = cfg or MucousConfig()

    def _roi_bbox(self, frame, w, h):
        pts = [pt(frame, k, self.cfg.min_conf) for k in _MOUTH_KP]
        pts = [p for p in pts if p is not None]
        if len(pts) < 3:
            return None
        arr = np.array(pts)
        x0, y0 = arr.min(0); x1, y1 = arr.max(0)
        pad_x = (x1 - x0) * 0.15 + 4; pad_y = (y1 - y0) * 0.15 + 4
        x0 = int(max(0, x0 - pad_x)); x1 = int(min(w, x1 + pad_x))
        y0 = int(max(0, y0 - pad_y)); y1 = int(min(h, y1 + pad_y))
        if x1 - x0 < 4 or y1 - y0 < 4:
            return None
        return x0, y0, x1, y1

    def _classify(self, h, s, v):
        # h in 0-180. returns (label, is_abnormal)
        if s < 60:
            return "pale", True                      # low saturation -> pallor
        if 95 <= h <= 145:
            return "cyanotic", True                  # blue/purple
        if 18 <= h <= 38:
            return "icteric", True                   # yellow
        if (h <= 12 or h >= 168) and s >= 140:
            return "injected", True                  # deep red / congested
        return "pink", False                         # normal-ish red/pink

    def analyze(self, session: Session) -> AnalyzerResult:
        cfg = self.cfg
        empty = pd.DataFrame({"frame_index": []})
        if session.video_path is None or not Path(session.video_path).exists():
            return AnalyzerResult(self.name, empty,
                                  {"mucous_available": False,
                                   "note": "No video to sample mucous-membrane color."}, 0, [])
        try:
            import cv2
        except Exception:
            return AnalyzerResult(self.name, empty,
                                  {"mucous_available": False, "note": "opencv not available."}, 0, [])

        by_idx = {session.frame_index[i]: session.frames[i] for i in range(session.n_frames)}
        cap = cv2.VideoCapture(str(session.video_path))
        if not cap.isOpened():
            return AnalyzerResult(self.name, empty,
                                  {"mucous_available": False, "note": "could not open video."}, 0, [])
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        n_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or session.n_frames
        sample_at = set(np.linspace(0, max(n_total - 1, 0), cfg.sample_frames, dtype=int).tolist())

        collected, roi_attempts, roi_hits = [], 0, 0
        fidx = 0
        while True:
            ok, img = cap.read()
            if not ok:
                break
            if fidx in sample_at and fidx in by_idx:
                bb = self._roi_bbox(by_idx[fidx], w, h)
                if bb is not None:
                    roi_attempts += 1
                    x0, y0, x1, y1 = bb
                    roi = img[y0:y1, x0:x1]
                    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV).reshape(-1, 3)
                    m = ((hsv[:, 1] >= cfg.sat_min) & (hsv[:, 2] >= cfg.val_min)
                         & (hsv[:, 2] <= cfg.val_max))
                    if m.sum() >= 10:
                        roi_hits += 1
                        collected.append(hsv[m])
            fidx += 1
        cap.release()

        if not collected:
            return AnalyzerResult(self.name, empty,
                                  {"mucous_available": False,
                                   "note": "Mouth/tongue ROI not reliably visible."}, 0, [])

        px = np.vstack(collected)
        conf_frac = roi_hits / max(roi_attempts, 1)
        if len(px) < cfg.min_pixels or conf_frac < cfg.min_confident_frac:
            usable = False
        else:
            usable = True
        H, S, V = (float(np.median(px[:, 0])), float(np.median(px[:, 1])), float(np.median(px[:, 2])))
        label, abnormal = self._classify(H, S, V)

        flags, score, reasons = {}, 0, []
        # very conservative: only score cyanosis, and only when read is usable
        if usable and label == "cyanotic":
            score = 3
            flags["cyanosis_suspected"] = True
            reasons.append("suspected cyanosis (bluish mucous membranes) — verify, uncalibrated")
        elif usable and abnormal:
            flags[f"mucous_{label}"] = True
            reasons.append(f"mucous membranes appear {label} (uncalibrated, verify)")

        summary = {
            "mucous_available": True,
            "mm_color": label,
            "usable_read": bool(usable),
            "confidence_frac": round(conf_frac, 2),
            "median_hsv": [round(H, 1), round(S, 1), round(V, 1)],
            "n_pixels": int(len(px)),
            "flags": flags,
            "behavioral_ews_subscore": score,
            "note": "Uncalibrated, lighting-sensitive color estimate from the mouth/tongue ROI. "
                    "Low confidence; a color-reference card is needed for clinical use.",
        }
        return AnalyzerResult(self.name, empty, summary, score, reasons)
