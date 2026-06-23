"""Keypoint IO + access helpers, shared by every analyzer.

The on-disk format is the project's long-format CSV produced by
tools/normalize_dlc_h5.py:
    video, time_sec, frame_index, keypoint, x, y, confidence, source

In memory a "frame" is a dict {keypoint_name: (x, y, confidence)}.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

# DLC SuperAnimal quadruped keypoint groups used across analyzers.
HEAD = ["nose", "upper_jaw", "lower_jaw", "left_eye", "right_eye",
        "left_earbase", "right_earbase", "throat_base", "throat_end"]
NECK = ["neck_base", "neck_end"]
SPINE = ["neck_base", "back_base", "back_middle", "back_end", "tail_base"]
PAWS = ["front_left_paw", "front_right_paw", "back_left_paw", "back_right_paw"]
LIMBS = ["front_left_thai", "front_right_thai", "back_left_thai", "back_right_thai",
         "front_left_knee", "front_right_knee", "back_left_knee", "back_right_knee"]


def pt(frame: dict, name: str, min_conf: float = 0.0) -> Optional[np.ndarray]:
    """Return (x, y) for a keypoint if present and confident enough, else None."""
    v = frame.get(name)
    if v is None:
        return None
    x, y, c = v
    if c < min_conf or not (np.isfinite(x) and np.isfinite(y)):
        return None
    return np.array([x, y], dtype=float)


def mean_pt(frame: dict, names: list[str], min_conf: float = 0.0) -> Optional[np.ndarray]:
    pts = [pt(frame, n, min_conf) for n in names]
    pts = [p for p in pts if p is not None]
    if not pts:
        return None
    return np.mean(pts, axis=0)


def load_frames(csv_path: Path) -> tuple[list[dict], list[int], list[float], float]:
    """Load the long-format CSV into per-frame dicts + index/time arrays + fps."""
    df = pd.read_csv(csv_path)
    needed = {"frame_index", "time_sec", "keypoint", "x", "y", "confidence"}
    missing = needed - set(df.columns)
    if missing:
        raise ValueError(f"CSV missing columns: {missing}")
    frames, idxs, times = [], [], []
    for fidx, g in df.groupby("frame_index", sort=True):
        d = {row.keypoint: (row.x, row.y, row.confidence) for row in g.itertuples()}
        frames.append(d)
        idxs.append(int(fidx))
        times.append(float(g["time_sec"].iloc[0]))
    fps = 10.0
    if len(times) > 1:
        dt = float(np.median(np.diff(times)))
        if dt > 1e-6:
            fps = round(1.0 / dt, 3)
    return frames, idxs, times, fps


def resolve_keypoints_path(stem: str) -> Optional[Path]:
    """Find the normalized keypoints CSV for a video stem (GPU probe / full4)."""
    candidates = [
        Path(f"reports/rppg_pet_keypoints/dlc_probe_{stem}_gpu/pet_keypoints_normalized.csv"),
        Path(f"reports/rppg_pet_keypoints/dlc_probe_{stem}/pet_keypoints_normalized.csv"),
    ]
    if stem == "4":
        candidates.append(Path("reports/rppg_pet_keypoints/dlc_full4/pet_keypoints_normalized.csv"))
    for c in candidates:
        if c.exists():
            return c
    return None
