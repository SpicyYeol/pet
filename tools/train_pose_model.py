#!/usr/bin/env python3
"""Train a small ML posture classifier from weak (clip-level) labels.

Reuses the EXACT pose features from petvitals (so the analyzer and the model see
identical inputs). Each labeled stem contributes its confident frames with the
clip's posture label (weak supervision). Reports leave-one-clip-out accuracy +
confusion matrix and saves a model bundle to petvitals/models/pose_rf.joblib,
which PoseAnalyzer then uses automatically (with rules kept for emergencies).

    python tools/train_pose_model.py
    python tools/train_pose_model.py --labels reports/pose_training/labels.csv

Honesty: with only a handful of clips this is a proof-of-concept pipeline, not a
validated model. It exists so that adding real frame-level labels immediately
improves the classifier without any code changes.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
import pandas as pd

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

from petvitals.analyzers.pose import FEATURE_COLUMNS, PoseAnalyzer, PoseConfig  # noqa: E402
from petvitals.core.keypoints import resolve_keypoints_path  # noqa: E402
from petvitals.core.session import Session  # noqa: E402

OUT = _ROOT / "petvitals" / "models" / "pose_rf.joblib"


def build_dataset(labels: pd.DataFrame):
    pa = PoseAnalyzer(PoseConfig(model_path=""))  # rules-only instance for features
    X, y, groups = [], [], []
    for row in labels.itertuples():
        stem = str(row.stem)
        if resolve_keypoints_path(stem) is None:
            print(f"  [skip] stem {stem}: no keypoints")
            continue
        session = Session.from_stem(stem)
        feats = [pa._features(fr) for fr in session.frames]
        pa._add_dynamics(session.frames, feats)
        kept = 0
        for f in feats:
            if f.n_valid_kp < pa.cfg.min_valid_kp or not np.isfinite(f.body_scale):
                continue
            X.append([getattr(f, c) for c in FEATURE_COLUMNS])
            y.append(row.posture)
            groups.append(stem)
            kept += 1
        print(f"  stem {stem}: {kept} frames -> {row.posture}")
    return np.array(X, dtype=float), np.array(y), np.array(groups)


def main() -> None:
    ap = argparse.ArgumentParser(description="Train pose ML classifier (weak labels)")
    ap.add_argument("--labels", type=Path, default=_ROOT / "reports/pose_training/labels.csv")
    ap.add_argument("--external", type=Path, default=None,
                    help="Augment with external pose features CSV (from tools/ingest_animal_pose.py). "
                         "Uses column 'posture' if present, else 'proposed_posture' (weak).")
    args = ap.parse_args()

    from sklearn.ensemble import RandomForestClassifier
    from sklearn.impute import SimpleImputer
    from sklearn.metrics import confusion_matrix
    from sklearn.model_selection import LeaveOneGroupOut

    labels = pd.read_csv(args.labels)
    print(f"[train] {len(labels)} labeled clips from {args.labels.name}")
    X, y, groups = build_dataset(labels)
    if len(X) == 0:
        print("[train] no data; aborting"); return

    if args.external and args.external.exists():
        ext = pd.read_csv(args.external)
        lab_col = "posture" if "posture" in ext.columns else "proposed_posture"
        ext = ext[ext[lab_col].notna() & (ext[lab_col] != "uncertain")]
        if len(ext):
            Xe = np.array([[row.get(c, np.nan) for c in FEATURE_COLUMNS]
                           for _, row in ext.iterrows()], dtype=float)
            X = np.vstack([X, Xe])
            y = np.concatenate([y, ext[lab_col].astype(str).values])
            groups = np.concatenate([groups, ["external_" + str(s).split("_")[0]
                                              for s in ext.get("species", ["ext"] * len(ext))]])
            print(f"[train] + {len(ext)} external instances from {args.external.name} "
                  f"(label='{lab_col}')")

    medians = {c: float(np.nanmedian(X[:, i])) for i, c in enumerate(FEATURE_COLUMNS)}
    imp = SimpleImputer(strategy="median").fit(X)
    Xi = imp.transform(X)

    # leave-one-clip-out CV (honest: never test on a clip seen in training)
    logo = LeaveOneGroupOut()
    classes = sorted(set(y))
    y_true_all, y_pred_all = [], []
    if len(set(groups)) > 1:
        for tr, te in logo.split(Xi, y, groups):
            if len(set(y[tr])) < 2:
                continue
            clf = RandomForestClassifier(n_estimators=200, random_state=0, class_weight="balanced")
            clf.fit(Xi[tr], y[tr])
            y_true_all.extend(y[te]); y_pred_all.extend(clf.predict(Xi[te]))
        if y_true_all:
            acc = float(np.mean(np.array(y_true_all) == np.array(y_pred_all)))
            print(f"\n[cv] leave-one-clip-out accuracy: {acc:.2f} (n={len(y_true_all)})")
            cm = confusion_matrix(y_true_all, y_pred_all, labels=classes)
            print("[cv] confusion (rows=true, cols=pred): " + ", ".join(classes))
            for c, rowc in zip(classes, cm):
                print(f"     {c:22s} {rowc}")
    else:
        acc = None
        print("[cv] only one clip group; skipping CV")

    # final model on all data
    clf = RandomForestClassifier(n_estimators=300, random_state=0, class_weight="balanced")
    clf.fit(Xi, y)
    bundle = {"model": clf, "features": FEATURE_COLUMNS, "medians": medians,
              "classes": classes, "n_samples": int(len(X)),
              "cv_accuracy": acc, "labels_file": str(args.labels.name)}

    import joblib
    OUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, OUT)
    print(f"\n[train] saved {OUT.relative_to(_ROOT)}  ({len(X)} frames, classes={classes})")
    print("[train] PoseAnalyzer will now use it automatically (rules kept for seizure/uncertain).")


if __name__ == "__main__":
    main()
