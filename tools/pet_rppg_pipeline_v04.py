#!/usr/bin/env python3
"""
Pet rPPG Pipeline v0.4 — Recommended Direction

This is the unified skeleton that combines:
- Anatomical ROI extraction (from DLC keypoints or future lightweight tracker)
- Strong rejection features (motion, 100bpm artifact, mouth, background)
- Classical rPPG methods (POS, CHROM, etc.)
- Scored candidate output ready for simple rules or learned selector

Design goals:
- Make "good tissue + aggressive rejection" the default, not an experiment.
- Pluggable ROI source (DLC full, lightweight tracker, etc.)
- Easy to swap in better keypoint models later.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from tools import rppg_rejection
from tools.evaluate_rppg_methods import (
    METHOD_FUNCTIONS,
    estimate_bpm_from_signal,
    interpolate_rgb,
    safe_bandpass,
)


@dataclass
class AnatomicalROIConfig:
    name: str
    keypoint_names: list[str]
    radius: int = 20


# Recommended stable anatomical ROIs for dogs (based on our experiments)
DEFAULT_ANATOMICAL_ROIS = [
    AnatomicalROIConfig("neck", ["neck", "throat"], radius=28),
    AnatomicalROIConfig("nose_bridge", ["nose", "upper_jaw"], radius=18),
    AnatomicalROIConfig("left_ear_base", ["left_earbase"], radius=16),
    AnatomicalROIConfig("right_ear_base", ["right_earbase"], radius=16),
    AnatomicalROIConfig("upper_chest", ["neck", "withers"], radius=30),
]


class PetRPPGPipelineV04:
    def __init__(
        self,
        anatomical_rois: list[AnatomicalROIConfig] | None = None,
        rejection_scorer: rppg_rejection.RejectionScorer | None = None,
        methods: list[str] | None = None,
        min_bpm: float = 70,
        max_bpm: float = 240,
    ):
        self.anatomical_rois = anatomical_rois or DEFAULT_ANATOMICAL_ROIS
        self.rejection_scorer = rejection_scorer or rppg_rejection.RejectionScorer()
        self.methods = methods or ["pos", "chrom", "g_minus_r", "green"]
        self.min_bpm = min_bpm
        self.max_bpm = max_bpm

    def extract_anatomical_traces(
        self,
        video_path: Path,
        keypoints_df: pd.DataFrame,
        animal_mask_fn: Any | None = None,   # function(frame) -> mask
        sample_fps: float = 10.0,
    ) -> dict[str, np.ndarray]:
        """
        Extract RGB traces for anatomical ROIs.
        In v0.4 we expect keypoints + optional mask.
        Later this can be swapped with the lightweight tracker output.
        """
        # TODO: Implement robust extraction with mask intersection + interpolation
        # For now this is a stub that the user can fill with logic from
        # analyze_anatomical_rois_full.py + evaluate_dlc_keypoint_roi_probe.py
        print("[v0.4] Anatomical trace extraction not fully implemented yet.")
        print("      Use analyze_anatomical_rois_full.py as reference for now.")
        return {}

    def score_windows(
        self,
        traces: dict[str, np.ndarray],
        fs: float,
        keypoints_df: pd.DataFrame,
        frame_indices: list[int],
    ) -> list[dict]:
        """
        Run rPPG + rejection scoring on windows.
        This is the core of the v0.4 philosophy.
        """
        results = []

        for roi_name, rgb in traces.items():
            if rgb.shape[0] < 32:
                continue

            uniform_t, uniform_rgb = interpolate_rgb(
                np.arange(len(rgb)), rgb, fs
            )
            if len(uniform_rgb) == 0:
                continue

            for method in self.methods:
                fn = METHOD_FUNCTIONS[method]
                try:
                    pulse = fn(uniform_rgb, fs, self.min_bpm, self.max_bpm)
                    bpm, snr, ratio = estimate_bpm_from_signal(
                        pulse, fs, self.min_bpm, self.max_bpm
                    )
                except Exception:
                    continue

                # Rejection features
                rej = self.rejection_scorer.score_window(
                    pulse=pulse,
                    fs=fs,
                    keypoints_df=keypoints_df,
                    frame_indices=frame_indices,
                )

                results.append({
                    "roi": roi_name,
                    "method": method,
                    "bpm": bpm,
                    "snr": snr,
                    "rejection_score": rej["rejection_score"],
                    "artifact_100bpm": rej["artifact_100bpm_ratio"],
                    "motion": rej["motion"],
                })

        return results


def main():
    parser = argparse.ArgumentParser(description="Pet rPPG Pipeline v0.4")
    parser.add_argument("--keypoints", type=Path, help="Normalized DLC keypoints CSV")
    parser.add_argument("--video", type=Path, help="Source video (or clip)")
    parser.add_argument("--out", type=Path, default=Path("reports/rppg_v04_results.csv"))
    args = parser.parse_args()

    print("=== Pet rPPG Pipeline v0.4 (Skeleton) ===")
    print("This is the unified structure combining Anatomical ROI + Rejection.")
    print("Full implementation is work in progress.")
    print()

    pipeline = PetRPPGPipelineV04()

    if args.keypoints and args.keypoints.exists():
        kps = pd.read_csv(args.keypoints)
        print(f"Loaded {len(kps)} keypoint rows")
        # In a real run we would call pipeline.extract_anatomical_traces(...)
        # and then pipeline.score_windows(...)

    print("\nNext steps:")
    print("  1. Fill in extract_anatomical_traces using existing code")
    print("  2. Wire in actual YOLO mask generation")
    print("  3. Connect to lightweight tracker when ready (see lightweight_anatomical_tracker.py)")


if __name__ == "__main__":
    main()
