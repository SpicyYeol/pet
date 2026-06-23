#!/usr/bin/env python3
"""
Rule-based posture / behavior classifier (v0) for the pet rPPG project.

It reuses the DLC SuperAnimal keypoints we already extract for rPPG ROI selection
(`pet_keypoints_normalized.csv`) and turns them into a clinically useful posture
signal at near-zero extra cost. See docs/pose/POSE_CLASSIFIER_DESIGN.md.

Design highlights:
  - Scale-invariant features (everything normalized by body_scale).
  - Confidence-aware: only keypoints with conf >= MIN_CONF are used.
  - Transparent decision tree (emergencies first) -> auditable labels.
  - Temporal smoothing (rolling mode + hysteresis) to kill flicker.
  - Also computes activity / immobility (roadmap item #2) and a behavioral
    early-warning sub-score (roadmap item #4 stub).

Usage:
    python tools/pose_classifier.py --stem 3
    python tools/pose_classifier.py --keypoints path/to/pet_keypoints_normalized.csv --out reports/pose_3

Dependencies: numpy, pandas (already in requirements.txt). No ML, no torch.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

# ──────────────────────────────────────────────────────────────────────────
# Tunable thresholds (calibrate on labeled data — see design doc §8)
# 튜닝 가능한 임계값 (라벨 데이터로 보정 필요)
# ──────────────────────────────────────────────────────────────────────────
MIN_CONF = 0.30           # ignore keypoints below this confidence / 이 신뢰도 미만 무시
MIN_VALID_KP = 6          # need at least this many valid keypoints / 최소 유효 키포인트 수

# vertical separation (paws below trunk), normalized by body_scale
T_STAND_SEP = 0.35        # >= this => clearly standing / 이상이면 기립
T_RECUMBENT_SEP = 0.18    # <= this => lying down / 이하이면 누움

# Spine-vs-horizontal angle (deg) for "sitting". Calibrated on the probe clips:
# a standing dog's back reads ~14 deg (stem 6), a sitting dog ~31+ deg (stem 3),
# so ~24 separates them. spine_tilt is now a PCA fit, robust to tail occlusion.
T_SPINE_TILT_SIT = 24.0
T_BACK_ARCH = 0.12        # signed back curvature for hunch/abdominal pain / 등 굽음
T_NECK_EXTEND = 1.15      # neck length ratio for orthopnea / 목 신전
T_PAW_SPREAD = 0.55       # front-paw spread for elbow abduction / 앞발 벌림
T_HEAD_LOW = 0.10         # head_height below this = head not raised / 머리 안 듦
T_ELONGATION = 2.4        # body bbox aspect ratio for lateral recumbency / 측와위

# dynamics
# NOTE: with low-confidence DLC keypoints the per-frame jitter noise floor of
# motion_energy is already ~0.06 on this dataset, so "high motion" must sit well
# above it and tremor must be near shake-in-place AND sustained, or detector noise
# masquerades as seizures. Calibrate on labeled data (design doc §8).
T_MOTION_HIGH = 0.20      # motion_energy considered "high" / 높은 움직임 (noise floor ~0.06)
T_TREMOR = 0.85           # tremor_index (shake-in-place ratio) / 떨림 비율
TREMOR_WIN = 7            # frames for tremor window (~0.7s @10fps)
SEIZURE_MIN_FRAMES = 10   # seizure must persist >= this many frames (~1s) / 발작 최소 지속

# temporal smoothing
SMOOTH_RADIUS = 5         # rolling-mode half-window in frames (±0.5s @10fps)
HYSTERESIS = 5            # consecutive frames required to switch state / 상태 전환 연속 프레임

# behavior flags
IMMOBILE_MOTION = 0.015   # below this motion_energy = immobile / 부동 판정
PROLONGED_IMMOBILE_SEC = 120.0   # decubitus-risk span / 욕창 위험 지속(초)

# keypoints we rely on (others, e.g. antlers, are ignored)
HEAD = ["nose", "upper_jaw", "lower_jaw", "left_eye", "right_eye",
        "left_earbase", "right_earbase", "throat_base", "throat_end"]
SPINE = ["neck_base", "back_base", "back_middle", "back_end", "tail_base"]
PAWS = ["front_left_paw", "front_right_paw", "back_left_paw", "back_right_paw"]

POSTURES = [
    "standing_normal", "sitting", "sternal_recumbency", "lateral_recumbency",
    "hunched_abdominal_pain", "orthopnea_resp_distress", "seizure_or_tremor",
    "uncertain",
]


# ──────────────────────────────────────────────────────────────────────────
# Geometry helpers
# ──────────────────────────────────────────────────────────────────────────
def _pt(frame: dict, name: str) -> Optional[np.ndarray]:
    """Return (x, y) for a keypoint if present and confident, else None."""
    v = frame.get(name)
    if v is None:
        return None
    x, y, c = v
    if c < MIN_CONF or not (np.isfinite(x) and np.isfinite(y)):
        return None
    return np.array([x, y], dtype=float)


def _mean_pt(frame: dict, names: list[str]) -> Optional[np.ndarray]:
    pts = [_pt(frame, n) for n in names]
    pts = [p for p in pts if p is not None]
    if not pts:
        return None
    return np.mean(pts, axis=0)


def _body_scale(frame: dict) -> Optional[float]:
    """Reference length for normalization: spine length, with bbox fallback."""
    nb, tb = _pt(frame, "neck_base"), _pt(frame, "tail_base")
    if nb is not None and tb is not None:
        d = float(np.linalg.norm(nb - tb))
        if d > 1.0:
            return d
    # fallback: diagonal of confident-keypoint bbox
    pts = [_pt(frame, n) for n in HEAD + SPINE + PAWS]
    pts = [p for p in pts if p is not None]
    if len(pts) >= 3:
        arr = np.array(pts)
        diag = float(np.linalg.norm(arr.max(0) - arr.min(0)))
        if diag > 1.0:
            return diag
    return None


def _signed_perp(a: np.ndarray, b: np.ndarray, p: np.ndarray) -> float:
    """Signed perpendicular distance of p from line a->b (image coords).

    Positive value => p is 'above' the chord (smaller y / arched up).
    """
    ab = b - a
    n = np.linalg.norm(ab)
    if n < 1e-6:
        return 0.0
    # cross product z; flip sign so 'up' (smaller y) is positive
    cross = ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])
    return -cross / n


# ──────────────────────────────────────────────────────────────────────────
# Feature extraction
# ──────────────────────────────────────────────────────────────────────────
@dataclass
class Features:
    n_valid_kp: int = 0
    body_scale: float = np.nan
    vertical_separation: float = np.nan
    back_curvature: float = np.nan
    spine_tilt: float = np.nan
    neck_extension: float = np.nan
    head_height: float = np.nan
    front_paw_spread: float = np.nan
    body_elongation: float = np.nan
    motion_energy: float = np.nan
    tremor_index: float = np.nan


def extract_features(frame: dict) -> Features:
    f = Features()
    pts_all = [_pt(frame, n) for n in HEAD + SPINE + PAWS]
    valid = [p for p in pts_all if p is not None]
    f.n_valid_kp = len(valid)
    scale = _body_scale(frame)
    if scale is None or f.n_valid_kp < MIN_VALID_KP:
        return f
    f.body_scale = scale

    trunk = _mean_pt(frame, SPINE)
    paws = _mean_pt(frame, PAWS)
    nose = _pt(frame, "nose")
    nb, tb = _pt(frame, "neck_base"), _pt(frame, "tail_base")
    bm = _pt(frame, "back_middle")

    # vertical separation: paws below trunk => standing
    if trunk is not None and paws is not None:
        f.vertical_separation = (paws[1] - trunk[1]) / scale

    # back curvature: deviation of back_middle from neck->tail chord
    if nb is not None and tb is not None and bm is not None:
        f.back_curvature = _signed_perp(nb, tb, bm) / scale

    # spine tilt vs horizontal — robust line fit through ALL confident spine
    # points (PCA principal axis), so it still works when tail_base is occluded
    # (the common cause of a sitting dog being missed). Needs >= 2 spine points.
    spine_pts = [p for p in (_pt(frame, n) for n in SPINE) if p is not None]
    if len(spine_pts) >= 2:
        arr = np.array(spine_pts, dtype=float)
        _, _, vt = np.linalg.svd(arr - arr.mean(axis=0), full_matrices=False)
        dirv = vt[0]
        ang = abs(np.degrees(np.arctan2(dirv[1], dirv[0])))
        f.spine_tilt = 180 - ang if ang > 90 else ang

    # neck extension: nose-to-neck distance / scale
    if nose is not None and nb is not None:
        f.neck_extension = float(np.linalg.norm(nose - nb)) / scale

    # head height: trunk_y - nose_y (positive => head raised)
    if nose is not None and trunk is not None:
        f.head_height = (trunk[1] - nose[1]) / scale

    # front paw spread (elbow abduction proxy)
    flp, frp = _pt(frame, "front_left_paw"), _pt(frame, "front_right_paw")
    if flp is not None and frp is not None:
        f.front_paw_spread = float(np.linalg.norm(flp - frp)) / scale

    # body elongation: bbox aspect ratio of trunk+paws
    body_pts = [p for p in [_pt(frame, n) for n in SPINE + PAWS] if p is not None]
    if len(body_pts) >= 3:
        arr = np.array(body_pts)
        wh = arr.max(0) - arr.min(0)
        long_, short_ = max(wh), max(min(wh), 1e-6)
        f.body_elongation = long_ / short_
    return f


def add_dynamics(frames: list[dict], feats: list[Features]) -> None:
    """Fill motion_energy and tremor_index (need neighboring frames)."""
    def common_pts(fa, fb):
        names = set(HEAD + SPINE + PAWS)
        out = []
        for n in names:
            pa, pb = _pt(fa, n), _pt(fb, n)
            if pa is not None and pb is not None:
                out.append((pa, pb))
        return out

    n = len(frames)
    for i in range(n):
        scale = feats[i].body_scale
        if not np.isfinite(scale):
            continue
        # motion energy vs previous frame
        if i > 0:
            pairs = common_pts(frames[i - 1], frames[i])
            if pairs:
                disp = [np.linalg.norm(pb - pa) for pa, pb in pairs]
                feats[i].motion_energy = float(np.mean(disp)) / scale
        # tremor: total motion vs net centroid displacement over a window
        lo = max(0, i - TREMOR_WIN + 1)
        cents = []
        for j in range(lo, i + 1):
            c = _mean_pt(frames[j], SPINE + PAWS)
            if c is not None:
                cents.append(c)
        if len(cents) >= 3:
            cents = np.array(cents)
            path = float(np.sum(np.linalg.norm(np.diff(cents, axis=0), axis=1)))
            net = float(np.linalg.norm(cents[-1] - cents[0]))
            if path > 1e-6:
                feats[i].tremor_index = 1.0 - (net / path)  # ~1 = shaking in place


# ──────────────────────────────────────────────────────────────────────────
# Classification
# ──────────────────────────────────────────────────────────────────────────
def classify_frame(f: Features) -> str:
    if f.n_valid_kp < MIN_VALID_KP or not np.isfinite(f.body_scale):
        return "uncertain"

    # emergencies first
    me = f.motion_energy if np.isfinite(f.motion_energy) else 0.0
    tr = f.tremor_index if np.isfinite(f.tremor_index) else 0.0
    if tr >= T_TREMOR and me >= T_MOTION_HIGH:
        return "seizure_or_tremor"

    sep = f.vertical_separation
    if np.isfinite(sep) and sep <= T_RECUMBENT_SEP:
        if np.isfinite(f.body_elongation) and f.body_elongation >= T_ELONGATION:
            return "lateral_recumbency"
        return "sternal_recumbency"

    if np.isfinite(f.spine_tilt) and f.spine_tilt >= T_SPINE_TILT_SIT:
        return "sitting"

    # standing-ish: check pathological standing postures
    if np.isfinite(f.back_curvature) and f.back_curvature >= T_BACK_ARCH:
        return "hunched_abdominal_pain"

    neck_ok = np.isfinite(f.neck_extension) and f.neck_extension >= T_NECK_EXTEND
    spread_ok = np.isfinite(f.front_paw_spread) and f.front_paw_spread >= T_PAW_SPREAD
    head_low = (not np.isfinite(f.head_height)) or f.head_height <= T_HEAD_LOW
    if neck_ok and spread_ok and head_low:
        return "orthopnea_resp_distress"

    if np.isfinite(sep) and sep >= T_STAND_SEP:
        return "standing_normal"

    # ambiguous middle ground
    return "standing_normal" if np.isfinite(sep) else "uncertain"


def suppress_short_seizures(labels: list[str]) -> list[str]:
    """A seizure is a sustained event; drop runs shorter than SEIZURE_MIN_FRAMES.

    Short 'seizure_or_tremor' runs (usually keypoint-noise bursts) are rewritten to
    the preceding stable, non-seizure label (or 'standing_normal' at the start).
    """
    out = list(labels)
    n = len(out)
    i = 0
    while i < n:
        if out[i] == "seizure_or_tremor":
            j = i
            while j < n and out[j] == "seizure_or_tremor":
                j += 1
            if (j - i) < SEIZURE_MIN_FRAMES:
                repl = out[i - 1] if i > 0 else "standing_normal"
                if repl == "seizure_or_tremor":
                    repl = "standing_normal"
                for k in range(i, j):
                    out[k] = repl
            i = j
        else:
            i += 1
    return out


def smooth_labels(raw: list[str], times: list[float]) -> list[str]:
    """Rolling-mode smoothing followed by hysteresis."""
    n = len(raw)
    # 1) rolling mode
    moded = []
    for i in range(n):
        lo, hi = max(0, i - SMOOTH_RADIUS), min(n, i + SMOOTH_RADIUS + 1)
        moded.append(Counter(raw[lo:hi]).most_common(1)[0][0])
    # 2) hysteresis: require HYSTERESIS consecutive frames to switch
    out = [moded[0]]
    current = moded[0]
    run_val, run_len = moded[0], 0
    for i in range(1, n):
        if moded[i] == current:
            run_val, run_len = current, 0
        elif moded[i] == run_val:
            run_len += 1
            if run_len >= HYSTERESIS:
                current = run_val
                run_len = 0
        else:
            run_val, run_len = moded[i], 1
        out.append(current)
    return out


# ──────────────────────────────────────────────────────────────────────────
# Session-level summary / behavioral early-warning sub-score
# ──────────────────────────────────────────────────────────────────────────
def summarize(df: pd.DataFrame, fps: float) -> dict:
    n = len(df)
    frac = (df["posture_smoothed"].value_counts() / n).to_dict()
    frac = {k: round(v, 3) for k, v in frac.items()}

    # longest immobile span (seconds)
    me = pd.to_numeric(df["motion_energy"], errors="coerce").fillna(0.0).to_numpy()
    immobile = me < IMMOBILE_MOTION
    longest = cur = 0
    for v in immobile:
        cur = cur + 1 if v else 0
        longest = max(longest, cur)
    longest_immobile_sec = round(longest / fps, 1)

    flags = {
        "orthopnea_detected": bool(frac.get("orthopnea_resp_distress", 0) > 0.05),
        "seizure_detected": bool(frac.get("seizure_or_tremor", 0) > 0.02),
        "abdominal_pain_posture": bool(frac.get("hunched_abdominal_pain", 0) > 0.10),
        "lateral_recumbency_dominant": bool(frac.get("lateral_recumbency", 0) > 0.50),
        "prolonged_immobility": bool(longest_immobile_sec >= PROLONGED_IMMOBILE_SEC),
    }

    # behavioral early-warning sub-score (0-3), emergencies weigh most
    score = 0
    if flags["seizure_detected"]:
        score += 3
    if flags["orthopnea_detected"]:
        score += 3
    if flags["abdominal_pain_posture"]:
        score += 1
    if flags["lateral_recumbency_dominant"]:
        score += 1
    if flags["prolonged_immobility"]:
        score += 1
    behavioral_ews = min(3, score)

    return {
        "n_frames": int(n),
        "fps": fps,
        "duration_sec": round(n / fps, 1),
        "uncertain_fraction": frac.get("uncertain", 0.0),
        "posture_time_fraction": frac,
        "mean_activity": round(float(np.nanmean(me)), 4),
        "longest_immobile_sec": longest_immobile_sec,
        "flags": flags,
        "behavioral_ews_subscore": behavioral_ews,
        "note": "v0 single-view heuristic; calibrate thresholds on labels before clinical reading.",
    }


# ──────────────────────────────────────────────────────────────────────────
# IO / driver
# ──────────────────────────────────────────────────────────────────────────
def load_frames(csv_path: Path) -> tuple[list[dict], list[int], list[float], float]:
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
    # estimate fps
    fps = 10.0
    if len(times) > 1:
        dt = np.median(np.diff(times))
        if dt > 1e-6:
            fps = round(1.0 / dt, 3)
    return frames, idxs, times, fps


def resolve_keypoints_path(stem: str) -> Optional[Path]:
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


def main() -> None:
    ap = argparse.ArgumentParser(description="Rule-based pet posture classifier (v0)")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--stem", help="Video stem, e.g. 3, 7 (auto-resolve probe folder)")
    src.add_argument("--keypoints", type=Path, help="Path to pet_keypoints_normalized.csv")
    ap.add_argument("--out", type=Path, default=None, help="Output dir (default reports/pose_<stem>)")
    args = ap.parse_args()

    if args.keypoints:
        kp_path = args.keypoints
        stem = kp_path.parent.name
    else:
        kp_path = resolve_keypoints_path(args.stem)
        stem = args.stem
        if kp_path is None:
            ap.error(f"No keypoints CSV found for stem {args.stem}")

    out_dir = args.out or Path(f"reports/pose_{stem}")
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"[pose] reading {kp_path}")
    frames, idxs, times, fps = load_frames(kp_path)
    print(f"[pose] {len(frames)} frames @ ~{fps} fps")

    feats = [extract_features(fr) for fr in frames]
    add_dynamics(frames, feats)
    raw = [classify_frame(f) for f in feats]
    smoothed = smooth_labels(raw, times)
    smoothed = suppress_short_seizures(smoothed)

    rows = []
    for i in range(len(frames)):
        f = feats[i]
        rows.append({
            "frame_index": idxs[i], "time_sec": round(times[i], 3),
            "posture_raw": raw[i], "posture_smoothed": smoothed[i],
            "n_valid_kp": f.n_valid_kp,
            "vertical_separation": round(f.vertical_separation, 4) if np.isfinite(f.vertical_separation) else "",
            "back_curvature": round(f.back_curvature, 4) if np.isfinite(f.back_curvature) else "",
            "spine_tilt": round(f.spine_tilt, 2) if np.isfinite(f.spine_tilt) else "",
            "neck_extension": round(f.neck_extension, 4) if np.isfinite(f.neck_extension) else "",
            "head_height": round(f.head_height, 4) if np.isfinite(f.head_height) else "",
            "front_paw_spread": round(f.front_paw_spread, 4) if np.isfinite(f.front_paw_spread) else "",
            "body_elongation": round(f.body_elongation, 3) if np.isfinite(f.body_elongation) else "",
            "motion_energy": round(f.motion_energy, 4) if np.isfinite(f.motion_energy) else "",
            "tremor_index": round(f.tremor_index, 3) if np.isfinite(f.tremor_index) else "",
        })
    per_frame = pd.DataFrame(rows)
    per_frame_path = out_dir / "pose_per_frame.csv"
    per_frame.to_csv(per_frame_path, index=False)

    summary = summarize(per_frame, fps)
    summary_path = out_dir / "pose_session_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    # console report
    print("\n" + "=" * 56)
    print(f"  POSTURE SUMMARY - stem {stem}  ({summary['duration_sec']}s)")
    print("=" * 56)
    for k, v in sorted(summary["posture_time_fraction"].items(), key=lambda kv: -kv[1]):
        bar = "#" * int(round(v * 30))
        print(f"  {k:26s} {v*100:5.1f}%  {bar}")
    print("-" * 56)
    print(f"  mean activity         : {summary['mean_activity']}")
    print(f"  longest immobile span : {summary['longest_immobile_sec']} s")
    print(f"  behavioral EWS (0-3)  : {summary['behavioral_ews_subscore']}")
    active_flags = [k for k, v in summary["flags"].items() if v]
    print(f"  flags                 : {', '.join(active_flags) if active_flags else 'none'}")
    print("=" * 56)
    print(f"\n[pose] wrote {per_frame_path}")
    print(f"[pose] wrote {summary_path}")


if __name__ == "__main__":
    main()
