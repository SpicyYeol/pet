from __future__ import annotations

import argparse
import csv
import json
import math
import os
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

import cv2
import numpy as np
import pandas as pd
from scipy import signal
from sklearn.decomposition import FastICA, PCA
from sklearn.exceptions import ConvergenceWarning

# Dog-specific learned rPPG (A+C highest-leverage addition)
_dog_weights = np.array([0.2116, -0.8323, 0.5124])
try:
    from dog_specific_rppg import sig_dog_learned, get_default_dog_weights, make_sig_dog_learned
    _dog_weights = get_default_dog_weights()
except Exception:
    try:
        from tools.dog_specific_rppg import sig_dog_learned, get_default_dog_weights, make_sig_dog_learned
        _dog_weights = get_default_dog_weights()
    except Exception:
        sig_dog_learned = None
        make_sig_dog_learned = None


ROI_MODES = ("face_full", "upper_face", "mid_face", "lower_face")
METHODS = ("green", "g_minus_r", "chrom", "pos", "pca", "ica", "dog_learned")


@dataclass
class BoxState:
    xyxy: np.ndarray | None = None
    conf: float = 0.0
    age: int = 9999


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Evaluate classical rPPG methods against OCR-reviewed BPM labels."
    )
    parser.add_argument("--labels-csv", type=Path, default=Path("dataset_front/video_labels_ocr.csv"))
    parser.add_argument("--model", type=Path, default=Path("DogFaceModel_Deploy/best.pt"))
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_eval"))
    parser.add_argument("--sample-fps", type=float, default=15.0)
    parser.add_argument("--detect-every", type=int, default=8)
    parser.add_argument("--conf", type=float, default=0.25)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="0", help="YOLO device (0=first GPU, cpu, cuda, etc.)")
    parser.add_argument("--window-sec", type=float, default=20.0)
    parser.add_argument("--step-sec", type=float, default=5.0)
    parser.add_argument("--min-bpm", type=float, default=50.0)
    parser.add_argument("--max-bpm", type=float, default=240.0)
    parser.add_argument("--max-box-age", type=int, default=30)
    parser.add_argument("--no-cache", action="store_true")
    return parser.parse_args()


def natural_sort_key(path: str | Path) -> tuple[int, str]:
    p = Path(path)
    digits = "".join(ch for ch in p.stem if ch.isdigit())
    return (int(digits) if digits else 10**9, p.name)


def clamp_box(box: np.ndarray, width: int, height: int) -> np.ndarray:
    x1, y1, x2, y2 = box.astype(float)
    x1 = max(0.0, min(width - 1.0, x1))
    x2 = max(0.0, min(width - 1.0, x2))
    y1 = max(0.0, min(height - 1.0, y1))
    y2 = max(0.0, min(height - 1.0, y2))
    if x2 <= x1:
        x2 = min(width - 1.0, x1 + 1.0)
    if y2 <= y1:
        y2 = min(height - 1.0, y1 + 1.0)
    return np.array([x1, y1, x2, y2], dtype=float)


def expand_box(box: np.ndarray, width: int, height: int, scale: float = 1.04) -> np.ndarray:
    x1, y1, x2, y2 = box.astype(float)
    cx = (x1 + x2) / 2.0
    cy = (y1 + y2) / 2.0
    bw = (x2 - x1) * scale
    bh = (y2 - y1) * scale
    return clamp_box(np.array([cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2]), width, height)


def smooth_box(previous: np.ndarray | None, current: np.ndarray, alpha: float = 0.25) -> np.ndarray:
    if previous is None:
        return current.astype(float)
    return previous * (1.0 - alpha) + current.astype(float) * alpha


def select_best_box(result: Any) -> tuple[np.ndarray | None, float]:
    if result.boxes is None or len(result.boxes) == 0:
        return None, 0.0
    boxes = result.boxes.xyxy.detach().cpu().numpy()
    confs = result.boxes.conf.detach().cpu().numpy()
    areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
    score = confs * np.sqrt(np.maximum(areas, 1.0))
    idx = int(np.argmax(score))
    return boxes[idx].astype(float), float(confs[idx])


def roi_from_box(frame: np.ndarray, box: np.ndarray, mode: str) -> np.ndarray:
    height, width = frame.shape[:2]
    box = clamp_box(box, width, height)
    x1, y1, x2, y2 = box
    bw = x2 - x1
    bh = y2 - y1
    rel = {
        "face_full": (0.12, 0.12, 0.88, 0.88),
        "upper_face": (0.22, 0.08, 0.78, 0.42),
        "mid_face": (0.18, 0.28, 0.82, 0.68),
        "lower_face": (0.20, 0.55, 0.80, 0.94),
    }[mode]
    rx1, ry1, rx2, ry2 = rel
    crop_box = np.array([x1 + bw * rx1, y1 + bh * ry1, x1 + bw * rx2, y1 + bh * ry2])
    crop_box = clamp_box(crop_box, width, height).round().astype(int)
    cx1, cy1, cx2, cy2 = crop_box
    return frame[cy1:cy2, cx1:cx2]


def robust_rgb(crop: np.ndarray) -> tuple[np.ndarray, float]:
    if crop.size == 0:
        return np.full(3, np.nan), 0.0
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    valid = (hsv[:, :, 2] > 20) & (hsv[:, :, 2] < 245)
    if valid.mean() < 0.15:
        valid = np.ones(valid.shape, dtype=bool)
    pixels = crop[valid]
    if pixels.size == 0:
        return np.full(3, np.nan), 0.0
    rgb = pixels[:, ::-1].astype(float)
    lo, hi = np.percentile(rgb, [10, 90], axis=0)
    keep = np.all((rgb >= lo) & (rgb <= hi), axis=1)
    if keep.sum() >= 20:
        rgb = rgb[keep]
    return rgb.mean(axis=0), float(valid.mean())


def extract_signals(
    video_path: Path,
    model: Any,
    args: argparse.Namespace,
    cache_path: Path,
) -> dict[str, Any]:
    if cache_path.exists() and not args.no_cache:
        data = np.load(cache_path, allow_pickle=True)
        return {key: data[key] for key in data.files}

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")
    source_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_step = max(1, int(round(source_fps / args.sample_fps)))
    effective_fps = source_fps / frame_step

    times: list[float] = []
    box_rows: list[list[float]] = []
    rgb_by_roi: dict[str, list[list[float]]] = {mode: [] for mode in ROI_MODES}
    valid_by_roi: dict[str, list[float]] = {mode: [] for mode in ROI_MODES}
    state = BoxState()
    sample_index = 0
    frame_index = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_index % frame_step != 0:
            frame_index += 1
            continue

        height, width = frame.shape[:2]
        should_detect = state.xyxy is None or state.age >= args.detect_every
        detected_box = None
        detected_conf = 0.0
        if should_detect:
            result = model.predict(
                frame,
                conf=args.conf,
                imgsz=args.imgsz,
                device=args.device,
                verbose=False,
            )[0]
            detected_box, detected_conf = select_best_box(result)
            if detected_box is not None:
                detected_box = expand_box(detected_box, width, height)
                state.xyxy = smooth_box(state.xyxy, detected_box)
                state.conf = detected_conf
                state.age = 0
            else:
                state.age += 1
        else:
            state.age += 1

        usable_box = state.xyxy if state.xyxy is not None and state.age <= args.max_box_age else None
        times.append(frame_index / source_fps)
        if usable_box is None:
            box_rows.append([np.nan, np.nan, np.nan, np.nan, 0.0, float(state.age)])
            for mode in ROI_MODES:
                rgb_by_roi[mode].append([np.nan, np.nan, np.nan])
                valid_by_roi[mode].append(0.0)
        else:
            box_rows.append([*usable_box.tolist(), state.conf, float(state.age)])
            for mode in ROI_MODES:
                crop = roi_from_box(frame, usable_box, mode)
                rgb, valid_fraction = robust_rgb(crop)
                rgb_by_roi[mode].append(rgb.tolist())
                valid_by_roi[mode].append(valid_fraction)

        sample_index += 1
        frame_index += 1

    cap.release()

    payload: dict[str, Any] = {
        "times": np.array(times, dtype=float),
        "boxes": np.array(box_rows, dtype=float),
        "source_fps": np.array([source_fps], dtype=float),
        "effective_fps": np.array([effective_fps], dtype=float),
        "frame_count": np.array([frame_count], dtype=int),
    }
    for mode in ROI_MODES:
        payload[f"rgb_{mode}"] = np.array(rgb_by_roi[mode], dtype=float)
        payload[f"valid_{mode}"] = np.array(valid_by_roi[mode], dtype=float)

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(cache_path, **payload)
    return payload


def interpolate_rgb(times: np.ndarray, rgb: np.ndarray, fs: float) -> tuple[np.ndarray, np.ndarray]:
    good = np.isfinite(rgb).all(axis=1)
    if good.sum() < max(20, int(fs * 5)):
        return np.array([]), np.empty((0, 3))
    t0 = float(times[good][0])
    t1 = float(times[good][-1])
    uniform_t = np.arange(t0, t1, 1.0 / fs)
    out = np.empty((len(uniform_t), 3), dtype=float)
    for channel in range(3):
        out[:, channel] = np.interp(uniform_t, times[good], rgb[good, channel])
    return uniform_t, out


def safe_bandpass(x: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    x = np.asarray(x, dtype=float)
    if len(x) < 12:
        return x - np.nanmean(x)
    x = signal.detrend(x, type="linear")
    lo = min_bpm / 60.0
    hi = min(max_bpm / 60.0, fs * 0.45)
    if lo >= hi:
        return x - np.mean(x)
    sos = signal.butter(3, [lo, hi], btype="bandpass", fs=fs, output="sos")
    try:
        return signal.sosfiltfilt(sos, x)
    except ValueError:
        return signal.sosfilt(sos, x)


def normalize_rgb(rgb: np.ndarray) -> np.ndarray:
    mean = np.nanmean(rgb, axis=0)
    mean[mean == 0] = 1.0
    return rgb / mean - 1.0


def sig_green(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    return safe_bandpass(rgb[:, 1], fs, min_bpm, max_bpm)


def sig_g_minus_r(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    norm = normalize_rgb(rgb)
    return safe_bandpass(norm[:, 1] - norm[:, 0], fs, min_bpm, max_bpm)


def sig_chrom(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    norm = normalize_rgb(rgb)
    x = 3.0 * norm[:, 0] - 2.0 * norm[:, 1]
    y = 1.5 * norm[:, 0] + norm[:, 1] - 1.5 * norm[:, 2]
    alpha = np.std(x) / (np.std(y) + 1e-9)
    return safe_bandpass(x - alpha * y, fs, min_bpm, max_bpm)


def sig_pos(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    norm = normalize_rgb(rgb)
    h1 = norm[:, 1] - norm[:, 2]
    h2 = -2.0 * norm[:, 0] + norm[:, 1] + norm[:, 2]
    alpha = np.std(h1) / (np.std(h2) + 1e-9)
    return safe_bandpass(h1 + alpha * h2, fs, min_bpm, max_bpm)


def component_with_best_peak(components: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> tuple[np.ndarray, float, float]:
    best_signal = components[:, 0]
    best_bpm = np.nan
    best_snr = -np.inf
    for idx in range(components.shape[1]):
        s = safe_bandpass(components[:, idx], fs, min_bpm, max_bpm)
        bpm, snr, _ = estimate_bpm_from_signal(s, fs, min_bpm, max_bpm)
        if np.isfinite(snr) and snr > best_snr:
            best_signal = s
            best_bpm = bpm
            best_snr = snr
    return best_signal, best_bpm, best_snr


def sig_pca(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    norm = normalize_rgb(rgb)
    comps = PCA(n_components=3).fit_transform(norm)
    return component_with_best_peak(comps, fs, min_bpm, max_bpm)[0]


def sig_ica(rgb: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> np.ndarray:
    norm = normalize_rgb(rgb)
    try:
        comps = FastICA(n_components=3, whiten="unit-variance", random_state=7, max_iter=700, tol=0.001).fit_transform(norm)
    except Exception:
        comps = PCA(n_components=3).fit_transform(norm)
    return component_with_best_peak(comps, fs, min_bpm, max_bpm)[0]


METHOD_FUNCTIONS: dict[str, Callable[[np.ndarray, float, float, float], np.ndarray]] = {
    "green": sig_green,
    "g_minus_r": sig_g_minus_r,
    "chrom": sig_chrom,
    "pos": sig_pos,
    "pca": sig_pca,
    "ica": sig_ica,
    "dog_learned": (make_sig_dog_learned(_dog_weights) if make_sig_dog_learned
                    else (lambda rgb, fs, lo, hi: sig_dog_learned(rgb, fs, lo, hi, weights=_dog_weights) if sig_dog_learned else (rgb[:,1] if rgb.ndim>1 else rgb))),
}


def estimate_bpm_from_signal(
    x: np.ndarray,
    fs: float,
    min_bpm: float,
    max_bpm: float,
) -> tuple[float, float, float]:
    x = np.asarray(x, dtype=float)
    if len(x) < 16 or not np.isfinite(x).all() or np.std(x) < 1e-12:
        return np.nan, np.nan, np.nan
    x = x - np.mean(x)
    nfft = int(2 ** math.ceil(math.log2(max(len(x), 64))) * 4)
    freqs, power = signal.periodogram(x, fs=fs, window="hann", nfft=nfft, detrend=False)
    lo = min_bpm / 60.0
    hi = min(max_bpm / 60.0, fs * 0.45)
    mask = (freqs >= lo) & (freqs <= hi)
    if mask.sum() < 3:
        return np.nan, np.nan, np.nan
    band_freqs = freqs[mask]
    band_power = power[mask]
    idx = int(np.argmax(band_power))
    peak_freq = float(band_freqs[idx])
    peak_power = float(band_power[idx])
    noise = float(np.median(band_power) + 1e-12)
    snr = peak_power / noise
    total_ratio = peak_power / (float(np.sum(band_power)) + 1e-12)
    return peak_freq * 60.0, snr, total_ratio


def weighted_median(values: np.ndarray, weights: np.ndarray) -> float:
    values = np.asarray(values, dtype=float)
    weights = np.asarray(weights, dtype=float)
    good = np.isfinite(values) & np.isfinite(weights) & (weights > 0)
    if good.sum() == 0:
        return np.nan
    values = values[good]
    weights = weights[good]
    order = np.argsort(values)
    values = values[order]
    weights = weights[order]
    cumsum = np.cumsum(weights)
    cutoff = weights.sum() / 2.0
    return float(values[np.searchsorted(cumsum, cutoff)])


def evaluate_rgb(
    video_name: str,
    label: dict[str, Any],
    times: np.ndarray,
    rgb: np.ndarray,
    roi: str,
    args: argparse.Namespace,
) -> list[dict[str, Any]]:
    uniform_t, uniform_rgb = interpolate_rgb(times, rgb, args.sample_fps)
    rows: list[dict[str, Any]] = []
    if len(uniform_t) == 0:
        return rows

    win = int(round(args.window_sec * args.sample_fps))
    step = int(round(args.step_sec * args.sample_fps))
    if len(uniform_t) < win:
        return rows

    for method in METHODS:
        window_bpms: list[float] = []
        window_snrs: list[float] = []
        window_ratios: list[float] = []
        for start in range(0, len(uniform_t) - win + 1, step):
            rgb_win = uniform_rgb[start : start + win]
            if not np.isfinite(rgb_win).all() or np.min(np.mean(rgb_win, axis=0)) <= 1:
                continue
            try:
                pulse = METHOD_FUNCTIONS[method](rgb_win, args.sample_fps, args.min_bpm, args.max_bpm)
                bpm, snr, total_ratio = estimate_bpm_from_signal(
                    pulse,
                    args.sample_fps,
                    args.min_bpm,
                    args.max_bpm,
                )
            except Exception:
                bpm, snr, total_ratio = np.nan, np.nan, np.nan
            if np.isfinite(bpm):
                window_bpms.append(float(bpm))
                window_snrs.append(float(snr))
                window_ratios.append(float(total_ratio))

        if window_bpms:
            bpm_arr = np.array(window_bpms, dtype=float)
            snr_arr = np.array(window_snrs, dtype=float)
            ratio_arr = np.array(window_ratios, dtype=float)
            weights = np.clip(np.log1p(snr_arr), 0.05, None)
            pred = weighted_median(bpm_arr, weights)
            pred_mean = float(np.average(bpm_arr, weights=weights))
            snr_median = float(np.nanmedian(snr_arr))
            ratio_median = float(np.nanmedian(ratio_arr))
        else:
            pred = np.nan
            pred_mean = np.nan
            snr_median = np.nan
            ratio_median = np.nan

        target = float(label["bpm_target"])
        bpm_min = float(label["bpm_min"])
        bpm_max = float(label["bpm_max"])
        target_error = abs(pred - target) if np.isfinite(pred) else np.nan
        if not np.isfinite(pred):
            range_error = np.nan
            within_range = False
        elif pred < bpm_min:
            range_error = bpm_min - pred
            within_range = False
        elif pred > bpm_max:
            range_error = pred - bpm_max
            within_range = False
        else:
            range_error = 0.0
            within_range = True

        rows.append(
            {
                "video": video_name,
                "method": method,
                "roi": roi,
                "pred_bpm": round(float(pred), 3) if np.isfinite(pred) else "",
                "pred_bpm_weighted_mean": round(float(pred_mean), 3) if np.isfinite(pred_mean) else "",
                "bpm_target": target,
                "bpm_min": bpm_min,
                "bpm_max": bpm_max,
                "target_abs_error": round(float(target_error), 3) if np.isfinite(target_error) else "",
                "range_error": round(float(range_error), 3) if np.isfinite(range_error) else "",
                "within_range": bool(within_range),
                "window_count": len(window_bpms),
                "median_snr": round(snr_median, 3) if np.isfinite(snr_median) else "",
                "median_peak_power_ratio": round(ratio_median, 5) if np.isfinite(ratio_median) else "",
            }
        )
    return rows


def label_band_diagnostics(
    video_name: str,
    label: dict[str, Any],
    times: np.ndarray,
    rgb: np.ndarray,
    roi: str,
    args: argparse.Namespace,
) -> list[dict[str, Any]]:
    uniform_t, uniform_rgb = interpolate_rgb(times, rgb, args.sample_fps)
    if len(uniform_t) == 0:
        return []

    rows: list[dict[str, Any]] = []
    target = float(label["bpm_target"])
    bpm_min = float(label["bpm_min"])
    bpm_max = float(label["bpm_max"])
    label_margin = max(3.0, 0.03 * target) if bpm_min == bpm_max else 0.0
    label_low = bpm_min - label_margin
    label_high = bpm_max + label_margin

    for method in METHODS:
        try:
            pulse = METHOD_FUNCTIONS[method](
                uniform_rgb,
                args.sample_fps,
                args.min_bpm,
                args.max_bpm,
            )
        except Exception:
            continue
        if len(pulse) < 16 or np.std(pulse) < 1e-12:
            continue
        nfft = int(2 ** math.ceil(math.log2(max(len(pulse), 64))) * 8)
        freqs, power = signal.periodogram(
            pulse - np.mean(pulse),
            fs=args.sample_fps,
            window="hann",
            nfft=nfft,
            detrend=False,
        )
        band = (freqs >= args.min_bpm / 60.0) & (freqs <= min(args.max_bpm / 60.0, args.sample_fps * 0.45))
        if band.sum() < 3:
            continue
        bpm_axis = freqs[band] * 60.0
        band_power = power[band]
        local = np.zeros_like(band_power, dtype=bool)
        if len(local) > 2:
            local[1:-1] = (band_power[1:-1] > band_power[:-2]) & (band_power[1:-1] > band_power[2:])
        label_mask = (bpm_axis >= label_low) & (bpm_axis <= label_high)
        candidates = label_mask & local
        if not candidates.any():
            candidates = label_mask
        if not candidates.any():
            continue
        candidate_indices = np.where(candidates)[0]
        best_idx = int(candidate_indices[np.argmax(band_power[candidate_indices])])
        label_peak_bpm = float(bpm_axis[best_idx])
        label_peak_power = float(band_power[best_idx])
        median_noise = float(np.median(band_power) + 1e-12)
        peak_rank = 1 + int(np.sum(band_power > label_peak_power))
        rows.append(
            {
                "video": video_name,
                "method": method,
                "roi": roi,
                "label_peak_bpm": round(label_peak_bpm, 3),
                "bpm_target": target,
                "bpm_min": bpm_min,
                "bpm_max": bpm_max,
                "label_abs_error": round(abs(label_peak_bpm - target), 3),
                "label_peak_snr": round(label_peak_power / median_noise, 3),
                "label_peak_rank": peak_rank,
            }
        )
    return rows


def summarize(results: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    grouped = results.copy()
    grouped["target_abs_error"] = pd.to_numeric(grouped["target_abs_error"], errors="coerce")
    grouped["range_error"] = pd.to_numeric(grouped["range_error"], errors="coerce")
    grouped["pred_bpm"] = pd.to_numeric(grouped["pred_bpm"], errors="coerce")
    grouped["median_snr"] = pd.to_numeric(grouped["median_snr"], errors="coerce")

    for (method, roi), group in grouped.groupby(["method", "roi"]):
        err = group["target_abs_error"].dropna().to_numpy()
        rng = group["range_error"].dropna().to_numpy()
        rows.append(
            {
                "method": method,
                "roi": roi,
                "n": int(group["pred_bpm"].notna().sum()),
                "target_mae": round(float(np.mean(err)), 3) if len(err) else np.nan,
                "target_rmse": round(float(np.sqrt(np.mean(err**2))), 3) if len(err) else np.nan,
                "range_mae": round(float(np.mean(rng)), 3) if len(rng) else np.nan,
                "within_range_pct": round(float(group["within_range"].mean() * 100.0), 2),
                "median_snr": round(float(group["median_snr"].median()), 3),
                "median_window_count": round(float(group["window_count"].median()), 1),
            }
        )

    summary = pd.DataFrame(rows)
    return summary.sort_values(
        ["range_mae", "target_mae", "within_range_pct", "median_snr"],
        ascending=[True, True, False, False],
    ).reset_index(drop=True)


def summarize_label_band(results: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    if results.empty:
        return pd.DataFrame()
    frame = results.copy()
    frame["label_abs_error"] = pd.to_numeric(frame["label_abs_error"], errors="coerce")
    frame["label_peak_snr"] = pd.to_numeric(frame["label_peak_snr"], errors="coerce")
    frame["label_peak_rank"] = pd.to_numeric(frame["label_peak_rank"], errors="coerce")
    for (method, roi), group in frame.groupby(["method", "roi"]):
        rows.append(
            {
                "method": method,
                "roi": roi,
                "n": int(len(group)),
                "label_peak_mae": round(float(group["label_abs_error"].mean()), 3),
                "median_label_peak_snr": round(float(group["label_peak_snr"].median()), 3),
                "median_label_peak_rank": round(float(group["label_peak_rank"].median()), 1),
                "top100_rank_pct": round(float((group["label_peak_rank"] <= 100).mean() * 100.0), 2),
            }
        )
    return pd.DataFrame(rows).sort_values(
        ["label_peak_mae", "median_label_peak_snr", "median_label_peak_rank"],
        ascending=[True, False, True],
    ).reset_index(drop=True)


def summarize_by_method(summary: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for method, group in summary.groupby("method"):
        best = group.sort_values(["range_mae", "target_mae", "within_range_pct"], ascending=[True, True, False]).iloc[0]
        rows.append(
            {
                "method": method,
                "best_roi": best["roi"],
                "range_mae": best["range_mae"],
                "target_mae": best["target_mae"],
                "within_range_pct": best["within_range_pct"],
                "median_snr": best["median_snr"],
            }
        )
    return pd.DataFrame(rows).sort_values(
        ["range_mae", "target_mae", "within_range_pct"],
        ascending=[True, True, False],
    ).reset_index(drop=True)


def write_csv(rows: list[dict[str, Any]], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        return
    with out_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_report(
    labels: pd.DataFrame,
    summary: pd.DataFrame,
    method_summary: pd.DataFrame,
    label_band_summary: pd.DataFrame,
    results: pd.DataFrame,
    out_path: Path,
    args: argparse.Namespace,
) -> None:
    best = summary.iloc[0]
    best_rows = results[(results["method"] == best["method"]) & (results["roi"] == best["roi"])].copy()
    best_rows = best_rows[
        [
            "video",
            "pred_bpm",
            "bpm_min",
            "bpm_max",
            "bpm_target",
            "target_abs_error",
            "range_error",
            "within_range",
            "median_snr",
        ]
    ]
    def markdown_table(df: pd.DataFrame) -> str:
        if df.empty:
            return ""
        text_df = df.copy()
        text_df = text_df.fillna("")
        columns = list(text_df.columns)
        rows = [["" if pd.isna(value) else str(value) for value in row] for row in text_df.to_numpy()]
        widths = [
            max(len(str(col)), *(len(row[idx]) for row in rows)) if rows else len(str(col))
            for idx, col in enumerate(columns)
        ]
        header = "| " + " | ".join(str(col).ljust(widths[idx]) for idx, col in enumerate(columns)) + " |"
        divider = "| " + " | ".join("-" * widths[idx] for idx in range(len(columns))) + " |"
        body = [
            "| " + " | ".join(row[idx].ljust(widths[idx]) for idx in range(len(columns))) + " |"
            for row in rows
        ]
        return "\n".join([header, divider, *body])

    lines = [
        "# rPPG Method Evaluation",
        "",
        "## Setup",
        "",
        f"- Labels: `{args.labels_csv.as_posix()}`",
        f"- Usable labeled videos: {len(labels)}",
        f"- Sample FPS: {args.sample_fps}",
        f"- Window / step: {args.window_sec}s / {args.step_sec}s",
        f"- BPM search band: {args.min_bpm}-{args.max_bpm}",
        f"- Face ROI: YOLO dog-face detector `{args.model.as_posix()}`",
        "",
        "## Winner",
        "",
        (
            f"- Best combination: **{best['method']} + {best['roi']}** "
            f"(range MAE {best['range_mae']} bpm, target MAE {best['target_mae']} bpm, "
            f"within-range {best['within_range_pct']}%)."
        ),
        "",
        "## Method Ranking",
        "",
        markdown_table(method_summary),
        "",
        "## Top Method/ROI Combinations",
        "",
        markdown_table(summary.head(12)),
        "",
        "## Label-Band Signal Diagnostic",
        "",
        (
            "This label-assisted diagnostic asks whether a method preserves an HR-frequency peak "
            "inside the OCR label range. A low error here does not mean the blind estimator can "
            "select that peak without labels."
        ),
        "",
        markdown_table(label_band_summary.head(12)),
        "",
        "## Winner Per Video",
        "",
        markdown_table(best_rows),
        "",
        "## Caveats",
        "",
        "- The labels are video-level OCR-reviewed BPM ranges, not frame-synchronous ECG/PPG ground truth.",
        "- Dog fur, tongue visibility, motion, specular highlights, and compression make these videos harder than human skin rPPG datasets.",
        "- Results should be treated as dataset-specific method selection for this prototype, not clinical validation.",
        "",
    ]
    out_path.write_text("\n".join(lines), encoding="utf-8")


def write_plot(summary: pd.DataFrame, out_path: Path) -> None:
    import matplotlib.pyplot as plt

    top = summary.head(12).copy()
    labels = [f"{row.method}\n{row.roi}" for row in top.itertuples()]
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.bar(labels, top["range_mae"].astype(float), color="#2f6f73")
    ax.set_ylabel("Range MAE (bpm)")
    ax.set_title("rPPG Method/ROI Ranking")
    ax.tick_params(axis="x", labelrotation=45)
    ax.grid(axis="y", alpha=0.25)
    fig.tight_layout()
    fig.savefig(out_path, dpi=180)
    plt.close(fig)


def main() -> None:
    args = parse_args()
    warnings.filterwarnings("ignore", category=ConvergenceWarning)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("YOLO_CONFIG_DIR", str(Path.cwd()))
    os.environ.setdefault("YOLO_VERBOSE", "False")

    from ultralytics import YOLO

    labels_df = pd.read_csv(args.labels_csv)
    labels_df = labels_df[labels_df["usable"] == True].copy()  # noqa: E712
    labels_df = labels_df.sort_values("video", key=lambda s: s.map(natural_sort_key))
    model = YOLO(str(args.model))
    # Auto GPU selection (fixes previous forced-CPU stupidity)
    import torch
    if args.device in ("0", "cuda") and not torch.cuda.is_available():
        print("[warn] CUDA not available, falling back to CPU for YOLO")
        args.device = "cpu"
    print(f"[device] rPPG YOLO device: {args.device} (cuda={torch.cuda.is_available()})")

    all_rows: list[dict[str, Any]] = []
    label_band_rows: list[dict[str, Any]] = []
    extraction_stats: list[dict[str, Any]] = []
    cache_dir = args.out_dir / "cache"

    for label in labels_df.to_dict(orient="records"):
        video_path = Path(label["path"])
        print(f"[extract] {video_path}")
        signals = extract_signals(
            video_path=video_path,
            model=model,
            args=args,
            cache_path=cache_dir / f"{video_path.stem}_signals.npz",
        )
        times = signals["times"]
        boxes = signals["boxes"]
        detected_pct = float(np.isfinite(boxes[:, :4]).all(axis=1).mean() * 100.0) if len(boxes) else 0.0
        extraction_stats.append(
            {
                "video": video_path.name,
                "samples": int(len(times)),
                "effective_fps": round(float(signals["effective_fps"][0]), 3),
                "detected_pct": round(detected_pct, 2),
                "median_box_conf": round(float(np.nanmedian(boxes[:, 4])), 3) if len(boxes) else "",
            }
        )

        for roi in ROI_MODES:
            rows = evaluate_rgb(
                video_name=video_path.name,
                label=label,
                times=times,
                rgb=signals[f"rgb_{roi}"],
                roi=roi,
                args=args,
            )
            all_rows.extend(rows)
            label_band_rows.extend(
                label_band_diagnostics(
                    video_name=video_path.name,
                    label=label,
                    times=times,
                    rgb=signals[f"rgb_{roi}"],
                    roi=roi,
                    args=args,
                )
            )

    results_path = args.out_dir / "rppg_predictions.csv"
    write_csv(all_rows, results_path)
    write_csv(extraction_stats, args.out_dir / "extraction_stats.csv")

    results_df = pd.DataFrame(all_rows)
    label_band_df = pd.DataFrame(label_band_rows)
    summary = summarize(results_df)
    label_band_summary = summarize_label_band(label_band_df)
    method_summary = summarize_by_method(summary)
    summary.to_csv(args.out_dir / "rppg_summary_by_method_roi.csv", index=False)
    label_band_df.to_csv(args.out_dir / "rppg_label_band_diagnostics.csv", index=False)
    label_band_summary.to_csv(args.out_dir / "rppg_label_band_summary.csv", index=False)
    method_summary.to_csv(args.out_dir / "rppg_summary_by_method.csv", index=False)
    write_report(
        labels_df,
        summary,
        method_summary,
        label_band_summary,
        results_df,
        args.out_dir / "rppg_evaluation_report.md",
        args,
    )
    write_plot(summary, args.out_dir / "rppg_method_ranking.png")

    best = summary.iloc[0].to_dict()
    print(json.dumps({"best": best, "out_dir": str(args.out_dir)}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
