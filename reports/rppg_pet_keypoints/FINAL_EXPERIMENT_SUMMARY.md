# Pet rPPG 프로젝트 - 전체 실험 종합 보고서 (2026-05 기준)

## 1. 프로젝트 목표 및 핵심 문제

### 목표
- 강아지 영상에서 rPPG를 이용해 심박수(BPM)를 정확하게 추정
- 기존 Face-box 기반 방식 대비 개선

### 핵심 문제 (초기 진단)
- **Video 3 (210 bpm), Video 7 (189.5 bpm)** 등 고심박 영상에서 성능이 매우 나쁨
- Raw RGB trace에서 **100bpm 대역 artifact가 압도적으로 강함**
- 원인: 털(fur)로 인한 cardiac signal 감쇠 + panting(헐떡임) + motion artifact
- 저주파 성분이 너무 강해서 고주파 cardiac peak가 spectrum에서 밀려남

---

## 2. 실험 단계별 정리

### Phase 1: Anatomical ROI + 기본 Rejection (초기 개선)

**주요 작업**
- DLC SuperAnimal로 anatomical keypoints 추출 (neck, ear_base, nose_bridge 등)
- Face-box 대신 anatomical ROI 사용
- Keypoint 기반 motion + 100bpm artifact + mouth proxy를 이용한 RejectionScorer 도입

**결과**
- Video 6 (저 HR, motion 적음)에서는 이미 좋은 성능 (Abs Err ~2.6~4.3)
- Video 1에서도 face-box 대비 개선
- Video 3, 7에서는 여전히 Raw best BPM이 85~105 bpm대에 갇힘

**한계 인식**
- Rejection은 "나쁜 window를 버리는" 역할만 할 뿐, 신호 자체를 만들어내지 못함

---

### Phase 2: A + B 전략 (가장 큰 방향 전환)

**A: Panting Artifact Modeling & Subtraction**
- Mouth opening + ear movement로 panting proxy 신호 생성
- Raw RGB trace에서 proxy를 이용한 regression subtraction 수행
- 후반에는 strength 0.85 + percentile clipping으로 강화

**B: Dog Thin-Fur ROI Redesign**
- 기존 ROI(ear_base, nose_bridge)에서 벗어나 개 특성에 맞는 얇은 털 부위 탐색
- 신규 후보: `throat_exposed`, `muzzle_skin`, `inner_ear` 등
- SuperAnimal keypoints 중 실제 피부가 잘 드러나는 영역 우선 선정

**주요 산출물**
- `prototype_dog_aware_traces.py`
- `demo_rejection_anatomical_video4.py`에 `--dog_aware` 플래그 통합
- `analyze_video.py`에도 `--dog_aware` 지원 추가

**결과 (Raw trace 품질)**
- Video 3에서 `throat_exposed`가 처음으로 상위권 진입
- Panting subtraction으로 G-R variance가 크게 감소 (예: 136.9 → 14.5)
- `muzzle_skin`, `throat_exposed`가 Per-ROI에서 좋은 성적

**한계**
- Raw BPM은 개선되었으나, 최종 rejection + BPM 추정 단계에서는 여전히 고HR 회복 어려움
- Preprocessing를 강하게 할수록 rejection이 0%까지 과하게 걸리는 부작용 발생

---

### Phase 3: Rejection Retuning + Preprocessing 강화

**시도한 것**
- `--relax_rejection` 플래그 추가 (dog_aware 모드용으로 threshold 완화)
- Stronger panting subtraction (0.85 + clipping) 적용

**결과**
- Raw trace는 더 깨끗해졌으나, rejection은 여전히 대부분의 window를 버리는 현상 지속
- "preprocessing가 너무 세서 좋은 window 자체가 줄어든" 상황

**인사이트**
- Rejection 로직 자체를 dog_aware 전용으로 완전히 재설계해야 함 (단순 threshold 조정으로는 부족)

---

### Phase 4: Spatial + Temporal Differencing 실험

**목적**
- 주파수 도메인에 과도하게 의존하지 않고, raw signal 단계에서 fur texture와 저주파를 억제

**주요 실험**
- `experiment_fur_differencing.py`: Temporal 1st/2nd difference
- `experiment_fur_spatial_differencing.py`: Laplacian / DoG on actual image patches (video 3, 7)

**결과**
- 저주파 texture와 느린 illumination 변화는 어느 정도 억제됨
- 그러나 **100bpm 대역의 강한 주기적 mechanical artifact(panting)**는 여전히 dominant
- Spatial suppression만으로는 periodic motion artifact를 제거하기 어려움

---

### Phase 5: Time-Domain Amplification (주파수 의존 최소화)

**사용자 주도 방향 전환**
- "강한 high-pass는 저주파 cardiac signal까지 잘라버릴 위험이 있다"
- "주파수 도메인으로만 해결하려고 하지 말자"는 지적

**주요 실험**
- `time_domain_experiments.py`
  - Strong linear proxy subtraction (여전히 최고)
  - Polynomial, Robust Huber, Savitzky-Golay, Median, Exponential smoothing, LMS, Keypoint motion compensation
- `time_domain_cardiac_amplification.py`
  - Strong cleaning 후
  - PCA로 가장 periodic component 추출
  - Time-domain periodicity reinforcement (주기성 직접 강화)

**주요 결과 (BPM 관점)**
- Video 7: Periodicity reinforcement 후 ICA가 **228.5 bpm (SNR 10.11)**까지 도달 (target 189.5)
- Video 3: Chrom이 208.6 bpm까지 튀었으나 SNR 0.00 (불안정)
- PCA나 reinforcement를 통해 **고주파 후보가 표면에 올라오는 현상** 관찰됨
- 그러나 SNR이 낮거나 불안정한 경우가 많아 신뢰도 부족

---

### Phase 6: Batch Amplification Across All Videos

**`experiment_amplification_all_videos.py`**
- 7개 영상 모두에 대해 최신 rejection 결과의 best window를 대상으로 amplification stack 적용
- 3단계(Baseline → PCA → Reinforcement)별로 6개 method의 best BPM/SNR 기록

**주요 발견**
- Stage 3 (reinforcement)에서 여러 영상(3,4,5,7,8)에서 BPM 상향 + SNR 개선 현상
- Video 5: SNR이 89.1까지 폭발적으로 상승
- Video 7: 171.1 bpm (SNR 34.79) 도달

---

## 3. 전체적인 성과와 한계

### 잘 된 점 (성과)

- **Raw trace 품질 개선**: A+B로 G-R variance가 크게 감소
- **새로운 ROI 발굴**: `throat_exposed`, `muzzle_skin`이 실제로 좋은 성적을 냄
- **Time-domain amplification 방향성 검증**: 주기성 강화가 고주파 cardiac을 표면으로 끌어올리는 데 효과 있음 확인
- **쉬운 영상에서는 실용 수준 도달**: Video 6 (error 2.7~5.5), Video 1 (error 6.8)에서 좋은 결과

### 명확한 한계

1. **100bpm Artifact의 지배력**
   - High-HR 영상(3, 7)에서 artifact가 cardiac signal보다 광학적으로 훨씬 강함
   - Frequency overlap이 적을수록 (true HR이 100bpm에서 멀수록) 문제가 더 심각

2. **Rejection과의 호환성 문제**
   - Preprocessing를 강하게 할수록 rejection이 과도하게 많은 window를 버림
   - Rejection feature와 threshold를 preprocessing 변화에 맞춰 재설계해야 함

3. **Signal Quality의 근본 한계**
   - 털 때문에 cardiac modulation 자체가 너무 약함
   - Artifact 제거만으로는 한계가 있음 → **약한 신호를 증폭**하는 방향이 더 필요

4. **Video 6 성공의 착시**
   - Target HR이 artifact band와 가까워서 "운 좋게" 잘 나온 측면이 큼
   - High-HR + heavy artifact 상황에서의 진짜 성능은 아직 미흡

---

## 4. 지금까지의 Best Practical Configuration

**현재까지 가장 나은 조합 (2026-05 기준)**

- ROI: Focused thin-fur set (`throat_exposed`, `right/left_ear_base`, `muzzle_skin`, `nose_bridge`)
- Preprocessing: Stronger panting subtraction (0.85 + clipping)
- Rejection: `--relax_rejection` (dog_aware 전용 완화)
- 추가 실험: Time-domain periodicity reinforcement (일부 영상에서 효과)

이 설정으로도 **Video 3, 7**에서는 아직 target HR을 안정적으로 회복하지 못하고 있다.

---

## 5. 추천 다음 방향 (우선순위 순)

1. **Dog_aware 전용 Rejection 완전 재설계**
   - Threshold 조정이 아니라, feature 자체(rejection_scorer)를 새로운 preprocessing 특성에 맞춰 재학습/재설계

2. **더 정교한 Time-domain Amplification**
   - Multi-ROI temporal ensemble
   - Patch-level keypoint motion stabilization (실제 이미지 warp)
   - Adaptive template matching 또는 state-space 모델 (Kalman 등)

3. **Panting Reference를 이용한 진짜 ANC (Adaptive Noise Cancellation)**
   - 주파수가 겹쳐도 동작하는 reference-based subtraction

4. **Multi-view 적극 활용**
   - Front가 panting motion을 가장 많이 잡을 가능성이 높음. Side view가 더 나을 수 있음.

5. **Signal Acquisition 단계 개선**
   - 더 작은, 더 안정적인 patch
   - Segmentation mask를 soft weighting으로 더 적극 활용

---

## 6. 결론

- A+B 방향과 time-domain amplification은 **부분적으로 성공**했다.
- Raw trace 품질은 개선됐고, 새로운 ROI 후보가 검증됐다.
- 그러나 **고HR + 강한 panting artifact** 환경에서는 아직 근본적인 한계를 넘지 못했다.
- 이제는 "artifact를 더 잘 제거"하는 것보다, **"약한 cardiac signal을 어떻게 더 잘 증폭하고 안정화할지"**에 집중해야 하는 단계다.

---

**작성일**: 2026-05-26
**주요 산출물 위치**:
- `reports/rppg_pet_keypoints/anatomical_vs_facebox_comparison.md` (최신 테이블)
- `tools/` 하위의 다양한 experiment/prototype 스크립트
- `reports/rppg_pet_keypoints/amplification_all_videos/`
- `reports/rppg_pet_keypoints/time_domain_amplification_plots/`