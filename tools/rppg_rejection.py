"""
rPPG Rejection Features for Pet Videos

Core idea: Before trusting any rPPG peak, compute strong signals that the window is bad.
This is especially critical for furry pets where signal is weak and artifacts dominate.

Functions here are designed to be attached to every candidate window.
"""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from scipy import signal


def compute_motion_magnitude(
    keypoints_df: pd.DataFrame,
    frame_indices: list[int] | np.ndarray,
    keypoint_names: list[str] | None = None,
) -> np.ndarray:
    """
    Compute per-frame motion magnitude from DLC keypoints.
    
    Returns array of shape (len(frame_indices),) with motion in pixels.
    """
    if keypoints_df is None or len(keypoints_df) == 0 or "keypoint" not in keypoints_df.columns:
        return np.full(len(frame_indices), 0.0)

    if keypoint_names is None:
        keypoint_names = keypoints_df["keypoint"].unique()[:8]  # limit for speed

    df = keypoints_df[keypoints_df["keypoint"].isin(keypoint_names)].copy()
    df = df.sort_values(["frame_index", "keypoint"])

    motion = []
    prev_pos = None

    for fi in frame_indices:
        frame_kps = df[df["frame_index"] == fi]
        if len(frame_kps) == 0:
            motion.append(np.nan)
            continue

        pos = frame_kps[["x", "y"]].to_numpy()
        if prev_pos is None or len(pos) != len(prev_pos):
            prev_pos = pos
            motion.append(0.0)
            continue

        dist = np.linalg.norm(pos - prev_pos, axis=1)
        motion.append(float(np.nanmedian(dist)))
        prev_pos = pos

    return np.array(motion, dtype=float)


def compute_100bpm_artifact_power(
    pulse: np.ndarray,
    fs: float,
    artifact_band: tuple[float, float] = (95, 115),
    analysis_band: tuple[float, float] = (70, 240),
) -> float:
    """
    Ratio of power in the classic ~100 bpm artifact band vs the rest of the analysis band.
    High value = strong artifact contamination.
    """
    if len(pulse) < 32 or not np.isfinite(pulse).all():
        return 1.0

    pulse = pulse - np.mean(pulse)
    nfft = int(2 ** np.ceil(np.log2(max(len(pulse), 64))) * 4)
    freqs, power = signal.periodogram(pulse, fs=fs, window="hann", nfft=nfft)

    lo, hi = analysis_band
    mask = (freqs >= lo / 60) & (freqs <= hi / 60)
    if mask.sum() < 5:
        return 1.0

    band_power = power[mask]
    band_freqs = freqs[mask] * 60

    art_mask = (band_freqs >= artifact_band[0]) & (band_freqs <= artifact_band[1])
    if art_mask.sum() < 2:
        return 0.0

    artifact_power = np.sum(band_power[art_mask])
    other_power = np.sum(band_power[~art_mask]) + 1e-12

    return float(artifact_power / other_power)


def compute_mouth_opening_proxy(
    keypoints_df: pd.DataFrame,
    frame_idx: int,
) -> float:
    """
    Simple proxy for mouth opening using SuperAnimal quadruped keypoints.
    Higher = more open mouth (likely panting/motion artifact).
    """
    if keypoints_df is None or len(keypoints_df) == 0 or "keypoint" not in keypoints_df.columns:
        return 0.0

    jaw = keypoints_df[
        (keypoints_df["frame_index"] == frame_idx) &
        (keypoints_df["keypoint"].isin(["lower_jaw", "upper_jaw", "mouth_end_left", "mouth_end_right"]))
    ]

    if len(jaw) < 2:
        return 0.0

    coords = jaw.set_index("keypoint")[["x", "y"]]

    try:
        upper = coords.loc["upper_jaw"].to_numpy()
        lower = coords.loc["lower_jaw"].to_numpy()
        dist = np.linalg.norm(upper - lower)
        return float(dist)
    except KeyError:
        return 0.0


def compute_background_correlation(
    roi_trace: np.ndarray,
    bg_trace: np.ndarray,
) -> float:
    """
    Pearson correlation between ROI RGB trace and background trace.
    High correlation often means the "pulse" is actually global illumination change.
    """
    if len(roi_trace) < 10 or len(bg_trace) < 10:
        return 0.0

    roi = roi_trace - np.mean(roi_trace, axis=0)
    bg = bg_trace - np.mean(bg_trace, axis=0)

    # Use green channel as proxy (common in rPPG)
    r = np.corrcoef(roi[:, 1], bg[:, 1])[0, 1]
    return float(np.nan_to_num(r, nan=0.0))


def combined_rejection_score(
    motion: float,
    artifact_ratio: float,
    mouth_score: float,
    bg_corr: float,
    motion_thresh: float = 8.0,
    artifact_thresh: float = 0.8,
    mouth_thresh: float = 15.0,
    bg_corr_thresh: float = 0.4,
) -> float:
    """
    Simple interpretable rejection score [0, 1].
    0 = keep, 1 = strongly reject.
    """
    score = 0.0
    if motion > motion_thresh:
        score += 0.35
    if artifact_ratio > artifact_thresh:
        score += 0.35
    if mouth_score > mouth_thresh:
        score += 0.15
    if bg_corr > bg_corr_thresh:
        score += 0.15
    return min(score, 1.0)


# Convenience class for batch processing
class RejectionScorer:
    def __init__(self, **thresholds):
        self.thresholds = thresholds

    def score_window(
        self,
        pulse: np.ndarray,
        fs: float,
        keypoints_df: pd.DataFrame | None,
        frame_indices: list[int],
        roi_rgb: np.ndarray | None = None,
        bg_rgb: np.ndarray | None = None,
    ) -> dict[str, float]:
        motion = compute_motion_magnitude(keypoints_df, frame_indices)
        motion_val = float(np.nanmedian(motion)) if len(motion) > 0 else 0.0

        artifact = compute_100bpm_artifact_power(pulse, fs)

        mouth = np.nanmean([
            compute_mouth_opening_proxy(keypoints_df, fi) for fi in frame_indices
        ])

        bg_corr = 0.0
        if roi_rgb is not None and bg_rgb is not None:
            bg_corr = compute_background_correlation(roi_rgb, bg_rgb)

        total = combined_rejection_score(
            motion_val, artifact, mouth, bg_corr, **self.thresholds
        )

        return {
            "rejection_score": round(total, 3),
            "motion": round(motion_val, 2),
            "artifact_100bpm_ratio": round(artifact, 3),
            "mouth_score": round(mouth, 2),
            "bg_correlation": round(bg_corr, 3),
        }


if __name__ == "__main__":
    print("rPPG Rejection Features module loaded. Use RejectionScorer or individual functions.")
