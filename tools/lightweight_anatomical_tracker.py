"""
Lightweight Anatomical Tracker (Prototype for v0.4 direction)

Goal:
- Avoid running expensive DLC / heavy pose model every frame.
- Detect anatomical patches occasionally (anchor).
- Track them at high FPS using KLT (Lucas-Kanade).
- Provide stable centers for rPPG patch extraction.

This is the practical path toward real-time HUD use.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np


@dataclass
class TrackedPatch:
    name: str
    center: tuple[float, float]
    size: int
    confidence: float = 1.0


class LightweightAnatomicalTracker:
    def __init__(
        self,
        anchor_every_n_frames: int = 15,   # ~1.5s at 10fps
        lk_params: dict | None = None,
    ):
        self.anchor_every_n_frames = anchor_every_n_frames
        self.lk_params = lk_params or dict(
            winSize=(21, 21),
            maxLevel=3,
            criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01),
        )
        self.patches: list[TrackedPatch] = []
        self.prev_gray: np.ndarray | None = None
        self.frame_count = 0

    def reset(self):
        self.patches = []
        self.prev_gray = None
        self.frame_count = 0

    def _detect_anchors(self, frame: np.ndarray, roi_defs: list[dict]) -> list[TrackedPatch]:
        """
        Placeholder for anchor detection.
        In real version this would call:
          - YOLO segmentation + small keypoint head, or
          - Downsampled DLC, or
          - Manual initialization from previous full DLC run
        """
        # For prototype: we expect the caller to provide initial centers
        # (e.g. from a recent full DLC keypoint result)
        raise NotImplementedError("Anchor detection not implemented in prototype. "
                                  "Provide initial centers from DLC or manual annotation.")

    def process_frame(
        self,
        frame: np.ndarray,
        initial_centers: dict[str, tuple[float, float]] | None = None,
    ) -> list[TrackedPatch]:
        """
        Main entry point.

        initial_centers: { "neck": (x, y), "nose_bridge": (x, y), ... }
        Only needed on first call or when re-anchoring.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        self.frame_count += 1

        # First frame or re-anchor time
        if self.prev_gray is None or (self.frame_count % self.anchor_every_n_frames == 0):
            if initial_centers:
                self.patches = [
                    TrackedPatch(name=k, center=v, size=40)
                    for k, v in initial_centers.items()
                ]
            else:
                # Would call _detect_anchors here in full version
                pass

        if self.prev_gray is not None and self.patches:
            # Prepare points for KLT
            pts = np.array([p.center for p in self.patches], dtype=np.float32).reshape(-1, 1, 2)

            new_pts, status, err = cv2.calcOpticalFlowPyrLK(
                self.prev_gray, gray, pts, None, **self.lk_params
            )

            for i, patch in enumerate(self.patches):
                if status[i]:
                    x, y = new_pts[i].ravel()
                    patch.center = (float(x), float(y))
                    patch.confidence = 1.0 - float(err[i]) / 100.0   # rough
                else:
                    patch.confidence *= 0.6   # degrade confidence

        self.prev_gray = gray
        return self.patches


def demo_on_video(video_path: Path, initial_centers: dict):
    """
    Simple demo that runs the tracker on a video and prints patch positions.
    """
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open {video_path}")

    tracker = LightweightAnatomicalTracker(anchor_every_n_frames=10)

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        patches = tracker.process_frame(frame, initial_centers if frame_idx == 0 else None)

        if frame_idx % 10 == 0:
            print(f"Frame {frame_idx}:")
            for p in patches:
                print(f"  {p.name}: ({p.center[0]:.1f}, {p.center[1]:.1f}) conf={p.confidence:.2f}")

        frame_idx += 1
        if frame_idx > 100:   # safety for demo
            break

    cap.release()
    print("Demo finished.")


if __name__ == "__main__":
    print("Lightweight Anatomical Tracker prototype loaded.")
    print("See demo_on_video() for usage example.")
    print("You need to provide initial_centers from a DLC run or manual annotation.")
