#!/usr/bin/env python3
"""Held-out re-evaluation: A+B anatomical extraction + RSA selection vs the current
default (cached anatomical pipeline + physiology gating). Fixed rule, no training.

    python tools/eval_rsa_holdout.py
"""
from __future__ import annotations
import sys
from pathlib import Path
import numpy as np

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))
from petvitals.core.session import Session          # noqa: E402
from petvitals.analyzers.rppg import RppgAnalyzer    # noqa: E402
from petvitals.signal.rsa_select import estimate_hr_rsa  # noqa: E402
from petvitals.core.keypoints import resolve_keypoints_path  # noqa: E402

TARGET = {"1": 175, "3": 210, "4": 115.5, "5": 135, "6": 90, "7": 189.5, "8": 110.5}


def main() -> None:
    default = RppgAnalyzer()
    rows = []
    print("stem  target   default(cached)   RSA(A+B)   ")
    for s, tgt in TARGET.items():
        if resolve_keypoints_path(s) is None:
            continue
        sess = Session.from_stem(s)
        d = default.analyze(sess).summary.get("hr_bpm")
        rsa = estimate_hr_rsa(sess).get("hr_bpm")
        ed = abs(d - tgt) if d else np.nan
        er = abs(rsa - tgt) if rsa else np.nan
        rows.append((ed, er))
        print(f"  {s}   {tgt:6.1f}   {str(d):>7}  (err {ed:5.1f})   {str(rsa):>7}  (err {er:5.1f})")
    a = np.array(rows, float)
    md, mr = np.nanmean(a[:, 0]), np.nanmean(a[:, 1])
    print(f"\n[MAE]  default(cached)={md:.1f}   RSA(A+B)={mr:.1f}   (n={len(rows)})")
    print("  -> promote RSA to default if it clearly beats cached without bad regressions")


if __name__ == "__main__":
    main()
