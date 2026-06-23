#!/usr/bin/env python3
"""
Targeted watcher for GPU probes of video 3 and 7.
When they reach "completed", it automatically runs:
- Normalization (using GPU venv Python)
- Aggressive anatomical + rejection analysis
- Comparison table update

Run this in background while the GPU probes are generating.
"""

import json
import subprocess
import sys
import time
from pathlib import Path

BASE = Path("reports/rppg_pet_keypoints")
GPU_PYTHON = Path(".venv-dlc-gpu/Scripts/python.exe")

TARGETS = {
    "3": BASE / "dlc_probe_3_gpu" / "dlc_probe_manifest.json",
    "7": BASE / "dlc_probe_7_gpu" / "dlc_probe_manifest.json",
}

PROCESSED = set()

def is_completed(manifest_path: Path) -> bool:
    if not manifest_path.exists():
        return False
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        return data.get("status") == "completed"
    except Exception:
        return False

def run_cmd(cmd: list, desc: str):
    print(f"\n[RUN] {desc}")
    print(f"      {' '.join(map(str, cmd))}")
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout.strip()[-300:] if result.stdout else "")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] {e}")
        if e.stdout:
            print(e.stdout[-500:])
        if e.stderr:
            print(e.stderr[-500:])
        return False

def process_video(stem: str):
    base_dir = BASE / f"dlc_probe_{stem}_gpu"
    h5_files = list(base_dir.glob("*_superanimal*.h5"))
    if not h5_files:
        print(f"[WARN] No H5 found for {stem}_gpu")
        return False

    h5_path = h5_files[0]
    normalized_csv = base_dir / "pet_keypoints_normalized.csv"

    # 1. Normalize
    if not normalized_csv.exists():
        cmd = [
            str(GPU_PYTHON),
            "tools/normalize_dlc_h5.py",
            "--h5", str(h5_path),
            "--video-name", f"{stem}.mp4",
            "--out", str(normalized_csv),
        ]
        if not run_cmd(cmd, f"Normalizing {stem}_gpu"):
            return False
    else:
        print(f"[SKIP] Normalized CSV already exists for {stem}_gpu")

    # 2. Run analysis (aggressive)
    cmd = [
        sys.executable,  # Use main Python for analysis (has YOLO + GPU support)
        "tools/analyze_video.py",
        "--stem", stem,
        "--aggressive",
    ]
    if not run_cmd(cmd, f"Running aggressive anatomical analysis for {stem}"):
        return False

    # 3. Update comparison table
    cmd = [sys.executable, "tools/compare_anatomical_results.py"]
    if not run_cmd(cmd, "Updating comparison table"):
        return False

    print(f"\n[SUCCESS] Finished automated pipeline for {stem}_gpu")
    return True

def main():
    print("=== GPU Probe Watcher for 3 & 7 (Aggressive Analysis) ===")
    print("Monitoring dlc_probe_3_gpu and dlc_probe_7_gpu...")
    print("Press Ctrl+C to stop.\n")

    try:
        while True:
            for stem, manifest_path in TARGETS.items():
                if stem in PROCESSED:
                    continue
                if is_completed(manifest_path):
                    print(f"\n[DETECTED] {stem}_gpu probe completed!")
                    if process_video(stem):
                        PROCESSED.add(stem)
                    else:
                        print(f"[WARN] Processing failed for {stem}. Will retry next cycle.")

            if len(PROCESSED) == len(TARGETS):
                print("\n[INFO] All target GPU probes processed. Watcher exiting.")
                break

            time.sleep(30)  # Check every 30 seconds

    except KeyboardInterrupt:
        print("\n[INFO] Watcher stopped by user.")

if __name__ == "__main__":
    main()
