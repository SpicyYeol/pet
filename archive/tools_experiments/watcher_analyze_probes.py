#!/usr/bin/env python3
"""
Watcher for DLC Probes → Automatic Analysis + Comparison

When a new probe manifest reaches "completed" status, this script will automatically:
1. Normalize the H5 (if needed)
2. Run Anatomical + Aggressive Rejection analysis
3. Update the multi-video comparison table

Usage:
    python tools/watcher_analyze_probes.py --interval 60

It will keep running until you stop it (Ctrl+C).
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Set

BASE_DIR = Path("reports/rppg_pet_keypoints")
STATE_FILE = BASE_DIR / ".processed_probes.json"

def load_processed() -> Set[str]:
    if STATE_FILE.exists():
        try:
            return set(json.loads(STATE_FILE.read_text(encoding="utf-8")))
        except Exception:
            return set()
    return set()

def save_processed(processed: Set[str]):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(sorted(processed), indent=2), encoding="utf-8")

def find_completed_probes() -> dict[str, Path]:
    """
    Returns {stem: manifest_path} for all probes that have status == "completed"
    Handles both dlc_probe_* and the special dlc_full4 case.
    """
    results = {}

    # Normal probes
    for manifest in BASE_DIR.glob("dlc_probe_*/dlc_probe_manifest.json"):
        try:
            data = json.loads(manifest.read_text(encoding="utf-8"))
            if data.get("status") == "completed":
                folder = manifest.parent.name  # e.g. dlc_probe_3
                stem = folder.replace("dlc_probe_", "")
                results[stem] = manifest
        except Exception:
            continue

    # Special case: full video 4
    full4_manifest = BASE_DIR / "dlc_full4" / "dlc_probe_manifest.json"
    if full4_manifest.exists():
        try:
            data = json.loads(full4_manifest.read_text(encoding="utf-8"))
            if data.get("status") == "completed":
                results["4"] = full4_manifest
        except Exception:
            pass

    return results

def run_command(cmd: list[str], description: str) -> bool:
    print(f"\n[RUN] {description}")
    print(f"      Command: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout.strip()[-500:])  # last 500 chars
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Command failed: {e}")
        if e.stdout:
            print(e.stdout[-1000:])
        if e.stderr:
            print(e.stderr[-1000:])
        return False

def process_stem(stem: str, manifest_path: Path) -> bool:
    """Run the full pipeline for one stem."""
    print(f"\n{'='*60}")
    print(f"Processing new completed probe: {stem}")
    print(f"Manifest: {manifest_path}")
    print(f"{'='*60}")

    base_dir = manifest_path.parent

    # Find H5
    h5_files = list(base_dir.glob("*_superanimal*.h5"))
    if not h5_files:
        # fallback for full4
        h5_files = list(base_dir.glob("*.h5"))
    if not h5_files:
        print(f"[ERROR] No H5 file found for stem '{stem}'")
        return False

    h5_path = h5_files[0]
    normalized_csv = base_dir / "pet_keypoints_normalized.csv"
    clip_path = base_dir / f"{stem}_dlc_probe.mp4" if stem != "4" else base_dir / "4_dlc_probe.mp4"

    # 1. Normalize (if needed)
    if not normalized_csv.exists():
        cmd = [
            sys.executable,
            "tools/normalize_dlc_h5.py",
            "--h5", str(h5_path),
            "--video-name", f"{stem}.mp4",
            "--out", str(normalized_csv)
        ]
        if not run_command(cmd, f"Normalizing H5 for {stem}"):
            return False
    else:
        print(f"[SKIP] Normalized CSV already exists for {stem}")

    # 2. Run analysis (aggressive)
    cmd = [
        sys.executable,
        "tools/analyze_video.py",
        "--stem", stem,
        "--aggressive",
    ]
    if not run_command(cmd, f"Running Anatomical + Aggressive Rejection analysis for {stem}"):
        return False

    # 3. Update comparison table
    cmd = [sys.executable, "tools/compare_anatomical_results.py"]
    if not run_command(cmd, "Updating multi-video comparison table"):
        return False

    print(f"\n[SUCCESS] Finished processing {stem}")
    return True

def main():
    parser = argparse.ArgumentParser(description="Auto watcher for DLC probes + analysis")
    parser.add_argument("--interval", type=int, default=60, help="Check interval in seconds (default: 60)")
    args = parser.parse_args()

    print("=== DLC Probe Auto-Analysis Watcher ===")
    print(f"Monitoring: {BASE_DIR}")
    print(f"Check interval: {args.interval}s")
    print("Press Ctrl+C to stop.\n")

    processed = load_processed()

    try:
        while True:
            completed = find_completed_probes()
            new_completed = {s: p for s, p in completed.items() if s not in processed}

            if new_completed:
                print(f"\n[INFO] Found {len(new_completed)} new completed probe(s): {list(new_completed.keys())}")

                for stem, manifest in sorted(new_completed.items()):
                    success = process_stem(stem, manifest)
                    if success:
                        processed.add(stem)
                        save_processed(processed)
                    else:
                        print(f"[WARN] Processing failed for {stem}. Will retry next cycle.")

            else:
                print(f"[INFO] No new completed probes. Checking again in {args.interval}s...")

            time.sleep(args.interval)

    except KeyboardInterrupt:
        print("\n[INFO] Watcher stopped by user.")
    except Exception as e:
        print(f"\n[FATAL] Watcher crashed: {e}")
        raise

if __name__ == "__main__":
    main()
