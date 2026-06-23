#!/usr/bin/env python3
"""Backward-compatible shim — the pose classifier now lives in the petvitals package.

    python tools/pose_classifier.py --stem 3
is equivalent to
    python -m petvitals run --stem 3 --analyzers pose

Logic: petvitals/analyzers/pose.py  (config: PoseConfig).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # repo root on path
from petvitals.cli import main  # noqa: E402

if __name__ == "__main__":
    argv = sys.argv[1:]
    # map the legacy flat invocation onto `run --analyzers pose`
    if argv and argv[0] not in ("run", "viz", "list"):
        argv = ["run", "--analyzers", "pose", *argv]
    main(argv)
