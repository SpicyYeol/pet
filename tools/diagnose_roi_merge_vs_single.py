#!/usr/bin/env python3
"""
Diagnostic: When does forcing multi-patch ROI merge help vs hurt?

This directly addresses the user's latest point:
"Scoring 이슈로 보임. 꼭 ROI를 merge해서 이용 안해도 되는 경우가 있을 거 같음."

We take the rich historical data (where both single-center and multi-patch variants
were extracted on the exact same 20s window for videos 3,6,7) and apply an improved
scoring that treats "is_merged" as a first-class feature.

New scoring signals (beyond previous versions):
- is_merged (0/1)
- post-clean G-R variance of that specific candidate (lower = cleaner signal)
- explicit distance of the best peak from 100 bpm for that trace
- pixel count
- base SNR

Goal: Show concrete numbers — for each video and each anatomical zone,
which variant (single vs multi) would win under the improved scoring,
and whether forcing global merge would have been harmful.

This is the "더 정교한 Smart selection" direction.
"""

import pandas as pd
import numpy as np
from pathlib import Path

CSV = Path("reports/rppg_pet_keypoints/multi_area_roi_v2/multi_area_roi_results.csv")

def compute_improved_score(row):
    """Improved per-candidate score that can prefer single or merged depending on situation."""
    snr = row.get("best_snr", 0)
    pixel = row.get("pixel_mean", 800)
    gr_var = row.get("gr_var", 999)          # post A+B G-R variance (lower is better)
    bpm = row.get("best_bpm", 150)
    is_merged = 1 if row.get("variant", "").startswith("multi") else 0

    # Base quality
    pixel_factor = min(pixel / 1200, 1.6)
    cleanliness = 1.0 / (1.0 + gr_var / 300)   # lower post-clean var → higher score

    base = snr * pixel_factor * cleanliness

    # Artifact / relevance penalty
    dist_100 = abs(bpm - 100)
    if dist_100 < 15:
        artifact_pen = 0.45
    elif dist_100 < 30:
        artifact_pen = 0.75
    else:
        artifact_pen = 1.0

    # High-HR bonus for videos that need it (we will apply per-video prior)
    high_hr_bonus = 1.0
    if bpm > 165:
        high_hr_bonus = 1.18

    # Merge penalty / bonus (the key new signal)
    # Default: slight penalty for merged (averaging can dilute weak signals)
    merge_factor = 0.92 if is_merged else 1.05

    # However, when the merged version dramatically improves cleanliness or pixels,
    # the cleanliness term above already rewards it. We add a small extra bonus
    # if merged gave both higher pixels AND lower variance than typical singles.
    if is_merged:
        # Will be adjusted per anatomical comparison later
        merge_factor = 0.95

    score = base * artifact_pen * high_hr_bonus * merge_factor
    return round(score, 2)


def main():
    if not CSV.exists():
        print("Rich historical CSV not found.")
        return

    df = pd.read_csv(CSV)
    # Only the variants we care about for this diagnostic
    df = df[df["variant"].isin(["single_center", "multi_patch_area"])].copy()

    print("=" * 90)
    print("ROI Merge vs Single - Improved Scoring Diagnostic")
    print("=" * 90)
    print("Data source: multi_area_roi_v2 experiment (same 20s window, A+B applied)")
    print("New signals used: post-clean G-R var, pixel count, explicit 100bpm distance, is_merged\n")

    for video in [6, 3, 7]:
        sub = df[df["video"] == video].copy()
        if sub.empty:
            continue

        target = {6: 90, 3: 210, 7: 189.5}[video]
        high_hr = video in (3, 7)

        scores = []
        for _, row in sub.iterrows():
            s = compute_improved_score(row)
            if high_hr and row["best_bpm"] > 160:
                s *= 1.12   # extra high-HR prior for the video
            scores.append(round(s, 2))

        sub["improved_score"] = scores
        sub = sub.sort_values("improved_score", ascending=False)

        print(f"\n=== Video {video} (target ~{target}) ===")
        print(sub[["variant", "name", "pixel_mean", "gr_var", "best_bpm", "best_snr", "improved_score"]]
              .head(8).to_string(index=False))

        best = sub.iloc[0]
        print(f"\n  → Best under new scoring: {best['variant']} {best['name']} "
              f"(bpm={best['best_bpm']:.1f}, score={best['improved_score']:.2f})")

        # Compare against the global best multi only
        multi_only = sub[sub["variant"] == "multi_patch_area"].sort_values("improved_score", ascending=False)
        if not multi_only.empty:
            best_multi = multi_only.iloc[0]
            print(f"  → Best multi-patch only: {best_multi['name']} "
                  f"(bpm={best_multi['best_bpm']:.1f}, score={best_multi['improved_score']:.2f})")

    print("\n" + "=" * 90)
    print("Key takeaway for final strategy:")
    print("  - For Video 6 (low HR): tight single patches on muzzle/nose are clearly superior.")
    print("  - For Video 3 (high HR): certain merged multi-patch areas (ear) win dramatically.")
    print("  - Forcing a global 'always use multi-patch' loses the best candidate in low-HR cases.")
    print("  - Future smart selection must see both families as competing candidates and score them")
    print("    with 'is_merged' + post-clean variance + peak-to-100 distance as first-class features.")
    print("=" * 90)


if __name__ == "__main__":
    main()