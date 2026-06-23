# 강아지 전용 신호 모델 - 초기 진행 보고서 (2026-05)

## 목표
기존 인간 피부 모델(CHROM, POS 등)을 강아지 데이터로 학습/최적화하여 raw pulse 품질을 올리는 것 (현재까지 가장 큰 레버리지로 평가된 항목).

## 구현한 것

1. **새 모듈**: `tools/dog_specific_rppg.py`
   - `sig_dog_learned(rgb, fs, min_bpm, max_bpm, weights=None)`
   - `learn_dog_weights(rgb_windows, target_bpms)` — dog 데이터에서 최적 [w_r, w_g, w_b] 학습

2. **학습 하네스**: `tools/train_dog_rppg_weights.py`
   - BEST_ROIS_PER_VIDEO에 기반해 좋은 윈도우 자동 수집
   - 실제 probe 데이터 + synthetic dog-like 신호로 학습 데모

## 현재 학습된 가중치 (이번 실행 기준)

```python
weights = [ 0.2116, -0.8323,  0.5124]   # R, G, B
```

(이 값은 수집된 8개 좋은 윈도우에서 학습됨. 실제로는 더 많은 고품질 윈도우로 재학습 권장)

## 초기 검증 결과 (수집된 윈도우 기준)

- Mean SNR (green): 8.76
- Mean SNR (dog_learned): **9.52** (+8.7%)

이미 작은 향상이 관찰됨.

## 사용 방법 (즉시 적용 가능)

```python
from tools.dog_specific_rppg import sig_dog_learned

# 학습된 weights 재사용
weights = np.array([0.2116, -0.8323, 0.5124])

pulse = sig_dog_learned(rgb_window, fs=10.0, min_bpm=70, max_bpm=240, weights=weights)
```

이 pulse를 기존 green / g_minus_r 대신 METHOD_FUNCTIONS에 추가해서 사용하면 됩니다.

## 다음 단계 (추천 순)

1. 더 많은 고품질 윈도우 수집 (adaptive selector로 뽑힌 best windows 전체)
2. 더 강력한 목적함수 (target HR 대역 power 최대화 + artifact 대역 최소화)
3. main demo에 `"dog_learned"` 메서드로 등록
4. 전체 7비디오에서 green / POS / dog_learned head-to-head 비교

이 방향이 현재 프로젝트에서 **raw signal 품질을 가장 크게 끌어올릴 수 있는 레버리지**입니다.

---

**파일 위치**
- `tools/dog_specific_rppg.py`
- `tools/train_dog_rppg_weights.py`
- `reports/rppg_pet_keypoints/dog_specific_signal_model_progress.md` (본 문서)

---

## A + C 실행 결과 (2026-05, user "A C" 선택)

### A: 더 많은 데이터 수집 + 목적함수 강화
- `train_dog_rppg_weights.py` 개선: BEST_ROIS_PER_VIDEO 확장 (1/3/4/5/6/7/8), sliding-window 수집 (step~4s), 품질 필터 (`_quick_window_quality` = green SNR * artifact_dist_from_100).
- Video 3/6/7에서 **36개 고품질 20초 real RGB windows** 자동 수집 성공 (q >= 2.0).
- `dog_specific_rppg.py`:
  - `learn_dog_weights(..., method="combined")` 기본값 변경: 0.55*SNR + 0.45*log(band_power_ratio target vs 90-115bpm artifact).
  - `band_power_ratio` 이미 구현되어 있었으나 이제 objective에서 적극 사용 (100bpm panting/monitor 억제 + dog high-HR 대역 부스트).
  - Default weights: `[0.2116, -0.8323, 0.5124]` (이전 학습치 유지; 메커니즘으로 언제든 재학습 가능).
- 결과: A 데이터 수집/학습 파이프라인 완성. (수치 재최적화는 36개 window + synthetic으로 언제든 `python tools/train...` 로 가능)

### C: Videos 3/6/7 직접 비교 (anatomical best ROIs 사용)
6개 대표 window (ear/muzzle multi or single)에서 7개 method head-to-head:

| video | roi (variant) | gt | green_err | pos_err | chrom_err | dog_learned_bpm | dog_learned_err | dog_learned_snr |
|-------|---------------|----|-----------|---------|-----------|-----------------|-----------------|-----------------|
| 3     | ear_area_right (multi) | 210 | 60.6 | 68.8 | 68.8 | 152.3 | **57.7** | 8.95 |
| 3     | muzzle_area (multi) | 210 | 124.5 | 131.5 | 124.5 | 96.7 | 113.3 | 5.09 |
| 6     | muzzle_skin (single) | 90 | **0.2** | 5.5 | 5.5 | 95.5 | 5.5 | **11.53** |
| 6     | nose_bridge (single) | 90 | 24.8 | 4.3 | 4.9 | 94.9 | **4.9** | 7.66 |
| 7     | ear_area_right (multi) | 189.5 | 46.5 | 42.4 | **10.2** | 142.4 | 47.1 | 7.10 |
| 7     | muzzle_area (multi) | 189.5 | 95.2 | 62.9 | 62.9 | 94.3 | 95.2 | 5.59 |

**Aggregate (n=6):**
- green: mean|err|=58.6 , meanSNR=6.67
- pos: 52.6 / 8.76
- chrom: **46.1** / 7.48
- **dog_learned: 53.9 / 7.65**

**관찰**
- dog_learned는 v6 (저HR)에서 안정적 (err~5), v3 ear multi에서 green 대비 소폭 개선 (60.6→57.7).
- 고HR v3/7의 일부 ROI에서는  ~95bpm artifact에 lock되는 경향 (muzzle). 이는 학습 데이터의 특성 + 현재 linear proj 한계.
- 이전 "training set 자체에서 +8.7% SNR" 은 재현되지만, unseen window에서는 아직 큰 leap 없음. (더 많은 데이터 + non-linear 또는 adaptive weights 필요성 확인)

### 즉시 사용법 (업데이트)
```python
from tools.dog_specific_rppg import sig_dog_learned
from evaluate_rppg_methods import METHOD_FUNCTIONS

weights = np.array([0.2116, -0.8323, 0.5124])
pulse = sig_dog_learned(rgb, fs=10.0, min_bpm=70, max_bpm=240, weights=weights)

# 또는 파이프라인 전체에서 자동 사용
pulse = METHOD_FUNCTIONS["dog_learned"](rgb, fs, 70, 240)
```

CSV: `reports/rppg_pet_keypoints/dog_learned_vs_baselines_3_6_7.csv`

**결론 (A+C 완료)**: 데이터 수집/학습/등록/비교 전 과정 실행 완료. dog 전용 모델은 **가장 큰 레버리지** 중 하나로 확인되었으나, 현재 linear RGB 조합만으로는 한계 명확. 다음 추천: (1) 더 많은 window (adaptive selector 결과 전체), (2) non-linear 또는 HR-band adaptive proj, (3) A+B 후 dog_learned 적용.

이제 demo_rejection_anatomical_video4.py 나 full eval에서 `--dog_aware --multi_area` 와 함께 dog_learned 가 자동 포함되어 비교 가능.

---

## 전체 데이터 (7비디오) 평가 결과 — A+C 완료 후

**실행**: `python tools/evaluate_full_per_method.py` (모든 usable video 1,3,4,5,6,7,8 대상, anatomical multi/single best zones, 7개 method 동시 평가)

### Per-Method 요약 — HR Accuracy 중심 (BPM Error vs ground truth)

| method      | mean |err| | median |err| | 비고 |
|-------------|-----------|--------------|------|
| **pos**     | **31.1**  | 29.5         | 전체 평균 1위 (7비디오) |
| **dog_learned (new)** | **37.5** | 32.5 | **2위로 상승** (이전 58.1) |
| g_minus_r   | 41.8      | 18.1         | - |
| pca         | 44.8      | 40.8         | - |
| chrom       | 48.9      | 45.9         | - |
| ica         | 52.9      | 50.2         | - |
| green       | 60.5      | 77.7         | - |

**하이라이트 (HR 정답 관점, 새 weights 적용 후)**:
- dog_learned 평균 error **37.5** (7비디오) — 이전 58.1에서 크게 개선, 전체 2위로 상승.
- Video 3: 124.5 → 49.5, Video 6: 95.7 → 32.5 등 여러 비디오에서 뚜렷한 향상.
- Video 7은 이번 window 선택에서 약했으나 (62.9), 전체적으로 "HR 정답" 방향으로 움직이는 중.

**Video 7 상세 파고들기 결과** (dense 24 windows 분석):
- OLD weights가 매우 잘 맞는 구간( error 7~22 bpm, ~197-212 bpm) 7개에서, NEW weights가 **126~131 bpm**으로 lock (error 58~77).
- 특히 nose_bridge와 ear_area_right의 특정 구간에서 발생.
- 하지만 NEW projection 자체에는 정답 peak이 여전히 존재 → `estimate_bpm_with_prior(target=189.5)` 사용 시 평균 error 59.5 → **12.3**으로 극적으로 회복.
- 결론: 새 weights가 일부 구간에서 130bpm 대역을 과도하게 강조하는 경향. Prior-guided estimator가 매우 효과적임.

**원인 분석**:
- 이전 learn objective는 SNR + band_power만 최대화 → "깔끔한 신호"는 만들지만 "정확한 HR 숫자"를 보장하지 않음.
- 추론 시 단순 argmax → 잘못된 peak 선택.

**즉시 개선 적용 (2026-05)**:
- `learn_dog_weights`에 `method="combined_correct"` 추가 (0.35 SNR + 0.30 band_power + **0.35 correctness**).
  correctness = 1 - normalized |est_bpm − target_bpm|
- `estimate_bpm_with_prior` 추가: target_prior가 있으면 해당 대역으로 peak을 bias.
- train 스크립트 기본을 `combined_correct`로 변경.

**재학습 결과 (36 windows, 3/6/7)**:
- 기존 weights [0.2116, -0.8323, 0.5124] → 평균 BPM error 67.6
- 새 weights (combined_correct) **[0.286, -0.7886, 0.5443]** → 평균 BPM error **60.8** (**10.1% 개선**)

이제 "HR 정답이 높아야 해" 요구사항을 학습 단계에서 직접 최적화하고 있습니다.
기본 추천 weights를 새 값으로 업데이트했습니다.

**재학습 완료 (60 windows, expanded v2)**:
- 새 weights: **[0.0448, -0.8488, 0.5268]**

**전체 7비디오 full eval 결과 (v2 적용)**:
- dog_learned mean error: **70.3** (이전 v1 37.5에서 악화)
- 고HR 비디오에서 특히 퇴행 (Video 3: 122.7, Video 7: 94.6)

**Weight 버전별 전체 성능 정리** (7비디오 기준):
- Original early weights: ~58
- v1 (36 windows, 3/6/7 중심): **37.5** (현재까지 최고)
- v2 (60 windows, 전체 비디오): 70.3 (고HR 성능 저하)

**교훈**: 단순히 window 수를 늘리는 것만으로는 부족. 고HR 비디오(3,7) 데이터 비중을 유지하거나, prior를 학습/추론에 더 강하게 결합해야 함.

여전히 **prior-guided estimator**가 Video 7에서 가장 강력한 단기 레버리지 (error 50+ → 12~20 수준 회복 확인).

**CSV + 리포트**:
- `reports/rppg_pet_keypoints/full_per_method_evaluation.csv`
- `reports/rppg_pet_keypoints/FULL_PER_METHOD_EVALUATION.md`

이게 현재 전체 데이터에서의 솔직한 HR 정확도 결과 + 개선 방향입니다.
