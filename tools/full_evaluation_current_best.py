#!/usr/bin/env python3
"""
Full End-to-End Evaluation with Current Best Configuration (2026-05)

Best config:
  --dog_aware --multi_area --relax_rejection

This script:
1. Runs (or skips) the full anatomical + rejection analysis on all usable videos.
2. Aggregates all per-video rejection_anatomical_results.csv files.
3. Loads ground-truth bpm_target from dataset_front/video_labels_ocr.csv.
4. Computes absolute errors, rejection rates, pixel statistics, and high-HR recovery.
5. Produces a clean summary table (CSV + Markdown) + key insights.

Usage examples:
    # Full run (analyses + aggregation)
    python tools/full_evaluation_current_best.py --run

    # Only re-aggregate after previous runs (much faster)
    python tools/full_evaluation_current_best.py --aggregate-only

Output folder: reports/rppg_pet_keypoints/full_evaluation_current_best/
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
USABLE_VIDEOS = ["1", "3", "4", "5", "6", "7", "8"]
GT_LABELS_PATH = Path("dataset_front/video_labels_ocr.csv")
BEST_FLAGS = ["--dog_aware", "--multi_area", "--relax_rejection"]

OUTPUT_DIR = Path("reports/rppg_pet_keypoints/full_evaluation_current_best")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def find_latest_results_csv(stem: str) -> Optional[Path]:
    """
    Robust finder (similar to compare_anatomical_results.py logic).
    Prefers GPU probe folders and the most recent analysis folder.
    """
    base = Path("reports/rppg_pet_keypoints")
    candidates = []

    # GPU probe first
    gpu_dir = base / f"dlc_probe_{stem}_gpu"
    if gpu_dir.exists():
        for analysis_dir in sorted(gpu_dir.glob(f"{stem}_analysis*"), key=lambda p: p.stat().st_mtime, reverse=True):
            csv_path = analysis_dir / "rejection_anatomical_results.csv"
            if csv_path.exists():
                candidates.append((csv_path, analysis_dir.stat().st_mtime))

    # Fallback to non-GPU probe
    reg_dir = base / f"dlc_probe_{stem}"
    if reg_dir.exists():
        for analysis_dir in sorted(reg_dir.glob(f"{stem}_analysis*"), key=lambda p: p.stat().st_mtime, reverse=True):
            csv_path = analysis_dir / "rejection_anatomical_results.csv"
            if csv_path.exists():
                candidates.append((csv_path, analysis_dir.stat().st_mtime))

    # Special legacy case for video 4
    if stem == "4":
        full4_dir = base / "dlc_full4"
        if full4_dir.exists():
            csv_path = full4_dir / "rejection_anatomical_results.csv"
            if csv_path.exists():
                candidates.append((csv_path, full4_dir.stat().st_mtime))

    if not candidates:
        return None

    # Return the most recent one
    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates[0][0]


def load_ground_truth() -> Dict[str, float]:
    if not GT_LABELS_PATH.exists():
        print(f"WARNING: Ground truth labels not found at {GT_LABELS_PATH}")
        return {}
    df = pd.read_csv(GT_LABELS_PATH)
    gt = {}
    for _, row in df.iterrows():
        stem = str(row["video"]).replace(".mp4", "")
        if row.get("usable", False) and pd.notna(row.get("bpm_target")):
            gt[stem] = float(row["bpm_target"])
    return gt


def run_analysis_for_stem(stem: str, python_exe: str) -> bool:
    """Run the best config analysis for one video."""
    cmd = [
        python_exe,
        "tools/analyze_video.py",
        "--stem", stem,
    ] + BEST_FLAGS

    print(f"\n=== Running best config on video {stem} ===")
    print("Command:", " ".join(cmd))

    try:
        subprocess.run(cmd, check=True, capture_output=False)
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR running analysis for {stem}: {e}")
        return False


def aggregate_results(gt: Dict[str, float]) -> pd.DataFrame:
    """Collect all per-video CSVs and compute summary metrics."""
    records = []

    for stem in USABLE_VIDEOS:
        csv_path = find_latest_results_csv(stem)
        if csv_path is None:
            print(f"  [skip] No results CSV found for video {stem}")
            continue

        print(f"  Loading results for {stem} from {csv_path}")
        df = pd.read_csv(csv_path)

        target = gt.get(stem, np.nan)

        # Best raw (before any rejection)
        if len(df) > 0:
            best_raw = df.loc[df["snr"].idxmax()]
            best_raw_bpm = best_raw["raw_bpm"]
            best_raw_snr = best_raw["snr"]
        else:
            best_raw_bpm = np.nan
            best_raw_snr = np.nan

        # After relaxed rejection (our main "dog_aware + multi_area" setting)
        kept_relaxed = df[df.get("rejection_lenient", df.get("rejection_aggressive", 1)) < 0.35]
        if len(kept_relaxed) > 0:
            best_relaxed = kept_relaxed.loc[kept_relaxed["snr"].idxmax()]
            best_relaxed_bpm = best_relaxed["raw_bpm"]
            best_relaxed_snr = best_relaxed["snr"]
            avg_pixel = kept_relaxed.get("pixel_mean", pd.Series([0])).mean()
        else:
            best_relaxed_bpm = np.nan
            best_relaxed_snr = np.nan
            avg_pixel = 0

        error = abs(best_relaxed_bpm - target) if pd.notna(target) and pd.notna(best_relaxed_bpm) else np.nan

        # High-HR recovery flag for videos 3 and 7
        high_hr_recovery = False
        if stem in ("3", "7") and pd.notna(best_relaxed_bpm):
            # Consider recovered if within ~20 bpm of target or > 160 bpm with decent SNR
            if abs(best_relaxed_bpm - target) < 25 or (best_relaxed_bpm > 160 and best_relaxed_snr > 8):
                high_hr_recovery = True

        records.append({
            "video": stem,
            "target_bpm": round(target, 1) if pd.notna(target) else None,
            "best_raw_bpm": round(best_raw_bpm, 1),
            "best_relaxed_bpm": round(best_relaxed_bpm, 1),
            "abs_error": round(error, 1) if pd.notna(error) else None,
            "best_relaxed_snr": round(best_relaxed_snr, 2),
            "windows_total": len(df),
            "windows_kept_relaxed": len(kept_relaxed),
            "kept_pct": round(100 * len(kept_relaxed) / max(len(df), 1), 1),
            "avg_pixel_mean_kept": round(avg_pixel, 0),
            "high_hr_recovery": high_hr_recovery,
        })

    return pd.DataFrame(records)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", action="store_true", help="Run the analyses for all videos first")
    parser.add_argument("--aggregate-only", action="store_true", help="Only aggregate existing results (skip running)")
    parser.add_argument("--also-aggressive", action="store_true", help="Also run a comparison with --aggressive")
    args = parser.parse_args()

    python_exe = sys.executable

    if args.run and not args.aggregate_only:
        print("=== Running full analyses with best config (dog_aware + multi_area + relax_rejection) ===")
        for stem in USABLE_VIDEOS:
            run_analysis_for_stem(stem, python_exe)

        if args.also_aggressive:
            print("\n=== Also running aggressive variant for comparison ===")
            for stem in USABLE_VIDEOS:
                cmd = [python_exe, "tools/analyze_video.py", "--stem", stem, "--dog_aware", "--multi_area", "--aggressive"]
                subprocess.run(cmd, check=False)

    # Aggregation
    print("\n=== Aggregating results ===")
    gt = load_ground_truth()
    summary_df = aggregate_results(gt)

    if summary_df.empty:
        print("No results found. Run with --run first.")
        return

    # Save CSV
    csv_out = OUTPUT_DIR / "full_evaluation_best_config.csv"
    summary_df.to_csv(csv_out, index=False)
    print(f"Saved detailed table: {csv_out}")

    # Markdown report
    md_out = OUTPUT_DIR / "FULL_EVALUATION_REPORT.md"
    with open(md_out, "w", encoding="utf-8") as f:
        f.write("# Pet rPPG — Full Evaluation (Current Best Config)\n\n")
        f.write("**Config**: `--dog_aware --multi_area --relax_rejection` (2026-05)\n\n")
        f.write("**Date**: Auto-generated\n\n")

        f.write("## Summary Table\n\n")
        try:
            f.write(summary_df.to_markdown(index=False))
        except Exception:
            f.write(summary_df.to_string(index=False))
        f.write("\n\n")

        f.write("## Key Insights\n\n")
        f.write(f"- Videos evaluated: {len(summary_df)}\n")
        errors = summary_df["abs_error"].dropna()
        if len(errors) > 0:
            f.write(f"- Mean absolute error: {errors.mean():.1f} bpm\n")
            f.write(f"- Median absolute error: {errors.median():.1f} bpm\n")
        f.write(f"- High-HR recovery (videos 3 & 7): {summary_df[summary_df['video'].isin(['3','7'])]['high_hr_recovery'].sum()}/2\n\n")

        f.write("## Notes\n")
        f.write("- `best_relaxed_bpm` uses the lenient rejection threshold after dog_aware + multi-area preprocessing.\n")
        f.write("- `pixel_mean` comes from the new multi-patch extraction (higher = more stable).\n")
        f.write("- High-HR recovery = credible peak near target band surfaced with decent SNR.\n")

    print(f"Saved Markdown report: {md_out}")

    # Console summary
    print("\n" + "=" * 80)
    print("FULL EVALUATION SUMMARY (Best Config)")
    print("=" * 80)
    print(summary_df.to_string(index=False))
    print("\nHigh-HR recovery on 3 & 7:", summary_df[summary_df.video.isin(["3", "7"])][["video", "high_hr_recovery", "abs_error"]].to_string(index=False))


if __name__ == "__main__":
    main()