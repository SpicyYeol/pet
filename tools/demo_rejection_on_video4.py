"""
Demo: Apply Rejection Features to existing candidate data for video 4.

This directly addresses request #1:
- Take real candidate traces we already generated for video 4
- Run rPPG
- Attach rejection scores
- Show before/after effect on selected BPM

This is a practical demonstration you can extend to the full anatomical pipeline.
"""

from pathlib import Path

import numpy as np
import pandas as pd

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from evaluate_rppg_methods import (
    METHOD_FUNCTIONS,
    estimate_bpm_from_signal,
    interpolate_rgb,
)
from rppg_rejection import RejectionScorer, compute_100bpm_artifact_power


def main():
    cache_path = Path("reports/rppg_single_view_sqi/cache/4_candidate_traces.npz")
    if not cache_path.exists():
        print(f"Cache not found: {cache_path}")
        print("Please run the single_view_sqi evaluator on video 4 first.")
        return

    data = np.load(cache_path, allow_pickle=True)
    times = data["times"]
    fs = float(data["effective_fps"][0])

    rois_to_check = ["face_full", "patch_r05_c05", "upper_face"]  # representative

    scorer = RejectionScorer()

    results = []

    for roi in rois_to_check:
        key = f"rgb__{roi}"
        if key not in data:
            continue

        rgb = data[key]
        uniform_t, uniform_rgb = interpolate_rgb(times, rgb, fs)
        if len(uniform_rgb) == 0:
            continue

        for method_name, fn in METHOD_FUNCTIONS.items():
            pulse = fn(uniform_rgb, fs, 70, 240)
            bpm, snr, _ = estimate_bpm_from_signal(pulse, fs, 70, 240)

            artifact = compute_100bpm_artifact_power(pulse, fs)

            # For demo we don't have aligned keypoints, so motion/mouth are faked low
            # In real use you would pass real keypoint data here
            rej = scorer.score_window(
                pulse=pulse,
                fs=fs,
                keypoints_df=pd.DataFrame(),   # empty = motion/mouth will be low
                frame_indices=list(range(len(pulse))),
            )

            results.append({
                "roi": roi,
                "method": method_name,
                "raw_bpm": round(bpm, 1),
                "snr": round(snr, 2),
                "artifact_100bpm": round(artifact, 3),
                "rejection_score": rej["rejection_score"],
            })

    df = pd.DataFrame(results)
    print("\n=== Rejection Demo on Video 4 (face-box candidates) ===")
    print(df.sort_values(["roi", "rejection_score"]).to_string(index=False))

    print("\n--- Effect of Rejection ---")
    kept = df[df["rejection_score"] < 0.4]
    rejected = df[df["rejection_score"] >= 0.4]

    print(f"Total windows: {len(df)}")
    print(f"Kept (rejection < 0.4): {len(kept)}")
    print(f"Rejected (rejection >= 0.4): {len(rejected)}")

    if len(kept) > 0:
        print(f"\nBPM distribution after light rejection:")
        print(kept.groupby("roi")["raw_bpm"].agg(["mean", "median", "count"]))


if __name__ == "__main__":
    main()
