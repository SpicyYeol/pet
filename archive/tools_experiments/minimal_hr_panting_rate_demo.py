#!/usr/bin/env python3
"""
Minimal Demo: HR + Panting Rate (호흡수) dual extraction

이 스크립트는 라벨 없이도 동작하는 최소한의 데모입니다.

핵심 아이디어:
- HR: RGB 신호에서 기존 rPPG 방법 (여기서는 간단히 green 채널)으로 추정
- Panting Rate (호흡수): 이미 만들고 있는 panting_proxy의 주파수 분석으로 추정

라벨이 없어도 되는 이유:
- HR은 (간접적이지만) RGB 색상 변화로 추정 가능
- Panting Rate는 키포인트 proxy 자체가 motion 관측값이기 때문에,
  그 신호의 dominant frequency를 찾으면 rate가 나옴.

실제 프로젝트에서는:
- compute_panting_proxy()로 proxy를 만들고
- 여기서 estimate_panting_rate(proxy) 호출
- HR은 기존 Spectrum / Kalman 파이프라인 사용

실행:
    python tools/minimal_hr_panting_rate_demo.py
"""

import numpy as np
from scipy import signal
from pathlib import Path

# 프로젝트 기존 함수 재사용 (가능한 경우)
try:
    import sys
    sys.path.insert(0, str(Path(__file__).parent))
    from evaluate_rppg_methods import estimate_bpm_from_signal
    USE_PROJECT_ESTIMATOR = True
except Exception:
    USE_PROJECT_ESTIMATOR = False
    print("[Info] 프로젝트 estimate_bpm_from_signal을 찾을 수 없어 간단한 green 방식으로 대체합니다.")


def estimate_panting_rate(proxy: np.ndarray, fs: float = 10.0,
                          min_bpm: float = 50, max_bpm: float = 320) -> tuple[float, float]:
    """
    panting_proxy에서 호흡수(breaths per minute) 추정.
    라벨이 전혀 필요 없습니다. proxy가 이미 motion을 관측하고 있기 때문.
    """
    if len(proxy) < fs * 5:
        return np.nan, 0.0

    x = proxy - np.mean(proxy)
    if np.std(x) < 1e-6:
        return np.nan, 0.0

    # Periodogram이 rate 추정에 더 안정적
    nfft = 2048
    f, Pxx = signal.periodogram(x, fs=fs, window='hann', nfft=nfft)

    mask = (f >= min_bpm / 60) & (f <= max_bpm / 60)
    if mask.sum() < 3:
        return np.nan, 0.0

    f_band = f[mask]
    P_band = Pxx[mask]

    peak_idx = np.argmax(P_band)
    rate_bpm = f_band[peak_idx] * 60
    confidence = float(P_band[peak_idx] / (np.median(P_band) + 1e-12))

    if confidence < 2.0:
        return np.nan, confidence

    return rate_bpm, confidence


def simple_hr_from_green(rgb: np.ndarray, fs: float = 10.0) -> float:
    """매우 단순한 HR 추정 (데모용). 실제로는 Spectrum/Kalman 사용."""
    g = rgb[:, 1] - np.mean(rgb[:, 1])

    if USE_PROJECT_ESTIMATOR:
        bpm, _, _ = estimate_bpm_from_signal(g, fs, 70, 240)
        return bpm
    else:
        # fallback: periodogram peak
        f, P = signal.periodogram(g, fs=fs, window='hann', nfft=512)
        mask = (f >= 70/60) & (f <= 240/60)
        if mask.sum() < 3:
            return np.nan
        return f[mask][np.argmax(P[mask])] * 60


def main():
    print("=" * 60)
    print("최소 데모: HR + Panting Rate (호흡수) 동시 추출")
    print("라벨 없이 동작 (proxy가 motion 관측값이기 때문)")
    print("=" * 60)

    # === 1. 실제 데이터 로드 (raw RGB window) ===
    data_path = Path("reports/rppg_pet_keypoints/raw_trace_diagnostics/video3_raw_rgb_window.npz")
    if not data_path.exists():
        print(f"[경고] {data_path} 가 없습니다. 합성 데이터로 데모를 실행합니다.")
        # 합성 데이터 생성 (고심박 + 강한 panting 상황 가정)
        fs = 10.0
        t = np.arange(0, 20, 1/fs)
        hr_hz = 3.5          # 210 bpm
        pant_hz = 2.8        # 168 panting/min (강한 panting)
        rgb = np.zeros((len(t), 3))
        rgb[:, 1] = 0.8 * np.sin(2 * np.pi * hr_hz * t)          # cardiac in green
        rgb[:, 1] += 0.3 * np.sin(2 * np.pi * pant_hz * t)       # 일부 panting 영향
        rgb += 0.15 * np.random.randn(*rgb.shape)

        # 실제 프로젝트에서는 키포인트로 만드는 proxy를 여기서 시뮬레이션
        proxy = 1.5 * np.sin(2 * np.pi * pant_hz * t) + 0.4 * np.random.randn(len(t))
    else:
        data = np.load(data_path)
        rgb = data['rgb']
        fs = 10.0
        print(f"[로드] {data_path.name} 사용 (shape={rgb.shape})")

        # 실제 proxy가 없으므로, 이 데모에서는 "강한 panting이 있었다"고 가정하고
        # proxy를 합성합니다. (실제 사용 시에는 compute_panting_proxy 결과 넣으면 됨)
        # 여기서는 video3이 고심박 + panting이 심한 영상이므로, 그에 맞춰 합성
        pant_hz_demo = 2.5   # 150 bpm 정도의 panting 가정
        proxy = 1.2 * np.sin(2 * np.pi * pant_hz_demo * np.arange(len(rgb)) / fs)
        proxy += 0.6 * np.random.randn(len(proxy))

    # === 2. HR 추정 ===
    hr = simple_hr_from_green(rgb, fs)

    # === 3. Panting Rate (호흡수) 추정 ===
    panting_rate, confidence = estimate_panting_rate(proxy, fs)

    # === 4. 결과 출력 ===
    print("\n[결과]")
    print(f"  HR (Heart Rate)          : {hr:6.1f} bpm")
    print(f"  Panting Rate (호흡수)    : {panting_rate:6.1f} /min   (confidence={confidence:.2f})")
    print("\n※ Panting Rate는 proxy의 주파수 분석으로 라벨 없이 추정됨")
    print("※ 실제 프로젝트에서는 compute_panting_proxy() 결과물을 그대로 넣으면 됩니다.")


if __name__ == "__main__":
    main()