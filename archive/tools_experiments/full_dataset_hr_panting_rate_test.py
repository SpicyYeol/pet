#!/usr/bin/env python3
"""
전체 데이터셋 테스트: HR + Panting Rate (호흡수)

라벨 없는 상황에서도 동작하는 최소한의 전체 데이터 테스트 스크립트.

- HR: raw RGB window가 있으면 프로젝트 함수로 추정 (없으면 스킵 또는 간단 추정)
- Panting Rate: 각 비디오의 keypoint CSV를 로드 → compute_panting_proxy 로직 재현 → periodogram으로 rate 추정
  (이 부분은 라벨 없이도 가능)

사용법:
    python tools/full_dataset_hr_panting_rate_test.py

결과: 비디오별 Target HR, Estimated HR, Estimated Panting Rate, Confidence 출력
"""

import numpy as np
import pandas as pd
from pathlib import Path
from scipy import signal
import sys

sys.path.insert(0, str(Path(__file__).parent))

try:
    from evaluate_rppg_methods import estimate_bpm_from_signal
    HAS_PROJECT_EST = True
except:
    HAS_PROJECT_EST = False

# Usable videos
USABLE = ['1', '3', '4', '5', '6', '7', '8']
FS = 10.0

def find_keypoint_csv(stem: str) -> Path | None:
    """Find the most recent keypoint CSV for a video stem."""
    base = Path("reports/rppg_pet_keypoints")
    candidates = []
    for folder_name in [f"dlc_probe_{stem}_gpu", f"dlc_probe_{stem}"]:
        folder = base / folder_name
        if folder.exists():
            csv = folder / "pet_keypoints_normalized.csv"
            if csv.exists():
                candidates.append((csv, folder.stat().st_mtime))
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates[0][0]

def compute_panting_proxy_simple(kps_df: pd.DataFrame, n_frames: int) -> np.ndarray:
    """Reproduce the proxy logic used in the main pipeline."""
    proxies = []
    for fi in range(n_frames):
        upper = _get_center(kps_df, fi, ["upper_jaw"])
        lower = _get_center(kps_df, fi, ["lower_jaw"])
        lm = _get_center(kps_df, fi, ["mouth_end_left"])
        rm = _get_center(kps_df, fi, ["mouth_end_right"])
        re = _get_center(kps_df, fi, ["right_earbase"])
        le = _get_center(kps_df, fi, ["left_earbase"])

        vertical = abs(upper[1] - lower[1]) if (upper and lower) else 0.0
        lateral = abs(lm[0] - rm[0]) if (lm and rm) else 0.0
        ear_m = abs(re[1] - le[1]) * 0.3 if (re and le) else 0.0

        proxy = vertical * 0.55 + lateral * 0.35 + ear_m * 0.10
        proxies.append(proxy)

    arr = np.array(proxies, dtype=float)
    if len(arr) > 5:
        arr = signal.savgol_filter(arr, min(11, len(arr)//2*2 + 1 or 5), 2)
    if arr.std() > 1e-6:
        arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    return arr

def _get_center(kps_df, frame_idx, kp_names):
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())

def estimate_panting_rate(proxy: np.ndarray, fs: float = 10.0,
                          min_bpm: float = 50, max_bpm: float = 320) -> tuple[float, float]:
    if len(proxy) < fs * 5:
        return np.nan, 0.0
    x = proxy - np.mean(proxy)
    if np.std(x) < 1e-6:
        return np.nan, 0.0

    nfft = 2048
    f, Pxx = signal.periodogram(x, fs=fs, window='hann', nfft=nfft)
    mask = (f >= min_bpm/60) & (f <= max_bpm/60)
    if mask.sum() < 3:
        return np.nan, 0.0

    f_band = f[mask]
    P_band = Pxx[mask]
    peak_idx = np.argmax(P_band)
    rate_bpm = f_band[peak_idx] * 60
    conf = float(P_band[peak_idx] / (np.median(P_band) + 1e-12))
    if conf < 2.0:
        return np.nan, conf
    return rate_bpm, conf

def load_raw_rgb(stem: str) -> np.ndarray | None:
    path = Path(f"reports/rppg_pet_keypoints/raw_trace_diagnostics/video{stem}_raw_rgb_window.npz")
    if not path.exists():
        return None
    return np.load(path)["rgb"]

def simple_hr(rgb: np.ndarray) -> float:
    if HAS_PROJECT_EST:
        bpm, _, _ = estimate_bpm_from_signal(rgb[:, 1], FS, 70, 240)
        return bpm
    # fallback
    g = rgb[:, 1] - np.mean(rgb[:, 1])
    f, P = signal.periodogram(g, fs=FS, window='hann', nfft=512)
    mask = (f >= 70/60) & (f <= 240/60)
    if mask.sum() < 3:
        return np.nan
    return f[mask][np.argmax(P[mask])] * 60

def main():
    labels = pd.read_csv("dataset_front/video_labels_ocr.csv")
    gt = {str(row.video).replace('.mp4',''): row.bpm_target for _, row in labels.iterrows() if row.usable}

    print("=== 전체 데이터 HR + Panting Rate 테스트 (라벨 없는 호흡수 추정) ===\n")
    results = []

    for stem in USABLE:
        print(f"Processing Video {stem} ...", end=" ")

        # 1. HR
        rgb = load_raw_rgb(stem)
        hr = simple_hr(rgb) if rgb is not None else np.nan

        # 2. Panting Rate (proxy 기반)
        kps_path = find_keypoint_csv(stem)
        if kps_path is None:
            print("No keypoint CSV found → skip panting rate")
            results.append({
                "video": stem,
                "target_hr": gt.get(stem, np.nan),
                "est_hr": round(hr, 1) if np.isfinite(hr) else None,
                "panting_rate": None,
                "confidence": None,
                "note": "No keypoints"
            })
            continue

        kps = pd.read_csv(kps_path)
        n_frames = kps["frame_index"].nunique()
        proxy = compute_panting_proxy_simple(kps, n_frames)
        rate, conf = estimate_panting_rate(proxy)

        results.append({
            "video": stem,
            "target_hr": gt.get(stem, np.nan),
            "est_hr": round(hr, 1) if np.isfinite(hr) else None,
            "panting_rate": round(rate, 1) if np.isfinite(rate) else None,
            "confidence": round(conf, 2) if np.isfinite(conf) else None,
            "note": ""
        })
        print(f"Panting Rate: {rate:.1f} (conf={conf:.1f})")

    df = pd.DataFrame(results)
    print("\n" + "="*90)
    print(df.to_string(index=False))
    print("\n※ Panting Rate는 keypoint proxy의 주파수 분석으로 라벨 없이 추정됨")
    print("※ 실제 정확도는 수동 검증 또는 추가 라벨링이 필요함")

if __name__ == "__main__":
    main()