#!/usr/bin/env python3
"""Backward-compatible shim — posture overlay now lives in the petvitals package.

    python tools/visualize_pose.py --stem 3 --sample-frames 4
is equivalent to
    python -m petvitals viz --stem 3 --sample-frames 4

Logic: petvitals/viz/overlay.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # repo root on path
from petvitals.cli import main  # noqa: E402

if __name__ == "__main__":
    argv = sys.argv[1:]
    if argv and argv[0] not in ("run", "viz", "list"):
        argv = ["viz", *argv]
    main(argv)
