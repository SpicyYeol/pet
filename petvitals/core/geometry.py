"""Scale-invariant geometry helpers shared by analyzers."""

from __future__ import annotations

from typing import Optional

import numpy as np

from .keypoints import pt, HEAD, SPINE, PAWS


def body_scale(frame: dict, min_conf: float = 0.0) -> Optional[float]:
    """Reference length for normalization: spine length, with bbox fallback."""
    nb, tb = pt(frame, "neck_base", min_conf), pt(frame, "tail_base", min_conf)
    if nb is not None and tb is not None:
        d = float(np.linalg.norm(nb - tb))
        if d > 1.0:
            return d
    pts = [pt(frame, n, min_conf) for n in HEAD + SPINE + PAWS]
    pts = [p for p in pts if p is not None]
    if len(pts) >= 3:
        arr = np.array(pts)
        diag = float(np.linalg.norm(arr.max(0) - arr.min(0)))
        if diag > 1.0:
            return diag
    return None


def signed_perp(a: np.ndarray, b: np.ndarray, p: np.ndarray) -> float:
    """Signed perpendicular distance of p from line a->b (image coords).

    Positive => p is 'above' the chord (smaller y / arched up).
    """
    ab = b - a
    n = np.linalg.norm(ab)
    if n < 1e-6:
        return 0.0
    cross = ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])
    return -cross / n


def principal_axis_angle(points: list[np.ndarray]) -> Optional[float]:
    """Angle (deg, 0-90) of the PCA principal axis of a point set vs horizontal.

    Robust to partial visibility (needs >= 2 points). Used for spine tilt so a
    sitting dog is detected even when the tail is occluded.
    """
    if len(points) < 2:
        return None
    arr = np.array(points, dtype=float)
    _, _, vt = np.linalg.svd(arr - arr.mean(axis=0), full_matrices=False)
    dirv = vt[0]
    ang = abs(np.degrees(np.arctan2(dirv[1], dirv[0])))
    return 180 - ang if ang > 90 else ang
