from __future__ import annotations

import argparse
import json
import math
import os
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
ANIMAL_NAMES = {"dog", "cat"}


@dataclass(frozen=True)
class SegRoi:
    id: str
    label: str
    kind: str


SEG_ROIS = [
    SegRoi("animal_full", "Animal full mask", "mask"),
    SegRoi("animal_non_face", "Animal mask excluding face", "mask_body"),
    SegRoi("animal_face_intersection", "Animal mask inside face box", "mask_face"),
    SegRoi("mask_neck_chest", "Mask neck/chest below face", "mask_body"),
    SegRoi("mask_upper_body", "Mask upper body", "mask_body"),
    SegRoi("mask_lower_body", "Mask lower body", "mask_body"),
    SegRoi("mask_left_body", "Mask left body", "mask_body"),
    SegRoi("mask_right_body", "Mask right body", "mask_body"),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate rPPG candidates extracted from YOLO animal segmentation masks.")
    parser.add_argument("--labels-csv", type=Path, default=Path("dataset_front/video_labels_ocr.csv"))
    parser.add_argument("--single-view-dir", type=Path, default=Path("reports/rppg_single_view_sqi"))
    parser.add_argument("--seg-model", type=Path, default=Path("yolo11n-seg.pt"))
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_segmentation_roi"))
    parser.add_argument("--ui-data", type=Path, default=Path("ui/src/generated/rppgSegmentationRoi.ts"))
    parser.add_argument("--sample-fps", type=float, default=15.0)
    parser.add_argument("--window-sec", type=float, default=20.0)
    parser.add_argument("--step-sec", type=float, default=5.0)
    parser.add_argument("--min-bpm", type=float, default=80.0)
    parser.add_argument("--max-bpm", type=float, default=240.0)
    parser.add_argument("--top-peaks", type=int, default=2)
    parser.add_argument("--max-samples", type=int, default=240)
    parser.add_argument("--conf", type=float, default=0.20)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="0", help="YOLO device (0 for first GPU, cpu, etc.)")
    return parser.parse_args()


def clamp_box(box: np.ndarray, width: int, height: int) -> np.ndarray:
    x1, y1, x2, y2 = box.astype(float)
    x1 = min(max(x1, 0.0), max(width - 1.0, 0.0))
    y1 = min(max(y1, 0.0), max(height - 1.0, 0.0))
    x2 = min(max(x2, x1 + 1.0), float(width))
    y2 = min(max(y2, y1 + 1.0), float(height))
    return np.array([x1, y1, x2, y2], dtype=float)


def expand_box(box: np.ndarray, scale: float, width: int, height: int) -> np.ndarray:
    x1, y1, x2, y2 = box.astype(float)
    cx = (x1 + x2) / 2.0
    cy = (y1 + y2) / 2.0
    bw = (x2 - x1) * scale
    bh = (y2 - y1) * scale
    return clamp_box(np.array([cx - bw / 2.0, cy - bh / 2.0, cx + bw / 2.0, cy + bh / 2.0]), width, height)


def mask_bbox(mask: np.ndarray) -> np.ndarray:
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return np.array([np.nan, np.nan, np.nan, np.nan], dtype=float)
    return np.array([xs.min(), ys.min(), xs.max() + 1, ys.max() + 1], dtype=float)


def box_mask(shape: tuple[int, int], box: np.ndarray) -> np.ndarray:
    h, w = shape
    if not np.isfinite(box).all():
        return np.zeros(shape, dtype=bool)
    x1, y1, x2, y2 = clamp_box(box, w, h).round().astype(int)
    out = np.zeros(shape, dtype=bool)
    out[y1:y2, x1:x2] = True
    return out


def background_boxes(width: int, height: int) -> dict[str, np.ndarray]:
    return {
        "bg_top_left": np.array([0.02 * width, 0.02 * height, 0.22 * width, 0.22 * height], dtype=float),
        "bg_top_right": np.array([0.78 * width, 0.02 * height, 0.98 * width, 0.22 * height], dtype=float),
        "bg_bottom_left": np.array([0.02 * width, 0.76 * height, 0.22 * width, 0.98 * height], dtype=float),
        "bg_bottom_right": np.array([0.78 * width, 0.76 * height, 0.22 * width, 0.98 * height], dtype=float),
    }


def fast_rgb_mask(frame: np.ndarray, mask: np.ndarray) -> tuple[np.ndarray, float]:
    if mask.sum() < 30:
        return np.full(3, np.nan), 0.0
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    valid = mask & (hsv[:, :, 2] > 20) & (hsv[:, :, 2] < 245)
    if valid.sum() < 30:
        valid = mask
    pixels = frame[valid]
    if pixels.size == 0:
        return np.full(3, np.nan), 0.0
    return pixels[:, ::-1].astype(float).mean(axis=0), float(valid.sum() / max(mask.sum(), 1))


def fast_rgb_box(frame: np.ndarray, box: np.ndarray) -> tuple[np.ndarray, float]:
    h, w = frame.shape[:2]
    return fast_rgb_mask(frame, box_mask((h, w), box))


def select_animal_mask(result: Any, frame_shape: tuple[int, int, int], names: dict[int, str]) -> tuple[np.ndarray, np.ndarray, float, str]:
    h, w = frame_shape[:2]
    empty = np.zeros((h, w), dtype=bool)
    if result.masks is None or result.boxes is None or len(result.boxes) == 0:
        return empty, np.array([np.nan, np.nan, np.nan, np.nan], dtype=float), 0.0, ""

    cls = result.boxes.cls.detach().cpu().numpy().astype(int)
    conf = result.boxes.conf.detach().cpu().numpy().astype(float)
    boxes = result.boxes.xyxy.detach().cpu().numpy().astype(float)
    mask_data = result.masks.data.detach().cpu().numpy()
    candidates: list[tuple[float, int]] = []
    for idx, class_id in enumerate(cls):
        name = str(names.get(int(class_id), class_id)).lower()
        if name in ANIMAL_NAMES:
            area = max((boxes[idx, 2] - boxes[idx, 0]) * (boxes[idx, 3] - boxes[idx, 1]), 1.0)
            candidates.append((float(conf[idx] * math.sqrt(area)), idx))
    if not candidates:
        return empty, np.array([np.nan, np.nan, np.nan, np.nan], dtype=float), 0.0, ""

    idx = max(candidates)[1]
    raw_mask = mask_data[idx]
    if raw_mask.shape != (h, w):
        raw_mask = cv2.resize(raw_mask.astype(float), (w, h), interpolation=cv2.INTER_LINEAR)
    mask = raw_mask > 0.5
    return mask, clamp_box(boxes[idx], w, h), float(conf[idx]), str(names.get(int(cls[idx]), cls[idx])).lower()


def build_seg_roi_masks(mask: np.ndarray, face_box: np.ndarray) -> dict[str, np.ndarray]:
    h, w = mask.shape
    bbox = mask_bbox(mask)
    out = {roi.id: np.zeros_like(mask, dtype=bool) for roi in SEG_ROIS}
    if not np.isfinite(bbox).all() or mask.sum() < 30:
        return out
    x1, y1, x2, y2 = bbox
    mx = (x1 + x2) / 2.0
    my = (y1 + y2) / 2.0
    face = box_mask(mask.shape, expand_box(face_box, 1.15, w, h)) if np.isfinite(face_box).all() else np.zeros_like(mask)

    out["animal_full"] = mask.copy()
    out["animal_non_face"] = mask & ~face
    out["animal_face_intersection"] = mask & face

    if np.isfinite(face_box).all():
        fx1, fy1, fx2, fy2 = face_box
        bw = fx2 - fx1
        lower = box_mask(mask.shape, np.array([fx1 - bw * 0.65, fy2 - bw * 0.08, fx2 + bw * 0.65, fy2 + bw * 1.4]))
        out["mask_neck_chest"] = mask & lower
    else:
        out["mask_neck_chest"] = mask & (np.indices(mask.shape)[0] >= my)

    yy, xx = np.indices(mask.shape)
    out["mask_upper_body"] = mask & (yy >= my - (y2 - y1) * 0.10) & (yy <= my + (y2 - y1) * 0.25)
    out["mask_lower_body"] = mask & (yy > my + (y2 - y1) * 0.10)
    out["mask_left_body"] = mask & (xx < mx) & ~face
    out["mask_right_body"] = mask & (xx >= mx) & ~face
    return out


def resized_mask_gray(frame: np.ndarray, mask: np.ndarray, size: int = 32) -> np.ndarray | None:
    if mask.sum() < 30:
        return None
    box = mask_bbox(mask).round().astype(int)
    x1, y1, x2, y2 = box
    crop = frame[y1:y2, x1:x2]
    crop_mask = mask[y1:y2, x1:x2]
    if crop.size == 0 or crop_mask.sum() < 30:
        return None
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY).astype(float)
    gray[~crop_mask] = np.nanmean(gray[crop_mask])
    return cv2.resize(gray / 255.0, (size, size), interpolation=cv2.INTER_AREA)


def extract_seg_traces(video_path: Path, cache: dict[str, np.ndarray], model: Any, args: argparse.Namespace) -> dict[str, Any]:
    times = cache["times"].astype(float)
    face_boxes = cache["boxes"].astype(float)
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

    rgb_by_roi = {roi.id: np.full((len(times), 3), np.nan, dtype=float) for roi in SEG_ROIS}
    valid_by_roi = {roi.id: np.full(len(times), np.nan, dtype=float) for roi in SEG_ROIS}
    motion_by_roi = {roi.id: np.full(len(times), np.nan, dtype=float) for roi in SEG_ROIS}
    prev_gray: dict[str, np.ndarray] = {}
    bg_rgb = np.full((len(times), 3), np.nan, dtype=float)
    bg_motion = np.full(len(times), np.nan, dtype=float)
    prev_bg_gray: np.ndarray | None = None
    mask_area = np.full(len(times), np.nan, dtype=float)
    mask_conf = np.full(len(times), np.nan, dtype=float)
    mask_detected = np.full(len(times), np.nan, dtype=float)
    mask_center = np.full((len(times), 2), np.nan, dtype=float)
    mask_box_rows = np.full((len(times), 4), np.nan, dtype=float)
    mask_class = np.array([""] * len(times), dtype=object)

    frame_index = 0
    names = {int(k): str(v) for k, v in model.names.items()}
    while wanted:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_index not in wanted:
            frame_index += 1
            continue
        sample_idx = target_to_sample[frame_index]
        pred = model.predict(frame, conf=args.conf, imgsz=args.imgsz, device=args.device, verbose=False)[0]
        animal_mask, animal_box, conf, cls_name = select_animal_mask(pred, frame.shape, names)
        if animal_mask.sum() > 30:
            mask_detected[sample_idx] = 1.0
            mask_conf[sample_idx] = conf
            mask_area[sample_idx] = float(animal_mask.mean())
            mask_box_rows[sample_idx] = animal_box
            mask_class[sample_idx] = cls_name
            ys, xs = np.where(animal_mask)
            mask_center[sample_idx] = [float(xs.mean()), float(ys.mean())]
        roi_masks = build_seg_roi_masks(animal_mask, face_boxes[sample_idx, :4])
        for roi in SEG_ROIS:
            roi_mask = roi_masks[roi.id]
            rgb, valid_fraction = fast_rgb_mask(frame, roi_mask)
            rgb_by_roi[roi.id][sample_idx] = rgb
            valid_by_roi[roi.id][sample_idx] = valid_fraction * float(roi_mask.sum() / max(animal_mask.sum(), 1))
            gray = resized_mask_gray(frame, roi_mask)
            if gray is not None:
                if roi.id in prev_gray:
                    motion_by_roi[roi.id][sample_idx] = float(np.nanmean(np.abs(gray - prev_gray[roi.id])))
                prev_gray[roi.id] = gray

        bg_values = []
        bg_grays = []
        h, w = frame.shape[:2]
        for box in background_boxes(w, h).values():
            box = clamp_box(box, w, h)
            rgb, _ = fast_rgb_box(frame, box)
            if np.isfinite(rgb).all():
                bg_values.append(rgb)
            x1, y1, x2, y2 = box.round().astype(int)
            crop = frame[y1:y2, x1:x2]
            if crop.size:
                gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                bg_grays.append(cv2.resize(gray.astype(float) / 255.0, (32, 32), interpolation=cv2.INTER_AREA))
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
        "face_boxes": face_boxes,
        "rgb_by_roi": rgb_by_roi,
        "valid_by_roi": valid_by_roi,
        "motion_by_roi": motion_by_roi,
        "background_rgb": bg_rgb,
        "background_motion": bg_motion,
        "mask_area": mask_area,
        "mask_conf": mask_conf,
        "mask_detected": mask_detected,
        "mask_center": mask_center,
        "mask_boxes": mask_box_rows,
        "mask_class": mask_class,
    }


def save_extracted(path: Path, extracted: dict[str, Any]) -> None:
    payload: dict[str, np.ndarray] = {
        "times": extracted["times"],
        "face_boxes": extracted["face_boxes"],
        "background_rgb": extracted["background_rgb"],
        "background_motion": extracted["background_motion"],
        "mask_area": extracted["mask_area"],
        "mask_conf": extracted["mask_conf"],
        "mask_detected": extracted["mask_detected"],
        "mask_center": extracted["mask_center"],
        "mask_boxes": extracted["mask_boxes"],
        "mask_class": extracted["mask_class"],
    }
    for roi in SEG_ROIS:
        payload[f"rgb__{roi.id}"] = extracted["rgb_by_roi"][roi.id]
        payload[f"valid__{roi.id}"] = extracted["valid_by_roi"][roi.id]
        payload[f"motion__{roi.id}"] = extracted["motion_by_roi"][roi.id]
    path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(path, **payload)


def load_extracted(path: Path) -> dict[str, Any]:
    data = np.load(path, allow_pickle=True)
    return {
        "times": data["times"],
        "face_boxes": data["face_boxes"],
        "background_rgb": data["background_rgb"],
        "background_motion": data["background_motion"],
        "mask_area": data["mask_area"],
        "mask_conf": data["mask_conf"],
        "mask_detected": data["mask_detected"],
        "mask_center": data["mask_center"],
        "mask_boxes": data["mask_boxes"],
        "mask_class": data["mask_class"],
        "rgb_by_roi": {roi.id: data[f"rgb__{roi.id}"] for roi in SEG_ROIS},
        "valid_by_roi": {roi.id: data[f"valid__{roi.id}"] for roi in SEG_ROIS},
        "motion_by_roi": {roi.id: data[f"motion__{roi.id}"] for roi in SEG_ROIS},
    }


def interp_scalar(times: np.ndarray, values: np.ndarray, uniform_t: np.ndarray) -> np.ndarray:
    values = np.asarray(values, dtype=float)
    good = np.isfinite(values)
    if good.sum() < 4 or len(uniform_t) == 0:
        return np.zeros(len(uniform_t), dtype=float)
    return np.interp(uniform_t, times[good], values[good])


def regress_out(signal: np.ndarray, nuisance_columns: list[np.ndarray]) -> np.ndarray:
    y = np.asarray(signal, dtype=float)
    if len(y) < 16:
        return y
    cols = []
    for col in nuisance_columns:
        c = np.asarray(col, dtype=float)
        c = np.nan_to_num(c, nan=np.nanmedian(c[np.isfinite(c)]) if np.isfinite(c).any() else 0.0)
        if len(c) != len(y) or np.nanstd(c) < 1e-9:
            continue
        cols.append((c - np.nanmean(c)) / (np.nanstd(c) + 1e-9))
    if not cols:
        return y
    x = np.column_stack([np.ones(len(y)), *cols])
    good = np.isfinite(y) & np.isfinite(x).all(axis=1)
    if good.sum() < len(cols) + 8:
        return y
    beta, *_ = np.linalg.lstsq(x[good], y[good], rcond=None)
    return y - x @ beta + float(np.nanmean(y[good]))


def range_error_for(pred: float, bpm_min: float, bpm_max: float) -> tuple[float, bool]:
    if not np.isfinite(pred):
        return np.nan, False
    if pred < bpm_min:
        return float(bpm_min - pred), False
    if pred > bpm_max:
        return float(pred - bpm_max), False
    return 0.0, True


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
    if bool(row.get("artifact_100bpm", False)):
        return "100bpm_artifact"
    if float(row.get("mask_valid_fraction", 0.0) or 0.0) < 0.08:
        return "low_mask_support"
    if float(row.get("mask_area_change", 0.0) or 0.0) > 0.45:
        return "segmentation_unstable"
    if max(
        float(row.get("roi_motion_coherence", 0.0) or 0.0),
        float(row.get("bg_motion_coherence", 0.0) or 0.0),
        float(row.get("mask_motion_coherence", 0.0) or 0.0),
    ) >= 0.65:
        return "motion_locked_peak"
    return "stable_mask_roi"


def evaluate_video(video_row: pd.Series, model: Any, args: argparse.Namespace) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    video = str(video_row["video"])
    stem = Path(video).stem
    video_path = Path(str(video_row["path"]))
    cache_path = args.single_view_dir / "cache" / f"{stem}_candidate_traces.npz"
    if not cache_path.exists():
        return [], {}
    print(f"[seg-roi] {video}", flush=True)
    npz = np.load(cache_path, allow_pickle=True)
    cache = {key: npz[key] for key in npz.files}
    seg_cache = args.out_dir / "cache" / f"{stem}_segmentation_traces_v2_{args.max_samples}.npz"
    if seg_cache.exists():
        extracted = load_extracted(seg_cache)
    else:
        extracted = extract_seg_traces(video_path, cache, model, args)
        save_extracted(seg_cache, extracted)

    times = extracted["times"]
    uniform_t, _ = interpolate_rgb(times, extracted["rgb_by_roi"]["animal_full"], args.sample_fps)
    if len(uniform_t) < int(args.window_sec * args.sample_fps):
        return [], {}

    bg_t, bg_rgb = interpolate_rgb(times, extracted["background_rgb"], args.sample_fps)
    if len(bg_t):
        bg_rgb = np.column_stack([np.interp(uniform_t, bg_t, bg_rgb[:, ch]) for ch in range(3)])
    else:
        bg_rgb = np.full((len(uniform_t), 3), np.nan)
    bg_motion = interp_scalar(times, extracted["background_motion"], uniform_t)
    mask_area = interp_scalar(times, extracted["mask_area"], uniform_t)
    mask_detected = interp_scalar(times, extracted["mask_detected"], uniform_t)
    mask_area_change = np.zeros(len(uniform_t), dtype=float)
    mask_area_change[1:] = np.abs(np.diff(mask_area)) / np.maximum(mask_area[1:], 1e-6)
    center = extracted["mask_center"].astype(float)
    cx = interp_scalar(times, center[:, 0], uniform_t)
    cy = interp_scalar(times, center[:, 1], uniform_t)
    mask_motion = np.zeros(len(uniform_t), dtype=float)
    mask_motion[1:] = np.sqrt(np.diff(cx) ** 2 + np.diff(cy) ** 2) / 500.0
    bg_brightness = np.nanmean(bg_rgb, axis=1)
    bg_brightness = np.nan_to_num(bg_brightness, nan=np.nanmedian(bg_brightness[np.isfinite(bg_brightness)]) if np.isfinite(bg_brightness).any() else 0.0)

    bpm_min = float(video_row["bpm_min"])
    bpm_max = float(video_row["bpm_max"])
    bpm_target = float(video_row["bpm_target"])
    win = int(round(args.window_sec * args.sample_fps))
    step = int(round(args.step_sec * args.sample_fps))
    rows: list[dict[str, Any]] = []
    roi_by_id = {roi.id: roi for roi in SEG_ROIS}

    roi_uniform: dict[str, dict[str, np.ndarray]] = {}
    for roi in SEG_ROIS:
        rt, rr = interpolate_rgb(times, extracted["rgb_by_roi"][roi.id], args.sample_fps)
        if len(rt) == 0:
            continue
        rr = np.column_stack([np.interp(uniform_t, rt, rr[:, ch]) for ch in range(3)])
        roi_uniform[roi.id] = {
            "rgb": rr,
            "valid": interp_scalar(times, extracted["valid_by_roi"][roi.id], uniform_t),
            "motion": interp_scalar(times, extracted["motion_by_roi"][roi.id], uniform_t),
        }

    for window_index, start in enumerate(range(0, len(uniform_t) - win + 1, step)):
        end = start + win
        start_sec = float(uniform_t[start])
        end_sec = float(uniform_t[end - 1])
        bg_motion_win = bg_motion[start:end]
        mask_motion_win = mask_motion[start:end]
        mask_area_change_win = mask_area_change[start:end]
        mask_valid_win = mask_detected[start:end]
        bg_brightness_win = bg_brightness[start:end]
        for roi_id, values in roi_uniform.items():
            roi = roi_by_id[roi_id]
            rgb = values["rgb"][start:end]
            valid = values["valid"][start:end]
            roi_motion = values["motion"][start:end]
            if len(rgb) < win or not np.isfinite(rgb).all() or np.min(np.nanmean(rgb, axis=0)) <= 1:
                continue
            valid_fraction = float(np.nanmedian(valid[np.isfinite(valid)])) if np.isfinite(valid).any() else 0.0
            if valid_fraction < 0.02:
                continue
            roi_motion_median = float(np.nanmedian(roi_motion[np.isfinite(roi_motion)])) if np.isfinite(roi_motion).any() else 0.0
            color_cv = float(np.nanmean(np.nanstd(rgb, axis=0) / (np.nanmean(rgb, axis=0) + 1e-9)))
            for method in METHODS:
                try:
                    pulse_raw = METHOD_FUNCTIONS[method](rgb, args.sample_fps, args.min_bpm, args.max_bpm)
                except Exception:
                    continue
                variants = {
                    "raw": pulse_raw,
                    "bg_motion_residual": regress_out(pulse_raw, [roi_motion, mask_motion_win, bg_motion_win, bg_brightness_win]),
                }
                for preprocess, pulse in variants.items():
                    for peak in spectrum_peaks(pulse, args.sample_fps, args.min_bpm, args.max_bpm, args.top_peaks):
                        pred = float(peak["peak_bpm"])
                        range_error, within_range = range_error_for(pred, bpm_min, bpm_max)
                        roi_coh, roi_motion_peak = coherence_to_peak(roi_motion, pred, args.sample_fps, args.min_bpm, args.max_bpm)
                        bg_coh, bg_motion_peak = coherence_to_peak(bg_motion_win, pred, args.sample_fps, args.min_bpm, args.max_bpm)
                        mask_coh, mask_motion_peak = coherence_to_peak(mask_motion_win, pred, args.sample_fps, args.min_bpm, args.max_bpm)
                        row: dict[str, Any] = {
                            "video": video,
                            "window_index": window_index,
                            "window_start_sec": round(start_sec, 3),
                            "window_end_sec": round(end_sec, 3),
                            "roi_id": roi_id,
                            "roi_label": roi.label,
                            "roi_kind": roi.kind,
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
                            "box_motion": round(float(np.nanmedian(mask_motion_win)), 6),
                            "color_cv": round(color_cv, 6),
                            "roi_motion": round(roi_motion_median, 6),
                            "mask_valid_fraction": round(float(np.nanmedian(mask_valid_win)), 4),
                            "mask_area": round(float(np.nanmedian(mask_area[start:end])), 6),
                            "mask_area_change": round(float(np.nanmedian(mask_area_change_win)), 6),
                            "roi_motion_coherence": round(roi_coh, 3),
                            "bg_motion_coherence": round(bg_coh, 3),
                            "mask_motion_coherence": round(mask_coh, 3),
                            "roi_motion_peak_bpm": round(roi_motion_peak, 3) if np.isfinite(roi_motion_peak) else "",
                            "bg_motion_peak_bpm": round(bg_motion_peak, 3) if np.isfinite(bg_motion_peak) else "",
                            "mask_motion_peak_bpm": round(mask_motion_peak, 3) if np.isfinite(mask_motion_peak) else "",
                            "artifact_100bpm": bool(95.0 <= pred <= 105.0),
                        }
                        row["artifact_state"] = artifact_state(row)
                        base = quality_score(row)
                        motion_penalty = 1.2 * max(roi_coh, bg_coh, mask_coh)
                        mask_penalty = 0.9 * max(0.0, 0.20 - valid_fraction)
                        state_penalty = {
                            "100bpm_artifact": 0.7,
                            "low_mask_support": 0.9,
                            "segmentation_unstable": 0.55,
                            "motion_locked_peak": 0.45,
                            "stable_mask_roi": 0.0,
                        }.get(row["artifact_state"], 0.0)
                        body_bonus = 0.18 if roi.kind == "mask_body" else 0.0
                        residual_bonus = 0.18 if preprocess != "raw" else 0.0
                        row["quality_score"] = round(float(base), 6)
                        row["segmentation_score"] = round(float(base - motion_penalty - mask_penalty - state_penalty + body_bonus + residual_bonus), 6)
                        rows.append(row)

    stats = {
        "video": video,
        "samples": int(len(times)),
        "uniform_samples": int(len(uniform_t)),
        "windows": int(max(0, math.floor((len(uniform_t) - win) / step) + 1)),
        "mask_detected_pct": round(float(np.nanmean(extracted["mask_detected"]) * 100.0), 2),
        "median_mask_conf": round(float(np.nanmedian(extracted["mask_conf"][np.isfinite(extracted["mask_conf"])])), 3)
        if np.isfinite(extracted["mask_conf"]).any()
        else "",
        "median_mask_area_pct": round(float(np.nanmedian(extracted["mask_area"][np.isfinite(extracted["mask_area"])]) * 100.0), 2)
        if np.isfinite(extracted["mask_area"]).any()
        else "",
        "classes": ", ".join(sorted(set(str(x) for x in extracted["mask_class"] if str(x)))),
    }
    return rows, stats


def numeric_series(df: pd.DataFrame, col: str) -> np.ndarray:
    return pd.to_numeric(df[col], errors="coerce").to_numpy(dtype=float)


def weighted_prediction(group: pd.DataFrame) -> float:
    values = numeric_series(group, "peak_bpm")
    scores = numeric_series(group, "segmentation_score")
    good = np.isfinite(values) & np.isfinite(scores)
    if good.sum() == 0:
        return np.nan
    values = values[good]
    scores = scores[good]
    weights = np.clip(scores - np.nanmin(scores) + 0.05, 0.05, None)
    return weighted_median(values, weights)


def select_per_window(candidates: pd.DataFrame, selector: str) -> pd.DataFrame:
    frame = candidates.copy()
    if selector == "oracle_segmentation_window":
        frame["_oracle_error"] = numeric_series(frame, "range_error")
        target_error = numeric_series(frame, "target_abs_error")
        frame["_oracle_error"] = np.where(np.isfinite(frame["_oracle_error"]), frame["_oracle_error"], target_error)
        return (
            frame.sort_values(["video", "window_index", "_oracle_error", "target_abs_error", "segmentation_score"], ascending=[True, True, True, True, False])
            .groupby(["video", "window_index"], as_index=False)
            .head(1)
        )
    if selector == "segmentation_sqi":
        subset = frame
    elif selector == "segmentation_body_sqi":
        subset = frame[frame["roi_kind"] == "mask_body"]
    elif selector == "segmentation_non_face_sqi":
        subset = frame[frame["roi_id"].isin(["animal_non_face", "mask_neck_chest", "mask_upper_body", "mask_lower_body"])]
    elif selector == "segmentation_stable_sqi":
        subset = frame[frame["artifact_state"] == "stable_mask_roi"]
    else:
        subset = frame
    if subset.empty:
        return subset
    return (
        subset.sort_values(["video", "window_index", "segmentation_score"], ascending=[True, True, False])
        .groupby(["video", "window_index"], as_index=False)
        .head(1)
    )


def summarize(candidates: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    selectors = [
        "oracle_segmentation_window",
        "segmentation_sqi",
        "segmentation_body_sqi",
        "segmentation_non_face_sqi",
        "segmentation_stable_sqi",
    ]
    summary_rows = []
    prediction_rows = []
    for selector in selectors:
        selected = select_per_window(candidates, selector)
        if selected.empty:
            continue
        video_rows = []
        for video, group in selected.groupby("video"):
            first = group.iloc[0]
            pred = weighted_prediction(group)
            range_error, within_range = range_error_for(pred, float(first["bpm_min"]), float(first["bpm_max"]))
            video_rows.append(
                {
                    "selector": selector,
                    "video": video,
                    "pred_bpm": pred,
                    "target_abs_error": abs(pred - float(first["bpm_target"])) if np.isfinite(pred) else np.nan,
                    "range_error": range_error,
                    "within_range": within_range,
                    "windows": int(len(group)),
                    "body_window_share": float((group["roi_kind"] == "mask_body").mean()),
                    "residual_window_share": float((group["preprocess"] != "raw").mean()),
                    "stable_window_share": float((group["artifact_state"] == "stable_mask_roi").mean()),
                    "artifact_100bpm_window_share": float(group["artifact_100bpm"].mean()),
                    "top_roi": str(group["roi_id"].mode().iloc[0]) if not group["roi_id"].mode().empty else "",
                    "top_state": str(group["artifact_state"].mode().iloc[0]) if not group["artifact_state"].mode().empty else "",
                }
            )
        pred_df = pd.DataFrame(video_rows)
        summary_rows.append(
            {
                "selector": selector,
                "n": int(len(pred_df)),
                "target_mae": round(float(np.nanmean(pred_df["target_abs_error"])), 3),
                "target_rmse": round(float(np.sqrt(np.nanmean(np.square(pred_df["target_abs_error"])))), 3),
                "range_mae": round(float(np.nanmean(pred_df["range_error"])), 3),
                "within_range_pct": round(float(np.mean(pred_df["within_range"]) * 100.0), 2),
                "body_window_share": round(float(np.nanmedian(pred_df["body_window_share"]) * 100.0), 2),
                "residual_window_share": round(float(np.nanmedian(pred_df["residual_window_share"]) * 100.0), 2),
                "stable_window_share": round(float(np.nanmedian(pred_df["stable_window_share"]) * 100.0), 2),
                "artifact_100bpm_window_share": round(float(np.nanmedian(pred_df["artifact_100bpm_window_share"]) * 100.0), 2),
            }
        )
        for row in video_rows:
            prediction_rows.append(
                {
                    **row,
                    "pred_bpm": round(float(row["pred_bpm"]), 3) if np.isfinite(row["pred_bpm"]) else "",
                    "target_abs_error": round(float(row["target_abs_error"]), 3) if np.isfinite(row["target_abs_error"]) else "",
                    "range_error": round(float(row["range_error"]), 3) if np.isfinite(row["range_error"]) else "",
                    "body_window_share": round(float(row["body_window_share"]) * 100.0, 2),
                    "residual_window_share": round(float(row["residual_window_share"]) * 100.0, 2),
                    "stable_window_share": round(float(row["stable_window_share"]) * 100.0, 2),
                    "artifact_100bpm_window_share": round(float(row["artifact_100bpm_window_share"]) * 100.0, 2),
                }
            )
    return (
        pd.DataFrame(summary_rows).sort_values(["range_mae", "target_mae"], na_position="last"),
        pd.DataFrame(prediction_rows),
    )


def table(df: pd.DataFrame) -> str:
    if df.empty:
        return "No rows."
    frame = df.fillna("")
    headers = [str(col) for col in frame.columns]
    rows = [[str(value) for value in row] for row in frame.to_numpy()]
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    lines.extend("| " + " | ".join(row) + " |" for row in rows)
    return "\n".join(lines)


def write_plots(summary: pd.DataFrame, predictions: pd.DataFrame, args: argparse.Namespace) -> None:
    if not summary.empty:
        fig, ax = plt.subplots(figsize=(9.5, 4.5))
        ordered = summary.sort_values("range_mae")
        ax.bar([x.replace("_", "\n") for x in ordered["selector"]], ordered["range_mae"].astype(float), color="#6798d0")
        ax.set_ylabel("Range MAE (bpm)")
        ax.set_title("YOLO Animal Segmentation ROI Selectors")
        ax.tick_params(axis="x", labelsize=8)
        ax.grid(axis="y", alpha=0.25)
        fig.tight_layout()
        fig.savefig(args.out_dir / "segmentation_selector_summary.png", dpi=180)
        plt.close(fig)
    if not predictions.empty:
        fig, ax = plt.subplots(figsize=(10, 5))
        for selector, group in predictions.groupby("selector"):
            if selector not in {"oracle_segmentation_window", "segmentation_sqi", "segmentation_body_sqi"}:
                continue
            ax.plot(range(len(group)), pd.to_numeric(group["pred_bpm"], errors="coerce"), marker="o", label=selector.replace("_", " "))
        videos = sorted(predictions["video"].unique(), key=natural_sort_key)
        ax.set_xticks(range(len(videos)))
        ax.set_xticklabels(videos)
        ax.set_ylabel("Predicted BPM")
        ax.set_title("Segmentation ROI Per-Video Predictions")
        ax.legend(fontsize=8)
        ax.grid(alpha=0.25)
        fig.tight_layout()
        fig.savefig(args.out_dir / "segmentation_predictions.png", dpi=180)
        plt.close(fig)


def write_report(summary: pd.DataFrame, predictions: pd.DataFrame, stats: pd.DataFrame, args: argparse.Namespace) -> None:
    lines = [
        "# YOLO Animal Segmentation ROI rPPG Evaluation",
        "",
        "This run uses a pretrained YOLO segmentation model to restrict RGB extraction to detected dog/cat masks before rPPG candidate generation.",
        "",
        "## Selector Summary",
        "",
        table(summary),
        "",
        "## Per-Video Predictions",
        "",
        table(predictions.sort_values(["selector", "video"]) if not predictions.empty else predictions),
        "",
        "## Segmentation Stats",
        "",
        table(stats),
    ]
    (args.out_dir / "segmentation_roi_report.md").write_text("\n".join(lines), encoding="utf-8")


def write_ui_data(summary: pd.DataFrame, predictions: pd.DataFrame, stats: pd.DataFrame, args: argparse.Namespace) -> None:
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "setup": {
            "labelsCsv": args.labels_csv.as_posix(),
            "singleViewDir": args.single_view_dir.as_posix(),
            "segModel": args.seg_model.as_posix(),
            "outDir": args.out_dir.as_posix(),
            "sampleFps": args.sample_fps,
            "windowSec": args.window_sec,
            "stepSec": args.step_sec,
            "maxSamples": args.max_samples,
            "animalClasses": sorted(ANIMAL_NAMES),
            "rois": [roi.id for roi in SEG_ROIS],
            "interpretation": "Uses real animal segmentation masks from YOLO. HR labels are still sparse OCR ranges, so non-oracle rows are heuristic checks.",
        },
        "assets": {
            "reportUrl": existing_vite_url(args.out_dir / "segmentation_roi_report.md"),
            "summaryCsvUrl": existing_vite_url(args.out_dir / "segmentation_summary.csv"),
            "predictionsCsvUrl": existing_vite_url(args.out_dir / "segmentation_predictions.csv"),
            "candidatesCsvUrl": existing_vite_url(args.out_dir / "segmentation_candidates.csv"),
            "selectorPlotUrl": existing_vite_url(args.out_dir / "segmentation_selector_summary.png"),
            "predictionPlotUrl": existing_vite_url(args.out_dir / "segmentation_predictions.png"),
        },
        "summary": rows_for_ui(summary),
        "predictions": rows_for_ui(predictions),
        "stats": rows_for_ui(stats),
    }
    args.ui_data.parent.mkdir(parents=True, exist_ok=True)
    args.ui_data.write_text(
        "export const RPPG_SEGMENTATION_ROI = " + json.dumps(payload, indent=2, ensure_ascii=False) + " as const;\n",
        encoding="utf-8",
    )


def main() -> None:
    warnings.filterwarnings("ignore")
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("YOLO_CONFIG_DIR", str(Path.cwd()))
    from ultralytics import YOLO

    model = YOLO(str(args.seg_model))
    print(f"[device] segmentation YOLO device: {args.device}")
    labels = pd.read_csv(args.labels_csv)
    usable = labels[labels["usable"].astype(str).str.lower() == "true"].copy()
    all_rows: list[dict[str, Any]] = []
    stats_rows: list[dict[str, Any]] = []
    for _, row in usable.sort_values("video", key=lambda s: s.map(natural_sort_key)).iterrows():
        rows, stats = evaluate_video(row, model, args)
        all_rows.extend(rows)
        if stats:
            stats_rows.append(stats)
        print(f"[seg-roi] accumulated candidates: {len(all_rows)}", flush=True)
    candidates = pd.DataFrame(all_rows)
    stats = pd.DataFrame(stats_rows)
    if candidates.empty:
        raise RuntimeError("No segmentation candidates were generated.")
    summary, predictions = summarize(candidates)
    candidates.to_csv(args.out_dir / "segmentation_candidates.csv", index=False)
    summary.to_csv(args.out_dir / "segmentation_summary.csv", index=False)
    predictions.to_csv(args.out_dir / "segmentation_predictions.csv", index=False)
    stats.to_csv(args.out_dir / "segmentation_stats.csv", index=False)
    write_plots(summary, predictions, args)
    write_report(summary, predictions, stats, args)
    write_ui_data(summary, predictions, stats, args)
    print(f"Wrote segmentation ROI artifacts to {args.out_dir}")


if __name__ == "__main__":
    main()
