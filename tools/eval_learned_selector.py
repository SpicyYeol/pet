#!/usr/bin/env python3
"""Does a LEARNED fusion of the physiological SQIs beat the hand rule (RSA 30.8)?

The SQIs are complementary (PLV/LF catch RSA's failure) but hand-fusion overfits on
n=7. This trains a classifier to rank candidates from the SQIs, evaluated leave-one-
CLIP-out (honest). It is the concrete test of whether ML/DL helps at current scale.

    python tools/eval_learned_selector.py
"""
from __future__ import annotations
import sys
from pathlib import Path
import numpy as np, pandas as pd

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT)); sys.path.insert(0, str(_ROOT / "tools"))
from eval_physio_sqi import candidates  # noqa: E402  (reuse extraction + SQIs)

FEAT = ["rsa", "skew", "period", "pi", "plv", "lf", "multisite", "snr"]


def main():
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import LeaveOneGroupOut

    stems = ["1", "3", "4", "5", "6", "7", "8"]
    rows = []
    for s in stems:
        df, tgt = candidates(s)
        df = df[(df.bpm >= 70) & (df.bpm <= 220)].copy()
        df["stem"] = s; df["target"] = tgt
        df["y"] = (abs(df.bpm - tgt) <= 15).astype(int)   # "correct" candidate
        rows.append(df)
    data = pd.concat(rows, ignore_index=True)
    X = data[FEAT].fillna(0).values
    y = data["y"].values
    groups = data["stem"].values
    print(f"candidates={len(data)}  positives={y.sum()}  clips={len(stems)}")

    logo = LeaveOneGroupOut()
    errs, picks = [], []
    for tr, te in logo.split(X, y, groups):
        if y[tr].sum() < 2:            # need positive examples to learn
            continue
        clf = RandomForestClassifier(n_estimators=300, random_state=0, class_weight="balanced")
        clf.fit(X[tr], y[tr])
        proba = clf.predict_proba(X[te])[:, 1]
        sub = data.iloc[te].copy(); sub["p"] = proba
        pick = sub.sort_values("p", ascending=False).iloc[0]
        e = abs(pick.bpm - pick.target)
        errs.append(e); picks.append((pick.stem, pick.bpm, pick.target, round(e, 1)))
    print("\nheld-out (leave-one-clip-out) picks:")
    for st, bpm, tgt, e in picks:
        print(f"  stem {st}: pred={bpm:6.1f}  target={tgt:6.1f}  err={e}")
    print(f"\n[learned selector]  MAE = {np.mean(errs):.1f} bpm   (RSA hand rule = 30.8, oracle 10.1)")
    print("  -> ML helps only if < 30.8; with n=7 clips expect high variance / overfit")


if __name__ == "__main__":
    main()
