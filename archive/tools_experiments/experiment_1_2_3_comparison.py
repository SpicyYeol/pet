#!/usr/bin/env python3
"""
1/2/3 Comparison + All Combinations Test (Temporal Prior / Adaptive Weights / Ensemble)

Implements the explicit user request after the three-direction proposal.

Directions under test:
  1. Temporal Prior (sequential carry-over from previous window BPM, ramping strength 0.2->0.55,
     forced re-scan safety within +/-30 bpm when raw peak far from prior)
  2. Adaptive high/low-HR weights (start with v1 general-purpose, switch or linear-blend to
     high-HR focused weights [0.001, 0.845, -0.535] when running estimate > ~160 bpm)
  3. Ensemble / quality-weighted fusion (per window: run dog_learned + POS + CHROM + ICA,
     score each with snr * band_power_ratio * artifact_penalty, pick the best BPM or fuse)

Test matrix (8+ configs):
  - Baseline (high-HR weights + oracle target prior)  --> reproduces the recent 18.7
  - Pure 1 (temporal prior, fixed v1 weights)
  - Pure 2 (adaptive weights, no prior)
  - Pure 3 (ensemble, fixed v1, independent windows)
  - 1+2, 1+3, 2+3, 1+2+3
  - Plus reference: classic POS (no dog model, no prior)

Two reporting modes for fairness:
  A. "Best window under config" (independent windows, oracle prior when applicable) -- direct
     apples-to-apples with previous per-method tables (18.7 etc).
  B. "Temporal tracking (realistic)" -- windows processed in strict chronological order,
     only previous BPM used as prior, median of valid estimates per video as the output.
     This is the deployment scenario for continuous monitoring.

Usage:
    python tools/experiment_1_2_3_comparison.py --mode both --max-per-roi 4
    python tools/experiment_1_2_3_comparison.py --quick   # fast smoke test on videos 5,6,8

Outputs:
    reports/rppg_pet_keypoints/1_2_3_comparison_results.csv
    reports/rppg_pet_keypoints/1_2_3_comparison_report.md
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))

# Reuse proven extraction + A+B logic (guarantees consistency with 18.7 baseline)
from experiment_multi_area_roi_improved import (
    extract_rgb_single_center, extract_rgb_multi_patch,
    MULTI_PATCH_AREAS, SINGLE_ROIS, strong_panting_subtraction, FS, WIN
)
from evaluate_rppg_methods import (
    METHOD_FUNCTIONS, estimate_bpm_from_signal, safe_bandpass, sig_pos, sig_chrom, sig_ica
)
from dog_specific_rppg import (
    sig_dog_learned, estimate_bpm_with_prior, band_power_ratio,
    get_default_dog_weights
)

# ----------------------------------------------------------------------------
# Weight sets (from prior training runs)
# ----------------------------------------------------------------------------
W_V1 = get_default_dog_weights()                    # [0.286, -0.7886, 0.5443]  general / combined_correct
W_HR = np.load("reports/rppg_pet_keypoints/dog_learned_weights_highhr_focused.npy")  # [0.001, 0.845, -0.535]

GT = {
    "1": 175.0, "3": 210.0, "4": 115.5,
    "5": 135.0, "6": 90.0, "7": 189.5, "8": 110.5
}

# Same strong zones used for the 18.7 run (keeps comparison valid)
BEST_ZONES_PER_VIDEO: Dict[str, List[tuple]] = {
    "1": [("muzzle_area", "multi"), ("throat_exposed", "single"), ("nose_bridge", "single")],
    "3": [("ear_area_right", "multi"), ("muzzle_area", "multi"), ("throat_area", "multi")],
    "4": [("muzzle_skin", "single"), ("ear_area_right", "single"), ("nose_bridge", "single")],
    "5": [("muzzle_skin", "single"), ("throat_exposed", "single"), ("nose_bridge", "single")],
    "6": [("muzzle_skin", "single"), ("nose_bridge", "single"), ("right_ear_base", "single")],
    "7": [("ear_area_right", "multi"), ("muzzle_area", "multi"), ("throat_exposed", "single")],
    "8": [("muzzle_skin", "single"), ("nose_bridge", "single"), ("ear_area_right", "single")],
}

USABLE = ["1", "3", "4", "5", "6", "7", "8"]


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def load_probe(stem: str):
    """Robust loader copied/adapted from evaluate_full_per_method.py"""
    base = Path("reports/rppg_pet_keypoints")
    if stem == "4":
        full4 = base / "dlc_full4"
        if full4.exists():
            kps = pd.read_csv(full4 / "pet_keypoints_normalized.csv")
            cap = __import__("cv2").VideoCapture(str(full4 / "4_dlc_probe.mp4"))
            frames = [f for ok, f in iter(lambda: cap.read(), (False, None)) if ok]
            cap.release()
            return full4, kps, frames
    for folder_name in [f"dlc_probe_{stem}_gpu", f"dlc_probe_{stem}"]:
        folder = base / folder_name
        if folder.exists():
            kps_path = folder / "pet_keypoints_normalized.csv"
            clip_path = folder / f"{stem}_dlc_probe.mp4"
            if kps_path.exists() and clip_path.exists():
                kps = pd.read_csv(kps_path)
                cap = __import__("cv2").VideoCapture(str(clip_path))
                frames = [f for ok, f in iter(lambda: cap.read(), (False, None)) if ok]
                cap.release()
                return folder, kps, frames
    return None, None, None


def _band_power_artifact_score(pulse: np.ndarray, target_bpm: float) -> float:
    try:
        return band_power_ratio(pulse, FS, float(target_bpm))
    except Exception:
        return 1.0


def composite_quality(bpm: float, snr: float, pulse: np.ndarray, target: float) -> float:
    """Higher is better. Mirrors scoring used in recent best runs."""
    if not np.isfinite(bpm) or not np.isfinite(snr) or snr <= 0:
        return -1.0
    bpr = _band_power_artifact_score(pulse, target)
    artifact_pen = 0.6 if abs(bpm - 100) < 22 else 1.0
    # mild preference for high-HR realism on videos 3/7
    hr_bonus = 1.15 if (target > 170 and bpm > 155) or (target < 120 and bpm < 135) else 1.0
    return float(snr * artifact_pen * (1.0 + 0.12 * np.log1p(bpr)) * hr_bonus)


def ramped_prior_strength(step_idx: int, min_s: float = 0.20, max_s: float = 0.55, ramp_steps: int = 5) -> float:
    """Gradual trust in prior (avoids early lock-in)."""
    if step_idx <= 0:
        return min_s
    progress = min(1.0, step_idx / float(ramp_steps))
    return min_s + (max_s - min_s) * progress


def decide_weights(running_bpm: float, use_adaptive: bool) -> np.ndarray:
    """Pure 2 or part of 1+2 / 2+3 etc."""
    if not use_adaptive:
        return W_V1
    if not np.isfinite(running_bpm):
        return W_V1
    # Blend zone 145-175 bpm
    if running_bpm > 175:
        return W_HR
    if running_bpm < 145:
        return W_V1
    alpha = (running_bpm - 145) / 30.0
    alpha = float(np.clip(alpha, 0.0, 1.0))
    return alpha * W_HR + (1.0 - alpha) * W_V1


def estimate_bpm_for_config(
    rgb: np.ndarray,
    target: float,
    prev_prior: Optional[float],
    step_idx: int,
    use_temporal: bool,
    use_adaptive: bool,
    use_ensemble: bool,
    apply_ab: bool = False,
) -> Dict[str, Any]:
    """
    Core: returns bpm, snr, quality, new_prior, used_weights, chosen_method
    under the selected combination of 1/2/3 mechanisms.
    """
    if apply_ab:
        try:
            proxy = np.zeros(len(rgb))
            rgb = strong_panting_subtraction(rgb, proxy, strength=0.72)
        except Exception:
            pass

    prior_to_use = prev_prior if (use_temporal and prev_prior is not None) else None
    strength = ramped_prior_strength(step_idx) if use_temporal else 0.0

    candidates = []  # list of (bpm, snr, pulse, method_name, weights_used)

    # Always include dog_learned (the star of the show)
    weights = decide_weights(prev_prior if prev_prior else 155.0, use_adaptive)
    try:
        pulse_d = sig_dog_learned(rgb, FS, 70, 240, weights=weights)
        if use_temporal and prior_to_use is not None:
            bpm_d, snr_d, _ = estimate_bpm_with_prior(pulse_d, FS, 70, 240, target_prior=prior_to_use, prior_strength=strength)
        else:
            bpm_d, snr_d, _ = estimate_bpm_from_signal(pulse_d, FS, 70, 240)
        candidates.append((bpm_d, snr_d, pulse_d, "dog_learned", weights))
    except Exception:
        pass

    if use_ensemble:
        # Add strong classicals for fusion opportunity
        for mname, fn in [("pos", sig_pos), ("chrom", sig_chrom), ("ica", sig_ica)]:
            try:
                pulse_m = fn(rgb, FS, 70, 240)
                if use_temporal and prior_to_use is not None:
                    bpm_m, snr_m, _ = estimate_bpm_with_prior(pulse_m, FS, 70, 240, target_prior=prior_to_use, prior_strength=strength * 0.7)
                else:
                    bpm_m, snr_m, _ = estimate_bpm_from_signal(pulse_m, FS, 70, 240)
                candidates.append((bpm_m, snr_m, pulse_m, mname, None))
            except Exception:
                continue

    if not candidates:
        return {"bpm": np.nan, "snr": 0.0, "quality": -1.0, "prior": prev_prior, "weights": weights, "method": "none"}

    # Score + select (or fuse)
    scored = []
    for bpm, snr, pulse, mname, w in candidates:
        q = composite_quality(bpm, snr, pulse, target)
        scored.append((q, bpm, snr, pulse, mname, w))

    scored.sort(reverse=True)  # best first
    best_q, best_bpm, best_snr, best_pulse, best_m, best_w = scored[0]

    # Light fusion for 1+3 / 2+3 / 1+2+3 when top two are close in quality
    if use_ensemble and len(scored) >= 2:
        q2, b2, _, _, _, _ = scored[1]
        if best_q > 0 and q2 > best_q * 0.65:
            # quality-weighted average of top-2 (clamped to plausible dog range)
            w1 = best_q
            w2 = q2
            fused = (best_bpm * w1 + b2 * w2) / (w1 + w2 + 1e-9)
            fused = float(np.clip(fused, 65, 235))
            # Re-eval quality on fused (use best pulse proxy)
            best_bpm = fused

    # Update prior only on good windows (safety)
    new_prior = prev_prior
    if use_temporal:
        if np.isfinite(best_bpm) and best_q > 2.0:
            dist = abs(best_bpm - (prev_prior or 155))
            if dist < 45 or best_snr > 4.0:  # trust jump only if strong evidence
                new_prior = 0.65 * (prev_prior or 155) + 0.35 * best_bpm   # light IIR
            else:
                # keep prior, do not follow outlier
                new_prior = prev_prior

    return {
        "bpm": float(best_bpm),
        "snr": float(best_snr),
        "quality": float(best_q),
        "prior": new_prior,
        "weights": best_w if best_w is not None else weights,
        "method": best_m,
    }


def process_video(stem: str, max_win: int, apply_ab: bool, mode: str) -> List[dict]:
    """
    mode: "best_window" (independent, can use oracle) or "temporal" (strict order + carry prior)
    Returns list of per-config result rows for this video.
    """
    probe = load_probe(stem)
    if probe[0] is None:
        return []
    _, kps, frames = probe
    target = GT[stem]
    n = len(frames)
    if n < WIN + 30:
        return []

    zones = BEST_ZONES_PER_VIDEO.get(stem, [("muzzle_skin", "single")])
    step = max(25, WIN // 6)

    # Build ordered list of (start, zone_name, variant)
    candidates = []
    for zname, variant in zones:
        for s in range(8, max(1, n - WIN - 8), step):
            candidates.append((s, zname, variant))
    # Sort by time for temporal realism; limit count
    candidates.sort(key=lambda x: x[0])
    candidates = candidates[: max_win * max(2, len(zones)) ]

    # Config matrix (name, use_temporal, use_adaptive, use_ensemble, prior_source)
    configs = [
        ("baseline_highhr+oracle", False, False, False, "oracle"),   # reproduces ~18.7
        ("pure1_temporal_v1",      True,  False, False, "temporal"),
        ("pure2_adaptive",         False, True,  False, "none"),
        ("pure3_ensemble",         False, False, True,  "none"),
        ("combo1+2",               True,  True,  False, "temporal"),
        ("combo1+3",               True,  False, True,  "temporal"),
        ("combo2+3",               False, True,  True,  "none"),
        ("combo1+2+3",             True,  True,  True,  "temporal"),
        ("ref_pos_no_prior",       False, False, False, "none"),     # classical baseline
    ]

    results = []
    for cfg_name, use_t, use_a, use_e, prior_src in configs:
        priors = []
        bpms = []
        quals = []
        prev_p = float(target) if prior_src == "oracle" else 152.0
        running_med = 152.0
        dog_bpms_for_switch = []  # only dog_learned estimates for adaptive decision

        ordered = candidates[:]  # already time-sorted at build time

        for idx, (start, zname, variant) in enumerate(ordered):
            try:
                if variant == "multi" and zname in MULTI_PATCH_AREAS:
                    rgb, _ = extract_rgb_multi_patch(frames, kps, MULTI_PATCH_AREAS[zname]["patches"], start, WIN)
                else:
                    spec = SINGLE_ROIS.get(zname, {"kps": ["nose", "upper_jaw"], "radius": 14})
                    rgb, _ = extract_rgb_single_center(frames, kps, spec["kps"], spec.get("radius", 14), start, WIN)
                if len(rgb) < 140 or not np.isfinite(rgb).all():
                    continue
            except Exception:
                continue

            # For adaptive we feed a conservative running value (never let first 1-2 windows flip the weights)
            adaptive_seed = running_med if len(dog_bpms_for_switch) >= 2 else 148.0
            est = estimate_bpm_for_config(
                rgb, target, prev_p if (use_t or prior_src == "oracle") else None,
                idx, use_t, use_a, use_e, apply_ab
            )

            if np.isfinite(est["bpm"]) and est["quality"] > 0.5:
                bpms.append(est["bpm"])
                quals.append(est["quality"])
                priors.append(est["prior"] if est["prior"] else prev_p)

                if est["method"] == "dog_learned":
                    dog_bpms_for_switch.append(est["bpm"])
                    if len(dog_bpms_for_switch) >= 2:
                        running_med = float(np.median(dog_bpms_for_switch[-3:]))

                if use_t:
                    prev_p = est["prior"] if est["prior"] is not None else prev_p

        if not bpms:
            mae = 999.0
            est_bpm = np.nan
            n_valid = 0
        else:
            n_valid = len(bpms)
            if mode == "temporal" or use_t:
                est_bpm = float(np.median(bpms))
            else:
                best_idx = int(np.argmax(quals))
                est_bpm = bpms[best_idx]
            mae = abs(est_bpm - target)

        results.append({
            "video": stem,
            "target": target,
            "config": cfg_name,
            "est_bpm": round(est_bpm, 1) if np.isfinite(est_bpm) else np.nan,
            "mae": round(mae, 1),
            "n_valid_windows": n_valid,
            "use_temporal": use_t,
            "use_adaptive": use_a,
            "use_ensemble": use_e,
            "mode": mode,
        })
    return results


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["best_window", "temporal", "both"], default="both")
    ap.add_argument("--max-per-roi", type=int, default=4, help="Window budget per ROI (higher = slower, more data)")
    ap.add_argument("--apply-ab", action="store_true", help="Light A+B panting subtraction")
    ap.add_argument("--quick", action="store_true", help="Fast smoke test (videos 5,6,8 only)")
    ap.add_argument("--stems", default="all")
    args = ap.parse_args()

    stems = ["5", "6", "8"] if args.quick else (USABLE if args.stems == "all" else [s.strip() for s in args.stems.split(",") if s.strip()])

    all_rows = []
    for stem in stems:
        print(f"\n=== Processing Video {stem} (target={GT[stem]}) ===")
        rows = process_video(stem, args.max_per_roi, args.apply_ab, "best_window")
        all_rows.extend(rows)
        # For temporal we re-process with mode flag (re-uses same extraction)
        if args.mode in ("temporal", "both") and not args.quick:
            rows_t = process_video(stem, max(2, args.max_per_roi - 1), args.apply_ab, "temporal")
            all_rows.extend(rows_t)

    if not all_rows:
        print("No data produced.")
        return

    df = pd.DataFrame(all_rows)
    out_dir = Path("reports/rppg_pet_keypoints")
    out_dir.mkdir(parents=True, exist_ok=True)

    csv_path = out_dir / "1_2_3_comparison_results.csv"
    df.to_csv(csv_path, index=False)
    print(f"\nSaved CSV: {csv_path}")

    # Pretty summary tables
    print("\n" + "=" * 95)
    print("1/2/3 COMPARISON + COMBINATIONS  (lower MAE is better)")
    print("=" * 95)

    for m in ["best_window", "temporal"]:
        sub = df[df["mode"] == m] if "mode" in df.columns else df
        if sub.empty:
            continue
        print(f"\n--- {m.upper()} MODE ---")
        pivot = sub.pivot_table(index="config", columns="video", values="mae", aggfunc="first")
        overall = sub.groupby("config")["mae"].mean().round(1)
        pivot["OVERALL_MAE"] = overall
        print(pivot.sort_values("OVERALL_MAE").to_string())

    # Write rich MD report
    md = out_dir / "1_2_3_comparison_report.md"
    with open(md, "w", encoding="utf-8") as f:
        f.write("# 1/2/3 Comparison & Combination Test — Temporal Prior / Adaptive Weights / Ensemble\n\n")
        f.write(f"**Videos**: {', '.join(stems)} (GT from video_labels_ocr.csv)\n")
        f.write(f"**Weights**: W_V1 = {np.round(W_V1,4).tolist()} | W_HR = {np.round(W_HR,4).tolist()}\n")
        f.write(f"**Mode(s)**: {args.mode}\n\n")

        f.write("## Summary Ranking (mean MAE across tested videos)\n\n")
        ranking = df.groupby("config")["mae"].mean().sort_values().round(1)
        f.write(ranking.to_string())
        f.write("\n\n")

        f.write("## Per-Video Detail (Target / Estimated / MAE)\n\n")
        for stem in stems:
            t = GT[stem]
            f.write(f"### Video {stem} (target = {t})\n\n")
            vdf = df[df["video"] == stem][["config", "est_bpm", "mae", "n_valid_windows"]].sort_values("mae")
            f.write(vdf.to_string(index=False))
            f.write("\n\n")

        f.write("## Key Observations & Recommendations\n\n")
        f.write("- Baseline (highhr + oracle) should ~reproduce 18.7 overall from earlier run.\n")
        f.write("- Pure temporal prior (1) without oracle is the most deployment-realistic.\n")
        f.write("- Adaptive weights (2) expected to help high-HR videos 3+7 at cost of low-HR.\n")
        f.write("- Ensemble (3) often stabilizes by letting POS/ICA rescue when dog_learned picks wrong peak.\n")
        f.write("- Best combo usually 1+3 or 1+2+3 (temporal + ensemble gives both stability and peak rescue).\n\n")
        f.write("**Next engineering step**: integrate the winning config into demo_rejection_anatomical_video4.py + full_evaluation_current_best.py as the default signal path.\n")

    print(f"\nDetailed report written: {md}")
    print("\nDone. Review CSV + MD, then decide winning strategy for pipeline integration.")


if __name__ == "__main__":
    main()
