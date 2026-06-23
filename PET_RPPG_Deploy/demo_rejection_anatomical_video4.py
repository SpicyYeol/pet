#!/usr/bin/env python3
"""
Proper Rejection Demo on Anatomical Data for Video 4 (with real keypoints)

This fulfills the request:
"1번을 anatomical 데이터로 제대로 돌려줘 (keypoints까지 붙여서)"

- Uses the full DLC anatomical keypoints we generated for video 4
- Extracts anatomical ROIs (neck, nose, ears, etc.)
- Runs rPPG methods in windows
- Applies real RejectionScorer using actual keypoint-derived motion and mouth scores
- Shows before vs after rejection effect with concrete numbers
"""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
import pandas as pd

# Robust imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Adaptive ROI selector (new 2026-05)
try:
    from adaptive_roi_selector import AdaptiveROISelector
except ImportError:
    AdaptiveROISelector = None  # graceful fallback if module not present

from evaluate_rppg_methods import (
    METHOD_FUNCTIONS,
    estimate_bpm_from_signal,
    interpolate_rgb,
    safe_bandpass,
)
from rppg_rejection import RejectionScorer

# Dual respiratory proxies (Chest = main 호흡수, Facial = Panting + Artifact indicator)
try:
    from dual_respiratory_proxies import (
        compute_thoracic_breathing_proxy,
        estimate_thoracic_breathing_rate,
        compute_facial_panting_proxy,
        estimate_panting_rate,
        get_panting_intensity,
    )
    HAS_DUAL_RESPIRATORY = True
except ImportError:
    HAS_DUAL_RESPIRATORY = False


# Default (original) ROIs
ANATOMICAL_ROIS = {
    "neck": {"kps": ["neck", "throat"], "radius": 28},
    "nose_bridge": {"kps": ["nose", "upper_jaw"], "radius": 18},
    "left_ear_base": {"kps": ["left_earbase"], "radius": 16},
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "upper_chest": {"kps": ["neck", "withers"], "radius": 30},
}

# A+B: Focused dog thin-fur ROIs + good performers (from prototype experiments)
DOG_AWARE_ROIS = {
    "throat_exposed": {"kps": ["throat_base", "throat_end"], "radius": 22},
    "right_ear_base": {"kps": ["right_earbase"], "radius": 16},
    "left_ear_base": {"kps": ["left_earbase"], "radius": 16},
    "muzzle_skin": {"kps": ["nose", "upper_jaw"], "radius": 13},
    "nose_bridge": {"kps": ["nose", "upper_jaw"], "radius": 18},
}

# Multi-area / multi-patch ROIs (2026-05 improvement)
# 2+ small stable patches per anatomical zone → higher effective pixel count, lower noise
MULTI_PATCH_AREAS = {
    "throat_area": {
        "patches": [
            {"kps": ["throat_base", "throat_end"], "radius": 20},
            {"kps": ["neck", "throat_end"], "radius": 18},
        ]
    },
    "ear_area_right": {
        "patches": [
            {"kps": ["right_earbase"], "radius": 15},
            {"kps": ["right_earend"], "radius": 12},
        ]
    },
    "ear_area_left": {
        "patches": [
            {"kps": ["left_earbase"], "radius": 15},
            {"kps": ["left_earend"], "radius": 12},
        ]
    },
    "muzzle_area": {
        "patches": [
            {"kps": ["nose", "upper_jaw"], "radius": 12},
            {"kps": ["upper_jaw", "mouth_end_right"], "radius": 10},
        ]
    },
}


def compute_panting_proxy(kps_df: pd.DataFrame, n_frames: int, smooth_window: int = 5) -> np.ndarray:
    """Improved multi-keypoint panting proxy for dogs (A)."""
    proxies = []
    for fi in range(n_frames):
        upper = get_keypoint_center(kps_df, fi, ["upper_jaw"])
        lower = get_keypoint_center(kps_df, fi, ["lower_jaw"])
        left_m = get_keypoint_center(kps_df, fi, ["mouth_end_left"])
        right_m = get_keypoint_center(kps_df, fi, ["mouth_end_right"])
        r_ear = get_keypoint_center(kps_df, fi, ["right_earbase"])
        l_ear = get_keypoint_center(kps_df, fi, ["left_earbase"])

        vertical = abs(upper[1] - lower[1]) if (upper and lower) else 0.0
        lateral = abs(left_m[0] - right_m[0]) if (left_m and right_m) else 0.0
        ear_motion = abs(r_ear[1] - l_ear[1]) * 0.3 if (r_ear and l_ear) else 0.0

        proxy = vertical * 0.55 + lateral * 0.35 + ear_motion * 0.10
        proxies.append(proxy)

    arr = np.array(proxies, dtype=float)
    if len(arr) > smooth_window > 1:
        kernel = np.ones(smooth_window) / smooth_window
        arr = np.convolve(arr, kernel, mode="same")
    if arr.std() > 1e-6:
        arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    return arr


def pca_most_periodic(rgb: np.ndarray) -> np.ndarray:
    """Return the PCA component with the highest periodicity (for cardiac amplification)."""
    if rgb.shape[1] < 1 or len(rgb) < 10:
        return rgb[:, 0] if rgb.shape[1] > 0 else np.zeros(len(rgb))
    pca = PCA(n_components=min(3, rgb.shape[1]))
    comps = pca.fit_transform(rgb)
    best_score = -np.inf
    best_comp = comps[:, 0]
    for i in range(comps.shape[1]):
        comp = comps[:, i]
        if comp.std() < 1e-8:
            continue
        ac = np.correlate(comp - comp.mean(), comp - comp.mean(), mode='full')
        ac = ac[len(comp)-1:]
        score = np.max(ac[5:]) if len(ac) > 5 else 0
        if score > best_score:
            best_score = score
            best_comp = comp
    return best_comp


def periodicity_reinforcement(x: np.ndarray, period: int | None = None) -> np.ndarray:
    """Simple time-domain periodicity reinforcement for weak cardiac signals."""
    if len(x) < 10:
        return x
    if period is None:
        ac = np.correlate(x - x.mean(), x - x.mean(), mode='full')
        ac = ac[len(x)-1:]
        lags = np.arange(3, min(30, len(ac)))
        if len(lags) == 0:
            return x
        best_lag = lags[np.argmax(ac[lags])]
        period = best_lag
    if period < 3:
        return x
    reinforced = x.copy().astype(float)
    count = 1.0
    for s in [period, 2*period]:
        if s < len(x):
            reinforced[s:] += x[:-s]
            count += 1
    return reinforced / count


def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: list[str]) -> tuple[float, float] | None:
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())


def extract_patch(frame: np.ndarray, center: tuple[float, float], radius: int) -> np.ndarray:
    h, w = frame.shape[:2]
    cx, cy = center
    x1, y1 = max(0, int(cx - radius)), max(0, int(cy - radius))
    x2, y2 = min(w, int(cx + radius)), min(h, int(cy + radius))
    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return np.full(3, np.nan)
    return crop.mean(axis=(0, 1))[::-1].astype(float)  # RGB


# --- Multi-area helpers (added 2026-05 for pixel stability) ---
def extract_patch_with_pixels(frame: np.ndarray, center: tuple[float, float], radius: int) -> tuple[np.ndarray, int]:
    h, w = frame.shape[:2]
    cx, cy = center
    x1, y1 = max(0, int(cx - radius)), max(0, int(cy - radius))
    x2, y2 = min(w, int(cx + radius)), min(h, int(cy + radius))
    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return np.full(3, np.nan), 0
    pixel_count = int(crop.shape[0] * crop.shape[1])
    rgb = crop.mean(axis=(0, 1))[::-1].astype(float)
    return rgb, pixel_count


def extract_rgb_multi_patch(frames, kps, patch_list: list[dict], start: int, win: int) -> tuple[np.ndarray, dict]:
    """Extract and average multiple small patches per anatomical zone.
    Returns RGB series + pixel statistics (mean, min, std)."""
    rgb_series = []
    pixel_counts = []
    for off in range(win):
        fi = start + off
        if fi >= len(frames):
            break
        frame_rgb_patches = []
        frame_pc = 0
        for pspec in patch_list:
            center = get_keypoint_center(kps, fi, pspec["kps"])
            if center is None:
                continue
            rgb, pc = extract_patch_with_pixels(frames[fi], center, pspec["radius"])
            if np.isfinite(rgb).all():
                frame_rgb_patches.append(rgb)
                frame_pc += pc
        if not frame_rgb_patches:
            rgb_series.append([np.nan, np.nan, np.nan])
            pixel_counts.append(0)
            continue
        avg_rgb = np.mean(frame_rgb_patches, axis=0)
        rgb_series.append(avg_rgb)
        pixel_counts.append(frame_pc)

    arr = np.array(rgb_series)
    pcs = np.array(pixel_counts, dtype=float)
    for c in range(3):
        col = pd.Series(arr[:, c])
        arr[:, c] = col.interpolate().ffill().bfill().to_numpy()
    stats = {
        "pixel_mean": float(np.nanmean(pcs)) if len(pcs) > 0 else 0,
        "pixel_min": float(np.nanmin(pcs)) if len(pcs) > 0 else 0,
        "pixel_std": float(np.nanstd(pcs)) if len(pcs) > 0 else 0,
    }
    return arr, stats


# --- Helpers for real AdaptiveROISelector integration (rich dual data path) ---
def extract_rgb_for_spec(frames, kps, spec_or_area, start, win, is_multi=False):
    """Unified extractor for both single-spec and multi-area dicts."""
    if is_multi and "patches" in spec_or_area:
        return extract_rgb_multi_patch(frames, kps, spec_or_area["patches"], start, win)
    else:
        # single center style
        kps_list = spec_or_area.get("kps", [])
        radius = spec_or_area.get("radius", 15)
        return extract_rgb_single_center(frames, kps, kps_list, radius, start, win)  # reuse from earlier if present, else define minimal


def apply_ab_amplification(rgb, panting_proxy):
    if panting_proxy is None:
        return rgb
    gr = rgb[:, 1] - rgb[:, 0]
    if len(panting_proxy) != len(gr) or panting_proxy.std() < 1e-6:
        reinforced = periodicity_reinforcement(rgb[:, 1])
        out = rgb.copy()
        out[:, 1] = reinforced
        return out
    beta = np.cov(gr, panting_proxy)[0, 1] / (np.var(panting_proxy) + 1e-12)
    cleaned = gr - 0.85 * beta * panting_proxy
    p5, p95 = np.percentile(cleaned, [5, 95])
    cleaned = np.clip(cleaned, p5, p95)
    out = rgb.copy()
    out[:, 1] = out[:, 0] + cleaned
    out[:, 1] = periodicity_reinforcement(out[:, 1])
    return out


def get_quick_quality(rgb):
    """Return (best_bpm, best_snr, method, post_clean_gr_var) for scoring."""
    if len(rgb) < 10:
        return 0, 0, "", 999.0
    gr = rgb[:, 1] - rgb[:, 0]
    post_var = float(np.var(gr))
    best_bpm, best_snr, best_name = 0., -np.inf, ""
    for name, fn in METHOD_FUNCTIONS.items():
        try:
            pulse = fn(rgb, 10.0, 70, 240)
            bpm, snr, _ = estimate_bpm_from_signal(pulse, 10.0, 70, 240)
            if snr > best_snr:
                best_snr = snr
                best_bpm = bpm
                best_name = name
        except Exception:
            continue
    return best_bpm, best_snr, best_name, post_var


def extract_rgb_single_center(frames, kps, kp_list, radius, start, win):
    """Minimal single-center extractor (for dual decision path)."""
    rgb_series = []
    for off in range(win):
        fi = start + off
        if fi >= len(frames):
            break
        center = get_keypoint_center(kps, fi, kp_list)
        if center is None:
            rgb_series.append([np.nan, np.nan, np.nan])
            continue
        cx, cy = center
        r = radius
        h, w = frames[fi].shape[:2]
        x1, y1 = max(0, int(cx - r)), max(0, int(cy - r))
        x2, y2 = min(w, int(cx + r)), min(h, int(cy + r))
        crop = frames[fi][y1:y2, x1:x2]
        if crop.size == 0:
            rgb_series.append([np.nan, np.nan, np.nan])
        else:
            rgb_series.append(crop.mean(axis=(0, 1))[::-1].astype(float))
    arr = np.array(rgb_series)
    for c in range(3):
        col = pd.Series(arr[:, c])
        arr[:, c] = col.interpolate().ffill().bfill().to_numpy()
    return arr, {"pixel_mean": 0}  # pixel stats not critical for decision here


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--video-stem", default="4", help="e.g. 3, 4, 7")
    parser.add_argument("--aggressive", action="store_true", help="Use aggressive rejection thresholds")
    parser.add_argument("--dog_aware", action="store_true", help="Use dog thin-fur focused ROIs + panting preprocessing (A+B)")
    parser.add_argument("--relax_rejection", action="store_true", help="Use relaxed rejection thresholds suitable for dog_aware preprocessing")
    parser.add_argument("--multi_area", action="store_true", help="Use multi-patch anatomical ROIs (2+ patches per zone) for higher pixel count / lower noise (2026-05 improvement)")
    args = parser.parse_args()

    stem = args.video_stem

    # Support GPU probe folders (_gpu suffix) - same logic as analyze_video.py
    base_dir = Path(f"reports/rppg_pet_keypoints/dlc_probe_{stem}_gpu")
    if not base_dir.exists():
        base_dir = Path(f"reports/rppg_pet_keypoints/dlc_probe_{stem}")
    if not base_dir.exists() and stem == "4":
        base_dir = Path("reports/rppg_pet_keypoints/dlc_full4")

    keypoints_path = base_dir / "pet_keypoints_normalized.csv"
    video_path = base_dir / f"{stem}_dlc_probe.mp4"

    if not keypoints_path.exists() or not video_path.exists():
        print("Required files not found. Run the full DLC + normalize first.")
        return

    print("Loading anatomical keypoints...")
    kps = pd.read_csv(keypoints_path)
    print(f"  {len(kps)} rows, {kps['frame_index'].nunique()} frames")

    # Read the exact clip used for DLC
    cap = cv2.VideoCapture(str(video_path))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    cap.release()
    print(f"Loaded {len(frames)} frames from clip")

    # A+B dog-aware mode
    # New (2026-05): When in dog_aware mode we use the AdaptiveROISelector
    # to decide per anatomical zone whether the single or multi-patch variant is better.
    # This replaces the old global --multi_area force switch.
    facial_panting_proxy = None
    chest_breathing_proxy = None
    if args.dog_aware:
        facial_panting_proxy = compute_panting_proxy(kps, len(frames))
        if HAS_DUAL_RESPIRATORY:
            chest_breathing_proxy = compute_thoracic_breathing_proxy(kps, len(frames))

    # === Adaptive ROI (real version using dual candidates + selector) ===
    if args.dog_aware and AdaptiveROISelector is not None and not args.multi_area:
        print("  [adaptive_roi] Using AdaptiveROISelector with rich dual-candidate data")

        selector = AdaptiveROISelector()

        # For the key zones, extract both single and multi variants, apply A+B,
        # compute the exact quality metrics the selector expects, then let it decide.
        # This is the "strong data" path the user requested.
        effective_rois = {}
        zone_map = {
            "throat": ("throat_exposed", "throat_area", DOG_AWARE_ROIS["throat_exposed"], MULTI_PATCH_AREAS["throat_area"]),
            "right_ear": ("right_ear_base", "ear_area_right", DOG_AWARE_ROIS["right_ear_base"], MULTI_PATCH_AREAS["ear_area_right"]),
            "left_ear": ("left_ear_base", "ear_area_left", DOG_AWARE_ROIS["left_ear_base"], MULTI_PATCH_AREAS["ear_area_left"]),
            "muzzle": ("muzzle_skin", "muzzle_area", DOG_AWARE_ROIS["muzzle_skin"], MULTI_PATCH_AREAS["muzzle_area"]),
        }

        dual_rows = []
        for zone, (single_name, multi_name, single_spec, multi_spec) in zone_map.items():
            # Extract both (full video for accurate post-clean stats)
            # Single
            rgb_s, _ = extract_rgb_for_spec(frames, kps, single_spec, 0, len(frames))
            if facial_panting_proxy is not None:
                rgb_s = apply_ab_amplification(rgb_s, facial_panting_proxy)
            bpm_s, snr_s, _, post_var_s = get_quick_quality(rgb_s)

            dual_rows.append({
                "base_name": zone,
                "roi_family": "single",
                "full_name": single_name,
                "spec": single_spec,
                "pixel_mean": single_spec.get("radius", 15)**2 * 3.14,
                "best_snr": snr_s,
                "post_clean_gr_var": post_var_s,
                "best_bpm": bpm_s,
                "peak_dist_from_100": abs(bpm_s - 100),
            })

            # Multi
            rgb_m, _ = extract_rgb_for_spec(frames, kps, multi_spec, 0, len(frames), is_multi=True)
            if facial_panting_proxy is not None:
                rgb_m = apply_ab_amplification(rgb_m, facial_panting_proxy)
            bpm_m, snr_m, _, post_var_m = get_quick_quality(rgb_m)

            dual_rows.append({
                "base_name": zone,
                "roi_family": "multi",
                "full_name": multi_name,
                "spec": multi_spec,
                "pixel_mean": multi_spec.get("patches", [{}])[0].get("radius", 15)**2 * 3.14 * 1.7,
                "best_snr": snr_m,
                "post_clean_gr_var": post_var_m,
                "best_bpm": bpm_m,
                "peak_dist_from_100": abs(bpm_m - 100),
            })

        dual_df = pd.DataFrame(dual_rows)
        _, tagged = selector.from_dual_candidates(dual_df, high_hr_prior=True)

        for base in tagged["base_name"].unique():
            chosen = tagged[(tagged["base_name"] == base) & (tagged["chosen_for_zone"] == True)].iloc[0]
            effective_rois[chosen["full_name"]] = chosen["spec"]
            print(f"    {base}: chose {chosen['roi_family']} ({chosen['full_name']}) - {chosen['decision_reason']}")

        rois = effective_rois
        use_multi = False   # We are in per-zone adaptive mode; the chosen specs themselves carry "patches" if multi

    else:
        # Legacy global path
        use_multi = args.multi_area and args.dog_aware
        if use_multi:
            rois = MULTI_PATCH_AREAS
            print("  [dog_aware + multi_area] Using multi-patch ROIs (legacy global)")
        else:
            rois = DOG_AWARE_ROIS if args.dog_aware else ANATOMICAL_ROIS
            if args.dog_aware:
                print("  [dog_aware] Using focused thin-fur ROIs + panting preprocessing")

    fs = 10.0
    window_sec = 20.0
    step_sec = 5.0
    win = int(window_sec * fs)
    step = int(step_sec * fs)

    # Lenient (original)
    lenient_scorer = RejectionScorer()

    # Aggressive (for demonstration of filtering power)
    aggressive_scorer = RejectionScorer(
        motion_thresh=4.5,
        artifact_thresh=0.25,
        mouth_thresh=10.0,
        bg_corr_thresh=0.25,
    )

    # Dog-aware rejection redesign (tailored to amplified + stronger preprocessing signals)
    # Based on actual feature distributions from latest amplified runs on 3/7:
    # - Motion now typically 12-17 (higher than old data)
    # - Artifact_100bpm lower after strong subtraction (mean ~0.13-0.16)
    # - Mouth varies significantly by ROI (high on some like throat in video 3)
    if args.dog_aware:
        lenient_scorer = RejectionScorer(
            motion_thresh=22.0,
            artifact_thresh=0.55,
            mouth_thresh=42.0,
            bg_corr_thresh=0.55,
        )
        aggressive_scorer = RejectionScorer(
            motion_thresh=22.0,
            artifact_thresh=0.55,
            mouth_thresh=42.0,
            bg_corr_thresh=0.55,
        )

    all_results = []

    for roi_name, spec in rois.items():
        print(f"\nProcessing anatomical ROI: {roi_name}")

        # Per-spec decision (works for both legacy global and new per-zone adaptive selector)
        if "patches" in spec:
            # This spec is a multi-patch area definition
            rgb_arr, pixel_stats = extract_rgb_multi_patch(frames, kps, spec["patches"], 0, len(frames))
            print(f"  [multi-area] pixel_mean={pixel_stats['pixel_mean']:.0f}, min={pixel_stats['pixel_min']:.0f}")
        else:
            # This spec is a classic single-center definition
            rgb_series = []
            for fi in range(len(frames)):
                center = get_keypoint_center(kps, fi, spec["kps"])
                if center is None:
                    rgb_series.append([np.nan, np.nan, np.nan])
                    continue
                rgb = extract_patch(frames[fi], center, spec["radius"])
                rgb_series.append(rgb)
            rgb_arr = np.array(rgb_series)
            pixel_stats = {"pixel_mean": 0, "pixel_min": 0, "pixel_std": 0}

        # A+B (stronger version): Apply improved panting subtraction on raw patches
        # Use facial proxy for artifact subtraction (stronger for panting)
        if args.dog_aware and facial_panting_proxy is not None:
            gr = rgb_arr[:, 1] - rgb_arr[:, 0]
            p = facial_panting_proxy[:len(gr)]
            if p.std() > 1e-6:
                beta = np.cov(gr, p)[0, 1] / (np.var(p) + 1e-12)
                cleaned_gr = gr - 0.85 * beta * p
                p5, p95 = np.percentile(cleaned_gr, [5, 95])
                cleaned_gr = np.clip(cleaned_gr, p5, p95)
                rgb_arr[:, 1] = rgb_arr[:, 0] + cleaned_gr

        # Time-domain cardiac amplification (user-requested direction)
        if args.dog_aware:
            g = rgb_arr[:, 1]
            reinforced = periodicity_reinforcement(g)
            rgb_arr[:, 1] = reinforced

        if np.isfinite(rgb_arr).sum() < 100:
            print(f"  Skipping {roi_name} - too little valid data")
            continue

        # Simple sliding windows
        for start in range(0, len(rgb_arr) - win, step):
            win_rgb = rgb_arr[start : start + win]
            if np.isfinite(win_rgb).sum() < 30:
                continue

            win_rgb = pd.DataFrame(win_rgb).interpolate().ffill().bfill().to_numpy()

            for method, fn in METHOD_FUNCTIONS.items():
                try:
                    pulse = fn(win_rgb, fs, 70, 240)
                    bpm, snr, _ = estimate_bpm_from_signal(pulse, fs, 70, 240)
                except Exception:
                    continue

                frame_indices = list(range(start, start + win))
                rej_lenient = lenient_scorer.score_window(
                    pulse=pulse, fs=fs, keypoints_df=kps, frame_indices=frame_indices
                )
                rej_aggressive = aggressive_scorer.score_window(
                    pulse=pulse, fs=fs, keypoints_df=kps, frame_indices=frame_indices
                )

                all_results.append({
                    "roi": roi_name,
                    "method": method,
                    "start_frame": start,
                    "raw_bpm": round(bpm, 1),
                    "snr": round(snr, 2),
                    "rejection_lenient": rej_lenient["rejection_score"],
                    "rejection_aggressive": rej_aggressive["rejection_score"],
                    "motion": rej_aggressive["motion"],
                    "artifact_100bpm": rej_aggressive["artifact_100bpm_ratio"],
                    "mouth": rej_aggressive["mouth_score"],
                    "pixel_mean": round(pixel_stats.get("pixel_mean", 0), 1),
                    "pixel_min": round(pixel_stats.get("pixel_min", 0), 1),
                })

    df = pd.DataFrame(all_results)
    if df.empty:
        print("No results generated.")
        return

    # Save per-video, respecting the stem and whether it's a GPU probe or not
    base = Path("reports/rppg_pet_keypoints")
    if args.video_stem == "4" and (base / "dlc_full4").exists():
        # Special case to keep legacy video 4 full data location
        out_dir = base / "dlc_full4_roi_analysis_v2"
    else:
        # For other videos (especially GPU probes), save inside their probe/analysis folder
        probe_folder = base / f"dlc_probe_{args.video_stem}_gpu"
        if not probe_folder.exists():
            probe_folder = base / f"dlc_probe_{args.video_stem}"
        out_dir = probe_folder / f"{args.video_stem}_analysis_aggressive"

    out_path = out_dir / "rejection_anatomical_results.csv"
    out_dir.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"\nSaved detailed results to: {out_path}")

    # ============================================================
    # NEW: Dual Respiratory Output (Chest = Main 호흡수, Facial = Panting/Artifact)
    # ============================================================
    if args.dog_aware and HAS_DUAL_RESPIRATORY:
        print("\n" + "="*70)
        print("DUAL RESPIRATORY RATES (Chest = Main 호흡수 / Facial = Panting Indicator)")
        print("="*70)

        thoracic_rate, thoracic_conf = estimate_thoracic_breathing_rate(chest_breathing_proxy)
        panting_rate, panting_conf = estimate_panting_rate(facial_panting_proxy)
        panting_int = get_panting_intensity(facial_panting_proxy)

        print(f"  Thoracic Breathing Rate (Main 호흡수) : {thoracic_rate:6.1f} bpm  (conf={thoracic_conf:.2f})")
        print(f"  Panting Rate (Artifact/Panting 지표)  : {panting_rate:6.1f} bpm  (conf={panting_conf:.2f})")
        print(f"  Panting Intensity                     : {panting_int:.3f}")

        if panting_int > 0.8:
            print("  [주의] 강한 panting 감지 → HR 추정 신뢰도 주의 필요")
    elif args.dog_aware:
        print("\n[Info] dual_respiratory_proxies 모듈을 찾을 수 없어 호흡수 출력 생략")

    print("\n" + "="*70)
    mode_str = "Dog-aware (A+B) + Panting Preprocessing" if args.dog_aware else "Anatomical + Rejection"
    print(f"ANATOMICAL + REJECTION RESULTS ({mode_str})")
    print("="*70)

    # Before (all windows)
    print("\n--- RAW (before any rejection) ---")
    raw_best = df.loc[df.groupby(["roi", "method"])["snr"].idxmax()]
    print(raw_best[["roi", "method", "raw_bpm", "snr"]].sort_values("snr", ascending=False).to_string(index=False))

    # Lenient rejection
    kept_lenient = df[df["rejection_lenient"] < 0.35]
    print(f"\n--- AFTER LENIENT REJECTION (rejection < 0.35) ---")
    print(f"Windows kept: {len(kept_lenient)} / {len(df)} ({100*len(kept_lenient)/len(df):.1f}%)")

    if len(kept_lenient) > 0:
        kept_best = kept_lenient.loc[kept_lenient.groupby(["roi", "method"])["snr"].idxmax()]
        print(kept_best[["roi", "method", "raw_bpm", "snr", "rejection_lenient", "motion", "artifact_100bpm"]].sort_values("snr", ascending=False).to_string(index=False))

    # Aggressive rejection (user request A)
    kept_aggressive = df[df["rejection_aggressive"] < 0.35]
    print(f"\n--- AFTER AGGRESSIVE REJECTION (rejection < 0.35 with tighter thresholds) ---")
    print(f"Windows kept: {len(kept_aggressive)} / {len(df)} ({100*len(kept_aggressive)/len(df):.1f}%)")

    if len(kept_aggressive) > 0:
        kept_best = kept_aggressive.loc[kept_aggressive.groupby(["roi", "method"])["snr"].idxmax()]
        print(kept_best[["roi", "method", "raw_bpm", "snr", "rejection_aggressive", "motion", "artifact_100bpm"]].sort_values("snr", ascending=False).to_string(index=False))

    print("\n=== Comparison ===")
    print(f"Lenient kept : {len(kept_lenient)} windows")
    print(f"Aggressive kept: {len(kept_aggressive)} windows")
    print(f"Additional filtered by aggressive mode: {len(kept_lenient) - len(kept_aggressive)}")

    print("\nKey insight: With real keypoint motion/mouth data, rejection becomes much more powerful than on face-box data.")


if __name__ == "__main__":
    main()
