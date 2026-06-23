from __future__ import annotations

import argparse
import csv
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np


@dataclass(frozen=True)
class RoiConfig:
    x1: int
    y1: int
    x2: int
    y2: int


# Rough monitor search windows for the current dataset_front videos.
# They intentionally include some margin because the videos are handheld.
ROI_CONFIG: dict[str, RoiConfig] = {
    "1.mp4": RoiConfig(50, 0, 380, 240),
    "3.mp4": RoiConfig(120, 120, 560, 480),
    "4.mp4": RoiConfig(250, 150, 690, 460),
    "5.mp4": RoiConfig(350, 190, 700, 470),
    "6.mp4": RoiConfig(620, 0, 970, 240),
    "7.mp4": RoiConfig(480, 140, 880, 430),
    "8.mp4": RoiConfig(0, 110, 400, 380),
}


# Final reviewed labels from OCR monitor-sheet review. The automatic OCR pass is
# retained as an audit trail in video_labels_ocr_samples.csv, but the monitor
# digits are small enough that raw EasyOCR can produce noisy 2-digit fragments.
REVIEWED_LABELS: dict[str, dict[str, Any]] = {
    "1.mp4": {
        "usable": True,
        "bpm_min": 170,
        "bpm_max": 180,
        "bpm_target": 175.0,
        "source": "ocr_reviewed",
        "notes": "Monitor HR digits consistently read around 170-180 bpm.",
    },
    "2.mp4": {
        "usable": False,
        "bpm_min": None,
        "bpm_max": None,
        "bpm_target": None,
        "source": "no_readable_monitor",
        "notes": "No readable vital monitor in sampled frames.",
    },
    "3.mp4": {
        "usable": True,
        "bpm_min": 190,
        "bpm_max": 230,
        "bpm_target": 210.0,
        "source": "ocr_reviewed",
        "notes": "Readable monitor HR samples include high-190s through low-220s.",
    },
    "4.mp4": {
        "usable": True,
        "bpm_min": 111,
        "bpm_max": 120,
        "bpm_target": 115.5,
        "source": "ocr_reviewed",
        "notes": "Readable monitor HR samples cluster around 112-121 bpm.",
    },
    "5.mp4": {
        "usable": True,
        "bpm_min": 130,
        "bpm_max": 140,
        "bpm_target": 135.0,
        "source": "ocr_reviewed",
        "notes": "Readable monitor HR samples cluster around 130-140 bpm.",
    },
    "6.mp4": {
        "usable": True,
        "bpm_min": 90,
        "bpm_max": 90,
        "bpm_target": 90.0,
        "source": "ocr_reviewed",
        "notes": "Readable monitor HR samples are approximately 90 bpm.",
    },
    "7.mp4": {
        "usable": True,
        "bpm_min": 182,
        "bpm_max": 197,
        "bpm_target": 189.5,
        "source": "ocr_reviewed",
        "notes": "Readable monitor HR samples are approximately 182-197 bpm.",
    },
    "8.mp4": {
        "usable": True,
        "bpm_min": 108,
        "bpm_max": 113,
        "bpm_target": 110.5,
        "source": "ocr_reviewed",
        "notes": "Readable monitor HR samples are approximately 108-113 bpm.",
    },
}


def natural_key(path: Path) -> tuple[int, str]:
    match = re.search(r"\d+", path.stem)
    return (int(match.group(0)) if match else 10**9, path.name)


def sample_seconds(duration: float, count: int) -> list[float]:
    if duration <= 0:
        return []
    start = min(5.0, max(0.0, duration * 0.1))
    end = max(start, duration - 5.0)
    if count <= 1:
        return [duration / 2]
    return [float(v) for v in np.linspace(start, end, count)]


def crop_monitor(frame: np.ndarray, roi: RoiConfig) -> np.ndarray:
    h, w = frame.shape[:2]
    x1 = max(0, min(w, roi.x1))
    x2 = max(0, min(w, roi.x2))
    y1 = max(0, min(h, roi.y1))
    y2 = max(0, min(h, roi.y2))
    return frame[y1:y2, x1:x2]


def ocr_variants(crop: np.ndarray) -> list[tuple[str, np.ndarray]]:
    up = cv2.resize(crop, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
    blur = cv2.GaussianBlur(up, (0, 0), 1.1)
    sharp = cv2.addWeighted(up, 1.8, blur, -0.8, 0)

    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    green_yellow = cv2.inRange(hsv, (25, 35, 60), (95, 255, 255))
    cyan = cv2.inRange(hsv, (85, 20, 60), (105, 255, 255))
    mask = cv2.bitwise_or(green_yellow, cyan)
    masked = cv2.bitwise_and(crop, crop, mask=mask)
    color = cv2.resize(masked, None, fx=6, fy=6, interpolation=cv2.INTER_CUBIC)
    return [("up4", up), ("sharp4", sharp), ("color6", color)]


def digit_candidates(text: str) -> list[tuple[int, int]]:
    digits = "".join(ch for ch in text if ch.isdigit())
    out: list[tuple[int, int]] = []
    for width in (3, 2):
        for i in range(max(0, len(digits) - width + 1)):
            value = int(digits[i : i + width])
            if 40 <= value <= 260:
                out.append((value, width))
    return out


def read_candidates(reader: Any, crop: np.ndarray) -> list[dict[str, Any]]:
    all_candidates: list[dict[str, Any]] = []
    height, width = crop.shape[:2]
    if height == 0 or width == 0:
        return all_candidates

    for variant_name, image in ocr_variants(crop):
        scale_x = image.shape[1] / width
        scale_y = image.shape[0] / height
        results = reader.readtext(
            image,
            allowlist="0123456789",
            detail=1,
            paragraph=False,
            mag_ratio=1,
            text_threshold=0.12,
            low_text=0.05,
            width_ths=1.2,
        )
        for box, text, confidence in results:
            xs = [point[0] / scale_x for point in box]
            ys = [point[1] / scale_y for point in box]
            cx = sum(xs) / 4 / width
            cy = sum(ys) / 4 / height
            if cy > 0.72:
                continue
            for value, digit_width in digit_candidates(text):
                score = float(confidence)
                score += (1.0 - cy) * 0.9
                score += min(max(cx, 0.0), 1.0) * 0.25
                score += 0.45 if digit_width == 3 else 0.05
                all_candidates.append(
                    {
                        "value": value,
                        "text": text,
                        "confidence": round(float(confidence), 6),
                        "cx": round(float(cx), 6),
                        "cy": round(float(cy), 6),
                        "variant": variant_name,
                        "score": round(float(score), 6),
                    }
                )

    all_candidates.sort(key=lambda row: row["score"], reverse=True)
    return all_candidates


def make_contact_sheet(crops: list[tuple[float, np.ndarray]], out_path: Path) -> None:
    if not crops:
        return
    thumb_w, thumb_h = 260, 190
    cols = 4
    rows = math.ceil(len(crops) / cols)
    sheet = np.full((rows * thumb_h, cols * thumb_w, 3), 245, dtype=np.uint8)
    for idx, (sec, crop) in enumerate(crops):
        thumb = cv2.resize(crop, (thumb_w, thumb_h))
        cv2.rectangle(thumb, (0, 0), (thumb_w, 28), (0, 0, 0), -1)
        cv2.putText(
            thumb,
            f"{sec:04.1f}s",
            (6, 21),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.62,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )
        row, col = divmod(idx, cols)
        sheet[row * thumb_h : (row + 1) * thumb_h, col * thumb_w : (col + 1) * thumb_w] = thumb
    cv2.imwrite(str(out_path), sheet)


def run_auto_ocr(
    video_dir: Path,
    debug_dir: Path,
    sample_count: int,
    gpu: bool,
) -> list[dict[str, Any]]:
    import easyocr

    reader = easyocr.Reader(["en"], gpu=gpu, verbose=False)
    debug_dir.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, Any]] = []

    for video_path in sorted(video_dir.glob("*.mp4"), key=natural_key):
        roi = ROI_CONFIG.get(video_path.name)
        if roi is None:
            continue

        cap = cv2.VideoCapture(str(video_path))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps else 0.0
        crops: list[tuple[float, np.ndarray]] = []

        for sec in sample_seconds(duration, sample_count):
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(sec * fps))
            ok, frame = cap.read()
            if not ok:
                continue
            crop = crop_monitor(frame, roi)
            crops.append((sec, crop))
            candidates = read_candidates(reader, crop)
            best = candidates[0] if candidates else {}
            rows.append(
                {
                    "video": video_path.name,
                    "timestamp_sec": round(sec, 3),
                    "best_value": best.get("value"),
                    "best_score": best.get("score"),
                    "best_text": best.get("text"),
                    "best_confidence": best.get("confidence"),
                    "best_variant": best.get("variant"),
                    "top_candidates_json": json.dumps(candidates[:5], ensure_ascii=False),
                }
            )

        cap.release()
        make_contact_sheet(crops, debug_dir / f"{video_path.stem}_monitor_sheet.jpg")

    return rows


def write_labels(video_dir: Path, out_csv: Path, out_json: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for video_path in sorted(video_dir.glob("*.mp4"), key=natural_key):
        label = REVIEWED_LABELS.get(
            video_path.name,
            {
                "usable": False,
                "bpm_min": None,
                "bpm_max": None,
                "bpm_target": None,
                "source": "missing_review",
                "notes": "No reviewed OCR label configured.",
            },
        )
        rows.append(
            {
                "video": video_path.name,
                "path": str(video_path.as_posix()),
                "usable": label["usable"],
                "bpm_min": label["bpm_min"],
                "bpm_max": label["bpm_max"],
                "bpm_target": label["bpm_target"],
                "label_source": label["source"],
                "notes": label["notes"],
            }
        )

    out_csv.parent.mkdir(parents=True, exist_ok=True)
    with out_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    with out_json.open("w", encoding="utf-8") as handle:
        json.dump(rows, handle, indent=2, ensure_ascii=False)

    return rows


def write_sample_rows(rows: list[dict[str, Any]], out_csv: Path) -> None:
    if not rows:
        return
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    with out_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build OCR-reviewed video/BPM label pairs for dataset_front."
    )
    parser.add_argument("--video-dir", type=Path, default=Path("dataset_front"))
    parser.add_argument("--out-csv", type=Path, default=Path("dataset_front/video_labels_ocr.csv"))
    parser.add_argument("--out-json", type=Path, default=Path("dataset_front/video_labels_ocr.json"))
    parser.add_argument(
        "--samples-csv",
        type=Path,
        default=Path("dataset_front/video_labels_ocr_samples.csv"),
    )
    parser.add_argument("--debug-dir", type=Path, default=Path("reports/ocr_preview/generated"))
    parser.add_argument("--sample-count", type=int, default=12)
    parser.add_argument("--no-auto-ocr", action="store_true")
    parser.add_argument("--no-gpu", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    label_rows = write_labels(args.video_dir, args.out_csv, args.out_json)

    sample_rows: list[dict[str, Any]] = []
    if not args.no_auto_ocr:
        sample_rows = run_auto_ocr(
            video_dir=args.video_dir,
            debug_dir=args.debug_dir,
            sample_count=args.sample_count,
            gpu=not args.no_gpu,
        )
        write_sample_rows(sample_rows, args.samples_csv)

    usable_count = sum(1 for row in label_rows if row["usable"])
    print(f"Wrote {args.out_csv} and {args.out_json}")
    print(f"Usable labeled videos: {usable_count}/{len(label_rows)}")
    if sample_rows:
        print(f"Wrote OCR audit samples: {args.samples_csv}")
        print(f"Wrote debug monitor sheets: {args.debug_dir}")


if __name__ == "__main__":
    main()
