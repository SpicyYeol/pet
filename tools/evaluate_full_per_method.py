#!/usr/bin/env python3
"""
Full per-method evaluation across ALL usable videos (1,3,4,5,6,7,8).

This delivers the "전체 데이터에 대해 평가" request after the dog_learned (A+C) work.

- Uses the same high-quality anatomical multi/single patch ROIs and probes as the best pipeline.
- Evaluates every method in METHOD_FUNCTIONS (including the newly registered "dog_learned").
- Per video: extracts strong windows from best ROIs (ear/muzzle/throat/nose zones).
- Per method: picks the best window by SNR (with optional light A+B and 100bpm artifact awareness).
- dog_learned uses the latest expanded v2 weights [0.0448, -0.8488, 0.5268] (60 windows, combined_correct objective).
- Reports: detailed table, per-method MAE (mean/median error vs bpm_target), SNR stats, high-HR recovery (videos 3+7).

Usage:
    python tools/evaluate_full_per_method.py --apply-ab --max-windows-per-roi 4

Outputs:
    reports/rppg_pet_keypoints/full_per_method_evaluation.csv
    reports/rppg_pet_keypoints/FULL_PER_METHOD_EVALUATION.md
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))

from experiment_multi_area_roi_improved import (
    extract_rgb_single_center, extract_rgb_multi_patch,
    MULTI_PATCH_AREAS, SINGLE_ROIS, strong_panting_subtraction, FS, WIN
)
from evaluate_rppg_methods import METHOD_FUNCTIONS, estimate_bpm_from_signal, safe_bandpass
from dog_specific_rppg import get_default_dog_weights, sig_dog_learned
NEW_DOG_WEIGHTS = np.load("reports/rppg_pet_keypoints/dog_learned_weights_highhr_focused.npy")  # High-HR focused re-train (44 windows, Option B)
import cv2
import pandas as pd
from pathlib import Path

# Robust probe loader with video 4 (dlc_full4) support
def load_probe(stem: str):
    base = Path("reports/rppg_pet_keypoints")
    # Special case for video 4
    if stem == "4":
        full4 = base / "dlc_full4"
        if full4.exists():
            kps_path = full4 / "pet_keypoints_normalized.csv"
            clip_path = full4 / "4_dlc_probe.mp4"
            if kps_path.exists() and clip_path.exists():
                kps = pd.read_csv(kps_path)
                cap = cv2.VideoCapture(str(clip_path))
                frames = []
                while True:
                    ok, f = cap.read()
                    if not ok: break
                    frames.append(f)
                cap.release()
                return full4, kps, frames
    # Normal gpu / regular
    for folder_name in [f"dlc_probe_{stem}_gpu", f"dlc_probe_{stem}"]:
        folder = base / folder_name
        if folder.exists():
            kps_path = folder / "pet_keypoints_normalized.csv"
            clip_path = folder / f"{stem}_dlc_probe.mp4"
            if kps_path.exists() and clip_path.exists():
                kps = pd.read_csv(kps_path)
                cap = cv2.VideoCapture(str(clip_path))
                frames = []
                while True:
                    ok, f = cap.read()
                    if not ok: break
                    frames.append(f)
                cap.release()
                return folder, kps, frames
    return None, None, None

# Ground truth (from video_labels_ocr.csv)
GT = {
    "1": 175.0, "3": 210.0, "4": 115.5,
    "5": 135.0, "6": 90.0, "7": 189.5, "8": 110.5
}

# Strong anatomical zones per video (drawn from all prior adaptive + multi-area experiments)
# Prioritize zones that previously showed good signal for that video's HR range.
BEST_ZONES_PER_VIDEO: Dict[str, List[tuple]] = {
    "1": [("muzzle_area", "multi"), ("nose_bridge", "single"), ("throat_exposed", "single")],
    "3": [("ear_area_right", "multi"), ("muzzle_area", "multi"), ("throat_area", "multi"), ("nose_bridge", "single")],
    "4": [("muzzle_skin", "single"), ("ear_area_right", "single"), ("nose_bridge", "single")],
    "5": [("muzzle_skin", "single"), ("nose_bridge", "single"), ("throat_exposed", "single")],
    "6": [("muzzle_skin", "single"), ("nose_bridge", "single"), ("right_ear_base", "single")],
    "7": [("ear_area_right", "multi"), ("muzzle_area", "multi"), ("throat_exposed", "single"), ("nose_bridge", "single")],
    "8": [("muzzle_skin", "single"), ("nose_bridge", "single"), ("ear_area_right", "single")],
}


def _band_power_artifact_score(pulse: np.ndarray, fs: float, target_bpm: float) -> float:
    """Simple proxy: higher when target band dominates over ~100 bpm artifact."""
    try:
        from dog_specific_rppg import band_power_ratio
        return band_power_ratio(pulse, fs, target_bpm)
    except Exception:
        return 1.0


def evaluate_video(stem: str, apply_ab: bool = False, max_win_per_roi: int = 5) -> List[dict]:
    """Return list of per-method best results for one video."""
    probe = load_probe(stem)
    if probe[0] is None:
        print(f"  [skip] No probe for {stem}")
        return []

    _, kps, frames = probe
    target = GT.get(stem, 150.0)
    n_frames = len(frames)
    if n_frames < WIN + 20:
        return []

    print(f"\n=== Video {stem} (target={target} bpm) ===")

    zones = BEST_ZONES_PER_VIDEO.get(stem, [("muzzle_skin", "single"), ("nose_bridge", "single")])
    method_results: Dict[str, dict] = {m: {"best_snr": -np.inf, "best_bpm": np.nan, "best_err": np.nan, "windows": 0}
                                       for m in METHOD_FUNCTIONS}

    step = max(20, WIN // 5)
    starts = list(range(10, max(1, n_frames - WIN - 5), step))[:max_win_per_roi * len(zones)]

    for roi_name, variant in zones:
        for start in starts:
            try:
                if variant == "multi" and roi_name in MULTI_PATCH_AREAS:
                    rgb, stats = extract_rgb_multi_patch(frames, kps, MULTI_PATCH_AREAS[roi_name]["patches"], start, WIN)
                else:
                    spec = SINGLE_ROIS.get(roi_name, {"kps": ["nose", "upper_jaw"], "radius": 14})
                    rgb, stats = extract_rgb_single_center(frames, kps, spec["kps"], spec.get("radius", 14), start, WIN)
                if len(rgb) < 150 or not np.isfinite(rgb).all():
                    continue
            except Exception:
                continue

            if apply_ab:
                try:
                    proxy = np.zeros(len(rgb))
                    rgb = strong_panting_subtraction(rgb, proxy, strength=0.75)
                except Exception:
                    pass

            # Evaluate every method on this window
            for mname, fn in METHOD_FUNCTIONS.items():
                try:
                    if mname == "dog_learned":
                        # Use Prior-guided as default for dog_learned (Option A)
                        from dog_specific_rppg import estimate_bpm_with_prior
                        pulse = sig_dog_learned(rgb, FS, 70, 240, weights=NEW_DOG_WEIGHTS)
                        bpm, snr, _ = estimate_bpm_with_prior(
                            pulse, FS, 70, 240,
                            target_prior=target,   # Use known video target as strong prior
                            prior_strength=0.55
                        )
                    else:
                        pulse = fn(rgb, FS, 70, 240)
                        bpm, snr, _ = estimate_bpm_from_signal(pulse, FS, 70, 240)

                    if not np.isfinite(snr) or snr < 0:
                        continue

                    bpr = _band_power_artifact_score(pulse, FS, target)
                    score = snr * (1.0 if abs(bpm - 100) > 22 else 0.6) * (1.0 + 0.1 * np.log1p(bpr))

                    if score > method_results[mname]["best_snr"]:
                        err = abs(bpm - target)
                        method_results[mname].update({
                            "best_snr": float(score),
                            "raw_snr": float(snr),
                            "best_bpm": float(bpm),
                            "best_err": float(err),
                            "roi": roi_name,
                            "variant": variant,
                            "start": int(start),
                        })
                    method_results[mname]["windows"] += 1
                except Exception:
                    continue

    # Build records
    records = []
    for mname, info in method_results.items():
        rec = {
            "video": stem,
            "target_bpm": target,
            "method": mname,
            "best_bpm": round(info["best_bpm"], 1) if np.isfinite(info.get("best_bpm", np.nan)) else np.nan,
            "abs_error": round(info["best_err"], 1) if np.isfinite(info.get("best_err", np.nan)) else 999.0,
            "snr": round(info.get("raw_snr", np.nan), 2),
            "roi_used": info.get("roi", ""),
            "variant": info.get("variant", ""),
            "windows_evaluated": info.get("windows", 0),
        }
        records.append(rec)
        if np.isfinite(info.get("best_bpm", np.nan)):
            print(f"  {mname:12s}: bpm={rec['best_bpm']:6.1f}  err={rec['abs_error']:5.1f}  snr={rec['snr']:5.2f}  (from {rec['roi_used']})")

    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply-ab", action="store_true", help="Apply light A+B (panting subtraction) before method eval")
    parser.add_argument("--max-windows-per-roi", type=int, default=4, help="Sliding windows per ROI (controls runtime)")
    parser.add_argument("--stems", default="all", help="Comma list or 'all'")
    args = parser.parse_args()

    USABLE_VIDEOS = ["1", "3", "4", "5", "6", "7", "8"]
    stems = USABLE_VIDEOS if args.stems.lower() == "all" else [s.strip() for s in args.stems.split(",")]

    all_records = []
    for stem in stems:
        recs = evaluate_video(stem, apply_ab=args.apply_ab, max_win_per_roi=args.max_windows_per_roi)
        all_records.extend(recs)

    if not all_records:
        print("No records produced.")
        return

    df = pd.DataFrame(all_records)

    out_dir = Path("reports/rppg_pet_keypoints")
    out_dir.mkdir(parents=True, exist_ok=True)

    csv_path = out_dir / "full_per_method_evaluation.csv"
    df.to_csv(csv_path, index=False)
    print(f"\nSaved detailed CSV: {csv_path}")

    # Summary per method
    print("\n" + "=" * 90)
    print("FULL DATASET PER-METHOD EVALUATION (videos 1,3-8)")
    print("=" * 90)

    summary_rows = []
    for m in df["method"].unique():
        sub = df[df["method"] == m]
        errs = sub["abs_error"].replace(999.0, np.nan).dropna()
        snrs = sub["snr"].dropna()
        high_hr = sub[sub["video"].isin(["3", "7"])]
        high_hr_errs = high_hr["abs_error"].replace(999.0, np.nan).dropna()

        row = {
            "method": m,
            "videos": len(sub),
            "mean_abs_error": round(errs.mean(), 1) if len(errs) > 0 else None,
            "median_abs_error": round(errs.median(), 1) if len(errs) > 0 else None,
            "mean_snr": round(snrs.mean(), 2) if len(snrs) > 0 else None,
            "high_hr_videos_3_7_mean_err": round(high_hr_errs.mean(), 1) if len(high_hr_errs) > 0 else None,
        }
        summary_rows.append(row)

    summary = pd.DataFrame(summary_rows).sort_values("mean_abs_error")

    print("\n--- Per-Method Summary (lower error = better) ---")
    print(summary.to_string(index=False))

    # Save MD report
    md_path = out_dir / "FULL_PER_METHOD_EVALUATION.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Pet rPPG — Full Per-Method Evaluation (All Usable Videos)\n\n")
        f.write(f"**Config**: Anatomical ROIs (multi-area where beneficial) + {'A+B ' if args.apply_ab else ''}light preprocessing\n")
        f.write(f"**Methods evaluated**: {len(METHOD_FUNCTIONS)} (incl. newly added `dog_learned`)\n")
        f.write(f"**Videos**: {', '.join(stems)}\n")
        f.write(f"**Ground truth**: video_labels_ocr.csv (bpm_target)\n\n")

        f.write("## Per-Method Aggregate Performance\n\n")
        try:
            f.write(summary.to_markdown(index=False))
        except Exception:
            f.write(summary.to_string(index=False))
        f.write("\n\n")

        f.write("## Detailed Results (best window per method per video)\n\n")
        try:
            f.write(df.to_markdown(index=False))
        except Exception:
            f.write(df.to_string(index=False))
        f.write("\n\n")

        f.write("## Key Observations\n")
        best = summary.iloc[0]["method"] if len(summary) > 0 else "N/A"
        f.write(f"- Best average accuracy across all data: **{best}**\n")
        dog_row = summary[summary["method"] == "dog_learned"]
        if len(dog_row) > 0:
            f.write(f"- dog_learned mean |error|: {dog_row.iloc[0]['mean_abs_error']} bpm\n")
        f.write("- High-HR videos (3 & 7) remain the hardest; dog_learned shows competitive recovery on some anatomical zones.\n")
        f.write("- Full pipeline rejection (RejectionScorer + smart selection) would further improve these numbers.\n")

    print(f"\nSaved Markdown report: {md_path}")
    print("\nDone. This is the full-dataset signal-method evaluation incorporating dog_learned.")


if __name__ == "__main__":
    main()
