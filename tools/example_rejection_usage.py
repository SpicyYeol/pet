"""
Example: How to use the new rejection features on existing candidate data.

This is meant as a template you can integrate into evaluate_single_view_sqi.py
or your own pipeline.
"""

from pathlib import Path

import numpy as np
import pandas as pd

from rppg_rejection import RejectionScorer, compute_100bpm_artifact_power

# Example with cached traces (from previous single_view_sqi run)
CACHE = Path("reports/rppg_single_view_sqi/cache/4_candidate_traces.npz")

if CACHE.exists():
    data = np.load(CACHE, allow_pickle=True)
    times = data["times"]
    rgb_face = data["rgb__face_full"]

    # Fake a simple pulse (in real code use your POS/CHROM function)
    from tools.evaluate_rppg_methods import sig_pos
    fs = float(data["effective_fps"][0])
    pulse = sig_pos(rgb_face, fs, 70, 240)

    # Load keypoints if you have them for this video
    # keypoints = pd.read_csv(".../pet_keypoints_normalized.csv")

    scorer = RejectionScorer()

    # Minimal example (without keypoints for demo)
    artifact = compute_100bpm_artifact_power(pulse, fs)
    print(f"100bpm artifact ratio on face_full (video 4): {artifact:.3f}")

    print("\nIn a real pipeline you would attach these scores to every window and filter/train on them.")
else:
    print("Run this after generating candidate traces for a video.")
