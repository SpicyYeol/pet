#!/usr/bin/env python3
"""
Facial (Panting) Proxy vs Chest (Breathing) Proxy 비교 분석

목적:
- 같은 영상에서 facial proxy로 뽑은 rate와 chest proxy로 뽑은 rate를 비교
- 둘의 차이를 확인하여, 어떤 상황에서 어떤 proxy가 더 적합한지 파악
- Chest motion 기반 호흡 측정이 실제로 의미 있는 차이를 내는지 검증

실행:
    python tools/compare_facial_vs_chest_proxy.py
"""

import numpy as np
import pandas as pd
from pathlib import Path
from scipy import signal
import matplotlib.pyplot as plt

# ============================================================
# 기존 proxy 함수들 (간단히 복붙/재현)
# ============================================================

def get_keypoint_center(kps_df: pd.DataFrame, frame_idx: int, kp_names: list[str]):
    row = kps_df[(kps_df["frame_index"] == frame_idx) & (kps_df["keypoint"].isin(kp_names))]
    if len(row) == 0:
        return None
    return float(row["x"].mean()), float(row["y"].mean())


def compute_facial_panting_proxy(kps_df: pd.DataFrame, n_frames: int) -> np.ndarray:
    """기존 facial panting proxy (jaw + mouth + ear)"""
    proxies = []
    for fi in range(n_frames):
        upper = get_keypoint_center(kps_df, fi, ["upper_jaw"])
        lower = get_keypoint_center(kps_df, fi, ["lower_jaw"])
        lm = get_keypoint_center(kps_df, fi, ["mouth_end_left"])
        rm = get_keypoint_center(kps_df, fi, ["mouth_end_right"])
        re = get_keypoint_center(kps_df, fi, ["right_earbase"])
        le = get_keypoint_center(kps_df, fi, ["left_earbase"])

        vertical = abs(upper[1] - lower[1]) if (upper and lower) else 0.0
        lateral = abs(lm[0] - rm[0]) if (lm and rm) else 0.0
        ear_m = abs(re[1] - le[1]) * 0.3 if (re and le) else 0.0

        proxy = vertical * 0.55 + lateral * 0.35 + ear_m * 0.10
        proxies.append(proxy)

    arr = np.array(proxies, dtype=float)
    if len(arr) > 5:
        arr = signal.savgol_filter(arr, min(11, len(arr)//2*2+1 or 5), 2)
    if arr.std() > 1e-6:
        arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    return arr


def compute_chest_breathing_proxy(kps_df: pd.DataFrame, n_frames: int) -> np.ndarray:
    """개선된 chest motion proxy (neck + back 중심)"""
    proxies = []
    for fi in range(n_frames):
        neck = get_keypoint_center(kps_df, fi, ["neck_base", "neck_end"])
        back = get_keypoint_center(kps_df, fi, ["back_base", "back_middle", "belly_bottom"])

        if neck and back:
            vertical = abs(neck[1] - back[1])
            proxy = vertical * 0.9
        else:
            proxy = 0.0
        proxies.append(proxy)

    arr = np.array(proxies, dtype=float)
    if len(arr) > 7:
        arr = signal.savgol_filter(arr, min(9, len(arr)//2*2+1 or 7), 2)
    if arr.std() > 1e-6:
        arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    return arr


def estimate_rate_from_proxy(proxy: np.ndarray, fs: float = 10.0,
                             min_bpm: float = 8, max_bpm: float = 300) -> tuple[float, float]:
    """Periodogram 기반 rate 추정"""
    if len(proxy) < fs * 6:
        return np.nan, 0.0

    x = proxy - np.mean(proxy)
    if np.std(x) < 1e-6:
        return np.nan, 0.0

    nfft = 4096
    f, Pxx = signal.periodogram(x, fs=fs, window='hann', nfft=nfft)

    mask = (f >= min_bpm / 60) & (f <= max_bpm / 60)
    if mask.sum() < 3:
        return np.nan, 0.0

    f_band = f[mask]
    P_band = Pxx[mask]

    peak_idx = np.argmax(P_band)
    rate_bpm = f_band[peak_idx] * 60
    conf = float(P_band[peak_idx] / (np.median(P_band) + 1e-12))

    if conf < 1.8:
        return np.nan, conf

    return rate_bpm, conf


def main():
    print("=" * 70)
    print("Facial (Panting) Proxy vs Chest (Breathing) Proxy 비교 분석")
    print("=" * 70)

    base = Path("reports/rppg_pet_keypoints")
    test_videos = ["3", "7", "6"]  # 고심박 2개 + 저심박 1개

    results = []

    for stem in test_videos:
        print(f"\n[Video {stem}] 처리 중...")

        # 가장 최근 probe 찾기
        probe_folders = [f"dlc_probe_{stem}_gpu", f"dlc_probe_{stem}"]
        kps_path = None
        for folder_name in probe_folders:
            p = base / folder_name / "pet_keypoints_normalized.csv"
            if p.exists():
                kps_path = p
                break

        if kps_path is None:
            print(f"  → keypoint 파일 없음, 스킵")
            continue

        kps = pd.read_csv(kps_path)
        n_frames = kps["frame_index"].nunique()

        # 두 proxy 계산
        facial_proxy = compute_facial_panting_proxy(kps, n_frames)
        chest_proxy = compute_chest_breathing_proxy(kps, n_frames)

        # Rate 추정 (facial은 high range, chest는 normal range)
        facial_rate, facial_conf = estimate_rate_from_proxy(facial_proxy, min_bpm=40, max_bpm=320)
        chest_rate, chest_conf = estimate_rate_from_proxy(chest_proxy, min_bpm=8, max_bpm=80)

        print(f"  Facial Proxy → {facial_rate:.1f} bpm (conf={facial_conf:.1f})")
        print(f"  Chest Proxy  → {chest_rate:.1f} bpm (conf={chest_conf:.1f})")

        results.append({
            "video": stem,
            "facial_rate": round(facial_rate, 1) if np.isfinite(facial_rate) else None,
            "facial_conf": round(facial_conf, 2),
            "chest_rate": round(chest_rate, 1) if np.isfinite(chest_rate) else None,
            "chest_conf": round(chest_conf, 2),
        })

    # 결과 테이블
    if results:
        df = pd.DataFrame(results)
        print("\n" + "=" * 70)
        print("비교 결과 테이블")
        print("=" * 70)
        print(df.to_string(index=False))

        print("\n해석 가이드:")
        print("- Facial rate가 훨씬 높게 나오면 → 강한 panting 구간")
        print("- Chest rate가 안정적으로 나오고 Facial과 차이가 크면 → thoracic breathing이 별도로 존재")
        print("- 둘 다 비슷하게 나오면 → 호흡과 panting이 잘 구분되지 않는 상황")
    else:
        print("분석할 데이터가 충분하지 않습니다.")


if __name__ == "__main__":
    main()
