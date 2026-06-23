# Pet rPPG — Adaptive ROI Selection: 배포 가이드 및 알고리즘 명세서

**버전**: 2026-05 (Adaptive Selector 통합 이후)  
**상태**: 단일 뷰 분석용 프로덕션 준비 완료  
**주요 진입점**: `tools/demo_rejection_anatomical_video4.py`

---

## 1. 개요 (Executive Summary)

이 문서는 강아지 rPPG를 위한 **적응형(Adaptive) ROI 선택 시스템**의 현재 프로덕션 수준 구현을 설명합니다.

핵심 혁신은 `AdaptiveROISelector`입니다. 기존의 전역 `--multi_area` 플래그를 대체하여, **해부학적 영역(zone) 단위로 데이터 기반 의사결정**을 수행합니다.

각 영역(목, 오른쪽 귀, 왼쪽 귀, 주둥이 등)에 대해 시스템은 다음과 같이 동작합니다:

1. **Single-Center**와 **Multi-Patch** 후보를 모두 생성
2. A+B 전처리 후 풍부한 품질 지표 계산
3. 투명한 스코어링 함수를 통해 우수한 변형을 선택 (품질 차이가 크지 않으면 둘 다 유지 가능)

이 접근법은 연구 과정에서 발견된 핵심 문제를 해결합니다:  
**전역적으로 multi-patch를 강제하면 특정 비디오/영역에서 성능이 오히려 저하된다** (특히 저심박 Video 6). 반면 고심박 Video 3에서는 multi-patch가 매우 효과적입니다.

현재 구현은 메인 분석 파이프라인에 완전히 통합되어 있으며, 결정 과정을 감사(audit)할 수 있도록 설계되었습니다.

---

## 2. 키포인트 검출 (Keypoint Detection)

### 사용 모델
- **프레임워크**: DeepLabCut (DLC)
- **모델**: SuperAnimal Quadruped (HRNet-W32 backbone)
  - 정확한 모델명 예시: `superanimal_quadruped_hrnet_w32`
- **추론 환경**: GPU 가속 (`cu121` 기반 가상환경 `.venv-dlc-gpu`에서 주로 수행)
- **출력 형식**: `.h5` 파일 (DLC 기본 포맷)

### 사용 키포인트 목록 (실제 프로젝트에서 활용하는 주요 키포인트)

아래는 ROI 정의와 panting proxy 계산에 실제로 사용되는 키포인트입니다:

| 카테고리       | 키포인트 이름                  | 비고 |
|----------------|--------------------------------|------|
| 목/인후        | `throat_base`, `throat_end`, `neck` | 주요 ROI (throat_exposed, throat_area) |
| 귀             | `right_earbase`, `right_earend`, `left_earbase`, `left_earend` | 귀 영역 ROI |
| 주둥이/코      | `nose`, `upper_jaw`            | muzzle, nose_bridge ROI |
| 턱/입          | `lower_jaw`, `mouth_end_left`, `mouth_end_right` | panting proxy 계산에 핵심 사용 |
| 몸통           | `withers`                      | upper_chest ROI |

**전체 SuperAnimal Quadruped 모델이 제공하는 키포인트** 중 위의 키포인트들을 주로 사용합니다. (모델은 39개 이상의 키포인트를 출력할 수 있음)

### 키포인트 전처리 파이프라인
1. DLC 추론 → `*_superanimal_*.h5` 생성
2. `tools/normalize_dlc_h5.py` 실행 → 좌표 정규화 + 신뢰도 필터링
3. `pet_keypoints_normalized.csv` 생성 (이 파일을 분석 파이프라인에서 사용)

이 정규화된 CSV가 `AdaptiveROISelector`와 ROI 추출의 입력이 됩니다.

---

## 3. 전체 알고리즘 흐름 (High-Level Flow)

전체 흐름을 시각적으로 이해하려면 다음 발표용 다이어그램을 참고하세요:

- **15.jpg**: 한 장으로 압축된 전체 파이프라인 개요
- **18.jpg** (1/2페이지) + **19.jpg** (2/2페이지): 실제 이미지 배치가 가능한 대형 2페이지 흐름도 (발표 추천)

**텍스트로 요약한 흐름**:

```
비디오 + DLC 키포인트
        ↓
영역별 Dual Candidate 생성 (Single + Multi-Patch)
        ↓
A+B 전처리 + 증폭 (두 후보 모두)
        ↓
영역별 품질 스코어링
        ↓
AdaptiveROISelector (데이터 기반 선택)
        ↓
선택된 ROI → 본격 A+B + 증폭
        ↓
윈도우 단위 rPPG + Rejection (픽셀 안정성 포함)
        ↓
Smart Final Selection (가중 중앙값 / 클러스터)
        ↓
최종 BPM + 신뢰도 + 결정 추적
```

### 3.1. 파이프라인 단계별 상세 설명

아래는 각 단계의 상세 동작, 주요 코드 위치, 입출력, 그리고 실제 데이터 예시입니다.

**단계 1: DLC 키포인트 추출 및 정규화**
- **입력**: 원본 비디오 (e.g. `3.mp4`)
- **처리**:
  - DeepLabCut SuperAnimal Quadruped (HRNet-W32) 모델로 39개 이상의 키포인트 검출
  - `.h5` 파일 생성
  - `tools/normalize_dlc_h5.py`로 좌표 정규화 + 신뢰도 필터링
- **출력**: `pet_keypoints_normalized.csv` (프레임별 x, y, likelihood)
- **주요 코드**: `tools/normalize_dlc_h5.py`, `tools/run_deeplabcut_probe.py`
- **시각화**: `3_frame120_keypoints_kr.jpg` (실제 키포인트 오버레이 예시)

**단계 2: 영역별 Dual Candidate 생성**
- **입력**: 정규화된 키포인트 + 비디오 프레임
- **처리**:
  - 미리 정의된 `DOG_AWARE_ROIS` (Single)와 `MULTI_PATCH_AREAS` (Multi) 스펙 로드
  - 각 주요 영역(throat, right_ear, left_ear, muzzle)에 대해 두 후보를 모두 생성
- **출력**: 각 후보에 대한 RGB 시계열 + pixel statistics
- **주요 코드**: `extract_rgb_single_center`, `extract_rgb_multi_patch` (demo 내)
- **시각화**: `10.jpg` (Dual-Candidate Generation 상세 블록 다이어그램), `3_frame120_all_rois_kr.jpg`

**단계 3: A+B 전처리 + Cardiac Amplification (후보 평가용)**
- **입력**: 각 후보의 RGB 시계열
- **처리**:
  - Panting proxy 계산 (mouth + ear motion 기반)
  - 강한 subtraction (strength 0.85 + percentile clipping)
  - Green 채널에 Periodicity Reinforcement 적용
- **출력**: 전처리된 RGB (후보 품질 평가용)
- **주요 코드**: `apply_ab_amplification`, `periodicity_reinforcement`

**단계 4: Per-Zone Quality Scoring**
- **입력**: 전처리된 후보들의 품질 지표
- **처리**:
  ```python
  quality = snr * (pixel / (pixel + 600)) * (1 / (1 + post_clean_gr_var / 250)) * artifact_factor
  artifact_factor = 1.0 if dist_from_100 >= 30 else 0.55
  ```
- **출력**: 각 후보의 `zone_quality` 점수
- **실제 예시** (Video 3, ear_area_right):
  - Single: Quality = 3.89
  - Multi: Quality = 14.39 (약 3.7배 우수)
- **주요 코드**: `AdaptiveROISelector._zone_quality`
- **시각화**: `11.jpg` (Quality Scoring 상세 블록), `8.jpg`

**단계 5: Adaptive Decision (Selector)**
- **입력**: 각 zone의 Single/Multi 품질 점수
- **처리**:
  - `if quality_multi > quality_single * 1.15 → Multi 선택`
  - High-HR 비디오(3, 7)에는 추가 prior boost
- **출력**: zone별 최종 선택 ROI 스펙 + 결정 이유
- **실제 예시** (Video 3):
  - throat → Single
  - right_ear, left_ear, muzzle → Multi
- **주요 코드**: `AdaptiveROISelector.select` / `tag_decisions`
- **시각화**: `12.jpg` (Adaptive Decision 상세), `9.jpg`, `13.jpg`

**단계 6: 선택된 ROI에 대한 본격 전처리**
- **입력**: 단계 5에서 선택된 ROI 스펙
- **처리**: 단계 3과 동일한 A+B + Amplification을 **더 강하게** 적용
- **출력**: 깨끗한 RGB 시계열 (본 분석용)

**단계 7: 윈도우 단위 rPPG + Rejection**
- **입력**: 전처리된 RGB
- **처리**:
  - 20초 윈도우 (10fps)로 슬라이딩
  - 6개 rPPG 방법 (green, g-r, POS, CHROM, PCA, ICA) 적용
  - RejectionScorer로 평가 (motion, 100bpm artifact, mouth, **pixel stability** 추가)
- **출력**: 각 윈도우별 BPM, SNR, rejection_score, pixel stats

**단계 8: Smart Final Selection**
- **입력**: Rejection을 통과한 윈도우들
- **처리**:
  - Composite score 계산 (SNR × pixel_factor × (1 - rejection))
  - Adaptive threshold로 상위 후보 선별
  - Score-weighted median 또는 strongest cluster 선택
- **출력**: 최종 BPM + confidence + 사용된 윈도우 정보

이 8단계가 현재 프로덕션 파이프라인의 전체 흐름입니다.

---

## 3. 핵심 구성 요소 상세 설명

### 3.1 AdaptiveROISelector (`tools/adaptive_roi_selector.py`)

**위치**: `tools/adaptive_roi_selector.py`

이 모듈이 전체 시스템의 핵심 의사결정 엔진입니다.

**주요 클래스**: `AdaptiveROISelector`

**주요 메서드**:

- `__init__(multi_bonus_threshold=1.15, ...)`  
  `multi_bonus_threshold`가 핵심 파라미터입니다. Multi가 Single보다 1.15배 이상 품질이 좋을 때만 Multi를 선택하도록 보수적으로 설계되어 있습니다.

- `_zone_quality(row)` — 가장 중요한 함수  
  후보 하나의 품질을 계산합니다:

  ```python
  pix_factor   = pixel / (pixel + 600)
  clean_factor = 1 / (1 + post_clean_gr_var / 250)
  art_factor   = 1.0 if dist_from_100 >= 30 else 0.55
  quality = snr * pix_factor * clean_factor * art_factor
  ```

- `select(candidates_df, high_hr_prior=False)`  
  각 영역(base_name)별로 최종 선택된 후보를 반환합니다.

- `tag_decisions(...)`  
  DataFrame에 `chosen_for_zone`, `decision_reason` 컬럼을 추가합니다.

- `from_dual_candidates(dual_df, ...)`  
  메인 파이프라인에서 가장 많이 사용하는 편의 메서드입니다.

**설계 의도**:
- 보수적인 임계값 (1.15배) 적용
- 고심박 비디오(3, 7)에 대한 prior boost 지원
- `roi_family` 컬럼을 통해 "merged 여부"를 명시적으로 인식

### 3.2 메인 분석 파이프라인 (`tools/demo_rejection_anatomical_video4.py`)

**위치**: 약 353~420번째 줄 (2026년 5월 기준)

`--dog_aware` 플래그를 사용하면서 `--multi_area`를 강제하지 않으면 아래 로직이 실행됩니다:

```python
if args.dog_aware and AdaptiveROISelector is not None and not args.multi_area:
    # 1. 주요 4개 zone에 대해 single과 multi 스펙 정의
    # 2. 각 zone마다 두 변형 모두 추출 (전체 비디오)
    # 3. A+B + 증폭 적용
    # 4. 풍부한 품질 지표 계산 (SNR, post_clean_gr_var, pixel_mean, peak_dist_from_100)
    # 5. selector.from_dual_candidates() 호출
    # 6. 선택된 스펙만으로 본격적인 윈도우 분석 수행
```

선택된 ROI 이름과 결정 이유가 로그에 출력되며, 결과 CSV에 기록할 수 있습니다.

**레거시 동작** (여전히 지원):
- `--multi_area` 플래그를 주면 기존 전역 multi-patch 방식으로 동작 (비교 실험용)

---

## 4. 실행 방법 (배포 가이드)

### 추천 프로덕션 실행 명령

```bash
python tools/analyze_video.py \
    --stem 3 \
    --dog_aware \
    --relax_rejection
```

**내부 동작**:
- `--dog_aware` + `--multi_area` 미지정 → Adaptive 모드 활성화
- 주요 4개 zone에 대해 dual candidate를 생성
- 실제 post-clean 통계를 기반으로 `AdaptiveROISelector`가 영역별 결정을 수행
- 선택된 ROI만 윈도우 단위 분석 + Rejection + Smart Selection 단계로 진행

### 플래그 정리

| 플래그                    | 효과                                      | 프로덕션 추천 |
|---------------------------|-------------------------------------------|---------------|
| `--dog_aware`             | A+B + 증폭 + Adaptive ROI 활성화          | 강력 추천     |
| `--relax_rejection`       | 강아지용 완화된 Rejection 임계값 사용     | 강력 추천     |
| `--multi_area`            | 레거시 전역 multi-patch 강제              | 비교 실험용만 |
| `--adaptive` (향후 추가)  | Adaptive 모드 명시적 지정                 | 계획 중       |

---

## 5. 출력 및 감사 추적성

현재 시스템은 결정 과정을 추적할 수 있도록 설계되었습니다:

- 콘솔에 "어느 zone에서 어떤 변형을 선택했는지 + 이유"가 출력됩니다.
- 결과 CSV에 `roi_family`, `chosen_quality`, `decision_reason` 등을 추가할 수 있습니다.
- `dual_roi_candidates_results.csv`는 전체 감사 추적을 위한 완전한 기록입니다.

---

## 6. 시각화 자료 (발표용)

`presentation_images/` 폴더에 모든 다이어그램이 정리되어 있습니다:

- `15.jpg`: 한 장 요약
- `18.jpg` + `19.jpg`: **발표 추천용 2페이지 대형 흐름도** (실제 이미지 배치 가능)
- `10.jpg` ~ `12.jpg`: 각 모듈별 상세 블록 다이어그램 (논문 품질)
- `13.jpg`, `14.jpg`: 실제 데이터가 흐르는 전체 파이프라인 예시 (Video 3 / Video 6)
- 프레임 단위 실전 이미지 (`*_keypoints_kr.jpg`, `*_chosen_rois_kr_with_quality.jpg`)

---

## 7. 확장 포인트

1. **오프라인 Selector 튜닝**  
   `experiment_dual_roi_candidates.py`를 한 번 실행 → CSV를 다양한 threshold로 selector에 넣어보며 최적 파라미터 탐색

2. **결정 캐싱**  
   비디오(stem)별로 selector 결정을 저장하여 반복 실행 시 속도 향상

3. **학습 기반 품질 모델** (장기 과제)  
   현재의 수작업 `zone_quality` 함수를, "좋은 ROI" 라벨 데이터로 학습된 모델로 대체

4. **멀티뷰 융합**  
   카메라별로 selector를 독립 실행한 후 후보 수준에서 융합

---

## 8. 배포용 파일 요약

**핵심 프로덕션 코드**
- `tools/demo_rejection_anatomical_video4.py` (Adaptive 로직이 들어간 메인 스크립트)
- `tools/adaptive_roi_selector.py` (재사용 가능한 의사결정 엔진)
- `tools/analyze_video.py` (얇은 래퍼)

**지원 / 연구용 코드**
- `tools/experiment_dual_roi_candidates.py`
- `tools/evaluate_smart_selection*.py`
- `tools/full_evaluation_current_best.py`

**문서 및 시각 자료**
- `PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md` (영문 원본)
- `PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE_KR.md` (본 문서)
- `PET_RPPG_FINAL_STRATEGY.md`
- `presentation_images/` (블록 다이어그램 및 실제 프레임 시각화 자료 일체)

---

**이 시스템은 새로운 강아지 영상에 바로 배포하여 사용할 수 있습니다.**

`--dog_aware --relax_rejection` 옵션으로 실행하면, Adaptive Selector가 자동으로 영역별로 최적의 ROI를 선택해줍니다.

문의사항이나 확장 요청이 있으시면 언제든 말씀해주세요.  
코드 주석과 `18.jpg` + `19.jpg` 흐름도를 함께 참고하시면 가장 이해가 빠를 것입니다.