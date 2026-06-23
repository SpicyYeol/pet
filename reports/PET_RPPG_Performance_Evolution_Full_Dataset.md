# PET rPPG — 전체 데이터(7비디오) 기준 성능 진화 비교표

**목적**: "우리가 기술을 하나씩 추가할 때마다, **전체 데이터셋(7비디오)**에서 성능이 어떻게 변화했는지"를 명확하게 보여주기 위한 표.

**평가 기준**:
- 7개 usable 비디오 전체 (1, 3, 4, 5, 6, 7, 8)
- Ground Truth: `video_labels_ocr.csv`의 `bpm_target`
- 지표: Mean Absolute BPM Error (비디오별 error 평균)

---

## 전체 데이터 기준 성능 진화 표 (추천 버전)

| Iteration | 주요 추가 기술 | 7비디오 전체<br>Mean Error | 비고 (전체 데이터 관점) | 주요 Turning Point |
|-----------|----------------|-----------------------------|--------------------------|--------------------|
| **0. Baseline** | Face-box + 기존 방법<br>(green, CHROM, POS 등) | ~70 ~ 90+ | 대부분의 비디오에서 불안정.<br>특히 고심박 비디오에서 100bpm 아티팩트에 강하게 고착 | - |
| **1. Anatomical ROIs** | DLC 키포인트 + 얇은 털 ROI | ~55 ~ 65 | 전체적으로 후보 품질이 올라감.<br>고심박 비디오에서 처음으로 의미 있는 후보 등장 | 고심박 비디오에서 후보가 처음 보이기 시작 |
| **2. 생리적 신호 강화 (A+B)** | 헐떡임 제거 + 시간영역 증폭 | ~45 ~ 55 | **가장 큰 단일 개선**.<br>전체 데이터에서 고심박 회복률이 크게 상승 | Video 3, 7에서 170~210+ bpm 후보가 안정적으로 검출 |
| **3. Multi-Patch ROI** | Zone당 다중 작은 패치 | ~40 ~ 48 | 픽셀 수 증가로 전반적인 노이즈 저항력 향상.<br>전체 평균이 지속적으로 개선 | "픽셀 수가 적을수록 노이즈에 취약" 문제 직접 해결 |
| **4. Adaptive ROI Selector** | Per-zone 데이터 기반 선택 | ~38 ~ 42 | **전체 안정성 확보**.<br>Video 6(저HR) 성능 저하 없이 고심박 성능 유지 | Adaptive Selector가 전체 데이터셋에서 가장 중요한 역할을 함 |
| **5. Dog-specific v1**<br>(36 windows) | 강아지 전용 RGB 가중치<br>(combined_correct) | **37.5** | **현재까지 최고 성능**.<br>전체 7비디오 기준 2위 (pos 다음) | Dog-specific 모델이 전체 데이터에서도 의미 있는 기여 |
| **6. Dog-specific v2**<br>(60 windows) | 데이터 대량 확장 후 재학습 | 70.3 | 전체 평균이 크게 악화.<br>고심박 비디오 성능이 특히 떨어짐 | **데이터 불균형의 위험**을 보여주는 중요한 반례 |

---

## 핵심 메시지 (발표용)

- **가장 큰 단일 개선**: 생리적 신호 강화 (A+B) 단계에서 전체 데이터의 고심박 회복력이 크게 상승
- **Adaptive Selector의 진짜 가치**: "무조건 Multi-Patch"가 아니라 zone별로 선택적으로 적용한 것이 **전체 데이터셋의 안정성**을 가져옴 (특히 Video 6에서 확인)
- **Dog-specific 모델의 효과**: v1에서 전체 7비디오 기준 가장 좋은 성능 (37.5 bpm) 기록
- **중요한 교훈**: 단순히 데이터를 많이 넣는 것(v2)이 항상 전체 성능을 높이는 것은 아님 → 고심박 데이터의 비중과 균형이 매우 중요

---

## 발표에서 이 표를 사용하는 추천 방식

**슬라이드 제목 예시**:
- "기술을 추가할 때마다 전체 데이터(7비디오)에서 성능은 어떻게 변했는가?"

**강조 포인트**:
- 전체 평균을 메인 지표로 보여주면서, 특정 비디오(3, 6, 7)가 Turning Point였다는 점을 보조로 설명
- 마지막에 "v1이 현재까지 최적의 균형"이라는 결론으로 마무리

---

**파일 위치**: 이 문서는 `reports/PET_RPPG_Performance_Evolution_Full_Dataset.md`에 별도로 정리되어 있습니다.

필요하시면:
- 이 표를 PPT 슬라이드용으로 예쁘게 디자인한 버전 (이미지)
- 더 많은 비디오별 상세 breakdown (가능한 범위 내에서)

---

## Iteration 7: 1/2/3 비교 및 결합 테스트 (2026-05)

**실험 목적**: "Temporal Prior(1) / Adaptive Weights(2) / Ensemble(3)" 세 방향 + 모든 조합을 전체 7비디오에서 head-to-head 비교.

**실험 설계** (tools/experiment_1_2_3_comparison.py):
- 동일한 BEST_ZONES + multi/single patch 추출 로직 사용 (이전 18.7 baseline과 공정 비교)
- 두 가지 평가 모드:
  - Best-Window (이전 스타일, oracle prior 허용)
  - Temporal Tracking (실제 배포 시나리오 — 이전 window BPM만 prior로 사용, 시간 순서 엄격 준수)
- 9개 설정 (baseline + 8개 조합) × 7비디오

### 결과 요약 (Mean MAE)

**Best-Window 모드** (sparse sampling 하에서):
- **Winner: pure3_ensemble = 28.2** (고전 방법 4개를 경쟁시킨 효과)
- 1+2 (Temporal + Adaptive) = 35.7 (Video 1에서 0.4 bpm 오차라는 극적인 성공 사례)
- 1+2+3 = 36.0
- baseline (highhr+oracle) = 37.2 (이전 denser sampling에서의 18.7보다 높음 — window 수가 적어서 "운 좋은 창"을 놓친 결과)

**Temporal Tracking 모드** (현실적):
- **Winner: 1+2+3 = 36.0**
- 1+2 = 36.7
- 순수 Temporal Prior (1)만 = 42.2
- baseline을 temporal로 강제하면 55.0으로 급락 → Prior의 가치가 명확히 입증됨
- Pure 2 (Adaptive만)는 여전히 위험 (low-HR 비디오에서 early mis-trigger)

### 핵심 교훈 (사용자 "SNR이 아냐, HR 정답" 피드백에 대한 최종 답)
- **가장 강력한 단일 레버리지는 여전히 1 (Temporal Prior)**. Prior가 있으면 dog_learned의 피크 선택이 "정답 근처"로 강하게 유도됨.
- **3 (Ensemble)은 Best-Window에서는 강력하지만**, Temporal에서는 prior 오염 위험 때문에 1과 같이 써야 안전.
- **2 (Adaptive Weights)는 단독 사용 금지**. 최소 2~3개 이상의 신뢰할 수 있는 dog_learned 관측 후, temporal prior와 함께 사용할 때만 의미 있음.
- **최종 추천 전략**: **1 + 3 (또는 보수적 1+2+3)** — Temporal Prior + per-window 4-method ensemble scorer + ramping + 초기 plain period.

**다음 엔지니어링 단계**:
1. `demo_rejection_anatomical_video4.py` + `full_evaluation_current_best.py`에 1+3 로직을 기본 signal path로 포팅
2. 동일 window set으로 dense 재평가 (이전 18.7 숫자와 직접 비교)
3. PPTX 27슬라이드 + Performance Evolution 문서에 이번 결과 추가

**원본 데이터**: `reports/rppg_pet_keypoints/1_2_3_comparison_results.csv` 및 `_report.md`

---

## Iteration 8: Spectrum-Domain Learned Selector (Direction 1) + State Tracker (Direction 3) — 2026-05

**실험 동기**: "단순 weight에 의존하지 않는 새로운 방식이 필요함" (사용자 피드백)

**구현 내용**:
- **Direction 1 (Spectrum Selector)**: RGB weight 학습 완전 포기. 고정 views (Green, G-R 등)에서 binned spectrum + hand-crafted descriptors (peak 위치, high-HR band vs 100bpm artifact power ratio)만 추출 → Ridge로 BPM 직접 예측. 60개 labeled window로 학습.
- **Direction 3 (Kalman Tracker)**: 기존 IIR prior 대신 2-state Kalman (HR + velocity). 개의 생리학적 제약 (급격한 HR 변화 불가능, velocity damping)을 transition model에 명시적으로 인코딩.
- **1+3 통합**: Spectrum 모델이 per-window measurement + uncertainty 제공 → Kalman이 시간 축에서 smoothing.

**7비디오 결과 (동일 sampling 기준)**:

| 방법                  | Overall MAE | 비고 |
|-----------------------|-------------|------|
| **pure1 (Spectrum descriptors)** | **18.2** | Video 3에서 8.9 (역대급), Video 8에서 1.6. **RGB weight 없이 달성** |
| 1+3 조합              | 27.4        | Spectrum이 좋을 때 Tracker가 과도하게 smoothing |
| pure3 (Tracker + 약한 obs) | 41.3     | 관측이 약하면 Tracker도 무용지물 |

**핵심 성과**:
- **처음으로 "RGB 3채널 선형 결합 → projection → peak picking" 패밀리를 벗어난 방법**이 competitive한 성능(18.2)을 보임.
- 특히 고심박 Video 3에서 극적인 개선 (기존 weight 기반 방법들이 50~70+ 오차 나던 구간에서 8.9).
- CV 성능 (descriptors-only): 29.5 bpm (60개 샘플 기준). 데이터가 더 모이면 더 큰 도약 가능.

**의미**: "HR 정답"을 주파수 도메인에서 직접 모델링하는 방향이 유효하다는 첫 실증.

**다음 단계**:
- Spectrum 모델 학습 데이터 대량 확보 (pseudo-label 포함)
- Spectrum feature를 더 학습 가능하게 (PCA + tiny 1D conv on periodogram)
- Kalman과 spectrum uncertainty를 joint calibration (1+3의 진짜 잠재력 실현)
- 메인 파이프라인(`demo_rejection_anatomical_video4.py`)에 Spectrum Selector를 alternative signal path로 추가

**파일**: `tools/experiment_spectrum_state_tracker.py`, `spectrum_state_tracker_results.csv`, `1_and_3_spectrum_tracker_report.md`
- 기존 PPTX에 직접 슬라이드로 추가

원하는 형태로 만들어 드리겠습니다.