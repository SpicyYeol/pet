#!/usr/bin/env python3
"""
Overlay posture labels + skeleton on the probe video for eyeball verification.

This is the visual companion to tools/pose_classifier.py (roadmap item #1, step b).
It re-runs the exact same classifier so the overlay matches the CSV/JSON output,
then draws, per frame:
  - the DLC skeleton (keypoints colored by confidence + bones)
  - the smoothed posture label (color-coded by clinical severity)
  - a small readout (key features, activity, behavioral EWS, active flags)

Output: an annotated .mp4 (and optional sample .jpg frames) under reports/pose_<stem>/.

Usage:
    python tools/visualize_pose.py --stem 3
    python tools/visualize_pose.py --stem 7 --sample-frames 6
    python tools/visualize_pose.py --keypoints path/to.csv --video path/to.mp4 --out reports/pose_x

Dependencies: opencv-python, numpy, pandas (already in requirements.txt).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pose_classifier as pc  # reuse the exact classifier  # noqa: E402

# ──────────────────────────────────────────────────────────────────────────
# Drawing config
# ──────────────────────────────────────────────────────────────────────────
# Clinical severity color (BGR) per posture
SEVERITY = {
    "orthopnea_resp_distress": (0, 0, 255),     # red — emergency
    "seizure_or_tremor":       (0, 0, 255),     # red — emergency
    "hunched_abdominal_pain":  (0, 140, 255),   # orange — abnormal
    "lateral_recumbency":      (0, 200, 255),   # amber — watch
    "sternal_recumbency":      (0, 255, 255),   # yellow — resting
    "sitting":                 (0, 220, 0),     # green — normal
    "standing_normal":         (0, 220, 0),     # green — normal
    "uncertain":               (160, 160, 160), # gray — no read
}

# skeleton bones drawn when both endpoints are confident
SKELETON = [
    ("nose", "upper_jaw"), ("upper_jaw", "lower_jaw"),
    ("nose", "left_eye"), ("nose", "right_eye"),
    ("left_earbase", "neck_base"), ("right_earbase", "neck_base"),
    ("nose", "throat_base"), ("throat_base", "neck_base"),
    ("neck_base", "back_base"), ("back_base", "back_middle"),
    ("back_middle", "back_end"), ("back_end", "tail_base"), ("tail_base", "tail_end"),
    ("neck_base", "front_left_thai"), ("neck_base", "front_right_thai"),
    ("front_left_thai", "front_left_knee"), ("front_left_knee", "front_left_paw"),
    ("front_right_thai", "front_right_knee"), ("front_right_knee", "front_right_paw"),
    ("tail_base", "back_left_thai"), ("tail_base", "back_right_thai"),
    ("back_left_thai", "back_left_knee"), ("back_left_knee", "back_left_paw"),
    ("back_right_thai", "back_right_knee"), ("back_right_knee", "back_right_paw"),
]

DRAW_KP = pc.HEAD + pc.SPINE + pc.PAWS + [
    "tail_end", "front_left_thai", "front_right_thai", "back_left_thai",
    "back_right_thai", "front_left_knee", "front_right_knee",
    "back_left_knee", "back_right_knee",
]


def conf_color(c: float) -> tuple[int, int, int]:
    """Red (low conf) -> green (high conf), BGR."""
    c = max(0.0, min(1.0, c))
    return (0, int(255 * c), int(255 * (1 - c)))


def resolve_video(kp_path: Path, stem: str) -> Path | None:
    sib = list(kp_path.parent.glob("*_dlc_probe.mp4"))
    if sib:
        return sib[0]
    fallback = Path(f"dataset_front/{stem}.mp4")
    return fallback if fallback.exists() else None


def draw_panel(img, posture, feats, summary, t, severity_color):
    h, w = img.shape[:2]
    # translucent header bar
    overlay = img.copy()
    cv2.rectangle(overlay, (0, 0), (w, 96), (20, 20, 20), -1)
    img[:] = cv2.addWeighted(overlay, 0.55, img, 0.45, 0)

    cv2.putText(img, posture.upper(), (12, 38),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, severity_color, 2, cv2.LINE_AA)
    cv2.putText(img, f"t={t:5.1f}s", (w - 150, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (230, 230, 230), 1, cv2.LINE_AA)

    def fmt(v):
        return f"{v:.2f}" if isinstance(v, (int, float)) and np.isfinite(v) else "--"
    line2 = (f"sep={fmt(feats.vertical_separation)}  "
             f"arch={fmt(feats.back_curvature)}  "
             f"tilt={fmt(feats.spine_tilt)}  "
             f"neck={fmt(feats.neck_extension)}  "
             f"motion={fmt(feats.motion_energy)}  kp={feats.n_valid_kp}")
    cv2.putText(img, line2, (12, 64),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (210, 210, 210), 1, cv2.LINE_AA)

    ews = summary["behavioral_ews_subscore"]
    ews_col = (0, 0, 255) if ews >= 3 else (0, 140, 255) if ews >= 1 else (0, 220, 0)
    cv2.putText(img, f"behavioral EWS: {ews}/3", (12, 88),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, ews_col, 1, cv2.LINE_AA)
    flags = [k for k, v in summary["flags"].items() if v]
    if flags:
        cv2.putText(img, "FLAGS: " + ", ".join(flags), (200, 88),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1, cv2.LINE_AA)


def main() -> None:
    ap = argparse.ArgumentParser(description="Overlay posture labels on the probe video")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--stem", help="Video stem, e.g. 3, 7")
    src.add_argument("--keypoints", type=Path, help="Path to pet_keypoints_normalized.csv")
    ap.add_argument("--video", type=Path, default=None, help="Video to overlay on (default: sibling *_dlc_probe.mp4)")
    ap.add_argument("--out", type=Path, default=None, help="Output dir (default reports/pose_<stem>)")
    ap.add_argument("--sample-frames", type=int, default=4, help="How many sample JPGs to dump (0 = none)")
    ap.add_argument("--no-video", action="store_true", help="Skip writing the annotated mp4 (JPGs only)")
    args = ap.parse_args()

    if args.keypoints:
        kp_path, stem = args.keypoints, args.keypoints.parent.name
    else:
        kp_path, stem = pc.resolve_keypoints_path(args.stem), args.stem
        if kp_path is None:
            ap.error(f"No keypoints CSV found for stem {args.stem}")

    video = args.video or resolve_video(kp_path, stem)
    if video is None or not Path(video).exists():
        ap.error(f"No video found for stem {stem} (looked for sibling *_dlc_probe.mp4)")

    out_dir = args.out or Path(f"reports/pose_{stem}")
    out_dir.mkdir(parents=True, exist_ok=True)

    # --- run the classifier (same code path as pose_classifier.py) ---
    print(f"[viz] keypoints: {kp_path}")
    print(f"[viz] video    : {video}")
    frames, idxs, times, fps = pc.load_frames(kp_path)
    feats = [pc.extract_features(fr) for fr in frames]
    pc.add_dynamics(frames, feats)
    raw = [pc.classify_frame(f) for f in feats]
    smoothed = pc.suppress_short_seizures(pc.smooth_labels(raw, times))

    import pandas as pd
    per_frame = pd.DataFrame({
        "frame_index": idxs, "posture_smoothed": smoothed,
        "motion_energy": [f.motion_energy if np.isfinite(f.motion_energy) else "" for f in feats],
    })
    summary = pc.summarize(per_frame, fps)

    by_idx = {idxs[i]: (frames[i], feats[i], smoothed[i], times[i]) for i in range(len(idxs))}

    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        ap.error(f"Could not open video {video}")
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    vfps = cap.get(cv2.CAP_PROP_FPS) or fps

    writer = None
    if not args.no_video:
        out_mp4 = out_dir / f"{stem}_pose_overlay.mp4"
        writer = cv2.VideoWriter(str(out_mp4), cv2.VideoWriter_fourcc(*"mp4v"), vfps, (w, h))

    n_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or len(idxs)
    sample_at = set()
    if args.sample_frames > 0:
        sample_at = set(np.linspace(0, max(n_total - 1, 0), args.sample_frames, dtype=int).tolist())

    fidx, drawn = 0, 0
    while True:
        ok, img = cap.read()
        if not ok:
            break
        entry = by_idx.get(fidx)
        if entry is not None:
            fr, f, posture, t = entry
            color = SEVERITY.get(posture, (200, 200, 200))
            # bones
            for a, b in SKELETON:
                pa, pb = pc._pt(fr, a), pc._pt(fr, b)
                if pa is not None and pb is not None:
                    cv2.line(img, tuple(pa.astype(int)), tuple(pb.astype(int)),
                             (180, 180, 90), 1, cv2.LINE_AA)
            # keypoints
            for name in DRAW_KP:
                v = fr.get(name)
                if v is None:
                    continue
                x, y, c = v
                if c < pc.MIN_CONF or not (np.isfinite(x) and np.isfinite(y)):
                    continue
                cv2.circle(img, (int(x), int(y)), 3, conf_color(c), -1, cv2.LINE_AA)
            draw_panel(img, posture, f, summary, t, color)
            # border tint by severity
            cv2.rectangle(img, (0, 0), (w - 1, h - 1), color, 3)
            drawn += 1

        if writer is not None:
            writer.write(img)
        if fidx in sample_at:
            sp = out_dir / f"{stem}_pose_sample_{fidx:04d}.jpg"
            cv2.imwrite(str(sp), img)
        fidx += 1

    cap.release()
    if writer is not None:
        writer.release()

    print(f"[viz] frames overlaid: {drawn}/{fidx}")
    if writer is not None:
        print(f"[viz] wrote {out_dir / (stem + '_pose_overlay.mp4')}")
    if sample_at:
        print(f"[viz] wrote {len(sample_at)} sample JPG(s) to {out_dir}")
    print(f"[viz] posture mix: " + ", ".join(
        f"{k} {v*100:.0f}%" for k, v in sorted(
            summary['posture_time_fraction'].items(), key=lambda kv: -kv[1])))


if __name__ == "__main__":
    main()
