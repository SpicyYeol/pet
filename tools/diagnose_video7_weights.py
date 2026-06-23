#!/usr/bin/env python3
"""
Deep diagnostic on Video 7 with old vs new dog_learned weights.

Focus: Why did error go from 21.3 (old) to 62.9 (new) in the latest full eval?
- Dense sliding window extraction on best ROIs for v7.
- Compare BPM error, chosen peaks, and try prior-guided estimation.
- Identify problematic ROIs / time segments.
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))

from experiment_multi_area_roi_improved import (
    load_probe, extract_rgb_single_center, extract_rgb_multi_patch,
    MULTI_PATCH_AREAS, SINGLE_ROIS, FS, WIN
)
from dog_specific_rppg import (
    sig_dog_learned, estimate_bpm_with_prior, get_default_dog_weights
)
from evaluate_rppg_methods import estimate_bpm_from_signal

VIDEO7_GT = 189.5
OLD_WEIGHTS = np.array([0.2116, -0.8323, 0.5124])
NEW_WEIGHTS = np.array([0.286, -0.7886, 0.5443])

def main():
    print("=== Deep Dive: Video 7 (target 189.5 bpm) - Old vs New dog weights ===\n")

    probe = load_probe("7")
    if probe[0] is None:
        print("ERROR: No probe for video 7")
        return

    _, kps, frames = probe
    n_frames = len(frames)
    print(f"Loaded video 7 probe: {n_frames} frames")

    # Best zones for v7 from prior experiments
    zones = [
        ("ear_area_right", "multi"),
        ("muzzle_area", "multi"),
        ("throat_exposed", "single"),
        ("nose_bridge", "single"),
    ]

    step = 15  # dense ~1.5s steps for good coverage
    starts = list(range(10, max(1, n_frames - WIN - 5), step))

    results = []

    for roi_name, variant in zones:
        print(f"\n--- Analyzing {roi_name} ({variant}) ---")
        good_windows = 0

        for start in starts:
            try:
                if variant == "multi" and roi_name in MULTI_PATCH_AREAS:
                    rgb, _ = extract_rgb_multi_patch(frames, kps, MULTI_PATCH_AREAS[roi_name]["patches"], start, WIN)
                else:
                    spec = SINGLE_ROIS.get(roi_name, {"kps": ["nose", "upper_jaw"], "radius": 14})
                    rgb, _ = extract_rgb_single_center(frames, kps, spec["kps"], spec.get("radius", 14), start, WIN)
                if len(rgb) < 150 or not np.isfinite(rgb).all():
                    continue
            except Exception:
                continue

            good_windows += 1

            # OLD weights
            p_old = sig_dog_learned(rgb, FS, 70, 240, weights=OLD_WEIGHTS)
            bpm_old, snr_old, _ = estimate_bpm_from_signal(p_old, FS, 70, 240)
            err_old = abs(bpm_old - VIDEO7_GT) if np.isfinite(bpm_old) else 999

            # NEW weights (current default)
            p_new = sig_dog_learned(rgb, FS, 70, 240, weights=NEW_WEIGHTS)
            bpm_new, snr_new, _ = estimate_bpm_from_signal(p_new, FS, 70, 240)
            err_new = abs(bpm_new - VIDEO7_GT) if np.isfinite(bpm_new) else 999

            # NEW + prior-guided (target ~189)
            bpm_prior, snr_prior, _ = estimate_bpm_with_prior(p_new, FS, 70, 240, target_prior=VIDEO7_GT, prior_strength=0.5)
            err_prior = abs(bpm_prior - VIDEO7_GT) if np.isfinite(bpm_prior) else 999

            results.append({
                "roi": roi_name,
                "variant": variant,
                "start": start,
                "old_bpm": round(bpm_old,1) if np.isfinite(bpm_old) else None,
                "old_err": round(err_old,1),
                "old_snr": round(snr_old,2),
                "new_bpm": round(bpm_new,1) if np.isfinite(bpm_new) else None,
                "new_err": round(err_new,1),
                "new_snr": round(snr_new,2),
                "prior_bpm": round(bpm_prior,1) if np.isfinite(bpm_prior) else None,
                "prior_err": round(err_prior,1),
            })

        print(f"  Analyzed {good_windows} valid windows")

    df = pd.DataFrame(results)
    if df.empty:
        print("No valid windows extracted.")
        return

    # Summary stats
    print("\n" + "="*70)
    print("VIDEO 7 SUMMARY - OLD vs NEW vs NEW+PRIOR")
    print("="*70)

    print("\n--- Mean error by ROI (new weights) ---")
    for roi in df["roi"].unique():
        sub = df[df["roi"] == roi]
        print(f"  {roi:20s}: new_err_mean={sub['new_err'].mean():5.1f}  (n={len(sub)})")

    print("\n--- Windows where OLD was good (<30 err) but NEW was bad (>50 err) ---")
    bad_for_new = df[(df["old_err"] < 30) & (df["new_err"] > 50)]
    print(f"Count: {len(bad_for_new)}")
    if len(bad_for_new) > 0:
        print(bad_for_new[["roi", "start", "old_bpm", "old_err", "new_bpm", "new_err"]].head(8).to_string(index=False))

    print("\n--- Effect of prior-guided estimation on NEW projection ---")
    print(f"Mean error NEW (plain):     {df['new_err'].mean():.1f}")
    print(f"Mean error NEW + prior 189: {df['prior_err'].mean():.1f}")

    # Best windows for new weights
    print("\n--- Best windows for NEW weights (lowest error) ---")
    best_new = df.nsmallest(5, "new_err")[["roi", "start", "new_bpm", "new_err", "new_snr"]]
    print(best_new.to_string(index=False))

    # Save detailed CSV for further inspection
    out_path = Path("reports/rppg_pet_keypoints/video7_weights_diagnostic.csv")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"\nDetailed per-window results saved to: {out_path}")

    print("\nKey insight candidates:")
    print("- Look for cases where new projection creates stronger energy around 125-130 bpm")
    print("- prior-guided often recovers the correct peak when the raw projection has competing frequencies.")

if __name__ == "__main__":
    main()
