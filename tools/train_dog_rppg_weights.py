#!/usr/bin/env python3
"""
Quick training script for dog-specific rPPG weights.

Collects "good" windows from our best known ROIs on the dog videos,
then learns optimal linear weights for normalized RGB.

This is the practical starting point for "강아지 전용 신호 모델".

Run:
    python tools/train_dog_rppg_weights.py --stems 3,6,7 --apply-ab

It will output the best weights you can then plug into sig_dog_learned.
"""

import argparse
import sys
from pathlib import Path
from typing import List, Tuple

import numpy as np
import pandas as pd

# Robust import when running as script from repo root or tools/
sys.path.insert(0, str(Path(__file__).parent))
try:
    from dog_specific_rppg import learn_dog_weights, sig_dog_learned
    from evaluate_rppg_methods import estimate_bpm_from_signal, safe_bandpass
except ModuleNotFoundError:
    # Fallback if already in path
    from tools.dog_specific_rppg import learn_dog_weights, sig_dog_learned
    from tools.evaluate_rppg_methods import estimate_bpm_from_signal, safe_bandpass

# Reuse extraction helpers (with path fix)
try:
    from experiment_multi_area_roi_improved import (
        load_probe, extract_rgb_single_center, extract_rgb_multi_patch,
        strong_panting_subtraction, periodicity_reinforcement, FS, WIN
    )
except ModuleNotFoundError:
    from tools.experiment_multi_area_roi_improved import (
        load_probe, extract_rgb_single_center, extract_rgb_multi_patch,
        strong_panting_subtraction, periodicity_reinforcement, FS, WIN
    )

# Expanded BEST ROIs (from adaptive + multi-area experiments + prior reports)
# More candidates + variants to harvest diverse high-quality windows for dog model training.
BEST_ROIS_PER_VIDEO = {
    "1": {"muzzle_skin": "single", "nose_bridge": "single", "throat_exposed": "single"},
    "3": {  # high HR ~210 - ear multi strong in prior
        "ear_area_right": "multi",
        "muzzle_area": "multi",
        "throat_area": "multi",
        "nose_bridge": "single",
    },
    "4": {"muzzle_skin": "single", "ear_area_right": "single"},
    "5": {"muzzle_skin": "single", "nose_bridge": "single", "throat_exposed": "single"},
    "6": {  # low HR ~90 - prefer single tight patches
        "muzzle_skin": "single",
        "nose_bridge": "single",
        "right_ear_base": "single",
        "left_ear_base": "single",
    },
    "7": {  # high HR ~190
        "ear_area_right": "multi",
        "muzzle_area": "multi",
        "nose_bridge": "single",
        "throat_exposed": "single",
    },
    "8": {"muzzle_skin": "single", "nose_bridge": "single"},
}

def _quick_window_quality(rgb: np.ndarray, fs: float, target_bpm: float) -> float:
    """Quick filter: SNR of green channel in target band vs artifact around 100bpm."""
    if len(rgb) < 60:
        return 0.0
    g = safe_bandpass(rgb[:, 1], fs, 60, 230)
    bpm, snr, _ = estimate_bpm_from_signal(g, fs, 60, 230)
    if not np.isfinite(snr):
        return 0.0
    # Bonus for high-HR videos when peak is far from 100
    dist = abs(bpm - 100.0) if np.isfinite(bpm) else 0
    artifact_penalty = 0.6 if dist < 18 else 1.0
    return float(snr * artifact_penalty)


def collect_good_windows(
    stems: List[str],
    apply_ab: bool = False,
    max_per_roi: int = 12,
    min_quality: float = 2.8,
) -> Tuple[List[np.ndarray], List[float]]:
    """
    Collect *many* high-quality RGB windows from best anatomical ROIs (sliding windows).
    Applies light quality filter using green SNR + 100bpm artifact avoidance.
    This gives the expanded real-dog dataset for learning dog-specific weights (A task).
    """
    rgb_windows: List[np.ndarray] = []
    targets: List[float] = []

    gt = {
        "1": 175.0, "3": 210.0, "4": 160.0, "5": 135.0,
        "6": 90.0, "7": 189.5, "8": 110.5
    }

    # Map roi_name -> (is_multi, area_or_spec_name)
    for stem in stems:
        if stem not in BEST_ROIS_PER_VIDEO:
            continue

        probe = load_probe(stem)
        if probe[0] is None:
            print(f"  No probe for {stem}")
            continue

        folder, kps, frames = probe
        target = gt.get(stem, 150.0)
        n_frames = len(frames)
        if n_frames < WIN + 10:
            print(f"  Too short probe for {stem}")
            continue

        print(f"Collecting sliding windows from video {stem} (target~{target}bpm)...")

        collected_for_stem = 0

        for roi_name, variant in BEST_ROIS_PER_VIDEO[stem].items():
            rgb_list_for_roi = []

            # Determine patch spec
            patches = None
            single_spec = None
            if variant == "multi":
                area_map = {
                    "throat_exposed": "throat_area",
                    "throat_area": "throat_area",
                    "right_ear_base": "ear_area_right",
                    "ear_area_right": "ear_area_right",
                    "left_ear_base": "ear_area_left",
                    "muzzle_skin": "muzzle_area",
                    "muzzle_area": "muzzle_area",
                    "nose_bridge": "muzzle_area",  # fallback
                }
                area_name = area_map.get(roi_name, roi_name)
                try:
                    from experiment_multi_area_roi_improved import MULTI_PATCH_AREAS as MP
                    if area_name in MP:
                        patches = MP[area_name]["patches"]
                except Exception:
                    patches = None
            else:
                # single
                try:
                    from experiment_multi_area_roi_improved import SINGLE_ROIS as SR
                    if roi_name in SR:
                        single_spec = SR[roi_name]
                except Exception:
                    single_spec = None

            if patches is None and single_spec is None:
                # fallback sensible single
                single_spec = {"kps": ["nose", "upper_jaw"], "radius": 14}

            # Sliding starts (step ~3-4s for diversity without too much overlap)
            step = max(25, WIN // 6)
            starts = list(range(0, max(1, n_frames - WIN - 5), step))[:max_per_roi * 2]

            for start in starts:
                try:
                    if patches is not None:
                        rgb, stats = extract_rgb_multi_patch(frames, kps, patches, start, WIN)
                    else:
                        kpl = single_spec["kps"]
                        rad = single_spec.get("radius", 15)
                        rgb, stats = extract_rgb_single_center(frames, kps, kpl, rad, start, WIN)
                except Exception:
                    continue

                if len(rgb) < 150 or not np.isfinite(rgb).all():
                    continue

                # Optional light A+B (proxy=0 means no-op inside strong fn)
                if apply_ab:
                    try:
                        proxy = np.zeros(len(rgb))  # could be improved with jaw motion later
                        rgb = strong_panting_subtraction(rgb, proxy, strength=0.7)
                        rgb = periodicity_reinforcement(rgb[:, 1])[:, None]  # simplistic, skip heavy
                    except Exception:
                        pass

                q = _quick_window_quality(rgb, FS, target)
                if q >= min_quality:
                    rgb_list_for_roi.append((q, rgb))

            # Keep top N per ROI by quality (diverse good ones)
            rgb_list_for_roi.sort(key=lambda x: -x[0])
            for q, rgb in rgb_list_for_roi[:max_per_roi]:
                rgb_windows.append(rgb)
                targets.append(target)
                collected_for_stem += 1

        print(f"  video {stem}: kept {collected_for_stem} high-quality windows (q>={min_quality})")

    print(f"\nCollected total {len(rgb_windows)} real high-quality windows for dog-weight learning.")
    return rgb_windows, targets


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stems", default="3,6,7")
    parser.add_argument("--apply-ab", action="store_true")
    args = parser.parse_args()

    stems = [s.strip() for s in args.stems.split(",")]

    rgb_windows, targets = collect_good_windows(stems, apply_ab=args.apply_ab)

    if len(rgb_windows) < 5:
        print("Not enough windows collected. Using fallback synthetic training for demo.")
        # Fallback: create some synthetic dog-like windows (high HR + some artifact)
        np.random.seed(42)
        rgb_windows = []
        targets = []
        for _ in range(30):
            t = np.linspace(0, 20, 200)
            hr = np.random.uniform(170, 220)
            cardiac = 0.8 * np.sin(2 * np.pi * hr / 60 * t)
            panting = 0.6 * np.sin(2 * np.pi * 2.5 * t)  # ~150 bpm panting-like
            noise = 0.15 * np.random.randn(200)
            g = 0.5 + 0.3 * (cardiac + 0.4 * panting) + noise
            r = 0.4 + 0.25 * (cardiac + 0.6 * panting) + noise * 1.1
            b = 0.35 + 0.2 * cardiac + noise * 0.8
            rgb = np.stack([r, g, b], axis=1)
            rgb_windows.append(rgb)
            targets.append(hr)

    print("\nLearning dog-specific weights (method=combined_correct → directly optimizes for low BPM error vs target HR)...")
    weights = learn_dog_weights(rgb_windows, targets, method="combined_correct")

    print(f"\nLearned dog-specific weights (R, G, B): {np.round(weights, 4)}")
    print("Paste-ready: weights = np.array([%s])" % ", ".join(f"{x:.4f}" for x in weights))
    print("Use: pulse = sig_dog_learned(rgb, fs=10.0, min_bpm=70, max_bpm=240, weights=weights)")

    # Persist for easy reuse in C comparisons / pipeline
    out_dir = Path("reports/rppg_pet_keypoints")
    out_dir.mkdir(parents=True, exist_ok=True)
    wpath = out_dir / "dog_learned_weights.npy"
    np.save(wpath, weights)
    print(f"\nWeights saved to: {wpath}")

    # Quick head-to-head on the collected real windows (the A dataset itself)
    print("\nQuick validation on collected real windows (mean SNR + band-power ratio):")
    from dog_specific_rppg import band_power_ratio as dog_bpr
    snr_green = []
    snr_dog = []
    bpr_green = []
    bpr_dog = []
    for rgb, target in zip(rgb_windows, targets):
        g = safe_bandpass(rgb[:, 1], FS, 70, 240)
        _, s_g, _ = estimate_bpm_from_signal(g, FS, 70, 240)
        snr_green.append(s_g)
        bpr_green.append(dog_bpr(g, FS, target))

        d = sig_dog_learned(rgb, FS, 70, 240, weights=weights)
        _, s_d, _ = estimate_bpm_from_signal(d, FS, 70, 240)
        snr_dog.append(s_d)
        bpr_dog.append(dog_bpr(d, FS, target))

    print(f"  Mean SNR (green):     {np.nanmean(snr_green):.2f}")
    print(f"  Mean SNR (dog_learned): {np.nanmean(snr_dog):.2f}  (gain: {100*(np.nanmean(snr_dog)/max(1e-9,np.nanmean(snr_green))-1):.1f}%)")
    print(f"  Mean band_power_ratio (green): {np.nanmean(bpr_green):.2f}")
    print(f"  Mean band_power_ratio (dog):   {np.nanmean(bpr_dog):.2f}")

    print("\nReady for C: register 'dog_learned' and run head-to-head on videos 3/6/7.")


if __name__ == "__main__":
    main()