from __future__ import annotations

import argparse
import json
import math
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import pandas as pd

from evaluate_rppg_methods import METHOD_FUNCTIONS, estimate_bpm_from_signal, safe_bandpass
from evaluate_single_view_sqi import existing_vite_url, rows_for_ui


ROI_SPECS = [
    {"roi": "eyes", "label": "Eyes", "keypoints": ["left_eye", "right_eye"], "radius": 10, "kind": "face"},
    {"roi": "nose", "label": "Nose bridge", "keypoints": ["nose"], "radius": 12, "kind": "face"},
    {"roi": "earbases", "label": "Ear bases", "keypoints": ["left_earbase", "right_earbase"], "radius": 13, "kind": "face"},
    {"roi": "neck", "label": "Neck", "keypoints": ["neck_base", "neck_end"], "radius": 18, "kind": "body"},
    {"roi": "throat", "label": "Throat", "keypoints": ["throat_base", "throat_end"], "radius": 16, "kind": "body"},
    {
        "roi": "upper_body",
        "label": "Upper body",
        "keypoints": ["body_middle_left", "body_middle_right", "back_middle"],
        "radius": 24,
        "kind": "body",
    },
    {
        "roi": "mouth_artifact",
        "label": "Mouth artifact",
        "keypoints": ["mouth_end_left", "mouth_end_right", "upper_jaw", "lower_jaw"],
        "radius": 13,
        "kind": "artifact",
    },
    {
        "roi": "front_paw_artifact",
        "label": "Front paw artifact",
        "keypoints": ["front_left_paw", "front_right_paw"],
        "radius": 16,
        "kind": "artifact",
    },
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate rPPG probe signals from DLC pet keypoint ROIs.")
    parser.add_argument("--video", type=Path, default=Path("reports/rppg_pet_keypoints/dlc_probe_30s/4_dlc_probe.mp4"))
    parser.add_argument("--keypoints-csv", type=Path, default=Path("reports/rppg_pet_keypoints/pet_keypoints_normalized.csv"))
    parser.add_argument("--labels-csv", type=Path, default=Path("dataset_front/video_labels_ocr.csv"))
    parser.add_argument("--source-video", default="4.mp4")
    parser.add_argument("--out-dir", type=Path, default=Path("reports/rppg_dlc_keypoint_roi_probe"))
    parser.add_argument("--ui-data", type=Path, default=Path("ui/src/generated/rppgDlcKeypointRoiProbe.ts"))
    parser.add_argument("--yolo-model", type=Path, default=Path("yolo11n-seg.pt"))
    parser.add_argument("--min-conf", type=float, default=0.45)
    parser.add_argument("--min-bpm", type=float, default=70.0)
    parser.add_argument("--max-bpm", type=float, default=135.0)
    parser.add_argument("--disable-yolo-mask", action="store_true")
    parser.add_argument("--device", default="0", help="YOLO device (0, cuda, cpu, etc.)")
    return parser.parse_args()


def load_target(labels_csv: Path, source_video: str) -> dict[str, float]:
    labels = pd.read_csv(labels_csv)
    row = labels.loc[labels["video"].astype(str) == source_video]
    if row.empty:
        return {"bpm_min": math.nan, "bpm_max": math.nan, "bpm_target": math.nan}
    first = row.iloc[0]
    return {
        "bpm_min": float(first["bpm_min"]),
        "bpm_max": float(first["bpm_max"]),
        "bpm_target": float(first["bpm_target"]),
    }


def read_video_frames(video: Path) -> tuple[list[np.ndarray], float]:
    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        raise RuntimeError(f"Could not open {video}")
    fps = float(cap.get(cv2.CAP_PROP_FPS) or 5.0)
    frames: list[np.ndarray] = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frames.append(frame)
    cap.release()
    if not frames:
        raise RuntimeError(f"No frames in {video}")
    return frames, fps


def load_yolo_model(model_path: Path, disabled: bool) -> Any | None:
    if disabled:
        return None
    try:
        from ultralytics import YOLO
    except ImportError:
        return None
    if not model_path.exists():
        return None
    return YOLO(str(model_path))


def animal_mask_for_frame(model: Any | None, frame: np.ndarray, device: str = "0") -> tuple[np.ndarray, float]:
    h, w = frame.shape[:2]
    if model is None:
        return np.ones((h, w), dtype=bool), math.nan
    result = model.predict(frame, imgsz=640, device=device, verbose=False)[0]
    if result.masks is None or result.boxes is None or len(result.boxes) == 0:
        return np.zeros((h, w), dtype=bool), math.nan
    cls = result.boxes.cls.detach().cpu().numpy().astype(int)
    conf = result.boxes.conf.detach().cpu().numpy().astype(float)
    masks = result.masks.data.detach().cpu().numpy() > 0.5
    animal = np.isin(cls, [15, 16])
    if not animal.any():
        animal = np.ones_like(cls, dtype=bool)
    selected = masks[animal]
    selected_conf = conf[animal]
    if selected.size == 0:
        return np.zeros((h, w), dtype=bool), math.nan
    combined = np.any(selected, axis=0).astype(np.uint8)
    if combined.shape != (h, w):
        combined = cv2.resize(combined, (w, h), interpolation=cv2.INTER_NEAREST)
    return combined.astype(bool), float(np.nanmax(selected_conf)) if selected_conf.size else math.nan


def frame_keypoints(keypoints: pd.DataFrame, frame_idx: int, min_conf: float) -> pd.DataFrame:
    frame = keypoints.loc[keypoints["frame_index"].astype(int) == frame_idx].copy()
    frame["confidence"] = pd.to_numeric(frame["confidence"], errors="coerce")
    frame["x"] = pd.to_numeric(frame["x"], errors="coerce")
    frame["y"] = pd.to_numeric(frame["y"], errors="coerce")
    return frame.loc[(frame["confidence"] >= min_conf) & frame["x"].notna() & frame["y"].notna()]


def roi_center(frame_kps: pd.DataFrame, spec: dict[str, Any]) -> tuple[float, float, float] | None:
    selected = frame_kps.loc[frame_kps["keypoint"].isin(spec["keypoints"])]
    if selected.empty:
        return None
    weights = selected["confidence"].to_numpy(dtype=float)
    if float(np.nansum(weights)) <= 0:
        return None
    x = float(np.average(selected["x"].to_numpy(dtype=float), weights=weights))
    y = float(np.average(selected["y"].to_numpy(dtype=float), weights=weights))
    conf = float(np.nanmedian(weights))
    return x, y, conf


def extract_patch_rgb(frame: np.ndarray, mask: np.ndarray, center: tuple[float, float], radius: int) -> tuple[np.ndarray, int]:
    h, w = frame.shape[:2]
    cx = int(round(center[0]))
    cy = int(round(center[1]))
    x0, x1 = max(0, cx - radius), min(w, cx + radius + 1)
    y0, y1 = max(0, cy - radius), min(h, cy + radius + 1)
    if x1 <= x0 or y1 <= y0:
        return np.array([math.nan, math.nan, math.nan]), 0
    yy, xx = np.ogrid[y0:y1, x0:x1]
    circle = (xx - cx) ** 2 + (yy - cy) ** 2 <= radius**2
    patch_mask = circle & mask[y0:y1, x0:x1]
    if int(patch_mask.sum()) < 8:
        return np.array([math.nan, math.nan, math.nan]), int(patch_mask.sum())
    pixels = frame[y0:y1, x0:x1][patch_mask]
    bgr = pixels.mean(axis=0)
    return np.array([bgr[2], bgr[1], bgr[0]], dtype=float), int(patch_mask.sum())


def interpolate_rgb(rgb: np.ndarray) -> np.ndarray | None:
    rgb = np.asarray(rgb, dtype=float)
    valid = np.isfinite(rgb).all(axis=1)
    if valid.sum() < max(16, int(len(rgb) * 0.55)):
        return None
    x = np.arange(len(rgb))
    filled = rgb.copy()
    for channel in range(3):
        good = np.isfinite(filled[:, channel])
        if good.sum() < max(16, int(len(rgb) * 0.55)):
            return None
        filled[:, channel] = np.interp(x, x[good], filled[good, channel])
    return filled


def range_error(pred: float, target: dict[str, float]) -> tuple[float, bool]:
    if not np.isfinite(pred):
        return math.nan, False
    if np.isfinite(target["bpm_min"]) and pred < target["bpm_min"]:
        return float(target["bpm_min"] - pred), False
    if np.isfinite(target["bpm_max"]) and pred > target["bpm_max"]:
        return float(pred - target["bpm_max"]), False
    return 0.0, True


def best_pulses(traces: pd.DataFrame, fps: float, target: dict[str, float], min_bpm: float, max_bpm: float) -> pd.DataFrame:
    rows = []
    for roi, group in traces.groupby("roi", sort=False):
        rgb = group[["r", "g", "b"]].to_numpy(dtype=float)
        filled = interpolate_rgb(rgb)
        first = group.iloc[0]
        valid_frames = int(np.isfinite(rgb).all(axis=1).sum())
        valid_fraction = valid_frames / max(1, len(group))
        for method in ("green", "g_minus_r", "chrom", "pos"):
            if filled is None:
                peak_bpm = snr = total_ratio = math.nan
            else:
                pulse = METHOD_FUNCTIONS[method](filled, fps, min_bpm, max_bpm)
                peak_bpm, snr, total_ratio = estimate_bpm_from_signal(pulse, fps, min_bpm, max_bpm)
            err, within = range_error(peak_bpm, target)
            rows.append(
                {
                    "roi": roi,
                    "label": first["label"],
                    "kind": first["kind"],
                    "method": method,
                    "peak_bpm": round(float(peak_bpm), 3) if np.isfinite(peak_bpm) else math.nan,
                    "target_bpm": target["bpm_target"],
                    "target_abs_error": round(abs(float(peak_bpm) - target["bpm_target"]), 3)
                    if np.isfinite(peak_bpm) and np.isfinite(target["bpm_target"])
                    else math.nan,
                    "range_error": round(err, 3) if np.isfinite(err) else math.nan,
                    "within_range": bool(within),
                    "snr": round(float(snr), 3) if np.isfinite(snr) else math.nan,
                    "total_ratio": round(float(total_ratio), 4) if np.isfinite(total_ratio) else math.nan,
                    "valid_frames": valid_frames,
                    "valid_fraction": round(valid_fraction, 3),
                    "median_confidence": round(float(group["confidence"].median()), 3),
                    "median_mask_pixels": round(float(group["mask_pixels"].median()), 1),
                    "median_motion_px": round(float(group["center_motion_px"].median()), 3),
                }
            )
    return pd.DataFrame(rows).sort_values(["range_error", "target_abs_error", "kind", "snr"], ascending=[True, True, True, False])


def write_plot(summary: pd.DataFrame, out_dir: Path) -> None:
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        return
    top = summary.dropna(subset=["peak_bpm"]).head(12)
    if top.empty:
        return
    labels = [f"{row.label}\n{row.method}" for row in top.itertuples()]
    values = top["peak_bpm"].to_numpy(dtype=float)
    colors = ["#5eead4" if row.within_range else "#f97316" for row in top.itertuples()]
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.bar(np.arange(len(values)), values, color=colors)
    ax.axhspan(float(top["target_bpm"].iloc[0]) - 4.5, float(top["target_bpm"].iloc[0]) + 4.5, color="#94a3b8", alpha=0.15)
    ax.set_xticks(np.arange(len(values)))
    ax.set_xticklabels(labels, rotation=35, ha="right")
    ax.set_ylabel("Peak BPM")
    ax.set_title("DLC keypoint ROI rPPG probe")
    fig.tight_layout()
    fig.savefig(out_dir / "dlc_keypoint_roi_summary.png", dpi=180)
    plt.close(fig)


def write_report(summary: pd.DataFrame, out_dir: Path, target: dict[str, float], fps: float, mask_enabled: bool) -> None:
    best = summary.head(10)
    table = ["| ROI | Method | Peak BPM | Range error | SNR | Valid frames |", "| --- | --- | ---: | ---: | ---: | ---: |"]
    for row in best.itertuples():
        table.append(
            f"| {row.label} | {row.method} | {row.peak_bpm:.3f} | {row.range_error:.3f} | {row.snr:.3f} | {row.valid_frames} |"
        )
    lines = [
        "# DLC Keypoint ROI rPPG Probe",
        "",
        f"- Target for `4.mp4`: {target['bpm_min']:.1f}-{target['bpm_max']:.1f} bpm, center {target['bpm_target']:.1f} bpm.",
        f"- Probe FPS: {fps:.3f}. Practical max detectable HR is capped by sampling; this run used 70-135 bpm.",
        f"- YOLO animal mask intersection: `{mask_enabled}`.",
        "",
        "## Top Candidates",
        "",
        "\n".join(table),
        "",
        "## Interpretation",
        "",
        "- This is an actual anatomical ROI extraction from DeepLabCut SuperAnimal keypoints, not a face-box proxy.",
        "- It is still a single 30-second probe on one video, so it should guide ROI design rather than be treated as final performance.",
        "- Artifact ROIs are included deliberately: mouth and paw peaks help identify panting or motion-locked states that should be rejected.",
    ]
    (out_dir / "dlc_keypoint_roi_report.md").write_text("\n".join(lines), encoding="utf-8")


def write_ui(summary: pd.DataFrame, traces: pd.DataFrame, out_dir: Path, ui_data: Path, target: dict[str, float], fps: float) -> None:
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "video": "4.mp4",
        "probeVideo": "reports/rppg_pet_keypoints/dlc_probe_30s/4_dlc_probe.mp4",
        "fps": round(float(fps), 3),
        "frames": int(traces["frame_index"].nunique()) if not traces.empty else 0,
        "target": target,
        "summary": rows_for_ui(summary.head(16)),
        "best": rows_for_ui(summary.head(1))[0] if not summary.empty else {},
        "assets": {
            "reportUrl": existing_vite_url(out_dir / "dlc_keypoint_roi_report.md"),
            "summaryCsvUrl": existing_vite_url(out_dir / "dlc_keypoint_roi_summary.csv"),
            "tracesCsvUrl": existing_vite_url(out_dir / "dlc_keypoint_roi_traces.csv"),
            "plotUrl": existing_vite_url(out_dir / "dlc_keypoint_roi_summary.png"),
        },
    }
    ui_data.parent.mkdir(parents=True, exist_ok=True)
    ui_data.write_text(
        "export const RPPG_DLC_KEYPOINT_ROI_PROBE = "
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + " as const;\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    frames, fps = read_video_frames(args.video)
    keypoints = pd.read_csv(args.keypoints_csv)
    target = load_target(args.labels_csv, args.source_video)
    model = load_yolo_model(args.yolo_model, args.disable_yolo_mask)
    mask_enabled = model is not None and not args.disable_yolo_mask
    print(f"[device] YOLO animal mask device: {args.device}")

    prev_centers: dict[str, tuple[float, float] | None] = {spec["roi"]: None for spec in ROI_SPECS}
    records: list[dict[str, Any]] = []
    for frame_idx, frame in enumerate(frames):
        animal_mask, mask_conf = animal_mask_for_frame(model, frame, device=args.device)
        kps = frame_keypoints(keypoints, frame_idx, args.min_conf)
        for spec in ROI_SPECS:
            center = roi_center(kps, spec)
            if center is None:
                rgb = np.array([math.nan, math.nan, math.nan])
                mask_pixels = 0
                motion = math.nan
                confidence = math.nan
                cx = cy = math.nan
            else:
                cx, cy, confidence = center
                rgb, mask_pixels = extract_patch_rgb(frame, animal_mask, (cx, cy), int(spec["radius"]))
                prev = prev_centers.get(spec["roi"])
                motion = math.hypot(cx - prev[0], cy - prev[1]) if prev is not None else math.nan
                prev_centers[spec["roi"]] = (cx, cy)
            records.append(
                {
                    "frame_index": frame_idx,
                    "time_sec": frame_idx / fps,
                    "roi": spec["roi"],
                    "label": spec["label"],
                    "kind": spec["kind"],
                    "center_x": cx,
                    "center_y": cy,
                    "confidence": confidence,
                    "r": rgb[0],
                    "g": rgb[1],
                    "b": rgb[2],
                    "mask_pixels": mask_pixels,
                    "mask_confidence": mask_conf,
                    "center_motion_px": motion,
                }
            )

    traces = pd.DataFrame.from_records(records)
    summary = best_pulses(traces, fps, target, args.min_bpm, args.max_bpm)
    traces.to_csv(args.out_dir / "dlc_keypoint_roi_traces.csv", index=False)
    summary.to_csv(args.out_dir / "dlc_keypoint_roi_summary.csv", index=False)
    write_plot(summary, args.out_dir)
    write_report(summary, args.out_dir, target, fps, mask_enabled)
    write_ui(summary, traces, args.out_dir, args.ui_data, target, fps)
    print(f"Wrote DLC keypoint ROI probe artifacts to {args.out_dir}")


if __name__ == "__main__":
    main()
