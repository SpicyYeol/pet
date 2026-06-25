#!/usr/bin/env python3
"""Ingest AP-10K / APT-36K (COCO-style, 17 keypoints) into petvitals posture features.

Why: AP-10K/APT-36K are large, diverse public animal-pose datasets — the next big
lever for the posture classifier. They give keypoints (not posture-class labels) in a
17-keypoint schema different from our 39-pt SuperAnimal, so this tool maps them into
the SAME posture-feature space the classifier uses, optionally proposes weak posture
labels for geometrically-unambiguous instances, and writes a CSV that
tools/train_pose_model.py can augment training with.

Data hosting note: APT-36K is on OneDrive and AP-10K annotations on Google Drive, so
download is a manual step (see docs/research/EXTERNAL_POSE_DATA.md). Once you have a
COCO json:

    python tools/ingest_animal_pose.py --coco ap10k-train.json --family canid --out reports/ext_pose.csv
    python tools/ingest_animal_pose.py --self-test       # verify the adapter w/o any download

AP-10K/APT-36K 17-keypoint order (COCO):
  1 L_Eye 2 R_Eye 3 Nose 4 Neck 5 RootOfTail 6 L_Shoulder 7 L_Elbow 8 L_F_Paw
  9 R_Shoulder 10 R_Elbow 11 R_F_Paw 12 L_Hip 13 L_Knee 14 L_B_Paw 15 R_Hip 16 R_Knee 17 R_B_Paw
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

KP = ["l_eye", "r_eye", "nose", "neck", "tail", "l_shoulder", "l_elbow", "l_fpaw",
      "r_shoulder", "r_elbow", "r_fpaw", "l_hip", "l_knee", "l_bpaw",
      "r_hip", "r_knee", "r_bpaw"]
PAWS = ["l_fpaw", "r_fpaw", "l_bpaw", "r_bpaw"]
TRUNK = ["neck", "tail", "l_shoulder", "r_shoulder", "l_hip", "r_hip"]

# thresholds shared with petvitals/analyzers/pose.py (single-frame subset)
T_RECUMBENT_SEP, T_STAND_SEP, T_SIT_TILT, T_ELONGATION = 0.18, 0.35, 24.0, 2.4


def _pts(kp17):
    """COCO flat [x,y,v]*17 -> {name: (x,y)} for labeled (v>0) keypoints."""
    a = np.asarray(kp17, dtype=float).reshape(-1, 3)
    return {KP[i]: a[i, :2] for i in range(len(KP)) if a[i, 2] > 0}


def features(kp17) -> dict:
    p = _pts(kp17)
    f = {k: np.nan for k in ("vertical_separation", "spine_tilt", "head_height",
                             "front_paw_spread", "body_elongation", "n_valid")}
    f["n_valid"] = len(p)
    neck, tail = p.get("neck"), p.get("tail")
    scale = None
    if neck is not None and tail is not None:
        scale = float(np.linalg.norm(neck - tail))
    if not scale or scale < 1.0:
        allp = np.array(list(p.values()))
        scale = float(np.linalg.norm(allp.max(0) - allp.min(0))) if len(allp) >= 3 else None
    if not scale:
        return f

    trunk = np.mean([p[k] for k in TRUNK if k in p], axis=0) if any(k in p for k in TRUNK) else None
    paws = [p[k] for k in PAWS if k in p]
    if trunk is not None and paws:
        f["vertical_separation"] = (np.mean([q[1] for q in paws]) - trunk[1]) / scale
    if neck is not None and tail is not None:
        d = neck - tail
        ang = abs(np.degrees(np.arctan2(d[1], d[0])))
        f["spine_tilt"] = 180 - ang if ang > 90 else ang
    if "nose" in p and trunk is not None:
        f["head_height"] = (trunk[1] - p["nose"][1]) / scale
    if "l_fpaw" in p and "r_fpaw" in p:
        f["front_paw_spread"] = float(np.linalg.norm(p["l_fpaw"] - p["r_fpaw"])) / scale
    body = [p[k] for k in (TRUNK + PAWS) if k in p]
    if len(body) >= 3:
        arr = np.array(body); wh = arr.max(0) - arr.min(0)
        f["body_elongation"] = max(wh) / max(min(wh), 1e-6)
    return f


def propose_posture(f: dict) -> str:
    """Weak single-frame label for geometrically-unambiguous instances, else uncertain."""
    if f["n_valid"] < 6 or not np.isfinite(f.get("vertical_separation", np.nan)):
        return "uncertain"
    sep = f["vertical_separation"]
    if sep <= T_RECUMBENT_SEP:
        elong = f.get("body_elongation", np.nan)
        return "lateral_recumbency" if np.isfinite(elong) and elong >= T_ELONGATION else "sternal_recumbency"
    if np.isfinite(f.get("spine_tilt", np.nan)) and f["spine_tilt"] >= T_SIT_TILT:
        return "sitting"
    if sep >= T_STAND_SEP:
        return "standing_normal"
    return "uncertain"


def _canid(cat_name: str) -> bool:
    n = (cat_name or "").lower()
    return any(k in n for k in ["dog", "wolf", "fox", "canid", "coyote", "jackal", "dingo"])


def ingest(coco_path: Path, family_filter: str | None) -> pd.DataFrame:
    data = json.loads(Path(coco_path).read_text(encoding="utf-8"))
    cats = {c["id"]: c.get("name", str(c["id"])) for c in data.get("categories", [])}
    rows = []
    for ann in data.get("annotations", []):
        kp = ann.get("keypoints")
        if not kp:
            continue
        species = cats.get(ann.get("category_id"), "unknown")
        if family_filter == "canid" and not _canid(species):
            continue
        f = features(kp)
        f.update({"source": Path(coco_path).name, "instance_id": ann.get("id"),
                  "species": species, "proposed_posture": propose_posture(f)})
        rows.append(f)
    return pd.DataFrame(rows)


def _self_test() -> None:
    print("[self-test] synthetic AP-10K-format instances (no download needed)")

    def kp(d):  # build 17x3 from a name->(x,y) dict, v=2
        a = np.zeros((17, 3))
        for i, n in enumerate(KP):
            if n in d:
                a[i] = [d[n][0], d[n][1], 2]
        return a.flatten().tolist()

    # standing: paws well below trunk, level spine
    standing = kp({"nose": (60, 95), "neck": (100, 100), "tail": (300, 100),
                   "l_shoulder": (110, 110), "r_shoulder": (110, 110),
                   "l_hip": (290, 110), "r_hip": (290, 110),
                   "l_fpaw": (110, 210), "r_fpaw": (125, 210),
                   "l_bpaw": (290, 210), "r_bpaw": (305, 210)})
    # sitting: rear low, spine tilted (~45 deg)
    sitting = kp({"nose": (70, 70), "neck": (100, 90), "tail": (240, 230),
                  "l_fpaw": (110, 220), "r_fpaw": (125, 220),
                  "l_bpaw": (235, 245), "r_bpaw": (250, 245),
                  "l_hip": (235, 230), "r_hip": (235, 230)})
    # lying: paws ~level with trunk, elongated
    lying = kp({"nose": (40, 200), "neck": (100, 205), "tail": (360, 208),
                "l_shoulder": (120, 205), "r_hip": (340, 208),
                "l_fpaw": (110, 215), "r_fpaw": (130, 215),
                "l_bpaw": (340, 215), "r_bpaw": (355, 215)})
    for name, k, expect in [("standing", standing, "standing_normal"),
                            ("sitting", sitting, "sitting"),
                            ("lying", lying, ("sternal_recumbency", "lateral_recumbency"))]:
        f = features(k); got = propose_posture(f)
        ok = got in (expect if isinstance(expect, tuple) else (expect,))
        print(f"  {name:9s} sep={f['vertical_separation']:.2f} tilt={f['spine_tilt']:.0f} "
              f"elong={f['body_elongation']:.1f} -> {got}  {'OK' if ok else 'FAIL(exp '+str(expect)+')'}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Ingest AP-10K/APT-36K COCO -> posture features")
    ap.add_argument("--coco", type=Path, help="COCO-style annotation json (AP-10K/APT-36K)")
    ap.add_argument("--family", choices=["canid"], default=None, help="filter to canids (dog/wolf/fox)")
    ap.add_argument("--out", type=Path, default=Path("reports/external_pose_features.csv"))
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test or not args.coco:
        _self_test()
        if not args.coco:
            print("\n(no --coco given; ran self-test only. See docs/research/EXTERNAL_POSE_DATA.md)")
            return
    df = ingest(args.coco, args.family)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(args.out, index=False)
    n_lab = (df.proposed_posture != "uncertain").sum()
    print(f"[ingest] {len(df)} instances -> {args.out}  ({n_lab} with a weak posture label)")
    print(df.proposed_posture.value_counts().to_string())


if __name__ == "__main__":
    main()
