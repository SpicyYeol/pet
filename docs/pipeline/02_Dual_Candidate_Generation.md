# 02. 영역별 Dual Candidate 생성

## 목적
각 해부학적 영역(목, 귀, 주둥이 등)에서 **Single-center** 방식과 **Multi-patch** 방식 두 가지 후보를 모두 생성하여, 이후 품질 기반 선택이 가능하도록 하는 것.

## 왜 Dual Candidate인가?

- 과거: 전역적으로 `--multi_area`를 켜거나 끄는 방식 → Video 6처럼 merge가 해로운 경우 성능 저하
- 현재: **영역별로** single과 multi 중 더 나은 것을 자동 선택
- 이를 위해서는 **두 후보를 동시에 생성**해야 함

## 주요 ROI 정의 (코드 기준)

### Single-center 계열 (`DOG_AWARE_ROIS`)
- `throat_exposed`: `["throat_base", "throat_end"]`, radius=22
- `right_ear_base`: `["right_earbase"]`, radius=16
- `left_ear_base`: `["left_earbase"]`, radius=16
- `muzzle_skin`: `["nose", "upper_jaw"]`, radius=13
- `nose_bridge`: `["nose", "upper_jaw"]`, radius=18

### Multi-patch 계열 (`MULTI_PATCH_AREAS`)
- `throat_area`: 2개 patch (throat_base+throat_end + neck+throat_end)
- `ear_area_right`: 2개 patch (earbase + earend)
- `ear_area_left`: 2개 patch
- `muzzle_area`: 2개 patch (nose+upper_jaw + upper_jaw+mouth_end_right)

## 상세 처리 과정

1. **영역 매핑 정의**
   - 코드에서 `zone_map`으로 관리 (throat, right_ear, left_ear, muzzle)

2. **두 후보 모두 추출**
   - Single: `extract_rgb_single_center()`
   - Multi: `extract_rgb_multi_patch()` (여러 patch의 RGB 평균)

3. **공통 전처리 (평가용)**
   - A+B subtraction (0.85 strength + clipping)
   - Periodicity reinforcement 적용

4. **품질 평가용 메트릭 계산**
   - `best_snr`
   - `post_clean_gr_var`
   - `pixel_mean`
   - `best_bpm` 및 100bpm과의 거리

## 실제 데이터 예시 (Video 3, Right Ear 영역)

- Single (right_ear_base)
  - pixel_mean ≈ 1008
  - post_clean_gr_var ≈ 774
  - best_snr ≈ 22.69
  - Quality ≈ 3.89

- Multi (ear_area_right)
  - pixel_mean ≈ 1453 (+44%)
  - post_clean_gr_var ≈ 484 (-38%)
  - best_snr ≈ 59.67
  - Quality ≈ 14.39

→ Multi가 압도적으로 우수 → 선택

## 관련 코드 위치

- `tools/demo_rejection_anatomical_video4.py` (adaptive 블록)
- `tools/experiment_dual_roi_candidates.py` (독립 실행용)
- `tools/adaptive_roi_selector.py` (품질 계산)

## 시각화 자료

- `presentation_images/10.jpg` (Dual-Candidate Generation 상세 블록 다이어그램)
- `presentation_images/3_frame120_all_rois_kr.jpg` (실제 프레임에 모든 ROI 표시)

## 개선 여지

- 현재는 주요 4개 zone만 dual 후보 생성
- 모든 zone을 대상으로 확장 가능
- 더 많은 patch 조합 (3개 이상) 실험 여지

---

**다음 문서**: [03. A+B 전처리 + Cardiac Amplification](./03_AB_Preprocessing_Amplification.md)