#!/usr/bin/env python3
"""
Aggregate Anatomical + Rejection results across multiple videos
and produce a clean comparison table vs old face-box baseline.

Usage:
    python tools/compare_anatomical_results.py

It will scan for available analysis results under reports/rppg_pet_keypoints/
and print a markdown table.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Dict, List

import pandas as pd

# Known face-box baseline results (from earlier project reports)
# These are approximate "best face-box prediction" and rough MAE against target.
# Update this dict as you get more precise numbers from old rppg_eval / single_view_sqi runs.
FACEBOX_BASELINE: Dict[str, Dict] = {
    "1": {"target": 175.0, "best_bpm": 99.0, "mae": 76.0},
    "3": {"target": 210.0, "best_bpm": 102.0, "mae": 108.0},
    "4": {"target": 115.5, "best_bpm": 102.0, "mae": 13.5},   # from earlier runs
    "5": {"target": 135.0, "best_bpm": 100.0, "mae": 35.0},
    "6": {"target": 90.0,  "best_bpm": 100.0, "mae": 10.0},
    "7": {"target": 189.5, "best_bpm": 108.0, "mae": 81.5},
    "8": {"target": 110.5, "best_bpm": 100.0, "mae": 10.5},
}

USABLE_VIDEOS = ["1", "3", "4", "5", "6", "7", "8"]


def find_results_for_stem(stem: str) -> Path | None:
    """
    Extremely robust finder for the new pipeline (supports nested analysis subfolders).
    - Scans dlc_probe_{stem}* (including _gpu and legacy)
    - Recursively finds rejection_anatomical_results.csv or anatomical_roi_results.csv
    - Returns the newest (by mtime) result CSV found for the stem.
    - Prefers rejection_ files over plain anatomical_roi_ files.
    """
    base = Path("reports/rppg_pet_keypoints")

    # Candidate root folders for this stem (probe dirs + legacy)
    roots: list[Path] = []
    roots += list(base.glob(f"dlc_probe_{stem}*"))
    if stem == "4":
        roots += [
            base / "dlc_full4",
            base / "dlc_full4_roi_analysis_v2",
            base / "dlc_full4_roi_analysis",
        ]

    # Also include any direct analysis subfolders at base level
    roots += list(base.glob(f"dlc_probe_{stem}*analysis*"))

    # Dedup + keep only existing
    roots = list({r for r in roots if r.exists() and r.is_dir()})

    candidates: list[Path] = []
    for root in roots:
        # Direct CSV in the root
        for name in ["rejection_anatomical_results.csv", "anatomical_roi_results.csv"]:
            c = root / name
            if c.exists():
                candidates.append(c)
        # Recurse into subdirs (e.g. 3_analysis_aggressive/ inside dlc_probe_3_gpu/)
        for sub in root.rglob("*"):
            if sub.is_dir():
                for name in ["rejection_anatomical_results.csv", "anatomical_roi_results.csv"]:
                    c = sub / name
                    if c.exists():
                        candidates.append(c)

    if not candidates:
        return None

    # Prefer rejection_ files, then sort by mtime desc (newest first)
    candidates.sort(key=lambda p: (0 if "rejection" in p.name else 1, -p.stat().st_mtime))

    return candidates[0]


def compute_anatomical_stats(csv_path: Path, target_bpm: float) -> Dict:
    """Extract richer metrics from a rejection anatomical results CSV."""
    df = pd.read_csv(csv_path)

    if df.empty:
        return {
            "n_windows": 0,
            "best_raw_bpm": None,
            "best_raw_snr": None,
            "best_raw_roi": None,
            "best_raw_method": None,
            "best_aggressive_bpm": None,
            "best_aggressive_snr": None,
            "best_aggressive_roi": None,
            "aggressive_kept_ratio": 0.0,
            "mean_motion": None,
            "mean_artifact": None,
            "high_artifact_pct": None,
        }

    # --- Raw stats ---
    best_raw_idx = df["snr"].idxmax()
    best_raw = df.loc[best_raw_idx]
    best_raw_bpm = best_raw["raw_bpm"]
    best_raw_snr = best_raw["snr"]
    best_raw_roi = best_raw["roi"]
    best_raw_method = best_raw["method"]

    # --- Aggressive rejection stats ---
    if "rejection_aggressive" in df.columns:
        kept = df[df["rejection_aggressive"] < 0.35].copy()
        kept_ratio = len(kept) / len(df) if len(df) > 0 else 0.0

        if len(kept) > 0:
            best_kept_idx = kept["snr"].idxmax()
            best_kept = kept.loc[best_kept_idx]
            best_aggressive_bpm = best_kept["raw_bpm"]
            best_aggressive_snr = best_kept["snr"]
            best_aggressive_roi = best_kept["roi"]
            best_aggressive_method = best_kept["method"]
        else:
            best_aggressive_bpm = None
            best_aggressive_snr = None
            best_aggressive_roi = None
            best_aggressive_method = None
    else:
        kept_ratio = 1.0
        best_aggressive_bpm = best_raw_bpm
        best_aggressive_snr = best_raw_snr
        best_aggressive_roi = best_raw_roi
        best_aggressive_method = best_raw_method

    # --- Aggregate features ---
    mean_motion = round(float(df["motion"].mean()), 2) if "motion" in df.columns else None
    mean_artifact = round(float(df["artifact_100bpm"].mean()), 3) if "artifact_100bpm" in df.columns else None
    high_artifact_pct = round((df["artifact_100bpm"] > 0.3).mean() * 100, 1) if "artifact_100bpm" in df.columns else None

    # --- Absolute Errors vs Target ---
    raw_abs_error = round(abs(float(best_raw_bpm) - target_bpm), 1) if target_bpm else None
    aggressive_abs_error = round(abs(float(best_aggressive_bpm) - target_bpm), 1) if (target_bpm and best_aggressive_bpm) else None

    # --- Per-ROI summary (top 3 by best SNR within each ROI) ---
    roi_performance = []
    for roi in df['roi'].unique():
        roi_df = df[df['roi'] == roi]
        if len(roi_df) == 0:
            continue
        best_in_roi = roi_df.loc[roi_df['snr'].idxmax()]
        roi_performance.append({
            'roi': roi,
            'best_bpm': round(float(best_in_roi['raw_bpm']), 1),
            'best_snr': round(float(best_in_roi['snr']), 2),
            'best_method': best_in_roi['method']
        })
    # Sort by SNR descending
    roi_performance.sort(key=lambda x: x['best_snr'], reverse=True)
    top_rois = roi_performance[:3]  # Top 3 ROIs

    return {
        "n_windows": len(df),
        "best_raw_bpm": round(float(best_raw_bpm), 1),
        "best_raw_snr": round(float(best_raw_snr), 2),
        "best_raw_roi": best_raw_roi,
        "best_raw_method": best_raw_method,
        "best_aggressive_bpm": round(float(best_aggressive_bpm), 1) if best_aggressive_bpm else None,
        "best_aggressive_snr": round(float(best_aggressive_snr), 2) if best_aggressive_snr else None,
        "best_aggressive_roi": best_aggressive_roi,
        "best_aggressive_method": best_aggressive_method,
        "raw_abs_error": raw_abs_error,
        "aggressive_abs_error": aggressive_abs_error,
        "aggressive_kept_ratio": round(kept_ratio, 3),
        "mean_motion": mean_motion,
        "mean_artifact": mean_artifact,
        "high_artifact_pct": high_artifact_pct,
        "top_rois": top_rois,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("reports/rppg_pet_keypoints/anatomical_vs_facebox_comparison.md"))
    args = parser.parse_args()

    rows = []

    for stem in USABLE_VIDEOS:
        baseline = FACEBOX_BASELINE.get(stem, {})
        target = baseline.get("target")
        fb_bpm = baseline.get("best_bpm")
        fb_mae = baseline.get("mae")

        csv_path = find_results_for_stem(stem)
        if csv_path is None:
            rows.append({
                "video": f"{stem}.mp4",
                "target": target,
                "facebox_best": fb_bpm,
                "facebox_mae": fb_mae,
                "anatomical_best_raw": None,
                "anatomical_best_aggressive": None,
                "aggressive_kept_pct": None,
                "status": "no anatomical results yet"
            })
            continue

        stats = compute_anatomical_stats(csv_path, target or 0)

        rows.append({
            "video": f"{stem}.mp4",
            "target": target,
            "facebox_best": fb_bpm,
            "facebox_mae": fb_mae,
            "anatomical_raw_bpm": stats["best_raw_bpm"],
            "anatomical_raw_snr": stats["best_raw_snr"],
            "anatomical_raw_roi": stats["best_raw_roi"],
            "anatomical_aggressive_bpm": stats["best_aggressive_bpm"],
            "anatomical_aggressive_snr": stats["best_aggressive_snr"],
            "anatomical_aggressive_roi": stats["best_aggressive_roi"],
            "raw_abs_error": stats["raw_abs_error"],
            "aggressive_abs_error": stats["aggressive_abs_error"],
            "aggressive_kept_pct": f"{stats['aggressive_kept_ratio']*100:.1f}%",
            "mean_motion": stats["mean_motion"],
            "high_artifact_pct": stats["high_artifact_pct"],
            "n_windows": stats["n_windows"],
            "top_rois": stats["top_rois"],
            "status": "analyzed"
        })

    df = pd.DataFrame(rows)

    # Pretty markdown table
    md_lines = [
        "# Anatomical + Rejection vs Face-box Baseline (7 Videos)",
        "",
        "Generated automatically by `tools/compare_anatomical_results.py`",
        "",
        "| Video | Target | Face-box Best | Face-box MAE | Raw Best | Raw Abs Err | Aggressive Best | Aggressive Abs Err | Kept % | Mean Motion | High Artifact % | Windows |",
        "|-------|--------|---------------|--------------|----------|-------------|-----------------|-------------------|--------|-------------|-----------------|---------|",
    ]

    for _, row in df.iterrows():
        raw_err = row['raw_abs_error'] if pd.notna(row.get('raw_abs_error')) else '-'
        agg_err = row['aggressive_abs_error'] if pd.notna(row.get('aggressive_abs_error')) else '-'

        line = (
            f"| {row['video']} "
            f"| {row['target'] if pd.notna(row['target']) else '-'} "
            f"| {row['facebox_best'] if pd.notna(row['facebox_best']) else '-'} "
            f"| {row['facebox_mae'] if pd.notna(row['facebox_mae']) else '-'} "
            f"| {row['anatomical_raw_bpm']} ({row['anatomical_raw_roi']}) "
            f"| {raw_err} "
            f"| {row['anatomical_aggressive_bpm']} ({row['anatomical_aggressive_roi']}) "
            f"| {agg_err} "
            f"| {row['aggressive_kept_pct'] if pd.notna(row['aggressive_kept_pct']) else '-'} "
            f"| {row['mean_motion'] if pd.notna(row['mean_motion']) else '-'} "
            f"| {row['high_artifact_pct'] if pd.notna(row['high_artifact_pct']) else '-'}% "
            f"| {row['n_windows']} "
            f"| {row['status']} |"
        )
        md_lines.append(line)

    # --- Per-ROI Performance Section (for videos with data) ---
    md_lines.append("\n## Per-ROI Performance (Videos with Anatomical Analysis)\n")

    has_roi_data = False
    for _, row in df.iterrows():
        if row['status'] != 'analyzed' or not row.get('top_rois'):
            continue
        has_roi_data = True
        md_lines.append(f"### {row['video']} (Target: {row['target']})")
        md_lines.append("| Rank | ROI | Best BPM | Best SNR | Best Method |")
        md_lines.append("|------|-----|----------|----------|-------------|")
        for i, roi_info in enumerate(row['top_rois'], 1):
            md_lines.append(f"| {i} | {roi_info['roi']} | {roi_info['best_bpm']} | {roi_info['best_snr']} | {roi_info['best_method']} |")
        md_lines.append("")

    if not has_roi_data:
        md_lines.append("_No per-ROI data available yet._\n")

    output_text = "\n".join(md_lines)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(output_text, encoding="utf-8")

    print(output_text)
    print(f"\nComparison table saved to: {args.output}")


if __name__ == "__main__":
    main()
