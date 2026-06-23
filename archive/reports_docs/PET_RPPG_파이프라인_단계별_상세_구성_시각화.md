# 강아지 rPPG — 파이프라인 단계별 상세 구성 및 결과 시각화

**최신 추천 전체 플로우 차트**:
- `reports/rppg_pet_keypoints/PET_RPPG_Horizontal_Flowchart.png` (가로형, 한영 병기, 각 모듈 역할 설명 포함 — 발표용으로 가장 세련됨)

**문서 목적**: 알고리즘의 각 단계를 상세히 설명하고, 해당 단계에서 실제로 나오는 결과(시각화)를 첨부하여 전체 흐름을 한눈에 이해할 수 있게 정리

**대상**: 개발자, 연구자, 발표자, 협업자

**참고 이미지 출처**: `presentation_images/` 폴더 (한글 라벨 포함된 실제 데이터 시각화 다수 포함)

---

## 전체 파이프라인 개요 (한 장 요약)

**추천 참고 이미지**:
- `presentation_images/18.jpg` (2페이지 블록 다이어그램 1페이지)
- `presentation_images/19.jpg` (2페이지 블록 다이어그램 2페이지)
- `presentation_images/15.jpg` (컴팩트 한 장 요약)

아래에서 8단계로 나누어 각 단계의 **입력 → 처리 → 출력 → 시각화 결과**를 상세히 설명합니다.

---

## 단계 1: 비디오 로드 + DLC 키포인트 검출

**목적**: 강아지의 정확한 신체 부위(특히 얇은 털 영역)를 자동으로 찾아내는 것.

**주요 처리**:
- 입력 비디오 로드
- DLC SuperAnimal Quadruped 모델로 39개 이상 keypoints 검출 (throat_base, throat_end, earbase, earend, nose, upper_jaw, lower_jaw, mouth_end_* 등)
- GPU probe 추천 (속도)

**시각화 결과 예시** (Video 3, frame 120):

![키포인트 검출 결과](presentation_images/3_frame120_keypoints_kr.jpg)

**설명**: 빨간 점들이 DLC가 검출한 주요 키포인트. 특히 throat, ear, muzzle 영역이 명확하게 잡혀 있는 것을 확인할 수 있습니다.

**효과**: 얼굴 전체 박스 대신 "얇은 털 + 피부가 드러난 영역"만 정확히 선택할 수 있는 기반이 마련됨.

---

## 단계 2: Dual Candidate 생성 (Single vs Multi-Patch)

**목적**: 각 해부학적 zone(목, 귀, 주둥이)마다 두 가지 후보를 만들어 놓고 나중에 선택할 수 있게 함.

**주요 처리**:
- Single-Center: 기존 방식 (키포인트 중심 + 반경)
- Multi-Patch: zone당 2~3개의 작은 안정적 패치 샘플링 후 RGB 평균

**정의된 영역** (`MULTI_PATCH_AREAS`):
- throat_area, ear_area_right/left, muzzle_area

**시각화 결과 예시** (모든 후보 ROI 표시):

![모든 후보 ROI](presentation_images/3_frame120_all_rois_kr.jpg)

**효과**: 픽셀 수를 늘리면서도 국소적으로 안정적인 피부 영역을 유지할 수 있음 (사용자 지적 “픽셀 수가 적을수록 노이즈에 취약” 직접 해결).

---

## 단계 3: A+B 전처리 (헐떡임 제거 + 심박 증폭)

**목적**: raw trace에서 헐떡임 아티팩트를 제거하고 심박 신호를 강화.

**주요 처리**:
- A: 강력한 헐떡임 proxy subtraction (multi-keypoint 기반, strength 0.85 + clipping)
- B: 시간영역 주기성 강화 (periodicity reinforcement)

**시각화**: 이 단계는 파형(trace) 수준에서 효과가 나타나므로 별도 프레임 이미지는 적지만, 후속 단계에서 SNR이 크게 상승하는 것으로 확인됨.

**효과** (이전 실험 결과):
- Video 3, 7에서 170~210+ bpm 후보가 처음으로 안정적으로 검출되기 시작.

---

## 단계 4: Adaptive ROI Selector (핵심 의사결정 단계)

**목적**: 강제로 Multi-patch를 적용하지 않고, 각 zone마다 데이터 기반으로 최적 후보를 선택.

**주요 처리**:
- 각 zone별로 Single과 Multi 후보의 품질 점수 계산
- Quality = SNR × Pixel Factor × Cleanliness × Artifact Distance
- Multi가 meaningfully better할 때만 선택 (threshold 1.15)

**시각화 결과 예시** (선택된 ROI + 품질 점수 표시):

![선택된 ROI + 품질 점수](presentation_images/3_frame120_chosen_rois_kr_with_quality.jpg)

**설명**: 각 ROI 옆에 품질 점수(Q)가 표시되어 있으며, 어떤 후보가 선택되었는지 시각적으로 확인 가능.

**Video 6 vs Video 3 비교**:
- Video 6 (저HR): 많은 zone에서 Single이 선택됨
- Video 3 (고HR): ear, muzzle 영역에서 Multi가 선택되는 경우가 많음

이 단계가 **Adaptive**의 진짜 힘입니다.

---

## ROI 픽셀 수 상세 분석 (Single vs Multi-Patch 실제 비교)

**중요 포인트**:
- 현재 ROI는 **원(Circle)이 아니라 정사각형(Square)**입니다. (radius의 2배 × 2배 크기)
- 픽셀 수 = 해당 정사각형 영역의 실제 픽셀 개수 (프레임 경계에 따라 클리핑됨)
- Multi-Patch는 여러 작은 정사각형을 합산 → Single보다 픽셀 수가 많음

### Video 7 예시 (frame 90)

![Video 7 ROI Pixel 상세](reports/rppg_pet_keypoints/roi_pixel_visualization/video7_frame90_roi_pixel_detail.jpg)

**관찰**:
- `throat_area` (Multi): 약 2,896 픽셀 (2개 패치)
- `ear_area_right` (Multi): 약 1,476 픽셀
- `muzzle_skin` (Single, r=13): 약 676 픽셀 (가장 작음)
- Multi-Patch가 Single 대비 30~50% 이상 많은 픽셀을 확보하는 경우가 일반적

### Video 3 예시 (frame 120)

![Video 3 ROI Pixel 상세](reports/rppg_pet_keypoints/roi_pixel_visualization/video3_frame120_roi_pixel_detail.jpg)

### Video 6 예시 (frame 100)

![Video 6 ROI Pixel 상세](reports/rppg_pet_keypoints/roi_pixel_visualization/video6_frame100_roi_pixel_detail.jpg)

**결론**:
- Multi-Patch의 주요 이점은 **픽셀 수 증가**를 통한 노이즈 저항력 향상입니다.
- 하지만 여전히 **정사각형 전체**를 카운트하므로, 실제 유효 피부 픽셀은 이보다 적을 수 있습니다 (향후 개선 포인트).

---

## 전체 성능 진화 비교표 (전체 + 개별 비디오) — 추천 방식

발표에서 가장 효과적인 방법은 **두 가지 관점**을 함께 보여주는 것입니다.

### 1. 전체 데이터 관점 (7비디오 전체 Mean Error)
- **전체 상세 표**: `reports/PET_RPPG_Performance_Evolution_Full_Dataset.md`
- 추천 슬라이드 제목: "기술을 추가할 때마다 전체 데이터(7비디오)에서 성능은 어떻게 변했는가?"

### 2. 개별 비디오 관점 (주요 케이스 상세)
- Video 7, Video 3, Video 6 중심으로 각 단계별 변화 상세 분석
- **전체 상세 표**: `reports/PET_RPPG_Performance_Evolution_Per_Video_and_Overall.md`
- 추천 슬라이드 제목: "특히 중요한 비디오에서는 어떻게 달랐는가?"

**추천 슬라이드 구성 (2장)**:
- 슬라이드 A: 전체 7비디오 Mean Error 진화 표
- 슬라이드 B: 중요한 개별 비디오(3,6,7)의 상세 변화

이렇게 하면 "전체적인 트렌드"와 "구체적인 증거"를 동시에 전달할 수 있습니다.
| + Dog-specific v2 | 70.3 | 데이터 불균형으로 전체 평균 악화 (반례) |

---

## 단계 5: 최종 Trace 추출 및 추가 전처리

**목적**: 선택된 ROI로 최종 RGB trace를 만들고 A+B를 한 번 더 적용.

**처리 내용**:
- 선택된 ROI로 RGB 시계열 추출
- 전체 A+B + Amplification 재적용
- pixel_mean, pixel_min 로깅 (나중 rejection에서 사용)

**시각화**: 이 단계 결과는 주로 trace 파형으로 나타나며, 후속 rPPG 단계에서 사용됨.

---

## 단계 6: 다중 rPPG 방법 적용 (dog_learned 포함)

**목적**: 하나의 trace에 대해 여러 신호 추출 방법을 병렬로 적용하여 후보를 최대한 확보.

**적용 방법**:
- green, g_minus_r, chrom, pos, pca, ica
- **dog_learned** (학습된 [0.286, -0.7886, 0.5443] 또는 v2)

**각 방법별로**:
- Bandpass 필터링
- BPM 추정 + SNR 계산
- 추가 특징 (100bpm artifact power, periodicity 등)

**효과**:
- dog_learned가 고HR 비디오에서 때때로 기존 방법보다 우수한 peak을 제공 (Video 7에서 21.3 bpm error 기록 사례 있음).

---

## 단계 7: Rejection + 품질 기반 필터링

**목적**: 신뢰할 수 없는 윈도우를 제거.

**주요 필터**:
- Motion score
- 100bpm artifact power
- Mouth movement
- Pixel stability (새로 추가된 중요 요소)
- Post-clean variance

**시각화**: 직접적인 이미지보다는 rejection 후 살아남은 window의 품질 분포로 확인.

**효과**:
- A+B + Multi-patch 환경에 맞춰 threshold를 relaxed하게 조정 (기존 aggressive rejection은 좋은 고HR window까지 많이 죽임).

---

## 단계 8: Smart Final Selection

**목적**: 살아남은 후보들 중에서 최종 BPM을 가장 신뢰도 높게 결정.

**사용 방법**:
- Score-weighted median
- 또는 클러스터링 기반 선택
- High-HR band 우선 고려 로직 (선택적)

**최종 출력**:
- BPM
- Confidence
- 사용된 최고 품질 window
- 전체 의사결정 로그 (디버깅/설명용)

---

## 단계별 핵심 시각화 모음 (한눈에 보기)

| 단계 | 주요 시각화 이미지 | 설명 |
|------|---------------------|------|
| 1. 키포인트 | `3_frame120_keypoints_kr.jpg`<br>`6_frame100_keypoints_kr.jpg`<br>`7_frame90_keypoints_kr.jpg` | DLC 검출 결과 |
| 2~3. 전체 후보 ROI | `*_all_rois_kr.jpg` 시리즈 | Single + Multi 모두 표시 |
| 4. Adaptive 선택 결과 | `*_chosen_rois_kr_with_quality.jpg` 시리즈 | Q 점수와 함께 어떤 ROI가 선택되었는지 표시 |
| 전체 흐름 | `18.jpg`, `19.jpg` | 2페이지 대형 블록 다이어그램 |
| 한 장 요약 | `15.jpg` | 전체 파이프라인 압축 버전 |

---

## 전체 문서 요약 (한 장)

**강아지 rPPG 파이프라인의 핵심 철학**:
1. **업스트림 품질 최대화** (Anatomical + Multi-patch + A+B)
2. **데이터 기반 적응형 선택** (AdaptiveROISelector — 절대 강제하지 않음)
3. **강아지 특성 반영** (dog_learned + prior-guided peak selection)
4. **투명한 의사결정** (모든 단계에서 품질 점수와 선택 근거를 로깅)

**현재 가장 강력한 조합**:
- Anatomical Multi-patch + A+B
- Adaptive per-zone selection
- dog_learned (v1 weights 추천)
- estimate_bpm_with_prior (고심박 비디오)

**공유용 핵심 이미지**:
- `presentation_images/18.jpg` + `19.jpg` (전체 흐름)
- Video 3/6/7의 keypoints → all ROIs → chosen with quality 시리즈

---

**이 문서는 실제 코드(`demo_rejection_anatomical_video4.py`, `adaptive_roi_selector.py` 등)와 1:1로 대응되도록 작성되었습니다.**

필요하시면 이 문서를 기반으로:
- PDF export용 버전
- 특정 단계만 더 깊게 확장한 버전
- 발표 슬라이드용 요약 이미지 모음

추가로 만들어 드리겠습니다.