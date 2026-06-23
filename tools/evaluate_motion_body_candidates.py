from __future__ import annotations

import argparse
import json
import math
import warnings
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from evaluate_rppg_methods import METHOD_FUNCTIONS, interpolate_rgb, weighted_median
from evaluate_single_view_sqi import existing_vite_url, natural_sort_key, quality_score, rows_for_ui, spectrum_peaks


METHODS = ("green", "chrom")
PREPROCESSES = ("raw", "bg_motion_residual")


@dataclass(frozen=True)
class RoiSpec:
    id: str
    label: str
    kind: str


ROI_SPECS = [
    RoiSpec("face_full", "Face full", "face"),
    RoiSpec("upper_face", "Upper face", "face"),
    RoiSpec("lower_face", "Lower face", "face"),
    RoiSpec("left_eye_proxy", "Left eye proxy", "keypoint"),
    RoiSpec("right_eye_proxy", "Right eye proxy", "keypoint"),
    RoiSpec("nose_bridge_proxy", "Nose bridge proxy", "keypoint"),
    RoiSpec("muzzle_proxy", "Muzzle proxy", "keypoint"),
    RoiSpec("mouth_proxy", "Mouth proxy", "keypoint"),
    RoiSpec("left_ear_base_proxy", "Left ear base proxy", "keypoint"),
    RoiSpec("right_ear_base_proxy", "Right ear base proxy", "keypoint"),
    RoiSpec("neck_chest", "Neck/chest proxy", "body"),
    RoiSpec("upper_body", "Upper body proxy", "body"),
    RoiSpec("lower_center_body", "Lower-frame body proxy", "body"),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Evaluate motion-aware and body-proxy rPPG candidates on the front RGB pilot dataset."
    )
    parser.add_argument("--labels-csv", type=Path, default=Path("dataset_front/video_labels_ocr.csv"))
    parser.add_argument("--single-view-dir", type=Path, default=Path("reports/rppg_single_view_sqi"))
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_motion_body_candidates"))
    parser.add_argument("--ui-data", type=Path, default=Path("ui/src/generated/rppgMotionBodyCandidates.ts"))
    parser.add_argument("--sample-fps", type=float, default=15.0)
    parser.add_argument("--window-sec", type=float, default=20.0)
    parser.add_argument("--step-sec", type=float, default=5.0)
    parser.add_argument("--min-bpm", type=float, default=80.0)
    parser.add_argument("--max-bpm", type=float, default=240.0)
    parser.add_argument("--top-peaks", type=int, default=2)
    parser.add_argument("--max-samples", type=int, default=900)
    return parser.parse_args()


def clamp_box(box: np.ndarray, width: int, height: int) -> np.ndarray:
    x1, y1, x2, y2 = box.astype(float)
    x1 = min(max(x1, 0.0), max(width - 1.0, 0.0))
    y1 = min(max(y1, 0.0), max(height - 1.0, 0.0))
    x2 = min(max(x2, x1 + 1.0), float(width))
    y2 = min(max(y2, y1 + 1.0), float(height))
    return np.array([x1, y1, x2, y2], dtype=float)


def roi_box(frame_shape: tuple[int, int] | tuple[int, int, int], face_box: np.ndarray, roi_id: str) -> np.ndarray:
    height, width = frame_shape[:2]
    if not np.isfinite(face_box).all():
        return np.array([np.nan, np.nan, np.nan, np.nan], dtype=float)
    x1, y1, x2, y2 = clamp_box(face_box, width, height)
    bw = x2 - x1
    bh = y2 - y1
    cx = (x1 + x2) / 2.0
    if bw < 8 or bh < 8:
        return np.array([np.nan, np.nan, np.nan, np.nan], dtype=float)

    face_rel = {
        "face_full": (0.12, 0.12, 0.88, 0.88),
        "upper_face": (0.22, 0.08, 0.78, 0.42),
        "mid_face": (0.18, 0.28, 0.82, 0.68),
        "lower_face": (0.20, 0.55, 0.80, 0.94),
        "left_eye_proxy": (0.16, 0.18, 0.45, 0.46),
        "right_eye_proxy": (0.55, 0.18, 0.84, 0.46),
        "nose_bridge_proxy": (0.36, 0.32, 0.64, 0.62),
        "muzzle_proxy": (0.26, 0.50, 0.74, 0.78),
        "mouth_proxy": (0.30, 0.68, 0.70, 0.95),
        "left_ear_base_proxy": (0.02, 0.02, 0.30, 0.34),
        "right_ear_base_proxy": (0.70, 0.02, 0.98, 0.34),
    }
    if roi_id in face_rel:
        rx1, ry1, rx2, ry2 = face_rel[roi_id]
        return clamp_box(np.array([x1 + bw * rx1, y1 + bh * ry1, x1 + bw * rx2, y1 + bh * ry2]), width, height)

    if roi_id == "neck_chest":
        box = np.array([cx - 0.65 * bw, y2 - 0.05 * bh, cx + 0.65 * bw, y2 + 1.15 * bh])
    elif roi_id == "upper_body":
        box = np.array([cx - 1.15 * bw, y2 - 0.10 * bh, cx + 1.15 * bw, y2 + 1.85 * bh])
    elif roi_id == "left_shoulder":
        box = np.array([cx - 1.35 * bw, y2 + 0.10 * bh, cx - 0.05 * bw, y2 + 1.35 * bh])
    elif roi_id == "right_shoulder":
        box = np.array([cx + 0.05 * bw, y2 + 0.10 * bh, cx + 1.35 * bw, y2 + 1.35 * bh])
    elif roi_id == "lower_center_body":
        box = np.array([0.24 * width, max(y2, 0.45 * height), 0.76 * width, 0.94 * height])
    else:
        box = np.array([np.nan, np.nan, np.nan, np.nan], dtype=float)
    return clamp_box(box, width, height)


def background_boxes(width: int, height: int) -> dict[str, np.ndarray]:
    return {
        "bg_top_left": np.array([0.02 * width, 0.02 * height, 0.22 * width, 0.22 * height], dtype=float),
        "bg_top_right": np.array([0.78 * width, 0.02 * height, 0.98 * width, 0.22 * height], dtype=float),
        "bg_bottom_left": np.array([0.02 * width, 0.76 * height, 0.22 * width, 0.98 * height], dtype=float),
        "bg_bottom_right": np.array([0.78 * width, 0.76 * height, 0.22 * width, 0.98 * height], dtype=float),
    }


def resized_gray(frame: np.ndarray, box: np.ndarray, size: int = 32) -> np.ndarray | None:
    if not np.isfinite(box).all():
        return None
    x1, y1, x2, y2 = box.round().astype(int)
    crop = frame[y1:y2, x1:x2]
    if crop.size == 0 or crop.shape[0] < 4 or crop.shape[1] < 4:
        return None
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    return cv2.resize(gray, (size, size), interpolation=cv2.INTER_AREA).astype(float) / 255.0


def fast_rgb(crop: np.ndarray) -> tuple[np.ndarray, float]:
    if crop.size == 0:
        return np.full(3, np.nan), 0.0
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    valid = (hsv[:, :, 2] > 20) & (hsv[:, :, 2] < 245)
    if valid.mean() < 0.10:
        valid = np.ones(valid.shape, dtype=bool)
    pixels = crop[valid]
    if pixels.size == 0:
        return np.full(3, np.nan), 0.0
    return pixels[:, ::-1].astype(float).mean(axis=0), float(valid.mean())


def extract_roi_traces(video_path: Path, cache: dict[str, np.ndarray], args: argparse.Namespace) -> dict[str, Any]:
    times = cache["times"].astype(float)
    boxes = cache["boxes"].astype(float)
    source_fps = float(np.ravel(cache.get("source_fps", np.array([30.0])))[0])

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    sample_indices = np.arange(len(times))
    if len(sample_indices) > args.max_samples:
        sample_indices = np.unique(np.linspace(0, len(times) - 1, args.max_samples).round().astype(int))
    frame_targets = np.clip(np.rint(times[sample_indices] * source_fps).astype(int), 0, max(frame_count - 1, 0))
    target_to_sample = {int(frame): int(sample) for frame, sample in zip(frame_targets, sample_indices)}
    wanted = set(target_to_sample)

    rgb_by_roi = {spec.id: np.full((len(times), 3), np.nan, dtype=float) for spec in ROI_SPECS}
    valid_by_roi = {spec.id: np.zeros(len(times), dtype=float) for spec in ROI_SPECS}
    motion_by_roi = {spec.id: np.zeros(len(times), dtype=float) for spec in ROI_SPECS}
    prev_gray_by_roi: dict[str, np.ndarray] = {}

    bg_rgb = np.full((len(times), 3), np.nan, dtype=float)
    bg_motion = np.zeros(len(times), dtype=float)
    prev_bg_gray: np.ndarray | None = None

    frame_index = 0
    while wanted:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_index not in wanted:
            frame_index += 1
            continue

        sample_idx = target_to_sample[frame_index]
        face_box = boxes[sample_idx, :4]
        for spec in ROI_SPECS:
            box = roi_box(frame.shape, face_box, spec.id)
            gray = resized_gray(frame, box)
            if gray is None:
                continue
            x1, y1, x2, y2 = box.round().astype(int)
            rgb, valid_fraction = fast_rgb(frame[y1:y2, x1:x2])
            rgb_by_roi[spec.id][sample_idx] = rgb
            valid_by_roi[spec.id][sample_idx] = valid_fraction
            prev_gray = prev_gray_by_roi.get(spec.id)
            if prev_gray is not None:
                motion_by_roi[spec.id][sample_idx] = float(np.mean(np.abs(gray - prev_gray)))
            prev_gray_by_roi[spec.id] = gray

        bg_values: list[np.ndarray] = []
        bg_grays: list[np.ndarray] = []
        height, width = frame.shape[:2]
        for box in background_boxes(width, height).values():
            x1, y1, x2, y2 = box.round().astype(int)
            rgb, _ = fast_rgb(frame[y1:y2, x1:x2])
            if np.isfinite(rgb).all():
                bg_values.append(rgb)
            gray = resized_gray(frame, box)
            if gray is not None:
                bg_grays.append(gray)
        if bg_values:
            bg_rgb[sample_idx] = np.mean(bg_values, axis=0)
        if bg_grays:
            mean_bg_gray = np.mean(bg_grays, axis=0)
            if prev_bg_gray is not None:
                bg_motion[sample_idx] = float(np.mean(np.abs(mean_bg_gray - prev_bg_gray)))
            prev_bg_gray = mean_bg_gray

        wanted.remove(frame_index)
        frame_index += 1

    cap.release()

    return {
        "times": times,
        "boxes": boxes,
        "rgb_by_roi": rgb_by_roi,
        "valid_by_roi": valid_by_roi,
        "motion_by_roi": motion_by_roi,
        "background_rgb": bg_rgb,
        "background_motion": bg_motion,
    }


def save_extracted(path: Path, extracted: dict[str, Any]) -> None:
    payload: dict[str, np.ndarray] = {
        "times": extracted["times"],
        "boxes": extracted["boxes"],
        "background_rgb": extracted["background_rgb"],
        "background_motion": extracted["background_motion"],
    }
    for spec in ROI_SPECS:
        payload[f"rgb__{spec.id}"] = extracted["rgb_by_roi"][spec.id]
        payload[f"valid__{spec.id}"] = extracted["valid_by_roi"][spec.id]
        payload[f"motion__{spec.id}"] = extracted["motion_by_roi"][spec.id]
    path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(path, **payload)


def load_extracted(path: Path) -> dict[str, Any]:
    data = np.load(path, allow_pickle=True)
    return {
        "times": data["times"],
        "boxes": data["boxes"],
        "background_rgb": data["background_rgb"],
        "background_motion": data["background_motion"],
        "rgb_by_roi": {spec.id: data[f"rgb__{spec.id}"] for spec in ROI_SPECS},
        "valid_by_roi": {spec.id: data[f"valid__{spec.id}"] for spec in ROI_SPECS},
        "motion_by_roi": {spec.id: data[f"motion__{spec.id}"] for spec in ROI_SPECS},
    }


def interp_scalar(times: np.ndarray, values: np.ndarray, uniform_t: np.ndarray) -> np.ndarray:
    values = np.asarray(values, dtype=float)
    good = np.isfinite(values)
    if good.sum() < 4 or len(uniform_t) == 0:
        return np.zeros(len(uniform_t), dtype=float)
    return np.interp(uniform_t, times[good], values[good])


def box_motion_series(times: np.ndarray, boxes: np.ndarray, uniform_t: np.ndarray) -> np.ndarray:
    if len(boxes) < 2 or len(uniform_t) == 0:
        return np.zeros(len(uniform_t), dtype=float)
    b = boxes[:, :4].astype(float)
    centers = np.column_stack([(b[:, 0] + b[:, 2]) / 2.0, (b[:, 1] + b[:, 3]) / 2.0])
    diag = np.sqrt(np.maximum((b[:, 2] - b[:, 0]) ** 2 + (b[:, 3] - b[:, 1]) ** 2, 1.0))
    delta = np.zeros(len(times), dtype=float)
    delta[1:] = np.sqrt(np.sum(np.diff(centers, axis=0) ** 2, axis=1)) / np.maximum(diag[1:], 1.0)
    return interp_scalar(times, delta, uniform_t)


def rgb_common_mode_residual(rgb: np.ndarray, background_rgb: np.ndarray) -> np.ndarray:
    if len(rgb) != len(background_rgb) or len(rgb) == 0:
        return rgb
    clean = rgb.astype(float).copy()
    for channel in range(3):
        y = rgb[:, channel].astype(float)
        x = background_rgb[:, channel].astype(float)
        good = np.isfinite(x) & np.isfinite(y)
        if good.sum() < 12 or np.nanstd(x[good]) < 1e-9:
            continue
        x0 = x[good] - float(np.mean(x[good]))
        y0 = y[good] - float(np.mean(y[good]))
        beta = float(np.dot(x0, y0) / (np.dot(x0, x0) + 1e-12))
        clean[:, channel] = y - beta * (x - float(np.nanmean(x[good])))
    return clean


def regress_out(signal: np.ndarray, nuisance_columns: list[np.ndarray]) -> np.ndarray:
    y = np.asarray(signal, dtype=float)
    if len(y) < 16:
        return y
    cols = []
    for col in nuisance_columns:
        c = np.asarray(col, dtype=float)
        if len(c) != len(y):
            continue
        c = np.nan_to_num(c, nan=np.nanmedian(c[np.isfinite(c)]) if np.isfinite(c).any() else 0.0)
        if np.nanstd(c) < 1e-9:
            continue
        cols.append((c - np.nanmean(c)) / (np.nanstd(c) + 1e-9))
    if not cols:
        return y
    x = np.column_stack([np.ones(len(y)), *cols])
    good = np.isfinite(y) & np.isfinite(x).all(axis=1)
    if good.sum() < len(cols) + 8:
        return y
    beta, *_ = np.linalg.lstsq(x[good], y[good], rcond=None)
    residual = y - x @ beta
    return residual + float(np.nanmean(y[good]))


def band_power_at(freqs: np.ndarray, power: np.ndarray, bpm: float) -> float:
    if len(freqs) == 0 or not np.isfinite(bpm):
        return 0.0
    idx = int(np.argmin(np.abs(freqs - bpm / 60.0)))
    return float(power[idx])


def peak_for_signal(x: np.ndarray, fs: float, min_bpm: float, max_bpm: float) -> dict[str, float]:
    peaks = spectrum_peaks(x, fs, min_bpm, max_bpm, top_k=1)
    return peaks[0] if peaks else {}


def coherence_to_peak(signal_x: np.ndarray, candidate_bpm: float, fs: float, min_bpm: float, max_bpm: float) -> tuple[float, float]:
    if len(signal_x) < 16 or not np.isfinite(candidate_bpm):
        return 0.0, np.nan
    peak = peak_for_signal(signal_x, fs, min_bpm, max_bpm)
    if not peak:
        return 0.0, np.nan
    peak_bpm = float(peak["peak_bpm"])
    snr = float(peak["snr"])
    if abs(peak_bpm - candidate_bpm) <= 4.0:
        return min(1.0, math.log1p(snr) / math.log(10.0)), peak_bpm
    return 0.0, peak_bpm


def artifact_state(row: dict[str, Any]) -> str:
    roi_id = str(row.get("roi_id", ""))
    roi_motion = float(row.get("roi_motion", 0.0) or 0.0)
    motion_lock = max(
        float(row.get("motion_coherence", 0.0) or 0.0),
        float(row.get("bg_motion_coherence", 0.0) or 0.0),
        float(row.get("box_motion_coherence", 0.0) or 0.0),
    )
    if bool(row.get("artifact_100bpm", False)):
        return "100bpm_artifact"
    if motion_lock >= 0.65:
        return "motion_locked_peak"
    if roi_id in {"mouth_proxy", "lower_face", "muzzle_proxy"} and roi_motion >= 0.02:
        return "mouth_panting_motion"
    if str(row.get("roi_kind", "")) == "body" and roi_motion >= 0.025:
        return "body_motion"
    if str(row.get("roi_kind", "")) == "keypoint" and roi_motion >= 0.025:
        return "keypoint_motion"
    return "stable_low_motion"


def range_error_for(pred: float, bpm_min: float, bpm_max: float) -> tuple[float, bool]:
    if not np.isfinite(pred):
        return np.nan, False
    if pred < bpm_min:
        return float(bpm_min - pred), False
    if pred > bpm_max:
        return float(pred - bpm_max), False
    return 0.0, True


def evaluate_video(video_row: pd.Series, args: argparse.Namespace) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    video = str(video_row["video"])
    stem = Path(video).stem
    video_path = Path(str(video_row["path"]))
    cache_path = args.single_view_dir / "cache" / f"{stem}_candidate_traces.npz"
    if not cache_path.exists():
        return [], {}

    print(f"[motion-body] {video}", flush=True)
    npz = np.load(cache_path, allow_pickle=True)
    cache = {key: npz[key] for key in npz.files}
    motion_cache_path = args.out_dir / "cache" / f"{stem}_motion_body_keypoint_traces_v2.npz"
    if motion_cache_path.exists():
        extracted = load_extracted(motion_cache_path)
    else:
        extracted = extract_roi_traces(video_path, cache, args)
        save_extracted(motion_cache_path, extracted)
    times = extracted["times"]
    boxes = extracted["boxes"]

    # Use face_full interpolation as the shared clock. It is available whenever the detector tracked the dog.
    uniform_t, _ = interpolate_rgb(times, extracted["rgb_by_roi"]["face_full"], args.sample_fps)
    if len(uniform_t) < int(args.window_sec * args.sample_fps):
        return [], {}

    bg_t, bg_rgb_uniform = interpolate_rgb(times, extracted["background_rgb"], args.sample_fps)
    if len(bg_t) != len(uniform_t):
        bg_rgb_uniform = np.column_stack(
            [
                np.interp(uniform_t, bg_t, bg_rgb_uniform[:, ch]) if len(bg_t) else np.full(len(uniform_t), np.nan)
                for ch in range(3)
            ]
        )
    bg_motion_uniform = interp_scalar(times, extracted["background_motion"], uniform_t)
    face_box_motion = box_motion_series(times, boxes, uniform_t)
    bg_brightness = np.nanmean(bg_rgb_uniform, axis=1)
    bg_brightness = np.nan_to_num(bg_brightness, nan=np.nanmedian(bg_brightness[np.isfinite(bg_brightness)]) if np.isfinite(bg_brightness).any() else 0.0)

    bpm_min = float(video_row["bpm_min"])
    bpm_max = float(video_row["bpm_max"])
    bpm_target = float(video_row["bpm_target"])
    window_len = int(round(args.window_sec * args.sample_fps))
    step_len = int(round(args.step_sec * args.sample_fps))

    roi_uniform: dict[str, dict[str, np.ndarray]] = {}
    for spec in ROI_SPECS:
        roi_t, roi_rgb = interpolate_rgb(times, extracted["rgb_by_roi"][spec.id], args.sample_fps)
        if len(roi_t) == 0:
            continue
        if len(roi_t) != len(uniform_t) or np.max(np.abs(roi_t[: min(len(roi_t), len(uniform_t))] - uniform_t[: min(len(roi_t), len(uniform_t))])) > 1e-3:
            roi_rgb = np.column_stack([np.interp(uniform_t, roi_t, roi_rgb[:, ch]) for ch in range(3)])
        roi_motion = interp_scalar(times, extracted["motion_by_roi"][spec.id], uniform_t)
        roi_valid = interp_scalar(times, extracted["valid_by_roi"][spec.id], uniform_t)
        roi_uniform[spec.id] = {"rgb": roi_rgb, "motion": roi_motion, "valid": roi_valid}

    rows: list[dict[str, Any]] = []
    specs_by_id = {spec.id: spec for spec in ROI_SPECS}
    for window_index, start in enumerate(range(0, len(uniform_t) - window_len + 1, step_len)):
        end = start + window_len
        start_sec = float(uniform_t[start])
        end_sec = float(uniform_t[end - 1])
        bg_win = bg_rgb_uniform[start:end]
        bg_motion_win = bg_motion_uniform[start:end]
        face_box_motion_win = face_box_motion[start:end]
        bg_brightness_win = bg_brightness[start:end]
        bg_motion_peak = peak_for_signal(bg_motion_win, args.sample_fps, args.min_bpm, args.max_bpm)
        box_motion_peak = peak_for_signal(face_box_motion_win, args.sample_fps, args.min_bpm, args.max_bpm)

        for roi_id, values in roi_uniform.items():
            spec = specs_by_id[roi_id]
            rgb_win = values["rgb"][start:end]
            motion_win = values["motion"][start:end]
            valid_win = values["valid"][start:end]
            if len(rgb_win) < window_len or not np.isfinite(rgb_win).all() or np.min(np.nanmean(rgb_win, axis=0)) <= 1:
                continue

            valid_fraction = float(np.nanmedian(valid_win[np.isfinite(valid_win)])) if np.isfinite(valid_win).any() else 0.0
            motion_score = float(np.nanmedian(motion_win[np.isfinite(motion_win)])) if np.isfinite(motion_win).any() else 0.0
            color_cv = float(np.nanmean(np.nanstd(rgb_win, axis=0) / (np.nanmean(rgb_win, axis=0) + 1e-9)))
            rgb_resid = rgb_common_mode_residual(rgb_win, bg_win)

            for method in METHODS:
                try:
                    pulse_raw = METHOD_FUNCTIONS[method](rgb_win, args.sample_fps, args.min_bpm, args.max_bpm)
                    pulse_bg_rgb = METHOD_FUNCTIONS[method](rgb_resid, args.sample_fps, args.min_bpm, args.max_bpm)
                except Exception:
                    continue

                variants = {
                    "raw": pulse_raw,
                    "bg_motion_residual": regress_out(
                        pulse_bg_rgb,
                        [motion_win, face_box_motion_win, bg_motion_win, bg_brightness_win],
                    ),
                }

                for preprocess, pulse in variants.items():
                    peaks = spectrum_peaks(pulse, args.sample_fps, args.min_bpm, args.max_bpm, args.top_peaks)
                    for peak in peaks:
                        pred = float(peak["peak_bpm"])
                        range_error, within_range = range_error_for(pred, bpm_min, bpm_max)
                        motion_coherence, motion_peak_bpm = coherence_to_peak(motion_win, pred, args.sample_fps, args.min_bpm, args.max_bpm)
                        bg_motion_coherence, bg_motion_peak_bpm = coherence_to_peak(
                            bg_motion_win,
                            pred,
                            args.sample_fps,
                            args.min_bpm,
                            args.max_bpm,
                        )
                        box_motion_coherence, box_motion_peak_bpm = coherence_to_peak(
                            face_box_motion_win,
                            pred,
                            args.sample_fps,
                            args.min_bpm,
                            args.max_bpm,
                        )
                        row = {
                            "video": video,
                            "window_index": window_index,
                            "window_start_sec": round(start_sec, 3),
                            "window_end_sec": round(end_sec, 3),
                            "roi_id": roi_id,
                            "roi_label": spec.label,
                            "roi_kind": spec.kind,
                            "method": method,
                            "preprocess": preprocess,
                            "peak_rank": int(peak["peak_rank"]),
                            "peak_bpm": round(pred, 3),
                            "bpm_min": bpm_min,
                            "bpm_max": bpm_max,
                            "bpm_target": bpm_target,
                            "target_abs_error": round(abs(pred - bpm_target), 3),
                            "range_error": round(range_error, 3) if np.isfinite(range_error) else "",
                            "within_range": bool(within_range),
                            "snr": round(float(peak["snr"]), 3),
                            "total_power_ratio": round(float(peak["total_power_ratio"]), 6),
                            "spectral_entropy": round(float(peak["spectral_entropy"]), 6),
                            "h2_ratio": round(float(peak["h2_ratio"]), 6),
                            "half_ratio": round(float(peak["half_ratio"]), 6),
                            "valid_fraction": round(valid_fraction, 4),
                            "box_motion": round(float(np.nanmedian(face_box_motion_win)), 6),
                            "roi_motion": round(motion_score, 6),
                            "color_cv": round(color_cv, 6),
                            "motion_coherence": round(motion_coherence, 3),
                            "bg_motion_coherence": round(bg_motion_coherence, 3),
                            "box_motion_coherence": round(box_motion_coherence, 3),
                            "motion_peak_bpm": round(motion_peak_bpm, 3) if np.isfinite(motion_peak_bpm) else "",
                            "bg_motion_peak_bpm": round(bg_motion_peak_bpm, 3) if np.isfinite(bg_motion_peak_bpm) else "",
                            "box_motion_peak_bpm": round(box_motion_peak_bpm, 3) if np.isfinite(box_motion_peak_bpm) else "",
                            "bg_motion_global_peak_bpm": round(float(bg_motion_peak.get("peak_bpm", np.nan)), 3)
                            if bg_motion_peak
                            else "",
                            "box_motion_global_peak_bpm": round(float(box_motion_peak.get("peak_bpm", np.nan)), 3)
                            if box_motion_peak
                            else "",
                            "artifact_100bpm": bool(95.0 <= pred <= 105.0),
                        }
                        base_quality = quality_score(row)
                        motion_penalty = 1.35 * max(motion_coherence, bg_motion_coherence, box_motion_coherence)
                        high_motion_penalty = 0.75 * min(motion_score * 8.0, 1.0)
                        artifact_penalty = 0.55 if row["artifact_100bpm"] else 0.0
                        residual_bonus = 0.25 if preprocess in {"bg_rgb_residual", "bg_motion_residual"} else 0.0
                        body_bonus = 0.12 if spec.kind == "body" else 0.0
                        row["quality_score"] = round(base_quality, 6)
                        state = artifact_state(row)
                        state_bonus = 0.20 if state == "stable_low_motion" else 0.0
                        state_penalty = {
                            "100bpm_artifact": 0.65,
                            "motion_locked_peak": 0.55,
                            "mouth_panting_motion": 0.35,
                            "body_motion": 0.25,
                            "keypoint_motion": 0.25,
                            "stable_low_motion": 0.0,
                        }.get(state, 0.0)
                        keypoint_bonus = 0.16 if spec.kind == "keypoint" and roi_id not in {"mouth_proxy"} else 0.0
                        row["artifact_state"] = state
                        row["keypoint_source"] = "face_box_pseudo_keypoint" if spec.kind == "keypoint" else ""
                        row["motion_aware_score"] = round(
                            float(base_quality - motion_penalty - high_motion_penalty - artifact_penalty + residual_bonus + body_bonus),
                            6,
                        )
                        row["pet_state_keypoint_score"] = round(
                            float(row["motion_aware_score"] + state_bonus + keypoint_bonus - state_penalty),
                            6,
                        )
                        rows.append(row)

    stats = {
        "video": video,
        "windows": int(max(0, math.floor((len(uniform_t) - window_len) / step_len) + 1)),
        "duration_sec": round(float(uniform_t[-1] - uniform_t[0]), 3),
        "samples": int(len(uniform_t)),
        "roi_count": len(roi_uniform),
        "median_face_box_motion": round(float(np.nanmedian(face_box_motion)), 6),
        "median_background_motion": round(float(np.nanmedian(bg_motion_uniform)), 6),
    }
    return rows, stats


def numeric_series(df: pd.DataFrame, col: str) -> np.ndarray:
    return pd.to_numeric(df[col], errors="coerce").to_numpy(dtype=float)


def weighted_prediction(group: pd.DataFrame, score_col: str = "pet_state_keypoint_score") -> float:
    if score_col not in group.columns:
        score_col = "motion_aware_score"
    values = numeric_series(group, "peak_bpm")
    scores = numeric_series(group, score_col)
    good = np.isfinite(values) & np.isfinite(scores)
    if good.sum() == 0:
        return np.nan
    values = values[good]
    scores = scores[good]
    weights = scores - np.nanmin(scores) + 0.05
    weights = np.clip(weights, 0.05, None)
    return weighted_median(values, weights)


def summarize_selector(name: str, selected: pd.DataFrame) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    for video, group in selected.groupby("video"):
        if group.empty:
            continue
        first = group.iloc[0]
        pred = weighted_prediction(group)
        bpm_min = float(first["bpm_min"])
        bpm_max = float(first["bpm_max"])
        bpm_target = float(first["bpm_target"])
        range_error, within_range = range_error_for(pred, bpm_min, bpm_max)
        rows.append(
            {
                "selector": name,
                "video": video,
                "pred_bpm": pred,
                "target_abs_error": abs(pred - bpm_target) if np.isfinite(pred) else np.nan,
                "range_error": range_error,
                "within_range": within_range,
                "median_motion_aware_score": float(np.nanmedian(numeric_series(group, "motion_aware_score"))),
                "median_pet_state_keypoint_score": float(np.nanmedian(numeric_series(group, "pet_state_keypoint_score")))
                if "pet_state_keypoint_score" in group.columns
                else np.nan,
                "body_window_share": float((group["roi_kind"] == "body").mean()),
                "keypoint_window_share": float((group["roi_kind"] == "keypoint").mean()),
                "residual_window_share": float((group["preprocess"] != "raw").mean()),
                "artifact_100bpm_window_share": float(group["artifact_100bpm"].mean()),
                "stable_window_share": float((group["artifact_state"] == "stable_low_motion").mean())
                if "artifact_state" in group.columns
                else np.nan,
                "top_state": str(group["artifact_state"].mode().iloc[0])
                if "artifact_state" in group.columns and not group["artifact_state"].mode().empty
                else "",
                "top_roi": str(group["roi_id"].mode().iloc[0]) if not group["roi_id"].mode().empty else "",
                "top_method": str(group["method"].mode().iloc[0]) if not group["method"].mode().empty else "",
                "top_preprocess": str(group["preprocess"].mode().iloc[0]) if not group["preprocess"].mode().empty else "",
            }
        )
    pred_df = pd.DataFrame(rows)
    if pred_df.empty:
        return {
            "selector": name,
            "n": 0,
            "target_mae": np.nan,
            "range_mae": np.nan,
            "within_range_pct": np.nan,
            "body_window_share": np.nan,
            "residual_window_share": np.nan,
            "artifact_100bpm_window_share": np.nan,
        }
    return {
        "selector": name,
        "n": int(len(pred_df)),
        "target_mae": round(float(np.nanmean(pred_df["target_abs_error"])), 3),
        "target_rmse": round(float(np.sqrt(np.nanmean(np.square(pred_df["target_abs_error"])))), 3),
        "range_mae": round(float(np.nanmean(pred_df["range_error"])), 3),
        "within_range_pct": round(float(np.mean(pred_df["within_range"]) * 100.0), 2),
        "body_window_share": round(float(np.nanmedian(pred_df["body_window_share"]) * 100.0), 2),
        "keypoint_window_share": round(float(np.nanmedian(pred_df["keypoint_window_share"]) * 100.0), 2),
        "residual_window_share": round(float(np.nanmedian(pred_df["residual_window_share"]) * 100.0), 2),
        "artifact_100bpm_window_share": round(float(np.nanmedian(pred_df["artifact_100bpm_window_share"]) * 100.0), 2),
        "stable_window_share": round(float(np.nanmedian(pred_df["stable_window_share"]) * 100.0), 2),
    }


def select_per_window(candidates: pd.DataFrame, selector: str) -> pd.DataFrame:
    frame = candidates.copy()
    if selector == "oracle_motion_body_window":
        frame["_oracle_error"] = numeric_series(frame, "range_error")
        target_error = numeric_series(frame, "target_abs_error")
        frame["_oracle_error"] = np.where(np.isfinite(frame["_oracle_error"]), frame["_oracle_error"], target_error)
        return (
            frame.sort_values(["video", "window_index", "_oracle_error", "target_abs_error", "pet_state_keypoint_score"], ascending=[True, True, True, True, False])
            .groupby(["video", "window_index"], as_index=False)
            .head(1)
        )
    if selector in {"motion_body_sqi", "pet_state_keypoint_sqi"}:
        subset = frame
    elif selector == "keypoint_only_pet_state_sqi":
        subset = frame[frame["roi_kind"] == "keypoint"]
    elif selector == "stable_only_pet_state_sqi":
        subset = frame[frame["artifact_state"] == "stable_low_motion"]
    elif selector == "non_mouth_keypoint_sqi":
        subset = frame[(frame["roi_kind"] == "keypoint") & (~frame["roi_id"].isin(["mouth_proxy", "muzzle_proxy"]))]
    elif selector == "body_only_motion_sqi":
        subset = frame[frame["roi_kind"] == "body"]
    elif selector == "face_motion_residual_sqi":
        subset = frame[(frame["roi_kind"] == "face") & (frame["preprocess"] != "raw")]
    elif selector == "body_motion_residual_sqi":
        subset = frame[(frame["roi_kind"] == "body") & (frame["preprocess"] != "raw")]
    elif selector == "motion_reject_raw_sqi":
        subset = frame[frame["preprocess"] == "raw"]
    else:
        subset = frame
    if subset.empty:
        return subset
    score_col = "pet_state_keypoint_score" if selector in {
        "pet_state_keypoint_sqi",
        "keypoint_only_pet_state_sqi",
        "stable_only_pet_state_sqi",
        "non_mouth_keypoint_sqi",
    } else "motion_aware_score"
    return (
        subset.sort_values(["video", "window_index", score_col], ascending=[True, True, False])
        .groupby(["video", "window_index"], as_index=False)
        .head(1)
    )


def make_predictions(candidates: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    selectors = [
        "oracle_motion_body_window",
        "pet_state_keypoint_sqi",
        "keypoint_only_pet_state_sqi",
        "stable_only_pet_state_sqi",
        "non_mouth_keypoint_sqi",
        "motion_body_sqi",
        "body_only_motion_sqi",
        "face_motion_residual_sqi",
        "body_motion_residual_sqi",
        "motion_reject_raw_sqi",
    ]
    summary_rows = []
    prediction_rows = []
    for selector in selectors:
        selected = select_per_window(candidates, selector)
        if selected.empty:
            continue
        summary_rows.append(summarize_selector(selector, selected))
        for video, group in selected.groupby("video"):
            first = group.iloc[0]
            pred = weighted_prediction(group)
            range_error, within_range = range_error_for(pred, float(first["bpm_min"]), float(first["bpm_max"]))
            prediction_rows.append(
                {
                    "selector": selector,
                    "video": video,
                    "pred_bpm": round(float(pred), 3) if np.isfinite(pred) else "",
                    "bpm_min": float(first["bpm_min"]),
                    "bpm_max": float(first["bpm_max"]),
                    "bpm_target": float(first["bpm_target"]),
                    "target_abs_error": round(abs(float(pred) - float(first["bpm_target"])), 3) if np.isfinite(pred) else "",
                    "range_error": round(range_error, 3) if np.isfinite(range_error) else "",
                    "within_range": bool(within_range),
                    "windows": int(len(group)),
                    "body_window_share": round(float((group["roi_kind"] == "body").mean() * 100.0), 2),
                    "keypoint_window_share": round(float((group["roi_kind"] == "keypoint").mean() * 100.0), 2),
                    "residual_window_share": round(float((group["preprocess"] != "raw").mean() * 100.0), 2),
                    "artifact_100bpm_window_share": round(float(group["artifact_100bpm"].mean() * 100.0), 2),
                    "stable_window_share": round(float((group["artifact_state"] == "stable_low_motion").mean() * 100.0), 2),
                    "top_state": str(group["artifact_state"].mode().iloc[0]) if not group["artifact_state"].mode().empty else "",
                    "top_roi": str(group["roi_id"].mode().iloc[0]) if not group["roi_id"].mode().empty else "",
                    "top_method": str(group["method"].mode().iloc[0]) if not group["method"].mode().empty else "",
                    "top_preprocess": str(group["preprocess"].mode().iloc[0]) if not group["preprocess"].mode().empty else "",
                }
            )
    summary = pd.DataFrame(summary_rows).sort_values(["range_mae", "target_mae"], na_position="last")
    predictions = pd.DataFrame(prediction_rows)
    return summary, predictions


def write_report(summary: pd.DataFrame, predictions: pd.DataFrame, stats: pd.DataFrame, args: argparse.Namespace) -> None:
    def table(df: pd.DataFrame) -> str:
        if df.empty:
            return "No rows."
        frame = df.fillna("")
        headers = [str(col) for col in frame.columns]
        rows = [[str(value) for value in row] for row in frame.to_numpy()]
        lines = [
            "| " + " | ".join(headers) + " |",
            "| " + " | ".join("---" for _ in headers) + " |",
        ]
        lines.extend("| " + " | ".join(row) + " |" for row in rows)
        return "\n".join(lines)

    lines = [
        "# Motion/Body Candidate rPPG Evaluation",
        "",
        "This run expands beyond dog-face-only ROIs by adding neck/chest/body proxy ROIs and motion/background residualization.",
        "",
        "## Methods",
        "",
        "- ROI expansion: face, upper/mid/lower face, neck/chest, upper body, shoulders, lower-center body proxy.",
        "- Common-mode removal: regress background RGB changes out of ROI RGB.",
        "- Motion residualization: regress ROI frame-difference, face-box motion, background motion, and background brightness out of pulse traces.",
        "- Motion-aware scoring: penalize peaks coherent with ROI/background/box motion and the recurring 95-105 bpm artifact.",
        "- Pet-specific artifact state: stable low-motion, 100 bpm artifact, motion-locked peak, mouth/panting motion, body/keypoint motion.",
        "- Pet keypoint utilization: pseudo keypoint ROIs from face box geometry until a real dog/cat keypoint model is available.",
        "",
        "## Selector Summary",
        "",
        table(summary),
        "",
        "## Per-Video Predictions",
        "",
        table(predictions.sort_values(["selector", "video"]) if not predictions.empty else predictions),
        "",
        "## Extraction Stats",
        "",
        table(stats),
    ]
    (args.out_dir / "motion_body_report.md").write_text("\n".join(lines), encoding="utf-8")


def write_plots(summary: pd.DataFrame, predictions: pd.DataFrame, args: argparse.Namespace) -> None:
    if not summary.empty:
        fig, ax = plt.subplots(figsize=(10.5, 4.8))
        top = summary.sort_values("range_mae", ascending=True)
        labels = [str(x).replace("_", "\n") for x in top["selector"]]
        ax.bar(labels, top["range_mae"].astype(float), color="#4f9d84")
        ax.set_ylabel("Range MAE (bpm)")
        ax.set_title("Motion/Body Candidate Selector Summary")
        ax.tick_params(axis="x", labelrotation=0, labelsize=8)
        ax.grid(axis="y", alpha=0.25)
        fig.tight_layout()
        fig.savefig(args.out_dir / "motion_body_selector_summary.png", dpi=180)
        plt.close(fig)

    if not predictions.empty:
        fig, ax = plt.subplots(figsize=(10.5, 5.2))
        for selector, group in predictions.groupby("selector"):
            if selector not in {"motion_body_sqi", "body_only_motion_sqi", "face_motion_residual_sqi", "oracle_motion_body_window"}:
                continue
            x = np.arange(len(group))
            ax.plot(x, pd.to_numeric(group["pred_bpm"], errors="coerce"), marker="o", label=selector.replace("_", " "))
        videos = sorted(predictions["video"].unique(), key=natural_sort_key)
        ax.set_xticks(np.arange(len(videos)))
        ax.set_xticklabels(videos)
        ax.set_ylabel("Predicted BPM")
        ax.set_title("Motion/Body Per-Video Predictions")
        ax.legend(fontsize=8)
        ax.grid(alpha=0.25)
        fig.tight_layout()
        fig.savefig(args.out_dir / "motion_body_predictions.png", dpi=180)
        plt.close(fig)


def write_ui_data(summary: pd.DataFrame, predictions: pd.DataFrame, stats: pd.DataFrame, args: argparse.Namespace) -> None:
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "setup": {
            "labelsCsv": args.labels_csv.as_posix(),
            "singleViewDir": args.single_view_dir.as_posix(),
            "outDir": args.out_dir.as_posix(),
            "sampleFps": args.sample_fps,
            "windowSec": args.window_sec,
            "stepSec": args.step_sec,
            "minBpm": args.min_bpm,
            "maxBpm": args.max_bpm,
            "roiCount": len(ROI_SPECS),
            "methods": list(METHODS),
            "preprocesses": list(PREPROCESSES),
            "artifactStates": [
                "stable_low_motion",
                "100bpm_artifact",
                "motion_locked_peak",
                "mouth_panting_motion",
                "body_motion",
                "keypoint_motion",
            ],
            "keypointSource": "face_box_pseudo_keypoint",
            "interpretation": "Pilot labels are OCR HR ranges; non-oracle rows are heuristic selectors, not deployable validation.",
        },
        "assets": {
            "reportUrl": existing_vite_url(args.out_dir / "motion_body_report.md"),
            "summaryCsvUrl": existing_vite_url(args.out_dir / "motion_body_summary.csv"),
            "predictionsCsvUrl": existing_vite_url(args.out_dir / "motion_body_predictions.csv"),
            "candidatesCsvUrl": existing_vite_url(args.out_dir / "motion_body_candidates.csv"),
            "selectorPlotUrl": existing_vite_url(args.out_dir / "motion_body_selector_summary.png"),
            "predictionPlotUrl": existing_vite_url(args.out_dir / "motion_body_predictions.png"),
        },
        "summary": rows_for_ui(summary),
        "predictions": rows_for_ui(predictions),
        "stats": rows_for_ui(stats),
    }
    args.ui_data.parent.mkdir(parents=True, exist_ok=True)
    args.ui_data.write_text(
        "export const RPPG_MOTION_BODY_CANDIDATES = "
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + " as const;\n",
        encoding="utf-8",
    )


def main() -> None:
    warnings.filterwarnings("ignore")
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)

    labels = pd.read_csv(args.labels_csv)
    usable = labels[labels["usable"].astype(str).str.lower() == "true"].copy()
    all_rows: list[dict[str, Any]] = []
    stats_rows: list[dict[str, Any]] = []
    for _, row in usable.sort_values("video", key=lambda s: s.map(natural_sort_key)).iterrows():
        rows, stats = evaluate_video(row, args)
        all_rows.extend(rows)
        if stats:
            stats_rows.append(stats)
        print(f"[motion-body] accumulated candidates: {len(all_rows)}", flush=True)

    candidates = pd.DataFrame(all_rows)
    stats = pd.DataFrame(stats_rows)
    if candidates.empty:
        raise RuntimeError("No motion/body candidates were generated.")
    summary, predictions = make_predictions(candidates)

    candidates.to_csv(args.out_dir / "motion_body_candidates.csv", index=False)
    summary.to_csv(args.out_dir / "motion_body_summary.csv", index=False)
    predictions.to_csv(args.out_dir / "motion_body_predictions.csv", index=False)
    stats.to_csv(args.out_dir / "motion_body_stats.csv", index=False)
    write_plots(summary, predictions, args)
    write_report(summary, predictions, stats, args)
    write_ui_data(summary, predictions, stats, args)

    print(f"Wrote motion/body candidate artifacts to {args.out_dir}")


if __name__ == "__main__":
    main()
